/**
 * Sprint 9b â€” Sidaamu Afoo parity for location labels.
 *
 * Adds locations.label_sid and seeds it with Sidaamu transliterations
 * (project glossary; flag for native-review before launch):
 *   hawassa -> Hawwissaa, yirgalem -> Yirgaaleem, aleta_wondo -> Aletaa Wondoo,
 *   bensa -> Bensaa/Daaye, chuko -> Cuqoo, addis_ababa -> Addis Abbaa.
 * Hawassa's eight official sub-cities gain label_sid entries inside the
 * sub_zones JSON (Taabor / Addisi Ketema / Hayike Daar / Mehaal /
 * Baheele Adaraash / Misiraake / Menahareeya / Haweela Tulaa).
 *
 * Consumers fall back label_sid -> label_am -> label_en via pickDbLabel,
 * so NULL label_sid never breaks rendering.
 * Every step guarded; rerunning is a no-op.
 *
 * Â© 2026 Malazone Technologies PLC
 */

const db = require("../db");

async function columnExists(db, table, column) {
  const [rows] = await db.execute(
    `SELECT COUNT(*) AS n FROM information_schema.COLUMNS
     WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = ? AND COLUMN_NAME = ?`,
    [table, column]
  );
  return rows[0].n > 0;
}

const ROOT_LABELS = {
  hawassa: "Hawwissaa",
  yirgalem: "Yirgaaleem",
  aleta_wondo: "Aletaa Wondoo",
  bensa: "Bensaa/Daaye",
  chuko: "Cuqoo",
  addis_ababa: "Addis Abbaa",
};

// Covers both the DB sub-zone keys (8i) and legacy fallback spellings.
const SUB_ZONE_LABELS = {
  tabor: "Taabor",
  addis_ketema: "Addisi Ketema",
  addisi_ketema: "Addisi Ketema",
  hayek_dar: "Hayike Daar",
  hayike_daar: "Hayike Daar",
  mehal: "Mehaal",
  bahil_adarash: "Baheele Adaraash",
  misrak: "Misiraake",
  misiraake: "Misiraake",
  menahreya: "Menahareeya",
  menaheerya: "Menahareeya",
  tulla: "Haweela Tulaa",
  haweela_tulaa: "Haweela Tulaa",
};

(async () => {
  try {
    console.log("Sprint 9b â€” locations.label_sid");

    if (!(await columnExists(db, "locations", "label_sid"))) {
      await db.execute(
        `ALTER TABLE locations ADD COLUMN label_sid VARCHAR(120) NULL AFTER label_am`
      );
      console.log("  [ALTER] locations.label_sid added");
    } else {
      console.log("  [ALTER] label_sid already present â€” skipping");
    }

    for (const [key, sid] of Object.entries(ROOT_LABELS)) {
      const [res] = await db.execute(
        `UPDATE locations SET label_sid = ? WHERE key_name = ? AND (label_sid IS NULL OR label_sid = '')`,
        [sid, key]
      );
      if (res.affectedRows) console.log(`  [${key}] â†’ ${sid}`);
    }

    // Sub-zones live as JSON on each row; rewrite any entry we know how to
    // translate and that does not carry label_sid yet.
    const [rows] = await db.execute(`SELECT id, key_name, sub_zones FROM locations`);
    for (const row of rows) {
      let zones;
      try { zones = typeof row.sub_zones === "string" ? JSON.parse(row.sub_zones || "[]") : row.sub_zones || []; }
      catch { continue; }
      if (!Array.isArray(zones) || zones.length === 0) continue;

      let changed = false;
      const next = zones.map((z) => {
        if (!z || typeof z !== "object" || z.label_sid) return z;
        const sid = SUB_ZONE_LABELS[z.key];
        if (!sid) return z;
        changed = true;
        return { ...z, label_sid: sid };
      });
      if (!changed) continue;
      await db.execute(`UPDATE locations SET sub_zones = ? WHERE id = ?`, [
        JSON.stringify(next), row.id,
      ]);
      console.log(`  [${row.key_name}] sub_zones label_sid seeded (${next.length} zones)`);
    }

    const [check] = await db.execute(
      `SELECT key_name, label_sid FROM locations WHERE label_sid IS NULL OR label_sid = ''`
    );
    console.log(
      check.length === 0
        ? "Verification: every active root carries label_sid ✓"
        : `Missing label_sid: ${check.map((r) => r.key_name).join(", ")}`
    );
    console.log("Migration complete.");
    process.exit(0);
  } catch (err) {
    console.error("Migration failed:", err);
    process.exit(1);
  }
})();

