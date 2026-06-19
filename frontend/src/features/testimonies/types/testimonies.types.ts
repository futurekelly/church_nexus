export type TestimonyStatus = "Pending" | "Approved" | "Archived";

export type TestimonyCategory =
  | "Healing"
  | "Provision"
  | "Restoration"
  | "Salvation"
  | "Deliverance"
  | "Family"
  | "Education"
  | "Business"
  | "General";

export interface Testimony {
  id: string;
  branch_id?: string;
  user_id: string | null;
  author_name: string;
  author_email?: string;
  title: string;
  content: string;
  category: TestimonyCategory;
  status: TestimonyStatus;
  is_featured: boolean;
  views: number;
  image_url?: string;
  video_url?: string;
  created_at: string;
}

export interface TestimonyFilters {
  search: string;
  category: TestimonyCategory | "all";
  featuredOnly: boolean;
}

export interface TestimonyFormValues {
  title: string;
  content: string;
  category: TestimonyCategory;
  author_name: string;
  author_email?: string;
  is_anonymous: boolean;
  image_url?: string;
  video_url?: string;
}
