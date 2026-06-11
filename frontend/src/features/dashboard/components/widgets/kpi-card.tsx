"use client";

import { motion } from "framer-motion";
import {
  TrendingUp,
  TrendingDown,
  Minus,
  Users,
  UserCheck,
  UserPlus,
  Calendar,
  CheckCircle,
  Clock,
  Heart,
  MessageSquare,
  BookOpen,
  Radio,
  DollarSign,
  Gift,
  BarChart2,
  Film,
  Eye,
  Upload,
  Flame,
  ShieldCheck,
  Activity,
  Settings,
  FileText,
  TrendingUp as TrendingUpIcon,
  Download,
  List,
  PieChart,
  CheckSquare,
  CalendarCheck,
  PlayCircle,
  BookMarked,
  Grid,
  CalendarPlus,
} from "lucide-react";
import { cn } from "@/lib/utils";
import type { KpiStat } from "@/features/dashboard/data/mock-dashboard-data";

// Map icon name strings to Lucide components
const ICON_MAP: Record<string, React.ComponentType<{ className?: string }>> = {
  Users,
  UserCheck,
  UserPlus,
  Calendar,
  CheckCircle,
  Clock,
  Heart,
  MessageSquare,
  BookOpen,
  Radio,
  DollarSign,
  Gift,
  BarChart2,
  Film,
  Eye,
  Upload,
  Flame,
  ShieldCheck,
  Activity,
  Settings,
  FileText,
  TrendingUp: TrendingUpIcon,
  Download,
  List,
  PieChart,
  CheckSquare,
  CalendarCheck,
  PlayCircle,
  BookMarked,
  Grid,
  CalendarPlus,
};

const accentClasses = {
  primary: {
    icon: "bg-primary/15 text-primary",
    glow: "hover:shadow-[0_0_24px_rgba(139,92,246,0.35)]",
    border: "hover:border-primary/40",
    trend: "text-primary",
  },
  secondary: {
    icon: "bg-blue-500/15 text-blue-400",
    glow: "hover:shadow-[0_0_24px_rgba(59,130,246,0.35)]",
    border: "hover:border-blue-500/40",
    trend: "text-blue-400",
  },
  success: {
    icon: "bg-teal-500/15 text-teal-400",
    glow: "hover:shadow-[0_0_24px_rgba(20,184,166,0.35)]",
    border: "hover:border-teal-500/40",
    trend: "text-teal-400",
  },
  warning: {
    icon: "bg-amber-500/15 text-amber-400",
    glow: "hover:shadow-[0_0_24px_rgba(245,158,11,0.35)]",
    border: "hover:border-amber-500/40",
    trend: "text-amber-400",
  },
};

interface KpiCardProps {
  stat: KpiStat;
  index: number;
}

export function KpiCard({ stat, index }: KpiCardProps) {
  const IconComponent = ICON_MAP[stat.icon] ?? Activity;
  const accent = accentClasses[stat.accentColor];
  const isPositive = stat.trend > 0;
  const isNeutral = stat.trend === 0;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35, delay: index * 0.07 }}
      className={cn(
        "group relative rounded-2xl border border-border/50 bg-card/60 p-5",
        "backdrop-blur-[16px] shadow-glass",
        "transition-all duration-300 ease-out",
        accent.glow,
        accent.border,
      )}
    >
      {/* Background gradient shimmer */}
      <div
        className="pointer-events-none absolute inset-0 rounded-2xl opacity-0 transition-opacity duration-300 group-hover:opacity-100"
        aria-hidden="true"
        style={{
          background:
            "radial-gradient(ellipse at top left, rgba(139,92,246,0.06) 0%, transparent 70%)",
        }}
      />

      <div className="flex items-start justify-between">
        {/* Icon */}
        <div
          className={cn(
            "flex h-10 w-10 items-center justify-center rounded-xl",
            accent.icon,
          )}
        >
          <IconComponent className="h-5 w-5" aria-hidden="true" />
        </div>

        {/* Trend badge */}
        <div
          className={cn(
            "flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-medium",
            isNeutral
              ? "bg-muted/30 text-muted-foreground"
              : isPositive
                ? "bg-teal-500/15 text-teal-400"
                : "bg-red-500/15 text-red-400",
          )}
          aria-label={`Trend: ${isPositive ? "up" : isNeutral ? "flat" : "down"} ${Math.abs(stat.trend)}%`}
        >
          {isNeutral ? (
            <Minus className="h-3 w-3" aria-hidden="true" />
          ) : isPositive ? (
            <TrendingUp className="h-3 w-3" aria-hidden="true" />
          ) : (
            <TrendingDown className="h-3 w-3" aria-hidden="true" />
          )}
          {!isNeutral && <span>{Math.abs(stat.trend)}%</span>}
        </div>
      </div>

      {/* Value */}
      <div className="mt-4">
        <p
          className="font-mono text-2xl font-bold tracking-tight text-primary-foreground md:text-3xl"
          aria-label={`${stat.label}: ${stat.value}`}
        >
          {stat.value}
        </p>
        <p className="mt-1 text-sm font-medium text-muted-foreground">
          {stat.label}
        </p>
        <p className="mt-0.5 text-xs text-muted-foreground/70">
          {stat.trendLabel}
        </p>
      </div>
    </motion.div>
  );
}
