"use client";

import { useCallback, useMemo } from "react";
import { usePathname } from "next/navigation";
import { SIDEBAR_NAV_ITEMS } from "@/constants/navigation";
import {
  canAccessRoute,
  getRolePermissions,
  hasPermission,
  type Permission,
} from "@/lib/permissions";
import { useAuth } from "@/hooks/use-auth";

export function usePermissions() {
  const { role } = useAuth();
  const pathname = usePathname();

  const permissions = useMemo(
    () => (role ? getRolePermissions(role) : []),
    [role],
  );

  const can = useCallback(
    (permission: Permission) => {
      if (!role) return false;
      return hasPermission(role, permission);
    },
    [role],
  );

  const canAccessCurrentRoute = useMemo(() => {
    if (!role) return false;
    return canAccessRoute(role, pathname);
  }, [role, pathname]);

  const visibleNavItems = useMemo(() => {
    if (!role) return [];
    return SIDEBAR_NAV_ITEMS.filter((item) => hasPermission(role, item.permission));
  }, [role]);

  return {
    permissions,
    can,
    canAccessCurrentRoute,
    visibleNavItems,
  };
}
