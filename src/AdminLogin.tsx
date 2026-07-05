/**
 * AdminLogin.tsx
 * Malazone.com — Ultra-Premium Enterprise Admin Gateway
 * MOBILE-FIRST & FULLY RESPONSIVE DESIGN
 * © 2026 Malazone Technologies PLC
 */

import React, { useState, useEffect } from 'react';
import { Lock, User, Loader2, RefreshCw, Eye, EyeOff, Globe } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import LogoImg from './images/Logo.png';
import AdminLogoImg from './images/adminlogo.jpg';
import { useAdminAuth } from './contexts/AdminAuthContext';

const AdminLogin: React.FC = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [language, setLanguage] = useState<'en' | 'am'>('en');
  const navigate = useNavigate();
  const { login } = useAdminAuth();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    
    setLoading(true);
    
    try {
      const success = await login(username, password);
      if (success) {
        navigate('/admin');
      } else {
        alert(language === 'en' ? 'Access Denied: Invalid Credentials' : 'መግባት ተከልክሏል፡ የተሳሳተ መለያ ቃላት');
      }
    } catch (e) {
      alert(language === 'en' ? 'Error Occurred' : 'ስህተት ተከስቷል');
    } finally {
      setLoading(false);
    }
  };

  const toggleLanguage = () => {
    setLanguage(prev => prev === 'en' ? 'am' : 'en');
  };

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
      {/* Main Container */}
      <div className="w-full max-w-md lg:max-w-6xl bg-white rounded-2xl lg:rounded-[2.5rem] shadow-2xl overflow-hidden flex flex-col lg:flex-row border border-slate-200">
        
        {/* Left Branding Panel */}
        <div className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-slate-50 via-white to-[#E8F7F4] p-10 flex-col items-center justify-center relative overflow-hidden">
          <div className="absolute -top-32 -left-32 w-96 h-96 bg-[#00A86B]/8 rounded-full blur-3xl"></div>
          <div className="absolute bottom-0 right-0 w-80 h-80 bg-[#00A86B]/5 rounded-full blur-3xl"></div>
          
          <div className="relative z-10 w-full max-w-md flex flex-col items-center gap-8">
            <img 
              src={LogoImg} 
              alt="Malazone Official Logo" 
              className="h-28 object-contain mx-auto"
            />
            
            <div className="w-full">
              <div className="relative rounded-[2rem] bg-white p-6 border border-slate-200 shadow-xl shadow-slate-200/60">
                <img 
                  src={AdminLogoImg} 
                  alt="Malazone Admin Console" 
                  className="w-full h-auto max-h-[350px] object-contain rounded-[1.5rem]"
                />
              </div>
            </div>
            
            <div className="text-center">
              <p className="text-xs text-malazone-navy">
                © 2026 Malazone Technologies PLC. All Rights Reserved.
              </p>
            </div>
          </div>
        </div>

        {/* Right Login Panel */}
        <div className="w-full lg:w-1/2 bg-white p-6 sm:p-8 lg:p-12 flex flex-col items-center justify-center relative">
          
          {/* Language Toggle */}
          <div className="absolute top-4 right-4">
            <button
              onClick={toggleLanguage}
              className="flex items-center gap-2 px-3 py-2 rounded-full bg-slate-100 border border-slate-200 hover:bg-slate-200 transition-all duration-300 text-xs font-semibold text-malazone-navy"
            >
              <Globe className="w-4 h-4" />
              {language === 'en' ? 'አማርኛ' : 'English'}
            </button>
          </div>
          
          <div className="w-full max-w-sm space-y-6">
            {/* Mobile-Only Logo */}
            <div className="lg:hidden text-center">
              <img 
                src={LogoImg} 
                alt="Malazone Official Logo" 
                className="h-20 object-contain mx-auto mb-2"
              />
            </div>
            
            {/* Login Header */}
            <div className="text-center">
              <h2 className="text-2xl sm:text-3xl font-black text-malazone-navy tracking-tight">
                {language === 'en' ? 'Login' : 'ግባ'}
              </h2>
              <p className="mt-2 text-xs sm:text-sm text-malazone-navy">
                {language === 'en' ? 'Secure access to admin management' : 'ለአስተዳደር ቁጥጥር ደህንነቱ የተጠበቀ መግባት'}
              </p>
            </div>

            <form onSubmit={handleLogin} className="space-y-5">
              {/* Username */}
              <div className="space-y-1.5">
                <label className="text-[10px] sm:text-xs font-bold uppercase tracking-widest text-malazone-navy ml-1">
                  {language === 'en' ? 'Username' : 'የተጠቃሚ ስም'}
                </label>
                <div className="relative">
                  <User className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-malazone-navy" />
                  <input 
                    type="text"
                    required
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    placeholder={language === 'en' ? 'Enter username' : 'የተጠቃሚ ስምን ያስገቡ'}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl py-3 pl-12 pr-4 text-malazone-navy placeholder:text-malazone-navy focus:outline-none focus:bg-white focus:border-[#00A86B]/50 focus:ring-2 focus:ring-[#00A86B]/20 transition-all text-sm font-semibold"
                  />
                </div>
              </div>

              {/* Password */}
              <div className="space-y-1.5">
                <label className="text-[10px] sm:text-xs font-bold uppercase tracking-widest text-malazone-navy ml-1">
                  {language === 'en' ? 'Password' : 'መለያ ቃል'}
                </label>
                <div className="relative">
                  <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-malazone-navy" />
                  <input 
                    type={showPassword ? 'text' : 'password'}
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder={language === 'en' ? 'Enter password' : 'መለያ ቃሉን ያስገቡ'}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl py-3 pl-12 pr-12 text-malazone-navy placeholder:text-malazone-navy focus:outline-none focus:bg-white focus:border-[#00A86B]/50 focus:ring-2 focus:ring-[#00A86B]/20 transition-all text-sm font-semibold"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-malazone-navy hover:text-malazone-navy transition-colors"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              {/* Submit Button */}
              <button 
                type="submit"
                disabled={loading}
                className="w-full py-3.5 rounded-xl bg-[#00A86B] hover:bg-[#00A86B]/90 text-malazone-navy font-black text-xs sm:text-sm uppercase tracking-[0.2em] shadow-xl shadow-[#00A86B]/25 transition-all active:scale-[0.98] disabled:opacity-60 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {loading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    {language === 'en' ? 'Signing in...' : 'በመግባት ላይ...'}
                  </>
                ) : (
                  language === 'en' ? 'Login' : 'ግባ'
                )}
              </button>
            </form>
            
            {/* Mobile-Only Copyright */}
            <div className="lg:hidden text-center pt-4">
              <p className="text-[9px] text-malazone-navy">
                © 2026 Malazone Technologies PLC. All Rights Reserved.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminLogin;
