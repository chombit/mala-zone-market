/**
 * TaxonomyFacetSection.tsx
 * MALAZONE — Sprint 8g: shared taxonomy "Refine" section.
 *
 * Renders subcategory pills, scoped Brand select and per-subcategory
 * attribute selects with live "(n)" counts from /api/listings/facets.
 * Used by BOTH the desktop sidebar and the mobile filter bottom sheet so
 * the two surfaces can never drift apart again.
 */

import React, { useState, useEffect, useMemo } from "react";
import { useLanguage } from "@/contexts/ZoneLanguageContext";
import { pickDbLabel } from "@/utils/dbLabel";
import type { FilterState } from "./ZoneFilterSidebar";

export interface SelectComponentProps {
  label: string;
  value: string;
  onChange: (v: string) => void;
  options: { value: string; label: string }[];
}

interface TaxonomyFacetSectionProps {
  activeCategory?: string;
  filters: FilterState;
  onFilterChange: (key: keyof FilterState, value: any) => void;
  /** Inject each surface's own styled select (desktop inline vs mobile fullscreen). */
  SelectComponent?: React.FC<SelectComponentProps>;
}

interface FacetAttr {
  attr_key: string;
  label_en: string;
  label_am?: string | null;
  options: any[];
}
interface FacetData {
  children?: { slug: string; name_en: string; name_am?: string | null }[];
  brands?: { slug: string; name_en: string }[];
  attributes?: FacetAttr[];
}
interface FacetCountsShape {
  subcategories: Record<string, number>;
  brands: Record<string, number>;
  attributes: Record<string, Record<string, number>>;
}

const TAXONOMY_CATEGORIES = ["property", "motors", "stay", "furniture", "fashion", "electronics"];

const DefaultSelect: React.FC<SelectComponentProps> = ({ label, value, onChange, options }) => (
  <div className="mb-4">
    <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-2">{label}</label>
    <select
      value={value}
      onChange={(e) => onChange(e.target.value)}
      className="w-full px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-sm text-slate-900 dark:text-white"
    >
      {options.map((o) => (
        <option key={o.value} value={o.value}>{o.label}</option>
      ))}
    </select>
  </div>
);

const TaxonomyFacetSection: React.FC<TaxonomyFacetSectionProps> = ({
  activeCategory,
  filters,
  onFilterChange,
  SelectComponent = DefaultSelect,
}) => {
  const { language, t } = useLanguage();
  const isAmharic = language === "amharic";

  const taxonomyCategory =
    activeCategory && TAXONOMY_CATEGORIES.includes(activeCategory) ? activeCategory : null;
  const effectiveFacetCategory =
    taxonomyCategory && filters.subcategory ? filters.subcategory : taxonomyCategory;

  const [facetData, setFacetData] = useState<FacetData | null>(null);
  const [facetCounts, setFacetCounts] = useState<FacetCountsShape | null>(null);

  useEffect(() => {
    if (!effectiveFacetCategory) { setFacetData(null); return; }
    let cancelled = false;
    setFacetData(null);
    fetch(`/api/categories/${effectiveFacetCategory}`)
      .then((r) => r.json())
      .then((d) => { if (!cancelled && d?.success && d.data) setFacetData(d.data); })
      .catch(() => {});
    return () => { cancelled = true; };
  }, [effectiveFacetCategory]);

  const facetOptions = (facetData?.attributes || []).filter(
    (a) => Array.isArray(a.options) && a.options.length > 0
  );
  const hasFacets = !!(
    facetData &&
    ((facetData.children || []).length > 0 ||
      (facetData.brands || []).length > 0 ||
      facetOptions.length > 0)
  );

  // One /facets call returns every dimension under self-exclusion semantics,
  // so picking "Samsung" never hides how many Apples exist.
  const facetCountQuery = useMemo(() => {
    const p = new URLSearchParams();
    if (taxonomyCategory) p.set("category", taxonomyCategory);
    if (filters.subcategory) p.set("subcategory", filters.subcategory);
    if (filters.brand) p.set("brand", filters.brand);
    Object.keys(filters).forEach((k) => {
      if (k.startsWith("attr_")) {
        const v = (filters as Record<string, unknown>)[k];
        if (typeof v === "string" && v) p.set(k, v);
      }
    });
    return p.toString();
  }, [taxonomyCategory, filters]);

  useEffect(() => {
    if (!effectiveFacetCategory) { setFacetCounts(null); return; }
    let cancelled = false;
    fetch(`/api/listings/facets${facetCountQuery ? `?${facetCountQuery}` : ""}`)
      .then((r) => r.json())
      .then((d) => { if (!cancelled && d?.success) setFacetCounts(d.data); })
      .catch(() => {});
    return () => { cancelled = true; };
  }, [effectiveFacetCategory, facetCountQuery]);

  const withCount = (label: string, n: number | undefined | null) =>
    typeof n === "number" ? `${label} (${n})` : label;

  const optionLabel = (opt: any): { value: string; label_en: string; label_am?: string | null } =>
    typeof opt === "string"
      ? { value: opt, label_en: opt }
      : { value: String(opt.value ?? ""), label_en: String(opt.label_en ?? opt.value ?? ""), label_am: opt.label_am ?? null };

  if (!hasFacets || !facetData) return null;

  return (
    <>
      <div className="mb-4">
        <p className="text-[11px] font-black uppercase tracking-wider text-slate-400 dark:text-slate-500 mb-3">
          {isAmharic ? "ዝርዝር ማጣሪያ" : "Refine"}
        </p>

        {(facetData.children || []).length > 0 && (
          <div className="flex flex-wrap gap-1.5 mb-4">
            <button
              onClick={() => onFilterChange("subcategory", "")}
              className={`px-2.5 py-1.5 rounded-lg text-[11px] font-bold border transition-colors ${
                !filters.subcategory
                  ? "bg-[#00A86B] border-[#00A86B] text-white shadow-sm"
                  : "bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:border-[#00A86B]/40"
              }`}
            >
              {isAmharic ? "ሁሉም" : "All"}
            </button>
            {(facetData.children || []).map((child) => (
              <button
                key={child.slug}
                onClick={() =>
                  onFilterChange("subcategory", filters.subcategory === child.slug ? "" : child.slug)
                }
                className={`px-2.5 py-1.5 rounded-lg text-[11px] font-bold border transition-colors ${
                  filters.subcategory === child.slug
                    ? "bg-[#00A86B] border-[#00A86B] text-white shadow-sm"
                    : "bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:border-[#00A86B]/40"
                }`}
              >
                {withCount(pickDbLabel({ label_en: child.name_en, label_am: (child as { name_am?: string }).name_am }, language), facetCounts?.subcategories?.[child.slug])}
              </button>
            ))}
          </div>
        )}

        {(facetData.brands || []).length > 0 && (
          <div className="mb-4">
            <SelectComponent
              label={isAmharic ? "ብራንድ" : "Brand"}
              value={filters.brand || ""}
              onChange={(v) => onFilterChange("brand", v)}
              options={[
                { value: "", label: isAmharic ? "ሁሉም ብራንዶች" : "All Brands" },
                ...(facetData.brands || []).map((b) => ({
                  value: b.slug,
                  label: withCount(b.name_en, facetCounts?.brands?.[b.slug]),
                })),
              ]}
            />
          </div>
        )}

        {facetOptions.map((attr) => (
          <div key={attr.attr_key} className="mb-4">
            <SelectComponent
              label={pickDbLabel(attr, language)}
              value={(filters[`attr_${attr.attr_key}`] as string) || ""}
              onChange={(v) => onFilterChange(`attr_${attr.attr_key}`, v)}
              options={[
                {
                  value: "",
                  label: `${isAmharic ? "ሁሉም" : "All"} ${pickDbLabel(attr, language)}`,
                },
                ...attr.options.map((opt) => {
                  const o = optionLabel(opt);
                  return {
                    value: o.value,
                    label: withCount(pickDbLabel(o, language), facetCounts?.attributes?.[attr.attr_key]?.[o.value]),
                  };
                }),
              ]}
            />
          </div>
        ))}
      </div>
    </>
  );
};

export default TaxonomyFacetSection;
