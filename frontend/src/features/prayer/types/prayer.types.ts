// ─────────────────────────────────────────────────────────────────
// Prayer Requests Module TypeScript types
// ─────────────────────────────────────────────────────────────────

export type PrayerStatus = "New" | "In Progress" | "Answered" | "Archived";

export const PRAYER_STATUSES: PrayerStatus[] = [
  "New",
  "In Progress",
  "Answered",
  "Archived",
];

export type PrayerCategory =
  | "Healing"
  | "Financial"
  | "Family"
  | "Spiritual"
  | "Guidance"
  | "Thanksgiving"
  | "Other";

export const PRAYER_CATEGORIES: PrayerCategory[] = [
  "Healing",
  "Financial",
  "Family",
  "Spiritual",
  "Guidance",
  "Thanksgiving",
  "Other",
];

export const PRAYER_CATEGORY_LABELS: Record<PrayerCategory, string> = {
  Healing: "Healing & Health",
  Financial: "Financial Provision",
  Family: "Family & Relationships",
  Spiritual: "Spiritual Growth",
  Guidance: "Guidance & Wisdom",
  Thanksgiving: "Thanksgiving & Praise",
  Other: "Other Request",
};

export const STATUS_LABELS: Record<PrayerStatus, string> = {
  New: "New Request",
  "In Progress": "Praying",
  Answered: "Answered!",
  Archived: "Archived",
};

export interface PrayerRequest {
  id: string;
  title: string;
  description: string;
  category: PrayerCategory;
  status: PrayerStatus;
  anonymous: boolean;
  user_id: string | number;
  user_name: string;
  pray_count: number;
  prayed_user_ids: (string | number)[]; // List of user IDs who clicked "I prayed for this"
  pastor_response: string | null;
  created_at: string; // ISO date string
  updated_at: string; // ISO date string
}

export interface PrayerFilters {
  search: string;
  category: PrayerCategory | "all";
  status: PrayerStatus | "all";
}

export interface PrayerSortConfig {
  field: "created_at" | "pray_count" | "status";
  direction: "asc" | "desc";
}

export const DEFAULT_FILTERS: PrayerFilters = {
  search: "",
  category: "all",
  status: "all",
};

export const PRAYERS_PER_PAGE = 6;
