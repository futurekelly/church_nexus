"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import { ArrowRight, DollarSign } from "lucide-react";
import { KpiCard } from "@/features/dashboard/components/widgets/kpi-card";
import { QuickActionCard } from "@/features/dashboard/components/widgets/quick-action-card";
import { ActivityFeed } from "@/features/dashboard/components/widgets/activity-feed";
import { ChartCard } from "@/features/dashboard/components/widgets/chart-card";
import { SectionHeader } from "@/features/dashboard/components/widgets/section-header";
import {
  treasurerKpis,
  treasurerQuickActions,
  treasurerActivity,
  revenueData,
  donationTrendData,
} from "@/features/dashboard/data/mock-dashboard-data";
import { useAuth } from "@/hooks/use-auth";

const recentTransactions = [
  { id: 1, donor: "Neema Mushi", amount: "TSh 10,000", type: "Tithe", date: "Today, 10:22 AM" },
  { id: 2, donor: "Juma Said", amount: "TSh 5,000", type: "Offering", date: "Today, 9:14 AM" },
  { id: 3, donor: "Bahati Mtui", amount: "TSh 2,500", type: "Building Fund", date: "Today, 8:50 AM" },
  { id: 4, donor: "Anonymous", amount: "TSh 1,000", type: "General", date: "Yesterday" },
  { id: 5, donor: "Baraka Kishosha", amount: "TSh 15,000", type: "Tithe", date: "Yesterday" },
];

const typeColors: Record<string, string> = {
  Tithe: "bg-primary/15 text-primary",
  Offering: "bg-blue-500/15 text-blue-400",
  "Building Fund": "bg-amber-500/15 text-amber-400",
  General: "bg-teal-500/15 text-teal-400",
};

export function TreasurerHome() {
  const { user } = useAuth();
  const firstName = user?.first_name ?? "Treasurer";

  return (
    <div className="space-y-8">
      {/* Welcome */}
      <motion.div
        initial={{ opacity: 0, y: -8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.35 }}
      >
        <h1 className="font-display text-2xl font-bold text-primary-foreground md:text-3xl">
          Financial Overview,{" "}
          <span className="bg-gradient-to-r from-teal-400 to-primary bg-clip-text text-transparent">
            {firstName}
          </span>
        </h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Monitor donations, tithes, offerings, and generate financial reports.
        </p>
      </motion.div>

      {/* KPI Grid */}
      <section aria-label="Financial metrics">
        <SectionHeader title="Financial Summary" delay={0.05} />
        <div className="mt-4 grid grid-cols-2 gap-4 sm:grid-cols-4">
          {treasurerKpis.map((stat, i) => (
            <KpiCard key={stat.id} stat={stat} index={i} />
          ))}
        </div>
      </section>

      {/* Revenue Charts */}
      <section aria-label="Revenue analytics charts">
        <SectionHeader
          title="Revenue Analytics"
          description="6-month financial performance"
          delay={0.1}
        />
        <div className="mt-4 grid gap-4 md:grid-cols-2">
          <ChartCard
            title="Revenue vs Target"
            subtitle="Actual vs planned (TSh)"
            data={revenueData}
            type="dual-bar"
            color="#14B8A6"
            color2="#8B5CF6"
            valuePrefix="TSh "
          />
          <ChartCard
            title="Monthly Donation Trend"
            subtitle="Total donations per month (TSh)"
            data={donationTrendData}
            type="area"
            color="#14B8A6"
            valuePrefix="TSh "
          />
        </div>
      </section>

      {/* Quick Actions + Activity */}
      <div className="grid gap-6 lg:grid-cols-3">
        <section aria-label="Quick actions">
          <SectionHeader title="Quick Actions" delay={0.15} />
          <div className="mt-4 grid gap-3">
            {treasurerQuickActions.map((action, i) => (
              <QuickActionCard key={action.id} action={action} index={i} />
            ))}
          </div>
        </section>

        <section aria-label="Recent financial activity" className="lg:col-span-2">
          <SectionHeader
            title="Recent Donations"
            action={
              <Link
                href="/dashboard/donations/history"
                className="flex items-center gap-1 text-xs text-primary hover:underline"
              >
                View all <ArrowRight className="h-3 w-3" aria-hidden="true" />
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
            <ActivityFeed items={treasurerActivity} />
          </motion.div>
        </section>
      </div>

      {/* Recent Transactions Table */}
      <section aria-label="Recent transactions detail">
        <SectionHeader
          title="Transaction Details"
          description="Latest donation records"
          action={
            <Link
              href="/dashboard/donations/history"
              className="flex items-center gap-1 text-xs text-primary hover:underline"
            >
              Full history <ArrowRight className="h-3 w-3" aria-hidden="true" />
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
            <table className="w-full text-sm" aria-label="Recent transactions table">
              <thead>
                <tr className="border-b border-border/50">
                  <th scope="col" className="px-5 py-3 text-left text-xs font-medium text-muted-foreground">Donor</th>
                  <th scope="col" className="px-5 py-3 text-left text-xs font-medium text-muted-foreground">Amount</th>
                  <th scope="col" className="px-5 py-3 text-left text-xs font-medium text-muted-foreground">Type</th>
                  <th scope="col" className="px-5 py-3 text-left text-xs font-medium text-muted-foreground">Date</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/30">
                {recentTransactions.map((tx, idx) => (
                  <motion.tr
                    key={tx.id}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ duration: 0.25, delay: 0.35 + idx * 0.04 }}
                    className="transition-colors hover:bg-teal-500/5"
                  >
                    <td className="px-5 py-3">
                      <div className="flex items-center gap-3">
                        <div className="flex h-8 w-8 items-center justify-center rounded-full bg-teal-500/15 text-xs font-bold text-teal-400">
                          <DollarSign className="h-4 w-4" aria-hidden="true" />
                        </div>
                        <span className="font-medium text-primary-foreground">{tx.donor}</span>
                      </div>
                    </td>
                    <td className="px-5 py-3 font-mono font-semibold text-teal-400">
                      {tx.amount}
                    </td>
                    <td className="px-5 py-3">
                      <span className={`inline-block rounded-full px-2 py-0.5 text-xs font-medium ${typeColors[tx.type] ?? "bg-muted/30 text-muted-foreground"}`}>
                        {tx.type}
                      </span>
                    </td>
                    <td className="px-5 py-3 text-xs text-muted-foreground">{tx.date}</td>
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
