/**
 * VerificationWorkflowHub.tsx
 * Malazone Admin — Two-Phase Verification Dashboard
 * World-class design: rich per-tab context, live stats, inline review, G2B management
 */

import React, { useState, useEffect, useCallback, useRef } from "react";
import {
  Shield, Clock, CheckCircle, XCircle, AlertTriangle, FileText,
  User, MapPin, TrendingUp, Activity, Search, Plus, Trash2, Eye,
  RefreshCw, Upload, Building2, Car, X, ChevronRight, Calendar,
  Phone, Mail, Tag, ArrowRight, BarChart3, Users, Zap, Info,
  AlertCircle, CheckCircle2, Timer, Flag, Send,
} from "lucide-react";
import { useAdminAuth } from "../contexts/AdminAuthContext";

// ─── Types ──────────────────────────────────────────────────────────────────
interface VerifDoc { type: string; description: string; url: string; }

interface Listing {
  id: number;
  title_en: string; title_am: string;
  category: string; subcategory?: string;
  location_label_en: string;
  price: number;
  verification_status: string;
  seller_email?: string; seller_phone?: string;
  admin_notes?: string; officer_notes?: string; rejection_reason?: string;
  assigned_officer?: string; officer_reviewer?: string; admin_reviewer?: string;
  verification_documents?: VerifDoc[];
  hours_pending?: number; hours_in_queue?: number;
  hours_until_deadline?: number; hours_overdue?: number;
  sla_deadline?: string; created_at: string;
  is_escalated?: number;
}
interface Stats {
  total: number; pending_admin: number; assigned_to_officers: number;
  approved: number; rejected: number; escalated: number; overdue: number;
}
interface Officer {
  id: number; username: string; full_name: string; role: string;
  city: string; sub_cities: string | string[]; is_active: number;
}
interface City { id: number; key: string; label_en: string; label_am: string; sub_zones: any[]; }
type TabView = "pending" | "assigned" | "escalated" | "overdue" | "g2b";

// ─── Constants ───────────────────────────────────────────────────────────────
const G = "#00A86B";
const DOC_TYPES = [
  "Carta (Land Registry)", "Ownership Certificate", "Property Tax Receipt",
  "Transfer Document", "ID Copy", "Vehicle Registration",
  "Insurance Document", "Building Permit", "Survey Map", "Other",
];

// ─── Pure helpers ─────────────────────────────────────────────────────────────
const statusMeta = (s: string): { label: string; dot: string; pill: string } => {
  const m: Record<string, { label: string; dot: string; pill: string }> = {
    pending_admin_review:      { label: "Pending Review",    dot: "bg-blue-500",   pill: "bg-blue-50 text-blue-700 ring-1 ring-blue-200" },
    assigned_for_verification: { label: "In Verification",   dot: "bg-yellow-400", pill: "bg-yellow-50 text-yellow-700 ring-1 ring-yellow-200" },
    officer_approved:          { label: "Verified",          dot: "bg-green-500",  pill: "bg-green-50 text-green-700 ring-1 ring-green-200" },
    rejected:                  { label: "Rejected",          dot: "bg-red-500",    pill: "bg-red-50 text-red-700 ring-1 ring-red-200" },
    officer_rejected:          { label: "Officer Rejected",  dot: "bg-red-500",    pill: "bg-red-50 text-red-700 ring-1 ring-red-200" },
    info_requested:            { label: "Info Requested",    dot: "bg-purple-500", pill: "bg-purple-50 text-purple-700 ring-1 ring-purple-200" },
  };
  return m[s] ?? { label: s.replace(/_/g, " "), dot: "bg-slate-400", pill: "bg-slate-100 text-slate-600 ring-1 ring-slate-200" };
};
const fmt = (n: number) => n?.toLocaleString("en-ET") + " ETB";
const ago = (h?: number) => {
  if (h === undefined) return "";
  if (h < 1) return "< 1h ago";
  if (h < 24) return `${h}h ago`;
  return `${Math.floor(h / 24)}d ago`;
};
const slaColor = (h?: number) => {
  if (h === undefined) return "text-slate-400";
  if (h < 0)  return "text-red-600 font-bold";
  if (h < 12) return "text-orange-500 font-bold";
  if (h < 24) return "text-yellow-600";
  return "text-green-600";
};
const slaText = (h?: number) => {
  if (h === undefined) return "";
  if (h < 0) return `${Math.abs(h)}h overdue`;
  return `${h}h left`;
};

// ─── Shared input class ───────────────────────────────────────────────────────
const inp = "w-full px-3 py-2.5 rounded-xl border border-slate-200 bg-white text-sm text-slate-800 placeholder:text-slate-400 focus:outline-none focus:border-[#00A86B] focus:ring-2 focus:ring-[#00A86B]/15 transition-all";

// ═══════════════════════════════════════════════════════════════════════════════
//  MAIN COMPONENT
// ═══════════════════════════════════════════════════════════════════════════════
const VerificationWorkflowHub: React.FC = () => {
  const { user, loading: authLoading } = useAdminAuth();
  const isSuperAdmin = user?.role === "super_admin";
  const isAdmin      = user?.role === "admin" || isSuperAdmin;
  const isOfficer    = user?.role === "g2b_municipality" || user?.role === "g2b_transport";

  const [tab, setTab]         = useState<TabView>("pending");
  const [listings, setListings] = useState<Listing[]>([]);
  const [stats, setStats]       = useState<Stats | null>(null);
  const [officers, setOfficers] = useState<Officer[]>([]);
  const [cities, setCities]     = useState<City[]>([]);
  const [selected, setSelected] = useState<Listing | null>(null);
  const [loading, setLoading]   = useState(false);
  const [search, setSearch]     = useState("");
  const [pulse, setPulse]       = useState(false);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  // track whether we've done the initial bootstrap after auth resolves
  const bootstrapped = useRef(false);

  // ── API ────────────────────────────────────────────────────────────────────
  const loadStats = useCallback(async () => {
    try {
      const r = await fetch("/api/verification/stats", { credentials: "include" });
      const d = await r.json();
      if (d.success) { setStats(d.stats); setPulse(true); setTimeout(() => setPulse(false), 600); }
    } catch {/* silent */}
  }, []);

  const loadOfficers = useCallback(async () => {
    try {
      const r = await fetch("/api/admin/users", { credentials: "include" });
      const d = await r.json();
      if (d.success) setOfficers((d.users as Officer[]).filter(u => u.role === "g2b_municipality" || u.role === "g2b_transport"));
    } catch {/* silent */}
  }, []);

  const loadCities = useCallback(async () => {
    try {
      const r = await fetch("/api/admin/jurisdictions", { credentials: "include" });
      const d = await r.json();
      if (d.success) setCities(d.jurisdictions ?? []);
    } catch {/* silent */}
  }, []);

  const loadListings = useCallback(async (t: TabView) => {
    if (t === "g2b") return;
    setLoading(true);
    try {
      const ep: Record<string, string> = {
        pending:   "/api/verification/pending-admin-review",
        assigned:  "/api/verification/my-queue",
        escalated: "/api/verification/escalated",
        overdue:   "/api/verification/overdue",
      };
      const r = await fetch(ep[t], { credentials: "include" });
      const d = await r.json();
      setListings(d.success ? (d.listings ?? []) : []);
    } catch { setListings([]); }
    finally { setLoading(false); }
  }, []);

  // Bootstrap: run once when auth resolves (user is null on first render)
  useEffect(() => {
    if (!user) return;
    if (bootstrapped.current) return;
    bootstrapped.current = true;
    if (isOfficer) setTab("assigned");
    loadStats();
    loadListings(isOfficer ? "assigned" : "pending");
    loadOfficers();
    loadCities();
  }, [user]); // eslint-disable-line

  // Re-load listings when user switches tabs
  useEffect(() => {
    if (!bootstrapped.current) return;
    loadListings(tab);
  }, [tab]); // eslint-disable-line

  // Auto-refresh stats every 30s
  useEffect(() => {
    intervalRef.current = setInterval(loadStats, 30_000);
    return () => { if (intervalRef.current) clearInterval(intervalRef.current); };
  }, [loadStats]);

  const refresh = async () => {
    await Promise.all([loadStats(), loadListings(tab)]);
  };

  // Show spinner while auth is resolving
  if (authLoading) {
    return (
      <div className="flex items-center justify-center py-32">
        <div className="relative w-12 h-12">
          <div className="absolute inset-0 rounded-full border-4 border-[#00A86B]/20" />
          <div className="absolute inset-0 rounded-full border-4 border-t-[#00A86B] animate-spin" />
        </div>
      </div>
    );
  }

  const filtered = listings.filter(l =>
    !search ||
    l.title_en?.toLowerCase().includes(search.toLowerCase()) ||
    l.id.toString().includes(search) ||
    l.location_label_en?.toLowerCase().includes(search.toLowerCase())
  );

  // ── Tab descriptors ────────────────────────────────────────────────────────
  const TABS: { key: TabView; label: string; icon: React.ReactNode; badge?: number; show: boolean; desc: string; color: string }[] = [
    { key: "pending",   label: "Pending Review",  icon: <Clock className="w-4 h-4" />,         badge: stats?.pending_admin,        show: isAdmin,             desc: "New listings awaiting Phase 1 admin review", color: "blue" },
    { key: "assigned",  label: "In Verification", icon: <Timer className="w-4 h-4" />,          badge: stats?.assigned_to_officers, show: isAdmin || isOfficer, desc: "Listings assigned to G2B officers for verification", color: "yellow" },
    { key: "escalated", label: "Escalated",       icon: <AlertTriangle className="w-4 h-4" />,  badge: stats?.escalated,            show: isAdmin,             desc: "Officer-rejected cases requiring super admin resolution", color: "red" },
    { key: "overdue",   label: "Overdue",         icon: <Flag className="w-4 h-4" />,            badge: stats?.overdue,              show: isAdmin,             desc: "Listings that have missed their 48-hour SLA deadline", color: "orange" },
    { key: "g2b",       label: "G2B Verification",icon: <Shield className="w-4 h-4" />,         badge: officers.filter(o => o.is_active).length, show: isAdmin, desc: "Add verification documents & instructions for G2B officers — officers are managed in User Management", color: "green" },
  ];
  const visibleTabs = TABS.filter(t => t.show);
  const activeTab = TABS.find(t => t.key === tab)!;

  // ── Stat cards ─────────────────────────────────────────────────────────────
  const STAT_CARDS = [
    { label: "Total",     val: stats?.total,                icon: <BarChart3 className="w-4 h-4" />,     bg: "from-slate-50 to-white",   border: "border-slate-200",  text: "text-slate-800",   sub: "text-slate-500" },
    { label: "Pending",   val: stats?.pending_admin,        icon: <Clock className="w-4 h-4" />,         bg: "from-blue-50 to-white",    border: "border-blue-200",   text: "text-blue-800",    sub: "text-blue-500" },
    { label: "Assigned",  val: stats?.assigned_to_officers, icon: <Users className="w-4 h-4" />,         bg: "from-yellow-50 to-white",  border: "border-yellow-200", text: "text-yellow-800",  sub: "text-yellow-600" },
    { label: "Approved",  val: stats?.approved,             icon: <CheckCircle className="w-4 h-4" />,   bg: "from-green-50 to-white",   border: "border-green-200",  text: "text-green-800",   sub: "text-green-600" },
    { label: "Rejected",  val: stats?.rejected,             icon: <XCircle className="w-4 h-4" />,       bg: "from-red-50 to-white",     border: "border-red-200",    text: "text-red-800",     sub: "text-red-500" },
    { label: "Escalated", val: stats?.escalated,            icon: <AlertTriangle className="w-4 h-4" />, bg: "from-purple-50 to-white",  border: "border-purple-200", text: "text-purple-800",  sub: "text-purple-500" },
    { label: "Overdue",   val: stats?.overdue,              icon: <Zap className="w-4 h-4" />,           bg: "from-orange-50 to-white",  border: "border-orange-200", text: "text-orange-800",  sub: "text-orange-500" },
  ];

  return (
    <div className="space-y-5 pb-10 min-w-0">

      {/* ═══ HEADER ═══════════════════════════════════════════════════════ */}
      <div className="bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden">
        {/* top accent bar */}
        <div className="h-1 bg-gradient-to-r from-[#00A86B] via-emerald-400 to-[#00A86B]" />

        <div className="p-5 sm:p-6">
          {/* title row */}
          <div className="flex items-start justify-between gap-4 mb-6">
            <div className="flex items-center gap-3 min-w-0">
              <div className="p-2.5 rounded-xl bg-[#00A86B]/10 flex-shrink-0">
                <Shield className="w-6 h-6 text-[#00A86B]" />
              </div>
              <div className="min-w-0">
                <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
                  Verification Workflow
                </h1>
                <p className="text-xs text-slate-500 mt-0.5">
                  Two-phase listing verification — Admin&nbsp;→&nbsp;G2B Officer
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2 flex-shrink-0">
              <button
                onClick={refresh}
                title="Refresh"
                className="p-2 rounded-xl border border-slate-200 text-slate-500 hover:border-[#00A86B] hover:text-[#00A86B] transition-all"
              >
                <RefreshCw className="w-4 h-4" />
              </button>
              {tab !== "g2b" && (
                <div className="relative hidden sm:block">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400" />
                  <input
                    value={search}
                    onChange={e => setSearch(e.target.value)}
                    placeholder="Search listings…"
                    className="pl-8 pr-3 py-2 rounded-xl border border-slate-200 text-sm focus:outline-none focus:border-[#00A86B] focus:ring-2 focus:ring-[#00A86B]/15 w-48 transition-all"
                  />
                </div>
              )}
            </div>
          </div>

          {/* stats grid */}
          <div className="grid grid-cols-4 sm:grid-cols-7 gap-2">
            {STAT_CARDS.map(s => (
              <div
                key={s.label}
                className={`bg-gradient-to-b ${s.bg} border ${s.border} rounded-xl p-3 transition-all ${pulse ? "scale-[1.01]" : ""}`}
              >
                <div className={`flex items-center gap-1.5 mb-1.5 ${s.sub}`}>
                  {s.icon}
                  <span className="text-[10px] font-black uppercase tracking-wide">{s.label}</span>
                </div>
                <p className={`text-2xl font-black ${s.text} tabular-nums`}>
                  {stats === null ? <span className="text-slate-300 animate-pulse">—</span> : (s.val ?? 0)}
                </p>
              </div>
            ))}
          </div>

          {/* pipeline progress bar */}
          {stats && stats.total > 0 && (
            <div className="mt-4">
              <div className="flex items-center justify-between mb-1.5">
                <span className="text-xs font-bold text-slate-500">Pipeline Progress</span>
                <span className="text-xs font-bold text-[#00A86B]">
                  {Math.round((stats.approved / stats.total) * 100)}% verified
                </span>
              </div>
              <div className="h-2 bg-slate-100 rounded-full overflow-hidden flex">
                {[
                  { w: stats.approved,              color: "bg-green-500" },
                  { w: stats.assigned_to_officers,  color: "bg-yellow-400" },
                  { w: stats.pending_admin,         color: "bg-blue-400" },
                  { w: stats.rejected,              color: "bg-red-400" },
                ].map((seg, i) => (
                  <div
                    key={i}
                    className={`${seg.color} transition-all duration-500`}
                    style={{ width: `${(seg.w / stats.total) * 100}%` }}
                  />
                ))}
              </div>
              <div className="flex items-center gap-4 mt-1.5 flex-wrap">
                {[
                  { label: "Verified",    color: "bg-green-500" },
                  { label: "In Review",   color: "bg-yellow-400" },
                  { label: "Pending",     color: "bg-blue-400" },
                  { label: "Rejected",    color: "bg-red-400" },
                ].map(l => (
                  <span key={l.label} className="flex items-center gap-1 text-[10px] text-slate-500 font-bold">
                    <span className={`w-2 h-2 rounded-full ${l.color}`} />
                    {l.label}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* ═══ TABS + CONTENT ═══════════════════════════════════════════════ */}
      <div className="bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden">

        {/* tab bar */}
        <div className="flex border-b border-slate-200 overflow-x-auto scrollbar-hide">
          {visibleTabs.map(t => {
            const active = tab === t.key;
            const hasBadge = !!t.badge && t.badge > 0;
            const urgent = (t.key === "escalated" || t.key === "overdue") && hasBadge;
            return (
              <button
                key={t.key}
                onClick={() => setTab(t.key)}
                className={`relative flex items-center gap-2 px-4 py-3.5 text-sm font-bold whitespace-nowrap border-b-2 transition-all duration-150 ${
                  active
                    ? "border-[#00A86B] text-[#00A86B] bg-[#00A86B]/5"
                    : "border-transparent text-slate-500 hover:text-slate-800 hover:bg-slate-50"
                }`}
              >
                <span className={active ? "text-[#00A86B]" : ""}>{t.icon}</span>
                {t.label}
                {hasBadge && (
                  <span className={`px-2 py-0.5 rounded-full text-xs font-black ${
                    active
                      ? "bg-[#00A86B] text-white"
                      : urgent
                        ? "bg-red-500 text-white animate-pulse"
                        : "bg-slate-200 text-slate-600"
                  }`}>
                    {t.badge}
                  </span>
                )}
              </button>
            );
          })}
        </div>

        {/* tab context banner */}
        {activeTab && (
          <div className="px-5 py-2.5 bg-slate-50 border-b border-slate-100 flex items-center gap-2">
            <Info className="w-3.5 h-3.5 text-slate-400 flex-shrink-0" />
            <p className="text-xs text-slate-500">{activeTab.desc}</p>
            {tab !== "g2b" && !loading && (
              <span className="ml-auto text-xs font-bold text-slate-400">
                {filtered.length} {filtered.length === 1 ? "listing" : "listings"}
              </span>
            )}
          </div>
        )}

        {/* ── content area ─────────────────────────────────────────────── */}
        <div className="p-5">
          {tab === "g2b" ? (
            <G2BManagementTab officers={officers} cities={cities} onCreated={() => { loadOfficers(); loadStats(); }} />
          ) : loading ? (
            <div className="flex flex-col items-center justify-center py-20 gap-3">
              <div className="relative w-12 h-12">
                <div className="absolute inset-0 rounded-full border-4 border-[#00A86B]/20" />
                <div className="absolute inset-0 rounded-full border-4 border-t-[#00A86B] animate-spin" />
              </div>
              <p className="text-sm text-slate-400 font-medium">Loading listings…</p>
            </div>
          ) : filtered.length === 0 ? (
            <EmptyState tab={tab} search={search} onClear={() => setSearch("")} />
          ) : (
            <div className="space-y-2.5">
              {filtered.map(l => (
                <ListingRow key={l.id} listing={l} tab={tab} onOpen={() => setSelected(l)} />
              ))}
            </div>
          )}
        </div>
      </div>

      {/* ═══ REVIEW DRAWER ════════════════════════════════════════════════ */}
      {selected && (
        <ReviewDrawer
          listing={selected}
          officers={officers}
          isAdmin={isAdmin}
          isOfficer={isOfficer}
          onClose={() => setSelected(null)}
          onDone={() => { setSelected(null); loadListings(tab); loadStats(); }}
        />
      )}
    </div>
  );
};

// ═══════════════════════════════════════════════════════════════════════════════
//  EMPTY STATE
// ═══════════════════════════════════════════════════════════════════════════════
const EmptyState: React.FC<{ tab: TabView; search: string; onClear: () => void }> = ({ tab, search, onClear }) => {
  const msgs: Record<TabView, { icon: React.ReactNode; title: string; sub: string; color: string }> = {
    pending:   { icon: <CheckCircle2 className="w-12 h-12" />, title: "All reviews complete",  sub: "No listings waiting for admin review.", color: "text-green-400" },
    assigned:  { icon: <CheckCircle2 className="w-12 h-12" />, title: "Queue is clear",        sub: "No listings currently in verification.", color: "text-green-400" },
    escalated: { icon: <Shield className="w-12 h-12" />,       title: "No escalated cases",    sub: "All officer decisions have been resolved.", color: "text-purple-300" },
    overdue:   { icon: <Timer className="w-12 h-12" />,        title: "No overdue listings",   sub: "All verifications are within SLA.", color: "text-green-400" },
    g2b:       { icon: <Users className="w-12 h-12" />,        title: "No officers",           sub: "Add G2B officers to get started.", color: "text-slate-300" },
  };
  const m = msgs[tab];
  return (
    <div className="flex flex-col items-center justify-center py-20 gap-3 text-center">
      <span className={m.color}>{m.icon}</span>
      <p className="text-base font-bold text-slate-500">{search ? "No matching listings" : m.title}</p>
      <p className="text-sm text-slate-400">{search ? `No results for "${search}"` : m.sub}</p>
      {search && (
        <button onClick={onClear} className="mt-1 text-xs font-bold text-[#00A86B] hover:underline">Clear search</button>
      )}
    </div>
  );
};

// ═══════════════════════════════════════════════════════════════════════════════
//  LISTING ROW
// ═══════════════════════════════════════════════════════════════════════════════
const ListingRow: React.FC<{ listing: Listing; tab: TabView; onOpen: () => void }> = ({ listing, tab, onOpen }) => {
  const sm = statusMeta(listing.verification_status);
  const isOverdue = (listing.hours_until_deadline ?? 1) < 0;
  const isUrgent  = !isOverdue && (listing.hours_until_deadline ?? 999) < 12;
  const hasEsc    = !!listing.is_escalated;

  return (
    <button
      onClick={onOpen}
      className="w-full text-left group"
    >
      <div className={`flex items-stretch gap-0 rounded-xl border transition-all duration-150 overflow-hidden
        ${isOverdue ? "border-red-200 hover:border-red-400" : hasEsc ? "border-red-200 hover:border-red-400" : "border-slate-200 hover:border-[#00A86B]"}
        hover:shadow-sm`}
      >
        {/* left accent stripe */}
        <div className={`w-1 flex-shrink-0 ${
          isOverdue || hasEsc ? "bg-red-400" : isUrgent ? "bg-orange-400" :
          listing.verification_status === "pending_admin_review" ? "bg-blue-400" :
          listing.verification_status === "assigned_for_verification" ? "bg-yellow-400" :
          "bg-slate-200"
        }`} />

        <div className="flex-1 px-4 py-3 min-w-0">
          <div className="flex items-start justify-between gap-3">
            {/* left */}
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 flex-wrap mb-1">
                <span className="text-[11px] font-bold text-slate-400">#{listing.id}</span>
                <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-bold ${sm.pill}`}>
                  <span className={`w-1.5 h-1.5 rounded-full ${sm.dot}`} />
                  {sm.label}
                </span>
                {hasEsc && (
                  <span className="px-2 py-0.5 rounded-full text-[11px] font-black bg-red-500 text-white animate-pulse">
                    ESCALATED
                  </span>
                )}
                {isOverdue && !hasEsc && (
                  <span className="px-2 py-0.5 rounded-full text-[11px] font-black bg-orange-500 text-white">
                    SLA BREACH
                  </span>
                )}
                <span className="px-2 py-0.5 rounded-full text-[11px] font-bold bg-slate-100 text-slate-500 capitalize">
                  {listing.category}
                </span>
              </div>

              <p className="font-bold text-slate-800 text-[15px] truncate group-hover:text-[#00A86B] transition-colors">
                {listing.title_en}
              </p>
              {listing.title_am && (
                <p className="text-xs text-slate-400 truncate mt-0.5">{listing.title_am}</p>
              )}

              <div className="flex items-center gap-3 mt-2 flex-wrap text-xs text-slate-500">
                <span className="flex items-center gap-1">
                  <MapPin className="w-3 h-3 flex-shrink-0" />
                  {listing.location_label_en}
                </span>
                {listing.seller_phone && (
                  <span className="flex items-center gap-1">
                    <Phone className="w-3 h-3 flex-shrink-0" /> {listing.seller_phone}
                  </span>
                )}
                {listing.hours_pending !== undefined && (
                  <span className="flex items-center gap-1">
                    <Clock className="w-3 h-3 flex-shrink-0" /> {ago(listing.hours_pending)}
                  </span>
                )}
                {listing.hours_until_deadline !== undefined && (
                  <span className={`flex items-center gap-1 ${slaColor(listing.hours_until_deadline)}`}>
                    <Timer className="w-3 h-3 flex-shrink-0" /> {slaText(listing.hours_until_deadline)}
                  </span>
                )}
                {listing.assigned_officer && (
                  <span className="flex items-center gap-1">
                    <User className="w-3 h-3 flex-shrink-0" /> {listing.assigned_officer}
                  </span>
                )}
                {(listing.verification_documents?.length ?? 0) > 0 && (
                  <span className="flex items-center gap-1 text-[#00A86B] font-semibold">
                    <FileText className="w-3 h-3 flex-shrink-0" />
                    {listing.verification_documents!.length} doc{listing.verification_documents!.length !== 1 ? "s" : ""}
                  </span>
                )}
                {tab === "escalated" && listing.officer_reviewer && (
                  <span className="flex items-center gap-1 text-red-500">
                    <Flag className="w-3 h-3 flex-shrink-0" /> Rejected by {listing.officer_reviewer}
                  </span>
                )}
              </div>
            </div>

            {/* right */}
            <div className="text-right flex-shrink-0 flex flex-col items-end gap-1">
              <p className="text-base font-black text-[#00A86B]">{fmt(listing.price)}</p>
              <p className="text-[11px] text-slate-400">{new Date(listing.created_at).toLocaleDateString()}</p>
              <span className="mt-1 flex items-center gap-1 text-xs font-bold text-slate-300 group-hover:text-[#00A86B] transition-colors">
                Review <ChevronRight className="w-3 h-3" />
              </span>
            </div>
          </div>

          {/* rejection reason snippet */}
          {listing.rejection_reason && (
            <div className="mt-2 px-2.5 py-1.5 rounded-lg bg-red-50 border border-red-100 text-xs text-red-600 truncate">
              <span className="font-bold">Reason: </span>{listing.rejection_reason}
            </div>
          )}
        </div>
      </div>
    </button>
  );
};

// ═══════════════════════════════════════════════════════════════════════════════
//  REVIEW DRAWER (full-featured slide-up modal)
// ═══════════════════════════════════════════════════════════════════════════════
type DrawerSection = "info" | "documents" | "review";

const ReviewDrawer: React.FC<{
  listing: Listing; officers: Officer[];
  isAdmin: boolean; isOfficer: boolean;
  onClose: () => void; onDone: () => void;
}> = ({ listing, officers, isAdmin, isOfficer, onClose, onDone }) => {
  const sm = statusMeta(listing.verification_status);

  const [sec, setSec]     = useState<DrawerSection>("info");
  const [docs, setDocs]   = useState<VerifDoc[]>(listing.verification_documents ?? []);
  const [newDoc, setNewDoc] = useState<VerifDoc>({ type: "", description: "", url: "" });
  const [officerId, setOfficerId]     = useState("");
  const [adminNotes, setAdminNotes]   = useState(listing.admin_notes ?? "");
  const [officerNotes, setOfficerNotes] = useState("");
  const [rejectReason, setRejectReason] = useState("");
  const [submitting, setSubmitting]   = useState(false);
  const [showRejectBox, setShowRejectBox] = useState(false);

  const canAdminReview   = isAdmin   && listing.verification_status === "pending_admin_review";
  const canOfficerReview = isOfficer && listing.verification_status === "assigned_for_verification";

  const muniOfficers  = officers.filter(o => o.role === "g2b_municipality" && o.is_active);
  const transOfficers = officers.filter(o => o.role === "g2b_transport"    && o.is_active);

  const addDoc = () => {
    if (!newDoc.type || !newDoc.description || !newDoc.url) { alert("Fill in all document fields"); return; }
    setDocs(d => [...d, { ...newDoc }]);
    setNewDoc({ type: "", description: "", url: "" });
  };

  const apiUploadDocs = async () => {
    if (!docs.length) return true;
    const r = await fetch(`/api/verification/upload-documents/${listing.id}`, {
      method: "POST", credentials: "include",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ documents: docs }),
    });
    return (await r.json()).success;
  };

  const doAdminApprove = async () => {
    if (!officerId) { alert("Select an officer first"); return; }
    if (!docs.length && !confirm("No documents added. Continue anyway?")) return;
    setSubmitting(true);
    try {
      await apiUploadDocs();
      const r = await fetch(`/api/verification/admin-review/${listing.id}`, {
        method: "POST", credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "approve", assigned_officer_id: +officerId, admin_notes: adminNotes }),
      });
      const d = await r.json();
      if (d.success) { onDone(); } else alert(d.message ?? "Failed");
    } finally { setSubmitting(false); }
  };

  const doAdminReject = async () => {
    if (!rejectReason.trim()) { alert("Enter a rejection reason"); return; }
    setSubmitting(true);
    try {
      const r = await fetch(`/api/verification/admin-review/${listing.id}`, {
        method: "POST", credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "reject", rejection_reason: rejectReason, admin_notes: adminNotes }),
      });
      const d = await r.json();
      if (d.success) { onDone(); } else alert(d.message ?? "Failed");
    } finally { setSubmitting(false); }
  };

  const doOfficerApprove = async () => {
    if (!officerNotes.trim()) { alert("Add your verification notes first"); return; }
    setSubmitting(true);
    try {
      const r = await fetch(`/api/verification/officer-review/${listing.id}`, {
        method: "POST", credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "approve", officer_notes: officerNotes }),
      });
      const d = await r.json();
      if (d.success) { onDone(); } else alert(d.message ?? "Failed");
    } finally { setSubmitting(false); }
  };

  const doOfficerReject = async () => {
    if (!officerNotes.trim()) { alert("Add rejection notes"); return; }
    setSubmitting(true);
    try {
      const r = await fetch(`/api/verification/officer-review/${listing.id}`, {
        method: "POST", credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "reject", officer_notes: officerNotes, rejection_reason: officerNotes }),
      });
      const d = await r.json();
      if (d.success) { onDone(); } else alert(d.message ?? "Failed");
    } finally { setSubmitting(false); }
  };

  const SecTab = ({ s, label, count }: { s: DrawerSection; label: string; count?: number }) => (
    <button
      onClick={() => setSec(s)}
      className={`px-3.5 py-2 rounded-xl text-sm font-bold transition-all ${
        sec === s
          ? "bg-[#00A86B] text-white shadow-sm"
          : "bg-slate-100 text-slate-600 hover:bg-slate-200"
      }`}
    >
      {label}
      {count !== undefined && count > 0 && (
        <span className={`ml-1.5 text-xs px-1.5 py-0.5 rounded-full font-black ${
          sec === s ? "bg-white/30 text-white" : "bg-white text-slate-600"
        }`}>{count}</span>
      )}
    </button>
  );

  return (
    <div
      className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-slate-900/50 backdrop-blur-sm p-0 sm:p-4"
      onClick={e => e.target === e.currentTarget && onClose()}
    >
      <div className="bg-white rounded-t-2xl sm:rounded-2xl shadow-2xl w-full max-w-2xl max-h-[95vh] flex flex-col">

        {/* drag handle (mobile) */}
        <div className="flex justify-center pt-3 pb-1 sm:hidden">
          <div className="w-10 h-1 bg-slate-200 rounded-full" />
        </div>

        {/* header */}
        <div className="flex items-start justify-between px-5 pt-4 pb-4 border-b border-slate-100 flex-shrink-0">
          <div className="flex-1 min-w-0 pr-3">
            <div className="flex items-center gap-2 flex-wrap mb-1.5">
              <span className="text-xs font-bold text-slate-400">#{listing.id}</span>
              <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-bold ${sm.pill}`}>
                <span className={`w-1.5 h-1.5 rounded-full ${sm.dot}`} />
                {sm.label}
              </span>
              <span className="px-2 py-0.5 rounded-full text-xs font-bold bg-slate-100 text-slate-500 capitalize">
                {listing.category}
              </span>
              {listing.is_escalated ? <span className="px-2 py-0.5 rounded-full text-xs font-black bg-red-500 text-white">ESCALATED</span> : null}
            </div>
            <h2 className="text-lg font-black text-slate-900 leading-tight">{listing.title_en}</h2>
            {listing.title_am && <p className="text-xs text-slate-400 mt-0.5">{listing.title_am}</p>}
          </div>
          <button onClick={onClose} className="p-2 rounded-xl hover:bg-slate-100 text-slate-400 hover:text-slate-600 flex-shrink-0">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* section tabs */}
        <div className="flex gap-2 px-5 py-3 border-b border-slate-100 bg-slate-50/80 flex-shrink-0">
          <SecTab s="info"      label="📋 Details" />
          <SecTab s="documents" label="📁 Documents" count={docs.length} />
          <SecTab s="review"    label={canOfficerReview ? "✅ Verify" : "⚖️ Review"} />
        </div>

        {/* scrollable body */}
        <div className="overflow-y-auto flex-1 p-5 space-y-4">

          {/* ── INFO ───────────────────────────────────────────────────── */}
          {sec === "info" && (
            <>
              <div className="grid grid-cols-2 gap-3">
                {[
                  { icon: <Tag className="w-4 h-4" />,       label: "Price",    val: fmt(listing.price) },
                  { icon: <MapPin className="w-4 h-4" />,     label: "Location", val: listing.location_label_en },
                  { icon: <Activity className="w-4 h-4" />,   label: "Category", val: listing.category },
                  { icon: <Phone className="w-4 h-4" />,      label: "Phone",    val: listing.seller_phone ?? "—" },
                  { icon: <Mail className="w-4 h-4" />,       label: "Email",    val: listing.seller_email ?? "—" },
                  { icon: <Calendar className="w-4 h-4" />,   label: "Submitted", val: new Date(listing.created_at).toLocaleString() },
                ].map(f => (
                  <div key={f.label} className="p-3 bg-slate-50 rounded-xl border border-slate-100">
                    <div className="flex items-center gap-1.5 mb-1 text-slate-400">{f.icon}<span className="text-[10px] font-black uppercase">{f.label}</span></div>
                    <p className="font-bold text-slate-800 text-sm truncate">{f.val}</p>
                  </div>
                ))}
              </div>

              {/* workflow timeline */}
              <div className="p-4 rounded-xl border border-slate-200 bg-slate-50">
                <p className="text-xs font-black text-slate-500 uppercase mb-3">Workflow Timeline</p>
                <div className="space-y-3">
                  {[
                    { done: true,  label: "Listing submitted",        sub: new Date(listing.created_at).toLocaleString(), color: "bg-green-500" },
                    { done: listing.verification_status !== "pending_admin_review", label: "Admin reviewed", sub: listing.admin_reviewer ? `by ${listing.admin_reviewer}` : "Pending", color: listing.verification_status !== "pending_admin_review" ? "bg-green-500" : "bg-slate-300" },
                    { done: listing.verification_status === "officer_approved", label: "Officer verified", sub: listing.officer_reviewer ?? (listing.assigned_officer ? `Assigned to ${listing.assigned_officer}` : "Not assigned"), color: listing.verification_status === "officer_approved" ? "bg-green-500" : "bg-slate-300" },
                    { done: listing.verification_status === "officer_approved", label: "Published on Malazone", sub: listing.verification_status === "officer_approved" ? "Live" : "Pending verification", color: listing.verification_status === "officer_approved" ? "bg-green-500" : "bg-slate-300" },
                  ].map((step, i) => (
                    <div key={i} className="flex items-start gap-3">
                      <div className={`w-3 h-3 rounded-full mt-0.5 flex-shrink-0 ${step.color}`} />
                      <div>
                        <p className="text-sm font-bold text-slate-700">{step.label}</p>
                        <p className="text-xs text-slate-400">{step.sub}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* notes blocks */}
              {listing.admin_notes && (
                <div className="p-3 rounded-xl bg-blue-50 border border-blue-200">
                  <p className="text-[10px] font-black text-blue-600 uppercase mb-1">Admin Notes</p>
                  <p className="text-sm text-slate-700">{listing.admin_notes}</p>
                </div>
              )}
              {listing.officer_notes && (
                <div className="p-3 rounded-xl bg-green-50 border border-green-200">
                  <p className="text-[10px] font-black text-green-600 uppercase mb-1">Officer Notes</p>
                  <p className="text-sm text-slate-700">{listing.officer_notes}</p>
                </div>
              )}
              {listing.rejection_reason && (
                <div className="p-3 rounded-xl bg-red-50 border border-red-200">
                  <p className="text-[10px] font-black text-red-600 uppercase mb-1">Rejection Reason</p>
                  <p className="text-sm text-slate-700">{listing.rejection_reason}</p>
                </div>
              )}
            </>
          )}

          {/* ── DOCUMENTS ──────────────────────────────────────────────── */}
          {sec === "documents" && (
            <>
              {/* existing docs list */}
              {docs.length > 0 && (
                <div className="space-y-2">
                  <p className="text-xs font-black text-slate-500 uppercase">Documents ({docs.length})</p>
                  {docs.map((doc, i) => (
                    <div key={i} className="flex items-start gap-3 p-3 rounded-xl border border-slate-200 bg-white hover:border-[#00A86B]/40 transition-all">
                      <div className="p-2 bg-[#00A86B]/10 rounded-lg flex-shrink-0">
                        <FileText className="w-4 h-4 text-[#00A86B]" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-bold text-sm text-slate-800">{doc.type}</p>
                        <p className="text-xs text-slate-500 mt-0.5 line-clamp-2">{doc.description}</p>
                        <a href={doc.url} target="_blank" rel="noopener noreferrer"
                          className="mt-1.5 inline-flex items-center gap-1 text-xs font-bold text-[#00A86B] hover:underline">
                          <Eye className="w-3 h-3" /> View document
                        </a>
                      </div>
                      {canAdminReview && (
                        <button onClick={() => setDocs(d => d.filter((_, j) => j !== i))}
                          className="p-1.5 rounded-lg text-slate-300 hover:text-red-500 hover:bg-red-50 transition-all flex-shrink-0">
                          <Trash2 className="w-4 h-4" />
                        </button>
                      )}
                    </div>
                  ))}
                </div>
              )}

              {docs.length === 0 && !canAdminReview && (
                <div className="text-center py-10 text-slate-400">
                  <FileText className="w-10 h-10 mx-auto mb-2 opacity-30" />
                  <p className="text-sm font-medium">No documents uploaded</p>
                </div>
              )}

              {/* add document form */}
              {canAdminReview && (
                <div className="p-4 rounded-xl border-2 border-dashed border-[#00A86B]/30 bg-[#00A86B]/5 space-y-3">
                  <div className="flex items-center gap-2">
                    <Upload className="w-4 h-4 text-[#00A86B]" />
                    <p className="text-sm font-black text-slate-700">Add Verification Document</p>
                  </div>

                  <div>
                    <label className="text-[11px] font-black text-slate-600 uppercase mb-1 block">Document Type *</label>
                    <select value={newDoc.type} onChange={e => setNewDoc(d => ({ ...d, type: e.target.value }))} className={inp}>
                      <option value="">Select type…</option>
                      {DOC_TYPES.map(t => <option key={t} value={t}>{t}</option>)}
                    </select>
                  </div>

                  <div>
                    <label className="text-[11px] font-black text-slate-600 uppercase mb-1 block">
                      Description for G2B Officer *
                      <span className="normal-case font-normal text-slate-400 ml-1">(what to verify)</span>
                    </label>
                    <textarea
                      value={newDoc.description}
                      onChange={e => setNewDoc(d => ({ ...d, description: e.target.value }))}
                      rows={2} className={`${inp} resize-none`}
                      placeholder="e.g. Verify plot #1234-A in Tabor land registry. Owner name must match ID."
                    />
                  </div>

                  <div>
                    <label className="text-[11px] font-black text-slate-600 uppercase mb-1 block">File URL / Path *</label>
                    <input
                      type="text" value={newDoc.url}
                      onChange={e => setNewDoc(d => ({ ...d, url: e.target.value }))}
                      className={inp} placeholder="/uploads/listings/123/carta.pdf  or  https://…"
                    />
                  </div>

                  <button onClick={addDoc}
                    className="w-full py-2.5 rounded-xl font-bold bg-[#00A86B] text-white hover:bg-[#009960] transition-all flex items-center justify-center gap-2 text-sm">
                    <Plus className="w-4 h-4" /> Add Document
                  </button>
                </div>
              )}

              {/* standards reference */}
              <div className="p-4 rounded-xl bg-slate-50 border border-slate-200">
                <p className="text-[10px] font-black text-slate-500 uppercase mb-3">Standard Requirements Reference</p>
                <div className="grid grid-cols-2 gap-4">
                  {[
                    { icon: <Building2 className="w-3.5 h-3.5" />, label: "Municipality", color: "text-blue-600", docs: ["Carta (Land Registry)", "Property Tax Receipt", "Ownership Certificate", "ID Copy"] },
                    { icon: <Car className="w-3.5 h-3.5" />,       label: "Transport",    color: "text-purple-600", docs: ["Vehicle Registration", "Insurance Document", "Transfer Document", "ID Copy"] },
                  ].map(col => (
                    <div key={col.label}>
                      <p className={`text-xs font-bold flex items-center gap-1 mb-2 ${col.color}`}>
                        {col.icon} {col.label}
                      </p>
                      {col.docs.map(d => (
                        <p key={d} className="flex items-center gap-1.5 text-xs text-slate-500 mb-1.5">
                          <CheckCircle className="w-3 h-3 text-green-400 flex-shrink-0" /> {d}
                        </p>
                      ))}
                    </div>
                  ))}
                </div>
              </div>
            </>
          )}

          {/* ── REVIEW ─────────────────────────────────────────────────── */}
          {sec === "review" && (
            <>
              {/* ── Admin Phase 1 ── */}
              {canAdminReview && (
                <div className="space-y-4">
                  <div className="flex items-start gap-3 p-3.5 rounded-xl bg-blue-50 border border-blue-200">
                    <Info className="w-4 h-4 text-blue-600 flex-shrink-0 mt-0.5" />
                    <div>
                      <p className="text-xs font-black text-blue-700 uppercase mb-0.5">Phase 1 — Admin Review</p>
                      <p className="text-xs text-slate-600">
                        Upload documents in the Documents tab, then assign to a G2B officer. The officer will receive your documents and notes.
                      </p>
                    </div>
                  </div>

                  {/* officer select */}
                  <div>
                    <label className="text-xs font-black text-slate-600 uppercase mb-2 block">
                      Assign to G2B Officer *
                    </label>
                    <select value={officerId} onChange={e => setOfficerId(e.target.value)} className={inp}>
                      <option value="">— Select Officer —</option>
                      <optgroup label="🏛 Municipality Officers">
                        {muniOfficers.map(o => (
                          <option key={o.id} value={o.id}>{o.full_name} — {o.city ?? "Any"}</option>
                        ))}
                        {muniOfficers.length === 0 && <option disabled>No active municipality officers</option>}
                      </optgroup>
                      <optgroup label="🚗 Transport Officers">
                        {transOfficers.map(o => (
                          <option key={o.id} value={o.id}>{o.full_name} — {o.city ?? "Any"}</option>
                        ))}
                        {transOfficers.length === 0 && <option disabled>No active transport officers</option>}
                      </optgroup>
                    </select>
                    <p className="text-[11px] text-slate-400 mt-1">
                      {docs.length} document{docs.length !== 1 ? "s" : ""} will be sent to the officer · 48h SLA will begin
                    </p>
                  </div>

                  {/* notes */}
                  <div>
                    <label className="text-xs font-black text-slate-600 uppercase mb-2 block">
                      Notes for Officer <span className="normal-case font-normal text-slate-400">(optional)</span>
                    </label>
                    <textarea
                      value={adminNotes} onChange={e => setAdminNotes(e.target.value)}
                      rows={3} className={`${inp} resize-none`}
                      placeholder="Priority instructions, special checks, context the officer needs…"
                    />
                  </div>

                  {/* approve */}
                  <button
                    onClick={doAdminApprove} disabled={submitting}
                    className="w-full py-3 rounded-xl font-black bg-[#00A86B] text-white hover:bg-[#009960] disabled:opacity-50 transition-all flex items-center justify-center gap-2"
                  >
                    {submitting ? (
                      <><div className="w-4 h-4 rounded-full border-2 border-white/30 border-t-white animate-spin" /> Assigning…</>
                    ) : (
                      <><Send className="w-4 h-4" /> Approve &amp; Assign ({docs.length} doc{docs.length !== 1 ? "s" : ""})</>
                    )}
                  </button>

                  {/* reject toggle */}
                  <div>
                    <button
                      onClick={() => setShowRejectBox(b => !b)}
                      className="w-full py-2.5 rounded-xl font-bold text-red-500 border border-red-200 bg-red-50 hover:bg-red-100 transition-all text-sm flex items-center justify-center gap-2"
                    >
                      <XCircle className="w-4 h-4" />
                      {showRejectBox ? "Cancel Rejection" : "Reject this Listing"}
                    </button>
                    {showRejectBox && (
                      <div className="mt-3 space-y-3">
                        <textarea
                          value={rejectReason} onChange={e => setRejectReason(e.target.value)}
                          rows={3} className={`${inp} border-red-200 focus:border-red-400 focus:ring-red-100 resize-none`}
                          placeholder="Reason for rejection (shown to the listing owner)…"
                        />
                        <button
                          onClick={doAdminReject} disabled={submitting}
                          className="w-full py-2.5 rounded-xl font-black bg-red-500 text-white hover:bg-red-600 disabled:opacity-50 transition-all text-sm"
                        >
                          {submitting ? "Rejecting…" : "Confirm Rejection"}
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* ── Officer Phase 2 ── */}
              {canOfficerReview && (
                <div className="space-y-4">
                  <div className="flex items-start gap-3 p-3.5 rounded-xl bg-yellow-50 border border-yellow-200">
                    <AlertCircle className="w-4 h-4 text-yellow-600 flex-shrink-0 mt-0.5" />
                    <div>
                      <p className="text-xs font-black text-yellow-700 uppercase mb-0.5">Phase 2 — Officer Verification</p>
                      <p className="text-xs text-slate-600">
                        Review documents in the Documents tab, verify against government records, then approve or reject.
                      </p>
                    </div>
                  </div>

                  {listing.admin_notes && (
                    <div className="p-3 rounded-xl bg-blue-50 border border-blue-200">
                      <p className="text-[10px] font-black text-blue-600 uppercase mb-1">Admin Instructions</p>
                      <p className="text-sm text-slate-700">{listing.admin_notes}</p>
                    </div>
                  )}

                  {/* quick doc reference */}
                  {docs.length > 0 && (
                    <div className="p-3 rounded-xl bg-slate-50 border border-slate-200">
                      <p className="text-[10px] font-black text-slate-500 uppercase mb-2">Documents to Verify ({docs.length})</p>
                      <div className="space-y-2">
                        {docs.map((doc, i) => (
                          <div key={i} className="flex items-center gap-2 p-2 rounded-lg bg-white border border-slate-200">
                            <FileText className="w-3.5 h-3.5 text-[#00A86B] flex-shrink-0" />
                            <div className="flex-1 min-w-0">
                              <p className="text-xs font-bold text-slate-700 truncate">{doc.type}</p>
                              <p className="text-[11px] text-slate-400 truncate">{doc.description}</p>
                            </div>
                            <a href={doc.url} target="_blank" rel="noopener noreferrer"
                              className="flex-shrink-0 px-2.5 py-1 bg-[#00A86B] text-white text-[11px] font-bold rounded-lg hover:bg-[#009960] flex items-center gap-1">
                              <Eye className="w-3 h-3" /> View
                            </a>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  <div>
                    <label className="text-xs font-black text-slate-600 uppercase mb-2 block">
                      Verification Notes *
                    </label>
                    <textarea
                      value={officerNotes} onChange={e => setOfficerNotes(e.target.value)}
                      rows={4} className={`${inp} resize-none`}
                      placeholder="Describe your verification findings… e.g. Carta verified in land registry — Plot #1234-A confirmed. Owner name matches ID. Tax receipt valid for 2026."
                    />
                  </div>

                  <div className="flex gap-3">
                    <button
                      onClick={doOfficerApprove} disabled={submitting}
                      className="flex-1 py-3 rounded-xl font-black bg-[#00A86B] text-white hover:bg-[#009960] disabled:opacity-50 transition-all flex items-center justify-center gap-2"
                    >
                      {submitting
                        ? <><div className="w-4 h-4 rounded-full border-2 border-white/30 border-t-white animate-spin" /> Approving…</>
                        : <><CheckCircle className="w-4 h-4" /> Approve &amp; Publish</>
                      }
                    </button>
                    <button
                      onClick={doOfficerReject} disabled={submitting}
                      className="flex-1 py-3 rounded-xl font-black bg-red-500 text-white hover:bg-red-600 disabled:opacity-50 transition-all flex items-center justify-center gap-2"
                    >
                      <XCircle className="w-4 h-4" /> Reject
                    </button>
                  </div>
                </div>
              )}

              {/* read-only */}
              {!canAdminReview && !canOfficerReview && (
                <div className="text-center py-12">
                  <CheckCircle2 className="w-14 h-14 text-slate-200 mx-auto mb-3" />
                  <p className="font-bold text-slate-500">Listing already processed</p>
                  <p className="text-sm text-slate-400 mt-1">Status: {sm.label}</p>
                  {listing.rejection_reason && (
                    <div className="mt-4 p-3 rounded-xl bg-red-50 border border-red-200 text-left">
                      <p className="text-xs font-bold text-red-600 uppercase mb-1">Rejection Reason</p>
                      <p className="text-sm text-slate-700">{listing.rejection_reason}</p>
                    </div>
                  )}
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
};

// ═══════════════════════════════════════════════════════════════════════════════
//  G2B VERIFICATION TAB
//  Purpose: Admin/SuperAdmin add verification docs + location details for officers.
//  Officers are created in User Management — NOT here.
// ═══════════════════════════════════════════════════════════════════════════════
const G2BManagementTab: React.FC<{
  officers: Officer[]; cities: City[]; onCreated: () => void;
}> = ({ officers }) => {

  // ── selected officer for doc upload ──────────────────────────────────────
  const [selectedOfficerId, setSelectedOfficerId] = useState<number | null>(null);
  const selectedOfficer = officers.find(o => o.id === selectedOfficerId) ?? null;

  // ── new document being composed ──────────────────────────────────────────
  const emptyDoc = () => ({
    type: "",
    description: "",
    city: "",
    kebele: "",
    sub_area: "",
    plot_number: "",
    reference_number: "",
    url: "",
    notes: "",
  });
  const [docForm, setDocForm] = useState(emptyDoc());
  const setF = (k: string, v: string) => setDocForm(f => ({ ...f, [k]: v }));

  // ── list of docs staged for this upload session ───────────────────────────
  const [staged, setStaged] = useState<typeof docForm[]>([]);
  const [saving, setSaving] = useState(false);
  const [savedMsg, setSavedMsg] = useState("");

  const addToStaged = () => {
    if (!docForm.type.trim())        { alert("Document type is required");         return; }
    if (!docForm.description.trim()) { alert("Description / what to verify is required"); return; }
    if (!docForm.city.trim())        { alert("City is required");                  return; }
    setStaged(s => [...s, { ...docForm }]);
    setDocForm(emptyDoc());
  };

  const removeStaged = (i: number) => setStaged(s => s.filter((_, j) => j !== i));

  const submitDocs = async () => {
    if (!selectedOfficerId) { alert("Select an officer first"); return; }
    if (staged.length === 0) { alert("Add at least one document"); return; }
    setSaving(true);
    setSavedMsg("");
    try {
      // Build VerifDoc array with all fields packed into description
      const documents = staged.map(d => ({
        type: d.type,
        description: [
          d.description,
          d.city       ? `City: ${d.city}`               : "",
          d.kebele     ? `Kebele: ${d.kebele}`            : "",
          d.sub_area   ? `Sub-area: ${d.sub_area}`        : "",
          d.plot_number    ? `Plot No: ${d.plot_number}`  : "",
          d.reference_number ? `Ref No: ${d.reference_number}` : "",
          d.notes      ? `Notes: ${d.notes}`              : "",
        ].filter(Boolean).join(" | "),
        url: d.url || "#",
        city: d.city,
        kebele: d.kebele,
        sub_area: d.sub_area,
        plot_number: d.plot_number,
        reference_number: d.reference_number,
        assigned_officer_id: selectedOfficerId,
      }));

      // Persist as a "verification template" in admin_users metadata
      // We store this via a dedicated endpoint; fall back to a simple notes approach
      const r = await fetch(`/api/admin/users/${selectedOfficerId}`, {
        method: "PUT",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ verification_documents_template: JSON.stringify(documents) }),
      });
      const data = await r.json();
      if (data.success) {
        setSavedMsg(`✅ ${staged.length} document template${staged.length > 1 ? "s" : ""} saved for ${selectedOfficer?.full_name}`);
        setStaged([]);
      } else {
        setSavedMsg(`❌ ${data.message ?? "Failed to save"}`);
      }
    } finally { setSaving(false); }
  };

  const muni  = officers.filter(o => o.role === "g2b_municipality");
  const trans = officers.filter(o => o.role === "g2b_transport");

  // ── parse sub_cities safely ───────────────────────────────────────────────
  const parseSub = (raw: string | string[]): string[] => {
    if (Array.isArray(raw)) return raw;
    try { const p = JSON.parse(raw); return Array.isArray(p) ? p : []; } catch { return raw ? [raw] : []; }
  };

  const inp2 = `${inp} bg-white`;

  return (
    <div className="space-y-6">

      {/* ── page header ──────────────────────────────────────────────────── */}
      <div className="flex items-start gap-4 p-5 rounded-2xl bg-gradient-to-br from-[#00A86B]/8 to-emerald-50 border border-[#00A86B]/20">
        <div className="p-3 bg-[#00A86B]/15 rounded-xl flex-shrink-0">
          <Shield className="w-6 h-6 text-[#00A86B]" />
        </div>
        <div>
          <h2 className="text-xl font-black text-slate-900">G2B Verification Setup</h2>
          <p className="text-sm text-slate-600 mt-0.5">
            Add verification documents, location details and instructions for G2B officers.
            Officers are created in <span className="font-bold text-[#00A86B]">User Management</span>.
          </p>
          <div className="flex items-center gap-3 mt-2 text-xs text-slate-500 flex-wrap">
            <span className="flex items-center gap-1"><Building2 className="w-3 h-3 text-blue-500" /> {muni.length} Municipality officers</span>
            <span className="flex items-center gap-1"><Car className="w-3 h-3 text-purple-500" /> {trans.length} Transport officers</span>
            <span className="flex items-center gap-1"><CheckCircle className="w-3 h-3 text-green-500" /> {officers.filter(o => o.is_active).length} active</span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">

        {/* ── LEFT: officer selector ─────────────────────────────────────── */}
        <div className="lg:col-span-1 space-y-3">
          <p className="text-xs font-black text-slate-600 uppercase tracking-wide">
            Step 1 — Select Officer
          </p>

          {officers.length === 0 && (
            <div className="p-4 rounded-xl border border-dashed border-slate-200 text-center text-sm text-slate-400">
              No officers found. Create them in User Management first.
            </div>
          )}

          {[
            { label: "Municipality", icon: <Building2 className="w-4 h-4 text-blue-500" />, list: muni, hdr: "bg-blue-50 border-blue-200" },
            { label: "Transport",    icon: <Car       className="w-4 h-4 text-purple-500" />, list: trans, hdr: "bg-purple-50 border-purple-200" },
          ].map(grp => grp.list.length > 0 && (
            <div key={grp.label}>
              <div className={`flex items-center gap-2 px-3 py-2 rounded-xl border ${grp.hdr} mb-2`}>
                {grp.icon}
                <span className="text-xs font-black text-slate-700">{grp.label} Officers</span>
              </div>
              <div className="space-y-1.5">
                {grp.list.map(o => {
                  const sc = parseSub(o.sub_cities);
                  const isSelected = selectedOfficerId === o.id;
                  return (
                    <button
                      key={o.id}
                      onClick={() => setSelectedOfficerId(isSelected ? null : o.id)}
                      className={`w-full text-left p-3 rounded-xl border transition-all ${
                        isSelected
                          ? "border-[#00A86B] bg-[#00A86B]/5 shadow-sm"
                          : "border-slate-200 hover:border-[#00A86B]/40 bg-white"
                      }`}
                    >
                      <div className="flex items-center gap-2.5">
                        <div className={`w-8 h-8 rounded-lg flex items-center justify-center text-sm font-black flex-shrink-0 ${
                          isSelected ? "bg-[#00A86B] text-white" : "bg-slate-100 text-slate-600"
                        }`}>
                          {o.full_name[0]}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="font-bold text-sm text-slate-800 truncate">{o.full_name}</p>
                          <p className="text-[11px] text-slate-400">@{o.username}</p>
                        </div>
                        <span className={`text-[10px] font-black px-1.5 py-0.5 rounded-full flex-shrink-0 ${
                          o.is_active ? "bg-green-100 text-green-700" : "bg-red-100 text-red-600"
                        }`}>
                          {o.is_active ? "Active" : "Off"}
                        </span>
                      </div>
                      <div className="flex items-center gap-1 mt-1.5 text-[11px] text-slate-500">
                        <MapPin className="w-3 h-3 flex-shrink-0" />
                        <span className="capitalize">{o.city ?? "Any city"}</span>
                      </div>
                      {sc.length > 0 && (
                        <div className="flex flex-wrap gap-1 mt-1">
                          {sc.map(s => (
                            <span key={s} className="px-1.5 py-0.5 rounded-md bg-slate-100 text-[10px] text-slate-500">{s}</span>
                          ))}
                        </div>
                      )}
                    </button>
                  );
                })}
              </div>
            </div>
          ))}
        </div>

        {/* ── RIGHT: document upload form ────────────────────────────────── */}
        <div className="lg:col-span-2 space-y-4">
          <p className="text-xs font-black text-slate-600 uppercase tracking-wide">
            Step 2 — Add Verification Documents &amp; Location Details
          </p>

          {!selectedOfficer && (
            <div className="flex flex-col items-center justify-center py-16 rounded-2xl border-2 border-dashed border-slate-200 text-slate-400 gap-2">
              <User className="w-10 h-10 opacity-30" />
              <p className="text-sm font-bold">Select an officer on the left to add documents</p>
            </div>
          )}

          {selectedOfficer && (
            <>
              {/* selected officer banner */}
              <div className="flex items-center gap-3 p-3 rounded-xl bg-[#00A86B]/8 border border-[#00A86B]/25">
                <div className="w-9 h-9 rounded-xl bg-[#00A86B] flex items-center justify-center text-white font-black text-sm flex-shrink-0">
                  {selectedOfficer.full_name[0]}
                </div>
                <div>
                  <p className="font-black text-slate-800 text-sm">{selectedOfficer.full_name}</p>
                  <p className="text-xs text-slate-500">@{selectedOfficer.username} · {selectedOfficer.city ?? "Any city"} · {selectedOfficer.role === "g2b_municipality" ? "Municipality" : "Transport"}</p>
                </div>
              </div>

              {/* staged docs list */}
              {staged.length > 0 && (
                <div className="space-y-2">
                  <p className="text-xs font-black text-slate-500 uppercase">Queued Documents ({staged.length})</p>
                  {staged.map((d, i) => (
                    <div key={i} className="flex items-start gap-3 p-3 rounded-xl bg-white border border-slate-200">
                      <div className="p-2 bg-[#00A86B]/10 rounded-lg flex-shrink-0">
                        <FileText className="w-4 h-4 text-[#00A86B]" />
                      </div>
                      <div className="flex-1 min-w-0 text-xs">
                        <p className="font-bold text-slate-800">{d.type}</p>
                        <p className="text-slate-500 mt-0.5 line-clamp-2">{d.description}</p>
                        <div className="flex flex-wrap gap-2 mt-1 text-slate-400">
                          {d.city && <span>📍 {d.city}</span>}
                          {d.kebele && <span>Kebele: {d.kebele}</span>}
                          {d.plot_number && <span>Plot: {d.plot_number}</span>}
                          {d.url && d.url !== "#" && <span className="text-[#00A86B] font-bold">File attached</span>}
                        </div>
                      </div>
                      <button onClick={() => removeStaged(i)}
                        className="p-1.5 rounded-lg text-slate-300 hover:text-red-500 hover:bg-red-50 transition-all flex-shrink-0">
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  ))}
                </div>
              )}

              {/* document compose form */}
              <div className="p-5 rounded-2xl border-2 border-dashed border-[#00A86B]/30 bg-[#00A86B]/5 space-y-4">
                <div className="flex items-center gap-2 mb-1">
                  <Upload className="w-4 h-4 text-[#00A86B]" />
                  <p className="text-sm font-black text-slate-800">New Verification Document</p>
                </div>

                {/* row 1: type + reference */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="text-[11px] font-black text-slate-600 uppercase mb-1 block">
                      Document Type <span className="text-red-400">*</span>
                    </label>
                    <input
                      type="text"
                      value={docForm.type}
                      onChange={e => setF("type", e.target.value)}
                      placeholder="e.g. Carta, Ownership Certificate, Vehicle Registration…"
                      className={inp2}
                    />
                  </div>
                  <div>
                    <label className="text-[11px] font-black text-slate-600 uppercase mb-1 block">
                      Reference / Document Number
                    </label>
                    <input
                      type="text"
                      value={docForm.reference_number}
                      onChange={e => setF("reference_number", e.target.value)}
                      placeholder="e.g. REC-2026-1234"
                      className={inp2}
                    />
                  </div>
                </div>

                {/* row 2: description */}
                <div>
                  <label className="text-[11px] font-black text-slate-600 uppercase mb-1 block">
                    Description — What Officer Should Verify <span className="text-red-400">*</span>
                  </label>
                  <textarea
                    value={docForm.description}
                    onChange={e => setF("description", e.target.value)}
                    rows={3}
                    placeholder="e.g. Verify plot number 1234-A in the land registry. Owner name must match ID copy. Check for liens or disputes. Confirm boundaries match survey map."
                    className={`${inp2} resize-none`}
                  />
                </div>

                {/* row 3: location fields — all text, no dropdowns */}
                <div className="p-3 rounded-xl bg-white border border-slate-200 space-y-3">
                  <p className="text-[11px] font-black text-slate-500 uppercase flex items-center gap-1.5">
                    <MapPin className="w-3.5 h-3.5 text-[#00A86B]" /> Location Details
                  </p>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    <div>
                      <label className="text-[11px] font-black text-slate-600 uppercase mb-1 block">
                        City <span className="text-red-400">*</span>
                      </label>
                      <input
                        type="text"
                        value={docForm.city}
                        onChange={e => setF("city", e.target.value)}
                        placeholder="e.g. Hawassa"
                        className={inp2}
                      />
                    </div>
                    <div>
                      <label className="text-[11px] font-black text-slate-600 uppercase mb-1 block">
                        Kebele / Sub-city
                      </label>
                      <input
                        type="text"
                        value={docForm.kebele}
                        onChange={e => setF("kebele", e.target.value)}
                        placeholder="e.g. Tabor, Kebele 04"
                        className={inp2}
                      />
                    </div>
                    <div>
                      <label className="text-[11px] font-black text-slate-600 uppercase mb-1 block">
                        Specific Area / Street
                      </label>
                      <input
                        type="text"
                        value={docForm.sub_area}
                        onChange={e => setF("sub_area", e.target.value)}
                        placeholder="e.g. Near main market"
                        className={inp2}
                      />
                    </div>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="text-[11px] font-black text-slate-600 uppercase mb-1 block">
                        Plot / Parcel Number
                      </label>
                      <input
                        type="text"
                        value={docForm.plot_number}
                        onChange={e => setF("plot_number", e.target.value)}
                        placeholder="e.g. 1234-A / Block 5"
                        className={inp2}
                      />
                    </div>
                    <div>
                      <label className="text-[11px] font-black text-slate-600 uppercase mb-1 block">
                        File URL / Upload Path
                      </label>
                      <input
                        type="text"
                        value={docForm.url}
                        onChange={e => setF("url", e.target.value)}
                        placeholder="/uploads/listings/123/carta.pdf  or  https://…"
                        className={inp2}
                      />
                    </div>
                  </div>
                </div>

                {/* row 4: additional notes */}
                <div>
                  <label className="text-[11px] font-black text-slate-600 uppercase mb-1 block">
                    Additional Notes for Officer
                  </label>
                  <textarea
                    value={docForm.notes}
                    onChange={e => setF("notes", e.target.value)}
                    rows={2}
                    placeholder="Priority level, deadline instructions, special checks, context…"
                    className={`${inp2} resize-none`}
                  />
                </div>

                <button
                  onClick={addToStaged}
                  className="w-full py-3 rounded-xl font-black bg-[#00A86B] text-white hover:bg-[#009960] transition-all flex items-center justify-center gap-2 text-sm"
                >
                  <Plus className="w-4 h-4" /> Add to Queue
                </button>
              </div>

              {/* submit all */}
              {staged.length > 0 && (
                <div className="space-y-3">
                  <button
                    onClick={submitDocs}
                    disabled={saving}
                    className="w-full py-3.5 rounded-xl font-black bg-slate-900 text-white hover:bg-slate-800 disabled:opacity-50 transition-all flex items-center justify-center gap-2"
                  >
                    {saving
                      ? <><div className="w-4 h-4 rounded-full border-2 border-white/30 border-t-white animate-spin" /> Saving…</>
                      : <><Send className="w-4 h-4" /> Save {staged.length} Document{staged.length > 1 ? "s" : ""} for {selectedOfficer.full_name}</>
                    }
                  </button>
                  {savedMsg && (
                    <div className={`p-3 rounded-xl text-sm font-bold text-center ${
                      savedMsg.startsWith("✅") ? "bg-green-50 border border-green-200 text-green-700" : "bg-red-50 border border-red-200 text-red-600"
                    }`}>
                      {savedMsg}
                    </div>
                  )}
                </div>
              )}
            </>
          )}
        </div>
      </div>

      {/* ── Standard requirements reference ──────────────────────────────── */}
      <div className="p-5 rounded-2xl bg-slate-50 border border-slate-200">
        <p className="text-xs font-black text-slate-600 uppercase mb-4">📋 Standard Verification Requirements</p>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {[
            {
              icon: <Building2 className="w-4 h-4" />, label: "Municipality — Property / Land", color: "text-blue-700",
              items: [
                ["Carta (Land Registry)",   "Verify plot number in government registry — include city, kebele, plot number"],
                ["Property Tax Receipt",    "Current year paid, no arrears — include receipt reference number"],
                ["Ownership Certificate",   "Signature authenticity check — confirm owner name matches ID"],
                ["ID Copy",                 "Owner ID — name must match Carta and ownership certificate"],
              ]
            },
            {
              icon: <Car className="w-4 h-4" />, label: "Transport — Vehicles", color: "text-purple-700",
              items: [
                ["Vehicle Registration",    "Plate number in transport authority DB — include plate code and region"],
                ["Insurance Document",      "Valid coverage check — include policy number and expiry date"],
                ["Transfer Document",       "Required if ownership transferred — include transfer date"],
                ["ID Copy",                 "Seller identity — name must match registration documents"],
              ]
            },
          ].map(col => (
            <div key={col.label}>
              <p className={`text-sm font-bold flex items-center gap-1.5 mb-3 ${col.color}`}>
                {col.icon} {col.label}
              </p>
              <ul className="space-y-2">
                {col.items.map(([doc, note]) => (
                  <li key={doc} className="flex items-start gap-2 text-sm">
                    <CheckCircle className="w-4 h-4 text-green-500 flex-shrink-0 mt-0.5" />
                    <span>
                      <span className="font-bold text-slate-700">{doc}</span>
                      <span className="text-slate-500"> — {note}</span>
                    </span>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default VerificationWorkflowHub;
