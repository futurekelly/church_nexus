"use client";

import { cn } from "@/lib/utils";

interface StatusBadgeProps {
  label: string;
  bgClass: string;
  textClass: string;
  dotClass: string;
  size?: "sm" | "md";
  className?: string;
  ariaLabel?: string;
}

export function StatusBadge({
  label,
  bgClass,
  textClass,
  dotClass,
  size = "md",
  className,
  ariaLabel,
}: StatusBadgeProps) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full font-medium backdrop-blur-sm",
        size === "sm" ? "px-2 py-0.5 text-[10px]" : "px-2.5 py-1 text-xs",
        bgClass,
        textClass,
        className
      )}
      aria-label={ariaLabel || `Status: ${label}`}
    >
      <span
        className={cn("h-1.5 w-1.5 rounded-full", dotClass)}
        aria-hidden="true"
      />
      {label}
    </span>
  );
}
