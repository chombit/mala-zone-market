/**
 * database/init.js
 * Malazone.com — Database Initialization Script
 * Drops existing tables and recreates them from schema.sql
 * © 2026 Malazone Technologies PLC
 */

"use strict";

const mysql = require("mysql2/promise");
const fs = require("fs");
const path = require("path");
require("dotenv").config();

async function init() {
  const dbConfig = {
    host: process.env.DB_HOST || "localhost",
    port: parseInt(process.env.DB_PORT) || 3306,
    user: process.env.DB_USER || "root",
    password: process.env.DB_PASSWORD || "",
    multipleStatements: true // Essential for running schema.sql
  };

  let connection;
  try {
    console.log("[INIT] Connecting to MySQL...");
    connection = await mysql.createConnection(dbConfig);

    const schemaPath = path.join(__dirname, "schema.sql");
    const schemaSql = fs.readFileSync(schemaPath, "utf8");

    console.log("[INIT] dropping old tables if they exist...");
    await connection.query("DROP DATABASE IF EXISTS malazone");
    
    console.log("[INIT] Applying schema.sql...");
    await connection.query(schemaSql);

    console.log("[INIT] Database initialized successfully.");
    process.exit(0);
  } catch (err) {
    console.error("[INIT] ✗ Error initializing database:", err.message);
    process.exit(1);
  } finally {
    if (connection) await connection.end();
  }
}

init();
