/**
 * routes/site.js
 * Malazone.com — Site Content Management API
 * © 2026 Malazone Technologies PLC
 */

"use strict";

const express = require("express");
const db = require("../database/db");
const router = express.Router();

// ──────────────────────────────────────────────────────────────
// TRANSLATIONS (Public CMS Text)
// ──────────────────────────────────────────────────────────────
router.get("/translations", async (req, res) => {
  try {
    const [translations] = await db.execute(
      "SELECT text_key, en_value, am_value, section FROM translations"
    );
    // Convert array to a key-value map for the frontend context
    const textsMap = translations.reduce((acc, row) => {
      acc[row.text_key] = { en: row.en_value, amharic: row.am_value, section: row.section };
      return acc;
    }, {});
    res.json({ success: true, data: textsMap });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// ──────────────────────────────────────────────────────────────
// PROMO BANNERS
// ──────────────────────────────────────────────────────────────
router.get("/promo-banners", async (req, res) => {
  try {
    const [banners] = await db.execute(
      "SELECT * FROM promo_banners WHERE is_active = TRUE ORDER BY display_order ASC"
    );
    res.json({ success: true, data: banners });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

router.get("/promo-banners/all", async (req, res) => {
  try {
    const [banners] = await db.execute(
      "SELECT * FROM promo_banners ORDER BY display_order ASC"
    );
    res.json({ success: true, data: banners });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

router.post("/promo-banners", async (req, res) => {
  try {
    const { title_en, title_am, subtitle_en, subtitle_am, link_url, image_url, display_order } = req.body;
    const [result] = await db.execute(
      "INSERT INTO promo_banners (title_en, title_am, subtitle_en, subtitle_am, link_url, image_url, display_order) VALUES (?, ?, ?, ?, ?, ?, ?)",
      [title_en, title_am, subtitle_en, subtitle_am, link_url, image_url, display_order || 0]
    );
    res.json({ success: true, id: result.insertId, message: "Banner created successfully" });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

router.put("/promo-banners/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const { title_en, title_am, subtitle_en, subtitle_am, link_url, image_url, display_order, is_active } = req.body;
    const [result] = await db.execute(
      "UPDATE promo_banners SET title_en = ?, title_am = ?, subtitle_en = ?, subtitle_am = ?, link_url = ?, image_url = ?, display_order = ?, is_active = ? WHERE id = ?",
      [title_en, title_am, subtitle_en, subtitle_am, link_url, image_url, display_order, is_active, id]
    );
    if (result.affectedRows === 0) {
      return res.status(404).json({ success: false, message: "Banner not found" });
    }
    res.json({ success: true, message: "Banner updated successfully" });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

router.delete("/promo-banners/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const [result] = await db.execute("DELETE FROM promo_banners WHERE id = ?", [id]);
    if (result.affectedRows === 0) {
      return res.status(404).json({ success: false, message: "Banner not found" });
    }
    res.json({ success: true, message: "Banner deleted successfully" });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// ──────────────────────────────────────────────────────────────
// HERO SLIDES
// ──────────────────────────────────────────────────────────────
router.get("/hero-slides", async (req, res) => {
  try {
    const [slides] = await db.execute(
      "SELECT * FROM hero_slides WHERE is_active = TRUE ORDER BY display_order ASC"
    );
    res.json({ success: true, data: slides });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

router.get("/hero-slides/all", async (req, res) => {
  try {
    const [slides] = await db.execute(
      "SELECT * FROM hero_slides ORDER BY display_order ASC"
    );
    res.json({ success: true, data: slides });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

router.post("/hero-slides", async (req, res) => {
  try {
    const { image_url, pillar_key, category_id, label_en, label_am, display_order } = req.body;
    const [result] = await db.execute(
      "INSERT INTO hero_slides (image_url, pillar_key, category_id, label_en, label_am, display_order) VALUES (?, ?, ?, ?, ?, ?)",
      [image_url, pillar_key, category_id, label_en, label_am, display_order || 0]
    );
    res.json({ success: true, id: result.insertId, message: "Slide created successfully" });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

router.put("/hero-slides/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const { image_url, pillar_key, category_id, label_en, label_am, display_order, is_active } = req.body;
    const [result] = await db.execute(
      "UPDATE hero_slides SET image_url = ?, pillar_key = ?, category_id = ?, label_en = ?, label_am = ?, display_order = ?, is_active = ? WHERE id = ?",
      [image_url, pillar_key, category_id, label_en, label_am, display_order, is_active, id]
    );
    if (result.affectedRows === 0) {
      return res.status(404).json({ success: false, message: "Slide not found" });
    }
    res.json({ success: true, message: "Slide updated successfully" });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

router.delete("/hero-slides/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const [result] = await db.execute("DELETE FROM hero_slides WHERE id = ?", [id]);
    if (result.affectedRows === 0) {
      return res.status(404).json({ success: false, message: "Slide not found" });
    }
    res.json({ success: true, message: "Slide deleted successfully" });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// ──────────────────────────────────────────────────────────────
// SITE STATS
// ──────────────────────────────────────────────────────────────
router.get("/site-stats", async (req, res) => {
  try {
    const [stats] = await db.execute("SELECT * FROM site_stats");
    res.json({ success: true, data: stats });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

router.put("/site-stats/:key", async (req, res) => {
  try {
    const { key } = req.params;
    const { value_int, value_str, description_en, description_am } = req.body;
    const [result] = await db.execute(
      "UPDATE site_stats SET value_int = ?, value_str = ?, description_en = ?, description_am = ? WHERE key_name = ?",
      [value_int, value_str, description_en, description_am, key]
    );
    if (result.affectedRows === 0) {
      return res.status(404).json({ success: false, message: "Stat not found" });
    }
    res.json({ success: true, message: "Stat updated successfully" });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// ──────────────────────────────────────────────────────────────
// LOCATIONS
// ──────────────────────────────────────────────────────────────
router.get("/locations", async (req, res) => {
  try {
    const [locations] = await db.execute(
      "SELECT * FROM locations WHERE is_active = TRUE ORDER BY display_order ASC"
    );
    res.json({ success: true, data: locations });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

router.get("/locations/all", async (req, res) => {
  try {
    const [locations] = await db.execute(
      "SELECT * FROM locations ORDER BY display_order ASC"
    );
    res.json({ success: true, data: locations });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

router.post("/locations", async (req, res) => {
  try {
    const { key_name, label_en, label_am, sub_zones, display_order } = req.body;
    const [result] = await db.execute(
      "INSERT INTO locations (key_name, label_en, label_am, sub_zones, display_order) VALUES (?, ?, ?, ?, ?)",
      [key_name, label_en, label_am, JSON.stringify(sub_zones || []), display_order || 0]
    );
    res.json({ success: true, id: result.insertId, message: "Location created successfully" });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

router.put("/locations/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const { key_name, label_en, label_am, sub_zones, display_order, is_active } = req.body;
    const [result] = await db.execute(
      "UPDATE locations SET key_name = ?, label_en = ?, label_am = ?, sub_zones = ?, display_order = ?, is_active = ? WHERE id = ?",
      [key_name, label_en, label_am, JSON.stringify(sub_zones || []), display_order, is_active, id]
    );
    if (result.affectedRows === 0) {
      return res.status(404).json({ success: false, message: "Location not found" });
    }
    res.json({ success: true, message: "Location updated successfully" });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

router.delete("/locations/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const [result] = await db.execute("DELETE FROM locations WHERE id = ?", [id]);
    if (result.affectedRows === 0) {
      return res.status(404).json({ success: false, message: "Location not found" });
    }
    res.json({ success: true, message: "Location deleted successfully" });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// ──────────────────────────────────────────────────────────────
// CATEGORIES
// ──────────────────────────────────────────────────────────────
router.get("/categories", async (req, res) => {
  try {
    const [categories] = await db.execute(
      "SELECT * FROM categories WHERE is_active = TRUE ORDER BY display_order ASC"
    );
    res.json({ success: true, data: categories });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

router.get("/categories/all", async (req, res) => {
  try {
    const [categories] = await db.execute(
      "SELECT * FROM categories ORDER BY display_order ASC"
    );
    res.json({ success: true, data: categories });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

router.post("/categories", async (req, res) => {
  try {
    const { key_name, label_en, label_am, description_en, description_am, display_order } = req.body;
    const [result] = await db.execute(
      "INSERT INTO categories (key_name, label_en, label_am, description_en, description_am, display_order) VALUES (?, ?, ?, ?, ?, ?)",
      [key_name, label_en, label_am, description_en, description_am, display_order || 0]
    );
    res.json({ success: true, id: result.insertId, message: "Category created successfully" });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

router.put("/categories/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const { key_name, label_en, label_am, description_en, description_am, display_order, is_active } = req.body;
    const [result] = await db.execute(
      "UPDATE categories SET key_name = ?, label_en = ?, label_am = ?, description_en = ?, description_am = ?, display_order = ?, is_active = ? WHERE id = ?",
      [key_name, label_en, label_am, description_en, description_am, display_order, is_active, id]
    );
    if (result.affectedRows === 0) {
      return res.status(404).json({ success: false, message: "Category not found" });
    }
    res.json({ success: true, message: "Category updated successfully" });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

router.delete("/categories/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const [result] = await db.execute("DELETE FROM categories WHERE id = ?", [id]);
    if (result.affectedRows === 0) {
      return res.status(404).json({ success: false, message: "Category not found" });
    }
    res.json({ success: true, message: "Category deleted successfully" });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

module.exports = router;
