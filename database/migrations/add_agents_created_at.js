/**
 * add_agents_created_at.js
 * Adds the missing created_at column to the agents table.
 *
 * Background: several agent endpoints (login, /me) selected `agents.created_at`
 * even though the column never existed, causing every call to fail with 500.
 */
const db = require('../db');

async function addAgentsCreatedAt() {
  try {
    console.log('Checking agents.created_at column...');
    const [cols] = await db.execute("SHOW COLUMNS FROM agents LIKE 'created_at'");

    if (cols.length > 0) {
      console.log('✅ Column already exists — nothing to do');
      process.exit(0);
    }

    await db.execute(
      "ALTER TABLE agents ADD COLUMN created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP"
    );
    console.log('✅ agents.created_at added successfully');
    process.exit(0);
  } catch (error) {
    console.error('Migration failed:', error.message);
    process.exit(1);
  }
}

addAgentsCreatedAt();
