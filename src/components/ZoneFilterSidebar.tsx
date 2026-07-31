/**
 * ZoneFilterSidebar.tsx
 * Malazone.com — Premium Split-Screen Filter Sidebar
 * © 2026 Malazone Technologies PLC
 */

import React, { useState, useRef, useEffect } from "react";
import {
  SlidersHorizontal,
  RotateCcw,
  ChevronDown,
  Check,
  Search,
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
  plateCode: string;
  fuelType: string;
  condition: string;
  titleDeed: string;
  sqm: string;
}

interface ZoneFilterSidebarProps {
  activeZone: ActiveZone;
  filters: FilterState;
  onFilterChange: (key: keyof FilterState, value: string) => void;
  onReset: () => void;
}

/* ────────────────────────────────────────────
   Premium Custom Select Dropdown
   ──────────────────────────────────────────── */
const FilterSelect: React.FC<{
  label: string;
  value: string;
  onChange: (v: string) => void;
  options: { value: string; label: string }[];
}> = ({ label, value, onChange, options }) => {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const selectedOption = options.find((opt) => opt.value === value) || options[0];

  return (
    <div
      ref={containerRef}
      className="mb-5 relative"
      onMouseEnter={() => setIsOpen(true)}
      onMouseLeave={() => setIsOpen(false)}
    >
      <label className="block text-[10px] font-bold text-malazone-navy dark:text-slate-500 uppercase tracking-[0.2em] mb-2.5 ml-1 font-sans">
        {label}
      </label>
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex items-center justify-between bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-white/5 rounded-xl px-4 py-3.5 text-sm text-malazone-navy dark:text-slate-200 font-bold focus:outline-none hover:border-[#00A86B]/40 dark:hover:border-[#00A86B]/30 transition-all duration-200 font-sans tracking-wide leading-relaxed"
      >
        <span className="truncate">{selectedOption.label}</span>
        <ChevronDown className={`w-4 h-4 text-malazone-navy transition-transform duration-300 ${isOpen ? "rotate-180" : ""}`} />
      </button>

      {isOpen && (
        <div className="absolute top-[calc(100%-8px)] left-0 right-0 mt-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-white/10 rounded-xl shadow-2xl z-[70] overflow-hidden animate-in fade-in slide-in-from-top-1 duration-200">
          <div className="max-h-60 overflow-y-auto py-1.5 custom-scrollbar">
            {options.map((opt) => (
              <button
                key={opt.value}
                onClick={() => {
                  onChange(opt.value);
                  setIsOpen(false);
                }}
                className={`w-full flex items-center justify-between px-4 py-2.5 text-xs font-bold transition-colors hover:bg-slate-50 dark:hover:bg-white/5 font-sans tracking-wide leading-relaxed ${value === opt.value
                  ? "text-[#00A86B] bg-[#00A86B]/5 dark:bg-[#00A86B]/10"
                  : "text-malazone-navy dark:text-slate-300"
                  }`}
              >
                {opt.label}
                {value === opt.value && <Check className="w-3.5 h-3.5" />}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

/* ────────────────────────────────────────────
   Sidebar Component
   ──────────────────────────────────────────── */
const ZoneFilterSidebar: React.FC<ZoneFilterSidebarProps> = ({
  activeZone,
  filters,
  onFilterChange,
  onReset,
}) => {
  const { t, language } = useLanguage();

  /* ── Region Options ── */
  const regionOptions = [
    { value: "", label: t("sidebar.regionAll") },
    { value: "sidama", label: t("region.sidama") },
    { value: "addis", label: t("region.addis") },
  ];

  /* ── City Options ── */
  const cityOptions = [
    { value: "", label: t("sidebar.cityAll") },
    { value: "tabor", label: t("city.tabor") },
    { value: "lakefront", label: t("city.lakefront") },
    { value: "piassa", label: t("city.piassa") },
    { value: "yirgalem", label: t("city.yirgalem") },
    { value: "bensa", label: t("city.bensa") },
    { value: "chuko", label: t("city.chuko") },
  ];

  /* ── Intent Options ── */
  const intentOptions = [
    { value: "", label: t("sidebar.intentAll") },
    { value: "buy", label: t("intent.buy") },
    { value: "rent", label: t("intent.rent") },
    { value: "hourly", label: t("intent.hourly") },
  ];

  /* ── Car Zone Dynamic: Plate Code ── */
  const plateCodeOptions = [
    { value: "", label: t("filter.plateAll") },
    { value: "code2", label: t("filter.plateCode2") },
    { value: "code3", label: t("filter.plateCode3") },
  ];

  /* ── Car Zone Dynamic: Fuel Type ── */
  const fuelTypeOptions = [
    { value: "", label: t("filter.fuelAll") },
    { value: "benzine", label: t("filter.benzine") },
    { value: "diesel", label: t("filter.diesel") },
    { value: "electric", label: t("filter.electric") },
  ];

  /* ── Car Zone Dynamic: Condition ── */
  const conditionOptions = [
    { value: "", label: t("filter.conditionAll") },
    { value: "new", label: t("filter.condNew") },
    { value: "used", label: t("filter.condUsed") },
    { value: "excellent", label: t("filter.condExcellent") },
  ];

  /* ── House Zone Dynamic: Title Deed ── */
  const titleDeedOptions = [
    { value: "", label: t("filter.deedAll") },
    { value: "carta", label: t("filter.deedCarta") },
    { value: "village", label: t("filter.deedVillage") },
  ];

  /* ── House Zone Dynamic: Square Meters ── */
  const sqmOptions = [
    { value: "", label: t("filter.sqmAll") },
    { value: "small", label: t("filter.sqmSmall") },
    { value: "medium", label: t("filter.sqmMedium") },
    { value: "large", label: t("filter.sqmLarge") },
  ];

  return (
    <aside className="w-full lg:w-80 shrink-0 bg-white dark:bg-slate-900/50 border border-slate-200/80 dark:border-white/5 rounded-2xl p-6 h-fit lg:sticky lg:top-28 shadow-sm">

      {/* ── Core Filters (Always Visible) ── */}
      <FilterSelect
        label={t("sidebar.region")}
        value={filters.region}
        onChange={(v) => onFilterChange("region", v)}
        options={regionOptions}
      />

      <FilterSelect
        label={t("sidebar.city")}
        value={filters.city}
        onChange={(v) => onFilterChange("city", v)}
        options={cityOptions}
      />

      <FilterSelect
        label={t("sidebar.intent")}
        value={filters.intent}
        onChange={(v) => onFilterChange("intent", v)}
        options={intentOptions}
      />

      {/* ── Cross-Industry Dynamic Filters ── */}
      {(activeZone === "car" || activeZone === "all") && (
        <>
          <div className="h-px bg-slate-200/80 dark:bg-white/5 my-5" />
          <p className="text-[10px] font-semibold text-green-600 dark:text-green-500 uppercase tracking-[0.15em] mb-4">
            {t("zone.car")}
          </p>
          <FilterSelect
            label={t("filter.plateCode")}
            value={filters.plateCode}
            onChange={(v) => onFilterChange("plateCode", v)}
            options={plateCodeOptions}
          />
          <FilterSelect
            label={t("filter.fuelType")}
            value={filters.fuelType}
            onChange={(v) => onFilterChange("fuelType", v)}
            options={fuelTypeOptions}
          />
          <FilterSelect
            label={t("filter.condition")}
            value={filters.condition}
            onChange={(v) => onFilterChange("condition", v)}
            options={conditionOptions}
          />
        </>
      )}

      {(activeZone === "house" || activeZone === "all") && (
        <>
          <div className="h-px bg-slate-200/80 dark:bg-white/5 my-5" />
          <p className="text-[10px] font-semibold text-amber-600 dark:text-amber-500 uppercase tracking-[0.15em] mb-4">
            {t("zone.house")}
          </p>
          <FilterSelect
            label={t("filter.titleDeed")}
            value={filters.titleDeed}
            onChange={(v) => onFilterChange("titleDeed", v)}
            options={titleDeedOptions}
          />
          <FilterSelect
            label={t("filter.sqm")}
            value={filters.sqm}
            onChange={(v) => onFilterChange("sqm", v)}
            options={sqmOptions}
          />
        </>
      )}
    </aside>
  );
};

export default ZoneFilterSidebar;

export type { FilterState };
