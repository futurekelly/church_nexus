"use client";

import { useState, useMemo, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  MessageSquare,
  Star,
  CheckCircle,
  Archive,
  Eye,
  Lock,
  Search,
  Filter,
  Plus,
  X,
  Check,
  Calendar,
  Globe,
  Loader2,
  AlertCircle
} from "lucide-react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { useTestimonies } from "@/features/testimonies";
import { useAppPermissions } from "@/hooks/use-app-permissions";
import { useAuth } from "@/hooks/use-auth";
import type { Testimony, TestimonyCategory, TestimonyStatus, TestimonyFormValues } from "@/features/testimonies";
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

const inputClass = cn(
  "w-full rounded-xl border border-border/50 bg-card/60 px-4 py-2 text-xs",
  "text-primary-foreground placeholder:text-muted-foreground/50",
  "transition-all duration-200 focus:border-indigo-500/50 focus:outline-none focus:ring-2 focus:ring-indigo-500/10"
);

const labelClass = "block text-[10px] font-semibold text-muted-foreground mb-1 uppercase tracking-wider";

export default function DashboardTestimoniesPage() {
  const {
    testimonies,
    isLoading,
    error,
    addTestimony,
    approveTestimony,
    rejectTestimony,
    archiveTestimony,
    toggleFeatureTestimony,
    incrementViews,
  } = useTestimonies();

  const { user } = useAuth();
  const { testimonies: permissions, userId } = useAppPermissions();
  const { canViewDashboard, canApprove, canDelete, canFeature } = permissions;

  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<TestimonyStatus | "all">("all");
  const [categoryFilter, setCategoryFilter] = useState<TestimonyCategory | "all">("all");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedTestimony, setSelectedTestimony] = useState<Testimony | null>(null);

  // Rejection Dialog states
  const [rejectingId, setRejectingId] = useState<string | null>(null);
  const [declineReason, setDeclineReason] = useState("");

  // Statistics for moderation dashboard
  const stats = useMemo(() => {
    return {
      total: testimonies.length,
      pending: testimonies.filter((t) => t.status === "Pending").length,
      featured: testimonies.filter((t) => t.is_featured).length,
      views: testimonies.reduce((acc, curr) => acc + curr.views, 0),
    };
  }, [testimonies]);

  // Form setup for testimonies submission
  const {
    register,
    handleSubmit,
    watch,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<TestimonyFormValues>({
    defaultValues: {
      title: "",
      content: "",
      category: "General",
      author_name: "",
      author_email: "",
      is_anonymous: false,
      image_url: "",
      video_url: "",
    },
  });

  const watchAnonymous = watch("is_anonymous");

  // Sync author name/email fields when user profile loads
  useEffect(() => {
    if (user) {
      reset({
        title: "",
        content: "",
        category: "General",
        author_name: `${user.first_name || ""} ${user.last_name || ""}`.trim() || user.email,
        author_email: user.email,
        is_anonymous: false,
        image_url: "",
        video_url: "",
      });
    }
  }, [user, reset]);

  const onCreateTestimony = async (values: TestimonyFormValues) => {
    try {
      await addTestimony(values);
      toast.success("Your testimony has been submitted and is awaiting review.");
      setIsModalOpen(false);
      reset({
        title: "",
        content: "",
        category: "General",
        author_name: user ? `${user.first_name || ""} ${user.last_name || ""}`.trim() : "",
        author_email: user?.email || "",
        is_anonymous: false,
        image_url: "",
        video_url: "",
      });
    } catch (err) {
      toast.error("Failed to submit testimony. Please try again.");
    }
  };

  // Moderation filtering (Admins / Pastors)
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

  // Member filtering (Approved testimonies + user's own submissions)
  const memberFilteredList = useMemo(() => {
    return testimonies.filter((t) => {
      const isApproved = t.status === "Approved";
      const isMine = userId && String(t.user_id) === String(userId);
      if (!isApproved && !isMine) return false;

      const matchesSearch =
        !search ||
        t.title.toLowerCase().includes(search.toLowerCase()) ||
        t.content.toLowerCase().includes(search.toLowerCase()) ||
        t.author_name.toLowerCase().includes(search.toLowerCase());

      const matchesCategory = categoryFilter === "all" || t.category === categoryFilter;

      return matchesSearch && matchesCategory;
    });
  }, [testimonies, search, categoryFilter, userId]);

  // Handle loading state
  if (isLoading) {
    return (
      <div className="flex h-[60vh] flex-col items-center justify-center gap-2">
        <Loader2 className="h-8 w-8 animate-spin text-indigo-500" />
        <p className="text-xs text-muted-foreground">Loading testimonies...</p>
      </div>
    );
  }

  // Handle error state
  if (error && testimonies.length === 0) {
    return (
      <div className="flex h-[60vh] flex-col items-center justify-center gap-3 p-6 text-center">
        <AlertCircle className="h-10 w-10 text-rose-500" />
        <h3 className="font-display text-sm font-bold text-primary-foreground">Failed to Load Content</h3>
        <p className="text-xs text-muted-foreground max-w-sm">{error}</p>
      </div>
    );
  }

  // ----------------------------------------------------
  // Member UI Layout (Browsing & Sharing)
  // ----------------------------------------------------
  if (!canViewDashboard) {
    return (
      <div className="p-6 max-w-7xl mx-auto space-y-8">
        {/* Header */}
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between border-b border-border/30 pb-4">
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-primary-foreground flex items-center gap-2 font-display">
              <MessageSquare className="h-6 w-6 text-indigo-400" />
              Testimonies Wall
            </h1>
            <p className="text-xs text-muted-foreground mt-0.5">
              Read inspiring testimonies of faith and share what God has done in your life.
            </p>
          </div>
          <button
            onClick={() => setIsModalOpen(true)}
            className="inline-flex items-center justify-center gap-2 rounded-xl bg-indigo-500 px-4 py-2.5 text-xs font-semibold text-white transition-all hover:bg-indigo-600 shadow-neon sm:w-auto self-start"
          >
            <Plus className="h-4 w-4" />
            <span>Share Testimony</span>
          </button>
        </div>

        {/* Filter controls */}
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between bg-card/20 p-4 rounded-xl border border-border/30">
          <div className="relative flex-1 max-w-sm">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <input
              type="text"
              placeholder="Search testimonies..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full rounded-xl border border-border/50 bg-card/60 py-2 pl-9 pr-4 text-xs text-primary-foreground focus:border-indigo-500/50 focus:outline-none"
            />
          </div>

          <div className="flex items-center gap-3">
            <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
              <Filter className="h-3.5 w-3.5" />
              <span>Category:</span>
            </div>
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

        {/* Testimony Grid */}
        {memberFilteredList.length > 0 ? (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {memberFilteredList.map((testimony) => (
              <div
                key={testimony.id}
                className="rounded-2xl border border-border/40 bg-card/30 p-5 backdrop-blur-glass shadow-glass flex flex-col justify-between hover:border-indigo-500/30 transition-all duration-350"
              >
                <div>
                  <div className="flex items-center justify-between gap-2 mb-3">
                    <span className="rounded bg-indigo-500/10 px-2 py-0.5 text-[9px] font-bold text-indigo-400 tracking-wide uppercase">
                      {testimony.category}
                    </span>
                    {userId && String(testimony.user_id) === String(userId) && (
                      <span
                        className={cn(
                          "px-2 py-0.5 rounded-full text-[9px] font-semibold border",
                          testimony.status === "Approved" && "bg-emerald-500/10 text-emerald-400 border-emerald-500/20",
                          testimony.status === "Pending" && "bg-amber-500/10 text-amber-400 border-amber-500/20",
                          testimony.status === "Rejected" && "bg-rose-500/10 text-rose-400 border-rose-500/20",
                          testimony.status === "Archived" && "bg-slate-500/10 text-slate-400 border-slate-500/20"
                        )}
                      >
                        {testimony.status === "Pending" ? "Review Pending" : testimony.status}
                      </span>
                    )}
                  </div>
                  <h3 className="font-display text-sm font-bold text-primary-foreground line-clamp-1 flex items-center gap-1.5">
                    {testimony.is_featured && (
                      <Star className="h-3.5 w-3.5 text-amber-400 fill-amber-400 shrink-0" />
                    )}
                    {testimony.title}
                  </h3>
                  <p className="text-[11px] text-muted-foreground mt-2 line-clamp-4 leading-relaxed">
                    {testimony.content}
                  </p>
                  
                  {/* Rejection Feedback */}
                  {userId && String(testimony.user_id) === String(userId) && testimony.status === "Rejected" && testimony.rejection_reason && (
                    <div className="mt-3 p-2.5 bg-rose-500/10 rounded-xl border border-rose-500/20 text-[10px] text-rose-400 leading-relaxed font-mono">
                      <strong>Decline Reason:</strong> {testimony.rejection_reason}
                    </div>
                  )}
                </div>
                <div className="flex items-center justify-between mt-5 pt-3 border-t border-border/20 text-[10px]">
                  <span className="text-slate-400 font-medium">By {testimony.author_name}</span>
                  <button
                    type="button"
                    onClick={() => {
                      incrementViews(testimony.id);
                      setSelectedTestimony(testimony);
                    }}
                    className="text-indigo-400 hover:text-indigo-300 font-semibold transition-colors hover:underline"
                  >
                    Read details &rarr;
                  </button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="rounded-2xl border border-border/40 bg-card/25 p-12 text-center text-xs text-muted-foreground shadow-glass">
            No testimonies registered matching the filter configuration.
          </div>
        )}

        {/* ----------------------------------------------------
            Submit Testimony Modal (overlay)
           ---------------------------------------------------- */}
        <AnimatePresence>
          {isModalOpen && (
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-background/80 backdrop-blur-sm">
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="relative w-full max-w-lg rounded-2xl border border-border/50 bg-slate-950 p-6 shadow-glass backdrop-blur-glass overflow-y-auto max-h-[90vh]"
              >
                {/* Modal Close */}
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="absolute right-4 top-4 text-muted-foreground hover:text-primary-foreground"
                >
                  <X className="h-5 w-5" />
                </button>

                <div className="mb-6">
                  <h2 className="font-display text-base font-bold text-primary-foreground flex items-center gap-2">
                    <MessageSquare className="h-5 w-5 text-indigo-400" />
                    Share Your Testimony
                  </h2>
                  <p className="text-[11px] text-muted-foreground mt-0.5">
                    Write about what God has done in your life to encourage others.
                  </p>
                </div>

                <form onSubmit={handleSubmit(onCreateTestimony)} className="space-y-4">
                  {/* Title */}
                  <div>
                    <label htmlFor="title" className={labelClass}>Title</label>
                    <input
                      id="title"
                      type="text"
                      placeholder="Give your testimony a short title"
                      className={inputClass}
                      {...register("title", { required: "Title is required" })}
                    />
                    {errors.title && <p className="text-[10px] text-rose-400 mt-1">{errors.title.message}</p>}
                  </div>

                  <div className="grid gap-4 sm:grid-cols-2">
                    {/* Category */}
                    <div>
                      <label htmlFor="category" className={labelClass}>Category</label>
                      <select id="category" className={inputClass} {...register("category")}>
                        {CATEGORIES.filter((c) => c !== "all").map((cat) => (
                          <option key={cat} value={cat}>{cat}</option>
                        ))}
                      </select>
                    </div>

                    {/* Anonymous toggle */}
                    <div className="flex items-center gap-2.5 pt-5 select-none">
                      <input
                        id="is_anonymous"
                        type="checkbox"
                        className="rounded border-border/50 bg-card/60 text-indigo-500 focus:ring-0 focus:ring-offset-0 h-4 w-4"
                        {...register("is_anonymous")}
                      />
                      <label htmlFor="is_anonymous" className="text-xs text-muted-foreground font-medium">
                        Submit anonymously
                      </label>
                    </div>
                  </div>

                  {/* Author detail block if NOT anonymous */}
                  {!watchAnonymous && (
                    <div className="grid gap-4 sm:grid-cols-2 p-3 bg-card/20 rounded-xl border border-border/30">
                      <div>
                        <label htmlFor="author_name" className={labelClass}>Your Name</label>
                        <input
                          id="author_name"
                          type="text"
                          className={inputClass}
                          {...register("author_name", { required: !watchAnonymous && "Name is required" })}
                        />
                        {errors.author_name && <p className="text-[10px] text-rose-400 mt-1">{errors.author_name.message}</p>}
                      </div>
                      <div>
                        <label htmlFor="author_email" className={labelClass}>Email Address</label>
                        <input
                          id="author_email"
                          type="email"
                          className={inputClass}
                          {...register("author_email")}
                        />
                      </div>
                    </div>
                  )}

                  {/* Content */}
                  <div>
                    <label htmlFor="content" className={labelClass}>Testimony Story</label>
                    <textarea
                      id="content"
                      rows={5}
                      placeholder="Write your story here..."
                      className={cn(inputClass, "resize-none py-2")}
                      {...register("content", { required: "Testimony content is required" })}
                    />
                    {errors.content && <p className="text-[10px] text-rose-400 mt-1">{errors.content.message}</p>}
                  </div>

                  {/* Action buttons */}
                  <div className="flex justify-end gap-3 pt-3 border-t border-border/30">
                    <button
                      type="button"
                      onClick={() => setIsModalOpen(false)}
                      className="rounded-xl border border-border/50 bg-card/40 px-4 py-2 text-xs font-semibold text-muted-foreground hover:bg-slate-900 transition-colors"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      disabled={isSubmitting}
                      className="inline-flex items-center gap-1.5 rounded-xl bg-indigo-500 px-5 py-2.5 text-xs font-semibold text-white transition-all hover:bg-indigo-600 shadow-neon"
                    >
                      <span>Submit story</span>
                    </button>
                  </div>
                </form>
              </motion.div>
            </div>
          )}
        </AnimatePresence>

        {/* ----------------------------------------------------
            Testimony Detail Drawer / Modal
           ---------------------------------------------------- */}
        <AnimatePresence>
          {selectedTestimony && (
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-background/80 backdrop-blur-sm">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 20 }}
                className="relative w-full max-w-2xl rounded-2xl border border-border/50 bg-slate-950 p-6 shadow-glass backdrop-blur-glass overflow-y-auto max-h-[85vh] space-y-4"
              >
                <button
                  type="button"
                  onClick={() => setSelectedTestimony(null)}
                  className="absolute right-4 top-4 text-muted-foreground hover:text-primary-foreground"
                >
                  <X className="h-5 w-5" />
                </button>

                <div className="flex items-center gap-2">
                  <span className="rounded bg-indigo-500/10 px-2 py-0.5 text-[9px] font-bold text-indigo-400 uppercase tracking-wider">
                    {selectedTestimony.category}
                  </span>
                  <span className="text-[10px] text-muted-foreground flex items-center gap-1">
                    <Eye className="h-3.5 w-3.5 text-slate-500" />
                    {selectedTestimony.views} views
                  </span>
                </div>

                <h2 className="font-display text-lg font-bold text-primary-foreground leading-snug">
                  {selectedTestimony.title}
                </h2>

                <div className="p-4 bg-card/25 rounded-xl border border-border/30 text-xs text-slate-300 leading-relaxed font-mono whitespace-pre-wrap max-h-[40vh] overflow-y-auto">
                  {selectedTestimony.content}
                </div>

                {/* Rejection feedback in details view */}
                {selectedTestimony.status === "Rejected" && selectedTestimony.rejection_reason && (
                  <div className="p-3.5 bg-rose-500/10 rounded-xl border border-rose-500/20 text-xs text-rose-400 leading-relaxed">
                    <strong>Decline Reason:</strong> {selectedTestimony.rejection_reason}
                  </div>
                )}

                <div className="flex flex-wrap items-center justify-between gap-3 text-[10px] text-muted-foreground pt-2 border-t border-border/20">
                  <div className="flex items-center gap-1.5">
                    <div className="h-5 w-5 rounded-full bg-slate-800 flex items-center justify-center font-bold text-[9px] text-slate-400 uppercase">
                      {selectedTestimony.author_name.charAt(0)}
                    </div>
                    <span>Shared by: <strong className="text-slate-300">{selectedTestimony.author_name}</strong></span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Calendar className="h-3.5 w-3.5 text-slate-500" />
                    <span>Submitted on: {new Date(selectedTestimony.created_at).toLocaleDateString()}</span>
                  </div>
                </div>

                <div className="flex justify-end pt-2">
                  <button
                    type="button"
                    onClick={() => setSelectedTestimony(null)}
                    className="rounded-xl bg-indigo-500 px-4 py-2 text-xs font-semibold text-white transition-all hover:bg-indigo-600"
                  >
                    Close
                  </button>
                </div>
              </motion.div>
            </div>
          )}
        </AnimatePresence>
      </div>
    );
  }

  // ----------------------------------------------------
  // Pastor / Admin Moderation Dashboard View
  // ----------------------------------------------------
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
            <option value="Rejected">Rejected</option>
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
                          <div className="font-medium text-slate-200">
                            {testimony.author_name}
                            {testimony.is_anonymous && (
                              <span className="ml-1.5 rounded bg-slate-800 px-1.5 py-0.5 text-[8px] text-slate-400 font-mono">Anon</span>
                            )}
                          </div>
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
                              testimony.status === "Rejected" && "bg-rose-500/10 text-rose-400 border-rose-500/20",
                              testimony.status === "Archived" && "bg-slate-500/10 text-slate-400 border-slate-500/20"
                            )}
                          >
                            <span
                              className={cn(
                                "h-1 w-1 rounded-full",
                                testimony.status === "Approved" && "bg-emerald-400",
                                testimony.status === "Pending" && "bg-amber-400",
                                testimony.status === "Rejected" && "bg-rose-400",
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
                          {/* Approve option */}
                          {(testimony.status === "Pending" || testimony.status === "Rejected") && canApprove && (
                            <button
                              type="button"
                              onClick={() => approveTestimony(testimony.id)}
                              className="inline-flex h-7 items-center gap-1 rounded-lg bg-emerald-500/10 px-2.5 text-[10px] font-semibold text-emerald-400 border border-emerald-500/20 hover:bg-emerald-500/20 transition-all"
                            >
                              <CheckCircle className="h-3 w-3" />
                              <span>Approve</span>
                            </button>
                          )}

                          {/* Decline/Reject option */}
                          {(testimony.status === "Pending" || testimony.status === "Approved") && canApprove && (
                            <button
                              type="button"
                              onClick={() => {
                                setRejectingId(testimony.id);
                                setDeclineReason("");
                              }}
                              className="inline-flex h-7 items-center gap-1 rounded-lg bg-slate-800 px-2.5 text-[10px] font-semibold text-muted-foreground border border-border/40 hover:text-rose-400 hover:bg-rose-500/10 hover:border-rose-500/20 transition-all"
                            >
                              <Archive className="h-3 w-3" />
                              <span>Decline</span>
                            </button>
                          )}

                          {/* Archive option */}
                          {testimony.status !== "Archived" && canApprove && (
                            <button
                              type="button"
                              onClick={() => archiveTestimony(testimony.id)}
                              className="inline-flex h-7 items-center gap-1 rounded-lg bg-slate-800 px-2.5 text-[10px] font-semibold text-muted-foreground border border-border/40 hover:text-slate-200 hover:bg-slate-700 transition-all"
                            >
                              <Archive className="h-3 w-3 text-slate-500" />
                              <span>Archive</span>
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
                              <Star className="h-3.5 w-3.5 text-amber-400 fill-amber-400 shrink-0" />
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

      {/* Decline Dialog Modal */}
      <AnimatePresence>
        {rejectingId && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-background/80 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="relative w-full max-w-md rounded-2xl border border-border/50 bg-slate-950 p-6 shadow-glass backdrop-blur-glass"
            >
              <h3 className="font-display text-sm font-bold text-primary-foreground mb-2">
                Decline Testimony
              </h3>
              <p className="text-xs text-muted-foreground mb-4">
                Please provide an optional reason for declining this testimony. The author will be able to view this feedback.
              </p>
              <textarea
                value={declineReason}
                onChange={(e) => setDeclineReason(e.target.value)}
                placeholder="e.g., Needs more detail or does not meet community guidelines..."
                rows={4}
                className="w-full rounded-xl border border-border/50 bg-card/60 p-3 text-xs text-primary-foreground placeholder:text-muted-foreground/50 focus:outline-none focus:border-indigo-500"
              />
              <div className="flex justify-end gap-3 mt-4">
                <button
                  type="button"
                  onClick={() => {
                    setRejectingId(null);
                    setDeclineReason("");
                  }}
                  className="rounded-xl border border-border/50 bg-card/40 px-4 py-2 text-xs font-semibold text-muted-foreground hover:bg-slate-900 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={async () => {
                    try {
                      await rejectTestimony(rejectingId, declineReason);
                      toast.success("Testimony declined successfully.");
                      setRejectingId(null);
                      setDeclineReason("");
                    } catch (err) {
                      toast.error("Failed to decline testimony.");
                    }
                  }}
                  className="rounded-xl bg-rose-500 px-4 py-2 text-xs font-semibold text-white hover:bg-rose-600 transition-all"
                >
                  Confirm Decline
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
