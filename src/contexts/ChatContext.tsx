/**
 * ChatContext.tsx
 * Malazone.com — Buyer-Seller Chat State Management
 * © 2026 Malazone Technologies PLC
 */

import React, { createContext, useContext, useState, useEffect, useCallback, useRef } from "react";
import { io, Socket } from "socket.io-client";
import { useAuth } from "./AuthContext";

interface Message {
  id: number;
  sender_id: number;
  receiver_id: number;
  listing_id: number | null;
  message_text: string;
  is_read: boolean;
  created_at: string;
  sender_name?: string;
}

interface Conversation {
  partner_id: number;
  partner_name: string;
  partner_phone: string;
  listing_id: number | null;
  listing_title_en: string | null;
  listing_title_am: string | null;
  listing_images: string | null;
  listing_price: number | null;
  listing_category: string | null;
  message_text: string;
  created_at: string;
  unread_count: number;
}

interface ChatContextValue {
  conversations: Conversation[];
  activeMessages: Message[];
  activePartnerId: number | null;
  activeListingId: number | null;
  unreadCount: number;
  isOpen: boolean;
  toast: Toast | null;
  openChat: (partnerId: number, partnerName: string, listingId?: number) => void;
  closeChat: () => void;
  sendMessage: (text: string) => Promise<void>;
  refreshConversations: () => Promise<void>;
  dismissToast: () => void;
}

interface Toast {
  id: number;
  senderName: string;
  message: string;
  listingTitle?: string;
}

const ChatContext = createContext<ChatContextValue | null>(null);

const SERVER_URL = import.meta.env.VITE_API_URL || "";

export const ChatProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user } = useAuth();
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [activeMessages, setActiveMessages] = useState<Message[]>([]);
  const [activePartnerId, setActivePartnerId] = useState<number | null>(null);
  const [activePartnerName, setActivePartnerName] = useState<string>("");
  const [activeListingId, setActiveListingId] = useState<number | null>(null);
  const [unreadCount, setUnreadCount] = useState(0);
  const [isOpen, setIsOpen] = useState(false);
  const [toast, setToast] = useState<Toast | null>(null);
  const socketRef = useRef<Socket | null>(null);
  const toastTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Connect Socket.io and join personal room
  useEffect(() => {
    if (!user?.phone_number) return;

    // Request browser notification permission
    if ("Notification" in window && Notification.permission === "default") {
      Notification.requestPermission();
    }

    const socket = io(SERVER_URL, { transports: ["websocket"] });
    socketRef.current = socket;

    socket.on("connect", () => {
      socket.emit("join_chat", user.id);
    });

    socket.on("new_message", (msg: Message) => {
      // If we're viewing this thread, append the message
      if (
        activePartnerId &&
        (msg.sender_id === activePartnerId || msg.receiver_id === activePartnerId) &&
        msg.listing_id === activeListingId
      ) {
        setActiveMessages((prev) => {
          if (prev.find((m) => m.id === msg.id)) return prev;
          return [...prev, msg];
        });
      }

      // Refresh conversations list
      fetchConversations();

      // Handle incoming messages (not our own)
      if (msg.receiver_id === user.id && msg.sender_id !== user.id) {
        setUnreadCount((c) => c + 1);

        // Play notification sound
        try {
          const audio = new Audio("data:audio/wav;base64,UklGRnoGAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YQoGAACBhYqFbF1fdH+JkI2Dd2BmgoeQi4B5Y2aChpCKf3hjZoGGkIt/eGNmgYaQi394Y2aBhpCLf3hjZoGGkIt/eGNmgYaQi355ZGmCh5GMgHlkaYKHkYyAeWRpgoeRjIB5ZGmCh5GMgHlkaYKHkYyAeWRpgoeRjIB5ZGmCh5GMgHlkaoOHkY2BemVqg4eRjYF6ZWqDh5GNgXplaYKHkY6CfGVqg4eRjoJ8ZWqDh5GOgnxlaYKHkY6CfGVqg4eRjoJ8ZWqDh5GOgnxlaYKHkY6CfGVqg4eRjoJ8ZWuEh5GOg31ma4SHkY6DfWZrhIeRjoN9ZmuEh5GOg31ma4SHkY6DfWZrhIeRjoN9ZmuEh5GOg31ma4SHkY6DfWZrhI");
          audio.volume = 0.5;
          audio.play().catch(() => {});
        } catch {}

        // Show browser notification
        if ("Notification" in window && Notification.permission === "granted") {
          const senderName = msg.sender_name || "Someone";
          new Notification("New Message from " + senderName, {
            body: msg.message_text,
            icon: "/favicon.ico",
            tag: `msg_${msg.id}`,
          });
        }

        // Show in-app toast
        const senderName = msg.sender_name || "Someone";
        const newToast: Toast = {
          id: Date.now(),
          senderName,
          message: msg.message_text,
        };
        setToast(newToast);

        // Auto-dismiss after 5 seconds
        if (toastTimerRef.current) clearTimeout(toastTimerRef.current);
        toastTimerRef.current = setTimeout(() => setToast(null), 5000);
      }
    });

    return () => {
      socket.disconnect();
      socketRef.current = null;
    };
  }, [user?.id, activePartnerId, activeListingId]);

  const fetchConversations = useCallback(async () => {
    if (!user?.phone_number) return;
    try {
      const res = await fetch(`/api/messages/conversations?phone=${user.phone_number}`);
      const data = await res.json();
      if (data.success) setConversations(data.data);
    } catch (err) {
      console.error("Failed to fetch conversations:", err);
    }
  }, [user?.phone_number]);

  const fetchUnreadCount = useCallback(async () => {
    if (!user?.phone_number) return;
    try {
      const res = await fetch(`/api/messages/unread-count?phone=${user.phone_number}`);
      const data = await res.json();
      if (data.success) setUnreadCount(data.data.count);
    } catch (err) {
      console.error("Failed to fetch unread count:", err);
    }
  }, [user?.phone_number]);

  const fetchThread = useCallback(
    async (partnerId: number, listingId?: number) => {
      if (!user?.phone_number) return;
      let url = `/api/messages/thread?phone=${user.phone_number}&partner_id=${partnerId}`;
      if (listingId) url += `&listing_id=${listingId}`;
      try {
        const res = await fetch(url);
        const data = await res.json();
        if (data.success) setActiveMessages(data.data);
      } catch (err) {
        console.error("Failed to fetch thread:", err);
      }
    },
    [user?.phone_number]
  );

  useEffect(() => {
    if (user?.phone_number) {
      fetchConversations();
      fetchUnreadCount();
    }
  }, [user?.phone_number, fetchConversations, fetchUnreadCount]);

  const openChat = useCallback(
    (partnerId: number, partnerName: string, listingId?: number) => {
      setActivePartnerId(partnerId);
      setActivePartnerName(partnerName);
      setActiveListingId(listingId || null);
      setActiveMessages([]);
      setIsOpen(true);
      fetchThread(partnerId, listingId);
    },
    [fetchThread]
  );

  const closeChat = useCallback(() => {
    setIsOpen(false);
    setActivePartnerId(null);
    setActiveListingId(null);
    setActiveMessages([]);
  }, []);

  const sendMessage = useCallback(
    async (text: string) => {
      if (!user?.phone_number || !activePartnerId || !text.trim()) return;

      try {
        const res = await fetch("/api/messages", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            sender_phone: user.phone_number,
            receiver_id: activePartnerId,
            listing_id: activeListingId,
            message_text: text.trim(),
          }),
        });
        const data = await res.json();
        if (data.success && data.data) {
          setActiveMessages((prev) => {
            if (prev.find((m) => m.id === data.data.id)) return prev;
            return [...prev, data.data];
          });
        }
      } catch (err) {
        console.error("Failed to send message:", err);
      }
    },
    [user?.phone_number, activePartnerId, activeListingId]
  );

  const dismissToast = useCallback(() => {
    setToast(null);
    if (toastTimerRef.current) clearTimeout(toastTimerRef.current);
  }, []);

  return (
    <ChatContext.Provider
      value={{
        conversations,
        activeMessages,
        activePartnerId,
        activeListingId,
        unreadCount,
        isOpen,
        toast,
        openChat,
        closeChat,
        sendMessage,
        refreshConversations: fetchConversations,
        dismissToast,
      }}
    >
      {children}
    </ChatContext.Provider>
  );
};

export const useChat = () => {
  const ctx = useContext(ChatContext);
  if (!ctx) throw new Error("useChat must be used within ChatProvider");
  return ctx;
};
