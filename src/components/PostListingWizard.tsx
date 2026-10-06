/**
 * PostListingWizard.tsx
 * Malazone.com — Self-serve Sell / Post flow (mobile-first wizard).
 *
 *   1. Details   →  2. Price & Location   →  3. Photos & Description
 *   4. Publish & Boost (optional paid packages, manual Telebirr/CBE)
 *   5. Done
 *
 * The listing itself is created FREE via POST /api/listings/buyer on step 4;
 * paid boosts are optional add-ons implemented as a verifiable order with a
 * unique MZ- reference + evidence screenshots (Jiji-style).
 *
 * © 2026 Malazone Technologies PLC
 */

import React, { useEffect, useMemo, useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import {
  ChevronLeft, ChevronRight, CheckCircle2, Loader2, Camera,
  ImagePlus, Sparkles, ShieldCheck, Megaphone, X, Wallet, ArrowRight,
  Tag, Home, Clock, Timer,
} from 'lucide-react';
import { useLanguage } from '@/contexts/ZoneLanguageContext';
import { pickDbLabel } from '@/utils/dbLabel';

interface SubZoneFromAPI {
  key: string;
  label_en: string;
  label_am: string;
}
interface LocationFromAPI {
  id: number;
  key_name: string;
  label_en: string;
  label_am: string;
  sub_zones: SubZoneFromAPI[] | string | null;
  is_active: number;
}
interface TaxonomyChild {
  id: number;
  slug: string;
  label_en: string;
  label_am: string | null;
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
}
interface PackageRow {
  id: number;
  slug: string;
  name_en: string;
  name_am: string;
  price_etb: number | string;
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

const CATEGORIES: { value: string; en: string; am: string }[] = [
  { value: 'property', en: 'Property', am: 'ንብረት' },
  { value: 'motors', en: 'Motors', am: 'መኪና' },
  { value: 'stay', en: 'Stay', am: 'ማረፊያ' },
  { value: 'furniture', en: 'Furniture', am: 'የቤት እቃ' },
  { value: 'fashion', en: 'Fashion', am: 'ፋሽን' },
  { value: 'electronics', en: 'Electronics', am: 'ኤሌክትሮኒክስ' },
];

const STEPS = ['Details', 'Price & Location', 'Photos', 'Publish & Boost', 'Done'];

const DRAFT_KEY = 'malazone_post_draft_v1';

// Listing intent — the same set the server whitelists for price_suffix and the
// catalog's new Buy / Rent concept is built on top of.
const INTENT_TYPES = [
  { value: 'fixed', en: 'For Sale', am: 'ለሽያጭ', icon: Tag, hintEn: 'One-time price', hintAm: 'የተወሰነ ዋጋ' },
  { value: 'per_month', en: 'For Rent', am: 'ለኪራይ', icon: Home, hintEn: 'Monthly rent', hintAm: 'በወር ኪራይ' },
  { value: 'per_day', en: 'Per Day', am: 'በቀን', icon: Clock, hintEn: 'Daily rate', hintAm: 'የቀን ዋጋ' },
  { value: 'per_hour', en: 'Per Hour', am: 'በሰዓት', icon: Timer, hintEn: 'Hourly rate', hintAm: 'የሰዓት ዋጋ' },
] as const;

const inputCls =
  'w-full px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-sm text-slate-900 dark:text-white focus:ring-2 focus:ring-[#00A86B] outline-none';
const labelCls =
  'block text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-1';

const PostListingWizard: React.FC = () => {
  const { language } = useLanguage();
  const isAmharic = language === 'amharic';
  const navigate = useNavigate();
  const T = (en: string, am: string) => (isAmharic ? am : en);

  const [step, setStep] = useState(1);

  const [locations, setLocations] = useState<LocationFromAPI[]>([]);
  const [selectedCity, setSelectedCity] = useState('hawassa');
  const [selectedSubZone, setSelectedSubZone] = useState('tabor');

  const [form, setForm] = useState({
    title_en: '',
    title_am: '',
    category: 'property',
    price: '',
    price_suffix: 'fixed',
    phone: '',
    whatsapp: '',
    description_en: '',
    description_am: '',
  });

  const [subcats, setSubcats] = useState<TaxonomyChild[]>([]);
  const [selectedSub, setSelectedSub] = useState('');
  const [brands, setBrands] = useState<TaxonomyBrand[]>([]);
  const [selectedBrand, setSelectedBrand] = useState('');
  const [attrDefs, setAttrDefs] = useState<TaxonomyAttr[]>([]);
  const [attrVals, setAttrVals] = useState<Record<string, string | string[] | boolean>>({});

  const [images, setImages] = useState<File[]>([]);
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);

  // Step 4 — publish + boost
  const [publishing, setPublishing] = useState(false);
  const [listingId, setListingId] = useState<number | null>(null);
  const [packages, setPackages] = useState<PackageRow[]>([]);
  const [selectedPkg, setSelectedPkg] = useState<number | null>(null); // null = free
  const [method, setMethod] = useState<'telebirr' | 'cbe'>('telebirr');
  const [order, setOrder] = useState<OrderData | null>(null);
  const [evidence, setEvidence] = useState<File[]>([]);
  const [evidenceNote, setEvidenceNote] = useState('');

  const parseSubZones = (s: SubZoneFromAPI[] | string | null | undefined): SubZoneFromAPI[] => {
    if (!s) return [];
    if (Array.isArray(s)) return s;
    try {
      const p = JSON.parse(s as string);
      return Array.isArray(p) ? p : [];
    } catch {
      return [];
    }
  };
  const cityData = locations.find((l) => l.key_name === selectedCity);
  const subZonesList = parseSubZones(cityData?.sub_zones);
  const buildLocationKey = () => (selectedSubZone ? `${selectedCity}_${selectedSubZone}` : selectedCity);
  const getLocationLabels = () => {
    const city = cityData;
    const subZone = parseSubZones(city?.sub_zones).find((sz) => sz.key === selectedSubZone);
    return {
      label_en: subZone ? `${city?.label_en} - ${subZone.label_en}` : city?.label_en || selectedCity,
      label_am: subZone ? `${city?.label_am} - ${subZone.label_am}` : city?.label_am || selectedCity,
    };
  };

  // ── draft autosave (text fields only; photos can't persist) ──
  useEffect(() => {
    try {
      const raw = localStorage.getItem(DRAFT_KEY);
      if (raw) {
        const d = JSON.parse(raw);
        setForm((f) => ({ ...f, ...(d.form || {}) }));
        if (d.city) setSelectedCity(d.city);
        if (d.subZone) setSelectedSubZone(d.subZone);
        if (d.category) setForm((f) => ({ ...f, category: d.category }));
      }
    } catch {
      /* ignore corrupt drafts */
    }
  }, []);
  useEffect(() => {
    if (listingId === null && step < 4) {
      try {
        localStorage.setItem(DRAFT_KEY, JSON.stringify({ form, city: selectedCity, subZone: selectedSubZone }));
      } catch {
        /* storage full — non-fatal */
      }
    }
  }, [form, selectedCity, selectedSubZone, step, listingId]);

  useEffect(() => { setError(''); }, [step]);

  // taxonomy
  useEffect(() => {
    setSelectedSub('');
    setSubcats([]);
    fetch(`/api/categories/${form.category}`)
      .then((r) => r.json())
      .then((d) => { if (d.success) setSubcats(d.data.children || []); })
      .catch(() => {});
  }, [form.category]);

  useEffect(() => {
    setSelectedBrand('');
    setAttrVals({});
    setBrands([]);
    setAttrDefs([]);
    if (!selectedSub) return;
    fetch(`/api/categories/${selectedSub}`)
      .then((r) => r.json())
      .then((d) => {
        if (!d.success) return;
        setBrands(d.data.brands || []);
        setAttrDefs(((d.data.attributes || []) as TaxonomyAttr[]).filter((a) => a.is_filterable !== 0));
      })
      .catch(() => {});
  }, [selectedSub]);

  useEffect(() => {
    fetch('/api/locations')
      .then((r) => r.json())
      .then((d) => {
        if (d.success && Array.isArray(d.data)) {
          setLocations(d.data);
          const first = d.data[0];
          const sz = parseSubZones(first?.sub_zones);
          setSelectedCity(first?.key_name || 'hawassa');
          setSelectedSubZone(sz.length > 0 ? sz[0].key : '');
        }
      })
      .catch(() => {});
  }, []);

  useEffect(() => {
    fetch('/api/listings/promos/packages')
      .then((r) => r.json())
      .then((d) => {
        if (d.success && Array.isArray(d.data)) setPackages(d.data);
      })
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
    const val = attrVals[def.attr_key];
    const labelText = pickDbLabel(def, language);
    if (def.input_type === 'boolean') {
      return (
        <label key={def.attr_key} className="flex items-center gap-2 pt-5">
          <input
            type="checkbox"
            checked={val === true}
            onChange={(e) => setAttrVals({ ...attrVals, [def.attr_key]: e.target.checked })}
            className="w-4 h-4 accent-[#00A86B]"
          />
          <span className="text-sm text-slate-700 dark:text-slate-300">{labelText}</span>
        </label>
      );
    }
    if (def.input_type === 'multiselect') {
      const opts = parseOptions(def.options);
      const arr = Array.isArray(val) ? val : [];
      return (
        <div key={def.attr_key}>
          <label className={labelCls}>{labelText}</label>
          <div className="flex flex-wrap gap-1.5">
            {opts.map((opt) => (
              <button
                key={opt}
                type="button"
                onClick={() =>
                  setAttrVals({
                    ...attrVals,
                    [def.attr_key]: arr.includes(opt) ? arr.filter((x) => x !== opt) : [...arr, opt],
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
          <label className={labelCls}>
            {labelText}
            {def.unit ? ` (${def.unit})` : ''}
          </label>
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
        <label className={labelCls}>{labelText}</label>
        <select
          value={typeof val === 'string' ? val : ''}
          onChange={(e) => setAttrVals({ ...attrVals, [def.attr_key]: e.target.value })}
          className={inputCls}
        >
          <option value="">{T('— Select —', '— ምረጡ —')}</option>
          {parseOptions(def.options).map((opt) => (
            <option key={opt} value={opt}>{opt}</option>
          ))}
        </select>
      </div>
    );
  };

  // ── step validation ──
  const canGoNext = () => {
    if (step === 1) return form.title_en.trim().length >= 3 && form.title_am.trim().length >= 2;
    if (step === 2) return form.price !== '' && Number(form.price) > 0;
    if (step === 3) return true;
    return true;
  };

  // ── publish (free baseline) ──
  const publishListing = async () => {
    setPublishing(true);
    setError('');
    try {
      const labels = getLocationLabels();
      const fd = new FormData();
      fd.append('title_en', form.title_en);
      fd.append('title_am', form.title_am);
      fd.append('category', form.category);
      fd.append('price', form.price);
      fd.append('price_suffix', form.price_suffix);
      fd.append('location_key', buildLocationKey());
      fd.append('location_label_en', labels.label_en);
      fd.append('location_label_am', labels.label_am);
      fd.append('description_en', form.description_en);
      fd.append('description_am', form.description_am);
      if (form.phone && form.phone.trim()) fd.append('phone', form.phone.trim());
      fd.append('whatsapp', form.whatsapp);
      if (selectedSub) fd.append('subcategory', selectedSub);
      if (selectedBrand) fd.append('brand', selectedBrand);
      const cleanAttrs = Object.fromEntries(
        Object.entries(attrVals).filter(
          ([, v]) => v !== '' && v !== undefined && !(Array.isArray(v) && v.length === 0)
        )
      );
      fd.append('attributes', JSON.stringify(cleanAttrs));
      images.forEach((f) => fd.append('images', f));

      const res = await fetch('/api/listings/buyer', { method: 'POST', credentials: 'include', body: fd });
      const data = await res.json();
      if (!data.success) throw new Error(data.message || 'Failed to create listing');
      setListingId(Number(data.id));
      try { localStorage.removeItem(DRAFT_KEY); } catch { /* ignore */ }
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Network error');
      throw e;
    } finally {
      setPublishing(false);
    }
  };

  // ── boost order ──
  const createOrder = async () => {
    if (selectedPkg === null) return; // free — user is already done
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
      evidence.forEach((f) => fd.append('evidence', f));
      const res = await fetch(`/api/listings/promos/${order.order_id}/evidence`, {
        method: 'POST',
        credentials: 'include',
        body: fd,
      });
      const data = await res.json();
      if (!data.success) throw new Error(data.message || 'Failed to submit evidence');
      setStep(5);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Network error');
    } finally {
      setBusy(false);
    }
  };

  const imagePreviewUrls = useMemo(() => images.map((f) => URL.createObjectURL(f)), [images]);
  useEffect(() => {
    return () => imagePreviewUrls.forEach((u) => URL.revokeObjectURL(u));
  }, [imagePreviewUrls]);

  // ── step affordances ──
  const Body = () => {
    if (step === 1) {
      return (
        <div className="space-y-4">
          <div>
            <label className={labelCls}>{T('Title (English)', 'ርዕስ (እንግሊዝኛ)')} *</label>
            <input
              type="text"
              required
              value={form.title_en}
              onChange={(e) => setForm({ ...form, title_en: e.target.value })}
              className={inputCls}
              placeholder={T('e.g. 3 Bedroom House in Tabor', 'ለምሳሌ፡ በታቦር ባለ 3 መኝታ ቤት')}
            />
          </div>
          <div>
            <label className={labelCls}>{T('Title (Amharic)', 'ርዕስ (አማርኛ)')} *</label>
            <input
              type="text"
              required
              value={form.title_am}
              onChange={(e) => setForm({ ...form, title_am: e.target.value })}
              className={inputCls}
              placeholder={T('e.g. በታቦር 3 መኝታ ክፍል ቤት', 'ለምሳሌ፡ በታቦር 3 መኝታ ክፍል ቤት')}
            />
          </div>
          <div>
            <label className={labelCls}>{T('Category', 'ምድብ')} *</label>
            <select
              value={form.category}
              onChange={(e) => setForm({ ...form, category: e.target.value })}
              className={inputCls}
            >
              {CATEGORIES.map((c) => (
                <option key={c.value} value={c.value}>{T(c.en, c.am)}</option>
              ))}
            </select>
          </div>
          {subcats.length > 0 && (
            <div>
              <label className={labelCls}>{T('Subcategory', 'የምድብ ዓይነት')}</label>
              <select value={selectedSub} onChange={(e) => setSelectedSub(e.target.value)} className={inputCls}>
                <option value="">{T('— Optional —', '— አማራጭ —')}</option>
                {subcats.map((s) => (
                  <option key={s.slug} value={s.slug}>{pickDbLabel(s, language)}</option>
                ))}
              </select>
            </div>
          )}
          {brands.length > 0 && (
            <div>
              <label className={labelCls}>{T('Brand', 'ብራንድ')}</label>
              <select value={selectedBrand} onChange={(e) => setSelectedBrand(e.target.value)} className={inputCls}>
                <option value="">{T('Any', 'ማንኛውም')}</option>
                {brands.map((b) => (
                  <option key={b.slug} value={b.slug}>{b.name_en}</option>
                ))}
              </select>
            </div>
          )}
          {attrDefs.length > 0 && (
            <div className="space-y-4">{attrDefs.map(renderAttrField)}</div>
          )}
        </div>
      );
    }

    if (step === 2) {
      return (
        <div className="space-y-4">
          {/* Listing Type — drives the Buy / Rent concept (price_suffix) */}
          <div>
            <label className={labelCls}>{T('Listing Type', 'የመሸጫ/የኪራይ ዓይነት')} *</label>
            <div className="grid grid-cols-2 gap-2">
              {INTENT_TYPES.map((it) => {
                const active = form.price_suffix === it.value;
                return (
                  <button
                    key={it.value}
                    type="button"
                    onClick={() => setForm({ ...form, price_suffix: it.value })}
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
              value={form.price}
              onChange={(e) => setForm({ ...form, price: e.target.value })}
              className={inputCls}
              placeholder="0"
            />
            <p className="text-xs text-slate-400 mt-1.5">
              {form.price_suffix === 'fixed'
                ? T('One-time price buyers pay to own it.', 'ገዢዎች ለመያዝ የሚከፍሉት አንድ ጊዜ ዋጋ።')
                : form.price_suffix === 'per_month'
                  ? T('Shown as ETB / Month on the card.', 'በካርዱ ላይ እንደ ETB / በወር ይታያል።')
                  : form.price_suffix === 'per_day'
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
                const sz = parseSubZones(city?.sub_zones);
                setSelectedSubZone(sz.length > 0 ? sz[0].key : '');
              }}
              className={inputCls}
            >
              {locations.map((loc) => (
                <option key={loc.key_name} value={loc.key_name}>{pickDbLabel(loc, language)}</option>
              ))}
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
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className={labelCls}>{T('Contact Phone', 'የስልክ ቁጥር')}</label>
              <input
                type="tel"
                value={form.phone}
                onChange={(e) => setForm({ ...form, phone: e.target.value })}
                className={inputCls}
                placeholder={T('e.g. 0913 123 456', 'ለምሳሌ፡ 0913 123 456')}
              />
            </div>
            <div>
              <label className={labelCls}>Telegram</label>
              <input
                type="text"
                value={form.whatsapp}
                onChange={(e) => setForm({ ...form, whatsapp: e.target.value })}
                className={inputCls}
                placeholder={T('Phone or @username', 'ስልክ ወይም @ስም')}
              />
            </div>
          </div>
        </div>
      );
    }

    if (step === 3) {
      return (
        <div className="space-y-4">
          <div>
            <label className={labelCls}>{T('Photos (up to 5)', 'ፎቶዎች (እስከ 5)')}</label>
            <label className="flex items-center justify-center gap-2 w-full px-4 py-6 rounded-xl border-2 border-dashed border-slate-300 dark:border-slate-600 cursor-pointer hover:border-[#00A86B] transition-colors bg-white dark:bg-slate-800">
              <Camera className="w-5 h-5 text-[#00A86B]" />
              <span className="text-sm text-slate-500 dark:text-slate-400">
                {T('Tap to add photos', 'ፎቶዎችን ለመጨመር ይንኩ')}
              </span>
              <input
                type="file"
                accept="image/*"
                multiple
                className="hidden"
                onChange={(e) => {
                  const files = Array.from(e.target.files || []);
                  setImages((prev) => [...prev, ...files].slice(0, 5));
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
                      onClick={() => setImages((prev) => prev.filter((_, j) => j !== i))}
                      className="absolute -top-1.5 -right-1.5 w-5 h-5 bg-red-500 text-white rounded-full text-xs font-bold flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      &times;
                    </button>
                  </div>
                ))}
              </div>
            )}
            <p className="text-xs text-slate-400 mt-2">
              {T('Photos are auto-compressed and watermarked with your name to protect them. The first photo is the cover.', 'ፎቶዎች በራስ-ሰር ይጨመቃሉ እና በስምዎ ይታመማሉ። የመጀመሪያው ፎቶ የሽፋን ፎቶ ነው።')}
            </p>
          </div>
          <div>
            <label className={labelCls}>{T('Description (English)', 'መግለጫ (እንግሊዝኛ)')}</label>
            <textarea
              rows={3}
              value={form.description_en}
              onChange={(e) => setForm({ ...form, description_en: e.target.value })}
              className={`${inputCls} resize-none`}
            />
          </div>
          <div>
            <label className={labelCls}>{T('Description (Amharic)', 'መግለጫ (አማርኛ)')}</label>
            <textarea
              rows={3}
              value={form.description_am}
              onChange={(e) => setForm({ ...form, description_am: e.target.value })}
              className={`${inputCls} resize-none`}
            />
          </div>
        </div>
      );
    }

    if (step === 4) {
      if (listingId === null) {
        return (
          <div className="space-y-4">
            <div className="p-4 bg-slate-50 dark:bg-slate-800/60 rounded-xl border border-slate-200 dark:border-slate-700 space-y-2 text-sm">
              <div className="flex justify-between"><span className="text-slate-500">{T('Title', 'ርዕስ')}</span><span className="font-semibold">{form.title_en}</span></div>
              <div className="flex justify-between"><span className="text-slate-500">{T('Category', 'ምድብ')}</span><span className="font-semibold">{T(CATEGORIES.find((c) => c.value === form.category)?.en || '', CATEGORIES.find((c) => c.value === form.category)?.am || '')}</span></div>
              <div className="flex justify-between"><span className="text-slate-500">{T('Price', 'ዋጋ')}</span><span className="font-semibold">{form.price} ETB</span></div>
              <div className="flex justify-between"><span className="text-slate-500">{T('Location', 'አካባቢ')}</span><span className="font-semibold">{getLocationLabels().label_en}</span></div>
              <div className="flex justify-between"><span className="text-slate-500">{T('Photos', 'ፎቶዎች')}</span><span className="font-semibold">{images.length}</span></div>
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
                onClick={() => { setSelectedPkg(null); setStep(5); }}
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
                    <Sparkles className="w-4 h-4 text-[#00A86B]" />
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
                  <img
                    key={i}
                    src={URL.createObjectURL(f)}
                    alt=""
                    className="w-16 h-16 object-cover rounded-lg border border-slate-200 dark:border-slate-700"
                  />
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
    }

    // step 5 — done
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
        {listingId && (
          <div className="flex flex-col sm:flex-row gap-3 pt-2 justify-center">
            <Link
              to={`/listing/${listingId}`}
              className="flex items-center justify-center gap-2 px-4 py-3 rounded-lg bg-[#00A86B] text-white text-sm font-bold hover:bg-emerald-600 transition-colors"
            >
              {T('View your listing', 'ዝርዝርዎን ይመልከቱ')} <ArrowRight className="w-4 h-4" />
            </Link>
            <button
              onClick={() => navigate('/')}
              className="px-4 py-3 rounded-lg border border-slate-200 dark:border-slate-700 text-sm font-medium text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
            >
              {T('Back to home', 'ወደ መጀመሪያ ገጽ')}
            </button>
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950">
      <header className="bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 sticky top-0 z-40">
        <div className="max-w-2xl mx-auto px-4 py-4 flex items-center justify-between">
          <button
            onClick={() => (step > 1 && step < 5 ? setStep(step - 1) : navigate('/'))}
            className="flex items-center gap-1 text-sm font-bold text-slate-600 dark:text-slate-300 hover:text-[#00A86B] transition-colors"
          >
            <ChevronLeft className="w-4 h-4" /> {T('Back', 'ተመለስ')}
          </button>
          <span className="flex items-center gap-1.5">
            <Megaphone className="w-4 h-4 text-[#00A86B]" />
            <span className="text-sm font-black text-malazone-navy dark:text-white">{T('Sell on Malazone', 'በማላዞን ይሽጡ')}</span>
          </span>
          <button onClick={() => navigate('/')} className="p-1 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800">
            <X className="w-5 h-5 text-slate-400" />
          </button>
        </div>
      </header>

      <main className="max-w-2xl mx-auto px-4 py-6">
        {/* step indicator */}
        <div className="flex items-center gap-1.5 mb-6">
          {STEPS.map((s, i) => {
            const n = i + 1;
            const active = n === step;
            const done = n < step;
            return (
              <div key={s} className="flex-1">
                <div className={`h-1 rounded-full ${done ? 'bg-[#00A86B]' : active ? 'bg-[#00A86B]' : 'bg-slate-200 dark:bg-slate-700'}`} />
                <p className={`text-[10px] font-bold mt-1 ${active ? 'text-[#00A86B]' : 'text-slate-400'}`}>
                  {n}. {T(s, s)}
                </p>
              </div>
            );
          })}
        </div>

        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm p-5 sm:p-6">
          {error && (
            <div className="mb-4 p-3 bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-800 rounded-lg text-sm text-red-600 dark:text-red-400">
              {error}
            </div>
          )}
          <Body />
        </div>

        {step < 4 && (
          <div className="mt-5">
            <button
              onClick={() => canGoNext() && setStep(step + 1)}
              disabled={!canGoNext()}
              className="w-full flex items-center justify-center gap-2 px-4 py-3 rounded-lg bg-[#00A86B] text-white text-sm font-bold hover:bg-emerald-600 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
            >
              {T('Continue', 'ቀጥል')} <ChevronRight className="w-4 h-4" />
            </button>
            {step === 1 && !canGoNext() && (
              <p className="text-xs text-slate-400 text-center mt-2">
                {T('English and Amharic titles are required', 'የእንግሊዝኛ እና የአማርኛ ርዕሶች ያስፈልጋሉ')}
              </p>
            )}
            {step === 2 && !canGoNext() && (
              <p className="text-xs text-slate-400 text-center mt-2">
                {T('Enter a price greater than zero', 'ከዜሮ በላይ ዋጋ ያስገቡ')}
              </p>
            )}
          </div>
        )}

        {step === 4 && listingId !== null && order === null && (
          <div className="mt-5 flex items-center gap-2 justify-center text-xs text-slate-400">
            <Sparkles className="w-4 h-4 text-[#00A86B]" />
            {T('Boost is optional — your listing is already visible to everyone.', 'ማስተዋወቅ አማራጭ ነው — ዝርዝርዎ ለሁሉም ይታያል።')}
          </div>
        )}
      </main>
    </div>
  );
};

export default PostListingWizard;