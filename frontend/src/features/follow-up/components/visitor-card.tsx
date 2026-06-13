"use client";

import Link from "next/link";
import { Phone, Mail, Calendar, ArrowRight, UserPlus, ShieldAlert, Award } from "lucide-react";
import { motion } from "framer-motion";
import type { FollowUpTicket, FollowUpStatus } from "../types/follow-up.types";
import { FOLLOW_UP_STATUSES, INVITED_BY_OPTIONS } from "../types/follow-up.types";
import { cn } from "@/lib/utils";

interface VisitorCardProps {
  ticket: FollowUpTicket;
  onMoveStatus: (ticketId: string, nextStatus: FollowUpStatus) => void;
  onTransitionMember: (ticketId: string) => void;
  canManage: boolean;
}

export function VisitorCard({
  ticket,
  onMoveStatus,
  onTransitionMember,
  canManage,
}: VisitorCardProps) {
  const isCompleted = ticket.status === "Active Member";

  const handleStatusClick = (next: FollowUpStatus) => {
    if (next === "Active Member") {
      onTransitionMember(ticket.id);
    } else {
      onMoveStatus(ticket.id, next);
    }
  };

  const getSourceIcon = (src: FollowUpTicket["source"]) => {
    switch (src) {
      case "Attendance Absentee":
        return <ShieldAlert className="h-3.5 w-3.5 text-rose-400" />;
      case "Attendance Visitor Scan":
        return <Award className="h-3.5 w-3.5 text-emerald-400" />;
      default:
        return <UserPlus className="h-3.5 w-3.5 text-indigo-400" />;
    }
  };

  return (
    <motion.div
      layout
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.95 }}
      className="rounded-xl border border-border/30 bg-slate-950/30 p-4 space-y-3.5 shadow-glass backdrop-blur-sm hover:border-indigo-500/20 transition-all group"
    >
      {/* Header Info */}
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <Link
            href={`/dashboard/follow-up/${ticket.id}`}
            className="font-bold text-sm text-primary-foreground hover:text-indigo-400 transition-colors truncate block"
          >
            {ticket.visitor_name}
          </Link>
          <div className="flex items-center gap-1.5 mt-1">
            {getSourceIcon(ticket.source)}
            <span className="text-[10px] text-muted-foreground uppercase tracking-wider font-semibold">
              {ticket.source}
            </span>
          </div>
        </div>
      </div>

      {/* Description / Summary Notes */}
      <p className="text-xs text-muted-foreground line-clamp-2 italic leading-relaxed">
        "{ticket.notes || "No additional follow-up notes."}"
      </p>

      {/* Last Updated Timestamp */}
      <div className="flex items-center gap-1 text-[10px] text-muted-foreground border-t border-border/10 pt-2.5">
        <Calendar className="h-3 w-3" />
        <span>
          Updated: {new Date(ticket.updated_at).toLocaleDateString("en-US", {
            month: "short",
            day: "numeric",
            hour: "2-digit",
            minute: "2-digit",
          })}
        </span>
      </div>

      {/* Action Buttons to Transition Status */}
      {canManage && !isCompleted && (
        <div className="pt-1.5 space-y-1.5">
          <p className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground select-none">
            Advance Step:
          </p>
          <div className="grid grid-cols-2 gap-1.5">
            {FOLLOW_UP_STATUSES.filter((st) => st !== ticket.status).map((st) => (
              <button
                key={st}
                type="button"
                onClick={() => handleStatusClick(st)}
                className={cn(
                  "rounded-lg py-1 px-2 text-[10px] font-semibold text-center border transition-all truncate",
                  st === "Active Member"
                    ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/20 hover:bg-emerald-500 hover:text-white"
                    : "bg-slate-900/60 text-slate-400 border-border/30 hover:bg-slate-800 hover:text-primary-foreground"
                )}
                aria-label={`Advance ${ticket.visitor_name} to ${st}`}
              >
                {st === "Active Member" ? "Make Member" : st}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Link to logs timeline */}
      <div className="flex justify-end pt-1">
        <Link
          href={`/dashboard/follow-up/${ticket.id}`}
          className="flex items-center gap-1 text-[10px] font-bold text-indigo-400 hover:text-indigo-300 transition-colors uppercase tracking-wider"
          aria-label={`View follow-up timeline logs for ${ticket.visitor_name}`}
        >
          <span>Timeline & Logs</span>
          <ArrowRight className="h-3 w-3 group-hover:translate-x-0.5 transition-transform" />
        </Link>
      </div>
    </motion.div>
  );
}
