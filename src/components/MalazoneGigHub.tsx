import React from 'react';
import { Briefcase, Sparkles, ArrowRight, ShieldCheck, Building2, Car, Smartphone } from 'lucide-react';

interface MalazoneGigHubProps {
  currentGlobalLang?: 'am' | 'en';
  onNavigateToOnboard?: () => void;
}

export function MalazoneGigHub({ currentGlobalLang = 'am', onNavigateToOnboard }: MalazoneGigHubProps) {
  
  const t = {
    am: {
      topBadge: "💼 የሥራ ዕድል ማዕከል — Employment Hub",
      heading: "የሥራ ዕድል ማዕከል",
      mainBody: "malazone ለሥራ አጥ ወጣቶች እና ተስፋ ላላቸው ጀማሪዎች አዲስ የኑሮ ዋስትና የሚፈጥር የቴክኖሎጂ ሥነ-ምህዳር ነው። በአካባቢዎ የሚገኙ የሾውሩም መኪናዎችን፣ ከባድ ማሽነሪዎችን፣ ሆቴሎችን፣ የሰርግ ዕቃዎችን፣ ቤቶችን እና ኤሌክትሮኒክስን በይፋዊ መድረካችን ላይ በመመዝገብ፤ ያለ ምንም መነሻ ካፒታል በየቀኑ ከፍተኛ የሥራ አምራች ገቢ ማግኘት ይጀምሩ።",
      steps: [
        { title: "🏠 ፩. ንብረት መፈለግ", desc: "በአካባቢዎ የሚገኙ መኪናዎችን፣ ቤቶችን፣ ማሽነሪዎችን ወይም ስማርት ኤሌክትሮኒክስ ምርቶችን በነፃነት ይለዩ።" },
        { title: "📸 ፪. ፎቶና ሰነድ መቅረጽ", desc: "የንብረቶቹን ትክክለኛ መረጃዎች በስልክዎ በጥራት በመመዝገብ በ malazone 6ቱ የንግድ ዞኖች ላይ ይጫኑ።" },
        { title: "💰 ፫. የኮሚሽን አበል መቀበል", desc: "ንብረቱ በቀጥታ ለገዢ ሲሸጥ ወይም ሲከራይ፣ ያገኙትን ከፍተኛ የኮሚሽን ክፍያ በቀጥታ በባንክ አካውንትዎ ይቀበሉ።" }
      ],
      btnCTA: "አሁኑኑ ማመልከቻ አስገባ"
    },
    en: {
      topBadge: "💼 Youth Gig-Economy Hub",
      heading: "Decentralized Employment Portal",
      mainBody: "malazone operates as an enterprise platform dedicated to creating verified job opportunities for youth with zero initial capital investment. Earn high daily income simply by registering and tracking local assets across our multi-vertical channels.",
      steps: [
        { title: "🏠 1. Locate Local Assets", desc: "Identify available cars, real estate plots, machinery, or premium electronics in your area." },
        { title: "📸 2. Capture Verified Records", desc: "Use your device to legally log specification details and images directly into our database lines." },
        { title: "💰 3. Secure High Payouts", desc: "Get your automated commission share transferred straight into your verified banking account layout." }
      ],
      btnCTA: "Apply For Onboarding Now"
    }
  }[currentGlobalLang];

  return (
    <section className="bg-white text-[#0B132B] py-12 px-6 sm:px-12 lg:px-20 w-full text-left font-sans antialiased select-none rounded-[36px] border border-slate-200 shadow-sm">
      <div className="max-w-4xl mx-auto space-y-6">
        
        <div className="flex items-center">
          <span className="text-[10px] sm:text-xs font-black bg-emerald-50 text-[#00A86B] border border-emerald-200/40 px-3 py-1.5 rounded-full uppercase tracking-wider flex items-center gap-1.5">
            <Sparkles className="size-3.5 text-[#00A86B] animate-pulse" />
            <span>{t.topBadge}</span>
          </span>
        </div>

        <div className="space-y-2">
          <h2 className="text-3xl sm:text-4xl font-black text-slate-900 tracking-tight leading-none">{t.heading}</h2>
        </div>

        <p className="text-xs sm:text-sm text-slate-600 font-medium leading-relaxed max-w-3xl">
          {t.mainBody}
        </p>

        {/* 3-Step Dynamic Timeline Process Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-2">
          {t.steps.map((step, idx) => (
            <div key={idx} className="bg-slate-50 border border-slate-200/80 p-6 rounded-2xl flex flex-col justify-between h-full hover:border-[#00A86B]/30 transition-all duration-300 group">
              <div className="space-y-2">
                <h4 className="text-xs font-black text-slate-900 group-hover:text-[#00A86B] transition-colors">{step.title}</h4>
                <p className="text-[11px] font-bold text-slate-500 leading-loose normal-case">{step.desc}</p>
              </div>
            </div>
          ))}
        </div>

        <div className="pt-4 border-t border-slate-100 flex justify-start">
          <button 
            onClick={onNavigateToOnboard}
            className="bg-[#00A86B] hover:bg-emerald-600 text-black font-black text-xs uppercase tracking-wider px-6 py-4 rounded-2xl transition-all shadow-md shadow-emerald-500/10 flex items-center space-x-2 group cursor-pointer"
          >
            <span>{t.btnCTA}</span>
            <ArrowRight className="size-4 group-hover:translate-x-1.5 transition-transform" />
          </button>
        </div>

      </div>
    </section>
  );
}
