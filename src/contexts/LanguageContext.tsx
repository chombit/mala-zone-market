/**
 * LanguageContext.tsx
 * Thin wrapper around i18next — keeps useLanguage() API stable for legacy consumers.
 * © 2026 Malazone Technologies PLC
 */

import React, { createContext, useContext, useCallback, useState, useEffect, ReactNode } from "react";
import i18n from "i18next";
import type { Language } from "../i18n";
import { getNextLanguage } from "../i18n";

interface LanguageContextValue {
    language: Language;
    t: (key: string) => string;
    toggleLanguage: () => void;
    setLanguage: (lang: Language) => void;
}

const LanguageContext = createContext<LanguageContextValue | null>(null);

export const LanguageProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
    const [language, setLang] = useState<Language>(i18n.language as Language);

    useEffect(() => {
        const handler = (lng: string) => setLang(lng as Language);
        i18n.on("languageChanged", handler);
        return () => { i18n.off("languageChanged", handler); };
    }, []);

    const t = useCallback((key: string) => i18n.t(key), [language]);

    const toggleLanguage = useCallback(() => {
        const next = getNextLanguage(i18n.language as Language);
        i18n.changeLanguage(next);
    }, []);

    const setLanguage = useCallback((lang: Language) => {
        i18n.changeLanguage(lang);
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
