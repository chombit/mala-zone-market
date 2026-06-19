/**
 * CategoriesManager.tsx
 * Malazone.com — Admin Interface for Managing Categories
 * © 2026 Malazone Technologies PLC
 */

import React, { useState, useEffect } from "react";
import { Plus, Edit3, Trash2, Save, X, Tag } from "lucide-react";

interface Category {
  id?: number;
  key_name: string;
  label_en: string;
  label_am: string;
  description_en: string;
  description_am: string;
  display_order: number;
  is_active: boolean;
}

const CategoriesManager: React.FC = () => {
  const [categories, setCategories] = useState<Category[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState<Category | undefined>();
  const [loading, setLoading] = useState(true);
  const [formData, setFormData] = useState<Category>({
    key_name: "",
    label_en: "",
    label_am: "",
    description_en: "",
    description_am: "",
    display_order: 0,
    is_active: true
  });

  const loadCategories = async () => {
    try {
      const res = await fetch("/api/site/categories/all");
      if (!res.ok) throw new Error("API not ok");
      const data = await res.json();
      if (data.success) {
        setCategories(data.data);
        localStorage.setItem("malazone_categories", JSON.stringify(data.data));
        return;
      }
      throw new Error("API unsuccessful");
    } catch (e) {
      console.error("Failed to load categories, using local fallback", e);
      const localData = localStorage.getItem("malazone_categories");
      if (localData) {
        setCategories(JSON.parse(localData));
      } else {
        const defaultData = [
          { id: 1, key_name: "property", label_en: "Property", label_am: "ንብረት", description_en: "", description_am: "", display_order: 1, is_active: true },
          { id: 2, key_name: "motors", label_en: "Motors", label_am: "መኪናዎች", description_en: "", description_am: "", display_order: 2, is_active: true }
        ];
        setCategories(defaultData);
        localStorage.setItem("malazone_categories", JSON.stringify(defaultData));
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadCategories();
  }, []);

  const handleSave = async () => {
    try {
      let isLocalFallback = false;
      try {
        let res;
        if (editingCategory) {
          res = await fetch(`/api/site/categories/${editingCategory.id}`, {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(formData)
          });
        } else {
          res = await fetch("/api/site/categories", {
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
        let current = JSON.parse(localStorage.getItem("malazone_categories") || "[]");
        if (editingCategory) {
          current = current.map((c: any) => c.id === editingCategory.id ? { ...formData, id: c.id } : c);
        } else {
          current.push({ ...formData, id: Date.now() });
        }
        localStorage.setItem("malazone_categories", JSON.stringify(current));
      }
      
      setIsModalOpen(false);
      loadCategories();
    } catch (e) {
      console.error("Failed to save category", e);
    }
  };

  const handleDelete = async (id: number) => {
    if (!window.confirm("Are you sure you want to delete this category?")) return;
    try {
      try {
        const res = await fetch(`/api/site/categories/${id}`, { method: "DELETE" });
        if (!res.ok) throw new Error("API failed");
      } catch (apiError) {
        let current = JSON.parse(localStorage.getItem("malazone_categories") || "[]");
        current = current.filter((c: any) => c.id !== id);
        localStorage.setItem("malazone_categories", JSON.stringify(current));
      }
      loadCategories();
    } catch (e) {
      console.error("Failed to delete category", e);
    }
  };

  const handleEdit = (category: Category) => {
    setEditingCategory(category);
    setFormData(category);
    setIsModalOpen(true);
  };

  const handleAdd = () => {
    setEditingCategory(undefined);
    setFormData({
      key_name: "",
      label_en: "",
      label_am: "",
      description_en: "",
      description_am: "",
      display_order: categories.length,
      is_active: true
    });
    setIsModalOpen(true);
  };

  return (
    <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-sm">
      <div className="p-6 border-b border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-slate-50/50">
        <div className="space-y-1">
          <h2 className="text-xl font-black text-slate-900 tracking-tight flex items-center gap-3">
            <Tag className="w-6 h-6 text-[#00A86B]" />
            Categories
          </h2>
          <p className="text-xs font-bold text-slate-500 uppercase tracking-widest">Manage business categories</p>
        </div>
        <button 
          onClick={handleAdd}
          className="flex items-center gap-3 px-5 py-2.5 rounded-xl bg-[#00A86B] hover:bg-[#00A86B]/90 text-white shadow-xl shadow-[#00A86B]/25 transition-all font-bold text-sm"
        >
          <Plus className="w-4 h-4" />
          Add Category
        </button>
      </div>

      <div className="p-6">
        {loading ? (
          <div className="flex items-center justify-center py-10">
            <div className="animate-spin rounded-full h-10 w-10 border-4 border-[#00A86B]/30 border-t-[#00A86B]" />
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {categories.map((category) => (
              <div key={category.id} className="border border-slate-200 rounded-xl p-4 hover:border-[#00A86B]/30 transition-all">
                <div className="flex items-start justify-between">
                  <div className="space-y-1">
                    <p className="font-bold text-slate-900">{category.label_en}</p>
                    <p className="text-xs text-slate-500">{category.label_am}</p>
                    <p className="text-xs text-slate-400">Key: {category.key_name}</p>
                  </div>
                  <div className="flex gap-2">
                    <button onClick={() => handleEdit(category)} className="p-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-700 hover:bg-slate-100 transition-all">
                      <Edit3 className="w-4 h-4" />
                    </button>
                    <button onClick={() => handleDelete(category.id!)} className="p-2 bg-red-50 border border-red-200 rounded-lg text-red-600 hover:bg-red-100 transition-all">
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Category Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm">
          <div className="bg-white border border-slate-200 rounded-2xl shadow-2xl w-full max-w-lg animate-in fade-in zoom-in duration-200 max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-slate-200 flex items-center justify-between">
              <h3 className="text-xl font-bold text-slate-900">{editingCategory ? "Edit Category" : "Add Category"}</h3>
              <button onClick={() => setIsModalOpen(false)} className="p-2 rounded-full hover:bg-slate-100 text-slate-500 hover:text-slate-700">
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="p-6 space-y-4">
              <div className="space-y-2">
                <label className="text-sm font-bold text-slate-700">Key Name</label>
                <input 
                  type="text"
                  value={formData.key_name}
                  onChange={(e) => setFormData({ ...formData, key_name: e.target.value })}
                  className="w-full px-4 py-3 rounded-xl bg-slate-50 border border-slate-200 text-slate-700 focus:outline-none focus:border-[#00A86B]/50 focus:ring-2 focus:ring-[#00A86B]/20"
                  placeholder="property, motors"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-sm font-bold text-slate-700">Label (EN)</label>
                  <input 
                    type="text"
                    value={formData.label_en}
                    onChange={(e) => setFormData({ ...formData, label_en: e.target.value })}
                    className="w-full px-4 py-3 rounded-xl bg-slate-50 border border-slate-200 text-slate-700 focus:outline-none focus:border-[#00A86B]/50 focus:ring-2 focus:ring-[#00A86B]/20"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-bold text-slate-700">Label (AM)</label>
                  <input 
                    type="text"
                    value={formData.label_am}
                    onChange={(e) => setFormData({ ...formData, label_am: e.target.value })}
                    className="w-full px-4 py-3 rounded-xl bg-slate-50 border border-slate-200 text-slate-700 focus:outline-none focus:border-[#00A86B]/50 focus:ring-2 focus:ring-[#00A86B]/20"
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-sm font-bold text-slate-700">Description (EN)</label>
                  <textarea 
                    value={formData.description_en}
                    onChange={(e) => setFormData({ ...formData, description_en: e.target.value })}
                    className="w-full px-4 py-3 rounded-xl bg-slate-50 border border-slate-200 text-slate-700 focus:outline-none focus:border-[#00A86B]/50 focus:ring-2 focus:ring-[#00A86B]/20"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-bold text-slate-700">Description (AM)</label>
                  <textarea 
                    value={formData.description_am}
                    onChange={(e) => setFormData({ ...formData, description_am: e.target.value })}
                    className="w-full px-4 py-3 rounded-xl bg-slate-50 border border-slate-200 text-slate-700 focus:outline-none focus:border-[#00A86B]/50 focus:ring-2 focus:ring-[#00A86B]/20"
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-sm font-bold text-slate-700">Display Order</label>
                  <input 
                    type="number"
                    value={formData.display_order}
                    onChange={(e) => setFormData({ ...formData, display_order: Number(e.target.value) })}
                    className="w-full px-4 py-3 rounded-xl bg-slate-50 border border-slate-200 text-slate-700 focus:outline-none focus:border-[#00A86B]/50 focus:ring-2 focus:ring-[#00A86B]/20"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-bold text-slate-700">Status</label>
                  <select 
                    value={formData.is_active ? "true" : "false"}
                    onChange={(e) => setFormData({ ...formData, is_active: e.target.value === "true" })}
                    className="w-full px-4 py-3 rounded-xl bg-slate-50 border border-slate-200 text-slate-700 focus:outline-none focus:border-[#00A86B]/50 focus:ring-2 focus:ring-[#00A86B]/20"
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
                className="px-5 py-3 rounded-xl font-bold text-slate-600 hover:bg-slate-100 transition-all"
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

export default CategoriesManager;
