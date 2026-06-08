/**
 * PropertyVerificationHub.tsx
 * Malazone.com — High-Security Municipal Cross-Check Workspace
 * © 2026 Malazone Technologies PLC
 */

import React, { useState, useEffect } from "react";
import { 
  ShieldCheck, 
  MapPin, 
  Search, 
  CheckCircle2, 
  XCircle, 
  Loader2,
  ExternalLink
} from "lucide-react";
import { useAdminLanguage } from "../contexts/AdminLanguageContext";

interface PropertyListing {
  id: string;
  user_id: number;
  owner: string;
  location: string;
  carta_number: string;
  status: 'pending' | 'verified' | 'rejected';
}

const PropertyVerificationHub: React.FC = () => {
  const { t } = useAdminLanguage();
  const [verifyingId, setVerifyingId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [listings, setListings] = useState<PropertyListing[]>([]);

  useEffect(() => {
    const fetchPending = async () => {
      try {
        const response = await fetch("/api/listings?limit=50");
        const result = await response.json();
        if (result.success) {
          // Transform database rows to local interface
          const transformed = result.data.map((l: any) => ({
            id: l.id.toString(),
            user_id: l.user_id,
            owner: l.seller_name || "Unknown Owner",
            location: l.location_label_en || l.location_key,
            carta_number: l.plate_code || "N/A", // Use plate_code as placeholder for carta in this demo schema
            status: l.is_verified ? 'verified' : 'pending'
          }));
          setListings(transformed);
        }
      } catch (err) {
        console.error("Failed to fetch pending listings:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchPending();
  }, []);

  const simulateMunicipalCheck = async (id: string) => {
    setVerifyingId(id);
    // Simulate API delay to Municipal Land Bureau
    await new Promise(resolve => setTimeout(resolve, 2000));
    setVerifyingId(null);
    alert(t("admin.status.success"));
  };

  const handleAction = async (id: string, action: 'approve' | 'reject') => {
    try {
      const response = await fetch(`/api/admin/verify-listing/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ is_verified: action === 'approve' })
      });
      const result = await response.json();
      if (result.success) {
        setListings(prev => prev.map(l => 
          l.id === id ? { ...l, status: action === 'approve' ? 'verified' : 'rejected' } : l
        ));
      }
    } catch (err) {
      alert(t("admin.status.error"));
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
            <ShieldCheck className="w-6 h-6 text-green-500" />
            {t("admin.sidebar.property")}
          </h2>
          <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Municipal Title Deed Authentication Hub</p>
        </div>
        <div className="flex items-center gap-4">
          <div className="relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
            <input 
              type="text" 
              placeholder="Search Carta..." 
              className="bg-white/5 border border-white/5 rounded-xl py-3 pl-12 pr-6 text-xs text-white focus:outline-none focus:border-green-500/50 transition-all"
            />
          </div>
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-left">
          <thead>
            <tr className="border-b border-white/5 bg-slate-950/10">
              {[
                "admin.hub.property.id", 
                "admin.hub.property.owner", 
                "admin.hub.property.location", 
                "admin.hub.property.carta", 
                "Actions"
              ].map((h, i) => (
                <th key={i} className="px-10 py-6 text-[10px] font-black text-slate-500 uppercase tracking-widest">
                  {t(h as any)}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-white/5">
            {listings.map((item) => (
              <tr key={item.id} className="group hover:bg-white/[0.02] transition-colors">
                <td className="px-10 py-8">
                  <span className="text-xs font-black text-white tracking-widest">{item.id}</span>
                </td>
                <td className="px-10 py-8">
                  <span className="text-sm font-medium text-slate-300">{item.owner}</span>
                </td>
                <td className="px-10 py-8">
                  <div className="flex items-center gap-2 text-slate-400">
                    <MapPin className="w-3.5 h-3.5" />
                    <span className="text-xs font-bold">{item.location}</span>
                  </div>
                </td>
                <td className="px-10 py-8">
                  <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg bg-white/5 border border-white/5 text-[10px] font-mono text-slate-400">
                    {item.carta_number}
                  </div>
                </td>
                <td className="px-10 py-8">
                  <div className="flex items-center gap-4">
                    <button 
                      onClick={() => simulateMunicipalCheck(item.id)}
                      disabled={verifyingId === item.id}
                      className="flex items-center gap-2 px-4 py-2 rounded-xl bg-white/5 border border-white/5 hover:bg-white/10 hover:border-green-500/30 transition-all text-[10px] font-black uppercase tracking-widest text-slate-400"
                    >
                      {verifyingId === item.id ? (
                        <Loader2 className="w-3 h-3 animate-spin" />
                      ) : (
                        <ExternalLink className="w-3 h-3" />
                      )}
                      {t("admin.hub.property.verifyBtn")}
                    </button>

                    <button 
                      onClick={() => handleAction(item.id, 'approve')}
                      className="p-2 rounded-xl bg-green-500/10 border border-green-500/20 text-green-500 hover:bg-green-500 hover:text-white transition-all shadow-lg"
                    >
                      <CheckCircle2 className="w-5 h-5" />
                    </button>

                    <button 
                      onClick={() => handleAction(item.id, 'reject')}
                      className="p-2 rounded-xl bg-red-500/10 border border-red-500/20 text-red-500 hover:bg-red-500 hover:text-white transition-all shadow-lg"
                    >
                      <XCircle className="w-5 h-5" />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default PropertyVerificationHub;
