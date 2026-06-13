"use client";

import { useState } from "react";
import { Library } from "lucide-react";
import { PublicNavbar } from "@/features/landing/components/public-navbar";
import { PublicFooter } from "@/features/landing/components/public-footer";
import {
  SermonCard,
  SermonFiltersBar,
  SermonSearch,
  SermonPagination,
  useFilteredSermons,
  type SermonFilters,
  type SermonSortConfig,
} from "@/features/sermons";

const SERMONS_PER_PAGE = 6;

export default function PublicSermonsListPage() {
  const [page, setPage] = useState(1);

  // Force status to "Published" for the public catalog
  const [filters, setFilters] = useState<SermonFilters>({
    search: "",
    category: "all",
    status: "Published",
    speaker: "all",
  });

  const [sortConfig, setSortConfig] = useState<SermonSortConfig>({
    key: "sermon_date",
    direction: "desc",
  });

  const {
    sermons,
    totalItems,
    totalPages,
  } = useFilteredSermons(filters, sortConfig, page, SERMONS_PER_PAGE);

  const handleFilterUpdate = <K extends keyof SermonFilters>(
    key: K,
    value: SermonFilters[K]
  ) => {
    // Keep status locked to Published for public users
    if (key === "status") return;
    setFilters((prev) => ({ ...prev, [key]: value }));
    setPage(1);
  };

  const handleResetFilters = () => {
    setFilters({
      search: "",
      category: "all",
      status: "Published",
      speaker: "all",
    });
    setPage(1);
  };

  const hasActiveFilters =
    filters.search !== "" ||
    filters.category !== "all" ||
    filters.speaker !== "all";

  return (
    <div className="flex min-h-screen flex-col bg-slate-950 text-slate-100">
      <PublicNavbar />

      <main id="main-content" className="flex-grow px-4 py-12 lg:px-8">
        <div className="mx-auto max-w-7xl space-y-8">
          
          {/* Header */}
          <div className="border-b border-border/10 pb-5 space-y-2">
            <h1 className="font-display text-3xl font-bold text-white flex items-center gap-2">
              <Library className="h-7 w-7 text-indigo-400" />
              Sermon Archive
            </h1>
            <p className="text-sm text-muted-foreground max-w-2xl">
              Listen, watch, and search through our archive of recent messages, outlines, and study guides.
            </p>
          </div>

          {/* Search and Filters Bar */}
          <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between border-t border-border/10 pt-5">
            <SermonSearch
              value={filters.search}
              onChange={(val) => handleFilterUpdate("search", val)}
              className="w-full md:max-w-xs"
            />
            {/* Tailwind arbitrary class is used to hide the status dropdown (the 3rd select) in public catalog */}
            <div className="[&_select:nth-of-type(3)]:hidden">
              <SermonFiltersBar
                filters={filters}
                onUpdate={handleFilterUpdate}
                onReset={handleResetFilters}
                hasActive={hasActiveFilters}
              />
            </div>
          </div>

          {/* Sermons Grid */}
          <div className="min-h-[400px]">
            {sermons.length === 0 ? (
              <div className="flex flex-col items-center justify-center border border-border/40 rounded-2xl bg-card/40 p-12 text-center backdrop-blur-glass">
                <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-slate-800 text-muted-foreground mb-4">
                  <Library className="h-6 w-6" />
                </div>
                <h3 className="text-base font-bold text-primary-foreground">No sermons found</h3>
                <p className="mt-1 text-xs text-muted-foreground max-w-sm">
                  {hasActiveFilters
                    ? "There are no sermons matching your search or filters. Try adjusting them."
                    : "The public library is empty."}
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
                  {sermons.map((sermon) => (
                    <SermonCard
                      key={sermon.id}
                      sermon={sermon}
                      canEdit={false}
                      isDashboard={false}
                    />
                  ))}
                </div>

                <SermonPagination
                  page={page}
                  totalPages={totalPages}
                  totalItems={totalItems}
                  pageSize={SERMONS_PER_PAGE}
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
