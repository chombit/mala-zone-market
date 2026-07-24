import React from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, Mail, Phone, Shield, Calendar, User } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { useLanguage } from "@/contexts/ZoneLanguageContext";

const MyAccountPage: React.FC = () => {
  const { user } = useAuth();
  const { language } = useLanguage();
  const navigate = useNavigate();

  const isAm = language === "amharic";

  if (!user) {
    navigate("/signin");
    return null;
  }

  const accountTypeLabel = user.account_type === "g2b"
    ? (isAm ? "የንግድ ስለ መንግስት" : "Government to Business")
    : user.account_type === "g2c"
    ? (isAm ? "የንግድ ስለ ህዝብ" : "Government to Citizen")
    : (isAm ? "የግል መለያ" : "Personal Account");

  const fields = [
    { icon: User, label: isAm ? "ሙሉ ስም" : "Full Name", value: user.full_name },
    { icon: Mail, label: "Email", value: user.email || "—" },
    { icon: Phone, label: isAm ? "ስልክ ቁጥር" : "Phone Number", value: user.phone_number || "—" },
    { icon: Shield, label: isAm ? "የመለያ አይነት" : "Account Type", value: accountTypeLabel },
    { icon: Calendar, label: isAm ? "ማረፊያ" : "Provider", value: user.provider === "google" ? "Google" : (isAm ? "电子邮件" : "Email") },
  ];

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950">
      <div className="max-w-2xl mx-auto px-4 py-8">
        {/* Back Button */}
        <button
          onClick={() => navigate("/")}
          className="flex items-center gap-2 text-sm font-medium text-slate-500 dark:text-slate-400 hover:text-[#00A86B] transition-colors mb-8"
        >
          <ArrowLeft className="w-4 h-4" />
          {isAm ? "ወደ ዋና ገጽ ተመለስ" : "Back to Home"}
        </button>

        {/* Avatar Card */}
        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-white/10 p-6 sm:p-8 text-center mb-6">
          <div className="w-20 h-20 rounded-full bg-gradient-to-br from-[#00A86B] to-emerald-500 flex items-center justify-center text-white text-3xl font-bold shadow-xl shadow-emerald-500/20 mx-auto mb-4">
            {user.full_name?.charAt(0)?.toUpperCase() || "U"}
          </div>
          <h1 className="text-xl font-bold text-slate-900 dark:text-white mb-1">{user.full_name}</h1>
          <p className="text-sm text-slate-500 dark:text-slate-400">{user.email}</p>
          {user.is_verified && (
            <span className="inline-flex items-center gap-1 mt-3 px-3 py-1 rounded-full bg-emerald-50 dark:bg-emerald-900/20 text-xs font-semibold text-emerald-700 dark:text-emerald-400">
              <Shield className="w-3 h-3" />
              {isAm ? "የተረጋገጠ" : "Verified"}
            </span>
          )}
        </div>

        {/* Details */}
        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-white/10 overflow-hidden">
          <div className="px-6 py-4 border-b border-slate-100 dark:border-white/5">
            <h2 className="text-sm font-bold text-slate-900 dark:text-white uppercase tracking-wider">
              {isAm ? "የመለያ ዝርዝሮች" : "Account Details"}
            </h2>
          </div>
          <div className="divide-y divide-slate-100 dark:divide-white/5">
            {fields.map((field) => (
              <div key={field.label} className="flex items-center gap-4 px-6 py-4">
                <div className="w-9 h-9 rounded-xl bg-slate-100 dark:bg-white/5 flex items-center justify-center shrink-0">
                  <field.icon className="w-4 h-4 text-slate-500 dark:text-slate-400" />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-xs font-medium text-slate-400 dark:text-slate-500 uppercase tracking-wide">{field.label}</p>
                  <p className="text-sm font-semibold text-slate-900 dark:text-white truncate mt-0.5">{field.value}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Action */}
        <div className="mt-6">
          <button
            onClick={() => navigate("/settings")}
            className="w-full py-3 rounded-xl bg-slate-900 dark:bg-white text-white dark:text-slate-900 text-sm font-bold hover:opacity-90 transition-opacity"
          >
            {isAm ? "ማስተካከያ ይምጡ" : "Go to Settings"}
          </button>
        </div>
      </div>
    </div>
  );
};

export default MyAccountPage;
