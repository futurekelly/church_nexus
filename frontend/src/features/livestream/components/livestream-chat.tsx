"use client";

import { useState, useRef, useEffect } from "react";
import { Send, Trash2, ShieldAlert, LogIn, MessageSquare } from "lucide-react";
import { useAppPermissions } from "@/hooks/use-app-permissions";
import type { ChatMessage } from "../types/livestream.types";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";

interface LivestreamChatProps {
  messages: ChatMessage[];
  onSendMessage: (text: string) => boolean;
  onDeleteMessage?: (id: string) => void;
  onMuteUser?: (username: string) => void;
  isStreamLive?: boolean;
}

const roleColors: Record<string, { text: string; bg: string }> = {
  Pastor: { text: "text-rose-400 font-bold", bg: "bg-rose-500/10 border-rose-500/20" },
  "Super Admin": { text: "text-amber-400 font-bold", bg: "bg-amber-500/10 border-amber-500/20" },
  "Church Admin": { text: "text-cyan-400 font-bold", bg: "bg-cyan-500/10 border-cyan-500/20" },
  Member: { text: "text-indigo-400", bg: "bg-indigo-500/10 border-indigo-500/20" },
  Visitor: { text: "text-slate-400", bg: "bg-slate-500/10 border-slate-500/20" },
};

export function LivestreamChat({
  messages,
  onSendMessage,
  onDeleteMessage,
  onMuteUser,
  isStreamLive = true,
}: LivestreamChatProps) {
  const router = useRouter();
  const { livestream: livestreamPermissions } = useAppPermissions();
  const { canChat, canModerate, userName, userRole } = livestreamPermissions;
  const [inputText, setInputText] = useState("");
  const chatEndRef = useRef<HTMLDivElement>(null);

  // Scroll to bottom when new messages arrive
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputText.trim()) return;
    const success = onSendMessage(inputText.trim());
    if (success) {
      setInputText("");
    }
  };

  return (
    <div className="rounded-2xl border border-border/50 bg-card/60 backdrop-blur-glass shadow-glass flex flex-col h-full min-h-[450px] max-h-[500px]">
      {/* Header */}
      <div className="p-4 border-b border-border/40 flex items-center justify-between bg-slate-900/20">
        <div className="flex items-center space-x-2">
          <MessageSquare className="h-4 w-4 text-indigo-400" />
          <h3 className="text-sm font-bold text-primary-foreground">Live Fellowship Chat</h3>
        </div>
        {isStreamLive && (
          <span className="flex items-center gap-1 text-[10px] text-emerald-400 font-semibold bg-emerald-500/10 border border-emerald-500/20 px-2 py-0.5 rounded-full">
            <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-ping" />
            Connected
          </span>
        )}
      </div>

      {/* Chat Messages Feed */}
      <div className="flex-1 overflow-y-auto p-4 space-y-3 scrollbar-thin">
        {messages.length > 0 ? (
          <AnimatePresence initial={false}>
            {messages.map((msg) => {
              const roleStyle = roleColors[msg.sender_role] || roleColors.Visitor;
              return (
                <motion.div
                  key={msg.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0 }}
                  className="flex items-start justify-between gap-2 text-xs group"
                >
                  <div className="space-y-0.5 max-w-[85%]">
                    <div className="flex items-center flex-wrap gap-1.5">
                      {/* Name */}
                      <span className={cn("font-semibold", roleStyle.text)}>
                        {msg.sender_name}
                      </span>
                      {/* Role Badge */}
                      <span className={cn("px-1.5 py-0.5 rounded border text-[9px] font-medium tracking-tight uppercase scale-95 select-none", roleStyle.bg)}>
                        {msg.sender_role}
                      </span>
                      {/* Timestamp */}
                      <span className="text-[9px] text-slate-500 select-none">
                        {new Date(msg.timestamp).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                      </span>
                    </div>
                    {/* Message Body */}
                    <p className="text-slate-200 leading-relaxed break-words">{msg.message}</p>
                  </div>

                  {/* Moderator Controls inline (Message Delete / Mute Sender) */}
                  {canModerate && (
                    <div className="flex items-center space-x-1 opacity-0 group-hover:opacity-100 transition-opacity">
                      {onDeleteMessage && (
                        <button
                          type="button"
                          onClick={() => onDeleteMessage(msg.id)}
                          className="p-1 rounded bg-slate-900/60 border border-border/20 text-red-400 hover:bg-red-500/10 transition-colors"
                          aria-label="Delete message"
                          title="Delete Message"
                        >
                          <Trash2 className="h-3 w-3" />
                        </button>
                      )}
                      {onMuteUser && msg.sender_role !== "Pastor" && msg.sender_role !== "Super Admin" && (
                        <button
                          type="button"
                          onClick={() => onMuteUser(msg.sender_name)}
                          className="p-1 rounded bg-slate-900/60 border border-border/20 text-amber-400 hover:bg-amber-500/10 transition-colors"
                          aria-label="Mute user"
                          title="Mute User"
                        >
                          <ShieldAlert className="h-3 w-3" />
                        </button>
                      )}
                    </div>
                  )}
                </motion.div>
              );
            })}
          </AnimatePresence>
        ) : (
          <div className="flex flex-col items-center justify-center h-full text-center text-xs text-slate-500 py-12">
            No messages yet. Say hello in the fellowship chat!
          </div>
        )}
        <div ref={chatEndRef} />
      </div>

      {/* Input panel / Login notice */}
      <div className="p-4 border-t border-border/40 bg-slate-950/20">
        {canChat ? (
          <form onSubmit={handleSubmit} className="flex gap-2">
            <input
              type="text"
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              placeholder={`Chat as ${userName}...`}
              className={cn(
                "flex-1 rounded-xl border border-border/50 bg-card/60 px-4 py-2.5 text-xs text-primary-foreground placeholder:text-muted-foreground/60 focus:outline-none focus:border-primary/50"
              )}
            />
            <button
              type="submit"
              disabled={!inputText.trim()}
              className="flex items-center justify-center p-2.5 rounded-xl bg-primary text-primary-foreground disabled:opacity-50 hover:brightness-110 shadow-neon transition-all"
              aria-label="Send message"
            >
              <Send className="h-4 w-4" />
            </button>
          </form>
        ) : (
          <div className="rounded-xl border border-indigo-500/20 bg-indigo-500/5 p-3 flex items-center justify-between text-xs text-slate-300">
            <span className="flex items-center gap-1.5">
              <LogIn className="h-4 w-4 text-indigo-400 shrink-0" />
              <span>Login to join fellowship chat.</span>
            </span>
            <button
              type="button"
              onClick={() => router.push(`/login?redirect=${encodeURIComponent(window.location.pathname)}`)}
              className="text-xs font-bold text-indigo-400 hover:text-indigo-300 hover:underline px-2 py-1 transition-all"
            >
              Log In
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
