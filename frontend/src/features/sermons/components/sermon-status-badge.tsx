"use client";

import { cn } from "@/lib/utils";
import type { SermonStatus } from "../types/sermon.types";

interface SermonStatusBadgeProps {
  status: SermonStatus;
  size?: "sm" | "md";
  className?: string;
}

const STATUS_COLORS: Record<
  SermonStatus,
  { bg: string; text: string; dot: string }
> = {
  Draft: {
    bg: "bg-amber-500/10 border border-amber-500/20",
    text: "text-amber-400",
    dot: "bg-amber-400 shadow-[0_0_8px_#f59e0b]",
  },
  Published: {
    bg: "bg-emerald-500/10 border border-emerald-500/20",
    text: "text-emerald-400",
    dot: "bg-emerald-400 shadow-[0_0_8px_#10b981]",
  },
  Archived: {
    bg: "bg-slate-500/10 border border-slate-500/20",
    text: "text-slate-400",
    dot: "bg-slate-400 shadow-[0_0_8px_#94a3b8]",
  },
};

export function SermonStatusBadge({
  status,
  size = "md",
  className,
}: SermonStatusBadgeProps) {
  const colors = STATUS_COLORS[status] || STATUS_COLORS.Draft;

  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full font-medium backdrop-blur-sm",
        size === "sm" ? "px-2 py-0.5 text-[10px]" : "px-2.5 py-1 text-xs",
        colors.bg,
        colors.text,
        className
      )}
      aria-label={`Sermon status: ${status}`}
    >
      <span className={cn("h-1.5 w-1.5 rounded-full", colors.dot)} aria-hidden="true" />
      {status}
    </span>
  );
}
