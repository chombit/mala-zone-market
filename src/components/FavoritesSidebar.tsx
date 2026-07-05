import React, { useState } from 'react';
import { X, HeartCrack, Phone, Send, MapPin, CheckCircle2, Trash2 } from 'lucide-react';
import { useFavorites } from '../contexts/FavoritesContext';
import { useLanguage } from '../contexts/ZoneLanguageContext';
import { ListingDetailsModal } from './ListingDetailsModal';
import type { ListingItem } from './ZoneCatalogGrid';

export const FavoritesSidebar: React.FC = () => {
  const { favorites, isSidebarOpen, setSidebarOpen, toggleFavorite } = useFavorites();
  const { language, t } = useLanguage();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedListing, setSelectedListing] = useState<ListingItem | null>(null);

  const handleFavoriteItemClick = (item: ListingItem) => {
    setSelectedListing(item);
    setIsModalOpen(true);
  };

  if (!isSidebarOpen) return null;

  return (
    <>
      {/* Light backdrop — no blur, no dark overlay */}
      <div 
        className="fixed inset-0 bg-black/10 z-[200] transition-all duration-300 ease-out"
        onClick={() => setSidebarOpen(false)}
      />

      {/* Sidebar Panel */}
      <div className="fixed inset-y-0 right-0 w-full max-w-[380px] bg-white shadow-[-8px_0_24px_rgba(0,0,0,0.08)] z-[200] flex flex-col transform transition-transform duration-500 ease-out translate-x-0 border-l border-slate-100">
        
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100">
          <div>
            <h2 className="text-lg font-black text-[#00A86B] leading-tight">
              {language === 'amharic' ? 'የተመረጡ ዕቃዎች' : 'Your Favorites'}
            </h2>
            <p className="text-[11px] font-bold text-slate-400 mt-0.5">
              {favorites.length} {language === 'amharic' ? 'ዕቃዎች ተቀምጠዋል' : 'items saved'}
            </p>
          </div>
          <button 
            onClick={() => setSidebarOpen(false)}
            className="w-8 h-8 flex items-center justify-center hover:bg-slate-100 rounded-full transition-all text-slate-400 hover:text-slate-600"
          >
            <X className="w-4.5 h-4.5" />
          </button>
        </div>

        {/* Content Body */}
        <div className="flex-1 overflow-y-auto p-4 space-y-3 custom-scrollbar">
          {favorites.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-center opacity-70">
              <div className="w-20 h-20 bg-slate-100 rounded-full flex items-center justify-center mb-5">
                <HeartCrack className="w-10 h-10 text-slate-300" />
              </div>
              <h3 className="text-lg font-bold text-slate-600 mb-2">
                {language === 'amharic' ? 'ባዶ ነው' : 'It\'s empty here'}
              </h3>
              <p className="text-sm text-slate-400 font-medium max-w-[220px]">
                {language === 'amharic' ? 'ምንም የተመረጠ ነገር የለም። ከዋናው ገጽ ላይ ዕቃዎችን ይምረጡ።' : 'You haven\'t saved any listings yet. Browse the catalog and tap the heart icon!'}
              </p>
            </div>
          ) : (
            favorites.map((item, i) => (
              <div 
                key={item.id} 
                style={{ animationDelay: `${i * 60}ms` }}
                onClick={() => handleFavoriteItemClick(item)}
                className="flex gap-3.5 p-3 rounded-2xl bg-white border border-slate-100 hover:border-[#00A86B]/40 transition-all duration-300 group relative shadow-[0_1px_3px_rgba(0,0,0,0.04)] hover:shadow-md cursor-pointer animate-in slide-in-from-right-8 fade-in fill-mode-both"
              >
                {/* Image */}
                <div className="w-[80px] h-[80px] rounded-xl overflow-hidden relative flex-shrink-0">
                  <img src={item.image} alt="listing" className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                  
                  {item.isVerified && (
                    <div className="absolute top-1.5 left-1.5 bg-white rounded-full p-0.5 shadow-sm">
                      <CheckCircle2 className="w-3 h-3 text-[#00A86B]" />
                    </div>
                  )}
                </div>

                {/* Details */}
                <div className="flex-1 flex flex-col min-w-0 py-0.5">
                  <h4 className="text-[12px] font-extrabold text-slate-800 line-clamp-2 leading-tight group-hover:text-[#00A86B] transition-colors pr-6">
                    {language === 'amharic' ? item.titleAm : item.titleEn}
                  </h4>
                  <div className="text-[10px] font-bold text-slate-400 mt-1 flex items-center gap-1">
                    <MapPin className="w-2.5 h-2.5 text-rose-400" /> {item.locationTag}
                  </div>
                  
                  <div className="mt-auto pt-1.5 flex items-end justify-between">
                    <div className="flex items-baseline gap-1">
                      <span className="text-[14px] font-black text-slate-900">
                        {item.price.toLocaleString()}
                      </span>
                      <span className="text-[8px] font-bold text-slate-400 uppercase">
                        {t(item.priceSuffixKey as any)}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Remove button */}
                <button 
                  onClick={(e) => {
                    e.stopPropagation();
                    toggleFavorite(item);
                  }}
                  className="absolute -top-1.5 -right-1.5 w-5.5 h-5.5 bg-white rounded-full flex items-center justify-center shadow border border-slate-200 hover:bg-rose-500 hover:border-rose-500 hover:text-white text-slate-300 transition-all opacity-0 group-hover:opacity-100 z-10"
                  aria-label="Remove from favorites"
                >
                  <Trash2 className="w-2.5 h-2.5" />
                </button>

                {/* Contact Actions */}
                <div className="absolute bottom-2.5 right-2.5 flex gap-1">
                  <a 
                    href={`tel:${item.phone}`} 
                    onClick={(e) => e.stopPropagation()}
                    className="w-7 h-7 rounded-full bg-slate-50 flex items-center justify-center hover:bg-slate-100 transition-all text-slate-500"
                  >
                    <Phone className="w-3 h-3" />
                  </a>
                  <a 
                    href={`https://wa.me/${item.whatsapp}`} 
                    target="_blank" 
                    rel="noopener noreferrer" 
                    onClick={(e) => e.stopPropagation()}
                    className="w-7 h-7 rounded-full bg-[#00A86B] text-white flex items-center justify-center hover:bg-emerald-600 transition-all"
                  >
                    <Send className="w-3 h-3" />
                  </a>
                </div>
              </div>
            ))
          )}
        </div>

      </div>

      <ListingDetailsModal 
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        listing={selectedListing}
        currentGlobalLang={language === 'amharic' ? 'am' : 'en'}
      />
    </>
  );
};
