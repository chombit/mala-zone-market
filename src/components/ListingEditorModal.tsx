/**
 * ListingEditorModal.tsx
 * Malazone.com — Premium Listing Creation & Editing Interface
 * © 2026 Malazone Technologies PLC
 */

import React, { useState, useEffect, useRef } from "react";
import { X, Save, Package, Globe, Tag, Phone, MapPin, ShieldCheck, Star, Loader2, Camera, Trash2, ImagePlus } from "lucide-react";
import { useAdminLanguage } from "../contexts/AdminLanguageContext";
import { pickDbLabel } from "../utils/dbLabel";

interface LocationFromAPI {
  id: number;
  key_name: string;
  label_en: string;
  label_am: string;
  sub_zones: SubZoneFromAPI[] | string | null;
  is_active: number;
}

interface SubZoneFromAPI {
  key: string;
  label_en: string;
  label_am: string;
}

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
  location_label_en: string;
  location_label_am: string;
  is_premium: boolean;
  is_verified: boolean;
  is_active: boolean;
  images: string[];
  // Zone specific
  sub_category?: string;
  sub_category_size?: string;
  vehicle_brand?: string;
  manufacture_year?: number;
  is_parking_available?: boolean;
  is_furnished?: boolean;
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
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [newImages, setNewImages] = useState<File[]>([]);
  const [existingImages, setExistingImages] = useState<string[]>([]);
  const [locations, setLocations] = useState<LocationFromAPI[]>([]);
  const [selectedCity, setSelectedCity] = useState<string>("hawassa");
  const [selectedSubZone, setSelectedSubZone] = useState<string>("tabor");

  const parseSubZones = (subZones: SubZoneFromAPI[] | string | null | undefined): SubZoneFromAPI[] => {
    if (!subZones) return [];
    if (Array.isArray(subZones)) return subZones;
    try {
      const parsed = JSON.parse(subZones as string);
      return Array.isArray(parsed) ? parsed : [];
    } catch {
      return [];
    }
  };

  useEffect(() => {
    const fetchLocations = async () => {
      try {
        const res = await fetch("/api/locations");
        const data = await res.json();
        if (data.success && Array.isArray(data.data)) {
          setLocations(data.data);
        }
      } catch (err) {
        console.error("Failed to fetch locations:", err);
      }
    };
    fetchLocations();
  }, []);

  const selectedCityData = locations.find((l) => l.key_name === selectedCity);
  const subZonesList = parseSubZones(selectedCityData?.sub_zones);

  const buildLocationKey = () => {
    if (selectedSubZone) {
      return `${selectedCity}_${selectedSubZone}`;
    }
    return selectedCity;
  };

  const getLocationLabels = () => {
    const city = locations.find((l) => l.key_name === selectedCity);
    const subZone = parseSubZones(city?.sub_zones).find((sz) => sz.key === selectedSubZone);
    
    let label_en = city?.label_en || selectedCity;
    let label_am = city?.label_am || selectedCity;
    
    if (subZone) {
      label_en = `${city?.label_en} - ${subZone.label_en}`;
      label_am = `${city?.label_am} - ${subZone.label_am}`;
    }
    
    return { label_en, label_am };
  };

  const parseLocationKey = (locKey: string): { city: string; subZone: string } => {
    if (!locKey) return { city: "hawassa", subZone: "tabor" };
    const parts = locKey.split("_");
    if (parts.length >= 2) {
      const possibleCity = parts[0];
      const rest = parts.slice(1).join("_");
      const cityExists = locations.some((l) => l.key_name === possibleCity);
      if (cityExists) {
        return { city: possibleCity, subZone: rest };
      }
      const twoWordCity = parts.slice(0, 2).join("_");
      const twoWordExists = locations.some((l) => l.key_name === twoWordCity);
      if (twoWordExists && parts.length >= 3) {
        return { city: twoWordCity, subZone: parts.slice(2).join("_") };
      }
      if (twoWordExists) {
        return { city: twoWordCity, subZone: "" };
      }
    }
    const cityMatch = locations.find((l) => l.key_name === locKey || locKey.startsWith(l.key_name + "_"));
    if (cityMatch) {
      const subPart = locKey.substring(cityMatch.key_name.length + 1);
      return { city: cityMatch.key_name, subZone: subPart || "" };
    }
    return { city: "hawassa", subZone: "" };
  };
  
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
    location_key: "hawassa_tabor",
    location_label_en: "Hawassa - Tabor Sub City",
        location_label_am: "ሀዋሳ - ታቦር ክፍለ ከተማ",
    is_premium: false,
    is_verified: true,
    is_active: true,
    images: ["https://images.unsplash.com/photo-1560518883-ce09059eeffa?w=800&q=80&fm=webp"],
    sub_category: "",
  sub_category_size: "",
    vehicle_brand: "",
    manufacture_year: new Date().getFullYear(),
    is_parking_available: false,
    is_furnished: false,
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
    if (locations.length === 0) return;
    setNewImages([]);
    if (listing) {
      const parsedImages = typeof listing.images === 'string' ? JSON.parse(listing.images) : (listing.images || []);
      setExistingImages(parsedImages);
      const parsed = parseLocationKey(listing.location_key || "hawassa_tabor");
      setSelectedCity(parsed.city);
      setSelectedSubZone(parsed.subZone);
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
        location_key: listing.location_key || "hawassa_tabor",
        location_label_en: listing.location_label_en || "",
        location_label_am: listing.location_label_am || "",
        is_premium: listing.is_premium === 1 || listing.is_premium === true,
        is_verified: listing.is_verified === 1 || listing.is_verified === true,
        is_active: listing.is_active === 1 || listing.is_active === true,
        images: parsedImages.length > 0 ? parsedImages : ["https://images.unsplash.com/photo-1560518883-ce09059eeffa?w=800&q=80&fm=webp"],
        sub_category: listing.sub_category || "",
        vehicle_brand: listing.vehicle_brand || "",
        manufacture_year: listing.manufacture_year || new Date().getFullYear(),
        is_parking_available: listing.is_parking_available === 1 || listing.is_parking_available === true,
        is_furnished: listing.is_furnished === 1 || listing.is_furnished === true,
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
      setExistingImages([]);
      setSelectedCity("hawassa");
      const cityData = locations.find((l) => l.key_name === "hawassa");
      const subZones = parseSubZones(cityData?.sub_zones);
      setSelectedSubZone(subZones.length > 0 ? subZones[0].key : "tabor");
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
        location_key: "hawassa_tabor",
        location_label_en: "Hawassa - Tabor Sub City",
    location_label_am: "ሀዋሳ - ታቦር ክፍለ ከተማ",
        is_premium: false,
        is_verified: true,
        is_active: true,
        images: [],
        sub_category: "",
  sub_category_size: "",
        vehicle_brand: "",
        manufacture_year: new Date().getFullYear(),
        is_parking_available: false,
        is_furnished: false,
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
  }, [listing, isOpen, locations]);

  useEffect(() => {
    const locKey = buildLocationKey();
    const labels = getLocationLabels();
    setFormData(prev => ({
      ...prev,
      location_key: locKey,
      location_label_en: labels.label_en,
      location_label_am: labels.label_am,
    }));
  }, [selectedCity, selectedSubZone, locations]);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    
    try {
      const url = listing ? `/api/admin/listings/${listing.id}` : "/api/admin/listings";
      const method = listing ? "PUT" : "POST";
      
      const locKey = buildLocationKey();
      const labels = getLocationLabels();
      const fd = new FormData();
      fd.append('title_en', formData.title_en);
      fd.append('title_am', formData.title_am);
      fd.append('description_en', formData.description_en);
      fd.append('description_am', formData.description_am);
      fd.append('category', formData.category);
      fd.append('price', String(formData.price));
      fd.append('price_suffix', formData.price_suffix);
      fd.append('phone', formData.phone);
      fd.append('whatsapp', formData.whatsapp);
      fd.append('location_key', locKey);
      fd.append('location_label_en', labels.label_en);
      fd.append('location_label_am', labels.label_am);
      fd.append('is_premium', formData.is_premium ? '1' : '0');
      fd.append('is_verified', formData.is_verified ? '1' : '0');
      fd.append('is_active', formData.is_active ? '1' : '0');
      fd.append('existing_images', JSON.stringify(existingImages));
      if (formData.sub_category) fd.append('sub_category', formData.sub_category);
      if (formData.vehicle_brand) fd.append('vehicle_brand', formData.vehicle_brand);
      if (formData.manufacture_year) fd.append('manufacture_year', String(formData.manufacture_year));
      fd.append('is_parking_available', formData.is_parking_available ? '1' : '0');
      fd.append('is_furnished', formData.is_furnished ? '1' : '0');
      if (formData.plate_code) fd.append('plate_code', formData.plate_code);
      if (formData.fuel_type) fd.append('fuel_type', formData.fuel_type);
      if (formData.condition_type) fd.append('condition_type', formData.condition_type);
      if (formData.area_sqm) fd.append('area_sqm', String(formData.area_sqm));
      if (formData.capacity) fd.append('capacity', String(formData.capacity));
      fd.append('with_operator', formData.with_operator ? '1' : '0');
      fd.append('is_zero_km', formData.is_zero_km ? '1' : '0');
      if (formData.bedrooms) fd.append('bedrooms', String(formData.bedrooms));
      if (formData.bathrooms) fd.append('bathrooms', String(formData.bathrooms));
      if (formData.title_deed) fd.append('title_deed', formData.title_deed);
      if (formData.imei_serial) fd.append('imei_serial', formData.imei_serial);
      newImages.forEach(file => fd.append('images', file));

      const response = await fetch(url, {
        method,
        credentials: "include",
        body: fd
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
      
      <div className="relative w-full max-w-4xl bg-white border border-slate-200 rounded-2xl sm:rounded-[2.5rem] shadow-xl overflow-hidden flex flex-col max-h-[90vh] animate-zoom-in">
        
        {/* Modal Header */}
        <div className="p-5 sm:p-8 border-b border-slate-200 bg-slate-50 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-2xl bg-[#00A86B]/10 flex items-center justify-center text-[#00A86B]">
              <Package className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-xl sm:text-2xl font-black text-malazone-navy tracking-tight">
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
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-5 sm:p-10 space-y-6 sm:space-y-10 custom-scrollbar">
          
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
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
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
                    <option value="furniture">Furniture</option>
                    <option value="fashion">Fashion</option>
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
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                <div className="space-y-3">
                  <label className="text-[10px] font-black text-malazone-navy uppercase tracking-widest ml-1">{isAm ? 'ከተማ' : 'City'}</label>
                  <div className="relative">
                    <MapPin className="absolute left-5 top-1/2 -translate-y-1/2 w-4 h-4 text-malazone-navy" />
                    <select 
                      value={selectedCity}
                      onChange={e => {
                        const city = e.target.value;
                        setSelectedCity(city);
                        const cityData = locations.find((l) => l.key_name === city);
                        const szList = parseSubZones(cityData?.sub_zones);
                        setSelectedSubZone(szList.length > 0 ? szList[0].key : '');
                      }}
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl py-4 pl-14 pr-6 text-malazone-navy focus:outline-none focus:border-[#00A86B]/50 focus:ring-2 focus:ring-[#00A86B]/20 transition-all appearance-none"
                    >
                      {locations.length > 0 ? locations.map((loc) => (
                        <option key={loc.key_name} value={loc.key_name}>
                          {pickDbLabel(loc, language)}
                        </option>
                      )) : (
                        <>
                          <option value="hawassa">Hawassa</option>
                          <option value="addis_ababa">Addis Ababa</option>
                          <option value="yirgalem">Yirgalem</option>
                          <option value="dilla">Dilla</option>
                          <option value="bensa">Bensa</option>
                          <option value="aleta_wondo">Aleta Wondo</option>
                          <option value="chuko">Chuko</option>
                        </>
                      )}
                    </select>
                  </div>
                </div>
                {subZonesList.length > 0 && (
                  <div className="space-y-3">
                    <label className="text-[10px] font-black text-malazone-navy uppercase tracking-widest ml-1">{isAm ? 'የከተማ ክፍል' : 'Sub-area'}</label>
                    <div className="relative">
                      <MapPin className="absolute left-5 top-1/2 -translate-y-1/2 w-4 h-4 text-malazone-navy opacity-50" />
                      <select 
                        value={selectedSubZone}
                        onChange={e => setSelectedSubZone(e.target.value)}
                        className="w-full bg-slate-50 border border-slate-200 rounded-xl py-4 pl-14 pr-6 text-malazone-navy focus:outline-none focus:border-[#00A86B]/50 focus:ring-2 focus:ring-[#00A86B]/20 transition-all appearance-none"
                      >
                        {subZonesList.map((sz) => (
                          <option key={sz.key} value={sz.key}>
                            {pickDbLabel(sz, language)}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>
                )}
              </div>

              {/* Images */}
              <div className="space-y-3">
                <label className="text-[10px] font-black text-malazone-navy uppercase tracking-widest ml-1">
                  Product Images (up to 4)
                </label>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  multiple
                  className="hidden"
                  onChange={(e) => {
                    const files = Array.from(e.target.files || []);
                    const total = existingImages.length + newImages.length + files.length;
                    const allowed = Math.max(0, 4 - existingImages.length - newImages.length);
                    setNewImages(prev => [...prev, ...files.slice(0, allowed)]);
                    if (fileInputRef.current) fileInputRef.current.value = '';
                  }}
                />
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  disabled={existingImages.length + newImages.length >= 4}
                  className="w-full border-2 border-dashed border-slate-200 rounded-xl py-6 flex flex-col items-center gap-2 hover:border-[#00A86B]/50 hover:bg-[#00A86B]/5 transition-all disabled:opacity-40 disabled:cursor-not-allowed"
                >
                  <ImagePlus className="w-8 h-8 text-slate-400" />
                  <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                    {existingImages.length + newImages.length >= 4 ? 'Max 4 images' : 'Add Photos (up to 4)'}
                  </span>
                </button>
                {(existingImages.length > 0 || newImages.length > 0) && (
                  <div className="grid grid-cols-4 gap-3">
                    {existingImages.map((url, i) => (
                      <div key={`existing-${i}`} className="relative group aspect-square rounded-xl overflow-hidden border border-slate-200">
                        <img src={url} className="w-full h-full object-cover" alt="" />
                        <div className="absolute top-1 left-1 bg-[#00A86B] text-white text-[8px] font-bold px-1.5 py-0.5 rounded-full">{i + 1}</div>
                        <button
                          type="button"
                          onClick={() => setExistingImages(prev => prev.filter((_, j) => j !== i))}
                          className="absolute top-1 right-1 w-5 h-5 bg-red-500 text-white rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                        >
                          <Trash2 className="w-3 h-3" />
                        </button>
                      </div>
                    ))}
                    {newImages.map((file, i) => (
                      <div key={`new-${i}`} className="relative group aspect-square rounded-xl overflow-hidden border border-slate-200">
                        <img src={URL.createObjectURL(file)} className="w-full h-full object-cover" alt="" />
                        <div className="absolute top-1 left-1 bg-amber-500 text-white text-[8px] font-bold px-1.5 py-0.5 rounded-full">{existingImages.length + i + 1}</div>
                        <button
                          type="button"
                          onClick={() => setNewImages(prev => prev.filter((_, j) => j !== i))}
                          className="absolute top-1 right-1 w-5 h-5 bg-red-500 text-white rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                        >
                          <Trash2 className="w-3 h-3" />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* ── Dynamic Zone Specific Fields ── */}
              <div className="p-5 sm:p-8 rounded-2xl bg-slate-50 border border-slate-200 space-y-8 animate-fade-in">
                <p className="text-[10px] font-black text-[#00A86B] uppercase tracking-[0.3em] mb-4">Zone Specific Details</p>
                
                {/* Motors */}
                {formData.category === 'motors' && (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                    <div className="space-y-3">
                      <label className="text-[10px] font-black text-malazone-navy uppercase tracking-widest ml-1">Vehicle Type</label>
                      <select 
                        value={formData.sub_category}
                        onChange={e => setFormData({...formData, sub_category: e.target.value})}
                        className="w-full bg-white border border-slate-200 rounded-xl py-4 px-6 text-malazone-navy focus:outline-none focus:border-[#00A86B]/50 focus:ring-2 focus:ring-[#00A86B]/20 transition-all appearance-none"
                      >
                        <option value="">Select Type</option>
                        <>
                          <option value="sedan">Sedan</option>
                          <option value="suv">SUV</option>
                          <option value="truck">Truck</option>
                          <option value="van">Van</option>
                        </>
                      </select>
                    </div>
                    {formData.category === 'motors' && (
                      <div className="space-y-3">
                        <label className="text-[10px] font-black text-malazone-navy uppercase tracking-widest ml-1">Vehicle Brand</label>
                        <input 
                          value={formData.vehicle_brand}
                          onChange={e => setFormData({...formData, vehicle_brand: e.target.value})}
                          className="w-full bg-white border border-slate-200 rounded-xl py-4 px-6 text-malazone-navy focus:outline-none focus:border-[#00A86B]/50 focus:ring-2 focus:ring-[#00A86B]/20 transition-all"
                          placeholder="e.g. Toyota, Ford..."
                        />
                      </div>
                    )}
                    {formData.category === 'motors' && (
                      <div className="space-y-3">
                        <label className="text-[10px] font-black text-malazone-navy uppercase tracking-widest ml-1">Manufacture Year</label>
                        <input 
                          type="number"
                          value={formData.manufacture_year}
                          onChange={e => setFormData({...formData, manufacture_year: Number(e.target.value)})}
                          className="w-full bg-white border border-slate-200 rounded-xl py-4 px-6 text-malazone-navy focus:outline-none focus:border-[#00A86B]/50 focus:ring-2 focus:ring-[#00A86B]/20 transition-all"
                        />
                      </div>
                    )}
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
                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
                      <div className="space-y-3">
                        <label className="text-[10px] font-black text-malazone-navy uppercase tracking-widest ml-1">{formData.category === 'property' ? 'Property Type' : 'Stay Type'}</label>
                        <select 
                          value={formData.sub_category}
                          onChange={e => setFormData({...formData, sub_category: e.target.value})}
                          className="w-full bg-white border border-slate-200 rounded-xl py-4 px-6 text-malazone-navy focus:outline-none focus:border-[#00A86B]/50 focus:ring-2 focus:ring-[#00A86B]/20 transition-all appearance-none"
                        >
                          <option value="">Select Type</option>
                          {formData.category === 'property' ? (
                            <>
                              <option value="house">House</option>
                              <option value="apartment">Apartment</option>
                              <option value="land">Land</option>
                              <option value="commercial">Commercial</option>
                            </>
                          ) : (
                            <>
                              <option value="hotel">Hotel</option>
                              <option value="guesthouse">Guesthouse</option>
                              <option value="resort">Resort</option>
                            </>
                          )}
                        </select>
                      </div>
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

                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 sm:gap-6">
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
                    {formData.category === 'property' && (
                      <div className="flex flex-col sm:flex-row gap-6 mt-4">
                        <label className="flex items-center gap-3 cursor-pointer group">
                          <input 
                            type="checkbox"
                            checked={formData.is_furnished}
                            onChange={e => setFormData({...formData, is_furnished: e.target.checked})}
                            className="w-5 h-5 rounded-lg border-slate-300 bg-slate-50 text-[#00A86B] focus:ring-[#00A86B]/50 focus:ring-offset-0 transition-all"
                          />
                          <span className="text-[10px] font-bold text-malazone-navy uppercase tracking-widest group-hover:text-malazone-navy transition-colors">Furnished</span>
                        </label>
                        <label className="flex items-center gap-3 cursor-pointer group">
                          <input 
                            type="checkbox"
                            checked={formData.is_parking_available}
                            onChange={e => setFormData({...formData, is_parking_available: e.target.checked})}
                            className="w-5 h-5 rounded-lg border-slate-300 bg-slate-50 text-[#00A86B] focus:ring-[#00A86B]/50 focus:ring-offset-0 transition-all"
                          />
                          <span className="text-[10px] font-bold text-malazone-navy uppercase tracking-widest group-hover:text-malazone-navy transition-colors">Parking Available</span>
                        </label>
                      </div>
                    )}
                  </div>
                )}

                {/* Furniture */}
                {formData.category === 'furniture' && (
                  <div className="space-y-3">
                    <label className="text-[10px] font-black text-malazone-navy uppercase tracking-widest ml-1">Furniture Type</label>
                    <select 
                      value={formData.sub_category}
                      onChange={e => setFormData({...formData, sub_category: e.target.value})}
                      className="w-full bg-white border border-slate-200 rounded-xl py-4 px-6 text-malazone-navy focus:outline-none focus:border-[#00A86B]/50 focus:ring-2 focus:ring-[#00A86B]/20 transition-all appearance-none"
                    >
                      <option value="">Select Type</option>
                      <option value="living-room">Living Room</option>
                      <option value="bedroom">Bedroom</option>
                      <option value="dining-kitchen">Dining & Kitchen</option>
                      <option value="office">Office</option>
                    </select>
                  </div>
                )}
                {formData.category === 'furniture' && (
                  <div className="space-y-3 mt-4">
                    <label className="text-[10px] font-black text-malazone-navy uppercase tracking-widest ml-1">Pieces / Seat Count</label>
                    <input 
                      type="number"
                      value={formData.capacity}
                      onChange={e => setFormData({...formData, capacity: Number(e.target.value)})}
                      className="w-full bg-white border border-slate-200 rounded-xl py-4 px-6 text-malazone-navy focus:outline-none focus:border-[#00A86B]/50 focus:ring-2 focus:ring-[#00A86B]/20 transition-all"
                      placeholder="e.g. 6 seats..."
                    />
                  </div>
                )}

                {/* Fashion */}
                {formData.category === 'fashion' && (
                  <div className="space-y-3">
                    <label className="text-[10px] font-black text-malazone-navy uppercase tracking-widest ml-1">Fashion Item Type</label>
                    <select
                      value={formData.sub_category}
                      onChange={e => setFormData({...formData, sub_category: e.target.value})}
                      className="w-full bg-white border border-slate-200 rounded-xl py-4 px-6 text-malazone-navy focus:outline-none focus:border-[#00A86B]/50 focus:ring-2 focus:ring-[#00A86B]/20 transition-all appearance-none"
                    >
                      <option value="">Select Type</option>
                      <option value="mens-clothing">Men's Clothing</option>
                      <option value="womens-clothing">Women's Clothing</option>
                      <option value="shoes">Shoes & Sneakers</option>
                      <option value="bags-accessories">Bags & Accessories</option>
                      <option value="watches-jewelry">Watches & Jewelry</option>
                      <option value="traditional-wear">Traditional Wear</option>
                    </select>
                  </div>
                )}
                {formData.category === 'fashion' && (
                  <div className="space-y-3 mt-4">
                    <label className="text-[10px] font-black text-malazone-navy uppercase tracking-widest ml-1">Size</label>
                    <select
                      value={formData.sub_category_size || ""}
                      onChange={e => setFormData({...formData, sub_category_size: e.target.value})}
                      className="w-full bg-white border border-slate-200 rounded-xl py-4 px-6 text-malazone-navy focus:outline-none focus:border-[#00A86B]/50 focus:ring-2 focus:ring-[#00A86B]/20 transition-all appearance-none"
                    >
                      <option value="">Select Size</option>
                      <option value="XS">XS</option>
                      <option value="S">S</option>
                      <option value="M">M</option>
                      <option value="L">L</option>
                      <option value="XL">XL</option>
                    </select>
                  </div>
                )}

                {/* Electronics */}
                {formData.category === 'electronics' && (
                  <div className="space-y-3">
                    <label className="text-[10px] font-black text-slate-900 uppercase tracking-widest ml-1">
                      Electronics Type
                    </label>
                    <select 
                      value={formData.sub_category}
                      onChange={e => setFormData({...formData, sub_category: e.target.value})}
                      className="w-full bg-white border border-slate-200 rounded-xl py-4 px-6 text-malazone-navy focus:outline-none focus:border-[#00A86B]/50 focus:ring-2 focus:ring-[#00A86B]/20 transition-all appearance-none"
                    >
                      <option value="">Select Type</option>
                      <option value="phone">Mobile Phone</option>
                      <option value="laptop">Laptop/Computer</option>
                      <option value="tv">Television</option>
                      <option value="home_appliance">Home Appliance</option>
                    </select>
                  </div>
                )}
                {formData.category === 'electronics' && (
                  <div className="space-y-3 mt-4">
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
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
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
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
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
        <div className="p-5 sm:p-8 border-t border-slate-200 bg-slate-50 flex justify-end gap-4">
          <button onClick={onClose} className="px-8 py-4 rounded-xl text-malazone-navy font-black uppercase tracking-widest text-xs hover:text-malazone-navy transition-all">
            Cancel
          </button>
          <button 
            onClick={handleSubmit}
            disabled={loading}
            className="px-6 sm:px-12 py-4 rounded-xl bg-[#00A86B] hover:bg-[#00A86B]/90 text-white font-black uppercase tracking-widest text-xs shadow-xl shadow-[#00A86B]/25 transition-all flex items-center gap-3"
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
