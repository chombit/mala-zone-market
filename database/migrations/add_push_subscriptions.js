/**
 * add_push_subscriptions.js
 * Push notifications (Web Push / VAPID).
 *
 * 1. Creates `push_subscriptions` table — one row per registered endpoint
 *    per user. Endpoint is the unique key (a user may have several devices).
 * 2. Idempotent: safe to run repeatedly.
 *
 * Run: node database/migrations/add_push_subscriptions.js
 */
const db = require('../db');

async function migrate() {
  try {
    await db.transaction(async (conn) => {
      await conn.execute(`
        CREATE TABLE IF NOT EXISTS push_subscriptions (
          id INT AUTO_INCREMENT PRIMARY KEY,
          user_id INT NOT NULL,
          endpoint VARCHAR(500) NOT NULL,
          p256dh VARCHAR(255) NOT NULL,
          auth VARCHAR(255) NOT NULL,
          user_agent VARCHAR(255) NULL,
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
          UNIQUE KEY uk_push_endpoint (endpoint(255)),
          KEY idx_push_user (user_id),
          CONSTRAINT fk_push_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4
      `);
      console.log('✅ push_subscriptions table ready');
    });
    process.exit(0);
  } catch (err) {
    console.error('[migrate] add_push_subscriptions failed:', err);
    process.exit(1);
  }
}

migrate();
