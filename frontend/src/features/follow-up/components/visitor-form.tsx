"use client";

import { useForm } from "react-hook-form";
import { Save, ClipboardList, HelpCircle } from "lucide-react";
import { cn } from "@/lib/utils";
import type { VisitorProfile } from "../types/follow-up.types";
import { E164_PHONE_REGEX } from "@/lib/localization";
import { INVITED_BY_OPTIONS, SPIRITUAL_BACKGROUND_OPTIONS } from "../types/follow-up.types";

interface VisitorFormValues {
  first_name: string;
  last_name: string;
  email: string;
  phone_number: string;
  gender: "male" | "female";
  first_time_visitor: boolean;
  invited_by: string;
  visit_reason: string;
  spiritual_background: string;
  prayer_request: string;
  notes: string;
}

interface VisitorFormProps {
  onSubmit: (values: VisitorFormValues) => void;
  onCancel: () => void;
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

export function VisitorForm({ onSubmit, onCancel, isLoading = false }: VisitorFormProps) {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<VisitorFormValues>({
    defaultValues: {
      first_name: "",
      last_name: "",
      email: "",
      phone_number: "",
      gender: "female",
      first_time_visitor: true,
      invited_by: "Walk In",
      visit_reason: "",
      spiritual_background: "Prefer Not To Say",
      prayer_request: "",
      notes: "",
    },
  });

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 max-w-xl">
      <div className="flex items-center gap-2 text-indigo-400 border-b border-border/20 pb-3 mb-3">
        <ClipboardList className="h-5 w-5" />
        <h3 className="text-sm font-bold uppercase tracking-wider">Visitor Details</h3>
      </div>

      {/* Name row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label htmlFor="first_name" className={labelClass}>
            First Name *
          </label>
          <input
            id="first_name"
            type="text"
            placeholder="e.g. Mary"
            className={inputClass}
            {...register("first_name", {
              required: "First name is required",
              minLength: { value: 2, message: "Must be at least 2 characters" },
            })}
          />
          {errors.first_name && <p className={errorClass}>{errors.first_name.message}</p>}
        </div>

        <div>
          <label htmlFor="last_name" className={labelClass}>
            Last Name *
          </label>
          <input
            id="last_name"
            type="text"
            placeholder="e.g. Atieno"
            className={inputClass}
            {...register("last_name", {
              required: "Last name is required",
              minLength: { value: 2, message: "Must be at least 2 characters" },
            })}
          />
          {errors.last_name && <p className={errorClass}>{errors.last_name.message}</p>}
        </div>
      </div>

      {/* Email & Phone */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label htmlFor="email" className={labelClass}>
            Email Address *
          </label>
          <input
            id="email"
            type="email"
            placeholder="e.g. mary.atieno@email.com"
            className={inputClass}
            {...register("email", {
              required: "Email is required",
              pattern: {
                value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                message: "Invalid email address",
              },
            })}
          />
          {errors.email && <p className={errorClass}>{errors.email.message}</p>}
        </div>

        <div>
          <label htmlFor="phone_number" className={labelClass}>
            Phone Number *
          </label>
          <input
            id="phone_number"
            type="text"
            placeholder="e.g. +254 712 345 678"
            className={inputClass}
            {...register("phone_number", {
              required: "Phone number is required",
              pattern: {
                value: E164_PHONE_REGEX,
                message: "Must be a valid E.164 phone number (e.g., +254712345678)"
              }
            })}
          />
          {errors.phone_number && <p className={errorClass}>{errors.phone_number.message}</p>}
        </div>
      </div>

      {/* Gender & First-time Visitor */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label htmlFor="gender" className={labelClass}>
            Gender *
          </label>
          <select
            id="gender"
            className={cn(inputClass, "cursor-pointer")}
            {...register("gender", { required: "Gender is required" })}
          >
            <option value="female">Female</option>
            <option value="male">Male</option>
          </select>
          {errors.gender && <p className={errorClass}>{errors.gender.message}</p>}
        </div>

        <div className="flex items-center pt-6">
          <input
            id="first_time_visitor"
            type="checkbox"
            className="h-4 w-4 rounded border-border/50 bg-slate-950 text-indigo-600 focus:ring-indigo-500/20"
            {...register("first_time_visitor")}
          />
          <label htmlFor="first_time_visitor" className="ml-2 text-xs font-semibold text-muted-foreground cursor-pointer">
            First-time Visitor
          </label>
        </div>
      </div>

      {/* Invited By & Spiritual Background */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label htmlFor="invited_by" className={labelClass}>
            Invited By *
          </label>
          <select
            id="invited_by"
            className={cn(inputClass, "cursor-pointer")}
            {...register("invited_by", { required: "Please select invited by" })}
          >
            {INVITED_BY_OPTIONS.map((opt) => (
              <option key={opt} value={opt}>
                {opt}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label htmlFor="spiritual_background" className={labelClass}>
            Spiritual Background *
          </label>
          <select
            id="spiritual_background"
            className={cn(inputClass, "cursor-pointer")}
            {...register("spiritual_background", { required: "Please select background" })}
          >
            {SPIRITUAL_BACKGROUND_OPTIONS.map((opt) => (
              <option key={opt} value={opt}>
                {opt}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Visit Reason */}
      <div>
        <label htmlFor="visit_reason" className={labelClass}>
          Reason for Visit
        </label>
        <input
          id="visit_reason"
          type="text"
          placeholder="e.g. Relocated to area, looking for local bible study..."
          className={inputClass}
          {...register("visit_reason")}
        />
      </div>

      {/* Prayer Request */}
      <div>
        <label htmlFor="prayer_request" className={labelClass}>
          First-time Prayer Request
        </label>
        <textarea
          id="prayer_request"
          rows={3}
          placeholder="Write down any prayer requests they submitted on their welcome card..."
          className={cn(inputClass, "resize-none")}
          {...register("prayer_request")}
        />
      </div>

      {/* Notes */}
      <div>
        <label htmlFor="notes" className={labelClass}>
          Interaction / Follow-up Notes
        </label>
        <textarea
          id="notes"
          rows={3}
          placeholder="Add any impressions or counseling comments..."
          className={cn(inputClass, "resize-none")}
          {...register("notes")}
        />
      </div>

      {/* Action Buttons */}
      <div className="flex items-center justify-end gap-3 pt-3 border-t border-border/20">
        <button
          type="button"
          onClick={onCancel}
          className="rounded-xl border border-border/50 bg-card/40 px-5 py-2.5 text-xs font-semibold text-muted-foreground transition-all hover:bg-slate-900 hover:text-primary-foreground"
        >
          Cancel
        </button>
        <button
          type="submit"
          disabled={isLoading}
          className="flex items-center gap-1.5 rounded-xl bg-primary px-5 py-2.5 text-xs font-bold text-primary-foreground shadow-neon transition-all hover:brightness-110 disabled:opacity-50"
        >
          <Save className="h-4 w-4" />
          <span>{isLoading ? "Saving..." : "Save Visitor"}</span>
        </button>
      </div>
    </form>
  );
}
