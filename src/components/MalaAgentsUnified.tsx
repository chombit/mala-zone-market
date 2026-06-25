import React, { useState } from 'react';
import { CheckCircle2, ArrowRight, Sparkles, Play, Building2, Car, Hotel, PartyPopper, Tractor, Wallet, ShieldCheck, PhoneCall, X } from 'lucide-react';
import { useLanguage } from '@/contexts/ZoneLanguageContext';

export function MalaAgentsUnified() {
  const { language } = useLanguage();
  const currentGlobalLang = language === 'amharic' ? 'am' : 'en';

  const [isPlaying, setIsPlaying] = useState(false);
  const [hoveredLabel, setHoveredLabel] = useState<{ am: string; en: string } | null>(null);

  // 🌐 EXHAUSTIVE DUAL-LANGUAGE INSTITIONAL COPY (COMPACT & PUNCHY VERIFICATION)
  const t = {
    am: {
      badgeZone: "💼 Mala-Agents Zone",
      badgePromo: "⚡ የኢኮኖሚ አቅምዎን የሚቀይር አገር አቀፍ የሥራ መላ!",
      heading: "የሥራ ዕድል መላ!",
      subHeading: "Ethiopia’s Premier Decentralized Peer-to-Peer Agent Infrastructure",
      mainBody: "malazone በአገር አቀፍ ደረጃ የታመነ ዘመናዊ የንግድ ሥነ-ምህዳር ነው። በሐዋሳ፣ በይርጋለም፣ በአሌታ ወንዶ፣ በቤንሳ እና በጩቆ ያሉ ወኪሎች የሾውሩም መኪናዎችን፣ የኮንስትራክሽን ማሽነሪዎችን፣ ሆቴሎችን እና የቤትና ቦታ ይዞታዎችን በሕጋዊ መንገድ በመመዝገብ በየቀኑ ከፍተኛና አስተማማኝ ገቢ ያገኛሉ። መድረካችን ከማዘጋጃ ቤት የይዞታ ማህደሮች እና ከትራንስፖርት ቢሮ የባለቤትነት መዛግብት ጋር በቀጥታ የተቆራኘ በመሆኑ ግብይትዎ ሙሉ በሙሉ አስተማማኝ ነው።",
      card1: "ፈጣንና አስተማማኝ ክፍያ፦ ያገኙትን የኮሚሽን አበል በዘመናዊ ዲጂታል ባንኮች በቀጥታ መቀበል",
      card2: "ፍጹም ሕጋዊ አሰራር፦ ከከተማ ማዘጋጃ ቤቶች እና ከክልል ትራንስፖርት ቢሮዎች ጋር የተቆራኘ ሲስተም",
      card3: "አስተማማኝ አጋርነት፦ በመላው ሀገሪቱ ያሉ ከ500 በላይ ንቁ ወኪሎች በስኬት ስራ ጀምረዋል",
      btnCTA: "አሁን ይጀምሩ — ወኪል ይሁኑ",
      socialProof: "ወኪሎች ተቀላቅለዋል",
      videoTitle: "የማላዞን መግቢያ ቪዲዮ",
      videoSub: "MALAZONE MASTER VIDEO INTRO",
      hoverPlaceholder: "በአዶዎቹ ላይ በማሳረፍ ዝርዝሩን ይመልከቱ (HOVER OVER ICONS)",
      modalTitle: "የማላዞን ሙሉ ሲስተም አጠቃቀም ማብራሪያ ቪዲዮ"
    },
    en: {
      badgeZone: "💼 Mala-Agents Zone",
      badgePromo: "⚡ Empowering National Commerce Through Trusted Digital Networks",
      heading: "Earning Opportunity!",
      subHeading: "Ethiopia’s Premier Decentralized Peer-to-Peer Agent Infrastructure",
      mainBody: "malazone operates as a highly secure, verified, and completely transparent technological ecosystem in Ethiopia. Our platform connects local agents with regional property archives and transit ledgers. Legally list showroom vehicles, heavy construction machineries, hotels, and real estate titles across Hawassa, Yirgalem, Aleta Wondo, Bensa, and Chuko to earn stable daily income with absolute peace of mind.",
      card1: "Guaranteed Settlement: Secure automated payouts directly routed into your digital bank account.",
      card2: "Institutional Audit: Direct frontend platform integration with municipal registries and transit archives.",
      card3: "Validated Social Proof: Over 500+ active localized brokers and agents have successfully joined.",
      btnCTA: "Get Started — Become Agent",
      socialProof: "Active Local Agents Joined",
      videoTitle: "malazone Master Video Intro",
      videoSub: "MALAZONE MASTER VIDEO INTRO",
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
    { id: 6, icon: <Wallet className="w-5 h-5" />, am: 'የወኪል ወጣቶች ክፍያ (Mala-Agents) — "ንብረቶችን በመመዝገብ በየቀኑ ከፍተኛ ገቢ ማግኛ"', en: 'Automated Commission Payout Flow — Earn stable daily income via listings', pos: 'bottom-[14.64%] left-[14.64%] -translate-x-1/2 translate-y-1/2' },
    { id: 7, icon: <ShieldCheck className="w-5 h-5" />, am: 'የቀጥታ ተጠቃሚዎች ገበያ (P2P Market) — "ሻጭና ገዢን ያለአስገዳጅ በቀጥታ ማገናኛ"', en: 'Direct Peer-to-Peer Customer Link — Bypass middleman friction cleanly', pos: 'top-1/2 left-0 -translate-x-1/2 -translate-y-1/2' },
    { id: 8, icon: <PhoneCall className="w-5 h-5" />, am: 'የቀጥታ ስልክና ጥሪ (Support Matrix) — "የባለቤቱን ስልክና ቴሌግራም በቀጥታ ማግኛ"', en: 'Direct Owner Call & Telegram Support — Immediate gateway to secure support', pos: 'top-[14.64%] left-[14.64%] -translate-x-1/2 -translate-y-1/2' },
  ];

  return (
    <section className="bg-[#FAFAFA] text-slate-900 pt-10 pb-20 px-6 sm:px-12 lg:px-20 w-full text-left font-sans antialiased select-none overflow-hidden">
      <div className="max-w-[1300px] mx-auto grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16 items-center">

        {/* 🟢 LEFT COLUMN: Content & Value Propositions */}
        <div className="lg:col-span-6 space-y-7">

          <div className="flex flex-wrap items-center gap-3">
            <span className="text-[11px] sm:text-xs font-black bg-emerald-50 text-[#00A86B] border border-emerald-200/50 px-3.5 py-1.5 rounded-full tracking-widest">
              {t.badgeZone}
            </span>
          </div>

          <div className="space-y-3">
            <h2 className="text-4xl sm:text-[3.5rem] font-black text-[#00A86B] tracking-tight leading-none">
              {t.heading}
            </h2>
          </div>

          <p className="text-[14px] sm:text-[16px] text-slate-700 font-medium leading-[1.8] sm:leading-[1.9] tracking-[0.01em] max-w-xl font-sans">
            {formatText(t.mainBody)}
          </p>

          {/* የቅንጦት ማረጋገጫ ካርዶች (Premium Porcelain Value Cards) */}
          <div className="space-y-3.5 pt-2">
            <div className="flex items-start space-x-3.5 bg-white p-4 rounded-2xl border border-slate-200/80 shadow-sm hover:border-[#00A86B]/30 hover:shadow-md transition-all duration-300">
              <CheckCircle2 className="w-5 h-5 text-[#00A86B] shrink-0 mt-0.5" />
              <p className="text-[13px] sm:text-[14px] font-semibold text-slate-700 leading-[1.7] tracking-wide">{t.card1}</p>
            </div>
            <div className="flex items-start space-x-3.5 bg-white p-4 rounded-2xl border border-slate-200/80 shadow-sm hover:border-[#00A86B]/30 hover:shadow-md transition-all duration-300">
              <CheckCircle2 className="w-5 h-5 text-[#00A86B] shrink-0 mt-0.5" />
              <p className="text-[13px] sm:text-[14px] font-semibold text-slate-700 leading-[1.7] tracking-wide">{t.card2}</p>
            </div>
          </div>

          {/* CTA & SOCIAL PROOF */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-5 pt-4">
            <button className="bg-[#00A86B] hover:bg-emerald-600 text-white font-black text-xs uppercase tracking-widest px-7 py-4 rounded-full transition-all shadow-[0_8px_20px_rgba(0,168,107,0.25)] flex items-center space-x-2 group cursor-pointer">
              <span>{t.btnCTA}</span>
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1.5 transition-transform" strokeWidth={3} />
            </button>

            <div className="bg-white border border-slate-200/80 px-5 py-2.5 rounded-[20px] flex items-center space-x-4 shadow-sm h-[52px]">
              <div className="flex -space-x-3 overflow-hidden">
                <div className="w-8 h-8 rounded-full bg-emerald-100 border-2 border-white flex items-center justify-center text-sm z-30 shadow-sm">👨‍💼</div>
                <div className="w-8 h-8 rounded-full bg-blue-100 border-2 border-white flex items-center justify-center text-sm z-20 shadow-sm">👩‍💼</div>
                <div className="w-8 h-8 rounded-full bg-orange-100 border-2 border-white flex items-center justify-center text-sm z-10 shadow-sm">👨‍💼</div>
              </div>
              <p className="text-xs font-black text-slate-800 tracking-wide flex flex-col justify-center">
                <span>500+ <span className="text-[#00A86B]">Active Agents</span></span>
                <span className="text-[10px] text-slate-500 font-bold">{t.socialProof}</span>
              </p>
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
                  absolute ${item.pos} w-[40px] h-[40px] sm:w-[48px] sm:h-[48px] rounded-full bg-white 
                  border border-slate-100 text-[#00A86B] flex items-center justify-center 
                  shadow-[0_4px_20px_rgba(0,0,0,0.06)] cursor-pointer transition-all duration-500 ease-[cubic-bezier(0.16,1,0.3,1)]
                  hover:bg-[#00A86B] hover:text-white hover:scale-[1.15] hover:-translate-y-1 hover:border-transparent
                  hover:shadow-[0_8px_20px_rgba(0,168,107,0.4)] group z-20
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
                <p className="text-xs font-bold text-slate-400">{currentGlobalLang === 'am' ? hoveredLabel.en : hoveredLabel.am}</p>
              </div>
            ) : (
              <div className="text-center flex items-center justify-center gap-2 animate-in fade-in duration-300">
                <Sparkles className="w-4 h-4 text-[#00A86B]/60" />
                <p className="text-[13px] font-bold italic text-slate-400">
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
