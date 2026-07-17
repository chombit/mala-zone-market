import React from 'react';
import { Home, Search, Heart, User, Building2 } from 'lucide-react';
import { useFavorites } from '../contexts/FavoritesContext';

interface BottomNavigationProps {
  activeCategory: string;
  onCategoryChange: (category: string) => void;
}

const BottomNavigation: React.FC<BottomNavigationProps> = ({ activeCategory, onCategoryChange }) => {
  const { setSidebarOpen } = useFavorites();

  const navItems = [
    { id: 'all', icon: Home, label: 'Home' },
    { id: 'property', icon: Building2, label: 'Property' },
    { id: 'search', icon: Search, label: 'Search' },
    { id: 'favorites', icon: Heart, label: 'Favorites' },
    { id: 'profile', icon: User, label: 'Profile' },
  ];

  const handleClick = (id: string) => {
    if (id === 'favorites') {
      setSidebarOpen(true);
    } else if (id === 'search') {
      const el = document.getElementById('listings-catalog');
      if (el) el.scrollIntoView({ behavior: 'smooth' });
    } else if (id === 'profile') {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } else {
      onCategoryChange(id);
    }
  };

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-[1000] bg-white border-t border-slate-200 shadow-lg md:hidden">
      <div className="flex justify-around items-center">
        {navItems.map((item) => (
          <button
            key={item.id}
            onClick={() => handleClick(item.id)}
            className={`flex flex-col items-center justify-center w-full min-h-[44px] py-2 transition-all duration-200 ${
              activeCategory === item.id ? 'text-[#00A86B]' : 'text-slate-500 hover:text-slate-700'
            }`}
            aria-label={item.label}
          >
            <item.icon className={`w-6 h-6 mb-1 ${activeCategory === item.id ? 'stroke-[2.5]' : ''}`} />
            <span className="text-[10px] font-bold uppercase tracking-wider">{item.label}</span>
          </button>
        ))}
      </div>
    </nav>
  );
};

export default BottomNavigation;
