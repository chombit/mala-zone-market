/**
 * Hero.tsx
 * Malazone.com — Single-Screen Elite Hero with Full Dual-Theme Engine
 * Dark Mode: Deep midnight carbon | Light Mode: Crisp alabaster white
 * © 2026 Malazone Technologies PLC | Founder: Luwa Tesemma Kakawo
 */

import React, { useState, useEffect, useCallback } from "react";
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
} from "lucide-react";
import { useLanguage } from "@/contexts/ZoneLanguageContext";

/* ────────────────────────────────────────────
   Slide Data
   ──────────────────────────────────────────── */
const HERO_SLIDES = [
  {
    image:
      "https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=1600&q=90&fm=webp",
    pillar: "nav.cat1",
    id: "property",
    icon: Building2,
    label_en: "Property",
    label_am: "ቤት እና መሬት",
  },
  {
    image:
      "https://images.unsplash.com/photo-1494976388531-d1058494cdd8?w=1600&q=90&fm=webp",
    pillar: "nav.cat2",
    id: "motors",
    icon: Car,
    label_en: "Motors & EV",
    label_am: "መኪና ዞን",
  },
  {
    image:
      "https://images.unsplash.com/photo-1551882547-ff40c63fe5fa?w=1600&q=90&fm=webp",
    pillar: "nav.cat3",
    id: "stay",
    icon: Hotel,
    label_en: "Rooms & Halls",
    label_am: "አዳራሽ ዞን",
  },
  {
    image:
      "https://images.unsplash.com/photo-1519741497674-611481863552?w=1600&q=90&fm=webp",
    pillar: "nav.cat4",
    id: "ceremony",
    icon: Music,
    label_en: "Ceremony & DJ",
    label_am: "ሰርግ ዞን",
  },
  {
    image:
      "https://images.unsplash.com/photo-1504917595217-d4dc5ebe6122?w=1600&q=90&fm=webp",
    pillar: "nav.cat5",
    id: "heavy",
    icon: Truck,
    label_en: "Heavy Machinery",
    label_am: "ማሽነሪ ዞን",
  },
];

/* ────────────────────────────────────────────
   Types
   ──────────────────────────────────────────── */
interface Stats {
  clients: number;
  listings: number;
  vehicles: number;
  trade_success_rate: number;
}

interface HeroProps {
  onCategoryChange: (cat: string) => void;
}

/* ────────────────────────────────────────────
   Component
   ──────────────────────────────────────────── */
const Hero: React.FC<HeroProps> = ({ onCategoryChange }) => {
  const { t } = useLanguage();
  const [activeSlide, setActiveSlide] = useState(0);
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [searchLocation, setSearchLocation] = useState("loc.hawassa");
  const [searchIntent, setSearchIntent] = useState("intent.buy");
  const [stats, setStats] = useState<Stats>({
    clients: 1003,
    listings: 2547,
    vehicles: 1412,
    trade_success_rate: 100,
  });

  /* Auto-advance slideshow */
  const nextSlide = useCallback(() => {
    setActiveSlide((prev) => (prev + 1) % HERO_SLIDES.length);
  }, []);

  useEffect(() => {
    const timer = setInterval(nextSlide, 6500);
    return () => clearInterval(timer);
  }, [nextSlide]);

  /* Fetch live stats */
  useEffect(() => {
    const fetchStats = async () => {
      try {
        const response = await fetch("/api/stats");
        const result = await response.json();
        if (result.success) setStats(result.data);
      } catch {
        // Silently use static fallback values — network unavailable
      }
    };
    fetchStats();
  }, []);

  const handleSearch = () => {
    onCategoryChange(selectedCategory);
    const grid = document.getElementById("listings-grid");
    if (grid) grid.scrollIntoView({ behavior: "smooth" });
  };

  const handlePillClick = (categoryId: string, slideIndex?: number) => {
    setSelectedCategory(categoryId);
    if (slideIndex !== undefined) setActiveSlide(slideIndex);
    onCategoryChange(categoryId);
    const grid = document.getElementById("listings-grid");
    if (grid) grid.scrollIntoView({ behavior: "smooth" });
  };

  /* ── Active pill style ─────────────────────────────────────────── */
  const activePillClass =
    "bg-malazone-green text-black font-black shadow-[0_0_20px_rgba(0,168,107,0.3)]";
  const inactivePillClass =
    "bg-white dark:bg-white/[0.04] text-slate-600 dark:text-slate-400 " +
    "border border-slate-200 dark:border-white/[0.06] " +
    "hover:border-malazone-green/40 dark:hover:border-malazone-green/30 " +
    "hover:text-slate-900 dark:hover:text-slate-200 " +
    "hover:bg-slate-50 dark:hover:bg-white/[0.07]";

  /* ── Select field shared class ─────────────────────────────────── */
  const selectClass =
    "w-full bg-transparent text-sm font-semibold focus:outline-none appearance-none cursor-pointer " +
    "text-slate-900 dark:text-white";

  return (
    <section
      id="hero-section"
      className="
        relative w-full min-h-screen
        bg-slate-50 dark:bg-slate-950
        flex flex-col overflow-hidden
        transition-colors duration-500
      "
    >
      {/* ── Background Carousel ──────────────────────────────────── */}
      <div className="absolute inset-0 z-0 overflow-hidden">
        {HERO_SLIDES.map((slide, i) => (
          <div
            key={i}
            className={`absolute inset-0 transition-opacity duration-[1400ms] ease-in-out ${i === activeSlide ? "opacity-100" : "opacity-0"
              }`}
          >
            <div
              className="w-full h-full bg-cover bg-center bg-no-repeat transition-transform duration-[7000ms]"
              style={{
                backgroundImage: `url(${slide.image})`,
                transform: i === activeSlide ? "scale(1)" : "scale(1.1)",
              }}
            />
          </div>
        ))}

        {/* ── Theme-adaptive gradient overlay ─────── */}
        {/* Dark mode: from-slate-950 | Light mode: from-slate-50 */}
        <div className="absolute inset-0 bg-gradient-to-t from-slate-50 via-slate-50/20 to-slate-50/40 dark:from-slate-950 dark:via-slate-950/40 dark:to-slate-950/60 transition-colors duration-500" />
        <div className="absolute inset-0 bg-gradient-to-r from-slate-50/50 via-transparent to-slate-50/50 dark:from-slate-950/40 dark:via-transparent dark:to-slate-950/40 transition-colors duration-500" />
      </div>

      {/* ── Ambient Glow Orbs ─────────────────────────────────────── */}
      <div className="absolute inset-0 z-[1] overflow-hidden pointer-events-none">
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
      <div className="relative z-10 flex-1 flex flex-col items-center justify-center px-5 sm:px-8 lg:px-12 pt-32 pb-10">
        <div className="w-full max-w-6xl flex flex-col items-center gap-6 sm:gap-7">

          {/* ── Tagline Sparkle Row */}
          <div className="flex items-center gap-2.5 animate-fade-in-up">
            <Sparkles className="w-3.5 h-3.5 text-malazone-green animate-pulse" />
            <span className="text-malazone-green font-bold text-[10px] sm:text-xs uppercase tracking-[0.35em]">
              {t("hero.tagline")}
            </span>
            <Sparkles className="w-3.5 h-3.5 text-malazone-green animate-pulse" />
          </div>

          {/* ── Brand Headline: MALA (green) + ZONE (theme-adaptive) */}
          <h1 className="text-5xl sm:text-7xl lg:text-[7.5rem] font-black leading-[0.85] tracking-tighter uppercase italic text-center animate-fade-in-up">
            <span className="text-malazone-green drop-shadow-[0_0_40px_rgba(0,168,107,0.3)]">
              {t("brand.mala")}
            </span>
            <span className="not-italic text-slate-900 dark:text-white drop-shadow-none dark:drop-shadow-[0_2px_30px_rgba(255,255,255,0.06)] transition-colors duration-500">
              {t("brand.zone")}
            </span>
          </h1>

          {/* ── Sub-headline */}
          <p className="text-sm sm:text-base lg:text-lg font-medium tracking-tight max-w-2xl mx-auto text-center leading-relaxed animate-fade-in-up text-slate-600 dark:text-slate-400 transition-colors duration-500">
            {t("hero.subtitle")}
          </p>

          {/* ── Inline Search Bar ─────────────────────────────────── */}
          <div className="w-full max-w-4xl animate-fade-in-up">
            <div
              className="
                flex flex-col sm:flex-row items-stretch
                rounded-2xl sm:rounded-full overflow-hidden
                border transition-all duration-500
                bg-white dark:bg-slate-900/90
                border-slate-200 dark:border-white/[0.08]
                shadow-xl dark:shadow-[0_8px_40px_rgba(0,0,0,0.4)]
                hover:border-malazone-green/30 dark:hover:border-malazone-green/20
              "
            >
              {/* Zone Select */}
              <div className="relative flex-1 group border-b sm:border-b-0 sm:border-r border-slate-100 dark:border-white/[0.06]">
                <select
                  value={selectedCategory}
                  onChange={(e) => setSelectedCategory(e.target.value)}
                  className={`${selectClass} px-5 sm:px-6 py-4`}
                >
                  <option className="bg-white dark:bg-slate-900 text-slate-900 dark:text-white" value="all">
                    {t("cat.all" as any)} — {t("zone.all" as any)}
                  </option>
                  {HERO_SLIDES.map((s, i) => (
                    <option
                      key={i}
                      className="bg-white dark:bg-slate-900 text-slate-900 dark:text-white"
                      value={s.id}
                    >
                      {t(s.pillar as any)}
                    </option>
                  ))}
                </select>
                <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400 pointer-events-none" />
              </div>

              {/* Location Select */}
              <div className="relative flex-1 group border-b sm:border-b-0 sm:border-r border-slate-100 dark:border-white/[0.06]">
                <MapPin className="absolute left-4 sm:left-5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-malazone-green" />
                <select
                  value={searchLocation}
                  onChange={(e) => setSearchLocation(e.target.value)}
                  className={`${selectClass} pl-10 sm:pl-11 pr-8 py-4`}
                >
                  {[
                    "loc.hawassa",
                    "loc.yirgalem",
                    "loc.aleta",
                    "loc.bensa",
                    "loc.chuko",
                  ].map((l, i) => (
                    <option
                      key={i}
                      className="bg-white dark:bg-slate-900 text-slate-900 dark:text-white"
                      value={l}
                    >
                      {t(l as any)}
                    </option>
                  ))}
                </select>
                <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400 pointer-events-none" />
              </div>

              {/* Intent Select */}
              <div className="relative flex-1 group border-b sm:border-b-0 sm:border-r border-slate-100 dark:border-white/[0.06]">
                <select
                  value={searchIntent}
                  onChange={(e) => setSearchIntent(e.target.value)}
                  className={`${selectClass} px-5 sm:px-6 py-4`}
                >
                  {["intent.buy", "intent.rent", "intent.hourly"].map((intent, i) => (
                    <option
                      key={i}
                      className="bg-white dark:bg-slate-900 text-slate-900 dark:text-white"
                      value={intent}
                    >
                      {t(intent as any)}
                    </option>
                  ))}
                </select>
                <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400 pointer-events-none" />
              </div>

              {/* Search CTA Button */}
              <button
                onClick={handleSearch}
                className="
                  flex items-center justify-center gap-2.5
                  px-8 py-4 sm:rounded-r-full
                  bg-malazone-green hover:bg-malazone-green/90
                  text-black font-black
                  transition-all duration-300 group
                "
              >
                <Search className="w-4 h-4 group-hover:rotate-12 transition-transform duration-300" />
                <span className="text-xs font-black uppercase tracking-[0.2em] whitespace-nowrap">
                  {t("search.btn")}
                </span>
              </button>
            </div>
          </div>

          {/* ── Category Icon Pills ───────────────────────────────── */}
          <div className="flex items-center justify-center flex-wrap gap-2.5 sm:gap-3 animate-fade-in-up">
            {/* "All" pill */}
            <button
              onClick={() => {
                setSelectedCategory("all");
                onCategoryChange("all");
              }}
              className={`flex items-center gap-2 px-5 py-2.5 rounded-full text-[10px] font-black uppercase tracking-[0.15em] transition-all duration-300 ${selectedCategory === "all" ? activePillClass : inactivePillClass
                }`}
            >
              {t("cat.all" as any)}
            </button>

            {/* Zone category pills */}
            {HERO_SLIDES.map((slide, i) => {
              const IconComp = slide.icon;
              return (
                <button
                  key={i}
                  onClick={() => handlePillClick(slide.id, i)}
                  className={`flex items-center gap-2 px-5 py-2.5 rounded-full text-[10px] font-black uppercase tracking-[0.15em] transition-all duration-300 ${selectedCategory === slide.id
                    ? activePillClass
                    : inactivePillClass
                    }`}
                >
                  <IconComp className="w-3 h-3 shrink-0" />
                  <span className="whitespace-nowrap">{t(slide.pillar as any)}</span>
                </button>
              );
            })}
          </div>

          {/* ── Stats Strip ─────────────────────────────────────────── */}
          <div className="w-full max-w-3xl grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4 animate-fade-in-up">
            {[
              {
                label: t("stats.clients"),
                val: `${stats.clients.toLocaleString()}+`,
                icon: <Users className="w-4 h-4" />,
              },
              {
                label: t("stats.listings"),
                val: `${stats.listings.toLocaleString()}+`,
                icon: <ListChecks className="w-4 h-4" />,
              },
              {
                label: t("stats.vehicles"),
                val: `${stats.vehicles.toLocaleString()}+`,
                icon: <Car className="w-4 h-4" />,
              },
              {
                label: t("stats.trade"),
                val: `${stats.trade_success_rate}%`,
                icon: <TrendingUp className="w-4 h-4" />,
              },
            ].map((stat, i) => (
              <div
                key={i}
                className="
                  flex flex-col items-center gap-1.5 sm:gap-2 py-4 sm:py-5
                  rounded-2xl backdrop-blur-md
                  bg-white dark:bg-white/[0.04]
                  border border-slate-200 dark:border-white/[0.06]
                  hover:border-malazone-green/30 dark:hover:border-malazone-green/20
                  hover:bg-slate-50 dark:hover:bg-white/[0.06]
                  shadow-sm dark:shadow-none
                  transition-all duration-500 group cursor-default
                "
              >
                <div className="w-8 h-8 rounded-lg bg-malazone-green/10 flex items-center justify-center text-malazone-green group-hover:scale-110 group-hover:bg-malazone-green/15 transition-all duration-500">
                  {stat.icon}
                </div>
                <span className="text-xl sm:text-2xl lg:text-3xl font-black leading-none tracking-tighter transition-colors duration-500 text-slate-900 dark:text-white">
                  {stat.val}
                </span>
                <span className="text-[7px] sm:text-[8px] font-bold tracking-[0.15em] uppercase text-center px-1 transition-colors duration-500 text-slate-500 dark:text-slate-500">
                  {stat.label}
                </span>
              </div>
            ))}
          </div>

          {/* ── Slideshow Dot Indicators ──────────────────────────── */}
          <div className="flex items-center justify-center gap-2">
            {HERO_SLIDES.map((_, i) => (
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