"use client";

import { useState } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { UserPlus, Trash2, AlertTriangle } from "lucide-react";
import { MemberStatsCards } from "@/features/members/components/member-stats-cards";
import { MemberSearch } from "@/features/members/components/member-search";
import { MemberFiltersBar } from "@/features/members/components/member-filters";
import { MemberTable } from "@/features/members/components/member-table";
import { MemberPagination } from "@/features/members/components/member-pagination";
import { MemberEmptyState } from "@/features/members/components/member-empty-state";
import { useMembers } from "@/features/members/hooks/use-members";
import { useAppPermissions } from "@/hooks/use-app-permissions";
import { MEMBERS_PER_PAGE } from "@/features/members/types/member.types";
import { SectionHeader } from "@/features/dashboard/components/widgets/section-header";
import type { Member } from "@/features/members/types/member.types";
import { useTranslation } from "@/hooks/use-translation";
import { cn } from "@/lib/utils";

// Simple inline confirm dialog (no external lib needed)
function DeleteConfirmDialog({
  member,
  onConfirm,
  onCancel,
}: {
  member: Member;
  onConfirm: () => void;
  onCancel: () => void;
}) {
  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm"
      role="dialog"
      aria-modal="true"
      aria-labelledby="delete-dialog-title"
    >
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="mx-4 w-full max-w-md rounded-2xl border border-red-500/20 bg-card/95 p-6 shadow-glass backdrop-blur-[16px]"
      >
        <div className="flex items-start gap-4">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-red-500/15">
            <AlertTriangle className="h-5 w-5 text-red-400" aria-hidden="true" />
          </div>
          <div>
            <h2
              id="delete-dialog-title"
              className="text-base font-semibold text-primary-foreground"
            >
              Delete Member
            </h2>
            <p className="mt-1 text-sm text-muted-foreground">
              Are you sure you want to delete{" "}
              <span className="font-medium text-primary-foreground">
                {member.first_name} {member.last_name}
              </span>
              ? This action cannot be undone.
            </p>
          </div>
        </div>
        <div className="mt-5 flex justify-end gap-3">
          <button
            type="button"
            onClick={onCancel}
            className="rounded-xl border border-border/50 bg-card/60 px-4 py-2 text-sm font-medium text-muted-foreground transition-all hover:text-primary-foreground"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={onConfirm}
            className="flex items-center gap-2 rounded-xl bg-red-500 px-4 py-2 text-sm font-medium text-white transition-all hover:bg-red-600"
          >
            <Trash2 className="h-4 w-4" aria-hidden="true" />
            Delete
          </button>
        </div>
      </motion.div>
    </div>
  );
}

export default function MembersListPage() {
  const {
    members,
    totalMembers,
    page,
    totalPages,
    setPage,
    filters,
    updateFilter,
    resetFilters,
    hasActiveFilters,
    sort,
    toggleSort,
  } = useMembers();

  const { t } = useTranslation();
  const { members: memberPermissions } = useAppPermissions();
  const { canCreate, canDelete } = memberPermissions;
  const [memberToDelete, setMemberToDelete] = useState<Member | null>(null);

  const handleDelete = (member: Member) => setMemberToDelete(member);
  const confirmDelete = () => {
    // In production: call API delete endpoint here
    console.info(`Deleting member: ${memberToDelete?.id}`);
    setMemberToDelete(null);
  };

  return (
    <div className="space-y-6">
      {/* Page header */}
      <motion.div
        initial={{ opacity: 0, y: -8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.35 }}
        className="flex flex-wrap items-start justify-between gap-4"
      >
        <div>
          <h1 className="font-display text-2xl font-bold text-primary-foreground">
            {t("members.title")}
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            {t("members.subtitle")}
          </p>
        </div>
        {canCreate && (
          <Link
            href="/dashboard/members/create"
            className={cn(
              "flex items-center gap-2 rounded-xl bg-primary px-4 py-2.5 text-sm font-semibold text-white",
              "transition-all hover:bg-primary/90 hover:shadow-neon",
              "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary",
            )}
            aria-label="Add new member"
          >
            <UserPlus className="h-4 w-4" aria-hidden="true" />
            {t("members.add_member")}
          </Link>
        )}
      </motion.div>

      {/* Stats */}
      <MemberStatsCards />

      {/* Search + Filters */}
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.35, delay: 0.1 }}
        className="space-y-3"
      >
        <MemberSearch
          value={filters.search}
          onChange={(v) => updateFilter("search", v)}
        />
        <MemberFiltersBar
          filters={filters}
          onUpdate={updateFilter}
          onReset={resetFilters}
          hasActive={hasActiveFilters}
        />
      </motion.div>

      {/* Results count */}
      <SectionHeader
        title={`${totalMembers} Member${totalMembers !== 1 ? "s" : ""}`}
        description={hasActiveFilters ? "Filtered results" : "All members"}
        delay={0.15}
      />

      {/* Table or empty state */}
      {members.length === 0 ? (
        <MemberEmptyState
          hasFilters={hasActiveFilters}
          onClear={resetFilters}
        />
      ) : (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.4, delay: 0.2 }}
          className="space-y-4"
        >
          <MemberTable
            members={members}
            sort={sort}
            onSort={toggleSort}
            onDelete={canDelete ? handleDelete : undefined}
          />
          <MemberPagination
            page={page}
            totalPages={totalPages}
            totalItems={totalMembers}
            pageSize={MEMBERS_PER_PAGE}
            onPageChange={setPage}
          />
        </motion.div>
      )}

      {/* Delete confirm dialog */}
      {memberToDelete && (
        <DeleteConfirmDialog
          member={memberToDelete}
          onConfirm={confirmDelete}
          onCancel={() => setMemberToDelete(null)}
        />
      )}
    </div>
  );
}
