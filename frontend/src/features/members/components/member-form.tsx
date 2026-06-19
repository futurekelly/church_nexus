"use client";

import { useForm, Controller } from "react-hook-form";
import { motion } from "framer-motion";
import { Save, X } from "lucide-react";
import { useRouter } from "next/navigation";
import { cn } from "@/lib/utils";
import {
  MEMBER_STATUSES,
  MINISTRIES,
  STATUS_LABELS,
  type MemberFormValues,
  type Member,
} from "@/features/members/types/member.types";
import { E164_PHONE_REGEX } from "@/lib/localization";

interface MemberFormProps {
  defaultValues?: Partial<MemberFormValues>;
  member?: Member; // present when editing
  onSubmit: (values: MemberFormValues) => void;
  isLoading?: boolean;
}

const inputClass = cn(
  "w-full rounded-xl border border-border/50 bg-card/60 px-4 py-2.5",
  "text-sm text-primary-foreground placeholder:text-muted-foreground/50",
  "backdrop-blur-[16px] transition-all duration-200",
  "focus:border-primary/50 focus:outline-none focus:ring-2 focus:ring-primary/20",
);

const labelClass = "block text-xs font-medium text-muted-foreground mb-1.5";
const errorClass = "mt-1 text-xs text-red-400";

export function MemberForm({
  defaultValues,
  member,
  onSubmit,
  isLoading = false,
}: MemberFormProps) {
  const router = useRouter();
  const isEdit = !!member;

  const {
    register,
    handleSubmit,
    control,
    formState: { errors },
  } = useForm<MemberFormValues>({
    defaultValues: defaultValues ?? {
      first_name: "",
      last_name: "",
      email: "",
      phone_number: "",
      gender: "male",
      date_of_birth: "",
      address: "",
      date_joined: new Date().toISOString().slice(0, 10),
      status: "Active",
      ministries: [],
      occupation: "",
      notes: "",
    },
  });

  return (
    <motion.form
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      onSubmit={handleSubmit(onSubmit)}
      noValidate
      aria-label={isEdit ? "Edit member form" : "Add new member form"}
      className="space-y-6"
    >
      {/* Personal Information */}
      <fieldset className="rounded-2xl border border-border/50 bg-card/60 p-6 backdrop-blur-[16px] shadow-glass">
        <legend className="mb-4 text-sm font-semibold text-primary-foreground px-1">
          Personal Information
        </legend>
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label htmlFor="first_name" className={labelClass}>
              First Name <span aria-hidden="true" className="text-red-400">*</span>
            </label>
            <input
              id="first_name"
              type="text"
              autoComplete="given-name"
              placeholder="e.g. John"
              className={inputClass}
              aria-required="true"
              aria-invalid={!!errors.first_name}
              {...register("first_name", { required: "First name is required" })}
            />
            {errors.first_name && (
              <p className={errorClass} role="alert">{errors.first_name.message}</p>
            )}
          </div>

          <div>
            <label htmlFor="last_name" className={labelClass}>
              Last Name <span aria-hidden="true" className="text-red-400">*</span>
            </label>
            <input
              id="last_name"
              type="text"
              autoComplete="family-name"
              placeholder="e.g. Mwangi"
              className={inputClass}
              aria-required="true"
              aria-invalid={!!errors.last_name}
              {...register("last_name", { required: "Last name is required" })}
            />
            {errors.last_name && (
              <p className={errorClass} role="alert">{errors.last_name.message}</p>
            )}
          </div>

          <div>
            <label htmlFor="gender" className={labelClass}>Gender</label>
            <select
              id="gender"
              className={inputClass}
              {...register("gender")}
            >
              <option value="male">Male</option>
              <option value="female">Female</option>
            </select>
          </div>

          <div>
            <label htmlFor="date_of_birth" className={labelClass}>Date of Birth</label>
            <input
              id="date_of_birth"
              type="date"
              className={inputClass}
              {...register("date_of_birth")}
            />
          </div>

          <div className="sm:col-span-2">
            <label htmlFor="occupation" className={labelClass}>Occupation</label>
            <input
              id="occupation"
              type="text"
              placeholder="e.g. Teacher"
              className={inputClass}
              {...register("occupation")}
            />
          </div>
        </div>
      </fieldset>

      {/* Contact Information */}
      <fieldset className="rounded-2xl border border-border/50 bg-card/60 p-6 backdrop-blur-[16px] shadow-glass">
        <legend className="mb-4 text-sm font-semibold text-primary-foreground px-1">
          Contact Information
        </legend>
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label htmlFor="email" className={labelClass}>
              Email <span aria-hidden="true" className="text-red-400">*</span>
            </label>
            <input
              id="email"
              type="email"
              autoComplete="email"
              placeholder="e.g. john@email.com"
              className={inputClass}
              aria-required="true"
              aria-invalid={!!errors.email}
              {...register("email", {
                required: "Email is required",
                pattern: {
                  value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
                  message: "Enter a valid email address",
                },
              })}
            />
            {errors.email && (
              <p className={errorClass} role="alert">{errors.email.message}</p>
            )}
          </div>

          <div>
            <label htmlFor="phone_number" className={labelClass}>
              Phone Number <span aria-hidden="true" className="text-red-400">*</span>
            </label>
            <input
              id="phone_number"
              type="tel"
              autoComplete="tel"
              placeholder="e.g. +254 712 345 678"
              className={inputClass}
              aria-required="true"
              aria-invalid={!!errors.phone_number}
              {...register("phone_number", {
                required: "Phone number is required",
                pattern: {
                  value: E164_PHONE_REGEX,
                  message: "Must be a valid E.164 phone number (e.g., +254712345678)"
                }
              })}
            />
            {errors.phone_number && (
              <p className={errorClass} role="alert">{errors.phone_number.message}</p>
            )}
          </div>

          <div className="sm:col-span-2">
            <label htmlFor="address" className={labelClass}>Address</label>
            <input
              id="address"
              type="text"
              autoComplete="street-address"
              placeholder="e.g. 123 Ngong Road, Nairobi"
              className={inputClass}
              {...register("address")}
            />
          </div>
        </div>
      </fieldset>

      {/* Membership Details */}
      <fieldset className="rounded-2xl border border-border/50 bg-card/60 p-6 backdrop-blur-[16px] shadow-glass">
        <legend className="mb-4 text-sm font-semibold text-primary-foreground px-1">
          Membership Details
        </legend>
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label htmlFor="date_joined" className={labelClass}>
              Date Joined <span aria-hidden="true" className="text-red-400">*</span>
            </label>
            <input
              id="date_joined"
              type="date"
              className={inputClass}
              aria-required="true"
              {...register("date_joined", { required: "Join date is required" })}
            />
            {errors.date_joined && (
              <p className={errorClass} role="alert">{errors.date_joined.message}</p>
            )}
          </div>

          <div>
            <label htmlFor="status" className={labelClass}>Membership Status</label>
            <select
              id="status"
              className={inputClass}
              {...register("status")}
            >
              {MEMBER_STATUSES.map((s) => (
                <option key={s} value={s}>{STATUS_LABELS[s]}</option>
              ))}
            </select>
          </div>

          {/* Ministries multi-select */}
          <div className="sm:col-span-2">
            <span className={labelClass} id="ministries-label">
              Ministries
            </span>
            <Controller
              name="ministries"
              control={control}
              render={({ field }) => (
                <div
                  className="grid grid-cols-2 gap-2 sm:grid-cols-3"
                  role="group"
                  aria-labelledby="ministries-label"
                >
                  {MINISTRIES.map((min) => {
                    const checked = field.value.includes(min);
                    return (
                      <label
                        key={min}
                        className={cn(
                          "flex cursor-pointer items-center gap-2 rounded-xl border px-3 py-2 text-sm transition-all",
                          checked
                            ? "border-primary/40 bg-primary/10 text-primary"
                            : "border-border/40 bg-card/40 text-muted-foreground hover:border-border/70",
                        )}
                      >
                        <input
                          type="checkbox"
                          className="sr-only"
                          checked={checked}
                          onChange={() => {
                            field.onChange(
                              checked
                                ? field.value.filter((v) => v !== min)
                                : [...field.value, min],
                            );
                          }}
                          aria-label={min}
                        />
                        <span
                          className={cn(
                            "flex h-4 w-4 shrink-0 items-center justify-center rounded border text-xs",
                            checked ? "border-primary bg-primary text-white" : "border-border/50",
                          )}
                          aria-hidden="true"
                        >
                          {checked && "✓"}
                        </span>
                        {min}
                      </label>
                    );
                  })}
                </div>
              )}
            />
          </div>

          {/* Notes */}
          <div className="sm:col-span-2">
            <label htmlFor="notes" className={labelClass}>Notes</label>
            <textarea
              id="notes"
              rows={3}
              placeholder="Any additional notes about this member…"
              className={cn(inputClass, "resize-none")}
              {...register("notes")}
            />
          </div>
        </div>
      </fieldset>

      {/* Actions */}
      <div className="flex flex-wrap items-center justify-end gap-3">
        <button
          type="button"
          onClick={() => router.back()}
          className="flex items-center gap-2 rounded-xl border border-border/50 bg-card/60 px-4 py-2.5 text-sm font-medium text-muted-foreground transition-all hover:border-border/80 hover:text-primary-foreground"
        >
          <X className="h-4 w-4" aria-hidden="true" />
          Cancel
        </button>
        <button
          type="submit"
          disabled={isLoading}
          className={cn(
            "flex items-center gap-2 rounded-xl bg-primary px-5 py-2.5 text-sm font-semibold text-white",
            "transition-all hover:bg-primary/90 hover:shadow-neon",
            "disabled:pointer-events-none disabled:opacity-60",
            "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary",
          )}
        >
          <Save className="h-4 w-4" aria-hidden="true" />
          {isLoading ? "Saving…" : isEdit ? "Save Changes" : "Add Member"}
        </button>
      </div>
    </motion.form>
  );
}
