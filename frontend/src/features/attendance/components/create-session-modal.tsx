"use client";

import { useForm } from "react-hook-form";
import { motion, AnimatePresence } from "framer-motion";
import { X, Clipboard, Save } from "lucide-react";
import { cn } from "@/lib/utils";
import type { SessionType } from "../types/attendance.types";
import { SESSION_TYPES, SESSION_TYPE_LABELS } from "../types/attendance.types";

interface CreateSessionValues {
  title: string;
  description: string;
  type: SessionType;
  date: string;
}

interface CreateSessionModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (values: CreateSessionValues) => void;
  isLoading?: boolean;
}

const inputClass = cn(
  "w-full rounded-xl border border-border/50 bg-card/60 px-4 py-2.5",
  "text-sm text-primary-foreground placeholder:text-muted-foreground/50",
  "backdrop-blur-[16px] transition-all duration-200",
  "focus:border-primary/50 focus:outline-none focus:ring-2 focus:ring-primary/20"
);

const labelClass = "block text-xs font-medium text-muted-foreground mb-1.5";
const errorClass = "mt-1 text-xs text-red-400";

export function CreateSessionModal({
  isOpen,
  onClose,
  onSubmit,
  isLoading = false,
}: CreateSessionModalProps) {
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<CreateSessionValues>({
    defaultValues: {
      title: "",
      description: "",
      type: "Service",
      date: new Date().toISOString().split("T")[0],
    },
  });

  if (!isOpen) return null;

  const handleFormSubmit = (values: CreateSessionValues) => {
    onSubmit(values);
    reset();
    onClose();
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        {/* Backdrop */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="absolute inset-0 bg-background/80 backdrop-blur-sm"
        />

        {/* Content Box */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 10 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 10 }}
          transition={{ duration: 0.2 }}
          className={cn(
            "relative w-full max-w-lg overflow-hidden rounded-2xl border border-border/50",
            "bg-card/90 p-6 shadow-2xl backdrop-blur-glass z-10"
          )}
          role="dialog"
          aria-modal="true"
          aria-labelledby="modal-title"
        >
          {/* Close button */}
          <button
            onClick={onClose}
            className="absolute right-4 top-4 text-muted-foreground hover:text-primary-foreground transition-colors"
            aria-label="Close dialog"
          >
            <X className="h-4 w-4" />
          </button>

          <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-4">
            <div className="flex items-center gap-2 text-primary">
              <Clipboard className="h-5 w-5" />
              <h2 id="modal-title" className="text-lg font-bold text-primary-foreground">
                Create Check-in Session
              </h2>
            </div>

            {/* Title */}
            <div>
              <label htmlFor="title" className={labelClass}>
                Session Title *
              </label>
              <input
                id="title"
                type="text"
                placeholder="e.g. Sunday First Service, Youth Friday Camp..."
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
                placeholder="Write detail summary notes regarding this session..."
                className={cn(inputClass, "resize-none")}
                {...register("description", {
                  required: "Description is required",
                  minLength: { value: 10, message: "Please enter at least 10 characters" },
                  maxLength: { value: 300, message: "Cannot exceed 300 characters" },
                })}
              />
              {errors.description && <p className={errorClass}>{errors.description.message}</p>}
            </div>

            {/* Buttons */}
            <div className="flex items-center justify-end gap-3 pt-3 border-t border-border/40">
              <button
                type="button"
                onClick={onClose}
                className="rounded-xl border border-border/50 bg-card/40 px-4 py-2 text-xs font-semibold text-muted-foreground transition-all hover:bg-slate-900 hover:text-primary-foreground"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isLoading}
                className="flex items-center gap-1.5 rounded-xl bg-primary px-4 py-2 text-xs font-semibold text-primary-foreground shadow-neon transition-all hover:brightness-110 disabled:opacity-50"
              >
                <Save className="h-3.5 w-3.5" />
                {isLoading ? "Creating..." : "Create Session"}
              </button>
            </div>
          </form>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
