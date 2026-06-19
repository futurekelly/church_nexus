"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { MessageSquare, Plus, Search, Filter, HelpCircle } from "lucide-react";
import { useTestimonies } from "@/features/testimonies";
import { TestimonyCard } from "@/features/testimonies/components/testimony-card";
import type { TestimonyCategory } from "@/features/testimonies";

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

export default function PublicTestimoniesWallPage() {
  const { testimonies, incrementViews } = useTestimonies();
  const [search, setSearch] = useState("");
  const [categoryFilter, setCategoryFilter] = useState<TestimonyCategory | "all">("all");

  const approvedTestimonies = useMemo(() => {
    return testimonies.filter((t) => t.status === "Approved");
  }, [testimonies]);

  const filteredTestimonies = useMemo(() => {
    let result = [...approvedTestimonies];

    // Filter by search
    if (search) {
      const q = search.toLowerCase();
      result = result.filter(
        (t) =>
          t.title.toLowerCase().includes(q) ||
          t.content.toLowerCase().includes(q) ||
          t.author_name.toLowerCase().includes(q)
      );
    }

    // Filter by category
    if (categoryFilter !== "all") {
      result = result.filter((t) => t.category === categoryFilter);
    }

    // Sort by Featured first, then newest first
    result.sort((a, b) => {
      if (a.is_featured && !b.is_featured) return -1;
      if (!a.is_featured && b.is_featured) return 1;
      return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
    });

    return result;
  }, [approvedTestimonies, search, categoryFilter]);

  const handleReadMore = (id: string) => {
    incrementViews(id);
  };

  return (
    <div className="space-y-8 max-w-6xl mx-auto px-4 py-8">
      {/* Hero / Header Section */}
      <div className="text-center max-w-2xl mx-auto space-y-4">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.4 }}
          className="inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-indigo-500/10 border border-indigo-500/20 text-indigo-400"
        >
          <MessageSquare className="h-6 w-6" />
        </motion.div>
        <h1 className="font-display text-3xl font-extrabold text-primary-foreground sm:text-4xl">
          Public Testimonies Wall
        </h1>
        <p className="text-sm text-muted-foreground leading-relaxed">
          Praise reports and stories of God's goodness, healing, and restoration in the lives of our church family.
        </p>
        <div className="pt-2">
          <Link
            href="/submit-testimony"
            className="inline-flex items-center gap-2 rounded-xl bg-indigo-500 px-5 py-2.5 text-sm font-semibold text-white transition-all hover:bg-indigo-600 shadow-[0_0_12px_rgba(99,102,241,0.2)]"
          >
            <Plus className="h-4 w-4" />
            <span>Share Your Testimony</span>
          </Link>
        </div>
      </div>

      {/* Filters & Search Row */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between border-b border-border/20 pb-6">
        {/* Search */}
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <input
            type="text"
            placeholder="Search stories..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full rounded-xl border border-border/50 bg-card/40 py-2.5 pl-10 pr-4 text-sm text-primary-foreground placeholder:text-muted-foreground/50 focus:border-indigo-500/50 focus:outline-none"
          />
        </div>

        {/* Category Filter dropdown/scroller */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-thin">
          <Filter className="h-4 w-4 text-muted-foreground shrink-0" />
          <div className="flex items-center gap-1.5">
            {CATEGORIES.map((cat) => (
              <button
                key={cat}
                type="button"
                onClick={() => setCategoryFilter(cat)}
                className={`rounded-lg px-3 py-1.5 text-xs font-semibold border transition-all shrink-0 ${
                  categoryFilter === cat
                    ? "bg-indigo-500/15 text-indigo-400 border-indigo-500/30"
                    : "bg-card/40 text-muted-foreground border-border/40 hover:text-primary-foreground"
                }`}
              >
                {cat === "all" ? "All Categories" : cat}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Testimonies Grid */}
      {filteredTestimonies.length > 0 ? (
        <motion.div
          layout
          className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 items-start"
        >
          <AnimatePresence mode="popLayout">
            {filteredTestimonies.map((testimony) => (
              <TestimonyCard
                key={testimony.id}
                testimony={testimony}
                onReadMore={handleReadMore}
              />
            ))}
          </AnimatePresence>
        </motion.div>
      ) : (
        <div className="flex flex-col items-center justify-center py-20 text-center select-none border border-dashed border-border/40 rounded-2xl bg-card/10">
          <HelpCircle className="h-10 w-10 text-muted-foreground mb-3" />
          <h3 className="text-base font-bold text-primary-foreground font-display">No Testimonies Found</h3>
          <p className="text-xs text-muted-foreground mt-1 max-w-xs leading-normal">
            No testimonies match the selected filters or search terms. Try adjusting your search query.
          </p>
        </div>
      )}
    </div>
  );
}
