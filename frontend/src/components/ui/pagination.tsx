"use client";

import { ChevronLeft, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";

interface PaginationProps {
  page: number;
  totalPages: number;
  totalItems: number;
  pageSize: number;
  onPageChange: (page: number) => void;
  itemName: string; // e.g. "members", "events", "sermons", "prayer requests"
  variant?: "primary" | "indigo";
  ariaLabel?: string;
}

const hoverClasses = {
  primary: "hover:border-primary/40 hover:bg-primary/10 hover:text-primary",
  indigo: "hover:border-indigo-500/40 hover:bg-indigo-500/10 hover:text-indigo-400",
};

const activeClasses = {
  primary: "border-primary/40 bg-primary/15 text-primary shadow-neon",
  indigo: "border-indigo-500/40 bg-indigo-500/15 text-indigo-400 shadow-[0_0_8px_rgba(99,102,241,0.2)]",
};

export function Pagination({
  page,
  totalPages,
  totalItems,
  pageSize,
  onPageChange,
  itemName,
  variant = "primary",
  ariaLabel,
}: PaginationProps) {
  const from = Math.min((page - 1) * pageSize + 1, totalItems);
  const to = Math.min(page * pageSize, totalItems);

  const pages = Array.from({ length: totalPages }, (_, i) => i + 1);
  const visiblePages = pages.filter(
    (p) => p === 1 || p === totalPages || (p >= page - 1 && p <= page + 1)
  );

  if (totalPages <= 1) return null;

  const hoverCls = hoverClasses[variant];
  const activeCls = activeClasses[variant];

  return (
    <nav
      className="flex flex-wrap items-center justify-between gap-4"
      aria-label={ariaLabel || `${itemName} list pagination`}
    >
      <p className="text-sm text-muted-foreground">
        Showing{" "}
        <span className="font-medium text-primary-foreground">{from}–{to}</span>{" "}
        of{" "}
        <span className="font-medium text-primary-foreground">{totalItems}</span>{" "}
        {itemName}
      </p>

      <div className="flex items-center gap-1">
        <button
          type="button"
          onClick={() => onPageChange(page - 1)}
          disabled={page === 1}
          className={cn(
            "flex h-8 w-8 items-center justify-center rounded-lg border border-border/50 bg-card/60 transition-all",
            hoverCls,
            "disabled:pointer-events-none disabled:opacity-40"
          )}
          aria-label="Previous page"
        >
          <ChevronLeft className="h-4 w-4" aria-hidden="true" />
        </button>

        {visiblePages.map((p, i, arr) => {
          const showEllipsisBefore = i > 0 && arr[i - 1] !== p - 1;
          return (
            <span key={p} className="flex items-center gap-1">
              {showEllipsisBefore && (
                <span className="px-1 text-muted-foreground" aria-hidden="true">
                  …
                </span>
              )}
              <button
                type="button"
                onClick={() => onPageChange(p)}
                aria-label={`Page ${p}`}
                aria-current={p === page ? "page" : undefined}
                className={cn(
                  "flex h-8 w-8 items-center justify-center rounded-lg border text-sm font-medium transition-all",
                  p === page
                    ? activeCls
                    : cn("border-border/50 bg-card/60 text-muted-foreground", hoverCls)
                )}
              >
                {p}
              </button>
            </span>
          );
        })}

        <button
          type="button"
          onClick={() => onPageChange(page + 1)}
          disabled={page === totalPages}
          className={cn(
            "flex h-8 w-8 items-center justify-center rounded-lg border border-border/50 bg-card/60 transition-all",
            hoverCls,
            "disabled:pointer-events-none disabled:opacity-40"
          )}
          aria-label="Next page"
        >
          <ChevronRight className="h-4 w-4" aria-hidden="true" />
        </button>
      </div>
    </nav>
  );
}
