"use client";

import { useAuth } from "@/hooks/use-auth";
import { ROLES } from "@/types/roles";

export function useAppPermissions() {
  const { role, user } = useAuth();

  const isSuperAdmin = role === ROLES.SUPER_ADMIN;
  const isChurchAdmin = role === ROLES.CHURCH_ADMIN;
  const isPastor = role === ROLES.PASTOR;
  const isTreasurer = role === ROLES.TREASURER;
  const isMediaTeam = role === ROLES.MEDIA_TEAM;
  const isMember = role === ROLES.MEMBER;
  const isVisitor = role === ROLES.VISITOR || !role;

  return {
    userId: user?.id,
    userRole: role,
    userEmail: user?.email,
    userName: user ? `${user.first_name} ${user.last_name}` : "Guest",

    // Members Module Permissions
    members: {
      canView: isSuperAdmin || isChurchAdmin,
      canManage: isSuperAdmin || isChurchAdmin,
    },

    // Visitors & Follow-Up Permissions
    followUp: {
      canView: isSuperAdmin || isChurchAdmin || isPastor,
      canManage: isSuperAdmin || isChurchAdmin || isPastor,
    },

    // Events Module Permissions
    events: {
      canView: !!role,
      canManage: isSuperAdmin || isChurchAdmin || isPastor,
    },

    // Sermons Module Permissions
    sermons: {
      canView: true,
      canManage: isSuperAdmin || isChurchAdmin || isPastor,
    },

    // Prayer Requests Permissions
    prayer: {
      canView: !!role,
      canManageStatus: isSuperAdmin || isChurchAdmin || isPastor,
      canRespond: isSuperAdmin || isPastor,
      canSeeAnonymousNames: isSuperAdmin || isPastor,
    },

    // Attendance Module Permissions
    attendance: {
      canView: isSuperAdmin || isChurchAdmin || isPastor || isTreasurer || isMediaTeam || isMember,
      canManage: isSuperAdmin || isChurchAdmin || isPastor,
      canViewReports: isSuperAdmin || isChurchAdmin || isPastor || isTreasurer || isMediaTeam,
    },

    // Donations Module Permissions
    donations: {
      canView: isSuperAdmin || isChurchAdmin || isPastor || isTreasurer || isMember,
      canManage: isSuperAdmin || isChurchAdmin || isTreasurer,
      canReport: isSuperAdmin || isChurchAdmin || isPastor || isTreasurer,
    },

    // Livestream Module Permissions
    livestream: {
      canView: true,
      canChat: !!role && !isVisitor,
      canModerate: isSuperAdmin || isChurchAdmin || isPastor,
    },
  };
}
