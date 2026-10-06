/**
 * run_repair_listings_autoincrement.js
 * Executes migration 002 to repair the listings table auto-increment
 *
 * Usage: node database/migrations/run_repair_listings_autoincrement.js
 */
const db = require('../db');

async function runMigration() {
  // Initialize the pool first
  await db.initializePool();
  const pool = db.getPool();
  const connection = await pool.getConnection();

  try {
    console.log('[Migration] Starting repair of listings table auto-increment...');

    // Step 1: Check the table for any corruption
    console.log('[Migration] Step 1: Checking table for corruption...');
    await connection.query('CHECK TABLE listings');

    // Step 2: Repair the table to fix any corruption issues
    console.log('[Migration] Step 2: Repairing table...');
    await connection.query('REPAIR TABLE listings');

    // Step 3: Optimize the table to reclaim space and rebuild indexes
    console.log('[Migration] Step 3: Optimizing table...');
    await connection.query('OPTIMIZE TABLE listings');

    // Step 4: Reset the auto-increment counter to a safe value
    console.log('[Migration] Step 4: Resetting auto-increment counter...');
    const [rows] = await connection.query('SELECT MAX(id) as max_id FROM listings');
    const maxId = rows[0].max_id || 0;
    const newAutoIncrement = maxId + 1;
    console.log(`[Migration] Current max ID: ${maxId}, setting auto-increment to: ${newAutoIncrement}`);
    await connection.query(`ALTER TABLE listings AUTO_INCREMENT = ${newAutoIncrement}`);

    // Step 5: Verify the repair was successful
    console.log('[Migration] Step 5: Verifying repair...');
    await connection.query('CHECK TABLE listings');

    console.log('[Migration] ✓ Listings table repair completed successfully');
    console.log('[Migration] The auto-increment counter has been reset and table optimized');
    process.exit(0);
  } catch (error) {
    console.error('[Migration] ✗ Migration failed:', error.message);
    console.error(error);
    process.exit(1);
  } finally {
    connection.release();
  }
}

runMigration();
