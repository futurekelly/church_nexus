"use client";

import { useForm, Controller } from "react-hook-form";
import { motion } from "framer-motion";
import { Save, X } from "lucide-react";
import { useRouter } from "next/navigation";
import { cn } from "@/lib/utils";
import type { PrayerRequest, PrayerCategory, PrayerStatus } from "../types/prayer.types";
import { PRAYER_CATEGORIES, PRAYER_CATEGORY_LABELS, PRAYER_STATUSES, STATUS_LABELS } from "../types/prayer.types";
import { useAppPermissions } from "@/hooks/use-app-permissions";

interface PrayerFormValues {
  title: string;
  description: string;
  category: PrayerCategory;
  anonymous: boolean;
  status?: PrayerStatus;
}

interface PrayerFormProps {
  defaultValues?: Partial<PrayerFormValues>;
  request?: PrayerRequest; // present when editing
  onSubmit: (values: PrayerFormValues) => void;
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

export function PrayerForm({
  defaultValues,
  request,
  onSubmit,
  isLoading = false,
}: PrayerFormProps) {
  const router = useRouter();
  const isEdit = !!request;
  const { prayer: prayerPermissions } = useAppPermissions();
  const { canManageStatus } = prayerPermissions;

  const {
    register,
    handleSubmit,
    control,
    formState: { errors },
  } = useForm<PrayerFormValues>({
    defaultValues: defaultValues ?? {
      title: "",
      description: "",
      category: "Spiritual",
      anonymous: false,
      status: request?.status ?? "New",
    },
  });

  return (
    <motion.form
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      onSubmit={handleSubmit(onSubmit)}
      className="space-y-6"
    >
      <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
        {/* Title */}
        <div className="md:col-span-2">
          <label htmlFor="title" className={labelClass}>
            Request Title *
          </label>
          <input
            id="title"
            type="text"
            placeholder="e.g. Complete Healing from Surgery, Wisdom in Decision Making..."
            className={inputClass}
            {...register("title", {
              required: "Title is required",
              minLength: { value: 5, message: "Title must be at least 5 characters" },
              maxLength: { value: 100, message: "Title cannot exceed 100 characters" },
            })}
          />
          {errors.title && <p className={errorClass}>{errors.title.message}</p>}
        </div>

        {/* Category */}
        <div>
          <label htmlFor="category" className={labelClass}>
            Category *
          </label>
          <select
            id="category"
            className={cn(inputClass, "cursor-pointer")}
            {...register("category", { required: "Category is required" })}
          >
            {PRAYER_CATEGORIES.map((cat) => (
              <option key={cat} value={cat}>
                {PRAYER_CATEGORY_LABELS[cat]}
              </option>
            ))}
          </select>
          {errors.category && <p className={errorClass}>{errors.category.message}</p>}
        </div>

        {/* Status (Edit Mode & Authorized Role Only) */}
        {isEdit && canManageStatus ? (
          <div>
            <label htmlFor="status" className={labelClass}>
              Status *
            </label>
            <select
              id="status"
              className={cn(inputClass, "cursor-pointer")}
              {...register("status", { required: "Status is required" })}
            >
              {PRAYER_STATUSES.map((stat) => (
                <option key={stat} value={stat}>
                  {STATUS_LABELS[stat]}
                </option>
              ))}
            </select>
            {errors.status && <p className={errorClass}>{errors.status.message}</p>}
          </div>
        ) : (
          <div className="flex items-center pt-8">
            <Controller
              name="anonymous"
              control={control}
              render={({ field }) => (
                <label className="flex items-center gap-3 cursor-pointer text-sm text-primary-foreground font-medium select-none">
                  <input
                    type="checkbox"
                    checked={field.value}
                    onChange={(e) => field.onChange(e.target.checked)}
                    className="h-4.5 w-4.5 rounded border-border/50 bg-card/60 text-primary focus:ring-0 focus:ring-offset-0 cursor-pointer"
                  />
                  <span>Submit Anonymously</span>
                </label>
              )}
            />
          </div>
        )}

        {/* Description */}
        <div className="md:col-span-2">
          <label htmlFor="description" className={labelClass}>
            Request Details *
          </label>
          <textarea
            id="description"
            rows={6}
            placeholder="Share your prayer requests here. Be as specific as you feel comfortable. Our prayer team and congregation stand with you."
            className={cn(inputClass, "resize-none")}
            {...register("description", {
              required: "Description is required",
              minLength: { value: 15, message: "Please provide a bit more detail (min 15 chars)" },
              maxLength: { value: 1000, message: "Description cannot exceed 1000 characters" },
            })}
          />
          {errors.description && <p className={errorClass}>{errors.description.message}</p>}
        </div>

        {/* Anonymous flag in edit mode (if not pastor/admin) */}
        {isEdit && !canManageStatus && (
          <div className="md:col-span-2 flex items-center">
            <Controller
              name="anonymous"
              control={control}
              render={({ field }) => (
                <label className="flex items-center gap-3 cursor-pointer text-sm text-primary-foreground font-medium select-none">
                  <input
                    type="checkbox"
                    checked={field.value}
                    onChange={(e) => field.onChange(e.target.checked)}
                    className="h-4.5 w-4.5 rounded border-border/50 bg-card/60 text-primary focus:ring-0 focus:ring-offset-0 cursor-pointer"
                  />
                  <span>Submit Anonymously</span>
                </label>
              )}
            />
          </div>
        )}
      </div>

      {/* Buttons */}
      <div className="flex items-center justify-end gap-3 pt-4 border-t border-border/40">
        <button
          type="button"
          disabled={isLoading}
          onClick={() => router.back()}
          className="flex items-center gap-1.5 rounded-xl border border-border/50 bg-card/40 px-4 py-2.5 text-sm font-semibold text-muted-foreground transition-all hover:bg-slate-900 hover:text-primary-foreground"
        >
          <X className="h-4 w-4" />
          Cancel
        </button>

        <button
          type="submit"
          disabled={isLoading}
          className="flex items-center gap-1.5 rounded-xl bg-primary px-5 py-2.5 text-sm font-semibold text-primary-foreground shadow-neon transition-all hover:brightness-110 disabled:opacity-50"
        >
          <Save className="h-4 w-4" />
          {isLoading ? "Saving..." : isEdit ? "Save Changes" : "Submit Request"}
        </button>
      </div>
    </motion.form>
  );
}
