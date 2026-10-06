/**
 * create_missing_tables.js
 * Creates tables that routes reference but which were never applied to the
 * live database (schema drift), plus reconciles column definitions with the
 * actual code contracts:
 *
 *  - messages      (chat: routes/messages.js)            — never created
 *  - ratings       (routes/ratings.js, routes/listings.js) — never defined anywhere
 *  - favorites     (routes/favorites.js)                 — in schema.sql, never applied
 *  - audit_logs    (utils/auditLogger.js)                — schema.sql version lacked
 *                    admin_user_id / actor_* columns the code writes
 *  - translations  (routes/site.js, routes/admin.js)     — in schema.sql, never applied
 *  - g2b_audits    (routes/g2b.js)                       — schema.sql version lacked
 *                    the plain `status` column the code inserts
 *  - inquiries     (future F5 use)                       — in schema.sql, never applied
 *
 * Idempotent: safe to run repeatedly.
 */
const db = require('../db');

const STATEMENTS = [
  `CREATE TABLE IF NOT EXISTS messages (
    id INT AUTO_INCREMENT PRIMARY KEY,
    sender_id INT NOT NULL,
    receiver_id INT NOT NULL,
    listing_id INT NULL,
    message_text TEXT NOT NULL,
    is_read BOOLEAN NOT NULL DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (sender_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (receiver_id) REFERENCES users(id) ON DELETE CASCADE,
    KEY idx_receiver_read (receiver_id, is_read),
    KEY idx_sender_receiver (sender_id, receiver_id),
    KEY idx_listing (listing_id)
  ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci`,

  `CREATE TABLE IF NOT EXISTS ratings (
    id INT AUTO_INCREMENT PRIMARY KEY,
    listing_id INT NULL,
    rater_id INT NOT NULL,
    seller_id INT NOT NULL,
    rating TINYINT NOT NULL,
    review TEXT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (listing_id) REFERENCES listings(id) ON DELETE SET NULL,
    FOREIGN KEY (rater_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (seller_id) REFERENCES users(id) ON DELETE CASCADE,
    KEY idx_seller (seller_id),
    UNIQUE KEY uq_rater_listing (rater_id, listing_id)
  ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci`,

  `CREATE TABLE IF NOT EXISTS favorites (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    listing_id INT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (listing_id) REFERENCES listings(id) ON DELETE CASCADE,
    UNIQUE KEY idx_user_listing (user_id, listing_id),
    KEY idx_user_id (user_id)
  ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci`,

  `CREATE TABLE IF NOT EXISTS audit_logs (
    id INT AUTO_INCREMENT PRIMARY KEY,
    admin_user_id INT NULL,
    user_id INT NULL,
    actor_type VARCHAR(30) NOT NULL DEFAULT 'system',
    actor_identifier VARCHAR(255) NULL,
    actor_role VARCHAR(50) NULL,
    action VARCHAR(100) NOT NULL,
    resource_type VARCHAR(50) NULL,
    resource_id VARCHAR(64) NULL,
    details JSON NULL,
    ip_address VARCHAR(45) NULL,
    user_agent VARCHAR(500) NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (admin_user_id) REFERENCES admin_users(id) ON DELETE SET NULL,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL,
    KEY idx_action (action),
    KEY idx_resource (resource_type, resource_id),
    KEY idx_created_at (created_at),
    KEY idx_actor_type (actor_type)
  ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci`,

  `CREATE TABLE IF NOT EXISTS translations (
    id INT AUTO_INCREMENT PRIMARY KEY,
    text_key VARCHAR(100) NOT NULL UNIQUE,
    en_value TEXT NOT NULL,
    am_value TEXT NOT NULL,
    section VARCHAR(50) DEFAULT 'general',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    KEY idx_section (section)
  ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci`,

  `CREATE TABLE IF NOT EXISTS g2b_audits (
    id INT AUTO_INCREMENT PRIMARY KEY,
    listing_id INT NOT NULL,
    status VARCHAR(50) DEFAULT 'submitted',
    officer_name VARCHAR(255) NOT NULL,
    officer_role ENUM('g2b_municipality', 'g2b_transport') NOT NULL,
    audit_type ENUM('land', 'vehicle') NOT NULL,
    workflow_status ENUM('submitted','under_review','needs_clarification','approved','rejected','fraud_flagged') NOT NULL DEFAULT 'submitted',
    rejection_reason ENUM('registry_mismatch','court_injunction','tax_arrears','ownership_dispute','document_fraud','stolen_vehicle','crime_flag','incomplete_docs','other') NULL,
    notes TEXT NULL,
    evidence_references JSON NULL,
    review_scope ENUM('property_review','legal_review','vehicle_review') NOT NULL,
    decision_timestamp TIMESTAMP NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (listing_id) REFERENCES listings(id) ON DELETE CASCADE,
    KEY idx_listing_id (listing_id),
    KEY idx_workflow_status (workflow_status),
    KEY idx_officer_role (officer_role),
    KEY idx_audit_type (audit_type)
  ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci`,

  `CREATE TABLE IF NOT EXISTS inquiries (
    id INT AUTO_INCREMENT PRIMARY KEY,
    listing_id INT NOT NULL,
    from_phone VARCHAR(20) NOT NULL,
    from_name VARCHAR(255) NULL,
    message TEXT NULL,
    inquiry_type ENUM('general','price_negotiation','delivery','inspection') DEFAULT 'general',
    status ENUM('new','read','responded','closed') DEFAULT 'new',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    responded_at TIMESTAMP NULL,
    FOREIGN KEY (listing_id) REFERENCES listings(id) ON DELETE CASCADE,
    KEY idx_listing_id (listing_id),
    KEY idx_status (status)
  ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci`,
];

async function createMissingTables() {
  let created = 0;
  try {
    for (const sql of STATEMENTS) {
      const table = sql.match(/CREATE TABLE IF NOT EXISTS (\w+)/)[1];
      await db.execute(sql);
      console.log(`✅ ${table} ready`);
      created += 1;
    }
    console.log(`\nDone — ${created} statements executed successfully`);
    process.exit(0);
  } catch (error) {
    console.error('Migration failed:', error.message);
    process.exit(1);
  }
}

createMissingTables();
