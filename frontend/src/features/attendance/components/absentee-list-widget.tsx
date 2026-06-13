"use client";

import { useState } from "react";
import { UserMinus, AlertCircle, CheckCircle, Send, HelpCircle } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import type { AttendanceRecord, FollowUpTicket } from "../types/attendance.types";
import { cn } from "@/lib/utils";

interface AbsenteeListWidgetProps {
  records: AttendanceRecord[];
  tickets: FollowUpTicket[];
  onCreateTicket: (memberId: string, memberName: string, reason: string) => void;
  canManage: boolean;
}

const COMMON_REASONS = [
  "Unexcused Absence / No-show",
  "Wellness Check / Travel",
  "Illness / Medical Issue",
  "Family / Personal Emergency",
  "Relocated / Out of Town",
];

export function AbsenteeListWidget({
  records,
  tickets,
  onCreateTicket,
  canManage,
}: AbsenteeListWidgetProps) {
  const absentees = records.filter((r) => r.status === "Absent");
  
  // Track which member is currently being flagged (active ticket creation form)
  const [activeFlagId, setActiveFlagId] = useState<string | null>(null);
  const [selectedReason, setSelectedReason] = useState<string>(COMMON_REASONS[0]);
  const [customReason, setCustomReason] = useState<string>("");

  const handleCreateTicket = (memberId: string, memberName: string) => {
    const finalReason = selectedReason === "Other" ? (customReason || "General Follow-up Required") : selectedReason;
    onCreateTicket(memberId, memberName, finalReason);
    setActiveFlagId(null);
    setSelectedReason(COMMON_REASONS[0]);
    setCustomReason("");
  };

  return (
    <div className="rounded-2xl border border-border/50 bg-card/60 p-5 backdrop-blur-glass shadow-glass flex flex-col h-full">
      <div className="border-b border-border/40 pb-3 mb-4">
        <h3 className="text-sm font-semibold text-primary-foreground flex items-center gap-2">
          <UserMinus className="h-4 w-4 text-rose-400" />
          <span>Absentee Roster ({absentees.length})</span>
        </h3>
        <p className="text-xs text-muted-foreground mt-0.5">
          Follow up with members who missed this session
        </p>
      </div>

      <div className="flex-1 overflow-y-auto max-h-[350px] pr-1 space-y-3">
        {absentees.length > 0 ? (
          absentees.map((absentee) => {
            // Check if follow-up ticket already exists for this member
            const ticket = tickets.find((t) => t.member_id === absentee.member_id);
            const isFlagging = activeFlagId === absentee.member_id;

            return (
              <div
                key={absentee.id}
                className={cn(
                  "rounded-xl border border-border/30 bg-slate-950/20 p-3 transition-all",
                  isFlagging && "border-indigo-500/40 bg-indigo-500/5"
                )}
              >
                <div className="flex items-center justify-between gap-3 text-xs">
                  <div className="min-w-0 flex-1">
                    <p className="font-semibold text-primary-foreground truncate">
                      {absentee.member_name}
                    </p>
                    <p className="text-[10px] text-muted-foreground mt-0.5">
                      No: {absentee.membership_number} • {absentee.gender}
                    </p>
                  </div>

                  {ticket ? (
                    <span className="flex items-center gap-1 text-[10px] font-bold text-emerald-400 bg-emerald-500/10 px-2 py-1 rounded-full border border-emerald-500/20">
                      <CheckCircle className="h-3 w-3" />
                      <span>Ticket Created</span>
                    </span>
                  ) : canManage ? (
                    !isFlagging ? (
                      <button
                        type="button"
                        onClick={() => {
                          setActiveFlagId(absentee.member_id);
                          setSelectedReason(COMMON_REASONS[0]);
                          setCustomReason("");
                        }}
                        className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-indigo-500/10 hover:bg-indigo-500 text-indigo-400 hover:text-white border border-indigo-500/20 transition-all font-semibold"
                        aria-label={`Flag ${absentee.member_name} for follow-up`}
                      >
                        <AlertCircle className="h-3.5 w-3.5" />
                        <span>Flag</span>
                      </button>
                    ) : (
                      <button
                        type="button"
                        onClick={() => setActiveFlagId(null)}
                        className="px-2 py-1 text-muted-foreground hover:text-primary-foreground font-semibold"
                      >
                        Cancel
                      </button>
                    )
                  ) : (
                    <span className="flex items-center gap-1 text-[10px] font-semibold text-slate-500 bg-slate-800/20 px-2 py-1 rounded-full border border-border/20">
                      <HelpCircle className="h-3 w-3" />
                      <span>Absent</span>
                    </span>
                  )}
                </div>

                {/* Inline follow-up ticket generation form */}
                <AnimatePresence>
                  {isFlagging && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: "auto", opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      className="overflow-hidden mt-3 pt-3 border-t border-border/20 space-y-2.5"
                    >
                      <div>
                        <label className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground block mb-1">
                          Reason for Follow-up
                        </label>
                        <select
                          value={selectedReason}
                          onChange={(e) => setSelectedReason(e.target.value)}
                          className="w-full bg-slate-950/80 border border-border/40 rounded-lg p-1.5 text-xs text-primary-foreground focus:outline-none focus:border-indigo-500"
                        >
                          {COMMON_REASONS.map((r) => (
                            <option key={r} value={r}>
                              {r}
                            </option>
                          ))}
                          <option value="Other">Other / Custom Reason...</option>
                        </select>
                      </div>

                      {selectedReason === "Other" && (
                        <div>
                          <input
                            type="text"
                            placeholder="Enter custom reason..."
                            value={customReason}
                            onChange={(e) => setCustomReason(e.target.value)}
                            className="w-full bg-slate-950/80 border border-border/40 rounded-lg p-1.5 text-xs text-primary-foreground focus:outline-none focus:border-indigo-500"
                            maxLength={80}
                          />
                        </div>
                      )}

                      <button
                        type="button"
                        onClick={() => handleCreateTicket(absentee.member_id, absentee.member_name)}
                        className="w-full flex items-center justify-center gap-1 px-3 py-1.5 bg-indigo-500 text-white rounded-lg text-xs font-bold hover:brightness-110 shadow-neon"
                      >
                        <Send className="h-3.5 w-3.5" />
                        <span>Send Ticket to Follow-Up</span>
                      </button>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            );
          })
        ) : (
          <div className="h-full flex items-center justify-center text-center text-xs text-slate-500 py-12">
            No absentees to display.
          </div>
        )}
      </div>
    </div>
  );
}
