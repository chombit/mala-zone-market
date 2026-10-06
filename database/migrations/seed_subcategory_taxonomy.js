/**
 * Sprint 8c migration — subcategory-scoped taxonomy for Electronics.
 *
 * 1. New brands (Infinix, Hisense).
 * 2. Direct category_brands mappings on electronics SUBCATEGORIES — once a
 *    subcategory has its own list it becomes authoritative (nearest wins).
 * 3. Per-subcategory attribute definitions (storage, RAM, processor,
 *    resolution, ...) that merge over the root's inherited defs.
 * 4. Tag existing electronics listings with matching attribute values so
 *    the new facet filters return real results.
 *
 * Idempotent: every step checks before inserting.
 */
const db = require("../db");

const BRANDS = [
  { slug: "infinix", name_en: "Infinix" },
  { slug: "hisense", name_en: "Hisense" },
];

// child slug -> brand slugs (authoritative for that subcategory)
const SUB_BRANDS = {
  smartphones: ["apple", "samsung", "xiaomi", "tecno", "huawei", "infinix"],
  laptops: ["dell", "hp", "lenovo", "asus", "acer", "apple"],
  "tv-audio": ["lg", "sony", "hisense", "samsung", "toshiba"],
  tablets: ["apple", "samsung", "huawei", "lenovo"],
  cameras: ["canon", "nikon", "sony"],
  desktops: ["dell", "hp", "lenovo", "asus", "acer"],
  gaming: ["sony"],
};

// child slug -> attribute definitions (plain-string options: validation
// compares raw input against options via String(), objects would break)
const SUB_ATTRS = {
  smartphones: [
    { attr_key: "condition", label_en: "Condition", input_type: "select", options: ["new", "used", "refurbished"] },
    { attr_key: "storage_capacity", label_en: "Storage", input_type: "select", options: ["64GB", "128GB", "256GB", "512GB"] },
    { attr_key: "screen_size", label_en: "Screen size", input_type: "select", unit: "inch", options: ['5.5-6.0"', '6.1-6.5"', '6.6-7.0"'] },
    { attr_key: "battery_health", label_en: "Battery health", input_type: "select", options: ["95-100%", "85-94%", "70-84%"] },
  ],
  laptops: [
    { attr_key: "ram", label_en: "RAM", input_type: "select", options: ["8GB", "16GB", "32GB"] },
    { attr_key: "processor", label_en: "Processor", input_type: "select", options: ["Intel i5", "Intel i7", "Intel i9", "Ryzen 5", "Ryzen 7", "Apple M1", "Apple M2", "Apple M3"] },
    { attr_key: "graphics_card", label_en: "Graphics card", input_type: "select", options: ["Integrated", "GTX 1650", "RTX 3050", "RTX 4060"] },
  ],
  "tv-audio": [
    { attr_key: "screen_size", label_en: "Screen size", input_type: "select", unit: "inch", options: ['32"', '43"', '50"', '55"', '65"+'] },
    { attr_key: "resolution", label_en: "Resolution", input_type: "select", options: ["HD", "FHD", "4K", "8K"] },
    { attr_key: "smart_tv", label_en: "Smart TV", input_type: "select", options: ["Yes", "No"] },
  ],
  tablets: [
    { attr_key: "storage_capacity", label_en: "Storage", input_type: "select", options: ["64GB", "128GB", "256GB", "512GB"] },
    { attr_key: "connectivity", label_en: "Connectivity", input_type: "select", options: ["Wi-Fi", "Wi-Fi + Cellular"] },
  ],
  gaming: [
    { attr_key: "platform", label_en: "Platform", input_type: "select", options: ["PC", "PlayStation", "Xbox"] },
  ],
};

// listing title fragment -> attributes (for tagging existing rows)
const TITLE_ATTRS = [
  [/iphone 14 pro/i, { condition: "used", storage_capacity: "128GB", battery_health: "85-94%", screen_size: '6.1-6.5"' }],
  [/iphone 15 pro max/i, { condition: "used", storage_capacity: "256GB", battery_health: "95-100%", screen_size: '6.6-7.0"' }],
  [/galaxy s24/i, { condition: "new", storage_capacity: "256GB", battery_health: "95-100%", screen_size: '6.6-7.0"' }],
  [/macbook air m3/i, { ram: "16GB", processor: "Apple M3" }],
  [/dell latitude/i, { ram: "16GB", processor: "Intel i7" }],
  [/oled smart tv/i, { screen_size: '55"', resolution: "4K", smart_tv: "Yes" }],
  [/\b43" smart tv/i, { screen_size: '43"', resolution: "FHD", smart_tv: "Yes" }],
  [/ps5|playstation 5/i, { platform: "PlayStation" }],
];

async function main() {
  await db.initializePool();

  // ── 1. brands ──
  for (const b of BRANDS) {
    const [[dupe]] = await db.execute("SELECT id FROM brands WHERE slug = ?", [b.slug]);
    if (!dupe) {
      await db.execute("INSERT INTO brands (slug, name_en, is_active) VALUES (?, ?, 1)", [b.slug, b.name_en]);
      console.log(`✅ brand +${b.name_en}`);
    }
  }
  const [brandRows] = await db.execute("SELECT id, slug FROM brands");
  const brandBySlug = new Map(brandRows.map((b) => [b.slug, b.id]));

  const [catRows] = await db.execute(
    "SELECT c.id, c.slug FROM categories c JOIN categories r ON r.id = c.parent_id WHERE r.slug = 'electronics'"
  );
  const catBySlug = new Map(catRows.map((c) => [c.slug, c.id]));
  const [[electronicsRoot]] = await db.execute("SELECT id FROM categories WHERE slug = 'electronics'");

  // ── 2. subcategory brand maps ──
  let mapCount = 0;
  for (const [subSlug, brandSlugs] of Object.entries(SUB_BRANDS)) {
    const cid = catBySlug.get(subSlug);
    if (!cid) { console.log(`⚠️ category ${subSlug} missing`); continue; }
    for (const bs of brandSlugs) {
      const bid = brandBySlug.get(bs);
      if (!bid) { console.log(`⚠️ brand ${bs} missing`); continue; }
      // composite PK (category_id, brand_id) — no id column
      const [[dupe]] = await db.execute(
        "SELECT brand_id FROM category_brands WHERE category_id = ? AND brand_id = ?",
        [cid, bid]
      );
      if (!dupe) {
        await db.execute("INSERT INTO category_brands (category_id, brand_id) VALUES (?, ?)", [cid, bid]);
        mapCount += 1;
      }
    }
  }
  console.log(`✅ ${mapCount} new subcategory↔brand mappings`);

  // ── 3. subcategory attribute defs ──
  // Introspect columns to stay schema-tolerant.
  const [attrCols] = await db.execute("SHOW COLUMNS FROM category_attributes");
  const have = new Set(attrCols.map((c) => c.Field));
  let attrCount = 0;
  for (const [subSlug, defs] of Object.entries(SUB_ATTRS)) {
    const cid = catBySlug.get(subSlug);
    if (!cid) continue;
    let order = 10;
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
  console.log(`✅ ${attrCount} new subcategory attribute defs`);

  // ── 3b. declutter: legacy numeric attrs are superseded by per-subcategory
  // selects — keep them valid for posting, hide them from facet UIs, and
  // never require them (Sprint 8e: a required deprecated key blocks every
  // post that uses only the modern selects).
  const LEGACY_ATTRS = ["storage_gb", "ram_gb", "screen_size_in", "battery_mah"];
  {
    const ph = LEGACY_ATTRS.map(() => "?").join(",");
    await db.execute(
      `UPDATE category_attributes SET is_filterable = 0, is_required = 0 WHERE attr_key IN (${ph})`,
      LEGACY_ATTRS
    );
    console.log("✅ legacy numeric attrs hidden from filters + unrequired (all levels)");
  }

  // ── 4. tag existing electronics listings ──
  // Attributes are stored as a JSON column on listings (Sprint 4 schema).
  const [elecListings] = await db.execute(
    "SELECT id, title_en, attributes FROM listings WHERE category = 'electronics' AND is_active = 1"
  );

  let tagCount = 0;
  for (const l of elecListings) {
    const attrs = TITLE_ATTRS.find(([re]) => re.test(l.title_en || ""))?.[1];
    if (!attrs) continue;
    let existing = {};
    try { existing = typeof l.attributes === "string" ? JSON.parse(l.attributes || "{}") : l.attributes || {}; } catch { existing = {}; }
    const merged = { ...existing };
    let changed = false;
    for (const [k, v] of Object.entries(attrs)) {
      if (merged[k] === undefined) { merged[k] = v; changed = true; }
    }
    if (!changed) continue;
    await db.execute("UPDATE listings SET attributes = ? WHERE id = ?", [
      JSON.stringify(merged),
      l.id,
    ]);
    tagCount += Object.keys(attrs).length;
  }
  console.log(`✅ ${tagCount} attribute values merged into electronics listing JSON`);

  // ── 4b. assign electronics listings without a subcategory ──
  const TITLE_TO_SUB = [
    [/iphone|galaxy|smartphone/i, "smartphones"],
    [/macbook|latitude|laptop/i, "laptops"],
    [/\btv\b|oled|smart tv/i, "tv-audio"],
    [/ps5|playstation|xbox console/i, "gaming"],
  ];
  const [[rootRow]] = await db.execute("SELECT id FROM categories WHERE slug = 'electronics'");
  const [untagged] = await db.execute(
    "SELECT id, title_en FROM listings WHERE category = 'electronics' AND subcategory_id IS NULL"
  );
  let subCount = 0;
  for (const l of untagged) {
    const subSlug = TITLE_TO_SUB.find(([re]) => re.test(l.title_en || ""))?.[1];
    if (!subSlug) continue;
    const sid = catBySlug.get(subSlug);
    if (!sid) continue;
    await db.execute("UPDATE listings SET subcategory_id = ? WHERE id = ?", [sid, l.id]);
    subCount += 1;
  }
  console.log(`✅ ${subCount}/${untagged.length} electronics listings assigned to subcategories`);

  // ── 4c. modernize attribute values on remaining legacy-tagged rows ──
  const EXTRA_TAGS = [
    [/iphone 15 pro$/i, { condition: "used", storage_capacity: "512GB", screen_size: '6.1-6.5"' }],
    [/galaxy a34/i, { condition: "used", storage_capacity: "256GB", battery_health: "85-94%", screen_size: '6.6-7.0"' }],
    [/thinkpad t14/i, { ram: "16GB", processor: "Intel i7" }],
    [/thinkpad x13/i, { ram: "16GB", processor: "Intel i7" }],
    [/acer aspire/i, { ram: "8GB", processor: "Ryzen 5" }],
    [/hp pavilion/i, { ram: "8GB", processor: "Intel i5" }],
    [/macbook pro max/i, { ram: "32GB", processor: "Apple M3" }],
  ];
  const [legacyTagged] = await db.execute(
    "SELECT id, title_en, attributes FROM listings WHERE category = 'electronics' AND is_active = 1"
  );
  let extraCount = 0;
  for (const l of legacyTagged) {
    const attrs = EXTRA_TAGS.find(([re]) => re.test(l.title_en || ""))?.[1];
    if (!attrs) continue;
    let existing = {};
    try { existing = typeof l.attributes === "string" ? JSON.parse(l.attributes || "{}") : l.attributes || {}; } catch { existing = {}; }
    const merged = { ...existing };
    let changed = false;
    for (const [k, v] of Object.entries(attrs)) {
      if (merged[k] === undefined) { merged[k] = v; changed = true; }
    }
    if (!changed) continue;
    await db.execute("UPDATE listings SET attributes = ? WHERE id = ?", [JSON.stringify(merged), l.id]);
    extraCount += 1;
  }
  console.log(`✅ ${extraCount} more listings given modern attribute values`);

  // Warm the taxonomy cache via a fresh load on next request; done.
  console.log("🎉 Sprint 8c subcategory scoping complete");
  process.exit(0);
}

main().catch((err) => {
  console.error("❌ Migration failed:", err);
  process.exit(1);
});
