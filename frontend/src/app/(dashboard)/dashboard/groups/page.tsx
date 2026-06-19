"use client";

import { useState } from "react";
import { useConnectGroups } from "@/features/groups";
import { useAuth } from "@/hooks/use-auth";
import { useAppPermissions } from "@/hooks/use-app-permissions";
import { MOCK_MEMBERS } from "@/features/members/data/mock-members";
import { MOCK_BRANCHES } from "@/features/settings/data/mock-settings-data";
import {
  Users,
  Search,
  Plus,
  MapPin,
  Calendar,
  BookOpen,
  Heart,
  TrendingUp,
  ArrowRight
} from "lucide-react";
import Link from "next/link";

export default function GroupsDirectoryPage() {
  const { groups, toggleGroupStatus } = useConnectGroups();
  const { user } = useAuth();
  const permissions = useAppPermissions();
  const [searchTerm, setSearchTerm] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("All");

  const canCreate = permissions.groups.canCreate;

  // Find leader display name from MOCK_MEMBERS
  const getLeaderName = (leaderId: string) => {
    const member = MOCK_MEMBERS.find((m) => m.id === leaderId);
    return member ? `${member.first_name} ${member.last_name}` : "Unknown Leader";
  };

  // Find branch display name
  const getBranchName = (branchId: string) => {
    const branch = MOCK_BRANCHES.find((b) => b.id === branchId);
    return branch ? branch.branch_name : "Global";
  };

  const filteredGroups = groups.filter((group) => {
    const matchesSearch =
      group.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      group.location_name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = categoryFilter === "All" || group.category === categoryFilter;
    return matchesSearch && matchesCategory;
  });

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      {/* Top Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between border-b border-border/30 pb-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-primary-foreground font-display flex items-center gap-2">
            <Users className="h-6 w-6 text-emerald-400" />
            Connect Groups & Small Ministries
          </h1>
          <p className="text-xs text-muted-foreground mt-0.5">
            Explore home fellowships, connect cells, Bible study groups, and local ministries.
          </p>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <Link
            href="/dashboard/groups/outlines"
            className="inline-flex items-center gap-1.5 rounded-lg border border-border/50 bg-card/60 px-3 py-1.5 text-xs text-slate-300 hover:text-primary-foreground hover:bg-slate-900 transition-colors"
          >
            <BookOpen className="h-3.5 w-3.5 text-indigo-400" />
            <span>Study Guides</span>
          </Link>
          <Link
            href="/dashboard/groups/prayer-requests"
            className="inline-flex items-center gap-1.5 rounded-lg border border-border/50 bg-card/60 px-3 py-1.5 text-xs text-slate-300 hover:text-primary-foreground hover:bg-slate-900 transition-colors"
          >
            <Heart className="h-3.5 w-3.5 text-rose-400" />
            <span>Cell Prayers</span>
          </Link>
          {(permissions.groups.canViewReports || permissions.groups.canViewFinancialReports) && (
            <Link
              href="/dashboard/groups/reports"
              className="inline-flex items-center gap-1.5 rounded-lg border border-border/50 bg-card/60 px-3 py-1.5 text-xs text-slate-300 hover:text-primary-foreground hover:bg-slate-900 transition-colors"
            >
              <TrendingUp className="h-3.5 w-3.5 text-amber-400" />
              <span>Analytics</span>
            </Link>
          )}
          {canCreate && (
            <Link
              href="/dashboard/groups/create"
              className="inline-flex items-center gap-1 rounded-lg bg-emerald-500 hover:bg-emerald-600 px-3.5 py-1.5 text-xs font-semibold text-white transition-colors"
            >
              <Plus className="h-3.5 w-3.5" />
              <span>New Connect Cell</span>
            </Link>
          )}
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div className="relative max-w-md w-full">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <input
            type="text"
            placeholder="Search connect groups by name or location..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-4 py-2 text-xs rounded-lg border border-border/40 bg-card/40 text-primary-foreground placeholder:text-muted-foreground focus:outline-none focus:border-emerald-500/50"
          />
        </div>

        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 md:pb-0">
          {["All", "Home Fellowship", "Connect Group", "Bible Study", "Ministry Cell"].map((cat) => (
            <button
              key={cat}
              onClick={() => setCategoryFilter(cat)}
              className={`rounded-lg px-3.5 py-1.5 text-xs font-medium transition-all ${
                categoryFilter === cat
                  ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/25"
                  : "bg-card/40 text-slate-400 border border-border/30 hover:bg-slate-900"
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* Directory Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredGroups.length > 0 ? (
          filteredGroups.map((group) => {
            const isLeaderOfGroup = String(user?.id) === String(group.leader_id);
            const hasManagement = permissions.groups.canManage || isLeaderOfGroup;

            return (
              <div
                key={group.id}
                className={`rounded-2xl border bg-card/40 p-5 backdrop-blur-glass transition-all shadow-glass hover:border-emerald-500/25 flex flex-col justify-between min-h-[200px] ${
                  group.status === "Inactive" ? "opacity-60 border-dashed border-border" : "border-border/40"
                }`}
              >
                <div className="space-y-3">
                  {/* Category & Status */}
                  <div className="flex items-center justify-between">
                    <span className="rounded-full bg-emerald-500/10 px-2.5 py-0.5 text-[10px] font-bold text-emerald-400 border border-emerald-500/20">
                      {group.category}
                    </span>
                    <span
                      className={`text-[10px] font-semibold uppercase ${
                        group.status === "Active" ? "text-emerald-400" : "text-slate-500"
                      }`}
                    >
                      {group.status}
                    </span>
                  </div>

                  {/* Title & Desc */}
                  <div>
                    <h3 className="text-sm font-bold text-primary-foreground tracking-tight hover:text-emerald-400 transition-colors">
                      <Link href={`/dashboard/groups/${group.id}`}>{group.name}</Link>
                    </h3>
                    <p className="text-xs text-muted-foreground mt-1 line-clamp-2 leading-relaxed">
                      {group.description}
                    </p>
                  </div>

                  {/* Metadata */}
                  <div className="space-y-1.5 pt-2 border-t border-border/20">
                    <div className="flex items-center gap-2 text-[11px] text-slate-400">
                      <MapPin className="h-3.5 w-3.5 text-emerald-400 shrink-0" />
                      <span className="truncate">{group.location_name} ({getBranchName(group.branch_id)})</span>
                    </div>
                    <div className="flex items-center gap-2 text-[11px] text-slate-400">
                      <Users className="h-3.5 w-3.5 text-emerald-400 shrink-0" />
                      <span>Leader: {getLeaderName(group.leader_id)}</span>
                    </div>
                  </div>
                </div>

                <div className="pt-4 flex items-center justify-between border-t border-border/20 mt-4">
                  {hasManagement ? (
                    <button
                      onClick={() => toggleGroupStatus(group.id)}
                      className="text-[10px] font-semibold text-slate-400 hover:text-rose-400 transition-colors"
                    >
                      {group.status === "Active" ? "Deactivate" : "Activate"}
                    </button>
                  ) : (
                    <span className="text-[10px] font-medium text-slate-500">View Roster Only</span>
                  )}

                  <Link
                    href={`/dashboard/groups/${group.id}`}
                    className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-400 hover:text-emerald-300 transition-colors"
                  >
                    <span>Enter cell</span>
                    <ArrowRight className="h-3 w-3" />
                  </Link>
                </div>
              </div>
            );
          })
        ) : (
          <div className="col-span-full flex flex-col items-center justify-center py-20 text-center select-none border border-dashed border-border/40 rounded-2xl bg-card/10">
            <Users className="h-10 w-10 text-muted-foreground mb-3 opacity-40" />
            <h3 className="text-sm font-bold text-primary-foreground font-display">No Connect Cells Found</h3>
            <p className="text-xs text-muted-foreground mt-1 max-w-xs leading-normal">
              Adjust your search keywords or select another categories filter.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
