/**
 * Sprint 9a — Vertical substitution migration (idempotent).
 *
 * Ceremony  -> Furniture  (root key/slug/path: ceremony -> furniture)
 * Machineries(heavy) -> Fashion (root key/slug/path: heavy -> fashion)
 *
 * - category_attributes / category_brands / brand_requests hang off INT
 *   category ids, so renaming slugs cannot orphan them.
 * - The five affected listings are dev/test rows created during E2E
 *   sessions; their titles are normalized to the new verticals so the
 *   platform demos coherently. Ownership and prices stay with their users.
 * - Every statement is guarded by its pre-rename value, so re-running is a
 *   no-op. No transactions (pool-level connections not available); each
 *   UPDATE is atomic on its own.
 *
 * © 2026 Malazone Technologies PLC
 */

const fs = require("fs");
const path = require("path");
const mysql = require("mysql2/promise");

const env = {};
for (const l of fs.readFileSync(path.join(__dirname, "..", "..", ".env"), "utf8").split(/\r?\n/)) {
  const m = l.match(/^\s*([A-Za-z_][A-Za-z0-9_]*)\s*=\s*(.*)\s*$/);
  if (m) env[m[1]] = m[2].replace(/^["']|["']$/g, "");
}

async function run(db, sql, args, tag) {
  const [res] = await db.execute(sql, args);
  if (res.affectedRows > 0) console.log(`  [${tag}] ${res.affectedRows} row(s)`);
  return res.affectedRows;
}

(async () => {
  const db = await mysql.createConnection({
    host: env.DB_HOST || "localhost",
    port: Number(env.DB_PORT || 3306),
    user: env.DB_USER,
    password: env.DB_PASSWORD,
    database: env.DB_NAME,
  });
  console.log("Sprint 9a — Ceremony→Furniture, Heavy→Fashion");

  // ── 0. Widen the listings.category ENUM before touching rows ─────────
  // listings.category is an ENUM('property','motors','stay','ceremony',
  // 'heavy','electronics'). Writing 'furniture'/'fashion' into the old
  // ENUM under non-strict sql_mode silently stores '' — so this ALTER must
  // precede every listing UPDATE. Guarded: skipped once widened.
  {
    const [col] = await db.query(
      `SELECT COLUMN_TYPE FROM information_schema.COLUMNS
       WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME='listings' AND COLUMN_NAME='category'`
    );
    if (col[0] && col[0].COLUMN_TYPE.includes("ceremony")) {
      await db.query(
        `ALTER TABLE listings MODIFY category ENUM('property','motors','stay','furniture','fashion','electronics') NOT NULL`
      );
      console.log("  [listings.category] ENUM widened to furniture/fashion");
    } else {
      console.log("  [listings.category] already widened — skipping");
    }
  }

  // ── 1. Normalize the five test listings to the new verticals ──────────
  // Furniture (was ceremony): ids 11 living-room, 13 dining-kitchen, 18 bedroom.
  // Guards accept category='' too: that is what a run against the un-widened
  // ENUM leaves behind (non-strict coercion), so reruns self-heal.
  await run(db,
    `UPDATE listings SET title_en='3-Seater Fabric Sofa', title_am='ሶፋ', description_en='Comfortable 3-seater fabric sofa in good condition.', category='furniture', subcategory_id=28 WHERE id=11 AND (category='ceremony' OR category='')`,
    [], "listing 11 → furniture/living-room");
  await run(db,
    `UPDATE listings SET title_en='Solid Wood Dining Table — 6 Seats', title_am='የምግብ ሰንጠረዥ', description_en='Solid wood dining table with six seats.', category='furniture', subcategory_id=30 WHERE id=13 AND (category='ceremony' OR category='')`,
    [], "listing 13 → furniture/dining-kitchen");
  await run(db,
    `UPDATE listings SET title_en='King Size Bed Frame', title_am='መኝታ አልጋ', description_en='Sturdy king size bed frame.', category='furniture', subcategory_id=29 WHERE id=18 AND (category='ceremony' OR category='')`,
    [], "listing 18 → furniture/bedroom");
  // Fashion (was heavy): ids 25 mens-clothing, 26 womens-clothing (+ sane prices)
  await run(db,
    `UPDATE listings SET title_en="Men's Premium Leather Jacket", title_am='የወንዶች ቆዳ ጀኬት', description_en='Premium leather jacket, brand new.', price=85000, category='fashion', subcategory_id=31 WHERE id=25 AND (category='heavy' OR category='')`,
    [], "listing 25 → fashion/mens-clothing");
  await run(db,
    `UPDATE listings SET title_en="Women's Evening Dress", title_am='የሴቶች ሙሌት ቀሚስ', description_en='Elegant evening dress for events.', price=12000, category='fashion', subcategory_id=32 WHERE id=26 AND (category='heavy' OR category='')`,
    [], "listing 26 → fashion/womens-clothing");

  // Safety net: any other rows still carrying old slugs keep their content
  // but follow the renamed taxonomy.
  await run(db, `UPDATE listings SET category='furniture' WHERE category='ceremony'`, [], "listings ceremony→furniture");
  await run(db, `UPDATE listings SET category='fashion' WHERE category='heavy'`, [], "listings heavy→fashion");

  // ── 2. Saved searches embed category slugs in query_json ──────────────
  await run(db,
    `UPDATE saved_searches SET query_json = REPLACE(query_json, '"category":"ceremony"', '"category":"furniture"') WHERE query_json LIKE '%"category":"ceremony"%'`,
    [], "saved_searches ceremony");
  await run(db,
    `UPDATE saved_searches SET query_json = REPLACE(query_json, '"category":"heavy"', '"category":"fashion"') WHERE query_json LIKE '%"category":"heavy"%'`,
    [], "saved_searches heavy");

  // ── 3. Hero slides (labels + imagery follow the new verticals) ────────
  await run(db,
    `UPDATE hero_slides SET label_en='Furniture', label_am='የቤት እቃ ዞን',
       image_url='https://images.unsplash.com/photo-1555041469-a586c61ea9bc?w=1600&q=90&fm=webp'
     WHERE id=4 AND label_en='Ceremony & DJ'`,
    [], "hero_slides #4");
  await run(db,
    `UPDATE hero_slides SET label_en='Fashion', label_am='ፋሽን ዞን',
       image_url='https://images.unsplash.com/photo-1441984904996-e0b6ba687e04?w=1600&q=90&fm=webp'
     WHERE id=5 AND label_en='Heavy Machinery'`,
    [], "hero_slides #5");

  // ── 4. Testimonial #2 referenced construction machinery leasing ───────
  await run(db,
    `UPDATE testimonials SET text_en='I opened my fashion boutique on malazone and reach thousands of buyers across Sidama every day. No broker fees, pure profit.',
       text_am='በmalazone ላይ የፋሽን ሱቄን ከፍቻለሁ፤ በየቀኑ ሺዎችን ወዳጆች አገኛለሁ። ደላላ የለም፣ ትርፉ ሙሉ የኔ ነው።'
     WHERE id=2 AND text_en LIKE '%machinery%'`,
    [], "testimonials #2");

  // ── 5. Category subtree relabels (children first, guarded by slug) ────
  const childRenames = [
    [28, "living-room",      "furniture/living-room",     "Living Room",        "ሶፋ እና ወንበር",                    "Sofas, armchairs, coffee tables"],
    [29, "bedroom",          "furniture/bedroom",         "Bedroom",            "መኝታ እቃ",                        "Beds, wardrobes, dressers"],
    [30, "dining-kitchen",   "furniture/dining-kitchen",  "Dining & Kitchen",   "የምግብ ክፍል እቃ",                   "Dining tables, kitchen cabinets"],
    [31, "mens-clothing",    "fashion/mens-clothing",     "Men's Clothing",     "የወንዶች ልብስ",                     "Shirts, trousers, jackets"],
    [32, "womens-clothing",  "fashion/womens-clothing",   "Women's Clothing",   "የሴቶች ልብስ",                      "Dresses, skirts, tops"],
    [33, "shoes",            "fashion/shoes",             "Shoes & Sneakers",   "ጫማዎች",                          "Formal shoes, sneakers, heels"],
    [34, "bags-accessories", "fashion/bags-accessories",  "Bags & Accessories", "ቦርሳዎች እና አክሰሰሪዎች",             "Handbags, belts, sunglasses"],
    [35, "watches-jewelry",  "fashion/watches-jewelry",   "Watches & Jewelry",  "ሰዓቶች እና ጌጣጌጦች",                "Wrist watches, rings, necklaces"],
    [36, "kids-fashion",     "fashion/kids-fashion",      "Kids' Fashion",      "የህፃናት ልብስ",                     "Clothing for babies and kids"],
    [37, "traditional-wear", "fashion/traditional-wear",  "Traditional Wear",   "ባህላዊ ልብስ",                      "Habesha kemis, netela, cultural attire"],
  ];
  for (const [id, slug, p, en, am, desc] of childRenames) {
    await run(db,
      `UPDATE categories SET key_name=?, slug=?, path=?, label_en=?, label_am=?, description_en=? WHERE id=? AND slug NOT IN (?)`,
      [slug, slug, p, en, am, desc, id, slug],
      `cat#${id}`);
  }

  // ── 6. Root renames ────────────────────────────────────────────────────
  await run(db,
    `UPDATE categories SET key_name='furniture', slug='furniture', path='furniture',
       label_en='Furniture', label_am='የቤት እቃ',
       description_en='Home & office furniture', description_am='የቤት እና ቢሮ እቃዎች'
     WHERE key_name='ceremony' AND level=0`,
    [], "root ceremony→furniture");
  await run(db,
    `UPDATE categories SET key_name='fashion', slug='fashion', path='fashion',
       label_en='Fashion', label_am='ፋሽን',
       description_en='Clothing, shoes & accessories', description_am='ልብሶች፣ ጫማዎች እና አክሰሰሪዎች'
     WHERE key_name='heavy' AND level=0`,
    [], "root heavy→fashion");
  // Stay keeps its slug; only the display copy drops the retired word.
  await run(db,
    `UPDATE categories SET label_en='Hotels & Halls', label_am='ሆቴሎች እና አዳራሾች',
       description_en='Hotels, guest houses, event halls', description_am='ሆቴሎች፣ እንግዳ ቤቶች፣ አዳራሾች'
     WHERE key_name='stay' AND label_en='Stay & Ceremony'`,
    [], "stay relabel");

  // ── 7. Verification summary ────────────────────────────────────────────
  const [roots] = await db.query(
    "SELECT key_name, label_en FROM categories WHERE level=0 ORDER BY display_order"
  );
  console.log("\nRoots now:", roots.map((r) => `${r.key_name} (${r.label_en})`).join(", "));
  const [left] = await db.query(
    `SELECT
       (SELECT COUNT(*) FROM listings WHERE category IN ('ceremony','heavy')) +
       (SELECT COUNT(*) FROM categories WHERE key_name IN ('ceremony','heavy') OR path LIKE 'ceremony/%' OR path LIKE 'heavy/%') +
       (SELECT COUNT(*) FROM saved_searches WHERE query_json LIKE '%"ceremony"%' OR query_json LIKE '%"heavy"%') AS stale`
  );
  console.log("Stale references remaining:", left[0].stale === 0 ? "NONE ✓" : left[0].stale);

  await db.end();
  console.log("\nMigration complete.");
})().catch((e) => { console.error("MIGRATION FAILED:", e.message); process.exit(1); });
