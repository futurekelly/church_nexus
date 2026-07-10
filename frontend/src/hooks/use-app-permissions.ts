"use client";

import { useAuth } from "@/hooks/use-auth";
import { ROLES } from "@/types/roles";

/**
 * Global permissions registry hook that centralizes all authorization rules.
 * Consolidates all legacy module-specific permission hooks.
 */
export function useAppPermissions() {
  const { role, user } = useAuth();

  const isSuperAdmin = role === ROLES.SUPER_ADMIN;
  const isChurchAdmin = role === ROLES.CHURCH_ADMIN;
  const isPastor = role === ROLES.PASTOR;
  const isTreasurer = role === ROLES.TREASURER;
  const isMediaTeam = role === ROLES.MEDIA_TEAM;
  const isMember = role === ROLES.MEMBER;
  const isVisitor = role === ROLES.VISITOR || !role;

  // Resolve member ID directly from user object (preserves compatibility with future UUID backend)
  const userMemberId = user?.member_id ?? user?.memberId ?? null;

  return {
    userId: user?.id,
    userRole: role,
    userEmail: user?.email,
    userName: user ? `${user.first_name} ${user.last_name}` : "Guest",
    isSuperAdmin,
    isChurchAdmin,
    isPastor,

    members: {
      canView: isSuperAdmin || isChurchAdmin || isPastor || isTreasurer || isMediaTeam || isMember,
      canManage: isSuperAdmin || isChurchAdmin || isPastor,
      canCreate: isSuperAdmin || isChurchAdmin || isPastor,
      canEdit: isSuperAdmin || isChurchAdmin || isPastor,
      canDelete: isSuperAdmin || isChurchAdmin,
      canViewNotes: isSuperAdmin || isChurchAdmin || isPastor,
      canViewActivity: isSuperAdmin || isChurchAdmin || isPastor,
      canViewContactDetails: role !== ROLES.MEDIA_TEAM && role !== ROLES.MEMBER && role !== ROLES.VISITOR && !!role,
      isSelfOnly: role === ROLES.MEMBER || role === ROLES.VISITOR || !role,
    },

    // Visitors & Follow-Up Permissions
    followUp: {
      canView: isSuperAdmin || isChurchAdmin || isPastor || isTreasurer || isMediaTeam,
      canViewFollowUp: isSuperAdmin || isChurchAdmin || isPastor || isTreasurer || isMediaTeam,
      canManage: isSuperAdmin || isChurchAdmin || isPastor,
      isMember,
    },

    // Events Module Permissions
    events: {
      canView: !!role,
      canManage: isSuperAdmin || isChurchAdmin || isPastor,
      canCreate: isSuperAdmin || isChurchAdmin || isPastor,
      canEdit: isSuperAdmin || isChurchAdmin || isPastor,
      canCancel: isSuperAdmin || isChurchAdmin,
      canRegister: !!role && role !== ROLES.VISITOR,
      role,
    },

    // Sermons Module Permissions
    sermons: {
      canView: true,
      canManage: isSuperAdmin || isChurchAdmin || isPastor || isMediaTeam,
      canCreate: isSuperAdmin || isChurchAdmin || isPastor || isMediaTeam,
      canEdit: isSuperAdmin || isChurchAdmin || isPastor || isMediaTeam,
      canDelete: isSuperAdmin || isChurchAdmin,
      canViewLibrary: role !== ROLES.VISITOR && !!role,
      role,
    },

    // Prayer Requests Permissions
    prayer: {
      canView: !!role,
      canSubmit: !!user,
      canManageStatus: isSuperAdmin || isChurchAdmin || isPastor,
      canRespond: isSuperAdmin || isPastor,
      canSeeAnonymousNames: isSuperAdmin || isPastor,
      canEdit: (requestUserId: string | number) =>
        isSuperAdmin || (user && String(user.id) === String(requestUserId)),
      canDelete: (requestUserId: string | number) =>
        isSuperAdmin || (user && String(user.id) === String(requestUserId)),
      userId: user?.id,
      userName: user ? `${user.first_name || ""} ${user.last_name || ""}`.trim() || user.email : "Anonymous",
    },

    // Attendance Module Permissions
    attendance: {
      canView: isSuperAdmin || isChurchAdmin || isPastor || isTreasurer || isMediaTeam || isMember,
      canViewAttendance: isSuperAdmin || isChurchAdmin || isPastor || isTreasurer || isMediaTeam || isMember,
      canManage: isSuperAdmin || isChurchAdmin || isPastor,
      canViewReports: isSuperAdmin || isChurchAdmin || isPastor || isTreasurer || isMediaTeam,
      isMember,
      userMemberId,
      role,
    },

    // Donations Module Permissions
    donations: {
      canView: isSuperAdmin || isChurchAdmin || isPastor || isTreasurer || isMember,
      canViewDashboard: isSuperAdmin || isChurchAdmin || isPastor || isTreasurer || isMember,
      canManage: isSuperAdmin || isChurchAdmin || isTreasurer,
      canReport: isSuperAdmin || isChurchAdmin || isPastor || isTreasurer,
      canViewReports: isSuperAdmin || isChurchAdmin || isPastor || isTreasurer,
      isMember,
      isTreasurer,
      isPastor,
      isVisitor,
      isMediaTeam,
      userMemberId,
      role,
    },

    // Document Generation Permissions
    documents: {
      canView: isSuperAdmin || isChurchAdmin || isPastor || isTreasurer || isMember,
      canManage: isSuperAdmin || isChurchAdmin || isPastor,
      canEditTemplates: isSuperAdmin || isChurchAdmin,
      isMember,
      isPastor,
      isTreasurer,
      userMemberId,
      role,
    },

    // Livestream Module Permissions
    livestream: {
      canView: true,
      canChat: !!role && role !== ROLES.VISITOR,
      canModerate: isSuperAdmin || isChurchAdmin || isPastor,
      userName: user ? `${user.first_name} ${user.last_name}` : "Visitor",
      userRole: role,
      isSuperAdmin,
      isChurchAdmin,
      isPastor,
      isMember,
      isVisitor,
    },

    // Testimonies Module Permissions
    testimonies: {
      canViewDashboard: isSuperAdmin || isChurchAdmin || isPastor,
      canApprove: isSuperAdmin || isChurchAdmin || isPastor,
      canDelete: isSuperAdmin || isChurchAdmin,
      canFeature: isSuperAdmin || isChurchAdmin || isPastor,
    },

    // Settings Module Permissions
    settings: {
      canView: isSuperAdmin || isChurchAdmin || isPastor || isTreasurer || isMediaTeam,
      canManageIdentity: isSuperAdmin || isChurchAdmin,
      canManageBranches: isSuperAdmin || isChurchAdmin,
      canViewBranches: isSuperAdmin || isChurchAdmin || isPastor || isTreasurer,
      canManagePayments: isSuperAdmin || isChurchAdmin || isTreasurer,
      canManageLocalization: isSuperAdmin || isChurchAdmin,
    },

    // Notifications Module Permissions
    notifications: {
      canView: isSuperAdmin || isChurchAdmin || isPastor || isTreasurer || isMediaTeam || isMember,
      canCreate: isSuperAdmin || isChurchAdmin || isPastor,
      canManage: isSuperAdmin || isChurchAdmin,
    },

    // Announcements Module Permissions
    announcements: {
      canView: true,
      canCreate: isSuperAdmin || isChurchAdmin || isPastor || isMediaTeam,
      canManage: isSuperAdmin || isChurchAdmin || isPastor,
    },

    // Connect Groups Module Permissions
    groups: {
      canView: true,
      canCreate: isSuperAdmin || isChurchAdmin || isPastor,
      canManage: isSuperAdmin || isChurchAdmin || isPastor,
      canLogAttendance: isSuperAdmin || isChurchAdmin || isPastor,
      canViewReports: isSuperAdmin || isChurchAdmin || isPastor,
      canViewFinancialReports: isSuperAdmin || isChurchAdmin || isPastor || isTreasurer,
    },

    // Media Module Permissions
    media: {
      canView: true,
      canManage: isSuperAdmin || isChurchAdmin || isPastor || isMediaTeam,
    },

    // Analytics Module Permissions
    analytics: {
      canView: isSuperAdmin || isChurchAdmin || isPastor || isTreasurer,
      canViewFinancial: isSuperAdmin || isTreasurer || isPastor,
      role,
      userMemberId,
    },
  };
}
