import React, { useState } from 'react';
import { Play, Building2, Car, Hotel, PartyPopper, Tractor, Wallet, ShieldCheck, PhoneCall, X, Sparkles } from 'lucide-react';

export function MalaZoneMasterPlayer() {
  const [isPlaying, setIsPlaying] = useState(false);
  const [hoveredLabel, setHoveredLabel] = useState<{ am: string; en: string } | null>(null);

  const malazoneOrbits = [
    { id: 1, icon: <Building2 className="size-5" />, am: 'የቤትና ይዞታ ዞን (Property)', en: 'Property & Real Estate', pos: 'top-0 left-1/2 -translate-x-1/2 -translate-y-1/2' },
    { id: 2, icon: <Car className="size-5" />, am: 'የመኪናና ኤሌክትሪክ ዞን (Motors)', en: 'Motors & EV Vehicles', pos: 'top-1/4 right-6 -translate-y-1/2' },
    { id: 3, icon: <Hotel className="size-5" />, am: 'የጉዞና ማረፊያ ዞን (Stay & Halls)', en: 'Rooms, Guest Houses & Halls', pos: 'top-1/2 right-0 translate-x-1/2 -translate-y-1/2' },
    { id: 4, icon: <PartyPopper className="size-5" />, am: 'የክብረ-በዓላት ዞን (Ceremony)', en: 'Wedding Gear & DJ Systems', pos: 'bottom-1/4 right-6 translate-y-1/2' },
    { id: 5, icon: <Tractor className="size-5" />, am: 'የከባድ ማሽነሪዎች ዞን (Machinery)', en: 'Heavy Machineries & Trucks', pos: 'bottom-0 left-1/2 -translate-x-1/2 translate-y-1/2' },
    { id: 6, icon: <Wallet className="size-5" />, am: 'የወኪል ወጣቶች ክፍያ (Mala-Agents)', en: 'Weekly Telebirr Payout Loop', pos: 'bottom-1/4 left-6 translate-y-1/2' },
    { id: 7, icon: <ShieldCheck className="size-5" />, am: 'የማዘጋጃ ቤት ኦዲት (G2B Link)', en: 'Municipal Deed Verification', pos: 'top-1/2 left-0 -translate-x-1/2 -translate-y-1/2' },
    { id: 8, icon: <PhoneCall className="size-5" />, am: 'የቀጥታ ስልክና ጥሪ (Support)', en: 'Direct Owner Call & Telegram', pos: 'top-1/4 left-6 -translate-y-1/2' },
  ];

  return (
    <div className="w-full bg-[#0B132B] py-24 px-6 flex flex-col items-center justify-center relative overflow-hidden select-none">

      <div className="absolute top-16 left-16 text-[#00A86B]/20 border-l border-b border-current size-5 rotate-45"></div>
      <div className="absolute bottom-20 right-20 text-[#00A86B]/20 border-r border-t border-current size-5 rotate-12"></div>

      <div className="relative w-80 h-80 sm:w-96 sm:h-96 rounded-full border border-slate-800/60 flex items-center justify-center bg-slate-950/10 shadow-2xl">

        <div className="absolute inset-4 rounded-full border border-dashed border-[#00A86B]/20 animate-[spin_240s_linear_infinite]"></div>

        {malazoneOrbits.map((item) => (
          <div
            key={item.id}
            onMouseEnter={() => setHoveredLabel({ am: item.am, en: item.en })}
            onMouseLeave={() => setHoveredLabel(null)}
            className={`
              absolute ${item.pos} size-12 rounded-full bg-[#050B1A]
              border border-slate-800 text-[#00A86B] flex items-center justify-center
              shadow-lg cursor-pointer transition-all duration-300 ease-out
              hover:bg-[#00A86B] hover:text-malazone-navy hover:scale-110
              hover:shadow-[0_0_15px_rgba(0,168,107,0.6)] group
            `}
          >
            {item.icon}
          </div>
        ))}

        <div className="w-56 h-56 sm:w-64 sm:h-64 rounded-full bg-[#111A33]/90 border border-slate-800/60 p-4 shadow-inner flex flex-col items-center justify-center relative group">

          <button
            onClick={() => setIsPlaying(true)}
            className="
              w-20 h-20 sm:w-24 sm:h-24 rounded-full bg-white text-malazone-navy
              flex items-center justify-center shadow-2xl transition-all duration-300
              hover:scale-105 active:scale-95 group-hover:bg-[#00A86B] group-hover:text-malazone-navy
              hover:shadow-[0_0_25px_rgba(0,168,107,0.4)] cursor-pointer z-10
            "
          >
            <Play className="size-8 fill-current ml-1" />
          </button>

          <div className="absolute bottom-6 left-0 right-0 text-center space-y-0.5">
            <h3 className="text-sm font-black text-white tracking-wide font-sans">ስለ አጠቃቀም</h3>
            <p className="text-[10px] font-black uppercase text-malazone-navy tracking-widest">How to use this platform</p>
          </div>

        </div>

      </div>

      <div className="mt-12 h-16 w-full max-w-md flex flex-col items-center justify-center text-center">
        {hoveredLabel ? (
          <div className="bg-slate-950/80 border border-slate-800 rounded-2xl px-6 py-3 shadow-xl animate-fade-in space-y-1">
            <p className="text-xs font-black text-white flex items-center justify-center gap-1.5">
              <Sparkles className="size-3.5 text-[#00A86B]" />
              <span>{hoveredLabel.am}</span>
            </p>
            <p className="text-[10px] font-black uppercase text-[#00A86B] tracking-wider">{hoveredLabel.en}</p>
          </div>
        ) : (
          <p className="text-xs font-bold text-malazone-navy tracking-wide uppercase italic animate-pulse">
            በእያንዳንዱ አዶ ላይ በማሳረፍ ዝርዝሩን ይመልከቱ (Hover over icons to preview)
          </p>
        )}
      </div>

      {isPlaying && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4 z-50 animate-fade-in">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl max-w-3xl w-full p-4 relative shadow-2xl">
            <button onClick={() => setIsPlaying(false)} className="absolute -top-12 right-0 text-white hover:text-[#00A86B] transition-colors font-black flex items-center space-x-1 text-xs cursor-pointer">
              <X className="size-4" /> <span>ዝጋ (Close)</span>
            </button>
            <div className="w-full aspect-video bg-black rounded-2xl border border-slate-800 overflow-hidden flex flex-col items-center justify-center text-center p-6 space-y-3">
              <Play className="size-8 text-[#00A86B] fill-current animate-bounce" />
              <p className="text-sm font-black text-white">የመላዞን ሙሉ ሲስተም አጠቃቀም ማብራሪያ ቪዲዮ</p>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
