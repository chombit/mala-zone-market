/**
 * routes/admin.js
 * Malazone.com — Elite Admin Controller API
 * Secure operations for property verification and agent payouts
 * © 2026 Malazone Technologies PLC
 */

"use strict";

const express = require("express");
const multer = require("multer");
const sharp = require("sharp");
const path = require("path");
const fs = require("fs");
const { v4: uuidv4 } = require("uuid");
const db = require("../database/db");
const bcrypt = require("bcrypt");
const {
  sanitizeAdminUser,
  issueAdminToken,
  setAdminAuthCookie,
  clearAdminAuthCookie,
  requireAdminAuth,
  requireAdminRoles,
} = require("../middleware/adminAuth");
const { getAdminActor, sanitizeForAudit, writeAuditLog } = require("../utils/auditLogger");
const router = express.Router();

// ── Image Upload Pipeline
const UPLOAD_DIR = path.join(__dirname, "..", "public", "uploads");
if (!fs.existsSync(UPLOAD_DIR)) fs.mkdirSync(UPLOAD_DIR, { recursive: true });

const storage = multer.memoryStorage();
const upload = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024, files: 4 },
});

async function processImage(buffer) {
  const filename = `mala_${uuidv4()}.webp`;
  const outputPath = path.join(UPLOAD_DIR, filename);
  await sharp(buffer)
    .resize({ width: 1200, withoutEnlargement: true, fit: "inside" })
    .webp({ quality: 80, effort: 6 })
    .toFile(outputPath);
  return `/uploads/${filename}`;
}

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
router.post("/login", async (req, res) => {
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
 * Simulated telebirr for Business payout logic
 */
router.post("/payout-agent", requireAdminRoles("super_admin", "admin"), async (req, res) => {
  try {
    const { agent_id } = req.body;
    const PAY_PER_LISTING = 100;

    if (!agent_id) {
      return res.status(400).json({ success: false, message: "Agent ID required" });
    }

    // 1. Fetch agent data and pending listings
    const [[agent]] = await db.execute(
      `SELECT a.*, u.phone_number 
       FROM agents a 
       JOIN users u ON a.user_id = u.id 
       WHERE a.id = ?`,
      [agent_id]
    );

    if (!agent) {
      return res.status(404).json({ success: false, message: "Agent not found" });
    }

    // 2. Count pending (unpaid) listings for this agent
    // Note: In a real app, we'd have a column 'payout_status' in the listings table
    const [[{ pending_count }]] = await db.execute(
      "SELECT COUNT(*) as pending_count FROM listings WHERE user_id = ? AND is_active = 1",
      [agent.user_id]
    );

    const totalAmount = pending_count * PAY_PER_LISTING;

    if (totalAmount <= 0) {
      return res.status(400).json({ success: false, message: "No pending earnings found" });
    }

    // 3. Simulated telebirr Handshake
    console.log(`[telebirr] Initiating payout for ${agent.phone_number}: ${totalAmount} ETB`);
    // Simulation logic here...

    // 4. Update Agent Balance & Database
    await db.execute(
      "UPDATE agents SET earnings_total_etb = earnings_total_etb + ? WHERE id = ?",
      [totalAmount, agent_id]
    );

    res.json({
      success: true,
      message: `Successfully disbursed ${totalAmount} ETB via telebirr`,
      transaction_id: `MALA-PAY-${Date.now()}`
    });

    await writeAuditLog({
      req,
      ...getAdminActor(req),
      action: "agent_payout_disbursed",
      resourceType: "agent",
      resourceId: agent_id,
      details: {
        phone_number: agent.phone_number,
        pending_count,
        total_amount_etb: totalAmount,
      },
    });

  } catch (err) {
    console.error("[ADMIN PAYOUT ERROR]", err);
    res.status(500).json({ success: false, message: "Internal Server Error" });
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
      plate_code, fuel_type, condition_type, 
      area_sqm, capacity, with_operator, is_zero_km,
      bedrooms, bathrooms, title_deed
    } = req.body;

    let imageUrls = [];
    if (req.files && req.files.length > 0) {
      imageUrls = await Promise.all(req.files.map(f => processImage(f.buffer)));
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
        category, price, price_suffix, phone, whatsapp, location_key,
        location_label_en, location_label_am,
        is_premium, is_verified, images,
        plate_code, fuel_type, condition_type,
        area_sqm, capacity, with_operator, is_zero_km,
        bedrooms, bathrooms, title_deed
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        user_id, title_en, title_am, description_en, description_am,
        category, price, price_suffix || 'fixed', phone, whatsapp, location_key,
        "Hawassa, Ethiopia", "ሐዋሳ፣ ኢትዮጵያ",
        is_premium ? 1 : 0, is_verified ? 1 : 0,
        JSON.stringify(imageUrls),
        plate_code || null, fuel_type || null, condition_type || null,
        area_sqm || null, capacity || null, with_operator ? 1 : 0, is_zero_km ? 1 : 0,
        bedrooms || null, bathrooms || null, title_deed || null
      ]
    );

    res.json({ success: true, id: result.insertId });

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
      plate_code, fuel_type, condition_type, 
      area_sqm, capacity, with_operator, is_zero_km,
      bedrooms, bathrooms, title_deed
    } = req.body;

    let imageUrls = [];
    if (req.files && req.files.length > 0) {
      imageUrls = await Promise.all(req.files.map(f => processImage(f.buffer)));
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
        category = ?, price = ?, price_suffix = ?, phone = ?, whatsapp = ?, location_key = ?,
        is_premium = ?, is_verified = ?, is_active = ?, images = ?,
        plate_code = ?, fuel_type = ?, condition_type = ?,
        area_sqm = ?, capacity = ?, with_operator = ?, is_zero_km = ?,
        bedrooms = ?, bathrooms = ?, title_deed = ?
      WHERE id = ?`,
      [
        title_en, title_am, description_en, description_am,
        category, price, price_suffix || 'fixed', phone, whatsapp, location_key,
        is_premium ? 1 : 0, is_verified ? 1 : 0, is_active ? 1 : 0,
        JSON.stringify(imageUrls),
        plate_code || null, fuel_type || null, condition_type || null,
        area_sqm || null, capacity || null, with_operator ? 1 : 0, is_zero_km ? 1 : 0,
        bedrooms || null, bathrooms || null, title_deed || null,
        id
      ]
    );

    const after = await getListingSnapshot(id);

    res.json({ success: true, message: "Listing updated" });

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
 * GET /api/admin/users
 * Get all admin users (Super Admin only)
 */
router.get("/users", requireAdminRoles("super_admin"), async (req, res) => {
  try {
    const [users] = await db.execute(
      "SELECT id, username, full_name, role, is_active, last_login, created_at FROM admin_users"
    );
    res.json({ success: true, users });
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
    const { username, password, full_name, role } = req.body;
    
    // Validate required fields
    if (!username || !password || !full_name) {
      return res.status(400).json({ success: false, message: "Username, password, and full name are required" });
    }

    // Hash password
    const SALT_ROUNDS = 12;
    const password_hash = await bcrypt.hash(password, SALT_ROUNDS);

    // Insert new admin user
    const [result] = await db.execute(
      "INSERT INTO admin_users (username, password_hash, full_name, role, is_active) VALUES (?, ?, ?, ?, true)",
      [username, password_hash, full_name, role || "admin"]
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
    const { username, full_name, role, is_active, password } = req.body;
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


module.exports = router;
