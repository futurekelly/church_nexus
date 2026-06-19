import type {
  ConnectGroup,
  GroupMember,
  GroupAttendance,
  GroupPrayerRequest,
  StudyOutline
} from "../types/group.types";

export const MOCK_GROUPS: ConnectGroup[] = [
  {
    id: "group-001",
    branch_id: "branch-001", // Tabata HQ
    name: "Tabata Bima Connect Group",
    description: "Weekly home fellowship for families in the Tabata Bima neighborhood.",
    category: "Home Fellowship",
    leader_id: "m001", // David Kamau
    assistant_leader_id: "m002",
    location_name: "Tabata Bima Area",
    location_address: "House No. 45, Bima Street near Tabata Market",
    frequency: "Weekly",
    status: "Active",
    max_members: 15,
    created_at: "2026-01-15T10:00:00Z"
  },
  {
    id: "group-002",
    branch_id: "branch-002", // Sinza Campus
    name: "Sinza Youth Fellowship Cell",
    description: "Dynamic small group focusing on young professionals, career guidance, and spiritual growth.",
    category: "Connect Group",
    leader_id: "m003", // Samuel Ochieng
    location_name: "Sinza Block C",
    location_address: "Apartment 3B, Sunshine Plaza, Sinza Mori",
    frequency: "Weekly",
    status: "Active",
    max_members: 20,
    created_at: "2026-02-10T11:30:00Z"
  },
  {
    id: "group-003",
    branch_id: "branch-001", // Tabata HQ
    name: "Mbezi Beach Bible Study",
    description: "Deep dive study group exploring the Epistles and contemporary theology.",
    category: "Bible Study",
    leader_id: "m004", // Seeded in members
    location_name: "Mbezi Beach",
    location_address: "Mbezi Beach Garden Estate, Villa 12",
    frequency: "Bi-Weekly",
    status: "Active",
    max_members: 12,
    created_at: "2026-03-01T08:00:00Z"
  }
];

export const MOCK_GROUP_MEMBERS: GroupMember[] = [
  // Group 1 Members (Tabata Bima)
  {
    id: "gm-001",
    group_id: "group-001",
    member_id: "m001",
    name: "David Kamau",
    phone: "+254 712 345 678",
    email: "david.kamau@email.com",
    role: "Leader",
    joined_at: "2026-01-15T10:00:00Z",
    status: "Active"
  },
  {
    id: "gm-002",
    group_id: "group-001",
    member_id: "m002",
    name: "Grace Wanjiku",
    phone: "+254 723 456 789",
    email: "grace.wanjiku@email.com",
    role: "Assistant",
    joined_at: "2026-01-16T12:00:00Z",
    status: "Active"
  },
  {
    id: "gm-003",
    group_id: "group-001",
    name: "John Mwangi",
    phone: "+254 733 111 222",
    email: "john.mwangi@email.com",
    role: "Member",
    joined_at: "2026-01-20T18:00:00Z",
    status: "Active"
  },
  {
    id: "gm-004",
    group_id: "group-001",
    name: "Sarah Kimani",
    phone: "+254 733 333 444",
    email: "sarah.kimani@email.com",
    role: "Host",
    joined_at: "2026-01-20T18:00:00Z",
    status: "Active"
  },
  {
    id: "gm-005",
    group_id: "group-001",
    name: "Timothy Nekesa",
    phone: "+254 733 555 666",
    email: "tim.nekesa@email.com",
    role: "Visitor",
    joined_at: "2026-06-05T19:00:00Z",
    status: "Active"
  },

  // Group 2 Members (Sinza Youth)
  {
    id: "gm-006",
    group_id: "group-002",
    member_id: "m003",
    name: "Samuel Ochieng",
    phone: "+254 734 567 890",
    email: "samuel.ochieng@email.com",
    role: "Leader",
    joined_at: "2026-02-10T11:30:00Z",
    status: "Active"
  },
  {
    id: "gm-007",
    group_id: "group-002",
    name: "Mary Atieno",
    phone: "+254 734 777 888",
    email: "mary.atieno@email.com",
    role: "Member",
    joined_at: "2026-02-12T15:00:00Z",
    status: "Active"
  },
  {
    id: "gm-008",
    group_id: "group-002",
    name: "Peter Otieno",
    phone: "+254 734 999 000",
    email: "peter.otieno@email.com",
    role: "Member",
    joined_at: "2026-02-15T10:00:00Z",
    status: "Active"
  }
];

export const MOCK_GROUP_ATTENDANCE: GroupAttendance[] = [
  {
    id: "att-001",
    group_id: "group-001",
    meeting_date: "2026-06-03",
    submitted_by: "m001",
    submitted_at: "2026-06-03T20:30:00Z",
    attendees: [
      { member_id: "gm-001", attended: true, status: "Present" },
      { member_id: "gm-002", attended: true, status: "Present" },
      { member_id: "gm-003", attended: false, status: "Absent", notes: "Travelled out of town" },
      { member_id: "gm-004", attended: true, status: "Present" }
    ],
    visitor_count: 1,
    study_topic: "Walking in Faith and Obedience",
    offering_amount: 25000,
    currency: "TZS"
  },
  {
    id: "att-002",
    group_id: "group-001",
    meeting_date: "2026-06-10",
    submitted_by: "m001",
    submitted_at: "2026-06-10T20:45:00Z",
    attendees: [
      { member_id: "gm-001", attended: true, status: "Present" },
      { member_id: "gm-002", attended: true, status: "Present" },
      { member_id: "gm-003", attended: true, status: "Present" },
      { member_id: "gm-004", attended: true, status: "Present" },
      { member_id: "gm-005", attended: true, status: "Present", notes: "First time visitor" }
    ],
    visitor_count: 0,
    study_topic: "Generosity and Stewardship",
    offering_amount: 32000,
    currency: "TZS"
  },
  {
    id: "att-003",
    group_id: "group-002",
    meeting_date: "2026-06-09",
    submitted_by: "m003",
    submitted_at: "2026-06-09T21:00:00Z",
    attendees: [
      { member_id: "gm-006", attended: true, status: "Present" },
      { member_id: "gm-007", attended: true, status: "Present" },
      { member_id: "gm-008", attended: false, status: "Absent" }
    ],
    visitor_count: 2,
    study_topic: "Career Growth and Christian Integrity",
    offering_amount: 15000,
    currency: "TZS"
  }
];

export const MOCK_GROUP_PRAYER_REQUESTS: GroupPrayerRequest[] = [
  {
    id: "gpr-001",
    group_id: "group-001",
    submitted_by_name: "John Mwangi",
    request_text: "Pray for my business, which has been experiencing low sales this month. Pray for wisdom on how to restructure operations.",
    is_anonymous: false,
    status: "Active",
    created_at: "2026-06-03T19:00:00Z",
    shared_with_branch: true
  },
  {
    id: "gpr-002",
    group_id: "group-001",
    submitted_by_name: "Anonymous",
    request_text: "Requesting prayer for healing of chronic back pain. It is affecting my daily work activities.",
    is_anonymous: true,
    status: "Answered",
    created_at: "2026-06-10T19:15:00Z",
    shared_with_branch: false
  },
  {
    id: "gpr-003",
    group_id: "group-002",
    submitted_by_name: "Mary Atieno",
    request_text: "Pray for my university final examinations starting next week. Pray for retentive memory and peace during the tests.",
    is_anonymous: false,
    status: "Active",
    created_at: "2026-06-09T20:00:00Z",
    shared_with_branch: true
  }
];

export const MOCK_STUDY_OUTLINES: StudyOutline[] = [
  {
    id: "out-001",
    title: "Walking in Faith and Obedience",
    theme: "Faith & Service",
    scripture_references: ["Hebrews 11:1-6", "James 2:14-26"],
    introduction: "Faith is not merely intellectual agreement, but active obedience to God's calling.",
    discussion_questions: [
      "How does Hebrews 11 define faith in practical terms?",
      "In what areas of your life is God calling you to step out in blind obedience today?",
      "What is the connection between faith and works according to James?"
    ],
    application: "Identify one task or promise God has placed in your heart and take one practical step of action this week.",
    published_at: "2026-06-01T08:00:00Z",
    created_by: "m001"
  },
  {
    id: "out-002",
    title: "Generosity and Small-Group Stewardship",
    theme: "Christian Living",
    scripture_references: ["2 Corinthians 9:6-15", "Luke 6:38"],
    introduction: "True stewardship recognizes that everything we have belongs to God and is meant for kingdom multiplication.",
    discussion_questions: [
      "What does it mean to sow sparingly versus sow bountifully?",
      "How can a connect group practice communal stewardship in their local neighborhood?",
      "How can we guard our hearts against greed?"
    ],
    application: "Decide as a group to support one family in the community or branch with a grocery basket this week.",
    published_at: "2026-06-08T08:00:00Z",
    created_by: "m001"
  },
  {
    id: "out-003",
    title: "Overcoming Anxiety and Fear",
    theme: "Mental & Spiritual Wellness",
    scripture_references: ["Philippians 4:4-9", "Matthew 6:25-34"],
    introduction: "In an increasingly stressed world, scripture offers us a pathway to supernatural peace.",
    discussion_questions: [
      "What is the difference between healthy concern and paralyzing anxiety?",
      "According to Paul, how does prayer guard our hearts and minds?",
      "Why does Jesus point to the birds and lilies in Matthew 6?"
    ],
    application: "Take 10 minutes every morning to practice quiet prayer and gratitude before checking emails or news.",
    published_at: "2026-06-15T08:00:00Z",
    created_by: "m001"
  }
];
