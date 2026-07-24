/**
 * TrendingListings.tsx
 * Malazone.com — Mobile-Only Trending Carousel with See All Modal
 * © 2026 Malazone Technologies PLC
 */

import React, { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { Star, CheckCircle2, MapPin, Flame, X, ChevronLeft, ChevronRight } from "lucide-react";
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
  {
    id: "47",
    titleEn: "Hawassa Lakeview Hotel",
    titleAm: "ሐዋሳ የሐይቅ ገጽታ ሆቴል",
    price: 2500,
    priceSuffixKey: "price.day",
    image: "https://images.unsplash.com/photo-1631049307264-da0ec9d70304?w=600&q=80&fm=webp",
    locationTag: "LAKEFRONT",
    zone: "ceremony",
    isVerified: true,
    isPremium: true,
    rating: 4,
    reviewCount: 11,
  },
  {
    id: "56",
    titleEn: "Cat 320 Excavator — For Hire",
    titleAm: "ካት 320 አቃቂ — በኪራይ",
    price: 35000,
    priceSuffixKey: "price.day",
    image: "https://images.unsplash.com/photo-1579412691522-861f6540960d?w=600&q=80&fm=webp",
    locationTag: "TABOR",
    zone: "machinery",
    isVerified: true,
    isPremium: true,
    rating: 4,
    reviewCount: 13,
  },
  {
    id: "60",
    titleEn: "Samsung Galaxy S24 Ultra",
    titleAm: "ሳምሰንግ ጋላክሲ S24 እልትራ",
    price: 85000,
    priceSuffixKey: "price.etb",
    image: "https://images.unsplash.com/photo-1610945415295-d9bbf067e59c?w=600&q=80&fm=webp",
    locationTag: "PIASSA",
    zone: "electronics",
    isVerified: true,
    isPremium: true,
    rating: 4,
    reviewCount: 12,
  },
  {
    id: "44",
    titleEn: "2021 Hyundai Tucson",
    titleAm: "2021 ሀይንዳይ ቱሰን",
    price: 2800000,
    priceSuffixKey: "price.etb",
    image: "https://images.unsplash.com/photo-1633477189729-9290b3261d0a?w=600&q=80&fm=webp",
    locationTag: "ADDIS",
    zone: "car",
    isVerified: true,
    isPremium: true,
    rating: 4.5,
    reviewCount: 10,
  },
  {
    id: "49",
    titleEn: "Haile Resort — Deluxe Room",
    titleAm: "ሀይሌ ሪዞርት — ዴሉክስ ክፍል",
    price: 4500,
    priceSuffixKey: "price.day",
    image: "https://images.unsplash.com/photo-1551882547-ff40c63fe5fa?w=600&q=80&fm=webp",
    locationTag: "LAKEFRONT",
    zone: "ceremony",
    isVerified: true,
    isPremium: true,
    rating: 4.4,
    reviewCount: 11,
  },
  {
    id: "62",
    titleEn: "MacBook Air M3 — 15\"",
    titleAm: "MacBook Air M3 — 15\"",
    price: 120000,
    priceSuffixKey: "price.etb",
    image: "https://images.unsplash.com/photo-1517336714731-489689fd1ca8?w=600&q=80&fm=webp",
    locationTag: "ADDIS",
    zone: "electronics",
    isVerified: true,
    isPremium: true,
    rating: 4.4,
    reviewCount: 11,
  },
];

const formatPrice = (n: number) => n.toLocaleString();

const TrendingCard: React.FC<{ item: TrendingItem; index: number }> = ({ item, index }) => {
  const { language, t } = useLanguage();
  const navigate = useNavigate();

  return (
    <div
      onClick={() => navigate(`/listing/${item.id}`)}
      className="flex-shrink-0 w-[44%] bg-white dark:bg-slate-900 rounded-2xl overflow-hidden border border-slate-200/80 dark:border-white/5 shadow-md active:scale-[0.97] transition-all duration-300 cursor-pointer"
      style={{ animationDelay: `${index * 0.08}s` }}
    >
      {/* Image */}
      <div className="relative h-24 overflow-hidden">
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
          <div className="absolute top-1.5 left-1.5 flex items-center gap-0.5 bg-[#00A86B]/90 backdrop-blur-sm rounded-md px-1.5 py-0.5">
            <CheckCircle2 className="w-2.5 h-2.5 text-white" />
            <span className="text-[8px] font-bold text-white">Verified</span>
          </div>
        )}

        {/* Premium Badge */}
        {item.isPremium && (
          <div className="absolute top-1.5 right-1.5 w-5 h-5 rounded-md bg-gradient-to-br from-amber-400 to-amber-600 flex items-center justify-center shadow-lg">
            <Star className="w-2.5 h-2.5 text-white fill-white" />
          </div>
        )}

        {/* Price overlay */}
        <div className="absolute bottom-1.5 right-1.5 bg-black/60 backdrop-blur-sm rounded-md px-1.5 py-0.5">
          <span className="text-[10px] font-black text-white">
            {formatPrice(item.price)}
          </span>
          <span className="text-[7px] font-semibold text-white/70 ml-0.5">
            {t(item.priceSuffixKey as any)}
          </span>
        </div>
      </div>

      {/* Body */}
      <div className="p-2.5">
        <h3 className="text-[11px] font-bold text-malazone-navy dark:text-white line-clamp-1 leading-tight">
          {language === "amharic" ? item.titleAm : item.titleEn}
        </h3>
        <div className="flex items-center gap-0.5 mt-1">
          <MapPin className="w-2.5 h-2.5 text-malazone-green" />
          <span className="text-[9px] font-semibold text-slate-500 dark:text-slate-400">
            {item.locationTag}
          </span>
        </div>
        <div className="flex items-center gap-0.5 mt-0.5">
          {Array.from({ length: 5 }, (_, i) => (
            <Star
              key={i}
              className={`w-2 h-2 ${
                i < Math.floor(item.rating)
                  ? "text-amber-500 fill-amber-500"
                  : "text-slate-300 dark:text-slate-600"
              }`}
            />
          ))}
        </div>
      </div>
    </div>
  );
};

const TrendingListings: React.FC = () => {
  const [listings, setListings] = useState<TrendingItem[]>(FALLBACK_TRENDING);
  const [showAll, setShowAll] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    fetch("/api/listings")
      .then((res) => res.json())
      .then((data) => {
        if (data.success && Array.isArray(data.data) && data.data.length > 0) {
          const mapped: TrendingItem[] = data.data
            .filter((r: any) => r.is_premium || r.is_verified)
            .slice(0, 8)
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

  const scroll = (dir: "left" | "right") => {
    if (scrollRef.current) {
      const amount = dir === "left" ? -200 : 200;
      scrollRef.current.scrollBy({ left: amount, behavior: "smooth" });
    }
  };

  return (
    <>
      <div className="sm:hidden px-4 pt-3 pb-1">
        {/* Header */}
        <div className="flex items-center justify-between mb-2.5">
          <div className="flex items-center gap-2">
            <Flame className="w-4 h-4 text-[#00A86B]" />
            <h2 className="text-sm font-black text-malazone-navy dark:text-white tracking-tight">
              Trending Now
            </h2>
          </div>
          <button
            onClick={() => setShowAll(true)}
            className="text-[11px] font-bold text-[#00A86B] active:opacity-70"
          >
            See all
          </button>
        </div>

        {/* Carousel */}
        <div className="relative">
          {/* Scroll Arrows */}
          <button
            onClick={() => scroll("left")}
            className="absolute left-0 top-1/2 -translate-y-1/2 z-10 w-7 h-7 rounded-full bg-white/90 dark:bg-slate-800/90 shadow-md flex items-center justify-center active:scale-90"
          >
            <ChevronLeft className="w-4 h-4 text-slate-600" />
          </button>
          <button
            onClick={() => scroll("right")}
            className="absolute right-0 top-1/2 -translate-y-1/2 z-10 w-7 h-7 rounded-full bg-white/90 dark:bg-slate-800/90 shadow-md flex items-center justify-center active:scale-90"
          >
            <ChevronRight className="w-4 h-4 text-slate-600" />
          </button>

          <div
            ref={scrollRef}
            className="flex gap-2.5 overflow-x-auto px-8 pb-1 snap-x snap-mandatory"
            style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
          >
            {listings.map((item, i) => (
              <TrendingCard key={item.id} item={item} index={i} />
            ))}
          </div>
        </div>
      </div>

      {/* ── See All Modal ── */}
      {showAll && (
        <div className="fixed inset-0 z-[500] md:hidden">
          <div
            className="absolute inset-0 bg-black/50 backdrop-blur-sm"
            onClick={() => setShowAll(false)}
          />
          <div className="absolute inset-x-0 bottom-0 top-12 bg-white dark:bg-slate-900 rounded-t-3xl shadow-2xl flex flex-col animate-in slide-in-from-bottom duration-300">
            {/* Modal Header */}
            <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100 dark:border-white/5">
              <div className="flex items-center gap-2">
                <Flame className="w-4 h-4 text-[#00A86B]" />
                <h2 className="text-base font-black text-malazone-navy dark:text-white">
                  Trending Now
                </h2>
                <span className="text-[10px] font-bold text-slate-400 bg-slate-100 dark:bg-white/5 px-2 py-0.5 rounded-full">
                  {listings.length}
                </span>
              </div>
              <button
                onClick={() => setShowAll(false)}
                className="w-8 h-8 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center"
              >
                <X className="w-4 h-4 text-slate-500" />
              </button>
            </div>

            {/* Modal Grid */}
            <div className="flex-1 overflow-y-auto px-4 py-4">
              <div className="grid grid-cols-2 gap-3">
                {listings.map((item, i) => (
                  <TrendingCard key={item.id} item={item} index={i} />
                ))}
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default TrendingListings;
