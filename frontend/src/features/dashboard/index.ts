// Shell components
export { DashboardShell } from "@/features/dashboard/components/shell/dashboard-shell";
export { DashboardRouteGuard } from "@/features/dashboard/components/shell/dashboard-route-guard";
export { DashboardSidebar } from "@/features/dashboard/components/shell/dashboard-sidebar";
export { DashboardTopbar } from "@/features/dashboard/components/shell/dashboard-topbar";
export { DashboardBreadcrumbs } from "@/features/dashboard/components/shell/dashboard-breadcrumbs";
export { NotificationDropdown } from "@/features/dashboard/components/shell/notification-dropdown";
export { UserProfileDropdown } from "@/features/dashboard/components/shell/user-profile-dropdown";
export { MobileDashboardNav } from "@/features/dashboard/components/shell/mobile-dashboard-nav";

// Home — role-aware dashboard entry point
export { DashboardHome } from "@/features/dashboard/components/home/dashboard-home";
export { SuperAdminHome } from "@/features/dashboard/components/home/super-admin-home";
export { ChurchAdminHome } from "@/features/dashboard/components/home/church-admin-home";
export { PastorHome } from "@/features/dashboard/components/home/pastor-home";
export { TreasurerHome } from "@/features/dashboard/components/home/treasurer-home";
export { MediaTeamHome } from "@/features/dashboard/components/home/media-team-home";
export { MemberHome } from "@/features/dashboard/components/home/member-home";

// Shared widgets
export { KpiCard } from "@/features/dashboard/components/widgets/kpi-card";
export { QuickActionCard } from "@/features/dashboard/components/widgets/quick-action-card";
export { ActivityFeed } from "@/features/dashboard/components/widgets/activity-feed";
export { ChartCard } from "@/features/dashboard/components/widgets/chart-card";
export { SectionHeader } from "@/features/dashboard/components/widgets/section-header";

// Hooks
export { useDashboardNavigation } from "@/features/dashboard/hooks/use-dashboard-navigation";
