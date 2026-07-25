import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, User, Moon, Sun, Globe, Shield, Mail, Phone, ChevronRight, Edit3, Save, X, Key, Trash2, Loader2 } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { useTheme } from "@/contexts/ThemeContext";
import { useLanguage } from "@/contexts/ZoneLanguageContext";
import { LANGUAGE_OPTIONS, type Language } from "@/i18n";

const SettingsPage: React.FC = () => {
  const { user, logout, updateProfile, changePassword } = useAuth();
  const { language, setLanguage } = useLanguage();
  const { isDark, toggleTheme } = useTheme();
  const navigate = useNavigate();

  const isAm = language === "amharic";

  // Profile edit state
  const [editMode, setEditMode] = useState(false);
  const [formData, setFormData] = useState({ full_name: "", email: "", phone_number: "" });
  const [saving, setSaving] = useState(false);
  const [saveMsg, setSaveMsg] = useState<{ type: "success" | "error"; text: string } | null>(null);

  // Password change state
  const [showPassword, setShowPassword] = useState(false);
  const [passwordData, setPasswordData] = useState({ current_password: "", new_password: "", confirm_password: "" });
  const [passwordSaving, setPasswordSaving] = useState(false);
  const [passwordMsg, setPasswordMsg] = useState<{ type: "success" | "error"; text: string } | null>(null);

  // Account deletion state
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deletePassword, setDeletePassword] = useState("");
  const [deleteConfirmation, setDeleteConfirmation] = useState("");
  const [deleting, setDeleting] = useState(false);

  if (!user) {
    navigate("/signin");
    return null;
  }

  const handleStartEdit = () => {
    setFormData({
      full_name: user.full_name,
      email: user.email || "",
      phone_number: user.phone_number || "",
    });
    setSaveMsg(null);
    setEditMode(true);
  };

  const handleSaveProfile = async () => {
    if (!formData.full_name.trim() || formData.full_name.trim().length < 2) {
      setSaveMsg({ type: "error", text: isAm ? "ሙሉ ስም ቢያንስ 2 ቁምፊ መሆን አለበት" : "Name must be at least 2 characters" });
      return;
    }
    setSaving(true);
    setSaveMsg(null);
    const result = await updateProfile({
      full_name: formData.full_name,
      email: formData.email || undefined,
      phone_number: formData.phone_number || undefined,
    });
    setSaving(false);
    if (result.success) {
      setSaveMsg({ type: "success", text: isAm ? "መገለጫ ተስተካክሏል!" : "Profile updated!" });
      setEditMode(false);
    } else {
      setSaveMsg({ type: "error", text: result.message });
    }
  };

  const handleChangePassword = async () => {
    if (!passwordData.current_password || !passwordData.new_password) {
      setPasswordMsg({ type: "error", text: isAm ? "ሁሉንም ምድማቸዎች ያስገቡ" : "Fill all fields" });
      return;
    }
    if (passwordData.new_password.length < 6) {
      setPasswordMsg({ type: "error", text: isAm ? "አዲስ መለያ ቃል ቢያንስ 6 ቁምፊ መሆን አለበት" : "Password must be at least 6 characters" });
      return;
    }
    if (passwordData.new_password !== passwordData.confirm_password) {
      setPasswordMsg({ type: "error", text: isAm ? "አዲስ መለያ ቃሎች አይመሳሰሉም" : "Passwords don't match" });
      return;
    }
    setPasswordSaving(true);
    setPasswordMsg(null);
    const result = await changePassword({
      current_password: passwordData.current_password,
      new_password: passwordData.new_password,
    });
    setPasswordSaving(false);
    if (result.success) {
      setPasswordMsg({ type: "success", text: isAm ? "መለያ ቃል ተቀይጧል!" : "Password changed!" });
      setPasswordData({ current_password: "", new_password: "", confirm_password: "" });
      setShowPassword(false);
    } else {
      setPasswordMsg({ type: "error", text: result.message });
    }
  };

  const handleDeleteAccount = async () => {
    if (deleteConfirmation !== "DELETE") return;
    if (!deletePassword) return;
    setDeleting(true);
    try {
      const response = await fetch("/api/auth/account", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password: deletePassword, confirmation: deleteConfirmation }),
        credentials: "include",
      });
      const result = await response.json();
      if (result.success) {
        await logout();
        navigate("/");
      } else {
        alert(result.message);
      }
    } catch {
      alert("Network error");
    } finally {
      setDeleting(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950">
      <div className="max-w-2xl mx-auto px-4 py-8">
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
            <div className="px-6 py-4 border-b border-slate-100 dark:border-white/5 flex items-center justify-between">
              <h2 className="text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest">
                {isAm ? "የመለያ ዝርዝሮች" : "Account Details"}
              </h2>
              {!editMode && (
                <button
                  onClick={handleStartEdit}
                  className="flex items-center gap-1.5 text-xs font-medium text-[#00A86B] hover:bg-[#00A86B]/10 px-2 py-1 rounded-lg transition-colors"
                >
                  <Edit3 className="w-3.5 h-3.5" />
                  {isAm ? "አርም" : "Edit"}
                </button>
              )}
            </div>
            <div className="divide-y divide-slate-100 dark:divide-white/5">
              {editMode ? (
                <div className="p-6 space-y-4">
                  {saveMsg && (
                    <div className={`p-3 rounded-lg text-sm ${saveMsg.type === "success" ? "bg-emerald-50 dark:bg-emerald-950/30 text-emerald-700 dark:text-emerald-400" : "bg-red-50 dark:bg-red-950/30 text-red-600 dark:text-red-400"}`}>
                      {saveMsg.text}
                    </div>
                  )}
                  <div>
                    <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-1">
                      {isAm ? "ሙሉ ስም" : "Full Name"}
                    </label>
                    <input
                      type="text"
                      value={formData.full_name}
                      onChange={(e) => setFormData({ ...formData, full_name: e.target.value })}
                      className="w-full px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-sm text-slate-900 dark:text-white focus:ring-2 focus:ring-[#00A86B] outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-1">
                      Email
                    </label>
                    <input
                      type="email"
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      className="w-full px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-sm text-slate-900 dark:text-white focus:ring-2 focus:ring-[#00A86B] outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-1">
                      {isAm ? "ስልክ ቁጥር" : "Phone Number"}
                    </label>
                    <input
                      type="text"
                      value={formData.phone_number}
                      onChange={(e) => setFormData({ ...formData, phone_number: e.target.value })}
                      className="w-full px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-sm text-slate-900 dark:text-white focus:ring-2 focus:ring-[#00A86B] outline-none"
                    />
                  </div>
                  <div className="flex gap-3 pt-2">
                    <button
                      onClick={() => setEditMode(false)}
                      className="flex items-center gap-1.5 px-4 py-2 rounded-lg border border-slate-200 dark:border-slate-700 text-sm font-medium text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
                    >
                      <X className="w-4 h-4" />
                      {isAm ? "ሰርዝ" : "Cancel"}
                    </button>
                    <button
                      onClick={handleSaveProfile}
                      disabled={saving}
                      className="flex items-center gap-1.5 px-4 py-2 rounded-lg bg-[#00A86B] text-white text-sm font-bold hover:bg-emerald-600 transition-colors disabled:opacity-50"
                    >
                      {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                      {isAm ? "አስቀምጥ" : "Save"}
                    </button>
                  </div>
                </div>
              ) : (
                <>
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
                </>
              )}
            </div>
          </div>

          {/* Change Password */}
          {user.provider === "local" && (
            <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-white/10 overflow-hidden">
              <div className="px-6 py-4 border-b border-slate-100 dark:border-white/5 flex items-center justify-between">
                <h2 className="text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest">
                  {isAm ? "መለያ ቃል ቀይጥ" : "Change Password"}
                </h2>
                {!showPassword && (
                  <button
                    onClick={() => { setShowPassword(true); setPasswordMsg(null); }}
                    className="flex items-center gap-1.5 text-xs font-medium text-[#00A86B] hover:bg-[#00A86B]/10 px-2 py-1 rounded-lg transition-colors"
                  >
                    <Key className="w-3.5 h-3.5" />
                    {isAm ? "ቀይጥ" : "Change"}
                  </button>
                )}
              </div>
              {showPassword && (
                <div className="p-6 space-y-4">
                  {passwordMsg && (
                    <div className={`p-3 rounded-lg text-sm ${passwordMsg.type === "success" ? "bg-emerald-50 dark:bg-emerald-950/30 text-emerald-700 dark:text-emerald-400" : "bg-red-50 dark:bg-red-950/30 text-red-600 dark:text-red-400"}`}>
                      {passwordMsg.text}
                    </div>
                  )}
                  <div>
                    <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-1">
                      {isAm ? "የአሁን መለያ ቃል" : "Current Password"}
                    </label>
                    <input
                      type="password"
                      value={passwordData.current_password}
                      onChange={(e) => setPasswordData({ ...passwordData, current_password: e.target.value })}
                      className="w-full px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-sm text-slate-900 dark:text-white focus:ring-2 focus:ring-[#00A86B] outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-1">
                      {isAm ? "አዲስ መለያ ቃል" : "New Password"}
                    </label>
                    <input
                      type="password"
                      value={passwordData.new_password}
                      onChange={(e) => setPasswordData({ ...passwordData, new_password: e.target.value })}
                      className="w-full px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-sm text-slate-900 dark:text-white focus:ring-2 focus:ring-[#00A86B] outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-1">
                      {isAm ? "አዲስ መለያ ቃል ያረጋግጡ" : "Confirm New Password"}
                    </label>
                    <input
                      type="password"
                      value={passwordData.confirm_password}
                      onChange={(e) => setPasswordData({ ...passwordData, confirm_password: e.target.value })}
                      className="w-full px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-sm text-slate-900 dark:text-white focus:ring-2 focus:ring-[#00A86B] outline-none"
                    />
                  </div>
                  <div className="flex gap-3 pt-2">
                    <button
                      onClick={() => setShowPassword(false)}
                      className="flex items-center gap-1.5 px-4 py-2 rounded-lg border border-slate-200 dark:border-slate-700 text-sm font-medium text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
                    >
                      <X className="w-4 h-4" />
                      {isAm ? "ሰርዝ" : "Cancel"}
                    </button>
                    <button
                      onClick={handleChangePassword}
                      disabled={passwordSaving}
                      className="flex items-center gap-1.5 px-4 py-2 rounded-lg bg-[#00A86B] text-white text-sm font-bold hover:bg-emerald-600 transition-colors disabled:opacity-50"
                    >
                      {passwordSaving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Key className="w-4 h-4" />}
                      {isAm ? "ቀይጥ" : "Change Password"}
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Preferences */}
          <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-white/10 overflow-hidden">
            <div className="px-6 py-4 border-b border-slate-100 dark:border-white/5">
              <h2 className="text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest">
                {isAm ? "ምርጫዎች" : "Preferences"}
              </h2>
            </div>
            <div className="divide-y divide-slate-100 dark:divide-white/5">
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

          {/* Danger Zone — Account Deletion */}
          <div className="bg-white dark:bg-slate-900 rounded-2xl border-2 border-red-200 dark:border-red-900/50 overflow-hidden">
            <div className="px-6 py-4 border-b border-red-100 dark:border-red-900/30">
              <h2 className="text-xs font-bold text-red-500 dark:text-red-400 uppercase tracking-widest">
                {isAm ? "አስተማማኝ" : "Danger Zone"}
              </h2>
            </div>
            <div className="p-6">
              <p className="text-sm text-slate-600 dark:text-slate-400 mb-4">
                {isAm
                  ? "መለያዎን ማጥፋት ሁሉንም ዝርዝሮች፣ መልዕክቶች እና መረጃዎች ያጠፋል። ይህ ተግባር ሊቀለበስ አይችልም።"
                  : "Deleting your account will remove all your listings, messages, and data. This action cannot be undone."}
              </p>
              <button
                onClick={() => setShowDeleteModal(true)}
                className="flex items-center gap-2 px-4 py-2 rounded-lg bg-red-50 dark:bg-red-950/30 text-red-600 dark:text-red-400 text-sm font-bold hover:bg-red-100 dark:hover:bg-red-950/50 transition-colors"
              >
                <Trash2 className="w-4 h-4" />
                {isAm ? "መለያ ሰርዝ" : "Delete Account"}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Delete Account Modal */}
      {showDeleteModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={() => setShowDeleteModal(false)} />
          <div className="relative w-full max-w-md bg-white dark:bg-slate-900 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-800 p-6">
            <h3 className="text-lg font-black text-red-600 dark:text-red-400 mb-2">
              {isAm ? "መለያ ሰርዝ" : "Delete Account"}
            </h3>
            <p className="text-sm text-slate-600 dark:text-slate-400 mb-4">
              {isAm
                ? "ይህ ተግባር ሊቀለበስ አይችልም። ለማረጋገጥ መለያ ቃልዎን እና \"DELETE\" ይכתב።"
                : "This action is irreversible. Enter your password and type \"DELETE\" to confirm."}
            </p>
            <div className="space-y-3">
              <div>
                <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-1">
                  {isAm ? "መለያ ቃል" : "Password"}
                </label>
                <input
                  type="password"
                  value={deletePassword}
                  onChange={(e) => setDeletePassword(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-sm text-slate-900 dark:text-white focus:ring-2 focus:ring-red-500 outline-none"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-1">
                  {isAm ? "\"DELETE\" ይכתב" : "Type \"DELETE\""}
                </label>
                <input
                  type="text"
                  value={deleteConfirmation}
                  onChange={(e) => setDeleteConfirmation(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-sm text-slate-900 dark:text-white focus:ring-2 focus:ring-red-500 outline-none"
                  placeholder="DELETE"
                />
              </div>
            </div>
            <div className="flex gap-3 mt-6">
              <button
                onClick={() => { setShowDeleteModal(false); setDeletePassword(""); setDeleteConfirmation(""); }}
                className="flex-1 px-4 py-2.5 rounded-lg border border-slate-200 dark:border-slate-700 text-sm font-medium text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
              >
                {isAm ? "ሰርዝ" : "Cancel"}
              </button>
              <button
                onClick={handleDeleteAccount}
                disabled={deleting || deleteConfirmation !== "DELETE" || !deletePassword}
                className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg bg-red-600 text-white text-sm font-bold hover:bg-red-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {deleting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Trash2 className="w-4 h-4" />}
                {isAm ? "መለያ ሰርዝ" : "Delete Account"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default SettingsPage;
