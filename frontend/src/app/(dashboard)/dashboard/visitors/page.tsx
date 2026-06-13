"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { Plus, UserCheck, Lock, Activity, Eye, Trash2, Calendar, FileDown, PlusCircle, X } from "lucide-react";
import {
  useFollowUp,
  useFollowUpPermissions,
  VisitorForm,
  type VisitorProfile,
  FOLLOW_UP_STATUS_COLORS,
} from "@/features/follow-up";
import { SearchInput } from "@/components/ui/search-input";
import { FilterSelect } from "@/components/ui/filter-select";
import { Pagination } from "@/components/ui/pagination";
import { StatusBadge } from "@/components/ui/status-badge";
import { cn } from "@/lib/utils";

const VISITORS_PER_PAGE = 8;

export default function VisitorsListPage() {
  const { visitors, tickets, addVisitor } = useFollowUp();
  const { canManage, canViewFollowUp } = useFollowUpPermissions();
  
  const [page, setPage] = useState(1);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [search, setSearch] = useState("");
  const [genderFilter, setGenderFilter] = useState<"all" | "male" | "female">("all");
  const [visitorTypeFilter, setVisitorTypeFilter] = useState<"all" | "first-time" | "returning">("all");

  // Filter visitors
  const filteredVisitors = useMemo(() => {
    return visitors.filter((v) => {
      const q = search.toLowerCase();
      const nameMatch =
        v.first_name.toLowerCase().includes(q) ||
        v.last_name.toLowerCase().includes(q) ||
        v.email.toLowerCase().includes(q) ||
        v.membership_number.toLowerCase().includes(q);

      const genderMatch = genderFilter === "all" || v.gender === genderFilter;

      const typeMatch =
        visitorTypeFilter === "all" ||
        (visitorTypeFilter === "first-time" && v.first_time_visitor) ||
        (visitorTypeFilter === "returning" && !v.first_time_visitor);

      return nameMatch && genderMatch && typeMatch;
    });
  }, [visitors, search, genderFilter, visitorTypeFilter]);

  // Pagination
  const totalItems = filteredVisitors.length;
  const totalPages = Math.ceil(totalItems / VISITORS_PER_PAGE);
  const paginatedVisitors = useMemo(() => {
    const startIndex = (page - 1) * VISITORS_PER_PAGE;
    return filteredVisitors.slice(startIndex, startIndex + VISITORS_PER_PAGE);
  }, [filteredVisitors, page]);

  const handleRegisterVisitor = (values: any) => {
    const noteText = values.notes || `Registered visitor manually. Reason: ${values.visit_reason || "None"}`;
    addVisitor(values, noteText);
    setIsFormOpen(false);
  };

  const handleFilterChange = (setter: (val: any) => void, val: any) => {
    setter(val);
    setPage(1);
  };

  // 1. Visitor Restricted View
  if (!canViewFollowUp) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[500px] text-center p-8 select-none">
        <div className="relative overflow-hidden rounded-3xl border border-border/40 bg-slate-950/80 p-8 md:p-12 text-center backdrop-blur-md max-w-lg shadow-glass">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 mb-6">
            <Lock className="h-6 w-6" />
          </div>
          <h4 className="text-lg font-bold text-primary-foreground mb-2">Access Restricted</h4>
          <p className="text-sm text-muted-foreground mb-6 leading-relaxed">
            Visitor records and directories are private. Please sign in with a pastor or administrator account to view visitor logs.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="font-display text-2xl font-bold text-primary-foreground md:text-3xl">
            Visitor Registry
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            View first-time guest cards, manage contacts, and trace pipeline histories
          </p>
        </div>

        {canManage && (
          <button
            type="button"
            onClick={() => setIsFormOpen(true)}
            className={cn(
              "inline-flex items-center justify-center gap-1.5 rounded-xl bg-indigo-600 px-4 py-2.5 text-sm font-semibold text-white",
              "transition-all hover:bg-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/20",
              "shadow-[0_0_12px_rgba(99,102,241,0.3)] hover:shadow-[0_0_18px_rgba(99,102,241,0.5)]"
            )}
          >
            <Plus className="h-4 w-4" />
            <span>Register Visitor</span>
          </button>
        )}
      </div>

      {/* Directory Tools */}
      <div className="rounded-2xl border border-border/50 bg-card/60 p-5 backdrop-blur-glass shadow-glass space-y-5">
        <div className="flex items-center justify-between border-b border-border/10 pb-3 select-none">
          <h3 className="text-base font-bold text-primary-foreground flex items-center gap-2">
            <UserCheck className="h-5 w-5 text-indigo-400" />
            <span>Visitor Records Database</span>
          </h3>
        </div>

        {/* Filters */}
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <SearchInput
            value={search}
            onChange={(val) => handleFilterChange(setSearch, val)}
            placeholder="Search visitor names, emails..."
            className="w-full md:max-w-xs"
            ariaLabel="Search visitor database"
          />

          <div className="flex flex-wrap items-center gap-3">
            <div>
              <span className="sr-only">Filter by Gender</span>
              <FilterSelect
                value={genderFilter}
                onChange={(e) => handleFilterChange(setGenderFilter, e.target.value)}
                aria-label="Filter by Gender"
              >
                <option value="all">All Genders</option>
                <option value="female">Female</option>
                <option value="male">Male</option>
              </FilterSelect>
            </div>

            <div>
              <span className="sr-only">Filter by Visitor Type</span>
              <FilterSelect
                value={visitorTypeFilter}
                onChange={(e) => handleFilterChange(setVisitorTypeFilter, e.target.value)}
                aria-label="Filter by visitor type"
              >
                <option value="all">All Guest Types</option>
                <option value="first-time">First-time Visitors</option>
                <option value="returning">Returning Guests</option>
              </FilterSelect>
            </div>

            {(search || genderFilter !== "all" || visitorTypeFilter !== "all") && (
              <button
                type="button"
                onClick={() => {
                  setSearch("");
                  setGenderFilter("all");
                  setVisitorTypeFilter("all");
                  setPage(1);
                }}
                className="text-xs font-semibold text-indigo-400 hover:text-indigo-300 underline underline-offset-4"
              >
                Clear Filters
              </button>
            )}
          </div>
        </div>

        {/* Database Table */}
        <div className="overflow-x-auto min-h-[300px]">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="border-b border-border/40 text-muted-foreground font-bold select-none">
                <th className="py-3 px-4">Visitor No</th>
                <th className="py-3 px-4">Name</th>
                <th className="py-3 px-4">Gender</th>
                <th className="py-3 px-4">Contact</th>
                <th className="py-3 px-4">Date Joined</th>
                <th className="py-3 px-4">Pipeline Status</th>
                <th className="py-3 px-4">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border/20">
              {paginatedVisitors.map((vis) => {
                // Find matching ticket for this visitor to extract status colors and links
                const matchingTicket = tickets.find((t) => t.visitor_id === vis.id);
                const status = matchingTicket?.status || "New Visitor";
                const colors = FOLLOW_UP_STATUS_COLORS[status];

                return (
                  <tr key={vis.id} className="hover:bg-slate-950/20 transition-colors">
                    <td className="py-3.5 px-4 font-mono font-bold text-slate-400">{vis.membership_number}</td>
                    <td className="py-3.5 px-4 font-semibold text-primary-foreground">
                      {vis.first_name} {vis.last_name}
                      {vis.first_time_visitor && (
                        <span className="ml-2 inline-flex items-center text-[9px] font-bold text-indigo-400 bg-indigo-500/10 border border-indigo-500/20 px-1.5 py-0.5 rounded-full">
                          1st Time
                        </span>
                      )}
                    </td>
                    <td className="py-3.5 px-4 text-muted-foreground capitalize">{vis.gender}</td>
                    <td className="py-3.5 px-4">
                      <div className="flex flex-col gap-0.5 text-muted-foreground">
                        <span>{vis.email}</span>
                        <span>{vis.phone_number}</span>
                      </div>
                    </td>
                    <td className="py-3.5 px-4 text-muted-foreground">
                      {new Date(vis.date_joined).toLocaleDateString("en-US", {
                        month: "short",
                        day: "numeric",
                        year: "numeric",
                      })}
                    </td>
                    <td className="py-3.5 px-4">
                      <StatusBadge
                        label={status}
                        bgClass={colors.bg}
                        textClass={colors.text}
                        dotClass={colors.dot}
                      />
                    </td>
                    <td className="py-3.5 px-4">
                      {matchingTicket ? (
                        <Link
                          href={`/dashboard/follow-up/${matchingTicket.id}`}
                          className="inline-flex items-center gap-1 text-[11px] font-semibold text-indigo-400 hover:text-indigo-300 transition-colors"
                        >
                          <Eye className="h-3.5 w-3.5" />
                          <span>View Logs</span>
                        </Link>
                      ) : (
                        <span className="text-slate-500">No active ticket</span>
                      )}
                    </td>
                  </tr>
                );
              })}
              {paginatedVisitors.length === 0 && (
                <tr>
                  <td colSpan={7} className="text-center py-12 text-slate-500 select-none">
                    No visitor records match your filters.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        <Pagination
          page={page}
          totalPages={totalPages}
          totalItems={totalItems}
          pageSize={VISITORS_PER_PAGE}
          onPageChange={setPage}
          itemName="visitors"
          variant="indigo"
        />
      </div>

      {/* Register Drawer Slide Overlay */}
      <AnimatePresence>
        {isFormOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-end p-0">
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsFormOpen(false)}
              className="absolute inset-0 bg-background/85 backdrop-blur-sm"
            />

            {/* Sidebar form drawer */}
            <motion.div
              initial={{ x: "100%" }}
              animate={{ x: 0 }}
              exit={{ x: "100%" }}
              transition={{ type: "spring", damping: 25, stiffness: 200 }}
              className="relative w-full max-w-lg h-full overflow-y-auto border-l border-border/40 bg-card p-6 shadow-2xl backdrop-blur-glass z-10 flex flex-col"
            >
              {/* Close header */}
              <div className="flex items-center justify-between border-b border-border/20 pb-3.5 mb-4 select-none">
                <div className="flex items-center gap-2 text-indigo-400">
                  <UserCheck className="h-5 w-5" />
                  <h2 className="text-lg font-bold text-primary-foreground font-display">
                    Register New Visitor
                  </h2>
                </div>
                <button
                  onClick={() => setIsFormOpen(false)}
                  className="text-muted-foreground hover:text-primary-foreground transition-colors"
                  aria-label="Close form drawer"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>

              {/* Form body */}
              <div className="flex-1">
                <VisitorForm
                  onSubmit={handleRegisterVisitor}
                  onCancel={() => setIsFormOpen(false)}
                />
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
