/**
 * database/db.js
 * Malazone.com — MySQL Connection Pool & Utilities
 * © 2026 Malazone Technologies PLC
 *
 * Usage:
 *   const db = require('./database/db');
 *   const [rows] = await db.execute('SELECT * FROM users WHERE id = ?', [1]);
 *
 * Environment variables required in .env:
 *   DB_HOST=localhost
 *   DB_PORT=3306
 *   DB_USER=root
 *   DB_PASSWORD=your_password
 *   DB_NAME=malazone
 */

"use strict";

const mysql = require("mysql2/promise");
require("dotenv").config();

// ─────────────────────────────────────────────
// CONFIGURATION
// ─────────────────────────────────────────────
const dbConfig = {
  host: process.env.DB_HOST || "localhost",
  port: parseInt(process.env.DB_PORT) || 3306,
  user: process.env.DB_USER || "root",
  password: process.env.DB_PASSWORD || "",
  database: process.env.DB_NAME || "malazone",
  waitForConnections: true,
  connectionLimit: 10, // max concurrent connections
  queueLimit: 0, // unlimited queue
  enableKeepAlive: true,
  // Charset for multilingual support (Amharic, etc.)
  charset: "utf8mb4",
  supportBigNumbers: true,
  bigNumberStrings: false,
  // DECIMAL columns (price, commissions, payouts) are returned as strings so
  // no float rounding can corrupt ETB financial values. Cast explicitly in
  // application code when arithmetic is needed.
  decimalNumbers: false,
};

// ─────────────────────────────────────────────
// CREATE POOL
// ─────────────────────────────────────────────
let pool = null;

async function initializePool() {
  if (pool) return pool;

  try {
    console.log(`[DB] Connecting to MySQL @ ${dbConfig.host}:${dbConfig.port}/${dbConfig.database}`);
    pool = mysql.createPool(dbConfig);

    // Test connection
    const connection = await pool.getConnection();
    await connection.ping();
    connection.release();

    console.log(
      `[DB] ✓ Connected successfully. Pool ready (max ${dbConfig.connectionLimit} connections)`
    );
    return pool;
  } catch (err) {
    console.error("[DB] ✗ Failed to initialize connection pool:", err.message);
    throw err;
  }
}

// ─────────────────────────────────────────────
// PRIMARY EXPORT: EXECUTE WRAPPER
// ─────────────────────────────────────────────
/**
 * execute(sql, values)
 * Executes a prepared statement with parameter binding.
 *
 * @param {string} sql - SQL query with ? placeholders
 * @param {array} values - Values to bind (optional)
 * @returns {Promise<[rows, fields]>} - MySQL result
 *
 * Example:
 *   const [rows] = await db.execute('SELECT * FROM users WHERE id = ?', [1]);
 *   const [result] = await db.execute('INSERT INTO users (...) VALUES (...)', [...]);
 *   console.log(result.insertId); // Auto-incremented ID
 */
async function execute(sql, values = []) {
  if (!pool) {
    await initializePool();
  }

  const connection = await pool.getConnection();
  try {
    // Enable streaming for large result sets (optional)
    const result = await connection.execute(sql, values);
    return result;
  } catch (err) {
    console.error("[DB Query Error]", sql, "Values:", values, "Error:", err.message);
    throw err;
  } finally {
    connection.release();
  }
}

// ─────────────────────────────────────────────
// TRANSACTION SUPPORT
// ─────────────────────────────────────────────
/**
 * transaction(callback)
 * Execute multiple queries in a single transaction with rollback on error.
 *
 * @param {Function} callback - Async function that receives connection
 * @returns {Promise<any>} - Return value of callback
 *
 * Example:
 *   await db.transaction(async (conn) => {
 *     await conn.execute('INSERT INTO users (...)', [...]);
 *     await conn.execute('INSERT INTO listings (...)', [...]);
 *     // Auto-commits if no error thrown
 *   });
 */
async function transaction(callback) {
  if (!pool) {
    await initializePool();
  }

  const connection = await pool.getConnection();
  try {
    await connection.beginTransaction();
    const result = await callback(connection);
    await connection.commit();
    return result;
  } catch (err) {
    await connection.rollback();
    throw err;
  } finally {
    connection.release();
  }
}

// ─────────────────────────────────────────────
// BULK OPERATIONS
// ─────────────────────────────────────────────
/**
 * insertBatch(table, rows)
 * Batch insert multiple rows efficiently
 *
 * @param {string} table - Table name
 * @param {array} rows - Array of row objects with same keys
 * @returns {Promise<object>} - Insert result
 *
 * Example:
 *   await db.insertBatch('users', [
 *     { full_name: 'Abebe', phone_number: '0911111111' },
 *     { full_name: 'Amara', phone_number: '0922222222' }
 *   ]);
 */
async function insertBatch(table, rows) {
  if (!rows || rows.length === 0) {
    throw new Error("insertBatch: rows array cannot be empty");
  }

  const keys = Object.keys(rows[0]);
  const placeholders = rows.map(() => `(${keys.map(() => "?").join(",")})`).join(",");
  const values = rows.flatMap((row) => keys.map((k) => row[k]));

  const sql = `INSERT INTO ${table} (${keys.join(",")}) VALUES ${placeholders}`;
  return execute(sql, values);
}

// ─────────────────────────────────────────────
// HEALTH CHECK
// ─────────────────────────────────────────────
async function healthCheck() {
  if (!pool) {
    throw new Error("[DB] Pool not initialized");
  }
  try {
    const connection = await pool.getConnection();
    await connection.ping();
    connection.release();
    return { ok: true, message: "Database connection healthy" };
  } catch (err) {
    return { ok: false, message: err.message };
  }
}

// ─────────────────────────────────────────────
// CLEANUP
// ─────────────────────────────────────────────
async function close() {
  if (pool) {
    await pool.end();
    pool = null;
    console.log("[DB] Connection pool closed");
  }
}

// ─────────────────────────────────────────────
// EXPORT
// ─────────────────────────────────────────────
module.exports = {
  // Initialize
  initializePool,

  // Main query interface
  execute,

  // Advanced features
  transaction,
  insertBatch,
  healthCheck,
  close,

  // Direct pool access (for advanced use cases)
  getPool: () => pool,

  // Config export (for diagnostics)
  config: dbConfig,
};

// ─────────────────────────────────────────────
// GRACEFUL SHUTDOWN
// ─────────────────────────────────────────────
process.on("SIGINT", async () => {
  console.log("\n[DB] Graceful shutdown initiated...");
  await close();
  process.exit(0);
});

process.on("SIGTERM", async () => {
  console.log("\n[DB] Graceful shutdown initiated...");
  await close();
  process.exit(0);
});
