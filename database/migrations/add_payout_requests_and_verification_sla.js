/**
 * add_payout_requests_and_verification_sla.js
 * Sprint 2 — Trust & money integrity.
 *
 * 1. Creates `agent_payout_requests`, the table every payout endpoint already
 *    references but which never existed (all payout endpoints were 500-ing).
 *    Includes maker-checker columns: approved_by/approved_at and
 *    processed_by/processed_at are recorded separately so the two-person rule
 *    can be enforced in the API layer.
 *
 * 2. Adds `listings.verification_requested_at` so the G2B queue can compute
 *    SLA breach (48h) from when verification was actually requested, not from
 *    listing creation.
 *
 * Idempotent: safe to run repeatedly.
 */
const db = require('../db');

async function migrate() {
  try {
    await db.transaction(async (conn) => {

    // 1. agent_payout_requests ------------------------------------------------
    await conn.execute(`
      CREATE TABLE IF NOT EXISTS agent_payout_requests (        id INT AUTO_INCREMENT PRIMARY KEY,
        agent_id INT NOT NULL,
        amount_etb DECIMAL(10,2) NOT NULL,
        telebirr_phone VARCHAR(20) NOT NULL,
        status ENUM('pending','approved','rejected','paid','failed') NOT NULL DEFAULT 'pending',
        admin_note VARCHAR(500) NULL,
        rejection_reason VARCHAR(255) NULL,
        approved_by INT NULL COMMENT 'admin_users.id of approving admin (maker)',
        approved_at TIMESTAMP NULL DEFAULT NULL,
        processed_by INT NULL COMMENT 'admin_users.id of disbursing admin (checker)',
        processed_at TIMESTAMP NULL DEFAULT NULL,
        telebirr_ref VARCHAR(100) NULL,
        created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
        INDEX idx_apr_agent_status (agent_id, status),
        INDEX idx_apr_status_created (status, created_at),
        CONSTRAINT fk_apr_agent FOREIGN KEY (agent_id) REFERENCES agents(id)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
    `);
    console.log('✅ agent_payout_requests ready');

    // 2. listings.verification_requested_at ----------------------------------
    const [cols] = await conn.execute("SHOW COLUMNS FROM listings LIKE 'verification_requested_at'");
    if (cols.length === 0) {
      await conn.execute(
        "ALTER TABLE listings ADD COLUMN verification_requested_at TIMESTAMP NULL DEFAULT NULL, ADD INDEX idx_listings_verify_req (verification_requested_at)"
      );
      console.log('✅ listings.verification_requested_at added');
    } else {
      console.log('ℹ️  listings.verification_requested_at already exists');
    }

    // 3. agent_earnings.listing_id must allow NULL ----------------------------
    // Manual balance adjustments have no listing; the NOT NULL constraint made
    // every ledger-backed adjustment fail (and roll back).
    const [lCols] = await conn.execute(
      "SELECT IS_NULLABLE FROM information_schema.COLUMNS WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME='agent_earnings' AND COLUMN_NAME='listing_id'"
    );
    if (lCols.length > 0 && lCols[0].IS_NULLABLE === 'NO') {
      await conn.execute("ALTER TABLE agent_earnings MODIFY COLUMN listing_id INT NULL");
      console.log('✅ agent_earnings.listing_id is now nullable');
    } else {
      console.log('ℹ️  agent_earnings.listing_id already nullable');
    }

    console.log('🎉 Sprint 2 migration complete');
    });
    process.exit(0);
  } catch (error) {
    console.error('Migration failed:', error.message);
    process.exit(1);
  }
}

migrate();
