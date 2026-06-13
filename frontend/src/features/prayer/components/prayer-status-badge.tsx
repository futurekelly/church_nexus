"use client";

import type { PrayerStatus } from "../types/prayer.types";
import { StatusBadge } from "@/components/ui/status-badge";

interface PrayerStatusBadgeProps {
  status: PrayerStatus;
  size?: "sm" | "md";
  className?: string;
}

const STATUS_COLORS: Record<
  PrayerStatus,
  { bg: string; text: string; dot: string }
> = {
  New: {
    bg: "bg-cyan-500/10 border border-cyan-500/20",
    text: "text-cyan-400",
    dot: "bg-cyan-400 shadow-[0_0_8px_#22d3ee]",
  },
  "In Progress": {
    bg: "bg-purple-500/10 border border-purple-500/20",
    text: "text-purple-400",
    dot: "bg-purple-400 shadow-[0_0_8px_#c084fc]",
  },
  Answered: {
    bg: "bg-emerald-500/10 border border-emerald-500/20",
    text: "text-emerald-400",
    dot: "bg-emerald-400 shadow-[0_0_8px_#34d399]",
  },
  Archived: {
    bg: "bg-slate-500/10 border border-slate-500/20",
    text: "text-slate-400",
    dot: "bg-slate-400 shadow-[0_0_8px_#94a3b8]",
  },
};

export function PrayerStatusBadge({
  status,
  size = "md",
  className,
}: PrayerStatusBadgeProps) {
  const colors = STATUS_COLORS[status] || STATUS_COLORS.New;

  return (
    <StatusBadge
      label={status}
      bgClass={colors.bg}
      textClass={colors.text}
      dotClass={colors.dot}
      size={size}
      className={className}
      ariaLabel={`Prayer status: ${status}`}
    />
  );
}
