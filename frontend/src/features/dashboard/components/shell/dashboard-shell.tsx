"use client";

import { useEffect, type ReactNode } from "react";
import { mockDashboardNotifications } from "@/features/dashboard/data/mock-notifications";
import { DashboardRouteGuard } from "@/features/dashboard/components/shell/dashboard-route-guard";
import { DashboardSidebar } from "@/features/dashboard/components/shell/dashboard-sidebar";
import { DashboardTopbar } from "@/features/dashboard/components/shell/dashboard-topbar";
import { MobileDashboardNav } from "@/features/dashboard/components/shell/mobile-dashboard-nav";
import { useIsMobile } from "@/hooks/use-media-query";
import { cn } from "@/lib/utils";
import { useNotificationStore } from "@/store/notification-store";
import { useUiStore } from "@/store/ui-store";

interface DashboardShellProps {
  children: ReactNode;
}

export function DashboardShell({ children }: DashboardShellProps) {
  const isMobile = useIsMobile();
  const sidebarCollapsed = useUiStore((state) => state.sidebarCollapsed);
  const notifications = useNotificationStore((state) => state.notifications);
  const setNotifications = useNotificationStore((state) => state.setNotifications);

  useEffect(() => {
    if (notifications.length === 0) {
      setNotifications(mockDashboardNotifications);
    }
  }, [notifications.length, setNotifications]);

  const sidebarOffset = isMobile
    ? "pl-0"
    : sidebarCollapsed
      ? "lg:pl-[72px]"
      : "lg:pl-64";

  return (
    <DashboardRouteGuard>
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-4 focus:z-[60] focus:rounded-lg focus:bg-primary focus:px-4 focus:py-2 focus:text-white"
      >
        Skip to main content
      </a>

      <div className="min-h-screen bg-background">
        <DashboardSidebar />

        <div
          className={cn(
            "flex min-h-screen flex-col transition-[padding] duration-300",
            sidebarOffset,
          )}
        >
          <DashboardTopbar />

          <main
            id="main-content"
            className="flex-1 px-4 py-6 pb-24 md:pb-6 lg:px-8"
          >
            {children}
          </main>
        </div>

        <MobileDashboardNav />
      </div>
    </DashboardRouteGuard>
  );
}
