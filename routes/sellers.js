/**
 * routes/sellers.js
 * Malazone.com — Progressive Seller Workspace API.
 *
 * Casual sellers keep today's zero-friction flow (any user can post).
 * Users who opt into a "store" profile get a dedicated seller dashboard and
 * a public storefront. seller_status drives UI only — it never gates
 * permissions (posting/editing stay open to every account as before).
 *
 * Routes:
 *   GET  /api/sellers/me            — dashboard summary (auth)
 *   POST /api/sellers/activate      — opt into store profile (auth)
 *   GET  /api/sellers/:userId       — public storefront profile
 *   GET  /api/sellers/:userId/listings — public active listings
 *
 * © 2026 Malazone Technologies PLC
 */

"use strict";

const express = require("express");
const db = require("../database/db");
const { requireUserAuth } = require("../middleware/userAuth");
const router = express.Router();

function firstImage(imagesJson) {
  if (!imagesJson) return null;
  try {
    const list = typeof imagesJson === "string" ? JSON.parse(imagesJson) : imagesJson;
    if (Array.isArray(list)) return list[0] || null;
    if (typeof list === "string") return list;
    return null;
  } catch (err) {
    return null;
  }
}

function mapListing(row) {
  return {
    id: row.id,
    title_en: row.title_en,
    title_am: row.title_am,
    category: row.category,
    sub_category: row.sub_category,
    price: Number(row.price),
    price_suffix: row.price_suffix,
    location_label_en: row.location_label_en,
    location_label_am: row.location_label_am,
    is_verified: Boolean(row.is_verified),
    view_count: Number(row.view_count),
    cover_image: firstImage(row.images),
    created_at: row.created_at,
  };
}

// GET /api/sellers/me — dashboard summary for the authenticated user
router.get("/me", requireUserAuth, async (req, res) => {
  try {
    const userId = req.user.id;

    const [[seller]] = await db.execute(
      "SELECT id, full_name, phone_number, email, seller_status, is_featured_seller, is_verified, created_at FROM users WHERE id = ?",
      [userId]
    );
    if (!seller) {
      return res.status(404).json({ success: false, message: "User not found" });
    }

    const [[portfolio]] = await db.execute(
      `SELECT
         COUNT(*) AS total_listings,
         COALESCE(SUM(status = 'active'), 0) AS active_listings,
         COALESCE(SUM(status = 'sold'), 0) AS sold_listings,
         COALESCE(SUM(status = 'pending'), 0) AS pending_listings,
         COALESCE(SUM(status = 'suspended'), 0) AS suspended_listings,
         COALESCE(SUM(is_verified = 1), 0) AS verified_listings,
         COALESCE(SUM(view_count), 0) AS total_views,
         COALESCE(SUM(is_active = 1), 0) AS promoted_listings
       FROM listings WHERE user_id = ?`,
      [userId]
    );

    const [[favorites]] = await db.execute(
      `SELECT COUNT(*) AS favorites_count
       FROM favorites f JOIN listings l ON f.listing_id = l.id
       WHERE l.user_id = ?`,
      [userId]
    );

    const [[ratings]] = await db.execute(
      `SELECT COALESCE(ROUND(AVG(rating), 1), 0) AS avg_rating, COUNT(*) AS review_count
       FROM ratings WHERE seller_id = ?`,
      [userId]
    );

    const [[messages]] = await db.execute(
      `SELECT COUNT(*) AS unread_inquiries
       FROM messages m
       JOIN listings l ON m.listing_id = l.id AND l.user_id = ?
       WHERE m.receiver_id = ? AND m.is_read = 0`,
      [userId, userId]
    );

    res.json({
      success: true,
      data: {
        seller: {
          id: seller.id,
          full_name: seller.full_name,
          phone_number: seller.phone_number,
          email: seller.email,
          seller_status: seller.seller_status,
          is_featured_seller: Boolean(seller.is_featured_seller),
          is_verified: Boolean(seller.is_verified),
          member_since: seller.created_at,
        },
        portfolio: {
          total_listings: Number(portfolio.total_listings),
          active_listings: Number(portfolio.active_listings),
          sold_listings: Number(portfolio.sold_listings),
          pending_listings: Number(portfolio.pending_listings),
          suspended_listings: Number(portfolio.suspended_listings),
          verified_listings: Number(portfolio.verified_listings),
          promoted_listings: Number(portfolio.promoted_listings),
          total_views: Number(portfolio.total_views),
          favorites_count: Number(favorites.favorites_count),
          avg_rating: Number(ratings.avg_rating),
          review_count: Number(ratings.review_count),
          unread_inquiries: Number(messages.unread_inquiries),
        },
      },
    });
  } catch (err) {
    console.error("[GET /sellers/me]", err);
    res.status(500).json({ success: false, message: "Failed to load seller dashboard" });
  }
});

// POST /api/sellers/activate — opt into a store profile (idempotent)
router.post("/activate", requireUserAuth, async (req, res) => {
  try {
    await db.execute("UPDATE users SET seller_status = 'store' WHERE id = ?", [req.user.id]);
    res.json({ success: true, seller_status: "store", message: "Seller store activated" });
  } catch (err) {
    console.error("[POST /sellers/activate]", err);
    res.status(500).json({ success: false, message: "Failed to activate seller store" });
  }
});

// GET /api/sellers/:userId — public storefront profile
router.get("/:userId(\\d+)", async (req, res) => {
  try {
    const userId = Number(req.params.userId);

    const [[seller]] = await db.execute(
      `SELECT u.id, u.full_name, u.seller_status, u.is_featured_seller, u.is_verified, u.created_at,
              COALESCE(ROUND(AVG(r.rating), 1), 0) AS avg_rating,
              COUNT(DISTINCT r.id) AS review_count,
              (SELECT COUNT(*) FROM listings l WHERE l.user_id = u.id AND l.status = 'active' AND l.is_active = 1) AS active_listings_count
       FROM users u
       LEFT JOIN ratings r ON r.seller_id = u.id
       WHERE u.id = ? AND u.seller_status = 'store'
       GROUP BY u.id`,
      [userId]
    );

    if (!seller) {
      return res.status(404).json({ success: false, message: "Store not found" });
    }

    res.json({
      success: true,
      data: {
        id: seller.id,
        full_name: seller.full_name,
        seller_status: seller.seller_status,
        is_featured_seller: Boolean(seller.is_featured_seller),
        is_verified: Boolean(seller.is_verified),
        avg_rating: Number(seller.avg_rating),
        review_count: Number(seller.review_count),
        active_listings_count: Number(seller.active_listings_count),
        member_since: seller.created_at,
      },
    });
  } catch (err) {
    console.error("[GET /sellers/:id]", err);
    res.status(500).json({ success: false, message: "Failed to load store" });
  }
});

// GET /api/sellers/:userId/listings — public active listings for a store
router.get("/:userId(\\d+)/listings", async (req, res) => {
  try {
    const userId = Number(req.params.userId);
    const [rows] = await db.execute(
      `SELECT id, title_en, title_am, category, sub_category, price, price_suffix,
              location_label_en, location_label_am, is_verified, view_count, images, created_at
       FROM listings
       WHERE user_id = ? AND status = 'active' AND is_active = 1
       ORDER BY created_at DESC
       LIMIT 60`,
      [userId]
    );
    res.json({ success: true, data: rows.map(mapListing) });
  } catch (err) {
    console.error("[GET /sellers/:id/listings]", err);
    res.status(500).json({ success: false, message: "Failed to load store listings" });
  }
});

module.exports = router;