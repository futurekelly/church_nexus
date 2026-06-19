"use client";

import { useForm } from "react-hook-form";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { Clipboard, Save, ArrowLeft, AlertTriangle } from "lucide-react";
import { useAttendance, SESSION_TYPES, SESSION_TYPE_LABELS, type SessionType } from "@/features/attendance";
import { useAppPermissions } from "@/hooks/use-app-permissions";
import { cn } from "@/lib/utils";
import Link from "next/link";

interface CreateSessionValues {
  title: string;
  description: string;
  type: SessionType;
  date: string;
}

const inputClass = cn(
  "w-full rounded-xl border border-border/50 bg-card/60 px-4 py-2.5",
  "text-sm text-primary-foreground placeholder:text-muted-foreground/50",
  "backdrop-blur-[16px] transition-all duration-200",
  "focus:border-primary/50 focus:outline-none focus:ring-2 focus:ring-primary/20"
);

const labelClass = "block text-xs font-semibold text-muted-foreground mb-1.5";
const errorClass = "mt-1 text-xs text-red-400";

export default function CreateSessionPage() {
  const router = useRouter();
  const { addSession } = useAttendance();
  const { attendance: attendancePermissions } = useAppPermissions();
  const { canManage } = attendancePermissions;

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<CreateSessionValues>({
    defaultValues: {
      title: "",
      description: "",
      type: "Service",
      date: new Date().toISOString().split("T")[0],
    },
  });

  const onSubmitForm = (values: CreateSessionValues) => {
    if (!canManage) return;
    const session = addSession(values);
    router.push(`/dashboard/attendance/${session.id}`);
  };

  if (!canManage) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] text-center p-6">
        <div className="rounded-2xl border border-border/40 bg-card/40 p-8 max-w-md backdrop-blur-glass shadow-glass">
          <AlertTriangle className="h-10 w-10 text-amber-400 mx-auto mb-4" />
          <h3 className="text-base font-bold text-primary-foreground">Access Denied</h3>
          <p className="text-xs text-muted-foreground mt-2">
            You do not have the required permissions to launch new attendance check-in sessions. Please contact your system administrator.
          </p>
          <button
            type="button"
            onClick={() => router.push("/dashboard/attendance")}
            className="mt-6 inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-slate-800 text-xs font-semibold text-primary-foreground hover:bg-slate-700 transition-all"
          >
            <ArrowLeft className="h-4 w-4" />
            <span>Go Back</span>
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-2xl mx-auto">
      {/* Header and Back navigation */}
      <div className="flex items-center gap-3">
        <Link
          href="/dashboard/attendance"
          className="flex h-9 w-9 items-center justify-center rounded-xl border border-border/50 bg-card/40 hover:bg-slate-900 transition-colors text-muted-foreground hover:text-primary-foreground"
          aria-label="Back to attendance list"
        >
          <ArrowLeft className="h-4 w-4" />
        </Link>
        <div>
          <h1 className="font-display text-xl font-bold text-primary-foreground">
            Launch Check-in Session
          </h1>
          <p className="text-xs text-muted-foreground">
            Create a new event, service, or fellowship session to scan tickets and log attendees
          </p>
        </div>
      </div>

      {/* Main Glassmorphic Form Card */}
      <motion.div
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.35 }}
        className="rounded-2xl border border-border/50 bg-card/60 p-6 backdrop-blur-glass shadow-glass"
      >
        <form onSubmit={handleSubmit(onSubmitForm)} className="space-y-5">
          <div className="flex items-center gap-2 text-indigo-400 border-b border-border/20 pb-3 mb-2">
            <Clipboard className="h-4 w-4" />
            <span className="text-xs font-bold uppercase tracking-wider">Session Details Form</span>
          </div>

          {/* Title */}
          <div>
            <label htmlFor="title" className={labelClass}>
              Session Title *
            </label>
            <input
              id="title"
              type="text"
              placeholder="e.g. Sunday Service - First Service, Midweek Bible Study..."
              className={inputClass}
              {...register("title", {
                required: "Title is required",
                minLength: { value: 5, message: "Title must be at least 5 characters" },
                maxLength: { value: 100, message: "Title cannot exceed 100 characters" },
              })}
            />
            {errors.title && <p className={errorClass}>{errors.title.message}</p>}
          </div>

          {/* Type & Date */}
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div>
              <label htmlFor="type" className={labelClass}>
                Session Type *
              </label>
              <select
                id="type"
                className={cn(inputClass, "cursor-pointer")}
                {...register("type", { required: "Session type is required" })}
              >
                {SESSION_TYPES.map((type) => (
                  <option key={type} value={type}>
                    {SESSION_TYPE_LABELS[type]}
                  </option>
                ))}
              </select>
              {errors.type && <p className={errorClass}>{errors.type.message}</p>}
            </div>

            <div>
              <label htmlFor="date" className={labelClass}>
                Session Date *
              </label>
              <input
                id="date"
                type="date"
                className={inputClass}
                {...register("date", { required: "Date is required" })}
              />
              {errors.date && <p className={errorClass}>{errors.date.message}</p>}
            </div>
          </div>

          {/* Description */}
          <div>
            <label htmlFor="description" className={labelClass}>
              Description / Notes *
            </label>
            <textarea
              id="description"
              rows={4}
              placeholder="Write a brief overview describing this session's activities, speakers, or objectives..."
              className={cn(inputClass, "resize-none")}
              {...register("description", {
                required: "Description is required",
                minLength: { value: 10, message: "Please enter at least 10 characters" },
                maxLength: { value: 300, message: "Cannot exceed 300 characters" },
              })}
            />
            {errors.description && <p className={errorClass}>{errors.description.message}</p>}
          </div>

          {/* Action Buttons */}
          <div className="flex items-center justify-end gap-3 pt-3 border-t border-border/20">
            <button
              type="button"
              onClick={() => router.push("/dashboard/attendance")}
              className="rounded-xl border border-border/50 bg-card/40 px-5 py-2.5 text-xs font-semibold text-muted-foreground transition-all hover:bg-slate-900 hover:text-primary-foreground"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="flex items-center gap-1.5 rounded-xl bg-primary px-5 py-2.5 text-xs font-bold text-primary-foreground shadow-neon transition-all hover:brightness-110"
            >
              <Save className="h-4 w-4" />
              <span>Create & Launch</span>
            </button>
          </div>
        </form>
      </motion.div>
    </div>
  );
}
