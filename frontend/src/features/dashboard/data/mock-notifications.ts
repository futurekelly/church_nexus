import type { AppNotification } from "@/store/notification-store";

export const mockDashboardNotifications: AppNotification[] = [
  {
    id: 1,
    title: "New Prayer Request",
    message: "A member submitted a new prayer request for review.",
    read_status: false,
    created_at: new Date(Date.now() - 1000 * 60 * 15).toISOString(),
  },
  {
    id: 2,
    title: "Event Reminder",
    message: "Sunday Worship Service starts in 24 hours.",
    read_status: false,
    created_at: new Date(Date.now() - 1000 * 60 * 60 * 2).toISOString(),
  },
  {
    id: 3,
    title: "Sermon Published",
    message: "Walking in Faith is now available in the sermon library.",
    read_status: true,
    created_at: new Date(Date.now() - 1000 * 60 * 60 * 24).toISOString(),
  },
  {
    id: 4,
    title: "Livestream Starting",
    message: "The weekly service livestream will begin shortly.",
    read_status: true,
    created_at: new Date(Date.now() - 1000 * 60 * 60 * 48).toISOString(),
  },
];
