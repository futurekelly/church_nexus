"use client";

import { useParams, useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { toast } from "sonner";
import {
  ArrowLeft,
  Calendar,
  MapPin,
  Clock,
  User,
  Users,
  AlertTriangle,
  Pencil,
  Ban,
  CheckCircle,
  Lock,
} from "lucide-react";
import {
  useEvents,
  EventStatusBadge,
  EventAttendeePreview,
  EventRegistrationDialog,
} from "@/features/events";
import { useAppPermissions } from "@/hooks/use-app-permissions";
import { cn } from "@/lib/utils";

export default function EventDetailPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const { getEventById, toggleRegister, isUserRegistered, cancelEvent } = useEvents();
  const { events: eventPermissions } = useAppPermissions();
  const { canEdit, canCancel, canRegister, role } = eventPermissions;

  const [isDialogOp, setIsDialogOp] = useState(false);

  const event = getEventById(id);
  const isRegistered = isUserRegistered(id);

  if (!event) {
    return (
      <div className="flex flex-col items-center justify-center py-24 text-center">
        <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-slate-800 text-muted-foreground mb-4">
          <AlertTriangle className="h-6 w-6" />
        </div>
        <p className="text-lg font-semibold text-primary-foreground">
          Event not found
        </p>
        <p className="mt-2 text-sm text-muted-foreground">
          The event you are looking for does not exist or has been removed.
        </p>
        <button
          type="button"
          onClick={() => router.back()}
          className="mt-6 rounded-xl bg-indigo-500/15 px-4 py-2 text-sm font-semibold text-indigo-400 hover:bg-indigo-500/25 transition-all"
        >
          Go Back
        </button>
      </div>
    );
  }

  const handleRegisterConfirm = () => {
    toggleRegister(event.id);
    if (isRegistered) {
      toast.success("Registration cancelled successfully.");
    } else {
      toast.success("Successfully registered for the event!");
    }
  };

  const handleCancelEvent = () => {
    cancelEvent(event.id);
    toast.success("Event has been cancelled.");
  };

  const startDate = new Date(event.start_date);
  const endDate = new Date(event.end_date);

  const isFull = event.registered_count >= event.capacity;
  const isCancelled = event.status === "Cancelled";
  const isCompleted = event.status === "Completed" || new Date(event.end_date) < new Date();

  return (
    <div className="space-y-6">
      {/* Back navigation + header controls */}
      <motion.div
        initial={{ opacity: 0, y: -8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.35 }}
        className="flex flex-wrap items-center justify-between gap-4"
      >
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => router.back()}
            className="flex h-9 w-9 items-center justify-center rounded-xl border border-border/50 bg-card/60 text-muted-foreground transition-all hover:border-border/80 hover:text-primary-foreground"
            aria-label="Go back to events list"
          >
            <ArrowLeft className="h-4 w-4" aria-hidden="true" />
          </button>
          <div>
            <h1 className="font-display text-xl font-bold text-primary-foreground truncate max-w-md">
              {event.title}
            </h1>
            <div className="flex items-center gap-2 mt-1">
              <span className="text-xs text-muted-foreground">{event.event_type}</span>
              <span className="h-1 w-1 rounded-full bg-border" />
              <EventStatusBadge status={event.status} size="sm" />
            </div>
          </div>
        </div>

        <div className="flex items-center gap-3">
          {canCancel && !isCancelled && !isCompleted && (
            <button
              onClick={handleCancelEvent}
              className="flex items-center gap-2 rounded-xl border border-rose-500/30 bg-rose-500/10 px-4 py-2 text-sm font-semibold text-rose-400 transition-all hover:bg-rose-500/20"
              aria-label="Cancel Event"
            >
              <Ban className="h-4 w-4" />
              Cancel Event
            </button>
          )}

          {canEdit && (
            <Link
              href={`/dashboard/events/${event.id}/edit`}
              className="flex items-center gap-2 rounded-xl bg-indigo-600 px-4 py-2 text-sm font-semibold text-white transition-all hover:bg-indigo-500 shadow-[0_0_12px_rgba(99,102,241,0.3)]"
              aria-label="Edit Event"
            >
              <Pencil className="h-4 w-4" />
              Edit Event
            </Link>
          )}
        </div>
      </motion.div>

      {/* Main Content Grid */}
      <div className="grid gap-6 lg:grid-cols-3">
        {/* Left Column (2/3) - Event details info */}
        <div className="lg:col-span-2 space-y-6">
          {/* Cover image & core info block */}
          <div className="relative overflow-hidden rounded-2xl border border-border/50 bg-card/60 backdrop-blur-glass shadow-glass">
            <div className="relative h-64 w-full md:h-80 overflow-hidden">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={event.cover_image}
                alt={event.title}
                className="h-full w-full object-cover"
              />
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

            <div className="p-6 grid gap-6 sm:grid-cols-2">
              <div className="space-y-3.5">
                <div className="flex items-start gap-3">
                  <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-indigo-500/10 text-indigo-400 shrink-0">
                    <Calendar className="h-4 w-4" />
                  </div>
                  <div>
                    <h4 className="text-xs font-semibold text-muted-foreground">Date</h4>
                    <p className="text-sm font-bold text-primary-foreground mt-0.5">
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
                    <p className="text-sm font-bold text-primary-foreground mt-0.5">
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
                    <p className="text-sm font-bold text-primary-foreground mt-0.5">
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
                    <p className="text-sm font-bold text-primary-foreground mt-0.5">
                      {event.organizer}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Detailed description block */}
          <div className="rounded-2xl border border-border/50 bg-card/60 p-6 backdrop-blur-glass shadow-glass space-y-4">
            <h3 className="text-base font-bold text-primary-foreground">About this Event</h3>
            <p className="text-sm text-muted-foreground leading-relaxed whitespace-pre-wrap">
              {event.description}
            </p>
          </div>
        </div>

        {/* Right Column (1/3) - Actions & Attendee preview */}
        <div className="space-y-6">
          {/* Registration Box */}
          <div className="rounded-2xl border border-border/50 bg-card/60 p-5 backdrop-blur-glass shadow-glass space-y-4">
            <h3 className="text-base font-bold text-primary-foreground border-b border-border/30 pb-3">
              Registration
            </h3>

            {isCancelled ? (
              <div className="rounded-xl border border-red-500/20 bg-red-500/10 p-4 text-center">
                <p className="text-xs text-red-400 font-semibold">
                  This event has been cancelled.
                </p>
              </div>
            ) : isCompleted ? (
              <div className="rounded-xl border border-slate-500/20 bg-slate-500/10 p-4 text-center">
                <p className="text-xs text-slate-400 font-semibold">
                  This event is completed.
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                {canRegister ? (
                  <>
                    {isRegistered ? (
                      <div className="rounded-xl border border-emerald-500/20 bg-emerald-500/5 p-4 text-center flex flex-col items-center">
                        <CheckCircle className="h-5 w-5 text-emerald-400 mb-1.5" />
                        <p className="text-xs text-emerald-400 font-semibold">
                          You are registered for this event!
                        </p>
                      </div>
                    ) : isFull ? (
                      <div className="rounded-xl border border-amber-500/20 bg-amber-500/5 p-4 text-center">
                        <p className="text-xs text-amber-400 font-semibold">
                          Registration is full.
                        </p>
                      </div>
                    ) : null}

                    <button
                      onClick={() => setIsDialogOp(true)}
                      className={cn(
                        "w-full rounded-xl py-3 text-xs font-bold text-white transition-all focus:outline-none",
                        isRegistered
                          ? "bg-rose-500/10 border border-rose-500/30 text-rose-400 hover:bg-rose-500/20"
                          : isFull
                          ? "bg-slate-800 text-muted-foreground pointer-events-none"
                          : "bg-indigo-600 hover:bg-indigo-500 shadow-[0_0_12px_rgba(99,102,241,0.3)]"
                      )}
                    >
                      {isRegistered ? "Cancel Registration" : "Register Now"}
                    </button>
                  </>
                ) : (
                  <div className="rounded-xl border border-border/50 bg-slate-900/60 p-4 text-center flex flex-col items-center">
                    <Lock className="h-5 w-5 text-muted-foreground mb-1.5" />
                    <p className="text-xs text-muted-foreground leading-normal">
                      {role === "visitor"
                        ? "Only authenticated members can register for events. Please upgrade your profile."
                        : "Registration is restricted for your role."}
                    </p>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Attendee Preview Box */}
          <EventAttendeePreview
            registeredCount={event.registered_count}
            capacity={event.capacity}
          />
        </div>
      </div>

      {/* Confirmation Dialog */}
      <EventRegistrationDialog
        isOpen={isDialogOp}
        onClose={() => setIsDialogOp(false)}
        onConfirm={handleRegisterConfirm}
        event={event}
        isRegistered={isRegistered}
      />
    </div>
  );
}
