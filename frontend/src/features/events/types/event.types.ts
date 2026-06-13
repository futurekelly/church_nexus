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
  "Published",
  "Cancelled",
  "Completed",
] as const;

export type EventStatus = (typeof EVENT_STATUSES)[number];

export interface Event {
  id: string;
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
  created_at: string;
  updated_at: string;
}

export interface EventFilters {
  search: string;
  type: EventType | "all";
  status: EventStatus | "all";
  dateRange: "all" | "upcoming" | "past" | "today" | "this-week";
}

export interface EventSortConfig {
  key: "start_date" | "title" | "registered_count" | "capacity";
  direction: "asc" | "desc";
}

export interface EventRegistration {
  id: string;
  event_id: string;
  member_id: string;
  registration_date: string;
  attendance_status: "registered" | "checked_in" | "absent";
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
  Published: "Published",
  Cancelled: "Cancelled",
  Completed: "Completed",
};
