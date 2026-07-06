"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import type {
  Sermon,
  SermonSeries,
  SermonFilters,
  SermonSortConfig
} from "../types/sermon.types";
import { apiGet, apiPost, apiPatch, apiDelete, isApiError } from "@/services/api-client";
import { toast } from "sonner";

/**
 * Mapper utility to normalize API responses to frontend TS types.
 * Resolves null or missing database values to safe defaults.
 */
const mapSermonToFrontend = (s: any): Sermon => ({
  id: s.id,
  title: s.title,
  description: s.description || "",
  scripture_reference: s.scripture_reference || "",
  sermon_date: s.sermon_date,
  status: s.status,
  thumbnail: s.thumbnail || "",
  video_url: s.video_url || "",
  audio_url: s.audio_url || "",
  hls_url: s.hls_url || "",
  speaker: s.speaker,
  category: s.category,
  featured: s.featured,
  views_count: s.views_count || 0,
  part_number: s.part_number || null,
  series: s.series || null,
  series_details: s.series_details || null,
  notes: s.notes || "",
  tags: s.tags || [],
  created_at: s.created_at,
  updated_at: s.updated_at,
});

/**
 * Hook to manage Sermon Series data using backend APIs.
 */
export function useSermonSeries() {
  const [seriesList, setSeriesList] = useState<SermonSeries[]>([]);
  const [isLoadingSeries, setIsLoadingSeries] = useState<boolean>(true);

  const fetchSeries = useCallback(async () => {
    setIsLoadingSeries(true);
    try {
      let branchId = "";
      try {
        const stored = localStorage.getItem("church-settings-branches");
        if (stored) {
          const parsed = JSON.parse(stored);
          if (Array.isArray(parsed) && parsed.length > 0) branchId = parsed[0].id;
        }
      } catch {}
      if (!branchId) branchId = "branch-001";

      const response = await apiGet<any>(`/api/sermons/series/?branch=${branchId}`);
      if (!isApiError(response)) {
        const data = response.data;
        const results = Array.isArray(data) ? data : data.results || [];
        setSeriesList(results);
      }
    } catch (err) {
      console.error("Failed to fetch sermon series:", err);
    } finally {
      setIsLoadingSeries(false);
    }
  }, []);

  useEffect(() => {
    fetchSeries();
  }, [fetchSeries]);

  const createSeries = useCallback(async (newSeries: Partial<SermonSeries>) => {
    try {
      const response = await apiPost<any>("/api/sermons/series/", newSeries);
      if (!isApiError(response)) {
        toast.success("Sermon series created successfully.");
        await fetchSeries();
        return response.data as SermonSeries;
      } else {
        toast.error(`Failed to create series: ${response.message}`);
      }
    } catch (err: any) {
      toast.error("Failed to create sermon series.");
    }
    return null;
  }, [fetchSeries]);

  return { seriesList, isLoadingSeries, refetchSeries: fetchSeries, createSeries };
}

/**
 * Hook to manage Sermons data using backend APIs.
 * Supports server-side filtering, sorting, and pagination.
 */
export function useSermons(options?: {
  filters?: SermonFilters;
  sortConfig?: SermonSortConfig;
  page?: number;
  pageSize?: number;
}) {
  const [sermons, setSermons] = useState<Sermon[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [totalItems, setTotalItems] = useState<number>(0);
  const fetchedIds = useRef<Set<string>>(new Set());

  const serializedOptions = JSON.stringify(options);

  const fetchSermons = useCallback(async () => {
    setIsLoading(true);
    try {
      const params = new URLSearchParams();

      let branchId = "";
      try {
        const storedBranches = localStorage.getItem("church-settings-branches");
        if (storedBranches) {
          const parsed = JSON.parse(storedBranches);
          if (Array.isArray(parsed) && parsed.length > 0) {
            branchId = parsed[0].id;
          }
        }
      } catch (e) {
        console.error("Failed to parse branches from localStorage", e);
      }
      if (!branchId) {
        branchId = "branch-001";
      }
      params.append("branch", branchId);

      if (options?.page) {
        params.append("page", String(options.page));
      }
      if (options?.pageSize) {
        params.append("page_size", String(options.pageSize));
      }
      if (options?.filters) {
        const { search, category, status, speaker, series, scripture, featured, date_from, date_to, ordering } = options.filters;
        if (search) params.append("search", search);
        if (category && category !== "all") params.append("category", category);
        if (status && status !== "all") params.append("status", status);
        if (speaker && speaker !== "all") params.append("speaker", speaker);
        if (series && series !== "all") params.append("series", series);
        if (scripture) params.append("scripture", scripture);
        if (featured !== undefined) params.append("featured", String(featured));
        if (date_from) params.append("date_from", date_from);
        if (date_to) params.append("date_to", date_to);
        if (ordering) params.append("ordering", ordering);
      }
      if (options?.sortConfig && !options.filters?.ordering) {
        const prefix = options.sortConfig.direction === "desc" ? "-" : "";
        params.append("ordering", `${prefix}${options.sortConfig.key}`);
      }

      const response = await apiGet<any>(`/api/sermons/?${params.toString()}`);
      if (!isApiError(response)) {
        const rawData = response.data;
        const results = rawData && Array.isArray(rawData.results) ? rawData.results : [];
        setSermons(results.map(mapSermonToFrontend));
        setTotalItems(rawData && typeof rawData.count === "number" ? rawData.count : results.length);
      } else {
        toast.error(`Failed to load sermons: ${response.message}`);
      }
    } catch (err: any) {
      console.error("Failed to fetch sermons:", err);
      toast.error("Failed to sync sermons data with backend.");
    } finally {
      setIsLoading(false);
    }
  }, [serializedOptions]);

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
      await updateSermon(id, { status: "Archived", featured: false });
    },
    [updateSermon]
  );

  const getSermonById = useCallback(
    (id: string) => {
      const found = sermons.find((s) => s.id === id);
      if (found) return found;

      if (id && !fetchedIds.current.has(id)) {
        fetchedIds.current.add(id);
        apiGet<any>(`/api/sermons/${id}/`)
          .then((response) => {
            if (!isApiError(response) && response.data) {
              const fetchedSermon = mapSermonToFrontend(response.data);
              setSermons((prev) => {
                if (prev.some((s) => s.id === fetchedSermon.id)) return prev;
                return [...prev, fetchedSermon];
              });
            }
          })
          .catch((err) => {
            console.error(`Failed to fetch sermon ${id}:`, err);
          });
      }
      return null;
    },
    [sermons]
  );

  return {
    sermons,
    totalItems,
    isLoading,
    addSermon,
    updateSermon,
    deleteSermon,
    getSermonById,
    refetch: fetchSermons,
  };
}

/**
 * Helper hook to filter, search, sort, and paginate sermons from backend.
 */
export function useFilteredSermons(
  filters: SermonFilters,
  sortConfig: SermonSortConfig,
  page: number,
  pageSize: number
) {
  const {
    sermons,
    totalItems,
    isLoading,
    addSermon,
    updateSermon,
    deleteSermon,
    getSermonById,
    refetch,
  } = useSermons({
    filters,
    sortConfig,
    page,
    pageSize,
  });

  const [featuredSermon, setFeaturedSermon] = useState<Sermon | null>(null);

  useEffect(() => {
    let branchId = "";
    try {
      const storedBranches = localStorage.getItem("church-settings-branches");
      if (storedBranches) {
        const parsed = JSON.parse(storedBranches);
        if (Array.isArray(parsed) && parsed.length > 0) {
          branchId = parsed[0].id;
        }
      }
    } catch {}
    if (!branchId) branchId = "branch-001";

    apiGet<any>(`/api/sermons/?featured=true&branch=${branchId}`)
      .then((res) => {
        if (!isApiError(res) && res.data) {
          const results = Array.isArray(res.data) ? res.data : res.data.results;
          if (Array.isArray(results) && results.length > 0) {
            setFeaturedSermon(mapSermonToFrontend(results[0]));
          } else {
            setFeaturedSermon(null);
          }
        }
      })
      .catch((err) => {
        console.error("Failed to fetch featured sermon:", err);
      });
  }, []);

  const totalPages = Math.ceil(totalItems / pageSize);

  return {
    sermons,
    totalItems,
    totalPages,
    featuredSermon,
    addSermon,
    updateSermon,
    deleteSermon,
    getSermonById,
    isLoading,
    refetch,
  };
}

