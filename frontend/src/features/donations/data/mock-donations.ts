import type { 
  Donation, Expense, FinancialPeriod, 
  PledgeCampaign, Pledge, FinancialAuditLog 
} from "../types/donations.types";

export const MOCK_CAMPAIGNS: PledgeCampaign[] = [
  {
    id: "camp-001",
    branch_id: "branch-001",
    title: "Sanctuary Extension Project",
    description: "Raising funds to expand the main chapel sanctuary capacity to 1,500 seats.",
    target_amount: 150000000.00, // TZS
    start_date: "2026-01-01",
    end_date: "2026-12-31",
    status: "Active",
    created_at: "2026-01-01T08:00:00Z"
  },
  {
    id: "camp-002",
    branch_id: "branch-001",
    title: "Missions & Outreach 2026",
    description: "Support for rural church plantings and community outreach programs.",
    target_amount: 50000000.00,
    start_date: "2026-03-01",
    end_date: "2026-11-30",
    status: "Active",
    created_at: "2026-03-01T09:00:00Z"
  }
];

export const MOCK_PLEDGES: Pledge[] = [
  {
    id: "plg-001",
    campaign_id: "camp-001",
    member_id: "m001", // David Kamau
    amount: 10000000.00,
    fulfilled_amount: 6000000.00,
    status: "Pending",
    created_at: "2026-01-10T10:00:00Z",
    updated_at: "2026-05-15T14:00:00Z"
  },
  {
    id: "plg-002",
    campaign_id: "camp-001",
    member_id: "m003", // Samuel Ochieng
    amount: 5000000.00,
    fulfilled_amount: 5000000.00,
    status: "Fulfilled",
    created_at: "2026-01-15T11:00:00Z",
    updated_at: "2026-04-10T09:00:00Z"
  }
];

export const MOCK_DONATIONS: Donation[] = [
  {
    id: "don-001",
    branch_id: "branch-001",
    member_id: "m001",
    campaign_id: "camp-001",
    amount: 4000000.00,
    currency: "TZS",
    exchange_rate_to_base: 1.0000,
    base_currency: "TZS",
    donation_type: "Building Fund",
    payment_method: "Bank Transfer",
    transaction_reference: "NMB-TRF-98218",
    status: "Completed",
    donation_date: "2026-02-15T10:00:00Z",
    anonymous: false,
    notes: "Part 1 of sanctuary extension pledge",
    created_at: "2026-02-15T10:00:00Z",
    updated_at: "2026-02-15T10:00:00Z"
  },
  {
    id: "don-002",
    branch_id: "branch-001",
    member_id: "m001",
    campaign_id: "camp-001",
    amount: 2000000.00,
    currency: "TZS",
    exchange_rate_to_base: 1.0000,
    base_currency: "TZS",
    donation_type: "Building Fund",
    payment_method: "Mobile Money",
    transaction_reference: "QFC81920J1", // MPESA ref
    status: "Completed",
    donation_date: "2026-05-15T14:30:00Z",
    anonymous: false,
    notes: "Part 2 of sanctuary extension pledge",
    created_at: "2026-05-15T14:30:00Z",
    updated_at: "2026-05-15T14:30:00Z"
  },
  {
    id: "don-003",
    branch_id: "branch-001",
    member_id: "m002", // Lucy Kamau
    campaign_id: null,
    amount: 50000.00,
    currency: "TZS",
    exchange_rate_to_base: 1.0000,
    base_currency: "TZS",
    donation_type: "Tithe",
    payment_method: "Cash",
    transaction_reference: "CSH-2026-000001",
    status: "Completed",
    donation_date: "2026-06-14T09:00:00Z",
    anonymous: false,
    notes: "June Tithe",
    created_at: "2026-06-14T09:00:00Z",
    updated_at: "2026-06-14T09:00:00Z"
  },
  {
    id: "don-004",
    branch_id: "branch-001",
    member_id: "m003",
    campaign_id: "camp-001",
    amount: 5000000.00,
    currency: "TZS",
    exchange_rate_to_base: 1.0000,
    base_currency: "TZS",
    donation_type: "Building Fund",
    payment_method: "Bank Transfer",
    transaction_reference: "CRDB-TRF-00192",
    status: "Completed",
    donation_date: "2026-04-10T09:00:00Z",
    anonymous: false,
    notes: "Building pledge complete payment",
    created_at: "2026-04-10T09:00:00Z",
    updated_at: "2026-04-10T09:00:00Z"
  },
  {
    id: "don-005",
    branch_id: "branch-001",
    member_id: null, // Guest donor
    campaign_id: null,
    amount: 150000.00,
    currency: "TZS",
    exchange_rate_to_base: 1.0000,
    base_currency: "TZS",
    donation_type: "Offering",
    payment_method: "Cash",
    transaction_reference: "CSH-2026-000002",
    status: "Completed",
    donation_date: "2026-06-15T11:00:00Z",
    anonymous: true,
    notes: "Sunday anonymous envelope offering",
    guest_name: "Anonymous Guest",
    guest_email: null,
    guest_phone: null,
    created_at: "2026-06-15T11:00:00Z",
    updated_at: "2026-06-15T11:00:00Z"
  }
];

export const MOCK_EXPENSES: Expense[] = [
  {
    id: "exp-001",
    branch_id: "branch-001",
    amount: 250000.00,
    currency: "TZS",
    exchange_rate_to_base: 1.0000,
    base_currency: "TZS",
    expense_category: "Operations",
    payment_method: "Cash",
    description: "Office printing papers and stationeries replenishment",
    receipt_url: "https://images.unsplash.com/photo-1554415707-6e8cfc93fe23?w=150",
    approved_by: "m001",
    approved_at: "2026-06-02T10:00:00Z",
    status: "Approved",
    created_at: "2026-06-02T09:00:00Z",
    updated_at: "2026-06-02T10:00:00Z"
  },
  {
    id: "exp-002",
    branch_id: "branch-001",
    amount: 1200000.00,
    currency: "TZS",
    exchange_rate_to_base: 1.0000,
    base_currency: "TZS",
    expense_category: "Maintenance",
    payment_method: "Bank Transfer",
    description: "Chapel sound speaker repair and soundboard tuning service",
    receipt_url: null,
    approved_by: "m001",
    approved_at: "2026-06-10T12:00:00Z",
    status: "Approved",
    created_at: "2026-06-09T08:00:00Z",
    updated_at: "2026-06-10T12:00:00Z"
  }
];

export const MOCK_PERIODS: FinancialPeriod[] = [
  {
    id: "fp-001",
    branch_id: "branch-001",
    name: "May 2026",
    period_type: "Monthly",
    start_date: "2026-05-01",
    end_date: "2026-05-31",
    is_closed: true,
    closed_by: "m001",
    closed_at: "2026-06-01T08:00:00Z",
    created_at: "2026-05-01T08:00:00Z"
  },
  {
    id: "fp-002",
    branch_id: "branch-001",
    name: "June 2026",
    period_type: "Monthly",
    start_date: "2026-06-01",
    end_date: "2026-06-30",
    is_closed: false,
    closed_by: null,
    closed_at: null,
    created_at: "2026-06-01T08:00:00Z"
  }
];

export const MOCK_AUDIT_LOGS: FinancialAuditLog[] = [
  {
    id: "aud-001",
    user_id: "m001",
    action: "CLOSE_PERIOD",
    target_entity: "FinancialPeriod",
    target_id: "fp-001",
    ip_address: "192.168.1.5",
    timestamp: "2026-06-01T08:00:00Z",
    details: "Closed reporting books for May 2026."
  }
];
