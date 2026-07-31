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
      <header
        className="
           w-full px-4 sm:px-6 py-1.5
           flex items-center justify-between gap-4
           transition-all duration-300
           bg-white
           backdrop-blur-3xl
           border-b border-slate-200/80
           shadow-sm
        "
      >
        {/* ── LEFT: Brand Logo ───────── */}
        <div
          className="flex items-center cursor-pointer group shrink-0"
          onClick={() => handleNavClick("all")}
          role="button"
          aria-label="Malazone Home"
        >
          <img
            src={LogoImg}
            alt="Malazone Logo"
            className="h-12 sm:h-16 w-auto object-contain"
          />
        </div>

        {/* ── CENTER: Nav Category Pills (desktop) ────── */}
        <nav className="hidden xl:flex items-center gap-2 bg-slate-100 rounded-full p-1 border border-slate-200 shrink-0">
          {categories.map((cat) => (
            <button
              key={cat.id}
              onClick={() => handleNavClick(cat.id)}
              className={`
                px-4 py-2 rounded-full text-[11px] font-black
                whitespace-nowrap uppercase tracking-wider
                transition-all duration-200 shadow-sm hover:shadow-md
                ${activeCategory === cat.id
                  ? "bg-[#00A86B] text-black shadow-lg shadow-emerald-500/20"
                  : "text-slate-600 hover:text-[#00A86B] hover:bg-white"}
              `}
            >
              {t(cat.key as any)}
            </button>
          ))}
        </nav>

        {/* ── RIGHT: Controls ─────────────── */}
        <div className="flex items-center gap-3 shrink-0">
          {/* Language Toggle Capsule */}
          <button
            onClick={toggleLanguage}
            className="
              flex items-center gap-2 px-4 py-2 rounded-full
              border transition-all duration-300 group
              border-slate-200
              bg-white
              hover:bg-slate-50
              hover:border-[#00A86B]/40
              shadow-sm h-10
            "
          >
            <Globe className="w-4 h-4 text-[#00A86B] group-hover:rotate-[30deg] transition-transform duration-500" />
            <span className="text-[10px] font-black tracking-widest text-malazone-navy dark:text-white uppercase">
              {LANGUAGE_OPTIONS.find(o => o.value === language)?.labelShort || language}
            </span>
          </button>

          {/* Auth Button */}
          {!isAuthenticated && (
            <button
              onClick={() => navigate("/signin")}
              className="
                hidden sm:flex items-center gap-2 px-4 py-2 rounded-full
                bg-gradient-to-r from-[#00A86B] to-emerald-600
                text-black font-black text-xs
                shadow-md
                hover:scale-[1.02] active:scale-[0.98]
                transition-transform duration-200 h-10
              "
            >
              <LogIn className="w-4 h-4" />
              {t("auth.signin") || "SIGN IN"}
            </button>
          )}

          {/* Favorites Button — logged-in users only */}
          {isAuthenticated && (
            <button
              onClick={() => setSidebarOpen(true)}
              aria-label="View Favorites"
              className="
                relative flex items-center justify-center
                w-12 h-10 rounded-full
                border transition-all duration-300 group
                border-slate-200
                bg-white
                hover:bg-slate-50
                shadow-sm
              "
            >
              <Heart className="w-4 h-4 text-red-500 group-hover:scale-110 transition-transform" />
              {favorites.length > 0 && (
                <span className="absolute -top-1 -right-1 flex items-center justify-center min-w-[18px] h-[18px] px-1 text-[10px] font-black text-white bg-red-500 rounded-full shadow-md border-2 border-white">
                  {favorites.length}
                </span>
              )}
            </button>
          )}

          {/* Profile / User Button */}
          {isAuthenticated && user ? (
            <div className="relative hidden lg:block">
              <button
                onClick={() => setShowProfileMenu(!showProfileMenu)}
                className="
                  flex items-center gap-2.5 pl-1.5 pr-3 py-1.5 rounded-full
                  transition-all duration-300 group
                  border border-transparent hover:border-slate-200 dark:hover:border-white/10
                  bg-white dark:bg-transparent
                  hover:bg-slate-100 dark:hover:bg-white/10
                  shadow-sm h-11
                "
              >
                <div className="w-8 h-8 rounded-full bg-gradient-to-br from-[#00A86B] to-emerald-500 flex items-center justify-center text-white text-xs font-bold shadow-md shadow-emerald-500/20 ring-2 ring-white dark:ring-slate-950">
                  {user.full_name?.charAt(0)?.toUpperCase() || "U"}
                </div>
                <span className="text-sm font-semibold text-slate-700 dark:text-slate-200 max-w-[90px] truncate">
                  {user.full_name?.split(" ")[0] || "User"}
                </span>
                <ChevronDown className={`w-3.5 h-3.5 text-slate-400 transition-transform duration-200 ${showProfileMenu ? "rotate-180" : ""}`} />
              </button>

              {/* Profile Dropdown */}
              {showProfileMenu && (
                <>
                  <div className="fixed inset-0 z-40" onClick={() => setShowProfileMenu(false)} />
                  <div className="absolute right-0 top-full mt-2 w-64 bg-white dark:bg-slate-900 rounded-2xl shadow-2xl shadow-slate-200/50 dark:shadow-black/30 border border-slate-200/80 dark:border-white/10 z-50 overflow-hidden animate-in fade-in slide-in-from-top-2 duration-200">
                    {/* User Info Header */}
                    <div className="p-4 bg-gradient-to-br from-slate-50 to-white dark:from-slate-800 dark:to-slate-900 border-b border-slate-100 dark:border-white/5">
                      <div className="flex items-center gap-3">
                        <div className="w-11 h-11 rounded-full bg-gradient-to-br from-[#00A86B] to-emerald-500 flex items-center justify-center text-white text-base font-bold shadow-lg shadow-emerald-500/20">
                          {user.full_name?.charAt(0)?.toUpperCase() || "U"}
                        </div>
                        <div className="min-w-0">
                          <p className="text-sm font-bold text-slate-900 dark:text-white truncate">{user.full_name}</p>
                          <p className="text-xs text-slate-500 dark:text-slate-400 truncate">{user.email}</p>
                        </div>
                      </div>
                    </div>

                    {/* Menu Items */}
                    <div className="p-1.5">
                      <button
                        onClick={() => {
                          setShowProfileMenu(false);
                          navigate("/account");
                        }}
                        className="flex items-center gap-3 w-full px-3 py-2.5 rounded-xl text-sm font-medium text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-white/5 transition-colors duration-150"
                      >
                        <UserCircle className="w-4 h-4 text-slate-400" />
                        {t("profile.myAccount") || "My Account"}
                      </button>
                      <button
                        onClick={() => {
                          setShowProfileMenu(false);
                          navigate("/settings");
                        }}
                        className="flex items-center gap-3 w-full px-3 py-2.5 rounded-xl text-sm font-medium text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-white/5 transition-colors duration-150"
                      >
                        <Settings className="w-4 h-4 text-slate-400" />
                        {t("profile.settings") || "Settings"}
                      </button>
                    </div>

                    {/* Divider */}
                    <div className="mx-3 border-t border-slate-100 dark:border-white/5" />

                    {/* Logout */}
                    <div className="p-1.5">
                      <button
                        onClick={() => {
                          setShowProfileMenu(false);
                          setShowSignOutModal(true);
                        }}
                        className="flex items-center gap-3 w-full px-3 py-2.5 rounded-xl text-sm font-medium text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/15 transition-colors duration-150"
                      >
                        <LogOut className="w-4 h-4" />
                        {t("auth.signout") || "Sign Out"}
                      </button>
                    </div>
                  </div>
                </>
              )}
            </div>
          ) : null}

          {/* Mobile Menu Icon */}
          <button
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            aria-label={isMobileMenuOpen ? "Close mobile menu" : "Open mobile menu"}
            className="
              xl:hidden p-2.5 rounded-xl
              border border-transparent
              hover:border-slate-200
              hover:bg-slate-100
              text-slate-700
              transition-all duration-200
            "
          >
            {isMobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </header>

      {/* ── Mobile Navigation Overlay ─────────────────────────────── */}
      {isMobileMenuOpen && (
        <div className="fixed inset-0 top-[110px] z-[60] xl:hidden">
          {/* Backdrop */}
          <div
            className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm"
            onClick={() => setIsMobileMenuOpen(false)}
          />

          {/* Menu Panel */}
          <nav className="absolute top-0 left-0 right-0 bg-white dark:bg-slate-950 border-b border-slate-200 dark:border-white/10 shadow-2xl animate-in slide-in-from-top duration-300">
            <div className="flex flex-col p-4 gap-2">
              {categories.map((cat) => (
                <button
                  key={cat.id}
                  onClick={() => handleNavClick(cat.id)}
                  className={`
                    flex items-center justify-between
                    w-full px-5 py-4 rounded-2xl
                    text-sm font-bold tracking-wide uppercase
                    transition-all duration-200
                    ${activeCategory === cat.id
                      ? "bg-[#00A86B] text-black"
                      : "text-slate-700 dark:text-slate-200 bg-slate-50 dark:bg-white/5 hover:bg-emerald-50 dark:hover:bg-emerald-500/10 hover:text-[#00A86B] dark:hover:text-emerald-400"}
                  `}
                >
                  {t(cat.key as any)}
                  <ChevronRight className={`w-4 h-4 ${activeCategory === cat.id ? "text-black" : "opacity-40"}`} />
                </button>
              ))}

              <div className="h-px bg-slate-100 dark:bg-white/5 my-2" />

              {/* Mobile Auth Button */}
              {!isAuthenticated && (
                <button
                  onClick={() => {
                    setIsMobileMenuOpen(false);
                    navigate("/signin");
                  }}
                  className="
                    flex items-center justify-center gap-3
                    w-full py-4 rounded-2xl
                    bg-gradient-to-r from-[#00A86B] to-emerald-600
                    text-black font-black text-sm uppercase tracking-widest
                    shadow-lg shadow-emerald-500/20
                  "
                >
                  <LogIn className="w-5 h-5" />
                  {t("auth.signin") || "SIGN IN"}
                </button>
              )}

              <div className="h-px bg-slate-100 dark:bg-white/5 my-2" />

              {/* Mobile Profile (signed-in users) */}
              {isAuthenticated && user ? (
                <>
                  <button
                    onClick={() => setShowProfileMenu(!showProfileMenu)}
                    className="flex items-center gap-3 w-full px-5 py-4 rounded-2xl bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 hover:bg-slate-100 dark:hover:bg-white/10 transition-colors"
                  >
                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[#00A86B] to-emerald-500 flex items-center justify-center text-white text-sm font-bold shadow-md shadow-emerald-500/20 shrink-0">
                      {user.full_name?.charAt(0)?.toUpperCase() || "U"}
                    </div>
                    <div className="min-w-0 text-left flex-1">
                      <p className="text-sm font-bold text-slate-900 dark:text-white truncate">{user.full_name}</p>
                      <p className="text-xs text-slate-500 dark:text-slate-400 truncate">{user.email}</p>
                    </div>
                    <ChevronDown className={`w-4 h-4 text-slate-400 transition-transform duration-200 ${showProfileMenu ? "rotate-180" : ""}`} />
                  </button>

                  {showProfileMenu && (
                    <div className="mx-2 mt-1 p-1.5 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-white/10 shadow-lg">
                      <button
                        onClick={() => {
                          setShowProfileMenu(false);
                          setIsMobileMenuOpen(false);
                          navigate("/account");
                        }}
                        className="flex items-center gap-3 w-full px-4 py-3 rounded-xl text-sm font-medium text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-white/5 transition-colors"
                      >
                        <UserCircle className="w-4 h-4 text-slate-400" />
                        {t("profile.myAccount") || "My Account"}
                      </button>
                      <button
                        onClick={() => {
                          setShowProfileMenu(false);
                          setIsMobileMenuOpen(false);
                          navigate("/settings");
                        }}
                        className="flex items-center gap-3 w-full px-4 py-3 rounded-xl text-sm font-medium text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-white/5 transition-colors"
                      >
                        <Settings className="w-4 h-4 text-slate-400" />
                        {t("profile.settings") || "Settings"}
                      </button>
                      <div className="mx-2 my-1 border-t border-slate-100 dark:border-white/5" />
                      <button
                        onClick={() => {
                          setShowProfileMenu(false);
                          setIsMobileMenuOpen(false);
                          setShowSignOutModal(true);
                        }}
                        className="flex items-center gap-3 w-full px-4 py-3 rounded-xl text-sm font-medium text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/15 transition-colors"
                      >
                        <LogOut className="w-4 h-4" />
                        {t("auth.signout") || "Sign Out"}
                      </button>
                    </div>
                  )}
                </>
              ) : null}
            </div>
          </nav>
        </div>
      )}

      {/* Sign Out Modal */}
      {showSignOutModal && (
        <SignOut onClose={() => setShowSignOutModal(false)} />
      )}
    </div>
  );
};

export default Header;
