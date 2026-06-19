// ─────────────────────────────────────────────────────────────────
// Member module TypeScript types — aligned with DATABASE_ERD.md
// ─────────────────────────────────────────────────────────────────

import type { Role } from "@/types/roles";

export type MemberStatus = 
  | "Visitor" 
  | "New Convert" 
  | "Member" 
  | "Active" 
  | "Inactive" 
  | "Transferred" 
  | "Deceased";

export type MemberGender = "male" | "female";

export const MEMBER_STATUSES: MemberStatus[] = [
  "Visitor",
  "New Convert",
  "Member",
  "Active",
  "Inactive",
  "Transferred",
  "Deceased",
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
  Visitor: "Visitor",
  "New Convert": "New Convert",
  Member: "Member",
  Active: "Active",
  Inactive: "Inactive",
  Transferred: "Transferred",
  Deceased: "Deceased",
};

export const STATUS_COLORS: Record<
  MemberStatus,
  { bg: string; text: string; dot: string }
> = {
  Visitor: {
    bg: "bg-amber-500/15",
    text: "text-amber-400",
    dot: "bg-amber-400",
  },
  "New Convert": {
    bg: "bg-pink-500/15",
    text: "text-pink-400",
    dot: "bg-pink-400",
  },
  Member: {
    bg: "bg-blue-500/15",
    text: "text-blue-400",
    dot: "bg-blue-400",
  },
  Active: {
    bg: "bg-teal-500/15",
    text: "text-teal-400",
    dot: "bg-teal-400",
  },
  Inactive: {
    bg: "bg-muted/30",
    text: "text-muted-foreground",
    dot: "bg-muted-foreground",
  },
  Transferred: {
    bg: "bg-indigo-500/15",
    text: "text-indigo-400",
    dot: "bg-indigo-400",
  },
  Deceased: {
    bg: "bg-slate-500/15",
    text: "text-slate-400",
    dot: "bg-slate-400",
  },
};

export interface Member {
  id: string;
  branch_id: string;
  family_id: string | null;
  membership_number: string;
  first_name: string;
  last_name: string;
  profile_photo: string | null;
  gender: MemberGender;
  date_of_birth: string | null; // ISO date string
  marriage_anniversary_date: string | null; // ISO date string
  marital_status: "Single" | "Married" | "Widowed" | "Divorced";
  occupation: string | null;
  education_level: string | null;
  national_id_passport: string | null;
  
  email: string;
  phone_number: string;
  address: string;
  
  status: MemberStatus;
  member_type: "Regular" | "Leader" | "Clergy";
  baptism_status: "Not Baptized" | "Water Baptized" | "Holy Spirit Baptized";
  baptism_date: string | null;
  baptism_place: string | null;
  baptism_officiant: string | null;
  
  salvation_status: "Born Again" | "Seeking";
  salvation_date: string | null;
  join_date: string;
  date_joined: string; // Backward compatibility with existing UI
  
  emergency_name: string | null;
  emergency_relationship: string | null;
  emergency_phone: string | null;
  
  pastoral_notes: string | null;
  notes: string | null; // Backward compatibility with existing UI
  role: Role; // Backward compatibility with existing UI
  ministries: Ministry[]; // Backward compatibility with existing UI
  
  custom_fields: Record<string, any>;
  communication_preferences: {
    email: boolean;
    sms: boolean;
    in_app: boolean;
  };
  
  donor_status: "Active" | "Inactive" | "Guest" | "Non-Donor";
  recurring_giving_opt_in: boolean;
  
  is_archived: boolean;
  archived_at: string | null;
  created_at: string;
  updated_at: string;

  // Computed / Projected properties (Finance/Reporting integrations)
  total_giving?: number;
  last_giving_date?: string | null;
  active_pledges?: number;
  age_group?: "Child" | "Youth" | "Adult" | "Senior";
  membership_duration?: string;
  attendance_score?: number;
}

export interface MemberActivity {
  id: string;
  type: "joined" | "event" | "donation" | "prayer" | "role_change" | "status_change" | "sermon";
  description: string;
  timestamp: string;
}

export interface Family {
  id: string;
  branch_id: string;
  name: string;
  head_of_household_id: string | null;
  created_at: string;
}

export interface FamilyRelationship {
  id: string;
  from_member_id: string;
  to_member_id: string;
  relationship_type: "Spouse" | "Parent" | "Child" | "Sibling" | "Guardian";
  created_at: string;
}

export interface VolunteerAssignment {
  id: string;
  member_id: string;
  ministry_name: string;
  role: string;
  assigned_at: string;
  is_active: boolean;
}

export interface MemberLifecycleTimeline {
  id: string;
  member_id: string;
  previous_status: MemberStatus;
  new_status: MemberStatus;
  changed_by: string;
  changed_at: string;
  notes: string | null;
}

export interface GroupMembership {
  id: string;
  member_id: string;
  group_id: string;
  role: "Leader" | "Member" | "Assistant";
  joined_at: string;
  exited_at: string | null;
  status: "Active" | "Exited";
}

export interface PaginatedResponse<T> {
  count: number;
  page: number;
  page_size: number;
  total_pages: number;
  next: string | null;
  previous: string | null;
  results: T[];
}

export interface MemberFilters {
  search: string;
  status: MemberStatus | "all";
  ministry: string | "all";
  gender: MemberGender | "all";
  role: string | "all";
  page?: number;
  pageSize?: number;
}

export interface MemberSortConfig {
  field: "first_name" | "last_name" | "join_date" | "status" | "membership_number" | "date_joined";
  direction: "asc" | "desc";
}

export interface MemberFormValues {
  branch_id?: string;
  family_id?: string | null;
  first_name: string;
  last_name: string;
  profile_photo?: string | null;
  gender: MemberGender;
  date_of_birth: string | null;
  marriage_anniversary_date?: string | null;
  marital_status?: "Single" | "Married" | "Widowed" | "Divorced";
  occupation?: string | null;
  education_level?: string | null;
  national_id_passport?: string | null;
  email: string;
  phone_number: string;
  address: string;
  status: MemberStatus;
  member_type?: "Regular" | "Leader" | "Clergy";
  baptism_status?: "Not Baptized" | "Water Baptized" | "Holy Spirit Baptized";
  baptism_date?: string | null;
  baptism_place?: string | null;
  baptism_officiant?: string | null;
  salvation_status?: "Born Again" | "Seeking";
  salvation_date?: string | null;
  join_date?: string;
  date_joined: string; // Backward compatibility
  emergency_name?: string | null;
  emergency_relationship?: string | null;
  emergency_phone?: string | null;
  pastoral_notes?: string | null;
  notes: string | null; // Backward compatibility
  role: Role; // Backward compatibility
  ministries: Ministry[]; // Backward compatibility
  custom_fields?: Record<string, any>;
  communication_preferences?: {
    email: boolean;
    sms: boolean;
    in_app: boolean;
  };
  donor_status?: "Active" | "Inactive" | "Guest" | "Non-Donor";
  recurring_giving_opt_in?: boolean;
}

export const DEFAULT_FILTERS: MemberFilters = {
  search: "",
  status: "all",
  ministry: "all",
  gender: "all",
  role: "all",
};

export const MEMBERS_PER_PAGE = 10;
