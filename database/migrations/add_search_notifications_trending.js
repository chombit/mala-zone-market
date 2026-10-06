/**
 * add_search_notifications_trending.js
 * Sprint 3 — Growth features.
 *
 * 1. FULLTEXT index over listing text fields for relevance-ranked search
 *    (MariaDB 10.4 InnoDB supports FULLTEXT).
 * 2. `notifications` table — the in-app notification matrix (F10): lifecycle
 *    events (verification verdicts, payout transitions) write rows here and
 *    users read them via /api/notifications.
 *
 * Idempotent: safe to run repeatedly.
 */
const db = require('../db');

async function migrate() {
  try {
    await db.transaction(async (conn) => {
      // 1. FULLTEXT search index ----------------------------------------------
      const [ft] = await conn.execute(
        "SELECT COUNT(*) AS n FROM information_schema.STATISTICS WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME='listings' AND INDEX_NAME='ft_listings_search'"
      );
      if (ft[0].n === 0) {
        await conn.execute(
          "ALTER TABLE listings ADD FULLTEXT INDEX ft_listings_search (title_en, title_am, description_en, description_am)"
        );
        console.log('✅ FULLTEXT index ft_listings_search added');
      } else {
        console.log('ℹ️  FULLTEXT index already exists');
      }

      // 2. notifications -------------------------------------------------------
      await conn.execute(`
        CREATE TABLE IF NOT EXISTS notifications (
          id INT AUTO_INCREMENT PRIMARY KEY,
          user_id INT NOT NULL,
          type VARCHAR(64) NOT NULL COMMENT 'e.g. verification_approved, payout_paid',
          title VARCHAR(255) NOT NULL,
          body VARCHAR(500) NULL,
          payload JSON NULL,
          listing_id INT NULL,
          read_at TIMESTAMP NULL DEFAULT NULL,
          created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
          INDEX idx_notif_user_read (user_id, read_at),
          INDEX idx_notif_user_created (user_id, created_at)
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
      `);
      console.log('✅ notifications table ready');
    });
    console.log('🎉 Sprint 3 migration complete');
    process.exit(0);
  } catch (error) {
    console.error('Migration failed:', error.message);
    process.exit(1);
  }
}

migrate();
