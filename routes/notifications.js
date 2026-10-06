/**
 * routes/notifications.js
 * User-facing in-app notification endpoints (F10 matrix).
 * Identity always comes from the session — users can only ever touch
 * their own rows.
 */
"use strict";

const express = require("express");
const db = require("../database/db");
const { requireUserAuth } = require("../middleware/userAuth");

const router = express.Router();

// GET /api/notifications?page=&limit=
router.get("/", requireUserAuth, async (req, res) => {
  try {
    const limit = Math.min(Math.max(parseInt(req.query.limit, 10) || 30, 1), 100);
    const page = Math.max(parseInt(req.query.page, 10) || 1, 1);
    const offset = (page - 1) * limit;

    const [rows] = await db.execute(
      `SELECT id, type, title, body, payload, listing_id, read_at, created_at
       FROM notifications WHERE user_id = ?
       ORDER BY created_at DESC LIMIT ? OFFSET ?`,
      [req.user.id, limit, offset]
    );
    const [[{ unread }]] = await db.execute(
      "SELECT COUNT(*) AS unread FROM notifications WHERE user_id = ? AND read_at IS NULL",
      [req.user.id]
    );

    res.json({ success: true, data: rows, unread_count: unread });
  } catch (err) {
    console.error("[GET /notifications]", err);
    res.status(500).json({ success: false, message: "Failed to fetch notifications" });
  }
});

// GET /api/notifications/unread-count — cheap poll for navbar badges
router.get("/unread-count", requireUserAuth, async (req, res) => {
  try {
    const [[{ unread }]] = await db.execute(
      "SELECT COUNT(*) AS unread FROM notifications WHERE user_id = ? AND read_at IS NULL",
      [req.user.id]
    );
    res.json({ success: true, unread });
  } catch (err) {
    console.error("[GET /notifications/unread-count]", err);
    res.status(500).json({ success: false, message: "Failed to fetch unread count" });
  }
});

// POST /api/notifications/:id/read
router.post("/:id/read", requireUserAuth, async (req, res) => {
  try {
    const id = Number(req.params.id);
    if (!Number.isInteger(id) || id <= 0) {
      return res.status(400).json({ success: false, message: "Invalid notification id" });
    }
    await db.execute(
      "UPDATE notifications SET read_at = CURRENT_TIMESTAMP WHERE id = ? AND user_id = ? AND read_at IS NULL",
      [id, req.user.id]
    );
    res.json({ success: true, message: "Marked as read" });
  } catch (err) {
    console.error("[POST /notifications/:id/read]", err);
    res.status(500).json({ success: false, message: "Failed to mark as read" });
  }
});

// POST /api/notifications/read-all
router.post("/read-all", requireUserAuth, async (req, res) => {
  try {
    const [result] = await db.execute(
      "UPDATE notifications SET read_at = CURRENT_TIMESTAMP WHERE user_id = ? AND read_at IS NULL",
      [req.user.id]
    );
    res.json({ success: true, message: `Marked ${result.affectedRows} notification(s) as read` });
  } catch (err) {
    console.error("[POST /notifications/read-all]", err);
    res.status(500).json({ success: false, message: "Failed to mark all as read" });
  }
});

module.exports = router;
