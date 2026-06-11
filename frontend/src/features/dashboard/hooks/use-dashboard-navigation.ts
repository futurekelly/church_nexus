"use client";

import { useMemo } from "react";
import {
  MOBILE_BOTTOM_NAV_ITEMS,
  SIDEBAR_NAV_ITEMS,
  type NavItem,
} from "@/constants/navigation";
import { usePermissions } from "@/hooks/use-permissions";
import { useAuth } from "@/hooks/use-auth";
import { ROLE_LABELS, type Role } from "@/types/roles";

export function useDashboardNavigation() {
  const { role } = useAuth();
  const { can, visibleNavItems } = usePermissions();

  const mobileNavItems = useMemo(() => {
    if (!role) return [];
    return MOBILE_BOTTOM_NAV_ITEMS.filter((item) => can(item.permission));
  }, [can, role]);

  const sidebarNavItems = useMemo<NavItem[]>(() => visibleNavItems, [visibleNavItems]);

  const roleLabel = role ? ROLE_LABELS[role as Role] : "";

  return {
    role,
    roleLabel,
    sidebarNavItems,
    mobileNavItems,
    can,
  };
}
