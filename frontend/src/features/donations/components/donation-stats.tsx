"use client";

import { motion } from "framer-motion";
import { formatCurrency } from "@/lib/localization";
import type { Donation, PledgeCampaign } from "../types/donations.types";
import { DollarSign, Landmark, PiggyBank, Receipt } from "lucide-react";

interface DonationStatsProps {
  donations: Donation[];
  campaigns: PledgeCampaign[];
}

export function DonationStats({ donations, campaigns }: DonationStatsProps) {
  // 1. Total Raised TZS (Only completed transactions)
  const completedDonations = donations.filter((d) => d.status === "Completed");
  const totalRaised = completedDonations.reduce((acc, curr) => acc + curr.amount * curr.exchange_rate_to_base, 0);

  // 2. Monthly Average (average of last 30 days or general average)
  // Let's get unique months/years of completed donations to calculate average per month
  const uniqueMonths = new Set(
    completedDonations.map((d) => {
      const date = new Date(d.created_at);
      return `${date.getFullYear()}-${date.getMonth()}`;
    })
  );
  const monthlyAverage = uniqueMonths.size > 0 ? Math.round(totalRaised / uniqueMonths.size) : totalRaised;

  // 3. Active Campaigns count & Total Campaign Targets
  const activeCampaigns = campaigns.filter((c) => c.status === "Active");
  const activeCampaignsRaised = activeCampaigns.reduce((acc, curr) => acc + (curr.raised_amount || 0), 0);

  // 4. Receipt Count
  const totalReceiptsCount = completedDonations.length;

  const stats = [
    {
      label: "Total Giving YTD",
      value: formatCurrency(totalRaised),
      description: "Total completed donations",
      icon: Landmark,
      color: "from-emerald-500/20 to-teal-500/10 border-emerald-500/30 text-emerald-400",
    },
    {
      label: "Monthly Average",
      value: formatCurrency(monthlyAverage),
      description: "Calculated across active months",
      icon: DollarSign,
      color: "from-indigo-500/20 to-blue-500/10 border-indigo-500/30 text-indigo-400",
    },
    {
      label: "Pledges Raised",
      value: formatCurrency(activeCampaignsRaised),
      description: `${activeCampaigns.length} active campaigns running`,
      icon: PiggyBank,
      color: "from-violet-500/20 to-purple-500/10 border-violet-500/30 text-violet-400",
    },
    {
      label: "Receipts Issued",
      value: totalReceiptsCount.toString(),
      description: "Available for print/download",
      icon: Receipt,
      color: "from-pink-500/20 to-rose-500/10 border-pink-500/30 text-pink-400",
    },
  ];

  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
      {stats.map((stat, idx) => (
        <motion.div
          key={stat.label}
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: idx * 0.05 }}
          className={`rounded-2xl border bg-card/40 p-6 backdrop-blur-glass shadow-glass flex items-center justify-between bg-gradient-to-br ${stat.color}`}
        >
          <div className="flex flex-col space-y-1">
            <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">{stat.label}</span>
            <span className="text-2xl font-bold tracking-tight text-primary-foreground">{stat.value}</span>
            <span className="text-xs text-muted-foreground">{stat.description}</span>
          </div>
          <div className="p-3 rounded-xl bg-background/50 border border-border/40">
            <stat.icon className="h-6 w-6" />
          </div>
        </motion.div>
      ))}
    </div>
  );
}
