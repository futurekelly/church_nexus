"use client";

import { useState, useEffect, useCallback } from "react";
import type { ConnectGroup } from "../types/group.types";
import { GroupsRepository } from "../repositories/groups.repository";
import { useAuth } from "@/hooks/use-auth";

export function useConnectGroups() {
  const { user, role } = useAuth();
  const branchId = (user as any)?.branch_id || "branch-001";
  const userRole = role || "Member";

  const [groups, setGroups] = useState<ConnectGroup[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchGroups = useCallback(async () => {
    try {
      setLoading(true);
      const data = await GroupsRepository.getGroups({ branchId, role: userRole });
      setGroups(data);
    } catch (err) {
      console.error("Failed to load connect groups:", err);
    } finally {
      setLoading(false);
    }
  }, [branchId, userRole]);

  useEffect(() => {
    fetchGroups();
  }, [fetchGroups]);

  const addGroup = useCallback(
    async (data: Omit<ConnectGroup, "id" | "created_at">) => {
      const newGroup = await GroupsRepository.createGroup(data);
      await fetchGroups();
      return newGroup;
    },
    [fetchGroups]
  );

  const updateGroup = useCallback(
    async (id: string, updatedFields: Partial<Omit<ConnectGroup, "id" | "created_at">>) => {
      await GroupsRepository.updateGroup(id, updatedFields);
      await fetchGroups();
    },
    [fetchGroups]
  );

  const toggleGroupStatus = useCallback(
    async (id: string) => {
      const target = groups.find((g) => g.id === id);
      if (target) {
        await GroupsRepository.toggleGroupStatus(id, target.status);
        await fetchGroups();
      }
    },
    [groups, fetchGroups]
  );

  return {
    groups,
    loading,
    addGroup,
    updateGroup,
    toggleGroupStatus,
    fetchGroups
  };
}
