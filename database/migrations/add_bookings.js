/**
 * Sprint 5 migration — booking engine for stay/ceremony listings.
 *
 * Creates the `bookings` table (request-to-book model; no money moves —
 * payment gateway integration is a separate sprint).
 *
 * Idempotent: every step checks information_schema before running, so the
 * script can be executed any number of times.
 */
const db = require("../db");

async function columnExists(conn, table, column) {
  const [rows] = await conn.execute(
    `SELECT COUNT(*) AS n FROM information_schema.COLUMNS
     WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = ? AND COLUMN_NAME = ?`,
    [table, column]
  );
  return rows[0].n > 0;
}

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
    if (!(await tableExists(conn, "bookings"))) {
      await conn.execute(`
        CREATE TABLE bookings (
          id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
          listing_id INT NOT NULL,
          guest_user_id INT NOT NULL,
          host_user_id INT NOT NULL,
          check_in DATE NULL,
          check_out DATE NULL,
          event_date DATE NULL,
          nights INT NULL,
          guests INT NULL,
          price_per_unit DECIMAL(12,2) NOT NULL,
          total_price DECIMAL(12,2) NOT NULL,
          currency VARCHAR(8) NOT NULL DEFAULT 'ETB',
          contact_phone VARCHAR(20) NOT NULL,
          guest_message VARCHAR(1000) NULL,
          status ENUM(
            'pending','confirmed','rejected','cancelled_by_guest',
            'cancelled_by_host','completed','expired'
          ) NOT NULL DEFAULT 'pending',
          decided_at DATETIME NULL,
          created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
          updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
          INDEX idx_bookings_listing_status (listing_id, status),
          INDEX idx_bookings_guest (guest_user_id, status),
          INDEX idx_bookings_host (host_user_id, status),
          CONSTRAINT fk_bookings_listing FOREIGN KEY (listing_id)
            REFERENCES listings(id) ON DELETE CASCADE,
          CONSTRAINT fk_bookings_guest FOREIGN KEY (guest_user_id)
            REFERENCES users(id) ON DELETE CASCADE
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
      `);
      console.log("✅ bookings table created");
    } else {
      console.log("ℹ️ bookings already exists");
    }
  });

  console.log("🎉 Sprint 5 booking migration complete");
  process.exit(0);
}

main().catch((err) => {
  console.error("❌ Migration failed:", err);
  process.exit(1);
});
