"use client";

import { useMemo, useCallback } from "react";
import { MOCK_SESSIONS, MOCK_RECORDS } from "../data/mock-attendance";
import type {
  AttendanceSession,
  AttendanceRecord,
  FollowUpTicket,
  AttendanceFilters,
  AttendanceSortConfig,
} from "../types/attendance.types";
import { MOCK_MEMBERS } from "@/features/members/data/mock-members";
import { useLocalStorageState } from "@/hooks/use-local-storage-state";

const SESSIONS_KEY = "church-mock-attendance-sessions";
const RECORDS_KEY = "church-mock-attendance-records";
const TICKETS_KEY = "church-attendance-follow-up-tickets";

/**
 * Singleton state hook for Attendance sessions and check-in records.
 */
export function useAttendance() {
  const [sessions, setSessions] = useLocalStorageState<AttendanceSession[]>(
    SESSIONS_KEY,
    MOCK_SESSIONS
  );
  const [records, setRecords] = useLocalStorageState<AttendanceRecord[]>(
    RECORDS_KEY,
    MOCK_RECORDS
  );
  const [tickets, setTickets] = useLocalStorageState<FollowUpTicket[]>(
    TICKETS_KEY,
    []
  );

  const addSession = useCallback(
    (newSession: Omit<AttendanceSession, "id" | "status" | "present_count" | "absent_count" | "excused_count" | "created_at" | "updated_at">) => {
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

      setSessions((prev) => [session, ...prev]);
      setRecords((prev) => [...newRecords, ...prev]);
      return session;
    },
    [setSessions, setRecords]
  );

  const updateSessionCounts = useCallback((sessionId: string, currentRecords: AttendanceRecord[]) => {
    const sessionRecords = currentRecords.filter((r) => r.session_id === sessionId);

    const present = sessionRecords.filter((r) => r.status === "Present").length;
    const absent = sessionRecords.filter((r) => r.status === "Absent").length;
    const excused = sessionRecords.filter((r) => r.status === "Excused").length;

    setSessions((prev) =>
      prev.map((s) =>
        s.id === sessionId
          ? {
              ...s,
              present_count: present,
              absent_count: absent,
              excused_count: excused,
              updated_at: new Date().toISOString(),
            }
          : s
      )
    );
  }, [setSessions]);

  const checkInMember = useCallback(
    (sessionId: string, memberId: string, status: "Present" | "Absent", method: "QR" | "Barcode" | "Manual" | null) => {
      setRecords((prev) => {
        const updatedRecords = prev.map((r) => {
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
        updateSessionCounts(sessionId, updatedRecords);
        return updatedRecords;
      });
    },
    [setRecords, updateSessionCounts]
  );

  const excuseMember = useCallback(
    (sessionId: string, memberId: string, notes: string) => {
      setRecords((prev) => {
        const updatedRecords = prev.map((r) => {
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
        updateSessionCounts(sessionId, updatedRecords);
        return updatedRecords;
      });
    },
    [setRecords, updateSessionCounts]
  );

  const closeSession = useCallback(
    (sessionId: string) => {
      setSessions((prev) =>
        prev.map((s) =>
          s.id === sessionId
            ? {
                ...s,
                status: "Completed" as const,
                updated_at: new Date().toISOString(),
              }
            : s
        )
      );
    },
    [setSessions]
  );

  const createFollowUpTicket = useCallback(
    (sessionId: string, memberId: string, reason: string) => {
      const session = sessions.find((s) => s.id === sessionId);

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

      setTickets((prev) => [ticket, ...prev]);
      return ticket;
    },
    [sessions, setTickets]
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
