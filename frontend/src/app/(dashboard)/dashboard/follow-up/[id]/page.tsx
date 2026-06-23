"use client";

import { useParams } from "next/navigation";
import Link from "next/link";
import { useState } from "react";
import { ArrowLeft, User, Phone, Mail, Calendar, Sparkles, MessageSquare, Clipboard, Lock, Info, PlusCircle, CheckCircle } from "lucide-react";
import { motion } from "framer-motion";
import {
  useFollowUp,
  ContactHistoryTimeline,
  LogInteractionModal,
  FOLLOW_UP_STATUS_COLORS,
  type InteractionType,
} from "@/features/follow-up";
import { useAppPermissions } from "@/hooks/use-app-permissions";
import { StatusBadge } from "@/components/ui/status-badge";
import { cn } from "@/lib/utils";

export default function FollowUpDetailPage() {
  const params = useParams();
  const router = useParams();
  const ticketId = params?.id as string;

  const {
    tickets,
    visitors,
    logs,
    logInteraction,
  } = useFollowUp();

  const { followUp: followUpPermissions } = useAppPermissions();
  const { canManage, canViewFollowUp } = followUpPermissions;
  const [isModalOpen, setIsModalOpen] = useState(false);

  // 1. Permission Gating
  if (!canViewFollowUp) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] text-center p-6 select-none">
        <div className="rounded-2xl border border-border/40 bg-card/40 p-8 max-w-md backdrop-blur-glass shadow-glass">
          <Lock className="h-10 w-10 text-rose-400 mx-auto mb-4" />
          <h3 className="text-base font-bold text-primary-foreground font-display">Access Restricted</h3>
          <p className="text-xs text-muted-foreground mt-2">
            You do not have permission to view visitor follow-up ticket timelines.
          </p>
          <Link
            href="/dashboard/follow-up"
            className="mt-6 inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-slate-800 text-xs font-semibold text-primary-foreground hover:bg-slate-700 transition-all"
          >
            <ArrowLeft className="h-4 w-4" />
            <span>Go Back</span>
          </Link>
        </div>
      </div>
    );
  }

  // Find ticket, visitor, and logs
  const ticket = tickets.find((t) => t.id === ticketId);
  const visitor = ticket ? visitors.find((v) => v.id === ticket.visitor_id) : null;
  const visitorLogs = visitor ? logs.filter((l) => l.visitor_id === visitor.id) : [];

  if (!ticket || !visitor) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] text-center p-6">
        <div className="rounded-2xl border border-border/40 bg-card/40 p-8 max-w-md backdrop-blur-glass shadow-glass">
          <h3 className="text-base font-bold text-primary-foreground">Ticket Not Found</h3>
          <p className="text-xs text-muted-foreground mt-2">
            The follow-up ticket with ID "{ticketId}" does not exist in local storage database.
          </p>
          <Link
            href="/dashboard/follow-up"
            className="mt-6 inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-slate-800 text-xs font-semibold text-primary-foreground hover:bg-slate-700 transition-all"
          >
            <ArrowLeft className="h-4 w-4" />
            <span>Back to Board</span>
          </Link>
        </div>
      </div>
    );
  }

  const handleLogSubmit = (type: InteractionType, notes: string, contactedBy: string) => {
    logInteraction(visitor.id, type, notes, contactedBy);
  };

  const statusColors = FOLLOW_UP_STATUS_COLORS[ticket.status];
  const isCompleted = ticket.status === "Integrated";

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-3">
          <Link
            href="/dashboard/follow-up"
            className="flex h-9 w-9 items-center justify-center rounded-xl border border-border/50 bg-card/40 hover:bg-slate-900 transition-colors text-muted-foreground hover:text-primary-foreground"
            aria-label="Back to follow-up board"
          >
            <ArrowLeft className="h-4 w-4" />
          </Link>
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <h1 className="font-display text-xl font-bold text-primary-foreground">
                {ticket.visitor_name}
              </h1>
              <StatusBadge
                label={ticket.status}
                bgClass={statusColors.bg}
                textClass={statusColors.text}
                dotClass={statusColors.dot}
              />
            </div>
            <p className="text-xs text-muted-foreground mt-0.5">
              Assigned: {ticket.assigned_pastor || "Unassigned"} • Source: {ticket.source}
            </p>
          </div>
        </div>

        {canManage && !isCompleted && (
          <button
            type="button"
            onClick={() => setIsModalOpen(true)}
            className={cn(
              "inline-flex items-center justify-center gap-1.5 rounded-xl bg-indigo-600 px-4 py-2 text-xs font-bold text-white",
              "transition-all hover:bg-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/20",
              "shadow-[0_0_12px_rgba(99,102,241,0.3)]"
            )}
          >
            <PlusCircle className="h-4 w-4" />
            <span>Log Touchpoint</span>
          </button>
        )}
      </div>

      {/* Main Grid split */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
        {/* Profile Details (Left / Spans 1) */}
        <div className="lg:col-span-1 space-y-6 select-none">
          <div className="rounded-2xl border border-border/50 bg-card/60 p-5 backdrop-blur-glass shadow-glass space-y-4">
            <div className="flex items-center gap-2 border-b border-border/20 pb-2.5">
              <User className="h-4.5 w-4.5 text-indigo-400" />
              <h3 className="font-bold text-xs text-primary-foreground uppercase tracking-wider">
                Visitor Card Info
              </h3>
            </div>

            {/* Profile fields */}
            <div className="space-y-3.5 text-xs">
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">Visitor ID:</span>
                <span className="font-mono font-bold text-slate-400">{visitor.membership_number}</span>
              </div>

              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">Gender:</span>
                <span className="font-semibold text-primary-foreground capitalize">{visitor.gender}</span>
              </div>

              <div className="flex items-center justify-between">
                <span className="text-muted-foreground font-semibold flex items-center gap-1">
                  <Phone className="h-3.5 w-3.5 text-indigo-400" />
                  <span>Phone:</span>
                </span>
                <span className="text-primary-foreground font-mono">{visitor.phone_number}</span>
              </div>

              <div className="flex items-center justify-between">
                <span className="text-muted-foreground font-semibold flex items-center gap-1">
                  <Mail className="h-3.5 w-3.5 text-indigo-400" />
                  <span>Email:</span>
                </span>
                <span className="text-primary-foreground font-mono truncate max-w-[160px]" title={visitor.email}>
                  {visitor.email}
                </span>
              </div>

              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">Date Registered:</span>
                <span className="text-primary-foreground">
                  {new Date(visitor.date_joined).toLocaleDateString()}
                </span>
              </div>
            </div>

            {/* Extended fields */}
            <div className="border-t border-border/20 pt-4 space-y-4 text-xs">
              <div>
                <span className="text-muted-foreground block mb-1">Invited By:</span>
                <span className="px-2 py-0.5 rounded bg-slate-900 border border-border/20 font-semibold text-indigo-400 inline-block">
                  {visitor.invited_by || "Walk In"}
                </span>
              </div>

              {visitor.visit_reason && (
                <div>
                  <span className="text-muted-foreground block mb-1">Reason for Visit:</span>
                  <p className="text-slate-300 italic">"{visitor.visit_reason}"</p>
                </div>
              )}

              {visitor.spiritual_background && (
                <div>
                  <span className="text-muted-foreground block mb-1">Spiritual Background:</span>
                  <span className="px-2 py-0.5 rounded bg-slate-900 border border-border/20 text-slate-400 inline-block font-semibold">
                    {visitor.spiritual_background}
                  </span>
                </div>
              )}

              {visitor.prayer_request && (
                <div>
                  <span className="text-muted-foreground block mb-1">Prayer Request:</span>
                  <p className="text-indigo-300 italic bg-indigo-950/20 p-2.5 rounded-xl border border-indigo-500/10">
                    "{visitor.prayer_request}"
                  </p>
                </div>
              )}

              {visitor.notes && (
                <div>
                  <span className="text-muted-foreground block mb-1">General Notes:</span>
                  <p className="text-slate-400 leading-relaxed bg-slate-950/20 p-2.5 rounded-xl border border-border/10">
                    {visitor.notes}
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* History Timeline (Right / Spans 2) */}
        <div className="lg:col-span-2 space-y-6">
          {isCompleted && (
            <div className="rounded-2xl border border-emerald-500/30 bg-emerald-500/5 p-4 flex items-start gap-3">
              <CheckCircle className="h-5 w-5 text-emerald-400 shrink-0 mt-0.5" />
              <div>
                <h4 className="text-xs font-bold text-emerald-400 uppercase tracking-wider">
                  Conversion Complete
                </h4>
                <p className="text-xs text-muted-foreground mt-1">
                  This visitor has successfully transitioned to an **Active Member**. Their follow-up ticket has been closed, and a profile is active in the main directory.
                </p>
              </div>
            </div>
          )}

          <ContactHistoryTimeline logs={visitorLogs} />
        </div>
      </div>

      {/* Log Interaction Modal */}
      <LogInteractionModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSubmit={handleLogSubmit}
        visitorName={ticket.visitor_name}
      />
    </div>
  );
}
