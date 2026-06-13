"use client";

import { Filter, X } from "lucide-react";
import {
  MEMBER_STATUSES,
  MINISTRIES,
  STATUS_LABELS,
  type MemberFilters,
} from "@/features/members/types/member.types";
import { ROLE_LABELS, ROLES } from "@/types/roles";
import { FilterSelect } from "@/components/ui/filter-select";

interface MemberFiltersProps {
  filters: MemberFilters;
  onUpdate: <K extends keyof MemberFilters>(key: K, value: MemberFilters[K]) => void;
  onReset: () => void;
  hasActive: boolean;
  className?: string;
}

export function MemberFiltersBar({
  filters,
  onUpdate,
  onReset,
  hasActive,
  className,
}: MemberFiltersProps) {
  return (
    <div
      className={className}
      role="group"
      aria-label="Member filters"
    >
      <div className="flex flex-wrap items-center gap-3">
        <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
          <Filter className="h-4 w-4" aria-hidden="true" />
          <span className="font-medium">Filters</span>
        </div>

        {/* Status */}
        <FilterSelect
          value={filters.status}
          onChange={(e) =>
            onUpdate("status", e.target.value as MemberFilters["status"])
          }
          aria-label="Filter by status"
        >
          <option value="all">All Statuses</option>
          {MEMBER_STATUSES.map((s) => (
            <option key={s} value={s}>
              {STATUS_LABELS[s]}
            </option>
          ))}
        </FilterSelect>

        {/* Ministry */}
        <FilterSelect
          value={filters.ministry}
          onChange={(e) =>
            onUpdate("ministry", e.target.value as MemberFilters["ministry"])
          }
          aria-label="Filter by ministry"
        >
          <option value="all">All Ministries</option>
          {MINISTRIES.map((m) => (
            <option key={m} value={m}>
              {m}
            </option>
          ))}
        </FilterSelect>

        {/* Gender */}
        <FilterSelect
          value={filters.gender}
          onChange={(e) =>
            onUpdate("gender", e.target.value as MemberFilters["gender"])
          }
          aria-label="Filter by gender"
        >
          <option value="all">All Genders</option>
          <option value="male">Male</option>
          <option value="female">Female</option>
        </FilterSelect>

        {/* Role */}
        <FilterSelect
          value={filters.role}
          onChange={(e) =>
            onUpdate("role", e.target.value as MemberFilters["role"])
          }
          aria-label="Filter by role"
        >
          <option value="all">All Roles</option>
          {Object.values(ROLES).map((r) => (
            <option key={r} value={r}>
              {ROLE_LABELS[r]}
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

