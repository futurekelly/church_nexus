export type DocumentCategory = "certificate" | "statement" | "receipt" | "report" | "roster";
export type ProcessingLifecycle = "Pending" | "Processing" | "Completed" | "Failed" | "Cancelled";

export interface DocumentTemplate {
  id: string;
  name: string;
  category: DocumentCategory;
  template_version: number;
  html_layout: string;
  stylesheet_tokens: Record<string, string>;
  active: boolean;
  signature_asset_url: string | null;
  generated_count: number;
  download_count: number;
  last_downloaded_at: string | null;
  created_at: string;
  updated_at: string;
}

export interface GeneratedDocument {
  id: string;
  branch_id: string;
  document_type: string;
  format: "PDF" | "CSV";
  file_url: string | null;
  status: ProcessingLifecycle;
  template_version: number;
  source_type: string | null;
  source_id: string | null;
  expires_at: string | null;
  retention_policy: string | null;
  download_count: number;
  last_downloaded_at: string | null;
  requested_by: string;
  requested_at: string;
  completed_at: string | null;
  filter_metadata: Record<string, any>;
  is_archived: boolean;
}

export interface DocumentAuditLog {
  id: string;
  user_id: string;
  action: "GENERATE" | "DOWNLOAD" | "REVOKE" | "CANCEL";
  document_id: string;
  ip_address: string | null;
  timestamp: string;
  details: string | null;
}

export interface DocumentGenerationFilters {
  status?: ProcessingLifecycle | "all";
  category?: DocumentCategory | "all";
  search?: string;
}
