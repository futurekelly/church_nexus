"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import { ArrowRight, Radio, Upload, CheckCircle, Clock } from "lucide-react";
import { KpiCard } from "@/features/dashboard/components/widgets/kpi-card";
import { QuickActionCard } from "@/features/dashboard/components/widgets/quick-action-card";
import { ActivityFeed } from "@/features/dashboard/components/widgets/activity-feed";
import { SectionHeader } from "@/features/dashboard/components/widgets/section-header";
import {
  mediaTeamKpis,
  mediaTeamQuickActions,
  mediaTeamActivity,
  uploadQueueItems,
} from "@/features/dashboard/data/mock-dashboard-data";
import { useAuth } from "@/hooks/use-auth";
import { cn } from "@/lib/utils";

const recentMedia = [
  { id: 1, title: "Sunday Worship Highlights", type: "Video", views: 342, uploaded: "Today" },
  { id: 2, title: "Sermon: The Power of Prayer", type: "Video", views: 892, uploaded: "Yesterday" },
  { id: 3, title: "Baptism Ceremony Photos", type: "Gallery", views: 156, uploaded: "2 days ago" },
  { id: 4, title: "Choir Rehearsal Audio", type: "Audio", views: 88, uploaded: "3 days ago" },
];

const mediaTypeColors: Record<string, string> = {
  Video: "bg-primary/15 text-primary",
  Audio: "bg-blue-500/15 text-blue-400",
  Gallery: "bg-teal-500/15 text-teal-400",
};

export function MediaTeamHome() {
  const { user } = useAuth();
  const firstName = user?.first_name ?? "Team";

  return (
    <div className="space-y-8">
      {/* Welcome */}
      <motion.div
        initial={{ opacity: 0, y: -8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.35 }}
      >
        <h1 className="font-display text-2xl font-bold text-primary-foreground md:text-3xl">
          Media Studio,{" "}
          <span className="bg-gradient-to-r from-blue-400 to-primary bg-clip-text text-transparent">
            {firstName}
          </span>
        </h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Manage livestreams, upload media, and grow the church's digital reach.
        </p>
      </motion.div>

      {/* Livestream Status Banner */}
      <motion.section
        initial={{ opacity: 0, scale: 0.98 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.4, delay: 0.05 }}
        aria-label="Livestream status"
        className="relative overflow-hidden rounded-2xl border border-blue-500/20 bg-card/60 p-5 backdrop-blur-[16px] shadow-glass"
      >
        <div
          className="pointer-events-none absolute right-0 top-0 h-40 w-40 rounded-full opacity-20"
          aria-hidden="true"
          style={{
            background: "radial-gradient(circle, rgba(59,130,246,0.6) 0%, transparent 70%)",
            transform: "translate(25%, -25%)",
          }}
        />
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-blue-500/15">
              <Radio className="h-6 w-6 text-blue-400" aria-hidden="true" />
            </div>
            <div>
              <p className="text-xs font-semibold uppercase tracking-widest text-blue-400">
                Livestream Status
              </p>
              <p className="mt-0.5 text-lg font-bold text-primary-foreground">
                No Active Stream
              </p>
              <p className="text-sm text-muted-foreground">
                Next scheduled: Sunday Worship — Jun 15, 9:00 AM
              </p>
            </div>
          </div>
          <Link
            href="/dashboard/livestream"
            className="flex items-center gap-2 rounded-xl bg-blue-500/15 px-4 py-2.5 text-sm font-semibold text-blue-400 transition-all hover:bg-blue-500/25 hover:shadow-[0_0_20px_rgba(59,130,246,0.3)]"
            aria-label="Go to livestream controls"
          >
            <Radio className="h-4 w-4" aria-hidden="true" />
            Go Live
          </Link>
        </div>
      </motion.section>

      {/* KPIs */}
      <section aria-label="Media metrics">
        <SectionHeader title="Media Overview" delay={0.1} />
        <div className="mt-4 grid grid-cols-2 gap-4 sm:grid-cols-4">
          {mediaTeamKpis.map((stat, i) => (
            <KpiCard key={stat.id} stat={stat} index={i} />
          ))}
        </div>
      </section>

      {/* Quick Actions + Activity */}
      <div className="grid gap-6 lg:grid-cols-3">
        <section aria-label="Quick actions">
          <SectionHeader title="Quick Actions" delay={0.15} />
          <div className="mt-4 grid gap-3">
            {mediaTeamQuickActions.map((action, i) => (
              <QuickActionCard key={action.id} action={action} index={i} />
            ))}
          </div>
        </section>

        <section aria-label="Media activity" className="lg:col-span-2">
          <SectionHeader
            title="Recent Activity"
            action={
              <Link
                href="/dashboard/media"
                className="flex items-center gap-1 text-xs text-primary hover:underline"
              >
                View media <ArrowRight className="h-3 w-3" aria-hidden="true" />
              </Link>
            }
            delay={0.15}
          />
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.25 }}
            className="mt-4 rounded-2xl border border-border/50 bg-card/60 p-5 backdrop-blur-[16px] shadow-glass"
          >
            <ActivityFeed items={mediaTeamActivity} />
          </motion.div>
        </section>
      </div>

      {/* Upload Queue */}
      <section aria-label="Upload queue">
        <SectionHeader
          title="Upload Queue"
          description="Files currently processing"
          delay={0.2}
        />
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.3 }}
          className="mt-4 space-y-3"
        >
          {uploadQueueItems.map((item, i) => (
            <motion.div
              key={item.id}
              initial={{ opacity: 0, x: -8 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.3, delay: 0.35 + i * 0.06 }}
              className="rounded-xl border border-border/50 bg-card/60 p-4 backdrop-blur-[16px]"
            >
              <div className="flex items-center justify-between gap-4">
                <div className="flex min-w-0 items-center gap-3">
                  <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-blue-500/15">
                    <Upload className="h-4 w-4 text-blue-400" aria-hidden="true" />
                  </div>
                  <div className="min-w-0">
                    <p className="truncate text-sm font-medium text-primary-foreground">
                      {item.name}
                    </p>
                    <p className="text-xs text-muted-foreground">{item.size}</p>
                  </div>
                </div>
                {item.progress === 100 ? (
                  <CheckCircle
                    className="h-5 w-5 shrink-0 text-teal-400"
                    aria-label="Upload complete"
                  />
                ) : (
                  <div className="flex shrink-0 items-center gap-2">
                    <Clock className="h-4 w-4 text-amber-400" aria-hidden="true" />
                    <span className="text-xs font-mono text-amber-400">{item.progress}%</span>
                  </div>
                )}
              </div>
              {/* Progress bar */}
              <div
                className="mt-3 h-1.5 overflow-hidden rounded-full bg-muted/30"
                role="progressbar"
                aria-valuenow={item.progress}
                aria-valuemin={0}
                aria-valuemax={100}
                aria-label={`Upload progress for ${item.name}`}
              >
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${item.progress}%` }}
                  transition={{ duration: 0.8, delay: 0.4 + i * 0.1, ease: "easeOut" }}
                  className={cn(
                    "h-full rounded-full",
                    item.progress === 100 ? "bg-teal-400" : "bg-blue-400",
                  )}
                />
              </div>
            </motion.div>
          ))}
        </motion.div>
      </section>

      {/* Recent Media */}
      <section aria-label="Recent media files">
        <SectionHeader
          title="Recent Media"
          action={
            <Link
              href="/dashboard/media"
              className="flex items-center gap-1 text-xs text-primary hover:underline"
            >
              View gallery <ArrowRight className="h-3 w-3" aria-hidden="true" />
            </Link>
          }
          delay={0.2}
        />
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.35 }}
          className="mt-4 grid gap-3 sm:grid-cols-2"
        >
          {recentMedia.map((media, i) => (
            <motion.div
              key={media.id}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.3, delay: 0.4 + i * 0.05 }}
              className="flex items-center gap-3 rounded-xl border border-border/50 bg-card/60 p-4 backdrop-blur-[16px] transition-colors hover:bg-card/80"
            >
              <div className={cn(
                "flex h-9 w-9 shrink-0 items-center justify-center rounded-lg text-xs font-bold",
                mediaTypeColors[media.type] ?? "bg-muted/30 text-muted-foreground",
              )}>
                {media.type.charAt(0)}
              </div>
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-medium text-primary-foreground">
                  {media.title}
                </p>
                <p className="text-xs text-muted-foreground">
                  {media.views} views · {media.uploaded}
                </p>
              </div>
            </motion.div>
          ))}
        </motion.div>
      </section>
    </div>
  );
}
