"use client";

import { useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { Plus, BarChart3, Heart, Receipt, Sparkles } from "lucide-react";
import { useDonations } from "@/features/donations";
import { useAppPermissions } from "@/hooks/use-app-permissions";
import { formatCurrency } from "@/lib/localization";
import { DonationStats } from "@/features/donations/components/donation-stats";
import { PledgeCard } from "@/features/donations/components/pledge-card";
import { SearchInput } from "@/components/ui/search-input";
import { FilterSelect } from "@/components/ui/filter-select";
import { Pagination } from "@/components/ui/pagination";

const ITEMS_PER_PAGE = 6;

export default function DonationsDashboardPage() {
  const router = useRouter();
  const { donations, campaigns } = useDonations();
  const { donations: donationPermissions } = useAppPermissions();
  const { canManage, canViewReports, isMember, userMemberId } = donationPermissions;

  // Filters & State
  const [search, setSearch] = useState("");
  const [typeFilter, setTypeFilter] = useState("all");
  const [currentPage, setCurrentPage] = useState(1);

  // Filter completed donations based on permissions
  const visibleDonations = useMemo(() => {
    let list = donations.filter((d) => d.status === "Completed");

    // If user is a member, they only see their own donations
    if (isMember && userMemberId) {
      list = list.filter((d) => d.member_id === userMemberId);
    }

    // Apply text search
    if (search.trim()) {
      const q = search.toLowerCase();
      list = list.filter(
        (d) =>
          d.donor_name.toLowerCase().includes(q) ||
          (d.notes && d.notes.toLowerCase().includes(q)) ||
          (d.reference_number && d.reference_number.toLowerCase().includes(q))
      );
    }

    // Apply category filter
    if (typeFilter !== "all") {
      list = list.filter((d) => d.type === typeFilter);
    }

    return list;
  }, [donations, isMember, userMemberId, search, typeFilter]);

  // Paginated donations
  const totalPages = Math.max(1, Math.ceil(visibleDonations.length / ITEMS_PER_PAGE));
  const paginatedDonations = useMemo(() => {
    const start = (currentPage - 1) * ITEMS_PER_PAGE;
    return visibleDonations.slice(start, start + ITEMS_PER_PAGE);
  }, [visibleDonations, currentPage]);

  const typeOptions = [
    { value: "all", label: "All Categories" },
    { value: "Tithe", label: "Tithe" },
    { value: "Offering", label: "Offering" },
    { value: "Building Fund", label: "Building Fund" },
    { value: "Outreach", label: "Outreach" },
    { value: "Other", label: "Other" },
  ];

  return (
    <div className="space-y-8 p-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-primary-foreground">Donations & Giving</h1>
          <p className="text-sm text-muted-foreground">
            {isMember
              ? "Track your personal contributions, tithes, and active pledge campaigns."
              : "Manage church Tithes, Offerings, pledge campaigns, and download receipts."}
          </p>
        </div>
        <div className="flex flex-wrap gap-2.5">
          {canViewReports && (
            <button
              onClick={() => router.push("/dashboard/donations/reports")}
              className="flex items-center gap-1.5 rounded-xl border border-border/50 bg-card/40 px-4 py-2.5 text-sm font-semibold text-primary-foreground hover:bg-slate-900 transition-all"
            >
              <BarChart3 className="h-4 w-4 text-indigo-400" />
              Reports
            </button>
          )}
          {canManage && (
            <button
              onClick={() => router.push("/dashboard/donations/create")}
              className="flex items-center gap-1.5 rounded-xl bg-primary px-4 py-2.5 text-sm font-semibold text-primary-foreground shadow-neon hover:brightness-110 transition-all"
            >
              <Plus className="h-4 w-4" />
              Record Gift
            </button>
          )}
          <button
            onClick={() => router.push("/give")}
            className="flex items-center gap-1.5 rounded-xl bg-gradient-to-r from-pink-500 to-indigo-600 px-4 py-2.5 text-sm font-semibold text-primary-foreground shadow-[0_0_15px_rgba(236,72,153,0.3)] hover:brightness-110 transition-all"
          >
            <Heart className="h-4 w-4 text-pink-200" />
            Online Giving
          </button>
        </div>
      </div>

      {/* KPI Stats (Only show overall stats to non-members or aggregated individual stats to member) */}
      <DonationStats
        donations={
          isMember && userMemberId
            ? donations.filter((d) => d.member_id === userMemberId)
            : donations
        }
        campaigns={campaigns}
      />

      {/* Pledge Campaigns Grid */}
      <div className="space-y-4">
        <div>
          <h2 className="text-lg font-bold text-primary-foreground">Fundraising Pledge Campaigns</h2>
          <p className="text-xs text-muted-foreground">Active campaigns running in Tanzanian Shillings (TZS)</p>
        </div>
        <div className="grid gap-4 md:grid-cols-3">
          {campaigns.map((camp) => (
            <PledgeCard key={camp.id} campaign={camp} />
          ))}
        </div>
      </div>

      {/* Financial Ledger Section */}
      <div className="space-y-4 border border-border/40 rounded-2xl bg-card/20 p-6 backdrop-blur-glass shadow-glass">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h2 className="text-lg font-bold text-primary-foreground">
              {isMember ? "My Giving History" : "Financial Ledger"}
            </h2>
            <p className="text-xs text-muted-foreground">List of completed contributions</p>
          </div>

          <div className="flex flex-col sm:flex-row gap-3 sm:items-center">
            {/* Search */}
            <SearchInput
              value={search}
              onChange={(val) => {
                setSearch(val);
                setCurrentPage(1);
              }}
              placeholder="Search donor or ref..."
              className="w-full sm:w-60"
            />
            <FilterSelect
              value={typeFilter}
              onChange={(e) => {
                setTypeFilter(e.target.value);
                setCurrentPage(1);
              }}
              aria-label="Filter by category"
            >
              {typeOptions.map((opt) => (
                <option key={opt.value} value={opt.value} className="bg-slate-900 text-slate-100">
                  {opt.label}
                </option>
              ))}
            </FilterSelect>
          </div>
        </div>

        {/* Ledger Table */}
        <div className="overflow-x-auto rounded-xl border border-border/40 bg-slate-950/20">
          <table className="w-full border-collapse text-left text-sm">
            <thead>
              <tr className="border-b border-border/40 bg-slate-900/40 text-xs font-semibold text-muted-foreground">
                <th className="p-4">Date</th>
                <th className="p-4">Donor</th>
                <th className="p-4">Category</th>
                <th className="p-4">Amount</th>
                <th className="p-4">Method</th>
                <th className="p-4">Reference No.</th>
                <th className="p-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border/30 text-primary-foreground">
              {paginatedDonations.length > 0 ? (
                paginatedDonations.map((donation) => (
                  <tr
                    key={donation.id}
                    className="hover:bg-slate-900/20 transition-all duration-150"
                  >
                    <td className="p-4 whitespace-nowrap text-xs text-slate-300">
                      {new Date(donation.created_at).toLocaleDateString("en-US", {
                        year: "numeric",
                        month: "short",
                        day: "numeric",
                      })}
                    </td>
                    <td className="p-4 font-semibold text-xs">
                      {donation.donor_name}
                      {donation.donor_email && (
                        <span className="block text-[10px] text-muted-foreground font-normal">
                          {donation.donor_email}
                        </span>
                      )}
                    </td>
                    <td className="p-4 text-xs font-medium">
                      <span className="rounded-md bg-indigo-500/10 px-2 py-1 text-indigo-400 border border-indigo-500/10">
                        {donation.type}
                      </span>
                    </td>
                    <td className="p-4 text-xs font-bold text-emerald-400">
                      {formatCurrency(donation.amount)}
                    </td>
                    <td className="p-4 text-xs text-slate-300">
                      {donation.payment_method}
                    </td>
                    <td className="p-4 text-xs font-mono text-indigo-300">
                      {donation.reference_number || "N/A"}
                    </td>
                    <td className="p-4 text-right whitespace-nowrap">
                      <button
                        onClick={() => router.push(`/dashboard/donations/${donation.id}`)}
                        className="inline-flex items-center gap-1 text-xs text-indigo-400 hover:text-indigo-300 font-semibold px-2 py-1.5 rounded-lg hover:bg-indigo-500/10 transition-all"
                      >
                        <Receipt className="h-3.5 w-3.5" />
                        Receipt
                      </button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={7} className="p-8 text-center text-xs text-muted-foreground">
                    No transactions matching your selection found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {visibleDonations.length > ITEMS_PER_PAGE && (
          <div className="pt-4 border-t border-border/30">
            <Pagination
              page={currentPage}
              totalPages={totalPages}
              totalItems={visibleDonations.length}
              pageSize={ITEMS_PER_PAGE}
              onPageChange={setCurrentPage}
              itemName="donations"
              variant="indigo"
            />
          </div>
        )}
      </div>
    </div>
  );
}
