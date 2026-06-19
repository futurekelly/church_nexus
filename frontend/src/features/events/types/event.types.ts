export const EVENT_TYPES = [
  "Sunday Service",
  "Bible Study",
  "Prayer Meeting",
  "Youth Meeting",
  "Conference",
  "Seminar",
  "Outreach",
  "Livestream Event",
  "Special Event",
] as const;

export type EventType = (typeof EVENT_TYPES)[number];

export const EVENT_STATUSES = [
  "Draft",
  "Scheduled",
  "Published",
  "In Progress",
  "Completed",
  "Cancelled",
  "Archived"
] as const;

export type EventStatus = (typeof EVENT_STATUSES)[number];

export type RecurrencePattern = "Daily" | "Weekly" | "Monthly" | null;

export interface Event {
  id: string; // UUID v4 format
  branch_id: string; // Mandatory scoped link to Module 13 branch
  group_id: string | null; // Optional Connect Group link to Module 15
  title: string;
  description: string;
  event_type: EventType;
  start_date: string; // ISO String
  end_date: string; // ISO String
  location: string;
  organizer: string;
  capacity: number;
  registered_count: number;
  status: EventStatus;
  cover_image: string;
  
  // Recurring Events
  is_recurring: boolean;
  recurrence_pattern: RecurrencePattern;

  // Soft Delete fields
  is_archived: boolean;
  archived_at: string | null;

  created_at: string;
  updated_at: string;
}

export type RSVPStatus = "Attending" | "Tentative" | "Declined" | "Waitlisted";

export interface EventRegistration {
  id: string; // UUID v4 format
  event_id: string;
  user_id: string | null; // UUID links to user profile
  member_id: string | null; // UUID links to core Member
  visitor_name: string | null; // guest name
  visitor_email: string | null; // guest email
  visitor_phone: string | null; // guest phone
  status: RSVPStatus;
  registration_date: string;
  attendance_status: "registered" | "checked_in" | "absent";
  
  // Check-in audits
  checked_in_at: string | null;
  checked_in_by: string | null; // User UUID who checked them in

  notes: string | null;
}

export interface EventResource {
  id: string; // UUID v4 format
  branch_id: string;
  name: string;
  resource_type: "Venue" | "Equipment";
  capacity: number;
  status: "Available" | "Maintenance" | "Reserved";
  created_at: string;
}

export interface ResourceBooking {
  id: string; // UUID v4 format
  event_id: string;
  resource_id: string;
  start_time: string; // ISO String
  end_time: string; // ISO String
  status: "Pending" | "Approved" | "Rejected";
  
  // Approval audits
  approved_by: string | null; // User UUID
  approved_at: string | null;
  
  created_at: string;
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

export interface EventFilters {
  search: string;
  type: EventType | "all";
  status: EventStatus | "all";
  dateRange: "all" | "upcoming" | "past" | "today" | "this-week";
  showArchived?: boolean;
  page?: number;
  pageSize?: number;
}

export interface EventSortConfig {
  key: "start_date" | "title" | "registered_count" | "capacity";
  direction: "asc" | "desc";
}

export interface EventStats {
  upcomingCount: number;
  completedCount: number;
  totalRegistrations: number;
  capacityUtilization: number;
}

export const EVENT_TYPE_LABELS: Record<EventType, string> = {
  "Sunday Service": "Sunday Service",
  "Bible Study": "Bible Study",
  "Prayer Meeting": "Prayer Meeting",
  "Youth Meeting": "Youth Meeting",
  "Conference": "Conference",
  "Seminar": "Seminar",
  "Outreach": "Outreach",
  "Livestream Event": "Livestream Event",
  "Special Event": "Special Event",
};

export const EVENT_STATUS_LABELS: Record<EventStatus, string> = {
  Draft: "Draft",
  Scheduled: "Scheduled",
  Published: "Published",
  "In Progress": "In Progress",
  Completed: "Completed",
  Cancelled: "Cancelled",
  Archived: "Archived"
};
