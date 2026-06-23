const API_VERSION = "/api";

export const API_ENDPOINTS = {
  AUTH: {
    REGISTER: `${API_VERSION}/auth/register/`,
    LOGIN: `${API_VERSION}/auth/login/`,
    LOGOUT: `${API_VERSION}/auth/logout/`,
    PROFILE: `${API_VERSION}/auth/profile/`,
    PROFILE_UPDATE: `${API_VERSION}/auth/profile/update/`,
    REFRESH: `${API_VERSION}/auth/refresh/`,
    FORGOT_PASSWORD: `${API_VERSION}/auth/forgot-password/`,
    RESET_PASSWORD: `${API_VERSION}/auth/reset-password/`,
  },
  MEMBERS: `${API_VERSION}/members/`,
  EVENTS: `${API_VERSION}/events/`,
  SERMONS: `${API_VERSION}/sermons/`,
  PRAYERS: `${API_VERSION}/prayers/`,
  DONATIONS: `${API_VERSION}/donations/`,
  LIVESTREAMS: `${API_VERSION}/livestreams/`,
  NOTIFICATIONS: `${API_VERSION}/notifications/`,
  ANALYTICS: `${API_VERSION}/analytics/dashboard/`,
  SETTINGS: `${API_VERSION}/settings/`,
  TESTIMONIES: `${API_VERSION}/testimonies/`,
} as const;

export const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://localhost:8000";
