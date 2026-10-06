/**
 * Sprint 8g migration — brand_requests table.
 *
 * Vendors/buyers can request a brand that is not yet registered
 * (POST /api/brands/requests); admins approve or reject it. Approval
 * inserts the brand and optionally maps it to the requested category node.
 *
 * Idempotent: CREATE TABLE IF NOT EXISTS.
 */
const db = require("../db");

async function main() {
  await db.initializePool();

  await db.execute(`
    CREATE TABLE IF NOT EXISTS brand_requests (
      id INT AUTO_INCREMENT PRIMARY KEY,
      name_en VARCHAR(120) NOT NULL,
      slug VARCHAR(120) NOT NULL,
      requested_category_id INT NULL,
      note_en VARCHAR(500) NULL,
      requested_by INT NOT NULL,
      status ENUM('pending','approved','rejected') NOT NULL DEFAULT 'pending',
      reviewed_by INT NULL,
      reviewed_at DATETIME NULL,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      INDEX idx_brand_requests_status (status),
      UNIQUE KEY uq_brand_requests_slug (slug)
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4
  `);

  console.log("✅ brand_requests table ready");
  process.exit(0);
}

main().catch((err) => {
  console.error("❌ Migration failed:", err);
  process.exit(1);
});
