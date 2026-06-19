"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { Plus, CheckSquare, Lock, Activity, Eye, FileBarChart, Calendar, HelpCircle, CheckCircle, XCircle } from "lucide-react";
import {
  AttendanceStats,
  SessionCard,
  CreateSessionModal,
  useAttendance,
  useFilteredSessions,
  SESSION_TYPES,
  SESSION_STATUSES,
  type SessionType,
  type SessionStatus,
  type AttendanceFilters,
  type AttendanceSortConfig,
  type AttendanceSession,
} from "@/features/attendance";
import { useAppPermissions } from "@/hooks/use-app-permissions";
import { MOCK_MEMBERS } from "@/features/members/data/mock-members";
import { useAuth } from "@/hooks/use-auth";
import { SearchInput } from "@/components/ui/search-input";
import { FilterSelect } from "@/components/ui/filter-select";
import { Pagination } from "@/components/ui/pagination";
import { StatusBadge } from "@/components/ui/status-badge";
import { cn } from "@/lib/utils";

const SESSIONS_PER_PAGE = 6;

export default function AttendanceDashboardPage() {
  const router = useRouter();
  const { user } = useAuth();
  const { attendance: attendancePermissions } = useAppPermissions();
  const { canManage, canViewReports, canViewAttendance, isMember } = attendancePermissions;
  
  const [page, setPage] = useState(1);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const [filters, setFilters] = useState<AttendanceFilters>({
    search: "",
    type: "all",
    status: "all",
  });

  const [sortConfig, setSortConfig] = useState<AttendanceSortConfig>({
    field: "date",
    direction: "desc",
  });

  // Load state and hooks
  const { sessions, records, addSession } = useAttendance();
  const {
    sessions: filteredSessions,
    totalItems,
    totalPages,
  } = useFilteredSessions(filters, sortConfig, page, SESSIONS_PER_PAGE);

  // Helper to map logged-in Member user to MOCK_MEMBERS
  const currentMember = MOCK_MEMBERS.find(
    (m) =>
      m.email.toLowerCase() === user?.email?.toLowerCase() ||
      (m.first_name.toLowerCase() === user?.first_name?.toLowerCase() &&
        m.last_name.toLowerCase() === user?.last_name?.toLowerCase())
  );

  // Filter records for Member view
  const memberRecords = records.filter(
    (r) => r.member_id === (currentMember?.id || "m002")
  );

  const memberPresent = memberRecords.filter((r) => r.status === "Present").length;
  const memberAbsent = memberRecords.filter((r) => r.status === "Absent").length;
  const memberExcused = memberRecords.filter((r) => r.status === "Excused").length;
  const memberTotal = memberRecords.length;
  const memberRate = memberTotal > 0 ? Math.round((memberPresent / memberTotal) * 100) : 0;

  const handleCreateSession = (data: { title: string; description: string; type: SessionType; date: string }) => {
    const newSession = addSession(data);
    setIsModalOpen(false);
    // Redirect to active scanning panel
    router.push(`/dashboard/attendance/${newSession.id}`);
  };

  const handleFilterChange = (key: keyof AttendanceFilters, value: string) => {
    setFilters((prev) => ({ ...prev, [key]: value }));
    setPage(1);
  };

  // 1. Visitors / Unauthorized view
  if (!canViewAttendance) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[500px] text-center p-8">
        <div className="relative overflow-hidden rounded-3xl border border-border/40 bg-slate-950/80 p-8 md:p-12 text-center backdrop-blur-md max-w-lg shadow-glass">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 mb-6">
            <Lock className="h-6 w-6" />
          </div>
          <h4 className="text-lg font-bold text-primary-foreground mb-2">Access Restricted</h4>
          <p className="text-sm text-muted-foreground mb-6 leading-relaxed">
            Attendance records and check-in panels are private. Please log in with a valid staff, pastor, or member account to view attendance.
          </p>
          <div className="flex justify-center gap-4">
            <Link
              href="/login"
              className="inline-flex items-center justify-center rounded-xl bg-indigo-600 px-6 py-2.5 text-xs font-bold text-white transition-all hover:bg-indigo-500 shadow-[0_0_12px_rgba(99,102,241,0.3)]"
            >
              Sign In
            </Link>
          </div>
        </div>
      </div>
    );
  }

  // 2. Member personal history view
  if (isMember) {
    return (
      <div className="space-y-8">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="font-display text-2xl font-bold text-primary-foreground md:text-3xl">
              My Attendance History
            </h1>
            <p className="mt-1 text-sm text-muted-foreground">
              Personal attendance record for {currentMember ? `${currentMember.first_name} ${currentMember.last_name}` : "Member"}
            </p>
          </div>
        </div>

        {/* Member KPI Stats */}
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          <div className="rounded-2xl border border-border/50 bg-card/60 p-5 backdrop-blur-glass shadow-glass flex flex-col justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Attendance Rate</span>
            <div className="flex items-baseline gap-2 mt-2">
              <span className="text-3xl font-extrabold text-indigo-400 font-mono">{memberRate}%</span>
            </div>
            <p className="text-[10px] text-muted-foreground mt-1">Total expected: {memberTotal} sessions</p>
          </div>

          <div className="rounded-2xl border border-border/50 bg-card/60 p-5 backdrop-blur-glass shadow-glass flex flex-col justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Services Attended</span>
            <div className="flex items-baseline gap-2 mt-2">
              <span className="text-3xl font-extrabold text-emerald-400 font-mono">{memberPresent}</span>
            </div>
            <p className="text-[10px] text-muted-foreground mt-1">Present status checked</p>
          </div>

          <div className="rounded-2xl border border-border/50 bg-card/60 p-5 backdrop-blur-glass shadow-glass flex flex-col justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Excused Absences</span>
            <div className="flex items-baseline gap-2 mt-2">
              <span className="text-3xl font-extrabold text-amber-400 font-mono">{memberExcused}</span>
            </div>
            <p className="text-[10px] text-muted-foreground mt-1">Formal excuse submitted</p>
          </div>

          <div className="rounded-2xl border border-border/50 bg-card/60 p-5 backdrop-blur-glass shadow-glass flex flex-col justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Missed / Absent</span>
            <div className="flex items-baseline gap-2 mt-2">
              <span className="text-3xl font-extrabold text-rose-400 font-mono">{memberAbsent}</span>
            </div>
            <p className="text-[10px] text-muted-foreground mt-1">No-show / Follow-up pending</p>
          </div>
        </div>

        {/* Member history list */}
        <div className="rounded-2xl border border-border/50 bg-card/60 p-6 backdrop-blur-glass shadow-glass space-y-4">
          <h3 className="text-base font-bold text-primary-foreground flex items-center gap-2">
            <CheckSquare className="h-5 w-5 text-indigo-400" />
            <span>Attendance Log</span>
          </h3>

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="border-b border-border/40 text-muted-foreground font-bold">
                  <th className="py-3 px-4">Session</th>
                  <th className="py-3 px-4">Date</th>
                  <th className="py-3 px-4">Type</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4">Check-in Method</th>
                  <th className="py-3 px-4">Scan Time</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/20">
                {memberRecords.map((rec) => {
                  const sess = sessions.find((s) => s.id === rec.session_id);
                  if (!sess) return null;

                  return (
                    <tr key={rec.id} className="hover:bg-slate-950/20 transition-colors">
                      <td className="py-3 px-4 font-semibold text-primary-foreground">{sess.title}</td>
                      <td className="py-3 px-4 text-muted-foreground">
                        {new Date(sess.date).toLocaleDateString("en-US", {
                          month: "short",
                          day: "numeric",
                          year: "numeric",
                        })}
                      </td>
                      <td className="py-3 px-4">
                        <span className="text-slate-400">{sess.type}</span>
                      </td>
                      <td className="py-3 px-4">
                        {rec.status === "Present" ? (
                          <StatusBadge label="Present" bgClass="bg-emerald-500/10" textClass="text-emerald-400" dotClass="bg-emerald-400" />
                        ) : rec.status === "Excused" ? (
                          <StatusBadge
                            label="Excused"
                            bgClass="bg-amber-500/10"
                            textClass="text-amber-400"
                            dotClass="bg-amber-400"
                            ariaLabel={`Excused: ${rec.excuse_notes}`}
                          />
                        ) : (
                          <StatusBadge label="Absent" bgClass="bg-rose-500/10" textClass="text-rose-400" dotClass="bg-rose-400" />
                        )}
                      </td>
                      <td className="py-3 px-4 text-muted-foreground">{rec.check_in_method || "—"}</td>
                      <td className="py-3 px-4 text-muted-foreground font-mono">
                        {rec.check_in_time
                          ? new Date(rec.check_in_time).toLocaleTimeString("en-US", {
                              hour: "2-digit",
                              minute: "2-digit",
                              hour12: true,
                            })
                          : "—"}
                      </td>
                    </tr>
                  );
                })}
                {memberRecords.length === 0 && (
                  <tr>
                    <td colSpan={6} className="text-center py-8 text-slate-500">
                      No attendance records found.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    );
  }

  // 3. Admin / Pastor / Staff Dashboard View
  return (
    <div className="space-y-8">
      {/* Top Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="font-display text-2xl font-bold text-primary-foreground md:text-3xl">
            Attendance Manager
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Monitor real-time check-ins, launch barcode scanning sessions, and review analytics
          </p>
        </div>

        {canManage && (
          <div className="flex gap-3">
            <Link
              href="/dashboard/attendance/create"
              className={cn(
                "inline-flex items-center justify-center gap-1.5 rounded-xl bg-indigo-600 px-4 py-2.5 text-sm font-semibold text-white",
                "transition-all hover:bg-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/20",
                "shadow-[0_0_12px_rgba(99,102,241,0.3)] hover:shadow-[0_0_18px_rgba(99,102,241,0.5)]"
              )}
            >
              <Plus className="h-4 w-4" />
              Start Session
            </Link>
          </div>
        )}
      </div>

      {/* Aggregate Statistics Overview */}
      <AttendanceStats sessions={sessions} />

      {/* Roster database tools */}
      <div className="space-y-6">
        <div className="flex items-center justify-between border-b border-border/10 pb-4">
          <h3 className="text-lg font-bold text-primary-foreground flex items-center gap-2">
            <Activity className="h-5 w-5 text-indigo-400" />
            <span>Check-in Sessions</span>
          </h3>
        </div>

        {/* Filter and Search Bar */}
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <SearchInput
            value={filters.search}
            onChange={(val) => handleFilterChange("search", val)}
            placeholder="Search sessions..."
            className="w-full md:max-w-xs"
            ariaLabel="Search attendance sessions"
          />
          <div className="flex flex-wrap items-center gap-3">
            <div>
              <span className="sr-only">Filter by type</span>
              <FilterSelect
                value={filters.type}
                onChange={(e) => handleFilterChange("type", e.target.value)}
                aria-label="Filter by session type"
              >
                <option value="all">All Types</option>
                {SESSION_TYPES.map((type) => (
                  <option key={type} value={type}>
                    {type}
                  </option>
                ))}
              </FilterSelect>
            </div>

            <div>
              <span className="sr-only">Filter by status</span>
              <FilterSelect
                value={filters.status}
                onChange={(e) => handleFilterChange("status", e.target.value)}
                aria-label="Filter by session status"
              >
                <option value="all">All Statuses</option>
                {SESSION_STATUSES.map((status) => (
                  <option key={status} value={status}>
                    {status}
                  </option>
                ))}
              </FilterSelect>
            </div>

            {(filters.search || filters.type !== "all" || filters.status !== "all") && (
              <button
                type="button"
                onClick={() => {
                  setFilters({ search: "", type: "all", status: "all" });
                  setPage(1);
                }}
                className="text-xs font-semibold text-indigo-400 hover:text-indigo-300 underline underline-offset-4"
              >
                Clear Filters
              </button>
            )}
          </div>
        </div>

        {/* Sessions list */}
        <div className="min-h-[250px]">
          {filteredSessions.length === 0 ? (
            <div className="flex flex-col items-center justify-center border border-border/40 rounded-2xl bg-card/40 p-12 text-center backdrop-blur-glass">
              <CheckSquare className="h-10 w-10 text-muted-foreground mb-4 opacity-40" />
              <h3 className="text-base font-bold text-primary-foreground font-display">No sessions found</h3>
              <p className="mt-1 text-xs text-muted-foreground max-w-sm">
                Try adjusting your search query or filters, or start a new check-in session.
              </p>
            </div>
          ) : (
            <div className="space-y-6">
              <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                {filteredSessions.map((session: AttendanceSession) => (
                  <SessionCard
                    key={session.id}
                    session={session}
                  />
                ))}
              </div>

              <Pagination
                page={page}
                totalPages={totalPages}
                totalItems={totalItems}
                pageSize={SESSIONS_PER_PAGE}
                onPageChange={setPage}
                itemName="sessions"
                variant="indigo"
              />
            </div>
          )}
        </div>
      </div>

      {/* Create Modal Overlay Backup */}
      <CreateSessionModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSubmit={handleCreateSession}
      />
    </div>
  );
}
