/**
 * database/seed.js
 * Malazone.com — Production Seed Script
 * Populates the database with initial world-class listings.
 * © 2026 Malazone Technologies PLC
 */

"use strict";

const db = require("./db");

const SEED_DATA = {
  users: [
    { full_name: "Malazone Official", phone_number: "0900000000", account_type: "Business" },
    { full_name: "Dawit Motors", phone_number: "0911223344", account_type: "Individual" },
    { full_name: "Lakefront Realty", phone_number: "0922334455", account_type: "Agent" }
  ],
  listings: [
    {
      user_phone: "0911223344",
      title_am: "ቶዮታ ቪትዝ 2018 - ምርጥ ሁኔታ",
      title_en: "Toyota Vitz 2018 - Excellent Condition",
      category: "motors",
      location_key: "hawassa_piassa",
      location_label_am: "ፒያሳ፣ ሐዋሳ",
      location_label_en: "Piassa, Hawassa",
      price: 1250000,
      price_suffix: "fixed",
      phone: "0911223344",
      whatsapp: "251911223344",
      images: JSON.stringify(["https://images.unsplash.com/photo-1541899481282-d53bffe3c35d?w=800&q=80&fm=webp"]),
      is_premium: 1,
      is_verified: 1,
      plate_code: "Code 2",
      fuel_type: "benzine"
    },
    {
      user_phone: "0922334455",
      title_am: "ዘመናዊ ቪላ በሐዋሳ ሐይቅ ዳርቻ",
      title_en: "Modern Villa at Hawassa Lakefront",
      category: "property",
      location_key: "hawassa_lakefront",
      location_label_am: "ሐይቅ ዳርቻ፣ ሐዋሳ",
      location_label_en: "Lakefront, Hawassa",
      price: 15000000,
      price_suffix: "fixed",
      phone: "0922334455",
      whatsapp: "251922334455",
      images: JSON.stringify(["https://images.unsplash.com/photo-1613490493576-7fde63acd811?w=800&q=80&fm=webp"]),
      is_premium: 1,
      is_verified: 1,
      bedrooms: 4,
      area_sqm: 350
    },
    {
      user_phone: "0900000000",
      title_am: "ኤክስካቫተር ለኪራይ - በሰዓት",
      title_en: "Excavator for Rent - Hourly",
      category: "heavy",
      location_key: "hawassa_industrial",
      location_label_am: "ኢንዱስትሪ ፓርክ፣ ሐዋሳ",
      location_label_en: "Industrial Park, Hawassa",
      price: 2500,
      price_suffix: "per_hour",
      phone: "0900000000",
      whatsapp: "251900000000",
      images: JSON.stringify(["https://images.unsplash.com/photo-1579412691522-861f6540960d?w=800&q=80&fm=webp"]),
      is_premium: 0,
      is_verified: 1,
      machinery_brand: "Caterpillar"
    }
  ]
};

async function seed() {
  try {
    console.log("[SEED] Starting database population...");

    // 1. Clear existing data (optional, be careful in production)
    // await db.execute("SET FOREIGN_KEY_CHECKS = 0");
    // await db.execute("TRUNCATE listings");
    // await db.execute("TRUNCATE users");
    // await db.execute("SET FOREIGN_KEY_CHECKS = 1");

    // 2. Insert Users
    const userMap = {};
    for (const u of SEED_DATA.users) {
      const [res] = await db.execute(
        "INSERT IGNORE INTO users (full_name, phone_number, account_type) VALUES (?, ?, ?)",
        [u.full_name, u.phone_number, u.account_type]
      );
      
      // If IGNORE was triggered, get the ID manually
      if (res.insertId === 0) {
        const [[existing]] = await db.execute("SELECT id FROM users WHERE phone_number = ?", [u.phone_number]);
        userMap[u.phone_number] = existing.id;
      } else {
        userMap[u.phone_number] = res.insertId;
      }
    }
    console.log(`[SEED] ✓ ${Object.keys(userMap).length} users seeded/verified.`);

    // 3. Insert Listings
    let listingCount = 0;
    for (const l of SEED_DATA.listings) {
      const userId = userMap[l.user_phone];
      await db.execute(
        `INSERT INTO listings (
          user_id, title_am, title_en, category, location_key, 
          location_label_am, location_label_en, price, price_suffix, 
          phone, whatsapp, images, is_premium, is_verified, 
          plate_code, fuel_type, bedrooms, area_sqm, machinery_brand
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          userId, l.title_am, l.title_en, l.category, l.location_key,
          l.location_label_am, l.location_label_en, l.price, l.price_suffix,
          l.phone, l.whatsapp, l.images, l.is_premium, l.is_verified,
          l.plate_code || null, l.fuel_type || null, l.bedrooms || null, 
          l.area_sqm || null, l.machinery_brand || null
        ]
      );
      listingCount++;
    }
    console.log(`[SEED] ✓ ${listingCount} listings seeded.`);

    console.log("[SEED] Database population complete.");
    process.exit(0);
  } catch (err) {
    console.error("[SEED] ✗ Error seeding database:", err.message);
    process.exit(1);
  }
}

seed();
