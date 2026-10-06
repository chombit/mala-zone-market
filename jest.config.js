/**
 * jest.config.js
 * Malazone.com — Backend API test configuration
 * © 2026 Malazone Technologies PLC
 */
module.exports = {
  testEnvironment: "node",
  testMatch: ["<rootDir>/tests/**/*.test.js"],
  testPathIgnorePatterns: ["/node_modules/", "/dist/", "/public/"],
  clearMocks: true,
  // uuid@14 ships ESM-only; Jest's CJS runtime can't parse it, so we map to
  // a local CommonJS shim backed by crypto.randomUUID.
  moduleNameMapper: {
    "^uuid$": "<rootDir>/tests/shims/uuid.cjs",
  },
  // The MySQL pool is exercised through mocks; integration tests that need a
  // live database live behind the `npm run test:integration` gate.
};
