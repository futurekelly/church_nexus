"use client";

import { CheckCircle2, AlertTriangle, X } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";
import type { Event } from "../types/event.types";

interface EventRegistrationDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  event: Event;
  isRegistered: boolean;
}

export function EventRegistrationDialog({
  isOpen,
  onClose,
  onConfirm,
  event,
  isRegistered,
}: EventRegistrationDialogProps) {
  if (!isOpen) return null;

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
            "relative w-full max-w-md overflow-hidden rounded-2xl border border-border/50",
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

          <div className="flex flex-col items-center text-center space-y-4">
            <div
              className={cn(
                "flex h-12 w-12 items-center justify-center rounded-full border",
                isRegistered
                  ? "bg-rose-500/10 border-rose-500/20 text-rose-400"
                  : "bg-emerald-500/10 border-emerald-500/20 text-emerald-400"
              )}
            >
              {isRegistered ? (
                <AlertTriangle className="h-6 w-6" />
              ) : (
                <CheckCircle2 className="h-6 w-6" />
              )}
            </div>

            <div className="space-y-1">
              <h3 id="dialog-title" className="text-lg font-bold text-primary-foreground">
                {isRegistered ? "Cancel Registration?" : "Register for Event?"}
              </h3>
              <p className="text-xs text-muted-foreground max-w-xs">
                {isRegistered
                  ? "Are you sure you want to cancel your registration for this event? This will free up your spot."
                  : "Would you like to reserve a spot for this event? Capacity is limited."}
              </p>
            </div>

            {/* Event Summary Box */}
            <div className="w-full rounded-xl border border-border/10 bg-slate-950/40 p-4 text-left space-y-2">
              <span className="text-[9px] font-bold text-indigo-400 uppercase tracking-wide">
                {event.event_type}
              </span>
              <h4 className="text-sm font-bold text-primary-foreground truncate">
                {event.title}
              </h4>
              
              <div className="flex flex-col gap-1 text-[11px] text-muted-foreground pt-1">
                <div>
                  <span className="font-semibold text-primary-foreground">Date: </span>
                  {new Date(event.start_date).toLocaleDateString(undefined, {
                    weekday: "short",
                    month: "short",
                    day: "numeric",
                    year: "numeric",
                  })}
                </div>
                <div>
                  <span className="font-semibold text-primary-foreground">Time: </span>
                  {new Date(event.start_date).toLocaleTimeString(undefined, {
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
                </div>
                <div>
                  <span className="font-semibold text-primary-foreground">Location: </span>
                  {event.location}
                </div>
              </div>
            </div>

            <div className="flex w-full gap-3 pt-2">
              <button
                onClick={onClose}
                className={cn(
                  "flex-1 rounded-xl border border-border/50 bg-card/50 py-2.5 text-xs font-semibold text-muted-foreground",
                  "transition-colors hover:bg-card hover:text-primary-foreground focus:outline-none"
                )}
              >
                No, Go Back
              </button>
              <button
                onClick={() => {
                  onConfirm();
                  onClose();
                }}
                className={cn(
                  "flex-1 rounded-xl py-2.5 text-xs font-semibold text-white",
                  isRegistered
                    ? "bg-rose-600 hover:bg-rose-500 shadow-[0_0_12px_rgba(244,63,94,0.3)]"
                    : "bg-indigo-600 hover:bg-indigo-500 shadow-[0_0_12px_rgba(99,102,241,0.3)]",
                  "transition-all focus:outline-none focus:ring-1 focus:ring-offset-1"
                )}
              >
                {isRegistered ? "Yes, Cancel" : "Yes, Register"}
              </button>
            </div>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
