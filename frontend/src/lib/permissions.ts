import { DASHBOARD_ROUTES } from "@/constants/routes";
import { ROLES, type Role } from "@/types/roles";

export const PERMISSIONS = {
  DASHBOARD_VIEW: "dashboard:view",
  MEMBERS_VIEW: "members:view",
  MEMBERS_MANAGE: "members:manage",
  VISITORS_VIEW: "visitors:view",
  FOLLOW_UP_MANAGE: "follow_up:manage",
  SERMONS_VIEW: "sermons:view",
  SERMONS_MANAGE: "sermons:manage",
  EVENTS_VIEW: "events:view",
  EVENTS_MANAGE: "events:manage",
  LIVESTREAM_VIEW: "livestream:view",
  LIVESTREAM_MANAGE: "livestream:manage",
  PRAYER_VIEW: "prayer:view",
  PRAYER_MANAGE: "prayer:manage",
  ATTENDANCE_VIEW: "attendance:view",
  ATTENDANCE_MANAGE: "attendance:manage",
  DONATIONS_VIEW: "donations:view",
  DONATIONS_MANAGE: "donations:manage",
  DONATIONS_REPORT: "donations:report",
  TESTIMONIES_VIEW: "testimonies:view",
  TESTIMONIES_MANAGE: "testimonies:manage",
  MEDIA_VIEW: "media:view",
  MEDIA_MANAGE: "media:manage",
  SCRIPTURE_VIEW: "scripture:view",
  SCRIPTURE_MANAGE: "scripture:manage",
  CELEBRATIONS_VIEW: "celebrations:view",
  NOTIFICATIONS_VIEW: "notifications:view",
  NOTIFICATIONS_CREATE: "notifications:create",
  NOTIFICATIONS_MANAGE: "notifications:manage",
  ANNOUNCEMENTS_VIEW: "announcements:view",
  ANNOUNCEMENTS_CREATE: "announcements:create",
  ANNOUNCEMENTS_MANAGE: "announcements:manage",
  GROUPS_VIEW: "groups:view",
  GROUPS_CREATE: "groups:create",
  GROUPS_MANAGE: "groups:manage",
  GROUPS_ATTENDANCE: "groups:attendance",
  GROUPS_REPORTS_VIEW: "groups:reports:view",
  GROUPS_REPORTS_FINANCIAL: "groups:reports:financial",
  ANALYTICS_VIEW: "analytics:view",
  ANALYTICS_FINANCIAL: "analytics:financial",
  SETTINGS_VIEW: "settings:view",
  SETTINGS_MANAGE: "settings:manage",
  BRANCHES_VIEW: "branches:view",
  BRANCHES_MANAGE: "branches:manage",
  PAYMENTS_MANAGE: "payments:manage",
  LOCALIZATION_MANAGE: "localization:manage",
  USERS_MANAGE: "users:manage",
  DOCUMENTS_VIEW: "documents:view",
  DOCUMENTS_MANAGE: "documents:manage",
  DOCUMENTS_TEMPLATES_EDIT: "documents:templates:edit",
  KIDS_KINGDOM_VIEW: "kids_kingdom:view",
  KIDS_KINGDOM_MANAGE: "kids_kingdom:manage",
} as const;

export type Permission = (typeof PERMISSIONS)[keyof typeof PERMISSIONS];

const ROLE_PERMISSIONS: Record<Role, Permission[]> = {
  [ROLES.SUPER_ADMIN]: Object.values(PERMISSIONS),
  [ROLES.PASTOR]: [
    PERMISSIONS.DASHBOARD_VIEW,
    PERMISSIONS.VISITORS_VIEW,
    PERMISSIONS.FOLLOW_UP_MANAGE,
    PERMISSIONS.SERMONS_VIEW,
    PERMISSIONS.SERMONS_MANAGE,
    PERMISSIONS.EVENTS_VIEW,
    PERMISSIONS.EVENTS_MANAGE,
    PERMISSIONS.LIVESTREAM_VIEW,
    PERMISSIONS.LIVESTREAM_MANAGE,
    PERMISSIONS.PRAYER_VIEW,
    PERMISSIONS.PRAYER_MANAGE,
    PERMISSIONS.ATTENDANCE_VIEW,
    PERMISSIONS.ATTENDANCE_MANAGE,
    PERMISSIONS.TESTIMONIES_VIEW,
    PERMISSIONS.TESTIMONIES_MANAGE,
    PERMISSIONS.MEDIA_VIEW,
    PERMISSIONS.MEDIA_MANAGE,
    PERMISSIONS.SCRIPTURE_VIEW,
    PERMISSIONS.SCRIPTURE_MANAGE,
    PERMISSIONS.CELEBRATIONS_VIEW,
    PERMISSIONS.NOTIFICATIONS_VIEW,
    PERMISSIONS.NOTIFICATIONS_CREATE,
    PERMISSIONS.ANNOUNCEMENTS_VIEW,
    PERMISSIONS.ANNOUNCEMENTS_CREATE,
    PERMISSIONS.ANNOUNCEMENTS_MANAGE,
    PERMISSIONS.ANALYTICS_VIEW,
    PERMISSIONS.DONATIONS_VIEW,
    PERMISSIONS.DONATIONS_REPORT,
    PERMISSIONS.SETTINGS_VIEW,
    PERMISSIONS.BRANCHES_VIEW,
    PERMISSIONS.GROUPS_VIEW,
    PERMISSIONS.GROUPS_CREATE,
    PERMISSIONS.GROUPS_MANAGE,
    PERMISSIONS.GROUPS_ATTENDANCE,
    PERMISSIONS.GROUPS_REPORTS_VIEW,
    PERMISSIONS.GROUPS_REPORTS_FINANCIAL,
    PERMISSIONS.MEMBERS_VIEW,
    PERMISSIONS.MEMBERS_MANAGE,
    PERMISSIONS.DOCUMENTS_VIEW,
    PERMISSIONS.DOCUMENTS_MANAGE,
    PERMISSIONS.KIDS_KINGDOM_VIEW,
    PERMISSIONS.KIDS_KINGDOM_MANAGE,
  ],
  [ROLES.CHURCH_ADMIN]: [
    PERMISSIONS.DASHBOARD_VIEW,
    PERMISSIONS.MEMBERS_VIEW,
    PERMISSIONS.MEMBERS_MANAGE,
    PERMISSIONS.VISITORS_VIEW,
    PERMISSIONS.FOLLOW_UP_MANAGE,
    PERMISSIONS.EVENTS_VIEW,
    PERMISSIONS.EVENTS_MANAGE,
    PERMISSIONS.SERMONS_VIEW,
    PERMISSIONS.SERMONS_MANAGE,
    PERMISSIONS.PRAYER_VIEW,
    PERMISSIONS.ATTENDANCE_VIEW,
    PERMISSIONS.ATTENDANCE_MANAGE,
    PERMISSIONS.TESTIMONIES_VIEW,
    PERMISSIONS.TESTIMONIES_MANAGE,
    PERMISSIONS.SCRIPTURE_VIEW,
    PERMISSIONS.CELEBRATIONS_VIEW,
    PERMISSIONS.NOTIFICATIONS_VIEW,
    PERMISSIONS.NOTIFICATIONS_CREATE,
    PERMISSIONS.NOTIFICATIONS_MANAGE,
    PERMISSIONS.ANNOUNCEMENTS_VIEW,
    PERMISSIONS.ANNOUNCEMENTS_CREATE,
    PERMISSIONS.ANNOUNCEMENTS_MANAGE,
    PERMISSIONS.ANALYTICS_VIEW,
    PERMISSIONS.DONATIONS_VIEW,
    PERMISSIONS.DONATIONS_MANAGE,
    PERMISSIONS.DONATIONS_REPORT,
    PERMISSIONS.SETTINGS_VIEW,
    PERMISSIONS.SETTINGS_MANAGE,
    PERMISSIONS.BRANCHES_VIEW,
    PERMISSIONS.BRANCHES_MANAGE,
    PERMISSIONS.PAYMENTS_MANAGE,
    PERMISSIONS.LOCALIZATION_MANAGE,
    PERMISSIONS.MEDIA_VIEW,
    PERMISSIONS.MEDIA_MANAGE,
    PERMISSIONS.GROUPS_VIEW,
    PERMISSIONS.GROUPS_CREATE,
    PERMISSIONS.GROUPS_MANAGE,
    PERMISSIONS.GROUPS_ATTENDANCE,
    PERMISSIONS.GROUPS_REPORTS_VIEW,
    PERMISSIONS.GROUPS_REPORTS_FINANCIAL,
    PERMISSIONS.DOCUMENTS_VIEW,
    PERMISSIONS.DOCUMENTS_MANAGE,
    PERMISSIONS.DOCUMENTS_TEMPLATES_EDIT,
    PERMISSIONS.KIDS_KINGDOM_VIEW,
    PERMISSIONS.KIDS_KINGDOM_MANAGE,
  ],
  [ROLES.TREASURER]: [
    PERMISSIONS.DASHBOARD_VIEW,
    PERMISSIONS.EVENTS_VIEW,
    PERMISSIONS.MEMBERS_VIEW,
    PERMISSIONS.DONATIONS_VIEW,
    PERMISSIONS.DONATIONS_MANAGE,
    PERMISSIONS.ATTENDANCE_VIEW,
    PERMISSIONS.DONATIONS_REPORT,
    PERMISSIONS.NOTIFICATIONS_VIEW,
    PERMISSIONS.ANNOUNCEMENTS_VIEW,
    PERMISSIONS.ANALYTICS_VIEW,
    PERMISSIONS.ANALYTICS_FINANCIAL,
    PERMISSIONS.SETTINGS_VIEW,
    PERMISSIONS.BRANCHES_VIEW,
    PERMISSIONS.PAYMENTS_MANAGE,
    PERMISSIONS.GROUPS_VIEW,
    PERMISSIONS.GROUPS_REPORTS_FINANCIAL,
    PERMISSIONS.DOCUMENTS_VIEW,
  ],
  [ROLES.MEDIA_TEAM]: [
    PERMISSIONS.DASHBOARD_VIEW,
    PERMISSIONS.EVENTS_VIEW,
    PERMISSIONS.SERMONS_VIEW,
    PERMISSIONS.LIVESTREAM_VIEW,
    PERMISSIONS.LIVESTREAM_MANAGE,
    PERMISSIONS.MEDIA_VIEW,
    PERMISSIONS.MEDIA_MANAGE,
    PERMISSIONS.MEMBERS_VIEW,
    PERMISSIONS.ATTENDANCE_VIEW,
    PERMISSIONS.NOTIFICATIONS_VIEW,
    PERMISSIONS.ANNOUNCEMENTS_VIEW,
    PERMISSIONS.ANNOUNCEMENTS_CREATE,
    PERMISSIONS.SETTINGS_VIEW,
    PERMISSIONS.GROUPS_VIEW,
  ],
  [ROLES.MEMBER]: [
    PERMISSIONS.DASHBOARD_VIEW,
    PERMISSIONS.SERMONS_VIEW,
    PERMISSIONS.EVENTS_VIEW,
    PERMISSIONS.LIVESTREAM_VIEW,
    PERMISSIONS.PRAYER_VIEW,
    PERMISSIONS.ATTENDANCE_VIEW,
    PERMISSIONS.DONATIONS_VIEW,
    PERMISSIONS.TESTIMONIES_VIEW,
    PERMISSIONS.SCRIPTURE_VIEW,
    PERMISSIONS.CELEBRATIONS_VIEW,
    PERMISSIONS.NOTIFICATIONS_VIEW,
    PERMISSIONS.ANNOUNCEMENTS_VIEW,
    PERMISSIONS.GROUPS_VIEW,
    PERMISSIONS.DOCUMENTS_VIEW,
  ],
  [ROLES.VISITOR]: [
    PERMISSIONS.SERMONS_VIEW,
    PERMISSIONS.EVENTS_VIEW,
    PERMISSIONS.LIVESTREAM_VIEW,
    PERMISSIONS.PRAYER_VIEW,
    PERMISSIONS.ANNOUNCEMENTS_VIEW,
    PERMISSIONS.GROUPS_VIEW,
  ],
};

const ROUTE_PERMISSIONS: Record<string, Permission> = {
  // Dashboard Root
  "/dashboard": PERMISSIONS.DASHBOARD_VIEW,

  // Members
  "/dashboard/members": PERMISSIONS.MEMBERS_VIEW,
  "/dashboard/members/create": PERMISSIONS.MEMBERS_MANAGE,
  "/dashboard/members/[id]": PERMISSIONS.MEMBERS_VIEW,
  "/dashboard/members/[id]/edit": PERMISSIONS.MEMBERS_MANAGE,

  // Visitors
  "/dashboard/visitors": PERMISSIONS.VISITORS_VIEW,

  // Follow-Up
  "/dashboard/follow-up": PERMISSIONS.FOLLOW_UP_MANAGE,
  "/dashboard/follow-up/create": PERMISSIONS.FOLLOW_UP_MANAGE,
  "/dashboard/follow-up/[id]": PERMISSIONS.FOLLOW_UP_MANAGE,

  // Sermons
  "/dashboard/sermons": PERMISSIONS.SERMONS_VIEW,
  "/dashboard/sermons/create": PERMISSIONS.SERMONS_MANAGE,
  "/dashboard/sermons/[id]": PERMISSIONS.SERMONS_VIEW,
  "/dashboard/sermons/[id]/edit": PERMISSIONS.SERMONS_MANAGE,

  // Events
  "/dashboard/events": PERMISSIONS.EVENTS_VIEW,
  "/dashboard/events/create": PERMISSIONS.EVENTS_MANAGE,
  "/dashboard/events/[id]": PERMISSIONS.EVENTS_VIEW,
  "/dashboard/events/[id]/edit": PERMISSIONS.EVENTS_MANAGE,

  // Livestream
  "/dashboard/livestream": PERMISSIONS.LIVESTREAM_VIEW,

  // Prayer Requests
  "/dashboard/prayer": PERMISSIONS.PRAYER_VIEW,
  "/dashboard/prayer/create": PERMISSIONS.PRAYER_VIEW,
  "/dashboard/prayer/[id]": PERMISSIONS.PRAYER_VIEW,
  "/dashboard/prayer/[id]/edit": PERMISSIONS.PRAYER_MANAGE,

  // Attendance
  "/dashboard/attendance": PERMISSIONS.ATTENDANCE_VIEW,
  "/dashboard/attendance/create": PERMISSIONS.ATTENDANCE_MANAGE,
  "/dashboard/attendance/[id]": PERMISSIONS.ATTENDANCE_MANAGE,
  "/dashboard/attendance/[id]/report": PERMISSIONS.ATTENDANCE_VIEW,

  // Donations
  "/dashboard/donations": PERMISSIONS.DONATIONS_VIEW,
  "/dashboard/donations/create": PERMISSIONS.DONATIONS_MANAGE,
  "/dashboard/donations/[id]": PERMISSIONS.DONATIONS_VIEW,
  "/dashboard/donations/reports": PERMISSIONS.DONATIONS_REPORT,

  // Documents Generation
  "/dashboard/documents": PERMISSIONS.DOCUMENTS_VIEW,
  "/dashboard/documents/templates": PERMISSIONS.DOCUMENTS_TEMPLATES_EDIT,

  // Placeholders for future modules
  "/dashboard/testimonies": PERMISSIONS.TESTIMONIES_VIEW,
  "/dashboard/media": PERMISSIONS.MEDIA_VIEW,
  "/dashboard/media/upload": PERMISSIONS.MEDIA_MANAGE,
  "/dashboard/media/collections": PERMISSIONS.MEDIA_VIEW,
  "/dashboard/media/[id]": PERMISSIONS.MEDIA_VIEW,
  "/dashboard/scripture": PERMISSIONS.SCRIPTURE_VIEW,
  "/dashboard/celebrations": PERMISSIONS.CELEBRATIONS_VIEW,
  "/dashboard/notifications": PERMISSIONS.NOTIFICATIONS_VIEW,
  "/dashboard/notifications/templates": PERMISSIONS.NOTIFICATIONS_MANAGE,
  "/dashboard/notifications/channels": PERMISSIONS.NOTIFICATIONS_MANAGE,
  "/dashboard/notifications/create": PERMISSIONS.NOTIFICATIONS_CREATE,
  "/dashboard/announcements": PERMISSIONS.ANNOUNCEMENTS_VIEW,
  "/dashboard/announcements/create": PERMISSIONS.ANNOUNCEMENTS_CREATE,
  "/dashboard/announcements/history": PERMISSIONS.ANNOUNCEMENTS_MANAGE,
  "/dashboard/groups": PERMISSIONS.GROUPS_VIEW,
  "/dashboard/groups/create": PERMISSIONS.GROUPS_CREATE,
  "/dashboard/groups/outlines": PERMISSIONS.GROUPS_VIEW,
  "/dashboard/groups/prayer-requests": PERMISSIONS.GROUPS_VIEW,
  "/dashboard/groups/[id]": PERMISSIONS.GROUPS_VIEW,
  "/dashboard/groups/[id]/attendance": PERMISSIONS.GROUPS_ATTENDANCE,
  "/dashboard/groups/[id]/members": PERMISSIONS.GROUPS_VIEW,
  "/dashboard/groups/reports": PERMISSIONS.GROUPS_REPORTS_VIEW,
  "/dashboard/analytics": PERMISSIONS.ANALYTICS_VIEW,
  "/dashboard/settings": PERMISSIONS.SETTINGS_VIEW,
  "/dashboard/settings/branches": PERMISSIONS.BRANCHES_MANAGE,
  "/dashboard/settings/localization": PERMISSIONS.LOCALIZATION_MANAGE,
  "/dashboard/settings/payments": PERMISSIONS.PAYMENTS_MANAGE,
  "/dashboard/settings/church-profile": PERMISSIONS.SETTINGS_MANAGE,
  "/dashboard/users": PERMISSIONS.USERS_MANAGE,

  // Kids Kingdom
  "/dashboard/kids-kingdom": PERMISSIONS.KIDS_KINGDOM_VIEW,
};

export function hasPermission(role: Role, permission: Permission): boolean {
  return ROLE_PERMISSIONS[role]?.includes(permission) ?? false;
}

export function hasAnyPermission(
  role: Role,
  permissions: Permission[],
): boolean {
  return permissions.some((permission) => hasPermission(role, permission));
}

export function canAccessRoute(role: Role, pathname: string): boolean {
  const normalizedPath = pathname.replace(/\/$/, "") || "/dashboard";

  // Find all keys that match the normalized path
  const matchedRouteKey = Object.keys(ROUTE_PERMISSIONS)
    // Sort by descending specificity (length)
    .sort((a, b) => b.length - a.length)
    .find((pattern) => {
      // Escape regex characters except [id]
      const escaped = pattern
        .replace(/[.+*?^${}()|[\]\\]/g, "\\$&")
        .replace(/\\\[id\\\]/g, "([^/]+)");
      const regex = new RegExp(`^${escaped}$`);
      return regex.test(normalizedPath);
    });

  if (!matchedRouteKey) {
    // Fail closed by default (deny access if no explicit permission mapping exists)
    return false;
  }

  return hasPermission(role, ROUTE_PERMISSIONS[matchedRouteKey]);
}


export function getRolePermissions(role: Role): Permission[] {
  return ROLE_PERMISSIONS[role] ?? [];
}
