import React from 'react';
import { Home, Search, Heart, UserCircle2 } from 'lucide-react';
import { useLanguage } from '@/contexts/ZoneLanguageContext';
import { useAuth } from '@/contexts/AuthContext';
import { useNavigate, useLocation } from 'react-router-dom';
import { useFavorites } from '@/contexts/FavoritesContext';

type TabId = 'home' | 'search' | 'saved' | 'profile';

const BottomNavigation: React.FC = () => {
  const { t } = useLanguage();
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const { favorites } = useFavorites();

  const activeFromPath = (): TabId => {
    const p = location.pathname.toLowerCase();
    if (p.startsWith('/search') || p.includes('listings')) return 'search';
    if (p.startsWith('/saved') || p.startsWith('/favorites')) return 'saved';
    if (p.startsWith('/profile') || p.startsWith('/account') || p.startsWith('/me')) return 'profile';
    return 'home';
  };
  const active = activeFromPath();

  const handle = (tab: TabId) => {
    switch (tab) {
      case 'home':
        navigate('/');
        window.scrollTo({ top: 0, behavior: 'smooth' });
        break;
      case 'search':
        const grid = document.getElementById('listings-catalog');
        if (grid) grid.scrollIntoView({ behavior: 'smooth' });
        else navigate('/#listings-catalog');
        break;
      case 'saved':
        navigate('/saved');
        break;
      case 'profile':
        if (isAuthenticated) navigate('/account');
        else navigate('/signin');
        break;
    }
  };

  const tabs: Array<{ id: TabId; label: string; icon: any; badge?: number; labelKey: string; }> = [
    { id: 'home',    label: t('bn.home'),    labelKey: 'bn.home',    icon: Home },
    { id: 'search',  label: t('bn.search'),  labelKey: 'bn.search',  icon: Search },
    { id: 'saved',   label: t('bn.saved'),   labelKey: 'bn.saved',   icon: Heart, badge: favorites.length },
    { id: 'profile', label: t('bn.profile'), labelKey: 'bn.profile', icon: UserCircle2 },
  ];

  return (
    <nav
      className="lg:hidden fixed bottom-0 left-0 right-0 z-[100] bg-white dark:bg-slate-950 border-t border-slate-200 dark:border-white/10 shadow-[0_-2px_10px_rgba(0,0,0,0.08)]"
      aria-label="Main"
    >
      {/* Navigation with right space reserved for Tawk.to */}
      <div className="pr-20">
        <ul className="grid grid-cols-4 gap-0 px-2 py-1.5">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = active === tab.id;
            return (
              <li key={tab.id} className="flex items-center justify-center">
                <button
                  type="button"
                  onClick={() => handle(tab.id)}
                  className={`
                    relative flex flex-col items-center justify-center w-full py-1 px-1 rounded-lg
                    transition-all duration-200 active:scale-95
                    ${isActive
                      ? 'text-[#00A86B] bg-emerald-50 dark:bg-emerald-500/10'
                      : 'text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-white'}
                  `}
                  aria-current={isActive ? 'page' : undefined}
                  aria-label={tab.label}
                >
                  <div className="relative">
                    <Icon className={`w-5 h-5 ${isActive ? 'stroke-[2.5]' : 'stroke-2'}`} />
                    {tab.badge != null && tab.badge > 0 && (
                      <span className="absolute -top-1 -right-1.5 min-w-[16px] h-4 px-0.5 rounded-full bg-red-500 text-white text-[9px] font-black flex items-center justify-center">
                        {tab.badge > 9 ? '9+' : tab.badge}
                      </span>
                    )}
                  </div>
                  <span className={`mt-0.5 text-[10px] font-bold leading-tight ${isActive ? 'text-[#00A86B]' : ''}`}>
                    {t(tab.labelKey as any)}
                  </span>
                </button>
              </li>
            );
          })}
        </ul>
      </div>
    </nav>
  );
};

export default BottomNavigation;
