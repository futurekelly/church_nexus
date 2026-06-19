export type NotificationPriority = "Low" | "Medium" | "High" | "Critical";
export type NotificationStatus = "Sent" | "Failed" | "Pending";
export type DeliveryChannelType = "In-App" | "Email" | "SMS" | "Push";

export interface Notification {
  id: string; // UUID v4 format
  user_id: string; // Recipient user ID
  title: string;
  message: string;
  priority: NotificationPriority;
  status: NotificationStatus;
  read: boolean;
  
  // Analytics Tracking
  delivered_at: string | null;
  read_at: string | null;
  
  // Mobile Deep-Link Support
  action_url?: string;
  
  delivery_channel: DeliveryChannelType;
  branch_id?: string;
  created_at: string;

  // Final Schema Enhancements
  is_archived?: boolean;
  deleted_at?: string | null;
}

export type AnnouncementStatus = "Draft" | "Scheduled" | "Published" | "Archived";
export type AudienceScope = "Global" | "Branch" | "Leaders" | "Members" | "Visitors" | "Custom";

export interface Announcement {
  id: string;
  title: string;
  message: string;
  status: AnnouncementStatus;
  audience_scope: AudienceScope;
  branch_id: string | null; // null if Global
  target_roles?: string[]; // E.g. ["Pastor", "Treasurer"] for Custom targeting
  priority: "Normal" | "High" | "Urgent";
  created_by: string; // Author user ID
  scheduled_at?: string | null;
  published_at?: string | null;
  created_at: string;
}

export interface NotificationPreference {
  user_id: string;
  email_enabled: boolean;
  sms_enabled: boolean;
  in_app_enabled: boolean;
  push_enabled: boolean;
  prayer_updates: boolean;
  giving_receipts: boolean;
  event_reminders: boolean;
}

export interface NotificationTemplate {
  id: string;
  template_code: string; // e.g. "WELCOME_VISITOR"
  subject_template?: string;
  body_template: string;
  channels: ("Email" | "SMS" | "Push")[];
  language: "en" | "sw";
}

export interface NotificationChannel {
  id: string;
  provider_name: "Twilio" | "SendGrid" | "FCM" | "Infobip";
  channel_type: "Email" | "SMS" | "Push";
  api_key: string;
  sender_identity: string;
  status: "Active" | "Inactive";
}
