"use client";

import { useCallback } from "react";
import type { Notification, NotificationPriority, DeliveryChannelType } from "../types/notification.types";
import { MOCK_NOTIFICATIONS } from "../data/mock-notification-data";
import { useLocalStorageState } from "@/hooks/use-local-storage-state";
import { useAuth } from "@/hooks/use-auth";

const STORAGE_KEY = "church-mock-notifications";

export function useNotifications() {
  const { user } = useAuth();
  const [notifications, setNotifications] = useLocalStorageState<Notification[]>(
    STORAGE_KEY,
    MOCK_NOTIFICATIONS
  );

  // Filter personal notifications for active authenticated user
  const activeUserNotifications = notifications.filter(
    (n) => n.user_id === String(user?.id) && !n.is_archived
  );

  const addNotification = useCallback(
    (
      userId: string,
      title: string,
      message: string,
      priority: NotificationPriority = "Medium",
      channel: DeliveryChannelType = "In-App",
      actionUrl?: string,
      branchId?: string
    ) => {
      const newNotif: Notification = {
        id: `notif-${Date.now()}`,
        user_id: userId,
        title,
        message,
        priority,
        status: "Sent", // Auto-deliver in mock
        read: false,
        delivered_at: new Date().toISOString(), // Mock delivered timestamp
        read_at: null,
        action_url: actionUrl,
        delivery_channel: channel,
        branch_id: branchId,
        created_at: new Date().toISOString(),
        is_archived: false,
        deleted_at: null
      };

      setNotifications((prev) => [newNotif, ...prev]);
      return newNotif;
    },
    [setNotifications]
  );

  const markAsRead = useCallback(
    (id: string) => {
      setNotifications((prev) =>
        prev.map((n) =>
          n.id === id ? { ...n, read: true, read_at: new Date().toISOString() } : n
        )
      );
    },
    [setNotifications]
  );

  const archiveNotification = useCallback(
    (id: string) => {
      setNotifications((prev) =>
        prev.map((n) =>
          n.id === id ? { ...n, is_archived: true, deleted_at: new Date().toISOString() } : n
        )
      );
    },
    [setNotifications]
  );

  const markAllAsRead = useCallback(() => {
    if (!user) return;
    setNotifications((prev) =>
      prev.map((n) =>
        n.user_id === String(user.id) && !n.read
          ? { ...n, read: true, read_at: new Date().toISOString() }
          : n
      )
    );
  }, [user, setNotifications]);

  const clearAllNotifications = useCallback(() => {
    if (!user) return;
    setNotifications((prev) =>
      prev.map((n) =>
        n.user_id === String(user.id) && !n.is_archived
          ? { ...n, is_archived: true, deleted_at: new Date().toISOString() }
          : n
      )
    );
  }, [user, setNotifications]);

  return {
    notifications: activeUserNotifications,
    allNotificationsRaw: notifications, // for admin dashboard views or counts
    addNotification,
    markAsRead,
    archiveNotification,
    markAllAsRead,
    clearAllNotifications,
  };
}
