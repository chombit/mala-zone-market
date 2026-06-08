/**
 * routes/stats.js
 * Malazone.com — Platform Statistics API
 * © 2026 Malazone Technologies PLC
 */

"use strict";

const express = require("express");
const db = require("../database/db");
const router = express.Router();

/**
 * GET /api/stats
 * Returns aggregate metrics for the Hero section
 */
router.get("/", async (req, res) => {
  try {
    // 1. Total Happy Clients (Users)
    const [[{ user_count }]] = await db.execute("SELECT COUNT(*) as user_count FROM users");
    
    // 2. Active Listings
    const [[{ listing_count }]] = await db.execute("SELECT COUNT(*) as listing_count FROM listings WHERE is_active = 1");
    
    // 3. Total Vehicles (Motors category)
    const [[{ vehicle_count }]] = await db.execute("SELECT COUNT(*) as vehicle_count FROM listings WHERE category = 'motors' AND is_active = 1");

    res.json({
      success: true,
      data: {
        clients: (user_count || 0) + 1000, // Base offset for established feel
        listings: (listing_count || 0) + 2500, // Base offset
        vehicles: (vehicle_count || 0) + 1400, // Base offset
        trade_success_rate: 100 // Constant for direct trade
      }
    });
  } catch (err) {
    console.error("[GET /api/stats] Error:", err.message);
    res.status(500).json({ success: false, message: "Failed to fetch stats" });
  }
});

module.exports = router;
