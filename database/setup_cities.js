/**
 * Setup Multi-City Support
 * Malazone.com — Database Migration & Seeding
 * © 2026 Malazone Technologies PLC
 */

const fs = require('fs');
const path = require('path');
const db = require('./db');

async function runSqlFile(filePath) {
  console.log(`[Setup] Running SQL file: ${filePath}`);
  const sql = fs.readFileSync(filePath, 'utf8');
  
  // Split by semicolon and execute each statement
  const statements = sql
    .split(';')
    .map(s => s.trim())
    .filter(s => s.length > 0 && !s.startsWith('--') && !s.startsWith('/*'));
  
  for (const statement of statements) {
    try {
      await db.execute(statement);
    } catch (err) {
      // Ignore "already exists" errors
      if (!err.message.includes('Duplicate column') && !err.message.includes('already exists')) {
        console.error('[Setup] Error executing statement:', err.message);
        console.error('Statement:', statement.substring(0, 100));
      }
    }
  }
  
  console.log(`[Setup] ✓ Completed: ${path.basename(filePath)}`);
}

async function setup() {
  try {
    console.log('[Setup] Starting multi-city setup...');
    
    // Run migration
    await runSqlFile(path.join(__dirname, 'migrations', '001_add_city_support.sql'));
    
    // Run seed
    await runSqlFile(path.join(__dirname, 'seed', '001_seed_cities.sql'));
    
    console.log('[Setup] ✓ Multi-city setup completed successfully!');
    
    // Verify
    const [locations] = await db.execute('SELECT * FROM locations');
    console.log(`[Setup] Total locations in database: ${locations.length}`);
    locations.forEach(loc => {
      console.log(`  - ${loc.label_en} (${loc.key_name}): ${loc.is_active ? 'Active' : 'Inactive'}`);
    });
    
    process.exit(0);
  } catch (err) {
    console.error('[Setup] ✗ Setup failed:', err.message);
    process.exit(1);
  }
}

setup();
