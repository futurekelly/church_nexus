"use client";

import { useAnnouncements } from "@/features/notifications";
import { Megaphone, Plus, Calendar, History, Star, User } from "lucide-react";
import Link from "next/link";
import { useAppPermissions } from "@/hooks/use-app-permissions";
import { useAuth } from "@/hooks/use-auth";
import { cn } from "@/lib/utils";

export default function AnnouncementsFeedPage() {
  const { announcements: permissions } = useAppPermissions();
  const { user } = useAuth();
  const { getVisibleAnnouncements } = useAnnouncements();

  // Simulate active user branch as branch-001 by default if none is set
  const userBranchId = (user as any)?.branch_id || "branch-001";
  const visibleAnnouncements = getVisibleAnnouncements(userBranchId);

  const getPriorityStyle = (priority: string) => {
    switch (priority) {
      case "Urgent":
        return "bg-rose-500/10 text-rose-400 border border-rose-500/25 shadow-[0_0_8px_rgba(244,63,94,0.05)]";
      case "High":
        return "bg-amber-500/10 text-amber-400 border border-amber-500/25";
      default:
        return "bg-indigo-500/10 text-indigo-400 border border-indigo-500/25";
    }
  };

  return (
    <div className="p-6 max-w-5xl mx-auto space-y-8">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between border-b border-border/30 pb-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-primary-foreground font-display flex items-center gap-2">
            <Megaphone className="h-6 w-6 text-indigo-400" />
            Announcements & Bulletins
          </h1>
          <p className="text-xs text-muted-foreground mt-0.5">
            Read daily broadcasts, schedules, and spiritual notices published by church leadership.
          </p>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          {permissions.canManage && (
            <Link
              href="/dashboard/announcements/history"
              className="inline-flex h-9 items-center gap-1.5 rounded-xl border border-border/50 bg-card/60 px-4 text-xs font-semibold text-slate-300 hover:text-primary-foreground hover:bg-slate-900 transition-all"
            >
              <History className="h-4 w-4" />
              <span>History Board</span>
            </Link>
          )}

          {permissions.canCreate && (
            <Link
              href="/dashboard/announcements/create"
              className="inline-flex h-9 items-center gap-1.5 rounded-xl bg-indigo-500 px-4 text-xs font-semibold text-white hover:bg-indigo-600 transition-all shadow-neon"
            >
              <Plus className="h-4 w-4" />
              <span>Compose Bulletin</span>
            </Link>
          )}
        </div>
      </div>

      {/* Announcements list */}
      <div className="grid gap-6 md:grid-cols-2">
        {visibleAnnouncements.length > 0 ? (
          visibleAnnouncements.map((ann) => {
            const formattedDate = ann.published_at
              ? new Date(ann.published_at).toLocaleDateString("en-US", {
                  year: "numeric",
                  month: "short",
                  day: "numeric",
                })
              : "N/A";

            return (
              <div
                key={ann.id}
                className={cn(
                  "relative flex flex-col justify-between rounded-2xl border bg-card/60 p-6 backdrop-blur-glass transition-all duration-300 shadow-glass",
                  ann.priority === "Urgent"
                    ? "border-rose-500/35 bg-gradient-to-br from-rose-500/5 to-transparent"
                    : "border-border/50 hover:border-indigo-500/30"
                )}
              >
                <div className="space-y-4">
                  {/* Category & Date */}
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className={cn("rounded px-2.5 py-0.5 text-[9px] font-bold uppercase", getPriorityStyle(ann.priority))}>
                        {ann.priority} Priority
                      </span>
                      <span className="rounded bg-slate-800 text-[9px] font-semibold text-slate-400 px-2 py-0.5 border border-border/20">
                        {ann.audience_scope}
                      </span>
                    </div>

                    <span className="text-[10px] text-muted-foreground flex items-center gap-1 font-medium">
                      <Calendar className="h-3.5 w-3.5" />
                      {formattedDate}
                    </span>
                  </div>

                  {/* Title */}
                  <h3 className="font-display text-lg font-bold text-primary-foreground leading-snug">
                    {ann.title}
                  </h3>

                  {/* Content */}
                  <p className="text-xs text-muted-foreground leading-relaxed whitespace-pre-line">
                    {ann.message}
                  </p>
                </div>

                <div className="mt-6 border-t border-border/30 pt-4 flex items-center justify-between text-[10px] text-slate-500 font-medium">
                  {/* Author Name */}
                  <div className="flex items-center gap-1 text-slate-300">
                    <User className="h-3 w-3 text-slate-400" />
                    <span>Posted by Leader</span>
                  </div>
                  {ann.branch_id && (
                    <span className="font-mono uppercase text-slate-400">Sinza Campus</span>
                  )}
                </div>
              </div>
            );
          })
        ) : (
          <div className="col-span-2 flex flex-col items-center justify-center py-20 text-center select-none border border-dashed border-border/40 rounded-2xl bg-card/10">
            <Megaphone className="h-10 w-10 text-muted-foreground mb-3 opacity-40" />
            <h3 className="text-sm font-bold text-primary-foreground font-display">No Announcements Active</h3>
            <p className="text-xs text-muted-foreground mt-1 max-w-xs leading-normal">
              There are currently no active bulletins published for your campus.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
