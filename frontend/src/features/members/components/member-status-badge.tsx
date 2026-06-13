"use client";

import {
  STATUS_COLORS,
  STATUS_LABELS,
  type MemberStatus,
} from "@/features/members/types/member.types";
import { StatusBadge } from "@/components/ui/status-badge";

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
    <StatusBadge
      label={label}
      bgClass={colors.bg}
      textClass={colors.text}
      dotClass={colors.dot}
      size={size}
      className={className}
      ariaLabel={`Status: ${label}`}
    />
  );
}

