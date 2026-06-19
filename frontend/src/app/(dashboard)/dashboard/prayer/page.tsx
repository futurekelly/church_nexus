"use client";

import { useState } from "react";
import Link from "next/link";
import { Plus, SortAsc } from "lucide-react";
import { toast } from "sonner";
import { useAuth } from "@/hooks/use-auth";
import { FilterSelect } from "@/components/ui/filter-select";
import {
  useFilteredPrayers,
  PrayerCard,
  PrayerFiltersBar,
  PrayerSearch,
  PrayerPagination,
  PrayerStatsCards,
  PrayerResponseDialog,
  DEFAULT_FILTERS,
  PRAYERS_PER_PAGE,
  type PrayerFilters,
  type PrayerSortConfig,
  type PrayerRequest,
} from "@/features/prayer";
import { useAppPermissions } from "@/hooks/use-app-permissions";

export default function PrayerDashboardPage() {
  const { user } = useAuth();
  const { prayer: prayerPermissions } = useAppPermissions();
  const { canSubmit, canSeeAnonymousNames } = prayerPermissions;

  const [filters, setFilters] = useState<PrayerFilters>(DEFAULT_FILTERS);
  const [sortConfig, setSortConfig] = useState<PrayerSortConfig>({
    field: "created_at",
    direction: "desc",
  });
  const [page, setPage] = useState(1);

  // Modal Dialog states for responding
  const [isRespondOpen, setIsRespondOpen] = useState(false);
  const [selectedRequest, setSelectedRequest] = useState<PrayerRequest | null>(null);

  const {
    prayers,
    totalItems,
    totalPages,
    togglePrayCount,
    deleteRequest,
    respondToRequest,
  } = useFilteredPrayers(
    filters,
    sortConfig,
    page,
    PRAYERS_PER_PAGE,
    canSeeAnonymousNames
  );

  const handleUpdateFilter = <K extends keyof PrayerFilters>(
    key: K,
    value: PrayerFilters[K]
  ) => {
    setFilters((prev) => ({ ...prev, [key]: value }));
    setPage(1); // Reset page to 1 on filter change
  };

  const handleResetFilters = () => {
    setFilters(DEFAULT_FILTERS);
    setPage(1);
  };

  const hasActiveFilters =
    filters.search !== DEFAULT_FILTERS.search ||
    filters.category !== DEFAULT_FILTERS.category ||
    filters.status !== DEFAULT_FILTERS.status;

  const handlePrayToggle = (id: string) => {
    if (!user) return;
    togglePrayCount(id, user.id);
  };

  const handleDeleteRequest = (id: string) => {
    if (confirm("Are you sure you want to delete/archive this prayer request?")) {
      deleteRequest(id);
      toast.success("Prayer request successfully archived.");
    }
  };

  const handleRespondClick = (request: PrayerRequest) => {
    setSelectedRequest(request);
    setIsRespondOpen(true);
  };

  const handleRespondSubmit = (id: string, response: string) => {
    respondToRequest(id, response || null);
    toast.success("Pastor's response successfully recorded.");
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight text-primary-foreground">
            Prayer Center
          </h1>
          <p className="text-muted-foreground mt-1 text-sm">
            Share prayer requests, stand in agreement, and celebrate answered prayers.
          </p>
        </div>

        {canSubmit && (
          <Link
            href="/dashboard/prayer/create"
            className="flex items-center gap-1.5 rounded-xl bg-primary px-4 py-2.5 text-sm font-semibold text-primary-foreground shadow-neon transition-all hover:brightness-110"
          >
            <Plus className="h-4 w-4" />
            <span>Submit Request</span>
          </Link>
        )}
      </div>

      {/* Stats Cards */}
      <PrayerStatsCards prayers={getInitialPrayersList()} />

      {/* Filter and Control Bar */}
      <div className="flex flex-col gap-4 rounded-2xl border border-border/50 bg-card/40 p-4 backdrop-blur-glass md:flex-row md:items-center md:justify-between">
        {/* Left: Search & Filters */}
        <div className="flex flex-1 flex-col gap-3 md:flex-row md:items-center">
          <PrayerSearch
            value={filters.search}
            onChange={(val) => handleUpdateFilter("search", val)}
            className="md:max-w-xs"
          />
          <PrayerFiltersBar
            filters={filters}
            onUpdate={handleUpdateFilter}
            onReset={handleResetFilters}
            hasActive={hasActiveFilters}
          />
        </div>

        {/* Right: Sort controls */}
        <div className="flex items-center gap-2">
          <SortAsc className="h-4 w-4 text-muted-foreground" />
          <span className="text-xs font-medium text-muted-foreground select-none">
            Sort
          </span>
          <FilterSelect
            value={`${sortConfig.field}-${sortConfig.direction}`}
            onChange={(e) => {
              const [field, direction] = e.target.value.split("-");
              setSortConfig({
                field: field as PrayerSortConfig["field"],
                direction: direction as PrayerSortConfig["direction"],
              });
            }}
            aria-label="Sort prayer requests"
            className="min-w-[130px]"
          >
            <option value="created_at-desc">Newest First</option>
            <option value="created_at-asc">Oldest First</option>
            <option value="pray_count-desc">Most Prayed</option>
          </FilterSelect>
        </div>
      </div>

      {/* Requests Grid List */}
      {prayers.length > 0 ? (
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
          {prayers.map((req) => (
            <PrayerCard
              key={req.id}
              request={req}
              onPrayToggle={handlePrayToggle}
              onRespondClick={handleRespondClick}
              onDeleteClick={handleDeleteRequest}
            />
          ))}
        </div>
      ) : (
        <div className="rounded-2xl border border-dashed border-border/60 bg-card/25 p-12 text-center">
          <p className="text-base text-muted-foreground">
            No prayer requests found matching your filters.
          </p>
          {hasActiveFilters && (
            <button
              onClick={handleResetFilters}
              className="mt-3 text-sm text-primary font-semibold hover:underline"
            >
              Clear filters and show all
            </button>
          )}
        </div>
      )}

      {/* Pagination */}
      <PrayerPagination
        page={page}
        totalPages={totalPages}
        totalItems={totalItems}
        pageSize={PRAYERS_PER_PAGE}
        onPageChange={setPage}
      />

      {/* Pastor response Dialog popup */}
      <PrayerResponseDialog
        isOpen={isRespondOpen}
        onClose={() => {
          setIsRespondOpen(false);
          setSelectedRequest(null);
        }}
        onSubmit={handleRespondSubmit}
        request={selectedRequest}
      />
    </div>
  );
}

// Private helper to grab the unfiltered list from localStorage directly for overall stats
function getInitialPrayersList() {
  if (typeof window === "undefined") return [];
  const stored = localStorage.getItem("church-mock-prayers");
  if (stored) {
    try {
      return JSON.parse(stored);
    } catch {
      return [];
    }
  }
  return [];
}
