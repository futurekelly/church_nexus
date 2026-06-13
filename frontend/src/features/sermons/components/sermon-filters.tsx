"use client";

import { Filter, X } from "lucide-react";
import { cn } from "@/lib/utils";
import {
  SERMON_CATEGORIES,
  SERMON_STATUSES,
  SERMON_CATEGORY_LABELS,
  SERMON_STATUS_LABELS,
  type SermonFilters,
} from "../types/sermon.types";
import { MOCK_SPEAKERS } from "../data/mock-sermons";

interface SermonFiltersProps {
  filters: SermonFilters;
  onUpdate: <K extends keyof SermonFilters>(key: K, value: SermonFilters[K]) => void;
  onReset: () => void;
  hasActive: boolean;
  className?: string;
}

const selectClass = cn(
  "rounded-xl border border-border/50 bg-card/60 px-3 py-2",
  "text-sm text-primary-foreground backdrop-blur-[16px]",
  "transition-all duration-200 focus:border-primary/50 focus:outline-none",
  "focus:ring-2 focus:ring-primary/20 hover:border-border/80",
  "min-w-[140px] cursor-pointer"
);

export function SermonFiltersBar({
  filters,
  onUpdate,
  onReset,
  hasActive,
  className,
}: SermonFiltersProps) {
  return (
    <div
      className={cn("flex flex-wrap items-center gap-3", className)}
      role="group"
      aria-label="Sermon filters"
    >
      <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
        <Filter className="h-4 w-4" aria-hidden="true" />
        <span className="font-medium">Filters</span>
      </div>

      {/* Category Select */}
      <select
        value={filters.category}
        onChange={(e) =>
          onUpdate("category", e.target.value as SermonFilters["category"])
        }
        aria-label="Filter by category"
        className={selectClass}
      >
        <option value="all">All Categories</option>
        {SERMON_CATEGORIES.map((c) => (
          <option key={c} value={c}>
            {SERMON_CATEGORY_LABELS[c]}
          </option>
        ))}
      </select>

      {/* Speaker Select */}
      <select
        value={filters.speaker}
        onChange={(e) =>
          onUpdate("speaker", e.target.value as SermonFilters["speaker"])
        }
        aria-label="Filter by speaker"
        className={selectClass}
      >
        <option value="all">All Speakers</option>
        {MOCK_SPEAKERS.map((sp) => (
          <option key={sp} value={sp}>
            {sp}
          </option>
        ))}
      </select>

      {/* Status Select */}
      <select
        value={filters.status}
        onChange={(e) =>
          onUpdate("status", e.target.value as SermonFilters["status"])
        }
        aria-label="Filter by status"
        className={selectClass}
      >
        <option value="all">All Statuses</option>
        {SERMON_STATUSES.map((s) => (
          <option key={s} value={s}>
            {SERMON_STATUS_LABELS[s]}
          </option>
        ))}
      </select>

      {/* Clear Filters button */}
      {hasActive && (
        <button
          type="button"
          onClick={onReset}
          className="flex items-center gap-1.5 rounded-xl border border-red-500/30 bg-red-500/10 px-3 py-2 text-sm font-medium text-red-400 transition-all hover:bg-red-500/20"
          aria-label="Clear all filters"
        >
          <X className="h-3.5 w-3.5" aria-hidden="true" />
          Clear
        </button>
      )}
    </div>
  );
}
