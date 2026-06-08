/**
 * ListingEditorModal.tsx
 * Malazone.com — Premium Listing Creation & Editing Interface
 * © 2026 Malazone Technologies PLC
 */

import React, { useState, useEffect } from "react";
import { X, Save, Package, Globe, Tag, Phone, MapPin, ShieldCheck, Star, Loader2 } from "lucide-react";
import { useAdminLanguage } from "../contexts/AdminLanguageContext";

interface ListingForm {
  id?: number;
  title_en: string;
  title_am: string;
  description_en: string;
  description_am: string;
  category: string;
  price: number;
  phone: string;
  whatsapp: string;
  location_key: string;
  is_premium: boolean;
  is_verified: boolean;
  is_active: boolean;
}

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  listing?: any; // If provided, we are in EDIT mode
  onSuccess: () => void;
}

const ListingEditorModal: React.FC<ModalProps> = ({ isOpen, onClose, listing, onSuccess }) => {
  const { t, language } = useAdminLanguage();
  const isAm = language === "amharic";
  const [loading, setLoading] = useState(false);
  
  const [formData, setFormData] = useState<ListingForm>({
    title_en: "",
    title_am: "",
    description_en: "",
    description_am: "",
    category: "property",
    price: 0,
    phone: "",
    whatsapp: "",
    location_key: "hawassa_piassa",
    is_premium: false,
    is_verified: true,
    is_active: true
  });

  useEffect(() => {
    if (listing) {
      setFormData({
        id: listing.id,
        title_en: listing.title_en || "",
        title_am: listing.title_am || "",
        description_en: listing.description_en || "",
        description_am: listing.description_am || "",
        category: listing.category || "property",
        price: listing.price || 0,
        phone: listing.phone || "",
        whatsapp: listing.whatsapp || "",
        location_key: listing.location_key || "hawassa_piassa",
        is_premium: listing.is_premium === 1 || listing.is_premium === true,
        is_verified: listing.is_verified === 1 || listing.is_verified === true,
        is_active: listing.is_active === 1 || listing.is_active === true
      });
    } else {
      setFormData({
        title_en: "",
        title_am: "",
        description_en: "",
        description_am: "",
        category: "property",
        price: 0,
        phone: "",
        whatsapp: "",
        location_key: "hawassa_piassa",
        is_premium: false,
        is_verified: true,
        is_active: true
      });
    }
  }, [listing, isOpen]);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    
    try {
      const url = listing ? `/api/admin/listings/${listing.id}` : "/api/admin/listings";
      const method = listing ? "PUT" : "POST";
      
      const response = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData)
      });
      
      const result = await response.json();
      if (result.success) {
        onSuccess();
        onClose();
      } else {
        alert(result.message);
      }
    } catch (err) {
      alert("Network Error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 sm:p-10">
      <div className="absolute inset-0 bg-slate-950/90 backdrop-blur-2xl animate-fade-in" onClick={onClose} />
      
      <div className="relative w-full max-w-4xl bg-slate-900 border border-white/10 rounded-[3rem] shadow-[0_50px_100px_rgba(0,0,0,0.5)] overflow-hidden flex flex-col max-h-[90vh] animate-zoom-in">
        
        {/* Modal Header */}
        <div className="p-8 border-b border-white/5 bg-slate-950/50 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-2xl bg-green-500/10 flex items-center justify-center text-green-500">
              <Package className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-2xl font-black text-white uppercase italic tracking-tighter">
                {listing ? t("admin.hub.listings.edit") : t("admin.hub.listings.add")}
              </h2>
              <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Malazone Asset Lifecycle Management</p>
            </div>
          </div>
          <button onClick={onClose} className="p-3 rounded-full hover:bg-white/5 text-slate-500 hover:text-white transition-colors">
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Modal Body (Scrollable) */}
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-10 space-y-10 custom-scrollbar">
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
            {/* Left Column: Core Data */}
            <div className="space-y-8">
              {/* Titles */}
              <div className="grid grid-cols-1 gap-6">
                <div className="space-y-3">
                  <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">{t("admin.form.title_en")}</label>
                  <input 
                    required
                    value={formData.title_en}
                    onChange={e => setFormData({...formData, title_en: e.target.value})}
                    className="w-full bg-white/5 border border-white/5 rounded-2xl py-4 px-6 text-white focus:outline-none focus:border-green-500/50 transition-all"
                    placeholder="Luxury Villa..."
                  />
                </div>
                <div className="space-y-3">
                  <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">{t("admin.form.title_am")}</label>
                  <input 
                    required
                    value={formData.title_am}
                    onChange={e => setFormData({...formData, title_am: e.target.value})}
                    className="w-full bg-white/5 border border-white/5 rounded-2xl py-4 px-6 text-white focus:outline-none focus:border-green-500/50 transition-all"
                    placeholder="ምርጥ ቪላ..."
                  />
                </div>
              </div>

              {/* Category & Price */}
              <div className="grid grid-cols-2 gap-6">
                <div className="space-y-3">
                  <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">{t("admin.hub.listings.category")}</label>
                  <select 
                    value={formData.category}
                    onChange={e => setFormData({...formData, category: e.target.value})}
                    className="w-full bg-white/5 border border-white/5 rounded-2xl py-4 px-6 text-white focus:outline-none focus:border-green-500/50 transition-all appearance-none"
                  >
                    <option value="property">Property</option>
                    <option value="motors">Motors</option>
                    <option value="stay">Stay/Rentals</option>
                    <option value="ceremony">Ceremony</option>
                    <option value="heavy">Heavy Machinery</option>
                  </select>
                </div>
                <div className="space-y-3">
                  <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">{t("admin.form.price")}</label>
                  <input 
                    type="number"
                    value={formData.price}
                    onChange={e => setFormData({...formData, price: Number(e.target.value)})}
                    className="w-full bg-white/5 border border-white/5 rounded-2xl py-4 px-6 text-white focus:outline-none focus:border-green-500/50 transition-all font-mono"
                  />
                </div>
              </div>

              {/* Location */}
              <div className="space-y-3">
                <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">{t("admin.form.location")}</label>
                <div className="relative">
                  <MapPin className="absolute left-5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                  <input 
                    value={formData.location_key}
                    onChange={e => setFormData({...formData, location_key: e.target.value})}
                    className="w-full bg-white/5 border border-white/5 rounded-2xl py-4 pl-14 pr-6 text-white focus:outline-none focus:border-green-500/50 transition-all"
                    placeholder="hawassa_tabor"
                  />
                </div>
              </div>
            </div>

            {/* Right Column: Contact & Metadata */}
            <div className="space-y-8">
              {/* Descriptions */}
              <div className="grid grid-cols-1 gap-6">
                <div className="space-y-3">
                  <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">{t("admin.form.desc_en")}</label>
                  <textarea 
                    rows={3}
                    value={formData.description_en}
                    onChange={e => setFormData({...formData, description_en: e.target.value})}
                    className="w-full bg-white/5 border border-white/5 rounded-2xl py-4 px-6 text-white focus:outline-none focus:border-green-500/50 transition-all resize-none"
                  />
                </div>
                <div className="space-y-3">
                  <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">{t("admin.form.desc_am")}</label>
                  <textarea 
                    rows={3}
                    value={formData.description_am}
                    onChange={e => setFormData({...formData, description_am: e.target.value})}
                    className="w-full bg-white/5 border border-white/5 rounded-2xl py-4 px-6 text-white focus:outline-none focus:border-green-500/50 transition-all resize-none"
                  />
                </div>
              </div>

              {/* Contact Info */}
              <div className="grid grid-cols-2 gap-6">
                <div className="space-y-3">
                  <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">{t("admin.form.phone")}</label>
                  <input 
                    value={formData.phone}
                    onChange={e => setFormData({...formData, phone: e.target.value})}
                    className="w-full bg-white/5 border border-white/5 rounded-2xl py-4 px-6 text-white focus:outline-none focus:border-green-500/50 transition-all"
                  />
                </div>
                <div className="space-y-3">
                  <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">{t("admin.form.whatsapp")}</label>
                  <input 
                    value={formData.whatsapp}
                    onChange={e => setFormData({...formData, whatsapp: e.target.value})}
                    className="w-full bg-white/5 border border-white/5 rounded-2xl py-4 px-6 text-white focus:outline-none focus:border-green-500/50 transition-all"
                  />
                </div>
              </div>

              {/* Toggles */}
              <div className="grid grid-cols-3 gap-4">
                {[
                  { key: "is_premium", icon: <Star />, label: t("admin.form.premium") },
                  { key: "is_verified", icon: <ShieldCheck />, label: t("admin.form.verified") },
                  { key: "is_active", icon: <Globe />, label: "Publicly Visible" }
                ].map((toggle) => (
                  <button
                    key={toggle.key}
                    type="button"
                    onClick={() => setFormData({...formData, [toggle.key]: !formData[toggle.key as keyof ListingForm]})}
                    className={`p-4 rounded-2xl border flex flex-col items-center gap-3 transition-all ${
                      formData[toggle.key as keyof ListingForm] 
                        ? 'bg-green-600/10 border-green-500/50 text-green-500' 
                        : 'bg-white/5 border-white/5 text-slate-500'
                    }`}
                  >
                    {React.cloneElement(toggle.icon as React.ReactElement, { className: "w-5 h-5" })}
                    <span className="text-[9px] font-black uppercase tracking-widest text-center leading-tight">{toggle.label}</span>
                  </button>
                ))}
              </div>
            </div>
          </div>
        </form>

        {/* Modal Footer */}
        <div className="p-8 border-t border-white/5 bg-slate-950/50 flex justify-end gap-4">
          <button onClick={onClose} className="px-8 py-4 rounded-2xl text-slate-400 font-black uppercase tracking-widest text-xs hover:text-white transition-all">
            Cancel
          </button>
          <button 
            onClick={handleSubmit}
            disabled={loading}
            className="px-12 py-4 rounded-2xl bg-green-600 hover:bg-green-500 text-white font-black uppercase tracking-widest text-xs shadow-xl transition-all flex items-center gap-3"
          >
            {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
            {t("admin.hub.listings.save")}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ListingEditorModal;
