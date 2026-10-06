/**
 * routes/ratings.js
 * Malazone.com — Buyer → Seller Rating API
 * © 2026 Malazone Technologies PLC
 */

"use strict";

const express = require("express");
const db = require("../database/db");
const { requireUserAuth } = require("../middleware/userAuth");

const router = express.Router();

// ── Helpers ─────────────────────────────────────────────
const toId = (value) => {
  const n = Number(value);
  return Number.isInteger(n) && n > 0 ? n : null;
};

/**
 * GET /api/ratings/seller/:userId
 * Get all ratings for a seller + summary stats
 */
router.get("/seller/:userId", async (req, res) => {
  try {
    const { userId } = req.params;

    const [[summary]] = await db.execute(
      `SELECT
        COUNT(*) AS total_reviews,
        ROUND(AVG(rating), 1) AS avg_rating,
        SUM(CASE WHEN rating = 5 THEN 1 ELSE 0 END) AS five_star,
        SUM(CASE WHEN rating = 4 THEN 1 ELSE 0 END) AS four_star,
        SUM(CASE WHEN rating = 3 THEN 1 ELSE 0 END) AS three_star,
        SUM(CASE WHEN rating = 2 THEN 1 ELSE 0 END) AS two_star,
        SUM(CASE WHEN rating = 1 THEN 1 ELSE 0 END) AS one_star
       FROM ratings WHERE seller_id = ?`,
      [userId]
    );

    const [reviews] = await db.execute(
      `SELECT r.*, u.full_name AS rater_name, l.title_en AS listing_title_en, l.title_am AS listing_title_am
       FROM ratings r
       JOIN users u ON u.id = r.rater_id
       LEFT JOIN listings l ON l.id = r.listing_id
       WHERE r.seller_id = ?
       ORDER BY r.created_at DESC
       LIMIT 20`,
      [userId]
    );

    res.json({
      success: true,
      data: {
        summary: {
          total_reviews: summary.total_reviews || 0,
          avg_rating: summary.avg_rating || 0,
          five_star: summary.five_star || 0,
          four_star: summary.four_star || 0,
          three_star: summary.three_star || 0,
          two_star: summary.two_star || 0,
          one_star: summary.one_star || 0,
        },
        reviews,
      },
    });
  } catch (err) {
    console.error("[GET /ratings/seller/:userId]", err);
    res.status(500).json({ success: false, message: "Failed to fetch ratings" });
  }
});

/**
 * GET /api/ratings/check
 * Check if the authenticated user has already rated a listing
 * Query: listing_id
 */
router.get("/check", requireUserAuth, async (req, res) => {
  try {
    const listingId = toId(req.query.listing_id);
    if (!listingId) {
      return res.json({ success: true, data: { rated: false } });
    }

    const [[existing]] = await db.execute(
      "SELECT id, rating, review FROM ratings WHERE rater_id = ? AND listing_id = ?",
      [req.user.id, listingId]
    );

    res.json({
      success: true,
      data: existing ? { rated: true, rating: existing.rating, review: existing.review } : { rated: false },
    });
  } catch (err) {
    console.error("[GET /ratings/check]", err);
    res.status(500).json({ success: false, message: "Failed to check rating" });
  }
});

/**
 * POST /api/ratings
 * Submit a rating for a seller (authenticated; rater = session user)
 */
router.post("/", requireUserAuth, async (req, res) => {
  try {
    const sellerId = toId(req.body.seller_id);
    const listingId = toId(req.body.listing_id);
    const rating = Number(req.body.rating);
    const review =
      typeof req.body.review === "string" ? req.body.review.trim().slice(0, 1000) : null;

    if (!sellerId || !Number.isInteger(rating)) {
      return res.status(400).json({
        success: false,
        message: "seller_id and integer rating are required",
      });
    }

    if (rating < 1 || rating > 5) {
      return res.status(400).json({
        success: false,
        message: "Rating must be between 1 and 5",
      });
    }

    // Rater identity comes from the session — never from the request body
    const raterId = req.user.id;

    // Can't rate yourself
    if (raterId === sellerId) {
      return res.status(400).json({ success: false, message: "You cannot rate yourself" });
    }

    // Check if already rated this listing
    if (listingId) {
      const [[existing]] = await db.execute(
        "SELECT id FROM ratings WHERE rater_id = ? AND listing_id = ?",
        [raterId, listingId]
      );
      if (existing) {
        // Update existing rating
        await db.execute(
          "UPDATE ratings SET rating = ?, review = ? WHERE id = ?",
          [rating, review || null, existing.id]
        );

        const [[updated]] = await db.execute("SELECT * FROM ratings WHERE id = ?", [existing.id]);
        return res.json({ success: true, data: updated, message: "Rating updated" });
      }
    }

    const [result] = await db.execute(
      `INSERT INTO ratings (listing_id, rater_id, seller_id, rating, review)
       VALUES (?, ?, ?, ?, ?)`,
      [listingId, raterId, sellerId, rating, review]
    );

    const [[newRating]] = await db.execute("SELECT * FROM ratings WHERE id = ?", [result.insertId]);

    res.status(201).json({ success: true, data: newRating, message: "Rating submitted" });
  } catch (err) {
    console.error("[POST /ratings]", err);
    res.status(500).json({ success: false, message: "Failed to submit rating" });
  }
});

module.exports = router;
