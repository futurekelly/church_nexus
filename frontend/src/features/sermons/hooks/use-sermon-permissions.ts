"use client";

import { useAuth } from "@/hooks/use-auth";
import { ROLES } from "@/types/roles";

/**
 * Hook to manage Sermons module permissions.
 * Gated by:
 * - canCreate: Super Admin, Church Admin, Pastor
 * - canEdit: Super Admin, Church Admin, Pastor
 * - canViewLibrary: Everyone EXCEPT Visitors (Visitors cannot see the dashboard sermon library)
 */
export function useSermonPermissions() {
  const { role } = useAuth();

  const canCreate =
    role === ROLES.SUPER_ADMIN ||
    role === ROLES.CHURCH_ADMIN ||
    role === ROLES.PASTOR;

  const canEdit =
    role === ROLES.SUPER_ADMIN ||
    role === ROLES.CHURCH_ADMIN ||
    role === ROLES.PASTOR;

  const canDelete =
    role === ROLES.SUPER_ADMIN ||
    role === ROLES.CHURCH_ADMIN;

  const canViewLibrary = role !== ROLES.VISITOR;

  return {
    canCreate,
    canEdit,
    canDelete,
    canViewLibrary,
    role,
  };
}
