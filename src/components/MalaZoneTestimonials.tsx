/**
 * MalaZoneTestimonials.tsx
 * Malazone.com — Ultra-Modern "Voices of malazone" Testimonials Section
 * Pure Light Theme | 3D Card Physics | Fluid Accent Strips | Corporate Typography
 * © 2026 Malazone Technologies PLC
 */

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Star, Sparkles, ChevronLeft, ChevronRight, Quote, Loader2 } from 'lucide-react';
import { useLanguage } from '@/contexts/ZoneLanguageContext';

/* ─────────────────────────────────────────────────────────────
   Data Layer
   ───────────────────────────────────────────────────────────── */
const FALLBACK_REVIEWS = [
  {
    id: 1,
    nameAm: 'ምሕረት ነጋሽ',
    nameEn: 'Mihret Negash',
    roleAm: 'ይፋዊ ማላ-ወኪል — ሐዋሳ',
    roleEn: 'Official Mala-Agent — Hawassa',
    textAm: 'የኮሚሽን ገቢዬ ቀጥታ በባንክ አካውንቴ ይደርሰኛል። ለወጣቶች ፍጹም አስተማማኝ የሥራ ምንጭ ሆኗል።',
    textEn: '"My commission payouts arrive directly into my bank account every day. The most reliable income stream for Ethiopian youth."',
    avatar: '👨‍💻',
    stars: 5,
    accentHex: '#00A86B',
    accentRgb: '0,168,107',
    accentClass: 'from-emerald-400 to-[#00A86B]',
    glowClass: 'rgba(0,168,107,0.3)',
    accentLight: '#d1fae5',
  },
  {
    id: 2,
    nameAm: 'ፈይሳ ገመቹ',
    nameEn: 'Fayisa Gemechu',
    roleAm: 'የከባድ ማሽነሪ ባለቤት — ይርጋለም',
    roleEn: 'Heavy Machinery Owner — Yirgalem',
    textAm: 'ማሽነሪዎቼን ያለምንም ደላላ ጣልቃ-ገብነት ለሥራ ፈላጊዎች አከራይቻለሁ። ሲስተሙ ደህንነቱ የተረጋገጠ ነው።',
    textEn: '"I leased my construction machinery directly to clients without broker fees. The system guarantees absolute security."',
    avatar: '🏗️',
    stars: 5,
    accentHex: '#0284c7',
    accentRgb: '2,132,199',
    accentClass: 'from-sky-400 to-sky-600',
    glowClass: 'rgba(2,132,199,0.3)',
    accentLight: '#e0f2fe',
  },
  {
    id: 3,
    nameAm: 'በርኮት ኪዳኔ',
    nameEn: 'Barkot Kidane',
    roleAm: 'የዲያስፖራ ባለሀብት — አሜሪካ / ኢትዮጵያ',
    roleEn: 'Diaspora Investor — USA / Ethiopia',
    textAm: 'malazone ላይ የተረጋገጡ ህጋዊ ካርታ ማህደሮችን ካየሁ በኋላ ያለምንም ፍርሃት ቤት ገዛሁ።',
    textEn: '"After reviewing verified legal deed records on malazone, I completed my property purchase with zero friction."',
    avatar: '🌐',
    stars: 5,
    accentHex: '#7c3aed',
    accentRgb: '124,58,237',
    accentClass: 'from-violet-400 to-violet-600',
    glowClass: 'rgba(124,58,237,0.3)',
    accentLight: '#ede9fe',
  },
  {
    id: 4,
    nameAm: 'ሰላም ተፈራ',
    nameEn: 'Selam Tefera',
    roleAm: 'የሾውሩም ወኪል — አዲስ አበባ',
    roleEn: 'Showroom Agent — Addis Ababa',
    textAm: 'ተሽከርካሪ ዝርዝሬን malazone ላይ ምዝገባ አድርጌ በሶስት ቀን ሸጣለሁ!',
    textEn: '"I listed my vehicle inventory on malazone and sold within three days. The platform is simply unmatched in reach and speed."',
    avatar: '🚗',
    stars: 5,
    accentHex: '#d97706',
    accentRgb: '217,119,6',
    accentClass: 'from-amber-400 to-amber-600',
    glowClass: 'rgba(217,119,6,0.3)',
    accentLight: '#fef3c7',
  },
  {
    id: 5,
    nameAm: 'ዳዊት ሲሳይ',
    nameEn: 'Dawit Sisay',
    roleAm: 'የሆቴል ባለቤት — ሀዋሳ',
    roleEn: 'Hotel Owner — Hawassa',
    textAm: 'የሆቴሌን ታሪፍ malazone ላይ ለጥፌ ቱሪስቶች ቀጥታ ያወራሉ። ምንም ደላላ የለም!',
    textEn: '"I posted my hotel rates on malazone and tourists now contact me directly. Zero middlemen, pure profit."',
    avatar: '🏨',
    stars: 5,
    accentHex: '#0891b2',
    accentRgb: '8,145,178',
    accentClass: 'from-cyan-400 to-cyan-600',
    glowClass: 'rgba(8,145,178,0.3)',
    accentLight: '#cffafe',
  },
  {
    id: 6,
    nameAm: 'አስቴር ወርቁ',
    nameEn: 'Aster Worku',
    roleAm: 'የእርሻ ቦታ ሻጭ — አርሲ',
    roleEn: 'Farmland Seller — Arsi',
    textAm: 'የእርሻ መሬቴን ህጋዊ ካርታ ጋር አስወዳደርሁ። ዋጋው ትክክለኛ ነበር፤ ግብይቱ ደህንነቱ የተጠበቀ ነው።',
    textEn: '"I listed my farmland with verified title deeds. The pricing was fair and the transaction was completely secure."',
    avatar: '🌾',
    stars: 5,
    accentHex: '#16a34a',
    accentRgb: '22,163,74',
    accentClass: 'from-green-400 to-green-600',
    glowClass: 'rgba(22,163,74,0.3)',
    accentLight: '#dcfce7',
  },
];

/* ─────────────────────────────────────────────────────────────
   Sub-component: Single Testimonial Card
   ───────────────────────────────────────────────────────────── */
interface CardProps {
  card: typeof FALLBACK_REVIEWS[0];
  lang: 'am' | 'en';
  animationDelay: number;
}

const TestimonialCard: React.FC<CardProps> = ({ card, lang, animationDelay }) => {
  const [isHovered, setIsHovered] = useState(false);

  return (
    <article
      className="relative flex flex-col bg-white dark:bg-slate-900 border border-slate-200/70 dark:border-white/5 rounded-[28px] p-7 overflow-hidden select-none cursor-default"
      style={{
        animation: `slideUpCard 0.55s cubic-bezier(0.16,1,0.3,1) ${animationDelay}ms both`,
        /* 3D card physics: cubic-bezier transition, 12px lift, 2% scale, glowing shadow */
        transition:
          'transform 500ms cubic-bezier(0.16,1,0.3,1), box-shadow 500ms cubic-bezier(0.16,1,0.3,1)',
        transform: isHovered
          ? 'translateY(-12px) scale(1.02)'
          : 'translateY(0px) scale(1)',
        boxShadow: isHovered
          ? `0 28px 60px rgba(0,0,0,0.10), 0 8px 24px rgba(${card.accentRgb},0.18)`
          : '0 4px 24px rgba(0,0,0,0.06)',
      }}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* ── Ambient inner glow on hover ── */}
      <div
        className="absolute inset-0 rounded-[28px] pointer-events-none transition-opacity duration-500"
        style={{
          opacity: isHovered ? 1 : 0,
          background: `radial-gradient(ellipse at 50% 0%, ${card.accentHex}0D 0%, transparent 70%)`,
        }}
      />

      {/* ── Large background quote mark ── */}
      <div
        className="absolute top-4 right-5 pointer-events-none transition-opacity duration-500"
        style={{ opacity: isHovered ? 0.12 : 0.05 }}
      >
        <Quote
          className="w-16 h-16"
          style={{ color: card.accentHex }}
        />
      </div>

      {/* ── Avatar circle ── */}
      <div className="flex justify-center mb-5 relative z-10">
        <div
          className="w-[70px] h-[70px] rounded-full bg-[#0B132B] text-3xl flex items-center justify-center shadow-lg border-4 border-white"
          style={{
            transition: 'box-shadow 500ms cubic-bezier(0.16,1,0.3,1), transform 500ms cubic-bezier(0.16,1,0.3,1)',
            boxShadow: isHovered
              ? `0 0 0 4px ${card.accentHex}33, 0 8px 20px rgba(0,0,0,0.18)`
              : '0 4px 12px rgba(0,0,0,0.14)',
            transform: isHovered ? 'scale(1.08)' : 'scale(1)',
          }}
          role="img"
          aria-label={lang === 'am' ? card.nameAm : card.nameEn}
        >
          {card.avatar}
        </div>
      </div>

      {/* ── Name & Role ── */}
      <div className="text-center space-y-1 relative z-10">
        <h4
          className="text-sm font-black leading-snug tracking-tight text-[#0B132B] dark:text-white"
          style={{
            color: isHovered ? card.accentHex : undefined,
            transition: 'color 400ms cubic-bezier(0.16,1,0.3,1)',
          }}
        >
          {lang === 'am' ? card.nameAm : card.nameEn}
        </h4>
        <p className="text-[10px] font-black uppercase tracking-[0.18em] leading-relaxed text-slate-500 dark:text-slate-400">
          {lang === 'am' ? card.roleAm : card.roleEn}
        </p>
      </div>

      {/* ── 5-Star rating row ── */}
      <div className="flex items-center justify-center gap-1 mt-3 relative z-10">
        {[...Array(card.stars)].map((_, si) => (
          <Star
            key={si}
            className="w-3.5 h-3.5 fill-amber-400 text-amber-400"
            style={{
              transition: `transform 300ms cubic-bezier(0.16,1,0.3,1) ${si * 40}ms`,
              transform: isHovered ? 'scale(1.2)' : 'scale(1)',
            }}
          />
        ))}
      </div>

      {/* ── Review text ── */}
      <p
        className="relative z-10 mt-4 mb-7 text-[13px] font-semibold leading-relaxed tracking-wide text-center px-1 text-[#0B132B] dark:text-slate-300"
      >
        {lang === 'am' ? card.textAm : card.textEn}
      </p>

      {/* ── FLUID EDGE ANCHOR LINE (bottom accent strip) ── */}
      {/* Neutral resting state → full glowing color track on hover */}
      <div className="absolute bottom-0 left-0 right-0 h-[4px] overflow-hidden rounded-b-[28px]">
        {/* Neutral resting bar */}
        <div
          className="absolute inset-0 bg-slate-200 dark:bg-slate-800 rounded-full transition-opacity duration-500"
          style={{ opacity: isHovered ? 0 : 1 }}
        />
        {/* Glowing colored track on hover */}
        <div
          className="absolute inset-0 rounded-full"
          style={{
            background: `linear-gradient(to right, ${card.accentHex}66, ${card.accentHex}, ${card.accentHex}AA)`,
            boxShadow: `0 0 12px 2px ${card.accentHex}88`,
            opacity: isHovered ? 1 : 0,
            transition: 'opacity 500ms cubic-bezier(0.16,1,0.3,1)',
          }}
        />
      </div>
    </article>
  );
};

/* ─────────────────────────────────────────────────────────────
   Main Component
   ───────────────────────────────────────────────────────────── */
export function MalaZoneTestimonials() {
  const { language } = useLanguage();
  const lang = language === 'amharic' ? 'am' : 'en';

  const [current, setCurrent] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const [progressKey, setProgressKey] = useState(0);
  const [reviews, setReviews] = useState(FALLBACK_REVIEWS);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    fetch('/api/site/testimonials')
      .then(res => res.json())
      .then(data => {
        if (data.success && Array.isArray(data.data) && data.data.length > 0) {
          setReviews(data.data.map((r: any) => ({
            id: r.id,
            nameAm: r.reviewer_name_am,
            nameEn: r.reviewer_name_en,
            roleAm: '',
            roleEn: '',
            textAm: r.text_am,
            textEn: r.text_en,
            avatar: r.avatar_emoji || '👤',
            stars: r.rating || 5,
            accentHex: r.accent_color || '#00A86B',
            accentRgb: '0,168,107',
            accentClass: 'from-emerald-400 to-[#00A86B]',
            glowClass: 'rgba(0,168,107,0.3)',
            accentLight: '#d1fae5',
          })));
        }
      })
      .catch(() => {});
  }, []);

  /* ── Responsive: 3 cards/slide on md+, 1 on mobile ── */
  const [perSlide, setPerSlide] = useState(3);
  useEffect(() => {
    const update = () => setPerSlide(window.innerWidth >= 768 ? 3 : 1);
    update();
    window.addEventListener('resize', update);
    return () => window.removeEventListener('resize', update);
  }, []);

  const totalSlides = Math.ceil(reviews.length / perSlide);

  const goTo = useCallback((idx: number) => {
    setCurrent(idx);
    setProgressKey(k => k + 1);
  }, []);

  const goNext = useCallback(() => goTo((current + 1) % totalSlides), [current, totalSlides, goTo]);
  const goPrev = useCallback(() => goTo((current - 1 + totalSlides) % totalSlides), [current, totalSlides, goTo]);

  /* ── Auto-slide every 4.5 s ── */
  useEffect(() => {
    if (timerRef.current) clearInterval(timerRef.current);
    if (!isPaused) {
      timerRef.current = setInterval(goNext, 4500);
    }
    return () => { if (timerRef.current) clearInterval(timerRef.current); };
  }, [isPaused, goNext]);

  const visibleCards = reviews.slice(current * perSlide, current * perSlide + perSlide);

  const t = {
    am: {
      badge: '✨ የተጠቃሚዎች ምስክርነት',
      titlePart1: 'የማላዞን',
      titlePart2: 'እውነተኛ ድምፆች',
      subText: 'ወኪሎች፣ ሻጮች፣ እና ዓለምአቀፍ ባለሀብቶች ምስክርነት።',
    },
    en: {
      badge: '✨ TRUSTED REVIEWS',
      titlePart1: 'Voices of',
      titlePart2: 'malazone',
      subText: 'Real feedback from certified agents, asset owners, and diaspora investors.',
    },
  }[lang];

  /* Navigation button shared classes */
  const navBtnClass =
    'flex items-center justify-center w-11 h-11 rounded-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-white/5 shadow-md text-[#0B132B] dark:text-white transition-all duration-300 hover:border-[#00A86B]/50 hover:text-[#00A86B] hover:shadow-[0_4px_20px_rgba(0,168,107,0.2)] active:scale-90 focus:outline-none focus-visible:ring-2 focus-visible:ring-[#00A86B]/50';

  return (
    <section
      id="testimonials"
      className="relative w-full bg-slate-50 dark:bg-slate-950 pt-8 pb-20 sm:pb-24 px-4 sm:px-8 lg:px-16 font-sans antialiased overflow-hidden transition-colors duration-300"
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
    >
      {/* ── Soft ambient background blobs (light theme) ── */}
      <div
        className="absolute -top-16 -left-20 w-72 h-72 rounded-full blur-3xl pointer-events-none hidden md:block"
        style={{ background: 'radial-gradient(circle, rgba(0,168,107,0.08) 0%, transparent 70%)' }}
      />
      <div
        className="absolute -bottom-16 -right-20 w-80 h-80 rounded-full blur-3xl pointer-events-none hidden md:block"
        style={{ background: 'radial-gradient(circle, rgba(124,58,237,0.07) 0%, transparent 70%)' }}
      />
      <div
        className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[300px] rounded-full blur-3xl pointer-events-none hidden lg:block"
        style={{ background: 'radial-gradient(ellipse, rgba(2,132,199,0.04) 0%, transparent 70%)' }}
      />

      <div className="max-w-6xl mx-auto relative z-10">

        {/* ══════════════════════════════════════════════
            Section Header — Polished
        ══════════════════════════════════════════════ */}
        <div className="flex flex-col items-center text-center space-y-2.5 mb-10">

          {/* Badge pill */}
          <div className="inline-flex items-center gap-1.5 bg-emerald-50 text-[#00A86B] border border-emerald-200/40 px-3 py-1 rounded-full text-[10px] sm:text-xs font-black uppercase tracking-wider">
            <Sparkles className="size-3.5 animate-pulse text-[#00A86B]" />
            <span>{t.badge}</span>
          </div>

          {/* Main heading — "Voices of malazone" with brand lock */}
          <h2 className="text-2xl sm:text-3.5xl font-black tracking-tight leading-none flex items-center justify-center text-[#0B132B] dark:text-white">
            {lang === 'en' ? (
              <>
                <span className="pr-2">Voices of</span>
                <span style={{ color: '#00A86B' }} className="font-extrabold lowercase">
                  malazone
                </span>
              </>
            ) : (
              <>
                <span className="pr-2">የማላዞን</span>
                <span style={{ color: '#00A86B' }} className="font-extrabold">እውነተኛ ድምፆች</span>
              </>
            )}
          </h2>

          {/* Sub-text with leading-relaxed for Ge'ez safety */}
          <p className="text-xs sm:text-sm text-slate-400 font-bold leading-relaxed max-w-xl mx-auto pt-0.5">
            {t.subText}
          </p>

          {/* Emerald brand accent line */}
          <div className="w-12 h-[3px] bg-[#00A86B] rounded-full mx-auto mt-2" />
        </div>

        {/* ══════════════════════════════════════════════
            Carousel Wrapper
        ══════════════════════════════════════════════ */}
        <div className="relative">

          {/* Prev arrow */}
          <button
            onClick={goPrev}
            aria-label="Previous testimonials"
            className={`absolute left-[-20px] sm:left-[-28px] top-1/2 -translate-y-1/2 z-20 ${navBtnClass}`}
          >
            <ChevronLeft className="w-5 h-5" />
          </button>

          {/* Cards viewport */}
          <div className="overflow-visible">
            <div
              className="grid gap-5"
              style={{
                gridTemplateColumns: `repeat(${perSlide}, 1fr)`,
              }}
            >
              {visibleCards.map((card, i) => (
                <TestimonialCard
                  key={`${current}-${card.id}`}
                  card={card}
                  lang={lang}
                  animationDelay={i * 90}
                />
              ))}
            </div>
          </div>

          {/* Next arrow */}
          <button
            onClick={goNext}
            aria-label="Next testimonials"
            className={`absolute right-[-20px] sm:right-[-28px] top-1/2 -translate-y-1/2 z-20 ${navBtnClass}`}
          >
            <ChevronRight className="w-5 h-5" />
          </button>
        </div>

        {/* ══════════════════════════════════════════════
            Dot Indicators
        ══════════════════════════════════════════════ */}
        <div className="flex items-center justify-center gap-2.5 mt-10">
          {Array.from({ length: totalSlides }).map((_, i) => (
            <button
              key={i}
              onClick={() => goTo(i)}
              aria-label={`Go to slide ${i + 1}`}
              className="rounded-full transition-all duration-400 focus:outline-none focus-visible:ring-2 focus-visible:ring-[#00A86B]/50"
              style={{
                width: i === current ? '32px' : '10px',
                height: '10px',
                background: i === current ? '#00A86B' : '#cbd5e1',
                boxShadow: i === current ? '0 0 10px rgba(0,168,107,0.55)' : 'none',
                transition: 'all 400ms cubic-bezier(0.16,1,0.3,1)',
              }}
            />
          ))}
        </div>

        {/* ══════════════════════════════════════════════
            Auto-play Progress Bar
        ══════════════════════════════════════════════ */}
        <div className="mt-5 max-w-[180px] mx-auto h-[2px] bg-slate-200 dark:bg-slate-800 rounded-full overflow-hidden">
          <div
            key={progressKey}
            className="h-full rounded-full"
            style={{
              background: 'linear-gradient(to right, #00A86B88, #00A86B)',
              animation: isPaused ? 'none' : 'testimonialsProgress 4.5s linear forwards',
            }}
          />
        </div>
      </div>

      {/* ══════════════════════════════════════════════
          Keyframe Animations
      ══════════════════════════════════════════════ */}
      <style>{`
        @keyframes testimonialsProgress {
          from { width: 0%; }
          to   { width: 100%; }
        }
        @keyframes slideUpCard {
          from {
            opacity: 0;
            transform: translateY(28px) scale(0.97);
          }
          to {
            opacity: 1;
            transform: translateY(0px) scale(1);
          }
        }
      `}</style>
    </section>
  );
}
