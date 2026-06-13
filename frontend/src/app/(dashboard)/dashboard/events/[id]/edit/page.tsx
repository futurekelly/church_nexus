"use client";

import { useParams, useRouter } from "next/navigation";
import { ArrowLeft, Lock, AlertTriangle } from "lucide-react";
import { toast } from "sonner";
import { useEvents, useEventPermissions, EventForm } from "@/features/events";
import { SectionHeader } from "@/features/dashboard/components/widgets/section-header";
import { cn } from "@/lib/utils";

export default function EditEventPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const { getEventById, updateEvent } = useEvents();
  const { canEdit } = useEventPermissions();

  const event = getEventById(id);

  const handleFormSubmit = (values: any) => {
    if (!event) return;
    try {
      updateEvent(event.id, {
        title: values.title,
        description: values.description,
        event_type: values.event_type,
        start_date: new Date(values.start_date).toISOString(),
        end_date: new Date(values.end_date).toISOString(),
        location: values.location,
        organizer: values.organizer,
        capacity: values.capacity,
        status: values.status,
      });

      toast.success("Event updated successfully!");
      router.push(`/dashboard/events/${event.id}`);
    } catch {
      toast.error("Failed to update event. Please try again.");
    }
  };

  if (!canEdit) {
    return (
      <div className="flex min-h-[400px] flex-col items-center justify-center text-center p-6">
        <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-rose-500/10 text-rose-400 border border-rose-500/20 mb-4">
          <Lock className="h-6 w-6" />
        </div>
        <h3 className="text-base font-bold text-primary-foreground">Access Denied</h3>
        <p className="mt-1 text-xs text-muted-foreground max-w-xs leading-normal">
          You do not have the permissions required to edit events. Please contact your system administrator.
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
          The event you want to edit does not exist or has been removed.
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

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <button
          type="button"
          onClick={() => router.back()}
          className="flex h-9 w-9 items-center justify-center rounded-xl border border-border/50 bg-card/60 text-muted-foreground transition-all hover:border-border/80 hover:text-primary-foreground"
          aria-label="Go back to event details"
        >
          <ArrowLeft className="h-4 w-4" aria-hidden="true" />
        </button>
        <SectionHeader
          title="Edit Event"
          description={`Modify details for: ${event.title}`}
        />
      </div>

      <EventForm event={event} onSubmit={handleFormSubmit} />
    </div>
  );
}
