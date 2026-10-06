/**
 * database/migrations/add_admin_jurisdiction.js
 * Adds city and sub_cities columns to admin_users for jurisdiction management
 */
"use strict";

const db = require("../db");

async function migrate() {
  console.log("🔄 Running migration: add_admin_jurisdiction");
  
  try {
    // Check if columns already exist
    const [columns] = await db.execute("DESCRIBE admin_users");
    const columnNames = columns.map(c => c.Field);
    
    // Add city column if not exists
    if (!columnNames.includes("city")) {
      await db.execute(`
        ALTER TABLE admin_users 
        ADD COLUMN city VARCHAR(50) NULL AFTER role
      `);
      console.log("✅ Added 'city' column");
    }
    
    // Add sub_cities column if not exists (JSON array)
    if (!columnNames.includes("sub_cities")) {
      await db.execute(`
        ALTER TABLE admin_users 
        ADD COLUMN sub_cities JSON NULL AFTER city
      `);
      console.log("✅ Added 'sub_cities' column");
    }
    
    console.log("✅ Migration complete: admin_users now has city and sub_cities");
    
  } catch (err) {
    console.error("❌ Migration failed:", err.message);
    throw err;
  } finally {
    process.exit(0);
  }
}

migrate();