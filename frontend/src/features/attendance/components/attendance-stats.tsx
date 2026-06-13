"use client";

import { motion } from "framer-motion";
import { Users, ClipboardCheck, TrendingUp, Activity } from "lucide-react";
import { cn } from "@/lib/utils";
import type { AttendanceSession } from "../types/attendance.types";

interface AttendanceStatsProps {
  sessions: AttendanceSession[];
}

export function AttendanceStats({ sessions }: AttendanceStatsProps) {
  const completed = sessions.filter((s) => s.status === "Completed");
  const activeCount = sessions.filter((s) => s.status === "Active").length;

  const totalPossible = completed.length > 0
    ? completed.reduce((sum, s) => sum + s.present_count + s.absent_count + s.excused_count, 0)
    : 0;
  
  const totalPresent = completed.length > 0
    ? completed.reduce((sum, s) => sum + s.present_count, 0)
    : 0;

  // 1. Average check-in percentage
  const averageCheckInRate = totalPossible > 0 ? Math.round((totalPresent / totalPossible) * 100) : 0;

  // 2. Average present count
  const averagePresent = completed.length > 0 ? Math.round(totalPresent / completed.length) : 0;

  // 3. Peak attendance count
  const peakAttendance = completed.length > 0 ? Math.max(...completed.map((s) => s.present_count)) : 0;

  const cards = [
    {
      label: "Active Scan Sessions",
      value: activeCount,
      icon: Activity,
      accent: "text-primary",
      bg: "bg-primary/15",
      glow: "hover:shadow-[0_0_24px_rgba(139,92,246,0.3)]",
    },
    {
      label: "Average Attendance",
      value: averagePresent,
      icon: Users,
      accent: "text-purple-400",
      bg: "bg-purple-500/15",
      glow: "hover:shadow-[0_0_24px_rgba(168,85,247,0.3)]",
    },
    {
      label: "Check-in Rate",
      value: `${averageCheckInRate}%`,
      icon: ClipboardCheck,
      accent: "text-emerald-400",
      bg: "bg-emerald-500/15",
      glow: "hover:shadow-[0_0_24px_rgba(16,185,129,0.3)]",
    },
    {
      label: "Peak Count (Single Service)",
      value: peakAttendance,
      icon: TrendingUp,
      accent: "text-blue-400",
      bg: "bg-blue-500/15",
      glow: "hover:shadow-[0_0_24px_rgba(59,130,246,0.3)]",
    },
  ];

  return (
    <div
      className="grid grid-cols-2 gap-4 lg:grid-cols-4"
      role="region"
      aria-label="Attendance statistics"
    >
      {cards.map((card, i) => (
        <motion.div
          key={card.label}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: i * 0.05 }}
          className={cn(
            "rounded-2xl border border-border/50 bg-card/60 backdrop-blur-glass p-5",
            "flex items-center gap-4 transition-all duration-300",
            card.glow
          )}
        >
          <div className={cn("rounded-xl p-3", card.bg, card.accent)}>
            <card.icon className="h-6 w-6" />
          </div>
          <div>
            <p className="text-sm text-muted-foreground">{card.label}</p>
            <p className="text-2xl font-bold text-primary-foreground mt-0.5">{card.value}</p>
          </div>
        </motion.div>
      ))}
    </div>
  );
}
