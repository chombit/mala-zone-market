/**
 * MainSite.tsx
 * Malazone.com — Client-Facing Marketplace Entry Point
 * Dual-theme root wrapper: bg-slate-50 (light) | bg-slate-950 (dark)
 * © 2026 Malazone Technologies PLC
 */

import React, { useState } from 'react';
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
import ChatPanel from './components/ChatPanel';
import BuyerPostListingModal from './components/BuyerPostListingModal';
import { useAuth } from '@/contexts/AuthContext';
import MobileFilterBottomSheet from './components/MobileFilterBottomSheet';

import GigHubPage from './components/pages/GigHubPage';
import AgentOnboardPage from './components/pages/AgentOnboardPage';
import MobileHomeHeader from './components/MobileHomeHeader';

import { MalazoneEnterpriseFaq } from './components/MalazoneEnterpriseFaq';
import { useLanguage } from '@/contexts/ZoneLanguageContext';

export type PageView = "home" | "about" | "contact" | "privacy" | "gighub" | "agent-onboard" | "faq";

const defaultFilters: FilterState = {
  search: "",
  region: "",
  city: "",
  intent: "buy",
  priceMin: "",
  priceMax: "",
  vehicleType: "",
  brand: "",
  fuelType: "",
  condition: "",
  propertyType: "",
  bedrooms: "",
  bathrooms: "",
  area: "",
  titleDeed: "",
  machineryType: "",
  stayType: "",
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

const MainSite: React.FC = () => {
  const [activeCategory, setActiveCategory] = useState<string>("all");
  const [activeZone, setActiveZone] = useState<ActiveZone>("all");
  const [filters, setFilters] = useState<FilterState>(defaultFilters);
  const [currentPage, setCurrentPage] = useState<PageView>("home");
  const [showMobileFilters, setShowMobileFilters] = useState(false);
  const [showPostModal, setShowPostModal] = useState(false);
  const { language } = useLanguage();
  const { isAuthenticated } = useAuth();

  /* Sync header category pills → activeZone & filters for the catalog grid */
  const handleCategoryChange = (cat: string) => {
    setActiveCategory(cat);
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

    const zoneMap: Record<string, ActiveZone> = {
      all: "all",
      property: "house",
      motors: "car",
      stay: "ceremony",
      rooms: "ceremony",
      ceremony: "ceremony",
      heavy: "machinery",
      machinery: "machinery",
      electronics: "electronics",
    };
    setActiveZone(zoneMap[cat] ?? "all");
  };

  const handleFilterChange = (key: keyof FilterState, value: string) => {
    setFilters((prev) => ({ ...prev, [key]: value }));
  };

  const handleReset = () => {
    setFilters(defaultFilters);
  };

  const navigateTo = (page: PageView) => {
    setCurrentPage(page);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

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
                    filters={filters}
                    onFilterChange={handleFilterChange}
                    onZoneChange={(zone) => setActiveZone(zone)}
                    onReset={handleReset}
                  />
                </div>

                {/* Mobile Filter Bottom Sheet */}
                {showMobileFilters && (
                  <MobileFilterBottomSheet
                    activeZone={activeZone}
                    filters={filters}
                    onFilterChange={handleFilterChange}
                    onZoneChange={(zone) => setActiveZone(zone)}
                    onReset={handleReset}
                    onClose={() => setShowMobileFilters(false)}
                    resultCount={0}
                  />
                )}

                <ZoneCatalogGrid
                  activeZone={activeZone}
                  filters={filters}
                />
              </div>
            </div>

            {/* ── Browse by Location Section ──────────────────────── */}
            <BrowseByLocation 
              onLocationSelect={(locationKey) => {
                // Reset all filters except city
                setFilters({
                  ...defaultFilters,
                  city: locationKey,
                });
                setActiveZone("all");
                setActiveCategory("all");
                
                // Scroll to catalog
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
