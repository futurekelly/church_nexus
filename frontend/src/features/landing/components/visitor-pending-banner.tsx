"use client";

import { motion } from "framer-motion";
import { ShieldAlert, X } from "lucide-react";
import { useState } from "react";
import { useAuth } from "@/hooks/use-auth";

export function VisitorPendingBanner() {
  const { user, isAuthenticated, isHydrated } = useAuth();
  const [dismissed, setDismissed] = useState(false);

  if (!isHydrated || !isAuthenticated || user?.role !== "visitor" || dismissed) {
    return null;
  }

  const firstName = user?.first_name ?? "visitor";

  return (
    <div className="mx-auto max-w-7xl px-4 pt-4 lg:px-8">
      <motion.section
        initial={{ opacity: 0, y: -12 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -12 }}
        className="relative overflow-hidden rounded-2xl border border-warning/30 bg-warning/5 p-4 md:p-5 backdrop-blur-md shadow-glass"
        aria-label="Pending account verification notice"
      >
        {/* Subtle background glow */}
        <div
          className="pointer-events-none absolute left-0 top-0 h-32 w-32 rounded-full opacity-10"
          aria-hidden="true"
          style={{
            background: "radial-gradient(circle, #f59e0b 0%, transparent 70%)",
            transform: "translate(-30%, -30%)",
          }}
        />
        <div className="flex items-start justify-between gap-4">
          <div className="flex flex-col gap-3.5 sm:flex-row sm:items-center">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-warning/15 text-warning shadow-[0_0_12px_rgba(245,158,11,0.2)]">
              <ShieldAlert className="h-5 w-5 animate-pulse" aria-hidden="true" />
            </div>
            <div className="space-y-1">
              <h2 className="text-sm font-semibold text-warning">
                Welcome, {firstName}! Verification Pending
              </h2>
              <p className="text-xs leading-relaxed text-muted-foreground max-w-3xl">
                Thank you for joining Church Nexus! Your account request has been successfully submitted to the church administration for verification and role promotion. You can browse the public site while waiting for approval.
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={() => setDismissed(true)}
            className="rounded-lg p-1.5 text-muted-foreground transition-colors hover:bg-warning/10 hover:text-warning"
            aria-label="Dismiss notice"
          >
            <X className="h-4 w-4" aria-hidden="true" />
          </button>
        </div>
      </motion.section>
    </div>
  );
}
