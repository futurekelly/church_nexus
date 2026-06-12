"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { ArrowUpDown, ArrowUp, ArrowDown, Eye, Pencil, Trash2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { MemberStatusBadge } from "@/features/members/components/member-status-badge";
import { useMemberPermissions } from "@/features/members/hooks/use-member-permissions";
import { ROLE_LABELS } from "@/types/roles";
import type { Member, MemberSortConfig } from "@/features/members/types/member.types";
import { getInitials } from "@/lib/utils";

interface MemberTableProps {
  members: Member[];
  sort: MemberSortConfig;
  onSort: (field: MemberSortConfig["field"]) => void;
  onDelete?: (member: Member) => void;
  isLoading?: boolean;
}

function SortIcon({
  field,
  sort,
}: {
  field: MemberSortConfig["field"];
  sort: MemberSortConfig;
}) {
  if (sort.field !== field)
    return <ArrowUpDown className="ml-1 h-3.5 w-3.5 text-muted-foreground/50" aria-hidden="true" />;
  return sort.direction === "asc" ? (
    <ArrowUp className="ml-1 h-3.5 w-3.5 text-primary" aria-hidden="true" />
  ) : (
    <ArrowDown className="ml-1 h-3.5 w-3.5 text-primary" aria-hidden="true" />
  );
}

function ThButton({
  label,
  field,
  sort,
  onSort,
}: {
  label: string;
  field: MemberSortConfig["field"];
  sort: MemberSortConfig;
  onSort: (f: MemberSortConfig["field"]) => void;
}) {
  return (
    <button
      type="button"
      onClick={() => onSort(field)}
      className="flex items-center text-left text-xs font-medium text-muted-foreground transition-colors hover:text-primary-foreground"
      aria-label={`Sort by ${label} ${sort.field === field && sort.direction === "asc" ? "descending" : "ascending"}`}
    >
      {label}
      <SortIcon field={field} sort={sort} />
    </button>
  );
}

function AvatarCell({ member }: { member: Member }) {
  return (
    <div className="flex items-center gap-3">
      {member.profile_photo ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={member.profile_photo}
          alt={`${member.first_name} ${member.last_name}`}
          className="h-9 w-9 rounded-full object-cover ring-2 ring-border/50"
        />
      ) : (
        <div className="flex h-9 w-9 items-center justify-center rounded-full bg-primary/15 text-xs font-bold text-primary ring-2 ring-border/30">
          {getInitials(member.first_name, member.last_name)}
        </div>
      )}
      <div className="min-w-0">
        <p className="truncate text-sm font-semibold text-primary-foreground">
          {member.first_name} {member.last_name}
        </p>
        <p className="truncate text-xs text-muted-foreground">
          {member.membership_number}
        </p>
      </div>
    </div>
  );
}

export function MemberTable({
  members,
  sort,
  onSort,
  onDelete,
  isLoading = false,
}: MemberTableProps) {
  const { canEdit, canDelete, canViewContactDetails } = useMemberPermissions();

  if (isLoading) {
    return (
      <div className="overflow-hidden rounded-2xl border border-border/50 bg-card/60 backdrop-blur-[16px] shadow-glass">
        <div className="divide-y divide-border/30">
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="flex items-center gap-4 px-5 py-4 animate-pulse">
              <div className="h-9 w-9 rounded-full bg-card" />
              <div className="flex-1 space-y-2">
                <div className="h-3 w-32 rounded bg-card" />
                <div className="h-3 w-20 rounded bg-card" />
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="overflow-hidden rounded-2xl border border-border/50 bg-card/60 backdrop-blur-[16px] shadow-glass">
      <div className="overflow-x-auto">
        <table className="w-full min-w-[640px] text-sm" aria-label="Members table">
          <thead>
            <tr className="border-b border-border/50 bg-card/30">
              <th scope="col" className="px-5 py-3.5 text-left">
                <ThButton label="Name" field="first_name" sort={sort} onSort={onSort} />
              </th>
              {canViewContactDetails && (
                <th scope="col" className="px-5 py-3.5 text-left">
                  <span className="text-xs font-medium text-muted-foreground">Contact</span>
                </th>
              )}
              <th scope="col" className="px-5 py-3.5 text-left">
                <ThButton label="Joined" field="date_joined" sort={sort} onSort={onSort} />
              </th>
              <th scope="col" className="px-5 py-3.5 text-left">
                <ThButton label="Status" field="status" sort={sort} onSort={onSort} />
              </th>
              <th scope="col" className="px-5 py-3.5 text-left">
                <span className="text-xs font-medium text-muted-foreground">Role</span>
              </th>
              <th scope="col" className="px-5 py-3.5 text-left">
                <span className="text-xs font-medium text-muted-foreground">Ministry</span>
              </th>
              <th scope="col" className="px-5 py-3.5">
                <span className="sr-only">Actions</span>
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border/30">
            {members.map((member, idx) => (
              <motion.tr
                key={member.id}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.2, delay: idx * 0.03 }}
                className="group transition-colors hover:bg-primary/5"
              >
                <td className="px-5 py-4">
                  <AvatarCell member={member} />
                </td>

                {canViewContactDetails && (
                  <td className="px-5 py-4">
                    <p className="text-sm text-primary-foreground/80">{member.email}</p>
                    <p className="text-xs text-muted-foreground">{member.phone_number}</p>
                  </td>
                )}

                <td className="px-5 py-4 text-sm text-muted-foreground whitespace-nowrap">
                  {new Date(member.date_joined).toLocaleDateString("en-KE", {
                    day: "numeric",
                    month: "short",
                    year: "numeric",
                  })}
                </td>

                <td className="px-5 py-4">
                  <MemberStatusBadge status={member.status} />
                </td>

                <td className="px-5 py-4 text-xs text-muted-foreground">
                  {ROLE_LABELS[member.role]}
                </td>

                <td className="px-5 py-4">
                  <div className="flex flex-wrap gap-1">
                    {member.ministries.slice(0, 2).map((min) => (
                      <span
                        key={min}
                        className="rounded-full bg-primary/10 px-2 py-0.5 text-xs text-primary"
                      >
                        {min}
                      </span>
                    ))}
                    {member.ministries.length > 2 && (
                      <span className="rounded-full bg-muted/30 px-2 py-0.5 text-xs text-muted-foreground">
                        +{member.ministries.length - 2}
                      </span>
                    )}
                  </div>
                </td>

                <td className="px-5 py-4">
                  <div className="flex items-center justify-end gap-2 opacity-0 transition-opacity group-hover:opacity-100">
                    <Link
                      href={`/dashboard/members/${member.id}`}
                      className="flex h-7 w-7 items-center justify-center rounded-lg bg-primary/10 text-primary transition-all hover:bg-primary/20"
                      aria-label={`View ${member.first_name} ${member.last_name}`}
                    >
                      <Eye className="h-3.5 w-3.5" aria-hidden="true" />
                    </Link>

                    {canEdit && (
                      <Link
                        href={`/dashboard/members/${member.id}/edit`}
                        className="flex h-7 w-7 items-center justify-center rounded-lg bg-blue-500/10 text-blue-400 transition-all hover:bg-blue-500/20"
                        aria-label={`Edit ${member.first_name} ${member.last_name}`}
                      >
                        <Pencil className="h-3.5 w-3.5" aria-hidden="true" />
                      </Link>
                    )}

                    {canDelete && onDelete && (
                      <button
                        type="button"
                        onClick={() => onDelete(member)}
                        className="flex h-7 w-7 items-center justify-center rounded-lg bg-red-500/10 text-red-400 transition-all hover:bg-red-500/20"
                        aria-label={`Delete ${member.first_name} ${member.last_name}`}
                      >
                        <Trash2 className="h-3.5 w-3.5" aria-hidden="true" />
                      </button>
                    )}
                  </div>
                </td>
              </motion.tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
