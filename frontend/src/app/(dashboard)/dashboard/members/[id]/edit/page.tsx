"use client";

import { useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { ArrowLeft } from "lucide-react";
import { toast } from "sonner";
import { MemberForm } from "@/features/members/components/member-form";
import { useMembers } from "@/features/members/hooks/use-members";
import { useAppPermissions } from "@/hooks/use-app-permissions";
import type { MemberFormValues } from "@/features/members/types/member.types";

export default function EditMemberPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const { getMemberById, updateMember } = useMembers();
  const { members } = useAppPermissions();
  const canEdit = members.canEdit;
  const [isLoading, setIsLoading] = useState(false);

  const member = getMemberById(id);

  if (!canEdit) {
    return (
      <div className="flex flex-col items-center justify-center py-24 text-center">
        <p className="text-lg font-semibold text-primary-foreground">
          Access Denied
        </p>
        <p className="mt-2 text-sm text-muted-foreground">
          You don't have permission to edit member profiles.
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

  if (!member) {
    return (
      <div className="flex flex-col items-center justify-center py-24 text-center">
        <p className="text-lg font-semibold text-primary-foreground">Member not found</p>
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

  const defaultValues: MemberFormValues = {
    first_name: member.first_name,
    last_name: member.last_name,
    email: member.email,
    phone_number: member.phone_number,
    gender: member.gender,
    date_of_birth: member.date_of_birth,
    address: member.address,
    date_joined: member.date_joined,
    status: member.status,
    ministries: member.ministries,
    occupation: member.occupation ?? "",
    notes: member.notes ?? "",
    role: member.role,
  };

  const handleSubmit = async (values: MemberFormValues) => {
    setIsLoading(true);
    try {
      const updated = await updateMember(member.id, values);
      if (updated) {
        toast.success("Member profile updated successfully");
        router.push(`/dashboard/members/${member.id}`);
      }
    } catch (err: any) {
      toast.error(err.message || "Failed to update member profile");
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
          aria-label="Go back"
        >
          <ArrowLeft className="h-4 w-4" aria-hidden="true" />
        </button>
        <div>
          <h1 className="font-display text-xl font-bold text-primary-foreground">
            Edit Member
          </h1>
          <p className="text-sm text-muted-foreground">
            {member.first_name} {member.last_name} · {member.membership_number}
          </p>
        </div>
      </motion.div>

      <MemberForm
        member={member}
        defaultValues={defaultValues}
        onSubmit={handleSubmit}
        isLoading={isLoading}
      />
    </div>
  );
}
