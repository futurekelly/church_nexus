"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import {
  ArrowRight, Calendar, BookOpen, CheckCircle, Trophy,
} from "lucide-react";
import { KpiCard } from "@/features/dashboard/components/widgets/kpi-card";
import { QuickActionCard } from "@/features/dashboard/components/widgets/quick-action-card";
import { ActivityFeed } from "@/features/dashboard/components/widgets/activity-feed";
import { SectionHeader } from "@/features/dashboard/components/widgets/section-header";
import {
  memberKpis,
  memberQuickActions,
  memberActivity,
  scriptureOfTheDay,
  upcomingEvents,
} from "@/features/dashboard/data/mock-dashboard-data";
import { useAuth } from "@/hooks/use-auth";

// Phase 2 preview badges — locked
const achievementBadges = [
  { id: 1, name: "Prayer Warrior", icon: "🙏", unlocked: true, description: "Submitted 2+ prayer requests" },
  { id: 2, name: "Faithful Attendee", icon: "⛪", unlocked: true, description: "Attended 10+ services" },
  { id: 3, name: "Scripture Explorer", icon: "📖", unlocked: false, description: "Read 30 days of daily scripture" },
  { id: 4, name: "Community Helper", icon: "🤝", unlocked: false, description: "Participate in 3 community events" },
  { id: 5, name: "Giving Heart", icon: "💝", unlocked: false, description: "Made your first offering" },
  { id: 6, name: "Bible Champion", icon: "✝️", unlocked: false, description: "Complete a Bible study group" },
];

const recentSermons = [
  { id: 1, title: "Walking in Faith", speaker: "Pastor David", duration: "42 min", watched: true },
  { id: 2, title: "The Power of Prayer", speaker: "Pastor David", duration: "38 min", watched: true },
  { id: 3, title: "Grace Sufficient", speaker: "Pastor Sarah", duration: "35 min", watched: false },
];

export function MemberHome() {
  const { user } = useAuth();
  const firstName = user?.first_name ?? "Friend";

  return (
    <div className="space-y-8">
      {/* Welcome */}
      <motion.div
        initial={{ opacity: 0, y: -8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.35 }}
      >
        <h1 className="font-display text-2xl font-bold text-primary-foreground md:text-3xl">
          Welcome,{" "}
          <span className="bg-gradient-to-r from-primary to-teal-400 bg-clip-text text-transparent">
            {firstName}
          </span>{" "}
          🙏
        </h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Your faith journey — today's scripture, events, prayer, and more.
        </p>
      </motion.div>

      {/* Today's Scripture */}
      <motion.section
        initial={{ opacity: 0, scale: 0.98 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.4, delay: 0.05 }}
        aria-label="Today's daily scripture"
        className="relative overflow-hidden rounded-2xl border border-primary/20 bg-card/60 p-6 backdrop-blur-[16px] shadow-glass"
      >
        <div
          className="pointer-events-none absolute left-0 top-0 h-40 w-40 rounded-full opacity-15"
          aria-hidden="true"
          style={{
            background: "radial-gradient(circle, rgba(139,92,246,0.8) 0%, transparent 70%)",
            transform: "translate(-30%, -30%)",
          }}
        />
        <p className="text-xs font-semibold uppercase tracking-widest text-primary">
          Today's Scripture — {scriptureOfTheDay.reference}
        </p>
        <blockquote className="mt-3 text-base font-medium leading-relaxed text-primary-foreground md:text-lg">
          "{scriptureOfTheDay.verse}"
        </blockquote>
        <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
          {scriptureOfTheDay.reflection}
        </p>
        <Link
          href="/dashboard/scripture"
          className="mt-3 inline-flex items-center gap-1.5 text-xs font-medium text-primary hover:underline"
        >
          View archive <ArrowRight className="h-3 w-3" aria-hidden="true" />
        </Link>
      </motion.section>

      {/* KPIs */}
      <section aria-label="Personal activity metrics">
        <SectionHeader title="Your Activity" delay={0.1} />
        <div className="mt-4 grid grid-cols-2 gap-4 sm:grid-cols-4">
          {memberKpis.map((stat, i) => (
            <KpiCard key={stat.id} stat={stat} index={i} />
          ))}
        </div>
      </section>

      {/* Quick Actions */}
      <section aria-label="Quick actions">
        <SectionHeader title="Quick Actions" delay={0.15} />
        <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {memberQuickActions.map((action, i) => (
            <QuickActionCard key={action.id} action={action} index={i} />
          ))}
        </div>
      </section>

      {/* Upcoming Events + Recent Sermons */}
      <div className="grid gap-6 lg:grid-cols-2">
        {/* Upcoming Events */}
        <section aria-label="Upcoming events">
          <SectionHeader
            title="Upcoming Events"
            action={
              <Link
                href="/dashboard/events"
                className="flex items-center gap-1 text-xs text-primary hover:underline"
              >
                Browse all <ArrowRight className="h-3 w-3" aria-hidden="true" />
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
            {upcomingEvents.map((event, i) => (
              <motion.li
                key={event.id}
                initial={{ opacity: 0, x: -8 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.3, delay: 0.35 + i * 0.06 }}
                className="flex items-center gap-4 rounded-xl border border-border/50 bg-card/60 px-4 py-3 backdrop-blur-[16px]"
              >
                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-primary/15">
                  <Calendar className="h-4 w-4 text-primary" aria-hidden="true" />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-semibold text-primary-foreground">
                    {event.title}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {event.date} · {event.time}
                  </p>
                </div>
                {event.registered ? (
                  <CheckCircle
                    className="h-4 w-4 shrink-0 text-teal-400"
                    aria-label="Registered"
                  />
                ) : (
                  <Link
                    href={`/dashboard/events/${event.id}/register`}
                    className="shrink-0 rounded-lg bg-primary/15 px-2 py-1 text-xs font-medium text-primary transition-colors hover:bg-primary/25"
                    aria-label={`Register for ${event.title}`}
                  >
                    Register
                  </Link>
                )}
              </motion.li>
            ))}
          </motion.ul>
        </section>

        {/* Recent Sermons */}
        <section aria-label="Recent sermons">
          <SectionHeader
            title="Recent Sermons"
            action={
              <Link
                href="/dashboard/sermons"
                className="flex items-center gap-1 text-xs text-primary hover:underline"
              >
                Library <ArrowRight className="h-3 w-3" aria-hidden="true" />
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
            {recentSermons.map((sermon, i) => (
              <motion.li
                key={sermon.id}
                initial={{ opacity: 0, x: 8 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.3, delay: 0.35 + i * 0.06 }}
                className="flex items-center gap-4 rounded-xl border border-border/50 bg-card/60 px-4 py-3 backdrop-blur-[16px]"
              >
                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-secondary/15">
                  <BookOpen className="h-4 w-4 text-blue-400" aria-hidden="true" />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-semibold text-primary-foreground">
                    {sermon.title}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {sermon.speaker} · {sermon.duration}
                  </p>
                </div>
                {sermon.watched ? (
                  <span className="shrink-0 text-xs text-muted-foreground">Watched</span>
                ) : (
                  <Link
                    href="/dashboard/sermons"
                    className="shrink-0 rounded-lg bg-secondary/15 px-2 py-1 text-xs font-medium text-blue-400 transition-colors hover:bg-secondary/25"
                    aria-label={`Watch ${sermon.title}`}
                  >
                    Watch
                  </Link>
                )}
              </motion.li>
            ))}
          </motion.ul>
        </section>
      </div>

      {/* Activity Feed */}
      <section aria-label="Your recent activity">
        <SectionHeader
          title="Your Activity"
          description="A log of your recent actions"
          delay={0.25}
        />
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.35 }}
          className="mt-4 rounded-2xl border border-border/50 bg-card/60 p-5 backdrop-blur-[16px] shadow-glass"
        >
          <ActivityFeed items={memberActivity} />
        </motion.div>
      </section>

      {/* Achievement Badges */}
      <section aria-label="Achievement badges">
        <SectionHeader
          title="Achievement Badges"
          description="Earn badges through participation and faithfulness"
          delay={0.3}
        />
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.4 }}
          className="mt-4 grid grid-cols-3 gap-3 sm:grid-cols-6"
        >
          {achievementBadges.map((badge, i) => (
            <motion.div
              key={badge.id}
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.3, delay: 0.45 + i * 0.05 }}
              className={`flex flex-col items-center gap-2 rounded-xl border p-3 text-center transition-all ${
                badge.unlocked
                  ? "border-primary/30 bg-card/60 hover:shadow-neon"
                  : "border-border/30 bg-card/30 opacity-40"
              }`}
              title={badge.description}
            >
              <span className="text-2xl" role="img" aria-label={badge.name}>
                {badge.icon}
              </span>
              <p className={`text-xs font-medium ${badge.unlocked ? "text-primary-foreground" : "text-muted-foreground"}`}>
                {badge.name}
              </p>
              {!badge.unlocked && (
                <Trophy className="h-3 w-3 text-muted-foreground/50" aria-hidden="true" />
              )}
            </motion.div>
          ))}
        </motion.div>
        <p className="mt-3 text-center text-xs text-muted-foreground">
          Achievement system powered by Phase 2 — keep participating to unlock more badges!
        </p>
      </section>
    </div>
  );
}
