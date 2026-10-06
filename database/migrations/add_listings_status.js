/**
 * add_listings_status.js
 * Introduces the listing lifecycle state machine column.
 *
 * States: active | sold | expired | suspended | archived
 *   - Owner transitions:      active <-> sold, <-> archived (via API)
 *   - Admin/system reserved:  suspended, expired
 *
 * `is_active` remains synced (is_active = status === 'active') so every
 * existing read path keeps working during the frontend transition.
 *
 * Idempotent: safe to run repeatedly.
 */
const db = require('../db');

async function addListingsStatus() {
  try {
    const [cols] = await db.execute("SHOW COLUMNS FROM listings LIKE 'status'");
    if (cols.length > 0) {
      console.log('✅ listings.status already exists — nothing to do');
      process.exit(0);
    }

    await db.execute(
      "ALTER TABLE listings ADD COLUMN status ENUM('active','sold','expired','suspended','archived') NOT NULL DEFAULT 'active'"
    );
    console.log('✅ listings.status added');

    await db.execute(
      "UPDATE listings SET status = CASE WHEN is_active = 1 THEN 'active' ELSE 'archived' END"
    );
    const [[{ n }]] = await db.execute('SELECT COUNT(*) AS n FROM listings WHERE status = "active"');
    console.log(`✅ backfilled — ${n} active listing(s)`);
    process.exit(0);
  } catch (error) {
    console.error('Migration failed:', error.message);
    process.exit(1);
  }
}

addListingsStatus();
