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
import { apiGet } from "@/services/api-client";
import { useAuth } from "@/hooks/use-auth";

interface DashboardShellProps {
  children: ReactNode;
}

export function DashboardShell({ children }: DashboardShellProps) {
  const isMobile = useIsMobile();
  const sidebarCollapsed = useUiStore((state) => state.sidebarCollapsed);
  const notifications = useNotificationStore((state) => state.notifications);
  const setNotifications = useNotificationStore((state) => state.setNotifications);

  const { isAuthenticated } = useAuth();

  useEffect(() => {
    async function loadNotifications() {
      try {
        const response = await apiGet<any>("/api/notifications/");
        if (response && response.success && Array.isArray(response.data)) {
          if (response.data.length > 0) {
            const mapped = response.data.map((n: any) => ({
              id: n.id,
              title: n.title,
              message: n.message,
              read_status: n.read,
              created_at: n.created_at,
              action_url: n.action_url,
            }));
            setNotifications(mapped);
          } else {
            setNotifications(mockDashboardNotifications);
          }
        } else {
          setNotifications(mockDashboardNotifications);
        }
      } catch (err) {
        console.warn("Failed to load real notifications, falling back to mocks:", err);
        setNotifications(mockDashboardNotifications);
      }
    }

    if (isAuthenticated) {
      loadNotifications();
    }
  }, [isAuthenticated, setNotifications]);

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
