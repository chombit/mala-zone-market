/**
 * Header.tsx
 * Malazone.com — Luxury Integrated Navigation with Full Dual-Theme Support
 * Dark Mode: bg-slate-950/80  |  Light Mode: bg-white/80 shadow-sm
 * Brand: MALA = #00A86B (malazone-green) | ZONE = dark/light adaptive navy
 * © 2026 Malazone Technologies PLC | Founder: Luwa Tesemma Kakawo
 */

import React, { useState, useRef, useEffect } from "react";
import { Globe, Menu, X, ChevronRight, LogIn, LogOut, User, ChevronDown, Heart, Settings, UserCircle } from "lucide-react";
import { useLanguage } from "@/contexts/ZoneLanguageContext";
import { getNextLanguage, LANGUAGE_OPTIONS, type Language } from "@/i18n";
import { useAuth } from "@/contexts/AuthContext";
import { useFavorites } from "@/contexts/FavoritesContext";
import { useNavigate } from "react-router-dom";
import LogoImg from "../images/Logo.png";
import SignOut from "./SignOut";

interface HeaderProps {
  activeCategory?: string;
  onCategoryChange?: (cat: string) => void;
}

const highlightTicker = (text: string) => {
  const green = '<span class="text-[#00A86B] underline decoration-[#00A86B] decoration-2 underline-offset-4">$&</span>';
  return {
    __html: text
      .replace(/Middlemen!?/gi, green)
      .replace(/ያለምንም ደላላ/gi, green),
  };
};

const Header: React.FC<HeaderProps> = ({ activeCategory, onCategoryChange }) => {
  const { language, toggleLanguage, t } = useLanguage();
  const { user, isAuthenticated, logout } = useAuth();
  const { favorites, setSidebarOpen } = useFavorites();
  const navigate = useNavigate();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [showSignOutModal, setShowSignOutModal] = useState(false);
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const [showMobileFilters, setShowMobileFilters] = useState(false);

  const categories = [
    { key: "nav.cat1", id: "property" },
    { key: "nav.cat2", id: "motors" },
    { key: "nav.cat3", id: "stay" },
    { key: "nav.cat4", id: "ceremony" },
    { key: "nav.cat5", id: "heavy" },
    { key: "nav.cat6", id: "electronics" },
  ];

  const handleNavClick = (id: string) => {
    if (onCategoryChange) {
      onCategoryChange(id);
      const grid = document.getElementById("listings-catalog");
      if (grid) grid.scrollIntoView({ behavior: "smooth" });
    }
    setIsMobileMenuOpen(false);
  };

  return (
    <div className="fixed top-0 left-0 w-full z-[150]">
      {/* ── Ticker / Announcement Bar ──────────────────────────────── */}
      <div className="hidden lg:block w-full bg-[#0B132B] border-b border-emerald-600/30 py-2.5 sm:py-4 px-4 sm:px-6 overflow-hidden">
        <p
          className="text-xs sm:text-[13px] font-bold tracking-widest text-white uppercase whitespace-nowrap animate-marquee text-center"
          dangerouslySetInnerHTML={highlightTicker(t("ticker"))}
        />
      </div>

      {/* ── Main Navigation Bar ───────────────────────────────────── */}
      <header className="w-full bg-white dark:bg-slate-950 border-b border-slate-200/80 dark:border-white/10 shadow-sm">
        {/* Top Row: Hamburger | Logo | Language | Login */}
        <div className="flex items-center justify-between px-4 sm:px-6 py-3">
          {/* LEFT: Hamburger Menu */}
          <button
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors"
            aria-label="Menu"
          >
            {isMobileMenuOpen ? (
              <X className="w-6 h-6 text-slate-700 dark:text-slate-300" />
            ) : (
              <Menu className="w-6 h-6 text-slate-700 dark:text-slate-300" />
            )}
          </button>

          {/* CENTER: MALAZONE Logo */}
          <button
            onClick={() => handleNavClick("all")}
            className="flex items-center gap-0 font-black text-xl tracking-tight hover:opacity-80 transition-opacity"
          >
            <span className="text-[#00A86B]">MALA</span>
            <span className="text-slate-900 dark:text-white">ZONE</span>
          </button>

          {/* RIGHT: Language & Login */}
          <div className="flex items-center gap-2">
            {/* Language Toggle */}
            <button
              onClick={toggleLanguage}
              className="flex items-center gap-1.5 px-3 py-2 rounded-lg border border-slate-200 dark:border-white/10 hover:border-[#00A86B] dark:hover:border-[#00A86B] transition-colors"
            >
              <Globe className="w-5 h-5 text-[#00A86B]" />
              <span className="text-sm font-bold text-slate-700 dark:text-slate-300">
                {LANGUAGE_OPTIONS.find(o => o.value === language)?.labelShort || language}
              </span>
            </button>

            {/* Login/Profile Button */}
            {isAuthenticated && user ? (
              <div className="relative">
                <button
                  onClick={() => setShowProfileMenu(!showProfileMenu)}
                  className="flex items-center gap-1.5 px-3 py-2 rounded-lg border border-slate-200 dark:border-white/10 hover:border-[#00A86B] dark:hover:border-[#00A86B] transition-colors"
                >
                  <User className="w-5 h-5 text-[#00A86B]" />
                  <span className="hidden sm:inline text-sm font-bold text-slate-700 dark:text-slate-300">
                    {user.full_name?.split(' ')[0] || 'User'}
                  </span>
                </button>

                {/* Profile Dropdown */}
                {showProfileMenu && (
                  <>
                    <div className="fixed inset-0 z-[140]" onClick={() => setShowProfileMenu(false)} />
                    <div className="absolute right-0 mt-2 w-48 bg-white dark:bg-slate-800 border border-slate-200 dark:border-white/10 rounded-lg shadow-lg z-[145] overflow-hidden">
                      <button
                        onClick={() => { setSidebarOpen(true); setShowProfileMenu(false); }}
                        className="w-full flex items-center gap-2 px-4 py-2.5 hover:bg-slate-50 dark:hover:bg-slate-700 text-left text-sm font-medium text-slate-700 dark:text-slate-300"
                      >
                        <Heart className="w-4 h-4 text-[#00A86B]" />
                        Favorites
                      </button>
                      <button
                        onClick={() => { navigate('/my-account'); setShowProfileMenu(false); }}
                        className="w-full flex items-center gap-2 px-4 py-2.5 hover:bg-slate-50 dark:hover:bg-slate-700 text-left text-sm font-medium text-slate-700 dark:text-slate-300"
                      >
                        <Settings className="w-4 h-4 text-[#00A86B]" />
                        Settings
                      </button>
                      <div className="border-t border-slate-200 dark:border-white/10" />
                      <button
                        onClick={() => { logout(); setShowProfileMenu(false); }}
                        className="w-full flex items-center gap-2 px-4 py-2.5 hover:bg-red-50 dark:hover:bg-red-900/20 text-left text-sm font-medium text-red-600 dark:text-red-400"
                      >
                        <LogOut className="w-4 h-4" />
                        Logout
                      </button>
                    </div>
                  </>
                )}
              </div>
            ) : (
              <button
                onClick={() => navigate("/signin")}
                className="flex items-center gap-1.5 px-3 py-2 rounded-lg bg-[#00A86B] hover:bg-emerald-600 text-white transition-colors"
              >
                <LogIn className="w-5 h-5" />
                <span className="text-sm font-bold">Login</span>
              </button>
            )}
          </div>
        </div>

        {/* Bottom Row: Search Bar with Filter Button */}
        <div className="px-4 sm:px-6 pb-3">
          <div className="relative flex items-center gap-2">
            <div className="flex-1 relative">
              <input
                type="text"
                placeholder={language === 'amharic' ? 'ቤቶች፣ መሬቶች፣ መኪናዎች ይፈልጉ...' : 'Search houses, land, cars, machinery...'}
                className="w-full pl-4 pr-4 py-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-white/10 rounded-lg text-sm text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-[#00A86B] focus:border-transparent transition-all"
                onChange={(e) => onCategoryChange && handleNavClick('all')}
              />
            </div>
            <button
              onClick={() => setShowMobileFilters(!showMobileFilters)}
              className="p-3 bg-[#00A86B] hover:bg-emerald-600 text-white rounded-lg transition-colors flex-shrink-0"
              aria-label="Filters"
            >
              <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <line x1="4" y1="21" x2="4" y2="14"></line>
                <line x1="4" y1="10" x2="4" y2="3"></line>
                <line x1="12" y1="21" x2="12" y2="12"></line>
                <line x1="12" y1="8" x2="12" y2="3"></line>
                <line x1="20" y1="21" x2="20" y2="16"></line>
                <line x1="20" y1="12" x2="20" y2="3"></line>
                <line x1="1" y1="14" x2="7" y2="14"></line>
                <line x1="9" y1="8" x2="15" y2="8"></line>
                <line x1="17" y1="16" x2="23" y2="16"></line>
              </svg>
            </button>
          </div>
        </div>

        {/* Mobile Menu Dropdown */}
        {isMobileMenuOpen && (
          <>
            <div className="fixed inset-0 bg-black/20 z-[140]" onClick={() => setIsMobileMenuOpen(false)} />
            <div className="absolute top-full left-0 right-0 bg-white dark:bg-slate-950 border-b border-slate-200 dark:border-white/10 shadow-lg z-[145] max-h-[80vh] overflow-y-auto">
              <nav className="py-2">
                <button
                  onClick={() => { handleNavClick("all"); setIsMobileMenuOpen(false); }}
                  className="w-full text-left px-6 py-3 hover:bg-slate-50 dark:hover:bg-slate-800 text-sm font-bold text-slate-700 dark:text-slate-300"
                >
                  {t("nav.home") || "Home"}
                </button>
                {categories.map((cat) => (
                  <button
                    key={cat.id}
                    onClick={() => { handleNavClick(cat.id); setIsMobileMenuOpen(false); }}
                    className="w-full text-left px-6 py-3 hover:bg-slate-50 dark:hover:bg-slate-800 text-sm font-bold text-slate-700 dark:text-slate-300"
                  >
                    {t(cat.key as any)}
                  </button>
                ))}
                <div className="border-t border-slate-200 dark:border-white/10 my-2" />
                <button
                  onClick={() => { navigate("/about"); setIsMobileMenuOpen(false); }}
                  className="w-full text-left px-6 py-3 hover:bg-slate-50 dark:hover:bg-slate-800 text-sm font-bold text-slate-700 dark:text-slate-300"
                >
                  {t("nav.about") || "About"}
                </button>
                <button
                  onClick={() => { navigate("/contact"); setIsMobileMenuOpen(false); }}
                  className="w-full text-left px-6 py-3 hover:bg-slate-50 dark:hover:bg-slate-800 text-sm font-bold text-slate-700 dark:text-slate-300"
                >
                  {t("nav.contact") || "Contact"}
                </button>
                <button
                  onClick={() => { navigate("/gighub"); setIsMobileMenuOpen(false); }}
                  className="w-full text-left px-6 py-3 hover:bg-slate-50 dark:hover:bg-slate-800 text-sm font-bold text-slate-700 dark:text-slate-300"
                >
                  {t("nav.gigHub") || "Gig Hub"}
                </button>
                <button
                  onClick={() => { navigate("/agent-onboard"); setIsMobileMenuOpen(false); }}
                  className="w-full text-left px-6 py-3 hover:bg-slate-50 dark:hover:bg-slate-800 text-sm font-bold text-slate-700 dark:text-slate-300"
                >
                  {t("nav.becomeAgent") || "Become an Agent"}
                </button>
              </nav>
            </div>
          </>
        )}
      </header>

      {/* Sign Out Modal */}
      {showSignOutModal && (
        <SignOut onClose={() => setShowSignOutModal(false)} />
      )}
    </div>
  );
};

export default Header;
