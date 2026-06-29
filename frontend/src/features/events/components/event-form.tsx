"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { motion } from "framer-motion";
import { Save, X, Image as ImageIcon } from "lucide-react";
import { useRouter } from "next/navigation";
import { cn } from "@/lib/utils";
import {
  EVENT_TYPES,
  EVENT_STATUSES,
  EVENT_TYPE_LABELS,
  EVENT_STATUS_LABELS,
  type Event,
} from "../types/event.types";

const eventFormSchema = z
  .object({
    title: z.string().min(3, "Title must be at least 3 characters"),
    description: z.string().min(10, "Description must be at least 10 characters"),
    event_type: z.enum(EVENT_TYPES, {
      errorMap: () => ({ message: "Please select a valid event type" }),
    }),
    start_date: z.string().min(1, "Start date and time are required"),
    end_date: z.string().min(1, "End date and time are required"),
    location: z.string().min(3, "Location is required"),
    organizer: z.string().min(3, "Organizer is required"),
    capacity: z.coerce.number().min(1, "Capacity must be at least 1"),
    status: z.enum(EVENT_STATUSES, {
      errorMap: () => ({ message: "Please select a valid status" }),
    }),
    cover_image: z.string().max(500, "Cover image URL must be under 500 characters").optional().default(""),
  })
  .refine(
    (data) => {
      const start = new Date(data.start_date).getTime();
      const end = new Date(data.end_date).getTime();
      return end > start;
    },
    {
      message: "End date must be after the start date",
      path: ["end_date"],
    }
  );

type EventFormValues = z.infer<typeof eventFormSchema>;

interface EventFormProps {
  defaultValues?: Partial<EventFormValues>;
  event?: Event; // Present when editing
  onSubmit: (values: EventFormValues) => void;
  isLoading?: boolean;
}

const inputClass = cn(
  "w-full rounded-xl border border-border/50 bg-card/60 px-4 py-2.5",
  "text-sm text-primary-foreground placeholder:text-muted-foreground/50",
  "backdrop-blur-[16px] transition-all duration-200",
  "focus:border-primary/50 focus:outline-none focus:ring-2 focus:ring-primary/20 hover:border-border/80"
);

const labelClass = "block text-xs font-medium text-muted-foreground mb-1.5";
const errorClass = "mt-1 text-xs text-red-400";

export function EventForm({
  defaultValues,
  event,
  onSubmit,
  isLoading = false,
}: EventFormProps) {
  const router = useRouter();
  const isEdit = !!event;

  // Format date strings for datetime-local input fields (YYYY-MM-DDTHH:MM)
  const formatDateForInput = (isoString?: string) => {
    if (!isoString) return "";
    const date = new Date(isoString);
    const pad = (num: number) => String(num).padStart(2, "0");
    return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}T${pad(
      date.getHours()
    )}:${pad(date.getMinutes())}`;
  };

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<EventFormValues>({
    resolver: zodResolver(eventFormSchema),
    defaultValues: defaultValues
      ? {
          ...defaultValues,
          start_date: formatDateForInput(defaultValues.start_date),
          end_date: formatDateForInput(defaultValues.end_date),
        }
      : event
      ? {
          title: event.title,
          description: event.description,
          event_type: event.event_type,
          start_date: formatDateForInput(event.start_date),
          end_date: formatDateForInput(event.end_date),
          location: event.location,
          organizer: event.organizer,
          capacity: event.capacity,
          status: event.status,
          cover_image: event.cover_image || "",
        }
      : {
          title: "",
          description: "",
          event_type: "Sunday Service",
          start_date: "",
          end_date: "",
          location: "",
          organizer: "",
          capacity: 100,
          status: "Draft",
          cover_image: "",
        },
  });

  return (
    <motion.form
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      onSubmit={handleSubmit(onSubmit)}
      noValidate
      aria-label={isEdit ? "Edit event form" : "Create event form"}
      className="space-y-6"
    >
      <div className="grid gap-6 md:grid-cols-3">
        {/* Left Column - Core Information */}
        <div className="md:col-span-2 space-y-6">
          <fieldset className="rounded-2xl border border-border/50 bg-card/60 p-6 backdrop-blur-[16px] shadow-glass space-y-4">
            <legend className="text-sm font-semibold text-primary-foreground px-1 mb-2">
              Event Specifications
            </legend>

            <div>
              <label htmlFor="title" className={labelClass}>
                Event Title <span className="text-red-400">*</span>
              </label>
              <input
                id="title"
                type="text"
                placeholder="e.g. Midweek Prayer Marathon"
                className={inputClass}
                aria-required="true"
                aria-invalid={!!errors.title}
                {...register("title")}
              />
              {errors.title && (
                <p className={errorClass} role="alert">
                  {errors.title.message}
                </p>
              )}
            </div>

            <div>
              <label htmlFor="description" className={labelClass}>
                Description / Purpose <span className="text-red-400">*</span>
              </label>
              <textarea
                id="description"
                rows={5}
                placeholder="Describe what will happen at the event, who should attend, and other details..."
                className={cn(inputClass, "resize-none")}
                aria-required="true"
                aria-invalid={!!errors.description}
                {...register("description")}
              />
              {errors.description && (
                <p className={errorClass} role="alert">
                  {errors.description.message}
                </p>
              )}
            </div>
          </fieldset>

          <fieldset className="rounded-2xl border border-border/50 bg-card/60 p-6 backdrop-blur-[16px] shadow-glass">
            <legend className="text-sm font-semibold text-primary-foreground px-1 mb-4">
              Schedule & Logistics
            </legend>
            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label htmlFor="start_date" className={labelClass}>
                  Start Date & Time <span className="text-red-400">*</span>
                </label>
                <input
                  id="start_date"
                  type="datetime-local"
                  className={inputClass}
                  aria-required="true"
                  aria-invalid={!!errors.start_date}
                  {...register("start_date")}
                />
                {errors.start_date && (
                  <p className={errorClass} role="alert">
                    {errors.start_date.message}
                  </p>
                )}
              </div>

              <div>
                <label htmlFor="end_date" className={labelClass}>
                  End Date & Time <span className="text-red-400">*</span>
                </label>
                <input
                  id="end_date"
                  type="datetime-local"
                  className={inputClass}
                  aria-required="true"
                  aria-invalid={!!errors.end_date}
                  {...register("end_date")}
                />
                {errors.end_date && (
                  <p className={errorClass} role="alert">
                    {errors.end_date.message}
                  </p>
                )}
              </div>

              <div className="sm:col-span-2">
                <label htmlFor="location" className={labelClass}>
                  Location / Venue <span className="text-red-400">*</span>
                </label>
                <input
                  id="location"
                  type="text"
                  placeholder="e.g. Youth Hall Room B / Zoom Online"
                  className={inputClass}
                  aria-required="true"
                  aria-invalid={!!errors.location}
                  {...register("location")}
                />
                {errors.location && (
                  <p className={errorClass} role="alert">
                    {errors.location.message}
                  </p>
                )}
              </div>
            </div>
          </fieldset>
        </div>

        {/* Right Column - Side Settings */}
        <div className="space-y-6">
          <fieldset className="rounded-2xl border border-border/50 bg-card/60 p-6 backdrop-blur-[16px] shadow-glass space-y-4">
            <legend className="text-sm font-semibold text-primary-foreground px-1 mb-2">
              Settings & Ownership
            </legend>

            <div>
              <label htmlFor="event_type" className={labelClass}>
                Event Type <span className="text-red-400">*</span>
              </label>
              <select
                id="event_type"
                className={cn(inputClass, "cursor-pointer")}
                {...register("event_type")}
              >
                {EVENT_TYPES.map((t) => (
                  <option key={t} value={t} className="bg-slate-900">
                    {EVENT_TYPE_LABELS[t]}
                  </option>
                ))}
              </select>
              {errors.event_type && (
                <p className={errorClass} role="alert">
                  {errors.event_type.message}
                </p>
              )}
            </div>

            <div>
              <label htmlFor="status" className={labelClass}>
                Publication Status <span className="text-red-400">*</span>
              </label>
              <select
                id="status"
                className={cn(inputClass, "cursor-pointer")}
                {...register("status")}
              >
                {EVENT_STATUSES.map((s) => (
                  <option key={s} value={s} className="bg-slate-900">
                    {EVENT_STATUS_LABELS[s]}
                  </option>
                ))}
              </select>
              {errors.status && (
                <p className={errorClass} role="alert">
                  {errors.status.message}
                </p>
              )}
            </div>

            <div>
              <label htmlFor="organizer" className={labelClass}>
                Organizer / Speaker <span className="text-red-400">*</span>
              </label>
              <input
                id="organizer"
                type="text"
                placeholder="e.g. Pastor Peter Mwangi"
                className={inputClass}
                aria-required="true"
                aria-invalid={!!errors.organizer}
                {...register("organizer")}
              />
              {errors.organizer && (
                <p className={errorClass} role="alert">
                  {errors.organizer.message}
                </p>
              )}
            </div>

            <div>
              <label htmlFor="capacity" className={labelClass}>
                Max Attendee Capacity <span className="text-red-400">*</span>
              </label>
              <input
                id="capacity"
                type="number"
                placeholder="e.g. 150"
                className={inputClass}
                aria-required="true"
                aria-invalid={!!errors.capacity}
                {...register("capacity")}
              />
              {errors.capacity && (
                <p className={errorClass} role="alert">
                  {errors.capacity.message}
                </p>
              )}
            </div>

            <div>
              <label htmlFor="cover_image" className={labelClass}>
                Cover Image URL <span className="text-muted-foreground font-normal">(Optional)</span>
              </label>
              <div className="relative">
                <input
                  id="cover_image"
                  type="url"
                  placeholder="https://images.unsplash.com/... or image link"
                  className={cn(inputClass, "pl-10")}
                  aria-invalid={!!errors.cover_image}
                  {...register("cover_image")}
                />
                <ImageIcon className="absolute left-3.5 top-3 h-4 w-4 text-muted-foreground" />
              </div>
              {errors.cover_image && (
                <p className={errorClass} role="alert">
                  {errors.cover_image.message}
                </p>
              )}
            </div>
          </fieldset>

          {/* Form Actions */}
          <div className="flex gap-3">
            <button
              type="button"
              onClick={() => router.back()}
              className={cn(
                "flex-1 rounded-xl border border-border/50 bg-card/60 py-3 text-xs font-semibold text-muted-foreground",
                "backdrop-blur-[16px] transition-colors hover:bg-card hover:text-primary-foreground focus:outline-none"
              )}
            >
              <span className="flex items-center justify-center gap-1.5">
                <X className="h-4 w-4" /> Cancel
              </span>
            </button>
            <button
              type="submit"
              disabled={isLoading}
              className={cn(
                "flex-1 rounded-xl bg-indigo-600 py-3 text-xs font-semibold text-white",
                "transition-all hover:bg-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/20",
                "disabled:pointer-events-none disabled:opacity-50",
                "shadow-[0_0_12px_rgba(99,102,241,0.3)] hover:shadow-[0_0_18px_rgba(99,102,241,0.5)]"
              )}
            >
              <span className="flex items-center justify-center gap-1.5">
                <Save className="h-4 w-4" />
                {isLoading ? "Saving..." : isEdit ? "Update Event" : "Create Event"}
              </span>
            </button>
          </div>
        </div>
      </div>
    </motion.form>
  );
}
