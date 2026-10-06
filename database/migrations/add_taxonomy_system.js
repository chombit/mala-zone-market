/**
 * add_taxonomy_system.js
 * Sprint 4 — Catalog taxonomy: hierarchical categories, brands,
 * and per-category dynamic attributes (the Amazon "product types" /
 * eBay "aspects" pattern, sized for Malazone).
 *
 *   categories (tree)          brands            category_attributes
 *   ├─ parent_id               ├─ slug           ├─ category_id (inherited down tree)
 *   ├─ slug / path             ├─ name_en/am     ├─ attr_key, input_type, options
 *   └─ level                   └─ logo_url       └─ is_required/is_filterable
 *                              brand_models      category_brands (scoping)
 *
 * listings += subcategory_id, brand_id, brand_model_id, attributes JSON.
 * The legacy flat `listings.category` enum stays authoritative for roots so
 * every existing read path keeps working during the frontend transition.
 *
 * Idempotent: safe to run repeatedly.
 */
const db = require('../db');

async function colExists(conn, table, column) {
  const [rows] = await conn.execute(
    "SELECT COUNT(*) AS n FROM information_schema.COLUMNS WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = ? AND COLUMN_NAME = ?",
    [table, column]
  );
  return rows[0].n > 0;
}

async function migrate() {
  try {
    await db.transaction(async (conn) => {
      // ── 1. categories tree columns ────────────────────────────────────────
      const catCols = [
        ["parent_id", "ADD COLUMN parent_id INT NULL, ADD INDEX idx_cat_parent (parent_id)"],
        ["slug", "ADD COLUMN slug VARCHAR(80) NULL, ADD UNIQUE KEY uq_cat_slug (slug)"],
        ["path", "ADD COLUMN path VARCHAR(255) NULL, ADD INDEX idx_cat_path (path)"],
        ["level", "ADD COLUMN level TINYINT NOT NULL DEFAULT 0"],
      ];
      for (const [col, ddl] of catCols) {
        if (!(await colExists(conn, "categories", col))) {
          await conn.execute(`ALTER TABLE categories ${ddl}`);
          console.log(`✅ categories.${col} added`);
        }
      }
      await conn.execute("UPDATE categories SET slug = key_name WHERE slug IS NULL");
      await conn.execute("UPDATE categories SET level = 0, path = slug WHERE parent_id IS NULL");
      console.log('✅ categories backfilled to tree format');

      // Electronics root never existed in this table (only in the ENUM)
      await conn.execute(`
        INSERT INTO categories (key_name, label_en, label_am, description_en, description_am, is_active, display_order, slug, path, level)
        SELECT 'electronics', 'Electronics', 'ኤሌክትሮኒክስ', 'Phones, computers, TVs, gadgets', 'ስልኮች፣ ኮምፒውተሮች፣ ቲቪዎች', 1, 2, 'electronics', 'electronics', 0
        FROM DUAL WHERE NOT EXISTS (SELECT 1 FROM categories WHERE key_name = 'electronics')
      `);

      // ── 2. Subcategories (level 1) ────────────────────────────────────────
      const SUBCATS = [
        ["property", [
          ["houses", "Houses", "ቤቶች"],
          ["apartments", "Apartments", "አፓርታማዎች"],
          ["land", "Land", "መሬት"],
          ["commercial-property", "Commercial Property", "የንግድ ቤት"],
        ]],
        ["motors", [
          ["cars", "Cars", "መኪናዎች"],
          ["motorcycles", "Motorcycles", "ሞተር ሳይክል"],
          ["three-wheelers", "Three-Wheelers (Bajaj)", "ባጅጅ"],
          ["trucks", "Trucks", "ትራኮች"],
          ["buses", "Buses & Vans", "አውቶቡስ እና ቫን"],
          ["ev", "Electric Vehicles", "ኤሌክትሪክ ተሽከርካሪ"],
        ]],
        ["electronics", [
          ["laptops", "Laptops", "ላፕቶፕ"],
          ["desktops", "Desktops", "ዴስክቶፕ"],
          ["smartphones", "Smartphones", "ስማርትፎን"],
          ["tablets", "Tablets", "ታብሌት"],
          ["tv-audio", "TV & Audio", "ቲቪ እና ኦዲዮ"],
          ["cameras", "Cameras", "ካሜራ"],
          ["gaming", "Gaming", "ጨዋታ መሣሪያ"],
          ["accessories", "Accessories", "አክሰሰሪዎች"],
        ]],
        ["stay", [
          ["hotels", "Hotels", "ሆቴሎች"],
          ["guest-houses", "Guest Houses", "ጌስት ቤቶች"],
          ["resorts", "Resorts & Lodges", "ሪሶርቶች"],
        ]],
        ["ceremony", [
          ["event-halls", "Event Halls", "አዳራሾች"],
          ["catering", "Catering", "ኬተሪንግ"],
          ["photography", "Photography & Media", "ፎቶግራፊ"],
        ]],
        ["heavy", [
          ["excavators", "Excavators", "ኤክስካቬተር"],
          ["wheel-loaders", "Wheel Loaders", "ሎደር"],
          ["dozers", "Bulldozers", "ዶዘር"],
          ["graders", "Graders", "ግሬደር"],
          ["rollers", "Rollers", "ሮለር"],
          ["cranes", "Cranes", "ክሬን"],
          ["generators", "Generators", "ጀነሬተር"],
        ]],
      ];

      let subcatCount = 0;
      for (const [rootKey, children] of SUBCATS) {
        for (const [slug, en, am] of children) {
          const [result] = await conn.execute(
            `INSERT INTO categories (key_name, label_en, label_am, is_active, display_order, slug, path, level, parent_id)
             SELECT ?, ?, ?, 1, 0, ?, CONCAT(p.slug, '/', ?), 1, p.id
             FROM categories p
             WHERE p.key_name = ?
               AND NOT EXISTS (SELECT 1 FROM categories c WHERE c.parent_id = p.id AND c.slug = ?)`,
            [slug, en, am, slug, slug, rootKey, slug]
          );
          if (result.affectedRows > 0) subcatCount++;
        }
      }
      console.log(`✅ subcategories seeded (${subcatCount} new)`);

      // ── 3. Brands ─────────────────────────────────────────────────────────
      await conn.execute(`
        CREATE TABLE IF NOT EXISTS brands (
          id INT AUTO_INCREMENT PRIMARY KEY,
          slug VARCHAR(80) NOT NULL,
          name_en VARCHAR(100) NOT NULL,
          name_am VARCHAR(100) NULL,
          logo_url VARCHAR(255) NULL,
          is_active TINYINT(1) NOT NULL DEFAULT 1,
          created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
          UNIQUE KEY uq_brand_slug (slug)
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
      `);

      const BRANDS = [
        // electronics
        ["samsung", "Samsung"], ["apple", "Apple"], ["dell", "Dell"], ["hp", "HP"],
        ["lenovo", "Lenovo"], ["asus", "Asus"], ["acer", "Acer"], ["toshiba", "Toshiba"],
        ["xiaomi", "Xiaomi"], ["huawei", "Huawei"], ["tecno", "Tecno"], ["lg", "LG"],
        ["sony", "Sony"], ["canon", "Canon"], ["nikon", "Nikon"],
        // motors
        ["toyota", "Toyota"], ["hyundai", "Hyundai"], ["suzuki", "Suzuki"],
        ["isuzu", "Isuzu"], ["mitsubishi", "Mitsubishi"], ["nissan", "Nissan"],
        ["ford", "Ford"], ["volkswagen", "Volkswagen"], ["mercedes-benz", "Mercedes-Benz"],
        ["bmw", "BMW"], ["lifan", "Lifan"], ["geely", "Geely"], ["higer", "Higer"],
        // heavy machinery
        ["caterpillar", "Caterpillar (CAT)"], ["komatsu", "Komatsu"], ["jcb", "JCB"],
        ["volvo-ce", "Volvo CE"], ["hitachi", "Hitachi"], ["john-deere", "John Deere"],
        ["massey-ferguson", "Massey Ferguson"], ["new-holland", "New Holland"],
      ];
      for (const [slug, name] of BRANDS) {
        await conn.execute(
          `INSERT INTO brands (slug, name_en) SELECT ?, ? FROM DUAL
           WHERE NOT EXISTS (SELECT 1 FROM brands WHERE slug = ?)`,
          [slug, name, slug]
        );
      }
      console.log('✅ brands seeded');

      // Brand models (depth for motors/electronics; seeded lightly)
      await conn.execute(`
        CREATE TABLE IF NOT EXISTS brand_models (
          id INT AUTO_INCREMENT PRIMARY KEY,
          brand_id INT NOT NULL,
          name VARCHAR(120) NOT NULL,
          release_year SMALLINT NULL,
          UNIQUE KEY uq_model (brand_id, name),
          CONSTRAINT fk_bm_brand FOREIGN KEY (brand_id) REFERENCES brands(id)
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
      `);
      const MODELS = [
        ["toyota", ["Corolla", "Land Cruiser", "Hilux", "Vitz", "Yaris", "RAV4"]],
        ["suzuki", ["Dzire", "Swift", "Alto", "Jimny"]],
        ["hyundai", ["Tucson", "Elantra", "Accent", "Creta"]],
        ["apple", ["iPhone 12", "iPhone 13", "iPhone 14", "iPhone 15", "MacBook Air M2"]],
        ["samsung", ["Galaxy A15", "Galaxy A34", "Galaxy S23", "Galaxy S24"]],
      ];
      for (const [brandSlug, models] of MODELS) {
        for (const m of models) {
          await conn.execute(
            `INSERT INTO brand_models (brand_id, name)
             SELECT b.id, ? FROM brands b WHERE b.slug = ?
               AND NOT EXISTS (SELECT 1 FROM brand_models bm WHERE bm.brand_id = b.id AND bm.name = ?)`,
            [m, brandSlug, m]
          );
        }
      }
      console.log('✅ brand models seeded');

      // ── 4. Category↔brand scoping ─────────────────────────────────────────
      await conn.execute(`
        CREATE TABLE IF NOT EXISTS category_brands (
          category_id INT NOT NULL,
          brand_id INT NOT NULL,
          PRIMARY KEY (category_id, brand_id),
          CONSTRAINT fk_cb_cat FOREIGN KEY (category_id) REFERENCES categories(id),
          CONSTRAINT fk_cb_brand FOREIGN KEY (brand_id) REFERENCES brands(id)
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
      `);
      // Brands attach to ROOT categories; reads resolve inheritance via path.
      const BRAND_SCOPE = {
        electronics: ["samsung","apple","dell","hp","lenovo","asus","acer","toshiba","xiaomi","huawei","tecno","lg","sony","canon","nikon"],
        motors: ["toyota","hyundai","suzuki","isuzu","mitsubishi","nissan","ford","volkswagen","mercedes-benz","bmw","lifan","geely","higer"],
        heavy: ["caterpillar","komatsu","jcb","volvo-ce","hitachi","john-deere","massey-ferguson","new-holland"],
      };
      for (const [rootSlug, slugs] of Object.entries(BRAND_SCOPE)) {
        for (const bs of slugs) {
          await conn.execute(
            `INSERT INTO category_brands (category_id, brand_id)
             SELECT c.id, b.id FROM categories c JOIN brands b ON b.slug = ?
             WHERE c.slug = ?
               AND NOT EXISTS (SELECT 1 FROM category_brands x WHERE x.category_id = c.id AND x.brand_id = b.id)`,
            [bs, rootSlug]
          );
        }
      }
      console.log('✅ category_brands scoped');

      // ── 5. Dynamic attribute definitions ──────────────────────────────────
      await conn.execute(`
        CREATE TABLE IF NOT EXISTS category_attributes (
          id INT AUTO_INCREMENT PRIMARY KEY,
          category_id INT NOT NULL,
          attr_key VARCHAR(50) NOT NULL,
          label_en VARCHAR(100) NOT NULL,
          label_am VARCHAR(100) NULL,
          input_type ENUM('text','number','select','multiselect','boolean') NOT NULL DEFAULT 'text',
          unit VARCHAR(20) NULL,
          options JSON NULL COMMENT 'allowed values for select/multiselect',
          is_required TINYINT(1) NOT NULL DEFAULT 0,
          is_filterable TINYINT(1) NOT NULL DEFAULT 1,
          display_order INT NOT NULL DEFAULT 0,
          UNIQUE KEY uq_cat_attr (category_id, attr_key),
          CONSTRAINT fk_ca_cat FOREIGN KEY (category_id) REFERENCES categories(id)
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
      `);

      // [rootOrChildSlug, attr_key, label_en, input_type, unit, options[], required]
      const ATTRS = [
        ["electronics", "warranty_months", "Warranty (months)", "number", "months", [], false],
        ["smartphones", "storage_gb", "Storage", "select", "GB", [32,64,128,256,512,1024], true],
        ["smartphones", "ram_gb", "RAM", "select", "GB", [2,3,4,6,8,12,16], false],
        ["smartphones", "screen_size_in", "Screen size", "number", "inch", [], false],
        ["smartphones", "battery_mah", "Battery", "number", "mAh", [], false],
        ["smartphones", "dual_sim", "Dual SIM", "boolean", null, [], false],
        ["smartphones", "network_5g", "5G ready", "boolean", null, [], false],
        ["laptops", "ram_gb", "RAM", "select", "GB", [4,8,16,32,64], true],
        ["laptops", "storage_gb", "Storage", "select", "GB", [128,256,512,1024,2048], true],
        ["laptops", "storage_type", "Storage type", "select", null, ["HDD","SSD","Hybrid"], false],
        ["laptops", "cpu_brand", "CPU", "select", null, ["Intel","AMD","Apple","Qualcomm"], false],
        ["laptops", "screen_size_in", "Screen size", "number", "inch", [], false],
        ["desktops", "ram_gb", "RAM", "select", "GB", [4,8,16,32,64], true],
        ["desktops", "storage_gb", "Storage", "select", "GB", [256,512,1024,2048], false],
        ["desktops", "form_factor", "Form factor", "select", null, ["Tower","All-in-One","Mini PC"], false],
        ["cars", "year", "Year of manufacture", "number", null, [], true],
        ["cars", "mileage_km", "Mileage", "number", "km", [], true],
        ["cars", "transmission", "Transmission", "select", null, ["Manual","Automatic","CVT","AMT"], false],
        ["cars", "engine_cc", "Engine", "number", "cc", [], false],
        ["cars", "drive_type", "Drive", "select", null, ["FWD","RWD","AWD","4WD"], false],
        ["houses", "bedrooms", "Bedrooms", "number", null, [], true],
        ["houses", "bathrooms", "Bathrooms", "number", null, [], false],
        ["houses", "area_sqm", "Area", "number", "m²", [], false],
        ["houses", "furnishing", "Furnishing", "select", null, ["Unfurnished","Semi-furnished","Furnished"], false],
        ["apartments", "bedrooms", "Bedrooms", "number", null, [], true],
        ["apartments", "bathrooms", "Bathrooms", "number", null, [], false],
        ["apartments", "area_sqm", "Area", "number", "m²", [], false],
        ["apartments", "furnishing", "Furnishing", "select", null, ["Unfurnished","Semi-furnished","Furnished"], false],
        ["land", "area_sqm", "Area", "number", "m²", [], true],
        ["land", "deed_type", "Title deed type", "select", null, ["Freehold","Lease","Possessory"], false],
        ["excavators", "operating_hours", "Operating hours", "number", "h", [], false],
        ["excavators", "model_year", "Model year", "number", null, [], false],
      ];
      for (const [catSlug, key, en, type, unit, options, required] of ATTRS) {
        await conn.execute(
          `INSERT INTO category_attributes
             (category_id, attr_key, label_en, input_type, unit, options, is_required, is_filterable, display_order)
           SELECT c.id, ?, ?, ?, ?, ?, ?, 1, 0
           FROM categories c WHERE c.slug = ?
             AND NOT EXISTS (SELECT 1 FROM category_attributes a WHERE a.category_id = c.id AND a.attr_key = ?)`,
          [key, en, type, unit, options.length ? JSON.stringify(options) : null, required ? 1 : 0, catSlug, key]
        );
      }
      console.log('✅ category attributes seeded');

      // ── 6. Listing linkages ───────────────────────────────────────────────
      const listingCols = [
        ["subcategory_id", "ADD COLUMN subcategory_id INT NULL, ADD INDEX idx_listings_subcat (subcategory_id), ADD CONSTRAINT fk_l_subcat FOREIGN KEY (subcategory_id) REFERENCES categories(id)"],
        ["brand_id", "ADD COLUMN brand_id INT NULL, ADD INDEX idx_listings_brand (brand_id), ADD CONSTRAINT fk_l_brand FOREIGN KEY (brand_id) REFERENCES brands(id)"],
        ["brand_model_id", "ADD COLUMN brand_model_id INT NULL, ADD CONSTRAINT fk_l_bmodel FOREIGN KEY (brand_model_id) REFERENCES brand_models(id)"],
        ["attributes", "ADD COLUMN attributes LONGTEXT NULL COMMENT 'JSON object of category attribute values'"],
      ];
      for (const [col, ddl] of listingCols) {
        if (!(await colExists(conn, "listings", col))) {
          await conn.execute(`ALTER TABLE listings ${ddl}`);
          console.log(`✅ listings.${col} added`);
        }
      }

      console.log('🎉 Sprint 4 taxonomy migration complete');
    });
    process.exit(0);
  } catch (error) {
    console.error('Migration failed:', error.message);
    process.exit(1);
  }
}

migrate();
