"use client";

import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { motion } from "framer-motion";
import { ArrowLeft, CheckCircle, FileBarChart, Lock, LockKeyhole, PlayCircle } from "lucide-react";
import {
  useAttendance,
  useAttendancePermissions,
  LiveProgressRing,
  ScannerSimulator,
  ManualChecklist,
  SESSION_TYPE_LABELS,
} from "@/features/attendance";
import { cn } from "@/lib/utils";

export default function SessionCheckInPage() {
  const params = useParams();
  const router = useRouter();
  const sessionId = params?.id as string;

  const {
    getSessionById,
    getSessionRecords,
    checkInMember,
    excuseMember,
    closeSession,
  } = useAttendance();

  const { canManage, canViewAttendance, isMember, canViewReports } = useAttendancePermissions();

  const session = getSessionById(sessionId);
  const records = getSessionRecords(sessionId);

  // 1. Permission checks
  if (!canViewAttendance || isMember) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] text-center p-6">
        <div className="rounded-2xl border border-border/40 bg-card/40 p-8 max-w-md backdrop-blur-glass shadow-glass">
          <LockKeyhole className="h-10 w-10 text-rose-400 mx-auto mb-4" />
          <h3 className="text-base font-bold text-primary-foreground font-display">Access Restricted</h3>
          <p className="text-xs text-muted-foreground mt-2">
            You do not have access to this check-in dashboard. Staff, leaders, and pastors only.
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
            <span>Back to Sessions</span>
          </Link>
        </div>
      </div>
    );
  }

  const handleCheckIn = (memberId: string, method: "QR" | "Barcode" | "Manual") => {
    checkInMember(sessionId, memberId, "Present", method);
  };

  const handleCheckInStatusChange = (
    memberId: string,
    status: "Present" | "Absent",
    method: "QR" | "Barcode" | "Manual" | null
  ) => {
    if (!canManage) return;
    checkInMember(sessionId, memberId, status, method);
  };

  const handleRecordExcuse = (memberId: string, notes: string) => {
    if (!canManage) return;
    excuseMember(sessionId, memberId, notes);
  };

  const handleCloseSession = () => {
    if (confirm("Are you sure you want to close this session? This will lock the attendance count and mark the session as Completed.")) {
      closeSession(sessionId);
    }
  };

  const activeCount = records.filter((r) => r.status === "Present").length;
  const totalCount = records.length;
  const isActive = session.status === "Active";

  return (
    <div className="space-y-6">
      {/* Dynamic Header */}
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div className="flex items-center gap-3">
          <Link
            href="/dashboard/attendance"
            className="flex h-9 w-9 items-center justify-center rounded-xl border border-border/50 bg-card/40 hover:bg-slate-900 transition-colors text-muted-foreground hover:text-primary-foreground"
            aria-label="Back to attendance dashboard"
          >
            <ArrowLeft className="h-4 w-4" />
          </Link>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="font-display text-xl font-bold text-primary-foreground">
                {session.title}
              </h1>
              {isActive ? (
                <span className="flex items-center gap-1 text-[10px] font-bold text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-full border border-emerald-500/20">
                  <PlayCircle className="h-3 w-3 animate-pulse text-emerald-400" />
                  <span>LIVE</span>
                </span>
              ) : (
                <span className="flex items-center gap-1 text-[10px] font-bold text-slate-400 bg-slate-800/60 px-2 py-0.5 rounded-full border border-border/40">
                  <Lock className="h-3 w-3" />
                  <span>CLOSED</span>
                </span>
              )}
            </div>
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

        {/* Header Actions */}
        <div className="flex items-center gap-3">
          {canViewReports && (
            <Link
              href={`/dashboard/attendance/${sessionId}/report`}
              className="flex items-center gap-1.5 px-4 py-2 rounded-xl border border-border/50 bg-card/60 text-xs font-semibold text-primary-foreground hover:border-indigo-500/40 hover:text-indigo-400 transition-all shadow-sm"
            >
              <FileBarChart className="h-4 w-4" />
              <span>View Report</span>
            </Link>
          )}

          {isActive && canManage && (
            <button
              type="button"
              onClick={handleCloseSession}
              className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-500 text-xs font-bold text-white transition-all shadow-md"
            >
              <Lock className="h-4 w-4" />
              <span>Close Session</span>
            </button>
          )}
        </div>
      </div>

      {/* Main Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Check-in scanning & Roster controls (Left/Main column) */}
        <div className="lg:col-span-2 space-y-6">
          {isActive && canManage && (
            <ScannerSimulator records={records} onCheckIn={handleCheckIn} />
          )}

          <ManualChecklist
            records={records}
            onCheckIn={handleCheckInStatusChange}
            onExcuse={handleRecordExcuse}
            canManage={canManage && isActive}
          />
        </div>

        {/* Metrics, widgets, instructions (Right column) */}
        <div className="space-y-6">
          <div>
            <h3 className="text-xs font-bold uppercase tracking-wider text-muted-foreground mb-3">
              Session Progress
            </h3>
            <LiveProgressRing presentCount={activeCount} totalCount={totalCount} />
          </div>

          {!isActive && (
            <div className="rounded-2xl border border-border/40 bg-slate-950/40 p-5 backdrop-blur-glass shadow-glass space-y-3">
              <div className="flex items-center gap-2 text-indigo-400">
                <CheckCircle className="h-5 w-5" />
                <h4 className="text-xs font-bold uppercase tracking-wider">Session Finalized</h4>
              </div>
              <p className="text-xs text-muted-foreground leading-relaxed">
                This check-in session is closed. Roster count modifications are locked. You can review full gender distributions and check-in methods inside the analytics report.
              </p>
              {canViewReports && (
                <Link
                  href={`/dashboard/attendance/${sessionId}/report`}
                  className="w-full flex items-center justify-center gap-1.5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-xs font-bold text-white transition-all shadow-neon"
                >
                  <FileBarChart className="h-4 w-4" />
                  <span>Go to Report</span>
                </Link>
              )}
            </div>
          )}

          <div className="rounded-2xl border border-border/50 bg-card/60 p-5 backdrop-blur-glass shadow-glass space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-primary-foreground border-b border-border/20 pb-2">
              Scan Instructions
            </h4>
            <ul className="text-xs text-muted-foreground space-y-2 list-disc pl-4">
              <li>Open the mobile app scan code reader to check in attendees via QR code.</li>
              <li>Toggle present status manually in the checklist below for members without devices.</li>
              <li>Provide excused notes to ensure absentees are excluded from wellness ticket escalations.</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
