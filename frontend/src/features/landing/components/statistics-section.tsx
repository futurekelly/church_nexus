"use client";

import { Calendar, Eye, Users, Layers } from "lucide-react";
import { LANDING_SECTIONS } from "@/features/landing/constants/sections";
import { MotionWrapper } from "@/features/landing/components/motion-wrapper";
import { LandingSectionHeader } from "@/features/landing/components/landing-section-header";
import type { LandingStatistic } from "@/features/landing/types/landing.types";
import { cn } from "@/lib/utils";

const ICON_MAP = {
  members: Users,
  ministries: Layers,
  events: Calendar,
  livestream: Eye,
} as const;

interface StatisticsSectionProps {
  statistics: LandingStatistic[];
}

function formatStatValue(value: number): string {
  if (value >= 1000) {
    return `${(value / 1000).toFixed(value >= 10000 ? 0 : 1)}k`;
  }
  return value.toLocaleString();
}

export function StatisticsSection({ statistics }: StatisticsSectionProps) {
  return (
    <section
      id={LANDING_SECTIONS.STATISTICS}
      aria-labelledby="statistics-heading"
      className="px-4 py-16 lg:px-8"
    >
      <div className="mx-auto max-w-7xl">
        <LandingSectionHeader
          headingId="statistics-heading"
          title="Our Growing Community"
          subtitle="God is building something beautiful through faithful people and purposeful ministry."
        />

        <div className="grid grid-cols-2 gap-4 md:grid-cols-4 md:gap-6">
          {statistics.map((stat, index) => {
            const Icon = ICON_MAP[stat.id as keyof typeof ICON_MAP] ?? Users;

            return (
              <MotionWrapper key={stat.id} delay={index * 0.08}>
                <article
                  className={cn(
                    "glass-panel group rounded-2xl p-6 text-center transition-all duration-200",
                    "hover:border-primary/30 hover:shadow-neon",
                  )}
                >
                  <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-primary/15 transition-colors group-hover:bg-primary/25">
                    <Icon className="h-5 w-5 text-primary" aria-hidden="true" />
                  </div>
                  <p className="font-mono text-3xl font-bold text-primary-foreground md:text-4xl">
                    {formatStatValue(stat.value)}
                    {stat.suffix}
                  </p>
                  <p className="mt-1 text-sm text-muted-foreground">
                    {stat.label}
                  </p>
                </article>
              </MotionWrapper>
            );
          })}
        </div>
      </div>
    </section>
  );
}
