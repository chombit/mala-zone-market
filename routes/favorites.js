/**
 * routes/favorites.js
 * Malazone.com — User Favorites API
 * Server-synced favorites for authenticated users
 * © 2026 Malazone Technologies PLC
 */

"use strict";

const express = require("express");
const db = require("../database/db");
const { requireUserAuth } = require("../middleware/userAuth");

const router = express.Router();

/**
 * GET /api/favorites
 * Get all favorites for the authenticated user
 */
router.get("/", requireUserAuth, async (req, res) => {
  try {
    const [rows] = await db.execute(
      `SELECT f.id AS fav_id, f.created_at AS saved_at,
              l.id, l.title_en, l.title_am, l.price, l.price_suffix,
              l.category, l.location_key, l.location_label_en, l.location_label_am,
              l.images, l.phone, l.is_verified, l.is_premium, l.view_count,
              l.created_at AS listing_created_at
       FROM favorites f
       JOIN listings l ON f.listing_id = l.id
       WHERE f.user_id = ? AND l.is_active = 1
       ORDER BY f.created_at DESC`,
      [req.user.id]
    );

    // Parse images JSON for each listing
    const favorites = rows.map((row) => {
      if (row.images && typeof row.images === "string") {
        row.images = JSON.parse(row.images);
      }
      return row;
    });

    res.json({ success: true, data: favorites });
  } catch (err) {
    console.error("[GET /favorites]", err);
    res.status(500).json({ success: false, message: "Failed to fetch favorites" });
  }
});

/**
 * POST /api/favorites
 * Add a listing to favorites
 */
router.post("/", requireUserAuth, async (req, res) => {
  try {
    const { listing_id } = req.body;

    if (!listing_id) {
      return res.status(400).json({ success: false, message: "listing_id is required" });
    }

    // Verify listing exists
    const [[listing]] = await db.execute("SELECT id FROM listings WHERE id = ? AND is_active = 1", [listing_id]);
    if (!listing) {
      return res.status(404).json({ success: false, message: "Listing not found" });
    }

    // Insert (ignore duplicate)
    await db.execute(
      "INSERT IGNORE INTO favorites (user_id, listing_id) VALUES (?, ?)",
      [req.user.id, listing_id]
    );

    res.json({ success: true, message: "Added to favorites" });
  } catch (err) {
    console.error("[POST /favorites]", err);
    res.status(500).json({ success: false, message: "Failed to add favorite" });
  }
});

/**
 * DELETE /api/favorites/:listingId
 * Remove a listing from favorites
 */
router.delete("/:listingId", requireUserAuth, async (req, res) => {
  try {
    await db.execute(
      "DELETE FROM favorites WHERE user_id = ? AND listing_id = ?",
      [req.user.id, req.params.listingId]
    );
    res.json({ success: true, message: "Removed from favorites" });
  } catch (err) {
    console.error("[DELETE /favorites/:listingId]", err);
    res.status(500).json({ success: false, message: "Failed to remove favorite" });
  }
});

/**
 * POST /api/favorites/sync
 * Merge localStorage favorites into server (one-time migration on login)
 */
router.post("/sync", requireUserAuth, async (req, res) => {
  try {
    const { listing_ids } = req.body;

    if (!Array.isArray(listing_ids) || listing_ids.length === 0) {
      return res.json({ success: true, synced: 0 });
    }

    // Batch insert (ignore duplicates)
    let synced = 0;
    for (const id of listing_ids) {
      const [result] = await db.execute(
        "INSERT IGNORE INTO favorites (user_id, listing_id) VALUES (?, ?)",
        [req.user.id, id]
      );
      synced += result.affectedRows;
    }

    res.json({ success: true, synced });
  } catch (err) {
    console.error("[POST /favorites/sync]", err);
    res.status(500).json({ success: false, message: "Failed to sync favorites" });
  }
});

module.exports = router;
