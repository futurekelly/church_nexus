"use client";

import { Menu, Search } from "lucide-react";
import { DashboardBreadcrumbs } from "@/features/dashboard/components/shell/dashboard-breadcrumbs";
import { NotificationDropdown } from "@/features/dashboard/components/shell/notification-dropdown";
import { UserProfileDropdown } from "@/features/dashboard/components/shell/user-profile-dropdown";
import { LanguageSwitcher } from "@/components/ui/language-switcher";
import { useIsMobile } from "@/hooks/use-media-query";
import { cn } from "@/lib/utils";
import { useUiStore } from "@/store/ui-store";

export function DashboardTopbar() {
  const isMobile = useIsMobile();
  const setSidebarMobileOpen = useUiStore((state) => state.setSidebarMobileOpen);

  return (
    <header className="glass-panel sticky top-0 z-30 flex h-16 items-center justify-between border-b border-border px-4 lg:px-6">
      <div className="flex min-w-0 items-center gap-3">
        {isMobile && (
          <button
            type="button"
            aria-label="Open navigation menu"
            aria-controls="dashboard-sidebar"
            onClick={() => setSidebarMobileOpen(true)}
            className="rounded-lg p-2 text-muted-foreground transition-all duration-200 hover:bg-card/80 hover:text-primary hover:shadow-neon lg:hidden"
          >
            <Menu className="h-5 w-5" aria-hidden="true" />
          </button>
        )}
        <div className="min-w-0 truncate">
          <DashboardBreadcrumbs />
        </div>
      </div>

      <div className="flex shrink-0 items-center gap-2 sm:gap-3">
        <div className="relative hidden md:block">
          <Search
            className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground"
            aria-hidden="true"
          />
          <input
            type="search"
            placeholder="Search..."
            aria-label="Search dashboard"
            disabled
            className={cn(
              "h-9 w-44 rounded-lg border border-border bg-card/50 pl-9 pr-3 text-sm lg:w-52",
              "text-primary-foreground placeholder:text-muted-foreground",
              "focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary",
              "disabled:cursor-not-allowed disabled:opacity-60",
            )}
          />
        </div>

        <LanguageSwitcher />
        <NotificationDropdown />
        <UserProfileDropdown />
      </div>
    </header>
  );
}
