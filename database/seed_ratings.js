/**
 * database/seed_ratings.js
 * Run: node database/seed_ratings.js
 * Seeds sample listings + ratings if none exist.
 */

"use strict";

const db = require("./db");

const sampleListings = [
  { title_en: "3 Bedroom House in Tabor", title_am: "3 መኝታ ክፍል ቤት በታቦር", category: "property", price_etb: 4500000, location_key: "hawassa", description_en: "Spacious house with modern finishes near Hawassa Lake.", description_am: "በሐዋሳ ሐይቅ አቅራቢያ ዘመናዊ ቤት।", whatsapp: "+251911000001" },
  { title_en: "2019 Toyota Corolla", title_am: "2019 ቶዮታ ኮሮላ", category: "motors", price_etb: 1200000, location_key: "hawassa", description_en: "Well maintained, single owner, low mileage.", description_am: "በጠበቀ ሁኔታ የተጠበቀ፣ አንድ ባለቤት፣ ዝቅተኛ ርቀት።", whatsapp: "+251911000002" },
  { title_en: "LG 55 inch Smart TV", title_am: "LG 55 ኢንች ሳማርት ቲቪ", category: "electronics", price_etb: 65000, location_key: "hawassa", description_en: "Brand new, warranty included, 4K UHD display.", description_am: "አዲስ፣ ዋranty ያካትታል፣ 4K UHD ማሳያ።", whatsapp: "+251911000003" },
  { title_en: "Catering Service for Weddings", title_am: "ለሰርግ ማቅያ አገልግሎት", category: "ceremony", price_etb: 25000, location_key: "hawassa", description_en: "Professional catering with full Ethiopian cuisine.", description_am: "ሙሉ የኢትዮጵያ ምግብ በሙያ የተዘጋጀ ማቅያ።", whatsapp: "+251911000004" },
  { title_en: "Cat 320 Excavator for Rent", title_am: "ካት 320 አቃቂ በኪራይ", category: "heavy", price_etb: 35000, location_key: "yirgalem", description_en: "Daily rental, operator included, all site-ready.", description_am: "በቀን ቅንጣት፣ አሠሪ ያካትታል።", whatsapp: "+251911000005" },
  { title_en: "Lakefront 2BR Apartment", title_am: "2 መኝታ ክፍል አፓርታማ በሐይቅ ጫፍ", category: "property", price_etb: 18000, location_key: "hawassa", description_en: "Monthly rental, furnished, lake view.", description_am: "ወርሃዊ ቅንጣት፣ የተቀመጠ፣ የሐይቅ ገጽታ።", whatsapp: "+251911000006" },
  { title_en: "Samsung Galaxy S24 Ultra", title_am: "ሳምሰንግ ጋላክሲ S24 እልትራ", category: "electronics", price_etb: 85000, location_key: "hawassa", description_en: "256GB, titanium black, with accessories.", description_am: "256GB፣ ታይታኒየም ቁጥቁጥ፣ ከተቀሚች ጋር።", whatsapp: "+251911000007" },
  { title_en: "Honda CB500 Motorcycle", title_am: "ሆንዳ CB500 ሞተር ሳይክል", category: "motors", price_etb: 320000, location_key: "hawassa", description_en: "2022 model, excellent condition, low kilometers.", description_am: "2022 ሞዴል፣ በጣም ጥሩ ሁኔታ።", whatsapp: "+251911000008" },
];

async function seed() {
  console.log("⏳ Seeding listings + ratings...");

  const [users] = await db.execute("SELECT id FROM users LIMIT 10");
  if (users.length < 2) {
    console.log("⚠️  Not enough users. Run main seed first.");
    process.exit(0);
  }

  // Seed sample listings if none exist
  const [existing] = await db.execute("SELECT COUNT(*) AS cnt FROM listings");
  if (existing[0].cnt === 0) {
    console.log("📦 No listings found — seeding sample listings...");
    let listingCount = 0;
    for (let i = 0; i < sampleListings.length; i++) {
      const l = sampleListings[i];
      const userId = users[i % users.length].id;
      try {
        await db.execute(
          `INSERT INTO listings (user_id, title_en, title_am, category, condition_type, price, description_en, description_am, location_key, is_active, whatsapp)
           VALUES (?, ?, ?, ?, 'new', ?, ?, ?, ?, 1, ?)`,
          [userId, l.title_en, l.title_am, l.category, l.price_etb, l.description_en, l.description_am, l.location_key, l.whatsapp]
        );
        listingCount++;
      } catch (err) {
        if (err.code !== "ER_DUP_ENTRY") throw err;
      }
    }
    console.log(`✅ Seeded ${listingCount} sample listings!`);
  }

  // Now seed ratings
  const [listings] = await db.execute("SELECT id, user_id FROM listings LIMIT 10");
  if (listings.length === 0) {
    console.log("⚠️  No listings to rate.");
    process.exit(0);
  }

  const reviews = [
    { rating: 5, text: "Excellent seller! Very professional and honest." },
    { rating: 5, text: "Great experience. Item was exactly as described." },
    { rating: 4, text: "Good communication and fast delivery." },
    { rating: 4, text: "Fair price, reliable seller." },
    { rating: 3, text: "Average experience, but overall okay." },
    { rating: 5, text: "Highly recommended! Will buy again." },
    { rating: 4, text: "Quick response and good product." },
    { rating: 5, text: "Perfect transaction. No issues at all." },
  ];

  let inserted = 0;
  for (const listing of listings) {
    const raters = users.filter((u) => u.id !== listing.user_id);
    if (raters.length === 0) continue;

    // Give each listing 2-3 ratings for a realistic average
    const numRaters = Math.min(raters.length, 2 + Math.floor(Math.random() * 2));
    const shuffled = raters.sort(() => Math.random() - 0.5).slice(0, numRaters);

    for (const rater of shuffled) {
      const review = reviews[Math.floor(Math.random() * reviews.length)];
      try {
        await db.execute(
          `INSERT IGNORE INTO ratings (listing_id, rater_id, seller_id, rating, review)
           VALUES (?, ?, ?, ?, ?)`,
          [listing.id, rater.id, listing.user_id, review.rating, review.text]
        );
        inserted++;
      } catch (err) {
        if (err.code !== "ER_DUP_ENTRY") throw err;
      }
    }
  }

  console.log(`✅ Seeded ${inserted} ratings successfully!`);
  process.exit(0);
}

seed().catch((err) => {
  console.error("❌ Seeding failed:", err);
  process.exit(1);
});
