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
import { MalaZoneTestimonials } from './components/MalaZoneTestimonials';
import Footer from './components/Footer';
import AboutPage from './components/pages/AboutPage';
import ContactPage from './components/pages/ContactPage';
import PrivacyPage from './components/pages/PrivacyPage';
import { FavoritesProvider } from './contexts/FavoritesContext';
import { FavoritesSidebar } from './components/FavoritesSidebar';
import PWAInstallPrompt from './components/PWAInstallPrompt';
import BottomNavigation from './components/BottomNavigation';

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

  /* ── Sub-page views ── */

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

        <div className="pt-[140px]">
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

          {/* ── Split-Screen Catalog Section ──────────────────────── */}
          <div
            id="listings-catalog"
            className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8 pt-12 pb-4"
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
      </div>
    </FavoritesProvider>
  );
};

export default MainSite;

