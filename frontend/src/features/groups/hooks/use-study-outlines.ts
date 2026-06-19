"use client";

import { useState, useEffect, useCallback } from "react";
import type { StudyOutline } from "../types/group.types";
import { GroupsRepository } from "../repositories/groups.repository";
import { useNotifications } from "@/features/notifications";

export function useStudyOutlines() {
  const { addNotification } = useNotifications();
  const [outlines, setOutlines] = useState<StudyOutline[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchOutlines = useCallback(async () => {
    try {
      setLoading(true);
      const data = await GroupsRepository.getStudyOutlines();
      setOutlines(data);
    } catch (err) {
      console.error("Failed to load study outlines:", err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchOutlines();
  }, [fetchOutlines]);

  const addOutline = useCallback(
    async (outline: Omit<StudyOutline, "id" | "published_at">) => {
      const newOutline = await GroupsRepository.addStudyOutline(outline);
      await fetchOutlines();

      // Module 14 Integration: Dispatch notifications to all Cell Leaders
      try {
        const groups = await GroupsRepository.getGroups();
        if (Array.isArray(groups)) {
          const leaderIds = Array.from(
            new Set(
              groups
                .map((g) => g.leader_id)
                .filter((id): id is string => typeof id === "string" && id !== "")
            )
          );

          leaderIds.forEach((leaderId) => {
            addNotification(
              leaderId,
              "New Study Outline Published",
              `The outline "${newOutline.title}" has been published. Click to review it for your upcoming connect group session.`,
              "High",
              "In-App",
              `/dashboard/groups/outlines`
            );
          });
        }
      } catch (err) {
        console.error("Failed to dispatch study outline notifications to group leaders:", err);
      }

      return newOutline;
    },
    [fetchOutlines, addNotification]
  );

  const deleteOutline = useCallback(
    async (id: string) => {
      await GroupsRepository.deleteStudyOutline(id);
      await fetchOutlines();
    },
    [fetchOutlines]
  );

  return {
    outlines,
    loading,
    addOutline,
    deleteOutline,
    fetchOutlines
  };
}
