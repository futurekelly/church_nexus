"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import {
  Mail, Phone, MapPin, Briefcase, Calendar, Hash, Pencil,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { MemberStatusBadge } from "@/features/members/components/member-status-badge";
import { useMemberPermissions } from "@/features/members/hooks/use-member-permissions";
import { ROLE_LABELS } from "@/types/roles";
import { getInitials } from "@/lib/utils";
import type { Member } from "@/features/members/types/member.types";

interface MemberProfileCardProps {
  member: Member;
  className?: string;
}

function InfoRow({
  icon: Icon,
  label,
  value,
}: {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  value: string;
}) {
  return (
    <div className="flex items-start gap-3">
      <div className="mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-primary/10">
        <Icon className="h-3.5 w-3.5 text-primary" aria-hidden="true" />
      </div>
      <div className="min-w-0">
        <p className="text-xs text-muted-foreground">{label}</p>
        <p className="mt-0.5 text-sm font-medium text-primary-foreground break-words">{value}</p>
      </div>
    </div>
  );
}

export function MemberProfileCard({ member, className }: MemberProfileCardProps) {
  const { canEdit, canViewContactDetails } = useMemberPermissions();

  const age = member.date_of_birth
    ? Math.floor(
        (Date.now() - new Date(member.date_of_birth).getTime()) /
          (1000 * 60 * 60 * 24 * 365.25),
      )
    : null;

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className={cn(
        "rounded-2xl border border-border/50 bg-card/60 p-6",
        "backdrop-blur-[16px] shadow-glass",
        className,
      )}
    >
      {/* Avatar + name */}
      <div className="flex items-start justify-between gap-4">
        <div className="flex items-center gap-4">
          {member.profile_photo ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={member.profile_photo}
              alt={`${member.first_name} ${member.last_name}`}
              className="h-16 w-16 rounded-2xl object-cover ring-2 ring-border/50"
            />
          ) : (
            <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-primary/15 text-xl font-bold text-primary ring-2 ring-primary/20">
              {getInitials(member.first_name, member.last_name)}
            </div>
          )}
          <div>
            <h2 className="text-xl font-bold text-primary-foreground">
              {member.first_name} {member.last_name}
            </h2>
            <p className="mt-0.5 text-sm text-muted-foreground">
              {ROLE_LABELS[member.role]}
            </p>
            <div className="mt-2">
              <MemberStatusBadge status={member.status} />
            </div>
          </div>
        </div>

        {canEdit && (
          <Link
            href={`/dashboard/members/${member.id}/edit`}
            className="flex items-center gap-1.5 rounded-xl border border-border/50 bg-card/80 px-3 py-1.5 text-xs font-medium text-muted-foreground transition-all hover:border-primary/40 hover:text-primary"
            aria-label={`Edit ${member.first_name} ${member.last_name}'s profile`}
          >
            <Pencil className="h-3.5 w-3.5" aria-hidden="true" />
            Edit
          </Link>
        )}
      </div>

      {/* Info grid */}
      <div className="mt-6 grid gap-4 sm:grid-cols-2">
        <InfoRow
          icon={Hash}
          label="Member Number"
          value={member.membership_number}
        />
        <InfoRow
          icon={Calendar}
          label="Date Joined"
          value={new Date(member.date_joined).toLocaleDateString("en-KE", {
            day: "numeric",
            month: "long",
            year: "numeric",
          })}
        />
        {age !== null && (
          <InfoRow
            icon={Calendar}
            label="Date of Birth"
            value={`${new Date(member.date_of_birth).toLocaleDateString("en-KE", { day: "numeric", month: "long", year: "numeric" })} (${age} yrs)`}
          />
        )}
        {member.occupation && (
          <InfoRow icon={Briefcase} label="Occupation" value={member.occupation} />
        )}

        {canViewContactDetails && (
          <>
            <InfoRow icon={Mail} label="Email" value={member.email} />
            <InfoRow icon={Phone} label="Phone" value={member.phone_number} />
            <InfoRow icon={MapPin} label="Address" value={member.address} />
          </>
        )}
      </div>

      {/* Ministries */}
      {member.ministries.length > 0 && (
        <div className="mt-6">
          <p className="text-xs font-medium text-muted-foreground">Ministries</p>
          <div className="mt-2 flex flex-wrap gap-2">
            {member.ministries.map((min) => (
              <span
                key={min}
                className="rounded-full bg-primary/10 px-3 py-1 text-xs font-medium text-primary"
              >
                {min}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Notes */}
      {member.notes && (
        <div className="mt-5 rounded-xl border border-border/40 bg-card/30 p-3">
          <p className="text-xs font-medium text-muted-foreground">Notes</p>
          <p className="mt-1 text-sm text-primary-foreground/80 leading-relaxed">
            {member.notes}
          </p>
        </div>
      )}
    </motion.div>
  );
}
