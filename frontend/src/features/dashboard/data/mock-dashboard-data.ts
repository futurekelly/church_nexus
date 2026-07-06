// ─────────────────────────────────────────────────────────────────
// Mock data for all role-specific dashboard home pages.
// Replace with real API calls when the backend is connected.
// ─────────────────────────────────────────────────────────────────

export interface KpiStat {
  id: string;
  label: string;
  value: string;
  trend: number; // positive = up, negative = down
  trendLabel: string;
  icon: string; // Lucide icon name
  accentColor: "primary" | "secondary" | "success" | "warning";
}

export interface QuickAction {
  id: string;
  label: string;
  description: string;
  icon: string;
  href: string;
  accent: "primary" | "secondary" | "success" | "warning";
}

export interface ActivityItem {
  id: string;
  actor: string;
  action: string;
  subject: string;
  timestamp: string;
  type: "member" | "finance" | "media" | "prayer" | "event" | "system";
}

export interface ChartDataPoint {
  label: string;
  value: number;
  value2?: number;
}

// ─── Super Admin ─────────────────────────────────────────────────

export const superAdminKpis: KpiStat[] = [
  {
    id: "total-members",
    label: "Total Members",
    value: "1,248",
    trend: 12,
    trendLabel: "vs last month",
    icon: "Users",
    accentColor: "primary",
  },
  {
    id: "active-users",
    label: "Active Users",
    value: "847",
    trend: 8,
    trendLabel: "vs last week",
    icon: "UserCheck",
    accentColor: "success",
  },
  {
    id: "monthly-donations",
    label: "Monthly Donations",
    value: "TSh 284,500",
    trend: 18,
    trendLabel: "vs last month",
    icon: "TrendingUp",
    accentColor: "secondary",
  },
  {
    id: "events",
    label: "Events This Month",
    value: "12",
    trend: 3,
    trendLabel: "vs last month",
    icon: "Calendar",
    accentColor: "warning",
  },
  {
    id: "audit-events",
    label: "Audit Events Today",
    value: "34",
    trend: -5,
    trendLabel: "vs yesterday",
    icon: "ShieldCheck",
    accentColor: "success",
  },
  {
    id: "system-health",
    label: "System Health",
    value: "99.8%",
    trend: 0.1,
    trendLabel: "uptime this month",
    icon: "Activity",
    accentColor: "success",
  },
];

export const superAdminQuickActions: QuickAction[] = [
  {
    id: "manage-users",
    label: "Manage Users",
    description: "View, edit, and manage all platform users",
    icon: "Users",
    href: "/dashboard/users",
    accent: "primary",
  },
  {
    id: "assign-roles",
    label: "Assign Roles",
    description: "Update user roles and permissions",
    icon: "ShieldCheck",
    href: "/dashboard/users/roles",
    accent: "secondary",
  },
  {
    id: "system-settings",
    label: "System Settings",
    description: "Configure platform-wide settings",
    icon: "Settings",
    href: "/dashboard/settings",
    accent: "warning",
  },
  {
    id: "view-audit",
    label: "Audit Logs",
    description: "Review all system audit events",
    icon: "FileText",
    href: "/dashboard/settings",
    accent: "success",
  },
];

export const superAdminActivity: ActivityItem[] = [
  {
    id: "a1",
    actor: "Baraka Said",
    action: "joined as",
    subject: "Church Member",
    timestamp: "5 minutes ago",
    type: "member",
  },
  {
    id: "a2",
    actor: "Neema Mushi",
    action: "donated",
    subject: "TSh 5,000 to General Fund",
    timestamp: "22 minutes ago",
    type: "finance",
  },
  {
    id: "a3",
    actor: "Pastor David",
    action: "published sermon",
    subject: "Walking in Faith",
    timestamp: "1 hour ago",
    type: "media",
  },
  {
    id: "a4",
    actor: "Admin Mary",
    action: "created event",
    subject: "Youth Conference 2026",
    timestamp: "2 hours ago",
    type: "event",
  },
  {
    id: "a5",
    actor: "System",
    action: "role changed for",
    subject: "Samuel Ochieng → Treasurer",
    timestamp: "3 hours ago",
    type: "system",
  },
  {
    id: "a6",
    actor: "Media Team",
    action: "uploaded",
    subject: "Sunday Worship Recording",
    timestamp: "5 hours ago",
    type: "media",
  },
];

export const memberGrowthData: ChartDataPoint[] = [
  { label: "Jan", value: 1050 },
  { label: "Feb", value: 1092 },
  { label: "Mar", value: 1120 },
  { label: "Apr", value: 1175 },
  { label: "May", value: 1210 },
  { label: "Jun", value: 1248 },
];

export const donationTrendData: ChartDataPoint[] = [
  { label: "Jan", value: 215000 },
  { label: "Feb", value: 198000 },
  { label: "Mar", value: 242000 },
  { label: "Apr", value: 267000 },
  { label: "May", value: 253000 },
  { label: "Jun", value: 284500 },
];

// ─── Church Admin ─────────────────────────────────────────────────

export const churchAdminKpis: KpiStat[] = [
  {
    id: "total-members",
    label: "Total Members",
    value: "1,248",
    trend: 12,
    trendLabel: "vs last month",
    icon: "Users",
    accentColor: "primary",
  },
  {
    id: "new-visitors",
    label: "New Visitors",
    value: "23",
    trend: 5,
    trendLabel: "this week",
    icon: "UserPlus",
    accentColor: "success",
  },
  {
    id: "events",
    label: "Events This Month",
    value: "12",
    trend: 3,
    trendLabel: "vs last month",
    icon: "Calendar",
    accentColor: "secondary",
  },
  {
    id: "attendance",
    label: "Attendance Rate",
    value: "87%",
    trend: 4,
    trendLabel: "vs last Sunday",
    icon: "CheckCircle",
    accentColor: "success",
  },
  {
    id: "followup",
    label: "Follow-Up Pending",
    value: "7",
    trend: -2,
    trendLabel: "vs last week",
    icon: "Clock",
    accentColor: "warning",
  },
];

export const churchAdminQuickActions: QuickAction[] = [
  {
    id: "register-member",
    label: "Register Member",
    description: "Add a new church member to the system",
    icon: "UserPlus",
    href: "/dashboard/members/create",
    accent: "primary",
  },
  {
    id: "create-event",
    label: "Create Event",
    description: "Schedule a new church event or service",
    icon: "CalendarPlus",
    href: "/dashboard/events/create",
    accent: "secondary",
  },
  {
    id: "track-attendance",
    label: "Track Attendance",
    description: "Record today's service attendance",
    icon: "CheckSquare",
    href: "/dashboard/members",
    accent: "success",
  },
  {
    id: "view-visitors",
    label: "View Visitors",
    description: "Manage first-time visitor follow-ups",
    icon: "Eye",
    href: "/dashboard/visitors",
    accent: "warning",
  },
];

export const churchAdminActivity: ActivityItem[] = [
  {
    id: "ca1",
    actor: "Jane Akinyi",
    action: "registered as",
    subject: "new member",
    timestamp: "10 minutes ago",
    type: "member",
  },
  {
    id: "ca2",
    actor: "Peter Kamau",
    action: "RSVP'd to",
    subject: "Youth Conference 2026",
    timestamp: "35 minutes ago",
    type: "event",
  },
  {
    id: "ca3",
    actor: "Admin",
    action: "marked follow-up complete for",
    subject: "Mary Njeri",
    timestamp: "2 hours ago",
    type: "member",
  },
  {
    id: "ca4",
    actor: "3 visitors",
    action: "checked in for",
    subject: "Sunday Service",
    timestamp: "3 hours ago",
    type: "event",
  },
  {
    id: "ca5",
    actor: "Admin",
    action: "created event",
    subject: "Ladies Fellowship — July",
    timestamp: "Yesterday",
    type: "event",
  },
];

export const attendanceTrendData: ChartDataPoint[] = [
  { label: "Jan", value: 420 },
  { label: "Feb", value: 398 },
  { label: "Mar", value: 445 },
  { label: "Apr", value: 460 },
  { label: "May", value: 478 },
  { label: "Jun", value: 491 },
];

// ─── Pastor ──────────────────────────────────────────────────────

export const pastorKpis: KpiStat[] = [
  {
    id: "prayer-requests",
    label: "Prayer Requests",
    value: "34",
    trend: 6,
    trendLabel: "this week",
    icon: "Heart",
    accentColor: "primary",
  },
  {
    id: "testimonies",
    label: "Pending Testimonies",
    value: "8",
    trend: 3,
    trendLabel: "awaiting approval",
    icon: "MessageSquare",
    accentColor: "warning",
  },
  {
    id: "sermons",
    label: "Sermons Published",
    value: "47",
    trend: 2,
    trendLabel: "this month",
    icon: "BookOpen",
    accentColor: "success",
  },
  {
    id: "livestreams",
    label: "Livestreams",
    value: "6",
    trend: 1,
    trendLabel: "this month",
    icon: "Radio",
    accentColor: "secondary",
  },
];

export const pastorQuickActions: QuickAction[] = [
  {
    id: "create-sermon",
    label: "Create Sermon",
    description: "Upload a new sermon to the library",
    icon: "BookOpen",
    href: "/dashboard/sermons/create",
    accent: "primary",
  },
  {
    id: "publish-devotional",
    label: "Publish Scripture",
    description: "Set today's daily scripture passage",
    icon: "BookMarked",
    href: "/dashboard/scripture",
    accent: "success",
  },
  {
    id: "start-livestream",
    label: "Start Livestream",
    description: "Go live for a church service or meeting",
    icon: "Radio",
    href: "/dashboard/livestream",
    accent: "secondary",
  },
  {
    id: "view-prayer",
    label: "Prayer Requests",
    description: "Review and respond to prayer needs",
    icon: "Heart",
    href: "/dashboard/prayer",
    accent: "warning",
  },
];

export const pastorActivity: ActivityItem[] = [
  {
    id: "pa1",
    actor: "Anonymous",
    action: "submitted prayer request:",
    subject: "Healing for family member",
    timestamp: "8 minutes ago",
    type: "prayer",
  },
  {
    id: "pa2",
    actor: "Grace Wambui",
    action: "submitted testimony:",
    subject: "God's Provision in Hardship",
    timestamp: "1 hour ago",
    type: "prayer",
  },
  {
    id: "pa3",
    actor: "David Omondi",
    action: "requested prayer for",
    subject: "Business breakthrough",
    timestamp: "2 hours ago",
    type: "prayer",
  },
  {
    id: "pa4",
    actor: "Pastor",
    action: "marked prayer answered for",
    subject: "Ruth's request",
    timestamp: "Yesterday",
    type: "prayer",
  },
  {
    id: "pa5",
    actor: "15 members",
    action: "watched sermon",
    subject: "The Power of Faith",
    timestamp: "Yesterday",
    type: "media",
  },
];

export const scriptureOfTheDay = {
  verse: "For I know the plans I have for you, declares the Lord, plans to prosper you and not to harm you, plans to give you hope and a future.",
  reference: "Jeremiah 29:11",
  reflection: "Trust in God's perfect plan for your life. Even in uncertainty, His purpose for you remains unchanging.",
};

// ─── Treasurer ────────────────────────────────────────────────────

export const treasurerKpis: KpiStat[] = [
  {
    id: "monthly-donations",
    label: "Monthly Donations",
    value: "TSh 284,500",
    trend: 18,
    trendLabel: "vs last month",
    icon: "DollarSign",
    accentColor: "success",
  },
  {
    id: "tithes",
    label: "Tithes Collected",
    value: "TSh 198,000",
    trend: 12,
    trendLabel: "vs last month",
    icon: "TrendingUp",
    accentColor: "primary",
  },
  {
    id: "offerings",
    label: "Offerings",
    value: "TSh 86,500",
    trend: 9,
    trendLabel: "vs last month",
    icon: "Gift",
    accentColor: "secondary",
  },
  {
    id: "annual-total",
    label: "Year-to-Date",
    value: "TSh 2.1M",
    trend: 22,
    trendLabel: "vs last year",
    icon: "BarChart2",
    accentColor: "success",
  },
];

export const treasurerQuickActions: QuickAction[] = [
  {
    id: "export-report",
    label: "Export Report",
    description: "Generate and download financial reports",
    icon: "Download",
    href: "/dashboard/donations/reports",
    accent: "primary",
  },
  {
    id: "view-transactions",
    label: "View Transactions",
    description: "Browse full donation history",
    icon: "List",
    href: "/dashboard/donations/history",
    accent: "secondary",
  },
  {
    id: "donation-analytics",
    label: "Donation Analytics",
    description: "Insights on giving trends and patterns",
    icon: "PieChart",
    href: "/dashboard/analytics",
    accent: "success",
  },
];

export const treasurerActivity: ActivityItem[] = [
  {
    id: "tr1",
    actor: "Neema Mushi",
    action: "donated",
    subject: "TSh 10,000 — Tithe",
    timestamp: "22 minutes ago",
    type: "finance",
  },
  {
    id: "tr2",
    actor: "Juma Said",
    action: "donated",
    subject: "TSh 5,000 — Offering",
    timestamp: "1 hour ago",
    type: "finance",
  },
  {
    id: "tr3",
    actor: "Bahati Mtui",
    action: "donated",
    subject: "TSh 2,500 — Building Fund",
    timestamp: "2 hours ago",
    type: "finance",
  },
  {
    id: "tr4",
    actor: "Anonymous",
    action: "donated",
    subject: "TSh 1,000 — General",
    timestamp: "3 hours ago",
    type: "finance",
  },
  {
    id: "tr5",
    actor: "System",
    action: "generated report",
    subject: "May 2026 Financial Summary",
    timestamp: "Yesterday",
    type: "finance",
  },
];

export const revenueData: ChartDataPoint[] = [
  { label: "Jan", value: 215000, value2: 178000 },
  { label: "Feb", value: 198000, value2: 162000 },
  { label: "Mar", value: 242000, value2: 195000 },
  { label: "Apr", value: 267000, value2: 220000 },
  { label: "May", value: 253000, value2: 210000 },
  { label: "Jun", value: 284500, value2: 235000 },
];

// ─── Media Team ───────────────────────────────────────────────────

export const mediaTeamKpis: KpiStat[] = [
  {
    id: "livestreams",
    label: "Livestreams",
    value: "6",
    trend: 1,
    trendLabel: "this month",
    icon: "Radio",
    accentColor: "primary",
  },
  {
    id: "media-files",
    label: "Total Media Files",
    value: "234",
    trend: 18,
    trendLabel: "added this month",
    icon: "Film",
    accentColor: "secondary",
  },
  {
    id: "views",
    label: "Views This Month",
    value: "4,892",
    trend: 34,
    trendLabel: "vs last month",
    icon: "Eye",
    accentColor: "success",
  },
  {
    id: "upload-queue",
    label: "Upload Queue",
    value: "3",
    trend: 0,
    trendLabel: "pending processing",
    icon: "Upload",
    accentColor: "warning",
  },
];

export const mediaTeamQuickActions: QuickAction[] = [
  {
    id: "upload-media",
    label: "Upload Media",
    description: "Add videos, images or audio to library",
    icon: "Upload",
    href: "/dashboard/media/upload",
    accent: "primary",
  },
  {
    id: "schedule-stream",
    label: "Schedule Stream",
    description: "Plan an upcoming livestream event",
    icon: "CalendarPlus",
    href: "/dashboard/livestream",
    accent: "secondary",
  },
  {
    id: "manage-gallery",
    label: "Media Gallery",
    description: "Browse and manage all media files",
    icon: "Grid",
    href: "/dashboard/media",
    accent: "success",
  },
];

export const mediaTeamActivity: ActivityItem[] = [
  {
    id: "mt1",
    actor: "Media Team",
    action: "uploaded",
    subject: "Sunday Worship Highlights",
    timestamp: "15 minutes ago",
    type: "media",
  },
  {
    id: "mt2",
    actor: "System",
    action: "processing complete for",
    subject: "Sermon: The Power of Prayer.mp4",
    timestamp: "45 minutes ago",
    type: "media",
  },
  {
    id: "mt3",
    actor: "Media Team",
    action: "started livestream",
    subject: "Wednesday Bible Study",
    timestamp: "2 hours ago",
    type: "media",
  },
  {
    id: "mt4",
    actor: "Media Team",
    action: "moderated chat for",
    subject: "Sunday Service Stream",
    timestamp: "Yesterday",
    type: "media",
  },
];

export const uploadQueueItems = [
  { id: "uq1", name: "Sunday Sermon June 8.mp4", progress: 72, size: "1.4 GB" },
  { id: "uq2", name: "Choir Practice Recording.mp3", progress: 100, size: "82 MB" },
  { id: "uq3", name: "Baptism Photos June 2026.zip", progress: 45, size: "340 MB" },
];

// ─── Member ───────────────────────────────────────────────────────

export const memberKpis: KpiStat[] = [
  {
    id: "events",
    label: "Events Registered",
    value: "4",
    trend: 2,
    trendLabel: "upcoming",
    icon: "Calendar",
    accentColor: "primary",
  },
  {
    id: "prayer",
    label: "Prayer Requests",
    value: "2",
    trend: 0,
    trendLabel: "submitted",
    icon: "Heart",
    accentColor: "success",
  },
  {
    id: "sermons",
    label: "Sermons Watched",
    value: "18",
    trend: 3,
    trendLabel: "this month",
    icon: "BookOpen",
    accentColor: "secondary",
  },
  {
    id: "days-active",
    label: "Days Active",
    value: "45",
    trend: 7,
    trendLabel: "streak",
    icon: "Flame",
    accentColor: "warning",
  },
];

export const memberQuickActions: QuickAction[] = [
  {
    id: "submit-prayer",
    label: "Submit Prayer",
    description: "Share your prayer request with the community",
    icon: "Heart",
    href: "/dashboard/prayer/create",
    accent: "primary",
  },
  {
    id: "register-event",
    label: "Register for Event",
    description: "Browse and join upcoming church events",
    icon: "CalendarCheck",
    href: "/dashboard/events",
    accent: "secondary",
  },
  {
    id: "watch-sermons",
    label: "Watch Sermons",
    description: "Explore the sermon library",
    icon: "PlayCircle",
    href: "/dashboard/sermons",
    accent: "success",
  },
  {
    id: "give",
    label: "Give Offering",
    description: "Make a tithe or offering online",
    icon: "Gift",
    href: "/dashboard/donations",
    accent: "warning",
  },
];

export const memberActivity: ActivityItem[] = [
  {
    id: "me1",
    actor: "You",
    action: "registered for",
    subject: "Youth Conference 2026",
    timestamp: "2 hours ago",
    type: "event",
  },
  {
    id: "me2",
    actor: "You",
    action: "watched sermon",
    subject: "Walking in Faith — Pastor David",
    timestamp: "Yesterday",
    type: "media",
  },
  {
    id: "me3",
    actor: "You",
    action: "submitted prayer request",
    subject: "Guidance for career decision",
    timestamp: "2 days ago",
    type: "prayer",
  },
  {
    id: "me4",
    actor: "You",
    action: "gave offering",
    subject: "TSh 2,000",
    timestamp: "Last Sunday",
    type: "finance",
  },
];

export const upcomingEvents = [
  {
    id: "ev1",
    title: "Sunday Worship Service",
    date: "Sun, Jun 15, 2026",
    time: "9:00 AM",
    location: "Main Sanctuary",
    registered: true,
  },
  {
    id: "ev2",
    title: "Youth Conference 2026",
    date: "Sat, Jun 21, 2026",
    time: "10:00 AM",
    location: "Church Hall",
    registered: true,
  },
  {
    id: "ev3",
    title: "Men's Fellowship Breakfast",
    date: "Sat, Jun 28, 2026",
    time: "8:00 AM",
    location: "Fellowship Room",
    registered: false,
  },
];
