"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import { Users, ArrowRight, ShieldCheck } from "lucide-react";
import { KpiCard } from "@/features/dashboard/components/widgets/kpi-card";
import { QuickActionCard } from "@/features/dashboard/components/widgets/quick-action-card";
import { ActivityFeed } from "@/features/dashboard/components/widgets/activity-feed";
import { ChartCard } from "@/features/dashboard/components/widgets/chart-card";
import { SectionHeader } from "@/features/dashboard/components/widgets/section-header";
import {
  superAdminKpis,
  superAdminQuickActions,
  superAdminActivity,
  memberGrowthData,
  donationTrendData,
} from "@/features/dashboard/data/mock-dashboard-data";
import { useAuth } from "@/hooks/use-auth";

const recentMembers = [
  { id: 1, name: "John Mwangi", role: "Member", joined: "Today", status: "Active" },
  { id: 2, name: "Grace Wanjiku", role: "Member", joined: "Yesterday", status: "Active" },
  { id: 3, name: "Samuel Ochieng", role: "Treasurer", joined: "2 days ago", status: "Active" },
  { id: 4, name: "Faith Njeri", role: "Visitor", joined: "3 days ago", status: "Active" },
  { id: 5, name: "David Kamau", role: "Media Team", joined: "1 week ago", status: "Active" },
];

export function SuperAdminHome() {
  const { user } = useAuth();
  const firstName = user?.first_name ?? "Admin";

  return (
    <div className="space-y-8">
      {/* Welcome header */}
      <motion.div
        initial={{ opacity: 0, y: -8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.35 }}
      >
        <h1 className="font-display text-2xl font-bold text-primary-foreground md:text-3xl">
          Welcome back,{" "}
          <span className="bg-gradient-to-r from-primary to-blue-400 bg-clip-text text-transparent">
            {firstName}
          </span>
        </h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Here's a complete overview of the Church Nexus platform.
        </p>
      </motion.div>

      {/* KPI Grid */}
      <section aria-label="Key performance indicators">
        <SectionHeader title="Platform Overview" delay={0.05} />
        <div className="mt-4 grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-3 xl:grid-cols-6">
          {superAdminKpis.map((stat, i) => (
            <KpiCard key={stat.id} stat={stat} index={i} />
          ))}
        </div>
      </section>

      {/* Charts */}
      <section aria-label="Analytics charts">
        <SectionHeader
          title="Analytics"
          description="6-month performance overview"
          delay={0.1}
        />
        <div className="mt-4 grid gap-4 md:grid-cols-2">
          <ChartCard
            title="Member Growth"
            subtitle="Monthly active members"
            data={memberGrowthData}
            type="area"
            color="#8B5CF6"
          />
          <ChartCard
            title="Donation Trends"
            subtitle="Monthly total (KSh)"
            data={donationTrendData}
            type="bar"
            color="#3B82F6"
            valuePrefix="KSh "
          />
        </div>
      </section>

      {/* Quick Actions + Activity */}
      <div className="grid gap-6 lg:grid-cols-3">
        {/* Quick Actions */}
        <section aria-label="Quick actions" className="lg:col-span-1">
          <SectionHeader title="Quick Actions" delay={0.15} />
          <div className="mt-4 grid gap-3">
            {superAdminQuickActions.map((action, i) => (
              <QuickActionCard key={action.id} action={action} index={i} />
            ))}
          </div>
        </section>

        {/* Activity Feed */}
        <section
          aria-label="Recent platform activity"
          className="lg:col-span-2"
        >
          <SectionHeader
            title="Recent Activity"
            description="Latest platform events"
            action={
              <Link
                href="/dashboard/settings"
                className="flex items-center gap-1 text-xs text-primary hover:underline"
                aria-label="View all audit logs"
              >
                View logs <ArrowRight className="h-3 w-3" aria-hidden="true" />
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
            <ActivityFeed items={superAdminActivity} />
          </motion.div>
        </section>
      </div>

      {/* Recent Members Table */}
      <section aria-label="Recent members">
        <SectionHeader
          title="Recent Members"
          action={
            <Link
              href="/dashboard/users"
              className="flex items-center gap-1 text-xs text-primary hover:underline"
              aria-label="View all users"
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
            <table className="w-full text-sm" aria-label="Recent members table">
              <thead>
                <tr className="border-b border-border/50">
                  <th
                    scope="col"
                    className="px-5 py-3 text-left text-xs font-medium text-muted-foreground"
                  >
                    Name
                  </th>
                  <th
                    scope="col"
                    className="px-5 py-3 text-left text-xs font-medium text-muted-foreground"
                  >
                    Role
                  </th>
                  <th
                    scope="col"
                    className="px-5 py-3 text-left text-xs font-medium text-muted-foreground"
                  >
                    Joined
                  </th>
                  <th
                    scope="col"
                    className="px-5 py-3 text-left text-xs font-medium text-muted-foreground"
                  >
                    Status
                  </th>
                  <th scope="col" className="px-5 py-3">
                    <span className="sr-only">Actions</span>
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/30">
                {recentMembers.map((member, idx) => (
                  <motion.tr
                    key={member.id}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ duration: 0.25, delay: 0.35 + idx * 0.04 }}
                    className="group transition-colors hover:bg-primary/5"
                  >
                    <td className="px-5 py-3">
                      <div className="flex items-center gap-3">
                        <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/15 text-xs font-bold text-primary">
                          {member.name.charAt(0)}
                        </div>
                        <span className="font-medium text-primary-foreground">
                          {member.name}
                        </span>
                      </div>
                    </td>
                    <td className="px-5 py-3 text-muted-foreground">
                      {member.role}
                    </td>
                    <td className="px-5 py-3 text-muted-foreground">
                      {member.joined}
                    </td>
                    <td className="px-5 py-3">
                      <span className="inline-flex items-center gap-1 rounded-full bg-teal-500/15 px-2 py-0.5 text-xs font-medium text-teal-400">
                        <span className="h-1.5 w-1.5 rounded-full bg-teal-400" aria-hidden="true" />
                        {member.status}
                      </span>
                    </td>
                    <td className="px-5 py-3 text-right">
                      <Link
                        href={`/dashboard/users/${member.id}`}
                        className="text-xs text-primary opacity-0 transition-opacity group-hover:opacity-100 hover:underline"
                      >
                        View
                      </Link>
                    </td>
                  </motion.tr>
                ))}
              </tbody>
            </table>
          </div>
        </motion.div>
      </section>

      {/* System Health Banner */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.4, delay: 0.5 }}
        className="flex items-center gap-3 rounded-xl border border-teal-500/20 bg-teal-500/5 px-4 py-3"
        role="status"
        aria-label="System health status"
      >
        <ShieldCheck className="h-5 w-5 text-teal-400" aria-hidden="true" />
        <p className="text-sm text-teal-400">
          All systems operational — 99.8% uptime this month
        </p>
      </motion.div>
    </div>
  );
}
