import type { Event } from "../types/event.types";

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

export const MOCK_EVENTS: Event[] = [
  {
    id: "ev-001",
    title: "Sunday Celebration Service",
    description: "Join us for our main Sunday worship experience with powerful praise, prayer, and an inspiring message.",
    event_type: "Sunday Service",
    start_date: daysFromNow(1, 9), // Tomorrow or next day at 9 AM
    end_date: daysFromNow(1, 12),
    location: "Main Sanctuary & Online",
    organizer: "Rev. David Kamau",
    capacity: 500,
    registered_count: 342,
    status: "Published",
    cover_image: createSvgPlaceholder("Sunday Celebration", "#4f46e5", "#c084fc"),
    created_at: daysFromNow(-10),
    updated_at: daysFromNow(-1),
  },
  {
    id: "ev-002",
    title: "Wednesday Midweek Bible Study",
    description: "Deep dive into the scriptures as we study the book of Romans together. Interactive Q&A included.",
    event_type: "Bible Study",
    start_date: daysFromNow(4, 18), // 4 days from now at 6 PM
    end_date: daysFromNow(4, 20),
    location: "Chapel Room A",
    organizer: "Pastor John Smith",
    capacity: 80,
    registered_count: 52,
    status: "Published",
    cover_image: createSvgPlaceholder("Bible Study", "#0ea5e9", "#22c55e"),
    created_at: daysFromNow(-8),
    updated_at: daysFromNow(-8),
  },
  {
    id: "ev-003",
    title: "Friday Youth Explosion",
    description: "A dynamic gathering for teenagers and young adults. Worship, fellowship, discussions, and games.",
    event_type: "Youth Meeting",
    start_date: daysFromNow(6, 17), // Friday at 5 PM
    end_date: daysFromNow(6, 21),
    location: "Youth Center Hall",
    organizer: "Pastor Peter Mwangi",
    capacity: 150,
    registered_count: 120,
    status: "Published",
    cover_image: createSvgPlaceholder("Youth Explosion", "#f97316", "#ef4444"),
    created_at: daysFromNow(-5),
    updated_at: daysFromNow(-2),
  },
  {
    id: "ev-004",
    title: "Morning Prayer Intercession",
    description: "Gather with the prayer team to lift up our community, leaders, and general intercessory requests.",
    event_type: "Prayer Meeting",
    start_date: daysFromNow(3, 6), // 3 days from now at 6 AM
    end_date: daysFromNow(3, 7),
    location: "Prayer Chapel",
    organizer: "Rev. Grace Wanjiku",
    capacity: 40,
    registered_count: 18,
    status: "Published",
    cover_image: createSvgPlaceholder("Morning Prayer", "#a855f7", "#ec4899"),
    created_at: daysFromNow(-2),
    updated_at: daysFromNow(-2),
  },
  {
    id: "ev-005",
    title: "Annual Leadership Summit 2026",
    description: "Equipping church leaders, elders, and ministry coordinators with vision and tools for the year.",
    event_type: "Conference",
    start_date: daysFromNow(14, 8), // 2 weeks from now
    end_date: daysFromNow(16, 17),
    location: "Nairobi Conference Center",
    organizer: "Super Admin",
    capacity: 200,
    registered_count: 85,
    status: "Draft",
    cover_image: createSvgPlaceholder("Leadership Summit", "#6366f1", "#14b8a6"),
    created_at: daysFromNow(-20),
    updated_at: daysFromNow(-5),
  },
  {
    id: "ev-006",
    title: "Community Outreach & Medical Camp",
    description: "Providing free checkups, counseling, and material support to our neighboring estate families.",
    event_type: "Outreach",
    start_date: daysFromNow(-5, 8), // 5 days ago (Past)
    end_date: daysFromNow(-5, 17),
    location: "Kawangware Community Grounds",
    organizer: "Pastor Samuel Ochieng",
    capacity: 300,
    registered_count: 280,
    status: "Completed",
    cover_image: createSvgPlaceholder("Medical Camp", "#22c55e", "#10b981"),
    created_at: daysFromNow(-30),
    updated_at: daysFromNow(-5),
  },
  {
    id: "ev-007",
    title: "Praise & Worship Seminar",
    description: "Vocal coaching, instrument training, and theological foundations for all worship team members.",
    event_type: "Seminar",
    start_date: daysFromNow(-12, 9), // 12 days ago (Past)
    end_date: daysFromNow(-11, 16),
    location: "Main Sanctuary",
    organizer: "Music Director Grace",
    capacity: 100,
    registered_count: 98,
    status: "Completed",
    cover_image: createSvgPlaceholder("Worship Seminar", "#ec4899", "#f43f5e"),
    created_at: daysFromNow(-25),
    updated_at: daysFromNow(-11),
  },
  {
    id: "ev-008",
    title: "Youth Outdoor Sports Day",
    description: "Inter-church soccer matches, fun activities, and barbecue. Bring a friend along!",
    event_type: "Special Event",
    start_date: daysFromNow(8, 10),
    end_date: daysFromNow(8, 17),
    location: "Jamhuri Sports Complex",
    organizer: "Pastor Peter Mwangi",
    capacity: 250,
    registered_count: 110,
    status: "Published",
    cover_image: createSvgPlaceholder("Sports Day", "#84cc16", "#06b6d4"),
    created_at: daysFromNow(-4),
    updated_at: daysFromNow(-4),
  },
  {
    id: "ev-009",
    title: "Couples Fellowship Dinner",
    description: "A special night of dinner, laughter, and guided discussions for married and engaged couples.",
    event_type: "Special Event",
    start_date: daysFromNow(10, 19),
    end_date: daysFromNow(10, 22),
    location: "Safari Park Hotel",
    organizer: "Family Life Ministry",
    capacity: 60,
    registered_count: 60, // Full capacity
    status: "Published",
    cover_image: createSvgPlaceholder("Couples Dinner", "#db2777", "#ea580c"),
    created_at: daysFromNow(-15),
    updated_at: daysFromNow(-1),
  },
  {
    id: "ev-010",
    title: "Global Intercession Livestream",
    description: "A multi-branch online prayer marathon broadcasting live to all global members.",
    event_type: "Livestream Event",
    start_date: daysFromNow(5, 19),
    end_date: daysFromNow(5, 23),
    location: "Online / YouTube",
    organizer: "Media Team",
    capacity: 1000,
    registered_count: 489,
    status: "Published",
    cover_image: createSvgPlaceholder("Intercession Live", "#7c3aed", "#2563eb"),
    created_at: daysFromNow(-3),
    updated_at: daysFromNow(-3),
  },
  {
    id: "ev-011",
    title: "Easter Special Cantata",
    description: "Our annual musical production celebrating Easter with choir, drama, and orchestra.",
    event_type: "Special Event",
    start_date: daysFromNow(12, 14),
    end_date: daysFromNow(12, 17),
    location: "Main Sanctuary",
    organizer: "Music Director Grace",
    capacity: 600,
    registered_count: 0,
    status: "Cancelled",
    cover_image: createSvgPlaceholder("Easter Cantata", "#6b7280", "#374151"),
    created_at: daysFromNow(-10),
    updated_at: daysFromNow(-1),
  },
  {
    id: "ev-012",
    title: "Evangelism Outreach Rally",
    description: "Door-to-door evangelism followed by a public crusade at the shopping center.",
    event_type: "Outreach",
    start_date: daysFromNow(7, 13),
    end_date: daysFromNow(7, 18),
    location: "Riruta Center",
    organizer: "Pastor Samuel Ochieng",
    capacity: 150,
    registered_count: 40,
    status: "Published",
    cover_image: createSvgPlaceholder("Outreach Rally", "#eab308", "#ca8a04"),
    created_at: daysFromNow(-6),
    updated_at: daysFromNow(-6),
  }
];

export const MOCK_ATTENDEES = [
  { id: "att-001", name: "David Kamau", email: "david.kamau@email.com", role: "Church Admin", registerDate: "2026-06-01" },
  { id: "att-002", name: "Grace Wanjiku", email: "grace.wanjiku@email.com", role: "Member", registerDate: "2026-06-02" },
  { id: "att-003", name: "Samuel Ochieng", email: "samuel.ochieng@email.com", role: "Treasurer", registerDate: "2026-06-02" },
  { id: "att-004", name: "Mary Njeri", email: "mary.njeri@email.com", role: "Member", registerDate: "2026-06-03" },
  { id: "att-005", name: "Peter Mwangi", email: "peter.mwangi@email.com", role: "Media Team", registerDate: "2026-06-03" },
];
