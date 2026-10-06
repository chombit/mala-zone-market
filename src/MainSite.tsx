/**
 * MainSite.tsx
 * Malazone.com — Client-Facing Marketplace Entry Point
 * Dual-theme root wrapper: bg-slate-50 (light) | bg-slate-950 (dark)
 * © 2026 Malazone Technologies PLC
 */

import React, { useState, useEffect } from 'react';
import Header from './components/Header';
import Hero from './components/Hero';
import ZoneFilterSidebar, { ActiveZone, FilterState } from './components/ZoneFilterSidebar';
import ZoneCatalogGrid from './components/ZoneCatalogGrid';
import { MalaAgentsUnified } from './components/MalaAgentsUnified';
import CategoryGrid from './components/CategoryGrid';
import { BrowseByLocation } from './components/BrowseByLocation';
import Footer from './components/Footer';
import AboutPage from './components/pages/AboutPage';
import ContactPage from './components/pages/ContactPage';
import PrivacyPage from './components/pages/PrivacyPage';
import { FavoritesSidebar } from './components/FavoritesSidebar';
import PWAInstallPrompt from './components/PWAInstallPrompt';
import BottomNavigation from './components/BottomNavigation';
import BuyerPostListingModal from './components/BuyerPostListingModal';
import { useAuth } from '@/contexts/AuthContext';
import MobileFilterBottomSheet from './components/MobileFilterBottomSheet';
import MobileQuickCards from './components/MobileQuickCards';

import GigHubPage from './components/pages/GigHubPage';
import AgentOnboardPage from './components/pages/AgentOnboardPage';
import MobileHomeHeader from './components/MobileHomeHeader';

import { MalazoneEnterpriseFaq } from './components/MalazoneEnterpriseFaq';
import { useLanguage } from '@/contexts/ZoneLanguageContext';

export type PageView = "home" | "about" | "contact" | "privacy" | "gighub" | "agent-onboard" | "faq";

const defaultFilters: FilterState = {
  search: "",
  region: "",
  // Pilot market: Hawassa is the platform default city.
  city: "hawassa",
  city_subzone: "",
  intent: "buy",
  subcategory: "",
  brand: "",
  priceMin: "",
  priceMax: "",
  plateCode: "",
  fuelType: "",
  condition: "",
  propertyType: "",
  bedrooms: "",
  bathrooms: "",
  area: "",
  sqm: "",
  titleDeed: "",
  fashionType: "",
  guests: "",
  verified: false,
  sellerType: "",
  parking: false,
  furnished: false,
  yearBuilt: "",
  quickNearby: false,
  quickNewest: false,
  quickPriceSort: false,
  quickAvailable: false,
  quickWithPhotos: false,
  quickOpenNow: false,
};

/* ── Sprint 8f: URL deep-linking ────────────────────────────────────────
 * Filters serialize to the query string (?cat=property&subcategory=land&…)
 * so any filtered view survives refresh and is shareable/bookmarkable.
 * replaceState keeps the browser history clean. */
/* Sprint 9a: zones renamed — ceremony→furniture, machinery/heavy→fashion.
 * Legacy cat= values still map so old bookmarks keep working. */
const ZONE_MAP: Record<string, ActiveZone> = {
  all: "all",
  property: "house",
  motors: "car",
  stay: "stay",
  rooms: "stay",
  furniture: "furniture",
  ceremony: "furniture",
  fashion: "fashion",
  heavy: "fashion",
  machinery: "fashion",
  electronics: "electronics",
};

/* Inverse of ZONE_MAP: the canonical category for each zone. Zones fold away
 * legacy categories (ceremony→furniture, machinery→fashion), so the first
 * category that maps to a zone is the one we re-select. Derived rather than
 * hand-written so the two tables cannot drift apart. */
const ZONE_TO_CATEGORY = Object.keys(ZONE_MAP).reduce<Record<ActiveZone, string>>(
  (acc, cat) => {
    const zone = ZONE_MAP[cat];
    if (acc[zone] === undefined) acc[zone] = cat;
    return acc;
  },
  {} as Record<ActiveZone, string>,
);

const FILTER_URL_KEYS = ["search", "city", "city_subzone", "intent", "priceMin", "priceMax", "subcategory", "brand", "guests"] as const;

function readStateFromUrl(): { cat: string; zone: ActiveZone; filters: FilterState } {
  const empty: FilterState = { ...defaultFilters };
  if (typeof window === "undefined") return { cat: "all", zone: "all", filters: empty };
  const p = new URLSearchParams(window.location.search);
  const filters: FilterState = { ...defaultFilters };
  FILTER_URL_KEYS.forEach((k) => {
    const v = p.get(k);
    if (v === null) return;
    // "all" is the URL sentinel for an explicitly cleared city filter —
    // without it the Hawassa default would resurrect on every reload.
    (filters as Record<string, unknown>)[k] = k === "city" && v === "all" ? "" : v;
  });
  for (const [k, v] of p.entries()) {
    if (k.startsWith("attr_")) (filters as Record<string, unknown>)[k] = v;
  }
  const cat = p.get("cat") || "all";
  if (cat === "intent_buy") filters.intent = "buy";
  if (cat === "intent_rent") filters.intent = "rent";
  return { cat, zone: ZONE_MAP[cat] ?? "all", filters };
}

function writeUrl(cat: string, f: FilterState) {
  if (typeof window === "undefined") return;
  const p = new URLSearchParams();
  if (cat !== "all") p.set("cat", cat);
  FILTER_URL_KEYS.forEach((k) => {
    const v = f[k];
    if (k === "city") {
      p.set("city", typeof v === "string" && v ? v : "all");
      return;
    }
    if (typeof v === "string" && v) p.set(k, v);
  });
  Object.keys(f).forEach((k) => {
    if (k.startsWith("attr_")) {
      const v = (f as Record<string, unknown>)[k];
      if (typeof v === "string" && v) p.set(k, v);
    }
  });
  const qs = p.toString();
  window.history.replaceState(null, "", `${window.location.pathname}${qs ? `?${qs}` : ""}`);
}

function catalogTitle(cat: string, f: FilterState): string {
  const pretty = (s: string) =>
    s.split(/[-_]/).map((w) => w.charAt(0).toUpperCase() + w.slice(1)).join(" ");
  const parts: string[] = [];
  if (f.subcategory) parts.push(pretty(f.subcategory));
  if (cat !== "all" && !cat.startsWith("intent")) parts.push(pretty(cat));
  parts.push("Malazone");
  return parts.join(" — ");
}

const MainSite: React.FC = () => {
  const [activeCategory, setActiveCategory] = useState<string>(() => readStateFromUrl().cat);
  const [activeZone, setActiveZone] = useState<ActiveZone>(() => readStateFromUrl().zone);
  const [filters, setFilters] = useState<FilterState>(() => readStateFromUrl().filters);
  const [currentPage, setCurrentPage] = useState<PageView>(() => {
    const path = window.location.pathname.replace(/^\//, "");
    const VALID_PAGES: PageView[] = ["home", "about", "contact", "privacy", "gighub", "agent-onboard", "faq"];
    if (VALID_PAGES.includes(path as PageView)) return path as PageView;
    const ALIASES: Record<string, PageView> = {
      "agent/register": "agent-onboard",
      "agent/onboard": "agent-onboard",
    };
    return ALIASES[path] ?? "home";
  });
  const [showMobileFilters, setShowMobileFilters] = useState(false);
  const [showPostModal, setShowPostModal] = useState(false);
  const { language } = useLanguage();
  const { isAuthenticated } = useAuth();

  /* Sync header category pills → activeZone & filters for the catalog grid */
  const handleCategoryChange = (cat: string) => {
    setActiveCategory(cat);
    // Stale taxonomy facets must not leak across category switches
    setFilters((prev) => {
      const next: FilterState = { ...prev, subcategory: "", brand: "", guests: "" };
      Object.keys(prev).forEach((k) => {
        if (k.startsWith("attr_")) next[k] = "";
      });
      return next;
    });
    if (cat === "intent_buy") {
      setFilters((prev) => ({ ...prev, intent: "buy" }));
      setActiveZone("all");
      return;
    }
    if (cat === "intent_rent") {
      setFilters((prev) => ({ ...prev, intent: "rent" }));
      setActiveZone("all");
      return;
    }

    const zoneMap: Record<string, ActiveZone> = ZONE_MAP;
    setActiveZone(zoneMap[cat] ?? "all");
  };

  /* Picking a zone is a category pick. Delegate to handleCategoryChange so the
   * query, the URL and the highlighted tile can never disagree, and so stale
   * taxonomy facets (subcategory/brand/attrs) get cleared on the way. */
  const handleZoneChange = (zone: ActiveZone) => {
    handleCategoryChange(ZONE_TO_CATEGORY[zone] ?? "all");
  };

  const handleFilterChange = (key: keyof FilterState, value: string) => {
    setFilters((prev) => {
      const next: FilterState = { ...prev, [key]: value };
      // Picking a subcategory re-scopes the world: its brand list and
      // attribute set differ, so stale selections must reset.
      if (key === "subcategory") {
        next.brand = "";
        Object.keys(prev).forEach((k) => {
          if (k.startsWith("attr_")) next[k] = "";
        });
        // Sell-only subcategories (e.g. Land): a stale "rent" intent would
        // hide every result — snap back to Buy.
        const SELL_ONLY = ["land"];
        if (SELL_ONLY.includes(String(value)) && prev.intent === "rent") {
          next.intent = "buy";
        }
      }
      return next;
    });
  };

  const handleReset = () => {
    setFilters(defaultFilters);
  };

  // Keep the address bar + document title in sync with the catalog state so
  // every filtered view is a stable, shareable URL.
  useEffect(() => {
    writeUrl(activeCategory, filters);
    document.title = catalogTitle(activeCategory, filters);
  }, [activeCategory, filters]);

  const navigateTo = (page: PageView) => {
    setCurrentPage(page);
    const url = page === "home" ? "/" : `/${page}`;
    if (window.location.pathname !== url) {
      window.history.pushState({}, "", url);
    }
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  /* Open post modal from bottom nav or other external triggers */
  useEffect(() => {
    const handler = () => setShowPostModal(true);
    window.addEventListener("malazone:open-post-modal", handler);
    return () => window.removeEventListener("malazone:open-post-modal", handler);
  }, []);

  return (
    <div
      className="
        min-h-screen
        bg-slate-50 dark:bg-slate-950
        text-malazone-navy dark:text-slate-400
        selection:bg-emerald-500/30
        selection:text-emerald-900 dark:selection:text-emerald-200
        transition-colors duration-300
        pb-0
      "
    >
          <FavoritesSidebar />
      <PWAInstallPrompt />

      {/* ── Desktop header (hidden on mobile — MobileHomeHeader takes over) ── */}
      <div className="hidden lg:block">
        <Header
          activeCategory={activeCategory}
          onCategoryChange={handleCategoryChange}
        />
      </div>

      {/* ── Mobile: minimal sticky top bar for sub-pages (about, contact, etc.) ── */}
      {currentPage !== "home" && (
        <div className="lg:hidden sticky top-0 z-[150] bg-[#0B132B] flex items-center gap-3 px-4 py-3 shadow-md">
          <button
            onClick={() => navigateTo("home")}
            className="text-white/70 hover:text-white transition-colors text-sm font-bold"
            aria-label="Back to home"
          >
            ← Back
          </button>
          <span className="text-[#00A86B] font-black text-lg tracking-tight">MALA</span>
          <span className="text-white font-black text-lg tracking-tight -ml-1">ZONE</span>
        </div>
      )}

      <div className="pt-0 lg:pt-[84px]">
        {currentPage === "about" && <AboutPage onBack={() => navigateTo("home")} />}
        {currentPage === "contact" && <ContactPage onBack={() => navigateTo("home")} />}
        {currentPage === "privacy" && <PrivacyPage onBack={() => navigateTo("home")} />}
        {currentPage === "gighub" && <GigHubPage onBack={() => navigateTo("home")} />}
        {currentPage === "agent-onboard" && <AgentOnboardPage onBack={() => navigateTo("home")} />}
        {currentPage === "faq" && <MalazoneEnterpriseFaq onBackToMain={() => navigateTo("home")} currentGlobalLang={language === 'amharic' ? 'am' : 'en'} />}

        {currentPage === "home" && (
          <main>
            {/* ── Mobile Home Header (navy bar + search + hero carousel + category row) ── */}
            <MobileHomeHeader
              onCategoryChange={handleCategoryChange}
              onFilterClick={() => setShowMobileFilters(true)}
              onSearchChange={(val) => handleFilterChange("search", val)}
              searchValue={filters.search}
            />

            {/* ── Desktop-only: full hero carousel + search ── */}
            <div className="hidden lg:block">
              <Hero
                activeCategory={activeCategory}
                onCategoryChange={handleCategoryChange}
                onFilterChange={(key, value) => handleFilterChange(key as keyof FilterState, value)}
              />
            </div>

            {/* ── Desktop Category Grid (desktop has nav pills; mobile has MobileHomeHeader row) ── */}
            <div className="hidden lg:block">
              <CategoryGrid
                onCategoryChange={handleCategoryChange}
                onFilterClick={() => setShowMobileFilters(true)}
              />
            </div>

            {/* ── Mobile Quick Browse Cards ── */}
            <MobileQuickCards
              language={language}
            />

            {/* ── Split-Screen Catalog Section ──────────────────────── */}
            <div
              id="listings-catalog"
              className="max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8 pt-2 sm:pt-12 pb-0"
            >

              <div className="flex flex-col lg:flex-row gap-8">
                {/* Desktop: Always show sidebar | Mobile: Show as modal */}
                <div className="hidden lg:block">
                  <ZoneFilterSidebar
                    activeZone={activeZone}
                    activeCategory={activeCategory}
                    filters={filters}
                    onFilterChange={handleFilterChange}
                    onZoneChange={handleZoneChange}
                    onReset={handleReset}
                  />
                </div>

                {/* Mobile Filter Bottom Sheet */}
                {showMobileFilters && (
                  <MobileFilterBottomSheet
                    activeCategory={activeCategory}
                    activeZone={activeZone}
                    filters={filters}
                    onFilterChange={handleFilterChange}
                    onZoneChange={handleZoneChange}
                    onReset={handleReset}
                    onClose={() => setShowMobileFilters(false)}
                    resultCount={0}
                  />
                )}

                <ZoneCatalogGrid
                  activeCategory={activeCategory}
                  activeZone={activeZone}
                  filters={filters}
                  onClearFilter={(key) => {
                    setFilters((prev) => ({ ...prev, [key]: key === "city" || key === "city_subzone" ? "" : (typeof prev[key] === "boolean" ? false : "") }));
                  }}
                  onClearCityFilter={() => {
                    setFilters(defaultFilters);
                  }}
                />
              </div>
            </div>

            {/* ── Browse by Location Section ──────────────────────── */}
            <BrowseByLocation 
              activeLocation={filters.city}
              onLocationSelect={(locationKey) => {
                if (filters.city === locationKey) {
                  setFilters(defaultFilters);
                } else {
                  setFilters({
                    ...defaultFilters,
                    city: locationKey,
                  });
                }
                setActiveZone("all");
                setActiveCategory("all");
                
                setTimeout(() => {
                  const catalogSection = document.getElementById('listings-catalog');
                  if (catalogSection) {
                    catalogSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
                  }
                }, 100);
              }}
            />

            {/* ── Mala-Agents Recruitment Banner ───────────────────── */}
            <div id="agents">
              <MalaAgentsUnified />
            </div>
          </main>
        )}
      </div>

      {/* ── Global Footer ─────────────────────── */}
      <Footer onNavigate={navigateTo} />

      {/* ── Bottom Navigation (Mobile Only) ──────────────────────── */}
      <BottomNavigation />


      {/* ── Buyer Post Listing Modal ──────────────────────── */}
      {showPostModal && isAuthenticated && (
        <BuyerPostListingModal
          onClose={() => setShowPostModal(false)}
          onCreated={() => {
            setShowPostModal(false);
            // Optionally scroll to listings
            const el = document.getElementById('listings-catalog');
            if (el) el.scrollIntoView({ behavior: 'smooth' });
          }}
        />
      )}
    </div>
  );
};

export default MainSite;
