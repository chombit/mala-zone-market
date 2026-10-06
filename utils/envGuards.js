/**
 * utils/envGuards.js
 * Malazone.com — Production environment validation
 * Fails fast at boot when required secrets are missing in production.
 * © 2026 Malazone Technologies PLC
 */

"use strict";

const KNOWN_INSECURE_DEFAULTS = new Set([
  "malazone_secret_key_change_in_production",
  "malazone_admin_secret_change_in_production",
  "malazone-session-secret-key-change-in-production",
]);

/**
 * requireProductionSecrets(names)
 * Throws (crashing the process via caller) if any secret is absent or still
 * set to a known insecure development default while NODE_ENV=production.
 *
 * @param {string[]} names - Environment variable names to validate
 */
function requireProductionSecrets(names) {
  const problems = [];

  for (const name of names) {
    const value = process.env[name];
    if (!value || value.trim().length === 0) {
      problems.push(`  - ${name} is not set`);
    } else if (KNOWN_INSECURE_DEFAULTS.has(value)) {
      problems.push(`  - ${name} is still set to the insecure default value`);
    } else if (value.length < 32) {
      problems.push(`  - ${name} must be at least 32 characters`);
    }
  }

  if (problems.length > 0) {
    throw new Error(
      `[Config] Refusing to start in production mode — fix these first:\n${problems.join("\n")}\n` +
        "Generate strong secrets with: node -e \"console.log(require('crypto').randomBytes(48).toString('hex'))\""
    );
  }
}

module.exports = { requireProductionSecrets };
