/**
 * ForgotPassword.tsx
 * Malazone.com — Forgot Password Page
 * © 2026 Malazone Technologies PLC
 */

import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useLanguage } from '../contexts/ZoneLanguageContext';
import { motion, AnimatePresence } from 'framer-motion';
import { Mail, ArrowLeft, CheckCircle, Loader2 } from 'lucide-react';

const ForgotPassword: React.FC = () => {
  const { t } = useLanguage();
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [resetUrl, setResetUrl] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const response = await fetch('/api/auth/forgot-password', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email }),
      });

      const data = await response.json();
      if (data.success) {
        setSuccess(true);
        if (data.resetUrl) {
          setResetUrl(data.resetUrl);
        }
      }
    } catch (error) {
      console.error('[ForgotPassword] Error:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-white to-green-50 flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="w-full max-w-md"
      >
        <div className="bg-white rounded-2xl shadow-2xl p-8 border border-green-100">
          {/* Logo/Header */}
          <div className="text-center mb-8">
            <div className="flex items-center justify-center gap-1 mb-4">
              <span className="text-4xl font-black text-gray-900">MALA</span>
              <span className="text-4xl font-black text-[#00A86B]">ZONE</span>
            </div>
            <h1 className="text-2xl font-bold text-gray-900 mb-2">
              {t('auth.forgotPasswordTitle')}
            </h1>
            <p className="text-gray-600">
              {t('auth.forgotPasswordSubtitle')}
            </p>
          </div>

          <AnimatePresence mode="wait">
            {success ? (
              <motion.div
                key="success"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="text-center"
              >
                <CheckCircle className="w-16 h-16 text-[#00A86B] mx-auto mb-4" />
                <h2 className="text-xl font-bold text-gray-900 mb-2">
                  {t('auth.resetLinkSent')}
                </h2>
                {resetUrl && (
                  <div className="mt-4 p-4 bg-amber-50 border border-amber-200 rounded-xl text-left">
                    <p className="text-xs font-bold text-amber-700 uppercase tracking-wider mb-2">
                      Dev Mode — Reset Link
                    </p>
                    <a
                      href={resetUrl}
                      className="text-sm text-[#00A86B] underline break-all font-semibold hover:text-[#008F5A]"
                    >
                      {resetUrl}
                    </a>
                  </div>
                )}
                <button
                  onClick={() => navigate('/signin')}
                  className="mt-6 w-full py-3 bg-[#00A86B] text-white font-semibold rounded-xl hover:bg-[#008F5A] transition-colors flex items-center justify-center gap-2"
                >
                  <ArrowLeft className="w-5 h-5" />
                  {t('auth.backToSignIn')}
                </button>
              </motion.div>
            ) : (
              <motion.form
                key="form"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                onSubmit={handleSubmit}
                className="space-y-6"
              >
                {/* Email Input */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    {t('auth.email')}
                  </label>
                  <div className="relative">
                    <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="you@example.com"
                      required
                      className="w-full pl-12 pr-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#00A86B] focus:border-transparent outline-none transition-all text-gray-900"
                    />
                  </div>
                </div>

                {/* Submit Button */}
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full py-3 bg-[#00A86B] text-white font-semibold rounded-xl hover:bg-[#008F5A] transition-all flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {loading ? (
                    <Loader2 className="w-5 h-5 animate-spin" />
                  ) : (
                    t('auth.sendResetLink')
                  )}
                </button>

                {/* Back to Sign In */}
                <div className="text-center pt-4">
                  <Link
                    to="/signin"
                    className="inline-flex items-center gap-2 text-gray-600 hover:text-[#00A86B] font-medium transition-colors"
                  >
                    <ArrowLeft className="w-4 h-4" />
                    {t('auth.backToSignIn')}
                  </Link>
                </div>
              </motion.form>
            )}
          </AnimatePresence>
        </div>
      </motion.div>
    </div>
  );
};

export default ForgotPassword;