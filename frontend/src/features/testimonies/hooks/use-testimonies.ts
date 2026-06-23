"use client";

import { useState, useEffect, useCallback } from "react";
import type { Testimony, TestimonyFormValues } from "../types/testimonies.types";
import { API_ENDPOINTS } from "@/constants/api-endpoints";
import { apiGet, apiPost, apiPatch } from "@/services/api-client";
import { useAuth } from "@/hooks/use-auth";

export function useTestimonies() {
  const { user } = useAuth();
  const [testimonies, setTestimonies] = useState<Testimony[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const fetchTestimonies = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);
      const res = await apiGet<Testimony[]>(API_ENDPOINTS.TESTIMONIES);
      if (res.success) {
        setTestimonies(res.data);
      } else {
        setError(res.message || "Failed to load testimonies");
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load testimonies");
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchTestimonies();
  }, [fetchTestimonies]);

  const addTestimony = useCallback(
    async (values: TestimonyFormValues) => {
      setError(null);
      try {
        const res = await apiPost<Testimony>(API_ENDPOINTS.TESTIMONIES, values);
        if (res.success) {
          setTestimonies((prev) => [res.data, ...prev]);
          return res.data;
        } else {
          throw new Error(res.message || "Failed to submit testimony");
        }
      } catch (err) {
        const msg = err instanceof Error ? err.message : "Failed to submit testimony";
        setError(msg);
        throw new Error(msg);
      }
    },
    []
  );

  const approveTestimony = useCallback(
    async (id: string) => {
      setError(null);
      try {
        const res = await apiPatch<Testimony>(`${API_ENDPOINTS.TESTIMONIES}${id}/`, {
          status: "Approved",
        });
        if (res.success) {
          setTestimonies((prev) =>
            prev.map((t) => (t.id === id ? { ...t, status: "Approved" as const } : t))
          );
          return res.data;
        } else {
          throw new Error(res.message || "Failed to approve testimony");
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to approve testimony");
        throw err;
      }
    },
    []
  );

  const rejectTestimony = useCallback(
    async (id: string, reason?: string) => {
      setError(null);
      try {
        const res = await apiPatch<Testimony>(`${API_ENDPOINTS.TESTIMONIES}${id}/`, {
          status: "Rejected",
          rejection_reason: reason || "",
        });
        if (res.success) {
          setTestimonies((prev) =>
            prev.map((t) =>
              t.id === id
                ? { ...t, status: "Rejected" as const, rejection_reason: reason || "" }
                : t
            )
          );
          return res.data;
        } else {
          throw new Error(res.message || "Failed to reject testimony");
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to reject testimony");
        throw err;
      }
    },
    []
  );

  const archiveTestimony = useCallback(
    async (id: string) => {
      setError(null);
      try {
        const res = await apiPatch<Testimony>(`${API_ENDPOINTS.TESTIMONIES}${id}/`, {
          status: "Archived",
        });
        if (res.success) {
          setTestimonies((prev) =>
            prev.map((t) => (t.id === id ? { ...t, status: "Archived" as const } : t))
          );
          return res.data;
        } else {
          throw new Error(res.message || "Failed to archive testimony");
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to archive testimony");
        throw err;
      }
    },
    []
  );

  const toggleFeatureTestimony = useCallback(
    async (id: string) => {
      setError(null);
      const target = testimonies.find((t) => t.id === id);
      if (!target) return;

      try {
        const res = await apiPatch<Testimony>(`${API_ENDPOINTS.TESTIMONIES}${id}/`, {
          is_featured: !target.is_featured,
        });
        if (res.success) {
          setTestimonies((prev) =>
            prev.map((t) => (t.id === id ? { ...t, is_featured: !t.is_featured } : t))
          );
          return res.data;
        } else {
          throw new Error(res.message || "Failed to toggle featured status");
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to toggle featured status");
        throw err;
      }
    },
    [testimonies]
  );

  const incrementViews = useCallback(
    async (id: string) => {
      try {
        const res = await apiPost<void>(`${API_ENDPOINTS.TESTIMONIES}${id}/increment-view/`);
        if (res.success) {
          setTestimonies((prev) =>
            prev.map((t) => (t.id === id ? { ...t, views: t.views + 1 } : t))
          );
        }
      } catch (err) {
        console.error("Failed to increment testimony views:", err);
      }
    },
    []
  );

  return {
    testimonies,
    isLoading,
    error,
    addTestimony,
    approveTestimony,
    rejectTestimony,
    archiveTestimony,
    toggleFeatureTestimony,
    incrementViews,
    refetch: fetchTestimonies,
  };
}
