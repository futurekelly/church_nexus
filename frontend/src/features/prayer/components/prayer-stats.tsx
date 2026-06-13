"use client";

import { motion } from "framer-motion";
import { Heart, MessageSquare, Flame, CheckCircle2 } from "lucide-react";
import { cn } from "@/lib/utils";
import type { PrayerRequest } from "../types/prayer.types";

interface PrayerStatsCardsProps {
  prayers: PrayerRequest[];
}

interface StatCard {
  label: string;
  value: number;
  icon: React.ComponentType<{ className?: string }>;
  accent: string;
  glow: string;
  bg: string;
}

export function PrayerStatsCards({ prayers }: PrayerStatsCardsProps) {
  const total = prayers.length;
  const active = prayers.filter((p) => p.status === "New" || p.status === "In Progress").length;
  const answered = prayers.filter((p) => p.status === "Answered").length;
  const totalPrayed = prayers.reduce((sum, p) => sum + p.pray_count, 0);

  const cards: StatCard[] = [
    {
      label: "Total Requests",
      value: total,
      icon: MessageSquare,
      accent: "text-primary",
      bg: "bg-primary/15",
      glow: "hover:shadow-[0_0_24px_rgba(139,92,246,0.3)]",
    },
    {
      label: "Active (Praying)",
      value: active,
      icon: Flame,
      accent: "text-purple-400",
      bg: "bg-purple-500/15",
      glow: "hover:shadow-[0_0_24px_rgba(168,85,247,0.3)]",
    },
    {
      label: "Answered Prayers",
      value: answered,
      icon: CheckCircle2,
      accent: "text-emerald-400",
      bg: "bg-emerald-500/15",
      glow: "hover:shadow-[0_0_24px_rgba(16,185,129,0.3)]",
    },
    {
      label: "Prayers Offered",
      value: totalPrayed,
      icon: Heart,
      accent: "text-rose-400",
      bg: "bg-rose-500/15",
      glow: "hover:shadow-[0_0_24px_rgba(244,63,94,0.3)]",
    },
  ];

  return (
    <div
      className="grid grid-cols-2 gap-4 lg:grid-cols-4"
      role="region"
      aria-label="Prayer statistics"
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
