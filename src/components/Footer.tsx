import React from "react";
import {
  Building2,
  Car,
  DoorOpen,
  Music,
  Tractor,
  Smartphone,
  Phone,
  Mail,
  MapPin,
} from "lucide-react";
import { useLanguage } from "@/contexts/ZoneLanguageContext";

type PageView = "home" | "about" | "contact" | "privacy" | "faq" | "gighub" | "agent-onboard";

const footerTranslations = {
  en: {
    col1Title: "Ecosystem Zones",
    col1: [
      { icon: Building2, label: "Property Zone" },
      { icon: Car, label: "Motors & EV" },
      { icon: DoorOpen, label: "Rooms & Halls" },
      { icon: Music, label: "Ceremony Hub" },
      { icon: Tractor, label: "Heavy Machinery" },
      { icon: Smartphone, label: "Electronics Zone" }
    ],
    col2Title: "SUPPORT",
    col2: [
      { label: "About Malazone", page: "about" as PageView },
      { label: "FAQ", page: "faq" as PageView },
      { label: "Privacy Policy", page: "privacy" as PageView },
      { label: "Contact", page: "contact" as PageView }
    ] as { icon?: any, label: string, page?: PageView }[],
    col3Title: "CONTACT",
    col3: [
      { label: "+251 911 123 456" },
      { label: "support@malazone.com" },
      { label: "Hawassa, Ethiopia" }
    ] as { icon?: any, label: string }[],
    copyright: "© 2026 Malazone Technologies PLC. All Rights Reserved.",
    backToTop: "Back to Top",
    contactUs: "Contact Us",
    openApp: "Open WhatsApp"
  },
  amharic: {
    col1Title: "የንግድ ዞኖች",
    col1: [
      { icon: Building2, label: "መሬትና ቤት" },
      { icon: Car, label: "መኪናና ኤሌክትሪክ" },
      { icon: DoorOpen, label: "አዳራሽና ጌስት ሃውስ" },
      { icon: Music, label: "ልብስና ዲጄ ኪራይ" },
      { icon: Tractor, label: "ከባድ ማሽነሪዎች" },
      { icon: Smartphone, label: "ኤሌክትሮኒክስ ዞን" }
    ],
    col2Title: "እርዳታና ድጋፍ",
    col2: [
      { label: "ስለ መላዞን", page: "about" as PageView },
      { label: "ተደጋጋሚ ጥያቄዎች", page: "faq" as PageView },
      { label: "የግል ምስጢር ጥበቃ", page: "privacy" as PageView },
      { label: "ያግኙን", page: "contact" as PageView }
    ] as { icon?: any, label: string, page?: PageView }[],
    col3Title: "አድራሻ",
    col3: [
      { label: "+251 911 123 456" },
      { label: "support@malazone.com" },
      { label: "ሐዋሳ, ኢትዮጵያ" }
    ] as { icon?: any, label: string }[],
    copyright: "© 2026 Malazone Technologies PLC. All Rights Reserved.",
    backToTop: "ወደ ላይ ተመለስ",
    contactUs: "ያግኙን",
    openApp: "WhatsApp ክፈት"
  },
  sidamu: {
    col1Title: "Lakkal Seetta",
    col1: [
      { icon: Building2, label: "Manzawuna Beti" },
      { icon: Car, label: "Oottobillisiinota" },
      { icon: DoorOpen, label: "Ummata Hooje" },
      { icon: Music, label: "Waashettu" },
      { icon: Tractor, label: "Shaayinarii Dandalicha" },
      { icon: Smartphone, label: "Elektrooniks Lakkal" }
    ],
    col2Title: "GUMAAFFA",
    col2: [
      { label: "Malazone Keetta", page: "about" as PageView },
      { label: "Gaaffii", page: "faq" as PageView },
      { label: "Dincii Ijaa", page: "privacy" as PageView },
      { label: "Nagaa", page: "contact" as PageView }
    ] as { icon?: any, label: string, page?: PageView }[],
    col3Title: "AAKKADHAA",
    col3: [
      { label: "+251 911 123 456" },
      { label: "support@malazone.com" },
      { label: " Hawaassa, Itoophiyaa" }
    ] as { icon?: any, label: string }[],
    copyright: "© 2026 Malazone Technologies PLC. All Rights Reserved.",
    backToTop: "Albaatti Deebi'i",
    contactUs: "Nagaa",
    openApp: "WhatsApp Fufi"
  }
};

interface FooterProps {
  onNavigate?: (page: PageView) => void;
}

const Footer: React.FC<FooterProps> = ({ onNavigate }) => {
  const { language, t } = useLanguage();
  const f = footerTranslations[language as keyof typeof footerTranslations] ?? footerTranslations.en;

  const scrollToTop = () => window.scrollTo({ top: 0, behavior: 'smooth' });

  return (
    <footer className="bg-slate-800 dark:bg-slate-950 relative overflow-hidden transition-colors duration-300">
      {/* 2px solid emerald brand top border */}
      <div className="h-[2px] w-full bg-[#00A86B]" />

      {/* ═══════════════════════════════════════════════
          MOBILE LAYOUT (< sm)
      ═══════════════════════════════════════════════ */}
      <div className="sm:hidden">

        {/* Brand + tagline */}
        <div className="px-6 pt-8 pb-6 flex flex-col items-center text-center gap-3">
          <div className="flex items-center gap-1">
            <span className="text-2xl font-black tracking-tighter text-[#00A86B] uppercase">MALA</span>
            <span className="text-2xl font-black tracking-tighter text-slate-100 uppercase">ZONE</span>
          </div>
          <div className="w-16 h-[2px] bg-[#00A86B]/50 rounded-full" />
        </div>

        {/* 2-column grid — Support | Contact */}
        <div className="px-6 pb-6 grid grid-cols-2 gap-6">

          {/* Col 1 — Support */}
          <div className="space-y-3">
            <h4 className="text-slate-100 font-black text-[9px] uppercase tracking-[0.2em] border-l-2 border-[#00A86B] pl-2 leading-tight">
              {f.col2Title}
            </h4>
            <ul className="space-y-3">
              {f.col2.map((item, i) => (
                <li key={i}>
                  <button
                    onClick={() => item.page && onNavigate?.(item.page)}
                    className="flex items-center gap-1.5 text-[12px] text-slate-400 hover:text-[#00A86B] transition-colors text-left leading-snug"
                  >
                    <span className="w-1.5 h-1.5 rounded-full bg-[#00A86B]/60 shrink-0" />
                    {item.label}
                  </button>
                </li>
              ))}
            </ul>
          </div>

          {/* Col 2 — Contact */}
          <div className="space-y-3">
            <h4 className="text-slate-100 font-black text-[9px] uppercase tracking-[0.2em] border-l-2 border-[#00A86B] pl-2 leading-tight">
              {f.col3Title}
            </h4>
            <ul className="space-y-3">
              {f.col3.map((item, i) => {
                const icons = [
                  <Phone key="p" className="w-3.5 h-3.5 text-[#00A86B] shrink-0" />,
                  <Mail key="m" className="w-3.5 h-3.5 text-[#00A86B] shrink-0" />,
                  <MapPin key="mp" className="w-3.5 h-3.5 text-[#00A86B] shrink-0" />,
                ];
                return (
                  <li key={i} className="flex items-start gap-2">
                    {icons[i]}
                    <span className="text-[12px] text-slate-400 leading-snug break-all">{item.label}</span>
                  </li>
                );
              })}
            </ul>
          </div>
        </div>

        {/* Divider */}
        <div className="mx-6 h-px bg-slate-700/50" />

        {/* Bottom bar — social icons + copyright */}
        <div className="bg-slate-900/80 border-t border-slate-700/50 px-6 pt-5 pb-0">
          {/* Social icons row - Larger icons */}
          <div className="flex items-center justify-center gap-3 mb-2">
            {[
              { bg: "bg-[#25D366]", href: "https://wa.me/251911123456", icon: <svg className="w-6 h-6" viewBox="0 0 24 24" fill="currentColor"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" /></svg> },
              { bg: "bg-[#24A1DE]", href: "#", icon: <svg className="w-6 h-6" viewBox="0 0 24 24" fill="currentColor"><path d="M12 0C5.373 0 0 5.373 0 12s5.373 12 12 12 12-5.373 12-12S18.627 0 12 0zm5.894 8.221l-1.97 9.28c-.145.658-.537.818-1.084.508l-3-2.21-1.446 1.394c-.14.18-.357.295-.6.295-.002 0-.003 0-.005 0l.213-3.054 5.56-5.022c.242-.213-.054-.334-.373-.121L8.32 13.617l-2.96-.924c-.64-.203-.658-.64.135-.954l11.566-4.458c.538-.196 1.006.128.832.941z" /></svg> },
              { bg: "bg-[#FF0000]", href: "#", icon: <svg className="w-6 h-6" viewBox="0 0 24 24" fill="currentColor"><path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z" /></svg> },
              { bg: "bg-[#010101]", href: "#", icon: <svg className="w-6 h-6" viewBox="0 0 16 16" fill="white"><path d="M9 0h1.98c.144.715.54 1.617 1.235 2.512C12.895 3.389 13.797 4 15 4v2c-1.753 0-3.07-.814-4-1.829V11a5 5 0 1 1-5-5v2a3 3 0 1 0 3 3z" /></svg> },
              { bg: "bg-[#010101]", href: "#", icon: <svg className="w-6 h-6" viewBox="0 0 24 24" fill="white"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" /></svg> },
              { bg: "bg-[#0A66C2]", href: "#", icon: <svg className="w-6 h-6" viewBox="0 0 24 24" fill="white"><path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" /></svg> },
            ].map(({ bg, href, icon }, i) => (
              <a
                key={i}
                href={href}
                target="_blank"
                rel="noopener noreferrer"
                className={`w-12 h-12 rounded-xl flex items-center justify-center text-white hover:scale-110 active:scale-95 transition-transform shadow-lg ${bg}`}
              >
                {icon}
              </a>
            ))}
          </div>

          {/* Copyright - flush with bottom nav */}
          <div className="flex items-center justify-center pt-2 pb-1">
            <p className="text-slate-400 text-xs font-semibold leading-none text-center">
              {f.copyright}
            </p>
          </div>
        </div>
      </div>

      {/* ═══════════════════════════════════════════════
          DESKTOP LAYOUT (>= sm)
      ═══════════════════════════════════════════════ */}
      <div className="hidden sm:block">
        <div className="max-w-7xl mx-auto px-6 sm:px-12 pt-12 pb-12 space-y-12">
          {/* Brand */}
          <div className="flex flex-col items-center text-center space-y-4">
            <div className="flex items-center gap-2">
              <span className="text-2xl font-black tracking-tighter text-[#00A86B] uppercase">MALA</span>
              <span className="text-2xl font-black tracking-tighter !text-slate-100 dark:!text-white uppercase">ZONE</span>
            </div>
            <div className="w-24 h-[1px] bg-[#00A86B]/40" />
          </div>

          {/* 3-column grid */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-8 sm:gap-12 lg:gap-16">
            {/* Column 1 — Ecosystem Zones */}
            <div className="space-y-6">
              <h4 className="!text-slate-100 dark:!text-white font-black text-xs uppercase tracking-[0.2em] border-l-2 border-[#00A86B] pl-3">
                {f.col1Title}
              </h4>
              <ul className="space-y-3.5">
                {f.col1.map((item, i) => (
                  <li key={i}>
                    <a href="#" className="group flex items-center gap-3 text-sm !text-slate-400 hover:!text-[#00A86B] transition-colors duration-200">
                      <item.icon className="h-4 w-4 text-[#00A86B] shrink-0" />
                      <span className="group-hover:translate-x-1 transition-transform duration-200" style={{ color: 'inherit' }}>{item.label}</span>
                    </a>
                  </li>
                ))}
              </ul>
            </div>

            {/* Column 2 — Support */}
            <div className="space-y-6">
              <h4 className="!text-slate-100 dark:!text-white font-black text-xs uppercase tracking-[0.2em] border-l-2 border-[#00A86B] pl-3">
                {f.col2Title}
              </h4>
              <ul className="space-y-3.5">
                {f.col2.map((item, i) => (
                  <li key={i}>
                    <button
                      onClick={() => item.page && onNavigate?.(item.page)}
                      className="group flex items-center gap-3 text-sm !text-slate-400 hover:!text-[#00A86B] transition-colors duration-200 text-left w-full"
                    >
                      <span className="w-1 h-1 rounded-full bg-[#00A86B]/60 shrink-0" />
                      <span className="group-hover:translate-x-1 transition-transform duration-200" style={{ color: 'inherit' }}>{item.label}</span>
                    </button>
                  </li>
                ))}
              </ul>
            </div>

            {/* Column 3 — Contact */}
            <div className="space-y-6">
              <h4 className="!text-slate-100 dark:!text-white font-black text-xs uppercase tracking-[0.2em] border-l-2 border-[#00A86B] pl-3">
                {f.col3Title}
              </h4>
              <ul className="space-y-4">
                {f.col3.map((item, i) => (
                  <li key={i}>
                    <div className="flex items-start gap-3 text-sm !text-slate-400">
                      <span className="w-1 h-1 rounded-full bg-[#00A86B]/60 shrink-0 mt-2" />
                      <span className="leading-relaxed whitespace-pre-line" style={{ color: 'inherit' }}>{item.label}</span>
                    </div>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>

        {/* Bottom copyright band */}
        <div className="bg-slate-900 dark:bg-black border-t border-slate-700/50 dark:border-slate-800/50 px-6 sm:px-12 py-5 transition-colors duration-300">
          <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
            <span className="!text-slate-500 text-[11px] font-bold uppercase tracking-widest text-center sm:text-left">
              {f.copyright}
            </span>

            <div className="flex flex-wrap items-center gap-3.5 pr-0 sm:pr-20">
              {[
                {
                  icon: (
                    <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
                      <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
                    </svg>
                  ),
                  name: "WhatsApp",
                  bg: "bg-[#25D366]"
                },
                { icon: <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor"><path d="M12 0C5.373 0 0 5.373 0 12s5.373 12 12 12 12-5.373 12-12S18.627 0 12 0zm5.894 8.221l-1.97 9.28c-.145.658-.537.818-1.084.508l-3-2.21-1.446 1.394c-.14.18-.357.295-.6.295-.002 0-.003 0-.005 0l.213-3.054 5.56-5.022c.242-.213-.054-.334-.373-.121L8.32 13.617l-2.96-.924c-.64-.203-.658-.64.135-.954l11.566-4.458c.538-.196 1.006.128.832.941z" /></svg>, name: "Telegram", bg: "bg-[#24A1DE]" },
                {
                  icon: (
                    <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
                      <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z" />
                    </svg>
                  ),
                  name: "YouTube",
                  bg: "bg-[#FF0000]"
                },
                {
                  icon: (
                    <svg className="w-5 h-5" viewBox="0 0 16 16" fill="currentColor">
                      <path d="M9 0h1.98c.144.715.54 1.617 1.235 2.512C12.895 3.389 13.797 4 15 4v2c-1.753 0-3.07-.814-4-1.829V11a5 5 0 1 1-5-5v2a3 3 0 1 0 3 3z" />
                    </svg>
                  ),
                  name: "TikTok",
                  bg: "bg-black",
                  text: "text-white",
                  border: "border border-white/30"
                },
                { icon: <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor"><path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" /></svg>, name: "Facebook", bg: "bg-[#1877F2]" },
                {
                  icon: (
                    <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
                      <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
                    </svg>
                  ),
                  name: "LinkedIn",
                  bg: "bg-[#0A66C2]"
                }
              ].map(({ icon, name, bg, border = "", text = "text-white" }, i) => (
                <a
                  key={i}
                  href="#"
                  className={`group relative w-12 h-12 lg:w-14 lg:h-14 rounded-[18px] lg:rounded-[22px] flex items-center justify-center transition-all duration-300 ease-out hover:bg-[#00A86B] hover:text-black hover:-translate-y-1.5 hover:scale-105 hover:border-transparent hover:shadow-[0_10px_20px_rgba(0,168,107,0.45)] active:scale-95 ${bg} ${border} ${text}`}
                >
                  {icon}
                  <span className="absolute -top-10 left-1/2 -translate-x-1/2 whitespace-nowrap bg-slate-900 text-white text-[10px] font-black uppercase tracking-[0.15em] px-3 py-1.5 rounded-lg border border-slate-700/60 opacity-0 scale-75 group-hover:opacity-100 group-hover:scale-100 transition-all duration-200 pointer-events-none shadow-md">
                    {name}
                  </span>
                </a>
              ))}
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
