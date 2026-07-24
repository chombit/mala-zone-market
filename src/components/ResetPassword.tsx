/**
 * ResetPassword.tsx
 * Malazone.com — Reset Password Page
 * © 2026 Malazone Technologies PLC
 */

import React, { useState } from 'react';
import { useNavigate, Link, useParams } from 'react-router-dom';
import { useLanguage } from '../contexts/ZoneLanguageContext';
import { motion, AnimatePresence } from 'framer-motion';
import { Lock, ArrowLeft, CheckCircle, Loader2, Eye, EyeOff } from 'lucide-react';

const ResetPassword: React.FC = () => {
  const { t } = useLanguage();
  const navigate = useNavigate();
  const { token } = useParams<{ token: string }>();
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (password !== confirmPassword) {
      setError("Passwords don't match");
      return;
    }

    if (password.length < 6) {
      setError("Password must be at least 6 characters");
      return;
    }

    setLoading(true);

    try {
      const response = await fetch(`/api/auth/reset-password/${token}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ password }),
      });

      const data = await response.json();
      if (data.success) {
        setSuccess(true);
      } else {
        setError(data.message || data.message_am);
      }
    } catch (error) {
      console.error('[ResetPassword] Error:', error);
      setError('An error occurred');
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
              <span className="text-3xl sm:text-4xl font-black text-gray-900">MALA</span>
              <span className="text-3xl sm:text-4xl font-black text-[#00A86B]">ZONE</span>
            </div>
            <h1 className="text-2xl font-bold text-gray-900 mb-2">
              {t('auth.resetPassword')}
            </h1>
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
                  {t('auth.resetSuccess')}
                </h2>
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
                {/* Error Message */}
                {error && (
                  <div className="bg-red-50 border border-red-200 rounded-xl p-4 text-red-700 text-sm">
                    {error}
                  </div>
                )}

                {/* New Password Input */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    {t('auth.newPassword')}
                  </label>
                  <div className="relative">
                    <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                    <input
                      type={showPassword ? 'text' : 'password'}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="••••••••"
                      required
                      className="w-full pl-12 pr-12 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#00A86B] focus:border-transparent outline-none transition-all text-gray-900"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                    >
                      {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                    </button>
                  </div>
                </div>

                {/* Confirm Password Input */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    {t('auth.confirmPassword')}
                  </label>
                  <div className="relative">
                    <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                    <input
                      type={showConfirmPassword ? 'text' : 'password'}
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      placeholder="••••••••"
                      required
                      className="w-full pl-12 pr-12 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#00A86B] focus:border-transparent outline-none transition-all text-gray-900"
                    />
                    <button
                      type="button"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                    >
                      {showConfirmPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                    </button>
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
                    t('auth.resetPassword')
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

export default ResetPassword;