"use client";

import { useState, useEffect, useMemo, useCallback } from "react";
import { MOCK_SESSIONS, MOCK_RECORDS } from "../data/mock-attendance";
import type {
  AttendanceSession,
  AttendanceRecord,
  FollowUpTicket,
  AttendanceFilters,
  AttendanceSortConfig,
} from "../types/attendance.types";
import { MOCK_MEMBERS } from "@/features/members/data/mock-members";

const SESSIONS_KEY = "church-mock-attendance-sessions";
const RECORDS_KEY = "church-mock-attendance-records";
const TICKETS_KEY = "church-attendance-follow-up-tickets";

const getInitialSessions = (): AttendanceSession[] => {
  if (typeof window === "undefined") return MOCK_SESSIONS;
  const stored = localStorage.getItem(SESSIONS_KEY);
  if (stored) {
    try {
      return JSON.parse(stored);
    } catch {
      return MOCK_SESSIONS;
    }
  }
  localStorage.setItem(SESSIONS_KEY, JSON.stringify(MOCK_SESSIONS));
  return MOCK_SESSIONS;
};

const getInitialRecords = (): AttendanceRecord[] => {
  if (typeof window === "undefined") return MOCK_RECORDS;
  const stored = localStorage.getItem(RECORDS_KEY);
  if (stored) {
    try {
      return JSON.parse(stored);
    } catch {
      return MOCK_RECORDS;
    }
  }
  localStorage.setItem(RECORDS_KEY, JSON.stringify(MOCK_RECORDS));
  return MOCK_RECORDS;
};

const getInitialTickets = (): FollowUpTicket[] => {
  if (typeof window === "undefined") return [];
  const stored = localStorage.getItem(TICKETS_KEY);
  if (stored) {
    try {
      return JSON.parse(stored);
    } catch {
      return [];
    }
  }
  localStorage.setItem(TICKETS_KEY, JSON.stringify([]));
  return [];
};

const notifyStorageChange = () => {
  if (typeof window !== "undefined") {
    window.dispatchEvent(new CustomEvent("church-attendance-update"));
  }
};

/**
 * Singleton state hook for Attendance sessions and check-in records.
 */
export function useAttendance() {
  const [sessions, setSessions] = useState<AttendanceSession[]>([]);
  const [records, setRecords] = useState<AttendanceRecord[]>([]);
  const [tickets, setTickets] = useState<FollowUpTicket[]>([]);

  const reloadData = useCallback(() => {
    setSessions(getInitialSessions());
    setRecords(getInitialRecords());
    setTickets(getInitialTickets());
  }, []);

  useEffect(() => {
    reloadData();
    if (typeof window !== "undefined") {
      window.addEventListener("church-attendance-update", reloadData);
      return () => {
        window.removeEventListener("church-attendance-update", reloadData);
      };
    }
  }, [reloadData]);

  const addSession = useCallback(
    (newSession: Omit<AttendanceSession, "id" | "status" | "present_count" | "absent_count" | "excused_count" | "created_at" | "updated_at">) => {
      const currentSessions = getInitialSessions();
      const currentRecords = getInitialRecords();

      const newId = `sess-${Date.now()}`;
      const session: AttendanceSession = {
        ...newSession,
        id: newId,
        status: "Active",
        present_count: 0,
        absent_count: MOCK_MEMBERS.length,
        excused_count: 0,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };

      // Generate initial blank records for this session for all members
      const newRecords: AttendanceRecord[] = MOCK_MEMBERS.map((m) => ({
        id: `rec-${newId}-${m.id}`,
        session_id: newId,
        member_id: m.id,
        member_name: `${m.first_name} ${m.last_name}`,
        membership_number: m.membership_number,
        gender: m.gender,
        status: "Absent",
        check_in_time: null,
        check_in_method: null,
      }));

      const updatedSessions = [session, ...currentSessions];
      const updatedRecords = [...newRecords, ...currentRecords];

      localStorage.setItem(SESSIONS_KEY, JSON.stringify(updatedSessions));
      localStorage.setItem(RECORDS_KEY, JSON.stringify(updatedRecords));
      notifyStorageChange();
      return session;
    },
    []
  );

  const updateSessionCounts = useCallback((sessionId: string, currentRecords: AttendanceRecord[]) => {
    const currentSessions = getInitialSessions();
    const sessionRecords = currentRecords.filter((r) => r.session_id === sessionId);

    const present = sessionRecords.filter((r) => r.status === "Present").length;
    const absent = sessionRecords.filter((r) => r.status === "Absent").length;
    const excused = sessionRecords.filter((r) => r.status === "Excused").length;

    const updatedSessions = currentSessions.map((s) =>
      s.id === sessionId
        ? {
            ...s,
            present_count: present,
            absent_count: absent,
            excused_count: excused,
            updated_at: new Date().toISOString(),
          }
        : s
    );

    localStorage.setItem(SESSIONS_KEY, JSON.stringify(updatedSessions));
  }, []);

  const checkInMember = useCallback(
    (sessionId: string, memberId: string, status: "Present" | "Absent", method: "QR" | "Barcode" | "Manual" | null) => {
      const currentRecords = getInitialRecords();

      const updatedRecords = currentRecords.map((r) => {
        if (r.session_id === sessionId && r.member_id === memberId) {
          return {
            ...r,
            status,
            check_in_time: status === "Present" ? new Date().toISOString() : null,
            check_in_method: status === "Present" ? method : null,
            excuse_notes: undefined,
          };
        }
        return r;
      });

      localStorage.setItem(RECORDS_KEY, JSON.stringify(updatedRecords));
      updateSessionCounts(sessionId, updatedRecords);
      notifyStorageChange();
    },
    [updateSessionCounts]
  );

  const excuseMember = useCallback(
    (sessionId: string, memberId: string, notes: string) => {
      const currentRecords = getInitialRecords();

      const updatedRecords = currentRecords.map((r) => {
        if (r.session_id === sessionId && r.member_id === memberId) {
          return {
            ...r,
            status: "Excused" as const,
            check_in_time: null,
            check_in_method: null,
            excuse_notes: notes,
          };
        }
        return r;
      });

      localStorage.setItem(RECORDS_KEY, JSON.stringify(updatedRecords));
      updateSessionCounts(sessionId, updatedRecords);
      notifyStorageChange();
    },
    [updateSessionCounts]
  );

  const closeSession = useCallback(
    (sessionId: string) => {
      const currentSessions = getInitialSessions();

      const updatedSessions = currentSessions.map((s) =>
        s.id === sessionId
          ? {
              ...s,
              status: "Completed" as const,
              updated_at: new Date().toISOString(),
            }
          : s
      );

      localStorage.setItem(SESSIONS_KEY, JSON.stringify(updatedSessions));
      notifyStorageChange();
    },
    []
  );

  const createFollowUpTicket = useCallback(
    (sessionId: string, memberId: string, reason: string) => {
      const currentTickets = getInitialTickets();
      const currentSessions = getInitialSessions();
      const session = currentSessions.find((s) => s.id === sessionId);

      const ticket: FollowUpTicket = {
        id: `tkt-${Date.now()}`,
        member_id: memberId,
        member_name: MOCK_MEMBERS.find((m) => m.id === memberId)?.first_name || "Member",
        session_id: sessionId,
        session_title: session?.title || "Session",
        session_date: session?.date || new Date().toISOString(),
        reason,
        status: "Pending",
        created_at: new Date().toISOString(),
      };

      const updatedTickets = [ticket, ...currentTickets];
      localStorage.setItem(TICKETS_KEY, JSON.stringify(updatedTickets));
      notifyStorageChange();
      return ticket;
    },
    []
  );

  const getSessionById = useCallback(
    (id: string) => {
      return sessions.find((s) => s.id === id) || null;
    },
    [sessions]
  );

  const getSessionRecords = useCallback(
    (sessionId: string) => {
      return records.filter((r) => r.session_id === sessionId);
    },
    [records]
  );

  return {
    sessions,
    records,
    tickets,
    addSession,
    checkInMember,
    excuseMember,
    closeSession,
    createFollowUpTicket,
    getSessionById,
    getSessionRecords,
  };
}

/**
 * Filter, search, and paginate historical sessions
 */
export function useFilteredSessions(
  filters: AttendanceFilters,
  sortConfig: AttendanceSortConfig,
  page: number,
  pageSize: number
) {
  const { sessions, addSession } = useAttendance();

  const filtered = useMemo(() => {
    let result = [...sessions];

    // Search query
    if (filters.search) {
      const q = filters.search.toLowerCase();
      result = result.filter(
        (s) =>
          s.title.toLowerCase().includes(q) ||
          s.description.toLowerCase().includes(q)
      );
    }

    // Type filter
    if (filters.type !== "all") {
      result = result.filter((s) => s.type === filters.type);
    }

    // Status filter
    if (filters.status !== "all") {
      result = result.filter((s) => s.status === filters.status);
    }

    // Sorting
    result.sort((a, b) => {
      if (sortConfig.field === "date") {
        const timeA = new Date(a.date).getTime();
        const timeB = new Date(b.date).getTime();
        return sortConfig.direction === "desc" ? timeB - timeA : timeA - timeB;
      }
      if (sortConfig.field === "present_count") {
        return sortConfig.direction === "desc"
          ? b.present_count - a.present_count
          : a.present_count - b.present_count;
      }
      if (sortConfig.field === "status") {
        return sortConfig.direction === "desc"
          ? b.status.localeCompare(a.status)
          : a.status.localeCompare(b.status);
      }
      return 0;
    });

    return result;
  }, [sessions, filters, sortConfig]);

  const totalItems = filtered.length;
  const totalPages = Math.ceil(totalItems / pageSize);
  
  const paginated = useMemo(() => {
    const startIndex = (page - 1) * pageSize;
    return filtered.slice(startIndex, startIndex + pageSize);
  }, [filtered, page, pageSize]);

  return {
    sessions: paginated,
    totalItems,
    totalPages,
    addSession,
  };
}
