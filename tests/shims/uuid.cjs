/**
 * tests/shims/uuid.cjs
 * Test-only CommonJS shim for uuid@14 (ESM-only).
 * Maps `require("uuid")` to crypto.randomUUID under Jest.
 */
const crypto = require("crypto");

const v4 = () => crypto.randomUUID();

module.exports = {
  v4,
  v1: v4,
  NIL: "00000000-0000-0000-0000-000000000000",
  default: { v4 },
};
