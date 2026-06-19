"use client";

import { useState } from "react";
import { Users, Search } from "lucide-react";
import { cn } from "@/lib/utils";
import { MOCK_ATTENDEES } from "../data/mock-events";

interface Attendee {
  id: string;
  name: string;
  email: string;
  role: string;
  registerDate: string;
}

interface EventAttendeePreviewProps {
  registeredCount: number;
  capacity: number;
}

export function EventAttendeePreview({
  registeredCount,
  capacity,
}: EventAttendeePreviewProps) {
  const [searchQuery, setSearchQuery] = useState("");

  const filteredAttendees = (MOCK_ATTENDEES as Attendee[]).filter((a) =>
    a.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    a.role.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const occupancyRate = capacity > 0 ? Math.round((registeredCount / capacity) * 100) : 0;

  // Generate initials for avatars
  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((part) => part[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  // Avatar backgrounds
  const colors = [
    "bg-indigo-500/20 text-indigo-300 border-indigo-500/30",
    "bg-emerald-500/20 text-emerald-300 border-emerald-500/30",
    "bg-amber-500/20 text-amber-300 border-amber-500/30",
    "bg-rose-500/20 text-rose-300 border-rose-500/30",
    "bg-cyan-500/20 text-cyan-300 border-cyan-500/30",
  ];

  return (
    <div className="rounded-2xl border border-border/50 bg-card/60 p-5 backdrop-blur-[16px] shadow-glass space-y-5">
      <div className="flex items-center justify-between border-b border-border/30 pb-3">
        <h3 className="text-base font-bold text-primary-foreground flex items-center gap-2">
          <Users className="h-5 w-5 text-indigo-400" />
          Attendees ({registeredCount})
        </h3>
        <span className="text-xs font-semibold text-indigo-400 font-mono">
          {occupancyRate}% Full
        </span>
      </div>

      {/* Progress Capacity Bar */}
      <div className="space-y-1.5">
        <div className="flex items-center justify-between text-xs text-muted-foreground">
          <span>Capacity utilization</span>
          <span>
            {registeredCount} / {capacity}
          </span>
        </div>
        <div className="h-2 w-full overflow-hidden rounded-full bg-slate-800">
          <div
            className={cn(
              "h-full rounded-full transition-all duration-500",
              occupancyRate > 90
                ? "bg-rose-500 shadow-[0_0_8px_rgba(244,63,94,0.4)]"
                : occupancyRate > 70
                ? "bg-amber-500 shadow-[0_0_8px_rgba(245,158,11,0.4)]"
                : "bg-indigo-500 shadow-[0_0_8px_rgba(99,102,241,0.4)]"
            )}
            style={{ width: `${Math.min(100, occupancyRate)}%` }}
          />
        </div>
      </div>

      {/* Avatar Stacking Group */}
      <div className="flex items-center gap-3 py-2">
        <div className="flex -space-x-3 overflow-hidden">
          {(MOCK_ATTENDEES as Attendee[]).slice(0, 5).map((att, index) => (
            <div
              key={att.id}
              className={cn(
                "flex h-9 w-9 items-center justify-center rounded-full border text-xs font-bold font-mono",
                colors[index % colors.length]
              )}
              title={att.name}
            >
              {getInitials(att.name)}
            </div>
          ))}
          {registeredCount > 5 && (
            <div className="flex h-9 w-9 items-center justify-center rounded-full border border-border/50 bg-slate-900 text-xs font-bold text-muted-foreground">
              +{registeredCount - 5}
            </div>
          )}
        </div>
        <span className="text-xs text-muted-foreground">
          {registeredCount > 0
            ? `${MOCK_ATTENDEES[0].name} and ${registeredCount - 1} others registered`
            : "No attendees registered yet"}
        </span>
      </div>

      {/* Attendee search filter list */}
      <div className="space-y-3 pt-2">
        <div className="relative">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-muted-foreground" />
          <input
            type="text"
            placeholder="Search attendees..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className={cn(
              "w-full rounded-xl border border-border/50 bg-card/60 py-1.5 pl-8 pr-3 text-xs",
              "text-primary-foreground placeholder:text-muted-foreground/60 focus:outline-none focus:ring-1 focus:ring-indigo-500/50"
            )}
          />
        </div>

        <div className="max-h-[220px] overflow-y-auto space-y-2 pr-1">
          {filteredAttendees.length === 0 ? (
            <p className="text-center text-xs text-muted-foreground py-4">
              No matching attendees found.
            </p>
          ) : (
            filteredAttendees.map((att, index) => (
              <div
                key={att.id}
                className="flex items-center justify-between p-2 rounded-xl border border-border/10 bg-card/25"
              >
                <div className="flex items-center gap-2">
                  <div
                    className={cn(
                      "flex h-7 w-7 items-center justify-center rounded-full border text-[10px] font-bold font-mono",
                      colors[index % colors.length]
                    )}
                  >
                    {getInitials(att.name)}
                  </div>
                  <div>
                    <h4 className="text-xs font-semibold text-primary-foreground">
                      {att.name}
                    </h4>
                    <p className="text-[10px] text-muted-foreground">{att.role}</p>
                  </div>
                </div>
                <span className="text-[9px] text-muted-foreground font-mono">
                  Registered {att.registerDate}
                </span>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
