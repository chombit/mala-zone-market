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

const router = express.Router();

router.use(requireAdminAuth);
router.use(requireAdminRoles("super_admin", "g2b_municipality", "g2b_transport"));

// 1. Get pending audits
router.get("/pending", async (req, res) => {
  try {
    const requestedAuditType = req.query.audit_type; // 'land' or 'vehicle'
    const roleScopedAuditType =
      req.adminUser.role === "g2b_municipality"
        ? "land"
        : req.adminUser.role === "g2b_transport"
          ? "vehicle"
          : requestedAuditType;
    
    let sql = `
      SELECT l.id, l.title, l.price, l.category, l.location_label_am, l.location_label_en, 
             l.location_key, l.images, l.plate_code, l.fuel_type, u.full_name as seller_name, l.created_at,
             l.cata_registry, l.chassis_number, l.engine_number, l.legal_document_url
      FROM listings l 
      JOIN users u ON l.user_id = u.id 
      WHERE l.is_active = 1 AND l.is_verified = 0
    `;
    const params = [];

    if (roleScopedAuditType === 'land') {
      sql += " AND l.category = 'property'";
    } else if (roleScopedAuditType === 'vehicle') {
      sql += " AND l.category = 'motors'";
    } else {
      sql += " AND l.category IN ('property', 'motors')";
    }
    
    sql += " ORDER BY l.created_at ASC";

    const [rows] = await db.execute(sql, params);

    // parse images JSON
    const processedRows = rows.map(r => ({
      ...r,
      images: r.images ? (typeof r.images === 'string' ? JSON.parse(r.images) : r.images) : []
    }));

    res.json({ success: true, data: processedRows });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: err.message });
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
      officer_name,
      officer_role,
      workflow_status,
      rejection_reason,
      evidence_references,
      review_scope
    } = req.body;
    
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
        officer_name || req.adminUser.full_name, 
        officer_role || req.adminUser.role,
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
    } else if (status === 'fraudulent') {
      // Soft-delete listing if flagged as fraudulent
      await db.execute(`UPDATE listings SET is_active = 0 WHERE id = ?`, [id]);
    }

    const [[after]] = await db.execute("SELECT * FROM listings WHERE id = ?", [id]);

    res.json({ success: true, message: `Audit recorded successfully for listing ${id}` });

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
      SELECT ga.*, l.title, l.price, l.category, l.location_label_am, l.location_label_en,
             l.cata_registry, l.plate_code, l.chassis_number, u.full_name as seller_name
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

