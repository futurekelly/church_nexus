"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import { ArrowRight, Users, Clock, Calendar } from "lucide-react";
import { KpiCard } from "@/features/dashboard/components/widgets/kpi-card";
import { QuickActionCard } from "@/features/dashboard/components/widgets/quick-action-card";
import { ActivityFeed } from "@/features/dashboard/components/widgets/activity-feed";
import { ChartCard } from "@/features/dashboard/components/widgets/chart-card";
import { SectionHeader } from "@/features/dashboard/components/widgets/section-header";
import {
  churchAdminKpis,
  churchAdminQuickActions,
  churchAdminActivity,
  attendanceTrendData,
  upcomingEvents,
} from "@/features/dashboard/data/mock-dashboard-data";
import { useAuth } from "@/hooks/use-auth";

const pendingFollowUps = [
  { id: 1, name: "Alice Waweru", visitDate: "Jun 8, 2026", status: "New" },
  { id: 2, name: "Brian Njoroge", visitDate: "Jun 7, 2026", status: "Contacted" },
  { id: 3, name: "Carol Auma", visitDate: "Jun 5, 2026", status: "New" },
  { id: 4, name: "Dennis Otieno", visitDate: "Jun 3, 2026", status: "Scheduled" },
];

const statusColors: Record<string, string> = {
  New: "bg-amber-500/15 text-amber-400",
  Contacted: "bg-blue-500/15 text-blue-400",
  Scheduled: "bg-teal-500/15 text-teal-400",
};

export function ChurchAdminHome() {
  const { user } = useAuth();
  const firstName = user?.first_name ?? "Admin";

  return (
    <div className="space-y-8">
      {/* Welcome */}
      <motion.div
        initial={{ opacity: 0, y: -8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.35 }}
      >
        <h1 className="font-display text-2xl font-bold text-primary-foreground md:text-3xl">
          Good day,{" "}
          <span className="bg-gradient-to-r from-primary to-blue-400 bg-clip-text text-transparent">
            {firstName}
          </span>
        </h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Manage your congregation — members, events, attendance, and visitor follow-up.
        </p>
      </motion.div>

      {/* KPI Grid */}
      <section aria-label="Church administration metrics">
        <SectionHeader title="Administration Overview" delay={0.05} />
        <div className="mt-4 grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-5">
          {churchAdminKpis.map((stat, i) => (
            <KpiCard key={stat.id} stat={stat} index={i} />
          ))}
        </div>
      </section>

      {/* Attendance Chart + Upcoming Events */}
      <div className="grid gap-6 lg:grid-cols-5">
        <div className="lg:col-span-3">
          <SectionHeader
            title="Attendance Trend"
            description="Monthly service attendance"
            delay={0.1}
          />
          <div className="mt-4">
            <ChartCard
              title="Attendance"
              subtitle="Monthly headcount"
              data={attendanceTrendData}
              type="bar"
              color="#8B5CF6"
            />
          </div>
        </div>

        {/* Upcoming Events */}
        <section aria-label="Upcoming events" className="lg:col-span-2">
          <SectionHeader
            title="Upcoming Events"
            action={
              <Link
                href="/dashboard/events"
                className="flex items-center gap-1 text-xs text-primary hover:underline"
              >
                View all <ArrowRight className="h-3 w-3" aria-hidden="true" />
              </Link>
            }
            delay={0.1}
          />
          <motion.ul
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.2 }}
            className="mt-4 space-y-3"
            aria-label="Upcoming events list"
          >
            {upcomingEvents.map((event, i) => (
              <motion.li
                key={event.id}
                initial={{ opacity: 0, x: 12 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.3, delay: 0.25 + i * 0.06 }}
                className="flex items-start gap-3 rounded-xl border border-border/50 bg-card/60 p-4 backdrop-blur-[16px]"
              >
                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-primary/15">
                  <Calendar className="h-4 w-4 text-primary" aria-hidden="true" />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-semibold text-primary-foreground">
                    {event.title}
                  </p>
                  <p className="text-xs text-muted-foreground">{event.date} • {event.time}</p>
                  <p className="text-xs text-muted-foreground">{event.location}</p>
                </div>
              </motion.li>
            ))}
          </motion.ul>
        </section>
      </div>

      {/* Quick Actions + Recent Activity */}
      <div className="grid gap-6 lg:grid-cols-3">
        <section aria-label="Quick actions">
          <SectionHeader title="Quick Actions" delay={0.15} />
          <div className="mt-4 grid gap-3">
            {churchAdminQuickActions.map((action, i) => (
              <QuickActionCard key={action.id} action={action} index={i} />
            ))}
          </div>
        </section>

        <section aria-label="Recent admin activity" className="lg:col-span-2">
          <SectionHeader
            title="Recent Activity"
            action={
              <Link
                href="/dashboard/members"
                className="flex items-center gap-1 text-xs text-primary hover:underline"
              >
                View members <ArrowRight className="h-3 w-3" aria-hidden="true" />
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
            <ActivityFeed items={churchAdminActivity} />
          </motion.div>
        </section>
      </div>

      {/* Visitor Follow-Up */}
      <section aria-label="Pending visitor follow-ups">
        <SectionHeader
          title="Visitor Follow-Up"
          description="First-time visitors requiring attention"
          action={
            <Link
              href="/dashboard/visitors"
              className="flex items-center gap-1 text-xs text-primary hover:underline"
            >
              View all <ArrowRight className="h-3 w-3" aria-hidden="true" />
            </Link>
          }
          delay={0.2}
        />
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.3 }}
          className="mt-4 overflow-hidden rounded-2xl border border-border/50 bg-card/60 backdrop-blur-[16px] shadow-glass"
        >
          <div className="overflow-x-auto">
            <table className="w-full text-sm" aria-label="Visitor follow-up table">
              <thead>
                <tr className="border-b border-border/50">
                  <th scope="col" className="px-5 py-3 text-left text-xs font-medium text-muted-foreground">
                    Visitor
                  </th>
                  <th scope="col" className="px-5 py-3 text-left text-xs font-medium text-muted-foreground">
                    Visit Date
                  </th>
                  <th scope="col" className="px-5 py-3 text-left text-xs font-medium text-muted-foreground">
                    Status
                  </th>
                  <th scope="col" className="px-5 py-3">
                    <span className="sr-only">Action</span>
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/30">
                {pendingFollowUps.map((visitor, idx) => (
                  <motion.tr
                    key={visitor.id}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ duration: 0.25, delay: 0.35 + idx * 0.04 }}
                    className="group transition-colors hover:bg-primary/5"
                  >
                    <td className="px-5 py-3">
                      <div className="flex items-center gap-3">
                        <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/15 text-xs font-bold text-primary">
                          {visitor.name.charAt(0)}
                        </div>
                        <span className="font-medium text-primary-foreground">{visitor.name}</span>
                      </div>
                    </td>
                    <td className="px-5 py-3 text-muted-foreground">{visitor.visitDate}</td>
                    <td className="px-5 py-3">
                      <span className={`inline-block rounded-full px-2 py-0.5 text-xs font-medium ${statusColors[visitor.status]}`}>
                        {visitor.status}
                      </span>
                    </td>
                    <td className="px-5 py-3 text-right">
                      <Link
                        href={`/dashboard/follow-up/${visitor.id}`}
                        className="text-xs text-primary opacity-0 transition-opacity group-hover:opacity-100 hover:underline"
                      >
                        Follow up
                      </Link>
                    </td>
                  </motion.tr>
                ))}
              </tbody>
            </table>
          </div>
        </motion.div>
      </section>
    </div>
  );
}
