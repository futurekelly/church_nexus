// ─────────────────────────────────────────────────────────────────
// Member module TypeScript types — aligned with DATABASE_ERD.md
// ─────────────────────────────────────────────────────────────────

import type { Role } from "@/types/roles";

export type MemberStatus = "active" | "inactive" | "visitor" | "suspended";
export type MemberGender = "male" | "female";

export const MEMBER_STATUSES: MemberStatus[] = [
  "active",
  "inactive",
  "visitor",
  "suspended",
];

export const MINISTRIES = [
  "Youth",
  "Choir",
  "Ushers",
  "Media",
  "Women's Ministry",
  "Men's Fellowship",
  "Prayer Team",
  "Evangelism",
  "Children's Ministry",
  "Hospitality",
] as const;

export type Ministry = (typeof MINISTRIES)[number];

export const STATUS_LABELS: Record<MemberStatus, string> = {
  active: "Active",
  inactive: "Inactive",
  visitor: "Visitor",
  suspended: "Suspended",
};

export const STATUS_COLORS: Record<
  MemberStatus,
  { bg: string; text: string; dot: string }
> = {
  active: {
    bg: "bg-teal-500/15",
    text: "text-teal-400",
    dot: "bg-teal-400",
  },
  inactive: {
    bg: "bg-muted/30",
    text: "text-muted-foreground",
    dot: "bg-muted-foreground",
  },
  visitor: {
    bg: "bg-amber-500/15",
    text: "text-amber-400",
    dot: "bg-amber-400",
  },
  suspended: {
    bg: "bg-red-500/15",
    text: "text-red-400",
    dot: "bg-red-400",
  },
};

export interface Member {
  id: string;
  membership_number: string;
  first_name: string;
  last_name: string;
  email: string;
  phone_number: string;
  gender: MemberGender;
  date_of_birth: string; // ISO date string
  address: string;
  date_joined: string; // ISO date string
  status: MemberStatus;
  role: Role;
  ministries: Ministry[];
  profile_photo?: string;
  occupation?: string;
  notes?: string;
  created_at: string;
  updated_at: string;
}

export interface MemberActivity {
  id: string;
  type: "joined" | "event" | "donation" | "prayer" | "role_change" | "status_change" | "sermon";
  description: string;
  timestamp: string;
}

export interface MemberFilters {
  search: string;
  status: MemberStatus | "all";
  ministry: Ministry | "all";
  gender: MemberGender | "all";
  role: Role | "all";
}

export interface MemberSortConfig {
  field: keyof Pick<Member, "first_name" | "last_name" | "date_joined" | "status">;
  direction: "asc" | "desc";
}

export interface MemberFormValues {
  first_name: string;
  last_name: string;
  email: string;
  phone_number: string;
  gender: MemberGender;
  date_of_birth: string;
  address: string;
  date_joined: string;
  status: MemberStatus;
  ministries: Ministry[];
  occupation?: string;
  notes?: string;
}

export const DEFAULT_FILTERS: MemberFilters = {
  search: "",
  status: "all",
  ministry: "all",
  gender: "all",
  role: "all",
};

export const MEMBERS_PER_PAGE = 10;
