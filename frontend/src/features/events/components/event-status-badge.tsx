"use client";

import type { EventStatus } from "../types/event.types";
import { StatusBadge } from "@/components/ui/status-badge";

interface EventStatusBadgeProps {
  status: EventStatus;
  size?: "sm" | "md";
  className?: string;
}

const STATUS_COLORS: Record<
  EventStatus,
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
  Cancelled: {
    bg: "bg-rose-500/10 border border-rose-500/20",
    text: "text-rose-400",
    dot: "bg-rose-400 shadow-[0_0_8px_#f43f5e]",
  },
  Completed: {
    bg: "bg-slate-500/10 border border-slate-500/20",
    text: "text-slate-400",
    dot: "bg-slate-400 shadow-[0_0_8px_#94a3b8]",
  },
};

export function EventStatusBadge({
  status,
  size = "md",
  className,
}: EventStatusBadgeProps) {
  const colors = STATUS_COLORS[status] || STATUS_COLORS.Draft;

  return (
    <StatusBadge
      label={status}
      bgClass={colors.bg}
      textClass={colors.text}
      dotClass={colors.dot}
      size={size}
      className={className}
      ariaLabel={`Event status: ${status}`}
    />
  );
}

