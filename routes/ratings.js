/**
 * routes/ratings.js
 * Malazone.com — Buyer → Seller Rating API
 * © 2026 Malazone Technologies PLC
 */

"use strict";

const express = require("express");
const db = require("../database/db");

const router = express.Router();

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
 * Check if current user has already rated a listing
 * Query: phone, listing_id
 */
router.get("/check", async (req, res) => {
  try {
    const { phone, listing_id } = req.query;
    if (!phone || !listing_id) {
      return res.json({ success: true, data: { rated: false } });
    }

    const cleanPhone = phone.replace(/\s/g, "");
    const [[user]] = await db.execute("SELECT id FROM users WHERE phone_number = ?", [cleanPhone]);
    if (!user) return res.json({ success: true, data: { rated: false } });

    const [[existing]] = await db.execute(
      "SELECT id, rating, review FROM ratings WHERE rater_id = ? AND listing_id = ?",
      [user.id, listing_id]
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
 * Submit a rating for a seller
 */
router.post("/", async (req, res) => {
  try {
    const { phone, listing_id, seller_id, rating, review } = req.body;

    if (!phone || !seller_id || !rating) {
      return res.status(400).json({
        success: false,
        message: "phone, seller_id, and rating are required",
      });
    }

    if (rating < 1 || rating > 5) {
      return res.status(400).json({
        success: false,
        message: "Rating must be between 1 and 5",
      });
    }

    const cleanPhone = phone.replace(/\s/g, "");
    const [[user]] = await db.execute("SELECT id FROM users WHERE phone_number = ?", [cleanPhone]);
    if (!user) {
      return res.status(404).json({ success: false, message: "User not found" });
    }

    // Can't rate yourself
    if (user.id === Number(seller_id)) {
      return res.status(400).json({ success: false, message: "You cannot rate yourself" });
    }

    // Check if already rated this listing
    if (listing_id) {
      const [[existing]] = await db.execute(
        "SELECT id FROM ratings WHERE rater_id = ? AND listing_id = ?",
        [user.id, listing_id]
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
      [listing_id || null, user.id, seller_id, rating, review || null]
    );

    const [[newRating]] = await db.execute("SELECT * FROM ratings WHERE id = ?", [result.insertId]);

    res.status(201).json({ success: true, data: newRating, message: "Rating submitted" });
  } catch (err) {
    console.error("[POST /ratings]", err);
    res.status(500).json({ success: false, message: "Failed to submit rating" });
  }
});

module.exports = router;
