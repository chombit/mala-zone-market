/**
 * ZoneFilterSidebar.tsx
 * MALAZONE — Premium Marketplace Filter (Airbnb/Zillow-inspired)
 * © 2026 Malazone Technologies PLC
 */

import React, { useState, useRef, useEffect } from "react";
import {
  SlidersHorizontal,
  RotateCcw,
  ChevronDown,
  Check,
  Search,
  Home,
  Car,
  Hotel,
  Music,
  Truck,
  Smartphone,
  ShoppingBag,
  Wrench,
  ChevronRight,
  X,
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

/* ────────────────────────────────────────────
   Types
   ──────────────────────────────────────────── */
export type ActiveZone = "all" | "car" | "house" | "ceremony" | "machinery" | "electronics";

interface FilterState {
  search: string;
  region: string;
  city: string;
  intent: string;
  
  // Price
  priceMin: string;
  priceMax: string;
  
  // Vehicle
  vehicleType: string;
  brand: string;
  fuelType: string;
  condition: string;
  
  // Property
  propertyType: string;
  bedrooms: string;
  bathrooms: string;
  area: string;
  titleDeed: string;
  
  // Machinery
  machineryType: string;
  
  // Stays
  stayType: string;
  guests: string;
  
  // Advanced
  verified: boolean;
  sellerType: string;
  parking: boolean;
  furnished: boolean;
  yearBuilt: string;
  
  // Quick Filters
  quickNearby: boolean;
  quickNewest: boolean;
  quickPriceSort: boolean;
  quickAvailable: boolean;
  quickWithPhotos: boolean;
  quickOpenNow: boolean;
}

interface ZoneFilterSidebarProps {
  activeZone: ActiveZone;
  filters: FilterState;
  onFilterChange: (key: keyof FilterState, value: any) => void;
  onZoneChange?: (zone: ActiveZone) => void;
  onReset: () => void;
}

/* ────────────────────────────────────────────
   Trust Indicator Component
   Badge with tooltip explaining verification benefits
   ──────────────────────────────────────────── */
const TrustIndicator: React.FC<{
  type: "verified" | "agent" | "business";
  label: string;
  description: string;
}> = ({ type, label, description }) => {
  const [showTooltip, setShowTooltip] = useState(false);

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
    <div className="relative">
      <button
        onMouseEnter={() => setShowTooltip(true)}
        onMouseLeave={() => setShowTooltip(false)}
        onClick={() => setShowTooltip(!showTooltip)}
        className="flex items-center gap-2 px-3 py-2 bg-emerald-50 dark:bg-emerald-950/30 text-emerald-700 dark:text-emerald-400 rounded-lg text-xs font-semibold transition-all hover:bg-emerald-100 dark:hover:bg-emerald-900/50 group"
      >
        {getIcon()}
        <span>{label}</span>
        <Info className="w-3 h-3 opacity-60 group-hover:opacity-100 transition-opacity" />
      </button>

      {showTooltip && (
        <div className="absolute z-50 bottom-full left-0 mb-2 w-64 p-3 bg-slate-900 dark:bg-slate-800 text-white text-xs rounded-lg shadow-xl">
          <div className="font-semibold mb-1">{label}</div>
          <div className="text-slate-300 dark:text-slate-400 leading-relaxed">
            {description}
          </div>
          <div className="absolute -bottom-1 left-4 w-2 h-2 bg-slate-900 dark:bg-slate-800 rotate-45" />
        </div>
      )}
    </div>
  );
};

/* ────────────────────────────────────────────
   Quick Filter Chip Component
   Premium chips with instant filtering (Verified, Nearby, Newest, etc.)
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
      transition-all duration-200 ease-out
      ${
        active
          ? "bg-[#16A34A] text-white shadow-md ring-1 ring-[#16A34A]/50"
          : "bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-400 border border-slate-300 dark:border-slate-700 hover:border-[#16A34A] hover:text-[#16A34A] hover:shadow-sm active:scale-95"
      }
    `}
  >
    {React.cloneElement(icon as React.ReactElement, {
      className: "w-3.5 h-3.5",
    })}
    <span>{label}</span>
  </button>
);

/* ────────────────────────────────────────────
   Premium Category Card Component
   Interactive cards with icon, title, live count, hover/press animations
   ──────────────────────────────────────────── */
const CategoryCard: React.FC<{
  zone: ActiveZone;
  label: string;
  icon: React.ReactNode;
  count: number;
  active: boolean;
  onClick: () => void;
}> = ({ zone, label, icon, count, active, onClick }) => (
  <button
    onClick={onClick}
    className={`
      group relative
      flex flex-col items-start gap-2
      p-4 rounded-2xl
      transition-all duration-200 ease-out
      ${
        active
          ? "bg-[#16A34A] text-white shadow-lg shadow-emerald-500/30 ring-2 ring-[#16A34A] ring-offset-2 dark:ring-offset-slate-900"
          : "bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-2 border-slate-200 dark:border-slate-700 hover:border-[#16A34A] hover:shadow-md hover:-translate-y-0.5 active:scale-[0.98]"
      }
    `}
  >
    {/* Icon */}
    <div
      className={`
        p-2.5 rounded-xl transition-colors
        ${
          active
            ? "bg-white/20"
            : "bg-emerald-50 dark:bg-emerald-950/30 text-[#16A34A] group-hover:bg-emerald-100 dark:group-hover:bg-emerald-900/50"
        }
      `}
    >
      {React.cloneElement(icon as React.ReactElement, {
        className: "w-5 h-5",
      })}
    </div>

    {/* Label */}
    <div className="flex flex-col items-start gap-0.5 w-full">
      <span className="text-sm font-bold leading-tight">{label}</span>
      <span
        className={`text-xs font-medium ${
          active ? "text-white/80" : "text-slate-500 dark:text-slate-400"
        }`}
      >
        {count > 0 ? `${count.toLocaleString()} Listings` : "No listings"}
      </span>
    </div>

    {/* Check indicator for selected state */}
    {active && (
      <div className="absolute -top-1 -right-1 w-6 h-6 bg-white rounded-full flex items-center justify-center shadow-md">
        <Check className="w-4 h-4 text-[#16A34A]" />
      </div>
    )}

    {/* Soft glow effect on selected */}
    {active && (
      <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-emerald-400/20 to-transparent pointer-events-none" />
    )}
  </button>
);

/* ────────────────────────────────────────────
   Enhanced Segmented Control (Dynamic Transaction Options)
   Shows Buy/Rent/Lease/Book based on active category
   ──────────────────────────────────────────── */
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
            transition-all duration-200 ease-out
            ${
              value === opt.value
                ? "bg-white dark:bg-slate-700 text-[#16A34A] shadow-sm scale-105"
                : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white active:scale-95"
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
   Segmented Control (Buy/Rent)
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
            : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
        }`}
      >
        {opt.label}
      </button>
    ))}
  </div>
);

/* ────────────────────────────────────────────
   Searchable Select Component
   ──────────────────────────────────────────── */
const SearchableSelect: React.FC<{
  label: string;
  value: string;
  onChange: (v: string) => void;
  options: { value: string; label: string }[];
  placeholder?: string;
}> = ({ label, value, onChange, options, placeholder }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
        setSearchTerm("");
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const selectedOption = options.find((opt) => opt.value === value) || options[0];
  const filteredOptions = options.filter((opt) =>
    opt.label.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div ref={containerRef} className="relative">
      <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-2">
        {label}
      </label>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex items-center justify-between px-4 py-3 bg-white dark:bg-slate-800 border-2 border-slate-200 dark:border-slate-700 rounded-xl hover:border-[#16A34A] transition-all text-left"
      >
        <span className="text-sm font-medium text-slate-900 dark:text-white truncate">
          {selectedOption.label}
        </span>
        <ChevronDown
          className={`w-4 h-4 text-slate-400 transition-transform flex-shrink-0 ml-2 ${
            isOpen ? "rotate-180" : ""
          }`}
        />
      </button>

      {isOpen && (
        <>
          <div className="fixed inset-0 z-40" onClick={() => setIsOpen(false)} />
          <div className="absolute top-full left-0 right-0 mt-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl shadow-xl z-50 overflow-hidden">
            {/* Search Input */}
            <div className="p-3 border-b border-slate-200 dark:border-slate-700">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input
                  type="text"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder={placeholder || `Search ${label.toLowerCase()}...`}
                  className="w-full pl-10 pr-4 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#16A34A]"
                  autoFocus
                />
              </div>
            </div>

            {/* Options */}
            <div className="max-h-60 overflow-y-auto">
              {filteredOptions.map((opt) => (
                <button
                  key={opt.value}
                  onClick={() => {
                    onChange(opt.value);
                    setIsOpen(false);
                    setSearchTerm("");
                  }}
                  className={`w-full flex items-center justify-between px-4 py-2.5 text-sm transition-colors ${
                    value === opt.value
                      ? "text-[#16A34A] bg-emerald-50 dark:bg-emerald-950/30 font-semibold"
                      : "text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700"
                  }`}
                >
                  {opt.label}
                  {value === opt.value && <Check className="w-4 h-4" />}
                </button>
              ))}
              {filteredOptions.length === 0 && (
                <div className="px-4 py-8 text-center text-sm text-slate-500">
                  No results found
                </div>
              )}
            </div>
          </div>
        </>
      )}
    </div>
  );
};

/* ────────────────────────────────────────────
   Premium Dual-Thumb Price Slider Component
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
}> = ({ minValue, maxValue, onMinChange, onMaxChange, min = 0, max = 10000000, step = 10000 }) => {
  const { t } = useLanguage();
  const [localMin, setLocalMin] = useState(minValue || String(min));
  const [localMax, setLocalMax] = useState(maxValue || String(max));
  const [isDraggingMin, setIsDraggingMin] = useState(false);
  const [isDraggingMax, setIsDraggingMax] = useState(false);

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
      <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-4">
        {t("filter.priceRange") || "Price Range"}
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
          onMouseDown={() => setIsDraggingMin(true)}
          onMouseUp={() => setIsDraggingMin(false)}
          onTouchStart={() => setIsDraggingMin(true)}
          onTouchEnd={() => setIsDraggingMin(false)}
          className="absolute w-full h-2 appearance-none bg-transparent pointer-events-none [&::-webkit-slider-thumb]:pointer-events-auto [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-5 [&::-webkit-slider-thumb]:h-5 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-white [&::-webkit-slider-thumb]:border-2 [&::-webkit-slider-thumb]:border-[#16A34A] [&::-webkit-slider-thumb]:shadow-md [&::-webkit-slider-thumb]:cursor-pointer [&::-webkit-slider-thumb]:transition-transform [&::-webkit-slider-thumb]:hover:scale-110 [&::-webkit-slider-thumb]:active:scale-125 [&::-moz-range-thumb]:pointer-events-auto [&::-moz-range-thumb]:appearance-none [&::-moz-range-thumb]:w-5 [&::-moz-range-thumb]:h-5 [&::-moz-range-thumb]:rounded-full [&::-moz-range-thumb]:bg-white [&::-moz-range-thumb]:border-2 [&::-moz-range-thumb]:border-[#16A34A] [&::-moz-range-thumb]:shadow-md [&::-moz-range-thumb]:cursor-pointer [&::-moz-range-thumb]:transition-transform [&::-moz-range-thumb]:hover:scale-110 [&::-moz-range-thumb]:active:scale-125"
          style={{ zIndex: isDraggingMin ? 5 : 3 }}
        />

        {/* Max Thumb */}
        <input
          type="range"
          min={min}
          max={max}
          step={step}
          value={localMax}
          onChange={handleMaxSliderChange}
          onMouseDown={() => setIsDraggingMax(true)}
          onMouseUp={() => setIsDraggingMax(false)}
          onTouchStart={() => setIsDraggingMax(true)}
          onTouchEnd={() => setIsDraggingMax(false)}
          className="absolute w-full h-2 appearance-none bg-transparent pointer-events-none [&::-webkit-slider-thumb]:pointer-events-auto [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-5 [&::-webkit-slider-thumb]:h-5 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-white [&::-webkit-slider-thumb]:border-2 [&::-webkit-slider-thumb]:border-[#16A34A] [&::-webkit-slider-thumb]:shadow-md [&::-webkit-slider-thumb]:cursor-pointer [&::-webkit-slider-thumb]:transition-transform [&::-webkit-slider-thumb]:hover:scale-110 [&::-webkit-slider-thumb]:active:scale-125 [&::-moz-range-thumb]:pointer-events-auto [&::-moz-range-thumb]:appearance-none [&::-moz-range-thumb]:w-5 [&::-moz-range-thumb]:h-5 [&::-moz-range-thumb]:rounded-full [&::-moz-range-thumb]:bg-white [&::-moz-range-thumb]:border-2 [&::-moz-range-thumb]:border-[#16A34A] [&::-moz-range-thumb]:shadow-md [&::-moz-range-thumb]:cursor-pointer [&::-moz-range-thumb]:transition-transform [&::-moz-range-thumb]:hover:scale-110 [&::-moz-range-thumb]:active:scale-125"
          style={{ zIndex: isDraggingMax ? 5 : 4 }}
        />

        {/* Value Labels Above Thumbs */}
        <div
          className="absolute -top-8 transform -translate-x-1/2 transition-all duration-200"
          style={{ left: `${minPercent}%` }}
        >
          <div className="px-2 py-1 bg-[#16A34A] text-white text-xs font-bold rounded shadow-md whitespace-nowrap">
            {formatCurrency(localMin)} Birr
          </div>
        </div>
        <div
          className="absolute -top-8 transform -translate-x-1/2 transition-all duration-200"
          style={{ left: `${maxPercent}%` }}
        >
          <div className="px-2 py-1 bg-[#16A34A] text-white text-xs font-bold rounded shadow-md whitespace-nowrap">
            {formatCurrency(localMax)} Birr
          </div>
        </div>
      </div>

      {/* Numeric Inputs */}
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="block text-xs text-slate-500 dark:text-slate-400 mb-1.5 font-medium">
            Minimum
          </label>
          <div className="relative group">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-xs font-medium">
              Birr
            </span>
            <input
              type="number"
              value={localMin}
              onChange={(e) => {
                setLocalMin(e.target.value);
                onMinChange(e.target.value);
              }}
              placeholder="0"
              className="w-full pl-11 pr-3 py-2.5 bg-white dark:bg-slate-800 border-2 border-slate-200 dark:border-slate-700 rounded-xl text-sm font-medium transition-all focus:outline-none focus:border-[#16A34A] focus:ring-2 focus:ring-emerald-500/20 group-hover:border-slate-300 dark:group-hover:border-slate-600"
            />
          </div>
        </div>
        <div>
          <label className="block text-xs text-slate-500 dark:text-slate-400 mb-1.5 font-medium">
            Maximum
          </label>
          <div className="relative group">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-xs font-medium">
              Birr
            </span>
            <input
              type="number"
              value={localMax}
              onChange={(e) => {
                setLocalMax(e.target.value);
                onMaxChange(e.target.value);
              }}
              placeholder="Any"
              className="w-full pl-11 pr-3 py-2.5 bg-white dark:bg-slate-800 border-2 border-slate-200 dark:border-slate-700 rounded-xl text-sm font-medium transition-all focus:outline-none focus:border-[#16A34A] focus:ring-2 focus:ring-emerald-500/20 group-hover:border-slate-300 dark:group-hover:border-slate-600"
            />
          </div>
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
}> = ({ minValue, maxValue, onMinChange, onMaxChange }) => {
  const { t } = useLanguage();
  
  return (
    <div>
      <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-2">
        {t("filter.priceRange") || "Price Range"}
      </label>
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="block text-xs text-slate-500 mb-1">Minimum</label>
          <div className="relative">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-sm">
              Birr
            </span>
            <input
              type="number"
              value={minValue}
              onChange={(e) => onMinChange(e.target.value)}
              placeholder="0"
              className="w-full pl-12 pr-3 py-2.5 bg-white dark:bg-slate-800 border-2 border-slate-200 dark:border-slate-700 rounded-xl text-sm focus:outline-none focus:border-[#16A34A]"
            />
          </div>
        </div>
        <div>
          <label className="block text-xs text-slate-500 mb-1">Maximum</label>
          <div className="relative">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-sm">
              Birr
            </span>
            <input
              type="number"
              value={maxValue}
              onChange={(e) => onMaxChange(e.target.value)}
              placeholder="Any"
              className="w-full pl-12 pr-3 py-2.5 bg-white dark:bg-slate-800 border-2 border-slate-200 dark:border-slate-700 rounded-xl text-sm focus:outline-none focus:border-[#16A34A]"
            />
          </div>
        </div>
      </div>
    </div>
  );
};

/* ────────────────────────────────────────────
   Compact Select Dropdown
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
        className="w-full flex items-center justify-between px-4 py-2.5 bg-white dark:bg-slate-800 border-2 border-slate-200 dark:border-slate-700 rounded-xl hover:border-[#16A34A] transition-all text-left"
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
                className={`w-full px-4 py-2.5 text-left text-sm transition-colors ${
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
   Main Sidebar Component
   ──────────────────────────────────────────── */
const ZoneFilterSidebar: React.FC<ZoneFilterSidebarProps> = ({
  activeZone,
  filters,
  onFilterChange,
  onZoneChange,
  onReset,
}) => {
  const { t } = useLanguage();

  /* ── Category Options with Live Counts ── */
  const categories = [
    { id: "all" as ActiveZone, label: t("cat.all"), icon: <ShoppingBag className="w-4 h-4" />, count: 15420 },
    { id: "house" as ActiveZone, label: t("cat.property"), icon: <Home className="w-4 h-4" />, count: 12542 },
    { id: "car" as ActiveZone, label: t("cat.vehicle"), icon: <Car className="w-4 h-4" />, count: 2481 },
    { id: "ceremony" as ActiveZone, label: t("cat.stay"), icon: <Hotel className="w-4 h-4" />, count: 824 },
    { id: "machinery" as ActiveZone, label: t("cat.machinery"), icon: <Truck className="w-4 h-4" />, count: 493 },
    { id: "electronics" as ActiveZone, label: t("cat.electronics"), icon: <Smartphone className="w-4 h-4" />, count: 3291 },
  ];

  /* ── Dynamic Transaction Options Based on Category ── */
  const getTransactionOptions = () => {
    switch (activeZone) {
      case "house":
        return [
          { value: "buy", label: t("intent.buy") },
          { value: "rent", label: t("intent.rent") },
        ];
      case "car":
      case "machinery":
      case "electronics":
        return [
          { value: "buy", label: t("intent.buy") },
          { value: "rent", label: t("intent.rent") },
        ];
      case "ceremony":
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

  /* ── Transaction Options ── */
  const transactionOptionsOld = [
    { value: "buy", label: t("intent.buy") },
    { value: "rent", label: t("intent.rent") },
  ];

  /* ── Location Options ── */
  const regionOptions = [
    { value: "", label: t("region.all") || "All Regions" },
    { value: "sidama", label: t("region.sidama") },
    { value: "addis", label: t("region.addis") },
  ];

  const cityOptions = [
    { value: "", label: t("city.all") || "All Cities" },
    { value: "tabor", label: t("city.tabor") },
    { value: "lakefront", label: t("city.lakefront") },
    { value: "piassa", label: t("city.piassa") },
    { value: "yirgalem", label: t("city.yirgalem") },
    { value: "bensa", label: t("city.bensa") },
    { value: "chuko", label: t("city.chuko") },
  ];

  /* ── Dynamic Category Filters ── */
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

  const vehicleTypeOptions = [
    { value: "", label: t("filter.vehAll") || "All Vehicles" },
    { value: "sedan", label: t("filter.vehSedan") || "Sedan" },
    { value: "suv", label: t("filter.vehSuv") || "SUV" },
    { value: "truck", label: t("filter.vehTruck") || "Truck" },
    { value: "van", label: t("filter.vehVan") || "Van" },
  ];

  const fuelTypeOptions = [
    { value: "", label: t("filter.fuelAll") },
    { value: "benzine", label: t("filter.benzine") },
    { value: "diesel", label: t("filter.diesel") },
    { value: "electric", label: t("filter.electric") },
  ];

  const conditionOptions = [
    { value: "", label: t("filter.conditionAll") },
    { value: "new", label: t("filter.condNew") },
    { value: "used", label: t("filter.condUsed") },
    { value: "excellent", label: t("filter.condExcellent") },
  ];

  return (
    <aside className="w-full lg:w-72 shrink-0 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 h-fit lg:sticky lg:top-28 shadow-sm">
      {/* Header with Trust Indicator */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-2">
          <SlidersHorizontal className="w-5 h-5 text-[#16A34A]" />
          <h3 className="text-lg font-bold text-slate-900 dark:text-white">
            {t("sidebar.title")}
          </h3>
        </div>
        <button
          onClick={onReset}
          className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-[#16A34A] hover:bg-emerald-50 dark:hover:bg-emerald-950/30 rounded-lg transition-colors"
        >
          <RotateCcw className="w-3.5 h-3.5" />
          {t("sidebar.reset")}
        </button>
      </div>



      <div className="h-px bg-slate-200 dark:bg-slate-800 my-6" />

      {/* Category Dropdown */}
      <div className="mb-6">
        <SearchableSelect
          label="Category"
          value={activeZone}
          onChange={(v) => onZoneChange && onZoneChange(v as ActiveZone)}
          options={categories.map(cat => ({ value: cat.id, label: cat.label }))}
        />
      </div>

      <div className="h-px bg-slate-200 dark:bg-slate-800 my-6" />

      {/* Transaction Type - Dynamic Options */}
      <div className="mb-6">
        <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-3">
          {activeZone === "ceremony" ? t("filter.bookingType") || "Booking Type" : t("filter.iWantTo") || "I want to"}
        </label>
        <EnhancedSegmentedControl
          value={filters.intent || "buy"}
          onChange={(v) => onFilterChange("intent", v)}
          options={transactionOptions}
          columns={transactionOptions.length}
        />
      </div>

      {/* Location */}
      <div className="mb-6 space-y-4">
        <SearchableSelect
          label={t("sidebar.region") || "Region"}
          value={filters.region}
          onChange={(v) => onFilterChange("region", v)}
          options={regionOptions}
          placeholder="Search regions..."
        />

        <SearchableSelect
          label={t("sidebar.city") || "City"}
          value={filters.city}
          onChange={(v) => onFilterChange("city", v)}
          options={cityOptions}
          placeholder="Search cities..."
        />
      </div>



      <div className="h-px bg-slate-200 dark:bg-slate-800 my-6" />

      {/* Dynamic Category Filters */}
      {activeZone === "house" && (
        <div className="space-y-4 mb-6">
          <h4 className="text-sm font-bold text-slate-900 dark:text-white">
            {t("filter.headerProperty") || "Property Filters"}
          </h4>
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

      {activeZone === "car" && (
        <div className="space-y-4 mb-6">
          <h4 className="text-sm font-bold text-slate-900 dark:text-white">
            {t("filter.headerVehicle") || "Vehicle Filters"}
          </h4>
          <CompactSelect
            label={t("filter.vehType") || "Vehicle Type"}
            value={filters.vehicleType || ""}
            onChange={(v) => onFilterChange("vehicleType", v)}
            options={vehicleTypeOptions}
          />
          <CompactSelect
            label={t("filter.fuelType")}
            value={filters.fuelType || ""}
            onChange={(v) => onFilterChange("fuelType", v)}
            options={fuelTypeOptions}
          />
          <CompactSelect
            label={t("filter.condition")}
            value={filters.condition || ""}
            onChange={(v) => onFilterChange("condition", v)}
            options={conditionOptions}
          />
        </div>
      )}

    </aside>
  );
};

export default ZoneFilterSidebar;

export type { FilterState, ActiveZone };
