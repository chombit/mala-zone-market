/**
 * CategoryGrid.tsx
 * Malazone.com — Mobile Quick-Access Category Row
 * Matches reference design: 6 cards (Buy, Rent, Land, Cars, Machinery, More)
 * Uses Malazone emerald (#00A86B) & navy (#0B132B) brand colors
 * © 2026 Malazone Technologies PLC
 */

import React, { useState } from 'react';
import { Home, KeyRound, MapPin, Car, Tractor, LayoutGrid, Smartphone, Bed, PartyPopper, X } from 'lucide-react';
import { useLanguage } from '@/contexts/ZoneLanguageContext';

interface CategoryGridProps {
  onCategoryChange: (cat: string) => void;
  onFilterClick?: () => void;
}

interface QuickCat {
  id: string;
  labelKey: string;
  icon: any;
  iconBg: string;
  iconColor: string;
  action?: 'filter' | 'cat';
}

const QUICK_CATEGORIES: QuickCat[] = [
  {
    id: 'intent_buy',
    labelKey: 'cat.buy',
    icon: Home,
    iconBg: '#EFF6FF',
    iconColor: '#1D4ED8',
  },
  {
    id: 'intent_rent',
    labelKey: 'cat.rent',
    icon: KeyRound,
    iconBg: '#ECFDF5',
    iconColor: '#00A86B',
  },
  {
    id: 'property',
    labelKey: 'cat.land',
    icon: MapPin,
    iconBg: '#ECFDF5',
    iconColor: '#059669',
  },
  {
    id: 'motors',
    labelKey: 'cat.cars',
    icon: Car,
    iconBg: '#EFF6FF',
    iconColor: '#2563EB',
  },
  {
    id: 'heavy',
    labelKey: 'cat.machinery',
    icon: Tractor,
    iconBg: '#FFF7ED',
    iconColor: '#EA580C',
  },
  {
    id: 'more',
    labelKey: 'cat.more',
    icon: LayoutGrid,
    iconBg: '#F5F3FF',
    iconColor: '#7C3AED',
    action: 'filter',
  },
];

// Additional categories shown in "More" modal
const MORE_CATEGORIES: QuickCat[] = [
  {
    id: 'property',
    labelKey: 'nav.cat1',
    icon: Home,
    iconBg: '#ECFDF5',
    iconColor: '#059669',
  },
  {
    id: 'motors',
    labelKey: 'nav.cat2',
    icon: Car,
    iconBg: '#EFF6FF',
    iconColor: '#2563EB',
  },
  {
    id: 'stay',
    labelKey: 'nav.cat3',
    icon: Bed,
    iconBg: '#FCE7F3',
    iconColor: '#BE185D',
  },
  {
    id: 'ceremony',
    labelKey: 'nav.cat4',
    icon: PartyPopper,
    iconBg: '#FEF3C7',
    iconColor: '#D97706',
  },
  {
    id: 'heavy',
    labelKey: 'nav.cat5',
    icon: Tractor,
    iconBg: '#FFF7ED',
    iconColor: '#EA580C',
  },
  {
    id: 'electronics',
    labelKey: 'nav.cat6',
    icon: Smartphone,
    iconBg: '#DBEAFE',
    iconColor: '#1E40AF',
  },
];

const CategoryGrid: React.FC<CategoryGridProps> = ({ onCategoryChange, onFilterClick }) => {
  const { t } = useLanguage();
  const [showMoreModal, setShowMoreModal] = useState(false);

  return (
    <>
      <section className="lg:hidden px-4 pt-2 pb-4">
        <div className="grid grid-cols-6 gap-2 sm:gap-3">
          {QUICK_CATEGORIES.map((cat) => {
            const Icon = cat.icon;
            const isFilter = cat.action === 'filter';
            return (
              <button
                key={cat.id}
                onClick={() => {
                  if (isFilter) {
                    setShowMoreModal(true);
                  } else {
                    onCategoryChange(cat.id);
                    const el = document.getElementById('listings-catalog');
                    if (el) el.scrollIntoView({ behavior: 'smooth' });
                  }
                }}
                className="flex flex-col items-center gap-2 py-3 sm:py-3.5 px-1 rounded-2xl bg-white dark:bg-white/[0.03] border border-slate-100 dark:border-white/5 active:scale-95 transition-all duration-200 shadow-sm hover:shadow-md hover:-translate-y-[1px]"
              >
                <div
                  className="w-11 h-11 sm:w-12 sm:h-12 rounded-2xl flex items-center justify-center transition-all duration-200"
                  style={{ backgroundColor: cat.iconBg }}
                >
                  <Icon className="w-6 h-6 sm:w-6.5 sm:h-6.5" style={{ color: cat.iconColor }} strokeWidth={2} />
                </div>
                <span className="text-[10px] sm:text-[11px] font-bold text-slate-800 dark:text-slate-200 leading-tight text-center">
                  {t(cat.labelKey as any)}
                </span>
              </button>
            );
          })}
        </div>
      </section>

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
                {t('cat.moreCategories') || 'More Categories'}
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
              {MORE_CATEGORIES.map((cat) => {
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
                      style={{ backgroundColor: cat.iconBg }}
                    >
                      <Icon className="w-7 h-7" style={{ color: cat.iconColor }} strokeWidth={2} />
                    </div>
                    <span className="text-xs font-bold text-slate-800 dark:text-slate-200 leading-tight text-center">
                      {t(cat.labelKey as any)}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>
        </>
      )}
    </>
  );
};

export default CategoryGrid;
