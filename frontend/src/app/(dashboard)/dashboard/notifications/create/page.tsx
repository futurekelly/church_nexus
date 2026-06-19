"use client";

import { useState } from "react";
import { Mail, ArrowLeft, Check, Lock, Send } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { useAppPermissions } from "@/hooks/use-app-permissions";
import { useNotifications } from "@/features/notifications";
import type { NotificationPriority, DeliveryChannelType } from "@/features/notifications";
import { cn } from "@/lib/utils";

const inputClass = cn(
  "w-full rounded-xl border border-border/50 bg-card/60 px-4 py-2.5 text-xs",
  "text-primary-foreground placeholder:text-muted-foreground/50 focus:border-indigo-500/50 focus:outline-none"
);

const labelClass = "block text-[10px] font-semibold text-muted-foreground mb-1.5 uppercase tracking-wider";

interface ComposeNotificationForm {
  user_id: string;
  title: string;
  message: string;
  priority: NotificationPriority;
  delivery_channel: DeliveryChannelType;
  action_url?: string;
  branch_id?: string;
}

export default function ComposeNotificationPage() {
  const router = useRouter();
  const { settings: permissions } = useAppPermissions();
  const { addNotification } = useNotifications();
  const [success, setSuccess] = useState(false);

  const { register, handleSubmit, reset } = useForm<ComposeNotificationForm>({
    defaultValues: {
      user_id: "m001",
      title: "",
      message: "",
      priority: "Medium",
      delivery_channel: "In-App",
      action_url: "",
      branch_id: "branch-001"
    }
  });

  // Let's use notifications permissions registry directly
  const { notifications: notifPermissions } = useAppPermissions();
  if (!notifPermissions.canCreate) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] text-center p-6 select-none">
        <div className="rounded-2xl border border-border/40 bg-card/40 p-8 max-w-md backdrop-blur-glass shadow-glass">
          <Lock className="h-10 w-10 text-rose-400 mx-auto mb-4" />
          <h3 className="text-base font-bold text-primary-foreground font-display">Access Restricted</h3>
          <p className="text-xs text-muted-foreground mt-2">
            You do not have the required permissions to compose or dispatch notifications.
          </p>
        </div>
      </div>
    );
  }

  const onSubmit = (data: ComposeNotificationForm) => {
    addNotification(
      data.user_id,
      data.title,
      data.message,
      data.priority,
      data.delivery_channel,
      data.action_url || undefined,
      data.branch_id || undefined
    );
    setSuccess(true);
    setTimeout(() => {
      setSuccess(false);
      reset();
      router.push("/dashboard/notifications");
    }, 1500);
  };

  return (
    <div className="p-6 max-w-xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center gap-3 border-b border-border/30 pb-4">
        <Link
          href="/dashboard/notifications"
          className="flex h-9 w-9 items-center justify-center rounded-xl border border-border/50 bg-card/40 hover:bg-slate-900 transition-colors text-muted-foreground hover:text-primary-foreground"
          aria-label="Back to inbox"
        >
          <ArrowLeft className="h-4 w-4" />
        </Link>
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-primary-foreground font-display flex items-center gap-2">
            <Mail className="h-6 w-6 text-indigo-400" />
            Dispatch Notification
          </h1>
          <p className="text-xs text-muted-foreground mt-0.5">
            Manually send transactional notifications, emails, or SMS dispatches to members.
          </p>
        </div>
      </div>

      <div className="rounded-2xl border border-border/40 bg-card/60 p-6 backdrop-blur-glass shadow-glass">
        {success ? (
          <div className="py-8 text-center space-y-3">
            <div className="h-10 w-10 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 rounded-full flex items-center justify-center mx-auto">
              <Check className="h-5 w-5" />
            </div>
            <h3 className="font-display text-sm font-bold text-primary-foreground">Notification Dispatched!</h3>
            <p className="text-xs text-muted-foreground leading-normal">
              The communication has been queued and sent to the recipient's logs successfully.
            </p>
          </div>
        ) : (
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            {/* Recipient */}
            <div>
              <label htmlFor="user_id" className={labelClass}>Recipient *</label>
              <select id="user_id" className={inputClass} {...register("user_id", { required: true })}>
                <option value="m001">Kelvin Mbise (Super Admin)</option>
                <option value="m002">Emmanuel Massawe (Pastor)</option>
                <option value="ldr-003">John Njoroge (Nairobi Pastor)</option>
              </select>
            </div>

            <div className="grid grid-cols-2 gap-4">
              {/* Delivery Channel */}
              <div>
                <label htmlFor="delivery_channel" className={labelClass}>Delivery Channel *</label>
                <select id="delivery_channel" className={inputClass} {...register("delivery_channel", { required: true })}>
                  <option value="In-App">In-App Notification</option>
                  <option value="Email">Email Dispatch</option>
                  <option value="SMS">SMS Message</option>
                  <option value="Push">Mobile Push</option>
                </select>
              </div>

              {/* Priority */}
              <div>
                <label htmlFor="priority" className={labelClass}>Priority Level</label>
                <select id="priority" className={inputClass} {...register("priority")}>
                  <option value="Low">Low</option>
                  <option value="Medium">Medium</option>
                  <option value="High">High</option>
                  <option value="Critical">Critical</option>
                </select>
              </div>
            </div>

            {/* Title */}
            <div>
              <label htmlFor="title" className={labelClass}>Title *</label>
              <input
                id="title"
                type="text"
                placeholder="e.g. Donation Confirmed"
                className={inputClass}
                required
                {...register("title", { required: true })}
              />
            </div>

            {/* Message Body */}
            <div>
              <label htmlFor="message" className={labelClass}>Message Content *</label>
              <textarea
                id="message"
                rows={4}
                placeholder="Write message details..."
                className={cn(inputClass, "resize-none")}
                required
                {...register("message", { required: true })}
              />
            </div>

            {/* Action URL Deep Link */}
            <div>
              <label htmlFor="action_url" className={labelClass}>Deep-Link Action URL (Optional)</label>
              <input
                id="action_url"
                type="text"
                placeholder="e.g. /dashboard/donations"
                className={inputClass}
                {...register("action_url")}
              />
            </div>

            {/* Submit */}
            <div className="flex justify-end pt-4 border-t border-border/30 gap-3">
              <button
                type="button"
                onClick={() => router.push("/dashboard/notifications")}
                className="rounded-xl border border-border/50 bg-card px-4 py-2 text-xs font-semibold text-muted-foreground hover:text-primary-foreground transition-all"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="inline-flex items-center gap-1.5 rounded-xl bg-indigo-500 px-5 py-2 text-xs font-semibold text-white hover:bg-indigo-600 transition-all shadow-neon"
              >
                <Send className="h-3.5 w-3.5" />
                <span>Send Alert</span>
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
