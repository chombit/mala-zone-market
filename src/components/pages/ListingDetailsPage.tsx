import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Heart,
  Sparkles,
  ShieldCheck,
  MapPin,
  Star,
  Phone,
  Send,
  ChevronLeft,
  ChevronRight,
  Grid,
  X,
  Share2,
  Copy,
  Printer,
  Check
} from 'lucide-react';
import type { ListingItem } from '../ZoneCatalogGrid';
import { getListingById, getRelatedListings } from '../../data/listings';
import { useLanguage } from '../../contexts/ZoneLanguageContext';
import Header from '../Header';
import Footer from '../Footer';
import { FavoritesProvider, useFavorites } from '../../contexts/FavoritesContext';

// Translation helpers
const translateCondition = (condition: string | undefined, lang: 'am' | 'en'): string => {
  if (!condition) return '';
  if (lang === 'am') {
    if (condition === 'Zero Mileage') return 'አዲስ ዜሮ';
    if (condition === 'Excellent') return 'በጣም ምርጥ';
    if (condition === 'Locally Used') return 'ያገር ውስጥ ጥቅም ላይ ያወጠ';
  }
  return condition;
};

const translatePlateCode = (plateCode: string | undefined, lang: 'am' | 'en'): string => {
  if (!plateCode) return '';
  if (lang === 'am') {
    return plateCode.replace('CODE', 'ኮድ');
  }
  return plateCode;
};

const translateFuelType = (fuelType: string | undefined, lang: 'am' | 'en'): string => {
  if (!fuelType) return '';
  if (lang === 'am') {
    if (fuelType === 'Benzine') return 'ቤንዚን';
    if (fuelType === 'Hybrid / Electric') return 'ሃይብሪድ / ኤሌክትሪክ';
    if (fuelType === 'Electric') return 'ኤሌክትሪክ';
  }
  return fuelType;
};

// Specifications Grid Component
interface SpecsGridProps {
  listing: ListingItem;
  currentGlobalLang: 'am' | 'en';
}

function SpecsGrid({ listing, currentGlobalLang }: SpecsGridProps) {
  // Build specs data based on listing type
  const buildSpecs = () => {
    if (listing.zone === 'car') {
      return {
        am: {
          sectionTitle: "ስለ ንብረቱ ዝርዝር መረጃ",
          specs: [
            { label: "የመኪና ሁኔታ", val: translateCondition(listing.condition, 'am') },
            { label: "የሰሌዳ ኮድ", val: translatePlateCode(listing.plateCode, 'am') },
            { label: "የነዳጅ ዓይነት", val: translateFuelType(listing.fuelType, 'am') },
            { label: "አድራሻ / ሰፈር", val: listing.locationTag },
            { label: "የደረጃ ውጤት", val: `${listing.rating} ማርክ` }
          ]
        },
        en: {
          sectionTitle: "Comprehensive Technical Specifications",
          specs: [
            { label: "Vehicle Condition", val: translateCondition(listing.condition, 'en') },
            { label: "License Plate", val: translatePlateCode(listing.plateCode, 'en') },
            { label: "Fuel Type", val: translateFuelType(listing.fuelType, 'en') },
            { label: "Location", val: listing.locationTag },
            { label: "Rating", val: `${listing.rating} Stars` }
          ]
        }
      }[currentGlobalLang];
    } else if (listing.zone === 'house') {
      const specsAm = [
        { label: "የንብረት ዓይነት", val: listing.bedrooms ? 'ቪላ' : 'መሬት' },
        { label: "የሰነድ ሁኔታ", val: listing.titleDeed || 'መደበኛ' },
      ];
      if (listing.sqm) specsAm.push({ label: "ጠቅላላ ስፋት", val: `${listing.sqm} ሜትር²` });
      if (listing.bedrooms) specsAm.push({ label: "መኝታ ቤቶች", val: listing.bedrooms.toString() });
      if (listing.bathrooms) specsAm.push({ label: "ሽንት ቤቶች", val: listing.bathrooms.toString() });
      specsAm.push({ label: "አድራሻ / ሰፈር", val: listing.locationTag });
      specsAm.push({ label: "የደረጃ ውጤት", val: `${listing.rating} ማርክ` });

      const specsEn = [
        { label: "Property Type", val: listing.bedrooms ? 'Villa' : 'Land' },
        { label: "Deed Status", val: listing.titleDeed || 'Standard' },
      ];
      if (listing.sqm) specsEn.push({ label: "Total Area", val: `${listing.sqm} m²` });
      if (listing.bedrooms) specsEn.push({ label: "Bedrooms", val: listing.bedrooms.toString() });
      if (listing.bathrooms) specsEn.push({ label: "Bathrooms", val: listing.bathrooms.toString() });
      specsEn.push({ label: "Location", val: listing.locationTag });
      specsEn.push({ label: "Rating", val: `${listing.rating} Stars` });

      return {
        am: {
          sectionTitle: "ስለ ንብረቱ ዝርዝር መረጃ",
          specs: specsAm
        },
        en: {
          sectionTitle: "Comprehensive Property Details",
          specs: specsEn
        }
      }[currentGlobalLang];
    } else if (listing.zone === 'machinery') {
      return {
        am: {
          sectionTitle: "ስለ ንብረቱ ዝርዝር መረጃ",
          specs: [
            { label: "የማሽነሪ ዓይነት", val: 'ከባድ ማሽነሪ' },
            { label: "የክፍያ መንገድ", val: listing.billingTrack || 'N/A' },
            { label: "አድራሻ / ሰፈር", val: listing.locationTag },
            { label: "የደረጃ ውጤት", val: `${listing.rating} ማርክ` }
          ]
        },
        en: {
          sectionTitle: "Comprehensive Equipment Details",
          specs: [
            { label: "Equipment Type", val: 'Heavy Machinery' },
            { label: "Billing Method", val: listing.billingTrack || 'N/A' },
            { label: "Location", val: listing.locationTag },
            { label: "Rating", val: `${listing.rating} Stars` }
          ]
        }
      }[currentGlobalLang];
    } else if (listing.zone === 'ceremony') {
      return {
        am: {
          sectionTitle: "ስለ ንብረቱ ዝርዝር መረጃ",
          specs: [
            { label: "የአገልግሎት ዓይነት", val: 'የሰርግ/ኢቨንት አዳራሽ' },
            { label: "አድራሻ / ሰፈር", val: listing.locationTag },
            { label: "የደረጃ ውጤት", val: `${listing.rating} ማርክ` }
          ]
        },
        en: {
          sectionTitle: "Comprehensive Venue Details",
          specs: [
            { label: "Venue Type", val: 'Wedding & Event Hall' },
            { label: "Location", val: listing.locationTag },
            { label: "Rating", val: `${listing.rating} Stars` }
          ]
        }
      }[currentGlobalLang];
    }
    return {
      am: { sectionTitle: "ስለ ንብረቱ ዝርዝር መረጃ", specs: [] },
      en: { sectionTitle: "Comprehensive Details", specs: [] }
    }[currentGlobalLang];
  };

  const t = buildSpecs();

  return (
    <div className="w-full bg-white border border-slate-200 p-6 sm:p-8 rounded-[32px] shadow-sm text-left select-none font-sans antialiased">
      <div className="space-y-5">
        <div className="border-b border-slate-100 pb-3 flex items-center space-x-2">
          <div className="w-1.5 h-4 bg-[#00A86B] rounded-full" />
          <h3 className="text-sm font-black text-slate-900 uppercase tracking-wider font-sans">
            {t.sectionTitle}
          </h3>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 text-xs font-bold text-slate-700">
          {t.specs.map((item, idx) => (
            <div
              key={idx}
              className="
                bg-slate-50/80 border border-slate-200/50 p-5 rounded-2xl
                flex flex-col space-y-1.5 transition-all duration-300
                hover:border-[#00A86B]/30 hover:bg-white hover:shadow-sm
              "
            >
              <span className="text-[10px] uppercase font-black text-slate-400 tracking-wider block leading-relaxed">
                {item.label}
              </span>
              <span className="text-slate-900 font-black text-xs sm:text-[13px] tracking-tight truncate flex items-center gap-1">
                {item.label.includes('ደረጃ') || item.label.includes('Rating') ? (
                  <span className="text-amber-500 flex items-center gap-1">
                    <Star className="size-3.5 fill-current" /> {item.val}
                  </span>
                ) : (
                  <span className="font-sans">{item.val}</span>
                )}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

const ListingDetailsContent = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { language } = useLanguage();
  const { isFavorite, toggleFavorite } = useFavorites();
  const [activeImageIdx, setActiveImageIdx] = useState(0);
  const [isFavoriteLocal, setIsFavoriteLocal] = useState(false);
  const [showLightbox, setShowLightbox] = useState(false);
  const [copySuccess, setCopySuccess] = useState(false);

  const listing = id ? getListingById(id) : undefined;
  const relatedListings = id ? getRelatedListings(id, 3) : [];

  useEffect(() => {
    if (listing) {
      setIsFavoriteLocal(isFavorite(listing.id));
    }
  }, [listing, isFavorite]);

  if (!listing) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-slate-800 mb-4">Listing Not Found</h2>
          <button
            onClick={() => navigate('/')}
            className="bg-[#00A86B] text-white px-8 py-3 rounded-xl font-bold hover:bg-emerald-600 transition-colors"
          >
            Back to Homepage
          </button>
        </div>
      </div>
    );
  }

  const currentGlobalLang = language === 'amharic' ? 'am' : 'en';
  const images = listing.images && listing.images.length > 0
    ? listing.images
    : [listing.image];

  // Full page translation dictionary
  const t = {
    am: {
      btnBack: "ወደ መነሻ ገጽ ተመለስ",
      btnOtherZones: "ሌሎች የንግድ ዞኖች",
      idLabel: `ኮድ: ${listing.id.toUpperCase()}`,
      verifiedBadge: listing.isVerified ? "🛡️ ሊብሬ የተረጋገጠ ማህደር" : "📋 መደበኛ ማህደር",
      title: listing.titleAm,
      priceLabel: "የሽያጭ ጠቅላላ ዋጋ",
      priceValue: `${listing.price.toLocaleString()} ብር`,
      negotiable: "ድርድር ይቻላል",
      ownerTitle: "የንብረት አስመዝጋቢ ባለሙያ",
      ownerName: "malazone Agent",
      ownerReviews: `⭐⭐⭐⭐⭐ (${listing.rating} ማርክ)`,
      btnCall: "ቀጥታ ደውል",
      btnTelegram: "በቴሌግራም አነጋግር",
      btnFavorite: isFavoriteLocal ? "ተቀምጧል" : "ለበኋላ አስቀምጥ",
      descTitle: "ተጨማሪ ማብራሪያ",
      descBody: listing.descriptionAm || "ያለ ምንም የደላላ ጣልቃ-ገብነት በቀጥታ ከባለቤቱ የቀረበ ይፋዊ የንግድ ማህደር።",
      auditTitle: "በአምራችና በባለሙያ የተረጋገጠ",
      auditBody: "ይህ ንብረት በኪራይ/በሽያጭ አቀራረቡ በከተማ ማዘጋጃ ቤት ሰነዶች እና በትራንስፖርት ቢሮ መዛግብት ጋር ትክክለኛነቱ በሕጋዊ መንገድ የተረጋገጠ ነው።",
      relatedListings: "ተመሳሳይ ማህደሮች",
      viewDetails: "ዝርዝሮችን ይመልከቱ",
      share: "አጋራት",
      print: "ትርም",
      copyLink: "ማገናኛ አስገብ",
      copied: "ተገላብጧል!",
      viewOnMap: "በካርታ ላይ ይመልከቱ",
    },
    en: {
      btnBack: "Back to Homepage",
      btnOtherZones: "Explore Other Zones",
      idLabel: `ID: ${listing.id.toUpperCase()}`,
      verifiedBadge: listing.isVerified ? "🛡️ Libre Record Verified" : "📋 Standard Listing",
      title: listing.titleEn,
      priceLabel: "Master Price Registry",
      priceValue: `${listing.price.toLocaleString()} ETB`,
      negotiable: "Negotiable",
      ownerTitle: "Listing Portfolio Expert",
      ownerName: "malazone Agent",
      ownerReviews: `⭐⭐⭐⭐⭐ (${listing.rating} Rating)`,
      btnCall: "Direct Call",
      btnTelegram: "Message on Telegram",
      btnFavorite: isFavoriteLocal ? "Saved" : "Add to Saved Items",
      descTitle: "Strategic Narrative Overview",
      descBody: listing.descriptionEn || "Direct peer-to-peer connection bypasses middleman friction completely.",
      auditTitle: "Expert Audited Registry",
      auditBody: "This listing has been officially cross-verified by malazone administrators against regional archives.",
      relatedListings: "Related Listings",
      viewDetails: "View Details",
      share: "Share",
      print: "Print",
      copyLink: "Copy Link",
      copied: "Copied!",
      viewOnMap: "View on Map",
    }
  }[currentGlobalLang];

  const handleToggleFavorite = () => {
    toggleFavorite(listing);
    setIsFavoriteLocal(!isFavoriteLocal);
  };

  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(window.location.href);
      setCopySuccess(true);
      setTimeout(() => setCopySuccess(false), 2000);
    } catch (err) {
      console.error('Failed to copy link:', err);
    }
  };

  const handleShare = () => {
    if (navigator.share) {
      navigator.share({
        title: currentGlobalLang === 'am' ? listing.titleAm : listing.titleEn,
        text: currentGlobalLang === 'am' ? listing.descriptionAm : listing.descriptionEn,
        url: window.location.href,
      });
    } else {
      handleCopyLink();
    }
  };

  const handlePrint = () => {
    window.print();
  };

  const handleViewOnMap = () => {
    const query = encodeURIComponent(`${listing.locationTag}, Hawassa, Ethiopia`);
    window.open(`https://www.google.com/maps/search/?api=1&query=${query}`, '_blank');
  };

  const nextImage = () => {
    setActiveImageIdx((prev) => (prev === images.length - 1 ? 0 : prev + 1));
  };

  const prevImage = () => {
    setActiveImageIdx((prev) => (prev === 0 ? images.length - 1 : prev - 1));
  };

  return (
    <section className="bg-slate-50 dark:bg-slate-950 text-[#0B132B] dark:text-slate-200 min-h-screen transition-colors duration-300">
      {/* Header */}
      <div className="sticky top-0 z-50">
        <Header activeCategory="all" onCategoryChange={() => {}} />
      </div>

      {/* Main Content */}
      <div className="pt-40 pb-12 px-4 sm:px-8 lg:px-16">
        <div className="max-w-6xl mx-auto space-y-6">
          
          {/* Top Premium Navigation Utility Bar */}
          <div className="flex flex-col lg:flex-row items-center justify-between gap-4 bg-white dark:bg-slate-900 p-5 sm:p-6 rounded-[32px] border border-slate-200/80 dark:border-white/5 shadow-md dark:shadow-slate-900/50">
            <button
              onClick={() => navigate('/')}
              className="flex items-center justify-center space-x-2 bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs uppercase tracking-widest px-6 py-3.5 rounded-2xl transition-all duration-300 cursor-pointer shadow-md hover:shadow-lg w-full lg:w-auto"
            >
              <ChevronLeft className="size-5 text-[#00A86B]" />
              <span>{t.btnBack}</span>
            </button>
            
            <div className="flex items-center space-x-3">
              <span className="bg-slate-50 dark:bg-slate-800 px-4 py-2 rounded-2xl border border-slate-200 dark:border-white/10 text-xs font-bold text-slate-500 dark:text-slate-400 font-mono">
                {t.idLabel}
              </span>
              <span className="text-[#00A86B] text-base font-black tracking-tight">
                malazone
              </span>
            </div>

            <button
              onClick={() => navigate('/')}
              className="flex items-center justify-center space-x-2 border-2 border-slate-200 dark:border-white/10 hover:border-[#00A86B] bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-300 font-bold text-xs uppercase tracking-widest px-6 py-3.5 rounded-2xl transition-all duration-300 cursor-pointer hover:bg-emerald-50 dark:hover:bg-emerald-950/30 w-full lg:w-auto"
            >
              <Grid className="size-5 text-[#00A86B]" />
              <span>{t.btnOtherZones}</span>
            </button>
          </div>

          {/* Main Split Layout */}
          <div className="flex flex-col lg:flex-row gap-8 items-start">
            
            {/* Left Content Block */}
            <div className="w-full lg:w-[68%] space-y-6">
              
              <div className="space-y-4">
                {/* Image Slider */}
                <div 
                  className="relative aspect-[16/9] bg-slate-900 rounded-[32px] overflow-hidden shadow-xl group cursor-pointer"
                  onClick={() => setShowLightbox(true)}
                >
                  <img 
                    src={images[activeImageIdx]} 
                    alt={t.title} 
                    className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-[1.03]" 
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent" />
                  
                  {images.length > 1 && (
                    <>
                      <button
                        onClick={(e) => { e.stopPropagation(); prevImage(); }}
                        className="absolute left-5 top-1/2 -translate-y-1/2 w-12 h-12 rounded-full bg-black/50 text-white backdrop-blur-md flex items-center justify-center hover:bg-[#00A86B] hover:text-black transition-all duration-300 cursor-pointer shadow-lg hover:shadow-xl"
                      >
                        <ChevronLeft className="size-6" />
                      </button>
                      <button
                        onClick={(e) => { e.stopPropagation(); nextImage(); }}
                        className="absolute right-5 top-1/2 -translate-y-1/2 w-12 h-12 rounded-full bg-black/50 text-white backdrop-blur-md flex items-center justify-center hover:bg-[#00A86B] hover:text-black transition-all duration-300 cursor-pointer shadow-lg hover:shadow-xl"
                      >
                        <ChevronRight className="size-6" />
                      </button>
                    </>
                  )}

                  <div className="absolute top-5 left-5 z-10 flex flex-wrap gap-2">
                    {listing.isVerified && (
                      <span className="bg-[#00A86B] text-black font-bold text-[11px] uppercase tracking-widest px-4 py-2 rounded-2xl shadow-lg flex items-center gap-1.5">
                        <ShieldCheck className="size-4.5" />
                        <span>{t.verifiedBadge}</span>
                      </span>
                    )}
                    {listing.isPremium && (
                      <span className="bg-amber-400 text-black font-bold text-[11px] uppercase tracking-widest px-4 py-2 rounded-2xl shadow-lg flex items-center gap-1.5">
                        <Sparkles className="size-4.5" />
                        <span>Premium</span>
                      </span>
                    )}
                  </div>
                </div>

                {/* Thumbnail Previews */}
                {images.length > 1 && (
                  <div className="flex gap-4 overflow-x-auto pb-2 scrollbar-thin">
                    {images.map((img, index) => (
                      <button
                        key={index}
                        onClick={(e) => { e.stopPropagation(); setActiveImageIdx(index); }}
                        className={`flex-shrink-0 w-32 h-24 rounded-2xl overflow-hidden border-3 transition-all duration-300 ${activeImageIdx === index ? 'border-[#00A86B] shadow-xl scale-105' : 'border-transparent opacity-70 hover:opacity-100 hover:border-slate-400 hover:scale-105'}`}
                      >
                        <img
                          src={img}
                          alt={`Preview ${index + 1}`}
                          className="w-full h-full object-cover"
                        />
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {/* Quick Action Buttons */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <button
                  onClick={handleCopyLink}
                  className="flex items-center justify-center space-x-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-white/10 text-slate-800 dark:text-slate-300 py-3 rounded-2xl transition-all duration-300 hover:bg-slate-50 dark:hover:bg-slate-800 cursor-pointer"
                >
                  {copySuccess ? <Check className="size-4 text-emerald-500" /> : <Copy className="size-4" />}
                  <span className="font-bold text-xs uppercase">{copySuccess ? t.copied : t.copyLink}</span>
                </button>
                <button
                  onClick={handleShare}
                  className="flex items-center justify-center space-x-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-white/10 text-slate-800 dark:text-slate-300 py-3 rounded-2xl transition-all duration-300 hover:bg-slate-50 dark:hover:bg-slate-800 cursor-pointer"
                >
                  <Share2 className="size-4" />
                  <span className="font-bold text-xs uppercase">{t.share}</span>
                </button>
                <button
                  onClick={handlePrint}
                  className="flex items-center justify-center space-x-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-white/10 text-slate-800 dark:text-slate-300 py-3 rounded-2xl transition-all duration-300 hover:bg-slate-50 dark:hover:bg-slate-800 cursor-pointer"
                >
                  <Printer className="size-4" />
                  <span className="font-bold text-xs uppercase">{t.print}</span>
                </button>
                <button
                  onClick={handleViewOnMap}
                  className="flex items-center justify-center space-x-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-white/10 text-slate-800 dark:text-slate-300 py-3 rounded-2xl transition-all duration-300 hover:bg-slate-50 dark:hover:bg-slate-800 cursor-pointer"
                >
                  <MapPin className="size-4" />
                  <span className="font-bold text-xs uppercase">{t.viewOnMap}</span>
                </button>
              </div>

              {/* Core Branded Title Box */}
              <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-white/5 p-6 rounded-[32px] shadow-sm dark:shadow-slate-900/50 space-y-3">
                <div className="inline-flex items-center space-x-1.5 bg-emerald-50 dark:bg-emerald-950/30 text-[#00A86B] border border-emerald-200/50 dark:border-emerald-800/30 px-4 py-2 rounded-2xl text-xs font-black uppercase tracking-wider">
                  <ShieldCheck className="size-4 animate-pulse" />
                  <span>{t.verifiedBadge}</span>
                </div>
                <h1 className="text-xl sm:text-2xl lg:text-3xl font-black text-slate-900 dark:text-white tracking-tight leading-snug">{t.title}</h1>
                <div className="flex items-center space-x-1.5 text-slate-400 dark:text-slate-500 font-bold text-xs pt-1">
                  <MapPin className="size-4 text-[#00A86B]" />
                  <span>{listing.locationTag}</span>
                </div>
              </div>

              {/* Specifications Grid */}
              <SpecsGrid listing={listing} currentGlobalLang={currentGlobalLang} />

              {/* Strategic Overview */}
              <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-white/5 p-6 sm:p-8 rounded-[32px] shadow-sm dark:shadow-slate-900/50 space-y-3">
                <h3 className="text-xs font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest">{t.descTitle}</h3>
                <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 font-bold leading-relaxed">{t.descBody}</p>
              </div>

              {/* Audit Warning Frame */}
              <div className="bg-emerald-50/60 border border-emerald-200/60 p-5 sm:p-6 rounded-[32px] flex items-start space-x-3">
                <ShieldCheck className="w-6 h-6 text-[#00A86B] shrink-0 mt-0.5" />
                <div className="space-y-1 text-left">
                  <h4 className="text-xs font-black text-emerald-900 uppercase tracking-wide">{t.auditTitle}</h4>
                  <p className="text-[11px] text-emerald-800 font-medium leading-relaxed">{t.auditBody}</p>
                </div>
              </div>

              {/* Related Listings */}
              {relatedListings.length > 0 && (
                <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-white/5 p-6 sm:p-8 rounded-[32px] shadow-sm dark:shadow-slate-900/50 space-y-6">
                  <div className="border-b border-slate-100 dark:border-white/5 pb-3 flex items-center space-x-2">
                    <div className="w-1.5 h-4 bg-[#00A86B] rounded-full" />
                    <h3 className="text-sm font-black text-slate-900 dark:text-white uppercase tracking-wider font-sans">
                      {t.relatedListings}
                    </h3>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    {relatedListings.map((related) => (
                      <div
                        key={related.id}
                        className="bg-slate-50 dark:bg-slate-900 rounded-2xl overflow-hidden border border-slate-200/50 dark:border-white/5 hover:border-[#00A86B]/30 hover:shadow-sm transition-all duration-300 cursor-pointer"
                        onClick={() => navigate(`/listing/${related.id}`)}
                      >
                        <div className="aspect-[4/3] relative">
                          <img
                            src={related.image}
                            alt={currentGlobalLang === 'am' ? related.titleAm : related.titleEn}
                            className="w-full h-full object-cover"
                          />
                        </div>
                        <div className="p-4">
                          <h4 className="font-bold text-sm text-slate-900 dark:text-white line-clamp-2">
                            {currentGlobalLang === 'am' ? related.titleAm : related.titleEn}
                          </h4>
                          <p className="text-[#00A86B] font-black mt-1">
                            {related.price.toLocaleString()} {currentGlobalLang === 'am' ? 'ብር' : 'ETB'}
                          </p>
                          <button
                            className="mt-3 w-full py-2 bg-[#00A86B] text-white rounded-xl text-xs font-black uppercase hover:bg-emerald-600 transition-colors"
                          >
                            {t.viewDetails}
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Right Transaction Control Panel */}
            <div className="w-full lg:w-[32%] lg:sticky lg:top-36 space-y-6">
              <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-white/5 p-6 sm:p-8 rounded-[32px] shadow-xl dark:shadow-slate-900/50 space-y-8 relative overflow-hidden">
                <div className="absolute top-0 left-0 right-0 h-[4px] bg-[#00A86B]" />
                
                {/* Price Section */}
                <div className="text-left space-y-1.5">
                  <span className="text-[10px] uppercase font-black text-slate-400 dark:text-slate-500 tracking-widest block">{t.priceLabel}</span>
                  <span className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white tracking-tight block">{t.priceValue}</span>
                  {listing.priceTagKey === 'price.negotiable' && (
                    <span className="inline-block mt-2 px-3 py-1 rounded-lg text-xs bg-rose-50 border border-rose-100 text-rose-600 font-black uppercase">
                      {t.negotiable}
                    </span>
                  )}
                </div>

                {/* Vendor Profile Section */}
                <div className="bg-slate-50 dark:bg-slate-800/50 p-4 rounded-2xl border border-slate-100 dark:border-white/5 flex items-center space-x-4">
                  <div className="w-12 h-12 bg-slate-200 dark:bg-slate-700 rounded-full flex items-center justify-center text-xl shrink-0">
                    👤
                  </div>
                  <div>
                    <p className="text-[10px] uppercase font-black text-slate-400 dark:text-slate-500 tracking-wider">{t.ownerTitle}</p>
                    <p className="text-sm font-black text-slate-900 dark:text-white">{t.ownerName}</p>
                    <div className="flex items-center gap-1 mt-1">
                      <Star className="size-3.5 fill-amber-400 text-amber-400" />
                      <span className="text-[10px] font-bold text-amber-500">{t.ownerReviews}</span>
                    </div>
                  </div>
                </div>

                {/* High-Conversion Primary Actions */}
                <div className="space-y-3">
                  <a
                    href={`tel:${listing.phone}`}
                    className="w-full bg-[#00A86B] hover:bg-emerald-600 text-white py-4 rounded-xl transition-all duration-300 flex items-center justify-center space-x-2 cursor-pointer shadow-sm"
                  >
                    <Phone className="size-5" />
                    <span className="font-black tracking-wider uppercase text-xs">{t.btnCall}</span>
                  </a>

                  <a
                    href={`https://t.me/${listing.whatsapp}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-full bg-[#24A1DE] hover:bg-[#1c8ec7] text-white py-4 rounded-xl transition-all duration-300 flex items-center justify-center space-x-2 cursor-pointer shadow-sm hover:shadow-[0_6px_15px_rgba(36,161,222,0.35)]"
                  >
                    <Send className="size-5 -ml-1 translate-y-[1px]" />
                    <span className="font-black tracking-wider uppercase text-xs">{t.btnTelegram}</span>
                  </a>

                  <button
                    onClick={handleToggleFavorite}
                    className={`w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-white/10 text-slate-800 dark:text-slate-300 py-3.5 rounded-xl transition-all duration-300 flex items-center justify-center space-x-2 cursor-pointer shadow-inner ${isFavoriteLocal ? 'bg-rose-50 dark:bg-rose-950/20 border-rose-100 dark:border-rose-800/30' : 'hover:bg-slate-50 dark:hover:bg-slate-800'}`}
                  >
                    <Heart className={`size-4 ${isFavoriteLocal ? 'fill-rose-500 text-rose-500' : 'text-slate-500'}`} />
                    <span className={`font-black tracking-wider uppercase text-xs ${isFavoriteLocal ? 'text-rose-600' : 'text-slate-700 dark:text-slate-300'}`}>
                      {t.btnFavorite}
                    </span>
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Lightbox */}
      {showLightbox && (
        <div
          className="fixed inset-0 z-[100] bg-black/95 flex items-center justify-center"
          onClick={() => setShowLightbox(false)}
        >
          <button
            onClick={() => setShowLightbox(false)}
            className="absolute top-6 right-6 w-12 h-12 rounded-full bg-white/10 backdrop-blur-md text-white flex items-center justify-center hover:bg-white/20 transition-all"
          >
            <X className="size-6" />
          </button>
          
          {images.length > 1 && (
            <>
              <button
                onClick={(e) => { e.stopPropagation(); prevImage(); }}
                className="absolute left-6 top-1/2 -translate-y-1/2 w-14 h-14 rounded-full bg-black/50 text-white backdrop-blur-md flex items-center justify-center hover:bg-[#00A86B] hover:text-black transition-all duration-300"
              >
                <ChevronLeft className="size-8" />
              </button>
              <button
                onClick={(e) => { e.stopPropagation(); nextImage(); }}
                className="absolute right-6 top-1/2 -translate-y-1/2 w-14 h-14 rounded-full bg-black/50 text-white backdrop-blur-md flex items-center justify-center hover:bg-[#00A86B] hover:text-black transition-all duration-300"
              >
                <ChevronRight className="size-8" />
              </button>
            </>
          )}
          
          <div className="max-w-[90vw] max-h-[90vh]">
            <img
              src={images[activeImageIdx]}
              alt={t.title}
              className="max-h-[85vh] max-w-[90vw] object-contain rounded-xl shadow-2xl"
              onClick={(e) => e.stopPropagation()}
            />
          </div>
        </div>
      )}

      <Footer onNavigate={(page) => { if (page === 'home') navigate('/'); }} />
    </section>
  );
};

const ListingDetailsPage = () => (
  <FavoritesProvider>
    <ListingDetailsContent />
  </FavoritesProvider>
);

export default ListingDetailsPage;
