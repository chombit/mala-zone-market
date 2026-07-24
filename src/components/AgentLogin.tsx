/**
 * AgentLogin.tsx
 * Malazone.com — Agent Login Component
 * Phone-based authentication for Mala-Agents
 * © 2026 Malazone Technologies PLC
 */

import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Phone, ArrowRight, Loader2, AlertCircle } from 'lucide-react';
import { useAgentAuth } from '../contexts/AgentAuthContext';
import { useLanguage } from '../contexts/ZoneLanguageContext';

const AgentLogin: React.FC = () => {
  const navigate = useNavigate();
  const { login } = useAgentAuth();
  const { language } = useLanguage();
  const isAmharic = language === 'amharic';

  const [phone, setPhone] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const ETH_PHONE_REGEX = /^(\+2519|09)\d{8}$/;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    const cleanPhone = phone.replace(/\s/g, '');

    if (!ETH_PHONE_REGEX.test(cleanPhone)) {
      setError(isAmharic 
        ? 'የኢትዮጵያ ስልክ ቁጥር ያስገቡ (09XXXXXXXX ወይም +2519XXXXXXXX)' 
        : 'Please enter a valid Ethiopian phone number (09XXXXXXXX or +2519XXXXXXXX)');
      return;
    }

    setLoading(true);
    try {
      await login(cleanPhone);
      navigate('/agent/dashboard');
    } catch (err: any) {
      setError(err.message || (isAmharic ? 'መግቢያ አልተሳካም' : 'Login failed'));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-950 dark:to-slate-900 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-2xl sm:text-3xl font-black text-[#00A86B] mb-2">
            {isAmharic ? 'የማላ-ኤጀንት መግቢያ' : 'Mala-Agent Login'}
          </h1>
          <p className="text-slate-600 dark:text-slate-400 font-medium">
            {isAmharic 
              ? 'ስልክ ቁጥርዎን በመጠቀም ወደ ዳሽቦርድ ይግቡ' 
              : 'Enter your phone number to access your dashboard'}
          </p>
        </div>

        {/* Login Card */}
        <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-xl p-8 border border-slate-200 dark:border-slate-800">
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Phone Input */}
            <div>
              <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2">
                {isAmharic ? 'ስልክ ቁጥር' : 'Phone Number'}
              </label>
              <div className="relative">
                <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                <input
                  type="tel"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder={isAmharic ? '09XXXXXXXX' : '09XXXXXXXX'}
                  className="w-full pl-10 pr-4 py-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-[#00A86B] focus:border-transparent outline-none transition-all text-slate-900 dark:text-white font-medium"
                  disabled={loading}
                />
              </div>
            </div>

            {/* Error Message */}
            {error && (
              <div className="flex items-center gap-2 p-3 bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-800 rounded-lg text-red-600 dark:text-red-400 text-sm">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{error}</span>
              </div>
            )}

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-[#00A86B] hover:bg-emerald-600 text-white font-black py-3 px-4 rounded-xl transition-all flex items-center justify-center gap-2 shadow-lg shadow-emerald-500/25 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  <span>{isAmharic ? 'በመፈለግ ላይ...' : 'Signing in...'}</span>
                </>
              ) : (
                <>
                  <span>{isAmharic ? 'ግቡ' : 'Sign In'}</span>
                  <ArrowRight className="w-5 h-5" />
                </>
              )}
            </button>
          </form>

          {/* Register Link */}
          <div className="mt-6 text-center">
            <p className="text-slate-600 dark:text-slate-400 text-sm">
              {isAmharic ? 'አዲስ ኤጀንት ነዎት? ' : 'New agent? '}
              <a href="/#agents" className="text-[#00A86B] hover:text-emerald-600 font-bold">
                {isAmharic ? 'ያሁኑን ይመዝግቡ' : 'Register here'}
              </a>
            </p>
          </div>
        </div>

        {/* Test Credentials Notice */}
        <div className="mt-6 p-4 bg-blue-50 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-800 rounded-lg">
          <p className="text-xs text-blue-600 dark:text-blue-400 font-medium text-center">
            {isAmharic ? 'ለፈተና: ስልክ 0911234567' : 'For testing: Phone 0911234567'}
          </p>
        </div>
      </div>
    </div>
  );
};

export default AgentLogin;
