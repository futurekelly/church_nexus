"use client";

import Link from "next/link";
import { Clock, Users, ArrowRight, BarChart3, Scan } from "lucide-react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import type { AttendanceSession } from "../types/attendance.types";
import { SESSION_TYPE_LABELS } from "../types/attendance.types";
import { StatusBadge } from "@/components/ui/status-badge";
import { useAttendancePermissions } from "../hooks/use-attendance-permissions";

interface SessionCardProps {
  session: AttendanceSession;
}

export function SessionCard({ session }: SessionCardProps) {
  const { canManage, canViewReports } = useAttendancePermissions();

  const total = session.present_count + session.absent_count + session.excused_count;
  const progressPercent = total > 0 ? Math.round((session.present_count / total) * 100) : 0;

  const dateObj = new Date(session.date);
  const formattedDate = dateObj.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });

  const isActive = session.status === "Active";

  return (
    <motion.div
      layout
      className={cn(
        "group relative overflow-hidden rounded-2xl border border-border/50 bg-card/60 backdrop-blur-glass p-5",
        "flex flex-col h-full shadow-glass hover:border-indigo-500/50 hover:shadow-[0_0_24px_rgba(99,102,241,0.15)]",
        "transition-all duration-300"
      )}
    >
      {/* Top row: Type Category & Status */}
      <div className="flex items-center justify-between gap-2 mb-3">
        <span className="rounded-full bg-slate-950/80 px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider text-indigo-400 backdrop-blur-sm border border-border/20">
          {SESSION_TYPE_LABELS[session.type] || session.type}
        </span>
        <StatusBadge
          label={isActive ? "Active check-in" : "Session closed"}
          bgClass={isActive ? "bg-emerald-500/10 border border-emerald-500/20" : "bg-slate-500/10 border border-slate-500/20"}
          textClass={isActive ? "text-emerald-400" : "text-slate-400"}
          dotClass={isActive ? "bg-emerald-400 shadow-[0_0_8px_#10b981]" : "bg-slate-400 shadow-[0_0_8px_#94a3b8]"}
          size="sm"
        />
      </div>

      {/* Body: Title & Details */}
      <div className="mb-4 flex-1">
        <h3 className="text-lg font-bold text-primary-foreground line-clamp-1 group-hover:text-indigo-400 transition-colors">
          {session.title}
        </h3>
        <p className="text-xs text-muted-foreground mt-1 flex items-center gap-1">
          <Clock className="h-3.5 w-3.5" />
          <span>Created on {formattedDate}</span>
        </p>
        <p className="text-sm text-muted-foreground/80 mt-3 line-clamp-2 leading-relaxed">
          {session.description}
        </p>
      </div>

      {/* Progress check-in bar */}
      <div className="space-y-2 mb-4">
        <div className="flex items-center justify-between text-xs">
          <span className="text-muted-foreground flex items-center gap-1">
            <Users className="h-3.5 w-3.5" />
            <span>Checked in: {session.present_count} / {total}</span>
          </span>
          <span className="font-semibold text-primary-foreground">{progressPercent}%</span>
        </div>
        <div className="h-1.5 w-full rounded-full bg-slate-900/60 overflow-hidden border border-border/20">
          <div
            className={cn("h-full rounded-full transition-all duration-300", isActive ? "bg-emerald-500" : "bg-indigo-500")}
            style={{ width: `${progressPercent}%` }}
          />
        </div>
      </div>

      {/* Divider */}
      <div className="h-px bg-border/40 my-3" />

      {/* Footer link CTAs */}
      <div className="flex items-center justify-end gap-2">
        {isActive && canManage ? (
          <Link
            href={`/dashboard/attendance/${session.id}`}
            className="flex items-center gap-1.5 rounded-xl bg-primary px-4 py-2 text-xs font-semibold text-primary-foreground shadow-neon hover:brightness-110 transition-all"
          >
            <Scan className="h-3.5 w-3.5" />
            <span>Open scanner</span>
            <ArrowRight className="h-3.5 w-3.5" />
          </Link>
        ) : (
          canViewReports && (
            <Link
              href={`/dashboard/attendance/${session.id}/report`}
              className="flex items-center gap-1.5 rounded-xl border border-border bg-card/60 px-4 py-2 text-xs font-semibold text-muted-foreground hover:text-primary-foreground hover:bg-slate-900 transition-all"
            >
              <BarChart3 className="h-3.5 w-3.5" />
              <span>View Report</span>
            </Link>
          )
        )}
      </div>
    </motion.div>
  );
}
