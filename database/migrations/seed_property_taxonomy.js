/**
 * Sprint 8d migration — subcategory-scoped taxonomy for PROPERTY.
 *
 * Mirrors Sprint 8c (electronics): per-subcategory attribute definitions so
 * the sidebar Refine section adapts when Houses / Apartments / Land /
 * Commercial Property is selected, plus subcategory assignment + attribute
 * tagging for existing property listings.
 *
 * Brands are intentionally NOT mapped for property nodes (no developer brand
 * lists yet) — the sidebar hides the Brand dropdown automatically when a
 * category returns zero brands.
 *
 * Idempotent: every step checks before inserting.
 */
const db = require("../db");

// child slug -> attribute defs (plain-string options)
const SUB_ATTRS = {
  houses: [
    { attr_key: "condition", label_en: "Condition", input_type: "select", options: ["New", "Used", "Renovated"] },
    { attr_key: "parking", label_en: "Parking", input_type: "select", options: ["Yes", "No"] },
    { attr_key: "compound", label_en: "Compound", input_type: "select", options: ["Shared", "Private"] },
  ],
  apartments: [
    { attr_key: "floor_level", label_en: "Floor level", input_type: "select", options: ["1-3", "4-6", "7-10", "11+"] },
    { attr_key: "elevator", label_en: "Elevator", input_type: "select", options: ["Yes", "No"] },
    { attr_key: "condition", label_en: "Condition", input_type: "select", options: ["New", "Used", "Renovated"] },
  ],
  land: [
    { attr_key: "land_type", label_en: "Land type", input_type: "select", options: ["Residential", "Commercial", "Agricultural", "Mixed"] },
    { attr_key: "road_access", label_en: "Road access", input_type: "select", options: ["Paved", "Gravel", "None"] },
    { attr_key: "size_class", label_en: "Plot size", input_type: "select", unit: "m²", options: ["Under 500 m²", "500-1,000 m²", "1,000-5,000 m²", "Above 5,000 m²"] },
  ],
  "commercial-property": [
    { attr_key: "business_space_type", label_en: "Space type", input_type: "select", options: ["Office", "Retail shop", "Warehouse", "Restaurant space"] },
    { attr_key: "condition", label_en: "Condition", input_type: "select", options: ["New", "Used", "Renovated"] },
  ],
};

async function main() {
  await db.initializePool();

  const [catRows] = await db.execute(
    "SELECT c.id, c.slug FROM categories c JOIN categories r ON r.id=c.parent_id WHERE r.slug='property'"
  );
  const catBySlug = new Map(catRows.map((c) => [c.slug, c.id]));

  // ── 1. attribute defs ──
  const [attrCols] = await db.execute("SHOW COLUMNS FROM category_attributes");
  const have = new Set(attrCols.map((c) => c.Field));
  let attrCount = 0;
  for (const [subSlug, defs] of Object.entries(SUB_ATTRS)) {
    const cid = catBySlug.get(subSlug);
    if (!cid) { console.log(`⚠️ category ${subSlug} missing`); continue; }
    let order = 20;
    for (const def of defs) {
      const [[dupe]] = await db.execute(
        "SELECT id FROM category_attributes WHERE category_id = ? AND attr_key = ?",
        [cid, def.attr_key]
      );
      if (dupe) continue;
      const row = {
        category_id: cid,
        attr_key: def.attr_key,
        label_en: def.label_en,
        label_am: null,
        input_type: def.input_type,
        unit: def.unit || null,
        options: JSON.stringify(def.options),
        is_required: 0,
        is_filterable: 1,
        display_order: order,
      };
      const keys = Object.keys(row).filter((k) => have.has(k));
      await db.execute(
        `INSERT INTO category_attributes (${keys.join(",")}) VALUES (${keys.map(() => "?").join(",")})`,
        keys.map((k) => row[k])
      );
      attrCount += 1;
      order += 10;
    }
  }
  console.log(`✅ ${attrCount} new property attribute defs`);

  // ── 2. assign unassigned property listings to subcategories ──
  const [cols] = await db.execute("SHOW COLUMNS FROM listings");
  const lcols = new Set(cols.map((c) => c.Field));
  const selCols = ["id", "title_en", "subcategory_id", "price_suffix", "attributes"].filter((c) => lcols.has(c));
  if (lcols.has("bedrooms")) selCols.push("bedrooms");
  if (lcols.has("area_sqm")) selCols.push("area_sqm");
  const [props] = await db.execute(
    `SELECT ${selCols.join(",")} FROM listings WHERE category='property' AND is_active=1`
  );

  let assigned = 0;
  for (const l of props) {
    if (l.subcategory_id) continue;
    const t = String(l.title_en || "");
    let slug = null;
    if (/land|plot|terrain/i.test(t)) slug = "land";
    else if (/apartment|condo|\bapt\b/i.test(t)) slug = "apartments";
    else if (/shop|office|warehouse|commercial/i.test(t)) slug = "commercial-property";
    else if ((l.bedrooms ?? 0) >= 1 || /house|home|villa/i.test(t)) slug = "houses";
    if (!slug) continue;
    const sid = catBySlug.get(slug);
    if (!sid) continue;
    await db.execute("UPDATE listings SET subcategory_id = ? WHERE id = ?", [sid, l.id]);
    l._slug = slug;
    assigned += 1;
  }
  console.log(`✅ ${assigned}/${props.length} property listings assigned to subcategories`);

  // ── 3. attribute tagging ──
  let tagged = 0;
  for (const l of props) {
    const updates = {};
    const t = String(l.title_en || "");

    if (l._slug === "land" || /land|plot/i.test(t)) {
      if (!updates.land_type) updates.land_type = /farm/i.test(t) ? "Agricultural" : "Residential";
      if (l.area_sqm != null) {
        const a = Number(l.area_sqm);
        updates.size_class =
          a < 500 ? "Under 500 m²"
          : a <= 1000 ? "500-1,000 m²"
          : a <= 5000 ? "1,000-5,000 m²"
          : "Above 5,000 m²";
      }
      updates.road_access = "Paved";
    } else if (l._slug === "houses" || /house|home|villa/i.test(t)) {
      updates.condition = /new|brand/i.test(t) ? "New" : "Used";
      updates.parking = /garage|parking/i.test(t) ? "Yes" : "No";
      updates.compound = /compound/i.test(t) ? "Shared" : "Private";
    } else if (l._slug === "apartments" || /apartment|condo/i.test(t)) {
      updates.condition = /new|brand/i.test(t) ? "New" : "Used";
      updates.elevator = /elevator|lift/i.test(t) ? "Yes" : "No";
    }

    if (Object.keys(updates).length === 0) continue;
    let existing = {};
    try {
      existing = typeof l.attributes === "string" ? JSON.parse(l.attributes || "{}") : l.attributes || {};
    } catch { existing = {}; }
    const merged = { ...existing };
    let changed = false;
    for (const [k, v] of Object.entries(updates)) {
      if (merged[k] === undefined) { merged[k] = v; changed = true; }
    }
    if (!changed) continue;
    await db.execute("UPDATE listings SET attributes = ? WHERE id = ?", [JSON.stringify(merged), l.id]);
    tagged += 1;
  }
  console.log(`✅ ${tagged} property listings given attribute values`);

  // ── 4. demo land plots (Land otherwise has zero listings) ──
  const LAND_SEEDS = [
    {
      category: "property",
      title_en: "Residential Land Plot — Bole",
      title_am: "የመኖሪያ መሬት — ቦሌ",
      description_en: "Fenced residential plot in Bole, ready for construction.",
      description_am: "በቦሌ ውስጥ የተከበበ የመኖሪያ መሬት።",
      price: 4500000, price_suffix: "fixed", location_key: "bole",
      is_verified: 1, is_premium: 0,
      area_sqm: 800,
      attributes: JSON.stringify({ land_type: "Residential", road_access: "Paved", size_class: "500-1,000 m²" }),
      _sub: "land",
    },
    {
      category: "property",
      title_en: "Agricultural Land — Yirgalem",
      title_am: "የእርሻ መሬት — ይርጋለም",
      description_en: "8,000 m² farmland with road access, suitable for coffee.",
      description_am: "8,000 ስኩዌር ሜትር የእርሻ መሬት።",
      price: 850000, price_suffix: "negotiable", location_key: "yirgalem",
      is_verified: 0, is_premium: 0,
      area_sqm: 8000,
      attributes: JSON.stringify({ land_type: "Agricultural", road_access: "Gravel", size_class: "Above 5,000 m²" }),
      _sub: "land",
    },
  ];
  const [[anyUser]] = await db.execute("SELECT id FROM users ORDER BY id ASC LIMIT 1");
  let seeded = 0;
  for (const s of LAND_SEEDS) {
    const [[dupe]] = await db.execute(
      "SELECT id FROM listings WHERE title_en = ? AND category = 'property' LIMIT 1",
      [s.title_en]
    );
    if (dupe) continue;
    const { _sub, ...row } = s;
    row.user_id = anyUser.id;
    row.currency = "ETB";
    row.status = "active";
    row.is_active = 1;
    row.subcategory_id = catBySlug.get(_sub);
    const keys = Object.keys(row).filter((k => lcols.has(k)));
    await db.execute(
      `INSERT INTO listings (${keys.join(",")}) VALUES (${keys.map(() => "?").join(",")})`,
      keys.map((k) => row[k])
    );
    seeded += 1;
  }
  console.log(`✅ ${seeded} demo land listings inserted`);

  console.log("🎉 Sprint 8d property taxonomy complete");
  process.exit(0);
}

main().catch((err) => {
  console.error("❌ Migration failed:", err);
  process.exit(1);
});
