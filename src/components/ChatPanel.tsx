/**
 * ChatPanel.tsx
 * Malazone.com — Slide-out Chat Panel
 * Conversations list + message thread view
 * © 2026 Malazone Technologies PLC
 */

import React, { useState, useRef, useEffect } from "react";
import { MessageCircle, X, Send, ArrowLeft } from "lucide-react";
import { useChat } from "../contexts/ChatContext";
import { useAuth } from "../contexts/AuthContext";

const ChatPanel: React.FC = () => {
  const { user } = useAuth();
  const {
    conversations,
    activeMessages,
    activePartnerId,
    activeListingId,
    unreadCount,
    toast,
    openChat,
    closeChat,
    sendMessage,
    dismissToast,
  } = useChat();

  const [panelOpen, setPanelOpen] = useState(false);
  const [input, setInput] = useState("");
  const [sending, setSending] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const activeConversation = conversations.find(
    (c) => c.partner_id === activePartnerId && c.listing_id === activeListingId
  );

  // Sync panel open state with chat state
  useEffect(() => {
    if (activePartnerId) {
      setPanelOpen(true);
    }
  }, [activePartnerId]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [activeMessages]);

  useEffect(() => {
    if (panelOpen && activePartnerId) {
      setTimeout(() => inputRef.current?.focus(), 200);
    }
  }, [panelOpen, activePartnerId]);

  const handleOpenConversations = () => {
    setPanelOpen(true);
  };

  const handleClosePanel = () => {
    setPanelOpen(false);
    closeChat();
  };

  const handleBackToList = () => {
    closeChat();
  };

  const handleSend = async () => {
    if (!input.trim() || sending) return;
    setSending(true);
    await sendMessage(input);
    setInput("");
    setSending(false);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const formatTime = (dateStr: string) => {
    const d = new Date(dateStr);
    return d.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
  };

  const formatListingImage = (images: string | null): string | null => {
    if (!images) return null;
    try {
      const arr = typeof images === "string" ? JSON.parse(images) : images;
      return Array.isArray(arr) && arr.length > 0 ? arr[0] : null;
    } catch {
      return null;
    }
  };

  return (
    <>
      {/* Toast Notification */}
      {toast && (
        <div
          onClick={() => {
            dismissToast();
            openChat(0, "");
          }}
          className="fixed bottom-36 md:bottom-20 right-4 md:right-6 z-[999] max-w-[320px] bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-2xl shadow-2xl p-4 cursor-pointer animate-slide-in-right transition-opacity"
        >
          <div className="flex items-start gap-3">
            <div className="w-9 h-9 rounded-full bg-gradient-to-br from-[#00A86B] to-emerald-400 flex items-center justify-center text-white text-sm font-bold shrink-0">
              {toast.senderName.charAt(0).toUpperCase()}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-xs font-bold text-slate-900 dark:text-white">{toast.senderName}</p>
              <p className="text-xs text-slate-500 dark:text-slate-400 truncate mt-0.5">{toast.message}</p>
            </div>
            <button
              onClick={(e) => {
                e.stopPropagation();
                dismissToast();
              }}
              className="p-0.5 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 shrink-0"
            >
              <X className="w-3.5 h-3.5 text-slate-400" />
            </button>
          </div>
        </div>
      )}

      {/* Floating Chat Button */}
      {!panelOpen && (
        <button
          onClick={user ? handleOpenConversations : () => window.location.href = '/signin'}
          className="fixed bottom-20 md:bottom-6 right-4 md:right-6 z-[999] w-14 h-14 rounded-full bg-[#00A86B] text-white shadow-lg shadow-emerald-500/30 hidden md:flex items-center justify-center hover:scale-105 active:scale-95 transition-transform"
          title={user ? "Open Chat" : "Sign in to chat"}
        >
          <MessageCircle className="w-6 h-6" />
          {unreadCount > 0 && (
            <span className="absolute -top-1 -right-1 min-w-[20px] h-5 px-1 bg-red-500 text-white text-[10px] font-black rounded-full flex items-center justify-center border-2 border-white">
              {unreadCount > 99 ? "99+" : unreadCount}
            </span>
          )}
        </button>
      )}

      {/* Chat Panel */}
      <div
        className={`fixed bottom-0 right-0 md:bottom-6 md:right-6 z-[1000] w-full md:w-[400px] h-[85vh] md:h-[600px] bg-white dark:bg-slate-900 md:rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-800 flex flex-col transition-transform duration-300 ${
          panelOpen ? "translate-x-0" : "translate-x-full pointer-events-none"
        }`}
      >
        {/* Header */}
        <div className="flex items-center gap-3 px-4 py-3 border-b border-slate-200 dark:border-slate-800 bg-[#00A86B] text-white rounded-t-2xl">
          {activePartnerId ? (
            <button
              onClick={handleBackToList}
              className="p-1 rounded-lg hover:bg-white/20 transition-colors"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
          ) : (
            <MessageCircle className="w-5 h-5" />
          )}
          <div className="flex-1 min-w-0">
            {activePartnerId ? (
              <>
                <p className="font-bold text-sm truncate">{activeConversation?.partner_name || "Chat"}</p>
                {activeConversation?.listing_title_en && (
                  <p className="text-xs text-white/70 truncate">
                    Re: {activeConversation.listing_title_en}
                  </p>
                )}
              </>
            ) : (
              <p className="font-bold text-sm">Messages</p>
            )}
          </div>
          <button
            onClick={handleClosePanel}
            className="p-1 rounded-lg hover:bg-white/20 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        {!activePartnerId ? (
          /* Conversations List */
          <div className="flex-1 overflow-y-auto">
            {conversations.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-full text-center p-6">
                <MessageCircle className="w-12 h-12 text-slate-300 dark:text-slate-600 mb-3" />
                <p className="text-sm font-medium text-slate-500 dark:text-slate-400">
                  No conversations yet
                </p>
                <p className="text-xs text-slate-400 dark:text-slate-500 mt-1">
                  Tap "Message Seller" on any listing to start chatting
                </p>
              </div>
            ) : (
              <div className="divide-y divide-slate-100 dark:divide-slate-800">
                {conversations.map((conv) => {
                  const thumb = formatListingImage(conv.listing_images);
                  return (
                    <button
                      key={`${conv.partner_id}-${conv.listing_id}`}
                      onClick={() =>
                        openChat(
                          conv.partner_id,
                          conv.partner_name,
                          conv.listing_id || undefined
                        )
                      }
                      className="w-full flex items-center gap-3 px-4 py-3 hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors text-left"
                    >
                      {/* Avatar */}
                      <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[#00A86B] to-emerald-400 flex items-center justify-center text-white text-sm font-bold shrink-0">
                        {conv.partner_name?.charAt(0)?.toUpperCase() || "?"}
                      </div>

                      {/* Content */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between">
                          <p className="text-sm font-bold text-slate-900 dark:text-white truncate">
                            {conv.partner_name}
                          </p>
                          <span className="text-[10px] text-slate-400 dark:text-slate-500 shrink-0 ml-2">
                            {formatTime(conv.created_at)}
                          </span>
                        </div>
                        {conv.listing_title_en && (
                          <p className="text-[10px] text-[#00A86B] font-medium truncate">
                            {conv.listing_title_en}
                          </p>
                        )}
                        <p className="text-xs text-slate-500 dark:text-slate-400 truncate mt-0.5">
                          {conv.message_text}
                        </p>
                      </div>

                      {/* Unread badge */}
                      {conv.unread_count > 0 && (
                        <span className="min-w-[18px] h-[18px] px-1 bg-[#00A86B] text-white text-[10px] font-black rounded-full flex items-center justify-center shrink-0">
                          {conv.unread_count}
                        </span>
                      )}
                    </button>
                  );
                })}
              </div>
            )}
          </div>
        ) : (
          /* Message Thread */
          <>
            <div className="flex-1 overflow-y-auto p-4 space-y-3">
              {activeMessages.length === 0 && (
                <div className="text-center py-8">
                  <p className="text-xs text-slate-400 dark:text-slate-500">
                    Start the conversation about this listing
                  </p>
                </div>
              )}
              {activeMessages.map((msg) => {
                const isMine = msg.sender_id !== activePartnerId;
                return (
                  <div
                    key={msg.id}
                    className={`flex ${isMine ? "justify-end" : "justify-start"}`}
                  >
                    <div
                      className={`max-w-[75%] px-3 py-2 rounded-2xl text-sm ${
                        isMine
                          ? "bg-[#00A86B] text-white rounded-br-md"
                          : "bg-slate-100 dark:bg-slate-800 text-slate-900 dark:text-white rounded-bl-md"
                      }`}
                    >
                      <p className="break-words">{msg.message_text}</p>
                      <p
                        className={`text-[10px] mt-1 ${
                          isMine
                            ? "text-white/60 text-right"
                            : "text-slate-400 dark:text-slate-500 text-right"
                        }`}
                      >
                        {formatTime(msg.created_at)}
                      </p>
                    </div>
                  </div>
                );
              })}
              <div ref={messagesEndRef} />
            </div>

            {/* Input */}
            <div className="border-t border-slate-200 dark:border-slate-800 p-3 flex items-center gap-2">
              <input
                ref={inputRef}
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Type a message..."
                className="flex-1 px-4 py-2.5 bg-slate-100 dark:bg-slate-800 rounded-full text-sm text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 outline-none focus:ring-2 focus:ring-[#00A86B]"
              />
              <button
                onClick={handleSend}
                disabled={!input.trim() || sending}
                className="w-10 h-10 rounded-full bg-[#00A86B] text-white flex items-center justify-center hover:bg-emerald-600 transition-colors disabled:opacity-40 shrink-0"
              >
                <Send className="w-4 h-4" />
              </button>
            </div>
          </>
        )}
      </div>
    </>
  );
};

export default ChatPanel;
