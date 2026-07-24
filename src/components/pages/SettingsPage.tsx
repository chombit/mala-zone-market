import React from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, User, Moon, Sun, Globe, Shield, Mail, Phone, ChevronRight } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { useTheme } from "@/contexts/ThemeContext";
import { useLanguage } from "@/contexts/ZoneLanguageContext";
import { LANGUAGE_OPTIONS, type Language } from "@/i18n";

const SettingsPage: React.FC = () => {
  const { user } = useAuth();
  const { language, setLanguage } = useLanguage();
  const { isDark, toggleTheme } = useTheme();
  const navigate = useNavigate();

  const isAm = language === "amharic";

  if (!user) {
    navigate("/signin");
    return null;
  }

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950">
      <div className="max-w-2xl mx-auto px-4 py-8">
        {/* Back Button */}
        <button
          onClick={() => navigate(-1)}
          className="flex items-center gap-2 text-sm font-medium text-slate-500 dark:text-slate-400 hover:text-[#00A86B] transition-colors mb-8"
        >
          <ArrowLeft className="w-4 h-4" />
          {isAm ? "ተመለስ" : "Back"}
        </button>

        <h1 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white mb-8">
          {isAm ? "ማስተካከያ" : "Settings"}
        </h1>

        <div className="space-y-6">
          {/* Account Details */}
          <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-white/10 overflow-hidden">
            <div className="px-6 py-4 border-b border-slate-100 dark:border-white/5">
              <h2 className="text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest">
                {isAm ? "የመለያ ዝርዝሮች" : "Account Details"}
              </h2>
            </div>
            <div className="divide-y divide-slate-100 dark:divide-white/5">
              <div className="flex items-center justify-between px-6 py-4">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-xl bg-slate-100 dark:bg-white/5 flex items-center justify-center">
                    <User className="w-4 h-4 text-slate-500 dark:text-slate-400" />
                  </div>
                  <div>
                    <p className="text-xs text-slate-400 dark:text-slate-500">{isAm ? "ሙሉ ስም" : "Full Name"}</p>
                    <p className="text-sm font-semibold text-slate-900 dark:text-white">{user.full_name}</p>
                  </div>
                </div>
              </div>
              <div className="flex items-center justify-between px-6 py-4">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-xl bg-slate-100 dark:bg-white/5 flex items-center justify-center">
                    <Mail className="w-4 h-4 text-slate-500 dark:text-slate-400" />
                  </div>
                  <div>
                    <p className="text-xs text-slate-400 dark:text-slate-500">Email</p>
                    <p className="text-sm font-semibold text-slate-900 dark:text-white">{user.email || "—"}</p>
                  </div>
                </div>
              </div>
              <div className="flex items-center justify-between px-6 py-4">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-xl bg-slate-100 dark:bg-white/5 flex items-center justify-center">
                    <Phone className="w-4 h-4 text-slate-500 dark:text-slate-400" />
                  </div>
                  <div>
                    <p className="text-xs text-slate-400 dark:text-slate-500">{isAm ? "ስልክ ቁጥር" : "Phone Number"}</p>
                    <p className="text-sm font-semibold text-slate-900 dark:text-white">{user.phone_number || "—"}</p>
                  </div>
                </div>
              </div>
              <div className="flex items-center justify-between px-6 py-4">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-xl bg-slate-100 dark:bg-white/5 flex items-center justify-center">
                    <Shield className="w-4 h-4 text-slate-500 dark:text-slate-400" />
                  </div>
                  <div>
                    <p className="text-xs text-slate-400 dark:text-slate-500">{isAm ? "የመለያ አይነት" : "Account Type"}</p>
                    <p className="text-sm font-semibold text-slate-900 dark:text-white">{user.account_type.toUpperCase()}</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Preferences */}
          <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-white/10 overflow-hidden">
            <div className="px-6 py-4 border-b border-slate-100 dark:border-white/5">
              <h2 className="text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest">
                {isAm ? "ምርጫዎች" : "Preferences"}
              </h2>
            </div>
            <div className="divide-y divide-slate-100 dark:divide-white/5">
              {/* Theme Toggle */}
              <button
                onClick={toggleTheme}
                className="flex items-center justify-between w-full px-6 py-4 hover:bg-slate-50 dark:hover:bg-white/[0.02] transition-colors"
              >
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-xl bg-slate-100 dark:bg-white/5 flex items-center justify-center">
                    {isDark ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4 text-slate-500" />}
                  </div>
                  <div className="text-left">
                    <p className="text-sm font-semibold text-slate-900 dark:text-white">{isAm ? "ገጽታ" : "Theme"}</p>
                    <p className="text-xs text-slate-400 dark:text-slate-500">{isDark ? "Dark Mode" : "Light Mode"}</p>
                  </div>
                </div>
                <ChevronRight className="w-4 h-4 text-slate-300 dark:text-slate-600" />
              </button>

              {/* Language */}
              <button
                onClick={() => setLanguage(language === "amharic" ? "en" : language === "en" ? "sidamu" : "amharic")}
                className="flex items-center justify-between w-full px-6 py-4 hover:bg-slate-50 dark:hover:bg-white/[0.02] transition-colors"
              >
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-xl bg-slate-100 dark:bg-white/5 flex items-center justify-center">
                    <Globe className="w-4 h-4 text-[#00A86B]" />
                  </div>
                  <div className="text-left">
                    <p className="text-sm font-semibold text-slate-900 dark:text-white">{isAm ? "ቋንቋ" : "Language"}</p>
                    <p className="text-xs text-slate-400 dark:text-slate-500">
                      {LANGUAGE_OPTIONS.find(o => o.value === language)?.label || language}
                    </p>
                  </div>
                </div>
                <ChevronRight className="w-4 h-4 text-slate-300 dark:text-slate-600" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SettingsPage;
