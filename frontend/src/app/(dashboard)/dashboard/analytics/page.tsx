"use client";

import { useState, useEffect, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Calendar,
  TrendingUp,
  TrendingDown,
  Users,
  DollarSign,
  Award,
  Info,
  Download,
  RefreshCw,
  Globe,
  Activity,
  FileText,
  Check,
  AlertCircle
} from "lucide-react";
import { useAnalytics } from "@/features/analytics";
import { useAppPermissions } from "@/hooks/use-app-permissions";
import { formatCurrency } from "@/lib/localization";
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  LineChart,
  Line,
  AreaChart,
  Area,
  PieChart,
  Pie,
  Cell
} from "recharts";

interface QueuedReport {
  id: string;
  type: string;
  format: string;
  status: "Pending" | "Processing" | "Completed";
  fileUrl?: string;
  timestamp: string;
}

export default function AnalyticsDashboardPage() {
  const {
    loading,
    error,
    snapshot,
    attendanceData,
    givingData,
    demographicsData,
    period,
    setPeriod,
    customRange,
    setCustomRange,
    selectedBranchId,
    setSelectedBranchId,
    refresh,
    exportReport
  } = useAnalytics();

  const permissions = useAppPermissions();
  const role = permissions?.userRole || "member";
  const isSuperAdmin = role === "super_admin";
  const isMember = role === "member";
  const isTreasurer = role === "treasurer";

  // Hydration safety check
  const [mounted, setMounted] = useState(false);
  useEffect(() => {
    setMounted(true);
  }, []);

  // Tabs configured based on RBAC matrix
  const tabs = useMemo(() => {
    if (isMember) {
      return [{ id: "personal", label: "My Activity" }];
    }
    const list = [];
    if (["super_admin", "church_admin", "pastor", "treasurer"].includes(role)) {
      list.push({ id: "financial", label: "Financial Ledger" });
    }
    if (["super_admin", "church_admin", "pastor"].includes(role)) {
      list.push({ id: "attendance", label: "Attendance & Engagement" });
      list.push({ id: "demographics", label: "Demographics Analysis" });
    }
    return list;
  }, [role, isMember]);

  const [activeTab, setActiveTab] = useState("financial");

  // Keep active tab safe if roles change
  useEffect(() => {
    if (tabs.length > 0 && !tabs.find((t) => t.id === activeTab)) {
      setActiveTab(tabs[0].id);
    }
  }, [tabs, activeTab]);

  // Export options state
  const [exportType, setExportType] = useState<"financial" | "attendance" | "demographic">("financial");
  const [exportFormat, setExportFormat] = useState<"PDF" | "CSV">("PDF");
  const [queuedReports, setQueuedReports] = useState<QueuedReport[]>([]);
  const [exporting, setExporting] = useState(false);
  const [exportSuccessMessage, setExportSuccessMessage] = useState<string | null>(null);

  const handleExport = async (e: React.FormEvent) => {
    e.preventDefault();
    setExporting(true);
    setExportSuccessMessage(null);
    try {
      const result = await exportReport(exportType, exportFormat);
      setExportSuccessMessage(result.message);
      
      // Add to simulated queue checklist
      const newReport: QueuedReport = {
        id: result.documentId,
        type: exportType.toUpperCase() + " REPORT",
        format: exportFormat,
        status: "Pending",
        timestamp: new Date().toLocaleTimeString()
      };
      setQueuedReports((prev) => [newReport, ...prev]);

      // Simulate status progression from Pending -> Processing -> Completed
      setTimeout(() => {
        setQueuedReports((prev) =>
          prev.map((r) => (r.id === result.documentId ? { ...r, status: "Processing" } : r))
        );
        setTimeout(() => {
          setQueuedReports((prev) =>
            prev.map((r) =>
              r.id === result.documentId
                ? {
                    ...r,
                    status: "Completed",
                    fileUrl: `/statements/stmt-${result.documentId}.${exportFormat.toLowerCase()}`
                  }
                : r
            )
          );
        }, 1500);
      }, 1500);

    } catch (err: any) {
      console.error("Export request failed", err);
    } finally {
      setExporting(false);
    }
  };

  if (!mounted) {
    return (
      <div className="flex h-96 items-center justify-center">
        <RefreshCw className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  // Neon colors from design guidelines
  const COLORS = {
    tithe: "#8B5CF6", // purple
    offering: "#3B82F6", // blue
    other: "#14B8A6", // teal
    expense: "#EF4444", // red
    attending: "#10B981", // green
    noShow: "#F59E0B", // amber
    waitlist: "#6B7280" // gray
  };

  const PIE_COLORS = ["#8B5CF6", "#3B82F6", "#14B8A6", "#F59E0B", "#10B981", "#EC4899"];

  return (
    <div className="space-y-8 p-6 max-w-7xl mx-auto text-primary-foreground">
      {/* Header section with title and Branch Selector */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between border-b border-border/30 pb-6">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight text-white flex items-center gap-2">
            <Activity className="h-8 w-8 text-primary" />
            Reporting & Analytics
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            {isMember
              ? "View your personal spiritual contributions and check-in records."
              : "Review multi-branch aggregated dashboards, time-series financial ledgers, and demographic segments."}
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-3">
          <button
            onClick={() => refresh()}
            disabled={loading}
            className="flex items-center gap-1.5 rounded-xl border border-border/50 bg-card/40 hover:bg-card/80 px-4 py-2.5 text-sm font-semibold transition-all disabled:opacity-50"
          >
            <RefreshCw className={`h-4 w-4 text-primary ${loading ? "animate-spin" : ""}`} />
            Refresh Snapshot
          </button>
          
          {/* Isolation Gating: Selector vs Label */}
          {isSuperAdmin ? (
            <div className="flex items-center gap-2 rounded-xl border border-border/50 bg-card/40 px-3 py-1.5">
              <Globe className="h-4 w-4 text-primary" />
              <select
                value={selectedBranchId}
                onChange={(e) => setSelectedBranchId(e.target.value)}
                className="bg-transparent text-sm font-semibold text-white focus:outline-none cursor-pointer"
              >
                <option value="all">Global (All Branches)</option>
                <option value="branch-001">Tabata HQ Campus</option>
                <option value="branch-002">Sinza Grace Church</option>
              </select>
            </div>
          ) : (
            <div className="flex items-center gap-2 rounded-xl border border-border/50 bg-card/40 px-4 py-2.5 text-sm font-semibold text-white">
              <Globe className="h-4 w-4 text-primary" />
              <span>
                {selectedBranchId === "branch-001" ? "Tabata HQ Campus" : "Sinza Grace Church"}
              </span>
            </div>
          )}
        </div>
      </div>

      {/* Date Range Selector Segment Controls */}
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between bg-card/30 p-4 rounded-2xl border border-border/40 backdrop-blur-md">
        <div className="flex flex-wrap gap-1 rounded-xl bg-card/60 p-1 border border-border/40">
          {(["Daily", "Weekly", "Monthly", "Quarterly", "Yearly", "Custom"] as const).map((p) => (
            <button
              key={p}
              onClick={() => setPeriod(p)}
              className={`px-4 py-2 rounded-lg text-sm font-semibold transition-all ${
                period === p
                  ? "bg-primary text-white shadow-neon"
                  : "text-muted-foreground hover:text-white"
              }`}
            >
              {p}
            </button>
          ))}
        </div>

        {period === "Custom" && (
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="flex items-center gap-2"
          >
            <input
              type="date"
              value={customRange.start}
              onChange={(e) => setCustomRange((prev) => ({ ...prev, start: e.target.value }))}
              className="rounded-xl border border-border/50 bg-card/60 px-3 py-2 text-sm text-white focus:ring-1 focus:ring-primary"
            />
            <span className="text-muted-foreground text-sm">to</span>
            <input
              type="date"
              value={customRange.end}
              onChange={(e) => setCustomRange((prev) => ({ ...prev, end: e.target.value }))}
              className="rounded-xl border border-border/50 bg-card/60 px-3 py-2 text-sm text-white focus:ring-1 focus:ring-primary"
            />
          </motion.div>
        )}
      </div>

      {/* Error state alert */}
      {error && (
        <div className="flex items-center gap-3 rounded-2xl border border-red-500/30 bg-red-500/10 p-4 text-red-200">
          <AlertCircle className="h-5 w-5 text-red-400 shrink-0" />
          <p className="text-sm font-medium">{error}</p>
        </div>
      )}

      {/* KPI Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {/* Total Giving KPI */}
        {(!isTreasurer || isSuperAdmin || !isMember) && (
          <div className="relative overflow-hidden rounded-2xl border border-border/40 bg-card/40 p-6 shadow-xl hover:shadow-neon/5 transition-all duration-300 group">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
                  <DollarSign className="h-4 w-4 text-violet-400" />
                  Total Giving (TZS)
                </p>
                <h3 className="text-3xl font-extrabold text-white mt-3">
                  {loading ? (
                    <span className="block h-8 w-36 animate-pulse rounded bg-muted/20" />
                  ) : (
                    formatCurrency(snapshot?.totalGivingYTD || 0)
                  )}
                </h3>
              </div>
              
              {/* Audit tooltip popover container */}
              <div className="relative group/tooltip">
                <button className="rounded-lg p-1.5 hover:bg-card/60 text-muted-foreground hover:text-white transition-all cursor-pointer">
                  <Info className="h-4.5 w-4.5" />
                </button>
                <div className="absolute right-0 bottom-full mb-2 w-72 rounded-xl bg-card border border-border/60 p-3.5 shadow-2xl opacity-0 invisible group-hover/tooltip:opacity-100 group-hover/tooltip:visible transition-all duration-200 z-50 pointer-events-none">
                  <p className="text-xs font-semibold text-primary mb-1">Total Giving Audit Log</p>
                  <div className="space-y-1.5 text-[11px] text-muted-foreground">
                    <p><span className="text-white font-medium">Source:</span> {snapshot?.metadata?.totalGivingYTD?.sourceModules.join(", ")}</p>
                    <p><span className="text-white font-medium">Method:</span> {snapshot?.metadata?.totalGivingYTD?.calculationMethod}</p>
                    <p><span className="text-white font-medium">Aggregated:</span> {snapshot?.metadata?.totalGivingYTD?.aggregationTimestamp ? new Date(snapshot.metadata.totalGivingYTD.aggregationTimestamp).toLocaleTimeString() : "N/A"}</p>
                  </div>
                </div>
              </div>
            </div>
            <div className="mt-4 flex items-center gap-2">
              <span className={`inline-flex items-center gap-0.5 rounded-lg px-2 py-0.5 text-xs font-bold bg-success/15 text-success`}>
                <TrendingUp className="h-3 w-3" />
                +{snapshot?.givingGrowthRate.toFixed(1)}%
              </span>
              <span className="text-xs text-muted-foreground">vs last year same period</span>
            </div>
          </div>
        )}

        {/* Attendance Rate KPI */}
        {!isTreasurer && (
          <div className="relative overflow-hidden rounded-2xl border border-border/40 bg-card/40 p-6 shadow-xl hover:shadow-neon/5 transition-all duration-300 group">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
                  <Activity className="h-4 w-4 text-emerald-400" />
                  Attendance Rate
                </p>
                <h3 className="text-3xl font-extrabold text-white mt-3">
                  {loading ? (
                    <span className="block h-8 w-24 animate-pulse rounded bg-muted/20" />
                  ) : (
                    `${snapshot?.attendanceRate.toFixed(1)}%`
                  )}
                </h3>
              </div>
              <div className="relative group/tooltip">
                <button className="rounded-lg p-1.5 hover:bg-card/60 text-muted-foreground hover:text-white transition-all cursor-pointer">
                  <Info className="h-4.5 w-4.5" />
                </button>
                <div className="absolute right-0 bottom-full mb-2 w-72 rounded-xl bg-card border border-border/60 p-3.5 shadow-2xl opacity-0 invisible group-hover/tooltip:opacity-100 group-hover/tooltip:visible transition-all duration-200 z-50 pointer-events-none">
                  <p className="text-xs font-semibold text-primary mb-1">Attendance Rate Audit Log</p>
                  <div className="space-y-1.5 text-[11px] text-muted-foreground">
                    <p><span className="text-white font-medium">Source:</span> {snapshot?.metadata?.attendanceRate?.sourceModules.join(", ")}</p>
                    <p><span className="text-white font-medium">Method:</span> {snapshot?.metadata?.attendanceRate?.calculationMethod}</p>
                    <p><span className="text-white font-medium">Aggregated:</span> {snapshot?.metadata?.attendanceRate?.aggregationTimestamp ? new Date(snapshot.metadata.attendanceRate.aggregationTimestamp).toLocaleTimeString() : "N/A"}</p>
                  </div>
                </div>
              </div>
            </div>
            <div className="mt-4 flex items-center gap-2">
              <span className="text-xs text-muted-foreground">
                Average weekly attendees: <span className="text-white font-semibold">{snapshot?.avgWeeklyAttendance.toFixed(0)}</span>
              </span>
            </div>
          </div>
        )}

        {/* Member Growth KPI */}
        {!isTreasurer && (
          <div className="relative overflow-hidden rounded-2xl border border-border/40 bg-card/40 p-6 shadow-xl hover:shadow-neon/5 transition-all duration-300 group">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
                  <Users className="h-4 w-4 text-blue-400" />
                  Total Members
                </p>
                <h3 className="text-3xl font-extrabold text-white mt-3">
                  {loading ? (
                    <span className="block h-8 w-20 animate-pulse rounded bg-muted/20" />
                  ) : (
                    snapshot?.totalMembers
                  )}
                </h3>
              </div>
              <div className="relative group/tooltip">
                <button className="rounded-lg p-1.5 hover:bg-card/60 text-muted-foreground hover:text-white transition-all cursor-pointer">
                  <Info className="h-4.5 w-4.5" />
                </button>
                <div className="absolute right-0 bottom-full mb-2 w-72 rounded-xl bg-card border border-border/60 p-3.5 shadow-2xl opacity-0 invisible group-hover/tooltip:opacity-100 group-hover/tooltip:visible transition-all duration-200 z-50 pointer-events-none">
                  <p className="text-xs font-semibold text-primary mb-1">Members Growth Audit Log</p>
                  <div className="space-y-1.5 text-[11px] text-muted-foreground">
                    <p><span className="text-white font-medium">Source:</span> {snapshot?.metadata?.totalMembers?.sourceModules.join(", ")}</p>
                    <p><span className="text-white font-medium">Method:</span> {snapshot?.metadata?.totalMembers?.calculationMethod}</p>
                    <p><span className="text-white font-medium">Aggregated:</span> {snapshot?.metadata?.totalMembers?.aggregationTimestamp ? new Date(snapshot.metadata.totalMembers.aggregationTimestamp).toLocaleTimeString() : "N/A"}</p>
                  </div>
                </div>
              </div>
            </div>
            <div className="mt-4 flex items-center gap-2">
              <span className={`inline-flex items-center gap-0.5 rounded-lg px-2 py-0.5 text-xs font-bold bg-success/15 text-success`}>
                <TrendingUp className="h-3 w-3" />
                +{snapshot?.membersGrowthRate.toFixed(1)}%
              </span>
              <span className="text-xs text-muted-foreground">joined this calendar year</span>
            </div>
          </div>
        )}
      </div>

      {/* Main Tab Controls */}
      <div className="border-b border-border/30">
        <div className="flex gap-6">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`pb-4 text-sm font-semibold tracking-wide border-b-2 transition-all cursor-pointer ${
                activeTab === tab.id
                  ? "border-primary text-primary"
                  : "border-transparent text-muted-foreground hover:text-white"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Tab Panels */}
      <div>
        {/* Tab 1: Financial Ledger */}
        {activeTab === "financial" && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 space-y-6">
              <div className="rounded-2xl border border-border/40 bg-card/30 p-6 shadow-xl">
                <h3 className="text-lg font-bold text-white mb-4">Giving Categories vs Expense Margin</h3>
                <div className="h-80 w-full mt-4">
                  {givingData ? (
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart
                        data={givingData.labels.map((lbl, idx) => ({
                          name: lbl,
                          Tithes: givingData.titheAmounts[idx],
                          Offerings: givingData.offeringAmounts[idx],
                          Other: givingData.otherAmounts[idx],
                          Expenses: givingData.expenseAmounts[idx]
                        }))}
                        margin={{ top: 20, right: 10, left: 10, bottom: 5 }}
                      >
                        <XAxis dataKey="name" stroke="#6B7280" fontSize={11} tickLine={false} />
                        <YAxis stroke="#6B7280" fontSize={11} tickLine={false} />
                        <Tooltip
                          contentStyle={{ backgroundColor: "#1A1F2C", borderColor: "#374151" }}
                          itemStyle={{ color: "#F3F4F6", fontSize: 12 }}
                          labelStyle={{ color: "#8B5CF6", fontWeight: "bold" }}
                        />
                        <Legend wrapperStyle={{ fontSize: 11 }} />
                        <Bar dataKey="Tithes" stackId="giving" fill={COLORS.tithe} radius={[0, 0, 0, 0]} />
                        <Bar dataKey="Offerings" stackId="giving" fill={COLORS.offering} radius={[0, 0, 0, 0]} />
                        <Bar dataKey="Other" stackId="giving" fill={COLORS.other} radius={[0, 0, 0, 0]} />
                        <Bar dataKey="Expenses" fill={COLORS.expense} radius={[4, 4, 0, 0]} />
                      </BarChart>
                    </ResponsiveContainer>
                  ) : (
                    <div className="flex h-full items-center justify-center text-sm text-muted-foreground">
                      No giving data.
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Campaign / Pledges mini-ledger card */}
            <div className="space-y-6">
              <div className="rounded-2xl border border-border/40 bg-card/30 p-6 shadow-xl">
                <h3 className="text-lg font-bold text-white mb-4">Net Financial Margin</h3>
                <div className="mt-4 flex flex-col justify-center h-48 rounded-xl bg-card/40 border border-border/30 p-6">
                  <p className="text-xs text-muted-foreground uppercase tracking-wider font-semibold">
                    Net Income Margin (TZS)
                  </p>
                  <h2 className={`text-4xl font-extrabold mt-3 ${givingData && givingData.netMargin >= 0 ? "text-success" : "text-red-400"}`}>
                    {formatCurrency(givingData?.netMargin || 0)}
                  </h2>
                  <div className="mt-4 flex items-center gap-2 text-xs text-muted-foreground">
                    <TrendingUp className="h-4 w-4 text-emerald-400" />
                    <span>Calculated as Total Giving minus Approved expenses.</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Tab 2: Attendance & Engagement */}
        {activeTab === "attendance" && (
          <div className="rounded-2xl border border-border/40 bg-card/30 p-6 shadow-xl">
            <h3 className="text-lg font-bold text-white mb-4">Check-In Sessions Breakdown</h3>
            <div className="h-80 w-full mt-4">
              {attendanceData ? (
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart
                    data={attendanceData.labels.map((lbl, idx) => ({
                      name: lbl,
                      Attending: attendanceData.attendingCounts[idx],
                      "No Show": attendanceData.noShowCounts[idx],
                      Waitlisted: attendanceData.waitlistCounts[idx]
                    }))}
                  >
                    <XAxis dataKey="name" stroke="#6B7280" fontSize={11} tickLine={false} />
                    <YAxis stroke="#6B7280" fontSize={11} tickLine={false} />
                    <Tooltip
                      contentStyle={{ backgroundColor: "#1A1F2C", borderColor: "#374151" }}
                      itemStyle={{ color: "#F3F4F6", fontSize: 12 }}
                    />
                    <Legend wrapperStyle={{ fontSize: 11 }} />
                    <Area type="monotone" dataKey="Attending" stackId="1" stroke={COLORS.attending} fill={COLORS.attending} fillOpacity={0.2} />
                    <Area type="monotone" dataKey="No Show" stackId="1" stroke={COLORS.noShow} fill={COLORS.noShow} fillOpacity={0.2} />
                    <Area type="monotone" dataKey="Waitlisted" stackId="1" stroke={COLORS.waitlist} fill={COLORS.waitlist} fillOpacity={0.2} />
                  </AreaChart>
                </ResponsiveContainer>
              ) : (
                <div className="flex h-full items-center justify-center text-sm text-muted-foreground">
                  No attendance session records.
                </div>
              )}
            </div>
          </div>
        )}

        {/* Tab 3: Demographics Analysis */}
        {activeTab === "demographics" && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {/* Age bands donut */}
            <div className="rounded-2xl border border-border/40 bg-card/30 p-6 shadow-xl">
              <h3 className="text-base font-bold text-white mb-2">Age Cohorts</h3>
              <div className="h-60 w-full flex items-center justify-center">
                {demographicsData && demographicsData.ageBands.length > 0 ? (
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={demographicsData.ageBands}
                        cx="50%"
                        cy="50%"
                        innerRadius={60}
                        outerRadius={80}
                        paddingAngle={5}
                        dataKey="value"
                      >
                        {demographicsData.ageBands.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={PIE_COLORS[index % PIE_COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip
                        contentStyle={{ backgroundColor: "#1A1F2C", borderColor: "#374151" }}
                        itemStyle={{ color: "#F3F4F6", fontSize: 12 }}
                      />
                      <Legend wrapperStyle={{ fontSize: 11 }} />
                    </PieChart>
                  </ResponsiveContainer>
                ) : (
                  <p className="text-sm text-muted-foreground">No DOB data mapped.</p>
                )}
              </div>
            </div>

            {/* Gender Pie Chart */}
            <div className="rounded-2xl border border-border/40 bg-card/30 p-6 shadow-xl">
              <h3 className="text-base font-bold text-white mb-2">Gender splits</h3>
              <div className="h-60 w-full flex items-center justify-center">
                {demographicsData && demographicsData.genderSplits.length > 0 ? (
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={demographicsData.genderSplits}
                        cx="50%"
                        cy="50%"
                        outerRadius={75}
                        dataKey="value"
                        label={({ name, percent }) => `${name} ${((percent || 0) * 100).toFixed(0)}%`}
                        labelLine={false}
                      >
                        {demographicsData.genderSplits.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={PIE_COLORS[(index + 2) % PIE_COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip
                        contentStyle={{ backgroundColor: "#1A1F2C", borderColor: "#374151" }}
                        itemStyle={{ color: "#F3F4F6", fontSize: 12 }}
                      />
                    </PieChart>
                  </ResponsiveContainer>
                ) : (
                  <p className="text-sm text-muted-foreground">No gender data.</p>
                )}
              </div>
            </div>

            {/* Marital splits */}
            <div className="rounded-2xl border border-border/40 bg-card/30 p-6 shadow-xl md:col-span-2 lg:col-span-1">
              <h3 className="text-base font-bold text-white mb-2">Marital status</h3>
              <div className="h-60 w-full mt-4">
                {demographicsData && demographicsData.maritalStatus.length > 0 ? (
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={demographicsData.maritalStatus} layout="vertical">
                      <XAxis type="number" stroke="#6B7280" fontSize={11} tickLine={false} />
                      <YAxis dataKey="name" type="category" stroke="#6B7280" fontSize={11} tickLine={false} />
                      <Tooltip
                        contentStyle={{ backgroundColor: "#1A1F2C", borderColor: "#374151" }}
                        itemStyle={{ color: "#F3F4F6", fontSize: 12 }}
                      />
                      <Bar dataKey="value" fill="#3B82F6" radius={[0, 4, 4, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                ) : (
                  <p className="text-sm text-muted-foreground">No marital status data.</p>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Simplified Personal view for Members */}
        {activeTab === "personal" && (
          <div className="rounded-2xl border border-border/40 bg-card/30 p-6 shadow-xl space-y-4">
            <h3 className="text-lg font-bold text-white">Your Personal Overview</h3>
            <p className="text-sm text-muted-foreground">
              To check your detailed giving history or update personal contact information, please proceed to the corresponding ledger tabs in the sidebar dashboard layout.
            </p>
          </div>
        )}
      </div>

      {/* Export center panel */}
      {!isMember && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 border-t border-border/30 pt-8">
          <div className="lg:col-span-1 space-y-4">
            <div>
              <h3 className="text-xl font-bold text-white flex items-center gap-2">
                <FileText className="h-5 w-5 text-primary" />
                Export Center
              </h3>
              <p className="text-xs text-muted-foreground mt-1.5 leading-relaxed">
                Compile analytics results into downloadable documents. Generating reports triggers background Celery jobs that queue inside the Document Center.
              </p>
            </div>
            
            <form onSubmit={handleExport} className="space-y-4 bg-card/25 p-4 rounded-xl border border-border/30">
              <div>
                <label className="block text-xs font-semibold text-muted-foreground uppercase mb-1">Report Category</label>
                <select
                  value={exportType}
                  onChange={(e) => setExportType(e.target.value as any)}
                  className="w-full rounded-xl border border-border/50 bg-card/60 px-3.5 py-2.5 text-sm text-white focus:outline-none focus:ring-2 focus:ring-primary/50"
                >
                  <option value="financial">Financial Ledger Statement</option>
                  <option value="attendance">Attendance Engagement Roster</option>
                  <option value="demographic">Demographic Segmentation report</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-muted-foreground uppercase mb-1">File Format</label>
                <select
                  value={exportFormat}
                  onChange={(e) => setExportFormat(e.target.value as any)}
                  className="w-full rounded-xl border border-border/50 bg-card/60 px-3.5 py-2.5 text-sm text-white focus:outline-none focus:ring-2 focus:ring-primary/50"
                >
                  <option value="PDF">Portable Document Format (PDF)</option>
                  <option value="CSV">Comma Separated Values (CSV)</option>
                </select>
              </div>

              <button
                type="submit"
                disabled={exporting}
                className="w-full flex items-center justify-center gap-1.5 rounded-xl bg-primary hover:brightness-110 px-4 py-3 text-sm font-semibold text-white transition-all shadow-neon disabled:opacity-50"
              >
                <Download className="h-4 w-4" />
                {exporting ? "Queueing task..." : "Export & Queue Report"}
              </button>
            </form>
          </div>

          {/* Export Queue list checklist */}
          <div className="lg:col-span-2 rounded-2xl border border-border/40 bg-card/30 p-6 shadow-xl flex flex-col">
            <h3 className="text-base font-bold text-white mb-4">Export Status Queue</h3>
            
            {queuedReports.length === 0 ? (
              <div className="flex flex-1 flex-col items-center justify-center text-center p-8 rounded-xl border border-dashed border-border/40 bg-card/10">
                <FileText className="h-10 w-10 text-muted-foreground/50 mb-2" />
                <p className="text-sm font-medium text-muted-foreground">No queued exports in this session.</p>
                <p className="text-xs text-muted-foreground/60 mt-1">Export a ledger using the form to trigger a generator thread.</p>
              </div>
            ) : (
              <div className="space-y-3 flex-1 overflow-y-auto max-h-72 pr-2">
                <AnimatePresence>
                  {queuedReports.map((report) => (
                    <motion.div
                      key={report.id}
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0 }}
                      className="flex items-center justify-between p-3.5 rounded-xl border border-border/30 bg-card/40 hover:bg-card/70 transition-all"
                    >
                      <div className="flex items-center gap-3">
                        <div className={`p-2 rounded-lg ${
                          report.status === "Completed" ? "bg-success/15 text-success" : "bg-primary/15 text-primary"
                        }`}>
                          <FileText className="h-4 w-4" />
                        </div>
                        <div>
                          <p className="text-sm font-bold text-white">{report.type}</p>
                          <p className="text-xs text-muted-foreground">
                            Format: <span className="font-semibold text-white">{report.format}</span> • Requested: {report.timestamp}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold ${
                          report.status === "Completed"
                            ? "bg-success/15 text-success"
                            : report.status === "Processing"
                            ? "bg-amber-500/15 text-amber-400"
                            : "bg-muted/30 text-muted-foreground"
                        }`}>
                          {report.status}
                        </span>
                        
                        {report.status === "Completed" && report.fileUrl && (
                          <a
                            href={report.fileUrl}
                            download
                            className="flex items-center gap-1 text-xs font-bold text-primary hover:brightness-110 transition-all"
                          >
                            <Download className="h-3.5 w-3.5" />
                            Download
                          </a>
                        )}
                      </div>
                    </motion.div>
                  ))}
                </AnimatePresence>
              </div>
            )}
            
            {exportSuccessMessage && (
              <div className="mt-4 flex items-center gap-2 text-xs text-success border border-success/20 bg-success/5 p-3 rounded-lg">
                <Check className="h-4 w-4" />
                <span>{exportSuccessMessage}</span>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
