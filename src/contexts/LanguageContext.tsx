/**
 * LanguageContext.tsx
 * Malazone.com — failure-proof Bilingual State Provider
 * © 2026 Malazone Technologies PLC
 */

import React, { createContext, useContext, useState, useCallback, useEffect, ReactNode } from "react";

export type Language = "en" | "amharic";

const dictionary = {
  en: {
    "ticker": "✨ MALAZONE: Directly Buy, Sell, or Rent Assets & Ceremony Equipments in Sidama without Middlemen!",
    "nav.brandMala": "MALA",
    "nav.brandZone": "ZONE",
    "nav.agentBtn": "Mala-Agent Zone",
    "nav.cat1": "Property",
    "nav.cat2": "Motors & EV",
    "nav.cat3": "Rooms & Halls",
    "nav.cat4": "DJ & Clothes",
    "nav.cat5": "Heavy Machinery",
    "badge.premium": "Premium Listings",
    "badge.verified": "Verified Assets",
    "badge.noCommission": "No Delala Commission",
    "hero.tagline": "The Zone of Smart Solutions",
    "hero.subtitle": "Directly trade Land, Vehicles, Luxury Halls, and Heavy Industry without middlemen.",
    "cat.all": "All",
    "search.zone": "Search Zone",
    "search.location": "Location",
    "search.intent": "Intent",
    "search.btn": "Find Solution",
    "stats.clients": "Happy Clients",
    "stats.listings": "Active Listings",
    "stats.vehicles": "Vehicles Live",
    "stats.trade": "Direct Trade",
    "intent.buy": "To Buy",
    "intent.rent": "To Rent",
    "intent.hourly": "Per Hour Work",
    "loc.hawassa": "Hawassa",
    "loc.yirgalem": "Yirgalem",
    "loc.aleta": "Aleta Wondo",
    "loc.bensa": "Bensa",
    "loc.chuko": "Chuko",
    // --- Middle Body Layer ---
    "grid.heading": "Premium Featured Listings",
    "grid.chatCTA": "Telegram",
    "grid.callCTA": "Direct Call",
    "grid.viewAll": "View All Assets",
    "badge.verifiedCarta": "Verified Carta",
    "badge.zeroKm": "0 KM / Tax Free",
    "badge.withOperator": "With Operator",
    "price.suffix.etb": "ETB",
    "price.suffix.day": "ETB / Day",
    "price.suffix.hour": "ETB / Hour",
    "banner.recruitment": "A great work opportunity for brokers, agents, and youth! Onboard vehicle showrooms, heavy machinery, hotels, guest houses, wedding gear, and land holdings in Hawassa, Yirgalem, Aleta Wondo, Bensa/Daye, Chuko, and other local zones into Malazone's legal sales zone. Earn high income paid out directly via Telebirr every day! (Mala-Agents Zone)",
    "banner.cta": "Apply as Mala-Agent"
  },
  amharic: {
    "ticker": "✨ መላዞን፡ በሐዋሳና በሲዳማ ክልል ያለምንም ደላላ ንብረትና የሰርግ ዕቃዎችን በቀጥታ የሚገበያዩበት ትክክለኛው መላዎ!",
    "nav.brandMala": "መላ",
    "nav.brandZone": "ዞን",
    "nav.agentBtn": "የወኪል ወጣቶች ዞን",
    "nav.cat1": "መሬትና ቤት",
    "nav.cat2": "መኪናና ኤሌክትሪክ",
    "nav.cat3": "አዳራሽና ጌስት ሃውስ",
    "nav.cat4": "ልብስና ዲጄ ኪራይ",
    "nav.cat5": "ከባድ ማሽነሪዎች",
    "badge.premium": "ልዩ ማስታወቂያዎች",
    "badge.verified": "ካርታ የተረጋገጠ",
    "badge.noCommission": "ያለ ደላላ ኮሚሽን",
    "hero.tagline": "የብልሃት እና የመፍትሔ ዞን",
    "hero.subtitle": "መሬት፣ መኪና፣ የሰርግ አዳራሾች እና ከባድ ማሽነሪዎችን ያለምንም ደላላ ጣልቃ ገብነት በቀጥታ የሚያገኟበት ዲጂታል መላ!",
    "cat.all": "ሁሉም",
    "search.zone": "የንግድ ዘርፍ",
    "search.location": "የሰፈር መገኛ",
    "search.intent": "የፍላጎት አይነት",
    "search.btn": "መላ አግኝ (ፈልግ)",
    "stats.clients": "ደስተኛ ደንበኞች",
    "stats.listings": "ንቁ ማስታወቂያዎች",
    "stats.vehicles": "ተሽከርካሪዎች በስራ ላይ",
    "stats.trade": "ቀጥተኛ ግይት",
    "intent.buy": "ለመግዛት",
    "intent.rent": "ለመከራየት",
    "intent.hourly": "በሰዓት ለመቅጠር",
    "loc.hawassa": "ሐዋሳ",
    "loc.yirgalem": "ይርጋለም",
    "loc.aleta": "አሌታ ወንዶ",
    "loc.bensa": "ቤንሳ",
    "loc.chuko": "ጩቆ",
    // --- Middle Body Layer ---
    "grid.heading": "ልዩና ተመራጭ ማስታወቂያዎች",
    "grid.chatCTA": "በቴሌግራም",
    "grid.callCTA": "ቀጥታ ደውል",
    "grid.viewAll": "ሁሉንም ማስታወቂያዎች አሳይ",
    "badge.verifiedCarta": "ካርታ የተረጋገጠ",
    "badge.zeroKm": "0 ኪሜ / ቀረጥ ነፃ",
    "badge.withOperator": "ኦፕሬተር ጋር",
    "price.suffix.etb": "ብር",
    "price.suffix.day": "ብር / ቀን",
    "price.suffix.hour": "ብር / ሰዓት",
    "banner.recruitment": "ለደላላዎች፣ ለወኪሎችና ለወጣቶች የቀረበ ታላቅ የስራ መላ! በሐዋሳ፣ በይርጋለም፣ በአሌታ ወንዶ፣ በቤንሳ/ዳዬ፣ በጩቆ እና በሌሎችም የአካባቢው ዞኖች ያሉ የመኪና ማሳያዎችን፣ ከባድ ማሽነሪዎችን፣ ሆቴሎችን፣ ጌስት ሃውሶችን፣ የሰርግ ዕቃዎችን እና የመሬት ይዞታዎችን በመላዞን ህጋዊ የሽያጭ ዞን ላይ በመመዝገብ በየቀኑ ከፍተኛ ገቢ በቴሌብር በቀጥታ ያግኙ! (Mala-Agents Zone)",
    "banner.cta": "የመላ-ወኪል ሁን"
  }
};

type DictionaryKey = keyof typeof dictionary.en;

interface LanguageContextValue {
  language: Language;
  t: (key: string) => string;
  toggleLanguage: () => void;
  setLanguage: (lang: Language) => void;
}

const LanguageContext = createContext<LanguageContextValue | null>(null);

export const LanguageProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [language, setLanguageState] = useState<Language>("amharic");
  const [dynamicDict, setDynamicDict] = useState<Record<string, { en: string; amharic: string }>>({});

  useEffect(() => {
    fetch('/api/translations')
      .then(res => res.json())
      .then(data => {
        if (data.success) {
          setDynamicDict(data.data);
        }
      })
      .catch(err => console.error("Failed to load global translations:", err));
  }, []);

  const t = useCallback((key: string) => {
    if (dynamicDict[key] && dynamicDict[key][language]) {
      return dynamicDict[key][language];
    }
    // @ts-ignore
    return dictionary[language][key] || key;
  }, [language, dynamicDict]);

  const toggleLanguage = useCallback(() => {
    setLanguageState(prev => prev === "en" ? "amharic" : "en");
  }, []);

  const setLanguage = useCallback((lang: Language) => {
    setLanguageState(lang);
  }, []);

  return (
    <LanguageContext.Provider value={{ language, t, toggleLanguage, setLanguage }}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = () => {
  const ctx = useContext(LanguageContext);
  if (!ctx) throw new Error("useLanguage must be used within LanguageProvider");
  return ctx;
};
