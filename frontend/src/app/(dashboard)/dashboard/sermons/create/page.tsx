"use client";

import { useRouter } from "next/navigation";
import { ArrowLeft, Lock } from "lucide-react";
import { toast } from "sonner";
import { useSermons, useSermonPermissions, SermonForm } from "@/features/sermons";
import { SectionHeader } from "@/features/dashboard/components/widgets/section-header";

export default function CreateSermonPage() {
  const router = useRouter();
  const { addSermon } = useSermons();
  const { canCreate } = useSermonPermissions();

  const handleFormSubmit = (values: any) => {
    try {
      const newSermon = addSermon(values);
      toast.success("Sermon created successfully!");
      router.push(`/dashboard/sermons/${newSermon.id}`);
    } catch {
      toast.error("Failed to create sermon. Please try again.");
    }
  };

  if (!canCreate) {
    return (
      <div className="flex min-h-[400px] flex-col items-center justify-center text-center p-6">
        <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-rose-500/10 text-rose-400 border border-rose-500/20 mb-4">
          <Lock className="h-6 w-6" />
        </div>
        <h3 className="text-base font-bold text-primary-foreground">Access Denied</h3>
        <p className="mt-1 text-xs text-muted-foreground max-w-xs leading-normal">
          You do not have the permissions required to create sermons. Please contact your system administrator.
        </p>
        <button
          onClick={() => router.back()}
          className="mt-6 rounded-xl border border-border bg-card/60 px-4 py-2 text-xs font-semibold text-muted-foreground hover:text-primary-foreground transition-all"
        >
          Go Back
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <button
          type="button"
          onClick={() => router.back()}
          className="flex h-9 w-9 items-center justify-center rounded-xl border border-border/50 bg-card/60 text-muted-foreground transition-all hover:border-border/80 hover:text-primary-foreground"
          aria-label="Go back to sermons list"
        >
          <ArrowLeft className="h-4 w-4" aria-hidden="true" />
        </button>
        <SectionHeader
          title="Create New Sermon"
          description="Publish a new sermon message with study guide outlines, video, and audio links"
        />
      </div>

      <SermonForm onSubmit={handleFormSubmit} />
    </div>
  );
}
