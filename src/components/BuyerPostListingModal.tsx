/**
 * BuyerPostListingModal.tsx
 * Malazone.com — Buyer Listing Creation Modal
 * Allows authenticated buyers to create property/motor/etc listings
 * © 2026 Malazone Technologies PLC
 */

import React, { useState, useMemo, useEffect } from 'react';
import { X, Loader2, ImagePlus } from 'lucide-react';
import { useLanguage } from '@/contexts/ZoneLanguageContext';

interface BuyerPostListingModalProps {
  onClose: () => void;
  onCreated: () => void;
}

const BuyerPostListingModal: React.FC<BuyerPostListingModalProps> = ({ onClose, onCreated }) => {
  const { language } = useLanguage();
  const isAmharic = language === 'amharic';

  const [formData, setFormData] = useState({
    title_en: '',
    title_am: '',
    category: 'property',
    price: '',
    price_suffix: 'fixed',
    location_key: 'hawassa_piassa',
    description_en: '',
    description_am: '',
    whatsapp: '',
  });
  const [images, setImages] = useState<File[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const imagePreviewUrls = useMemo(() => images.map(f => URL.createObjectURL(f)), [images]);
  useEffect(() => {
    return () => imagePreviewUrls.forEach(url => URL.revokeObjectURL(url));
  }, [imagePreviewUrls]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      const fd = new FormData();
      fd.append('title_en', formData.title_en);
      fd.append('title_am', formData.title_am);
      fd.append('category', formData.category);
      fd.append('price', formData.price);
      fd.append('price_suffix', formData.price_suffix);
      fd.append('location_key', formData.location_key);
      fd.append('description_en', formData.description_en);
      fd.append('description_am', formData.description_am);
      fd.append('whatsapp', formData.whatsapp);
      images.forEach(f => fd.append('images', f));

      const response = await fetch('/api/listings/buyer', {
        method: 'POST',
        credentials: 'include',
        body: fd,
      });
      const data = await response.json();
      if (data.success) {
        onCreated();
      } else {
        setError(data.message || 'Failed to create listing');
      }
    } catch {
      setError('Network error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[1200] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose} />
      <div className="relative w-full max-w-lg bg-white dark:bg-slate-900 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-800 max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 px-6 py-4 rounded-t-2xl flex items-center justify-between z-10">
          <h3 className="text-lg font-black text-slate-900 dark:text-white">
            {isAmharic ? 'ዝርዝር ያስገቡ' : 'Post a Listing'}
          </h3>
          <button onClick={onClose} className="p-1 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800">
            <X className="w-5 h-5 text-slate-400" />
          </button>
        </div>
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {error && (
            <div className="p-3 bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-800 rounded-lg text-sm text-red-600 dark:text-red-400">
              {error}
            </div>
          )}

          <div>
            <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-1">
              {isAmharic ? 'ርዕስ (እንግሊዝኛ)' : 'Title (English)'} *
            </label>
            <input
              type="text"
              required
              value={formData.title_en}
              onChange={(e) => setFormData({ ...formData, title_en: e.target.value })}
              className="w-full px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-sm text-slate-900 dark:text-white focus:ring-2 focus:ring-[#00A86B] outline-none"
              placeholder="e.g. 3 Bedroom House in Tabor"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-1">
              {isAmharic ? 'ርዕስ (አማርኛ)' : 'Title (Amharic)'} *
            </label>
            <input
              type="text"
              required
              value={formData.title_am}
              onChange={(e) => setFormData({ ...formData, title_am: e.target.value })}
              className="w-full px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-sm text-slate-900 dark:text-white focus:ring-2 focus:ring-[#00A86B] outline-none"
              placeholder="e.g. በታቦር 3 መኝታ ክፍል ቤት"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-1">
                {isAmharic ? 'ምድብ' : 'Category'} *
              </label>
              <select
                value={formData.category}
                onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                className="w-full px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-sm text-slate-900 dark:text-white focus:ring-2 focus:ring-[#00A86B] outline-none"
              >
                <option value="property">{isAmharic ? 'ንብረት' : 'Property'}</option>
                <option value="motors">{isAmharic ? 'መኪና' : 'Motors'}</option>
                <option value="stay">{isAmharic ? 'ማረፊያ' : 'Stay'}</option>
                <option value="ceremony">{isAmharic ? 'ስርዓት' : 'Ceremony'}</option>
                <option value="heavy">{isAmharic ? 'ከባድ ማሽን' : 'Heavy Machinery'}</option>
                <option value="electronics">{isAmharic ? 'ኤሌክትሮኒክስ' : 'Electronics'}</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-1">
                {isAmharic ? 'አካባቢ' : 'Location'}
              </label>
              <select
                value={formData.location_key}
                onChange={(e) => setFormData({ ...formData, location_key: e.target.value })}
                className="w-full px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-sm text-slate-900 dark:text-white focus:ring-2 focus:ring-[#00A86B] outline-none"
              >
                <option value="hawassa_piassa">Piassa</option>
                <option value="hawassa_tabor">Tabor</option>
                <option value="hawassa_lakefront">Lakefront</option>
                <option value="yirgalem">Yirgalem</option>
                <option value="bensa">Bensa</option>
                <option value="chuko">Chuko</option>
                <option value="aleta_wondo">Aleta Wondo</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-1">
                {isAmharic ? 'ዋጋ (ETB)' : 'Price (ETB)'}
              </label>
              <input
                type="number"
                value={formData.price}
                onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                className="w-full px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-sm text-slate-900 dark:text-white focus:ring-2 focus:ring-[#00A86B] outline-none"
                placeholder="0"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-1">
                {isAmharic ? 'ዋጋ ዘይቤ' : 'Price Type'}
              </label>
              <select
                value={formData.price_suffix}
                onChange={(e) => setFormData({ ...formData, price_suffix: e.target.value })}
                className="w-full px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-sm text-slate-900 dark:text-white focus:ring-2 focus:ring-[#00A86B] outline-none"
              >
                <option value="fixed">{isAmharic ? 'የተወሰነ' : 'Fixed'}</option>
                <option value="per_day">{isAmharic ? 'በቀን' : 'Per Day'}</option>
                <option value="per_month">{isAmharic ? 'በወራት' : 'Per Month'}</option>
                <option value="per_hour">{isAmharic ? 'በሰዓት' : 'Per Hour'}</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-1">
              {isAmharic ? 'ፎቶዎች (ከ4 በላይ)' : 'Photos (up to 4)'}
            </label>
            <input
              type="file"
              accept="image/*"
              multiple
              onChange={(e) => {
                const files = Array.from(e.target.files || []);
                setImages(prev => [...prev, ...files].slice(0, 4));
              }}
              className="w-full px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-sm text-slate-900 dark:text-white focus:ring-2 focus:ring-[#00A86B] outline-none file:mr-3 file:py-1 file:px-3 file:rounded-lg file:border-0 file:bg-[#00A86B] file:text-white file:text-xs file:font-bold file:cursor-pointer"
            />
            {images.length > 0 && (
              <div className="flex flex-wrap gap-2 mt-2">
                {images.map((file, i) => (
                  <div key={i} className="relative group">
                    <img src={imagePreviewUrls[i]} alt="" className="w-16 h-16 object-cover rounded-lg border border-slate-200 dark:border-slate-700" />
                    <button
                      type="button"
                      onClick={() => setImages(prev => prev.filter((_, j) => j !== i))}
                      className="absolute -top-1.5 -right-1.5 w-5 h-5 bg-red-500 text-white rounded-full text-xs font-bold flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      &times;
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-1">
              {isAmharic ? 'መግለጫ (እንግሊዝኛ)' : 'Description (English)'}
            </label>
            <textarea
              rows={3}
              value={formData.description_en}
              onChange={(e) => setFormData({ ...formData, description_en: e.target.value })}
              className="w-full px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-sm text-slate-900 dark:text-white focus:ring-2 focus:ring-[#00A86B] outline-none resize-none"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-1">
              {isAmharic ? 'መግለጫ (አማርኛ)' : 'Description (Amharic)'}
            </label>
            <textarea
              rows={3}
              value={formData.description_am}
              onChange={(e) => setFormData({ ...formData, description_am: e.target.value })}
              className="w-full px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-sm text-slate-900 dark:text-white focus:ring-2 focus:ring-[#00A86B] outline-none resize-none"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-1">
              WhatsApp
            </label>
            <input
              type="text"
              value={formData.whatsapp}
              onChange={(e) => setFormData({ ...formData, whatsapp: e.target.value })}
              className="w-full px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-sm text-slate-900 dark:text-white focus:ring-2 focus:ring-[#00A86B] outline-none"
              placeholder={isAmharic ? 'ቻርት ቴሌፍונו ቁጥር' : 'WhatsApp number'}
            />
          </div>

          <div className="flex gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-2.5 rounded-lg border border-slate-200 dark:border-slate-700 text-sm font-medium text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
            >
              {isAmharic ? 'ሰርዝ' : 'Cancel'}
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg bg-[#00A86B] text-white text-sm font-bold hover:bg-emerald-600 transition-colors disabled:opacity-50"
            >
              {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <ImagePlus className="w-4 h-4" />}
              {loading ? (isAmharic ? 'በመስራት ላይ...' : 'Creating...') : (isAmharic ? 'ያስገባ' : 'Post Listing')}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default BuyerPostListingModal;
