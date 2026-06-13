import { MOCK_MEMBERS } from "@/features/members/data/mock-members";
import type { AttendanceSession, AttendanceRecord } from "../types/attendance.types";

// Generate standard dates relative to current date
const dayMs = 24 * 60 * 60 * 1000;
const date5DaysAgo = new Date(Date.now() - 5 * dayMs).toISOString();
const date3DaysAgo = new Date(Date.now() - 3 * dayMs).toISOString();
const date1DayAgo = new Date(Date.now() - 1 * dayMs).toISOString();
const dateToday = new Date().toISOString();

export const MOCK_SESSIONS: AttendanceSession[] = [
  {
    id: "sess-1",
    title: "Sunday Morning Worship Service",
    description: "Main congregational Sunday morning worship service and sermon teaching.",
    date: date5DaysAgo,
    type: "Service",
    status: "Completed",
    present_count: 0, // Will be computed from records
    absent_count: 0,
    excused_count: 0,
    created_at: date5DaysAgo,
    updated_at: date5DaysAgo,
  },
  {
    id: "sess-2",
    title: "Midweek Prayer & Bible Study",
    description: "Weekly interactive bible exposition and congregational prayer gathering.",
    date: date3DaysAgo,
    type: "Service",
    status: "Completed",
    present_count: 0,
    absent_count: 0,
    excused_count: 0,
    created_at: date3DaysAgo,
    updated_at: date3DaysAgo,
  },
  {
    id: "sess-3",
    title: "Youth Fellowship - Camp Night",
    description: "Young adults gathering with outdoor sports, bonfire, and group discussions.",
    date: date1DayAgo,
    type: "Ministry",
    status: "Completed",
    present_count: 0,
    absent_count: 0,
    excused_count: 0,
    created_at: date1DayAgo,
    updated_at: date1DayAgo,
  },
  {
    id: "sess-4",
    title: "Sunday First Service Check-in",
    description: "Sunday morning first service check-in portal. Active scan session.",
    date: dateToday,
    type: "Service",
    status: "Active",
    present_count: 0,
    absent_count: 0,
    excused_count: 0,
    created_at: dateToday,
    updated_at: dateToday,
  },
];

// Helper to generate records for a session
const generateMockRecords = (sessionId: string, sessionDate: string, isCompleted: boolean): AttendanceRecord[] => {
  return MOCK_MEMBERS.map((member, index) => {
    const uniqueId = `rec-${sessionId}-${member.id}`;
    const name = `${member.first_name} ${member.last_name}`;

    // If it's completed, generate varying checked-in data
    if (isCompleted) {
      // Deterministic randomness based on index
      const roll = (index * 7 + 13) % 100;
      let status: "Present" | "Absent" | "Excused" = "Present";
      let method: "QR" | "Barcode" | "Manual" | null = "QR";
      let checkInTime: string | null = null;
      let excuseNotes: string | undefined = undefined;

      if (roll < 75) {
        status = "Present";
        method = roll % 3 === 0 ? "QR" : roll % 3 === 1 ? "Barcode" : "Manual";
        // Check in sometime within 30 minutes of session start
        const timeOffset = (roll % 30) * 60 * 1000;
        checkInTime = new Date(new Date(sessionDate).getTime() + timeOffset).toISOString();
      } else if (roll < 85) {
        status = "Excused";
        method = null;
        excuseNotes = roll % 2 === 0 ? "Out of town for business trip" : "Feeling unwell, resting at home";
      } else {
        status = "Absent";
        method = null;
      }

      return {
        id: uniqueId,
        session_id: sessionId,
        member_id: member.id,
        member_name: name,
        membership_number: member.membership_number,
        gender: member.gender,
        status,
        check_in_time: checkInTime,
        check_in_method: method,
        excuse_notes: excuseNotes,
      };
    } else {
      // If active, initially everyone is Absent (unchecked)
      // Except first 3 members checked in to look interesting
      const isEarlyChecked = index < 3;
      return {
        id: uniqueId,
        session_id: sessionId,
        member_id: member.id,
        member_name: name,
        membership_number: member.membership_number,
        gender: member.gender,
        status: isEarlyChecked ? "Present" : "Absent",
        check_in_time: isEarlyChecked ? new Date().toISOString() : null,
        check_in_method: isEarlyChecked ? "QR" : null,
      };
    }
  });
};

export const MOCK_RECORDS: AttendanceRecord[] = [
  ...generateMockRecords("sess-1", date5DaysAgo, true),
  ...generateMockRecords("sess-2", date3DaysAgo, true),
  ...generateMockRecords("sess-3", date1DayAgo, true),
  ...generateMockRecords("sess-4", dateToday, false),
];

// Helper to fill session counts from records
MOCK_SESSIONS.forEach((session) => {
  const records = MOCK_RECORDS.filter((r) => r.session_id === session.id);
  session.present_count = records.filter((r) => r.status === "Present").length;
  session.absent_count = records.filter((r) => r.status === "Absent").length;
  session.excused_count = records.filter((r) => r.status === "Excused").length;
});
