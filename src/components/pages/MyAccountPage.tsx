import React, { useCallback, useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import {
  ArrowLeft, Mail, Phone, Shield, Calendar, User, MessageCircle, Bell, CheckCheck, X,
  CalendarCheck, Package, Star, Eye, Trash2, Pencil, Loader2, CheckCircle2, Plus,
  XCircle, Banknote, Upload, ExternalLink, Lock, Clock, Wallet,
} from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { useLanguage } from "@/contexts/ZoneLanguageContext";
import { useChat } from "@/contexts/ChatContext";
import { useNotifications } from "@/contexts/NotificationContext";

type TabKey = "account" | "listings" | "bookings";
type BookingsSubTab = "guest" | "host";

interface OwnListing {
  id: number;
  title_en: string;
  title_am: string;
  category: string;
  price: number | string;
  price_suffix: string;
  is_active: number;
  status: string;
  view_count: number;
  created_at: string;
  is_verified?: number;
}

interface GuestBooking {
  id: number;
  listing_id: number;
  check_in: string | null;
  check_out: string | null;
  event_date: string | null;
  nights: number | null;
  guests: number | null;
  price_per_unit: number | string;
  total_price: number | string;
  currency: string;
  status: string;
  created_at: string;
  title_en: string;
  title_am: string;
  category: string;
  images: string[] | null;
  location_label_en: string | null;
}

interface HostBooking {
  id: number;
  listing_id: number;
  check_in: string | null;
  check_out: string | null;
  event_date: string | null;
  nights: number | null;
  guests: number | null;
  total_price: number | string;
  currency: string;
  status: string;
  guest_message: string | null;
  contact_phone: string | null;
  created_at: string;
  title_en: string;
  guest_name: string | null;
}

interface ReceiptData {
  payment_phone?: string | null;
  payment_bank_name?: string | null;
  payment_bank_account?: string | null;
  total_price?: number | string;
  currency?: string;
}

const TABS: { key: TabKey; labelEn: string; labelAm: string; icon: React.ElementType }[] = [
  { key: "account", labelEn: "Account", labelAm: "መለያ", icon: User },
  { key: "listings", labelEn: "My Listings", labelAm: "የእኔ ማስታወቂያዎች", icon: Package },
  { key: "bookings", labelEn: "My Bookings", labelAm: "ቦታ ማስያዣ", icon: CalendarCheck },
];

const BOOKING_STATUS_STYLE: Record<string, string> = {
  pending: "bg-amber-50 dark:bg-amber-900/20 text-amber-700 dark:text-amber-400",
  payment_submitted: "bg-sky-50 dark:bg-sky-900/20 text-sky-700 dark:text-sky-400",
  confirmed: "bg-emerald-50 dark:bg-emerald-900/20 text-emerald-700 dark:text-emerald-400",
  rejected: "bg-red-50 dark:bg-red-950/30 text-red-600 dark:text-red-400",
  cancelled_by_guest: "bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400",
  cancelled_by_host: "bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400",
  completed: "bg-[#00A86B]/10 text-[#00A86B] dark:text-emerald-400",
  expired: "bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400",
};

const LISTING_STATUS_STYLE: Record<string, string> = {
  active: "bg-emerald-50 dark:bg-emerald-900/20 text-emerald-700 dark:text-emerald-400",
  sold: "bg-[#00A86B]/10 text-[#00A86B] dark:text-emerald-400",
  archived: "bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400",
  suspended: "bg-red-50 dark:bg-red-950/30 text-red-600 dark:text-red-400",
  expired: "bg-amber-50 dark:bg-amber-900/20 text-amber-700 dark:text-amber-400",
  pending: "bg-amber-50 dark:bg-amber-900/20 text-amber-700 dark:text-amber-400",
  review: "bg-sky-50 dark:bg-sky-900/20 text-sky-700 dark:text-sky-400",
};

function suffixLabel(suffix: string, isAm: boolean): string {
  switch (suffix) {
    case "fixed": return isAm ? "ለሽያጭ" : "For Sale";
    case "per_month": return isAm ? "በወር ኪራይ" : "Per Month";
    case "per_day": return isAm ? "በቀን" : "Per Day";
    case "per_hour": return isAm ? "በሰዓት" : "Per Hour";
    default: return suffix;
  }
}

function listingStatusLabel(status: string, isAm: boolean): string {
  const map: Record<string, [string, string]> = {
    active: ["Active", "ንቁ"],
    sold: ["Sold", "ተሽጧል"],
    archived: ["Archived", "ተመዝግቧል"],
    suspended: ["Suspended", "የታገደ"],
    expired: ["Expired", "ጊዜው አልፏል"],
    pending: ["Pending review", "በግምገማ ላይ"],
    review: ["Under review", "በግምገማ ላይ"],
  };
  const pair = map[status];
  return pair ? (isAm ? pair[1] : pair[0]) : status;
}

function bookingStatusLabel(status: string, isAm: boolean): string {
  const map: Record<string, [string, string]> = {
    pending: ["Pending", "በመጠባበቅ ላይ"],
    payment_submitted: ["Payment submitted", "ክፍያ ቀርቧል"],
    confirmed: ["Confirmed", "ተረጋግጧል"],
    rejected: ["Rejected", "ውድቅ ተደርጓል"],
    cancelled_by_guest: ["Cancelled by you", "በእርስዎ ተሰርዟል"],
    cancelled_by_host: ["Cancelled by host", "በባለቤት ተሰርዟል"],
    completed: ["Completed", "ተጠናቋል"],
    expired: ["Expired", "ጊዜው አልፏል"],
  };
  const pair = map[status];
  return pair ? (isAm ? pair[1] : pair[0]) : status.replace(/_/g, " ");
}

function fmtDate(s: string | null | undefined): string {
  if (!s) return "—";
  const d = new Date(s);
  return Number.isNaN(d.getTime()) ? s : d.toLocaleDateString();
}

function fmtMoney(v: number | string, currency?: string): string {
  const n = Number(v);
  const cur = currency === "USD" ? "$" : "ETB";
  return `${Number.isFinite(n) ? n.toLocaleString() : v} ${cur}`;
}

const MyAccountPage: React.FC = () => {
  const { user, updateProfile } = useAuth();
  const { language } = useLanguage();
  const { conversations, unreadCount } = useChat();
  const { notifications, unreadCount: notifUnread, loading: notifLoading, refresh: refreshNotifs, markRead, markAllRead } = useNotifications();
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();

  const isAm = language === "amharic";

  const [activeTab, setActiveTab] = useState<TabKey>(() => {
    const t = searchParams.get("tab");
    return t === "bookings" || t === "listings" ? (t as TabKey) : "account";
  });

  useEffect(() => {
    const t = searchParams.get("tab");
    if (t === "bookings" || t === "listings") setActiveTab(t as TabKey);
  }, [searchParams]);

  const setTab = (tab: TabKey) => {
    setActiveTab(tab);
    if (tab === "account") setSearchParams({});
    else setSearchParams({ tab });
  };

  // Notifications dropdown
  const [notifOpen, setNotifOpen] = useState(false);

  // Inline profile edit
  const [editMode, setEditMode] = useState(false);
  const [formData, setFormData] = useState({ full_name: "", email: "", phone_number: "" });
  const [saving, setSaving] = useState(false);
  const [saveMsg, setSaveMsg] = useState<{ type: "success" | "error"; text: string } | null>(null);

  // My listings
  const [listings, setListings] = useState<OwnListing[]>([]);
  const [analytics, setAnalytics] = useState<{
    total_listings: number; active_listings: number; sold_listings: number;
    verified_listings: number; total_views: number; favorites_count: number;
    avg_rating: number; review_count: number;
  } | null>(null);
  const [listingsLoading, setListingsLoading] = useState(false);

  // My bookings
  const [guestBookings, setGuestBookings] = useState<GuestBooking[]>([]);
  const [hostBookings, setHostBookings] = useState<HostBooking[]>([]);
  const [bookingsTab, setBookingsTab] = useState<BookingsSubTab>("guest");
  const [bookingsLoading, setBookingsLoading] = useState(false);

  // Payment evidence modal
  const [payBooking, setPayBooking] = useState<GuestBooking | null>(null);
  const [receipt, setReceipt] = useState<ReceiptData>({});
  const [payNotes, setPayNotes] = useState("");
  const [payFiles, setPayFiles] = useState<File[]>([]);
  const [paySaving, setPaySaving] = useState(false);

  // Action busy guard (e.g. "b12")
  const [busyId, setBusyId] = useState<string | null>(null);

  const loadListings = useCallback(async () => {
    setListingsLoading(true);
    try {
      const [listRes, anRes] = await Promise.all([
        fetch("/api/listings/mine", { credentials: "include" }),
        fetch("/api/listings/mine/analytics", { credentials: "include" }),
      ]);
      const list = await listRes.json();
      const an = await anRes.json();
      if (list.success) setListings(list.data || []);
      if (an.success) setAnalytics(an.data);
    } catch {
      // silent
    } finally {
      setListingsLoading(false);
    }
  }, []);

  const loadBookings = useCallback(async () => {
    setBookingsLoading(true);
    try {
      const [gRes, hRes] = await Promise.all([
        fetch("/api/bookings/mine", { credentials: "include" }),
        fetch("/api/bookings/hosted", { credentials: "include" }),
      ]);
      const g = await gRes.json();
      const h = await hRes.json();
      if (g.success) setGuestBookings(g.data || []);
      if (h.success) setHostBookings(h.data || []);
    } catch {
      // silent
    } finally {
      setBookingsLoading(false);
    }
  }, []);

  useEffect(() => {
    loadListings();
    loadBookings();
  }, [loadListings, loadBookings]);

  if (!user) {
    navigate("/signin");
    return null;
  }

  const accountTypeLabel = user.account_type === "g2b"
    ? (isAm ? "የንግድ ስለ መንግስት" : "Government to Business")
    : user.account_type === "g2c"
    ? (isAm ? "የንግድ ስለ ህዝብ" : "Government to Citizen")
    : (isAm ? "የግል መለያ" : "Personal Account");

  const fields = [
    { icon: User, label: isAm ? "ሙሉ ስም" : "Full Name", value: user.full_name },
    { icon: Mail, label: "Email", value: user.email || "—" },
    { icon: Phone, label: isAm ? "ስልክ ቁጥር" : "Phone Number", value: user.phone_number || "—" },
    { icon: Shield, label: isAm ? "የመለያ አይነት" : "Account Type", value: accountTypeLabel },
    { icon: Calendar, label: isAm ? "ማረፊያ" : "Provider", value: user.provider === "google" ? "Google" : (isAm ? "ኢሜይል" : "Email") },
  ];

  const handleStartEdit = () => {
    setFormData({ full_name: user.full_name, email: user.email || "", phone_number: user.phone_number || "" });
    setSaveMsg(null);
    setEditMode(true);
  };

  const handleSaveProfile = async () => {
    if (!formData.full_name.trim() || formData.full_name.trim().length < 2) {
      setSaveMsg({ type: "error", text: isAm ? "ሙሉ ስም ቢያንስ 2 ቁምፊ መሆን አለበት" : "Name must be at least 2 characters" });
      return;
    }
    setSaving(true);
    setSaveMsg(null);
    const result = await updateProfile({
      full_name: formData.full_name,
      email: formData.email || undefined,
      phone_number: formData.phone_number || undefined,
    });
    setSaving(false);
    if (result.success) {
      setSaveMsg({ type: "success", text: isAm ? "መገለጫ ተስተካክሏል!" : "Profile updated!" });
      setTimeout(() => { setEditMode(false); setSaveMsg(null); }, 900);
    } else {
      setSaveMsg({ type: "error", text: result.message });
    }
  };

  const changeListingStatus = async (id: number, status: string) => {
    setBusyId(`l${id}`);
    try {
      const res = await fetch(`/api/listings/${id}/status`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status }),
        credentials: "include",
      });
      const data = await res.json();
      if (!data.success) alert(data.message || "Failed to update listing");
      await loadListings();
    } catch {
      alert("Network error");
    } finally {
      setBusyId(null);
    }
  };

  const deleteListing = async (id: number, title: string) => {
    if (!window.confirm(isAm ? `"${title}" ን ማጥፋት እርግጠኛ ነዎት?` : `Delete "${title}"? This archives it permanently.`)) return;
    setBusyId(`l${id}`);
    try {
      const res = await fetch(`/api/listings/${id}`, { method: "DELETE", credentials: "include" });
      const data = await res.json();
      if (!data.success) alert(data.message || "Failed to delete listing");
      await loadListings();
    } catch {
      alert("Network error");
    } finally {
      setBusyId(null);
    }
  };

  const changeBookingStatus = async (id: number, status: string) => {
    setBusyId(`b${id}`);
    try {
      const res = await fetch(`/api/bookings/${id}/status`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status }),
        credentials: "include",
      });
      const data = await res.json();
      if (!data.success) alert(data.message || "Failed to update booking");
      await loadBookings();
    } catch {
      alert("Network error");
    } finally {
      setBusyId(null);
    }
  };

  const openPayModal = async (booking: GuestBooking) => {
    setPayBooking(booking);
    setPayNotes("");
    setPayFiles([]);
    setReceipt({});
    try {
      const res = await fetch(`/api/bookings/${booking.id}/receipt`, { credentials: "include" });
      const data = await res.json();
      if (data.success) setReceipt(data.receipt || data.data || {});
    } catch {
      // receipt info optional
    }
  };

  const submitPayment = async () => {
    if (!payBooking) return;
    if (payFiles.length === 0) {
      alert(isAm ? "ቢያንስ አንድ ክፍያ ማረጋገጫ ፎቶ ያስገቡ" : "Attach at least one payment evidence image");
      return;
    }
    setPaySaving(true);
    const fd = new FormData();
    payFiles.forEach((f) => fd.append("evidence", f));
    if (payNotes.trim()) fd.append("note", payNotes.trim());
    try {
      const res = await fetch(`/api/bookings/${payBooking.id}/payment-evidence`, {
        method: "POST",
        credentials: "include",
        body: fd,
      });
      const data = await res.json();
      if (data.success) {
        setPayBooking(null);
        await loadBookings();
      } else {
        alert(data.message || "Failed to submit payment");
      }
    } catch {
      alert("Network error");
    } finally {
      setPaySaving(false);
    }
  };

  const statTiles = analytics
    ? [
        { icon: Package, label: isAm ? "ማስታወቂያዎች" : "Listings", value: String(analytics.total_listings) },
        { icon: Eye, label: isAm ? "እይታዎች" : "Views", value: analytics.total_views.toLocaleString() },
        { icon: Star, label: isAm ? "ደረጃ" : "Rating", value: `${analytics.avg_rating}★` },
        { icon: Star, label: isAm ? "ተወዳጅ" : "Favorites", value: String(analytics.favorites_count) },
      ]
    : [];

  const renderStatusBadge = (status: string, styleMap: Record<string, string>, label: string) => (
    <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-wide ${styleMap[status] || "bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400"}`}>
      {label}
    </span>
  );

  const renderAccountTab = () => (
    <div className="space-y-6">
      {/* Quick actions */}
      <div className="grid grid-cols-3 gap-3">
        <button
          onClick={() => window.dispatchEvent(new CustomEvent("openChatPanel"))}
          className="relative bg-gradient-to-br from-[#00A86B] to-emerald-600 hover:from-emerald-600 hover:to-[#00A86B] text-white rounded-2xl p-4 transition-all duration-300 hover:shadow-lg hover:-translate-y-0.5 active:translate-y-0"
        >
          <div className="flex flex-col items-center gap-2">
            <div className="relative">
              <MessageCircle className="w-7 h-7" strokeWidth={2.5} />
              {unreadCount > 0 && (
                <span className="absolute -top-1 -right-1 min-w-[18px] h-[18px] px-1 bg-red-500 text-white text-[9px] font-black rounded-full flex items-center justify-center border-2 border-white">
                  {unreadCount > 9 ? "9+" : unreadCount}
                </span>
              )}
            </div>
            <div className="text-center">
              <p className="text-sm font-black uppercase tracking-wide">{isAm ? "መልዕክቶች" : "Messages"}</p>
              <p className="text-xs opacity-90">{isAm ? `${conversations.length} ውይይቶች` : `${conversations.length} chats`}</p>
            </div>
          </div>
        </button>

        <div className="relative">
          <button
            onClick={() => { setNotifOpen((o) => !o); if (!notifOpen) refreshNotifs(); }}
            className="relative bg-white dark:bg-slate-900 hover:bg-slate-50 dark:hover:bg-slate-800 border-2 border-slate-200 dark:border-white/10 hover:border-[#00A86B] rounded-2xl p-4 transition-all duration-300 hover:shadow-lg"
          >
            <div className="flex flex-col items-center gap-2">
              <div className="relative">
                <Bell className="w-7 h-7 text-slate-700 dark:text-slate-300" strokeWidth={2.5} />
                {notifUnread > 0 && (
                  <span className="absolute -top-1.5 -right-1.5 min-w-[18px] h-[18px] flex items-center justify-center bg-red-500 text-white text-[10px] font-black rounded-full border-2 border-white dark:border-slate-900 px-1">
                    {notifUnread > 99 ? "99+" : notifUnread}
                  </span>
                )}
              </div>
              <div className="text-center">
                <p className="text-sm font-black uppercase tracking-wide text-slate-900 dark:text-white">{isAm ? "ማሳወቂያዎች" : "Notifications"}</p>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  {notifUnread > 0 ? (isAm ? `${notifUnread} አዲስ` : `${notifUnread} new`) : (isAm ? "ሁሉም ታይቷል" : "All caught up")}
                </p>
              </div>
            </div>
          </button>
          {notifOpen && (
            <>
              <div className="fixed inset-0 z-40" onClick={() => setNotifOpen(false)} />
              <div className="absolute left-0 right-0 mt-2 w-full sm:w-80 sm:left-auto sm:right-0 max-h-96 overflow-y-auto bg-white dark:bg-slate-900 border border-slate-200 dark:border-white/10 rounded-2xl shadow-2xl z-50">
                <div className="flex items-center justify-between px-4 py-3 border-b border-slate-100 dark:border-slate-800">
                  <span className="text-sm font-black text-slate-900 dark:text-white uppercase tracking-wide">{isAm ? "ማሳወቂያዎች" : "Notifications"}</span>
                  <div className="flex items-center gap-2">
                    {notifUnread > 0 && (
                      <button onClick={markAllRead} className="text-[10px] font-bold text-[#00A86B] hover:underline flex items-center gap-1">
                        <CheckCheck className="w-3 h-3" /> {isAm ? "ሁሉንም ታድስ" : "Read all"}
                      </button>
                    )}
                    <button onClick={() => setNotifOpen(false)}><X className="w-4 h-4 text-slate-400 hover:text-slate-600" /></button>
                  </div>
                </div>
                {notifLoading && notifications.length === 0 ? (
                  <div className="p-6 text-center text-xs text-slate-400 font-bold uppercase tracking-wider">{isAm ? "በመጫን ላይ..." : "Loading..."}</div>
                ) : notifications.length === 0 ? (
                  <div className="p-6 text-center text-xs text-slate-400 font-bold uppercase tracking-wider">{isAm ? "ማሳወቂያ የለም" : "No notifications yet"}</div>
                ) : (
                  <div className="divide-y divide-slate-50 dark:divide-slate-800">
                    {notifications.map((n) => (
                      <button key={n.id} onClick={() => markRead(n.id)} className={`w-full text-left px-4 py-3 hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors ${!n.read_at ? "bg-emerald-50/50 dark:bg-emerald-900/10" : ""}`}>
                        <div className="flex items-start gap-3">
                          {!n.read_at && <span className="w-2 h-2 rounded-full bg-[#00A86B] shrink-0 mt-1.5" />}
                          <div className="flex-1 min-w-0">
                            <p className={`text-xs font-bold text-slate-900 dark:text-white truncate ${!n.read_at ? "" : "opacity-60"}`}>{n.title}</p>
                            {n.body && <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5 line-clamp-2">{n.body}</p>}
                            <p className="text-[10px] text-slate-400 mt-1">{new Date(n.created_at).toLocaleString()}</p>
                          </div>
                        </div>
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </>
          )}
        </div>

        <button
          onClick={() => setTab("bookings")}
          className="bg-white dark:bg-slate-900 hover:bg-slate-50 dark:hover:bg-slate-800 border-2 border-slate-200 dark:border-white/10 hover:border-[#00A86B] rounded-2xl p-4 transition-all duration-300 hover:shadow-lg"
        >
          <div className="flex flex-col items-center gap-2">
            <CalendarCheck className="w-7 h-7 text-[#00A86B]" strokeWidth={2.5} />
            <div className="text-center">
              <p className="text-sm font-black uppercase tracking-wide text-slate-900 dark:text-white">{isAm ? "ቦታ ማስያዣ" : "Bookings"}</p>
              <p className="text-xs text-slate-500 dark:text-slate-400">{isAm ? "መመልከት" : "View & manage"}</p>
            </div>
          </div>
        </button>
      </div>

      {/* Profile card */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-white/10 p-6 sm:p-8 text-center">
        <div className="relative w-20 h-20 mx-auto mb-4">
          <div className="w-20 h-20 rounded-full bg-gradient-to-br from-[#00A86B] to-emerald-500 flex items-center justify-center text-white text-3xl font-bold shadow-xl shadow-emerald-500/20">
            {user.full_name?.charAt(0)?.toUpperCase() || "U"}
          </div>
          {user.is_verified && (
            <span className="absolute -bottom-1 -right-1 w-7 h-7 rounded-full bg-emerald-500 text-white flex items-center justify-center border-2 border-white dark:border-slate-900">
              <CheckCircle2 className="w-4 h-4" />
            </span>
          )}
        </div>
        <h1 className="text-xl font-bold text-slate-900 dark:text-white mb-1">{user.full_name}</h1>
        <p className="text-sm text-slate-500 dark:text-slate-400">{user.email}</p>
        {user.is_verified && (
          <span className="inline-flex items-center gap-1 mt-3 px-3 py-1 rounded-full bg-emerald-50 dark:bg-emerald-900/20 text-xs font-semibold text-emerald-700 dark:text-emerald-400">
            <Shield className="w-3 h-3" />
            {isAm ? "የተረጋገጠ" : "Verified"}
          </span>
        )}
        {user.created_at && (
          <p className="mt-3 text-[11px] text-slate-400 flex items-center justify-center gap-1">
            <Clock className="w-3 h-3" />
            {isAm ? `አባል ከ ${fmtDate(user.created_at)}` : `Member since ${fmtDate(user.created_at)}`}
          </p>
        )}
      </div>

      {/* Stats */}
      {analytics && statTiles.length > 0 && (
        <div className="grid grid-cols-4 gap-3">
          {statTiles.map((s) => (
            <div key={s.label} className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-white/10 p-4 text-center">
              <s.icon className="w-5 h-5 mx-auto mb-1.5 text-[#00A86B]" />
              <p className="text-lg font-black text-slate-900 dark:text-white leading-none">{s.value}</p>
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mt-1">{s.label}</p>
            </div>
          ))}
        </div>
      )}

      {/* Account details / edit */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-white/10 overflow-hidden">
        <div className="px-6 py-4 border-b border-slate-100 dark:border-white/5 flex items-center justify-between">
          <h2 className="text-sm font-bold text-slate-900 dark:text-white uppercase tracking-wider">{isAm ? "የመለያ ዝርዝሮች" : "Account Details"}</h2>
          {!editMode && (
            <button onClick={handleStartEdit} className="flex items-center gap-1.5 text-xs font-medium text-[#00A86B] hover:bg-[#00A86B]/10 px-2 py-1 rounded-lg transition-colors">
              <Pencil className="w-3.5 h-3.5" />
              {isAm ? "አርም" : "Edit"}
            </button>
          )}
        </div>
        <div className="divide-y divide-slate-100 dark:divide-white/5">
          {editMode ? (
            <div className="p-6 space-y-4">
              {saveMsg && (
                <div className={`p-3 rounded-lg text-sm ${saveMsg.type === "success" ? "bg-emerald-50 dark:bg-emerald-950/30 text-emerald-700 dark:text-emerald-400" : "bg-red-50 dark:bg-red-950/30 text-red-600 dark:text-red-400"}`}>
                  {saveMsg.text}
                </div>
              )}
              <div>
                <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-1">{isAm ? "ሙሉ ስም" : "Full Name"} *</label>
                <input type="text" value={formData.full_name} onChange={(e) => setFormData({ ...formData, full_name: e.target.value })}
                  className="w-full px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-sm text-slate-900 dark:text-white focus:ring-2 focus:ring-[#00A86B] outline-none" />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-1">Email</label>
                <input type="email" value={formData.email} onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className="w-full px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-sm text-slate-900 dark:text-white focus:ring-2 focus:ring-[#00A86B] outline-none" />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-1">{isAm ? "ስልክ ቁጥር" : "Phone Number"}</label>
                <input type="text" value={formData.phone_number} onChange={(e) => setFormData({ ...formData, phone_number: e.target.value })}
                  className="w-full px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-sm text-slate-900 dark:text-white focus:ring-2 focus:ring-[#00A86B] outline-none" />
              </div>
              <div className="flex gap-3 pt-2">
                <button onClick={() => { setEditMode(false); setSaveMsg(null); }}
                  className="flex items-center gap-1.5 px-4 py-2 rounded-lg border border-slate-200 dark:border-slate-700 text-sm font-medium text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors">
                  <X className="w-4 h-4" /> {isAm ? "ሰርዝ" : "Cancel"}
                </button>
                <button onClick={handleSaveProfile} disabled={saving}
                  className="flex items-center gap-1.5 px-4 py-2 rounded-lg bg-[#00A86B] text-white text-sm font-bold hover:bg-emerald-600 transition-colors disabled:opacity-50">
                  {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <CheckCircle2 className="w-4 h-4" />}
                  {isAm ? "አስቀምጥ" : "Save"}
                </button>
              </div>
            </div>
          ) : (
            fields.map((field) => (
              <div key={field.label} className="flex items-center gap-4 px-6 py-4">
                <div className="w-9 h-9 rounded-xl bg-slate-100 dark:bg-white/5 flex items-center justify-center shrink-0">
                  <field.icon className="w-4 h-4 text-slate-500 dark:text-slate-400" />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-xs font-medium text-slate-400 dark:text-slate-500 uppercase tracking-wide">{field.label}</p>
                  <p className="text-sm font-semibold text-slate-900 dark:text-white truncate mt-0.5">{field.value}</p>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      <button onClick={() => navigate("/settings")}
        className="w-full py-3 rounded-xl bg-slate-900 dark:bg-white text-white dark:text-slate-900 text-sm font-bold hover:opacity-90 transition-opacity">
        {isAm ? "ማስተካከያ ይምጡ (የይለፍ ቃል)" : "Full Settings & Password"}
      </button>
    </div>
  );

  const renderListingsTab = () => (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-black text-slate-900 dark:text-white">{isAm ? "የእኔ ማስታወቂያዎች" : "My Listings"}</h2>
        <button onClick={() => navigate("/post")} className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-[#00A86B] text-white text-xs font-black uppercase tracking-wide hover:bg-emerald-600 transition-colors">
          <Plus className="w-4 h-4" /> {isAm ? "አዲስ" : "New"}
        </button>
      </div>

      {listingsLoading && listings.length === 0 ? (
        <div className="p-10 text-center text-xs text-slate-400 font-bold uppercase tracking-wider">{isAm ? "በመጫን ላይ..." : "Loading..."}</div>
      ) : listings.length === 0 ? (
        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-white/10 p-10 text-center">
          <Package className="w-12 h-12 mx-auto mb-3 text-slate-300 dark:text-slate-600" />
          <p className="text-sm font-bold text-slate-700 dark:text-slate-300 mb-1">{isAm ? "እስካሁን ማስታወቂያ የለዎትም" : "You haven't posted any listings yet"}</p>
          <p className="text-xs text-slate-400 mb-5">{isAm ? "የመጀመሪያውን ማስታወቂያ ይለጥፉ" : "Post your first listing to start selling."}</p>
          <button onClick={() => navigate("/post")} className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#00A86B] text-white text-sm font-bold hover:bg-emerald-600 transition-colors">
            <Plus className="w-4 h-4" /> {isAm ? "ማስታወቂያ ይለጥፉ" : "Post a Listing"}
          </button>
        </div>
      ) : (
        <div className="space-y-3">
          {listings.map((l) => {
            const busy = busyId === `l${l.id}`;
            const blocked = l.status === "suspended" || l.status === "expired";
            return (
              <div key={l.id} className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-white/10 p-4 sm:p-5">
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <div className="flex flex-wrap items-center gap-2 mb-1">
                      {renderStatusBadge(l.status, LISTING_STATUS_STYLE, listingStatusLabel(l.status, isAm))}
                      {!!l.is_verified && (
                        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-emerald-50 dark:bg-emerald-900/20 text-[10px] font-black uppercase tracking-wide text-emerald-700 dark:text-emerald-400">
                          <CheckCircle2 className="w-3 h-3" /> {isAm ? "የተረጋገጠ" : "Verified"}
                        </span>
                      )}
                    </div>
                    <p className="text-sm font-bold text-slate-900 dark:text-white truncate">{l.title_en}</p>
                  </div>
                  <a href={`/listing/${l.id}`} onClick={(e) => { e.preventDefault(); navigate(`/listing/${l.id}`); }}
                    className="w-9 h-9 shrink-0 rounded-xl bg-slate-100 dark:bg-white/5 flex items-center justify-center text-slate-500 hover:text-[#00A86B] hover:bg-[#00A86B]/10 transition-colors">
                    <ExternalLink className="w-4 h-4" />
                  </a>
                </div>
                <div className="flex flex-wrap items-center gap-x-4 gap-y-1 mt-2 text-xs text-slate-500 dark:text-slate-400">
                  <span className="font-black text-slate-800 dark:text-slate-200">{fmtMoney(l.price)}</span>
                  <span>{suffixLabel(l.price_suffix, isAm)}</span>
                  <span className="flex items-center gap-1"><Eye className="w-3 h-3" /> {l.view_count}</span>
                  <span>{isAm ? "የተለጠፈ" : "Posted"} {fmtDate(l.created_at)}</span>
                </div>
                <div className="flex flex-wrap gap-2 mt-3">
                  {l.status === "active" && (
                    <button onClick={() => changeListingStatus(l.id, "sold")} disabled={busy}
                      className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#00A86B]/10 text-[#00A86B] text-xs font-bold hover:bg-[#00A86B]/20 transition-colors disabled:opacity-50">
                      {busy ? <Loader2 className="w-3 h-3 animate-spin" /> : <CheckCircle2 className="w-3 h-3" />} {isAm ? "ተሽጧል ምልክት" : "Mark Sold"}
                    </button>
                  )}
                  {l.status !== "active" && !blocked && (
                    <button onClick={() => changeListingStatus(l.id, "active")} disabled={busy}
                      className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-50 dark:bg-emerald-900/20 text-emerald-700 dark:text-emerald-400 text-xs font-bold hover:bg-emerald-100 dark:hover:bg-emerald-900/40 transition-colors disabled:opacity-50">
                      {busy ? <Loader2 className="w-3 h-3 animate-spin" /> : <CheckCircle2 className="w-3 h-3" />} {isAm ? "እንደገና አንቃ" : "Reactivate"}
                    </button>
                  )}
                  {blocked && (
                    <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-50 dark:bg-slate-800 text-xs font-bold text-slate-400">
                      <Lock className="w-3 h-3" /> {l.status === "expired" ? (isAm ? "ጊዜው አልፏል" : "Expired") : (isAm ? "ተግድቷል" : "Suspended")}
                    </span>
                  )}
                  <button onClick={() => deleteListing(l.id, l.title_en)} disabled={busy}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-red-50 dark:bg-red-950/30 text-red-600 dark:text-red-400 text-xs font-bold hover:bg-red-100 dark:hover:bg-red-950/50 transition-colors disabled:opacity-50">
                    <Trash2 className="w-3 h-3" /> {isAm ? "ሰርዝ" : "Delete"}
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );

  const renderBookingDates = (b: { check_in: string | null; check_out: string | null; event_date: string | null; nights: number | null }) => {
    const bits: string[] = [];
    if (b.event_date) bits.push(fmtDate(b.event_date));
    else if (b.check_in && b.check_out) bits.push(`${fmtDate(b.check_in)} → ${fmtDate(b.check_out)}`);
    else if (b.check_in) bits.push(fmtDate(b.check_in));
    return bits.length ? bits.join(" · ") : isAm ? "ቀን የለም" : "No dates";
  };

  const renderBookingsTab = () => (
    <div className="space-y-4">
      <h2 className="text-lg font-black text-slate-900 dark:text-white">{isAm ? "ቦታ ማስያዣ" : "My Bookings"}</h2>

      <div className="inline-flex rounded-xl bg-slate-100 dark:bg-slate-800 p-1">
        {(["guest", "host"] as BookingsSubTab[]).map((st) => (
          <button key={st} onClick={() => setBookingsTab(st)}
            className={`px-4 py-1.5 rounded-lg text-xs font-black uppercase tracking-wide transition-colors ${bookingsTab === st ? "bg-white dark:bg-slate-900 text-[#00A86B] shadow" : "text-slate-500 dark:text-slate-400 hover:text-slate-700"}`}>
            {st === "guest" ? (isAm ? "የእኔ ጥያቄዎች" : "My Requests") : (isAm ? "የተቀበልኩ" : "Host Inbox")}
          </button>
        ))}
      </div>

      {bookingsLoading && guestBookings.length === 0 && hostBookings.length === 0 ? (
        <div className="p-10 text-center text-xs text-slate-400 font-bold uppercase tracking-wider">{isAm ? "በመጫን ላይ..." : "Loading..."}</div>
      ) : bookingsTab === "guest" ? (
        guestBookings.length === 0 ? (
          <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-white/10 p-10 text-center">
            <CalendarCheck className="w-12 h-12 mx-auto mb-3 text-slate-300 dark:text-slate-600" />
            <p className="text-sm font-bold text-slate-700 dark:text-slate-300">{isAm ? "ምንም ቦታ ማስያዣ የለም" : "No booking requests yet"}</p>
            <p className="text-xs text-slate-400 mt-1">{isAm ? "የኪራይ ቤት ወይም አገልግሎት ሲያስይዙ እዚህ ይታያል" : "Requests you send on rentals & services appear here."}</p>
          </div>
        ) : (
          <div className="space-y-3">
            {guestBookings.map((b) => {
              const busy = busyId === `b${b.id}`;
              return (
                <div key={b.id} className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-white/10 p-4 sm:p-5">
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <div className="flex flex-wrap items-center gap-2 mb-1">
                        {renderStatusBadge(b.status, BOOKING_STATUS_STYLE, bookingStatusLabel(b.status, isAm))}
                        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wide">#{b.id}</span>
                      </div>
                      <p className="text-sm font-bold text-slate-900 dark:text-white truncate">{b.title_en}</p>
                      {b.location_label_en && <p className="text-xs text-slate-400 mt-0.5">{b.location_label_en}</p>}
                    </div>
                    <a href={`/listing/${b.listing_id}`} onClick={(e) => { e.preventDefault(); navigate(`/listing/${b.listing_id}`); }}
                      className="w-9 h-9 shrink-0 rounded-xl bg-slate-100 dark:bg-white/5 flex items-center justify-center text-slate-500 hover:text-[#00A86B] hover:bg-[#00A86B]/10 transition-colors">
                      <ExternalLink className="w-4 h-4" />
                    </a>
                  </div>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 mt-3 text-[11px]">
                    <div className="rounded-lg bg-slate-50 dark:bg-slate-800/60 px-3 py-2">
                      <p className="text-[9px] font-black uppercase tracking-wider text-slate-400">{isAm ? "የጊዜ ሰሌዳ" : "Schedule"}</p>
                      <p className="font-bold text-slate-700 dark:text-slate-300 mt-0.5">{renderBookingDates(b)}</p>
                    </div>
                    <div className="rounded-lg bg-slate-50 dark:bg-slate-800/60 px-3 py-2">
                      <p className="text-[9px] font-black uppercase tracking-wider text-slate-400">{isAm ? "ጠቅላላ" : "Total"}</p>
                      <p className="font-bold text-slate-700 dark:text-slate-300 mt-0.5">{fmtMoney(b.total_price, b.currency)}</p>
                    </div>
                    <div className="rounded-lg bg-slate-50 dark:bg-slate-800/60 px-3 py-2">
                      <p className="text-[9px] font-black uppercase tracking-wider text-slate-400">{isAm ? "እንግዶች" : "Guests"}</p>
                      <p className="font-bold text-slate-700 dark:text-slate-300 mt-0.5">{b.guests ?? "—"}</p>
                    </div>
                    <div className="rounded-lg bg-slate-50 dark:bg-slate-800/60 px-3 py-2">
                      <p className="text-[9px] font-black uppercase tracking-wider text-slate-400">{isAm ? "ጠየቀ" : "Requested"}</p>
                      <p className="font-bold text-slate-700 dark:text-slate-300 mt-0.5">{fmtDate(b.created_at)}</p>
                    </div>
                  </div>
                  <div className="flex flex-wrap gap-2 mt-3">
                    {b.status === "pending" && (
                      <button onClick={() => openPayModal(b)} disabled={busy}
                        className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#00A86B] text-white text-xs font-bold hover:bg-emerald-600 transition-colors disabled:opacity-50">
                        <Banknote className="w-3 h-3" /> {isAm ? "ክፍያ አስገባ" : "Submit Payment"}
                      </button>
                    )}
                    {["pending", "payment_submitted", "confirmed"].includes(b.status) && (
                      <button onClick={() => changeBookingStatus(b.id, "cancelled_by_guest")} disabled={busy}
                        className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-red-50 dark:bg-red-950/30 text-red-600 dark:text-red-400 text-xs font-bold hover:bg-red-100 dark:hover:bg-red-950/50 transition-colors disabled:opacity-50">
                        {busy ? <Loader2 className="w-3 h-3 animate-spin" /> : <XCircle className="w-3 h-3" />} {isAm ? "ሰርዝ" : "Cancel"}
                      </button>
                    )}
                    <span className="ml-auto text-[10px] text-slate-400">{isAm ? "ከባለቤቱ ጋር ለመነጋገር የማስታወቂያውን ገጽ ይጠቀሙ" : "Contact the host from the listing page"}</span>
                  </div>
                </div>
              );
            })}
          </div>
        )
      ) : hostBookings.length === 0 ? (
        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-white/10 p-10 text-center">
          <Bell className="w-12 h-12 mx-auto mb-3 text-slate-300 dark:text-slate-600" />
          <p className="text-sm font-bold text-slate-700 dark:text-slate-300">{isAm ? "ምንም ጥያቄ የለም" : "No booking requests on your listings"}</p>
          <p className="text-xs text-slate-400 mt-1">{isAm ? "ከእንግዶች የመጡ ጥያቄዎች እዚህ ይታያሉ" : "Requests from guests on your rentals appear here."}</p>
        </div>
      ) : (
        <div className="space-y-3">
          {hostBookings.map((b) => {
            const busy = busyId === `b${b.id}`;
            return (
              <div key={b.id} className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-white/10 p-4 sm:p-5">
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <div className="flex flex-wrap items-center gap-2 mb-1">
                      {renderStatusBadge(b.status, BOOKING_STATUS_STYLE, bookingStatusLabel(b.status, isAm))}
                      <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wide">#{b.id}</span>
                    </div>
                    <p className="text-sm font-bold text-slate-900 dark:text-white truncate">{b.title_en}</p>
                    <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5 flex items-center gap-1">
                      <User className="w-3 h-3" /> {b.guest_name || "Guest"}
                    </p>
                  </div>
                  <a href={`/listing/${b.listing_id}`} onClick={(e) => { e.preventDefault(); navigate(`/listing/${b.listing_id}`); }}
                    className="w-9 h-9 shrink-0 rounded-xl bg-slate-100 dark:bg-white/5 flex items-center justify-center text-slate-500 hover:text-[#00A86B] hover:bg-[#00A86B]/10 transition-colors">
                    <ExternalLink className="w-4 h-4" />
                  </a>
                </div>

                {b.guest_message && (
                  <p className="mt-2 text-xs text-slate-600 dark:text-slate-300 bg-slate-50 dark:bg-slate-800/60 rounded-lg px-3 py-2 italic">
                    "{b.guest_message}"
                  </p>
                )}

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 mt-3 text-[11px]">
                  <div className="rounded-lg bg-slate-50 dark:bg-slate-800/60 px-3 py-2">
                    <p className="text-[9px] font-black uppercase tracking-wider text-slate-400">{isAm ? "የጊዜ ሰሌዳ" : "Schedule"}</p>
                    <p className="font-bold text-slate-700 dark:text-slate-300 mt-0.5">{renderBookingDates(b)}</p>
                  </div>
                  <div className="rounded-lg bg-slate-50 dark:bg-slate-800/60 px-3 py-2">
                    <p className="text-[9px] font-black uppercase tracking-wider text-slate-400">{isAm ? "ጠቅላላ" : "Total"}</p>
                    <p className="font-bold text-slate-700 dark:text-slate-300 mt-0.5">{fmtMoney(b.total_price, b.currency)}</p>
                  </div>
                  <div className="rounded-lg bg-slate-50 dark:bg-slate-800/60 px-3 py-2">
                    <p className="text-[9px] font-black uppercase tracking-wider text-slate-400">{isAm ? "እንግዶች" : "Guests"}</p>
                    <p className="font-bold text-slate-700 dark:text-slate-300 mt-0.5">{b.guests ?? "—"}</p>
                  </div>
                  <div className="rounded-lg bg-slate-50 dark:bg-slate-800/60 px-3 py-2">
                    <p className="text-[9px] font-black uppercase tracking-wider text-slate-400">{isAm ? "ጠየቀ" : "Requested"}</p>
                    <p className="font-bold text-slate-700 dark:text-slate-300 mt-0.5">{fmtDate(b.created_at)}</p>
                  </div>
                </div>

                <div className="flex flex-wrap gap-2 mt-3">
                  {["pending", "payment_submitted"].includes(b.status) && (
                    <>
                      <button onClick={() => changeBookingStatus(b.id, "confirmed")} disabled={busy}
                        className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#00A86B] text-white text-xs font-bold hover:bg-emerald-600 transition-colors disabled:opacity-50">
                        {busy ? <Loader2 className="w-3 h-3 animate-spin" /> : <CheckCircle2 className="w-3 h-3" />} {isAm ? "አረጋግጥ" : "Confirm"}
                      </button>
                      <button onClick={() => changeBookingStatus(b.id, "rejected")} disabled={busy}
                        className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-red-50 dark:bg-red-950/30 text-red-600 dark:text-red-400 text-xs font-bold hover:bg-red-100 dark:hover:bg-red-950/50 transition-colors disabled:opacity-50">
                        {busy ? <Loader2 className="w-3 h-3 animate-spin" /> : <XCircle className="w-3 h-3" />} {isAm ? "ውድቅ" : "Reject"}
                      </button>
                    </>
                  )}
                  {b.status === "confirmed" && (
                    <>
                      <button onClick={() => changeBookingStatus(b.id, "completed")} disabled={busy}
                        className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-50 dark:bg-emerald-900/20 text-emerald-700 dark:text-emerald-400 text-xs font-bold hover:bg-emerald-100 dark:hover:bg-emerald-900/40 transition-colors disabled:opacity-50">
                        <CheckCheck className="w-3 h-3" /> {isAm ? "አጠናቅ" : "Complete"}
                      </button>
                      <a href={`tel:${b.contact_phone ?? ""}`} className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-50 dark:bg-emerald-900/20 text-emerald-700 dark:text-emerald-400 text-xs font-bold hover:bg-emerald-100 dark:hover:bg-emerald-900/40 transition-colors">
                        <Phone className="w-3 h-3" /> {isAm ? "ይደውሉ" : "Call"}
                      </a>
                    </>
                  )}
                  {b.status === "confirmed" && (
                    <button onClick={() => changeBookingStatus(b.id, "cancelled_by_host")} disabled={busy}
                      className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-red-50 dark:bg-red-950/30 text-red-600 dark:text-red-400 text-xs font-bold hover:bg-red-100 dark:hover:bg-red-950/50 transition-colors disabled:opacity-50">
                      <XCircle className="w-3 h-3" /> {isAm ? "ሰርዝ" : "Cancel"}
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950">
      <div className="max-w-2xl mx-auto px-4 py-8">
        <button
          onClick={() => navigate("/")}
          className="flex items-center gap-2 text-sm font-medium text-slate-500 dark:text-slate-400 hover:text-[#00A86B] transition-colors mb-6"
        >
          <ArrowLeft className="w-4 h-4" />
          {isAm ? "ወደ ዋና ገጽ ተመለስ" : "Back to Home"}
        </button>

        <div className="flex gap-2 mb-6 bg-white dark:bg-slate-900 border border-slate-200 dark:border-white/10 rounded-2xl p-1.5 overflow-x-auto">
          {TABS.map((tab) => (
            <button
              key={tab.key}
              onClick={() => setTab(tab.key)}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-black uppercase tracking-wide whitespace-nowrap transition-colors ${
                activeTab === tab.key
                  ? "bg-[#00A86B] text-white shadow-lg shadow-emerald-500/20"
                  : "text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800"
              }`}
            >
              <tab.icon className="w-4 h-4" />
              {isAm ? tab.labelAm : tab.labelEn}
            </button>
          ))}
        </div>

        {activeTab === "account" && renderAccountTab()}
        {activeTab === "listings" && renderListingsTab()}
        {activeTab === "bookings" && renderBookingsTab()}
      </div>

      {/* Payment evidence modal */}
      {payBooking && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={() => setPayBooking(null)} />
          <div className="relative w-full max-w-md bg-white dark:bg-slate-900 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-800 p-6 max-h-[90vh] overflow-y-auto">
            <div className="flex items-start justify-between mb-4">
              <div>
                <h3 className="text-lg font-black text-slate-900 dark:text-white">{isAm ? "ክፍያ ማረጋገጫ ያስገቡ" : "Submit Payment Evidence"}</h3>
                <p className="text-xs text-slate-400 mt-1">{isAm ? `ቦታ ማስያዣ #${payBooking.id}` : `Booking #${payBooking.id}`} · {fmtMoney(payBooking.total_price, payBooking.currency)}</p>
              </div>
              <button onClick={() => setPayBooking(null)} className="text-slate-400 hover:text-slate-600"><X className="w-5 h-5" /></button>
            </div>

            {(receipt.payment_phone || receipt.payment_bank_name) && (
              <div className="rounded-xl bg-amber-50 dark:bg-amber-900/10 border border-amber-200 dark:border-amber-900/30 p-4 mb-4">
                <p className="text-[10px] font-black uppercase tracking-wider text-amber-600 dark:text-amber-400 mb-2 flex items-center gap-1">
                  <Wallet className="w-3 h-3" /> {isAm ? "ክፍያ ወደዚህ ይላኩ" : "Pay to"}
                </p>
                <div className="space-y-1.5">
                  {receipt.payment_phone && (
                    <p className="text-xs font-bold text-slate-800 dark:text-slate-200 flex items-center gap-2">
                      <Phone className="w-3 h-3 text-amber-500" /> {receipt.payment_phone}
                    </p>
                  )}
                  {receipt.payment_bank_name && (
                    <p className="text-xs font-bold text-slate-800 dark:text-slate-200 flex items-center gap-2">
                      <Banknote className="w-3 h-3 text-amber-500" /> {receipt.payment_bank_name}
                      {receipt.payment_bank_account ? ` · ${receipt.payment_bank_account}` : ""}
                    </p>
                  )}
                </div>
              </div>
            )}

            <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-1">
              {isAm ? "የማስረጃ ፎቶዎች (ከ1 እስከ 3)" : "Evidence images (1–3)"}
            </label>
            <input
              type="file"
              accept="image/*"
              multiple
              onChange={(e) => setPayFiles(Array.from(e.target.files || []).slice(0, 3))}
              className="w-full text-sm text-slate-500 dark:text-slate-400 file:mr-3 file:px-3 file:py-2 file:rounded-lg file:border-0 file:bg-[#00A86B]/10 file:text-[#00A86B] file:text-xs file:font-bold hover:file:bg-[#00A86B]/20 transition-colors"
            />
            {payFiles.length > 0 && (
              <p className="text-[11px] text-[#00A86B] font-bold mt-1.5 flex items-center gap-1">
                <Upload className="w-3 h-3" /> {payFiles.length} {isAm ? "ፎቶዎች ተመርጠዋል" : "file(s) selected"}
              </p>
            )}

            <div className="mt-4">
              <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-1">{isAm ? "ማስታወሻ" : "Note (optional)"}</label>
              <input
                type="text"
                value={payNotes}
                onChange={(e) => setPayNotes(e.target.value)}
                placeholder={isAm ? "ለምሳሌ የክፍያ ማጣቀሻ" : "e.g. Telebirr reference"}
                className="w-full px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-sm text-slate-900 dark:text-white focus:ring-2 focus:ring-[#00A86B] outline-none"
              />
            </div>

            <div className="flex gap-3 mt-6">
              <button
                onClick={() => setPayBooking(null)}
                className="flex-1 px-4 py-2.5 rounded-lg border border-slate-200 dark:border-slate-700 text-sm font-medium text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
              >
                {isAm ? "ሰርዝ" : "Cancel"}
              </button>
              <button
                onClick={submitPayment}
                disabled={paySaving}
                className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg bg-[#00A86B] text-white text-sm font-bold hover:bg-emerald-600 transition-colors disabled:opacity-50"
              >
                {paySaving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Banknote className="w-4 h-4" />}
                {isAm ? "አስገባ" : "Submit"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default MyAccountPage;