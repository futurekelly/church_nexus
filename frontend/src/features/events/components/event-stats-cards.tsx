"use client";

import { motion } from "framer-motion";
import { Calendar, CheckSquare, Users, Percent } from "lucide-react";
import { cn } from "@/lib/utils";

interface EventStatsCardsProps {
  stats: {
    upcomingCount: number;
    completedCount: number;
    totalRegistrations: number;
    capacityUtilization: number;
  };
}

interface StatCard {
  label: string;
  value: string | number;
  icon: React.ComponentType<{ className?: string }>;
  accent: string;
  glow: string;
  bg: string;
}

export function EventStatsCards({ stats }: EventStatsCardsProps) {
  const cards: StatCard[] = [
    {
      label: "Upcoming Events",
      value: stats.upcomingCount,
      icon: Calendar,
      accent: "text-indigo-400",
      bg: "bg-indigo-500/15",
      glow: "hover:shadow-[0_0_24px_rgba(99,102,241,0.25)]",
    },
    {
      label: "Completed Events",
      value: stats.completedCount,
      icon: CheckSquare,
      accent: "text-emerald-400",
      bg: "bg-emerald-500/15",
      glow: "hover:shadow-[0_0_24px_rgba(16,185,129,0.25)]",
    },
    {
      label: "Total Registrations",
      value: stats.totalRegistrations,
      icon: Users,
      accent: "text-blue-400",
      bg: "bg-blue-500/15",
      glow: "hover:shadow-[0_0_24px_rgba(59,130,246,0.25)]",
    },
    {
      label: "Capacity Utilization",
      value: `${stats.capacityUtilization}%`,
      icon: Percent,
      accent: "text-amber-400",
      bg: "bg-amber-500/15",
      glow: "hover:shadow-[0_0_24px_rgba(245,158,11,0.25)]",
    },
  ];

  return (
    <div
      className="grid grid-cols-2 gap-4 lg:grid-cols-4"
      role="region"
      aria-label="Event statistics"
    >
      {cards.map((card, i) => {
        const Icon = card.icon;
        return (
          <motion.div
            key={card.label}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.35, delay: i * 0.07 }}
            className={cn(
              "group relative overflow-hidden rounded-2xl border border-border/50",
              "bg-card/60 p-5 backdrop-blur-[16px] shadow-glass",
              "transition-all duration-300",
              card.glow,
              "hover:border-border/80"
            )}
          >
            <div
              className="pointer-events-none absolute inset-0 rounded-2xl opacity-0 transition-opacity duration-300 group-hover:opacity-100"
              aria-hidden="true"
              style={{
                background:
                  "radial-gradient(ellipse at top left, rgba(99,102,241,0.05) 0%, transparent 60%)",
              }}
            />
            <div className="flex items-start justify-between">
              <div
                className={cn(
                  "flex h-10 w-10 items-center justify-center rounded-xl",
                  card.bg
                )}
              >
                <Icon className={cn("h-5 w-5", card.accent)} aria-hidden="true" />
              </div>
            </div>
            <p
              className="mt-4 font-mono text-3xl font-bold text-primary-foreground"
              aria-label={`${card.label}: ${card.value}`}
            >
              {card.value.toLocaleString()}
            </p>
            <p className="mt-1 text-sm text-muted-foreground">{card.label}</p>
          </motion.div>
        );
      })}
    </div>
  );
}
