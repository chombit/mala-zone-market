/**
 * tests/adminAuth.test.js
 * Admin JWT issuance/verification round-trip + forgery rejection.
 */

process.env.NODE_ENV = "test";

const jwt = require("jsonwebtoken");
const {
  issueAdminToken,
  verifyAdminToken,
} = require("../middleware/adminAuth");

const ADMIN_JWT_SECRET =
  process.env.ADMIN_JWT_SECRET || "malazone_admin_secret_change_in_production";

describe("admin token lifecycle", () => {
  const admin = {
    id: 42,
    username: "superadmin",
    full_name: "System Super Admin",
    role: "super_admin",
    is_active: 1,
  };

  it("round-trips a legitimately issued admin token", () => {
    const token = issueAdminToken(admin);
    const payload = verifyAdminToken(token);

    expect(payload).not.toBeNull();
    expect(payload.sub).toBe(42);
    expect(payload.username).toBe("superadmin");
    expect(payload.role).toBe("super_admin");
    expect(payload.type).toBe("admin");
  });

  it("rejects tokens signed with the wrong secret (forgery)", () => {
    const forged = jwt.sign({ sub: 42, type: "admin" }, "attacker-secret", {
      expiresIn: "1h",
    });

    expect(verifyAdminToken(forged)).toBeNull();
  });

  it("rejects non-admin token types even when correctly signed (role confusion)", () => {
    const userToken = jwt.sign({ sub: 42, type: "user" }, ADMIN_JWT_SECRET, {
      expiresIn: "1h",
    });

    expect(verifyAdminToken(userToken)).toBeNull();
  });

  it("rejects garbage input", () => {
    expect(verifyAdminToken(null)).toBeNull();
    expect(verifyAdminToken(undefined)).toBeNull();
    expect(verifyAdminToken("")).toBeNull();
    expect(verifyAdminToken("not.a.jwt")).toBeNull();
    expect(verifyAdminToken(12345)).toBeNull();
  });
});
