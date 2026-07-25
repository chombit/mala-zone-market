/**
 * middleware/agentAuth.js
 * Malazone.com — Agent Authentication Middleware
 * JWT-based agent session verification
 * © 2026 Malazone Technologies PLC
 */

"use strict";

const jwt = require("jsonwebtoken");

const JWT_SECRET = process.env.AGENT_JWT_SECRET || "malazone-agent-secret-2026";

/**
 * Middleware: requireAgentAuth
 * Verifies agent JWT from httpOnly cookie and attaches agent payload to req.agent
 */
function requireAgentAuth(req, res, next) {
  const token = req.cookies?.agent_token;
  if (!token) {
    return res.status(401).json({ success: false, message: "Authentication required" });
  }
  try {
    const payload = jwt.verify(token, JWT_SECRET);
    req.agent = payload;
    next();
  } catch (err) {
    return res.status(401).json({ success: false, message: "Invalid or expired session" });
  }
}

/**
 * Helper: issueAgentToken
 * Generates a signed JWT for the agent
 */
function issueAgentToken(agentPayload) {
  return jwt.sign(agentPayload, JWT_SECRET, { expiresIn: "7d" });
}

/**
 * Helper: setAgentAuthCookie
 * Sets the httpOnly agent_token cookie on the response
 */
function setAgentAuthCookie(res, token) {
  res.cookie("agent_token", token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
    path: "/",
  });
}

/**
 * Helper: clearAgentAuthCookie
 * Clears the agent_token cookie
 */
function clearAgentAuthCookie(res) {
  res.clearCookie("agent_token", { path: "/" });
}

module.exports = {
  requireAgentAuth,
  issueAgentToken,
  setAgentAuthCookie,
  clearAgentAuthCookie,
  JWT_SECRET,
};
