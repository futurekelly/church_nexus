"use client";

import { SelectHTMLAttributes } from "react";
import { cn } from "@/lib/utils";

interface FilterSelectProps extends SelectHTMLAttributes<HTMLSelectElement> {
  className?: string;
}

export function FilterSelect({ className, children, ...props }: FilterSelectProps) {
  return (
    <select
      className={cn(
        "rounded-xl border border-border/50 bg-card/60 px-3 py-2",
        "text-sm text-primary-foreground backdrop-blur-[16px]",
        "transition-all duration-200 focus:border-primary/50 focus:outline-none",
        "focus:ring-2 focus:ring-primary/20 hover:border-border/80",
        "min-w-[130px] cursor-pointer",
        className
      )}
      {...props}
    >
      {children}
    </select>
  );
}
