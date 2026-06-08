/**
 * ListingManagementHub.tsx
 * Malazone.com — Global Inventory & Asset Lifecycle Control
 * © 2026 Malazone Technologies PLC
 */

import React, { useState, useEffect } from "react";
import { 
  Package, 
  Search, 
  Plus, 
  Edit3, 
  Trash2, 
  Globe, 
  EyeOff, 
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
      const response = await fetch(`/api/admin/listings/${id}`, { method: "DELETE" });
      const result = await response.json();
      if (result.success) {
        fetchListings();
      }
    } catch (err) {
      alert("Delete failed");
    }
  };

  const filteredListings = listings.filter(l => 
    (l.title_en?.toLowerCase().includes(searchTerm.toLowerCase())) ||
    (l.title_am?.includes(searchTerm)) ||
    (l.category?.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  return (
    <div className="bg-slate-900 border border-white/5 rounded-[2.5rem] overflow-hidden shadow-2xl">
      {/* Hub Header */}
      <div className="p-10 border-b border-white/5 flex items-center justify-between bg-slate-950/30">
        <div className="space-y-1">
          <h2 className="text-2xl font-black text-white uppercase italic tracking-tighter flex items-center gap-3">
            <Package className="w-6 h-6 text-green-500" />
            {t("admin.hub.listings.title")}
          </h2>
          <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Global Asset Lifecycle & Inventory Control</p>
        </div>
        
        <div className="flex items-center gap-6">
          <div className="relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
            <input 
              type="text" 
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
              placeholder="Filter by title or category..." 
              className="bg-white/5 border border-white/5 rounded-xl py-3 pl-12 pr-6 text-xs text-white focus:outline-none focus:border-green-500/50 transition-all w-64"
            />
          </div>
          <button 
            onClick={() => {
              setEditingListing(null);
              setIsModalOpen(true);
            }}
            className="flex items-center gap-3 px-8 py-3 rounded-xl bg-green-600 hover:bg-green-500 text-white shadow-xl transition-all group"
          >
            <Plus className="w-4 h-4" />
            <span className="text-[10px] font-black uppercase tracking-widest">{t("admin.hub.listings.add")}</span>
          </button>
        </div>
      </div>

      {/* Hub Body */}
      <div className="overflow-x-auto">
        <table className="w-full text-left">
          <thead>
            <tr className="border-b border-white/5 bg-slate-950/10">
              <th className="px-10 py-6 text-[10px] font-black text-slate-500 uppercase tracking-widest">Asset</th>
              <th className="px-10 py-6 text-[10px] font-black text-slate-500 uppercase tracking-widest">{t("admin.hub.listings.category")}</th>
              <th className="px-10 py-6 text-[10px] font-black text-slate-500 uppercase tracking-widest">{t("admin.hub.listings.price")}</th>
              <th className="px-10 py-6 text-[10px] font-black text-slate-500 uppercase tracking-widest">{t("admin.hub.listings.status")}</th>
              <th className="px-10 py-6 text-[10px] font-black text-slate-500 uppercase tracking-widest">Controls</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/5">
            {loading ? (
              <tr>
                <td colSpan={5} className="py-20 text-center">
                  <Loader2 className="w-8 h-8 text-green-500 animate-spin mx-auto" />
                </td>
              </tr>
            ) : filteredListings.map((l) => (
              <tr key={l.id} className="group hover:bg-white/[0.02] transition-colors">
                <td className="px-10 py-6">
                  <div className="flex items-center gap-4">
                    <div className="w-14 h-14 rounded-xl overflow-hidden border border-white/5 shadow-lg">
                      <img 
                        src={typeof l.images === 'string' ? JSON.parse(l.images)[0] : l.images[0]} 
                        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" 
                        alt="Listing" 
                      />
                    </div>
                    <div className="space-y-1">
                      <p className="text-sm font-bold text-white line-clamp-1">{isAm ? l.title_am : l.title_en}</p>
                      <div className="flex items-center gap-2">
                        {l.is_premium === 1 && <Star className="w-3 h-3 text-amber-500 fill-current" />}
                        {l.is_verified === 1 && <ShieldCheck className="w-3 h-3 text-green-500" />}
                        <span className="text-[10px] font-mono text-slate-600">ID: {l.id}</span>
                      </div>
                    </div>
                  </div>
                </td>
                <td className="px-10 py-6">
                  <div className="inline-flex items-center gap-2 px-3 py-1 rounded-lg bg-white/5 border border-white/5 text-[10px] font-black text-slate-400 uppercase tracking-widest">
                    <Tag className="w-3 h-3 text-green-500" />
                    {l.category}
                  </div>
                </td>
                <td className="px-10 py-6">
                  <span className="text-sm font-black text-white italic">{l.price.toLocaleString()} ETB</span>
                </td>
                <td className="px-10 py-6">
                  <div className={`inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-[9px] font-black uppercase tracking-widest border ${
                    l.is_active === 1 
                      ? 'bg-green-500/10 border-green-500/20 text-green-500' 
                      : 'bg-red-500/10 border-red-500/20 text-red-400'
                  }`}>
                    {l.is_active === 1 ? <Globe className="w-3 h-3" /> : <EyeOff className="w-3 h-3" />}
                    {l.is_active === 1 ? t("admin.hub.listings.active") : t("admin.hub.listings.inactive")}
                  </div>
                </td>
                <td className="px-10 py-6">
                  <div className="flex items-center gap-3">
                    <button 
                      onClick={() => {
                        setEditingListing(l);
                        setIsModalOpen(true);
                      }}
                      className="p-3 rounded-xl bg-white/5 border border-white/5 text-slate-400 hover:text-white hover:border-green-500/30 transition-all"
                    >
                      <Edit3 className="w-4 h-4" />
                    </button>
                    <button 
                      onClick={() => handleDelete(l.id)}
                      className="p-3 rounded-xl bg-white/5 border border-white/5 text-slate-400 hover:text-red-500 hover:border-red-500/30 transition-all"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <ListingEditorModal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
        listing={editingListing}
        onSuccess={fetchListings}
      />
    </div>
  );
};

export default ListingManagementHub;
