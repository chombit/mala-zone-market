/**
 * MobileHomeSections.tsx
 * Malazone.com — Premium mobile-only homepage sections matching reference design
 * Uses actual website data via FALLBACK_LISTINGS import
 * Brand colors: Emerald #00A86B (Malazone green) & Navy #0B132B (Malazone navy)
 * - Featured Listings: horizontal snap scroll cards with Verified badges
 * - Premium Projects: navy gradient hero card with +PREMIUM gold badge & perks
 * - Browse by Location: horizontal image cards
 * © 2026 Malazone Technologies PLC
 */

import React from 'react';
import {
  CheckCircle, Heart, BedDouble, Bath, Ruler, MapPin,
  ArrowRight, Home as HomeIcon, BadgePercent, ChevronRight,
} from 'lucide-react';
import { useLanguage } from '@/contexts/ZoneLanguageContext';
import { useFavorites } from '@/contexts/FavoritesContext';
import { FALLBACK_LISTINGS, type ListingItem } from './ZoneCatalogGrid';

interface MobileHomeSectionsProps {
  onScrollToCatalog?: () => void;
  onListingClick?: (listing: ListingItem) => void;
}

const LOCATIONS = [
  { id: 'hawassa', nameKey: 'geo.hawassa', count: 140, image: 'https://coresg-normal.trae.ai/api/ide/v1/text_to_image?prompt=aerial%20panoramic%20view%20hawassa%20lake%20city%20ethiopia%2C%20waterfront%2C%20boats%2C%20green%20hills%20background%2C%20beautiful%20landscape&image_size=square' },
  { id: 'yirgalem', nameKey: 'geo.yirgalem', count: 62, image: 'https://coresg-normal.trae.ai/api/ide/v1/text_to_image?prompt=yirgalem%20town%20ethiopia%20countryside%20panorama%2C%20red%20roof%20houses%2C%20green%20coffee%20farm%20hills%20background&image_size=square' },
  { id: 'aleta_wondo', nameKey: 'geo.aletaWondo', count: 39, image: 'https://coresg-normal.trae.ai/api/ide/v1/text_to_image?prompt=aleta%20wondo%20village%20sidama%20ethiopia%2C%20banana%20trees%2C%20traditional%20homes%20green%20tropical&image_size=square' },
  { id: 'bensa', nameKey: 'geo.bensa', count: 28, image: 'https://coresg-normal.trae.ai/api/ide/v1/text_to_image?prompt=bensa%20sidama%20region%20ethiopia%2C%20terraced%20farmland%20green%20agriculture%20mountain%20side%20village&image_size=square' },
  { id: 'chuko', nameKey: 'geo.chuko', count: 17, image: 'https://coresg-normal.trae.ai/api/ide/v1/text_to_image?prompt=chuko%20sidama%20ethiopia%20countryside%20panorama%2C%20rolling%20green%20hills%20cottages%20countryside&image_size=square' },
];

const fmtPrice = (n: number, currency = 'ETB') =>
  `${currency} ${n.toLocaleString('en-US')}`;

const MobileHomeSections: React.FC<MobileHomeSectionsProps> = ({ onScrollToCatalog, onListingClick }) => {
  const { language, t } = useLanguage();
  const { isFavorite, toggleFavorite } = useFavorites();

  // Use real site data: premium listings first (isPremium), take top 8
  const featuredListings = React.useMemo<ListingItem[]>(() => {
    const withPremium = [...FALLBACK_LISTINGS].sort((a, b) => Number(b.isPremium) - Number(a.isPremium));
    return withPremium.slice(0, 8);
  }, []);

  const firstPremium = featuredListings.find((l) => l.isPremium && (l.zone === 'house')) || featuredListings[0];

  const listingTitle = (l: ListingItem) =>
    language === 'amharic' ? l.titleAm : l.titleEn;

  const listingZoneLabel = (l: ListingItem) => {
    const k = `zone.${l.zone}` as const;
    return t(k) ?? t('zone.all');
  };

  const handleCardClick = (l: ListingItem) => {
    if (onListingClick) onListingClick(l);
    else if (onScrollToCatalog) onScrollToCatalog();
  };

  const scrollToCatalog = () => {
    onScrollToCatalog?.();
    const el = document.getElementById('listings-catalog');
    if (el) el.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <div className="lg:hidden space-y-6 bg-slate-50 dark:bg-slate-950">

      {/* ══════════════════════════════════════════
           SECTION 1: FEATURED LISTINGS (HORIZONTAL)
           ══════════════════════════════════════════ */}
      <section className="px-4">
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-lg font-black text-malazone-navy dark:text-white tracking-tight">
            {t('home.featuredListings')}
          </h2>
          <button
            onClick={scrollToCatalog}
            className="text-xs font-bold text-[#00A86B] hover:text-[#007c50] transition-colors flex items-center gap-0.5"
          >
            {t('home.seeAll')}
            <ChevronRight className="w-3 h-3" />
          </button>
        </div>

        <div className="flex gap-3 overflow-x-auto snap-x snap-mandatory pb-2 -mx-4 px-4 scrollbar-thin">
          {featuredListings.map((l) => {
            const liked = isFavorite(l.id);
            return (
              <article
                key={l.id}
                onClick={() => handleCardClick(l)}
                className="relative shrink-0 w-[82%] sm:w-[60%] max-w-[340px] snap-start rounded-2xl bg-white dark:bg-white/[0.03] border border-slate-100 dark:border-white/5 shadow-sm overflow-hidden hover:shadow-lg transition-shadow duration-200 cursor-pointer"
              >
                {/* Image */}
                <div className="relative aspect-[4/3] w-full overflow-hidden bg-slate-100 dark:bg-slate-800">
                  <img
                    src={l.image}
                    alt={listingTitle(l)}
                    loading="lazy"
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                  {/* Verified badge (top-left) — emerald for verified */}
                  {l.isVerified && (
                    <div className="absolute top-2.5 left-2.5 flex items-center gap-1 px-2 py-1 rounded-full bg-[#00A86B] text-white text-[10px] font-black uppercase tracking-wide shadow-md">
                      <CheckCircle className="w-3 h-3" />
                      <span>{t('home.verified')}</span>
                    </div>
                  )}
                  {/* Favorite (top-right) */}
                  <button
                    type="button"
                    onClick={(e) => { e.stopPropagation(); toggleFavorite(l); }}
                    aria-label={liked ? 'Unfavorite' : 'Favorite'}
                    className="absolute top-2 right-2 w-9 h-9 rounded-full bg-white/95 backdrop-blur-sm dark:bg-slate-900/80 flex items-center justify-center shadow-md transition-transform hover:scale-110 active:scale-95"
                  >
                    <Heart
                      className={`w-4.5 h-4.5 transition-colors ${liked ? 'fill-red-500 text-red-500' : 'text-slate-500 dark:text-slate-200'}`}
                    />
                  </button>
                  {/* Meta badges (beds/baths/sqm) bottom-left */}
                  {(l.bedrooms || l.bathrooms || l.sqm) && (
                    <div className="absolute bottom-2.5 left-2.5 flex gap-1.5">
                      {l.bedrooms && (
                        <div className="flex items-center gap-1 px-1.5 py-1 rounded-lg bg-slate-900/70 backdrop-blur-sm text-white text-[10px] font-bold">
                          <BedDouble className="w-3 h-3" />
                          <span>{l.bedrooms}</span>
                        </div>
                      )}
                      {l.bathrooms && (
                        <div className="flex items-center gap-1 px-1.5 py-1 rounded-lg bg-slate-900/70 backdrop-blur-sm text-white text-[10px] font-bold">
                          <Bath className="w-3 h-3" />
                          <span>{l.bathrooms}</span>
                        </div>
                      )}
                      {l.sqm != null && (
                        <div className="flex items-center gap-1 px-1.5 py-1 rounded-lg bg-slate-900/70 backdrop-blur-sm text-white text-[10px] font-bold">
                          <Ruler className="w-3 h-3" />
                          <span>{l.sqm}</span>
                        </div>
                      )}
                    </div>
                  )}
                </div>

                {/* Body */}
                <div className="p-3">
                  <h3 className="text-sm font-bold text-malazone-navy dark:text-white leading-snug line-clamp-1 mb-1">
                    {listingTitle(l)}
                  </h3>
                  <div className="flex items-center gap-1 text-[11px] text-slate-500 dark:text-slate-400 mb-2">
                    <MapPin className="w-3 h-3 text-[#00A86B] shrink-0" />
                    <span className="truncate">
                      {t(`city.${l.locationKey}` as any) ?? l.locationTag}
                    </span>
                  </div>
                  {/* EMERALD price brand color (not blue) */}
                  <p className="text-base font-black text-[#00A86B] mb-2">
                    {fmtPrice(l.price)}
                  </p>
                  <div className="flex items-center gap-1.5 pt-2 border-t border-slate-100 dark:border-white/5">
                    <div className="w-6 h-6 rounded-full bg-gradient-to-br from-[#00A86B] to-emerald-500 flex items-center justify-center text-[10px] font-black text-white shrink-0">
                      {String(l.sellerName?.[0] ?? 'M').toUpperCase()}
                    </div>
                    <span className="text-[11px] text-slate-600 dark:text-slate-300 font-semibold truncate">
                      {l.sellerName ?? listingZoneLabel(l)}
                    </span>
                  </div>
                </div>
              </article>
            );
          })}
        </div>
      </section>

      {/* ══════════════════════════════════════════
           SECTION 2: PREMIUM PROJECTS BANNER
           (Malazone NAVY #0B132B + gold premium accent + emerald CTA/perks)
           ══════════════════════════════════════════ */}
      <section className="px-4">
        <div
          className="relative overflow-hidden rounded-3xl shadow-xl"
          style={{ background: 'linear-gradient(135deg, #0B132B 0%, #0f2150 50%, #112864 100%)' }}
        >
          {/* Background image */}
          <img
            src={firstPremium.image}
            alt={listingTitle(firstPremium)}
            loading="lazy"
            className="absolute inset-0 w-full h-full object-cover opacity-35"
          />
          {/* Gradient overlay */}
          <div className="absolute inset-0 bg-gradient-to-r from-[#0B132B] via-[#0B132B]/90 to-transparent" />

          <div className="relative p-5 sm:p-6">
            {/* Section header */}
            <div className="flex items-start justify-between mb-3">
              <h2 className="text-lg font-black text-white tracking-tight">
                {t('home.premiumProjects')}
              </h2>
              <button
                onClick={scrollToCatalog}
                className="text-[11px] font-bold text-white/80 hover:text-white transition-colors flex items-center gap-0.5 whitespace-nowrap"
              >
                {t('home.seeAll')}
                <ChevronRight className="w-3 h-3" />
              </button>
            </div>

            {/* Premium gold badge */}
            <div className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-gradient-to-r from-yellow-400 to-amber-500 text-[#3b2700] text-[10px] font-black uppercase tracking-wider mb-3 shadow-md shadow-amber-500/20">
              <span>{t('home.premiumBadge')}</span>
            </div>

            {/* Project title */}
            <h3 className="text-xl sm:text-2xl font-black leading-tight text-white mb-4 max-w-[75%] line-clamp-2">
              {listingTitle(firstPremium)}
            </h3>

            {/* Perks (emerald icons brand color) */}
            <div className="flex flex-wrap gap-2 mb-4">
              <div className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-full bg-white/10 backdrop-blur-sm text-white/90 text-[10px] font-bold border border-white/15">
                <HomeIcon className="w-3.5 h-3.5 text-[#00A86B]" />
                <span>{t('home.downPct')}</span>
              </div>
              <div className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-full bg-white/10 backdrop-blur-sm text-white/90 text-[10px] font-bold border border-white/15">
                <BadgePercent className="w-3.5 h-3.5 text-[#00A86B]" />
                <span>{t('home.flexPlan')}</span>
              </div>
              <div className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-full bg-white/10 backdrop-blur-sm text-white/90 text-[10px] font-bold border border-white/15">
                <MapPin className="w-3.5 h-3.5 text-[#00A86B]" />
                <span>{t('home.primeLoc')}</span>
              </div>
            </div>

            {/* CTA — emerald brand color */}
            <button
              onClick={scrollToCatalog}
              className="group inline-flex items-center gap-2 px-5 py-3 rounded-xl bg-[#00A86B] text-white font-black text-sm shadow-lg shadow-emerald-500/30 hover:shadow-xl hover:-translate-y-[1px] active:translate-y-0 transition-all duration-200"
            >
              <span>{t('home.viewProject')}</span>
              <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-0.5" />
            </button>
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════════
           SECTION 3: BROWSE BY LOCATION (HORIZONTAL)
           ══════════════════════════════════════════ */}
      <section className="pb-6 px-4">
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-lg font-black text-malazone-navy dark:text-white tracking-tight">
            {t('home.browseByLoc')}
          </h2>
          <button
            onClick={scrollToCatalog}
            className="text-xs font-bold text-[#00A86B] hover:text-[#007c50] transition-colors flex items-center gap-0.5"
          >
            {t('home.seeAll')}
            <ChevronRight className="w-3 h-3" />
          </button>
        </div>

        <div className="flex gap-3 overflow-x-auto snap-x snap-mandatory pb-2 -mx-4 px-4 scrollbar-thin">
          {LOCATIONS.map((loc) => (
            <button
              key={loc.id}
              type="button"
              onClick={scrollToCatalog}
              className="relative shrink-0 w-[150px] snap-start group"
            >
              <div className="relative w-[150px] h-[150px] rounded-2xl overflow-hidden shadow-md group-hover:shadow-xl group-hover:-translate-y-[2px] transition-all duration-200 bg-slate-200 dark:bg-slate-800">
                <img
                  src={loc.image}
                  alt={t(loc.nameKey as any)}
                  loading="lazy"
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                />
                {/* Dark bottom gradient overlay */}
                <div className="absolute inset-0 bg-gradient-to-t from-slate-900/90 via-slate-900/20 to-transparent" />
                {/* Labels */}
                <div className="absolute bottom-2.5 left-2.5 right-2.5 text-left">
                  <p className="text-sm font-black text-white leading-tight drop-shadow-sm">
                    {t(loc.nameKey as any)}
                  </p>
                  <p className="text-[11px] font-semibold text-white/85 mt-0.5">
                    {loc.count} {t('home.listingsCount').replace('{count}', '').trim()}
                  </p>
                </div>
              </div>
            </button>
          ))}
        </div>
      </section>
    </div>
  );
};

export default MobileHomeSections;
