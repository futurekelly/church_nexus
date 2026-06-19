"use client";

import { useState, useEffect, useCallback, useMemo } from "react";
import type { Event, EventFilters, EventSortConfig, EventRegistration, EventStats, RSVPStatus, PaginatedResponse } from "../types/event.types";
import { EventsRepository } from "../repositories/events.repository";
import { EventConflictService } from "../services/event-conflict.service";
import { useAuth } from "@/hooks/use-auth";

/**
 * Singleton state hook for Events data.
 * Wraps EventsRepository and ensures pages do not access storage directly.
 */
export function useEvents() {
  const { user, role } = useAuth();
  const branchId = (user as any)?.branch_id || "branch-001";
  const userUuid = user?.id ? String(user.id) : "d3b07384-d113-4ec2-a5d8-c83d6850c2f3";
  const userName = user ? `${user.first_name} ${user.last_name}` : "Member User";
  const memberId = (user as any)?.member_id || (user as any)?.memberId || null;

  const [rawEvents, setRawEvents] = useState<Event[]>([]);
  const [userRsvps, setUserRsvps] = useState<EventRegistration[]>([]);
  const [loading, setLoading] = useState(true);

  // Load events and user registrations
  const fetchState = useCallback(async () => {
    if (!role) return;
    try {
      setLoading(true);
      const paginated = await EventsRepository.getEvents(
        { search: "", type: "all", status: "all", dateRange: "all", showArchived: true },
        { branchId, role }
      );
      setRawEvents(paginated.results);

      // Load all RSVPs for this user
      const rsvpList: EventRegistration[] = [];
      for (const ev of paginated.results) {
        const rsvps = await EventsRepository.getRSVPs(ev.id);
        const userRsvp = rsvps.find(
          (r) =>
            (r.user_id && String(r.user_id) === String(userUuid)) ||
            (memberId && r.member_id && String(r.member_id) === String(memberId))
        );
        if (userRsvp) rsvpList.push(userRsvp);
      }
      setUserRsvps(rsvpList);
    } catch (err) {
      console.error("Failed to load events state:", err);
    } finally {
      setLoading(false);
    }
  }, [branchId, role, userUuid, memberId]);

  useEffect(() => {
    fetchState();
  }, [fetchState]);

  // Tab synchronization listener
  useEffect(() => {
    if (typeof window === "undefined") return;
    const handleSync = (e: any) => {
      const customEvent = e as CustomEvent<{ key: string }>;
      if (
        customEvent.detail &&
        (customEvent.detail.key === "church-mock-events" ||
          customEvent.detail.key === "church-mock-event-registrations")
      ) {
        fetchState();
      }
    };
    window.addEventListener("local-storage-update" as any, handleSync);
    return () => {
      window.removeEventListener("local-storage-update" as any, handleSync);
    };
  }, [fetchState]);

  const addEvent = useCallback(
    async (newEvent: Omit<Event, "id" | "registered_count" | "created_at" | "updated_at" | "is_archived" | "archived_at">) => {
      const created = await EventsRepository.createEvent(newEvent);
      await fetchState();
      return created;
    },
    [fetchState]
  );

  const updateEvent = useCallback(
    async (id: string, updatedFields: Partial<Event>) => {
      const updated = await EventsRepository.updateEvent(id, updatedFields);
      await fetchState();
      return updated;
    },
    [fetchState]
  );

  const cancelEvent = useCallback(
    async (id: string) => {
      await updateEvent(id, { status: "Cancelled" });
    },
    [updateEvent]
  );

  const archiveEvent = useCallback(
    async (id: string) => {
      await EventsRepository.archiveEvent(id);
      await fetchState();
    },
    [fetchState]
  );

  const restoreEvent = useCallback(
    async (id: string) => {
      await EventsRepository.restoreEvent(id);
      await fetchState();
    },
    [fetchState]
  );

  /**
   * Toggles the user's registration for an event.
   * Promotes waitlisted candidates if the user cancels.
   */
  const toggleRegister = useCallback(
    async (eventId: string) => {
      try {
        const existingRsvp = userRsvps.find((r) => r.event_id === eventId);
        
        if (existingRsvp) {
          // If already registered, cancel/decline the RSVP
          await EventsRepository.updateRSVPStatus(existingRsvp.id, "Declined");
        } else {
          // Create new Attending RSVP
          await EventsRepository.createRSVP({
            event_id: eventId,
            user_id: userUuid,
            member_id: memberId,
            visitor_name: user ? `${user.first_name} ${user.last_name}` : "Member Guest",
            visitor_email: user?.email || "guest@churchnexus.org",
            visitor_phone: (user as any)?.phone || "",
            status: "Attending",
            notes: null
          });
        }
        await fetchState();
      } catch (err) {
        console.error("Failed to toggle registration:", err);
      }
    },
    [userRsvps, userUuid, memberId, user, fetchState]
  );

  const getEventById = useCallback(
    (id: string) => {
      return rawEvents.find((e) => e.id === id) || null;
    },
    [rawEvents]
  );

  const isUserRegistered = useCallback(
    (eventId: string) => {
      const r = userRsvps.find((rsvp) => rsvp.event_id === eventId);
      return !!r && (r.status === "Attending" || r.status === "Waitlisted");
    },
    [userRsvps]
  );

  const getUserRSVPStatus = useCallback(
    (eventId: string): RSVPStatus | null => {
      const r = userRsvps.find((rsvp) => rsvp.event_id === eventId);
      return r ? r.status : null;
    },
    [userRsvps]
  );

  return {
    events: rawEvents,
    addEvent,
    updateEvent,
    cancelEvent,
    archiveEvent,
    restoreEvent,
    toggleRegister,
    getEventById,
    isUserRegistered,
    getUserRSVPStatus,
    loading
  };
}

/**
 * Filter hook to search, sort, and paginate events from the repository
 */
export function useFilteredEvents(
  filters: EventFilters,
  sortConfig: EventSortConfig,
  page: number,
  pageSize: number
) {
  const { role, user } = useAuth();
  const branchId = (user as any)?.branch_id || "branch-001";
  const { events, addEvent, updateEvent, cancelEvent, toggleRegister, getEventById, isUserRegistered } = useEvents();

  const [paginatedData, setPaginatedData] = useState<PaginatedResponse<Event>>({
    count: 0,
    page: 1,
    page_size: pageSize,
    total_pages: 1,
    next: null,
    previous: null,
    results: []
  });
  const [loading, setLoading] = useState(true);

  const fetchFilteredData = useCallback(async () => {
    if (!role) return;
    setLoading(true);
    try {
      const repoFilters: EventFilters = {
        ...filters,
        page,
        pageSize
      };
      const response = await EventsRepository.getEvents(repoFilters, { branchId, role });
      setPaginatedData(response);
    } catch (err) {
      console.error("Failed to load filtered events:", err);
    } finally {
      setLoading(false);
    }
  }, [filters, page, pageSize, branchId, role]);

  useEffect(() => {
    fetchFilteredData();
  }, [fetchFilteredData]);

  // Tab sync refresh
  useEffect(() => {
    if (typeof window === "undefined") return;
    const handleSync = (e: any) => {
      const customEvent = e as CustomEvent<{ key: string }>;
      if (
        customEvent.detail &&
        (customEvent.detail.key === "church-mock-events" ||
          customEvent.detail.key === "church-mock-event-registrations")
      ) {
        fetchFilteredData();
      }
    };
    window.addEventListener("local-storage-update" as any, handleSync);
    return () => {
      window.removeEventListener("local-storage-update" as any, handleSync);
    };
  }, [fetchFilteredData]);

  // Sorting helper
  const sortedResults = useMemo(() => {
    const list = [...paginatedData.results];
    list.sort((a, b) => {
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
    return list;
  }, [paginatedData.results, sortConfig]);

  // Aggregate stats
  const stats = useMemo<EventStats>(() => {
    const now = new Date();
    const upcoming = events.filter((e) => new Date(e.start_date) >= now && e.status !== "Cancelled" && e.status !== "Archived");
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
      capacityUtilization: avgUtilization
    };
  }, [events]);

  return {
    events: sortedResults,
    totalItems: paginatedData.count,
    totalPages: paginatedData.total_pages,
    stats,
    addEvent,
    updateEvent,
    cancelEvent,
    toggleRegister,
    getEventById,
    isUserRegistered,
    loading
  };
}
