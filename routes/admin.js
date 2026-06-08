/**
 * routes/admin.js
 * Malazone.com — Elite Admin Controller API
 * Secure operations for property verification and agent payouts
 * © 2026 Malazone Technologies PLC
 */

"use strict";

const express = require("express");
const db = require("../database/db");
const router = express.Router();

/**
 * POST /api/admin/payout-agent
 * Simulated telebirr for Business payout logic
 */
router.post("/payout-agent", async (req, res) => {
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

  } catch (err) {
    console.error("[ADMIN PAYOUT ERROR]", err);
    res.status(500).json({ success: false, message: "Internal Server Error" });
  }
});

/**
 * PATCH /api/admin/verify-listing/:id
 * Property Verification State Update
 */
router.patch("/verify-listing/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const { is_verified } = req.body;

    const [result] = await db.execute(
      "UPDATE listings SET is_verified = ? WHERE id = ?",
      [is_verified ? 1 : 0, id]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({ success: false, message: "Listing not found" });
    }

    res.json({
      success: true,
      message: is_verified ? "Listing Verified" : "Listing Verification Removed"
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
router.get("/analytics", async (req, res) => {
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
router.post("/listings", async (req, res) => {
  try {
    const {
      title_en, title_am, description_en, description_am,
      category, price, phone, whatsapp, location_key,
      is_premium, is_verified
    } = req.body;

    // Use system admin user (id: 1) as default for admin posts
    const user_id = 1; 

    const [result] = await db.execute(
      `INSERT INTO listings (
        user_id, title_en, title_am, description_en, description_am,
        category, price, phone, whatsapp, location_key,
        location_label_en, location_label_am,
        is_premium, is_verified, images
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        user_id, title_en, title_am, description_en, description_am,
        category, price, phone, whatsapp, location_key,
        "Hawassa, Ethiopia", "ሐዋሳ፣ ኢትዮጵያ",
        is_premium ? 1 : 0, is_verified ? 1 : 0,
        JSON.stringify(["https://images.unsplash.com/photo-1560518883-ce09059eeffa?w=800&q=80&fm=webp"])
      ]
    );

    res.json({ success: true, id: result.insertId });
  } catch (err) {
    console.error("[ADMIN ADD LISTING ERROR]", err);
    res.status(500).json({ success: false, message: err.message });
  }
});

/**
 * PUT /api/admin/listings/:id
 * Edit an existing listing from Admin
 */
router.put("/listings/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const {
      title_en, title_am, description_en, description_am,
      category, price, phone, whatsapp, location_key,
      is_premium, is_verified, is_active
    } = req.body;

    const [result] = await db.execute(
      `UPDATE listings SET 
        title_en = ?, title_am = ?, description_en = ?, description_am = ?,
        category = ?, price = ?, phone = ?, whatsapp = ?, location_key = ?,
        is_premium = ?, is_verified = ?, is_active = ?
      WHERE id = ?`,
      [
        title_en, title_am, description_en, description_am,
        category, price, phone, whatsapp, location_key,
        is_premium ? 1 : 0, is_verified ? 1 : 0, is_active ? 1 : 0,
        id
      ]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({ success: false, message: "Listing not found" });
    }

    res.json({ success: true, message: "Listing updated" });
  } catch (err) {
    console.error("[ADMIN EDIT LISTING ERROR]", err);
    res.status(500).json({ success: false, message: err.message });
  }
});

/**
 * DELETE /api/admin/listings/:id
 * Remove a listing from Admin
 */
router.delete("/listings/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const [result] = await db.execute("DELETE FROM listings WHERE id = ?", [id]);
    
    if (result.affectedRows === 0) {
      return res.status(404).json({ success: false, message: "Listing not found" });
    }

    res.json({ success: true, message: "Listing deleted" });
  } catch (err) {
    console.error("[ADMIN DELETE LISTING ERROR]", err);
    res.status(500).json({ success: false, message: err.message });
  }
});

module.exports = router;
