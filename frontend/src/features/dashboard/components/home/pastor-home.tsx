"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import { ArrowRight, BookOpen, Radio, CheckCircle2 } from "lucide-react";
import { KpiCard } from "@/features/dashboard/components/widgets/kpi-card";
import { QuickActionCard } from "@/features/dashboard/components/widgets/quick-action-card";
import { ActivityFeed } from "@/features/dashboard/components/widgets/activity-feed";
import { SectionHeader } from "@/features/dashboard/components/widgets/section-header";
import {
  pastorKpis,
  pastorQuickActions,
  pastorActivity,
  scriptureOfTheDay,
} from "@/features/dashboard/data/mock-dashboard-data";
import { useAuth } from "@/hooks/use-auth";

const upcomingSermons = [
  { id: 1, title: "The Grace of God", date: "Sun, Jun 15", speaker: "Pastor David", status: "Draft" },
  { id: 2, title: "Faith Over Fear", date: "Sun, Jun 22", speaker: "Pastor David", status: "Draft" },
  { id: 3, title: "Walking in Purpose", date: "Sun, Jun 29", speaker: "Pastor David", status: "Planned" },
];

const pendingTestimonies = [
  { id: 1, author: "Grace W.", excerpt: "God's provision in my business journey...", submitted: "2 hours ago" },
  { id: 2, author: "James M.", excerpt: "Healed from a chronic illness after prayer...", submitted: "5 hours ago" },
  { id: 3, author: "Mary N.", excerpt: "Breakthrough in my career after months of...", submitted: "Yesterday" },
];

export function PastorHome() {
  const { user } = useAuth();
  const firstName = user?.first_name ?? "Pastor";

  return (
    <div className="space-y-8">
      {/* Welcome */}
      <motion.div
        initial={{ opacity: 0, y: -8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.35 }}
      >
        <h1 className="font-display text-2xl font-bold text-primary-foreground md:text-3xl">
          Grace and peace,{" "}
          <span className="bg-gradient-to-r from-primary to-blue-400 bg-clip-text text-transparent">
            Pastor {firstName}
          </span>
        </h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Lead your congregation — sermons, prayer, testimonies, and livestreams.
        </p>
      </motion.div>

      {/* Today's Scripture — Feature Card */}
      <motion.section
        initial={{ opacity: 0, scale: 0.98 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.4, delay: 0.05 }}
        aria-label="Today's scripture"
        className="relative overflow-hidden rounded-2xl border border-primary/20 bg-card/60 p-6 backdrop-blur-[16px] shadow-glass"
      >
        {/* Decorative glow */}
        <div
          className="pointer-events-none absolute right-0 top-0 h-48 w-48 rounded-full opacity-20"
          aria-hidden="true"
          style={{
            background: "radial-gradient(circle, rgba(139,92,246,0.6) 0%, transparent 70%)",
            transform: "translate(25%, -25%)",
          }}
        />
        <p className="text-xs font-semibold uppercase tracking-widest text-primary">
          Today's Scripture
        </p>
        <blockquote className="mt-3 text-lg font-medium leading-relaxed text-primary-foreground md:text-xl">
          "{scriptureOfTheDay.verse}"
        </blockquote>
        <footer className="mt-3 text-sm font-semibold text-primary">
          — {scriptureOfTheDay.reference}
        </footer>
        <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
          {scriptureOfTheDay.reflection}
        </p>
        <Link
          href="/dashboard/scripture"
          className="mt-4 inline-flex items-center gap-1.5 text-xs font-medium text-primary hover:underline"
          aria-label="Manage today's scripture"
        >
          Manage Scripture <ArrowRight className="h-3 w-3" aria-hidden="true" />
        </Link>
      </motion.section>

      {/* KPIs */}
      <section aria-label="Ministry metrics">
        <SectionHeader title="Ministry Overview" delay={0.1} />
        <div className="mt-4 grid grid-cols-2 gap-4 sm:grid-cols-4">
          {pastorKpis.map((stat, i) => (
            <KpiCard key={stat.id} stat={stat} index={i} />
          ))}
        </div>
      </section>

      {/* Quick Actions + Prayer Feed */}
      <div className="grid gap-6 lg:grid-cols-3">
        <section aria-label="Quick actions">
          <SectionHeader title="Quick Actions" delay={0.15} />
          <div className="mt-4 grid gap-3">
            {pastorQuickActions.map((action, i) => (
              <QuickActionCard key={action.id} action={action} index={i} />
            ))}
          </div>
        </section>

        <section aria-label="Recent prayer and ministry activity" className="lg:col-span-2">
          <SectionHeader
            title="Prayer & Ministry Activity"
            action={
              <Link
                href="/dashboard/prayer"
                className="flex items-center gap-1 text-xs text-primary hover:underline"
              >
                View prayer wall <ArrowRight className="h-3 w-3" aria-hidden="true" />
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
            <ActivityFeed items={pastorActivity} />
          </motion.div>
        </section>
      </div>

      {/* Upcoming Sermons + Pending Testimonies */}
      <div className="grid gap-6 lg:grid-cols-2">
        {/* Upcoming Sermons */}
        <section aria-label="Upcoming sermons">
          <SectionHeader
            title="Upcoming Sermons"
            action={
              <Link
                href="/dashboard/sermons"
                className="flex items-center gap-1 text-xs text-primary hover:underline"
              >
                View all <ArrowRight className="h-3 w-3" aria-hidden="true" />
              </Link>
            }
            delay={0.2}
          />
          <motion.ul
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.3 }}
            className="mt-4 space-y-3"
          >
            {upcomingSermons.map((sermon, i) => (
              <motion.li
                key={sermon.id}
                initial={{ opacity: 0, x: -8 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.3, delay: 0.35 + i * 0.05 }}
                className="flex items-center gap-4 rounded-xl border border-border/50 bg-card/60 px-4 py-3 backdrop-blur-[16px]"
              >
                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-primary/15">
                  <BookOpen className="h-4 w-4 text-primary" aria-hidden="true" />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-semibold text-primary-foreground">
                    {sermon.title}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {sermon.date} • {sermon.speaker}
                  </p>
                </div>
                <span className="shrink-0 rounded-full bg-amber-500/15 px-2 py-0.5 text-xs font-medium text-amber-400">
                  {sermon.status}
                </span>
              </motion.li>
            ))}
          </motion.ul>
        </section>

        {/* Pending Testimonies */}
        <section aria-label="Testimonies pending approval">
          <SectionHeader
            title="Pending Testimonies"
            description="Awaiting your approval"
            action={
              <Link
                href="/dashboard/testimonies"
                className="flex items-center gap-1 text-xs text-primary hover:underline"
              >
                Review all <ArrowRight className="h-3 w-3" aria-hidden="true" />
              </Link>
            }
            delay={0.2}
          />
          <motion.ul
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.3 }}
            className="mt-4 space-y-3"
          >
            {pendingTestimonies.map((testimony, i) => (
              <motion.li
                key={testimony.id}
                initial={{ opacity: 0, x: 8 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.3, delay: 0.35 + i * 0.05 }}
                className="rounded-xl border border-border/50 bg-card/60 px-4 py-3 backdrop-blur-[16px]"
              >
                <div className="flex items-start justify-between gap-2">
                  <p className="text-sm font-semibold text-primary-foreground">
                    {testimony.author}
                  </p>
                  <span className="shrink-0 text-xs text-muted-foreground">
                    {testimony.submitted}
                  </span>
                </div>
                <p className="mt-1 line-clamp-2 text-xs text-muted-foreground">
                  {testimony.excerpt}
                </p>
                <div className="mt-2 flex gap-2">
                  <button
                    type="button"
                    className="flex items-center gap-1 rounded-lg bg-teal-500/15 px-2 py-1 text-xs font-medium text-teal-400 transition-colors hover:bg-teal-500/25"
                    aria-label={`Approve testimony from ${testimony.author}`}
                  >
                    <CheckCircle2 className="h-3 w-3" aria-hidden="true" />
                    Approve
                  </button>
                  <Link
                    href={`/dashboard/testimonies`}
                    className="rounded-lg border border-border/50 px-2 py-1 text-xs text-muted-foreground transition-colors hover:bg-card"
                    aria-label={`Read full testimony from ${testimony.author}`}
                  >
                    Read full
                  </Link>
                </div>
              </motion.li>
            ))}
          </motion.ul>
        </section>
      </div>

      {/* Livestream Status Banner */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.4, delay: 0.5 }}
        className="flex items-center justify-between gap-4 rounded-xl border border-border/50 bg-card/60 px-5 py-4 backdrop-blur-[16px]"
        role="status"
        aria-label="Livestream status"
      >
        <div className="flex items-center gap-3">
          <div className="relative flex h-3 w-3" aria-hidden="true">
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-red-400 opacity-75" />
            <span className="relative inline-flex h-3 w-3 rounded-full bg-red-500" />
          </div>
          <div>
            <p className="text-sm font-semibold text-primary-foreground">No Active Stream</p>
            <p className="text-xs text-muted-foreground">Next: Sunday Worship — Jun 15, 9:00 AM</p>
          </div>
        </div>
        <Link
          href="/dashboard/livestream"
          className="flex items-center gap-2 rounded-lg bg-primary/15 px-3 py-2 text-xs font-medium text-primary transition-all hover:bg-primary/25 hover:shadow-neon"
          aria-label="Go to livestream controls"
        >
          <Radio className="h-3.5 w-3.5" aria-hidden="true" />
          Manage Stream
        </Link>
      </motion.div>
    </div>
  );
}
