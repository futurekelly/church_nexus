"use client";

import { useState, useEffect } from "react";
import { X, MessageSquare, Send } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";
import type { PrayerRequest } from "../types/prayer.types";

interface PrayerResponseDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (id: string, response: string) => void;
  request: PrayerRequest | null;
}

export function PrayerResponseDialog({
  isOpen,
  onClose,
  onSubmit,
  request,
}: PrayerResponseDialogProps) {
  const [response, setResponse] = useState("");

  useEffect(() => {
    if (request) {
      setResponse(request.pastor_response || "");
    }
  }, [request]);

  if (!isOpen || !request) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(request.id, response.trim());
    onClose();
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        {/* Backdrop overlay */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="absolute inset-0 bg-background/80 backdrop-blur-sm"
        />

        {/* Dialog content box */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 10 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 10 }}
          transition={{ duration: 0.2 }}
          className={cn(
            "relative w-full max-w-lg overflow-hidden rounded-2xl border border-border/50",
            "bg-card/90 p-6 shadow-2xl backdrop-blur-glass z-10"
          )}
          role="dialog"
          aria-modal="true"
          aria-labelledby="dialog-title"
        >
          {/* Close button */}
          <button
            onClick={onClose}
            className="absolute right-4 top-4 text-muted-foreground hover:text-primary-foreground transition-colors"
            aria-label="Close dialog"
          >
            <X className="h-4 w-4" />
          </button>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="flex items-center gap-2 text-primary">
              <MessageSquare className="h-5 w-5" />
              <h2 id="dialog-title" className="text-lg font-bold text-primary-foreground">
                Pastor's Response
              </h2>
            </div>

            <div>
              <p className="text-xs text-muted-foreground mb-1.5 uppercase font-semibold tracking-wider">
                Responding to request:
              </p>
              <h3 className="text-sm font-semibold text-primary-foreground">
                {request.title}
              </h3>
              <p className="text-xs text-muted-foreground mt-1 line-clamp-2 bg-slate-950/20 p-2 rounded-lg border border-border/20">
                {request.description}
              </p>
            </div>

            <div className="space-y-1.5">
              <label htmlFor="pastor-response-text" className="text-xs font-semibold text-muted-foreground">
                Your Response note *
              </label>
              <textarea
                id="pastor-response-text"
                rows={5}
                required
                value={response}
                onChange={(e) => setResponse(e.target.value)}
                placeholder="Write an encouraging response, scripture reference, or assurance of prayer..."
                className={cn(
                  "w-full rounded-xl border border-border/50 bg-card/60 px-4 py-2.5",
                  "text-sm text-primary-foreground placeholder:text-muted-foreground/50",
                  "backdrop-blur-[16px] transition-all duration-200 resize-none",
                  "focus:border-primary/50 focus:outline-none focus:ring-2 focus:ring-primary/20"
                )}
              />
            </div>

            {/* Buttons */}
            <div className="flex items-center justify-end gap-3 pt-3 border-t border-border/40">
              <button
                type="button"
                onClick={onClose}
                className="rounded-xl border border-border/50 bg-card/40 px-4 py-2 text-xs font-semibold text-muted-foreground transition-all hover:bg-slate-900 hover:text-primary-foreground"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="flex items-center gap-1.5 rounded-xl bg-primary px-4 py-2 text-xs font-semibold text-primary-foreground shadow-neon transition-all hover:brightness-110"
              >
                <Send className="h-3.5 w-3.5" />
                Submit Response
              </button>
            </div>
          </form>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
