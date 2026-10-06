/**
 * Sprint 8h migration — backfill Amharic labels on category_attributes.
 *
 * Sprint 8b–8d created attribute defs with label_am NULL, leaving the
 * Amharic UI showing English labels. Idempotent: only fills NULLs.
 */
const db = require("../db");

const AM = {
  area_sqm: "ቦታ (ስኩዌር ሜትር)",
  bathrooms: "መታጠቢያ ክፍሎች",
  battery_health: "የባትሪ ጤንነት",
  battery_mah: "ባትሪ (mAh)",
  bedrooms: "መኝታ ክፍሎች",
  business_space_type: "የንግድ ቦታ ዓይነት",
  compound: "ግቢ",
  condition: "ሁኔታ",
  connectivity: "ግንኙነት",
  cpu_brand: "የሲፒዩ ብራንድ",
  deed_type: "የባለቤትነት ወረቀት",
  drive_type: "የእንቅስቃሴ ዓይነት",
  dual_sim: "ድርብ ሲም",
  elevator: "ኤሌቫተር",
  engine_cc: "የሞተር አቅም (cc)",
  floor_level: "የፎቅ ደረጃ",
  form_factor: "የቅርጽ ዓይነት",
  furnishing: "የቤት እቃ ሁኔታ",
  graphics_card: "ግራፊክስ ካርድ",
  land_type: "የመሬት ዓይነት",
  mileage_km: "የጉዞ ርቀት (ኪ.ሜ)",
  model_year: "የሞዴል ዓመት",
  network_5g: "5G አውታረ መረብ",
  operating_hours: "የስራ ሰዓቶች",
  parking: "ፓርኪንግ",
  platform: "መድረክ",
  processor: "ፕሮሴሰር",
  ram: "ራም (RAM)",
  ram_gb: "ራም (GB)",
  resolution: "ሬዞሉሽን",
  road_access: "የመንገድ መተላለፊያ",
  screen_size: "የስክሪን መጠን",
  screen_size_in: "የስክሪን መጠን (ኢንች)",
  size_class: "የመጠን ምድብ",
  smart_tv: "ስማርት ቲቪ",
  storage_capacity: "የማከማቻ አቅም",
  storage_gb: "ማከማቻ (GB)",
  storage_type: "የማከማቻ ዓይነት",
  transmission: "ትራንስሚሽን",
  warranty_months: "ዋስትና (ወራት)",
  year: "ዓመት",
};

async function main() {
  await db.initializePool();

  let updated = 0;
  for (const [attrKey, am] of Object.entries(AM)) {
    const [r] = await db.execute(
      "UPDATE category_attributes SET label_am = ? WHERE attr_key = ? AND label_am IS NULL",
      [am, attrKey]
    );
    updated += r.affectedRows;
  }
  console.log(`✅ ${updated} attribute defs given Amharic labels`);

  const [[missing]] = await db.execute(
    "SELECT COUNT(*) AS n FROM category_attributes WHERE label_am IS NULL"
  );
  console.log(`remaining without Amharic: ${missing.n}`);
  process.exit(0);
}

main().catch((err) => {
  console.error("❌ Migration failed:", err);
  process.exit(1);
});
