"use client";

import { useState } from "react";
import { useForm, Controller } from "react-hook-form";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowLeft, MessageSquare, CheckCircle, Image, Video, HelpCircle } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useTestimonies } from "@/features/testimonies";
import type { TestimonyCategory, TestimonyFormValues } from "@/features/testimonies";
import { cn } from "@/lib/utils";

const CATEGORIES: TestimonyCategory[] = [
  "Healing",
  "Provision",
  "Restoration",
  "Salvation",
  "Deliverance",
  "Family",
  "Education",
  "Business",
  "General",
];

const inputClass = cn(
  "w-full rounded-xl border border-border/50 bg-card/60 px-4 py-2.5",
  "text-sm text-primary-foreground placeholder:text-muted-foreground/50",
  "backdrop-blur-[16px] transition-all duration-200",
  "focus:border-indigo-500/50 focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
);

const labelClass = "block text-xs font-semibold text-muted-foreground mb-1.5";
const errorClass = "mt-1 text-xs text-red-400";

export default function SubmitTestimonyPage() {
  const router = useRouter();
  const { addTestimony } = useTestimonies();
  const [success, setSuccess] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const {
    register,
    handleSubmit,
    watch,
    control,
    formState: { errors },
  } = useForm<TestimonyFormValues>({
    defaultValues: {
      title: "",
      content: "",
      category: "General",
      author_name: "",
      author_email: "",
      is_anonymous: false,
      image_url: "",
      video_url: "",
    },
  });

  const watchAnonymous = watch("is_anonymous");

  const onSubmit = (values: TestimonyFormValues) => {
    setIsSubmitting(true);
    // Simulate API delay
    setTimeout(() => {
      addTestimony(values);
      setIsSubmitting(false);
      setSuccess(true);
    }, 800);
  };

  return (
    <div className="space-y-6 max-w-xl mx-auto px-4 py-8">
      {/* Header */}
      <div className="flex items-center gap-3">
        <Link
          href="/testimonies"
          className="flex h-9 w-9 items-center justify-center rounded-xl border border-border/50 bg-card/40 hover:bg-slate-900 transition-colors text-muted-foreground hover:text-primary-foreground"
          aria-label="Back to wall"
        >
          <ArrowLeft className="h-4 w-4" />
        </Link>
        <div>
          <h1 className="font-display text-xl font-bold text-primary-foreground">
            Share Your Testimony
          </h1>
          <p className="text-xs text-muted-foreground">
            Tell others about what God has done in your life
          </p>
        </div>
      </div>

      <AnimatePresence mode="wait">
        {!success ? (
          <motion.div
            key="form-card"
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -15 }}
            transition={{ duration: 0.35 }}
            className="rounded-2xl border border-border/50 bg-card/60 p-6 backdrop-blur-glass shadow-glass"
          >
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4" noValidate>
              {/* Category */}
              <div>
                <label htmlFor="category" className={labelClass}>
                  Testimony Category *
                </label>
                <select
                  id="category"
                  className={cn(inputClass, "appearance-none bg-slate-900")}
                  {...register("category", { required: "Category is required" })}
                >
                  {CATEGORIES.map((cat) => (
                    <option key={cat} value={cat}>
                      {cat}
                    </option>
                  ))}
                </select>
                {errors.category && <p className={errorClass}>{errors.category.message}</p>}
              </div>

              {/* Title */}
              <div>
                <label htmlFor="title" className={labelClass}>
                  Testimony Title *
                </label>
                <input
                  id="title"
                  type="text"
                  placeholder="e.g., God healed my body"
                  className={cn(inputClass, errors.title && "border-rose-500")}
                  {...register("title", {
                    required: "Title is required",
                    minLength: { value: 5, message: "Must be at least 5 characters" },
                    maxLength: { value: 100, message: "Cannot exceed 100 characters" },
                  })}
                />
                {errors.title && <p className={errorClass}>{errors.title.message}</p>}
              </div>

              {/* Content */}
              <div>
                <label htmlFor="content" className={labelClass}>
                  Your Story *
                </label>
                <textarea
                  id="content"
                  rows={6}
                  placeholder="Share details of what happened..."
                  className={cn(inputClass, "resize-none", errors.content && "border-rose-500")}
                  {...register("content", {
                    required: "Story content is required",
                    minLength: { value: 20, message: "Story must be at least 20 characters" },
                  })}
                />
                {errors.content && <p className={errorClass}>{errors.content.message}</p>}
              </div>

              {/* Anonymous Checkbox */}
              <div className="flex items-center gap-2 py-1 select-none">
                <input
                  id="is_anonymous"
                  type="checkbox"
                  className="rounded border-border/50 text-indigo-500 focus:ring-indigo-500 bg-card/60"
                  {...register("is_anonymous")}
                />
                <label htmlFor="is_anonymous" className="text-xs text-slate-300 font-medium cursor-pointer">
                  Submit anonymously (author name will display as "Anonymous Partner")
                </label>
              </div>

              {/* Author fields (only if NOT anonymous) */}
              {!watchAnonymous && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  className="space-y-4 border-t border-border/30 pt-4"
                >
                  <div>
                    <label htmlFor="author_name" className={labelClass}>
                      Your Name *
                    </label>
                    <input
                      id="author_name"
                      type="text"
                      placeholder="e.g. Mary Kamau"
                      className={cn(inputClass, errors.author_name && "border-rose-500")}
                      {...register("author_name", {
                        required: !watchAnonymous ? "Your name is required" : false,
                      })}
                    />
                    {errors.author_name && <p className={errorClass}>{errors.author_name.message}</p>}
                  </div>

                  <div>
                    <label htmlFor="author_email" className={labelClass}>
                      Your Email (Optional)
                    </label>
                    <input
                      id="author_email"
                      type="email"
                      placeholder="e.g. mary@example.com"
                      className={inputClass}
                      {...register("author_email")}
                    />
                  </div>
                </motion.div>
              )}

              {/* Media Placeholders (Optional) */}
              <div className="border-t border-border/30 pt-4 space-y-4">
                <h4 className="text-xs font-semibold text-indigo-400 flex items-center gap-1.5">
                  <HelpCircle className="h-3.5 w-3.5" />
                  <span>Media Attachments (Placeholders for Future Use)</span>
                </h4>
                
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label htmlFor="image_url" className={labelClass}>
                      Image URL (Optional)
                    </label>
                    <div className="relative">
                      <Image className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                      <input
                        id="image_url"
                        type="text"
                        placeholder="http://example.com/image.jpg"
                        className={cn(inputClass, "pl-10")}
                        {...register("image_url")}
                      />
                    </div>
                  </div>

                  <div>
                    <label htmlFor="video_url" className={labelClass}>
                      Video URL (Optional)
                    </label>
                    <div className="relative">
                      <Video className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                      <input
                        id="video_url"
                        type="text"
                        placeholder="http://example.com/video.mp4"
                        className={cn(inputClass, "pl-10")}
                        {...register("video_url")}
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* Submit Buttons */}
              <div className="mt-6 flex justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => router.push("/testimonies")}
                  className="rounded-xl border border-border/50 bg-card/60 px-4 py-2 text-sm font-semibold text-muted-foreground transition-all hover:text-primary-foreground"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="flex items-center gap-2 rounded-xl bg-indigo-500 px-5 py-2 text-sm font-semibold text-white transition-all hover:bg-indigo-600 disabled:opacity-50"
                >
                  {isSubmitting ? "Submitting..." : "Submit Testimony"}
                </button>
              </div>
            </form>
          </motion.div>
        ) : (
          <motion.div
            key="success-banner"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="rounded-2xl border border-emerald-500/20 bg-card/60 p-8 text-center backdrop-blur-glass shadow-glass"
          >
            <CheckCircle className="h-12 w-12 text-emerald-400 mx-auto mb-4" />
            <h3 className="font-display text-lg font-bold text-primary-foreground">Submission Received!</h3>
            <p className="text-xs text-muted-foreground mt-2 leading-relaxed">
              Thank you for sharing your story. Your testimony has been submitted for review and will appear on the public testimonies wall once approved by a pastor or church administrator.
            </p>
            <div className="mt-6 flex justify-center gap-3">
              <button
                type="button"
                onClick={() => setSuccess(false)}
                className="rounded-xl border border-border/50 bg-card/60 px-4 py-2 text-xs font-semibold text-slate-300 hover:text-primary-foreground transition-all"
              >
                Submit Another
              </button>
              <Link
                href="/testimonies"
                className="rounded-xl bg-indigo-500 px-4 py-2 text-xs font-semibold text-white hover:bg-indigo-600 transition-all"
              >
                Go to Public Wall
              </Link>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
