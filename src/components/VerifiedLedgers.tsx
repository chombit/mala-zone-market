import React from 'react';
import { CheckCircle2, Star, Heart, Share2 } from 'lucide-react';

const VerifiedLedgers: React.FC = () => {
  return (
    <div className="sm:hidden px-4 py-4">
      <div className="hidden sm:flex items-center gap-2 mb-3">
        <h2 className="text-[22px] font-black tracking-tight leading-none">
          <span className="text-[#00A86B]">malazone</span>
          <span className="text-malazone-navy dark:text-white ml-1.5">Featured Listings</span>
        </h2>
      </div>
      <div className="hidden sm:block w-12 h-1 bg-[#00A86B] rounded-full mb-4" />

      {/* Featured Card */}
      <div className="hidden relative w-full h-[220px] rounded-2xl overflow-hidden shadow-lg border border-slate-200/50 dark:border-white/5">
        <img
          src="https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=800&q=80&fm=webp"
          alt="Verified Property"
          loading="lazy"
          crossOrigin="anonymous"
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent" />

        {/* Top Left Badge */}
        <div className="absolute top-3 left-3 flex items-center gap-1.5 bg-white/20 backdrop-blur-md rounded-lg px-2.5 py-1.5 border border-white/30 shadow-sm">
          <div className="w-1.5 h-1.5 rounded-full bg-[#00A86B]" />
          <CheckCircle2 className="w-3.5 h-3.5 text-white" />
          <span className="text-[10px] font-bold text-white">Verified Carta</span>
        </div>

        {/* Floating Action Buttons */}
        <div className="absolute top-3 right-3 flex flex-col gap-2">
          <button className="w-8 h-8 rounded-lg bg-orange-400 flex items-center justify-center shadow-md active:scale-95 transition-transform">
            <Star className="w-4 h-4 text-white fill-white" />
          </button>
          <button className="w-8 h-8 rounded-full bg-white/90 backdrop-blur-sm flex items-center justify-center shadow-md active:scale-95 transition-transform">
            <Heart className="w-4 h-4 text-slate-500" />
          </button>
          <button className="w-8 h-8 rounded-full bg-white/90 backdrop-blur-sm flex items-center justify-center shadow-md active:scale-95 transition-transform">
            <Share2 className="w-4 h-4 text-slate-500" />
          </button>
        </div>
      </div>
    </div>
  );
};

export default VerifiedLedgers;
