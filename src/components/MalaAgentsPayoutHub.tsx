/**
 * MalaAgentsPayoutHub.tsx
 * Malazone.com — Premium Light-Themed Agent Payout Hub
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
      }
    } catch (err) {
      console.error("Payout failed:", err);
    } finally {
      setProcessingId(null);
    }
  };

  return (
    <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-sm">
      {/* Hub Header */}
      <div className="p-6 border-b border-slate-200 flex items-center justify-between bg-slate-50/50">
        <div className="space-y-1">
          <h2 className="text-xl font-black text-slate-900 tracking-tight flex items-center gap-3">
            <Wallet className="w-6 h-6 text-[#00A86B]" />
            Mala-Agents Payout Hub
          </h2>
          <p className="text-xs font-bold text-slate-500 uppercase tracking-widest">Telebirr Merchant Settlement</p>
        </div>
        <div className="text-right">
          <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Total Pending Payout</p>
          <p className="text-2xl font-black text-[#00A86B]">
            {(agents.filter(a => a.status === 'pending').length * PAY_PER_LISTING).toLocaleString()} ETB
          </p>
        </div>
      </div>

      {/* Agents List */}
      <div className="p-6">
        {loading ? (
          <div className="p-10 flex items-center justify-center">
            <Loader2 className="w-8 h-8 text-[#00A86B] animate-spin" />
          </div>
        ) : agents.length === 0 ? (
          <div className="p-10 text-center">
            <Users className="w-16 h-16 text-slate-300 mx-auto mb-4" />
            <p className="text-slate-600 font-bold">No agents found</p>
          </div>
        ) : (
          <div className="space-y-4">
            {agents.map(agent => (
              <div key={agent.id} className="p-6 border border-slate-200 rounded-xl hover:border-[#00A86B]/30 transition-all flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div className="space-y-1">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-gradient-to-br from-[#00A86B] to-[#008f5b] rounded-full flex items-center justify-center text-white font-bold text-sm">
                      {agent.name.charAt(0)}
                    </div>
                    <p className="text-sm font-bold text-slate-900">{agent.name}</p>
                  </div>
                  <p className="text-xs text-slate-500 flex items-center gap-1.5">
                    <Phone className="w-3 h-3" />
                    {agent.phone}
                  </p>
                  <p className="text-xs text-slate-600 font-bold flex items-center gap-1.5">
                    <TrendingUp className="w-3 h-3" />
                    {agent.listings} listings • {(agent.listings * PAY_PER_LISTING).toLocaleString()} ETB
                  </p>
                </div>
                <div className="flex items-center gap-3">
                  {agent.status === 'paid' ? (
                    <span className="inline-flex items-center gap-1.5 px-4 py-2 bg-[#00A86B]/10 text-[#00A86B] text-xs font-bold rounded-lg">
                      <CheckCircle2 className="w-4 h-4" />
                      Paid
                    </span>
                  ) : (
                    <button
                      onClick={() => handleTelebirrPayout(agent)}
                      className="flex items-center gap-2 px-4 py-2 text-xs font-bold bg-[#00A86B] text-white rounded-lg hover:bg-[#00A86B]/90 transition-all shadow-lg shadow-[#00A86B]/25"
                    >
                      {processingId === agent.id ? (
                        <Loader2 className="w-4 h-4 animate-spin" />
                      ) : (
                        <Send className="w-4 h-4" />
                      )}
                      Send via Telebirr
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default MalaAgentsPayoutHub;
