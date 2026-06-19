"use client";

import { useCallback } from "react";
import type { NotificationTemplate } from "../types/notification.types";
import { MOCK_TEMPLATES } from "../data/mock-notification-data";
import { useLocalStorageState } from "@/hooks/use-local-storage-state";

const STORAGE_KEY = "church-notification-templates";

export function useNotificationTemplates() {
  const [templates, setTemplates] = useLocalStorageState<NotificationTemplate[]>(
    STORAGE_KEY,
    MOCK_TEMPLATES
  );

  const addTemplate = useCallback(
    (template: Omit<NotificationTemplate, "id">) => {
      const newId = `tmpl-${Date.now()}`;
      const newTemplate = { ...template, id: newId };
      setTemplates((prev) => [...prev, newTemplate]);
      return newTemplate;
    },
    [setTemplates]
  );

  const updateTemplate = useCallback(
    (id: string, updatedFields: Partial<Omit<NotificationTemplate, "id">>) => {
      setTemplates((prev) =>
        prev.map((t) => (t.id === id ? { ...t, ...updatedFields } : t))
      );
    },
    [setTemplates]
  );

  const deleteTemplate = useCallback(
    (id: string) => {
      setTemplates((prev) => prev.filter((t) => t.id !== id));
    },
    [setTemplates]
  );

  return {
    templates,
    addTemplate,
    updateTemplate,
    deleteTemplate
  };
}
