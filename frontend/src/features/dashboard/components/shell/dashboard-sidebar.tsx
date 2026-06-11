"use client";

import { Church, PanelLeftClose, PanelLeftOpen } from "lucide-react";
import Link from "next/link";
import { motion, useReducedMotion } from "framer-motion";
import { DASHBOARD_ROUTES } from "@/constants/routes";
import { DashboardSidebarNav } from "@/features/dashboard/components/shell/dashboard-sidebar-nav";
import { useDashboardNavigation } from "@/features/dashboard/hooks/use-dashboard-navigation";
import { useIsMobile } from "@/hooks/use-media-query";
import { cn } from "@/lib/utils";
import { useUiStore } from "@/store/ui-store";

export function DashboardSidebar() {
  const isMobile = useIsMobile();
  const prefersReducedMotion = useReducedMotion();
  const { sidebarNavItems } = useDashboardNavigation();
  const sidebarCollapsed = useUiStore((state) => state.sidebarCollapsed);
  const sidebarMobileOpen = useUiStore((state) => state.sidebarMobileOpen);
  const toggleSidebar = useUiStore((state) => state.toggleSidebar);
  const closeSidebarMobile = useUiStore((state) => state.closeSidebarMobile);

  const collapsed = !isMobile && sidebarCollapsed;
  const isOpen = isMobile ? sidebarMobileOpen : true;
  const width = collapsed ? 72 : 256;

  return (
    <>
      {isMobile && isOpen && (
        <button
          type="button"
          aria-label="Close navigation menu"
          className="fixed inset-0 z-40 bg-background/80 backdrop-blur-sm lg:hidden"
          onClick={closeSidebarMobile}
        />
      )}

      <motion.aside
        aria-label="Sidebar"
        id="dashboard-sidebar"
        initial={false}
        animate={{
          width: isMobile ? 256 : width,
          x: isMobile && !isOpen ? -256 : 0,
        }}
        transition={
          prefersReducedMotion
            ? { duration: 0 }
            : { duration: 0.3, ease: "easeInOut" }
        }
        className={cn(
          "glass-panel fixed left-0 top-0 z-50 flex h-full flex-col overflow-hidden border-r border-border",
          isMobile && "lg:translate-x-0",
        )}
      >
        <div
          className={cn(
            "flex h-16 shrink-0 items-center border-b border-border px-4",
            collapsed && !isMobile && "justify-center px-2",
          )}
        >
          <Link
            href={DASHBOARD_ROUTES.ROOT}
            onClick={closeSidebarMobile}
            className="flex items-center gap-2 font-display text-lg font-semibold text-primary-foreground transition-colors hover:text-primary"
          >
            <Church className="h-6 w-6 shrink-0 text-primary" aria-hidden="true" />
            {(!collapsed || isMobile) && <span>Church Nexus</span>}
          </Link>
        </div>

        <DashboardSidebarNav
          items={sidebarNavItems}
          collapsed={collapsed && !isMobile}
          onNavigate={closeSidebarMobile}
        />

        {!isMobile && (
          <div className="shrink-0 border-t border-border p-3">
            <button
              type="button"
              onClick={toggleSidebar}
              aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
              aria-expanded={!collapsed}
              className="flex w-full items-center justify-center rounded-lg p-2 text-muted-foreground transition-all duration-200 hover:bg-card/80 hover:text-primary hover:shadow-neon"
            >
              {collapsed ? (
                <PanelLeftOpen className="h-5 w-5" aria-hidden="true" />
              ) : (
                <PanelLeftClose className="h-5 w-5" aria-hidden="true" />
              )}
            </button>
          </div>
        )}
      </motion.aside>
    </>
  );
}
