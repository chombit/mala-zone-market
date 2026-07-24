/**
 * routes/listings.js
 * Malazone.com — Elite Listings API
 * Advanced image pipeline: Sharp → WebP (80%) → 1200px
 * © 2026 Malazone Technologies PLC
 */

"use strict";

const express = require("express");
const multer = require("multer");
const sharp = require("sharp");
const path = require("path");
const fs = require("fs");
const { v4: uuidv4 } = require("uuid");
const db = require("../database/db");

const router = express.Router();

// ── Ensure Directories
const UPLOAD_DIR = path.join(__dirname, "..", "public", "uploads");
if (!fs.existsSync(UPLOAD_DIR)) fs.mkdirSync(UPLOAD_DIR, { recursive: true });

// ── Multer Config (Memory Storage)
const storage = multer.memoryStorage();
const upload = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024, files: 4 },
});

// ── Elite Image Processing Pipeline
/**
 * processImage
 * Optimizes smartphone photos for Ethio Telecom / Safaricom networks
 */
async function processImage(buffer) {
  const filename = `mala_${uuidv4()}.webp`;
  const outputPath = path.join(UPLOAD_DIR, filename);

  await sharp(buffer)
    .resize({ width: 1200, withoutEnlargement: true, fit: "inside" })
    .webp({ quality: 80, effort: 6 }) // High compression effort for data-saving
    .toFile(outputPath);

  return `/uploads/${filename}`;
}

// ── Routes
router.get("/", async (req, res) => {
  try {
    const { category, location_key, intention, city, limit = 20, offset = 0 } = req.query;

    let sql = `
      SELECT l.*, u.full_name as seller_name,
        COALESCE(r.avg_rating, 0) AS avg_rating,
        COALESCE(r.review_count, 0) AS review_count
      FROM listings l
      JOIN users u ON l.user_id = u.id
      LEFT JOIN (
        SELECT seller_id, ROUND(AVG(rating), 1) AS avg_rating, COUNT(*) AS review_count
        FROM ratings GROUP BY seller_id
      ) r ON r.seller_id = l.user_id
      WHERE l.is_active = 1
    `;
    const params = [];

    if (category) { sql += " AND l.category = ?"; params.push(category); }
    if (location_key) { sql += " AND l.location_key = ?"; params.push(location_key); }
    if (city) { sql += " AND l.location_key LIKE ?"; params.push(`${city}%`); }

    sql += " ORDER BY l.is_premium DESC, l.created_at DESC LIMIT ? OFFSET ?";
    params.push(Number(limit), Number(offset));

    const [rows] = await db.execute(sql, params);
    res.json({ success: true, data: rows });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

router.get("/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const [[listing]] = await db.execute(
      `SELECT l.*, u.full_name as seller_name,
        COALESCE(r.avg_rating, 0) AS avg_rating,
        COALESCE(r.review_count, 0) AS review_count
       FROM listings l 
       JOIN users u ON l.user_id = u.id 
       LEFT JOIN (
         SELECT seller_id, ROUND(AVG(rating), 1) AS avg_rating, COUNT(*) AS review_count
         FROM ratings GROUP BY seller_id
       ) r ON r.seller_id = l.user_id
       WHERE l.id = ?`,
      [id]
    );

    if (!listing) {
      return res.status(404).json({ success: false, message: "Listing not found" });
    }

    // Increment view count
    await db.execute("UPDATE listings SET view_count = view_count + 1 WHERE id = ?", [id]);

    // Parse images JSON
    if (listing.images && typeof listing.images === "string") {
      listing.images = JSON.parse(listing.images);
    }

    res.json({ success: true, data: listing });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

router.post("/", upload.fields([{ name: "images", maxCount: 4 }]), async (req, res) => {
  try {
    const body = req.body;
    const imageFiles = req.files?.images || [];
    
    // Process all images to WebP
    const imageUrls = await Promise.all(imageFiles.map(f => processImage(f.buffer)));

    // Normalize phone
    const phone = body.phone.replace(/\s/g, "");

    // Simple upsert for user
    let userId;
    const [[user]] = await db.execute("SELECT id FROM users WHERE phone_number = ?", [phone]);
    if (user) {
      userId = user.id;
    } else {
      const [ins] = await db.execute(
        "INSERT INTO users (full_name, phone_number) VALUES (?, ?)",
        [body.full_name || "Mala Client", phone]
      );
      userId = ins.insertId;
    }

    // Insert Listing with comprehensive fields
    const [result] = await db.execute(
      `INSERT INTO listings (
        user_id, title_am, title_en, category, price, price_suffix, 
        location_key, location_label_am, location_label_en, 
        phone, whatsapp, images, is_active, is_premium,
        plate_code, fuel_type, machinery_brand, bedrooms, bathrooms, area_sqm,
        title_deed, description_am, description_en, is_negotiable, rating,
        condition_type, view_count, is_verified
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 1, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        userId, body.title_am, body.title_en, body.category, 
        Number(body.price), body.price_suffix || "fixed",
        body.location_key, body.location_label_am, body.location_label_en,
        phone, body.whatsapp || phone, JSON.stringify(imageUrls),
        body.is_premium === "true" || body.is_premium === 1 ? 1 : 0,
        body.plate_code || null, body.fuel_type || null, 
        body.machinery_brand || null, 
        body.bedrooms ? Number(body.bedrooms) : null,
        body.bathrooms ? Number(body.bathrooms) : null,
        body.area_sqm ? Number(body.area_sqm) : null,
        body.title_deed || null,
        body.description_am || null,
        body.description_en || null,
        body.is_negotiable === "true" || body.is_negotiable === 1 ? 1 : 0,
        body.rating ? Number(body.rating) : 0,
        body.condition_type || null,
        body.view_count ? Number(body.view_count) : 0,
        body.is_verified === "true" || body.is_verified === 1 ? 1 : 0
      ]
    );

    res.status(201).json({ success: true, id: result.insertId });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: "Upload failed" });
  }
});

module.exports = router;
