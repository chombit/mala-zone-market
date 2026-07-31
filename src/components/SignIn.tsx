/**
 * SignIn.tsx
 * Malazone.com — Sign In/Sign Up Component
 * © 2026 Malazone Technologies PLC
 */

import React, { useState } from "react";
import { Lock, Mail, User, Phone, Loader2, Eye, EyeOff, Globe } from "lucide-react";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import { useLanguage } from "../contexts/ZoneLanguageContext";
import LogoImg from "../images/Logo.png";

const SignIn: React.FC = () => {
  const [mode, setMode] = useState<"signin" | "signup">("signin");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [fullName, setFullName] = useState("");
  const [phone, setPhone] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const navigate = useNavigate();
  const { login, register } = useAuth();
  const { t, language, toggleLanguage } = useLanguage();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      let result;
      if (mode === "signin") {
        result = await login(email, password);
      } else {
        result = await register({
          full_name: fullName,
          email,
          password,
          phone_number: phone || undefined
        });
      }

      if (result.success) {
        navigate("/");
      } else {
        setError(language === "en" ? result.message : (result.message_am || result.message));
      }
    } catch (err) {
      setError(language === "en" ? "An error occurred. Please try again." : "ስህተት ተከስቷል፡ እባክዎ ዳግም ይሞክሩ።");
    } finally {
      setLoading(false);
    }
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

            <div className="text-center">
              <h2 className="text-3xl font-black text-slate-900 mb-2">
                {t("auth.welcomeBack")}
              </h2>
              <p className="text-slate-600">
                {t("auth.secureAccess")}
              </p>
            </div>

            <div className="text-center">
              <p className="text-xs text-slate-500">
                © 2026 Malazone Technologies PLC. All Rights Reserved.
              </p>
            </div>
          </div>
        </div>

        {/* Right Form Panel */}
        <div className="w-full lg:w-1/2 bg-white p-6 sm:p-8 lg:p-12 flex flex-col items-center justify-center relative">
          {/* Language Toggle */}
          <div className="absolute top-4 right-4">
            <button
              onClick={toggleLanguage}
              className="flex items-center gap-2 px-3 py-2 rounded-full bg-slate-100 border border-slate-200 hover:bg-slate-200 transition-all duration-300 text-xs font-semibold text-slate-700"
            >
              <Globe className="w-4 h-4" />
              {language === "en" ? "አማርኛ" : "English"}
            </button>
          </div>

          <div className="w-full max-w-sm space-y-6">
            {/* Mobile-Only: Back to Home + Logo */}
            <div className="lg:hidden">
              {/* Back to Home */}
              <button
                onClick={() => navigate("/")}
                className="flex items-center gap-1.5 text-slate-500 hover:text-[#00A86B] transition-colors text-sm font-semibold mb-4"
                aria-label="Back to home"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2.5} viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5L8.25 12l7.5-7.5" />
                </svg>
                Back to Home
              </button>
              <div className="text-center">
                <img
                  src={LogoImg}
                  alt="Malazone Official Logo"
                  className="h-20 object-contain mx-auto mb-2"
                />
                <h2 className="text-2xl font-black text-slate-900">
                  {t("auth.welcomeBack")}
                </h2>
              </div>
            </div>

            {/* Form Header */}
            <div className="text-center">
              <h2 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
                {mode === "signin" ? t("auth.signin") : t("auth.signup")}
              </h2>
            </div>

            {/* Error Message */}
            {error && (
              <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-700">
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Full Name (Sign Up Only) */}
              {mode === "signup" && (
                <div className="space-y-1.5">
                  <label className="text-[10px] sm:text-xs font-bold uppercase tracking-widest text-slate-500 ml-1">
                    {t("auth.fullName")}
                  </label>
                  <div className="relative">
                    <User className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                    <input
                      type="text"
                      required
                      value={fullName}
                      onChange={(e) => setFullName(e.target.value)}
                      placeholder={t("auth.fullName")}
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl py-3 pl-12 pr-4 text-slate-900 placeholder:text-slate-400 focus:outline-none focus:bg-white focus:border-[#00A86B]/50 focus:ring-2 focus:ring-[#00A86B]/20 transition-all text-sm font-semibold"
                    />
                  </div>
                </div>
              )}

              {/* Email */}
              <div className="space-y-1.5">
                <label className="text-[10px] sm:text-xs font-bold uppercase tracking-widest text-slate-500 ml-1">
                  {t("auth.email")}
                </label>
                <div className="relative">
                  <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder={t("auth.email")}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl py-3 pl-12 pr-4 text-slate-900 placeholder:text-slate-400 focus:outline-none focus:bg-white focus:border-[#00A86B]/50 focus:ring-2 focus:ring-[#00A86B]/20 transition-all text-sm font-semibold"
                  />
                </div>
              </div>

              {/* Phone (Sign Up Only) */}
              {mode === "signup" && (
                <div className="space-y-1.5">
                  <label className="text-[10px] sm:text-xs font-bold uppercase tracking-widest text-slate-500 ml-1">
                    {t("auth.phone")}
                  </label>
                  <div className="relative">
                    <Phone className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                    <input
                      type="tel"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      placeholder={t("auth.phone")}
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl py-3 pl-12 pr-4 text-slate-900 placeholder:text-slate-400 focus:outline-none focus:bg-white focus:border-[#00A86B]/50 focus:ring-2 focus:ring-[#00A86B]/20 transition-all text-sm font-semibold"
                    />
                  </div>
                </div>
              )}

              {/* Password */}
              <div className="space-y-1.5">
                <label className="text-[10px] sm:text-xs font-bold uppercase tracking-widest text-slate-500 ml-1">
                  {t("auth.password")}
                </label>
                <div className="relative">
                  <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                  <input
                    type={showPassword ? "text" : "password"}
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder={t("auth.password")}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl py-3 pl-12 pr-12 text-slate-900 placeholder:text-slate-400 focus:outline-none focus:bg-white focus:border-[#00A86B]/50 focus:ring-2 focus:ring-[#00A86B]/20 transition-all text-sm font-semibold"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 hover:text-slate-600 transition-colors"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
                {mode === "signin" && (
                  <div className="text-right">
                    <Link
                      to="/forgot-password"
                      className="text-[#00A86B] hover:text-[#00A86B]/80 font-semibold text-xs transition-colors"
                    >
                      {t("auth.forgotPassword")}
                    </Link>
                  </div>
                )}
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={loading}
                className="w-full py-3.5 rounded-xl bg-[#00A86B] hover:bg-[#00A86B]/90 text-slate-950 font-black text-xs sm:text-sm uppercase tracking-[0.2em] shadow-xl shadow-[#00A86B]/25 transition-all active:scale-[0.98] disabled:opacity-60 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {loading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    {t("auth.loading")}
                  </>
                ) : (
                  mode === "signin" ? t("auth.loginBtn") : t("auth.registerBtn")
                )}
              </button>
            </form>

            {/* Social Login Divider */}
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-slate-200"></div>
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-2 bg-white text-slate-500">{t("auth.orContinueWith")}</span>
              </div>
            </div>

            {/* Social Login Buttons */}
            <div>
              <a
                href="/api/auth/google"
                className="flex items-center justify-center gap-2 py-3 px-4 border border-slate-300 rounded-xl hover:bg-slate-50 transition-all text-sm font-semibold text-slate-700 w-full"
              >
                <svg className="w-5 h-5" viewBox="0 0 24 24">
                  <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                  <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                  <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
                  <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
                </svg>
                {t("auth.google")}
              </a>
            </div>

            {/* Toggle Mode */}
            <div className="text-center">
              <button
                onClick={() => {
                  setMode(mode === "signin" ? "signup" : "signin");
                  setError(null);
                }}
                className="text-[#00A86B] hover:text-[#00A86B]/80 font-semibold text-sm transition-colors"
              >
                {mode === "signin" ? t("auth.dontHaveAccount") : t("auth.alreadyHaveAccount")}{" "}
                <span className="font-black">
                  {mode === "signin" ? t("auth.signup") : t("auth.signin")}
                </span>
              </button>
            </div>

            {/* Mobile-Only Copyright */}
            <div className="lg:hidden text-center pt-4">
              <p className="text-[9px] text-slate-400">
                © 2026 Malazone Technologies PLC. All Rights Reserved.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SignIn;
