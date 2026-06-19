import type { 
  DocumentTemplate, GeneratedDocument, DocumentAuditLog, 
  DocumentGenerationFilters 
} from "../types/documents.types";
import { apiGet, apiPost, apiPut, apiDelete, isApiError } from "@/services/api-client";

export const DocumentRepository = {
  // ─────────────────────────────────────────────────────────────────
  // Templates Management
  // ─────────────────────────────────────────────────────────────────

  async getTemplates(): Promise<DocumentTemplate[]> {
    const response = await apiGet<DocumentTemplate[]>("/api/document-templates/");
    if (isApiError(response)) {
      throw new Error(response.message || "Failed to fetch document templates.");
    }
    return response.data;
  },

  async updateTemplateLayout(
    id: string, 
    layout: string, 
    tokens: Record<string, string>,
    userUuid: string
  ): Promise<DocumentTemplate> {
    const payload = {
      html_layout: layout,
      stylesheet_tokens: tokens
    };
    const response = await apiPut<DocumentTemplate>(`/api/document-templates/${id}/`, payload);
    if (isApiError(response)) {
      throw new Error(response.message || "Failed to update document template layout.");
    }
    return response.data;
  },

  // ─────────────────────────────────────────────────────────────────
  // Generated Documents Ledger
  // ─────────────────────────────────────────────────────────────────

  async getGeneratedDocuments(
    filters: DocumentGenerationFilters,
    context: { branchId: string; role: string; memberId: string | null }
  ): Promise<GeneratedDocument[]> {
    const params: any = {};
    if (filters.status && filters.status !== "all") params.status = filters.status;
    if (filters.category && filters.category !== "all") params.category = filters.category;
    if (filters.search) params.search = filters.search;

    const response = await apiGet<GeneratedDocument[]>("/api/generated-documents/", { params });
    if (isApiError(response)) {
      throw new Error(response.message || "Failed to fetch generated documents.");
    }
    return response.data;
  },

  /**
   * Request document with asynchronous generation backend trigger
   */
  async requestDocument(
    data: Omit<GeneratedDocument, "id" | "file_url" | "status" | "requested_at" | "completed_at" | "download_count" | "last_downloaded_at" | "is_archived">,
    userUuid: string
  ): Promise<GeneratedDocument> {
    const payload = {
      branch_id: data.branch_id,
      document_type: data.document_type,
      format: data.format,
      source_type: data.source_type,
      source_id: data.source_id,
      retention_policy: data.retention_policy,
      filter_metadata: data.filter_metadata
    };

    const response = await apiPost<GeneratedDocument>("/api/generated-documents/request/", payload);
    if (isApiError(response)) {
      throw new Error(response.message || "Failed to request document generation.");
    }
    return response.data;
  },

  /**
   * Safe Presigned URL download trigger using secure DownloadToken model
   */
  async getDownloadUrl(id: string, userUuid: string): Promise<string> {
    // 1. Post to generate a single-use token
    const response = await apiPost<{ token: string }>(`/api/generated-documents/${id}/token/`);
    if (isApiError(response)) {
      throw new Error(response.message || "Failed to retrieve secure download token.");
    }

    // 2. Return URL pointing to secure-download view using the token
    const token = response.data.token;
    return `/api/secure-download/?token=${token}`;
  },

  async cancelDocument(id: string, userUuid: string): Promise<void> {
    const response = await apiPost<any>(`/api/generated-documents/${id}/cancel/`);
    if (isApiError(response)) {
      throw new Error(response.message || "Failed to cancel document generation.");
    }
  },

  async revokeDocument(id: string, userUuid: string): Promise<void> {
    const response = await apiPost<any>(`/api/generated-documents/${id}/revoke/`);
    if (isApiError(response)) {
      throw new Error(response.message || "Failed to revoke / archive generated document.");
    }
  },

  // ─────────────────────────────────────────────────────────────────
  // Audits logs
  // ─────────────────────────────────────────────────────────────────

  async getDocumentAuditLogs(): Promise<DocumentAuditLog[]> {
    const response = await apiGet<DocumentAuditLog[]>("/api/document-audit-logs/");
    if (isApiError(response)) {
      // Return empty array if audit logs endpoint is not registered for general users
      return [];
    }
    return response.data;
  },

  // ─────────────────────────────────────────────────────────────────
  // LocalStorage Cleanup
  // ─────────────────────────────────────────────────────────────────

  clearObsoleteLocalStorageKeys(): void {
    if (typeof window === "undefined") return;
    window.localStorage.removeItem("church-mock-document-templates");
    window.localStorage.removeItem("church-mock-generated-documents");
    window.localStorage.removeItem("church-mock-document-audit-logs");
    console.log("Obsolete documents local storage keys cleared successfully.");
  }
};

if (typeof window !== "undefined") {
  DocumentRepository.clearObsoleteLocalStorageKeys();
}
