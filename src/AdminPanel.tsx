/**
 * AdminPanel.tsx
 * Malazone.com — Premium Light-Themed Admin Dashboard
 * © 2026 Malazone Technologies PLC
 */

import React from "react";
import { LayoutDashboard, Package, Home, Wallet, LogOut, Globe, Bell, Search, Users, Image, Star, MapPin, Tag, ShieldCheck, Megaphone, Radio, ScrollText, AlertTriangle, CheckCircle2, Menu, X } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { AdminLanguageProvider, useAdminLanguage } from "./contexts/AdminLanguageContext";
import { useAdminAuth } from "./contexts/AdminAuthContext";
import AdminMetrics from "./components/AdminMetrics";
import ListingManagementHub from "./components/ListingManagementHub";
import PropertyVerificationHub from "./components/PropertyVerificationHub";
import MalaAgentsPayoutHub from "./components/MalaAgentsPayoutHub";
import AgentManagement from "./components/AgentManagement";
import AdminUsers from "./components/AdminUsers";
import HeroSlidesManager from "./components/HeroSlidesManager";
import BannerManager from "./components/BannerManager";
import LocationsManager from "./components/LocationsManager";
import CategoriesManager from "./components/CategoriesManager";
import GovernmentAuditDashboard from "./components/GovernmentAuditDashboard";
import PromoTickerManager from "./components/PromoTickerManager";
import { SuperAdminLiveDesk } from "./components/SuperAdminLiveDesk";
import AuditLogsDashboard from "./components/AuditLogsDashboard";

const AdminDashboard: React.FC = () => {
  const { t, toggleLanguage } = useAdminLanguage();
  const { user, logout, isSuperAdmin } = useAdminAuth();
  const [activeTab, setActiveTab] = React.useState("analytics");
  const [sidebarOpen, setSidebarOpen] = React.useState(false);
  const navigate = useNavigate();

  // Re-initialize activeTab once the user is loaded (handles async auth race condition)
  React.useEffect(() => {
    if (user?.role === "g2b_municipality" || user?.role === "g2b_transport") {
      setActiveTab("g2b_pending");
    } else if (user?.role === "super_admin" || user?.role === "admin") {
      setActiveTab((prev) => prev === "analytics" ? "analytics" : prev);
    }
  }, [user?.role]);

  const handleSignOut = () => {
    logout();
    navigate("/");
  };

  const isGovernmentUser = user?.role === "g2b_municipality" || user?.role === "g2b_transport";
  const governmentPortalTab = activeTab === "g2b_transport" || user?.role === "g2b_transport" ? "transport" : "municipality";

  // Define menu items with roles
  const menuItems = [
    // Government Officer Dedicated Sidebar Features
    { key: "Pending Audits", isRawKey: true, icon: <Package className="w-5 h-5" />, id: "g2b_pending", allowedRoles: ["g2b_municipality", "g2b_transport"] },
    { key: "Approved Registry", isRawKey: true, icon: <CheckCircle2 className="w-5 h-5" />, id: "g2b_approved", allowedRoles: ["g2b_municipality", "g2b_transport"] },
    { key: "Fraud & Impound Alerts", isRawKey: true, icon: <AlertTriangle className="w-5 h-5" />, id: "g2b_fraud", allowedRoles: ["g2b_municipality", "g2b_transport"] },
    { key: "Officer Audit Logs", isRawKey: true, icon: <ScrollText className="w-5 h-5" />, id: "g2b_history", allowedRoles: ["g2b_municipality", "g2b_transport"] },
    { key: "Bureau Profile", isRawKey: true, icon: <Users className="w-5 h-5" />, id: "g2b_profile", allowedRoles: ["g2b_municipality", "g2b_transport"] },

    // Super Admin / Admin Portal Items
    { key: "Municipality Portal", isRawKey: true, icon: <ShieldCheck className="w-5 h-5" />, id: "g2b_municipality", allowedRoles: ["super_admin"] },
    { key: "Transport Portal", isRawKey: true, icon: <ShieldCheck className="w-5 h-5" />, id: "g2b_transport", allowedRoles: ["super_admin"] },
    { key: "admin.sidebar.analytics", icon: <LayoutDashboard className="w-5 h-5" />, id: "analytics", allowedRoles: ["super_admin", "admin"] },
    { key: "admin.sidebar.listings", icon: <Package className="w-5 h-5" />, id: "listings", allowedRoles: ["super_admin", "admin"] },
    { key: "admin.sidebar.property", icon: <Home className="w-5 h-5" />, id: "property", allowedRoles: ["super_admin", "admin"] },
    { key: "admin.sidebar.agents", icon: <Wallet className="w-5 h-5" />, id: "agents", allowedRoles: ["super_admin", "admin"] },
    { key: "admin.sidebar.hero", icon: <Star className="w-5 h-5" />, id: "hero", allowedRoles: ["super_admin"] },
    { key: "admin.sidebar.banners", icon: <Image className="w-5 h-5" />, id: "banners", allowedRoles: ["super_admin"] },
    { key: "admin.sidebar.locations", icon: <MapPin className="w-5 h-5" />, id: "locations", allowedRoles: ["super_admin"] },
    { key: "admin.sidebar.categories", icon: <Tag className="w-5 h-5" />, id: "categories", allowedRoles: ["super_admin"] },
    { key: "admin.sidebar.users", icon: <Users className="w-5 h-5" />, id: "users", allowedRoles: ["super_admin"] },
    { key: "Audit Logs", isRawKey: true, icon: <ScrollText className="w-5 h-5" />, id: "audit_logs", allowedRoles: ["super_admin"] },
    { key: "admin.sidebar.live_desk", icon: <Radio className="w-5 h-5" />, id: "live_desk", allowedRoles: ["super_admin", "admin"] },
    { key: "Promo Ticker", isRawKey: true, icon: <Megaphone className="w-5 h-5" />, id: "promo_ticker", allowedRoles: ["super_admin"] },
  ];

  // Filter menu items based on role
  const filteredMenuItems = menuItems.filter(item => item.allowedRoles.includes(user?.role || ""));


  return (
    <div className="min-h-screen bg-slate-50 flex">
      {/* Mobile Overlay */}
      {sidebarOpen && (
        <div className="fixed inset-0 bg-black/50 z-[49] lg:hidden" onClick={() => setSidebarOpen(false)} />
      )}

      {/* Sidebar Navigation */}
      <aside className={`fixed left-0 top-0 z-50 h-screen w-64 bg-white border-r border-slate-200 flex flex-col shadow-sm transition-transform duration-300 lg:translate-x-0 ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}`}>
        {/* Brand Header */}
        <div className="p-6 pb-8 border-b border-slate-100">
          <div className="flex items-center gap-2 mb-1">
            <span className="text-2xl font-black tracking-tighter text-[#00A86B] uppercase">MALA</span>
            <span className="text-2xl font-black tracking-tighter text-malazone-navy uppercase">ZONE</span>
          </div>
          <p className="text-[11px] font-black text-malazone-navy uppercase tracking-[0.3em]">Admin Console</p>
        </div>

        {/* Navigation */}
        <nav className="flex-1 px-4 py-6 space-y-2 overflow-y-auto">
          {filteredMenuItems.map((item) => (
            <button
              key={item.id}
              onClick={() => { setActiveTab(item.id); setSidebarOpen(false); }}
              className={`w-full flex items-center gap-4 px-5 py-4 rounded-xl transition-all duration-200 group ${activeTab === item.id
                ? 'bg-[#00A86B]/10 text-[#00A86B] shadow-sm border border-[#00A86B]/20'
                : 'text-malazone-navy hover:text-malazone-navy hover:bg-slate-50'
                }`}
            >
              <div className={`transition-colors duration-200 ${activeTab === item.id ? 'text-[#00A86B]' : 'text-malazone-navy group-hover:text-malazone-navy'}`}>
                {item.icon}
              </div>
              <span className="text-sm font-bold tracking-tight">
                {item.isRawKey ? item.key : t(item.key as any)}
              </span>
            </button>
          ))}
        </nav>

        {/* Bottom Controls */}
        <div className="p-6 border-t border-slate-100 space-y-4">
          <button
            onClick={toggleLanguage}
            className="w-full flex items-center justify-center gap-3 py-3 rounded-xl border border-slate-200 bg-slate-50 hover:bg-slate-100 transition-all text-sm font-bold text-malazone-navy"
          >
            <Globe className="w-4 h-4 text-[#00A86B]" />
            {t("admin.nav.toggle")}
          </button>

          <button
            onClick={handleSignOut}
            className="flex items-center justify-center gap-3 w-full py-3 text-malazone-navy hover:text-red-500 transition-colors text-sm font-bold tracking-wide"
          >
            <LogOut className="w-4 h-4" />
            Sign Out
          </button>
        </div>
      </aside>

      {/* Main Workspace */}
      <main className="flex-1 lg:ml-64 p-4 sm:p-8 space-y-8 bg-slate-50 min-w-0">
        {/* Top Header */}
        <div className="bg-white rounded-2xl border border-slate-200 p-4 sm:p-6 shadow-sm">
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
            <div className="space-y-1">
              <div className="flex items-center gap-3">
                <button
                  onClick={() => setSidebarOpen(!sidebarOpen)}
                  className="lg:hidden p-2 rounded-xl bg-slate-100 hover:bg-slate-200 transition-colors"
                >
                  {sidebarOpen ? <X className="w-5 h-5 text-malazone-navy" /> : <Menu className="w-5 h-5 text-malazone-navy" />}
                </button>
                <div className="w-1 h-8 bg-[#00A86B] rounded-full" />
                <span className="text-[#00A86B] text-xs font-black uppercase tracking-[0.4em]">
                  {t("admin.title")}
                </span>
              </div>
              <h1 className="text-xl sm:text-3xl font-black tracking-tight text-malazone-navy">
                Welcome Back, <span className="text-[#00A86B]">{user?.full_name || "Admin"}!</span>
              </h1>
            </div>

            <div className="flex items-center gap-4">
              <div className="relative hidden sm:block">
                <Search className="w-4 h-4 text-malazone-navy absolute left-4 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  placeholder="Search listings, agents..."
                  className="pl-12 pr-5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm text-malazone-navy placeholder:text-malazone-navy focus:outline-none focus:border-[#00A86B]/50 focus:bg-white transition-all w-full sm:w-64"
                />
              </div>

              <button className="p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-malazone-navy hover:bg-slate-100 transition-all">
                <Bell className="w-5 h-5" />
              </button>

              <div className="flex items-center gap-3">
                <div className="h-10 w-10 bg-gradient-to-br from-[#00A86B] to-[#008F5B] rounded-full flex items-center justify-center text-white font-bold text-sm">
                  {(user?.full_name || "A")[0]}
                </div>
                <div className="hidden sm:block">
                  <p className="text-sm font-bold text-malazone-navy">{user?.full_name || "System Admin"}</p>
                  <p className="text-xs text-malazone-navy">{t(`admin.role.${user?.role}` as any)}</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Content Switcher */}
        <div className="space-y-8">
          {(isGovernmentUser || activeTab === "g2b_municipality" || activeTab === "g2b_transport" || activeTab.startsWith("g2b_")) && (
            <div className="animate-in fade-in slide-in-from-bottom-4 duration-300">
              <GovernmentAuditDashboard
                overrideTab={governmentPortalTab}
                activeSection={
                  activeTab === "g2b_approved" ? "approved" :
                  activeTab === "g2b_fraud" ? "fraud" :
                  activeTab === "g2b_history" ? "history" :
                  activeTab === "g2b_profile" ? "profile" : "pending"
                }
              />
            </div>
          )}

          {activeTab === "analytics" && !isGovernmentUser && (
            <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-300">
              <AdminMetrics />
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                <PropertyVerificationHub />
                <MalaAgentsPayoutHub />
              </div>
            </div>
          )}

          {activeTab === "listings" && (
            <div className="animate-in fade-in slide-in-from-bottom-4 duration-300">
              <ListingManagementHub />
            </div>
          )}

          {activeTab === "property" && (
            <div className="animate-in fade-in slide-in-from-bottom-4 duration-300">
              <PropertyVerificationHub />
            </div>
          )}

          {activeTab === "agents" && (
            <div className="animate-in fade-in slide-in-from-bottom-4 duration-300">
              <AgentManagement />
            </div>
          )}

          {activeTab === "hero" && isSuperAdmin && (
            <div className="animate-in fade-in slide-in-from-bottom-4 duration-300">
              <HeroSlidesManager />
            </div>
          )}

          {activeTab === "banners" && isSuperAdmin && (
            <div className="animate-in fade-in slide-in-from-bottom-4 duration-300">
              <BannerManager />
            </div>
          )}

          {activeTab === "locations" && isSuperAdmin && (
            <div className="animate-in fade-in slide-in-from-bottom-4 duration-300">
              <LocationsManager />
            </div>
          )}

          {activeTab === "categories" && isSuperAdmin && (
            <div className="animate-in fade-in slide-in-from-bottom-4 duration-300">
              <CategoriesManager />
            </div>
          )}

          {activeTab === "users" && isSuperAdmin && (
            <div className="animate-in fade-in slide-in-from-bottom-4 duration-300">
              <AdminUsers />
            </div>
          )}

          {activeTab === "audit_logs" && isSuperAdmin && (
            <div className="animate-in fade-in slide-in-from-bottom-4 duration-300">
              <AuditLogsDashboard />
            </div>
          )}

          {activeTab === "live_desk" && (
            <div className="animate-in fade-in slide-in-from-bottom-4 duration-300">
              <SuperAdminLiveDesk />
            </div>
          )}

          {activeTab === "promo_ticker" && isSuperAdmin && (
            <div className="animate-in fade-in slide-in-from-bottom-4 duration-300">
              <PromoTickerManager />
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="bg-white rounded-2xl border border-slate-200 p-4 sm:p-6 shadow-sm">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 text-center sm:text-left">
            <p className="text-[10px] sm:text-xs font-bold uppercase tracking-[0.2em] sm:tracking-[0.3em] text-malazone-navy">
              Malazone Technologies PLC — Proprietary Admin Interface
            </p>
            <p className="text-xs text-malazone-navy font-bold">
              © 2026 All Rights Reserved
            </p>
          </div>
        </div>
      </main>
    </div>
  );
};

// Wrap with language provider only. Admin auth is already provided at the app root.
const AdminPanel: React.FC = () => (
  <AdminLanguageProvider>
    <AdminDashboard />
  </AdminLanguageProvider>
);

export default AdminPanel;
