"use client";

import { cn } from "@/lib/utils";
import {
  STATUS_COLORS,
  STATUS_LABELS,
  type MemberStatus,
} from "@/features/members/types/member.types";

interface MemberStatusBadgeProps {
  status: MemberStatus;
  size?: "sm" | "md";
  className?: string;
}

export function MemberStatusBadge({
  status,
  size = "md",
  className,
}: MemberStatusBadgeProps) {
  const colors = STATUS_COLORS[status];
  const label = STATUS_LABELS[status];

  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full font-medium",
        size === "sm" ? "px-2 py-0.5 text-xs" : "px-2.5 py-1 text-xs",
        colors.bg,
        colors.text,
        className,
      )}
      aria-label={`Status: ${label}`}
    >
      <span
        className={cn("h-1.5 w-1.5 rounded-full", colors.dot)}
        aria-hidden="true"
      />
      {label}
    </span>
  );
}
