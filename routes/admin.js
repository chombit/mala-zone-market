/**
 * routes/admin.js
 * Malazone.com — Elite Admin Controller API
 * Secure operations for property verification and agent payouts
 * © 2026 Malazone Technologies PLC
 */

"use strict";

const express = require("express");
const multer = require("multer");
const db = require("../database/db");
const bcrypt = require("bcrypt");
const rateLimit = require("express-rate-limit");
const {
  sanitizeAdminUser,
  issueAdminToken,
  setAdminAuthCookie,
  clearAdminAuthCookie,
  requireAdminAuth,
  requireAdminRoles,
} = require("../middleware/adminAuth");
const { getAdminActor, sanitizeForAudit, writeAuditLog } = require("../utils/auditLogger");
const { createNotification } = require("../utils/notify");
const { broadcastListingChange } = require("../utils/listingRealtime");
const router = express.Router();

// ── Brute-force protection for the admin login endpoint
const adminLoginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 10, // 10 attempts per window per IP
  standardHeaders: true,
  legacyHeaders: false,
  message: { success: false, message: "Too many login attempts. Try again later." },
});

// ── Shared image pipeline (sharp → WebP → optional watermark)
const { processImage } = require("../utils/imageProcessor");

const storage = multer.memoryStorage();
const upload = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024, files: 4 },
});

async function getListingSnapshot(id) {
  const [[listing]] = await db.execute("SELECT * FROM listings WHERE id = ?", [id]);
  return listing || null;
}

async function getAdminUserSnapshot(id) {
  const [[adminUser]] = await db.execute(
    "SELECT id, username, full_name, role, is_active, last_login, created_at FROM admin_users WHERE id = ?",
    [id]
  );
  return adminUser || null;
}

async function getTranslationSnapshot(id) {
  const [[translation]] = await db.execute("SELECT * FROM translations WHERE id = ?", [id]);
  return translation || null;
}

function parseAuditDetails(details) {
  if (!details) {
    return null;
  }

  if (typeof details === "string") {
    try {
      return JSON.parse(details);
    } catch (err) {
      return { raw: details };
    }
  }

  return details;
}

function normalizeAuditDateBoundary(value, boundary) {
  if (!value) {
    return "";
  }

  if (/^\d{4}-\d{2}-\d{2}$/.test(value)) {
    return boundary === "end" ? `${value} 23:59:59` : `${value} 00:00:00`;
  }

  return value;
}

function buildAuditFilters(query) {
  const {
    actorType = "",
    actorRole = "",
    action = "",
    resourceType = "",
    q = "",
    startDate = "",
    endDate = "",
  } = query;

  const filters = [];
  const params = [];

  if (actorType) {
    filters.push("al.actor_type = ?");
    params.push(actorType);
  }

  if (actorRole) {
    filters.push("al.actor_role = ?");
    params.push(actorRole);
  }

  if (action) {
    filters.push("al.action = ?");
    params.push(action);
  }

  if (resourceType) {
    filters.push("al.resource_type = ?");
    params.push(resourceType);
  }

  if (q) {
    filters.push(`(
      al.actor_identifier LIKE ?
      OR al.action LIKE ?
      OR al.resource_type LIKE ?
      OR al.resource_id LIKE ?
    )`);
    const queryValue = `%${q}%`;
    params.push(queryValue, queryValue, queryValue, queryValue);
  }

  if (startDate) {
    filters.push("al.created_at >= ?");
    params.push(normalizeAuditDateBoundary(startDate, "start"));
  }

  if (endDate) {
    filters.push("al.created_at <= ?");
    params.push(normalizeAuditDateBoundary(endDate, "end"));
  }

  return {
    whereClause: filters.length > 0 ? `WHERE ${filters.join(" AND ")}` : "",
    params,
  };
}

function escapeCsvValue(value) {
  if (value === null || value === undefined) {
    return "";
  }

  const normalized = typeof value === "string" ? value : JSON.stringify(value);
  return `"${normalized.replace(/"/g, "\"\"")}"`;
}

/**
 * POST /api/admin/login
 * Authenticate admin user against database
 */
router.post("/login", adminLoginLimiter, async (req, res) => {
  try {
    const { username, password } = req.body;

    if (!username || !password) {
      return res.status(400).json({ success: false, message: "Username and password required" });
    }

    // 1. Find admin user in database
    const [[admin]] = await db.execute(
      "SELECT * FROM admin_users WHERE username = ? AND is_active = 1",
      [username]
    );

    if (!admin) {
      await writeAuditLog({
        req,
        actorType: "anonymous",
        actorIdentifier: username,
        action: "admin_login_failed",
        resourceType: "admin_session",
        details: { reason: "username_not_found" },
      });
      return res.status(401).json({ success: false, message: "Invalid credentials" });
    }

    // 2. Verify password
    const isMatch = await bcrypt.compare(password, admin.password_hash);

    if (!isMatch) {
      await writeAuditLog({
        req,
        actorType: "anonymous",
        actorIdentifier: username,
        action: "admin_login_failed",
        resourceType: "admin_session",
        resourceId: admin.id,
        details: { reason: "invalid_password" },
      });
      return res.status(401).json({ success: false, message: "Invalid credentials" });
    }

    // 3. Update last login time
    await db.execute(
      "UPDATE admin_users SET last_login = CURRENT_TIMESTAMP WHERE id = ?",
      [admin.id]
    );

    const token = issueAdminToken(admin);
    setAdminAuthCookie(res, token);

    // 4. Return admin data (don't send password hash!)
    res.json({
      success: true,
      user: sanitizeAdminUser({
        ...admin,
        last_login: new Date().toISOString(),
      }),
    });

    await writeAuditLog({
      req,
      ...getAdminActor({ adminUser: admin }),
      action: "admin_login_success",
      resourceType: "admin_session",
      resourceId: admin.id,
      details: { username: admin.username },
    });

  } catch (err) {
    console.error("[ADMIN LOGIN ERROR]", err);
    res.status(500).json({ success: false, message: "Internal Server Error" });
  }
});

router.post("/logout", requireAdminAuth, async (req, res) => {
  await writeAuditLog({
    req,
    ...getAdminActor(req),
    action: "admin_logout",
    resourceType: "admin_session",
    resourceId: req.adminUser.id,
  });
  clearAdminAuthCookie(res);
  res.json({ success: true, message: "Admin logged out successfully" });
});

router.use(requireAdminAuth);

router.get("/me", (req, res) => {
  res.json({
    success: true,
    user: req.adminUser,
  });
});

router.get("/audit-logs", requireAdminRoles("super_admin"), async (req, res) => {
  try {
    const {
      page = "1",
      limit = "25",
      format = "",
    } = req.query;

    const pageNumber = Math.max(parseInt(page, 10) || 1, 1);
    const pageSize = Math.min(Math.max(parseInt(limit, 10) || 25, 1), 100);
    const offset = (pageNumber - 1) * pageSize;
    const { whereClause, params } = buildAuditFilters(req.query);

    const [[totals]] = await db.execute(
      `SELECT
         COUNT(*) AS total,
         COUNT(DISTINCT al.action) AS action_count,
         COUNT(DISTINCT al.resource_type) AS resource_count
       FROM audit_logs al
       ${whereClause}`,
      params
    );

    if (format === "csv") {
      const exportLimit = Math.min(Math.max(parseInt(limit, 10) || 500, 1), 2000);
      const [exportRows] = await db.execute(
        `SELECT
           al.id,
           al.actor_type,
           al.actor_identifier,
           al.actor_role,
           al.action,
           al.resource_type,
           al.resource_id,
           al.details,
           al.ip_address,
           al.user_agent,
           al.created_at,
           au.full_name AS admin_full_name,
           au.username AS admin_username,
           u.full_name AS user_full_name,
           u.email AS user_email
         FROM audit_logs al
         LEFT JOIN admin_users au ON al.admin_user_id = au.id
         LEFT JOIN users u ON al.user_id = u.id
         ${whereClause}
         ORDER BY al.created_at DESC, al.id DESC
         LIMIT ?`,
        [...params, exportLimit]
      );

      const header = [
        "id",
        "created_at",
        "actor_type",
        "actor_identifier",
        "actor_role",
        "admin_full_name",
        "admin_username",
        "user_full_name",
        "user_email",
        "action",
        "resource_type",
        "resource_id",
        "ip_address",
        "user_agent",
        "details",
      ];

      const lines = exportRows.map((row) =>
        [
          row.id,
          row.created_at,
          row.actor_type,
          row.actor_identifier,
          row.actor_role,
          row.admin_full_name,
          row.admin_username,
          row.user_full_name,
          row.user_email,
          row.action,
          row.resource_type,
          row.resource_id,
          row.ip_address,
          row.user_agent,
          parseAuditDetails(row.details),
        ]
          .map((value) => escapeCsvValue(value))
          .join(",")
      );

      res.setHeader("Content-Type", "text/csv; charset=utf-8");
      res.setHeader("Content-Disposition", `attachment; filename="audit-logs-${Date.now()}.csv"`);
      return res.status(200).send([header.join(","), ...lines].join("\n"));
    }

    const [logs] = await db.execute(
      `SELECT
         al.id,
         al.actor_type,
         al.actor_identifier,
         al.actor_role,
         al.action,
         al.resource_type,
         al.resource_id,
         al.details,
         al.ip_address,
         al.user_agent,
         al.created_at,
         au.full_name AS admin_full_name,
         au.username AS admin_username,
         u.full_name AS user_full_name,
         u.email AS user_email
       FROM audit_logs al
       LEFT JOIN admin_users au ON al.admin_user_id = au.id
       LEFT JOIN users u ON al.user_id = u.id
       ${whereClause}
       ORDER BY al.created_at DESC, al.id DESC
       LIMIT ? OFFSET ?`,
      [...params, pageSize, offset]
    );

    const [actionRows] = await db.execute(
      `SELECT al.action, COUNT(*) AS total
       FROM audit_logs al
       ${whereClause}
       GROUP BY al.action
       ORDER BY total DESC, al.action ASC
       LIMIT 10`,
      params
    );

    const [actorRoleRows] = await db.execute(
      `SELECT COALESCE(al.actor_role, 'unknown') AS actor_role, COUNT(*) AS total
       FROM audit_logs al
       ${whereClause}
       GROUP BY COALESCE(al.actor_role, 'unknown')
       ORDER BY total DESC, actor_role ASC`,
      params
    );

    res.json({
      success: true,
      logs: logs.map((log) => ({
        ...log,
        details: parseAuditDetails(log.details),
      })),
      pagination: {
        page: pageNumber,
        limit: pageSize,
        total: totals.total,
        totalPages: Math.max(Math.ceil(totals.total / pageSize), 1),
      },
      summary: {
        total: totals.total,
        actionCount: totals.action_count,
        resourceCount: totals.resource_count,
        topActions: actionRows,
        actorRoles: actorRoleRows,
      },
    });
  } catch (err) {
    console.error("[ADMIN AUDIT LOGS ERROR]", err);
    res.status(500).json({ success: false, message: "Internal Server Error" });
  }
});

/**
 * POST /api/admin/payout-agent
 * Manual agent balance ADJUSTMENT (super_admin only).
 *
 * SECURITY NOTE: this endpoint previously credited agents 100 ETB per active
 * listing with no ledger entry and called it a TeleBirr payout — free money
 * for anyone with an admin session. It is now a strict adjustment tool: every
 * change writes a matching `agent_earnings` ledger row in the same transaction
 * so the invariant counter_balance == ledger_earned - reserved_out holds.
 */
router.post("/payout-agent", requireAdminRoles("super_admin"), async (req, res) => {
  try {
    const { agent_id } = req.body;
    const amount = Number(req.body.amount_etb);
    const reason = String(req.body.reason || "").trim();

    if (!agent_id) {
      return res.status(400).json({ success: false, message: "agent_id required" });
    }
    if (!Number.isFinite(amount) || amount === 0 || Math.abs(amount) > 1000000) {
      return res.status(422).json({ success: false, message: "amount_etb must be a non-zero number within ±1,000,000" });
    }
    if (!reason) {
      return res.status(422).json({ success: false, message: "A written reason is required for manual adjustments" });
    }

    const transactionId = await db.transaction(async (conn) => {
      const [[agent]] = await conn.execute(
        `SELECT a.id, a.earnings_total_etb, u.phone_number
         FROM agents a JOIN users u ON a.user_id = u.id
         WHERE a.id = ? FOR UPDATE`,
        [agent_id]
      );
      if (!agent) {
        const err = new Error("Agent not found");
        err.statusCode = 404;
        throw err;
      }

      if (amount < 0 && Number(agent.earnings_total_etb) + amount < 0) {
        const err = new Error("Adjustment would drive the balance below zero");
        err.statusCode = 422;
        throw err;
      }

      await conn.execute(
        "UPDATE agents SET earnings_total_etb = earnings_total_etb + ? WHERE id = ?",
        [amount, agent_id]
      );

      const [ledger] = await conn.execute(
        `INSERT INTO agent_earnings (agent_id, listing_id, amount_etb, transaction_type, status)
         VALUES (?, NULL, ?, 'manual_adjustment', 'paid')`,
        [agent_id, amount]
      );

      return `MALA-ADJ-${ledger.insertId}`;
    });

    await writeAuditLog({
      req,
      ...getAdminActor(req),
      action: "agent_balance_manual_adjustment",
      resourceType: "agent",
      resourceId: agent_id,
      details: { amount_etb: amount, reason },
    });

    res.json({
      success: true,
      message: `Balance adjusted by ${amount.toLocaleString()} ETB`,
      transaction_id: transactionId,
    });
  } catch (err) {
    if (err.statusCode) {
      return res.status(err.statusCode).json({ success: false, message: err.message });
    }
    console.error("[ADMIN PAYOUT ERROR]", err);
    res.status(500).json({ success: false, message: "Internal Server Error" });
  }
});

/**
 * GET /api/admin/payouts/reconcile
 * Ledger vs counter drift report (super_admin only).
 *
 * Invariant: earnings_total_etb == SUM(agent_earnings.amount_etb)
 *                              - SUM(payout_requests WHERE status IN pending/approved/paid)
 * Lists every agent violating the invariant plus portfolio totals.
 */
router.get("/payouts/reconcile", requireAdminRoles("super_admin"), async (req, res) => {
  try {
    const [drift] = await db.execute(`
      SELECT a.id AS agent_id, u.full_name, u.phone_number,
             ROUND(a.earnings_total_etb, 2) AS counter_balance,
             ROUND(COALESCE(e.earned_total, 0), 2) AS ledger_earned,
             ROUND(COALESCE(r.reserved_out, 0), 2) AS reserved_or_paid_out,
             ROUND(COALESCE(e.earned_total, 0) - COALESCE(r.reserved_out, 0), 2) AS expected_balance,
             ROUND(a.earnings_total_etb - (COALESCE(e.earned_total, 0) - COALESCE(r.reserved_out, 0)), 2) AS delta
      FROM agents a
      JOIN users u ON a.user_id = u.id
      LEFT JOIN (
        SELECT agent_id, SUM(amount_etb) AS earned_total
        FROM agent_earnings GROUP BY agent_id
      ) e ON e.agent_id = a.id
      LEFT JOIN (
        SELECT agent_id, SUM(amount_etb) AS reserved_out
        FROM agent_payout_requests
        WHERE status IN ('pending','approved','paid')
        GROUP BY agent_id
      ) r ON r.agent_id = a.id
      HAVING ABS(delta) > 0.01
      ORDER BY ABS(delta) DESC
    `);

    const [[totals]] = await db.execute(`
      SELECT
        (SELECT COALESCE(SUM(amount_etb),0) FROM agent_earnings) AS total_ever_credited,
        (SELECT COALESCE(SUM(amount_etb),0) FROM agent_payout_requests WHERE status='paid') AS total_paid_out,
        (SELECT COALESCE(SUM(amount_etb),0) FROM agent_payout_requests WHERE status IN ('pending','approved')) AS total_reserved_open,
        (SELECT COALESCE(SUM(earnings_total_etb),0) FROM agents) AS sum_of_counters
    `);

    res.json({
      success: true,
      data: {
        healthy: drift.length === 0,
        drifting_agents: drift,
        totals: {
          total_ever_credited: Number(totals.total_ever_credited),
          total_paid_out: Number(totals.total_paid_out),
          total_reserved_open: Number(totals.total_reserved_open),
          sum_of_counters: Number(totals.sum_of_counters),
        },
      },
    });
  } catch (err) {
    console.error("[GET /admin/payouts/reconcile]", err);
    res.status(500).json({ success: false, message: "Reconciliation failed" });
  }
});

/**
 * POST /api/admin/payouts/reconcile/repair
 * Resets drifted counters back to the ledger-derived value (super_admin only).
 * Body: {} for all drifting agents or { agent_id } for one.
 */
router.post("/payouts/reconcile/repair", requireAdminRoles("super_admin"), async (req, res) => {
  try {
    const result = await db.transaction(async (conn) => {
      if (req.body.agent_id) {
        const [r] = await conn.execute(`
          UPDATE agents a
          SET a.earnings_total_etb = (
            SELECT COALESCE((SELECT SUM(amount_etb) FROM agent_earnings WHERE agent_id = a.id), 0)
                 - COALESCE((SELECT SUM(amount_etb) FROM agent_payout_requests
                             WHERE agent_id = a.id AND status IN ('pending','approved','paid')), 0)
          )
          WHERE a.id = ?`,
          [req.body.agent_id]
        );
        return r.affectedRows;
      }
      const [r] = await conn.execute(`
        UPDATE agents a
        SET a.earnings_total_etb = (
          SELECT COALESCE((SELECT SUM(amount_etb) FROM agent_earnings WHERE agent_id = a.id), 0)
               - COALESCE((SELECT SUM(amount_etb) FROM agent_payout_requests
                           WHERE agent_id = a.id AND status IN ('pending','approved','paid')), 0)
        )`
      );
      return r.affectedRows;
    });

    await writeAuditLog({
      req,
      ...getAdminActor(req),
      action: "payout_reconciliation_repair",
      resourceType: "agent",
      resourceId: req.body.agent_id || null,
      details: { agents_repaired: result },
    });

    res.json({ success: true, message: `Repaired ${result} agent counter(s)` });
  } catch (err) {
    console.error("[POST /admin/payouts/reconcile/repair]", err);
    res.status(500).json({ success: false, message: "Repair failed" });
  }
});

/**
 * PATCH /api/admin/verify-listing/:id
 * Property Verification State Update
 */
router.patch("/verify-listing/:id", requireAdminRoles("super_admin", "admin"), async (req, res) => {
  try {
    const { id } = req.params;
    const { is_verified } = req.body;
    const before = await getListingSnapshot(id);

    if (!before) {
      return res.status(404).json({ success: false, message: "Listing not found" });
    }

    const [result] = await db.execute(
      "UPDATE listings SET is_verified = ? WHERE id = ?",
      [is_verified ? 1 : 0, id]
    );

    const after = await getListingSnapshot(id);

    res.json({
      success: true,
      message: is_verified ? "Listing Verified" : "Listing Verification Removed"
    });

    // Real-time availability: verification badge changes propagate live
    broadcastListingChange(req.app.get("io"), {
      action: "updated",
      id: Number(id),
      is_active: before.is_active,
      category: before.category,
      location_key: before.location_key || null,
    });

    await writeAuditLog({
      req,
      ...getAdminActor(req),
      action: is_verified ? "listing_verified" : "listing_verification_removed",
      resourceType: "listing",
      resourceId: id,
      details: {
        before: sanitizeForAudit(before),
        after: sanitizeForAudit(after),
      },
    });

  } catch (err) {
    console.error("[ADMIN VERIFY ERROR]", err);
    res.status(500).json({ success: false, message: "Internal Server Error" });
  }
});

/**
 * GET /api/admin/analytics
 * High-level data for Admin Dashboard
 */
router.get("/analytics", requireAdminRoles("super_admin", "admin"), async (req, res) => {
  try {
    const [[{ total_revenue }]] = await db.execute("SELECT SUM(price) as total_revenue FROM listings WHERE is_active = 1");
    const [[{ pending_count }]] = await db.execute("SELECT COUNT(*) as pending_count FROM listings WHERE is_verified = 0");
    const [[{ agent_count }]] = await db.execute("SELECT COUNT(*) as agent_count FROM agents WHERE status = 'active'");

    res.json({
      success: true,
      data: {
        revenue: total_revenue || 0,
        pending: pending_count || 0,
        agents: agent_count || 0,
        trades: Math.floor((total_revenue || 0) / 10000) // Simulated trade count
      }
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

/**
 * POST /api/admin/listings
 * Add a new listing directly from Admin
 */
router.post("/listings", requireAdminRoles("super_admin", "admin"), upload.array("images", 4), async (req, res) => {
  try {
    const {
      title_en, title_am, description_en, description_am,
      category, price, price_suffix, phone, whatsapp, location_key,
      is_premium, is_verified, existing_images,
      // Zone specific
      sub_category, is_furnished, is_parking_available, vehicle_brand, manufacture_year,
      plate_code, fuel_type, condition_type, 
      area_sqm, capacity, with_operator, is_zero_km,
      bedrooms, bathrooms, title_deed
    } = req.body;

    let imageUrls = [];
    if (req.files && req.files.length > 0) {
      imageUrls = await Promise.all(req.files.map(f => processImage(f.buffer, { watermark: { name: req.adminUser?.full_name || "" } })));
    }
    if (existing_images) {
      try {
        const parsed = JSON.parse(existing_images);
        if (Array.isArray(parsed)) imageUrls = [...parsed, ...imageUrls];
      } catch {}
    }
    if (imageUrls.length === 0) {
      imageUrls = ["https://images.unsplash.com/photo-1560518883-ce09059eeffa?w=800&q=80&fm=webp"];
    }
    imageUrls = imageUrls.slice(0, 4);

    // Use system admin user (id: 1) as default for admin posts
    const user_id = 1; 

    const [result] = await db.execute(
      `INSERT INTO listings (
        user_id, title_en, title_am, description_en, description_am,
        category, sub_category, price, price_suffix, phone, whatsapp, location_key,
        location_label_en, location_label_am,
        is_premium, is_verified, images,
        vehicle_brand, manufacture_year, plate_code, fuel_type, condition_type,
        area_sqm, capacity, with_operator, is_zero_km,
        bedrooms, bathrooms, is_furnished, is_parking_available, title_deed
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        user_id, title_en, title_am, description_en, description_am,
        category, sub_category || null, price, price_suffix || 'fixed', phone, whatsapp, location_key,
        "Hawassa, Ethiopia", "ሐዋሳ፣ ኢትዮጵያ",
        is_premium ? 1 : 0, is_verified ? 1 : 0,
        JSON.stringify(imageUrls),
        vehicle_brand || null, manufacture_year || null, plate_code || null, fuel_type || null, condition_type || null,
        area_sqm || null, capacity || null, with_operator ? 1 : 0, is_zero_km ? 1 : 0,
        bedrooms || null, bathrooms || null, is_furnished ? 1 : 0, is_parking_available ? 1 : 0, title_deed || null
      ]
    );

    res.json({ success: true, id: result.insertId });

    // Real-time availability: admin-created listings appear live
    broadcastListingChange(req.app.get("io"), {
      action: "created",
      id: result.insertId,
      is_active: true,
      category,
      location_key: location_key || null,
    });

    const createdListing = await getListingSnapshot(result.insertId);
    await writeAuditLog({
      req,
      ...getAdminActor(req),
      action: "listing_created_by_admin",
      resourceType: "listing",
      resourceId: result.insertId,
      details: {
        after: sanitizeForAudit(createdListing),
      },
    });
  } catch (err) {
    console.error("[ADMIN ADD LISTING ERROR]", err);
    res.status(500).json({ success: false, message: err.message });
  }
});

/**
 * PUT /api/admin/listings/:id
 * Edit an existing listing from Admin
 */
router.put("/listings/:id", requireAdminRoles("super_admin", "admin"), upload.array("images", 4), async (req, res) => {
  try {
    const { id } = req.params;
    const before = await getListingSnapshot(id);

    if (!before) {
      return res.status(404).json({ success: false, message: "Listing not found" });
    }

    const {
      title_en, title_am, description_en, description_am,
      category, price, price_suffix, phone, whatsapp, location_key,
      is_premium, is_verified, is_active, existing_images,
      // Zone specific
      sub_category, is_furnished, is_parking_available, vehicle_brand, manufacture_year,
      plate_code, fuel_type, condition_type, 
      area_sqm, capacity, with_operator, is_zero_km,
      bedrooms, bathrooms, title_deed
    } = req.body;

    let imageUrls = [];
    if (req.files && req.files.length > 0) {
      imageUrls = await Promise.all(req.files.map(f => processImage(f.buffer, { watermark: { name: req.adminUser?.full_name || "" } })));
    }
    if (existing_images) {
      try {
        const parsed = JSON.parse(existing_images);
        if (Array.isArray(parsed)) imageUrls = [...parsed, ...imageUrls];
      } catch {}
    }
    if (imageUrls.length === 0) {
      const beforeImages = before.images ? (typeof before.images === 'string' ? JSON.parse(before.images) : before.images) : [];
      imageUrls = beforeImages.length > 0 ? beforeImages : ["https://images.unsplash.com/photo-1560518883-ce09059eeffa?w=800&q=80&fm=webp"];
    }
    imageUrls = imageUrls.slice(0, 4);

    const [result] = await db.execute(
      `UPDATE listings SET 
        title_en = ?, title_am = ?, description_en = ?, description_am = ?,
        category = ?, sub_category = ?, price = ?, price_suffix = ?, phone = ?, whatsapp = ?, location_key = ?,
        is_premium = ?, is_verified = ?, is_active = ?, images = ?,
        vehicle_brand = ?, manufacture_year = ?, plate_code = ?, fuel_type = ?, condition_type = ?,
        area_sqm = ?, capacity = ?, with_operator = ?, is_zero_km = ?,
        bedrooms = ?, bathrooms = ?, is_furnished = ?, is_parking_available = ?, title_deed = ?
      WHERE id = ?`,
      [
        title_en, title_am, description_en, description_am,
        category, sub_category || null, price, price_suffix || 'fixed', phone, whatsapp, location_key,
        is_premium ? 1 : 0, is_verified ? 1 : 0, is_active ? 1 : 0,
        JSON.stringify(imageUrls),
        vehicle_brand || null, manufacture_year || null, plate_code || null, fuel_type || null, condition_type || null,
        area_sqm || null, capacity || null, with_operator ? 1 : 0, is_zero_km ? 1 : 0,
        bedrooms || null, bathrooms || null, is_furnished ? 1 : 0, is_parking_available ? 1 : 0, title_deed || null,
        id
      ]
    );

    const after = await getListingSnapshot(id);

    res.json({ success: true, message: "Listing updated" });

    // Real-time availability: admin edits propagate live
    broadcastListingChange(req.app.get("io"), {
      action: "updated",
      id: Number(id),
      is_active: is_active ? 1 : 0,
      category,
      location_key: location_key || null,
    });

    await writeAuditLog({
      req,
      ...getAdminActor(req),
      action: "listing_updated_by_admin",
      resourceType: "listing",
      resourceId: id,
      details: {
        before: sanitizeForAudit(before),
        after: sanitizeForAudit(after),
      },
    });
  } catch (err) {
    console.error("[ADMIN EDIT LISTING ERROR]", err);
    res.status(500).json({ success: false, message: err.message });
  }
});

/**
 * DELETE /api/admin/listings/:id
 * Remove a listing from Admin
 */
router.delete("/listings/:id", requireAdminRoles("super_admin", "admin"), async (req, res) => {
  try {
    const { id } = req.params;
    const before = await getListingSnapshot(id);

    if (!before) {
      return res.status(404).json({ success: false, message: "Listing not found" });
    }

    const [result] = await db.execute("DELETE FROM listings WHERE id = ?", [id]);

    res.json({ success: true, message: "Listing deleted" });

    // Real-time availability: admin-deleted listings vanish live
    broadcastListingChange(req.app.get("io"), {
      action: "deleted",
      id: Number(id),
      is_active: false,
    });

    await writeAuditLog({
      req,
      ...getAdminActor(req),
      action: "listing_deleted_by_admin",
      resourceType: "listing",
      resourceId: id,
      details: {
        deleted_record: sanitizeForAudit(before),
      },
    });
  } catch (err) {
    console.error("[ADMIN DELETE LISTING ERROR]", err);
    res.status(500).json({ success: false, message: err.message });
  }
});

/**
 * GET /api/admin/jurisdictions
 * Get available cities and sub-cities for admin jurisdiction assignment
 */
router.get("/jurisdictions", requireAdminAuth, async (req, res) => {
  try {
    const [locations] = await db.execute(
      "SELECT id, key_name, label_en, label_am, sub_zones FROM locations WHERE is_active = 1 ORDER BY display_order"
    );
    
    // Format the response with proper sub_zones parsing
    const jurisdictions = locations.map(loc => ({
      id: loc.id,
      key: loc.key_name,
      label_en: loc.label_en,
      label_am: loc.label_am,
      sub_zones: loc.sub_zones ? JSON.parse(loc.sub_zones) : []
    }));
    
    res.json({ success: true, jurisdictions });
  } catch (err) {
    console.error("[ADMIN GET JURISDICTIONS ERROR]", err);
    res.status(500).json({ success: false, message: "Internal Server Error" });
  }
});

/**
 * GET /api/admin/users
 * Get all admin users (Super Admin only)
 */
router.get("/users", requireAdminRoles("super_admin"), async (req, res) => {
  try {
    const [users] = await db.execute(
      "SELECT id, username, full_name, role, city, sub_cities, is_active, last_login, created_at FROM admin_users"
    );
    
    // Parse sub_cities JSON for each user
    const formattedUsers = users.map(user => ({
      ...user,
      sub_cities: user.sub_cities ? (typeof user.sub_cities === 'string' ? JSON.parse(user.sub_cities) : user.sub_cities) : null
    }));
    
    res.json({ success: true, users: formattedUsers });
  } catch (err) {
    console.error("[ADMIN GET USERS ERROR]", err);
    res.status(500).json({ success: false, message: "Internal Server Error" });
  }
});

/**
 * POST /api/admin/users
 * Create new admin user (Super Admin only)
 */
router.post("/users", requireAdminRoles("super_admin"), async (req, res) => {
  try {
    const { username, password, full_name, role, city, sub_cities } = req.body;
    
    // Validate required fields
    if (!username || !password || !full_name) {
      return res.status(400).json({ success: false, message: "Username, password, and full name are required" });
    }

    // For g2b roles (muni_officer, trans_officer), city is required
    const isG2BRole = role === "g2b_municipality" || role === "g2b_transport";
    if (isG2BRole && !city) {
      return res.status(400).json({ success: false, message: "City is required for municipality/transport officers" });
    }

    // Hash password
    const SALT_ROUNDS = 12;
    const password_hash = await bcrypt.hash(password, SALT_ROUNDS);

    // Insert new admin user with city and sub_cities
    const [result] = await db.execute(
      "INSERT INTO admin_users (username, password_hash, full_name, role, city, sub_cities, is_active) VALUES (?, ?, ?, ?, ?, ?, true)",
      [username, password_hash, full_name, role || "admin", city || null, sub_cities ? JSON.stringify(sub_cities) : null]
    );

    res.json({ success: true, id: result.insertId, message: "Admin user created successfully" });

    const createdUser = await getAdminUserSnapshot(result.insertId);
    await writeAuditLog({
      req,
      ...getAdminActor(req),
      action: "admin_user_created",
      resourceType: "admin_user",
      resourceId: result.insertId,
      details: {
        after: sanitizeForAudit(createdUser),
      },
    });
  } catch (err) {
    if (err.code === "ER_DUP_ENTRY") {
      return res.status(409).json({ success: false, message: "Username already exists" });
    }
    console.error("[ADMIN CREATE USER ERROR]", err);
    res.status(500).json({ success: false, message: "Internal Server Error" });
  }
});

/**
 * PUT /api/admin/users/:id
 * Update admin user (Super Admin only)
 */
router.put("/users/:id", requireAdminRoles("super_admin"), async (req, res) => {
  try {
    const { id } = req.params;
    const { username, full_name, role, is_active, password, city, sub_cities } = req.body;
    const before = await getAdminUserSnapshot(id);

    if (!before) {
      return res.status(404).json({ success: false, message: "Admin user not found" });
    }

    // Build update query
    const updates = [];
    const values = [];

    if (username) { updates.push("username = ?"); values.push(username); }
    if (full_name) { updates.push("full_name = ?"); values.push(full_name); }
    if (role) { updates.push("role = ?"); values.push(role); }
    if (typeof is_active !== "undefined") { updates.push("is_active = ?"); values.push(is_active); }
    if (typeof city !== "undefined") { updates.push("city = ?"); values.push(city || null); }
    if (typeof sub_cities !== "undefined") { 
      updates.push("sub_cities = ?"); 
      values.push(sub_cities ? JSON.stringify(sub_cities) : null); 
    }
    if (password) {
      const SALT_ROUNDS = 12;
      const password_hash = await bcrypt.hash(password, SALT_ROUNDS);
      updates.push("password_hash = ?");
      values.push(password_hash);
    }

    if (updates.length === 0) {
      return res.status(400).json({ success: false, message: "No fields to update" });
    }

    values.push(id);

    const [result] = await db.execute(
      `UPDATE admin_users SET ${updates.join(", ")} WHERE id = ?`,
      values
    );

    const after = await getAdminUserSnapshot(id);

    res.json({ success: true, message: "Admin user updated successfully" });

    await writeAuditLog({
      req,
      ...getAdminActor(req),
      action: "admin_user_updated",
      resourceType: "admin_user",
      resourceId: id,
      details: {
        before: sanitizeForAudit(before),
        after: sanitizeForAudit(after),
      },
    });
  } catch (err) {
    console.error("[ADMIN UPDATE USER ERROR]", err);
    res.status(500).json({ success: false, message: "Internal Server Error" });
  }
});

/**
 * DELETE /api/admin/users/:id
 * Delete admin user (Super Admin only)
 */
router.delete("/users/:id", requireAdminRoles("super_admin"), async (req, res) => {
  try {
    const { id } = req.params;
    const before = await getAdminUserSnapshot(id);

    if (!before) {
      return res.status(404).json({ success: false, message: "Admin user not found" });
    }

    const [result] = await db.execute("DELETE FROM admin_users WHERE id = ?", [id]);

    res.json({ success: true, message: "Admin user deleted successfully" });

    await writeAuditLog({
      req,
      ...getAdminActor(req),
      action: "admin_user_deleted",
      resourceType: "admin_user",
      resourceId: id,
      details: {
        deleted_record: sanitizeForAudit(before),
      },
    });
  } catch (err) {
    console.error("[ADMIN DELETE USER ERROR]", err);
    res.status(500).json({ success: false, message: "Internal Server Error" });
  }
});

// ──────────────────────────────────────────────────────────────
// SELLER / STOREFRONT MANAGEMENT (Super Admin + Admin)
// ──────────────────────────────────────────────────────────────

// GET /api/admin/sellers — list seller accounts with portfolio stats.
// Filters: status (store|casual), q (name/phone/email), featured (0|1).
router.get("/sellers", requireAdminRoles("super_admin", "admin"), async (req, res) => {
  try {
    const { status = "", q = "", featured = "" } = req.query;

    const where = ["u.account_type != 'Agent'"];
    const params = [];

    if (status === "store" || status === "casual") {
      where.push("u.seller_status = ?");
      params.push(status);
    }
    if (featured === "1" || featured === "0") {
      where.push("u.is_featured_seller = ?");
      params.push(Number(featured));
    }
    if (q) {
      where.push("(u.full_name LIKE ? OR u.phone_number LIKE ? OR u.email LIKE ?)");
      const like = `%${q}%`;
      params.push(like, like, like);
    }

    const [rows] = await db.execute(
      `SELECT u.id, u.full_name, u.phone_number, u.email, u.seller_status,
              u.is_featured_seller, u.is_verified, u.created_at,
              (SELECT COUNT(*) FROM listings l WHERE l.user_id = u.id) AS listing_count,
              (SELECT COUNT(*) FROM listings l WHERE l.user_id = u.id AND l.status = 'active') AS active_listings,
              (SELECT COUNT(*) FROM listings l WHERE l.user_id = u.id AND l.status = 'sold') AS sold_listings,
              COALESCE((SELECT ROUND(AVG(r.rating), 1) FROM ratings r WHERE r.seller_id = u.id), 0) AS avg_rating,
              (SELECT COUNT(*) FROM ratings r WHERE r.seller_id = u.id) AS review_count,
              (SELECT COALESCE(SUM(l.view_count), 0) FROM listings l WHERE l.user_id = u.id) AS total_views
       FROM users u
       WHERE ${where.join(" AND ")}
       ORDER BY u.created_at DESC
       LIMIT 300`,
      params
    );

    res.json({
      success: true,
      data: rows.map((r) => ({
        ...r,
        is_featured_seller: Boolean(r.is_featured_seller),
        is_verified: Boolean(r.is_verified),
        listing_count: Number(r.listing_count),
        active_listings: Number(r.active_listings),
        sold_listings: Number(r.sold_listings),
        avg_rating: Number(r.avg_rating),
        review_count: Number(r.review_count),
        total_views: Number(r.total_views),
      })),
    });
  } catch (err) {
    console.error("[GET /admin/sellers]", err);
    res.status(500).json({ success: false, message: "Failed to list sellers" });
  }
});

// PATCH /api/admin/sellers/:id — update seller profile flags.
// Body: { seller_status?: 'casual'|'store', is_featured_seller?: boolean }
router.patch("/sellers/:id", requireAdminRoles("super_admin", "admin"), async (req, res) => {
  try {
    const userId = Number(req.params.id);
    const { seller_status, is_featured_seller } = req.body;

    const updates = [];
    const params = [];

    if (seller_status === "store" || seller_status === "casual") {
      updates.push("seller_status = ?");
      params.push(seller_status);
    }

    if (typeof is_featured_seller === "boolean") {
      updates.push("is_featured_seller = ?");
      params.push(is_featured_seller ? 1 : 0);
    }

    if (updates.length === 0) {
      return res.status(400).json({ success: false, message: "No supported fields provided" });
    }

    params.push(userId);
    const [result] = await db.execute(
      `UPDATE users SET ${updates.join(", ")} WHERE id = ? AND account_type != 'Agent'`,
      params
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({ success: false, message: "Seller not found" });
    }

    await writeAuditLog({
      req,
      ...getAdminActor(req),
      action: "seller_update",
      resourceType: "users",
      resourceId: userId,
      details: { seller_status, is_featured_seller },
    });

    const [[updated]] = await db.execute(
      "SELECT id, full_name, seller_status, is_featured_seller FROM users WHERE id = ?",
      [userId]
    );

    res.json({ success: true, data: updated });
  } catch (err) {
    console.error("[PATCH /admin/sellers/:id]", err);
    res.status(500).json({ success: false, message: "Failed to update seller" });
  }
});

// ──────────────────────────────────────────────────────────────
// TRANSLATIONS MANAGEMENT (Super Admin Only)
// ──────────────────────────────────────────────────────────────

// In a real application, you would add a middleware here to check
// if req.user.role === 'super_admin'. For this demo, we assume the frontend
// handles the role check, or you can pass the role in headers.

router.get("/translations", requireAdminRoles("super_admin"), async (req, res) => {
  try {
    const [translations] = await db.execute("SELECT * FROM translations ORDER BY section, text_key");
    res.json({ success: true, data: translations });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

router.post("/translations", requireAdminRoles("super_admin"), async (req, res) => {
  try {
    const { text_key, en_value, am_value, section } = req.body;
    if (!text_key || !en_value || !am_value) {
      return res.status(400).json({ success: false, message: "Missing required fields" });
    }
    const [result] = await db.execute(
      "INSERT INTO translations (text_key, en_value, am_value, section) VALUES (?, ?, ?, ?)",
      [text_key, en_value, am_value, section || 'general']
    );
    res.json({ success: true, id: result.insertId, message: "Translation added successfully" });

    const createdTranslation = await getTranslationSnapshot(result.insertId);
    await writeAuditLog({
      req,
      ...getAdminActor(req),
      action: "translation_created",
      resourceType: "translation",
      resourceId: result.insertId,
      details: {
        after: sanitizeForAudit(createdTranslation),
      },
    });
  } catch (err) {
    if (err.code === 'ER_DUP_ENTRY') {
      return res.status(400).json({ success: false, message: "Text key already exists" });
    }
    res.status(500).json({ success: false, message: err.message });
  }
});

router.put("/translations/:id", requireAdminRoles("super_admin"), async (req, res) => {
  try {
    const { id } = req.params;
    const { text_key, en_value, am_value, section } = req.body;
    const before = await getTranslationSnapshot(id);

    if (!before) {
      return res.status(404).json({ success: false, message: "Translation not found" });
    }

    const [result] = await db.execute(
      "UPDATE translations SET text_key = ?, en_value = ?, am_value = ?, section = ? WHERE id = ?",
      [text_key, en_value, am_value, section || 'general', id]
    );
    res.json({ success: true, message: "Translation updated successfully" });

    const after = await getTranslationSnapshot(id);
    await writeAuditLog({
      req,
      ...getAdminActor(req),
      action: "translation_updated",
      resourceType: "translation",
      resourceId: id,
      details: {
        before: sanitizeForAudit(before),
        after: sanitizeForAudit(after),
      },
    });
  } catch (err) {
    if (err.code === 'ER_DUP_ENTRY') {
      return res.status(400).json({ success: false, message: "Text key already exists" });
    }
    res.status(500).json({ success: false, message: err.message });
  }
});

router.delete("/translations/:id", requireAdminRoles("super_admin"), async (req, res) => {
  try {
    const { id } = req.params;
    const before = await getTranslationSnapshot(id);

    if (!before) {
      return res.status(404).json({ success: false, message: "Translation not found" });
    }

    const [result] = await db.execute("DELETE FROM translations WHERE id = ?", [id]);
    res.json({ success: true, message: "Translation deleted successfully" });

    await writeAuditLog({
      req,
      ...getAdminActor(req),
      action: "translation_deleted",
      resourceType: "translation",
      resourceId: id,
      details: {
        deleted_record: sanitizeForAudit(before),
      },
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});


// ─────────────────────────────────────────────
// AGENT PAYOUT REQUEST MANAGEMENT
// ─────────────────────────────────────────────

/**
 * GET /api/admin/payout-requests
 * List agent payout requests (admin only)
 */
router.get("/payout-requests", requireAdminAuth, async (req, res) => {
  try {
    const { status = "" } = req.query;
    let sql = `
      SELECT pr.id, pr.amount_etb, pr.telebirr_phone, pr.status, pr.admin_note,
             pr.processed_at, pr.created_at,
             a.id AS agent_id, u.full_name AS agent_name, u.phone_number AS agent_phone, a.sub_city
      FROM agent_payout_requests pr
      JOIN agents a ON pr.agent_id = a.id
      JOIN users u ON a.user_id = u.id
    `;
    const params = [];

    if (status) {
      sql += " WHERE pr.status = ?";
      params.push(status);
    }

    sql += " ORDER BY pr.created_at DESC LIMIT 100";

    const [rows] = await db.execute(sql, params);
    res.json({ success: true, data: rows });
  } catch (err) {
    console.error("[GET /admin/payout-requests]", err);
    res.status(500).json({ success: false, message: "Failed to fetch payout requests" });
  }
});

/**
 * POST /api/admin/payout-requests/:id/process
 * Maker-checker state machine for agent payouts.
 *
 * Transitions (enforced server-side):
 *   pending  -> approved   (maker)    any admin; amounts > 5,000 ETB require super_admin
 *   approved -> paid       (checker)  requires telebirr_ref; amounts > 5,000 ETB must be
 *                                    disbursed by a DIFFERENT admin than the approver
 *   approved -> failed     refund reservation back to the agent
 *   pending/approved -> rejected      refund reservation exactly once
 *
 * Every step runs inside a transaction with the request row locked FOR UPDATE,
 * so double-refunds and double-payouts are impossible even under concurrent calls.
 */
const PAYOUT_TWO_PERSON_THRESHOLD = 5000;

router.post("/payout-requests/:id/process", requireAdminRoles("super_admin", "admin"), async (req, res) => {
  try {
    const { id } = req.params;
    const { status: action, admin_note, rejection_reason, telebirr_ref } = req.body;

    if (!["approved", "paid", "rejected", "failed"].includes(action)) {
      return res.status(400).json({ success: false, message: "Invalid status. Must be: approved, paid, rejected, or failed" });
    }
    if (action === "rejected" && !rejection_reason) {
      return res.status(400).json({ success: false, message: "rejection_reason is required when rejecting" });
    }
    if (action === "paid" && (!telebirr_ref || String(telebirr_ref).trim().length < 4)) {
      return res.status(400).json({ success: false, message: "telebirr_ref is required to mark a payout as paid" });
    }

    const adminId = req.adminUser.id;
    const isAdminRoleSuper = req.adminUser.role === "super_admin";

    const outcome = await db.transaction(async (conn) => {
      const [[request]] = await conn.execute(
        `SELECT pr.*, a.user_id AS agent_user_id
         FROM agent_payout_requests pr
         JOIN agents a ON a.id = pr.agent_id
         WHERE pr.id = ? FOR UPDATE`,
        [id]
      );
      if (!request) {
        const err = new Error("Payout request not found");
        err.statusCode = 404;
        throw err;
      }

      const amount = Number(request.amount_etb);
      const needsSecondPair = amount > PAYOUT_TWO_PERSON_THRESHOLD;

      switch (action) {
        case "approved": {
          if (request.status !== "pending") {
            const err = new Error(`Only pending requests can be approved (current: ${request.status})`);
            err.statusCode = 409;
            throw err;
          }
          if (needsSecondPair && !isAdminRoleSuper) {
            const err = new Error(`Amounts above ${PAYOUT_TWO_PERSON_THRESHOLD.toLocaleString()} ETB require super_admin approval`);
            err.statusCode = 403;
            throw err;
          }
          await conn.execute(
            `UPDATE agent_payout_requests
             SET status='approved', approved_by=?, approved_at=NOW(), admin_note=COALESCE(?, admin_note)
             WHERE id=?`,
            [adminId, admin_note || null, id]
          );
          break;
        }

        case "paid": {
          if (request.status !== "approved") {
            const err = new Error(`Only approved requests can be paid (current: ${request.status})`);
            err.statusCode = 409;
            throw err;
          }
          if (needsSecondPair && Number(request.approved_by) === Number(adminId)) {
            const err = new Error("Two-person rule: the disbursing admin must differ from the approving admin");
            err.statusCode = 403;
            throw err;
          }
          await conn.execute(
            `UPDATE agent_payout_requests
             SET status='paid', processed_by=?, processed_at=NOW(), telebirr_ref=?, admin_note=COALESCE(?, admin_note)
             WHERE id=?`,
            [adminId, String(telebirr_ref).trim(), admin_note || null, id]
          );
          break;
        }

        case "rejected":
        case "failed": {
          if (!["pending", "approved"].includes(request.status)) {
            const err = new Error(`Cannot ${action} a request in status '${request.status}'`);
            err.statusCode = 409;
            throw err;
          }
          // Refund the reservation exactly once. The balance was deducted at
          // REQUEST time, so every terminal non-paid state must give it back.
          // Double-refund is impossible: the status precondition above means
          // this branch can only run once per request (row is locked).
          await conn.execute(
            "UPDATE agents SET earnings_total_etb = earnings_total_etb + ? WHERE id = ?",
            [amount, request.agent_id]
          );
          await conn.execute(
            `UPDATE agent_payout_requests
             SET status=?, rejection_reason=?, admin_note=COALESCE(?, admin_note), processed_by=?, processed_at=NOW()
             WHERE id=?`,
            [action === "rejected" ? "rejected" : "failed", rejection_reason || null, admin_note || null, adminId, id]
          );
          break;
        }
      }

      return {
        previous_status: request.status,
        new_status: action,
        amount_etb: amount,
        two_person_rule_applied: needsSecondPair,
        agent_user_id: request.agent_user_id,
      };
    });

    await writeAuditLog({
      req,
      ...getAdminActor(req),
      action: `payout_request_${outcome.new_status}`,
      resourceType: "agent_payout_request",
      resourceId: id,
      details: {
        previous_status: outcome.previous_status,
        amount_etb: outcome.amount_etb,
        two_person_rule_applied: outcome.two_person_rule_applied,
        admin_note: admin_note || null,
        rejection_reason: rejection_reason || null,
        telebirr_ref: action === "paid" ? String(telebirr_ref).trim() : null,
      },
    });

    // F10 notification matrix — agent's user account learns the transition
    if (outcome.agent_user_id) {
      const amountStr = `${Number(outcome.amount_etb).toLocaleString()} ETB`;
      const notifByStatus = {
        approved: {
          type: "payout_approved",
          title: "Payout approved",
          body: `Your payout request of ${amountStr} was approved and is queued for TeleBirr disbursement.`,
        },
        paid: {
          type: "payout_paid",
          title: "Payout sent",
          body: `Your payout of ${amountStr} has been disbursed via TeleBirr. Ref: ${String(telebirr_ref).trim()}`,
        },
        rejected: {
          type: "payout_rejected",
          title: "Payout request rejected",
          body: `Your payout request of ${amountStr} was rejected${rejection_reason ? `: ${rejection_reason}` : "."} The amount has been returned to your balance.`,
        },
        failed: {
          type: "payout_failed",
          title: "Payout failed",
          body: `The disbursement of ${amountStr} failed. The amount has been returned to your balance.`,
        },
      }[action];

      if (notifByStatus) {
        await createNotification({
          userId: outcome.agent_user_id,
          type: notifByStatus.type,
          title: notifByStatus.title,
          body: notifByStatus.body,
          payload: { payout_request_id: Number(id) },
        });
      }
    }

    res.json({ success: true, message: `Payout request ${outcome.new_status}` });
  } catch (err) {
    if (err.statusCode) {
      return res.status(err.statusCode).json({ success: false, message: err.message });
    }
    console.error("[POST /admin/payout-requests/:id/process]", err);
    res.status(500).json({ success: false, message: "Failed to process payout request" });
  }
});

// ═══════════════════════════════════════════════════════════
// SPRINT 7 — REPORTS & MODERATION QUEUE
// ═══════════════════════════════════════════════════════════

const REPORT_TARGET_STATUSES = new Set([
  "reviewing", "resolved_action_taken", "resolved_rejected", "dismissed",
]);

/**
 * Takedown/restore helper — keeps listing flag flips consistent and returns
 * the seller user id for notifications.
 */
async function setListingSuspension(listingId, suspended) {
  const [[listing]] = await db.execute(
    "SELECT id, user_id, is_active, status, title_en FROM listings WHERE id = ?",
    [listingId]
  );
  if (!listing) return null;
  const nextStatus = suspended ? "suspended" : "active";
  await db.execute(
    "UPDATE listings SET is_active = ?, status = ? WHERE id = ?",
    [suspended ? 0 : 1, nextStatus, listingId]
  );
  return {
    seller_user_id: listing.user_id,
    previous_status: listing.status,
    title_en: listing.title_en,
  };
}

// ── GET /admin/reports?status=&limit=&offset= — moderation queue ──────────
router.get("/reports", requireAdminRoles("super_admin", "admin"), async (req, res) => {
  try {
    const { status } = req.query;
    if (status && !REPORT_TARGET_STATUSES.has(status) && status !== "open") {
      return res.status(400).json({ success: false, message: "Invalid status filter" });
    }

    const limit = Math.min(Math.max(parseInt(req.query.limit, 10) || 50, 1), 200);
    const offset = Math.max(parseInt(req.query.offset, 10) || 0, 0);

    let where = "1=1";
    const params = [];
    if (status) {
      where = "r.status = ?";
      params.push(status);
    }

    const [rows] = await db.execute(
      `SELECT r.id, r.listing_id, r.reporter_user_id, r.reason, r.details,
              r.status, r.reviewer_username, r.resolution_note,
              r.created_at, r.updated_at,
              l.title_en, l.category, l.is_active, l.status AS listing_status,
              u.full_name AS reporter_name
       FROM listing_reports r
       JOIN listings l ON l.id = r.listing_id
       JOIN users u ON u.id = r.reporter_user_id
       WHERE ${where}
       ORDER BY FIELD(r.status,'open','reviewing','resolved_action_taken',
                      'resolved_rejected','dismissed'), r.created_at DESC
       LIMIT ? OFFSET ?`,
      [...params, limit, offset]
    );

    const [[{ total }]] = await db.execute(
      `SELECT COUNT(*) AS total FROM listing_reports r WHERE ${where}`,
      params
    );

    res.json({ success: true, data: rows, pagination: { total, limit, offset } });
  } catch (err) {
    console.error("[GET /admin/reports]", err);
    res.status(500).json({ success: false, message: "Failed to load report queue" });
  }
});

// ── PATCH /admin/reports/:id — triage a report ─────────────────────────────
router.patch("/reports/:id", requireAdminRoles("super_admin", "admin"), async (req, res) => {
  try {
    const id = Number(req.params.id);
    if (!Number.isInteger(id) || id <= 0) {
      return res.status(400).json({ success: false, message: "Invalid report id" });
    }
    const target = req.body?.status;
    if (!REPORT_TARGET_STATUSES.has(target)) {
      return res.status(400).json({
        success: false,
        message: `status must be one of: ${[...REPORT_TARGET_STATUSES].join(", ")}`,
      });
    }
    const note = req.body?.resolution_note ? String(req.body.resolution_note).trim().slice(0, 500) : null;

    const [[report]] = await db.execute("SELECT * FROM listing_reports WHERE id = ?", [id]);
    if (!report) {
      return res.status(404).json({ success: false, message: "Report not found" });
    }
    if (report.status !== "open" && report.status !== "reviewing") {
      return res.status(409).json({
        success: false,
        message: `Report is already ${report.status}`,
      });
    }

    // Terminal states only from open/reviewing; reviewing is a soft step.
    const [result] = await db.execute(
      `UPDATE listing_reports
       SET status = ?, reviewed_by = ?, reviewer_username = ?,
           resolution_note = COALESCE(?, resolution_note)
       WHERE id = ? AND status IN ('open','reviewing')`,
      [target, req.adminUser.id, req.adminUser.username || null, note, id]
    );
    if (result.affectedRows === 0) {
      return res.status(409).json({ success: false, message: "Report changed concurrently, retry" });
    }

    let takedown = null;
    if (target === "resolved_action_taken") {
      takedown = await setListingSuspension(report.listing_id, true);
      if (takedown?.seller_user_id) {
        createNotification({
          userId: takedown.seller_user_id,
          type: "listing_suspended",
          title: "Your listing was taken down",
          body: `"${takedown.title_en || "A listing"}" was removed after a moderation review. Contact support for details.`,
          payload: { listing_id: report.listing_id, report_id: id },
          listingId: report.listing_id,
        }).catch(() => {});
      }
      // Real-time availability: moderated takedown hides the listing live
      broadcastListingChange(req.app.get("io"), {
        action: "updated",
        id: Number(report.listing_id),
        is_active: false,
      });
    }

    await writeAuditLog({
      req,
      ...getAdminActor(req),
      action: `report_${target}`,
      resourceType: "listing_report",
      resourceId: id,
      details: {
        previous_status: report.status,
        resolution_note: note,
        listing_id: report.listing_id,
        listing_takedown_applied: !!takedown,
      },
    });

    // Reporter learns the outcome (no internal details leaked)
    createNotification({
      userId: report.reporter_user_id,
      type: "report_resolved",
      title: `Your report #${id} was reviewed`,
      body:
        target === "resolved_action_taken"
          ? "Thank you — action was taken on the reported listing."
          : "The listing did not violate our policies after review.",
      payload: { report_id: id, status: target },
      listingId: report.listing_id,
    }).catch(() => {});

    res.json({
      success: true,
      data: { id, status: target, listing_takedown: !!takedown },
    });
  } catch (err) {
    console.error("[PATCH /admin/reports/:id]", err);
    res.status(500).json({ success: false, message: "Failed to resolve report" });
  }
});

// ── POST /admin/listings/:id/restore — undo a moderation takedown ─────────
router.post("/listings/:id/restore", requireAdminRoles("super_admin", "admin"), async (req, res) => {
  try {
    const id = Number(req.params.id);
    if (!Number.isInteger(id) || id <= 0) {
      return res.status(400).json({ success: false, message: "Invalid listing id" });
    }
    const out = await setListingSuspension(id, false);
    if (!out) {
      return res.status(404).json({ success: false, message: "Listing not found" });
    }

    await writeAuditLog({
      req,
      ...getAdminActor(req),
      action: "listing_restored",
      resourceType: "listing",
      resourceId: id,
      details: { previous_status: out.previous_status },
    });

    createNotification({
      userId: out.seller_user_id,
      type: "listing_restored",
      title: "Your listing is live again",
      body: "Your listing was restored after moderation review.",
      payload: { listing_id: id },
      listingId: id,
    }).catch(() => {});

    res.json({ success: true, data: { id, status: "active" } });

    // Real-time availability: restored listings reappear live
    broadcastListingChange(req.app.get("io"), {
      action: "updated",
      id,
      is_active: true,
    });
  } catch (err) {
    console.error("[POST /admin/listings/:id/restore]", err);
    res.status(500).json({ success: false, message: "Failed to restore listing" });
  }
});

// ─────────────────────────────────────────────
// TAXONOMY ADMIN — Sprint 8g
// Attribute definitions, category↔brand mappings, brands and the vendor
// brand-request queue. Every mutation busts the taxonomy cache so public
// reads reflect changes immediately.
// ─────────────────────────────────────────────
const { invalidateTaxonomyCache } = require("../utils/taxonomy");

const ATTR_KEY_RE = /^[a-z0-9_]{1,50}$/;
const ATTR_INPUT_TYPES = new Set(["select", "multiselect", "boolean", "number", "text"]);

router.get("/taxonomy/nodes", requireAdminRoles("super_admin", "admin"), async (req, res) => {
  try {
    const [rows] = await db.execute(
      `SELECT c.id, c.slug, c.key_name, c.label_en, c.parent_id, p.slug AS parent_slug
       FROM categories c LEFT JOIN categories p ON p.id = c.parent_id
       ORDER BY COALESCE(p.display_order, c.display_order), c.display_order`
    );
    res.json({ success: true, data: rows });
  } catch (err) {
    console.error("[GET /admin/taxonomy/nodes]", err);
    res.status(500).json({ success: false, message: "Failed to list taxonomy nodes" });
  }
});

router.post("/categories/:id/attributes", requireAdminRoles("super_admin", "admin"), async (req, res) => {
  try {
    const b = req.body || {};
    if (!ATTR_KEY_RE.test(String(b.attr_key || ""))) {
      return res.status(400).json({ success: false, message: "attr_key must be snake_case, ≤50 chars" });
    }
    if (!b.label_en || !ATTR_INPUT_TYPES.has(b.input_type)) {
      return res.status(400).json({ success: false, message: "label_en and a valid input_type are required" });
    }
    const options = Array.isArray(b.options)
      ? b.options.map((o) => String(o)).filter(Boolean).slice(0, 30)
      : [];
    const [[dupe]] = await db.execute(
      "SELECT id FROM category_attributes WHERE category_id = ? AND attr_key = ?",
      [req.params.id, b.attr_key]
    );
    if (dupe) return res.status(409).json({ success: false, message: "attr_key already exists on this node" });

    const [result] = await db.execute(
      `INSERT INTO category_attributes
        (category_id, attr_key, label_en, label_am, input_type, unit, options, is_required, is_filterable, display_order)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        req.params.id, b.attr_key, b.label_en, b.label_am || null,
        b.input_type, b.unit || null,
        ["select", "multiselect"].includes(b.input_type) ? JSON.stringify(options) : null,
        b.is_required ? 1 : 0, b.is_filterable === false ? 0 : 1,
        Number(b.display_order) || 100,
      ]
    );
    invalidateTaxonomyCache();
    await writeAuditLog({
      req, ...getAdminActor(req),
      action: "taxonomy_attribute_create", resourceType: "category_attributes",
      resourceId: result.insertId, details: { ...b },
    });
    res.status(201).json({ success: true, id: result.insertId });
  } catch (err) {
    console.error("[POST /admin/categories/:id/attributes]", err);
    res.status(500).json({ success: false, message: "Failed to create attribute" });
  }
});

router.put("/attributes/:attrId", requireAdminRoles("super_admin", "admin"), async (req, res) => {
  try {
    const b = req.body || {};
    const sets = [];
    const params = [];
    const FIELDS = ["label_en", "label_am", "input_type", "unit"];
    for (const f of FIELDS) {
      if (b[f] !== undefined) { sets.push(`${f} = ?`); params.push(b[f]); }
    }
    if (b.attr_key !== undefined) {
      if (!ATTR_KEY_RE.test(String(b.attr_key))) {
        return res.status(400).json({ success: false, message: "invalid attr_key" });
      }
      sets.push("attr_key = ?"); params.push(b.attr_key);
    }
    if (b.options !== undefined && Array.isArray(b.options)) {
      sets.push("options = ?"); params.push(JSON.stringify(b.options.map(String).slice(0, 30)));
    }
    for (const f of ["is_required", "is_filterable"]) {
      if (b[f] !== undefined) { sets.push(`${f} = ?`); params.push(b[f] ? 1 : 0); }
    }
    if (b.display_order !== undefined) { sets.push("display_order = ?"); params.push(Number(b.display_order) || 100); }
    if (sets.length === 0) return res.status(400).json({ success: false, message: "Nothing to update" });

    const [r] = await db.execute(
      `UPDATE category_attributes SET ${sets.join(", ")} WHERE id = ?`,
      [...params, req.params.attrId]
    );
    if (r.affectedRows === 0) return res.status(404).json({ success: false, message: "Attribute not found" });
    invalidateTaxonomyCache();
    await writeAuditLog({
      req, ...getAdminActor(req),
      action: "taxonomy_attribute_update", resourceType: "category_attributes",
      resourceId: Number(req.params.attrId), details: { ...b },
    });
    res.json({ success: true });
  } catch (err) {
    console.error("[PUT /admin/attributes/:attrId]", err);
    res.status(500).json({ success: false, message: "Failed to update attribute" });
  }
});

router.delete("/attributes/:attrId", requireAdminRoles("super_admin", "admin"), async (req, res) => {
  try {
    const [r] = await db.execute("DELETE FROM category_attributes WHERE id = ?", [req.params.attrId]);
    if (r.affectedRows === 0) return res.status(404).json({ success: false, message: "Attribute not found" });
    invalidateTaxonomyCache();
    await writeAuditLog({
      req, ...getAdminActor(req),
      action: "taxonomy_attribute_delete", resourceType: "category_attributes",
      resourceId: Number(req.params.attrId), details: null,
    });
    res.json({ success: true });
  } catch (err) {
    console.error("[DELETE /admin/attributes/:attrId]", err);
    res.status(500).json({ success: false, message: "Failed to delete attribute" });
  }
});

router.post("/categories/:id/brands", requireAdminRoles("super_admin", "admin"), async (req, res) => {
  try {
    const slug = String(req.body?.slug || "").toLowerCase();
    if (!/^[a-z0-9-]{1,60}$/.test(slug)) {
      return res.status(400).json({ success: false, message: "Valid brand slug required" });
    }
    const [[brand]] = await db.execute("SELECT id FROM brands WHERE slug = ?", [slug]);
    if (!brand) return res.status(404).json({ success: false, message: "Unknown brand" });

    // Composite PK makes re-mapping a no-op instead of an error.
    await db.execute(
      `INSERT INTO category_brands (category_id, brand_id) VALUES (?, ?)
       ON DUPLICATE KEY UPDATE category_id = category_id`,
      [req.params.id, brand.id]
    );
    invalidateTaxonomyCache();
    await writeAuditLog({
      req, ...getAdminActor(req),
      action: "taxonomy_brand_map", resourceType: "category_brands",
      resourceId: Number(req.params.id), details: { brand_slug: slug },
    });
    res.status(201).json({ success: true });
  } catch (err) {
    console.error("[POST /admin/categories/:id/brands]", err);
    res.status(500).json({ success: false, message: "Failed to map brand" });
  }
});

router.delete("/categories/:id/brands/:brandId", requireAdminRoles("super_admin", "admin"), async (req, res) => {
  try {
    await db.execute(
      "DELETE FROM category_brands WHERE category_id = ? AND brand_id = ?",
      [req.params.id, req.params.brandId]
    );
    invalidateTaxonomyCache();
    await writeAuditLog({
      req, ...getAdminActor(req),
      action: "taxonomy_brand_unmap", resourceType: "category_brands",
      resourceId: Number(req.params.id), details: { brand_id: Number(req.params.brandId) },
    });
    res.json({ success: true });
  } catch (err) {
    console.error("[DELETE /admin/categories/:id/brands/:brandId]", err);
    res.status(500).json({ success: false, message: "Failed to unmap brand" });
  }
});

router.post("/brands", requireAdminRoles("super_admin", "admin"), async (req, res) => {
  try {
    const nameEn = String(req.body?.name_en || "").trim().slice(0, 120);
    if (!nameEn) return res.status(400).json({ success: false, message: "name_en is required" });
    const slug = String(req.body?.slug || nameEn.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, ""));
    if (!/^[a-z0-9-]{1,60}$/.test(slug)) {
      return res.status(400).json({ success: false, message: "Could not derive a valid slug" });
    }
    const [[dupe]] = await db.execute("SELECT id FROM brands WHERE slug = ?", [slug]);
    if (dupe) return res.status(409).json({ success: false, message: "Brand already exists" });

    const [result] = await db.execute(
      "INSERT INTO brands (slug, name_en, name_am, is_active) VALUES (?, ?, ?, 1)",
      [slug, nameEn, req.body?.name_am || null]
    );
    invalidateTaxonomyCache();
    await writeAuditLog({
      req, ...getAdminActor(req),
      action: "brand_create", resourceType: "brands",
      resourceId: result.insertId, details: { slug, name_en: nameEn },
    });
    res.status(201).json({ success: true, id: result.insertId, slug });
  } catch (err) {
    console.error("[POST /admin/brands]", err);
    res.status(500).json({ success: false, message: "Failed to create brand" });
  }
});

router.get("/brand-requests", requireAdminRoles("super_admin", "admin"), async (req, res) => {
  try {
    const status = ["pending", "approved", "rejected"].includes(String(req.query.status))
      ? String(req.query.status)
      : "pending";
    const [rows] = await db.execute(
      `SELECT br.*, u.full_name AS requester_name, c.slug AS requested_category_slug
       FROM brand_requests br
       JOIN users u ON u.id = br.requested_by
       LEFT JOIN categories c ON c.id = br.requested_category_id
       WHERE br.status = ? ORDER BY br.created_at ASC LIMIT 200`,
      [status]
    );
    res.json({ success: true, data: rows });
  } catch (err) {
    console.error("[GET /admin/brand-requests]", err);
    res.status(500).json({ success: false, message: "Failed to list brand requests" });
  }
});

router.post("/brand-requests/:id/approve", requireAdminRoles("super_admin", "admin"), async (req, res) => {
  try {
    // No transaction helper on this pool — sequential statements guarded by
    // a conditional status flip so double-approvals stay impossible.
    const [claim] = await db.execute(
      "UPDATE brand_requests SET status = 'approved', reviewed_by = ?, reviewed_at = NOW() WHERE id = ? AND status = 'pending'",
      [getAdminActor(req)?.adminUserId ?? null, req.params.id]
    );
    if (claim.affectedRows === 0) {
      const [[any]] = await db.execute("SELECT status FROM brand_requests WHERE id = ?", [req.params.id]);
      return res.status(any ? 409 : 404).json({ success: false, message: any ? "Already reviewed" : "Request not found" });
    }
    const [[request]] = await db.execute("SELECT * FROM brand_requests WHERE id = ?", [req.params.id]);

    let brandId;
    const [[existing]] = await db.execute("SELECT id FROM brands WHERE slug = ?", [request.slug]);
    if (existing) {
      brandId = existing.id;
    } else {
      const [ins] = await db.execute(
        "INSERT INTO brands (slug, name_en, is_active) VALUES (?, ?, 1)",
        [request.slug, request.name_en]
      );
      brandId = ins.insertId;
    }

    if (request.requested_category_id) {
      await db.execute(
        `INSERT INTO category_brands (category_id, brand_id) VALUES (?, ?)
         ON DUPLICATE KEY UPDATE category_id = category_id`,
        [request.requested_category_id, brandId]
      );
    }

    invalidateTaxonomyCache();
    await writeAuditLog({
      req, ...getAdminActor(req),
      action: "brand_request_approve", resourceType: "brand_requests",
      resourceId: Number(req.params.id), details: { slug: request.slug },
    });
    res.json({ success: true, brand_id: brandId });
  } catch (err) {
    console.error("[POST /admin/brand-requests/:id/approve]", err);
    res.status(500).json({ success: false, message: "Failed to approve brand request" });
  }
});

router.post("/brand-requests/:id/reject", requireAdminRoles("super_admin", "admin"), async (req, res) => {
  try {
    const [r] = await db.execute(
      "UPDATE brand_requests SET status = 'rejected', reviewed_by = ?, reviewed_at = NOW() WHERE id = ? AND status = 'pending'",
      [getAdminActor(req)?.adminUserId ?? null, req.params.id]
    );
    if (r.affectedRows === 0) return res.status(404).json({ success: false, message: "No pending request with that id" });
    await writeAuditLog({
      req, ...getAdminActor(req),
      action: "brand_request_reject", resourceType: "brand_requests",
      resourceId: Number(req.params.id), details: null,
    });
    res.json({ success: true });
  } catch (err) {
    console.error("[POST /admin/brand-requests/:id/reject]", err);
    res.status(500).json({ success: false, message: "Failed to reject brand request" });
  }
});

// ── Sprint P2: Payment verification queue ──────────────────────────────────
// GET /api/admin/payment-verifications?status=pending — list bookings awaiting
// payment review. Admin sees the booking details + evidence images.
router.get(
  "/payment-verifications",
  requireAdminAuth,
  requireAdminRoles("super_admin", "admin"),
  async (req, res) => {
    try {
      const filterStatus = req.query.status || "pending";
      const validStatuses = ["pending", "verified", "rejected"];
      if (!validStatuses.includes(filterStatus)) {
        return res.status(400).json({ success: false, message: "Invalid status filter" });
      }

      const [rows] = await db.execute(
        `SELECT p.id AS payment_id, p.booking_id, p.amount_claimed, p.evidence_urls,
                p.note, p.status, p.created_at AS submitted_at,
                b.listing_id, b.guest_user_id, b.host_user_id,
                CAST(b.check_in AS CHAR) AS check_in,
                CAST(b.check_out AS CHAR) AS check_out,
                CAST(b.event_date AS CHAR) AS event_date,
                b.total_price, b.currency, b.status AS booking_status,
                l.title_en, l.title_am, l.category,
                l.payment_phone, l.payment_bank_name, l.payment_bank_account,
                g.full_name AS guest_name, g.phone_number AS guest_phone,
                h.full_name AS host_name
         FROM payments p
         JOIN bookings b ON b.id = p.booking_id
         JOIN listings l ON l.id = b.listing_id
         JOIN users g ON g.id = b.guest_user_id
         JOIN users h ON h.id = b.host_user_id
         WHERE p.status = ?
         ORDER BY p.created_at ASC
         LIMIT 50`,
        [filterStatus]
      );

      const data = rows.map((r) => ({
        ...r,
        evidence_urls: typeof r.evidence_urls === "string" ? JSON.parse(r.evidence_urls) : r.evidence_urls,
      }));

      res.json({ success: true, data, count: data.length });
    } catch (err) {
      console.error("[GET /admin/payment-verifications]", err);
      res.status(500).json({ success: false, message: "Failed to fetch payment verifications" });
    }
  }
);

// POST /api/admin/payment-verifications/:id/confirm — verify payment + confirm booking
router.post(
  "/payment-verifications/:id(\\d+)/confirm",
  requireAdminAuth,
  requireAdminRoles("super_admin", "admin"),
  async (req, res) => {
    try {
      const id = Number(req.params.id);
      if (!Number.isInteger(id) || id <= 0) {
        return res.status(400).json({ success: false, message: "Invalid payment id" });
      }

      const [[payment]] = await db.execute("SELECT * FROM payments WHERE id = ?", [id]);
      if (!payment) {
        return res.status(404).json({ success: false, message: "Payment record not found" });
      }
      if (payment.status !== "pending") {
        return res.status(400).json({ success: false, message: `Payment already ${payment.status}` });
      }

      const [[booking]] = await db.execute("SELECT * FROM bookings WHERE id = ?", [payment.booking_id]);
      if (!booking || booking.status !== "payment_submitted") {
        return res.status(400).json({ success: false, message: "Booking is not in payment_submitted state" });
      }

      // Atomic: verify payment + confirm booking
      try {
        await db.transaction(async (conn) => {
          await conn.execute(
            "UPDATE payments SET status = 'verified', reviewed_by = ?, reviewed_at = NOW() WHERE id = ? AND status = 'pending'",
            [req.adminUser.id, id]
          );
          const [result] = await conn.execute(
            "UPDATE bookings SET status = 'confirmed', decided_at = NOW() WHERE id = ? AND status = 'payment_submitted'",
            [payment.booking_id]
          );
          if (result.affectedRows !== 1) throw new Error("CONCURRENT_CHANGE");
        });
      } catch (err) {
        if (err.message === "CONCURRENT_CHANGE") {
          return res.status(409).json({ success: false, message: "Booking changed concurrently" });
        }
        throw err;
      }

      // Notify guest
      const { createNotification } = require("../utils/notify");
      createNotification({
        userId: booking.guest_user_id,
        type: "booking_confirmed",
        title: "Payment verified — booking confirmed!",
        body: `Your payment for Booking #${booking.id} has been verified. Your booking is confirmed.`,
        payload: { booking_id: booking.id, payment_id: id },
        listingId: booking.listing_id,
      }).catch(() => {});

      // Socket push to guest + host + admin feed
      const io = req.app.get("io");
      if (io) {
        io.to(`user_${booking.guest_user_id}`).emit("booking:status_changed", {
          booking_id: booking.id, status: "confirmed", timestamp: Date.now(),
        });
        io.to(`user_${booking.host_user_id}`).emit("booking:status_changed", {
          booking_id: booking.id, status: "confirmed", timestamp: Date.now(),
        });
        io.to("admin_feed").emit("admin:payment_verified", {
          payment_id: id, booking_id: booking.id, timestamp: Date.now(),
        });
      }

      await writeAuditLog({
        req, ...getAdminActor(req),
        action: "payment.confirm", resourceType: "payments",
        resourceId: id, details: { booking_id: payment.booking_id },
      });

      res.json({ success: true, message: "Payment verified, booking confirmed" });
    } catch (err) {
      console.error("[POST /admin/payment-verifications/:id/confirm]", err);
      res.status(500).json({ success: false, message: "Failed to verify payment" });
    }
  }
);

// POST /api/admin/payment-verifications/:id/reject — reject payment evidence
router.post(
  "/payment-verifications/:id(\\d+)/reject",
  requireAdminAuth,
  requireAdminRoles("super_admin", "admin"),
  async (req, res) => {
    try {
      const id = Number(req.params.id);
      if (!Number.isInteger(id) || id <= 0) {
        return res.status(400).json({ success: false, message: "Invalid payment id" });
      }

      const [[payment]] = await db.execute("SELECT * FROM payments WHERE id = ?", [id]);
      if (!payment) {
        return res.status(404).json({ success: false, message: "Payment record not found" });
      }
      if (payment.status !== "pending") {
        return res.status(400).json({ success: false, message: `Payment already ${payment.status}` });
      }

      const reason = typeof req.body.reason === "string" ? req.body.reason.slice(0, 500) : "No reason provided";

      await db.execute(
        "UPDATE payments SET status = 'rejected', reviewed_by = ?, reviewed_at = NOW(), reject_reason = ? WHERE id = ? AND status = 'pending'",
        [req.adminUser.id, reason, id]
      );

      // Revert booking back to pending so guest can re-submit
      const [[booking]] = await db.execute("SELECT * FROM bookings WHERE id = ?", [payment.booking_id]);
      if (booking && booking.status === "payment_submitted") {
        await db.execute(
          "UPDATE bookings SET status = 'pending' WHERE id = ? AND status = 'payment_submitted'",
          [payment.booking_id]
        );
      }

      // Notify guest
      const { createNotification } = require("../utils/notify");
      createNotification({
        userId: payment.user_id,
        type: "booking_payment_rejected",
        title: "Payment evidence rejected",
        body: `Your payment evidence for Booking #${payment.booking_id} was rejected. Reason: ${reason}`,
        payload: { booking_id: payment.booking_id, payment_id: id, reason },
        listingId: booking ? booking.listing_id : null,
      }).catch(() => {});

      // Socket push
      const io = req.app.get("io");
      if (io) {
        io.to(`user_${payment.user_id}`).emit("booking:status_changed", {
          booking_id: payment.booking_id, status: "pending", timestamp: Date.now(),
        });
        io.to("admin_feed").emit("admin:payment_rejected", {
          payment_id: id, booking_id: payment.booking_id, reason, timestamp: Date.now(),
        });
      }

      await writeAuditLog({
        req, ...getAdminActor(req),
        action: "payment.reject", resourceType: "payments",
        resourceId: id, details: { booking_id: payment.booking_id, reason },
      });

      res.json({ success: true, message: "Payment rejected, booking reverted to pending" });
    } catch (err) {
      console.error("[POST /admin/payment-verifications/:id/reject]", err);
      res.status(500).json({ success: false, message: "Failed to reject payment" });
    }
  }
);

// ── Sprint P4: Listing promotion (boost/featured) payment queue ────────────
// GET /api/admin/promo-verifications?status=submitted — manual-payment orders
// waiting for admin confirmation before the seller's listing is boosted.
router.get(
  "/promo-verifications",
  requireAdminAuth,
  requireAdminRoles("super_admin", "admin"),
  async (req, res) => {
    try {
      const filterStatus = req.query.status || "submitted";
      const validStatuses = ["pending", "submitted", "verified", "rejected", "expired", "cancelled"];
      if (!validStatuses.includes(filterStatus)) {
        return res.status(400).json({ success: false, message: "Invalid status filter" });
      }

      const conditions = ["p.status = ?"];
      const params = [filterStatus];

      const [rows] = await db.execute(
        `SELECT p.id AS promo_id, p.listing_id, p.package_id, p.amount_etb, p.method,
                p.reference, p.evidence_urls, p.seller_note, p.status,
                p.verified_at, p.expires_at, p.reject_reason, p.created_at AS ordered_at,
                pk.slug AS package_slug, pk.name_en AS package_name_en, pk.name_am AS package_name_am,
                pk.duration_days,
                u.full_name AS seller_name, u.phone_number AS seller_phone,
                l.title_en, l.title_am, l.category,
                adm.full_name AS reviewer_name
         FROM listing_promos p
         JOIN users u ON u.id = p.user_id
         JOIN listings l ON l.id = p.listing_id
         JOIN packages pk ON pk.id = p.package_id
         LEFT JOIN admin_users adm ON adm.id = p.reviewed_by
         WHERE ${conditions.join(" AND ")}
         ORDER BY p.created_at ASC
         LIMIT 50`,
        params
      );

      const data = rows.map((r) => ({
        ...r,
        evidence_urls: typeof r.evidence_urls === "string" ? JSON.parse(r.evidence_urls) : r.evidence_urls,
      }));

      res.json({ success: true, data, count: data.length });
    } catch (err) {
      console.error("[GET /admin/promo-verifications]", err);
      res.status(500).json({ success: false, message: "Failed to fetch promo verifications" });
    }
  }
);

// POST /api/admin/promo-verifications/:id/verify — confirm the transfer, activate boost
router.post(
  "/promo-verifications/:id(\\d+)/verify",
  requireAdminAuth,
  requireAdminRoles("super_admin", "admin"),
  async (req, res) => {
    try {
      const id = Number(req.params.id);

      const [[order]] = await db.execute("SELECT * FROM listing_promos WHERE id = ?", [id]);
      if (!order) {
        return res.status(404).json({ success: false, message: "Promotion order not found" });
      }
      if (order.status !== "submitted") {
        return res.status(400).json({ success: false, message: `Order is already ${order.status}` });
      }
      const [[pkg]] = await db.execute("SELECT duration_days FROM packages WHERE id = ?", [order.package_id]);
      if (!pkg) {
        return res.status(400).json({ success: false, message: "Package no longer available" });
      }

      try {
        await db.transaction(async (conn) => {
          const [up] = await conn.execute(
            `UPDATE listing_promos SET status = 'verified', verified_at = NOW(),
               expires_at = DATE_ADD(NOW(), INTERVAL ? DAY),
               reviewed_by = ?, updated_at = NOW()
             WHERE id = ? AND status = 'submitted'`,
            [pkg.duration_days, req.adminUser.id, id]
          );
          if (up.affectedRows !== 1) throw new Error("CONCURRENT_CHANGE");
          await conn.execute(
            "UPDATE listings SET is_premium = 1, premium_until = DATE_ADD(NOW(), INTERVAL ? DAY) WHERE id = ?",
            [pkg.duration_days, order.listing_id]
          );
        });
      } catch (err) {
        if (err.message === "CONCURRENT_CHANGE") {
          return res.status(409).json({ success: false, message: "Order changed concurrently" });
        }
        throw err;
      }

      createNotification({
        userId: order.user_id,
        type: "promo_verified",
        title: "Promotion activated!",
        body: `Your boost for Listing #${order.listing_id} is now active for ${pkg.duration_days} days.`,
        payload: { promo_id: id, listing_id: order.listing_id },
        listingId: order.listing_id,
      }).catch(() => {});

      const io = req.app.get("io");
      if (io) {
        io.to(`user_${order.user_id}`).emit("promo:status_changed", {
          promo_id: id, listing_id: order.listing_id, status: "verified", timestamp: Date.now(),
        });
      }

      await writeAuditLog({
        req, ...getAdminActor(req),
        action: "promo.verify", resourceType: "listing_promos",
        resourceId: id, details: { listing_id: order.listing_id, amount_etb: order.amount_etb, days: pkg.duration_days },
      });

      res.json({ success: true, message: "Promotion verified and activated" });
    } catch (err) {
      console.error("[POST /admin/promo-verifications/:id/verify]", err);
      res.status(500).json({ success: false, message: "Failed to verify promotion" });
    }
  }
);

// POST /api/admin/promo-verifications/:id/reject — decline the evidence
router.post(
  "/promo-verifications/:id(\\d+)/reject",
  requireAdminAuth,
  requireAdminRoles("super_admin", "admin"),
  async (req, res) => {
    try {
      const id = Number(req.params.id);

      const [[order]] = await db.execute("SELECT * FROM listing_promos WHERE id = ?", [id]);
      if (!order) {
        return res.status(404).json({ success: false, message: "Promotion order not found" });
      }
      if (order.status !== "submitted") {
        return res.status(400).json({ success: false, message: `Order is already ${order.status}` });
      }
      const reason = typeof req.body.reason === "string" ? req.body.reason.slice(0, 500) : "No reason provided";

      const [result] = await db.execute(
        `UPDATE listing_promos SET status = 'rejected', reviewed_by = ?, updated_at = NOW(), reject_reason = ?
         WHERE id = ? AND status = 'submitted'`,
        [req.adminUser.id, reason, id]
      );
      if (result.affectedRows !== 1) {
        return res.status(409).json({ success: false, message: "Order changed concurrently" });
      }

      createNotification({
        userId: order.user_id,
        type: "promo_rejected",
        title: "Promotion payment rejected",
        body: `Your payment evidence for Listing #${order.listing_id} was rejected. Reason: ${reason}`,
        payload: { promo_id: id, listing_id: order.listing_id, reason },
        listingId: order.listing_id,
      }).catch(() => {});

      const io = req.app.get("io");
      if (io) {
        io.to(`user_${order.user_id}`).emit("promo:status_changed", {
          promo_id: id, listing_id: order.listing_id, status: "rejected", reason, timestamp: Date.now(),
        });
      }

      await writeAuditLog({
        req, ...getAdminActor(req),
        action: "promo.reject", resourceType: "listing_promos",
        resourceId: id, details: { listing_id: order.listing_id, reason },
      });

      res.json({ success: true, message: "Promotion payment rejected" });
    } catch (err) {
      console.error("[POST /admin/promo-verifications/:id/reject]", err);
      res.status(500).json({ success: false, message: "Failed to reject promotion" });
    }
  }
);

module.exports = router;
