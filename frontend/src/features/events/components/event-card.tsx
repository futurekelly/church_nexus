"use client";

import Link from "next/link";
import { MapPin, Clock, Users, ArrowRight, Pencil } from "lucide-react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import { EventStatusBadge } from "./event-status-badge";
import type { Event } from "../types/event.types";

interface EventCardProps {
  event: Event;
  canEdit?: boolean;
}

export function EventCard({ event, canEdit = false }: EventCardProps) {
  const startDate = new Date(event.start_date);
  const formattedDate = startDate.toLocaleDateString(undefined, {
    weekday: "short",
    month: "short",
    day: "numeric",
  });

  const formattedTime = startDate.toLocaleTimeString(undefined, {
    hour: "2-digit",
    minute: "2-digit",
  });

  const occupancyRate = event.capacity > 0 ? Math.round((event.registered_count / event.capacity) * 100) : 0;

  return (
    <motion.div
      layout
      className={cn(
        "group relative overflow-hidden rounded-2xl border border-border/50 bg-card/60 backdrop-blur-glass",
        "flex flex-col h-full shadow-glass hover:border-indigo-500/50 hover:shadow-[0_0_24px_rgba(99,102,241,0.15)]",
        "transition-all duration-300"
      )}
    >
      {/* Event Cover Image */}
      <div className="relative h-44 w-full overflow-hidden bg-gradient-to-br from-indigo-900/40 via-purple-900/30 to-slate-950">
        {event.cover_image ? (
          /* eslint-disable-next-line @next/next/no-img-element */
          <img
            src={event.cover_image}
            alt={event.title}
            className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
            loading="lazy"
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-indigo-600/20 via-purple-600/10 to-slate-900">
            <span className="font-display text-xl font-black text-white/10 select-none uppercase tracking-widest">
              {event.event_type}
            </span>
          </div>
        )}
        {/* Type pill */}
        <div className="absolute left-3 top-3 rounded-full bg-slate-950/80 px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider text-indigo-400 backdrop-blur-sm border border-border/20">
          {event.event_type}
        </div>
        {/* Status Badge */}
        <div className="absolute right-3 top-3">
          <EventStatusBadge status={event.status} size="sm" />
        </div>
      </div>

      {/* Card Body */}
      <div className="flex flex-1 flex-col p-5 space-y-4">
        <div className="space-y-1">
          {/* Date & Time Row */}
          <div className="flex flex-wrap items-center gap-3 text-xs text-indigo-400 font-semibold">
            <div className="flex items-center gap-1">
              <Clock className="h-3.5 w-3.5" />
              <span>
                {formattedDate} at {formattedTime}
              </span>
            </div>
          </div>
          
          <h3 className="text-base font-bold text-primary-foreground group-hover:text-indigo-400 transition-colors line-clamp-1 mt-1">
            {event.title}
          </h3>
          <p className="text-xs text-muted-foreground line-clamp-2 mt-1 min-h-[32px]">
            {event.description}
          </p>
        </div>

        {/* Location & Host */}
        <div className="space-y-2 text-xs text-muted-foreground border-t border-border/10 pt-3">
          <div className="flex items-center gap-1.5 min-w-0">
            <MapPin className="h-3.5 w-3.5 text-indigo-400 shrink-0" />
            <span className="truncate">{event.location}</span>
          </div>
          <div className="flex items-center gap-1.5">
            <Users className="h-3.5 w-3.5 text-indigo-400 shrink-0" />
            <span className="truncate">Hosted by: {event.organizer}</span>
          </div>
        </div>

        {/* Occupancy Indicator */}
        <div className="space-y-1 text-xs">
          <div className="flex justify-between text-muted-foreground">
            <span>Capacity filled</span>
            <span className="font-mono">
              {event.registered_count} / {event.capacity}
            </span>
          </div>
          <div className="h-1.5 w-full rounded-full bg-slate-800/80 overflow-hidden">
            <div
              className={cn(
                "h-full rounded-full transition-all duration-300",
                occupancyRate >= 100
                  ? "bg-rose-500"
                  : occupancyRate > 75
                  ? "bg-amber-500"
                  : "bg-indigo-500"
              )}
              style={{ width: `${Math.min(100, occupancyRate)}%` }}
            />
          </div>
        </div>

        {/* Footer Actions */}
        <div className="flex items-center justify-between pt-2 mt-auto border-t border-border/10">
          <Link
            href={`/dashboard/events/${event.id}`}
            className="inline-flex items-center gap-1 text-xs font-bold text-primary hover:text-primary/80 transition-colors"
          >
            View Details <ArrowRight className="h-3.5 w-3.5" />
          </Link>

          {canEdit && (
            <Link
              href={`/dashboard/events/${event.id}/edit`}
              className="inline-flex h-7 w-7 items-center justify-center rounded-lg border border-border/50 bg-card hover:bg-indigo-500/10 text-muted-foreground hover:text-indigo-400 transition-colors"
              title="Edit event"
            >
              <Pencil className="h-3.5 w-3.5" />
            </Link>
          )}
        </div>
      </div>
    </motion.div>
  );
}
