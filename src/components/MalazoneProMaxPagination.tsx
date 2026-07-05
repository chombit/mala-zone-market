/**
 * MalazoneProMaxPagination.tsx
 * Malazone.com — High-End Segment Navigation Bar
 * Pure Light Theme | 400ms Debounce | Green Active Accent | Ge'ez-Safe Spacing
 * © 2026 Malazone Technologies PLC
 */

import React, { useState, useRef, useCallback } from 'react';
import { ChevronLeft, ChevronRight, Sparkles } from 'lucide-react';

/* ─────────────────────────────────────────────────────────────
   Types
   ───────────────────────────────────────────────────────────── */
interface ProMaxPaginationProps {
  /** ISO language token: 'am' = Amharic | 'en' = English | 'sa' = Sidaamu Afoo */
  currentGlobalLang?: 'am' | 'en' | 'sa';
  /** Total number of listing records in the filtered result set */
  totalItems?: number;
  /** How many cards are rendered per page slice */
  itemsPerPage?: number;
  /** External page-change callback fired after debounce completes */
  onPageChange?: (page: number) => void;
}

/* ─────────────────────────────────────────────────────────────
   Bilingual / Trilingual String Map
   ───────────────────────────────────────────────────────────── */
const LABELS = {
  am: {
    prev: 'የበፊቱ',
    next: 'ቀጣዩ',
    page: 'ገፅ',
    of: 'ከ',
    summaryPrefix: 'በአጠቃላይ',
    summarySuffix: 'ማህደሮች ተገኝተዋል',
    lockMsg: 'ጥቂት ቆዩ…',
  },
  en: {
    prev: 'Prev',
    next: 'Next',
    page: 'Page',
    of: 'of',
    summaryPrefix: 'Total',
    summarySuffix: 'verified ledgers logged',
    lockMsg: 'Please wait…',
  },
  sa: {
    prev: 'Aliddo',
    next: 'Gisate',
    page: 'Fuula',
    of: 'ra',
    summaryPrefix: 'Hunda',
    summarySuffix: 'ledgers bukkinoonni',
    lockMsg: 'Turte eegi…',
  },
} as const;

/* ─────────────────────────────────────────────────────────────
   Smart Page Number Window Builder
   Produces a compact [ 1 … 4 5 6 … 12 ] style sequence.
   ───────────────────────────────────────────────────────────── */
function buildPageWindow(
  current: number,
  total: number
): (number | 'ellipsis-left' | 'ellipsis-right')[] {
  if (total <= 7) {
    return Array.from({ length: total }, (_, i) => i + 1);
  }

  const pages: (number | 'ellipsis-left' | 'ellipsis-right')[] = [];

  // Always show first page
  pages.push(1);

  if (current > 3) {
    pages.push('ellipsis-left');
  }

  // Window of 3 around current
  const windowStart = Math.max(2, current - 1);
  const windowEnd = Math.min(total - 1, current + 1);

  for (let p = windowStart; p <= windowEnd; p++) {
    pages.push(p);
  }

  if (current < total - 2) {
    pages.push('ellipsis-right');
  }

  // Always show last page
  pages.push(total);

  return pages;
}

/* ─────────────────────────────────────────────────────────────
   Component
   ───────────────────────────────────────────────────────────── */
export function MalazoneProMaxPagination({
  currentGlobalLang = 'am',
  totalItems = 144,
  itemsPerPage = 12,
  onPageChange,
}: ProMaxPaginationProps) {
  const [currentPage, setCurrentPage] = useState(1);
  const [isLocked, setIsLocked] = useState(false);
  const lockTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const totalPages = Math.max(1, Math.ceil(totalItems / itemsPerPage));
  const lang = LABELS[currentGlobalLang] ?? LABELS.en;

  /* ──────────────────────────────────────────────────────────
     400ms Type-Safe Server Debounce Rate Limiter
     Locks all page button interactions for exactly 400ms after
     each click to gracefully prevent backend data call flooding.
  ────────────────────────────────────────────────────────────── */
  const handlePageSwitch = useCallback(
    (targetPage: number) => {
      // Guard: out of bounds | same page | currently locked
      if (
        targetPage < 1 ||
        targetPage > totalPages ||
        targetPage === currentPage ||
        isLocked
      ) {
        return;
      }

      // Engage debounce lock immediately
      setIsLocked(true);
      setCurrentPage(targetPage);

      // Fire external callback
      if (onPageChange) {
        onPageChange(targetPage);
      }

      // Release lock after exactly 400ms
      if (lockTimerRef.current) {
        clearTimeout(lockTimerRef.current);
      }
      lockTimerRef.current = setTimeout(() => {
        setIsLocked(false);
      }, 400);
    },
    [currentPage, totalPages, isLocked, onPageChange]
  );

  const pageWindow = buildPageWindow(currentPage, totalPages);

  /* ──────────────────────────────────────────────────────────
     Shared class builders
  ────────────────────────────────────────────────────────────── */

  // Shared nav arrow button classes (Prev / Next)
  const navArrowClass = (disabled: boolean) =>
    [
      'flex items-center gap-2 px-4 py-2.5 rounded-xl border text-[11px] font-black uppercase tracking-widest',
      'transition-all duration-300 ease-out select-none',
      'focus:outline-none focus-visible:ring-2 focus-visible:ring-[#00A86B]/50',
      disabled
        ? 'bg-white border-slate-200 text-slate-300 cursor-not-allowed opacity-40'
        : [
            'bg-white border-slate-200 text-[#0B132B] cursor-pointer',
            'hover:border-[#00A86B]/50 hover:bg-slate-50 hover:-translate-y-0.5',
            'active:scale-95',
          ].join(' '),
    ].join(' ');

  // Page number button classes
  const pageNumClass = (isActive: boolean, disabled: boolean) => {
    const base =
      'relative min-w-[42px] h-[42px] px-3 rounded-xl border text-sm font-black ' +
      'transition-all duration-300 ease-out select-none ' +
      'focus:outline-none focus-visible:ring-2 focus-visible:ring-[#00A86B]/50 ';

    if (isActive) {
      return (
        base +
        'bg-[#00A86B] border-[#00A86B] text-black scale-105 z-10 ' +
        'shadow-[0_6px_24px_rgba(0,168,107,0.38)] cursor-default'
      );
    }
    if (disabled) {
      return base + 'bg-white border-slate-200 text-slate-300 cursor-not-allowed opacity-60';
    }
    return (
      base +
      'bg-white border-slate-200 text-[#0B132B] cursor-pointer ' +
      'hover:border-[#00A86B]/50 hover:bg-slate-50 hover:-translate-y-0.5 active:scale-95'
    );
  };

  /* ──────────────────────────────────────────────────────────
     Render
  ────────────────────────────────────────────────────────────── */
  return (
    <div
      className="
        w-full bg-white border-t border-slate-100
        py-10 px-4 sm:px-8
        flex flex-col items-center justify-center
        gap-5
        select-none antialiased font-sans
      "
      role="navigation"
      aria-label="Pagination navigation"
    >
      {/* ─────────────────────────────────────────────────────
          REGISTRY COUNTER STATUS ROW
          Shows total records + optional lock indicator
      ───────────────────────────────────────────────────────── */}
      <div className="flex items-center gap-2 flex-wrap justify-center">
        <div className="inline-flex items-center gap-2 bg-slate-50 border border-slate-200/80 rounded-full px-4 py-1.5">
          <Sparkles
            className="w-3.5 h-3.5 text-[#00A86B] shrink-0 animate-pulse"
            aria-hidden="true"
          />
          <span className="text-[10.5px] font-black uppercase tracking-[0.18em] text-slate-400">
            {lang.summaryPrefix}&nbsp;
            <span className="text-[#0B132B]">{totalItems.toLocaleString()}</span>&nbsp;
            {lang.summarySuffix}
          </span>
        </div>

        {/* 400ms Debounce Lock Indicator */}
        {isLocked && (
          <div
            className="
              inline-flex items-center gap-1.5
              bg-amber-50 border border-amber-200/70
              text-amber-600 text-[9.5px] font-black uppercase tracking-widest
              px-3 py-1.5 rounded-full
              animate-pulse
            "
            role="status"
            aria-live="polite"
          >
            <span className="w-1.5 h-1.5 rounded-full bg-amber-500 inline-block" />
            {lang.lockMsg}
          </div>
        )}
      </div>

      {/* ─────────────────────────────────────────────────────
          MAIN NAVIGATION TRAY
      ───────────────────────────────────────────────────────── */}
      <div
        className="flex items-center flex-wrap justify-center gap-2 sm:gap-2.5"
        role="list"
      >
        {/* ── PREV ARROW ── */}
        <button
          onClick={() => handlePageSwitch(currentPage - 1)}
          disabled={currentPage === 1 || isLocked}
          aria-label={`${lang.prev} page`}
          className={navArrowClass(currentPage === 1 || isLocked)}
        >
          <ChevronLeft className="w-4 h-4 text-[#00A86B] shrink-0" aria-hidden="true" />
          {/* Ge'ez-safe: render text on sm+, always reserve enough padding for multilingual strings */}
          <span className="hidden sm:inline-block leading-relaxed whitespace-nowrap">
            {lang.prev}
          </span>
        </button>

        {/* ── PAGE NUMBER NODE GRID ── */}
        {pageWindow.map((entry, idx) => {
          if (entry === 'ellipsis-left' || entry === 'ellipsis-right') {
            return (
              <span
                key={`${entry}-${idx}`}
                className="
                  w-[42px] h-[42px] flex items-end justify-center
                  pb-1.5 text-slate-400 font-black text-base
                  select-none
                "
                aria-hidden="true"
              >
                ···
              </span>
            );
          }

          const pageNum = entry as number;
          const isActive = currentPage === pageNum;

          return (
            <button
              key={pageNum}
              onClick={() => handlePageSwitch(pageNum)}
              disabled={isActive || isLocked}
              aria-label={`${lang.page} ${pageNum}`}
              aria-current={isActive ? 'page' : undefined}
              className={pageNumClass(isActive, isLocked && !isActive)}
            >
              {pageNum}

              {/* Active page: subtle inner pulse ring */}
              {isActive && (
                <span
                  className="
                    absolute inset-0 rounded-xl
                    ring-2 ring-[#00A86B]/30 ring-offset-1
                    pointer-events-none
                  "
                  aria-hidden="true"
                />
              )}
            </button>
          );
        })}

        {/* ── NEXT ARROW ── */}
        <button
          onClick={() => handlePageSwitch(currentPage + 1)}
          disabled={currentPage === totalPages || isLocked}
          aria-label={`${lang.next} page`}
          className={navArrowClass(currentPage === totalPages || isLocked)}
        >
          {/* Ge'ez-safe: generous whitespace prevents Amharic/Sidaamu Afoo character overlap */}
          <span className="hidden sm:inline-block leading-relaxed whitespace-nowrap">
            {lang.next}
          </span>
          <ChevronRight className="w-4 h-4 text-[#00A86B] shrink-0" aria-hidden="true" />
        </button>
      </div>

      {/* ─────────────────────────────────────────────────────
          PAGE / OF TOTAL TRACKER (compact mobile fallback)
      ───────────────────────────────────────────────────────── */}
      <p
        className="text-[10px] font-bold tracking-widest uppercase text-slate-400 leading-relaxed"
        aria-live="polite"
      >
        {lang.page}&nbsp;
        <span className="text-[#0B132B] font-black">{currentPage}</span>
        &nbsp;{lang.of}&nbsp;
        <span className="text-[#0B132B] font-black">{totalPages}</span>
      </p>
    </div>
  );
}

export default MalazoneProMaxPagination;
