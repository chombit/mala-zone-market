/**
 * PrivacyPage.tsx
 * Malazone.com — Privacy Policy Page
 * © 2026 Malazone Technologies PLC. All Rights Reserved.
 */

import React from "react";
import {
  ArrowLeft,
  Shield,
  Eye,
  Lock,
  Database,
  UserCheck,
  FileText,
  AlertTriangle,
  Globe,
  Sparkles,
  Mail,
} from "lucide-react";
import { useLanguage } from "@/contexts/ZoneLanguageContext";

const t = {
  en: {
    backBtn: "Back to Home",
    badge: "Privacy Policy",
    title: "Your Privacy Matters",
    subtitle:
      "Malazone Technologies PLC is committed to protecting the privacy and security of our users. This policy explains how we collect, use, store, and protect your personal data when you use our platform.",
    effectiveDate: "Effective Date: January 1, 2026",
    lastUpdated: "Last Updated: June 15, 2026",

    sections: [
      {
        icon: "Database",
        title: "1. Information We Collect",
        content: [
          "Account Registration Data: When you create a Malazone account, we collect your full name, phone number, email address, preferred language, and regional location (city/zone). This information is required to personalize your marketplace experience and connect you with relevant listings.",
          "Listing Data: When you post an asset listing (property, vehicle, ceremony equipment, or machinery), we collect the listing details you provide including photographs, descriptions, pricing, location coordinates, and category metadata. All listing images are stored securely on our cloud infrastructure.",
          "Transaction Records: We maintain records of all inquiries, booking requests, and completed transactions facilitated through the Malazone platform. This includes timestamps, counterparty identifiers, and communication logs.",
          "Device & Usage Data: We automatically collect device type, operating system, browser version, IP address, session duration, and page interaction patterns to improve platform performance and security. This data is anonymized and aggregated for analytics purposes.",
          "Mala-Agent Data: If you register as a Mala-Agent, we additionally collect your national ID information, assigned territory zone, Telebirr payment credentials, and field verification activity logs.",
        ],
      },
      {
        icon: "Eye",
        title: "2. How We Use Your Data",
        content: [
          "Service Delivery: To display relevant listings, match buyers with sellers, process booking requests, and facilitate direct communication between parties across all five asset zones (Property, Motors, Stay & Hall, Ceremony, Heavy Machinery).",
          "Identity Verification: To verify user identities through our three-tier verification pipeline, ensuring that property title deeds, vehicle registrations, and business licenses are authentic before listings go live.",
          "Payment Processing: To facilitate Telebirr-based payouts for Mala-Agents and process any platform transaction fees. Malazone does not store complete payment credentials — all financial transactions are processed through authorized Ethiopian payment gateways.",
          "Platform Improvement: To analyze usage patterns, identify technical issues, optimize search algorithms, and develop new features that enhance the Ethiopian digital marketplace experience.",
          "Communications: To send essential service notifications, listing status updates, agent assignment alerts, and — with your explicit consent — promotional communications about new zones, regional expansions, and platform features.",
          "Legal Compliance: To comply with Ethiopian Federal data protection regulations, respond to lawful government requests, and protect the rights and safety of our users and the general public.",
        ],
      },
      {
        icon: "Lock",
        title: "3. Data Protection & Security",
        content: [
          "Encryption: All data transmitted between your device and Malazone servers is encrypted using TLS 1.3 (Transport Layer Security). Sensitive data at rest is encrypted using AES-256 encryption standards.",
          "Access Controls: We implement strict role-based access controls (RBAC) within our engineering and operations teams. Only authorized personnel with legitimate business need can access user data, and all access is logged and audited.",
          "Infrastructure Security: Our platform is hosted on enterprise-grade cloud infrastructure with automated threat detection, DDoS protection, daily encrypted backups, and geographic redundancy across multiple data centers.",
          "Incident Response: We maintain a dedicated security incident response team that monitors for breaches 24/7. In the event of a data breach, affected users will be notified within 72 hours in compliance with Ethiopian data protection law.",
          "Agent Data Handling: Mala-Agents who access user contact information during field verification are bound by strict confidentiality agreements. Any unauthorized disclosure of user data by agents results in immediate termination and legal action.",
        ],
      },
      {
        icon: "UserCheck",
        title: "4. Your Rights",
        content: [
          "Access: You have the right to request a complete copy of all personal data we hold about you. Submit your request via support@malazone.com and we will respond within 14 business days.",
          "Correction: You may update or correct any inaccurate personal information through your account settings or by contacting our support team directly.",
          "Deletion: You may request the deletion of your account and all associated personal data. Upon receiving a valid deletion request, we will permanently remove your data within 30 days, except where retention is required by Ethiopian law.",
          "Data Portability: You have the right to receive your personal data in a structured, commonly used, machine-readable format (JSON or CSV) for transfer to another service provider.",
          "Objection: You may object to the processing of your personal data for direct marketing purposes at any time. We will cease marketing communications within 48 hours of receiving your objection.",
          "Withdrawal of Consent: Where we process your data based on consent, you may withdraw that consent at any time without affecting the lawfulness of processing performed before withdrawal.",
        ],
      },
      {
        icon: "Globe",
        title: "5. Data Sharing & Third Parties",
        content: [
          "No Sale of Data: Malazone Technologies PLC does not sell, rent, or trade your personal data to any third party for marketing or commercial purposes. This is an absolute and non-negotiable commitment.",
          "Service Providers: We share limited data with vetted third-party service providers who assist with cloud hosting, analytics, and SMS/notification delivery. All providers are contractually bound to protect your data and use it only for the specified service.",
          "Legal Requirements: We may disclose personal data when required by Ethiopian Federal law, court order, or legitimate government investigation. We will notify affected users unless legally prohibited from doing so.",
          "Business Transfers: In the event of a merger, acquisition, or sale of Malazone Technologies PLC, your personal data may be transferred as part of the business assets. You will be notified of any such transfer and given the option to delete your account.",
        ],
      },
      {
        icon: "FileText",
        title: "6. Cookies & Tracking",
        content: [
          "Essential Cookies: We use strictly necessary cookies to maintain your login session, language preference (English/Amharic), theme preference (Light/Dark), and active zone selection. These cookies cannot be disabled without breaking core platform functionality.",
          "Analytics Cookies: With your consent, we use privacy-respecting analytics to understand how users navigate the platform, which zones receive the most traffic, and which search filters are most popular. This data is aggregated and cannot identify individual users.",
          "No Third-Party Advertising: Malazone does not use third-party advertising cookies or tracking pixels. We do not participate in cross-site tracking or behavioral advertising networks.",
        ],
      },
      {
        icon: "AlertTriangle",
        title: "7. Children's Privacy",
        content: [
          "Malazone services are intended for users aged 18 and above. We do not knowingly collect personal data from individuals under 18 years of age. If we discover that a minor has created an account, we will immediately delete all associated data and terminate the account.",
        ],
      },
      {
        icon: "Shield",
        title: "8. Policy Updates",
        content: [
          "We may update this Privacy Policy periodically to reflect changes in our data practices, legal requirements, or platform features. Material changes will be communicated through in-app notifications and email to registered users at least 14 days before taking effect.",
          "Your continued use of the Malazone platform after the effective date of an updated policy constitutes acceptance of the revised terms.",
        ],
      },
    ],

    contactTitle: "Privacy Inquiries",
    contactText:
      "For any questions, concerns, or requests regarding this Privacy Policy or your personal data, please contact our Data Protection Officer:",
    contactEmail: "privacy@malazone.com",
    contactAddress: "Malazone Technologies PLC\nPiassa Business District, 2nd Floor\nHawassa, Sidama Region, Ethiopia",

    copyright: "© 2026 Malazone Technologies PLC. All Rights Reserved.",
  },
  amharic: {
    backBtn: "ወደ መነሻ ተመለስ",
    badge: "የግል ምስጢር ጥበቃ",
    title: "ግላዊነትዎ ለእኛ ቅድሚያ ነው",
    subtitle:
      "መላዞን ቴክኖሎጂስ ኃ/የተ/ማህበር የተጠቃሚዎችን ግላዊነት እና ደህንነት ለመጠበቅ ቁርጠኛ ነው። ይህ ፖሊሲ መድረኩን ሲጠቀሙ የግል ውሂብዎን እንዴት እንደምንሰበስብ፣ እንደምንጠቀም፣ እንደምናከማች እና እንደምንጠብቅ ያብራራል።",
    effectiveDate: "ተፈፃሚ ቀን: ጥር 1፣ 2026",
    lastUpdated: "የመጨረሻ ዝመና: ሰኔ 15፣ 2026",

    sections: [
      {
        icon: "Database",
        title: "1. የምንሰበስበው መረጃ",
        content: [
          "የመለያ ምዝገባ ውሂብ: የመላዞን መለያ ሲፈጥሩ ሙሉ ስም፣ ስልክ ቁጥር፣ ኢሜይል፣ ቋንቋ ምርጫ እና ክልላዊ ቦታ (ከተማ/ዞን) እንሰበስባለን።",
          "የዝርዝር ውሂብ: የንብረት ዝርዝር ሲለጥፉ ፎቶግራፎችን፣ መግለጫዎችን፣ ዋጋን፣ ቦታ ቅንብሮችን እና የምድብ ማብራሪያ እንሰበስባለን።",
          "የግብይት መዛግብት: በመላዞን መድረክ የሚካሄዱ ሁሉንም ጥያቄዎች፣ ቦታ ማስያዣ ጥያቄዎች እና የተጠናቀቁ ግብይቶች መዛግብት እንጠብቃለን።",
          "የመሳሪያ እና አጠቃቀም ውሂብ: የመሳሪያ ዓይነት፣ ኦፕሬቲንግ ሲስተም፣ ብራውዘር ስሪት እና ክፍለ ጊዜ ቆይታ በራስ ሰር እንሰበስባለን።",
          "የመላ-ወኪል ውሂብ: እንደ ወኪል ከተመዘገቡ ብሔራዊ መታወቂያ፣ የተመደበ ቦታ ዞን እና የቴሌብር ክፍያ ምስክርነት እንሰበስባለን።",
        ],
      },
      {
        icon: "Eye",
        title: "2. ውሂብዎን እንዴት እንጠቀማለን",
        content: [
          "አገልግሎት መስጠት: ተዛማጅ ዝርዝሮችን ለማሳየት፣ ገዥዎችን ከሻጮች ጋር ለማገናኘት እና ቀጥተኛ ግንኙነትን ለማመቻቸት።",
          "ማንነት ማረጋገጫ: በሶስት-ደረጃ ማረጋገጫ ስርዓት የተጠቃሚ ማንነቶችን ለማረጋገጥ።",
          "ክፍያ ማስተናገድ: ለመላ-ወኪሎች የቴሌብር ክፍያዎችን ለማመቻቸት።",
          "መድረክ ማሻሻል: የአጠቃቀም ንድፎችን ለመተንተን እና አዲስ ባህሪያትን ለማዘጋጀት።",
          "ግንኙነቶች: አስፈላጊ የአገልግሎት ማሳወቂያዎችን ለመላክ።",
          "ህጋዊ ተገዢነት: የኢትዮጵያ ፌዴራል ህጎችን ለማክበር።",
        ],
      },
      {
        icon: "Lock",
        title: "3. ውሂብ ጥበቃ እና ደህንነት",
        content: [
          "ምስጢር ማድረግ: ሁሉም ውሂብ በTLS 1.3 ተሸፍሯል። ሚስጥራዊ ውሂብ በAES-256 ይጠበቃል።",
          "የመዳረሻ ቁጥጥር: ጥብቅ ሚና-ተመስርት የመዳረሻ ቁጥጥር (RBAC) እንተገብራለን።",
          "መሠረተ ልማት ደህንነት: መድረካችን ኢንተርፕራይዝ-ደረጃ ደመና ላይ ነው።",
          "ክስተት ምላሽ: 24/7 የጸጥታ ክትትል ቡድን አለን።",
          "የወኪል ውሂብ አያያዝ: ወኪሎች ጥብቅ ሚስጥር ስምምነት ይገዛቸዋል።",
        ],
      },
      {
        icon: "UserCheck",
        title: "4. መብቶችዎ",
        content: [
          "መዳረሻ: ያለንዎትን ሁሉንም የግል ውሂብ ቅጂ መጠየቅ ይችላሉ።",
          "ማስተካከል: ማንኛውንም ትክክለኛ ያልሆነ መረጃ ማዘመን ይችላሉ።",
          "መሰረዝ: መለያዎን እና ሁሉንም ተዛማጅ ውሂብ መሰረዝ መጠየቅ ይችላሉ።",
          "ውሂብ ማስተላለፍ: ውሂብዎን በJSON ወይም CSV ቅርጸት መቀበል ይችላሉ።",
          "ተቃውሞ: ለቀጥተኛ ግብይት ዓላማ ውሂብዎ ሂደት ማቃወም ይችላሉ።",
          "ፈቃድ ማነሳት: በፈቃድ ላይ ተመስርተው ውሂብዎን ስንጠቀም ያንን ፈቃድ ማንሳት ይችላሉ።",
        ],
      },
      {
        icon: "Globe",
        title: "5. ውሂብ ማጋራት",
        content: [
          "ውሂብ አይሸጥም: መላዞን ለማንኛውም ሶስተኛ ወገን የግል ውሂብ አይሸጥም፣ አይከራይም ወይም አይለዋወጥም።",
          "አገልግሎት ሰጪዎች: ውስን ውሂብ ከተረጋገጡ ሶስተኛ ወገን አገልግሎት ሰጪዎች ጋር እናጋራለን።",
          "ህጋዊ ግዴታዎች: በኢትዮጵያ ህግ ሲጠየቅ ግላዊ ውሂብ ልናሳውቅ እንችላለን።",
          "የንግድ ዝውውር: በውህደት ወይም ግዢ ጊዜ ውሂብዎ ሊተላለፍ ይችላል።",
        ],
      },
      {
        icon: "FileText",
        title: "6. ኩኪዎች",
        content: [
          "አስፈላጊ ኩኪዎች: የመግቢያ ክፍለ ጊዜ፣ ቋንቋ ምርጫ እና ገጽታ ምርጫ ለመጠበቅ ኩኪዎችን እንጠቀማለን።",
          "ትንተና ኩኪዎች: በፈቃድዎ ግላዊነትን የሚያከብር ትንተና እንጠቀማለን።",
          "ሶስተኛ ወገን ማስታወቂያ የለም: የሶስተኛ ወገን ማስታወቂያ ኩኪዎች አንጠቀምም።",
        ],
      },
      {
        icon: "AlertTriangle",
        title: "7. የህፃናት ግላዊነት",
        content: [
          "የመላዞን አገልግሎቶች ከ18 ዓመት በላይ ላሉ ተጠቃሚዎች የተዘጋጁ ናቸው። ከ18 ዓመት በታች ያሉ ግለሰቦችን ውሂብ ለመሰብሰብ ተቀባይነት የለንም።",
        ],
      },
      {
        icon: "Shield",
        title: "8. ፖሊሲ ዝመናዎች",
        content: [
          "ይህን ፖሊሲ በየጊዜው ማዘመን እንችላለን። ትልቅ ለውጦች ተፈፃሚ ከመሆናቸው 14 ቀናት በፊት ይገለፃሉ።",
          "ከዝመና ቀን በኋላ መድረኩን መጠቀሙ የተሻሻለውን ፖሊሲ ተቀባይነት ያሳያል።",
        ],
      },
    ],

    contactTitle: "የግላዊነት ጥያቄዎች",
    contactText:
      "ስለዚህ ፖሊሲ ወይም ስለ ግል ውሂብዎ ማንኛውንም ጥያቄ ወይም ስጋት ካለዎት የውሂብ ጥበቃ ኦፊሰራችንን ያነጋግሩ:",
    contactEmail: "privacy@malazone.com",
    contactAddress: "መላዞን ቴክኖሎጂስ ኃ/የተ/ማህበር\nፒያሳ ቢዝነስ ዲስትሪክት፣ 2ኛ ፎቅ\nሐዋሳ፣ ሲዳማ ክልል፣ ኢትዮጵያ",

    copyright: "© 2026 Malazone Technologies PLC. All Rights Reserved.",
  },
};

const iconMap: Record<string, any> = {
  Database,
  Eye,
  Lock,
  UserCheck,
  Globe,
  FileText,
  AlertTriangle,
  Shield,
};

interface PrivacyPageProps {
  onBack: () => void;
}

const PrivacyPage: React.FC<PrivacyPageProps> = ({ onBack }) => {
  const { language } = useLanguage();
  const d = t[language as keyof typeof t];

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 transition-colors duration-300">
      {/* ── Back Button Bar ── */}
      <div className="sticky top-0 z-50 bg-white/80 dark:bg-slate-950/80 backdrop-blur-xl border-b border-slate-200 dark:border-white/5">
        <div className="max-w-4xl mx-auto px-6 py-4 flex items-center gap-4">
          <button
            onClick={onBack}
            className="flex items-center gap-2 px-4 py-2 rounded-full bg-slate-100 dark:bg-white/5 border border-slate-200 dark:border-white/10 text-slate-700 dark:text-slate-300 hover:border-[#00A86B]/40 hover:text-[#00A86B] transition-all duration-300 text-xs font-bold uppercase tracking-widest group"
          >
            <ArrowLeft className="w-3.5 h-3.5 group-hover:-translate-x-1 transition-transform" />
            {d.backBtn}
          </button>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-6 py-16 space-y-16">

        {/* ── Hero ── */}
        <section className="text-center space-y-8 animate-fade-in-up">
          <span className="inline-flex items-center gap-2 px-5 py-2 rounded-full bg-[#00A86B]/10 text-[#00A86B] text-[10px] font-black uppercase tracking-[0.25em] border border-[#00A86B]/20">
            <Shield className="w-3.5 h-3.5" />
            {d.badge}
          </span>
          <h1 className="text-5xl sm:text-6xl lg:text-7xl font-black text-slate-900 dark:text-white tracking-tighter">
            {d.title}
          </h1>
          <p className="text-lg text-slate-600 dark:text-slate-400 max-w-2xl mx-auto leading-relaxed font-medium">
            {d.subtitle}
          </p>
          <div className="flex items-center justify-center gap-6 text-[10px] font-bold uppercase tracking-[0.2em] text-slate-400">
            <span>{d.effectiveDate}</span>
            <span className="w-1 h-1 rounded-full bg-slate-300" />
            <span>{d.lastUpdated}</span>
          </div>
        </section>

        {/* ── Policy Sections ── */}
        <div className="space-y-8">
          {d.sections.map((section, i) => {
            const IconComp = iconMap[section.icon] || Shield;
            return (
              <section
                key={i}
                className="bg-white dark:bg-white/[0.03] rounded-3xl border border-slate-200 dark:border-white/[0.06] p-8 sm:p-10 space-y-6 hover:border-[#00A86B]/15 transition-colors duration-500"
              >
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 rounded-xl bg-[#00A86B]/10 flex items-center justify-center text-[#00A86B] shrink-0">
                    <IconComp className="w-5 h-5" />
                  </div>
                  <h2 className="text-lg font-black text-slate-900 dark:text-white tracking-tight">{section.title}</h2>
                </div>
                <div className="space-y-4 pl-14">
                  {section.content.map((paragraph, j) => (
                    <p key={j} className="text-sm leading-[1.9] text-slate-600 dark:text-slate-400 font-medium">
                      {paragraph}
                    </p>
                  ))}
                </div>
              </section>
            );
          })}
        </div>

        {/* ── Contact DPO ── */}
        <section className="bg-gradient-to-br from-[#00A86B]/5 to-emerald-500/[0.02] dark:from-[#00A86B]/[0.03] dark:to-transparent rounded-3xl border border-[#00A86B]/20 p-8 sm:p-10 space-y-6">
          <div className="flex items-center gap-4">
            <div className="w-10 h-10 rounded-xl bg-[#00A86B]/10 flex items-center justify-center text-[#00A86B]">
              <Mail className="w-5 h-5" />
            </div>
            <h3 className="text-lg font-black text-slate-900 dark:text-white tracking-tight">{d.contactTitle}</h3>
          </div>
          <p className="text-sm leading-[1.8] text-slate-600 dark:text-slate-400 font-medium pl-14">{d.contactText}</p>
          <div className="pl-14 space-y-2">
            <p className="text-sm font-black text-[#00A86B]">{d.contactEmail}</p>
            <p className="text-sm text-slate-600 dark:text-slate-400 font-medium whitespace-pre-line">{d.contactAddress}</p>
          </div>
        </section>

        {/* ── Bottom Copyright ── */}
        <div className="pt-12 border-t border-slate-200 dark:border-white/5 text-center">
          <p className="text-[10px] font-bold uppercase tracking-[0.25em] text-slate-400 dark:text-slate-600">{d.copyright}</p>
        </div>
      </div>
    </div>
  );
};

export default PrivacyPage;
