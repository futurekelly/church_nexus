"use client";

import { useState, useEffect, useMemo, useCallback } from "react";
import { MOCK_SERMONS } from "../data/mock-sermons";
import type { Sermon, SermonFilters, SermonSortConfig } from "../types/sermon.types";

const LOCAL_STORAGE_KEY = "church-mock-sermons";

const getInitialSermons = (): Sermon[] => {
  if (typeof window === "undefined") return MOCK_SERMONS;
  const stored = localStorage.getItem(LOCAL_STORAGE_KEY);
  if (stored) {
    try {
      return JSON.parse(stored);
    } catch {
      return MOCK_SERMONS;
    }
  }
  localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(MOCK_SERMONS));
  return MOCK_SERMONS;
};

const notifyStorageChange = () => {
  if (typeof window !== "undefined") {
    window.dispatchEvent(new CustomEvent("church-sermons-update"));
  }
};

/**
 * Singleton state hook for Sermons data using localstorage.
 * Syncs reactive changes across all instances without Zustand.
 */
export function useSermons() {
  const [sermons, setSermons] = useState<Sermon[]>([]);

  const reloadData = useCallback(() => {
    setSermons(getInitialSermons());
  }, []);

  useEffect(() => {
    reloadData();
    if (typeof window !== "undefined") {
      window.addEventListener("church-sermons-update", reloadData);
      return () => {
        window.removeEventListener("church-sermons-update", reloadData);
      };
    }
  }, [reloadData]);

  const addSermon = useCallback((newSermon: Omit<Sermon, "id" | "created_at" | "updated_at">) => {
    const list = getInitialSermons();
    
    // If new sermon is marked as featured, unfeature others
    let updatedList = [...list];
    if (newSermon.featured) {
      updatedList = updatedList.map(s => s.featured ? { ...s, featured: false } : s);
    }

    const sermon: Sermon = {
      ...newSermon,
      id: `se-${Date.now()}`,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    updatedList = [sermon, ...updatedList];
    localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(updatedList));
    notifyStorageChange();
    return sermon;
  }, []);

  const updateSermon = useCallback((id: string, updatedFields: Partial<Sermon>) => {
    const list = getInitialSermons();
    
    let updatedList = [...list];
    if (updatedFields.featured) {
      // Unfeature others
      updatedList = updatedList.map(s => s.featured ? { ...s, featured: false } : s);
    }

    updatedList = updatedList.map((s) =>
      s.id === id
        ? {
            ...s,
            ...updatedFields,
            updated_at: new Date().toISOString(),
          }
        : s
    );
    localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(updatedList));
    notifyStorageChange();
  }, []);

  const deleteSermon = useCallback((id: string) => {
    // Soft-delete: change status to Archived
    updateSermon(id, { status: "Archived", featured: false });
  }, [updateSermon]);

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
