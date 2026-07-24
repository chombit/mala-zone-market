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
  Heart,
  Share2,
  Check,
  MessageCircle,
  Image,
} from "lucide-react";
import { useLanguage } from "@/contexts/ZoneLanguageContext";
import { useAuth } from "@/contexts/AuthContext";
import { useChat } from "@/contexts/ChatContext";
import { useCity } from "@/contexts/CityContext";
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
  plateCode?: string;
  fuelType?: string;
  fuelTag?: string;
  condition?: string;
  /* House-specific */
  titleDeed?: string;
  sqm?: number;
  bedrooms?: number;
  bathrooms?: number;
  /* Machinery-specific */
  billingTrack?: string;
  specLabel?: string;
  specVal?: string;
  phone: string;
  whatsapp: string;
  sellerUserId?: number;
  sellerName?: string;
}

/* ────────────────────────────────────────────
   Mock Inventory Data (Fallback)
   ──────────────────────────────────────────── */
export const FALLBACK_LISTINGS: ListingItem[] = [
  { id: "37", titleEn: "3 Bedroom House in Tabor", titleAm: "3 መኝታ ክፍል ቤት በታቦር", price: 4500000, priceSuffixKey: "price.etb", priceTagKey: "price.fixed", image: "https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=800&q=80&fm=webp", images: ["https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=800&q=80&fm=webp", "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=800&q=80&fm=webp", "https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?w=800&q=80&fm=webp"], zone: "house", locationKey: "hawassa", locationTag: "TABOR", rating: 4, reviewCount: 13, isVerified: true, isPremium: true, badgeKey: "badge.verifiedCarta", titleDeed: "yes", sqm: 180, bedrooms: 3, bathrooms: 2, phone: "+251911223344", whatsapp: "+251911223344", descriptionEn: "Spacious 3-bedroom house in Tabor, Hawassa.", descriptionAm: "በሐዋሳ ታቦር ውስጥ ሰፊ 3 መኝታ ክፍል ቤት።", sellerUserId: 6, sellerName: "Solomon Birhanu" },
  { id: "38", titleEn: "Lakefront 2BR Apartment — Furnished", titleAm: "2 መኝታ ክፍል አፓርታማ በሐይቅ ጫፍ — የተቀመጠ", price: 18000, priceSuffixKey: "price.month", priceTagKey: "price.negotiable", image: "https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?w=800&q=80&fm=webp", images: ["https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?w=800&q=80&fm=webp", "https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?w=800&q=80&fm=webp", "https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=800&q=80&fm=webp", "https://images.unsplash.com/photo-1493809842364-78817add7ffb?w=800&q=80&fm=webp"], zone: "house", locationKey: "hawassa", locationTag: "LAKEFRONT", rating: 4.2, reviewCount: 11, isVerified: true, isPremium: false, badgeKey: "badge.verified", titleDeed: "yes", sqm: 95, bedrooms: 2, bathrooms: 1, phone: "+251911223355", whatsapp: "+251911223355", descriptionEn: "Fully furnished 2-bedroom apartment overlooking Lake Hawassa.", descriptionAm: "በሐዋሳ ሐይቅ ገጽታ የሚያይ ሙሉ በሙሉ የተቀመጠ 2 መኝታ ክፍል አፓርታማ።", sellerUserId: 15, sellerName: "solomon birhanu buche" },
  { id: "39", titleEn: "New 4-Bedroom Villa in Piassa", titleAm: "አዲስ 4 መኝታ ክፍል ቪላ በፒያሳ", price: 7800000, priceSuffixKey: "price.etb", priceTagKey: "price.fixed", image: "https://images.unsplash.com/photo-1613490493576-7fde63acd811?w=800&q=80&fm=webp", images: ["https://images.unsplash.com/photo-1613490493576-7fde63acd811?w=800&q=80&fm=webp", "https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=800&q=80&fm=webp", "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=800&q=80&fm=webp"], zone: "house", locationKey: "hawassa", locationTag: "PIASSA", rating: 4.4, reviewCount: 11, isVerified: true, isPremium: true, badgeKey: "badge.verifiedCarta", titleDeed: "yes", sqm: 280, bedrooms: 4, bathrooms: 3, phone: "+251911223377", whatsapp: "+251911223377", descriptionEn: "Brand new 4-bedroom villa with servant quarter.", descriptionAm: "አዲስ 4 መኝታ ክፍል ቪላ ከአገልግሎት ክፍል ጋር።", sellerUserId: 22, sellerName: "Muluken Melese" },
  { id: "40", titleEn: "Shop Space for Rent — Hawassa Center", titleAm: "የሱপ ቦታ በኪራይ — ሀዋሳ ማዕከል", price: 8000, priceSuffixKey: "price.month", priceTagKey: "price.negotiable", image: "https://images.unsplash.com/photo-1560518883-ce09059eeffa?w=800&q=80&fm=webp", zone: "house", locationKey: "hawassa", locationTag: "PIASSA", rating: 4.1, reviewCount: 8, isVerified: true, isPremium: false, badgeKey: "badge.verified", sqm: 30, phone: "+251911223399", whatsapp: "+251911223399", descriptionEn: "Ground-floor commercial space in central Hawassa.", descriptionAm: "በሀዋሳ ማዕከል ውስጥ የምድር ፊት የንግድ ቦታ።", sellerUserId: 26, sellerName: "Biniam" },
  { id: "41", titleEn: "Vacation House near Lake Langano", titleAm: "የማረፊያ ቤት በላንጋኖ ሐይቅ አቅራቢያ", price: 3200000, priceSuffixKey: "price.etb", priceTagKey: "price.negotiable", image: "https://images.unsplash.com/photo-1564013799919-ab600027ffc6?w=800&q=80&fm=webp", images: ["https://images.unsplash.com/photo-1564013799919-ab600027ffc6?w=800&q=80&fm=webp", "https://images.unsplash.com/photo-1600607687644-aac4c3eac7f4?w=800&q=80&fm=webp"], zone: "house", locationKey: "yirgalem", locationTag: "LANGANO", rating: 4.3, reviewCount: 11, isVerified: false, isPremium: false, badgeKey: "badge.verified", titleDeed: "yes", sqm: 120, bedrooms: 2, bathrooms: 1, phone: "+251911223400", whatsapp: "+251911223400", descriptionEn: "2-bedroom vacation home with lake view.", descriptionAm: "የሐይቅ ገጽታ ያለው 2 መኝታ ክፍል ማረፊያ ቤት።", sellerUserId: 27, sellerName: "Mulatu" },
  { id: "42", titleEn: "2019 Toyota Corolla — Single Owner", titleAm: "2019 ቶዮታ ኮሮላ — አንድ ባለቤት", price: 1200000, priceSuffixKey: "price.etb", priceTagKey: "price.fixed", image: "https://images.unsplash.com/photo-1549317661-bd32c8ce0db2?w=800&q=80&fm=webp", images: ["https://images.unsplash.com/photo-1549317661-bd32c8ce0db2?w=800&q=80&fm=webp", "https://images.unsplash.com/photo-1552519507-da3b142c6e3d?w=800&q=80&fm=webp", "https://images.unsplash.com/photo-1503376780353-7e6692767b70?w=800&q=80&fm=webp", "https://images.unsplash.com/photo-1580273916550-e323be2ae537?w=800&q=80&fm=webp"], zone: "car", locationKey: "hawassa", locationTag: "TABOR", rating: 4, reviewCount: 13, isVerified: true, isPremium: true, badgeKey: "badge.verifiedCarta", plateCode: "A1234", fuelType: "benzine", fuelTag: "BENZINE", condition: "used", phone: "+251911223344", whatsapp: "+251911223344", descriptionEn: "Well-maintained 2019 Toyota Corolla. Single owner, 45,000 km.", descriptionAm: "በጠበቀ ሁኔታ የተጠበቀ 2019 ቶዮታ ኮሮላ።", sellerUserId: 6, sellerName: "Solomon Birhanu" },
  { id: "43", titleEn: "2022 Honda CB500 Motorcycle", titleAm: "2022 ሆንዳ CB500 ሞተር ሳይክል", price: 320000, priceSuffixKey: "price.etb", priceTagKey: "price.negotiable", image: "https://images.unsplash.com/photo-1558981806-ec527fa84c39?w=800&q=80&fm=webp", images: ["https://images.unsplash.com/photo-1558981806-ec527fa84c39?w=800&q=80&fm=webp", "https://images.unsplash.com/photo-1558981403-c5f9899a28bc?w=800&q=80&fm=webp"], zone: "car", locationKey: "hawassa", locationTag: "PIASSA", rating: 4, reviewCount: 12, isVerified: true, isPremium: false, badgeKey: "badge.verified", plateCode: "B5678", fuelType: "benzine", fuelTag: "BENZINE", condition: "used", phone: "+251911223388", whatsapp: "+251911223388", descriptionEn: "Low-mileage Honda CB500F. 8,000 km, always garaged.", descriptionAm: "ዝቅተኛ ርቀት ያለው ሆንዳ CB500F።", sellerUserId: 24, sellerName: "Ashenafi Haile" },
  { id: "44", titleEn: "2021 Hyundai Tucson — Full Options", titleAm: "2021 ሀይንዳይ ቱሰን — ሙሉ አማራጮች", price: 2800000, priceSuffixKey: "price.etb", priceTagKey: "price.fixed", image: "https://images.unsplash.com/photo-1633477189729-9290b3261d0a?w=800&q=80&fm=webp", zone: "car", locationKey: "addis_ababa", locationTag: "ADDIS ABABA", rating: 4.5, reviewCount: 10, isVerified: true, isPremium: true, badgeKey: "badge.verifiedCarta", plateCode: "C9012", fuelType: "benzine", fuelTag: "BENZINE", condition: "used", phone: "+251911223366", whatsapp: "+251911223366", descriptionEn: "2021 Hyundai Tucson Premium. AWD, panoramic sunroof.", descriptionAm: "2021 ሀይንዳይ ቱሰን ፕሪሚየም።", sellerUserId: 19, sellerName: "Ada" },
  { id: "45", titleEn: "Electric Motorbike — E-Lion", titleAm: "ኤሌክትሪክ ሞተር ሳይክል — E-Lion", price: 85000, priceSuffixKey: "price.etb", priceTagKey: "price.negotiable", image: "https://images.unsplash.com/photo-1558981403-c5f9899a28bc?w=800&q=80&fm=webp", zone: "car", locationKey: "hawassa", locationTag: "LAKEFRONT", rating: 4.1, reviewCount: 8, isVerified: true, isPremium: false, badgeKey: "badge.verified", fuelType: "electric", fuelTag: "ELECTRIC", condition: "new", phone: "+251911223399", whatsapp: "+251911223399", descriptionEn: "Brand new E-Lion electric motorbike. 80km range.", descriptionAm: "አዲስ E-Lion ኤሌክትሪክ ሞተር ሳይክል።", sellerUserId: 26, sellerName: "Biniam" },
  { id: "46", titleEn: "2020 Toyota Hilux Double Cabin", titleAm: "2020 ቶዮታ ሂሉክስ ድብል ኪ臖ን", price: 3500000, priceSuffixKey: "price.etb", priceTagKey: "price.negotiable", image: "https://images.unsplash.com/photo-1559416523-140ddc3d238c?w=800&q=80&fm=webp", zone: "car", locationKey: "aleta_wondo", locationTag: "ALETA WONDO", rating: 4, reviewCount: 11, isVerified: true, isPremium: false, badgeKey: "badge.verified", plateCode: "D3456", fuelType: "diesel", fuelTag: "DIESEL", condition: "used", phone: "+251911223377", whatsapp: "+251911223377", descriptionEn: "Toyota Hilux 2020, diesel, 4WD, used for light duty only.", descriptionAm: "ቶዮታ ሂሉክስ 2020፣ ዴዘል፣ 4WD።", sellerUserId: 22, sellerName: "Muluken Melese" },
  { id: "47", titleEn: "Hawassa Lakeview Hotel — Standard Room", titleAm: "ሐዋሳ የሐይቅ ገጽታ ሆቴል — መደበኛ ክፍል", price: 2500, priceSuffixKey: "price.day", priceTagKey: "price.fixed", image: "https://images.unsplash.com/photo-1631049307264-da0ec9d70304?w=800&q=80&fm=webp", images: ["https://images.unsplash.com/photo-1631049307264-da0ec9d70304?w=800&q=80&fm=webp", "https://images.unsplash.com/photo-1590490360182-c33d57733427?w=800&q=80&fm=webp", "https://images.unsplash.com/photo-1584132967334-10e028bd69f7?w=800&q=80&fm=webp"], zone: "ceremony", locationKey: "hawassa", locationTag: "LAKEFRONT", rating: 4, reviewCount: 11, isVerified: true, isPremium: true, badgeKey: "badge.verifiedCarta", phone: "+251911223355", whatsapp: "+251911223355", descriptionEn: "Standard hotel room with lake view. Free Wi-Fi, breakfast included.", descriptionAm: "የሐይቅ ገጽታ ያለው መደበኛ የሆቴል ክፍል።", sellerUserId: 15, sellerName: "solomon birhanu buche" },
  { id: "48", titleEn: "Lakefront Airbnb Studio", titleAm: "የሐይቅ ጫፍ ኤርቢኤንቢ ስቱዲዮ", price: 3500, priceSuffixKey: "price.day", priceTagKey: "price.negotiable", image: "https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?w=800&q=80&fm=webp", zone: "ceremony", locationKey: "hawassa", locationTag: "LAKEFRONT", rating: 4, reviewCount: 12, isVerified: true, isPremium: false, badgeKey: "badge.verified", phone: "+251911223388", whatsapp: "+251911223388", descriptionEn: "Cozy self-contained studio apartment. Kitchen, balcony.", descriptionAm: "ቀላል ራስን የሚያስተዳድር ስቱዲዮ አፓርታማ።", sellerUserId: 24, sellerName: "Ashenafi Haile" },
  { id: "49", titleEn: "Haile Resort — Deluxe Room", titleAm: "ሀይሌ ሪዞርት — ዴሉክስ ክፍል", price: 4500, priceSuffixKey: "price.day", priceTagKey: "price.fixed", image: "https://images.unsplash.com/photo-1551882547-ff40c63fe5fa?w=800&q=80&fm=webp", images: ["https://images.unsplash.com/photo-1551882547-ff40c63fe5fa?w=800&q=80&fm=webp", "https://images.unsplash.com/photo-1571896349842-33c89424de2d?w=800&q=80&fm=webp"], zone: "ceremony", locationKey: "hawassa", locationTag: "LAKEFRONT", rating: 4.4, reviewCount: 11, isVerified: true, isPremium: true, badgeKey: "badge.verifiedCarta", phone: "+251911223400", whatsapp: "+251911223400", descriptionEn: "Premium lakefront resort room. Pool access, restaurant, spa.", descriptionAm: "ፕሪሚየም የሐይቅ ጫፍ ሪዞርት ክፍል።", sellerUserId: 27, sellerName: "Mulatu" },
  { id: "50", titleEn: "Budget Guest House — Tabor", titleAm: "ምንጭ ያለው የእንግዳ ቤት — ታቦር", price: 1200, priceSuffixKey: "price.day", priceTagKey: "price.negotiable", image: "https://images.unsplash.com/photo-1587381420270-3e1a5b9e6904?w=800&q=80&fm=webp", zone: "ceremony", locationKey: "hawassa", locationTag: "TABOR", rating: 4.5, reviewCount: 10, isVerified: false, isPremium: false, badgeKey: "badge.verified", phone: "+251911223366", whatsapp: "+251911223366", descriptionEn: "Clean, affordable guesthouse in Tabor.", descriptionAm: "በታቦር ውስጥ ን끗 ያለ ምንጭ ያለው የእንግዳ ቤት።", sellerUserId: 19, sellerName: "Ada" },
  { id: "51", titleEn: "Lake Langano Resort — Family Suite", titleAm: "የሐይቅ ሪዞርት — ስንቅ ክፍል", price: 6000, priceSuffixKey: "price.day", priceTagKey: "price.fixed", image: "https://images.unsplash.com/photo-1566073771259-6a8506099945?w=800&q=80&fm=webp", zone: "ceremony", locationKey: "yirgalem", locationTag: "LANGANO", rating: 3.9, reviewCount: 13, isVerified: true, isPremium: true, badgeKey: "badge.verifiedCarta", phone: "+251911223344", whatsapp: "+251911223344", descriptionEn: "Spacious family suite at Lake Langano resort.", descriptionAm: "በላንጋኖ ሪዞርት ውስጥ ሰፊ ስንቅ ክፍል።", sellerUserId: 6, sellerName: "Solomon Birhanu" },
  { id: "52", titleEn: "Wedding Catering — Full Service", titleAm: "የሰርግ ማቅያ — ሙሉ አገልግሎት", price: 2500, priceSuffixKey: "price.day", priceTagKey: "price.fixed", image: "https://images.unsplash.com/photo-1555244162-803834f70033?w=800&q=80&fm=webp", zone: "ceremony", locationKey: "hawassa", locationTag: "TABOR", rating: 4, reviewCount: 11, isVerified: true, isPremium: true, badgeKey: "badge.verifiedCarta", phone: "+251911223377", whatsapp: "+251911223377", descriptionEn: "Professional wedding catering for up to 500 guests.", descriptionAm: "ለ500 እንግዶች ሰርግ ማቅያ አገልግሎት።", sellerUserId: 22, sellerName: "Muluken Melese" },
  { id: "53", titleEn: "DJ & Sound System — Events", titleAm: "ዲเจ እና ድምጽ ስስተም — ዝግጅቶች", price: 8000, priceSuffixKey: "price.etb", priceTagKey: "price.negotiable", image: "https://images.unsplash.com/photo-1470225620780-dba8ba36b745?w=800&q=80&fm=webp", images: ["https://images.unsplash.com/photo-1470225620780-dba8ba36b745?w=800&q=80&fm=webp", "https://images.unsplash.com/photo-1571330735066-03aaa9429d89?w=800&q=80&fm=webp"], zone: "ceremony", locationKey: "hawassa", locationTag: "PIASSA", rating: 4.1, reviewCount: 8, isVerified: true, isPremium: false, badgeKey: "badge.verified", phone: "+251911223399", whatsapp: "+251911223399", descriptionEn: "Professional DJ with full sound system for events.", descriptionAm: "ለሰርግ፣ ልደት እና ዝግጅቶች ፕሮፌሽናል ዲเจ።", sellerUserId: 26, sellerName: "Biniam" },
  { id: "54", titleEn: "Habesha Ceremony Hall — 300 Capacity", titleAm: "ሀበሻ ስርዓት አዳራሽ — 300 ተረን틴", price: 15000, priceSuffixKey: "price.etb", priceTagKey: "price.fixed", image: "https://images.unsplash.com/photo-1519167758481-83f550bb49b3?w=800&q=80&fm=webp", zone: "ceremony", locationKey: "hawassa", locationTag: "TABOR", rating: 4, reviewCount: 11, isVerified: true, isPremium: true, badgeKey: "badge.verifiedCarta", phone: "+251911223355", whatsapp: "+251911223355", descriptionEn: "Modern ceremony hall with full amenities.", descriptionAm: "ዘመናዊ ስርዓት አዳራሽ ከሙሉ ማመቻቸት ጋር።", sellerUserId: 15, sellerName: "solomon birhanu buche" },
  { id: "55", titleEn: "Floral Decoration & Event Styling", titleAm: "የአበቦች ማጌזן እና ዝግጅት ዘይቤ", price: 12000, priceSuffixKey: "price.etb", priceTagKey: "price.negotiable", image: "https://images.unsplash.com/photo-1487530811176-3780de880c2d?w=800&q=80&fm=webp", zone: "ceremony", locationKey: "hawassa", locationTag: "LAKEFRONT", rating: 4.4, reviewCount: 11, isVerified: true, isPremium: false, badgeKey: "badge.verified", phone: "+251911223400", whatsapp: "+251911223400", descriptionEn: "Complete event decoration service.", descriptionAm: "ሙሉ ዝግጅት ማጌזן አገልግሎት።", sellerUserId: 27, sellerName: "Mulatu" },
  { id: "56", titleEn: "Cat 320 Excavator — For Hire", titleAm: "ካት 320 አቃቂ — በኪራይ", price: 35000, priceSuffixKey: "price.day", priceTagKey: "price.fixed", image: "https://images.unsplash.com/photo-1579412691522-861f6540960d?w=800&q=80&fm=webp", zone: "machinery", locationKey: "hawassa", locationTag: "TABOR", rating: 4, reviewCount: 13, isVerified: true, isPremium: true, badgeKey: "badge.verifiedCarta", billingTrack: "ETB / Day", phone: "+251911223344", whatsapp: "+251911223344", descriptionEn: "Cat 320D excavator for construction. Operator available.", descriptionAm: "ለግንባታ እና የምድር ሥራ ካት 320D አቃቂ።", sellerUserId: 6, sellerName: "Solomon Birhanu" },
  { id: "57", titleEn: "Hitachi ZX200 Excavator", titleAm: "ሀይታቺ ZX200 አቃቂ", price: 30000, priceSuffixKey: "price.day", priceTagKey: "price.negotiable", image: "https://images.unsplash.com/photo-1504917595217-d4dc5ebe6122?w=800&q=80&fm=webp", zone: "machinery", locationKey: "yirgalem", locationTag: "YIRGALEM", rating: 4, reviewCount: 12, isVerified: true, isPremium: false, badgeKey: "badge.verified", billingTrack: "ETB / Day", phone: "+251911223388", whatsapp: "+251911223388", descriptionEn: "Well-maintained Hitachi ZX200 excavator. 20-ton class.", descriptionAm: "በጠበቀ ሁኔታ የተጠበቀ ሀይታቺ ZX200 አቃቂ።", sellerUserId: 24, sellerName: "Ashenafi Haile" },
  { id: "58", titleEn: "SDLG L956F Wheel Loader", titleAm: "SDLG L956F ዞላ ማጓጓző", price: 28000, priceSuffixKey: "price.day", priceTagKey: "price.negotiable", image: "https://images.unsplash.com/photo-1581094794329-c8112a89af12?w=800&q=80&fm=webp", zone: "machinery", locationKey: "bensa", locationTag: "BENSA", rating: 4.5, reviewCount: 10, isVerified: true, isPremium: false, badgeKey: "badge.verified", billingTrack: "ETB / Day", phone: "+251911223366", whatsapp: "+251911223366", descriptionEn: "SDLG L956F wheel loader. 5-ton bucket.", descriptionAm: "SDLG L956F ዞላ ማጓጓző።", sellerUserId: 19, sellerName: "Ada" },
  { id: "59", titleEn: "XCMG Crane — 25 Ton", titleAm: "XCMG ክሬን — 25 ቶን", price: 45000, priceSuffixKey: "price.day", priceTagKey: "price.fixed", image: "https://images.unsplash.com/photo-1504307651254-35680f356dfd?w=800&q=80&fm=webp", zone: "machinery", locationKey: "chuko", locationTag: "CHUKO", rating: 4, reviewCount: 11, isVerified: true, isPremium: true, badgeKey: "badge.verifiedCarta", billingTrack: "ETB / Day", phone: "+251911223377", whatsapp: "+251911223377", descriptionEn: "XCMG 25-ton mobile crane for construction projects.", descriptionAm: "ለግንባታ ፕሮጀክቶች XCMG 25 ቶን ሞባይል ክሬን።", sellerUserId: 22, sellerName: "Muluken Melese" },
  { id: "60", titleEn: "Samsung Galaxy S24 Ultra — 256GB", titleAm: "ሳምሰንግ ጋላክሲ S24 እልትራ — 256GB", price: 85000, priceSuffixKey: "price.etb", priceTagKey: "price.fixed", image: "https://images.unsplash.com/photo-1610945415295-d9bbf067e59c?w=800&q=80&fm=webp", images: ["https://images.unsplash.com/photo-1610945415295-d9bbf067e59c?w=800&q=80&fm=webp", "https://images.unsplash.com/photo-1592899677977-9c10ca588bbd?w=800&q=80&fm=webp", "https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=800&q=80&fm=webp"], zone: "electronics", locationKey: "hawassa", locationTag: "PIASSA", rating: 4, reviewCount: 12, isVerified: true, isPremium: true, badgeKey: "badge.verifiedCarta", condition: "new", phone: "+251911223388", whatsapp: "+251911223388", descriptionEn: "Brand new Samsung Galaxy S24 Ultra. Titanium Black, 256GB.", descriptionAm: "አዲስ ሳምሰንግ ጋላክሲ S24 እልትራ።", sellerUserId: 24, sellerName: "Ashenafi Haile" },
  { id: "61", titleEn: "LG 55\" OLED Smart TV", titleAm: "LG 55\" OLED ሳማርት ቲቪ", price: 65000, priceSuffixKey: "price.etb", priceTagKey: "price.negotiable", image: "https://images.unsplash.com/photo-1593359677879-a4bb92f829d1?w=800&q=80&fm=webp", zone: "electronics", locationKey: "hawassa", locationTag: "TABOR", rating: 3.9, reviewCount: 13, isVerified: true, isPremium: false, badgeKey: "badge.verified", condition: "new", phone: "+251911223344", whatsapp: "+251911223344", descriptionEn: "LG 55-inch OLED 4K Smart TV. Dolby Vision, webOS.", descriptionAm: "LG 55 ኢንች OLED 4K ሳማርት ቲቪ።", sellerUserId: 6, sellerName: "Solomon Birhanu" },
  { id: "62", titleEn: "MacBook Air M3 — 15\"", titleAm: "MacBook Air M3 — 15\"", price: 120000, priceSuffixKey: "price.etb", priceTagKey: "price.fixed", image: "https://images.unsplash.com/photo-1517336714731-489689fd1ca8?w=800&q=80&fm=webp", zone: "electronics", locationKey: "addis_ababa", locationTag: "ADDIS ABABA", rating: 4.4, reviewCount: 11, isVerified: true, isPremium: true, badgeKey: "badge.verifiedCarta", condition: "new", phone: "+251911223400", whatsapp: "+251911223400", descriptionEn: "Apple MacBook Air 15-inch M3 chip, 16GB RAM, 512GB SSD.", descriptionAm: "Apple MacBook Air 15 ኢንች M3 chip፣ 16GB RAM።", sellerUserId: 27, sellerName: "Mulatu" },
  { id: "63", titleEn: "PS5 Console + 2 Controllers", titleAm: "PS5 ኮንሶል + 2 ኮንትሮለሮች", price: 45000, priceSuffixKey: "price.etb", priceTagKey: "price.negotiable", image: "https://images.unsplash.com/photo-1606144042614-b2417e99c4e3?w=800&q=80&fm=webp", zone: "electronics", locationKey: "hawassa", locationTag: "LAKEFRONT", rating: 4.5, reviewCount: 10, isVerified: true, isPremium: false, badgeKey: "badge.verified", condition: "used", phone: "+251911223366", whatsapp: "+251911223366", descriptionEn: "PlayStation 5 disc edition with 2 DualSense controllers.", descriptionAm: "PlayStation 5 ዲስክ ቅርጫ ከ2 DualSense ኮንትሮለሮች ጋር።", sellerUserId: 19, sellerName: "Ada" },
  { id: "64", titleEn: "iPhone 15 Pro Max — 256GB", titleAm: "iPhone 15 Pro Max — 256GB", price: 95000, priceSuffixKey: "price.etb", priceTagKey: "price.negotiable", image: "https://images.unsplash.com/photo-1695048133142-1a20484d2569?w=800&q=80&fm=webp", zone: "electronics", locationKey: "hawassa", locationTag: "TABOR", rating: 4, reviewCount: 11, isVerified: true, isPremium: false, badgeKey: "badge.verified", condition: "used", phone: "+251911223355", whatsapp: "+251911223355", descriptionEn: "iPhone 15 Pro Max, Natural Titanium, 256GB. 95% battery health.", descriptionAm: "iPhone 15 Pro Max፣ ተፈጥሮ ታይታኒየም፣ 256GB።", sellerUserId: 15, sellerName: "solomon birhanu buche" },
];

/* ── Map DB listing shape to ListingItem ── */
function mapDbListingToItem(row: any): ListingItem {
  const cat = row.category || "property";
  let zone: ActiveZone = "house";
  if (cat === "motors") zone = "car";
  else if (cat === "stay" || cat === "ceremony") zone = "ceremony";
  else if (cat === "heavy") zone = "machinery";
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
    priceSuffixKey: row.price_suffix === "per_day" ? "price.day" : row.price_suffix === "per_hour" ? "price.hour" : "price.etb",
    priceTagKey: row.is_premium ? "price.fixed" : "price.negotiable",
    image: images[0] || "https://images.unsplash.com/photo-1560518883-ce09059eeffa?w=800&q=80&fm=webp",
    images,
    zone,
    locationKey: row.location_key || "",
    locationTag: (row.location_label_en || "").toUpperCase() || "PIASSA",
    rating: row.avg_rating ? Number(row.avg_rating) : 0,
    reviewCount: row.review_count ? Number(row.review_count) : 0,
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

/* ── Fetch Listings from API ── */
function useListings(cityKey?: string) {
  const [listings, setListings] = useState<ListingItem[]>(FALLBACK_LISTINGS);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    const url = cityKey ? `/api/listings?city=${cityKey}` : "/api/listings";
    fetch(url)
      .then(res => res.json())
      .then(data => {
        if (cancelled) return;
        if (data.success && Array.isArray(data.data) && data.data.length > 0) {
          setListings(data.data.map(mapDbListingToItem));
        }
        setLoading(false);
      })
      .catch(() => {
        if (!cancelled) {
          setListings(FALLBACK_LISTINGS);
          setLoading(false);
        }
      });
    return () => { cancelled = true; };
  }, [cityKey]);

  return { listings, loading };
}

/* ────────────────────────────────────────────
   Props
   ──────────────────────────────────────────── */
interface ZoneCatalogGridProps {
  activeZone: ActiveZone;
  filters: FilterState;
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
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();

  const requireAuth = useCallback((action: () => void) => {
    if (!isAuthenticated) {
      navigate("/signin");
      return;
    }
    action();
  }, [isAuthenticated, navigate]);
  const { ref: tiltRef, style: tiltStyle } = use3DTilt(10, 1200);

  const formatPrice = (n: number) => n.toLocaleString();

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

        {/* Glassmorphic Status Badge */}
        <div className="absolute top-3 left-3 flex items-center gap-1.5 bg-white/25 dark:bg-black/35 backdrop-blur-xl border border-white/30 rounded-xl px-3 py-1.5 group-hover:scale-105 transition-transform duration-300">
          <span className="w-2.5 h-2.5 rounded-full bg-[#00A86B] animate-pulse" />
          <CheckCircle2 className="w-3.5 h-3.5 text-white" />
          <span className="text-[11px] font-semibold text-white tracking-wide">
            {t(item.badgeKey as any)}
          </span>
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
                  <p className="text-[9px] text-slate-400 uppercase">Bedrooms</p>
                  <p className="text-xs font-extrabold text-slate-700 dark:text-slate-300">{item.bedrooms}</p>
                </div>
              </div>
            )}
            {item.bathrooms && (
              <div className="bg-slate-50 dark:bg-slate-950/50 rounded-xl p-2.5 border border-slate-100 dark:border-white/5 flex items-center gap-2 group-hover:bg-[#00A86B]/5 group-hover:border-[#00A86B]/20 transition-all duration-300">
                <CheckCircle2 className="w-4.5 h-4.5 text-[#00A86B]" />
                <div>
                  <p className="text-[9px] text-slate-400 uppercase">Bathrooms</p>
                  <p className="text-xs font-extrabold text-slate-700 dark:text-slate-300">{item.bathrooms}</p>
                </div>
              </div>
            )}
          </div>
        )}

        {item.zone === "machinery" && (
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

          {/* ── Delala Eliminator Buttons ── */}
          <div className="flex gap-2.5">
            <button
              onClick={() => requireAuth(() => { window.location.href = `tel:${item.phone}`; })}
              className="flex-1 flex items-center justify-center gap-2 py-3.5 rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 hover:bg-gradient-to-r hover:from-[#00A86B] hover:to-emerald-600 hover:border-[#00A86B] hover:text-white backdrop-blur-md text-slate-700 dark:text-slate-200 text-xs sm:text-sm font-extrabold uppercase tracking-wider transition-all duration-400 hover:scale-[1.03] active:scale-[0.97] shadow-sm hover:shadow-xl hover:shadow-emerald-500/30 dark:shadow-none font-sans"
            >
              <Phone className="w-4.5 h-4.5 text-slate-500 dark:text-slate-400 group-hover:text-white transition-colors" />
              {t("cta.call")}
            </button>
            <button
              onClick={() => requireAuth(() => { window.open(`https://wa.me/${item.whatsapp}`, "_blank"); })}
              className="flex-1 flex items-center justify-center gap-2 py-3.5 rounded-2xl bg-gradient-to-r from-[#00A86B] to-emerald-600 text-white text-xs sm:text-sm font-extrabold uppercase tracking-wider hover:from-emerald-600 hover:to-emerald-700 transition-all duration-400 hover:scale-[1.03] active:scale-[0.97] shadow-lg hover:shadow-2xl hover:shadow-emerald-500/40"
            >
              <Send className="w-4.5 h-4.5" />
              {t("cta.whatsapp")}
            </button>
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
  activeZone,
  filters,
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
  const { listings, loading } = useListings(currentCity?.key);

  const requireAuth = useCallback((action: () => void) => {
    if (!isAuthenticated) {
      navigate("/signin");
      return;
    }
    action();
  }, [isAuthenticated, navigate]);

  useEffect(() => {
    setCurrentPage(1);
  }, [activeZone, filters]);

  /* ── Filter Logic ── */
  const filtered = useMemo(() => {
    return listings.filter((item) => {
      // 1. Zone/Category Filter
      if (activeZone !== "all" && item.zone !== activeZone) return false;

      // 2. Keyword Search
      if (filters.search) {
        const s = filters.search.toLowerCase();
        const inTitleEn = item.titleEn.toLowerCase().includes(s);
        const inTitleAm = item.titleAm.toLowerCase().includes(s);
        if (!inTitleEn && !inTitleAm) return false;
      }

      // 3. Region Filter
      if (filters.region && item.locationKey && !item.locationKey.toLowerCase().includes(filters.region.toLowerCase())) {
        // Simple mapping: sidama region includes hawassa, bensa, yirgalem, chuko, aleta
        const sidamaLocs = ["hawassa", "bensa", "yirgalem", "chuko", "aleta"];
        const isSidama = sidamaLocs.some(loc => item.locationKey.toLowerCase().includes(loc));
        if (filters.region === "sidama" && !isSidama) return false;
        if (filters.region === "addis" && !item.locationKey.toLowerCase().includes("addis")) return false;
      }

      // 3. City/Locality Filter
      if (filters.city) {
        const c = filters.city.toLowerCase();
        const inTag = item.locationTag.toLowerCase().includes(c);
        const inKey = item.locationKey.toLowerCase().includes(c);
        if (!inTag && !inKey) return false;
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
        if (filters.titleDeed && item.titleDeed && !item.titleDeed.toLowerCase().includes(filters.titleDeed.toLowerCase())) return false;
        if (filters.sqm) {
          const s = item.sqm || 0;
          if (filters.sqm === "small" && s >= 200) return false;
          if (filters.sqm === "medium" && (s < 200 || s > 500)) return false;
          if (filters.sqm === "large" && s <= 500) return false;
        }
      }

      return true;
    });
  }, [activeZone, filters]);

  // Reset to page 1 whenever filters/zone change
  const totalPages = Math.max(1, Math.ceil(filtered.length / ITEMS_PER_PAGE));
  const safePage = Math.min(currentPage, totalPages);
  const visibleListings = filtered.slice((safePage - 1) * ITEMS_PER_PAGE, safePage * ITEMS_PER_PAGE);

  const goToPage = (page: number) => {
    if (page < 1 || page > totalPages) return;
    setCurrentPage(page);
    const el = document.getElementById("zone-catalog-section");
    if (el) el.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  const handleToggleFavorite = (item: ListingItem) => {
    toggleFavorite(item);
  };

  const handleShare = async (item: ListingItem) => {
    const url = `${window.location.origin}/listing/${item.id}`;
    const title = language === 'amharic' ? item.titleAm : item.titleEn;
    if (navigator.share) {
      navigator.share({ title, url }).catch(() => {});
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
      className={`flex-1 min-w-0 transition-all duration-700 ease-out ${
        gridVisible 
          ? 'animate-fade-in-up opacity-100 translate-y-0' 
          : 'opacity-0 translate-y-8'
      }`}
    >
      {/* ── Section Heading ── */}
      <div className="mb-8">
        <h2 className="text-3xl sm:text-4xl font-sans font-black text-slate-900 dark:text-white tracking-tight leading-snug transition-colors duration-300">
          {language === "amharic" ? (
            <>የተረጋገጡ የ <span className="text-[#00A86B] lowercase font-bold tracking-normal">malazone</span> ይፋዊ ማህደሮች</>
          ) : (
            <><span className="text-[#00A86B] lowercase font-bold tracking-normal">malazone</span> Verified Ledgers</>
          )}
        </h2>

        <div className="w-14 h-1 bg-[#00A86B] rounded-full mt-4 opacity-90 shadow-[0_2px_10px_rgba(0,168,107,0.3)]" />
      </div>

      {/* ── Card Grid ── */}
      {filtered.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
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
              <div className="relative h-40 sm:h-52 overflow-hidden">
                <img
                  src={item.image}
                  alt={language === "amharic" ? item.titleAm : item.titleEn}
                  loading="lazy"
                  crossOrigin="anonymous"
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent" />

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

                {/* Action Buttons: Premium Star, Favorite, Share */}
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
                  <button
                    onClick={(e) => { e.stopPropagation(); handleShare(item); }}
                    className="w-8 h-8 rounded-full bg-white/90 dark:bg-slate-900/90 backdrop-blur-sm flex items-center justify-center shadow-lg hover:scale-110 transition-all duration-300"
                    aria-label="Share listing"
                  >
                    {copiedId === item.id ? (
                      <Check className="w-4 h-4 text-emerald-500" />
                    ) : (
                      <Share2 className="w-4 h-4 text-slate-600 dark:text-slate-300" />
                    )}
                  </button>
                </div>
              </div>

              {/* ── Card Body ── */}
              <div className="p-3 sm:p-5 flex flex-col flex-grow">
                {/* Star Rating */}
                <div className="mb-1.5 sm:mb-2 flex items-center gap-1.5">
                  <StarRating rating={item.rating} />
                  {item.reviewCount ? (
                    <span className="text-[10px] text-slate-400 dark:text-slate-500 font-medium">({item.reviewCount})</span>
                  ) : null}
                </div>

                {/* Title */}
                <h3 className="text-[13px] sm:text-[15px] font-bold text-slate-900 dark:text-white leading-snug mb-2 sm:mb-3 line-clamp-2 group-hover:text-[#00A86B] transition-colors font-sans tracking-wide">
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

                {item.zone === "machinery" && (
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
                <div className="mt-auto">
                  <div className="flex items-baseline justify-between mb-4">
                    <div>
                      <span className="text-xl font-extrabold text-slate-900 dark:text-white">
                        {formatPrice(item.price)}
                      </span>
                      <span className="text-sm font-medium text-slate-500 dark:text-slate-400 ml-1.5">
                        {t(item.priceSuffixKey as any)}
                      </span>
                    </div>
                    <span className="text-[10px] font-bold text-red-500 dark:text-red-400 uppercase tracking-wider">
                      {t(item.priceTagKey as any)}
                    </span>
                  </div>

                  {/* ── Delala Eliminator Buttons ── */}
                  <div className="flex gap-2.5">
                    <button
                      onClick={(e) => { e.stopPropagation(); requireAuth(() => { window.location.href = `tel:${item.phone}`; }); }}
                      className="flex-1 flex items-center justify-center gap-2 py-3 rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 hover:bg-slate-100 dark:bg-slate-900/50 dark:hover:bg-slate-800/80 backdrop-blur-md text-slate-700 dark:text-slate-200 text-xs sm:text-sm font-black uppercase tracking-wider transition-all duration-300 hover:scale-[1.02] active:scale-[0.98] shadow-sm hover:shadow-md dark:shadow-none font-sans"
                    >
                      <Phone className="w-4 h-4 text-slate-500 dark:text-slate-400 transition-colors" />
                      {t("cta.call")}
                    </button>
                    <button
                      onClick={(e) => { e.stopPropagation(); requireAuth(() => { window.open(`https://t.me/+${item.whatsapp.replace("+", "")}`, "_blank"); }); }}
                      className="flex-1 flex items-center justify-center gap-2 py-3 rounded-2xl bg-gradient-to-r from-[#0088cc] to-[#2CA5E0] hover:scale-[1.02] active:scale-[0.98] text-white text-xs sm:text-sm font-black uppercase tracking-wider transition-all duration-300 shadow-md shadow-blue-500/10 hover:shadow-[0_6px_15px_rgba(36,161,222,0.3)] group/tg font-sans"
                    >
                      <Send className="w-4 h-4 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
                      {t("cta.whatsapp")}
                    </button>
                  </div>
                  {item.sellerUserId && (
                    <button
                      onClick={(e) => { e.stopPropagation(); openChat(item.sellerUserId!, item.sellerName || "Seller", Number(item.id)); }}
                      className="mt-2.5 w-full flex items-center justify-center gap-2 py-3 rounded-2xl border border-[#00A86B]/40 text-[#00A86B] dark:text-emerald-400 hover:bg-[#00A86B]/5 dark:hover:bg-emerald-950/20 text-xs sm:text-sm font-black uppercase tracking-wider transition-all duration-300 hover:scale-[1.02] active:scale-[0.98] shadow-sm font-sans"
                    >
                      <MessageCircle className="w-4 h-4" />
                      {t("cta.chat") || "Message Seller"}
                    </button>
                  )}
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
      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-2 mt-10 flex-wrap">
          {/* Prev */}
          <button
            onClick={() => goToPage(safePage - 1)}
            disabled={safePage === 1}
            className="flex items-center gap-1 px-4 py-2.5 rounded-xl border border-slate-200 dark:border-white/10 bg-white dark:bg-slate-900 text-[11px] font-black uppercase tracking-widest text-slate-700 dark:text-slate-300 hover:border-[#00A86B] hover:text-[#00A86B] transition-all disabled:opacity-30 disabled:cursor-not-allowed"
          >
            <ChevronLeft className="w-3.5 h-3.5" />
            {language === "amharic" ? "የቀደመ" : "Prev"}
          </button>

          {/* Page Numbers */}
          {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
            <button
              key={page}
              onClick={() => goToPage(page)}
              className={`min-w-[42px] h-[42px] px-3 rounded-xl border text-sm font-black transition-all ${
                page === safePage
                  ? "bg-[#00A86B] border-[#00A86B] text-white shadow-[0_4px_16px_rgba(0,168,107,0.35)] scale-105"
                  : "bg-white dark:bg-slate-900 border-slate-200 dark:border-white/10 text-slate-700 dark:text-slate-300 hover:border-[#00A86B] hover:text-[#00A86B]"
              }`}
            >
              {page}
            </button>
          ))}

          {/* Next */}
          <button
            onClick={() => goToPage(safePage + 1)}
            disabled={safePage === totalPages}
            className="flex items-center gap-1 px-4 py-2.5 rounded-xl border border-slate-200 dark:border-white/10 bg-white dark:bg-slate-900 text-[11px] font-black uppercase tracking-widest text-slate-700 dark:text-slate-300 hover:border-[#00A86B] hover:text-[#00A86B] transition-all disabled:opacity-30 disabled:cursor-not-allowed"
          >
            {language === "amharic" ? "ቀጣዩ" : "Next"}
            <ChevronRight className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

    </section>
  );
};

export default ZoneCatalogGrid;
