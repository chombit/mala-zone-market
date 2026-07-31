import React, { useState } from 'react';
import { ArrowRight, Sparkles, ShoppingBag, ShieldCheck, Zap, Play, Building2, Car, Hotel, PartyPopper, Tractor, Smartphone, PhoneCall, CheckCircle2, X } from 'lucide-react';
import { useLanguage } from '@/contexts/ZoneLanguageContext';
import { useNavigate } from 'react-router-dom';
import AgentRegistrationModal from './AgentRegistrationModal';

export function MalaAgentsUnified() {
  const { language } = useLanguage();
  const navigate = useNavigate();
  const currentGlobalLang = language === 'amharic' ? 'am' : 'en';

  const [isPlaying, setIsPlaying] = useState(false);
  const [showRegistration, setShowRegistration] = useState(false);
  const [hoveredLabel, setHoveredLabel] = useState<{ am: string; en: string } | null>(null);

  // 🌐 EXHAUSTIVE DUAL-LANGUAGE DIRECT P2P DICTIONARY
  const t = {
    am: {
      badgeZone: "✨ ቀጥተኛና ደላላ-አልባ ይፋዊ ግብይት",
      heading: "ያለ ደላላ በቀጥታ ይገበያዩ!",
      subMotto: "ቤት፣ መኪና፣ ሆቴል፣ የሰርግ ዕቃዎች፣ ከባድ ማሽነሪ እና ኤሌክትሮኒክስ — ያለ ደላላ ጣልቃ-ገብነት በቀጥታ ለገዢዎች ያቅርቡ!",
      card1Title: "ንብረትዎን ያስመዝግቡ",
      card1Desc: "ቤት፣ መኪና፣ ሆቴል፣ ማሽነሪ ወይም ኤሌክትሮኒክስ — ለአገር ውስጥና ለዲያስፖራ ገዢዎች በቀጥታ ያቅርቡ።",
      card2Title: "ሕጋዊ እና አስተማማኝ",
      card2Desc: "ከማዘጋጃ ቤትና ከትራንስፖርት ቢሮ ጋር የተቆራኘ የተረጋገጠ አሰራር።",
      card3Title: "ፈጣን ቀጥተኛ ግብይት",
      card3Desc: "ከባለቤቶች ጋር በቀጥታ ይገናኙ — ያለ ውዥንብር ግብይት ያጠናቅቁ።",
      btnCTA: "አሁኑኑ ይመዝግቡ",
      socialProof: "ባለቤቶች ንብረታቸውን በስኬት መዝግበዋል",
      videoTitle: "የአጠቃቀም ማብሪያ ቪዲዮ",
      videoSub: "MALAZONE USER GUIDE",
      hoverPlaceholder: "በአዶዎቹ ላይ በማሳረፍ ዝርዝሩን ይመልከቱ (HOVER OVER ICONS)",
      modalTitle: "የማላዞን ሙሉ ሲስተም አጠቃቀም ማብራሪያ ቪዲዮ"
    },
    en: {
      badgeZone: "✨ Direct & Broker-Free Official Trade",
      heading: "Trade Directly Without Brokers!",
      subMotto: "Houses, cars, hotels, wedding gear, heavy machinery & electronics — list and sell directly to verified buyers!",
      card1Title: "Register Your Property",
      card1Desc: "List houses, cars, hotels, machinery or electronics and connect directly with verified global buyers.",
      card2Title: "Legally Verified & Trusted",
      card2Desc: "Secure operations synchronized with regional transit and municipality registries.",
      card3Title: "Fast Direct Transactions",
      card3Desc: "Connect directly with owners — finalize deals with zero middleman confusion.",
      btnCTA: "Register Now",
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
    <section className="bg-white dark:bg-slate-950 text-slate-900 dark:text-slate-100 pt-4 pb-2 px-6 sm:px-8 lg:px-16 w-full text-left font-sans antialiased select-none overflow-hidden transition-colors duration-300">
      <div className="max-w-[1200px] mx-auto grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-12 items-center">

        {/* 🟢 LEFT COLUMN: Content & Value Propositions */}
        <div className="lg:col-span-6 space-y-5">

          {/* Heading */}
          <h2 className="text-3xl sm:text-4xl font-black text-[#00A86B] tracking-tight leading-[1.1]">
            {t.heading}
          </h2>

          {/* Subtitle */}
          <p className="text-sm sm:text-base font-bold text-slate-800 dark:text-slate-200 leading-relaxed">
            {t.subMotto}
          </p>

          {/* CSS Animation for Mobile Marquee */}
          <style>{`
            @keyframes mobile-marquee {
              0% { transform: translateX(0); }
              100% { transform: translateX(-50%); }
            }
            .animate-mobile-marquee {
              animation: mobile-marquee 15s linear infinite;
            }
          `}</style>
          
          {/* Feature Rows - Desktop Stack */}
          <div className="hidden sm:block space-y-3 pt-1">
            {[
              { icon: <ShoppingBag className="size-5" />, title: t.card1Title, desc: t.card1Desc },
              { icon: <ShieldCheck className="size-5" />, title: t.card2Title, desc: t.card2Desc },
              { icon: <Zap className="size-5" />, title: t.card3Title, desc: t.card3Desc }
            ].map((feature, idx) => (
              <div key={idx} className="flex items-center gap-4 bg-slate-50 dark:bg-slate-900 border border-slate-200/80 dark:border-white/5 px-5 py-4 rounded-2xl shadow-sm hover:border-[#00A86B]/30 hover:bg-white dark:hover:bg-slate-800 transition-all duration-300 group">
                <div className="p-2.5 bg-emerald-50 dark:bg-emerald-950/50 rounded-xl text-[#00A86B] shrink-0">
                  {feature.icon}
                </div>
                <div>
                  <h4 className="text-sm font-black text-slate-900 dark:text-white leading-snug">{feature.title}</h4>
                  <p className="text-[13px] font-medium text-slate-500 dark:text-slate-400 leading-snug mt-0.5">{feature.desc}</p>
                </div>
              </div>
            ))}
          </div>

          {/* Feature Rows - Mobile Auto-Looping Marquee */}
          <div className="sm:hidden w-[100vw] -ml-6 overflow-hidden relative pt-2 pb-1">
            <div className="flex w-max animate-mobile-marquee hover:[animation-play-state:paused]">
              {[
                { icon: <ShoppingBag className="size-5" />, title: t.card1Title, desc: t.card1Desc },
                { icon: <ShieldCheck className="size-5" />, title: t.card2Title, desc: t.card2Desc },
                { icon: <Zap className="size-5" />, title: t.card3Title, desc: t.card3Desc },
                { icon: <ShoppingBag className="size-5" />, title: t.card1Title, desc: t.card1Desc },
                { icon: <ShieldCheck className="size-5" />, title: t.card2Title, desc: t.card2Desc },
                { icon: <Zap className="size-5" />, title: t.card3Title, desc: t.card3Desc }
              ].map((feature, idx) => (
                <div key={idx} className="w-[85vw] max-w-[320px] flex items-center gap-4 bg-slate-50 dark:bg-slate-900 border border-slate-200/80 dark:border-white/5 px-5 py-4 rounded-2xl mx-2 shrink-0 shadow-sm">
                  <div className="p-2.5 bg-emerald-50 dark:bg-emerald-950/50 rounded-xl text-[#00A86B] shrink-0">
                    {feature.icon}
                  </div>
                  <div>
                    <h4 className="text-sm font-black text-slate-900 dark:text-white leading-snug">{feature.title}</h4>
                    <p className="text-[13px] font-medium text-slate-500 dark:text-slate-400 leading-snug mt-0.5">{feature.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* CTA Button - Centered with Premium Design */}
          <div className="flex justify-center pt-6 border-t border-slate-100 dark:border-white/5">
            <button
              onClick={() => navigate('/signin')}
              className="
                relative group
                bg-gradient-to-r from-[#00A86B] to-emerald-600 
                hover:from-emerald-600 hover:to-[#00A86B]
                text-white font-black text-sm uppercase tracking-widest
                px-10 py-4 rounded-2xl
                shadow-lg shadow-emerald-500/30
                hover:shadow-2xl hover:shadow-emerald-500/50
                transform hover:-translate-y-1 active:translate-y-0
                transition-all duration-300
                flex items-center gap-3
                border-2 border-emerald-400/20
                overflow-hidden
              "
            >
              {/* Animated background shine effect */}
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent translate-x-[-200%] group-hover:translate-x-[200%] transition-transform duration-1000"></div>
              
              {/* Content */}
              <span className="relative z-10 flex items-center gap-2">
                <Sparkles className="w-4 h-4" />
                {t.btnCTA}
              </span>
              <ArrowRight className="relative z-10 w-5 h-5 group-hover:translate-x-2 transition-transform duration-300" />
            </button>
          </div>

        </div>

        {/* 🟢 RIGHT COLUMN: The Orbit UI */}
        <div className="lg:col-span-6 flex flex-col items-center justify-center relative w-full pt-6 lg:pt-0">

          {/* CSS for auto-rotating orbit icons */}
          <style>{`
            @keyframes orbit-rotate {
              from { transform: rotate(0deg); }
              to { transform: rotate(360deg); }
            }
            .orbit-rings-container {
              animation: orbit-rotate 40s linear infinite;
            }
            .orbit-icon {
              animation: orbit-rotate 40s linear infinite reverse;
            }
          `}</style>

          {/* Wrapper to hold both rotating and static elements */}
          <div className="relative w-[280px] h-[280px] sm:w-[360px] sm:h-[360px] flex items-center justify-center">

            {/* Rotating container for rings and icons */}
            <div className="absolute inset-0 orbit-rings-container">
              {/* Outer rings (Dashed borders) with enhanced glow */}
              <div className="absolute inset-[-28px] sm:inset-[-35px] rounded-full border-[1px] border-dashed border-[#00A86B]/20 shadow-[0_0_30px_rgba(0,168,107,0.1)]"></div>
              <div className="absolute inset-0 rounded-full border-[1.5px] border-dashed border-[#00A86B]/25 shadow-[0_0_40px_rgba(0,168,107,0.15)]"></div>
              <div className="absolute inset-[45px] sm:inset-[55px] rounded-full border-[1px] border-dashed border-[#00A86B]/20 shadow-[0_0_30px_rgba(0,168,107,0.1)]"></div>

              {/* Orbiting Icons - counter-rotate to stay upright */}
              {malazoneOrbits.map((item) => (
                <div
                  key={item.id}
                  onMouseEnter={() => setHoveredLabel({ am: item.am, en: item.en })}
                  onMouseLeave={() => setHoveredLabel(null)}
                  onClick={() => setHoveredLabel({ am: item.am, en: item.en })}
                  onTouchStart={() => setHoveredLabel({ am: item.am, en: item.en })}
                  className={`
                    orbit-icon
                    absolute ${item.pos} w-[44px] h-[44px] sm:w-[52px] sm:h-[52px] rounded-full 
                    bg-gradient-to-br from-white to-slate-50 dark:from-slate-900 dark:to-slate-800
                    border-2 border-slate-200/80 dark:border-slate-700/50 text-[#00A86B] flex items-center justify-center 
                    shadow-[0_8px_24px_rgba(0,0,0,0.08),0_0_0_1px_rgba(0,168,107,0.1)] cursor-pointer
                    transition-all duration-300 ease-out
                    hover:bg-gradient-to-br hover:from-[#00A86B] hover:to-[#059669] hover:text-white hover:scale-125 hover:border-transparent
                    hover:shadow-[0_0_40px_rgba(0,168,107,0.6),0_8px_32px_rgba(0,168,107,0.3)] 
                    hover:z-30 group z-20
                    will-change-transform
                    backdrop-blur-sm
                    active:scale-125 active:bg-gradient-to-br active:from-[#00A86B] active:to-[#059669] active:text-white
                  `}
                >
                  {item.icon}
                </div>
              ))}
            </div>

            {/* Static Central Play Button - OUTSIDE rotating container */}
            <div className="absolute inset-0 m-auto w-[170px] h-[170px] sm:w-[220px] sm:h-[220px] rounded-full flex items-center justify-center z-30 pointer-events-none">
              <div className="absolute inset-0 rounded-full border-2 border-[#00A86B]/40 animate-ping z-0 pointer-events-none" style={{ animationDuration: '3s' }} />
              <div className="absolute inset-2 sm:inset-4 rounded-full border border-[#00A86B]/30 animate-ping z-0 pointer-events-none" style={{ animationDuration: '3s', animationDelay: '1.5s' }} />
              <button
                onClick={() => setIsPlaying(true)}
                className="relative w-full h-full rounded-full bg-[#1e293b] bg-[radial-gradient(circle_at_40%_35%,#1e293b,#0f172a)] hover:bg-none hover:bg-[#00A86B] text-white flex flex-col items-center justify-center shadow-[0_15px_50px_rgba(15,23,42,0.4),inset_0_0_40px_rgba(0,0,0,0.5),0_0_0_1px_rgba(255,255,255,0.05)] hover:scale-[1.04] hover:shadow-[0_0_80px_rgba(0,168,107,0.5),inset_0_0_40px_rgba(0,0,0,0.2)] transition-all duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] cursor-pointer group border-[1px] border-white/10 hover:border-[#00A86B]/30 z-10 pointer-events-auto backdrop-blur-sm"
              >
                {/* Green Play Button (Inverts to white on hover) */}
                <div className="w-[52px] h-[52px] sm:w-[65px] sm:h-[65px] rounded-full bg-gradient-to-b from-[#00A86B] to-[#059669] group-hover:from-white group-hover:to-slate-50 flex items-center justify-center shadow-[0_4px_30px_rgba(0,168,107,0.6)] group-hover:shadow-[0_4px_40px_rgba(255,255,255,0.5)] mb-2 sm:mb-2.5 group-hover:scale-110 transition-all duration-500 ease-[cubic-bezier(0.16,1,0.3,1)]">
                  <Play className="w-[22px] h-[22px] sm:w-[30px] sm:h-[30px] fill-white text-white group-hover:fill-[#00A86B] group-hover:text-[#00A86B] ml-1 transition-colors duration-300" />
                </div>
                <p className="text-[#00A86B] group-hover:text-white font-black text-xs sm:text-sm tracking-wide mb-0.5 transition-colors duration-300">{formatText(t.videoTitle, 'group-hover:text-white')}</p>
                <p className="text-[#00A86B]/70 group-hover:text-white/90 font-bold text-[7px] sm:text-[8px] tracking-[0.12em] sm:tracking-[0.18em] uppercase transition-colors duration-300">{formatText(t.videoSub, 'group-hover:text-white/90')}</p>
              </button>
            </div>

          </div>

          {/* Interactive Hover Metadata Box - Only show when hovering, no placeholder text */}
          <div 
            className="h-[50px] sm:h-[60px] mt-6 sm:mt-8 w-full flex justify-center items-center px-4"
            onClick={() => setHoveredLabel(null)}
          >
            {hoveredLabel && (
              <div className="text-center animate-in fade-in slide-in-from-bottom-3 duration-300 max-w-md">
                <div className="inline-flex items-center gap-2 mb-1.5 px-4 py-2 rounded-xl bg-gradient-to-r from-[#00A86B]/10 to-emerald-500/5 border border-[#00A86B]/20 backdrop-blur-sm shadow-lg shadow-[#00A86B]/10">
                  <Sparkles className="w-4 h-4 text-[#00A86B] animate-pulse" />
                  <p className="text-sm sm:text-base font-black text-[#00A86B]">{currentGlobalLang === 'am' ? hoveredLabel.am : hoveredLabel.en}</p>
                </div>
                <p className="text-xs sm:text-sm font-bold text-slate-600 dark:text-slate-300 mt-1">{currentGlobalLang === 'am' ? hoveredLabel.en : hoveredLabel.am}</p>
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

      <AgentRegistrationModal isOpen={showRegistration} onClose={() => setShowRegistration(false)} />
    </section>
  );
}
