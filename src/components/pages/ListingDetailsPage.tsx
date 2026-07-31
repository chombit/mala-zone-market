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
  Check,
  MessageCircle
} from 'lucide-react';
import type { ListingItem } from '../ZoneCatalogGrid';
import { FALLBACK_LISTINGS } from '../ZoneCatalogGrid';
import { useSocketTracker } from '../../hooks/useSocketTracker';
import { useLanguage } from '../../contexts/ZoneLanguageContext';
import SimpleHeader from '../SimpleHeader';
import Footer from '../Footer';
import { useFavorites } from '../../contexts/FavoritesContext';
import { useChat } from '../../contexts/ChatContext';
import { useAuth } from '../../contexts/AuthContext';
import StarRating from '../StarRating';
import RateSellerModal from '../RateSellerModal';

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
    <div className="w-full bg-gradient-to-br from-white via-slate-50/30 to-emerald-50/20 dark:from-slate-900 dark:via-slate-850 dark:to-slate-800 border-2 border-slate-200/80 dark:border-emerald-500/20 rounded-2xl shadow-xl overflow-hidden">
      {/* Premium Header */}
      <div className="bg-gradient-to-r from-[#00A86B]/10 to-emerald-500/10 dark:from-[#00A86B]/20 dark:to-emerald-600/20 px-4 py-3 sm:px-6 sm:py-4 border-b-2 border-[#00A86B]/30">
        <div className="flex items-center gap-2 sm:gap-3">
          <div className="w-1 h-5 sm:w-1.5 sm:h-6 bg-gradient-to-b from-[#00A86B] via-emerald-500 to-emerald-600 rounded-full shadow-lg shadow-[#00A86B]/30" />
          <h3 className="text-xs sm:text-base font-black text-slate-900 dark:text-white uppercase tracking-wide">
            {t.sectionTitle}
          </h3>
        </div>
      </div>

      {/* 2-Column Premium Grid - Fixed Layout (Mobile & Desktop) */}
      <div className="p-4 sm:p-6">
        <div className="grid grid-cols-2 gap-3 sm:gap-4">
          {t.specs.map((item, idx) => (
            <div
              key={idx}
              className="group relative overflow-hidden bg-gradient-to-br from-white to-slate-50/80 dark:from-slate-800 dark:to-slate-900/80 border-2 border-slate-200/60 dark:border-white/10 rounded-lg sm:rounded-xl p-3 sm:p-5 transition-all duration-300 hover:border-[#00A86B] hover:shadow-lg hover:shadow-[#00A86B]/10 hover:-translate-y-1 cursor-default"
            >
              {/* Premium hover overlay */}
              <div className="absolute inset-0 bg-gradient-to-br from-[#00A86B]/0 via-emerald-500/0 to-emerald-600/0 group-hover:from-[#00A86B]/5 group-hover:via-emerald-500/5 group-hover:to-emerald-600/5 transition-all duration-500" />
              
              {/* Content */}
              <div className="relative z-10 space-y-1.5 sm:space-y-2">
                <div className="text-[9px] sm:text-[11px] uppercase font-extrabold text-slate-400 dark:text-slate-500 tracking-[0.12em] sm:tracking-[0.15em] leading-tight">
                  {item.label}
                </div>
                <div className="text-slate-900 dark:text-white font-black text-xs sm:text-base leading-tight">
                  {item.label.includes('ደረጃ') || item.label.includes('Rating') ? (
                    <div className="flex items-center gap-1 sm:gap-2 text-amber-500">
                      <Star className="w-3.5 h-3.5 sm:w-5 sm:h-5 fill-current" />
                      <span className="text-xs sm:text-base">{item.val}</span>
                    </div>
                  ) : (
                    <span className="block text-xs sm:text-base">{item.val}</span>
                  )}
                </div>
              </div>

              {/* Corner accent */}
              <div className="absolute top-0 right-0 w-8 h-8 sm:w-12 sm:h-12 bg-gradient-to-bl from-[#00A86B]/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
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
  const { user } = useAuth();
  const [activeImageIdx, setActiveImageIdx] = useState(0);
  const [isFavoriteLocal, setIsFavoriteLocal] = useState(false);
  const [showLightbox, setShowLightbox] = useState(false);
  const [copySuccess, setCopySuccess] = useState(false);
  const [listing, setListing] = useState<ListingItem | null>(null);
  const [relatedListings, setRelatedListings] = useState<ListingItem[]>([]);
  const [loading, setLoading] = useState(true);
  const { trackEvent } = useSocketTracker();
  const { openChat } = useChat();
  const [sellerRating, setSellerRating] = useState<{ avg: number; count: number }>({ avg: 0, count: 0 });
  const [showRateModal, setShowRateModal] = useState(false);
  const [hasRated, setHasRated] = useState(false);

  useEffect(() => {
    if (!id) return;
    setLoading(true);

    const tryFallback = () => {
      const fallbackItem = FALLBACK_LISTINGS.find(item => String(item.id) === id);
      if (fallbackItem) {
        setListing(fallbackItem);
        setIsFavoriteLocal(isFavorite(fallbackItem.id));
        trackEvent('visit', fallbackItem);
        setRelatedListings(FALLBACK_LISTINGS.filter(item => item.zone === fallbackItem.zone && String(item.id) !== id).slice(0, 3));
      } else {
        setListing(null);
      }
      setLoading(false);
    };

    fetch(`/api/listings/${id}`)
      .then(res => res.json())
      .then(async (data) => {
        if (data.success && data.data) {
          const item = mapDbListingForPage(data.data);
          setListing(item);
          setIsFavoriteLocal(isFavorite(item.id));
          trackEvent('visit', item);

          // Fetch seller ratings and check if user has already rated
          if (data.data.user_id) {
            try {
              const ratRes = await fetch(`/api/ratings/seller/${data.data.user_id}`);
              const ratData = await ratRes.json();
              if (ratData.success) {
                setSellerRating({
                  avg: ratData.data.summary.avg_rating || 0,
                  count: ratData.data.summary.total_reviews || 0,
                });
              }
            } catch {}

            // Check if current user has already rated this listing
            if (user?.phone_number) {
              try {
                const checkRes = await fetch(`/api/ratings/check?phone=${user.phone_number}&listing_id=${id}`);
                const checkData = await checkRes.json();
                if (checkData.success && checkData.data.rated) {
                  setHasRated(true);
                }
              } catch {}
            }
          }

          const cat = data.data.category;
          if (cat) {
            try {
              const relRes = await fetch(`/api/listings?category=${cat}&limit=3`);
              const relData = await relRes.json();
              if (relData.success && Array.isArray(relData.data)) {
                setRelatedListings(relData.data.filter((r: any) => String(r.id) !== id).slice(0, 3).map(mapDbListingForPage));
              }
            } catch {}
          }
          setLoading(false);
        } else {
          tryFallback();
        }
      })
      .catch(() => {
        tryFallback();
      });
  }, [id]);

  function mapDbListingForPage(row: any): ListingItem {
    const images: string[] = (() => {
      if (!row.images) return [];
      if (Array.isArray(row.images)) return row.images;
      try { return JSON.parse(row.images); } catch { return []; }
    })();
    const cat = row.category || "property";
    let zone: "car" | "house" | "machinery" | "ceremony" = "house";
    if (cat === "motors") zone = "car";
    else if (cat === "stay" || cat === "ceremony") zone = "ceremony";
    else if (cat === "heavy") zone = "machinery";

    return {
      id: String(row.id),
      titleEn: row.title_en || "",
      titleAm: row.title_am || "",
      price: Number(row.price) || 0,
      priceSuffixKey: row.price_suffix === "per_day" ? "price.day" : row.price_suffix === "per_hour" ? "price.hour" : "price.etb",
      priceTagKey: row.is_premium ? "price.fixed" : "price.negotiable",
      image: images[0] || "https://images.unsplash.com/photo-1560518883-ce09059eeffa?w=800&q=80&fm=webp",
      images,
      zone,
      locationKey: row.location_key || "",
      locationTag: (row.location_label_en || "").toUpperCase() || "PIASSA",
      rating: row.avg_rating ? Number(row.avg_rating) : 0,
      isVerified: !!row.is_verified,
      isPremium: !!row.is_premium,
      badgeKey: row.is_verified ? "badge.verifiedCarta" : "badge.verified",
      plateCode: row.plate_code || undefined,
      fuelType: row.fuel_type || undefined,
      fuelTag: row.fuel_type ? row.fuel_type.toUpperCase() : undefined,
      condition: row.condition_type || undefined,
      titleDeed: row.title_deed || undefined,
      sqm: row.area_sqm ? Number(row.area_sqm) : undefined,
      bedrooms: row.bedrooms ? Number(row.bedrooms) : undefined,
      bathrooms: row.bathrooms ? Number(row.bathrooms) : undefined,
      billingTrack: zone === "machinery" ? "ETB / Hour" : undefined,
      phone: row.phone || "",
      whatsapp: row.whatsapp || row.phone || "",
      descriptionAm: row.description_am || undefined,
      descriptionEn: row.description_en || undefined,
      sellerUserId: row.user_id ? Number(row.user_id) : undefined,
      sellerName: row.seller_name || undefined,
    };
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-4 border-[#00A86B] border-t-transparent"></div>
      </div>
    );
  }

  if (!listing) {
    return (
      <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-xl sm:text-2xl font-bold text-slate-800 dark:text-white mb-4">Listing Not Found</h2>
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
      btnOtherZones: "አስስ",
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
      btnOtherZones: "Explore",
      idLabel: `Code: ${listing.id.toUpperCase()}`,
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
    if (!user) {
      navigate("/signin");
      return;
    }
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
      {/* Simplified Header */}
      <SimpleHeader />

      {/* Main Content - Add padding-top for fixed header */}
      <div className="pt-[80px] pb-20 px-4 sm:px-6 lg:px-12">
        <div className="max-w-6xl mx-auto space-y-3">
          
          {/* Top Premium Navigation Utility Bar - Compact ID and Explore */}
          <div className="flex items-center justify-between gap-2 bg-white dark:bg-slate-900 px-3 py-2 rounded-xl border border-slate-200/80 dark:border-white/5 shadow-sm">
            
            {/* Left: Code Badge */}
            <span className="bg-slate-50 dark:bg-slate-800 px-3 py-1.5 rounded-lg border border-slate-200 dark:border-white/10 text-xs font-bold text-slate-500 dark:text-slate-400 font-mono">
              {t.idLabel}
            </span>

            {/* Right: Explore Button */}
            <button
              onClick={() => navigate('/')}
              className="flex items-center gap-1.5 border border-slate-200 dark:border-white/10 hover:border-[#00A86B] bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-300 font-bold text-xs uppercase tracking-wide px-3 py-1.5 rounded-lg transition-all duration-300 hover:bg-emerald-50 dark:hover:bg-emerald-950/30"
            >
              <Grid className="w-3.5 h-3.5 text-[#00A86B]" />
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

                  {/* Action Overlay Buttons */}
                  <div className="absolute top-5 right-5 z-10 flex flex-col gap-2">
                    <button
                      onClick={(e) => { e.stopPropagation(); handleToggleFavorite(); }}
                      className="w-10 h-10 rounded-full bg-white/90 dark:bg-slate-900/90 backdrop-blur-sm flex items-center justify-center shadow-lg hover:scale-110 transition-all duration-300 cursor-pointer"
                      aria-label={isFavoriteLocal ? "Remove from favorites" : "Add to favorites"}
                    >
                      <Heart className={`w-5 h-5 ${isFavoriteLocal ? 'fill-red-500 text-red-500' : 'text-slate-700 dark:text-slate-300'}`} />
                    </button>
                    <button
                      onClick={(e) => { e.stopPropagation(); handleShare(); }}
                      className="w-10 h-10 rounded-full bg-white/90 dark:bg-slate-900/90 backdrop-blur-sm flex items-center justify-center shadow-lg hover:scale-110 transition-all duration-300 cursor-pointer"
                      aria-label="Share listing"
                    >
                      {copySuccess ? (
                        <Check className="w-5 h-5 text-emerald-500" />
                      ) : (
                        <Share2 className="w-5 h-5 text-slate-700 dark:text-slate-300" />
                      )}
                    </button>
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

              {/* Quick Action Buttons - Premium Styled */}
              <div className="flex gap-2">
                <button
                  onClick={handleCopyLink}
                  className="flex-1 flex items-center justify-center gap-2 bg-gradient-to-br from-white to-slate-50 dark:from-slate-900 dark:to-slate-800 border-2 border-slate-200 dark:border-white/10 hover:border-[#00A86B] text-slate-800 dark:text-slate-300 py-2.5 px-4 rounded-xl transition-all duration-300 hover:shadow-md cursor-pointer font-bold text-xs uppercase tracking-wide"
                >
                  {copySuccess ? <Check className="w-4 h-4 text-emerald-500" /> : <Copy className="w-4 h-4" />}
                  <span>{copySuccess ? t.copied : t.copyLink}</span>
                </button>
                <button
                  onClick={handleShare}
                  className="flex-1 flex items-center justify-center gap-2 bg-gradient-to-br from-white to-slate-50 dark:from-slate-900 dark:to-slate-800 border-2 border-slate-200 dark:border-white/10 hover:border-[#00A86B] text-slate-800 dark:text-slate-300 py-2.5 px-4 rounded-xl transition-all duration-300 hover:shadow-md cursor-pointer font-bold text-xs uppercase tracking-wide"
                >
                  <Share2 className="w-4 h-4" />
                  <span>{t.share}</span>
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
              <div className="bg-emerald-50/60 dark:bg-emerald-950/30 border border-emerald-200/60 dark:border-emerald-800/30 p-5 sm:p-6 rounded-[32px] flex items-start space-x-3">
                <ShieldCheck className="w-6 h-6 text-[#00A86B] shrink-0 mt-0.5" />
                <div className="space-y-1 text-left">
                  <h4 className="text-xs font-black text-emerald-900 dark:text-emerald-400 uppercase tracking-wide">{t.auditTitle}</h4>
                  <p className="text-[11px] text-emerald-800 dark:text-emerald-500 font-medium leading-relaxed">{t.auditBody}</p>
                </div>
              </div>

              {/* Related Listings (fetched from same category) */}
              {relatedListings.length > 0 && listing && (
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
                <div className="bg-slate-50 dark:bg-slate-800/50 p-4 rounded-2xl border border-slate-100 dark:border-white/5">
                  <div className="flex items-center space-x-4">
                    <div className="w-12 h-12 bg-slate-200 dark:bg-slate-700 rounded-full flex items-center justify-center text-xl shrink-0">
                      👤
                    </div>
                    <div>
                      <p className="text-[10px] uppercase font-black text-slate-400 dark:text-slate-500 tracking-wider">{t.ownerTitle}</p>
                      <p className="text-sm font-black text-slate-900 dark:text-white">{listing.sellerName || t.ownerName}</p>
                      {sellerRating.count > 0 ? (
                        <div className="flex items-center gap-1.5 mt-1">
                          <StarRating rating={sellerRating.avg} size="sm" showValue />
                          <span className="text-[10px] text-slate-400 dark:text-slate-500">({sellerRating.count})</span>
                        </div>
                      ) : (
                        <div className="flex items-center gap-1 mt-1">
                          <Star className="size-3.5 fill-amber-400 text-amber-400" />
                          <span className="text-[10px] font-bold text-amber-500">{t.ownerReviews}</span>
                        </div>
                      )}
                    </div>
                  </div>
                  {!hasRated && listing.sellerUserId && (
                    <button
                      onClick={() => setShowRateModal(true)}
                      className="mt-3 w-full text-xs font-bold text-[#00A86B] hover:text-emerald-600 py-1.5 rounded-lg border border-[#00A86B]/30 hover:border-[#00A86B] transition-colors"
                    >
                      ⭐ Rate this seller
                    </button>
                  )}
                </div>

                {/* High-Conversion Primary Actions */}
                <div className="space-y-3">
                  <a
                    href={`tel:${listing.phone}`}
                    onClick={() => trackEvent('click_call', listing)}
                    className="w-full bg-[#00A86B] hover:bg-emerald-600 text-white py-4 rounded-xl transition-all duration-300 flex items-center justify-center space-x-2 cursor-pointer shadow-sm"
                  >
                    <Phone className="size-5" />
                    <span className="font-black tracking-wider uppercase text-xs">{t.btnCall}</span>
                  </a>

                  <a
                    href={`https://t.me/${listing.whatsapp}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    onClick={() => trackEvent('click_telegram', listing)}
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

      {/* Rate Seller Modal */}
      {listing && listing.sellerUserId && (
        <RateSellerModal
          isOpen={showRateModal}
          onClose={() => {
            setShowRateModal(false);
            setHasRated(true);
          }}
          sellerId={listing.sellerUserId}
          sellerName={listing.sellerName || "Seller"}
          listingId={Number(listing.id)}
          listingTitle={listing.titleEn}
        />
      )}

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

export default ListingDetailsContent;
