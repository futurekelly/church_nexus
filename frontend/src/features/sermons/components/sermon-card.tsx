"use client";

import Link from "next/link";
import { BookOpen, Calendar, User, ArrowRight, Pencil, Star } from "lucide-react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import { SermonStatusBadge } from "./sermon-status-badge";
import type { Sermon } from "../types/sermon.types";

interface SermonCardProps {
  sermon: Sermon;
  canEdit?: boolean;
  isDashboard?: boolean;
}

export function SermonCard({ sermon, canEdit = false, isDashboard = true }: SermonCardProps) {
  const sermonDate = new Date(sermon.sermon_date);
  const formattedDate = sermonDate.toLocaleDateString(undefined, {
    month: "short",
    day: "numeric",
    year: "numeric",
  });

  // Target route based on whether we are in the dashboard or public list (in this context, it's dashboard/sermons)
  const detailHref = `/dashboard/sermons/${sermon.id}`;
  const editHref = `/dashboard/sermons/${sermon.id}/edit`;

  return (
    <motion.div
      layout
      className={cn(
        "group relative overflow-hidden rounded-2xl border border-border/50 bg-card/60 backdrop-blur-glass",
        "flex flex-col h-full shadow-glass hover:border-indigo-500/50 hover:shadow-[0_0_24px_rgba(99,102,241,0.15)]",
        "transition-all duration-300"
      )}
    >
      {/* Sermon Cover Image / Gradient */}
      <div className="relative h-44 w-full overflow-hidden">
        {/* If thumbnail is an SVG gradient representation, we render it directly as a styled div if it starts with 'bg-' or as an img tag */}
        {sermon.thumbnail.startsWith("data:image/svg+xml") ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={sermon.thumbnail}
            alt={sermon.title}
            className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
            loading="lazy"
          />
        ) : (
          <div
            className={cn(
              "h-full w-full transition-transform duration-500 group-hover:scale-105",
              sermon.thumbnail || "bg-gradient-to-br from-indigo-900 to-slate-950"
            )}
          />
        )}

        {/* Category Badge */}
        <div className="absolute left-3 top-3 rounded-full bg-slate-950/80 px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider text-indigo-400 backdrop-blur-sm border border-border/20">
          {sermon.category}
        </div>

        {/* Featured & Status Badges */}
        <div className="absolute right-3 top-3 flex items-center gap-1.5">
          {sermon.featured && (
            <span
              className="inline-flex items-center gap-1 rounded-full bg-amber-500/20 px-2 py-0.5 text-[10px] font-bold uppercase text-amber-400 border border-amber-500/30 backdrop-blur-sm shadow-[0_0_12px_rgba(245,158,11,0.2)]"
              title="Featured Sermon"
            >
              <Star className="h-3 w-3 fill-amber-400" />
              Featured
            </span>
          )}
          {isDashboard && <SermonStatusBadge status={sermon.status} size="sm" />}
        </div>
      </div>

      {/* Card Body */}
      <div className="flex flex-1 flex-col p-5 space-y-4">
        <div className="space-y-1">
          {/* Date & Speaker Row */}
          <div className="flex flex-wrap items-center gap-3 text-xs text-indigo-400 font-semibold">
            <div className="flex items-center gap-1">
              <Calendar className="h-3.5 w-3.5" />
              <span>{formattedDate}</span>
            </div>
            <span className="text-muted-foreground/30">•</span>
            <div className="flex items-center gap-1">
              <User className="h-3.5 w-3.5" />
              <span>{sermon.speaker}</span>
            </div>
          </div>

          <h3 className="text-base font-bold text-primary-foreground group-hover:text-indigo-400 transition-colors line-clamp-1 mt-1">
            {sermon.title}
          </h3>
          <p className="text-xs text-muted-foreground line-clamp-2 mt-1 min-h-[32px]">
            {sermon.description}
          </p>
        </div>

        {/* Scripture Reference */}
        <div className="space-y-2 text-xs text-muted-foreground border-t border-border/10 pt-3">
          <div className="flex items-center gap-1.5 min-w-0">
            <BookOpen className="h-3.5 w-3.5 text-indigo-400 shrink-0" />
            <span className="font-medium truncate">{sermon.scripture_reference}</span>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="flex items-center justify-between pt-2 mt-auto border-t border-border/10">
          <Link
            href={detailHref}
            className="inline-flex items-center gap-1 text-xs font-bold text-primary hover:text-primary/80 transition-colors"
          >
            Watch & Listen <ArrowRight className="h-3.5 w-3.5" />
          </Link>

          {canEdit && isDashboard && (
            <Link
              href={editHref}
              className="inline-flex h-7 w-7 items-center justify-center rounded-lg border border-border/50 bg-card hover:bg-indigo-500/10 text-muted-foreground hover:text-indigo-400 transition-colors"
              title="Edit sermon"
            >
              <Pencil className="h-3.5 w-3.5" />
            </Link>
          )}
        </div>
      </div>
    </motion.div>
  );
}
