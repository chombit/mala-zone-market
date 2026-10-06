/**
 * database/migrations/add_verification_workflow.js
 * Adds two-phase verification workflow for listings
 * Phase 1: Admin review → Phase 2: G2B Officer verification
 */
"use strict";

const db = require("../db");

async function migrate() {
  console.log("🔄 Running migration: add_verification_workflow");
  
  try {
    // Check existing columns
    const [columns] = await db.execute("DESCRIBE listings");
    const columnNames = columns.map(c => c.Field);
    
    // Add verification_status column
    if (!columnNames.includes("verification_status")) {
      await db.execute(`
        ALTER TABLE listings 
        ADD COLUMN verification_status VARCHAR(50) DEFAULT 'pending_admin_review' AFTER is_verified
      `);
      console.log("✅ Added 'verification_status' column");
    }
    
    // Add assigned_officer_id
    if (!columnNames.includes("assigned_officer_id")) {
      await db.execute(`
        ALTER TABLE listings 
        ADD COLUMN assigned_officer_id INT NULL AFTER verification_status,
        ADD INDEX idx_assigned_officer (assigned_officer_id)
      `);
      console.log("✅ Added 'assigned_officer_id' column");
    }
    
    // Add verification_documents (JSON)
    if (!columnNames.includes("verification_documents")) {
      await db.execute(`
        ALTER TABLE listings 
        ADD COLUMN verification_documents JSON NULL AFTER assigned_officer_id
      `);
      console.log("✅ Added 'verification_documents' column");
    }
    
    // Add admin_notes
    if (!columnNames.includes("admin_notes")) {
      await db.execute(`
        ALTER TABLE listings 
        ADD COLUMN admin_notes TEXT NULL AFTER verification_documents
      `);
      console.log("✅ Added 'admin_notes' column");
    }
    
    // Add officer_notes
    if (!columnNames.includes("officer_notes")) {
      await db.execute(`
        ALTER TABLE listings 
        ADD COLUMN officer_notes TEXT NULL AFTER admin_notes
      `);
      console.log("✅ Added 'officer_notes' column");
    }
    
    // Add rejection_reason
    if (!columnNames.includes("rejection_reason")) {
      await db.execute(`
        ALTER TABLE listings 
        ADD COLUMN rejection_reason TEXT NULL AFTER officer_notes
      `);
      console.log("✅ Added 'rejection_reason' column");
    }
    
    // Add admin_reviewed_at
    if (!columnNames.includes("admin_reviewed_at")) {
      await db.execute(`
        ALTER TABLE listings 
        ADD COLUMN admin_reviewed_at DATETIME NULL AFTER rejection_reason
      `);
      console.log("✅ Added 'admin_reviewed_at' column");
    }
    
    // Add admin_reviewed_by
    if (!columnNames.includes("admin_reviewed_by")) {
      await db.execute(`
        ALTER TABLE listings 
        ADD COLUMN admin_reviewed_by INT NULL AFTER admin_reviewed_at,
        ADD INDEX idx_admin_reviewed (admin_reviewed_by)
      `);
      console.log("✅ Added 'admin_reviewed_by' column");
    }
    
    // Add officer_reviewed_at
    if (!columnNames.includes("officer_reviewed_at")) {
      await db.execute(`
        ALTER TABLE listings 
        ADD COLUMN officer_reviewed_at DATETIME NULL AFTER admin_reviewed_by
      `);
      console.log("✅ Added 'officer_reviewed_at' column");
    }
    
    // Add sla_deadline
    if (!columnNames.includes("sla_deadline")) {
      await db.execute(`
        ALTER TABLE listings 
        ADD COLUMN sla_deadline DATETIME NULL AFTER officer_reviewed_at,
        ADD INDEX idx_sla_deadline (sla_deadline)
      `);
      console.log("✅ Added 'sla_deadline' column");
    }
    
    // Add escalated flag
    if (!columnNames.includes("is_escalated")) {
      await db.execute(`
        ALTER TABLE listings 
        ADD COLUMN is_escalated TINYINT(1) DEFAULT 0 AFTER sla_deadline,
        ADD INDEX idx_escalated (is_escalated)
      `);
      console.log("✅ Added 'is_escalated' column");
    }
    
    // Add index on verification_status
    const [indexes] = await db.execute("SHOW INDEX FROM listings WHERE Key_name = 'idx_verification_status'");
    if (indexes.length === 0) {
      await db.execute("ALTER TABLE listings ADD INDEX idx_verification_status (verification_status)");
      console.log("✅ Added index on 'verification_status'");
    }
    
    console.log("\n✅ Migration complete: Verification workflow columns added");
    
  } catch (err) {
    console.error("❌ Migration failed:", err.message);
    throw err;
  } finally {
    process.exit(0);
  }
}

migrate();
