import type { Event, EventResource, ResourceBooking, EventRegistration } from "../types/event.types";

const createSvgPlaceholder = (title: string, color1: string, color2: string) => {
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="800" height="500" viewBox="0 0 800 500">
    <defs>
      <linearGradient id="g" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" style="stop-color:${color1};stop-opacity:1" />
        <stop offset="100%" style="stop-color:${color2};stop-opacity:1" />
      </linearGradient>
    </defs>
    <rect width="100%" height="100%" fill="url(#g)" />
    <circle cx="400" cy="250" r="150" fill="white" opacity="0.05" />
    <circle cx="150" cy="150" r="80" fill="white" opacity="0.03" />
    <circle cx="650" cy="350" r="120" fill="white" opacity="0.04" />
    <text x="50%" y="50%" dominant-baseline="middle" text-anchor="middle" font-family="system-ui, sans-serif" font-weight="bold" font-size="44" fill="white" opacity="0.85">
      ${title}
    </text>
  </svg>`;
  return `data:image/svg+xml;utf8,${encodeURIComponent(svg)}`;
};

const now = new Date();
const daysFromNow = (d: number, hour = 9) => {
  const date = new Date(now);
  date.setDate(date.getDate() + d);
  date.setHours(hour, 0, 0, 0);
  return date.toISOString();
};

export const MOCK_RESOURCES: EventResource[] = [
  {
    id: "r1111111-1111-1111-1111-111111111111",
    branch_id: "branch-001",
    name: "Main Sanctuary Hall",
    resource_type: "Venue",
    capacity: 500,
    status: "Available",
    created_at: daysFromNow(-30)
  },
  {
    id: "r2222222-2222-2222-2222-222222222222",
    branch_id: "branch-001",
    name: "Fellowship Chapel B",
    resource_type: "Venue",
    capacity: 100,
    status: "Available",
    created_at: daysFromNow(-30)
  },
  {
    id: "r3333333-3333-3333-3333-333333333333",
    branch_id: "branch-001",
    name: "Executive Boardroom",
    resource_type: "Venue",
    capacity: 25,
    status: "Available",
    created_at: daysFromNow(-30)
  },
  {
    id: "r4444444-4444-4444-4444-444444444444",
    branch_id: "branch-001",
    name: "4K Laser Projector Set",
    resource_type: "Equipment",
    capacity: 1,
    status: "Available",
    created_at: daysFromNow(-30)
  },
  {
    id: "r5555555-5555-5555-5555-555555555555",
    branch_id: "branch-001",
    name: "Worship Sound Rig & Mixers",
    resource_type: "Equipment",
    capacity: 1,
    status: "Available",
    created_at: daysFromNow(-30)
  }
];

export const MOCK_EVENTS: Event[] = [
  {
    id: "e0000001-0001-0001-0001-000000000001",
    branch_id: "branch-001",
    group_id: null,
    title: "Sunday Celebration Service",
    description: "Join us for our main Sunday worship experience with powerful praise, prayer, and an inspiring message.",
    event_type: "Sunday Service",
    start_date: daysFromNow(1, 9), // Tomorrow at 9 AM
    end_date: daysFromNow(1, 12),
    location: "Main Sanctuary & Online",
    organizer: "Rev. David Kamau",
    capacity: 500,
    registered_count: 5,
    status: "Published",
    cover_image: createSvgPlaceholder("Sunday Celebration", "#4f46e5", "#c084fc"),
    is_recurring: true,
    recurrence_pattern: "Weekly",
    is_archived: false,
    archived_at: null,
    created_at: daysFromNow(-10),
    updated_at: daysFromNow(-1)
  },
  {
    id: "e0000002-0002-0002-0002-000000000002",
    branch_id: "branch-001",
    group_id: null,
    title: "Wednesday Midweek Bible Study",
    description: "Deep dive into the scriptures as we study the book of Romans together. Interactive Q&A included.",
    event_type: "Bible Study",
    start_date: daysFromNow(4, 18), // 4 days from now at 6 PM
    end_date: daysFromNow(4, 20),
    location: "Fellowship Chapel B",
    organizer: "Pastor John Smith",
    capacity: 4, // low capacity to test waitlist promotion triggers
    registered_count: 4,
    status: "Published",
    cover_image: createSvgPlaceholder("Bible Study", "#0ea5e9", "#22c55e"),
    is_recurring: true,
    recurrence_pattern: "Weekly",
    is_archived: false,
    archived_at: null,
    created_at: daysFromNow(-8),
    updated_at: daysFromNow(-8)
  },
  {
    id: "e0000003-0003-0003-0003-000000000003",
    branch_id: "branch-001",
    group_id: "g-001", // Connect Group linked event
    title: "Sinza Cell Prayer Night",
    description: "Special prayer and intercession meeting for our cell group families and outreach focus.",
    event_type: "Prayer Meeting",
    start_date: daysFromNow(2, 18),
    end_date: daysFromNow(2, 20),
    location: "Sinza Mori House Fellowship",
    organizer: "Cell Leader Emmanuel",
    capacity: 30,
    registered_count: 2,
    status: "Published",
    cover_image: createSvgPlaceholder("Cell Prayer", "#a855f7", "#ec4899"),
    is_recurring: false,
    recurrence_pattern: null,
    is_archived: false,
    archived_at: null,
    created_at: daysFromNow(-2),
    updated_at: daysFromNow(-2)
  },
  {
    id: "e0000004-0004-0004-0004-000000000004",
    branch_id: "branch-001",
    group_id: null,
    title: "Annual Leadership Summit 2026",
    description: "Equipping church leaders, elders, and ministry coordinators with vision and tools for the year.",
    event_type: "Conference",
    start_date: daysFromNow(14, 8),
    end_date: daysFromNow(16, 17),
    location: "Main Sanctuary Hall",
    organizer: "Super Admin",
    capacity: 200,
    registered_count: 0,
    status: "Draft",
    cover_image: createSvgPlaceholder("Leadership Summit", "#6366f1", "#14b8a6"),
    is_recurring: false,
    recurrence_pattern: null,
    is_archived: false,
    archived_at: null,
    created_at: daysFromNow(-20),
    updated_at: daysFromNow(-5)
  },
  {
    id: "e0000005-0005-0005-0005-000000000005",
    branch_id: "branch-001",
    group_id: null,
    title: "Community Outreach Rally",
    description: "Providing outreach checkups and food distribution to kawangware community.",
    event_type: "Outreach",
    start_date: daysFromNow(-5, 8), // 5 days ago (Past)
    end_date: daysFromNow(-5, 17),
    location: "Kawangware Grounds",
    organizer: "Pastor Samuel Ochieng",
    capacity: 300,
    registered_count: 3,
    status: "Completed",
    cover_image: createSvgPlaceholder("Outreach Rally", "#22c55e", "#10b981"),
    is_recurring: false,
    recurrence_pattern: null,
    is_archived: false,
    archived_at: null,
    created_at: daysFromNow(-30),
    updated_at: daysFromNow(-5)
  }
];

export const MOCK_BOOKINGS: ResourceBooking[] = [
  {
    id: "b1111111-1111-1111-1111-111111111111",
    event_id: "e0000001-0001-0001-0001-000000000001",
    resource_id: "r1111111-1111-1111-1111-111111111111", // Sanctuary
    start_time: daysFromNow(1, 9),
    end_time: daysFromNow(1, 12),
    status: "Approved",
    approved_by: "d3b07384-d113-4ec2-a5d8-c83d6850c2f3",
    approved_at: daysFromNow(-5),
    created_at: daysFromNow(-5)
  },
  {
    id: "b2222222-2222-2222-2222-222222222222",
    event_id: "e0000002-0002-0002-0002-000000000002",
    resource_id: "r2222222-2222-2222-2222-222222222222", // Chapel B
    start_time: daysFromNow(4, 18),
    end_time: daysFromNow(4, 20),
    status: "Approved",
    approved_by: "d3b07384-d113-4ec2-a5d8-c83d6850c2f3",
    approved_at: daysFromNow(-4),
    created_at: daysFromNow(-4)
  }
];

export const MOCK_REGISTRATIONS: EventRegistration[] = [
  // Sunday Service Registrations
  {
    id: "v1111111-1111-1111-1111-111111111111",
    event_id: "e0000001-0001-0001-0001-000000000001",
    user_id: "m001",
    member_id: "ldr-001",
    visitor_name: null,
    visitor_email: null,
    visitor_phone: null,
    status: "Attending",
    registration_date: daysFromNow(-3),
    attendance_status: "registered",
    checked_in_at: null,
    checked_in_by: null,
    notes: "Needs front seat"
  },
  {
    id: "v2222222-2222-2222-2222-222222222222",
    event_id: "e0000001-0001-0001-0001-000000000001",
    user_id: null,
    member_id: null,
    visitor_name: "Grace Mbise",
    visitor_email: "grace@churchnexus.org",
    visitor_phone: "+255754888999",
    status: "Attending",
    registration_date: daysFromNow(-2),
    attendance_status: "registered",
    checked_in_at: null,
    checked_in_by: null,
    notes: null
  },

  // Bible study registrations (Capacity = 4)
  {
    id: "v3333333-3333-3333-3333-333333333333",
    event_id: "e0000002-0002-0002-0002-000000000002",
    user_id: "m001",
    member_id: "ldr-001",
    visitor_name: null,
    visitor_email: null,
    visitor_phone: null,
    status: "Attending",
    registration_date: daysFromNow(-5),
    attendance_status: "registered",
    checked_in_at: null,
    checked_in_by: null,
    notes: null
  },
  {
    id: "v4444444-4444-4444-4444-444444444444",
    event_id: "e0000002-0002-0002-0002-000000000002",
    user_id: "user-002",
    member_id: "ldr-002",
    visitor_name: null,
    visitor_email: null,
    visitor_phone: null,
    status: "Attending",
    registration_date: daysFromNow(-4),
    attendance_status: "registered",
    checked_in_at: null,
    checked_in_by: null,
    notes: null
  },
  {
    id: "v5555555-5555-5555-5555-555555555555",
    event_id: "e0000002-0002-0002-0002-000000000002",
    user_id: null,
    member_id: null,
    visitor_name: "Visitor One",
    visitor_email: "v1@example.com",
    visitor_phone: "+255755111222",
    status: "Attending",
    registration_date: daysFromNow(-3),
    attendance_status: "registered",
    checked_in_at: null,
    checked_in_by: null,
    notes: null
  },
  {
    id: "v6666666-6666-6666-6666-666666666666",
    event_id: "e0000002-0002-0002-0002-000000000002",
    user_id: null,
    member_id: null,
    visitor_name: "Visitor Two",
    visitor_email: "v2@example.com",
    visitor_phone: "+255755333444",
    status: "Attending",
    registration_date: daysFromNow(-2),
    attendance_status: "registered",
    checked_in_at: null,
    checked_in_by: null,
    notes: null
  },
  {
    id: "v7777777-7777-7777-7777-777777777777",
    event_id: "e0000002-0002-0002-0002-000000000002",
    user_id: null,
    member_id: null,
    visitor_name: "Waiting Guest",
    visitor_email: "wait@example.com",
    visitor_phone: "+255755555666",
    status: "Waitlisted", // Starts on Waitlist because capacity is full (4)
    registration_date: daysFromNow(-1),
    attendance_status: "registered",
    checked_in_at: null,
    checked_in_by: null,
    notes: null
  }
];

export const MOCK_ATTENDEES = [
  { id: "att-001", name: "David Kamau", email: "david.kamau@email.com", role: "Church Admin", registerDate: "2026-06-01" },
  { id: "att-002", name: "Grace Wanjiku", email: "grace.wanjiku@email.com", role: "Member", registerDate: "2026-06-02" },
  { id: "att-003", name: "Samuel Ochieng", email: "samuel.ochieng@email.com", role: "Treasurer", registerDate: "2026-06-02" },
  { id: "att-004", name: "Mary Njeri", email: "mary.njeri@email.com", role: "Member", registerDate: "2026-06-03" },
  { id: "att-005", name: "Peter Mwangi", email: "peter.mwangi@email.com", role: "Media Team", registerDate: "2026-06-03" },
];
