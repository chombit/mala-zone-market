/**
 * Sprint 8h migration — virtual columns + indexes for hot JSON attributes.
 *
 * Attribute filters used to force a full scan with per-row JSON parsing.
 * Each hot attr_key gets a VIRTUAL column whose expression matches the
 * inlined SQL in routes/listings.js exactly, so MariaDB's expression
 * substitution can route filtered queries through a real index.
 *
 * Idempotent via ADD COLUMN/INDEX IF NOT EXISTS (MariaDB 10.4+).
 */
const db = require("../db");

// Top filterable keys across Electronics + Property traffic
const HOT_KEYS = [
  "condition",
  "storage_capacity",
  "screen_size",
  "battery_health",
  "ram",
  "processor",
  "land_type",
  "road_access",
  "size_class",
  "furnishing",
];

async function main() {
  await db.initializePool();

  for (const key of HOT_KEYS) {
    const col = `attr_${key}`;
    const expr = `JSON_UNQUOTE(JSON_EXTRACT(attributes,'$.${key}'))`;
    await db.execute(
      `ALTER TABLE listings
         ADD COLUMN IF NOT EXISTS ${col} VARCHAR(64)
           AS (${expr}) VIRTUAL,
         ADD INDEX IF NOT EXISTS idx_${col} (${col})`
    );
    console.log(`✓ ${col} + idx_${col}`);
  }

  // Composite covering index for the dominant browse query:
  // active listings scoped by category (+optional subcategory).
  await db.execute(
    `ALTER TABLE listings
       ADD INDEX IF NOT EXISTS idx_listings_scope (is_active, category, subcategory_id)`
  );
  console.log("✓ idx_listings_scope");

  process.exit(0);
}

main().catch((err) => {
  console.error("❌ Migration failed:", err.message);
  process.exit(1);
});
