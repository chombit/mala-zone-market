/**
 * CategoryGrid.tsx
 * Malazone.com — Mobile Quick-Access Category Row
 * Matches reference design: 6 cards (Buy, Rent, Land, Cars, Machinery, More)
 * Uses Malazone emerald (#00A86B) & navy (#0B132B) brand colors
 * © 2026 Malazone Technologies PLC
 */

import React from 'react';
import { Home, KeyRound, MapPin, Car, Tractor, LayoutGrid } from 'lucide-react';
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

const CategoryGrid: React.FC<CategoryGridProps> = ({ onCategoryChange, onFilterClick }) => {
  const { t } = useLanguage();

  return (
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
                  onFilterClick?.();
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
  );
};

export default CategoryGrid;
