"use client";

import { useCallback } from "react";
import type { Testimony, TestimonyFormValues } from "../types/testimonies.types";
import { MOCK_TESTIMONIES } from "../data/mock-testimonies";
import { useLocalStorageState } from "@/hooks/use-local-storage-state";
import { useAuth } from "@/hooks/use-auth";

const TESTIMONIES_KEY = "church-mock-testimonies";

export function useTestimonies() {
  const { user } = useAuth();
  const [testimonies, setTestimonies] = useLocalStorageState<Testimony[]>(
    TESTIMONIES_KEY,
    MOCK_TESTIMONIES
  );

  const addTestimony = useCallback(
    (values: TestimonyFormValues) => {
      const nextId = `test-${Date.now()}`;
      const authorName = values.is_anonymous ? "Anonymous Partner" : values.author_name;

      const newTestimony: Testimony = {
        id: nextId,
        branch_id: "branch-001", // Default branch ID
        user_id: user ? String(user.id) : null,
        author_name: authorName,
        author_email: values.is_anonymous ? undefined : values.author_email,
        title: values.title,
        content: values.content,
        category: values.category,
        status: "Pending", // All public submissions default to Pending
        is_featured: false,
        views: 0,
        image_url: values.image_url,
        video_url: values.video_url,
        created_at: new Date().toISOString(),
      };

      setTestimonies((prev) => [newTestimony, ...prev]);
      return newTestimony;
    },
    [user, setTestimonies]
  );

  const approveTestimony = useCallback(
    (id: string) => {
      setTestimonies((prev) =>
        prev.map((t) => (t.id === id ? { ...t, status: "Approved" as const } : t))
      );
    },
    [setTestimonies]
  );

  const archiveTestimony = useCallback(
    (id: string) => {
      setTestimonies((prev) =>
        prev.map((t) => (t.id === id ? { ...t, status: "Archived" as const } : t))
      );
    },
    [setTestimonies]
  );

  const toggleFeatureTestimony = useCallback(
    (id: string) => {
      setTestimonies((prev) =>
        prev.map((t) => (t.id === id ? { ...t, is_featured: !t.is_featured } : t))
      );
    },
    [setTestimonies]
  );

  const incrementViews = useCallback(
    (id: string) => {
      setTestimonies((prev) =>
        prev.map((t) => (t.id === id ? { ...t, views: t.views + 1 } : t))
      );
    },
    [setTestimonies]
  );

  return {
    testimonies,
    addTestimony,
    approveTestimony,
    archiveTestimony,
    toggleFeatureTestimony,
    incrementViews,
  };
}
