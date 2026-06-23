import type { VisitorProfile, FollowUpTicket, ContactHistoryLog } from "../types/follow-up.types";

const dayMs = 24 * 60 * 60 * 1000;
const date10DaysAgo = new Date(Date.now() - 10 * dayMs).toISOString();
const date7DaysAgo = new Date(Date.now() - 7 * dayMs).toISOString();
const date4DaysAgo = new Date(Date.now() - 4 * dayMs).toISOString();
const date2DaysAgo = new Date(Date.now() - 2 * dayMs).toISOString();
const date1DayAgo = new Date(Date.now() - 1 * dayMs).toISOString();
const dateToday = new Date().toISOString();

export const MOCK_VISITOR_PROFILES: VisitorProfile[] = [
  {
    id: "vis-1",
    membership_number: "VST-2026-001",
    first_name: "Carol",
    last_name: "Auma",
    email: "carol.auma@email.com",
    phone_number: "+254 755 678 901",
    gender: "female",
    date_joined: date10DaysAgo,
    first_time_visitor: true,
    invited_by: "Outreach Event",
    visit_reason: "Seeking a new church community closer to home.",
    spiritual_background: "Exploring Faith",
    prayer_request: "For family health and guidance in career transitions.",
    notes: "Very receptive and friendly. Met during the Easter outreach park event.",
  },
  {
    id: "vis-2",
    membership_number: "VST-2026-002",
    first_name: "Peter",
    last_name: "Njoroge",
    email: "peter.njoroge@email.com",
    phone_number: "+254 711 222 333",
    gender: "male",
    date_joined: date7DaysAgo,
    first_time_visitor: true,
    invited_by: "Friend",
    visit_reason: "Invited by his neighbor David Kamau.",
    spiritual_background: "Christian",
    notes: "Recently relocated from Nakuru. Looking for a bible-believing fellowship.",
  },
  {
    id: "vis-3",
    membership_number: "VST-2026-003",
    first_name: "Sarah",
    last_name: "Mwangi",
    email: "sarah.mwangi@email.com",
    phone_number: "+254 722 333 444",
    gender: "female",
    date_joined: date4DaysAgo,
    first_time_visitor: true,
    invited_by: "Social Media",
    visit_reason: "Saw a Facebook broadcast post of Sunday service.",
    spiritual_background: "New Believer",
    prayer_request: "Strength to walk in her new faith journey.",
    notes: "Wants to join the young adults Bible study fellowship.",
  },
  {
    id: "vis-4",
    membership_number: "VST-2026-004",
    first_name: "John",
    last_name: "Otieno",
    email: "john.otieno@email.com",
    phone_number: "+254 733 444 555",
    gender: "male",
    date_joined: date10DaysAgo,
    first_time_visitor: false,
    invited_by: "Walk In",
    visit_reason: "Walking past and decided to join Sunday service.",
    spiritual_background: "Christian",
    notes: "Highly active. Completed membership classes and ready to register.",
  },
];

export const MOCK_FOLLOW_UP_TICKETS: FollowUpTicket[] = [
  {
    id: "tkt-1",
    visitor_id: "vis-1",
    visitor_name: "Carol Auma",
    status: "New",
    source: "Event RSVP",
    notes: "Registered during Easter park outreach. Needs initial welcoming phone call.",
    created_at: date10DaysAgo,
    updated_at: date10DaysAgo,
    is_completed: false,
  },
  {
    id: "tkt-2",
    visitor_id: "vis-2",
    visitor_name: "Peter Njoroge",
    status: "Contacted",
    source: "Manual",
    assigned_pastor: "Pastor David",
    notes: "Called on Monday. Had a long conversation. Relocated recently. Scheduled to meet this Sunday.",
    created_at: date7DaysAgo,
    updated_at: date4DaysAgo,
    is_completed: false,
  },
  {
    id: "tkt-3",
    visitor_id: "vis-3",
    visitor_name: "Sarah Mwangi",
    status: "Following Up",
    source: "Manual",
    assigned_pastor: "Pastor Sarah",
    notes: "Spoke via phone. Invited to attend the Youth Camp Night this Friday.",
    created_at: date4DaysAgo,
    updated_at: date2DaysAgo,
    is_completed: false,
  },
  {
    id: "tkt-4",
    visitor_id: "vis-4",
    visitor_name: "John Otieno",
    status: "Integrated",
    source: "Attendance Visitor Scan",
    notes: "Scan registration complete. Attended membership classes. Transitioned to full member status.",
    created_at: date10DaysAgo,
    updated_at: dateToday,
    is_completed: true,
    converted_member_id: "m026", // Simulated member index
  },
];

export const MOCK_CONTACT_LOGS: ContactHistoryLog[] = [
  {
    id: "log-1",
    visitor_id: "vis-2",
    interaction_type: "Call",
    notes: "Welcomed him to the city. Explained church service options. Peter expressed interest in mid-week prayer services.",
    contact_date: date4DaysAgo,
    contacted_by: "Pastor David",
  },
  {
    id: "log-2",
    visitor_id: "vis-3",
    interaction_type: "Call",
    notes: "Spoke to Sarah. Shared details about our young adults ministry. Sent links to study materials.",
    contact_date: date2DaysAgo,
    contacted_by: "Pastor Sarah",
  },
  {
    id: "log-3",
    visitor_id: "vis-4",
    interaction_type: "Meeting",
    notes: "Met John after service. He completed the membership welcome class questionnaire.",
    contact_date: date7DaysAgo,
    contacted_by: "Pastor David",
  },
  {
    id: "log-4",
    visitor_id: "vis-4",
    interaction_type: "Visit",
    notes: "Brief home visit by cell group leader Kamau. John hosted the cell group meeting this week.",
    contact_date: date2DaysAgo,
    contacted_by: "Elder Kamau",
  },
];
