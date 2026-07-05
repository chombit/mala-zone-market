import React, { useState } from 'react';
import { Heart, Share2, MapPin, ShieldCheck, Sparkles, Phone, Send, BedDouble, Bath, Maximize2, Layers, Calendar, ChevronLeft, ChevronRight, CheckCircle2 } from 'lucide-react';

interface ProductDetailsViewProps {
  currentGlobalLang?: 'am' | 'en';
}

export function ProductDetailsView({ currentGlobalLang = 'am' }: ProductDetailsViewProps) {
  const [isFavorite, setIsFavorite] = useState(false);
  const [activeImageIdx, setActiveImageIdx] = useState(0);

  // MOCK MULTI-IMAGE CAROUSEL ARRAY BASED ON SCREENSHOT INFRASTRUCTURE
  const images = [
    'https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?auto=format&fit=crop&q=80&w=1200',
    'https://images.unsplash.com/photo-1600607687931-cecebd808ebc?auto=format&fit=crop&q=80&w=1200',
    'https://images.unsplash.com/photo-1600566753190-17f0baa2a6c3?auto=format&fit=crop&q=80&w=1200'
  ];

  // 🌐 EXHAUSTIVE BILINGUAL DICTIONARY PRECISELY LOCALIZING THE REFERENCE DATA
  const t = {
    am: {
      idLabel: 'ኮድ: Q250166',
      title: 'ባለ 2-መኝታ የሚሸጥ አፓርታማ — ቦሌ አደይ አበባ ስታዲየም አካባቢ',
      verified: '🗺️ ካርታ የተረጋገጠ ማህደር',
      priceLabel: 'የሽያጭ ጠቅላላ ዋጋ',
      priceValue: '135,000 ETB / በካሬ',
      negotiable: 'ድርድር ይቻላል',
      ownerTitle: 'የንብረት አስመዝጋቢ ባለሙያ',
      ownerName: 'ቢሩክ ተሾመ (Biruk Teshome)',
      ownerReviews: '⭐⭐⭐⭐⭐ (0 አስተያየቶች)',
      btnCall: 'ቀጥታ ደውል (Direct Call)',
      btnTelegram: 'በቴሌግራም አነጋግር',
      btnFavorite: 'ለበኋላ አስቀምጥ (Favorite)',
      specsTitle: 'ስለ ቤቱ ዝርዝር መረጃ',
      locTitle: 'የይዞታው ማዘጋጃ ቤት አድራሻ',
      descTitle: 'ተጨማሪ ማብራሪያ',
      descBody: 'ከ 58 ካሬ እስከ 133 ካሬ አፓርታማዎች በአዲስ አበባ ከተማ ልብ ውስጥ። 2 መኝታ ክፍሎች፣ ሰፊ ሳሎን፣ ዘመናዊ ኩሽና እና የሳተላይት መኪና ማቆሚያ የተካተተበት ህጋዊ ማህደር። ያለ ደላላ በቀጥታ ይገበያዩ!',
      labels: {
        type: 'የንብረት ዓይነት', status: 'የይዞታ ሁኔታ', beds: 'መኝታ ክፍል', baths: 'የሻወር ክፍል', 
        area: 'ስፋት (ባለቤትነት)', floor: 'የሚገኝበት ወለል', salon: 'ሳሎን', kitchen: 'ኩሽና', parking: 'መኪና ማቆሚያ'
      },
      values: {
        type: 'አፓርታማ', status: 'ለቤት መኖሪያ', beds: '2 ክፍሎች', baths: '2 ሻወር', 
        area: '122 m²', floor: '8ኛ ፎቅ', salon: '1 ሰፊ ሳሎን', kitchen: 'ዘመናዊ ኩሽና', parking: 'አለው'
      }
    },
    en: {
      idLabel: 'ID: Q250166',
      title: 'Luxury 2-Bedroom Apartment for Sale — Bole Adey Abeba Stadium',
      verified: '🗺️ Certified Legal Deed (Carta Verified)',
      priceLabel: 'Master Price Registry',
      priceValue: '135,000 ETB / m²',
      negotiable: 'Negotiable Status',
      ownerTitle: 'Listing Property Expert',
      ownerName: 'Biruk Teshome',
      ownerReviews: '⭐⭐⭐⭐⭐ (0 Reviews)',
      btnCall: 'Direct Call',
      btnTelegram: 'Message on Telegram',
      btnFavorite: 'Add to Favorites',
      specsTitle: 'Comprehensive System Specifications',
      locTitle: 'Geographic Municipal Location',
      descTitle: 'Strategic Narrative Overview',
      descBody: 'Premium apartments sizing from 58 m² up to 133 m² positioned inside the absolute heart of Addis Ababa. Features 2 spacious bedrooms, luxury salon, modern chef kitchen, and private secured layout parking logs. 100% middleman-free transactional asset.',
      labels: {
        type: 'Property Class', status: 'Current Status', beds: 'Bedrooms', baths: 'Bathrooms', 
        area: 'Total Area', floor: 'Floor Level', salon: 'Living Room', kitchen: 'Kitchen Type', parking: 'Parking Slot'
      },
      values: {
        type: 'Apartment', status: 'Residential', beds: '2 Beds', baths: '2 Baths', 
        area: '122 m²', floor: '8th Floor', salon: '1 Luxury Salon', kitchen: 'Modern Kitchen', parking: 'Available'
      }
    }
  }[currentGlobalLang];

  return (
    <section className="bg-slate-50 text-[#0B132B] py-12 px-4 sm:px-6 lg:px-8 w-full text-left font-sans antialiased select-none">
      <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        
        {/* 🏢 LEFT TRACK: MEDIA INTERFACE AND SPECIFICATION DATA SHEETS (68% WIDTH) */}
        <div className="lg:col-span-8 space-y-6">
          
          {/* 1. COMPACT BREADCRUMB & LOGO ALIGNMENT HEADER */}
          <div className="flex justify-between items-center bg-white p-4 rounded-2xl border border-slate-200/60 shadow-sm">
            <span className="text-xs font-black text-slate-400 font-mono tracking-wider">{t.idLabel}</span>
            <span className="text-lg font-black tracking-tight text-[#00A86B]">malazone</span>
          </div>

          {/* 2. DYNAMIC CAROUSEL SLIDER CANVAS FRAME */}
          <div className="relative aspect-[16/10] bg-slate-900 rounded-[32px] overflow-hidden shadow-md group">
            <img src={images[activeImageIdx]} alt="Property Interior View" className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-[1.02]" />
            <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent"></div>
            
            {/* Action Slider Arrows */}
            <button 
              onClick={() => setActiveImageIdx(prev => (prev === 0 ? images.length - 1 : prev - 1))} 
              className="absolute left-4 top-1/2 -translate-y-1/2 size-10 rounded-full bg-black/40 text-white backdrop-blur-sm flex items-center justify-center hover:bg-[#00A86B] hover:text-black transition-all cursor-pointer"
            >
              <ChevronLeft className="size-5" />
            </button>
            <button 
              onClick={() => setActiveImageIdx(prev => (prev === images.length - 1 ? 0 : prev + 1))} 
              className="absolute right-4 top-1/2 -translate-y-1/2 size-10 rounded-full bg-black/40 text-white backdrop-blur-sm flex items-center justify-center hover:bg-[#00A86B] hover:text-black transition-all cursor-pointer"
            >
              <ChevronRight className="size-5" />
            </button>
            
            {/* Image Thumbnail Preview Rows Stack */}
            <div className="absolute bottom-4 left-6 flex space-x-2 z-10">
              {images.map((img, i) => (
                <div 
                  key={i} 
                  onClick={() => setActiveImageIdx(i)} 
                  className={`w-14 h-10 rounded-lg overflow-hidden border-2 cursor-pointer shadow-md transition-all ${activeImageIdx === i ? 'border-[#00A86B] scale-105' : 'border-white/80 opacity-60'}`}
                >
                  <img src={img} className="w-full h-full object-cover" />
                </div>
              ))}
            </div>
          </div>

          {/* 3. CORE ASSET TITLE ROW NODE */}
          <div className="bg-white border border-slate-200 p-6 rounded-3xl shadow-sm space-y-3">
            <div className="inline-flex items-center space-x-1.5 bg-emerald-50 text-[#00A86B] border border-emerald-200/50 px-3 py-1 rounded-xl text-xs font-black uppercase tracking-wider">
              <ShieldCheck className="size-4 animate-pulse" />
              <span>{t.verified}</span>
            </div>
            <h1 className="text-xl sm:text-2xl lg:text-3xl font-black text-[#0B132B] tracking-tight leading-snug">{t.title}</h1>
          </div>

          {/* 4. BALANCED SPECIFICATIONS DISPATCHER GRID (RESOLVES GE'EZ OVERLAPPING) */}
          <div className="bg-white border border-slate-200 p-6 sm:p-8 rounded-3xl shadow-sm space-y-4">
            <h3 className="text-xs font-black text-slate-400 uppercase tracking-widest border-b border-slate-100 pb-3">{t.specsTitle}</h3>
            
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 text-xs font-bold text-[#0B132B]">
              <div className="bg-slate-50 p-4 rounded-2xl flex flex-col space-y-2 border border-slate-100">
                <span className="text-[10px] uppercase font-black text-slate-400 tracking-wide leading-loose">{t.labels.type}</span>
                <span className="text-[#0B132B] font-black text-sm">{t.values.type}</span>
              </div>
              <div className="bg-slate-50 p-4 rounded-2xl flex flex-col space-y-2 border border-slate-100">
                <span className="text-[10px] uppercase font-black text-slate-400 tracking-wide leading-loose">{t.labels.status}</span>
                <span className="text-[#0B132B] font-black text-sm">{t.values.status}</span>
              </div>
              <div className="bg-slate-50 p-4 rounded-2xl flex flex-col space-y-2 border border-slate-100">
                <span className="text-[10px] uppercase font-black text-slate-400 tracking-wide leading-loose">{t.labels.beds}</span>
                <span className="text-[#0B132B] font-black text-sm">{t.values.beds}</span>
              </div>
              <div className="bg-slate-50 p-4 rounded-2xl flex flex-col space-y-2 border border-slate-100">
                <span className="text-[10px] uppercase font-black text-slate-400 tracking-wide leading-loose">{t.labels.baths}</span>
                <span className="text-[#0B132B] font-black text-sm">{t.values.baths}</span>
              </div>
              <div className="bg-slate-50 p-4 rounded-2xl flex flex-col space-y-2 border border-slate-100">
                <span className="text-[10px] uppercase font-black text-slate-400 tracking-wide leading-loose">{t.labels.area}</span>
                <span className="text-[#0B132B] font-black text-sm font-mono">{t.values.area}</span>
              </div>
              <div className="bg-slate-50 p-4 rounded-2xl flex flex-col space-y-2 border border-slate-100">
                <span className="text-[10px] uppercase font-black text-slate-400 tracking-wide leading-loose">{t.labels.floor}</span>
                <span className="text-[#0B132B] font-black text-sm">{t.values.floor}</span>
              </div>
            </div>
          </div>

          {/* 5. STRATEGIC NARRATIVE DISPLAY OVERVIEW */}
          <div className="bg-white border border-slate-200 p-6 sm:p-8 rounded-3xl shadow-sm space-y-4">
            <h3 className="text-xs font-black text-slate-400 uppercase tracking-widest">{t.descTitle}</h3>
            <p className="text-sm text-[#0B132B] font-medium leading-relaxed tracking-wide">
              {t.descBody}
            </p>
          </div>
        </div>

        {/* 🏛️ RIGHT TRACK: TRANSACTION CONTROL AND ACTION DASHBOARD PANEL (32% WIDTH) */}
        <div className="lg:col-span-4 lg:sticky lg:top-6 space-y-6">
          
          {/* MASTER TRANSACTION SETTLEMENT SUMMARY CARD */}
          <div className="bg-white border border-slate-200/80 p-6 sm:p-8 rounded-[32px] shadow-xl space-y-8 relative overflow-hidden">
            <div className="absolute top-0 left-0 right-0 h-[4px] bg-[#00A86B]" />
            
            {/* Price Node Presentation Column */}
            <div className="text-left space-y-1.5">
              <span className="text-[10px] uppercase font-black text-slate-400 tracking-widest block">{t.priceLabel}</span>
              <span className="text-2xl sm:text-3xl font-black text-[#0B132B] tracking-tight block">{t.priceValue}</span>
              <span className="text-xs bg-slate-100 text-slate-600 px-3 py-1 rounded-lg font-black uppercase inline-block mt-2">
                {t.negotiable}
              </span>
            </div>

            {/* User Profile Broker Matrix Block */}
            <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100 flex items-center space-x-4">
              <div className="w-12 h-12 bg-slate-200 rounded-full flex items-center justify-center text-xl shrink-0">
                👨‍💼
              </div>
              <div>
                <p className="text-[10px] uppercase font-black text-slate-400 tracking-wider">{t.ownerTitle}</p>
                <p className="text-sm font-black text-[#0B132B]">{t.ownerName}</p>
                <p className="text-[10px] text-amber-500 font-black mt-0.5">{t.ownerReviews}</p>
              </div>
            </div>

            {/* HIGH-CONVERSION PRIMARY INTERACTION ACTIONS BUTTON TRAYS */}
            <div className="space-y-3">
              <button 
                onClick={() => window.location.href = 'tel:+251900000000'} 
                className="w-full bg-[#0B132B] hover:bg-slate-800 text-white py-4 rounded-xl transition-all duration-300 flex items-center justify-center space-x-2 cursor-pointer shadow-sm active:scale-[0.98]"
              >
                <Phone className="size-5" />
                <span className="font-black tracking-wider uppercase text-xs">{t.btnCall}</span>
              </button>
              
              <button 
                onClick={() => window.open('https://t.me', '_blank')} 
                className="w-full bg-[#24A1DE] hover:bg-[#1c8ec7] text-white py-4 rounded-xl transition-all duration-300 flex items-center justify-center space-x-2 cursor-pointer shadow-sm hover:shadow-[0_6px_15px_rgba(36,161,222,0.35)] active:scale-[0.98]"
              >
                <Send className="size-5 -ml-1 translate-y-[1px]" />
                <span className="font-black tracking-wider uppercase text-xs">{t.btnTelegram}</span>
              </button>
              
              <button 
                onClick={() => setIsFavorite(!isFavorite)} 
                className={`w-full bg-white border border-slate-200 py-3.5 rounded-xl transition-all flex items-center justify-center space-x-2 cursor-pointer active:scale-[0.98] ${isFavorite ? 'bg-rose-50 border-rose-100' : 'hover:bg-slate-50'}`}
              >
                <Heart className={`size-5 transition-colors ${isFavorite ? 'fill-rose-500 text-rose-500' : 'text-slate-400'}`} />
                <span className={`font-black tracking-wider uppercase text-xs ${isFavorite ? 'text-rose-600' : 'text-slate-600'}`}>
                  {t.btnFavorite}
                </span>
              </button>
            </div>
          </div>
          
        </div>
      </div>
    </section>
  );
}
