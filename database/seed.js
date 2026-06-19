/**
 * database/seed.js
 * Malazone.com — Database Seeding for Initial Data
 * © 2026 Malazone Technologies PLC
 */
"use strict";

const bcrypt = require("bcrypt");
const db = require("./db");

const seedDatabase = async () => {
  try {
    console.log("🌱 Seeding Malazone Database...");

    // 1. Hash passwords securely
    const SALT_ROUNDS = 12;
    const superAdminPassword = await bcrypt.hash("superadmin123", SALT_ROUNDS);
    const adminPassword = await bcrypt.hash("admin", SALT_ROUNDS);

    // 2. Insert initial admin users
    await db.execute(`
      INSERT IGNORE INTO admin_users 
        (username, password_hash, full_name, role, is_active) 
      VALUES 
        (?, ?, ?, ?, ?),
        (?, ?, ?, ?, ?)
    `, [
      "superadmin", superAdminPassword, "System Super Admin", "super_admin", true,
      "admin", adminPassword, "System Admin", "admin", true
    ]);
    console.log("✅ Admin users seeded successfully!");

    // 3. Insert initial site stats
    await db.execute(`
      INSERT IGNORE INTO site_stats 
        (key_name, value_int, description_en, description_am) 
      VALUES 
        ("clients", 1003, "Total registered users", "ጠቅላላ የተመዘገቡ ተጠቃሚዎች"),
        ("listings", 2547, "Total active listings", "ጠቅላላ ተግባራዊ ዝርዝሮች"),
        ("vehicles", 1412, "Total vehicles listed", "ጠቅላላ የተዘረዘሩ መኪናዎች"),
        ("trade_success_rate", 100, "Trade success rate percentage", "የንግድ ስኬት መጠነኛያ")
    `);
    console.log("✅ Site stats seeded successfully!");

    // 4. Insert initial categories
    await db.execute(`
      INSERT IGNORE INTO categories 
        (key_name, label_en, label_am, description_en, description_am, display_order, is_active) 
      VALUES 
        ("property", "Property", "ቤት እና ይዞታ", "Properties, houses, apartments", "ቤቶች፣ አፓርታማዎች", 0, true),
        ("motors", "Motors & EV", "መኪናዎች", "Cars, motorcycles, EVs", "መኪናዎች፣ ሞተር ሳይክሎች", 1, true),
        ("stay", "Stay & Ceremony", "እንቅልፍ እና ስርዓት", "Hotels, halls, ceremony services", "ሆቴሎች፣ አዳራሾች", 2, true),
        ("ceremony", "Ceremony", "ስርዓት", "Ceremony services", "ስርዓት አገልግሎቶች", 3, true),
        ("heavy", "Heavy Machinery", "ከባድ ማሽነሪዎች", "Excavators, tractors, loaders", "ማሽነሪዎች", 4, true)
    `);
    console.log("✅ Categories seeded successfully!");

    // 5. Insert initial locations
    await db.execute(`
      INSERT IGNORE INTO locations 
        (key_name, label_en, label_am, sub_zones, display_order, is_active) 
      VALUES 
        ("hawassa", "Hawassa", "ሀዋሳ", '[{"key":"tabor","label_en":"Tabor","label_am":"ታቦር"},{"key":"lakefront","label_en":"Lakefront","label_am":"የሐይቅ ጫፍ"},{"key":"piassa","label_en":"Piassa","label_am":"ፒያሳ"}]', 0, true),
        ("yirgalem", "Yirgalem", "ይርጋለም", '[]', 1, true),
        ("aleta_wondo", "Aleta Wondo", "አሌታ ወንዶ", '[]', 2, true),
        ("bensa", "Bensa/Daye", "ቤንሳ/ዳዬ", '[]', 3, true),
        ("chuko", "Chuko", "ጩቆ", '[]', 4, true),
        ("addis_ababa", "Addis Ababa", "አዲስ አበባ", '[]', 5, true)
    `);
    console.log("✅ Locations seeded successfully!");

    // 6. Insert initial hero slides
    await db.execute(`
      INSERT IGNORE INTO hero_slides 
        (image_url, pillar_key, category_id, label_en, label_am, display_order, is_active) 
      VALUES 
        ("https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=1600&q=90&fm=webp", "nav.cat1", "property", "Property", "ቤት እና ይዞታ", 0, true),
        ("https://images.unsplash.com/photo-1494976388531-d1058494cdd8?w=1600&q=90&fm=webp", "nav.cat2", "motors", "Motors & EV", "መኪና ዞን", 1, true),
        ("https://images.unsplash.com/photo-1551882547-ff40c63fe5fa?w=1600&q=90&fm=webp", "nav.cat3", "stay", "Rooms & Halls", "አዳራሽ ዞን", 2, true),
        ("https://images.unsplash.com/photo-1519741497674-611481863552?w=1600&q=90&fm=webp", "nav.cat4", "ceremony", "Ceremony & DJ", "ሰርግ ዞን", 3, true),
        ("https://images.unsplash.com/photo-1504917595217-d4dc5ebe6122?w=1600&q=90&fm=webp", "nav.cat5", "heavy", "Heavy Machinery", "ማሽነሪ ዞን", 4, true)
    `);
    console.log("✅ Hero slides seeded successfully!");

    console.log("\n📝 Credentials:");
    console.log("   - Super Admin: superadmin / superadmin123");
    console.log("   - Admin: admin / admin");
    console.log("\n✅ All data seeded successfully!");

  } catch (err) {
    console.error("❌ Seeding failed:", err);
  } finally {
    process.exit(0);
  }
};

seedDatabase();