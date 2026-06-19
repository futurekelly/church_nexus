"use client";

import { useState } from "react";
import { Megaphone, ArrowLeft, Check, Lock, Send, Calendar } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { useAppPermissions } from "@/hooks/use-app-permissions";
import { useAnnouncements } from "@/features/notifications";
import { useBranches } from "@/features/settings";
import type { Announcement, AnnouncementStatus, AudienceScope } from "@/features/notifications";
import { cn } from "@/lib/utils";

const inputClass = cn(
  "w-full rounded-xl border border-border/50 bg-card/60 px-4 py-2.5 text-xs",
  "text-primary-foreground placeholder:text-muted-foreground/50 focus:border-indigo-500/50 focus:outline-none"
);

const labelClass = "block text-[10px] font-semibold text-muted-foreground mb-1.5 uppercase tracking-wider";

interface ComposeAnnouncementForm {
  title: string;
  message: string;
  status: AnnouncementStatus;
  audience_scope: AudienceScope;
  branch_id: string | null;
  priority: "Normal" | "High" | "Urgent";
  scheduled_at?: string;
  target_roles?: string[];
}

export default function ComposeAnnouncementPage() {
  const router = useRouter();
  const { announcements: permissions } = useAppPermissions();
  const { addAnnouncement } = useAnnouncements();
  const { branches } = useBranches();
  const [success, setSuccess] = useState(false);

  const { register, handleSubmit, watch, reset, setValue } = useForm<ComposeAnnouncementForm>({
    defaultValues: {
      title: "",
      message: "",
      status: "Draft",
      audience_scope: "Global",
      branch_id: null,
      priority: "Normal",
      scheduled_at: "",
      target_roles: []
    }
  });

  const watchScope = watch("audience_scope");
  const watchStatus = watch("status");

  // Guard: Super Admin, Church Admin, Pastor, Media Team holding announcements:create
  if (!permissions.canCreate) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] text-center p-6 select-none">
        <div className="rounded-2xl border border-border/40 bg-card/40 p-8 max-w-md backdrop-blur-glass shadow-glass">
          <Lock className="h-10 w-10 text-rose-400 mx-auto mb-4" />
          <h3 className="text-base font-bold text-primary-foreground font-display">Access Restricted</h3>
          <p className="text-xs text-muted-foreground mt-2">
            You do not have the required permissions to compose bulletins or broadcasts.
          </p>
        </div>
      </div>
    );
  }

  const onSubmit = (data: ComposeAnnouncementForm) => {
    // Sanitize null values
    const branchVal = data.audience_scope === "Branch" ? data.branch_id : null;
    const rolesVal = data.audience_scope === "Custom" ? data.target_roles : undefined;

    addAnnouncement({
      title: data.title,
      message: data.message,
      status: data.status,
      audience_scope: data.audience_scope,
      branch_id: branchVal,
      target_roles: rolesVal,
      priority: data.priority,
      created_by: "m001",
      scheduled_at: data.status === "Scheduled" ? data.scheduled_at : undefined,
      published_at: data.status === "Published" ? new Date().toISOString() : undefined
    });

    setSuccess(true);
    setTimeout(() => {
      setSuccess(false);
      reset();
      router.push("/dashboard/announcements");
    }, 1500);
  };

  const handleRoleToggle = (roleName: string, activeList: string[] = []) => {
    const nextList = activeList.includes(roleName)
      ? activeList.filter((r) => r !== roleName)
      : [...activeList, roleName];
    setValue("target_roles", nextList);
  };

  const watchRoles = watch("target_roles") || [];

  return (
    <div className="p-6 max-w-xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center gap-3 border-b border-border/30 pb-4">
        <Link
          href="/dashboard/announcements"
          className="flex h-9 w-9 items-center justify-center rounded-xl border border-border/50 bg-card/40 hover:bg-slate-900 transition-colors text-muted-foreground hover:text-primary-foreground"
          aria-label="Back to announcements"
        >
          <ArrowLeft className="h-4 w-4" />
        </Link>
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-primary-foreground font-display flex items-center gap-2">
            <Megaphone className="h-6 w-6 text-indigo-400" />
            Compose Bulletin
          </h1>
          <p className="text-xs text-muted-foreground mt-0.5">
            Publish a campus broadcast, spiritual announcement, or target bulletin notices.
          </p>
        </div>
      </div>

      <div className="rounded-2xl border border-border/40 bg-card/60 p-6 backdrop-blur-glass shadow-glass">
        {success ? (
          <div className="py-8 text-center space-y-3">
            <div className="h-10 w-10 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 rounded-full flex items-center justify-center mx-auto">
              <Check className="h-5 w-5" />
            </div>
            <h3 className="font-display text-sm font-bold text-primary-foreground">Bulletin Saved!</h3>
            <p className="text-xs text-muted-foreground leading-normal">
              The announcement draft has been created or published successfully.
            </p>
          </div>
        ) : (
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            {/* Title */}
            <div>
              <label htmlFor="title" className={labelClass}>Bulletin Title *</label>
              <input
                id="title"
                type="text"
                placeholder="e.g. Tabata Campus Closed for Renovations"
                className={inputClass}
                required
                {...register("title", { required: true })}
              />
            </div>

            {/* Content */}
            <div>
              <label htmlFor="message" className={labelClass}>Notice Content *</label>
              <textarea
                id="message"
                rows={5}
                placeholder="Write notice body here..."
                className={cn(inputClass, "resize-none")}
                required
                {...register("message", { required: true })}
              />
            </div>

            {/* Scope / Branch Selection */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label htmlFor="audience_scope" className={labelClass}>Audience Scope *</label>
                <select id="audience_scope" className={inputClass} {...register("audience_scope")}>
                  <option value="Global">Global Broadcast</option>
                  <option value="Branch">Scoped Branch Campus</option>
                  <option value="Leaders">Leaders Only</option>
                  <option value="Members">Members Only</option>
                  <option value="Visitors">Visitors Only</option>
                  <option value="Custom">Custom Target Roles</option>
                </select>
              </div>

              {/* Scoped Branch */}
              {watchScope === "Branch" && (
                <div>
                  <label htmlFor="branch_id" className={labelClass}>Target Campus *</label>
                  <select id="branch_id" className={inputClass} {...register("branch_id")}>
                    {branches.map((b) => (
                      <option key={b.id} value={b.id}>
                        {b.branch_name}
                      </option>
                    ))}
                  </select>
                </div>
              )}
            </div>

            {/* Custom Roles multi-check (conditional) */}
            {watchScope === "Custom" && (
              <div className="border border-border/40 rounded-xl p-3 bg-slate-900/40">
                <span className={labelClass}>Target Roles Selection</span>
                <div className="grid grid-cols-2 gap-2 mt-2 select-none">
                  {["Pastor", "Treasurer", "Church Admin", "Media Team", "Member"].map((roleName) => (
                    <label key={roleName} className="flex items-center gap-2 cursor-pointer text-xs">
                      <input
                        type="checkbox"
                        checked={watchRoles.includes(roleName)}
                        onChange={() => handleRoleToggle(roleName, watchRoles)}
                        className="rounded border-border/50 text-indigo-500 bg-card"
                      />
                      <span>{roleName}</span>
                    </label>
                  ))}
                </div>
              </div>
            )}

            <div className="grid grid-cols-2 gap-4">
              {/* Status */}
              <div>
                <label htmlFor="status" className={labelClass}>Status Workflow *</label>
                <select id="status" className={inputClass} {...register("status")}>
                  <option value="Draft">Draft (Private)</option>
                  <option value="Scheduled">Scheduled (Future release)</option>
                  <option value="Published">Published (Public immediate)</option>
                </select>
              </div>

              {/* Priority */}
              <div>
                <label htmlFor="priority" className={labelClass}>Priority</label>
                <select id="priority" className={inputClass} {...register("priority")}>
                  <option value="Normal">Normal</option>
                  <option value="High">High</option>
                  <option value="Urgent">Urgent</option>
                </select>
              </div>
            </div>

            {/* Scheduled Date picker */}
            {watchStatus === "Scheduled" && (
              <div>
                <label htmlFor="scheduled_at" className={labelClass}>Schedule Publish Date *</label>
                <div className="relative">
                  <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <input
                    id="scheduled_at"
                    type="datetime-local"
                    className={cn(inputClass, "pl-10")}
                    required
                    {...register("scheduled_at", { required: true })}
                  />
                </div>
              </div>
            )}

            {/* Action buttons */}
            <div className="mt-6 flex justify-end gap-3 border-t border-border/30 pt-4">
              <button
                type="button"
                onClick={() => router.push("/dashboard/announcements")}
                className="rounded-xl border border-border/50 bg-card px-4 py-2 text-xs font-semibold text-muted-foreground hover:text-primary-foreground transition-all"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="inline-flex items-center gap-1.5 rounded-xl bg-indigo-500 px-5 py-2 text-xs font-semibold text-white hover:bg-indigo-600 transition-all shadow-neon"
              >
                <Send className="h-3.5 w-3.5" />
                <span>Save Notice</span>
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
