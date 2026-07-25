/**
 * Hero.tsx
 * Malazone.com — Single-Screen Elite Hero with Full Dual-Theme Engine
 * Dark Mode: Deep midnight carbon | Light Mode: Crisp alabaster white
 * © 2026 Malazone Technologies PLC | Founder: Luwa Tesemma Kakawo
 */

import React, { useState, useEffect, useCallback, useRef } from "react";
import {
  Zap,
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
  Truck,
  Music,
  Hotel,
  Navigation,
  Compass,
  Smartphone,
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
  "ceremony": Music,
  "heavy": Truck,
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
const Hero: React.FC<HeroProps> = ({ onCategoryChange, onFilterChange }) => {
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
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [searchLocation, setSearchLocation] = useState("loc.hawassa");
  const [searchIntent, setSearchIntent] = useState("intent.buy");
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
            category_id: "ceremony",
            label_en: "Ceremony & DJ",
            label_am: "ሰርግ ዞን",
            display_order: 3,
            is_active: true
          },
          {
            id: 5,
            image_url: "https://images.unsplash.com/photo-1504917595217-d4dc5ebe6122?w=1600&q=90&fm=webp",
            pillar_key: "nav.cat5",
            category_id: "heavy",
            label_en: "Heavy Machinery",
            label_am: "ማሽነሪ ዞን",
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
    // 1. Sync category/zone
    onCategoryChange(selectedCategory);

    // 2. Sync Location (Map dictionary key to filter value)
    // We pass the key part like "hawassa", "yirgalem" etc.
    const cityValue = searchLocation.replace("loc.", "");
    onFilterChange("city", cityValue);

    // 3. Sync Intent
    const intentValue = searchIntent.replace("intent.", "");
    onFilterChange("intent", intentValue);

    // 4. Scroll to results
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
        relative w-full min-h-[200px] sm:min-h-[420px] lg:min-h-[480px]
        bg-slate-50 dark:bg-slate-950
        flex flex-col overflow-hidden
        transition-colors duration-500
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
          <div className="flex sm:hidden items-center gap-2 mb-1 animate-fade-in-up">
            <span className="text-2xl font-black tracking-tighter uppercase italic">
              <span className="text-malazone-green">MALA</span>
              <span className="text-malazone-navy dark:text-white">ZONE</span>
            </span>
          </div>

          {/* ── Inline Search Bar ─────────────────────────────────── */}
          <div
            className="w-full max-w-4xl animate-fade-in-up relative z-50"
            style={{
              transform: `translate3d(${x * 0.1}px, ${y * 0.1}px, 0)`,
              willChange: 'transform',
              transition: 'transform 0.1s ease-out'
            }}
          >
            <div
              onClick={handleSearch}
              className="
                flex items-center gap-3
                rounded-full
                border transition-all duration-500
                bg-white dark:bg-slate-900/90
                border-slate-200 dark:border-white/[0.08]
                shadow-xl dark:shadow-[0_8px_40px_rgba(0,0,0,0.4)]
                hover:border-malazone-green/30 dark:hover:border-malazone-green/20
                cursor-text
              "
            >
              <div className="flex items-center gap-3 flex-1 px-6 py-4">
                <Search className="w-5 h-5 text-slate-400 dark:text-slate-500 flex-shrink-0" />
                <span className="text-sm font-medium text-slate-400 dark:text-slate-500 select-none">
                  {t("search.zone") === "Search Zone" ? "Search houses, land, cars, machinery..." : t("search.zone")}
                </span>
              </div>
              <button
                onClick={(e) => { e.stopPropagation(); handleSearch(); }}
                className="
                  flex items-center justify-center gap-2
                  px-6 py-4 rounded-full
                  bg-malazone-green hover:bg-malazone-green/90
                  text-malazone-navy font-black
                  transition-all duration-300 group mr-1
                "
              >
                <Search className="w-4 h-4 group-hover:rotate-12 transition-transform duration-300" />
                <span className="text-xs font-black uppercase tracking-[0.2em] whitespace-nowrap hidden sm:inline">
                  {t("search.btn")}
                </span>
              </button>
            </div>
          </div>


          {/* ── Stats Strip ─────────────────────────────────────────── */}
          <div 
            className="hidden sm:grid w-full max-w-3xl grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4 animate-fade-in-up perspective-[1200px]"
            style={{
              transform: `translate3d(${x * 0.05}px, ${y * 0.05}px, 0)`,
              willChange: 'transform',
              transition: 'transform 0.1s ease-out'
            }}
          >
            {[
              {
                label: t("stats.clients"),
                val: `${(stats.clients || 1003).toLocaleString()}+`,
                icon: <Users className="w-4 h-4" />,
              },
              {
                label: t("stats.listings"),
                val: `${(stats.listings || 2547).toLocaleString()}+`,
                icon: <ListChecks className="w-4 h-4" />,
              },
              {
                label: t("stats.electronics"),
                val: `${(stats.electronics || 5890).toLocaleString()}+`,
                icon: <Smartphone className="w-4 h-4" />,
              },
              {
                label: t("stats.trade"),
                val: `${stats.trade_success_rate || 100}%`,
                icon: <TrendingUp className="w-4 h-4" />,
              },
            ].map((stat, i) => (
              <div
                key={i}
                style={{ animationDelay: `${i * 0.12}s` }}
                className="
                  relative flex flex-col items-center gap-1.5 sm:gap-2 py-3 sm:py-4
                  rounded-2xl backdrop-blur-md
                  bg-white/70 dark:bg-white/[0.04]
                  border border-slate-200 dark:border-white/[0.06]
                  hover:border-[#00A86B]/40
                  [transform-style:preserve-3d] transform-gpu
                  hover:[transform:perspective(1200px)_rotateY(-12deg)_rotateX(6deg)_translateZ(32px)]
                  hover:shadow-[0_32px_56px_rgba(0,168,107,0.25)]
                  hover:ring-1 hover:ring-[#00A86B]/20
                  hover:bg-white/90 dark:hover:bg-white/[0.08]
                  hover:backdrop-blur-2xl
                  shadow-sm dark:shadow-none
                  transition-all duration-500 ease-out group cursor-default
                  animate-fade-in-up
                  active:scale-[0.97]
                "
              >
                <div className="w-9 h-9 rounded-xl bg-emerald-50 dark:bg-malazone-green/10 flex items-center justify-center text-malazone-green dark:text-malazone-green animate-float group-hover:animate-none group-hover:bg-[#00A86B] group-hover:text-white group-hover:scale-125 group-hover:-rotate-6 group-hover:shadow-[0_6px_16px_rgba(0,168,107,0.3)] transition-all duration-500">
                  {stat.icon}
                </div>
                <span className="text-xl sm:text-2xl lg:text-3xl font-black leading-none tracking-tighter text-malazone-navy dark:text-white group-hover:text-[#00A86B] group-hover:scale-110 group-hover:-translate-y-0.5 transition-all duration-500">
                  {stat.val}
                </span>
                <span className="text-[10px] sm:text-[11px] font-bold leading-relaxed tracking-wider uppercase text-center px-1 text-malazone-navy dark:text-slate-400 group-hover:text-[#00A86B] group-hover:tracking-[0.2em] transition-all duration-500 font-sans antialiased">
                  {stat.label}
                </span>
                <span className="absolute bottom-0 left-1/2 -translate-x-1/2 w-0 h-0.5 bg-[#00A86B]/60 rounded-full group-hover:w-8 transition-all duration-500" />
                <span className="absolute inset-0 rounded-2xl bg-gradient-to-br from-white/60 via-transparent to-[#00A86B]/5 dark:from-white/[0.02] dark:to-[#00A86B]/10 opacity-0 group-hover:opacity-100 transition-opacity duration-700 pointer-events-none" />
              </div>
            ))}
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
