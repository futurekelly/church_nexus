// MIGRATION CANDIDATE: Deprecated in favor of global useAppPermissions
"use client";

import { useAuth } from "@/hooks/use-auth";
import { ROLES } from "@/types/roles";

export function useAttendancePermissions() {
  const { role, user } = useAuth();

  const isSuperAdmin = role === ROLES.SUPER_ADMIN;
  const isChurchAdmin = role === ROLES.CHURCH_ADMIN;
  const isPastor = role === ROLES.PASTOR;
  const isTreasurer = role === ROLES.TREASURER;
  const isMediaTeam = role === ROLES.MEDIA_TEAM;
  const isMember = role === ROLES.MEMBER;

  // Manage rights: Super Admin, Church Admin, Pastor can create/modify sessions
  const canManage = isSuperAdmin || isChurchAdmin || isPastor;

  // Report rights: Admin, Pastor, Treasurer, Media Team
  const canViewReports = isSuperAdmin || isChurchAdmin || isPastor || isTreasurer || isMediaTeam;

  // Read rights: Anyone except Visitors
  const canViewAttendance = isSuperAdmin || isChurchAdmin || isPastor || isTreasurer || isMediaTeam || isMember;

  return {
    userId: user?.id,
    role,
    isMember,
    canManage,
    canViewReports,
    canViewAttendance,
    userMemberId: user ? `mem-${user.id}` : null, // Assuming format matches member listing references
  };
}
