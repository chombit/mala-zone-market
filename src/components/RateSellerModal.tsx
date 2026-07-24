/**
 * RateSellerModal.tsx
 * Malazone.com — Rate Seller Modal
 * © 2026 Malazone Technologies PLC
 */

import React, { useState } from "react";
import { X, Star, Loader2, CheckCircle2 } from "lucide-react";
import StarRating from "./StarRating";
import { useAuth } from "../contexts/AuthContext";
import { useLanguage } from "../contexts/ZoneLanguageContext";

interface RateSellerModalProps {
  isOpen: boolean;
  onClose: () => void;
  sellerId: number;
  sellerName: string;
  listingId?: number;
  listingTitle?: string;
}

const RateSellerModal: React.FC<RateSellerModalProps> = ({
  isOpen,
  onClose,
  sellerId,
  sellerName,
  listingId,
  listingTitle,
}) => {
  const { user } = useAuth();
  const { language } = useLanguage();
  const isAm = language === "amharic";

  const [rating, setRating] = useState(0);
  const [review, setReview] = useState("");
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState("");

  if (!isOpen) return null;

  const handleSubmit = async () => {
    if (rating === 0) {
      setError(isAm ? "እባክዎ ኮከብ ይምረጡ" : "Please select a rating");
      return;
    }
    if (!user?.phone_number) {
      setError(isAm ? "እባክዎ ይግቡ" : "Please sign in to rate");
      return;
    }

    setLoading(true);
    setError("");

    try {
      const res = await fetch("/api/ratings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          phone: user.phone_number,
          listing_id: listingId || null,
          seller_id: sellerId,
          rating,
          review: review.trim() || null,
        }),
      });
      const data = await res.json();

      if (data.success) {
        setSuccess(true);
        setTimeout(() => {
          setSuccess(false);
          setRating(0);
          setReview("");
          onClose();
        }, 2000);
      } else {
        setError(data.message || "Failed to submit rating");
      }
    } catch {
      setError("Network error");
    } finally {
      setLoading(false);
    }
  };

  const ratingLabels = [
    "",
    isAm ? "እጅግ አ很差" : "Terrible",
    isAm ? "መጥፎ" : "Poor",
    isAm ? "መከከል" : "Average",
    isAm ? "ጥሩ" : "Good",
    isAm ? "እጅግ ጥሩ" : "Excellent",
  ];

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose} />
      <div className="relative w-full max-w-md bg-white dark:bg-slate-900 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden">
        {success ? (
          <div className="p-8 sm:p-12 text-center space-y-4">
            <div className="w-16 h-16 bg-emerald-100 dark:bg-emerald-900/30 rounded-full flex items-center justify-center mx-auto">
              <CheckCircle2 className="w-8 h-8 text-emerald-600 dark:text-emerald-400" />
            </div>
            <h3 className="text-lg font-black text-slate-900 dark:text-white">
              {isAm ? "ምዝገባዎ ተቀብቧል!" : "Rating Submitted!"}
            </h3>
            <p className="text-sm text-slate-500 dark:text-slate-400">
              {isAm ? "ምክንያት ስለ ሰጡ እናመሰግናለን" : "Thank you for your feedback"}
            </p>
          </div>
        ) : (
          <>
            {/* Header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200 dark:border-slate-800">
              <div>
                <h3 className="text-lg font-black text-slate-900 dark:text-white">
                  {isAm ? "卖家ን ደንድን" : "Rate Seller"}
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                  {sellerName}
                  {listingTitle && <span className="ml-1">— {listingTitle}</span>}
                </p>
              </div>
              <button
                onClick={onClose}
                className="p-1 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800"
              >
                <X className="w-5 h-5 text-slate-400" />
              </button>
            </div>

            {/* Body */}
            <div className="p-6 space-y-6">
              {error && (
                <div className="p-3 bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-800 rounded-lg text-sm text-red-600 dark:text-red-400">
                  {error}
                </div>
              )}

              {/* Star Rating */}
              <div className="text-center space-y-3">
                <p className="text-sm font-bold text-slate-700 dark:text-slate-300">
                  {isAm ? "ምን ያህል ተሞክሮ ነበር?" : "How was your experience?"}
                </p>
                <div className="flex justify-center">
                  <StarRating
                    rating={rating}
                    size="lg"
                    interactive
                    onChange={setRating}
                  />
                </div>
                {rating > 0 && (
                  <p className="text-sm font-medium text-[#00A86B]">{ratingLabels[rating]}</p>
                )}
              </div>

              {/* Review Text */}
              <div>
                <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-2">
                  {isAm ? "አስተያየት (አማራጭ)" : "Review (optional)"}
                </label>
                <textarea
                  rows={3}
                  value={review}
                  onChange={(e) => setReview(e.target.value)}
                  placeholder={isAm ? "ተሞክሮዎ ስለ..." : "Tell others about your experience..."}
                  className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-sm text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 focus:ring-2 focus:ring-[#00A86B] outline-none resize-none"
                />
              </div>
            </div>

            {/* Footer */}
            <div className="px-6 pb-6 flex gap-3">
              <button
                onClick={onClose}
                className="flex-1 px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-700 text-sm font-medium text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
              >
                {isAm ? "ሰርዝ" : "Cancel"}
              </button>
              <button
                onClick={handleSubmit}
                disabled={loading || rating === 0}
                className="flex-1 flex items-center justify-center gap-2 px-4 py-3 rounded-xl bg-[#00A86B] text-white text-sm font-bold hover:bg-emerald-600 transition-colors disabled:opacity-50"
              >
                {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Star className="w-4 h-4" />}
                {isAm ? "ላስል" : "Submit"}
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default RateSellerModal;
