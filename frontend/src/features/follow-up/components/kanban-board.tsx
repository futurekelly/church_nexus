"use client";

import { AnimatePresence, motion } from "framer-motion";
import { UserCheck, PhoneCall, CalendarRange, UserCheck2 } from "lucide-react";
import type { FollowUpTicket, FollowUpStatus } from "../types/follow-up.types";
import { FOLLOW_UP_STATUSES, FOLLOW_UP_STATUS_COLORS } from "../types/follow-up.types";
import { VisitorCard } from "./visitor-card";
import { StatusBadge } from "@/components/ui/status-badge";

interface KanbanBoardProps {
  tickets: FollowUpTicket[];
  onMoveStatus: (ticketId: string, status: FollowUpStatus) => void;
  onTransitionMember: (ticketId: string) => void;
  canManage: boolean;
}

const COLUMN_ICONS: Record<FollowUpStatus, React.ReactNode> = {
  "New Visitor": <UserCheck className="h-4 w-4 text-indigo-400" />,
  "Contacted": <PhoneCall className="h-4 w-4 text-blue-400" />,
  "Scheduled Visit": <CalendarRange className="h-4 w-4 text-amber-400" />,
  "Active Member": <UserCheck2 className="h-4 w-4 text-emerald-400" />,
};

export function KanbanBoard({
  tickets,
  onMoveStatus,
  onTransitionMember,
  canManage,
}: KanbanBoardProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 items-start">
      {FOLLOW_UP_STATUSES.map((status) => {
        const colTickets = tickets.filter((t) => t.status === status);
        const colors = FOLLOW_UP_STATUS_COLORS[status];

        return (
          <div
            key={status}
            className="flex flex-col rounded-2xl border border-border/40 bg-card/40 p-4 backdrop-blur-glass shadow-glass min-h-[450px]"
            role="region"
            aria-label={`${status} column with ${colTickets.length} tickets`}
          >
            {/* Column Header */}
            <div className="flex items-center justify-between border-b border-border/20 pb-3 mb-4 select-none">
              <div className="flex items-center gap-2">
                {COLUMN_ICONS[status]}
                <h3 className="font-bold text-xs text-primary-foreground uppercase tracking-wider">
                  {status}
                </h3>
              </div>
              <StatusBadge
                label={colTickets.length.toString()}
                bgClass={colors.bg}
                textClass={colors.text}
                dotClass={colors.dot}
                size="sm"
              />
            </div>

            {/* Column Cards Pool */}
            <div className="flex-1 space-y-4 overflow-y-auto max-h-[550px] pr-0.5">
              <AnimatePresence mode="popLayout">
                {colTickets.length > 0 ? (
                  colTickets.map((ticket) => (
                    <VisitorCard
                      key={ticket.id}
                      ticket={ticket}
                      onMoveStatus={onMoveStatus}
                      onTransitionMember={onTransitionMember}
                      canManage={canManage}
                    />
                  ))
                ) : (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="h-32 rounded-xl border border-dashed border-border/20 flex items-center justify-center text-center p-4 text-[11px] text-slate-500 font-medium italic"
                  >
                    No visitors in this stage.
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>
        );
      })}
    </div>
  );
}
