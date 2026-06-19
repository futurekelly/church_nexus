"use client";

import { useConnectGroups, useGroupMembers, useGroupAttendance } from "@/features/groups";
import { useAuth } from "@/hooks/use-auth";
import { useAppPermissions } from "@/hooks/use-app-permissions";
import {
  TrendingUp,
  DollarSign,
  Users,
  ShieldAlert,
  ArrowLeft,
  Calendar,
  Sparkles
} from "lucide-react";
import Link from "next/link";
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  AreaChart,
  Area
} from "recharts";

export default function GroupsReportsPage() {
  const { user } = useAuth();
  const permissions = useAppPermissions();

  const { groups } = useConnectGroups();
  const { allMembersRaw } = useGroupMembers();
  const { allAttendanceRaw } = useGroupAttendance();

  const isPastorOrAdmin = permissions.groups.canManage; // pastors/admins
  const isTreasurer = permissions.userRole === "treasurer";

  // Ownership evaluation: Get groups where current user is leader
  const userLedGroups = groups.filter((g) => String(g.leader_id) === String(user?.id));
  const isCellLeader = userLedGroups.length > 0;

  // Enforce base reports authorization check
  const hasAccess =
    permissions.groups.canViewReports ||
    permissions.groups.canViewFinancialReports ||
    isCellLeader;

  if (!hasAccess) {
    return (
      <div className="p-6 max-w-xl mx-auto mt-20 text-center space-y-4 border border-rose-500/20 bg-rose-500/5 rounded-2xl">
        <ShieldAlert className="h-10 w-10 text-rose-400 mx-auto" />
        <h3 className="text-sm font-bold text-primary-foreground font-display">Access Denied</h3>
        <p className="text-xs text-muted-foreground leading-relaxed">
          You do not have permissions to access connect group reports.
        </p>
        <div className="pt-2">
          <Link
            href="/dashboard/groups"
            className="inline-flex h-8 items-center gap-1 rounded-lg bg-slate-800 border border-border/40 px-3 text-[11px] font-semibold text-slate-300 hover:text-white"
          >
            Back to Directory
          </Link>
        </div>
      </div>
    );
  }

  // Determine what scope of data to display
  let targetGroups = groups;
  let targetAttendance = allAttendanceRaw;
  let targetMembers = allMembersRaw;

  if (!isPastorOrAdmin && !isTreasurer && isCellLeader) {
    // Cell Leader: Scoped strictly to their own groups
    const ledGroupIds = userLedGroups.map((g) => g.id);
    targetGroups = userLedGroups;
    targetAttendance = allAttendanceRaw.filter((att) => ledGroupIds.includes(att.group_id));
    targetMembers = allMembersRaw.filter((m) => ledGroupIds.includes(m.group_id));
  }

  // Calculations for KPI Cards
  const totalGroups = targetGroups.length;
  const totalMembers = targetMembers.length;
  const totalOfferings = targetAttendance.reduce((sum, item) => sum + (item.offering_amount || 0), 0);
  const totalVisitors = targetAttendance.reduce((sum, item) => sum + (item.visitor_count || 0), 0);

  // Group Attendance Graph Data mapping
  const attendanceChartData = targetAttendance
    .map((log) => {
      const groupName = groups.find((g) => g.id === log.group_id)?.name || "Cell";
      const totalPresent = log.attendees.filter((a) => a.attended).length;
      return {
        date: log.meeting_date,
        group: groupName,
        Present: totalPresent,
        Visitors: log.visitor_count,
        total: totalPresent + log.visitor_count
      };
    })
    .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

  // Financial Chart Data mapping
  const financialChartData = targetAttendance
    .map((log) => {
      const groupName = groups.find((g) => g.id === log.group_id)?.name || "Cell";
      return {
        date: log.meeting_date,
        group: groupName,
        Amount: log.offering_amount || 0
      };
    })
    .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between border-b border-border/30 pb-4">
        <div>
          <Link
            href="/dashboard/groups"
            className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-400 hover:text-emerald-300 transition-colors mb-2"
          >
            <ArrowLeft className="h-3 w-3" />
            <span>Connect Directory</span>
          </Link>
          <h1 className="text-2xl font-bold tracking-tight text-primary-foreground font-display flex items-center gap-2">
            <TrendingUp className="h-6 w-6 text-emerald-400" />
            Connect Analytics Dashboard
          </h1>
          <p className="text-xs text-muted-foreground mt-0.5">
            {isTreasurer
              ? "Access restricted to financial reports. Roster and visitor details are hidden."
              : isCellLeader && !isPastorOrAdmin
              ? "Performance statistics for connect groups under your leadership."
              : "Communal small groups, attendance trends, and financial aggregate reports."}
          </p>
        </div>
      </div>

      {/* KPI Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        {/* Groups Count (Hidden from Treasurers) */}
        {!isTreasurer && (
          <div className="rounded-2xl border border-border/40 bg-card/40 p-5 shadow-glass space-y-2 flex items-center justify-between">
            <div>
              <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wide">Connect Cells</span>
              <h3 className="text-2xl font-bold text-primary-foreground font-display pt-1">{totalGroups}</h3>
            </div>
            <Users className="h-8 w-8 text-emerald-400 opacity-20" />
          </div>
        )}

        {/* Member Count (Hidden from Treasurers) */}
        {!isTreasurer && (
          <div className="rounded-2xl border border-border/40 bg-card/40 p-5 shadow-glass space-y-2 flex items-center justify-between">
            <div>
              <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wide">Cell Members</span>
              <h3 className="text-2xl font-bold text-primary-foreground font-display pt-1">{totalMembers}</h3>
            </div>
            <Users className="h-8 w-8 text-indigo-400 opacity-20" />
          </div>
        )}

        {/* Offerings Count */}
        <div className="rounded-2xl border border-border/40 bg-card/40 p-5 shadow-glass space-y-2 flex items-center justify-between col-span-1">
          <div>
            <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wide">Weekly Offerings</span>
            <h3 className="text-2xl font-bold text-primary-foreground font-display pt-1">
              {totalOfferings.toLocaleString()} <span className="text-xs text-slate-400">TZS</span>
            </h3>
          </div>
          <DollarSign className="h-8 w-8 text-amber-400 opacity-20" />
        </div>

        {/* Visitor Count (Hidden from Treasurers) */}
        {!isTreasurer && (
          <div className="rounded-2xl border border-border/40 bg-card/40 p-5 shadow-glass space-y-2 flex items-center justify-between">
            <div>
              <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wide">Visitors Logged</span>
              <h3 className="text-2xl font-bold text-primary-foreground font-display pt-1">{totalVisitors}</h3>
            </div>
            <Sparkles className="h-8 w-8 text-rose-400 opacity-20" />
          </div>
        )}
      </div>

      {/* Graph Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Attendance Chart (Hidden from Treasurers) */}
        {!isTreasurer && (
          <div className="rounded-2xl border border-border/40 bg-card/40 p-5 shadow-glass space-y-4">
            <h3 className="text-xs font-bold text-primary-foreground uppercase tracking-wider text-emerald-400">
              Meeting Attendance Trends
            </h3>
            <div className="h-72 w-full text-xs">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={attendanceChartData}>
                  <defs>
                    <linearGradient id="colorPresent" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#10b981" stopOpacity={0.2} />
                      <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#334155/30" />
                  <XAxis dataKey="date" stroke="#94a3b8" />
                  <YAxis stroke="#94a3b8" />
                  <Tooltip contentStyle={{ backgroundColor: "#0f172a", border: "1px solid #334155" }} />
                  <Area type="monotone" dataKey="Present" stroke="#10b981" fillOpacity={1} fill="url(#colorPresent)" />
                  <Area type="monotone" dataKey="Visitors" stroke="#f43f5e" fillOpacity={0} />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>
        )}

        {/* Offering Chart */}
        <div className={`rounded-2xl border border-border/40 bg-card/40 p-5 shadow-glass space-y-4 ${isTreasurer ? "col-span-2" : ""}`}>
          <h3 className="text-xs font-bold text-primary-foreground uppercase tracking-wider text-amber-400">
            Weekly Collections Aggregate (Offerings)
          </h3>
          <div className="h-72 w-full text-xs">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={financialChartData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#334155/30" />
                <XAxis dataKey="date" stroke="#94a3b8" />
                <YAxis stroke="#94a3b8" />
                <Tooltip contentStyle={{ backgroundColor: "#0f172a", border: "1px solid #334155" }} />
                <Bar dataKey="Amount" fill="#fbbf24" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
}
