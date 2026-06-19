"use client";

import { useState, useEffect, useCallback, useMemo } from "react";
import type { 
  Member, MemberFilters, MemberSortConfig, 
  PaginatedResponse, Family, FamilyRelationship, VolunteerAssignment 
} from "../types/member.types";
import { MembersRepository } from "../repositories/members.repository";
import { useAuth } from "@/hooks/use-auth";
import { DEFAULT_FILTERS, MEMBERS_PER_PAGE } from "../types/member.types";

/**
 * Unified, backward-compatible hook managing Members state, mutations,
 * search sorting, and client-side pagination.
 */
export function useMembers() {
  const { user, role } = useAuth();
  const branchId = (user as any)?.branch_id || "branch-001";
  const userRole = role || "Member";
  const changedBy = user?.id ? String(user.id) : "d3b07384-d113-4ec2-a5d8-c83d6850c2f3";

  // Data states
  const [membersList, setMembersList] = useState<Member[]>([]);
  const [loading, setLoading] = useState(true);

  // Filter & Sort & Pagination states
  const [filters, setFilters] = useState<MemberFilters>(DEFAULT_FILTERS);
  const [sort, setSort] = useState<MemberSortConfig>({
    field: "date_joined",
    direction: "desc"
  });
  const [page, setPage] = useState(1);

  const fetchState = useCallback(async () => {
    try {
      setLoading(true);
      // Repository fetches branch-scoped data
      const response = await MembersRepository.getMembers(
        { search: "", status: "all", ministry: "all", gender: "all", role: "all" },
        { branchId, role: userRole }
      );
      setMembersList(response.results);
    } catch (err) {
      console.error("Failed to load members state:", err);
    } finally {
      setLoading(false);
    }
  }, [branchId, userRole]);

  useEffect(() => {
    fetchState();
  }, [fetchState]);

  // Tab synchronization
  useEffect(() => {
    if (typeof window === "undefined") return;
    const handleSync = (e: any) => {
      if (
        e.detail &&
        (e.detail.key === "church-mock-members" ||
          e.detail.key === "church-mock-event-registrations")
      ) {
        fetchState();
      }
    };
    window.addEventListener("local-storage-update" as any, handleSync);
    return () => {
      window.removeEventListener("local-storage-update" as any, handleSync);
    };
  }, [fetchState]);

  // Mutations
  const addMember = useCallback(
    async (data: Omit<Member, "id" | "membership_number" | "created_at" | "updated_at" | "total_giving" | "last_giving_date" | "active_pledges" | "age_group" | "membership_duration" | "attendance_score" | "is_archived" | "archived_at">) => {
      const created = await MembersRepository.createMember(data, changedBy);
      await fetchState();
      return created;
    },
    [changedBy, fetchState]
  );

  const updateMember = useCallback(
    async (id: string, updates: Partial<Member>) => {
      const updated = await MembersRepository.updateMember(id, updates, changedBy);
      await fetchState();
      return updated;
    },
    [changedBy, fetchState]
  );

  const archiveMember = useCallback(
    async (id: string) => {
      await MembersRepository.archiveMember(id);
      await fetchState();
    },
    [fetchState]
  );

  const restoreMember = useCallback(
    async (id: string) => {
      await MembersRepository.restoreMember(id);
      await fetchState();
    },
    [fetchState]
  );

  const convertVisitor = useCallback(
    async (email: string, phone: string, memberId: string) => {
      await MembersRepository.convertVisitorToMember(email, phone, memberId);
      await fetchState();
    },
    [fetchState]
  );

  const getMemberById = useCallback(
    (id: string): Member | null => {
      // Synchronous lookup on already fetched state
      const match = membersList.find((m) => m.id === id);
      if (!match) return null;

      // Pastoral notes RBAC gating (hide from volunteers/members)
      const canViewNotes = ["Super Admin", "Church Admin", "Pastor"].includes(userRole);
      if (!canViewNotes) {
        return {
          ...match,
          pastoral_notes: null
        };
      }
      return match;
    },
    [membersList, userRole]
  );

  // Client-side search, filtering and sorting
  const filtered = useMemo(() => {
    return membersList.filter((m) => {
      const q = filters.search.toLowerCase();
      const matchesSearch =
        !q ||
        m.first_name.toLowerCase().includes(q) ||
        m.last_name.toLowerCase().includes(q) ||
        m.email.toLowerCase().includes(q) ||
        m.phone_number.toLowerCase().includes(q) ||
        m.membership_number.toLowerCase().includes(q);

      const matchesStatus =
        filters.status === "all" || m.status === filters.status;

      // Ministries filter checking assignments or property
      const matchesMinistry =
        filters.ministry === "all" ||
        (m.ministries && m.ministries.includes(filters.ministry as any));

      const matchesGender =
        filters.gender === "all" || m.gender === filters.gender;

      const matchesRole =
        filters.role === "all" || m.member_type === filters.role;

      return (
        matchesSearch &&
        matchesStatus &&
        matchesMinistry &&
        matchesGender &&
        matchesRole
      );
    });
  }, [membersList, filters]);

  const sorted = useMemo(() => {
    return [...filtered].sort((a, b) => {
      const aVal = (a as any)[sort.field] || "";
      const bVal = (b as any)[sort.field] || "";
      const cmp = String(aVal).localeCompare(String(bVal));
      return sort.direction === "asc" ? cmp : -cmp;
    });
  }, [filtered, sort]);

  // Pagination bounds
  const totalPages = Math.max(1, Math.ceil(sorted.length / MEMBERS_PER_PAGE));
  const safePage = Math.min(page, totalPages);

  const paginatedResults = useMemo(() => {
    const start = (safePage - 1) * MEMBERS_PER_PAGE;
    return sorted.slice(start, start + MEMBERS_PER_PAGE);
  }, [sorted, safePage]);

  const updateFilter = useCallback(
    <K extends keyof MemberFilters>(key: K, value: MemberFilters[K]) => {
      setFilters((prev) => ({ ...prev, [key]: value }));
      setPage(1);
    },
    []
  );

  const resetFilters = useCallback(() => {
    setFilters(DEFAULT_FILTERS);
    setPage(1);
  }, []);

  const toggleSort = useCallback((field: MemberSortConfig["field"]) => {
    setSort((prev) =>
      prev.field === field
        ? { field, direction: prev.direction === "asc" ? "desc" : "asc" }
        : { field, direction: "asc" }
    );
  }, []);

  const hasActiveFilters = useMemo(() => {
    return (
      filters.search !== "" ||
      filters.status !== "all" ||
      filters.ministry !== "all" ||
      filters.gender !== "all" ||
      filters.role !== "all"
    );
  }, [filters]);

  return {
    // Data structures
    members: paginatedResults,
    allMembers: membersList,
    totalMembers: sorted.length,
    loading,

    // Actions
    fetchState,
    addMember,
    updateMember,
    archiveMember,
    restoreMember,
    convertVisitor,
    getMemberById,

    // Filtering, sorting and paging states
    page: safePage,
    totalPages,
    setPage,
    filters,
    updateFilter,
    resetFilters,
    hasActiveFilters,
    sort,
    toggleSort
  };
}
