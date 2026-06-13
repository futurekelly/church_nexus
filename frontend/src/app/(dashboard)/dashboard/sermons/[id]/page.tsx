"use client";

import { useParams, useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { motion } from "framer-motion";
import {
  ArrowLeft,
  Calendar,
  BookOpen,
  User,
  Tags,
  AlertTriangle,
  Pencil,
  Lock,
  Compass,
} from "lucide-react";
import {
  useSermons,
  useSermonPermissions,
  SermonMediaPlayer,
  SermonNotesViewer,
  SermonStatusBadge,
  SERMON_CATEGORY_LABELS,
} from "@/features/sermons";
import { cn } from "@/lib/utils";

export default function SermonDetailPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const searchParams = useSearchParams();
  const tabParam = searchParams.get("tab");
  
  const { getSermonById } = useSermons();
  const { canEdit, canViewLibrary } = useSermonPermissions();

  const sermon = getSermonById(id);

  if (!sermon) {
    return (
      <div className="flex flex-col items-center justify-center py-24 text-center">
        <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-slate-800 text-muted-foreground mb-4">
          <AlertTriangle className="h-6 w-6" />
        </div>
        <p className="text-lg font-semibold text-primary-foreground">
          Sermon not found
        </p>
        <p className="mt-2 text-sm text-muted-foreground">
          The sermon message you are looking for does not exist or has been archived.
        </p>
        <button
          type="button"
          onClick={() => router.back()}
          className="mt-6 rounded-xl bg-indigo-500/15 px-4 py-2 text-sm font-semibold text-indigo-400 hover:bg-indigo-500/25 transition-all"
        >
          Go Back
        </button>
      </div>
    );
  }

  // Permission check: Visitors can only see public featured sermons
  const isFeatured = sermon.featured && sermon.status === "Published";
  const isAllowedToView = canViewLibrary || isFeatured;

  if (!isAllowedToView) {
    return (
      <div className="relative overflow-hidden rounded-3xl border border-border/40 bg-slate-950/80 p-8 md:p-12 text-center backdrop-blur-md max-w-2xl mx-auto my-12">
        <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 mb-6">
          <Lock className="h-6 w-6" />
        </div>
        <h4 className="text-lg font-bold text-primary-foreground mb-2">Restricted Access</h4>
        <p className="text-sm text-muted-foreground mb-6 leading-relaxed">
          You are trying to access a sermon from our member-only library. Visitors are restricted to watching public featured messages. Please log in or register for a member account to unlock the full database.
        </p>
        <div className="flex justify-center gap-4">
          <Link
            href="/login"
            className="inline-flex items-center justify-center rounded-xl bg-indigo-600 px-6 py-2.5 text-xs font-bold text-white transition-all hover:bg-indigo-500 shadow-[0_0_12px_rgba(99,102,241,0.3)]"
          >
            Sign In
          </Link>
          <button
            onClick={() => router.push("/dashboard/sermons")}
            className="inline-flex items-center justify-center rounded-xl border border-border/50 bg-card/60 px-6 py-2.5 text-xs font-bold text-muted-foreground transition-all hover:border-indigo-500/40 hover:text-indigo-400"
          >
            Back to Library
          </button>
        </div>
      </div>
    );
  }

  const preachDate = new Date(sermon.sermon_date).toLocaleDateString(undefined, {
    weekday: "long",
    month: "long",
    day: "numeric",
    year: "numeric",
  });

  const mediaTab = tabParam === "audio" ? "audio" : "video";

  return (
    <div className="space-y-6">
      {/* Back button & header */}
      <motion.div
        initial={{ opacity: 0, y: -8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.35 }}
        className="flex flex-wrap items-center justify-between gap-4"
      >
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => router.push("/dashboard/sermons")}
            className="flex h-9 w-9 items-center justify-center rounded-xl border border-border/50 bg-card/60 text-muted-foreground transition-all hover:border-border/80 hover:text-primary-foreground"
            aria-label="Go back to sermons list"
          >
            <ArrowLeft className="h-4 w-4" aria-hidden="true" />
          </button>
          <div>
            <h1 className="font-display text-xl font-bold text-primary-foreground truncate max-w-md">
              {sermon.title}
            </h1>
            <div className="flex items-center gap-2 mt-1">
              <span className="text-xs text-indigo-400 font-semibold">
                {SERMON_CATEGORY_LABELS[sermon.category]}
              </span>
              <span className="h-1 w-1 rounded-full bg-border" />
              <SermonStatusBadge status={sermon.status} size="sm" />
            </div>
          </div>
        </div>

        <div className="flex items-center gap-3">
          {canEdit && (
            <Link
              href={`/dashboard/sermons/${sermon.id}/edit`}
              className="flex items-center gap-2 rounded-xl bg-indigo-600 px-4 py-2 text-sm font-semibold text-white transition-all hover:bg-indigo-500 shadow-[0_0_12px_rgba(99,102,241,0.3)]"
              aria-label="Edit Sermon"
            >
              <Pencil className="h-4 w-4" />
              Edit Sermon
            </Link>
          )}
        </div>
      </motion.div>

      {/* Main details page content */}
      <div className="grid gap-6 lg:grid-cols-3">
        {/* Left Column (2/3) - Media Player & Overview */}
        <div className="lg:col-span-2 space-y-6">
          <SermonMediaPlayer
            videoUrl={sermon.video_url}
            audioUrl={sermon.audio_url}
            thumbnail={sermon.thumbnail}
            initialTab={mediaTab}
          />

          {/* Details Overview Card */}
          <div className="rounded-2xl border border-border/50 bg-card/60 p-6 backdrop-blur-glass shadow-glass space-y-5">
            <div className="space-y-2">
              <h3 className="text-base font-bold text-primary-foreground">Sermon Overview</h3>
              <p className="text-sm text-muted-foreground leading-relaxed">
                {sermon.description}
              </p>
            </div>

            {/* Structured details meta info */}
            <div className="grid gap-4 sm:grid-cols-2 border-t border-border/10 pt-5 text-sm">
              <div className="space-y-3">
                <div className="flex items-center gap-2.5">
                  <User className="h-4 w-4 text-indigo-400 shrink-0" />
                  <span className="text-muted-foreground">Preacher:</span>
                  <span className="font-semibold text-primary-foreground">{sermon.speaker}</span>
                </div>

                <div className="flex items-center gap-2.5">
                  <BookOpen className="h-4 w-4 text-indigo-400 shrink-0" />
                  <span className="text-muted-foreground">Scripture Passage:</span>
                  <span className="font-semibold text-primary-foreground">{sermon.scripture_reference}</span>
                </div>
              </div>

              <div className="space-y-3">
                <div className="flex items-center gap-2.5">
                  <Calendar className="h-4 w-4 text-indigo-400 shrink-0" />
                  <span className="text-muted-foreground">Preach Date:</span>
                  <span className="font-semibold text-primary-foreground">{preachDate}</span>
                </div>

                <div className="flex items-center gap-2.5">
                  <Compass className="h-4 w-4 text-indigo-400 shrink-0" />
                  <span className="text-muted-foreground">Category:</span>
                  <span className="font-semibold text-primary-foreground">{sermon.category}</span>
                </div>
              </div>
            </div>

            {/* Tags row */}
            {sermon.tags.length > 0 && (
              <div className="flex flex-wrap items-center gap-2 border-t border-border/10 pt-4 text-xs">
                <Tags className="h-4 w-4 text-indigo-400 shrink-0" />
                <span className="text-muted-foreground mr-1">Tags:</span>
                {sermon.tags.map((tag) => (
                  <span
                    key={tag}
                    className="rounded-lg bg-indigo-500/5 border border-border/50 px-2 py-1 text-slate-300 font-medium"
                  >
                    {tag}
                  </span>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Right Column (1/3) - Study Guide Notes */}
        <div className="lg:col-span-1">
          <SermonNotesViewer
            notes={sermon.notes}
            title={sermon.title}
            scripture={sermon.scripture_reference}
          />
        </div>
      </div>
    </div>
  );
}
