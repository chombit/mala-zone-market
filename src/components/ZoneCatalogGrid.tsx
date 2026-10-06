/**
 * ZoneCatalogGrid.tsx
 * Malazone.com — Premium Listings Catalog Grid
 * © 2026 Malazone Technologies PLC
 */

import React, { useState, useMemo, useCallback, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useSocketTracker } from "../hooks/useSocketTracker";
import {
  Phone,
  Send,
  MapPin,
  Star,
  CheckCircle2,
  Sparkles,
  Zap,
  FileText,
  Ruler,
  Settings,
  Key,
  Building2,
  ChevronLeft,
  ChevronRight,
  ArrowRight,
  Heart,
  Share2,
  Check,
  MessageCircle,
  Image,
  X,
  RotateCcw,
  Search,
} from "lucide-react";
import { useLanguage } from "@/contexts/ZoneLanguageContext";
import { useAuth } from "@/contexts/AuthContext";
import { useChat } from "@/contexts/ChatContext";
import { useCity } from "@/contexts/CityContext";
import { useListingRevision } from "@/contexts/ListingRealtimeContext";
import { useScrollReveal, use3DTilt } from "@/hooks/useWorldClassAnimations";
import { useFavorites } from "@/contexts/FavoritesContext";
import type { ActiveZone } from "./ZoneFilterSidebar";
import type { FilterState } from "./ZoneFilterSidebar";

/* ────────────────────────────────────────────
   Listing Data Model
   ──────────────────────────────────────────── */
export interface ListingItem {
  id: string;
  titleEn: string;
  titleAm: string;
  descriptionAm?: string;
  descriptionEn?: string;
  price: number;
  priceSuffixKey: string;
  priceTagKey: string;
  isNegotiable?: boolean;
  image: string;
  images?: string[];
  zone: ActiveZone;
  locationKey: string;
  locationTag: string;
  rating: number;
  isVerified: boolean;
  isPremium: boolean;
  badgeKey: string;
  reviewCount?: number;
  /* Car-specific */
  vehicleType?: string;
  plateCode?: string;
  fuelType?: string;
  fuelTag?: string;
  condition?: string;
  /* House-specific */
  propertyType?: string;
  titleDeed?: string;
  sqm?: number;
  bedrooms?: number;
  bathrooms?: number;
  /* Fashion-specific */
  billingTrack?: string;
  specLabel?: string;
  specVal?: string;
  /* Dynamic taxonomy attributes from DB */
  attributes?: Record<string, any>;
  category?: string;
  subcategorySlug?: string;
  phone: string;
  whatsapp: string;
  sellerUserId?: number;
  sellerName?: string;
  /** Progressive seller profile: 'casual' (default) or 'store'. */
  sellerStatus?: string;
  /** Availability — false when sold/archived/suspended; default true. */
  isActive?: boolean;
  status?: string;
}

/* ────────────────────────────────────────────
   Mock Inventory Data (Fallback)
   ──────────────────────────────────────────── */
export const FALLBACK_LISTINGS: ListingItem[] = [
  { id: "37", titleEn: "3 Bedroom House in Tabor", titleAm: "3 መኝታ ክፍል ቤት በታቦር", price: 4500000, priceSuffixKey: "price.etb", priceTagKey: "price.fixed", image: "https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=800&q=80&fm=webp", images: ["https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=800&q=80&fm=webp", "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=800&q=80&fm=webp", "https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?w=800&q=80&fm=webp"], zone: "house", locationKey: "hawassa", locationTag: "TABOR", rating: 4, reviewCount: 13, isVerified: true, isPremium: true, badgeKey: "badge.verifiedCarta", propertyType: "house", titleDeed: "yes", sqm: 180, bedrooms: 3, bathrooms: 2, phone: "+251911223344", whatsapp: "+251911223344", descriptionEn: "Spacious 3-bedroom house in Tabor, Hawassa.", descriptionAm: "በሐዋሳ ታቦር ውስጥ ሰፊ 3 መኝታ ክፍል ቤት።", sellerUserId: 6, sellerName: "Solomon Birhanu" },
  { id: "38", titleEn: "Lakefront 2BR Apartment — Furnished", titleAm: "2 መኝታ ክፍል አፓርታማ በሐይቅ ጫፍ — የተቀመጠ", price: 18000, priceSuffixKey: "price.month", priceTagKey: "price.negotiable", image: "https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?w=800&q=80&fm=webp", images: ["https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?w=800&q=80&fm=webp", "https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?w=800&q=80&fm=webp", "https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=800&q=80&fm=webp", "https://images.unsplash.com/photo-1493809842364-78817add7ffb?w=800&q=80&fm=webp"], zone: "house", locationKey: "hawassa", locationTag: "LAKEFRONT", rating: 4.2, reviewCount: 11, isVerified: true, isPremium: false, badgeKey: "badge.verified", propertyType: "apartment", titleDeed: "yes", sqm: 95, bedrooms: 2, bathrooms: 1, phone: "+251911223355", whatsapp: "+251911223355", descriptionEn: "Fully furnished 2-bedroom apartment overlooking Lake Hawassa.", descriptionAm: "በሐዋሳ ሐይቅ ገጽታ የሚያይ ሙሉ በሙሉ የተቀመጠ 2 መኝታ ክፍል አፓርታማ።", sellerUserId: 15, sellerName: "solomon birhanu buche" },
  { id: "39", titleEn: "New 4-Bedroom Villa in Piassa", titleAm: "አዲስ 4 መኝታ ክፍል ቪላ በፒያሳ", price: 7800000, priceSuffixKey: "price.etb", priceTagKey: "price.fixed", image: "https://images.unsplash.com/photo-1613490493576-7fde63acd811?w=800&q=80&fm=webp", images: ["https://images.unsplash.com/photo-1613490493576-7fde63acd811?w=800&q=80&fm=webp", "https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=800&q=80&fm=webp", "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=800&q=80&fm=webp"], zone: "house", locationKey: "hawassa", locationTag: "TABOR", rating: 4.4, reviewCount: 11, isVerified: true, isPremium: true, badgeKey: "badge.verifiedCarta", propertyType: "house", titleDeed: "yes", sqm: 280, bedrooms: 4, bathrooms: 3, phone: "+251911223377", whatsapp: "+251911223377", descriptionEn: "Brand new 4-bedroom villa with servant quarter.", descriptionAm: "አዲስ 4 መኝታ ክፍል ቪላ ከአገልግሎት ክፍል ጋር።", sellerUserId: 22, sellerName: "Muluken Melese" },
  { id: "40", titleEn: "Shop Space for Rent — Hawassa Center", titleAm: "የሱপ ቦታ በኪራይ — ሀዋሳ ማዕከል", price: 8000, priceSuffixKey: "price.month", priceTagKey: "price.negotiable", image: "https://images.unsplash.com/photo-1560518883-ce09059eeffa?w=800&q=80&fm=webp", zone: "house", locationKey: "hawassa", locationTag: "TABOR", rating: 4.1, reviewCount: 8, isVerified: true, isPremium: false, badgeKey: "badge.verified", propertyType: "commercial", sqm: 30, phone: "+251911223399", whatsapp: "+251911223399", descriptionEn: "Ground-floor commercial space in central Hawassa.", descriptionAm: "በሀዋሳ ማዕከል ውስጥ የምድር ፊት የንግድ ቦታ።", sellerUserId: 26, sellerName: "Biniam" },
  { id: "41", titleEn: "Vacation House near Lake Langano", titleAm: "የማረፊያ ቤት በላንጋኖ ሐይቅ አቅራቢያ", price: 3200000, priceSuffixKey: "price.etb", priceTagKey: "price.negotiable", image: "https://images.unsplash.com/photo-1564013799919-ab600027ffc6?w=800&q=80&fm=webp", images: ["https://images.unsplash.com/photo-1564013799919-ab600027ffc6?w=800&q=80&fm=webp", "https://images.unsplash.com/photo-1600607687644-aac4c3eac7f4?w=800&q=80&fm=webp"], zone: "house", locationKey: "yirgalem", locationTag: "LANGANO", rating: 4.3, reviewCount: 11, isVerified: false, isPremium: false, badgeKey: "badge.verified", propertyType: "house", titleDeed: "yes", sqm: 120, bedrooms: 2, bathrooms: 1, phone: "+251911223400", whatsapp: "+251911223400", descriptionEn: "2-bedroom vacation home with lake view.", descriptionAm: "የሐይቅ ገጽታ ያለው 2 መኝታ ክፍል ማረፊያ ቤት።", sellerUserId: 27, sellerName: "Mulatu" },
  { id: "42", titleEn: "2019 Toyota Corolla — Single Owner", titleAm: "2019 ቶዮታ ኮሮላ — አንድ ባለቤት", price: 1200000, priceSuffixKey: "price.etb", priceTagKey: "price.fixed", image: "https://images.unsplash.com/photo-1549317661-bd32c8ce0db2?w=800&q=80&fm=webp", images: ["https://images.unsplash.com/photo-1549317661-bd32c8ce0db2?w=800&q=80&fm=webp", "https://images.unsplash.com/photo-1552519507-da3b142c6e3d?w=800&q=80&fm=webp", "https://images.unsplash.com/photo-1503376780353-7e6692767b70?w=800&q=80&fm=webp", "https://images.unsplash.com/photo-1580273916550-e323be2ae537?w=800&q=80&fm=webp"], zone: "car", locationKey: "hawassa", locationTag: "TABOR", rating: 4, reviewCount: 13, isVerified: true, isPremium: true, badgeKey: "badge.verifiedCarta", vehicleType: "sedan", plateCode: "A1234", fuelType: "benzine", fuelTag: "BENZINE", condition: "used", phone: "+251911223344", whatsapp: "+251911223344", descriptionEn: "Well-maintained 2019 Toyota Corolla. Single owner, 45,000 km.", descriptionAm: "በጠበቀ ሁኔታ የተጠበቀ 2019 ቶዮታ ኮሮላ።", sellerUserId: 6, sellerName: "Solomon Birhanu" },
  { id: "43", titleEn: "2022 Honda CB500 Motorcycle", titleAm: "2022 ሆንዳ CB500 ሞተር ሳይክል", price: 320000, priceSuffixKey: "price.etb", priceTagKey: "price.negotiable", image: "https://images.unsplash.com/photo-1558981806-ec527fa84c39?w=800&q=80&fm=webp", images: ["https://images.unsplash.com/photo-1558981806-ec527fa84c39?w=800&q=80&fm=webp", "https://images.unsplash.com/photo-1558981403-c5f9899a28bc?w=800&q=80&fm=webp"], zone: "car", locationKey: "hawassa", locationTag: "TABOR", rating: 4, reviewCount: 12, isVerified: true, isPremium: false, badgeKey: "badge.verified", plateCode: "B5678", fuelType: "benzine", fuelTag: "BENZINE", condition: "used", phone: "+251911223388", whatsapp: "+251911223388", descriptionEn: "Low-mileage Honda CB500F. 8,000 km, always garaged.", descriptionAm: "ዝቅተኛ ርቀት ያለው ሆንዳ CB500F።", sellerUserId: 24, sellerName: "Ashenafi Haile" },
  { id: "44", titleEn: "2021 Hyundai Tucson — Full Options", titleAm: "2021 ሀይንዳይ ቱሰን — ሙሉ አማራጮች", price: 2800000, priceSuffixKey: "price.etb", priceTagKey: "price.fixed", image: "https://images.unsplash.com/photo-1633477189729-9290b3261d0a?w=800&q=80&fm=webp", zone: "car", locationKey: "addis_ababa", locationTag: "ADDIS ABABA", rating: 4.5, reviewCount: 10, isVerified: true, isPremium: true, badgeKey: "badge.verifiedCarta", vehicleType: "suv", plateCode: "C9012", fuelType: "benzine", fuelTag: "BENZINE", condition: "used", phone: "+251911223366", whatsapp: "+251911223366", descriptionEn: "2021 Hyundai Tucson Premium. AWD, panoramic sunroof.", descriptionAm: "2021 ሀይንዳይ ቱሰን ፕሪሚየም።", sellerUserId: 19, sellerName: "Ada" },
  { id: "45", titleEn: "Electric Motorbike — E-Lion", titleAm: "ኤሌክትሪክ ሞተር ሳይክል — E-Lion", price: 85000, priceSuffixKey: "price.etb", priceTagKey: "price.negotiable", image: "https://images.unsplash.com/photo-1558981403-c5f9899a28bc?w=800&q=80&fm=webp", zone: "car", locationKey: "hawassa", locationTag: "LAKEFRONT", rating: 4.1, reviewCount: 8, isVerified: true, isPremium: false, badgeKey: "badge.verified", fuelType: "electric", fuelTag: "ELECTRIC", condition: "new", phone: "+251911223399", whatsapp: "+251911223399", descriptionEn: "Brand new E-Lion electric motorbike. 80km range.", descriptionAm: "አዲስ E-Lion ኤሌክትሪክ ሞተር ሳይክል።", sellerUserId: 26, sellerName: "Biniam" },
  { id: "46", titleEn: "2020 Toyota Hilux Double Cabin", titleAm: "2020 ቶዮታ ሂሉክስ ድብል ኪ臖ን", price: 3500000, priceSuffixKey: "price.etb", priceTagKey: "price.negotiable", image: "https://images.unsplash.com/photo-1559416523-140ddc3d238c?w=800&q=80&fm=webp", zone: "car", locationKey: "aleta_wondo", locationTag: "ALETA WONDO", rating: 4, reviewCount: 11, isVerified: true, isPremium: false, badgeKey: "badge.verified", vehicleType: "truck", plateCode: "D3456", fuelType: "diesel", fuelTag: "DIESEL", condition: "used", phone: "+251911223377", whatsapp: "+251911223377", descriptionEn: "Toyota Hilux 2020, diesel, 4WD, used for light duty only.", descriptionAm: "ቶዮታ ሂሉክስ 2020፣ ዴዘል፣ 4WD።", sellerUserId: 22, sellerName: "Muluken Melese" },
  { id: "47", titleEn: "Hawassa Lakeview Hotel — Standard Room", titleAm: "ሐዋሳ የሐይቅ ገጽታ ሆቴል — መደበኛ ክፍል", price: 2500, priceSuffixKey: "price.day", priceTagKey: "price.fixed", image: "https://images.unsplash.com/photo-1631049307264-da0ec9d70304?w=800&q=80&fm=webp", images: ["https://images.unsplash.com/photo-1631049307264-da0ec9d70304?w=800&q=80&fm=webp", "https://images.unsplash.com/photo-1590490360182-c33d57733427?w=800&q=80&fm=webp", "https://images.unsplash.com/photo-1584132967334-10e028bd69f7?w=800&q=80&fm=webp"], zone: "stay", locationKey: "hawassa", locationTag: "LAKEFRONT", rating: 4, reviewCount: 11, isVerified: true, isPremium: true, badgeKey: "badge.verifiedCarta", phone: "+251911223355", whatsapp: "+251911223355", descriptionEn: "Standard hotel room with lake view. Free Wi-Fi, breakfast included.", descriptionAm: "የሐይቅ ገጽታ ያለው መደበኛ የሆቴል ክፍል።", sellerUserId: 15, sellerName: "solomon birhanu buche" },
  { id: "48", titleEn: "Lakefront Airbnb Studio", titleAm: "የሐይቅ ጫፍ ኤርቢኤንቢ ስቱዲዮ", price: 3500, priceSuffixKey: "price.day", priceTagKey: "price.negotiable", image: "https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?w=800&q=80&fm=webp", zone: "stay", locationKey: "hawassa", locationTag: "LAKEFRONT", rating: 4, reviewCount: 12, isVerified: true, isPremium: false, badgeKey: "badge.verified", phone: "+251911223388", whatsapp: "+251911223388", descriptionEn: "Cozy self-contained studio apartment. Kitchen, balcony.", descriptionAm: "ቀላል ራስን የሚያስተዳድር ስቱዲዮ አፓርታማ።", sellerUserId: 24, sellerName: "Ashenafi Haile" },
  { id: "49", titleEn: "Haile Resort — Deluxe Room", titleAm: "ሀይሌ ሪዞርት — ዴሉክስ ክፍል", price: 4500, priceSuffixKey: "price.day", priceTagKey: "price.fixed", image: "https://images.unsplash.com/photo-1551882547-ff40c63fe5fa?w=800&q=80&fm=webp", images: ["https://images.unsplash.com/photo-1551882547-ff40c63fe5fa?w=800&q=80&fm=webp", "https://images.unsplash.com/photo-1571896349842-33c89424de2d?w=800&q=80&fm=webp"], zone: "stay", locationKey: "hawassa", locationTag: "LAKEFRONT", rating: 4.4, reviewCount: 11, isVerified: true, isPremium: true, badgeKey: "badge.verifiedCarta", phone: "+251911223400", whatsapp: "+251911223400", descriptionEn: "Premium lakefront resort room. Pool access, restaurant, spa.", descriptionAm: "ፕሪሚየም የሐይቅ ጫፍ ሪዞርት ክፍል።", sellerUserId: 27, sellerName: "Mulatu" },
  { id: "50", titleEn: "Budget Guest House — Tabor", titleAm: "ምንጭ ያለው የእንግዳ ቤት — ታቦር", price: 1200, priceSuffixKey: "price.day", priceTagKey: "price.negotiable", image: "https://images.unsplash.com/photo-1587381420270-3e1a5b9e6904?w=800&q=80&fm=webp", zone: "stay", locationKey: "hawassa", locationTag: "TABOR", rating: 4.5, reviewCount: 10, isVerified: false, isPremium: false, badgeKey: "badge.verified", phone: "+251911223366", whatsapp: "+251911223366", descriptionEn: "Clean, affordable guesthouse in Tabor.", descriptionAm: "በታቦር ውስጥ ን끗 ያለ ምንጭ ያለው የእንግዳ ቤት።", sellerUserId: 19, sellerName: "Ada" },
  { id: "51", titleEn: "Lake Langano Resort — Family Suite", titleAm: "የሐይቅ ሪዞርት — ስንቅ ክፍል", price: 6000, priceSuffixKey: "price.day", priceTagKey: "price.fixed", image: "https://images.unsplash.com/photo-1566073771259-6a8506099945?w=800&q=80&fm=webp", zone: "stay", locationKey: "yirgalem", locationTag: "LANGANO", rating: 3.9, reviewCount: 13, isVerified: true, isPremium: true, badgeKey: "badge.verifiedCarta", phone: "+251911223344", whatsapp: "+251911223344", descriptionEn: "Spacious family suite at Lake Langano resort.", descriptionAm: "በላንጋኖ ሪዞርት ውስጥ ሰፊ ስንቅ ክፍል።", sellerUserId: 6, sellerName: "Solomon Birhanu" },
   { id: "52", titleEn: "3-Seater Fabric Sofa — Modern", titleAm: "ሞደርን ሶፋ", price: 25000, priceSuffixKey: "price.etb", priceTagKey: "price.fixed", image: "https://images.unsplash.com/photo-1555041469-a586c61ea9bc?w=800&q=80&fm=webp", zone: "furniture", locationKey: "hawassa", locationTag: "TABOR", rating: 4, reviewCount: 11, isVerified: true, isPremium: true, badgeKey: "badge.verifiedCarta", phone: "+251911223377", whatsapp: "+251911223377", descriptionEn: "Comfortable modern fabric sofa set for living rooms.", descriptionAm: "ለመኝታ ክፍል ምቹ ሞደርን ሶፋ።", sellerUserId: 22, sellerName: "Muluken Melese" },
   { id: "53", titleEn: "Solid Wood Dining Table — 6 Seats", titleAm: "የምግብ ሰንጠረዥ", price: 18000, priceSuffixKey: "price.etb", priceTagKey: "price.negotiable", image: "https://images.unsplash.com/photo-1533090481720-856c6e3c1fdc?w=800&q=80&fm=webp", zone: "furniture", locationKey: "hawassa", locationTag: "TABOR", rating: 4.1, reviewCount: 8, isVerified: true, isPremium: false, badgeKey: "badge.verified", phone: "+251911223399", whatsapp: "+251911223399", descriptionEn: "Solid wood dining table with six matching seats.", descriptionAm: "ስድስት ወንበሮች ያሏቸው የእንጨት የምግብ ሰንጠረዦች።", sellerUserId: 26, sellerName: "Biniam" },
   { id: "54", titleEn: "King Size Bed Frame with Headboard", titleAm: "መኝታ አልጋ", price: 22000, priceSuffixKey: "price.etb", priceTagKey: "price.fixed", image: "https://images.unsplash.com/photo-1505693416388-ac5ce068fe85?w=800&q=80&fm=webp", zone: "furniture", locationKey: "hawassa", locationTag: "TABOR", rating: 4, reviewCount: 11, isVerified: true, isPremium: true, badgeKey: "badge.verifiedCarta", phone: "+251911223355", whatsapp: "+251911223355", descriptionEn: "Sturdy king size bed frame with upholstered headboard.", descriptionAm: "ጠንካራ የንጉሥ መጠን አልጋ ከራሱ ኋላ ጋር።", sellerUserId: 15, sellerName: "solomon birhanu buche" },
   { id: "55", titleEn: "Ergonomic Office Desk & Chair", titleAm: "የቢሮ ጠረጴዛ እና ወንበር", price: 15000, priceSuffixKey: "price.etb", priceTagKey: "price.negotiable", image: "https://images.unsplash.com/photo-1518455027359-f3f8164ba6bd?w=800&q=80&fm=webp", zone: "furniture", locationKey: "hawassa", locationTag: "LAKEFRONT", rating: 4.4, reviewCount: 11, isVerified: true, isPremium: false, badgeKey: "badge.verified", phone: "+251911223400", whatsapp: "+251911223400", descriptionEn: "Complete home office setup — desk plus ergonomic chair.", descriptionAm: "ሙሉ የቤት ቢሮ ማቅረቢያ — ጠረጴዛ እና ምቹ ወንበር።", sellerUserId: 27, sellerName: "Mulatu" },
   { id: "56", titleEn: "Men's Premium Leather Jacket", titleAm: "የወንዶች ቆዳ ጀኬት", price: 8500, priceSuffixKey: "price.etb", priceTagKey: "price.fixed", image: "https://images.unsplash.com/photo-1551028719-00167b16eac5?w=800&q=80&fm=webp", zone: "fashion", locationKey: "hawassa", locationTag: "TABOR", rating: 4, reviewCount: 13, isVerified: true, isPremium: true, badgeKey: "badge.verifiedCarta", phone: "+251911223344", whatsapp: "+251911223344", descriptionEn: "Premium genuine leather jacket, brand new.", descriptionAm: "አዲስ ከቆዳ የተሰራ ጀኬት።", sellerUserId: 6, sellerName: "Solomon Birhanu" },
   { id: "57", titleEn: "Women's Evening Dress — Imported", titleAm: "የሴቶች ሙሌት ቀሚስ", price: 6500, priceSuffixKey: "price.etb", priceTagKey: "price.negotiable", image: "https://images.unsplash.com/photo-1595777457583-95e059d581b8?w=800&q=80&fm=webp", zone: "fashion", locationKey: "yirgalem", locationTag: "YIRGALEM", rating: 4, reviewCount: 12, isVerified: true, isPremium: false, badgeKey: "badge.verified", phone: "+251911223388", whatsapp: "+251911223388", descriptionEn: "Elegant imported evening dress.", descriptionAm: "ለዝግጅቶች የሚሆን የውጭ አገር ቀሚስ።", sellerUserId: 24, sellerName: "Ashenafi Haile" },
   { id: "58", titleEn: "Classic White Sneakers — All Sizes", titleAm: "ስፖርት ጫማ", price: 4500, priceSuffixKey: "price.etb", priceTagKey: "price.negotiable", image: "https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=800&q=80&fm=webp", zone: "fashion", locationKey: "bensa", locationTag: "BENSA", rating: 4.5, reviewCount: 10, isVerified: true, isPremium: false, badgeKey: "badge.verified", phone: "+251911223366", whatsapp: "+251911223366", descriptionEn: "Unisex classic sneakers, all sizes available.", descriptionAm: "ለሁሉም መጠኖች የሚሆኑ ነጭ ጫማዎች።", sellerUserId: 19, sellerName: "Ada" },
   { id: "59", titleEn: "Men's Automatic Wrist Watch", titleAm: "የእጅ ሰዓት", price: 12000, priceSuffixKey: "price.etb", priceTagKey: "price.fixed", image: "https://images.unsplash.com/photo-1524805444758-089113d48a6d?w=800&q=80&fm=webp", zone: "fashion", locationKey: "chuko", locationTag: "CHUKO", rating: 4, reviewCount: 11, isVerified: true, isPremium: true, badgeKey: "badge.verifiedCarta", phone: "+251911223377", whatsapp: "+251911223377", descriptionEn: "Stainless steel automatic watch, water resistant.", descriptionAm: "ከብረት የተሰራ፣ ውሃ የማይገባበት የእጅ ሰዓት።", sellerUserId: 22, sellerName: "Muluken Melese" },
  { id: "60", titleEn: "Samsung Galaxy S24 Ultra — 256GB", titleAm: "ሳምሰንግ ጋላክሲ S24 እልትራ — 256GB", price: 85000, priceSuffixKey: "price.etb", priceTagKey: "price.fixed", image: "https://images.unsplash.com/photo-1610945415295-d9bbf067e59c?w=800&q=80&fm=webp", images: ["https://images.unsplash.com/photo-1610945415295-d9bbf067e59c?w=800&q=80&fm=webp", "https://images.unsplash.com/photo-1592899677977-9c10ca588bbd?w=800&q=80&fm=webp", "https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=800&q=80&fm=webp"], zone: "electronics", locationKey: "hawassa", locationTag: "TABOR", rating: 4, reviewCount: 12, isVerified: true, isPremium: true, badgeKey: "badge.verifiedCarta", condition: "new", phone: "+251911223388", whatsapp: "+251911223388", descriptionEn: "Brand new Samsung Galaxy S24 Ultra. Titanium Black, 256GB.", descriptionAm: "አዲስ ሳምሰንግ ጋላክሲ S24 እልትራ።", sellerUserId: 24, sellerName: "Ashenafi Haile" },
  { id: "61", titleEn: "LG 55\" OLED Smart TV", titleAm: "LG 55\" OLED ሳማርት ቲቪ", price: 65000, priceSuffixKey: "price.etb", priceTagKey: "price.negotiable", image: "https://images.unsplash.com/photo-1593359677879-a4bb92f829d1?w=800&q=80&fm=webp", zone: "electronics", locationKey: "hawassa", locationTag: "TABOR", rating: 3.9, reviewCount: 13, isVerified: true, isPremium: false, badgeKey: "badge.verified", condition: "new", phone: "+251911223344", whatsapp: "+251911223344", descriptionEn: "LG 55-inch OLED 4K Smart TV. Dolby Vision, webOS.", descriptionAm: "LG 55 ኢንች OLED 4K ሳማርት ቲቪ።", sellerUserId: 6, sellerName: "Solomon Birhanu" },
  { id: "62", titleEn: "MacBook Air M3 — 15\"", titleAm: "MacBook Air M3 — 15\"", price: 120000, priceSuffixKey: "price.etb", priceTagKey: "price.fixed", image: "https://images.unsplash.com/photo-1517336714731-489689fd1ca8?w=800&q=80&fm=webp", zone: "electronics", locationKey: "addis_ababa", locationTag: "ADDIS ABABA", rating: 4.4, reviewCount: 11, isVerified: true, isPremium: true, badgeKey: "badge.verifiedCarta", condition: "new", phone: "+251911223400", whatsapp: "+251911223400", descriptionEn: "Apple MacBook Air 15-inch M3 chip, 16GB RAM, 512GB SSD.", descriptionAm: "Apple MacBook Air 15 ኢንች M3 chip፣ 16GB RAM።", sellerUserId: 27, sellerName: "Mulatu" },
  { id: "63", titleEn: "PS5 Console + 2 Controllers", titleAm: "PS5 ኮንሶል + 2 ኮንትሮለሮች", price: 45000, priceSuffixKey: "price.etb", priceTagKey: "price.negotiable", image: "https://images.unsplash.com/photo-1606144042614-b2417e99c4e3?w=800&q=80&fm=webp", zone: "electronics", locationKey: "hawassa", locationTag: "LAKEFRONT", rating: 4.5, reviewCount: 10, isVerified: true, isPremium: false, badgeKey: "badge.verified", condition: "used", phone: "+251911223366", whatsapp: "+251911223366", descriptionEn: "PlayStation 5 disc edition with 2 DualSense controllers.", descriptionAm: "PlayStation 5 ዲስክ ቅርጫ ከ2 DualSense ኮንትሮለሮች ጋር።", sellerUserId: 19, sellerName: "Ada" },
  { id: "64", titleEn: "iPhone 15 Pro Max — 256GB", titleAm: "iPhone 15 Pro Max — 256GB", price: 95000, priceSuffixKey: "price.etb", priceTagKey: "price.negotiable", image: "https://images.unsplash.com/photo-1695048133142-1a20484d2569?w=800&q=80&fm=webp", zone: "electronics", locationKey: "hawassa", locationTag: "TABOR", rating: 4, reviewCount: 11, isVerified: true, isPremium: false, badgeKey: "badge.verified", condition: "used", phone: "+251911223355", whatsapp: "+251911223355", descriptionEn: "iPhone 15 Pro Max, Natural Titanium, 256GB. 95% battery health.", descriptionAm: "iPhone 15 Pro Max፣ ተፈጥሮ ታይታኒየም፣ 256GB።", sellerUserId: 15, sellerName: "solomon birhanu buche" },
];

/* ── Map DB listing shape to ListingItem ── */
export function mapDbListingToItem(row: any): ListingItem {
  const cat = row.category || "property";
  let zone: ActiveZone = "house";
  if (cat === "motors") zone = "car";
  else if (cat === "stay") zone = "stay";
  else if (cat === "furniture" || cat === "ceremony") zone = "furniture";
  else if (cat === "heavy" || cat === "machinery") zone = "fashion";
  else if (cat === "electronics") zone = "electronics";

  const images: string[] = (() => {
    if (!row.images) return [];
    if (Array.isArray(row.images)) return row.images;
    try { return JSON.parse(row.images); } catch { return []; }
  })();

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
    reviewCount: row.review_count ? Number(row.review_count) : 0,
    isVerified: !!row.is_verified,
    isPremium: !!row.is_premium,
    badgeKey: row.is_verified ? "badge.verifiedCarta" : "badge.verified",
    vehicleType: row.vehicle_type || undefined,
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
    attributes: row.attributes && typeof row.attributes === "object" ? row.attributes : {},
    category: row.category || undefined,
    subcategorySlug: row.subcategory_slug || undefined,
  };
}

/* ── Fetch Listings from API ── */
// Only these values are valid `category` enum params on the backend.
const CATEGORY_ENUMS = new Set(["property", "motors", "stay", "furniture", "fashion", "electronics", "ceremony", "heavy"]);

function categoryToParam(cat?: string): string | null {
  if (!cat || cat === "all" || cat.startsWith("intent_") || cat === "more") return null;
  // Legacy tile id used by some hero slides
  const c = cat === "rooms" ? "stay" : cat;
  return CATEGORY_ENUMS.has(c) ? c : null;
}

function useListings(cityKey?: string, category?: string, facetKey = "", facets?: Record<string, string>, subZone = "", revision = 0, intent?: string) {
  const [listings, setListings] = useState<ListingItem[]>(FALLBACK_LISTINGS);
  const [total, setTotal] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);
  /** True when the explicitly-chosen city had zero results and we fell back
   *  to the national inventory so the visitor never dead-ends. */
  const [cityHadNoResults, setCityHadNoResults] = useState(false);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setCityHadNoResults(false);
    // Drop the previous total so a stale count is never shown next to a
    // freshly-issued filter.
    setTotal(null);

    const buildUrl = (withCity: boolean) => {
      const params = new URLSearchParams();
      if (withCity && cityKey) params.set("city", cityKey);
      // Sub-city (official Hawassa sub-cities) — server-side so counts,
      // facets and pagination all respect the selection.
      if (withCity && subZone) params.set("location_key", subZone);
      const catParam = categoryToParam(category);
      if (catParam) params.set("category", catParam);
      // Buy / Rent intent — server-side so pagination & facets stay truthful.
      if (intent && ["buy", "rent", "book", "hourly"].includes(intent)) params.set("intent", intent);
      // Taxonomy facets — subcategory / brand / attr_<key> (server-side)
      if (facets) {
        for (const [k, v] of Object.entries(facets)) {
          if (v) params.set(k, v);
        }
      }
      /* Ask for the API's maximum page. Several facets (bedrooms, sqm,
       * propertyType, titleDeed, plateCode, condition, region, search) are
       * still evaluated in the browser, so a bigger pool directly shrinks how
       * often those filters silently drop matches that live on page 2. */
      params.set("limit", "100");
      const qs = params.toString();
      return `/api/listings${qs ? `?${qs}` : ""}`;
    };
    fetch(buildUrl(true))
      .then(res => res.json())
      .then(data => {
        if (cancelled) return;
        // Real data wins even when EMPTY — never mask an empty category
        // result with the hardcoded fallback mocks.
        if (data.success && Array.isArray(data.data)) {
          setListings(data.data.map(mapDbListingToItem));
        }
        // The API already returns the true match count for the query it just
        // ran. It was being discarded, which forced the UI to report
        // filtered.length (at most one page) as if it were the whole result set.
        const reported = Number(data?.pagination?.total);
        if (Number.isFinite(reported)) setTotal(reported);
        // City-filtered view came back empty → retry nationally so a stale
        // persisted city pick can never produce a bare "No listings" page.
        const emptyWithCity =
          cityKey && data.success && Array.isArray(data.data) && data.data.length === 0;
        if (!emptyWithCity) {
          setLoading(false);
          return;
        }
        fetch(buildUrl(false))
          .then(r2 => r2.json())
          .then(d2 => {
            if (cancelled) return;
            if (d2.success && Array.isArray(d2.data) && d2.data.length > 0) {
              setListings(d2.data.map(mapDbListingToItem));
              setCityHadNoResults(true);
              const national = Number(d2?.pagination?.total);
              if (Number.isFinite(national)) setTotal(national);
            }
            setLoading(false);
          })
          .catch(() => { if (!cancelled) setLoading(false); });
      })
      .catch(() => {
        // Network failure only — offline fallback keeps the UI usable.
        if (!cancelled) {
          setListings(FALLBACK_LISTINGS);
          setLoading(false);
        }
      });
    return () => { cancelled = true; };
    // `facetKey` (stable JSON of the facet params) drives refetches so search
    // typing — which recreates the filters object — does not spam the API.
    // `revision` bumps on every realtime listings:changed event (sold,
    // new, archived, admin/agent edits) so the catalog refreshes live.
  }, [cityKey, category, facetKey, subZone, revision, intent]);

    return { listings, loading, cityHadNoResults, total };
}

/* ────────────────────────────────────────────
   Props
   ──────────────────────────────────────────── */
interface ZoneCatalogGridProps {
  /** Raw category tile id from MainSite (e.g. "property", "intent_buy", "all"). */
  activeCategory?: string;
  activeZone: ActiveZone;
  filters: FilterState;
  onClearCityFilter?: () => void;
  onClearFilter?: (key: keyof FilterState) => void;
}

/* ────────────────────────────────────────────
   Star Renderer
   ──────────────────────────────────────────── */
const StarRating: React.FC<{ rating: number }> = ({ rating }) => {
  const fullStars = Math.floor(rating);
  const hasHalf = rating - fullStars >= 0.3;
  return (
    <div className="flex items-center gap-0.5">
      {Array.from({ length: 5 }, (_, i) => (
        <Star
          key={i}
          className={`w-3.5 h-3.5 ${i < fullStars
            ? "text-amber-500 fill-amber-500"
            : i === fullStars && hasHalf
              ? "text-amber-500 fill-amber-500/50"
              : "text-slate-300 dark:text-slate-600"
            }`}
        />
      ))}
      <span className="text-xs font-semibold text-slate-500 dark:text-slate-400 ml-1">
        {rating}
      </span>
    </div>
  );
};

const formatPrice = (n: number) => n.toLocaleString();

/* ────────────────────────────────────────────
   ──────────────────────────────────────────── */
const ListingCard: React.FC<{
  item: any;
  index: number;
  gridVisible: boolean;
}> = ({ item, index, gridVisible }) => {
  const { language, t } = useLanguage();
  const { isAuthenticated, user } = useAuth();
  const { openChat } = useChat();
  const { ref: tiltRef, style: tiltStyle } = use3DTilt(10, 1200);

  const formatPrice = (n: number) => n.toLocaleString();
  const isSell = item.priceSuffixKey === "price.etb";

  return (
    <article
      ref={tiltRef}
      style={{
        ...tiltStyle,
        animationDelay: `${index * 0.1}s`,
        opacity: gridVisible ? 1 : 0,
        transform: gridVisible
          ? tiltStyle.transform
          : 'translateY(20px)',
        transition: `opacity 0.5s ease-out ${index * 0.1}s, transform 0.5s ease-out ${index * 0.1}s`
      }}
      className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-white/5 rounded-2xl overflow-hidden group hover:border-[#00A86B]/30 hover:bg-slate-50 dark:hover:bg-slate-900/60 hover:-translate-y-4 hover:scale-[1.03] hover:shadow-[0_32px_64px_rgba(0,168,107,0.25)] shadow-md flex flex-col relative transition-all duration-500 ease-out"
    >
      {/* ── Image Container ── */}
      <div className="relative h-52 overflow-hidden">
        <img
          src={item.image}
          alt={language === "amharic" ? item.titleAm : item.titleEn}
          loading="lazy"
          crossOrigin="anonymous"
          className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700 ease-out"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent transition-opacity duration-300 group-hover:opacity-100" />

        {/* Image Count Badge */}
        {item.images && item.images.length > 1 && (
          <div className="absolute bottom-3 left-3 flex items-center gap-1 bg-black/50 backdrop-blur-sm border border-white/20 rounded-lg px-2 py-1">
            <Image className="w-3 h-3 text-white" />
            <span className="text-[11px] font-semibold text-white">{item.images.length}</span>
          </div>
        )}

        {/* Verified Badge + Sell/Rent Badge stack */}
        <div className="absolute top-3 left-3 flex flex-col items-start gap-2">
          <div className="flex items-center gap-1.5 bg-white/25 dark:bg-black/35 backdrop-blur-xl border border-white/30 rounded-xl px-3 py-1.5 group-hover:scale-105 transition-transform duration-300">
            <span className="w-2.5 h-2.5 rounded-full bg-[#00A86B] animate-pulse" />
            <CheckCircle2 className="w-3.5 h-3.5 text-white" />
            <span className="text-[11px] font-semibold text-white tracking-wide">
              {t(item.badgeKey as any)}
            </span>
          </div>

          {/* Sell / Rent intent badge */}
          <div
            className={`flex items-center gap-1.5 rounded-xl px-3 py-1.5 backdrop-blur-xl border font-black uppercase tracking-wider group-hover:scale-105 transition-transform duration-300 ${
              isSell
                ? "bg-[#00A86B]/90 border-emerald-300/40 shadow-lg shadow-emerald-500/20"
                : "bg-amber-500/90 border-amber-300/40 shadow-lg shadow-amber-500/20"
            }`}
          >
            <span className="w-1.5 h-1.5 rounded-full bg-white" />
            <span className="text-[11px] font-bold text-white">
              {t(isSell ? "listing.sell" : "listing.rent")}
            </span>
          </div>
        </div>

        {/* Premium Star */}
        {item.isPremium && (
          <div className="absolute top-3 right-3 w-9 h-9 rounded-xl bg-gradient-to-br from-amber-400 to-amber-600 flex items-center justify-center shadow-2xl group-hover:scale-110 group-hover:rotate-12 transition-all duration-400">
            <Sparkles className="w-4.5 h-4.5 text-white" />
          </div>
        )}
      </div>

      {/* ── Card Body ── */}
      <div className="p-5 flex flex-col flex-grow">
        {/* Star Rating */}
        <div className="mb-2 flex items-center gap-1.5">
          <StarRating rating={item.rating} />
          {item.reviewCount ? (
            <span className="text-[10px] text-slate-400 dark:text-slate-500 font-medium">({item.reviewCount})</span>
          ) : null}
        </div>

        {/* Title */}
        <h3 className="text-[15px] font-extrabold text-slate-900 dark:text-white leading-snug mb-3 line-clamp-2 group-hover:text-[#00A86B] transition-all duration-300 font-sans tracking-wide">
          {language === "amharic" ? item.titleAm : item.titleEn}
        </h3>

        {/* Info Micro-Pills */}
        <div className="flex flex-wrap gap-1.5 mb-4">
          {/* Location pill */}
          <span className="inline-flex items-center gap-1 bg-slate-100 dark:bg-slate-800 border border-slate-200/50 dark:border-white/5 rounded-lg px-2.5 py-1.5 text-[10px] font-bold text-slate-600 dark:text-slate-400 uppercase tracking-wider group-hover:bg-[#00A86B]/10 group-hover:border-[#00A86B]/20 transition-all duration-300">
            <MapPin className="w-3.5 h-3.5 text-red-500" />
            {item.locationTag}
          </span>

          {/* Car-specific pills */}
          {item.zone === "car" && item.plateCode && (
            <span className="inline-flex items-center gap-1 bg-slate-100 dark:bg-slate-800 border border-slate-200/50 dark:border-white/5 rounded-lg px-2.5 py-1.5 text-[10px] font-bold text-slate-600 dark:text-slate-400 uppercase tracking-wider group-hover:bg-[#00A86B]/10 group-hover:border-[#00A86B]/20 transition-all duration-300">
              <FileText className="w-3.5 h-3.5 text-amber-500" />
              {item.plateCode}
            </span>
          )}
          {item.zone === "car" && item.fuelTag && (
            <span className="inline-flex items-center gap-1 bg-slate-100 dark:bg-slate-800 border border-slate-200/50 dark:border-white/5 rounded-lg px-2.5 py-1.5 text-[10px] font-bold text-slate-600 dark:text-slate-400 uppercase tracking-wider group-hover:bg-[#00A86B]/10 group-hover:border-[#00A86B]/20 transition-all duration-300">
              <Zap className="w-3.5 h-3.5 text-[#00A86B]" />
              {item.fuelTag}
            </span>
          )}

          {/* House-specific pills */}
          {item.zone === "house" && item.sqm && (
            <span className="inline-flex items-center gap-1 bg-slate-100 dark:bg-slate-800 border border-slate-200/50 dark:border-white/5 rounded-lg px-2.5 py-1.5 text-[10px] font-bold text-slate-600 dark:text-slate-400 uppercase tracking-wider group-hover:bg-[#00A86B]/10 group-hover:border-[#00A86B]/20 transition-all duration-300">
              <Ruler className="w-3.5 h-3.5 text-blue-500" />
              {item.sqm} SQM
            </span>
          )}
        </div>

        {/* Zone-Specific Data Rows */}
        {item.zone === "car" && (
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 mb-4">
            <div className="bg-slate-50 dark:bg-slate-950/50 rounded-xl p-2.5 border border-slate-100 dark:border-white/5 text-center group-hover:bg-[#00A86B]/5 group-hover:border-[#00A86B]/20 transition-all duration-300">
              <p className="text-[9px] text-slate-400 uppercase mb-0.5">{t("label.plateCode")}</p>
              <p className="text-xs font-extrabold text-slate-700 dark:text-slate-300">{item.plateCode}</p>
            </div>
            <div className="bg-slate-50 dark:bg-slate-950/50 rounded-xl p-2.5 border border-slate-100 dark:border-white/5 text-center group-hover:bg-[#00A86B]/5 group-hover:border-[#00A86B]/20 transition-all duration-300">
              <p className="text-[9px] text-slate-400 uppercase mb-0.5">{t("label.fuel")}</p>
              <p className="text-xs font-extrabold text-slate-700 dark:text-slate-300">{item.fuelType}</p>
            </div>
            <div className="bg-slate-50 dark:bg-slate-950/50 rounded-xl p-2.5 border border-slate-100 dark:border-white/5 text-center group-hover:bg-[#00A86B]/5 group-hover:border-[#00A86B]/20 transition-all duration-300">
              <p className="text-[9px] text-slate-400 uppercase mb-0.5">{t("label.condition")}</p>
              <p className="text-xs font-extrabold text-slate-700 dark:text-slate-300">{item.condition}</p>
            </div>
          </div>
        )}

        {item.zone === "house" && (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 mb-4">
            <div className="bg-slate-50 dark:bg-slate-950/50 rounded-xl p-2.5 border border-slate-100 dark:border-white/5 flex items-center gap-2 group-hover:bg-[#00A86B]/5 group-hover:border-[#00A86B]/20 transition-all duration-300">
              <Key className="w-4.5 h-4.5 text-amber-500" />
              <div>
                <p className="text-[9px] text-slate-400 uppercase">{t("label.titleDeed")}</p>
                <p className="text-xs font-extrabold text-slate-700 dark:text-slate-300 capitalize">{item.titleDeed}</p>
              </div>
            </div>
            <div className="bg-slate-50 dark:bg-slate-950/50 rounded-xl p-2.5 border border-slate-100 dark:border-white/5 flex items-center gap-2 group-hover:bg-[#00A86B]/5 group-hover:border-[#00A86B]/20 transition-all duration-300">
              <Ruler className="w-4.5 h-4.5 text-[#00A86B]" />
              <div>
                <p className="text-[9px] text-slate-400 uppercase">{t("label.sqm")}</p>
                <p className="text-xs font-extrabold text-slate-700 dark:text-slate-300">{item.sqm} Sqm</p>
              </div>
            </div>
            {item.bedrooms && (
              <div className="bg-slate-50 dark:bg-slate-950/50 rounded-xl p-2.5 border border-slate-100 dark:border-white/5 flex items-center gap-2 group-hover:bg-[#00A86B]/5 group-hover:border-[#00A86B]/20 transition-all duration-300">
                <Building2 className="w-4.5 h-4.5 text-blue-500" />
                <div>
                  <p className="text-[9px] text-slate-400 uppercase">{t("label.bedrooms")}</p>
                  <p className="text-xs font-extrabold text-slate-700 dark:text-slate-300">{item.bedrooms}</p>
                </div>
              </div>
            )}
            {item.bathrooms && (
              <div className="bg-slate-50 dark:bg-slate-950/50 rounded-xl p-2.5 border border-slate-100 dark:border-white/5 flex items-center gap-2 group-hover:bg-[#00A86B]/5 group-hover:border-[#00A86B]/20 transition-all duration-300">
                <CheckCircle2 className="w-4.5 h-4.5 text-[#00A86B]" />
                <div>
                  <p className="text-[9px] text-slate-400 uppercase">{t("label.bathrooms")}</p>
                  <p className="text-xs font-extrabold text-slate-700 dark:text-slate-300">{item.bathrooms}</p>
                </div>
              </div>
            )}
          </div>
        )}

        {item.zone === "fashion" && (
          <div className="mb-4">
            <div className="bg-slate-50 dark:bg-slate-950/50 rounded-xl p-2.5 border border-slate-100 dark:border-white/5 flex items-center gap-2 group-hover:bg-[#00A86B]/5 group-hover:border-[#00A86B]/20 transition-all duration-300">
              <Settings className="w-4.5 h-4.5 text-amber-500" />
              <div>
                <p className="text-[9px] text-slate-400 uppercase">{t("label.billing")}</p>
                <p className="text-xs font-extrabold text-slate-700 dark:text-slate-300">{item.billingTrack}</p>
              </div>
            </div>
          </div>
        )}

        {/* ── Price Block ── */}
        <div className="mt-auto">
          <div className="flex items-baseline justify-between mb-4">
            <div>
              <span className="text-2xl font-extrabold text-slate-900 dark:text-white group-hover:text-[#00A86B] transition-colors duration-300">
                {formatPrice(item.price)}
              </span>
              <span className="text-sm font-semibold text-slate-500 dark:text-slate-400 ml-1.5">
                {t(item.priceSuffixKey as any)}
              </span>
            </div>
            <span className="text-[10px] font-extrabold text-red-500 dark:text-red-400 uppercase tracking-wider">
              {t(item.priceTagKey as any)}
            </span>
          </div>

          {/* Contact Actions — Call / WhatsApp / Chat (third channel) */}
          <div className="flex items-center gap-2">
            <a
              href={`tel:${item.phone}`}
              onClick={(e) => e.stopPropagation()}
              className="flex-1 inline-flex items-center justify-center gap-1.5 bg-[#00A86B] hover:bg-emerald-600 text-white rounded-xl py-2.5 transition-all duration-300 group-hover:scale-[1.02] cursor-pointer"
            >
              <Phone className="w-3.5 h-3.5" />
              <span className="text-[10px] font-black uppercase tracking-wide">{t("cta.call")}</span>
            </a>
            <a
              href={`https://t.me/${item.whatsapp}`}
              target="_blank"
              rel="noopener noreferrer"
              onClick={(e) => e.stopPropagation()}
              className="flex-1 inline-flex items-center justify-center gap-1.5 bg-[#24A1DE] hover:bg-[#1c8ec7] text-white rounded-xl py-2.5 transition-all duration-300 group-hover:scale-[1.02] cursor-pointer"
            >
              <Send className="w-3.5 h-3.5 -ml-0.5" />
              <span className="text-[10px] font-black uppercase tracking-wide">{t("cta.telegram")}</span>
            </a>
            {isAuthenticated && item.sellerUserId && item.sellerUserId !== user?.id && (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  openChat(item.sellerUserId, item.sellerName || "Seller", Number(item.id));
                }}
                className="flex-1 inline-flex items-center justify-center gap-1.5 bg-[#0B132B] hover:bg-[#1a2340] text-white rounded-xl py-2.5 transition-all duration-300 group-hover:scale-[1.02] cursor-pointer"
              >
                <MessageCircle className="w-3.5 h-3.5" />
                <span className="text-[10px] font-black uppercase tracking-wide">{t("cta.chat")}</span>
              </button>
            )}
          </div>
        </div>
      </div>
    </article>
  );
};

/* ────────────────────────────────────────────
   Component
   ──────────────────────────────────────────── */
const ITEMS_PER_PAGE = 6;

const ZoneCatalogGrid: React.FC<ZoneCatalogGridProps> = ({
  activeCategory,
  activeZone,
  filters,
  onClearCityFilter,
  onClearFilter,
}) => {
  const { language, t } = useLanguage();
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const { trackEvent } = useSocketTracker();
  const { currentCity } = useCity();
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const { isFavorite, toggleFavorite } = useFavorites();
  const { openChat } = useChat();
  const [currentPage, setCurrentPage] = useState(1);
  const { ref: gridRef, isVisible: gridVisible } = useScrollReveal({ threshold: 0.1 });
  // City filtering applies ONLY when the visitor explicitly picked a city
  // (filter chip or the persisted selector). The context's built-in default
  // must not silently shrink national inventory to one prefix match.
  const explicitCityKey =
    filters.city ||
    (typeof window !== "undefined"
      ? window.localStorage.getItem("malazone_city") || undefined
      : undefined) ||
    undefined;
  // Category filtering happens SERVER-SIDE so every tile shows all its
  // products, not just those that happen to sit in the already-fetched pool.
  // Taxonomy facets (subcategory/brand/attr_*) are sent server-side too;
  // facetKey is the stable JSON identity used as the effect dependency.
  const facetParams = useMemo(() => {
    const out: Record<string, string> = {};
    if (filters.subcategory) out.subcategory = filters.subcategory;
    if (filters.brand) out.brand = filters.brand;
    // Stays occupancy — server-side because `capacity` is not part of the
    // client ListingItem shape, so a client-side pass cannot see it.
    if (filters.guests) out.guests_min = filters.guests;
    // Car facets the API already understands. The option values are verified
    // against the server allowlists in routes/listings.js (FUEL_TYPES), so
    // these narrow the pool before it is fetched instead of after.
    if (filters.fuelType) out.fuel_type = filters.fuelType;
    if (filters.verified) out.verified = "1";
    Object.keys(filters).forEach((k) => {
      if (k.startsWith("attr_")) {
        const v = filters[k];
        if (typeof v === "string" && v) out[k] = v;
      }
    });
    return out;
  }, [filters]);
  const facetKey = JSON.stringify(facetParams);
  const { revision } = useListingRevision();
  const { listings, loading, cityHadNoResults, total } = useListings(explicitCityKey, activeCategory, facetKey, facetParams, filters.city_subzone || "", revision, filters.intent);

  const requireAuth = useCallback((action: () => void) => {
    if (!isAuthenticated) {
      navigate("/signin");
      return;
    }
    action();
  }, [isAuthenticated, navigate]);

  useEffect(() => {
    setCurrentPage(1);
    setShowAll(false); // Reset showAll when filters change
  }, [activeCategory, activeZone, filters]);

  /* ── Filter Logic ── */
  const filtered = useMemo(() => {
    return listings.filter((item) => {
      // 1. Zone/Category Filter
      if (activeZone !== "all" && item.zone !== activeZone) return false;

      // 2. Keyword Search
      if (filters.search) {
        const s = filters.search.toLowerCase();
        const inTitleEn   = item.titleEn.toLowerCase().includes(s);
        const inTitleAm   = item.titleAm.toLowerCase().includes(s);
        const inDescEn    = item.descriptionEn?.toLowerCase().includes(s) ?? false;
        const inDescAm    = item.descriptionAm?.toLowerCase().includes(s) ?? false;
        const inLocation  = item.locationTag.toLowerCase().includes(s);
        const inLocKey    = item.locationKey.toLowerCase().includes(s);
        const inSeller    = item.sellerName?.toLowerCase().includes(s) ?? false;
        const inPlate     = item.plateCode?.toLowerCase().includes(s) ?? false;
        const inFuel      = item.fuelTag?.toLowerCase().includes(s) ?? false;
        const inCondition = item.condition?.toLowerCase().includes(s) ?? false;
        const inZone      = item.zone.toLowerCase().includes(s);
        const inPrice     = String(item.price).includes(s);
        if (
          !inTitleEn && !inTitleAm && !inDescEn && !inDescAm &&
          !inLocation && !inLocKey && !inSeller &&
          !inPlate && !inFuel && !inCondition && !inZone && !inPrice
        ) return false;
      }

      // 3. Region Filter
      if (filters.region && item.locationKey && !item.locationKey.toLowerCase().includes(filters.region.toLowerCase())) {
        // Simple mapping: sidama region includes hawassa, bensa, yirgalem, chuko, aleta
        const sidamaLocs = ["hawassa", "bensa", "yirgalem", "chuko", "aleta"];
        const isSidama = sidamaLocs.some(loc => item.locationKey.toLowerCase().includes(loc));
        if (filters.region === "sidama" && !isSidama) return false;
        if (filters.region === "addis" && !item.locationKey.toLowerCase().includes("addis")) return false;
      }

      // 3. City/Locality Filter — skipped when the hook already fell back to
      // the national inventory, otherwise it would strip the fallback rows.
      if (filters.city && !cityHadNoResults) {
        const c = filters.city.toLowerCase();
        const inTag = item.locationTag.toLowerCase().includes(c);
        const inKey = item.locationKey.toLowerCase().includes(c);
        if (!inTag && !inKey) return false;
      }

      // 3.1 City Sub-zone Filter (exact match on full location_key prefix)
      if (filters.city_subzone) {
        const sz = filters.city_subzone.toLowerCase();
        const inKeyExact = item.locationKey.toLowerCase() === sz;
        const inKeyStartsWith = item.locationKey.toLowerCase().startsWith(sz + "_");
        if (!inKeyExact && !item.locationKey.toLowerCase().includes(sz)) return false;
      }

      // 4. Intent Filter
      if (filters.intent) {
        if (filters.intent === "buy" && item.priceSuffixKey !== "price.etb") return false;
        if (filters.intent === "rent" && item.priceSuffixKey === "price.etb") return false;
        if (filters.intent === "hourly" && item.priceSuffixKey !== "price.hour") return false;
      }

      // 5. Car Specific Filters
      if (item.zone === "car") {
        if (filters.plateCode && item.plateCode && !item.plateCode.toLowerCase().replace(/\s/g, "").includes(filters.plateCode.toLowerCase())) return false;
        if (filters.fuelType && item.fuelTag && item.fuelTag.toLowerCase() !== filters.fuelType.toLowerCase()) return false;
        if (filters.condition && item.condition && !item.condition.toLowerCase().includes(filters.condition.toLowerCase())) return false;
      }

      // 6. House Specific Filters
      if (item.zone === "house") {
        if (filters.propertyType && item.propertyType && item.propertyType.toLowerCase() !== filters.propertyType.toLowerCase()) return false;
        if (filters.bedrooms && item.bedrooms !== undefined) {
          if (filters.bedrooms === "4+" && item.bedrooms < 4) return false;
          if (filters.bedrooms !== "4+" && item.bedrooms.toString() !== filters.bedrooms) return false;
        }
        if (filters.bathrooms && item.bathrooms !== undefined) {
          if (filters.bathrooms === "4+" && item.bathrooms < 4) return false;
          if (filters.bathrooms !== "4+" && item.bathrooms.toString() !== filters.bathrooms) return false;
        }
        if (filters.titleDeed && item.titleDeed && !item.titleDeed.toLowerCase().includes(filters.titleDeed.toLowerCase())) return false;
        if (filters.sqm) {
          const s = item.sqm || 0;
          if (filters.sqm === "small" && s >= 200) return false;
          if (filters.sqm === "medium" && (s < 200 || s > 500)) return false;
          if (filters.sqm === "large" && s <= 500) return false;
        }
      }

      // 7. Global advanced toggles
      if (filters.verified && !item.isVerified) return false;

      return true;
    });
    // NOTE: `listings` MUST be a dependency — without it the memo keeps the
    // previous category's pool after a fetch resolves and every subsequent
    // tile click renders an empty intersection ("No listings").
  }, [activeZone, filters, cityHadNoResults, listings]);

  /* The server's `total` is only a truthful description of the result set
   * while every active filter was sent to the API. These keys are still
   * applied in the browser against the fetched pool, so while any of them is
   * active the server total would over-report and we fall back to counting the
   * pool. Keep this list in sync with the client-side branches above. */
  const CLIENT_SIDE_FILTER_KEYS = [
    "search", "region", "bedrooms", "bathrooms",
    "propertyType", "titleDeed", "sqm", "plateCode", "condition",
  ] as const;
  const hasClientSideFilter = CLIENT_SIDE_FILTER_KEYS.some((k) => Boolean(filters[k]));
  const resultCount = total !== null && !hasClientSideFilter ? total : filtered.length;
  /** The API holds more matches than the single page we requested. */
  const poolIsTruncated = total !== null && listings.length > 0 && total > listings.length;

  // Reset to page 1 whenever filters/zone change
  const totalPages = Math.max(1, Math.ceil(filtered.length / ITEMS_PER_PAGE));
  const safePage = Math.min(currentPage, totalPages);
  
  // State to control "See All" mode
  const [showAll, setShowAll] = useState(false);
  const visibleListings = showAll 
    ? filtered 
    : filtered.slice((safePage - 1) * ITEMS_PER_PAGE, safePage * ITEMS_PER_PAGE);

  const goToPage = (page: number) => {
    if (page < 1 || page > totalPages) return;
    setCurrentPage(page);
    const el = document.getElementById("zone-catalog-section");
    if (el) el.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  const handleToggleFavorite = (item: ListingItem) => {
    if (!isAuthenticated) {
      navigate("/signin");
      return;
    }
    toggleFavorite(item);
  };

  const handleShare = async (item: ListingItem) => {
    const url = `${window.location.origin}/listing/${item.id}`;
    const title = language === 'amharic' ? item.titleAm : item.titleEn;
    if (navigator.share) {
      navigator.share({ title, url }).catch(() => { });
    } else {
      try {
        await navigator.clipboard.writeText(url);
        setCopiedId(item.id);
        setTimeout(() => setCopiedId(null), 2000);
      } catch (err) {
        console.error('Failed to copy link:', err);
      }
    }
  };

  return (
    <section
      id="zone-catalog-section"
      ref={gridRef}
      className={`flex-1 min-w-0 transition-all duration-700 ease-out ${gridVisible
          ? 'animate-fade-in-up opacity-100 translate-y-0'
          : 'opacity-0 translate-y-8'
        }`}
    >
      {/* ── Section Heading ── */}
      <div className="mb-8 flex items-start justify-between flex-col sm:flex-row gap-4">
        <div className="flex-1">
          <h2 className="text-3xl sm:text-4xl font-sans font-black text-slate-900 dark:text-white tracking-tight leading-snug transition-colors duration-300">
            {language === "amharic" ? (
              <>የተረጋገጡ የ <span className="text-[#00A86B] lowercase font-bold tracking-normal">malazone</span> ይፋዊ ማህደሮች</>
            ) : (
              <>Featured <span className="text-[#00A86B] font-black tracking-normal">Listings</span></>
            )}
          </h2>

          <div className="w-14 h-1 bg-[#00A86B] rounded-full mt-4 opacity-90 shadow-[0_2px_10px_rgba(0,168,107,0.3)]" />
        </div>

        {/* See All / Show Less Button */}
        {filtered.length > ITEMS_PER_PAGE && (
          <button
            onClick={() => {
              setShowAll(!showAll);
              if (!showAll) {
                const el = document.getElementById("zone-catalog-section");
                if (el) el.scrollIntoView({ behavior: "smooth", block: "start" });
              } else {
                setCurrentPage(1);
              }
            }}
            className="flex items-center gap-2 px-4 py-2 text-sm font-bold text-[#00A86B] hover:text-emerald-600 transition-colors group mt-2"
          >
            {/* "See All" can only mean "reveal everything I loaded" — say so
                when the API had more rows than we requested. */}
            <span>
              {showAll
                ? (language === "amharic" ? "አሳንስ" : "Show Less")
                : (language === "amharic" ? "ሁሉንም አሳይ" : "See All")}
            </span>
            <ArrowRight className={`w-4 h-4 transition-transform duration-300 ${showAll ? 'rotate-180' : 'group-hover:translate-x-1'}`} />
          </button>
        )}
        {poolIsTruncated && !showAll && (
          <p className="mt-2 text-xs text-slate-500 dark:text-slate-400">
            {language === "amharic"
              ? `የተጫኑቹ ውጤቶች ከ${listings.length}። ለሁሉንም ውጤቶች ያሳዩ።`
              : `Showing the first ${listings.length} of ${total} matches. Narrow your filters to see the rest.`}
          </p>
        )}
      </div>

      {/* ── Active Filter Indicators ── */}
      {(filters.city || filters.city_subzone || filters.region || filters.search) && (
        <div className="mb-6 flex flex-wrap items-center gap-2">
          <span className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mr-1">
            {language === "amharic" ? "የአወጣው ማጣሪያዎች:" : "Active Filters:"}
          </span>

          {filters.region && (
            <div className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-blue-50 dark:bg-blue-950/40 border border-blue-200 dark:border-blue-800/50 rounded-full text-xs font-bold text-blue-700 dark:text-blue-400 shadow-sm">
              <MapPin className="w-3 h-3" />
              <span>
                {filters.region === "sidama"
                  ? (language === "amharic" ? "ሲዳማ ክልል" : "Sidama Region")
                  : filters.region === "addis"
                    ? (language === "amharic" ? "አዲስ አበባ" : "Addis Ababa")
                    : filters.region}
              </span>
              <button
                onClick={() => onClearFilter ? onClearFilter("region") : (onClearCityFilter && onClearCityFilter())}
                className="ml-1 p-0.5 rounded-full hover:bg-blue-100 dark:hover:bg-blue-900/50 transition-colors"
                aria-label="Clear region filter"
              >
                <X className="w-3 h-3" />
              </button>
            </div>
          )}

          {filters.city && (
            <div className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800/50 rounded-full text-xs font-black text-emerald-700 dark:text-emerald-400 shadow-sm animate-pulse-slow">
              <MapPin className="w-3 h-3 fill-emerald-600 dark:fill-emerald-400" />
              <span className="capitalize">
                {filters.city === "hawassa" ? (language === "amharic" ? "ሐዋሳ" : "Hawassa")
                  : filters.city === "addis_ababa" ? (language === "amharic" ? "አዲስ አበባ" : "Addis Ababa")
                    : filters.city === "yirgalem" ? (language === "amharic" ? "ይርጋለም" : "Yirgalem")
                      : filters.city === "dilla" ? (language === "amharic" ? "ዲላ" : "Dilla")
                        : filters.city === "bensa" ? (language === "amharic" ? "በንሳ" : "Bensa")
                          : filters.city === "aleta_wondo" ? (language === "amharic" ? "አለታ ወንዶ" : "Aleta Wondo")
                            : filters.city === "chuko" ? (language === "amharic" ? "ቹኮ" : "Chuko")
                              : filters.city.replace(/_/g, " ")}
              </span>
              <span className="bg-emerald-600 dark:bg-emerald-500 text-white text-[9px] font-black px-1.5 py-0.5 rounded-full">
                {resultCount}
              </span>
              <button
                onClick={() => onClearFilter ? onClearFilter("city") : (onClearCityFilter && onClearCityFilter())}
                className="ml-1 p-0.5 rounded-full hover:bg-emerald-100 dark:hover:bg-emerald-900/50 transition-colors"
                aria-label="Clear city filter"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>
          )}

          {filters.city_subzone && (
            <div className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-teal-50 dark:bg-teal-950/40 border border-teal-200 dark:border-teal-800/50 rounded-full text-xs font-bold text-teal-700 dark:text-teal-400 shadow-sm">
              <MapPin className="w-3 h-3" />
              <span className="capitalize">
                {filters.city_subzone.includes("_")
                  ? filters.city_subzone.split("_").slice(1).join(" ").replace(/_/g, " ")
                  : filters.city_subzone}
              </span>
              <button
                onClick={() => onClearFilter && onClearFilter("city_subzone")}
                className="ml-1 p-0.5 rounded-full hover:bg-teal-100 dark:hover:bg-teal-900/50 transition-colors"
                aria-label="Clear subzone filter"
              >
                <X className="w-3 h-3" />
              </button>
            </div>
          )}

          {filters.search && (
            <div className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800/50 rounded-full text-xs font-bold text-amber-700 dark:text-amber-400 shadow-sm">
              <Search className="w-3 h-3" />
              <span className="max-w-[120px] truncate">"{filters.search}"</span>
              <button
                onClick={() => onClearFilter && onClearFilter("search")}
                className="ml-1 p-0.5 rounded-full hover:bg-amber-100 dark:hover:bg-amber-900/50 transition-colors"
                aria-label="Clear search filter"
              >
                <X className="w-3 h-3" />
              </button>
            </div>
          )}

          {(filters.city || filters.city_subzone || filters.region || filters.search) && (
            <button
              onClick={() => {
                if (onClearFilter) {
                  onClearFilter("region" as any);
                  onClearFilter("city" as any);
                  onClearFilter("city_subzone" as any);
                  onClearFilter("search" as any);
                } else if (onClearCityFilter) {
                  onClearCityFilter();
                }
              }}
              className="inline-flex items-center gap-1 px-3 py-1.5 bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-full text-xs font-bold text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors shadow-sm"
            >
              <RotateCcw className="w-3 h-3" />
              {language === "amharic" ? "ሁሉንም አጥፋ" : "Clear All"}
            </button>
          )}
        </div>
      )}

      {/* ── City Fallback Banner ── */}
      {cityHadNoResults && (
        <div className="mb-6 flex flex-wrap items-center gap-x-3 gap-y-2 rounded-2xl border border-amber-200 dark:border-amber-500/30 bg-amber-50 dark:bg-amber-500/10 px-4 py-3">
          <MapPin className="w-4 h-4 text-amber-600 dark:text-amber-400 shrink-0" />
          <p className="text-sm font-semibold text-amber-800 dark:text-amber-200">
            {language === "amharic"
              ? `በ${(explicitCityKey || "").replace(/_/g, " ")} ውስጥ የሚስማማ ዝርዝር አልተገኘም — የመላው ኢትዮጵያ ውጤቶች ይታያሉ።`
              : `No matching listings in ${(explicitCityKey || "").replace(/_/g, " ")} yet — showing results from all Ethiopia.`}
          </p>
          <button
            onClick={() => {
              try { localStorage.removeItem("malazone_city"); } catch { /* private mode */ }
              if (onClearFilter) onClearFilter("city");
              onClearCityFilter?.();
            }}
            className="ml-auto inline-flex items-center gap-1.5 rounded-full bg-white dark:bg-slate-900 border border-amber-300 dark:border-amber-500/40 px-3 py-1.5 text-xs font-black text-amber-800 dark:text-amber-200 hover:bg-amber-100 dark:hover:bg-amber-500/20 transition-colors shadow-sm"
          >
            <RotateCcw className="w-3 h-3" />
            {language === "amharic" ? "ከተማ ማጣሪያ አጥፋ" : "Clear city filter"}
          </button>
        </div>
      )}

      {/* ── Card Grid ── */}
      {filtered.length > 0 ? (
        <div className="grid grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-6">
          {visibleListings.map((item, index) => (
            <article
              key={item.id}
              onClick={() => { trackEvent('visit', item); navigate(`/listing/${item.id}`); }}
              style={{
                animationDelay: `${index * 0.1}s`,
                opacity: gridVisible ? 1 : 0,
                transform: gridVisible ? 'translateY(0)' : 'translateY(20px)',
                transition: `opacity 0.5s ease-out ${index * 0.1}s, transform 0.5s ease-out ${index * 0.1}s`
              }}
              className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-white/5 rounded-2xl overflow-hidden group hover:border-[#00A86B]/30 hover:bg-slate-50 dark:hover:bg-slate-900/60 hover:-translate-y-3 hover:scale-[1.02] hover:shadow-[0_24px_48px_rgba(0,168,107,0.15)] shadow-md flex flex-col relative transition-all duration-500 cursor-pointer"
            >
              {/* ── Image Container ── */}
              <div className="relative h-48 sm:h-72 overflow-hidden">
                <img
                  src={item.image}
                  alt={language === "amharic" ? item.titleAm : item.titleEn}
                  loading="lazy"
                  crossOrigin="anonymous"
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />

                {/* View Details Button - Always Visible on Mobile, Hover on Desktop */}
                <div className="absolute inset-0 flex items-center justify-center sm:opacity-0 sm:group-hover:opacity-100 transition-opacity duration-300 sm:bg-black/30">
                  <button
                    onClick={(e) => { e.stopPropagation(); trackEvent('visit', item); navigate(`/listing/${item.id}`); }}
                    className="flex items-center gap-2 px-3 sm:px-6 py-2 sm:py-3 bg-white/95 dark:bg-slate-900/95 rounded-xl text-[11px] sm:text-sm font-black text-slate-900 dark:text-white hover:bg-[#00A86B] hover:text-white shadow-2xl transform hover:scale-105 active:scale-95 transition-all duration-300 border-2 border-white/20 backdrop-blur-md"
                  >
                    <ArrowRight className="w-4 h-4 sm:w-5 sm:h-5" />
                    <span>{language === "amharic" ? "ዝርዝር" : "View Details"}</span>
                  </button>
                </div>

                {/* Image Count Badge */}
                {item.images && item.images.length > 1 && (
                  <div className="absolute bottom-3 left-3 flex items-center gap-1 bg-black/50 backdrop-blur-sm border border-white/20 rounded-lg px-2 py-1">
                    <Image className="w-3 h-3 text-white" />
                    <span className="text-[11px] font-semibold text-white">{item.images.length}</span>
                  </div>
                )}

                {/* Glassmorphic Status Badge */}
                <div className="absolute top-3 left-3 flex items-center gap-1.5 bg-white/20 dark:bg-black/30 backdrop-blur-md border border-white/20 rounded-lg px-2.5 py-1.5">
                  <span className="w-2 h-2 rounded-full bg-[#00A86B] animate-pulse" />
                  <CheckCircle2 className="w-3 h-3 text-white" />
                  <span className="text-[11px] font-semibold text-white tracking-wide">
                    {t(item.badgeKey as any)}
                  </span>
                </div>

                {/* Action Buttons: Premium Star, Favorite */}
                <div className="absolute top-3 right-3 flex flex-col gap-1.5">
                  {item.isPremium && (
                    <div className="w-8 h-8 rounded-lg bg-amber-500 flex items-center justify-center shadow-lg">
                      <Sparkles className="w-4 h-4 text-white" />
                    </div>
                  )}
                  <button
                    onClick={(e) => { e.stopPropagation(); handleToggleFavorite(item); }}
                    className="w-8 h-8 rounded-full bg-white/90 dark:bg-slate-900/90 backdrop-blur-sm flex items-center justify-center shadow-lg hover:scale-110 transition-all duration-300"
                    aria-label={isFavorite(item.id) ? "Remove from favorites" : "Add to favorites"}
                  >
                    <Heart className={`w-4 h-4 ${isFavorite(item.id) ? 'fill-red-500 text-red-500' : 'text-slate-600 dark:text-slate-300'}`} />
                  </button>
                </div>
              </div>

              {/* ── Card Body ── */}
              <div className="p-3 sm:p-5 flex flex-col flex-grow">
                {/* Star Rating */}
                <div className="mb-2 sm:mb-2.5 flex items-center gap-1.5">
                  <StarRating rating={item.rating} />
                  {item.reviewCount ? (
                    <span className="text-[10px] text-slate-400 dark:text-slate-500 font-medium">({item.reviewCount})</span>
                  ) : null}
                </div>

                {/* Title */}
                <h3 className="text-sm sm:text-base font-bold text-slate-900 dark:text-white leading-snug mb-2 sm:mb-3 line-clamp-2 group-hover:text-[#00A86B] transition-colors font-sans tracking-wide">
                  {language === "amharic" ? item.titleAm : item.titleEn}
                </h3>

                {/* Info Micro-Pills */}
                <div className="flex flex-wrap gap-1 sm:gap-1.5 mb-3 sm:mb-4">
                  {/* Location pill */}
                  <span className="inline-flex items-center gap-1 bg-slate-100 dark:bg-slate-800 border border-slate-200/50 dark:border-white/5 rounded-md px-2 py-1 text-[10px] font-bold text-slate-600 dark:text-slate-400 uppercase tracking-wider">
                    <MapPin className="w-3 h-3 text-red-500" />
                    {item.locationTag}
                  </span>

                  {/* Car-specific pills */}
                  {item.zone === "car" && item.plateCode && (
                    <span className="inline-flex items-center gap-1 bg-slate-100 dark:bg-slate-800 border border-slate-200/50 dark:border-white/5 rounded-md px-2 py-1 text-[10px] font-bold text-slate-600 dark:text-slate-400 uppercase tracking-wider">
                      <FileText className="w-3 h-3 text-amber-500" />
                      {item.plateCode}
                    </span>
                  )}
                  {item.zone === "car" && item.fuelTag && (
                    <span className="inline-flex items-center gap-1 bg-slate-100 dark:bg-slate-800 border border-slate-200/50 dark:border-white/5 rounded-md px-2 py-1 text-[10px] font-bold text-slate-600 dark:text-slate-400 uppercase tracking-wider">
                      <Zap className="w-3 h-3 text-[#00A86B]" />
                      {item.fuelTag}
                    </span>
                  )}

                  {/* House-specific pills */}
                  {item.zone === "house" && item.sqm && (
                    <span className="inline-flex items-center gap-1 bg-slate-100 dark:bg-slate-800 border border-slate-200/50 dark:border-white/5 rounded-md px-2 py-1 text-[10px] font-bold text-slate-600 dark:text-slate-400 uppercase tracking-wider">
                      <Ruler className="w-3 h-3 text-blue-500" />
                      {item.sqm} SQM
                    </span>
                  )}
                </div>

                {/* Zone-Specific Data Rows - Hidden on mobile for cleaner look */}
                {item.zone === "car" && (
                  <div className="hidden sm:grid grid-cols-1 sm:grid-cols-3 gap-2 mb-4">
                    <div className="bg-slate-50 dark:bg-slate-950/50 rounded-lg p-2 border border-slate-100 dark:border-white/5 text-center">
                      <p className="text-[9px] text-slate-400 uppercase mb-0.5">{t("label.plateCode")}</p>
                      <p className="text-xs font-bold text-slate-700 dark:text-slate-300">{item.plateCode}</p>
                    </div>
                    <div className="bg-slate-50 dark:bg-slate-950/50 rounded-lg p-2 border border-slate-100 dark:border-white/5 text-center">
                      <p className="text-[9px] text-slate-400 uppercase mb-0.5">{t("label.fuel")}</p>
                      <p className="text-xs font-bold text-slate-700 dark:text-slate-300">{item.fuelType}</p>
                    </div>
                    <div className="bg-slate-50 dark:bg-slate-950/50 rounded-lg p-2 border border-slate-100 dark:border-white/5 text-center">
                      <p className="text-[9px] text-slate-400 uppercase mb-0.5">{t("label.condition")}</p>
                      <p className="text-xs font-bold text-slate-700 dark:text-slate-300">{item.condition}</p>
                    </div>
                  </div>
                )}

                {item.zone === "house" && (
                  <div className="hidden sm:grid grid-cols-1 sm:grid-cols-2 gap-2 mb-4">
                    <div className="bg-slate-50 dark:bg-slate-950/50 rounded-lg p-2.5 border border-slate-100 dark:border-white/5 flex items-center gap-2">
                      <Key className="w-4 h-4 text-amber-500" />
                      <div>
                        <p className="text-[9px] text-slate-400 uppercase">{t("label.titleDeed")}</p>
                        <p className="text-xs font-bold text-slate-700 dark:text-slate-300 capitalize">{item.titleDeed}</p>
                      </div>
                    </div>
                    <div className="bg-slate-50 dark:bg-slate-950/50 rounded-lg p-2.5 border border-slate-100 dark:border-white/5 flex items-center gap-2">
                      <Ruler className="w-4 h-4 text-[#00A86B]" />
                      <div>
                        <p className="text-[9px] text-slate-400 uppercase">{t("label.sqm")}</p>
                        <p className="text-xs font-bold text-slate-700 dark:text-slate-300">{item.sqm} Sqm</p>
                      </div>
                    </div>
                    {item.bedrooms && (
                      <div className="bg-slate-50 dark:bg-slate-950/50 rounded-lg p-2.5 border border-slate-100 dark:border-white/5 flex items-center gap-2">
                        <Building2 className="w-4 h-4 text-blue-500" />
                        <div>
                          <p className="text-[9px] text-slate-400 uppercase">Bedrooms</p>
                          <p className="text-xs font-bold text-slate-700 dark:text-slate-300">{item.bedrooms}</p>
                        </div>
                      </div>
                    )}
                    {item.bathrooms && (
                      <div className="bg-slate-50 dark:bg-slate-950/50 rounded-lg p-2.5 border border-slate-100 dark:border-white/5 flex items-center gap-2">
                        <CheckCircle2 className="w-4 h-4 text-[#00A86B]" />
                        <div>
                          <p className="text-[9px] text-slate-400 uppercase">Bathrooms</p>
                          <p className="text-xs font-bold text-slate-700 dark:text-slate-300">{item.bathrooms}</p>
                        </div>
                      </div>
                    )}
                  </div>
                )}

                {item.zone === "fashion" && (
                  <div className="mb-4">
                    <div className="bg-slate-50 dark:bg-slate-950/50 rounded-lg p-2.5 border border-slate-100 dark:border-white/5 flex items-center gap-2">
                      <Settings className="w-4 h-4 text-amber-500" />
                      <div>
                        <p className="text-[9px] text-slate-400 uppercase">{t("label.billing")}</p>
                        <p className="text-xs font-bold text-slate-700 dark:text-slate-300">{item.billingTrack}</p>
                      </div>
                    </div>
                  </div>
                )}

                {/* ── Price Block ── */}
                <div className="mt-auto pt-2.5 sm:pt-3 border-t border-slate-100 dark:border-white/5">
                  <div className="flex items-baseline justify-between">
                    <div className="flex items-baseline gap-1 min-w-0">
                      <span className="text-base sm:text-2xl font-extrabold text-slate-900 dark:text-white">
                        {formatPrice(item.price)}
                      </span>
                      <span className="text-[11px] sm:text-sm font-medium text-slate-500 dark:text-slate-400">
                        {t(item.priceSuffixKey as any)}
                      </span>
                    </div>
                    <span className="text-[9px] sm:text-[10px] font-bold text-red-500 dark:text-red-400 uppercase tracking-wider shrink-0 ml-1">
                      {t(item.priceTagKey as any)}
                    </span>
                  </div>
                </div>
              </div>
            </article>
          ))}
        </div>
      ) : (
        /* ── Empty State ── */
        <div className="text-center py-20 bg-slate-50 dark:bg-slate-900/50 border border-slate-200/80 dark:border-white/5 rounded-2xl">
          <p className="text-slate-400 text-lg">{t("grid.empty")}</p>
        </div>
      )}

      {/* ── Numbered Pagination ── */}
      {!showAll && totalPages > 1 && (
        <div className="flex items-center justify-center gap-1.5 mt-10 w-full overflow-hidden">
          {/* Prev */}
          <button
            onClick={() => goToPage(safePage - 1)}
            disabled={safePage === 1}
            className="flex items-center gap-0.5 px-3 py-2 rounded-xl border border-slate-200 dark:border-white/10 bg-white dark:bg-slate-900 text-[11px] font-black uppercase tracking-wider text-slate-700 dark:text-slate-300 hover:border-[#00A86B] hover:text-[#00A86B] transition-all disabled:opacity-30 disabled:cursor-not-allowed shrink-0"
          >
            <ChevronLeft className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">{language === "amharic" ? "የቀደመ" : "Prev"}</span>
          </button>

          {/* Page Numbers — smart windowing: show max 5 pages around current */}
          {(() => {
            const window = 2;
            let start = Math.max(1, safePage - window);
            let end   = Math.min(totalPages, safePage + window);
            // Shift window so we always show 5 if possible
            if (end - start < 4) {
              if (start === 1) end = Math.min(totalPages, start + 4);
              else start = Math.max(1, end - 4);
            }
            const pages: (number | "…")[] = [];
            if (start > 1)          { pages.push(1); if (start > 2) pages.push("…"); }
            for (let p = start; p <= end; p++) pages.push(p);
            if (end < totalPages)   { if (end < totalPages - 1) pages.push("…"); pages.push(totalPages); }
            return pages.map((page, idx) =>
              page === "…" ? (
                <span key={`ellipsis-${idx}`} className="w-7 text-center text-slate-400 text-sm select-none">…</span>
              ) : (
                <button
                  key={page}
                  onClick={() => goToPage(page as number)}
                  className={`w-9 h-9 rounded-xl border text-sm font-black transition-all shrink-0 ${
                    page === safePage
                      ? "bg-[#00A86B] border-[#00A86B] text-white shadow-[0_4px_12px_rgba(0,168,107,0.35)] scale-105"
                      : "bg-white dark:bg-slate-900 border-slate-200 dark:border-white/10 text-slate-700 dark:text-slate-300 hover:border-[#00A86B] hover:text-[#00A86B]"
                  }`}
                >
                  {page}
                </button>
              )
            );
          })()}

          {/* Next */}
          <button
            onClick={() => goToPage(safePage + 1)}
            disabled={safePage === totalPages}
            className="flex items-center gap-0.5 px-3 py-2 rounded-xl border border-slate-200 dark:border-white/10 bg-white dark:bg-slate-900 text-[11px] font-black uppercase tracking-wider text-slate-700 dark:text-slate-300 hover:border-[#00A86B] hover:text-[#00A86B] transition-all disabled:opacity-30 disabled:cursor-not-allowed shrink-0"
          >
            <span className="hidden sm:inline">{language === "amharic" ? "ቀጣዩ" : "Next"}</span>
            <ChevronRight className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

    </section>
  );
};

export default ZoneCatalogGrid;
