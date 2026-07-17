/**
 * database/init.js
 * Malazone.com — Initialize Database via Node.js
 * © 2026 Malazone Technologies PLC
 */

"use strict";

const db = require("./db");
const fs = require("fs");
const path = require("path");

const initDatabase = async () => {
  try {
    console.log("🏗️  Initializing Malazone Database...");

    // Read and execute schema.sql
    const schemaPath = path.join(__dirname, "schema.sql");
    let schema = fs.readFileSync(schemaPath, "utf-8");

    // Remove comments and split into individual statements
    const statements = schema
      .replace(/\/\*[\s\S]*?\*\//g, "") // remove multi-line comments
      .replace(/--.*$/gm, "") // remove single-line comments
      .split(";")
      .map(s => s.trim())
      .filter(s => s.length > 0);

    // Execute each statement
    for (let statement of statements) {
      try {
        // Skip USE database statement (already handled by db.js connection)
        if (statement.toLowerCase().startsWith("use")) continue;
        await db.execute(statement);
      } catch (err) {
        // Ignore errors about database/table already existing
        if (!err.message.includes("exists") && !err.message.includes("Duplicate")) {
          console.warn("⚠️", err.message);
        }
      }
    }

    // ── Ensure password-reset columns exist on users table ──
    const alterCols = [
      "ALTER TABLE users ADD COLUMN IF NOT EXISTS reset_password_token VARCHAR(255)",
      "ALTER TABLE users ADD COLUMN IF NOT EXISTS reset_password_expires DATETIME",
    ];
    for (const sql of alterCols) {
      try {
        await db.execute(sql);
      } catch (err) {
        // "Duplicate column" is fine — column already present
        if (!err.message.includes("Duplicate")) {
          console.warn("⚠️ Migration:", err.message);
        }
      }
    }

    console.log("✅ Database schema created/updated successfully!");

  } catch (err) {
    console.error("❌ Database init failed:", err);
  } finally {
    process.exit(0);
  }
};

initDatabase();