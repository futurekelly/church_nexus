"use client";

import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { ArrowLeft, UserCheck, ShieldAlert } from "lucide-react";
import { useFollowUp, useFollowUpPermissions, VisitorForm } from "@/features/follow-up";
import Link from "next/link";

export default function CreateFollowUpPage() {
  const router = useRouter();
  const { addVisitor } = useFollowUp();
  const { canManage } = useFollowUpPermissions();

  const handleFormSubmit = (values: any) => {
    if (!canManage) return;
    const noteText = values.notes || `Registered visitor manually. Reason: ${values.visit_reason || "None"}`;
    addVisitor(values, noteText);
    router.push("/dashboard/follow-up");
  };

  if (!canManage) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] text-center p-6 select-none">
        <div className="rounded-2xl border border-border/40 bg-card/40 p-8 max-w-md backdrop-blur-glass shadow-glass">
          <ShieldAlert className="h-10 w-10 text-amber-400 mx-auto mb-4" />
          <h3 className="text-base font-bold text-primary-foreground">Access Denied</h3>
          <p className="text-xs text-muted-foreground mt-2">
            You do not have the required permissions to register new visitors manually.
          </p>
          <button
            type="button"
            onClick={() => router.push("/dashboard/follow-up")}
            className="mt-6 inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-slate-800 text-xs font-semibold text-primary-foreground hover:bg-slate-700 transition-all"
          >
            <ArrowLeft className="h-4 w-4" />
            <span>Go Back</span>
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-xl mx-auto">
      {/* Header */}
      <div className="flex items-center gap-3">
        <Link
          href="/dashboard/follow-up"
          className="flex h-9 w-9 items-center justify-center rounded-xl border border-border/50 bg-card/40 hover:bg-slate-900 transition-colors text-muted-foreground hover:text-primary-foreground"
          aria-label="Back to board"
        >
          <ArrowLeft className="h-4 w-4" />
        </Link>
        <div>
          <h1 className="font-display text-xl font-bold text-primary-foreground">
            Register Visitor
          </h1>
          <p className="text-xs text-muted-foreground">
            Register a visitor manually to create a new ticket in the pipeline
          </p>
        </div>
      </div>

      {/* Form Card */}
      <motion.div
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.35 }}
        className="rounded-2xl border border-border/50 bg-card/60 p-6 backdrop-blur-glass shadow-glass"
      >
        <VisitorForm
          onSubmit={handleFormSubmit}
          onCancel={() => router.push("/dashboard/follow-up")}
        />
      </motion.div>
    </div>
  );
}
