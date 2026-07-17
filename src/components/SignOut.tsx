/**
 * SignOut.tsx
 * Malazone.com — Sign Out Confirmation Component
 * © 2026 Malazone Technologies PLC
 */

import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { LogOut, X } from "lucide-react";
import { useAuth } from "../contexts/AuthContext";
import { useLanguage } from "../contexts/ZoneLanguageContext";

interface SignOutProps {
  onClose?: () => void;
}

const SignOut: React.FC<SignOutProps> = ({ onClose }) => {
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { logout } = useAuth();
  const { t } = useLanguage();

  const handleSignOut = async () => {
    setLoading(true);
    try {
      await logout();
      navigate("/signin");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/50" onClick={onClose}></div>

      {/* Modal */}
      <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-md p-6">
        {/* Close Button */}
        {onClose && (
          <button
            onClick={onClose}
            className="absolute top-4 right-4 text-slate-400 hover:text-slate-600"
          >
            <X className="w-5 h-5" />
          </button>
        )}

        <div className="text-center space-y-6">
          {/* Icon */}
          <div className="mx-auto w-16 h-16 bg-red-50 rounded-full flex items-center justify-center">
            <LogOut className="w-8 h-8 text-red-600" />
          </div>

          {/* Text */}
          <div>
            <h3 className="text-xl font-black text-slate-900 mb-2">
              {t("auth.signout")}
            </h3>
            <p className="text-slate-600">
              {t("auth.signoutConfirm")}
            </p>
          </div>

          {/* Buttons */}
          <div className="flex gap-3">
            {onClose && (
              <button
                onClick={onClose}
                className="flex-1 py-3 px-4 border border-slate-300 rounded-xl text-slate-700 font-semibold hover:bg-slate-50 transition-all"
              >
                Cancel
              </button>
            )}
            <button
              onClick={handleSignOut}
              disabled={loading}
              className="flex-1 py-3 px-4 bg-red-600 text-white rounded-xl font-black hover:bg-red-700 transition-all disabled:opacity-60"
            >
              {loading ? "Signing out..." : t("auth.signout")}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SignOut;
