/**
 * routes/messages.js
 * Malazone.com — Buyer-Seller Chat API
 * All endpoints are authenticated; sender/receiver identity is derived from the
 * session cookie, never from client-supplied fields.
 * © 2026 Malazone Technologies PLC
 */

"use strict";

const express = require("express");
const db = require("../database/db");
const { requireUserOrAgentAuth } = require("../middleware/userOrAgentAuth");

const router = express.Router();

// ── Helpers ─────────────────────────────────────────────
const toId = (value) => {
  const n = Number(value);
  return Number.isInteger(n) && n > 0 ? n : null;
};

// Simple in-memory rate limiter: 20 messages / minute / user
const sendCounters = new Map();
function messageSendLimiter(req, res, next) {
  const key = req.user.id;
  const now = Date.now();
  const entry = sendCounters.get(key);

  if (!entry || now > entry.resetAt) {
    sendCounters.set(key, { count: 1, resetAt: now + 60_000 });
    return next();
  }

  entry.count += 1;
  if (entry.count > 20) {
    return res.status(429).json({
      success: false,
      message: "Too many messages. Please slow down.",
    });
  }
  next();
}

// Periodically purge stale counters to bound memory
setInterval(() => {
  const now = Date.now();
  for (const [key, entry] of sendCounters) {
    if (now > entry.resetAt) sendCounters.delete(key);
  }
}, 5 * 60_000).unref();

// ──────────────────────────────────────────────────────────────
// GET /api/messages/conversations
// List all conversations for the authenticated user
// ──────────────────────────────────────────────────────────────
router.get("/conversations", requireUserOrAgentAuth, async (req, res) => {
  try {
    const userId = req.user.id;

    const [conversations] = await db.execute(
      `SELECT
        m.*,
        u.full_name AS partner_name,
        u.phone_number AS partner_phone,
        l.title_en AS listing_title_en,
        l.title_am AS listing_title_am,
        l.images AS listing_images,
        l.price AS listing_price,
        l.category AS listing_category,
        (
          SELECT COUNT(*) FROM messages m2
          WHERE m2.sender_id = m.partner_id
            AND m2.receiver_id = ?
            AND m2.is_read = FALSE
        ) AS unread_count
      FROM (
        SELECT *,
          CASE WHEN sender_id = ? THEN receiver_id ELSE sender_id END AS partner_id,
          MAX(created_at) OVER (
            PARTITION BY CASE WHEN sender_id = ? THEN receiver_id ELSE sender_id END
          ) AS latest_at
        FROM messages
        WHERE sender_id = ? OR receiver_id = ?
      ) m
      INNER JOIN users u ON u.id = m.partner_id
      LEFT JOIN listings l ON l.id = m.listing_id
      WHERE m.created_at = m.latest_at
      GROUP BY m.partner_id, m.listing_id
      ORDER BY m.created_at DESC`,
      [userId, userId, userId, userId, userId]
    );

    res.json({ success: true, data: conversations });
  } catch (err) {
    console.error("[GET /messages/conversations]", err);
    res.status(500).json({ success: false, message: "Failed to fetch conversations" });
  }
});

// ──────────────────────────────────────────────────────────────
// GET /api/messages/thread
// Get messages between the authenticated user and a partner.
// Query: partner_id (required), listing_id (optional),
//        before_id (cursor for pagination), limit (default 50, max 100)
// Returns the NEWEST page (ending at the most recent message) or, when
// before_id is supplied, the page immediately older than that id.
// Response: { success, data (ASC), has_more }
// ──────────────────────────────────────────────────────────────
router.get("/thread", requireUserOrAgentAuth, async (req, res) => {
  try {
    const userId = req.user.id;
    const partnerId = toId(req.query.partner_id);
    const listingId = toId(req.query.listing_id);
    const beforeId = toId(req.query.before_id);
    let limit = toId(req.query.limit) || 50;
    if (limit > 100) limit = 100;

    if (!partnerId) {
      return res.status(400).json({ success: false, message: "partner_id is required" });
    }

    let sql = `
      SELECT m.*, u.full_name AS sender_name
      FROM messages m
      JOIN users u ON u.id = m.sender_id
      WHERE ((m.sender_id = ? AND m.receiver_id = ?) OR (m.sender_id = ? AND m.receiver_id = ?))
    `;
    const params = [userId, partnerId, partnerId, userId];

    if (listingId) {
      sql += " AND m.listing_id = ?";
      params.push(listingId);
    }
    if (beforeId) {
      sql += " AND m.id < ?";
      params.push(beforeId);
    }

    // Newest page first, then flip to chronological order for the client.
    sql += " ORDER BY m.id DESC LIMIT ?";
    params.push(limit);

    const [rows] = await db.execute(sql, params);
    rows.reverse();

    // Mark messages as read
    await db.execute(
      `UPDATE messages SET is_read = TRUE
       WHERE sender_id = ? AND receiver_id = ? AND is_read = FALSE`,
      [partnerId, userId]
    );

    res.json({ success: true, data: rows, has_more: rows.length === limit });
  } catch (err) {
    console.error("[GET /messages/thread]", err);
    res.status(500).json({ success: false, message: "Failed to fetch messages" });
  }
});

// ──────────────────────────────────────────────────────────────
// POST /api/messages
// Send a new message (sender is always the authenticated user)
// Body: receiver_id, message_text, listing_id (optional)
// ──────────────────────────────────────────────────────────────
router.post("/", requireUserOrAgentAuth, messageSendLimiter, async (req, res) => {
  try {
    const senderId = req.user.id;
    const receiverId = toId(req.body.receiver_id);
    const listingId = toId(req.body.listing_id);
    const messageText =
      typeof req.body.message_text === "string" ? req.body.message_text.trim() : "";

    if (!receiverId || !messageText) {
      return res.status(400).json({
        success: false,
        message: "receiver_id and message_text are required",
      });
    }

    if (messageText.length > 2000) {
      return res.status(400).json({ success: false, message: "Message too long (max 2000 characters)" });
    }

    if (receiverId === senderId) {
      return res.status(400).json({ success: false, message: "Cannot send a message to yourself" });
    }

    // Receiver must exist
    const [[receiver]] = await db.execute("SELECT id FROM users WHERE id = ?", [receiverId]);
    if (!receiver) {
      return res.status(404).json({ success: false, message: "Receiver not found" });
    }

    const [result] = await db.execute(
      `INSERT INTO messages (sender_id, receiver_id, listing_id, message_text)
       VALUES (?, ?, ?, ?)`,
      [senderId, receiverId, listingId, messageText]
    );

    const [[newMessage]] = await db.execute(
      `SELECT m.*, u.full_name AS sender_name
       FROM messages m
       JOIN users u ON u.id = m.sender_id
       WHERE m.id = ?`,
      [result.insertId]
    );

    // Emit via Socket.io if available. When the receiver has NO live
    // socket in their personal room, persist a durable notification so
    // they still learn about the message on next visit.
    const io = req.app.get("io");
    if (io) {
      io.to(`user_${receiverId}`).emit("new_message", newMessage);
      io.to(`user_${senderId}`).emit("new_message", newMessage);

      const receiverRoom = io.sockets.adapter.rooms.get(`user_${receiverId}`);
      if (!receiverRoom || receiverRoom.size === 0) {
        try {
          await db.execute(
            `INSERT INTO notifications (user_id, type, title, body, payload, listing_id)
             VALUES (?, 'new_message', ?, ?, ?, ?)`,
            [
              receiverId,
              `New message from ${newMessage.sender_name || "a buyer"}`,
              newMessage.message_text.slice(0, 500),
              JSON.stringify({ from_user_id: senderId, message_id: newMessage.id }),
              listingId,
            ]
          );
        } catch (notifErr) {
          console.error("[POST /messages] notification insert failed:", notifErr.message);
        }
      }
    }

    res.status(201).json({ success: true, data: newMessage });
  } catch (err) {
    console.error("[POST /messages]", err);
    res.status(500).json({ success: false, message: "Failed to send message" });
  }
});

// ──────────────────────────────────────────────────────────────
// GET /api/messages/unread-count
// Total unread message count for the authenticated user
// ──────────────────────────────────────────────────────────────
router.get("/unread-count", requireUserOrAgentAuth, async (req, res) => {
  try {
    const [[{ count }]] = await db.execute(
      "SELECT COUNT(*) AS count FROM messages WHERE receiver_id = ? AND is_read = FALSE",
      [req.user.id]
    );

    res.json({ success: true, data: { count } });
  } catch (err) {
    console.error("[GET /messages/unread-count]", err);
    res.status(500).json({ success: false, message: "Failed to fetch unread count" });
  }
});

module.exports = router;
