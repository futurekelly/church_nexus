"use client";

import { useCallback } from "react";
import type { NotificationPreference } from "../types/notification.types";
import { MOCK_NOTIF_PREFERENCES } from "../data/mock-notification-data";
import { useLocalStorageState } from "@/hooks/use-local-storage-state";
import { useAuth } from "@/hooks/use-auth";

const STORAGE_KEY = "church-preferences-notifications";

export function useNotificationPreferences() {
  const { user } = useAuth();
  const [preferences, setPreferences] = useLocalStorageState<NotificationPreference[]>(
    STORAGE_KEY,
    MOCK_NOTIF_PREFERENCES
  );

  const activeUserPreferences = preferences.find((p) => p.user_id === String(user?.id)) || {
    user_id: user ? String(user.id) : "",
    email_enabled: true,
    sms_enabled: true,
    in_app_enabled: true,
    push_enabled: true,
    prayer_updates: true,
    giving_receipts: true,
    event_reminders: true
  };

  const updatePreferences = useCallback(
    (updatedFields: Partial<Omit<NotificationPreference, "user_id">>) => {
      if (!user) return;
      setPreferences((prev) => {
        const index = prev.findIndex((p) => p.user_id === String(user.id));
        if (index > -1) {
          return prev.map((p) =>
            p.user_id === String(user.id) ? { ...p, ...updatedFields } : p
          );
        } else {
          const newPref: NotificationPreference = {
            user_id: String(user.id),
            email_enabled: true,
            sms_enabled: true,
            in_app_enabled: true,
            push_enabled: true,
            prayer_updates: true,
            giving_receipts: true,
            event_reminders: true,
            ...updatedFields
          };
          return [...prev, newPref];
        }
      });
    },
    [user, setPreferences]
  );

  return {
    preferences: activeUserPreferences,
    updatePreferences
  };
}
