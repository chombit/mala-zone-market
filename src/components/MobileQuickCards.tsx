/**
 * MobileQuickCards.tsx
 * Horizontally scrollable trending listing cards above the main catalog.
 * Each card: small image + title + price. Pairs scroll right-to-left.
 * Mobile-only (hidden on lg+).
 */

import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Flame, ArrowRight, MapPin, ShieldCheck, Star } from "lucide-react";
import { useListingRevision } from "@/contexts/ListingRealtimeContext";

interface TrendingListing {
  id: string;
  title: string;
  price: number;
  priceSuffix: string;
  image: string;
  location: string;
  isVerified: boolean;
  rating: number;
  zone: string;
}

interface MobileQuickCardsProps {
  language?: string;
}

function parseImages(raw: any): string[] {
  if (!raw) return [];
  if (Array.isArray(raw)) return raw;
  try { return JSON.parse(raw); } catch { return []; }
}

const FALLBACK: TrendingListing[] = [
  { id: "37", title: "3 Bedroom House in Tabor", price: 4500000, priceSuffix: "ETB", image: "https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=400&q=80&fm=webp", location: "Tabor", isVerified: true, rating: 4, zone: "house" },
  { id: "42", title: "2019 Toyota Corolla", price: 1200000, priceSuffix: "ETB", image: "https://images.unsplash.com/photo-1549317661-bd32c8ce0db2?w=400&q=80&fm=webp", location: "Hawassa", isVerified: true, rating: 4, zone: "car" },
  { id: "60", title: "Samsung Galaxy S24 Ultra", price: 85000, priceSuffix: "ETB", image: "https://images.unsplash.com/photo-1610945415295-d9bbf067e59c?w=400&q=80&fm=webp", location: "Tabor", isVerified: true, rating: 4, zone: "electronics" },
  { id: "47", title: "Hawassa Lakeview Hotel", price: 2500, priceSuffix: "/day", image: "https://images.unsplash.com/photo-1631049307264-da0ec9d70304?w=400&q=80&fm=webp", location: "Lakefront", isVerified: true, rating: 4, zone: "furniture" },
  { id: "52", title: "Modern 3-Seater Sofa", price: 25000, priceSuffix: "ETB", image: "https://images.unsplash.com/photo-1555041469-a586c61ea9bc?w=400&q=80&fm=webp", location: "Tabor", isVerified: true, rating: 4, zone: "furniture" },
  { id: "56", title: "Men's Leather Jacket", price: 8500, priceSuffix: "ETB", image: "https://images.unsplash.com/photo-1551028719-00167b16eac5?w=400&q=80&fm=webp", location: "Tabor", isVerified: true, rating: 4, zone: "fashion" },
];

const MobileQuickCards: React.FC<MobileQuickCardsProps> = ({ language }) => {
  const isAm = language === "amharic";
  const navigate = useNavigate();
  const [listings, setListings] = useState<TrendingListing[]>(FALLBACK);
  const { revision } = useListingRevision();

  useEffect(() => {
    fetch("/api/listings?limit=8&sort=newest")
      .then((r) => r.json())
      .then((data) => {
        if (data?.data?.length) {
          setListings(
            data.data.slice(0, 8).map((row: any) => {
              const imgs = parseImages(row.images);
              return {
                id: String(row.id),
                title: row.title_en || "Listing",
                price: Number(row.price) || 0,
                priceSuffix: row.price_suffix === "per_month" ? "/Month" : row.price_suffix === "per_hour" ? "/Hour" : row.price_suffix === "per_day" ? "/Day" : "ETB",
                image: imgs[0] || row.image || FALLBACK[0].image,
                location: row.location_tag || "",
                isVerified: !!row.is_verified,
                rating: Number(row.rating) || 0,
                zone: row.category || "property",
              };
            })
          );
        }
      })
      .catch(() => {});
  }, [revision]);

  if (!listings.length) return null;

  return (
    <div className="lg:hidden px-4 pt-3 pb-1">
      {/* Section Header */}
      <div className="flex items-center justify-between mb-2.5">
        <div className="flex items-center gap-1.5">
          <Flame className="w-4 h-4 text-orange-500" />
          <h2 className="text-sm font-black text-slate-900 dark:text-white tracking-tight">
            {isAm ? "ተወዳጅ ማህደሮች" : "Trending Now"}
          </h2>
        </div>
        <span className="text-[10px] font-bold text-[#00A86B] uppercase tracking-wider flex items-center gap-0.5">
          {isAm ? "ሁሉንም" : "See all"}
          <ArrowRight className="w-3 h-3" />
        </span>
      </div>

      {/* Scrollable Product Cards — auto-slide, pause on touch */}
      <div
        className="relative -mx-4 px-4"
        onTouchStart={(e) => {
          const el = e.currentTarget.querySelector<HTMLElement>("[data-track]");
          if (el) el.style.animationPlayState = "paused";
        }}
        onTouchEnd={(e) => {
          const el = e.currentTarget.querySelector<HTMLElement>("[data-track]");
          if (el) el.style.animationPlayState = "running";
        }}
      >
        <div
          data-track
          className="flex gap-2.5 w-max pb-2 scrollbar-none"
          style={{ animation: `marquee-left ${listings.length * 4.5}s linear infinite` }}
        >
          {[...listings, ...listings].map((item, i) => (
            <button
              key={`${item.id}-${i}`}
              onClick={() => navigate(`/listing/${item.id}`)}
              className="flex-shrink-0 w-[140px] bg-white dark:bg-slate-900 border border-slate-100 dark:border-white/5 rounded-2xl overflow-hidden active:scale-[0.97] transition-transform duration-150 shadow-sm"
            >
            {/* Image */}
            <div className="relative aspect-[4/3] bg-slate-100 dark:bg-slate-800 overflow-hidden">
              <img
                src={item.image}
                alt={item.title}
                className="w-full h-full object-cover"
                loading="lazy"
              />
              {item.isVerified && (
                <span className="absolute top-1.5 left-1.5 flex items-center gap-0.5 bg-[#00A86B] text-white text-[8px] font-black uppercase px-1.5 py-0.5 rounded-md">
                  <ShieldCheck className="w-2.5 h-2.5" />
                </span>
              )}
              {item.rating > 0 && (
                <span className="absolute top-1.5 right-1.5 flex items-center gap-0.5 bg-black/50 backdrop-blur-sm text-white text-[8px] font-bold px-1.5 py-0.5 rounded-md">
                  <Star className="w-2.5 h-2.5 fill-amber-400 text-amber-400" />
                  {item.rating}
                </span>
              )}
            </div>

            {/* Info */}
            <div className="p-2">
              <p className="text-[11px] font-black text-slate-900 dark:text-white leading-tight line-clamp-1">
                {item.title}
              </p>
              <p className="text-xs font-black text-[#00A86B] mt-0.5">
                {item.price.toLocaleString()}{" "}
                <span className="text-[9px] font-bold text-slate-400">{item.priceSuffix}</span>
              </p>
              {item.location && (
                <p className="flex items-center gap-0.5 text-[9px] text-slate-400 mt-0.5">
                  <MapPin className="w-2.5 h-2.5" />
                  {item.location}
                </p>
              )}
            </div>
          </button>
        ))}
        </div>
      </div>
    </div>
  );
};

export default MobileQuickCards;
