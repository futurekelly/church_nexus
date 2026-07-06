"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { motion } from "framer-motion";
import { Save, X, AlertTriangle } from "lucide-react";
import { useState, useEffect } from "react";
import { apiGet, isApiError } from "@/services/api-client";
import { cn } from "@/lib/utils";
import type { Child } from "../types/kids-kingdom.types";

const childFormSchema = z.object({
  first_name: z.string().min(2, "First name must be at least 2 characters"),
  last_name: z.string().min(2, "Last name must be at least 2 characters"),
  birth_date: z.string().min(1, "Birth date is required"),
  gender: z.enum(["male", "female", "other"], {
    errorMap: () => ({ message: "Please select a valid gender" }),
  }),
  allergy_alerts: z.string().default(""),
  special_needs: z.string().default(""),
  notes: z.string().default(""),
  selectedParents: z.array(z.string()).min(1, "At least one parent/guardian is required"),
});

type ChildFormValues = z.infer<typeof childFormSchema>;

interface ChildFormProps {
  child?: Child;
  onSubmit: (values: any) => void;
  onClose: () => void;
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

export function ChildRegistryForm({
  child,
  onSubmit,
  onClose,
  isLoading = false,
}: ChildFormProps) {
  const [members, setMembers] = useState<any[]>([]);
  const [isSearchingMembers, setIsSearchingMembers] = useState(false);

  useEffect(() => {
    async function loadMembers() {
      setIsSearchingMembers(true);
      try {
        const response = await apiGet<any>("/api/members/?page_size=100");
        if (!isApiError(response)) {
          const list = Array.isArray(response.data)
            ? response.data
            : response.data?.results || [];
          setMembers(list);
        }
      } catch (err) {
        console.error("Failed to load church members:", err);
      } finally {
        setIsSearchingMembers(false);
      }
    }
    loadMembers();
  }, []);

  const isEdit = !!child;

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm<ChildFormValues>({
    resolver: zodResolver(childFormSchema),
    defaultValues: child
      ? {
          first_name: child.first_name,
          last_name: child.last_name,
          birth_date: child.birth_date,
          gender: child.gender,
          allergy_alerts: child.allergy_alerts || "",
          special_needs: child.special_needs || "",
          notes: child.notes || "",
          selectedParents: child.parents || [],
        }
      : {
          first_name: "",
          last_name: "",
          birth_date: "",
          gender: "male",
          allergy_alerts: "",
          special_needs: "",
          notes: "",
          selectedParents: [],
        },
  });

  const selectedParents = watch("selectedParents");

  const handleParentToggle = (parentId: string) => {
    const current = [...selectedParents];
    const idx = current.indexOf(parentId);
    if (idx > -1) {
      current.splice(idx, 1);
    } else {
      current.push(parentId);
    }
    setValue("selectedParents", current, { shouldValidate: true });
  };

  const onFormSubmit = (data: ChildFormValues) => {
    onSubmit({
      first_name: data.first_name,
      last_name: data.last_name,
      birth_date: data.birth_date,
      gender: data.gender,
      allergy_alerts: data.allergy_alerts || null,
      special_needs: data.special_needs || null,
      notes: data.notes || null,
      parents: data.selectedParents,
    });
  };

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.95 }}
      className="w-full max-w-xl max-h-[90vh] flex flex-col overflow-hidden rounded-3xl border border-border/50 bg-slate-900/95 p-6 backdrop-blur-xl shadow-2xl"
    >
      {/* Header */}
      <div className="flex-shrink-0 flex items-center justify-between border-b border-border/10 pb-4 mb-4">
        <div>
          <h3 className="text-lg font-bold text-primary-foreground">
            {isEdit ? "Edit Child Profile" : "Register Child"}
          </h3>
          <p className="text-xs text-muted-foreground">
            Add general details, health logs, and parent connections.
          </p>
        </div>
        <button
          type="button"
          onClick={onClose}
          className="rounded-xl border border-border/50 p-2 text-muted-foreground transition-all hover:bg-card/50 hover:text-primary-foreground"
        >
          <X className="h-4 w-4" />
        </button>
      </div>

      <form onSubmit={handleSubmit(onFormSubmit)} className="flex-1 flex flex-col min-h-0 overflow-hidden">
        {/* Scrollable form body */}
        <div className="flex-1 overflow-y-auto pr-2 space-y-4">
          {/* Name Fields */}
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label htmlFor="first_name" className={labelClass}>First Name</label>
              <input
                id="first_name"
                type="text"
                placeholder="e.g. Baraka"
                className={inputClass}
                {...register("first_name")}
              />
              {errors.first_name && (
                <p className={errorClass}>{errors.first_name.message}</p>
              )}
            </div>
            <div>
              <label htmlFor="last_name" className={labelClass}>Last Name</label>
              <input
                id="last_name"
                type="text"
                placeholder="e.g. Said"
                className={inputClass}
                {...register("last_name")}
              />
              {errors.last_name && (
                <p className={errorClass}>{errors.last_name.message}</p>
              )}
            </div>
          </div>

          {/* Date & Gender */}
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label htmlFor="birth_date" className={labelClass}>Birth Date</label>
              <input
                id="birth_date"
                type="date"
                className={inputClass}
                {...register("birth_date")}
              />
              {errors.birth_date && (
                <p className={errorClass}>{errors.birth_date.message}</p>
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
                <option value="other">Other</option>
              </select>
              {errors.gender && (
                <p className={errorClass}>{errors.gender.message}</p>
              )}
            </div>
          </div>

          {/* Health logs */}
          <div className="space-y-3 rounded-2xl border border-red-500/20 bg-red-500/5 p-4">
            <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-red-400">
              <AlertTriangle className="h-4 w-4" />
              Safety & Allergy Warnings
            </div>
            <div>
              <label htmlFor="allergy_alerts" className={labelClass}>Allergy Alerts</label>
              <input
                id="allergy_alerts"
                type="text"
                placeholder="e.g. Peanuts, Gluten (leave blank if none)"
                className={cn(inputClass, "border-red-500/20 focus:border-red-500/50 focus:ring-red-500/10")}
                {...register("allergy_alerts")}
              />
            </div>
            <div>
              <label htmlFor="special_needs" className={labelClass}>Special Needs / Medical Notes</label>
              <input
                id="special_needs"
                type="text"
                placeholder="e.g. Asthma inhaler, ADHD support notes"
                className={cn(inputClass, "border-red-500/20 focus:border-red-500/50 focus:ring-red-500/10")}
                {...register("special_needs")}
              />
            </div>
          </div>

          {/* General notes */}
          <div>
            <label htmlFor="notes" className={labelClass}>Check-In Notes / General Outline</label>
            <textarea
              id="notes"
              rows={2}
              placeholder="Any pick-up instructions or general notes..."
              className={inputClass}
              {...register("notes")}
            />
          </div>

          {/* Parent Linkage */}
          <div className="space-y-2">
            <label className={labelClass}>Link Parent / Guardian</label>
            <div className="max-h-36 overflow-y-auto rounded-xl border border-border/40 bg-slate-950/40 p-2 space-y-1.5">
              {isSearchingMembers ? (
                <p className="p-3 text-center text-xs text-muted-foreground animate-pulse">Loading church member lists...</p>
              ) : members.length === 0 ? (
                <p className="p-3 text-center text-xs text-muted-foreground">No members found. Please register members first.</p>
              ) : (
                members.map((member) => {
                  const isSelected = selectedParents.includes(member.id);
                  return (
                    <button
                      key={member.id}
                      type="button"
                      onClick={() => handleParentToggle(member.id)}
                      className={cn(
                        "flex w-full items-center justify-between rounded-lg px-3 py-1.5 text-xs transition-all",
                        isSelected
                          ? "bg-indigo-600/20 border border-indigo-500/30 text-indigo-300"
                          : "hover:bg-card/40 border border-transparent text-muted-foreground"
                      )}
                    >
                      <span>{member.first_name} {member.last_name}</span>
                      <span className="text-[10px] text-muted-foreground/60">{member.phone_number || member.phone || "No Phone"}</span>
                    </button>
                  );
                })
              )}
            </div>
            {errors.selectedParents && (
              <p className={errorClass}>{errors.selectedParents.message}</p>
            )}
          </div>
        </div>

        {/* Fixed Footer Actions */}
        <div className="flex-shrink-0 flex items-center justify-end gap-3 border-t border-border/10 pt-4 mt-4">
          <button
            type="button"
            onClick={onClose}
            className="rounded-xl border border-border/50 bg-card/60 px-4 py-2.5 text-xs font-semibold text-muted-foreground hover:text-primary-foreground transition-all"
            disabled={isLoading}
          >
            Cancel
          </button>
          <button
            type="submit"
            className={cn(
              "inline-flex items-center gap-1.5 rounded-xl bg-indigo-600 px-5 py-2.5 text-xs font-bold text-white transition-all hover:bg-indigo-500 shadow-[0_0_12px_rgba(99,102,241,0.3)]",
              isLoading && "opacity-50 cursor-not-allowed"
            )}
            disabled={isLoading}
          >
            <Save className="h-4 w-4" />
            {isEdit ? "Update Profile" : "Save Registry"}
          </button>
        </div>
      </form>
    </motion.div>
  );
}
