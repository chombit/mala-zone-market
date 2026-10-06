/**
 * NotificationContext.tsx
 * Malazone.com — Real-time in-app notification state
 * Fetches from the REST API + listens on the existing Socket.io connection
 * for new_message / booking:status_changed events so the bell badge stays
 * live without polling.
 * © 2026 Malazone Technologies PLC
 */

import React, { createContext, useContext, useState, useEffect, useCallback } from "react";
import { useAuth } from "./AuthContext";

interface Notification {
  id: number;
  type: string;
  title: string;
  body: string | null;
  payload: string | null;
  listing_id: number | null;
  read_at: string | null;
  created_at: string;
}

interface NotificationContextValue {
  notifications: Notification[];
  unreadCount: number;
  loading: boolean;
  refresh: () => Promise<void>;
  markRead: (id: number) => Promise<void>;
  markAllRead: () => Promise<void>;
}

const NotificationContext = createContext<NotificationContextValue | null>(null);

export const NotificationProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user } = useAuth();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(false);

  const userId = user?.id ?? null;

  const refresh = useCallback(async () => {
    if (!userId) return;
    setLoading(true);
    try {
      const res = await fetch("/api/notifications?limit=30");
      const data = await res.json();
      if (data.success) {
        setNotifications(data.data);
        setUnreadCount(data.unread_count ?? 0);
      }
    } catch {
      // silent — non-critical
    } finally {
      setLoading(false);
    }
  }, [userId]);

  const markRead = useCallback(async (id: number) => {
    try {
      await fetch(`/api/notifications/${id}/read`, { method: "POST" });
      setNotifications((prev) =>
        prev.map((n) => (n.id === id ? { ...n, read_at: new Date().toISOString() } : n))
      );
      setUnreadCount((c) => Math.max(0, c - 1));
    } catch {
      // silent
    }
  }, []);

  const markAllRead = useCallback(async () => {
    try {
      await fetch("/api/notifications/read-all", { method: "POST" });
      setNotifications((prev) => prev.map((n) => ({ ...n, read_at: n.read_at || new Date().toISOString() })));
      setUnreadCount(0);
    } catch {
      // silent
    }
  }, []);

  // Initial fetch on login
  useEffect(() => {
    if (userId) refresh();
  }, [userId, refresh]);

  // Listen for new_message and booking:status_changed via the chat socket
  // (ChatContext already manages the socket — we piggyback on the same
  // connection by listening for the DOM CustomEvent that ChatContext fires.)
  useEffect(() => {
    if (!userId) return;

    const onNewMessage = () => {
      setUnreadCount((c) => c + 1);
    };
    const onBookingUpdate = () => {
      setUnreadCount((c) => c + 1);
      refresh();
    };

    window.addEventListener("malazone:new_message", onNewMessage);
    window.addEventListener("malazone:booking_update", onBookingUpdate);
    return () => {
      window.removeEventListener("malazone:new_message", onNewMessage);
      window.removeEventListener("malazone:booking_update", onBookingUpdate);
    };
  }, [userId, refresh]);

  return (
    <NotificationContext.Provider value={{ notifications, unreadCount, loading, refresh, markRead, markAllRead }}>
      {children}
    </NotificationContext.Provider>
  );
};

export const useNotifications = () => {
  const ctx = useContext(NotificationContext);
  if (!ctx) throw new Error("useNotifications must be used within NotificationProvider");
  return ctx;
};
