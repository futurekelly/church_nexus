"use client";

import Link from "next/link";
import { Calendar, MapPin, Clock } from "lucide-react";
import { cn } from "@/lib/utils";
import type { Event } from "../types/event.types";

interface EventUpcomingWidgetProps {
  events: Event[];
  maxCount?: number;
  className?: string;
}

export function EventUpcomingWidget({
  events,
  maxCount = 3,
  className,
}: EventUpcomingWidgetProps) {
  // Filter and sort events chronologically
  const upcomingEvents = events
    .filter((e) => new Date(e.start_date) >= new Date() && e.status === "Published")
    .sort((a, b) => new Date(a.start_date).getTime() - new Date(b.start_date).getTime())
    .slice(0, maxCount);

  return (
    <div
      className={cn(
        "rounded-2xl border border-border/50 bg-card/60 p-5 backdrop-blur-[16px] shadow-glass space-y-4",
        className
      )}
    >
      <h3 className="text-base font-bold text-primary-foreground flex items-center gap-2 border-b border-border/30 pb-3">
        <Calendar className="h-5 w-5 text-indigo-400" />
        Upcoming Events
      </h3>

      <div className="space-y-3">
        {upcomingEvents.length === 0 ? (
          <p className="text-center text-xs text-muted-foreground py-6">
            No upcoming events scheduled.
          </p>
        ) : (
          upcomingEvents.map((ev) => {
            const startDate = new Date(ev.start_date);
            const day = startDate.getDate();
            const month = startDate.toLocaleString("default", { month: "short" });

            return (
              <div
                key={ev.id}
                className="group relative flex items-start gap-3 rounded-xl border border-border/10 bg-card/20 p-3 hover:border-indigo-500/40 transition-all duration-300"
              >
                {/* Date indicator square */}
                <div className="flex flex-col items-center justify-center h-12 w-12 rounded-lg bg-indigo-500/10 border border-indigo-500/20 text-indigo-400">
                  <span className="text-base font-extrabold font-mono leading-none">{day}</span>
                  <span className="text-[10px] font-bold uppercase mt-1">{month}</span>
                </div>

                <div className="flex-1 min-w-0">
                  <span className="text-[9px] font-bold text-muted-foreground uppercase tracking-wide">
                    {ev.event_type}
                  </span>
                  <h4 className="text-xs font-bold text-primary-foreground group-hover:text-indigo-400 transition-colors truncate mt-0.5">
                    <Link href={`/dashboard/events/${ev.id}`}>
                      {ev.title}
                    </Link>
                  </h4>
                  
                  <div className="flex items-center gap-3 mt-2 text-[10px] text-muted-foreground">
                    <div className="flex items-center gap-1">
                      <Clock className="h-3 w-3 text-indigo-400" />
                      <span>
                        {startDate.toLocaleTimeString("default", {
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </span>
                    </div>
                    <div className="flex items-center gap-1 min-w-0">
                      <MapPin className="h-3 w-3 text-indigo-400" />
                      <span className="truncate">{ev.location}</span>
                    </div>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
