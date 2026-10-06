/**
 * Sprint 6 migration — saved searches + new-listing alerts.
 *
 * Users persist a whitelist-validated search query; every newly created
 * listing is evaluated against active searches and the owner receives one
 * deduplicated in-app notification per batch of matching searches.
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
    if (!(await tableExists(conn, "saved_searches"))) {
      await conn.execute(`
        CREATE TABLE saved_searches (
          id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
          user_id INT NOT NULL,
          name VARCHAR(100) NULL,
          query_json TEXT NOT NULL,
          notify TINYINT(1) NOT NULL DEFAULT 1,
          created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
          updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
          INDEX idx_saved_searches_user (user_id, notify),
          CONSTRAINT fk_saved_searches_user FOREIGN KEY (user_id)
            REFERENCES users(id) ON DELETE CASCADE
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
      `);
      console.log("✅ saved_searches table created");
    } else {
      console.log("ℹ️ saved_searches already exists");
    }
  });

  console.log("🎉 Sprint 6 saved-search migration complete");
  process.exit(0);
}

main().catch((err) => {
  console.error("❌ Migration failed:", err);
  process.exit(1);
});
