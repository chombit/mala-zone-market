/**
 * database/migrate_promos.js
 * Run: node database/migrate_promos.js
 *
 * Sprint P4 — Listing promotion packages + manual payment verification
 * 1. Creates `packages` table (boost/featured pricing, server-side config)
 * 2. Seeds default package rows (idempotent)
 * 3. Creates `listing_promos` table (per-listing promotion orders with a
 *    pending → submitted → verified|rejected|expired lifecycle)
 * 4. Adds listings.premium_until (paid window; maintained by utils/promos.js)
 */
"use strict";

const db = require("./db");

const addColumn = async (table, column, def) => {
  try {
    await db.execute(`ALTER TABLE ${table} ADD COLUMN ${column} ${def}`);
    console.log(`   ✅ ${table}.${column} added`);
  } catch (e) {
    if (e.errno === 1060) {
      console.log(`   ℹ ${table}.${column} already exists`);
    } else throw e;
  }
};

async function migrate() {
  console.log("Sprint P4 — Listing promotion packages migration...\n");

  // 1. Packages (pricing lives here, never on the client)
  console.log("1. Creating packages table...");
  await db.execute(`
    CREATE TABLE IF NOT EXISTS packages (
      id INT AUTO_INCREMENT PRIMARY KEY,
      slug VARCHAR(50) NOT NULL UNIQUE,
      name_en VARCHAR(100) NOT NULL,
      name_am VARCHAR(100) NOT NULL,
      price_etb DECIMAL(10,2) NOT NULL DEFAULT 0,
      duration_days INT NOT NULL DEFAULT 0,
      features JSON NULL,
      is_active TINYINT(1) NOT NULL DEFAULT 1,
      sort_order INT NOT NULL DEFAULT 0,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
    ) ENGINE=InnoDB
  `);
  console.log("   ✅ packages table created\n");

  // 2. Seed default packages (idempotent upsert)
  console.log("2. Seeding default packages...");
  const seedPackages = [
    ["boost7", "Boost to Top — 7 Days", "ወደ ላይ ማስተዋወቅ — 7 ቀናት", 50, 7, ["boost_to_top"], 1],
    ["boost30", "Boost to Top — 30 Days", "ወደ ላይ ማስተዋወቅ — 30 ቀናት", 150, 30, ["boost_to_top", "featured_badge"], 2],
    ["featured30", "Featured — 30 Days", "ልዩ ዝግጅት — 30 ቀናት", 300, 30, ["boost_to_top", "featured_badge", "homepage_slot"], 3],
  ];
  for (const [slug, name_en, name_am, price, days, features, sort] of seedPackages) {
    await db.execute(
      `INSERT INTO packages (slug, name_en, name_am, price_etb, duration_days, features, sort_order, is_active)
       VALUES (?, ?, ?, ?, ?, ?, ?, 1)
       ON DUPLICATE KEY UPDATE
         name_en = VALUES(name_en), name_am = VALUES(name_am),
         price_etb = VALUES(price_etb), duration_days = VALUES(duration_days),
         features = VALUES(features), sort_order = VALUES(sort_order)`,
      [slug, name_en, name_am, price, days, JSON.stringify(features), sort]
    );
  }
  console.log("   ✅ 3 default packages seeded\n");

  // 3. Listing promotion orders
  console.log("3. Creating listing_promos table...");
  await db.execute(`
    CREATE TABLE IF NOT EXISTS listing_promos (
      id INT AUTO_INCREMENT PRIMARY KEY,
      user_id INT NOT NULL,
      listing_id INT NOT NULL,
      package_id INT NOT NULL,
      amount_etb DECIMAL(10,2) NOT NULL,
      method ENUM('telebirr','cbe') NOT NULL DEFAULT 'telebirr',
      reference VARCHAR(50) NOT NULL UNIQUE,
      evidence_urls JSON NULL,
      seller_note VARCHAR(500) DEFAULT NULL,
      status ENUM('pending','submitted','verified','rejected','expired','cancelled') NOT NULL DEFAULT 'pending',
      verified_at DATETIME DEFAULT NULL,
      expires_at DATETIME DEFAULT NULL,
      reviewed_by INT DEFAULT NULL,
      reject_reason VARCHAR(500) DEFAULT NULL,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
      INDEX idx_promo_listing (listing_id),
      INDEX idx_promo_status (status),
      INDEX idx_promo_user (user_id),
      INDEX idx_promo_reference (reference),
      CONSTRAINT fk_promo_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
      CONSTRAINT fk_promo_listing FOREIGN KEY (listing_id) REFERENCES listings(id) ON DELETE CASCADE
    ) ENGINE=InnoDB
  `);
  console.log("   ✅ listing_promos table created\n");

  // 4. Paid promotion window on listings (read by ranking + serve as badge)
  console.log("4. Adding listings.premium_until...");
  await addColumn("listings", "premium_until", "DATETIME DEFAULT NULL");

  console.log("\nAll migrations complete.");
  process.exit(0);
}

migrate().catch((err) => {
  console.error("Migration failed:", err);
  process.exit(1);
});