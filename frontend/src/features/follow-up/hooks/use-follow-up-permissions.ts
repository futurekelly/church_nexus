// MIGRATION CANDIDATE: Deprecated in favor of global useAppPermissions
"use client";

import { useAuth } from "@/hooks/use-auth";
import { ROLES } from "@/types/roles";

export function useFollowUpPermissions() {
  const { role, user } = useAuth();

  const isSuperAdmin = role === ROLES.SUPER_ADMIN;
  const isChurchAdmin = role === ROLES.CHURCH_ADMIN;
  const isPastor = role === ROLES.PASTOR;
  const isTreasurer = role === ROLES.TREASURER;
  const isMediaTeam = role === ROLES.MEDIA_TEAM;
  const isMember = role === ROLES.MEMBER;

  // Manage access: Super Admin, Church Admin, Pastor can create/edit tickets & transition states
  const canManage = isSuperAdmin || isChurchAdmin || isPastor;

  // View access: Staff and leaders (Treasurers, Media team, Pastors, Admins)
  const canViewFollowUp = isSuperAdmin || isChurchAdmin || isPastor || isTreasurer || isMediaTeam;

  return {
    userId: user?.id,
    role,
    canManage,
    canViewFollowUp,
    isMember,
  };
}
