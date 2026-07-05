/**
 * BannerManager.tsx
 * Malazone.com — Admin Interface for Managing Promo Banners
 * © 2026 Malazone Technologies PLC
 */

import React, { useState, useEffect } from "react";
import { Plus, Edit3, Trash2, Save, X, Image } from "lucide-react";

interface Banner {
  id?: number;
  title_en: string;
  title_am: string;
  subtitle_en: string;
  subtitle_am: string;
  link_url: string;
  image_url: string;
  display_order: number;
  is_active: boolean;
}

const BannerManager: React.FC = () => {
  const [banners, setBanners] = useState<Banner[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingBanner, setEditingBanner] = useState<Banner | undefined>();
  const [loading, setLoading] = useState(true);
  const [formData, setFormData] = useState<Banner>({
    title_en: "",
    title_am: "",
    subtitle_en: "",
    subtitle_am: "",
    link_url: "",
    image_url: "",
    display_order: 0,
    is_active: true
  });

  const loadBanners = async () => {
    try {
      const res = await fetch("/api/site/promo-banners/all");
      if (!res.ok) throw new Error("API not ok");
      const data = await res.json();
      if (data.success) {
        setBanners(data.data);
        localStorage.setItem("malazone_banners", JSON.stringify(data.data));
        return;
      }
      throw new Error("API unsuccessful");
    } catch (e) {
      console.error("Failed to load banners, using local fallback", e);
      const localData = localStorage.getItem("malazone_banners");
      if (localData) {
        setBanners(JSON.parse(localData));
      } else {
        const defaultData = [
          { id: 1, title_en: "Welcome", title_am: "እንኳን ደህና መጡ", subtitle_en: "Find anything here", subtitle_am: "", link_url: "/", image_url: "https://images.unsplash.com/photo-1557804506-669a67965ba0?auto=format&fit=crop&q=80", display_order: 1, is_active: true }
        ];
        setBanners(defaultData);
        localStorage.setItem("malazone_banners", JSON.stringify(defaultData));
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadBanners();
  }, []);

  const handleSave = async () => {
    try {
      let isLocalFallback = false;
      try {
        let res;
        if (editingBanner) {
          res = await fetch(`/api/site/promo-banners/${editingBanner.id}`, {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(formData)
          });
        } else {
          res = await fetch("/api/site/promo-banners", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(formData)
          });
        }
        if (!res.ok) throw new Error("API failed");
      } catch (apiError) {
        isLocalFallback = true;
      }

      if (isLocalFallback) {
        let current = JSON.parse(localStorage.getItem("malazone_banners") || "[]");
        if (editingBanner) {
          current = current.map((c: any) => c.id === editingBanner.id ? { ...formData, id: c.id } : c);
        } else {
          current.push({ ...formData, id: Date.now() });
        }
        localStorage.setItem("malazone_banners", JSON.stringify(current));
      }

      setIsModalOpen(false);
      loadBanners();
    } catch (e) {
      console.error("Failed to save banner", e);
    }
  };

  const handleDelete = async (id: number) => {
    if (!window.confirm("Are you sure you want to delete this banner?")) return;
    try {
      try {
        const res = await fetch(`/api/site/promo-banners/${id}`, { method: "DELETE" });
        if (!res.ok) throw new Error("API failed");
      } catch (apiError) {
        let current = JSON.parse(localStorage.getItem("malazone_banners") || "[]");
        current = current.filter((c: any) => c.id !== id);
        localStorage.setItem("malazone_banners", JSON.stringify(current));
      }
      loadBanners();
    } catch (e) {
      console.error("Failed to delete banner", e);
    }
  };

  const handleEdit = (banner: Banner) => {
    setEditingBanner(banner);
    setFormData(banner);
    setIsModalOpen(true);
  };

  const handleAdd = () => {
    setEditingBanner(undefined);
    setFormData({
      title_en: "",
      title_am: "",
      subtitle_en: "",
      subtitle_am: "",
      link_url: "",
      image_url: "",
      display_order: banners.length,
      is_active: true
    });
    setIsModalOpen(true);
  };

  return (
    <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-sm">
      <div className="p-6 border-b border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-slate-50/50">
        <div className="space-y-1">
          <h2 className="text-xl font-black text-malazone-navy tracking-tight flex items-center gap-3">
            <Image className="w-6 h-6 text-[#00A86B]" />
            Promo Banners
          </h2>
          <p className="text-xs font-bold text-malazone-navy uppercase tracking-widest">Manage promotional banners</p>
        </div>
        <button
          onClick={handleAdd}
          className="flex items-center gap-3 px-5 py-2.5 rounded-xl bg-[#00A86B] hover:bg-[#00A86B]/90 text-white shadow-xl shadow-[#00A86B]/25 transition-all font-bold text-sm"
        >
          <Plus className="w-4 h-4" />
          Add Banner
        </button>
      </div>

      <div className="p-6">
        {loading ? (
          <div className="flex items-center justify-center py-10">
            <div className="animate-spin rounded-full h-10 w-10 border-4 border-[#00A86B]/30 border-t-[#00A86B]" />
          </div>
        ) : (
          <div className="space-y-4">
            {banners.map((banner) => (
              <div key={banner.id} className="border border-slate-200 rounded-xl p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 hover:border-[#00A86B]/30 transition-all">
                <div className="flex items-center gap-4">
                  <img src={banner.image_url} alt={banner.title_en} className="w-20 h-16 object-cover rounded-lg" />
                  <div className="space-y-1">
                    <p className="font-bold text-malazone-navy">{banner.title_en}</p>
                    <p className="text-xs text-malazone-navy">{banner.title_am}</p>
                    {banner.subtitle_en && <p className="text-xs text-malazone-navy">{banner.subtitle_en}</p>}
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <button onClick={() => handleEdit(banner)} className="p-2 bg-slate-50 border border-slate-200 rounded-lg text-malazone-navy hover:bg-slate-100 transition-all">
                    <Edit3 className="w-4 h-4" />
                  </button>
                  <button onClick={() => handleDelete(banner.id!)} className="p-2 bg-red-50 border border-red-200 rounded-lg text-red-600 hover:bg-red-100 transition-all">
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Banner Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm">
          <div className="bg-white border border-slate-200 rounded-2xl shadow-2xl w-full max-w-lg animate-in fade-in zoom-in duration-200 max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-slate-200 flex items-center justify-between">
              <h3 className="text-xl font-bold text-malazone-navy">{editingBanner ? "Edit Banner" : "Add Banner"}</h3>
              <button onClick={() => setIsModalOpen(false)} className="p-2 rounded-full hover:bg-slate-100 text-malazone-navy hover:text-malazone-navy">
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="p-6 space-y-4">
              <div className="space-y-2">
                <label className="text-sm font-bold text-malazone-navy">Image URL</label>
                <input
                  type="text"
                  value={formData.image_url}
                  onChange={(e) => setFormData({ ...formData, image_url: e.target.value })}
                  className="w-full px-4 py-3 rounded-xl bg-slate-50 border border-slate-200 text-malazone-navy focus:outline-none focus:border-[#00A86B]/50 focus:ring-2 focus:ring-[#00A86B]/20"
                  placeholder="https://example.com/image.jpg"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-sm font-bold text-malazone-navy">Title (EN)</label>
                  <input
                    type="text"
                    value={formData.title_en}
                    onChange={(e) => setFormData({ ...formData, title_en: e.target.value })}
                    className="w-full px-4 py-3 rounded-xl bg-slate-50 border border-slate-200 text-malazone-navy focus:outline-none focus:border-[#00A86B]/50 focus:ring-2 focus:ring-[#00A86B]/20"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-bold text-malazone-navy">Title (AM)</label>
                  <input
                    type="text"
                    value={formData.title_am}
                    onChange={(e) => setFormData({ ...formData, title_am: e.target.value })}
                    className="w-full px-4 py-3 rounded-xl bg-slate-50 border border-slate-200 text-malazone-navy focus:outline-none focus:border-[#00A86B]/50 focus:ring-2 focus:ring-[#00A86B]/20"
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-sm font-bold text-malazone-navy">Subtitle (EN)</label>
                  <textarea
                    value={formData.subtitle_en}
                    onChange={(e) => setFormData({ ...formData, subtitle_en: e.target.value })}
                    className="w-full px-4 py-3 rounded-xl bg-slate-50 border border-slate-200 text-malazone-navy focus:outline-none focus:border-[#00A86B]/50 focus:ring-2 focus:ring-[#00A86B]/20"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-bold text-malazone-navy">Subtitle (AM)</label>
                  <textarea
                    value={formData.subtitle_am}
                    onChange={(e) => setFormData({ ...formData, subtitle_am: e.target.value })}
                    className="w-full px-4 py-3 rounded-xl bg-slate-50 border border-slate-200 text-malazone-navy focus:outline-none focus:border-[#00A86B]/50 focus:ring-2 focus:ring-[#00A86B]/20"
                  />
                </div>
              </div>
              <div className="space-y-2">
                <label className="text-sm font-bold text-malazone-navy">Link URL</label>
                <input
                  type="text"
                  value={formData.link_url}
                  onChange={(e) => setFormData({ ...formData, link_url: e.target.value })}
                  className="w-full px-4 py-3 rounded-xl bg-slate-50 border border-slate-200 text-malazone-navy focus:outline-none focus:border-[#00A86B]/50 focus:ring-2 focus:ring-[#00A86B]/20"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-sm font-bold text-malazone-navy">Display Order</label>
                  <input
                    type="number"
                    value={formData.display_order}
                    onChange={(e) => setFormData({ ...formData, display_order: Number(e.target.value) })}
                    className="w-full px-4 py-3 rounded-xl bg-slate-50 border border-slate-200 text-malazone-navy focus:outline-none focus:border-[#00A86B]/50 focus:ring-2 focus:ring-[#00A86B]/20"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-bold text-malazone-navy">Status</label>
                  <select
                    value={formData.is_active ? "true" : "false"}
                    onChange={(e) => setFormData({ ...formData, is_active: e.target.value === "true" })}
                    className="w-full px-4 py-3 rounded-xl bg-slate-50 border border-slate-200 text-malazone-navy focus:outline-none focus:border-[#00A86B]/50 focus:ring-2 focus:ring-[#00A86B]/20"
                  >
                    <option value="true">Active</option>
                    <option value="false">Inactive</option>
                  </select>
                </div>
              </div>
            </div>
            <div className="p-6 border-t border-slate-200 flex justify-end gap-3">
              <button
                onClick={() => setIsModalOpen(false)}
                className="px-5 py-3 rounded-xl font-bold text-malazone-navy hover:bg-slate-100 transition-all"
              >
                Cancel
              </button>
              <button
                onClick={handleSave}
                className="px-5 py-3 rounded-xl font-bold bg-[#00A86B] text-white shadow-xl shadow-[#00A86B]/25 hover:bg-[#00A86B]/90 transition-all flex items-center gap-2"
              >
                <Save className="w-4 h-4" />
                Save
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default BannerManager;
