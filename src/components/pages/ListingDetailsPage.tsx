import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
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
  MessageCircle,
  Store
} from 'lucide-react';
import type { ListingItem } from '../ZoneCatalogGrid';
import { FALLBACK_LISTINGS } from '../ZoneCatalogGrid';
import { useSocketTracker } from '../../hooks/useSocketTracker';
import { useLanguage } from '../../contexts/ZoneLanguageContext';
import { useListingRevision } from '../../contexts/ListingRealtimeContext';
import SimpleHeader from '../SimpleHeader';
import Footer from '../Footer';
import { useFavorites } from '../../contexts/FavoritesContext';
import { useChat } from '../../contexts/ChatContext';
import { useAuth } from '../../contexts/AuthContext';
import StarRating from '../StarRating';
import RateSellerModal from '../RateSellerModal';

// ── Dynamic Attribute Label Map (EN/AM) ──
// Fallback labels for common attr_keys when taxonomy endpoint is slow.
const ATTR_LABELS: Record<string, { en: string; am: string }> = {
  year:              { en: "Year of Manufacture",    am: "የዓመት ተግባር" },
  mileage_km:        { en: "Mileage",                am: "የጉዞ ርቀት" },
  transmission:      { en: "Transmission",           am: "ትራንስሚሽን" },
  engine_cc:         { en: "Engine Capacity",        am: "የሞተር አቅም" },
  drive_type:        { en: "Drive Type",             am: "የእንቅስቃሴ ዓይነት" },
  condition:         { en: "Condition",              am: "ሁኔታ" },
  furnishing:        { en: "Furnishing",             am: "የቤት እቃ ሁኔታ" },
  parking:           { en: "Parking",                am: "ፓርኪንግ" },
  compound:          { en: "Compound",               am: "ግቢ" },
  elevator:          { en: "Elevator",               am: "ኤሌቫተር" },
  floor_level:       { en: "Floor Level",            am: "የፎቅ ደረጃ" },
  deed_type:         { en: "Title Deed Type",        am: "የባለቤትነት ወረቀት" },
  land_type:         { en: "Land Type",              am: "የመሬት ዓይነት" },
  road_access:       { en: "Road Access",            am: "የመንገድ መተላለፊያ" },
  size_class:        { en: "Plot Size",              am: "የመጠን ምድብ" },
  business_space_type:{ en: "Space Type",            am: "የንግድ ቦታ ዓይነት" },
  storage_capacity:  { en: "Storage",                am: "የማከማቻ አቅም" },
  screen_size:       { en: "Screen Size",            am: "የስክሪን መጠን" },
  battery_health:    { en: "Battery Health",         am: "የባትሪ ጤንነት" },
  ram:               { en: "RAM",                    am: "ራም" },
  processor:         { en: "Processor",              am: "ፕሮሴሰር" },
  graphics_card:     { en: "Graphics Card",          am: "ግራፊክስ ካርድ" },
  resolution:        { en: "Resolution",             am: "ሬዞሉሽን" },
  smart_tv:          { en: "Smart TV",               am: "ስማርት ቲቪ" },
  connectivity:      { en: "Connectivity",           am: "ግንኙነት" },
  platform:          { en: "Platform",               am: "መድረክ" },
  warranty_months:   { en: "Warranty",               am: "ዋስትና" },
  operating_hours:   { en: "Operating Hours",        am: "የስራ ሰዓቶች" },
  model_year:        { en: "Model Year",             am: "የሞዴል ዓመት" },
  storage_gb:        { en: "Storage (GB)",           am: "ማከማቻ (GB)" },
  ram_gb:            { en: "RAM (GB)",               am: "ራም (GB)" },
  screen_size_in:    { en: "Screen Size (inch)",     am: "የስክሪን መጠን (ኢንች)" },
  battery_mah:       { en: "Battery (mAh)",          am: "ባትሪ (mAh)" },
  dual_sim:          { en: "Dual SIM",               am: "ድርብ ሲም" },
  network_5g:        { en: "5G Ready",               am: "5G አውታረ መረብ" },
  storage_type:      { en: "Storage Type",           am: "የማከማቻ ዓይነት" },
  cpu_brand:         { en: "CPU Brand",              am: "የሲፒዩ ብራንድ" },
  form_factor:       { en: "Form Factor",            am: "የቅርጽ ዓይነት" },
};

// Specifications Grid Component — dynamic from taxonomy
interface SpecsGridProps {
  listing: ListingItem;
  currentGlobalLang: 'am' | 'en';
}

function SpecsGrid({ listing, currentGlobalLang }: SpecsGridProps) {
  const [attrDefs, setAttrDefs] = useState<Array<{
    attr_key: string; label_en: string; label_am: string;
    options: any; unit: string | null; is_required: boolean;
  }>>([]);

  // Fetch attribute definitions for this listing's category
  useEffect(() => {
    const slug = listing.subcategorySlug || listing.category;
    if (!slug) return;
    fetch(`/api/categories/${slug}`)
      .then(r => r.json())
      .then(d => {
        if (d.success && d.data?.attributes) {
          setAttrDefs(d.data.attributes);
        }
      })
      .catch(() => {});
  }, [listing.subcategorySlug, listing.category]);

  const buildSpecs = () => {
    const specs: Array<{ label: string; val: string }> = [];
    const lang = currentGlobalLang;
    const attrs = listing.attributes || {};

    // 1. Render taxonomy-defined attributes
    for (const def of attrDefs) {
      const val = attrs[def.attr_key];
      if (val === undefined || val === null || val === "") continue;
      const label = lang === "am"
        ? (def.label_am || ATTR_LABELS[def.attr_key]?.am || def.label_en)
        : (def.label_en || ATTR_LABELS[def.attr_key]?.en || def.attr_key);
      let displayVal = String(val);
      if (def.unit) displayVal = `${val} ${def.unit}`;
      specs.push({ label, val: displayVal });
    }

    // 2. Add legacy fields not already covered by taxonomy attrs
    const coveredKeys = new Set(attrDefs.map(d => d.attr_key));
    const legacyFields: Array<{ key: string; val: any; label_en: string; label_am: string }> = [
      { key: "plateCode", val: listing.plateCode, label_en: "License Plate", label_am: "የሰሌዳ ኮድ" },
      { key: "fuelType", val: listing.fuelType, label_en: "Fuel Type", label_am: "የነዳጅ ዓይነት" },
      { key: "titleDeed", val: listing.titleDeed, label_en: "Title Deed", label_am: "የሰነድ ሁኔታ" },
      { key: "propertyType", val: listing.propertyType, label_en: "Property Type", label_am: "የንብረት ዓይነት" },
      { key: "bedrooms", val: listing.bedrooms, label_en: "Bedrooms", label_am: "መኝታ ቤቶች" },
      { key: "bathrooms", val: listing.bathrooms, label_en: "Bathrooms", label_am: "ሽንት ቤቶች" },
      { key: "sqm", val: listing.sqm, label_en: "Total Area", label_am: "ጠቅላላ ስፋት" },
      { key: "billingTrack", val: listing.billingTrack, label_en: "Billing Method", label_am: "የክፍያ መንገድ" },
      { key: "vehicleType", val: listing.vehicleType, label_en: "Vehicle Type", label_am: "የመኪና ዓይነት" },
    ];
    for (const f of legacyFields) {
      if (f.val == null || f.val === "") continue;
      // Skip if this attr_key is already rendered from taxonomy
      const mappedKey = f.key === "plateCode" ? null : f.key === "fuelType" ? null : f.key;
      if (mappedKey && coveredKeys.has(mappedKey)) continue;
      // Special: plateCode and fuelType don't map to taxonomy attrs directly, always show
      const label = lang === "am" ? f.label_am : f.label_en;
      let displayVal = String(f.val);
      if (f.key === "sqm") displayVal = `${f.val} m²`;
      if (f.key === "bedrooms" || f.key === "bathrooms") displayVal = String(f.val);
      specs.push({ label, val: displayVal });
    }

    // 3. Location + Rating (always shown)
    specs.push({ label: lang === "am" ? "አድራሻ / ሰፈር" : "Location", val: listing.locationTag });
    specs.push({ label: lang === "am" ? "የደረጃ ውጤት" : "Rating", val: `${listing.rating} ${lang === "am" ? "ማርክ" : "Stars"}` });

    return {
      sectionTitle: lang === "am" ? "ስለ ንብረቱ ዝርዝር መረጃ" : "Comprehensive Details",
      specs,
    };
  };

  const t = buildSpecs();

  return (
    <div className="w-full bg-gradient-to-br from-white via-slate-50/30 to-emerald-50/20 dark:from-slate-900 dark:via-slate-850 dark:to-slate-800 border border-slate-200/80 dark:border-emerald-500/20 rounded-2xl shadow-sm overflow-hidden">
      {/* Premium Header */}
      <div className="bg-gradient-to-r from-[#00A86B]/10 to-emerald-500/10 dark:from-[#00A86B]/20 dark:to-emerald-600/20 px-4 py-3 sm:px-6 sm:py-4 border-b border-[#00A86B]/30">
        <div className="flex items-center gap-2 sm:gap-3">
          <div className="w-1 h-5 sm:w-1.5 sm:h-6 bg-gradient-to-b from-[#00A86B] via-emerald-500 to-emerald-600 rounded-full shadow-lg shadow-[#00A86B]/30" />
          <h3 className="text-sm sm:text-base font-black text-slate-900 dark:text-white uppercase tracking-wide">
            {t.sectionTitle}
          </h3>
        </div>
      </div>

      {/* 2-Column Premium Grid */}
      <div className="p-3 sm:p-6">
        <div className="grid grid-cols-2 gap-2.5 sm:gap-4">
          {t.specs.map((item, idx) => (
            <div
              key={idx}
              className="group relative overflow-hidden bg-gradient-to-br from-white to-slate-50/80 dark:from-slate-800 dark:to-slate-900/80 border border-slate-200/60 dark:border-white/10 rounded-xl p-3 sm:p-4 transition-all duration-300 hover:border-[#00A86B] hover:shadow-lg hover:shadow-[#00A86B]/10 cursor-default"
            >
              {/* Premium hover overlay */}
              <div className="absolute inset-0 bg-gradient-to-br from-[#00A86B]/0 via-emerald-500/0 to-emerald-600/0 group-hover:from-[#00A86B]/5 group-hover:via-emerald-500/5 group-hover:to-emerald-600/5 transition-all duration-500" />
              
              {/* Content */}
              <div className="relative z-10 space-y-1">
                <div className="text-[10px] sm:text-[11px] uppercase font-extrabold text-slate-400 dark:text-slate-500 tracking-[0.12em] sm:tracking-[0.15em] leading-tight">
                  {item.label}
                </div>
                <div className="text-slate-900 dark:text-white font-black text-sm sm:text-base leading-tight">
                  {item.label.includes('ደረጃ') || item.label.includes('Rating') ? (
                    <div className="flex items-center gap-1 sm:gap-2 text-amber-500">
                      <Star className="w-3.5 h-3.5 sm:w-5 sm:h-5 fill-current" />
                      <span className="text-sm sm:text-base">{item.val}</span>
                    </div>
                  ) : (
                    <span className="block text-sm sm:text-base">{item.val}</span>
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
  const { user, isAuthenticated } = useAuth();
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

  const loadListing = useCallback(
    async (quiet = false) => {
      if (!id) return;
      if (!quiet) setLoading(true);

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

      // quiet refreshes (realtime availability) must not inflate view_count
      fetch(`/api/listings/${id}${quiet ? '?count_view=0' : ''}`)
        .then(res => res.json())
        .then(async (data) => {
          if (data.success && data.data) {
            const item = mapDbListingForPage(data.data);
            setListing(item);
            setIsFavoriteLocal(isFavorite(item.id));
            if (!quiet) trackEvent('visit', item);

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
    },
    [id, isFavorite, trackEvent, user]
  );

  // Initial load (and when navigating to a different listing)
  useEffect(() => {
    loadListing();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  // Realtime: when THIS listing changes (sold/archived/edited live),
  // silently re-fetch so the buyer never buys a gone item.
  const { lastChange } = useListingRevision();
  useEffect(() => {
    if (lastChange && String(lastChange.id) === String(id)) {
      loadListing(true);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [lastChange, id]);

  function mapDbListingForPage(row: any): ListingItem {
    const images: string[] = (() => {
      if (!row.images) return [];
      if (Array.isArray(row.images)) return row.images;
      try { return JSON.parse(row.images); } catch { return []; }
    })();
    const cat = row.category || "property";
    let zone: "car" | "house" | "fashion" | "furniture" | "electronics" = "house";
    if (cat === "motors") zone = "car";
    else if (cat === "stay" || cat === "furniture" || cat === "ceremony") zone = "furniture";
    else if (cat === "heavy" || cat === "machinery") zone = "fashion";
    else if (cat === "electronics") zone = "electronics";

    return {
      id: String(row.id),
      titleEn: row.title_en || "",
      titleAm: row.title_am || "",
      price: Number(row.price) || 0,
      priceSuffixKey: row.price_suffix === "per_day" ? "price.day" : row.price_suffix === "per_hour" ? "price.hour" : row.price_suffix === "per_month" ? "price.month" : "price.etb",
      priceTagKey: row.is_premium ? "price.fixed" : "price.negotiable",
      image: images[0] || "https://images.unsplash.com/photo-1560518883-ce09059eeffa?w=800&q=80&fm=webp",
      images,
      zone,
      locationKey: row.location_key || "",
      locationTag: (row.location_label_en || "").toUpperCase() || "HAWASSA",
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
      billingTrack: zone === "fashion" ? "ETB / Hour" : undefined,
      phone: row.phone || "",
      whatsapp: row.whatsapp || row.phone || "",
      descriptionAm: row.description_am || undefined,
      descriptionEn: row.description_en || undefined,
      sellerUserId: row.user_id ? Number(row.user_id) : undefined,
      sellerName: row.seller_name || undefined,
      sellerStatus: row.seller_status || undefined,
      attributes: row.attributes && typeof row.attributes === "object" ? row.attributes : {},
      category: row.category || undefined,
      subcategorySlug: row.subcategory_slug || undefined,
      isActive: row.is_active !== 0,
      status: row.status || undefined,
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

  const priceUnitAm =
    listing.priceSuffixKey === "price.month" ? " ብር / በወር" : listing.priceSuffixKey === "price.day" ? " ብር / በቀን" : listing.priceSuffixKey === "price.hour" ? " ብር / በሰዓት" : " ብር";
  const priceUnitEn =
    listing.priceSuffixKey === "price.month" ? " ETB / Month" : listing.priceSuffixKey === "price.day" ? " ETB / Day" : listing.priceSuffixKey === "price.hour" ? " ETB / Hour" : " ETB";
  const isSale = listing.priceSuffixKey === "price.etb";

  // Full page translation dictionary
  const t = {
    am: {
      btnOtherZones: "አስስ",
      idLabel: `ኮድ: ${listing.id.toUpperCase()}`,
      verifiedBadge: listing.isVerified ? "🛡️ የተረጋገጠ ማህደር" : "📋 መደበኛ ማህደር",
      title: listing.titleAm,
      priceLabel: "ዋጋ",
      priceValue: `${listing.price.toLocaleString()}${priceUnitAm}`,
      dealType: isSale ? "ለሽያጭ" : "ለኪራይ",
      negotiable: "ድርድር ይቻላል",
      ownerTitle: "ሻጭ",
      ownerName: "malazone Agent",
      ownerReviews: `⭐⭐⭐⭐⭐ (${listing.rating} ማርክ)`,
      btnCall: "ቀጥታ ደውል",
      btnTelegram: "በቴሌግራም አነጋግር",
      btnChat: "ለባለቤቱ መልዕክት ይላኩ",
      btnFavorite: isFavoriteLocal ? "ተቀምጧል" : "ለበኋላ አስቀምጥ",
      descTitle: "መግለጫ",
      descBody: listing.descriptionAm || "ያለ ምንም የደላላ ጣልቃ-ገብነት በቀጥታ ከባለቤቱ የቀረበ ይፋዊ የንግድ ማህደር።",
      auditTitle: "በmalazone የተረጋገጠ",
      auditBody: "ይህ ንብረት በኪራይ/በሽያጭ አቀራረቡ በከተማ ማዘጋጃ ቤት ሰነዶች እና በትራንስፖርት ቢሮ መዛግብት ጋር ትክክለኛነቱ በሕጋዊ መንገድ የተረጋገጠ ነው።",
      relatedListings: "ተመሳሳይ ማህደሮች",
      viewDetails: "ዝርዝሮችን ይመልከቱ",
      share: "አጋራት",
      print: "ትርም",
      copyLink: "ማገናኛ አስገብ",
      copied: "ተገላብጧል!",
      viewOnMap: "በካርታ ላይ ይመልከቱ",
      safetyTitle: "የደህንነት ምክሮች",
      safetyTips: [
        "ከመክፈልዎ በፊት እቃውን በአካል ተመልክተው ሰነዶቹን ያረጋግጡ",
        "በህዝብ ብዛት ባለበት እና በብሩህ ቦታ ይገናኙ",
        "እቃውን ሳያዩ ቅድመ ክፍያ አትላኩ",
        "የባለቤትነት ዝውውርን በይፋዊ መስሪያ ቤት ያጠናቅቁ"
      ],
    },
    en: {
      btnOtherZones: "Explore",
      idLabel: `Code: ${listing.id.toUpperCase()}`,
      verifiedBadge: listing.isVerified ? "🛡️ Verified Listing" : "📋 Standard Listing",
      title: listing.titleEn,
      priceLabel: "Price",
      priceValue: `${listing.price.toLocaleString()}${priceUnitEn}`,
      dealType: isSale ? "For Sale" : "For Rent",
      negotiable: "Negotiable",
      ownerTitle: "Seller",
      ownerName: "malazone Agent",
      ownerReviews: `⭐⭐⭐⭐⭐ (${listing.rating} Rating)`,
      btnCall: "Direct Call",
      btnTelegram: "Message on Telegram",
      btnChat: "Message Seller",
      btnFavorite: isFavoriteLocal ? "Saved" : "Add to Saved Items",
      descTitle: "Description",
      descBody: listing.descriptionEn || "Direct peer-to-peer connection bypasses middleman friction completely.",
      auditTitle: "Verified by malazone",
      auditBody: "This listing has been officially cross-verified by malazone administrators against regional archives.",
      relatedListings: "Related Listings",
      viewDetails: "View Details",
      share: "Share",
      print: "Print",
      copyLink: "Copy Link",
      copied: "Copied!",
      viewOnMap: "View on Map",
      safetyTitle: "Safety Tips",
      safetyTips: [
        "Inspect the item in person and verify all documents before paying",
        "Meet in a public, well-lit place",
        "Never send money in advance or pay remotely before seeing the item",
        "Complete the ownership transfer at the official government office"
      ],
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

      {/* Breadcrumbs */}
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-12 pt-4 pb-2">
        <nav className="flex items-center gap-1.5 text-xs text-slate-500 dark:text-slate-400" aria-label="Breadcrumb">
          <button onClick={() => navigate("/")} className="hover:text-[#00A86B] transition-colors font-medium">
            {currentGlobalLang === "am" ? "መነሻ" : "Home"}
          </button>
          <ChevronRight className="w-3 h-3" />
          <button onClick={() => navigate(`/?zone=${listing.zone || "house"}`)} className="hover:text-[#00A86B] transition-colors font-medium capitalize">
            {listing.zone || "property"}
          </button>
          {listing.subcategorySlug && (
            <>
              <ChevronRight className="w-3 h-3" />
              <span className="text-slate-700 dark:text-slate-300 font-semibold capitalize">
                {listing.subcategorySlug.replace(/-/g, " ")}
              </span>
            </>
          )}
        </nav>
      </div>

      {/* Main Content - Add padding-top for fixed header */}
      <div className="pt-[80px] pb-32 lg:pb-20 px-4 sm:px-6 lg:px-12">
        <div className="max-w-6xl mx-auto space-y-3">
          
          {/* Mobile Back Button */}
          <button
            onClick={() => navigate(-1)}
            className="lg:hidden flex items-center gap-2 text-sm font-semibold text-slate-600 dark:text-slate-400 hover:text-[#00A86B] transition-colors -ml-1"
          >
            <ChevronLeft className="w-5 h-5" />
            {currentGlobalLang === "am" ? "ተመለስ" : "Back"}
          </button>

          {/* Top Premium Navigation Utility Bar - Desktop only */}
          <div className="hidden lg:flex items-center justify-between gap-2 bg-white dark:bg-slate-900 px-3 py-2 rounded-xl border border-slate-200/80 dark:border-white/5 shadow-sm">
            
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
          <div className="flex flex-col lg:flex-row gap-6 lg:gap-8 items-start">
            
            {/* Left Content Block */}
            <div className="w-full lg:w-[68%] space-y-4 lg:space-y-6">

              {/* Listing Summary — Title, Meta & Quick Actions */}
              <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-white/5 rounded-2xl lg:rounded-[32px] shadow-sm dark:shadow-slate-900/50 p-4 lg:p-6 space-y-3">
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div className="flex items-center gap-2 flex-wrap">
                    <div className="inline-flex items-center gap-1.5 text-[#00A86B] bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200/50 dark:border-emerald-800/30 px-3 py-1.5 rounded-full text-[10px] font-black uppercase tracking-wider">
                      <ShieldCheck className="size-3.5" />
                      <span>{t.verifiedBadge}</span>
                    </div>
                    {listing.isActive === false && (
                      <span className="inline-flex items-center gap-1.5 bg-rose-500 text-white font-bold text-[10px] uppercase tracking-widest px-3 py-1.5 rounded-full">
                        {currentGlobalLang === "am" ? "አይገኝም" : "Unavailable"}
                      </span>
                    )}
                  </div>
                  <div className="flex items-center gap-1.5">
                    <span className="hidden sm:inline-flex items-center font-mono text-[10px] text-slate-400 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-white/10 px-2.5 py-1.5 rounded-full">
                      {t.idLabel}
                    </span>
                    <button
                      onClick={handleCopyLink}
                      className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-full border border-slate-200 dark:border-white/10 hover:border-[#00A86B] bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300 font-bold text-[11px] uppercase tracking-wide transition-all hover:shadow-md cursor-pointer"
                      aria-label="Copy link"
                    >
                      {copySuccess ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
                      <span className="hidden sm:inline">{copySuccess ? t.copied : t.copyLink}</span>
                    </button>
                    <button
                      onClick={handleShare}
                      className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-full border border-slate-200 dark:border-white/10 hover:border-[#00A86B] bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300 font-bold text-[11px] uppercase tracking-wide transition-all hover:shadow-md cursor-pointer"
                      aria-label="Share listing"
                    >
                      <Share2 className="w-3.5 h-3.5" />
                      <span className="hidden sm:inline">{t.share}</span>
                    </button>
                  </div>
                </div>
                <h1 className="text-lg sm:text-xl lg:text-3xl font-black text-slate-900 dark:text-white tracking-tight leading-snug">{t.title}</h1>
                <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-slate-500 dark:text-slate-400 font-semibold pt-1 border-t border-slate-100 dark:border-white/5">
                  <span className="flex items-center gap-1.5">
                    <MapPin className="size-4 text-[#00A86B]" />
                    {listing.locationTag}
                  </span>
                  <button
                    onClick={handleViewOnMap}
                    className="flex items-center gap-1.5 hover:text-[#00A86B] transition-colors font-bold"
                  >
                    {t.viewOnMap}
                  </button>
                </div>
              </div>

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
                        className="absolute left-3 top-1/2 -translate-y-1/2 w-10 h-10 lg:w-12 lg:h-12 rounded-full bg-black/50 text-white backdrop-blur-md flex items-center justify-center hover:bg-[#00A86B] hover:text-black transition-all duration-300 cursor-pointer shadow-lg hover:shadow-xl"
                      >
                        <ChevronLeft className="size-5 lg:size-6" />
                      </button>
                      <button
                        onClick={(e) => { e.stopPropagation(); nextImage(); }}
                        className="absolute right-3 top-1/2 -translate-y-1/2 w-10 h-10 lg:w-12 lg:h-12 rounded-full bg-black/50 text-white backdrop-blur-md flex items-center justify-center hover:bg-[#00A86B] hover:text-black transition-all duration-300 cursor-pointer shadow-lg hover:shadow-xl"
                      >
                        <ChevronRight className="size-5 lg:size-6" />
                      </button>
                    </>
                  )}

                  <div className="absolute top-5 left-5 z-10 flex flex-wrap gap-2">
                    {listing.isActive === false && (
                      <span className="bg-rose-500 text-white font-bold text-[11px] uppercase tracking-widest px-4 py-2 rounded-2xl shadow-lg flex items-center gap-1.5">
                        {currentGlobalLang === "am" ? "አይገኝም" : "Unavailable"}
                      </span>
                    )}
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
                      className="w-11 h-11 rounded-full bg-white/90 dark:bg-slate-900/90 backdrop-blur-sm flex items-center justify-center shadow-lg hover:scale-110 transition-all duration-300 cursor-pointer"
                      aria-label={isFavoriteLocal ? "Remove from favorites" : "Add to favorites"}
                    >
                      <Heart className={`w-5 h-5 ${isFavoriteLocal ? 'fill-red-500 text-red-500' : 'text-slate-700 dark:text-slate-300'}`} />
                    </button>
                    <button
                      onClick={(e) => { e.stopPropagation(); handleShare(); }}
                      className="w-11 h-11 rounded-full bg-white/90 dark:bg-slate-900/90 backdrop-blur-sm flex items-center justify-center shadow-lg hover:scale-110 transition-all duration-300 cursor-pointer"
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
                  <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-thin">
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

              {/* Description */}
              <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-white/5 p-4 lg:p-8 rounded-2xl lg:rounded-[32px] shadow-sm dark:shadow-slate-900/50">
                <div className="flex items-center gap-2 border-b border-slate-100 dark:border-white/5 pb-3 mb-4">
                  <div className="w-1.5 h-4 bg-[#00A86B] rounded-full" />
                  <h3 className="text-xs font-black text-slate-900 dark:text-white uppercase tracking-widest">
                    {t.descTitle}
                  </h3>
                </div>
                <p className="text-sm text-slate-600 dark:text-slate-400 font-medium leading-relaxed">{t.descBody}</p>
              </div>

              {/* Specifications Grid */}
              <SpecsGrid listing={listing} currentGlobalLang={currentGlobalLang} />

              {/* Audit Warning Frame */}
                <div className="bg-emerald-50/60 dark:bg-emerald-950/30 border border-emerald-200/60 dark:border-emerald-800/30 p-4 lg:p-6 rounded-2xl lg:rounded-[32px] flex items-start space-x-3">
                <ShieldCheck className="w-6 h-6 text-[#00A86B] shrink-0 mt-0.5" />
                <div className="space-y-1 text-left">
                  <h4 className="text-xs font-black text-emerald-900 dark:text-emerald-400 uppercase tracking-wide">{t.auditTitle}</h4>
                  <p className="text-xs text-emerald-800 dark:text-emerald-500 font-medium leading-relaxed">{t.auditBody}</p>
                </div>
              </div>

              </div>

            {/* Right Transaction Control Panel */}
            <div className="w-full lg:w-[32%] lg:sticky lg:top-36 space-y-4 lg:space-y-6">
              <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-white/5 p-4 lg:p-8 rounded-2xl lg:rounded-[32px] shadow-xl dark:shadow-slate-900/50 space-y-6 lg:space-y-8 relative overflow-hidden">
                <div className="absolute top-0 left-0 right-0 h-[4px] bg-[#00A86B]" />
                
                {/* Price Section */}
                <div className="text-left space-y-1.5">
                  <span className="text-[10px] uppercase font-black text-slate-400 dark:text-slate-500 tracking-widest block">{t.priceLabel}</span>
                  <span className="text-xl sm:text-2xl lg:text-3xl font-black text-slate-900 dark:text-white tracking-tight block">{t.priceValue}</span>
                  <div className="flex items-center gap-2 mt-2">
                    <span className={`inline-block px-3 py-1 rounded-lg text-xs font-black uppercase ${isSale ? "bg-emerald-500/10 border border-emerald-200 text-emerald-600 dark:border-emerald-800 dark:text-emerald-400" : "bg-amber-500/10 border border-amber-200 text-amber-600 dark:border-amber-800 dark:text-amber-400"}`}>
                      {t.dealType}
                    </span>
                    {listing.priceTagKey === 'price.negotiable' && (
                      <span className="inline-block px-3 py-1 rounded-lg text-xs bg-rose-50 border border-rose-100 text-rose-600 font-black uppercase">
                        {t.negotiable}
                      </span>
                    )}
                  </div>
                </div>

                <div className="border-t border-slate-100 dark:border-white/5" />

                {/* Vendor Profile Section */}
                <div className="bg-slate-50 dark:bg-slate-800/50 p-3 lg:p-4 rounded-xl lg:rounded-2xl border border-slate-100 dark:border-white/5">
                  <div className="flex items-center space-x-4">
                    <div className="w-12 h-12 bg-slate-200 dark:bg-slate-700 rounded-full flex items-center justify-center text-xl shrink-0">
                      👤
                    </div>
                    <div>
                      <p className="text-[10px] uppercase font-black text-slate-400 dark:text-slate-500 tracking-wider">{t.ownerTitle}</p>
                      <p className="text-sm font-black text-slate-900 dark:text-white">{listing.sellerName || t.ownerName}</p>
                      {listing.sellerStatus === "store" && listing.sellerUserId && (
                        <Link
                          to={`/store/${listing.sellerUserId}`}
                          className="mt-1 inline-flex items-center gap-1.5 text-[11px] font-bold text-[#00A86B] hover:underline"
                        >
                          <Store className="size-3.5" />
                          {currentGlobalLang === "am" ? "የሱቅ ገጽ ይመልከቱ" : "Visit store"}
                        </Link>
                      )}
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
                  {!hasRated && listing.sellerUserId && listing.isActive !== false && (
                    <button
                      onClick={() => setShowRateModal(true)}
                      className="mt-3 w-full text-xs font-bold text-[#00A86B] hover:text-emerald-600 py-1.5 rounded-lg border border-[#00A86B]/30 hover:border-[#00A86B] transition-colors"
                    >
                      ⭐ Rate this seller
                    </button>
                  )}
                </div>

                <div className="border-t border-slate-100 dark:border-white/5" />

                {/* High-Conversion Primary Actions */}
                {listing.isActive === false ? (
                  <div className="bg-rose-50 dark:bg-rose-950/30 border border-rose-200 dark:border-rose-900/40 rounded-xl lg:rounded-2xl p-5 lg:p-6 text-center">
                    <div className="text-3xl lg:text-4xl mb-2">{currentGlobalLang === "am" ? "🚫" : "📦"}</div>
                    <h3 className="font-black text-slate-900 dark:text-white text-base lg:text-lg">
                      {currentGlobalLang === "am" ? "ይህ ማህደር ከአሁን በኋላ አይገኝም" : "This listing is no longer available"}
                    </h3>
                    <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
                      {currentGlobalLang === "am"
                        ? "ምናልባት ተሽጧል ወይም በሻጩ ተወግዷል።"
                        : "It may have been sold or removed by the seller."}
                    </p>
                    <button
                      onClick={() => navigate('/')}
                      className="mt-4 bg-[#00A86B] hover:bg-emerald-600 text-white px-6 py-2.5 rounded-xl font-bold text-xs uppercase tracking-wider transition-all duration-300"
                    >
                      {currentGlobalLang === "am" ? "ተመሳሳይ ማህደሮችን ይመልከቱ" : "Browse similar listings"}
                    </button>
                  </div>
                ) : (
                <div className="space-y-2.5 lg:space-y-3">
                  {isAuthenticated && listing.sellerUserId && listing.sellerUserId !== user?.id && (
                    <button
                      onClick={() => openChat(listing.sellerUserId!, listing.sellerName || "Seller", Number(id))}
                      className="w-full bg-[#0B132B] hover:bg-[#1a2340] text-white py-3.5 lg:py-4 rounded-xl transition-all duration-300 flex items-center justify-center space-x-2 cursor-pointer shadow-sm"
                    >
                      <MessageCircle className="size-4 lg:size-5" />
                      <span className="font-black tracking-wider uppercase text-xs lg:text-sm">{t.btnChat}</span>
                    </button>
                  )}

                  <a
                    href={`tel:${listing.phone}`}
                    onClick={() => trackEvent('click_call', listing)}
                    className="w-full bg-[#00A86B] hover:bg-emerald-600 text-white py-3.5 lg:py-4 rounded-xl transition-all duration-300 flex items-center justify-center space-x-2 cursor-pointer shadow-sm"
                  >
                    <Phone className="size-4 lg:size-5" />
                    <span className="font-black tracking-wider uppercase text-xs lg:text-sm">{t.btnCall}</span>
                  </a>

                  <a
                    href={`https://t.me/${listing.whatsapp}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    onClick={() => trackEvent('click_telegram', listing)}
                    className="w-full bg-[#24A1DE] hover:bg-[#1c8ec7] text-white py-3.5 lg:py-4 rounded-xl transition-all duration-300 flex items-center justify-center space-x-2 cursor-pointer shadow-sm hover:shadow-[0_6px_15px_rgba(36,161,222,0.35)]"
                  >
                    <Send className="size-4 lg:size-5 -ml-1 translate-y-[1px]" />
                    <span className="font-black tracking-wider uppercase text-xs lg:text-sm">{t.btnTelegram}</span>
                  </a>

                  <button
                    onClick={handleToggleFavorite}
                    className={`w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-white/10 text-slate-800 dark:text-slate-300 py-3 lg:py-3.5 rounded-xl transition-all duration-300 flex items-center justify-center space-x-2 cursor-pointer shadow-inner ${isFavoriteLocal ? 'bg-rose-50 dark:bg-rose-950/20 border-rose-100 dark:border-rose-800/30' : 'hover:bg-slate-50 dark:hover:bg-slate-800'}`}
                  >
                    <Heart className={`size-4 ${isFavoriteLocal ? 'fill-rose-500 text-rose-500' : 'text-slate-500'}`} />
                    <span className={`font-black tracking-wider uppercase text-xs lg:text-sm ${isFavoriteLocal ? 'text-rose-600' : 'text-slate-700 dark:text-slate-300'}`}>
                      {t.btnFavorite}
                    </span>
                  </button>
                </div>
                )}
              </div>

              {/* Safety Tips */}
              <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-white/5 p-4 lg:p-6 rounded-2xl lg:rounded-[32px] shadow-sm dark:shadow-slate-900/50">
                <div className="flex items-center gap-2 mb-3">
                  <ShieldCheck className="w-4 h-4 text-[#00A86B]" />
                  <h3 className="text-xs font-black text-slate-900 dark:text-white uppercase tracking-wider">{t.safetyTitle}</h3>
                </div>
                <ul className="space-y-2.5">
                  {t.safetyTips.map((tip, idx) => (
                    <li key={idx} className="flex items-start gap-2.5 text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
                      <span className="w-1.5 h-1.5 rounded-full bg-[#00A86B] mt-[5px] shrink-0" />
                      {tip}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>

          {/* Related Listings — full width at the very bottom */}
          {relatedListings.length > 0 && listing && (
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-white/5 p-4 lg:p-8 rounded-2xl lg:rounded-[32px] shadow-sm dark:shadow-slate-900/50 space-y-4 lg:space-y-6">
              <div className="border-b border-slate-100 dark:border-white/5 pb-3 flex items-center space-x-2">
                <div className="w-1.5 h-4 bg-[#00A86B] rounded-full" />
                <h3 className="text-sm font-black text-slate-900 dark:text-white uppercase tracking-wider font-sans">
                  {t.relatedListings}
                </h3>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
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

      {/* Mobile Sticky Contact Bar */}
      {listing.isActive !== false && listing.sellerUserId && listing.sellerUserId !== user?.id && (
        <div className="fixed bottom-0 left-0 right-0 lg:hidden z-40 bg-white dark:bg-slate-900 border-t border-slate-200 dark:border-white/10 shadow-[0_-4px_20px_rgba(0,0,0,0.1)]" style={{ paddingBottom: 'env(safe-area-inset-bottom, 0px)' }}>
          <div className="flex items-center gap-2.5 p-3 pb-[max(0.75rem,env(safe-area-inset-bottom,0px))]">
            <a
              href={`tel:${listing.phone}`}
              className="flex-1 flex items-center justify-center gap-1.5 bg-[#00A86B] hover:bg-emerald-600 text-white py-3 rounded-xl font-black text-xs uppercase tracking-wider transition-colors"
            >
              <Phone className="size-4" />
              {t.btnCall}
            </a>
            {isAuthenticated && (
              <button
                onClick={() => openChat(listing.sellerUserId!, listing.sellerName || "Seller", Number(id))}
                className="flex-1 flex items-center justify-center gap-1.5 bg-[#0B132B] hover:bg-[#1a2340] text-white py-3 rounded-xl font-black text-xs uppercase tracking-wider transition-colors"
              >
                <MessageCircle className="size-4" />
                {t.btnChat}
              </button>
            )}
            <a
              href={`https://t.me/${listing.whatsapp}`}
              target="_blank"
              rel="noopener noreferrer"
              className="flex-1 flex items-center justify-center gap-1.5 bg-[#24A1DE] hover:bg-[#1c8ec7] text-white py-3 rounded-xl font-black text-xs uppercase tracking-wider transition-colors"
            >
              <Send className="size-3.5 -ml-0.5" />
              {t.btnTelegram}
            </a>
          </div>
        </div>
      )}

    </section>
  );
};

export default ListingDetailsContent;
