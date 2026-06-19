"use client";

import { useNotificationChannels } from "@/features/notifications";
import { Mail, ArrowLeft, Check, Lock, X, ToggleLeft, ToggleRight } from "lucide-react";
import Link from "next/link";
import { useAppPermissions } from "@/hooks/use-app-permissions";
import { cn } from "@/lib/utils";

export default function ChannelsSettingsPage() {
  const { notifications: permissions } = useAppPermissions();
  const { channels, toggleChannelStatus } = useNotificationChannels();

  // Guard: Only Super Admin and Church Admin can manage channels
  if (!permissions.canManage) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] text-center p-6 select-none">
        <div className="rounded-2xl border border-border/40 bg-card/40 p-8 max-w-md backdrop-blur-glass shadow-glass">
          <Lock className="h-10 w-10 text-rose-400 mx-auto mb-4" />
          <h3 className="text-base font-bold text-primary-foreground font-display">Access Restricted</h3>
          <p className="text-xs text-muted-foreground mt-2">
            You do not have the required permissions to view or manage communication channels.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 max-w-4xl mx-auto space-y-8">
      {/* Header */}
      <div className="flex items-center gap-3 border-b border-border/30 pb-4">
        <Link
          href="/dashboard/settings"
          className="flex h-9 w-9 items-center justify-center rounded-xl border border-border/50 bg-card/40 hover:bg-slate-900 transition-colors text-muted-foreground hover:text-primary-foreground"
          aria-label="Back to settings"
        >
          <ArrowLeft className="h-4 w-4" />
        </Link>
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-primary-foreground font-display flex items-center gap-2">
            <Mail className="h-6 w-6 text-indigo-400" />
            Communication Channels
          </h1>
          <p className="text-xs text-muted-foreground mt-0.5">
            Configure integration keys and credentials for Twilio SMS, SendGrid Emails, and FCM Push alerts.
          </p>
        </div>
      </div>

      {/* Grid List */}
      <div className="grid gap-6 sm:grid-cols-3">
        {channels.map((chan) => (
          <div
            key={chan.id}
            className="rounded-2xl border border-border/40 bg-card/60 p-6 backdrop-blur-glass shadow-glass flex flex-col justify-between hover:border-indigo-500/20 transition-all"
          >
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="rounded bg-indigo-500/10 px-2.5 py-1 text-xs font-semibold text-indigo-400 border border-indigo-500/20 uppercase tracking-wider">
                  {chan.channel_type}
                </span>
                <span
                  className={cn(
                    "inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[9px] font-semibold border",
                    chan.status === "Active" ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/20" : "bg-slate-500/10 text-slate-400 border-slate-500/20"
                  )}
                >
                  {chan.status}
                </span>
              </div>

              <div>
                <h3 className="font-display text-lg font-bold text-primary-foreground leading-tight">
                  {chan.provider_name} Integration
                </h3>
                <div className="text-[10px] text-muted-foreground mt-1.5 font-mono truncate">
                  Identity: {chan.sender_identity}
                </div>
                <div className="text-[9px] text-slate-500 font-mono mt-1 select-none">
                  API Key: {chan.api_key.substring(0, 6)}******
                </div>
              </div>
            </div>

            <div className="mt-6 border-t border-border/30 pt-4 flex justify-between items-center">
              <span className="text-[10px] text-muted-foreground">Gateway status</span>
              <button
                type="button"
                onClick={() => toggleChannelStatus(chan.id)}
                className="flex items-center gap-1.5 text-xs font-semibold text-slate-300 hover:text-primary-foreground transition-all"
              >
                <span>{chan.status === "Active" ? "Deactivate" : "Activate"}</span>
                {chan.status === "Active" ? (
                  <ToggleRight className="h-6 w-6 text-indigo-400" />
                ) : (
                  <ToggleLeft className="h-6 w-6 text-slate-600" />
                )}
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
