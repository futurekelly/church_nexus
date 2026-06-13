"use client";

import { format, parseISO } from "date-fns";
import { Calendar, MapPin } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { PUBLIC_ROUTES } from "@/constants/routes";
import { LANDING_SECTIONS } from "@/features/landing/constants/sections";
import { MotionWrapper } from "@/features/landing/components/motion-wrapper";
import { LandingSectionHeader } from "@/features/landing/components/landing-section-header";
import type { UpcomingEvent } from "@/features/landing/types/landing.types";
import { cn } from "@/lib/utils";

interface UpcomingEventsSectionProps {
  events: UpcomingEvent[];
}

export function UpcomingEventsSection({ events }: UpcomingEventsSectionProps) {
  return (
    <section
      id={LANDING_SECTIONS.EVENTS}
      aria-labelledby="events-heading"
      className="px-4 py-16 lg:px-8"
    >
      <div className="mx-auto max-w-7xl">
        <LandingSectionHeader
          headingId="events-heading"
          title="Upcoming Events"
          subtitle="Stay connected through worship services, fellowship, and community outreach."
        />

        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {events.map((event, index) => (
            <MotionWrapper key={event.id} delay={index * 0.1}>
              <article
                className={cn(
                  "glass-panel group flex flex-col overflow-hidden rounded-2xl transition-all duration-200",
                  "hover:border-primary/30 hover:shadow-neon",
                )}
              >
                <div className="relative h-44 overflow-hidden">
                  <Image
                    src={event.banner}
                    alt=""
                    fill
                    sizes="(max-width: 768px) 100vw, 33vw"
                    className="object-cover transition-transform duration-300 group-hover:scale-105"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-background/90 to-transparent" />
                </div>

                <div className="flex flex-1 flex-col p-5">
                  <h3 className="font-display text-lg font-semibold text-primary-foreground">
                    {event.title}
                  </h3>
                  <p className="mt-2 flex-1 text-sm text-muted-foreground">
                    {event.description}
                  </p>

                  <ul className="mt-4 space-y-2 text-sm text-muted-foreground">
                    <li className="flex items-center gap-2">
                      <Calendar
                        className="h-4 w-4 shrink-0 text-primary"
                        aria-hidden="true"
                      />
                      <time dateTime={event.start_date}>
                        {format(parseISO(event.start_date), "EEE, MMM d · h:mm a")}
                      </time>
                    </li>
                    <li className="flex items-center gap-2">
                      <MapPin
                        className="h-4 w-4 shrink-0 text-primary"
                        aria-hidden="true"
                      />
                      {event.location}
                    </li>
                  </ul>
                </div>
              </article>
            </MotionWrapper>
          ))}
        </div>

        <div className="mt-10 text-center">
          <Link
            href={PUBLIC_ROUTES.EVENTS}
            className="inline-flex rounded-lg border border-border bg-card/40 px-6 py-2.5 text-sm font-semibold text-primary-foreground transition-all duration-200 hover:border-primary/50 hover:shadow-neon"
          >
            View All Events
          </Link>
        </div>
      </div>
    </section>
  );
}
