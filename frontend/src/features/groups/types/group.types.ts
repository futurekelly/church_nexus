export type GroupCategory = "Home Fellowship" | "Connect Group" | "Bible Study" | "Ministry Cell";
export type GroupRole = "Leader" | "Assistant" | "Host" | "Member" | "Visitor";
export type MeetingFrequency = "Weekly" | "Bi-Weekly" | "Monthly";
export type GroupAttendanceStatus = "Present" | "Absent" | "Excused";

// 1. ConnectGroup Model
export interface ConnectGroup {
  id: string;
  branch_id: string; // Mandatory link to Module 13 Branch
  name: string;
  description: string;
  category: GroupCategory;
  leader_id: string; // Reference to CellLeader ID / Member ID
  assistant_leader_id?: string;
  location_name: string; // e.g. "Tabata Bima Area"
  location_address: string; // Detailed physical directions
  latitude?: number;
  longitude?: number;
  frequency: MeetingFrequency;
  status: "Active" | "Inactive";
  max_members?: number;
  created_at: string;
}

// 2. CellLeader Model
export interface CellLeader {
  id: string;
  user_id?: string; // Links to authentication profile if registered
  name: string;
  email: string;
  phone: string;
  role_in_group: "Primary Leader" | "Assistant Leader";
  assigned_at: string;
}

// 3. GroupMember Model
export interface GroupMember {
  id: string;
  group_id: string;
  member_id?: string; // Link to core Member profile if linked
  name: string;
  phone: string;
  email?: string;
  role: GroupRole;
  joined_at: string;
  status: "Active" | "Inactive";
}

// 4. MeetingSchedule Model
export interface MeetingSchedule {
  id: string;
  group_id: string;
  day_of_week: "Sunday" | "Monday" | "Tuesday" | "Wednesday" | "Thursday" | "Friday" | "Saturday";
  start_time: string; // e.g. "18:30" (HH:MM 24-hr format)
  end_time: string; // e.g. "20:00"
  special_instructions?: string;
}

// 5. GroupAttendance Record Model
export interface GroupAttendance {
  id: string;
  group_id: string;
  meeting_date: string; // YYYY-MM-DD
  submitted_by: string; // User ID of submitting leader
  submitted_at: string;
  attendees: {
    member_id: string;
    attended: boolean;
    status: GroupAttendanceStatus;
    notes?: string;
  }[];
  visitor_count: number;
  study_topic?: string;
  offering_amount?: number; // Financial component
  currency?: string; // e.g. "TZS", "KES"
}

// 6. Connect Group Prayer Request Model
export interface GroupPrayerRequest {
  id: string;
  group_id: string;
  submitted_by_name: string;
  request_text: string;
  is_anonymous: boolean;
  status: "Active" | "Answered" | "Archived";
  created_at: string;
  shared_with_branch?: boolean;
}

// 7. StudyOutline (Weekly Curricula) Model
export interface StudyOutline {
  id: string;
  title: string;
  theme: string;
  scripture_references: string[];
  introduction: string;
  discussion_questions: string[];
  application: string;
  published_at: string;
  created_by: string; // Pastor / Admin user ID
}
