/**
 * utils/taxonomy.js
 * Category-tree + dynamic-attribute engine (Sprint 4).
 *
 * The whole taxonomy is small (tens of rows), so it is loaded into memory and
 * cached for 60s. Attribute definitions inherit DOWN the tree: an attribute
 * declared on "electronics" applies to "laptops", "smartphones", etc., and the
 * nearest definition of an attr_key wins (allows per-subcategory overrides).
 */
const db = require("../database/db");

/**
 * Sprint 9a — vertical substitution (Ceremony→Furniture, Heavy→Fashion).
 * Old slugs arriving from stale bookmarks, saved searches or older clients
 * are transparently mapped onto their new roots. One-way aliases: writes
 * always persist the new slug.
 */
const LEGACY_CATEGORY_ALIASES = {
  ceremony: "furniture",
  heavy: "fashion",
  machinery: "fashion", // legacy zone-level name
};

function normalizeCategory(value) {
  if (value === undefined || value === null) return value;
  const s = String(value);
  return LEGACY_CATEGORY_ALIASES[s] || s;
}

const CACHE_TTL_MS = 60 * 1000;
let cache = null;

async function loadTaxonomy(force = false) {
  if (!force && cache && Date.now() - cache.loadedAt < CACHE_TTL_MS) {
    return cache;
  }

  const [cats] = await db.execute(
    `SELECT id, key_name, label_en, label_am, slug, path, parent_id, level, is_active
     FROM categories WHERE is_active = 1
     ORDER BY level, display_order, label_en`
  );
  const [attrDefs] = await db.execute(
    `SELECT a.id, a.category_id, c.slug AS category_slug, a.attr_key, a.label_en, a.label_am,
            a.input_type, a.unit, a.options, a.is_required, a.is_filterable, a.display_order
     FROM category_attributes a
     JOIN categories c ON c.id = a.category_id
     ORDER BY a.display_order, a.id`
  );
  const [brandRows] = await db.execute(
    `SELECT DISTINCT b.id, b.slug, b.name_en FROM brands b WHERE b.is_active = 1`
  );

  const byId = new Map();
  const bySlug = new Map();
  const childrenOf = new Map();
  for (const c of cats) {
    byId.set(c.id, c);
    bySlug.set(c.slug, c);
    if (!childrenOf.has(c.parent_id)) childrenOf.set(c.parent_id, []);
    childrenOf.get(c.parent_id).push(c.id);
  }

  const attrsByCategoryId = new Map();
  for (const a of attrDefs) {
    let opts = a.options;
    if (typeof opts === "string") {
      try { opts = JSON.parse(opts); } catch { opts = null; }
    }
    attrsByCategoryId.set(a.category_id, [
      ...(attrsByCategoryId.get(a.category_id) || []),
      { ...a, options: opts },
    ]);
  }

  // Ancestor chain from root down to the given node
  function ancestry(categoryId) {
    const chain = [];
    let cur = byId.get(Number(categoryId));
    while (cur) {
      chain.unshift(cur);
      cur = cur.parent_id ? byId.get(cur.parent_id) : null;
    }
    return chain;
  }

  // Inherited attribute definitions for a category (nearest wins per key)
  function attributesFor(categoryId) {
    const merged = new Map();
    for (const node of ancestry(categoryId)) {
      for (const def of attrsByCategoryId.get(node.id) || []) {
        merged.set(def.attr_key, def);
      }
    }
    return [...merged.values()];
  }

  function descendantIds(categoryId) {
    const out = [Number(categoryId)];
    const queue = [...(childrenOf.get(Number(categoryId)) || [])];
    while (queue.length) {
      const id = queue.shift();
      out.push(id);
      queue.push(...(childrenOf.get(id) || []));
    }
    return out;
  }

  function rootIdOf(categoryId) {
    const chain = ancestry(categoryId);
    return chain.length ? chain[0].id : null;
  }

  // Brand allowed if mapped to ANY ancestor of the category (we seed roots).
  // Sprint 8c: if THIS node carries its own direct mappings they are
  // AUTHORITATIVE — a subcategory with a brand list does not accept brands
  // merely because the root allows them.
  async function brandAllowed(categoryId, brandId) {
    const cid = Number(categoryId);
    const [direct] = await db.execute(
      "SELECT COUNT(*) AS n FROM category_brands WHERE category_id = ?",
      [cid]
    );
    if (direct[0].n > 0) {
      const [own] = await db.execute(
        "SELECT COUNT(*) AS n FROM category_brands WHERE category_id = ? AND brand_id = ?",
        [cid, Number(brandId)]
      );
      return own[0].n > 0;
    }
    const ids = ancestry(cid).map((c) => c.id);
    if (ids.length === 0) return false;
    const placeholders = ids.map(() => "?").join(",");
    const [rows] = await db.execute(
      `SELECT COUNT(*) AS n FROM category_brands WHERE brand_id = ? AND category_id IN (${placeholders})`,
      [Number(brandId), ...ids]
    );
    return rows[0].n > 0;
  }

  /**
   * Brands for display on a category node — nearest mapping wins:
   * the node's own category_brands rows if any exist, otherwise the union
   * of its strict ancestors' mappings (root-level inheritance).
   */
  async function brandsFor(categoryId) {
    const cid = Number(categoryId);
    const [direct] = await db.execute(
      `SELECT DISTINCT b.slug, b.name_en
       FROM category_brands cb JOIN brands b ON b.id = cb.brand_id
       WHERE b.is_active = 1 AND cb.category_id = ?
       ORDER BY b.name_en`,
      [cid]
    );
    if (direct.length > 0) return { brands: direct, scoped: true };

    const chain = ancestry(cid);
    const ancestorIds = chain.slice(0, -1).map((c) => c.id);
    if (ancestorIds.length === 0) return { brands: [], scoped: false };
    const placeholders = ancestorIds.map(() => "?").join(",");
    const [rows] = await db.execute(
      `SELECT DISTINCT b.slug, b.name_en
       FROM category_brands cb JOIN brands b ON b.id = cb.brand_id
       WHERE b.is_active = 1 AND cb.category_id IN (${placeholders})
       ORDER BY b.name_en`,
      ancestorIds
    );
    return { brands: rows, scoped: false };
  }

  /**
   * Validate a client-supplied attributes object against the category schema.
   * Returns { ok, values, errors } — values are type-coerced and option-checked.
   */
  function validateAttributes(categoryId, input) {
    const defs = attributesFor(categoryId);
    const errors = [];
    const values = {};
    const source = input && typeof input === "object" && !Array.isArray(input) ? input : {};

    for (const def of defs) {
      const raw = source[def.attr_key];
      const missing = raw === undefined || raw === null || raw === "";

      if (missing) {
        if (def.is_required) errors.push(`"${def.attr_key}" (${def.label_en}) is required`);
        continue;
      }

      switch (def.input_type) {
        case "number": {
          const n = Number(raw);
          if (!Number.isFinite(n)) errors.push(`"${def.attr_key}" must be a number`);
          else values[def.attr_key] = n;
          break;
        }
        case "boolean": {
          values[def.attr_key] = raw === true || raw === "true" || raw === 1 || raw === "1";
          break;
        }
        case "select": {
          const s = String(raw);
          if (!Array.isArray(def.options)) {
            values[def.attr_key] = s.slice(0, 100);
          } else if (def.options.map(String).includes(s)) {
            // Preserve the seeded option's native type (numbers stay numbers)
            const match = def.options.find((o) => String(o) === s);
            values[def.attr_key] = match;
          } else {
            errors.push(`"${def.attr_key}" must be one of: ${def.options.join(", ")}`);
          }
          break;
        }
        case "multiselect": {
          const arr = Array.isArray(raw) ? raw.map(String) : [String(raw)];
          if (Array.isArray(def.options)) {
            const allowed = new Set(def.options.map(String));
            const bad = arr.filter((v) => !allowed.has(v));
            if (bad.length) errors.push(`"${def.attr_key}" contains invalid options: ${bad.join(", ")}`);
            else values[def.attr_key] = arr;
          } else {
            values[def.attr_key] = arr.slice(0, 20);
          }
          break;
        }
        default: {
          values[def.attr_key] = String(raw).slice(0, 300);
        }
      }
    }

    const knownKeys = new Set(defs.map((d) => d.attr_key));
    for (const key of Object.keys(source)) {
      if (!knownKeys.has(key)) errors.push(`Unknown attribute "${key}" for this category`);
    }

    return { ok: errors.length === 0, values, errors };
  }

  cache = {
    loadedAt: Date.now(),
    rows: cats,
    byId,
    bySlug,
    childrenOf,
    ancestry,
    attributesFor,
    descendantIds,
    rootIdOf,
    brandAllowed,
    brandsFor,
    validateAttributes,
    allBrands: brandRows,
  };
  return cache;
}

/**
 * invalidateTaxonomyCache — Sprint 8g. Admin CRUD endpoints call this after
 * every mutation so public reads reflect changes immediately instead of
 * serving up to 60s of stale tree.
 */
function invalidateTaxonomyCache() {
  cache = null;
}

module.exports = { loadTaxonomy, invalidateTaxonomyCache, LEGACY_CATEGORY_ALIASES, normalizeCategory };
