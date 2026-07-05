/**
 * AdminSidebar.tsx
 * Malazone.com — Elite Admin Vertical Navigation
 * © 2026 Malazone Technologies PLC
 */

import React from "react";
import {
  LayoutDashboard,
  Home,
  Car,
  Palmtree,
  Construction,
  Wallet,
  Globe,
  LogOut,
  Package
} from "lucide-react";
import { useAdminLanguage } from "../contexts/AdminLanguageContext";

const AdminSidebar: React.FC = () => {
  const { t, toggleLanguage } = useAdminLanguage();

  const menuItems = [
    { key: "admin.sidebar.analytics", icon: <LayoutDashboard className="w-5 h-5" />, path: "analytics" },
    { key: "admin.sidebar.listings", icon: <Package className="w-5 h-5" />, path: "listings" },
    { key: "admin.sidebar.property", icon: <Home className="w-5 h-5" />, path: "property" },
    { key: "admin.sidebar.motors", icon: <Car className="w-5 h-5" />, path: "motors" },
    { key: "admin.sidebar.stay", icon: <Palmtree className="w-5 h-5" />, path: "stay" },
    { key: "admin.sidebar.heavy", icon: <Construction className="w-5 h-5" />, path: "heavy" },
    { key: "admin.sidebar.agents", icon: <Wallet className="w-5 h-5" />, path: "agents" },
  ];

  return (
    <aside className="w-80 h-screen bg-slate-900 border-r border-white/5 flex flex-col fixed left-0 top-0 z-50 overflow-hidden">
      {/* Brand Header */}
      <div className="p-8 border-b border-white/5 bg-slate-950/50">
        <div className="flex items-center gap-2 mb-1">
          <span className="text-xl font-black tracking-tighter text-green-500 uppercase">MALA</span>
          <span className="text-xl font-black tracking-tighter text-white uppercase">ZONE</span>
        </div>
        <p className="text-[10px] font-bold text-malazone-navy uppercase tracking-[0.3em]">Admin Console</p>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-6 space-y-2 overflow-y-auto">
        {menuItems.map((item) => (
          <button
            key={item.path}
            className="w-full flex items-center gap-4 px-5 py-4 rounded-2xl text-malazone-navy hover:text-white hover:bg-white/5 transition-all group"
          >
            <div className="text-malazone-navy group-hover:text-green-500 transition-colors">
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
          className="w-full flex items-center justify-center gap-3 py-3 rounded-xl border border-white/5 bg-white/5 hover:bg-white/10 transition-all text-xs font-bold text-slate-300"
        >
          <Globe className="w-4 h-4 text-green-500" />
          {t("admin.nav.toggle")}
        </button>

        <div className="space-y-3">
          <div className="w-8 h-px bg-green-500/30" />
          <p className="text-[10px] font-bold text-malazone-navy leading-relaxed italic">
            {t("admin.ceo.signature" as any)}
          </p>
        </div>

        <button className="flex items-center gap-3 text-malazone-navy hover:text-red-400 transition-colors text-[10px] font-black uppercase tracking-widest">
          <LogOut className="w-4 h-4" />
          Sign Out
        </button>
      </div>
    </aside>
  );
};

export default AdminSidebar;
