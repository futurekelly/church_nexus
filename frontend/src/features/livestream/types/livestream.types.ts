export interface LivestreamStatus {
  id: string;
  is_live: boolean;
  title: string;
  preacher: string;
  description: string;
  stream_url: string;
  viewer_count: number;
  started_at: string;
  branch_id?: string; // Branch Support Roadmap
}

export interface ChatMessage {
  id: string;
  sender_name: string;
  sender_role: string; // "Super Admin" | "Church Admin" | "Pastor" | "Member" | "Visitor"
  sender_id?: string;
  message: string;
  timestamp: string;
  is_muted?: boolean;
}

export interface LocalizationProfile {
  country_code: string; // e.g. "TZ", "KE", "UG"
  currency: string;      // e.g. "TZS", "KES", "UGX"
  preferred_language: string; // e.g. "en", "sw"
}
