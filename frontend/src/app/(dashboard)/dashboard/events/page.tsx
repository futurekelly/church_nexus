"use client";

import { useState } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { Calendar, Grid, Plus, CalendarPlus } from "lucide-react";
import {
  EventStatsCards,
  EventFiltersBar,
  EventSearch,
  EventCard,
  EventCalendarView,
  EventPagination,
  useFilteredEvents,
  type EventFilters,
  type EventSortConfig,
} from "@/features/events";
import { useAppPermissions } from "@/hooks/use-app-permissions";
import { SectionHeader } from "@/features/dashboard/components/widgets/section-header";
import { cn } from "@/lib/utils";

const EVENTS_PER_PAGE = 6;

export default function EventsListPage() {
  const [viewMode, setViewMode] = useState<"grid" | "calendar">("grid");
  const [page, setPage] = useState(1);

  const [filters, setFilters] = useState<EventFilters>({
    search: "",
    type: "all",
    status: "all",
    dateRange: "all",
  });

  const [sortConfig, setSortConfig] = useState<EventSortConfig>({
    key: "start_date",
    direction: "asc",
  });

  const {
    events,
    totalItems,
    totalPages,
    stats,
  } = useFilteredEvents(filters, sortConfig, page, EVENTS_PER_PAGE);

  const { events: eventPermissions } = useAppPermissions();
  const { canCreate, canEdit } = eventPermissions;

  const handleFilterUpdate = <K extends keyof EventFilters>(
    key: K,
    value: EventFilters[K]
  ) => {
    setFilters((prev) => ({ ...prev, [key]: value }));
    setPage(1); // Reset page on filter update
  };

  const handleResetFilters = () => {
    setFilters({
      search: "",
      type: "all",
      status: "all",
      dateRange: "all",
    });
    setPage(1);
  };

  const hasActiveFilters =
    filters.search !== "" ||
    filters.type !== "all" ||
    filters.status !== "all" ||
    filters.dateRange !== "all";

  return (
    <div className="space-y-6">
      {/* Top Section Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <SectionHeader
          title="Event Management"
          description="Schedule, organize, and coordinate church activities"
        />

        {canCreate && (
          <Link
            href="/dashboard/events/create"
            className={cn(
              "inline-flex items-center justify-center gap-1.5 rounded-xl bg-indigo-600 px-4 py-2.5 text-sm font-semibold text-white",
              "transition-all hover:bg-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/20",
              "shadow-[0_0_12px_rgba(99,102,241,0.3)] hover:shadow-[0_0_18px_rgba(99,102,241,0.5)]"
            )}
          >
            <Plus className="h-4 w-4" />
            Add Event
          </Link>
        )}
      </div>

      {/* Statistics Cards */}
      <EventStatsCards stats={stats} />

      {/* Filter and View Toggles Bar */}
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between border-t border-border/10 pt-4">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center flex-1">
          <EventSearch
            value={filters.search}
            onChange={(val) => handleFilterUpdate("search", val)}
            className="w-full sm:max-w-xs"
          />
          <EventFiltersBar
            filters={filters}
            onUpdate={handleFilterUpdate}
            onReset={handleResetFilters}
            hasActive={hasActiveFilters}
          />
        </div>

        {/* View Mode Toggle Buttons */}
        <div className="flex items-center gap-1.5 self-end md:self-auto bg-slate-950/40 p-1 rounded-xl border border-border/30">
          <button
            onClick={() => setViewMode("grid")}
            className={cn(
              "flex h-8 w-8 items-center justify-center rounded-lg text-muted-foreground transition-all",
              viewMode === "grid"
                ? "bg-indigo-500/20 text-indigo-400 border border-indigo-500/30"
                : "hover:bg-card/40 hover:text-primary-foreground"
            )}
            title="Grid View"
            aria-label="Switch to grid view"
          >
            <Grid className="h-4 w-4" />
          </button>
          <button
            onClick={() => setViewMode("calendar")}
            className={cn(
              "flex h-8 w-8 items-center justify-center rounded-lg text-muted-foreground transition-all",
              viewMode === "calendar"
                ? "bg-indigo-500/20 text-indigo-400 border border-indigo-500/30"
                : "hover:bg-card/40 hover:text-primary-foreground"
            )}
            title="Calendar View"
            aria-label="Switch to calendar view"
          >
            <Calendar className="h-4 w-4" />
          </button>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="min-h-[400px]">
        <AnimatePresence mode="wait">
          {viewMode === "grid" ? (
            <motion.div
              key="grid"
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -15 }}
              transition={{ duration: 0.25 }}
              className="space-y-6"
            >
              {events.length === 0 ? (
                <div className="flex flex-col items-center justify-center border border-border/40 rounded-2xl bg-card/40 p-12 text-center backdrop-blur-glass">
                  <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-slate-800 text-muted-foreground mb-4">
                    <CalendarPlus className="h-6 w-6" />
                  </div>
                  <h3 className="text-base font-bold text-primary-foreground">No events found</h3>
                  <p className="mt-1 text-xs text-muted-foreground max-w-sm">
                    {hasActiveFilters
                      ? "There are no events matching your search or filters. Try adjusting them."
                      : "There are no events scheduled at this moment."}
                  </p>
                  {hasActiveFilters && (
                    <button
                      onClick={handleResetFilters}
                      className="mt-4 rounded-xl border border-indigo-500/30 bg-indigo-500/10 px-4 py-2 text-xs font-semibold text-indigo-400 hover:bg-indigo-500/20 transition-all"
                    >
                      Reset Filters
                    </button>
                  )}
                </div>
              ) : (
                <>
                  <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                    {events.map((event) => (
                      <EventCard key={event.id} event={event} canEdit={canEdit} />
                    ))}
                  </div>

                  <EventPagination
                    page={page}
                    totalPages={totalPages}
                    totalItems={totalItems}
                    pageSize={EVENTS_PER_PAGE}
                    onPageChange={setPage}
                  />
                </>
              )}
            </motion.div>
          ) : (
            <motion.div
              key="calendar"
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -15 }}
              transition={{ duration: 0.25 }}
            >
              {/* Calendar needs to receive the full event list, not just the paginated slice */}
              <EventCalendarView events={events} />
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
