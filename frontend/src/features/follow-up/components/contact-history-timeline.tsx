"use client";

import { Phone, Mail, Users, MapPin, Calendar } from "lucide-react";
import type { ContactHistoryLog } from "../types/follow-up.types";
import { cn } from "@/lib/utils";

interface ContactHistoryTimelineProps {
  logs: ContactHistoryLog[];
}

const interactionConfig = {
  Call: { icon: Phone, color: "text-blue-400 bg-blue-500/10 border-blue-500/20" },
  Email: { icon: Mail, color: "text-indigo-400 bg-indigo-500/10 border-indigo-500/20" },
  Meeting: { icon: Users, color: "text-amber-400 bg-amber-500/10 border-amber-500/20" },
  Visit: { icon: MapPin, color: "text-emerald-400 bg-emerald-500/10 border-emerald-500/20" },
};

export function ContactHistoryTimeline({ logs }: ContactHistoryTimelineProps) {
  // Sort logs by date descending
  const sortedLogs = [...logs].sort(
    (a, b) => new Date(b.contact_date).getTime() - new Date(a.contact_date).getTime()
  );

  return (
    <div className="rounded-2xl border border-border/50 bg-card/60 p-5 backdrop-blur-glass shadow-glass">
      <div className="border-b border-border/20 pb-3 mb-4 select-none">
        <h3 className="text-sm font-semibold text-primary-foreground">Contact History & Touchpoints</h3>
        <p className="text-[10px] text-muted-foreground mt-0.5">Chronological log of all follow-up conversations</p>
      </div>

      <div className="relative border-l border-border/30 ml-3.5 pl-6 space-y-6 min-h-[100px]">
        {sortedLogs.length > 0 ? (
          sortedLogs.map((log) => {
            const config = interactionConfig[log.interaction_type] || interactionConfig.Call;
            const IconComponent = config.icon;

            return (
              <div key={log.id} className="relative group">
                {/* Colored node marker icon */}
                <div
                  className={cn(
                    "absolute -left-[39px] top-0.5 h-6.5 w-6.5 rounded-full flex items-center justify-center border",
                    config.color
                  )}
                  aria-hidden="true"
                >
                  <IconComponent className="h-3.5 w-3.5" />
                </div>

                {/* Log card */}
                <div className="space-y-1">
                  <div className="flex flex-wrap items-center justify-between gap-2 text-xs">
                    <span className="font-bold text-primary-foreground bg-slate-900 px-2 py-0.5 rounded border border-border/20">
                      {log.interaction_type}
                    </span>
                    <span className="text-[10px] text-muted-foreground flex items-center gap-1 font-mono">
                      <Calendar className="h-3 w-3" />
                      {new Date(log.contact_date).toLocaleDateString("en-US", {
                        month: "short",
                        day: "numeric",
                        year: "numeric",
                      })}
                    </span>
                  </div>

                  <p className="text-xs text-muted-foreground leading-relaxed italic bg-slate-950/20 p-2.5 rounded-xl border border-border/10 mt-1">
                    "{log.notes}"
                  </p>

                  <p className="text-[10px] text-indigo-400 font-semibold mt-1">
                    Logged by: <span className="text-muted-foreground font-medium">{log.contacted_by}</span>
                  </p>
                </div>
              </div>
            );
          })
        ) : (
          <div className="text-center text-xs text-slate-500 py-10 pl-0 border-none select-none">
            No contacts logged yet. Use the button to log a call or home visit.
          </div>
        )}
      </div>
    </div>
  );
}
