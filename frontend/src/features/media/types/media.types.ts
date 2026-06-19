export type MediaStatus = "Uploading" | "Processing" | "Ready" | "Failed";
export type FileType = "video" | "audio" | "image" | "document";
export type MediaCategory = "Sermon" | "Event" | "Social" | "Document" | "Other";

export interface MediaAsset {
  id: string; // UUID v4 format
  title: string;
  description: string;
  file_name: string;
  file_type: FileType;
  file_size: number; // in bytes
  file_url: string;
  thumbnail_url: string | null;
  category: MediaCategory;
  branch_id: string; // Scoped by branch
  uploaded_by: string; // UUID-based identifier
  uploaded_by_name: string; // Audit visibility
  is_public: boolean;
  download_count: number;
  is_archived: boolean;
  archived_at: string | null;
  status: MediaStatus;
  created_at: string;
  updated_at: string;
}

export interface MediaCollection {
  id: string; // UUID v4 format
  name: string;
  description: string;
  branch_id: string;
  created_by: string;
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

export interface MediaFilters {
  search?: string;
  type?: string;
  category?: string;
  collectionId?: string;
  showArchived?: boolean;
  page?: number;
  pageSize?: number;
}
