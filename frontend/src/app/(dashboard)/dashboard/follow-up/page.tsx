"use client";

import { useEffect, useState, useMemo, useCallback } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { KanbanBoard, useFollowUp, VisitorForm, type FollowUpStatus } from "@/features/follow-up";
import { useAppPermissions } from "@/hooks/use-app-permissions";
import { useAuth } from "@/hooks/use-auth";
import { SearchInput } from "@/components/ui/search-input";
import { FilterSelect } from "@/components/ui/filter-select";
import {
  Lock, RefreshCw, BarChart2, CheckCircle, AlertCircle, Users, Clock, UserPlus, X,
} from "lucide-react";
import { apiGet, isApiError } from "@/services/api-client";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

interface AnalyticsKPIs {
  new_visitors: number;
  contacted_visitors: number;
  following_up_visitors: number;
  integrated_visitors: number;
  conversion_rate: number;
  avg_days_to_integration: number;
  tickets_by_pastor: Array<{ pastor_name: string; ticket_count: number }>;
}

interface BranchOption {
  id: string;
  branch_name: string;
}

export default function FollowUpDashboardPage() {
  const {
    tickets,
    isLoading: isBoardLoading,
    addVisitor,
    updateTicketStatus,
    convertToActiveMember,
    importAttendanceTickets,
  } = useFollowUp();

  const { followUp: followUpPermissions, isSuperAdmin } = useAppPermissions();
  const { canManage, canViewFollowUp } = followUpPermissions;
  const { user } = useAuth();

  const [search, setSearch] = useState("");
  const [sourceFilter, setSourceFilter] = useState<string>("all");

  const [analytics, setAnalytics] = useState<AnalyticsKPIs | null>(null);
  const [isAnalyticsLoading, setIsAnalyticsLoading] = useState<boolean>(false);

  // Add Visitor slide-over state
  const [showAddVisitor, setShowAddVisitor] = useState(false);
  const [branches, setBranches] = useState<BranchOption[]>([]);

  // Fetch branches once (needed for super_admin branch selector)
  useEffect(() => {
    if (!isSuperAdmin) return;
    let active = true;
    async function loadBranches() {
      try {
        const res = await apiGet<any>("/api/branches/");
        if (res.success && active) {
          const list = Array.isArray(res.data) ? res.data : (res.data?.results ?? []);
          setBranches(list);
        }
      } catch (err) {
        console.error("Failed to load branches:", err);
      }
    }
    loadBranches();
    return () => { active = false; };
  }, [isSuperAdmin]);

  // Fetch KPI data from backend
  const fetchAnalytics = useCallback(async () => {
    if (!canViewFollowUp) return;
    setIsAnalyticsLoading(true);
    try {
      const response = await apiGet<AnalyticsKPIs>("/api/follow-up/analytics/");
      if (!isApiError(response)) {
        setAnalytics(response.data);
      }
    } catch (err: any) {
      console.error("Failed to load follow-up analytics:", err);
    } finally {
      setIsAnalyticsLoading(false);
    }
  }, [canViewFollowUp]);

  // Run initial fetch on mount
  useEffect(() => {
    if (canViewFollowUp) {
      importAttendanceTickets();
      fetchAnalytics();
    }
  }, [importAttendanceTickets, canViewFollowUp, fetchAnalytics]);

  // Filter tickets for board
  const filteredTickets = useMemo(() => {
    return tickets.filter((t) => {
      const q = search.toLowerCase();
      const nameMatch = t.visitor_name.toLowerCase().includes(q) || t.notes.toLowerCase().includes(q);
      const sourceMatch = sourceFilter === "all" || t.source === sourceFilter;
      return nameMatch && sourceMatch;
    });
  }, [tickets, search, sourceFilter]);

  const handleMoveStatus = async (ticketId: string, status: FollowUpStatus) => {
    await updateTicketStatus(ticketId, status);
    fetchAnalytics(); // Refresh analytics after moves
  };

  const handleTransitionMember = async (ticketId: string) => {
    const ticket = tickets.find((t) => t.id === ticketId);
    if (!ticket) return;

    if (
      confirm(
        `Are you sure you want to transition "${ticket.visitor_name}" to an Active Member?\n\nThis will:\n1. Auto-create a member profile in the Members Database.\n2. Mark this follow-up ticket as Completed.\n3. Preserve the visitor record & contact history.`
      )
    ) {
      const newMemberId = await convertToActiveMember(ticketId);
      if (newMemberId) {
        toast.success(`Success! "${ticket.visitor_name}" has been successfully added to the Members Database.`);
        fetchAnalytics(); // Refresh analytics after integration
      }
    }
  };

  const handleRefresh = async () => {
    await importAttendanceTickets();
    await fetchAnalytics();
  };

  const handleAddVisitorSubmit = async (values: any) => {
    const { notes, branch, ...profile } = values;
    const payload: any = { ...profile };
    if (branch) payload.branch = branch;
    await addVisitor(payload, notes || "");
    setShowAddVisitor(false);
    fetchAnalytics();
  };

  // 1. Restricted view
  if (!canViewFollowUp) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[500px] text-center p-8 select-none">
        <div className="relative overflow-hidden rounded-3xl border border-border/40 bg-slate-950/80 p-8 md:p-12 text-center backdrop-blur-md max-w-lg shadow-glass">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 mb-6">
            <Lock className="h-6 w-6" />
          </div>
          <h4 className="text-lg font-bold text-primary-foreground mb-2">Access Restricted</h4>
          <p className="text-sm text-muted-foreground mb-6 leading-relaxed">
            Follow-up pipeline dashboards are private. Please sign in with an administrator or pastor account to manage visitor tickets.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="font-display text-2xl font-bold text-primary-foreground md:text-3xl">
            Follow-up Pipeline
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Track first-time visitors, monitor contact logs, and transition visitors to full members
          </p>
        </div>

        <div className="flex gap-2">
          <button
            type="button"
            onClick={handleRefresh}
            disabled={isBoardLoading || isAnalyticsLoading}
            className="flex items-center gap-1.5 rounded-xl border border-border/50 bg-card/60 px-4 py-2.5 text-xs font-semibold text-primary-foreground hover:border-indigo-500/40 hover:text-indigo-400 transition-all shadow-sm disabled:opacity-50"
          >
            <RefreshCw className={cn("h-4 w-4", (isBoardLoading || isAnalyticsLoading) && "animate-spin")} />
            <span>Sync Board</span>
          </button>

          {canManage && (
            <button
              type="button"
              id="add-visitor-btn"
              onClick={() => setShowAddVisitor(true)}
              className="flex items-center gap-1.5 rounded-xl bg-indigo-600 px-4 py-2.5 text-xs font-bold text-white hover:bg-indigo-500 transition-all shadow-[0_0_12px_rgba(99,102,241,0.3)]"
            >
              <UserPlus className="h-4 w-4" />
              <span>Add Visitor</span>
            </button>
          )}
        </div>
      </div>

      {/* Aggregate KPI Stats */}
      {isAnalyticsLoading ? (
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4 select-none">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="rounded-2xl border border-border/50 bg-card/60 p-5 backdrop-blur-glass shadow-glass flex justify-between items-center animate-pulse">
              <div className="space-y-2 flex-1">
                <div className="h-2 bg-slate-800 rounded w-2/3"></div>
                <div className="h-6 bg-slate-800 rounded w-1/3"></div>
                <div className="h-1.5 bg-slate-800 rounded w-1/2"></div>
              </div>
              <div className="h-10 w-10 rounded-xl bg-slate-800/40 border border-border/20"></div>
            </div>
          ))}
        </div>
      ) : (
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4 select-none">
          <div className="rounded-2xl border border-border/50 bg-card/60 p-5 backdrop-blur-glass shadow-glass flex justify-between items-center">
            <div>
              <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Pipeline Conversion</span>
              <h3 className="text-2xl font-extrabold text-indigo-400 font-mono mt-1">
                {analytics ? `${analytics.conversion_rate}%` : "--"}
              </h3>
              <p className="text-[9px] text-muted-foreground mt-0.5">Conversion Rate</p>
            </div>
            <div className="h-10 w-10 rounded-xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center text-indigo-400">
              <BarChart2 className="h-5 w-5" />
            </div>
          </div>

          <div className="rounded-2xl border border-border/50 bg-card/60 p-5 backdrop-blur-glass shadow-glass flex justify-between items-center">
            <div>
              <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Active Queues</span>
              <h3 className="text-2xl font-extrabold text-blue-400 font-mono mt-1">
                {analytics ? (analytics.new_visitors + analytics.contacted_visitors + analytics.following_up_visitors) : "--"}
              </h3>
              <p className="text-[9px] text-muted-foreground mt-0.5">Tickets in progress</p>
            </div>
            <div className="h-10 w-10 rounded-xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center text-blue-400">
              <AlertCircle className="h-5 w-5" />
            </div>
          </div>

          <div className="rounded-2xl border border-border/50 bg-card/60 p-5 backdrop-blur-glass shadow-glass flex justify-between items-center">
            <div>
              <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Integrated Members</span>
              <h3 className="text-2xl font-extrabold text-emerald-400 font-mono mt-1">
                {analytics ? analytics.integrated_visitors : "--"}
              </h3>
              <p className="text-[9px] text-muted-foreground mt-0.5">Conversions complete</p>
            </div>
            <div className="h-10 w-10 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400">
              <CheckCircle className="h-5 w-5" />
            </div>
          </div>

          <div className="rounded-2xl border border-border/50 bg-card/60 p-5 backdrop-blur-glass shadow-glass flex justify-between items-center">
            <div>
              <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Avg Days to Integrate</span>
              <h3 className="text-2xl font-extrabold text-amber-400 font-mono mt-1">
                {analytics ? `${analytics.avg_days_to_integration} days` : "--"}
              </h3>
              <p className="text-[9px] text-muted-foreground mt-0.5">Average cycle time</p>
            </div>
            <div className="h-10 w-10 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-400">
              <Clock className="h-5 w-5" />
            </div>
          </div>
        </div>
      )}

      {/* Breakdown KPI and Workload Pastor breakdown */}
      {isAnalyticsLoading ? (
        <div className="grid gap-6 lg:grid-cols-3 select-none">
          <div className="lg:col-span-1 rounded-2xl border border-border/50 bg-card/60 p-5 backdrop-blur-glass shadow-glass flex flex-col justify-between h-28 animate-pulse">
            <div className="h-3 bg-slate-800 rounded w-1/2 mb-3"></div>
            <div className="grid grid-cols-3 gap-2">
              <div className="h-10 bg-slate-800/40 rounded-xl"></div>
              <div className="h-10 bg-slate-800/40 rounded-xl"></div>
              <div className="h-10 bg-slate-800/40 rounded-xl"></div>
            </div>
          </div>
          <div className="lg:col-span-2 rounded-2xl border border-border/50 bg-card/60 p-5 backdrop-blur-glass shadow-glass flex flex-col justify-between h-28 animate-pulse">
            <div className="h-3 bg-slate-800 rounded w-1/3 mb-2"></div>
            <div className="flex gap-3">
              <div className="h-10 w-28 bg-slate-800/40 rounded-xl"></div>
              <div className="h-10 w-28 bg-slate-800/40 rounded-xl"></div>
            </div>
          </div>
        </div>
      ) : (
        <div className="grid gap-6 lg:grid-cols-3 select-none">
          <div className="lg:col-span-1 rounded-2xl border border-border/50 bg-card/60 p-5 backdrop-blur-glass shadow-glass flex flex-col justify-between text-xs">
            <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground mb-3">Queue Summary Breakdown</span>
            <div className="grid grid-cols-3 gap-2 font-semibold text-center select-none">
              <div className="bg-indigo-500/5 border border-indigo-500/10 p-2.5 rounded-xl">
                <span className="block text-[14px] text-indigo-400 font-mono font-extrabold">
                  {analytics ? analytics.new_visitors : "--"}
                </span>
                <span className="text-[9px] text-muted-foreground">New</span>
              </div>
              <div className="bg-blue-500/5 border border-blue-500/10 p-2.5 rounded-xl">
                <span className="block text-[14px] text-blue-400 font-mono font-extrabold">
                  {analytics ? analytics.contacted_visitors : "--"}
                </span>
                <span className="text-[9px] text-muted-foreground">Contacted</span>
              </div>
              <div className="bg-amber-500/5 border border-amber-500/10 p-2.5 rounded-xl">
                <span className="block text-[14px] text-amber-400 font-mono font-extrabold">
                  {analytics ? analytics.following_up_visitors : "--"}
                </span>
                <span className="text-[9px] text-muted-foreground">Following Up</span>
              </div>
            </div>
          </div>

          <div className="lg:col-span-2 rounded-2xl border border-border/50 bg-card/60 p-5 backdrop-blur-glass shadow-glass flex flex-col justify-between text-xs">
            <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground mb-2">Workload by Pastor (Active Tickets)</span>
            <div className="flex items-center gap-3 overflow-x-auto py-1 scrollbar-thin">
              {analytics && analytics.tickets_by_pastor.length > 0 ? (
                analytics.tickets_by_pastor.map((item, idx) => (
                  <div key={idx} className="bg-slate-900/60 border border-border/20 px-3.5 py-2.5 rounded-xl flex items-center gap-3 shrink-0">
                    <div className="h-7 w-7 rounded-lg bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 flex items-center justify-center font-bold text-[10px]">
                      <Users className="h-3.5 w-3.5" />
                    </div>
                    <div>
                      <span className="block font-bold text-[11px] text-primary-foreground">{item.pastor_name}</span>
                      <span className="text-[9px] text-muted-foreground">{item.ticket_count} active cases</span>
                    </div>
                  </div>
                ))
              ) : (
                <span className="text-[10px] text-slate-500 italic">No tickets currently assigned to active pastors.</span>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Filter and search parameters */}
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between select-none">
        <SearchInput
          value={search}
          onChange={setSearch}
          placeholder="Search by visitor name..."
          className="w-full md:max-w-xs"
          ariaLabel="Search follow-up tickets"
        />

        <div className="flex flex-wrap items-center gap-3">
          <div>
            <span className="sr-only">Filter by Source</span>
            <FilterSelect
              value={sourceFilter}
              onChange={(e) => setSourceFilter(e.target.value)}
              aria-label="Filter by Source"
            >
              <option value="all">All Sources</option>
              <option value="Manual">Manual Registration</option>
              <option value="Attendance Absentee">Attendance Absentee</option>
              <option value="Attendance Visitor Scan">Attendance Visitor Scan</option>
              <option value="Event RSVP">Event RSVP</option>
              <option value="Prayer Crisis">Prayer Crisis</option>
            </FilterSelect>
          </div>

          {(search || sourceFilter !== "all") && (
            <button
              type="button"
              onClick={() => {
                setSearch("");
                setSourceFilter("all");
              }}
              className="text-xs font-semibold text-indigo-400 hover:text-indigo-300 underline underline-offset-4"
            >
              Clear Filters
            </button>
          )}
        </div>
      </div>

      {/* Kanban Board columns */}
      {isBoardLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-6">
          {[1, 2, 3, 4, 5].map((idx) => (
            <div key={idx} className="rounded-2xl border border-border/40 bg-card/40 p-4 h-[450px] animate-pulse flex flex-col gap-4">
              <div className="flex items-center justify-between border-b border-border/20 pb-3 mb-1">
                <div className="h-4 bg-slate-800 rounded w-1/2"></div>
                <div className="h-5 w-6 bg-slate-800 rounded-full"></div>
              </div>
              <div className="flex-1 space-y-4">
                <div className="h-24 bg-slate-800/40 rounded-xl"></div>
                <div className="h-24 bg-slate-800/20 rounded-xl"></div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <KanbanBoard
          tickets={filteredTickets}
          onMoveStatus={handleMoveStatus}
          onTransitionMember={handleTransitionMember}
          canManage={canManage}
        />
      )}

      {/* Add Visitor Slide-over Panel */}
      <AnimatePresence>
        {showAddVisitor && (
          <>
            {/* Backdrop */}
            <motion.div
              key="backdrop"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowAddVisitor(false)}
              className="fixed inset-0 z-40 bg-background/70 backdrop-blur-sm"
            />

            {/* Slide-over panel */}
            <motion.div
              key="panel"
              initial={{ x: "100%" }}
              animate={{ x: 0 }}
              exit={{ x: "100%" }}
              transition={{ type: "spring", damping: 28, stiffness: 280 }}
              className="fixed top-0 right-0 z-50 h-full w-full max-w-lg overflow-y-auto border-l border-border/50 bg-slate-950/95 shadow-2xl backdrop-blur-glass p-6"
            >
              {/* Panel Header */}
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h2 className="text-base font-bold text-primary-foreground font-display">Register New Visitor</h2>
                  <p className="text-xs text-muted-foreground mt-0.5">Create a profile and auto-open a follow-up ticket</p>
                </div>
                <button
                  type="button"
                  onClick={() => setShowAddVisitor(false)}
                  className="rounded-xl border border-border/50 bg-card/40 p-2 text-muted-foreground hover:text-primary-foreground hover:bg-slate-900 transition-all"
                  aria-label="Close add visitor panel"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>

              <VisitorForm
                onSubmit={handleAddVisitorSubmit}
                onCancel={() => setShowAddVisitor(false)}
                isLoading={isBoardLoading}
                isSuperAdmin={isSuperAdmin}
                branches={branches}
              />
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}
