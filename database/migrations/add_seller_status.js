/**
 * add_seller_status.js
 * Malazone.com — Seller Workspace rollout: users gain a progressive seller
 * profile field (`seller_status`) plus an admin management flag.
 *
 *   - users.seller_status       ENUM('casual','store') NOT NULL DEFAULT 'casual'
 *       casual = any-user-can-sell (zero friction), store = opted-in storefront
 *       + seller dashboard. Drives UI, never permissions.
 *   - users.is_featured_seller  TINYINT(1) NOT NULL DEFAULT 0
 *       Admin flag that promotes a seller's storefront on listing details/
 *       store pages.
 *
 * Idempotent via information_schema — safe to run repeatedly.
 * Run: node database/migrations/add_seller_status.js
 */
const db = require('../db');

async function columnExists(table, column) {
  const [[row]] = await db.execute(
    `SELECT COUNT(*) AS c FROM information_schema.columns
     WHERE table_schema = DATABASE() AND table_name = ? AND column_name = ?`,
    [table, column]
  );
  return Number(row.c) > 0;
}

async function addSellerStatus() {
  try {
    if (await columnExists('users', 'seller_status')) {
      console.log('users.seller_status — already present');
    } else {
      await db.execute(
        "ALTER TABLE users ADD COLUMN seller_status ENUM('casual','store') NOT NULL DEFAULT 'casual' AFTER account_type"
      );
      console.log('✅ users.seller_status added');
    }

    if (await columnExists('users', 'is_featured_seller')) {
      console.log('users.is_featured_seller — already present');
    } else {
      await db.execute(
        'ALTER TABLE users ADD COLUMN is_featured_seller TINYINT(1) NOT NULL DEFAULT 0 AFTER seller_status'
      );
      console.log('✅ users.is_featured_seller added');
    }

    const [[row]] = await db.execute(
      "SELECT COUNT(*) AS c FROM information_schema.columns WHERE table_schema = DATABASE() AND table_name = 'users' AND column_name IN ('seller_status','is_featured_seller')"
    );
    console.log(`\nDone — ${row.c}/2 seller columns present on users.`);
    process.exit(0);
  } catch (error) {
    console.error('Migration failed:', error.message);
    process.exit(1);
  }
}

addSellerStatus();