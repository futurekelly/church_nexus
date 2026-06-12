"use client";

import { useParams, useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { ArrowLeft, Trash2 } from "lucide-react";
import { MemberProfileCard } from "@/features/members/components/member-profile-card";
import { MemberActivityTimeline } from "@/features/members/components/member-activity-timeline";
import { useMembers } from "@/features/members/hooks/use-members";
import { useMemberPermissions } from "@/features/members/hooks/use-member-permissions";
import {
  MOCK_MEMBER_ACTIVITIES,
  DEFAULT_MEMBER_ACTIVITY,
} from "@/features/members/data/mock-members";
import { cn } from "@/lib/utils";

export default function MemberDetailPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const { getMemberById } = useMembers();
  const { canDelete, canViewActivity } = useMemberPermissions();

  const member = getMemberById(id);

  if (!member) {
    return (
      <div className="flex flex-col items-center justify-center py-24 text-center">
        <p className="text-lg font-semibold text-primary-foreground">
          Member not found
        </p>
        <p className="mt-2 text-sm text-muted-foreground">
          The member you're looking for doesn't exist or has been removed.
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

  const activities = MOCK_MEMBER_ACTIVITIES[member.id] ?? DEFAULT_MEMBER_ACTIVITY;

  return (
    <div className="space-y-6">
      {/* Back navigation + page header */}
      <motion.div
        initial={{ opacity: 0, y: -8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.35 }}
        className="flex flex-wrap items-center justify-between gap-4"
      >
        <div className="flex items-center gap-3">
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
              {member.first_name} {member.last_name}
            </h1>
            <p className="text-sm text-muted-foreground">
              {member.membership_number}
            </p>
          </div>
        </div>

        {canDelete && (
          <button
            type="button"
            onClick={() => {
              // In production: open confirm dialog
              console.info(`Delete member: ${member.id}`);
            }}
            className={cn(
              "flex items-center gap-2 rounded-xl border border-red-500/30 bg-red-500/10 px-4 py-2 text-sm font-medium text-red-400",
              "transition-all hover:bg-red-500/20",
            )}
            aria-label={`Delete ${member.first_name} ${member.last_name}`}
          >
            <Trash2 className="h-4 w-4" aria-hidden="true" />
            Delete Member
          </button>
        )}
      </motion.div>

      {/* Main content grid */}
      <div className="grid gap-6 lg:grid-cols-3">
        {/* Profile card — 2/3 width on desktop */}
        <div className="lg:col-span-2">
          <MemberProfileCard member={member} />
        </div>

        {/* Activity timeline — 1/3 width on desktop, full row on mobile */}
        {canViewActivity && (
          <div className="lg:col-span-1">
            <MemberActivityTimeline activities={activities} />
          </div>
        )}
      </div>
    </div>
  );
}
