"use client";

import { useAnnouncements } from "@/features/notifications";
import { Megaphone, ArrowLeft, Check, Lock, Archive, Play, Edit2 } from "lucide-react";
import Link from "next/link";
import { useAppPermissions } from "@/hooks/use-app-permissions";
import { useBranches } from "@/features/settings";
import { cn } from "@/lib/utils";

export default function AnnouncementsHistoryPage() {
  const { announcements: permissions } = useAppPermissions();
  const { announcements, publishAnnouncement, archiveAnnouncement } = useAnnouncements();
  const { branches } = useBranches();

  // Guard: Super Admin, Church Admin, Pastor holding announcements:manage
  if (!permissions.canManage) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] text-center p-6 select-none">
        <div className="rounded-2xl border border-border/40 bg-card/40 p-8 max-w-md backdrop-blur-glass shadow-glass">
          <Lock className="h-10 w-10 text-rose-400 mx-auto mb-4" />
          <h3 className="text-base font-bold text-primary-foreground font-display">Access Restricted</h3>
          <p className="text-xs text-muted-foreground mt-2">
            You do not have the required permissions to access the announcements history manager.
          </p>
        </div>
      </div>
    );
  }

  const getBranchName = (branchId: string | null) => {
    if (!branchId) return "Global";
    return branches.find((b) => b.id === branchId)?.branch_name || "Unknown Branch";
  };

  return (
    <div className="p-6 max-w-6xl mx-auto space-y-6">
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
            Announcements History Board
          </h1>
          <p className="text-xs text-muted-foreground mt-0.5">
            Manage your drafts, publish scheduled bulletins, and archive expired notices.
          </p>
        </div>
      </div>

      {/* Table grid */}
      <div className="rounded-2xl border border-border/40 bg-card/30 backdrop-blur-glass overflow-hidden shadow-glass">
        {announcements.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full border-collapse text-left text-xs">
              <thead>
                <tr className="border-b border-border/40 bg-slate-900/40 text-muted-foreground font-semibold">
                  <th className="p-4">Title / Content</th>
                  <th className="p-4">Audience</th>
                  <th className="p-4">Campus</th>
                  <th className="p-4">Priority</th>
                  <th className="p-4">Status</th>
                  <th className="p-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody>
                {announcements.map((ann) => {
                  const createdDate = new Date(ann.created_at).toLocaleDateString();
                  return (
                    <tr
                      key={ann.id}
                      className="border-b border-border/30 hover:bg-slate-900/10 transition-colors"
                    >
                      {/* Title & snippet */}
                      <td className="p-4 max-w-xs sm:max-w-sm">
                        <div className="font-semibold text-primary-foreground">{ann.title}</div>
                        <p className="text-[10px] text-muted-foreground mt-0.5 truncate leading-relaxed">
                          {ann.message}
                        </p>
                        <span className="text-[9px] text-slate-500 mt-1 block">Created on {createdDate}</span>
                      </td>

                      {/* Audience */}
                      <td className="p-4 text-slate-300">
                        {ann.audience_scope === "Custom" && ann.target_roles ? (
                          <span className="truncate max-w-[120px] inline-block font-mono text-[9px]">
                            Roles: {ann.target_roles.join(", ")}
                          </span>
                        ) : (
                          ann.audience_scope
                        )}
                      </td>

                      {/* Campus */}
                      <td className="p-4 text-slate-300">
                        {getBranchName(ann.branch_id)}
                      </td>

                      {/* Priority */}
                      <td className="p-4">
                        <span
                          className={cn(
                            "rounded px-2 py-0.5 text-[9px] font-semibold",
                            ann.priority === "Urgent" && "bg-rose-500/10 text-rose-400 border border-rose-500/20",
                            ann.priority === "High" && "bg-amber-500/10 text-amber-400 border border-amber-500/20",
                            ann.priority === "Normal" && "bg-slate-500/10 text-slate-400 border border-border/20"
                          )}
                        >
                          {ann.priority}
                        </span>
                      </td>

                      {/* Status */}
                      <td className="p-4">
                        <span
                          className={cn(
                            "inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[9px] font-semibold border",
                            ann.status === "Published" && "bg-emerald-500/10 text-emerald-400 border-emerald-500/20",
                            ann.status === "Scheduled" && "bg-blue-500/10 text-blue-400 border-blue-500/20",
                            ann.status === "Draft" && "bg-amber-500/10 text-amber-400 border-amber-500/20",
                            ann.status === "Archived" && "bg-slate-500/10 text-slate-400 border-slate-500/20"
                          )}
                        >
                          <span
                            className={cn(
                              "h-1 w-1 rounded-full",
                              ann.status === "Published" && "bg-emerald-400",
                              ann.status === "Scheduled" && "bg-blue-400",
                              ann.status === "Draft" && "bg-amber-400",
                              ann.status === "Archived" && "bg-slate-400"
                            )}
                          />
                          {ann.status}
                        </span>
                      </td>

                      {/* Actions */}
                      <td className="p-4 text-right space-x-1 shrink-0 whitespace-nowrap">
                        {/* Publish immediately */}
                        {ann.status !== "Published" && ann.status !== "Archived" && (
                          <button
                            type="button"
                            onClick={() => publishAnnouncement(ann.id)}
                            className="inline-flex h-7 items-center gap-0.5 rounded-lg bg-emerald-500/10 px-2 text-[10px] font-semibold text-emerald-400 border border-emerald-500/20 hover:bg-emerald-500/20 transition-all"
                          >
                            <Play className="h-3 w-3" />
                            <span>Publish</span>
                          </button>
                        )}

                        {/* Archive/Decline */}
                        {ann.status !== "Archived" && (
                          <button
                            type="button"
                            onClick={() => archiveAnnouncement(ann.id)}
                            className="inline-flex h-7 items-center gap-0.5 rounded-lg bg-slate-800 px-2 text-[10px] font-semibold text-muted-foreground border border-border/40 hover:text-rose-400 hover:bg-rose-500/10 hover:border-rose-500/20 transition-all"
                          >
                            <Archive className="h-3 w-3" />
                            <span>Archive</span>
                          </button>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="p-8 text-center text-xs text-muted-foreground select-none">
            No bulletins created in the system logs.
          </div>
        )}
      </div>
    </div>
  );
}
