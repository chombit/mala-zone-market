/**
 * Sprint 8 migration — align city sub-zones with real listing location keys.
 *
 * Problem: listings store district-level keys (bole, kazanchis, mexico,
 * bole_megenagna, addis, hawassa_piassa) while the addis_ababa city row had
 * an empty sub_zones list, so filtering by that city matched nothing.
 *
 * Idempotent: only fills when a city's sub_zones are missing/empty.
 */
const db = require("../db");

const CITY_SUBZONES = {
  addis_ababa: [
    { key: "bole", label_en: "Bole", label_am: "ቦሌ" },
    { key: "bole_megenagna", label_en: "Bole Megenagna", label_am: "ቦሌ መገናኛ" },
    { key: "kazanchis", label_en: "Kazanchis", label_am: "ካዛንቺስ" },
    { key: "mexico", label_en: "Mexico", label_am: "ሜክሲኮ" },
    { key: "piassa", label_en: "Piassa", label_am: "ፒያሳ" },
    { key: "addis", label_en: "Addis Ketema", label_am: "አዲስ ከተማ" },
    { key: "meskel_square", label_en: "Meskel Square", label_am: "መስቀል አደባባይ" },
  ],
  hawassa: [
    { key: "hawassa_piassa", label_en: "Piassa", label_am: "ፒያሳ" },
    { key: "tabor", label_en: "Tabor", label_am: "ታቦር" },
    { key: "lakefront", label_en: "Lakefront", label_am: "የሐይቅ ጫፍ" },
  ],
};

async function main() {
  await db.initializePool();

  for (const [cityKey, subZones] of Object.entries(CITY_SUBZONES)) {
    const [[row]] = await db.execute(
      "SELECT id, sub_zones FROM locations WHERE key_name = ?",
      [cityKey]
    );
    if (!row) {
      console.log(`⚠️ ${cityKey}: row not found, skipped`);
      continue;
    }
    let existing = [];
    try { existing = JSON.parse(row.sub_zones || "[]"); } catch { existing = []; }
    const existingKeys = new Set(existing.map((s) => s.key));
    const merged = [...existing];
    let added = 0;
    for (const sz of subZones) {
      if (!existingKeys.has(sz.key)) {
        merged.push(sz);
        added += 1;
      }
    }
    if (added > 0) {
      await db.execute("UPDATE locations SET sub_zones = ? WHERE id = ?", [
        JSON.stringify(merged),
        row.id,
      ]);
      console.log(`✅ ${cityKey}: +${added} sub-zones (${merged.length} total)`);
    } else {
      console.log(`ℹ️ ${cityKey}: sub-zones already aligned`);
    }
  }

  console.log("🎉 Sprint 8 location alignment complete");
  process.exit(0);
}

main().catch((err) => {
  console.error("❌ Migration failed:", err);
  process.exit(1);
});
