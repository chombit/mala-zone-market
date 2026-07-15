/**
 * ZoneCatalogGrid.tsx
 * Malazone.com — Premium Listings Catalog Grid
 * © 2026 Malazone Technologies PLC
 */

import React, { useState, useMemo, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useSocketTracker } from "../hooks/useSocketTracker";
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
  ChevronLeft,
  ChevronRight,
  Heart,
  Share2,
  Check,
} from "lucide-react";
import { useLanguage } from "@/contexts/ZoneLanguageContext";
import { useScrollReveal, use3DTilt } from "@/hooks/useWorldClassAnimations";
import { useFavorites } from "@/contexts/FavoritesContext";
import type { ActiveZone } from "./ZoneFilterSidebar";
import type { FilterState } from "./ZoneFilterSidebar";

/* ────────────────────────────────────────────
   Listing Data Model
   ──────────────────────────────────────────── */
export interface ListingItem {
  id: string;
  titleEn: string;
  titleAm: string;
  price: number;
  priceSuffixKey: string;
  priceTagKey: string;
  image: string;
  images?: string[];
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
  /* Description */
  descriptionAm?: string;
  descriptionEn?: string;
  isNegotiable?: boolean;
  specLabel?: string;
  specVal?: string;
}

/* ────────────────────────────────────────────
   Mock Inventory Data (Fallback)
   ──────────────────────────────────────────── */
export const FALLBACK_LISTINGS: ListingItem[] = [
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
    id: "house-005",
    titleEn: "Gated Villa - 5 Bedrooms, Private Garden",
    titleAm: "የጋሬ ቪላ - 5 መኝታ ክፍሎች ከጋሬ አትክልት ጋር",
    price: 22000000,
    priceSuffixKey: "price.etb",
    priceTagKey: "price.negotiable",
    image: "https://images.unsplash.com/photo-1512917774080-9991f1c4c750?auto=format&fit=crop&q=80&w=800",
    zone: "house",
    locationKey: "loc.hawassa",
    locationTag: "LAKEFRONT",
    rating: 5.0,
    isVerified: true,
    isPremium: true,
    badgeKey: "badge.verifiedCarta",
    titleDeed: "Verified Carta",
    sqm: 800,
    bedrooms: 5,
    bathrooms: 4,
    phone: "+251911000017",
    whatsapp: "251911000017",
  },
  {
    id: "cer-004",
    titleEn: "Photo & Video Studio - Premium Wedding Coverage",
    titleAm: "ፎቶ እና ቪዲዮ ስቱዲዮ - ለሰርግ ፕሪሚየም ሽፋን",
    price: 35000,
    priceSuffixKey: "price.day",
    priceTagKey: "price.fixed",
    image: "https://images.unsplash.com/photo-1492691527719-9d1e07e534b4?auto=format&fit=crop&q=80&w=800",
    zone: "ceremony",
    locationKey: "loc.hawassa",
    locationTag: "LAKEFRONT",
    rating: 4.9,
    isVerified: true,
    isPremium: true,
    badgeKey: "badge.verified",
    phone: "+251911000020",
    whatsapp: "251911000020",
  },
];

/* ── Map DB listing shape to ListingItem ── */
function mapDbListingToItem(row: any): ListingItem {
  const cat = row.category || "property";
  let zone: ActiveZone = "house";
  if (cat === "motors") zone = "car";
  else if (cat === "stay" || cat === "ceremony") zone = "ceremony";
  else if (cat === "heavy") zone = "machinery";
  else if (cat === "electronics") zone = "car";

  const images: string[] = (() => {
    if (!row.images) return [];
    if (Array.isArray(row.images)) return row.images;
    try { return JSON.parse(row.images); } catch { return []; }
  })();

  return {
    id: String(row.id),
    titleEn: row.title_en || "",
    titleAm: row.title_am || "",
    price: Number(row.price) || 0,
    priceSuffixKey: row.price_suffix === "per_day" ? "price.day" : row.price_suffix === "per_hour" ? "price.hour" : "price.etb",
    priceTagKey: row.is_premium ? "price.fixed" : "price.negotiable",
    image: images[0] || "https://images.unsplash.com/photo-1560518883-ce09059eeffa?w=800&q=80&fm=webp",
    images,
    zone,
    locationKey: row.location_key || "",
    locationTag: (row.location_label_en || "").toUpperCase() || "PIASSA",
    rating: 4.5,
    isVerified: !!row.is_verified,
    isPremium: !!row.is_premium,
    badgeKey: row.is_verified ? "badge.verifiedCarta" : "badge.verified",
    plateCode: row.plate_code || undefined,
    fuelType: row.fuel_type || undefined,
    fuelTag: row.fuel_type ? row.fuel_type.toUpperCase() : undefined,
    condition: row.condition_type || undefined,
    titleDeed: row.title_deed || undefined,
    sqm: row.area_sqm ? Number(row.area_sqm) : undefined,
    bedrooms: row.bedrooms ? Number(row.bedrooms) : undefined,
    bathrooms: row.bathrooms ? Number(row.bathrooms) : undefined,
    billingTrack: zone === "machinery" ? "ETB / Hour" : undefined,
    phone: row.phone || "",
    whatsapp: row.whatsapp || row.phone || "",
    descriptionAm: row.description_am || undefined,
    descriptionEn: row.description_en || undefined,
  };
}

/* ── Fetch Listings from API ── */
function useListings() {
  const [listings, setListings] = useState<ListingItem[]>(FALLBACK_LISTINGS);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    fetch("/api/listings")
      .then(res => res.json())
      .then(data => {
        if (cancelled) return;
        if (data.success && Array.isArray(data.data) && data.data.length > 0) {
          setListings(data.data.map(mapDbListingToItem));
        }
        setLoading(false);
      })
      .catch(() => {
        if (!cancelled) {
          setListings(FALLBACK_LISTINGS);
          setLoading(false);
        }
      });
    return () => { cancelled = true; };
  }, []);

  return { listings, loading, error };
}

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
   Listing Card Component
   ──────────────────────────────────────────── */
const ListingCard: React.FC<{
  item: ListingItem;
  index: number;
  gridVisible: boolean;
}> = ({ item, index, gridVisible }) => {
  const { language, t } = useLanguage();
  const { ref: tiltRef, style: tiltStyle } = use3DTilt(10, 1200);

  const formatPriceLocal = (n: number) => n.toLocaleString();

  return (
    <article
      ref={tiltRef}
      style={{ 
        ...tiltStyle,
        animationDelay: `${index * 0.1}s`,
        opacity: gridVisible ? 1 : 0,
        transform: gridVisible 
          ? tiltStyle.transform 
          : 'translateY(20px)',
        transition: `opacity 0.5s ease-out ${index * 0.1}s, transform 0.5s ease-out ${index * 0.1}s`
      }}
      className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-white/5 rounded-2xl overflow-hidden group hover:border-[#00A86B]/30 hover:bg-slate-50 dark:hover:bg-slate-900/60 hover:-translate-y-4 hover:scale-[1.03] hover:shadow-[0_32px_64px_rgba(0,168,107,0.25)] shadow-md flex flex-col relative transition-all duration-500 ease-out"
    >
      {/* ── Image Container ── */}
      <div className="relative h-52 overflow-hidden">
        <img
          src={item.image}
          alt={language === "amharic" ? item.titleAm : item.titleEn}
          loading="lazy"
          crossOrigin="anonymous"
          className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700 ease-out"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent transition-opacity duration-300 group-hover:opacity-100" />

        {/* Glassmorphic Status Badge */}
        <div className="absolute top-3 left-3 flex items-center gap-1.5 bg-white/25 dark:bg-black/35 backdrop-blur-xl border border-white/30 rounded-xl px-3 py-1.5 group-hover:scale-105 transition-transform duration-300">
          <span className="w-2.5 h-2.5 rounded-full bg-[#00A86B] animate-pulse" />
          <CheckCircle2 className="w-3.5 h-3.5 text-white" />
          <span className="text-[11px] font-semibold text-white tracking-wide">
            {t(item.badgeKey as any)}
          </span>
        </div>

        {/* Premium Star */}
        {item.isPremium && (
          <div className="absolute top-3 right-3 w-9 h-9 rounded-xl bg-gradient-to-br from-amber-400 to-amber-600 flex items-center justify-center shadow-2xl group-hover:scale-110 group-hover:rotate-12 transition-all duration-400">
            <Sparkles className="w-4.5 h-4.5 text-white" />
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
        <h3 className="text-[15px] font-extrabold text-slate-900 dark:text-white leading-snug mb-3 line-clamp-2 group-hover:text-[#00A86B] transition-all duration-300 font-sans tracking-wide">
          {language === "amharic" ? item.titleAm : item.titleEn}
        </h3>

        {/* Info Micro-Pills */}
        <div className="flex flex-wrap gap-1.5 mb-4">
          {/* Location pill */}
          <span className="inline-flex items-center gap-1 bg-slate-100 dark:bg-slate-800 border border-slate-200/50 dark:border-white/5 rounded-lg px-2.5 py-1.5 text-[10px] font-bold text-slate-600 dark:text-slate-400 uppercase tracking-wider group-hover:bg-[#00A86B]/10 group-hover:border-[#00A86B]/20 transition-all duration-300">
            <MapPin className="w-3.5 h-3.5 text-red-500" />
            {item.locationTag}
          </span>

          {/* Car-specific pills */}
          {item.zone === "car" && item.plateCode && (
            <span className="inline-flex items-center gap-1 bg-slate-100 dark:bg-slate-800 border border-slate-200/50 dark:border-white/5 rounded-lg px-2.5 py-1.5 text-[10px] font-bold text-slate-600 dark:text-slate-400 uppercase tracking-wider group-hover:bg-[#00A86B]/10 group-hover:border-[#00A86B]/20 transition-all duration-300">
              <FileText className="w-3.5 h-3.5 text-amber-500" />
              {item.plateCode}
            </span>
          )}
          {item.zone === "car" && item.fuelTag && (
            <span className="inline-flex items-center gap-1 bg-slate-100 dark:bg-slate-800 border border-slate-200/50 dark:border-white/5 rounded-lg px-2.5 py-1.5 text-[10px] font-bold text-slate-600 dark:text-slate-400 uppercase tracking-wider group-hover:bg-[#00A86B]/10 group-hover:border-[#00A86B]/20 transition-all duration-300">
              <Zap className="w-3.5 h-3.5 text-[#00A86B]" />
              {item.fuelTag}
            </span>
          )}

          {/* House-specific pills */}
          {item.zone === "house" && item.sqm && (
            <span className="inline-flex items-center gap-1 bg-slate-100 dark:bg-slate-800 border border-slate-200/50 dark:border-white/5 rounded-lg px-2.5 py-1.5 text-[10px] font-bold text-slate-600 dark:text-slate-400 uppercase tracking-wider group-hover:bg-[#00A86B]/10 group-hover:border-[#00A86B]/20 transition-all duration-300">
              <Ruler className="w-3.5 h-3.5 text-blue-500" />
              {item.sqm} SQM
            </span>
          )}
        </div>

        {/* Zone-Specific Data Rows */}
        {item.zone === "car" && (
          <div className="grid grid-cols-3 gap-2 mb-4">
            <div className="bg-slate-50 dark:bg-slate-950/50 rounded-xl p-2.5 border border-slate-100 dark:border-white/5 text-center group-hover:bg-[#00A86B]/5 group-hover:border-[#00A86B]/20 transition-all duration-300">
              <p className="text-[9px] text-slate-400 uppercase mb-0.5">{t("label.plateCode")}</p>
              <p className="text-xs font-extrabold text-slate-700 dark:text-slate-300">{item.plateCode}</p>
            </div>
            <div className="bg-slate-50 dark:bg-slate-950/50 rounded-xl p-2.5 border border-slate-100 dark:border-white/5 text-center group-hover:bg-[#00A86B]/5 group-hover:border-[#00A86B]/20 transition-all duration-300">
              <p className="text-[9px] text-slate-400 uppercase mb-0.5">{t("label.fuel")}</p>
              <p className="text-xs font-extrabold text-slate-700 dark:text-slate-300">{item.fuelType}</p>
            </div>
            <div className="bg-slate-50 dark:bg-slate-950/50 rounded-xl p-2.5 border border-slate-100 dark:border-white/5 text-center group-hover:bg-[#00A86B]/5 group-hover:border-[#00A86B]/20 transition-all duration-300">
              <p className="text-[9px] text-slate-400 uppercase mb-0.5">{t("label.condition")}</p>
              <p className="text-xs font-extrabold text-slate-700 dark:text-slate-300">{item.condition}</p>
            </div>
          </div>
        )}

        {item.zone === "house" && (
          <div className="grid grid-cols-2 gap-2 mb-4">
            <div className="bg-slate-50 dark:bg-slate-950/50 rounded-xl p-2.5 border border-slate-100 dark:border-white/5 flex items-center gap-2 group-hover:bg-[#00A86B]/5 group-hover:border-[#00A86B]/20 transition-all duration-300">
              <Key className="w-4.5 h-4.5 text-amber-500" />
              <div>
                <p className="text-[9px] text-slate-400 uppercase">{t("label.titleDeed")}</p>
                <p className="text-xs font-extrabold text-slate-700 dark:text-slate-300 capitalize">{item.titleDeed}</p>
              </div>
            </div>
            <div className="bg-slate-50 dark:bg-slate-950/50 rounded-xl p-2.5 border border-slate-100 dark:border-white/5 flex items-center gap-2 group-hover:bg-[#00A86B]/5 group-hover:border-[#00A86B]/20 transition-all duration-300">
              <Ruler className="w-4.5 h-4.5 text-[#00A86B]" />
              <div>
                <p className="text-[9px] text-slate-400 uppercase">{t("label.sqm")}</p>
                <p className="text-xs font-extrabold text-slate-700 dark:text-slate-300">{item.sqm} Sqm</p>
              </div>
            </div>
            {item.bedrooms && (
              <div className="bg-slate-50 dark:bg-slate-950/50 rounded-xl p-2.5 border border-slate-100 dark:border-white/5 flex items-center gap-2 group-hover:bg-[#00A86B]/5 group-hover:border-[#00A86B]/20 transition-all duration-300">
                <Building2 className="w-4.5 h-4.5 text-blue-500" />
                <div>
                  <p className="text-[9px] text-slate-400 uppercase">Bedrooms</p>
                  <p className="text-xs font-extrabold text-slate-700 dark:text-slate-300">{item.bedrooms}</p>
                </div>
              </div>
            )}
            {item.bathrooms && (
              <div className="bg-slate-50 dark:bg-slate-950/50 rounded-xl p-2.5 border border-slate-100 dark:border-white/5 flex items-center gap-2 group-hover:bg-[#00A86B]/5 group-hover:border-[#00A86B]/20 transition-all duration-300">
                <CheckCircle2 className="w-4.5 h-4.5 text-[#00A86B]" />
                <div>
                  <p className="text-[9px] text-slate-400 uppercase">Bathrooms</p>
                  <p className="text-xs font-extrabold text-slate-700 dark:text-slate-300">{item.bathrooms}</p>
                </div>
              </div>
            )}
          </div>
        )}

        {item.zone === "machinery" && (
          <div className="mb-4">
            <div className="bg-slate-50 dark:bg-slate-950/50 rounded-xl p-2.5 border border-slate-100 dark:border-white/5 flex items-center gap-2 group-hover:bg-[#00A86B]/5 group-hover:border-[#00A86B]/20 transition-all duration-300">
              <Settings className="w-4.5 h-4.5 text-amber-500" />
              <div>
                <p className="text-[9px] text-slate-400 uppercase">{t("label.billing")}</p>
                <p className="text-xs font-extrabold text-slate-700 dark:text-slate-300">{item.billingTrack}</p>
              </div>
            </div>
          </div>
        )}

        {/* ── Price Block ── */}
        <div className="mt-auto">
          <div className="flex items-baseline justify-between mb-4">
            <div>
              <span className="text-2xl font-extrabold text-slate-900 dark:text-white group-hover:text-[#00A86B] transition-colors duration-300">
                {formatPriceLocal(item.price)}
              </span>
              <span className="text-sm font-semibold text-slate-500 dark:text-slate-400 ml-1.5">
                {t(item.priceSuffixKey as any)}
              </span>
            </div>
            <span className="text-[10px] font-extrabold text-red-500 dark:text-red-400 uppercase tracking-wider">
              {t(item.priceTagKey as any)}
            </span>
          </div>

          {/* ── Delala Eliminator Buttons ── */}
          <div className="flex gap-2.5">
            <a
              href={`tel:${item.phone}`}
              className="flex-1 flex items-center justify-center gap-2 py-3.5 rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 hover:bg-gradient-to-r hover:from-[#00A86B] hover:to-emerald-600 hover:border-[#00A86B] hover:text-white backdrop-blur-md text-slate-700 dark:text-slate-200 text-xs sm:text-sm font-extrabold uppercase tracking-wider transition-all duration-400 hover:scale-[1.03] active:scale-[0.97] shadow-sm hover:shadow-xl hover:shadow-emerald-500/30 dark:shadow-none font-sans"
            >
              <Phone className="w-4.5 h-4.5 text-slate-500 dark:text-slate-400 group-hover:text-white transition-colors" />
              {t("cta.call")}
            </a>
            <a
              href={`https://wa.me/${item.whatsapp}`}
              target="_blank"
              rel="noopener noreferrer"
              className="flex-1 flex items-center justify-center gap-2 py-3.5 rounded-2xl bg-gradient-to-r from-[#00A86B] to-emerald-600 text-white text-xs sm:text-sm font-extrabold uppercase tracking-wider hover:from-emerald-600 hover:to-emerald-700 transition-all duration-400 hover:scale-[1.03] active:scale-[0.97] shadow-lg hover:shadow-2xl hover:shadow-emerald-500/40"
            >
              <Send className="w-4.5 h-4.5" />
              {t("cta.whatsapp")}
            </a>
          </div>
        </div>
      </div>
    </article>
  );
};

/* ────────────────────────────────────────────
   Component
   ──────────────────────────────────────────── */
const ITEMS_PER_PAGE = 6;

const ZoneCatalogGrid: React.FC<ZoneCatalogGridProps> = ({
  activeZone,
  filters,
}) => {
  const { language, t } = useLanguage();
  const navigate = useNavigate();
  const { trackEvent } = useSocketTracker();
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const { isFavorite, toggleFavorite } = useFavorites();
  const [currentPage, setCurrentPage] = useState(1);
  const { ref: gridRef, isVisible: gridVisible } = useScrollReveal({ threshold: 0.1 });
  const { listings, loading } = useListings();
  const formatPrice = (n: number) => n.toLocaleString();

  // ── Reset to page 1 whenever zone or filters change ──
  useEffect(() => {
    setCurrentPage(1);
  }, [activeZone, filters]);

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

  // Reset to page 1 whenever filters/zone change
  const totalPages = Math.max(1, Math.ceil(filtered.length / ITEMS_PER_PAGE));
  const safePage = Math.min(currentPage, totalPages);
  const visibleListings = filtered.slice((safePage - 1) * ITEMS_PER_PAGE, safePage * ITEMS_PER_PAGE);

  const goToPage = (page: number) => {
    if (page < 1 || page > totalPages) return;
    setCurrentPage(page);
    const el = document.getElementById("zone-catalog-section");
    if (el) el.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  const handleToggleFavorite = (item: ListingItem) => {
    toggleFavorite(item);
  };

  const handleShare = async (item: ListingItem) => {
    const url = `${window.location.origin}/listing/${item.id}`;
    const title = language === 'amharic' ? item.titleAm : item.titleEn;
    if (navigator.share) {
      navigator.share({ title, url }).catch(() => {});
    } else {
      try {
        await navigator.clipboard.writeText(url);
        setCopiedId(item.id);
        setTimeout(() => setCopiedId(null), 2000);
      } catch (err) {
        console.error('Failed to copy link:', err);
      }
    }
  };

  return (
    <section
      id="zone-catalog-section"
      ref={gridRef}
      className={`flex-1 min-w-0 transition-all duration-700 ease-out ${
        gridVisible
          ? 'animate-fade-in-up opacity-100 translate-y-0'
          : 'opacity-0 translate-y-8'
      }`}
    >
      {/* ── Section Heading ── */}
      <div className="mb-8">
        <h2 className="text-3xl sm:text-4xl font-sans font-black text-slate-900 dark:text-white tracking-tight leading-snug transition-colors duration-300">
          {language === "amharic" ? (
            <>የተረጋገጡ የ <span className="text-[#00A86B] lowercase font-bold tracking-normal">malazone</span> ይፋዊ ማህደሮች</>
          ) : (
            <><span className="text-[#00A86B] lowercase font-bold tracking-normal">malazone</span> Verified Ledgers</>
          )}
        </h2>

        <div className="w-14 h-1 bg-[#00A86B] rounded-full mt-4 opacity-90 shadow-[0_2px_10px_rgba(0,168,107,0.3)]" />
      </div>

      {/* ── Card Grid ── */}
      {filtered.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {visibleListings.map((item, index) => (
            <article
              key={item.id}
              onClick={() => { trackEvent('visit', item); navigate(`/listing/${item.id}`); }}
              style={{ 
                animationDelay: `${index * 0.1}s`,
                opacity: gridVisible ? 1 : 0,
                transform: gridVisible ? 'translateY(0)' : 'translateY(20px)',
                transition: `opacity 0.5s ease-out ${index * 0.1}s, transform 0.5s ease-out ${index * 0.1}s`
              }}
              className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-white/5 rounded-2xl overflow-hidden group hover:border-[#00A86B]/30 hover:bg-slate-50 dark:hover:bg-slate-900/60 hover:-translate-y-3 hover:scale-[1.02] hover:shadow-[0_24px_48px_rgba(0,168,107,0.15)] shadow-md flex flex-col relative transition-all duration-500 cursor-pointer"
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
                  <span className="w-2 h-2 rounded-full bg-[#00A86B] animate-pulse" />
                  <CheckCircle2 className="w-3 h-3 text-white" />
                  <span className="text-[11px] font-semibold text-white tracking-wide">
                    {t(item.badgeKey as any)}
                  </span>
                </div>

                                {/* Action Buttons: Premium Star, Favorite, Share */}
                                <div className="absolute top-3 right-3 flex flex-col gap-1.5">
                                  {item.isPremium && (
                                    <div className="w-8 h-8 rounded-lg bg-amber-500 flex items-center justify-center shadow-lg">
                                      <Sparkles className="w-4 h-4 text-white" />
                                    </div>
                                  )}
                                  <button
                                    onClick={(e) => { e.stopPropagation(); handleToggleFavorite(item); }}
                                    className="w-8 h-8 rounded-full bg-white/90 dark:bg-slate-900/90 backdrop-blur-sm flex items-center justify-center shadow-lg hover:scale-110 transition-all duration-300"
                                    aria-label={isFavorite(item.id) ? "Remove from favorites" : "Add to favorites"}
                                  >
                                    <Heart className={`w-4 h-4 ${isFavorite(item.id) ? 'fill-red-500 text-red-500' : 'text-slate-600 dark:text-slate-300'}`} />
                                  </button>
                                  <button
                                    onClick={(e) => { e.stopPropagation(); handleShare(item); }}
                                    className="w-8 h-8 rounded-full bg-white/90 dark:bg-slate-900/90 backdrop-blur-sm flex items-center justify-center shadow-lg hover:scale-110 transition-all duration-300"
                                    aria-label="Share listing"
                                  >
                                    {copiedId === item.id ? (
                                      <Check className="w-4 h-4 text-emerald-500" />
                                    ) : (
                                      <Share2 className="w-4 h-4 text-slate-600 dark:text-slate-300" />
                                    )}
                                  </button>
                                </div>
              </div>

              {/* ── Card Body ── */}
              <div className="p-5 flex flex-col flex-grow">
                {/* Star Rating */}
                <div className="mb-2">
                  <StarRating rating={item.rating} />
                </div>

                {/* Title */}
                <h3 className="text-[15px] font-bold text-slate-900 dark:text-white leading-snug mb-3 line-clamp-2 group-hover:text-[#00A86B] transition-colors font-sans tracking-wide">
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
                      <Zap className="w-3 h-3 text-[#00A86B]" />
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
                      <Ruler className="w-4 h-4 text-[#00A86B]" />
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
                        <CheckCircle2 className="w-4 h-4 text-[#00A86B]" />
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
                      className="flex-1 flex items-center justify-center gap-2 py-3 rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 hover:bg-slate-100 dark:bg-slate-900/50 dark:hover:bg-slate-800/80 backdrop-blur-md text-slate-700 dark:text-slate-200 text-xs sm:text-sm font-black uppercase tracking-wider transition-all duration-300 hover:scale-[1.02] active:scale-[0.98] shadow-sm hover:shadow-md dark:shadow-none font-sans"
                    >
                      <Phone className="w-4 h-4 text-slate-500 dark:text-slate-400 transition-colors" />
                      {t("cta.call")}
                    </a>
                    <a
                      href={`https://t.me/+${item.whatsapp.replace("+", "")}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex-1 flex items-center justify-center gap-2 py-3 rounded-2xl bg-gradient-to-r from-[#0088cc] to-[#2CA5E0] hover:scale-[1.02] active:scale-[0.98] text-white text-xs sm:text-sm font-black uppercase tracking-wider transition-all duration-300 shadow-md shadow-blue-500/10 hover:shadow-[0_6px_15px_rgba(36,161,222,0.3)] group/tg font-sans"
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

      {/* ── Numbered Pagination ── */}
      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-2 mt-10 flex-wrap">
          {/* Prev */}
          <button
            onClick={() => goToPage(safePage - 1)}
            disabled={safePage === 1}
            className="flex items-center gap-1 px-4 py-2.5 rounded-xl border border-slate-200 dark:border-white/10 bg-white dark:bg-slate-900 text-[11px] font-black uppercase tracking-widest text-slate-700 dark:text-slate-300 hover:border-[#00A86B] hover:text-[#00A86B] transition-all disabled:opacity-30 disabled:cursor-not-allowed"
          >
            <ChevronLeft className="w-3.5 h-3.5" />
            {language === "amharic" ? "የቀደመ" : "Prev"}
          </button>

          {/* Page Numbers */}
          {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
            <button
              key={page}
              onClick={() => goToPage(page)}
              className={`min-w-[42px] h-[42px] px-3 rounded-xl border text-sm font-black transition-all ${
                page === safePage
                  ? "bg-[#00A86B] border-[#00A86B] text-white shadow-[0_4px_16px_rgba(0,168,107,0.35)] scale-105"
                  : "bg-white dark:bg-slate-900 border-slate-200 dark:border-white/10 text-slate-700 dark:text-slate-300 hover:border-[#00A86B] hover:text-[#00A86B]"
              }`}
            >
              {page}
            </button>
          ))}

          {/* Next */}
          <button
            onClick={() => goToPage(safePage + 1)}
            disabled={safePage === totalPages}
            className="flex items-center gap-1 px-4 py-2.5 rounded-xl border border-slate-200 dark:border-white/10 bg-white dark:bg-slate-900 text-[11px] font-black uppercase tracking-widest text-slate-700 dark:text-slate-300 hover:border-[#00A86B] hover:text-[#00A86B] transition-all disabled:opacity-30 disabled:cursor-not-allowed"
          >
            {language === "amharic" ? "ቀጣዩ" : "Next"}
            <ChevronRight className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

    </section>
  );
};

export default ZoneCatalogGrid;
