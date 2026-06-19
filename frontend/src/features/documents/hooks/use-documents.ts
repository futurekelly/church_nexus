"use client";

import { useState, useEffect, useCallback } from "react";
import { useAuth } from "@/hooks/use-auth";
import type { 
  DocumentTemplate, GeneratedDocument, DocumentAuditLog, 
  DocumentGenerationFilters 
} from "../types/documents.types";
import { DocumentRepository } from "../repositories/documents.repository";

export function useDocuments(filters: DocumentGenerationFilters = { status: "all", category: "all", search: "" }) {
  const { user, role } = useAuth();
  const branchId = (user as any)?.branch_id || "branch-001";
  const userUuid = String(user?.id || "unknown-user");
  const userMemberId = (user as any)?.member_id || (user as any)?.memberId || null;

  const [templates, setTemplates] = useState<DocumentTemplate[]>([]);
  const [documents, setDocuments] = useState<GeneratedDocument[]>([]);
  const [auditLogs, setAuditLogs] = useState<DocumentAuditLog[]>([]);
  const [loading, setLoading] = useState(true);

  const loadData = useCallback(async () => {
    try {
      setLoading(true);
      const tmpls = await DocumentRepository.getTemplates();
      setTemplates(tmpls);

      const docs = await DocumentRepository.getGeneratedDocuments(filters, {
        branchId,
        role: role || "Visitor",
        memberId: userMemberId
      });
      setDocuments(docs);

      const logs = await DocumentRepository.getDocumentAuditLogs();
      setAuditLogs(logs);
    } catch (err) {
      console.error("Error loading document records:", err);
    } finally {
      setLoading(false);
    }
  }, [branchId, role, userMemberId, filters.status, filters.category, filters.search]);

  useEffect(() => {
    loadData();

    // Re-load on repository updates triggered by background timers
    const handleStorageUpdate = (e: Event) => {
      const customEvent = e as CustomEvent;
      if (
        customEvent.detail &&
        [
          "church-mock-document-templates",
          "church-mock-generated-documents",
          "church-mock-document-audit-logs"
        ].includes(customEvent.detail.key)
      ) {
        loadData();
      }
    };

    window.addEventListener("local-storage-update", handleStorageUpdate);
    return () => {
      window.removeEventListener("local-storage-update", handleStorageUpdate);
    };
  }, [loadData]);

  const requestDocument = useCallback(async (data: Omit<GeneratedDocument, "id" | "file_url" | "status" | "requested_at" | "completed_at" | "download_count" | "last_downloaded_at" | "is_archived">) => {
    const result = await DocumentRepository.requestDocument(data, userUuid);
    await loadData();
    return result;
  }, [userUuid, loadData]);

  const getDownloadUrl = useCallback(async (id: string) => {
    const url = await DocumentRepository.getDownloadUrl(id, userUuid);
    await loadData();
    return url;
  }, [userUuid, loadData]);

  const revokeDocument = useCallback(async (id: string) => {
    await DocumentRepository.revokeDocument(id, userUuid);
    await loadData();
  }, [userUuid, loadData]);

  const cancelDocument = useCallback(async (id: string) => {
    await DocumentRepository.cancelDocument(id, userUuid);
    await loadData();
  }, [userUuid, loadData]);

  const updateTemplateLayout = useCallback(async (id: string, layout: string, tokens: Record<string, string>) => {
    const result = await DocumentRepository.updateTemplateLayout(id, layout, tokens, userUuid);
    await loadData();
    return result;
  }, [userUuid, loadData]);

  return {
    templates,
    documents,
    auditLogs,
    loading,
    requestDocument,
    getDownloadUrl,
    revokeDocument,
    cancelDocument,
    updateTemplateLayout,
    refresh: loadData
  };
}
