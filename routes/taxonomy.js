/**
 * routes/taxonomy.js
 * Public catalog taxonomy endpoints (Sprint 4).
 *
 *   GET /api/categories/tree              full nested tree
 *   GET /api/categories/:slug             node + children + inherited
 *                                         attributes + allowed brands
 *   GET /api/brands?q=&category=          brand list, optionally scoped
 *                                         to a category subtree
 */
"use strict";

const express = require("express");
const db = require("../database/db");
const { loadTaxonomy } = require("../utils/taxonomy");

const router = express.Router();

function nodeJson(t, id) {
  const c = t.byId.get(id);
  if (!c) return null;
  return {
    id: c.id,
    key_name: c.key_name,
    slug: c.slug,
    path: c.path,
    level: c.level,
    name_en: c.label_en,
    name_am: c.label_am,
    children: (t.childrenOf.get(c.id) || []).map((cid) => nodeJson(t, cid)),
  };
}

// GET /api/categories/tree
router.get("/tree", async (req, res) => {
  try {
    const t = await loadTaxonomy();
    const roots = t.rows.filter((c) => c.parent_id === null).map((c) => nodeJson(t, c.id));
    res.json({ success: true, data: roots });
  } catch (err) {
    console.error("[GET /categories/tree]", err);
    res.status(500).json({ success: false, message: "Failed to load category tree" });
  }
});

// GET /api/categories/:slug — detail incl. inherited attributes + brands
router.get("/:slug", async (req, res) => {
  try {
    const t = await loadTaxonomy();
    const node = t.bySlug.get(String(req.params.slug));
    if (!node) {
      return res.status(404).json({ success: false, message: "Category not found" });
    }

    // Attributes inherit from ancestors; nearest definition wins.
    const attributes = t.attributesFor(node.id).map((a) => ({
      attr_key: a.attr_key,
      label_en: a.label_en,
      label_am: a.label_am,
      input_type: a.input_type,
      unit: a.unit,
      options: a.options || [],
      is_required: !!a.is_required,
      is_filterable: !!a.is_filterable,
    }));

    // Brands: the node's own mappings if any (subcategory scoping), else
    // inherited from ancestors.
    const { brands } = await t.brandsFor(node.id);

    res.json({
      success: true,
      data: {
        ...nodeJson(t, node.id),
        attributes,
        brands,
      },
    });
  } catch (err) {
    console.error("[GET /categories/:slug]", err);
    res.status(500).json({ success: false, message: "Failed to load category" });
  }
});

module.exports = router;
