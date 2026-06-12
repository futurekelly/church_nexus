"use client";

import { motion } from "framer-motion";
import { Users, UserCheck, UserPlus, Eye } from "lucide-react";
import { getMemberStats } from "@/features/members/data/mock-members";
import { cn } from "@/lib/utils";

interface StatCard {
  label: string;
  value: number;
  icon: React.ComponentType<{ className?: string }>;
  accent: string;
  glow: string;
  bg: string;
}

export function MemberStatsCards() {
  const stats = getMemberStats();

  const cards: StatCard[] = [
    {
      label: "Total Members",
      value: stats.total,
      icon: Users,
      accent: "text-primary",
      bg: "bg-primary/15",
      glow: "hover:shadow-[0_0_24px_rgba(139,92,246,0.3)]",
    },
    {
      label: "Active Members",
      value: stats.active,
      icon: UserCheck,
      accent: "text-teal-400",
      bg: "bg-teal-500/15",
      glow: "hover:shadow-[0_0_24px_rgba(20,184,166,0.3)]",
    },
    {
      label: "New This Month",
      value: stats.newThisMonth,
      icon: UserPlus,
      accent: "text-blue-400",
      bg: "bg-blue-500/15",
      glow: "hover:shadow-[0_0_24px_rgba(59,130,246,0.3)]",
    },
    {
      label: "Visitors",
      value: stats.visitors,
      icon: Eye,
      accent: "text-amber-400",
      bg: "bg-amber-500/15",
      glow: "hover:shadow-[0_0_24px_rgba(245,158,11,0.3)]",
    },
  ];

  return (
    <div
      className="grid grid-cols-2 gap-4 lg:grid-cols-4"
      role="region"
      aria-label="Member statistics"
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
              "hover:border-border/80",
            )}
          >
            <div
              className="pointer-events-none absolute inset-0 rounded-2xl opacity-0 transition-opacity duration-300 group-hover:opacity-100"
              aria-hidden="true"
              style={{
                background:
                  "radial-gradient(ellipse at top left, rgba(139,92,246,0.05) 0%, transparent 60%)",
              }}
            />
            <div className="flex items-start justify-between">
              <div
                className={cn(
                  "flex h-10 w-10 items-center justify-center rounded-xl",
                  card.bg,
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
