"use client";

import {
  Camera,
  HandHeart,
  Mic2,
  UserRound,
  Users,
  UsersRound,
} from "lucide-react";
import { LANDING_SECTIONS } from "@/features/landing/constants/sections";
import { MotionWrapper } from "@/features/landing/components/motion-wrapper";
import { SectionHeader } from "@/features/landing/components/section-header";
import type { Ministry } from "@/features/landing/types/landing.types";
import { cn } from "@/lib/utils";

const MINISTRY_ICONS = {
  youth: UsersRound,
  choir: Mic2,
  ushers: HandHeart,
  media: Camera,
  womens: Users,
  mens: UserRound,
} as const;

interface MinistriesSectionProps {
  ministries: Ministry[];
}

export function MinistriesSection({ ministries }: MinistriesSectionProps) {
  return (
    <section
      id={LANDING_SECTIONS.MINISTRIES}
      aria-labelledby="ministries-heading"
      className="px-4 py-16 lg:px-8"
    >
      <div className="mx-auto max-w-7xl">
        <SectionHeader
          headingId="ministries-heading"
          title="Our Ministries"
          subtitle="Find your place to serve, grow, and build meaningful relationships."
        />

        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {ministries.map((ministry, index) => {
            const Icon =
              MINISTRY_ICONS[ministry.icon as keyof typeof MINISTRY_ICONS] ??
              Users;

            return (
              <MotionWrapper key={ministry.id} delay={index * 0.08}>
                <article
                  className={cn(
                    "glass-panel group rounded-2xl p-6 transition-all duration-200",
                    "hover:border-primary/30 hover:shadow-neon",
                  )}
                >
                  <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-primary/15 transition-colors group-hover:bg-primary/25">
                    <Icon className="h-5 w-5 text-primary" aria-hidden="true" />
                  </div>
                  <h3 className="font-display text-lg font-semibold text-primary-foreground">
                    {ministry.name}
                  </h3>
                  <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                    {ministry.description}
                  </p>
                  <p className="mt-4 text-xs font-medium text-primary">
                    {ministry.member_count} members serving
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
