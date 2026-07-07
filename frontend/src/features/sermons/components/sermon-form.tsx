"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { motion } from "framer-motion";
import { Save, X, Sparkles, UploadCloud, CheckCircle2, AlertCircle, RefreshCw } from "lucide-react";
import { useRouter } from "next/navigation";
import { cn } from "@/lib/utils";
import { useDirectUpload } from "../hooks/use-direct-upload";
import { API_BASE_URL } from "@/constants/api-endpoints";

import {
  SERMON_CATEGORIES,
  SERMON_STATUSES,
  SERMON_CATEGORY_LABELS,
  SERMON_STATUS_LABELS,
  type Sermon,
  type SermonCategory,
  type SermonStatus,
} from "../types/sermon.types";

const sermonFormSchema = z.object({
  title: z.string().min(3, "Title must be at least 3 characters"),
  description: z.string().min(10, "Description must be at least 10 characters"),
  scripture_reference: z.string().min(3, "Scripture reference is required"),
  sermon_date: z.string().min(1, "Sermon date is required"),
  status: z.enum(SERMON_STATUSES, {
    errorMap: () => ({ message: "Please select a valid status" }),
  }),
  video_url: z.string().url("Please enter a valid video URL").or(z.literal("")),
  audio_url: z.string().url("Please enter a valid audio URL").or(z.literal("")),
  speaker: z.string().min(3, "Speaker name is required"),
  category: z.enum(SERMON_CATEGORIES, {
    errorMap: () => ({ message: "Please select a valid category" }),
  }),
  featured: z.boolean().default(false),
  notes: z.string().min(10, "Outline/Notes must be at least 10 characters"),
  tagsString: z.string().default(""),
});

type SermonFormValues = z.infer<typeof sermonFormSchema>;

interface SermonFormProps {
  sermon?: Sermon; // Present when editing
  onSubmit: (values: Omit<Sermon, "id" | "created_at" | "updated_at">) => void;
  isLoading?: boolean;
  /** Called after a media file upload completes so parent can refresh cached sermon data */
  onUploadComplete?: () => void;
}

const inputClass = cn(
  "w-full rounded-xl border border-border/50 bg-card/60 px-4 py-2.5",
  "text-sm text-primary-foreground placeholder:text-muted-foreground/50",
  "backdrop-blur-[16px] transition-all duration-200",
  "focus:border-primary/50 focus:outline-none focus:ring-2 focus:ring-primary/20 hover:border-border/80"
);

const checkboxClass = cn(
  "h-4 w-4 rounded border-border/50 bg-card/60 text-indigo-600 focus:ring-indigo-500/20 focus:ring-offset-slate-900 focus:ring-2"
);

const labelClass = "block text-xs font-medium text-muted-foreground mb-1.5";
const errorClass = "mt-1 text-xs text-red-400";

const createSvgPlaceholder = (title: string) => {
  const colors = [
    ["#3b82f6", "#8b5cf6"], // blue to purple
    ["#a855f7", "#ec4899"], // purple to pink
    ["#f97316", "#ef4444"], // orange to red
    ["#0ea5e9", "#14b8a6"], // sky to teal
    ["#6366f1", "#06b6d4"], // indigo to cyan
  ];
  const hash = title.split("").reduce((acc, char) => acc + char.charCodeAt(0), 0);
  const [color1, color2] = colors[hash % colors.length];

  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="800" height="500" viewBox="0 0 800 500">
    <defs>
      <linearGradient id="g" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" style="stop-color:${color1};stop-opacity:1" />
        <stop offset="100%" style="stop-color:${color2};stop-opacity:1" />
      </linearGradient>
    </defs>
    <rect width="100%" height="100%" fill="url(#g)" />
    <circle cx="400" cy="250" r="150" fill="white" opacity="0.05" />
    <circle cx="150" cy="150" r="80" fill="white" opacity="0.03" />
    <circle cx="650" cy="350" r="120" fill="white" opacity="0.04" />
    <text x="50%" y="45%" dominant-baseline="middle" text-anchor="middle" font-family="system-ui, sans-serif" font-weight="bold" font-size="44" fill="white" opacity="0.9">
      ${title}
    </text>
    <text x="50%" y="60%" dominant-baseline="middle" text-anchor="middle" font-family="system-ui, sans-serif" font-weight="medium" font-size="20" fill="white" opacity="0.65">
      SERMON AUDIO &amp; VIDEO
    </text>
  </svg>`;
  return `data:image/svg+xml;utf8,${encodeURIComponent(svg)}`;
};

export function SermonForm({
  sermon,
  onSubmit,
  isLoading = false,
  onUploadComplete,
}: SermonFormProps) {
  const router = useRouter();
  const isEdit = !!sermon;

  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors },
  } = useForm<SermonFormValues>({
    resolver: zodResolver(sermonFormSchema),
    defaultValues: sermon
      ? {
          title: sermon.title,
          description: sermon.description,
          scripture_reference: sermon.scripture_reference,
          sermon_date: sermon.sermon_date,
          status: sermon.status,
          video_url: sermon.video_url,
          audio_url: sermon.audio_url,
          speaker: sermon.speaker,
          category: sermon.category,
          featured: sermon.featured,
          notes: sermon.notes,
          tagsString: sermon.tags.join(", "),
        }
      : {
          title: "",
          description: "",
          scripture_reference: "",
          sermon_date: new Date().toISOString().slice(0, 10),
          status: "Draft",
          video_url: "https://www.w3schools.com/html/mov_bbb.mp4", // Default simulated video
          audio_url: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3", // Default simulated audio
          speaker: "",
          category: "Faith",
          featured: false,
          notes: `## Sermon Outline\n1. **First Point**\n   - Detail...\n\n2. **Second Point**\n   - Detail...\n\n### Reflection Questions\n1. Question...`,
          tagsString: "",
        },
  });

  const videoUploader = useDirectUpload({
    onSuccess: (data) => {
      // When sermon_id was provided, UploadCompleteView returns the full SermonSerializer
      // response with an absolute video_url. When creating a new sermon (no sermon_id),
      // the response only has storage_key — construct the absolute media URL from it.
      let targetUrl =
        data.video_url ||
        (data.storage_key ? `${API_BASE_URL}/media/${data.storage_key}` : "");
      if (targetUrl) {
        targetUrl = targetUrl.replace(/\\/g, "/");
        setValue("video_url", targetUrl, { shouldValidate: true });
      }
      onUploadComplete?.();
    },
  });

  const audioUploader = useDirectUpload({
    onSuccess: (data) => {
      let targetUrl =
        data.audio_url ||
        (data.storage_key ? `${API_BASE_URL}/media/${data.storage_key}` : "");
      if (targetUrl) {
        targetUrl = targetUrl.replace(/\\/g, "/");
        setValue("audio_url", targetUrl, { shouldValidate: true });
      }
      onUploadComplete?.();
    },
  });

  const onFormSubmit = (data: SermonFormValues) => {
    const tags = data.tagsString
      ? data.tagsString
          .split(",")
          .map((t) => t.trim())
          .filter(Boolean)
      : [];

    const thumbnail = sermon?.thumbnail || createSvgPlaceholder(data.title);

    onSubmit({
      title: data.title,
      description: data.description,
      scripture_reference: data.scripture_reference,
      sermon_date: data.sermon_date,
      status: data.status,
      thumbnail,
      video_url: data.video_url,
      audio_url: data.audio_url,
      speaker: data.speaker,
      category: data.category,
      featured: data.featured,
      notes: data.notes,
      tags,
    });
  };

  return (
    <motion.form
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      onSubmit={handleSubmit(onFormSubmit)}
      noValidate
      aria-label={isEdit ? "Edit sermon form" : "Create sermon form"}
      className="space-y-6"
    >
      <div className="grid gap-6 md:grid-cols-3">
        {/* Left Column - Core Content */}
        <div className="md:col-span-2 space-y-6">
          <fieldset className="rounded-2xl border border-border/50 bg-card/60 p-6 backdrop-blur-[16px] shadow-glass space-y-4">
            <legend className="text-sm font-semibold text-primary-foreground px-1 mb-2">
              Sermon Details
            </legend>

            <div>
              <label htmlFor="title" className={labelClass}>
                Sermon Title <span className="text-red-400">*</span>
              </label>
              <input
                id="title"
                type="text"
                placeholder="e.g. Restoring Hope in Hard Times"
                className={inputClass}
                aria-required="true"
                aria-invalid={!!errors.title}
                {...register("title")}
              />
              {errors.title && (
                <p className={errorClass} role="alert">
                  {errors.title.message}
                </p>
              )}
            </div>

            <div>
              <label htmlFor="description" className={labelClass}>
                Short Description <span className="text-red-400">*</span>
              </label>
              <textarea
                id="description"
                rows={3}
                placeholder="Brief summary of the sermon key message..."
                className={cn(inputClass, "resize-none")}
                aria-required="true"
                aria-invalid={!!errors.description}
                {...register("description")}
              />
              {errors.description && (
                <p className={errorClass} role="alert">
                  {errors.description.message}
                </p>
              )}
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label htmlFor="scripture_reference" className={labelClass}>
                  Scripture Reference <span className="text-red-400">*</span>
                </label>
                <input
                  id="scripture_reference"
                  type="text"
                  placeholder="e.g. Psalms 23:1-6"
                  className={inputClass}
                  aria-required="true"
                  aria-invalid={!!errors.scripture_reference}
                  {...register("scripture_reference")}
                />
                {errors.scripture_reference && (
                  <p className={errorClass} role="alert">
                    {errors.scripture_reference.message}
                  </p>
                )}
              </div>

              <div>
                <label htmlFor="sermon_date" className={labelClass}>
                  Preach Date <span className="text-red-400">*</span>
                </label>
                <input
                  id="sermon_date"
                  type="date"
                  className={inputClass}
                  aria-required="true"
                  aria-invalid={!!errors.sermon_date}
                  {...register("sermon_date")}
                />
                {errors.sermon_date && (
                  <p className={errorClass} role="alert">
                    {errors.sermon_date.message}
                  </p>
                )}
              </div>
            </div>
          </fieldset>

          <fieldset className="rounded-2xl border border-border/50 bg-card/60 p-6 backdrop-blur-[16px] shadow-glass space-y-4">
            <legend className="text-sm font-semibold text-primary-foreground px-1 mb-2">
              Sermon Outline, Notes &amp; Reflection Questions
            </legend>
            <div>
              <label htmlFor="notes" className={labelClass}>
                Study Notes (Markdown Format Supported) <span className="text-red-400">*</span>
              </label>
              <textarea
                id="notes"
                rows={12}
                placeholder="Write sermon outlines, bullet points, reflection questions..."
                className={cn(inputClass, "font-mono text-xs resize-y")}
                aria-required="true"
                aria-invalid={!!errors.notes}
                {...register("notes")}
              />
              {errors.notes && (
                <p className={errorClass} role="alert">
                  {errors.notes.message}
                </p>
              )}
            </div>
          </fieldset>
        </div>

        {/* Right Column - Side Settings & Metadata */}
        <div className="space-y-6">
          <fieldset className="rounded-2xl border border-border/50 bg-card/60 p-6 backdrop-blur-[16px] shadow-glass space-y-4">
            <legend className="text-sm font-semibold text-primary-foreground px-1 mb-2">
              Settings &amp; Metadata
            </legend>

            <div>
              <label htmlFor="speaker" className={labelClass}>
                Speaker Name <span className="text-red-400">*</span>
              </label>
              <input
                id="speaker"
                type="text"
                placeholder="e.g. Rev. Kamau David"
                className={inputClass}
                aria-required="true"
                aria-invalid={!!errors.speaker}
                {...register("speaker")}
              />
              {errors.speaker && (
                <p className={errorClass} role="alert">
                  {errors.speaker.message}
                </p>
              )}
            </div>

            <div>
              <label htmlFor="category" className={labelClass}>
                Sermon Category <span className="text-red-400">*</span>
              </label>
              <select
                id="category"
                className={cn(inputClass, "cursor-pointer")}
                {...register("category")}
              >
                {SERMON_CATEGORIES.map((cat) => (
                  <option key={cat} value={cat} className="bg-slate-900">
                    {SERMON_CATEGORY_LABELS[cat]}
                  </option>
                ))}
              </select>
              {errors.category && (
                <p className={errorClass} role="alert">
                  {errors.category.message}
                </p>
              )}
            </div>

            <div>
              <label htmlFor="status" className={labelClass}>
                Status <span className="text-red-400">*</span>
              </label>
              <select
                id="status"
                className={cn(inputClass, "cursor-pointer")}
                {...register("status")}
              >
                {SERMON_STATUSES.map((stat) => (
                  <option key={stat} value={stat} className="bg-slate-900">
                    {SERMON_STATUS_LABELS[stat]}
                  </option>
                ))}
              </select>
              {errors.status && (
                <p className={errorClass} role="alert">
                  {errors.status.message}
                </p>
              )}
            </div>

            <div>
              <label htmlFor="tagsString" className={labelClass}>
                Tags (comma separated)
              </label>
              <input
                id="tagsString"
                type="text"
                placeholder="Grace, Faith, Romans"
                className={inputClass}
                {...register("tagsString")}
              />
            </div>

            {/* Featured Sermon Toggle */}
            <div className="flex items-center justify-between p-3.5 rounded-xl border border-border/40 bg-indigo-500/5 backdrop-blur-[8px]">
              <div className="space-y-0.5 pr-2">
                <label htmlFor="featured" className="text-xs font-bold text-indigo-300 flex items-center gap-1.5 cursor-pointer">
                  <Sparkles className="h-3.5 w-3.5 text-indigo-400" />
                  Featured Sermon
                </label>
                <p className="text-[10px] text-muted-foreground leading-normal">
                  Promote this to the hero spotlight card on the main sermons catalog. Only one sermon is featured at a time.
                </p>
              </div>
              <input
                id="featured"
                type="checkbox"
                className={checkboxClass}
                {...register("featured")}
              />
            </div>
          </fieldset>

          <fieldset className="rounded-2xl border border-border/50 bg-card/60 p-6 backdrop-blur-[16px] shadow-glass space-y-4">
            <legend className="text-sm font-semibold text-primary-foreground px-1 mb-2">
              Media Assets &amp; Direct Uploads
            </legend>
            <p className="text-[10px] text-muted-foreground leading-normal mb-1">
              Upload video (MP4) or audio (MP3) files directly to storage, or provide direct links below.
            </p>

            {/* Direct Video Upload Dropzone */}
            <div className="rounded-xl border border-dashed border-indigo-500/30 bg-indigo-500/5 p-4 space-y-2">
              <div className="flex items-center justify-between">
                <label className="text-xs font-bold text-indigo-300 flex items-center gap-1.5 cursor-pointer">
                  <UploadCloud className="h-4 w-4 text-indigo-400" /> Direct Video Upload (MP4)
                </label>
                {videoUploader.status === "completed" && (
                  <span className="text-[10px] font-semibold text-emerald-400 flex items-center gap-1">
                    <CheckCircle2 className="h-3.5 w-3.5" /> Uploaded &amp; Verified
                  </span>
                )}
              </div>

              <input
                type="file"
                accept="video/mp4,video/*"
                disabled={videoUploader.isUploading}
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (file) videoUploader.startUpload(file, "video", sermon?.id);
                }}
                className="block w-full text-xs text-muted-foreground file:mr-3 file:py-1.5 file:px-3 file:rounded-lg file:border-0 file:text-xs file:font-semibold file:bg-indigo-600 file:text-white hover:file:bg-indigo-500 cursor-pointer"
              />

              {videoUploader.isUploading && (
                <div className="space-y-1">
                  <div className="flex justify-between text-[10px] text-indigo-300 font-medium">
                    <span>Uploading Video...</span>
                    <span>{videoUploader.progress}%</span>
                  </div>
                  <div className="h-1.5 w-full bg-slate-800 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-indigo-500 transition-all duration-300"
                      style={{ width: `${videoUploader.progress}%` }}
                    />
                  </div>
                </div>
              )}

              {videoUploader.status === "error" && (
                <div className="flex items-center justify-between text-xs text-red-400 bg-red-500/10 p-2 rounded-lg">
                  <span className="flex items-center gap-1"><AlertCircle className="h-3.5 w-3.5" /> {videoUploader.error}</span>
                  <button type="button" onClick={videoUploader.retry} className="text-indigo-400 hover:underline flex items-center gap-1">
                    <RefreshCw className="h-3 w-3" /> Retry
                  </button>
                </div>
              )}
            </div>

            <div>
              <label htmlFor="video_url" className={labelClass}>
                Video URL (Direct MP4 link)
              </label>
              <input
                id="video_url"
                type="url"
                placeholder="https://example.com/sermon.mp4"
                className={inputClass}
                aria-invalid={!!errors.video_url}
                {...register("video_url")}
              />
              {errors.video_url && (
                <p className={errorClass} role="alert">
                  {errors.video_url.message}
                </p>
              )}
            </div>

            {/* Direct Audio Upload Dropzone */}
            <div className="rounded-xl border border-dashed border-teal-500/30 bg-teal-500/5 p-4 space-y-2 mt-4">
              <div className="flex items-center justify-between">
                <label className="text-xs font-bold text-teal-300 flex items-center gap-1.5 cursor-pointer">
                  <UploadCloud className="h-4 w-4 text-teal-400" /> Direct Audio Upload (MP3)
                </label>
                {audioUploader.status === "completed" && (
                  <span className="text-[10px] font-semibold text-emerald-400 flex items-center gap-1">
                    <CheckCircle2 className="h-3.5 w-3.5" /> Uploaded &amp; Verified
                  </span>
                )}
              </div>

              <input
                type="file"
                accept="audio/mp3,audio/*"
                disabled={audioUploader.isUploading}
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (file) audioUploader.startUpload(file, "audio", sermon?.id);
                }}
                className="block w-full text-xs text-muted-foreground file:mr-3 file:py-1.5 file:px-3 file:rounded-lg file:border-0 file:text-xs file:font-semibold file:bg-teal-600 file:text-white hover:file:bg-teal-500 cursor-pointer"
              />

              {audioUploader.isUploading && (
                <div className="space-y-1">
                  <div className="flex justify-between text-[10px] text-teal-300 font-medium">
                    <span>Uploading Audio...</span>
                    <span>{audioUploader.progress}%</span>
                  </div>
                  <div className="h-1.5 w-full bg-slate-800 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-teal-500 transition-all duration-300"
                      style={{ width: `${audioUploader.progress}%` }}
                    />
                  </div>
                </div>
              )}

              {audioUploader.status === "error" && (
                <div className="flex items-center justify-between text-xs text-red-400 bg-red-500/10 p-2 rounded-lg">
                  <span className="flex items-center gap-1"><AlertCircle className="h-3.5 w-3.5" /> {audioUploader.error}</span>
                  <button type="button" onClick={audioUploader.retry} className="text-teal-400 hover:underline flex items-center gap-1">
                    <RefreshCw className="h-3 w-3" /> Retry
                  </button>
                </div>
              )}
            </div>

            <div>
              <label htmlFor="audio_url" className={labelClass}>
                Audio URL (Direct MP3 link)
              </label>
              <input
                id="audio_url"
                type="url"
                placeholder="https://example.com/sermon.mp3"
                className={inputClass}
                aria-invalid={!!errors.audio_url}
                {...register("audio_url")}
              />
              {errors.audio_url && (
                <p className={errorClass} role="alert">
                  {errors.audio_url.message}
                </p>
              )}
            </div>
          </fieldset>

          {/* Action buttons */}
          <div className="flex gap-3">
            <button
              type="button"
              onClick={() => router.back()}
              className={cn(
                "flex-1 rounded-xl border border-border/50 bg-card/60 py-3 text-xs font-semibold text-muted-foreground",
                "backdrop-blur-[16px] transition-colors hover:bg-card hover:text-primary-foreground focus:outline-none"
              )}
            >
              <span className="flex items-center justify-center gap-1.5">
                <X className="h-4 w-4" /> Cancel
              </span>
            </button>
            <button
              type="submit"
              disabled={isLoading}
              className={cn(
                "flex-1 rounded-xl bg-indigo-600 py-3 text-xs font-semibold text-white",
                "transition-all hover:bg-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/20",
                "disabled:pointer-events-none disabled:opacity-50",
                "shadow-[0_0_12px_rgba(99,102,241,0.3)] hover:shadow-[0_0_18px_rgba(99,102,241,0.5)]"
              )}
            >
              <span className="flex items-center justify-center gap-1.5">
                <Save className="h-4 w-4" />
                {isLoading ? "Saving..." : isEdit ? "Update Sermon" : "Create Sermon"}
              </span>
            </button>
          </div>
        </div>
      </div>
    </motion.form>
  );
}
