/**
 * database/seed.js
 * Malazone.com — Database Seeding for Initial Data
 * © 2026 Malazone Technologies PLC
 */
"use strict";

const bcrypt = require("bcrypt");
const crypto = require("crypto");
const db = require("./db");

/**
 * Admin seed passwords come from env so no credentials are ever committed.
 * If unset, a strong random password is generated and printed ONCE.
 */
function resolveSeedPassword(envName, username) {
  if (process.env[envName] && process.env[envName].length >= 8) {
    return { password: process.env[envName], generated: false };
  }
  return {
    password: crypto.randomBytes(12).toString("base64url"),
    generated: true,
  };
}

const seedDatabase = async () => {
  try {
    console.log("🌱 Seeding Malazone Database...");

    // 1. Hash passwords securely
    const SALT_ROUNDS = 12;
    const superadminCreds = resolveSeedPassword("SEED_SUPERADMIN_PASSWORD", "superadmin");
    const adminCreds = resolveSeedPassword("SEED_ADMIN_PASSWORD", "admin");
    const muniCreds = resolveSeedPassword("SEED_MUNI_PASSWORD", "muni_officer");
    const transCreds = resolveSeedPassword("SEED_TRANS_PASSWORD", "trans_officer");

    const [superAdminPassword, adminPassword, municipalityPassword, transportPassword] =
      await Promise.all([
        bcrypt.hash(superadminCreds.password, SALT_ROUNDS),
        bcrypt.hash(adminCreds.password, SALT_ROUNDS),
        bcrypt.hash(muniCreds.password, SALT_ROUNDS),
        bcrypt.hash(transCreds.password, SALT_ROUNDS),
      ]);

    // 2. Insert initial admin users
    await db.execute(`
      INSERT IGNORE INTO admin_users 
        (username, password_hash, full_name, role, is_active) 
      VALUES 
        (?, ?, ?, ?, ?),
        (?, ?, ?, ?, ?),
        (?, ?, ?, ?, ?),
        (?, ?, ?, ?, ?)
    `, [
      "superadmin", superAdminPassword, "System Super Admin", "super_admin", true,
      "admin", adminPassword, "System Admin", "admin", true,
      "muni_officer", municipalityPassword, "Municipality Clerk Seat 02", "g2b_municipality", true,
      "trans_officer", transportPassword, "Transit Officer Seat 09", "g2b_transport", true
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
        ("stay", "Hotels & Halls", "ሆቴሎች እና አዳራሾች", "Hotels, guest houses & event halls", "ሆቴሎች፣ አዳራሾች", 2, true),
        ("furniture", "Furniture", "የቤት እቃ", "Home & office furniture", "የቤትና ቢሮ እቃዎች", 3, true),
        ("fashion", "Fashion", "ፋሽን", "Clothing, shoes & accessories", "ልብሶች፣ ጫማዎች", 4, true),
        ("electronics", "Electronics", "ኤሌክትሮኒክስ", "Phones, laptops, gadgets", "ስማርትፎኖች፣ ዋቂያዎች", 5, true)
    `);
    console.log("✅ Categories seeded successfully!");

    // 5. Insert initial locations
    await db.execute(`
      INSERT IGNORE INTO locations 
        (key_name, label_en, label_am, label_sid, sub_zones, display_order, is_active) 
      VALUES 
        ("hawassa", "Hawassa", "ሀዋሳ", "Hawwissaa", '[{"key":"tabor","label_en":"Tabor","label_am":"ታቦር","label_sid":"Taabor"},{"key":"lakefront","label_en":"Lakefront","label_am":"የሐይቅ ጫፍ","label_sid":"Haweela Tulaa"},{"key":"piassa","label_en":"Piassa","label_am":"ፒያሳ","label_sid":"Piyaasa"}]', 0, true),
        ("yirgalem", "Yirgalem", "ይርጋለም", "Yirgaaleem", '[]', 1, true),
        ("aleta_wondo", "Aleta Wondo", "አሌታ ወንዶ", "Aletaa Wondoo", '[]', 2, true),
        ("bensa", "Bensa/Daye", "ቤንሳ/ዳዬ", "Bensaa/Daaye", '[]', 3, true),
        ("chuko", "Chuko", "ጩቆ", "Cuqoo", '[]', 4, true),
        ("addis_ababa", "Addis Ababa", "አዲስ አበባ", "Addis Abbaa", '[]', 5, true)
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
        ("https://images.unsplash.com/photo-1555041469-a586c61ea9bc?w=1600&q=90&fm=webp", "nav.cat4", "furniture", "Furniture", "የቤት እቃ ዞን", 3, true),
        ("https://images.unsplash.com/photo-1441984904996-e0b6ba687e04?w=1600&q=90&fm=webp", "nav.cat5", "fashion", "Fashion", "ፋሽን ዞን", 4, true)
    `);
    console.log("✅ Hero slides seeded successfully!");

    // 7. Seed testimonials
    await db.execute(`
      INSERT IGNORE INTO testimonials 
        (reviewer_name_en, reviewer_name_am, text_en, text_am, rating, avatar_emoji, accent_color, display_order, is_active) 
      VALUES 
        ("Mihret Negash", "ምሕረት ነጋሽ", "My commission payouts arrive directly into my bank account every day. The most reliable income stream for Ethiopian youth.", "የኮሚሽን ገቢዬ ቀጥታ በባንክ አካውንቴ ይደርሰኛል። ለወጣቶች ፍጹም አስተማማኝ የሥራ ምንጭ ሆኗል።", 5, "👨‍💻", "#00A86B", 0, true),
        ("Fayisa Gemechu", "ፈይሳ ገመቹ", "I opened my fashion boutique on malazone and reach thousands of buyers across Sidama every day. No broker fees, pure profit.", "በmalazone ላይ የፋሽን ሱቄን ከፍቻለሁ፤ በየቀኑ ሺዎችን ወዳጆች አገኛለሁ። ደላላ የለም፣ ትርፉ ሙሉ የኔ ነው።", 5, "🛍️", "#0284c7", 1, true),
        ("Barkot Kidane", "በርኮት ኪዳኔ", "After reviewing verified legal deed records on malazone, I completed my property purchase with zero friction.", "malazone ላይ የተረጋገጡ ህጋዊ ካርታ ማህደሮችን ካየሁ በኋላ ያለምንም ፍርሃት ቤት ገዛሁ።", 5, "🌐", "#7c3aed", 2, true),
        ("Selam Tefera", "ሰላም ተፈራ", "I listed my vehicle inventory on malazone and sold within three days. The platform is simply unmatched in reach and speed.", "ተሽከርካሪ ዝርዝሬን malazone ላይ ምዝገባ አድርጌ በሶስት ቀን ሸጣለሁ!", 5, "🚗", "#d97706", 3, true),
        ("Dawit Sisay", "ዳዊት ሲሳይ", "I posted my hotel rates on malazone and tourists now contact me directly. Zero middlemen, pure profit.", "የሆቴሌን ታሪፍ malazone ላይ ለጥፌ ቱሪስቶች ቀጥታ ያወራሉ። ምንም ደላላ የለም!", 5, "🏨", "#0891b2", 4, true)
    `);
    console.log("✅ Testimonials seeded successfully!");

    // 8. Seed site config (social links, contact info)
    await db.execute(`
      INSERT IGNORE INTO site_config (config_key, config_value) VALUES
        ("social_links", '{"whatsapp":"https://wa.me/251911000000","telegram":"https://t.me/MalazoneSupport","facebook":"https://facebook.com/malazone","instagram":"https://instagram.com/malazone","youtube":"https://youtube.com/@malazone"}'),
        ("contact_info", '{"phone":"+251462200000","email":"support@malazone.com","address":"Hawassa, Sidama, Ethiopia"}')
    `);
    console.log("✅ Site config seeded successfully!");

    console.log("\n📝 Admin credentials (change these immediately in production):");
    console.log(`   - Super Admin: superadmin / ${superadminCreds.password}${superadminCreds.generated ? "  [randomly generated]" : ""}`);
    console.log(`   - Admin: admin / ${adminCreds.password}${adminCreds.generated ? "  [randomly generated]" : ""}`);
    console.log(`   - Municipality: muni_officer / ${muniCreds.password}${muniCreds.generated ? "  [randomly generated]" : ""}`);
    console.log(`   - Transport: trans_officer / ${transCreds.password}${transCreds.generated ? "  [randomly generated]" : ""}`);
    console.log("\n✅ All data seeded successfully!");

  } catch (err) {
    console.error("❌ Seeding failed:", err);
  } finally {
    process.exit(0);
  }
};

seedDatabase();
