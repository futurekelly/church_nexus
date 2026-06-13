"use client";

import { useMemo, useState, useCallback, useEffect } from "react";
import { MOCK_MEMBERS } from "@/features/members/data/mock-members";
import type {
  Member,
  MemberFilters,
  MemberSortConfig,
} from "@/features/members/types/member.types";
import { DEFAULT_FILTERS, MEMBERS_PER_PAGE } from "@/features/members/types/member.types";

function applyFilters(members: Member[], filters: MemberFilters): Member[] {
  return members.filter((m) => {
    const q = filters.search.toLowerCase();
    const matchesSearch =
      !q ||
      m.first_name.toLowerCase().includes(q) ||
      m.last_name.toLowerCase().includes(q) ||
      m.email.toLowerCase().includes(q) ||
      m.membership_number.toLowerCase().includes(q) ||
      m.phone_number.includes(q);

    const matchesStatus =
      filters.status === "all" || m.status === filters.status;

    const matchesMinistry =
      filters.ministry === "all" ||
      m.ministries.includes(filters.ministry as never);

    const matchesGender =
      filters.gender === "all" || m.gender === filters.gender;

    const matchesRole =
      filters.role === "all" || m.role === filters.role;

    return (
      matchesSearch &&
      matchesStatus &&
      matchesMinistry &&
      matchesGender &&
      matchesRole
    );
  });
}

function applySort(members: Member[], sort: MemberSortConfig): Member[] {
  return [...members].sort((a, b) => {
    const aVal = a[sort.field];
    const bVal = b[sort.field];
    const cmp = String(aVal).localeCompare(String(bVal));
    return sort.direction === "asc" ? cmp : -cmp;
  });
}

export function useMembers() {
  const [membersList, setMembersList] = useState<Member[]>([]);
  const [filters, setFilters] = useState<MemberFilters>(DEFAULT_FILTERS);
  const [sort, setSort] = useState<MemberSortConfig>({
    field: "date_joined",
    direction: "desc",
  });
  const [page, setPage] = useState(1);

  const reloadMembers = useCallback(() => {
    if (typeof window === "undefined") {
      setMembersList(MOCK_MEMBERS);
      return;
    }
    const stored = localStorage.getItem("church-mock-members");
    if (stored) {
      try {
        setMembersList(JSON.parse(stored));
      } catch {
        setMembersList(MOCK_MEMBERS);
      }
    } else {
      localStorage.setItem("church-mock-members", JSON.stringify(MOCK_MEMBERS));
      setMembersList(MOCK_MEMBERS);
    }
  }, []);

  useEffect(() => {
    reloadMembers();
    if (typeof window !== "undefined") {
      window.addEventListener("church-members-update", reloadMembers);
      return () => {
        window.removeEventListener("church-members-update", reloadMembers);
      };
    }
  }, [reloadMembers]);

  const filtered = useMemo(
    () => applyFilters(membersList, filters),
    [membersList, filters],
  );

  const sorted = useMemo(() => applySort(filtered, sort), [filtered, sort]);

  const totalPages = Math.max(1, Math.ceil(sorted.length / MEMBERS_PER_PAGE));
  const safePage = Math.min(page, totalPages);

  const paginated = useMemo(
    () =>
      sorted.slice(
        (safePage - 1) * MEMBERS_PER_PAGE,
        safePage * MEMBERS_PER_PAGE,
      ),
    [sorted, safePage],
  );

  const updateFilter = useCallback(
    <K extends keyof MemberFilters>(key: K, value: MemberFilters[K]) => {
      setFilters((prev) => ({ ...prev, [key]: value }));
      setPage(1);
    },
    [],
  );

  const resetFilters = useCallback(() => {
    setFilters(DEFAULT_FILTERS);
    setPage(1);
  }, []);

  const toggleSort = useCallback((field: MemberSortConfig["field"]) => {
    setSort((prev) =>
      prev.field === field
        ? { field, direction: prev.direction === "asc" ? "desc" : "asc" }
        : { field, direction: "asc" },
    );
  }, []);

  const getMemberById = useCallback(
    (id: string) => membersList.find((m) => m.id === id) ?? null,
    [membersList],
  );

  return {
    // data
    members: paginated,
    totalMembers: sorted.length,
    allMembers: membersList,
    // pagination
    page: safePage,
    totalPages,
    setPage,
    // filters
    filters,
    updateFilter,
    resetFilters,
    hasActiveFilters:
      filters.search !== "" ||
      filters.status !== "all" ||
      filters.ministry !== "all" ||
      filters.gender !== "all" ||
      filters.role !== "all",
    // sort
    sort,
    toggleSort,
    // lookup
    getMemberById,
  };
}
