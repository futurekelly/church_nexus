export const ROLES = {
  SUPER_ADMIN: "super_admin",
  PASTOR: "pastor",
  CHURCH_ADMIN: "church_admin",
  TREASURER: "treasurer",
  MEDIA_TEAM: "media_team",
  MEMBER: "member",
  VISITOR: "visitor",
} as const;

export type Role = (typeof ROLES)[keyof typeof ROLES];

export const ROLE_LABELS: Record<Role, string> = {
  [ROLES.SUPER_ADMIN]: "Super Admin",
  [ROLES.PASTOR]: "Pastor",
  [ROLES.CHURCH_ADMIN]: "Church Admin",
  [ROLES.TREASURER]: "Treasurer",
  [ROLES.MEDIA_TEAM]: "Media Team",
  [ROLES.MEMBER]: "Member",
  [ROLES.VISITOR]: "Visitor",
};

export const DASHBOARD_ROLES: Role[] = [
  ROLES.SUPER_ADMIN,
  ROLES.PASTOR,
  ROLES.CHURCH_ADMIN,
  ROLES.TREASURER,
  ROLES.MEDIA_TEAM,
  ROLES.MEMBER,
];
