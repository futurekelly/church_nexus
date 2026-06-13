export const PUBLIC_ROUTES = {
  HOME: "/",
  SERMONS: "/sermons",
  EVENTS: "/events",
  LIVESTREAM: "/livestream",
  ABOUT: "/about",
  CONTACT: "/contact",
  MINISTRIES: "/ministries",
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
  ANALYTICS: "/dashboard/analytics",
  SETTINGS: "/dashboard/settings",
  USERS: "/dashboard/users",
} as const;

export const AUTH_ONLY_PATHS = Object.values(AUTH_ROUTES);

export const PUBLIC_PATHS = [
  ...Object.values(PUBLIC_ROUTES),
  ...Object.values(AUTH_ROUTES),
];

export const DASHBOARD_PREFIX = "/dashboard";
