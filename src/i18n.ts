import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import en from './locales/en.json';
import amharic from './locales/amharic.json';
import sidamu from './locales/sidamu.json';

export type Language = "en" | "amharic" | "sidamu";

export const LANGUAGE_OPTIONS: { value: Language; label: string; labelShort: string }[] = [
  { value: "en", label: "English", labelShort: "EN" },
  { value: "amharic", label: "አማርኛ", labelShort: "አማ" },
  { value: "sidamu", label: "Sidaamu Afoo", labelShort: "SID" },
];

export function getNextLanguage(current: Language): Language {
  const order: Language[] = ["amharic", "sidamu", "en"];
  const idx = order.indexOf(current);
  return order[(idx + 1) % order.length];
}

i18n.use(initReactI18next).init({
  resources: {
    en: { translation: en },
    amharic: { translation: amharic },
    sidamu: { translation: sidamu },
  },
  lng: (localStorage.getItem('malazone_lang') as Language) || "amharic",
  fallbackLng: "en",
  interpolation: { escapeValue: false },
});

i18n.on('languageChanged', (lng: string) => {
  localStorage.setItem('malazone_lang', lng);
});

export default i18n;
