"use client";

import { useState } from "react";
import { MessageSquare, Send, X, Users, Sparkles, ShieldCheck, ExternalLink } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";

interface CommunityJoinWidgetProps {
  whatsappUrl?: string;
  telegramUrl?: string;
  className?: string;
}

export function CommunityJoinWidget({
  whatsappUrl = "https://whatsapp.com",
  telegramUrl = "https://t.me/joinrightpath",
  className,
}: CommunityJoinWidgetProps) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className={cn("fixed bottom-6 right-6 z-50 select-none", className)}>
      {/* Expanded Community Hub Modal */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            transition={{ duration: 0.2 }}
            className="mb-4 w-80 overflow-hidden rounded-2xl border border-indigo-500/30 bg-slate-950/95 p-5 shadow-2xl backdrop-blur-xl"
          >
            {/* Header */}
            <div className="flex items-start justify-between pb-3 border-b border-border/20">
              <div className="space-y-1">
                <div className="inline-flex items-center gap-1.5 rounded-full border border-emerald-500/30 bg-emerald-500/10 px-2.5 py-0.5 text-[10px] font-bold text-emerald-400">
                  <Sparkles className="h-3 w-3" /> Church Family Network
                </div>
                <h4 className="text-sm font-bold text-white">Join Our Community</h4>
              </div>
              <button
                onClick={() => setIsOpen(false)}
                className="rounded-lg p-1 text-muted-foreground hover:bg-white/10 hover:text-white transition-colors"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <p className="mt-3 text-xs text-muted-foreground leading-relaxed">
              Connect directly with pastors, receive instant sermon updates, and join live prayer circles.
            </p>

            {/* Community Links */}
            <div className="mt-4 space-y-2.5">
              {/* WhatsApp Option */}
              <a
                href={whatsappUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-between rounded-xl border border-emerald-500/30 bg-emerald-500/10 p-3 text-white transition-all hover:bg-emerald-500/20 hover:border-emerald-500/50 hover:shadow-[0_0_15px_rgba(16,185,129,0.2)]"
              >
                <div className="flex items-center gap-3">
                  <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-emerald-500 text-slate-950 font-bold shadow-md">
                    <MessageSquare className="h-5 w-5 fill-current" />
                  </div>
                  <div>
                    <p className="text-xs font-bold text-white">WhatsApp Community</p>
                    <p className="text-[10px] text-emerald-300/80">Daily Devotionals & Updates</p>
                  </div>
                </div>
                <ExternalLink className="h-4 w-4 text-emerald-400 shrink-0" />
              </a>

              {/* Telegram Option */}
              <a
                href={telegramUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-between rounded-xl border border-sky-500/30 bg-sky-500/10 p-3 text-white transition-all hover:bg-sky-500/20 hover:border-sky-500/50 hover:shadow-[0_0_15px_rgba(14,165,233,0.2)]"
              >
                <div className="flex items-center gap-3">
                  <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-sky-500 text-white font-bold shadow-md">
                    <Send className="h-4 w-4 fill-current translate-x-0.5" />
                  </div>
                  <div>
                    <p className="text-xs font-bold text-white">Telegram Channel</p>
                    <p className="text-[10px] text-sky-300/80">Prayer Requests & Fellowship</p>
                  </div>
                </div>
                <ExternalLink className="h-4 w-4 text-sky-400 shrink-0" />
              </a>
            </div>

            {/* Footer Notice */}
            <div className="mt-4 flex items-center justify-center gap-1.5 text-[10px] text-muted-foreground pt-3 border-t border-border/10">
              <ShieldCheck className="h-3.5 w-3.5 text-indigo-400" /> Safe & Moderated Church Network
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Main Floating Action Button */}
      <motion.button
        whileHover={{ scale: 1.08 }}
        whileTap={{ scale: 0.95 }}
        onClick={() => setIsOpen(!isOpen)}
        className={cn(
          "flex h-14 w-14 items-center justify-center rounded-full text-white shadow-[0_0_25px_rgba(124,58,237,0.5)] transition-all",
          isOpen
            ? "bg-slate-800 border border-white/20"
            : "bg-gradient-to-r from-emerald-500 via-indigo-600 to-purple-600 hover:shadow-[0_0_35px_rgba(124,58,237,0.8)]"
        )}
        aria-label="Join Church Community"
      >
        {isOpen ? (
          <X className="h-6 w-6" />
        ) : (
          <div className="relative flex items-center justify-center">
            <Users className="h-6 w-6" />
            <span className="absolute -top-1 -right-1 flex h-3 w-3">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
              <span className="relative inline-flex rounded-full h-3 w-3 bg-emerald-500" />
            </span>
          </div>
        )}
      </motion.button>
    </div>
  );
}
