/**
 * routes/g2b.js
 * Malazone.com — G2B Compliance Portal API
 * © 2026 Malazone Technologies PLC
 */

"use strict";

const express = require("express");
const db = require("../database/db");
const { requireAdminAuth, requireAdminRoles } = require("../middleware/adminAuth");
const { getAdminActor, sanitizeForAudit, writeAuditLog } = require("../utils/auditLogger");
const { createNotification } = require("../utils/notify");
const { broadcastListingChange } = require("../utils/listingRealtime");

const router = express.Router();

router.use(requireAdminAuth);
router.use(requireAdminRoles("super_admin", "g2b_municipality", "g2b_transport"));

// Shared FIFO queue loader — used by GET /pending and GET /queue.
// NOTE: previously this SELECT referenced four columns that do not exist
// (`title`, `cata_registry`, `chassis_number`, `engine_number`,
// `legal_document_url`), so BOTH queue endpoints returned 500 on every call.
const VERIFICATION_SLA_HOURS = 48;

async function loadVerificationQueue(roleScopedAuditType) {
  let sql = `
    SELECT l.id, l.title_en, l.title_am, l.price, l.category,
           l.location_label_am, l.location_label_en, l.location_key,
           l.images, l.plate_code, l.fuel_type,
           l.verification_requested_at, l.created_at,
           u.full_name AS seller_name, u.phone_number AS seller_phone,
           TIMESTAMPDIFF(HOUR, COALESCE(l.verification_requested_at, l.created_at), NOW()) AS hours_waiting,
           (TIMESTAMPDIFF(HOUR, COALESCE(l.verification_requested_at, l.created_at), NOW()) > ?) AS sla_breached
    FROM listings l
    JOIN users u ON l.user_id = u.id
    WHERE l.is_active = 1 AND l.is_verified = 0 AND l.status = 'active'
  `;
  const params = [VERIFICATION_SLA_HOURS];

  if (roleScopedAuditType === "land") {
    sql += " AND l.category = 'property'";
  } else if (roleScopedAuditType === "vehicle") {
    sql += " AND l.category = 'motors'";
  } else {
    sql += " AND l.category IN ('property', 'motors')";
  }

  // FIFO: seller-requested verifications first (by request time), then the rest
  sql += " ORDER BY COALESCE(l.verification_requested_at, l.created_at) ASC";

  const [rows] = await db.execute(sql, params);

  return rows.map((r) => ({
    ...r,
    images: r.images ? (typeof r.images === "string" ? JSON.parse(r.images) : r.images) : [],
    sla_breached: !!r.sla_breached,
    sla_due_at: new Date(
      new Date(r.verification_requested_at || r.created_at).getTime() + VERIFICATION_SLA_HOURS * 3600 * 1000
    ).toISOString(),
  }));
}

function roleScopeFor(req) {
  if (req.adminUser.role === "g2b_municipality") return "land";
  if (req.adminUser.role === "g2b_transport") return "vehicle";
  return req.query.audit_type; // super_admin may filter explicitly
}

// 1. Get pending audits
router.get(["/pending", "/queue"], async (req, res) => {
  try {
    const rows = await loadVerificationQueue(roleScopeFor(req));
    res.json({ success: true, data: rows });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: "Failed to load verification queue" });
  }
});

// 2. Submit audit decision
router.post("/audit/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const { 
      audit_type, 
      status, 
      notes, 
      workflow_status,
      rejection_reason,
      evidence_references,
      review_scope
    } = req.body;

    // INTEGRITY: officer identity is always taken from the authenticated
    // session. Previously officer_name/officer_role were accepted from the
    // request body, letting any admin forge another officer's signature.
    const officer_name = req.adminUser.full_name;
    const officer_role = req.adminUser.role;

    const VALID_WORKFLOW_STATUSES = new Set([
      "submitted", "under_review", "needs_clarification", "approved", "rejected", "fraud_flagged"
    ]);
    if (workflow_status && !VALID_WORKFLOW_STATUSES.has(workflow_status)) {
      return res.status(400).json({ success: false, message: "Invalid workflow_status" });
    }
    
    const [[before]] = await db.execute("SELECT * FROM listings WHERE id = ?", [id]);

    if (!audit_type || !status) {
      return res.status(400).json({ success: false, message: "Missing required audit fields." });
    }

    if (!before) {
      return res.status(404).json({ success: false, message: "Listing not found." });
    }

    if (req.adminUser.role === "g2b_municipality" && audit_type !== "land") {
      await writeAuditLog({
        req,
        ...getAdminActor(req),
        action: "g2b_audit_rejected_by_role_scope",
        resourceType: "listing_compliance",
        resourceId: id,
        details: { attempted_audit_type: audit_type, status, notes },
      });
      return res.status(403).json({ success: false, message: "Municipality officers can only review land audits." });
    }

    if (req.adminUser.role === "g2b_transport" && audit_type !== "vehicle") {
      await writeAuditLog({
        req,
        ...getAdminActor(req),
        action: "g2b_audit_rejected_by_role_scope",
        resourceType: "listing_compliance",
        resourceId: id,
        details: { attempted_audit_type: audit_type, status, notes },
      });
      return res.status(403).json({ success: false, message: "Transport officers can only review vehicle audits." });
    }

    // Validate review scope matches officer role
    if (req.adminUser.role === "g2b_municipality" && review_scope === "vehicle_review") {
      return res.status(403).json({ success: false, message: "Municipality officers cannot perform vehicle reviews." });
    }

    if (req.adminUser.role === "g2b_transport" && review_scope === "property_review") {
      return res.status(403).json({ success: false, message: "Transport officers cannot perform property reviews." });
    }

    // insert into g2b_audits with new workflow fields
    await db.execute(
      `INSERT INTO g2b_audits (
        listing_id, 
        officer_name, 
        officer_role,
        audit_type, 
        status,
        workflow_status,
        rejection_reason,
        notes,
        evidence_references,
        review_scope,
        decision_timestamp
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, NOW())`,
      [
        id, 
        officer_name,
        officer_role,
        audit_type, 
        status,
        workflow_status || (status === 'verified' ? 'approved' : 'fraud_flagged'),
        rejection_reason || null,
        notes || "",
        JSON.stringify(evidence_references || []),
        review_scope || (audit_type === 'land' ? 'property_review' : 'vehicle_review')
      ]
    );

    // update listing status based on decision
    if (status === 'verified') {
      await db.execute(`UPDATE listings SET is_verified = 1 WHERE id = ?`, [id]);
      broadcastListingChange(req.app.get("io"), {
        action: "updated",
        id: Number(id),
        is_active: true,
      });
    } else if (status === 'fraudulent') {
      // Soft-delete listing if flagged as fraudulent
      await db.execute(`UPDATE listings SET is_active = 0 WHERE id = ?`, [id]);
      broadcastListingChange(req.app.get("io"), {
        action: "updated",
        id: Number(id),
        is_active: false,
      });
    }

    const [[after]] = await db.execute("SELECT * FROM listings WHERE id = ?", [id]);

    await writeAuditLog({
      req,
      ...getAdminActor(req),
      action: status === "verified" ? "g2b_audit_verified" : "g2b_audit_flagged_fraudulent",
      resourceType: "listing_compliance",
      resourceId: id,
      details: {
        audit_type,
        workflow_status,
        rejection_reason,
        review_scope,
        notes,
        before: sanitizeForAudit(before),
        after: sanitizeForAudit(after),
      },
    });

    // F10 notification matrix — seller learns the verdict in-app
    if (before.user_id) {
      if (status === "verified") {
        await createNotification({
          userId: before.user_id,
          type: "verification_approved",
          title: "Listing verified",
          body: `Your listing "${before.title_en || before.title_am || `#${id}`}" passed official verification and now shows the verified badge.`,
          listingId: Number(id),
        });
      } else if (status === "fraudulent") {
        await createNotification({
          userId: before.user_id,
          type: "verification_flagged",
          title: "Listing flagged for review",
          body: `Your listing "${before.title_en || before.title_am || `#${id}`}" was flagged during compliance review. Contact support for details.`,
          listingId: Number(id),
        });
      }
    }

    res.json({ success: true, message: `Audit recorded successfully for listing ${id}` });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: "Audit submission failed" });
  }
});

// 3. Get audit history
router.get("/history", async (req, res) => {
  try {
    const roleScopedAuditType =
      req.adminUser.role === "g2b_municipality"
        ? "land"
        : req.adminUser.role === "g2b_transport"
          ? "vehicle"
          : req.query.audit_type;

    let sql = `
      SELECT ga.*, l.title_en, l.title_am, l.price, l.category,
             l.location_label_am, l.location_label_en,
             l.plate_code, u.full_name as seller_name
      FROM g2b_audits ga
      JOIN listings l ON ga.listing_id = l.id
      LEFT JOIN users u ON l.user_id = u.id
    `;
    const params = [];

    if (roleScopedAuditType === 'land') {
      sql += " WHERE ga.audit_type = 'land'";
    } else if (roleScopedAuditType === 'vehicle') {
      sql += " WHERE ga.audit_type = 'vehicle'";
    }

    sql += " ORDER BY ga.created_at DESC LIMIT 100";

    const [rows] = await db.execute(sql, params);
    res.json({ success: true, data: rows });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: err.message });
  }
});

module.exports = router;

