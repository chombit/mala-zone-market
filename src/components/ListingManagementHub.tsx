/**
 * ListingManagementHub.tsx
 * Malazone.com — Premium Light-Themed Listing Management
 * © 2026 Malazone Technologies PLC
 */

import React, { useState, useEffect } from "react";
import { 
  Package, 
  Search, 
  Plus, 
  Edit3, 
  Trash2, 
  EyeOff, 
  Eye, 
  ShieldCheck, 
  Star,
  Loader2,
  Tag
} from "lucide-react";
import { useAdminLanguage } from "../contexts/AdminLanguageContext";
import ListingEditorModal from "./ListingEditorModal";

const ListingManagementHub: React.FC = () => {
  const { t, language } = useAdminLanguage();
  const isAm = language === "amharic";
  const [loading, setLoading] = useState(true);
  const [listings, setListings] = useState<any[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingListing, setEditingListing] = useState<any>(null);
  const [searchTerm, setSearchTerm] = useState("");

  const fetchListings = async () => {
    setLoading(true);
    try {
      const response = await fetch("/api/listings?limit=100");
      const result = await response.json();
      if (result.success) {
        setListings(result.data);
      }
    } catch (err) {
      console.error("Failed to fetch listings:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchListings();
  }, []);

  const handleDelete = async (id: number) => {
    if (!window.confirm("Are you sure you want to delete this asset from Malazone?")) return;
    
    try {
      const response = await fetch(`/api/admin/listings/${id}`, {
        method: "DELETE",
        credentials: "include",
      });
      const result = await response.json();
      if (result.success) {
        fetchListings();
      }
    } catch (err) {
      alert("Delete failed");
    }
  };

  const handleToggleVisibility = async (listing: any) => {
    try {
      const response = await fetch(`/api/admin/listings/${listing.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ is_active: !listing.is_active }),
      });
      const result = await response.json();
      if (result.success) {
        fetchListings();
      }
    } catch (err) {
      alert("Toggle visibility failed");
    }
  };

  const filteredListings = listings.filter(l => 
    (l.title_en?.toLowerCase().includes(searchTerm.toLowerCase())) ||
    (l.title_am?.includes(searchTerm)) ||
    (l.category?.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  return (
    <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-sm">
      {/* Hub Header */}
      <div className="p-6 border-b border-slate-200 flex items-center justify-between bg-slate-50/50">
        <div className="space-y-1">
          <h2 className="text-xl font-black text-malazone-navy tracking-tight flex items-center gap-3">
            <Package className="w-6 h-6 text-[#00A86B]" />
            {t("admin.hub.listings.title")}
          </h2>
          <p className="text-xs font-bold text-malazone-navy uppercase tracking-widest">Global Asset Lifecycle & Inventory Control</p>
        </div>
        
        <div className="flex items-center gap-4">
          <div className="relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-malazone-navy" />
            <input 
              type="text" 
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
              placeholder="Filter by title or category..." 
              className="bg-white border border-slate-200 rounded-xl py-2.5 pl-12 pr-5 text-sm text-malazone-navy focus:outline-none focus:border-[#00A86B]/50 transition-all w-64"
            />
          </div>
          <button 
            onClick={() => {
              setEditingListing(null);
              setIsModalOpen(true);
            }}
            className="flex items-center gap-3 px-5 py-2.5 rounded-xl bg-[#00A86B] hover:bg-[#00A86B]/90 text-white shadow-lg shadow-[#00A86B]/25 transition-all font-bold text-sm"
          >
            <Plus className="w-4 h-4" />
            Add New Listing
          </button>
        </div>
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        {loading ? (
          <div className="p-20 flex items-center justify-center">
            <Loader2 className="w-8 h-8 text-[#00A86B] animate-spin" />
          </div>
        ) : filteredListings.length === 0 ? (
          <div className="p-20 text-center">
            <Package className="w-16 h-16 text-slate-300 mx-auto mb-4" />
            <p className="text-malazone-navy font-bold">No listings found</p>
          </div>
        ) : (
          <table className="w-full">
            <thead className="bg-slate-50/50">
              <tr>
                <th className="px-6 py-4 text-left text-xs font-black uppercase tracking-wider text-malazone-navy">
                  Asset
                </th>
                <th className="px-6 py-4 text-left text-xs font-black uppercase tracking-wider text-malazone-navy">
                  Category
                </th>
                <th className="px-6 py-4 text-left text-xs font-black uppercase tracking-wider text-malazone-navy">
                  Price
                </th>
                <th className="px-6 py-4 text-left text-xs font-black uppercase tracking-wider text-malazone-navy">
                  Status
                </th>
                <th className="px-6 py-4 text-left text-xs font-black uppercase tracking-wider text-malazone-navy">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredListings.map(listing => (
                <tr key={listing.id} className="hover:bg-slate-50 transition-colors">
                  <td className="px-6 py-5">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 bg-slate-100 rounded-xl flex items-center justify-center text-malazone-navy">
                        <Package className="w-5 h-5" />
                      </div>
                      <div>
                        <p className="text-sm font-bold text-malazone-navy">
                          {isAm ? listing.title_am : listing.title_en}
                        </p>
                        <p className="text-xs text-malazone-navy">
                          ID: #{listing.id}
                        </p>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-5">
                    <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-slate-100 text-malazone-navy text-xs font-bold rounded-full">
                      <Tag className="w-3 h-3" />
                      {listing.category}
                    </span>
                  </td>
                  <td className="px-6 py-5">
                    <p className="text-sm font-bold text-malazone-navy">
                      {(listing.price || 0).toLocaleString()} ETB
                    </p>
                  </td>
                  <td className="px-6 py-5">
                    {listing.verified ? (
                      <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-[#00A86B]/10 text-[#00A86B] text-xs font-bold rounded-full">
                        <ShieldCheck className="w-3 h-3" />
                        Verified
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-amber-500/10 text-amber-600 text-xs font-bold rounded-full">
                        <Star className="w-3 h-3" />
                        Pending
                      </span>
                    )}
                  </td>
                  <td className="px-6 py-5">
                    <div className="flex items-center gap-2">
                      <button 
                        onClick={() => {
                          setEditingListing(listing);
                          setIsModalOpen(true);
                        }}
                        className="p-2 bg-slate-50 border border-slate-200 rounded-lg text-malazone-navy hover:bg-slate-100 hover:text-malazone-navy transition-all"
                      >
                        <Edit3 className="w-4 h-4" />
                      </button>
                      <button 
                        onClick={() => handleDelete(listing.id)}
                        className="p-2 bg-red-50 border border-red-200 rounded-lg text-red-600 hover:bg-red-100 hover:text-red-700 transition-all"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                      <button 
                        onClick={() => handleToggleVisibility(listing)}
                        className="p-2 bg-slate-50 border border-slate-200 rounded-lg text-malazone-navy hover:bg-slate-100 hover:text-malazone-navy transition-all"
                        title={listing.is_active !== false ? "Hide listing" : "Show listing"}
                      >
                        {listing.is_active !== false ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {isModalOpen && (
        <ListingEditorModal 
          isOpen={isModalOpen} 
          onClose={() => setIsModalOpen(false)}
          listing={editingListing}
          onSuccess={fetchListings}
        />
      )}
    </div>
  );
};

export default ListingManagementHub;
