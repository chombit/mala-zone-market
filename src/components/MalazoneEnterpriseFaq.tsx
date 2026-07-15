import React, { useState } from 'react';
import { HelpCircle, ChevronDown, ChevronUp, Sparkles, ShieldCheck, ArrowLeft, X, Building, Landmark, Scale } from 'lucide-react';

interface MalazoneEnterpriseFaqProps {
  currentGlobalLang?: 'am' | 'en';
  onBackToMain?: () => void;
}

export function MalazoneEnterpriseFaq({ currentGlobalLang = 'am', onBackToMain }: MalazoneEnterpriseFaqProps) {
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  // 🌐 BILINGUAL FAQ DATA ARCHIVE (100% INSTITUTIONAL & GOV-ALIGNED)
  const faqData = {
    am: {
      topBadge: "🛡️ ይፋዊ የደህንነት ማረጋገጫ — Institutional FAQ Portal",
      heading: "ተደጋጋሚ ጥያቄዎች (FAQ)",
      subMotto: "ከመንግሥት ሕጋዊ መዛግብት ጋር የተቆራኘ ደህንነቱ የተረጋገጠ ቀጥተኛ የግብይት ሥነ-ምህዳር",
      questions: [
        {
          q: "፩. malazone ምንድን ነው? ከሌሎች ድረ-ገጾችስ በምን ይለያል?",
          a: "malazone ሻጮችን፣ ገዢዎችን እና አከራዮችን ያለምንም የደላላ ጣልቃ-ገብነት በቀጥታ የሚያገናኝ የታመነ ብሔራዊ የዲጂታል ሥነ-ምህዳር ነው። ከተራ ማስታወቂያ ድረ-ገጾች የሚለየው እያንዳንዱ የቤት፣ የመኪና፣ የሆቴል፣ የማሽነሪ እና የኤሌክትሮኒክስ መረጃ ከመንግሥት ይፋዊ የሕግ መዛግብት ጋር ኦዲት ተደርጎ የሚጫንበት ከፍተኛ የታማኝነት ዋስትና ስላለው ነው።"
        },
        {
          q: "፪. በ malazone ላይ የሚጫኑ ንብረቶች ሕጋዊነታቸው እንዴት ይረጋገጣል?",
          a: "መድረኩ ከመንግሥት ተቋማት ጋር በቀጥታ የተቆራኘ መዋቅር አለው። በቤትና መሬት ዞን የሚመዘገቡ ይዞታዎች ከከተማ ማዘጋጃ ቤቶች የመሬት ማህደር (CATA Document) ጋር የሚጣሩ ሲሆን፤ በመኪናና ከባድ ማሽነሪ ዞን የሚጫኑ ተሽከርካሪዎች ደግሞ ከክልል ትራንስፖርት ቢሮዎች የባለቤትነት መዛግብት (Libre) ጋር ትክክለኛነታቸው በሕጋዊ መንገድ ኦዲት ይደረጋል።"
        },
        {
          q: "፫. መድረኩ አገልግሎቱን የሚያቀርበው በምን ዓይነት የገቢ ሥርዓት ነው?",
          a: "malazone ከደላላ ንክኪ ነፃ የሆነ ግልጽ የኢንተርፕራይዝ የንግድ ሥርዓት አለው። መድረኩ ገቢ የሚያመነጨው በሲስተሙ በኩል ለሚፈጸሙ ቀጥተኛ ግብይቶች ከሚከፈል እጅግ አነስተኛ እና ሕጋዊ የቴክኖሎጂ አገልግሎት ክፍያ (Processing Fee) እና ንብረቶቻቸው ለአገር ውስጥና ለዲያስፖራ ገዢዎች በቀዳሚነት እንዲታዩ ለሚፈልጉ ባለቤቶች ከሚሰጥ የደመቁ ማስታወቂያዎች (Promoted Listings) ነው።"
        },
        {
          q: "፬. ገዢዎችና ሻጮች ያለምንም ስጋት በቀጥታ መገበያየት የሚችሉት እንዴት ነው?",
          a: "ሁሉም ግብይቶች ከደላላ ጣልቃ-ገብነት ነፃ በመሆናቸው ገዢ እና ሻጭ በቀጥታ ይገናኛሉ። ንብረቶቹ አስቀድመው የመንግሥት የሰነድ ማረጋገጫ ኦዲት ያለፉ በመሆናቸው፤ ዲያስፖራዎችም ሆኑ የአገር ውስጥ ባለሀብቶች ያለምንም የደህንነት ስጋት፣ ውዥንብር እና አላስፈላጊ የዋጋ ግሽበት ግብይቶቻቸውን በፍጥነት እና በሕጋዊ መንገድ ያጠናቅቃሉ።"
        }
      ]
    },
    en: {
      topBadge: "🛡️ Institutional Compliance — FAQ Portal",
      heading: "Ecosystem FAQ Knowledge Base",
      subMotto: "Fully secure peer-to-peer transactional infrastructure synchronized with official government registries.",
      questions: [
        {
          q: "1. What is malazone and how does it establish transactional trust?",
          a: "malazone is an institutional digital ecosystem that enables direct, broker-free trade for property owners, buyers, and renters. Unlike unverified classified websites, every listing across our sectors is bound to a strict compliance audit framework directly linked to legal state records."
        },
        {
          q: "2. How are listings verified against official government archives?",
          a: "Our infrastructure features multi-tier synchronization. Real estate, plots, and commercial properties are cross-checked with city municipality land registries (CATA deeds), while showroom vehicles and heavy duty machinery are rigorously audited against regional transportation registry archives (Libre title ledgers)."
        },
        {
          q: "3. What is the business revenue model if middleman margins are eliminated?",
          a: "malazone operates a transparent corporate FinTech infrastructure. Monetization is generated via a fixed legal technology processing fee per successful direct execution and high-visibility data sorting channels (Promoted Premium Listings) tailored for local and international diaspora investors."
        },
        {
          q: "4. Why can consumers trade directly with absolute peace of mind?",
          a: "By removing unauthorized middleman friction and introducing strict document auditing, both asset owners and diaspora buyers can interface with total clarity. This transparency eliminates artificial price markups, ensuring rapid, legally sound, and completely secure transactions."
        }
      ]
    }
  }[currentGlobalLang];

  return (
    <section className="bg-slate-50 text-[#0B132B] min-h-screen py-12 px-4 sm:px-8 lg:px-16 text-left font-sans antialiased select-none relative">
      <div className="max-w-3xl mx-auto space-y-6">
        
        {/* 🔙 BACK BUTTON CONTROL TRACK */}
        {onBackToMain && (
          <div className="flex justify-end mb-2">
            <button 
              onClick={onBackToMain}
              className="p-2 rounded-full hover:bg-slate-200 text-slate-500 hover:text-slate-900 transition-all cursor-pointer"
              title="Close"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        )}

        {/* 🏢 FAQ HEAD OFFICE CAP */}
        <div className="bg-white border border-slate-200 p-6 rounded-3xl shadow-sm space-y-3">
          <div className="flex items-center">
            <span className="text-[10px] sm:text-xs font-black bg-emerald-50 text-[#00A86B] border border-emerald-200/40 px-3 py-1.5 rounded-full uppercase tracking-wider flex items-center gap-1.5">
              <Landmark className="size-3.5 text-[#00A86B]" />
              <span>{faqData.topBadge}</span>
            </span>
          </div>
          <div className="space-y-1">
            <h2 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">{faqData.heading}</h2>
            <p className="text-xs sm:text-sm text-slate-500 font-bold leading-relaxed">{faqData.subMotto}</p>
          </div>
        </div>

        {/* 🕹️ ACCORDION QUESTION LOOP MATRIX */}
        <div className="space-y-3">
          {faqData.questions.map((item, index) => {
            const isOpen = openIndex === index;
            return (
              <div 
                key={index}
                className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-sm transition-all duration-300"
              >
                {/* Accordion Toggle Header Target */}
                <button
                  onClick={() => setOpenIndex(isOpen ? null : index)}
                  className="w-full p-5 flex items-center justify-between text-left focus:outline-none cursor-pointer group hover:bg-slate-50/50"
                >
                  <span className="text-xs sm:text-sm font-black text-slate-900 tracking-tight group-hover:text-[#00A86B] transition-colors leading-relaxed">
                    {item.q}
                  </span>
                  <div className="text-[#00A86B] shrink-0 ml-4">
                    {isOpen ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                  </div>
                </button>

                {/* Smooth Expandable Panel Box (Fixed Text Overlap) */}
                {isOpen && (
                  <div className="px-5 pb-5 pt-1 border-t border-slate-100 text-xs sm:text-sm text-slate-600 font-medium leading-loose animate-in slide-in-from-top-2 duration-300 normal-case">
                    <p className="font-sans">
                      {item.a}
                    </p>
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* 🛡️ STATE-ALIGNED COMPLIANCE BADGE FRAME */}
        <div className="bg-emerald-50/60 border border-emerald-100 p-4 rounded-2xl flex items-start space-x-3 mt-4">
          <ShieldCheck className="size-5 text-[#00A86B] shrink-0 mt-0.5" />
          <div className="space-y-1">
            <h5 className="text-xs font-black text-emerald-950 uppercase tracking-wider flex items-center gap-1">
              <Scale className="size-3.5 text-[#00A86B]" />
              <span>G2B Document Verification Moat</span>
            </h5>
            <p className="text-[11px] text-emerald-800 font-bold leading-relaxed normal-case">
              Every data ledger is securely cross-audited against municipal structural records and transportation authority databases to guarantee absolute compliance and asset authentication loops.
            </p>
          </div>
        </div>

      </div>
    </section>
  );
}
