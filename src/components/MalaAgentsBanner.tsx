/**
 * MalaAgentsBanner.tsx
 * Malazone.com — High-conversion community enlistment module
 * © 2026 Malazone Technologies PLC
 */

import React, { useState } from "react";
import { Users, ArrowRight } from "lucide-react";
import { useLanguage } from "@/contexts/ZoneLanguageContext";
import AgentRegistrationModal from "./AgentRegistrationModal";
import { MalaZoneMasterPlayer } from "./MalaZoneVideoPlayer";

const MalaAgentsBanner: React.FC = () => {
  const { t, language } = useLanguage();
  const isAm = language === "amharic";
  const [isModalOpen, setIsModalOpen] = useState(false);

  return (
    <section className="bg-slate-50 dark:bg-slate-950 py-20 px-6 sm:px-12 relative overflow-hidden transition-colors duration-300">
      <div className="max-w-7xl mx-auto">

        {/* Banner Module with Ambient Gradient & Micro-Borders */}
        <div className="relative overflow-hidden rounded-[3rem] bg-gradient-to-br from-white via-slate-50 to-emerald-50/30 dark:from-slate-900 dark:via-slate-950 dark:to-green-950/30 border border-slate-200 dark:border-green-500/10 p-10 sm:p-16 lg:p-20 shadow-xl dark:shadow-2xl backdrop-blur-3xl transition-colors duration-300">

          {/* Parallax Media Glows */}
          <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-green-600/5 blur-[120px] -z-10 animate-pulse" />
          <div className="absolute bottom-0 left-0 w-[300px] h-[300px] bg-emerald-600/5 blur-[80px] -z-10" />

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-16 items-center relative z-10">

            {/* Left: Enlistment Content (8/12 cols) */}
            <div className="lg:col-span-7 space-y-12">
              <div className="inline-flex items-center gap-3 px-5 py-2 rounded-full bg-emerald-50 dark:bg-green-600/10 border border-emerald-200 dark:border-green-600/20 text-emerald-600 dark:text-green-500 text-[11px] font-black uppercase tracking-[0.3em] animate-fade-in">
                <Users className="w-4 h-4" />
                <span>Mala-Agents Zone</span>
                <span className="w-px h-4 bg-emerald-300 dark:bg-green-600/40" />
                <span className="lowercase not-italic tracking-normal text-[11px]">የሥራ ዕድል መላ!</span>
              </div>

              <div className="space-y-8">
                <h2 className="text-4xl sm:text-6xl lg:text-7xl font-black text-malazone-navy dark:text-white leading-[1.05] tracking-tighter uppercase italic transition-colors duration-300">
                  <span className="text-emerald-600 dark:text-green-500 not-italic">
                    {isAm ? "የሥራ ዕድል መላ!" : "Join the Data Engine"}
                  </span>
                </h2>

                <p className="text-xl sm:text-2xl text-malazone-navy dark:text-slate-400 leading-relaxed font-medium max-w-2xl transition-colors duration-300">
                  {t("banner.recruitment")}
                </p>
              </div>

              {/* Interactive Trigger Button */}
              <div className="flex flex-col sm:flex-row items-center gap-8 pt-4">
                <button
                  onClick={() => setIsModalOpen(true)}
                  className="w-full sm:w-auto flex items-center justify-center gap-4 px-12 py-6 rounded-2xl bg-green-600 hover:bg-green-500 text-white shadow-[0_20px_50px_rgba(22,163,74,0.3)] hover:shadow-[0_25px_60px_rgba(22,163,74,0.5)] transition-all duration-500 group scale-100 hover:scale-[1.03] active:scale-95"
                >
                  <span className="text-sm font-black uppercase tracking-[0.3em]">
                    {t("banner.cta")}
                  </span>
                  <ArrowRight className="w-5 h-5 group-hover:translate-x-2 transition-transform duration-500" />
                </button>

                <div className="flex items-center gap-4 px-6 py-3 rounded-2xl bg-slate-100 dark:bg-white/5 border border-slate-200 dark:border-white/10 backdrop-blur-md hover:bg-slate-200 dark:hover:bg-white/10 transition-colors duration-500">
                  <div className="flex -space-x-3">
                    {[1, 2, 3, 4].map((i) => (
                      <div key={i} className="w-10 h-10 rounded-full border-2 border-white dark:border-slate-900 bg-slate-200 dark:bg-slate-800 overflow-hidden shadow-xl ring-1 ring-emerald-500/20 dark:ring-green-500/20 group-hover:ring-emerald-500/50 dark:group-hover:ring-green-500/50 transition-all">
                        <img src={`https://api.dicebear.com/7.x/avataaars/svg?seed=Agent${i + 10}`} alt="Agent" />
                      </div>
                    ))}
                  </div>
                  <div className="flex flex-col">
                    <span className="text-malazone-navy dark:text-white font-black text-xs tracking-tighter">500+ Active</span>
                    <span className="text-[9px] font-bold text-malazone-navy uppercase tracking-widest">
                      {isAm ? "ወኪሎች ተቀላቅለዋል" : "Verified Agents"}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Right: Circular Video Explainer */}
            <div className="lg:col-span-5 flex items-center justify-center">
              <MalaZoneMasterPlayer />
            </div>
          </div>
        </div>
      </div>

      <AgentRegistrationModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
      />
    </section>
  );
};

export default MalaAgentsBanner;
