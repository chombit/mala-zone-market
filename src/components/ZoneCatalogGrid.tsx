/**
 * ZoneCatalogGrid.tsx
 * Malazone.com — Premium Listings Catalog Grid
 * © 2026 Malazone Technologies PLC
 */

import React, { useState, useMemo } from "react";
import {
  Phone,
  Send,
  MapPin,
  Star,
  CheckCircle2,
  Sparkles,
  Zap,
  FileText,
  Ruler,
  Settings,
  Key,
  Building2,
  ChevronRight,
} from "lucide-react";
import { useLanguage } from "@/contexts/ZoneLanguageContext";
import type { ActiveZone } from "./ZoneFilterSidebar";
import type { FilterState } from "./ZoneFilterSidebar";

/* ────────────────────────────────────────────
   Listing Data Model
   ──────────────────────────────────────────── */
interface ListingItem {
  id: string;
  titleEn: string;
  titleAm: string;
  price: number;
  priceSuffixKey: string;
  priceTagKey: string;
  image: string;
  zone: ActiveZone;
  locationKey: string;
  locationTag: string;
  rating: number;
  isVerified: boolean;
  isPremium: boolean;
  badgeKey: string;
  /* Car-specific */
  plateCode?: string;
  fuelType?: string;
  fuelTag?: string;
  condition?: string;
  /* House-specific */
  titleDeed?: string;
  sqm?: number;
  bedrooms?: number;
  bathrooms?: number;
  /* Machinery-specific */
  billingTrack?: string;
  phone: string;
  whatsapp: string;
}

/* ────────────────────────────────────────────
   Mock Inventory Data
   ──────────────────────────────────────────── */
const listings: ListingItem[] = [
  {
    id: "car-001",
    titleEn: "Toyota Vitz 2018 - Excellent Condition",
    titleAm: "ቶዮታ ቪትዝ 2018 - ምርጥ ሁኔታ",
    price: 1250000,
    priceSuffixKey: "price.etb",
    priceTagKey: "price.negotiable",
    image: "https://images.unsplash.com/photo-1549317661-bd32c8ce0db2?auto=format&fit=crop&q=80&w=800",
    zone: "car",
    locationKey: "loc.hawassa",
    locationTag: "PIASSA",
    rating: 4.9,
    isVerified: true,
    isPremium: false,
    badgeKey: "badge.verifiedCarta",
    plateCode: "CODE 2",
    fuelType: "Benzine",
    fuelTag: "BENZINE",
    condition: "Excellent",
    phone: "+251911000001",
    whatsapp: "251911000001",
  },
  {
    id: "house-001",
    titleEn: "Modern Lakefront Villa with Lake View",
    titleAm: "ዘመናዊ ቪላ በሐዋሳ ሐይቅ ዳርቻ",
    price: 15000000,
    priceSuffixKey: "price.etb",
    priceTagKey: "price.negotiable",
    image: "https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?auto=format&fit=crop&q=80&w=800",
    zone: "house",
    locationKey: "loc.hawassa",
    locationTag: "LAKEFRONT",
    rating: 5.0,
    isVerified: true,
    isPremium: true,
    badgeKey: "badge.verifiedCarta",
    titleDeed: "Verified Carta",
    sqm: 450,
    phone: "+251911000002",
    whatsapp: "251911000002",
  },
  {
    id: "car-002",
    titleEn: "Excavator for Rent - Per Hour",
    titleAm: "ኤክስካቫተር ለኪራይ - በሰዓት",
    price: 2500,
    priceSuffixKey: "price.hour",
    priceTagKey: "price.fixed",
    image: "https://images.unsplash.com/photo-1541888081628-91219b12e3e5?auto=format&fit=crop&q=80&w=800",
    zone: "machinery",
    locationKey: "loc.bensa",
    locationTag: "PIASSA",
    rating: 4.8,
    isVerified: true,
    isPremium: false,
    badgeKey: "badge.withOperator",
    billingTrack: "ETB / Hour",
    phone: "+251911000003",
    whatsapp: "251911000003",
  },
  {
    id: "house-002",
    titleEn: "Commercial Plot with Carta - Piassa",
    titleAm: "ቆንጆ የቢተሰብ ቪላ በሐዋሳ ፒያሳ",
    price: 12500000,
    priceSuffixKey: "price.etb",
    priceTagKey: "price.negotiable",
    image: "https://images.unsplash.com/photo-1560518883-ce09059eeffa?auto=format&fit=crop&q=80&w=800",
    zone: "house",
    locationKey: "loc.hawassa",
    locationTag: "PIASSA",
    rating: 4.4,
    isVerified: true,
    isPremium: true,
    badgeKey: "badge.verifiedCarta",
    titleDeed: "Verified Carta",
    sqm: 300,
    phone: "+251911000004",
    whatsapp: "251911000004",
  },
  {
    id: "car-003",
    titleEn: "Toyota RAV4 2022 Hybrid - Brand New",
    titleAm: "ቶዮታ RAV4 2022 ሃይብሪድ - አዲስ ዜሮ",
    price: 6400000,
    priceSuffixKey: "price.etb",
    priceTagKey: "price.fixed",
    image: "https://images.unsplash.com/photo-1633477189729-9290b3261d0a?auto=format&fit=crop&q=80&w=800",
    zone: "car",
    locationKey: "loc.hawassa",
    locationTag: "PIASSA",
    rating: 4.9,
    isVerified: true,
    isPremium: true,
    badgeKey: "badge.zeroKm",
    plateCode: "CODE 2",
    fuelType: "Hybrid / Electric",
    fuelTag: "ELECTRIC",
    condition: "Zero Mileage",
    phone: "+251911000005",
    whatsapp: "251911000005",
  },
  {
    id: "cer-001",
    titleEn: "Luxury Wedding Hall (1000 Pax)",
    titleAm: "ዘመናዊ የሰርግ አዳራሽ (1000 ሰው)",
    price: 45000,
    priceSuffixKey: "price.day",
    priceTagKey: "price.fixed",
    image: "https://images.unsplash.com/photo-1519167758481-83f550bb49b3?auto=format&fit=crop&q=80&w=800",
    zone: "ceremony",
    locationKey: "loc.yirgalem",
    locationTag: "TABOR",
    rating: 4.7,
    isVerified: true,
    isPremium: true,
    badgeKey: "badge.verified",
    phone: "+251911000006",
    whatsapp: "251911000006",
  },
  {
    id: "house-003",
    titleEn: "Lake View Land - 500 Sqm with Carta",
    titleAm: "ሰፊ መሬት በሐዋሳ ታቦር - ለንግድም ሆነ ለኑሮ የሚሆን",
    price: 8500000,
    priceSuffixKey: "price.etb",
    priceTagKey: "price.negotiable",
    image: "https://images.unsplash.com/photo-1564013799919-ab600027ffc6?auto=format&fit=crop&q=80&w=800",
    zone: "house",
    locationKey: "loc.hawassa",
    locationTag: "TABOR",
    rating: 4.8,
    isVerified: true,
    isPremium: false,
    badgeKey: "badge.verifiedCarta",
    titleDeed: "Verified Carta",
    sqm: 500,
    phone: "+251911000007",
    whatsapp: "251911000007",
  },
  {
    id: "car-004",
    titleEn: "Suzuki Dzire 2021 - Locally Used, Fuel Efficient",
    titleAm: "ሱዙኪ ድዛየር 2021 - ያገር ውስጥ ነዳጅ ቆጣቢ",
    price: 2100000,
    priceSuffixKey: "price.etb",
    priceTagKey: "price.fixed",
    image: "https://images.unsplash.com/photo-1503376780353-7e6692767b70?auto=format&fit=crop&q=80&w=800",
    zone: "car",
    locationKey: "loc.chuko",
    locationTag: "CHUKO",
    rating: 4.5,
    isVerified: false,
    isPremium: false,
    badgeKey: "badge.verified",
    plateCode: "CODE 3",
    fuelType: "Benzine",
    fuelTag: "BENZINE",
    condition: "Locally Used",
    phone: "+251911000008",
    whatsapp: "251911000008",
  },
  {
    id: "car-005",
    titleEn: "Hyundai Elantra 2023 EV - Zero Mileage",
    titleAm: "ሂዩንዳይ ኤላንትራ 2023 ኤሌክትሪክ - አዲስ ዜሮ",
    price: 4900000,
    priceSuffixKey: "price.etb",
    priceTagKey: "price.fixed",
    image: "https://images.unsplash.com/photo-1580273916550-e323be2ae537?auto=format&fit=crop&q=80&w=800",
    zone: "car",
    locationKey: "loc.hawassa",
    locationTag: "PIASSA",
    rating: 4.8,
    isVerified: true,
    isPremium: true,
    badgeKey: "badge.zeroKm",
    plateCode: "CODE 2",
    fuelType: "Electric",
    fuelTag: "ELECTRIC",
    condition: "Zero Mileage",
    phone: "+251911000009",
    whatsapp: "251911000009",
  },
  {
    id: "heavy-001",
    titleEn: "Dozer D8R - Available for Construction Work",
    titleAm: "ዶዘር D8R - ለኮንስትራክሽን ስራ የሚሆን",
    price: 3500,
    priceSuffixKey: "price.hour",
    priceTagKey: "price.fixed",
    image: "https://images.unsplash.com/photo-1504917595217-d4dc5ebe6122?auto=format&fit=crop&q=80&w=800",
    zone: "machinery",
    locationKey: "loc.aleta",
    locationTag: "ALETA WONDO",
    rating: 4.6,
    isVerified: true,
    isPremium: false,
    badgeKey: "badge.withOperator",
    billingTrack: "ETB / Hour",
    phone: "+251911000010",
    whatsapp: "251911000010",
  },
  {
    id: "cer-002",
    titleEn: "Full DJ Gear & Sound System for Weddings",
    titleAm: "የዲጄ እቃዎች እና የድምፅ ሲስተም ለሰርግ",
    price: 15000,
    priceSuffixKey: "price.day",
    priceTagKey: "price.negotiable",
    image: "https://images.unsplash.com/photo-1470225620780-dba8ba36b745?auto=format&fit=crop&q=80&w=800",
    zone: "ceremony",
    locationKey: "loc.hawassa",
    locationTag: "LAKEFRONT",
    rating: 4.8,
    isVerified: true,
    isPremium: false,
    badgeKey: "badge.verified",
    phone: "+251911000011",
    whatsapp: "251911000011",
  },
];

/* ────────────────────────────────────────────
   Props
   ──────────────────────────────────────────── */
interface ZoneCatalogGridProps {
  activeZone: ActiveZone;
  filters: FilterState;
}

/* ────────────────────────────────────────────
   Star Renderer
   ──────────────────────────────────────────── */
const StarRating: React.FC<{ rating: number }> = ({ rating }) => {
  const fullStars = Math.floor(rating);
  const hasHalf = rating - fullStars >= 0.3;
  return (
    <div className="flex items-center gap-0.5">
      {Array.from({ length: 5 }, (_, i) => (
        <Star
          key={i}
          className={`w-3.5 h-3.5 ${i < fullStars
            ? "text-amber-500 fill-amber-500"
            : i === fullStars && hasHalf
              ? "text-amber-500 fill-amber-500/50"
              : "text-slate-300 dark:text-slate-600"
            }`}
        />
      ))}
      <span className="text-xs font-semibold text-slate-500 dark:text-slate-400 ml-1">
        {rating}
      </span>
    </div>
  );
};

/* ────────────────────────────────────────────
   Component
   ──────────────────────────────────────────── */
const ZoneCatalogGrid: React.FC<ZoneCatalogGridProps> = ({
  activeZone,
  filters,
}) => {
  const { language, t } = useLanguage();
  const [visibleCount, setVisibleCount] = useState(6);

  /* ── Filter Logic ── */
  const filtered = useMemo(() => {
    return listings.filter((item) => {
      // 1. Zone/Category Filter
      if (activeZone !== "all" && item.zone !== activeZone) return false;

      // 2. Keyword Search
      if (filters.search) {
        const s = filters.search.toLowerCase();
        const inTitleEn = item.titleEn.toLowerCase().includes(s);
        const inTitleAm = item.titleAm.toLowerCase().includes(s);
        if (!inTitleEn && !inTitleAm) return false;
      }

      // 3. Region Filter
      if (filters.region && item.locationKey && !item.locationKey.toLowerCase().includes(filters.region.toLowerCase())) {
        // Simple mapping: sidama region includes hawassa, bensa, yirgalem, chuko, aleta
        const sidamaLocs = ["hawassa", "bensa", "yirgalem", "chuko", "aleta"];
        const isSidama = sidamaLocs.some(loc => item.locationKey.toLowerCase().includes(loc));
        if (filters.region === "sidama" && !isSidama) return false;
        if (filters.region === "addis" && !item.locationKey.toLowerCase().includes("addis")) return false;
      }

      // 3. City/Locality Filter
      if (filters.city) {
        const c = filters.city.toLowerCase();
        const inTag = item.locationTag.toLowerCase().includes(c);
        const inKey = item.locationKey.toLowerCase().includes(c);
        if (!inTag && !inKey) return false;
      }

      // 4. Intent Filter
      if (filters.intent) {
        if (filters.intent === "buy" && item.priceSuffixKey !== "price.etb") return false;
        if (filters.intent === "rent" && item.priceSuffixKey === "price.etb") return false;
        if (filters.intent === "hourly" && item.priceSuffixKey !== "price.hour") return false;
      }

      // 5. Car Specific Filters
      if (item.zone === "car") {
        if (filters.plateCode && item.plateCode && !item.plateCode.toLowerCase().replace(/\s/g, "").includes(filters.plateCode.toLowerCase())) return false;
        if (filters.fuelType && item.fuelTag && item.fuelTag.toLowerCase() !== filters.fuelType.toLowerCase()) return false;
        if (filters.condition && item.condition && !item.condition.toLowerCase().includes(filters.condition.toLowerCase())) return false;
      }

      // 6. House Specific Filters
      if (item.zone === "house") {
        if (filters.titleDeed && item.titleDeed && !item.titleDeed.toLowerCase().includes(filters.titleDeed.toLowerCase())) return false;
        if (filters.sqm) {
          const s = item.sqm || 0;
          if (filters.sqm === "small" && s >= 200) return false;
          if (filters.sqm === "medium" && (s < 200 || s > 500)) return false;
          if (filters.sqm === "large" && s <= 500) return false;
        }
      }

      return true;
    });
  }, [activeZone, filters]);

  const visibleListings = filtered.slice(0, visibleCount);
  const hasMore = visibleCount < filtered.length;

  /* ── Heading Key ── */
  const headingKey = `grid.heading.${activeZone}` as any;

  const formatPrice = (n: number) => n.toLocaleString();

  return (
    <section className="flex-1 min-w-0">
      {/* ── Section Heading ── */}
      <div className="mb-8">
        <h2 className="text-2xl md:text-3xl font-extrabold tracking-tight">
          <span className="bg-clip-text text-transparent bg-gradient-to-b from-slate-900 to-slate-600 dark:from-white dark:to-slate-400">
            {t(headingKey)}
          </span>
        </h2>
        <div className="mt-2.5 h-1 w-20 rounded-full bg-gradient-to-r from-green-500 to-emerald-600" />
      </div>

      {/* ── Card Grid ── */}
      {filtered.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {visibleListings.map((item) => (
            <article
              key={item.id}
              className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-white/5 rounded-2xl overflow-hidden group hover:shadow-xl hover:shadow-green-900/5 dark:hover:shadow-green-500/5 hover:border-green-500/20 transition-all duration-300 flex flex-col"
            >
              {/* ── Image Container ── */}
              <div className="relative h-52 overflow-hidden">
                <img
                  src={item.image}
                  alt={language === "amharic" ? item.titleAm : item.titleEn}
                  loading="lazy"
                  crossOrigin="anonymous"
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent" />

                {/* Glassmorphic Status Badge */}
                <div className="absolute top-3 left-3 flex items-center gap-1.5 bg-white/20 dark:bg-black/30 backdrop-blur-md border border-white/20 rounded-lg px-2.5 py-1.5">
                  <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
                  <CheckCircle2 className="w-3 h-3 text-white" />
                  <span className="text-[11px] font-semibold text-white tracking-wide">
                    {t(item.badgeKey as any)}
                  </span>
                </div>

                {/* Premium Star */}
                {item.isPremium && (
                  <div className="absolute top-3 right-3 w-8 h-8 rounded-lg bg-amber-500 flex items-center justify-center shadow-lg">
                    <Sparkles className="w-4 h-4 text-white" />
                  </div>
                )}
              </div>

              {/* ── Card Body ── */}
              <div className="p-5 flex flex-col flex-grow">
                {/* Star Rating */}
                <div className="mb-2">
                  <StarRating rating={item.rating} />
                </div>

                {/* Title */}
                <h3 className="text-[15px] font-bold text-slate-900 dark:text-white leading-snug mb-3 line-clamp-2 group-hover:text-green-600 dark:group-hover:text-green-400 transition-colors">
                  {language === "amharic" ? item.titleAm : item.titleEn}
                </h3>

                {/* Info Micro-Pills */}
                <div className="flex flex-wrap gap-1.5 mb-4">
                  {/* Location pill */}
                  <span className="inline-flex items-center gap-1 bg-slate-100 dark:bg-slate-800 border border-slate-200/50 dark:border-white/5 rounded-md px-2 py-1 text-[10px] font-bold text-slate-600 dark:text-slate-400 uppercase tracking-wider">
                    <MapPin className="w-3 h-3 text-red-500" />
                    {item.locationTag}
                  </span>

                  {/* Car-specific pills */}
                  {item.zone === "car" && item.plateCode && (
                    <span className="inline-flex items-center gap-1 bg-slate-100 dark:bg-slate-800 border border-slate-200/50 dark:border-white/5 rounded-md px-2 py-1 text-[10px] font-bold text-slate-600 dark:text-slate-400 uppercase tracking-wider">
                      <FileText className="w-3 h-3 text-amber-500" />
                      {item.plateCode}
                    </span>
                  )}
                  {item.zone === "car" && item.fuelTag && (
                    <span className="inline-flex items-center gap-1 bg-slate-100 dark:bg-slate-800 border border-slate-200/50 dark:border-white/5 rounded-md px-2 py-1 text-[10px] font-bold text-slate-600 dark:text-slate-400 uppercase tracking-wider">
                      <Zap className="w-3 h-3 text-green-500" />
                      {item.fuelTag}
                    </span>
                  )}

                  {/* House-specific pills */}
                  {item.zone === "house" && item.sqm && (
                    <span className="inline-flex items-center gap-1 bg-slate-100 dark:bg-slate-800 border border-slate-200/50 dark:border-white/5 rounded-md px-2 py-1 text-[10px] font-bold text-slate-600 dark:text-slate-400 uppercase tracking-wider">
                      <Ruler className="w-3 h-3 text-blue-500" />
                      {item.sqm} SQM
                    </span>
                  )}
                </div>

                {/* Zone-Specific Data Rows */}
                {item.zone === "car" && (
                  <div className="grid grid-cols-3 gap-2 mb-4">
                    <div className="bg-slate-50 dark:bg-slate-950/50 rounded-lg p-2 border border-slate-100 dark:border-white/5 text-center">
                      <p className="text-[9px] text-slate-400 uppercase mb-0.5">{t("label.plateCode")}</p>
                      <p className="text-xs font-bold text-slate-700 dark:text-slate-300">{item.plateCode}</p>
                    </div>
                    <div className="bg-slate-50 dark:bg-slate-950/50 rounded-lg p-2 border border-slate-100 dark:border-white/5 text-center">
                      <p className="text-[9px] text-slate-400 uppercase mb-0.5">{t("label.fuel")}</p>
                      <p className="text-xs font-bold text-slate-700 dark:text-slate-300">{item.fuelType}</p>
                    </div>
                    <div className="bg-slate-50 dark:bg-slate-950/50 rounded-lg p-2 border border-slate-100 dark:border-white/5 text-center">
                      <p className="text-[9px] text-slate-400 uppercase mb-0.5">{t("label.condition")}</p>
                      <p className="text-xs font-bold text-slate-700 dark:text-slate-300">{item.condition}</p>
                    </div>
                  </div>
                )}

                {item.zone === "house" && (
                  <div className="grid grid-cols-2 gap-2 mb-4">
                    <div className="bg-slate-50 dark:bg-slate-950/50 rounded-lg p-2.5 border border-slate-100 dark:border-white/5 flex items-center gap-2">
                      <Key className="w-4 h-4 text-amber-500" />
                      <div>
                        <p className="text-[9px] text-slate-400 uppercase">{t("label.titleDeed")}</p>
                        <p className="text-xs font-bold text-slate-700 dark:text-slate-300 capitalize">{item.titleDeed}</p>
                      </div>
                    </div>
                    <div className="bg-slate-50 dark:bg-slate-950/50 rounded-lg p-2.5 border border-slate-100 dark:border-white/5 flex items-center gap-2">
                      <Ruler className="w-4 h-4 text-green-500" />
                      <div>
                        <p className="text-[9px] text-slate-400 uppercase">{t("label.sqm")}</p>
                        <p className="text-xs font-bold text-slate-700 dark:text-slate-300">{item.sqm} Sqm</p>
                      </div>
                    </div>
                    {item.bedrooms && (
                      <div className="bg-slate-50 dark:bg-slate-950/50 rounded-lg p-2.5 border border-slate-100 dark:border-white/5 flex items-center gap-2">
                        <Building2 className="w-4 h-4 text-blue-500" />
                        <div>
                          <p className="text-[9px] text-slate-400 uppercase">Bedrooms</p>
                          <p className="text-xs font-bold text-slate-700 dark:text-slate-300">{item.bedrooms}</p>
                        </div>
                      </div>
                    )}
                    {item.bathrooms && (
                      <div className="bg-slate-50 dark:bg-slate-950/50 rounded-lg p-2.5 border border-slate-100 dark:border-white/5 flex items-center gap-2">
                        <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                        <div>
                          <p className="text-[9px] text-slate-400 uppercase">Bathrooms</p>
                          <p className="text-xs font-bold text-slate-700 dark:text-slate-300">{item.bathrooms}</p>
                        </div>
                      </div>
                    )}
                  </div>
                )}

                {item.zone === "machinery" && (
                  <div className="mb-4">
                    <div className="bg-slate-50 dark:bg-slate-950/50 rounded-lg p-2.5 border border-slate-100 dark:border-white/5 flex items-center gap-2">
                      <Settings className="w-4 h-4 text-amber-500" />
                      <div>
                        <p className="text-[9px] text-slate-400 uppercase">{t("label.billing")}</p>
                        <p className="text-xs font-bold text-slate-700 dark:text-slate-300">{item.billingTrack}</p>
                      </div>
                    </div>
                  </div>
                )}

                {/* ── Price Block ── */}
                <div className="mt-auto">
                  <div className="flex items-baseline justify-between mb-4">
                    <div>
                      <span className="text-xl font-extrabold text-slate-900 dark:text-white">
                        {formatPrice(item.price)}
                      </span>
                      <span className="text-sm font-medium text-slate-500 dark:text-slate-400 ml-1.5">
                        {t(item.priceSuffixKey as any)}
                      </span>
                    </div>
                    <span className="text-[10px] font-bold text-red-500 dark:text-red-400 uppercase tracking-wider">
                      {t(item.priceTagKey as any)}
                    </span>
                  </div>

                  {/* ── Delala Eliminator Buttons ── */}
                  <div className="flex gap-2.5">
                    <a
                      href={`tel:${item.phone}`}
                      className="flex-1 flex items-center justify-center gap-2 py-3 rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 hover:bg-slate-100 dark:bg-slate-900/50 dark:hover:bg-slate-800/80 backdrop-blur-md text-slate-700 dark:text-slate-200 text-xs sm:text-sm font-black uppercase tracking-wider transition-all duration-300 hover:scale-[1.02] active:scale-[0.98] shadow-sm hover:shadow-md dark:shadow-none"
                    >
                      <Phone className="w-4 h-4 text-slate-500 dark:text-slate-400 transition-colors" />
                      {t("cta.call")}
                    </a>
                    <a
                      href={`https://t.me/+${item.whatsapp.replace("+", "")}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex-1 flex items-center justify-center gap-2 py-3 rounded-2xl bg-gradient-to-r from-[#0088cc] to-[#2CA5E0] hover:scale-[1.02] active:scale-[0.98] text-white text-xs sm:text-sm font-black uppercase tracking-wider transition-all duration-300 shadow-md shadow-blue-500/10 hover:shadow-lg hover:shadow-blue-500/20 group/tg"
                    >
                      <Send className="w-4 h-4 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
                      {t("cta.whatsapp")}
                    </a>
                  </div>
                </div>
              </div>
            </article>
          ))}
        </div>
      ) : (
        /* ── Empty State ── */
        <div className="text-center py-20 bg-slate-50 dark:bg-slate-900/50 border border-slate-200/80 dark:border-white/5 rounded-2xl">
          <p className="text-slate-400 text-lg">{t("grid.empty")}</p>
        </div>
      )}

      {/* ── Load More Button ── */}
      {hasMore && (
        <div className="flex justify-center mt-10">
          <button
            onClick={() => setVisibleCount((p) => p + 6)}
            className="flex items-center gap-2 px-8 py-3 rounded-full border border-slate-300 dark:border-white/10 bg-white dark:bg-slate-900 hover:border-green-500 text-sm font-bold uppercase tracking-widest text-slate-700 dark:text-slate-300 hover:text-green-600 dark:hover:text-green-400 transition-all"
          >
            {t("grid.viewAll")}
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* ── Executive Authority Footnote ── */}
      <div className="mt-16 pt-6 border-t border-slate-200/80 dark:border-white/5 text-center">
        <p className="text-xs font-medium tracking-[0.2em] uppercase text-slate-500 dark:text-slate-500"></p>
      </div>
    </section>
  );
};

export default ZoneCatalogGrid;
