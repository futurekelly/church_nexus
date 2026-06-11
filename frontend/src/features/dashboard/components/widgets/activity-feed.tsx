"use client";

import { motion } from "framer-motion";
import {
  Users, DollarSign, Heart, Film, Calendar, ShieldCheck, Activity,
} from "lucide-react";
import { cn } from "@/lib/utils";
import type { ActivityItem } from "@/features/dashboard/data/mock-dashboard-data";

const TYPE_CONFIG: Record<
  ActivityItem["type"],
  { icon: React.ComponentType<{ className?: string }>; color: string; bg: string }
> = {
  member:  { icon: Users,       color: "text-primary",    bg: "bg-primary/15" },
  finance: { icon: DollarSign,  color: "text-teal-400",   bg: "bg-teal-500/15" },
  media:   { icon: Film,        color: "text-blue-400",   bg: "bg-blue-500/15" },
  prayer:  { icon: Heart,       color: "text-rose-400",   bg: "bg-rose-500/15" },
  event:   { icon: Calendar,    color: "text-amber-400",  bg: "bg-amber-500/15" },
  system:  { icon: ShieldCheck, color: "text-muted-foreground", bg: "bg-muted/30" },
};

interface ActivityFeedProps {
  items: ActivityItem[];
  className?: string;
}

export function ActivityFeed({ items, className }: ActivityFeedProps) {
  return (
    <ul
      className={cn("divide-y divide-border/30", className)}
      aria-label="Recent activity"
    >
      {items.map((item, index) => {
        const config = TYPE_CONFIG[item.type];
        const IconComponent = config.icon;

        return (
          <motion.li
            key={item.id}
            initial={{ opacity: 0, x: -12 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.3, delay: 0.1 + index * 0.05 }}
            className="flex items-start gap-3 py-3 first:pt-0 last:pb-0"
          >
            {/* Icon */}
            <div
              className={cn(
                "mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg",
                config.bg,
              )}
              aria-hidden="true"
            >
              <IconComponent className={cn("h-4 w-4", config.color)} />
            </div>

            {/* Text */}
            <div className="min-w-0 flex-1">
              <p className="text-sm text-primary-foreground/90 leading-snug">
                <span className="font-medium">{item.actor}</span>{" "}
                <span className="text-muted-foreground">{item.action}</span>{" "}
                <span className="font-medium">{item.subject}</span>
              </p>
              <p className="mt-0.5 text-xs text-muted-foreground/60">
                {item.timestamp}
              </p>
            </div>
          </motion.li>
        );
      })}
    </ul>
  );
}
