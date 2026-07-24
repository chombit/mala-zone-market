/**
 * CityContext.tsx
 * Malazone.com — Multi-City Management
 * © 2026 Malazone Technologies PLC
 */

import React, { createContext, useContext, useState, useEffect, useCallback } from "react";

export interface City {
  key: string;
  labelEn: string;
  labelAm: string;
  subZones: SubZone[];
  isActive: boolean;
}

export interface SubZone {
  key: string;
  labelEn: string;
  labelAm: string;
}

interface CityContextValue {
  currentCity: City | null;
  cities: City[];
  setCity: (cityKey: string) => void;
  isLoading: boolean;
}

const CityContext = createContext<CityContextValue | null>(null);

// Default cities data (will be fetched from API in production)
const DEFAULT_CITIES: City[] = [
  {
    key: "hawassa",
    labelEn: "Hawassa",
    labelAm: "ሐዋሳ",
    subZones: [
      { key: "tabor", labelEn: "Tabor", labelAm: "ታቦር" },
      { key: "lakefront", labelEn: "Lakefront", labelAm: "ሐይቅ ዳርቻ" },
      { key: "piassa", labelEn: "Piassa", labelAm: "ፒያሳ" },
      { key: "mehal_ketema", labelEn: "Mehal Ketema", labelAm: "መካል ከተማ" },
      { key: "tikur_ambesa", labelEn: "Tikur Ambesa", labelAm: "ጥቁር አምበሳ" },
    ],
    isActive: true,
  },
  {
    key: "addis_ababa",
    labelEn: "Addis Ababa",
    labelAm: "አዲስ አበበ",
    subZones: [
      { key: "bole", labelEn: "Bole", labelAm: "ቦሌ" },
      { key: "kazanchis", labelEn: "Kazanchis", labelAm: "ካዛንቺስ" },
      { key: "piassa", labelEn: "Piassa", labelAm: "ፒያሳ" },
      { key: "meskel_square", labelEn: "Meskel Square", labelAm: "መስቀል አደባባይ" },
    ],
    isActive: false, // Not yet launched
  },
  {
    key: "yirgalem",
    labelEn: "Yirgalem",
    labelAm: "ይርጋለም",
    subZones: [
      { key: "tabor", labelEn: "Tabor", labelAm: "ታቦር" },
      { key: "main_street", labelEn: "Main Street", labelAm: "ዋና መንገድ" },
    ],
    isActive: false, // Not yet launched
  },
  {
    key: "dilla",
    labelEn: "Dilla",
    labelAm: "ዲላ",
    subZones: [
      { key: "center", labelEn: "Center", labelAm: "ማእከል" },
      { key: "bus_station", labelEn: "Bus Station", labelAm: "የአውቶቡስ ጣቢያ" },
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
          const mappedCities = data.data.map((loc: any) => ({
            key: loc.key_name,
            labelEn: loc.label_en,
            labelAm: loc.label_am,
            subZones: loc.sub_zones || [],
            isActive: loc.is_active,
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
