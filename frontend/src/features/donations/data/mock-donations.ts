import type { DonationRecord, PledgeCampaign, DonationReceipt } from "../types/donations.types";

export const MOCK_CAMPAIGNS: PledgeCampaign[] = [
  {
    id: "camp-building",
    name: "Church Building Expansion",
    description: "Fundraising for expanding the main sanctuary capacity and building new classrooms.",
    target_amount: 150000000, // 150,000,000 TZS
    raised_amount: 95000000,  // 95,000,000 TZS
    target_date: "2026-12-31",
    status: "Active",
    created_at: "2026-01-10",
  },
  {
    id: "camp-youth",
    name: "Easter Youth Mission",
    description: "Sponsorship for youth outreach mission trips and community service during Easter.",
    target_amount: 20000000,  // 20,000,000 TZS
    raised_amount: 18500000,  // 18,500,000 TZS
    target_date: "2026-04-15",
    status: "Fulfilled",
    created_at: "2026-02-01",
  },
  {
    id: "camp-audio",
    name: "New PA Audio System",
    description: "Upgrading our sound system, wireless microphones, and acoustic panels in the main hall.",
    target_amount: 45000000,  // 45,000,000 TZS
    raised_amount: 15000000,  // 15,000,000 TZS
    target_date: "2026-09-30",
    status: "Active",
    created_at: "2026-03-15",
  },
];

export const MOCK_DONATIONS: DonationRecord[] = [
  {
    id: "don-1",
    member_id: "mem-1", // Pastor Kelvin (or similar)
    donor_name: "Sir. Kelvin Mbise",
    donor_email: "futurekelly360@gmail.com",
    amount: 500000, // 500,000 TZS
    type: "Tithe",
    payment_method: "Bank Transfer",
    status: "Completed",
    notes: "Monthly Tithe - June",
    created_at: "2026-06-05T10:00:00Z",
    reference_number: "TXN-BK-9921",
  },
  {
    id: "don-2",
    member_id: "mem-2",
    donor_name: "John Doe",
    donor_email: "john.doe@gmail.com",
    amount: 150000, // 150,000 TZS
    type: "Offering",
    payment_method: "M-Pesa",
    status: "Completed",
    notes: "Sunday Service Offering",
    created_at: "2026-06-07T11:30:00Z",
    reference_number: "PP260607.1130",
  },
  {
    id: "don-3",
    member_id: null,
    donor_name: "Anonymous",
    donor_email: undefined,
    amount: 50000, // 50,000 TZS
    type: "Offering",
    payment_method: "Cash",
    status: "Completed",
    notes: "Anonymous cash envelope",
    created_at: "2026-06-07T12:00:00Z",
    reference_number: "CSH-9921",
  },
  {
    id: "don-4",
    member_id: "mem-3",
    donor_name: "Sarah Jenkins",
    donor_email: "sarah.j@outlook.com",
    amount: 1000000, // 1,000,000 TZS
    type: "Building Fund",
    payment_method: "Card",
    status: "Completed",
    notes: "Pledge contribution for Building Expansion",
    created_at: "2026-06-08T09:15:00Z",
    reference_number: "CRD-9011-88",
  },
  {
    id: "don-5",
    member_id: "mem-4",
    donor_name: "Michael Smith",
    donor_email: "m.smith@yahoo.com",
    amount: 250000, // 250,000 TZS
    type: "Tithe",
    payment_method: "M-Pesa",
    status: "Completed",
    notes: "June Tithe",
    created_at: "2026-06-10T15:20:00Z",
    reference_number: "MP-TX-88129",
  },
  {
    id: "don-6",
    member_id: null,
    donor_name: "Jane Doe",
    donor_email: "jane.doe@gmail.com",
    amount: 100000, // 100,000 TZS
    type: "Outreach",
    payment_method: "Card",
    status: "Completed",
    notes: "Visitor outreach donation",
    created_at: "2026-06-11T14:10:00Z",
    reference_number: "CRD-7729-10",
  },
  {
    id: "don-7",
    member_id: "mem-2",
    donor_name: "John Doe",
    donor_email: "john.doe@gmail.com",
    amount: 300000, // 300,000 TZS
    type: "Building Fund",
    payment_method: "M-Pesa",
    status: "Completed",
    notes: "Sanctuary sound system fund",
    created_at: "2026-06-12T08:45:00Z",
    reference_number: "MP-TX-00912",
  },
  {
    id: "don-8",
    member_id: "mem-5",
    donor_name: "Grace Mrema",
    donor_email: "grace.mrema@gmail.com",
    amount: 500000, // 500,000 TZS
    type: "Tithe",
    payment_method: "Bank Transfer",
    status: "Completed",
    notes: "Tithes for June",
    created_at: "2026-06-12T17:30:00Z",
    reference_number: "TXN-BK-1102",
  },
  {
    id: "don-9",
    member_id: "mem-3",
    donor_name: "Sarah Jenkins",
    donor_email: "sarah.j@outlook.com",
    amount: 200000, // 200,000 TZS
    type: "Other",
    payment_method: "Cash",
    status: "Completed",
    notes: "Flower decoration offering",
    created_at: "2026-06-13T10:00:00Z",
    reference_number: "CSH-3392",
  },
  {
    id: "don-10",
    member_id: null,
    donor_name: "Anonymous",
    donor_email: undefined,
    amount: 150000, // 150,000 TZS
    type: "Offering",
    payment_method: "M-Pesa",
    status: "Completed",
    notes: "Mobile money offering",
    created_at: "2026-06-13T12:00:00Z",
    reference_number: "MP-TX-22891",
  },
];

export const MOCK_RECEIPTS: DonationReceipt[] = MOCK_DONATIONS.map((don, idx) => ({
  id: `rec-${don.id}`,
  donation_id: don.id,
  receipt_number: `REC-2026-${String(idx + 1).padStart(3, "0")}`,
  issued_at: don.created_at,
}));
