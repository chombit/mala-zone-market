/**
 * AboutPage.tsx
 * Malazone.com — Corporate About Page
 * © 2026 Malazone Technologies PLC. All Rights Reserved.
 */

import React from "react";
import {
  X,
  Building2,
  Car,
  Hotel,
  Music,
  Truck,
  Globe,
  Target,
  Users,
  TrendingUp,
  MapPin,
  Sparkles,
  Shield,
  Zap,
} from "lucide-react";
import { useLanguage } from "@/contexts/ZoneLanguageContext";

const t = {
  en: {
    backBtn: "Back to Home",
    badge: "About Us",
    title1: "mala",
    title2: "zone",
    subtitle:
      "Ethiopia's Premier Enterprise Asset Ecosystem — Founded to Eliminate Middlemen and Empower Direct Commerce Across Every Region.",
    founderSection: "Leadership",
    founderName: "Luwa Tesemma Kakawo",
    founderRole: "Founder & Chief Executive Officer",
    founderBio:
      "Luwa Tesemma Kakawo founded Malazone Technologies PLC with a singular vision: to build a vertically integrated digital marketplace that connects Ethiopian buyers, sellers, and service providers directly — without traditional brokerage friction. Under his leadership, Malazone has grown from a Hawassa-based pilot into a nationwide asset commerce platform serving thousands of active users across the Sidama Region and expanding into Oromia, Amhara, SNNPR, and the capital Addis Ababa.",
    missionTitle: "Our Mission",
    missionText:
      "To digitize and democratize asset commerce in Ethiopia by providing a trusted, transparent, and technology-driven marketplace where every citizen — from urban professionals in Addis Ababa to rural landowners in Bensa — can buy, sell, rent, or hire assets and services with zero intermediary fees.",
    visionTitle: "Our Vision",
    visionText:
      "To become the undisputed pan-Ethiopian digital infrastructure for real estate, automotive, hospitality, ceremony services, and heavy machinery commerce by 2030 — processing over 100,000 monthly transactions across all 12 regional states.",

    zonesTitle: "Five Core Asset Zones",
    zonesSubtitle:
      "Every vertical of Ethiopian commerce, unified under one intelligent platform.",
    zone1Title: "Property Zone",
    zone1Desc:
      "Residential homes, commercial buildings, plots of land, and agricultural parcels — listed with verified title deeds and geo-tagged coordinates. From luxury villas in Hawassa Tabor to farmland in Yirgalem, every property listing undergoes our three-tier verification pipeline.",
    zone2Title: "Motors & EV Zone",
    zone2Desc:
      "New and pre-owned vehicles including sedans, SUVs, trucks, and Ethiopia's emerging electric vehicle market. Every motor listing includes plate code region, fuel type, mileage verification, and real-time pricing analytics sourced from market benchmarks across Sidama, Oromia, and Addis Ababa.",
    zone3Title: "Stay & Hall Zone",
    zone3Desc:
      "Guest houses, hotel rooms, conference halls, and co-working spaces available for hourly, daily, or monthly rental. Integrated with Mala-Agent field verification to ensure photographic accuracy and amenity compliance before any booking is confirmed.",
    zone4Title: "Ceremony & DJ Zone",
    zone4Desc:
      "Wedding gowns, tuxedos, DJ sound systems, stage lighting rigs, and full event planning packages. Our ceremony marketplace powers hundreds of weddings and corporate events monthly across the Sidama Region, with expansion into Dire Dawa, Jimma, and Bahir Dar underway.",
    zone5Title: "Heavy Machinery Zone",
    zone5Desc:
      "Excavators, bulldozers, concrete mixers, cranes, and industrial generators — available for purchase or hourly hire. Serving Ethiopia's booming construction and infrastructure sectors with operator-verified listings and transparent pricing.",

    expansionTitle: "Nationwide Expansion Roadmap",
    expansionSubtitle:
      "From Hawassa to every corner of Ethiopia — our growth trajectory.",
    phase1: "Phase 1 — Sidama Dominance (Active)",
    phase1Desc:
      "Full operational coverage across Hawassa, Yirgalem, Aleta Wondo, Bensa, and Chuko. Over 2,500 active listings and 1,000+ registered clients. Mala-Agent network deployed in all five zones with Telebirr payout integration.",
    phase2: "Phase 2 — Southern Corridor (2026–2027)",
    phase2Desc:
      "Expansion into Dilla, Sodo, Arba Minch, and Jinka. Strategic partnerships with regional trade bureaus and Chamber of Commerce offices. Target: 10,000 active listings across the SNNPR and Sidama.",
    phase3: "Phase 3 — National Scale (2027–2028)",
    phase3Desc:
      "Full launch in Addis Ababa, Dire Dawa, Adama, Bahir Dar, Mekelle, Jimma, and Harar. Enterprise API integrations with Ethiopian banking platforms for seamless mortgage and auto-loan facilitation. Target: 50,000 monthly active users.",
    phase4: "Phase 4 — Pan-Ethiopian Infrastructure (2028–2030)",
    phase4Desc:
      "Coverage of all 12 regional states and 2 city administrations. AI-powered pricing engine, blockchain-verified title deeds, and drone-captured property imagery. Target: 100,000+ monthly transactions.",

    statsTitle: "Platform Impact",
    stat1Label: "Active Listings",
    stat1Value: "2,500+",
    stat2Label: "Registered Clients",
    stat2Value: "1,000+",
    stat3Label: "Zones Covered",
    stat3Value: "5",
    stat4Label: "Trade Success",
    stat4Value: "100%",

    copyright: "© 2026 Malazone Technologies PLC. All Rights Reserved.",
  },
  amharic: {
    backBtn: "ወደ መነሻ ተመለስ",
    badge: "ስለ እኛ",
    title1: "mala",
    title2: "zone",
    subtitle:
      "የኢትዮጵያ ቀዳሚ የንብረት ንግድ ስርዓት — ደላሎችን በማስቀረት ቀጥተኛ ንግድን በሁሉም ክልሎች ለማጠናከር የተቋቋመ።",
    founderSection: "አመራር",
    founderName: "ሉዋ ተሰማ ካካዎ",
    founderRole: "መስራች እና ዋና ስራ አስፈፃሚ",
    founderBio:
      "ሉዋ ተሰማ ካካዎ የመላዞን ቴክኖሎጂስ ኃ/የተ/ማህበርን ያቋቋሙት አንድ ግልፅ ራዕይ ይዘው ነው፦ ኢትዮጵያውያን ገዥዎችን፣ ሻጮችን እና አገልግሎት ሰጪዎችን ያለ ባህላዊ ደላላ ግንኙነት በቀጥታ የሚያገናኝ ዲጂታል ገበያ ማዕከል መገንባት። በእርሳቸው አመራር ስር መላዞን ከሐዋሳ ቅንጥብ ፕሮጀክት ወደ አገር አቀፍ የንብረት ንግድ መድረክ አድጓል።",
    missionTitle: "ተልዕኮአችን",
    missionText:
      "በኢትዮጵያ ውስጥ የንብረት ንግድን ዲጂታል በማድረግ እና በማዳበር — ከአዲስ አበባ ከተማ ባለሙያዎች ጀምሮ እስከ ቤንሳ ገጠር ባለይዞታዎች ድረስ — እያንዳንዱ ዜጋ ያለ ደላላ ክፍያ ንብረት እንዲገዛ፣ እንዲሸጥ፣ እንዲከራይ ወይም አገልግሎት እንዲቀጥር ታማኝ፣ ግልፅ እና ቴክኖሎጂ-ተኮር ገበያ ማቅረብ።",
    visionTitle: "ራዕያችን",
    visionText:
      "እስከ 2030 ድረስ በሪል ኢስቴት፣ በተሽከርካሪ፣ በመስተንግዶ፣ በሰርግ አገልግሎት እና በከባድ ማሽነሪ ንግድ ውስጥ ያልተከራከረ የኢትዮጵያ ዲጂታል መሠረተ ልማት መሆን — በሁሉም 12 ክልላዊ መንግስታት 100,000+ ወርሃዊ ግብይቶችን ማስተናገድ።",

    zonesTitle: "አምስት ዋና የንብረት ዞኖች",
    zonesSubtitle: "የኢትዮጵያ ንግድ በሙሉ በአንድ ብልህ መድረክ ስር።",
    zone1Title: "የንብረት ዞን",
    zone1Desc:
      "መኖሪያ ቤቶች፣ የንግድ ህንፃዎች፣ መሬት ቦታዎች — በተረጋገጠ ካርታ እና ጂኦ-ታግ ቅንብር የተዘረዘሩ። ከሐዋሳ ጣቦር ቪላዎች ጀምሮ እስከ ይርጋዓለም እርሻ ድረስ እያንዳንዱ ዝርዝር ሶስት-ደረጃ ማረጋገጫ ያልፋል።",
    zone2Title: "መኪና እና ኤሌክትሪክ ዞን",
    zone2Desc:
      "አዲስ እና ያገለገሉ ተሽከርካሪዎች — ሰዳን፣ ኤስዩቪ፣ ትራክ እና ኤሌክትሪክ ተሽከርካሪዎች። እያንዳንዱ ዝርዝር ታርጋ ኮድ፣ የነዳጅ ዓይነት፣ ማይሌጅ ማረጋገጫ እና ቀጥታ ዋጋ ትንተና ያካትታል።",
    zone3Title: "አዳራሽ እና ማረፊያ ዞን",
    zone3Desc:
      "የእንግዳ ማረፊያ፣ ሆቴል ክፍሎች፣ የኮንፈረንስ አዳራሽ — በሰዓት፣ በቀን ወይም በወር ለኪራይ። ከመላ-ወኪል ማረጋገጫ ጋር የተዋሃደ።",
    zone4Title: "ሰርግ እና ዲጄ ዞን",
    zone4Desc:
      "የሰርግ ልብሶች፣ ዲጄ ድምጽ ሲስተሞች፣ የመድረክ መብራት — በሲዳማ ክልል በመቶዎች ለሚቆጠሩ ሰርጎች አገልግሎት ይሰጣል። ወደ ድሬዳዋ፣ ጅማ እና ባህር ዳር ማስፋፋት በመካሄድ ላይ ነው።",
    zone5Title: "ከባድ ማሽነሪ ዞን",
    zone5Desc:
      "ኤክስካቫተሮች፣ ቡልዶዘሮች፣ ኮንክሪት ሚክሰሮች — ለግዢ ወይም ለሰዓት ኪራይ ዝግጁ። የኢትዮጵያን ግንባታ እና መሠረተ ልማት ዘርፍ ያገለግላል።",

    expansionTitle: "አገር አቀፍ የማስፋፊያ ጉዞ",
    expansionSubtitle: "ከሐዋሳ ወደ ኢትዮጵያ ሁሉም ጫፎች — የእድገት አቅጣጫችን።",
    phase1: "ምዕራፍ 1 — ሲዳማ ሙሉ ሽፋን (ንቁ)",
    phase1Desc:
      "በሐዋሳ፣ ይርጋዓለም፣ ዓለቱ ወንዶ፣ ቤንሳ እና ቹኮ ሙሉ ስራ ላይ። ከ2,500 በላይ ንቁ ዝርዝሮች እና 1,000+ ተመዝጋቢ ደንበኞች።",
    phase2: "ምዕራፍ 2 — ደቡብ ኮሪደር (2026–2027)",
    phase2Desc:
      "ወደ ዲላ፣ ሶዶ፣ አርባ ምንጭ እና ጂንካ ማስፋፋት። ግብ: 10,000 ንቁ ዝርዝሮች።",
    phase3: "ምዕራፍ 3 — ብሔራዊ ደረጃ (2027–2028)",
    phase3Desc:
      "በአዲስ አበባ፣ ድሬዳዋ፣ አዳማ፣ ባህር ዳር፣ መቀሌ፣ ጅማ እና ሐረር ሙሉ ጅምር። ግብ: 50,000 ወርሃዊ ተጠቃሚዎች።",
    phase4: "ምዕራፍ 4 — ሁሉንም-ኢትዮጵያ (2028–2030)",
    phase4Desc:
      "ሁሉም 12 ክልሎች እና 2 ከተማ አስተዳደሮች ሽፋን። AI ዋጋ ሞተር፣ ብሎክቼይን ማረጋገጫ። ግብ: 100,000+ ወርሃዊ ግብይቶች።",

    statsTitle: "የመድረክ ተፅዕኖ",
    stat1Label: "ንቁ ዝርዝሮች",
    stat1Value: "2,500+",
    stat2Label: "ተመዝጋቢ ደንበኞች",
    stat2Value: "1,000+",
    stat3Label: "የተሸፈኑ ዞኖች",
    stat3Value: "5",
    stat4Label: "የግብይት ስኬት",
    stat4Value: "100%",

    copyright: "© 2026 Malazone Technologies PLC. All Rights Reserved.",
  },
};

interface AboutPageProps {
  onBack: () => void;
}

const AboutPage: React.FC<AboutPageProps> = ({ onBack }) => {
  const { language } = useLanguage();
  const d = t[language as keyof typeof t] || t.en;

  const zones = [
    { icon: Building2, title: d.zone1Title, desc: d.zone1Desc, color: "from-emerald-500/10 to-teal-500/5" },
    { icon: Car, title: d.zone2Title, desc: d.zone2Desc, color: "from-blue-500/10 to-sky-500/5" },
    { icon: Hotel, title: d.zone3Title, desc: d.zone3Desc, color: "from-amber-500/10 to-orange-500/5" },
    { icon: Music, title: d.zone4Title, desc: d.zone4Desc, color: "from-pink-500/10 to-rose-500/5" },
    { icon: Truck, title: d.zone5Title, desc: d.zone5Desc, color: "from-slate-500/10 to-gray-500/5" },
  ];

  const phases = [
    { label: d.phase1, desc: d.phase1Desc, icon: MapPin, status: "active" },
    { label: d.phase2, desc: d.phase2Desc, icon: TrendingUp, status: "upcoming" },
    { label: d.phase3, desc: d.phase3Desc, icon: Globe, status: "upcoming" },
    { label: d.phase4, desc: d.phase4Desc, icon: Zap, status: "upcoming" },
  ];

  const stats = [
    { icon: Target, label: d.stat1Label, value: d.stat1Value },
    { icon: Users, label: d.stat2Label, value: d.stat2Value },
    { icon: MapPin, label: d.stat3Label, value: d.stat3Value },
    { icon: Shield, label: d.stat4Label, value: d.stat4Value },
  ];

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 transition-colors duration-300">
      {/* ── Back Button Bar ── */}
      <div className="relative z-50 bg-white/80 dark:bg-slate-950/80 backdrop-blur-xl border-b border-slate-200 dark:border-white/5">
        <div className="max-w-6xl mx-auto px-6 py-4 flex items-center justify-end">
          <button
            onClick={onBack}
            className="p-2 rounded-full bg-slate-100 dark:bg-white/5 hover:bg-slate-200 dark:hover:bg-white/10 text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white transition-all duration-300"
            title={d.backBtn}
          >
            <X className="w-5 h-5" />
          </button>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-6 py-16 space-y-24">

        {/* ── Hero Section ── */}
        <section className="text-center space-y-8 animate-fade-in-up">
          <span className="inline-flex items-center gap-2 px-5 py-2 rounded-full bg-[#00A86B]/10 text-[#00A86B] text-[10px] font-black uppercase tracking-[0.25em] border border-[#00A86B]/20">
            <Sparkles className="w-3.5 h-3.5" />
            {d.badge}
          </span>
          <h1 className="text-6xl sm:text-7xl lg:text-8xl font-black tracking-tighter leading-[0.85]">
            <span className="text-[#00A86B]">{d.title1}</span>
            <span className="text-malazone-navy dark:text-white transition-colors duration-300">{d.title2}</span>
          </h1>
          <p className="text-lg sm:text-xl text-malazone-navy dark:text-slate-400 max-w-3xl mx-auto leading-relaxed font-medium">
            {d.subtitle}
          </p>
        </section>

        {/* ── Stats Strip ── */}
        <section className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          {stats.map((s, i) => (
            <div
              key={i}
              className="flex flex-col items-center gap-3 py-8 rounded-2xl bg-white dark:bg-white/[0.03] border border-slate-200 dark:border-white/[0.06] hover:border-[#00A86B]/30 transition-all duration-500 group"
            >
              <div className="w-10 h-10 rounded-xl bg-[#00A86B]/10 flex items-center justify-center text-[#00A86B] group-hover:scale-110 transition-transform">
                <s.icon className="w-5 h-5" />
              </div>
              <span className="text-3xl font-black text-malazone-navy dark:text-white tracking-tight">{s.value}</span>
              <span className="text-[9px] font-bold uppercase tracking-[0.2em] text-malazone-navy">{s.label}</span>
            </div>
          ))}
        </section>

        {/* ── Founder / Leadership ── */}
        <section className="space-y-8">
          <div className="flex items-center gap-3">
            <div className="w-1 h-8 bg-[#00A86B] rounded-full" />
            <h2 className="text-xs font-black uppercase tracking-[0.25em] text-malazone-navy dark:text-white">{d.founderSection}</h2>
          </div>
          <div className="bg-white dark:bg-white/[0.03] rounded-3xl border border-slate-200 dark:border-white/[0.06] p-8 sm:p-12 space-y-6 hover:border-[#00A86B]/20 transition-colors duration-500">
            <div className="flex flex-col sm:flex-row items-start gap-6">
              <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-[#00A86B] to-emerald-700 flex items-center justify-center text-white text-2xl font-black shrink-0 shadow-lg shadow-emerald-500/20">
                L
              </div>
              <div className="space-y-2">
                <h3 className="text-2xl font-black text-malazone-navy dark:text-white tracking-tight">{d.founderName}</h3>
                <p className="text-sm font-bold text-[#00A86B] uppercase tracking-[0.15em]">{d.founderRole}</p>
              </div>
            </div>
            <div className="h-px bg-slate-100 dark:bg-white/5" />
            <p className="text-[15px] leading-[1.85] text-malazone-navy dark:text-slate-400 font-medium">{d.founderBio}</p>
          </div>
        </section>

        {/* ── Mission & Vision ── */}
        <section className="grid md:grid-cols-2 gap-6">
          <div className="bg-white dark:bg-white/[0.03] rounded-3xl border border-slate-200 dark:border-white/[0.06] p-8 sm:p-10 space-y-5 hover:border-[#00A86B]/20 transition-colors duration-500">
            <div className="w-10 h-10 rounded-xl bg-[#00A86B]/10 flex items-center justify-center">
              <Target className="w-5 h-5 text-[#00A86B]" />
            </div>
            <h3 className="text-lg font-black text-malazone-navy dark:text-white tracking-tight">{d.missionTitle}</h3>
            <p className="text-sm leading-[1.9] text-malazone-navy dark:text-slate-400 font-medium">{d.missionText}</p>
          </div>
          <div className="bg-white dark:bg-white/[0.03] rounded-3xl border border-slate-200 dark:border-white/[0.06] p-8 sm:p-10 space-y-5 hover:border-[#00A86B]/20 transition-colors duration-500">
            <div className="w-10 h-10 rounded-xl bg-[#00A86B]/10 flex items-center justify-center">
              <Globe className="w-5 h-5 text-[#00A86B]" />
            </div>
            <h3 className="text-lg font-black text-malazone-navy dark:text-white tracking-tight">{d.visionTitle}</h3>
            <p className="text-sm leading-[1.9] text-malazone-navy dark:text-slate-400 font-medium">{d.visionText}</p>
          </div>
        </section>

        {/* ── Five Core Asset Zones ── */}
        <section className="space-y-10">
          <div className="text-center space-y-3">
            <h2 className="text-3xl sm:text-4xl font-black text-malazone-navy dark:text-white tracking-tight">{d.zonesTitle}</h2>
            <p className="text-sm text-malazone-navy font-medium max-w-xl mx-auto">{d.zonesSubtitle}</p>
          </div>
          <div className="grid gap-5">
            {zones.map((z, i) => (
              <div
                key={i}
                className={`bg-gradient-to-r ${z.color} dark:from-white/[0.02] dark:to-transparent rounded-2xl border border-slate-200 dark:border-white/[0.06] p-6 sm:p-8 flex flex-col sm:flex-row items-start gap-5 hover:border-[#00A86B]/30 transition-all duration-500 group`}
              >
                <div className="w-12 h-12 rounded-xl bg-white dark:bg-white/5 border border-slate-200 dark:border-white/10 flex items-center justify-center text-[#00A86B] shrink-0 group-hover:scale-110 group-hover:shadow-lg group-hover:shadow-emerald-500/10 transition-all duration-300">
                  <z.icon className="w-5 h-5" />
                </div>
                <div className="space-y-2">
                  <h4 className="text-base font-black text-malazone-navy dark:text-white tracking-tight">{z.title}</h4>
                  <p className="text-sm leading-[1.85] text-malazone-navy dark:text-slate-400 font-medium">{z.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* ── Expansion Roadmap ── */}
        <section className="space-y-10">
          <div className="text-center space-y-3">
            <h2 className="text-3xl sm:text-4xl font-black text-malazone-navy dark:text-white tracking-tight">{d.expansionTitle}</h2>
            <p className="text-sm text-malazone-navy font-medium max-w-xl mx-auto">{d.expansionSubtitle}</p>
          </div>
          <div className="relative space-y-0">
            {/* Timeline line */}
            <div className="absolute left-6 top-0 bottom-0 w-px bg-slate-200 dark:bg-white/10 hidden sm:block" />
            {phases.map((p, i) => (
              <div key={i} className="relative flex items-start gap-6 sm:pl-16 py-6 group">
                {/* Timeline dot */}
                <div className={`hidden sm:flex absolute left-[18px] w-4 h-4 rounded-full border-2 ${p.status === "active" ? "bg-[#00A86B] border-[#00A86B] shadow-lg shadow-emerald-500/30" : "bg-white dark:bg-slate-900 border-slate-300 dark:border-white/20"} transition-all z-10`} />
                <div className="bg-white dark:bg-white/[0.03] rounded-2xl border border-slate-200 dark:border-white/[0.06] p-6 sm:p-8 flex-1 space-y-3 hover:border-[#00A86B]/20 transition-colors duration-500">
                  <div className="flex items-center gap-3">
                    <p.icon className={`w-4 h-4 ${p.status === "active" ? "text-[#00A86B]" : "text-malazone-navy"}`} />
                    <h4 className="text-sm font-black text-malazone-navy dark:text-white tracking-tight">{p.label}</h4>
                    {p.status === "active" && (
                      <span className="px-2 py-0.5 rounded-full bg-[#00A86B]/10 text-[#00A86B] text-[8px] font-black uppercase tracking-widest">Live</span>
                    )}
                  </div>
                  <p className="text-sm leading-[1.8] text-malazone-navy dark:text-slate-400 font-medium">{p.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* ── Bottom Copyright ── */}
        <div className="pt-12 border-t border-slate-200 dark:border-white/5 text-center">
          <p className="text-[10px] font-bold uppercase tracking-[0.25em] text-malazone-navy dark:text-slate-600">{d.copyright}</p>
        </div>
      </div>
    </div>
  );
};

export default AboutPage;
