const db = require('./database/db');

const FALLBACK_LISTINGS = [
  {
    title_en: "Toyota Vitz 2018 - Excellent Condition",
    title_am: "ቶዮታ ቪትዝ 2018 - ምርጥ ሁኔታ",
    price: 1250000,
    price_suffix: "fixed",
    is_negotiable: 1,
    images: JSON.stringify(["https://images.unsplash.com/photo-1549317661-bd32c8ce0db2?auto=format&fit=crop&q=80&w=800"]),
    category: "motors",
    location_key: "loc.hawassa",
    location_label_en: "PIASSA",
    location_label_am: "ፒያሳ",
    rating: 4.9,
    is_verified: 1,
    is_premium: 0,
    plate_code: "CODE 2",
    fuel_type: "benzine",
    condition_type: "used",
    phone: "+251911000001",
    whatsapp: "251911000001",
    description_en: "Direct peer-to-peer connection bypasses middleman friction completely. Toyota Vitz 2018 in excellent condition.",
    description_am: "ያለ ምንም የደላላ ጣልቃ-ገብነት በቀጥታ ከባለቤቱ የቀረበ ይፋዊ የንግድ ማህደር። ቶዮታ ቪትዝ 2018 ምርጥ ሁኔታ ላይ ያለ።"
  },
  {
    title_en: "Modern Lakefront Villa with Lake View",
    title_am: "ዘመናዊ ቪላ በሐዋሳ ሐይቅ ዳርቻ",
    price: 15000000,
    price_suffix: "fixed",
    is_negotiable: 1,
    images: JSON.stringify(["https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?auto=format&fit=crop&q=80&w=800"]),
    category: "property",
    location_key: "loc.hawassa",
    location_label_en: "LAKEFRONT",
    location_label_am: "ሐይቅ ዳር",
    rating: 5.0,
    is_verified: 1,
    is_premium: 1,
    title_deed: "Verified Carta",
    area_sqm: 450,
    bedrooms: 4,
    bathrooms: 3,
    phone: "+251911000002",
    whatsapp: "251911000002",
    description_en: "Luxury villa with an amazing view of Lake Hawassa.",
    description_am: "በጣም ዘመናዊ እና የሐዋሳ ሐይቅን ቁልጭ አድርጎ የሚያሳይ እጅግ ማራኪ ቪላ።"
  },
  {
    title_en: "Luxury Wedding Hall (1000 Pax)",
    title_am: "ዘመናዊ የሰርግ አዳራሽ (1000 ሰው)",
    price: 45000,
    price_suffix: "per_day",
    is_negotiable: 0,
    images: JSON.stringify(["https://images.unsplash.com/photo-1519167758481-83f550bb49b3?auto=format&fit=crop&q=80&w=800"]),
    category: "ceremony",
    location_key: "loc.yirgalem",
    location_label_en: "TABOR",
    location_label_am: "ታቦር",
    rating: 4.7,
    is_verified: 1,
    is_premium: 1,
    capacity: 1000,
    phone: "+251911000006",
    whatsapp: "251911000006",
    description_en: "Large luxury wedding hall perfectly located for major ceremonies.",
    description_am: "ሰፊ እና በጣም ዘመናዊ የሰርግ አዳራሽ ለትላልቅ ዝግጅቶች ተስማሚ።"
  },
  {
    title_en: "Hyundai Elantra 2023 EV - Zero Mileage",
    title_am: "ሂዩንዳይ ኤላንትራ 2023 ኤሌክትሪክ - አዲስ ዜሮ",
    price: 4900000,
    price_suffix: "fixed",
    is_negotiable: 0,
    images: JSON.stringify(["https://images.unsplash.com/photo-1580273916550-e323be2ae537?auto=format&fit=crop&q=80&w=800"]),
    category: "motors",
    location_key: "loc.hawassa",
    location_label_en: "PIASSA",
    location_label_am: "ፒያሳ",
    rating: 5.0,
    is_verified: 1,
    is_premium: 1,
    plate_code: "NEW",
    fuel_type: "electric",
    condition_type: "new",
    is_zero_km: 1,
    phone: "+251911000007",
    whatsapp: "251911000007",
    description_en: "Brand new Zero Mileage EV. Hyundai Elantra 2023.",
    description_am: "አዲስ ዜሮ ማይሌጅ ኤሌክትሪክ መኪና። ሂዩንዳይ ኤላንትራ 2023 ሞዴል።"
  }
];

async function seed() {
  try {
    console.log("Seeding Mock Listings...");

    // 1. Create a dummy user for these listings
    let userId;
    const phone = "+251000000000";
    const [[user]] = await db.execute("SELECT id FROM users WHERE phone_number = ?", [phone]);
    if (user) {
      userId = user.id;
    } else {
      const [ins] = await db.execute(
        "INSERT INTO users (full_name, phone_number, account_type, is_verified) VALUES (?, ?, ?, ?)",
        ["Malazone Admin", phone, "Individual", 1]
      );
      userId = ins.insertId;
      console.log("Created admin user ID:", userId);
    }

    // 2. Insert listings
    for (const item of FALLBACK_LISTINGS) {
      const {
        title_en, title_am, price, price_suffix, is_negotiable, images, category, location_key, location_label_en, location_label_am, rating, is_verified, is_premium,
        plate_code, fuel_type, condition_type, is_zero_km, title_deed, area_sqm, bedrooms, bathrooms, capacity, phone, whatsapp, description_en, description_am
      } = item;

      // Check if title exists to avoid duplicate
      const [[existing]] = await db.execute("SELECT id FROM listings WHERE title_en = ?", [title_en]);
      if (existing) {
        console.log(`Listing '${title_en}' already exists. Skipping.`);
        continue;
      }

      await db.execute(
        `INSERT INTO listings (
          user_id, title_en, title_am, price, price_suffix, is_negotiable, images, category, 
          location_key, location_label_en, location_label_am, rating, is_verified, is_premium, is_active,
          plate_code, fuel_type, condition_type, is_zero_km, title_deed, area_sqm, bedrooms, bathrooms, capacity,
          phone, whatsapp, description_en, description_am, view_count
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 1, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 120)`,
        [
          userId, title_en, title_am, price, price_suffix, is_negotiable, images, category, 
          location_key, location_label_en, location_label_am, rating, is_verified, is_premium,
          plate_code || null, fuel_type || null, condition_type || null, is_zero_km || 0, title_deed || null, area_sqm || null, bedrooms || null, bathrooms || null, capacity || null,
          phone, whatsapp, description_en, description_am
        ]
      );
      console.log(`Inserted '${title_en}'`);
    }

    console.log("Seeding completed successfully.");
    process.exit(0);
  } catch (err) {
    console.error("Seeding failed:", err);
    process.exit(1);
  }
}

seed();
