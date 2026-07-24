/**
 * routes/locations.js
 * Malazone.com — Locations API
 * Multi-city support with sub-zones
 * © 2026 Malazone Technologies PLC
 */

"use strict";

const express = require("express");
const db = require("../database/db");

const router = express.Router();

// Get all locations (cities)
router.get("/", async (req, res) => {
  try {
    const [rows] = await db.execute(
      "SELECT * FROM locations WHERE is_active = 1 ORDER BY display_order ASC"
    );
    res.json({ success: true, data: rows });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// Get single location by key
router.get("/:key", async (req, res) => {
  try {
    const { key } = req.params;
    const [[location]] = await db.execute(
      "SELECT * FROM locations WHERE key_name = ?",
      [key]
    );

    if (!location) {
      return res.status(404).json({ success: false, message: "Location not found" });
    }

    res.json({ success: true, data: location });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

module.exports = router;
