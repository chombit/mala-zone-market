/**
 * PromosVerificationHub.tsx
 * Malazone.com — Admin verification queue for self-serve listing boosts
 * (manual Telebirr / CBE payments). Confirming activates is_premium on the
 * listing for the package duration.
 * © 2026 Malazone Technologies PLC
 */

import React, { useCallback, useEffect, useState } from 'react';
import { CheckCircle2, XCircle, Loader2, Wallet, ExternalLink } from 'lucide-react';

interface PromoRow {
  promo_id: number;
  listing_id: number;
  amount_etb: string | number;
  method: 'telebirr' | 'cbe';
  reference: string;
  evidence_urls: string[] | string;
  seller_note: string | null;
  status: string;
  verified_at: string | null;
  expires_at: string | null;
  reject_reason: string | null;
  ordered_at: string;
  package_slug: string;
  package_name_en: string;
  package_name_am: string;
  duration_days: number;
  seller_name: string;
  seller_phone: string;
  title_en: string;
  title_am: string;
  category: string;
  reviewer_name: string | null;
}

const STATUS_TABS = ['submitted', 'verified', 'rejected'];

const PromosVerificationHub: React.FC = () => {
  const [tab, setTab] = useState<'submitted' | 'verified' | 'rejected'>('submitted');
  const [rows, setRows] = useState<PromoRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [busyId, setBusyId] = useState<number | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/admin/promo-verifications?status=${tab}`, { credentials: 'include' });
      const data = await res.json();
      if (data.success) {
        setRows((data.data || []).map((r: PromoRow) => ({
          ...r,
          evidence_urls: Array.isArray(r.evidence_urls) ? r.evidence_urls : [],
        })));
      } else {
        setRows([]);
      }
    } catch {
      setRows([]);
    } finally {
      setLoading(false);
    }
  }, [tab]);

  useEffect(() => { load(); }, [load]);

  const act = async (id: number, action: 'verify' | 'reject') => {
    const reason = action === 'reject'
      ? window.prompt('Rejection reason (sent to the seller):', 'Payment not received')
      : undefined;
    if (action === 'reject' && reason === null) return;
    setBusyId(id);
    try {
      const res = await fetch(`/api/admin/promo-verifications/${id}/${action}`, {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ reason }),
      });
      const data = await res.json();
      if (!data.success) {
        alert(`${action}: ${data.message || 'failed'}`);
      }
    } catch {
      alert('Network error');
    } finally {
      setBusyId(null);
      load();
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h2 className="text-xl font-black text-malazone-navy mb-1">Boost Payment Verification</h2>
          <p className="text-sm text-malazone-navy/70">
            Confirm manual Telebirr / CBE payments before activating a seller's promotion.
          </p>
        </div>
        <div className="flex items-center gap-2 bg-slate-100 rounded-xl p-1">
          {STATUS_TABS.map((s) => (
            <button
              key={s}
              onClick={() => setTab(s as typeof tab)}
              className={`px-4 py-1.5 rounded-lg text-sm font-bold capitalize transition-all ${
                tab === s ? 'bg-white shadow-sm text-[#00A86B]' : 'text-malazone-navy/60 hover:text-malazone-navy'
              }`}
            >
              {s}
            </button>
          ))}
        </div>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-16 text-malazone-navy/40">
          <Loader2 className="w-6 h-6 animate-spin" />
        </div>
      ) : rows.length === 0 ? (
        <div className="bg-white border border-slate-200 rounded-2xl p-12 text-center">
          <Wallet className="w-10 h-10 mx-auto mb-3 text-slate-300" />
          <p className="text-sm font-semibold text-malazone-navy/60">No {tab} promotion orders</p>
        </div>
      ) : (
        <div className="space-y-4">
          {rows.map((r) => (
            <div key={r.promo_id} className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm space-y-4">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-[#00A86B]/10 flex items-center justify-center">
                    <Wallet className="w-5 h-5 text-[#00A86B]" />
                  </div>
                  <div>
                    <p className="text-sm font-black text-malazone-navy">
                      {r.title_en}{' '}
                      <a href={`/listing/${r.listing_id}`} className="text-[#00A86B] inline-flex items-center gap-1">
                        #{r.listing_id} <ExternalLink className="w-3 h-3" />
                      </a>
                    </p>
                    <p className="text-xs text-malazone-navy/60">
                      {r.seller_name} · {r.seller_phone} · {r.category}
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-lg font-black text-malazone-navy">ETB {r.amount_etb}</p>
                  <p className="text-xs font-bold text-[#00A86B]">{r.reference}</p>
                </div>
              </div>

              <div className="flex flex-wrap gap-6 text-xs text-malazone-navy/70">
                <span>
                  <b className="block text-malazone-navy uppercase tracking-wider mb-0.5">Package</b>
                  {r.package_name_en} · {r.duration_days} days
                </span>
                <span>
                  <b className="block text-malazone-navy uppercase tracking-wider mb-0.5">Method</b>
                  {r.method === 'telebirr' ? 'Telebirr' : 'CBE Birr'}
                </span>
                <span>
                  <b className="block text-malazone-navy uppercase tracking-wider mb-0.5">Ordered</b>
                  {new Date(r.ordered_at).toLocaleString()}
                </span>
                {r.expires_at && (
                  <span>
                    <b className="block text-malazone-navy uppercase tracking-wider mb-0.5">Expires</b>
                    {new Date(r.expires_at).toLocaleString()}
                  </span>
                )}
              </div>

              {Array.isArray(r.evidence_urls) && r.evidence_urls.length > 0 && (
                <div>
                  <p className="text-xs font-bold uppercase tracking-wider text-malazone-navy mb-2">Evidence</p>
                  <div className="flex flex-wrap gap-2">
                    {r.evidence_urls.map((u, i) => (
                      <a key={i} href={u} target="_blank" rel="noreferrer">
                        <img src={u} alt="evidence" className="w-20 h-20 object-cover rounded-lg border border-slate-200" />
                      </a>
                    ))}
                  </div>
                </div>
              )}
              {r.seller_note && (
                <p className="text-xs text-malazone-navy/60 bg-slate-50 border border-slate-100 rounded-lg p-2">
                  Note: {r.seller_note}
                </p>
              )}
              {r.reject_reason && (
                <p className="text-xs text-red-500 bg-red-50 border border-red-100 rounded-lg p-2">
                  Rejected: {r.reject_reason}
                </p>
              )}
              {r.reviewer_name && (
                <p className="text-xs text-malazone-navy/50">Reviewed by {r.reviewer_name}</p>
              )}

              {tab === 'submitted' && (
                <div className="flex gap-3 pt-1">
                  <button
                    onClick={() => act(r.promo_id, 'verify')}
                    disabled={busyId === r.promo_id}
                    className="flex items-center gap-2 px-4 py-2 rounded-lg bg-[#00A86B] text-white text-sm font-bold hover:bg-emerald-600 transition-colors disabled:opacity-50"
                  >
                    {busyId === r.promo_id ? <Loader2 className="w-4 h-4 animate-spin" /> : <CheckCircle2 className="w-4 h-4" />}
                    Verify &amp; Activate
                  </button>
                  <button
                    onClick={() => act(r.promo_id, 'reject')}
                    disabled={busyId === r.promo_id}
                    className="flex items-center gap-2 px-4 py-2 rounded-lg border border-red-200 text-red-500 text-sm font-bold hover:bg-red-50 transition-colors disabled:opacity-50"
                  >
                    {busyId === r.promo_id ? <Loader2 className="w-4 h-4 animate-spin" /> : <XCircle className="w-4 h-4" />}
                    Reject
                  </button>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default PromosVerificationHub;