"use client";

import { useCallback } from "react";
import type { Announcement, AnnouncementStatus, AudienceScope } from "../types/notification.types";
import { MOCK_ANNOUNCEMENTS } from "../data/mock-notification-data";
import { useLocalStorageState } from "@/hooks/use-local-storage-state";
import { useAuth } from "@/hooks/use-auth";
import { ROLES, ROLE_LABELS } from "@/types/roles";

const STORAGE_KEY = "church-mock-announcements";

export function useAnnouncements() {
  const { user, role } = useAuth();
  const [announcements, setAnnouncements] = useLocalStorageState<Announcement[]>(
    STORAGE_KEY,
    MOCK_ANNOUNCEMENTS
  );

  const addAnnouncement = useCallback(
    (data: Omit<Announcement, "id" | "created_at">) => {
      const newAnn: Announcement = {
        ...data,
        id: `ann-${Date.now()}`,
        created_at: new Date().toISOString()
      };

      // Set published_at if status is Published immediately
      if (newAnn.status === "Published") {
        newAnn.published_at = new Date().toISOString();
      }

      setAnnouncements((prev) => [newAnn, ...prev]);
      return newAnn;
    },
    [setAnnouncements]
  );

  const updateAnnouncement = useCallback(
    (id: string, updatedFields: Partial<Omit<Announcement, "id" | "created_at">>) => {
      setAnnouncements((prev) =>
        prev.map((ann) => {
          if (ann.id === id) {
            const nextAnn = { ...ann, ...updatedFields };
            if (updatedFields.status === "Published" && !ann.published_at) {
              nextAnn.published_at = new Date().toISOString();
            }
            return nextAnn;
          }
          return ann;
        })
      );
    },
    [setAnnouncements]
  );

  const publishAnnouncement = useCallback(
    (id: string) => {
      setAnnouncements((prev) =>
        prev.map((ann) =>
          ann.id === id
            ? { ...ann, status: "Published" as const, published_at: new Date().toISOString() }
            : ann
        )
      );
    },
    [setAnnouncements]
  );

  const archiveAnnouncement = useCallback(
    (id: string) => {
      setAnnouncements((prev) =>
        prev.map((ann) =>
          ann.id === id ? { ...ann, status: "Archived" as const } : ann
        )
      );
    },
    [setAnnouncements]
  );

  // Filter announcements visible to members and guests
  const getVisibleAnnouncements = useCallback(
    (userBranchId: string | null) => {
      return announcements.filter((ann) => {
        // Must be published to be visible on public feed
        if (ann.status !== "Published") return false;

        // Global is visible to everyone
        if (ann.audience_scope === "Global") return true;

        // Branch matches scope
        if (ann.audience_scope === "Branch" && ann.branch_id === userBranchId) return true;

        // Role-based target filters
        if (
          ann.audience_scope === "Leaders" &&
          (role === ROLES.SUPER_ADMIN || role === ROLES.CHURCH_ADMIN || role === ROLES.PASTOR)
        ) {
          return true;
        }

        if (ann.audience_scope === "Members" && role === ROLES.MEMBER) return true;
        if (ann.audience_scope === "Visitors" && role === ROLES.VISITOR) return true;

        // Custom scope target roles array match
        if (ann.audience_scope === "Custom" && ann.target_roles && role) {
          const roleLabel = ROLE_LABELS[role];
          return ann.target_roles.includes(role) || ann.target_roles.includes(roleLabel);
        }

        return false;
      });
    },
    [announcements, role]
  );

  return {
    announcements,
    addAnnouncement,
    updateAnnouncement,
    publishAnnouncement,
    archiveAnnouncement,
    getVisibleAnnouncements,
  };
}
