"use client";

import { useRouter } from "next/navigation";
import { ArrowLeft, BarChart3, TrendingUp, Calendar } from "lucide-react";
import { useDonations, useDonationPermissions, formatTZS } from "@/features/donations";
import { GivingCategoryChart } from "@/features/donations/components/giving-category-chart";
import { GivingTrendChart } from "@/features/donations/components/giving-trend-chart";
import { DonationStats } from "@/features/donations/components/donation-stats";
import { motion } from "framer-motion";

export default function DonationsReportsPage() {
  const router = useRouter();
  const { donations, campaigns } = useDonations();
  const { canViewReports } = useDonationPermissions();

  if (!canViewReports) {
    return (
      <div className="p-8 max-w-md mx-auto text-center space-y-4">
        <div className="bg-red-500/10 text-red-400 p-4 rounded-xl border border-red-500/20 font-semibold">
          Access Denied
        </div>
        <p className="text-sm text-muted-foreground">
          You do not have permission to view financial contribution reports.
        </p>
        <button
          onClick={() => router.push("/dashboard/donations")}
          className="rounded-xl bg-card/60 px-4 py-2 border border-border/50 text-xs font-semibold text-primary-foreground hover:bg-slate-900"
        >
          Return to Dashboard
        </button>
      </div>
    );
  }

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      {/* Breadcrumbs */}
      <button
        onClick={() => router.push("/dashboard/donations")}
        className="inline-flex items-center gap-1 text-xs text-muted-foreground hover:text-primary-foreground transition-colors"
      >
        <ArrowLeft className="h-4 w-4" />
        Back to Ledger
      </button>

      {/* Header */}
      <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-primary-foreground flex items-center gap-2">
            <BarChart3 className="h-6 w-6 text-indigo-400" />
            Financial Giving Analytics
          </h1>
          <p className="text-sm text-muted-foreground">
            Aggregate giving statistics, category splits, and campaign trends in Tanzanian Shillings (TZS).
          </p>
        </div>
      </div>

      {/* Stats row */}
      <DonationStats donations={donations} campaigns={campaigns} />

      {/* Charts Grid */}
      <div className="grid gap-6 md:grid-cols-2">
        <GivingCategoryChart donations={donations} />
        <GivingTrendChart donations={donations} />
      </div>

      {/* Campaign breakdown table */}
      <div className="rounded-2xl border border-border/50 bg-card/40 p-6 backdrop-blur-glass shadow-glass space-y-4">
        <div className="flex items-center gap-2">
          <TrendingUp className="h-5 w-5 text-emerald-400" />
          <h3 className="text-sm font-semibold text-primary-foreground">Fundraising Targets Status</h3>
        </div>
        <div className="overflow-x-auto rounded-xl border border-border/40 bg-slate-950/20">
          <table className="w-full text-left text-sm">
            <thead>
              <tr className="border-b border-border/40 bg-slate-900/40 text-xs font-semibold text-muted-foreground">
                <th className="p-4">Campaign Name</th>
                <th className="p-4">Goal Target</th>
                <th className="p-4">Amount Raised</th>
                <th className="p-4">Progress</th>
                <th className="p-4">Target Date</th>
                <th className="p-4">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border/30 text-primary-foreground">
              {campaigns.map((camp) => {
                const percentage = Math.min(
                  100,
                  Math.round((camp.raised_amount / camp.target_amount) * 100)
                );
                return (
                  <tr key={camp.id} className="hover:bg-slate-900/10">
                    <td className="p-4 font-bold text-xs">{camp.name}</td>
                    <td className="p-4 text-xs font-medium text-slate-300">{formatTZS(camp.target_amount)}</td>
                    <td className="p-4 text-xs font-bold text-emerald-400">{formatTZS(camp.raised_amount)}</td>
                    <td className="p-4">
                      <div className="flex items-center gap-2">
                        <div className="h-1.5 w-24 rounded-full bg-slate-800 overflow-hidden">
                          <div
                            className="h-full bg-indigo-500"
                            style={{ width: `${percentage}%` }}
                          />
                        </div>
                        <span className="text-[10px] font-semibold text-slate-300">{percentage}%</span>
                      </div>
                    </td>
                    <td className="p-4 text-xs text-slate-300">
                      {new Date(camp.target_date).toLocaleDateString()}
                    </td>
                    <td className="p-4 text-xs">
                      <span
                        className={`inline-block px-2 py-0.5 rounded-md font-medium text-[10px] ${
                          camp.status === "Fulfilled"
                            ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20"
                            : "bg-indigo-500/10 text-indigo-400 border border-indigo-500/20"
                        }`}
                      >
                        {camp.status}
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
