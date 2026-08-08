"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { motion } from "framer-motion";
import { apiGet, isApiError } from "@/services/api-client";
import type { Sermon } from "@/features/sermons/types/sermon.types";
import { CathedralCrossLoader } from "@/components/ui/cathedral-cross-loader";
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
  Download,
  Trash2,
} from "lucide-react";
import {
  useSermons,
  SermonNotesViewer,
  SermonStatusBadge,
  SermonDownloadModal,
  SERMON_CATEGORY_LABELS,
} from "@/features/sermons";
import dynamic from "next/dynamic";

const SermonMediaPlayer = dynamic(
  () =>
    import("@/features/sermons/components/sermon-media-player").then(
      (mod) => mod.SermonMediaPlayer
    ),
  {
    ssr: false,
    loading: () => (
      <div className="aspect-video w-full rounded-2xl bg-slate-900/60 animate-pulse flex items-center justify-center border border-border/40">
        <span className="text-xs text-muted-foreground">Preparing player media...</span>
      </div>
    ),
  }
);
import { useAppPermissions } from "@/hooks/use-app-permissions";
import { cn } from "@/lib/utils";

export default function SermonDetailPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const searchParams = useSearchParams();
  const tabParam = searchParams.get("tab");
  const [isDownloadOpen, setIsDownloadOpen] = useState(false);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  
  const { deleteSermon } = useSermons();
  const { sermons: sermonPermissions } = useAppPermissions();
  const { canEdit, canDelete, canViewLibrary } = sermonPermissions;

  // Directly fetch sermon by ID so newly created/edited/cross-branch sermons always display
  const [sermon, setSermon] = useState<Sermon | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!id) return;
    setIsLoading(true);
    apiGet<any>(`/api/sermons/${id}/`)
      .then((res) => {
        if (!isApiError(res) && res.data) {
          setSermon({
            id: res.data.id,
            title: res.data.title,
            description: res.data.description || "",
            scripture_reference: res.data.scripture_reference || "",
            sermon_date: res.data.sermon_date,
            status: res.data.status,
            thumbnail: res.data.thumbnail || "",
            video_url: res.data.video_url || res.data.video_file || "",
            audio_url: res.data.audio_url || res.data.audio_file || "",
            hls_url: res.data.hls_url || "",
            speaker: res.data.speaker,
            category: res.data.category,
            featured: res.data.featured,
            views_count: res.data.views_count || 0,
            part_number: res.data.part_number || null,
            series: res.data.series || null,
            series_details: res.data.series_details || null,
            notes: res.data.notes || "",
            tags: res.data.tags || [],
            created_at: res.data.created_at,
            updated_at: res.data.updated_at,
          });
        } else {
          setSermon(null);
        }
      })
      .catch(() => setSermon(null))
      .finally(() => setIsLoading(false));
  }, [id]);

  if (isLoading && !sermon) {
    return (
      <div className="flex min-h-[400px] items-center justify-center">
        <CathedralCrossLoader text="Loading Sermon Broadcast..." />
      </div>
    );
  }

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
          <button
            type="button"
            onClick={() => setIsDownloadOpen(true)}
            className="flex items-center gap-2 rounded-xl border border-indigo-500/30 bg-indigo-500/10 px-4 py-2 text-sm font-semibold text-indigo-300 transition-all hover:bg-indigo-500/20 hover:text-white"
          >
            <Download className="h-4 w-4 text-indigo-400" />
            Download Options
          </button>
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
          {canDelete && (
            <button
              type="button"
              onClick={() => setIsDeleteOpen(true)}
              className="flex items-center gap-2 rounded-xl border border-rose-500/30 bg-rose-500/10 px-4 py-2 text-sm font-semibold text-rose-300 transition-all hover:bg-rose-500/20 hover:text-white"
              aria-label="Archive Sermon"
            >
              <Trash2 className="h-4 w-4 text-rose-400" />
              Archive Sermon
            </button>
          )}
        </div>
      </motion.div>

      <SermonDownloadModal
        isOpen={isDownloadOpen}
        onClose={() => setIsDownloadOpen(false)}
        title={sermon.title}
        videoUrl={sermon.video_url}
        audioUrl={sermon.audio_url}
        notes={sermon.notes}
      />

      {/* Main details page content */}
      <div className="grid gap-6 lg:grid-cols-3">
        {/* Left Column (2/3) - Media Player & Overview */}
        <div className="lg:col-span-2 space-y-6">
          <SermonMediaPlayer
            videoUrl={sermon.video_url}
            audioUrl={sermon.audio_url}
            thumbnail={sermon.thumbnail}
            hlsUrl={sermon.hls_url}
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

      {/* Archive Confirmation Modal */}
      {isDeleteOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm animate-fade-in">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="w-full max-w-md overflow-hidden rounded-2xl border border-border/50 bg-card/95 p-6 shadow-2xl backdrop-blur-md"
          >
            <div className="flex items-start gap-4">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-rose-500/10 text-rose-400 border border-rose-500/20 animate-pulse">
                <AlertTriangle className="h-5 w-5" />
              </div>
              <div className="space-y-1.5 flex-1">
                <h4 className="text-base font-bold text-primary-foreground">Archive Sermon?</h4>
                <p className="text-xs text-muted-foreground leading-normal">
                  Are you sure you want to archive <strong>{sermon.title}</strong>? This will soft-delete the sermon from the catalog, but keep the record in the database for recovery.
                </p>
              </div>
            </div>

            <div className="mt-6 flex justify-end gap-3 border-t border-border/10 pt-4">
              <button
                type="button"
                onClick={() => setIsDeleteOpen(false)}
                disabled={isDeleting}
                className="rounded-xl border border-border bg-card/60 px-4 py-2 text-xs font-semibold text-muted-foreground hover:text-primary-foreground transition-all disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={async () => {
                  setIsDeleting(true);
                  try {
                    await deleteSermon(sermon.id);
                    setIsDeleteOpen(false);
                    router.push("/dashboard/sermons");
                  } catch {
                    setIsDeleting(false);
                  }
                }}
                disabled={isDeleting}
                className="flex items-center gap-1.5 rounded-xl bg-rose-600 px-4 py-2 text-xs font-semibold text-white hover:bg-rose-500 transition-all disabled:opacity-50 shadow-[0_0_12px_rgba(239,68,68,0.2)]"
              >
                {isDeleting ? "Archiving..." : "Archive Sermon"}
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
}
