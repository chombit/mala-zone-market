/**
 * ChatContext.tsx
 * Malazone.com — Buyer-Seller Chat State Management
 * © 2026 Malazone Technologies PLC
 *
 * Sprint 8k hardening:
 * - One socket per login session (refs instead of state in the handler
 *   deps) — opening/closing threads no longer tears down the connection.
 * - Identity comes exclusively from the auth cookie; the legacy
 *   `sender_phone` body field and `?phone=` query params are gone.
 * - Thread pagination via an `before`-style id cursor ("Load earlier
 *   messages"), 50 messages per page.
 */

import React, { createContext, useContext, useState, useEffect, useCallback, useRef } from "react";
import { io, Socket } from "socket.io-client";
import { useAuth } from "./AuthContext";
import { useAgentAuth } from "./AgentAuthContext";

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

const THREAD_PAGE_SIZE = 50;

interface ChatContextValue {
  conversations: Conversation[];
  activeMessages: Message[];
  activePartnerId: number | null;
  activeListingId: number | null;
  unreadCount: number;
  isOpen: boolean;
  toast: Toast | null;
  hasOlderMessages: boolean;
  loadingOlder: boolean;
  typingPartnerIds: Set<number>;
  openChat: (partnerId: number, partnerName: string, listingId?: number) => void;
  closeChat: () => void;
  sendMessage: (text: string) => Promise<void>;
  refreshConversations: () => Promise<void>;
  dismissToast: () => void;
  loadOlderMessages: () => Promise<void>;
  emitTyping: (receiverId: number, isTyping: boolean) => void;
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
  const { agent } = useAgentAuth();
  // Chat identity: a normal user uses their own id; an agent chats as the
  // underlying user id so buyer messages to the listing reach them live.
  const userId = user?.id ?? agent?.user_id ?? null;
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [activeMessages, setActiveMessages] = useState<Message[]>([]);
  const [activePartnerId, setActivePartnerId] = useState<number | null>(null);
  const [activeListingId, setActiveListingId] = useState<number | null>(null);
  const [unreadCount, setUnreadCount] = useState(0);
  const [isOpen, setIsOpen] = useState(false);
  const [toast, setToast] = useState<Toast | null>(null);
  const [hasOlderMessages, setHasOlderMessages] = useState(false);
  const [loadingOlder, setLoadingOlder] = useState(false);
  const [typingPartnerIds, setTypingPartnerIds] = useState<Set<number>>(new Set());

  // Mirrors of the active thread used inside the socket handler so the
  // connection survives thread switches (no stale-closure reconnects).
  const activePartnerIdRef = useRef<number | null>(null);
  const activeListingIdRef = useRef<number | null>(null);
  const socketRef = useRef<Socket | null>(null);
  const toastTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const fetchConversations = useCallback(async () => {
    if (!userId) return;
    try {
      const res = await fetch("/api/messages/conversations");
      const data = await res.json();
      if (data.success) setConversations(data.data);
    } catch (err) {
      console.error("Failed to fetch conversations:", err);
    }
  }, [userId]);

  const fetchUnreadCount = useCallback(async () => {
    if (!userId) return;
    try {
      const res = await fetch("/api/messages/unread-count");
      const data = await res.json();
      if (data.success) setUnreadCount(data.data.count);
    } catch (err) {
      console.error("Failed to fetch unread count:", err);
    }
  }, [userId]);

  const fetchThread = useCallback(
    async (partnerId: number, listingId?: number) => {
      if (!userId) return;
      const p = new URLSearchParams({ partner_id: String(partnerId), limit: String(THREAD_PAGE_SIZE) });
      if (listingId) p.set("listing_id", String(listingId));
      try {
        const res = await fetch(`/api/messages/thread?${p.toString()}`);
        const data = await res.json();
        if (data.success) {
          setActiveMessages(data.data);
          setHasOlderMessages(Boolean(data.has_more));
        }
      } catch (err) {
        console.error("Failed to fetch thread:", err);
      }
    },
    [userId]
  );

  // Connect Socket.io once per login and join the personal room.
  useEffect(() => {
    if (!userId) return;

    // Request browser notification permission
    if ("Notification" in window && Notification.permission === "default") {
      Notification.requestPermission();
    }

    const socket = io(SERVER_URL, {
      transports: ["websocket"],
      withCredentials: true, // send the JWT auth cookie on the handshake
    });
    socketRef.current = socket;

    socket.on("connect", () => {
      socket.emit("join_chat", userId);
    });

    socket.on("new_message", (msg: Message) => {
      // Append live when the message belongs to the open thread. A thread
      // opened WITHOUT a listing filter (listing_id null) receives every
      // exchange with that partner regardless of which listing it concerns.
      const partnerMatch =
        msg.sender_id === activePartnerIdRef.current || msg.receiver_id === activePartnerIdRef.current;
      const listingMatch =
        activeListingIdRef.current == null || msg.listing_id === activeListingIdRef.current;
      if (activePartnerIdRef.current && partnerMatch && listingMatch) {
        setActiveMessages((prev) => {
          if (prev.find((m) => m.id === msg.id)) return prev;
          return [...prev, msg];
        });
      }

      // Refresh conversations list
      fetchConversations();

      // Handle incoming messages (not our own)
      if (msg.receiver_id === userId && msg.sender_id !== userId) {
        setUnreadCount((c) => c + 1);

        // Clear typing indicator for this sender (they just sent a message)
        setTypingPartnerIds((prev) => {
          if (!prev.has(msg.sender_id)) return prev;
          const next = new Set(prev);
          next.delete(msg.sender_id);
          return next;
        });

        // Notify NotificationContext (same socket, different listener)
        window.dispatchEvent(new CustomEvent("malazone:new_message"));

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

    // Typing indicator from conversation partner
    socket.on("user_typing", (data: { sender_id: number; is_typing: boolean }) => {
      if (!data.sender_id) return;
      setTypingPartnerIds((prev) => {
        const next = new Set(prev);
        if (data.is_typing) {
          next.add(data.sender_id);
        } else {
          next.delete(data.sender_id);
        }
        return next;
      });
    });

    // Read receipt — partner opened our thread; clear their unread badge
    socket.on("messages_read", (data: { reader_id: number; partner_id: number }) => {
      // The partner read our messages, so from our perspective the
      // conversation is clean. Refresh to get the updated unread count.
      if (data.reader_id && data.reader_id !== userId) {
        fetchUnreadCount();
        fetchConversations();
      }
    });

    return () => {
      socket.disconnect();
      socketRef.current = null;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [userId]);

  useEffect(() => {
    if (userId) {
      fetchConversations();
      fetchUnreadCount();
    }
  }, [userId, fetchConversations, fetchUnreadCount]);

  const openChat = useCallback(
    (partnerId: number, partnerName: string, listingId?: number) => {
      // partnerName arrives for API compatibility; the panel derives the
      // display name from the conversations list.
      void partnerName;
      setActivePartnerId(partnerId);
      setActiveListingId(listingId || null);
      activePartnerIdRef.current = partnerId;
      activeListingIdRef.current = listingId || null;
      setActiveMessages([]);
      setHasOlderMessages(false);
      setIsOpen(true);
      fetchThread(partnerId, listingId);

      // Notify partner their messages were read (read receipt)
      if (socketRef.current && userId) {
        socketRef.current.emit("chat:read", { partner_id: partnerId });
      }
    },
    [fetchThread, userId]
  );

  const closeChat = useCallback(() => {
    setIsOpen(false);
    setActivePartnerId(null);
    setActiveListingId(null);
    activePartnerIdRef.current = null;
    activeListingIdRef.current = null;
    setActiveMessages([]);
    setHasOlderMessages(false);
  }, []);

  const loadOlderMessages = useCallback(async () => {
    if (!userId || !activePartnerIdRef.current || loadingOlder) return;
    const oldest = activeMessages[0];
    if (!oldest) return;
    setLoadingOlder(true);
    try {
      const p = new URLSearchParams({
        partner_id: String(activePartnerIdRef.current),
        before_id: String(oldest.id),
        limit: String(THREAD_PAGE_SIZE),
      });
      if (activeListingIdRef.current) p.set("listing_id", String(activeListingIdRef.current));
      const res = await fetch(`/api/messages/thread?${p.toString()}`);
      const data = await res.json();
      if (data.success && Array.isArray(data.data)) {
        setActiveMessages((prev) => {
          const known = new Set(prev.map((m) => m.id));
          return [...data.data.filter((m: Message) => !known.has(m.id)), ...prev];
        });
        setHasOlderMessages(Boolean(data.has_more));
      }
    } catch (err) {
      console.error("Failed to load earlier messages:", err);
    } finally {
      setLoadingOlder(false);
    }
  }, [userId, activeMessages, loadingOlder]);

  const sendMessage = useCallback(
    async (text: string) => {
      if (!userId || !activePartnerIdRef.current || !text.trim()) return;

      try {
        const res = await fetch("/api/messages", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            receiver_id: activePartnerIdRef.current,
            listing_id: activeListingIdRef.current,
            message_text: text.trim(),
          }),
        });
        const data = await res.json();
        if (data.success && data.data) {
          setActiveMessages((prev) => {
            if (prev.find((m: Message) => m.id === data.data.id)) return prev;
            return [...prev, data.data];
          });
        }
      } catch (err) {
        console.error("Failed to send message:", err);
      }
    },
    [userId]
  );

  const dismissToast = useCallback(() => {
    setToast(null);
    if (toastTimerRef.current) clearTimeout(toastTimerRef.current);
  }, []);

  // Emit typing indicator to partner via socket
  const emitTyping = useCallback(
    (receiverId: number, isTyping: boolean) => {
      if (!socketRef.current || !userId) return;
      socketRef.current.emit("chat:typing", {
        receiver_id: receiverId,
        is_typing: isTyping,
      });
    },
    [userId]
  );

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
        hasOlderMessages,
        loadingOlder,
        typingPartnerIds,
        openChat,
        closeChat,
        sendMessage,
        refreshConversations: fetchConversations,
        dismissToast,
        loadOlderMessages,
        emitTyping,
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
