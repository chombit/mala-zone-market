/**
 * AdminPanel.tsx
 * Malazone.com — Elite Admin Command Center Entry Point
 * © 2026 Malazone Technologies PLC
 */

import React from "react";
import { LayoutDashboard, Package, Home, Wallet, LogOut, Globe } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { AdminLanguageProvider, useAdminLanguage } from "./contexts/AdminLanguageContext";
import AdminMetrics from "./components/AdminMetrics";
import ListingManagementHub from "./components/ListingManagementHub";
import PropertyVerificationHub from "./components/PropertyVerificationHub";
import MalaAgentsPayoutHub from "./components/MalaAgentsPayoutHub";

const AdminDashboard: React.FC = () => {
  const { t, toggleLanguage } = useAdminLanguage();
  const [activeTab, setActiveTab] = React.useState("analytics");
  const navigate = useNavigate();

  const handleSignOut = () => {
    localStorage.removeItem("malazone_admin_token");
    navigate("/");
  };

  return (
    <div className="min-h-screen bg-slate-950 text-white flex">
      {/* Sidebar Navigation */}
      <aside className="w-80 h-screen bg-slate-900 border-r border-white/5 flex flex-col fixed left-0 top-0 z-50 overflow-hidden">
        {/* Brand Header */}
        <div className="p-8 border-b border-white/5 bg-slate-950/50">
          <div className="flex items-center gap-2 mb-1">
            <span className="text-xl font-black tracking-tighter text-green-500 uppercase">MALA</span>
            <span className="text-xl font-black tracking-tighter text-white uppercase">ZONE</span>
          </div>
          <p className="text-[10px] font-bold text-slate-500 uppercase tracking-[0.3em]">Admin Console</p>
        </div>

        {/* Navigation */}
        <nav className="flex-1 p-6 space-y-2 overflow-y-auto">
          {[
            { key: "admin.sidebar.analytics", icon: <LayoutDashboard className="w-5 h-5" />, id: "analytics" },
            { key: "admin.sidebar.listings", icon: <Package className="w-5 h-5" />, id: "listings" },
            { key: "admin.sidebar.property", icon: <Home className="w-5 h-5" />, id: "property" },
            { key: "admin.sidebar.agents", icon: <Wallet className="w-5 h-5" />, id: "agents" },
          ].map((item) => (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              className={`w-full flex items-center gap-4 px-5 py-4 rounded-2xl transition-all group ${
                activeTab === item.id ? 'bg-green-600/10 text-white border border-green-500/20' : 'text-slate-400 hover:text-white hover:bg-white/5'
              }`}
            >
              <div className={activeTab === item.id ? 'text-green-500' : 'text-slate-500 group-hover:text-green-500'}>
                {item.icon}
              </div>
              <span className="text-[11px] font-black uppercase tracking-widest">
                {t(item.key as any)}
              </span>
            </button>
          ))}
        </nav>

        {/* Bottom Controls & Signature */}
        <div className="p-8 border-t border-white/5 space-y-6 bg-slate-950/30">
          <button
            onClick={toggleLanguage}
            className="w-full flex items-center justify-center gap-3 py-3 rounded-xl border border-white/5 bg-white/5 hover:bg-white/10 transition-all text-xs font-bold text-slate-300 group"
          >
            <Globe className="w-4 h-4 text-green-500 group-hover:rotate-12 transition-transform" />
            {t("admin.nav.toggle")}
          </button>

          <div className="space-y-3">
            <p className="text-[10px] font-bold text-slate-400 leading-relaxed italic">{t("admin.ceo.signature")}</p>
            <button 
              onClick={handleSignOut}
              className="flex items-center gap-3 text-slate-500 hover:text-red-400 transition-colors text-[10px] font-black uppercase tracking-widest"
            >
              <LogOut className="w-4 h-4" />
              Sign Out
            </button>
          </div>
        </div>
      </aside>

      {/* Main Workspace */}
      <main className="flex-1 ml-80 p-12 space-y-12">
        
        {/* Header Section */}
        <div className="flex items-end justify-between border-b border-white/5 pb-10">
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-1.5 h-8 bg-green-500 rounded-full" />
              <span className="text-green-500 text-[11px] font-black uppercase tracking-[0.4em]">
                {t("admin.title")}
              </span>
            </div>
            <h1 className="text-5xl font-black tracking-tighter uppercase italic leading-none">
              Control <span className="text-green-500 not-italic">Center</span>
            </h1>
          </div>
        </div>

        {/* Content Switcher */}
        {activeTab === "analytics" && (
          <div className="space-y-12 animate-fade-in">
            <AdminMetrics />
            <div className="grid grid-cols-1 gap-12">
              <PropertyVerificationHub />
              <MalaAgentsPayoutHub />
            </div>
          </div>
        )}

        {activeTab === "listings" && (
          <div className="animate-fade-in">
            <ListingManagementHub />
          </div>
        )}

        {activeTab === "property" && (
          <div className="animate-fade-in">
            <PropertyVerificationHub />
          </div>
        )}

        {activeTab === "agents" && (
          <div className="animate-fade-in">
            <MalaAgentsPayoutHub />
          </div>
        )}

        {/* Footer Signature */}
        <div className="pt-20 border-t border-white/5 flex justify-between items-center text-slate-700">
          <p className="text-[9px] font-black uppercase tracking-[0.5em]">
            Malazone Technologies PLC — Proprietary Admin Interface v2.0
          </p>
        </div>
      </main>
    </div>
  );
};

// Wrap with Provider for stand-alone export
const AdminPanel: React.FC = () => (
  <AdminLanguageProvider>
    <AdminDashboard />
  </AdminLanguageProvider>
);

export default AdminPanel;
