/**
 * ChatBell.tsx
 * Malazone.com — Chat notification bell (header icon)
 * Shows unread message count and opens the global chat panel on click.
 * Works for both buyers (user session) and agents (agent session).
 * © 2026 Malazone Technologies PLC
 */

import React from "react";
import { MessageCircle } from "lucide-react";
import { useChat } from "@/contexts/ChatContext";
import { useAuth } from "@/contexts/AuthContext";
import { useAgentAuth } from "@/contexts/AgentAuthContext";

interface ChatBellProps {
  className?: string;
}

const ChatBell: React.FC<ChatBellProps> = ({ className = "" }) => {
  const { user } = useAuth();
  const { agent } = useAgentAuth();
  const { unreadCount } = useChat();

  // Only show for a logged-in buyer or agent.
  const identityId = user?.id ?? agent?.user_id ?? null;
  if (!identityId) return null;

  const openChat = () => {
    window.dispatchEvent(new CustomEvent("malazone:open-chat"));
  };

  return (
    <button
      onClick={openChat}
      aria-label="Messages"
      className={`relative rounded-full flex items-center justify-center border border-slate-200 dark:border-white/10 bg-white dark:bg-slate-900 hover:bg-slate-50 dark:hover:bg-slate-800 hover:border-[#00A86B] shadow-sm transition-colors ${className}`}
    >
      <MessageCircle className="w-4 h-4 text-[#00A86B]" />
      {unreadCount > 0 && (
        <span className="absolute -top-1 -right-1 min-w-[16px] h-4 px-0.5 flex items-center justify-center text-[9px] font-black text-white bg-red-500 rounded-full border border-white">
          {unreadCount > 9 ? "9+" : unreadCount}
        </span>
      )}
    </button>
  );
};

export default ChatBell;
