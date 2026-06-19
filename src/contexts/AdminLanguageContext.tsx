/**
 * AdminLanguageContext.tsx
 * Malazone.com — Admin i18n (Super Admin & Admin)
 * © 2026 Malazone Technologies PLC
 */

import React, { createContext, useContext, useState, useCallback, ReactNode } from "react";

export type Language = "en" | "amharic";

const adminDictionary = {
  en: {
    "admin.title": "Malazone Admin Console",
    "admin.sidebar.analytics": "Analytics Overview",
    "admin.sidebar.property": "Property Approval Hub",
    "admin.sidebar.motors": "Motors & EV Database",
    "admin.sidebar.stay": "Stay & Ceremony Hub",
    "admin.sidebar.heavy": "Heavy Machinery Hub",
    "admin.sidebar.agents": "Mala-Agents Payouts",
    "admin.sidebar.hero": "Hero Slides",
    "admin.sidebar.banners": "Promo Banners",
    "admin.sidebar.locations": "Locations",
    "admin.sidebar.categories": "Categories",
    "admin.sidebar.users": "User Management",
    "admin.metrics.revenue": "Total Revenue",
    "admin.metrics.pending": "Pending Listings",
    "admin.metrics.agents": "Verified Agents",
    "admin.metrics.trades": "Direct Trades",
    "admin.hub.property.id": "Listing ID",
    "admin.hub.property.owner": "Owner Name",
    "admin.hub.property.location": "Location",
    "admin.hub.property.carta": "Carta Number",
    "admin.hub.property.verifyBtn": "Cross-Verify with Municipal Bureau",
    "admin.hub.property.approve": "Approve & Grant Verified Badge",
    "admin.hub.property.reject": "Reject",
    "admin.hub.property.rejectPlaceholder": "Reason for rejection...",
    "admin.hub.agents.name": "Agent Name",
    "admin.hub.agents.phone": "Phone Number",
    "admin.hub.agents.listings": "Weekly Listings",
    "admin.hub.agents.earnings": "Current Balance",
    "admin.hub.agents.payoutBtn": "Disburse via telebirr for Business",
    "admin.hub.agents.status": "Payment Status",
    "admin.hub.agents.paid": "PAID",
    "admin.hub.agents.unpaid": "PENDING",
    "admin.status.loading": "Processing...",
    "admin.status.success": "Operation Successful",
    "admin.status.error": "Error Occurred",
    "admin.nav.toggle": "Switch to አማርኛ",
    "admin.sidebar.listings": "Global Listing Manager",
    "admin.hub.listings.add": "Add New Asset",
    "admin.hub.listings.edit": "Edit Asset",
    "admin.hub.listings.title": "Global Asset Inventory",
    "admin.hub.listings.save": "Save Asset Changes",
    "admin.hub.listings.delete": "Delete Asset",
    "admin.hub.listings.category": "Category",
    "admin.hub.listings.price": "Price",
    "admin.hub.listings.status": "Status",
    "admin.hub.listings.active": "ACTIVE",
    "admin.hub.listings.inactive": "HIDDEN",
    "admin.form.title_en": "Title (English)",
    "admin.form.title_am": "Title (Amharic)",
    "admin.form.desc_en": "Description (English)",
    "admin.form.desc_am": "Description (Amharic)",
    "admin.form.price": "Price (ETB)",
    "admin.form.phone": "Contact Phone",
    "admin.form.whatsapp": "Telegram Username / Phone",
    "admin.form.location": "Location Key",
    "admin.form.premium": "Premium Listing",
    "admin.form.verified": "Verified Asset",
    "admin.role.super_admin": "Super Admin",
    "admin.role.admin": "Admin"
  },
  amharic: {
    "admin.title": "መላዞን አስተዳደር ኮንሶል",
    "admin.sidebar.analytics": "የስራ እንቅስቃሴ ማጠቃለያ",
    "admin.sidebar.property": "የካርታና ይዞታ ማረጋገጫ",
    "admin.sidebar.motors": "የመኪናዎች ቁጥጥር",
    "admin.sidebar.stay": "አዳራሽ፣ ልብስና ዲጄ",
    "admin.sidebar.heavy": "የከባድ ማሽነሪዎች ቁጥጥር",
    "admin.sidebar.agents": "የወኪል ወጣቶች ክፍያ ሰሌዳ",
    "admin.sidebar.hero": "ሄሮ ስላይዶች",
    "admin.sidebar.banners": "የማስተዋወቂያ ባነሮች",
    "admin.sidebar.locations": "አድራሻዎች",
    "admin.sidebar.categories": "ምድቦች",
    "admin.sidebar.users": "የተጠቃሚዎች ቁጥጥር",
    "admin.metrics.revenue": "አጠቃላይ ገቢ",
    "admin.metrics.pending": "በጥበቃ ላይ ያሉ",
    "admin.metrics.agents": "የተረጋገጡ ወኪሎች",
    "admin.metrics.trades": "ቀጥተኛ ግብይቶች",
    "admin.hub.property.id": "መለያ ቁጥር",
    "admin.hub.property.owner": "የባለቤቱ ስም",
    "admin.hub.property.location": "መገኛ",
    "admin.hub.property.carta": "የካርታ ቁጥር",
    "admin.hub.property.verifyBtn": "ከከተማ ማዘጋጃ ቤት አጣራ",
    "admin.hub.property.approve": "አጽድቅ (የተረጋገጠ ባጅ ስጥ)",
    "admin.hub.property.reject": "ውድቅ አድርግ",
    "admin.hub.property.rejectPlaceholder": "ውድቅ የተደረገበት ምክንያት...",
    "admin.hub.agents.name": "የወኪሉ ስም",
    "admin.hub.agents.phone": "ስልክ ቁጥር",
    "admin.hub.agents.listings": "የሳምንቱ ምዝገባ",
    "admin.hub.agents.earnings": "የተጠራቀመ ክፍያ",
    "admin.hub.agents.payoutBtn": "በቴሌብር ቢዝነስ ክፍያ ፈጽም",
    "admin.hub.agents.status": "የክፍያ ሁኔታ",
    "admin.hub.agents.paid": "ተከፍሏል",
    "admin.hub.agents.unpaid": "አልተከፈለባውም",
    "admin.status.loading": "በማሰራጨት ላይ...",
    "admin.status.success": "ተግባሩ ተሳክቷል",
    "admin.status.error": "ስህተት ተከስቷል",
    "admin.nav.toggle": "ወደ English ቀይር",
    "admin.sidebar.listings": "ጠቅላላ የንብረት ቁጥጥር",
    "admin.hub.listings.add": "አዲስ ንብረት ጨምር",
    "admin.hub.listings.edit": "ንብረት አሻሽል",
    "admin.hub.listings.title": "ጠቅላላ የንብረት ዝርዝር",
    "admin.hub.listings.save": "ለውጦችን አስቀምጥ",
    "admin.hub.listings.delete": "ንብረት ሰርዝ",
    "admin.hub.listings.category": "ዘርፍ",
    "admin.hub.listings.price": "ዋጋ",
    "admin.hub.listings.status": "ሁኔታ",
    "admin.hub.listings.active": "በስራ ላይ",
    "admin.hub.listings.inactive": "የተደበቀ",
    "admin.form.title_en": "ርዕስ (English)",
    "admin.form.title_am": "ርዕስ (Amharic)",
    "admin.form.desc_en": "ዝርዝር መግለጫ (English)",
    "admin.form.desc_am": "ዝርዝር መግለጫ (Amharic)",
    "admin.form.price": "ዋጋ (በብር)",
    "admin.form.phone": "የመደወያ ስልክ",
    "admin.form.whatsapp": "የቴሌግራም መለያ / ቁጥር",
    "admin.form.location": "መለያ መገኛ",
    "admin.form.premium": "ልዩ ማስታወቂያ",
    "admin.form.verified": "የተረጋገጠ ንብረት",
    "admin.role.super_admin": "ስኔፐር አስተዳደር",
    "admin.role.admin": "አስተዳደር"
  }
};

type AdminDictionaryKey = keyof typeof adminDictionary.en;

interface AdminLanguageContextValue {
  language: Language;
  t: (key: AdminDictionaryKey) => string;
  toggleLanguage: () => void;
}

const AdminLanguageContext = createContext<AdminLanguageContextValue | null>(null);

export const AdminLanguageProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [language, setLanguage] = useState<Language>("amharic");

  const t = useCallback((key: AdminDictionaryKey) => {
    return adminDictionary[language][key] || key;
  }, [language]);

  const toggleLanguage = useCallback(() => {
    setLanguage(prev => prev === "en" ? "amharic" : "en");
  }, []);

  return (
    <AdminLanguageContext.Provider value={{ language, t, toggleLanguage }}>
      {children}
    </AdminLanguageContext.Provider>
  );
};

export const useAdminLanguage = () => {
  const ctx = useContext(AdminLanguageContext);
  if (!ctx) throw new Error("useAdminLanguage must be used within AdminLanguageProvider");
  return ctx;
};
