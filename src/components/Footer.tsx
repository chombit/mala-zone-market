import React from "react";
import {
  Building2,
  Car,
  DoorOpen,
  Music,
  Tractor,
  Briefcase,
  UserPlus,
  Wallet,
  Info,
  Headphones,
  Shield,
  Facebook,
  Send,
  Smartphone
} from "lucide-react";
import { useLanguage } from "@/contexts/ZoneLanguageContext";

type PageView = "home" | "about" | "contact" | "privacy";

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
    col2Title: "Mala-Agents",
    col2: [
      { icon: Briefcase, label: "Gig-Economy Hub" },
      { icon: UserPlus, label: "Onboard as Agent" },
      { icon: Wallet, label: "Secure Digital Payouts" }
    ],
    col3Title: "Corporate Info",
    col3: [
      { icon: Info, label: "About Malazone", page: "about" as PageView },
      { icon: Headphones, label: "Contact Support", page: "contact" as PageView },
      { icon: Shield, label: "Privacy Policy", page: "privacy" as PageView }
    ],
    col4Title: "Quick Support",
    col4: [
      { icon: Headphones, label: "24/7 Helpline" },
      { icon: Send, label: "Live Chat" },
      { icon: Wallet, label: "Payment Support" }
    ],
    copyright: "© 2026 Malazone Technologies PLC. All Rights Reserved."
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
    col2Title: "የመላ-ወኪሎች",
    col2: [
      { icon: Briefcase, label: "የስራ ዕድል ማዕከል" },
      { icon: UserPlus, label: "ወኪል ለመሆን" },
      { icon: Wallet, label: "አስተማማኝ ክፍያዎች" }
    ],
    col3Title: "ስለ ድርጅቱ",
    col3: [
      { icon: Info, label: "ስለ መላዞን", page: "about" as PageView },
      { icon: Headphones, label: "ደንበኞች አገልግሎት", page: "contact" as PageView },
      { icon: Shield, label: "የግል ምስጢር ጥበቃ", page: "privacy" as PageView }
    ],
    col4Title: "ፈጣን ድጋፍ",
    col4: [
      { icon: Headphones, label: "የ24/7 የስልክ መስመር" },
      { icon: Send, label: "የቀጥታ ውይይት" },
      { icon: Wallet, label: "የክፍያ ድጋፍ" }
    ],
    copyright: "© 2026 Malazone Technologies PLC. All Rights Reserved."
  }
};

interface FooterProps {
  onNavigate?: (page: PageView) => void;
}

const Footer: React.FC<FooterProps> = ({ onNavigate }) => {
  const { language, t } = useLanguage();
  const f = footerTranslations[language as keyof typeof footerTranslations];

  return (
    <footer className="bg-slate-800 dark:bg-slate-950 pt-0 pb-0 relative overflow-hidden transition-colors duration-300">
      {/* 2px solid emerald brand top border */}
      <div className="h-[2px] w-full bg-[#00A86B]" />

      <div className="max-w-7xl mx-auto px-6 sm:px-12 py-16 space-y-16">
        {/* Brand */}
        <div className="flex flex-col items-center text-center space-y-4">
          <div className="flex items-center gap-2">
            <span className="text-2xl font-black tracking-tighter text-[#00A86B] uppercase">MALA</span>
            <span className="text-2xl font-black tracking-tighter !text-slate-100 dark:!text-white uppercase">ZONE</span>
          </div>
          <div className="w-24 h-[1px] bg-[#00A86B]/40" />
        </div>

        {/* 4-column grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-12 lg:gap-8">
          {/* Column 1 */}
          <div className="space-y-6">
            <h4 className="!text-slate-100 dark:!text-white font-black text-xs uppercase tracking-[0.2em] border-l-2 border-[#00A86B] pl-3">
              {f.col1Title}
            </h4>
            <ul className="space-y-4">
              {f.col1.map((item, i) => (
                <li key={i}>
                  <a href="#" className="group flex items-center gap-3 text-sm !text-slate-400 dark:!text-slate-400 hover:!text-white transition-colors">
                    <item.icon className="h-4 w-4 text-[#00A86B] shrink-0" />
                    <span className="group-hover:translate-x-0.5 transition-transform" style={{ color: 'inherit' }}>{item.label}</span>
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Column 2 */}
          <div className="space-y-6">
            <h4 className="!text-slate-100 dark:!text-white font-black text-xs uppercase tracking-[0.2em] border-l-2 border-[#00A86B] pl-3">
              {f.col2Title}
            </h4>
            <ul className="space-y-4">
              {f.col2.map((item, i) => (
                <li key={i}>
                  <a href="#" className="group flex items-center gap-3 text-sm !text-slate-400 dark:!text-slate-400 hover:!text-white transition-colors">
                    <item.icon className="h-4 w-4 text-[#00A86B] shrink-0" />
                    <span className="group-hover:translate-x-0.5 transition-transform" style={{ color: 'inherit' }}>{item.label}</span>
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Column 3 */}
          <div className="space-y-6">
            <h4 className="!text-slate-100 dark:!text-white font-black text-xs uppercase tracking-[0.2em] border-l-2 border-[#00A86B] pl-3">
              {f.col3Title}
            </h4>
            <ul className="space-y-4">
              {f.col3.map((item, i) => (
                <li key={i}>
                  <button
                    onClick={() => onNavigate?.(item.page)}
                    className="group flex items-center gap-3 text-sm !text-slate-400 dark:!text-slate-400 hover:!text-white transition-colors text-left"
                  >
                    <item.icon className="h-4 w-4 text-[#00A86B] shrink-0" />
                    <span className="group-hover:translate-x-0.5 transition-transform" style={{ color: 'inherit' }}>{item.label}</span>
                  </button>
                </li>
              ))}
            </ul>
          </div>

          {/* Column 4 */}
          <div className="space-y-6">
            <h4 className="!text-slate-100 dark:!text-white font-black text-xs uppercase tracking-[0.2em] border-l-2 border-[#00A86B] pl-3">
              {f.col4Title}
            </h4>
            <ul className="space-y-4">
              {f.col4.map((item, i) => (
                <li key={i}>
                  <a href="#" className="group flex items-center gap-3 text-sm !text-slate-400 dark:!text-slate-400 hover:!text-white transition-colors">
                    <item.icon className="h-4 w-4 text-[#00A86B] shrink-0" />
                    <span className="group-hover:translate-x-0.5 transition-transform" style={{ color: 'inherit' }}>{item.label}</span>
                  </a>
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

          <div className="flex items-center gap-3.5 pr-20">
            {[
              {
                id: "social.whatsapp",
                icon: (
                  <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
                  </svg>
                ),
                name: "WhatsApp",
                bg: "bg-[#25D366]"
              },
              { id: "social.telegram", icon: <Send className="w-5 h-5" />, name: "Telegram", bg: "bg-[#24A1DE]" },
              {
                id: "social.youtube",
                icon: (
                  <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z" />
                  </svg>
                ),
                name: "YouTube",
                bg: "bg-[#FF0000]"
              },
              {
                id: "social.tiktok",
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
              { id: "social.facebook", icon: <Facebook className="w-5 h-5" />, name: "Facebook", bg: "bg-[#1877F2]" },
              {
                id: "social.linkedin",
                icon: (
                  <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
                  </svg>
                ),
                name: "LinkedIn",
                bg: "bg-[#0A66C2]"
              }
            ].map(({ id, icon, name, bg, border = "", text = "text-white" }, i) => {
              const link = id ? t(id as any) : undefined;
              const hasLink = typeof link === "string" && link !== id && link.trim() !== "";
              const href = hasLink ? link : "#";

              return (
                <a
                  key={i}
                  href={href}
                  target={hasLink ? "_blank" : "_self"}
                  rel={hasLink ? "noopener noreferrer" : ""}
                  className={`group relative w-14 h-14 rounded-[22px] flex items-center justify-center transition-all duration-300 ease-out hover:bg-[#00A86B] hover:text-black hover:-translate-y-1.5 hover:scale-105 hover:border-transparent hover:shadow-[0_10px_20px_rgba(0,168,107,0.45)] active:scale-95 ${bg} ${border} ${text}`}
                >
                  {icon}
                  <span className="absolute -top-10 left-1/2 -translate-x-1/2 whitespace-nowrap bg-slate-900 text-white text-[10px] font-black uppercase tracking-[0.15em] px-3 py-1.5 rounded-lg border border-slate-700/60 opacity-0 scale-75 group-hover:opacity-100 group-hover:scale-100 transition-all duration-200 pointer-events-none shadow-md">
                    {name}
                  </span>
                </a>
              );
            })}
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
