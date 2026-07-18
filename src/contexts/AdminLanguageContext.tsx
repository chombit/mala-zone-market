/**
 * AdminLanguageContext.tsx
 * Thin wrapper around i18next — keeps useAdminLanguage() API stable for admin consumers.
 * © 2026 Malazone Technologies PLC
 */

import React, { createContext, useContext, useCallback, useState, useEffect, ReactNode } from "react";
import i18n from "i18next";
import type { Language } from "../i18n";
import { getNextLanguage } from "../i18n";

interface AdminLanguageContextValue {
    language: Language;
    t: (key: string) => string;
    toggleLanguage: () => void;
}

const AdminLanguageContext = createContext<AdminLanguageContextValue | null>(null);

export const AdminLanguageProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
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
