import React from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, Mail, Phone, Shield, Calendar, User, MessageCircle, Bell } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { useLanguage } from "@/contexts/ZoneLanguageContext";
import { useChat } from "@/contexts/ChatContext";

const MyAccountPage: React.FC = () => {
  const { user } = useAuth();
  const { language } = useLanguage();
  const { conversations, unreadCount } = useChat();
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
    { icon: Calendar, label: isAm ? "ማረፊያ" : "Provider", value: user.provider === "google" ? "Google" : (isAm ? "ኢሜይል" : "Email") },
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

        {/* Quick Actions - Messages & Notifications */}
        <div className="grid grid-cols-2 gap-4 mb-6">
          {/* Message Seller */}
          <button
            onClick={() => {
              // Open chat panel or navigate to messages
              window.dispatchEvent(new CustomEvent('openChatPanel'));
            }}
            className="relative bg-gradient-to-br from-[#00A86B] to-emerald-600 hover:from-emerald-600 hover:to-[#00A86B] text-white rounded-2xl p-4 transition-all duration-300 hover:shadow-lg hover:-translate-y-0.5 active:translate-y-0"
          >
            <div className="flex flex-col items-center gap-2">
              <div className="relative">
                <MessageCircle className="w-7 h-7" strokeWidth={2.5} />
                {unreadCount > 0 && (
                  <span className="absolute -top-1 -right-1 min-w-[18px] h-[18px] px-1 bg-red-500 text-white text-[9px] font-black rounded-full flex items-center justify-center border-2 border-white">
                    {unreadCount > 9 ? '9+' : unreadCount}
                  </span>
                )}
              </div>
              <div className="text-center">
                <p className="text-sm font-black uppercase tracking-wide">
                  {isAm ? "መልዕክቶች" : "Messages"}
                </p>
                <p className="text-xs opacity-90">
                  {isAm ? `${conversations.length} ውይይቶች` : `${conversations.length} chats`}
                </p>
              </div>
            </div>
          </button>

          {/* Notifications */}
          <button
            onClick={() => {
              // Navigate to notifications page or open notifications
              alert(isAm ? "የማሳወቂያ ገጽ በቅርቡ ይመጣል" : "Notifications page coming soon");
            }}
            className="relative bg-white dark:bg-slate-900 hover:bg-slate-50 dark:hover:bg-slate-800 border-2 border-slate-200 dark:border-white/10 hover:border-[#00A86B] rounded-2xl p-4 transition-all duration-300 hover:shadow-lg"
          >
            <div className="flex flex-col items-center gap-2">
              <div className="relative">
                <Bell className="w-7 h-7 text-slate-700 dark:text-slate-300" strokeWidth={2.5} />
                {/* Notification badge - example */}
                <span className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-red-500 rounded-full border-2 border-white dark:border-slate-900"></span>
              </div>
              <div className="text-center">
                <p className="text-sm font-black uppercase tracking-wide text-slate-900 dark:text-white">
                  {isAm ? "ማሳወቂያዎች" : "Notifications"}
                </p>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  {isAm ? "አዲስ 3" : "3 new"}
                </p>
              </div>
            </div>
          </button>
        </div>

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
