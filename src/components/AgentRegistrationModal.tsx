/**
 * AgentRegistrationModal.tsx
 * Malazone.com — Premium Mala-Agent Onboarding Interface
 * © 2026 Malazone Technologies PLC
 */

import React, { useState } from "react";
import { X, User, Phone, MapPin, Loader2, CheckCircle2, ShieldCheck, Lock } from "lucide-react";
import { useLanguage } from "@/contexts/ZoneLanguageContext";

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

const AgentRegistrationModal: React.FC<ModalProps> = ({ isOpen, onClose, onSuccess }) => {
  const { t, language } = useLanguage();
  const isAm = language === "amharic";
  
  const [formData, setFormData] = useState({
    full_name: "",
    phone: "",
    sub_city: "",
    password: ""
  });
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    if (!/^(09|07)\d{8}$/.test(formData.phone)) {
      setError(isAm ? "እባክዎ ትክክለኛ ስልክ ቁጥር ያስገቡ (09XXXXXXXX ወይም 07XXXXXXXX)" : "Please enter a valid Ethiopian phone number (09XXXXXXXX or 07XXXXXXXX)");
      setLoading(false);
      return;
    }

    if (formData.password.length < 8) {
      setError(isAm ? "የይለፍ ቃል ቢያንስ 8 ቁምፊዎች መሆን አለበት" : "Password must be at least 8 characters");
      setLoading(false);
      return;
    }

    try {
      const response = await fetch("/api/agents/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      const result = await response.json();

      if (result.success) {
        if (onSuccess) { onSuccess(); return; }
        setSuccess(true);
      } else {
        setError(isAm ? result.message_am : result.message);
      }
    } catch (err) {
      setError(isAm ? "ግንኙነት ተቋርጧል። እባክዎ ድጋሚ ይሞክሩ።" : "Network error. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 sm:p-10">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-slate-950/80 backdrop-blur-2xl animate-fade-in"
        onClick={onClose}
      />
      
      {/* Modal Container */}
      <div className="relative w-full max-w-xl bg-slate-900 border border-white/10 rounded-2xl sm:rounded-[2.5rem] shadow-[0_50px_100px_rgba(0,0,0,0.5)] overflow-hidden animate-zoom-in">
        
        {/* Progress/Success State Overlay */}
        {success && (
          <div className="absolute inset-0 z-20 bg-slate-900 flex flex-col items-center justify-center p-8 sm:p-12 text-center space-y-8 animate-fade-in">
            <div className="w-24 h-24 rounded-full bg-green-500/20 flex items-center justify-center">
              <CheckCircle2 className="w-12 h-12 text-green-500" />
            </div>
            <div className="space-y-4">
              <h3 className="text-2xl sm:text-3xl font-black text-white uppercase italic tracking-tighter">
                {isAm ? "እንኳን ደስ አሎት!" : "Welcome Aboard!"}
              </h3>
              <p className="text-malazone-navy font-medium leading-relaxed">
                {isAm 
                  ? "የምዝገባ ጥያቄዎ ተቀባይነት አግኝቷል። በቅርቡ በስልክ ቁጥርዎ እናገኝዎታለን።" 
                  : "Your registration is successful. A Malazone coordinator will contact you shortly."}
              </p>
            </div>
            <button 
              onClick={onClose}
              className="w-full py-5 rounded-2xl bg-green-600 hover:bg-green-500 text-white text-xs font-black uppercase tracking-widest transition-all"
            >
              {isAm ? "ተመለስ" : "Got it"}
            </button>
          </div>
        )}

        <div className="p-6 sm:p-10 lg:p-14 space-y-6 sm:space-y-10">
          {/* Header */}
          <div className="flex items-start justify-between">
            <div className="space-y-4">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-green-600/10 border border-green-600/20 text-green-500 text-[9px] font-black uppercase tracking-widest">
                <ShieldCheck className="w-3 h-3" />
                Mala-Agent Enrollment
              </div>
              <h2 className="text-2xl sm:text-3xl font-black text-white uppercase italic tracking-tighter leading-none">
                {isAm ? "ወኪል ይሁኑ" : "Enlist as Agent"}
              </h2>
            </div>
            <button 
              onClick={onClose}
              className="p-3 rounded-full bg-white/5 border border-white/5 text-malazone-navy hover:text-white transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-8">
            <div className="space-y-6">
              {/* Full Name */}
              <div className="space-y-3">
                <label className="text-[10px] font-black text-malazone-navy uppercase tracking-[0.2em] ml-2">
                  {isAm ? "ሙሉ ስም" : "Full Name"}
                </label>
                <div className="relative group">
                  <User className="absolute left-5 top-1/2 -translate-y-1/2 w-5 h-5 text-malazone-navy group-focus-within:text-green-500 transition-colors" />
                  <input 
                    required
                    type="text"
                    value={formData.full_name}
                    onChange={(e) => setFormData({...formData, full_name: e.target.value})}
                    placeholder={isAm ? "ለምሳሌ፦ አበበ በቀለ" : "e.g. Abebe Bekele"}
                    className="w-full bg-white/5 border border-white/5 focus:border-green-500/50 rounded-2xl py-5 pl-14 pr-6 text-white placeholder:text-malazone-navy focus:outline-none focus:ring-4 focus:ring-green-500/5 transition-all"
                  />
                </div>
              </div>

              {/* Phone */}
              <div className="space-y-3">
                <label className="text-[10px] font-black text-malazone-navy uppercase tracking-[0.2em] ml-2">
                  {isAm ? "ስልክ ቁጥር" : "Phone Number"}
                </label>
                <div className="relative group">
                  <Phone className="absolute left-5 top-1/2 -translate-y-1/2 w-5 h-5 text-malazone-navy group-focus-within:text-green-500 transition-colors" />
                  <input 
                    required
                    type="tel"
                    value={formData.phone}
                    onChange={(e) => setFormData({...formData, phone: e.target.value})}
                    placeholder="0912..."
                    className="w-full bg-white/5 border border-white/5 focus:border-green-500/50 rounded-2xl py-5 pl-14 pr-6 text-white placeholder:text-malazone-navy focus:outline-none focus:ring-4 focus:ring-green-500/5 transition-all"
                  />
                </div>
              </div>

              {/* Password */}
              <div className="space-y-3">
                <label className="text-[10px] font-black text-malazone-navy uppercase tracking-[0.2em] ml-2">
                  {isAm ? "የይለፍ ቃል" : "Password"}
                </label>
                <div className="relative group">
                  <Lock className="absolute left-5 top-1/2 -translate-y-1/2 w-5 h-5 text-malazone-navy group-focus-within:text-green-500 transition-colors" />
                  <input 
                    required
                    type="password"
                    value={formData.password}
                    onChange={(e) => setFormData({...formData, password: e.target.value})}
                    placeholder={isAm ? "ቢያንስ 8 ቁምፊዎች" : "At least 8 characters"}
                    className="w-full bg-white/5 border border-white/5 focus:border-green-500/50 rounded-2xl py-5 pl-14 pr-6 text-white placeholder:text-malazone-navy focus:outline-none focus:ring-4 focus:ring-green-500/5 transition-all"
                  />
                </div>
              </div>

              {/* Sub-City */}
              <div className="space-y-3">
                <label className="text-[10px] font-black text-malazone-navy uppercase tracking-[0.2em] ml-2">
                  {isAm ? "ክፍለ ከተማ / ሰፈር" : "Sub-City / Zone"}
                </label>
                <div className="relative group">
                  <MapPin className="absolute left-5 top-1/2 -translate-y-1/2 w-5 h-5 text-malazone-navy group-focus-within:text-green-500 transition-colors" />
                  <select 
                    required
                    value={formData.sub_city}
                    onChange={(e) => setFormData({...formData, sub_city: e.target.value})}
                    className="w-full bg-white/5 border border-white/5 focus:border-green-500/50 rounded-2xl py-5 pl-14 pr-6 text-white appearance-none focus:outline-none focus:ring-4 focus:ring-green-500/5 transition-all"
                  >
                    <option value="" disabled>{isAm ? "ይምረጡ..." : "Select Zone..."}</option>
                    <option value="Tabor">Tabor</option>
                    <option value="Lakefront">Lakefront</option>
                    <option value="Tabor Sub City">Tabor Sub City</option>
                      <option value="Addis Ketema Sub City">Addis Ketema Sub City</option>
                      <option value="Hayek Dar Sub City">Hayek Dar Sub City</option>
                      <option value="Mehal Sub City">Mehal Sub City</option>
                      <option value="Bahil Adarash Sub City">Bahil Adarash Sub City</option>
                      <option value="Misrak Sub City">Misrak Sub City</option>
                      <option value="Menahreya Sub City">Menahreya Sub City</option>
                      <option value="Tulla Sub City">Tulla Sub City</option>
                    <option value="Millennium">Millennium</option>
                    <option value="Industrial">Industrial Park Area</option>
                  </select>
                </div>
              </div>
            </div>

            {error && (
              <div className="p-4 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-xs font-bold text-center">
                {error}
              </div>
            )}

            <button 
              disabled={loading}
              type="submit"
              className="w-full flex items-center justify-center gap-4 py-6 rounded-2xl bg-green-600 hover:bg-green-500 disabled:opacity-50 disabled:cursor-not-allowed text-white shadow-[0_20px_40px_rgba(22,163,74,0.2)] transition-all group"
            >
              {loading ? (
                <Loader2 className="w-5 h-5 animate-spin" />
              ) : (
                <span className="text-sm font-black uppercase tracking-widest">
                  {isAm ? "አሁን ይመዝገቡ" : "Apply Now"}
                </span>
              )}
            </button>
          </form>
          
          <p className="text-[10px] text-center text-malazone-navy font-medium leading-relaxed">
            {isAm 
              ? "በመመዝገብዎ በመላዞን ውሎች እና ደንቦች ተስማምተዋል።" 
              : "By applying, you agree to Malazone's Terms of Service for independent agents."}
          </p>
        </div>
      </div>
    </div>
  );
};

export default AgentRegistrationModal;
