"use client";

import { ChevronLeft, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";

interface SermonPaginationProps {
  page: number;
  totalPages: number;
  totalItems: number;
  pageSize: number;
  onPageChange: (page: number) => void;
}

export function SermonPagination({
  page,
  totalPages,
  totalItems,
  pageSize,
  onPageChange,
}: SermonPaginationProps) {
  const from = Math.min((page - 1) * pageSize + 1, totalItems);
  const to = Math.min(page * pageSize, totalItems);

  const pages = Array.from({ length: totalPages }, (_, i) => i + 1);
  const visiblePages = pages.filter(
    (p) => p === 1 || p === totalPages || (p >= page - 1 && p <= page + 1)
  );

  if (totalPages <= 1) return null;

  return (
    <nav
      className="flex flex-wrap items-center justify-between gap-4"
      aria-label="Sermons list pagination"
    >
      <p className="text-sm text-muted-foreground">
        Showing{" "}
        <span className="font-medium text-primary-foreground">{from}–{to}</span>{" "}
        of{" "}
        <span className="font-medium text-primary-foreground">{totalItems}</span>{" "}
        sermons
      </p>

      <div className="flex items-center gap-1">
        <button
          type="button"
          onClick={() => onPageChange(page - 1)}
          disabled={page === 1}
          className={cn(
            "flex h-8 w-8 items-center justify-center rounded-lg border border-border/50 bg-card/60 transition-all",
            "hover:border-indigo-500/40 hover:bg-indigo-500/10 hover:text-indigo-400",
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
                    ? "border-indigo-500/40 bg-indigo-500/15 text-indigo-400 shadow-[0_0_8px_rgba(99,102,241,0.2)]"
                    : "border-border/50 bg-card/60 text-muted-foreground hover:border-indigo-500/40 hover:bg-indigo-500/10 hover:text-indigo-400"
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
            "hover:border-indigo-500/40 hover:bg-indigo-500/10 hover:text-indigo-400",
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
