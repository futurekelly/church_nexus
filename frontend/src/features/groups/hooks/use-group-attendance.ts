"use client";

import { useState, useEffect, useCallback } from "react";
import type { GroupAttendance } from "../types/group.types";
import { GroupsRepository } from "../repositories/groups.repository";

export function useGroupAttendance(groupId?: string) {
  const [attendanceLogs, setAttendanceLogs] = useState<GroupAttendance[]>([]);
  const [allAttendanceRaw, setAllAttendanceRaw] = useState<GroupAttendance[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchAttendance = useCallback(async () => {
    try {
      setLoading(true);
      if (groupId) {
        const activeGroupAttendance = await GroupsRepository.getGroupAttendance(groupId);
        setAttendanceLogs(activeGroupAttendance);
      } else {
        const logs = await GroupsRepository.getGroupAttendance();
        setAttendanceLogs(logs);
      }
      const rawLogs = await GroupsRepository.getGroupAttendance();
      setAllAttendanceRaw(rawLogs);
    } catch (err) {
      console.error("Failed to load attendance logs:", err);
    } finally {
      setLoading(false);
    }
  }, [groupId]);

  useEffect(() => {
    fetchAttendance();
  }, [fetchAttendance]);

  const submitAttendance = useCallback(
    async (data: Omit<GroupAttendance, "id" | "submitted_at">) => {
      const created = await GroupsRepository.submitAttendance(data);
      await fetchAttendance();
      return created;
    },
    [fetchAttendance]
  );

  const deleteAttendance = useCallback(
    async (id: string) => {
      await GroupsRepository.deleteAttendance(id);
      await fetchAttendance();
    },
    [fetchAttendance]
  );

  return {
    attendanceLogs,
    allAttendanceRaw,
    loading,
    submitAttendance,
    deleteAttendance,
    fetchAttendance
  };
}
