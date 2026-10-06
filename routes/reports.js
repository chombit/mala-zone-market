/**
 * routes/reports.js — Sprint 7 buyer-facing report endpoints.
 *
 *   POST /api/reports/listing/:id   file a report against a listing
 *   GET  /api/reports/mine          my filed reports + their outcomes
 *
 * Admin triage lives in routes/admin.js (queue, resolve, restore).
 */
"use strict";

const express = require("express");
const db = require("../database/db");
const { requireUserAuth } = require("../middleware/userAuth");
const { getUserActor, writeAuditLog } = require("../utils/auditLogger");

const router = express.Router();

const REASONS = new Set([
  "scam", "prohibited", "wrong_info", "already_sold", "duplicate", "other",
]);
const MAX_OPEN_REPORTS_PER_USER = 10;

router.post("/listing/:id", requireUserAuth, async (req, res) => {
  try {
    const id = Number(req.params.id);
    if (!Number.isInteger(id) || id <= 0) {
      return res.status(400).json({ success: false, message: "Invalid listing id" });
    }
    const reason = req.body?.reason;
    if (!REASONS.has(reason)) {
      return res.status(400).json({
        success: false,
        message: `reason must be one of: ${[...REASONS].join(", ")}`,
      });
    }
    const details = req.body?.details ? String(req.body.details).trim().slice(0, 1000) : null;

    const [[listing]] = await db.execute(
      "SELECT id, user_id, is_active FROM listings WHERE id = ?",
      [id]
    );
    if (!listing) {
      return res.status(404).json({ success: false, message: "Listing not found" });
    }
    if (listing.user_id === req.user.id) {
      return res.status(400).json({ success: false, message: "You cannot report your own listing" });
    }

    // One OPEN report per user per listing — resolved reports can be refiled.
    const [[dup]] = await db.execute(
      `SELECT id FROM listing_reports
       WHERE listing_id = ? AND reporter_user_id = ?
         AND status IN ('open','reviewing') LIMIT 1`,
      [id, req.user.id]
    );
    if (dup) {
      return res.status(409).json({
        success: false,
        message: "You already have an open report on this listing",
      });
    }

    const [[{ n }]] = await db.execute(
      `SELECT COUNT(*) AS n FROM listing_reports
       WHERE reporter_user_id = ? AND status IN ('open','reviewing')`,
      [req.user.id]
    );
    if (n >= MAX_OPEN_REPORTS_PER_USER) {
      return res.status(429).json({
        success: false,
        message: "Too many open reports — wait for moderation to resolve them",
      });
    }

    const [result] = await db.execute(
      `INSERT INTO listing_reports (listing_id, reporter_user_id, reason, details)
       VALUES (?, ?, ?, ?)`,
      [id, req.user.id, reason, details]
    );

    await writeAuditLog({
      req,
      userId: req.user.id,
      ...getUserActor(req.user),
      action: "report.create",
      resourceType: "listing",
      resourceId: id,
      details: { report_id: result.insertId, reason },
    });

    res.status(201).json({
      success: true,
      data: { report_id: result.insertId, status: "open" },
    });

    // Admin live feed — push new report
    const io = req.app.get("io");
    if (io) {
      io.to("admin_feed").emit("admin:new_report", {
        report_id: result.insertId,
        listing_id: id,
        reason,
        reporter_user_id: req.user.id,
        timestamp: Date.now(),
      });
    }
  } catch (err) {
    console.error("[POST /reports/listing/:id]", err);
    res.status(500).json({ success: false, message: "Failed to file report" });
  }
});

router.get("/mine", requireUserAuth, async (req, res) => {
  try {
    const [rows] = await db.execute(
      `SELECT r.id, r.listing_id, r.reason, r.details, r.status,
              r.resolution_note, r.created_at,
              l.title_en
       FROM listing_reports r JOIN listings l ON l.id = r.listing_id
       WHERE r.reporter_user_id = ?
       ORDER BY r.created_at DESC LIMIT 50`,
      [req.user.id]
    );
    res.json({ success: true, data: rows });
  } catch (err) {
    console.error("[GET /reports/mine]", err);
    res.status(500).json({ success: false, message: "Failed to fetch your reports" });
  }
});

module.exports = router;
