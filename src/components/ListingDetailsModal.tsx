import React, { useState, useEffect } from 'react';
import { 
  X, Heart, MapPin, ShieldCheck, Phone, Send, 
  ChevronLeft, ChevronRight, CheckCircle2, Sparkles,
  BedDouble, Bath, Layers, Calendar, Share2,
  FileText, Zap, Ruler, Settings, Key, Building2,
  Check
} from 'lucide-react';
import type { ListingItem } from './ZoneCatalogGrid';
import { useFavorites } from '@/contexts/FavoritesContext';
import { useLanguage } from '@/contexts/ZoneLanguageContext';
import { useAuth } from '@/contexts/AuthContext';
import { useNavigate } from 'react-router-dom';

interface ListingDetailsModalProps {
  isOpen: boolean;
  onClose: () => void;
  listing: ListingItem | null;
}

export function ListingDetailsModal({ isOpen, onClose, listing }: ListingDetailsModalProps) {
  const { language } = useLanguage();
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const currentGlobalLang = language === 'amharic' ? 'am' : 'en';
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [activeImageIdx, setActiveImageIdx] = useState(0);
  const { isFavorite: isFav, toggleFavorite } = useFavorites();

  // Lock body scroll when modal is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => { document.body.style.overflow = 'unset'; };
  }, [isOpen]);

  // Reset image index when listing changes
  useEffect(() => {
    setActiveImageIdx(0);
  }, [listing?.id]);

  if (!isOpen || !listing) return null;

  // Build image array from listing data
  const images = listing.images && listing.images.length > 0 
    ? listing.images 
    : [listing.image];

  // Dynamically build specs based on zone type
  const buildSpecs = () => {
    const specs: { labelAm: string; labelEn: string; val: string; icon: React.ReactNode }[] = [];
    
    if (listing.zone === 'house') {
      specs.push(
        { labelAm: 'የንብረት ዓይነት', labelEn: 'Property Class', val: listing.titleDeed ? 'ቪላ / Villa' : 'ቤት / House', icon: <Layers className="w-4 h-4 text-[#00A86B]" /> },
        { labelAm: 'የይዞታ ሁኔታ', labelEn: 'Title Deed', val: listing.titleDeed || 'Standard', icon: <Key className="w-4 h-4 text-[#00A86B]" /> },
      );
      if (listing.bedrooms) specs.push({ labelAm: 'መኝታ ክፍል', labelEn: 'Bedrooms', val: `${listing.bedrooms} ክፍል`, icon: <BedDouble className="w-4 h-4 text-[#00A86B]" /> });
      if (listing.bathrooms) specs.push({ labelAm: 'የሻወር ክፍል', labelEn: 'Bathrooms', val: `${listing.bathrooms} ሻወር`, icon: <Bath className="w-4 h-4 text-[#00A86B]" /> });
      if (listing.sqm) specs.push({ labelAm: 'ስፊት', labelEn: 'Total Area', val: `${listing.sqm} m²`, icon: <Ruler className="w-4 h-4 text-[#00A86B]" /> });
    } else if (listing.zone === 'car') {
      specs.push(
        { labelAm: 'የመኪና ሁኔታ', labelEn: 'Condition', val: listing.condition || 'Standard', icon: <CheckCircle2 className="w-4 h-4 text-[#00A86B]" /> },
      );
      if (listing.plateCode) specs.push({ labelAm: 'የታርጋ ኮድ', labelEn: 'Plate Code', val: listing.plateCode, icon: <FileText className="w-4 h-4 text-[#00A86B]" /> });
      if (listing.fuelType) specs.push({ labelAm: 'የነዳጅ ዓይነት', labelEn: 'Fuel Type', val: listing.fuelType, icon: <Zap className="w-4 h-4 text-[#00A86B]" /> });
    } else if (listing.zone === 'machinery') {
      specs.push(
        { labelAm: 'የምርት ዓይነት', labelEn: 'Equipment Type', val: 'Heavy Machinery', icon: <Layers className="w-4 h-4 text-[#00A86B]" /> },
      );
      if (listing.billingTrack) specs.push({ labelAm: 'የክፍያ መንገድ', labelEn: 'Billing', val: listing.billingTrack, icon: <Settings className="w-4 h-4 text-[#00A86B]" /> });
    } else if (listing.zone === 'ceremony') {
      specs.push(
        { labelAm: 'የስርግ አዳራሽ', labelEn: 'Venue Type', val: 'Ceremony Hall', icon: <Building2 className="w-4 h-4 text-[#00A86B]" /> },
      );
    }

    // Always add location and rating
    specs.push(
      { labelAm: 'መገኛ', labelEn: 'Location', val: listing.locationTag, icon: <MapPin className="w-4 h-4 text-[#00A86B]" /> },
      { labelAm: 'ደረጃ', labelEn: 'Rating', val: `⭐ ${listing.rating}`, icon: <ShieldCheck className="w-4 h-4 text-[#00A86B]" /> },
    );

    return specs;
  };

  const specs = buildSpecs();

  // Bilingual translations
  const t = {
    am: {
      idLabel: `ኮድ: ${listing.id.toUpperCase()}`,
      verified: listing.isVerified ? '🗺️ ካርታ የተረጋገጠ ማህደር' : '📋 መደበኛ ማስታወቂያ',
      priceLabel: 'የሽያጭ/የኪራይ ዋጋ',
      negotiable: 'ድርድር ይቻላል',
      ownerTitle: 'የንብረት አስመዝጋቢ ባለሙያ',
      ownerName: listing.sellerName || 'ባለሙያ ቅርጫ',
      ownerReviews: `⭐⭐⭐⭐⭐ (${listing.rating})`,
      btnCall: 'ቀጥታ ደውል',
      btnTelegram: 'በቴሌግራም አነጋግር',
      btnFavorite: isFav(listing.id) ? 'ተገልብጧል ✓' : 'ለበኋላ አስቀምጥ',
      btnShare: copiedId === listing.id ? 'ተገልብጧል ✓' : 'አጋራት',
      specsTitle: 'ስለ ንብረቱ ዝርዝር መረጃ',
      descTitle: 'ተጨማሪ ማብራሪያ',
    },
    en: {
      idLabel: `ID: ${listing.id.toUpperCase()}`,
      verified: listing.isVerified ? '🗺️ Certified Legal Deed (Carta Verified)' : '📋 Standard Listing',
      priceLabel: 'Master Price Registry',
      negotiable: 'Negotiable',
      ownerTitle: 'Listing Property Expert',
      ownerName: listing.sellerName || 'Listing Expert',
      ownerReviews: `⭐⭐⭐⭐⭐ (${listing.rating} Rating)`,
      btnCall: 'Direct Call',
      btnTelegram: 'Message on Telegram',
      btnFavorite: isFav(listing.id) ? 'Saved ✓' : 'Add to Favorites',
      btnShare: copiedId === listing.id ? 'Copied!' : 'Share',
      specsTitle: 'Comprehensive Specifications',
      descTitle: 'Description',
    }
  }[currentGlobalLang];

  // Get description based on language, with fallbacks
  const getDescription = () => {
    if (currentGlobalLang === 'am' && listing.descriptionAm) return listing.descriptionAm;
    if (currentGlobalLang === 'en' && listing.descriptionEn) return listing.descriptionEn;
    if (listing.descriptionAm) return listing.descriptionAm;
    if (listing.descriptionEn) return listing.descriptionEn;
    return currentGlobalLang === 'am' 
      ? 'ያለ ምንም የደላላ ጣልቃ-ገብነት በቀጥታ ከባለቤቱ የቀረበ ይፋዊ ማህደር። ሁሉም ሰነዶች እና የባለቤትነት ማረጋገጫዎች በ malazone ቴክኖሎጂስ ኃ/የተ/የግል ማህበር የደህንነት ኦዲት አልፈዋል።'
      : 'Direct peer-to-peer connection bypasses middleman friction completely. All title deeds and registration assets have been securely logged under our enterprise platform compliance rules.';
  };

  const title = currentGlobalLang === 'am' ? listing.titleAm : listing.titleEn;
  const priceFormatted = `${listing.price.toLocaleString()} ETB`;

  return (
    <div className="relative z-[300] select-none antialiased font-sans" aria-labelledby="modal-title" role="dialog" aria-modal="true">
      
      {/* Backdrop */}
      <div 
        className="fixed inset-0 bg-black/50 backdrop-blur-sm transition-opacity"
        onClick={onClose}
      />

      {/* Scrollable content area */}
      <div className="fixed inset-0 z-10 overflow-y-auto scroll-smooth">
        <div className="min-h-full">

          {/* Close button - sticky to viewport top-right */}
          <div className="sticky top-0 z-[310] flex justify-end p-4 pointer-events-none">
            <button 
              onClick={onClose}
              className="w-10 h-10 rounded-full bg-white/90 dark:bg-slate-800/90 backdrop-blur-md text-slate-700 dark:text-slate-300 flex items-center justify-center shadow-lg hover:bg-[#00A86B] hover:text-white transition-all duration-300 cursor-pointer border border-slate-200/60 dark:border-white/10 pointer-events-auto"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Main Content */}
          <section className="bg-slate-50 dark:bg-slate-950 text-[#0B132B] dark:text-slate-200 pt-2 pb-12 px-4 sm:px-6 lg:px-8 w-full text-left transition-colors duration-300">
            <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
              
              {/* ═══════════════════════════════════════════════
                  LEFT TRACK: MEDIA + SPECIFICATIONS (68%)
                  ═══════════════════════════════════════════════ */}
              <div className="lg:col-span-8 space-y-6">
                
                {/* 1. BREADCRUMB & BRAND HEADER */}
                <div className="flex justify-between items-center bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200/60 dark:border-white/5 shadow-sm">
                  <span className="text-xs font-black text-slate-400 dark:text-slate-500 font-mono tracking-wider">{t.idLabel}</span>
                  <span className="text-lg font-black tracking-tight text-[#00A86B]">malazone</span>
                </div>

                {/* 2. DYNAMIC CAROUSEL IMAGE SHOWCASE */}
                <div className="relative aspect-[16/10] bg-slate-900 rounded-[32px] overflow-hidden shadow-md group">
                  <img 
                    src={images[activeImageIdx]} 
                    alt={title} 
                    className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-[1.02]" 
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent"></div>
                  
                  {/* Navigation Arrows */}
                  {images.length > 1 && (
                    <>
                      <button 
                        onClick={() => setActiveImageIdx(prev => (prev === 0 ? images.length - 1 : prev - 1))} 
                        className="absolute left-4 top-1/2 -translate-y-1/2 size-10 rounded-full bg-black/40 text-white backdrop-blur-sm flex items-center justify-center hover:bg-[#00A86B] hover:text-black transition-all cursor-pointer"
                      >
                        <ChevronLeft className="size-5" />
                      </button>
                      <button 
                        onClick={() => setActiveImageIdx(prev => (prev === images.length - 1 ? 0 : prev + 1))} 
                        className="absolute right-4 top-1/2 -translate-y-1/2 size-10 rounded-full bg-black/40 text-white backdrop-blur-sm flex items-center justify-center hover:bg-[#00A86B] hover:text-black transition-all cursor-pointer"
                      >
                        <ChevronRight className="size-5" />
                      </button>
                    </>
                  )}
                  
                  {/* Thumbnail strip */}
                  {images.length > 1 && (
                    <div className="absolute bottom-4 left-6 flex space-x-2 z-10">
                      {images.map((img, i) => (
                        <div 
                          key={i} 
                          onClick={() => setActiveImageIdx(i)} 
                          className={`w-14 h-10 rounded-lg overflow-hidden border-2 cursor-pointer shadow-md transition-all ${activeImageIdx === i ? 'border-[#00A86B] scale-105' : 'border-white/80 opacity-60'}`}
                        >
                          <img src={img} className="w-full h-full object-cover" />
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Verified badge overlay */}
                  {listing.isVerified && (
                    <div className="absolute top-4 left-4 z-20">
                      <span className="bg-[#00A86B] text-white font-black text-[10px] uppercase tracking-widest px-4 py-2 rounded-xl shadow-md flex items-center gap-1.5">
                        <ShieldCheck className="w-3.5 h-3.5" />
                        {currentGlobalLang === 'am' ? 'የተረጋገጠ' : 'Verified'}
                      </span>
                    </div>
                  )}

                  {/* Premium badge */}
                  {listing.isPremium && (
                    <div className="absolute top-4 right-14 z-20">
                      <span className="bg-amber-500 text-white font-black text-[10px] uppercase tracking-widest px-3 py-2 rounded-xl shadow-md flex items-center gap-1.5">
                        <Sparkles className="w-3.5 h-3.5" />
                        Premium
                      </span>
                    </div>
                  )}
                </div>

                {/* 3. TITLE + VERIFICATION ROW */}
                <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-white/5 p-6 rounded-3xl shadow-sm dark:shadow-slate-900/50 space-y-3">
                  <div className="inline-flex items-center space-x-1.5 bg-emerald-50 dark:bg-emerald-950/30 text-[#00A86B] border border-emerald-200/50 dark:border-emerald-800/30 px-3 py-1 rounded-xl text-xs font-black uppercase tracking-wider">
                    <ShieldCheck className="size-4" />
                    <span>{t.verified}</span>
                  </div>
                  <h1 className="text-xl sm:text-2xl lg:text-3xl font-black text-[#0B132B] dark:text-white tracking-tight leading-snug">{title}</h1>
                  <div className="flex items-center gap-2 text-sm text-slate-500 dark:text-slate-400 font-bold">
                    <MapPin className="w-4 h-4 text-rose-400" />
                    <span>{listing.locationTag}</span>
                  </div>
                </div>

                {/* 4. SPECIFICATIONS GRID - GE'EZ SAFE */}
                <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-white/5 p-6 sm:p-8 rounded-3xl shadow-sm dark:shadow-slate-900/50 space-y-4">
                  <h3 className="text-xs font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest border-b border-slate-100 dark:border-white/5 pb-3">{t.specsTitle}</h3>
                  
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                    {specs.map((spec, i) => (
                      <div key={i} className="bg-slate-50 dark:bg-slate-800/50 p-4 rounded-2xl flex flex-col space-y-2 border border-slate-100 dark:border-white/5">
                        <div className="flex items-center gap-1.5">
                          {spec.icon}
                          <span className="text-[10px] uppercase font-black text-slate-400 dark:text-slate-500 tracking-wide leading-loose">
                            {currentGlobalLang === 'am' ? spec.labelAm : spec.labelEn}
                          </span>
                        </div>
                        <span className="text-[#0B132B] dark:text-white font-black text-sm">{spec.val}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* 5. NARRATIVE DESCRIPTION */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-white/5 p-6 sm:p-8 rounded-3xl shadow-sm dark:shadow-slate-900/50 space-y-4">
          <h3 className="text-xs font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest">{t.descTitle}</h3>
          <p className="text-sm text-[#0B132B] dark:text-slate-300 font-medium leading-relaxed tracking-wide">
            {getDescription()}
          </p>
        </div>

                {/* 6. TRUST ASSURANCE PROOF BLOCK */}
                <div className="bg-emerald-50/60 dark:bg-emerald-950/20 border border-emerald-200/60 dark:border-emerald-800/30 p-5 rounded-3xl flex items-start space-x-3">
                  <ShieldCheck className="w-6 h-6 text-[#00A86B] shrink-0 mt-0.5" />
                  <div className="space-y-1 text-left">
                    <h4 className="text-xs font-black text-emerald-900 uppercase tracking-wide">
                      {currentGlobalLang === 'am' ? 'በባለሙያ የተረጋገጠ ማህደር' : 'Expert Audited Registry'}
                    </h4>
                    <p className="text-[11px] text-emerald-800 font-medium leading-relaxed">
                      {currentGlobalLang === 'am' 
                        ? 'ይህ ንብረት በማላዞን አድሚኖች አማካኝነት ከከተማ ማዘጋጃ ቤት የይዞታ ሰነዶች እና ከትራንስፖርት ቢሮ መዛግብት ጋር ትክክለኛነቱ በልዩ ሁኔታ የተረጋገጠ ነው።'
                        : 'This listing has been officially cross-verified by malazone administrators against municipal land deeds and regional transport bureau archives.'
                      }
                    </p>
                  </div>
                </div>
              </div>

              {/* ═══════════════════════════════════════════════
                  RIGHT TRACK: TRANSACTION PANEL (32%)
                  ═══════════════════════════════════════════════ */}
              <div className="lg:col-span-4 lg:sticky lg:top-6 space-y-6 mt-6 lg:mt-0">
                
                {/* MASTER PRICE CARD */}
                <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-white/5 p-6 sm:p-8 rounded-[32px] shadow-xl dark:shadow-slate-900/50 space-y-8 relative overflow-hidden">
                  <div className="absolute top-0 left-0 right-0 h-[4px] bg-[#00A86B]" />
                  
                  {/* Price */}
                  <div className="text-left space-y-1.5">
                    <span className="text-[10px] uppercase font-black text-slate-400 dark:text-slate-500 tracking-widest block">{t.priceLabel}</span>
                    <span className="text-2xl sm:text-3xl font-black text-[#0B132B] dark:text-white tracking-tight block">{priceFormatted}</span>
                    <span className="text-xs bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 px-3 py-1 rounded-lg font-black uppercase inline-block mt-2">
                      {t.negotiable}
                    </span>
                  </div>

                  {/* Owner / Agent */}
                  <div className="bg-slate-50 dark:bg-slate-800/50 p-4 rounded-2xl border border-slate-100 dark:border-white/5 flex items-center space-x-4">
                    <div className="w-12 h-12 bg-slate-200 dark:bg-slate-700 rounded-full flex items-center justify-center text-xl shrink-0">
                      👨‍💼
                    </div>
                    <div>
                      <p className="text-[10px] uppercase font-black text-slate-400 dark:text-slate-500 tracking-wider">{t.ownerTitle}</p>
                      <p className="text-sm font-black text-[#0B132B] dark:text-white">{t.ownerName}</p>
                      <p className="text-[10px] text-amber-500 font-black mt-0.5">{t.ownerReviews}</p>
                    </div>
                  </div>

                  {/* Action Buttons */}
                  <div className="space-y-3">
                    <a 
                      href={`tel:${listing.phone}`}
                      className="w-full bg-[#0B132B] dark:bg-[#00A86B] hover:bg-slate-800 dark:hover:bg-emerald-600 text-white py-4 rounded-xl transition-all duration-300 flex items-center justify-center space-x-2 cursor-pointer shadow-sm active:scale-[0.98] no-underline"
                    >
                      <Phone className="size-5" />
                      <span className="font-black tracking-wider uppercase text-xs">{t.btnCall}</span>
                    </a>
                    
                    <a 
                      href={`https://t.me/${listing.whatsapp}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="w-full bg-[#24A1DE] hover:bg-[#1c8ec7] text-white py-4 rounded-xl transition-all duration-300 flex items-center justify-center space-x-2 cursor-pointer shadow-sm hover:shadow-[0_6px_15px_rgba(36,161,222,0.35)] active:scale-[0.98] no-underline"
                    >
                      <Send className="size-5 -ml-1 translate-y-[1px]" />
                      <span className="font-black tracking-wider uppercase text-xs">{t.btnTelegram}</span>
                    </a>
                    
                    <button 
                      onClick={() => {
                        if (!isAuthenticated) {
                          onClose();
                          navigate('/signin');
                          return;
                        }
                        toggleFavorite(listing);
                      }} 
                      className={`w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-white/10 py-3.5 rounded-xl transition-all flex items-center justify-center space-x-2 cursor-pointer active:scale-[0.98] ${isFav(listing.id) ? 'bg-rose-50 dark:bg-rose-950/20 border-rose-100 dark:border-rose-800/30' : 'hover:bg-slate-50 dark:hover:bg-slate-800'}`}
                    >
                      <Heart className={`size-5 transition-colors ${isFav(listing.id) ? 'fill-rose-500 text-rose-500' : 'text-slate-400 dark:text-slate-500'}`} />
                      <span className={`font-black tracking-wider uppercase text-xs ${isFav(listing.id) ? 'text-rose-600' : 'text-slate-600 dark:text-slate-400'}`}>
                        {t.btnFavorite}
                      </span>
                    </button>

                    <button
                      onClick={() => {
                        const url = `${window.location.origin}/listing/${listing.id}`;
                        if (navigator.share) {
                          navigator.share({ title: listing.titleEn, url }).catch(() => {});
                        } else {
                          navigator.clipboard.writeText(url).then(() => {
                            setCopiedId(listing.id);
                            setTimeout(() => setCopiedId(null), 2000);
                          }).catch(() => {});
                        }
                      }}
                      className="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-white/10 py-3.5 rounded-xl transition-all flex items-center justify-center space-x-2 cursor-pointer active:scale-[0.98] hover:bg-slate-50 dark:hover:bg-slate-800"
                    >
                      {copiedId === listing.id ? (
                        <Check className="size-5 text-emerald-500" />
                      ) : (
                        <Share2 className="size-5 text-slate-400 dark:text-slate-500" />
                      )}
                      <span className="font-black tracking-wider uppercase text-xs text-slate-600 dark:text-slate-400">
                        {t.btnShare}
                      </span>
                    </button>
                  </div>
                </div>
                
              </div>
            </div>
          </section>

        </div>
      </div>
    </div>
  );
}
