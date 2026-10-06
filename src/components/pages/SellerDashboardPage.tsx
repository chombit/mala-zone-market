/**
 * SellerDashboardPage.tsx
 * Malazone.com — Progressive Seller Workspace.
 * Aggregates portfolio analytics + inventory for logged-in sellers. A "casual"
 * seller is offered a one-click upgrade to a store profile (seller_status).
 * © 2026 Malazone Technologies PLC
 */

import React, { useCallback, useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  ArrowLeft, Store, Package, Eye, Star, Heart, ShieldCheck, BadgeCheck,
  Loader2, ExternalLink, Settings, CheckCircle2,
} from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { useLanguage } from "@/contexts/ZoneLanguageContext";

interface SellerData {
  seller: {
    id: number;
    full_name: string;
    phone_number: string | null;
    email: string | null;
    seller_status: "casual" | "store";
    is_featured_seller: boolean;
    is_verified: boolean;
    member_since: string;
  };
  portfolio: {
    total_listings: number;
    active_listings: number;
    sold_listings: number;
    pending_listings: number;
    suspended_listings: number;
    verified_listings: number;
    promoted_listings: number;
    total_views: number;
    favorites_count: number;
    avg_rating: number;
    review_count: number;
    unread_inquiries: number;
  };
}

interface OwnListing {
  id: number;
  title_en: string;
  title_am: string;
  category: string;
  price: number | string;
  price_suffix: string;
  is_active: number;
  status: string;
  view_count: number;
  created_at: string;
}

function statCard(
  label: string,
  value: string,
  icon: React.ReactNode,
  accent: string
) {
  return (
    <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-xs font-bold uppercase tracking-wider text-slate-500">{label}</p>
          <p className="text-2xl font-black text-slate-900 mt-1">{value}</p>
        </div>
        <div className={`p-3 rounded-xl ${accent}`}>{icon}</div>
      </div>
    </div>
  );
}

const SellerDashboardPage: React.FC = () => {
  const { user } = useAuth();
  const { language } = useLanguage();
  const isAm = language === "amharic";
  const navigate = useNavigate();

  const [data, setData] = useState<SellerData | null>(null);
  const [listings, setListings] = useState<OwnListing[]>([]);
  const [loading, setLoading] = useState(true);
  const [activating, setActivating] = useState(false);
  const [error, setError] = useState("");

  const load = useCallback(async () => {
    try {
      setLoading(true);
      const [sellerRes, listingsRes] = await Promise.all([
        fetch("/api/sellers/me", { credentials: "include" }),
        fetch("/api/listings/mine", { credentials: "include" }),
      ]);
      const sellerData = await sellerRes.json();
      const listingsData = await listingsRes.json();
      if (!sellerData.success) throw new Error(sellerData.message || "Failed to load");
      setData(sellerData.data);
      setListings(listingsData.data || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load seller dashboard");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const handleActivate = async () => {
    setActivating(true);
    try {
      const res = await fetch("/api/sellers/activate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
      });
      const json = await res.json();
      if (!json.success) throw new Error(json.message || "Failed to activate store");
      await load();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to activate store");
    } finally {
      setActivating(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-[#00A86B]" />
      </div>
    );
  }

  if (!data) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center p-6">
        <div className="bg-white rounded-2xl border border-slate-200 p-10 max-w-md text-center">
          <Store className="w-12 h-12 text-slate-300 mx-auto mb-4" />
          <p className="text-slate-600 font-medium">{error || "Could not load seller workspace"}</p>
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

  const { seller, portfolio } = data;
  const isStore = seller.seller_status === "store";

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Top bar */}
      <div className="bg-[#0B1220] text-white">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button
              onClick={() => navigate("/")}
              className="p-2 rounded-xl bg-white/10 hover:bg-white/20 transition-colors"
              aria-label="Back"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
            <div>
              <p className="font-black tracking-tight text-lg leading-none">
                <span className="text-[#00A86B]">MALA</span>
                <span>ZONE</span>
              </p>
              <p className="text-xs text-white/40 font-bold">{isAm ? "ሽያጭ ዳሽቦርድ" : "Seller Dashboard"}</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            {isStore && (
              <Link
                to={`/store/${seller.id}`}
                className="flex items-center gap-2 px-4 py-2 bg-[#00A86B] text-white rounded-xl font-bold text-sm hover:bg-emerald-600 transition-colors"
              >
                <Store className="w-4 h-4" />
                {isAm ? "ሱቄን እይ" : "View Store"}
              </Link>
            )}
            <Link
              to="/post"
              className="flex items-center gap-2 px-4 py-2 bg-white/10 hover:bg-white/20 rounded-xl font-bold text-sm transition-colors"
            >
              <Package className="w-4 h-4" />
              {isAm ? "አዲስ ማስታወቂያ" : "New Listing"}
            </Link>
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-8 space-y-8">
        {/* Header + store activation CTA */}
        {!isStore ? (
          <div className="bg-gradient-to-r from-[#00A86B] to-[#0B1220] rounded-2xl p-6 sm:p-8 text-white shadow-sm flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div className="space-y-2">
              <p className="text-xl sm:text-2xl font-black">{isAm ? "የእርስዎን ሱቅ ያንቁ" : "Activate your store"}</p>
              <p className="text-white/70 text-sm max-w-xl">
                {isAm
                  ? "የሚታይ የሱቅ ገጽ ይክፈቱ እና የእርስዎን እቃዎች በአንድ ቦታ ያሳዩ።"
                  : "Get a public storefront that showcases all your listings, builds buyer trust, and makes your shop discoverable."}
              </p>
            </div>
            <button
              onClick={handleActivate}
              disabled={activating}
              className="shrink-0 flex items-center gap-2 px-6 py-3 bg-white text-[#00A86B] rounded-xl font-black text-sm hover:bg-slate-100 transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
            >
              {activating ? <Loader2 className="w-4 h-4 animate-spin" /> : <Store className="w-4 h-4" />}
              {isAm ? "ሱቅ አንቃ" : "Activate Store"}
            </button>
          </div>
        ) : (
          <div className="bg-white rounded-2xl border border-slate-200 p-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 shadow-sm">
            <div className="flex items-center gap-4">
              <div className="h-14 w-14 bg-gradient-to-br from-[#00A86B] to-[#008F5B] rounded-2xl flex items-center justify-center text-white font-black text-xl">
                {seller.full_name.charAt(0).toUpperCase()}
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <p className="text-lg font-black text-slate-900">{seller.full_name}</p>
                  {seller.is_verified && <BadgeCheck className="w-5 h-5 text-[#00A86B]" />}
                  {seller.is_featured_seller && (
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-amber-100 text-amber-700 text-[10px] font-black uppercase tracking-wider">
                      <Star className="w-3 h-3" /> {isAm ? "ተመራጭ" : "Featured"}
                    </span>
                  )}
                </div>
                <p className="text-sm text-slate-500 font-medium">
                  {isAm ? "የሱቅ ገጽ ተንቅኖ ነበር" : "Store profile active"} ·{" "}
                  <Link to={`/store/${seller.id}`} className="text-[#00A86B] font-bold inline-flex items-center gap-1 hover:underline">
                    /store/{seller.id} <ExternalLink className="w-3 h-3" />
                  </Link>
                </p>
              </div>
            </div>
            <Link
              to="/account"
              className="flex items-center gap-2 px-4 py-2 bg-slate-100 hover:bg-slate-200 rounded-xl text-slate-700 font-bold text-sm transition-colors"
            >
              <Settings className="w-4 h-4" />
              {isAm ? "መለያ" : "Account"}
            </Link>
          </div>
        )}

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 rounded-xl px-4 py-3 text-sm font-medium">
            {error}
          </div>
        )}

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {statCard(isAm ? "ጠቅላላ ማስታወቂያ" : "Total Listings", String(portfolio.total_listings),
            <Package className="w-5 h-5 text-blue-600" />, "bg-blue-50")}
          {statCard(isAm ? "ንቁ" : "Active", String(portfolio.active_listings),
            <CheckCircle2 className="w-5 h-5 text-emerald-600" />, "bg-emerald-50")}
          {statCard(isAm ? "የተሸጡ" : "Sold", String(portfolio.sold_listings),
            <Store className="w-5 h-5 text-[#00A86B]" />, "bg-[#00A86B]/10")}
          {statCard(isAm ? "እይታዎች" : "Total Views", portfolio.total_views.toLocaleString(),
            <Eye className="w-5 h-5 text-purple-600" />, "bg-purple-50")}
          {statCard(isAm ? "ተወዳጅ" : "Favorites", String(portfolio.favorites_count),
            <Heart className="w-5 h-5 text-rose-600" />, "bg-rose-50")}
          {statCard(isAm ? "ደረጃ አሰጣጥ" : "Avg Rating",
            portfolio.review_count > 0 ? `${portfolio.avg_rating} ★` : "—",
            <Star className="w-5 h-5 text-amber-500" />, "bg-amber-50")}
          {statCard(isAm ? "የተረጋገጡ" : "Verified", String(portfolio.verified_listings),
            <ShieldCheck className="w-5 h-5 text-sky-600" />, "bg-sky-50")}
          {statCard(isAm ? "ያልተነበቡ መልዕክቶች" : "Unread Inquiries", String(portfolio.unread_inquiries),
            <Star className="w-5 h-5 text-cyan-600" />, "bg-cyan-50")}
        </div>

        {/* Inventory */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
          <div className="px-6 py-5 border-b border-slate-100 flex items-center justify-between">
            <div>
              <h3 className="text-lg font-black text-slate-900">{isAm ? "እቃዎቼ" : "My Inventory"}</h3>
              <p className="text-sm text-slate-500">{isAm ? `${listings.length} ማስታወቂያዎች` : `${listings.length} listings`}</p>
            </div>
            <Link
              to="/post"
              className="flex items-center gap-2 px-4 py-2 bg-[#00A86B] text-white rounded-xl font-bold text-sm hover:bg-emerald-600 transition-colors"
            >
              <Package className="w-4 h-4" />
              {isAm ? "አዲስ አክል" : "Add Listing"}
            </Link>
          </div>

          {listings.length === 0 ? (
            <div className="p-12 text-center">
              <Package className="w-14 h-14 text-slate-200 mx-auto mb-4" />
              <p className="text-slate-500 font-medium">{isAm ? "እስካሁን ምንም እቃ የለም" : "No listings yet"}</p>
              <Link to="/post" className="inline-block mt-4 text-[#00A86B] font-bold text-sm hover:underline">
                {isAm ? "የመጀመሪያ ማስታወቂያ ይለጥፉ" : "Post your first listing"}
              </Link>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-slate-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-bold text-slate-500 uppercase tracking-wider">Title</th>
                    <th className="px-6 py-3 text-left text-xs font-bold text-slate-500 uppercase tracking-wider">Status</th>
                    <th className="px-6 py-3 text-left text-xs font-bold text-slate-500 uppercase tracking-wider">Views</th>
                    <th className="px-6 py-3 text-left text-xs font-bold text-slate-500 uppercase tracking-wider">Posted</th>
                    <th className="px-6 py-3 text-left text-xs font-bold text-slate-500 uppercase tracking-wider"></th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {listings.map((l) => (
                    <tr key={l.id} className="hover:bg-slate-50 transition-colors">
                      <td className="px-6 py-4">
                        <Link to={`/listing/${l.id}`} className="text-slate-900 font-bold hover:text-[#00A86B] transition-colors">
                          {l.title_en}
                        </Link>
                        <p className="text-xs text-slate-500 mt-0.5">
                          {l.category} · {Number(l.price).toLocaleString()} {l.price_suffix === "per_month" ? "/mo" : ""}
                        </p>
                      </td>
                      <td className="px-6 py-4">
                        <span
                          className={`inline-flex px-3 py-1 rounded-full text-xs font-bold ${
                            l.status === "active"
                              ? "bg-emerald-50 text-emerald-700"
                              : l.status === "sold"
                                ? "bg-[#00A86B]/10 text-[#00A86B]"
                                : l.status === "suspended"
                                  ? "bg-red-50 text-red-600"
                                  : "bg-amber-50 text-amber-700"
                          }`}
                        >
                          {l.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-slate-600 font-medium">{l.view_count}</td>
                      <td className="px-6 py-4 text-sm text-slate-500">
                        {new Date(l.created_at).toLocaleDateString()}
                      </td>
                      <td className="px-6 py-4">
                        <Link
                          to={`/listing/${l.id}`}
                          className="inline-flex items-center gap-1.5 text-xs font-bold text-[#00A86B] hover:underline"
                        >
                          {isAm ? "ይመልከቱ" : "View"} <ExternalLink className="w-3 h-3" />
                        </Link>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default SellerDashboardPage;