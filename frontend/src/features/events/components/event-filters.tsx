"use client";

import { Filter, X } from "lucide-react";
import { cn } from "@/lib/utils";
import {
  EVENT_TYPES,
  EVENT_STATUSES,
  EVENT_TYPE_LABELS,
  EVENT_STATUS_LABELS,
  type EventFilters,
} from "../types/event.types";

interface EventFiltersProps {
  filters: EventFilters;
  onUpdate: <K extends keyof EventFilters>(key: K, value: EventFilters[K]) => void;
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

export function EventFiltersBar({
  filters,
  onUpdate,
  onReset,
  hasActive,
  className,
}: EventFiltersProps) {
  return (
    <div
      className={cn("flex flex-wrap items-center gap-3", className)}
      role="group"
      aria-label="Event filters"
    >
      <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
        <Filter className="h-4 w-4" aria-hidden="true" />
        <span className="font-medium">Filters</span>
      </div>

      {/* Event Type */}
      <select
        value={filters.type}
        onChange={(e) =>
          onUpdate("type", e.target.value as EventFilters["type"])
        }
        aria-label="Filter by event type"
        className={selectClass}
      >
        <option value="all">All Types</option>
        {EVENT_TYPES.map((t) => (
          <option key={t} value={t}>
            {EVENT_TYPE_LABELS[t]}
          </option>
        ))}
      </select>

      {/* Event Status */}
      <select
        value={filters.status}
        onChange={(e) =>
          onUpdate("status", e.target.value as EventFilters["status"])
        }
        aria-label="Filter by status"
        className={selectClass}
      >
        <option value="all">All Statuses</option>
        {EVENT_STATUSES.map((s) => (
          <option key={s} value={s}>
            {EVENT_STATUS_LABELS[s]}
          </option>
        ))}
      </select>

      {/* Date Range */}
      <select
        value={filters.dateRange}
        onChange={(e) =>
          onUpdate("dateRange", e.target.value as EventFilters["dateRange"])
        }
        aria-label="Filter by date range"
        className={selectClass}
      >
        <option value="all">Any Date</option>
        <option value="upcoming">Upcoming</option>
        <option value="today">Today</option>
        <option value="this-week">This Week</option>
        <option value="past">Past / Completed</option>
      </select>

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
  );
}
