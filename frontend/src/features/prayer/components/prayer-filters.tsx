"use client";

import { Filter, X } from "lucide-react";
import {
  PRAYER_CATEGORIES,
  PRAYER_STATUSES,
  PRAYER_CATEGORY_LABELS,
  STATUS_LABELS,
  type PrayerFilters,
} from "../types/prayer.types";
import { FilterSelect } from "@/components/ui/filter-select";

interface PrayerFiltersProps {
  filters: PrayerFilters;
  onUpdate: <K extends keyof PrayerFilters>(
    key: K,
    value: PrayerFilters[K]
  ) => void;
  onReset: () => void;
  hasActive: boolean;
  className?: string;
}

export function PrayerFiltersBar({
  filters,
  onUpdate,
  onReset,
  hasActive,
  className,
}: PrayerFiltersProps) {
  return (
    <div
      className={className}
      role="group"
      aria-label="Prayer filters"
    >
      <div className="flex flex-wrap items-center gap-3">
        <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
          <Filter className="h-4 w-4" aria-hidden="true" />
          <span className="font-medium">Filters</span>
        </div>

        {/* Category Select */}
        <FilterSelect
          value={filters.category}
          onChange={(e) =>
            onUpdate("category", e.target.value as PrayerFilters["category"])
          }
          aria-label="Filter by category"
          className="min-w-[140px]"
        >
          <option value="all">All Categories</option>
          {PRAYER_CATEGORIES.map((c) => (
            <option key={c} value={c}>
              {PRAYER_CATEGORY_LABELS[c]}
            </option>
          ))}
        </FilterSelect>

        {/* Status Select */}
        <FilterSelect
          value={filters.status}
          onChange={(e) =>
            onUpdate("status", e.target.value as PrayerFilters["status"])
          }
          aria-label="Filter by status"
          className="min-w-[140px]"
        >
          <option value="all">Active (Exclude Archived)</option>
          {PRAYER_STATUSES.map((s) => (
            <option key={s} value={s}>
              {STATUS_LABELS[s]}
            </option>
          ))}
        </FilterSelect>

        {/* Clear filters */}
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
    </div>
  );
}
