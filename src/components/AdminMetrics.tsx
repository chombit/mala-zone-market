/**
 * AdminMetrics.tsx
 * Malazone.com — Premium Light-Themed Analytics
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
        <Loader2 className="w-8 h-8 text-[#00A86B] animate-spin" />
      </div>
    );
  }

  const metrics = [
    {
      label: t("admin.metrics.revenue"),
      value: `${(data?.revenue || 0).toLocaleString()} ETB`,
      trend: "+12%",
      icon: <TrendingUp className="w-5 h-5" />,
      color: "text-[#00A86B]",
      bg: "bg-[#00A86B]/10",
      barColor: "bg-[#00A86B]"
    },
    {
      label: t("admin.metrics.pending"),
      value: (data?.pending || 0).toString(),
      trend: "+5",
      icon: <ClipboardCheck className="w-5 h-5" />,
      color: "text-amber-500",
      bg: "bg-amber-500/10",
      barColor: "bg-amber-500"
    },
    {
      label: t("admin.metrics.agents"),
      value: (data?.agents || 0).toString(),
      trend: "+24",
      icon: <Users className="w-5 h-5" />,
      color: "text-blue-500",
      bg: "bg-blue-500/10",
      barColor: "bg-blue-500"
    },
    {
      label: t("admin.metrics.trades"),
      value: (data?.trades || 0).toLocaleString(),
      trend: "+18%",
      icon: <ArrowUpRight className="w-5 h-5" />,
      color: "text-emerald-500",
      bg: "bg-emerald-500/10",
      barColor: "bg-emerald-500"
    }
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      {metrics.map((m, i) => (
        <div 
          key={i} 
          className="p-6 rounded-2xl bg-white border border-slate-200 shadow-sm hover:border-[#00A86B]/30 hover:shadow-md transition-all duration-300 group relative overflow-hidden"
        >
          <div className="relative z-10 flex flex-col space-y-6">
            <div className="flex items-center justify-between">
              <div className={`w-14 h-14 rounded-xl ${m.bg} flex items-center justify-center ${m.color}`}>
                {m.icon}
              </div>
              <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#00A86B]/10 border border-[#00A86B]/20 text-[10px] font-black text-[#00A86B]">
                {m.trend}
              </div>
            </div>

            <div className="space-y-2">
              <p className="text-[11px] font-black text-malazone-navy uppercase tracking-widest">
                {m.label}
              </p>
              <h3 className="text-3xl font-black text-malazone-navy tracking-tight">
                {m.value}
              </h3>
            </div>
            
            {/* Indicator Bar */}
            <div className="h-1.5 w-full bg-slate-100 rounded-full overflow-hidden">
              <div 
                className={`h-full ${m.barColor} transition-all duration-1000`} 
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
