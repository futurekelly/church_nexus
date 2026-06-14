"use client";

import { useMemo, useCallback } from "react";
import { MOCK_SERMONS } from "../data/mock-sermons";
import type { Sermon, SermonFilters, SermonSortConfig } from "../types/sermon.types";
import { useLocalStorageState } from "@/hooks/use-local-storage-state";

const LOCAL_STORAGE_KEY = "church-mock-sermons";

/**
 * Singleton state hook for Sermons data using localstorage.
 * Syncs reactive changes across all instances using the shared useLocalStorageState.
 */
export function useSermons() {
  const [sermons, setSermons] = useLocalStorageState<Sermon[]>(
    LOCAL_STORAGE_KEY,
    MOCK_SERMONS
  );

  const addSermon = useCallback(
    (newSermon: Omit<Sermon, "id" | "created_at" | "updated_at">) => {
      const sermon: Sermon = {
        ...newSermon,
        id: `se-${Date.now()}`,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };

      setSermons((prev) => {
        let updatedList = [...prev];
        if (newSermon.featured) {
          updatedList = updatedList.map((s) =>
            s.featured ? { ...s, featured: false } : s
          );
        }
        return [sermon, ...updatedList];
      });

      return sermon;
    },
    [setSermons]
  );

  const updateSermon = useCallback(
    (id: string, updatedFields: Partial<Sermon>) => {
      setSermons((prev) => {
        let updatedList = [...prev];
        if (updatedFields.featured) {
          // Unfeature others
          updatedList = updatedList.map((s) =>
            s.featured ? { ...s, featured: false } : s
          );
        }

        return updatedList.map((s) =>
          s.id === id
            ? {
                ...s,
                ...updatedFields,
                updated_at: new Date().toISOString(),
              }
            : s
        );
      });
    },
    [setSermons]
  );

  const deleteSermon = useCallback(
    (id: string) => {
      // Soft-delete: change status to Archived
      updateSermon(id, { status: "Archived", featured: false });
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
    addSermon,
    updateSermon,
    deleteSermon,
    getSermonById,
  };
}

/**
 * Helper hook to filter, search, sort, and paginate sermons
 */
export function useFilteredSermons(
  filters: SermonFilters,
  sortConfig: SermonSortConfig,
  page: number,
  pageSize: number
) {
  const {
    sermons,
    addSermon,
    updateSermon,
    deleteSermon,
    getSermonById,
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
          s.scripture_reference.toLowerCase().includes(q) ||
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
      let aVal: string | number = a[sortConfig.key];
      let bVal: string | number = b[sortConfig.key];

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
  };
}
