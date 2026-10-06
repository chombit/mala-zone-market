/**
 * Sprint 7 migration — listing reports + moderation queue.
 *
 * Buyers file reports against listings; admins triage them. A report
 * resolved as action_taken triggers a listing takedown (status='suspended');
 * admins can restore afterwards. Every transition is audit-logged in code.
 *
 * Idempotent: checks information_schema before creating.
 */
const db = require("../db");

async function tableExists(conn, table) {
  const [rows] = await conn.execute(
    `SELECT COUNT(*) AS n FROM information_schema.TABLES
     WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = ?`,
    [table]
  );
  return rows[0].n > 0;
}

async function main() {
  await db.initializePool();

  await db.transaction(async (conn) => {
    if (!(await tableExists(conn, "listing_reports"))) {
      await conn.execute(`
        CREATE TABLE listing_reports (
          id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
          listing_id INT NOT NULL,
          reporter_user_id INT NOT NULL,
          reason ENUM(
            'scam','prohibited','wrong_info','already_sold',
            'duplicate','other'
          ) NOT NULL,
          details VARCHAR(1000) NULL,
          status ENUM(
            'open','reviewing','resolved_action_taken',
            'resolved_rejected','dismissed'
          ) NOT NULL DEFAULT 'open',
          reviewed_by INT NULL,
          reviewer_username VARCHAR(100) NULL,
          resolution_note VARCHAR(500) NULL,
          created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
          updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
          INDEX idx_reports_status (status, created_at),
          INDEX idx_reports_listing (listing_id),
          CONSTRAINT fk_reports_listing FOREIGN KEY (listing_id)
            REFERENCES listings(id) ON DELETE CASCADE,
          CONSTRAINT fk_reports_reporter FOREIGN KEY (reporter_user_id)
            REFERENCES users(id) ON DELETE CASCADE
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
      `);
      console.log("✅ listing_reports table created");
    } else {
      console.log("ℹ️ listing_reports already exists");
    }
  });

  console.log("🎉 Sprint 7 reports migration complete");
  process.exit(0);
}

main().catch((err) => {
  console.error("❌ Migration failed:", err);
  process.exit(1);
});
