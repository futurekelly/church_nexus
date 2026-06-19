import type { 
  Member, Family, FamilyRelationship, 
  VolunteerAssignment, MemberLifecycleTimeline, GroupMembership, MemberActivity 
} from "../types/member.types";

export const MOCK_FAMILIES: Family[] = [
  {
    id: "fam-001",
    branch_id: "branch-001",
    name: "The Kamau Household",
    head_of_household_id: "m001",
    created_at: "2020-01-12T08:00:00Z"
  },
  {
    id: "fam-002",
    branch_id: "branch-001",
    name: "The Ochieng Household",
    head_of_household_id: "m003",
    created_at: "2019-06-15T08:00:00Z"
  }
];

export const MOCK_MEMBERS: Member[] = [
  {
    id: "m001",
    branch_id: "branch-001",
    family_id: "fam-001",
    membership_number: "MBR-2020-000001",
    first_name: "David",
    last_name: "Kamau",
    profile_photo: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150",
    gender: "male",
    date_of_birth: "1985-03-15",
    marriage_anniversary_date: "2012-06-23",
    marital_status: "Married",
    occupation: "Software Engineer",
    education_level: "Bachelor of Science in CS",
    national_id_passport: "ID-98765432",
    email: "david.kamau@email.com",
    phone_number: "+254 712 345 678",
    address: "123 Ngong Road, Nairobi",
    status: "Active",
    member_type: "Clergy",
    baptism_status: "Water Baptized",
    baptism_date: "2010-04-12",
    baptism_place: "Nairobi Sanctuary",
    baptism_officiant: "Rev. John Peters",
    salvation_status: "Born Again",
    salvation_date: "2008-09-05",
    join_date: "2020-01-12",
    date_joined: "2020-01-12",
    emergency_name: "Lucy Kamau",
    emergency_relationship: "Spouse",
    emergency_phone: "+254 712 999 888",
    pastoral_notes: "Very committed leader. Oversees youth cell guidance and church-admin functions.",
    notes: "Leads the Sunday morning usher team.",
    role: "church_admin",
    ministries: ["Ushers", "Men's Fellowship"],
    custom_fields: { t_shirt_size: "L", diet_preference: "None" },
    communication_preferences: { email: true, sms: true, in_app: true },
    donor_status: "Active",
    recurring_giving_opt_in: true,
    is_archived: false,
    archived_at: null,
    created_at: "2020-01-12T08:00:00Z",
    updated_at: "2026-06-01T10:00:00Z"
  },
  {
    id: "m002",
    branch_id: "branch-001",
    family_id: "fam-001",
    membership_number: "MBR-2021-000002",
    first_name: "Lucy",
    last_name: "Kamau",
    profile_photo: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150",
    gender: "female",
    date_of_birth: "1988-08-20",
    marriage_anniversary_date: "2012-06-23",
    marital_status: "Married",
    occupation: "Teacher",
    education_level: "Bachelor of Education",
    national_id_passport: "ID-11223344",
    email: "lucy.kamau@email.com",
    phone_number: "+254 712 999 888",
    address: "123 Ngong Road, Nairobi",
    status: "Active",
    member_type: "Regular",
    baptism_status: "Water Baptized",
    baptism_date: "2013-05-18",
    baptism_place: "Nairobi Sanctuary",
    baptism_officiant: "Rev. John Peters",
    salvation_status: "Born Again",
    salvation_date: "2011-12-25",
    join_date: "2021-03-08",
    date_joined: "2021-03-08",
    emergency_name: "David Kamau",
    emergency_relationship: "Spouse",
    emergency_phone: "+254 712 345 678",
    pastoral_notes: "Coordinates choir rehearsals. Gentle spirit.",
    notes: "Coordinates choir rehearsals. Gentle spirit.",
    role: "member",
    ministries: ["Choir", "Women's Ministry"],
    custom_fields: { t_shirt_size: "M" },
    communication_preferences: { email: true, sms: true, in_app: false },
    donor_status: "Active",
    recurring_giving_opt_in: false,
    is_archived: false,
    archived_at: null,
    created_at: "2021-03-08T09:00:00Z",
    updated_at: "2026-05-20T11:00:00Z"
  },
  {
    id: "m003",
    branch_id: "branch-001",
    family_id: "fam-002",
    membership_number: "MBR-2019-000003",
    first_name: "Samuel",
    last_name: "Ochieng",
    profile_photo: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150",
    gender: "male",
    date_of_birth: "1978-11-30",
    marriage_anniversary_date: null,
    marital_status: "Single",
    occupation: "Accountant",
    education_level: "MBA in Finance",
    national_id_passport: "ID-22334455",
    email: "samuel.ochieng@email.com",
    phone_number: "+254 734 567 890",
    address: "789 Thika Road, Nairobi",
    status: "Active",
    member_type: "Leader",
    baptism_status: "Water Baptized",
    baptism_date: "2015-08-20",
    baptism_place: "Kisumu Branch",
    baptism_officiant: "Pastor Mark Otieno",
    salvation_status: "Born Again",
    salvation_date: "2014-04-05",
    join_date: "2019-06-15",
    date_joined: "2019-06-15",
    emergency_name: "Jane Ochieng",
    emergency_relationship: "Sister",
    emergency_phone: "+254 734 111 222",
    pastoral_notes: "A dedicated treasurer. Maintains impeccable accountability.",
    notes: "Manages all financial records for the church.",
    role: "treasurer",
    ministries: ["Prayer Team", "Men's Fellowship"],
    custom_fields: {},
    communication_preferences: { email: true, sms: true, in_app: true },
    donor_status: "Active",
    recurring_giving_opt_in: true,
    is_archived: false,
    archived_at: null,
    created_at: "2019-06-15T08:00:00Z",
    updated_at: "2026-06-10T12:00:00Z"
  },
  {
    id: "m004",
    branch_id: "branch-001",
    family_id: null,
    membership_number: "MBR-2026-000004",
    first_name: "Mary",
    last_name: "Njeri",
    profile_photo: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150",
    gender: "female",
    date_of_birth: "1995-04-18",
    marriage_anniversary_date: null,
    marital_status: "Single",
    occupation: "Nurse",
    education_level: "Diploma in Nursing",
    national_id_passport: "ID-55667788",
    email: "mary.njeri@email.com",
    phone_number: "+254 745 678 901",
    address: "12 Westlands Ave, Nairobi",
    status: "Visitor",
    member_type: "Regular",
    baptism_status: "Not Baptized",
    baptism_date: null,
    baptism_place: null,
    baptism_officiant: null,
    salvation_status: "Seeking",
    salvation_date: null,
    join_date: "2026-01-09",
    date_joined: "2026-01-09",
    emergency_name: "James Njeri",
    emergency_relationship: "Father",
    emergency_phone: "+254 745 000 111",
    pastoral_notes: "First time visitor. Responded to outreach flyer.",
    notes: "First time visitor. Responded to outreach flyer.",
    role: "member",
    ministries: ["Youth", "Evangelism"],
    custom_fields: {},
    communication_preferences: { email: false, sms: true, in_app: false },
    donor_status: "Non-Donor",
    recurring_giving_opt_in: false,
    is_archived: false,
    archived_at: null,
    created_at: "2026-01-09T10:00:00Z",
    updated_at: "2026-04-15T09:00:00Z"
  },
  {
    id: "m005",
    branch_id: "branch-002",
    family_id: null,
    membership_number: "MBR-2026-000005",
    first_name: "John",
    last_name: "Obwocha",
    profile_photo: null,
    gender: "male",
    date_of_birth: "1990-12-05",
    marriage_anniversary_date: null,
    marital_status: "Single",
    occupation: "Freelancer",
    education_level: "High School Certificate",
    national_id_passport: "ID-77889900",
    email: "john.obwocha@email.com",
    phone_number: "+254 799 111 222",
    address: "45 Kisumu Highway, Kisumu",
    status: "New Convert",
    member_type: "Regular",
    baptism_status: "Not Baptized",
    baptism_date: null,
    baptism_place: null,
    baptism_officiant: null,
    salvation_status: "Born Again",
    salvation_date: "2026-06-01",
    join_date: "2026-06-01",
    date_joined: "2026-06-01",
    emergency_name: "Jane Obwocha",
    emergency_relationship: "Mother",
    emergency_phone: "+254 799 000 000",
    pastoral_notes: "Gave life during Sunday altar call. Needs follow-up classes.",
    notes: "Gave life during Sunday altar call. Needs follow-up classes.",
    role: "member",
    ministries: [],
    custom_fields: {},
    communication_preferences: { email: true, sms: true, in_app: true },
    donor_status: "Guest",
    recurring_giving_opt_in: false,
    is_archived: false,
    archived_at: null,
    created_at: "2026-06-01T11:00:00Z",
    updated_at: "2026-06-01T11:00:00Z"
  }
];

export const MOCK_FAMILY_RELATIONSHIPS: FamilyRelationship[] = [
  {
    id: "rel-001",
    from_member_id: "m001",
    to_member_id: "m002",
    relationship_type: "Spouse",
    created_at: "2012-06-23T08:00:00Z"
  }
];

export const MOCK_VOLUNTEER_ASSIGNMENTS: VolunteerAssignment[] = [
  {
    id: "vol-001",
    member_id: "m001",
    ministry_name: "Ushers",
    role: "Leader",
    assigned_at: "2020-02-15T09:00:00Z",
    is_active: true
  },
  {
    id: "vol-002",
    member_id: "m002",
    ministry_name: "Choir",
    role: "Member",
    assigned_at: "2021-04-10T10:00:00Z",
    is_active: true
  }
];

export const MOCK_LIFECYCLE_TIMELINE: MemberLifecycleTimeline[] = [
  {
    id: "lt-001",
    member_id: "m005",
    previous_status: "Visitor",
    new_status: "New Convert",
    changed_by: "m001",
    changed_at: "2026-06-01T11:30:00Z",
    notes: "Altar call response salvation."
  }
];

export const MOCK_GROUP_MEMBERSHIPS: GroupMembership[] = [
  {
    id: "gmem-001",
    member_id: "m001",
    group_id: "group-001",
    role: "Leader",
    joined_at: "2020-03-01T09:00:00Z",
    exited_at: null,
    status: "Active"
  },
  {
    id: "gmem-002",
    member_id: "m002",
    group_id: "group-001",
    role: "Member",
    joined_at: "2021-05-12T10:00:00Z",
    exited_at: null,
    status: "Active"
  }
];

export function getMemberStats() {
  const members = MOCK_MEMBERS;
  const total = members.filter(m => !m.is_archived).length;
  const active = members.filter(m => m.status === "Active" && !m.is_archived).length;
  const visitors = members.filter(m => m.status === "Visitor" && !m.is_archived).length;
  const newThisMonth = members.filter(m => {
    if (m.is_archived) return false;
    const joinDate = new Date(m.join_date);
    const now = new Date();
    return joinDate.getFullYear() === now.getFullYear() && joinDate.getMonth() === now.getMonth();
  }).length;

  return { total, active, visitors, newThisMonth };
}

export const MOCK_MEMBER_ACTIVITIES: Record<string, MemberActivity[]> = {
  m001: [
    {
      id: "act-001",
      type: "joined",
      description: "Joined the church as a member",
      timestamp: "2020-01-12T08:00:00Z"
    },
    {
      id: "act-002",
      type: "role_change",
      description: "Assigned as Ushers leader",
      timestamp: "2020-02-15T09:00:00Z"
    }
  ]
};

export const DEFAULT_MEMBER_ACTIVITY: MemberActivity[] = [];
