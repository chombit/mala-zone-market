/**
 * routes/site.js
 * Malazone.com — Site Content Management API
 * © 2026 Malazone Technologies PLC
 */

"use strict";

const express = require("express");
const db = require("../database/db");
const { requireAdminAuth, requireAdminRoles } = require("../middleware/adminAuth");

const router = express.Router();

/**
 * v(value, fallback)
 * Coalesce undefined -> bind-safe value. mysql2 rejects `undefined` binds
 * with a 500; every write handler below routes optional fields through this.
 */
const v = (value, fallback = null) => (value === undefined ? fallback : value);

// All mutating (non-GET) endpoints require an authenticated admin session.
// Sole exception: POST /contact is a public visitor inquiry form.
router.use((req, res, next) => {
  const isPublic =
    req.method === "GET" || (req.method === "POST" && req.path === "/contact");
  if (isPublic) return next();

  requireAdminAuth(req, res, () => {
    if (res.headersSent) return;
    requireAdminRoles("super_admin", "admin")(req, res, next);
  });
});

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
    res.status(500).json({ success: false, message: "Request failed" });
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
    res.status(500).json({ success: false, message: "Request failed" });
  }
});

router.get("/promo-banners/all", async (req, res) => {
  try {
    const [banners] = await db.execute(
      "SELECT * FROM promo_banners ORDER BY display_order ASC"
    );
    res.json({ success: true, data: banners });
  } catch (err) {
    res.status(500).json({ success: false, message: "Request failed" });
  }
});

router.post("/promo-banners", async (req, res) => {
  try {
    const { title_en, title_am, subtitle_en, subtitle_am, link_url, image_url, display_order } = req.body;
    if (!title_en || !title_am) {
      return res.status(400).json({ success: false, message: "title_en and title_am are required" });
    }
    const [result] = await db.execute(
      "INSERT INTO promo_banners (title_en, title_am, subtitle_en, subtitle_am, link_url, image_url, display_order) VALUES (?, ?, ?, ?, ?, ?, ?)",
      [v(title_en), v(title_am), v(subtitle_en), v(subtitle_am), v(link_url), v(image_url), v(display_order, 0)]
    );
    res.json({ success: true, id: result.insertId, message: "Banner created successfully" });
  } catch (err) {
    console.error("[POST /site/promo-banners]", err.message);
    res.status(500).json({ success: false, message: "Request failed" });
  }
});

router.put("/promo-banners/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const [[existing]] = await db.execute("SELECT * FROM promo_banners WHERE id = ?", [id]);
    if (!existing) return res.status(404).json({ success: false, message: "Banner not found" });
    const { title_en, title_am, subtitle_en, subtitle_am, link_url, image_url } = req.body;
    const [result] = await db.execute(
      "UPDATE promo_banners SET title_en = ?, title_am = ?, subtitle_en = ?, subtitle_am = ?, link_url = ?, image_url = ?, display_order = ?, is_active = ? WHERE id = ?",
      [
        v(title_en, existing.title_en), v(title_am, existing.title_am),
        v(subtitle_en, existing.subtitle_en), v(subtitle_am, existing.subtitle_am),
        v(link_url, existing.link_url), v(image_url, existing.image_url),
        v(req.body.display_order, existing.display_order),
        v(req.body.is_active, existing.is_active) ? 1 : 0, id,
      ]
    );
    if (result.affectedRows === 0) {
      return res.status(404).json({ success: false, message: "Banner not found" });
    }
    res.json({ success: true, message: "Banner updated successfully" });
  } catch (err) {
    console.error("[PUT /site/promo-banners/:id]", err.message);
    res.status(500).json({ success: false, message: "Request failed" });
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
    res.status(500).json({ success: false, message: "Request failed" });
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
    res.status(500).json({ success: false, message: "Request failed" });
  }
});

router.get("/hero-slides/all", async (req, res) => {
  try {
    const [slides] = await db.execute(
      "SELECT * FROM hero_slides ORDER BY display_order ASC"
    );
    res.json({ success: true, data: slides });
  } catch (err) {
    res.status(500).json({ success: false, message: "Request failed" });
  }
});

router.post("/hero-slides", async (req, res) => {
  try {
    const { image_url, pillar_key, category_id, label_en, label_am, display_order } = req.body;
    if (!image_url || !label_en || !label_am) {
      return res.status(400).json({ success: false, message: "image_url, label_en and label_am are required" });
    }
    const [result] = await db.execute(
      "INSERT INTO hero_slides (image_url, pillar_key, category_id, label_en, label_am, display_order) VALUES (?, ?, ?, ?, ?, ?)",
      [v(image_url), v(pillar_key, ""), v(category_id, ""), v(label_en), v(label_am), v(display_order, 0)]
    );
    res.json({ success: true, id: result.insertId, message: "Slide created successfully" });
  } catch (err) {
    console.error("[POST /site/hero-slides]", err.message);
    res.status(500).json({ success: false, message: "Request failed" });
  }
});

router.put("/hero-slides/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const [[existing]] = await db.execute("SELECT * FROM hero_slides WHERE id = ?", [id]);
    if (!existing) return res.status(404).json({ success: false, message: "Slide not found" });
    const { image_url, pillar_key, category_id, label_en, label_am } = req.body;
    const [result] = await db.execute(
      "UPDATE hero_slides SET image_url = ?, pillar_key = ?, category_id = ?, label_en = ?, label_am = ?, display_order = ?, is_active = ? WHERE id = ?",
      [
        v(image_url, existing.image_url), v(pillar_key, existing.pillar_key),
        v(category_id, existing.category_id), v(label_en, existing.label_en),
        v(label_am, existing.label_am), v(req.body.display_order, existing.display_order),
        v(req.body.is_active, existing.is_active) ? 1 : 0, id,
      ]
    );
    if (result.affectedRows === 0) {
      return res.status(404).json({ success: false, message: "Slide not found" });
    }
    res.json({ success: true, message: "Slide updated successfully" });
  } catch (err) {
    console.error("[PUT /site/hero-slides/:id]", err.message);
    res.status(500).json({ success: false, message: "Request failed" });
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
    res.status(500).json({ success: false, message: "Request failed" });
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
    res.status(500).json({ success: false, message: "Request failed" });
  }
});

router.put("/site-stats/:key", async (req, res) => {
  try {
    const { key } = req.params;
    const [[existing]] = await db.execute("SELECT * FROM site_stats WHERE key_name = ?", [key]);
    if (!existing) return res.status(404).json({ success: false, message: "Stat not found" });
    const { value_int, value_str, description_en, description_am } = req.body;
    const [result] = await db.execute(
      "UPDATE site_stats SET value_int = ?, value_str = ?, description_en = ?, description_am = ? WHERE key_name = ?",
      [v(value_int, existing.value_int), v(value_str, existing.value_str), v(description_en, existing.description_en), v(description_am, existing.description_am), key]
    );
    if (result.affectedRows === 0) {
      return res.status(404).json({ success: false, message: "Stat not found" });
    }
    res.json({ success: true, message: "Stat updated successfully" });
  } catch (err) {
    console.error("[PUT /site/site-stats/:key]", err.message);
    res.status(500).json({ success: false, message: "Request failed" });
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
    res.status(500).json({ success: false, message: "Request failed" });
  }
});

router.get("/locations/all", async (req, res) => {
  try {
    const [locations] = await db.execute(
      "SELECT * FROM locations ORDER BY display_order ASC"
    );
    res.json({ success: true, data: locations });
  } catch (err) {
    res.status(500).json({ success: false, message: "Request failed" });
  }
});

router.post("/locations", async (req, res) => {
  try {
    const { key_name, label_en, label_am, label_sid, sub_zones, display_order } = req.body;
    if (!key_name || !label_en || !label_am) {
      return res.status(400).json({ success: false, message: "key_name, label_en and label_am are required" });
    }
    const [result] = await db.execute(
      "INSERT INTO locations (key_name, label_en, label_am, label_sid, sub_zones, display_order) VALUES (?, ?, ?, ?, ?, ?)",
      [v(key_name), v(label_en), v(label_am), v(label_sid), JSON.stringify(sub_zones || []), v(display_order, 0)]
    );
    res.json({ success: true, id: result.insertId, message: "Location created successfully" });
  } catch (err) {
    console.error("[POST /site/locations]", err.message);
    res.status(500).json({ success: false, message: "Request failed" });
  }
});

router.put("/locations/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const [[existing]] = await db.execute("SELECT * FROM locations WHERE id = ?", [id]);
    if (!existing) return res.status(404).json({ success: false, message: "Location not found" });
    const { key_name, label_en, label_am, label_sid } = req.body;
    let zones;
    if (sub_zones !== undefined) {
      zones = typeof sub_zones === "string" ? sub_zones : JSON.stringify(sub_zones || []);
    }
    const [result] = await db.execute(
      "UPDATE locations SET key_name = ?, label_en = ?, label_am = ?, label_sid = ?, sub_zones = ?, display_order = ?, is_active = ? WHERE id = ?",
      [
        v(key_name, existing.key_name), v(label_en, existing.label_en),
        v(label_am, existing.label_am), v(label_sid, existing.label_sid),
        v(zones, existing.sub_zones), v(req.body.display_order, existing.display_order),
        v(req.body.is_active, !!existing.is_active) ? 1 : 0, id,
      ]
    );
    if (result.affectedRows === 0) {
      return res.status(404).json({ success: false, message: "Location not found" });
    }
    res.json({ success: true, message: "Location updated successfully" });
  } catch (err) {
    console.error("[PUT /site/locations/:id]", err.message);
    res.status(500).json({ success: false, message: "Request failed" });
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
    res.status(500).json({ success: false, message: "Request failed" });
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
    res.status(500).json({ success: false, message: "Request failed" });
  }
});

router.get("/categories/all", async (req, res) => {
  try {
    const [categories] = await db.execute(
      "SELECT * FROM categories ORDER BY display_order ASC"
    );
    res.json({ success: true, data: categories });
  } catch (err) {
    res.status(500).json({ success: false, message: "Request failed" });
  }
});

router.post("/categories", async (req, res) => {
  try {
    const { key_name, label_en, label_am, description_en, description_am, display_order } = req.body;
    if (!key_name || !label_en || !label_am) {
      return res.status(400).json({ success: false, message: "key_name, label_en and label_am are required" });
    }
    const [result] = await db.execute(
      "INSERT INTO categories (key_name, label_en, label_am, description_en, description_am, display_order) VALUES (?, ?, ?, ?, ?, ?)",
      [v(key_name), v(label_en), v(label_am), v(description_en), v(description_am), v(display_order, 0)]
    );
    res.json({ success: true, id: result.insertId, message: "Category created successfully" });
  } catch (err) {
    console.error("[POST /site/categories]", err.message);
    res.status(500).json({ success: false, message: "Request failed" });
  }
});

router.put("/categories/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const [[existing]] = await db.execute("SELECT * FROM categories WHERE id = ?", [id]);
    if (!existing) return res.status(404).json({ success: false, message: "Category not found" });
    const { key_name, label_en, label_am, description_en, description_am } = req.body;
    const [result] = await db.execute(
      "UPDATE categories SET key_name = ?, label_en = ?, label_am = ?, description_en = ?, description_am = ?, display_order = ?, is_active = ? WHERE id = ?",
      [
        v(key_name, existing.key_name), v(label_en, existing.label_en),
        v(label_am, existing.label_am), v(description_en, existing.description_en),
        v(description_am, existing.description_am), v(req.body.display_order, existing.display_order),
        v(req.body.is_active, !!existing.is_active) ? 1 : 0, id,
      ]
    );
    if (result.affectedRows === 0) {
      return res.status(404).json({ success: false, message: "Category not found" });
    }
    res.json({ success: true, message: "Category updated successfully" });
  } catch (err) {
    console.error("[PUT /site/categories/:id]", err.message);
    res.status(500).json({ success: false, message: "Request failed" });
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
    res.status(500).json({ success: false, message: "Request failed" });
  }
});

// ──────────────────────────────────────────────────────────────
// TESTIMONIALS
// ──────────────────────────────────────────────────────────────
router.get("/testimonials", async (req, res) => {
  try {
    const [testimonials] = await db.execute(
      "SELECT * FROM testimonials WHERE is_active = TRUE ORDER BY display_order ASC"
    );
    res.json({ success: true, data: testimonials });
  } catch (err) {
    res.status(500).json({ success: false, message: "Request failed" });
  }
});

router.post("/testimonials", async (req, res) => {
  try {
    const { reviewer_name_en, reviewer_name_am, text_en, text_am, rating, avatar_emoji, accent_color, display_order } = req.body;
    if (!reviewer_name_en || !text_en) {
      return res.status(400).json({ success: false, message: "reviewer_name_en and text_en are required" });
    }
    const [result] = await db.execute(
      "INSERT INTO testimonials (reviewer_name_en, reviewer_name_am, text_en, text_am, rating, avatar_emoji, accent_color, display_order) VALUES (?, ?, ?, ?, ?, ?, ?, ?)",
      [
        v(reviewer_name_en), v(reviewer_name_am, v(reviewer_name_en)),
        v(text_en), v(text_am, v(text_en)), Math.min(5, Math.max(1, Number(rating) || 5)),
        v(avatar_emoji, "👤"), v(accent_color, "#2563eb"), v(display_order, 0),
      ]
    );
    res.json({ success: true, id: result.insertId, message: "Testimonial created successfully" });
  } catch (err) {
    console.error("[POST /site/testimonials]", err.message);
    res.status(500).json({ success: false, message: "Request failed" });
  }
});

// ──────────────────────────────────────────────────────────────
// CONTACT FORM
// ──────────────────────────────────────────────────────────────
router.post("/contact", async (req, res) => {
  try {
    const { full_name, phone, email, subject, message } = req.body;

    if (!full_name || !phone || !message) {
      return res.status(400).json({
        success: false,
        message: "Name, phone and message are required",
        message_am: "ስም፣ ስልክ እና መልእክት ያስፈልጋሉ"
      });
    }

    const [result] = await db.execute(
      "INSERT INTO contact_messages (full_name, phone, email, subject, message) VALUES (?, ?, ?, ?, ?)",
      [full_name, phone, email || null, subject || null, message]
    );

    res.status(201).json({
      success: true,
      message: "Message sent successfully! We will contact you soon.",
      message_am: "መልእክትዎ በተሳካ ሁኔታ ተልኳል! በቅርቡ እናገኝዎታለን።",
      id: result.insertId
    });
  } catch (err) {
    res.status(500).json({ success: false, message: "Request failed" });
  }
});

// ──────────────────────────────────────────────────────────────
// SITE CONFIG (Social Links, Contact Info, etc.)
// ──────────────────────────────────────────────────────────────
router.get("/config", async (req, res) => {
  try {
    const [configs] = await db.execute("SELECT config_key, config_value FROM site_config");
    const configMap = configs.reduce((acc, row) => {
      try {
        acc[row.config_key] = JSON.parse(row.config_value);
      } catch {
        acc[row.config_key] = row.config_value;
      }
      return acc;
    }, {});
    res.json({ success: true, data: configMap });
  } catch (err) {
    res.status(500).json({ success: false, message: "Request failed" });
  }
});

router.post("/config", async (req, res) => {
  try {
    const { config_key, config_value } = req.body;
    if (!config_key || !config_value) {
      return res.status(400).json({ success: false, message: "config_key and config_value are required" });
    }
    const value = typeof config_value === "object" ? JSON.stringify(config_value) : config_value;
    await db.execute(
      "INSERT INTO site_config (config_key, config_value) VALUES (?, ?) ON DUPLICATE KEY UPDATE config_value = ?",
      [config_key, value, value]
    );
    res.json({ success: true, message: "Config saved successfully" });
  } catch (err) {
    res.status(500).json({ success: false, message: "Request failed" });
  }
});

module.exports = router;
