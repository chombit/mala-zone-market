/**
 * ZoneLanguageContext.tsx
 * Thin wrapper around i18next — keeps useLanguage() API stable for all consumers.
 * © 2026 Malazone Technologies PLC
 */

import React, { createContext, useContext, useCallback, useState, useEffect, ReactNode } from "react";
import i18n from "i18next";
import type { Language } from "../i18n";
import { getNextLanguage } from "../i18n";

interface ZoneLanguageContextValue {
    language: Language;
    t: (key: string) => string;
    toggleLanguage: () => void;
    setLanguage: (lang: Language) => void;
}

const ZoneLanguageContext = createContext<ZoneLanguageContextValue | null>(null);

export const ZoneLanguageProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
    const [language, setLang] = useState<Language>(i18n.language as Language);

    useEffect(() => {
        const handler = (lng: string) => {
            setLang(lng as Language);
            // Set HTML lang attribute for proper font rendering
            document.documentElement.lang = lng === 'amharic' ? 'am' : lng === 'sidamu' ? 'sid' : 'en';
        };
        i18n.on("languageChanged", handler);
        // Set initial lang attribute
        document.documentElement.lang = i18n.language === 'amharic' ? 'am' : i18n.language === 'sidamu' ? 'sid' : 'en';
        return () => { i18n.off("languageChanged", handler); };
    }, []);

    const t = useCallback((key: string): string => i18n.t(key), [language]);

    const toggleLanguage = useCallback(() => {
        const next = getNextLanguage(i18n.language as Language);
        i18n.changeLanguage(next);
    }, []);

    const setLanguage = useCallback((lang: Language) => {
        i18n.changeLanguage(lang);
    }, []);

    return (
        <ZoneLanguageContext.Provider value={{ language, t, toggleLanguage, setLanguage }}>
            {children}
        </ZoneLanguageContext.Provider>
    );
};

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
