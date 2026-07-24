/**
 * PromoTickerManager.tsx
 * Malazone.com — Super Admin Promo Ticker Management
 * © 2026 Malazone Technologies PLC
 */

import React, { useState, useEffect } from "react";
import {
  MessageSquare, Plus, Trash2, Edit3, Save, X,
  AlertCircle, CheckCircle2, Eye, Megaphone, RefreshCcw,
} from "lucide-react";

interface PromoItem {
  id?: number;
  text_key: string;
  en_value: string;
  am_value: string;
  section: string;
  sort_order: number;
}

interface EditingItem {
  index: number | null;
  en_value: string;
  am_value: string;
}

const PROMO_PREFIX = "promo_ticker_";

const extractSortOrder = (key: string): number => {
  const num = parseInt(key.replace(PROMO_PREFIX, ""), 10);
  return isNaN(num) ? 999 : num;
};

const PromoPreview: React.FC<{ items: PromoItem[] }> = ({ items }) => {
  const [current, setCurrent] = useState(0);
  const [visible, setVisible] = useState(true);

  useEffect(() => {
    if (items.length <= 1) return;
    const timer = setInterval(() => {
      setVisible(false);
      setTimeout(() => {
        setCurrent((c) => (c + 1) % items.length);
        setVisible(true);
      }, 400);
    }, 3500);
    return () => clearInterval(timer);
  }, [items.length]);

  if (!items.length) {
    return (
      <div className="w-full bg-[#0B132B] rounded-xl py-4 px-6 flex items-center justify-center">
        <p className="text-malazone-navy text-xs font-bold uppercase tracking-widest">
          No promo texts yet — add one below
        </p>
      </div>
    );
  }

  return (
    <div className="w-full bg-[#0B132B] border border-emerald-600/30 rounded-xl overflow-hidden">
      <div className="px-4 py-1.5 border-b border-emerald-600/20 flex items-center gap-2">
        <Eye className="w-3 h-3 text-emerald-400" />
        <span className="text-[10px] font-black text-emerald-400 uppercase tracking-widest">
          Live Preview — Sliding Ticker
        </span>
        <span className="ml-auto text-[10px] text-malazone-navy font-bold">
          {current + 1} / {items.length}
        </span>
      </div>
      <div className="relative py-4 px-6 overflow-hidden h-14 flex items-center">
        <p
          style={{
            transition: "opacity 0.35s ease, transform 0.35s ease",
            opacity: visible ? 1 : 0,
            transform: visible ? "translateY(0)" : "translateY(-10px)",
          }}
          className="text-xs sm:text-[13px] font-bold tracking-widest text-white uppercase whitespace-nowrap"
        >
          {items[current]?.en_value || ""}
        </p>
      </div>
      {items.length > 1 && (
        <div className="flex items-center justify-center gap-1.5 pb-3">
          {items.map((_, i) => (
            <button
              key={i}
              onClick={() => setCurrent(i)}
              className="rounded-full transition-all duration-300"
              style={{
                width: i === current ? "16px" : "6px",
                height: "6px",
                backgroundColor: i === current ? "#34d399" : "#374151",
              }}
            />
          ))}
        </div>
      )}
    </div>
  );
};

interface EditFormProps {
  editing: EditingItem;
  setEditing: (e: EditingItem | null) => void;
  saving: boolean;
  onSave: () => void;
  label: string;
  isNew?: boolean;
}

const EditForm: React.FC<EditFormProps> = ({
  editing, setEditing, saving, onSave, label, isNew,
}) => (
  <div className={`rounded-xl border-2 p-5 space-y-4 transition-all duration-200 ${
    isNew ? "border-[#00A86B]/40 bg-emerald-50/40" : "border-blue-300/50 bg-blue-50/30"
  }`}>
    <div className="flex items-center justify-between">
      <span className={`text-xs font-black uppercase tracking-widest ${isNew ? "text-[#00A86B]" : "text-blue-600"}`}>
        {label}
      </span>
      <button onClick={() => setEditing(null)} className="p-1.5 rounded-lg hover:bg-slate-200 text-malazone-navy transition-colors">
        <X className="w-4 h-4" />
      </button>
    </div>

    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
      <div className="space-y-2">
        <label className="text-xs font-black text-malazone-navy uppercase tracking-wider flex items-center gap-1.5">
          <span className="w-5 h-5 rounded bg-blue-100 text-blue-600 text-[9px] flex items-center justify-center font-black">EN</span>
          English Text
        </label>
        <input
          type="text"
          value={editing.en_value}
          onChange={(e) => setEditing({ ...editing, en_value: e.target.value })}
          placeholder="e.g. ✨ MALAZONE: Buy & Sell without Middlemen!"
          autoFocus={isNew}
          className="w-full px-4 py-3 rounded-xl border border-slate-200 bg-white focus:bg-white focus:ring-2 focus:ring-[#00A86B]/20 focus:border-[#00A86B] outline-none transition-all text-malazone-navy text-sm"
        />
      </div>
      <div className="space-y-2">
        <label className="text-xs font-black text-malazone-navy uppercase tracking-wider flex items-center gap-1.5">
          <span className="w-5 h-5 rounded bg-amber-100 text-amber-600 text-[9px] flex items-center justify-center font-black">AM</span>
          Amharic Text
        </label>
        <input
          type="text"
          value={editing.am_value}
          onChange={(e) => setEditing({ ...editing, am_value: e.target.value })}
          placeholder="e.g. ✨ መላዞን: ያለምንም ደላላ ይሸጡ ይግዙ!"
          className="w-full px-4 py-3 rounded-xl border border-slate-200 bg-white focus:bg-white focus:ring-2 focus:ring-[#00A86B]/20 focus:border-[#00A86B] outline-none transition-all text-malazone-navy text-sm"
        />
      </div>
    </div>

    <div className="flex justify-end gap-3">
      <button
        onClick={() => setEditing(null)}
        className="px-4 py-2.5 rounded-xl border border-slate-200 text-malazone-navy hover:bg-slate-100 transition-all text-sm font-bold"
      >
        Cancel
      </button>
      <button
        onClick={onSave}
        disabled={saving || !editing.en_value.trim() || !editing.am_value.trim()}
        className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#00A86B] hover:bg-[#00A86B]/90 text-white shadow-lg shadow-[#00A86B]/25 transition-all font-bold text-sm disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {saving ? <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : <Save className="w-4 h-4" />}
        {saving ? "Saving…" : isNew ? "Add Promo" : "Save Changes"}
      </button>
    </div>
  </div>
);

const PromoTickerManager: React.FC = () => {
  const [items, setItems] = useState<PromoItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState<number | null>(null);
  const [editing, setEditing] = useState<EditingItem | null>(null);
  const [message, setMessage] = useState<{ text: string; type: "success" | "error" } | null>(null);

  const flash = (text: string, type: "success" | "error") => {
    setMessage({ text, type });
    setTimeout(() => setMessage(null), 3500);
  };

  const fetchItems = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/admin/translations", {
        credentials: "include",
      });
      const data = await res.json();
      if (data.success) {
        const promos: PromoItem[] = data.data
          .filter((t: any) => t.text_key.startsWith(PROMO_PREFIX))
          .map((t: any) => ({ ...t, sort_order: extractSortOrder(t.text_key) }))
          .sort((a: PromoItem, b: PromoItem) => a.sort_order - b.sort_order);
        setItems(promos);
      }
    } catch (e) {
      flash("Failed to load promo tickers.", "error");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchItems(); }, []);

  const handleSave = async () => {
    if (!editing) return;
    if (!editing.en_value.trim() || !editing.am_value.trim()) {
      flash("Both English and Amharic texts are required.", "error");
      return;
    }
    setSaving(true);
    try {
      if (editing.index === null) {
        const maxOrder = items.length > 0 ? Math.max(...items.map((i) => i.sort_order)) : 0;
        const text_key = `${PROMO_PREFIX}${maxOrder + 1}`;
        const res = await fetch("/api/admin/translations", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          credentials: "include",
          body: JSON.stringify({ text_key, en_value: editing.en_value.trim(), am_value: editing.am_value.trim(), section: "promo_ticker" }),
        });
        const data = await res.json();
        if (data.success) { flash("Promo text added!", "success"); setEditing(null); fetchItems(); }
        else flash(data.message || "Failed to add.", "error");
      } else {
        const item = items[editing.index];
        const res = await fetch(`/api/admin/translations/${item.id}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          credentials: "include",
          body: JSON.stringify({ text_key: item.text_key, en_value: editing.en_value.trim(), am_value: editing.am_value.trim(), section: "promo_ticker" }),
        });
        const data = await res.json();
        if (data.success) { flash("Promo text updated!", "success"); setEditing(null); fetchItems(); }
        else flash(data.message || "Failed to update.", "error");
      }
    } catch (e) {
      flash("An error occurred while saving.", "error");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (item: PromoItem, idx: number) => {
    if (!item.id) return;
    setDeleting(idx);
    try {
      const res = await fetch(`/api/admin/translations/${item.id}`, {
        method: "DELETE",
        credentials: "include",
      });
      const data = await res.json();
      if (data.success) { flash("Promo text removed.", "success"); fetchItems(); }
      else flash(data.message || "Failed to delete.", "error");
    } catch (e) {
      flash("An error occurred while deleting.", "error");
    } finally {
      setDeleting(null);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="animate-spin rounded-full h-10 w-10 border-4 border-[#00A86B]/30 border-t-[#00A86B]" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
        {/* Header */}
        <div className="p-6 border-b border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-gradient-to-r from-slate-50 to-emerald-50/30">
          <div className="space-y-1">
            <h2 className="text-xl font-black text-malazone-navy tracking-tight flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-[#00A86B]/10 flex items-center justify-center">
                <Megaphone className="w-5 h-5 text-[#00A86B]" />
              </div>
              Promo Ticker Manager
            </h2>
            <p className="text-xs font-bold text-malazone-navy uppercase tracking-widest pl-[52px]">
              Rotating announcement bar — texts display consecutively
            </p>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={fetchItems}
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-malazone-navy hover:text-malazone-navy transition-all text-sm font-bold"
            >
              <RefreshCcw className="w-4 h-4" />
              Refresh
            </button>
            {items.length < 10 && (
              <button
                onClick={() => setEditing({ index: null, en_value: "", am_value: "" })}
                disabled={!!editing}
                className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#00A86B] hover:bg-[#00A86B]/90 text-white shadow-lg shadow-[#00A86B]/25 transition-all font-bold text-sm disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <Plus className="w-4 h-4" />
                Add Promo Text
              </button>
            )}
          </div>
        </div>

        {/* Flash */}
        {message && (
          <div className={`mx-6 mt-4 p-4 rounded-xl flex items-center gap-3 text-sm font-bold ${
            message.type === "success" ? "bg-green-50 text-green-700 border border-green-200" : "bg-red-50 text-red-700 border border-red-200"
          }`}>
            {message.type === "success" ? <CheckCircle2 className="w-5 h-5 shrink-0" /> : <AlertCircle className="w-5 h-5 shrink-0" />}
            {message.text}
          </div>
        )}

        {/* Preview */}
        <div className="p-6 border-b border-slate-100">
          <PromoPreview items={items} />
        </div>

        {/* List */}
        <div className="p-6 space-y-3">
          {items.length === 0 && !editing && (
            <div className="text-center py-12">
              <div className="w-16 h-16 rounded-2xl bg-slate-100 flex items-center justify-center mx-auto mb-4">
                <MessageSquare className="w-8 h-8 text-malazone-navy" />
              </div>
              <p className="text-malazone-navy font-bold">No promo texts yet</p>
              <p className="text-malazone-navy text-sm mt-1">Click "Add Promo Text" to create your first sliding announcement</p>
            </div>
          )}

          {items.map((item, idx) => (
            <div key={item.id ?? idx}>
              {editing?.index === idx ? (
                <EditForm editing={editing} setEditing={setEditing} saving={saving} onSave={handleSave} label={`Editing Promo #${idx + 1}`} />
              ) : (
                <div className="group flex items-start gap-3 p-4 rounded-xl border border-slate-200 bg-slate-50/50 hover:border-[#00A86B]/30 hover:bg-emerald-50/20 transition-all duration-200">
                  <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-[#00A86B]/10 text-[#00A86B] font-black text-sm shrink-0 mt-0.5">
                    {idx + 1}
                  </div>
                  <div className="flex-1 min-w-0 space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="text-[10px] font-black uppercase tracking-widest text-malazone-navy w-6">EN</span>
                      <p className="text-sm font-bold text-malazone-navy truncate">{item.en_value}</p>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-[10px] font-black uppercase tracking-widest text-malazone-navy w-6">AM</span>
                      <p className="text-sm text-malazone-navy truncate font-medium">{item.am_value}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 shrink-0 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                    <button
                      onClick={() => setEditing({ index: idx, en_value: item.en_value, am_value: item.am_value })}
                      disabled={!!editing || deleting !== null}
                      className="p-2 rounded-lg bg-blue-50 hover:bg-blue-100 text-blue-600 transition-colors disabled:opacity-40"
                      title="Edit"
                    >
                      <Edit3 className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleDelete(item, idx)}
                      disabled={!!editing || deleting !== null}
                      className="p-2 rounded-lg bg-red-50 hover:bg-red-100 text-red-500 transition-colors disabled:opacity-40"
                      title="Delete"
                    >
                      {deleting === idx
                        ? <div className="w-4 h-4 border-2 border-red-400/30 border-t-red-500 rounded-full animate-spin" />
                        : <Trash2 className="w-4 h-4" />}
                    </button>
                  </div>
                </div>
              )}
            </div>
          ))}

          {editing?.index === null && (
            <EditForm editing={editing} setEditing={setEditing} saving={saving} onSave={handleSave} label="New Promo Text" isNew />
          )}
        </div>
      </div>

      {/* Info */}
      <div className="bg-gradient-to-br from-[#00A86B]/5 to-emerald-50 rounded-2xl border border-[#00A86B]/20 p-6">
        <h3 className="text-sm font-black text-[#00A86B] uppercase tracking-widest mb-3 flex items-center gap-2">
          <Eye className="w-4 h-4" />
          How It Works
        </h3>
        <ul className="space-y-2 text-sm text-malazone-navy">
          <li className="flex items-start gap-2"><span className="text-[#00A86B] font-black mt-0.5">→</span> Texts rotate automatically in the header bar every few seconds.</li>
          <li className="flex items-start gap-2"><span className="text-[#00A86B] font-black mt-0.5">→</span> Old text fades up, new text slides in — a smooth consecutive transition.</li>
          <li className="flex items-start gap-2"><span className="text-[#00A86B] font-black mt-0.5">→</span> Up to 10 messages, displayed in order (1, 2, 3… then back to 1).</li>
          <li className="flex items-start gap-2"><span className="text-[#00A86B] font-black mt-0.5">→</span> Both EN and AM are required — the site uses the active language automatically.</li>
        </ul>
      </div>
    </div>
  );
};

export default PromoTickerManager;
