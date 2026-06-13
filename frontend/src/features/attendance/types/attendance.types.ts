// ─────────────────────────────────────────────────────────────────
// Attendance Module TypeScript types
// ─────────────────────────────────────────────────────────────────

export type SessionType = "Service" | "Event" | "Ministry";
export type SessionStatus = "Active" | "Completed";
export type AttendanceStatus = "Present" | "Absent" | "Excused";
export type CheckInMethod = "QR" | "Barcode" | "Manual";

export interface AttendanceSession {
  id: string;
  title: string;
  description: string;
  date: string; // ISO date string
  type: SessionType;
  status: SessionStatus;
  present_count: number;
  absent_count: number;
  excused_count: number;
  created_at: string;
  updated_at: string;
}

export interface AttendanceRecord {
  id: string;
  session_id: string;
  member_id: string; // references Member id
  member_name: string;
  membership_number: string;
  gender: "male" | "female"; // cached for quick Recharts analytics
  status: AttendanceStatus;
  check_in_time: string | null; // ISO time of scan
  check_in_method: CheckInMethod | null;
  excuse_notes?: string;
}

export interface FollowUpTicket {
  id: string;
  member_id: string;
  member_name: string;
  session_id: string;
  session_title: string;
  session_date: string;
  reason: string;
  status: "Pending" | "In Progress" | "Completed";
  created_at: string;
}

export interface AttendanceFilters {
  search: string;
  type: SessionType | "all";
  status: SessionStatus | "all";
}

export interface AttendanceSortConfig {
  field: "date" | "present_count" | "status";
  direction: "asc" | "desc";
}

export const SESSION_TYPES: SessionType[] = ["Service", "Event", "Ministry"];
export const SESSION_STATUSES: SessionStatus[] = ["Active", "Completed"];
export const ATTENDANCE_STATUSES: AttendanceStatus[] = ["Present", "Absent", "Excused"];
export const CHECKIN_METHODS: CheckInMethod[] = ["QR", "Barcode", "Manual"];

export const SESSION_TYPE_LABELS: Record<SessionType, string> = {
  Service: "Sunday/Midweek Service",
  Event: "Special Event",
  Ministry: "Ministry Fellowship",
};

export const SESSION_STATUS_LABELS: Record<SessionStatus, string> = {
  Active: "Active Check-In",
  Completed: "Session Closed",
};

export const ATTENDANCE_STATUS_LABELS: Record<AttendanceStatus, string> = {
  Present: "Present",
  Absent: "Absent",
  Excused: "Excused Absence",
};

export const DEFAULT_FILTERS: AttendanceFilters = {
  search: "",
  type: "all",
  status: "all",
};

export const SESSIONS_PER_PAGE = 8;
