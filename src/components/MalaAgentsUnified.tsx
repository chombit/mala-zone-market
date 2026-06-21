import React, { useState } from 'react';
import { Play, Building2, Car, Hotel, PartyPopper, Tractor, Wallet, ShieldCheck, PhoneCall, ArrowRight, Sparkles, X } from 'lucide-react';

export function MalaAgentsUnified() {
  const [isPlaying, setIsPlaying] = useState(false);
  const [hoveredLabel, setHoveredLabel] = useState<{ am: string; en: string } | null>(null);

  const malazoneOrbits = [
    { id: 1, icon: <Building2 className="size-5" />, am: 'የቤትና ይዞታ ዞን (Property Zone)', en: 'Property & Real Estate', pos: 'top-0 left-1/2 -translate-x-1/2 -translate-y-1/2' },
    { id: 2, icon: <Car className="size-5" />, am: 'የመኪናና ኤሌክትሪክ ዞን (Motors Zone)', en: 'Motors & EV Vehicles', pos: 'top-1/4 right-6 -translate-y-1/2' },
    { id: 3, icon: <Hotel className="size-5" />, am: 'የጉዞና ማረፊያ ዞን (Stay & Halls)', en: 'Rooms, Guest Houses & Halls', pos: 'top-1/2 right-0 translate-x-1/2 -translate-y-1/2' },
    { id: 4, icon: <PartyPopper className="size-5" />, am: 'የክብረ-በዓላት ዞን (Ceremony Hub)', en: 'Wedding Gear & DJ Systems', pos: 'bottom-1/4 right-6 translate-y-1/2' },
    { id: 5, icon: <Tractor className="size-5" />, am: 'የከባድ ማሽነሪዎች ዞን (Machinery Zone)', en: 'Heavy Machineries & Trucks', pos: 'bottom-0 left-1/2 -translate-x-1/2 translate-y-1/2' },
    { id: 6, icon: <Wallet className="size-5" />, am: 'የወኪል ወጣቶች ክፍያ (Mala-Agents)', en: 'Weekly Telebirr Payout Loop', pos: 'bottom-1/4 left-6 translate-y-1/2' },
    { id: 7, icon: <ShieldCheck className="size-5" />, am: 'የማዘጋጃ ቤት ኦዲት (G2B Link)', en: 'Municipal Deed Verification', pos: 'top-1/2 left-0 -translate-x-1/2 -translate-y-1/2' },
    { id: 8, icon: <PhoneCall className="size-5" />, am: 'የቀጥታ ስልክና ጥሪ (Support Matrix)', en: 'Direct Owner Call & Telegram', pos: 'top-1/4 left-6 -translate-y-1/2' },
  ];

  return (
    <section className="bg-slate-50 text-slate-900 py-16 px-6 sm:px-12 lg:px-20 w-full text-left font-sans antialiased select-none">
      <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16 items-center">

        {/* Left Column - Premium Text & Actions */}
        <div className="lg:col-span-6 space-y-7">

          {/* Top Badge Rows */}
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-[10px] sm:text-xs font-black bg-emerald-50 text-[#00A86B] border border-emerald-200 px-3 py-1.5 rounded-full uppercase tracking-wider">
              💼 Mala-Agents Zone
            </span>
            <span className="text-[10px] sm:text-xs font-black bg-amber-50 text-amber-700 border border-amber-200 px-3 py-1.5 rounded-full uppercase tracking-wider">
              🔥 የሥራ ዕድል መላ!
            </span>
          </div>

          {/* Main Headings */}
          <h2 className="text-4xl sm:text-5xl font-black text-[#00A86B] tracking-tight leading-none">
            የሥራ ዕድል መላ!
          </h2>

          {/* Main Paragraph Descriptions */}
          <p className="text-xs sm:text-sm text-slate-600 font-bold leading-[1.8] sm:leading-relaxed">
            ለደላላዎች፣ ለወኪሎችና ለወጣቶች የቀረበ ታላቅ የስራ መላ! በሐዋሳ፣ በይርጋለም፣ በአሌታ ወንዶ፣ በቤንሳ/ዳዬ፣ በጩቆ እና በሌሎችም የአካባቢው ዞኖች ያሉ የመኪና ማሳያዎችን፣ ከባድ ማሽነሪዎችን፣ ሆቴሎችን፣ ጌስት ሃውሶችን፣ የሰርግ ዕቃዎችን እና የመሬት ይዞታዎችን በመላዞን ህጋዊ የሽያጭ ዞን ላይ በመመዝገብ በየቀኑ ከፍተኛ ገቢ በቴሌብር (telebirr) በቀጥታ ያግኙ! (Mala-Agents Zone)
          </p>

          {/* Buttons and Social Proof Grid Row */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 pt-2">
            <button className="bg-[#00A86B] hover:bg-emerald-600 text-black font-black text-xs uppercase tracking-wider px-6 py-4 rounded-2xl transition-all duration-300 shadow-md shadow-emerald-500/10 flex items-center space-x-2 group hover:-translate-y-0.5 hover:shadow-lg">
              <span>የመላ-ወኪል ሁን</span>
              <ArrowRight className="size-4 group-hover:translate-x-1.5 transition-transform duration-300" />
            </button>

            {/* Social Proof Badge Row */}
            <div className="bg-white border border-slate-200/80 px-4 py-2.5 rounded-2xl flex items-center space-x-3 shadow-sm">
              <div className="flex -space-x-2 overflow-hidden">
                <div className="size-6 rounded-full bg-slate-200 border-2 border-white flex items-center justify-center text-[8px] font-black">👨‍💼</div>
                <div className="size-6 rounded-full bg-slate-300 border-2 border-white flex items-center justify-center text-[8px] font-black">👩‍💼</div>
                <div className="size-6 rounded-full bg-slate-400 border-2 border-white flex items-center justify-center text-[8px] font-black">🧑‍💼</div>
              </div>
              <p className="text-[11px] font-black text-slate-700 tracking-wide">
                500+ Active <span className="text-[#00A86B]">ወኪሎች ተቀላቅለዋል</span>
              </p>
            </div>
          </div>

        </div>

        {/* Right Column - Unified Video UI */}
        <div className="lg:col-span-6 flex flex-col items-center justify-center relative">

          <div className="relative w-80 h-80 sm:w-96 sm:h-96 rounded-full border border-slate-200 flex items-center justify-center bg-white shadow-xl">

            {/* Dotted Orbit Path */}
            <div className="absolute inset-4 rounded-full border border-dashed border-[#00A86B]/20 animate-[spin_240s_linear_infinite]"></div>

            {/* 8 Orbiting Icons */}
            {malazoneOrbits.map((item) => (
              <div
                key={item.id}
                onMouseEnter={() => setHoveredLabel({ am: item.am, en: item.en })}
                onMouseLeave={() => setHoveredLabel(null)}
                className={`
                  absolute ${item.pos} size-12 rounded-full bg-white
                  border border-slate-200 text-[#00A86B] flex items-center justify-center
                  shadow-md cursor-pointer transition-all duration-300 ease-out
                  hover:bg-[#00A86B] hover:text-black hover:scale-110 hover:rotate-6
                  hover:shadow-[0_0_15px_rgba(0,168,107,0.45)]
                `}
              >
                {item.icon}
              </div>
            ))}

            {/* Center Hub */}
            <div className="w-56 h-56 sm:w-64 sm:h-64 rounded-full bg-slate-50 border border-slate-200 p-4 shadow-inner flex flex-col items-center justify-center relative group">
              
              {/* Pulsing Double-Ring Attractor */}
              <div className="absolute inset-0 rounded-full border-2 border-[#00A86B]/10 animate-[pulse_3s_ease-in-out_infinite]" />
              <div className="absolute inset-[6px] rounded-full border border-[#00A86B]/15 animate-[pulse_3s_ease-in-out_infinite_0.5s]" />

              <button
                onClick={() => setIsPlaying(true)}
                className="
                  w-20 h-20 sm:w-24 sm:h-24 rounded-full bg-slate-900 text-white
                  flex items-center justify-center shadow-2xl transition-all duration-300
                  hover:scale-105 active:scale-95 group-hover:bg-[#00A86B] group-hover:text-black
                  hover:shadow-[0_0_20px_rgba(0,168,107,0.3)] cursor-pointer z-10
                "
              >
                <Play className="size-8 fill-current ml-1" />
              </button>

              <div className="absolute bottom-6 left-0 right-0 text-center space-y-0.5">
                <h3 className="text-xs font-black text-slate-800 tracking-wide">ስለ አጠቃቀም</h3>
                <p className="text-[9px] font-black uppercase text-slate-400 tracking-widest">How to use this platform</p>
              </div>

            </div>

          </div>

          {/* Interactive Floating Metadata Sub-Box */}
          <div className="absolute -bottom-10 h-12 w-full flex flex-col items-center justify-center text-center">
            {hoveredLabel ? (
              <div className="bg-white border border-slate-200 rounded-xl px-4 py-2 shadow-md animate-fade-in space-y-0.5 max-w-sm">
                <p className="text-[11px] font-black text-slate-800 flex items-center justify-center gap-1">
                  <Sparkles className="size-3.5 text-[#00A86B]" />
                  <span>{hoveredLabel.am}</span>
                </p>
                <p className="text-[9px] font-black uppercase text-[#00A86B] tracking-wider">{hoveredLabel.en}</p>
              </div>
            ) : (
              <p className="text-[11px] font-black text-slate-400 tracking-wide uppercase italic animate-pulse">
                በአዶዎቹ ላይ በማሳረፍ ዝርዝሩን ይመልከቱ (HOVER OVER ICONS TO PREVIEW)
              </p>
            )}
          </div>

        </div>

      </div>

      {/* Video Modal Overlay */}
      {isPlaying && (
        <div className="fixed inset-0 bg-slate-950/60 backdrop-blur-md flex items-center justify-center p-4 z-50 animate-fade-in">
          <div className="bg-white border border-slate-200 rounded-3xl max-w-3xl w-full p-4 relative shadow-2xl text-left">
            <button onClick={() => setIsPlaying(false)} className="absolute -top-10 right-0 text-white hover:text-[#00A86B] transition-colors font-black flex items-center space-x-1 text-xs cursor-pointer">
              <X className="size-4" /> <span>ዝጋ (Close)</span>
            </button>
            <div className="w-full aspect-video bg-slate-950 rounded-2xl flex flex-col items-center justify-center text-center p-6 space-y-2">
              <Play className="size-8 text-[#00A86B] fill-current animate-pulse" />
              <p className="text-xs font-black text-white mt-2">የማላዞን ወኪል አጠቃቀም ማብራሪያ ቪዲዮ</p>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}
