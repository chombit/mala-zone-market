/**
 * SimpleHeader.tsx
 * Simplified header for detail pages with search
 * Structure: Hamburger Menu | MALAZONE Logo | Search Bar | Language | Login
 */

import React, { useState } from 'react';
import { Menu, X, Globe, LogIn, User, Heart, Settings, LogOut, Search, SlidersHorizontal } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useLanguage } from '@/contexts/ZoneLanguageContext';
import { useAuth } from '@/contexts/AuthContext';
import { useFavorites } from '@/contexts/FavoritesContext';

const SimpleHeader: React.FC = () => {
  const navigate = useNavigate();
  const { language, toggleLanguage } = useLanguage();
  const { user, isAuthenticated, logout } = useAuth();
  const { setSidebarOpen } = useFavorites();
  const [showMobileMenu, setShowMobileMenu] = useState(false);
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  const currentLang = language === 'amharic' ? 'AM' : 'EN';

  const handleLogout = () => {
    logout();
    setShowProfileMenu(false);
    navigate('/');
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/?search=${encodeURIComponent(searchQuery.trim())}`);
    }
  };

  return (
    <>
      <div 
        className="header-fixed-wrapper"
        style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          width: '100vw',
          zIndex: 9999,
          isolation: 'isolate'
        }}
      >
        <header 
          className="w-full bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-white/10 shadow-lg"
        >
          {/* Top Row: Menu, Logo, Language, Login */}
          <div className="flex items-center justify-between px-3 sm:px-4 py-2.5 sm:py-3 max-w-7xl mx-auto border-b border-slate-100 dark:border-white/5 bg-white dark:bg-slate-900">
        
        {/* Left: Hamburger Menu */}
        <button
          onClick={() => setShowMobileMenu(!showMobileMenu)}
          className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors flex-shrink-0"
          aria-label="Menu"
        >
          {showMobileMenu ? (
            <X className="w-6 h-6 text-slate-700 dark:text-slate-300" />
          ) : (
            <Menu className="w-6 h-6 text-slate-700 dark:text-slate-300" />
          )}
        </button>

        {/* Center: MALAZONE Logo */}
        <button
          onClick={() => navigate('/')}
          className="flex items-center gap-0 font-black text-lg sm:text-xl tracking-tight hover:opacity-80 transition-opacity flex-shrink-0"
        >
          <span className="text-[#00A86B]">MALA</span>
          <span className="text-slate-900 dark:text-white">ZONE</span>
        </button>

        {/* Right: Language & Login/Profile */}
        <div className="flex items-center gap-2 sm:gap-3 flex-shrink-0">
          
          {/* Language Toggle */}
          <button
            onClick={toggleLanguage}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-slate-200 dark:border-white/10 hover:border-[#00A86B] dark:hover:border-[#00A86B] transition-colors"
          >
            <Globe className="w-4 h-4 text-[#00A86B]" />
            <span className="text-xs font-bold text-slate-700 dark:text-slate-300">{currentLang}</span>
          </button>

          {/* Login/Profile Button */}
          {isAuthenticated && user ? (
            <div className="relative">
              <button
                onClick={() => setShowProfileMenu(!showProfileMenu)}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-slate-200 dark:border-white/10 hover:border-[#00A86B] dark:hover:border-[#00A86B] transition-colors"
              >
                <User className="w-4 h-4 text-[#00A86B]" />
                <span className="hidden sm:inline text-xs font-bold text-slate-700 dark:text-slate-300">
                  {user.name?.split(' ')[0] || 'User'}
                </span>
              </button>

              {/* Profile Dropdown */}
              {showProfileMenu && (
                <>
                  <div
                    className="fixed inset-0 z-[140]"
                    onClick={() => setShowProfileMenu(false)}
                  />
                  <div className="absolute right-0 mt-2 w-48 bg-white dark:bg-slate-800 border border-slate-200 dark:border-white/10 rounded-lg shadow-lg z-[145] overflow-hidden">
                    <button
                      onClick={() => {
                        setSidebarOpen(true);
                        setShowProfileMenu(false);
                      }}
                      className="w-full flex items-center gap-2 px-4 py-2.5 hover:bg-slate-50 dark:hover:bg-slate-700 text-left text-sm font-medium text-slate-700 dark:text-slate-300"
                    >
                      <Heart className="w-4 h-4 text-[#00A86B]" />
                      Favorites
                    </button>
                    <button
                      onClick={() => {
                        navigate('/my-account');
                        setShowProfileMenu(false);
                      }}
                      className="w-full flex items-center gap-2 px-4 py-2.5 hover:bg-slate-50 dark:hover:bg-slate-700 text-left text-sm font-medium text-slate-700 dark:text-slate-300"
                    >
                      <Settings className="w-4 h-4 text-[#00A86B]" />
                      Settings
                    </button>
                    <div className="border-t border-slate-200 dark:border-white/10" />
                    <button
                      onClick={handleLogout}
                      className="w-full flex items-center gap-2 px-4 py-2.5 hover:bg-red-50 dark:hover:bg-red-900/20 text-left text-sm font-medium text-red-600 dark:text-red-400"
                    >
                      <LogOut className="w-4 h-4" />
                      Logout
                    </button>
                  </div>
                </>
              )}
            </div>
          ) : (
            <button
              onClick={() => navigate('/signin')}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#00A86B] hover:bg-emerald-600 text-white transition-colors"
            >
              <LogIn className="w-4 h-4" />
              <span className="text-xs font-bold">Login</span>
            </button>
          )}
        </div>
      </div>

      {/* Bottom Row: Search Bar */}
      <div className="px-3 sm:px-4 py-2 max-w-7xl mx-auto bg-white dark:bg-slate-900">
        <form onSubmit={handleSearch} className="relative flex items-center gap-2">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 dark:text-slate-500 pointer-events-none" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder={language === 'amharic' ? 'ቤቶች፣ መሬቶች፣ መኪናዎች ይፈልጉ...' : 'Search houses, land, cars, machinery...'}
              className="w-full pl-9 pr-3 py-2 sm:py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-white/10 rounded-lg text-xs sm:text-sm text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-[#00A86B] focus:border-transparent transition-all"
            />
          </div>
          <button
            type="button"
            onClick={() => navigate('/')}
            className="p-2 sm:p-2.5 bg-[#00A86B] hover:bg-emerald-600 text-white rounded-lg transition-colors flex-shrink-0"
            aria-label="Filters"
          >
            <SlidersHorizontal className="w-4 h-4 sm:w-5 sm:h-5" />
          </button>
        </form>
      </div>

      {/* Mobile Menu Dropdown */}
      {showMobileMenu && (
        <>
          <div
            className="fixed inset-0 bg-black/20 z-[140]"
            onClick={() => setShowMobileMenu(false)}
          />
          <div className="absolute top-full left-0 right-0 bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-white/10 shadow-lg z-[145] max-h-[80vh] overflow-y-auto">
            <nav className="py-2">
              <button
                onClick={() => {
                  navigate('/');
                  setShowMobileMenu(false);
                }}
                className="w-full text-left px-6 py-3 hover:bg-slate-50 dark:hover:bg-slate-800 text-sm font-bold text-slate-700 dark:text-slate-300"
              >
                Home
              </button>
              <button
                onClick={() => {
                  navigate('/about');
                  setShowMobileMenu(false);
                }}
                className="w-full text-left px-6 py-3 hover:bg-slate-50 dark:hover:bg-slate-800 text-sm font-bold text-slate-700 dark:text-slate-300"
              >
                About
              </button>
              <button
                onClick={() => {
                  navigate('/contact');
                  setShowMobileMenu(false);
                }}
                className="w-full text-left px-6 py-3 hover:bg-slate-50 dark:hover:bg-slate-800 text-sm font-bold text-slate-700 dark:text-slate-300"
              >
                Contact
              </button>
              <button
                onClick={() => {
                  navigate('/gighub');
                  setShowMobileMenu(false);
                }}
                className="w-full text-left px-6 py-3 hover:bg-slate-50 dark:hover:bg-slate-800 text-sm font-bold text-slate-700 dark:text-slate-300"
              >
                Gig Hub
              </button>
              <button
                onClick={() => {
                  navigate('/agent-onboard');
                  setShowMobileMenu(false);
                }}
                className="w-full text-left px-6 py-3 hover:bg-slate-50 dark:hover:bg-slate-800 text-sm font-bold text-slate-700 dark:text-slate-300"
              >
                Become an Agent
              </button>
            </nav>
          </div>
        </>
      )}
    </header>
      </div>
    </>
  );
};

export default SimpleHeader;
