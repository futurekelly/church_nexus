"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import {
  Users, UserPlus, Calendar, CheckSquare, Eye, BookOpen,
  BookMarked, Radio, Heart, Download, List, PieChart,
  Upload, Grid, CalendarPlus, Gift, PlayCircle, CalendarCheck,
  Flame, Settings, ShieldCheck, FileText, Activity,
} from "lucide-react";
import { cn } from "@/lib/utils";
import type { QuickAction } from "@/features/dashboard/data/mock-dashboard-data";

const ICON_MAP: Record<string, React.ComponentType<{ className?: string }>> = {
  Users, UserPlus, Calendar, CheckSquare, Eye, BookOpen,
  BookMarked, Radio, Heart, Download, List, PieChart,
  Upload, Grid, CalendarPlus, Gift, PlayCircle, CalendarCheck,
  Flame, Settings, ShieldCheck, FileText, Activity,
};

const accentVariants = {
  primary: "border-primary/20 hover:border-primary/50 hover:shadow-[0_0_20px_rgba(139,92,246,0.25)]",
  secondary: "border-blue-500/20 hover:border-blue-500/50 hover:shadow-[0_0_20px_rgba(59,130,246,0.25)]",
  success: "border-teal-500/20 hover:border-teal-500/50 hover:shadow-[0_0_20px_rgba(20,184,166,0.25)]",
  warning: "border-amber-500/20 hover:border-amber-500/50 hover:shadow-[0_0_20px_rgba(245,158,11,0.25)]",
};

const iconVariants = {
  primary: "bg-primary/15 text-primary",
  secondary: "bg-blue-500/15 text-blue-400",
  success: "bg-teal-500/15 text-teal-400",
  warning: "bg-amber-500/15 text-amber-400",
};

interface QuickActionCardProps {
  action: QuickAction;
  index: number;
}

export function QuickActionCard({ action, index }: QuickActionCardProps) {
  const IconComponent = ICON_MAP[action.icon] ?? Activity;

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, delay: 0.2 + index * 0.06 }}
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
    >
      <Link
        href={action.href}
        className={cn(
          "group flex items-center gap-4 rounded-xl border bg-card/50 p-4",
          "backdrop-blur-[16px] transition-all duration-300",
          accentVariants[action.accent],
          "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
        )}
        aria-label={`${action.label}: ${action.description}`}
      >
        <div
          className={cn(
            "flex h-10 w-10 shrink-0 items-center justify-center rounded-xl",
            "transition-transform duration-200 group-hover:scale-110",
            iconVariants[action.accent],
          )}
        >
          <IconComponent className="h-5 w-5" aria-hidden="true" />
        </div>
        <div className="min-w-0">
          <p className="truncate text-sm font-semibold text-primary-foreground">
            {action.label}
          </p>
          <p className="truncate text-xs text-muted-foreground">
            {action.description}
          </p>
        </div>
      </Link>
    </motion.div>
  );
}
