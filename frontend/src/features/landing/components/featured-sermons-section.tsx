"use client";

import { format, parseISO } from "date-fns";
import { Clock, Play } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { PUBLIC_ROUTES } from "@/constants/routes";
import { LANDING_SECTIONS } from "@/features/landing/constants/sections";
import { MotionWrapper } from "@/features/landing/components/motion-wrapper";
import { SectionHeader } from "@/features/landing/components/section-header";
import type { FeaturedSermon } from "@/features/landing/types/landing.types";
import { cn } from "@/lib/utils";

interface FeaturedSermonsSectionProps {
  sermons: FeaturedSermon[];
}

export function FeaturedSermonsSection({ sermons }: FeaturedSermonsSectionProps) {
  return (
    <section
      id={LANDING_SECTIONS.SERMONS}
      aria-labelledby="sermons-heading"
      className="px-4 py-16 lg:px-8"
    >
      <div className="mx-auto max-w-7xl">
        <SectionHeader
          headingId="sermons-heading"
          title="Featured Sermons"
          subtitle="Explore recent messages to strengthen your faith and deepen your walk with God."
        />

        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {sermons.map((sermon, index) => (
            <MotionWrapper key={sermon.id} delay={index * 0.1}>
              <article
                className={cn(
                  "glass-panel group overflow-hidden rounded-2xl transition-all duration-200",
                  "hover:border-primary/30 hover:shadow-neon",
                )}
              >
                <div className="relative aspect-video overflow-hidden">
                  <Image
                    src={sermon.thumbnail}
                    alt=""
                    fill
                    sizes="(max-width: 768px) 100vw, 33vw"
                    className="object-cover transition-transform duration-300 group-hover:scale-105"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-background/80 to-transparent" />
                  <div className="absolute bottom-3 left-3 flex items-center gap-1.5 rounded-md bg-card/80 px-2 py-1 text-xs text-muted-foreground backdrop-blur-sm">
                    <Clock className="h-3 w-3" aria-hidden="true" />
                    {sermon.duration}
                  </div>
                  <div
                    className="absolute inset-0 flex items-center justify-center opacity-0 transition-opacity group-hover:opacity-100"
                    aria-hidden="true"
                  >
                    <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary/90 shadow-neon">
                      <Play className="h-5 w-5 text-white" fill="white" />
                    </div>
                  </div>
                </div>

                <div className="p-5">
                  <h3 className="font-display text-lg font-semibold text-primary-foreground">
                    {sermon.title}
                  </h3>
                  <p className="mt-1 text-sm text-primary">{sermon.speaker}</p>
                  <p className="mt-2 line-clamp-2 text-sm text-muted-foreground">
                    {sermon.description}
                  </p>
                  <time
                    dateTime={sermon.sermon_date}
                    className="mt-3 block text-xs text-muted-foreground"
                  >
                    {format(parseISO(sermon.sermon_date), "MMMM d, yyyy")}
                  </time>
                </div>
              </article>
            </MotionWrapper>
          ))}
        </div>

        <div className="mt-10 text-center">
          <Link
            href={PUBLIC_ROUTES.SERMONS}
            className="inline-flex rounded-lg border border-border bg-card/40 px-6 py-2.5 text-sm font-semibold text-primary-foreground transition-all duration-200 hover:border-primary/50 hover:shadow-neon"
          >
            View All Sermons
          </Link>
        </div>
      </div>
    </section>
  );
}
