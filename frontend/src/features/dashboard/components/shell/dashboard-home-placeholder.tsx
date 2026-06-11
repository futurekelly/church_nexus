"use client";

import { LayoutDashboard } from "lucide-react";
import { motion, useReducedMotion } from "framer-motion";
import { useAuth } from "@/hooks/use-auth";
import { useDashboardNavigation } from "@/features/dashboard/hooks/use-dashboard-navigation";

export function DashboardHomePlaceholder() {
  const prefersReducedMotion = useReducedMotion();
  const { user } = useAuth();
  const { roleLabel } = useDashboardNavigation();

  const firstName = user?.first_name ?? "there";

  const content = (
    <div className="glass-panel mx-auto max-w-2xl rounded-2xl border border-border/60 p-8 text-center shadow-glass md:p-12">
      <div className="mx-auto mb-6 flex h-14 w-14 items-center justify-center rounded-2xl bg-primary/15 shadow-neon">
        <LayoutDashboard className="h-7 w-7 text-primary" aria-hidden="true" />
      </div>

      <h1 className="font-display text-2xl font-bold text-primary-foreground md:text-3xl">
        Welcome back, {firstName}
      </h1>

      {roleLabel && (
        <p className="mt-2 text-sm font-medium text-primary">{roleLabel}</p>
      )}

      <p className="mt-4 text-sm leading-relaxed text-muted-foreground md:text-base">
        Your role-specific dashboard is being prepared. Module widgets and
        analytics will appear here based on your permissions.
      </p>

      <div className="mt-8 rounded-xl border border-border/50 bg-card/30 px-4 py-3 text-xs text-muted-foreground">
        Dashboard modules coming soon — Members, Events, Sermons, and more
        will be available in upcoming releases.
      </div>
    </div>
  );

  if (prefersReducedMotion) return content;

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
    >
      {content}
    </motion.div>
  );
}
