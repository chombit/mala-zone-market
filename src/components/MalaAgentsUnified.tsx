import React, { useState } from 'react';
import { ArrowRight, Sparkles, ShoppingBag, ShieldCheck, Zap, Play, Building2, Car, Hotel, PartyPopper, Tractor, Smartphone, PhoneCall, X } from 'lucide-react';
import { useLanguage } from '@/contexts/ZoneLanguageContext';

export function MalaAgentsUnified() {
  const { language } = useLanguage();
  const currentGlobalLang = language === 'amharic' ? 'am' : 'en';

  const [isPlaying, setIsPlaying] = useState(false);
  const [hoveredLabel, setHoveredLabel] = useState<{ am: string; en: string } | null>(null);

  // 🌐 EXHAUSTIVE DUAL-LANGUAGE DIRECT P2P DICTIONARY
  const t = {
    am: {
      badgeZone: "✨ ቀጥተኛና ደላላ-አልባ ይፋዊ ግብይት",
      heading: "ያለ ደላላ በቀጥታ ይገበያዩ!",
      subMotto: "ቤት፣ መኪና፣ ሆቴል፣ የሰርግ ዕቃዎች፣ ከባድ ማሽነሪ እና ኤሌክትሮኒክስዎን ያለምንም የደላላ ጣልቃ-ገብነት በቀጥታ ለገዢዎች የሚያቀርቡበት ታማኝ የዲጂታል ማዕከል",
      mainBody: "malazone ንብረትዎን (ቤት፣ መኪና፣ ሆቴል፣ የሰርግ ዕቃዎች፣ ከባድ ማሽነሪ ወይም ኤሌክትሮኒክስ) ያለምንም የደላላ ጣልቃ-ገብነት በቀጥታ ለአገር ውስጥና ለውጭ ሀገር (Diaspora) ገዢዎች የሚያቀርቡበት የታመነ ይፋዊ መድረክ ነው። ንብረትዎን በሕጋዊ መንገድ በመመዝገብ በቀጥታ ከባለገንዘብ ገዢዎች ጋር ያለምንም ውዥንብር ይደራደሩ፤ ግብይትዎን በፍጥነት ያጠናቅቁ!",
      card1Title: "🛒 ለንብረት ባለቤቶች",
      card1Desc: "ቤት፣ መኪና፣ ሆቴል፣ የሰርግ ዕቃዎች፣ ማሽነሪና ኤሌክትሮኒክስዎን በመመዝገብ በቀጥታ ለአገር ውስጥና ለዲያስፖራ ገዢዎች ማቅረብ",
      card2Title: "🛡️ ፍጹም ሕጋዊና ታማኝ",
      card2Desc: "ከከተማ ማዘጋጃ ቤቶች የይዞታ ሰነዶች እና ከትራንስፖርት ቢሮዎች መዛግብት ጋር የተቆራኘ አስተማማኝ አሰራር",
      card3Title: "⚡ ፈጣንና ቀጥተኛ ግብይት",
      card3Desc: "ከባለቤቶች ጋር በቀጥታ በመገናኘት ግብይትዎን ያለምንም ውዥንብር በፍጥነት ማጠናቀቅ",
      btnCTA: "ንብረትዎን አሁኑኑ ይመዝግቡ",
      socialProof: "ባለቤቶች ንብረታቸውን በስኬት መዝግበዋል",
      videoTitle: "የአጠቃቀም ማብሪያ ቪዲዮ",
      videoSub: "MALAZONE USER GUIDE",
      hoverPlaceholder: "በአዶዎቹ ላይ በማሳረፍ ዝርዝሩን ይመልከቱ (HOVER OVER ICONS)",
      modalTitle: "የማላዞን ሙሉ ሲስተም አጠቃቀም ማብራሪያ ቪዲዮ"
    },
    en: {
      badgeZone: "✨ Direct & Broker-Free Official Trade",
      heading: "Trade Directly Without Brokers!",
      subMotto: "The trusted digital hub to showcase your houses, cars, hotels, wedding gear, heavy machinery, and electronics directly to verified buyers.",
      mainBody: "malazone is the trusted platform to list your assets (real estate, vehicles, hotels, wedding gear, heavy equipment, or smart electronics) directly to local and international diaspora buyers with zero middleman friction. Register your property securely, negotiate directly with genuine buyers, and execute your transactions with absolute transparency.",
      card1Title: "🛒 For Asset Owners",
      card1Desc: "List your houses, cars, hotels, wedding gear, machinery, and electronics and connect directly with verified global buyers.",
      card2Title: "🛡️ Institutional Trust",
      card2Desc: "Fully secure operations synchronized directly with regional transit and municipality registries.",
      card3Title: "⚡ Rapid Peer-to-Peer Execution",
      card3Desc: "Connect directly with verified owners and finalize your business transactions with zero confusion.",
      btnCTA: "Register Your Property Now",
      socialProof: "Property Owners Registered Successfully",
      videoTitle: "malazone User Guide",
      videoSub: "MALAZONE USER GUIDE",
      hoverPlaceholder: "Hover over the outer icons to preview platform features",
      modalTitle: "malazone Official System Walkthrough Video"
    }
  }[currentGlobalLang];

  const formatText = (text: string, hoverColorClass = '') => {
    return text.split('malazone').map((part, index, array) => (
      <React.Fragment key={index}>
        {part}
        {index < array.length - 1 && <span className={`text-[#00A86B] ${hoverColorClass} font-bold lowercase tracking-normal transition-colors duration-300`}>malazone</span>}
      </React.Fragment>
    ));
  };

  // The 8 Orbiting Icons mapping Malazone Ecosystem
  const malazoneOrbits = [
    { id: 1, icon: <Building2 className="w-5 h-5" />, am: 'የቤትና ይዞታ ዞን (Property Zone) — "እንዴት በቀጥታ መግዛትና መሸጥ እንደሚቻል"', en: 'Property & Real Estate Matrix — How to directly buy & sell properties', pos: 'top-0 left-1/2 -translate-x-1/2 -translate-y-1/2' },
    { id: 2, icon: <Car className="w-5 h-5" />, am: 'የመኪናና ኤሌክትሪክ ዞን (Motors Zone) — "ደላላ ሳይኖር የሾውሩም መኪናዎችን ማሰስ"', en: 'Motors & EV Vehicles — Explore verified vehicle listings without brokers', pos: 'top-[14.64%] right-[14.64%] translate-x-1/2 -translate-y-1/2' },
    { id: 3, icon: <Hotel className="w-5 h-5" />, am: 'የጉዞና ማረፊያ ዞን (Stay & Halls) — "ለእንግዶችና ለቱሪስቶች የተዘጋጁ ማረፊያዎች"', en: 'Rooms, Guest Houses & Events — Accommodations curated for guests', pos: 'top-1/2 right-0 translate-x-1/2 -translate-y-1/2' },
    { id: 4, icon: <PartyPopper className="w-5 h-5" />, am: 'የክብረ-በዓላት ዞን (Ceremony Hub) — "የሰርግ ዕቃዎችና የድምፅ ሲስተም ኪራይ"', en: 'Wedding Materials & Audio Systems — Seamless asset rental pathways', pos: 'bottom-[14.64%] right-[14.64%] translate-x-1/2 translate-y-1/2' },
    { id: 5, icon: <Tractor className="w-5 h-5" />, am: 'የከባድ ማሽነሪዎች ዞን (Machinery Zone) — "የኮንስትራክሽን ማሽኖችን በቀላሉ ማከራየት"', en: 'Heavy Machineries — Secure leasing and contracting for heavy equipment', pos: 'bottom-0 left-1/2 -translate-x-1/2 translate-y-1/2' },
    { id: 6, icon: <Smartphone className="w-5 h-5" />, am: 'የኤሌክትሮኒክስ ዞን (Electronics Zone) — "ስማርት ኤሌክትሮኒክስ እና ቴክኖሎጂ ምርቶች"', en: 'Smart Electronics & Hardware Hub — Latest gadgets and tech products', pos: 'bottom-[14.64%] left-[14.64%] -translate-x-1/2 translate-y-1/2' },
    { id: 7, icon: <ShieldCheck className="w-5 h-5" />, am: 'የቀጥታ ተጠቃሚዎች ገበያ (P2P Market) — "ሻጭና ገዢን ያለአስገዳጅ በቀጥታ ማገናኛ"', en: 'Direct Peer-to-Peer Customer Link — Bypass middleman friction cleanly', pos: 'top-1/2 left-0 -translate-x-1/2 -translate-y-1/2' },
    { id: 8, icon: <PhoneCall className="w-5 h-5" />, am: 'የቀጥታ ስልክና ጥሪ (Support Matrix) — "የባለቤቱን ስልክና ቴሌግራም በቀጥታ ማግኛ"', en: 'Direct Owner Call & Telegram Support — Immediate gateway to secure support', pos: 'top-[14.64%] left-[14.64%] -translate-x-1/2 -translate-y-1/2' },
  ];

  return (
    <section className="bg-white text-slate-900 pt-10 pb-20 px-6 sm:px-12 lg:px-20 w-full text-left font-sans antialiased select-none overflow-hidden">
      <div className="max-w-[1300px] mx-auto grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16 items-center">

        {/* 🟢 LEFT COLUMN: Content & Value Propositions */}
        <div className="lg:col-span-6 space-y-6">

          <div className="flex items-center space-x-2">
            <span className="text-[10px] sm:text-xs font-black bg-emerald-50 text-[#00A86B] border border-emerald-200/40 px-3 py-1.5 rounded-full uppercase tracking-wider flex items-center gap-1.5">
              <Sparkles className="size-3.5 text-[#00A86B] animate-pulse" />
              <span>{t.badgeZone}</span>
            </span>
          </div>

          <div className="space-y-2">
            <h2 className="text-4xl sm:text-5xl font-black text-[#00A86B] tracking-tight leading-none">
              {t.heading}
            </h2>
            <p className="text-xs sm:text-sm font-black text-slate-900 tracking-wide leading-relaxed">
              {t.subMotto}
            </p>
          </div>

          <p className="text-xs sm:text-sm text-slate-600 font-medium leading-relaxed">
            {t.mainBody}
          </p>

          {/* 3ኛ አምድ የቅንጦት ካርዶች */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-2">
            <div className="flex flex-col justify-between bg-slate-50 border border-slate-200/80 p-5 rounded-2xl shadow-sm hover:border-[#00A86B]/30 hover:bg-white transition-all duration-300 h-full">
              <ShoppingBag className="size-5 text-[#00A86B] shrink-0 mb-3" />
              <div className="space-y-1">
                <h4 className="text-xs font-black text-slate-900 leading-tight">{t.card1Title}</h4>
                <p className="text-[11px] font-bold text-slate-500 leading-relaxed">{t.card1Desc}</p>
              </div>
            </div>
            <div className="flex flex-col justify-between bg-slate-50 border border-slate-200/80 p-5 rounded-2xl shadow-sm hover:border-[#00A86B]/30 hover:bg-white transition-all duration-300 h-full">
              <ShieldCheck className="size-5 text-[#00A86B] shrink-0 mb-3" />
              <div className="space-y-1">
                <h4 className="text-xs font-black text-slate-900 leading-tight">{t.card2Title}</h4>
                <p className="text-[11px] font-bold text-slate-500 leading-relaxed">{t.card2Desc}</p>
              </div>
            </div>
            <div className="flex flex-col justify-between bg-slate-50 border border-slate-200/80 p-5 rounded-2xl shadow-sm hover:border-[#00A86B]/30 hover:bg-white transition-all duration-300 h-full">
              <Zap className="size-5 text-[#00A86B] shrink-0 mb-3" />
              <div className="space-y-1">
                <h4 className="text-xs font-black text-slate-900 leading-tight">{t.card3Title}</h4>
                <p className="text-[11px] font-bold text-slate-500 leading-relaxed">{t.card3Desc}</p>
              </div>
            </div>
          </div>

          {/* ⚡ CTA & SOCIAL PROOF */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 pt-4 border-t border-slate-100">
            <button
              className="bg-[#00A86B] hover:bg-emerald-600 text-black font-black text-xs uppercase tracking-wider px-7 py-4 rounded-2xl transition-all shadow-md shadow-emerald-500/10 flex items-center space-x-2 group cursor-pointer transform hover:-translate-y-0.5 active:translate-y-0"
            >
              <span>{t.btnCTA}</span>
              <ArrowRight className="size-4 group-hover:translate-x-1.5 transition-transform duration-300" />
            </button>

            <div className="bg-slate-50 border border-slate-200 px-4 py-3 rounded-2xl shadow-inner flex items-center gap-2 text-[11px] font-black text-slate-400 uppercase tracking-widest">
              <span className="text-[#00A86B] font-bold">✓</span>
              <span>{t.socialProof}</span>
            </div>
          </div>

        </div>

        {/* 🟢 RIGHT COLUMN: The Orbit UI */}
        <div className="lg:col-span-6 flex flex-col items-center justify-center relative w-full pt-10 lg:pt-0">

          <div className="relative w-[260px] h-[260px] sm:w-[340px] sm:h-[340px] flex items-center justify-center">

            {/* Outer rings (Dashed borders) */}
            <div className="absolute inset-[-25px] sm:inset-[-30px] rounded-full border-[1px] border-dashed border-[#00A86B]/15 animate-[spin_240s_linear_infinite_reverse]"></div>
            <div className="absolute inset-0 rounded-full border-[1.5px] border-dashed border-[#00A86B]/20 animate-[spin_120s_linear_infinite]"></div>
            <div className="absolute inset-[40px] sm:inset-[45px] rounded-full border-[1px] border-dashed border-[#00A86B]/15 animate-[spin_180s_linear_infinite_reverse]"></div>

            {/* Orbiting Icons */}
            {malazoneOrbits.map((item) => (
              <div
                key={item.id}
                onMouseEnter={() => setHoveredLabel({ am: item.am, en: item.en })}
                onMouseLeave={() => setHoveredLabel(null)}
                className={`
                  absolute ${item.pos} w-[40px] h-[40px] sm:w-[48px] sm:h-[48px] rounded-full bg-white dark:bg-slate-900 
                  border border-slate-100 dark:border-slate-800 text-[#00A86B] flex items-center justify-center 
                  shadow-[0_4px_20px_rgba(0,0,0,0.06)] cursor-pointer
                  transition-[transform,background-color,box-shadow,color,border-color] duration-300 ease-out
                  hover:bg-[#00A86B] hover:text-white hover:scale-110 hover:border-transparent
                  hover:shadow-[0_0_24px_rgba(0,168,107,0.45)] group z-20
                  will-change-transform
                `}
              >
                {item.icon}
              </div>
            ))}

            {/* Pulsing Central Play Trigger Box */}
            <div className="absolute inset-0 m-auto w-[160px] h-[160px] sm:w-[220px] sm:h-[220px] rounded-full flex items-center justify-center z-30 pointer-events-none">
              <div className="absolute inset-0 rounded-full border-2 border-[#00A86B]/40 animate-ping z-0 pointer-events-none" style={{ animationDuration: '3s' }} />
              <div className="absolute inset-2 sm:inset-4 rounded-full border border-[#00A86B]/30 animate-ping z-0 pointer-events-none" style={{ animationDuration: '3s', animationDelay: '1.5s' }} />
              <button
                onClick={() => setIsPlaying(true)}
                className="relative w-full h-full rounded-full bg-[#1e293b] bg-[radial-gradient(circle_at_40%_35%,#1e293b,#0f172a)] hover:bg-none hover:bg-[#00A86B] text-white flex flex-col items-center justify-center shadow-[0_15px_50px_rgba(15,23,42,0.4),inset_0_0_40px_rgba(0,0,0,0.5)] hover:scale-[1.02] hover:shadow-[0_0_80px_rgba(0,168,107,0.4),inset_0_0_40px_rgba(0,0,0,0.2)] transition-all duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] cursor-pointer group border-[1px] border-white/5 hover:border-transparent z-10 pointer-events-auto"
              >
                {/* Green Play Button (Inverts to white on hover) */}
                <div className="w-[56px] h-[56px] sm:w-[70px] sm:h-[70px] rounded-full bg-gradient-to-b from-[#00A86B] to-[#059669] group-hover:from-white group-hover:to-slate-50 flex items-center justify-center shadow-[0_4px_30px_rgba(0,168,107,0.5)] group-hover:shadow-[0_4px_30px_rgba(255,255,255,0.4)] mb-2 sm:mb-3 group-hover:scale-110 transition-all duration-500 ease-[cubic-bezier(0.16,1,0.3,1)]">
                  <Play className="w-[24px] h-[24px] sm:w-[32px] sm:h-[32px] fill-white text-white group-hover:fill-[#00A86B] group-hover:text-[#00A86B] ml-1 transition-colors duration-300" />
                </div>
                <p className="text-[#00A86B] group-hover:text-white font-black text-xs sm:text-base tracking-wide mb-0.5 transition-colors duration-300">{formatText(t.videoTitle, 'group-hover:text-white')}</p>
                <p className="text-[#00A86B]/70 group-hover:text-white/90 font-bold text-[6px] sm:text-[8px] tracking-[0.15em] sm:tracking-[0.2em] uppercase transition-colors duration-300">{formatText(t.videoSub, 'group-hover:text-white/90')}</p>
              </button>
            </div>

          </div>

          {/* Interactive Hover Metadata Box */}
          <div className="h-[60px] mt-12 sm:mt-16 w-full flex justify-center items-center">
            {hoveredLabel ? (
              <div className="text-center animate-in fade-in slide-in-from-bottom-2 duration-200">
                <div className="inline-flex items-center gap-2 mb-1">
                  <Sparkles className="w-3.5 h-3.5 text-[#00A86B]" />
                  <p className="text-sm font-black text-[#00A86B]">{currentGlobalLang === 'am' ? hoveredLabel.am : hoveredLabel.en}</p>
                </div>
                <p className="text-xs font-bold text-malazone-navy dark:text-slate-300">{currentGlobalLang === 'am' ? hoveredLabel.en : hoveredLabel.am}</p>
              </div>
            ) : (
              <div className="text-center flex items-center justify-center gap-2 animate-in fade-in duration-300">
                <Sparkles className="w-4 h-4 text-[#00A86B]/60" />
                <p className="text-[13px] font-bold italic text-malazone-navy dark:text-slate-400">
                  {t.hoverPlaceholder}
                </p>
              </div>
            )}
          </div>

        </div>
      </div>

      {/* ── World-Class Premium Video Modal ── */}
      {isPlaying && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-8 animate-in fade-in duration-300" onClick={() => setIsPlaying(false)}>

          {/* Glassmorphic Background Blur */}
          <div className="absolute inset-0 bg-slate-950/70 backdrop-blur-xl"></div>

          <div className="relative w-full max-w-6xl aspect-video bg-[#0B1120] rounded-[2rem] overflow-hidden shadow-[0_0_120px_rgba(0,168,107,0.15)] border border-white/10 flex flex-col animate-in zoom-in-95 duration-300" onClick={e => e.stopPropagation()}>

            {/* Header / Top Bar */}
            <div className="absolute top-0 inset-x-0 h-28 bg-gradient-to-b from-black/80 to-transparent z-20 flex justify-between items-start p-6 sm:p-8 pointer-events-none">
              <div>
                <h3 className="text-white text-xl sm:text-3xl font-black tracking-wide drop-shadow-md">{t.modalTitle}</h3>
                <p className="text-emerald-400/90 font-semibold text-sm sm:text-base drop-shadow-sm mt-1">{currentGlobalLang === 'am' ? 'የማላዞን ይፋዊ መመሪያ' : 'Official Malazone Guide'}</p>
              </div>
              <button
                onClick={() => setIsPlaying(false)}
                className="pointer-events-auto bg-white/10 hover:bg-white/20 text-white backdrop-blur-md px-5 py-2.5 rounded-full flex items-center gap-2 font-bold text-sm cursor-pointer transition-all hover:scale-105 active:scale-95 border border-white/5 shadow-lg"
              >
                <span>{currentGlobalLang === 'am' ? 'ዝጋ (Close)' : 'Close'}</span>
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Faux Cinematic Video Player Interface */}
            <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,#0f172a_0%,#020617_100%)] flex items-center justify-center overflow-hidden">

              {/* Premium Pulsing Play Button */}
              <div className="relative z-10 w-24 h-24 sm:w-32 sm:h-32 rounded-full flex items-center justify-center cursor-pointer group/play">
                <div className="absolute inset-0 bg-[#00A86B] rounded-full animate-ping opacity-20 group-hover/play:opacity-40 transition-opacity duration-500"></div>
                <div className="absolute inset-0 bg-gradient-to-b from-[#00A86B] to-[#059669] rounded-full shadow-[0_0_60px_rgba(0,168,107,0.6)] flex items-center justify-center transform group-hover/play:scale-110 transition-transform duration-300 border-[2px] border-emerald-400/30">
                  <Play className="w-10 h-10 sm:w-14 sm:h-14 fill-white text-white ml-2" />
                </div>
              </div>

              {/* Decorative cinematic lighting */}
              <div className="absolute top-[-20%] left-[-10%] w-[60%] h-[60%] bg-[#00A86B] blur-[160px] opacity-20 rounded-full pointer-events-none"></div>
              <div className="absolute bottom-[-20%] right-[-10%] w-[60%] h-[60%] bg-emerald-600 blur-[160px] opacity-10 rounded-full pointer-events-none"></div>

              {/* Dummy Progress Bar */}
              <div className="absolute bottom-0 inset-x-0 h-24 bg-gradient-to-t from-black via-black/80 to-transparent z-20 flex items-end p-6 sm:p-8">
                <div className="w-full flex items-center gap-4 sm:gap-6">
                  <div className="text-white/80 font-bold text-xs sm:text-sm">00:00</div>
                  <div className="flex-1 h-2 bg-white/20 rounded-full overflow-hidden cursor-pointer group/bar relative shadow-inner">
                    <div className="absolute inset-y-0 left-0 bg-[#00A86B] w-1/3 rounded-full relative shadow-[0_0_10px_rgba(0,168,107,0.8)]">
                      <div className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-1/2 w-4 h-4 bg-white rounded-full shadow-md opacity-0 group-hover/bar:opacity-100 transition-opacity"></div>
                    </div>
                  </div>
                  <div className="text-white/80 font-bold text-xs sm:text-sm">05:42</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}
