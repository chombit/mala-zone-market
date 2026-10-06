/**
 * routes/brands.js
 * GET /api/brands?q=&category=<slug> — brand registry, optionally scoped to
 * a category subtree via the category_brands mapping (inherited down the tree).
 */
"use strict";

const express = require("express");
const db = require("../database/db");
const { loadTaxonomy } = require("../utils/taxonomy");
const { requireUserAuth } = require("../middleware/userAuth");

const router = express.Router();

router.get("/", async (req, res) => {
  try {
    const { q, category } = req.query;

    if (!category) {
      const like = `%${String(q || "")}%`;
      const [rows] = await db.execute(
        "SELECT slug, name_en FROM brands WHERE is_active = 1 AND name_en LIKE ? ORDER BY name_en LIMIT 200",
        [like]
      );
      return res.json({ success: true, data: rows });
    }

    const t = await loadTaxonomy();
    const node = t.bySlug.get(String(category));
    if (!node) {
      return res.status(404).json({ success: false, message: "Category not found" });
    }

    // Nearest mapping wins: this node's own brand list if it has one,
    // otherwise inherited from its ancestry.
    const { brands: scoped } = await t.brandsFor(node.id);
    let rows = scoped;
    if (q) {
      rows = rows.filter((b) => b.name_en.toLowerCase().includes(String(q).toLowerCase()));
    }
    res.json({ success: true, data: rows });
  } catch (err) {
    console.error("[GET /brands]", err);
    res.status(500).json({ success: false, message: "Failed to load brands" });
  }
});

/**
 * POST /api/brands/requests — vendor/buyer brand request queue (Sprint 8g).
 * Creates a pending row for the admin approval flow. Slug is derived from
 * the name unless provided; duplicates (existing brand OR pending request)
 * are rejected with 409 so the queue stays clean.
 */
router.post("/requests", requireUserAuth, async (req, res) => {
  try {
    const nameEn = String(req.body?.name_en || "").trim().slice(0, 120);
    if (!nameEn) {
      return res.status(400).json({ success: false, message: "name_en is required" });
    }
    const slug = String(req.body?.slug || nameEn.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, ""));
    if (!/^[a-z0-9-]{1,60}$/.test(slug)) {
      return res.status(400).json({ success: false, message: "Could not derive a valid slug" });
    }

    const [[existingBrand]] = await db.execute("SELECT id FROM brands WHERE slug = ?", [slug]);
    if (existingBrand) {
      return res.status(409).json({ success: false, message: "That brand already exists" });
    }
    const [[pending]] = await db.execute(
      "SELECT id FROM brand_requests WHERE slug = ? AND status = 'pending'",
      [slug]
    );
    if (pending) {
      return res.status(409).json({ success: false, message: "A request for this brand is already under review" });
    }

    let categoryId = null;
    if (req.body?.category_id != null && /^\d+$/.test(String(req.body.category_id))) {
      categoryId = Number(req.body.category_id);
    }

    const [result] = await db.execute(
      `INSERT INTO brand_requests (name_en, slug, requested_category_id, note_en, requested_by)
       VALUES (?, ?, ?, ?, ?)`,
      [nameEn, slug, categoryId, String(req.body?.note_en || "").slice(0, 500) || null, req.user.id]
    );
    res.status(201).json({ success: true, id: result.insertId, status: "pending" });
  } catch (err) {
    console.error("[POST /brands/requests]", err);
    res.status(500).json({ success: false, message: "Failed to submit brand request" });
  }
});

module.exports = router;
