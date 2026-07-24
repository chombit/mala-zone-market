/**
 * database/migrate_messages.js
 * Run: node database/migrate_messages.js
 * Adds the messages table to an existing database.
 */

"use strict";

const db = require("./db");

async function migrate() {
  console.log("⏳ Creating messages table...");

  await db.execute(`
    CREATE TABLE IF NOT EXISTS messages (
      id INT AUTO_INCREMENT PRIMARY KEY,
      sender_id INT NOT NULL,
      receiver_id INT NOT NULL,
      listing_id INT DEFAULT NULL,
      message_text TEXT NOT NULL,
      is_read BOOLEAN DEFAULT FALSE,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (sender_id) REFERENCES users(id) ON DELETE CASCADE,
      FOREIGN KEY (receiver_id) REFERENCES users(id) ON DELETE CASCADE,
      FOREIGN KEY (listing_id) REFERENCES listings(id) ON DELETE SET NULL,
      INDEX idx_msg_sender (sender_id),
      INDEX idx_msg_receiver (receiver_id),
      INDEX idx_msg_listing (listing_id),
      INDEX idx_msg_read (is_read),
      INDEX idx_msg_created (created_at)
    ) ENGINE=InnoDB;
  `);

  console.log("✅ Messages table created successfully!");
  process.exit(0);
}

migrate().catch((err) => {
  console.error("❌ Migration failed:", err);
  process.exit(1);
});
