"use client";

import { useEffect, useRef } from "react";
import { Search, X } from "lucide-react";
import { cn } from "@/lib/utils";

interface MemberSearchProps {
  value: string;
  onChange: (value: string) => void;
  className?: string;
}

export function MemberSearch({ value, onChange, className }: MemberSearchProps) {
  const inputRef = useRef<HTMLInputElement>(null);

  // Keyboard shortcut: Ctrl+K / Cmd+K to focus search
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === "k") {
        e.preventDefault();
        inputRef.current?.focus();
      }
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, []);

  return (
    <div className={cn("relative", className)}>
      <Search
        className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground"
        aria-hidden="true"
      />
      <input
        ref={inputRef}
        type="search"
        id="member-search"
        placeholder="Search by name, email, or member number… (Ctrl+K)"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        aria-label="Search members"
        className={cn(
          "w-full rounded-xl border border-border/50 bg-card/60 py-2.5 pl-9 pr-10",
          "text-sm text-primary-foreground placeholder:text-muted-foreground/60",
          "backdrop-blur-[16px] transition-all duration-200",
          "focus:border-primary/50 focus:outline-none focus:ring-2 focus:ring-primary/20",
          "hover:border-border/80",
        )}
      />
      {value && (
        <button
          type="button"
          onClick={() => onChange("")}
          className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground transition-colors hover:text-primary-foreground"
          aria-label="Clear search"
        >
          <X className="h-4 w-4" />
        </button>
      )}
    </div>
  );
}
