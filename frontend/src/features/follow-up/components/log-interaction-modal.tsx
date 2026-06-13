"use client";

import { useForm } from "react-hook-form";
import { X, Send, PhoneCall } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";
import type { InteractionType } from "../types/follow-up.types";
import { INTERACTION_TYPES } from "../types/follow-up.types";
import { useAuth } from "@/hooks/use-auth";

interface LogInteractionValues {
  interaction_type: InteractionType;
  notes: string;
  contacted_by: string;
}

interface LogInteractionModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (type: InteractionType, notes: string, contactedBy: string) => void;
  visitorName: string;
  isLoading?: boolean;
}

const inputClass = cn(
  "w-full rounded-xl border border-border/50 bg-card/60 px-4 py-2.5",
  "text-sm text-primary-foreground placeholder:text-muted-foreground/50",
  "backdrop-blur-[16px] transition-all duration-200",
  "focus:border-primary/50 focus:outline-none focus:ring-2 focus:ring-primary/20"
);

const labelClass = "block text-xs font-semibold text-muted-foreground mb-1.5";
const errorClass = "mt-1 text-xs text-red-400";

export function LogInteractionModal({
  isOpen,
  onClose,
  onSubmit,
  visitorName,
  isLoading = false,
}: LogInteractionModalProps) {
  const { user } = useAuth();
  
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<LogInteractionValues>({
    defaultValues: {
      interaction_type: "Call",
      notes: "",
      contacted_by: user ? `${user.first_name} ${user.last_name}` : "Pastor",
    },
  });

  if (!isOpen) return null;

  const handleFormSubmit = (values: LogInteractionValues) => {
    onSubmit(values.interaction_type, values.notes, values.contacted_by);
    reset();
    onClose();
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 select-none">
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
            "relative w-full max-w-md overflow-hidden rounded-2xl border border-border/50",
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
            <div className="flex items-center gap-2 text-indigo-400">
              <PhoneCall className="h-5 w-5" />
              <h2 id="modal-title" className="text-lg font-bold text-primary-foreground">
                Log Follow-up with {visitorName}
              </h2>
            </div>

            {/* Interaction Type */}
            <div>
              <label htmlFor="interaction_type" className={labelClass}>
                Interaction Type *
              </label>
              <select
                id="interaction_type"
                className={cn(inputClass, "cursor-pointer")}
                {...register("interaction_type", { required: "Type is required" })}
              >
                {INTERACTION_TYPES.map((type) => (
                  <option key={type} value={type}>
                    {type}
                  </option>
                ))}
              </select>
              {errors.interaction_type && <p className={errorClass}>{errors.interaction_type.message}</p>}
            </div>

            {/* Contacted By */}
            <div>
              <label htmlFor="contacted_by" className={labelClass}>
                Staff Name *
              </label>
              <input
                id="contacted_by"
                type="text"
                placeholder="e.g. Pastor David"
                className={inputClass}
                {...register("contacted_by", { required: "Staff name is required" })}
              />
              {errors.contacted_by && <p className={errorClass}>{errors.contacted_by.message}</p>}
            </div>

            {/* Notes */}
            <div>
              <label htmlFor="notes" className={labelClass}>
                Touchpoint Details / Notes *
              </label>
              <textarea
                id="notes"
                rows={4}
                placeholder="Detail what was discussed, their response, and future steps..."
                className={cn(inputClass, "resize-none")}
                {...register("notes", {
                  required: "Details are required",
                  minLength: { value: 5, message: "Please enter at least 5 characters" },
                  maxLength: { value: 300, message: "Cannot exceed 300 characters" },
                })}
              />
              {errors.notes && <p className={errorClass}>{errors.notes.message}</p>}
            </div>

            {/* Action Buttons */}
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
                <Send className="h-3.5 w-3.5" />
                <span>Save Touchpoint</span>
              </button>
            </div>
          </form>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
