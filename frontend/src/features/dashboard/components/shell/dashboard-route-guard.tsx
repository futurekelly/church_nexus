"use client";

import { useEffect, type ReactNode } from "react";
import { usePathname, useRouter } from "next/navigation";
import { AUTH_ROUTES, DASHBOARD_ROUTES, PUBLIC_ROUTES } from "@/constants/routes";
import { useAuth } from "@/hooks/use-auth";
import { usePermissions } from "@/hooks/use-permissions";
import { ROLES } from "@/types/roles";

interface DashboardRouteGuardProps {
  children: ReactNode;
}

export function DashboardRouteGuard({ children }: DashboardRouteGuardProps) {
  const router = useRouter();
  const pathname = usePathname();
  const { isAuthenticated, isLoading, role } = useAuth();
  const { canAccessCurrentRoute } = usePermissions();

  useEffect(() => {
    if (isLoading) return;

    if (!isAuthenticated) {
      const loginUrl = `${AUTH_ROUTES.LOGIN}?redirect=${encodeURIComponent(pathname)}`;
      router.replace(loginUrl);
      return;
    }

    if (role === ROLES.VISITOR) {
      router.replace(PUBLIC_ROUTES.HOME);
      return;
    }

    if (!canAccessCurrentRoute) {
      router.replace(DASHBOARD_ROUTES.ROOT);
    }
  }, [
    canAccessCurrentRoute,
    isAuthenticated,
    isLoading,
    pathname,
    role,
    router,
  ]);

  const isBlocked =
    isLoading ||
    !isAuthenticated ||
    role === ROLES.VISITOR ||
    !canAccessCurrentRoute;

  if (isBlocked) {
    return (
      <div
        className="flex min-h-screen items-center justify-center bg-background"
        role="status"
        aria-live="polite"
        aria-busy="true"
        aria-label="Loading dashboard"
      >
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-primary border-t-transparent" />
      </div>
    );
  }

  return <>{children}</>;
}
