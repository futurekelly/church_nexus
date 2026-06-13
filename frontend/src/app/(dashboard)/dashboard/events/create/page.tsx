"use client";

import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { ArrowLeft, Lock } from "lucide-react";
import { toast } from "sonner";
import { useEvents, useEventPermissions, EventForm } from "@/features/events";
import { SectionHeader } from "@/features/dashboard/components/widgets/section-header";
import { cn } from "@/lib/utils";

export default function CreateEventPage() {
  const router = useRouter();
  const { addEvent } = useEvents();
  const { canCreate } = useEventPermissions();

  const handleFormSubmit = (values: any) => {
    try {
      const generatedCover = `data:image/svg+xml;utf8,${encodeURIComponent(
        `<svg xmlns="http://www.w3.org/2000/svg" width="800" height="500" viewBox="0 0 800 500"><defs><linearGradient id="g" x1="0%" y1="0%" x2="100%" y2="100%"><stop offset="0%" style="stop-color:%236366f1;stop-opacity:1" /><stop offset="100%" style="stop-color:%234f46e5;stop-opacity:1" /></linearGradient></defs><rect width="100%" height="100%" fill="url(#g)" /><text x="50%" y="50%" dominant-baseline="middle" text-anchor="middle" font-family="system-ui, sans-serif" font-weight="bold" font-size="44" fill="white" opacity="0.85">${values.title}</text></svg>`
      )}`;

      const newEvent = addEvent({
        title: values.title,
        description: values.description,
        event_type: values.event_type,
        start_date: new Date(values.start_date).toISOString(),
        end_date: new Date(values.end_date).toISOString(),
        location: values.location,
        organizer: values.organizer,
        capacity: values.capacity,
        status: values.status,
        cover_image: generatedCover,
      });

      toast.success("Event created successfully!");
      router.push(`/dashboard/events/${newEvent.id}`);
    } catch {
      toast.error("Failed to create event. Please try again.");
    }
  };

  if (!canCreate) {
    return (
      <div className="flex min-h-[400px] flex-col items-center justify-center text-center p-6">
        <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-rose-500/10 text-rose-400 border border-rose-500/20 mb-4">
          <Lock className="h-6 w-6" />
        </div>
        <h3 className="text-base font-bold text-primary-foreground">Access Denied</h3>
        <p className="mt-1 text-xs text-muted-foreground max-w-xs leading-normal">
          You do not have the permissions required to create events. Please contact your system administrator.
        </p>
        <button
          onClick={() => router.back()}
          className="mt-6 rounded-xl border border-border bg-card/60 px-4 py-2 text-xs font-semibold text-muted-foreground hover:text-primary-foreground transition-all"
        >
          Go Back
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <button
          type="button"
          onClick={() => router.back()}
          className="flex h-9 w-9 items-center justify-center rounded-xl border border-border/50 bg-card/60 text-muted-foreground transition-all hover:border-border/80 hover:text-primary-foreground"
          aria-label="Go back to events list"
        >
          <ArrowLeft className="h-4 w-4" aria-hidden="true" />
        </button>
        <SectionHeader
          title="Create New Event"
          description="Add a new church service, group meeting, or community event"
        />
      </div>

      <EventForm onSubmit={handleFormSubmit} />
    </div>
  );
}
