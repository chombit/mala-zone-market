/**
 * PropertyVerificationHub.tsx
 * Malazone.com — Premium Light-Themed Verification Hub
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
        credentials: "include",
        body: JSON.stringify({ is_verified: action === 'approve' })
      });
      const result = await response.json();
      if (result.success) {
        setListings(prev => prev.map(l => 
          l.id === id ? { ...l, status: action === 'approve' ? 'verified' : 'rejected' } : l
        ));
      }
    } catch (err) {
      console.error("Verification failed:", err);
    }
  };

  return (
    <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-sm">
      {/* Hub Header */}
      <div className="p-6 border-b border-slate-200 flex items-center justify-between bg-slate-50/50">
        <div className="space-y-1">
          <h2 className="text-xl font-black text-malazone-navy tracking-tight flex items-center gap-3">
            <ShieldCheck className="w-6 h-6 text-[#00A86B]" />
            Property Verification Hub
          </h2>
          <p className="text-xs font-bold text-malazone-navy uppercase tracking-widest">Municipal Land Registry Cross-Check Workspace</p>
        </div>
      </div>

      {/* Verification List */}
      <div className="p-6">
        {loading ? (
          <div className="p-10 flex items-center justify-center">
            <Loader2 className="w-8 h-8 text-[#00A86B] animate-spin" />
          </div>
        ) : listings.length === 0 ? (
          <div className="p-10 text-center">
            <ShieldCheck className="w-16 h-16 text-slate-300 mx-auto mb-4" />
            <p className="text-malazone-navy font-bold">No properties pending verification</p>
          </div>
        ) : (
          <div className="space-y-4">
            {listings.filter(l => l.status === 'pending').map(listing => (
              <div key={listing.id} className="p-6 border border-slate-200 rounded-xl hover:border-[#00A86B]/30 transition-all">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                  <div className="space-y-1">
                    <div className="flex items-center gap-3">
                      <MapPin className="w-5 h-5 text-[#00A86B]" />
                      <p className="text-sm font-bold text-malazone-navy">{listing.owner}</p>
                    </div>
                    <p className="text-xs text-malazone-navy">{listing.location}</p>
                    <p className="text-xs font-mono text-malazone-navy bg-slate-50 w-fit px-3 py-1 rounded-md">
                      Carta: {listing.carta_number}
                    </p>
                  </div>
                  <div className="flex items-center gap-3">
                    <button
                      onClick={() => simulateMunicipalCheck(listing.id)}
                      className="flex items-center gap-2 px-4 py-2 text-xs font-bold border border-slate-200 bg-slate-50 rounded-lg hover:bg-slate-100 transition-all text-malazone-navy"
                    >
                      {verifyingId === listing.id ? (
                        <Loader2 className="w-4 h-4 animate-spin" />
                      ) : (
                        <Search className="w-4 h-4" />
                      )}
                      Check Registry
                    </button>
                    <button
                      onClick={() => handleAction(listing.id, 'reject')}
                      className="flex items-center gap-2 px-4 py-2 text-xs font-bold border border-red-200 bg-red-50 text-red-600 rounded-lg hover:bg-red-100 transition-all"
                    >
                      <XCircle className="w-4 h-4" />
                      Reject
                    </button>
                    <button
                      onClick={() => handleAction(listing.id, 'approve')}
                      className="flex items-center gap-2 px-4 py-2 text-xs font-bold bg-[#00A86B] text-white rounded-lg hover:bg-[#00A86B]/90 transition-all shadow-lg shadow-[#00A86B]/25"
                    >
                      <CheckCircle2 className="w-4 h-4" />
                      Approve
                    </button>
                  </div>
                </div>
              </div>
            ))}
            {listings.filter(l => l.status === 'pending').length === 0 && (
              <div className="p-10 text-center">
                <ShieldCheck className="w-16 h-16 text-slate-300 mx-auto mb-4" />
                <p className="text-malazone-navy font-bold">All properties verified!</p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default PropertyVerificationHub;
