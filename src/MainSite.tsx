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
import TrendingListings from './components/TrendingListings';
import { MalaZoneTestimonials } from './components/MalaZoneTestimonials';
import Footer from './components/Footer';
import AboutPage from './components/pages/AboutPage';
import ContactPage from './components/pages/ContactPage';
import PrivacyPage from './components/pages/PrivacyPage';
import { FavoritesProvider } from './contexts/FavoritesContext';
import { FavoritesSidebar } from './components/FavoritesSidebar';
import PWAInstallPrompt from './components/PWAInstallPrompt';
import BottomNavigation from './components/BottomNavigation';
import ChatPanel from './components/ChatPanel';
import { SlidersHorizontal, X } from 'lucide-react';

import GigHubPage from './components/pages/GigHubPage';
import AgentOnboardPage from './components/pages/AgentOnboardPage';
import PayoutsPage from './components/pages/PayoutsPage';

import { MalazoneEnterpriseFaq } from './components/MalazoneEnterpriseFaq';
import { useLanguage } from '@/contexts/ZoneLanguageContext';

export type PageView = "home" | "about" | "contact" | "privacy" | "gighub" | "agent-onboard" | "payouts" | "faq";

const defaultFilters: FilterState = {
  search: "",
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
  const [currentPage, setCurrentPage] = useState<PageView>("home");
  const [showMobileFilters, setShowMobileFilters] = useState(false);
  const { language } = useLanguage();

  /* Sync header category pills → activeZone for the catalog grid */
  const handleCategoryChange = (cat: string) => {
    setActiveCategory(cat);
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
    <FavoritesProvider>
      <div
        className="
          min-h-screen
          bg-slate-50 dark:bg-slate-950
          text-malazone-navy dark:text-slate-400
          selection:bg-emerald-500/30
          selection:text-emerald-900 dark:selection:text-emerald-200
          transition-colors duration-300
          pb-20 md:pb-0
        "
      >
        <FavoritesSidebar />
        <PWAInstallPrompt />
        {/* Fixed navigation header */}
        <Header
          activeCategory={activeCategory}
          onCategoryChange={handleCategoryChange}
        />

        <div className="pt-[110px] sm:pt-[140px]">
          {currentPage === "about" && <AboutPage onBack={() => navigateTo("home")} />}
          {currentPage === "contact" && <ContactPage onBack={() => navigateTo("home")} />}
          {currentPage === "privacy" && <PrivacyPage onBack={() => navigateTo("home")} />}
          {currentPage === "gighub" && <GigHubPage onBack={() => navigateTo("home")} />}
          {currentPage === "agent-onboard" && <AgentOnboardPage onBack={() => navigateTo("home")} />}
          {currentPage === "payouts" && <PayoutsPage onBack={() => navigateTo("home")} />}
          {currentPage === "faq" && <MalazoneEnterpriseFaq onBackToMain={() => navigateTo("home")} currentGlobalLang={language === 'amharic' ? 'am' : 'en'} />}

          {currentPage === "home" && (
            <main>
          {/* Full-bleed hero carousel + search */}
          <Hero
            onCategoryChange={handleCategoryChange}
            onFilterChange={(key, value) => handleFilterChange(key as keyof FilterState, value)}
          />

          {/* ── Mobile Trending Cards ──────────────────────── */}
          <TrendingListings />

          {/* ── Split-Screen Catalog Section ──────────────────────── */}
          <div
            id="listings-catalog"
            className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8 pt-6 sm:pt-12 pb-4"
          >
            {/* Mobile Filter Toggle Button */}
            <button
              onClick={() => setShowMobileFilters(true)}
              className="lg:hidden mb-4 flex items-center justify-center gap-2 w-full py-3 rounded-xl bg-[#00A86B] text-white font-bold text-sm shadow-lg shadow-emerald-500/20 hover:scale-[1.02] active:scale-[0.98] transition-all"
            >
              <SlidersHorizontal className="w-5 h-5" />
              Filter Listings
            </button>

            <div className="flex flex-col lg:flex-row gap-8">
              {/* Desktop: Always show sidebar | Mobile: Show as modal */}
              <div className="hidden lg:block">
                <ZoneFilterSidebar
                  activeZone={activeZone}
                  filters={filters}
                  onFilterChange={handleFilterChange}
                  onReset={handleReset}
                />
              </div>

              {/* Mobile Filter Modal */}
              {showMobileFilters && (
                <>
                  <div
                    className="fixed inset-0 bg-black/50 z-50 lg:hidden"
                    onClick={() => setShowMobileFilters(false)}
                  />
                  <div className="fixed inset-y-0 left-0 right-0 z-50 lg:hidden overflow-y-auto">
                    <div className="bg-white dark:bg-slate-900 p-4 min-h-screen">
                      <div className="flex items-center justify-between mb-4">
                        <h2 className="text-lg font-bold text-slate-900 dark:text-white">Filters</h2>
                        <button
                          onClick={() => setShowMobileFilters(false)}
                          className="p-2 rounded-full bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors"
                        >
                          <X className="w-5 h-5 text-slate-600 dark:text-slate-300" />
                        </button>
                      </div>
                      <ZoneFilterSidebar
                        activeZone={activeZone}
                        filters={filters}
                        onFilterChange={handleFilterChange}
                        onReset={handleReset}
                      />
                    </div>
                  </div>
                </>
              )}

              <ZoneCatalogGrid
                activeZone={activeZone}
                filters={filters}
              />
            </div>
          </div>

          {/* ── Mala-Agents Recruitment Banner ───────────────────── */}
          <div id="agents">
            <MalaAgentsUnified />
          </div>

          {/* ── Testimonials Section ──────────────────────────────── */}
          <div id="testimonials">
            <MalaZoneTestimonials />
          </div>
        </main>
        )}
        </div>

        {/* ── Global Footer ─────────────────────── */}
        <Footer onNavigate={navigateTo} />
        
        {/* ── Bottom Navigation (Mobile Only) ──────────────────────── */}
        <BottomNavigation 
          activeCategory={activeCategory} 
          onCategoryChange={handleCategoryChange} 
        />
        <ChatPanel />
      </div>
    </FavoritesProvider>
  );
};

export default MainSite;
