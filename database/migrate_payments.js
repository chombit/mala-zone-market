/**
 * database/migrate_payments.js
 * Run: node database/migrate_payments.js
 *
 * Sprint P1+P2+P3 — Payment verification flow
 * 1. Extends bookings.status ENUM with 'payment_submitted'
 * 2. Creates payments table (evidence uploads)
 * 3. Adds payment_phone + payment_bank_info to listings
 */
"use strict";

const db = require("./db");

async function migrate() {
  console.log("Sprint P1+P2+P3 — Payment flow migration...\n");

  // 1. Extend the ENUM — must include all existing values + new one
  console.log("1. Extending bookings.status ENUM...");
  await db.execute(`
    ALTER TABLE bookings MODIFY COLUMN status
    ENUM('pending','payment_submitted','confirmed','rejected',
         'cancelled_by_guest','cancelled_by_host','completed','expired')
    NOT NULL DEFAULT 'pending'
  `);
  console.log("   ✅ added 'payment_submitted'\n");

  // 2. Create payments table
  console.log("2. Creating payments table...");
  await db.execute(`
    CREATE TABLE IF NOT EXISTS payments (
      id INT AUTO_INCREMENT PRIMARY KEY,
      booking_id INT UNSIGNED NOT NULL,
      user_id INT NOT NULL,
      amount_claimed DECIMAL(12,2) NOT NULL,
      evidence_urls JSON NOT NULL,
      note VARCHAR(500) DEFAULT NULL,
      status ENUM('pending','verified','rejected') NOT NULL DEFAULT 'pending',
      reviewed_by INT DEFAULT NULL,
      reviewed_at DATETIME DEFAULT NULL,
      reject_reason VARCHAR(500) DEFAULT NULL,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
      FOREIGN KEY (booking_id) REFERENCES bookings(id) ON DELETE CASCADE,
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
      FOREIGN KEY (reviewed_by) REFERENCES users(id) ON DELETE SET NULL,
      INDEX idx_payments_booking (booking_id),
      INDEX idx_payments_status (status),
      INDEX idx_payments_user (user_id)
    ) ENGINE=InnoDB
  `);
  console.log("   ✅ payments table created\n");

  // 3. Add payment info columns to listings
  console.log("3. Adding payment info columns to listings...");
  const addCol = async (col, def) => {
    try {
      await db.execute(`ALTER TABLE listings ADD COLUMN ${col} ${def}`);
      console.log(`   ✅ ${col} added`);
    } catch (e) {
      if (e.errno === 1060) {
        console.log(`   ℹ ${col} already exists`);
      } else throw e;
    }
  };
  await addCol("payment_phone", "VARCHAR(20) DEFAULT NULL");
  await addCol("payment_bank_name", "VARCHAR(100) DEFAULT NULL");
  await addCol("payment_bank_account", "VARCHAR(100) DEFAULT NULL");

  console.log("\nAll migrations complete.");
  process.exit(0);
}

migrate().catch((err) => {
  console.error("Migration failed:", err);
  process.exit(1);
});
