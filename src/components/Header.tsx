/**
 * Header.tsx
 * Malazone.com — Luxury Integrated Navigation with Full Dual-Theme Support
 * Dark Mode: bg-slate-950/80  |  Light Mode: bg-white/80 shadow-sm
 * Brand: MALA = #00A86B (malazone-green) | ZONE = dark/light adaptive navy
 * © 2026 Malazone Technologies PLC | Founder: Luwa Tesemma Kakawo
 */

import React, { useState, useEffect, useRef } from "react";
import { Globe, Menu, Sun, Moon, X, ChevronRight } from "lucide-react";
import { useLanguage } from "@/contexts/ZoneLanguageContext";
import { useTheme } from "@/contexts/ThemeContext";
import LogoImg from "@/images/Logo.png";

const navDictionary = {
  en: {
    property: "Property Zone",
    motors: "Motors & EV Zone",
    stay: "Stay & Hall Zone",
    ceremony: "Ceremony Zone",
    heavy: "Heavy Machinery Zone",
    hubBtn: "Mala-Agent Zone",
    ticker: "✨ MALAZONE.COM • NO BROKER, NO COMMISSION • HAWASSA SIDAMA MARKETPLACE"
  },
  amharic: {
    property: "የቤትና ይዞታ ዞን",
    motors: "የመኪና ዞን",
    stay: "የአዳራሽ ዞን",
    ceremony: "የክብረ-በዓላት ዞን",
    heavy: "የከባድ ማሽነሪዎች ዞን",
    hubBtn: "የወኪል ወጣቶች ዞን",
    ticker: "✨ MALAZONE.COM • ያለ ደላላ ቀጥታ ቢዝነስ • HAWASSA SIDAMA MARKETPLACE"
  }
};

interface HeaderProps {
  onCategoryChange?: (cat: string) => void;
}

const Header: React.FC<HeaderProps> = ({ onCategoryChange }) => {
  const { language, toggleLanguage } = useLanguage();
  const { isDark, toggleTheme } = useTheme();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  // Pick the current language dictionary
  const t = navDictionary[language as "en" | "amharic"] || navDictionary.en;

  const categories = [
    { key: "property", id: "property" },
    { key: "motors", id: "motors" },
    { key: "stay", id: "stay" },
    { key: "ceremony", id: "ceremony" },
    { key: "heavy", id: "heavy" },
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
      <div className="w-full bg-[#00A86B] border-b border-emerald-600/30 py-2 px-6 overflow-hidden">
        <p className="text-[10px] sm:text-[11px] font-black tracking-[0.15em] text-white uppercase whitespace-nowrap animate-marquee text-center">
          {t.ticker}
        </p>
      </div>

      {/* ── Main Navigation Bar ───────────────────────────────────── */}
      <header
        className="
           w-full px-4 sm:px-6 py-1.5
           flex items-center justify-between gap-4
           transition-all duration-300
           bg-white dark:bg-slate-950
           backdrop-blur-3xl
           border-b border-slate-200/80 dark:border-white/5
           shadow-sm dark:shadow-none
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
            className="h-12 sm:h-16 w-auto object-contain dark:brightness-110"
          />
        </div>

        {/* ── CENTER: Nav Category Pills (desktop) ────── */}
        <nav className="hidden xl:flex items-center gap-2 bg-slate-100 dark:bg-white/5 rounded-full p-1.5 border border-slate-200 dark:border-white/10 shrink min-w-0">
          {categories.map((cat) => (
            <button
              key={cat.id}
              onClick={() => handleNavClick(cat.id)}
              className="
                px-5 py-2.5 rounded-full text-xs font-bold
                whitespace-nowrap uppercase tracking-wider
                text-slate-600 dark:text-slate-300
                hover:text-[#00A86B] dark:hover:text-white
                hover:bg-white dark:hover:bg-white/10
                transition-all duration-200 shadow-sm hover:shadow-md dark:shadow-none
              "
            >
              {t[cat.key as keyof typeof t]}
            </button>
          ))}
        </nav>

        {/* ── RIGHT: Controls ─────────────── */}
        <div className="flex items-center gap-3 shrink-0">

          {/* Theme Toggle Capsule */}
          <button
            onClick={toggleTheme}
            aria-label={isDark ? "Switch to Light Mode" : "Switch to Dark Mode"}
            title={isDark ? "Light Mode" : "Dark Mode"}
            className="
              relative flex items-center justify-center
              w-12 h-10 rounded-full
              border transition-all duration-300 group
              border-slate-200 dark:border-white/10
              bg-white dark:bg-white/5
              hover:bg-slate-50 dark:hover:bg-white/10
              shadow-sm dark:shadow-none
            "
          >
            {isDark ? (
              <Sun className="w-4 h-4 text-amber-400 group-hover:scale-110 transition-transform" />
            ) : (
              <Moon className="w-4 h-4 text-slate-500 group-hover:scale-110 transition-transform" />
            )}
          </button>

          {/* Language Toggle Capsule */}
          <button
            onClick={toggleLanguage}
            className="
              flex items-center gap-2 px-4 py-2 rounded-full
              border transition-all duration-300 group
              border-slate-200 dark:border-white/10
              bg-white dark:bg-white/5
              hover:bg-slate-50 dark:hover:bg-white/10
              hover:border-[#00A86B]/40 dark:hover:border-[#00A86B]/30
              shadow-sm dark:shadow-none h-10
            "
          >
            <Globe className="w-4 h-4 text-[#00A86B] group-hover:rotate-[30deg] transition-transform duration-500" />
            <span className="text-[10px] font-black tracking-widest text-slate-700 dark:text-white uppercase">
              {language === "en" ? "አማርኛ" : "EN"}
            </span>
          </button>

          {/* Corporate CTA Button */}
          <button
            onClick={() => {
              const el = document.getElementById("agents");
              if (el) el.scrollIntoView({ behavior: "smooth" });
            }}
            className="
              hidden sm:flex items-center justify-center
              bg-gradient-to-r from-[#00A86B] to-emerald-600
              text-black font-black text-xs px-5 py-2.5
              rounded-xl shadow-md
              hover:scale-[1.02] active:scale-[0.98]
              transition-transform duration-200
            "
          >
            {t.hubBtn}
          </button>

          {/* Mobile Menu Icon */}
          <button
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            aria-label={isMobileMenuOpen ? "Close mobile menu" : "Open mobile menu"}
            className="
              xl:hidden p-2.5 rounded-xl
              border border-transparent
              hover:border-slate-200 dark:hover:border-white/10
              hover:bg-slate-100 dark:hover:bg-white/5
              text-slate-700 dark:text-white
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
                  className="
                    flex items-center justify-between
                    w-full px-5 py-4 rounded-2xl
                    text-sm font-bold tracking-wide uppercase
                    text-slate-700 dark:text-slate-200
                    bg-slate-50 dark:bg-white/5
                    hover:bg-emerald-50 dark:hover:bg-emerald-500/10
                    hover:text-[#00A86B] dark:hover:text-emerald-400
                    transition-all duration-200
                  "
                >
                  {t[cat.key as keyof typeof t]}
                  <ChevronRight className="w-4 h-4 opacity-40" />
                </button>
              ))}

              <div className="h-px bg-slate-100 dark:bg-white/5 my-2" />

              {/* Mobile Agent Hub CTA */}
              <button
                onClick={() => {
                  const el = document.getElementById("agents");
                  if (el) el.scrollIntoView({ behavior: "smooth" });
                  setIsMobileMenuOpen(false);
                }}
                className="
                  flex items-center justify-center gap-3
                  w-full py-4 rounded-2xl
                  bg-gradient-to-r from-[#00A86B] to-emerald-600
                  text-black font-black text-sm uppercase tracking-widest
                  shadow-lg shadow-emerald-500/20
                "
              >
                {t.hubBtn}
              </button>
            </div>
          </nav>
        </div>
      )}
    </div>
  );
};

export default Header;
