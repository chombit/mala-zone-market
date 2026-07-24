import React, { useState, useEffect } from "react";
import { MessageSquare, Save, AlertCircle } from "lucide-react";

interface Translation {
  id?: number;
  text_key: string;
  en_value: string;
  am_value: string;
  section: string;
}

const TickerManager: React.FC = () => {
  const [tickerId, setTickerId] = useState<number | null>(null);
  const [enValue, setEnValue] = useState("");
  const [amValue, setAmValue] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<{ text: string; type: "success" | "error" } | null>(null);

  useEffect(() => {
    fetchTicker();
  }, []);

  const fetchTicker = async () => {
    try {
      const res = await fetch("/api/admin/translations", {
        credentials: "include",
      });
      const data = await res.json();
      if (data.success) {
        const ticker = data.data.find((t: Translation) => t.text_key === "ticker");
        if (ticker) {
          setTickerId(ticker.id);
          setEnValue(ticker.en_value);
          setAmValue(ticker.am_value);
        }
      }
    } catch (e) {
      console.error("Failed to fetch ticker text", e);
      setMessage({ text: "Failed to load ticker data.", type: "error" });
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    setSaving(true);
    setMessage(null);

    const payload = {
      text_key: "ticker",
      en_value: enValue || "Welcome to Malazone!",
      am_value: amValue || "እንኳን ወደ መላዞን በደህና መጡ!",
      section: "general",
    };

    try {
      const url = tickerId ? `/api/admin/translations/${tickerId}` : "/api/admin/translations";
      const method = tickerId ? "PUT" : "POST";

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      if (data.success) {
        if (!tickerId && data.id) setTickerId(data.id);
        setMessage({ text: "Ticker updated successfully!", type: "success" });
      } else {
        setMessage({ text: data.message || "Failed to save.", type: "error" });
      }
    } catch (e) {
      console.error("Save error", e);
      setMessage({ text: "An error occurred while saving.", type: "error" });
    } finally {
      setSaving(false);
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
    <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
      <div className="p-6 border-b border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-slate-50/50">
        <div className="space-y-1">
          <h2 className="text-xl font-black text-malazone-navy tracking-tight flex items-center gap-3">
            <MessageSquare className="w-6 h-6 text-[#00A86B]" />
            Top Sliding Ticker (Announcement Bar)
          </h2>
          <p className="text-xs font-bold text-malazone-navy uppercase tracking-widest">
            Manage the scrolling text at the very top of the site
          </p>
        </div>
        <button
          onClick={handleSave}
          disabled={saving}
          className="flex items-center gap-3 px-5 py-2.5 rounded-xl bg-[#00A86B] hover:bg-[#00A86B]/90 text-white shadow-xl shadow-[#00A86B]/25 transition-all font-bold text-sm disabled:opacity-50"
        >
          {saving ? <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : <Save className="w-4 h-4" />}
          {saving ? "Saving..." : "Save Ticker"}
        </button>
      </div>

      <div className="p-6 space-y-6">
        {message && (
          <div className={`p-4 rounded-xl flex items-center gap-3 text-sm font-bold ${
            message.type === 'success' ? 'bg-green-50 text-green-700 border border-green-200' : 'bg-red-50 text-red-700 border border-red-200'
          }`}>
            <AlertCircle className="w-5 h-5" />
            {message.text}
          </div>
        )}

        <div className="space-y-4">
          <div className="space-y-2">
            <label className="text-sm font-bold text-malazone-navy uppercase tracking-wider">English Ticker Text</label>
            <input
              type="text"
              value={enValue}
              onChange={(e) => setEnValue(e.target.value)}
              placeholder="e.g. ✨ MALAZONE: Directly Buy, Sell..."
              className="w-full px-4 py-3 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:ring-2 focus:ring-[#00A86B]/20 focus:border-[#00A86B] outline-none transition-all text-malazone-navy"
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-bold text-malazone-navy uppercase tracking-wider">Amharic Ticker Text</label>
            <input
              type="text"
              value={amValue}
              onChange={(e) => setAmValue(e.target.value)}
              placeholder="e.g. ✨ መላዞን: በሃዋሳ እና በሲዳማ ክልል..."
              className="w-full px-4 py-3 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:ring-2 focus:ring-[#00A86B]/20 focus:border-[#00A86B] outline-none transition-all text-malazone-navy"
            />
          </div>
        </div>
        
        <div className="mt-8 p-6 rounded-xl bg-slate-900 text-center overflow-hidden border border-slate-800 relative">
          <p className="text-xs font-bold text-malazone-navy uppercase tracking-widest mb-4">Preview (Sliding Effect)</p>
          <div className="w-full bg-[#0B132B] border-b border-emerald-600/30 py-4 px-6 overflow-hidden rounded-lg">
            <p className="text-xs sm:text-[13px] font-bold tracking-widest text-white uppercase whitespace-nowrap animate-marquee">
              {enValue || "Ticker Preview..."}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TickerManager;
