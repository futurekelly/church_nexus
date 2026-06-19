import type { Notification, Announcement, NotificationPreference, NotificationTemplate, NotificationChannel } from "../types/notification.types";

export const MOCK_NOTIFICATIONS: Notification[] = [
  {
    id: "notif-001",
    user_id: "m001", // Kelvin Mbise (Admin)
    title: "New Testimony Submitted",
    message: "A new testimony 'Miraculous Healing' has been submitted for review.",
    priority: "Medium",
    status: "Sent",
    read: false,
    delivered_at: "2026-06-14T15:00:00Z",
    read_at: null,
    action_url: "/dashboard/testimonies",
    delivery_channel: "In-App",
    branch_id: "branch-001",
    created_at: "2026-06-14T15:00:00Z",
    is_archived: false,
    deleted_at: null
  },
  {
    id: "notif-002",
    user_id: "m001",
    title: "Monthly Financial Close Alert",
    message: "Please review the treasurer budget ledger closing files for May.",
    priority: "High",
    status: "Sent",
    read: true,
    delivered_at: "2026-06-01T08:00:00Z",
    read_at: "2026-06-01T09:15:00Z",
    action_url: "/dashboard/donations/reports",
    delivery_channel: "In-App",
    branch_id: "branch-001",
    created_at: "2026-06-01T08:00:00Z",
    is_archived: false,
    deleted_at: null
  },
  {
    id: "notif-003",
    user_id: "m002", // Pastor Emmanuel Massawe
    title: "Urgent Prayer Request",
    message: "A family in Tabata campus has requested emergency prayer.",
    priority: "Critical",
    status: "Sent",
    read: false,
    delivered_at: "2026-06-14T18:30:00Z",
    read_at: null,
    action_url: "/dashboard/prayer",
    delivery_channel: "In-App",
    branch_id: "branch-001",
    created_at: "2026-06-14T18:30:00Z",
    is_archived: false,
    deleted_at: null
  }
];

export const MOCK_ANNOUNCEMENTS: Announcement[] = [
  {
    id: "ann-001",
    title: "Global Joint Worship Sunday Service",
    message: "All branches will assemble at Tabata HQ Campus this coming Sunday for a joint praise service.",
    status: "Published",
    audience_scope: "Global",
    branch_id: null,
    priority: "High",
    created_by: "m001",
    published_at: "2026-06-12T08:00:00Z",
    created_at: "2026-06-12T07:30:00Z"
  },
  {
    id: "ann-002",
    title: "Sinza Campus Youth Seminar",
    message: "Youth Seminar on Business Ethics will take place this Saturday starting at 10:00 AM.",
    status: "Published",
    audience_scope: "Branch",
    branch_id: "branch-002", // Sinza Campus
    priority: "Normal",
    created_by: "ldr-002",
    published_at: "2026-06-13T10:00:00Z",
    created_at: "2026-06-13T09:00:00Z"
  },
  {
    id: "ann-003",
    title: "Leadership Board Closed Meeting",
    message: "Urgent planning session for pastors, admins, and treasurers concerning regional plant budgets.",
    status: "Scheduled",
    audience_scope: "Custom",
    branch_id: null,
    target_roles: ["Pastor", "Treasurer", "Church Admin"],
    priority: "Urgent",
    created_by: "m001",
    scheduled_at: "2026-06-16T12:00:00Z",
    created_at: "2026-06-14T11:00:00Z"
  },
  {
    id: "ann-004",
    title: "Arusha Campus Launch Outline",
    message: "Drafting the logistical outline for launching the Arusha branch campus.",
    status: "Draft",
    audience_scope: "Branch",
    branch_id: "branch-001",
    priority: "Normal",
    created_by: "m001",
    created_at: "2026-06-14T16:00:00Z"
  }
];

export const MOCK_NOTIF_PREFERENCES: NotificationPreference[] = [
  {
    user_id: "m001",
    email_enabled: true,
    sms_enabled: true,
    in_app_enabled: true,
    push_enabled: true,
    prayer_updates: true,
    giving_receipts: true,
    event_reminders: true
  },
  {
    user_id: "m002",
    email_enabled: true,
    sms_enabled: false,
    in_app_enabled: true,
    push_enabled: true,
    prayer_updates: true,
    giving_receipts: false,
    event_reminders: true
  }
];

export const MOCK_TEMPLATES: NotificationTemplate[] = [
  {
    id: "tmpl-001",
    template_code: "GIVING_CONFIRM",
    subject_template: "Shukrani kwa Utoaji Wako - {{church_name}}",
    body_template: "Habari {{name}},\n\nTungependa kukushukuru kwa mchango wako wa {{amount}} kupitia {{provider}} tarehe {{date}}. Mungu akubariki!",
    channels: ["Email", "SMS"],
    language: "sw"
  },
  {
    id: "tmpl-002",
    template_code: "EVENT_REMINDER",
    subject_template: "Reminder: {{event_name}} Coming Up!",
    body_template: "Dear {{name}},\n\nThis is a quick reminder that {{event_name}} will take place at our {{branch_name}} campus on {{date}} at {{time}}. We look forward to seeing you!",
    channels: ["Email", "Push"],
    language: "en"
  }
];

export const MOCK_CHANNELS: NotificationChannel[] = [
  {
    id: "chan-001",
    provider_name: "Twilio",
    channel_type: "SMS",
    api_key: "ACxxxx_mock_key_twilio",
    sender_identity: "NEXUS_SMS",
    status: "Active"
  },
  {
    id: "chan-002",
    provider_name: "SendGrid",
    channel_type: "Email",
    api_key: "SG.xxxx_mock_key_sendgrid",
    sender_identity: "no-reply@churchnexus.org",
    status: "Active"
  },
  {
    id: "chan-003",
    provider_name: "FCM",
    channel_type: "Push",
    api_key: "firebase_server_key_mock",
    sender_identity: "ChurchNexusPush",
    status: "Active"
  }
];
