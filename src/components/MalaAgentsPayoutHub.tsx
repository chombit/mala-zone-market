/**
 * MalaAgentsPayoutHub.tsx
 * Malazone.com — Agent Gig-Economy Compensation Management
 * © 2026 Malazone Technologies PLC
 */

import React, { useState, useEffect } from "react";
import { 
  Users, 
  Phone, 
  ArrowRight, 
  Send, 
  Loader2, 
  CheckCircle2,
  TrendingUp,
  Wallet
} from "lucide-react";
import { useAdminLanguage } from "../contexts/AdminLanguageContext";

interface AgentRecord {
  id: number;
  name: string;
  phone: string;
  listings: number;
  status: 'paid' | 'pending';
}

const MalaAgentsPayoutHub: React.FC = () => {
  const { t } = useAdminLanguage();
  const [processingId, setProcessingId] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);
  const [agents, setAgents] = useState<AgentRecord[]>([]);

  useEffect(() => {
    const fetchAgents = async () => {
      try {
        const response = await fetch("/api/admin/analytics");
        const analytics = await response.json();
        
        // In a full implementation, we'd have a specific /api/admin/agents endpoint
        // For now, let's fetch real users who are agents
        const agentsRes = await fetch("/api/listings?limit=100");
        const listings = await agentsRes.json();
        
        if (listings.success) {
          // Group listings by user to simulate agent activity
          const grouped: Record<number, AgentRecord> = {};
          listings.data.forEach((l: any) => {
            if (!grouped[l.user_id]) {
              grouped[l.user_id] = {
                id: l.user_id,
                name: l.seller_name || "Unknown Agent",
                phone: l.phone || "N/A",
                listings: 0,
                status: 'pending'
              };
            }
            grouped[l.user_id].listings += 1;
          });
          setAgents(Object.values(grouped));
        }
      } catch (err) {
        console.error("Failed to fetch agents:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchAgents();
  }, []);

  const PAY_PER_LISTING = 100;

  const handleTelebirrPayout = async (agent: AgentRecord) => {
    setProcessingId(agent.id);
    try {
      const response = await fetch("/api/admin/payout-agent", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ agent_id: agent.id })
      });
      const result = await response.json();
      
      if (result.success) {
        setAgents(prev => prev.map(a => 
          a.id === agent.id ? { ...a, status: 'paid' } : a
        ));
        alert(`${t("admin.status.success")} — ${agent.listings * PAY_PER_LISTING} ETB sent via telebirr`);
      } else {
        alert(result.message);
      }
    } catch (err) {
      alert(t("admin.status.error"));
    } finally {
      setProcessingId(null);
    }
  };

  if (loading) {
    return (
      <div className="bg-slate-900 border border-white/5 rounded-[2.5rem] p-20 flex justify-center">
        <Loader2 className="w-8 h-8 text-green-500 animate-spin" />
      </div>
    );
  }

  return (
    <div className="bg-slate-900 border border-white/5 rounded-[2.5rem] overflow-hidden shadow-2xl">
      <div className="p-10 border-b border-white/5 flex items-center justify-between bg-slate-950/30">
        <div className="space-y-1">
          <h2 className="text-2xl font-black text-white uppercase italic tracking-tighter flex items-center gap-3">
            <Wallet className="w-6 h-6 text-green-500" />
            {t("admin.sidebar.agents")}
          </h2>
          <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Ethio Telecom telebirr Merchant Settlement</p>
        </div>
        
        <div className="flex items-center gap-8">
          <div className="text-right">
            <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Total Pending Payout</p>
            <p className="text-2xl font-black text-green-500 tracking-tighter italic">
              {agents.filter(a => a.status === 'pending').reduce((acc, curr) => acc + (curr.listings * PAY_PER_LISTING), 0).toLocaleString()} ETB
            </p>
          </div>
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-left">
          <thead>
            <tr className="border-b border-white/5 bg-slate-950/10">
              {[
                "admin.hub.agents.name", 
                "admin.hub.agents.phone", 
                "admin.hub.agents.listings", 
                "admin.hub.agents.earnings", 
                "admin.hub.agents.status",
                "Actions"
              ].map((h, i) => (
                <th key={i} className="px-10 py-6 text-[10px] font-black text-slate-500 uppercase tracking-widest">
                  {t(h as any)}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-white/5">
            {agents.map((agent) => (
              <tr key={agent.id} className="group hover:bg-white/[0.02] transition-colors">
                <td className="px-10 py-8">
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 rounded-full bg-slate-800 border border-white/10 flex items-center justify-center text-xs font-black text-green-500">
                      {agent.name.charAt(0)}
                    </div>
                    <span className="text-sm font-bold text-white">{agent.name}</span>
                  </div>
                </td>
                <td className="px-10 py-8">
                  <div className="flex items-center gap-2 text-slate-400">
                    <Phone className="w-3.5 h-3.5" />
                    <span className="text-xs font-bold font-mono">{agent.phone}</span>
                  </div>
                </td>
                <td className="px-10 py-8 text-center">
                  <div className="inline-flex items-center gap-2 px-3 py-1 rounded-lg bg-white/5 border border-white/5 text-xs font-black text-slate-300">
                    <TrendingUp className="w-3 h-3 text-green-500" />
                    {agent.listings}
                  </div>
                </td>
                <td className="px-10 py-8">
                  <span className="text-sm font-black text-green-500 italic">
                    {(agent.listings * PAY_PER_LISTING).toLocaleString()} ETB
                  </span>
                </td>
                <td className="px-10 py-8">
                  <div className={`inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-[9px] font-black uppercase tracking-widest border ${
                    agent.status === 'paid' 
                      ? 'bg-green-500/10 border-green-500/20 text-green-500' 
                      : 'bg-amber-500/10 border-amber-500/20 text-amber-500'
                  }`}>
                    {agent.status === 'paid' ? <CheckCircle2 className="w-3 h-3" /> : <Loader2 className="w-3 h-3" />}
                    {agent.status === 'paid' ? t("admin.hub.agents.paid") : t("admin.hub.agents.unpaid")}
                  </div>
                </td>
                <td className="px-10 py-8">
                  {agent.status === 'pending' && (
                    <button 
                      onClick={() => handleTelebirrPayout(agent)}
                      disabled={processingId === agent.id}
                      className="w-full flex items-center justify-center gap-3 px-6 py-4 rounded-2xl bg-green-600 hover:bg-green-500 disabled:opacity-50 text-white shadow-xl transition-all group scale-100 hover:scale-105 active:scale-95"
                    >
                      {processingId === agent.id ? (
                        <Loader2 className="w-4 h-4 animate-spin" />
                      ) : (
                        <>
                          <span className="text-[10px] font-black uppercase tracking-[0.2em]">{t("admin.hub.agents.payoutBtn")}</span>
                          <ArrowRight className="w-4 h-4 group-hover:translate-x-2 transition-transform" />
                        </>
                      )}
                    </button>
                  )}
                  {agent.status === 'paid' && (
                    <div className="flex items-center justify-center gap-2 text-slate-600 italic text-[10px] font-bold">
                      <Send className="w-3 h-3" />
                      Transaction Locked
                    </div>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default MalaAgentsPayoutHub;
