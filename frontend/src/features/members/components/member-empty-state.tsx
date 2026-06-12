"use client";

import { Users } from "lucide-react";
import { motion } from "framer-motion";

interface MemberEmptyStateProps {
  hasFilters: boolean;
  onClear?: () => void;
}

export function MemberEmptyState({ hasFilters, onClear }: MemberEmptyStateProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35 }}
      className="flex flex-col items-center justify-center rounded-2xl border border-border/50 bg-card/60 px-8 py-16 text-center backdrop-blur-[16px] shadow-glass"
      role="status"
      aria-live="polite"
    >
      <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-primary/10">
        <Users className="h-8 w-8 text-primary" aria-hidden="true" />
      </div>
      <h3 className="text-lg font-semibold text-primary-foreground">
        {hasFilters ? "No members found" : "No members yet"}
      </h3>
      <p className="mt-2 max-w-sm text-sm text-muted-foreground">
        {hasFilters
          ? "No members match your current search and filter criteria. Try adjusting your filters."
          : "The member database is empty. Add your first member to get started."}
      </p>
      {hasFilters && onClear && (
        <button
          type="button"
          onClick={onClear}
          className="mt-6 rounded-xl bg-primary/15 px-4 py-2 text-sm font-medium text-primary transition-all hover:bg-primary/25 hover:shadow-neon"
        >
          Clear filters
        </button>
      )}
    </motion.div>
  );
}
