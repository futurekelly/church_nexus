"use client";

import { useState, useMemo } from "react";
import { Check, X, ShieldAlert, UserX } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";
import type { AttendanceRecord } from "../types/attendance.types";
import { SearchInput } from "@/components/ui/search-input";
import { FilterSelect } from "@/components/ui/filter-select";
import { Pagination } from "@/components/ui/pagination";

interface ManualChecklistProps {
  records: AttendanceRecord[];
  onCheckIn: (memberId: string, status: "Present" | "Absent", method: "QR" | "Barcode" | "Manual" | null) => void;
  onExcuse: (memberId: string, notes: string) => void;
  canManage?: boolean;
}

const ITEMS_PER_PAGE = 8;

export function ManualChecklist({ records, onCheckIn, onExcuse, canManage = true }: ManualChecklistProps) {
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<"all" | "Present" | "Absent" | "Excused">("all");
  const [genderFilter, setGenderFilter] = useState<"all" | "male" | "female">("all");
  const [page, setPage] = useState(1);
  const [excuseNotesText, setExcuseNotesText] = useState("");
  const [excusingMemberId, setExcusingMemberId] = useState<string | null>(null);

  // Filter logs
  const filtered = useMemo(() => {
    return records.filter((r) => {
      const q = search.toLowerCase();
      const nameMatch = r.member_name.toLowerCase().includes(q) || r.membership_number.toLowerCase().includes(q);
      const statusMatch = statusFilter === "all" || r.status === statusFilter;
      const genderMatch = genderFilter === "all" || r.gender === genderFilter;
      return nameMatch && statusMatch && genderMatch;
    });
  }, [records, search, statusFilter, genderFilter]);

  // Pagination
  const totalPages = Math.ceil(filtered.length / ITEMS_PER_PAGE);
  const paginated = useMemo(() => {
    const start = (page - 1) * ITEMS_PER_PAGE;
    return filtered.slice(start, start + ITEMS_PER_PAGE);
  }, [filtered, page]);

  const handleExcuseClick = (memberId: string) => {
    setExcusingMemberId(memberId);
    setExcuseNotesText("");
  };

  const handleExcuseSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (excusingMemberId && excuseNotesText.trim()) {
      onExcuse(excusingMemberId, excuseNotesText.trim());
      setExcusingMemberId(null);
      setExcuseNotesText("");
    }
  };

  return (
    <div className="space-y-4">
      {/* Search and Filters */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <SearchInput
          value={search}
          onChange={(val) => {
            setSearch(val);
            setPage(1);
          }}
          placeholder="Search by name or member number..."
          className="max-w-xs"
        />

        <div className="flex flex-wrap items-center gap-3">
          {/* Status filter */}
          <FilterSelect
            value={statusFilter}
            onChange={(e) => {
              setStatusFilter(e.target.value as any);
              setPage(1);
            }}
            aria-label="Filter check-in status"
            className="min-w-[130px]"
          >
            <option value="all">All Check-ins</option>
            <option value="Present">Present</option>
            <option value="Absent">Absent</option>
            <option value="Excused">Excused</option>
          </FilterSelect>

          {/* Gender filter */}
          <FilterSelect
            value={genderFilter}
            onChange={(e) => {
              setGenderFilter(e.target.value as any);
              setPage(1);
            }}
            aria-label="Filter gender"
            className="min-w-[120px]"
          >
            <option value="all">All Genders</option>
            <option value="male">Male</option>
            <option value="female">Female</option>
          </FilterSelect>
        </div>
      </div>

      {/* Roster Grid list */}
      <div className="rounded-2xl border border-border/50 bg-slate-900/20 overflow-hidden backdrop-blur-glass">
        {paginated.length > 0 ? (
          <div className="divide-y divide-border/40">
            {paginated.map((r) => {
              const isPresent = r.status === "Present";
              const isExcused = r.status === "Excused";

              return (
                <div
                  key={r.id}
                  className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 hover:bg-slate-950/20 transition-all duration-200"
                >
                  <div className="flex items-center gap-3">
                    {/* Visual status dot indicator */}
                    <div
                      className={cn(
                        "h-2.5 w-2.5 rounded-full",
                        isPresent
                          ? "bg-emerald-400 shadow-[0_0_8px_#10b981]"
                          : isExcused
                          ? "bg-amber-400 shadow-[0_0_8px_#f59e0b]"
                          : "bg-slate-700"
                      )}
                    />
                    <div>
                      <p className="font-bold text-sm text-primary-foreground">
                        {r.member_name}
                      </p>
                      <p className="text-xs text-muted-foreground mt-0.5">
                        Member No: {r.membership_number} • {r.gender}
                      </p>
                      {r.excuse_notes && (
                        <p className="text-[10px] text-amber-400 italic mt-1 bg-amber-500/5 px-2 py-1 rounded border border-amber-500/10">
                          Excuse: "{r.excuse_notes}"
                        </p>
                      )}
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex flex-wrap items-center gap-2">
                    {isPresent ? (
                      <>
                        <span className="flex items-center gap-1 text-xs font-bold text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 rounded-xl px-2.5 py-1">
                          <Check className="h-3.5 w-3.5" />
                          <span>Present ({r.check_in_method})</span>
                        </span>
                        {canManage && (
                          <button
                            type="button"
                            onClick={() => onCheckIn(r.member_id, "Absent", null)}
                            className="flex h-8 items-center gap-1 rounded-lg border border-red-500/20 bg-card/40 px-2.5 text-xs text-red-400 transition-all hover:bg-red-500/10 hover:border-red-500/40"
                          >
                            <X className="h-3.5 w-3.5" />
                            <span>Mark Absent</span>
                          </button>
                        )}
                      </>
                    ) : isExcused ? (
                      <>
                        <span className="flex items-center gap-1 text-xs font-bold text-amber-400 bg-amber-500/10 border border-amber-500/20 rounded-xl px-2.5 py-1">
                          <ShieldAlert className="h-3.5 w-3.5" />
                          <span>Excused Absence</span>
                        </span>
                        {canManage && (
                          <button
                            type="button"
                            onClick={() => onCheckIn(r.member_id, "Absent", null)}
                            className="flex h-8 items-center gap-1 rounded-lg border border-border bg-card/40 px-2.5 text-xs text-muted-foreground transition-all hover:text-primary-foreground hover:bg-slate-900"
                          >
                            <X className="h-3.5 w-3.5" />
                            <span>Reset</span>
                          </button>
                        )}
                      </>
                    ) : (
                      <>
                        {canManage ? (
                          <>
                            <button
                              type="button"
                              onClick={() => onCheckIn(r.member_id, "Present", "Manual")}
                              className="flex h-8 items-center gap-1 rounded-lg bg-indigo-600 px-3 text-xs font-semibold text-primary-foreground shadow-[0_0_8px_rgba(99,102,241,0.2)] hover:bg-indigo-500 transition-all"
                            >
                              <Check className="h-3.5 w-3.5" />
                              <span>Check In</span>
                            </button>
                            <button
                              type="button"
                              onClick={() => handleExcuseClick(r.member_id)}
                              className="flex h-8 items-center gap-1 rounded-lg border border-border bg-card/40 px-2.5 text-xs text-muted-foreground transition-all hover:text-primary-foreground hover:bg-slate-900"
                            >
                              <UserX className="h-3.5 w-3.5" />
                              <span>Log Excuse</span>
                            </button>
                          </>
                        ) : (
                          <span className="flex items-center gap-1 text-xs font-semibold text-slate-500 bg-slate-800/20 border border-border/20 rounded-xl px-2.5 py-1">
                            <X className="h-3.5 w-3.5 text-slate-600" />
                            <span>Absent</span>
                          </span>
                        )}
                      </>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="text-center py-12 text-xs text-slate-500 select-none">
            No expected attendees match your query or filters.
          </div>
        )}
      </div>

      {/* Pagination wrapper */}
      <Pagination
        page={page}
        totalPages={totalPages}
        totalItems={filtered.length}
        pageSize={ITEMS_PER_PAGE}
        onPageChange={setPage}
        itemName="expected members"
        variant="indigo"
      />

      {/* excuse notes modal dialog */}
      <AnimatePresence>
        {excusingMemberId && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setExcusingMemberId(null)}
              className="absolute inset-0 bg-background/80 backdrop-blur-sm"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="relative w-full max-w-sm overflow-hidden rounded-2xl border border-border/50 bg-card/90 p-5 shadow-2xl backdrop-blur-glass z-10"
            >
              <form onSubmit={handleExcuseSubmit} className="space-y-4">
                <div>
                  <h3 className="text-sm font-bold text-primary-foreground">
                    Excuse Member Absence
                  </h3>
                  <p className="text-[11px] text-muted-foreground mt-1">
                    Provide the excuse notes/reason for this absence (e.g. sick leave, traveling).
                  </p>
                </div>

                <textarea
                  required
                  rows={3}
                  value={excuseNotesText}
                  onChange={(e) => setExcuseNotesText(e.target.value)}
                  placeholder="e.g. Out of town for business trip..."
                  className={cn(
                    "w-full rounded-xl border border-border/50 bg-card/60 px-3 py-2 text-xs text-primary-foreground resize-none focus:outline-none focus:border-primary/50"
                  )}
                />

                <div className="flex items-center justify-end gap-2 text-xs">
                  <button
                    type="button"
                    onClick={() => setExcusingMemberId(null)}
                    className="rounded-lg border border-border bg-card/40 px-3 py-1.5 font-semibold text-muted-foreground hover:text-primary-foreground"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="rounded-lg bg-primary px-3 py-1.5 font-semibold text-primary-foreground shadow-neon"
                  >
                    Save Excuse
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
