import { DASHBOARD_ROUTES } from "@/constants/routes";
import { PERMISSIONS, type Permission } from "@/lib/permissions";
import type { LucideIcon } from "lucide-react";
import {
  BarChart3,
  Bell,
  BookOpen,
  Calendar,
  CheckSquare,
  DollarSign,
  Heart,
  LayoutDashboard,
  MessageSquare,
  PartyPopper,
  Radio,
  Settings,
  UserCheck,
  Users,
  Video,
} from "lucide-react";

export interface NavItem {
  label: string;
  href: string;
  icon: LucideIcon;
  permission: Permission;
  group?: "main" | "content" | "community" | "finance" | "admin";
}

export const SIDEBAR_NAV_ITEMS: NavItem[] = [
  {
    label: "Dashboard",
    href: DASHBOARD_ROUTES.ROOT,
    icon: LayoutDashboard,
    permission: PERMISSIONS.DASHBOARD_VIEW,
    group: "main",
  },
  {
    label: "Members",
    href: DASHBOARD_ROUTES.MEMBERS,
    icon: Users,
    permission: PERMISSIONS.MEMBERS_VIEW,
    group: "main",
  },
  {
    label: "Visitors",
    href: DASHBOARD_ROUTES.VISITORS,
    icon: UserCheck,
    permission: PERMISSIONS.VISITORS_VIEW,
    group: "main",
  },
  {
    label: "Follow-Up",
    href: DASHBOARD_ROUTES.FOLLOW_UP,
    icon: UserCheck,
    permission: PERMISSIONS.FOLLOW_UP_MANAGE,
    group: "main",
  },
  {
    label: "Sermons",
    href: DASHBOARD_ROUTES.SERMONS,
    icon: BookOpen,
    permission: PERMISSIONS.SERMONS_VIEW,
    group: "content",
  },
  {
    label: "Events",
    href: DASHBOARD_ROUTES.EVENTS,
    icon: Calendar,
    permission: PERMISSIONS.EVENTS_VIEW,
    group: "content",
  },
  {
    label: "Livestream",
    href: DASHBOARD_ROUTES.LIVESTREAM,
    icon: Radio,
    permission: PERMISSIONS.LIVESTREAM_VIEW,
    group: "content",
  },
  {
    label: "Media",
    href: DASHBOARD_ROUTES.MEDIA,
    icon: Video,
    permission: PERMISSIONS.MEDIA_VIEW,
    group: "content",
  },
  {
    label: "Scripture",
    href: DASHBOARD_ROUTES.SCRIPTURE,
    icon: BookOpen,
    permission: PERMISSIONS.SCRIPTURE_VIEW,
    group: "content",
  },
  {
    label: "Prayer",
    href: DASHBOARD_ROUTES.PRAYER,
    icon: Heart,
    permission: PERMISSIONS.PRAYER_VIEW,
    group: "community",
  },
  {
    label: "Testimonies",
    href: DASHBOARD_ROUTES.TESTIMONIES,
    icon: MessageSquare,
    permission: PERMISSIONS.TESTIMONIES_VIEW,
    group: "community",
  },
  {
    label: "Attendance",
    href: DASHBOARD_ROUTES.ATTENDANCE,
    icon: CheckSquare,
    permission: PERMISSIONS.ATTENDANCE_VIEW,
    group: "community",
  },
  {
    label: "Celebrations",
    href: DASHBOARD_ROUTES.CELEBRATIONS,
    icon: PartyPopper,
    permission: PERMISSIONS.CELEBRATIONS_VIEW,
    group: "community",
  },
  {
    label: "Donations",
    href: DASHBOARD_ROUTES.DONATIONS,
    icon: DollarSign,
    permission: PERMISSIONS.DONATIONS_VIEW,
    group: "finance",
  },
  {
    label: "Analytics",
    href: DASHBOARD_ROUTES.ANALYTICS,
    icon: BarChart3,
    permission: PERMISSIONS.ANALYTICS_VIEW,
    group: "admin",
  },
  {
    label: "Users",
    href: DASHBOARD_ROUTES.USERS,
    icon: Users,
    permission: PERMISSIONS.USERS_MANAGE,
    group: "admin",
  },
  {
    label: "Settings",
    href: DASHBOARD_ROUTES.SETTINGS,
    icon: Settings,
    permission: PERMISSIONS.SETTINGS_MANAGE,
    group: "admin",
  },
];

export const MOBILE_BOTTOM_NAV_ITEMS: NavItem[] = [
  {
    label: "Home",
    href: DASHBOARD_ROUTES.ROOT,
    icon: LayoutDashboard,
    permission: PERMISSIONS.DASHBOARD_VIEW,
  },
  {
    label: "Events",
    href: DASHBOARD_ROUTES.EVENTS,
    icon: Calendar,
    permission: PERMISSIONS.EVENTS_VIEW,
  },
  {
    label: "Sermons",
    href: DASHBOARD_ROUTES.SERMONS,
    icon: BookOpen,
    permission: PERMISSIONS.SERMONS_VIEW,
  },
  {
    label: "Alerts",
    href: DASHBOARD_ROUTES.NOTIFICATIONS,
    icon: Bell,
    permission: PERMISSIONS.NOTIFICATIONS_VIEW,
  },
];

export const NAV_GROUP_LABELS: Record<
  NonNullable<NavItem["group"]>,
  string
> = {
  main: "Overview",
  content: "Content",
  community: "Community",
  finance: "Finance",
  admin: "Administration",
};
