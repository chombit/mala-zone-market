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
  price_suffix: string;
  phone: string;
  whatsapp: string;
  location_key: string;
  is_premium: boolean;
  is_verified: boolean;
  is_active: boolean;
  images: string[];
  // Zone specific
  plate_code?: string;
  fuel_type?: string;
  condition_type?: string;
  area_sqm?: number;
  capacity?: number;
  with_operator?: boolean;
  is_zero_km?: boolean;
  bedrooms?: number;
  bathrooms?: number;
  title_deed?: string;
  imei_serial?: string;
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
    price_suffix: "fixed",
    phone: "",
    whatsapp: "",
    location_key: "hawassa_piassa",
    is_premium: false,
    is_verified: true,
    is_active: true,
    images: ["https://images.unsplash.com/photo-1560518883-ce09059eeffa?w=800&q=80&fm=webp"],
    plate_code: "",
    fuel_type: "benzine",
    condition_type: "used",
    area_sqm: 0,
    capacity: 0,
    with_operator: false,
    is_zero_km: false,
    bedrooms: 0,
    bathrooms: 0,
    title_deed: "carta",
    imei_serial: ""
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
        price_suffix: listing.price_suffix || "fixed",
        phone: listing.phone || "",
        whatsapp: listing.whatsapp || "",
        location_key: listing.location_key || "hawassa_piassa",
        is_premium: listing.is_premium === 1 || listing.is_premium === true,
        is_verified: listing.is_verified === 1 || listing.is_verified === true,
        is_active: listing.is_active === 1 || listing.is_active === true,
        images: typeof listing.images === 'string' ? JSON.parse(listing.images) : (listing.images || ["https://images.unsplash.com/photo-1560518883-ce09059eeffa?w=800&q=80&fm=webp"]),
        plate_code: listing.plate_code || "",
        fuel_type: listing.fuel_type || "benzine",
        condition_type: listing.condition_type || "used",
        area_sqm: listing.area_sqm || 0,
        capacity: listing.capacity || 0,
        with_operator: listing.with_operator === 1 || listing.with_operator === true,
        is_zero_km: listing.is_zero_km === 1 || listing.is_zero_km === true,
        bedrooms: listing.bedrooms || 0,
        bathrooms: listing.bathrooms || 0,
        title_deed: listing.title_deed || "carta",
        imei_serial: listing.imei_serial || ""
      });
    } else {
      setFormData({
        title_en: "",
        title_am: "",
        description_en: "",
        description_am: "",
        category: "property",
        price: 0,
        price_suffix: "fixed",
        phone: "",
        whatsapp: "",
        location_key: "hawassa_piassa",
        is_premium: false,
        is_verified: true,
        is_active: true,
        images: ["https://images.unsplash.com/photo-1560518883-ce09059eeffa?w=800&q=80&fm=webp"],
        plate_code: "",
        fuel_type: "benzine",
        condition_type: "used",
        area_sqm: 0,
        capacity: 0,
        with_operator: false,
        is_zero_km: false,
        bedrooms: 0,
        bathrooms: 0,
        title_deed: "carta",
        imei_serial: ""
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
      <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-xl animate-fade-in" onClick={onClose} />
      
      <div className="relative w-full max-w-4xl bg-white border border-slate-200 rounded-[2.5rem] shadow-xl overflow-hidden flex flex-col max-h-[90vh] animate-zoom-in">
        
        {/* Modal Header */}
        <div className="p-8 border-b border-slate-200 bg-slate-50 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-2xl bg-[#00A86B]/10 flex items-center justify-center text-[#00A86B]">
              <Package className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-2xl font-black text-malazone-navy tracking-tight">
                {listing ? t("admin.hub.listings.edit") : t("admin.hub.listings.add")}
              </h2>
              <p className="text-[10px] font-bold text-malazone-navy uppercase tracking-widest">Malazone Asset Lifecycle Management</p>
            </div>
          </div>
          <button onClick={onClose} className="p-3 rounded-full hover:bg-slate-100 text-malazone-navy hover:text-malazone-navy transition-colors">
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
                  <label className="text-[10px] font-black text-malazone-navy uppercase tracking-widest ml-1">{t("admin.form.title_en")}</label>
                  <input 
                    required
                    value={formData.title_en}
                    onChange={e => setFormData({...formData, title_en: e.target.value})}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl py-4 px-6 text-malazone-navy focus:outline-none focus:border-[#00A86B]/50 focus:ring-2 focus:ring-[#00A86B]/20 transition-all"
                    placeholder="Luxury Villa..."
                  />
                </div>
                <div className="space-y-3">
                  <label className="text-[10px] font-black text-malazone-navy uppercase tracking-widest ml-1">{t("admin.form.title_am")}</label>
                  <input 
                    required
                    value={formData.title_am}
                    onChange={e => setFormData({...formData, title_am: e.target.value})}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl py-4 px-6 text-malazone-navy focus:outline-none focus:border-[#00A86B]/50 focus:ring-2 focus:ring-[#00A86B]/20 transition-all"
                    placeholder="ምርጥ ቪላ..."
                  />
                </div>
              </div>

              {/* Category & Price */}
              <div className="grid grid-cols-2 gap-6">
                <div className="space-y-3">
                  <label className="text-[10px] font-black text-malazone-navy uppercase tracking-widest ml-1">{t("admin.hub.listings.category")}</label>
                  <select 
                    value={formData.category}
                    onChange={e => setFormData({...formData, category: e.target.value})}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl py-4 px-6 text-malazone-navy focus:outline-none focus:border-[#00A86B]/50 focus:ring-2 focus:ring-[#00A86B]/20 transition-all appearance-none"
                  >
                    <option value="property">Property</option>
                    <option value="motors">Motors</option>
                    <option value="stay">Stay/Rentals</option>
                    <option value="ceremony">Ceremony</option>
                    <option value="heavy">Heavy Machinery</option>
                    <option value="electronics">Electronics</option>
                  </select>
                </div>
                <div className="space-y-3">
                  <label className="text-[10px] font-black text-malazone-navy uppercase tracking-widest ml-1">{t("admin.form.price")}</label>
                  <div className="flex gap-2">
                    <input 
                      type="number"
                      value={formData.price}
                      onChange={e => setFormData({...formData, price: Number(e.target.value)})}
                      className="flex-1 bg-slate-50 border border-slate-200 rounded-xl py-4 px-6 text-malazone-navy focus:outline-none focus:border-[#00A86B]/50 focus:ring-2 focus:ring-[#00A86B]/20 transition-all font-mono"
                    />
                    <select
                      value={formData.price_suffix}
                      onChange={e => setFormData({...formData, price_suffix: e.target.value})}
                      className="w-32 bg-slate-50 border border-slate-200 rounded-xl py-4 px-4 text-malazone-navy focus:outline-none focus:border-[#00A86B]/50 focus:ring-2 focus:ring-[#00A86B]/20 transition-all appearance-none text-[10px] font-black uppercase"
                    >
                      <option value="fixed">Fixed</option>
                      <option value="per_day">/ Day</option>
                      <option value="per_hour">/ Hour</option>
                      <option value="per_month">/ Month</option>
                    </select>
                  </div>
                </div>
              </div>

              {/* Location */}
              <div className="space-y-3">
                <label className="text-[10px] font-black text-malazone-navy uppercase tracking-widest ml-1">{t("admin.form.location")}</label>
                <div className="relative">
                  <MapPin className="absolute left-5 top-1/2 -translate-y-1/2 w-4 h-4 text-malazone-navy" />
                  <select 
                    value={formData.location_key}
                    onChange={e => setFormData({...formData, location_key: e.target.value})}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl py-4 pl-14 pr-6 text-malazone-navy focus:outline-none focus:border-[#00A86B]/50 focus:ring-2 focus:ring-[#00A86B]/20 transition-all appearance-none"
                  >
                    <option value="hawassa_piassa">Hawassa - Piassa</option>
                    <option value="hawassa_tabor">Hawassa - Tabor</option>
                    <option value="hawassa_lakefront">Hawassa - Lakefront</option>
                    <option value="yirgalem">Yirgalem</option>
                    <option value="bensa">Bensa</option>
                    <option value="chuko">Chuko</option>
                    <option value="aleta_wondo">Aleta Wondo</option>
                  </select>
                </div>
              </div>

              {/* Images */}
              <div className="space-y-3">
                <label className="text-[10px] font-black text-malazone-navy uppercase tracking-widest ml-1">Asset Image URL</label>
                <div className="relative">
                  <Globe className="absolute left-5 top-1/2 -translate-y-1/2 w-4 h-4 text-malazone-navy" />
                  <input 
                    value={formData.images[0]}
                    onChange={e => setFormData({...formData, images: [e.target.value]})}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl py-4 pl-14 pr-6 text-malazone-navy focus:outline-none focus:border-[#00A86B]/50 focus:ring-2 focus:ring-[#00A86B]/20 transition-all"
                    placeholder="https://images.unsplash.com/..."
                  />
                </div>
                {formData.images[0] && (
                  <div className="mt-4 w-32 h-20 rounded-xl overflow-hidden border border-slate-200">
                    <img src={formData.images[0]} className="w-full h-full object-cover" alt="Preview" />
                  </div>
                )}
              </div>

              {/* ── Dynamic Zone Specific Fields ── */}
              <div className="p-8 rounded-2xl bg-slate-50 border border-slate-200 space-y-8 animate-fade-in">
                <p className="text-[10px] font-black text-[#00A86B] uppercase tracking-[0.3em] mb-4">Zone Specific Details</p>
                
                {/* Motors / Heavy Machinery */}
                {(formData.category === 'motors' || formData.category === 'heavy') && (
                  <div className="grid grid-cols-2 gap-6">
                    <div className="space-y-3">
                      <label className="text-[10px] font-black text-malazone-navy uppercase tracking-widest ml-1">Plate Code</label>
                      <input 
                        value={formData.plate_code}
                        onChange={e => setFormData({...formData, plate_code: e.target.value})}
                        className="w-full bg-white border border-slate-200 rounded-xl py-4 px-6 text-malazone-navy focus:outline-none focus:border-[#00A86B]/50 focus:ring-2 focus:ring-[#00A86B]/20 transition-all"
                        placeholder="Code 2..."
                      />
                    </div>
                    <div className="space-y-3">
                      <label className="text-[10px] font-black text-malazone-navy uppercase tracking-widest ml-1">Fuel Type</label>
                      <select 
                        value={formData.fuel_type}
                        onChange={e => setFormData({...formData, fuel_type: e.target.value})}
                        className="w-full bg-white border border-slate-200 rounded-xl py-4 px-6 text-malazone-navy focus:outline-none focus:border-[#00A86B]/50 focus:ring-2 focus:ring-[#00A86B]/20 transition-all appearance-none"
                      >
                        <option value="benzine">Benzine</option>
                        <option value="diesel">Diesel</option>
                        <option value="electric">Electric</option>
                        <option value="hybrid">Hybrid</option>
                      </select>
                    </div>
                    <div className="space-y-3">
                      <label className="text-[10px] font-black text-malazone-navy uppercase tracking-widest ml-1">Condition</label>
                      <select 
                        value={formData.condition_type}
                        onChange={e => setFormData({...formData, condition_type: e.target.value})}
                        className="w-full bg-white border border-slate-200 rounded-xl py-4 px-6 text-malazone-navy focus:outline-none focus:border-[#00A86B]/50 focus:ring-2 focus:ring-[#00A86B]/20 transition-all appearance-none"
                      >
                        <option value="new">Brand New</option>
                        <option value="invoiced">Invoiced (Duty Free)</option>
                        <option value="used">Locally Used</option>
                      </select>
                    </div>
                    <div className="flex flex-col justify-center gap-4">
                      <label className="flex items-center gap-3 cursor-pointer group">
                        <input 
                          type="checkbox"
                          checked={formData.is_zero_km}
                          onChange={e => setFormData({...formData, is_zero_km: e.target.checked})}
                          className="w-5 h-5 rounded-lg border-slate-300 bg-slate-50 text-[#00A86B] focus:ring-[#00A86B]/50 focus:ring-offset-0 transition-all"
                        />
                        <span className="text-[10px] font-bold text-malazone-navy uppercase tracking-widest group-hover:text-malazone-navy transition-colors">Zero KM</span>
                      </label>
                      <label className="flex items-center gap-3 cursor-pointer group">
                        <input 
                          type="checkbox"
                          checked={formData.with_operator}
                          onChange={e => setFormData({...formData, with_operator: e.target.checked})}
                          className="w-5 h-5 rounded-lg border-slate-300 bg-slate-50 text-[#00A86B] focus:ring-[#00A86B]/50 focus:ring-offset-0 transition-all"
                        />
                        <span className="text-[10px] font-bold text-malazone-navy uppercase tracking-widest group-hover:text-malazone-navy transition-colors">With Operator</span>
                      </label>
                    </div>
                  </div>
                )}

                {/* Property / Stay */}
                {(formData.category === 'property' || formData.category === 'stay') && (
                  <div className="space-y-6">
                    <div className="grid grid-cols-2 gap-6">
                      <div className="space-y-3">
                        <label className="text-[10px] font-black text-malazone-navy uppercase tracking-widest ml-1">Area (SQM)</label>
                        <input 
                          type="number"
                          value={formData.area_sqm}
                          onChange={e => setFormData({...formData, area_sqm: Number(e.target.value)})}
                          className="w-full bg-white border border-slate-200 rounded-xl py-4 px-6 text-malazone-navy focus:outline-none focus:border-[#00A86B]/50 focus:ring-2 focus:ring-[#00A86B]/20 transition-all"
                        />
                      </div>
                      <div className="space-y-3">
                        <label className="text-[10px] font-black text-malazone-navy uppercase tracking-widest ml-1">Capacity (Pax/Guests)</label>
                        <input 
                          type="number"
                          value={formData.capacity}
                          onChange={e => setFormData({...formData, capacity: Number(e.target.value)})}
                          className="w-full bg-white border border-slate-200 rounded-xl py-4 px-6 text-malazone-navy focus:outline-none focus:border-[#00A86B]/50 focus:ring-2 focus:ring-[#00A86B]/20 transition-all"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-3 gap-6">
                      <div className="space-y-3">
                        <label className="text-[10px] font-black text-malazone-navy uppercase tracking-widest ml-1">Bedrooms</label>
                        <input 
                          type="number"
                          value={formData.bedrooms}
                          onChange={e => setFormData({...formData, bedrooms: Number(e.target.value)})}
                          className="w-full bg-white border border-slate-200 rounded-xl py-4 px-6 text-malazone-navy focus:outline-none focus:border-[#00A86B]/50 focus:ring-2 focus:ring-[#00A86B]/20 transition-all"
                        />
                      </div>
                      <div className="space-y-3">
                        <label className="text-[10px] font-black text-malazone-navy uppercase tracking-widest ml-1">Bathrooms</label>
                        <input 
                          type="number"
                          value={formData.bathrooms}
                          onChange={e => setFormData({...formData, bathrooms: Number(e.target.value)})}
                          className="w-full bg-white border border-slate-200 rounded-xl py-4 px-6 text-malazone-navy focus:outline-none focus:border-[#00A86B]/50 focus:ring-2 focus:ring-[#00A86B]/20 transition-all"
                        />
                      </div>
                      <div className="space-y-3">
                        <label className="text-[10px] font-black text-malazone-navy uppercase tracking-widest ml-1">Title Deed</label>
                        <select 
                          value={formData.title_deed}
                          onChange={e => setFormData({...formData, title_deed: e.target.value})}
                          className="w-full bg-white border border-slate-200 rounded-xl py-4 px-6 text-malazone-navy focus:outline-none focus:border-[#00A86B]/50 focus:ring-2 focus:ring-[#00A86B]/20 transition-all appearance-none"
                        >
                          <option value="carta">Verified Carta</option>
                          <option value="village">Village Deed</option>
                          <option value="none">No Deed</option>
                        </select>
                      </div>
                    </div>
                  </div>
                )}

                {/* Ceremony */}
                {formData.category === 'ceremony' && (
                  <div className="space-y-3">
                    <label className="text-[10px] font-black text-malazone-navy uppercase tracking-widest ml-1">Equipment Capacity / Count</label>
                    <input 
                      type="number"
                      value={formData.capacity}
                      onChange={e => setFormData({...formData, capacity: Number(e.target.value)})}
                      className="w-full bg-white border border-slate-200 rounded-xl py-4 px-6 text-malazone-navy focus:outline-none focus:border-[#00A86B]/50 focus:ring-2 focus:ring-[#00A86B]/20 transition-all"
                      placeholder="e.g. 500 chairs..."
                    />
                  </div>
                )}

                {/* Electronics */}
                {formData.category === 'electronics' && (
                  <div className="space-y-3">
                    <label className="text-[10px] font-black text-slate-900 uppercase tracking-widest ml-1">
                      የመሣሪያው IMEI ቁጥር ወይም ሲሪያል (Device IMEI/Serial Number)
                    </label>
                    <input 
                      required
                      type="text"
                      placeholder="e.g., IMEI 35492100..."
                      value={formData.imei_serial || ''}
                      onChange={e => setFormData({...formData, imei_serial: e.target.value})}
                      className="w-full bg-slate-50 border border-rose-200/80 rounded-xl py-4 px-6 text-slate-900 font-black tracking-widest focus:outline-none focus:border-[#00A86B]/50 focus:ring-2 focus:ring-[#00A86B]/20 transition-all placeholder:text-slate-300 normal-case"
                    />
                  </div>
                )}
              </div>
            </div>

            {/* Right Column: Contact & Metadata */}
            <div className="space-y-8">
              {/* Descriptions */}
              <div className="grid grid-cols-1 gap-6">
                <div className="space-y-3">
                  <label className="text-[10px] font-black text-malazone-navy uppercase tracking-widest ml-1">{t("admin.form.desc_en")}</label>
                  <textarea 
                    rows={3}
                    value={formData.description_en}
                    onChange={e => setFormData({...formData, description_en: e.target.value})}
                    className="w-full bg-white border border-slate-200 rounded-xl py-4 px-6 text-malazone-navy focus:outline-none focus:border-[#00A86B]/50 focus:ring-2 focus:ring-[#00A86B]/20 transition-all resize-none"
                  />
                </div>
                <div className="space-y-3">
                  <label className="text-[10px] font-black text-malazone-navy uppercase tracking-widest ml-1">{t("admin.form.desc_am")}</label>
                  <textarea 
                    rows={3}
                    value={formData.description_am}
                    onChange={e => setFormData({...formData, description_am: e.target.value})}
                    className="w-full bg-white border border-slate-200 rounded-xl py-4 px-6 text-malazone-navy focus:outline-none focus:border-[#00A86B]/50 focus:ring-2 focus:ring-[#00A86B]/20 transition-all resize-none"
                  />
                </div>
              </div>

              {/* Contact Info */}
              <div className="grid grid-cols-2 gap-6">
                <div className="space-y-3">
                  <label className="text-[10px] font-black text-malazone-navy uppercase tracking-widest ml-1">{t("admin.form.phone")}</label>
                  <input 
                    value={formData.phone}
                    onChange={e => setFormData({...formData, phone: e.target.value})}
                    className="w-full bg-white border border-slate-200 rounded-xl py-4 px-6 text-malazone-navy focus:outline-none focus:border-[#00A86B]/50 focus:ring-2 focus:ring-[#00A86B]/20 transition-all"
                  />
                </div>
                <div className="space-y-3">
                  <label className="text-[10px] font-black text-malazone-navy uppercase tracking-widest ml-1">{t("admin.form.whatsapp")}</label>
                  <input 
                    value={formData.whatsapp}
                    onChange={e => setFormData({...formData, whatsapp: e.target.value})}
                    className="w-full bg-white border border-slate-200 rounded-xl py-4 px-6 text-malazone-navy focus:outline-none focus:border-[#00A86B]/50 focus:ring-2 focus:ring-[#00A86B]/20 transition-all"
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
                        ? 'bg-[#00A86B]/10 border-[#00A86B]/30 text-[#00A86B]' 
                        : 'bg-slate-50 border-slate-200 text-malazone-navy'
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
        <div className="p-8 border-t border-slate-200 bg-slate-50 flex justify-end gap-4">
          <button onClick={onClose} className="px-8 py-4 rounded-xl text-malazone-navy font-black uppercase tracking-widest text-xs hover:text-malazone-navy transition-all">
            Cancel
          </button>
          <button 
            onClick={handleSubmit}
            disabled={loading}
            className="px-12 py-4 rounded-xl bg-[#00A86B] hover:bg-[#00A86B]/90 text-white font-black uppercase tracking-widest text-xs shadow-xl shadow-[#00A86B]/25 transition-all flex items-center gap-3"
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
