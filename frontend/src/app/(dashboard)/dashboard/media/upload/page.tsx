"use client";

import { useMediaAssets } from "@/features/media";
import { useAppPermissions } from "@/hooks/use-app-permissions";
import {
  FolderOpen,
  Upload,
  ArrowLeft,
  CheckCircle,
  AlertCircle,
  Loader2,
  Lock,
  Globe
} from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { cn } from "@/lib/utils";

interface UploadStep {
  label: string;
  progress: number;
}

const UPLOAD_STEPS: UploadStep[] = [
  { label: "Initializing upload parameters...", progress: 10 },
  { label: "Hashing metadata and verifying checksums...", progress: 35 },
  { label: "Uploading block chunks to AWS S3 bucket...", progress: 65 },
  { label: "Registering global CDN endpoints...", progress: 90 },
  { label: "Finalizing asset registrations...", progress: 100 }
];

export default function MediaUploadPage() {
  const router = useRouter();
  const { media: permissions } = useAppPermissions();
  const { createAssetPreUpload, updateAssetStatus } = useMediaAssets();

  // Form states
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [fileType, setFileType] = useState<"video" | "audio" | "image" | "document">("image");
  const [category, setCategory] = useState<"Sermon" | "Event" | "Social" | "Document" | "Other">("Sermon");
  const [isPublic, setIsPublic] = useState(true);
  const [fileSizeCategory, setFileSizeCategory] = useState<"small" | "medium" | "large">("small");
  
  // Upload simulation states
  const [uploading, setUploading] = useState(false);
  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  const [progressPercent, setProgressPercent] = useState(0);
  const [uploadComplete, setUploadComplete] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  if (!permissions.canManage) {
    return (
      <div className="p-6 max-w-lg mx-auto py-20 text-center space-y-4">
        <AlertCircle className="h-12 w-12 text-rose-500 mx-auto" />
        <h3 className="text-lg font-bold text-primary-foreground">Access Denied</h3>
        <p className="text-xs text-muted-foreground">
          You do not have the required media management permissions to upload resources.
        </p>
        <Link href="/dashboard/media" className="inline-flex h-9 items-center px-4 bg-slate-900 border border-border/40 rounded-xl text-xs font-semibold text-slate-300">
          Back to Library
        </Link>
      </div>
    );
  }

  const handleUploadSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !description.trim()) {
      setErrorMessage("Please fill out all required fields.");
      return;
    }

    setUploading(true);
    setErrorMessage(null);
    setProgressPercent(0);
    setCurrentStepIndex(0);

    // Simulated file sizes (bytes) & timing configurations
    let byteSize = 1048576; // 1MB
    let stepDelay = 300; // Total 1.5s (Small)

    if (fileSizeCategory === "medium") {
      byteSize = 31457280; // 30MB
      stepDelay = 440; // Total ~2.2s (Medium)
    } else if (fileSizeCategory === "large") {
      byteSize = 104857600; // 100MB
      stepDelay = 600; // Total ~3.0s (Large)
    }

    const mockFileName = `${title.toLowerCase().replace(/[^a-z0-9]+/g, "_")}.${
      fileType === "video" ? "mp4" : fileType === "audio" ? "mp3" : fileType === "image" ? "jpg" : "pdf"
    }`;

    try {
      // 1. Initial pre-upload creation
      const preAsset = await createAssetPreUpload(
        title,
        description,
        mockFileName,
        fileType,
        byteSize,
        category,
        isPublic
      );

      // 2. Start multi-step progress bar transitions
      let currentStep = 0;
      
      const interval = setInterval(async () => {
        if (currentStep < UPLOAD_STEPS.length - 1) {
          currentStep += 1;
          setCurrentStepIndex(currentStep);
          setProgressPercent(UPLOAD_STEPS[currentStep].progress);
        } else {
          clearInterval(interval);
          
          // 3. Finalize upload URLs depending on file type
          let finalUrl = "https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf";
          let finalThumb: string | null = null;

          if (fileType === "image") {
            finalUrl = "https://images.unsplash.com/photo-1490730141103-6cac27aaab94?w=800&fit=crop";
            finalThumb = "https://images.unsplash.com/photo-1490730141103-6cac27aaab94?w=150&fit=crop";
          } else if (fileType === "video") {
            finalUrl = "https://assets.mixkit.co/videos/preview/mixkit-worship-band-performing-in-church-40243-large.mp4";
            finalThumb = "https://images.unsplash.com/photo-1442504028989-ab58b5f29a4a?w=150&h=150&fit=crop";
          } else if (fileType === "audio") {
            finalUrl = "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-2.mp3";
            finalThumb = "https://images.unsplash.com/photo-1484755560693-a4074577af3a?w=150&h=150&fit=crop";
          }

          // Update asset status to Ready
          await updateAssetStatus(preAsset.id, "Ready", finalUrl, finalThumb);
          
          setProgressPercent(100);
          setUploading(false);
          setUploadComplete(true);
        }
      }, stepDelay);

    } catch (err: any) {
      setUploading(false);
      setErrorMessage(err?.message || "Internal transaction error occurred.");
    }
  };

  return (
    <div className="p-6 max-w-2xl mx-auto space-y-6">
      {/* Back link */}
      <div className="flex items-center gap-2">
        <Link
          href="/dashboard/media"
          className="inline-flex h-8 w-8 items-center justify-center rounded-lg border border-border/40 hover:bg-slate-900 text-slate-400 hover:text-white"
        >
          <ArrowLeft className="h-4 w-4" />
        </Link>
        <span className="text-xs text-muted-foreground">Back to Library Directory</span>
      </div>

      <div className="glass-panel p-6 rounded-2xl border border-border/40 space-y-6">
        <div>
          <h2 className="text-xl font-bold tracking-tight text-primary-foreground font-display flex items-center gap-2">
            <Upload className="h-5 w-5 text-indigo-400" />
            Upload New Media Asset
          </h2>
          <p className="text-xs text-muted-foreground mt-1">
            Specify metadata properties. The file size selection controls simulated upload speed to test repository hooks.
          </p>
        </div>

        {/* Success Screen */}
        {uploadComplete ? (
          <div className="py-12 flex flex-col items-center justify-center text-center space-y-4">
            <CheckCircle className="h-16 w-16 text-emerald-400 animate-bounce" />
            <h3 className="text-lg font-bold text-primary-foreground">Upload Successfully Completed!</h3>
            <p className="text-xs text-slate-400 max-w-sm">
              Your media asset has been uploaded to the simulated S3 bucket, registered on the CDN endpoints, and saved to the database.
            </p>
            <div className="pt-4 flex items-center gap-2">
              <button
                onClick={() => {
                  setUploadComplete(false);
                  setTitle("");
                  setDescription("");
                }}
                className="inline-flex h-9 items-center rounded-xl border border-border/40 px-4 text-xs font-semibold text-slate-300 hover:bg-slate-900"
              >
                Upload Another
              </button>
              <Link
                href="/dashboard/media"
                className="inline-flex h-9 items-center rounded-xl bg-indigo-500 px-4 text-xs font-semibold text-white hover:bg-indigo-600 shadow-neon"
              >
                Go to Library
              </Link>
            </div>
          </div>
        ) : uploading ? (
          // Active Upload Simulator Screen
          <div className="py-12 space-y-6">
            <div className="space-y-2 text-center">
              <Loader2 className="h-8 w-8 animate-spin text-indigo-400 mx-auto" />
              <h3 className="text-sm font-bold text-primary-foreground font-display">Uploading Asset...</h3>
              <p className="text-xs text-muted-foreground max-w-sm mx-auto">
                {UPLOAD_STEPS[currentStepIndex].label}
              </p>
            </div>

            {/* Progress bar */}
            <div className="space-y-2">
              <div className="h-2 w-full bg-slate-950 rounded-full overflow-hidden border border-border/20">
                <div
                  className="h-full bg-gradient-to-r from-indigo-500 to-emerald-400 rounded-full transition-all duration-300"
                  style={{ width: `${progressPercent}%` }}
                ></div>
              </div>
              <div className="flex items-center justify-between text-[10px] text-slate-500 font-mono">
                <span>{progressPercent}% Complete</span>
                <span>Stage {currentStepIndex + 1} of {UPLOAD_STEPS.length}</span>
              </div>
            </div>
          </div>
        ) : (
          /* Form Screen */
          <form onSubmit={handleUploadSubmit} className="space-y-4">
            {errorMessage && (
              <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/25 text-xs text-rose-400">
                {errorMessage}
              </div>
            )}

            {/* Title */}
            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-300">Asset Title *</label>
              <input
                type="text"
                placeholder="e.g. Sunday Sermon Slides - May 24"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="w-full h-10 px-4 rounded-xl border border-border/40 bg-slate-900/40 text-xs text-primary-foreground placeholder:text-muted-foreground focus:outline-none focus:border-indigo-500 transition-all"
                required
              />
            </div>

            {/* Description */}
            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-300">Description / Captions *</label>
              <textarea
                placeholder="Provide details about this media file..."
                rows={3}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="w-full p-4 rounded-xl border border-border/40 bg-slate-900/40 text-xs text-primary-foreground placeholder:text-muted-foreground focus:outline-none focus:border-indigo-500 transition-all resize-none"
                required
              ></textarea>
            </div>

            {/* Dual selects: File Type & Category */}
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-300">File Type *</label>
                <select
                  value={fileType}
                  onChange={(e: any) => setFileType(e.target.value)}
                  className="w-full h-10 px-3 rounded-xl border border-border/40 bg-slate-900/40 text-xs text-primary-foreground focus:outline-none focus:border-indigo-500"
                >
                  <option value="image">Image File (.png, .jpg)</option>
                  <option value="video">Video Broadcast (.mp4)</option>
                  <option value="audio">Audio Podcast / Track (.mp3)</option>
                  <option value="document">Document PDF (.pdf)</option>
                </select>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-300">Liturgical Category *</label>
                <select
                  value={category}
                  onChange={(e: any) => setCategory(e.target.value)}
                  className="w-full h-10 px-3 rounded-xl border border-border/40 bg-slate-900/40 text-xs text-primary-foreground focus:outline-none focus:border-indigo-500"
                >
                  <option value="Sermon">Sermon Resource</option>
                  <option value="Event">Event Promotional</option>
                  <option value="Social">Social Announcements</option>
                  <option value="Document">Administrative Document</option>
                  <option value="Other">Other / General</option>
                </select>
              </div>
            </div>

            {/* Dual inputs: File Size Category & Visibility */}
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-300">Simulated File Weight (Timing control)</label>
                <select
                  value={fileSizeCategory}
                  onChange={(e: any) => setFileSizeCategory(e.target.value)}
                  className="w-full h-10 px-3 rounded-xl border border-border/40 bg-slate-900/40 text-xs text-primary-foreground focus:outline-none focus:border-indigo-500"
                >
                  <option value="small">Small File size (1-5MB, ~1.5s delay)</option>
                  <option value="medium">Medium File size (10-50MB, ~2.2s delay)</option>
                  <option value="large">Large File size (100MB+, ~3.0s delay)</option>
                </select>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-300">Access Visibility Scope</label>
                <div className="flex items-center gap-2 h-10">
                  <button
                    type="button"
                    onClick={() => setIsPublic(true)}
                    className={cn(
                      "flex-1 h-9 rounded-xl border text-xs font-semibold flex items-center justify-center gap-1.5 transition-all",
                      isPublic
                        ? "border-indigo-500/50 bg-indigo-500/10 text-indigo-400"
                        : "border-border/40 bg-slate-900/30 text-slate-400"
                    )}
                  >
                    <Globe className="h-3.5 w-3.5" />
                    <span>Public</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setIsPublic(false)}
                    className={cn(
                      "flex-1 h-9 rounded-xl border text-xs font-semibold flex items-center justify-center gap-1.5 transition-all",
                      !isPublic
                        ? "border-pink-500/50 bg-pink-500/10 text-pink-400"
                        : "border-border/40 bg-slate-900/30 text-slate-400"
                    )}
                  >
                    <Lock className="h-3.5 w-3.5" />
                    <span>Private</span>
                  </button>
                </div>
              </div>
            </div>

            {/* Action buttons */}
            <div className="pt-4 flex items-center justify-end gap-3 border-t border-border/20">
              <Link
                href="/dashboard/media"
                className="inline-flex h-10 items-center justify-center px-4 rounded-xl border border-border/40 text-xs font-semibold text-slate-300 hover:bg-slate-900"
              >
                Cancel
              </Link>
              <button
                type="submit"
                className="inline-flex h-10 items-center justify-center px-6 rounded-xl bg-indigo-500 text-xs font-semibold text-white hover:bg-indigo-600 shadow-neon"
              >
                Begin Staged Upload
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
