"use client";

import { useState, useEffect, useMemo, useCallback } from "react";
import { MOCK_EVENTS } from "../data/mock-events";
import type { Event, EventFilters, EventSortConfig } from "../types/event.types";

const LOCAL_STORAGE_KEY = "church-mock-events";
const REGISTRATIONS_KEY = "church-mock-event-registrations";

// Helper to initialize local storage data safe for SSR
const getInitialEvents = (): Event[] => {
  if (typeof window === "undefined") return MOCK_EVENTS;
  const stored = localStorage.getItem(LOCAL_STORAGE_KEY);
  if (stored) {
    try {
      return JSON.parse(stored);
    } catch {
      return MOCK_EVENTS;
    }
  }
  localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(MOCK_EVENTS));
  return MOCK_EVENTS;
};

const getInitialRegistrations = (): Record<string, boolean> => {
  if (typeof window === "undefined") return {};
  const stored = localStorage.getItem(REGISTRATIONS_KEY);
  if (stored) {
    try {
      return JSON.parse(stored);
    } catch {
      return {};
    }
  }
  return {};
};

const notifyStorageChange = () => {
  if (typeof window !== "undefined") {
    window.dispatchEvent(new CustomEvent("church-events-update"));
  }
};

/**
 * Singleton state hook for Events data using localstorage.
 * Syncs reactive changes across all instances without Zustand.
 */
export function useEvents() {
  const [events, setEvents] = useState<Event[]>([]);
  const [registrations, setRegistrations] = useState<Record<string, boolean>>({});

  const reloadData = useCallback(() => {
    setEvents(getInitialEvents());
    setRegistrations(getInitialRegistrations());
  }, []);

  useEffect(() => {
    reloadData();
    if (typeof window !== "undefined") {
      window.addEventListener("church-events-update", reloadData);
      return () => {
        window.removeEventListener("church-events-update", reloadData);
      };
    }
  }, [reloadData]);

  const addEvent = useCallback((newEvent: Omit<Event, "id" | "registered_count" | "created_at" | "updated_at">) => {
    const list = getInitialEvents();
    const event: Event = {
      ...newEvent,
      id: `ev-${Date.now()}`,
      registered_count: 0,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };
    const updated = [event, ...list];
    localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(updated));
    notifyStorageChange();
    return event;
  }, []);

  const updateEvent = useCallback((id: string, updatedFields: Partial<Event>) => {
    const list = getInitialEvents();
    const updated = list.map((e) =>
      e.id === id
        ? {
            ...e,
            ...updatedFields,
            updated_at: new Date().toISOString(),
          }
        : e
    );
    localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(updated));
    notifyStorageChange();
  }, []);

  const cancelEvent = useCallback((id: string) => {
    updateEvent(id, { status: "Cancelled" });
  }, [updateEvent]);

  const toggleRegister = useCallback((eventId: string) => {
    const regs = getInitialRegistrations();
    const isRegistered = !regs[eventId];
    regs[eventId] = isRegistered;
    localStorage.setItem(REGISTRATIONS_KEY, JSON.stringify(regs));

    const list = getInitialEvents();
    const updated = list.map((e) => {
      if (e.id === eventId) {
        const diff = isRegistered ? 1 : -1;
        return {
          ...e,
          registered_count: Math.max(0, Math.min(e.capacity, e.registered_count + diff)),
        };
      }
      return e;
    });
    localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(updated));
    notifyStorageChange();
  }, []);

  const getEventById = useCallback(
    (id: string) => {
      return events.find((e) => e.id === id) || null;
    },
    [events]
  );

  const isUserRegistered = useCallback(
    (eventId: string) => {
      return !!registrations[eventId];
    },
    [registrations]
  );

  return {
    events,
    addEvent,
    updateEvent,
    cancelEvent,
    toggleRegister,
    getEventById,
    isUserRegistered,
  };
}

/**
 * Helper hook to filter, search, sort, and paginate events
 */
export function useFilteredEvents(
  filters: EventFilters,
  sortConfig: EventSortConfig,
  page: number,
  pageSize: number
) {
  const {
    events,
    addEvent,
    updateEvent,
    cancelEvent,
    toggleRegister,
    getEventById,
    isUserRegistered,
  } = useEvents();

  const filteredEvents = useMemo(() => {
    let result = [...events];

    // Search query
    if (filters.search) {
      const q = filters.search.toLowerCase();
      result = result.filter(
        (e) =>
          e.title.toLowerCase().includes(q) ||
          e.description.toLowerCase().includes(q) ||
          e.location.toLowerCase().includes(q) ||
          e.organizer.toLowerCase().includes(q)
      );
    }

    // Type filter
    if (filters.type !== "all") {
      result = result.filter((e) => e.event_type === filters.type);
    }

    // Status filter
    if (filters.status !== "all") {
      result = result.filter((e) => e.status === filters.status);
    }

    // Date range filter
    const now = new Date();
    const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const todayEnd = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 23, 59, 59, 999);

    if (filters.dateRange === "today") {
      result = result.filter((e) => {
        const start = new Date(e.start_date);
        return start >= todayStart && start <= todayEnd;
      });
    } else if (filters.dateRange === "upcoming") {
      result = result.filter((e) => new Date(e.start_date) >= now);
    } else if (filters.dateRange === "past") {
      result = result.filter((e) => new Date(e.end_date) < now || e.status === "Completed");
    } else if (filters.dateRange === "this-week") {
      const oneWeekFromNow = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);
      result = result.filter((e) => {
        const start = new Date(e.start_date);
        return start >= now && start <= oneWeekFromNow;
      });
    }

    // Sorting
    result.sort((a, b) => {
      let aVal: string | number = a[sortConfig.key];
      let bVal: string | number = b[sortConfig.key];

      if (sortConfig.key === "start_date") {
        aVal = new Date(a.start_date).getTime();
        bVal = new Date(b.start_date).getTime();
      }

      if (aVal < bVal) return sortConfig.direction === "asc" ? -1 : 1;
      if (aVal > bVal) return sortConfig.direction === "asc" ? 1 : -1;
      return 0;
    });

    return result;
  }, [events, filters, sortConfig]);

  const totalItems = filteredEvents.length;
  const totalPages = Math.ceil(totalItems / pageSize);

  const paginatedEvents = useMemo(() => {
    const startIdx = (page - 1) * pageSize;
    return filteredEvents.slice(startIdx, startIdx + pageSize);
  }, [filteredEvents, page, pageSize]);

  // Aggregate stats
  const stats = useMemo(() => {
    const now = new Date();
    const upcoming = events.filter((e) => new Date(e.start_date) >= now && e.status !== "Cancelled");
    const completed = events.filter((e) => e.status === "Completed" || new Date(e.end_date) < now);
    const totalRegs = events.reduce((sum, e) => sum + e.registered_count, 0);

    const eventsWithCapacity = events.filter((e) => e.capacity > 0);
    const avgUtilization =
      eventsWithCapacity.length > 0
        ? Math.round(
            (eventsWithCapacity.reduce((sum, e) => sum + e.registered_count / e.capacity, 0) /
              eventsWithCapacity.length) *
              100
          )
        : 0;

    return {
      upcomingCount: upcoming.length,
      completedCount: completed.length,
      totalRegistrations: totalRegs,
      capacityUtilization: avgUtilization,
    };
  }, [events]);

  return {
    events: paginatedEvents,
    totalItems,
    totalPages,
    stats,
    addEvent,
    updateEvent,
    cancelEvent,
    toggleRegister,
    getEventById,
    isUserRegistered,
  };
}
