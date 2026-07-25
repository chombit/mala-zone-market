/**
 * MalaZoneTestimonials.tsx
 * Malazone.com — Ultra-Modern "Voices of malazone" Testimonials Section
 * Touch-swipe carousel | 3D Card Physics | Fluid Accent Strips
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
      className="relative flex flex-col bg-white dark:bg-slate-900 border border-slate-200/70 dark:border-white/5 rounded-[28px] p-5 sm:p-7 overflow-hidden select-none cursor-default"
      style={{
        animation: `slideUpCard 0.55s cubic-bezier(0.16,1,0.3,1) ${animationDelay}ms both`,
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
      {/* Ambient inner glow on hover */}
      <div
        className="absolute inset-0 rounded-[28px] pointer-events-none transition-opacity duration-500"
        style={{
          opacity: isHovered ? 1 : 0,
          background: `radial-gradient(ellipse at 50% 0%, ${card.accentHex}0D 0%, transparent 70%)`,
        }}
      />

      {/* Large background quote mark */}
      <div
        className="absolute top-4 right-5 pointer-events-none transition-opacity duration-500"
        style={{ opacity: isHovered ? 0.12 : 0.05 }}
      >
        <Quote className="w-12 h-12 sm:w-16 sm:h-16" style={{ color: card.accentHex }} />
      </div>

      {/* Avatar circle */}
      <div className="flex justify-center mb-4 sm:mb-5 relative z-10">
        <div
          className="w-14 h-14 sm:w-[70px] sm:h-[70px] rounded-full bg-[#0B132B] text-2xl sm:text-3xl flex items-center justify-center shadow-lg border-3 sm:border-4 border-white"
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

      {/* Name & Role */}
      <div className="text-center space-y-1 relative z-10">
        <h4
          className="text-xs sm:text-sm font-black leading-snug tracking-tight text-[#0B132B] dark:text-white"
          style={{
            color: isHovered ? card.accentHex : undefined,
            transition: 'color 400ms cubic-bezier(0.16,1,0.3,1)',
          }}
        >
          {lang === 'am' ? card.nameAm : card.nameEn}
        </h4>
        <p className="text-[9px] sm:text-[10px] font-black uppercase tracking-[0.18em] leading-relaxed text-slate-500 dark:text-slate-400">
          {lang === 'am' ? card.roleAm : card.roleEn}
        </p>
      </div>

      {/* 5-Star rating row */}
      <div className="flex items-center justify-center gap-0.5 sm:gap-1 mt-2 sm:mt-3 relative z-10">
        {[...Array(card.stars)].map((_, si) => (
          <Star key={si} className="w-3 h-3 sm:w-3.5 sm:h-3.5 fill-amber-400 text-amber-400" />
        ))}
      </div>
    </article>
  );
};

/* ─────────────────────────────────────────────────────────────
   Main Component — Touch-Swipe Infinite Loop Carousel
   ───────────────────────────────────────────────────────────── */
export function MalaZoneTestimonials() {
  const { language } = useLanguage();
  const lang = language === 'amharic' ? 'am' : 'en';

  const [current, setCurrent] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const [isTransitioning, setIsTransitioning] = useState(true);
  const [reviews, setReviews] = useState(FALLBACK_REVIEWS);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const trackRef = useRef<HTMLDivElement>(null);

  /* Touch / swipe state */
  const touchStartX = useRef(0);
  const touchStartY = useRef(0);
  const touchDeltaX = useRef(0);
  const isSwiping = useRef(false);
  const [swipeOffset, setSwipeOffset] = useState(0);

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

  /* ── Responsive: 3 cards on lg, 2 on md, 1 on mobile ── */
  const [perView, setPerView] = useState(3);
  useEffect(() => {
    const update = () => {
      if (window.innerWidth >= 1024) setPerView(3);
      else if (window.innerWidth >= 640) setPerView(2);
      else setPerView(1);
    };
    update();
    window.addEventListener('resize', update);
    return () => window.removeEventListener('resize', update);
  }, []);

  const totalCards = reviews.length;
  const extendedCards = [...reviews.slice(-perView), ...reviews, ...reviews.slice(0, perView)];
  const cardWidthPercent = 100 / perView;
  const gapPx = window.innerWidth < 640 ? 12 : 20;

  const getTranslateX = (idx: number, extraOffset = 0) => {
    const base = -((idx + perView) * cardWidthPercent + extraOffset);
    return `calc(${base}% - ${(idx + perView) * gapPx}px)`;
  };

  const goTo = useCallback((idx: number, animate = true) => {
    setIsTransitioning(animate);
    setSwipeOffset(0);
    setCurrent(idx);
  }, []);

  const goNext = useCallback(() => {
    setIsTransitioning(true);
    setSwipeOffset(0);
    setCurrent(prev => prev + 1);
  }, []);

  const goPrev = useCallback(() => {
    setIsTransitioning(true);
    setSwipeOffset(0);
    setCurrent(prev => prev - 1);
  }, []);

  /* ── Handle seamless infinite loop jump ── */
  useEffect(() => {
    if (!isTransitioning) return;
    const handleTransitionEnd = () => {
      if (current >= totalCards) {
        setIsTransitioning(false);
        setCurrent(0);
      } else if (current < 0) {
        setIsTransitioning(false);
        setCurrent(totalCards - 1);
      }
    };
    const track = trackRef.current;
    if (track) {
      track.addEventListener('transitionend', handleTransitionEnd);
      return () => track.removeEventListener('transitionend', handleTransitionEnd);
    }
  }, [current, totalCards, isTransitioning]);

  /* ── Auto-slide every 4s ── */
  useEffect(() => {
    if (timerRef.current) clearTimeout(timerRef.current);
    if (!isPaused) {
      timerRef.current = setTimeout(goNext, 4000);
    }
    return () => { if (timerRef.current) clearTimeout(timerRef.current); };
  }, [isPaused, current, goNext]);

  /* ── Touch/Swipe handlers ── */
  const SWIPE_THRESHOLD = 50;

  const onTouchStart = useCallback((e: React.TouchEvent) => {
    touchStartX.current = e.touches[0].clientX;
    touchStartY.current = e.touches[0].clientY;
    touchDeltaX.current = 0;
    isSwiping.current = false;
    setIsTransitioning(false);
  }, []);

  const onTouchMove = useCallback((e: React.TouchEvent) => {
    const dx = e.touches[0].clientX - touchStartX.current;
    const dy = e.touches[0].clientY - touchStartY.current;

    if (!isSwiping.current && Math.abs(dx) > Math.abs(dy) && Math.abs(dx) > 10) {
      isSwiping.current = true;
    }

    if (isSwiping.current) {
      e.preventDefault();
      touchDeltaX.current = dx;
      const containerWidth = trackRef.current?.parentElement?.clientWidth || 1;
      const offsetPercent = (dx / containerWidth) * 100;
      setSwipeOffset(offsetPercent);
    }
  }, []);

  const onTouchEnd = useCallback(() => {
    setIsTransitioning(true);

    if (Math.abs(touchDeltaX.current) > SWIPE_THRESHOLD) {
      if (touchDeltaX.current < 0) {
        goNext();
      } else {
        goPrev();
      }
    } else {
      setSwipeOffset(0);
    }

    isSwiping.current = false;
    touchDeltaX.current = 0;
  }, [goNext, goPrev]);

  const normalizedCurrent = ((current % totalCards) + totalCards) % totalCards;

  const t = {
    am: {
      titlePart1: 'የማላዞን',
      titlePart2: 'እውነተኛ ድምፆች',
      subText: 'ወኪሎች፣ ሻጮች፣ እና ዓለምአቀፍ ባለሀብቶች ምስክርነት።',
    },
    en: {
      titlePart1: 'Voices of',
      titlePart2: 'malazone',
      subText: 'Real feedback from certified agents, asset owners, and diaspora investors.',
    },
  }[lang];

  const navBtnClass =
    'flex items-center justify-center w-10 h-10 sm:w-11 sm:h-11 rounded-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-white/5 shadow-md text-[#0B132B] dark:text-white transition-all duration-300 hover:border-[#00A86B]/50 hover:text-[#00A86B] hover:shadow-[0_4px_20px_rgba(0,168,107,0.2)] active:scale-90 focus:outline-none focus-visible:ring-2 focus-visible:ring-[#00A86B]/50';

  return (
    <section
      id="testimonials"
      className="relative w-full bg-slate-50 dark:bg-slate-950 pt-8 pb-16 sm:pb-20 lg:pb-24 px-4 sm:px-8 lg:px-16 font-sans antialiased overflow-hidden transition-colors duration-300"
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
    >
      {/* Soft ambient background blobs */}
      <div
        className="absolute -top-16 -left-20 w-72 h-72 rounded-full blur-3xl pointer-events-none hidden md:block"
        style={{ background: 'radial-gradient(circle, rgba(0,168,107,0.08) 0%, transparent 70%)' }}
      />
      <div
        className="absolute -bottom-16 -right-20 w-80 h-80 rounded-full blur-3xl pointer-events-none hidden md:block"
        style={{ background: 'radial-gradient(circle, rgba(124,58,237,0.07) 0%, transparent 70%)' }}
      />

      <div className="max-w-6xl mx-auto relative z-10">

        {/* ═══ Section Header ═══ */}
        <div className="flex flex-col items-center text-center space-y-2 sm:space-y-2.5 mb-8 sm:mb-10">
          <h2 className="text-xl sm:text-3xl lg:text-3.5xl font-black tracking-tight leading-none flex items-center justify-center text-[#0B132B] dark:text-white">
            {lang === 'en' ? (
              <>
                <span className="pr-2">Voices of</span>
                <span style={{ color: '#00A86B' }} className="font-extrabold lowercase">malazone</span>
              </>
            ) : (
              <>
                <span className="pr-2">የማላዞን</span>
                <span style={{ color: '#00A86B' }} className="font-extrabold">እውነተኛ ድምፆች</span>
              </>
            )}
          </h2>
          <p className="text-xs sm:text-sm text-slate-400 font-bold leading-relaxed max-w-xl mx-auto pt-0.5">
            {t.subText}
          </p>
          <div className="w-12 h-[3px] bg-[#00A86B] rounded-full mx-auto mt-2" />
        </div>

        {/* ═══ Carousel ═══ */}
        <div className="relative">

          {/* Prev arrow — hidden on mobile, touch replaces it */}
          <button
            onClick={goPrev}
            aria-label="Previous testimonials"
            className={`absolute left-[-16px] sm:left-[-28px] top-1/2 -translate-y-1/2 z-20 ${navBtnClass} hidden sm:flex`}
          >
            <ChevronLeft className="w-5 h-5" />
          </button>

          {/* Cards sliding track with touch */}
          <div
            className="overflow-hidden touch-pan-y"
            onTouchStart={onTouchStart}
            onTouchMove={onTouchMove}
            onTouchEnd={onTouchEnd}
          >
            <div
              ref={trackRef}
              className="flex"
              style={{
                gap: `${gapPx}px`,
                transform: swipeOffset !== 0
                  ? getTranslateX(current, swipeOffset)
                  : getTranslateX(current),
                transition: isTransitioning
                  ? 'transform 700ms cubic-bezier(0.25, 0.46, 0.45, 0.94)'
                  : 'none',
              }}
            >
              {extendedCards.map((card, i) => (
                <div
                  key={`ext-${i}-${card.id}`}
                  className="shrink-0"
                  style={{ width: `calc(${cardWidthPercent}% - ${gapPx * (perView - 1) / perView}px)` }}
                >
                  <TestimonialCard card={card} lang={lang} animationDelay={0} />
                </div>
              ))}
            </div>
          </div>

          {/* Next arrow — hidden on mobile */}
          <button
            onClick={goNext}
            aria-label="Next testimonials"
            className={`absolute right-[-16px] sm:right-[-28px] top-1/2 -translate-y-1/2 z-20 ${navBtnClass} hidden sm:flex`}
          >
            <ChevronRight className="w-5 h-5" />
          </button>
        </div>

        {/* ═══ Dot Indicators + Progress ═══ */}
        <div className="flex flex-col items-center gap-4 mt-8 sm:mt-10">
          <div className="flex items-center justify-center gap-2 sm:gap-2.5">
            {Array.from({ length: totalCards }).map((_, i) => (
              <button
                key={i}
                onClick={() => goTo(i)}
                aria-label={`Go to slide ${i + 1}`}
                className="rounded-full transition-all duration-400 focus:outline-none focus-visible:ring-2 focus-visible:ring-[#00A86B]/50"
                style={{
                  width: i === normalizedCurrent ? '28px' : '8px',
                  height: '8px',
                  background: i === normalizedCurrent ? '#00A86B' : '#cbd5e1',
                  boxShadow: i === normalizedCurrent ? '0 0 10px rgba(0,168,107,0.55)' : 'none',
                  transition: 'all 400ms cubic-bezier(0.16,1,0.3,1)',
                }}
              />
            ))}
          </div>

          {/* Auto-play Progress Bar */}
          <div className="w-[140px] sm:w-[180px] h-[2px] bg-slate-200 dark:bg-slate-800 rounded-full overflow-hidden">
            <div
              key={current}
              className="h-full rounded-full"
              style={{
                background: 'linear-gradient(to right, #00A86B88, #00A86B)',
                animation: isPaused ? 'none' : 'testimonialsProgress 4s linear forwards',
              }}
            />
          </div>
        </div>
      </div>

      {/* Keyframe Animations */}
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
