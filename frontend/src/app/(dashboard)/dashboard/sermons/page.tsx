"use client";

import { useState } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { Plus, Library, Lock, Radio } from "lucide-react";
import {
  SermonFeaturedHero,
  SermonFiltersBar,
  SermonSearch,
  SermonCard,
  SermonPagination,
  useFilteredSermons,
  type SermonFilters,
  type SermonSortConfig,
} from "@/features/sermons";
import { useAppPermissions } from "@/hooks/use-app-permissions";
import { SectionHeader } from "@/features/dashboard/components/widgets/section-header";
import { cn } from "@/lib/utils";

const SERMONS_PER_PAGE = 6;

export default function SermonsListPage() {
  const [page, setPage] = useState(1);
  const { sermons: sermonPermissions } = useAppPermissions();
  const { canCreate, canEdit, canViewLibrary } = sermonPermissions;

  const [filters, setFilters] = useState<SermonFilters>({
    search: "",
    category: "all",
    status: "all",
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
    featuredSermon,
    deleteSermon,
  } = useFilteredSermons(filters, sortConfig, page, SERMONS_PER_PAGE);

  const handleFilterUpdate = <K extends keyof SermonFilters>(
    key: K,
    value: SermonFilters[K]
  ) => {
    setFilters((prev) => ({ ...prev, [key]: value }));
    setPage(1);
  };

  const handleResetFilters = () => {
    setFilters({
      search: "",
      category: "all",
      status: "all",
      speaker: "all",
    });
    setPage(1);
  };

  const hasActiveFilters =
    filters.search !== "" ||
    filters.category !== "all" ||
    filters.status !== "all" ||
    filters.speaker !== "all";

  return (
    <div className="space-y-8">
      {/* Top Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <SectionHeader
          title="Sermon Library"
          description="Explore biblical teachings, watch streams, and download study guides"
        />

        {canCreate && (
          <Link
            href="/dashboard/sermons/create"
            className={cn(
              "inline-flex items-center justify-center gap-1.5 rounded-xl bg-indigo-600 px-4 py-2.5 text-sm font-semibold text-white",
              "transition-all hover:bg-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/20",
              "shadow-[0_0_12px_rgba(99,102,241,0.3)] hover:shadow-[0_0_18px_rgba(99,102,241,0.5)]"
            )}
          >
            <Plus className="h-4 w-4" />
            Add Sermon
          </Link>
        )}
      </div>

      {/* Featured Hero (Visible to all, including visitors) */}
      {featuredSermon ? (
        <div className="space-y-3">
          <h3 className="text-sm font-bold tracking-wider text-indigo-400 uppercase flex items-center gap-1.5">
            <Radio className="h-4 w-4 animate-pulse text-indigo-500" />
            Spotlight Message
          </h3>
          <SermonFeaturedHero sermon={featuredSermon} />
        </div>
      ) : (
        <div className="rounded-2xl border border-dashed border-border/40 p-6 text-center text-xs text-muted-foreground">
          No featured sermon set currently.
        </div>
      )}

      {/* Main library listing or restrictions */}
      <div className="space-y-6">
        <div className="flex items-center justify-between border-b border-border/10 pb-4">
          <h3 className="text-lg font-bold text-primary-foreground flex items-center gap-2">
            <Library className="h-5 w-5 text-indigo-400" />
            Sermon Catalog
          </h3>
        </div>

        {canViewLibrary ? (
          <>
            {/* Filter and Search Bar */}
            <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
              <SermonSearch
                value={filters.search || ""}
                onChange={(val) => handleFilterUpdate("search", val)}
                className="w-full md:max-w-xs"
              />
              <SermonFiltersBar
                filters={filters}
                onUpdate={handleFilterUpdate}
                onReset={handleResetFilters}
                hasActive={hasActiveFilters}
              />
            </div>

            {/* Catalog Grid */}
            <div className="min-h-[350px]">
              {sermons.length === 0 ? (
                <div className="flex flex-col items-center justify-center border border-border/40 rounded-2xl bg-card/40 p-12 text-center backdrop-blur-glass">
                  <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-slate-800 text-muted-foreground mb-4">
                    <Library className="h-6 w-6" />
                  </div>
                  <h3 className="text-base font-bold text-primary-foreground">No sermons found</h3>
                  <p className="mt-1 text-xs text-muted-foreground max-w-sm">
                    {hasActiveFilters
                      ? "There are no sermons matching your search or filters. Try adjusting them."
                      : "The library is currently empty."}
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
                        canEdit={canEdit}
                        isDashboard={true}
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
          </>
        ) : (
          /* Visitor Restricted Overlay */
          <div className="relative overflow-hidden rounded-3xl border border-border/40 bg-slate-950/80 p-8 md:p-12 text-center backdrop-blur-md">
            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 mb-6">
              <Lock className="h-6 w-6" />
            </div>
            <h4 className="text-lg font-bold text-primary-foreground mb-2">Unlock Church Nexus Sermon Library</h4>
            <p className="text-sm text-muted-foreground max-w-lg mx-auto mb-6 leading-relaxed">
              You are currently viewing as a **Visitor**. To access the complete library of 12+ theological sermons, listen to full archives, read transcripts, and download reflection study notes, please sign in or register for a member account.
            </p>
            <div className="flex justify-center gap-4">
              <Link
                href="/login"
                className="inline-flex items-center justify-center rounded-xl bg-indigo-600 px-6 py-2.5 text-xs font-bold text-white transition-all hover:bg-indigo-500 shadow-[0_0_12px_rgba(99,102,241,0.3)]"
              >
                Sign In
              </Link>
              <Link
                href="/register"
                className="inline-flex items-center justify-center rounded-xl border border-border/50 bg-card/60 px-6 py-2.5 text-xs font-bold text-muted-foreground transition-all hover:border-indigo-500/40 hover:text-indigo-400"
              >
                Register Account
              </Link>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
