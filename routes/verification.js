/**
 * routes/verification.js
 * Two-Phase Verification Workflow for Listings
 * Phase 1: Admin Review → Phase 2: G2B Officer Verification
 * © 2026 Malazone Technologies PLC
 *
 * NOTE: users table uses `phone_number` (not `phone`).
 *       listings table has its own `phone` column for contact.
 */

const express = require("express");
const router  = express.Router();
const db      = require("../database/db");
const { requireAdminAuth, requireAdminRoles } = require("../middleware/adminAuth");
const { writeAuditLog, getAdminActor }        = require("../utils/auditLogger");

/* ─── helpers ────────────────────────────────────────────────────────────── */
function parseDocuments(raw) {
  if (!raw) return [];
  if (Array.isArray(raw)) return raw;
  try { return JSON.parse(raw); } catch { return []; }
}

/* ─────────────────────────────────────────────────────────────────────────
   GET /api/verification/pending-admin-review
   All listings waiting for Phase 1 admin review
───────────────────────────────────────────────────────────────────────────*/
router.get(
  "/pending-admin-review",
  requireAdminAuth,
  requireAdminRoles("super_admin", "admin"),
  async (req, res) => {
    try {
      const [rows] = await db.execute(`
        SELECT
          l.id,
          l.title_en,
          l.title_am,
          l.category,
          l.sub_category,
          l.location_label_en,
          l.location_label_am,
          l.price,
          l.phone            AS seller_phone,
          l.whatsapp         AS seller_whatsapp,
          l.images,
          l.verification_status,
          l.admin_notes,
          l.officer_notes,
          l.rejection_reason,
          l.verification_documents,
          l.is_escalated,
          l.created_at,
          u.email            AS seller_email,
          u.phone_number     AS seller_phone_number,
          TIMESTAMPDIFF(HOUR, l.created_at, NOW()) AS hours_pending
        FROM listings l
        LEFT JOIN users u ON l.user_id = u.id
        WHERE l.verification_status = 'pending_admin_review'
        ORDER BY l.created_at ASC
      `);

      const listings = rows.map(r => ({
        ...r,
        verification_documents: parseDocuments(r.verification_documents),
        seller_phone: r.seller_phone || r.seller_phone_number || null,
      }));

      res.json({ success: true, listings, count: listings.length });
    } catch (err) {
      console.error("[GET PENDING ADMIN REVIEW ERROR]", err.message);
      res.status(500).json({ success: false, message: "Internal Server Error" });
    }
  }
);

/* ─────────────────────────────────────────────────────────────────────────
   POST /api/verification/admin-review/:listingId
   Phase 1: approve (assign) or reject
───────────────────────────────────────────────────────────────────────────*/
router.post(
  "/admin-review/:listingId",
  requireAdminAuth,
  requireAdminRoles("super_admin", "admin"),
  async (req, res) => {
    try {
      const { listingId } = req.params;
      const { action, assigned_officer_id, admin_notes, rejection_reason } = req.body;

      if (!["approve", "reject"].includes(action)) {
        return res.status(400).json({ success: false, message: "action must be 'approve' or 'reject'" });
      }

      const [[listing]] = await db.execute("SELECT * FROM listings WHERE id = ?", [listingId]);
      if (!listing) return res.status(404).json({ success: false, message: "Listing not found" });

      if (listing.verification_status !== "pending_admin_review") {
        return res.status(400).json({ success: false, message: "Listing is not pending admin review" });
      }

      if (action === "approve") {
        if (!assigned_officer_id) {
          return res.status(400).json({ success: false, message: "assigned_officer_id required" });
        }

        const [[officer]] = await db.execute(
          "SELECT * FROM admin_users WHERE id = ? AND is_active = 1 AND role IN ('g2b_municipality','g2b_transport')",
          [assigned_officer_id]
        );
        if (!officer) return res.status(400).json({ success: false, message: "Invalid or inactive officer" });

        const slaDeadline = new Date();
        slaDeadline.setHours(slaDeadline.getHours() + 48);

        await db.execute(`
          UPDATE listings
          SET verification_status = 'assigned_for_verification',
              assigned_officer_id = ?,
              admin_notes         = ?,
              admin_reviewed_at   = NOW(),
              admin_reviewed_by   = ?,
              sla_deadline        = ?
          WHERE id = ?
        `, [assigned_officer_id, admin_notes || null, req.adminUser.id, slaDeadline, listingId]);

        await writeAuditLog({
          req, ...getAdminActor(req),
          action: "admin_approved_listing_for_verification",
          resourceType: "listing", resourceId: listingId,
          details: { assigned_officer_id, assigned_officer_name: officer.full_name, admin_notes, sla_deadline: slaDeadline },
        });

        return res.json({
          success: true,
          message: "Listing approved and assigned to officer",
          assigned_to: officer.full_name,
          sla_deadline: slaDeadline,
        });
      }

      // reject
      if (!rejection_reason) {
        return res.status(400).json({ success: false, message: "rejection_reason required" });
      }

      await db.execute(`
        UPDATE listings
        SET verification_status = 'rejected',
            rejection_reason    = ?,
            admin_notes         = ?,
            admin_reviewed_at   = NOW(),
            admin_reviewed_by   = ?,
            is_active           = 0
        WHERE id = ?
      `, [rejection_reason, admin_notes || null, req.adminUser.id, listingId]);

      await writeAuditLog({
        req, ...getAdminActor(req),
        action: "admin_rejected_listing",
        resourceType: "listing", resourceId: listingId,
        details: { rejection_reason, admin_notes },
      });

      res.json({ success: true, message: "Listing rejected" });

    } catch (err) {
      console.error("[ADMIN REVIEW ERROR]", err.message);
      res.status(500).json({ success: false, message: "Internal Server Error" });
    }
  }
);

/* ─────────────────────────────────────────────────────────────────────────
   GET /api/verification/my-queue
   Listings assigned to the calling G2B officer
───────────────────────────────────────────────────────────────────────────*/
router.get("/my-queue", requireAdminAuth, async (req, res) => {
  try {
    const { id: officerId, role } = req.adminUser;

    if (!["g2b_municipality", "g2b_transport"].includes(role)) {
      return res.status(403).json({ success: false, message: "Only G2B officers can access queue" });
    }

    const [rows] = await db.execute(`
      SELECT
        l.id,
        l.title_en,
        l.title_am,
        l.category,
        l.location_label_en,
        l.price,
        l.phone            AS seller_phone,
        l.verification_status,
        l.admin_notes,
        l.verification_documents,
        l.is_escalated,
        l.sla_deadline,
        l.created_at,
        u.email            AS seller_email,
        a.full_name        AS admin_reviewer,
        TIMESTAMPDIFF(HOUR, l.admin_reviewed_at, NOW())  AS hours_in_queue,
        TIMESTAMPDIFF(HOUR, NOW(), l.sla_deadline)       AS hours_until_deadline
      FROM listings l
      LEFT JOIN users      u ON l.user_id           = u.id
      LEFT JOIN admin_users a ON l.admin_reviewed_by = a.id
      WHERE l.assigned_officer_id = ?
        AND l.verification_status = 'assigned_for_verification'
      ORDER BY l.sla_deadline ASC
    `, [officerId]);

    const listings = rows.map(r => ({
      ...r,
      verification_documents: parseDocuments(r.verification_documents),
    }));

    res.json({ success: true, listings, count: listings.length });
  } catch (err) {
    console.error("[GET MY QUEUE ERROR]", err.message);
    res.status(500).json({ success: false, message: "Internal Server Error" });
  }
});

/* ─────────────────────────────────────────────────────────────────────────
   POST /api/verification/officer-review/:listingId
   Phase 2: approve / reject / request_info
───────────────────────────────────────────────────────────────────────────*/
router.post("/officer-review/:listingId", requireAdminAuth, async (req, res) => {
  try {
    const { listingId }             = req.params;
    const { action, officer_notes, rejection_reason } = req.body;
    const { id: officerId, role }   = req.adminUser;

    if (!["g2b_municipality", "g2b_transport"].includes(role)) {
      return res.status(403).json({ success: false, message: "Only G2B officers can review" });
    }
    if (!["approve", "reject", "request_info"].includes(action)) {
      return res.status(400).json({ success: false, message: "Invalid action" });
    }

    const [[listing]] = await db.execute("SELECT * FROM listings WHERE id = ?", [listingId]);
    if (!listing)                                    return res.status(404).json({ success: false, message: "Listing not found" });
    if (listing.assigned_officer_id !== officerId)   return res.status(403).json({ success: false, message: "Listing not assigned to you" });
    if (listing.verification_status !== "assigned_for_verification") {
      return res.status(400).json({ success: false, message: "Listing is not in assigned_for_verification status" });
    }

    if (action === "approve") {
      await db.execute(`
        UPDATE listings
        SET verification_status = 'officer_approved',
            is_verified         = 1,
            is_active           = 1,
            officer_notes       = ?,
            officer_reviewed_at = NOW(),
            sla_deadline        = NULL
        WHERE id = ?
      `, [officer_notes || null, listingId]);

      await writeAuditLog({ req, ...getAdminActor(req), action: "officer_approved_listing", resourceType: "listing", resourceId: listingId, details: { officer_notes } });
      return res.json({ success: true, message: "Listing approved and published" });
    }

    if (action === "reject") {
      if (!rejection_reason) return res.status(400).json({ success: false, message: "rejection_reason required" });

      await db.execute(`
        UPDATE listings
        SET verification_status = 'officer_rejected',
            rejection_reason    = ?,
            officer_notes       = ?,
            officer_reviewed_at = NOW(),
            is_escalated        = 1,
            is_active           = 0
        WHERE id = ?
      `, [rejection_reason, officer_notes || null, listingId]);

      await writeAuditLog({ req, ...getAdminActor(req), action: "officer_rejected_listing", resourceType: "listing", resourceId: listingId, details: { rejection_reason, officer_notes, escalated: true } });
      return res.json({ success: true, message: "Listing rejected and escalated to Super Admin" });
    }

    // request_info
    await db.execute(`
      UPDATE listings
      SET verification_status = 'info_requested',
          officer_notes       = ?,
          officer_reviewed_at = NOW()
      WHERE id = ?
    `, [officer_notes || "Additional information required", listingId]);

    await writeAuditLog({ req, ...getAdminActor(req), action: "officer_requested_info", resourceType: "listing", resourceId: listingId, details: { officer_notes } });
    res.json({ success: true, message: "Additional information requested" });

  } catch (err) {
    console.error("[OFFICER REVIEW ERROR]", err.message);
    res.status(500).json({ success: false, message: "Internal Server Error" });
  }
});

/* ─────────────────────────────────────────────────────────────────────────
   GET /api/verification/escalated
───────────────────────────────────────────────────────────────────────────*/
router.get(
  "/escalated",
  requireAdminAuth,
  requireAdminRoles("super_admin"),
  async (req, res) => {
    try {
      const [rows] = await db.execute(`
        SELECT
          l.id, l.title_en, l.title_am, l.category,
          l.location_label_en, l.price,
          l.phone            AS seller_phone,
          l.verification_status,
          l.admin_notes, l.officer_notes, l.rejection_reason,
          l.verification_documents, l.is_escalated, l.created_at,
          u.email            AS seller_email,
          a.full_name        AS admin_reviewer,
          o.full_name        AS officer_reviewer
        FROM listings l
        LEFT JOIN users       u ON l.user_id           = u.id
        LEFT JOIN admin_users a ON l.admin_reviewed_by = a.id
        LEFT JOIN admin_users o ON l.assigned_officer_id = o.id
        WHERE l.is_escalated = 1
          AND l.verification_status = 'officer_rejected'
        ORDER BY l.officer_reviewed_at DESC
      `);

      const listings = rows.map(r => ({ ...r, verification_documents: parseDocuments(r.verification_documents) }));
      res.json({ success: true, listings, count: listings.length });
    } catch (err) {
      console.error("[GET ESCALATED ERROR]", err.message);
      res.status(500).json({ success: false, message: "Internal Server Error" });
    }
  }
);

/* ─────────────────────────────────────────────────────────────────────────
   GET /api/verification/overdue
───────────────────────────────────────────────────────────────────────────*/
router.get(
  "/overdue",
  requireAdminAuth,
  requireAdminRoles("super_admin", "admin"),
  async (req, res) => {
    try {
      const [rows] = await db.execute(`
        SELECT
          l.id, l.title_en, l.title_am, l.category,
          l.location_label_en, l.price,
          l.phone            AS seller_phone,
          l.verification_status,
          l.admin_notes, l.verification_documents, l.sla_deadline, l.created_at,
          u.email            AS seller_email,
          o.full_name        AS assigned_officer,
          TIMESTAMPDIFF(HOUR, l.sla_deadline, NOW()) AS hours_overdue,
          TIMESTAMPDIFF(HOUR, NOW(), l.sla_deadline) AS hours_until_deadline
        FROM listings l
        LEFT JOIN users       u ON l.user_id             = u.id
        LEFT JOIN admin_users o ON l.assigned_officer_id = o.id
        WHERE l.sla_deadline < NOW()
          AND l.verification_status = 'assigned_for_verification'
        ORDER BY l.sla_deadline ASC
      `);

      const listings = rows.map(r => ({ ...r, verification_documents: parseDocuments(r.verification_documents) }));
      res.json({ success: true, listings, count: listings.length });
    } catch (err) {
      console.error("[GET OVERDUE ERROR]", err.message);
      res.status(500).json({ success: false, message: "Internal Server Error" });
    }
  }
);

/* ─────────────────────────────────────────────────────────────────────────
   POST /api/verification/upload-documents/:listingId
───────────────────────────────────────────────────────────────────────────*/
router.post(
  "/upload-documents/:listingId",
  requireAdminAuth,
  requireAdminRoles("super_admin", "admin"),
  async (req, res) => {
    try {
      const { listingId } = req.params;
      const { documents } = req.body;

      if (!documents || !Array.isArray(documents)) {
        return res.status(400).json({ success: false, message: "documents array is required" });
      }

      const [[listing]] = await db.execute("SELECT id FROM listings WHERE id = ?", [listingId]);
      if (!listing) return res.status(404).json({ success: false, message: "Listing not found" });

      await db.execute(
        "UPDATE listings SET verification_documents = ? WHERE id = ?",
        [JSON.stringify(documents), listingId]
      );

      await writeAuditLog({
        req, ...getAdminActor(req),
        action: "uploaded_verification_documents",
        resourceType: "listing", resourceId: listingId,
        details: { document_count: documents.length },
      });

      res.json({ success: true, message: "Documents uploaded", count: documents.length });
    } catch (err) {
      console.error("[UPLOAD DOCUMENTS ERROR]", err.message);
      res.status(500).json({ success: false, message: "Internal Server Error" });
    }
  }
);

/* ─────────────────────────────────────────────────────────────────────────
   GET /api/verification/stats
───────────────────────────────────────────────────────────────────────────*/
router.get("/stats", requireAdminAuth, async (req, res) => {
  try {
    const [[stats]] = await db.execute(`
      SELECT
        COUNT(*)                                                                                                AS total,
        SUM(CASE WHEN verification_status = 'pending_admin_review'      THEN 1 ELSE 0 END)                    AS pending_admin,
        SUM(CASE WHEN verification_status = 'assigned_for_verification' THEN 1 ELSE 0 END)                    AS assigned_to_officers,
        SUM(CASE WHEN verification_status = 'officer_approved'          THEN 1 ELSE 0 END)                    AS approved,
        SUM(CASE WHEN verification_status = 'rejected'                  THEN 1 ELSE 0 END)                    AS rejected,
        SUM(CASE WHEN verification_status = 'officer_rejected'          THEN 1 ELSE 0 END)                    AS escalated,
        SUM(CASE WHEN sla_deadline < NOW() AND verification_status = 'assigned_for_verification' THEN 1 ELSE 0 END) AS overdue
      FROM listings
      WHERE verification_status IS NOT NULL
    `);

    res.json({ success: true, stats });
  } catch (err) {
    console.error("[GET STATS ERROR]", err.message);
    res.status(500).json({ success: false, message: "Internal Server Error" });
  }
});

module.exports = router;
