"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { ArrowLeft } from "lucide-react";
import { toast } from "sonner";
import { MemberForm } from "@/features/members/components/member-form";
import { useMembers } from "@/features/members/hooks/use-members";
import { useAppPermissions } from "@/hooks/use-app-permissions";
import type { MemberFormValues } from "@/features/members/types/member.types";

export default function CreateMemberPage() {
  const router = useRouter();
  const { addMember } = useMembers();
  const { members } = useAppPermissions();
  const canCreate = members.canCreate;
  const [isLoading, setIsLoading] = useState(false);

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

  const handleSubmit = async (values: MemberFormValues) => {
    setIsLoading(true);
    try {
      const created = await addMember(values);
      if (created) {
        toast.success("Member registered successfully");
        router.push("/dashboard/members");
      }
    } catch (err: any) {
      toast.error(err.message || "Failed to register member");
    } finally {
      setIsLoading(false);
    }
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

      <MemberForm onSubmit={handleSubmit} isLoading={isLoading} />
    </div>
  );
}
