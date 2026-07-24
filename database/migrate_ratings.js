/**
 * database/migrate_ratings.js
 * Run: node database/migrate_ratings.js
 */

"use strict";

const db = require("./db");

async function migrate() {
  console.log("⏳ Creating ratings table...");

  await db.execute(`
    CREATE TABLE IF NOT EXISTS ratings (
      id INT AUTO_INCREMENT PRIMARY KEY,
      listing_id INT DEFAULT NULL,
      rater_id INT NOT NULL,
      seller_id INT NOT NULL,
      rating TINYINT NOT NULL CHECK (rating >= 1 AND rating <= 5),
      review TEXT,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (listing_id) REFERENCES listings(id) ON DELETE SET NULL,
      FOREIGN KEY (rater_id) REFERENCES users(id) ON DELETE CASCADE,
      FOREIGN KEY (seller_id) REFERENCES users(id) ON DELETE CASCADE,
      UNIQUE KEY unique_rating_per_listing (rater_id, listing_id),
      INDEX idx_rating_seller (seller_id),
      INDEX idx_rating_created (created_at)
    ) ENGINE=InnoDB;
  `);

  console.log("✅ Ratings table created successfully!");
  process.exit(0);
}

migrate().catch((err) => {
  console.error("❌ Migration failed:", err);
  process.exit(1);
});
