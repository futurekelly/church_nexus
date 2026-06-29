"use client";

import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { motion } from "framer-motion";
import {
  ArrowLeft,
  Calendar,
  MapPin,
  Clock,
  User,
  AlertTriangle,
  Lock,
} from "lucide-react";
import { PublicNavbar } from "@/features/landing/components/public-navbar";
import { PublicFooter } from "@/features/landing/components/public-footer";
import {
  useEvents,
  EventStatusBadge,
  EventAttendeePreview,
} from "@/features/events";
import { cn } from "@/lib/utils";

export default function PublicEventDetailPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const { getEventById } = useEvents();

  const event = getEventById(id);

  // Verification: Events must exist and be Published to be visible publicly
  const isEventVisible = event && event.status === "Published";

  if (!isEventVisible) {
    return (
      <div className="flex min-h-screen flex-col bg-slate-950 text-slate-100">
        <PublicNavbar />
        <main className="flex-grow flex flex-col items-center justify-center py-24 text-center px-4">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-slate-800 text-muted-foreground mb-4">
            <AlertTriangle className="h-6 w-6" />
          </div>
          <p className="text-lg font-semibold text-white">
            Event not found
          </p>
          <p className="mt-2 text-sm text-muted-foreground">
            The event you are looking for does not exist, is in draft state, or has been cancelled.
          </p>
          <button
            type="button"
            onClick={() => router.push("/events")}
            className="mt-6 rounded-xl bg-indigo-500/15 px-4 py-2 text-sm font-semibold text-indigo-400 hover:bg-indigo-500/25 transition-all"
          >
            Back to Events
          </button>
        </main>
        <PublicFooter />
      </div>
    );
  }

  const startDate = new Date(event.start_date);
  const endDate = new Date(event.end_date);

  return (
    <div className="flex min-h-screen flex-col bg-slate-950 text-slate-100">
      <PublicNavbar />

      <main className="flex-grow px-4 py-8 lg:px-8">
        <div className="mx-auto max-w-7xl space-y-6">
          
          {/* Header Controls */}
          <motion.div
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.35 }}
            className="flex items-center gap-3"
          >
            <button
              type="button"
              onClick={() => router.push("/events")}
              className="flex h-9 w-9 items-center justify-center rounded-xl border border-border/50 bg-card/60 text-muted-foreground transition-all hover:border-border/80 hover:text-primary-foreground"
              aria-label="Go back to events catalog"
            >
              <ArrowLeft className="h-4 w-4" aria-hidden="true" />
            </button>
            <div>
              <h1 className="font-display text-xl font-bold text-white truncate max-w-md">
                {event.title}
              </h1>
              <div className="flex items-center gap-2 mt-1">
                <span className="text-xs text-indigo-400 font-semibold">{event.event_type}</span>
                <span className="h-1 w-1 rounded-full bg-border" />
                <EventStatusBadge status={event.status} size="sm" />
              </div>
            </div>
          </motion.div>

          {/* Details Content Grid */}
          <div className="grid gap-6 lg:grid-cols-3">
            {/* Left Column (2/3) - Image, Schedule, Details */}
            <div className="lg:col-span-2 space-y-6">
              
              {/* Event Cover Image Card */}
              <div className="relative overflow-hidden rounded-2xl border border-border/50 bg-card/60 backdrop-blur-glass shadow-glass">
                <div className="relative h-64 w-full md:h-80 overflow-hidden bg-gradient-to-br from-indigo-900/40 via-purple-900/30 to-slate-950">
                  {event.cover_image ? (
                    /* eslint-disable-next-line @next/next/no-img-element */
                    <img
                      src={event.cover_image}
                      alt={event.title}
                      className="h-full w-full object-cover"
                    />
                  ) : (
                    <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-indigo-600/20 via-purple-600/10 to-slate-900">
                      <span className="font-display text-4xl font-black text-white/10 select-none uppercase tracking-widest">
                        {event.event_type}
                      </span>
                    </div>
                  )}
                  <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/40 to-transparent" />
                  
                  <div className="absolute bottom-5 left-6 right-6">
                    <span className="rounded-full bg-indigo-500/20 px-2.5 py-1 text-xs font-bold uppercase tracking-wider text-indigo-300 border border-indigo-500/30 backdrop-blur-sm">
                      {event.event_type}
                    </span>
                    <h2 className="text-xl md:text-2xl font-extrabold text-white mt-3">
                      {event.title}
                    </h2>
                  </div>
                </div>

                {/* Logistics */}
                <div className="p-6 grid gap-6 sm:grid-cols-2">
                  <div className="space-y-3.5">
                    <div className="flex items-start gap-3">
                      <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-indigo-500/10 text-indigo-400 shrink-0">
                        <Calendar className="h-4 w-4" />
                      </div>
                      <div>
                        <h4 className="text-xs font-semibold text-muted-foreground">Date</h4>
                        <p className="text-sm font-bold text-slate-100 mt-0.5">
                          {startDate.toLocaleDateString(undefined, {
                            weekday: "long",
                            month: "long",
                            day: "numeric",
                            year: "numeric",
                          })}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-start gap-3">
                      <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-indigo-500/10 text-indigo-400 shrink-0">
                        <Clock className="h-4 w-4" />
                      </div>
                      <div>
                        <h4 className="text-xs font-semibold text-muted-foreground">Time</h4>
                        <p className="text-sm font-bold text-slate-100 mt-0.5">
                          {startDate.toLocaleTimeString(undefined, {
                            hour: "2-digit",
                            minute: "2-digit",
                          })}{" "}
                          -{" "}
                          {endDate.toLocaleTimeString(undefined, {
                            hour: "2-digit",
                            minute: "2-digit",
                          })}
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-3.5">
                    <div className="flex items-start gap-3">
                      <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-indigo-500/10 text-indigo-400 shrink-0">
                        <MapPin className="h-4 w-4" />
                      </div>
                      <div>
                        <h4 className="text-xs font-semibold text-muted-foreground">Location</h4>
                        <p className="text-sm font-bold text-slate-100 mt-0.5">
                          {event.location}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-start gap-3">
                      <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-indigo-500/10 text-indigo-400 shrink-0">
                        <User className="h-4 w-4" />
                      </div>
                      <div>
                        <h4 className="text-xs font-semibold text-muted-foreground">Organizer</h4>
                        <p className="text-sm font-bold text-slate-100 mt-0.5">
                          {event.organizer}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Event Description */}
              <div className="rounded-2xl border border-border/50 bg-card/60 p-6 backdrop-blur-glass shadow-glass space-y-4">
                <h3 className="text-base font-bold text-slate-100">About this Event</h3>
                <p className="text-sm text-muted-foreground leading-relaxed whitespace-pre-wrap">
                  {event.description}
                </p>
              </div>
            </div>

            {/* Right Column (1/3) - Locked Registration & Attendance Preview */}
            <div className="space-y-6">
              
              {/* Locked Registration Card */}
              <div className="rounded-2xl border border-border/50 bg-card/60 p-5 backdrop-blur-glass shadow-glass space-y-4">
                <h3 className="text-base font-bold text-slate-100 border-b border-border/30 pb-3">
                  Registration
                </h3>
                <div className="rounded-xl border border-border/50 bg-slate-900/60 p-4 text-center flex flex-col items-center">
                  <Lock className="h-5 w-5 text-indigo-400 mb-2.5" />
                  <p className="text-xs text-muted-foreground leading-relaxed mb-4">
                    Only authenticated members can register for events. Please register or log in to continue.
                  </p>
                  <div className="flex flex-col gap-2 w-full">
                    <Link
                      href="/login"
                      className="w-full rounded-xl bg-indigo-600 py-2.5 text-xs font-bold text-white text-center transition-all hover:bg-indigo-500 shadow-[0_0_12px_rgba(99,102,241,0.3)]"
                    >
                      Sign In
                    </Link>
                    <Link
                      href="/register"
                      className="w-full rounded-xl border border-border/50 bg-card/60 py-2.5 text-xs font-bold text-muted-foreground text-center transition-all hover:border-indigo-500/40 hover:text-indigo-400"
                    >
                      Register Account
                    </Link>
                  </div>
                </div>
              </div>

              {/* Attendee Preview Box */}
              <EventAttendeePreview
                registeredCount={event.registered_count}
                capacity={event.capacity}
              />
            </div>
          </div>

        </div>
      </main>

      <PublicFooter />
    </div>
  );
}
