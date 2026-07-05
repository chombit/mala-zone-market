/**
 * HeroSlidesManager.tsx
 * Malazone.com — Admin Interface for Managing Hero Slides
 * © 2026 Malazone Technologies PLC
 */

import React, { useState, useEffect } from "react";
import { Plus, Edit3, Trash2, Save, X, Star } from "lucide-react";

interface HeroSlide {
  id?: number;
  image_url: string;
  pillar_key: string;
  category_id: string;
  label_en: string;
  label_am: string;
  display_order: number;
  is_active: boolean;
}

const HeroSlidesManager: React.FC = () => {
  const [slides, setSlides] = useState<HeroSlide[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingSlide, setEditingSlide] = useState<HeroSlide | undefined>();
  const [loading, setLoading] = useState(true);
  const [formData, setFormData] = useState<HeroSlide>({
    image_url: "",
    pillar_key: "",
    category_id: "",
    label_en: "",
    label_am: "",
    display_order: 0,
    is_active: true
  });

  const loadSlides = async () => {
    try {
      const res = await fetch("/api/site/hero-slides/all");
      if (!res.ok) throw new Error("API not ok");
      const data = await res.json();
      if (data.success) {
        setSlides(data.data);
        localStorage.setItem("malazone_slides", JSON.stringify(data.data));
        return;
      }
      throw new Error("API unsuccessful");
    } catch (e) {
      console.error("Failed to load slides, using local fallback", e);
      const localData = localStorage.getItem("malazone_slides");
      if (localData) {
        setSlides(JSON.parse(localData));
      } else {
        const defaultData = [
          { id: 1, image_url: "https://images.unsplash.com/photo-1560518883-ce09059eeffa?auto=format&fit=crop&q=80", pillar_key: "property", category_id: "property", label_en: "Premium Properties", label_am: "ልዩ የቤት ሽያጭ", display_order: 1, is_active: true }
        ];
        setSlides(defaultData);
        localStorage.setItem("malazone_slides", JSON.stringify(defaultData));
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadSlides();
  }, []);

  const handleSave = async () => {
    try {
      let isLocalFallback = false;
      try {
        let res;
        if (editingSlide) {
          res = await fetch(`/api/site/hero-slides/${editingSlide.id}`, {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(formData)
          });
        } else {
          res = await fetch("/api/site/hero-slides", {
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
        let current = JSON.parse(localStorage.getItem("malazone_slides") || "[]");
        if (editingSlide) {
          current = current.map((c: any) => c.id === editingSlide.id ? { ...formData, id: c.id } : c);
        } else {
          current.push({ ...formData, id: Date.now() });
        }
        localStorage.setItem("malazone_slides", JSON.stringify(current));
      }

      setIsModalOpen(false);
      loadSlides();
    } catch (e) {
      console.error("Failed to save slide", e);
    }
  };

  const handleDelete = async (id: number) => {
    if (!window.confirm("Are you sure you want to delete this slide?")) return;
    try {
      try {
        const res = await fetch(`/api/site/hero-slides/${id}`, { method: "DELETE" });
        if (!res.ok) throw new Error("API failed");
      } catch (apiError) {
        let current = JSON.parse(localStorage.getItem("malazone_slides") || "[]");
        current = current.filter((c: any) => c.id !== id);
        localStorage.setItem("malazone_slides", JSON.stringify(current));
      }
      loadSlides();
    } catch (e) {
      console.error("Failed to delete slide", e);
    }
  };

  const handleEdit = (slide: HeroSlide) => {
    setEditingSlide(slide);
    setFormData(slide);
    setIsModalOpen(true);
  };

  const handleAdd = () => {
    setEditingSlide(undefined);
    setFormData({
      image_url: "",
      pillar_key: "",
      category_id: "",
      label_en: "",
      label_am: "",
      display_order: slides.length,
      is_active: true
    });
    setIsModalOpen(true);
  };

  return (
    <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-sm">
      <div className="p-6 border-b border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-slate-50/50">
        <div className="space-y-1">
          <h2 className="text-xl font-black text-malazone-navy tracking-tight flex items-center gap-3">
            <Star className="w-6 h-6 text-[#00A86B]" />
            Hero Slides
          </h2>
          <p className="text-xs font-bold text-malazone-navy uppercase tracking-widest">Manage the hero carousel slides</p>
        </div>
        <button
          onClick={handleAdd}
          className="flex items-center gap-3 px-5 py-2.5 rounded-xl bg-[#00A86B] hover:bg-[#00A86B]/90 text-white shadow-xl shadow-[#00A86B]/25 transition-all font-bold text-sm"
        >
          <Plus className="w-4 h-4" />
          Add Slide
        </button>
      </div>

      <div className="p-6">
        {loading ? (
          <div className="flex items-center justify-center py-10">
            <div className="animate-spin rounded-full h-10 w-10 border-4 border-[#00A86B]/30 border-t-[#00A86B]" />
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {slides.map((slide) => (
              <div key={slide.id} className="border border-slate-200 rounded-xl overflow-hidden hover:border-[#00A86B]/30 transition-all">
                <div className="relative aspect-video bg-slate-100">
                  <img src={slide.image_url} alt={slide.label_en} className="w-full h-full object-cover" />
                  <div className="absolute top-3 right-3 flex gap-2">
                    <button onClick={() => handleEdit(slide)} className="p-2 bg-white/90 rounded-lg text-malazone-navy hover:bg-white transition-all shadow-sm">
                      <Edit3 className="w-4 h-4" />
                    </button>
                    <button onClick={() => handleDelete(slide.id!)} className="p-2 bg-red-50/90 rounded-lg text-red-600 hover:bg-red-50 transition-all shadow-sm">
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
                <div className="p-4">
                  <p className="font-bold text-malazone-navy">{slide.label_en}</p>
                  <p className="text-xs text-malazone-navy">{slide.label_am}</p>
                  <p className="text-xs text-malazone-navy mt-2">Order: {slide.display_order} • {slide.is_active ? "Active" : "Inactive"}</p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Slide Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm">
          <div className="bg-white border border-slate-200 rounded-2xl shadow-2xl w-full max-w-lg animate-in fade-in zoom-in duration-200">
            <div className="p-6 border-b border-slate-200 flex items-center justify-between">
              <h3 className="text-xl font-bold text-malazone-navy">{editingSlide ? "Edit Slide" : "Add Slide"}</h3>
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
                  <label className="text-sm font-bold text-malazone-navy">Label (EN)</label>
                  <input
                    type="text"
                    value={formData.label_en}
                    onChange={(e) => setFormData({ ...formData, label_en: e.target.value })}
                    className="w-full px-4 py-3 rounded-xl bg-slate-50 border border-slate-200 text-malazone-navy focus:outline-none focus:border-[#00A86B]/50 focus:ring-2 focus:ring-[#00A86B]/20"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-bold text-malazone-navy">Label (AM)</label>
                  <input
                    type="text"
                    value={formData.label_am}
                    onChange={(e) => setFormData({ ...formData, label_am: e.target.value })}
                    className="w-full px-4 py-3 rounded-xl bg-slate-50 border border-slate-200 text-malazone-navy focus:outline-none focus:border-[#00A86B]/50 focus:ring-2 focus:ring-[#00A86B]/20"
                  />
                </div>
              </div>
              <div className="space-y-2">
                <label className="text-sm font-bold text-malazone-navy">Category ID</label>
                <input
                  type="text"
                  value={formData.category_id}
                  onChange={(e) => setFormData({ ...formData, category_id: e.target.value })}
                  className="w-full px-4 py-3 rounded-xl bg-slate-50 border border-slate-200 text-malazone-navy focus:outline-none focus:border-[#00A86B]/50 focus:ring-2 focus:ring-[#00A86B]/20"
                  placeholder="property, motors, etc."
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

export default HeroSlidesManager;
