/**
 * TrendingListings.tsx
 * Malazone.com — Mobile-Only Trending/Recommended Listing Cards
 * Shows 2 cards on mobile after the hero section.
 * © 2026 Malazone Technologies PLC
 */

import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Star, CheckCircle2, MapPin, Flame } from "lucide-react";
import { useLanguage } from "@/contexts/ZoneLanguageContext";

interface TrendingItem {
  id: string;
  titleEn: string;
  titleAm: string;
  price: number;
  priceSuffixKey: string;
  image: string;
  locationTag: string;
  zone: string;
  isVerified: boolean;
  isPremium: boolean;
  rating: number;
  reviewCount?: number;
}

const FALLBACK_TRENDING: TrendingItem[] = [
  {
    id: "37",
    titleEn: "3 Bedroom House in Tabor",
    titleAm: "3 መኝታ ክፍል ቤት በታቦር",
    price: 4500000,
    priceSuffixKey: "price.etb",
    image: "https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=600&q=80&fm=webp",
    locationTag: "TABOR",
    zone: "house",
    isVerified: true,
    isPremium: true,
    rating: 4,
    reviewCount: 13,
  },
  {
    id: "42",
    titleEn: "2019 Toyota Corolla — Single Owner",
    titleAm: "2019 ቶዮታ ኮሮላ — አንድ ባለቤት",
    price: 1200000,
    priceSuffixKey: "price.etb",
    image: "https://images.unsplash.com/photo-1549317661-bd32c8ce0db2?w=600&q=80&fm=webp",
    locationTag: "TABOR",
    zone: "car",
    isVerified: true,
    isPremium: true,
    rating: 4,
    reviewCount: 13,
  },
];

const formatPrice = (n: number) => n.toLocaleString();

const TrendingCard: React.FC<{ item: TrendingItem; index: number }> = ({ item, index }) => {
  const { t, language } = useLanguage();
  const navigate = useNavigate();

  return (
    <div
      onClick={() => navigate(`/listing/${item.id}`)}
      className="flex-shrink-0 w-[48%] bg-white dark:bg-slate-900 rounded-2xl overflow-hidden border border-slate-200/80 dark:border-white/5 shadow-md active:scale-[0.97] transition-all duration-300 cursor-pointer"
      style={{ animationDelay: `${index * 0.1}s` }}
    >
      {/* Image */}
      <div className="relative h-28 overflow-hidden">
        <img
          src={item.image}
          alt={language === "amharic" ? item.titleAm : item.titleEn}
          loading="lazy"
          crossOrigin="anonymous"
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent" />

        {/* Verified Badge */}
        {item.isVerified && (
          <div className="absolute top-2 left-2 flex items-center gap-1 bg-white/25 backdrop-blur-xl border border-white/30 rounded-lg px-2 py-0.5">
            <CheckCircle2 className="w-3 h-3 text-white" />
            <span className="text-[9px] font-semibold text-white">Verified</span>
          </div>
        )}

        {/* Premium Badge */}
        {item.isPremium && (
          <div className="absolute top-2 right-2 w-6 h-6 rounded-lg bg-gradient-to-br from-amber-400 to-amber-600 flex items-center justify-center shadow-lg">
            <Star className="w-3 h-3 text-white fill-white" />
          </div>
        )}

        {/* Price overlay */}
        <div className="absolute bottom-2 right-2 bg-black/60 backdrop-blur-sm rounded-lg px-2 py-1">
          <span className="text-[11px] font-black text-white">
            {formatPrice(item.price)}
          </span>
          <span className="text-[8px] font-semibold text-white/70 ml-0.5">
            {t(item.priceSuffixKey as any)}
          </span>
        </div>
      </div>

      {/* Body */}
      <div className="p-3">
        <h3 className="text-xs font-bold text-malazone-navy dark:text-white line-clamp-1 leading-tight">
          {language === "amharic" ? item.titleAm : item.titleEn}
        </h3>
        <div className="flex items-center gap-1 mt-1.5">
          <MapPin className="w-3 h-3 text-malazone-green" />
          <span className="text-[10px] font-semibold text-slate-500 dark:text-slate-400">
            {item.locationTag}
          </span>
        </div>
        <div className="flex items-center gap-0.5 mt-1">
          {Array.from({ length: 5 }, (_, i) => (
            <Star
              key={i}
              className={`w-2.5 h-2.5 ${
                i < Math.floor(item.rating)
                  ? "text-amber-500 fill-amber-500"
                  : "text-slate-300 dark:text-slate-600"
              }`}
            />
          ))}
          <span className="text-[9px] font-semibold text-slate-400 ml-0.5">
            {item.rating}
          </span>
        </div>
      </div>
    </div>
  );
};

const TrendingListings: React.FC = () => {
  const [listings, setListings] = useState<TrendingItem[]>(FALLBACK_TRENDING);

  useEffect(() => {
    fetch("/api/listings")
      .then((res) => res.json())
      .then((data) => {
        if (data.success && Array.isArray(data.data) && data.data.length > 0) {
          const mapped: TrendingItem[] = data.data
            .filter((r: any) => r.is_premium || r.is_verified)
            .slice(0, 2)
            .map((r: any) => {
              const images: string[] = (() => {
                if (!r.images) return [];
                if (Array.isArray(r.images)) return r.images;
                try { return JSON.parse(r.images); } catch { return []; }
              })();
              return {
                id: String(r.id),
                titleEn: r.title_en || "",
                titleAm: r.title_am || "",
                price: Number(r.price) || 0,
                priceSuffixKey: r.price_suffix === "per_day" ? "price.day" : r.price_suffix === "per_hour" ? "price.hour" : "price.etb",
                image: images[0] || "https://images.unsplash.com/photo-1560518883-ce09059eeffa?w=600&q=80&fm=webp",
                locationTag: (r.location_label_en || "").toUpperCase() || "PIASSA",
                zone: r.category || "property",
                isVerified: !!r.is_verified,
                isPremium: !!r.is_premium,
                rating: r.avg_rating ? Number(r.avg_rating) : 0,
                reviewCount: r.review_count ? Number(r.review_count) : 0,
              };
            });
          if (mapped.length >= 2) setListings(mapped);
        }
      })
      .catch(() => {});
  }, []);

  return (
    <div className="sm:hidden px-4 pt-4 pb-2">
      <div className="flex items-center gap-2 mb-3">
        <Flame className="w-4 h-4 text-[#00A86B]" />
        <h2 className="text-sm font-black text-malazone-navy dark:text-white tracking-tight">
          Trending Now
        </h2>
      </div>
      <div className="flex gap-3">
        {listings.slice(0, 2).map((item, i) => (
          <TrendingCard key={item.id} item={item} index={i} />
        ))}
      </div>
    </div>
  );
};

export default TrendingListings;
