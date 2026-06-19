"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Calendar, Eye, Star, User, Quote, ChevronDown, ChevronUp } from "lucide-react";
import type { Testimony } from "../types/testimonies.types";
import { cn } from "@/lib/utils";

interface TestimonyCardProps {
  testimony: Testimony;
  onReadMore?: (id: string) => void;
}

export function TestimonyCard({ testimony, onReadMore }: TestimonyCardProps) {
  const [isExpanded, setIsExpanded] = useState(false);

  const formattedDate = new Date(testimony.created_at).toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });

  const handleToggleExpand = () => {
    if (!isExpanded && onReadMore) {
      onReadMore(testimony.id);
    }
    setIsExpanded(!isExpanded);
  };

  return (
    <motion.div
      layout
      className={cn(
        "relative flex flex-col justify-between rounded-2xl border bg-card/60 p-6 backdrop-blur-glass transition-all duration-300 shadow-glass",
        testimony.is_featured
          ? "border-amber-500/30 bg-gradient-to-br from-amber-500/5 to-transparent shadow-[0_0_12px_rgba(245,158,11,0.05)]"
          : "border-border/50 hover:border-indigo-500/30"
      )}
    >
      {/* Featured Badge */}
      {testimony.is_featured && (
        <div className="absolute right-4 top-4 flex items-center gap-1 rounded-full bg-amber-500/15 px-2.5 py-0.5 text-[10px] font-semibold text-amber-400 border border-amber-500/20 shadow-[0_0_8px_rgba(245,158,11,0.1)]">
          <Star className="h-3 w-3 fill-amber-400" />
          <span>Featured Testimony</span>
        </div>
      )}

      <div className="space-y-4">
        {/* Category & Date */}
        <div className="flex items-center gap-2">
          <span className="rounded-lg bg-indigo-500/10 px-2.5 py-1 text-xs font-semibold text-indigo-400 border border-indigo-500/20">
            {testimony.category}
          </span>
          <span className="text-[11px] text-muted-foreground flex items-center gap-1">
            <Calendar className="h-3 w-3" />
            {formattedDate}
          </span>
        </div>

        {/* Title */}
        <h3 className="font-display text-lg font-bold text-primary-foreground leading-snug">
          {testimony.title}
        </h3>

        {/* Content with Quote Marks */}
        <div className="relative">
          <Quote className="absolute -left-2 -top-2 h-8 w-8 opacity-5 text-indigo-400 rotate-180" />
          <p
            className={cn(
              "text-sm text-muted-foreground leading-relaxed pl-4 whitespace-pre-line",
              !isExpanded && "line-clamp-3"
            )}
          >
            {testimony.content}
          </p>
        </div>
      </div>

      {/* Card Footer Actions */}
      <div className="mt-6 border-t border-border/30 pt-4 flex items-center justify-between text-xs">
        {/* Author Name */}
        <div className="flex items-center gap-1.5 text-slate-300 font-medium">
          <div className="flex h-6 w-6 items-center justify-center rounded-full bg-slate-800 text-slate-400">
            <User className="h-3.5 w-3.5" />
          </div>
          <span>{testimony.author_name}</span>
        </div>

        {/* Views & Read More */}
        <div className="flex items-center gap-4">
          <span className="text-[11px] text-muted-foreground flex items-center gap-1">
            <Eye className="h-3.5 w-3.5 text-slate-400" />
            {testimony.views} views
          </span>

          <button
            type="button"
            onClick={handleToggleExpand}
            className="flex items-center gap-1 font-semibold text-indigo-400 hover:text-indigo-300 transition-colors"
          >
            <span>{isExpanded ? "Collapse" : "Read Full Story"}</span>
            {isExpanded ? <ChevronUp className="h-3.5 w-3.5" /> : <ChevronDown className="h-3.5 w-3.5" />}
          </button>
        </div>
      </div>
    </motion.div>
  );
}
