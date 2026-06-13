"use client";

import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { ChevronLeft } from "lucide-react";
import Link from "next/link";
import { usePrayers } from "@/features/prayer";
import { PrayerForm } from "@/features/prayer/components/prayer-form";
import { useAuth } from "@/hooks/use-auth";

export default function SubmitPrayerPage() {
  const router = useRouter();
  const { user } = useAuth();
  const { addRequest } = usePrayers();

  const handleSubmit = (values: {
    title: string;
    description: string;
    category: any;
    anonymous: boolean;
  }) => {
    if (!user) {
      toast.error("You must be logged in to submit a prayer request.");
      return;
    }

    const userName = `${user.first_name || ""} ${user.last_name || ""}`.trim() || user.email;

    addRequest({
      title: values.title,
      description: values.description,
      category: values.category,
      anonymous: values.anonymous,
      user_id: user.id,
      user_name: userName,
    });

    toast.success("Prayer request submitted successfully.");
    router.push("/dashboard/prayer");
  };

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
          Submit Prayer Request
        </h1>
        <p className="text-muted-foreground text-xs mt-1">
          Let us stand in agreement with you. Our prayer team reviews all requests.
        </p>
      </div>

      {/* Form Container */}
      <div className="rounded-2xl border border-border/50 bg-card/45 p-6 backdrop-blur-glass">
        <PrayerForm onSubmit={handleSubmit} />
      </div>
    </div>
  );
}
