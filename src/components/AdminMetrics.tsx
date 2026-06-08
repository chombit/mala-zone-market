/**
 * AdminMetrics.tsx
 * Malazone.com — Elite Analytical Data Summaries
 * © 2026 Malazone Technologies PLC
 */

import React, { useState, useEffect } from "react";
import { TrendingUp, Users, ClipboardCheck, ArrowUpRight, Loader2 } from "lucide-react";
import { useAdminLanguage } from "../contexts/AdminLanguageContext";

interface AnalyticsData {
  revenue: number;
  pending: number;
  agents: number;
  trades: number;
}

const AdminMetrics: React.FC = () => {
  const { t } = useAdminLanguage();
  const [data, setData] = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAnalytics = async () => {
      try {
        const response = await fetch("/api/admin/analytics");
        const result = await response.json();
        if (result.success) {
          setData(result.data);
        }
      } catch (err) {
        console.error("Failed to fetch admin analytics:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchAnalytics();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="w-8 h-8 text-green-500 animate-spin" />
      </div>
    );
  }

  const metrics = [
    {
      label: t("admin.metrics.revenue"),
      value: `${(data?.revenue || 0).toLocaleString()} ETB`,
      trend: "+12%",
      icon: <TrendingUp className="w-5 h-5" />,
      color: "text-green-500",
      bg: "bg-green-500/10"
    },
    {
      label: t("admin.metrics.pending"),
      value: (data?.pending || 0).toString(),
      trend: "+5",
      icon: <ClipboardCheck className="w-5 h-5" />,
      color: "text-amber-500",
      bg: "bg-amber-500/10"
    },
    {
      label: t("admin.metrics.agents"),
      value: (data?.agents || 0).toString(),
      trend: "+24",
      icon: <Users className="w-5 h-5" />,
      color: "text-blue-500",
      bg: "bg-blue-500/10"
    },
    {
      label: t("admin.metrics.trades"),
      value: (data?.trades || 0).toLocaleString(),
      trend: "+18%",
      icon: <ArrowUpRight className="w-5 h-5" />,
      color: "text-emerald-500",
      bg: "bg-emerald-500/10"
    }
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      {metrics.map((m, i) => (
        <div 
          key={i} 
          className="p-8 rounded-[2.5rem] bg-slate-900 border border-white/5 hover:border-green-500/20 transition-all duration-500 group relative overflow-hidden"
        >
          {/* Ambient Glow */}
          <div className={`absolute top-0 right-0 w-32 h-32 ${m.bg} blur-[60px] opacity-0 group-hover:opacity-100 transition-opacity`} />
          
          <div className="relative z-10 flex flex-col space-y-6">
            <div className="flex items-center justify-between">
              <div className={`w-12 h-12 rounded-2xl ${m.bg} flex items-center justify-center ${m.color}`}>
                {m.icon}
              </div>
              <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/5 border border-white/5 text-[10px] font-black text-green-500">
                {m.trend}
              </div>
            </div>

            <div className="space-y-1">
              <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest">
                {m.label}
              </p>
              <h3 className="text-3xl font-black text-white tracking-tighter italic">
                {m.value}
              </h3>
            </div>
            
            {/* Simple Sparkline Simulation */}
            <div className="h-1 w-full bg-white/5 rounded-full overflow-hidden">
              <div 
                className={`h-full ${m.color.replace('text', 'bg')} transition-all duration-1000`} 
                style={{ width: `${60 + Math.random() * 30}%` }} 
              />
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};

export default AdminMetrics;
