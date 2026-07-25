/**
 * middleware/userAuth.js
 * Malazone.com — User Authentication Middleware
 * JWT-based user session verification from httpOnly cookie
 * © 2026 Malazone Technologies PLC
 */

"use strict";

const jwt = require("jsonwebtoken");
const db = require("../database/db");

const JWT_SECRET = process.env.JWT_SECRET || "malazone_secret_key_change_in_production";

/**
 * Middleware: requireUserAuth
 * Verifies user JWT from httpOnly cookie and attaches user to req.user
 */
async function requireUserAuth(req, res, next) {
  try {
    const token = req.cookies?.malazone_token;

    if (!token) {
      return res.status(401).json({ success: false, message: "Authentication required" });
    }

    const decoded = jwt.verify(token, JWT_SECRET);
    const [users] = await db.execute("SELECT * FROM users WHERE id = ?", [decoded.id]);

    if (!users[0]) {
      return res.status(401).json({ success: false, message: "User not found" });
    }

    req.user = users[0];
    next();
  } catch (err) {
    return res.status(401).json({ success: false, message: "Invalid or expired session" });
  }
}

module.exports = { requireUserAuth, JWT_SECRET };
