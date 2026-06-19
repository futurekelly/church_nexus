"use client";

import { useState, useEffect, useCallback } from "react";
import type { GroupMember, GroupRole } from "../types/group.types";
import { GroupsRepository } from "../repositories/groups.repository";

export function useGroupMembers(groupId?: string) {
  const [members, setMembers] = useState<GroupMember[]>([]);
  const [allMembersRaw, setAllMembersRaw] = useState<GroupMember[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchMembers = useCallback(async () => {
    try {
      setLoading(true);
      if (groupId) {
        const activeGroupMembers = await GroupsRepository.getGroupMembers(groupId);
        setMembers(activeGroupMembers);
      } else {
        const rawList = await GroupsRepository.getGroupMembers();
        setMembers(rawList);
      }
      const rawListAll = await GroupsRepository.getGroupMembers();
      setAllMembersRaw(rawListAll);
    } catch (err) {
      console.error("Failed to load group members:", err);
    } finally {
      setLoading(false);
    }
  }, [groupId]);

  useEffect(() => {
    fetchMembers();
  }, [fetchMembers]);

  const addGroupMember = useCallback(
    async (member: Omit<GroupMember, "id" | "joined_at">) => {
      const created = await GroupsRepository.addGroupMember(member);
      await fetchMembers();
      return created;
    },
    [fetchMembers]
  );

  const removeGroupMember = useCallback(
    async (id: string) => {
      await GroupsRepository.removeGroupMember(id);
      await fetchMembers();
    },
    [fetchMembers]
  );

  const updateMemberRole = useCallback(
    async (id: string, role: GroupRole) => {
      const updated = await GroupsRepository.updateMemberRole(id, role);
      await fetchMembers();
      return updated;
    },
    [fetchMembers]
  );

  const toggleMemberStatus = useCallback(
    async (id: string) => {
      const target = allMembersRaw.find((m) => m.id === id);
      if (target) {
        const updated = await GroupsRepository.toggleMemberStatus(id, target.status);
        await fetchMembers();
        return updated;
      }
    },
    [allMembersRaw, fetchMembers]
  );

  const transferMember = useCallback(
    async (id: string, targetGroupId: string) => {
      const updated = await GroupsRepository.transferMember(id, targetGroupId);
      await fetchMembers();
      return updated;
    },
    [fetchMembers]
  );

  return {
    members,
    allMembersRaw,
    loading,
    addGroupMember,
    removeGroupMember,
    updateMemberRole,
    toggleMemberStatus,
    transferMember,
    fetchMembers
  };
}
