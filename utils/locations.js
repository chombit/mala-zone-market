/**
 * utils/locations.js — Sprint 8 city → district resolution.
 *
 * Listings store district-level location keys (`bole`, `hawassa_piassa`, …)
 * while the UI filters by CITY keys (`addis_ababa`, `hawassa`). A city param
 * must therefore match: the exact key, any key with that prefix, AND every
 * sub-zone district registered under that city in the locations table.
 */
const db = require("../database/db");

const CACHE_TTL_MS = 60 * 1000;
let cache = null;

async function loadCitySubzones(force = false) {
  if (!force && cache && Date.now() - cache.loadedAt < CACHE_TTL_MS) return cache;
  const [rows] = await db.execute("SELECT key_name, sub_zones FROM locations WHERE is_active = 1");
  const map = new Map(); // city key -> Set(district keys)
  for (const r of rows) {
    let zones = [];
    try { zones = JSON.parse(r.sub_zones || "[]"); } catch { zones = []; }
    map.set(
      r.key_name,
      new Set(zones.map((z) => String(z.key)).filter(Boolean))
    );
  }
  cache = { loadedAt: Date.now(), map };
  return cache;
}

/**
 * Build the WHERE fragment + params for a city/district filter.
 * Returns null when the param is empty. Never throws — on DB trouble it
 * degrades to plain prefix matching.
 */
async function buildLocationFilter(cityParam, column = "l.location_key") {
  const param = String(cityParam || "").trim();
  if (!param || !/^[a-z0-9_]{1,50}$/i.test(param)) return null;

  const likeFragment = `(${column} LIKE ? OR ${column} = ?)`;
  const likeParams = [`${param}%`, param];

  try {
    const { map } = await loadCitySubzones();
    const districts = map.get(param.toLowerCase());
    if (!districts || districts.size === 0) {
      return { fragment: likeFragment, params: likeParams };
    }
    const districtList = [...districts];
    const placeholders = districtList.map(() => "?").join(",");
    return {
      fragment: `(${likeFragment} OR ${column} IN (${placeholders}))`,
      params: [...likeParams, ...districtList],
    };
  } catch (err) {
    console.warn("[locations] subzone lookup failed, using prefix only:", err.message);
    return { fragment: likeFragment, params: likeParams };
  }
}

module.exports = { buildLocationFilter };
