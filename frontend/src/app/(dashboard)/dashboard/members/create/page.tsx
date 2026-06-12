"use client";

import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { ArrowLeft } from "lucide-react";
import { MemberForm } from "@/features/members/components/member-form";
import { useMemberPermissions } from "@/features/members/hooks/use-member-permissions";
import type { MemberFormValues } from "@/features/members/types/member.types";

export default function CreateMemberPage() {
  const router = useRouter();
  const { canCreate } = useMemberPermissions();

  if (!canCreate) {
    return (
      <div className="flex flex-col items-center justify-center py-24 text-center">
        <p className="text-lg font-semibold text-primary-foreground">
          Access Denied
        </p>
        <p className="mt-2 text-sm text-muted-foreground">
          You don't have permission to add new members.
        </p>
        <button
          type="button"
          onClick={() => router.back()}
          className="mt-6 rounded-xl bg-primary/15 px-4 py-2 text-sm font-medium text-primary hover:bg-primary/25"
        >
          Go back
        </button>
      </div>
    );
  }

  const handleSubmit = (values: MemberFormValues) => {
    // In production: call POST /api/members here
    console.info("Creating member:", values);
    router.push("/dashboard/members");
  };

  return (
    <div className="space-y-6">
      <motion.div
        initial={{ opacity: 0, y: -8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.35 }}
        className="flex items-center gap-3"
      >
        <button
          type="button"
          onClick={() => router.back()}
          className="flex h-9 w-9 items-center justify-center rounded-xl border border-border/50 bg-card/60 text-muted-foreground transition-all hover:border-border/80 hover:text-primary-foreground"
          aria-label="Go back to members list"
        >
          <ArrowLeft className="h-4 w-4" aria-hidden="true" />
        </button>
        <div>
          <h1 className="font-display text-xl font-bold text-primary-foreground">
            Add New Member
          </h1>
          <p className="text-sm text-muted-foreground">
            Register a new church member
          </p>
        </div>
      </motion.div>

      <MemberForm onSubmit={handleSubmit} />
    </div>
  );
}
