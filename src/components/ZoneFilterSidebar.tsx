/**
 * ZoneFilterSidebar.tsx
 * Malazone.com — Premium Split-Screen Filter Sidebar
 * © 2026 Malazone Technologies PLC | Founder: Luwa Tesemma Kakawo
 */

import React from "react";
import {
  SlidersHorizontal,
  RotateCcw,
  ChevronDown,
} from "lucide-react";
import { useLanguage } from "@/contexts/ZoneLanguageContext";

/* ────────────────────────────────────────────
   Types
   ──────────────────────────────────────────── */
export type ActiveZone = "all" | "car" | "house" | "ceremony" | "machinery";

interface FilterState {
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
   Reusable Select Dropdown
   ──────────────────────────────────────────── */
const FilterSelect: React.FC<{
  label: string;
  value: string;
  onChange: (v: string) => void;
  options: { value: string; label: string }[];
}> = ({ label, value, onChange, options }) => (
  <div className="mb-5">
    <label className="block text-xs font-medium text-slate-400 dark:text-slate-500 uppercase tracking-widest mb-2">
      {label}
    </label>
    <div className="relative">
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full appearance-none bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-white/5 rounded-xl px-4 py-3 pr-10 text-sm text-slate-800 dark:text-slate-200 font-medium focus:outline-none focus:ring-2 focus:ring-green-500/40 focus:border-green-500 transition-all duration-200 cursor-pointer"
      >
        {options.map((opt) => (
          <option key={opt.value} value={opt.value}>
            {opt.label}
          </option>
        ))}
      </select>
      <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
    </div>
  </div>
);

/* ────────────────────────────────────────────
   Sidebar Component
   ──────────────────────────────────────────── */
const ZoneFilterSidebar: React.FC<ZoneFilterSidebarProps> = ({
  activeZone,
  filters,
  onFilterChange,
  onReset,
}) => {
  const { t } = useLanguage();

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
      {/* ── Header ── */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-2">
          <SlidersHorizontal className="w-5 h-5 text-green-600 dark:text-green-500" />
          <h3 className="text-base font-bold text-slate-900 dark:text-white tracking-tight">
            {t("sidebar.title")}
          </h3>
        </div>
        <button
          onClick={onReset}
          className="flex items-center gap-1.5 text-xs text-slate-400 hover:text-green-600 dark:hover:text-green-400 transition-colors duration-200"
        >
          <RotateCcw className="w-3.5 h-3.5" />
          {t("sidebar.reset")}
        </button>
      </div>

      {/* ── Divider ── */}
      <div className="h-px bg-slate-200/80 dark:bg-white/5 mb-5" />

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
