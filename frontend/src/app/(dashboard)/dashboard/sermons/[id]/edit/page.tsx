"use client";

import { useParams, useRouter } from "next/navigation";
import { ArrowLeft, Lock, AlertTriangle } from "lucide-react";
import { toast } from "sonner";
import { useSermons, SermonForm } from "@/features/sermons";
import { useAppPermissions } from "@/hooks/use-app-permissions";
import { SectionHeader } from "@/features/dashboard/components/widgets/section-header";

export default function EditSermonPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const { getSermonById, updateSermon, isLoading } = useSermons();
  const { sermons: sermonPermissions } = useAppPermissions();
  const canEdit = sermonPermissions.canEdit;

  const sermon = getSermonById(id);

  if (isLoading && !sermon) {
    return (
      <div className="flex min-h-[400px] items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-indigo-500 border-t-transparent" />
      </div>
    );
  }

  const handleFormSubmit = async (values: any) => {
    if (!sermon) return;
    try {
      const updated = await updateSermon(sermon.id, values);
      if (updated) {
        router.push(`/dashboard/sermons/${sermon.id}`);
      }
    } catch {
      toast.error("Failed to update sermon. Please try again.");
    }
  };

  if (!canEdit) {
    return (
      <div className="flex min-h-[400px] flex-col items-center justify-center text-center p-6">
        <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-rose-500/10 text-rose-400 border border-rose-500/20 mb-4">
          <Lock className="h-6 w-6" />
        </div>
        <h3 className="text-base font-bold text-primary-foreground">Access Denied</h3>
        <p className="mt-1 text-xs text-muted-foreground max-w-xs leading-normal">
          You do not have the permissions required to edit sermons. Please contact your system administrator.
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
          The sermon message you want to edit does not exist or has been removed.
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

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <button
          type="button"
          onClick={() => router.back()}
          className="flex h-9 w-9 items-center justify-center rounded-xl border border-border/50 bg-card/60 text-muted-foreground transition-all hover:border-border/80 hover:text-primary-foreground"
          aria-label="Go back to sermon details"
        >
          <ArrowLeft className="h-4 w-4" aria-hidden="true" />
        </button>
        <SectionHeader
          title="Edit Sermon"
          description={`Modify details for: ${sermon.title}`}
        />
      </div>

      <SermonForm sermon={sermon} onSubmit={handleFormSubmit} />
    </div>
  );
}
