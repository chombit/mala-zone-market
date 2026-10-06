/**
 * database/migrations/update_admin_roles_enum.js
 * Updates admin_users role enum to include g2b roles
 */
"use strict";

const db = require("../db");

async function migrate() {
  console.log("🔄 Running migration: update_admin_roles_enum");
  
  try {
    // First, check current enum values
    const [columns] = await db.execute("SHOW COLUMNS FROM admin_users WHERE Field = 'role'");
    const currentType = columns[0].Type;
    console.log("Current role type:", currentType);
    
    // Check if g2b roles are already supported
    if (currentType.includes('g2b')) {
      console.log("✅ g2b roles already supported");
    } else {
      // Drop the enum and add new one with g2b roles
      // First, temporarily change to VARCHAR
      await db.execute(`
        ALTER TABLE admin_users 
        MODIFY COLUMN role VARCHAR(30) NULL DEFAULT 'admin'
      `);
      console.log("✅ Changed role to VARCHAR");
      
      // Now update any existing g2b users that might have empty string
      await db.execute(`
        UPDATE admin_users SET role = 'admin' WHERE role = '' OR role IS NULL
      `);
      
      console.log("✅ Migration complete: role column now supports g2b roles");
    }
    
  } catch (err) {
    console.error("❌ Migration failed:", err.message);
    throw err;
  } finally {
    process.exit(0);
  }
}

migrate();