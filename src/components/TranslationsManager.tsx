import React, { useState, useEffect } from "react";
import { Globe, Plus, Search, Edit2, Trash2, Check, X, AlertCircle } from "lucide-react";
import { useAdminLanguage } from "../contexts/AdminLanguageContext";

interface Translation {
  id: number;
  text_key: string;
  en_value: string;
  am_value: string;
  section: string;
}

const TranslationsManager: React.FC = () => {
  const { t } = useAdminLanguage();
  const [translations, setTranslations] = useState<Translation[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  // Modal / Form state
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [formData, setFormData] = useState({ text_key: "", en_value: "", am_value: "", section: "general" });

  // Toast state
  const [toast, setToast] = useState<{ message: string, type: 'success' | 'error' } | null>(null);

  const fetchTranslations = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/admin/translations", {
        credentials: "include",
      });
      const data = await res.json();
      if (data.success) {
        setTranslations(data.data);
      }
    } catch (err) {
      showToast("Failed to fetch translations", "error");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTranslations();
  }, []);

  const showToast = (message: string, type: 'success' | 'error') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3000);
  };

  const handleOpenModal = (t?: Translation) => {
    if (t) {
      setEditingId(t.id);
      setFormData({ text_key: t.text_key, en_value: t.en_value, am_value: t.am_value, section: t.section });
    } else {
      setEditingId(null);
      setFormData({ text_key: "", en_value: "", am_value: "", section: "general" });
    }
    setIsModalOpen(true);
  };

  const handleSave = async () => {
    if (!formData.text_key || !formData.en_value || !formData.am_value) {
      showToast("Please fill all required fields", "error");
      return;
    }

    const url = editingId ? `/api/admin/translations/${editingId}` : "/api/admin/translations";
    const method = editingId ? "PUT" : "POST";

    try {
      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify(formData)
      });
      const data = await res.json();

      if (data.success) {
        showToast(data.message, "success");
        setIsModalOpen(false);
        fetchTranslations();
      } else {
        showToast(data.message || "Save failed", "error");
      }
    } catch (err) {
      showToast("Network error", "error");
    }
  };

  const handleDelete = async (id: number) => {
    if (!window.confirm("Are you sure you want to delete this text? This might break the UI if it's currently in use.")) {
      return;
    }

    try {
      const res = await fetch(`/api/admin/translations/${id}`, {
        method: "DELETE",
        credentials: "include",
      });
      const data = await res.json();
      if (data.success) {
        showToast(data.message, "success");
        fetchTranslations();
      } else {
        showToast(data.message || "Delete failed", "error");
      }
    } catch (err) {
      showToast("Network error", "error");
    }
  };

  const filteredTranslations = translations.filter(t =>
    t.text_key.toLowerCase().includes(search.toLowerCase()) ||
    t.en_value.toLowerCase().includes(search.toLowerCase()) ||
    t.am_value.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-6 relative">
      {/* Toast Notification */}
      {toast && (
        <div className={`fixed top-6 right-6 z-[100] flex items-center gap-3 px-6 py-4 rounded-2xl shadow-xl transition-all duration-300 animate-in slide-in-from-right-8 ${toast.type === 'success' ? 'bg-[#00A86B] text-white' : 'bg-red-500 text-white'
          }`}>
          {toast.type === 'success' ? <Check className="w-5 h-5" /> : <AlertCircle className="w-5 h-5" />}
          <span className="font-bold text-sm">{toast.message}</span>
        </div>
      )}

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl sm:text-2xl font-black text-malazone-navy tracking-tight flex items-center gap-2">
            <Globe className="w-6 h-6 text-[#00A86B]" />
            Localization & Content
          </h2>
          <p className="text-sm text-malazone-navy font-medium mt-1">
            Manage all static texts, labels, and translations across the platform.
          </p>
        </div>

        <button
          onClick={() => handleOpenModal()}
          className="inline-flex items-center justify-center gap-2 px-5 py-3 rounded-xl bg-[#00A86B] hover:bg-[#008F5B] text-white font-bold text-sm transition-all shadow-sm hover:shadow-md active:scale-95"
        >
          <Plus className="w-4 h-4" />
          Add New Text
        </button>
      </div>

      {/* Search Bar */}
      <div className="bg-white p-2 rounded-2xl border border-slate-200 shadow-sm flex items-center gap-3">
        <div className="pl-4">
          <Search className="w-5 h-5 text-malazone-navy" />
        </div>
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search by key, English text, or Amharic text..."
          className="w-full bg-transparent border-none focus:outline-none text-malazone-navy font-medium py-2 pr-4 placeholder:text-malazone-navy"
        />
      </div>

      {/* Data Table */}
      <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-slate-100 bg-slate-50/50">
                <th className="px-6 py-4 text-xs font-black text-malazone-navy uppercase tracking-wider">Key / Section</th>
                <th className="px-6 py-4 text-xs font-black text-malazone-navy uppercase tracking-wider">English</th>
                <th className="px-6 py-4 text-xs font-black text-malazone-navy uppercase tracking-wider">Amharic</th>
                <th className="px-6 py-4 text-xs font-black text-malazone-navy uppercase tracking-wider text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {loading ? (
                <tr>
                  <td colSpan={4} className="px-6 py-12 text-center text-malazone-navy font-medium">Loading translations...</td>
                </tr>
              ) : filteredTranslations.length === 0 ? (
                <tr>
                  <td colSpan={4} className="px-6 py-12 text-center text-malazone-navy font-medium">No texts found.</td>
                </tr>
              ) : (
                filteredTranslations.map(item => (
                  <tr key={item.id} className="hover:bg-slate-50/50 transition-colors group">
                    <td className="px-6 py-4">
                      <div className="font-bold text-malazone-navy">{item.text_key}</div>
                      <div className="text-xs font-semibold text-malazone-navy uppercase tracking-wider mt-1">{item.section}</div>
                    </td>
                    <td className="px-6 py-4 text-sm text-malazone-navy font-medium max-w-[300px] truncate" title={item.en_value}>
                      {item.en_value}
                    </td>
                    <td className="px-6 py-4 text-sm text-malazone-navy font-medium max-w-[300px] truncate font-['Noto_Sans_Ethiopic']" title={item.am_value}>
                      {item.am_value}
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button
                          onClick={() => handleOpenModal(item)}
                          className="p-2 text-malazone-navy hover:text-[#00A86B] hover:bg-[#00A86B]/10 rounded-lg transition-colors"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDelete(item.id)}
                          className="p-2 text-malazone-navy hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Edit/Create Modal (Glassmorphism) */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm" onClick={() => setIsModalOpen(false)} />
          <div className="relative bg-white rounded-3xl shadow-2xl w-full max-w-2xl border border-slate-200 overflow-hidden animate-in zoom-in-95 duration-200">
            <div className="p-6 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
              <h3 className="text-xl font-black text-malazone-navy">
                {editingId ? "Edit Text" : "Add New Text"}
              </h3>
              <button onClick={() => setIsModalOpen(false)} className="p-2 text-malazone-navy hover:text-malazone-navy hover:bg-slate-200 rounded-xl transition-colors">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 space-y-5">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <div className="space-y-2">
                  <label className="text-xs font-bold text-malazone-navy uppercase tracking-wider">Text Key (Unique)</label>
                  <input
                    type="text"
                    value={formData.text_key}
                    onChange={(e) => setFormData({ ...formData, text_key: e.target.value })}
                    placeholder="e.g. nav.home"
                    className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:border-[#00A86B] focus:ring-1 focus:ring-[#00A86B] outline-none font-medium text-malazone-navy transition-all"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-bold text-malazone-navy uppercase tracking-wider">Section Group</label>
                  <input
                    type="text"
                    value={formData.section}
                    onChange={(e) => setFormData({ ...formData, section: e.target.value })}
                    placeholder="e.g. footer, nav, general"
                    className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:border-[#00A86B] focus:ring-1 focus:ring-[#00A86B] outline-none font-medium text-malazone-navy transition-all"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-xs font-bold text-malazone-navy uppercase tracking-wider">English Text</label>
                <textarea
                  value={formData.en_value}
                  onChange={(e) => setFormData({ ...formData, en_value: e.target.value })}
                  rows={3}
                  className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:border-[#00A86B] focus:ring-1 focus:ring-[#00A86B] outline-none font-medium text-malazone-navy transition-all resize-none"
                />
              </div>

              <div className="space-y-2">
                <label className="text-xs font-bold text-malazone-navy uppercase tracking-wider">Amharic Text</label>
                <textarea
                  value={formData.am_value}
                  onChange={(e) => setFormData({ ...formData, am_value: e.target.value })}
                  rows={3}
                  className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:border-[#00A86B] focus:ring-1 focus:ring-[#00A86B] outline-none font-medium text-malazone-navy font-['Noto_Sans_Ethiopic'] transition-all resize-none"
                />
              </div>
            </div>

            <div className="p-6 border-t border-slate-100 bg-slate-50/50 flex justify-end gap-3">
              <button
                onClick={() => setIsModalOpen(false)}
                className="px-6 py-3 rounded-xl font-bold text-malazone-navy hover:bg-slate-200 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleSave}
                className="px-6 py-3 rounded-xl font-bold text-white bg-[#00A86B] hover:bg-[#008F5B] shadow-sm hover:shadow-md transition-all active:scale-95 flex items-center gap-2"
              >
                <Check className="w-4 h-4" />
                Save Translation
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default TranslationsManager;
