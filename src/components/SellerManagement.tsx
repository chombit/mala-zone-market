/**
 * SellerManagement.tsx
 * Malazone.com — Seller & Storefront management for the Admin Portal.
 * Lists non-agent users with portfolio stats; lets admins toggle the
 * store profile and feature flag. Actions are audit-logged server-side.
 * © 2026 Malazone Technologies PLC
 */

import React, { useCallback, useEffect, useState } from "react";
import {
  Store, Search, RefreshCw, Star, Eye, Package, BadgeCheck,
  Loader2, Users, TrendingUp,
} from "lucide-react";
import { useAdminLanguage } from "../contexts/AdminLanguageContext";

interface SellerRow {
  id: number;
  full_name: string;
  phone_number: string | null;
  email: string | null;
  seller_status: "casual" | "store";
  is_featured_seller: boolean;
  is_verified: boolean;
  created_at: string;
  listing_count: number;
  active_listings: number;
  sold_listings: number;
  avg_rating: number;
  review_count: number;
  total_views: number;
}

const SellerManagement: React.FC = () => {
  const { t } = useAdminLanguage();
  const [sellers, setSellers] = useState<SellerRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [busyId, setBusyId] = useState<number | null>(null);
  const [error, setError] = useState("");

  const fetchSellers = useCallback(async () => {
    try {
      setLoading(true);
      setError("");
      const params = new URLSearchParams();
      if (searchTerm) params.set("q", searchTerm);
      if (statusFilter) params.set("status", statusFilter);
      const res = await fetch(`/api/admin/sellers?${params.toString()}`, { credentials: "include" });
      const json = await res.json();
      if (!json.success) throw new Error(json.message || "Failed to load sellers");
      setSellers(json.data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load sellers");
    } finally {
      setLoading(false);
    }
  }, [searchTerm, statusFilter]);

  useEffect(() => {
    const timer = setTimeout(fetchSellers, 250);
    return () => clearTimeout(timer);
  }, [fetchSellers]);

  const handleRefresh = async () => {
    setRefreshing(true);
    await fetchSellers();
    setRefreshing(false);
  };

  const handleUpdate = async (id: number, patch: { seller_status?: "casual" | "store"; is_featured_seller?: boolean }) => {
    setBusyId(id);
    try {
      const res = await fetch(`/api/admin/sellers/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify(patch),
      });
      const json = await res.json();
      if (!json.success) throw new Error(json.message || "Update failed");
      await fetchSellers();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Update failed");
    } finally {
      setBusyId(null);
    }
  };

  const stores = sellers.filter((s) => s.seller_status === "store");
  const featured = sellers.filter((s) => s.is_featured_seller);
  const totalListings = sellers.reduce((sum, s) => sum + s.listing_count, 0);
  const totalViews = sellers.reduce((sum, s) => sum + s.total_views, 0);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl sm:text-2xl font-black text-slate-900 flex items-center gap-3">
            <Store className="w-6 h-6 text-[#00A86B]" />
            {t("admin.nav.sellers") || "Seller Management"}
          </h2>
          <p className="text-slate-600 text-sm mt-1">
            Store profiles, feature flags, and portfolio health
          </p>
        </div>
        <button
          onClick={handleRefresh}
          disabled={refreshing}
          className="p-2 rounded-lg hover:bg-slate-100 transition-colors"
          title="Refresh"
        >
          <RefreshCw className={`w-5 h-5 text-slate-600 ${refreshing ? "animate-spin" : ""}`} />
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white rounded-xl p-4 border border-slate-200">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-50 rounded-lg"><Users className="w-5 h-5 text-blue-600" /></div>
            <div>
              <p className="text-xs text-slate-500 font-bold uppercase">Sellers</p>
              <p className="text-xl font-black text-slate-900">{sellers.length}</p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-xl p-4 border border-slate-200">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-emerald-50 rounded-lg"><Store className="w-5 h-5 text-emerald-600" /></div>
            <div>
              <p className="text-xs text-slate-500 font-bold uppercase">Stores</p>
              <p className="text-xl font-black text-slate-900">{stores.length}</p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-xl p-4 border border-slate-200">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-amber-50 rounded-lg"><Star className="w-5 h-5 text-amber-500" /></div>
            <div>
              <p className="text-xs text-slate-500 font-bold uppercase">Featured</p>
              <p className="text-xl font-black text-slate-900">{featured.length}</p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-xl p-4 border border-slate-200">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-purple-50 rounded-lg"><TrendingUp className="w-5 h-5 text-purple-600" /></div>
            <div>
              <p className="text-xs text-slate-500 font-bold uppercase">Listings / Views</p>
              <p className="text-xl font-black text-slate-900">{totalListings} / {totalViews.toLocaleString()}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-slate-400 absolute left-4 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search by name, phone, or email..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-12 pr-4 py-3 bg-white border border-slate-200 rounded-xl focus:ring-2 focus:ring-[#00A86B] focus:border-transparent outline-none transition-all text-slate-900"
          />
        </div>
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="px-4 py-3 bg-white border border-slate-200 rounded-xl text-sm font-medium text-slate-700 focus:ring-2 focus:ring-[#00A86B] outline-none"
        >
          <option value="">All profiles</option>
          <option value="store">Store only</option>
          <option value="casual">Casual only</option>
        </select>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 rounded-xl px-4 py-3 text-sm font-medium">
          {error}
        </div>
      )}

      {/* Table */}
      {loading ? (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="w-8 h-8 animate-spin text-[#00A86B]" />
        </div>
      ) : sellers.length === 0 ? (
        <div className="bg-white rounded-xl p-12 border border-slate-200 text-center">
          <Store className="w-16 h-16 text-slate-300 mx-auto mb-4" />
          <p className="text-slate-600 font-medium">No sellers found</p>
        </div>
      ) : (
        <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-slate-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-bold text-slate-500 uppercase tracking-wider">Seller</th>
                  <th className="px-6 py-3 text-left text-xs font-bold text-slate-500 uppercase tracking-wider">Profile</th>
                  <th className="px-6 py-3 text-left text-xs font-bold text-slate-500 uppercase tracking-wider">Rating</th>
                  <th className="px-6 py-3 text-left text-xs font-bold text-slate-500 uppercase tracking-wider">Listings</th>
                  <th className="px-6 py-3 text-left text-xs font-bold text-slate-500 uppercase tracking-wider">Views</th>
                  <th className="px-6 py-3 text-left text-xs font-bold text-slate-500 uppercase tracking-wider">Member Since</th>
                  <th className="px-6 py-3 text-left text-xs font-bold text-slate-500 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {sellers.map((seller) => (
                  <tr key={seller.id} className="hover:bg-slate-50 transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-gradient-to-br from-[#00A86B] to-[#008F5B] rounded-full flex items-center justify-center text-white font-bold text-sm shrink-0">
                          {(seller.full_name || "?")[0]}
                        </div>
                        <div>
                          <div className="flex items-center gap-1.5">
                            <p className="font-medium text-slate-900">{seller.full_name}</p>
                            {seller.is_verified && <BadgeCheck className="w-4 h-4 text-[#00A86B]" />}
                          </div>
                          <p className="text-xs text-slate-500">ID: {seller.id}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex flex-col gap-1.5">
                        <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold w-fit ${
                          seller.seller_status === "store"
                            ? "bg-[#00A86B]/10 text-[#00A86B]"
                            : "bg-slate-100 text-slate-600"
                        }`}>
                          <Store className="w-3 h-3" />
                          {seller.seller_status}
                        </span>
                        <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-wider w-fit ${
                          seller.is_featured_seller
                            ? "bg-amber-100 text-amber-700"
                            : "bg-slate-50 text-slate-400 border border-slate-200"
                        }`}>
                          <Star className="w-3 h-3" />
                          {seller.is_featured_seller ? "Featured" : "Not featured"}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-1.5">
                        <Star className="w-4 h-4 text-amber-500 fill-amber-400" />
                        <span className="font-bold text-slate-900">
                          {seller.review_count > 0 ? seller.avg_rating : "—"}
                        </span>
                        <span className="text-xs text-slate-400">({seller.review_count})</span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-1.5">
                        <Package className="w-4 h-4 text-slate-400" />
                        <span className="font-bold text-slate-900">{seller.active_listings}</span>
                        <span className="text-xs text-slate-400">
                          / {seller.listing_count} total{seller.sold_listings > 0 ? ` · ${seller.sold_listings} sold` : ""}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-1.5">
                        <Eye className="w-4 h-4 text-slate-400" />
                        <span className="text-slate-900 font-medium">{seller.total_views.toLocaleString()}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-sm text-slate-600">
                      {new Date(seller.created_at).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex flex-col gap-2">
                        {busyId === seller.id ? (
                          <Loader2 className="w-4 h-4 animate-spin text-[#00A86B]" />
                        ) : (
                          <>
                            <select
                              value={seller.seller_status}
                              onChange={(e) =>
                                handleUpdate(seller.id, { seller_status: e.target.value as "casual" | "store" })
                              }
                              className="px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs font-medium focus:ring-2 focus:ring-[#00A86B] outline-none"
                            >
                              <option value="casual">Casual</option>
                              <option value="store">Store</option>
                            </select>
                            <button
                              onClick={() => handleUpdate(seller.id, { is_featured_seller: !seller.is_featured_seller })}
                              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-colors ${
                                seller.is_featured_seller
                                  ? "bg-amber-100 text-amber-700 hover:bg-amber-200"
                                  : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                              }`}
                            >
                              <Star className="w-3.5 h-3.5" />
                              {seller.is_featured_seller ? "Unfeature" : "Feature"}
                            </button>
                          </>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};

export default SellerManagement;