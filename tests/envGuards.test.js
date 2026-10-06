/**
 * tests/envGuards.test.js
 * Production secret validation — the app must refuse to boot insecurely.
 */

process.env.NODE_ENV = "test";

const { requireProductionSecrets } = require("../utils/envGuards");

describe("requireProductionSecrets", () => {
  const ORIGINAL_ENV = { ...process.env };

  afterEach(() => {
    process.env.JWT_SECRET = ORIGINAL_ENV.JWT_SECRET;
    process.env.ADMIN_JWT_SECRET = ORIGINAL_ENV.ADMIN_JWT_SECRET;
    process.env.SESSION_SECRET = ORIGINAL_ENV.SESSION_SECRET;
  });

  function withEnv(name, value) {
    if (value === undefined) {
      delete process.env[name];
    } else {
      process.env[name] = value;
    }
  }

  it("accepts strong, non-default secrets silently", () => {
    withEnv("JWT_SECRET", "a".repeat(48));
    withEnv("ADMIN_JWT_SECRET", "b".repeat(48));
    withEnv("SESSION_SECRET", "c".repeat(48));

    expect(() =>
      requireProductionSecrets(["JWT_SECRET", "ADMIN_JWT_SECRET", "SESSION_SECRET"])
    ).not.toThrow();
  });

  it("rejects when a secret is missing entirely", () => {
    withEnv("JWT_SECRET", undefined);
    withEnv("ADMIN_JWT_SECRET", "b".repeat(48));
    withEnv("SESSION_SECRET", "c".repeat(48));

    expect(() => requireProductionSecrets(["JWT_SECRET"])).toThrow(/JWT_SECRET is not set/);
  });

  it("rejects known insecure default values", () => {
    withEnv("JWT_SECRET", "malazone_secret_key_change_in_production");

    expect(() => requireProductionSecrets(["JWT_SECRET"])).toThrow(
      /insecure default/
    );
  });

  it("rejects secrets shorter than 32 characters", () => {
    withEnv("JWT_SECRET", "too-short");

    expect(() => requireProductionSecrets(["JWT_SECRET"])).toThrow(
      /at least 32 characters/
    );
  });

  it("reports every offending secret at once, not just the first", () => {
    withEnv("JWT_SECRET", undefined);
    withEnv("ADMIN_JWT_SECRET", "short");

    expect(() =>
      requireProductionSecrets(["JWT_SECRET", "ADMIN_JWT_SECRET", "SESSION_SECRET"])
    ).toThrow(/JWT_SECRET is not set[\s\S]*ADMIN_JWT_SECRET must be at least 32/);
  });
});
