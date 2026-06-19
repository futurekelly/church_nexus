"use client";

import { useCallback } from "react";
import type { NotificationChannel } from "../types/notification.types";
import { MOCK_CHANNELS } from "../data/mock-notification-data";
import { useLocalStorageState } from "@/hooks/use-local-storage-state";

const STORAGE_KEY = "church-notification-channels";

export function useNotificationChannels() {
  const [channels, setChannels] = useLocalStorageState<NotificationChannel[]>(
    STORAGE_KEY,
    MOCK_CHANNELS
  );

  const toggleChannelStatus = useCallback(
    (id: string) => {
      setChannels((prev) =>
        prev.map((c) =>
          c.id === id ? { ...c, status: c.status === "Active" ? "Inactive" as const : "Active" as const } : c
        )
      );
    },
    [setChannels]
  );

  const updateChannel = useCallback(
    (id: string, updatedFields: Partial<Omit<NotificationChannel, "id">>) => {
      setChannels((prev) =>
        prev.map((c) => (c.id === id ? { ...c, ...updatedFields } : c))
      );
    },
    [setChannels]
  );

  return {
    channels,
    toggleChannelStatus,
    updateChannel
  };
}
