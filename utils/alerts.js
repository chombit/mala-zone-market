/**
 * utils/alerts.js — Sprint 6 saved-search alert engine.
 *
 * A saved search stores a WHITELISTED subset of the GET /api/listings query
 * params. Every newly created listing is evaluated against all active
 * searches; owners receive ONE deduplicated notification per new listing,
 * no matter how many of their searches matched.
 *
 * evaluateNewListing() NEVER throws into the create-listing flow.
 */
const db = require("../database/db");
const { createNotification } = require("./notify");
const { loadTaxonomy, normalizeCategory } = require("./taxonomy");

const MAX_SAVED_SEARCHES = 10;
const VALID_CATEGORIES = new Set(["property", "motors", "stay", "furniture", "fashion", "electronics"]);
const CONDITION_TYPES = new Set(["new", "invoiced", "used"]);
const FUEL_TYPES = new Set(["benzine", "diesel", "electric", "hybrid"]);

// ── query normalization ────────────────────────────────────────────────────

/**
 * Validate + coerce a client-supplied search query object.
 * Returns { ok, query, errors } — query has only normalized known keys.
 */
async function normalizeSavedQuery(raw) {
  const errors = [];
  const out = {};
  const src = raw && typeof raw === "object" && !Array.isArray(raw) ? raw : null;
  if (!src) return { ok: false, query: {}, errors: ["query must be an object"] };

  let t;
  try {
    t = await loadTaxonomy();
  } catch (err) {
    console.error("[alerts] taxonomy load failed:", err.message);
    return { ok: false, query: {}, errors: ["Catalog temporarily unavailable"] };
  }

  if (src.category !== undefined) {
    const category = normalizeCategory(src.category); // Sprint 9a legacy alias
    if (!VALID_CATEGORIES.has(category)) errors.push("Invalid category");
    else out.category = category;
  }
  if (src.q !== undefined) {
    const s = String(src.q).trim().slice(0, 100);
    if (s.length >= 2) out.q = s.toLowerCase();
  }
  if (src.location_key !== undefined) {
    const s = String(src.location_key).trim().slice(0, 100);
    if (s) out.location_key = s;
  }
  if (src.city !== undefined) {
    const s = String(src.city).trim().slice(0, 50);
    if (s) out.city = s;
  }
  for (const [key, lo, hi] of [["price_min", 0, 999999999], ["price_max", 0, 999999999]]) {
    if (src[key] !== undefined && src[key] !== "" && src[key] !== null) {
      const n = Number(src[key]);
      if (!Number.isFinite(n) || n < lo || n > hi) errors.push(`Invalid ${key}`);
      else out[key] = n;
    }
  }
  if (out.price_min !== undefined && out.price_max !== undefined && out.price_min > out.price_max) {
    errors.push("price_min cannot exceed price_max");
  }
  if (src.verified !== undefined) {
    if ([true, 1, "1", "true"].includes(src.verified)) out.verified = true;
  }
  if (src.condition_type !== undefined) {
    if (!CONDITION_TYPES.has(src.condition_type)) errors.push("Invalid condition_type");
    else out.condition_type = src.condition_type;
  }
  if (src.fuel_type !== undefined) {
    if (!FUEL_TYPES.has(src.fuel_type)) errors.push("Invalid fuel_type");
    else out.fuel_type = src.fuel_type;
  }
  if (src.bedrooms_min !== undefined && src.bedrooms_min !== "" && src.bedrooms_min !== null) {
    const n = Number(src.bedrooms_min);
    if (!Number.isInteger(n) || n < 0 || n > 100) errors.push("Invalid bedrooms_min");
    else out.bedrooms_min = n;
  }

  // Taxonomy facets resolve synchronously against the loaded tree
  if (src.subcategory !== undefined && src.subcategory !== "") {
    const node = /^\d+$/.test(String(src.subcategory))
      ? t.byId.get(Number(src.subcategory))
      : t.bySlug.get(String(src.subcategory));
    if (!node) errors.push("Unknown subcategory");
    else out.subcategory_id = node.id;
  } else if (src.category !== undefined && t.rows.length) {
    // Pin the category root so root-level fallbacks behave like GET /listings
    const rootNode = t.rows.find((c) => c.key_name === src.category && c.parent_id === null);
    if (rootNode) out.subcategory_id = rootNode.id;
  }
  if (src.brand !== undefined && src.brand !== "") {
    const brand = /^\d+$/.test(String(src.brand))
      ? t.allBrands.find((b) => Number(b.id) === Number(src.brand))
      : t.allBrands.find((b) => b.slug === String(src.brand).toLowerCase());
    if (!brand) errors.push("Unknown brand");
    else out.brand_id = brand.id;
  }

  // Dynamic attribute facets (attr_<key>)
  let attrCount = 0;
  for (const key of Object.keys(src).filter((k) => k.startsWith("attr_")).slice(0, 5)) {
    const attrKey = key.slice(5);
    if (!/^[a-z0-9_]{1,50}$/.test(attrKey)) continue;
    const def = findAttrDef(t, attrKey);
    const coerced = coerceAttr(def, src[key]);
    if (coerced === undefined) {
      errors.push(`Invalid value for attribute "${attrKey}"`);
      continue;
    }
    out.attributes = out.attributes || {};
    out.attributes[attrKey] = coerced;
    attrCount += 1;
  }

  const meaningfulKeys =
    Object.keys(out).filter((k) => k !== "attributes").length +
    attrCount;
  if (meaningfulKeys === 0) errors.push("At least one filter is required");

  return { ok: errors.length === 0, query: out, errors };
}

/** Find an attribute definition anywhere in the tree (first match wins). */
function findAttrDef(t, attrKey) {
  for (const catId of [...t.byId.keys()]) {
    for (const def of t.attributesFor(catId)) {
      if (def.attr_key === attrKey) return def;
    }
  }
  return null;
}

function coerceAttr(def, rawValue) {
  const v = rawValue;
  if (v === undefined || v === null || v === "") return undefined;
  const type = def ? def.input_type : "text";
  switch (type) {
    case "number": {
      const n = Number(v);
      return Number.isFinite(n) ? n : undefined;
    }
    case "boolean":
      return [true, 1, "1", "true"].includes(v) ? true : false;
    default:
      return String(v).slice(0, 100);
  }
}

// ── matcher ────────────────────────────────────────────────────────────────

/**
 * Does a listing row satisfy a NORMALIZED saved query?
 * Mirrors GET /api/listings facet semantics on a single row.
 * `t` is the loaded taxonomy (pass the cached object from loadTaxonomy()).
 */
function matchListing(listing, q, t) {
  if (q.category && listing.category !== q.category) return false;

  if (q.location_key && listing.location_key !== q.location_key) return false;
  if (q.city && !(listing.location_key || "").startsWith(q.city)) return false;

  const price = Number(listing.price);
  if (q.price_min !== undefined && price < q.price_min) return false;
  if (q.price_max !== undefined && price > q.price_max) return false;

  if (q.verified && Number(listing.is_verified) !== 1) return false;
  if (q.condition_type && listing.condition_type !== q.condition_type) return false;
  if (q.fuel_type && listing.fuel_type !== q.fuel_type) return false;
  if (q.bedrooms_min !== undefined && Number(listing.bedrooms || 0) < q.bedrooms_min) return false;

  if (q.subcategory_id !== undefined) {
    const node = t.byId.get(Number(q.subcategory_id));
    const ids = node ? t.descendantIds(node.id) : [Number(q.subcategory_id)];
    const listSub = listing.subcategory_id == null ? null : Number(listing.subcategory_id);
    const directHit = listSub !== null && ids.includes(listSub);
    const rootFallback = node && node.parent_id === null &&
      listSub === null && listing.category === node.key_name;
    if (!directHit && !rootFallback) return false;
  }

  if (q.brand_id !== undefined && Number(listing.brand_id) !== Number(q.brand_id)) return false;

  if (q.q) {
    const hay = [
      listing.title_en, listing.title_am,
      listing.description_en, listing.description_am,
    ].filter(Boolean).join(" ").toLowerCase();
    if (!hay.includes(q.q)) return false;
  }

  if (q.attributes) {
    let attrs = listing.attributes;
    if (typeof attrs === "string") {
      try { attrs = JSON.parse(attrs); } catch { attrs = {}; }
    }
    attrs = attrs || {};
    for (const [attrKey, want] of Object.entries(q.attributes)) {
      const got = attrs[attrKey];
      if (got === undefined || got === null) return false;
      if (typeof want === "boolean") {
        if (!!got !== want) return false;
      } else if (typeof want === "number") {
        if (Number(got) !== want) return false;
      } else if (String(got) !== want) {
        return false;
      }
    }
  }

  return true;
}

// ── evaluation entry point (fire-and-forget safe) ──────────────────────────

/**
 * Evaluate one freshly created listing against every active saved search.
 * One notification per user even if several searches matched.
 */
async function evaluateNewListing(listingId) {
  try {
    const t = await loadTaxonomy();

    const [[listing]] = await db.execute(
      `SELECT id, user_id, category, price, location_key, is_active,
              condition_type, fuel_type, bedrooms, is_verified,
              subcategory_id, brand_id, attributes,
              title_en, title_am, description_en, description_am
       FROM listings WHERE id = ?`,
      [listingId]
    );
    if (!listing || !listing.is_active) return;

    const [searches] = await db.execute(
      `SELECT ss.id, ss.user_id, ss.name, ss.query_json, u.full_name
       FROM saved_searches ss JOIN users u ON u.id = ss.user_id
       WHERE ss.notify = 1 LIMIT 5000`
    );

    const hitsByUser = new Map(); // user_id -> { fullName, matches: [{id,name}] }
    for (const s of searches) {
      let q;
      try { q = JSON.parse(s.query_json); } catch { continue; }
      if (!matchListing(listing, q, t)) continue;
      if (!hitsByUser.has(s.user_id)) {
        hitsByUser.set(s.user_id, { fullName: s.full_name, matches: [] });
      }
      hitsByUser.get(s.user_id).matches.push({ id: s.id, name: s.name });
    }

    for (const [userId, info] of hitsByUser) {
      const names = info.matches
        .map((m) => m.name || `Search #${m.id}`)
        .join(", ");
      await createNotification({
        userId,
        type: "search_alert",
        title: "New listing matches your saved search",
        body: `"${listing.title_en}" matches: ${names}`,
        payload: {
          listing_id: listing.id,
          matched_search_ids: info.matches.map((m) => m.id),
        },
        listingId: listing.id,
      });
    }
  } catch (err) {
    console.error("[alerts] evaluateNewListing failed:", err.message);
  }
}

module.exports = {
  MAX_SAVED_SEARCHES,
  normalizeSavedQuery,
  matchListing,
  evaluateNewListing,
};
