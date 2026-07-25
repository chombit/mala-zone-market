import React, { useState } from 'react';
import { Home, Search, Heart, User, LayoutGrid, Plus, X, Building2, Car, Music, Hotel, Truck, Smartphone } from 'lucide-react';
import { useFavorites } from '../contexts/FavoritesContext';
import { useLanguage } from '@/contexts/ZoneLanguageContext';
import { useAuth } from '@/contexts/AuthContext';
import { useNavigate } from 'react-router-dom';

interface BottomNavigationProps {
  activeCategory: string;
  onCategoryChange: (category: string) => void;
  onPostClick?: () => void;
}

const CATEGORIES = [
  { id: 'all', icon: Home, labelKey: 'cat.all' as const, color: '#00A86B' },
  { id: 'property', icon: Building2, labelKey: 'cat.property' as const, color: '#3B82F6' },
  { id: 'motors', icon: Car, labelKey: 'cat.motors' as const, color: '#EF4444' },
  { id: 'stay', icon: Hotel, labelKey: 'cat.stay' as const, color: '#8B5CF6' },
  { id: 'ceremony', icon: Music, labelKey: 'cat.ceremony' as const, color: '#F59E0B' },
  { id: 'heavy', icon: Truck, labelKey: 'cat.heavy' as const, color: '#6366F1' },
  { id: 'electronics', icon: Smartphone, labelKey: 'cat.electronics' as const, color: '#EC4899' },
];

const BottomNavigation: React.FC<BottomNavigationProps> = ({ activeCategory, onCategoryChange, onPostClick }) => {
  const { setSidebarOpen } = useFavorites();
  const { t } = useLanguage();
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const [showCategories, setShowCategories] = useState(false);

  const navItems = [
    { id: 'all', icon: Home, label: 'Home' },
    { id: 'category', icon: LayoutGrid, label: 'Category' },
    { id: 'post', icon: Plus, label: 'Post', isCenter: true },
    { id: 'favorites', icon: Heart, label: 'Saved' },
    { id: 'profile', icon: User, label: 'Profile' },
  ];

  const handleClick = (id: string) => {
    if (id === 'favorites') {
      setSidebarOpen(true);
    } else if (id === 'category') {
      setShowCategories(true);
    } else if (id === 'post') {
      if (isAuthenticated) {
        onPostClick?.();
      } else {
        navigate('/signin');
      }
    } else if (id === 'profile') {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } else {
      onCategoryChange(id);
    }
  };

  const handleCategorySelect = (catId: string) => {
    onCategoryChange(catId);
    setShowCategories(false);
    const el = document.getElementById('listings-catalog');
    if (el) el.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <>
      {/* Category Modal Overlay */}
      {showCategories && (
        <div className="fixed inset-0 z-[1100] md:hidden">
          <div
            className="absolute inset-0 bg-black/50 backdrop-blur-sm"
            onClick={() => setShowCategories(false)}
          />
          <div className="absolute bottom-0 left-0 right-0 bg-white dark:bg-slate-900 rounded-t-3xl shadow-2xl animate-in slide-in-from-bottom duration-300">
            <div className="flex items-center justify-between px-5 pt-5 pb-3">
              <h3 className="text-base font-black text-malazone-navy dark:text-white">
                {t('cat.title')}
              </h3>
              <button
                onClick={() => setShowCategories(false)}
                className="w-8 h-8 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center"
              >
                <X className="w-4 h-4 text-slate-500" />
              </button>
            </div>
            <div className="px-5 pb-8 grid grid-cols-4 gap-3">
              {CATEGORIES.map((cat) => {
                const isActive = activeCategory === cat.id;
                return (
                  <button
                    key={cat.id}
                    onClick={() => handleCategorySelect(cat.id)}
                    className={`flex flex-col items-center gap-2 py-4 rounded-2xl border-2 transition-all duration-200 ${
                      isActive
                        ? 'border-[#00A86B] bg-[#00A86B]/10'
                        : 'border-slate-100 dark:border-white/5 bg-slate-50 dark:bg-white/[0.03] active:scale-95'
                    }`}
                  >
                    <div
                      className={`w-10 h-10 rounded-xl flex items-center justify-center transition-colors ${
                        isActive ? 'bg-[#00A86B] text-white' : 'text-slate-600 dark:text-slate-300'
                      }`}
                      style={!isActive ? { backgroundColor: `${cat.color}15`, color: cat.color } : {}}
                    >
                      <cat.icon className="w-5 h-5" />
                    </div>
                    <span className={`text-[10px] font-bold leading-tight text-center ${
                      isActive ? 'text-[#00A86B]' : 'text-slate-600 dark:text-slate-300'
                    }`}>
                      {t(cat.labelKey)}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* Bottom Nav Bar */}
      <nav className="fixed bottom-0 left-0 right-0 z-[1000] bg-white border-t border-slate-200 shadow-lg md:hidden">
        <div className="flex justify-around items-center">
          {navItems.map((item) => {
            const isActive = item.id === 'category' ? (activeCategory !== 'all' && activeCategory !== 'search' && activeCategory !== 'favorites' && activeCategory !== 'profile') : activeCategory === item.id;

            if (item.isCenter) {
              return (
                <button
                  key={item.id}
                  onClick={() => handleClick(item.id)}
                  className="flex flex-col items-center justify-center -mt-5"
                  aria-label={item.label}
                >
                  <div className="w-12 h-12 rounded-full bg-[#00A86B] flex items-center justify-center shadow-lg shadow-emerald-500/30 active:scale-90 transition-transform">
                    <Plus className="w-6 h-6 text-white" />
                  </div>
                  <span className="text-[9px] font-bold text-[#00A86B] mt-0.5">{item.label}</span>
                </button>
              );
            }

            return (
              <button
                key={item.id}
                onClick={() => handleClick(item.id)}
                className={`flex flex-col items-center justify-center w-full min-h-[44px] py-2 transition-all duration-200 ${
                  isActive ? 'text-[#00A86B]' : 'text-slate-500 hover:text-slate-700'
                }`}
                aria-label={item.label}
              >
                <item.icon className={`w-6 h-6 mb-1 ${isActive ? 'stroke-[2.5]' : ''}`} />
                <span className="text-[10px] font-bold uppercase tracking-wider">{item.label}</span>
              </button>
            );
          })}
        </div>
      </nav>
    </>
  );
};

export default BottomNavigation;
