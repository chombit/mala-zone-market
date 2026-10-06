/**
 * StorefrontPage.tsx
 * Malazone.com — Public seller storefront (/store/:userId).
 * Renders a seller's profile + active listings. Only reachable for accounts
 * that opted into a store profile (seller_status = 'store').
 * © 2026 Malazone Technologies PLC
 */

import React, { useCallback, useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import {
  ArrowLeft, Store, BadgeCheck, Star, Package, Eye, MapPin, Loader2, Verified,
} from "lucide-react";
import { useLanguage } from "@/contexts/ZoneLanguageContext";

interface StoreProfile {
  id: number;
  full_name: string;
  seller_status: "casual" | "store";
  is_featured_seller: boolean;
  is_verified: boolean;
  avg_rating: number;
  review_count: number;
  active_listings_count: number;
  member_since: string;
}

interface StoreListing {
  id: number;
  title_en: string;
  title_am: string;
  category: string;
  sub_category: string | null;
  price: number;
  price_suffix: string;
  location_label_en: string | null;
  location_label_am: string | null;
  is_verified: boolean;
  view_count: number;
  cover_image: string | null;
  created_at: string;
}

function suffixLabel(suffix: string, isAm: boolean): string {
  switch (suffix) {
    case "fixed": return isAm ? "ለሽያጭ" : "For Sale";
    case "per_month": return isAm ? "በወር" : "/mo";
    case "per_day": return isAm ? "በቀን" : "/day";
    case "per_hour": return isAm ? "በሰዓት" : "/hr";
    default: return suffix;
  }
}

const StorefrontPage: React.FC = () => {
  const { userId } = useParams<{ userId: string }>();
  const { language } = useLanguage();
  const isAm = language === "amharic";
  const navigate = useNavigate();

  const [seller, setSeller] = useState<StoreProfile | null>(null);
  const [listings, setListings] = useState<StoreListing[]>([]);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);

  const load = useCallback(async () => {
    try {
      setLoading(true);
      const [profileRes, listingsRes] = await Promise.all([
        fetch(`/api/sellers/${userId}`, { credentials: "include" }),
        fetch(`/api/sellers/${userId}/listings`, { credentials: "include" }),
      ]);
      const profileJson = await profileRes.json();
      if (!profileJson.success || profileRes.status === 404) {
        setNotFound(true);
        return;
      }
      setSeller(profileJson.data);
      const listingsJson = await listingsRes.json();
      setListings(listingsJson.data || []);
    } catch (err) {
      setNotFound(true);
    } finally {
      setLoading(false);
    }
  }, [userId]);

  useEffect(() => {
    load();
  }, [load]);

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-[#00A86B]" />
      </div>
    );
  }

  if (notFound || !seller) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center p-6">
        <div className="bg-white rounded-2xl border border-slate-200 p-10 max-w-md text-center">
          <Store className="w-12 h-12 text-slate-300 mx-auto mb-4" />
          <p className="text-lg font-black text-slate-900">{isAm ? "ሱቅ አልተገኘም" : "Store not found"}</p>
          <p className="text-slate-500 text-sm mt-1">
            {isAm ? "ይህ ሱቅ የለም ወይም አልነቃም።" : "This store doesn't exist or hasn't been activated."}
          </p>
          <button
            onClick={() => navigate("/")}
            className="mt-6 px-5 py-2.5 bg-[#00A86B] text-white rounded-xl font-bold text-sm"
          >
            {isAm ? "ወደ መነሻ ተመለስ" : "Back to home"}
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Hero */}
      <div className="bg-[#0B1220] text-white">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 py-8">
          <button
            onClick={() => navigate(-1)}
            className="flex items-center gap-2 text-white/60 hover:text-white transition-colors text-sm font-bold mb-6"
          >
            <ArrowLeft className="w-4 h-4" />
            {isAm ? "ተመለስ" : "Back"}
          </button>

          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-5">
            <div className="h-20 w-20 bg-gradient-to-br from-[#00A86B] to-[#008F5B] rounded-2xl flex items-center justify-center text-white font-black text-3xl shrink-0">
              {seller.full_name.charAt(0).toUpperCase()}
            </div>
            <div className="space-y-2">
              <div className="flex items-center gap-2 flex-wrap">
                <h1 className="text-2xl sm:text-3xl font-black tracking-tight">{seller.full_name}</h1>
                {seller.is_verified && <BadgeCheck className="w-6 h-6 text-[#00A86B]" />}
                {seller.is_featured_seller && (
                  <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-amber-400/20 text-amber-300 text-[11px] font-black uppercase tracking-wider">
                    <Star className="w-3 h-3" /> {isAm ? "ተመራጭ ሱቅ" : "Featured"}
                  </span>
                )}
              </div>
              <div className="flex flex-wrap items-center gap-x-5 gap-y-2 text-sm text-white/60 font-medium">
                <span className="inline-flex items-center gap-1.5">
                  <Star className="w-4 h-4 text-amber-400 fill-amber-400" />
                  {seller.review_count > 0 ? seller.avg_rating : isAm ? "አዲስ ሱቅ" : "New store"}
                  {seller.review_count > 0 && ` (${seller.review_count})`}
                </span>
                <span className="inline-flex items-center gap-1.5">
                  <Package className="w-4 h-4" />
                  {seller.active_listings_count} {isAm ? "እቃዎች" : "items"}
                </span>
                <span className="inline-flex items-center gap-1.5">
                  <Verified className="w-4 h-4" />
                  {seller.member_since ? `${isAm ? "በ" : "Selling since"} ${new Date(seller.member_since).getFullYear()}` : ""}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Listings */}
      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-8">
        <div className="flex items-center justify-between mb-5">
          <h2 className="text-lg font-black text-slate-900">{isAm ? "እቃዎች" : "Listings"}</h2>
          <span className="text-sm text-slate-500 font-medium">{listings.length} {isAm ? "ተገኝቷል" : "results"}</span>
        </div>

        {listings.length === 0 ? (
          <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center">
            <Package className="w-14 h-14 text-slate-200 mx-auto mb-4" />
            <p className="text-slate-500 font-medium">{isAm ? "እስካሁን የሚገኝ እቃ የለም" : "No active listings right now"}</p>
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {listings.map((listing) => (
              <Link
                key={listing.id}
                to={`/listing/${listing.id}`}
                className="group bg-white rounded-2xl border border-slate-200 overflow-hidden hover:shadow-lg hover:-translate-y-0.5 transition-all"
              >
                <div className="relative aspect-[4/3] bg-slate-100 overflow-hidden">
                  {listing.cover_image ? (
                    <img
                      src={listing.cover_image}
                      alt={listing.title_en}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <Package className="w-10 h-10 text-slate-300" />
                    </div>
                  )}
                  {listing.is_verified && (
                    <span className="absolute top-2 left-2 inline-flex items-center gap-1 px-2 py-1 bg-[#00A86B] text-white rounded-lg text-[10px] font-black uppercase tracking-wider">
                      <BadgeCheck className="w-3 h-3" /> {isAm ? "የተረጋገጠ" : "Verified"}
                    </span>
                  )}
                </div>
                <div className="p-4 space-y-1.5">
                  <p className="text-sm font-bold text-slate-900 line-clamp-2 leading-snug min-h-[2.5rem]">
                    {listing.title_en}
                  </p>
                  <p className="text-lg font-black text-[#00A86B]">
                    {listing.price.toLocaleString()} <span className="text-xs font-bold text-slate-500">ETB {suffixLabel(listing.price_suffix, isAm)}</span>
                  </p>
                  <div className="flex items-center justify-between pt-1">
                    <span className="inline-flex items-center gap-1 text-xs text-slate-500">
                      <MapPin className="w-3 h-3" />
                      {isAm && listing.location_label_am ? listing.location_label_am : listing.location_label_en || ""}
                    </span>
                    <span className="inline-flex items-center gap-1 text-xs text-slate-400">
                      <Eye className="w-3 h-3" /> {listing.view_count}
                    </span>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default StorefrontPage;