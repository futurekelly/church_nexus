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
  const { role, user } = useAuth();
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
    
    // Allow members to view their own member profile detail page
    const isSelfProfileRoute = pathname.startsWith("/dashboard/members/") && 
                               !pathname.endsWith("/edit") && 
                               !pathname.endsWith("/create");
    if (isSelfProfileRoute && role === "member") {
      const profileId = pathname.split("/").pop();
      const userMemberId = user?.member_id ?? user?.memberId ?? null;
      if (profileId && userMemberId && String(profileId) === String(userMemberId)) {
        return true;
      }
    }
    
    return canAccessRoute(role, pathname);
  }, [role, pathname, user]);

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
