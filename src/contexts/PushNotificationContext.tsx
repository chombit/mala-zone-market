/**
 * PushNotificationContext.tsx
 * Malazone.com — Web Push (VAPID) device subscription state.
 *
 * - On login: register the service worker, request notification permission,
 *   and persist the browser push subscription to the server.
 * - Exposes permission/support state + toggle so the UI can prompt or disable.
 * © 2026 Malazone Technologies PLC
 */

import React, { createContext, useContext, useState, useEffect, useCallback } from "react";
import { useAuth } from "./AuthContext";

interface PushNotificationContextValue {
  supported: boolean;
  enabled: boolean; // server has VAPID configured
  permission: NotificationPermission | "unsupported" | "unknown";
  subscribed: boolean;
  requestAndSubscribe: () => Promise<boolean>;
  unsubscribe: () => Promise<void>;
}

const PushNotificationContext = createContext<PushNotificationContextValue | null>(null);

function urlBase64ToUint8Array(base64String: string): Uint8Array<ArrayBuffer> {
  const padding = "=".repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding).replace(/-/g, "+").replace(/_/g, "/");
  const rawData = window.atob(base64);
  const outputArray = new Uint8Array(rawData.length);
  for (let i = 0; i < rawData.length; ++i) {
    outputArray[i] = rawData.charCodeAt(i);
  }
  return outputArray;
}

export const PushNotificationProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user } = useAuth();
  const [supported] = useState<boolean>(
    typeof window !== "undefined" && "serviceWorker" in navigator && "Notification" in window && "PushManager" in window
  );
  const [enabled, setEnabled] = useState(false);
  const [applicationServerKey, setApplicationServerKey] = useState<string | null>(null);
  const [permission, setPermission] = useState<PushNotificationContextValue["permission"]>("unknown");
  const [subscribed, setSubscribed] = useState(false);

  const userId = user?.id ?? null;

  const syncPermission = useCallback(() => {
    if (!supported) {
      setPermission("unsupported");
      return;
    }
    setPermission(Notification.permission);
  }, [supported]);

  const checkSubscription = useCallback(async () => {
    if (!supported || typeof navigator.serviceWorker === "undefined" || !navigator.serviceWorker.controller) {
      return;
    }
    try {
      const reg = await navigator.serviceWorker.ready;
      const sub = await reg.pushManager.getSubscription();
      setSubscribed(!!sub);
    } catch {
      setSubscribed(false);
    }
  }, [supported]);

  // Load server config (VAPID public key) on mount
  useEffect(() => {
    (async () => {
      try {
        const res = await fetch("/api/push/enabled");
        const data = await res.json();
        setEnabled(!!data.enabled);
        setApplicationServerKey(data.applicationServerKey || null);
      } catch {
        // disabled
      }
    })();
  }, []);

  // On login: refresh permission + check existing subscription
  useEffect(() => {
    syncPermission();
    checkSubscription();
  }, [syncPermission, checkSubscription, userId]);

  const requestAndSubscribe = useCallback(async (): Promise<boolean> => {
    if (!supported || !enabled || !applicationServerKey) return false;
    try {
      const perm = await Notification.requestPermission();
      setPermission(perm);
      if (perm !== "granted") return false;

      const reg = await navigator.serviceWorker.ready;
      const key = urlBase64ToUint8Array(applicationServerKey);
      let sub = await reg.pushManager.getSubscription();
      if (!sub) {
        sub = await reg.pushManager.subscribe({
          userVisibleOnly: true,
          applicationServerKey: key,
        });
      }
      const res = await fetch("/api/push/subscribe", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ subscription: sub.toJSON() }),
      });
      const data = await res.json();
      if (data.success) {
        setSubscribed(true);
        return true;
      }
      return false;
    } catch {
      return false;
    }
  }, [supported, enabled, applicationServerKey]);

  const unsubscribe = useCallback(async () => {
    if (!supported || typeof navigator.serviceWorker === "undefined") return;
    try {
      const reg = await navigator.serviceWorker.ready;
      const sub = await reg.pushManager.getSubscription();
      if (sub) {
        const endpoint = sub.endpoint;
        await sub.unsubscribe();
        await fetch("/api/push/unsubscribe", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ endpoint }),
        });
      }
      setSubscribed(false);
    } catch {
      // silent
    }
  }, [supported]);

  return (
    <PushNotificationContext.Provider
      value={{ supported, enabled, permission, subscribed, requestAndSubscribe, unsubscribe }}
    >
      {children}
    </PushNotificationContext.Provider>
  );
};

export const usePushNotifications = () => {
  const ctx = useContext(PushNotificationContext);
  if (!ctx) throw new Error("usePushNotifications must be used within PushNotificationProvider");
  return ctx;
};
