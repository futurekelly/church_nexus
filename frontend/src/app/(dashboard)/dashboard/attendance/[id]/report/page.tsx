"use client";

import { useParams } from "next/navigation";
import Link from "next/link";
import { motion } from "framer-motion";
import { ArrowLeft, Users, UserMinus, UserCheck, Percent, HelpCircle, BarChart3, AlertCircle } from "lucide-react";
import {
  useAttendance,
  useAttendancePermissions,
  GenderDistributionChart,
  CheckInMethodBar,
  AbsenteeListWidget,
  SESSION_TYPE_LABELS,
} from "@/features/attendance";

export default function SessionReportPage() {
  const params = useParams();
  const sessionId = params?.id as string;

  const {
    getSessionById,
    getSessionRecords,
    tickets,
    createFollowUpTicket,
  } = useAttendance();

  const { canViewReports, canManage } = useAttendancePermissions();

  const session = getSessionById(sessionId);
  const records = getSessionRecords(sessionId);

  // 1. Permission checks
  if (!canViewReports) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] text-center p-6">
        <div className="rounded-2xl border border-border/40 bg-card/40 p-8 max-w-md backdrop-blur-glass shadow-glass">
          <AlertCircle className="h-10 w-10 text-rose-400 mx-auto mb-4" />
          <h3 className="text-base font-bold text-primary-foreground font-display">Access Restricted</h3>
          <p className="text-xs text-muted-foreground mt-2">
            You do not have the required permissions to view attendance reports or demographics.
          </p>
          <Link
            href="/dashboard/attendance"
            className="mt-6 inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-slate-800 text-xs font-semibold text-primary-foreground hover:bg-slate-700 transition-all"
          >
            <ArrowLeft className="h-4 w-4" />
            <span>Go Back</span>
          </Link>
        </div>
      </div>
    );
  }

  // 2. Not Found checks
  if (!session) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] text-center p-6">
        <div className="rounded-2xl border border-border/40 bg-card/40 p-8 max-w-md backdrop-blur-glass shadow-glass">
          <h3 className="text-base font-bold text-primary-foreground">Session Not Found</h3>
          <p className="text-xs text-muted-foreground mt-2">
            The attendance session with ID "{sessionId}" does not exist.
          </p>
          <Link
            href="/dashboard/attendance"
            className="mt-6 inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-slate-800 text-xs font-semibold text-primary-foreground hover:bg-slate-700 transition-all"
          >
            <ArrowLeft className="h-4 w-4" />
            <span>Back to Dashboard</span>
          </Link>
        </div>
      </div>
    );
  }

  // Calculate local report metrics
  const totalCount = records.length;
  const presentCount = records.filter((r) => r.status === "Present").length;
  const absentCount = records.filter((r) => r.status === "Absent").length;
  const excusedCount = records.filter((r) => r.status === "Excused").length;
  const attendanceRate = totalCount > 0 ? Math.round((presentCount / totalCount) * 100) : 0;

  // Filter follow-up tickets generated from this session
  const sessionTickets = tickets.filter((t) => t.session_id === sessionId);

  const handleCreateFollowUpTicket = (memberId: string, memberName: string, reason: string) => {
    createFollowUpTicket(sessionId, memberId, reason);
  };

  return (
    <div className="space-y-6">
      {/* Header and Navigation */}
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div className="flex items-center gap-3">
          <Link
            href={`/dashboard/attendance/${sessionId}`}
            className="flex h-9 w-9 items-center justify-center rounded-xl border border-border/50 bg-card/40 hover:bg-slate-900 transition-colors text-muted-foreground hover:text-primary-foreground"
            aria-label="Back to session check-in"
          >
            <ArrowLeft className="h-4 w-4" />
          </Link>
          <div>
            <h1 className="font-display text-xl font-bold text-primary-foreground">
              {session.title} — Analytics Report
            </h1>
            <p className="text-xs text-muted-foreground mt-0.5">
              {SESSION_TYPE_LABELS[session.type]} • {new Date(session.date).toLocaleDateString("en-US", {
                weekday: "long",
                month: "short",
                day: "numeric",
                year: "numeric"
              })}
            </p>
          </div>
        </div>
      </div>

      {/* Metric Cards Row */}
      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
        {/* Present Card */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
          className="rounded-2xl border border-border/50 bg-card/60 p-5 backdrop-blur-glass shadow-glass flex items-center justify-between"
        >
          <div>
            <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Checked In</span>
            <h3 className="text-2xl font-extrabold text-emerald-400 font-mono mt-1">{presentCount}</h3>
            <p className="text-[10px] text-muted-foreground mt-0.5">Members scanned</p>
          </div>
          <div className="h-10 w-10 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400">
            <UserCheck className="h-5 w-5" />
          </div>
        </motion.div>

        {/* Absent Card */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.05 }}
          className="rounded-2xl border border-border/50 bg-card/60 p-5 backdrop-blur-glass shadow-glass flex items-center justify-between"
        >
          <div>
            <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Absent</span>
            <h3 className="text-2xl font-extrabold text-rose-400 font-mono mt-1">{absentCount}</h3>
            <p className="text-[10px] text-muted-foreground mt-0.5">Escalations pending</p>
          </div>
          <div className="h-10 w-10 rounded-xl bg-rose-500/10 border border-rose-500/20 flex items-center justify-center text-rose-400">
            <UserMinus className="h-5 w-5" />
          </div>
        </motion.div>

        {/* Excused Card */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.1 }}
          className="rounded-2xl border border-border/50 bg-card/60 p-5 backdrop-blur-glass shadow-glass flex items-center justify-between"
        >
          <div>
            <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Excused Absences</span>
            <h3 className="text-2xl font-extrabold text-amber-400 font-mono mt-1">{excusedCount}</h3>
            <p className="text-[10px] text-muted-foreground mt-0.5">Formally filed</p>
          </div>
          <div className="h-10 w-10 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-400">
            <HelpCircle className="h-5 w-5" />
          </div>
        </motion.div>

        {/* Attendance Rate Card */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.15 }}
          className="rounded-2xl border border-border/50 bg-card/60 p-5 backdrop-blur-glass shadow-glass flex items-center justify-between"
        >
          <div>
            <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Attendance Rate</span>
            <h3 className="text-2xl font-extrabold text-indigo-400 font-mono mt-1">{attendanceRate}%</h3>
            <p className="text-[10px] text-muted-foreground mt-0.5">Out of {totalCount} total</p>
          </div>
          <div className="h-10 w-10 rounded-xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center text-indigo-400">
            <Percent className="h-5 w-5" />
          </div>
        </motion.div>
      </div>

      {/* Main Charts & Widgets Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column (Charts) */}
        <div className="lg:col-span-2 space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <GenderDistributionChart records={records} />
            <CheckInMethodBar records={records} />
          </div>

          {/* Follow-up local state summary ticket logger */}
          <div className="rounded-2xl border border-border/50 bg-card/60 p-5 backdrop-blur-glass shadow-glass">
            <h3 className="text-sm font-semibold text-primary-foreground mb-3 flex items-center gap-2">
              <BarChart3 className="h-4.5 w-4.5 text-indigo-400" />
              <span>Follow-up Tickets Created From This Session ({sessionTickets.length})</span>
            </h3>

            <div className="space-y-3 max-h-[200px] overflow-y-auto pr-1">
              {sessionTickets.length > 0 ? (
                sessionTickets.map((tkt) => (
                  <div
                    key={tkt.id}
                    className="flex items-center justify-between border border-border/30 bg-slate-950/20 px-3 py-2.5 rounded-xl text-xs"
                  >
                    <div>
                      <p className="font-semibold text-primary-foreground">{tkt.member_name}</p>
                      <p className="text-[10px] text-muted-foreground mt-0.5">Reason: {tkt.reason}</p>
                    </div>
                    <span className="font-semibold text-[10px] text-amber-400 bg-amber-500/10 px-2 py-0.5 rounded-full border border-amber-500/20">
                      {tkt.status}
                    </span>
                  </div>
                ))
              ) : (
                <p className="text-xs text-slate-500 py-6 text-center">
                  No wellness or follow-up tickets have been generated yet. Use the absentee list to flag members.
                </p>
              )}
            </div>
          </div>
        </div>

        {/* Right Column (Roster List Widget) */}
        <div className="lg:col-span-1">
          <AbsenteeListWidget
            records={records}
            tickets={tickets}
            onCreateTicket={handleCreateFollowUpTicket}
            canManage={canManage}
          />
        </div>
      </div>
    </div>
  );
}
