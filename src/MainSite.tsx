/**
 * MainSite.tsx
 * Malazone.com — Client-Facing Marketplace Entry Point
 * Dual-theme root wrapper: bg-slate-50 (light) | bg-slate-950 (dark)
 * © 2026 Malazone Technologies PLC | Founder: Luwa Tesemma Kakawo
 */

import React, { useState } from 'react';
import Header from './components/Header';
import Hero from './components/Hero';
import ZoneFilterSidebar, { ActiveZone, FilterState } from './components/ZoneFilterSidebar';
import ZoneCatalogGrid from './components/ZoneCatalogGrid';
import MalaAgentsBanner from './components/MalaAgentsBanner';
import Footer from './components/Footer';

const defaultFilters: FilterState = {
  region: "",
  city: "",
  intent: "",
  plateCode: "",
  fuelType: "",
  condition: "",
  titleDeed: "",
  sqm: "",
};

const MainSite: React.FC = () => {
  const [activeCategory, setActiveCategory] = useState<string>("all");
  const [activeZone, setActiveZone] = useState<ActiveZone>("all");
  const [filters, setFilters] = useState<FilterState>(defaultFilters);

  /* Sync header category pills → activeZone for the catalog grid */
  const handleCategoryChange = (cat: string) => {
    setActiveCategory(cat);
    const zoneMap: Record<string, ActiveZone> = {
      all:       "all",
      property:  "house",
      motors:    "car",
      stay:      "ceremony",
      rooms:     "ceremony",
      ceremony:  "ceremony",
      heavy:     "machinery",
      machinery: "machinery",
    };
    setActiveZone(zoneMap[cat] ?? "all");
  };

  const handleFilterChange = (key: keyof FilterState, value: string) => {
    setFilters((prev) => ({ ...prev, [key]: value }));
  };

  const handleReset = () => {
    setFilters(defaultFilters);
  };

  return (
    <div
      className="
        min-h-screen
        bg-slate-50 dark:bg-slate-950
        text-slate-900 dark:text-slate-400
        selection:bg-emerald-500/30
        selection:text-emerald-900 dark:selection:text-emerald-200
        transition-colors duration-300
      "
    >
      {/* Fixed navigation header */}
      <Header onCategoryChange={handleCategoryChange} />

      <main>
        {/* Full-bleed hero carousel + search */}
        <Hero
          onCategoryChange={handleCategoryChange}
          onFilterChange={handleFilterChange}
        />

        {/* ── Split-Screen Catalog Section ──────────────────────── */}
        <div
          id="listings-catalog"
          className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8 py-12"
        >
          <div className="flex flex-col lg:flex-row gap-8">
            <ZoneFilterSidebar
              activeZone={activeZone}
              filters={filters}
              onFilterChange={handleFilterChange}
              onReset={handleReset}
            />
            <ZoneCatalogGrid
              activeZone={activeZone}
              filters={filters}
            />
          </div>
        </div>

        {/* ── Mala-Agents Recruitment Banner ───────────────────── */}
        <div id="agents">
          <MalaAgentsBanner />
        </div>
      </main>

      {/* ── Global Footer with CEO Anchor ─────────────────────── */}
      <Footer />
    </div>
  );
};

export default MainSite;
