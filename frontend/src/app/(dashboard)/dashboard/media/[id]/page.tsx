"use client";

import { useMediaAssets } from "@/features/media";
import { MediaRepository } from "@/features/media";
import { useAppPermissions } from "@/hooks/use-app-permissions";
import { useAuth } from "@/hooks/use-auth";
import {
  ArrowLeft,
  Calendar,
  User,
  Download,
  Share2,
  Trash2,
  RotateCcw,
  Video,
  Music,
  Image as ImageIcon,
  FileText,
  Clock,
  Eye,
  Sliders,
  Play,
  Pause,
  Volume2
} from "lucide-react";
import Link from "next/link";
import { useRouter, useParams } from "next/navigation";
import { useEffect, useState, useCallback } from "react";
import { cn } from "@/lib/utils";
import type { MediaAsset } from "@/features/media/types/media.types";

export default function MediaAssetDetailPage() {
  const router = useRouter();
  const params = useParams();
  const id = params?.id as string;

  const { media: permissions } = useAppPermissions();
  const { user, role } = useAuth();
  const { archiveAsset, restoreAsset, downloadAsset } = useMediaAssets();

  const branchId = (user as any)?.branch_id || "branch-001";
  
  const [asset, setAsset] = useState<MediaAsset | null>(null);
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Audio mock playing states
  const [isPlaying, setIsPlaying] = useState(false);

  const loadAssetDetails = useCallback(async () => {
    if (!id || !role) return;
    setLoading(true);
    setErrorMsg(null);
    try {
      const result = await MediaRepository.getAssetById(id, { branchId, role });
      setAsset(result);
    } catch (err: any) {
      setErrorMsg(err?.message || "Failed to load media asset details.");
    } finally {
      setLoading(false);
    }
  }, [id, branchId, role]);

  useEffect(() => {
    loadAssetDetails();
  }, [loadAssetDetails]);

  const handleDownload = async () => {
    if (!asset) return;
    await downloadAsset(asset.id);
    // Reload asset details to show incremented downloads
    loadAssetDetails();
    window.open(asset.file_url, "_blank");
  };

  const handleArchive = async () => {
    if (!asset) return;
    try {
      await archiveAsset(asset.id);
      loadAssetDetails();
    } catch (err) {
      console.error(err);
    }
  };

  const handleRestore = async () => {
    if (!asset) return;
    try {
      await restoreAsset(asset.id);
      loadAssetDetails();
    } catch (err) {
      console.error(err);
    }
  };

  const formatBytes = (bytes: number, decimals = 2) => {
    if (bytes === 0) return "0 Bytes";
    const k = 1024;
    const dm = decimals < 0 ? 0 : decimals;
    const sizes = ["Bytes", "KB", "MB", "GB", "TB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + " " + sizes[i];
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-32 space-y-3">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-indigo-500 border-t-transparent"></div>
        <p className="text-xs text-slate-400">Loading asset parameters...</p>
      </div>
    );
  }

  if (errorMsg || !asset) {
    return (
      <div className="p-6 max-w-lg mx-auto py-20 text-center space-y-4">
        <AlertCircle className="h-12 w-12 text-rose-500 mx-auto" />
        <h3 className="text-lg font-bold text-primary-foreground">Error Loading Asset</h3>
        <p className="text-xs text-muted-foreground">{errorMsg || "Requested resource was not found."}</p>
        <Link href="/dashboard/media" className="inline-flex h-9 items-center px-4 bg-slate-900 border border-border/40 rounded-xl text-xs font-semibold text-slate-300">
          Back to Library
        </Link>
      </div>
    );
  }

  const formattedDate = new Date(asset.created_at).toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit"
  });

  return (
    <div className="p-6 max-w-6xl mx-auto space-y-6">
      {/* Back button */}
      <div className="flex items-center gap-2">
        <Link
          href="/dashboard/media"
          className="inline-flex h-8 w-8 items-center justify-center rounded-lg border border-border/40 hover:bg-slate-900 text-slate-400 hover:text-white"
        >
          <ArrowLeft className="h-4 w-4" />
        </Link>
        <span className="text-xs text-muted-foreground">Back to Library Directory</span>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Left Column: Player Preview */}
        <div className="lg:col-span-2 space-y-4">
          <div className="glass-panel overflow-hidden rounded-2xl border border-border/40 bg-slate-950/70 aspect-video w-full flex items-center justify-center relative">
            
            {/* 1. Video Player */}
            {asset.file_type === "video" && (
              <video
                src={asset.file_url}
                controls
                poster={asset.thumbnail_url || undefined}
                className="w-full h-full object-contain"
              />
            )}

            {/* 2. Audio Player */}
            {asset.file_type === "audio" && (
              <div className="flex flex-col items-center justify-center w-full h-full p-8 space-y-6 bg-gradient-to-br from-slate-900/60 to-indigo-950/20">
                {/* Audio wave mock animation */}
                <div className="flex items-end justify-center gap-1.5 h-16 w-full max-w-xs px-4">
                  {[...Array(15)].map((_, i) => (
                    <div
                      key={i}
                      className={cn(
                        "w-1.5 bg-emerald-400 rounded-full transition-all duration-300",
                        isPlaying ? "animate-audio-wave" : "h-3"
                      )}
                      style={{
                        animationDelay: isPlaying ? `${i * 0.15}s` : "0s",
                        // Random static heights when not playing
                        height: isPlaying ? undefined : `${[8, 16, 24, 12, 6, 18, 30, 24, 14, 10, 20, 16, 8, 12, 10][i]}px`
                      }}
                    />
                  ))}
                </div>

                <div className="space-y-1 text-center">
                  <h3 className="font-display text-sm font-bold text-primary-foreground">{asset.title}</h3>
                  <p className="text-[10px] text-muted-foreground uppercase tracking-wider">Audio Broadcast Track</p>
                </div>

                {/* Audio controllers */}
                <div className="flex items-center gap-4">
                  <button
                    onClick={() => setIsPlaying(!isPlaying)}
                    className="h-12 w-12 rounded-full bg-emerald-500 hover:bg-emerald-600 flex items-center justify-center text-slate-950 transition-all shadow-neon"
                  >
                    {isPlaying ? <Pause className="h-5 w-5 fill-slate-950" /> : <Play className="h-5 w-5 fill-slate-950 pl-0.5" />}
                  </button>
                  
                  <div className="flex items-center gap-1.5 text-slate-400">
                    <Volume2 className="h-4 w-4" />
                    <span className="text-[10px] font-mono select-none">Stereo</span>
                  </div>
                </div>
              </div>
            )}

            {/* 3. Image Viewer */}
            {asset.file_type === "image" && (
              <img
                src={asset.file_url}
                alt={asset.title}
                className="w-full h-full object-contain"
              />
            )}

            {/* 4. Document Viewer */}
            {asset.file_type === "document" && (
              <div className="flex flex-col items-center justify-center p-8 space-y-4 text-center">
                <div className="h-16 w-16 rounded-2xl bg-slate-900 border border-border/30 flex items-center justify-center">
                  <FileText className="h-8 w-8 text-amber-400" />
                </div>
                <div className="space-y-1">
                  <h3 className="font-display text-sm font-bold text-primary-foreground">{asset.file_name}</h3>
                  <p className="text-[10px] text-muted-foreground uppercase font-mono">{formatBytes(asset.file_size)}</p>
                </div>
                <button
                  onClick={handleDownload}
                  className="inline-flex h-9 items-center gap-1.5 rounded-xl bg-indigo-500 px-4 text-xs font-semibold text-white hover:bg-indigo-600 shadow-neon"
                >
                  <Download className="h-4 w-4" />
                  <span>Open PDF Document</span>
                </button>
              </div>
            )}
          </div>
          
          <div className="glass-panel p-5 rounded-2xl border border-border/40 space-y-2">
            <h3 className="text-xs font-bold text-primary-foreground uppercase tracking-wider">Description</h3>
            <p className="text-xs text-muted-foreground leading-relaxed">
              {asset.description || "No description logged for this media asset."}
            </p>
          </div>
        </div>

        {/* Right Column: Metadata details */}
        <div className="space-y-4">
          <div className="glass-panel p-6 rounded-2xl border border-border/40 space-y-6">
            <div>
              <span className="rounded bg-slate-900 text-[10px] font-bold text-indigo-400 px-2.5 py-0.5 border border-border/30">
                {asset.category} Category
              </span>
              <h2 className="text-lg font-bold text-primary-foreground font-display mt-3 leading-snug">
                {asset.title}
              </h2>
            </div>

            {/* Meta Items list */}
            <div className="space-y-3.5 border-t border-b border-border/30 py-4 text-xs">
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground flex items-center gap-1">
                  <FileText className="h-3.5 w-3.5 text-slate-400" />
                  <span>File Name</span>
                </span>
                <span className="font-mono text-[10px] text-primary-foreground max-w-[150px] truncate" title={asset.file_name}>
                  {asset.file_name}
                </span>
              </div>

              <div className="flex items-center justify-between">
                <span className="text-muted-foreground flex items-center gap-1">
                  <Sliders className="h-3.5 w-3.5 text-slate-400" />
                  <span>File Weight</span>
                </span>
                <span className="font-mono text-[10px] text-primary-foreground">{formatBytes(asset.file_size)}</span>
              </div>

              <div className="flex items-center justify-between">
                <span className="text-muted-foreground flex items-center gap-1">
                  <Calendar className="h-3.5 w-3.5 text-slate-400" />
                  <span>Uploaded At</span>
                </span>
                <span className="text-slate-300 text-[11px] font-medium">{formattedDate}</span>
              </div>

              <div className="flex items-center justify-between">
                <span className="text-muted-foreground flex items-center gap-1">
                  <User className="h-3.5 w-3.5 text-slate-400" />
                  <span>Uploaded By</span>
                </span>
                <span className="text-slate-300 font-semibold text-[11px]" title={`UUID: ${asset.uploaded_by}`}>
                  {asset.uploaded_by_name}
                </span>
              </div>

              <div className="flex items-center justify-between">
                <span className="text-muted-foreground flex items-center gap-1">
                  <Eye className="h-3.5 w-3.5 text-slate-400" />
                  <span>Downloads Count</span>
                </span>
                <span className="font-mono text-primary-foreground font-bold">{asset.download_count} downloads</span>
              </div>
            </div>

            {/* Actions panel */}
            <div className="space-y-2.5">
              {asset.status === "Ready" && (
                <button
                  onClick={handleDownload}
                  className="w-full h-10 inline-flex items-center justify-center gap-2 rounded-xl bg-indigo-500 text-xs font-semibold text-white hover:bg-indigo-600 shadow-neon transition-all"
                >
                  <Download className="h-4 w-4" />
                  <span>Download Resource</span>
                </button>
              )}

              {permissions.canManage && (
                <div className="flex items-center gap-2">
                  {asset.is_archived ? (
                    <button
                      onClick={handleRestore}
                      className="flex-1 h-9 inline-flex items-center justify-center gap-1 rounded-xl border border-emerald-500/20 bg-emerald-500/10 text-xs font-bold text-emerald-400 hover:bg-emerald-500/25"
                    >
                      <RotateCcw className="h-4 w-4" />
                      <span>Restore Asset</span>
                    </button>
                  ) : (
                    <button
                      onClick={handleArchive}
                      className="flex-1 h-9 inline-flex items-center justify-center gap-1 rounded-xl border border-pink-500/20 bg-pink-500/10 text-xs font-bold text-pink-400 hover:bg-pink-500/20"
                    >
                      <Trash2 className="h-4 w-4" />
                      <span>Soft-Delete Archive</span>
                    </button>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// Inline warning helper
function AlertCircle(props: any) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      {...props}
    >
      <circle cx="12" cy="12" r="10" />
      <line x1="12" y1="8" x2="12" y2="12" />
      <line x1="12" y1="16" x2="12.01" y2="16" />
    </svg>
  );
}
