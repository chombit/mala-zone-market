"use strict";

const jwt = require("jsonwebtoken");
const db = require("../database/db");

const ADMIN_COOKIE_NAME = "malazone_admin_token";
const ADMIN_JWT_SECRET =
  process.env.ADMIN_JWT_SECRET || process.env.JWT_SECRET || "malazone_admin_secret_change_in_production";
const ADMIN_JWT_EXPIRES_IN = process.env.ADMIN_JWT_EXPIRES_IN || "12h";

function sanitizeAdminUser(admin) {
  return {
    id: admin.id,
    username: admin.username,
    full_name: admin.full_name,
    role: admin.role,
    is_active: Boolean(admin.is_active),
    last_login: admin.last_login || null,
    created_at: admin.created_at || null,
  };
}

function issueAdminToken(admin) {
  return jwt.sign(
    {
      sub: admin.id,
      role: admin.role,
      username: admin.username,
      type: "admin",
    },
    ADMIN_JWT_SECRET,
    { expiresIn: ADMIN_JWT_EXPIRES_IN }
  );
}

/**
 * verifyAdminToken(token)
 * Cryptographically verifies an admin JWT. Returns the decoded payload or
 * null — never throws. Used by HTTP middleware and the Socket.io admin feed.
 */
function verifyAdminToken(token) {
  if (!token || typeof token !== "string") return null;
  try {
    const payload = jwt.verify(token, ADMIN_JWT_SECRET);
    if (payload.type !== "admin") return null;
    return payload;
  } catch {
    return null;
  }
}

function setAdminAuthCookie(res, token) {
  res.cookie(ADMIN_COOKIE_NAME, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "strict",
    maxAge: 12 * 60 * 60 * 1000,
  });
}

function clearAdminAuthCookie(res) {
  res.clearCookie(ADMIN_COOKIE_NAME, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "strict",
  });
}

function getAdminTokenFromRequest(req) {
  const cookieToken = req.cookies?.[ADMIN_COOKIE_NAME];
  const headerToken = req.headers.authorization?.replace("Bearer ", "");
  return cookieToken || headerToken || null;
}

async function requireAdminAuth(req, res, next) {
  try {
    const token = getAdminTokenFromRequest(req);

    if (!token) {
      return res.status(401).json({ success: false, message: "Admin authentication required" });
    }

    const payload = verifyAdminToken(token);

    if (!payload) {
      clearAdminAuthCookie(res);
      return res.status(401).json({ success: false, message: "Invalid or expired admin session" });
    }

    const [[admin]] = await db.execute(
      "SELECT id, username, full_name, role, is_active, last_login, created_at FROM admin_users WHERE id = ? AND is_active = 1",
      [payload.sub]
    );

    if (!admin) {
      clearAdminAuthCookie(res);
      return res.status(401).json({ success: false, message: "Admin session is invalid or inactive" });
    }

    req.adminUser = sanitizeAdminUser(admin);
    next();
  } catch (err) {
    clearAdminAuthCookie(res);
    return res.status(401).json({ success: false, message: "Invalid or expired admin session" });
  }
}

function requireAdminRoles(...allowedRoles) {
  return (req, res, next) => {
    if (!req.adminUser) {
      return res.status(401).json({ success: false, message: "Admin authentication required" });
    }

    if (!allowedRoles.includes(req.adminUser.role)) {
      return res.status(403).json({ success: false, message: "You do not have permission for this action" });
    }

    next();
  };
}

module.exports = {
  ADMIN_COOKIE_NAME,
  sanitizeAdminUser,
  issueAdminToken,
  verifyAdminToken,
  setAdminAuthCookie,
  clearAdminAuthCookie,
  requireAdminAuth,
  requireAdminRoles,
};
