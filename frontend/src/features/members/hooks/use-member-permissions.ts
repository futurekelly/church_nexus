// MIGRATION CANDIDATE: Deprecated in favor of global useAppPermissions
"use client";

import { useAuth } from "@/hooks/use-auth";
import { usePermissions } from "@/hooks/use-permissions";
import { PERMISSIONS } from "@/lib/permissions";
import { ROLES } from "@/types/roles";

/**
 * Centralised member permission helpers.
 *
 * Permission matrix (from ROLE_SYSTEM.md + prompt):
 *   super_admin   — full CRUD + delete
 *   church_admin  — full CRUD + delete
 *   pastor        — read + view activity, no create/edit/delete
 *   treasurer     — read-only
 *   media_team    — read basic profiles only
 *   member        — own profile only
 */
export function useMemberPermissions() {
  const { role } = useAuth();
  const { can } = usePermissions();

  const canView = can(PERMISSIONS.MEMBERS_VIEW);
  const canManage = can(PERMISSIONS.MEMBERS_MANAGE);

  const canCreate = canManage;
  const canEdit = canManage;
  const canDelete =
    role === ROLES.SUPER_ADMIN || role === ROLES.CHURCH_ADMIN;

  // Pastor can view activity timeline
  const canViewActivity =
    canManage ||
    role === ROLES.PASTOR ||
    role === ROLES.SUPER_ADMIN;

  // Media team sees basic info (name, photo, ministry) — no contact details
  const canViewContactDetails =
    role !== ROLES.MEDIA_TEAM &&
    role !== ROLES.MEMBER &&
    role !== ROLES.VISITOR;

  // Member can only see their own profile
  const isSelfOnly =
    role === ROLES.MEMBER || role === ROLES.VISITOR;

  return {
    canView,
    canCreate,
    canEdit,
    canDelete,
    canViewActivity,
    canViewContactDetails,
    isSelfOnly,
    role,
  };
}
