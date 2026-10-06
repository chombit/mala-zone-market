/**
 * BrowseByLocation.tsx
 * Malazone.com — Location-Based Browsing Section
 * Displays cities with listing counts and navigation
 * © 2026 Malazone Technologies PLC
 */

import React, { useState, useEffect } from 'react';
import { MapPin, ArrowRight } from 'lucide-react';
import { useLanguage } from '@/contexts/ZoneLanguageContext';
import { pickDbLabel } from '@/utils/dbLabel';

interface Location {
  id: number;
  key_name: string;
  label_en: string;
  label_am: string;
  label_sid?: string | null;
  sub_zones: any;
  listing_count?: number;
}

interface BrowseByLocationProps {
  onLocationSelect: (locationKey: string) => void;
  activeLocation?: string;
}

// Fallback location images (Unsplash city/landscape images)
const LOCATION_IMAGES: Record<string, string> = {
  hawassa: 'https://images.unsplash.com/photo-1523805009345-7448845a9e53?w=800&q=80&fm=webp',
  addis_ababa: 'https://images.unsplash.com/photo-1611348524140-53c9a25263d6?w=800&q=80&fm=webp',
  yirgalem: 'https://images.unsplash.com/photo-1469854523086-cc02fe5d8800?w=800&q=80&fm=webp',
  dilla: 'https://images.unsplash.com/photo-1501594907352-04cda38ebc29?w=800&q=80&fm=webp',
  bensa: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=800&q=80&fm=webp',
  aleta_wondo: 'https://images.unsplash.com/photo-1500534314209-a25ddb2bd429?w=800&q=80&fm=webp',
  chuko: 'https://images.unsplash.com/photo-1433086966358-54859d0ed716?w=800&q=80&fm=webp',
};

const FALLBACK_LOCATIONS: Location[] = [
  { id: 1, key_name: 'hawassa', label_en: 'Hawassa', label_am: 'ሐዋሳ', label_sid: 'Hawwissaa', sub_zones: null, listing_count: 245 },
  { id: 2, key_name: 'addis_ababa', label_en: 'Addis Ababa', label_am: 'አዲስ አበበ', label_sid: 'Addis Abbaa', sub_zones: null, listing_count: 892 },
  { id: 3, key_name: 'yirgalem', label_en: 'Yirgalem', label_am: 'ይርጋለም', label_sid: 'Yirgaaleem', sub_zones: null, listing_count: 128 },
  { id: 4, key_name: 'dilla', label_en: 'Dilla', label_am: 'ዲላ', label_sid: 'Diilla', sub_zones: null, listing_count: 156 },
  { id: 5, key_name: 'bensa', label_en: 'Bensa', label_am: 'በንሳ', label_sid: 'Bensaa/Daaye', sub_zones: null, listing_count: 89 },
  { id: 6, key_name: 'aleta_wondo', label_en: 'Aleta Wondo', label_am: 'አለታ ወንዶ', label_sid: 'Aletaa Wondoo', sub_zones: null, listing_count: 67 },
];

export function BrowseByLocation({ onLocationSelect, activeLocation }: BrowseByLocationProps) {
  const { language } = useLanguage();
  const currentLang = language === 'amharic' ? 'am' : 'en';
  const [locations, setLocations] = useState<Location[]>(FALLBACK_LOCATIONS);
  const [loading, setLoading] = useState(true);

  const t = {
    am: {
      heading: 'በቦታ አስስ',
      seeAll: 'ሁሉንም አሳይ',
      listings: 'ዝርዝሮች',
    },
    en: {
      heading: 'Browse by Location',
      seeAll: 'See All',
      listings: 'Listings',
    },
  }[currentLang];

  useEffect(() => {
    const fetchLocations = async () => {
      try {
        const response = await fetch('/api/locations');
        const data = await response.json();
        
        if (data.success && Array.isArray(data.data)) {
          // Fetch listing counts for each location
          const locationsWithCounts = await Promise.all(
            data.data.map(async (loc: Location) => {
              try {
                const listingsRes = await fetch(`/api/listings/count?location=${loc.key_name}`);
                const listingsData = await listingsRes.json();
                return {
                  ...loc,
                  listing_count: listingsData.success ? listingsData.count : 0,
                };
              } catch {
                return {
                  ...loc,
                  listing_count: 0,
                };
              }
            })
          );
          
          // Filter out locations with 0 listings and take top 10
          const activeLocations = locationsWithCounts
            .filter(loc => loc.listing_count > 0)
            .sort((a, b) => (b.listing_count || 0) - (a.listing_count || 0))
            .slice(0, 10);
          
          setLocations(activeLocations.length > 0 ? activeLocations : FALLBACK_LOCATIONS);
        } else {
          setLocations(FALLBACK_LOCATIONS);
        }
      } catch (error) {
        console.error('Failed to fetch locations:', error);
        setLocations(FALLBACK_LOCATIONS);
      } finally {
        setLoading(false);
      }
    };

    fetchLocations();
  }, []);

  const handleSeeAll = () => {
    // Scroll to the listings catalog section
    const catalogSection = document.getElementById('listings-catalog');
    if (catalogSection) {
      catalogSection.scrollIntoView({ behavior: 'smooth' });
    }
  };

  if (loading) {
    return (
      <section className="w-full bg-white dark:bg-slate-950 py-6 sm:py-8 transition-colors duration-300">
        <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8">
          <div className="h-8 bg-slate-200 dark:bg-slate-800 rounded animate-pulse w-48 mb-6"></div>
          <div className="relative -mx-4 sm:-mx-6 lg:-mx-8">
            <div className="overflow-x-auto scrollbar-hide px-4 sm:px-6 lg:px-8">
              <div className="flex gap-3 sm:gap-4 pb-2">
                {[...Array(6)].map((_, i) => (
                  <div key={i} className="flex-shrink-0 w-[160px] sm:w-[180px] h-36 sm:h-40 bg-slate-200 dark:bg-slate-800 rounded-2xl animate-pulse"></div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="w-full bg-white dark:bg-slate-950 py-6 sm:py-8 transition-colors duration-300">
      <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white tracking-tight">
            {t.heading}
          </h2>
          <button
            onClick={handleSeeAll}
            className="flex items-center gap-2 text-sm font-bold text-[#00A86B] hover:text-emerald-600 transition-colors group"
          >
            <span>{t.seeAll}</span>
            <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
          </button>
        </div>

        {/* Horizontal Scrollable Location Cards */}
        <div className="relative -mx-4 sm:-mx-6 lg:-mx-8">
          <div className="overflow-x-auto scrollbar-hide px-4 sm:px-6 lg:px-8">
            <div className="flex gap-3 sm:gap-4 pb-2">
              {locations.map((location) => {
                const isActive = activeLocation === location.key_name;
                return (
                  <button
                    key={location.id}
                    onClick={() => onLocationSelect(location.key_name)}
                    className={`group relative flex-shrink-0 w-[160px] sm:w-[180px] h-36 sm:h-40 rounded-2xl overflow-hidden shadow-md hover:shadow-xl transition-all duration-300 cursor-pointer transform hover:-translate-y-1 ${isActive ? 'ring-4 ring-[#00A86B] ring-offset-2 dark:ring-offset-slate-950 scale-[1.02]' : ''}`}
                  >
                    {/* Background Image */}
                    <div 
                      className="absolute inset-0 bg-cover bg-center transition-transform duration-500 group-hover:scale-110"
                      style={{ 
                        backgroundImage: `url(${LOCATION_IMAGES[location.key_name] || LOCATION_IMAGES.hawassa})` 
                      }}
                    />
                    
                    {/* Gradient Overlay */}
                    <div className={`absolute inset-0 bg-gradient-to-t via-black/40 to-transparent ${isActive ? 'from-[#00A86B]/90' : 'from-black/80'}`} />
                    
                    {/* Content */}
                    <div className="absolute inset-0 p-3 sm:p-4 flex flex-col justify-end">
                      <div className="flex items-center gap-1.5 mb-1">
                        <MapPin className={`w-4 h-4 flex-shrink-0 ${isActive ? 'text-white' : 'text-[#00A86B]'}`} />
                        <h3 className="text-sm sm:text-base font-black text-white truncate">
                          {pickDbLabel(location, language)}
                        </h3>
                      </div>
                      <p className="text-xs font-bold text-white/90">
                        {location.listing_count} {t.listings}
                      </p>
                    </div>

                    {/* Active / Hover Effect Border */}
                    <div className={`absolute inset-0 border-2 rounded-2xl transition-colors duration-300 pointer-events-none ${isActive ? 'border-white' : 'border-transparent group-hover:border-[#00A86B]'}`} />
                    
                    {/* Active Badge */}
                    {isActive && (
                      <div className="absolute top-2 right-2 px-2 py-0.5 bg-white text-[#00A86B] text-[10px] font-black rounded-full shadow-lg uppercase tracking-wider">
                        ✓ {currentLang === 'am' ? 'ተመረጠ' : 'Selected'}
                      </div>
                    )}
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* Custom CSS for hiding scrollbar */}
        <style>{`
          .scrollbar-hide::-webkit-scrollbar {
            display: none;
          }
          .scrollbar-hide {
            -ms-overflow-style: none;
            scrollbar-width: none;
          }
        `}</style>

      </div>
    </section>
  );
}
