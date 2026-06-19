"use client";

import { useState, useEffect, useCallback } from "react";
import type { GroupPrayerRequest } from "../types/group.types";
import { GroupsRepository } from "../repositories/groups.repository";
import { useNotifications } from "@/features/notifications";

export function useGroupPrayerRequests(groupId?: string) {
  const { addNotification } = useNotifications();
  const [prayers, setPrayers] = useState<GroupPrayerRequest[]>([]);
  const [allPrayersRaw, setAllPrayersRaw] = useState<GroupPrayerRequest[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchPrayers = useCallback(async () => {
    try {
      setLoading(true);
      if (groupId) {
        const activeGroupPrayers = await GroupsRepository.getPrayerRequests(groupId);
        setPrayers(activeGroupPrayers);
      } else {
        const list = await GroupsRepository.getPrayerRequests();
        setPrayers(list);
      }
      const rawList = await GroupsRepository.getPrayerRequests();
      setAllPrayersRaw(rawList);
    } catch (err) {
      console.error("Failed to load prayer requests:", err);
    } finally {
      setLoading(false);
    }
  }, [groupId]);

  useEffect(() => {
    fetchPrayers();
  }, [fetchPrayers]);

  const addPrayerRequest = useCallback(
    async (data: Omit<GroupPrayerRequest, "id" | "created_at">) => {
      const created = await GroupsRepository.addPrayerRequest(data);
      await fetchPrayers();

      if (created.shared_with_branch) {
        try {
          addNotification(
            "m001", // Admin recipient
            "New Shared Cell Prayer Request",
            `A prayer request from ${created.submitted_by_name} has been shared with the branch: "${created.request_text.slice(0, 60)}..."`,
            "Medium",
            "In-App",
            `/dashboard/prayer`
          );
        } catch (err) {
          console.error("Failed to trigger Module 14 notification for group prayer:", err);
        }
      }

      return created;
    },
    [fetchPrayers, addNotification]
  );

  const updatePrayerStatus = useCallback(
    async (id: string, status: GroupPrayerRequest["status"]) => {
      await GroupsRepository.updatePrayerStatus(id, status);
      await fetchPrayers();
    },
    [fetchPrayers]
  );

  const deletePrayerRequest = useCallback(
    async (id: string) => {
      await GroupsRepository.deletePrayerRequest(id);
      await fetchPrayers();
    },
    [fetchPrayers]
  );

  return {
    prayers,
    allPrayersRaw,
    loading,
    addPrayerRequest,
    updatePrayerStatus,
    deletePrayerRequest,
    fetchPrayers
  };
}
