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
    // Get site stats from database
    const [siteStats] = await db.execute("SELECT * FROM site_stats");
    const statsMap = {};
    siteStats.forEach(stat => {
      statsMap[stat.key_name] = stat.value_int;
    });

    // 1. Total Happy Clients (Users)
    const [[{ user_count }]] = await db.execute("SELECT COUNT(*) as user_count FROM users");

    // 2. Active Listings
    const [[{ listing_count }]] = await db.execute("SELECT COUNT(*) as listing_count FROM listings WHERE is_active = 1");

    // 3. Total Vehicles (Motors category)
    const [[{ vehicle_count }]] = await db.execute("SELECT COUNT(*) as vehicle_count FROM listings WHERE category = 'motors' AND is_active = 1");

    res.json({
      success: true,
      data: {
        clients: statsMap.clients || (user_count || 0) + 1000,
        listings: statsMap.listings || (listing_count || 0) + 2500,
        vehicles: statsMap.vehicles || (vehicle_count || 0) + 1400,
        trade_success_rate: statsMap.trade_success_rate || 100
      }
    });
  } catch (err) {
    console.error("[GET /api/stats] Error:", err.message);
    res.status(500).json({ success: false, message: "Failed to fetch stats" });
  }
});

module.exports = router;
