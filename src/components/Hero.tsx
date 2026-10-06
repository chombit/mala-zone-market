/**
 * Hero.tsx
 * Malazone.com — Single-Screen Elite Hero with Full Dual-Theme Engine
 * Dark Mode: Deep midnight carbon | Light Mode: Crisp alabaster white
 * © 2026 Malazone Technologies PLC | Founder: Luwa Tesemma Kakawo
 */

import React, { useState, useEffect, useCallback, useRef } from "react";
import {
  Shirt,Armchair,Zap,
  Users,
  ListChecks,
  Car,
  Globe,
  Search,
  MapPin,
  ChevronDown,
  Sparkles,
  TrendingUp,
  Building2,
  Hotel,
  Navigation,
  Compass,
  Smartphone,
  X,
} from "lucide-react";
import { useLanguage } from "@/contexts/ZoneLanguageContext";
import { useMouseParallax } from "@/hooks/useWorldClassAnimations";

/* ────────────────────────────────────────────
   Icon mapping for categories
   ──────────────────────────────────────────── */
const ICON_MAP: Record<string, any> = {
  "property": Building2,
  "motors": Car,
  "stay": Hotel,
  "furniture": Armchair,
  "fashion": Shirt,
  "electronics": Smartphone
};

/* ────────────────────────────────────────────
   Types
   ──────────────────────────────────────────── */
interface Stats {
  clients: number;
  listings: number;
  electronics: number;
  trade_success_rate: number;
}

interface Slide {
  id: number;
  image_url: string;
  pillar_key: string;
  category_id: string;
  label_en: string;
  label_am: string;
  display_order: number;
  is_active: boolean;
}

interface HeroProps {
  activeCategory?: string;
  onCategoryChange: (cat: string) => void;
  onFilterChange: (key: string, value: string) => void;
}

/* ────────────────────────────────────────────
   Animated Counter Hook
   ──────────────────────────────────────────── */
const useAnimatedCounter = (target: number, duration: number = 2000) => {
  const [count, setCount] = useState(0);
  const countRef = useRef(0);
  const startTimeRef = useRef<number | null>(null);

  useEffect(() => {
    const animate = (timestamp: number) => {
      if (!startTimeRef.current) startTimeRef.current = timestamp;
      const progress = Math.min((timestamp - startTimeRef.current) / duration, 1);

      // Easing function for smooth animation
      const easeOutQuart = 1 - Math.pow(1 - progress, 4);
      const currentCount = Math.floor(easeOutQuart * target);

      if (currentCount !== countRef.current) {
        countRef.current = currentCount;
        setCount(currentCount);
      }

      if (progress < 1) {
        requestAnimationFrame(animate);
      }
    };

    requestAnimationFrame(animate);
    return () => { startTimeRef.current = null; };
  }, [target, duration]);

  return count;
};

/* ────────────────────────────────────────────
   Component
   ──────────────────────────────────────────── */
const Hero: React.FC<HeroProps> = ({ activeCategory, onCategoryChange, onFilterChange }) => {
  const { t, language } = useLanguage();
  const { x, y } = useMouseParallax(25, 0.06);

  /* Deduplicate slides by category_id — keep only the first occurrence */
  const dedupeSlides = (arr: Slide[]): Slide[] => {
    const seen = new Set<string>();
    return arr.filter((s) => {
      if (seen.has(s.category_id)) return false;
      seen.add(s.category_id);
      return true;
    });
  };
  const [activeSlide, setActiveSlide] = useState(0);
  const [showMorePillMenu, setShowMorePillMenu] = useState(false);
  const [searchIntent, setSearchIntent] = useState("intent.buy");
  const [searchQuery, setSearchQuery] = useState<string>(
    () => new URLSearchParams(window.location.search).get("search") || ""
  );
  const [stats, setStats] = useState<Stats>({
    clients: 1003,
    listings: 2547,
    electronics: 5890,
    trade_success_rate: 100,
  });
  const [slides, setSlides] = useState<Slide[]>([]);

  // Fetch hero slides from API
  useEffect(() => {
    const fetchSlides = async () => {
      try {
        const res = await fetch("/api/site/hero-slides");
        const data = await res.json();
        if (data.success && data.data.length > 0) {
          setSlides(dedupeSlides(data.data));
        }
      } catch (e) {
        // Fallback: load static slides if API fails
        const fallbackSlides: Slide[] = [
          {
            id: 1,
            image_url: "https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=1600&q=90&fm=webp",
            pillar_key: "nav.cat1",
            category_id: "property",
            label_en: "Property",
            label_am: "ቤት እና ይዞታ",
            display_order: 0,
            is_active: true
          },
          {
            id: 2,
            image_url: "https://images.unsplash.com/photo-1494976388531-d1058494cdd8?w=1600&q=90&fm=webp",
            pillar_key: "nav.cat2",
            category_id: "motors",
            label_en: "Motors & EV",
            label_am: "መኪና ዞን",
            display_order: 1,
            is_active: true
          },
          {
            id: 3,
            image_url: "https://images.unsplash.com/photo-1551882547-ff40c63fe5fa?w=1600&q=90&fm=webp",
            pillar_key: "nav.cat3",
            category_id: "stay",
            label_en: "Rooms & Halls",
            label_am: "አዳራሽ ዞን",
            display_order: 2,
            is_active: true
          },
          {
            id: 4,
            image_url: "https://images.unsplash.com/photo-1519741497674-611481863552?w=1600&q=90&fm=webp",
            pillar_key: "nav.cat4",
            category_id: "furniture",
            label_en: "Furniture",
            label_am: "የቤት እቃ ዞን",
            display_order: 3,
            is_active: true
          },
          {
            id: 5,
            image_url: "https://images.unsplash.com/photo-1504917595217-d4dc5ebe6122?w=1600&q=90&fm=webp",
            pillar_key: "nav.cat5",
            category_id: "fashion",
            label_en: "Fashion",
            label_am: "ፋሽን ዞን",
            display_order: 4,
            is_active: true
          },
          {
            id: 6,
            image_url: "https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=1600&q=90&fm=webp",
            pillar_key: "nav.cat6",
            category_id: "electronics",
            label_en: "Electronics Zone",
            label_am: "ኤሌክትሮኒክስ ዞን",
            display_order: 5,
            is_active: true
          }
        ];
        setSlides(dedupeSlides(fallbackSlides));
      }
    };
    fetchSlides();
  }, []);

  /* Auto-advance slideshow */
  const nextSlide = useCallback(() => {
    if (slides.length > 0) {
      setActiveSlide((prev) => (prev + 1) % slides.length);
    }
  }, [slides.length]);

  useEffect(() => {
    if (slides.length > 0) {
      const timer = setInterval(nextSlide, 6500);
      return () => clearInterval(timer);
    }
  }, [nextSlide, slides.length]);

  /* Fetch live stats */
  useEffect(() => {
    const fetchStats = async () => {
      try {
        const response = await fetch("/api/stats");
        const result = await response.json();
        if (result.success) {
          // Merge API data with defaults to ensure electronics exists
          setStats(prev => ({
            ...prev,
            ...result.data
          }));
        }
      } catch {
        // Silently use static fallback values — network unavailable
      }
    };
    fetchStats();
  }, []);

  const handleSearch = () => {
    // Search term applies to the shared filter state — same as the mobile
    // search bar. Category/intent/location are applied live via the pills and
    // nav, so we never reset the user's filters here.
    onFilterChange("search", searchQuery);

    // Scroll to results
    const grid = document.getElementById("listings-catalog");
    if (grid) {
      grid.scrollIntoView({ behavior: "smooth" });
    }
  };





  /* ── Select field shared class ─────────────────────────────────── */
  const selectClass =
    "w-full bg-transparent text-sm font-semibold focus:outline-none appearance-none cursor-pointer " +
    "text-malazone-navy dark:text-white";

  return (
    <section
      id="hero-section"
      className="
        relative w-full min-h-[220px] sm:min-h-[420px] lg:min-h-[480px]
        bg-slate-50 dark:bg-slate-950
        flex flex-col
        transition-colors duration-500
        mb-8 sm:mb-0
      "
    >
      {/* ── Background Carousel ──────────────────────────────────── */}
      <div className="absolute inset-0 z-0 overflow-hidden">
        {slides.map((slide, i) => (
          <div
            key={slide.id}
            className={`absolute inset-0 transition-opacity duration-[1400ms] ease-in-out ${i === activeSlide ? "opacity-100" : "opacity-0"
              }`}
          >
            <img
              src={slide.image_url}
              alt=""
              crossOrigin="anonymous"
              className="w-full h-full object-cover transition-transform duration-[7000ms]"
              style={{
                transform: i === activeSlide ? "scale(1)" : "scale(1.1)",
              }}
            />
          </div>
        ))}

        {/* ── Theme-adaptive gradient overlay for 100% readability ─────── */}
        <div className="absolute inset-0 bg-gradient-to-t from-slate-50 via-slate-50/70 to-transparent dark:from-slate-950 dark:via-slate-950/80 dark:to-transparent transition-colors duration-500" />
        <div className="absolute inset-0 bg-gradient-to-b from-slate-50/30 via-transparent to-transparent dark:from-slate-950/60 dark:via-transparent dark:to-transparent transition-colors duration-500" />
      </div>

      {/* ── Ambient Glow Orbs ─────────────────────────────────────── */}
      <div className="absolute inset-0 z-[1] overflow-hidden pointer-events-none hidden sm:block">
        <div className="absolute top-[20%] left-[10%] w-[500px] h-[500px] bg-malazone-green/[0.05] rounded-full blur-[140px] animate-pulse" />
        <div
          className="absolute bottom-[15%] right-[5%] w-[400px] h-[400px] bg-malazone-green/[0.03] rounded-full blur-[120px] animate-pulse"
          style={{ animationDelay: "2s", animationDuration: "6s" }}
        />
      </div>

      {/* ── Dot Grid Texture ─────────────────────────────────────── */}
      <div
        className="absolute inset-0 z-[2] opacity-[0.025] dark:opacity-[0.015] pointer-events-none transition-opacity duration-500"
        style={{
          backgroundImage:
            "radial-gradient(circle, rgba(0,0,0,0.6) 1px, transparent 1px)",
          backgroundSize: "28px 28px",
        }}
      />

      {/* ── Main Content ─────────────────────────────────────────── */}
      <div className="relative z-10 flex-1 flex flex-col items-center justify-center px-5 sm:px-8 lg:px-12 pt-14 sm:pt-20 pb-5 sm:pb-8">
        <div className="w-full max-w-6xl flex flex-col items-center gap-4 sm:gap-5">

          {/* ── 1. STRICT PLATFORM BRAND HEADING ── */}
          <h1
            className="hidden sm:flex text-6xl sm:text-7xl lg:text-[8.5rem] font-black leading-[0.85] tracking-tighter uppercase italic text-center animate-fade-in-up mb-3 justify-center"
            style={{
              transform: `translate3d(${x * 0.3}px, ${y * 0.3}px, 0)`,
              willChange: 'transform',
              transition: 'transform 0.1s ease-out'
            }}
          >
            <span className="text-malazone-green drop-shadow-[0_0_40px_rgba(0,168,107,0.3)]">
              MALA
            </span>
            <span className="text-malazone-navy dark:text-white drop-shadow-none dark:drop-shadow-[0_2px_30px_rgba(255,255,255,0.08)] transition-colors duration-500">
              ZONE
            </span>
          </h1>

          {/* ── 2. LOCALIZED MOTTO SEGREGATION ── */}
          <div
            className="hidden sm:flex items-center justify-center gap-3 animate-fade-in-up mb-4"
            style={{
              transform: `translate3d(${x * 0.2}px, ${y * 0.2}px, 0)`,
              willChange: 'transform',
              transition: 'transform 0.1s ease-out'
            }}
          >
            <div className="flex items-center gap-3 bg-white/60 dark:bg-black/30 backdrop-blur-md px-6 py-2.5 rounded-full border border-slate-200/50 dark:border-white/10 shadow-lg dark:shadow-none">
              <Sparkles className="w-4 h-4 text-[#00A86B] animate-pulse" />
              <span className="text-malazone-navy dark:text-slate-200 font-bold text-[11px] sm:text-sm uppercase tracking-[0.25em]">
                {t("hero.tagline")}
              </span>
              <Sparkles className="w-4 h-4 text-[#00A86B] animate-pulse" />
            </div>
          </div>

          {/* ── 3. SUB-HEADLINE ── */}
          <p
            className="hidden sm:block text-sm sm:text-base lg:text-lg font-medium tracking-tight max-w-2xl mx-auto text-center leading-relaxed animate-fade-in-up text-malazone-navy dark:text-slate-400 transition-colors duration-500"
            style={{
              transform: `translate3d(${x * 0.15}px, ${y * 0.15}px, 0)`,
              willChange: 'transform',
              transition: 'transform 0.1s ease-out'
            }}
          >
            {t("hero.subtitle")}
          </p>

          {/* ── Mobile Brand (compact) ── */}
          <div className="flex sm:hidden items-center justify-center w-full absolute inset-0 pointer-events-none z-10">
            <span className="text-4xl font-black tracking-tighter uppercase italic drop-shadow-md">
              <span className="text-malazone-green">MALA</span>
              <span className="text-malazone-navy dark:text-white">ZONE</span>
            </span>
          </div>

          {/* ── Inline Search Bar ─────────────────────────────────── */}
          <div
            className="w-full max-w-4xl animate-fade-in-up relative z-50 mt-16 sm:mt-0 px-4 sm:px-0 absolute sm:relative bottom-[-24px] sm:bottom-auto left-0 sm:left-auto"
            style={{
              transform: `translate3d(${x * 0.1}px, ${y * 0.1}px, 0)`,
              willChange: 'transform',
              transition: 'transform 0.1s ease-out'
            }}
          >
            <form
              onSubmit={(e) => { e.preventDefault(); handleSearch(); }}
              className="
                flex items-center gap-3
                rounded-full
                border transition-all duration-500
                bg-white dark:bg-slate-900/90
                border-slate-200 dark:border-white/[0.08]
                shadow-xl dark:shadow-[0_8px_40px_rgba(0,0,0,0.4)]
                hover:border-malazone-green/30 dark:hover:border-malazone-green/20
                focus-within:border-malazone-green/40 dark:focus-within:border-malazone-green/30
                cursor-text
              "
            >
              <div className="flex items-center gap-3 flex-1 pl-6 pr-2 py-2 sm:py-4">
                <Search className="w-5 h-5 text-slate-400 dark:text-slate-500 flex-shrink-0" />
                <input
                  type="search"
                  value={searchQuery}
                  onChange={(e) => {
                      setSearchQuery(e.target.value);
                      onFilterChange("search", e.target.value);
                    }}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      e.preventDefault();
                      handleSearch();
                    }
                  }}
                  placeholder={t("search.zone") === "Search Zone" ? "Search houses, land, cars, furniture..." : t("search.zone")}
                  aria-label="Search listings"
                  className="
                    flex-1 min-w-0 bg-transparent
                    text-sm sm:text-base font-medium
                    text-malazone-navy dark:text-slate-200
                    placeholder:text-slate-400 dark:placeholder:text-slate-500
                    focus:outline-none
                  "
                />
                {searchQuery && (
                  <button
                    type="button"
                    onClick={() => { setSearchQuery(""); onFilterChange("search", ""); }}
                    aria-label="Clear search"
                    className="shrink-0 w-6 h-6 rounded-full bg-slate-200 dark:bg-slate-700 flex items-center justify-center hover:bg-slate-300 dark:hover:bg-slate-600 transition-colors"
                  >
                    <X className="w-4 h-4 text-slate-600 dark:text-slate-300" />
                  </button>
                )}
              </div>
              <button
                type="submit"
                className="
                  flex items-center justify-center
                  w-12 h-12 sm:w-auto sm:px-6 sm:py-4 rounded-full
                  bg-malazone-green hover:bg-malazone-green/90
                  text-malazone-navy font-black
                  transition-all duration-300 group mr-2 sm:mr-1 shrink-0
                "
              >
                <Search className="w-5 h-5 sm:w-4 sm:h-4 group-hover:rotate-12 transition-transform duration-300" />
                <span className="text-xs font-black uppercase tracking-[0.2em] whitespace-nowrap hidden sm:inline ml-2">
                  {t("search.btn")}
                </span>
              </button>
            </form>
          </div>

          {/* ── 4. Professional Interactive Category Pills (Matching Screenshot) ── */}
          <div
            className="hidden sm:block w-full max-w-4xl animate-fade-in-up mt-2 px-2"
            style={{
              transform: `translate3d(${x * 0.08}px, ${y * 0.08}px, 0)`,
              willChange: 'transform',
              transition: 'transform 0.1s ease-out'
            }}
          >
            <div className="grid grid-cols-6 gap-2 sm:gap-3">
              {[
                {
                  id: "buy",
                  type: "intent",
                  value: "buy",
                  icon: (props: any) => (
                    <svg {...props} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 100 4 2 2 0 000-4z" />
                    </svg>
                  ),
                  iconBg: "bg-blue-50/90 text-blue-600 dark:bg-blue-950/40 dark:text-blue-400 border-blue-100 dark:border-blue-900/30",
                  activeBg: "ring-2 ring-blue-500 bg-blue-100/80 dark:bg-blue-900/60",
                  labelKey: "cat.buy",
                  fallback: "Buy"
                },
                {
                  id: "rent",
                  type: "intent",
                  value: "rent",
                  icon: (props: any) => (
                    <svg {...props} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z" />
                    </svg>
                  ),
                  iconBg: "bg-emerald-50/90 text-emerald-600 dark:bg-emerald-950/40 dark:text-emerald-400 border-emerald-100 dark:border-emerald-900/30",
                  activeBg: "ring-2 ring-emerald-500 bg-emerald-100/80 dark:bg-emerald-900/60",
                  labelKey: "cat.rent",
                  fallback: "Rent"
                },
                {
                  id: "property",
                  type: "category",
                  value: "property",
                  icon: (props: any) => (
                    <svg {...props} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7" />
                    </svg>
                  ),
                  iconBg: "bg-teal-50/90 text-teal-600 dark:bg-teal-950/40 dark:text-teal-400 border-teal-100 dark:border-teal-900/30",
                  activeBg: "ring-2 ring-teal-500 bg-teal-100/80 dark:bg-teal-900/60",
                  labelKey: "nav.cat1",
                  fallback: "Property"
                },
                {
                  id: "electronics",
                  type: "category",
                  value: "electronics",
                  icon: Smartphone,
                  iconBg: "bg-indigo-50/90 text-indigo-600 dark:bg-indigo-950/40 dark:text-indigo-400 border-indigo-100 dark:border-indigo-900/30",
                  activeBg: "ring-2 ring-indigo-500 bg-indigo-100/80 dark:bg-indigo-900/60",
                  labelKey: "nav.cat6",
                  fallback: "Electronics"
                },
                {
                  id: "motors",
                  type: "category",
                  value: "motors",
                  icon: Car,
                  iconBg: "bg-amber-50/90 text-orange-600 dark:bg-amber-950/40 dark:text-orange-400 border-amber-100 dark:border-amber-900/30",
                  activeBg: "ring-2 ring-orange-500 bg-amber-100/80 dark:bg-amber-900/60",
                  labelKey: "nav.cat2",
                  fallback: "Vehicles"
                },
                {
                  id: "more",
                  type: "more",
                  value: "all",
                  icon: (props: any) => (
                    <svg {...props} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
                    </svg>
                  ),
                  iconBg: "bg-purple-50/90 text-purple-600 dark:bg-purple-950/40 dark:text-purple-400 border-purple-100 dark:border-purple-900/30",
                  activeBg: "ring-2 ring-purple-500 bg-purple-100/80 dark:bg-purple-900/60",
                  labelKey: "cat.more",
                  fallback: "More"
                }
              ].map((pill) => {
                const IconComponent = pill.icon;
                const isSelected =
                  pill.type === "intent"
                    ? searchIntent === `intent.${pill.value}`
                    : pill.type === "category"
                      ? (activeCategory || "all") === pill.value
                      : false;

                const handleClick = () => {
                  if (pill.type === "intent") {
                    setSearchIntent(`intent.${pill.value}`);
                    onFilterChange("intent", pill.value);
                  } else if (pill.type === "category") {
                    onCategoryChange(pill.value);
                  } else {
                    onCategoryChange("all");
                  }
                  // Scroll smoothly to grid catalog
                  const grid = document.getElementById("listings-catalog");
                  if (grid) grid.scrollIntoView({ behavior: "smooth" });
                };

                return (
                  <div
                    key={pill.id}
                    className="relative w-full group/more"
                    onMouseEnter={() => pill.type === "more" && setShowMorePillMenu(true)}
                    onMouseLeave={() => pill.type === "more" && setShowMorePillMenu(false)}
                  >
                    <button
                      onClick={(e) => {
                        if (pill.type === "more") {
                          e.stopPropagation();
                          setShowMorePillMenu(!showMorePillMenu);
                        } else {
                          setShowMorePillMenu(false);
                          handleClick();
                        }
                      }}
                      className="
                        flex flex-col items-center justify-between
                        bg-white/95 dark:bg-slate-900/90
                        backdrop-blur-md
                        border border-slate-200/80 dark:border-white/10
                        rounded-2xl sm:rounded-3xl
                        py-2.5 sm:py-3.5 px-1 sm:px-2
                        shadow-md hover:shadow-xl
                        hover:-translate-y-1 hover:border-slate-300 dark:hover:border-white/20
                        transition-all duration-300 group
                        w-full cursor-pointer
                      "
                    >
                      {/* Icon Card Bubble */}
                      <div
                        className={`
                          w-10 h-10 sm:w-13 sm:h-13 rounded-xl sm:rounded-2xl
                          flex items-center justify-center
                          border transition-all duration-300
                          group-hover:scale-105
                          ${pill.iconBg}
                          ${isSelected || (pill.type === "more" && showMorePillMenu) ? pill.activeBg : ""}
                        `}
                      >
                        <IconComponent className="w-5 h-5 sm:w-6 sm:h-6 transition-transform duration-300 group-hover:rotate-6" />
                      </div>

                      {/* Label */}
                      <span className="text-[11px] sm:text-xs font-bold text-slate-800 dark:text-slate-200 mt-2 text-center line-clamp-1 group-hover:text-malazone-green transition-colors">
                        {t(pill.labelKey) || pill.fallback}
                      </span>
                    </button>

                    {/* Popover / Dropdown Menu for Rest Categories (Opens in clean side space) */}
                    {pill.type === "more" && (
                      <div
                        className={`
                          absolute left-0 sm:left-auto sm:right-0 top-full sm:top-auto sm:bottom-0 sm:translate-x-[102%] pt-3 sm:pt-0 pl-0 sm:pl-3 w-56 sm:w-64 z-[100]
                          transition-all duration-200 origin-top-left sm:origin-bottom-left
                          ${showMorePillMenu
                            ? "opacity-100 scale-100 pointer-events-auto"
                            : "opacity-0 scale-95 pointer-events-none group-hover/more:opacity-100 group-hover/more:scale-100 group-hover/more:pointer-events-auto"
                          }
                        `}
                      >
                        <div
                          className="
                            bg-white dark:bg-slate-900
                            rounded-2xl shadow-2xl
                            border border-slate-200 dark:border-white/10
                            p-2.5 animate-in fade-in slide-in-from-left-2 duration-200
                          "
                        >
                          <div className="text-[11px] font-extrabold uppercase tracking-wider text-slate-400 dark:text-slate-500 px-3 py-1.5 border-b border-slate-100 dark:border-white/5 mb-1">
                            {t("cat.title") || "Select Category"}
                          </div>
                          {[
                            { id: "stay", labelKey: "nav.cat3", fallback: "Stays", icon: Hotel },
                            { id: "furniture", labelKey: "nav.cat4", fallback: "Furniture", icon: Armchair },
                            { id: "fashion", labelKey: "nav.cat5", fallback: "Fashion", icon: Shirt },
                            { id: "all", labelKey: "cat.all", fallback: "All Categories", icon: Compass },
                          ].map((item) => {
                            const ItemIcon = item.icon;
                            return (
                              <button
                                key={item.id}
                                onClick={() => {
                                  onCategoryChange(item.id);
                                  setShowMorePillMenu(false);
                                  const grid = document.getElementById("listings-catalog");
                                  if (grid) grid.scrollIntoView({ behavior: "smooth" });
                                }}
                                className="
                                  flex items-center gap-3 w-full px-3 py-2.5 rounded-xl
                                  text-xs font-bold text-slate-700 dark:text-slate-200
                                  hover:bg-emerald-50 dark:hover:bg-emerald-950/40
                                  hover:text-malazone-green dark:hover:text-emerald-400
                                  transition-all duration-150 cursor-pointer text-left
                                "
                              >
                                <ItemIcon className="w-4 h-4 text-malazone-green" />
                                <span>{t(item.labelKey) || item.fallback}</span>
                              </button>
                            );
                          })}
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>




          {/* ── Slideshow Dot Indicators ──────────────────────────── */}
          <div className="hidden sm:flex items-center justify-center gap-2">
            {slides.map((_, i) => (
              <button
                key={i}
                onClick={() => setActiveSlide(i)}
                aria-label={`Slide ${i + 1}`}
                className={`rounded-full transition-all duration-500 ${i === activeSlide
                  ? "w-7 h-1.5 bg-malazone-green"
                  : "w-1.5 h-1.5 bg-slate-400/30 dark:bg-white/10 hover:bg-slate-400/50 dark:hover:bg-white/20"
                  }`}
              />
            ))}
          </div>
        </div>
      </div>

      {/* ── Bottom Gradient Fade → Catalog Section ────────────────── */}
      <div className="absolute bottom-0 left-0 right-0 h-24 bg-gradient-to-t from-slate-50 dark:from-slate-950 to-transparent z-[3] pointer-events-none transition-colors duration-500" />
    </section>
  );
};

export default Hero;
