/**
 * CategoryGrid.tsx
 * Malazone.com — Mobile Category Grid Navigation
 * 6 cards: Buy, Rent, Property, Electronics, Vehicle, More
 * © 2026 Malazone Technologies PLC
 */

import React from 'react';
import { ShoppingCart, Key, Map, Smartphone, Car, LayoutGrid } from 'lucide-react';

interface CategoryGridProps {
  onCategoryChange: (cat: string) => void;
  onFilterClick?: () => void;
}

const CATEGORIES = [
  { id: 'property', icon: ShoppingCart, label: 'Buy', color: '#3B82F6', bg: '#EFF6FF' },
  { id: 'stay', icon: Key, label: 'Rent', color: '#22C55E', bg: '#F0FDF4' },
  { id: 'house', icon: Map, label: 'Property', color: '#14B8A6', bg: '#F0FDFA' },
  { id: 'electronics', icon: Smartphone, label: 'Electronics', color: '#3B82F6', bg: '#EFF6FF' },
  { id: 'motors', icon: Car, label: 'Vehicle', color: '#F97316', bg: '#FFF7ED' },
  { id: 'more', icon: LayoutGrid, label: 'More', color: '#8B5CF6', bg: '#F5F3FF' },
];

const CategoryGrid: React.FC<CategoryGridProps> = ({ onCategoryChange, onFilterClick }) => {
  return (
    <div className="lg:hidden px-4 py-3">
      <div className="grid grid-cols-6 gap-2">
        {CATEGORIES.map((cat) => (
          <button
            key={cat.id}
            onClick={() => {
              if (cat.id === 'more') {
                onFilterClick?.();
              } else {
                onCategoryChange(cat.id);
              }
            }}
            className="flex flex-col items-center gap-1.5 py-3 rounded-xl bg-white dark:bg-white/[0.03] border border-slate-100 dark:border-white/5 active:scale-95 transition-all duration-200 shadow-sm"
          >
            <div
              className="w-9 h-9 rounded-xl flex items-center justify-center"
              style={{ backgroundColor: cat.bg }}
            >
              <cat.icon className="w-4 h-4" style={{ color: cat.color }} />
            </div>
            <span className="text-[9px] font-bold text-slate-700 dark:text-slate-300 leading-tight text-center">
              {cat.label}
            </span>
          </button>
        ))}
      </div>
    </div>
  );
};

export default CategoryGrid;
