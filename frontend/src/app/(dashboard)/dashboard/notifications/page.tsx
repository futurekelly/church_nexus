"use client";

import { useNotifications } from "@/features/notifications";
import { Mail, CheckCircle, Trash2, ArrowRight, Eye, Calendar, ShieldAlert } from "lucide-react";
import { useRouter } from "next/navigation";
import { cn } from "@/lib/utils";

export default function PersonalNotificationsPage() {
  const router = useRouter();
  const { notifications, markAsRead, archiveNotification, markAllAsRead, clearAllNotifications } = useNotifications();

  const handleActionClick = (id: string, actionUrl?: string) => {
    markAsRead(id);
    if (actionUrl) {
      router.push(actionUrl);
    }
  };

  const getPriorityStyle = (priority: string) => {
    switch (priority) {
      case "Critical":
        return "bg-rose-500/10 text-rose-400 border border-rose-500/25";
      case "High":
        return "bg-amber-500/10 text-amber-400 border border-amber-500/25";
      case "Medium":
        return "bg-blue-500/10 text-blue-400 border border-blue-500/25";
      default:
        return "bg-slate-500/10 text-slate-400 border border-border/20";
    }
  };

  return (
    <div className="p-6 max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between border-b border-border/30 pb-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-primary-foreground font-display flex items-center gap-2">
            <Mail className="h-6 w-6 text-indigo-400" />
            Notifications Inbox
          </h1>
          <p className="text-xs text-muted-foreground mt-0.5">
            Read important direct updates, donation receipts, and prayer requests alerts targeted to you.
          </p>
        </div>

        {notifications.length > 0 && (
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={markAllAsRead}
              className="inline-flex items-center gap-1 rounded-lg border border-border/50 bg-card/60 px-3 py-1.5 text-xs text-slate-300 hover:text-primary-foreground hover:bg-slate-900 transition-colors"
            >
              <CheckCircle className="h-3.5 w-3.5" />
              <span>Mark all read</span>
            </button>
            <button
              type="button"
              onClick={clearAllNotifications}
              className="inline-flex items-center gap-1 rounded-lg border border-rose-500/20 bg-rose-500/5 px-3 py-1.5 text-xs text-rose-400 hover:text-rose-300 hover:bg-rose-500/10 transition-colors"
            >
              <Trash2 className="h-3.5 w-3.5" />
              <span>Clear inbox</span>
            </button>
          </div>
        )}
      </div>

      {/* Inbox List */}
      <div className="space-y-3">
        {notifications.length > 0 ? (
          notifications.map((notif) => {
            const formattedDate = notif.delivered_at
              ? new Date(notif.delivered_at).toLocaleDateString("en-US", {
                  month: "short",
                  day: "numeric",
                  hour: "2-digit",
                  minute: "2-digit"
                })
              : "N/A";

            return (
              <div
                key={notif.id}
                className={cn(
                  "relative rounded-2xl border bg-card/60 p-5 backdrop-blur-glass transition-all shadow-glass flex items-start gap-4 hover:border-indigo-500/20",
                  !notif.read ? "border-indigo-500/30 bg-gradient-to-br from-indigo-500/5 to-transparent" : "border-border/40"
                )}
              >
                {/* Unread indicator */}
                {!notif.read && (
                  <span className="absolute left-2.5 top-1/2 -translate-y-1/2 h-2 w-2 rounded-full bg-indigo-400" />
                )}

                {/* Priority / Channel icon info */}
                <div className="space-y-2 shrink-0 flex flex-col items-center">
                  <span className={cn("rounded px-2 py-0.5 text-[8px] font-bold uppercase", getPriorityStyle(notif.priority))}>
                    {notif.priority}
                  </span>
                  <span className="text-[9px] font-semibold text-slate-500 uppercase tracking-wider">
                    {notif.delivery_channel}
                  </span>
                </div>

                {/* Message Body */}
                <div className="flex-1 space-y-1 pr-6">
                  <h3 className={cn("text-xs font-bold leading-snug", !notif.read ? "text-primary-foreground" : "text-slate-300")}>
                    {notif.title}
                  </h3>
                  <p className="text-xs text-muted-foreground leading-normal whitespace-pre-line">
                    {notif.message}
                  </p>
                  
                  {/* Footer date & read tracking */}
                  <div className="pt-2 flex items-center gap-4 text-[10px] text-slate-500 font-medium">
                    <span className="flex items-center gap-1">
                      <Calendar className="h-3 w-3" />
                      {formattedDate}
                    </span>
                    {notif.read && notif.read_at && (
                      <span>
                        Read at {new Date(notif.read_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </span>
                    )}
                  </div>
                </div>

                {/* Actions */}
                <div className="flex flex-col gap-2 shrink-0">
                  {notif.action_url && (
                    <button
                      type="button"
                      onClick={() => handleActionClick(notif.id, notif.action_url)}
                      className="inline-flex h-8 items-center gap-1 rounded-lg bg-indigo-500 px-3 text-[10px] font-semibold text-white hover:bg-indigo-600 transition-colors"
                    >
                      <span>Action</span>
                      <ArrowRight className="h-3.5 w-3.5" />
                    </button>
                  )}

                  {!notif.read && !notif.action_url && (
                    <button
                      type="button"
                      onClick={() => markAsRead(notif.id)}
                      className="inline-flex h-8 items-center gap-1 rounded-lg border border-border/50 bg-card/60 px-3 text-[10px] font-semibold text-slate-300 hover:text-primary-foreground transition-colors"
                    >
                      <Eye className="h-3.5 w-3.5" />
                      <span>Read</span>
                    </button>
                  )}

                  <button
                    type="button"
                    onClick={() => archiveNotification(notif.id)}
                    className="inline-flex h-8 w-8 items-center justify-center rounded-lg bg-slate-800 text-slate-400 border border-border/40 hover:text-rose-400 hover:bg-rose-500/10 hover:border-rose-500/20 transition-all"
                    aria-label="Archive notification"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </button>
                </div>
              </div>
            );
          })
        ) : (
          <div className="flex flex-col items-center justify-center py-20 text-center select-none border border-dashed border-border/40 rounded-2xl bg-card/10">
            <Mail className="h-10 w-10 text-muted-foreground mb-3 opacity-40" />
            <h3 className="text-sm font-bold text-primary-foreground font-display">Inbox is Empty</h3>
            <p className="text-xs text-muted-foreground mt-1 max-w-xs leading-normal">
              You don't have any unread targeted alerts at the moment.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
