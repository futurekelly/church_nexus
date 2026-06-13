"use client";

import { useState, useEffect, useMemo, useCallback } from "react";
import { MOCK_PRAYERS } from "../data/mock-prayers";
import type {
  PrayerRequest,
  PrayerFilters,
  PrayerSortConfig,
} from "../types/prayer.types";

const LOCAL_STORAGE_KEY = "church-mock-prayers";

const getInitialPrayers = (): PrayerRequest[] => {
  if (typeof window === "undefined") return MOCK_PRAYERS;
  const stored = localStorage.getItem(LOCAL_STORAGE_KEY);
  if (stored) {
    try {
      return JSON.parse(stored);
    } catch {
      return MOCK_PRAYERS;
    }
  }
  localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(MOCK_PRAYERS));
  return MOCK_PRAYERS;
};

const notifyStorageChange = () => {
  if (typeof window !== "undefined") {
    window.dispatchEvent(new CustomEvent("church-prayers-update"));
  }
};

/**
 * Singleton state hook for Prayer Requests using LocalStorage.
 * Syncs reactive changes across all instances.
 */
export function usePrayers() {
  const [prayers, setPrayers] = useState<PrayerRequest[]>([]);

  const reloadData = useCallback(() => {
    setPrayers(getInitialPrayers());
  }, []);

  useEffect(() => {
    reloadData();
    if (typeof window !== "undefined") {
      window.addEventListener("church-prayers-update", reloadData);
      return () => {
        window.removeEventListener("church-prayers-update", reloadData);
      };
    }
  }, [reloadData]);

  const addRequest = useCallback(
    (
      newRequest: Omit<
        PrayerRequest,
        | "id"
        | "status"
        | "pray_count"
        | "prayed_user_ids"
        | "pastor_response"
        | "created_at"
        | "updated_at"
      >
    ) => {
      const list = getInitialPrayers();

      const request: PrayerRequest = {
        ...newRequest,
        id: `pr-${Date.now()}`,
        status: "New",
        pray_count: 0,
        prayed_user_ids: [],
        pastor_response: null,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };

      const updatedList = [request, ...list];
      localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(updatedList));
      notifyStorageChange();
      return request;
    },
    []
  );

  const updateRequest = useCallback(
    (id: string, updatedFields: Partial<PrayerRequest>) => {
      const list = getInitialPrayers();

      const updatedList = list.map((p) =>
        p.id === id
          ? {
              ...p,
              ...updatedFields,
              updated_at: new Date().toISOString(),
            }
          : p
      );

      localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(updatedList));
      notifyStorageChange();
    },
    []
  );

  const updateStatus = useCallback(
    (id: string, status: PrayerRequest["status"]) => {
      updateRequest(id, { status });
    },
    [updateRequest]
  );

  const respondToRequest = useCallback(
    (id: string, response: string | null) => {
      updateRequest(id, { pastor_response: response });
    },
    [updateRequest]
  );

  const togglePrayCount = useCallback(
    (id: string, userId: string | number) => {
      const list = getInitialPrayers();

      const updatedList = list.map((p) => {
        if (p.id !== id) return p;

        const alreadyPrayed = p.prayed_user_ids.map(String).includes(String(userId));
        const prayedIds = alreadyPrayed
          ? p.prayed_user_ids.filter((uid) => String(uid) !== String(userId))
          : [...p.prayed_user_ids, userId];

        return {
          ...p,
          prayed_user_ids: prayedIds,
          pray_count: prayedIds.length,
          updated_at: new Date().toISOString(),
        };
      });

      localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(updatedList));
      notifyStorageChange();
    },
    []
  );

  const deleteRequest = useCallback(
    (id: string) => {
      // Soft-delete transition to Archived status
      updateStatus(id, "Archived");
    },
    [updateStatus]
  );

  const getRequestById = useCallback(
    (id: string) => {
      return prayers.find((p) => p.id === id) || null;
    },
    [prayers]
  );

  return {
    prayers,
    addRequest,
    updateRequest,
    updateStatus,
    respondToRequest,
    togglePrayCount,
    deleteRequest,
    getRequestById,
  };
}

/**
 * Filter, search, and paginate prayer requests
 */
export function useFilteredPrayers(
  filters: PrayerFilters,
  sortConfig: PrayerSortConfig,
  page: number,
  pageSize: number,
  canSeeAnonymousNames: boolean
) {
  const {
    prayers,
    addRequest,
    updateRequest,
    updateStatus,
    respondToRequest,
    togglePrayCount,
    deleteRequest,
    getRequestById,
  } = usePrayers();

  const filtered = useMemo(() => {
    let result = [...prayers];

    // Filter out Archived requests for Visitors/Members if they don't have manage permission,
    // actually, let's keep all requests except soft-deleted ones or let status selector decide.
    // Standard rule: Archived is shown if explicitly selected or in general library.

    // 1. Search Query
    if (filters.search) {
      const q = filters.search.toLowerCase();
      result = result.filter((p) => {
        const titleMatch = p.title.toLowerCase().includes(q);
        const descMatch = p.description.toLowerCase().includes(q);
        
        // Match user name only if visible
        const showName = !p.anonymous || canSeeAnonymousNames;
        const nameMatch = showName && p.user_name.toLowerCase().includes(q);
        
        return titleMatch || descMatch || nameMatch;
      });
    }

    // 2. Category Filter
    if (filters.category !== "all") {
      result = result.filter((p) => p.category === filters.category);
    }

    // 3. Status Filter
    if (filters.status !== "all") {
      result = result.filter((p) => p.status === filters.status);
    } else {
      // If status is "all", default to hiding "Archived" requests to keep view clean,
      // unless user is searching explicitly for Archived status.
      result = result.filter((p) => p.status !== "Archived");
    }

    // Sort configurations
    result.sort((a, b) => {
      if (sortConfig.field === "created_at") {
        const timeA = new Date(a.created_at).getTime();
        const timeB = new Date(b.created_at).getTime();
        return sortConfig.direction === "desc" ? timeB - timeA : timeA - timeB;
      }
      if (sortConfig.field === "pray_count") {
        return sortConfig.direction === "desc"
          ? b.pray_count - a.pray_count
          : a.pray_count - b.pray_count;
      }
      if (sortConfig.field === "status") {
        return sortConfig.direction === "desc"
          ? b.status.localeCompare(a.status)
          : a.status.localeCompare(b.status);
      }
      return 0;
    });

    return result;
  }, [prayers, filters, sortConfig, canSeeAnonymousNames]);

  const totalItems = filtered.length;
  const totalPages = Math.ceil(totalItems / pageSize);

  const paginatedItems = useMemo(() => {
    const startIndex = (page - 1) * pageSize;
    return filtered.slice(startIndex, startIndex + pageSize);
  }, [filtered, page, pageSize]);

  return {
    prayers: paginatedItems,
    totalItems,
    totalPages,
    addRequest,
    updateRequest,
    updateStatus,
    respondToRequest,
    togglePrayCount,
    deleteRequest,
    getRequestById,
  };
}
