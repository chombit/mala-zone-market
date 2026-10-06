import React, { useState, useEffect } from 'react';
import { Home, Search, Heart, UserCircle2, Plus, MessageCircle } from 'lucide-react';
import { useLanguage } from '@/contexts/ZoneLanguageContext';
import { useAuth } from '@/contexts/AuthContext';
import { useNavigate, useLocation } from 'react-router-dom';
import { useFavorites } from '@/contexts/FavoritesContext';

type TabId = 'home' | 'search' | 'post' | 'saved' | 'messages' | 'profile';

const BottomNavigation: React.FC = () => {
  const { t } = useLanguage();
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const { favorites } = useFavorites();

  const [isVisible, setIsVisible] = useState(true);
  const [lastScrollY, setLastScrollY] = useState(0);

  useEffect(() => {
    const controlNavbar = () => {
      if (typeof window !== 'undefined') {
        if (window.scrollY > lastScrollY && window.scrollY > 50) { 
          setIsVisible(false);
        } else {
          setIsVisible(true);
        }
        setLastScrollY(window.scrollY);
      }
    };

    window.addEventListener('scroll', controlNavbar);
    return () => window.removeEventListener('scroll', controlNavbar);
  }, [lastScrollY]);

  const activeFromPath = (): TabId => {
    const p = location.pathname.toLowerCase();
    if (p.startsWith('/search') || p.includes('listings')) return 'search';
    if (p.startsWith('/saved') || p.startsWith('/favorites')) return 'saved';
    if (p.startsWith('/messages') || p.startsWith('/chat')) return 'messages';
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
      case 'post':
        if (isAuthenticated) {
          // Scroll to top and trigger post modal via custom event
          window.scrollTo({ top: 0, behavior: 'smooth' });
          window.dispatchEvent(new CustomEvent('malazone:open-post-modal'));
        } else {
          navigate('/signin');
        }
        break;
      case 'saved':
        navigate('/saved');
        break;
      case 'messages':
        if (isAuthenticated) navigate('/account');
        else navigate('/signin');
        break;
      case 'profile':
        if (isAuthenticated) navigate('/account');
        else navigate('/signin');
        break;
    }
  };

  // Left tabs: Home, Search | Center: Post | Right: Saved, Messages, Profile
  const leftTabs: Array<{ id: 'home' | 'search'; labelKey: string; icon: any; badge?: number }> = [
    { id: 'home',    labelKey: 'bn.home',    icon: Home },
    { id: 'search',  labelKey: 'bn.search',  icon: Search },
  ];

  const rightTabs: Array<{ id: 'saved' | 'messages' | 'profile'; labelKey: string; icon: any; badge?: number }> = [
    { id: 'saved',    labelKey: 'bn.saved',    icon: Heart, badge: favorites.length },
    { id: 'messages', labelKey: 'bn.messages', icon: MessageCircle },
    { id: 'profile',  labelKey: 'bn.profile',  icon: UserCircle2 },
  ];

  const renderTab = (tab: { id: TabId; labelKey: string; icon: any; badge?: number }, isActive: boolean) => {
    const Icon = tab.icon;
    return (
      <button
        key={tab.id}
        type="button"
        onClick={() => handle(tab.id)}
        className={`
          relative flex flex-col items-center justify-center flex-1 py-1.5 px-0.5 rounded-lg
          transition-all duration-200 active:scale-95
          ${isActive
            ? 'text-[#00A86B] bg-emerald-50 dark:bg-emerald-500/10'
            : 'text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-white'}
        `}
        aria-current={isActive ? 'page' : undefined}
        aria-label={t(tab.labelKey as any)}
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
    );
  };

  return (
    <nav
      className={`lg:hidden fixed bottom-0 left-0 right-0 z-[100] bg-white dark:bg-slate-950 border-t border-slate-200 dark:border-white/10 shadow-[0_-2px_10px_rgba(0,0,0,0.08)] transition-transform duration-300 ease-in-out ${
        isVisible ? 'translate-y-0' : 'translate-y-full'
      }`}
      aria-label="Main"
    >
      <div className="flex items-center justify-between px-1 py-1">
        {/* Left tabs */}
        <div className="flex flex-1 items-center justify-around">
          {leftTabs.map((tab) => renderTab(tab, active === tab.id))}
        </div>

        {/* Center Post button — raised above the bar */}
        <div className="flex items-center justify-center -mt-5 px-1">
          <button
            type="button"
            onClick={() => handle('post')}
            className="flex flex-col items-center justify-center w-14 h-14 rounded-full bg-[#00A86B] text-white shadow-lg shadow-[#00A86B]/30 hover:bg-emerald-600 active:scale-90 transition-all duration-200"
            aria-label={t('bn.post')}
          >
            <Plus className="w-6 h-6 stroke-[2.5]" />
            <span className="text-[9px] font-bold leading-tight mt-0.5">{t('bn.post')}</span>
          </button>
        </div>

        {/* Right tabs */}
        <div className="flex flex-1 items-center justify-around">
          {rightTabs.map((tab) => renderTab(tab, active === tab.id))}
        </div>
      </div>
    </nav>
  );
};

export default BottomNavigation;
