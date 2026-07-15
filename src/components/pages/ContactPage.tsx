/**
 * ContactPage.tsx
 * Malazone.com — Contact Support Page
 * © 2026 Malazone Technologies PLC. All Rights Reserved.
 */

import React, { useState } from "react";
import {
  X,
  MapPin,
  Phone,
  Mail,
  Clock,
  Send,
  MessageCircle,
  Headphones,
  Building2,
  Globe,
  CheckCircle,
  Loader2,
  AlertCircle,
} from "lucide-react";
import { useLanguage } from "@/contexts/ZoneLanguageContext";

const t = {
  en: {
    backBtn: "Back to Home",
    badge: "Contact Support",
    title: "Get in Touch",
    subtitle:
      "Our dedicated support team is ready to help you with any inquiries about listings, agent onboarding, payments, or platform navigation. Reach us through any channel below.",

    infoTitle: "Contact Information",
    hqLabel: "Headquarters",
    hqValue: "Hawassa, Sidama Region, Ethiopia\nPiassa Business District, 2nd Floor",
    phoneLabel: "Phone",
    phoneValue: "+251 46 220 XXXX",
    phoneSub: "Mon–Sat, 8:00 AM – 6:00 PM EAT",
    emailLabel: "Email",
    emailValue: "support@malazone.com",
    emailSub: "Response within 24 hours",
    telegramLabel: "Telegram",
    telegramValue: "@MalazoneSupport",
    telegramSub: "Instant messaging support",
    hoursLabel: "Business Hours",
    hoursValue: "Monday – Saturday: 8:00 AM – 6:00 PM\nSunday: Closed (Telegram available)",

    formTitle: "Send Us a Message",
    formName: "Full Name",
    formNamePlaceholder: "Enter your full name",
    formEmail: "Email Address",
    formEmailPlaceholder: "you@example.com",
    formPhone: "Phone Number",
    formPhonePlaceholder: "+251 9XX XXX XXXX",
    formSubject: "Subject",
    formSubjectPlaceholder: "What is this about?",
    formMessage: "Message",
    formMessagePlaceholder: "Describe your inquiry in detail...",
    formSubmit: "Send Message",
    formSuccess: "Message sent successfully! We will respond within 24 hours.",

    supportChannels: "Support Channels",
    channel1Title: "General Inquiries",
    channel1Desc: "Questions about Malazone services, pricing, or listing guidelines. Our team responds within 24 hours via email.",
    channel2Title: "Agent Onboarding",
    channel2Desc: "Ready to become a Mala-Agent? Contact us for onboarding procedures, territory assignments, and Telebirr payout setup.",
    channel3Title: "Technical Support",
    channel3Desc: "Experiencing platform issues? Our engineering team monitors all reports and resolves critical bugs within 4 hours.",
    channel4Title: "Partnership & Enterprise",
    channel4Desc: "For bulk listing agreements, regional franchise inquiries, or API integration partnerships, reach our business development team.",

    officesTitle: "Regional Presence",
    office1: "Hawassa (HQ)",
    office1Addr: "Piassa Business District, 2nd Floor",
    office2: "Yirgalem",
    office2Addr: "Main Avenue, Mala-Agent Hub",
    office3: "Aleta Wondo",
    office3Addr: "Commercial Zone, Ground Floor",

    copyright: "© 2026 Malazone Technologies PLC. All Rights Reserved.",
  },
  amharic: {
    backBtn: "ወደ መነሻ ተመለስ",
    badge: "ደንበኞች አገልግሎት",
    title: "ያነጋግሩን",
    subtitle:
      "የድጋፍ ቡድናችን ስለ ዝርዝሮች፣ የወኪል ምዝገባ፣ ክፍያዎች ወይም የመድረክ አሰሳ ማንኛውንም ጥያቄ ለመርዳት ዝግጁ ነው። ከታች ባሉት ማንኛውም ቻናሎች ያግኙን።",

    infoTitle: "የግንኙነት መረጃ",
    hqLabel: "ዋና መስሪያ ቤት",
    hqValue: "ሐዋሳ፣ ሲዳማ ክልል፣ ኢትዮጵያ\nፒያሳ ቢዝነስ ዲስትሪክት፣ 2ኛ ፎቅ",
    phoneLabel: "ስልክ",
    phoneValue: "+251 46 220 XXXX",
    phoneSub: "ሰኞ–ቅዳሜ ከ 8:00 – 6:00 ሰዓት",
    emailLabel: "ኢሜይል",
    emailValue: "support@malazone.com",
    emailSub: "በ24 ሰዓት ውስጥ ምላሽ",
    telegramLabel: "ቴሌግራም",
    telegramValue: "@MalazoneSupport",
    telegramSub: "ፈጣን መልዕክት ድጋፍ",
    hoursLabel: "የስራ ሰዓት",
    hoursValue: "ሰኞ – ቅዳሜ: 8:00 – 6:00 ሰዓት\nእሁድ: ዝግ (ቴሌግራም ይገኛል)",

    formTitle: "መልዕክት ይላኩልን",
    formName: "ሙሉ ስም",
    formNamePlaceholder: "ሙሉ ስምዎን ያስገቡ",
    formEmail: "ኢሜይል አድራሻ",
    formEmailPlaceholder: "you@example.com",
    formPhone: "ስልክ ቁጥር",
    formPhonePlaceholder: "+251 9XX XXX XXXX",
    formSubject: "ርዕሰ ጉዳይ",
    formSubjectPlaceholder: "ስለ ምን ነው?",
    formMessage: "መልዕክት",
    formMessagePlaceholder: "ጥያቄዎን በዝርዝር ይግለፁ...",
    formSubmit: "መልዕክት ይላኩ",
    formSuccess: "መልዕክት በተሳካ ሁኔታ ተልኳል! በ24 ሰዓት ውስጥ ምላሽ እንሰጣለን።",

    supportChannels: "የድጋፍ ቻናሎች",
    channel1Title: "ጠቅላላ ጥያቄዎች",
    channel1Desc: "ስለ መላዞን አገልግሎቶች፣ ዋጋ ወይም የዝርዝር መመሪያዎች ጥያቄዎች። ቡድናችን በ24 ሰዓት ውስጥ ምላሽ ይሰጣል።",
    channel2Title: "የወኪል ምዝገባ",
    channel2Desc: "መላ-ወኪል ለመሆን ዝግጁ ነዎት? ለምዝገባ ሂደቶች፣ ቴሌብር ክፍያ ማዋቀር ያነጋግሩን።",
    channel3Title: "ቴክኒካል ድጋፍ",
    channel3Desc: "የመድረክ ችግሮች እያጋጠሙዎት? የምህንድስና ቡድናችን ሁሉንም ሪፖርቶች ይከታተላል።",
    channel4Title: "ሽርክና እና ኢንተርፕራይዝ",
    channel4Desc: "ለብዛት ዝርዝር ስምምነቶች ወይም የAPI ውህደት ሽርክና የንግድ ልማት ቡድናችንን ያግኙ።",

    officesTitle: "ክልላዊ ቢሮዎች",
    office1: "ሐዋሳ (ዋና)",
    office1Addr: "ፒያሳ ቢዝነስ ዲስትሪክት፣ 2ኛ ፎቅ",
    office2: "ይርጋዓለም",
    office2Addr: "ዋና አቬኑ፣ መላ-ወኪል ማዕከል",
    office3: "ዓለቱ ወንዶ",
    office3Addr: "የንግድ ዞን፣ መሬት ፎቅ",

    copyright: "© 2026 Malazone Technologies PLC. All Rights Reserved.",
  },
};

interface ContactPageProps {
  onBack: () => void;
}

const ContactPage: React.FC<ContactPageProps> = ({ onBack }) => {
  const { language } = useLanguage();
  const d = t[language as keyof typeof t];
  const [submitted, setSubmitted] = useState(false);
  const [sending, setSending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    full_name: "",
    email: "",
    phone: "",
    subject: "",
    message: "",
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSending(true);
    setError(null);
    try {
      const res = await fetch("/api/site/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });
      const data = await res.json();
      if (!data.success) {
        throw new Error(data.message || "Failed to send message");
      }
      setSubmitted(true);
    } catch (err: any) {
      setError(err.message || "Something went wrong. Please try again.");
    } finally {
      setSending(false);
    }
  };

  const contactInfo = [
    { icon: Building2, label: d.hqLabel, value: d.hqValue, sub: "" },
    { icon: Phone, label: d.phoneLabel, value: d.phoneValue, sub: d.phoneSub },
    { icon: Mail, label: d.emailLabel, value: d.emailValue, sub: d.emailSub },
    { icon: Send, label: d.telegramLabel, value: d.telegramValue, sub: d.telegramSub },
    { icon: Clock, label: d.hoursLabel, value: d.hoursValue, sub: "" },
  ];

  const channels = [
    { icon: MessageCircle, title: d.channel1Title, desc: d.channel1Desc },
    { icon: Globe, title: d.channel2Title, desc: d.channel2Desc },
    { icon: Headphones, title: d.channel3Title, desc: d.channel3Desc },
    { icon: Building2, title: d.channel4Title, desc: d.channel4Desc },
  ];

  const offices = [
    { name: d.office1, addr: d.office1Addr },
    { name: d.office2, addr: d.office2Addr },
    { name: d.office3, addr: d.office3Addr },
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

        {/* ── Hero ── */}
        <section className="text-center space-y-8 animate-fade-in-up">
          <span className="inline-flex items-center gap-2 px-5 py-2 rounded-full bg-[#00A86B]/10 text-[#00A86B] text-[10px] font-black uppercase tracking-[0.25em] border border-[#00A86B]/20">
            <Headphones className="w-3.5 h-3.5" />
            {d.badge}
          </span>
          <h1 className="text-5xl sm:text-6xl lg:text-7xl font-black text-malazone-navy dark:text-white tracking-tighter">
            {d.title}
          </h1>
          <p className="text-lg text-malazone-navy dark:text-slate-400 max-w-2xl mx-auto leading-relaxed font-medium">
            {d.subtitle}
          </p>
        </section>

        {/* ── Contact Info + Form Grid ── */}
        <section className="grid lg:grid-cols-5 gap-8">
          {/* Left: Contact Info Cards */}
          <div className="lg:col-span-2 space-y-4">
            <h3 className="text-xs font-black uppercase tracking-[0.25em] text-malazone-navy dark:text-white flex items-center gap-3 mb-6">
              <div className="w-1 h-6 bg-[#00A86B] rounded-full" />
              {d.infoTitle}
            </h3>
            {contactInfo.map((c, i) => (
              <div
                key={i}
                className="bg-white dark:bg-white/[0.03] rounded-2xl border border-slate-200 dark:border-white/[0.06] p-5 flex items-start gap-4 hover:border-[#00A86B]/30 transition-all duration-500 group"
              >
                <div className="w-10 h-10 rounded-xl bg-[#00A86B]/10 flex items-center justify-center text-[#00A86B] shrink-0 group-hover:scale-110 transition-transform">
                  <c.icon className="w-4.5 h-4.5" />
                </div>
                <div className="space-y-1 min-w-0">
                  <p className="text-[10px] font-black uppercase tracking-[0.2em] text-malazone-navy">{c.label}</p>
                  <p className="text-sm font-bold text-malazone-navy dark:text-white whitespace-pre-line">{c.value}</p>
                  {c.sub && <p className="text-[11px] text-malazone-navy font-medium">{c.sub}</p>}
                </div>
              </div>
            ))}
          </div>

          {/* Right: Contact Form */}
          <div className="lg:col-span-3">
            <div className="bg-white dark:bg-white/[0.03] rounded-3xl border border-slate-200 dark:border-white/[0.06] p-8 sm:p-10 space-y-8">
              <h3 className="text-xs font-black uppercase tracking-[0.25em] text-malazone-navy dark:text-white flex items-center gap-3">
                <div className="w-1 h-6 bg-[#00A86B] rounded-full" />
                {d.formTitle}
              </h3>

              {submitted ? (
                <div className="flex flex-col items-center justify-center py-16 gap-4 animate-fade-in-up">
                  <div className="w-16 h-16 rounded-full bg-[#00A86B]/10 flex items-center justify-center">
                    <CheckCircle className="w-8 h-8 text-[#00A86B]" />
                  </div>
                  <p className="text-sm font-bold text-malazone-navy dark:text-slate-300 text-center max-w-sm">{d.formSuccess}</p>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-5">
                  <div className="grid sm:grid-cols-2 gap-5">
                    <div className="space-y-2">
                      <label className="text-[10px] font-black uppercase tracking-[0.2em] text-malazone-navy">{d.formName}</label>
                      <input
                        type="text"
                        name="full_name"
                        value={formData.full_name}
                        onChange={handleChange}
                        required
                        placeholder={d.formNamePlaceholder}
                        className="w-full px-4 py-3 rounded-xl bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 text-sm font-medium text-malazone-navy dark:text-white placeholder-slate-400 dark:placeholder-slate-600 focus:outline-none focus:border-[#00A86B]/50 focus:ring-2 focus:ring-[#00A86B]/10 transition-all"
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-[10px] font-black uppercase tracking-[0.2em] text-malazone-navy">{d.formEmail}</label>
                      <input
                        type="email"
                        name="email"
                        value={formData.email}
                        onChange={handleChange}
                        required
                        placeholder={d.formEmailPlaceholder}
                        className="w-full px-4 py-3 rounded-xl bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 text-sm font-medium text-malazone-navy dark:text-white placeholder-slate-400 dark:placeholder-slate-600 focus:outline-none focus:border-[#00A86B]/50 focus:ring-2 focus:ring-[#00A86B]/10 transition-all"
                      />
                    </div>
                  </div>
                  <div className="grid sm:grid-cols-2 gap-5">
                    <div className="space-y-2">
                      <label className="text-[10px] font-black uppercase tracking-[0.2em] text-malazone-navy">{d.formPhone}</label>
                      <input
                        type="tel"
                        name="phone"
                        value={formData.phone}
                        onChange={handleChange}
                        required
                        placeholder={d.formPhonePlaceholder}
                        className="w-full px-4 py-3 rounded-xl bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 text-sm font-medium text-malazone-navy dark:text-white placeholder-slate-400 dark:placeholder-slate-600 focus:outline-none focus:border-[#00A86B]/50 focus:ring-2 focus:ring-[#00A86B]/10 transition-all"
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-[10px] font-black uppercase tracking-[0.2em] text-malazone-navy">{d.formSubject}</label>
                      <input
                        type="text"
                        name="subject"
                        value={formData.subject}
                        onChange={handleChange}
                        required
                        placeholder={d.formSubjectPlaceholder}
                        className="w-full px-4 py-3 rounded-xl bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 text-sm font-medium text-malazone-navy dark:text-white placeholder-slate-400 dark:placeholder-slate-600 focus:outline-none focus:border-[#00A86B]/50 focus:ring-2 focus:ring-[#00A86B]/10 transition-all"
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-black uppercase tracking-[0.2em] text-malazone-navy">{d.formMessage}</label>
                    <textarea
                      required
                      name="message"
                      value={formData.message}
                      onChange={handleChange}
                      rows={5}
                      placeholder={d.formMessagePlaceholder}
                      className="w-full px-4 py-3 rounded-xl bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 text-sm font-medium text-malazone-navy dark:text-white placeholder-slate-400 dark:placeholder-slate-600 focus:outline-none focus:border-[#00A86B]/50 focus:ring-2 focus:ring-[#00A86B]/10 transition-all resize-none"
                    />
                  </div>
                  {error && (
                    <div className="flex items-center gap-2 p-3 rounded-xl bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-800 text-xs font-bold text-red-600 dark:text-red-400">
                      <AlertCircle className="w-4 h-4 shrink-0" />
                      {error}
                    </div>
                  )}
                  <button
                    type="submit"
                    disabled={sending}
                    className="w-full sm:w-auto flex items-center justify-center gap-2.5 px-8 py-3.5 rounded-xl bg-[#00A86B] hover:bg-[#00A86B]/90 disabled:opacity-60 text-malazone-navy font-black text-xs uppercase tracking-[0.2em] transition-all duration-300 hover:shadow-lg hover:shadow-emerald-500/20 active:scale-[0.98] group"
                  >
                    {sending ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Send className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />}
                    {sending ? (language === "amharic" ? "በመላክ ላይ..." : "Sending...") : d.formSubmit}
                  </button>
                </form>
              )}
            </div>
          </div>
        </section>

        {/* ── Support Channels Grid ── */}
        <section className="space-y-8">
          <h3 className="text-xs font-black uppercase tracking-[0.25em] text-malazone-navy dark:text-white flex items-center gap-3">
            <div className="w-1 h-6 bg-[#00A86B] rounded-full" />
            {d.supportChannels}
          </h3>
          <div className="grid sm:grid-cols-2 gap-5">
            {channels.map((ch, i) => (
              <div
                key={i}
                className="bg-white dark:bg-white/[0.03] rounded-2xl border border-slate-200 dark:border-white/[0.06] p-6 sm:p-8 space-y-4 hover:border-[#00A86B]/30 transition-all duration-500 group"
              >
                <div className="w-10 h-10 rounded-xl bg-[#00A86B]/10 flex items-center justify-center text-[#00A86B] group-hover:scale-110 transition-transform">
                  <ch.icon className="w-5 h-5" />
                </div>
                <h4 className="text-sm font-black text-malazone-navy dark:text-white tracking-tight">{ch.title}</h4>
                <p className="text-sm leading-[1.8] text-malazone-navy dark:text-slate-400 font-medium">{ch.desc}</p>
              </div>
            ))}
          </div>
        </section>

        {/* ── Regional Offices ── */}
        <section className="space-y-8">
          <h3 className="text-xs font-black uppercase tracking-[0.25em] text-malazone-navy dark:text-white flex items-center gap-3">
            <div className="w-1 h-6 bg-[#00A86B] rounded-full" />
            {d.officesTitle}
          </h3>
          <div className="grid sm:grid-cols-3 gap-5">
            {offices.map((o, i) => (
              <div
                key={i}
                className="bg-white dark:bg-white/[0.03] rounded-2xl border border-slate-200 dark:border-white/[0.06] p-6 flex items-start gap-4 hover:border-[#00A86B]/30 transition-all duration-500 group"
              >
                <div className="w-10 h-10 rounded-xl bg-[#00A86B]/10 flex items-center justify-center text-[#00A86B] shrink-0 group-hover:scale-110 transition-transform">
                  <MapPin className="w-4.5 h-4.5" />
                </div>
                <div className="space-y-1">
                  <p className="text-sm font-black text-malazone-navy dark:text-white">{o.name}</p>
                  <p className="text-xs text-malazone-navy font-medium">{o.addr}</p>
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

export default ContactPage;
