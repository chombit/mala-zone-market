/**
 * PushOptInBanner.tsx
 * Malazone.com — mobile-first opt-in banner for Web Push notifications.
 * Shows only for logged-in users on a supporting browser when the server has
 * VAPID configured and permission hasn't been granted yet. Dismissible.
 * © 2026 Malazone Technologies PLC
 */

import React, { useState } from "react";
import { Bell, X } from "lucide-react";
import { usePushNotifications } from "../contexts/PushNotificationContext";
import { useAuth } from "../contexts/AuthContext";

export const PushOptInBanner: React.FC = () => {
  const { user } = useAuth();
  const { supported, enabled, permission, subscribed, requestAndSubscribe } = usePushNotifications();
  const [dismissed, setDismissed] = useState(false);
  const [bannerBusy, setBannerBusy] = useState(false);

  const visible = !!user && supported && enabled && !subscribed && permission !== "granted" && !dismissed;
  if (!visible) return null;

  const handleEnable = async () => {
    setBannerBusy(true);
    await requestAndSubscribe();
    setBannerBusy(false);
    setDismissed(true);
  };

  return (
    <div className="fixed z-[60] bottom-20 lg:bottom-6 left-0 right-0 mx-auto w-[calc(100%-2rem)] max-w-md rounded-2xl border border-emerald-200 bg-white shadow-lg p-4">
      <button
        aria-label="Dismiss notifications prompt"
        onClick={() => setDismissed(true)}
        className="absolute top-3 right-3 w-9 h-9 flex items-center justify-center rounded-full text-slate-400 hover:bg-slate-100"
      >
        <X size={18} />
      </button>
      <div className="flex items-start gap-3">
        <div className="w-10 h-10 shrink-0 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center">
          <Bell size={20} />
        </div>
        <div className="min-w-0">
          <p className="text-sm font-semibold text-slate-900">Enable notifications</p>
          <p className="text-xs text-slate-600 leading-relaxed mt-0.5">
            Get instant alerts for new messages, bookings, saved searches and listing updates on your device.
          </p>
        </div>
      </div>
      <div className="mt-3 flex items-center gap-2">
        <button
          onClick={handleEnable}
          disabled={bannerBusy}
          className="h-11 flex-1 rounded-xl bg-emerald-600 text-white text-sm font-semibold disabled:opacity-60"
        >
          {bannerBusy ? "Requesting…" : "Turn on"}
        </button>
        <button
          onClick={() => setDismissed(true)}
          className="h-11 px-4 rounded-xl bg-slate-100 text-slate-700 text-sm font-medium"
        >
          Not now
        </button>
      </div>
    </div>
  );
};
