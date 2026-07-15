/**
 * AdminPanel.tsx
 * Malazone.com — Premium Light-Themed Admin Dashboard
 * © 2026 Malazone Technologies PLC
 */

import React from "react";
import { LayoutDashboard, Package, Home, Wallet, LogOut, Globe, Bell, Search, Users, Image, Star, MapPin, Tag, Settings, ShieldCheck, Megaphone, Radio } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { AdminLanguageProvider, useAdminLanguage } from "./contexts/AdminLanguageContext";
import { AdminAuthProvider, useAdminAuth } from "./contexts/AdminAuthContext";
import AdminMetrics from "./components/AdminMetrics";
import ListingManagementHub from "./components/ListingManagementHub";
import PropertyVerificationHub from "./components/PropertyVerificationHub";
import MalaAgentsPayoutHub from "./components/MalaAgentsPayoutHub";
import AdminUsers from "./components/AdminUsers";
import HeroSlidesManager from "./components/HeroSlidesManager";
import BannerManager from "./components/BannerManager";
import LocationsManager from "./components/LocationsManager";
import CategoriesManager from "./components/CategoriesManager";
import GovernmentAuditDashboard from "./components/GovernmentAuditDashboard";
import PromoTickerManager from "./components/PromoTickerManager";
import { SuperAdminLiveDesk } from "./components/SuperAdminLiveDesk";

const AdminDashboard: React.FC = () => {
  const { t, toggleLanguage } = useAdminLanguage();
  const { user, logout, isSuperAdmin } = useAdminAuth();
  const [activeTab, setActiveTab] = React.useState(
    user?.role === "g2b_municipality" ? "g2b_municipality" :
      user?.role === "g2b_transport" ? "g2b_transport" : "analytics"
  );
  const navigate = useNavigate();

  const handleSignOut = () => {
    logout();
    navigate("/");
  };

  const isGovernmentUser = user?.role === "g2b_municipality" || user?.role === "g2b_transport";
  const governmentPortalTab = user?.role === "g2b_transport" ? "transport" : "municipality";

  // Define menu items with roles
  const menuItems = [
    { key: "Municipality Portal", isRawKey: true, icon: <ShieldCheck className="w-5 h-5" />, id: "g2b_municipality", allowedRoles: ["super_admin", "g2b_municipality"] },
    { key: "Transport Portal", isRawKey: true, icon: <ShieldCheck className="w-5 h-5" />, id: "g2b_transport", allowedRoles: ["super_admin", "g2b_transport"] },
    { key: "admin.sidebar.analytics", icon: <LayoutDashboard className="w-5 h-5" />, id: "analytics", allowedRoles: ["super_admin", "admin"] },
    { key: "admin.sidebar.listings", icon: <Package className="w-5 h-5" />, id: "listings", allowedRoles: ["super_admin", "admin"] },
    { key: "admin.sidebar.property", icon: <Home className="w-5 h-5" />, id: "property", allowedRoles: ["super_admin", "admin"] },
    { key: "admin.sidebar.agents", icon: <Wallet className="w-5 h-5" />, id: "agents", allowedRoles: ["super_admin", "admin"] },
    { key: "admin.sidebar.hero", icon: <Star className="w-5 h-5" />, id: "hero", allowedRoles: ["super_admin"] },
    { key: "admin.sidebar.banners", icon: <Image className="w-5 h-5" />, id: "banners", allowedRoles: ["super_admin"] },
    { key: "admin.sidebar.locations", icon: <MapPin className="w-5 h-5" />, id: "locations", allowedRoles: ["super_admin"] },
    { key: "admin.sidebar.categories", icon: <Tag className="w-5 h-5" />, id: "categories", allowedRoles: ["super_admin"] },
    { key: "admin.sidebar.users", icon: <Users className="w-5 h-5" />, id: "users", allowedRoles: ["super_admin"] },
    { key: "admin.sidebar.live_desk", icon: <Radio className="w-5 h-5" />, id: "live_desk", allowedRoles: ["super_admin", "admin"] },
    { key: "Promo Ticker", isRawKey: true, icon: <Megaphone className="w-5 h-5" />, id: "promo_ticker", allowedRoles: ["super_admin"] },
  ];

  // Filter menu items based on role
  const filteredMenuItems = menuItems.filter(item => item.allowedRoles.includes(user?.role || ""));

  if (isGovernmentUser) {
    return (
      <div className="min-h-screen bg-slate-100">
        <div className="mx-auto flex w-full max-w-[1600px] items-center justify-end gap-3 px-4 py-4 sm:px-6">
          <button
            onClick={toggleLanguage}
            className="inline-flex items-center justify-center gap-2 rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm font-bold text-malazone-navy transition hover:bg-slate-50"
          >
            <Globe className="w-4 h-4 text-[#00A86B]" />
            {t("admin.nav.toggle")}
          </button>
          <button
            onClick={handleSignOut}
            className="inline-flex items-center justify-center gap-2 rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm font-bold text-malazone-navy transition hover:border-red-200 hover:text-red-600"
          >
            <LogOut className="w-4 h-4" />
            Sign Out
          </button>
        </div>

        <div className="mx-auto w-full max-w-[1600px] px-4 pb-6 sm:px-6">
          <GovernmentAuditDashboard overrideTab={governmentPortalTab} />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 flex">
      {/* Sidebar Navigation */}
      <aside className="w-64 h-screen bg-white border-r border-slate-200 flex flex-col fixed left-0 top-0 z-50 shadow-sm">
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
              onClick={() => setActiveTab(item.id)}
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
      <main className="flex-1 ml-64 p-8 space-y-8 bg-slate-50">
        {/* Top Header */}
        <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm">
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
            <div className="space-y-1">
              <div className="flex items-center gap-3">
                <div className="w-1 h-8 bg-[#00A86B] rounded-full" />
                <span className="text-[#00A86B] text-xs font-black uppercase tracking-[0.4em]">
                  {t("admin.title")}
                </span>
              </div>
              <h1 className="text-3xl font-black tracking-tight text-malazone-navy">
                Welcome Back, <span className="text-[#00A86B]">{user?.full_name || "Admin"}!</span>
              </h1>
            </div>

            <div className="flex items-center gap-4">
              <div className="relative hidden sm:block">
                <Search className="w-4 h-4 text-malazone-navy absolute left-4 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  placeholder="Search listings, agents..."
                  className="pl-12 pr-5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm text-malazone-navy placeholder:text-malazone-navy focus:outline-none focus:border-[#00A86B]/50 focus:bg-white transition-all w-64"
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
          {(activeTab === "g2b_municipality" || activeTab === "g2b_transport") && (
            <div className="animate-in fade-in slide-in-from-bottom-4 duration-300 -mx-8 -mt-8">
              <GovernmentAuditDashboard overrideTab={activeTab === "g2b_municipality" ? "municipality" : "transport"} />
            </div>
          )}

          {activeTab === "analytics" && (
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
              <MalaAgentsPayoutHub />
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
        <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            <p className="text-xs font-bold uppercase tracking-[0.3em] text-malazone-navy">
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

// Wrap with both providers
const AdminPanel: React.FC = () => (
  <AdminAuthProvider>
    <AdminLanguageProvider>
      <AdminDashboard />
    </AdminLanguageProvider>
  </AdminAuthProvider>
);

export default AdminPanel;
