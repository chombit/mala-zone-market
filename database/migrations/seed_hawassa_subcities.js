/**
 * Sprint 8i migration — official Hawassa sub-cities.
 *
 * Replaces Hawassa's informal neighborhood zones (tabor/lakefront/piassa)
 * with the eight official sub-cities, and remaps existing listing
 * location_keys onto the new scheme (`<city>_<subcity>`):
 *   hawassa_piassa -> hawassa_addis_ketema  (Piassa sits in Addis Ketema)
 *   tabor          -> hawassa_tabor
 *
 * Everything downstream (sidebar select, posting modals, agent dashboard,
 * admin LocationsManager) reads this list from locations.sub_zones, so the
 * data change propagates everywhere without component edits.
 */
const db = require("../db");

const OFFICIAL_SUBCITIES = [
  { key: "tabor", label_en: "Tabor Sub City", label_am: "ታቦር ክፍለ ከተማ" },
  { key: "addis_ketema", label_en: "Addis Ketema Sub City", label_am: "አዲስ ከተማ ክፍለ ከተማ" },
  { key: "hayek_dar", label_en: "Hayek Dar Sub City", label_am: "ሐይክ ዳር ክፍለ ከተማ" },
  { key: "mehal", label_en: "Mehal Sub City", label_am: "መሃል ክፍለ ከተማ" },
  { key: "bahil_adarash", label_en: "Bahil Adarash Sub City", label_am: "ባህል አደራሽ ክፍለ ከተማ" },
  { key: "misrak", label_en: "Misrak Sub City", label_am: "ምስራቅ ክፍለ ከተማ" },
  { key: "menahreya", label_en: "Menahreya Sub City", label_am: "መናሕሪያ ክፍለ ከተማ" },
  { key: "tulla", label_en: "Tulla Sub City", label_am: "ሆዌላ ቱላ ክፍለ ከተማ" },
];

async function main() {
  await db.initializePool();

  await db.execute(
    "UPDATE locations SET sub_zones = ?, updated_at = NOW() WHERE key_name = 'hawassa'",
    [JSON.stringify(OFFICIAL_SUBCITIES)]
  );
  console.log(`✓ Hawassa sub_zones -> ${OFFICIAL_SUBCITIES.length} official sub-cities`);

  // Legacy key remap — idempotent by construction (WHERE on old keys).
  const [piassa] = await db.execute(
    `UPDATE listings
       SET location_key = 'hawassa_addis_ketema',
           location_label_en = 'Hawassa - Addis Ketema Sub City',
           location_label_am = 'ሀዋሳ - አዲስ ከተማ ክፍለ ከተማ'
     WHERE location_key = 'hawassa_piassa'`
  );
  console.log(`✓ remapped ${piassa.affectedRows} listing(s): hawassa_piassa -> hawassa_addis_ketema`);

  // Bare 'tabor' rows (pre-city-prefix scheme) — only Hawassa ones, i.e.
  // any row not already carrying another city prefix.
  const [tabor] = await db.execute(
    `UPDATE listings
       SET location_key = 'hawassa_tabor',
           location_label_en = 'Hawassa - Tabor Sub City',
           location_label_am = 'ሀዋሳ - ታቦር ክፍለ ከተማ'
     WHERE location_key = 'tabor'`
  );
  console.log(`✓ remapped ${tabor.affectedRows} listing(s): tabor -> hawassa_tabor`);

  process.exit(0);
}

main().catch((err) => {
  console.error("❌ Migration failed:", err);
  process.exit(1);
});
