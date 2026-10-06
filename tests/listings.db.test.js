/**
 * tests/listings.db.test.js
 * Listings routes exercised against a mocked MySQL layer.
 */

process.env.NODE_ENV = "test";

jest.mock("../database/db");

const request = require("supertest");
const db = require("../database/db");
const app = require("../server");

const LISTING_ROW = {
  id: 12,
  title_en: "3BR House, Tabor",
  title_am: "ቤት ታቦር",
  category: "property",
  price: "1250000.00",
  images: '["/uploads/a.webp","/uploads/b.webp"]',
  is_active: 1,
};

function mockDb({ listing = LISTING_ROW } = {}) {
  db.execute.mockImplementation((sql) => {
    if (sql.startsWith("UPDATE")) {
      return Promise.resolve([{ affectedRows: 1 }]);
    }
    if (sql.includes("WHERE l.id = ?")) {
      return Promise.resolve([listing ? [listing] : [], []]);
    }
    // List query
    return Promise.resolve([[LISTING_ROW], []]);
  });
}

describe("GET /api/listings", () => {
  it("returns the row set from the database", async () => {
    mockDb();

    const res = await request(app).get("/api/listings?category=property");

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data).toHaveLength(1);
    expect(res.body.data[0].title_en).toBe("3BR House, Tabor");
  });

  it("clamps oversized limits to 100", async () => {
    mockDb();

    const res = await request(app).get("/api/listings?limit=99999");

    expect(res.status).toBe(200);
    // Match the paginated list query specifically. Matching on "not an UPDATE
    // and not a by-id SELECT" also caught loadTaxonomy()'s parameterless
    // categories SELECT, so [1] was undefined and this threw a TypeError
    // instead of reporting a real limit-clamp regression.
    const listCall = db.execute.mock.calls.find(
      ([sql, params]) => Array.isArray(params) && sql.includes("LIMIT ? OFFSET ?")
    );
    expect(listCall).toBeDefined();
    expect(listCall[1].slice(-2)).toEqual([100, 0]);
  });

  it("never leaks raw driver errors to the client", async () => {
    db.execute.mockRejectedValue(new Error("ER_BAD_FIELD_ERROR: secret column"));

    const res = await request(app).get("/api/listings");

    expect(res.status).toBe(500);
    expect(JSON.stringify(res.body)).not.toContain("ER_BAD_FIELD_ERROR");
    expect(JSON.stringify(res.body)).not.toContain("secret column");
  });
});

describe("GET /api/listings/:id", () => {
  it("parses the images JSON column into an array", async () => {
    mockDb();

    const res = await request(app).get("/api/listings/12");

    expect(res.status).toBe(200);
    expect(res.body.data.images).toEqual(["/uploads/a.webp", "/uploads/b.webp"]);
  });

  it("degrades corrupt images JSON to an empty array instead of a 500", async () => {
    mockDb({ listing: { ...LISTING_ROW, images: "{corrupt json" } });

    const res = await request(app).get("/api/listings/12");

    expect(res.status).toBe(200);
    expect(res.body.data.images).toEqual([]);
  });

  it("normalizes null images", async () => {
    mockDb({ listing: { ...LISTING_ROW, images: null } });

    const res = await request(app).get("/api/listings/12");

    expect(res.status).toBe(200);
    expect(res.body.data.images).toEqual([]);
  });

  it("returns 404 for unknown ids", async () => {
    mockDb({ listing: null });

    const res = await request(app).get("/api/listings/99999");

    expect(res.status).toBe(404);
    expect(res.body.message).toMatch(/not found/i);
  });

  it("fires the view-count increment without blocking the response", async () => {
    mockDb();

    const res = await request(app).get("/api/listings/12");
    expect(res.status).toBe(200);

    // Flush microtasks so the fire-and-forget UPDATE resolves.
    await new Promise((resolve) => setImmediate(resolve));

    const updateCall = db.execute.mock.calls.find(([sql]) =>
      sql.startsWith("UPDATE")
    );
    expect(updateCall).toBeDefined();
    expect(updateCall[0]).toContain("view_count + 1");
    expect(updateCall[1]).toEqual(["12"]);
  });
});
