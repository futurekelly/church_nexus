"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { useSermons } from "@/features/sermons/hooks/use-sermons";
import { SERMON_CATEGORIES, type SermonCategory } from "@/features/sermons/types/sermon.types";
import type { LivestreamStatus } from "../types/livestream.types";
import { motion } from "framer-motion";
import { FileVideo, X, Save, AlertCircle } from "lucide-react";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

interface ArchiveDialogProps {
  stream: LivestreamStatus | null;
  isOpen: boolean;
  onClose: () => void;
}

interface ArchiveFormValues {
  title: string;
  speaker: string;
  description: string;
  category: SermonCategory;
  scripture_reference: string;
  notes: string;
}

const inputClass = cn(
  "w-full rounded-xl border border-border/50 bg-card/60 px-4 py-2.5",
  "text-sm text-primary-foreground placeholder:text-muted-foreground/50",
  "backdrop-blur-[16px] transition-all duration-200",
  "focus:border-primary/50 focus:outline-none focus:ring-2 focus:ring-primary/20"
);

const labelClass = "block text-xs font-medium text-muted-foreground mb-1.5";
const errorClass = "mt-1 text-xs text-red-400";

export function ArchiveDialog({ stream, isOpen, onClose }: ArchiveDialogProps) {
  const { addSermon } = useSermons();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ArchiveFormValues>({
    values: stream ? {
      title: stream.title,
      speaker: stream.preacher,
      description: stream.description,
      category: "Worship" as SermonCategory,
      scripture_reference: "",
      notes: "Livestream recorded study guide notes.",
    } : undefined
  });

  const onSubmit = async (data: ArchiveFormValues) => {
    if (!stream) return;
    setIsSubmitting(true);
    try {
      addSermon({
        title: data.title,
        speaker: data.speaker,
        description: data.description,
        category: data.category,
        scripture_reference: data.scripture_reference,
        notes: data.notes,
        sermon_date: new Date(stream.started_at).toISOString().split("T")[0],
        status: "Published",
        thumbnail: "gradient-indigo", // Standard local thumbnail gradient key
        video_url: stream.stream_url,
        audio_url: "",
        featured: false,
        tags: ["Live Broadcast", "Recorded"],
      });
      toast.success("Livestream successfully archived to Sermons Library!");
      onClose();
    } catch {
      toast.error("Failed to archive livestream.");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOpen || !stream) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        className="w-full max-w-xl rounded-2xl border border-border/50 bg-card p-6 backdrop-blur-glass shadow-glass space-y-4 relative"
      >
        {/* Close button */}
        <button
          onClick={onClose}
          className="absolute right-4 top-4 text-muted-foreground hover:text-primary-foreground p-1 rounded-lg hover:bg-slate-900/60 transition-all"
        >
          <X className="h-4 w-4" />
        </button>

        {/* Title */}
        <div className="flex items-center gap-2 border-b border-border/30 pb-3">
          <FileVideo className="h-5 w-5 text-indigo-400" />
          <h3 className="text-base font-bold text-primary-foreground">Archive Stream as Sermon</h3>
        </div>

        {/* Content Form */}
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="sm:col-span-2">
              <label className={labelClass}>Sermon Title *</label>
              <input
                type="text"
                className={inputClass}
                {...register("title", { required: "Sermon title is required" })}
              />
              {errors.title && <p className={errorClass}>{errors.title.message}</p>}
            </div>

            <div>
              <label className={labelClass}>Preacher / Speaker *</label>
              <input
                type="text"
                className={inputClass}
                {...register("speaker", { required: "Speaker name is required" })}
              />
              {errors.speaker && <p className={errorClass}>{errors.speaker.message}</p>}
            </div>

            <div>
              <label className={labelClass}>Category *</label>
              <select
                className={cn(inputClass, "cursor-pointer")}
                {...register("category", { required: "Category is required" })}
              >
                {SERMON_CATEGORIES.map((cat) => (
                  <option key={cat} value={cat}>
                    {cat}
                  </option>
                ))}
              </select>
            </div>

            <div className="sm:col-span-2">
              <label className={labelClass}>Scripture Reference</label>
              <input
                type="text"
                placeholder="e.g. John 3:16, Psalms 23:1"
                className={inputClass}
                {...register("scripture_reference")}
              />
            </div>

            <div className="sm:col-span-2">
              <label className={labelClass}>Description / Overview</label>
              <textarea
                rows={2}
                className={cn(inputClass, "resize-none")}
                {...register("description")}
              />
            </div>

            <div className="sm:col-span-2">
              <label className={labelClass}>Study Notes</label>
              <textarea
                rows={2}
                className={cn(inputClass, "resize-none")}
                {...register("notes")}
              />
            </div>
          </div>

          <div className="rounded-xl border border-indigo-500/20 bg-indigo-500/5 p-3 flex items-start space-x-2 text-xs text-slate-300">
            <AlertCircle className="h-4.5 w-4.5 text-indigo-400 shrink-0 mt-0.5" />
            <p className="leading-relaxed">
              Archiving this live stream saves the media reference link and outlines to the public Sermons gallery, making it accessible to both members and guests immediately.
            </p>
          </div>

          <div className="flex gap-2 justify-end pt-2 border-t border-border/30">
            <button
              type="button"
              onClick={onClose}
              className="rounded-xl border border-border/50 bg-card/40 px-4 py-2.5 text-xs font-semibold text-muted-foreground hover:text-primary-foreground"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="flex items-center gap-1.5 rounded-xl bg-primary px-5 py-2.5 text-xs font-semibold text-primary-foreground shadow-neon hover:brightness-110 disabled:opacity-50"
            >
              <Save className="h-4 w-4" />
              {isSubmitting ? "Saving Sermon..." : "Archive & Publish"}
            </button>
          </div>
        </form>
      </motion.div>
    </div>
  );
}
