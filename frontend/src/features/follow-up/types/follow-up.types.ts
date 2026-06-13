// ─────────────────────────────────────────────────────────────────
// Visitor Follow-up Module TypeScript types
// ─────────────────────────────────────────────────────────────────

export type FollowUpStatus = 
  | "New Visitor" 
  | "Contacted" 
  | "Scheduled Visit" 
  | "Active Member";

export type InteractionType = "Call" | "Email" | "Meeting" | "Visit";

export interface VisitorProfile {
  id: string;
  membership_number: string;
  first_name: string;
  last_name: string;
  email: string;
  phone_number: string;
  gender: "male" | "female";
  date_joined: string; // ISO date string
  first_time_visitor: boolean;
  invited_by?: string;
  visit_reason?: string;
  spiritual_background?: string;
  prayer_request?: string;
  notes?: string;
}

export interface FollowUpTicket {
  id: string;
  visitor_id: string;
  visitor_name: string;
  status: FollowUpStatus;
  source: "Manual" | "Attendance Absentee" | "Attendance Visitor Scan" | "Prayer Crisis" | "Event RSVP";
  assigned_pastor?: string;
  notes: string;
  created_at: string; // ISO date string
  updated_at: string; // ISO date string
  is_completed: boolean; // True when transitioned or archived
  converted_member_id?: string; // Links to MOCK_MEMBERS id if converted
}

export interface ContactHistoryLog {
  id: string;
  visitor_id: string;
  interaction_type: InteractionType;
  notes: string;
  contact_date: string; // ISO date string
  contacted_by: string; // Name of staff/pastor who logged it
}

export interface FollowUpFilters {
  search: string;
  status: FollowUpStatus | "all";
  source: FollowUpTicket["source"] | "all";
}

export const FOLLOW_UP_STATUSES: FollowUpStatus[] = [
  "New Visitor",
  "Contacted",
  "Scheduled Visit",
  "Active Member",
];

export const INTERACTION_TYPES: InteractionType[] = ["Call", "Email", "Meeting", "Visit"];

export const INVITED_BY_OPTIONS = [
  "Friend",
  "Family Member",
  "Social Media",
  "Church Website",
  "Outreach Event",
  "Walk In",
];

export const SPIRITUAL_BACKGROUND_OPTIONS = [
  "Christian",
  "New Believer",
  "Exploring Faith",
  "Other Religion",
  "Prefer Not To Say",
];

export const FOLLOW_UP_STATUS_COLORS: Record<FollowUpStatus, { bg: string; text: string; dot: string }> = {
  "New Visitor": { bg: "bg-indigo-500/10", text: "text-indigo-400", dot: "bg-indigo-400" },
  "Contacted": { bg: "bg-blue-500/10", text: "text-blue-400", dot: "bg-blue-400" },
  "Scheduled Visit": { bg: "bg-amber-500/10", text: "text-amber-400", dot: "bg-amber-400" },
  "Active Member": { bg: "bg-emerald-500/10", text: "text-emerald-400", dot: "bg-emerald-400" },
};

export const DEFAULT_FOLLOW_UP_FILTERS: FollowUpFilters = {
  search: "",
  status: "all",
  source: "all",
};

export const TICKETS_PER_PAGE = 8;
