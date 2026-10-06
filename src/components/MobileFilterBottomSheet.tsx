/**
 * MobileFilterBottomSheet.tsx
 * MALAZONE — Premium Mobile Filter Bottom Sheet (Airbnb-inspired)
 * © 2026 Malazone Technologies PLC
 */

import React, { useState, useEffect } from "react";
import {
  X,
  ChevronDown,
  ChevronRight,
  Search,
  Check,
  Shield,
  MapPin,
  Clock,
  TrendingDown,
  CheckCircle,
  Image,
  Calendar,
  ShieldCheck,
  Info,
} from "lucide-react";
import { useLanguage } from "@/contexts/ZoneLanguageContext";
import { pickDbLabel } from "@/utils/dbLabel";
import type { ActiveZone, FilterState } from "./ZoneFilterSidebar";
import TaxonomyFacetSection from "./TaxonomyFacetSection";

interface MobileFilterBottomSheetProps {
  activeCategory?: string;
  activeZone: ActiveZone;
  filters: FilterState;
  onFilterChange: (key: keyof FilterState, value: any) => void;
  onZoneChange: (zone: ActiveZone) => void;
  onReset: () => void;
  onClose: () => void;
  resultCount?: number;
}

/* ────────────────────────────────────────────
   Trust Indicator Component (Mobile)
   Badge with inline description for mobile
   ──────────────────────────────────────────── */
const TrustIndicatorMobile: React.FC<{
  type: "verified" | "agent" | "business";
  label: string;
  description: string;
}> = ({ type, label, description }) => {
  const [isExpanded, setIsExpanded] = useState(false);

  const getIcon = () => {
    switch (type) {
      case "verified":
        return <ShieldCheck className="w-4 h-4" />;
      case "agent":
        return <Shield className="w-4 h-4" />;
      case "business":
        return <CheckCircle className="w-4 h-4" />;
    }
  };

  return (
    <div>
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="flex items-center gap-2 w-full px-3 py-2 bg-emerald-50 dark:bg-emerald-950/30 text-emerald-700 dark:text-emerald-400 rounded-lg text-xs font-semibold transition-all active:scale-95"
      >
        {getIcon()}
        <span className="flex-1 text-left">{label}</span>
        <Info className="w-3 h-3 opacity-60" />
      </button>
      {isExpanded && (
        <div className="mt-2 p-3 bg-slate-50 dark:bg-slate-800 rounded-lg text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
          {description}
        </div>
      )}
    </div>
  );
};

/* ────────────────────────────────────────────
   Quick Filter Chip Component (Mobile)
   Premium chips with instant filtering
   ──────────────────────────────────────────── */
const QuickFilterChip: React.FC<{
  label: string;
  icon: React.ReactNode;
  active: boolean;
  onClick: () => void;
}> = ({ label, icon, active, onClick }) => (
  <button
    onClick={onClick}
    className={`
      flex items-center gap-1.5 px-3 py-2 rounded-full text-xs font-semibold whitespace-nowrap
      transition-all duration-200 ease-out active:scale-95
      ${
        active
          ? "bg-[#16A34A] text-white shadow-md"
          : "bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-400 border border-slate-300 dark:border-slate-700"
      }
    `}
  >
    {React.cloneElement(icon as React.ReactElement, {
      className: "w-3.5 h-3.5",
    })}
    <span>{label}</span>
  </button>
);

const EnhancedSegmentedControl: React.FC<{
  value: string;
  onChange: (v: string) => void;
  options: { value: string; label: string }[];
  columns?: number;
}> = ({ value, onChange, options, columns = 2 }) => {
  const gridCols = columns === 4 ? "grid-cols-4" : columns === 3 ? "grid-cols-3" : "grid-cols-2";
  
  return (
    <div className={`grid ${gridCols} bg-slate-100 dark:bg-slate-800 rounded-2xl p-1 gap-1`}>
      {options.map((opt) => (
        <button
          key={opt.value}
          onClick={() => onChange(opt.value)}
          className={`
            px-3 py-2.5 rounded-xl text-sm font-bold
            transition-all duration-200 ease-out active:scale-95
            ${
              value === opt.value
                ? "bg-white dark:bg-slate-700 text-[#16A34A] shadow-sm"
                : "text-slate-600 dark:text-slate-400"
            }
          `}
        >
          {opt.label}
        </button>
      ))}
    </div>
  );
};

/* ────────────────────────────────────────────
   Segmented Control
   ──────────────────────────────────────────── */
const SegmentedControl: React.FC<{
  value: string;
  onChange: (v: string) => void;
  options: { value: string; label: string }[];
}> = ({ value, onChange, options }) => (
  <div className="flex bg-slate-100 dark:bg-slate-800 rounded-2xl p-1 gap-1">
    {options.map((opt) => (
      <button
        key={opt.value}
        onClick={() => onChange(opt.value)}
        className={`flex-1 px-4 py-2.5 rounded-xl text-sm font-bold transition-all ${
          value === opt.value
            ? "bg-white dark:bg-slate-700 text-[#16A34A] shadow-sm"
            : "text-slate-600 dark:text-slate-400"
        }`}
      >
        {opt.label}
      </button>
    ))}
  </div>
);

/* ────────────────────────────────────────────
   Searchable Select
   ──────────────────────────────────────────── */
const SearchableSelect: React.FC<{
  label: string;
  value: string;
  onChange: (v: string) => void;
  options: { value: string; label: string }[];
}> = ({ label, value, onChange, options }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");

  const selectedOption = options.find((opt) => opt.value === value) || options[0];
  const filteredOptions = options.filter((opt) =>
    opt.label.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div>
      <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-2">
        {label}
      </label>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex items-center justify-between px-4 py-3 bg-white dark:bg-slate-800 border-2 border-slate-200 dark:border-slate-700 rounded-xl"
      >
        <span className="text-sm font-medium text-slate-900 dark:text-white">
          {selectedOption.label}
        </span>
        <ChevronDown
          className={`w-4 h-4 text-slate-400 transition-transform ${
            isOpen ? "rotate-180" : ""
          }`}
        />
      </button>

      {isOpen && (
        <div className="fixed inset-0 z-[300] bg-white dark:bg-slate-900">
          <div className="flex items-center justify-between p-4 border-b border-slate-200 dark:border-slate-800">
            <h3 className="text-lg font-bold text-slate-900 dark:text-white">
              {label}
            </h3>
            <button
              onClick={() => {
                setIsOpen(false);
                setSearchTerm("");
              }}
              className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-full"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          <div className="p-4">
            <div className="relative mb-4">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder={`Search ${label.toLowerCase()}...`}
                className="w-full pl-10 pr-4 py-3 bg-slate-50 dark:bg-slate-800 border-2 border-slate-200 dark:border-slate-700 rounded-xl text-sm"
                autoFocus
              />
            </div>

            <div className="space-y-1">
              {filteredOptions.map((opt) => (
                <button
                  key={opt.value}
                  onClick={() => {
                    onChange(opt.value);
                    setIsOpen(false);
                    setSearchTerm("");
                  }}
                  className={`w-full flex items-center justify-between px-4 py-3 rounded-xl ${
                    value === opt.value
                      ? "bg-emerald-50 dark:bg-emerald-950/30 text-[#16A34A] font-semibold"
                      : "text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800"
                  }`}
                >
                  {opt.label}
                  {value === opt.value && <Check className="w-5 h-5" />}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

/* ────────────────────────────────────────────
   Premium Dual-Thumb Price Slider Component (Mobile)
   Range slider with min/max inputs and smooth animations
   ──────────────────────────────────────────── */
const PremiumPriceSlider: React.FC<{
  minValue: string;
  maxValue: string;
  onMinChange: (v: string) => void;
  onMaxChange: (v: string) => void;
  min?: number;
  max?: number;
  step?: number;
}> = ({ minValue, maxValue, onMinChange, onMaxChange, min = 0, max = 10000000, step = 50000 }) => {
  const [localMin, setLocalMin] = useState(minValue || String(min));
  const [localMax, setLocalMax] = useState(maxValue || String(max));

  useEffect(() => {
    setLocalMin(minValue || String(min));
  }, [minValue, min]);

  useEffect(() => {
    setLocalMax(maxValue || String(max));
  }, [maxValue, max]);

  const minPercent = ((Number(localMin) - min) / (max - min)) * 100;
  const maxPercent = ((Number(localMax) - min) / (max - min)) * 100;

  const handleMinSliderChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = Math.min(Number(e.target.value), Number(localMax) - step);
    setLocalMin(String(value));
    onMinChange(String(value));
  };

  const handleMaxSliderChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = Math.max(Number(e.target.value), Number(localMin) + step);
    setLocalMax(String(value));
    onMaxChange(String(value));
  };

  const formatCurrency = (value: string) => {
    const num = Number(value);
    if (num >= 1000000) return `${(num / 1000000).toFixed(1)}M`;
    if (num >= 1000) return `${(num / 1000).toFixed(0)}K`;
    return num.toLocaleString();
  };

  return (
    <div>
      <label className="block text-sm font-bold text-slate-900 dark:text-white mb-4">
        Price Range
      </label>

      {/* Slider Track Container */}
      <div className="relative h-2 mb-8">
        {/* Background Track */}
        <div className="absolute w-full h-2 bg-slate-200 dark:bg-slate-700 rounded-full" />
        
        {/* Active Range Track */}
        <div
          className="absolute h-2 bg-gradient-to-r from-emerald-500 to-emerald-600 rounded-full transition-all duration-200"
          style={{
            left: `${minPercent}%`,
            right: `${100 - maxPercent}%`,
          }}
        />

        {/* Min Thumb */}
        <input
          type="range"
          min={min}
          max={max}
          step={step}
          value={localMin}
          onChange={handleMinSliderChange}
          className="absolute w-full h-2 appearance-none bg-transparent pointer-events-none [&::-webkit-slider-thumb]:pointer-events-auto [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-6 [&::-webkit-slider-thumb]:h-6 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-white [&::-webkit-slider-thumb]:border-2 [&::-webkit-slider-thumb]:border-[#16A34A] [&::-webkit-slider-thumb]:shadow-lg [&::-webkit-slider-thumb]:cursor-pointer [&::-webkit-slider-thumb]:active:scale-125"
          style={{ zIndex: 3 }}
        />

        {/* Max Thumb */}
        <input
          type="range"
          min={min}
          max={max}
          step={step}
          value={localMax}
          onChange={handleMaxSliderChange}
          className="absolute w-full h-2 appearance-none bg-transparent pointer-events-none [&::-webkit-slider-thumb]:pointer-events-auto [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-6 [&::-webkit-slider-thumb]:h-6 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-white [&::-webkit-slider-thumb]:border-2 [&::-webkit-slider-thumb]:border-[#16A34A] [&::-webkit-slider-thumb]:shadow-lg [&::-webkit-slider-thumb]:cursor-pointer [&::-webkit-slider-thumb]:active:scale-125"
          style={{ zIndex: 4 }}
        />

        {/* Value Labels Above Thumbs */}
        <div
          className="absolute -top-8 transform -translate-x-1/2 transition-all duration-200"
          style={{ left: `${minPercent}%` }}
        >
          <div className="px-2 py-1 bg-[#16A34A] text-white text-xs font-bold rounded shadow-md whitespace-nowrap">
            {formatCurrency(localMin)}
          </div>
        </div>
        <div
          className="absolute -top-8 transform -translate-x-1/2 transition-all duration-200"
          style={{ left: `${maxPercent}%` }}
        >
          <div className="px-2 py-1 bg-[#16A34A] text-white text-xs font-bold rounded shadow-md whitespace-nowrap">
            {formatCurrency(localMax)}
          </div>
        </div>
      </div>

      {/* Numeric Inputs */}
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="block text-xs text-slate-500 mb-1.5">Minimum</label>
          <input
            type="number"
            value={localMin}
            onChange={(e) => {
              setLocalMin(e.target.value);
              onMinChange(e.target.value);
            }}
            placeholder="0"
            className="w-full px-4 py-2.5 bg-white dark:bg-slate-800 border-2 border-slate-200 dark:border-slate-700 rounded-xl text-sm focus:outline-none focus:border-[#16A34A]"
          />
        </div>
        <div>
          <label className="block text-xs text-slate-500 mb-1.5">Maximum</label>
          <input
            type="number"
            value={localMax}
            onChange={(e) => {
              setLocalMax(e.target.value);
              onMaxChange(e.target.value);
            }}
            placeholder="Any"
            className="w-full px-4 py-2.5 bg-white dark:bg-slate-800 border-2 border-slate-200 dark:border-slate-700 rounded-xl text-sm focus:outline-none focus:border-[#16A34A]"
          />
        </div>
      </div>
    </div>
  );
};

/* ────────────────────────────────────────────
   Price Range Input
   ──────────────────────────────────────────── */
const PriceRangeInput: React.FC<{
  minValue: string;
  maxValue: string;
  onMinChange: (v: string) => void;
  onMaxChange: (v: string) => void;
}> = ({ minValue, maxValue, onMinChange, onMaxChange }) => (
  <div>
    <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-2">
      Price Range
    </label>
    <div className="grid grid-cols-2 gap-3">
      <div>
        <label className="block text-xs text-slate-500 mb-1">Minimum</label>
        <input
          type="number"
          value={minValue}
          onChange={(e) => onMinChange(e.target.value)}
          placeholder="0"
          className="w-full px-4 py-2.5 bg-white dark:bg-slate-800 border-2 border-slate-200 dark:border-slate-700 rounded-xl text-sm"
        />
      </div>
      <div>
        <label className="block text-xs text-slate-500 mb-1">Maximum</label>
        <input
          type="number"
          value={maxValue}
          onChange={(e) => onMaxChange(e.target.value)}
          placeholder="Any"
          className="w-full px-4 py-2.5 bg-white dark:bg-slate-800 border-2 border-slate-200 dark:border-slate-700 rounded-xl text-sm"
        />
      </div>
    </div>
  </div>
);

/* ────────────────────────────────────────────
   Compact Select
   ──────────────────────────────────────────── */
const CompactSelect: React.FC<{
  label: string;
  value: string;
  onChange: (v: string) => void;
  options: { value: string; label: string }[];
}> = ({ label, value, onChange, options }) => {
  const [isOpen, setIsOpen] = useState(false);
  const selectedOption = options.find((opt) => opt.value === value) || options[0];

  return (
    <div className="relative">
      <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-2">
        {label}
      </label>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex items-center justify-between px-4 py-2.5 bg-white dark:bg-slate-800 border-2 border-slate-200 dark:border-slate-700 rounded-xl"
      >
        <span className="text-sm font-medium text-slate-900 dark:text-white">
          {selectedOption.label}
        </span>
        <ChevronDown
          className={`w-4 h-4 text-slate-400 transition-transform ${
            isOpen ? "rotate-180" : ""
          }`}
        />
      </button>

      {isOpen && (
        <>
          <div className="fixed inset-0 z-40" onClick={() => setIsOpen(false)} />
          <div className="absolute top-full left-0 right-0 mt-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl shadow-xl z-50 max-h-60 overflow-y-auto">
            {options.map((opt) => (
              <button
                key={opt.value}
                onClick={() => {
                  onChange(opt.value);
                  setIsOpen(false);
                }}
                className={`w-full px-4 py-2.5 text-left text-sm ${
                  value === opt.value
                    ? "bg-emerald-50 dark:bg-emerald-950/30 text-[#16A34A] font-semibold"
                    : "text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700"
                }`}
              >
                {opt.label}
              </button>
            ))}
          </div>
        </>
      )}
    </div>
  );
};

/* ────────────────────────────────────────────
   Toggle Switch
   ──────────────────────────────────────────── */
const ToggleSwitch: React.FC<{
  label: string;
  checked: boolean;
  onChange: (checked: boolean) => void;
}> = ({ label, checked, onChange }) => (
  <div className="flex items-center justify-between py-2">
    <span className="text-sm font-medium text-slate-700 dark:text-slate-300">
      {label}
    </span>
    <button
      onClick={() => onChange(!checked)}
      className={`relative w-11 h-6 rounded-full transition-colors ${
        checked ? "bg-[#16A34A]" : "bg-slate-300 dark:bg-slate-600"
      }`}
    >
      <span
        className={`absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full transition-transform ${
          checked ? "translate-x-5" : "translate-x-0"
        }`}
      />
    </button>
  </div>
);

/* ────────────────────────────────────────────
   Main Bottom Sheet Component
   ──────────────────────────────────────────── */
const MobileFilterBottomSheet: React.FC<MobileFilterBottomSheetProps> = ({
  activeCategory,
  activeZone,
  filters,
  onFilterChange,
  onZoneChange,
  onReset,
  onClose,
  resultCount = 0,
}) => {
  const { t, language } = useLanguage();
  const [showMoreFilters, setShowMoreFilters] = useState(false);

  /* ── Dynamic Transaction Options Based on Category ── */
  // Sprint 8g parity: sell-only subcategories (Land) collapse to Buy,
  // matching the desktop sidebar.
  const SELL_ONLY_SUBCATEGORIES = ["land"];
  const getTransactionOptions = () => {
    if (filters.subcategory && SELL_ONLY_SUBCATEGORIES.includes(filters.subcategory)) {
      return [{ value: "buy", label: t("intent.buy") }];
    }
    switch (activeZone) {
      case "house":
        return [
          { value: "buy", label: t("intent.buy") },
          { value: "rent", label: t("intent.rent") },
        ];
      case "car":
      case "fashion":
      case "electronics":
        return [
          { value: "buy", label: t("intent.buy") },
          { value: "rent", label: t("intent.rent") },
        ];
      case "stay":
      case "furniture":
        return [
          { value: "book", label: t("filter.bookingType") || "Book" },
          { value: "rent", label: t("intent.rent") },
        ];
      default:
        return [
          { value: "buy", label: t("intent.buy") },
          { value: "rent", label: t("intent.rent") },
        ];
    }
  };

  const transactionOptions = getTransactionOptions();

  /* Category options for the zone dropdown. This list used to carry an icon
   * and a per-zone count, and the counts were fetched with 8 parallel
   * /api/listings/count requests on every sheet open — but nothing ever
   * rendered them: the array is only consumed as {value, label} by
   * SearchableSelect below. Eight round-trips per open for data no user could
   * see. If tiles with live counts are wanted later, render cards here and add
   * a single GROUP BY breakdown to the count endpoint rather than re-adding one
   * request per zone. (The endpoint itself is still used by BrowseByLocation
   * and MobileHomeSections, so it stays.) */
  const categories = [
    { id: "all" as ActiveZone, label: t("cat.all") },
    { id: "house" as ActiveZone, label: t("cat.property") },
    { id: "car" as ActiveZone, label: t("cat.vehicle") },
    { id: "stay" as ActiveZone, label: t("cat.stay") },
    { id: "furniture" as ActiveZone, label: t("cat.furniture") },
    { id: "fashion" as ActiveZone, label: t("cat.fashion") },
    { id: "electronics" as ActiveZone, label: t("cat.electronics") },
  ];

  const regionOptions = [
    { value: "", label: t("region.all") || "All Regions" },
    { value: "sidama", label: t("region.sidama") },
    { value: "addis", label: t("region.addis") },
  ];

  // Real cities + official sub-cities from /api/locations — replaces the
  // stale hardcoded neighborhood list that masqueraded as "City".
  const [locations, setLocations] = useState<Array<{ key_name: string; label_en: string; label_am: string; sub_zones: unknown }>>([]);
  useEffect(() => {
    fetch("/api/locations")
      .then((r) => r.json())
      .then((d) => { if (d.success && Array.isArray(d.data)) setLocations(d.data); })
      .catch(() => {});
  }, []);

  const isAmharicLang = language === "amharic";
  const cityOptions = [
    { value: "", label: t("city.all") || "All Cities" },
    ...locations.map((l) => ({
      value: l.key_name,
      label: pickDbLabel(l, language),
    })),
  ];

  const parseSheetSubZones = (sz: unknown): Array<{ key: string; label_en: string; label_am: string }> => {
    if (!sz) return [];
    if (Array.isArray(sz)) return sz;
    try { return JSON.parse(String(sz)); } catch { return []; }
  };

  const sheetCity = locations.find((l) => l.key_name === filters.city);
  const sheetSubCities = parseSheetSubZones(sheetCity?.sub_zones);
  const subCityOptions = [
    { value: "", label: isAmharicLang ? "ሁሉም ክፍለ ከተማዎች" : "All Sub-cities" },
    ...sheetSubCities.map((s) => ({ value: `${filters.city}_${s.key}`, label: pickDbLabel(s, language) })),
  ];

  const propertyTypeOptions = [
    { value: "", label: t("filter.propAll") || "All Properties" },
    { value: "house", label: t("filter.propHouse") || "House" },
    { value: "apartment", label: t("filter.propApt") || "Apartment" },
    { value: "land", label: t("filter.propLand") || "Land" },
    { value: "commercial", label: t("filter.propComm") || "Commercial" },
  ];

  const bedroomOptions = [
    { value: "", label: t("filter.bedAny") || "Any" },
    { value: "1", label: "1" },
    { value: "2", label: "2" },
    { value: "3", label: "3" },
    { value: "4+", label: "4+" },
  ];

  /* Vehicle Type was removed: no code path ever wrote a `vehicle_type` value
   * (not the seed, not POST /listings, not the listing editor), so every
   * ListingItem had vehicleType === undefined and the client-side equality
   * check short-circuited — selecting "Sedan" silently did nothing. Body type
   * belongs in the attribute system (attr_body_type), which already filters
   * server-side and drives faceted counts. Reintroduce it there, not as a
   * dead dropdown. */


  // Mirrors the desktop sidebar. Values must match the write-path allowlists
  // in routes/listings.js, or the option silently matches nothing.
  const fuelTypeOptions = [
    { value: "", label: t("filter.fuelAll") },
    { value: "benzine", label: t("filter.benzine") },
    { value: "diesel", label: t("filter.diesel") },
    { value: "electric", label: t("filter.electric") },
    { value: "hybrid", label: t("filter.hybrid") },
  ];

  const conditionOptions = [
    { value: "", label: t("filter.conditionAll") },
    { value: "new", label: t("filter.condNew") },
    { value: "invoiced", label: t("filter.condInvoiced") },
    { value: "used", label: t("filter.condUsed") },
  ];

  // Occupancy floor for stays — kept in sync with the desktop sidebar.
  const guestOptions = [
    { value: "", label: t("filter.guestsAny") || "Any size" },
    { value: "1", label: "1" },
    { value: "2", label: "2" },
    { value: "3", label: "3" },
    { value: "4", label: "4" },
    { value: "5", label: "5+" },
  ];


  return (
    <div className="fixed inset-0 z-[200] flex flex-col bg-white dark:bg-slate-900">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-4 border-b border-slate-200 dark:border-slate-800">
        <button
          onClick={onClose}
          className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-full transition-colors"
        >
          <X className="w-6 h-6 text-slate-700 dark:text-slate-300" />
        </button>
        <h2 className="text-lg font-bold text-slate-900 dark:text-white">
          Refine Search
        </h2>
        <button
          onClick={onReset}
          className="text-sm font-semibold text-[#16A34A] hover:text-emerald-600"
        >
          Clear All
        </button>
      </div>

      {/* Scrollable Content */}
      <div className="flex-1 overflow-y-auto px-4 py-6 space-y-6 pb-32">


        {/* Category Dropdown */}
        <div className="space-y-4">
          <SearchableSelect
            label={t("filter.category") || "Category"}
            value={activeZone}
            onChange={(v) => onZoneChange(v as ActiveZone)}
            options={categories.map(cat => ({ value: cat.id, label: cat.label }))}
          />
        </div>

        {/* Transaction Type */}
        <div className="space-y-4">
          <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400">
            {activeZone === "stay" || activeZone === "furniture"
              ? t("filter.bookingType") || "Booking Type"
              : t("filter.iWantTo") || "I want to"}
          </label>
          <EnhancedSegmentedControl
            value={filters.intent || "buy"}
            onChange={(v) => onFilterChange("intent", v)}
            options={transactionOptions}
            columns={transactionOptions.length}
          />
        </div>

        {/* ── Taxonomy Facets — shared with the desktop sidebar (Sprint 8g) ── */}
        <TaxonomyFacetSection
          activeCategory={activeCategory}
          filters={filters}
          onFilterChange={onFilterChange}
          SelectComponent={SearchableSelect}
        />

        {/* Location */}
        <div className="space-y-4">
          <SearchableSelect
            label={t("sidebar.region") || "Region"}
            value={filters.region}
            onChange={(v) => onFilterChange("region", v)}
            options={regionOptions}
          />
          <SearchableSelect
            label={t("sidebar.city") || "City"}
            value={filters.city}
            onChange={(v) => {
              onFilterChange("city", v);
              if (v !== filters.city) onFilterChange("city_subzone", "");
            }}
            options={cityOptions}
          />
          {filters.city && sheetSubCities.length > 0 && (
            <SearchableSelect
              label={isAmharicLang ? "ክፍለ ከተማ" : "Sub City"}
              value={filters.city_subzone || ""}
              onChange={(v) => onFilterChange("city_subzone", v)}
              options={subCityOptions}
            />
          )}
        </div>



        {/* Dynamic Category Filters */}
        {activeZone === "house" && (
          <div className="space-y-4 pt-4 border-t border-slate-200 dark:border-slate-800">
            <h3 className="text-sm font-bold text-slate-900 dark:text-white">
              {t("filter.headerProperty") || "Property Filters"}
            </h3>
            <CompactSelect
              label={t("filter.propType") || "Property Type"}
              value={filters.propertyType || ""}
              onChange={(v) => onFilterChange("propertyType", v)}
              options={propertyTypeOptions}
            />
            <CompactSelect
              label={t("label.bedrooms") || "Bedrooms"}
              value={filters.bedrooms || ""}
              onChange={(v) => onFilterChange("bedrooms", v)}
              options={bedroomOptions}
            />
            <CompactSelect
              label={t("label.bathrooms") || "Bathrooms"}
              value={filters.bathrooms || ""}
              onChange={(v) => onFilterChange("bathrooms", v)}
              options={bedroomOptions}
            />
          </div>
        )}

        {activeZone === "stay" && (
          <div className="space-y-4 pt-4 border-t border-slate-200 dark:border-slate-800">
            <h3 className="text-sm font-bold text-slate-900 dark:text-white">
              {t("filter.headerStay") || "Stay Filters"}
            </h3>
            <CompactSelect
              label={t("filter.guests") || "Guests"}
              value={filters.guests || ""}
              onChange={(v) => onFilterChange("guests", v)}
              options={guestOptions}
            />
          </div>
        )}

        {activeZone === "car" && (
          <div className="space-y-4 pt-4 border-t border-slate-200 dark:border-slate-800">
            <h3 className="text-sm font-bold text-slate-900 dark:text-white">
              {t("filter.headerVehicle") || "Vehicle Filters"}
            </h3>
            <CompactSelect
              label={t("filter.fuelType") || "Fuel Type"}
              value={filters.fuelType || ""}
              onChange={(v) => onFilterChange("fuelType", v)}
              options={fuelTypeOptions}
            />
            <CompactSelect
              label={t("filter.condition") || "Condition"}
              value={filters.condition || ""}
              onChange={(v) => onFilterChange("condition", v)}
              options={conditionOptions}
            />
          </div>
        )}

        {/* More Filters */}
        <div className="pt-4 border-t border-slate-200 dark:border-slate-800">
          <button
            onClick={() => setShowMoreFilters(!showMoreFilters)}
            className="flex items-center justify-between w-full p-4 bg-slate-50 dark:bg-slate-800 rounded-xl"
          >
            <span className="text-sm font-bold text-slate-900 dark:text-white">
              Advanced Filters
            </span>
            <ChevronRight
              className={`w-5 h-5 text-slate-400 transition-transform ${
                showMoreFilters ? "rotate-90" : ""
              }`}
            />
          </button>

          {showMoreFilters && (
            <div className="mt-4 space-y-3 p-4 bg-slate-50 dark:bg-slate-800 rounded-xl">
              {activeZone === "house" && (
                <>
                  <ToggleSwitch
                    label="Furnished"
                    checked={filters.furnished || false}
                    onChange={(checked) => onFilterChange("furnished", checked)}
                  />
                  <ToggleSwitch
                    label="Parking Available"
                    checked={filters.parking || false}
                    onChange={(checked) => onFilterChange("parking", checked)}
                  />
                </>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Sticky Bottom Action Bar */}
      <div className="sticky bottom-0 left-0 right-0 px-4 py-4 bg-white dark:bg-slate-900 border-t border-slate-200 dark:border-slate-800 shadow-lg">
        <div className="flex items-center gap-3">
          <button
            onClick={onReset}
            className="px-6 py-3 text-sm font-semibold text-slate-700 dark:text-slate-300 underline"
          >
            Clear All
          </button>
          <button
            onClick={onClose}
            className="flex-1 px-6 py-3 bg-[#16A34A] hover:bg-emerald-600 text-white font-bold rounded-xl shadow-lg transition-all"
          >
            Show {resultCount > 0 ? `${resultCount.toLocaleString()} ` : ""}Results
          </button>
        </div>
      </div>
    </div>
  );
};

export default MobileFilterBottomSheet;
