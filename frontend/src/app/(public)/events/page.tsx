"use client";

import { useState } from "react";
import { Calendar } from "lucide-react";
import { PublicNavbar } from "@/features/landing/components/public-navbar";
import { PublicFooter } from "@/features/landing/components/public-footer";
import {
  EventCard,
  EventFiltersBar,
  EventSearch,
  EventPagination,
  useFilteredEvents,
  type EventFilters,
  type EventSortConfig,
} from "@/features/events";

const EVENTS_PER_PAGE = 6;

export default function PublicEventsListPage() {
  const [page, setPage] = useState(1);

  // Force status to "Published" for public users
  const [filters, setFilters] = useState<EventFilters>({
    search: "",
    type: "all",
    status: "Published",
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
  } = useFilteredEvents(filters, sortConfig, page, EVENTS_PER_PAGE);

  const handleFilterUpdate = <K extends keyof EventFilters>(
    key: K,
    value: EventFilters[K]
  ) => {
    // Keep status locked to Published for public users
    if (key === "status") return;
    setFilters((prev) => ({ ...prev, [key]: value }));
    setPage(1);
  };

  const handleResetFilters = () => {
    setFilters({
      search: "",
      type: "all",
      status: "Published",
      dateRange: "all",
    });
    setPage(1);
  };

  const hasActiveFilters =
    filters.search !== "" ||
    filters.type !== "all" ||
    filters.dateRange !== "all";

  return (
    <div className="flex min-h-screen flex-col bg-slate-950 text-slate-100">
      <PublicNavbar />

      <main id="main-content" className="flex-grow px-4 py-12 lg:px-8">
        <div className="mx-auto max-w-7xl space-y-8">
          
          {/* Header */}
          <div className="border-b border-border/10 pb-5 space-y-2">
            <h1 className="font-display text-3xl font-bold text-white flex items-center gap-2">
              <Calendar className="h-7 w-7 text-indigo-400" />
              Church Events
            </h1>
            <p className="text-sm text-muted-foreground max-w-2xl">
              Join us for fellowship, service opportunities, worship services, and community events.
            </p>
          </div>

          {/* Search and Filters Bar */}
          <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between border-t border-border/10 pt-5">
            <EventSearch
              value={filters.search}
              onChange={(val) => handleFilterUpdate("search", val)}
              className="w-full md:max-w-xs"
            />
            {/* Tailwind arbitrary selector hides the 2nd select (the status select) in public catalog */}
            <div className="[&_select:nth-of-type(2)]:hidden">
              <EventFiltersBar
                filters={filters}
                onUpdate={handleFilterUpdate}
                onReset={handleResetFilters}
                hasActive={hasActiveFilters}
              />
            </div>
          </div>

          {/* Events Grid */}
          <div className="min-h-[400px]">
            {events.length === 0 ? (
              <div className="flex flex-col items-center justify-center border border-border/40 rounded-2xl bg-card/40 p-12 text-center backdrop-blur-glass">
                <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-slate-800 text-muted-foreground mb-4">
                  <Calendar className="h-6 w-6" />
                </div>
                <h3 className="text-base font-bold text-primary-foreground">No events found</h3>
                <p className="mt-1 text-xs text-muted-foreground max-w-sm">
                  {hasActiveFilters
                    ? "There are no events matching your search or filters. Try adjusting them."
                    : "There are no upcoming public events scheduled."}
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
              <div className="space-y-6">
                <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                  {events.map((event) => (
                    <EventCard
                      key={event.id}
                      event={event}
                      canEdit={false}
                    />
                  ))}
                </div>

                <EventPagination
                  page={page}
                  totalPages={totalPages}
                  totalItems={totalItems}
                  pageSize={EVENTS_PER_PAGE}
                  onPageChange={setPage}
                />
              </div>
            )}
          </div>

        </div>
      </main>

      <PublicFooter />
    </div>
  );
}
