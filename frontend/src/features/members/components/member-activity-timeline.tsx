"use client";

import { motion } from "framer-motion";
import {
  Users, DollarSign, Heart, Calendar, ShieldCheck, Pencil,
} from "lucide-react";
import { cn } from "@/lib/utils";
import type { MemberActivity } from "@/features/members/types/member.types";

const TYPE_CONFIG: Record<
  MemberActivity["type"],
  { icon: React.ComponentType<{ className?: string }>; color: string; bg: string }
> = {
  joined:        { icon: Users,       color: "text-primary",    bg: "bg-primary/15" },
  event:         { icon: Calendar,    color: "text-amber-400",  bg: "bg-amber-500/15" },
  donation:      { icon: DollarSign,  color: "text-teal-400",   bg: "bg-teal-500/15" },
  prayer:        { icon: Heart,       color: "text-rose-400",   bg: "bg-rose-500/15" },
  role_change:   { icon: ShieldCheck, color: "text-blue-400",   bg: "bg-blue-500/15" },
  status_change: { icon: ShieldCheck, color: "text-muted-foreground", bg: "bg-muted/30" },
  sermon:        { icon: Pencil,      color: "text-primary",    bg: "bg-primary/10" },
};

interface MemberActivityTimelineProps {
  activities: MemberActivity[];
  className?: string;
}

export function MemberActivityTimeline({
  activities,
  className,
}: MemberActivityTimelineProps) {
  return (
    <div
      className={cn(
        "rounded-2xl border border-border/50 bg-card/60 p-5",
        "backdrop-blur-[16px] shadow-glass",
        className,
      )}
    >
      <h3 className="text-sm font-semibold text-primary-foreground">Activity Timeline</h3>

      <ol className="mt-4 relative" aria-label="Member activity timeline">
        {/* Vertical line */}
        <div
          className="absolute left-3.5 top-0 h-full w-px bg-border/40"
          aria-hidden="true"
        />

        {activities.map((activity, i) => {
          const config = TYPE_CONFIG[activity.type];
          const Icon = config.icon;

          return (
            <motion.li
              key={activity.id}
              initial={{ opacity: 0, x: -8 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.3, delay: i * 0.06 }}
              className="relative flex gap-4 pb-6 last:pb-0"
            >
              {/* Icon dot */}
              <div
                className={cn(
                  "relative z-10 flex h-7 w-7 shrink-0 items-center justify-center rounded-full",
                  config.bg,
                )}
                aria-hidden="true"
              >
                <Icon className={cn("h-3.5 w-3.5", config.color)} />
              </div>

              {/* Content */}
              <div className="min-w-0 flex-1 pt-0.5">
                <p className="text-sm text-primary-foreground/90 leading-snug">
                  {activity.description}
                </p>
                <time
                  dateTime={activity.timestamp}
                  className="mt-1 block text-xs text-muted-foreground"
                >
                  {new Date(activity.timestamp).toLocaleDateString("en-KE", {
                    day: "numeric",
                    month: "short",
                    year: "numeric",
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
                </time>
              </div>
            </motion.li>
          );
        })}
      </ol>

      {activities.length === 0 && (
        <p className="mt-4 text-center text-sm text-muted-foreground">
          No activity recorded yet.
        </p>
      )}
    </div>
  );
}
