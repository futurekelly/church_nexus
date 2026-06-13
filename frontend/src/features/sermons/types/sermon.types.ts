export const SERMON_CATEGORIES = [
  "Faith",
  "Grace",
  "Hope",
  "Salvation",
  "Family",
  "Love",
  "Prayer",
  "Worship",
  "Leadership",
] as const;

export type SermonCategory = (typeof SERMON_CATEGORIES)[number];

export const SERMON_STATUSES = [
  "Draft",
  "Published",
  "Archived",
] as const;

export type SermonStatus = (typeof SERMON_STATUSES)[number];

export interface Sermon {
  id: string;
  title: string;
  description: string;
  scripture_reference: string;
  sermon_date: string; // ISO date string (YYYY-MM-DD)
  status: SermonStatus;
  thumbnail: string; // Dynamic Local SVG Gradient URL
  video_url: string; // Simulated URL
  audio_url: string; // Simulated URL
  speaker: string;
  category: SermonCategory;
  featured: boolean;
  notes: string; // Study summary/text
  tags: string[];
  created_at: string;
  updated_at: string;
}

export interface SermonFilters {
  search: string;
  category: SermonCategory | "all";
  status: SermonStatus | "all";
  speaker: string | "all";
}

export interface SermonSortConfig {
  key: "sermon_date" | "title";
  direction: "asc" | "desc";
}

export const SERMON_CATEGORY_LABELS: Record<SermonCategory, string> = {
  Faith: "Faith & Belief",
  Grace: "Grace & Mercy",
  Hope: "Hope & Future",
  Salvation: "Salvation & Redemption",
  Family: "Family & Relationships",
  Love: "Love & Fellowship",
  Prayer: "Prayer & Intercession",
  Worship: "Worship & Praise",
  Leadership: "Leadership & Service",
};

export const SERMON_STATUS_LABELS: Record<SermonStatus, string> = {
  Draft: "Draft",
  Published: "Published",
  Archived: "Archived",
};
