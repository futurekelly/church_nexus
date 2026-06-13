"use client";

import { useAuth } from "@/hooks/use-auth";
import { ROLES } from "@/types/roles";

/**
 * Hook to manage Events module specific permission gates.
 * Enforces:
 * - Super Admin & Church Admin: Full access (Create, Edit, View, Cancel)
 * - Pastor: Create, Edit, View (No Cancel)
 * - Treasurer & Media Team: View Only
 * - Member: View & Register
 * - Visitor: View Only (Cannot Register)
 */
export function useEventPermissions() {
  const { role } = useAuth();

  const canCreate =
    role === ROLES.SUPER_ADMIN ||
    role === ROLES.CHURCH_ADMIN ||
    role === ROLES.PASTOR;

  const canEdit =
    role === ROLES.SUPER_ADMIN ||
    role === ROLES.CHURCH_ADMIN ||
    role === ROLES.PASTOR;

  const canCancel =
    role === ROLES.SUPER_ADMIN || role === ROLES.CHURCH_ADMIN;

  const canRegister = role === ROLES.MEMBER;

  const isReadOnly =
    role === ROLES.TREASURER ||
    role === ROLES.MEDIA_TEAM ||
    role === ROLES.VISITOR;

  return {
    canCreate,
    canEdit,
    canCancel,
    canRegister,
    isReadOnly,
    role,
  };
}
