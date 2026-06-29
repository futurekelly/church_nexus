"use client";

import { useState } from "react";
import { useParams, useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { motion } from "framer-motion";
import { CathedralCrossLoader } from "@/components/ui/cathedral-cross-loader";
import {
  ArrowLeft,
  Calendar,
  BookOpen,
  User,
  Tags,
  AlertTriangle,
  Compass,
  Download,
} from "lucide-react";
import { PublicNavbar } from "@/features/landing/components/public-navbar";
import { PublicFooter } from "@/features/landing/components/public-footer";
import {
  useSermons,
  SermonMediaPlayer,
  SermonNotesViewer,
  SermonDownloadModal,
  SERMON_CATEGORY_LABELS,
} from "@/features/sermons";

export default function PublicSermonDetailPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const searchParams = useSearchParams();
  const tabParam = searchParams.get("tab");
  const [isDownloadOpen, setIsDownloadOpen] = useState(false);

  const { getSermonById, isLoading } = useSermons();
  const sermon = getSermonById(id);

  // Verification: Sermons must exist and be Published to be visible publicly
  const isSermonVisible = sermon && sermon.status === "Published";

  if (isLoading && !sermon) {
    return (
      <div className="flex min-h-screen flex-col bg-slate-950 text-slate-100">
        <PublicNavbar />
        <main className="flex-grow flex items-center justify-center py-24">
          <CathedralCrossLoader text="Loading Broadcast..." />
        </main>
        <PublicFooter />
      </div>
    );
  }

  if (!isSermonVisible) {
    return (
      <div className="flex min-h-screen flex-col bg-slate-950 text-slate-100">
        <PublicNavbar />
        <main className="flex-grow flex flex-col items-center justify-center py-24 text-center px-4">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-slate-800 text-muted-foreground mb-4">
            <AlertTriangle className="h-6 w-6" />
          </div>
          <p className="text-lg font-semibold text-white">
            Sermon not found
          </p>
          <p className="mt-2 text-sm text-muted-foreground">
            The sermon message you are looking for does not exist, is in draft state, or has been archived.
          </p>
          <button
            type="button"
            onClick={() => router.push("/sermons")}
            className="mt-6 rounded-xl bg-indigo-500/15 px-4 py-2 text-sm font-semibold text-indigo-400 hover:bg-indigo-500/25 transition-all"
          >
            Back to Catalog
          </button>
        </main>
        <PublicFooter />
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
    <div className="flex min-h-screen flex-col bg-slate-950 text-slate-100">
      <PublicNavbar />

      <main className="flex-grow px-4 py-8 lg:px-8">
        <div className="mx-auto max-w-7xl space-y-6">
          
          {/* Back button & Title Header */}
          <motion.div
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.35 }}
            className="flex items-center justify-between gap-3 w-full"
          >
            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={() => router.push("/sermons")}
                className="flex h-9 w-9 items-center justify-center rounded-xl border border-border/50 bg-card/60 text-muted-foreground transition-all hover:border-border/80 hover:text-primary-foreground"
                aria-label="Go back to sermons catalog"
              >
                <ArrowLeft className="h-4 w-4" aria-hidden="true" />
              </button>
              <div>
                <h1 className="font-display text-xl font-bold text-white truncate max-w-md">
                  {sermon.title}
                </h1>
                <p className="text-xs text-indigo-400 font-semibold mt-0.5">
                  {SERMON_CATEGORY_LABELS[sermon.category]}
                </p>
              </div>
            </div>

            <button
              type="button"
              onClick={() => setIsDownloadOpen(true)}
              className="flex items-center gap-2 rounded-xl border border-indigo-500/30 bg-indigo-500/10 px-4 py-2 text-xs font-bold text-indigo-300 transition-all hover:bg-indigo-500/20 hover:text-white"
            >
              <Download className="h-4 w-4 text-indigo-400" />
              Download Media
            </button>
          </motion.div>

          <SermonDownloadModal
            isOpen={isDownloadOpen}
            onClose={() => setIsDownloadOpen(false)}
            title={sermon.title}
            videoUrl={sermon.video_url}
            audioUrl={sermon.audio_url}
            notes={sermon.notes}
          />

          {/* Main Grid Content */}
          <div className="grid gap-6 lg:grid-cols-3">
            {/* Left Column - Media Player & Details */}
            <div className="lg:col-span-2 space-y-6">
              <SermonMediaPlayer
                videoUrl={sermon.video_url}
                audioUrl={sermon.audio_url}
                thumbnail={sermon.thumbnail}
                hlsUrl={sermon.hls_url}
                initialTab={mediaTab}
              />

              {/* Overview Card */}
              <div className="rounded-2xl border border-border/50 bg-card/60 p-6 backdrop-blur-glass shadow-glass space-y-5">
                <div className="space-y-2">
                  <h3 className="text-base font-bold text-white">Sermon Overview</h3>
                  <p className="text-sm text-muted-foreground leading-relaxed">
                    {sermon.description}
                  </p>
                </div>

                {/* Metadata details */}
                <div className="grid gap-4 sm:grid-cols-2 border-t border-border/10 pt-5 text-sm">
                  <div className="space-y-3">
                    <div className="flex items-center gap-2.5">
                      <User className="h-4 w-4 text-indigo-400 shrink-0" />
                      <span className="text-muted-foreground">Preacher:</span>
                      <span className="font-semibold text-white">{sermon.speaker}</span>
                    </div>

                    <div className="flex items-center gap-2.5">
                      <BookOpen className="h-4 w-4 text-indigo-400 shrink-0" />
                      <span className="text-muted-foreground">Scripture Reference:</span>
                      <span className="font-semibold text-white">{sermon.scripture_reference}</span>
                    </div>
                  </div>

                  <div className="space-y-3">
                    <div className="flex items-center gap-2.5">
                      <Calendar className="h-4 w-4 text-indigo-400 shrink-0" />
                      <span className="text-muted-foreground">Preach Date:</span>
                      <span className="font-semibold text-white">{preachDate}</span>
                    </div>

                    <div className="flex items-center gap-2.5">
                      <Compass className="h-4 w-4 text-indigo-400 shrink-0" />
                      <span className="text-muted-foreground">Category:</span>
                      <span className="font-semibold text-white">{sermon.category}</span>
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

            {/* Right Column - Study Notes */}
            <div className="lg:col-span-1">
              <SermonNotesViewer
                notes={sermon.notes}
                title={sermon.title}
                scripture={sermon.scripture_reference}
              />
            </div>
          </div>

        </div>
      </main>

      <PublicFooter />
    </div>
  );
}
