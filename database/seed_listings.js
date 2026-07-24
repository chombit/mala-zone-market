/**
 * database/seed_listings.js
 * Run: node database/seed_listings.js
 * Comprehensive seed: listings + ratings for ALL 6 zone categories.
 * Clears old sample data first, then re-seeds fresh.
 */

"use strict";

const db = require("./db");

// ── Seller users to distribute listings across ──
const SELLERS = [
  { id: 6, name: "Solomon Birhanu", phone: "+251911223344" },
  { id: 15, name: "solomon birhanu buche", phone: "+251911223355" },
  { id: 19, name: "Ada", phone: "+251911223366" },
  { id: 22, name: "Muluken Melese", phone: "+251911223377" },
  { id: 24, name: "Ashenafi Haile", phone: "+251911223388" },
  { id: 26, name: "Biniam", phone: "+251911223399" },
  { id: 27, name: "Mulatu", phone: "+251911223400" },
];

// ── Buyer users (for ratings) ──
const BUYERS = [1, 2, 3, 5, 10, 12, 16, 18, 20, 25];

const LISTINGS = [
  // ═══════════════════════════════════════════
  // PROPERTY (5 listings)
  // ═══════════════════════════════════════════
  {
    title_en: "3 Bedroom House in Tabor",
    title_am: "3 መኝታ ክፍል ቤት በታቦር",
    category: "property",
    price: 4500000,
    price_suffix: "fixed",
    location_key: "hawassa",
    location_label_en: "Tabor",
    description_en: "Spacious 3-bedroom house in Tabor, Hawassa. Modern kitchen, large compound, fenced. Near Hawassa University.",
    description_am: "በሐዋሳ ታቦር ውስጥ ሰፊ 3 መኝታ ክፍል ቤት። ዘመናዊ ቤተ-ምግብ፣ ትልቅ ዓመፃ፣ የተጠበቀ። ከሐዋሳ ዩኒቨርሲቲ አጠገብ።",
    bedrooms: 3, bathrooms: 2, area_sqm: 180, title_deed: "yes",
    is_verified: true, is_premium: true,
    seller_idx: 0, location_label_am: "ታቦር",
    images: [
      "https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=800&q=80&fm=webp",
      "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=800&q=80&fm=webp",
      "https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?w=800&q=80&fm=webp"
    ],
  },
  {
    title_en: "Lakefront 2BR Apartment — Furnished",
    title_am: "2 መኝታ ክፍል አፓርታማ በሐይቅ ጫፍ — የተቀመጠ",
    category: "property",
    price: 18000,
    price_suffix: "per_month",
    location_key: "hawassa",
    location_label_en: "Lakefront",
    description_en: "Fully furnished 2-bedroom apartment overlooking Lake Hawassa. Includes water, electricity, parking. 24/7 security.",
    description_am: "በሐዋሳ ሐይቅ ገጽታ የሚያይ ሙሉ በሙሉ የተቀመጠ 2 መኝታ ክፍል አፓርታማ። ውሃ እስከ መብረቂያ ቅንጠት ያካትታል።",
    bedrooms: 2, bathrooms: 1, area_sqm: 95, title_deed: "yes",
    is_verified: true, is_premium: false,
    seller_idx: 1, location_label_am: "የሐይቅ ጫፍ",
    images: [
      "https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?w=800&q=80&fm=webp",
      "https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?w=800&q=80&fm=webp",
      "https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=800&q=80&fm=webp",
      "https://images.unsplash.com/photo-1493809842364-78817add7ffb?w=800&q=80&fm=webp"
    ],
  },
  {
    title_en: "New 4-Bedroom Villa in Piassa",
    title_am: "አዲስ 4 መኝታ ክፍል ቪላ በፒያሳ",
    category: "property",
    price: 7800000,
    price_suffix: "fixed",
    location_key: "hawassa",
    location_label_en: "Piassa",
    description_en: "Brand new 4-bedroom villa with servant quarter. Marble floors, CCTV, generator backup. Title deed available.",
    description_am: "አዲስ 4 መኝታ ክፍል ቪላ ከአገልግሎት ክፍል ጋር። ከመንገድ ዘንባባ፣ ሲሲቲቪ፣ ጀነሬITOR ቅንጠት።",
    bedrooms: 4, bathrooms: 3, area_sqm: 280, title_deed: "yes",
    is_verified: true, is_premium: true,
    seller_idx: 3, location_label_am: "ፒያሳ",
    images: [
      "https://images.unsplash.com/photo-1613490493576-7fde63acd811?w=800&q=80&fm=webp",
      "https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=800&q=80&fm=webp",
      "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=800&q=80&fm=webp"
    ],
  },
  {
    title_en: "Shop Space for Rent — Hawassa Center",
    title_am: "የሱপ ቦታ በኪራይ — ሀዋሳ ማዕከል",
    category: "property",
    price: 8000,
    price_suffix: "per_month",
    location_key: "hawassa",
    location_label_en: "Piassa",
    description_en: "Ground-floor commercial space in central Hawassa. High foot traffic, 30 sqm. Suitable for retail or café.",
    description_am: "በሀዋሳ ማዕከል ውስጥ የምድር ፊት የንግድ ቦታ። ብዙ ሰዎች ይፈስሳሉ፣ 30 ስኩየር ሜትር።",
    bedrooms: 0, bathrooms: 1, area_sqm: 30,
    is_verified: true, is_premium: false,
    seller_idx: 5, location_label_am: "ፒያሳ",
  },
  {
    title_en: "Vacation House near Lake Langano",
    title_am: "የማረፊያ ቤት በላንጋኖ ሐይቅ አቅራቢያ",
    category: "property",
    price: 3200000,
    price_suffix: "fixed",
    location_key: "yirgalem",
    location_label_en: "Langano",
    description_en: "2-bedroom vacation home with lake view. Ideal for weekend getaways. Fully fenced with garden.",
    description_am: "የሐይቅ ገጽታ ያለው 2 መኝታ ክፍል ማረፊያ ቤት። ለሳምንት መጨረሻ ተስማሚ።",
    bedrooms: 2, bathrooms: 1, area_sqm: 120, title_deed: "yes",
    is_verified: false, is_premium: false,
    seller_idx: 6, location_label_am: "ላንጋኖ",
    images: [
      "https://images.unsplash.com/photo-1564013799919-ab600027ffc6?w=800&q=80&fm=webp",
      "https://images.unsplash.com/photo-1600607687644-aac4c3eac7f4?w=800&q=80&fm=webp"
    ],
  },

  // ═══════════════════════════════════════════
  // MOTORS (5 listings)
  // ═══════════════════════════════════════════
  {
    title_en: "2019 Toyota Corolla — Single Owner",
    title_am: "2019 ቶዮታ ኮሮላ — አንድ ባለቤት",
    category: "motors",
    price: 1200000,
    price_suffix: "fixed",
    location_key: "hawassa",
    location_label_en: "Tabor",
    description_en: "Well-maintained 2019 Toyota Corolla. Single owner, 45,000 km. Full service history at authorized dealer.",
    description_am: "በጠበቀ ሁኔታ የተጠበቀ 2019 ቶዮታ ኮሮላ። አንድ ባለቤት፣ 45,000 ኪሎ ሜትር።",
    plate_code: "A1234", plate_region: "Sidama", fuel_type: "benzine", condition_type: "used",
    is_verified: true, is_premium: true,
    seller_idx: 0, location_label_am: "ታቦር",
    images: [
      "https://images.unsplash.com/photo-1549317661-bd32c8ce0db2?w=800&q=80&fm=webp",
      "https://images.unsplash.com/photo-1552519507-da3b142c6e3d?w=800&q=80&fm=webp",
      "https://images.unsplash.com/photo-1503376780353-7e6692767b70?w=800&q=80&fm=webp",
      "https://images.unsplash.com/photo-1580273916550-e323be2ae537?w=800&q=80&fm=webp"
    ],
  },
  {
    title_en: "2022 Honda CB500 Motorcycle",
    title_am: "2022 ሆንዳ CB500 ሞተር ሳይክል",
    category: "motors",
    price: 320000,
    price_suffix: "fixed",
    location_key: "hawassa",
    location_label_en: "Piassa",
    description_en: "Low-mileage Honda CB500F. 8,000 km, always garaged. Comes with helmet and top box.",
    description_am: "ዝቅተኛ ርቀት ያለው ሆንዳ CB500F። 8,000 ኪโล ሜትር፣ ሁልጊዜ በጋራጅ ውስጥ። ቀላግድ እና ታፕ ቦክ ያካትታል።",
    plate_code: "B5678", plate_region: "Sidama", fuel_type: "benzine", condition_type: "used",
    is_verified: true, is_premium: false,
    seller_idx: 4, location_label_am: "ፒያሳ",
    images: [
      "https://images.unsplash.com/photo-1558981806-ec527fa84c39?w=800&q=80&fm=webp",
      "https://images.unsplash.com/photo-1558981403-c5f9899a28bc?w=800&q=80&fm=webp"
    ],
  },
  {
    title_en: "2021 Hyundai Tucson — Full Options",
    title_am: "2021 ሀይንዳይ ቱሰን — ሙሉ አማራጮች",
    category: "motors",
    price: 2800000,
    price_suffix: "fixed",
    location_key: "addis_ababa",
    location_label_en: "Addis Ababa",
    description_en: "2021 Hyundai Tucson Premium. AWD, panoramic sunroof, leather seats, Apple CarPlay. Low km.",
    description_am: "2021 ሀይንዳይ ቱሰን ፕሪሚየም። AWD፣ ፓኖራሚክ ሳንরוף፣ ቤለደር መቀመጫ።",
    plate_code: "C9012", plate_region: "Addis Ababa", fuel_type: "benzine", condition_type: "used",
    is_verified: true, is_premium: true,
    seller_idx: 2, location_label_am: "አዲስ አበባ",
  },
  {
    title_en: "Electric Motorbike — E-Lion",
    title_am: "ኤሌክትሪክ ሞተር ሳይክል — E-Lion",
    category: "motors",
    price: 85000,
    price_suffix: "fixed",
    location_key: "hawassa",
    location_label_en: "Lakefront",
    description_en: "Brand new E-Lion electric motorbike. 80km range, removable battery. Zero fuel cost.",
    description_am: "አዲስ E-Lion ኤሌክትሪክ ሞተር ሳይክል። 80 ኪሎ ሜትር ርቀት፣ የሚነሳ ባትሪ።",
    fuel_type: "electric", condition_type: "new",
    is_verified: true, is_premium: false,
    seller_idx: 5, location_label_am: "የሐይቅ ጫፍ",
  },
  {
    title_en: "2020 Toyota Hilux Double Cabin",
    title_am: "2020 ቶዮታ ሂሉክስ ድብል ኪ臖ን",
    category: "motors",
    price: 3500000,
    price_suffix: "fixed",
    location_key: "aleta_wondo",
    location_label_en: "Aleta Wondo",
    description_en: "Toyota Hilux 2020, diesel, 4WD, used for light duty only. Excellent condition, one owner.",
    description_am: "ቶዮታ ሂሉክስ 2020፣ ዴዘል፣ 4WD፣ ለቀላል ሥራ ብቻ የተጠቀመ። በጣም ጥሩ ሁኔታ።",
    plate_code: "D3456", plate_region: "Sidama", fuel_type: "diesel", condition_type: "used",
    is_verified: true, is_premium: false,
    seller_idx: 3, location_label_am: "አሌታ ወንዶ",
  },

  // ═══════════════════════════════════════════
  // STAY (5 listings)
  // ═══════════════════════════════════════════
  {
    title_en: "Hawassa Lakeview Hotel — Standard Room",
    title_am: "ሐዋሳ የሐይቅ ገጽታ ሆቴል — መደበኛ ክፍል",
    category: "stay",
    price: 2500,
    price_suffix: "per_day",
    location_key: "hawassa",
    location_label_en: "Lakefront",
    description_en: "Standard hotel room with lake view. Free Wi-Fi, breakfast included. Walking distance to fish market.",
    description_am: "የሐይቅ ገጽታ ያለው መደበኛ የሆቴል ክፍል። ነፃ ዋይ-ፋይ፣ ቁርስ ያካትታል።",
    bedrooms: 1, bathrooms: 1, capacity: 2,
    is_verified: true, is_premium: true,
    seller_idx: 1, location_label_am: "የሐይቅ ጫፍ",
    images: [
      "https://images.unsplash.com/photo-1631049307264-da0ec9d70304?w=800&q=80&fm=webp",
      "https://images.unsplash.com/photo-1590490360182-c33d57733427?w=800&q=80&fm=webp",
      "https://images.unsplash.com/photo-1584132967334-10e028bd69f7?w=800&q=80&fm=webp"
    ],
  },
  {
    title_en: "Lakefront Airbnb Studio",
    title_am: "የሐይቅ ጫፍ ኤርቢኤንቢ ስቱዲዮ",
    category: "stay",
    price: 3500,
    price_suffix: "per_day",
    location_key: "hawassa",
    location_label_en: "Lakefront",
    description_en: "Cozy self-contained studio apartment. Kitchen, balcony with lake view. Perfect for couples.",
    description_am: "ቀላል ራስን የሚያስተዳድር ስቱዲዮ አፓርታማ። ቤተ-ምግብ፣ ባልኮኒ።",
    bedrooms: 1, bathrooms: 1, capacity: 2,
    is_verified: true, is_premium: false,
    seller_idx: 4, location_label_am: "የሐይቅ ጫፍ",
  },
  {
    title_en: "Haile Resort — Deluxe Room",
    title_am: "ሀይሌ ሪዞርት — ዴሉክስ ክፍል",
    category: "stay",
    price: 4500,
    price_suffix: "per_day",
    location_key: "hawassa",
    location_label_en: "Lakefront",
    description_en: "Premium lakefront resort room. Pool access, restaurant, spa. Ideal for business travelers.",
    description_am: "ፕሪሚየም የሐይቅ ጫፍ ሪዞርት ክፍል። ፖል መግቢያ፣ ምግብ ቤት፣ ስፓ።",
    bedrooms: 1, bathrooms: 1, capacity: 2,
    is_verified: true, is_premium: true,
    seller_idx: 6, location_label_am: "የሐይቅ ጫፍ",
    images: [
      "https://images.unsplash.com/photo-1551882547-ff40c63fe5fa?w=800&q=80&fm=webp",
      "https://images.unsplash.com/photo-1571896349842-33c89424de2d?w=800&q=80&fm=webp"
    ],
  },
  {
    title_en: "Budget Guest House — Tabor",
    title_am: "ምንጭ ያለው የእንግዳ ቤት — ታቦር",
    category: "stay",
    price: 1200,
    price_suffix: "per_day",
    location_key: "hawassa",
    location_label_en: "Tabor",
    description_en: "Clean, affordable guesthouse in Tabor. Private room, shared bathroom. Great for solo travelers.",
    description_am: "በታቦር ውስጥ ን끗 ያለ ምንጭ ያለው የእንግዳ ቤት። የግል ክፍል።",
    bedrooms: 1, bathrooms: 0, capacity: 1,
    is_verified: false, is_premium: false,
    seller_idx: 2, location_label_am: "ታቦር",
  },
  {
    title_en: "Lake Langano Resort — Family Suite",
    title_am: "የሐይቅ ሪዞርት — ስንቅ ክፍል",
    category: "stay",
    price: 6000,
    price_suffix: "per_day",
    location_key: "yirgalem",
    location_label_en: "Lake Langano",
    description_en: "Spacious family suite at Lake Langano resort. 2 bedrooms, kitchenette, private garden. Kids stay free.",
    description_am: "በላንጋኖ ሪዞርት ውስጥ ሰፊ ስንቅ ክፍል። 2 መኝታ ክፍል፣ ቡና ቤት።",
    bedrooms: 2, bathrooms: 2, capacity: 5,
    is_verified: true, is_premium: true,
    seller_idx: 0, location_label_am: "ላንጋኖ",
    images: [
      "https://images.unsplash.com/photo-1566073771259-6a8506099945?w=800&q=80&fm=webp",
      "https://images.unsplash.com/photo-1571003123894-1f0594d2b5d9?w=800&q=80&fm=webp"
    ],
  },

  // ═══════════════════════════════════════════
  // CEREMONY (4 listings)
  // ═══════════════════════════════════════════
  {
    title_en: "Wedding Catering — Full Service",
    title_am: "የሰርግ ማቅያ — ሙሉ አገልግሎት",
    category: "ceremony",
    price: 2500,
    price_suffix: "per_day",
    location_key: "hawassa",
    location_label_en: "Tabor",
    description_en: "Professional wedding catering for up to 500 guests. Includes traditional Ethiopian cuisine, setup, and cleanup.",
    description_am: "ለ500 እንግዶች ሰርግ ማቅያ አገልግሎት። ባህላዊ የኢትዮጵያ ምግብ፣ ማሰሪያ እና ማጽዳት።",
    capacity: 500,
    is_verified: true, is_premium: true,
    seller_idx: 3, location_label_am: "ታቦር",
  },
  {
    title_en: "DJ & Sound System — Events",
    title_am: "ዲเจ እና ድምጽ ስስተም — ዝግጅቶች",
    category: "ceremony",
    price: 8000,
    price_suffix: "fixed",
    location_key: "hawassa",
    location_label_en: "Piassa",
    description_en: "Professional DJ with full sound system for weddings, birthdays, and events. Modern equipment, experienced team.",
    description_am: "ለሰርግ፣ ልደት እና ዝግጅቶች ፕሮፌሽናል ዲเจ ከሙሉ ድምጽ ስስተም ጋር።",
    capacity: 1000,
    is_verified: true, is_premium: false,
    seller_idx: 5, location_label_am: "ፒያሳ",
    images: [
      "https://images.unsplash.com/photo-1470225620780-dba8ba36b745?w=800&q=80&fm=webp",
      "https://images.unsplash.com/photo-1571330735066-03aaa9429d89?w=800&q=80&fm=webp"
    ],
  },
  {
    title_en: "Habesha Ceremony Hall — 300 Capacity",
    title_am: "ሀበሻ ስርዓት አዳራሽ — 300 ተረን틴",
    category: "ceremony",
    price: 15000,
    price_suffix: "fixed",
    location_key: "hawassa",
    location_label_en: "Tabor",
    description_en: "Modern ceremony hall with full amenities. Chairs, tables, stage, lighting included. Central location.",
    description_am: "ዘመናዊ ስርዓት አዳራሽ ከሙሉ ማመቻቸት ጋር። ወንበሮች፣ ጠረጴዛዎች፣ መድረክ።",
    capacity: 300,
    is_verified: true, is_premium: true,
    seller_idx: 1, location_label_am: "ታቦር",
  },
  {
    title_en: "Floral Decoration & Event Styling",
    title_am: "የአበቦች ማጌזן እና ዝግጅት ዘይቤ",
    category: "ceremony",
    price: 12000,
    price_suffix: "fixed",
    location_key: "hawassa",
    location_label_en: "Lakefront",
    description_en: "Complete event decoration service. Flowers, backdrops, table settings. Portfolio available on request.",
    description_am: "ሙሉ ዝግጅት ማጌזן አገልግሎት። አበቦች፣ ታሪኮች፣ ጠረጴዛ ማስቀመጥ።",
    capacity: 0,
    is_verified: true, is_premium: false,
    seller_idx: 6, location_label_am: "የሐይቅ ጫፍ",
  },

  // ═══════════════════════════════════════════
  // HEAVY MACHINERY (4 listings)
  // ═══════════════════════════════════════════
  {
    title_en: "Cat 320 Excavator — For Hire",
    title_am: "ካት 320 አቃቂ — በኪራይ",
    category: "heavy",
    price: 35000,
    price_suffix: "per_day",
    location_key: "hawassa",
    location_label_en: "Tabor",
    description_en: "Cat 320D excavator for construction and earthwork. Operator available. Fuel included in price.",
    description_am: "ለግንባታ እና የምድር ሥራ ካት 320D አቃቂ። አሠሪ ያካትታል። የነዳ ቅንጣት የተካትተ ነው።",
    machinery_brand: "Caterpillar", with_operator: true, capacity: 20,
    is_verified: true, is_premium: true,
    seller_idx: 0, location_label_am: "ታቦር",
  },
  {
    title_en: "Hitachi ZX200 Excavator",
    title_am: "ሀይታቺ ZX200 አቃቂ",
    category: "heavy",
    price: 30000,
    price_suffix: "per_day",
    location_key: "yirgalem",
    location_label_en: "Yirgalem",
    description_en: "Well-maintained Hitachi ZX200 excavator. 20-ton class, ideal for road construction and foundation work.",
    description_am: "በጠበቀ ሁኔታ የተጠበቀ ሀይታቺ ZX200 አቃቂ። 20 ቶን።",
    machinery_brand: "Hitachi", with_operator: false, capacity: 20,
    is_verified: true, is_premium: false,
    seller_idx: 4, location_label_am: "ይርጋለም",
  },
  {
    title_en: "SDLG L956F Wheel Loader",
    title_am: "SDLG L956F ዞላ ማጓጓző",
    category: "heavy",
    price: 28000,
    price_suffix: "per_day",
    location_key: "bensa",
    location_label_en: "Bensa",
    description_en: "SDLG L956F wheel loader. 5-ton bucket, suitable for quarrying, stockpiling, and material handling.",
    description_am: "SDLG L956F ዞላ ማጓጓző። 5 ቶን በርኬት። ለመሬት ማውደም ተስማሚ።",
    machinery_brand: "SDLG", with_operator: true, capacity: 5,
    is_verified: true, is_premium: false,
    seller_idx: 2, location_label_am: "ቤንሳ",
  },
  {
    title_en: "XCMG Crane — 25 Ton",
    title_am: "XCMG ክሬን — 25 ቶን",
    category: "heavy",
    price: 45000,
    price_suffix: "per_day",
    location_key: "chuko",
    location_label_en: "Chuko",
    description_en: "XCMG 25-ton mobile crane for construction projects. Certified operator, insurance included.",
    description_am: "ለግንባታ ፕሮጀክቶች XCMG 25 ቶን ሞባይል ክሬን። ሰertified operator፣ ቢমስ ያካትታል።",
    machinery_brand: "XCMG", with_operator: true, capacity: 25,
    is_verified: true, is_premium: true,
    seller_idx: 3, location_label_am: "ጩቆ",
  },

  // ═══════════════════════════════════════════
  // ELECTRONICS (5 listings)
  // ═══════════════════════════════════════════
  {
    title_en: "Samsung Galaxy S24 Ultra — 256GB",
    title_am: "ሳምሰንግ ጋላክሲ S24 እልትራ — 256GB",
    category: "electronics",
    price: 85000,
    price_suffix: "fixed",
    location_key: "hawassa",
    location_label_en: "Piassa",
    description_en: "Brand new Samsung Galaxy S24 Ultra. Titanium Black, 256GB. Official warranty, sealed box.",
    description_am: "አዲስ ሳምሰንግ ጋላክሲ S24 እልትራ። ታይታኒየም ቁጥቁጥ፣ 256GB። ዋranty ያካትታል።",
    condition_type: "new",
    images: [
      "https://images.unsplash.com/photo-1610945415295-d9bbf067e59c?w=800&q=80&fm=webp",
      "https://images.unsplash.com/photo-1592899677977-9c10ca588bbd?w=800&q=80&fm=webp",
      "https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=800&q=80&fm=webp"
    ],
    is_verified: true, is_premium: true,
    seller_idx: 4, location_label_am: "ፒያሳ",
  },
  {
    title_en: "LG 55\" OLED Smart TV",
    title_am: "LG 55\" OLED ሳማርት ቲቪ",
    category: "electronics",
    price: 65000,
    price_suffix: "fixed",
    location_key: "hawassa",
    location_label_en: "Tabor",
    description_en: "LG 55-inch OLED 4K Smart TV. Dolby Vision, webOS. Wall mount included. 1-year warranty.",
    description_am: "LG 55 ኢንች OLED 4K ሳማርት ቲቪ። ዶልቢ ቪዥን፣ webOS። ገንባታ ቅንጠት ያካትታል።",
    condition_type: "new",
    is_verified: true, is_premium: false,
    seller_idx: 0, location_label_am: "ታቦር",
  },
  {
    title_en: "MacBook Air M3 — 15\"",
    title_am: "MacBook Air M3 — 15\"",
    category: "electronics",
    price: 120000,
    price_suffix: "fixed",
    location_key: "addis_ababa",
    location_label_en: "Addis Ababa",
    description_en: "Apple MacBook Air 15-inch M3 chip, 16GB RAM, 512GB SSD. AppleCare+ eligible.",
    description_am: "Apple MacBook Air 15 ኢንች M3 chip፣ 16GB RAM፣ 512GB SSD።",
    condition_type: "new",
    is_verified: true, is_premium: true,
    seller_idx: 6, location_label_am: "አዲስ አበባ",
  },
  {
    title_en: "PS5 Console + 2 Controllers",
    title_am: "PS5 ኮንሶል + 2 ኮንትሮለሮች",
    category: "electronics",
    price: 45000,
    price_suffix: "fixed",
    location_key: "hawassa",
    location_label_en: "Lakefront",
    description_en: "PlayStation 5 disc edition with 2 DualSense controllers. Includes 3 games.",
    description_am: "PlayStation 5 ዲስክ ቅርጫ ከ2 DualSense ኮንትሮለሮች ጋር። 3 ጨዋታዎች ያካትታል።",
    condition_type: "used",
    is_verified: true, is_premium: false,
    seller_idx: 2, location_label_am: "የሐይቅ ጫፍ",
  },
  {
    title_en: "iPhone 15 Pro Max — 256GB",
    title_am: "iPhone 15 Pro Max — 256GB",
    category: "electronics",
    price: 95000,
    price_suffix: "fixed",
    location_key: "hawassa",
    location_label_en: "Tabor",
    description_en: "iPhone 15 Pro Max, Natural Titanium, 256GB. 95% battery health, with original box and charger.",
    description_am: "iPhone 15 Pro Max፣ ተፈጥሮ ታይታኒየም፣ 256GB። 95% የባትሪ ጤና።",
    condition_type: "used",
    is_verified: true, is_premium: false,
    seller_idx: 1, location_label_am: "ታቦር",
  },
];

// ── Reviews pool ──
const REVIEWS = [
  { rating: 5, text: "Excellent seller! Very professional and honest. Highly recommend." },
  { rating: 5, text: "Great experience. Item was exactly as described. Fast response." },
  { rating: 5, text: "Perfect transaction. No issues at all. Will buy again!" },
  { rating: 4, text: "Good communication and fast delivery. Fair price." },
  { rating: 4, text: "Reliable seller. Product quality matched the description." },
  { rating: 4, text: "Quick response and good product. Satisfied with purchase." },
  { rating: 3, text: "Decent experience overall. Delivery was a bit slow." },
  { rating: 3, text: "Product was okay, not exactly as pictured but acceptable." },
];

async function seed() {
  console.log("🔄 Clearing old sample listings and ratings...");
  await db.execute("DELETE FROM ratings");
  await db.execute("DELETE FROM messages");
  await db.execute("DELETE FROM listings");
  console.log("✅ Old data cleared.");

  let listingCount = 0;

  for (const item of LISTINGS) {
    const seller = SELLERS[item.seller_idx];
    const images = JSON.stringify(item.images || []);
    try {
      const [result] = await db.execute(
        `INSERT INTO listings (
          user_id, title_en, title_am, description_en, description_am,
          category, sub_category, location_key, location_label_en, location_label_am,
          price, price_suffix, phone, whatsapp, images,
          is_active, is_verified, is_premium,
          plate_code, plate_region, fuel_type, condition_type,
          machinery_brand, with_operator, capacity,
          bedrooms, bathrooms, area_sqm, title_deed, view_count
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          seller.id,
          item.title_en, item.title_am,
          item.description_en || null, item.description_am || null,
          item.category,
          null,
          item.location_key,
          item.location_label_en || null, item.location_label_am || null,
          item.price, item.price_suffix || "fixed",
          seller.phone, seller.phone,
          images,
          1,
          item.is_verified ? 1 : 0,
          item.is_premium ? 1 : 0,
          item.plate_code || null,
          item.plate_region || null,
          item.fuel_type || null,
          item.condition_type || null,
          item.machinery_brand || null,
          item.with_operator ? 1 : 0,
          item.capacity || 0,
          item.bedrooms || 0,
          item.bathrooms || 0,
          item.area_sqm || 0,
          item.title_deed || null,
          Math.floor(Math.random() * 200) + 10,
        ]
      );
      const listingId = result.insertId;
      listingCount++;

      // Seed 2-3 ratings per listing
      const availableBuyers = BUYERS.filter((bid) => bid !== seller.id);
      const numRaters = 2 + Math.floor(Math.random() * 2); // 2-3
      const shuffled = availableBuyers.sort(() => Math.random() - 0.5).slice(0, numRaters);

      for (const buyerId of shuffled) {
        const review = REVIEWS[Math.floor(Math.random() * REVIEWS.length)];
        try {
          await db.execute(
            `INSERT IGNORE INTO ratings (listing_id, rater_id, seller_id, rating, review)
             VALUES (?, ?, ?, ?, ?)`,
            [listingId, buyerId, seller.id, review.rating, review.text]
          );
        } catch (e) {
          if (e.code !== "ER_DUP_ENTRY") throw e;
        }
      }
    } catch (err) {
      if (err.code !== "ER_DUP_ENTRY") throw err;
    }
  }

  console.log(`\n✅ Seeded ${listingCount} listings across all 6 categories.`);

  // Print summary
  const [cats] = await db.execute(`
    SELECT category, COUNT(*) AS cnt
    FROM listings
    GROUP BY category
    ORDER BY FIELD(category, 'property','motors','stay','ceremony','heavy','electronics')
  `);
  console.log("\n📊 Listings per category:");
  cats.forEach((c) => console.log(`   ${c.category}: ${c.cnt}`));

  const [ratCnt] = await db.execute("SELECT COUNT(*) AS cnt FROM ratings");
  console.log(`\n⭐ Total ratings: ${ratCnt[0].cnt}`);

  process.exit(0);
}

seed().catch((err) => {
  console.error("❌ Seeding failed:", err);
  process.exit(1);
});
