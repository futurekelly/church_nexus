"use client";

import { useParams, useRouter } from "next/navigation";
import { Lock, AlertTriangle, ChevronLeft } from "lucide-react";
import { toast } from "sonner";
import Link from "next/link";
import { usePrayers } from "@/features/prayer";
import { useAppPermissions } from "@/hooks/use-app-permissions";
import { PrayerForm } from "@/features/prayer/components/prayer-form";

export default function EditPrayerRequestPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const { getRequestById, updateRequest } = usePrayers();
  const { prayer: prayerPermissions } = useAppPermissions();
  const { canEdit } = prayerPermissions;

  const request = getRequestById(id);

  const handleFormSubmit = (values: any) => {
    if (!request) return;
    try {
      updateRequest(request.id, values);
      toast.success("Prayer request updated successfully!");
      router.push("/dashboard/prayer");
    } catch {
      toast.error("Failed to update prayer request. Please try again.");
    }
  };

  if (!request) {
    return (
      <div className="flex flex-col items-center justify-center py-24 text-center">
        <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-slate-800 text-muted-foreground mb-4">
          <AlertTriangle className="h-6 w-6" />
        </div>
        <p className="text-lg font-semibold text-primary-foreground">
          Request not found
        </p>
        <p className="mt-2 text-sm text-muted-foreground">
          The prayer request you want to edit does not exist or has been removed.
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

  const isUserAllowed = canEdit(request.user_id);

  if (!isUserAllowed) {
    return (
      <div className="flex min-h-[400px] flex-col items-center justify-center text-center p-6">
        <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-rose-500/10 text-rose-400 border border-rose-500/20 mb-4">
          <Lock className="h-6 w-6" />
        </div>
        <h3 className="text-base font-bold text-primary-foreground">Access Denied</h3>
        <p className="mt-1 text-xs text-muted-foreground max-w-xs leading-normal">
          You do not have the permissions required to edit this prayer request.
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
    <div className="max-w-2xl mx-auto space-y-6">
      {/* Back navigation */}
      <div className="flex items-center gap-2">
        <Link
          href="/dashboard/prayer"
          className="flex h-8 w-8 items-center justify-center rounded-lg border border-border/50 bg-card/60 text-muted-foreground transition-all hover:border-primary/40 hover:text-primary hover:bg-primary/5"
          aria-label="Back to Prayer dashboard"
        >
          <ChevronLeft className="h-4 w-4" />
        </Link>
        <span className="text-sm text-muted-foreground">Back to Prayer Center</span>
      </div>

      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-primary-foreground">
          Edit Prayer Request
        </h1>
        <p className="text-muted-foreground text-xs mt-1">
          Modify details of your prayer request.
        </p>
      </div>

      {/* Form Container */}
      <div className="rounded-2xl border border-border/50 bg-card/45 p-6 backdrop-blur-glass">
        <PrayerForm request={request} defaultValues={request} onSubmit={handleFormSubmit} />
      </div>
    </div>
  );
}
