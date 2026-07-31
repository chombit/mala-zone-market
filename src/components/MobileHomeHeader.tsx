/**
 * MobileHomeHeader.tsx
 * Malazone.com — Mobile Home Screen Top Section
 *
 * Structure (top → down):
 *   1. Ticker / announcement bar  — same navy bg as desktop (#0B132B)
 *   2. Main nav bar               — bg-white shadow-sm (matches desktop Header)
 *      LEFT:  hamburger ☰
 *      CENTER: MALA(green) ZONE(navy) brand text
 *      RIGHT:  language toggle | bell | user avatar
 *   3. Search bar                 — white card with filter icon, on slate-50 bg
 *   4. Hero carousel              — real slides from API / fallback
 *   5. Category icon row          — 6 icons on site background
 *   6. Hamburger slide-down menu  — categories + auth links
 *
 * © 2026 Malazone Technologies PLC
 */

import React, { useState, useEffect, useCallback, useRef } from "react";
import { useNavigate } from "react-router-dom";
import {
  Menu,
  X,
  Globe,
  Bell,
  UserCircle2,
  Search,
  SlidersHorizontal,
  CheckCircle2,
  ChevronRight,
  Home,
  KeyRound,
  MapPin,
  Car,
  Tractor,
  LayoutGrid,
  ArrowRight,
  LogIn,
  LogOut,
  Settings,
  UserCircle,
  Heart,
  ChevronDown,
  Smartphone,
  Bed,
  PartyPopper,
} from "lucide-react";
import { useLanguage } from "@/contexts/ZoneLanguageContext";
import { LANGUAGE_OPTIONS } from "@/i18n";
import { useAuth } from "@/contexts/AuthContext";
import { useFavorites } from "@/contexts/FavoritesContext";
import SignOut from "./SignOut";

/* ── Types ─────────────────────────────────────────────── */
interface Slide {
  id: number;
  image_url: string;
  category_id: string;
  label_en: string;
  label_am: string;
  price?: number;
  title_en?: string;
  title_am?: string;
}

interface MobileHomeHeaderProps {
  onCategoryChange: (cat: string) => void;
  onFilterClick: () => void;
  onSearchChange: (val: string) => void;
  searchValue: string;
  activeCategory?: string;
}

/* ── Ticker highlight helper ─────────────────────────── */
const highlightTicker = (text: string) => ({
  __html: text
    .replace(
      /Middlemen!?/gi,
      '<span class="text-[#00A86B] underline decoration-[#00A86B] decoration-2 underline-offset-4">$&</span>'
    )
    .replace(
      /ያለምንም ደላላ/gi,
      '<span class="text-[#00A86B] underline decoration-[#00A86B] decoration-2 underline-offset-4">$&</span>'
    ),
});

/* ── Category row config ─────────────────────────────── */
const CATS = [
  { id: "intent_buy",  labelKey: "cat.buy",      icon: Home,       bg: "#EFF6FF", color: "#1D4ED8" },
  { id: "intent_rent", labelKey: "cat.rent",     icon: KeyRound,   bg: "#ECFDF5", color: "#00A86B" },
  { id: "property",    labelKey: "cat.land",     icon: MapPin,     bg: "#ECFDF5", color: "#059669" },
  { id: "motors",      labelKey: "cat.cars",     icon: Car,        bg: "#EFF6FF", color: "#2563EB" },
  { id: "heavy",       labelKey: "cat.machinery",icon: Tractor,    bg: "#FFF7ED", color: "#EA580C" },
  { id: "more",        labelKey: "cat.more",     icon: LayoutGrid, bg: "#F5F3FF", color: "#7C3AED", isFilter: true },
];

/* ── Nav categories (hamburger menu) ─────────────────── */
const NAV_CATS = [
  { key: "nav.cat1", id: "property" },
  { key: "nav.cat2", id: "motors" },
  { key: "nav.cat3", id: "stay" },
  { key: "nav.cat4", id: "ceremony" },
  { key: "nav.cat5", id: "heavy" },
  { key: "nav.cat6", id: "electronics" },
];

/* ── More categories modal ─────────────────── */
const MORE_CATS = [
  { key: "nav.cat1", id: "property",    icon: Home,       bg: "#ECFDF5", color: "#059669" },
  { key: "nav.cat2", id: "motors",      icon: Car,        bg: "#EFF6FF", color: "#2563EB" },
  { key: "nav.cat3", id: "stay",        icon: Bed,        bg: "#FCE7F3", color: "#BE185D" },
  { key: "nav.cat4", id: "ceremony",    icon: PartyPopper,bg: "#FEF3C7", color: "#D97706" },
  { key: "nav.cat5", id: "heavy",       icon: Tractor,    bg: "#FFF7ED", color: "#EA580C" },
  { key: "nav.cat6", id: "electronics", icon: Smartphone, bg: "#DBEAFE", color: "#1E40AF" },
];

/* ── Price formatter ─────────────────────────────────── */
function fmtPrice(n: number) {
  if (!n) return null;
  if (n >= 1_000_000) return `ETB ${(n / 1_000_000).toFixed(1)} Million`;
  if (n >= 1_000)     return `ETB ${(n / 1_000).toFixed(0)}K`;
  return `ETB ${n.toLocaleString()}`;
}

/* ── Fallback slides ─────────────────────────────────── */
const FALLBACK_SLIDES: Slide[] = [
  {
    id: 1,
    image_url: "https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=900&q=85&fm=webp",
    category_id: "property", label_en: "Property", label_am: "ቤት እና ይዞታ",
    title_en: "Lake View Apartments", title_am: "የሐይቅ ዳርቻ አፓርትማዎች", price: 4800000,
  },
  {
    id: 2,
    image_url: "https://images.unsplash.com/photo-1549317661-bd32c8ce0db2?w=900&q=85&fm=webp",
    category_id: "motors", label_en: "Vehicles", label_am: "ተሽከርካሪዎች",
    title_en: "2019 Toyota Corolla — Single Owner", title_am: "2019 ቶዮታ ኮሮላ — አንድ ባለቤት", price: 1200000,
  },
  {
    id: 3,
    image_url: "https://images.unsplash.com/photo-1631049307264-da0ec9d70304?w=900&q=85&fm=webp",
    category_id: "stay", label_en: "Stays", label_am: "ማረፊያዎች",
    title_en: "Hawassa Lakeview Hotel", title_am: "ሐዋሳ የሐይቅ ገጽታ ሆቴል", price: 2500,
  },
  {
    id: 4,
    image_url: "https://images.unsplash.com/photo-1613490493576-7fde63acd811?w=900&q=85&fm=webp",
    category_id: "property", label_en: "Property", label_am: "ቤት እና ይዞታ",
    title_en: "4-Bedroom Villa in Piassa", title_am: "4 መኝታ ቪላ በፒያሳ", price: 7800000,
  },
  {
    id: 5,
    image_url: "https://images.unsplash.com/photo-1579412691522-861f6540960d?w=900&q=85&fm=webp",
    category_id: "heavy", label_en: "Machinery", label_am: "ማሽነሪዎች",
    title_en: "Cat 320 Excavator — For Hire", title_am: "ካት 320 አቃቂ — በኪራይ", price: 35000,
  },
];

/* ══════════════════════════════════════════════════════
   Component
   ══════════════════════════════════════════════════════ */
const MobileHomeHeader: React.FC<MobileHomeHeaderProps> = ({
  onCategoryChange,
  onFilterClick,
  onSearchChange,
  searchValue,
  activeCategory,
}) => {
  const { t, language, toggleLanguage } = useLanguage();
  const { isAuthenticated, user } = useAuth();
  const { favorites, setSidebarOpen } = useFavorites();
  const navigate = useNavigate();

  const [menuOpen, setMenuOpen]           = useState(false);
  const [showSignOut, setShowSignOut]     = useState(false);
  const [showProfileSub, setShowProfileSub] = useState(false);
  const [showMoreModal, setShowMoreModal] = useState(false);
  const [slides, setSlides]               = useState<Slide[]>(FALLBACK_SLIDES);
  const [activeSlide, setActiveSlide]     = useState(0);
  const autoplayRef = useRef<ReturnType<typeof setInterval> | null>(null);

  /* ── Fetch hero slides ── */
  useEffect(() => {
    fetch("/api/site/hero-slides")
      .then((r) => r.json())
      .then((data) => {
        if (data.success && Array.isArray(data.data) && data.data.length > 0) {
          const seen = new Set<string>();
          const unique = data.data.filter((s: any) => {
            if (!s.is_active || seen.has(s.category_id)) return false;
            seen.add(s.category_id);
            return true;
          });
          if (unique.length > 0) setSlides(unique);
        }
      })
      .catch(() => {});
  }, []);

  /* ── Autoplay ── */
  const next = useCallback(() => {
    setActiveSlide((i) => (i + 1) % slides.length);
  }, [slides.length]);

  useEffect(() => {
    autoplayRef.current = setInterval(next, 5000);
    return () => { if (autoplayRef.current) clearInterval(autoplayRef.current); };
  }, [next]);

  const goTo = (i: number) => {
    if (autoplayRef.current) clearInterval(autoplayRef.current);
    setActiveSlide(i);
    autoplayRef.current = setInterval(next, 5000);
  };

  const slide      = slides[activeSlide] ?? slides[0];
  const slideTitle = language === "amharic"
    ? (slide?.title_am || slide?.label_am)
    : (slide?.title_en || slide?.label_en);

  /* ── Helpers ── */
  const handleCatClick = (id: string, isFilter?: boolean) => {
    if (isFilter) { setShowMoreModal(true); return; }
    onCategoryChange(id);
    const el = document.getElementById("listings-catalog");
    if (el) el.scrollIntoView({ behavior: "smooth" });
  };

  const handleNavCat = (id: string) => {
    setMenuOpen(false);
    onCategoryChange(id);
    const el = document.getElementById("listings-catalog");
    if (el) el.scrollIntoView({ behavior: "smooth" });
  };

  return (
    <div className="lg:hidden">

      {/* ══ 1. TICKER BANNER ══ */}
      <div className="hidden w-full bg-[#0B132B] border-b border-emerald-600/30 py-2.5 px-4 overflow-hidden">
        <p
          className="text-[11px] font-bold tracking-widest text-white uppercase whitespace-nowrap animate-marquee text-center"
          dangerouslySetInnerHTML={highlightTicker(t("ticker"))}
        />
      </div>

      {/* ══ 2. MAIN NAV BAR — bg-white shadow, same as desktop (Sticky) ══ */}
      <div className="sticky top-0 z-[130] w-full bg-white dark:bg-slate-900 border-b border-slate-200/80 dark:border-white/10 shadow-sm px-4 py-2 flex items-center justify-between gap-3">

        {/* LEFT: Hamburger */}
        <button
          onClick={() => setMenuOpen(!menuOpen)}
          aria-label={menuOpen ? "Close menu" : "Open menu"}
          className="p-2 rounded-xl text-malazone-navy hover:bg-slate-100 transition-colors shrink-0"
        >
          {menuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
        </button>

        {/* CENTER: Brand */}
        <button
          onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
          className="flex items-center leading-none"
          aria-label="Malazone Home"
        >
          <span className="text-[#00A86B] font-black text-xl tracking-tight">MALA</span>
          <span className="text-malazone-navy font-black text-xl tracking-tight">ZONE</span>
        </button>

        {/* RIGHT: Language + Bell + User */}
        <div className="flex items-center gap-1.5 shrink-0">

          {/* Language toggle */}
          <button
            onClick={toggleLanguage}
            className="flex items-center gap-1 px-2.5 py-1.5 rounded-full border border-slate-200 bg-white hover:bg-slate-50 hover:border-[#00A86B]/40 transition-all shadow-sm"
            aria-label="Toggle language"
          >
            <Globe className="w-3.5 h-3.5 text-[#00A86B]" />
            <span className="text-[10px] font-black tracking-widest text-malazone-navy uppercase">
              {LANGUAGE_OPTIONS.find(o => o.value === language)?.labelShort || language}
            </span>
          </button>

          {/* Favorites — logged in only */}
          {isAuthenticated && (
            <button
              onClick={() => setSidebarOpen(true)}
              aria-label="Favorites"
              className="relative w-8 h-8 rounded-full flex items-center justify-center border border-slate-200 bg-white hover:bg-slate-50 shadow-sm transition-colors"
            >
              <Heart className="w-4 h-4 text-red-500" />
              {favorites.length > 0 && (
                <span className="absolute -top-1 -right-1 min-w-[16px] h-4 px-0.5 flex items-center justify-center text-[9px] font-black text-white bg-red-500 rounded-full border border-white">
                  {favorites.length}
                </span>
              )}
            </button>
          )}

          {/* User avatar / sign in */}
          {isAuthenticated && user ? (
            <button
              onClick={() => navigate("/account")}
              className="w-8 h-8 rounded-full bg-gradient-to-br from-[#00A86B] to-emerald-600 flex items-center justify-center text-white font-bold text-sm shadow-md"
              aria-label="My account"
            >
              {user.full_name?.charAt(0)?.toUpperCase() || "U"}
            </button>
          ) : (
            <button
              onClick={() => navigate("/signin")}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-full border border-[#00A86B]/40 bg-[#00A86B]/5 hover:bg-[#00A86B]/10 transition-all active:scale-95"
              aria-label="Login"
            >
              <LogIn className="w-3.5 h-3.5 text-[#00A86B]" />
              <span className="text-[11px] font-black text-[#00A86B] tracking-wide">
                Login
              </span>
            </button>
          )}
        </div>
      </div>

      {/* ══ HAMBURGER MENU PANEL ══ */}
      {menuOpen && (
        <>
          {/* Backdrop */}
          <div
            className="fixed inset-0 z-[140] bg-black/40 backdrop-blur-sm"
            onClick={() => setMenuOpen(false)}
          />
          {/* Panel — slides down below the nav bar */}
          <nav className="absolute left-0 right-0 z-[145] bg-white dark:bg-slate-950 border-b border-slate-200 dark:border-white/10 shadow-2xl animate-in slide-in-from-top duration-200">
            <div className="flex flex-col p-4 gap-2 max-h-[75vh] overflow-y-auto">

              {/* Category links */}
              {NAV_CATS.map((cat) => (
                <button
                  key={cat.id}
                  onClick={() => handleNavCat(cat.id)}
                  className={`flex items-center justify-between w-full px-4 py-3.5 rounded-2xl text-sm font-bold tracking-wide uppercase transition-all duration-200 ${
                    activeCategory === cat.id
                      ? "bg-[#00A86B] text-black"
                      : "text-slate-700 dark:text-slate-200 bg-slate-50 dark:bg-white/5 hover:bg-emerald-50 dark:hover:bg-emerald-500/10 hover:text-[#00A86B]"
                  }`}
                >
                  {t(cat.key as any)}
                  <ChevronRight className={`w-4 h-4 ${activeCategory === cat.id ? "text-black" : "opacity-40"}`} />
                </button>
              ))}

              <div className="h-px bg-slate-100 dark:bg-white/5 my-1" />

              {/* Auth / profile */}
              {!isAuthenticated ? (
                <button
                  onClick={() => { setMenuOpen(false); navigate("/signin"); }}
                  className="flex items-center justify-center gap-2 w-full py-3.5 rounded-2xl bg-gradient-to-r from-[#00A86B] to-emerald-600 text-black font-black text-sm uppercase tracking-widest shadow-lg"
                >
                  <LogIn className="w-5 h-5" />
                  {t("auth.signin") || "SIGN IN"}
                </button>
              ) : user ? (
                <>
                  {/* Profile card */}
                  <button
                    onClick={() => setShowProfileSub(!showProfileSub)}
                    className="flex items-center gap-3 w-full px-4 py-3 rounded-2xl bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 transition-colors"
                  >
                    <div className="w-9 h-9 rounded-full bg-gradient-to-br from-[#00A86B] to-emerald-500 flex items-center justify-center text-white text-sm font-bold shrink-0">
                      {user.full_name?.charAt(0)?.toUpperCase() || "U"}
                    </div>
                    <div className="min-w-0 flex-1 text-left">
                      <p className="text-sm font-bold text-slate-900 dark:text-white truncate">{user.full_name}</p>
                      <p className="text-xs text-slate-500 dark:text-slate-400 truncate">{user.email}</p>
                    </div>
                    <ChevronDown className={`w-4 h-4 text-slate-400 transition-transform ${showProfileSub ? "rotate-180" : ""}`} />
                  </button>

                  {showProfileSub && (
                    <div className="mx-1 p-1.5 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-white/10 shadow">
                      {/* Post a Listing — logged-in only */}
                      <button
                        onClick={() => { setMenuOpen(false); navigate("/post"); }}
                        className="flex items-center gap-3 w-full px-4 py-3 rounded-xl text-sm font-bold text-[#00A86B] bg-[#00A86B]/5 hover:bg-[#00A86B]/10 transition-colors mb-1"
                      >
                        <div className="w-5 h-5 rounded-lg bg-[#00A86B] flex items-center justify-center shrink-0">
                          <span className="text-white text-base leading-none font-black">+</span>
                        </div>
                        Post a Listing
                      </button>
                      <div className="mx-2 my-1 border-t border-slate-100 dark:border-white/5" />
                      <button
                        onClick={() => { setMenuOpen(false); navigate("/account"); }}
                        className="flex items-center gap-3 w-full px-4 py-3 rounded-xl text-sm font-medium text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-white/5 transition-colors"
                      >
                        <UserCircle className="w-4 h-4 text-slate-400" />
                        {t("profile.myAccount") || "My Account"}
                      </button>
                      <button
                        onClick={() => { setMenuOpen(false); navigate("/settings"); }}
                        className="flex items-center gap-3 w-full px-4 py-3 rounded-xl text-sm font-medium text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-white/5 transition-colors"
                      >
                        <Settings className="w-4 h-4 text-slate-400" />
                        {t("profile.settings") || "Settings"}
                      </button>
                      <div className="mx-2 my-1 border-t border-slate-100 dark:border-white/5" />
                      <button
                        onClick={() => { setMenuOpen(false); setShowSignOut(true); }}
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
        </>
      )}

      {/* ══ 3. SEARCH BAR (Sticky - right below nav) ══ */}
      <div className="sticky top-[48px] z-[125] bg-slate-50 dark:bg-slate-950 px-4 pt-3 pb-3 shadow-md border-b border-slate-200/80 dark:border-white/5">
        <div className="flex items-center gap-2">

          {/* Search input — premium branded look */}
          <div className="flex-1 relative group">
            {/* Gradient border ring on focus */}
            <div className="absolute -inset-[1.5px] rounded-2xl bg-gradient-to-r from-[#00A86B]/60 via-emerald-400/40 to-[#00A86B]/60 opacity-0 group-focus-within:opacity-100 transition-opacity duration-300 blur-[1px]" />
            <div className="relative flex items-center bg-white dark:bg-slate-900 rounded-2xl h-12 px-4 gap-3 shadow-md border border-slate-200 dark:border-white/10 group-focus-within:border-[#00A86B]/50 transition-colors duration-200">
              {/* Search icon — green when focused */}
              <Search className="w-4 h-4 text-slate-400 group-focus-within:text-[#00A86B] transition-colors duration-200 shrink-0" />
              <input
                type="search"
                value={searchValue}
                onChange={(e) => {
                  onSearchChange(e.target.value);
                  // Auto-scroll to catalog so user sees live results
                  if (e.target.value.length === 1) {
                    const el = document.getElementById("listings-catalog");
                    if (el) setTimeout(() => el.scrollIntoView({ behavior: "smooth", block: "start" }), 300);
                  }
                }}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    const el = document.getElementById("listings-catalog");
                    if (el) el.scrollIntoView({ behavior: "smooth", block: "start" });
                  }
                }}
                placeholder={t("mobile.search") || "Search houses, land, cars..."}
                className="flex-1 bg-transparent text-sm text-malazone-navy dark:text-slate-200 placeholder:text-slate-400 focus:outline-none font-semibold min-w-0"
              />
              {/* Clear button when there is text */}
              {searchValue && (
                <button
                  onClick={() => onSearchChange("")}
                  aria-label="Clear search"
                  className="shrink-0 w-5 h-5 rounded-full bg-slate-200 dark:bg-slate-700 flex items-center justify-center hover:bg-slate-300 dark:hover:bg-slate-600 transition-colors"
                >
                  <X className="w-3 h-3 text-slate-600 dark:text-slate-300" />
                </button>
              )}
            </div>
          </div>

          {/* Filter button — branded green */}
          <button
            onClick={onFilterClick}
            className="w-12 h-12 rounded-2xl bg-[#00A86B] flex items-center justify-center shadow-md shadow-emerald-500/25 active:scale-95 transition-all duration-200 shrink-0"
            aria-label="Open filters"
          >
            <SlidersHorizontal className="w-5 h-5 text-white" />
          </button>
        </div>
      </div>

      {/* ══ 4. HERO CAROUSEL ══ */}
      <div className="px-4 pb-4 bg-slate-50 dark:bg-slate-950">
        <div className="relative rounded-2xl overflow-hidden h-[220px] shadow-xl">
          {slides.map((s, i) => (
            <div
              key={s.id}
              className={`absolute inset-0 transition-opacity duration-700 ${i === activeSlide ? "opacity-100" : "opacity-0 pointer-events-none"}`}
            >
              <img
                src={s.image_url}
                alt={language === "amharic" ? s.label_am : s.label_en}
                loading={i === 0 ? "eager" : "lazy"}
                crossOrigin="anonymous"
                className="w-full h-full object-cover"
              />
            </div>
          ))}

          {/* Gradient overlay */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/25 to-transparent" />

          {/* FEATURED badge */}
          <div className="absolute top-3 left-3">
            <span className="px-2.5 py-1 rounded-md bg-amber-400 text-[#0B132B] text-[10px] font-black uppercase tracking-widest shadow-md">
              {t("home.featured") || "FEATURED"}
            </span>
          </div>

          {/* Slide content */}
          <div className="absolute bottom-10 left-4 right-14">
            <h2 className="text-white font-black text-lg leading-tight line-clamp-2 drop-shadow-md">
              {slideTitle}
            </h2>
            {slide?.price && (
              <p className="text-white/80 text-[11px] font-semibold mt-1">
                Starting from{" "}
                <span className="text-[#00A86B] font-black">{fmtPrice(slide.price)}</span>
              </p>
            )}
            <div className="flex items-center gap-1 mt-1">
              <CheckCircle2 className="w-3.5 h-3.5 text-[#00A86B]" />
              <span className="text-white/70 text-[10px] font-semibold">Verified Developer</span>
            </div>
          </div>

          {/* Explore Now CTA */}
          <button
            onClick={() => {
              onCategoryChange(slide?.category_id || "all");
              const el = document.getElementById("listings-catalog");
              if (el) el.scrollIntoView({ behavior: "smooth" });
            }}
            className="absolute bottom-10 right-3 flex items-center gap-1 bg-white text-[#0B132B] text-[10px] font-black px-3 py-1.5 rounded-full shadow-lg active:scale-95 transition-transform whitespace-nowrap"
          >
            Explore Now <ArrowRight className="w-3 h-3" />
          </button>

          {/* Dot indicators */}
          <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex items-center gap-1.5">
            {slides.map((_, i) => (
              <button
                key={i}
                onClick={() => goTo(i)}
                aria-label={`Slide ${i + 1}`}
                className={`rounded-full transition-all duration-300 ${
                  i === activeSlide ? "w-4 h-1.5 bg-white" : "w-1.5 h-1.5 bg-white/40"
                }`}
              />
            ))}
          </div>
        </div>
      </div>

      {/* ══ 5. CATEGORY ICON ROW ══ */}
      <div className="bg-slate-50 dark:bg-slate-950 px-4 pb-4 border-b border-slate-200 dark:border-white/5">
        <div className="grid grid-cols-6 gap-2">
          {CATS.map((cat) => {
            const Icon = cat.icon;
            return (
              <button
                key={cat.id}
                onClick={() => handleCatClick(cat.id, cat.isFilter)}
                className="flex flex-col items-center gap-1.5 py-2.5 rounded-2xl bg-white dark:bg-white/[0.04] border border-slate-200 dark:border-white/5 active:scale-95 transition-transform shadow-sm"
              >
                <div
                  className="w-10 h-10 rounded-xl flex items-center justify-center"
                  style={{ backgroundColor: cat.bg }}
                >
                  <Icon className="w-5 h-5" style={{ color: cat.color }} strokeWidth={2} />
                </div>
                <span className="text-[10px] font-bold text-malazone-navy dark:text-slate-300 leading-tight text-center">
                  {t(cat.labelKey as any)}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Sign Out Modal */}
      {showSignOut && <SignOut onClose={() => setShowSignOut(false)} />}

      {/* More Categories Modal */}
      {showMoreModal && (
        <>
          <div 
            className="fixed inset-0 bg-black/50 z-[200] backdrop-blur-sm"
            onClick={() => setShowMoreModal(false)}
          />
          <div className="fixed inset-x-4 top-1/2 -translate-y-1/2 z-[201] bg-white dark:bg-slate-900 rounded-3xl shadow-2xl max-w-md mx-auto overflow-hidden animate-in fade-in zoom-in-95 duration-200">
            {/* Header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200 dark:border-white/10">
              <h3 className="text-lg font-black text-slate-900 dark:text-white">
                {t('cat.moreCategories') || 'All Categories'}
              </h3>
              <button
                onClick={() => setShowMoreModal(false)}
                className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors"
              >
                <X className="w-5 h-5 text-slate-600 dark:text-slate-400" />
              </button>
            </div>

            {/* Categories Grid */}
            <div className="p-6 grid grid-cols-3 gap-4">
              {MORE_CATS.map((cat) => {
                const Icon = cat.icon;
                return (
                  <button
                    key={cat.id}
                    onClick={() => {
                      onCategoryChange(cat.id);
                      setShowMoreModal(false);
                      const el = document.getElementById('listings-catalog');
                      if (el) el.scrollIntoView({ behavior: 'smooth' });
                    }}
                    className="flex flex-col items-center gap-3 py-4 px-2 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-white/10 active:scale-95 transition-all duration-200 hover:shadow-md hover:border-[#00A86B]/30"
                  >
                    <div
                      className="w-14 h-14 rounded-2xl flex items-center justify-center transition-all duration-200"
                      style={{ backgroundColor: cat.bg }}
                    >
                      <Icon className="w-7 h-7" style={{ color: cat.color }} strokeWidth={2} />
                    </div>
                    <span className="text-xs font-bold text-slate-800 dark:text-slate-200 leading-tight text-center">
                      {t(cat.key as any)}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>
        </>
      )}

    </div>
  );
};

export default MobileHomeHeader;
