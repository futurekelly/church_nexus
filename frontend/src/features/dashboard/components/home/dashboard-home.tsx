"use client";

import { useReducedMotion } from "framer-motion";
import { useAuth } from "@/hooks/use-auth";
import { ROLES } from "@/types/roles";
import { SuperAdminHome } from "@/features/dashboard/components/home/super-admin-home";
import { ChurchAdminHome } from "@/features/dashboard/components/home/church-admin-home";
import { PastorHome } from "@/features/dashboard/components/home/pastor-home";
import { TreasurerHome } from "@/features/dashboard/components/home/treasurer-home";
import { MediaTeamHome } from "@/features/dashboard/components/home/media-team-home";
import { MemberHome } from "@/features/dashboard/components/home/member-home";

// Loading skeleton while auth hydrates
function DashboardSkeleton() {
  return (
    <div className="space-y-8 animate-pulse" aria-busy="true" aria-label="Loading dashboard">
      {/* Header */}
      <div className="space-y-2">
        <div className="h-8 w-64 rounded-xl bg-card/60" />
        <div className="h-4 w-80 rounded-lg bg-card/40" />
      </div>
      {/* KPI cards */}
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="h-32 rounded-2xl bg-card/60" />
        ))}
      </div>
      {/* Chart area */}
      <div className="grid gap-4 md:grid-cols-2">
        <div className="h-56 rounded-2xl bg-card/60" />
        <div className="h-56 rounded-2xl bg-card/60" />
      </div>
    </div>
  );
}

/**
 * DashboardHome — role-aware dashboard entry point.
 *
 * Reads the authenticated user's role from the auth store and renders
 * the matching role-specific dashboard home component. Falls back to
 * MemberHome for any authenticated user whose role is not explicitly mapped.
 *
 * The DashboardShell (sidebar + topbar + route guard) is handled by
 * the layout — this component only renders the main content area.
 */
export function DashboardHome() {
  const { role, isLoading } = useAuth();

  // Show skeleton until Zustand has rehydrated from localStorage
  if (isLoading || !role) {
    return <DashboardSkeleton />;
  }

  switch (role) {
    case ROLES.SUPER_ADMIN:
      return <SuperAdminHome />;

    case ROLES.CHURCH_ADMIN:
      return <ChurchAdminHome />;

    case ROLES.PASTOR:
      return <PastorHome />;

    case ROLES.TREASURER:
      return <TreasurerHome />;

    case ROLES.MEDIA_TEAM:
      return <MediaTeamHome />;

    case ROLES.MEMBER:
    case ROLES.VISITOR:
    default:
      return <MemberHome />;
  }
}
