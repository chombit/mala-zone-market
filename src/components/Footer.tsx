/**
 * Footer.tsx
 * Malazone.com — Luxury Corporate Stack & Compliance
 * © 2026 Malazone Technologies PLC
 */

import React from "react";
import {
  Facebook,
  Instagram,
  Send,
  Video,
  ChevronRight
} from "lucide-react";
import { useLanguage } from "@/contexts/ZoneLanguageContext";

const footerTranslations = {
  en: {
    col1Title: "Ecosystem Zones",
    col1Item1: "🏠 Property Zone",
    col1Item2: "🚗 Motors & EV",
    col1Item3: "✨ Rooms & Halls",
    col1Item4: "🎵 Ceremony Hub",
    col1Item5: "🚜 Heavy Machinery",
    col2Title: "Mala-Agents",
    col2Item1: "👷 Gig-Economy Hub",
    col2Item2: "📱 Onboard as Agent",
    col2Item3: "💰 Telebirr Payouts",
    col3Title: "Corporate Info",
    col3Item1: "About Malazone",
    col3Item2: "Contact Support",
    col3Item3: "Privacy Policy",
    founderSignature: "Luwa Tesemma Kakawo — Founder & CEO",
    copyright: "© 2026 Malazone Technologies PLC. All Rights Reserved."
  },
  amharic: {
    col1Title: "የንግድ ዞኖች",
    col1Item1: "🏠 መሬትና ቤት",
    col1Item2: "🚗 መኪናና ኤሌክትሪክ",
    col1Item3: "✨ አዳራሽና ጌስት ሃውስ",
    col1Item4: "🎵 ልብስና ዲጄ ኪራይ",
    col1Item5: "🚜 ከባድ ማሽነሪዎች",
    col2Title: "የመላ-ወኪሎች",
    col2Item1: "👷 የስራ ዕድል ማዕከል",
    col2Item2: "📱 ወኪል ለመሆን",
    col2Item3: "💰 የቴሌብር ክፍያዎች",
    col3Title: "ስለ ድርጅቱ",
    col3Item1: "ስለ መላዞን",
    col3Item2: "ደንበኞች አገልግሎት",
    col3Item3: "የግል ምስጢር ጥበቃ",
    founderSignature: "ሉዋ ተሰማ ካካዎ — ዋና ስራ አስፈፃሚ",
    copyright: "© ፪ሺ፲፰ መላዞን ቴክኖሎጂስ ኃ/የተ/የግል ማህበር። መብቱ በህግ የተጠበቀ ነው።"
  }
};

const Footer: React.FC = () => {
  const { language } = useLanguage();
  const f = footerTranslations[language as keyof typeof footerTranslations];

  return (
    <footer className="bg-slate-50 dark:bg-slate-950 pt-20 pb-10 px-6 sm:px-12 relative overflow-hidden transition-colors duration-300">
      {/* ── Top Border Razor Divider */}
      <div className="absolute top-0 left-0 w-full h-[1px] bg-slate-200 dark:bg-white/5" />
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-1/3 h-[1px] bg-gradient-to-r from-transparent via-emerald-500/20 dark:via-green-500/20 to-transparent" />

      <div className="max-w-7xl mx-auto space-y-16">

        {/* ── Top Section: Founder Branding */}
        <div className="flex flex-col items-center justify-center text-center space-y-4">
          <div className="flex items-center gap-2 mb-2">
            <span className="text-2xl font-black tracking-tighter text-malazone-green uppercase">MALA</span>
            <span className="text-2xl font-black tracking-tighter text-slate-900 dark:text-white uppercase transition-colors duration-300">ZONE</span>
          </div>
          <div className="w-24 h-[1px] bg-malazone-green/30" />
          {/* Founder Signature */}
          <p className="text-[11px] font-bold tracking-[0.15em] text-slate-500 dark:text-slate-500 uppercase mt-2">
            {f.founderSignature}
          </p>
        </div>

        {/* ── Center Link Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-16 lg:gap-24">
          {/* Column 1: Ecosystem Zones */}
          <div className="space-y-8">
            <h4 className="text-slate-900 dark:text-white font-black text-[11px] uppercase tracking-[0.2em] border-l-2 border-malazone-green pl-4 transition-colors duration-300">
              {f.col1Title}
            </h4>
            <ul className="space-y-5">
              {[f.col1Item1, f.col1Item2, f.col1Item3, f.col1Item4, f.col1Item5].map((item, i) => (
                <li key={i}>
                  <a href="#" className="text-slate-600 dark:text-slate-400 hover:text-malazone-green text-sm font-medium transition-colors flex items-center gap-2 group">
                    <ChevronRight className="w-3 h-3 opacity-0 -ml-4 group-hover:opacity-100 group-hover:ml-0 transition-all text-malazone-green" />
                    {item}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Column 2: Mala-Agents */}
          <div className="space-y-8">
            <h4 className="text-slate-900 dark:text-white font-black text-[11px] uppercase tracking-[0.2em] border-l-2 border-malazone-green pl-4 transition-colors duration-300">
              {f.col2Title}
            </h4>
            <ul className="space-y-5">
              {[f.col2Item1, f.col2Item2, f.col2Item3].map((item, i) => (
                <li key={i}>
                  <a href="#" className="text-slate-600 dark:text-slate-400 hover:text-malazone-green text-sm font-medium transition-colors flex items-center gap-2 group">
                    <ChevronRight className="w-3 h-3 opacity-0 -ml-4 group-hover:opacity-100 group-hover:ml-0 transition-all text-malazone-green" />
                    {item}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Column 3: Corporate Info */}
          <div className="space-y-8">
            <h4 className="text-slate-900 dark:text-white font-black text-[11px] uppercase tracking-[0.2em] border-l-2 border-malazone-green pl-4 transition-colors duration-300">
              {f.col3Title}
            </h4>
            <ul className="space-y-5">
              {[f.col3Item1, f.col3Item2, f.col3Item3].map((item, i) => (
                <li key={i}>
                  <a href="#" className="text-slate-600 dark:text-slate-400 hover:text-malazone-green text-sm font-medium transition-colors flex items-center gap-2 group">
                    <ChevronRight className="w-3 h-3 opacity-0 -ml-4 group-hover:opacity-100 group-hover:ml-0 transition-all text-malazone-green" />
                    {item}
                  </a>
                </li>
              ))}
            </ul>
          </div>
        </div>


        {/* ── Bottom Meta Stacking */}
        <div className="pt-12 border-t border-slate-200 dark:border-white/5 flex flex-col md:flex-row items-center justify-between gap-8 transition-colors duration-300">
          <div className="text-slate-500 dark:text-slate-600 text-[11px] font-bold uppercase tracking-widest text-center md:text-left leading-relaxed">
            {f.copyright}
          </div>

          <div className="flex items-center gap-6">
            {[
              { Icon: Facebook, href: "#" },
              { Icon: Send, href: "#" }, // Telegram alternative
              { Icon: Instagram, href: "#" },
              { Icon: Video, href: "#" } // TikTok alternative
            ].map(({ Icon, href }, i) => (
              <a
                key={i}
                href={href}
                className="w-10 h-10 rounded-full bg-slate-100 dark:bg-white/5 border border-slate-200 dark:border-white/5 flex items-center justify-center text-slate-500 dark:text-slate-400 hover:text-emerald-600 dark:hover:text-green-500 hover:border-emerald-500/30 dark:hover:border-green-500/30 transition-all"
              >
                <Icon className="w-4 h-4" />
              </a>
            ))}
          </div>
        </div>

        {/* ── Absolute CEO Authority Anchor — Bilingual ──────── */}
        <div className="pt-8 mt-4 text-center">
          <p className="text-[10px] sm:text-xs font-bold tracking-[0.2em] uppercase transition-colors duration-300 text-slate-500 dark:text-slate-500">
            Luwa Tesemma Kakawo — Founder &amp; CEO / ሉዋ ተሰማ ካካዎ — ዋና ስራ አስፈፃሚ
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
