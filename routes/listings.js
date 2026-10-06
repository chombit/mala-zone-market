/**
 * routes/listings.js
 * Malazone.com — Elite Listings API
 * Advanced image pipeline: Sharp → WebP (80%) → 1200px
 * © 2026 Malazone Technologies PLC
 */

"use strict";

const express = require("express");
const multer = require("multer");
const rateLimit = require("express-rate-limit");
const db = require("../database/db");
const { requireUserAuth } = require("../middleware/userAuth");
const { getUserActor, writeAuditLog } = require("../utils/auditLogger");
const { createNotification } = require("../utils/notify");
const { broadcastListingChange } = require("../utils/listingRealtime");
const { loadTaxonomy, normalizeCategory } = require("../utils/taxonomy");
const { evaluateNewListing } = require("../utils/alerts");
const { buildLocationFilter } = require("../utils/locations");

const router = express.Router();

// ── Listing creation throttle (per IP): prevents spam floods on top of the
// global 200/15min API limiter.
const createListingLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 20,
  standardHeaders: true,
  legacyHeaders: false,
  message: { success: false, message: "Too many listings created. Please try again later." },
});

// ── Multer Config (Memory Storage)
const storage = multer.memoryStorage();
const upload = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024, files: 5 },
});

// ── Shared image pipeline (sharp → WebP → optional watermark)
const { processImage } = require("../utils/imageProcessor");
const { getPackages, getPaymentConfig, generatePromoReference, PROMO_METHODS, expireExpiredPremiums } = require("../utils/promos");

// ── Routes
/**
 * attr_<key> virtual columns + indexes created by
 * database/migrations/add_attribute_generated_columns.js. Filters on these
 * keys reference the column directly — MariaDB will NOT substitute JSON
 * expressions into vcols automatically, so the literal column name is what
 * makes idx_attr_<key> usable. Keys not listed here fall back to inline
 * JSON_EXTRACT expressions.
 */
const INDEXED_ATTR_KEYS = new Set([
  "condition",
  "storage_capacity",
  "screen_size",
  "battery_health",
  "ram",
  "processor",
  "land_type",
  "road_access",
  "size_class",
  "furnishing",
]);

/**
 * buildListingFilters — shared WHERE-builder for public listing reads
 * (Sprint 8f). Powers GET /listings and the facet-count endpoint.
 * opts.excludeDim omits ONE facet dimension while building, which is what
 * makes per-dimension faceted counts possible ("Samsung (12)" semantics).
 */
async function buildListingFilters(query, opts = {}) {
  const exclude = opts.excludeDim || null; // null|"subcategory"|"brand"|"attr:<key>"
  const {
    category, location_key, city, q,
    intent,
    price_min, price_max,
    verified,
    condition_type, fuel_type, bedrooms_min, guests_min,
  } = query;

  const where = ["l.is_active = 1"];
  const params = [];

  if (category) { where.push("l.category = ?"); params.push(normalizeCategory(category)); }
  if (location_key) { where.push("l.location_key = ?"); params.push(String(location_key)); }

  // ── Buy / Rent intent ─────────────────────────────────────────────────
  // Property-style listing types are first-class filters: `buy` = sale rows
  // (incl. legacy empty-suffix rows), `rent`/`book`/`hourly` = rental units.
  if (intent !== undefined && intent !== "") {
    switch (intent) {
      case "buy":
        where.push("COALESCE(NULLIF(l.price_suffix, ''), 'fixed') = 'fixed'");
        break;
      case "rent":
        where.push("l.price_suffix IN ('per_month', 'per_day', 'per_hour')");
        break;
      case "book":
        where.push("l.price_suffix IN ('per_day', 'per_hour')");
        break;
      case "hourly":
        where.push("l.price_suffix = 'per_hour'");
        break;
      default:
        return { error: { status: 400, payload: { success: false, message: "Invalid intent" } } };
    }
  }

  // Sprint 8: a CITY param must also match the district keys registered
  // under it (bole/kazanchis/... for addis_ababa), not just prefixes.
  const cityFilter = await buildLocationFilter(city);
  if (cityFilter) {
    where.push(cityFilter.fragment);
    params.push(...cityFilter.params);
  }

  // ── Taxonomy facets ────────────────────────────────────────────────────
  const taxonomy = await loadTaxonomy();

  if (query.subcategory && exclude !== "subcategory") {
    const node = taxonomy.bySlug.get(String(query.subcategory));
    if (!node) {
      return { error: { status: 400, payload: { success: false, message: "Unknown subcategory" } } };
    }
    const ids = taxonomy.descendantIds(node.id);
    const placeholders = ids.map(() => "?").join(",");
    // Legacy rows created before tagging have subcategory_id NULL — at ROOT
    // level they still surface through their category enum value.
    const rootFallback =
      node.parent_id === null
        ? " OR (l.subcategory_id IS NULL AND l.category = ?)"
        : "";
    where.push(`(l.subcategory_id IN (${placeholders})${rootFallback})`);
    params.push(...ids);
    if (node.parent_id === null) params.push(node.key_name);
  }

  let brandJoin = "";
  if (query.brand && exclude !== "brand") {
    brandJoin = " JOIN brands fb ON fb.id = l.brand_id";
    where.push("fb.slug = ?");
    params.push(String(query.brand).toLowerCase());
  }

  // Dynamic attribute facets: ?attr_ram_gb=8&attr_transmission=Automatic
  const attrParamKeys = Object.keys(query).filter((k) => k.startsWith("attr_"));
  for (const paramKey of attrParamKeys.slice(0, 10)) {
    const attrKey = paramKey.slice(5);
    if (!/^[a-z0-9_]{1,50}$/.test(attrKey)) continue;
    if (exclude === `attr:${attrKey}`) continue;
    const rawValue = String(query[paramKey]);

    // Find the definition anywhere in the tree to learn its input_type
    let defType = "text";
    outer: for (const catId of [...taxonomy.byId.keys()]) {
      for (const def of taxonomy.attributesFor(catId)) {
        if (def.attr_key === attrKey) { defType = def.input_type; break outer; }
      }
    }

    if (defType === "number") {
      const n = Number(rawValue);
      if (!Number.isFinite(n)) continue;
      if (INDEXED_ATTR_KEYS.has(attrKey)) {
        where.push(`l.attr_${attrKey} = ?`); // hits idx_attr_<key> vcol
      } else {
        where.push(`JSON_EXTRACT(l.attributes, '$.${attrKey}') = ?`);
      }
      params.push(n);
    } else if (defType === "boolean") {
      const bit = rawValue === "true" || rawValue === "1" ? 1 : 0;
      if (INDEXED_ATTR_KEYS.has(attrKey)) {
        // Preserve legacy semantics: "false" also matches rows with the
        // attribute missing entirely.
        where.push(
          bit === 1
            ? `l.attr_${attrKey} = 'true'`
            : `(l.attr_${attrKey} = 'false' OR l.attr_${attrKey} IS NULL)`
        );
      } else {
        where.push(`COALESCE(JSON_EXTRACT(l.attributes, '$.${attrKey}') = TRUE, 0) = ?`);
        params.push(bit);
      }
    } else if (INDEXED_ATTR_KEYS.has(attrKey)) {
      where.push(`l.attr_${attrKey} = ?`); // hits idx_attr_<key> vcol
      params.push(rawValue);
    } else {
      where.push(`JSON_UNQUOTE(JSON_EXTRACT(l.attributes, '$.${attrKey}')) = ?`);
      params.push(rawValue);
    }
  }

  const pMin = Number(price_min);
  if (price_min !== undefined && price_min !== "" && Number.isFinite(pMin)) {
    where.push("l.price >= ?"); params.push(pMin);
  }
  const pMax = Number(price_max);
  if (price_max !== undefined && price_max !== "" && Number.isFinite(pMax)) {
    where.push("l.price <= ?"); params.push(pMax);
  }

  if (verified === "1" || verified === "true") { where.push("l.is_verified = 1"); }
  if (condition_type && CONDITION_TYPES.has(condition_type)) { where.push("l.condition_type = ?"); params.push(condition_type); }
  if (fuel_type && FUEL_TYPES.has(fuel_type)) { where.push("l.fuel_type = ?"); params.push(fuel_type); }
  const bMin = Number(bedrooms_min);
  if (bedrooms_min !== undefined && bedrooms_min !== "" && Number.isFinite(bMin)) {
    where.push("l.bedrooms >= ?"); params.push(Math.floor(bMin));
  }
  // Stays are sold by headcount, so occupancy is the floor guests shop on.
  // The client's "5+" sends 5 — an upper bound is not meaningful here.
  const gMin = Number(guests_min);
  if (guests_min !== undefined && guests_min !== "" && Number.isFinite(gMin)) {
    where.push("l.capacity >= ?"); params.push(Math.floor(gMin));
  }

  const hasQuery = typeof q === "string" && q.trim().length > 0;
  if (hasQuery) {
    // Search terms must FILTER — otherwise q would only reorder rows and
    // every listing would match every query.
    where.push(
      "MATCH(l.title_en, l.title_am, l.description_en, l.description_am) AGAINST(? IN NATURAL LANGUAGE MODE)"
    );
    params.push(q.trim().slice(0, 200));
  }

  return { where, params, brandJoin, taxonomy, hasQuery };
}

/**
 * GET /api/listings — public search & discovery.
 *
 * Full-text search via the ft_listings_search index (natural-language mode,
 * MariaDB InnoDB). Filters: category, location, price range, verified,
 * condition/fuel type, bedroom floor. Sorts: relevance (auto when `q` given),
 * newest, price_asc, price_desc, trending (HN-style gravity decay).
 */
router.get("/", async (req, res) => {
  try {
    // Lazy janitor: expire lapsed paid premiums so ranking stays truthful.
    await expireExpiredPremiums();

    const { sort, limit = 20, offset = 0 } = req.query;

    const built = await buildListingFilters(req.query);
    if (built.error) return res.status(built.error.status).json(built.error.payload);
    const { where, params, brandJoin, hasQuery } = built;
    const matchParams = hasQuery ? [String(req.query.q).trim().slice(0, 200)] : [];

    let relevanceSelect = "";
    if (hasQuery) {
      relevanceSelect = `,
        MATCH(l.title_en, l.title_am, l.description_en, l.description_am)
          AGAINST(? IN NATURAL LANGUAGE MODE) AS relevance`;
    }

    const TREND_SCORE = "(l.view_count / POW(GREATEST(TIMESTAMPDIFF(HOUR, l.created_at, NOW()), 0) + 2, 1.5))";
    let orderBy = "l.is_premium DESC, l.created_at DESC"; // newest (default)
    switch (sort) {
      case "relevance":
        if (hasQuery) orderBy = "relevance DESC, l.is_premium DESC, l.created_at DESC";
        break;
      case "price_asc": orderBy = "l.price ASC"; break;
      case "price_desc": orderBy = "l.price DESC"; break;
      case "trending": orderBy = `${TREND_SCORE} DESC`; break;
      default:
        if (hasQuery) orderBy = "relevance DESC, l.is_premium DESC, l.created_at DESC";
    }

    const parsedLimit = Math.min(Math.max(parseInt(limit, 10) || 20, 1), 100);
    const parsedOffset = Math.max(parseInt(offset, 10) || 0, 0);

    const baseSql = `
      FROM listings l
      JOIN users u ON l.user_id = u.id
      ${brandJoin}
      LEFT JOIN (
        SELECT seller_id, ROUND(AVG(rating), 1) AS avg_rating, COUNT(*) AS review_count
        FROM ratings GROUP BY seller_id
      ) r ON r.seller_id = l.user_id
      WHERE ${where.join(" AND ")}
    `;

    const dataSql = `
      SELECT l.*, u.full_name as seller_name,
        COALESCE(r.avg_rating, 0) AS avg_rating,
        COALESCE(r.review_count, 0) AS review_count,
        sc.slug AS subcategory_slug,
        COALESCE(sc.label_en, '') AS subcategory_name,
        b.slug AS brand_slug,
        COALESCE(b.name_en, '') AS brand_name${relevanceSelect}
      FROM listings l
      JOIN users u ON l.user_id = u.id
      LEFT JOIN categories sc ON sc.id = l.subcategory_id
      LEFT JOIN brands b ON b.id = l.brand_id
      ${brandJoin}
      LEFT JOIN (
        SELECT seller_id, ROUND(AVG(rating), 1) AS avg_rating, COUNT(*) AS review_count
        FROM ratings GROUP BY seller_id
      ) r ON r.seller_id = l.user_id
      WHERE ${where.join(" AND ")}
      ORDER BY ${orderBy}
      LIMIT ? OFFSET ?
    `;
    const [rows] = await db.execute(dataSql, [...matchParams, ...params, parsedLimit, parsedOffset]);

    // Expose the dynamic attributes as a parsed object on every row
    for (const row of rows) {
      if (typeof row.attributes === "string" && row.attributes.length > 1) {
        try { row.attributes = JSON.parse(row.attributes); } catch { row.attributes = {}; }
      } else {
        row.attributes = row.attributes || {};
      }
    }

    const countSql = `SELECT COUNT(*) AS total ${baseSql}`;
    const [[{ total }]] = await db.execute(countSql, params);

    res.json({
      success: true,
      data: rows,
      pagination: {
        total,
        limit: parsedLimit,
        offset: parsedOffset,
        hasMore: parsedOffset + rows.length < total,
      },
    });
  } catch (err) {
    console.error("[GET /listings]", err);
    res.status(500).json({ success: false, message: "Failed to fetch listings" });
  }
});

/**
 * GET /api/listings/facets — per-option counts for the filter UI (Sprint 8f).
 *
 * Standard faceted-search semantics: each dimension is counted with ALL
 * other filters applied EXCEPT its own, so selecting "Samsung" never hides
 * the count for "Apple". Dimensions: subcategory, brand and every option-
 * based attribute defined on the active scope node (subcategory or root).
 *
 * Response: { subcategories: {slug: n}, brands: {slug: n},
 *             attributes: {attr_key: {value: n}} }
 */
router.get("/facets", async (req, res) => {
  try {
    const taxonomy = await loadTaxonomy();

    // Scope node decides which attribute definitions get counted — mirrors
    // the sidebar's effectiveFacetCategory logic.
    let scopeNode = null;
    if (req.query.subcategory) {
      scopeNode = taxonomy.bySlug.get(String(req.query.subcategory)) || null;
    } else if (req.query.category) {
      scopeNode =
        taxonomy.rows.find(
          (c) => c.key_name === normalizeCategory(req.query.category) && c.parent_id === null
        ) || null;
    }

    const runCount = async (excludeDim, selectFrom) => {
      const built = await buildListingFilters(req.query, { excludeDim });
      if (built.error) throw new Error(built.error.payload.message);
      return db.execute(selectFrom(built), built.params);
    };

    // ── Subcategories ──
    const [subRows] = await runCount(
      "subcategory",
      (b) =>
        `SELECT sc.slug AS slug, COUNT(*) AS c FROM listings l
         LEFT JOIN categories sc ON sc.id = l.subcategory_id ${b.brandJoin}
         WHERE ${b.where.join(" AND ")} AND l.subcategory_id IS NOT NULL
         GROUP BY sc.slug`
    );
    const subcategories = {};
    for (const r of subRows) subcategories[r.slug] = r.c;

    // ── Brands ──
    const [brandRows] = await runCount(
      "brand",
      (b) =>
        `SELECT b.slug AS slug, COUNT(*) AS c FROM listings l
         JOIN brands b ON b.id = l.brand_id
         WHERE ${b.where.join(" AND ")}
         GROUP BY b.slug`
    );
    const brands = {};
    for (const r of brandRows) if (r.slug) brands[r.slug] = r.c;

    // ── Attributes (option-based defs on the scope node only) ──
    const attributes = {};
    if (scopeNode) {
      const defs = taxonomy.attributesFor(scopeNode.id).filter(
        (d) => d.is_filterable !== 0 && ["select", "multiselect"].includes(d.input_type)
      );
      for (const def of defs.slice(0, 12)) {
        const built = await buildListingFilters(req.query, { excludeDim: `attr:${def.attr_key}` });
        if (built.error) continue;
        // Indexed keys read straight off their virtual column; the rest use
        // an inline literal path (attr_key is regex-validated taxonomy data,
        // never user input).
        const vcol = INDEXED_ATTR_KEYS.has(def.attr_key)
          ? `l.attr_${def.attr_key}`
          : `JSON_UNQUOTE(JSON_EXTRACT(l.attributes, '$.${def.attr_key}'))`;
        const [rows] = await db.execute(
          `SELECT ${vcol} AS v, COUNT(*) AS c
           FROM listings l ${built.brandJoin}
           WHERE ${built.where.join(" AND ")} AND ${vcol} IS NOT NULL
           GROUP BY v`,
          built.params
        );
        const counts = {};
        for (const r of rows) if (r.v !== null && r.v !== "") counts[r.v] = r.c;
        attributes[def.attr_key] = counts;
      }
    }

    res.json({ success: true, data: { subcategories, brands, attributes } });
  } catch (err) {
    console.error("[GET /listings/facets]", err);
    res.status(500).json({ success: false, message: "Failed to compute facets" });
  }
});

// ── Trending: gravity-weighted views over the last 30 days.
// score = view_count / (hours_since_creation + 2)^1.5 — Hacker-News-style
// decay so fresh listings outrank stale high-view ones.
router.get("/trending", async (req, res) => {
  try {
    const parsedLimit = Math.min(Math.max(parseInt(req.query.limit, 10) || 12, 1), 50);
    const [rows] = await db.execute(
      `SELECT id, title_en, title_am, category, price, price_suffix, images, view_count, created_at,
              ROUND(view_count / POW(GREATEST(TIMESTAMPDIFF(HOUR, created_at, NOW()), 0) + 2, 1.5), 3) AS trend_score
       FROM listings
       WHERE is_active = 1 AND status = 'active' AND created_at > NOW() - INTERVAL 30 DAY
       ORDER BY trend_score DESC
       LIMIT ?`,
      [parsedLimit]
    );
    res.json({ success: true, data: rows });
  } catch (err) {
    console.error("[GET /listings/trending]", err);
    res.status(500).json({ success: false, message: "Failed to fetch trending listings" });
  }
});

// ── Static routes MUST be declared before "/:id", otherwise "/mine"
// would be swallowed by the id param handler and 404 forever.

router.get("/mine", requireUserAuth, async (req, res) => {
  try {
    const [rows] = await db.execute(
      `SELECT id, title_en, title_am, category, price, price_suffix, is_active, is_verified, status, view_count, created_at
       FROM listings WHERE user_id = ? ORDER BY created_at DESC`,
      [req.user.id]
    );
    res.json({ success: true, data: rows });
  } catch (err) {
    console.error("[GET /listings/mine]", err);
    res.status(500).json({ success: false, message: "Failed to fetch listings" });
  }
});

// Seller dashboard analytics — portfolio aggregates in one round trip.
// Static path declared before "/:id".
router.get("/mine/analytics", requireUserAuth, async (req, res) => {
  try {
    const [[portfolio]] = await db.execute(
      `SELECT
         COUNT(*) AS total_listings,
         COALESCE(SUM(status = 'active'), 0) AS active_listings,
         COALESCE(SUM(status = 'sold'), 0) AS sold_listings,
         COALESCE(SUM(is_verified = 1), 0) AS verified_listings,
         COALESCE(SUM(view_count), 0) AS total_views
       FROM listings WHERE user_id = ?`,
      [req.user.id]
    );

    const [[favorites]] = await db.execute(
      `SELECT COUNT(*) AS favorites_count
       FROM favorites f JOIN listings l ON f.listing_id = l.id
       WHERE l.user_id = ?`,
      [req.user.id]
    );

    const [[ratings]] = await db.execute(
      `SELECT COALESCE(ROUND(AVG(rating), 1), 0) AS avg_rating, COUNT(*) AS review_count
       FROM ratings WHERE seller_id = ?`,
      [req.user.id]
    );

    res.json({
      success: true,
      data: {
        total_listings: Number(portfolio.total_listings),
        active_listings: Number(portfolio.active_listings),
        sold_listings: Number(portfolio.sold_listings),
        verified_listings: Number(portfolio.verified_listings),
        total_views: Number(portfolio.total_views),
        favorites_count: Number(favorites.favorites_count),
        avg_rating: Number(ratings.avg_rating),
        review_count: Number(ratings.review_count),
      },
    });
  } catch (err) {
    console.error("[GET /listings/mine/analytics]", err);
    res.status(500).json({ success: false, message: "Failed to fetch seller analytics" });
  }
});

// ── Listing count by location (declared before "/:id" so the literal
// path is never swallowed by the id param handler).
router.get("/count", async (req, res) => {
  try {
    const { location, categories } = req.query;

    let query = "SELECT COUNT(*) as count FROM listings WHERE is_active = 1";
    const params = [];

    if (location) {
      // Same city→district resolution as the main search endpoint
      const locFilter = await buildLocationFilter(location, "location_key");
      if (locFilter) {
        query += ` AND ${locFilter.fragment}`;
        params.push(...locFilter.params);
      }
    }

    // Sprint 8g: real counts for category tiles — a UI "zone" may merge
    // several root categories (e.g. furniture zone = stay + furniture).
    if (categories && typeof categories === "string") {
      const list = categories.split(",").map((c) => c.trim()).filter(Boolean).slice(0, 6);
      if (list.length > 0) {
        query += ` AND category IN (${list.map(() => "?").join(",")})`;
        params.push(...list);
      }
    }

    const [[result]] = await db.execute(query, params);
    res.json({ success: true, count: result.count });
  } catch (err) {
    console.error("[GET /listings/count] Error:", err);
    res.status(500).json({ success: false, message: "Failed to count listings" });
  }
});

// ─────────────────────────────────────────────
// SELF-SERVE PROMOTION PACKAGES + PAYMENT
// (declared before "/:id" so literal paths are never swallowed)
// ─────────────────────────────────────────────

// GET /api/listings/promos/packages — public package list + manual payment instructions
router.get("/promos/packages", async (req, res) => {
  try {
    const packages = await getPackages();
    res.json({ success: true, data: packages, payment: getPaymentConfig() });
  } catch (err) {
    console.error("[GET /listings/promos/packages]", err);
    res.status(500).json({ success: false, message: "Failed to load packages" });
  }
});

// POST /api/listings/:id/promo — create a promotion order for an existing listing.
// Price always comes from the server-side `packages` row; the client only
// sends the package id + manual payment method.
router.post("/:id/promo", requireUserAuth, async (req, res) => {
  try {
    const listingId = Number(req.params.id);
    const { package_id, method } = req.body;
    if (!Number.isInteger(listingId) || listingId <= 0) {
      return res.status(400).json({ success: false, message: "Invalid listing id" });
    }
    if (!PROMO_METHODS.has(method)) {
      return res.status(400).json({ success: false, message: "Invalid payment method" });
    }

    const [[listing]] = await db.execute(
      "SELECT id FROM listings WHERE id = ? AND user_id = ? AND is_active = 1",
      [listingId, req.user.id]
    );
    if (!listing) {
      return res.status(404).json({ success: false, message: "Listing not found or access denied" });
    }

    const packageId = Number(package_id);
    const [[pkg]] = await db.execute(
      "SELECT id, slug, name_en, name_am, price_etb, duration_days FROM packages WHERE id = ? AND is_active = 1",
      [packageId]
    );
    if (!pkg) {
      return res.status(400).json({ success: false, message: "Invalid package" });
    }

    const [[active]] = await db.execute(
      "SELECT id FROM listing_promos WHERE listing_id = ? AND status IN ('pending','submitted','verified') LIMIT 1",
      [listingId]
    );
    if (active) {
      return res.status(409).json({
        success: false,
        message: "This listing already has an active promotion order",
      });
    }

    const reference = generatePromoReference(req.user.id);
    const [result] = await db.execute(
      `INSERT INTO listing_promos (user_id, listing_id, package_id, amount_etb, method, reference, status)
       VALUES (?, ?, ?, ?, ?, ?, 'pending')`,
      [req.user.id, listingId, pkg.id, pkg.price_etb, method, reference]
    );

    const io = req.app.get("io");
    if (io) {
      io.to("admin_feed").emit("admin:promo_order", {
        promo_id: result.insertId,
        listing_id: listingId,
        amount_etb: pkg.price_etb,
        user_id: req.user.id,
        reference,
        timestamp: Date.now(),
      });
    }

    res.status(201).json({
      success: true,
      data: {
        order_id: result.insertId,
        reference,
        amount_etb: pkg.price_etb,
        method,
        package: {
          slug: pkg.slug,
          name_en: pkg.name_en,
          name_am: pkg.name_am,
          duration_days: pkg.duration_days,
        },
        instructions: getPaymentConfig()[method],
      },
    });
  } catch (err) {
    console.error("[POST /listings/:id/promo]", err);
    res.status(500).json({ success: false, message: "Failed to create promotion order" });
  }
});

// POST /api/listings/promos/:orderId/evidence — upload manual payment screenshots.
router.post("/promos/:orderId/evidence", requireUserAuth, upload.array("evidence", 3), async (req, res) => {
  try {
    const orderId = Number(req.params.orderId);
    if (!Number.isInteger(orderId) || orderId <= 0) {
      return res.status(400).json({ success: false, message: "Invalid order id" });
    }
    const [[order]] = await db.execute(
      "SELECT * FROM listing_promos WHERE id = ? AND user_id = ?",
      [orderId, req.user.id]
    );
    if (!order) {
      return res.status(404).json({ success: false, message: "Order not found or access denied" });
    }
    if (order.status !== "pending") {
      return res.status(400).json({ success: false, message: `Order is already ${order.status}` });
    }
    const files = req.files || [];
    if (files.length === 0) {
      return res.status(400).json({ success: false, message: "At least one screenshot is required" });
    }

    // Evidence is internal proof — never watermarked.
    const evidenceUrls = await Promise.all(files.map((f) => processImage(f.buffer)));
    const sellerNote = typeof req.body.note === "string" ? req.body.note.slice(0, 500) : null;

    const [result] = await db.execute(
      `UPDATE listing_promos SET status = 'submitted', evidence_urls = ?, seller_note = ?, updated_at = NOW()
       WHERE id = ? AND status = 'pending'`,
      [JSON.stringify(evidenceUrls), sellerNote, orderId]
    );
    if (result.affectedRows !== 1) {
      return res.status(409).json({ success: false, message: "Order changed concurrently" });
    }

    res.json({ success: true, message: "Payment evidence submitted for review" });
  } catch (err) {
    console.error("[POST /listings/promos/:orderId/evidence]", err);
    res.status(500).json({ success: false, message: "Failed to submit payment evidence" });
  }
});

// ── Individual listing by id (declared after literal routes on purpose) ──
router.get("/:id", async (req, res) => {
  try {
    const { id } = req.params;
    if (!/^\d+$/.test(id)) {
      return res.status(400).json({ success: false, message: "Invalid listing id" });
    }

    const [[listing]] = await db.execute(
      `SELECT l.*, u.full_name as seller_name, u.seller_status AS seller_status,
        sc.slug AS subcategory_slug,
        COALESCE(sc.label_en, '') AS subcategory_name,
        b.slug AS brand_slug,
        COALESCE(b.name_en, '') AS brand_name,
        COALESCE(r.avg_rating, 0) AS avg_rating,
        COALESCE(r.review_count, 0) AS review_count
       FROM listings l
       JOIN users u ON l.user_id = u.id
       LEFT JOIN categories sc ON sc.id = l.subcategory_id
       LEFT JOIN brands b ON b.id = l.brand_id
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

    // Fire-and-forget view count — never blocks or fails the response.
    // ?count_view=0 lets realtime availability refreshes avoid inflating stats.
    if (req.query.count_view !== "0") {
      db.execute("UPDATE listings SET view_count = view_count + 1 WHERE id = ?", [id])
        .catch((e) => console.warn("[listings] view_count increment failed:", e.message));
    }

    // Parse images JSON defensively — a corrupt row must not 500 the page.
    if (typeof listing.images === "string" && listing.images.length > 0) {
      try {
        listing.images = JSON.parse(listing.images);
      } catch {
        listing.images = [];
      }
    } else if (listing.images == null) {
      listing.images = [];
    }

    // Dynamic taxonomy attributes as a plain object
    if (typeof listing.attributes === "string" && listing.attributes.length > 1) {
      try { listing.attributes = JSON.parse(listing.attributes); } catch { listing.attributes = {}; }
    } else {
      listing.attributes = listing.attributes || {};
    }

    res.json({ success: true, data: listing });
  } catch (err) {
    console.error("[GET /listings/:id]", err);
    res.status(500).json({ success: false, message: "Failed to fetch listing" });
  }
});

// ── Create Listing (authenticated).
// Privilege fields are SERVER-CONTROLLED: clients can never set is_premium,
// is_verified, rating or view_count. Elevation happens only through the
// admin verification flow.
router.post(
  "/",
  createListingLimiter,
  requireUserAuth,
  upload.fields([{ name: "images", maxCount: 5 }]),
  async (req, res) => {
    try {
      const body = req.body;
      const imageFiles = req.files?.images || [];

      if (!body.title_en || !body.title_am || !body.category) {
        return res.status(400).json({
          success: false,
          message: "title_en, title_am, and category are required",
        });
      }
      if (!body.location_key || typeof body.location_key !== "string") {
        return res.status(400).json({
          success: false,
          message: "location_key is required",
        });
      }

      // Process all images to WebP, watermarking with the seller's name
      const imageUrls = await Promise.all(imageFiles.map(f =>
        processImage(f.buffer, { watermark: { name: req.user.full_name || "" } })
      ));

      const phone = (body.phone || req.user.phone_number || "").replace(/\s/g, "");

      // Server-side input guards before touching the DB.
      // Sprint 9a: legacy slugs (ceremony/heavy) are accepted and persisted
      // under their new names so older clients keep working.
      body.category = normalizeCategory(body.category);
      const VALID_CATEGORIES = new Set(["property", "motors", "stay", "furniture", "fashion", "electronics"]);
      if (!VALID_CATEGORIES.has(body.category)) {
        return res.status(400).json({ success: false, message: "Invalid category" });
      }
      const price = Number(body.price);
      if (!Number.isFinite(price) || price <= 0) {
        return res.status(400).json({ success: false, message: "A positive price is required" });
      }

      // ── Taxonomy resolution (Sprint 4 → 8e): subcategory + brand + attributes ──
      // Shared with POST /listings/buyer via resolveTaxonomyForWrite().
      const taxonomy = await loadTaxonomy();
      const tx = await resolveTaxonomyForWrite(body, taxonomy);
      if (tx.error) return res.status(tx.error.status).json(tx.error.payload);
      const subcategoryId = tx.subcategoryId;
      const brandId = tx.brandId;
      const attrValues = tx.attrValues;

      // Mirror hot attributes into the legacy columns so existing filters and
      // the G2B queue keep working during the frontend transition.
      const mirror = (key, fallback) =>
        body[key] !== undefined ? body[key] : (attrValues[key] ?? fallback);
      const bedrooms = mirror("bedrooms") ? Number(mirror("bedrooms")) : null;
      const bathrooms = mirror("bathrooms") ? Number(mirror("bathrooms")) : null;
      const areaSqm = mirror("area_sqm") ? Number(mirror("area_sqm")) : null;

      // Insert Listing with comprehensive fields
      const [result] = await db.execute(
        `INSERT INTO listings (
          user_id, title_am, title_en, category, price, price_suffix,
          location_key, location_label_am, location_label_en,
          phone, whatsapp, images, is_active, is_premium,
          plate_code, fuel_type, machinery_brand, bedrooms, bathrooms, area_sqm,
          title_deed, description_am, description_en,
          condition_type, view_count, is_verified,
          subcategory_id, brand_id, attributes
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 1, 0, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 0, 0, ?, ?, ?)`,
        [
          req.user.id, body.title_am, body.title_en, body.category,
          price, PRICE_SUFFIXES.has(body.price_suffix) ? body.price_suffix : "fixed",
          body.location_key ?? null,
          body.location_label_am ?? null, body.location_label_en ?? null,
          phone, body.whatsapp || phone, JSON.stringify(imageUrls),
          body.plate_code || null, body.fuel_type || null,
          body.machinery_brand || null,
          bedrooms,
          bathrooms,
          areaSqm,
          body.title_deed || null,
          body.description_am || null,
          body.description_en || null,
          CONDITION_TYPES.has(body.condition_type) ? body.condition_type : null,
          subcategoryId,
          brandId,
          JSON.stringify(attrValues),
        ]
      );

      res.status(201).json({ success: true, id: result.insertId });

      // Admin live feed — push the new listing to all admin sockets
      const io = req.app.get("io");
      if (io) {
        io.to("admin_feed").emit("admin:new_listing", {
          id: result.insertId,
          title_en: body.title_en,
          title_am: body.title_am,
          category: body.category,
          price: Number(body.price) || 0,
          user_id: req.user.id,
          timestamp: Date.now(),
        });
      }

      // Real-time availability to all visitors / agents
      broadcastListingChange(io, {
        action: "created",
        id: result.insertId,
        is_active: body.is_active !== false,
        category: body.category,
        location_key: body.location_key || body.city || null,
      });

      // Sprint 6: fan the new listing out to saved-search alerts.
      // evaluateNewListing never throws; run detached so the response
      // is not delayed by matching work.
      evaluateNewListing(result.insertId);
    } catch (err) {
    console.error("[POST /listings]", err);
    res.status(500).json({ success: false, message: "Failed to create listing" });
    }
  }
);

// ─────────────────────────────────────────────
// SHARED TAXONOMY PIPELINE (Sprint 8e)
// ─────────────────────────────────────────────
// Used by POST /listings and POST /listings/buyer. Resolves + validates
// subcategory, brand and dynamic attributes against the live taxonomy tree.
// Returns { error: { status, payload } } or the resolved write fields.
async function resolveTaxonomyForWrite(body, taxonomy) {
  let subcategoryId = null;
  let brandId = null;
  let attrValues = {};

  if (body.subcategory) {
    const sub = /^\d+$/.test(String(body.subcategory))
      ? taxonomy.byId.get(Number(body.subcategory))
      : taxonomy.bySlug.get(String(body.subcategory));
    if (!sub || sub.parent_id === null) {
      return { error: { status: 400, payload: { success: false, message: "Invalid subcategory" } } };
    }
    const root = taxonomy.byId.get(sub.parent_id);
    if (!root || root.key_name !== body.category) {
      return {
        error: {
          status: 400,
          payload: {
            success: false,
            message: `Subcategory "${sub.slug}" does not belong to category "${body.category}"`,
          },
        },
      };
    }
    subcategoryId = sub.id;
  } else {
    // No subcategory given → fall back to the category root so attribute
    // definitions declared on roots still apply.
    const rootRow = taxonomy.rows.find((c) => c.key_name === body.category && c.parent_id === null);
    if (rootRow) subcategoryId = rootRow.id;
  }

  if (body.brand) {
    const brand = /^\d+$/.test(String(body.brand))
      ? taxonomy.allBrands.find((b) => Number(b.id) === Number(body.brand))
      : taxonomy.allBrands.find((b) => b.slug === String(body.brand).toLowerCase());
    if (!brand) {
      return { error: { status: 400, payload: { success: false, message: "Unknown brand" } } };
    }
    const allowed = await taxonomy.brandAllowed(subcategoryId, brand.id);
    if (!allowed) {
      return {
        error: {
          status: 400,
          payload: {
            success: false,
            message: `Brand "${brand.name_en}" is not available for this category`,
          },
        },
      };
    }
    brandId = brand.id;
  }

  if (body.attributes !== undefined) {
    let input = body.attributes;
    if (typeof input === "string") {
      try {
        input = JSON.parse(input);
      } catch {
        return {
          error: {
            status: 400,
            payload: { success: false, message: "attributes must be a valid JSON object" },
          },
        };
      }
    }
    const validation = taxonomy.validateAttributes(subcategoryId, input);
    if (!validation.ok) {
      return {
        error: {
          status: 422,
          payload: { success: false, message: "Attribute validation failed", errors: validation.errors },
        },
      };
    }
    attrValues = validation.values;
  }

  return { subcategoryId, brandId, attrValues };
}

// ─────────────────────────────────────────────
// BUYER-AUTHENTICATED ENDPOINTS
// ─────────────────────────────────────────────

router.post("/buyer", requireUserAuth, upload.fields([{ name: "images", maxCount: 5 }]), async (req, res) => {
  try {
    const body = req.body;
    const imageFiles = req.files?.images || [];
    const imageUrls = await Promise.all(imageFiles.map(f =>
      processImage(f.buffer, { watermark: { name: req.user.full_name || "" } })
    ));

    if (!body.title_en || !body.title_am || !body.category) {
      return res.status(400).json({ success: false, message: "title_en, title_am, and category are required" });
    }
    body.category = normalizeCategory(body.category); // Sprint 9a legacy alias
    const VALID_CATEGORIES = new Set(["property", "motors", "stay", "furniture", "fashion", "electronics"]);
    if (!VALID_CATEGORIES.has(body.category)) {
      // Never rely on the DB ENUM: non-strict sql_mode silently stores ''
      return res.status(400).json({ success: false, message: "Invalid category" });
    }
    const buyerPrice = Number(body.price);
    if (body.price === undefined || body.price === null || body.price === "" ||
        !Number.isFinite(buyerPrice) || buyerPrice <= 0) {
      return res.status(400).json({ success: false, message: "A positive price is required" });
    }
    body.price = buyerPrice;
    // Sprint 8e: same taxonomy pipeline as the main POST — subcategory,
    // scoped brand check, attribute validation and legacy-column mirroring.
    const taxonomy = await loadTaxonomy();
    const tx = await resolveTaxonomyForWrite(body, taxonomy);
    if (tx.error) {
      if (tx.error.status === 422 && Array.isArray(tx.error.payload.errors)) {
        console.error("[POST /listings/buyer] attribute validation failed", {
          subcategory: body.subcategory,
          attributes: body.attributes,
          errors: tx.error.payload.errors,
        });
      }
      return res.status(tx.error.status).json(tx.error.payload);
    }

    const mirror = (key, fallback) =>
      body[key] !== undefined ? body[key] : (tx.attrValues[key] ?? fallback);
    const bedrooms = mirror("bedrooms") ? Number(mirror("bedrooms")) : null;
    const bathrooms = mirror("bathrooms") ? Number(mirror("bathrooms")) : null;
    const areaSqm = mirror("area_sqm") ? Number(mirror("area_sqm")) : null;

    const [result] = await db.execute(
      `INSERT INTO listings (
        user_id, title_am, title_en, category, price, price_suffix,
        location_key, location_label_am, location_label_en,
        phone, whatsapp, images, is_active, is_premium,
        bedrooms, bathrooms, area_sqm,
        description_am, description_en, view_count, is_verified,
        subcategory_id, brand_id, attributes
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 1, 0, ?, ?, ?, ?, ?, 0, 0, ?, ?, ?)`,
      [
        req.user.id, body.title_am, body.title_en, body.category,
        Number(body.price) || 0, PRICE_SUFFIXES.has(body.price_suffix) ? body.price_suffix : "fixed",
        body.location_key || "hawassa_tabor",
        body.location_label_am || "", body.location_label_en || "",
        (body.phone && String(body.phone).trim()) ? String(body.phone).trim() : (req.user.phone_number || ""),
        body.whatsapp || req.user.phone_number || "",
        JSON.stringify(imageUrls),
        bedrooms, bathrooms, areaSqm,
        body.description_am || null, body.description_en || null,
        tx.subcategoryId, tx.brandId, JSON.stringify(tx.attrValues),
      ]
    );

    // Fan out to saved-search alerts exactly like the main POST.
    evaluateNewListing(result.insertId);

    // Admin live feed
    const io = req.app.get("io");
    if (io) {
      io.to("admin_feed").emit("admin:new_listing", {
        id: result.insertId,
        title_en: body.title_en,
        title_am: body.title_am,
        category: body.category,
        price: Number(body.price) || 0,
        user_id: req.user.id,
        timestamp: Date.now(),
      });
    }

    // Real-time availability to all visitors / agents
    broadcastListingChange(io, {
      action: "created",
      id: result.insertId,
      is_active: body.is_active !== false,
      category: body.category,
      location_key: body.location_key || body.city || null,
    });

    res.status(201).json({ success: true, id: result.insertId });
  } catch (err) {
    console.error("[POST /listings/buyer]", err);
    res.status(500).json({ success: false, message: "Failed to create listing" });
  }
});

// Soft delete keeps the lifecycle state machine consistent
router.delete("/:id", requireUserAuth, async (req, res) => {
  try {
    const [[existing]] = await db.execute(
      "SELECT id FROM listings WHERE id = ? AND user_id = ?",
      [req.params.id, req.user.id]
    );
    if (!existing) {
      return res.status(404).json({ success: false, message: "Listing not found or access denied" });
    }
    await db.execute(
      "UPDATE listings SET is_active = 0, status = 'archived' WHERE id = ?",
      [req.params.id]
    );

    // Real-time availability: remove/archive the listing for all visitors
    broadcastListingChange(req.app.get("io"), {
      action: "deleted",
      id: Number(req.params.id),
      is_active: false,
    });

    res.json({ success: true, message: "Listing deleted" });
  } catch (err) {
    console.error("[DELETE /listings/:id]", err);
    res.status(500).json({ success: false, message: "Failed to delete listing" });
  }
});

// ─────────────────────────────────────────────
// OWNER EDIT & LIFECYCLE ENDPOINTS
// Privilege/lifecycle fields (status, is_active, is_verified, is_premium,
// view_count, category, user_id) are server-controlled.
// ─────────────────────────────────────────────

const PRICE_SUFFIXES = new Set(["fixed", "per_day", "per_month", "per_hour"]);
const FUEL_TYPES = new Set(["benzine", "diesel", "electric", "hybrid"]);
const CONDITION_TYPES = new Set(["new", "invoiced", "used"]);

function clampStr(v, max) {
  if (typeof v !== "string") return undefined;
  const s = v.trim();
  return s.length === 0 ? null : s.slice(0, max);
}

function clampNum(v, min, max) {
  if (v === undefined || v === null || v === "") return undefined;
  const n = Number(v);
  if (!Number.isFinite(n) || n < min || n > max) return NaN;
  return n;
}

router.put("/:id", requireUserAuth, async (req, res) => {
  try {
    const id = Number(req.params.id);
    if (!Number.isInteger(id) || id <= 0) {
      return res.status(400).json({ success: false, message: "Invalid listing id" });
    }

    // Ownership check — owners edit their own listings only
    const [[listing]] = await db.execute(
      "SELECT id, status, category, subcategory_id FROM listings WHERE id = ? AND user_id = ?",
      [id, req.user.id]
    );
    if (!listing) {
      return res.status(404).json({ success: false, message: "Listing not found or access denied" });
    }

    const b = req.body;
    const sets = [];
    const params = [];

    const strFields = [
      ["title_en", 255], ["title_am", 255],
      ["description_en", 5000], ["description_am", 5000],
      ["location_label_en", 100], ["location_label_am", 100],
      ["sub_category", 50], ["title_deed", 50],
      ["plate_code", 20], ["plate_region", 50], ["machinery_brand", 50],
    ];
    for (const [field, max] of strFields) {
      const v = clampStr(b[field], max);
      if (v !== undefined) { sets.push(`${field} = ?`); params.push(v); }
    }

    if (b.phone !== undefined) {
      sets.push("phone = ?");
      params.push(String(b.phone).replace(/\s/g, "").slice(0, 20));
    }
    if (b.whatsapp !== undefined) {
      sets.push("whatsapp = ?");
      params.push(String(b.whatsapp).replace(/\s/g, "").slice(0, 20));
    }

    const price = clampNum(b.price, 0.01, 999999999.99);
    if (price !== undefined) {
      if (Number.isNaN(price)) return res.status(400).json({ success: false, message: "Invalid price" });
      sets.push("price = ?"); params.push(price);
    }
    for (const [field, min, max] of [["bedrooms", 0, 100], ["bathrooms", 0, 100], ["capacity", 0, 100000]]) {
      const v = clampNum(b[field], min, max);
      if (v !== undefined) {
        if (Number.isNaN(v)) return res.status(400).json({ success: false, message: `Invalid ${field}` });
        sets.push(`${field} = ?`); params.push(Math.round(v));
      }
    }
    const area = clampNum(b.area_sqm, 0.01, 1000000);
    if (area !== undefined) {
      if (Number.isNaN(area)) return res.status(400).json({ success: false, message: "Invalid area_sqm" });
      sets.push("area_sqm = ?"); params.push(area);
    }

    if (b.price_suffix !== undefined) {
      if (!PRICE_SUFFIXES.has(b.price_suffix)) {
        return res.status(400).json({ success: false, message: "Invalid price_suffix" });
      }
      sets.push("price_suffix = ?"); params.push(b.price_suffix);
    }
    if (b.fuel_type !== undefined) {
      if (b.fuel_type !== null && !FUEL_TYPES.has(b.fuel_type)) {
        return res.status(400).json({ success: false, message: "Invalid fuel_type" });
      }
      sets.push("fuel_type = ?"); params.push(b.fuel_type);
    }
    if (b.condition_type !== undefined) {
      if (b.condition_type !== null && !CONDITION_TYPES.has(b.condition_type)) {
        return res.status(400).json({ success: false, message: "Invalid condition_type" });
      }
      sets.push("condition_type = ?"); params.push(b.condition_type);
    }

    if (b.images !== undefined) {
      if (
        !Array.isArray(b.images) ||
        b.images.length > 6 ||
        b.images.some((u) => typeof u !== "string" || u.length === 0 || u.length > 255)
      ) {
        return res.status(400).json({ success: false, message: "images must be an array of up to 6 URL strings" });
      }
      sets.push("images = ?"); params.push(JSON.stringify(b.images));
    }

    // ── Taxonomy updates (Sprint 4): subcategory / brand / attributes ──
    // Attribute validation always runs against the EFFECTIVE subcategory
    // (the new one if provided, otherwise the listing's current one).
    if (b.subcategory !== undefined || b.brand !== undefined || b.attributes !== undefined) {
      const taxonomy = await loadTaxonomy();

      let effectiveSubId = listing.subcategory_id;
      if (b.subcategory !== undefined) {
        if (b.subcategory === null) {
          const rootNode = taxonomy.rows.find(
            (c) => c.key_name === listing.category && c.parent_id === null
          );
          effectiveSubId = rootNode ? rootNode.id : null;
        } else {
          const sub = /^\d+$/.test(String(b.subcategory))
            ? taxonomy.byId.get(Number(b.subcategory))
            : taxonomy.bySlug.get(String(b.subcategory));
          if (!sub || sub.parent_id === null) {
            return res.status(400).json({ success: false, message: "Invalid subcategory" });
          }
          const root = taxonomy.byId.get(sub.parent_id);
          if (!root || root.key_name !== listing.category) {
            return res.status(400).json({
              success: false,
              message: `Subcategory "${sub.slug}" does not belong to category "${listing.category}"`,
            });
          }
          effectiveSubId = sub.id;
        }
        sets.push("subcategory_id = ?"); params.push(effectiveSubId);
      }

      if (b.brand !== undefined) {
        let brandIdOut = null;
        if (b.brand !== null) {
          const brand = /^\d+$/.test(String(b.brand))
            ? taxonomy.allBrands.find((x) => Number(x.id) === Number(b.brand))
            : taxonomy.allBrands.find((x) => x.slug === String(b.brand).toLowerCase());
          if (!brand) {
            return res.status(400).json({ success: false, message: "Unknown brand" });
          }
          if (!(await taxonomy.brandAllowed(effectiveSubId, brand.id))) {
            return res.status(400).json({
              success: false,
              message: `Brand "${brand.name_en}" is not available for this category`,
            });
          }
          brandIdOut = brand.id;
        }
        sets.push("brand_id = ?"); params.push(brandIdOut);
      }

      if (b.attributes !== undefined) {
        if (effectiveSubId === null) {
          return res.status(400).json({ success: false, message: "Cannot set attributes without a category" });
        }
        const validation = taxonomy.validateAttributes(effectiveSubId, b.attributes);
        if (!validation.ok) {
          return res.status(422).json({
            success: false,
            message: "Attribute validation failed",
            errors: validation.errors,
          });
        }
        sets.push("attributes = ?"); params.push(JSON.stringify(validation.values));

        // Mirror hot attributes into legacy columns (same rule as create),
        // unless the client set those columns explicitly in this request.
        for (const [key, col] of [["bedrooms", "bedrooms"], ["bathrooms", "bathrooms"], ["area_sqm", "area_sqm"]]) {
          if (validation.values[key] !== undefined && b[col] === undefined) {
            sets.push(`${col} = ?`); params.push(Number(validation.values[key]));
          }
        }
      }
    }

    if (sets.length === 0) {
      return res.status(400).json({ success: false, message: "No editable fields provided" });
    }

    sets.push("updated_at = CURRENT_TIMESTAMP");
    params.push(id);

    await db.execute(`UPDATE listings SET ${sets.join(", ")} WHERE id = ?`, params);

    const [[updated]] = await db.execute("SELECT * FROM listings WHERE id = ?", [id]);

    // Real-time availability: reflect edits everywhere
    broadcastListingChange(req.app.get("io"), {
      action: "updated",
      id,
      is_active: updated.is_active,
      category: updated.category,
      location_key: updated.location_key || null,
    });

    res.json({ success: true, data: updated, message: "Listing updated" });
  } catch (err) {
    console.error("[PUT /listings/:id]", err);
    res.status(500).json({ success: false, message: "Failed to update listing" });
  }
});

// Owner lifecycle transitions. suspended/expired are reserved for
// admins/system (see FEATURE_REVIEW_AND_WORKFLOWS.md F2).
router.patch("/:id/status", requireUserAuth, async (req, res) => {
  try {
    const id = Number(req.params.id);
    const target = req.body?.status;

    if (!Number.isInteger(id) || id <= 0) {
      return res.status(400).json({ success: false, message: "Invalid listing id" });
    }

    const OWNER_TARGETS = new Set(["active", "sold", "archived"]);
    if (!OWNER_TARGETS.has(target)) {
      return res.status(400).json({
        success: false,
        message: "status must be one of: active, sold, archived",
      });
    }

    const [[listing]] = await db.execute(
      "SELECT id, status FROM listings WHERE id = ? AND user_id = ?",
      [id, req.user.id]
    );
    if (!listing) {
      return res.status(404).json({ success: false, message: "Listing not found or access denied" });
    }

    if (listing.status === "suspended") {
      return res.status(403).json({
        success: false,
        message: "This listing is suspended. Contact support to resolve it.",
      });
    }
    if (listing.status === "expired") {
      return res.status(403).json({
        success: false,
        message: "This listing has expired. Renew it from your dashboard.",
      });
    }

    await db.execute(
      "UPDATE listings SET status = ?, is_active = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?",
      [target, target === "active" ? 1 : 0, id]
    );

    // Real-time availability: sold/archived listings vanish live
    broadcastListingChange(req.app.get("io"), {
      action: "updated",
      id,
      is_active: target === "active",
    });

    res.json({ success: true, data: { id, status: target }, message: `Listing marked as ${target}` });
  } catch (err) {
    console.error("[PATCH /listings/:id/status]", err);
    res.status(500).json({ success: false, message: "Failed to update listing status" });
  }
});

// ─────────────────────────────────────────────
// SELLER-INITIATED G2B VERIFICATION REQUEST (F4)
// Routing: property → municipality pool · motors → transport pool.
// The queue itself lives in routes/g2b.js (GET /api/g2b/queue) with a 48h SLA
// computed from verification_requested_at.
// ─────────────────────────────────────────────

const VERIFIABLE_CATEGORIES = new Set(["property", "motors"]);

router.post("/:id/verify-request", requireUserAuth, async (req, res) => {
  try {
    const id = Number(req.params.id);
    if (!Number.isInteger(id) || id <= 0) {
      return res.status(400).json({ success: false, message: "Invalid listing id" });
    }

    const [[listing]] = await db.execute(
      "SELECT id, user_id, category, is_verified, is_active, status, verification_requested_at FROM listings WHERE id = ?",
      [id]
    );
    if (!listing || listing.user_id !== req.user.id) {
      return res.status(404).json({ success: false, message: "Listing not found or access denied" });
    }
    if (!VERIFIABLE_CATEGORIES.has(listing.category)) {
      return res.status(400).json({
        success: false,
        message: "Only property and vehicle listings are eligible for official verification",
      });
    }
    if (listing.is_verified) {
      return res.status(409).json({ success: false, message: "This listing is already verified" });
    }
    if (!listing.is_active || listing.status !== "active") {
      return res.status(409).json({ success: false, message: "Only active listings can be submitted for verification" });
    }
    if (listing.verification_requested_at) {
      return res.status(409).json({
        success: false,
        message: "A verification request is already in the queue for this listing",
      });
    }

    await db.execute(
      "UPDATE listings SET verification_requested_at = CURRENT_TIMESTAMP WHERE id = ?",
      [id]
    );

    await writeAuditLog({
      req,
      ...getUserActor(req),
      action: "verification_request_submitted",
      resourceType: "listing_compliance",
      resourceId: String(id),
      details: { category: listing.category },
    });

    const routedTo =
      listing.category === "property" ? "g2b_municipality" : "g2b_transport";

    await createNotification({
      userId: req.user.id,
      type: "verification_requested",
      title: "Verification request submitted",
      body: `Your listing "${listing.title_en || `#${id}`}" entered the verification queue. Officers respond within 48 hours.`,
      listingId: id,
      payload: { routed_to: routedTo },
    });

    res.status(202).json({
      success: true,
      message: "Verification request submitted. Officers respond within 48 hours.",
      data: { listing_id: id, routed_to: routedTo, sla_hours: 48 },
    });
  } catch (err) {
    console.error("[POST /listings/:id/verify-request]", err);
    res.status(500).json({ success: false, message: "Failed to submit verification request" });
  }
});

// ── Sprint P1: Property payment instructions ──────────────────────────────
// GET /api/listings/:id/payment-info — returns the property's payment details
// so the customer knows where to transfer money.
router.get("/:id(\\d+)/payment-info", async (req, res) => {
  try {
    const id = Number(req.params.id);
    if (!Number.isInteger(id) || id <= 0) {
      return res.status(400).json({ success: false, message: "Invalid listing id" });
    }

    const [[listing]] = await db.execute(
      `SELECT l.id, l.title_en, l.title_am, l.category, l.price,
              l.payment_phone, l.payment_bank_name, l.payment_bank_account,
              u.full_name AS host_name
       FROM listings l
       JOIN users u ON u.id = l.user_id
       WHERE l.id = ? AND l.is_active = 1`,
      [id]
    );
    if (!listing) {
      return res.status(404).json({ success: false, message: "Listing not found" });
    }

    const hasPaymentInfo = listing.payment_phone || listing.payment_bank_name;
    res.json({
      success: true,
      data: {
        listing_id: listing.id,
        title_en: listing.title_en,
        title_am: listing.title_am,
        category: listing.category,
        price: Number(listing.price),
        host_name: listing.host_name,
        payment_info_complete: hasPaymentInfo,
        payment_phone: listing.payment_phone || null,
        payment_bank_name: listing.payment_bank_name || null,
        payment_bank_account: listing.payment_bank_account || null,
      },
    });
  } catch (err) {
    console.error("[GET /listings/:id/payment-info]", err);
    res.status(500).json({ success: false, message: "Failed to fetch payment info" });
  }
});

// ── Sprint P1: Host sets payment instructions ─────────────────────────────
// PUT /api/listings/:id/payment-info — host updates their payment details
router.put("/:id(\\d+)/payment-info", requireUserAuth, async (req, res) => {
  try {
    const id = Number(req.params.id);
    if (!Number.isInteger(id) || id <= 0) {
      return res.status(400).json({ success: false, message: "Invalid listing id" });
    }

    const [[existing]] = await db.execute(
      "SELECT id, user_id FROM listings WHERE id = ? AND user_id = ?",
      [id, req.user.id]
    );
    if (!existing) {
      return res.status(404).json({ success: false, message: "Listing not found or access denied" });
    }

    const phone = typeof req.body.payment_phone === "string" ? req.body.payment_phone.trim().slice(0, 20) : null;
    const bankName = typeof req.body.payment_bank_name === "string" ? req.body.payment_bank_name.trim().slice(0, 100) : null;
    const bankAccount = typeof req.body.payment_bank_account === "string" ? req.body.payment_bank_account.trim().slice(0, 100) : null;

    if (!phone && !bankName) {
      return res.status(400).json({
        success: false,
        message: "At least payment_phone or payment_bank_name is required",
      });
    }

    await db.execute(
      "UPDATE listings SET payment_phone = ?, payment_bank_name = ?, payment_bank_account = ? WHERE id = ?",
      [phone, bankName, bankAccount, id]
    );

    res.json({
      success: true,
      data: { payment_phone: phone, payment_bank_name: bankName, payment_bank_account: bankAccount },
    });
  } catch (err) {
    console.error("[PUT /listings/:id/payment-info]", err);
    res.status(500).json({ success: false, message: "Failed to update payment info" });
  }
});

module.exports = router;

// Test hook (Sprint 8f)
module.exports.buildListingFilters = buildListingFilters;
