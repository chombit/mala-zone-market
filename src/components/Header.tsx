/**
 * Header.tsx
 * Malazone.com — Luxury Integrated Navigation with Full Dual-Theme Support
 * Dark Mode: bg-slate-950/80  |  Light Mode: bg-white/80 shadow-sm
 * Brand: MALA = #00A86B (malazone-green) | ZONE = dark/light adaptive navy
 * © 2026 Malazone Technologies PLC | Founder: Luwa Tesemma Kakawo
 */

import React, { useState, useEffect } from "react";
import { Globe, Menu, Sun, Moon, X, ChevronRight, Heart } from "lucide-react";
import { useLanguage } from "@/contexts/ZoneLanguageContext";
import { useTheme } from "@/contexts/ThemeContext";
import LogoImg from "../images/Logo.png";
import { useFavorites } from "@/contexts/FavoritesContext";

interface HeaderProps {
  activeCategory?: string;
  onCategoryChange?: (cat: string) => void;
}

// ─── Promo Ticker ─────────────────────────────────────────────────────────────
interface PromoText {
  en_value: string;
  am_value: string;
}

const PROMO_PREFIX = "promo_ticker_";

const usePromoTicker = () => {
  const [promos, setPromos] = useState<PromoText[]>([]);

  useEffect(() => {
    fetch("/api/admin/translations")
      .then((r) => r.json())
      .then((data) => {
        if (data.success) {
          const items: PromoText[] = data.data
            .filter((t: any) => t.text_key.startsWith(PROMO_PREFIX))
            .sort((a: any, b: any) => {
              const na = parseInt(a.text_key.replace(PROMO_PREFIX, ""), 10);
              const nb = parseInt(b.text_key.replace(PROMO_PREFIX, ""), 10);
              return na - nb;
            });
          if (items.length > 0) setPromos(items);
        }
      })
      .catch(() => {});
  }, []);

  return promos;
};

const highlightTicker = (text: string) => {
  const green = '<span class="text-[#00A86B] underline decoration-[#00A86B] decoration-2 underline-offset-4">$&</span>';
  return {
    __html: text
      .replace(/Middlemen!?/gi, green)
      .replace(/ያለምንም ደላላ/gi, green),
  };
};

const SlidingTicker: React.FC<{ language: string; fallbackText: string }> = ({
  language,
  fallbackText,
}) => {
  const promos = usePromoTicker();
  const [current, setCurrent] = useState(0);
  const [visible, setVisible] = useState(true);

  // If we have real promos, cycle through them
  useEffect(() => {
    if (promos.length <= 1) return;
    const timer = setInterval(() => {
      setVisible(false);
      setTimeout(() => {
        setCurrent((c) => (c + 1) % promos.length);
        setVisible(true);
      }, 450);
    }, 4000);
    return () => clearInterval(timer);
  }, [promos.length]);

  const displayText =
    promos.length > 0
      ? language === "en"
        ? promos[current]?.en_value || fallbackText
        : promos[current]?.am_value || fallbackText
      : fallbackText;

  return (
    <div className="relative overflow-hidden h-[42px] flex items-center justify-center px-6">
      <p
        dangerouslySetInnerHTML={highlightTicker(displayText)}
        style={{
          transition: "opacity 0.4s ease, transform 0.4s ease",
          opacity: visible ? 1 : 0,
          transform: visible ? "translateY(0)" : "translateY(-8px)",
        }}
        className="text-xs sm:text-[13px] font-bold tracking-widest text-white uppercase whitespace-nowrap text-center"
      />
      {/* Dot indicators (only if multiple promos) */}
      {promos.length > 1 && (
        <div className="absolute bottom-1 left-1/2 -translate-x-1/2 flex gap-1">
          {promos.map((_, i) => (
            <span
              key={i}
              className="rounded-full transition-all duration-300"
              style={{
                width: i === current ? "12px" : "4px",
                height: "3px",
                backgroundColor: i === current ? "#34d399" : "rgba(255,255,255,0.25)",
              }}
            />
          ))}
        </div>
      )}
    </div>
  );
};

const Header: React.FC<HeaderProps> = ({ activeCategory, onCategoryChange }) => {
  const { language, toggleLanguage, t } = useLanguage();
  const { isDark, toggleTheme } = useTheme();
  const { favorites, setSidebarOpen } = useFavorites();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

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
      {/* ── Sliding Promo Ticker ───────────────────────────────────────── */}
      <div className="w-full bg-[#0B132B] border-b border-emerald-600/30 overflow-hidden">
        <SlidingTicker language={language} fallbackText={t("ticker")} />
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
        <nav className="hidden xl:flex items-center gap-2 bg-slate-100 rounded-full p-1.5 border border-slate-200 shrink min-w-0">
          {categories.map((cat) => (
            <button
              key={cat.id}
              onClick={() => handleNavClick(cat.id)}
              className={`
                px-5 py-2.5 rounded-full text-xs font-bold
                whitespace-nowrap uppercase tracking-wider
                transition-all duration-200 shadow-sm hover:shadow-md
                ${activeCategory === cat.id
                  ? "bg-[#00A86B] text-malazone-navy shadow-lg shadow-emerald-500/20"
                  : "text-malazone-navy hover:text-[#00A86B] hover:bg-white"}
              `}
            >
              {t(cat.key as any)}
            </button>
          ))}
        </nav>

        {/* ── RIGHT: Controls ─────────────── */}
        <div className="flex items-center gap-3 shrink-0">

          {/* Favorites Button */}
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
            <Heart className="w-4 h-4 text-rose-500 group-hover:scale-110 transition-transform" />
            {favorites.length > 0 && (
              <span className="absolute -top-1.5 -right-1.5 flex items-center justify-center w-4 h-4 text-[9px] font-black text-white bg-rose-500 rounded-full shadow-sm animate-in zoom-in duration-300">
                {favorites.length}
              </span>
            )}
          </button>

          {/* Theme Toggle Capsule */}
          <button
            onClick={toggleTheme}
            aria-label={isDark ? "Switch to Light Mode" : "Switch to Dark Mode"}
            title={isDark ? "Light Mode" : "Dark Mode"}
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
            {isDark ? (
              <Sun className="w-4 h-4 text-amber-400 group-hover:scale-110 transition-transform" />
            ) : (
              <Moon className="w-4 h-4 text-malazone-navy group-hover:scale-110 transition-transform" />
            )}
          </button>

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
            <span className="text-[10px] font-black tracking-widest text-malazone-navy uppercase">
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
              text-malazone-navy font-black text-xs px-5 py-2.5
              rounded-xl shadow-md
              hover:scale-[1.02] active:scale-[0.98]
              transition-transform duration-200
            "
          >
            {t("nav.agentBtn")}
          </button>

          {/* Mobile Menu Icon */}
          <button
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            aria-label={isMobileMenuOpen ? "Close mobile menu" : "Open mobile menu"}
            className="
              xl:hidden p-2.5 rounded-xl
              border border-transparent
              hover:border-slate-200
              hover:bg-slate-100
              text-malazone-navy
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
          <nav className="absolute top-0 left-0 right-0 bg-white border-b border-slate-200 shadow-2xl animate-in slide-in-from-top duration-300">
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
                      ? "bg-[#00A86B] text-malazone-navy"
                      : "text-malazone-navy bg-slate-50 hover:bg-slate-100 hover:text-[#00A86B]"}
                  `}
                >
                  {t(cat.key as any)}
                  <ChevronRight className={`w-4 h-4 ${activeCategory === cat.id ? "text-malazone-navy" : "opacity-40"}`} />
                </button>
              ))}

              <div className="h-px bg-slate-100 my-2" />

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
                  text-malazone-navy font-black text-sm uppercase tracking-widest
                  shadow-lg shadow-emerald-500/20
                "
              >
                {t("nav.agentBtn")}
              </button>
            </div>
          </nav>
        </div>
      )}
    </div>
  );
};

export default Header;
