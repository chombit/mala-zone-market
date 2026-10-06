/**
 * middleware/userOrAgentAuth.js
 * Malazone.com — Authentication that accepts EITHER a normal user session
 * (`malazone_token`) OR an agent session (`agent_token`).
 *
 * Agents chat on behalf of their underlying `user_id`, so an authenticated
 * agent is resolved back to that user and attached as `req.user` — making the
 * protected user routes (messages, notifications, etc.) work unchanged for
 * agents. User cookie wins if both are present.
 */

"use strict";

const jwt = require("jsonwebtoken");
const db = require("../database/db");
const { JWT_SECRET: USER_JWT_SECRET } = require("./userAuth");
const { JWT_SECRET: AGENT_JWT_SECRET } = require("./agentAuth");

async function requireUserOrAgentAuth(req, res, next) {
  try {
    // 1. Prefer a normal user session
    const userToken = req.cookies?.malazone_token;
    if (userToken) {
      const decoded = jwt.verify(userToken, USER_JWT_SECRET);
      const [users] = await db.execute("SELECT * FROM users WHERE id = ?", [decoded.id]);
      if (users[0]) {
        req.user = users[0];
        return next();
      }
      return res.status(401).json({ success: false, message: "User not found" });
    }

    // 2. Fall back to an agent session (chat identity = underlying user)
    const agentToken = req.cookies?.agent_token;
    if (agentToken) {
      const decoded = jwt.verify(agentToken, AGENT_JWT_SECRET);
      if (decoded.user_id) {
        const [users] = await db.execute("SELECT * FROM users WHERE id = ?", [decoded.user_id]);
        if (users[0]) {
          // Flag so routes can tell if this is an agent acting as a user.
          req.isAgent = true;
          req.user = users[0];
          return next();
        }
      }
      return res.status(401).json({ success: false, message: "Agent user not found" });
    }

    return res.status(401).json({ success: false, message: "Authentication required" });
  } catch (err) {
    return res.status(401).json({ success: false, message: "Invalid or expired session" });
  }
}

module.exports = { requireUserOrAgentAuth };
