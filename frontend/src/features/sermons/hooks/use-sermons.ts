"use client";

import { useState, useEffect, useCallback, useMemo } from "react";
import type { Sermon, SermonFilters, SermonSortConfig } from "../types/sermon.types";
import { apiGet, apiPost, apiPatch, isApiError } from "@/services/api-client";
import { toast } from "sonner";

/**
 * Mapper utility to normalize API responses to frontend TS types.
 * Resolves null or missing database values to safe defaults (e.g. empty strings).
 */
const mapSermonToFrontend = (s: any): Sermon => ({
  id: s.id,
  title: s.title,
  description: s.description,
  scripture_reference: s.scripture_reference || "",
  sermon_date: s.sermon_date,
  status: s.status,
  thumbnail: s.thumbnail || "",
  video_url: s.video_url || "",
  audio_url: s.audio_url || "",
  speaker: s.speaker,
  category: s.category,
  featured: s.featured,
  notes: s.notes || "",
  tags: s.tags || [],
  created_at: s.created_at,
  updated_at: s.updated_at,
});

/**
 * Hook to manage Sermons data using backend APIs.
 */
export function useSermons() {
  const [sermons, setSermons] = useState<Sermon[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  const fetchSermons = useCallback(async () => {
    setIsLoading(true);
    try {
      const response = await apiGet<any[]>("/api/sermons/");
      if (!isApiError(response)) {
        setSermons(response.data.map(mapSermonToFrontend));
      } else {
        toast.error(`Failed to load sermons: ${response.message}`);
      }
    } catch (err: any) {
      console.error("Failed to fetch sermons:", err);
      toast.error("Failed to sync sermons data with backend.");
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchSermons();
  }, [fetchSermons]);

  const addSermon = useCallback(
    async (newSermon: Omit<Sermon, "id" | "created_at" | "updated_at">) => {
      setIsLoading(true);
      try {
        const response = await apiPost<any>("/api/sermons/", newSermon);
        if (!isApiError(response)) {
          toast.success("Sermon created successfully.");
          await fetchSermons();
          return mapSermonToFrontend(response.data);
        } else {
          toast.error(`Failed to create sermon: ${response.message}`);
        }
      } catch (err: any) {
        console.error("Failed to add sermon:", err);
        const detail = err.response?.data?.message || err.message;
        toast.error(`Failed to create sermon: ${detail}`);
      } finally {
        setIsLoading(false);
      }
      return null;
    },
    [fetchSermons]
  );

  const updateSermon = useCallback(
    async (id: string, updatedFields: Partial<Sermon>) => {
      setIsLoading(true);
      try {
        const response = await apiPatch<any>(`/api/sermons/${id}/`, updatedFields);
        if (!isApiError(response)) {
          toast.success("Sermon updated successfully.");
          await fetchSermons();
          return mapSermonToFrontend(response.data);
        } else {
          toast.error(`Failed to update sermon: ${response.message}`);
        }
      } catch (err: any) {
        console.error("Failed to update sermon:", err);
        const detail = err.response?.data?.message || err.message;
        toast.error(`Failed to update sermon: ${detail}`);
      } finally {
        setIsLoading(false);
      }
      return null;
    },
    [fetchSermons]
  );

  const deleteSermon = useCallback(
    async (id: string) => {
      // Soft-delete behavior matching localstorage logic
      await updateSermon(id, { status: "Archived", featured: false });
    },
    [updateSermon]
  );

  const getSermonById = useCallback(
    (id: string) => {
      return sermons.find((s) => s.id === id) || null;
    },
    [sermons]
  );

  return {
    sermons,
    isLoading,
    addSermon,
    updateSermon,
    deleteSermon,
    getSermonById,
    refetch: fetchSermons
  };
}

/**
 * Helper hook to filter, search, sort, and paginate sermons from backend
 */
export function useFilteredSermons(
  filters: SermonFilters,
  sortConfig: SermonSortConfig,
  page: number,
  pageSize: number
) {
  const {
    sermons,
    isLoading,
    addSermon,
    updateSermon,
    deleteSermon,
    getSermonById,
    refetch
  } = useSermons();

  const filteredSermons = useMemo(() => {
    let result = [...sermons];

    // Search query (Title, description, scripture reference, speaker)
    if (filters.search) {
      const q = filters.search.toLowerCase();
      result = result.filter(
        (s) =>
          s.title.toLowerCase().includes(q) ||
          s.description.toLowerCase().includes(q) ||
          (s.scripture_reference && s.scripture_reference.toLowerCase().includes(q)) ||
          s.speaker.toLowerCase().includes(q)
      );
    }

    // Category filter
    if (filters.category !== "all") {
      result = result.filter((s) => s.category === filters.category);
    }

    // Status filter
    if (filters.status !== "all") {
      result = result.filter((s) => s.status === filters.status);
    }

    // Speaker filter
    if (filters.speaker !== "all") {
      result = result.filter((s) => s.speaker === filters.speaker);
    }

    // Sorting
    result.sort((a, b) => {
      let aVal: string | number = a[sortConfig.key] || "";
      let bVal: string | number = b[sortConfig.key] || "";

      if (sortConfig.key === "sermon_date") {
        aVal = new Date(a.sermon_date).getTime();
        bVal = new Date(b.sermon_date).getTime();
      }

      if (aVal < bVal) return sortConfig.direction === "asc" ? -1 : 1;
      if (aVal > bVal) return sortConfig.direction === "asc" ? 1 : -1;
      return 0;
    });

    return result;
  }, [sermons, filters, sortConfig]);

  const totalItems = filteredSermons.length;
  const totalPages = Math.ceil(totalItems / pageSize);

  const paginatedSermons = useMemo(() => {
    const startIdx = (page - 1) * pageSize;
    return filteredSermons.slice(startIdx, startIdx + pageSize);
  }, [filteredSermons, page, pageSize]);

  // Featured Sermon
  const featuredSermon = useMemo(() => {
    return sermons.find((s) => s.featured && s.status === "Published") || null;
  }, [sermons]);

  return {
    sermons: paginatedSermons,
    totalItems,
    totalPages,
    featuredSermon,
    addSermon,
    updateSermon,
    deleteSermon,
    getSermonById,
    isLoading,
    refetch
  };
}

