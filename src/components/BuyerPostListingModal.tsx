/**
 * BuyerPostListingModal.tsx
 * Malazone.com — JiJi-style post-listing step wizard (opens via "Post A Listing"):
 *   1 Details → 2 Price & Location → 3 Photos & Description → 4 Preview → 5 Publish & Boost
 * The user reviews a realistic preview of the ad BEFORE it goes live, then chooses
 * a free publish or a paid boost package with the payment-evidence flow, and only
 * then is the listing posted.
 * © 2026 Malazone Technologies PLC
 */

import React, { useState, useMemo, useEffect } from 'react';
import {
  X, Loader2, ImagePlus, ChevronLeft, ChevronRight, Camera, CheckCircle2,
  Sparkles, ShieldCheck, Wallet, Tag, Home, Clock, Timer, Building2, Car,
  BedDouble, Sofa, Shirt, Smartphone, MapPin, Send, PhoneCall, Eye,
} from 'lucide-react';
import { useLanguage } from '@/contexts/ZoneLanguageContext';
import { pickDbLabel } from '@/utils/dbLabel';

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

interface TaxonomyChild {
  id: number;
  slug: string;
  name_en: string;
  name_am: string | null;
}

interface TaxonomyBrand {
  id: number;
  slug: string;
  name_en: string;
}

interface TaxonomyAttr {
  attr_key: string;
  label_en: string;
  label_am: string | null;
  input_type: string;
  unit: string | null;
  options: string[] | string | null;
  is_filterable?: number;
  is_required?: number;
}

interface PackageRow {
  id: number;
  slug: string;
  name_en: string;
  name_am: string;
  price_etb: number;
  duration_days: number;
  features: string[];
}

interface PaymentInstruction {
  label: string;
  bank?: string;
  account_name: string;
  account_number: string;
  note_en: string;
  note_am: string;
}

interface OrderData {
  order_id: number;
  reference: string;
  amount_etb: string | number;
  method: 'telebirr' | 'cbe';
  package: { slug: string; name_en: string; name_am: string; duration_days: number };
  instructions: PaymentInstruction;
}

interface BuyerPostListingModalProps {
  onClose: () => void;
  onCreated: () => void;
}

const STEPS = ['Details', 'Price', 'Photos', 'Preview', 'Publish'];

const CATEGORIES = [
  { value: 'property', en: 'Property', am: 'ንብረት', icon: Building2 },
  { value: 'motors', en: 'Motors', am: 'መኪና', icon: Car },
  { value: 'stay', en: 'Stay', am: 'ማረፊያ', icon: BedDouble },
  { value: 'furniture', en: 'Furniture', am: 'የቤት እቃ', icon: Sofa },
  { value: 'fashion', en: 'Fashion', am: 'ፋሽን', icon: Shirt },
  { value: 'electronics', en: 'Electronics', am: 'ኤሌክትሮኒክስ', icon: Smartphone },
];

const INTENT_TYPES = [
  { value: 'fixed', en: 'For Sale', am: 'ለሽያጭ', icon: Tag, hintEn: 'One-time price', hintAm: 'የተወሰነ ዋጋ' },
  { value: 'per_month', en: 'For Rent', am: 'ለኪራይ', icon: Home, hintEn: 'Monthly rent', hintAm: 'በወር ኪራይ' },
  { value: 'per_day', en: 'Per Day', am: 'በቀን', icon: Clock, hintEn: 'Daily rate', hintAm: 'የቀን ዋጋ' },
  { value: 'per_hour', en: 'Per Hour', am: 'በሰዓት', icon: Timer, hintEn: 'Hourly rate', hintAm: 'የሰዓት ዋጋ' },
] as const;

const inputCls =
  'w-full px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-sm text-slate-900 dark:text-white focus:ring-2 focus:ring-[#00A86B] outline-none';
const labelCls = 'block text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-1';

function intentMeaning(suffix: string): string {
  switch (suffix) {
    case 'per_month': return '/ month';
    case 'per_day': return '/ day';
    case 'per_hour': return '/ hour';
    default: return '';
  }
}

function intentLabel(suffix: string, isAm: boolean): string {
  const pair = INTENT_TYPES.find((i) => i.value === suffix);
  return pair ? (isAm ? pair.am : pair.en) : suffix;
}

const BuyerPostListingModal: React.FC<BuyerPostListingModalProps> = ({ onClose, onCreated }) => {
  const { language } = useLanguage();
  const isAmharic = language === 'amharic';
  const T = (en: string, am: string) => (isAmharic ? am : en);

  const [step, setStep] = useState(1);

  const [locations, setLocations] = useState<LocationFromAPI[]>([]);
  const [selectedCity, setSelectedCity] = useState('hawassa');
  const [selectedSubZone, setSelectedSubZone] = useState('tabor');

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
        const res = await fetch('/api/locations');
        const data = await res.json();
        if (data.success && Array.isArray(data.data)) {
          setLocations(data.data);
        }
      } catch (err) {
        console.error('Failed to fetch locations:', err);
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

  const [formData, setFormData] = useState({
    title_en: '',
    title_am: '',
    category: 'property',
    price: '',
    price_suffix: 'fixed',
    location_key: 'hawassa_tabor',
    location_label_en: 'Hawassa - Tabor Sub City',
    location_label_am: 'ሀዋሳ - ታቦር ክፍለ ከተማ',
    description_en: '',
    description_am: '',
    phone: '',
    whatsapp: '',
  });
  const [images, setImages] = useState<File[]>([]);
  const [error, setError] = useState('');

  // Taxonomy (subcategory / brand / attributes)
  const [subcats, setSubcats] = useState<TaxonomyChild[]>([]);
  const [selectedSub, setSelectedSub] = useState('');
  const [brands, setBrands] = useState<TaxonomyBrand[]>([]);
  const [selectedBrand, setSelectedBrand] = useState('');
  const [attrDefs, setAttrDefs] = useState<TaxonomyAttr[]>([]);
  const [attrVals, setAttrVals] = useState<Record<string, string | string[] | boolean>>({});

  // Step 5 — publish + boost
  const [publishing, setPublishing] = useState(false);
  const [listingId, setListingId] = useState<number | null>(null);
  const [packages, setPackages] = useState<PackageRow[]>([]);
  const [selectedPkg, setSelectedPkg] = useState<number | null>(null);
  const [method, setMethod] = useState<'telebirr' | 'cbe'>('telebirr');
  const [order, setOrder] = useState<OrderData | null>(null);
  const [evidence, setEvidence] = useState<File[]>([]);
  const [evidenceNote, setEvidenceNote] = useState('');
  const [busy, setBusy] = useState(false);
  const [done, setDone] = useState(false);

  useEffect(() => {
    setSelectedSub('');
    setSubcats([]);
    fetch(`/api/categories/${formData.category}`)
      .then(r => r.json())
      .then(d => { if (d.success) setSubcats(d.data.children || []); })
      .catch(() => {});
  }, [formData.category]);

  useEffect(() => {
    setSelectedBrand('');
    setAttrVals({});
    setBrands([]);
    setAttrDefs([]);
    if (!selectedSub) return;
    fetch(`/api/categories/${selectedSub}`)
      .then(r => r.json())
      .then(d => {
        if (!d.success) return;
        setBrands(d.data.brands || []);
        setAttrDefs(((d.data.attributes || []) as TaxonomyAttr[]).filter(a => a.is_filterable !== 0));
      })
      .catch(() => {});
  }, [selectedSub]);

  useEffect(() => {
    fetch('/api/listings/promos/packages')
      .then(r => r.json())
      .then(d => { if (d.success && Array.isArray(d.data)) setPackages(d.data); })
      .catch(() => {});
  }, []);

  const parseOptions = (o: TaxonomyAttr['options']): string[] => {
    if (Array.isArray(o)) return o;
    try {
      const p = JSON.parse(String(o || '[]'));
      return Array.isArray(p) ? p.map(String) : [];
    } catch {
      return [];
    }
  };

  const renderAttrField = (def: TaxonomyAttr) => {
    const labelText = pickDbLabel(def, language);
    const reqMark = <span className="text-red-500"> *</span>;
    const val = attrVals[def.attr_key];

    if (def.input_type === 'boolean') {
      return (
        <label key={def.attr_key} className="flex items-center gap-2 pt-5">
          <input
            type="checkbox"
            checked={val === true}
            onChange={(e) => setAttrVals({ ...attrVals, [def.attr_key]: e.target.checked })}
            className="w-4 h-4 accent-[#00A86B]"
          />
          <span className="text-sm text-slate-700 dark:text-slate-300">{labelText}{def.is_required ? reqMark : null}</span>
        </label>
      );
    }
    if (def.input_type === 'multiselect') {
      const opts = parseOptions(def.options);
      const arr = Array.isArray(val) ? val : [];
      return (
        <div key={def.attr_key}>
          <label className={labelCls}>{labelText}{def.is_required ? reqMark : null}</label>
          <div className="flex flex-wrap gap-1.5">
            {opts.map(opt => (
              <button
                key={opt}
                type="button"
                onClick={() =>
                  setAttrVals({
                    ...attrVals,
                    [def.attr_key]: arr.includes(opt) ? arr.filter(x => x !== opt) : [...arr, opt],
                  })
                }
                className={`px-2.5 py-1 rounded-full text-xs font-semibold border transition-colors ${
                  arr.includes(opt)
                    ? 'bg-[#00A86B] text-white border-[#00A86B]'
                    : 'bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 border-slate-200 dark:border-slate-700'
                }`}
              >
                {opt}
              </button>
            ))}
          </div>
        </div>
      );
    }
    if (def.input_type === 'number') {
      return (
        <div key={def.attr_key}>
          <label className={labelCls}>{labelText}{def.unit ? ` (${def.unit})` : ''}{def.is_required ? reqMark : null}</label>
          <input
            type="number"
            value={typeof val === 'string' ? val : ''}
            onChange={(e) => setAttrVals({ ...attrVals, [def.attr_key]: e.target.value })}
            className={inputCls}
          />
        </div>
      );
    }
    return (
      <div key={def.attr_key}>
        <label className={labelCls}>{labelText}{def.is_required ? reqMark : null}</label>
        <select
          value={typeof val === 'string' ? val : ''}
          onChange={(e) => setAttrVals({ ...attrVals, [def.attr_key]: e.target.value })}
          className={inputCls}
        >
          <option value="">{isAmharic ? '— ምረጡ —' : '— Select —'}</option>
          {parseOptions(def.options).map(opt => (
            <option key={opt} value={opt}>{opt}</option>
          ))}
        </select>
      </div>
    );
  };

  const imagePreviewUrls = useMemo(() => images.map(f => URL.createObjectURL(f)), [images]);
  useEffect(() => {
    return () => imagePreviewUrls.forEach(url => URL.revokeObjectURL(url));
  }, [imagePreviewUrls]);

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

  const publishListing = async () => {
    setPublishing(true);
    setError('');
    try {
      // Deterministic source of truth: re-fetch the live specs for the final
      // subcategory so a slow/lost earlier fetch can never let a required
      // attribute slip past client-side. The server enforces the same rules.
      let defs: TaxonomyAttr[] = attrDefs;
      if (selectedSub) {
        try {
          const d = await (await fetch(`/api/categories/${selectedSub}`)).json();
          if (d.success && Array.isArray(d.data?.attributes)) {
            defs = d.data.attributes;
          }
        } catch { /* keep attrDefs */ }
      }
      const missingReq = defs
        .filter((dd) => dd.is_required)
        .filter((dd) => {
          const v = attrVals[dd.attr_key];
          return v === undefined || v === '' || (Array.isArray(v) && v.length === 0);
        });
      if (missingReq.length > 0) {
        setError(
          T('Please complete the required details: ', 'እባክዎን የሚጠይቁ ዝርዝሮችን ያጠናቅቁ: ') +
            missingReq.map((dd) => pickDbLabel(dd, language)).join(', ')
        );
        setPublishing(false);
        setStep(1);
        return;
      }
      const labels = getLocationLabels();
      const fd = new FormData();
      fd.append('title_en', formData.title_en);
      fd.append('title_am', formData.title_am);
      fd.append('category', formData.category);
      fd.append('price', formData.price);
      fd.append('price_suffix', formData.price_suffix);
      fd.append('location_key', buildLocationKey());
      fd.append('location_label_en', labels.label_en);
      fd.append('location_label_am', labels.label_am);
      fd.append('description_en', formData.description_en);
      fd.append('description_am', formData.description_am);
      if (formData.phone && formData.phone.trim()) fd.append('phone', formData.phone.trim());
      fd.append('whatsapp', formData.whatsapp);
      if (selectedSub) fd.append('subcategory', selectedSub);
      if (selectedBrand) fd.append('brand', selectedBrand);
      const cleanAttrs = Object.fromEntries(
        Object.entries(attrVals).filter(([, v]) =>
          v !== '' && v !== undefined && !(Array.isArray(v) && v.length === 0)
        )
      );
      fd.append('attributes', JSON.stringify(cleanAttrs));
      images.forEach(f => fd.append('images', f));

      const response = await fetch('/api/listings/buyer', {
        method: 'POST',
        credentials: 'include',
        body: fd,
      });
      const data = await response.json();
      if (!data.success) {
        const detail = Array.isArray(data.errors) && data.errors.length > 0
          ? ` ${data.errors.join('; ')}`
          : '';
        throw new Error((data.message || 'Failed to create listing') + detail);
      }
      setListingId(Number(data.id));
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Network error');
      setPublishing(false);
      throw e;
    }
    setPublishing(false);
  };

  const createOrder = async () => {
    if (selectedPkg === null || listingId === null) return;
    setBusy(true);
    setError('');
    try {
      const res = await fetch(`/api/listings/${listingId}/promo`, {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ package_id: selectedPkg, method }),
      });
      const data = await res.json();
      if (!data.success) throw new Error(data.message || 'Failed to create order');
      setOrder(data.data);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Network error');
    } finally {
      setBusy(false);
    }
  };

  const submitEvidence = async () => {
    if (!order) return;
    if (evidence.length === 0) {
      setError(T('Upload at least one screenshot', 'ቢያንስ አንድ ስክሪንሾት ይስቀሉ'));
      return;
    }
    setBusy(true);
    setError('');
    try {
      const fd = new FormData();
      fd.append('note', evidenceNote);
      evidence.forEach(f => fd.append('evidence', f));
      const res = await fetch(`/api/listings/promos/${order.order_id}/evidence`, {
        method: 'POST',
        credentials: 'include',
        body: fd,
      });
      const data = await res.json();
      if (!data.success) throw new Error(data.message || 'Failed to submit evidence');
      setDone(true);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Network error');
    } finally {
      setBusy(false);
    }
  };

  const canGoNext = () => {
    if (step === 1) return formData.title_en.trim().length >= 2 && formData.title_am.trim().length >= 2;
    if (step === 2) return Number(formData.price) > 0;
    if (step === 3) return images.length >= 1;
    return true;
  };

  const goNext = () => {
    if (!canGoNext()) {
      setError(
        step === 1
          ? T('Enter both title (English & Amharic)', 'ሁለቱንም ርዕሶች ያስገቡ (እንግሊዝኛ እና አማርኛ)')
          : step === 2
            ? T('Enter a valid price', 'ትክክለኛ ዋጋ ያስገቡ')
            : T('Add at least one photo', 'ቢያንስ አንድ ፎቶ ያክሉ')
      );
      return;
    }
    setError('');
    setStep((s) => Math.min(5, s + 1));
  };

  // ── Preview (step 4) ─────────────────────────────────────────────
  const renderCardPreview = () => {
    const cat = CATEGORIES.find((c) => c.value === formData.category);
    return (
      <div className="border border-slate-200 dark:border-slate-700 rounded-xl overflow-hidden bg-white dark:bg-slate-800">
        {imagePreviewUrls[0] ? (
          <img src={imagePreviewUrls[0]} alt="" className="w-full h-44 object-cover" />
        ) : (
          <div className="w-full h-44 flex items-center justify-center bg-gradient-to-br from-slate-100 to-slate-200 dark:from-slate-800 dark:to-slate-900">
            {cat && <cat.icon className="w-12 h-12 text-slate-300 dark:text-slate-600" />}
          </div>
        )}
        <div className="p-4">
          <div className="flex flex-wrap gap-2 mb-2">
            <span className="px-2.5 py-1 rounded-full bg-slate-100 dark:bg-slate-700 text-[10px] font-black uppercase tracking-wide text-slate-600 dark:text-slate-300">
              {cat ? T(cat.en, cat.am) : formData.category}
            </span>
            <span className="px-2.5 py-1 rounded-full bg-[#00A86B]/10 text-[10px] font-black uppercase tracking-wide text-emerald-700 dark:text-emerald-400">
              {intentLabel(formData.price_suffix, isAmharic)}
            </span>
          </div>
          <p className="text-sm font-bold text-slate-900 dark:text-white line-clamp-2">
            {formData.title_en || (isAmharic ? 'ርዕስ' : 'Your title')}
          </p>
          <p className="mt-2 font-black text-emerald-700 dark:text-emerald-400">
            ETB {Number(formData.price) > 0 ? Number(formData.price).toLocaleString() : '0'}
            <span className="text-xs font-bold text-slate-400">{intentMeaning(formData.price_suffix)}</span>
          </p>
          <p className="mt-1 text-xs text-slate-400 flex items-center gap-1">
            <MapPin className="w-3 h-3" /> {getLocationLabels().label_en}
          </p>
          <div className="flex gap-2 mt-3">
            <span className="flex-1 inline-flex items-center justify-center gap-1.5 bg-[#00A86B] text-white rounded-lg py-2 text-[10px] font-black uppercase tracking-wide">
              <PhoneCall className="w-3.5 h-3.5" /> {T('Call', 'ደውል')}
            </span>
            <span className="flex-1 inline-flex items-center justify-center gap-1.5 bg-[#24A1DE] text-white rounded-lg py-2 text-[10px] font-black uppercase tracking-wide">
              <Send className="w-3.5 h-3.5" /> {T('Telegram', 'ቴሌግራም')}
            </span>
            <span className="flex-1 inline-flex items-center justify-center gap-1.5 bg-[#0B132B] text-white rounded-lg py-2 text-[10px] font-black uppercase tracking-wide">
              <MessageIcon /> {T('Chat', 'መልዕክት')}
            </span>
          </div>
        </div>
      </div>
    );
  };

  const renderDetailPreview = () => {
    const attrs = attrDefs.filter((d) => {
      const v = attrVals[d.attr_key];
      return v !== undefined && v !== '' && !(Array.isArray(v) && v.length === 0);
    });
    return (
      <div className="border border-slate-200 dark:border-slate-700 rounded-xl bg-white dark:bg-slate-800 p-4 space-y-3">
        <div>
          <p className="text-[10px] font-black uppercase tracking-wider text-slate-400 mb-1">{T('About', 'ስለዚህ')}</p>
          {formData.description_am && (
            <p className="text-sm text-slate-700 dark:text-slate-300">{isAmharic ? formData.description_am : formData.description_en || '—'}</p>
          )}
          {!formData.description_am && !formData.description_en && (
            <p className="text-xs text-slate-400 italic">{T('No description added.', 'መግለጫ አልተጨመረም።')}</p>
          )}
        </div>
        {(attrs.length > 0 || formData.phone || formData.whatsapp) && (
          <div className="space-y-2">
            {attrs.map((d) => {
              const v = attrVals[d.attr_key];
              return (
                <div key={d.attr_key} className="flex justify-between gap-3">
                  <span className="text-xs text-slate-400">{pickDbLabel(d, language)}</span>
                  <span className="text-xs font-bold text-slate-700 dark:text-slate-300 max-w-[60%] text-right">
                    {Array.isArray(v) ? v.join(', ') : String(v)}
                  </span>
                </div>
              );
            })}
            {(formData.phone || formData.whatsapp) && (
              <div className="flex justify-between gap-3 pt-1 border-t border-slate-100 dark:border-slate-700">
                <span className="text-xs text-slate-400">{T('Contact', 'አድራሻ')}</span>
                <span className="text-xs font-bold text-slate-700 dark:text-slate-300 text-right">
                  {[formData.phone, formData.whatsapp].filter(Boolean).join(' · ')}
                </span>
              </div>
            )}
          </div>
        )}
      </div>
    );
  };

  // ── step bodies ──────────────────────────────────────────────────
  const renderBody = () => {
    if (step === 1) {
      return (
        <div className="space-y-4">
          <div>
            <label className={labelCls}>{T('Title (English)', 'ርዕስ (እንግሊዝኛ)')} *</label>
            <input
              type="text"
              value={formData.title_en}
              onChange={(e) => setFormData({ ...formData, title_en: e.target.value })}
              className={inputCls}
              placeholder="e.g. 3 Bedroom House in Tabor"
            />
          </div>
          <div>
            <label className={labelCls}>{T('Title (Amharic)', 'ርዕስ (አማርኛ)')} *</label>
            <input
              type="text"
              value={formData.title_am}
              onChange={(e) => setFormData({ ...formData, title_am: e.target.value })}
              className={inputCls}
              placeholder="e.g. በታቦር 3 መኝታ ክፍል ቤት"
            />
          </div>
          <div>
            <label className={labelCls}>{T('Category', 'ምድብ')} *</label>
            <div className="grid grid-cols-3 gap-2">
              {CATEGORIES.map((c) => {
                const active = formData.category === c.value;
                return (
                  <button
                    key={c.value}
                    type="button"
                    onClick={() => setFormData({ ...formData, category: c.value })}
                    className={`flex flex-col items-center gap-1.5 px-2 py-3 rounded-xl border-2 transition-all ${
                      active
                        ? 'border-[#00A86B] bg-[#00A86B]/5'
                        : 'border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 hover:border-[#00A86B]/60'
                    }`}
                  >
                    <c.icon className={`w-5 h-5 ${active ? 'text-[#00A86B]' : 'text-slate-400 dark:text-slate-500'}`} />
                    <span className={`text-[11px] font-bold ${active ? 'text-[#00A86B]' : 'text-slate-600 dark:text-slate-300'}`}>
                      {T(c.en, c.am)}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>
          {subcats.length > 0 && (
            <div>
              <label className={labelCls}>{T('Subcategory', 'የምድብ ዓይነት')}</label>
              <select value={selectedSub} onChange={(e) => setSelectedSub(e.target.value)} className={inputCls}>
                <option value="">{T('— Optional —', '— አማራጭ —')}</option>
                {subcats.map(s => (
                  <option key={s.slug} value={s.slug}>{isAmharic ? (s.name_am || s.name_en) : s.name_en}</option>
                ))}
              </select>
            </div>
          )}
          {brands.length > 0 && (
            <div>
              <label className={labelCls}>{T('Brand', 'ብራንድ')}</label>
              <select value={selectedBrand} onChange={(e) => setSelectedBrand(e.target.value)} className={inputCls}>
                <option value="">{T('Any', 'ማንኛውም')}</option>
                {brands.map(b => (
                  <option key={b.slug} value={b.slug}>{b.name_en}</option>
                ))}
              </select>
            </div>
          )}
          {attrDefs.length > 0 && (
            <div className="grid grid-cols-2 gap-4">
              {attrDefs.map(renderAttrField)}
            </div>
          )}
        </div>
      );
    }

    if (step === 2) {
      return (
        <div className="space-y-4">
          <div>
            <label className={labelCls}>{T('Listing Type', 'የመሸጫ/የኪራይ ዓይነት')} *</label>
            <div className="grid grid-cols-2 gap-2">
              {INTENT_TYPES.map((it) => {
                const active = formData.price_suffix === it.value;
                return (
                  <button
                    key={it.value}
                    type="button"
                    onClick={() => setFormData({ ...formData, price_suffix: it.value })}
                    className={`flex items-center gap-2.5 px-3 py-3 rounded-xl border-2 text-left transition-all ${
                      active
                        ? 'border-[#00A86B] bg-[#00A86B]/5'
                        : 'border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 hover:border-[#00A86B]/60'
                    }`}
                  >
                    <span className={`w-9 h-9 rounded-lg flex items-center justify-center shrink-0 transition-colors ${active ? 'bg-[#00A86B] text-white' : 'bg-slate-100 dark:bg-slate-700 text-slate-500 dark:text-slate-300'}`}>
                      <it.icon className="w-4 h-4" />
                    </span>
                    <span className="min-w-0">
                      <span className="block text-sm font-bold text-slate-900 dark:text-white">{T(it.en, it.am)}</span>
                      <span className="block text-[10px] text-slate-400">{T(it.hintEn, it.hintAm)}</span>
                    </span>
                  </button>
                );
              })}
            </div>
          </div>
          <div>
            <label className={labelCls}>{T('Price (ETB)', 'ዋጋ (ETB)')} *</label>
            <input
              type="number"
              min="0"
              value={formData.price}
              onChange={(e) => setFormData({ ...formData, price: e.target.value })}
              className={inputCls}
              placeholder="0"
            />
            <p className="text-xs text-slate-400 mt-1.5">
              {formData.price_suffix === 'fixed'
                ? T('One-time price buyers pay to own it.', 'ገዢዎች ለመያዝ የሚከፍሉት አንድ ጊዜ ዋጋ።')
                : formData.price_suffix === 'per_month'
                  ? T('Shown as ETB / Month on the card.', 'በካርዱ ላይ እንደ ETB / በወር ይታያል።')
                  : formData.price_suffix === 'per_day'
                    ? T('Shown as ETB / Day on the card.', 'በካርዱ ላይ እንደ ETB / በቀን ይታያል።')
                    : T('Shown as ETB / Hour on the card.', 'በካርዱ ላይ እንደ ETB / በሰዓት ይታያል።')}
            </p>
          </div>
          <div>
            <label className={labelCls}>{T('City', 'ከተማ')}</label>
            <select
              value={selectedCity}
              onChange={(e) => {
                setSelectedCity(e.target.value);
                const city = locations.find((l) => l.key_name === e.target.value);
                const subZones = parseSubZones(city?.sub_zones);
                setSelectedSubZone(subZones.length > 0 ? subZones[0].key : '');
              }}
              className={inputCls}
            >
              {locations.length > 0 ? locations.map((loc) => (
                <option key={loc.key_name} value={loc.key_name}>{pickDbLabel(loc, language)}</option>
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
          {subZonesList.length > 0 && (
            <div>
              <label className={labelCls}>{T('Sub-area / Neighborhood', 'የከተማ ክፍል')}</label>
              <select value={selectedSubZone} onChange={(e) => setSelectedSubZone(e.target.value)} className={inputCls}>
                {subZonesList.map((sz) => (
                  <option key={sz.key} value={sz.key}>{pickDbLabel(sz, language)}</option>
                ))}
              </select>
            </div>
          )}
        </div>
      );
    }

    if (step === 3) {
      return (
        <div className="space-y-4">
          <div>
            <label className={labelCls}>{T('Photos (up to 5)', 'ፎቶዎች (እስከ 5)')} *</label>
            <label className="flex items-center justify-center gap-2 w-full px-4 py-6 rounded-xl border-2 border-dashed border-slate-300 dark:border-slate-600 cursor-pointer hover:border-[#00A86B] transition-colors bg-white dark:bg-slate-800">
              <Camera className="w-5 h-5 text-[#00A86B]" />
              <span className="text-sm text-slate-500 dark:text-slate-400">{T('Tap to add photos', 'ፎቶዎችን ለመጨመር ይንኩ')}</span>
              <input
                type="file"
                accept="image/*"
                multiple
                className="hidden"
                onChange={(e) => {
                  const files = Array.from(e.target.files || []);
                  setImages(prev => [...prev, ...files].slice(0, 5));
                }}
              />
            </label>
            {images.length > 0 && (
              <div className="flex flex-wrap gap-2 mt-3">
                {images.map((file, i) => (
                  <div key={i} className="relative group">
                    <img src={imagePreviewUrls[i]} alt="" className="w-16 h-16 object-cover rounded-lg border border-slate-200 dark:border-slate-700" />
                    <button
                      type="button"
                      onClick={() => setImages(prev => prev.filter((_, j) => j !== i))}
                      className="absolute -top-1.5 -right-1.5 w-5 h-5 bg-red-500 text-white rounded-full text-xs font-bold flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      &times;
                    </button>
                  </div>
                ))}
              </div>
            )}
            <p className="text-xs text-slate-400 mt-2">
              {T('Photos are auto-compressed and watermarked with your name. The first photo is the cover.', 'ፎቶዎች በራስ-ሰር ይጨመቃሉ እና በስምዎ ይታመማሉ። የመጀመሪያው ፎቶ የሽፋን ፎቶ ነው።')}
            </p>
          </div>
          <div>
            <label className={labelCls}>{T('Description (English)', 'መግለጫ (እንግሊዝኛ)')}</label>
            <textarea
              rows={3}
              value={formData.description_en}
              onChange={(e) => setFormData({ ...formData, description_en: e.target.value })}
              className={`${inputCls} resize-none`}
            />
          </div>
          <div>
            <label className={labelCls}>{T('Description (Amharic)', 'መግለጫ (አማርኛ)')}</label>
            <textarea
              rows={3}
              value={formData.description_am}
              onChange={(e) => setFormData({ ...formData, description_am: e.target.value })}
              className={`${inputCls} resize-none`}
            />
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className={labelCls}>{T('Contact Phone', 'የስልክ ቁጥር')}</label>
              <input
                type="tel"
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                className={inputCls}
                placeholder={isAmharic ? 'ለምሳሌ፡ 0913 123 456' : 'e.g. 0913 123 456'}
              />
            </div>
            <div>
              <label className={labelCls}>{T('Telegram', 'ቴሌግራም')}</label>
              <input
                type="text"
                value={formData.whatsapp}
                onChange={(e) => setFormData({ ...formData, whatsapp: e.target.value })}
                className={inputCls}
                placeholder={isAmharic ? 'ቴሌግራም (ስልክ ወይም @ስም)' : 'Telegram (phone or @username)'}
              />
            </div>
          </div>
        </div>
      );
    }

    if (step === 4) {
      return (
        <div className="space-y-4">
          <div className="flex items-center gap-2 p-3 bg-sky-50 dark:bg-sky-950/40 border border-sky-200 dark:border-sky-800 rounded-lg text-sm text-sky-700 dark:text-sky-300">
            <Eye className="w-5 h-5 shrink-0" />
            {T('This is how buyers will see your listing on Malazone.', 'ይህ በማላዞን ላይ ገዢዎች የእርስዎን ማስታወቂያ የሚያዩበት መንገድ ነው።')}
          </div>
          {renderCardPreview()}
          {renderDetailPreview()}
        </div>
      );
    }

    // ── step 5 — publish & boost ────────────────────────────────────
    if (done) {
      return (
        <div className="text-center space-y-4 py-6">
          <div className="w-20 h-20 mx-auto rounded-full bg-[#00A86B]/10 flex items-center justify-center">
            <CheckCircle2 className="w-12 h-12 text-[#00A86B]" />
          </div>
          <h2 className="text-xl font-black text-slate-900 dark:text-white">
            {order
              ? T('Payment submitted!', 'ክፍያ ቀርቧል!')
              : T('Your listing is live!', 'ዝርዝርዎ ታትሟል!')}
          </h2>
          <p className="text-sm text-slate-500 dark:text-slate-400">
            {order
              ? T(
                  `We received your evidence for ${order.package.name_en}. Your boost activates after review.`,
                  `ማስረጃው ደርሶናል። ከግምገማ በኋላ ${order.package.name_am} ይነቃል።`
                )
              : T('Buyers can now find and message you.', 'ገዢዎች አሁን ሊያገኙዎት እና ሊያነጋግሩዎት ይችላሉ።')}
          </p>
        </div>
      );
    }

    if (listingId === null) {
      return (
        <div className="space-y-4">
          <div className="p-4 bg-slate-50 dark:bg-slate-800/60 rounded-xl border border-slate-200 dark:border-slate-700 space-y-2 text-sm">
            <div className="flex justify-between"><span className="text-slate-500">{T('Title', 'ርዕስ')}</span><span className="font-semibold text-slate-900 dark:text-white">{formData.title_en}</span></div>
            <div className="flex justify-between"><span className="text-slate-500">{T('Category', 'ምድብ')}</span><span className="font-semibold text-slate-900 dark:text-white">{T(CATEGORIES.find((c) => c.value === formData.category)?.en || '', CATEGORIES.find((c) => c.value === formData.category)?.am || '')}</span></div>
            <div className="flex justify-between"><span className="text-slate-500">{T('Price', 'ዋጋ')}</span><span className="font-semibold text-slate-900 dark:text-white">{Number(formData.price).toLocaleString()} ETB {intentLabel(formData.price_suffix, isAmharic)}</span></div>
            <div className="flex justify-between"><span className="text-slate-500">{T('Location', 'አካባቢ')}</span><span className="font-semibold text-slate-900 dark:text-white">{getLocationLabels().label_en}</span></div>
            <div className="flex justify-between"><span className="text-slate-500">{T('Photos', 'ፎቶዎች')}</span><span className="font-semibold text-slate-900 dark:text-white">{images.length}</span></div>
          </div>
          <button
            onClick={async () => {
              try { await publishListing(); } catch { /* error surfaced */ }
            }}
            disabled={publishing}
            className="w-full flex items-center justify-center gap-2 px-4 py-3 rounded-lg bg-[#00A86B] text-white text-sm font-bold hover:bg-emerald-600 transition-colors disabled:opacity-50"
          >
            {publishing ? <Loader2 className="w-4 h-4 animate-spin" /> : <ImagePlus className="w-4 h-4" />}
            {publishing ? T('Posting...', 'በመስራት ላይ...') : T('Post Listing for Free', 'ዝርዝሩን በነጻ ያስገቡ')}
          </button>
          <p className="text-xs text-slate-400 text-center">{T('Posting is free. Boost it afterwards if you want more buyers.', 'ማስገባት ነጻ ነው። ተጨማሪ ገዢዎች ከፈለጉ ማስተዋወቅ ይችላሉ።')}</p>
        </div>
      );
    }

    // Boost offer (post-publish)
    if (order === null) {
      return (
        <div className="space-y-4">
          <div className="flex items-center gap-2 p-3 bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 rounded-lg text-sm text-emerald-700 dark:text-emerald-300">
            <CheckCircle2 className="w-5 h-5 shrink-0" />
            {T('Listing published. Want more buyers?', 'ዝርዝሩ ታትሟል። ተጨማሪ ገዢዎች ይፈልጋሉ?')}
          </div>
          <div className="space-y-3">
            <button
              onClick={() => setDone(true)}
              className="w-full flex items-center justify-between px-4 py-3 rounded-xl border-2 border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 hover:border-[#00A86B] transition-colors"
            >
              <div className="text-left">
                <p className="text-sm font-bold text-slate-900 dark:text-white">{T('Keep it free', 'በነጻ ይቆይ')}</p>
                <p className="text-xs text-slate-500">{T('Your listing is already live', 'ዝርዝርዎ አሁን ታትሟል')}</p>
              </div>
              <span className="text-sm font-bold text-slate-400">ETB 0</span>
            </button>
            {packages.map((p) => (
              <button
                key={p.id}
                onClick={() => setSelectedPkg(p.id)}
                className={`w-full flex items-center justify-between px-4 py-3 rounded-xl border-2 transition-colors ${
                  selectedPkg === p.id
                    ? 'border-[#00A86B] bg-[#00A86B]/5'
                    : 'border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 hover:border-[#00A86B]'
                }`}
              >
                <div className="text-left flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-[#00A86B] shrink-0" />
                  <div>
                    <p className="text-sm font-bold text-slate-900 dark:text-white">{T(p.name_en, p.name_am)}</p>
                    <p className="text-xs text-slate-500">
                      {p.features.includes('homepage_slot')
                        ? T('Top ranking + Featured badge + homepage slot', 'ከፍተኛ ደረጃ + ልዩ ባጅ + የመጀመሪያ ገጽ ቦታ')
                        : p.features.includes('featured_badge')
                          ? T('Top ranking + Featured badge', 'ከፍተኛ ደረጃ + ልዩ ባጅ')
                          : T('Top of search results for', 'የፍለጋ ውጤቶች አናት ላይ ለ')}
                      {' '}{p.duration_days} {T('days', 'ቀናት')}
                    </p>
                  </div>
                </div>
                <span className="text-sm font-black text-slate-900 dark:text-white">ETB {p.price_etb}</span>
              </button>
            ))}
          </div>
          {selectedPkg !== null && (
            <div>
              <label className={labelCls}>{T('Payment method', 'የክፍያ ዘዴ')}</label>
              <div className="grid grid-cols-2 gap-3">
                <button
                  onClick={() => setMethod('telebirr')}
                  className={`px-4 py-3 rounded-xl border-2 text-sm font-bold transition-colors ${
                    method === 'telebirr'
                      ? 'border-[#00A86B] bg-[#00A86B]/5 text-[#00A86B]'
                      : 'border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300'
                  }`}
                >
                  Telebirr
                </button>
                <button
                  onClick={() => setMethod('cbe')}
                  className={`px-4 py-3 rounded-xl border-2 text-sm font-bold transition-colors ${
                    method === 'cbe'
                      ? 'border-[#00A86B] bg-[#00A86B]/5 text-[#00A86B]'
                      : 'border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300'
                  }`}
                >
                  CBE Birr
                </button>
              </div>
              <button
                onClick={createOrder}
                disabled={busy}
                className="w-full flex items-center justify-center gap-2 mt-4 px-4 py-3 rounded-lg bg-[#00A86B] text-white text-sm font-bold hover:bg-emerald-600 transition-colors disabled:opacity-50"
              >
                {busy ? <Loader2 className="w-4 h-4 animate-spin" /> : <Wallet className="w-4 h-4" />}
                {T('Continue to Payment', 'ወደ ክፍያ ይቀጥሉ')}
              </button>
            </div>
          )}
        </div>
      );
    }

    // Payment instructions + evidence
    const inst = order.instructions;
    return (
      <div className="space-y-4">
        <div className="p-4 rounded-xl border border-[#00A86B]/30 bg-[#00A86B]/5 space-y-2">
          <div className="flex items-center justify-between">
            <p className="text-xs font-bold uppercase tracking-wider text-slate-500">{T('Amount to pay', 'የመክፈያ መጠን')}</p>
            <p className="text-xl font-black text-slate-900 dark:text-white">ETB {order.amount_etb}</p>
          </div>
          <div className="flex items-center justify-between">
            <p className="text-xs font-bold uppercase tracking-wider text-slate-500">{T('Your reference', 'የእርስዎ መለያ')}</p>
            <p className="text-sm font-black text-[#00A86B] select-all">{order.reference}</p>
          </div>
          <div className="flex items-center justify-between">
            <p className="text-xs font-bold uppercase tracking-wider text-slate-500">{T('Method', 'ዘዴ')}</p>
            <p className="text-sm font-bold text-slate-700 dark:text-slate-200">{inst.label}</p>
          </div>
        </div>

        <div className="p-4 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 space-y-1">
          <p className="text-xs font-bold uppercase tracking-wider text-slate-500">{T('Pay to this account', 'ወደዚህ አካውንት ይላኩ')}</p>
          {inst.bank && <p className="text-sm font-bold text-slate-900 dark:text-white">{inst.bank}</p>}
          <p className="text-sm text-slate-700 dark:text-slate-300">{inst.account_name}</p>
          <p className="text-xl font-black text-slate-900 dark:text-white select-all">{inst.account_number}</p>
          <p className="text-xs text-slate-500 mt-2">{T(inst.note_en, inst.note_am)}</p>
        </div>

        <div>
          <label className={labelCls}>{T('Upload confirmation screenshot (max 3)', 'የማስረጃ ስክሪንሾት ይስቀሉ (ከ3 ያልበለጠ)')} *</label>
          <label className="flex items-center justify-center gap-2 w-full px-4 py-6 rounded-xl border-2 border-dashed border-slate-300 dark:border-slate-600 cursor-pointer hover:border-[#00A86B] transition-colors bg-white dark:bg-slate-800">
            <Camera className="w-5 h-5 text-[#00A86B]" />
            <span className="text-sm text-slate-500 dark:text-slate-400">{T('Tap to add screenshots', 'ስክሪንሾቶችን ለመጨመር ይንኩ')}</span>
            <input
              type="file"
              accept="image/*"
              multiple
              className="hidden"
              onChange={(e) => setEvidence(Array.from(e.target.files || []).slice(0, 3))}
            />
          </label>
          {evidence.length > 0 && (
            <div className="flex flex-wrap gap-2 mt-2">
              {evidence.map((f, i) => (
                <img key={i} src={URL.createObjectURL(f)} alt="" className="w-16 h-16 object-cover rounded-lg border border-slate-200 dark:border-slate-700" />
              ))}
            </div>
          )}
        </div>

        <div>
          <label className={labelCls}>{T('Note for reviewer (optional)', 'ለገምጋሚ ማስታወሻ (አማራጭ)')}</label>
          <textarea
            rows={2}
            value={evidenceNote}
            onChange={(e) => setEvidenceNote(e.target.value)}
            className={`${inputCls} resize-none`}
          />
        </div>

        <button
          onClick={submitEvidence}
          disabled={busy}
          className="w-full flex items-center justify-center gap-2 px-4 py-3 rounded-lg bg-[#00A86B] text-white text-sm font-bold hover:bg-emerald-600 transition-colors disabled:opacity-50"
        >
          {busy ? <Loader2 className="w-4 h-4 animate-spin" /> : <ShieldCheck className="w-4 h-4" />}
          {busy ? T('Submitting...', 'በመስራት ላይ...') : T('Submit Payment Evidence', 'የክፍያ ማስረጃ ያስገቡ')}
        </button>
        <p className="text-xs text-slate-400 text-center">
          {T('Your boost activates after we confirm the transfer (usually within 24h).', 'ክፍያው ከተረጋገጠ በኋላ ማስተዋወቂያዎ ይነቃል (ብዙውን ጊዜ በ24 ሰዓት ውስጥ)።')}
        </p>
      </div>
    );
  };

  const showStepNav = step <= 4;

  const close = () => {
    if (listingId !== null) {
      onCreated();
      return;
    }
    onClose();
  };

  return (
    <div className="fixed inset-0 z-[1200] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={close} />
      <div className="relative w-full max-w-lg bg-white dark:bg-slate-900 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-800 max-h-[90vh] flex flex-col">
        <div className="sticky top-0 bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 px-5 py-4 rounded-t-2xl flex items-center justify-between z-10">
          <h3 className="text-lg font-black text-slate-900 dark:text-white">
            {step === 5 && done
              ? T('All done!', 'ተጠናቋል!')
              : T('Post a Listing', 'ማስታወቂያ ያስገቡ')}
          </h3>
          <button onClick={close} className="p-1 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800">
            <X className="w-5 h-5 text-slate-400" />
          </button>
        </div>

        {showStepNav && (
          <div className="px-5 pt-4">
            <div className="flex items-center gap-1.5 overflow-x-auto">
              {STEPS.map((s, i) => {
                const current = step - 1 === i;
                const passed = step - 1 > i;
                return (
                  <React.Fragment key={s}>
                    {i > 0 && <span className={`h-px flex-1 min-w-2 ${passed ? 'bg-[#00A86B]' : 'bg-slate-200 dark:bg-slate-700'}`} />}
                    <div className={`flex flex-col items-center shrink-0`}>
                      <span
                        className={`w-7 h-7 rounded-full flex items-center justify-center text-[11px] font-black transition-colors ${
                          current
                            ? 'bg-[#00A86B] text-white'
                            : passed
                              ? 'bg-[#00A86B]/15 text-[#00A86B]'
                              : 'bg-slate-100 dark:bg-slate-800 text-slate-400'
                        }`}
                      >
                        {passed ? <CheckCircle2 className="w-4 h-4" /> : i + 1}
                      </span>
                      <span className={`mt-1 text-[9px] font-black uppercase tracking-wide whitespace-nowrap ${current ? 'text-[#00A86B]' : passed ? 'text-slate-500' : 'text-slate-400'}`}>
                        {T(s, s)}
                      </span>
                    </div>
                  </React.Fragment>
                );
              })}
            </div>
          </div>
        )}

        <div className="p-5 overflow-y-auto flex-1">
          {error && (
            <div className="mb-4 p-3 bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-800 rounded-lg text-sm text-red-600 dark:text-red-400">
              {error}
            </div>
          )}
          {renderBody()}
        </div>

        {(step <= 4 || (step === 5 && !done)) && (
          <div className="px-5 py-4 border-t border-slate-100 dark:border-white/5 flex gap-3">
            {step > 1 ? (
              <button
                onClick={() => { setError(''); setStep((s) => Math.max(1, s - 1)); }}
                className="flex-1 flex items-center justify-center gap-1.5 px-4 py-2.5 rounded-lg border border-slate-200 dark:border-slate-700 text-sm font-medium text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
              >
                <ChevronLeft className="w-4 h-4" />
                {step === 5 ? T('Back to Preview', 'ወደ ቅድመ-ዕይታ ተመለስ') : T('Back', 'ተመለስ')}
              </button>
            ) : (
              <button
                onClick={onClose}
                className="flex-1 px-4 py-2.5 rounded-lg border border-slate-200 dark:border-slate-700 text-sm font-medium text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
              >
                {T('Cancel', 'ሰርዝ')}
              </button>
            )}
            {step <= 4 && (
              <button
                onClick={goNext}
                disabled={step === 4 && !canGoNext()}
                className={`flex-1 flex items-center justify-center gap-1.5 px-4 py-2.5 rounded-lg text-sm font-bold transition-colors disabled:opacity-50 ${
                  step === 4 ? 'bg-[#00A86B] text-white hover:bg-emerald-600' : 'bg-[#00A86B] text-white hover:bg-emerald-600'
                }`}
              >
                {step === 4 ? T('Continue to Publish', 'ወደ ማተም ይቀጥሉ') : T('Continue', 'ቀጥል')}
                <ChevronRight className="w-4 h-4" />
              </button>
            )}
          </div>
        )}

        {step === 5 && done && (
          <div className="px-5 py-4 border-t border-slate-100 dark:border-white/5">
            <button
              onClick={onCreated}
              className="w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg bg-[#00A86B] text-white text-sm font-bold hover:bg-emerald-600 transition-colors"
            >
              <CheckCircle2 className="w-4 h-4" />
              {T('Done', 'ጨርስ')}
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

// Small local alias so the preview "Chat" button stays consistent with the
// catalog's chat affordance (MessageCircle) without a long import chain.
const MessageIcon = () => <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" /></svg>;

export default BuyerPostListingModal;