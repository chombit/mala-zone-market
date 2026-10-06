/**
 * tests/app.security.test.js
 * HTTP surface security contract — no database required.
 * Every case here exercises code paths that short-circuit BEFORE any query.
 */

process.env.NODE_ENV = "test";

const request = require("supertest");
const app = require("../server");

// Release sockets/timers held by the HTTP server & Socket.io between suites.
afterAll(() => {
  try {
    app.io && typeof app.io.close === "function" && app.io.close();
    app.server && typeof app.server.close === "function" && app.server.close();
  } catch {
    // best effort teardown
  }
});

describe("API health & discovery", () => {
  it("GET /api/health reports service status", async () => {
    const res = await request(app).get("/api/health");

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.service).toBe("Malazone API");
    expect(typeof res.body.uptime).toBe("number");
  });

  it("GET / exposes the endpoint map", async () => {
    const res = await request(app).get("/");

    expect(res.status).toBe(200);
    expect(res.body.endpoints.listings).toBe("/api/listings");
  });
});

describe("listing creation is locked down", () => {
  it("POST /api/listings without auth returns 401 (no anonymous listings)", async () => {
    const res = await request(app)
      .post("/api/listings")
      .field("title_en", "Hacked Listing")
      .field("title_am", "የተነጠቀ ማስታወቂያ")
      .field("category", "property")
      .field("price", "100")
      .field("is_verified", "true") // must never be trusted anyway
      .field("is_premium", "true");

    expect(res.status).toBe(401);
    expect(res.body.success).toBe(false);
  });

  it("GET /api/listings/mine requires authentication (route ordering fixed)", async () => {
    const res = await request(app).get("/api/listings/mine");

    // Before the fix this matched "/:id" and returned a misleading 404.
    expect(res.status).toBe(401);
    expect(res.body.message).toMatch(/auth/i);
  });

  it("GET /api/listings/:id rejects non-numeric ids with 400", async () => {
    const res = await request(app).get("/api/listings/not-a-number");

    expect(res.status).toBe(400);
    expect(res.body.message).toMatch(/invalid listing id/i);
  });
});

describe("admin surface hardening", () => {
  it("POST /api/admin/login without credentials returns 400", async () => {
    const res = await request(app)
      .post("/api/admin/login")
      .send({});

    expect(res.status).toBe(400);
  });

  it("GET /api/admin/me without token returns 401", async () => {
    const res = await request(app).get("/api/admin/me");

    expect(res.status).toBe(401);
    expect(res.body.success).toBe(false);
  });
});

describe("routing & CORS", () => {
  it("unknown API routes return structured 404 JSON", async () => {
    const res = await request(app).get("/api/definitely-not-a-route");

    expect(res.status).toBe(404);
    expect(res.body.success).toBe(false);
    expect(res.body.message).toContain("/api/definitely-not-a-route");
  });

  it("rejects disallowed origins with 403", async () => {
    const res = await request(app)
      .get("/api/health")
      .set("Origin", "http://evil.example.com");

    expect(res.status).toBe(403);
    expect(res.body.message).toMatch(/CORS policy/i);
  });

  it("allows whitelisted origins", async () => {
    const res = await request(app)
      .get("/api/health")
      .set("Origin", "http://localhost:5173");

    expect(res.status).toBe(200);
  });
});
