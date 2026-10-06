/**
 * CityContext.tsx
 * Malazone.com — Multi-City Management
 * © 2026 Malazone Technologies PLC
 */

import React, { createContext, useContext, useState, useEffect, useCallback } from "react";
import type { DbLabeled } from "../utils/dbLabel";

export interface SubZone extends DbLabeled {
  key: string;
  labelEn: string;
  labelAm: string;
  labelSid?: string;
}

export interface City {
  key: string;
  labelEn: string;
  labelAm: string;
  labelSid?: string;
  subZones: SubZone[];
  isActive: boolean;
}

interface CityContextValue {
  currentCity: City | null;
  cities: City[];
  setCity: (cityKey: string) => void;
  isLoading: boolean;
}

const CityContext = createContext<CityContextValue | null>(null);

/** API serves sub_zones as a JSON string (TEXT column) — normalize both shapes. */
function parseSubZones(raw: unknown): SubZone[] {
  if (!raw) return [];
  let zones: any[] = [];
  if (Array.isArray(raw)) zones = raw;
  else {
    try { zones = JSON.parse(String(raw)); } catch { return []; }
  }
  if (!Array.isArray(zones)) return [];
  return zones
    .filter((z) => z && typeof z === "object" && z.key)
    .map((z) => ({
      key: String(z.key),
      labelEn: String(z.label_en ?? z.key),
      labelAm: String(z.label_am ?? z.label_en ?? z.key),
      labelSid: z.label_sid ? String(z.label_sid) : undefined,
    }));
}

/**
 * One-time storage migration (Hawassa-pilot rollout, Sprint 8j).
 *
 * Pre-release users may carry a stale `malazone_city` from the old
 * neighborhood-based scheme (e.g. "tabor"/"lakefront" — keys that are no
 * longer cities). Bumping CITY_STORAGE_VERSION force-resets everyone to
 * Hawassa exactly once; after that their own city choice persists as usual.
 */
const CITY_STORAGE_VERSION = "2";
if (typeof window !== "undefined" && localStorage.getItem("malazone_city_version") !== CITY_STORAGE_VERSION) {
  localStorage.setItem("malazone_city", "hawassa");
  localStorage.setItem("malazone_city_version", CITY_STORAGE_VERSION);
}

// Default cities data (will be fetched from API in production)
const DEFAULT_CITIES: City[] = [
  {
    key: "hawassa",
    labelEn: "Hawassa",
    labelAm: "ሐዋሳ",
    labelSid: "Hawwissaa",
    subZones: [
      { key: "tabor", labelEn: "Tabor Sub City", labelAm: "ታቦር ክፍለ ከተማ", labelSid: "Taabor" },
      { key: "addis_ketema", labelEn: "Addis Ketema Sub City", labelAm: "አዲስ ከተማ ክፍለ ከተማ", labelSid: "Addisi Ketema" },
      { key: "hayek_dar", labelEn: "Hayek Dar Sub City", labelAm: "ሐይክ ዳር ክፍለ ከተማ", labelSid: "Hayike Daar" },
      { key: "mehal", labelEn: "Mehal Sub City", labelAm: "መሃል ክፍለ ከተማ", labelSid: "Mehaal" },
      { key: "bahil_adarash", labelEn: "Bahil Adarash Sub City", labelAm: "ባህል አደራሽ ክፍለ ከተማ", labelSid: "Baheele Adaraash" },
      { key: "misrak", labelEn: "Misrak Sub City", labelAm: "ምስራቅ ክፍለ ከተማ", labelSid: "Misiraake" },
      { key: "menahreya", labelEn: "Menahreya Sub City", labelAm: "መናሕሪያ ክፍለ ከተማ", labelSid: "Menahareeya" },
      { key: "tulla", labelEn: "Tulla Sub City", labelAm: "ሆዌላ ቱላ ክፍለ ከተማ", labelSid: "Haweela Tulaa" },
    ],
    isActive: true,
  },
  {
    key: "addis_ababa",
    labelEn: "Addis Ababa",
    labelAm: "አዲስ አበበ",
    labelSid: "Addis Abbaa",
    subZones: [
      { key: "bole", labelEn: "Bole", labelAm: "ቦሌ", labelSid: "Boolee" },
      { key: "kazanchis", labelEn: "Kazanchis", labelAm: "ካዛንቺስ", labelSid: "Kaazanchiis" },
      { key: "piassa", labelEn: "Piassa", labelAm: "ፒያሳ", labelSid: "Piyaasa" },
      { key: "meskel_square", labelEn: "Meskel Square", labelAm: "መስቀል አደባባይ", labelSid: "Meskel Square" },
    ],
    isActive: true, // Launched alongside Sprint 8 location alignment
  },
  {
    key: "yirgalem",
    labelEn: "Yirgalem",
    labelAm: "ይርጋለም",
    labelSid: "Yirgaaleem",
    subZones: [
      { key: "tabor", labelEn: "Tabor", labelAm: "ታቦር", labelSid: "Taabor" },
      { key: "main_street", labelEn: "Main Street", labelAm: "ዋና መንገድ", labelSid: "Main Street" },
    ],
    isActive: false, // Not yet launched
  },
  {
    key: "dilla",
    labelEn: "Dilla",
    labelAm: "ዲላ",
    labelSid: "Diilla",
    subZones: [
      { key: "center", labelEn: "Center", labelAm: "ማእከል", labelSid: "Center" },
      { key: "bus_station", labelEn: "Bus Station", labelAm: "የአውቶቡስ ጣቢያ", labelSid: "Bus Station" },
    ],
    isActive: false, // Not yet launched
  },
];

export const CityProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currentCity, setCurrentCity] = useState<City | null>(null);
  const [cities, setCities] = useState<City[]>(DEFAULT_CITIES);
  const [isLoading, setIsLoading] = useState(true);

  // Load saved city from localStorage
  useEffect(() => {
    const savedCityKey = localStorage.getItem("malazone_city");
    if (savedCityKey) {
      const city = DEFAULT_CITIES.find((c) => c.key === savedCityKey);
      if (city) {
        setCurrentCity(city);
      } else {
        // Default to Hawassa if saved city not found
        setCurrentCity(DEFAULT_CITIES[0]);
      }
    } else {
      // Default to Hawassa for new users
      setCurrentCity(DEFAULT_CITIES[0]);
    }
    setIsLoading(false);
  }, []);

  // Fetch cities from API (for production)
  useEffect(() => {
    fetch("/api/locations")
      .then((res) => res.json())
      .then((data) => {
        if (data.success && Array.isArray(data.data)) {
          const mappedCities: City[] = data.data.map((loc: any): City => ({
            key: loc.key_name,
            labelEn: loc.label_en,
            labelAm: loc.label_am,
            labelSid: loc.label_sid || undefined,
            // API returns sub_zones as a JSON string (TEXT column)
            subZones: parseSubZones(loc.sub_zones),
            isActive: !!loc.is_active,
          }));
          setCities(mappedCities);
        }
      })
      .catch(() => {
        // Keep default cities on error
      });
  }, []);

  const setCity = useCallback((cityKey: string) => {
    const city = cities.find((c) => c.key === cityKey);
    if (city) {
      setCurrentCity(city);
      localStorage.setItem("malazone_city", cityKey);
    }
  }, [cities]);

  return (
    <CityContext.Provider value={{ currentCity, cities, setCity, isLoading }}>
      {children}
    </CityContext.Provider>
  );
};

export const useCity = () => {
  const ctx = useContext(CityContext);
  if (!ctx) throw new Error("useCity must be used within CityProvider");
  return ctx;
};
