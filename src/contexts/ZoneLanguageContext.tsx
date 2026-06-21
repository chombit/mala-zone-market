/**
 * ZoneLanguageContext.tsx
 * Malazone.com — Zone-Centric Bilingual State Provider
 * Strict Rule: ቀጠና is NEVER used — only ዞን (Zone)
 * © 2026 Malazone Technologies PLC
 */

import React, {
    createContext,
    useContext,
    useState,
    useCallback,
    ReactNode,
} from "react";

/* ────────────────────────────────────────────
   Language Type
   ──────────────────────────────────────────── */
export type Language = "en" | "amharic";

/* ────────────────────────────────────────────
   Exhaustive Bilingual Dictionary
   ──────────────────────────────────────────── */
const dictionary = {
    en: {
        /* ── Global Brand ── */
        "brand.mala": "MALA",
        "brand.zone": "ZONE",
        "brand.full": "Malazone.com",
        "brand.tagline": "The Zone of Smart Solutions",

        /* ── Top Ticker Banner ── */
        "ticker":
            "✨ MALAZONE: Directly Buy, Sell, or Rent Assets & Ceremony Equipments in Sidama without Middlemen!",

        /* ── Industry Zones ── */
        "zone.all": "All Zones",
        "zone.car": "Car Sale & Rent",
        "zone.house": "House & Land",
        "zone.ceremony": "Wedding & DJ Gear",
        "zone.machinery": "Heavy Machineries",

        /* ── Geographic Zones ── */
        "geo.all": "All Areas",
        "geo.hawassa": "Hawassa Zone",
        "geo.bensa": "Bensa Zone",
        "geo.yirgalem": "Yirgalem Zone",
        "geo.aletaWondo": "Aleta Wondo Zone",
        "geo.chuko": "Chuko Zone",

        /* ── Header Nav Categories ── */
        "nav.cat1": "House & Land",
        "nav.cat2": "Car Sale & Rent",
        "nav.cat3": "Hotels & Guest Houses",
        "nav.cat4": "Wedding & DJ Gear",
        "nav.cat5": "Heavy Machineries",
        "nav.agentBtn": "Mala-Agent Zone ",

        /* ── Hero ── */
        "hero.tagline": "The Zone of Smart Solutions",
        "hero.subtitle":
            "Directly trade Land, Vehicles, Luxury Halls, and Heavy Industry without middlemen.",

        /* ── Search Bar ── */
        "search.zone": "Search Zone",
        "search.location": "Location",
        "search.intent": "Intent",
        "search.btn": "Find Solution",
        "cat.all": "All Zones",

        /* ── Stats Strip ── */
        "stats.clients": "Happy Clients",
        "stats.listings": "Active Listings",
        "stats.vehicles": "Vehicles Live",
        "stats.trade": "Direct Trade",

        /* ── Sidebar Filters ── */
        "sidebar.title": "Filters",
        "sidebar.reset": "Reset Filters",
        "sidebar.region": "Region / Zone",
        "sidebar.regionAll": "All Regions",
        "sidebar.city": "City / Sub-City",
        "sidebar.cityAll": "All Cities",
        "sidebar.intent": "Transaction Intent",
        "sidebar.intentAll": "All Intents",

        /* ── Sidebar Regions ── */
        "region.sidama": "Sidama",
        "region.addis": "Addis Ababa",

        /* ── Sidebar Cities ── */
        "city.tabor": "Hawassa - Tabor",
        "city.lakefront": "Hawassa - Lakefront",
        "city.piassa": "Hawassa - Piassa",
        "city.yirgalem": "Yirgalem",
        "city.bensa": "Bensa",
        "city.chuko": "Chuko",

        /* ── Sidebar Intent Options ── */
        "intent.buy": "To Buy",
        "intent.rent": "To Rent",
        "intent.hourly": "Per Hour Work",

        /* ── Sidebar Dynamic: Car Zone ── */
        "filter.plateCode": "Plate Code",
        "filter.plateAll": "All Codes",
        "filter.plateCode2": "Code 2",
        "filter.plateCode3": "Code 3",
        "filter.fuelType": "Fuel Type",
        "filter.fuelAll": "All Fuel Types",
        "filter.benzine": "Benzine",
        "filter.diesel": "Diesel",
        "filter.electric": "Electric",
        "filter.condition": "Condition",
        "filter.conditionAll": "All Conditions",
        "filter.condNew": "Brand New",
        "filter.condUsed": "Locally Used",
        "filter.condExcellent": "Excellent",

        /* ── Sidebar Dynamic: House Zone ── */
        "filter.titleDeed": "Title Deed Status",
        "filter.deedAll": "All Statuses",
        "filter.deedCarta": "Verified Carta",
        "filter.deedVillage": "Village Deed",
        "filter.sqm": "Area (Sqm)",
        "filter.sqmAll": "All Sizes",
        "filter.sqmSmall": "Under 200 Sqm",
        "filter.sqmMedium": "200 — 500 Sqm",
        "filter.sqmLarge": "Over 500 Sqm",

        /* ── Grid Section ── */
        "grid.heading.all": "MALA Specially Featured Listings",
        "grid.heading.car": "MALA Specially Featured Car Zone Listings",
        "grid.heading.house": "MALA Specially Featured House Zone Listings",
        "grid.heading.ceremony": "MALA Specially Featured Ceremony Zone Listings",
        "grid.heading.machinery":
            "MALA Specially Featured Machinery Zone Listings",
        "grid.viewAll": "View All Assets",
        "grid.empty": "No listings found for the selected zone parameters.",

        /* ── Card CTAs ── */
        "cta.call": "Direct Call",
        "cta.whatsapp": "Telegram",

        /* ── Card Badges ── */
        "badge.verifiedCarta": "Verified Carta",
        "badge.verified": "Verified",
        "badge.premium": "Premium Listings",
        "badge.noCommission": "No Delala Commission",
        "badge.zeroKm": "0 KM / Tax Free",
        "badge.withOperator": "With Operator",

        /* ── Card Info Labels ── */
        "label.plateCode": "Plate Code",
        "label.fuel": "Fuel Type",
        "label.condition": "Condition",
        "label.titleDeed": "Title Deed",
        "label.sqm": "Footprint",
        "label.billing": "Billing Track",

        /* ── Price Suffixes ── */
        "price.etb": "ETB",
        "price.day": "ETB / Day",
        "price.hour": "ETB / Hour",
        "price.fixed": "Fixed Price",
        "price.negotiable": "Negotiable",

        /* ── Locations (pills) ── */
        "loc.hawassa": "Hawassa",
        "loc.yirgalem": "Yirgalem",
        "loc.aleta": "Aleta Wondo",
        "loc.bensa": "Bensa",
        "loc.chuko": "Chuko",

        /* ── Agent Banner ── */
        "banner.recruitment":
            "A great work opportunity for brokers, agents, and youth! Onboard vehicle showrooms, heavy machinery, hotels, guest houses, wedding gear, and land holdings in Hawassa, Yirgalem, Aleta Wondo, Bensa/Daye, Chuko, and other local zones into Malazone's legal sales zone. Earn high income paid out directly via Telebirr every day! (Mala-Agents Zone)",
        "banner.cta": "Apply as Mala-Agent",

        /* ── Executive Footnote ── */
    },

    amharic: {
        /* ── Global Brand ── */
        "brand.mala": "መላ",
        "brand.zone": "ዞን",
        "brand.full": "መላዞን.com",
        "brand.tagline": "የብልሃት እና የመፍትሔ ዞን",

        /* ── Top Ticker Banner ── */
        "ticker":
            "✨ መላዞን፡ በሐዋሳና በሲዳማ ክልል ያለምንም ደላላ ንብረትና የሰርግ ዕቃዎችን በቀጥታ የሚገበያዩበት ትክክለኛው መላዎ!",

        /* ── Industry Zones ── */
        "zone.all": "ሁሉም ዞኖች",
        "zone.car": "መኪና መግዣና ኪራይ",
        "zone.house": "ቤትና መሬት",
        "zone.ceremony": "የሰርግና የደግስ ዕቃዎች",
        "zone.machinery": "ከባድ ማሽነሪዎች",

        /* ── Geographic Zones ── */
        "geo.all": "ሁሉም መገኛዎች",
        "geo.hawassa": "የሐዋሳ ዞን",
        "geo.bensa": "የቤንሳ ዞን",
        "geo.yirgalem": "የይርጋለም ዞን",
        "geo.aletaWondo": "የአሌታ ወንዶ ዞን",
        "geo.chuko": "የጩቆ ዞን",

        /* ── Header Nav Categories ── */
        "nav.cat1": "ቤትና መሬት",
        "nav.cat2": "መኪና መግዣና ኪራይ",
        "nav.cat3": "ሆቴልና ጌስት ሃውስ",
        "nav.cat4": "የሰርግና የደግስ ዕቃዎች",
        "nav.cat5": "ከባድ ማሽነሪዎች",
        "nav.agentBtn": "የወኪል ወጣቶች ዞን",

        /* ── Hero ── */
        "hero.tagline": "የብልሃት እና የመፍትሔ ዞን",
        "hero.subtitle":
            "መሬት፣ መኪና፣ የሰርግ አዳራሾች እና ከባድ ማሽነሪዎችን ያለምንም ደላላ ጣልቃ ገብነት በቀጥታ የሚያገኟበት ዲጂታል መላ!",

        /* ── Search Bar ── */
        "search.zone": "የንግድ ዘርፍ",
        "search.location": "የሰፈር መገኛ",
        "search.intent": "የፍላጎት አይነት",
        "search.btn": "መላ አግኝ (ፈልግ)",
        "cat.all": "ሁሉም ዞኖች",

        /* ── Stats Strip ── */
        "stats.clients": "ደስተኛ ደንበኞች",
        "stats.listings": "ንቁ ማስታወቂያዎች",
        "stats.vehicles": "ተሽከርካሪዎች በስራ ላይ",
        "stats.trade": "ቀጥተኛ ግይት",

        /* ── Sidebar Filters ── */
        "sidebar.title": "ማጣሪያዎች",
        "sidebar.reset": "ሁሉንም አድስ",
        "sidebar.region": "ክልል / ዞን",
        "sidebar.regionAll": "ሁሉም አማራጮች",
        "sidebar.city": "ከተማ / ክፍለ-ከተማ",
        "sidebar.cityAll": "ሁሉም አማራጮች",
        "sidebar.intent": "የፍላጎት አይነት",
        "sidebar.intentAll": "ሁሉም አማራጮች",

        /* ── Sidebar Regions ── */
        "region.sidama": "ሲዳማ",
        "region.addis": "አዲስ አበባ",

        /* ── Sidebar Cities ── */
        "city.tabor": "ሐዋሳ - ታቦር",
        "city.lakefront": "ሐዋሳ - ሐይቅ ዳርቻ",
        "city.piassa": "ሐዋሳ - ፒያሳ",
        "city.yirgalem": "ይርጋለም",
        "city.bensa": "ቤንሳ",
        "city.chuko": "ጩቆ",

        /* ── Sidebar Intent Options ── */
        "intent.buy": "ለመግዛት",
        "intent.rent": "ለመከራየት",
        "intent.hourly": "በሰዓት ለመቅጠር",

        /* ── Sidebar Dynamic: Car Zone ── */
        "filter.plateCode": "የሰሌዳ ኮድ",
        "filter.plateAll": "ሁሉም ኮዶች",
        "filter.plateCode2": "ኮድ 2",
        "filter.plateCode3": "ኮድ 3",
        "filter.fuelType": "የነዳጅ አይነት",
        "filter.fuelAll": "ሁሉም አይነቶች",
        "filter.benzine": "ቤንዚን",
        "filter.diesel": "ዲዝል",
        "filter.electric": "ኤሌክትሪክ",
        "filter.condition": "ሁኔታ",
        "filter.conditionAll": "ሁሉም ሁኔታዎች",
        "filter.condNew": "አዲስ ዜሮ ኪሎ",
        "filter.condUsed": "የተጠቀመ ግን ጥሩ",
        "filter.condExcellent": "ምርጥ ሁኔታ",

        /* ── Sidebar Dynamic: House Zone ── */
        "filter.titleDeed": "ካርታ ማረጋገጫ",
        "filter.deedAll": "ሁሉም ሁኔታዎች",
        "filter.deedCarta": "ካርታ ያለው",
        "filter.deedVillage": "የገጠር ይዞታ",
        "filter.sqm": "የቦታ ስፋት (ካሬ ሜትር)",
        "filter.sqmAll": "ሁሉም ስፋቶች",
        "filter.sqmSmall": "ከ200 ካ.ሜ. በታች",
        "filter.sqmMedium": "200 — 500 ካ.ሜ.",
        "filter.sqmLarge": "ከ500 ካ.ሜ. በላይ",

        /* ── Grid Section ── */
        "grid.heading.all": "MALA ልዩና ተመራጭ ማስታወቂያዎች",
        "grid.heading.car": "MALA ልዩና ተመራጭ የመኪና ዞን ማስታወቂያዎች",
        "grid.heading.house": "MALA ልዩና ተመራጭ የቤትና ይዞታ ዞን ማስታወቂያዎች",
        "grid.heading.ceremony": "MALA ልዩና ተመራጭ የክብረ-በዓላት ዞን ማስታወቂያዎች",
        "grid.heading.machinery":
            "MALA ልዩና ተመራጭ የከባድ ማሽነሪዎች ዞን ማስታወቂያዎች",
        "grid.viewAll": "ሁሉም ማስታወቂያዎች",
        "grid.empty": "በተመረጠው ዞን ውስጥ ምንም ማስታወቂያ አልተገኘም።",

        /* ── Card CTAs ── */
        "cta.call": "ቀጥታ ደውል",
        "cta.whatsapp": "በቴሌግራም",

        /* ── Card Badges ── */
        "badge.verifiedCarta": "ካርታ የተረጋገጠ",
        "badge.verified": "የተረጋገጠ",
        "badge.premium": "ልዩ ማስታወቂያዎች",
        "badge.noCommission": "ያለ ደላላ ኮሚሽን",
        "badge.zeroKm": "0 ኪሜ / ቀረጥ ነፃ",
        "badge.withOperator": "ባለሙያ ያለው",

        /* ── Card Info Labels ── */
        "label.plateCode": "ሰሌዳ",
        "label.fuel": "ነዳጅ",
        "label.condition": "ሁኔታ",
        "label.titleDeed": "ካርታ",
        "label.sqm": "ስፋት",
        "label.billing": "የክፍያ ዘዴ",

        /* ── Price Suffixes ── */
        "price.etb": "ብር",
        "price.day": "ብር / ቀን",
        "price.hour": "ብር / ሰዓት",
        "price.fixed": "ቋሚ ዋጋ",
        "price.negotiable": "ድርድር ይቻላል",

        /* ── Locations (pills) ── */
        "loc.hawassa": "ሐዋሳ",
        "loc.yirgalem": "ይርጋለም",
        "loc.aleta": "አሌታ ወንዶ",
        "loc.bensa": "ቤንሳ",
        "loc.chuko": "ጩቆ",

        /* ── Agent Banner ── */
        "banner.recruitment":
            "ለደላላዎች፣ ለወኪሎችና ለወጣቶች የቀረበ ታላቅ የስራ መላ! በሐዋሳ፣ በይርጋለም፣ በአሌታ ወንዶ፣ በቤንሳ/ዳዬ፣ በጩቆ እና በሌሎችም የአካባቢው ዞኖች ያሉ የመኪና ማሳያዎችን፣ ከባድ ማሽነሪዎችን፣ ሆቴሎችን፣ ጌስት ሃውሶችን፣ የሰርግ ዕቃዎችን እና የመሬት ይዞታዎችን በመላዞን ህጋዊ የሽያጭ ዞን ላይ በመመዝገብ በየቀኑ ከፍተኛ ገቢ በቴሌብር በቀጥታ ያግኙ! (Mala-Agents Zone)",
        "banner.cta": "የመላ-ወኪል ሁን",

        /* ── Executive Footnote ── */
        "footnote.ceo": "ሉዋ ተሰማ ካካዎ — ዋና ስራ አስፈፃሚ",
    },
};

/* ────────────────────────────────────────────
   Types & Context
   ──────────────────────────────────────────── */
type DictionaryKey = keyof typeof dictionary.en;

interface ZoneLanguageContextValue {
    language: Language;
    t: (key: DictionaryKey) => string;
    toggleLanguage: () => void;
    setLanguage: (lang: Language) => void;
}

const ZoneLanguageContext = createContext<ZoneLanguageContextValue | null>(null);

/* ────────────────────────────────────────────
   Provider
   ──────────────────────────────────────────── */
export const ZoneLanguageProvider: React.FC<{ children: ReactNode }> = ({
    children,
}) => {
    const [language, setLangState] = useState<Language>("amharic");

    const t = useCallback(
        (key: DictionaryKey): string => {
            return dictionary[language][key] ?? key;
        },
        [language]
    );

    const toggleLanguage = useCallback(() => {
        setLangState((prev) => (prev === "en" ? "amharic" : "en"));
    }, []);

    const setLanguage = useCallback((lang: Language) => {
        setLangState(lang);
    }, []);

    return (
        <ZoneLanguageContext.Provider
            value={{ language, t, toggleLanguage, setLanguage }}
        >
            {children}
        </ZoneLanguageContext.Provider>
    );
};

/* ────────────────────────────────────────────
   Failproof Hook
   ──────────────────────────────────────────── */
export const useLanguage = (): ZoneLanguageContextValue => {
    const ctx = useContext(ZoneLanguageContext);
    if (!ctx) {
        throw new Error(
            "useLanguage must be used within <ZoneLanguageProvider>. " +
            "Wrap your application root in <ZoneLanguageProvider> inside main.tsx."
        );
    }
    return ctx;
};
