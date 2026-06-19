"use client";

import { useState, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { MessageSquare, Star, CheckCircle, Archive, Eye, ShieldAlert, Lock, Trash2, Search, Filter } from "lucide-react";
import Link from "next/link";
import { useTestimonies } from "@/features/testimonies";
import { useAppPermissions } from "@/hooks/use-app-permissions";
import type { Testimony, TestimonyCategory, TestimonyStatus } from "@/features/testimonies";
import { cn } from "@/lib/utils";

const CATEGORIES: (TestimonyCategory | "all")[] = [
  "all",
  "Healing",
  "Provision",
  "Restoration",
  "Salvation",
  "Deliverance",
  "Family",
  "Education",
  "Business",
  "General",
];

export default function DashboardTestimoniesPage() {
  const {
    testimonies,
    approveTestimony,
    archiveTestimony,
    toggleFeatureTestimony,
  } = useTestimonies();

  const { testimonies: permissions } = useAppPermissions();
  const { canViewDashboard, canApprove, canDelete, canFeature } = permissions;

  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<TestimonyStatus | "all">("all");
  const [categoryFilter, setCategoryFilter] = useState<TestimonyCategory | "all">("all");

  // 1. Gating
  if (!canViewDashboard) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] text-center p-6 select-none">
        <div className="rounded-2xl border border-border/40 bg-card/40 p-8 max-w-md backdrop-blur-glass shadow-glass">
          <Lock className="h-10 w-10 text-rose-400 mx-auto mb-4" />
          <h3 className="text-base font-bold text-primary-foreground font-display">Access Restricted</h3>
          <p className="text-xs text-muted-foreground mt-2">
            You do not have the required permissions to view the testimonies moderation dashboard.
          </p>
        </div>
      </div>
    );
  }

  // 2. Statistics
  const stats = useMemo(() => {
    return {
      total: testimonies.length,
      pending: testimonies.filter((t) => t.status === "Pending").length,
      featured: testimonies.filter((t) => t.is_featured).length,
      views: testimonies.reduce((acc, curr) => acc + curr.views, 0),
    };
  }, [testimonies]);

  // 3. Filtered list
  const filteredList = useMemo(() => {
    return testimonies.filter((t) => {
      const matchesSearch =
        !search ||
        t.title.toLowerCase().includes(search.toLowerCase()) ||
        t.content.toLowerCase().includes(search.toLowerCase()) ||
        t.author_name.toLowerCase().includes(search.toLowerCase());

      const matchesStatus = statusFilter === "all" || t.status === statusFilter;
      const matchesCategory = categoryFilter === "all" || t.category === categoryFilter;

      return matchesSearch && matchesStatus && matchesCategory;
    });
  }, [testimonies, search, statusFilter, categoryFilter]);

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-8">
      {/* Header */}
      <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between border-b border-border/30 pb-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-primary-foreground flex items-center gap-2">
            <MessageSquare className="h-6 w-6 text-indigo-400" />
            Testimonies Moderation
          </h1>
          <p className="text-xs text-muted-foreground mt-0.5">
            Review, approve, and feature congregation stories for the public testimonies wall.
          </p>
        </div>
      </div>

      {/* Stats Cards Row */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {[
          { label: "Total Submissions", value: stats.total, color: "from-blue-500/10 to-indigo-500/5 text-blue-400 border-blue-500/20" },
          { label: "Pending Review", value: stats.pending, color: "from-amber-500/10 to-yellow-500/5 text-amber-400 border-amber-500/20" },
          { label: "Featured Stories", value: stats.featured, color: "from-purple-500/10 to-violet-500/5 text-purple-400 border-purple-500/20" },
          { label: "Total Views", value: stats.views, color: "from-emerald-500/10 to-teal-500/5 text-emerald-400 border-emerald-500/20" },
        ].map((item, idx) => (
          <div
            key={idx}
            className={cn(
              "rounded-2xl border bg-card/40 p-5 backdrop-blur-glass shadow-glass flex flex-col justify-between",
              item.color
            )}
          >
            <span className="text-xs font-semibold text-muted-foreground">{item.label}</span>
            <span className="text-2xl font-extrabold mt-2 tracking-tight">{item.value}</span>
          </div>
        ))}
      </div>

      {/* Filtering Section */}
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between bg-card/20 p-4 rounded-xl border border-border/30">
        {/* Search */}
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <input
            type="text"
            placeholder="Search title or author..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full rounded-xl border border-border/50 bg-card/60 py-2 pl-9 pr-4 text-xs text-primary-foreground focus:border-indigo-500/50 focus:outline-none"
          />
        </div>

        {/* Filters */}
        <div className="flex flex-wrap items-center gap-3">
          <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
            <Filter className="h-3.5 w-3.5" />
            <span>Filters:</span>
          </div>

          {/* Status filter */}
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value as TestimonyStatus | "all")}
            className="rounded-lg border border-border/50 bg-card/60 px-3 py-1.5 text-xs text-primary-foreground focus:outline-none"
          >
            <option value="all">All Statuses</option>
            <option value="Pending">Pending</option>
            <option value="Approved">Approved</option>
            <option value="Archived">Archived</option>
          </select>

          {/* Category filter */}
          <select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value as TestimonyCategory | "all")}
            className="rounded-lg border border-border/50 bg-card/60 px-3 py-1.5 text-xs text-primary-foreground focus:outline-none"
          >
            <option value="all">All Categories</option>
            {CATEGORIES.filter((c) => c !== "all").map((cat) => (
              <option key={cat} value={cat}>
                {cat}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Testimonies Table Grid */}
      <div className="rounded-2xl border border-border/40 bg-card/30 backdrop-blur-glass overflow-hidden shadow-glass">
        {filteredList.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full border-collapse text-left text-xs">
              <thead>
                <tr className="border-b border-border/40 bg-slate-900/40 text-muted-foreground font-semibold">
                  <th className="p-4">Submission / Title</th>
                  <th className="p-4">Author Info</th>
                  <th className="p-4">Category</th>
                  <th className="p-4">Status</th>
                  <th className="p-4">Views</th>
                  <th className="p-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody>
                <AnimatePresence mode="popLayout">
                  {filteredList.map((testimony) => {
                    const createdDate = new Date(testimony.created_at).toLocaleDateString();
                    return (
                      <motion.tr
                        key={testimony.id}
                        layout
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="border-b border-border/30 hover:bg-slate-900/10 transition-colors"
                      >
                        {/* Title & Date */}
                        <td className="p-4 max-w-sm">
                          <div className="font-semibold text-primary-foreground flex items-center gap-1.5">
                            {testimony.is_featured && (
                              <Star className="h-3.5 w-3.5 text-amber-400 fill-amber-400 shrink-0" />
                            )}
                            <span className="truncate">{testimony.title}</span>
                          </div>
                          <p className="text-[10px] text-muted-foreground mt-0.5 leading-relaxed truncate">
                            {testimony.content}
                          </p>
                          <span className="text-[9px] text-slate-500 mt-1 block">Submitted on {createdDate}</span>
                        </td>

                        {/* Author */}
                        <td className="p-4">
                          <div className="font-medium text-slate-200">{testimony.author_name}</div>
                          <div className="text-[10px] text-muted-foreground">{testimony.author_email || "N/A"}</div>
                        </td>

                        {/* Category */}
                        <td className="p-4">
                          <span className="rounded bg-indigo-500/10 px-2 py-0.5 text-[10px] font-semibold text-indigo-400">
                            {testimony.category}
                          </span>
                        </td>

                        {/* Status badge */}
                        <td className="p-4">
                          <span
                            className={cn(
                              "inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[9px] font-semibold border",
                              testimony.status === "Approved" && "bg-emerald-500/10 text-emerald-400 border-emerald-500/20",
                              testimony.status === "Pending" && "bg-amber-500/10 text-amber-400 border-amber-500/20",
                              testimony.status === "Archived" && "bg-slate-500/10 text-slate-400 border-slate-500/20"
                            )}
                          >
                            <span
                              className={cn(
                                "h-1 w-1 rounded-full",
                                testimony.status === "Approved" && "bg-emerald-400",
                                testimony.status === "Pending" && "bg-amber-400",
                                testimony.status === "Archived" && "bg-slate-400"
                              )}
                            />
                            {testimony.status}
                          </span>
                        </td>

                        {/* Views */}
                        <td className="p-4 font-mono font-medium text-slate-300">
                          {testimony.views}
                        </td>

                        {/* Action Buttons */}
                        <td className="p-4 text-right space-x-2 shrink-0">
                          {/* Approve/Archive toggle */}
                          {testimony.status === "Pending" && canApprove && (
                            <button
                              type="button"
                              onClick={() => approveTestimony(testimony.id)}
                              className="inline-flex h-7 items-center gap-1 rounded-lg bg-emerald-500/10 px-2.5 text-[10px] font-semibold text-emerald-400 border border-emerald-500/20 hover:bg-emerald-500/20 transition-all"
                            >
                              <CheckCircle className="h-3 w-3" />
                              <span>Approve</span>
                            </button>
                          )}

                          {/* Decline/Archive */}
                          {testimony.status !== "Archived" && canApprove && (
                            <button
                              type="button"
                              onClick={() => archiveTestimony(testimony.id)}
                              className="inline-flex h-7 items-center gap-1 rounded-lg bg-slate-800 px-2.5 text-[10px] font-semibold text-muted-foreground border border-border/40 hover:text-rose-400 hover:bg-rose-500/10 hover:border-rose-500/20 transition-all"
                            >
                              <Archive className="h-3 w-3" />
                              <span>Decline</span>
                            </button>
                          )}

                          {/* Feature toggle */}
                          {testimony.status === "Approved" && canFeature && (
                            <button
                              type="button"
                              onClick={() => toggleFeatureTestimony(testimony.id)}
                              className={cn(
                                "inline-flex h-7 items-center gap-1 rounded-lg px-2.5 text-[10px] font-semibold border transition-all",
                                testimony.is_featured
                                  ? "bg-amber-500/15 text-amber-400 border-amber-500/35 hover:bg-amber-500/25"
                                  : "bg-slate-800 text-slate-400 border-border/40 hover:text-amber-400 hover:bg-amber-500/10 hover:border-amber-500/20"
                              )}
                            >
                              <Star className="h-3 w-3" />
                              <span>{testimony.is_featured ? "Unfeature" : "Feature"}</span>
                            </button>
                          )}

                          {/* Delete placeholder if canDelete */}
                          {canDelete && testimony.status === "Archived" && (
                            <span className="text-[10px] text-muted-foreground italic pr-2">Decline Logged</span>
                          )}
                        </td>
                      </motion.tr>
                    );
                  })}
                </AnimatePresence>
              </tbody>
            </table>
          </div>
        ) : (
          <div className="p-8 text-center text-xs text-muted-foreground select-none">
            No testimonies registered matching the filter configuration.
          </div>
        )}
      </div>
    </div>
  );
}
