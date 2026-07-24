/**
 * routes/messages.js
 * Malazone.com — Buyer-Seller Chat API
 * © 2026 Malazone Technologies PLC
 */

"use strict";

const express = require("express");
const db = require("../database/db");

const router = express.Router();

/**
 * GET /api/messages/conversations
 * List all conversations for a user (latest message per chat partner)
 * Query: phone (required)
 */
router.get("/conversations", async (req, res) => {
  try {
    const { phone } = req.query;
    if (!phone) {
      return res.status(400).json({ success: false, message: "phone is required" });
    }

    const cleanPhone = phone.replace(/\s/g, "");

    const [[user]] = await db.execute(
      "SELECT id FROM users WHERE phone_number = ?",
      [cleanPhone]
    );
    if (!user) {
      return res.status(404).json({ success: false, message: "User not found" });
    }

    const userId = user.id;

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

/**
 * GET /api/messages/thread
 * Get all messages between two users about a specific listing
 * Query: phone, partner_id, listing_id (optional)
 */
router.get("/thread", async (req, res) => {
  try {
    const { phone, partner_id, listing_id } = req.query;
    if (!phone || !partner_id) {
      return res.status(400).json({ success: false, message: "phone and partner_id are required" });
    }

    const cleanPhone = phone.replace(/\s/g, "");

    const [[user]] = await db.execute(
      "SELECT id FROM users WHERE phone_number = ?",
      [cleanPhone]
    );
    if (!user) {
      return res.status(404).json({ success: false, message: "User not found" });
    }

    const userId = user.id;
    let sql = `
      SELECT m.*, u.full_name AS sender_name
      FROM messages m
      JOIN users u ON u.id = m.sender_id
      WHERE ((m.sender_id = ? AND m.receiver_id = ?) OR (m.sender_id = ? AND m.receiver_id = ?))
    `;
    const params = [userId, partner_id, partner_id, userId];

    if (listing_id) {
      sql += " AND m.listing_id = ?";
      params.push(listing_id);
    }

    sql += " ORDER BY m.created_at ASC";

    const [messages] = await db.execute(sql, params);

    // Mark messages as read
    await db.execute(
      `UPDATE messages SET is_read = TRUE
       WHERE sender_id = ? AND receiver_id = ? AND is_read = FALSE`,
      [partner_id, userId]
    );

    res.json({ success: true, data: messages });
  } catch (err) {
    console.error("[GET /messages/thread]", err);
    res.status(500).json({ success: false, message: "Failed to fetch messages" });
  }
});

/**
 * POST /api/messages
 * Send a new message
 */
router.post("/", async (req, res) => {
  try {
    const { sender_phone, receiver_id, listing_id, message_text } = req.body;

    if (!sender_phone || !receiver_id || !message_text) {
      return res.status(400).json({
        success: false,
        message: "sender_phone, receiver_id, and message_text are required",
      });
    }

    const cleanPhone = sender_phone.replace(/\s/g, "");

    const [[sender]] = await db.execute(
      "SELECT id FROM users WHERE phone_number = ?",
      [cleanPhone]
    );
    if (!sender) {
      return res.status(404).json({ success: false, message: "Sender not found" });
    }

    const [result] = await db.execute(
      `INSERT INTO messages (sender_id, receiver_id, listing_id, message_text)
       VALUES (?, ?, ?, ?)`,
      [sender.id, receiver_id, listing_id || null, message_text.trim()]
    );

    const [[newMessage]] = await db.execute(
      `SELECT m.*, u.full_name AS sender_name
       FROM messages m
       JOIN users u ON u.id = m.sender_id
       WHERE m.id = ?`,
      [result.insertId]
    );

    // Emit via Socket.io if available
    const io = req.app.get("io");
    if (io) {
      io.to(`user_${receiver_id}`).emit("new_message", newMessage);
      io.to(`user_${sender.id}`).emit("new_message", newMessage);
    }

    res.status(201).json({ success: true, data: newMessage });
  } catch (err) {
    console.error("[POST /messages]", err);
    res.status(500).json({ success: false, message: "Failed to send message" });
  }
});

/**
 * GET /api/messages/unread-count
 * Get total unread message count for a user
 * Query: phone
 */
router.get("/unread-count", async (req, res) => {
  try {
    const { phone } = req.query;
    if (!phone) {
      return res.status(400).json({ success: false, message: "phone is required" });
    }

    const cleanPhone = phone.replace(/\s/g, "");
    const [[user]] = await db.execute(
      "SELECT id FROM users WHERE phone_number = ?",
      [cleanPhone]
    );
    if (!user) {
      return res.json({ success: true, data: { count: 0 } });
    }

    const [[{ count }]] = await db.execute(
      "SELECT COUNT(*) AS count FROM messages WHERE receiver_id = ? AND is_read = FALSE",
      [user.id]
    );

    res.json({ success: true, data: { count } });
  } catch (err) {
    console.error("[GET /messages/unread-count]", err);
    res.status(500).json({ success: false, message: "Failed to fetch unread count" });
  }
});

module.exports = router;
