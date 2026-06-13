"use client";

import Link from "next/link";
import { Play, Headset, BookOpen, User } from "lucide-react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import { SERMON_CATEGORY_LABELS, type Sermon } from "../types/sermon.types";

interface SermonFeaturedHeroProps {
  sermon: Sermon | null;
}

export function SermonFeaturedHero({ sermon }: SermonFeaturedHeroProps) {
  if (!sermon) return null;

  const sermonDate = new Date(sermon.sermon_date).toLocaleDateString(undefined, {
    month: "long",
    day: "numeric",
    year: "numeric",
  });

  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className={cn(
        "group relative overflow-hidden rounded-3xl border border-border/50 bg-card/40 backdrop-blur-glass shadow-glass",
        "flex flex-col md:flex-row min-h-[320px] md:h-[350px] w-full"
      )}
    >
      {/* Background radial highlight */}
      <div
        className="pointer-events-none absolute inset-0 opacity-0 transition-opacity duration-500 group-hover:opacity-100"
        aria-hidden="true"
        style={{
          background:
            "radial-gradient(circle at 70% 30%, rgba(99,102,241,0.08) 0%, transparent 60%)",
        }}
      />

      {/* Thumbnail Block */}
      <div className="relative w-full md:w-2/5 h-48 md:h-full overflow-hidden shrink-0">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={sermon.thumbnail}
          alt={sermon.title}
          className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-105"
          loading="eager"
        />
        <div className="absolute inset-0 bg-gradient-to-t md:bg-gradient-to-r from-slate-950/90 via-slate-950/40 to-transparent" />
        
        {/* Featured Tag */}
        <div className="absolute left-4 top-4 rounded-full bg-indigo-500 px-3 py-1 text-[10px] font-extrabold uppercase tracking-widest text-white shadow-[0_0_12px_rgba(99,102,241,0.5)]">
          Featured Sermon
        </div>
      </div>

      {/* Details Block */}
      <div className="flex flex-1 flex-col justify-between p-6 md:p-8">
        <div className="space-y-3">
          <div className="flex flex-wrap items-center gap-3 text-xs text-indigo-400 font-bold">
            <span className="rounded-full bg-indigo-500/10 px-2 py-0.5 border border-indigo-500/20">
              {SERMON_CATEGORY_LABELS[sermon.category]}
            </span>
            <span>•</span>
            <span>{sermonDate}</span>
          </div>

          <h2 className="text-xl md:text-2xl font-extrabold text-primary-foreground group-hover:text-indigo-400 transition-colors leading-tight">
            {sermon.title}
          </h2>

          <p className="text-xs md:text-sm text-muted-foreground leading-relaxed line-clamp-3 md:line-clamp-4 max-w-2xl">
            {sermon.description}
          </p>

          <div className="flex flex-wrap gap-x-4 gap-y-1.5 text-xs text-muted-foreground pt-1">
            <div className="flex items-center gap-1.5">
              <User className="h-3.5 w-3.5 text-indigo-400" />
              <span>Speaker: <span className="font-bold text-primary-foreground">{sermon.speaker}</span></span>
            </div>
            <div className="flex items-center gap-1.5">
              <BookOpen className="h-3.5 w-3.5 text-indigo-400" />
              <span>Scripture: <span className="font-bold text-primary-foreground">{sermon.scripture_reference}</span></span>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-wrap items-center gap-4 mt-6 md:mt-0">
          <Link
            href={`/dashboard/sermons/${sermon.id}?tab=video`}
            className={cn(
              "inline-flex items-center gap-1.5 rounded-xl bg-indigo-600 px-5 py-2.5 text-xs font-bold text-white transition-all",
              "hover:bg-indigo-500 shadow-[0_0_12px_rgba(99,102,241,0.3)] hover:shadow-[0_0_18px_rgba(99,102,241,0.5)]"
            )}
          >
            <Play className="h-3.5 w-3.5 fill-current" />
            Watch Video
          </Link>
          <Link
            href={`/dashboard/sermons/${sermon.id}?tab=audio`}
            className={cn(
              "inline-flex items-center gap-1.5 rounded-xl border border-border/50 bg-card/60 px-5 py-2.5 text-xs font-bold text-muted-foreground transition-all",
              "hover:border-indigo-500/40 hover:bg-indigo-500/10 hover:text-indigo-400"
            )}
          >
            <Headset className="h-3.5 w-3.5" />
            Listen Audio
          </Link>
          <Link
            href={`/dashboard/sermons/${sermon.id}?tab=notes`}
            className="text-xs font-semibold text-muted-foreground hover:text-primary-foreground transition-colors ml-auto md:ml-0"
          >
            View Notes &rarr;
          </Link>
        </div>
      </div>
    </motion.div>
  );
}
