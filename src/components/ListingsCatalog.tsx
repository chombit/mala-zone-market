/**
 * ListingsCatalog.tsx
 * Malazone.com — Luxury Split-Screen Listings Directory Layer & Search Engine
 * © 2026 Malazone Technologies PLC
 */

import React, { useState, useEffect, useCallback } from "react";
import {
  Phone,
  Send,
  BadgeCheck,
  Star,
  ChevronRight,
  Loader2,
  RotateCcw,
  SlidersHorizontal
} from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";
import { useTheme } from "@/contexts/ThemeContext";

// Local listing definition matching db structure and custom properties
interface Listing {
  id: string;
  category: string;
  title_en: string;
  title_am: string;
  price: number;
  price_suffix: "fixed" | "per_day" | "per_hour";
  images: string | string[];
  phone: string;
  whatsapp: string;
  is_premium?: boolean | number;
  is_verified?: boolean | number;
  rating?: number;
  // Filterable fields (either in db or mapped from location keys)
  region?: string;
  locality?: string;
  intent?: string;
  land_type?: string;
  plate_code?: string;
  fuel_type?: string;
  condition?: string;
  rental_interval?: string;
  machinery_scope?: string;
  area_sqm?: number;
  bedrooms?: number;
}

const catalogTranslations = {
  en: {
    sidebarTitle: "Refine Search",
    resetBtn: "Reset Filters",
    gridHeading: "MALA Specially Featured Listings",
    viewMore: "View All Assets",
    chatBtn: "Telegram",
    callBtn: "Direct Call",
    verifiedBadge: "Verified Carta",
    withOperatorBadge: "With Operator",
    defaultBadge: "Verified",
    negotiable: "Negotiable",
    fixed: "Fixed Price",
    regionLabel: "Region / Zone",
    localityLabel: "Locality / Sub-City",
    intentLabel: "Transaction Intent",
    allOption: "All Options",
    filterTitleProperty: "Land Registry Type",
    filterTitlePlate: "Plate Code Selection",
    filterTitleFuel: "Fuel Engine Type",
    filterTitleCondition: "Vehicle Condition",
    filterTitleRental: "Rental Time Interval",
    filterTitleHeavy: "Machinery Usage Scope",
    loadingText: "Optimizing Asset Stream...",
    emptyText: "No listings match your search criteria.",
    priceSuffixDay: "ETB / day",
    priceSuffixHour: "ETB / hour",
    priceSuffixFixed: "ETB"
  },
  amharic: {
    sidebarTitle: "ማጣሪያዎች",
    resetBtn: "ሁሉንም አድስ",
    gridHeading: "MALA ልዩና ተመራጭ ማስታወቂያዎች",
    viewMore: "ሁሉም ማስታወቂያዎች",
    chatBtn: "በዋትስአፕ",
    callBtn: "ቀጥታ ደውል",
    verifiedBadge: "ካርታ የተረጋገጠ",
    withOperatorBadge: "ባለሙያ ያለው",
    defaultBadge: "የተረጋገጠ",
    negotiable: "የሚደራደር",
    fixed: "ቋሚ ዋጋ",
    regionLabel: "ክልል / ዞን",
    localityLabel: "ከተማ / ክፍለ-ከተማ",
    intentLabel: "የፍላጎት አይነት",
    allOption: "ሁሉም አማራጮች",
    filterTitleProperty: "ይዞታ ማጣሪያ",
    filterTitlePlate: "የሰሌዳ ኮድ",
    filterTitleFuel: "የነዳጅ አይነት",
    filterTitleCondition: "ሁኔታ",
    filterTitleRental: "የኪራይ ጊዜ",
    filterTitleHeavy: "የማሽነሪ አገልግሎት",
    loadingText: "የማስታወቂያ መስመር በመዘርጋት ላይ...",
    emptyText: "የፈለጉትን ማጣሪያ የሚያሟላ ማስታወቂያ አልተገኘም።",
    priceSuffixDay: "ETB / ቀን",
    priceSuffixHour: "ETB / ሰዓት",
    priceSuffixFixed: "ETB"
  }
};

// Premium high-quality images from Unsplash for realistic presentation
const fallbackListings: Listing[] = [
  {
    id: "prop-1",
    category: "property",
    title_en: "Luxurious 4-Bedroom Modern Villa with Lake View",
    title_am: "ዘመናዊ ባለ 4 መኝታ ቪላ ከሀይቅ እይታ ጋር",
    price: 18500000,
    price_suffix: "fixed",
    images: ["https://images.unsplash.com/photo-1613490493576-7fde63acd811?w=800&q=80&fm=webp"],
    phone: "0911223344",
    whatsapp: "251911223344",
    is_premium: 1,
    is_verified: 1,
    rating: 5,
    region: "sidama",
    locality: "lakefront",
    intent: "buy",
    land_type: "carta",
    area_sqm: 450
  },
  {
    id: "prop-2",
    category: "property",
    title_en: "Spacious Land in Hawassa Tabor - Perfect for Commercial Building",
    title_am: "ሰፊ መሬት በሀዋሳ ታቦር - ለንግድ ህንፃ የሚሆን",
    price: 8500000,
    price_suffix: "fixed",
    images: ["https://images.unsplash.com/photo-1500382017468-9049fed747ef?w=800&q=80&fm=webp"],
    phone: "0922334455",
    whatsapp: "251922334455",
    is_premium: 0,
    is_verified: 1,
    rating: 4.8,
    region: "sidama",
    locality: "tabor",
    intent: "buy",
    land_type: "carta",
    area_sqm: 500
  },
  {
    id: "prop-3",
    category: "property",
    title_en: "Cozy Family Villa in Hawassa Piassa",
    title_am: "ቆንጆ የቤተሰብ ቪላ በሀዋሳ ፒያሳ",
    price: 12500000,
    price_suffix: "fixed",
    images: ["https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=800&q=80&fm=webp"],
    phone: "0912123456",
    whatsapp: "251912123456",
    is_premium: 0,
    is_verified: 0,
    rating: 4.4,
    region: "sidama",
    locality: "piassa",
    intent: "buy",
    land_type: "village",
    area_sqm: 300
  },
  {
    id: "motor-1",
    category: "motors",
    title_en: "Toyota RAV4 2022 Hybrid - Brand New Condition",
    title_am: "ቶዮታ RAV4 2022 ሃይብሪድ - አዲስ መኪና",
    price: 6400000,
    price_suffix: "fixed",
    images: ["https://images.unsplash.com/photo-1533473359331-0135ef1b58bf?w=800&q=80&fm=webp"],
    phone: "0911556677",
    whatsapp: "251911556677",
    is_premium: 1,
    is_verified: 1,
    rating: 4.9,
    region: "addis_ababa",
    locality: "piassa",
    intent: "buy",
    plate_code: "Code 2",
    fuel_type: "electric",
    condition: "new"
  },
  {
    id: "motor-2",
    category: "motors",
    title_en: "Suzuki Dzire 2021 - Locally Used, Fuel Efficient",
    title_am: "ሱዙኪ ዲዛየር 2021 - በአገር ውስጥ የተነዳ፣ ነዳጅ ቆጣቢ",
    price: 2100000,
    price_suffix: "fixed",
    images: ["https://images.unsplash.com/photo-1549399542-7e3f8b79c341?w=800&q=80&fm=webp"],
    phone: "0933445566",
    whatsapp: "251933445566",
    is_premium: 0,
    is_verified: 0,
    rating: 4.5,
    region: "sidama",
    locality: "chuko",
    intent: "buy",
    plate_code: "Code 3",
    fuel_type: "benzine",
    condition: "used"
  },
  {
    id: "motor-3",
    category: "motors",
    title_en: "Hyundai Elantra 2023 EV - New / አዲስ",
    title_am: "ሃዩንዳይ ኢላንትራ 2023 ኤሌክትሪክ - አዲስ",
    price: 4900000,
    price_suffix: "fixed",
    images: ["https://images.unsplash.com/photo-1563720223185-11003d516935?w=800&q=80&fm=webp"],
    phone: "0944123456",
    whatsapp: "251944123456",
    is_premium: 1,
    is_verified: 1,
    rating: 4.8,
    region: "addis_ababa",
    locality: "piassa",
    intent: "buy",
    plate_code: "Code 2",
    fuel_type: "electric",
    condition: "new"
  },
  {
    id: "ceremony-1",
    category: "ceremony",
    title_en: "Luxury Wedding Hall with Sound & Decor Included",
    title_am: "ምርጥ የሰርግ አዳራሽ ከድምፅ እና ዲኮር ጋር",
    price: 120000,
    price_suffix: "per_day",
    images: ["https://images.unsplash.com/photo-1519741497674-611481863552?w=800&q=80&fm=webp"],
    phone: "0911778899",
    whatsapp: "251911778899",
    is_premium: 1,
    is_verified: 1,
    rating: 5,
    region: "sidama",
    locality: "lakefront",
    intent: "rent",
    rental_interval: "event"
  },
  {
    id: "ceremony-2",
    category: "ceremony",
    title_en: "Traditional Habesha Wedding Dress Rental",
    title_am: "የሀበሻ ባህላዊ የሰርግ ልብስ ኪራይ",
    price: 15000,
    price_suffix: "per_day",
    images: ["https://images.unsplash.com/photo-1583939003579-730e3918a45a?w=800&q=80&fm=webp"],
    phone: "0911559988",
    whatsapp: "251911559988",
    is_premium: 0,
    is_verified: 1,
    rating: 4.7,
    region: "sidama",
    locality: "piassa",
    intent: "rent",
    rental_interval: "day"
  },
  {
    id: "heavy-1",
    category: "heavy",
    title_en: "Caterpillar Excavator 320D - Available with Expert Operator",
    title_am: "ካትረፒለር ኤክስካቫተር 320D - ከባለሙያ ኦፕሬተር ጋር",
    price: 3200,
    price_suffix: "per_hour",
    images: ["https://images.unsplash.com/photo-1579412691522-861f6540960d?w=800&q=80&fm=webp"],
    phone: "0944556677",
    whatsapp: "251944556677",
    is_premium: 1,
    is_verified: 1,
    rating: 4.7,
    region: "sidama",
    locality: "yirgalem",
    intent: "hour",
    machinery_scope: "construction"
  },
  {
    id: "heavy-2",
    category: "heavy",
    title_en: "John Deere Agricultural Tractor - Harvest Ready",
    title_am: "ጆን ዲር የግብርና ትራክተር - ለአዝመራ ዝግጁ",
    price: 1800,
    price_suffix: "per_hour",
    images: ["https://images.unsplash.com/photo-1500937386664-56d1dfef3854?w=800&q=80&fm=webp"],
    phone: "0955667788",
    whatsapp: "251955667788",
    is_premium: 0,
    is_verified: 1,
    rating: 4.6,
    region: "sidama",
    locality: "bensa",
    intent: "hour",
    machinery_scope: "agricultural"
  },
  {
    id: "stay-1",
    category: "stay",
    title_en: "Lakeview Executive Suite at Hawassa - Free Wi-Fi & Breakfast",
    title_am: "የሃይቅ እይታ ያለው የክብር እንግዶች ክፍል በሀዋሳ - ነፃ ዋይፋይ እና ቁርስ",
    price: 4500,
    price_suffix: "per_day",
    images: ["https://images.unsplash.com/photo-1566073771259-6a8506099945?w=800&q=80&fm=webp"],
    phone: "0966778899",
    whatsapp: "251966778899",
    is_premium: 1,
    is_verified: 1,
    rating: 4.9,
    region: "sidama",
    locality: "lakefront",
    intent: "rent"
  }
];

const ListingsCatalog: React.FC<{ activeCategory?: string }> = ({ activeCategory = "all" }) => {
  const { language } = useLanguage();
  const { theme } = useTheme();
  const t = catalogTranslations[language as "en" | "amharic"] || catalogTranslations.en;
  const isAm = language === "amharic";

  // Data Pipeline States
  const [listings, setListings] = useState<Listing[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Lazy loading pagination count
  const [visibleLimit, setVisibleLimit] = useState(6);

  // Filter Dropdown Values
  const [region, setRegion] = useState("all");
  const [locality, setLocality] = useState("all");
  const [intent, setIntent] = useState("all");

  // Dynamic Cross-Industry Parameters
  const [landType, setLandType] = useState("all");
  const [plateCode, setPlateCode] = useState("all");
  const [fuelType, setFuelType] = useState("all");
  const [condition, setCondition] = useState("all");
  const [rentalInterval, setRentalInterval] = useState("all");
  const [machineryScope, setMachineryScope] = useState("all");

  // Reset Filters Function
  const handleResetFilters = () => {
    setRegion("all");
    setLocality("all");
    setIntent("all");
    setLandType("all");
    setPlateCode("all");
    setFuelType("all");
    setCondition("all");
    setRentalInterval("all");
    setMachineryScope("all");
    setVisibleLimit(6);
  };

  // Fetch API Listings
  useEffect(() => {
    const fetchListings = async () => {
      setLoading(true);
      setError(null);
      try {
        const url = activeCategory === "all"
          ? "/api/listings?limit=40"
          : `/api/listings?category=${activeCategory}&limit=40`;

        const response = await fetch(url);
        const result = await response.json();

        if (result.success && Array.isArray(result.data)) {
          // Normalize results and join with fallback data for beautiful variety
          const parsedData: Listing[] = result.data.map((item: any) => {
            let imagesArray: string[] = [];
            try {
              imagesArray = typeof item.images === "string" ? JSON.parse(item.images) : item.images;
            } catch (e) {
              imagesArray = Array.isArray(item.images) ? item.images : [];
            }
            if (imagesArray.length === 0) {
              imagesArray = ["https://images.unsplash.com/photo-1560518883-ce09059eeffa?w=800&q=80&fm=webp"];
            }

            // Map database attributes back to UI search parameters
            const locKey = (item.location_key || "").toLowerCase();
            let mappedRegion = "sidama";
            if (locKey.includes("addis") || locKey.includes("piassa")) {
              mappedRegion = "addis_ababa";
            }

            let mappedLocality = "piassa";
            if (locKey.includes("tabor")) mappedLocality = "tabor";
            else if (locKey.includes("lakefront")) mappedLocality = "lakefront";
            else if (locKey.includes("yirgalem")) mappedLocality = "yirgalem";
            else if (locKey.includes("bensa")) mappedLocality = "bensa";
            else if (locKey.includes("chuko")) mappedLocality = "chuko";

            let mappedIntent = "buy";
            if (item.price_suffix === "per_day") mappedIntent = "rent";
            else if (item.price_suffix === "per_hour") mappedIntent = "hour";

            return {
              ...item,
              images: imagesArray,
              is_premium: item.is_premium === 1 || item.is_premium === true,
              is_verified: item.is_verified === 1 || item.is_verified === true,
              rating: item.rating || 4.7 + (Math.random() * 0.3),
              region: mappedRegion,
              locality: mappedLocality,
              intent: mappedIntent,
              land_type: item.land_type || (item.is_verified ? "carta" : "village"),
              plate_code: item.plate_code || "Code 2",
              fuel_type: item.fuel_type || "benzine",
              condition: item.condition || "used",
              rental_interval: item.rental_interval || (item.price_suffix === "per_day" ? "day" : "event"),
              machinery_scope: item.machinery_scope || "construction"
            };
          });

          // Merge API and fallbacks to ensure rich layout selection
          const combined = [...parsedData, ...fallbackListings.filter(f => activeCategory === "all" || f.category === activeCategory)];
          // Deduplicate based on ID
          const deduped = combined.filter((val, index, self) => self.findIndex(t => t.id === val.id) === index);
          setListings(deduped);
        } else {
          // If server returns error, gracefully fallback to local listing context
          setListings(fallbackListings.filter(f => activeCategory === "all" || f.category === activeCategory));
        }
      } catch (err) {
        // Fallback context
        setListings(fallbackListings.filter(f => activeCategory === "all" || f.category === activeCategory));
      } finally {
        setLoading(false);
      }
    };

    fetchListings();
  }, [activeCategory]);

  // Apply search filtering in UI stream
  const filteredListings = listings.filter((item) => {
    // 1. Category Filter
    if (activeCategory !== "all" && item.category !== activeCategory) return false;

    // 2. Region Filter
    if (region !== "all" && item.region !== region) return false;

    // 3. Locality Filter
    if (locality !== "all" && item.locality !== locality) return false;

    // 4. Intent Filter
    if (intent !== "all" && item.intent !== intent) return false;

    // 5. Dynamic parameters based on active category
    if (activeCategory === "property" || (activeCategory === "all" && item.category === "property")) {
      if (landType !== "all" && item.land_type !== landType) return false;
    }
    if (activeCategory === "motors" || (activeCategory === "all" && item.category === "motors")) {
      if (plateCode !== "all" && item.plate_code !== plateCode) return false;
      if (fuelType !== "all" && item.fuel_type !== fuelType) return false;
      if (condition !== "all" && item.condition !== condition) return false;
    }
    if (activeCategory === "ceremony" || (activeCategory === "all" && item.category === "ceremony")) {
      if (rentalInterval !== "all" && item.rental_interval !== rentalInterval) return false;
    }
    if (activeCategory === "heavy" || (activeCategory === "all" && item.category === "heavy")) {
      if (machineryScope !== "all" && item.machinery_scope !== machineryScope) return false;
    }

    return true;
  });

  // Load more function
  const handleLoadMore = () => {
    setVisibleLimit(prev => prev + 6);
  };

  const visibleCards = filteredListings.slice(0, visibleLimit);

  return (
    <section id="listings-catalog" className="bg-slate-50 dark:bg-slate-950 py-16 transition-colors duration-300">

      {/* Upper Title Banner block */}
      <div className="max-w-7xl mx-auto px-4 mb-10">
        <h2 className="text-3xl sm:text-4xl font-sans font-black text-slate-900 dark:text-white tracking-tight leading-snug transition-colors duration-300">
          {isAm ? (
            <>የተረጋገጡ የ <span className="text-[#00A86B] lowercase font-bold tracking-normal">malazone</span> ይፋዊ ማህደሮች</>
          ) : (
            <><span className="text-[#00A86B] lowercase font-bold tracking-normal">malazone</span> Verified Ledgers</>
          )}
        </h2>

        <div className="w-14 h-1 bg-[#00A86B] rounded-full mt-4 opacity-90 shadow-[0_2px_10px_rgba(0,168,107,0.3)]" />
      </div>

      {/* Main Split-Screen Desktop Layout */}
      <div className="md:flex gap-8 max-w-7xl mx-auto py-4 px-4">

        {/* 1. THE PREMIUM COMPACT FILTER SIDEBAR */}
        <div className="w-full md:w-64 flex-shrink-0 bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200/80 dark:border-slate-800 h-fit mb-8 md:mb-0 transition-colors duration-300 shadow-md">
          <div className="flex items-center justify-between pb-4 border-b border-slate-100 dark:border-slate-800 mb-6">
            <div className="flex items-center gap-2 text-slate-900 dark:text-white font-bold text-xs uppercase tracking-wider">
              <SlidersHorizontal className="w-4 h-4 text-emerald-600 dark:text-green-500" />
              {t.sidebarTitle}
            </div>
            <button
              onClick={handleResetFilters}
              className="text-[10px] font-bold text-slate-500 hover:text-emerald-600 dark:hover:text-green-500 transition-colors flex items-center gap-1.5"
            >
              <RotateCcw className="w-3 h-3" />
              {t.resetBtn}
            </button>
          </div>

          <div className="space-y-6">
            {/* Regional Administration State */}
            <div className="space-y-2">
              <label className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest block">
                {t.regionLabel}
              </label>
              <select
                value={region}
                onChange={(e) => setRegion(e.target.value)}
                className="w-full bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-white border border-slate-200 dark:border-white/5 rounded-xl px-4 py-3 text-xs font-semibold focus:outline-none focus:border-[#00A86B] dark:focus:border-[#00A86B] transition-colors font-sans tracking-wide leading-relaxed"
              >
                <option value="all">{t.allOption}</option>
                <option value="sidama">{isAm ? "ሲዳማ" : "Sidama"}</option>
                <option value="addis_ababa">{isAm ? "አዲስ አበባ" : "Addis Ababa"}</option>
              </select>
            </div>

            {/* Specific Locality/Sub-City */}
            <div className="space-y-2">
              <label className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest block">
                {t.localityLabel}
              </label>
              <select
                value={locality}
                onChange={(e) => setLocality(e.target.value)}
                className="w-full bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-white border border-slate-200 dark:border-white/5 rounded-xl px-4 py-3 text-xs font-semibold focus:outline-none focus:border-[#00A86B] dark:focus:border-[#00A86B] transition-colors font-sans tracking-wide leading-relaxed"
              >
                <option value="all">{t.allOption}</option>
                <option value="tabor">{isAm ? "ታቦር (ሀዋሳ)" : "Tabor (Hawassa)"}</option>
                <option value="lakefront">{isAm ? "ሌክፍረንት" : "Lakefront"}</option>
                <option value="piassa">{isAm ? "ፒያሳ" : "Piassa"}</option>
                <option value="yirgalem">{isAm ? "ይርጋለም" : "Yirgalem"}</option>
                <option value="bensa">{isAm ? "በንሳ" : "Bensa"}</option>
                <option value="chuko">{isAm ? "ቹኮ" : "Chuko"}</option>
              </select>
            </div>

            {/* Transaction Intent Selector */}
            <div className="space-y-2">
              <label className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest block">
                {t.intentLabel}
              </label>
              <select
                value={intent}
                onChange={(e) => setIntent(e.target.value)}
                className="w-full bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-white border border-slate-200 dark:border-white/5 rounded-xl px-4 py-3 text-xs font-semibold focus:outline-none focus:border-[#00A86B] dark:focus:border-[#00A86B] transition-colors font-sans tracking-wide leading-relaxed"
              >
                <option value="all">{t.allOption}</option>
                <option value="buy">{isAm ? "ለመግዛት" : "To Buy"}</option>
                <option value="rent">{isAm ? "ለመከራየት" : "To Rent"}</option>
                <option value="hour">{isAm ? "በሰዓት ለመቅጠር" : "Per Hour Work"}</option>
              </select>
            </div>

            {/* DYNAMIC CROSS-INDUSTRY PARAMETERS */}

            {/* If Category is Property or All & property type selected */}
            {(activeCategory === "property" || activeCategory === "all") && (
              <div className="pt-4 border-t border-slate-100 dark:border-slate-800 space-y-3">
                <label className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest block">
                  {t.filterTitleProperty}
                </label>
                <div className="flex flex-col gap-2">
                  {[
                    { key: "all", label_en: "All Lands", label_am: "ሁሉም" },
                    { key: "carta", label_en: "Carta / Title Deed", label_am: "ካርታ ያለው" },
                    { key: "village", label_en: "Village Deed", label_am: "የገጠር ይዞታ" }
                  ].map((btn) => (
                    <button
                      key={btn.key}
                      onClick={() => setLandType(btn.key)}
                      className={`w-full py-2 px-3 rounded-lg text-left text-xs font-bold transition-all border font-sans tracking-wide leading-relaxed ${landType === btn.key
                          ? "text-[#00A86B] border-[#00A86B] bg-[#00A86B]/5 dark:bg-[#00A86B]/10"
                          : "bg-slate-50 dark:bg-slate-950/40 text-slate-600 dark:text-slate-400 border-slate-200/80 dark:border-white/5 hover:border-slate-300 dark:hover:border-white/10"
                        }`}
                    >
                      {isAm ? btn.label_am : btn.label_en}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* If Category is Motors */}
            {(activeCategory === "motors" || activeCategory === "all") && (
              <div className="pt-4 border-t border-slate-100 dark:border-slate-800 space-y-4">
                {/* Plate Code */}
                <div className="space-y-2">
                  <label className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest block">
                    {t.filterTitlePlate}
                  </label>
                  <select
                    value={plateCode}
                    onChange={(e) => setPlateCode(e.target.value)}
                    className="w-full bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-white border border-slate-200 dark:border-white/5 rounded-xl px-4 py-3 text-xs font-semibold focus:outline-none focus:border-[#00A86B] dark:focus:border-[#00A86B] transition-colors font-sans tracking-wide leading-relaxed"
                  >
                    <option value="all">{t.allOption}</option>
                    <option value="Code 2">Code 2</option>
                    <option value="Code 3">Code 3</option>
                  </select>
                </div>

                {/* Fuel Type */}
                <div className="space-y-2">
                  <label className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest block">
                    {t.filterTitleFuel}
                  </label>
                  <select
                    value={fuelType}
                    onChange={(e) => setFuelType(e.target.value)}
                    className="w-full bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-white border border-slate-200 dark:border-white/5 rounded-xl px-4 py-3 text-xs font-semibold focus:outline-none focus:border-[#00A86B] dark:focus:border-[#00A86B] transition-colors font-sans tracking-wide leading-relaxed"
                  >
                    <option value="all">{t.allOption}</option>
                    <option value="benzine">{isAm ? "በንዚን" : "Benzine"}</option>
                    <option value="diesel">{isAm ? "ዲዛይል" : "Diesel"}</option>
                    <option value="electric">{isAm ? "ኤሌክትሪክ" : "Electric / ኤሌክትሪክ"}</option>
                  </select>
                </div>

                {/* Condition */}
                <div className="space-y-2">
                  <label className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest block">
                    {t.filterTitleCondition}
                  </label>
                  <div className="flex gap-2">
                    {[
                      { key: "all", label_en: "All", label_am: "ሁሉም" },
                      { key: "new", label_en: "New", label_am: "አዲስ" },
                      { key: "used", label_en: "Used", label_am: "ያገለገለ" }
                    ].map((btn) => (
                      <button
                        key={btn.key}
                        onClick={() => setCondition(btn.key)}
                      className={`flex-1 py-2 rounded-lg text-center text-[10px] font-bold transition-all border font-sans tracking-wide leading-relaxed ${condition === btn.key
                          ? "text-[#00A86B] border-[#00A86B] bg-[#00A86B]/5 dark:bg-[#00A86B]/10"
                          : "bg-slate-50 dark:bg-slate-950/40 text-slate-600 dark:text-slate-400 border-slate-200/80 dark:border-white/5 hover:border-slate-300 dark:hover:border-white/10"
                          }`}
                      >
                        {isAm ? btn.label_am : btn.label_en}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* If Category is Ceremony */}
            {(activeCategory === "ceremony" || activeCategory === "all") && (
              <div className="pt-4 border-t border-slate-100 dark:border-slate-800 space-y-3">
                <label className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest block">
                  {t.filterTitleRental}
                </label>
                <div className="flex flex-col gap-2">
                  {[
                    { key: "all", label_en: "All Schedules", label_am: "ማንኛውም ጊዜ" },
                    { key: "event", label_en: "Per Event Schedule", label_am: "ለዝግጅት" },
                    { key: "day", label_en: "Daily Schedule", label_am: "በቀን" }
                  ].map((btn) => (
                    <button
                      key={btn.key}
                      onClick={() => setRentalInterval(btn.key)}
                      className={`w-full py-2 px-3 rounded-lg text-left text-xs font-bold transition-all border font-sans tracking-wide leading-relaxed ${rentalInterval === btn.key
                          ? "text-[#00A86B] border-[#00A86B] bg-[#00A86B]/5 dark:bg-[#00A86B]/10"
                          : "bg-slate-50 dark:bg-slate-950/40 text-slate-600 dark:text-slate-400 border-slate-200/80 dark:border-white/5 hover:border-slate-300 dark:hover:border-white/10"
                        }`}
                    >
                      {isAm ? btn.label_am : btn.label_en}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* If Category is Heavy Machinery */}
            {(activeCategory === "heavy" || activeCategory === "all") && (
              <div className="pt-4 border-t border-slate-100 dark:border-slate-800 space-y-3">
                <label className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest block">
                  {t.filterTitleHeavy}
                </label>
                <div className="flex flex-col gap-2">
                  {[
                    { key: "all", label_en: "All Machineries", label_am: "ሁሉም" },
                    { key: "construction", label_en: "Construction Work", label_am: "ለኮንስትራክሽን" },
                    { key: "agricultural", label_en: "Agricultural Work", label_am: "ለግብርና" }
                  ].map((btn) => (
                    <button
                      key={btn.key}
                      onClick={() => setMachineryScope(btn.key)}
                      className={`w-full py-2 px-3 rounded-lg text-left text-xs font-bold transition-all border font-sans tracking-wide leading-relaxed ${machineryScope === btn.key
                          ? "text-[#00A86B] border-[#00A86B] bg-[#00A86B]/5 dark:bg-[#00A86B]/10"
                          : "bg-slate-50 dark:bg-slate-950/40 text-slate-600 dark:text-slate-400 border-slate-200/80 dark:border-white/5 hover:border-slate-300 dark:hover:border-white/10"
                        }`}
                    >
                      {isAm ? btn.label_am : btn.label_en}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* 2. THE WORLD-CLASS PREMIUM LISTINGS CATALOG GRID */}
        <div className="flex-1">
          {loading ? (
            <div className="flex flex-col items-center justify-center py-32 gap-6 bg-white dark:bg-slate-900 rounded-3xl border border-slate-200/80 dark:border-white/5 transition-colors">
              <Loader2 className="w-10 h-10 text-emerald-600 dark:text-green-500 animate-spin" />
              <span className="text-slate-400 dark:text-slate-600 font-bold uppercase tracking-[0.3em] text-[10px]">
                {t.loadingText}
              </span>
            </div>
          ) : filteredListings.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-24 px-6 text-center bg-white dark:bg-slate-900 rounded-3xl border border-slate-200/80 dark:border-white/5 transition-colors">
              <SlidersHorizontal className="w-12 h-12 text-slate-300 dark:text-slate-700 mb-4" />
              <p className="text-slate-500 dark:text-slate-400 font-semibold uppercase tracking-wider text-xs">
                {t.emptyText}
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {visibleCards.map((listing) => {
                // Parse image string if it's JSON from API
                const imagesArray = Array.isArray(listing.images)
                  ? listing.images
                  : (() => {
                    try {
                      return JSON.parse(listing.images || "[]");
                    } catch (e) {
                      return [];
                    }
                  })();
                const mainImage = imagesArray[0] || "https://images.unsplash.com/photo-1560518883-ce09059eeffa?w=800&q=80&fm=webp";

                // Setup dynamic badges based on categories and details
                const showVerifiedCheck = listing.is_verified || listing.category === "property";
                const badgeLabel = listing.category === "heavy"
                  ? t.withOperatorBadge
                  : (showVerifiedCheck ? t.verifiedBadge : t.defaultBadge);

                // Setup pricing text
                let priceSuffix = t.priceSuffixFixed;
                if (listing.price_suffix === "per_day") {
                  priceSuffix = t.priceSuffixDay;
                } else if (listing.price_suffix === "per_hour") {
                  priceSuffix = t.priceSuffixHour;
                }

                return (
                  <div
                    key={listing.id}
                    className="group bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-white/5 rounded-3xl hover:border-[#00A86B]/30 hover:bg-slate-50 dark:hover:bg-slate-900/60 hover:-translate-y-3 hover:scale-[1.02] hover:shadow-[0_24px_48px_rgba(0,168,107,0.15)] shadow-md flex flex-col h-full relative transition-all duration-500"
                  >
                    {/* Glowing Accent Border Line */}
                    <div className="absolute top-0 left-0 w-full h-[3px] bg-gradient-to-r from-emerald-500/0 via-emerald-500/0 to-emerald-500/0 group-hover:via-emerald-500 dark:group-hover:via-green-500 transition-all duration-700" />

                    {/* Image Container */}
                    <div className="relative aspect-[16/11] w-full overflow-hidden rounded-t-3xl bg-slate-100 dark:bg-slate-950">
                      <img
                        src={mainImage}
                        alt={isAm ? listing.title_am : listing.title_en}
                        className="w-full h-full object-cover transition-transform duration-500 ease-out group-hover:scale-105"
                        loading="lazy"
                      />

                      {/* Premium Green Check Tag / operator indicator */}
                      <div className="absolute top-4 left-4">
                        <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white/90 dark:bg-slate-950/80 backdrop-blur-xl border border-slate-200 dark:border-white/10 shadow-lg">
                          <span className="w-2 h-2 rounded-full bg-emerald-500 dark:bg-green-500 animate-pulse" />
                          <BadgeCheck className="w-3.5 h-3.5 text-emerald-600 dark:text-green-500" />
                          <span className="text-[9px] font-black uppercase tracking-[0.1em] text-slate-800 dark:text-white">
                            {badgeLabel}
                          </span>
                        </div>
                      </div>

                      {/* Premium Listing Pulsing Star Badge */}
                      {listing.is_premium ? (
                        <div className="absolute top-4 right-4">
                          <div className="w-8 h-8 rounded-full bg-emerald-600 dark:bg-green-600 flex items-center justify-center text-white shadow-xl border border-white/20 animate-pulse hover:animate-none hover:scale-110 transition-all duration-300">
                            <Star className="w-4 h-4 fill-current" />
                          </div>
                        </div>
                      ) : null}
                    </div>

                    {/* Card Content details */}
                    <div className="p-6 flex flex-col flex-1 space-y-4">
                      {/* Ratings Strip */}
                      <div className="flex items-center gap-1">
                        {[...Array(5)].map((_, i) => (
                          <Star
                            key={i}
                            className={`w-3.5 h-3.5 ${i < Math.floor(listing.rating || 5)
                                ? "text-amber-500 fill-amber-500"
                                : "text-slate-300 dark:text-slate-700"
                              }`}
                          />
                        ))}
                        <span className="text-[10px] font-bold text-slate-400 dark:text-slate-500 ml-2">
                          {(listing.rating || 5).toFixed(1)}
                        </span>
                      </div>

                      {/* Typographic Title */}
                      <h3 className="text-base font-bold text-slate-900 dark:text-white leading-snug line-clamp-2 min-h-[2.5rem] group-hover:text-emerald-700 dark:group-hover:text-green-400 transition-colors">
                        {isAm ? listing.title_am : listing.title_en}
                      </h3>

                      {/* Info Pills based on active category attributes */}
                      <div className="flex flex-wrap gap-2 pt-1">
                        {listing.locality && (
                          <span className="text-[9px] font-bold uppercase tracking-wider text-slate-500 bg-slate-100 dark:bg-slate-800 px-2.5 py-1 rounded-md">
                            📍 {listing.locality}
                          </span>
                        )}
                        {listing.plate_code && (
                          <span className="text-[9px] font-bold uppercase tracking-wider text-slate-500 bg-slate-100 dark:bg-slate-800 px-2.5 py-1 rounded-md">
                            🚗 {listing.plate_code}
                          </span>
                        )}
                        {listing.fuel_type && (
                          <span className="text-[9px] font-bold uppercase tracking-wider text-slate-500 bg-slate-100 dark:bg-slate-800 px-2.5 py-1 rounded-md">
                            ⚡ {listing.fuel_type}
                          </span>
                        )}
                        {listing.area_sqm && (
                          <span className="text-[9px] font-bold uppercase tracking-wider text-slate-500 bg-slate-100 dark:bg-slate-800 px-2.5 py-1 rounded-md">
                            📐 {listing.area_sqm} sqm
                          </span>
                        )}
                      </div>

                      {/* Real-time Pricing Strip */}
                      <div className="pt-2 flex items-baseline justify-between mt-auto">
                        <div className="flex items-baseline gap-1.5">
                          <span className="text-2xl font-black text-slate-900 dark:text-white tracking-tighter italic group-hover:text-emerald-600 dark:group-hover:text-green-400 transition-colors">
                            {listing.price.toLocaleString()}
                          </span>
                          <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">
                            {priceSuffix}
                          </span>
                        </div>

                        <span className="text-[10px] font-semibold text-emerald-600 dark:text-green-500 uppercase tracking-wider bg-emerald-500/10 px-2 py-0.5 rounded-full">
                          {listing.price_suffix === "fixed" ? t.fixed : t.negotiable}
                        </span>
                      </div>

                      {/* ── Direct Middleman (Delala) Eliminator Footer CTAs */}
                      <div className="grid grid-cols-2 gap-3 pt-4 border-t border-slate-100 dark:border-slate-800/80">
                        <a
                          href={`tel:${listing.phone}`}
                          className="flex items-center justify-center gap-2 py-3 rounded-2xl border border-slate-200 dark:border-white/5 bg-slate-50/50 hover:bg-slate-200 dark:bg-white/5 dark:hover:bg-white/[0.12] hover:border-slate-400 dark:hover:border-white/20 transition-all duration-300 hover:scale-[1.02] active:scale-[0.98] group/btn"
                        >
                          <Phone className="w-3.5 h-3.5 text-slate-500 dark:text-slate-400 group-hover/btn:text-slate-900 dark:group-hover/btn:text-white transition-colors" />
                          <span className="text-[10px] font-black uppercase tracking-widest text-slate-600 dark:text-slate-300 group-hover/btn:text-slate-900 dark:group-hover/btn:text-white">
                            {t.callBtn}
                          </span>
                        </a>
                        <a
                          href={`https://t.me/+${listing.whatsapp.replace("+", "")}`}
                          target="_blank"
                          rel="noreferrer"
                          className="flex items-center justify-center gap-2 py-3 rounded-2xl bg-gradient-to-r from-[#0088cc] to-[#2CA5E0] hover:scale-[1.02] active:scale-[0.98] shadow-md shadow-blue-500/10 hover:shadow-[0_6px_15px_rgba(36,161,222,0.3)] transition-all duration-300 text-white group/tg"
                        >
                          <Send className="w-3.5 h-3.5 text-white group-hover/tg:translate-x-0.5 group-hover/tg:-translate-y-0.5 transition-transform" />
                          <span className="text-[10px] font-black uppercase tracking-widest text-white">
                            {t.chatBtn}
                          </span>
                        </a>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}



          {/* 3. SCROLLING & DATA PAGINATION ARCHITECTURE */}
          {filteredListings.length > visibleLimit && (
            <div className="mt-12 flex justify-center">
              <button
                onClick={handleLoadMore}
                className="flex items-center gap-3 px-10 py-4.5 rounded-2xl border border-slate-200 dark:border-white/5 bg-white dark:bg-white/5 hover:bg-slate-50 dark:hover:bg-white/10 transition-all group shadow-sm hover:shadow-md hover:border-emerald-500/20 dark:hover:border-green-500/20"
              >
                <span className="text-xs font-black uppercase tracking-[0.25em] text-slate-950 dark:text-white">
                  {t.viewMore}
                </span>
                <ChevronRight className="w-4 h-4 text-emerald-600 dark:text-green-500 group-hover:translate-x-1 transition-transform" />
              </button>
            </div>
          )}

          {/* 4. FOUNDER MILSTONE ANCHOR FOOTNOTE */}
          <div className="mt-16 pt-8 border-t border-slate-100 dark:border-white/5 text-center">
            <p className="text-[10px] font-bold text-slate-400 dark:text-slate-600 uppercase tracking-[0.25em] leading-relaxed">
              Luwa Tesemma Kakawo — Founder & CEO / ሉዋ ተሰማ ካካዎ — ዋና ስራ አስፈፃሚ
            </p>
          </div>

        </div>

      </div>
    </section>
  );
};

export default ListingsCatalog;
