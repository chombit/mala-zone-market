"use strict";

const db = require("../database/db");

const REDACTED_KEYS = new Set([
  "password",
  "password_hash",
  "token",
  "reset_password_token",
  "provider_profile",
  "authorization",
]);

function sanitizeForAudit(value) {
  if (value === undefined) {
    return null;
  }

  if (value === null || typeof value === "number" || typeof value === "boolean" || typeof value === "string") {
    return value;
  }

  if (value instanceof Date) {
    return value.toISOString();
  }

  if (Array.isArray(value)) {
    return value.map((item) => sanitizeForAudit(item));
  }

  if (typeof value === "object") {
    const next = {};

    for (const [key, child] of Object.entries(value)) {
      if (REDACTED_KEYS.has(key)) {
        next[key] = "[REDACTED]";
      } else if (child !== undefined) {
        next[key] = sanitizeForAudit(child);
      }
    }

    return next;
  }

  return String(value);
}

function getClientIp(req) {
  const forwarded = req.headers["x-forwarded-for"];

  if (Array.isArray(forwarded) && forwarded.length > 0) {
    return forwarded[0];
  }

  if (typeof forwarded === "string" && forwarded.length > 0) {
    return forwarded.split(",")[0].trim();
  }

  return req.ip || req.socket?.remoteAddress || null;
}

function getAdminActor(req) {
  return {
    actorType: "admin",
    adminUserId: req.adminUser?.id || null,
    actorIdentifier: req.adminUser?.username || req.adminUser?.full_name || null,
    actorRole: req.adminUser?.role || null,
  };
}

function getUserActor(user) {
  return {
    actorType: "user",
    userId: user?.id || null,
    actorIdentifier: user?.email || user?.phone_number || user?.full_name || null,
    actorRole: user?.account_type || null,
  };
}

async function writeAuditLog({
  req,
  adminUserId = null,
  userId = null,
  actorType = "system",
  actorIdentifier = null,
  actorRole = null,
  action,
  resourceType,
  resourceId = null,
  details = null,
}) {
  try {
    await db.execute(
      `INSERT INTO audit_logs (
        admin_user_id,
        user_id,
        actor_type,
        actor_identifier,
        actor_role,
        action,
        resource_type,
        resource_id,
        details,
        ip_address,
        user_agent
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        adminUserId,
        userId,
        actorType,
        actorIdentifier,
        actorRole,
        action,
        resourceType,
        resourceId !== null && resourceId !== undefined ? String(resourceId) : null,
        JSON.stringify(sanitizeForAudit(details)),
        req ? getClientIp(req) : null,
        req?.headers["user-agent"] || null,
      ]
    );
  } catch (err) {
    console.error("[AUDIT LOG ERROR]", err.message);
  }
}

module.exports = {
  getAdminActor,
  getUserActor,
  sanitizeForAudit,
  writeAuditLog,
};
