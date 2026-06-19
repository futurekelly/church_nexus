export const PUBLIC_ROUTES = {
  HOME: "/",
  SERMONS: "/sermons",
  EVENTS: "/events",
  LIVESTREAM: "/livestream",
  ABOUT: "/about",
  CONTACT: "/contact",
  MINISTRIES: "/ministries",
  GIVE: "/give",
  TESTIMONIES: "/testimonies",
  SUBMIT_TESTIMONY: "/submit-testimony",
} as const;

export const AUTH_ROUTES = {
  LOGIN: "/login",
  REGISTER: "/register",
  FORGOT_PASSWORD: "/forgot-password",
  RESET_PASSWORD: "/reset-password",
} as const;

export const DASHBOARD_ROUTES = {
  ROOT: "/dashboard",
  MEMBERS: "/dashboard/members",
  VISITORS: "/dashboard/visitors",
  FOLLOW_UP: "/dashboard/follow-up",
  SERMONS: "/dashboard/sermons",
  EVENTS: "/dashboard/events",
  LIVESTREAM: "/dashboard/livestream",
  PRAYER: "/dashboard/prayer",
  ATTENDANCE: "/dashboard/attendance",
  DONATIONS: "/dashboard/donations",
  TESTIMONIES: "/dashboard/testimonies",
  MEDIA: "/dashboard/media",
  SCRIPTURE: "/dashboard/scripture",
  CELEBRATIONS: "/dashboard/celebrations",
  NOTIFICATIONS: "/dashboard/notifications",
  NOTIFICATIONS_TEMPLATES: "/dashboard/notifications/templates",
  NOTIFICATIONS_CHANNELS: "/dashboard/notifications/channels",
  NOTIFICATIONS_CREATE: "/dashboard/notifications/create",
  ANNOUNCEMENTS: "/dashboard/announcements",
  ANNOUNCEMENTS_CREATE: "/dashboard/announcements/create",
  ANNOUNCEMENTS_HISTORY: "/dashboard/announcements/history",
  GROUPS: "/dashboard/groups",
  GROUPS_CREATE: "/dashboard/groups/create",
  GROUPS_OUTLINES: "/dashboard/groups/outlines",
  GROUPS_PRAYER: "/dashboard/groups/prayer-requests",
  GROUPS_DETAIL: "/dashboard/groups/[id]",
  GROUPS_ATTENDANCE: "/dashboard/groups/[id]/attendance",
  GROUPS_MEMBERS: "/dashboard/groups/[id]/members",
  GROUPS_REPORTS: "/dashboard/groups/reports",
  ANALYTICS: "/dashboard/analytics",
  DOCUMENTS: "/dashboard/documents",
  SETTINGS: "/dashboard/settings",
  SETTINGS_BRANCHES: "/dashboard/settings/branches",
  SETTINGS_LOCALIZATION: "/dashboard/settings/localization",
  SETTINGS_PAYMENTS: "/dashboard/settings/payments",
  SETTINGS_CHURCH_PROFILE: "/dashboard/settings/church-profile",
  USERS: "/dashboard/users",
} as const;

export const AUTH_ONLY_PATHS = Object.values(AUTH_ROUTES);

export const PUBLIC_PATHS = [
  ...Object.values(PUBLIC_ROUTES),
  ...Object.values(AUTH_ROUTES),
];

export const DASHBOARD_PREFIX = "/dashboard";
