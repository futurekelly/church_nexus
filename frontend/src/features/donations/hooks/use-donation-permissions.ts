// MIGRATION CANDIDATE: Deprecated in favor of global useAppPermissions
"use client";

import { useAuth } from "@/hooks/use-auth";
import { ROLES } from "@/types/roles";

export function useDonationPermissions() {
  const { role, user } = useAuth();

  const isSuperAdmin = role === ROLES.SUPER_ADMIN;
  const isChurchAdmin = role === ROLES.CHURCH_ADMIN;
  const isPastor = role === ROLES.PASTOR;
  const isTreasurer = role === ROLES.TREASURER;
  const isMediaTeam = role === ROLES.MEDIA_TEAM;
  const isMember = role === ROLES.MEMBER;
  const isVisitor = role === ROLES.VISITOR;

  // Manage rights: Super Admin, Church Admin, Treasurer
  const canManage = isSuperAdmin || isChurchAdmin || isTreasurer;

  // Report rights: Super Admin, Church Admin, Pastor, Treasurer
  const canViewReports = isSuperAdmin || isChurchAdmin || isPastor || isTreasurer;

  // Read rights: Super Admin, Church Admin, Pastor, Treasurer, Member
  // (Visitor and Media Team have NO access to dashboard donation views)
  const canViewDashboard = isSuperAdmin || isChurchAdmin || isPastor || isTreasurer || isMember;

  return {
    userId: user?.id,
    userEmail: user?.email,
    userName: user ? `${user.first_name} ${user.last_name}` : undefined,
    role,
    isMember,
    isTreasurer,
    isPastor,
    isVisitor,
    isMediaTeam,
    canManage,
    canViewReports,
    canViewDashboard,
    // Assuming the user ID matches member list reference (e.g. "mem-1" or exact user.id)
    userMemberId: user?.id ? `mem-${user.id}` : null,
  };
}
