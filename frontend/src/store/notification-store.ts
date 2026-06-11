import { create } from "zustand";

export interface AppNotification {
  id: number;
  title: string;
  message: string;
  read_status: boolean;
  created_at: string;
}

interface NotificationState {
  notifications: AppNotification[];
  unreadCount: number;
  setNotifications: (notifications: AppNotification[]) => void;
  markAsRead: (id: number) => void;
  clearNotifications: () => void;
}

export const useNotificationStore = create<NotificationState>((set) => ({
  notifications: [],
  unreadCount: 0,
  setNotifications: (notifications) =>
    set({
      notifications,
      unreadCount: notifications.filter((n) => !n.read_status).length,
    }),
  markAsRead: (id) =>
    set((state) => {
      const notifications = state.notifications.map((notification) =>
        notification.id === id
          ? { ...notification, read_status: true }
          : notification,
      );
      return {
        notifications,
        unreadCount: notifications.filter((n) => !n.read_status).length,
      };
    }),
  clearNotifications: () => set({ notifications: [], unreadCount: 0 }),
}));
