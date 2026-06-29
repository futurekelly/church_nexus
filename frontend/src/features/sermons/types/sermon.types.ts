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

export interface SermonSeries {
  id: string;
  branch?: string;
  title: string;
  slug: string;
  description?: string;
  cover_image?: string | null;
  start_date?: string | null;
  end_date?: string | null;
  is_active?: boolean;
  sermons_count?: number;
  created_at?: string;
  updated_at?: string;
}

export interface SermonSeriesSummary {
  id: string;
  title: string;
  slug: string;
  cover_image?: string | null;
}

export interface Sermon {
  id: string;
  title: string;
  description: string;
  scripture_reference: string;
  sermon_date: string; // ISO date string (YYYY-MM-DD)
  status: SermonStatus;
  thumbnail: string;
  video_url: string;
  audio_url: string;
  hls_url?: string;
  speaker: string;
  category: SermonCategory;
  featured: boolean;
  views_count?: number;
  part_number?: number | null;
  series?: string | null;
  series_details?: SermonSeriesSummary | null;
  notes: string; // Study summary/text
  tags: string[];
  created_at?: string;
  updated_at?: string;
}

export interface SermonFilters {
  search?: string;
  category?: SermonCategory | "all";
  status?: SermonStatus | "all";
  speaker?: string | "all";
  series?: string | "all";
  scripture?: string;
  featured?: boolean;
  date_from?: string;
  date_to?: string;
  ordering?: string;
  page?: number;
  page_size?: number;
}

export interface SermonSortConfig {
  key: "sermon_date" | "title" | "views_count" | "featured";
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

