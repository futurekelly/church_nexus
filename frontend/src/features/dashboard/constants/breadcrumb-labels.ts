export const BREADCRUMB_LABELS: Record<string, string> = {
  dashboard: "Dashboard",
  members: "Members",
  visitors: "Visitors",
  "follow-up": "Follow-Up",
  sermons: "Sermons",
  events: "Events",
  livestream: "Livestream",
  prayer: "Prayer",
  donations: "Donations",
  testimonies: "Testimonies",
  media: "Media",
  scripture: "Scripture",
  celebrations: "Celebrations",
  notifications: "Notifications",
  analytics: "Analytics",
  settings: "Settings",
  users: "Users",
  create: "Create",
  edit: "Edit",
  calendar: "Calendar",
  reports: "Reports",
  history: "History",
  upload: "Upload",
  archive: "Archive",
  roles: "Roles",
  moderate: "Moderate",
  register: "Register",
};

export function getBreadcrumbLabel(segment: string): string {
  return (
    BREADCRUMB_LABELS[segment] ??
    segment
      .split("-")
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
      .join(" ")
  );
}
