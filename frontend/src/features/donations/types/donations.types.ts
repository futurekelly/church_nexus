// ─────────────────────────────────────────────────────────────────
// Donations & Giving Module types — aligned with DATABASE_ERD.md
// ─────────────────────────────────────────────────────────────────

export type DonationType = "Tithe" | "Offering" | "Building Fund" | "Missions" | "Other";
export type PaymentMethod = "Cash" | "Mobile Money" | "Bank Transfer" | "Cheque";
export type TransactionStatus = "Pending" | "Completed" | "Failed" | "Voided" | "Reversed";
export type ExpenseCategory = "Operations" | "Salaries" | "Outreach" | "Maintenance" | "Other";
export type ExpenseStatus = "Pending" | "Approved" | "Rejected";
export type PeriodType = "Monthly" | "Quarterly" | "Annual";

export interface Donation {
  id: string;
  branch_id: string;
  member_id: string | null; // Nullable for guest/anonymous
  campaign_id: string | null; // Nullable
  amount: number;
  currency: string;
  exchange_rate_to_base: number;
  base_currency: string;
  donation_type: DonationType;
  payment_method: PaymentMethod;
  transaction_reference: string; // Unique
  status: TransactionStatus;
  donation_date: string; // ISO date-time string
  anonymous: boolean;
  notes: string | null;
  
  // Loose contact details for guest donors
  guest_name?: string | null;
  guest_email?: string | null;
  guest_phone?: string | null;
  
  created_at: string;
  updated_at: string;
}

export interface Expense {
  id: string;
  branch_id: string;
  amount: number;
  currency: string;
  exchange_rate_to_base: number;
  base_currency: string;
  expense_category: ExpenseCategory;
  payment_method: "Cash" | "Bank Transfer" | "Mobile Money";
  description: string;
  receipt_url: string | null;
  approved_by: string | null; // User UUID
  approved_at: string | null; // ISO timestamp
  status: ExpenseStatus;
  created_at: string;
  updated_at: string;
}

export interface FinancialPeriod {
  id: string;
  branch_id: string;
  name: string;
  period_type: PeriodType;
  start_date: string; // YYYY-MM-DD
  end_date: string; // YYYY-MM-DD
  is_closed: boolean;
  closed_by: string | null;
  closed_at: string | null;
  created_at: string;
}

export interface PledgeCampaign {
  id: string;
  branch_id: string;
  title: string;
  name?: string; // Compatibility alias
  description: string | null;
  target_amount: number;
  currency?: string;
  raised_amount?: number; // Compatibility field
  start_date: string; // YYYY-MM-DD
  end_date: string; // YYYY-MM-DD
  target_date?: string; // Compatibility alias
  status: "Active" | "Completed" | "Cancelled" | "Fulfilled";
  created_at: string;
}

export interface Pledge {
  id: string;
  branch_id?: string;
  campaign_id: string;
  member_id: string;
  amount: number;
  fulfilled_amount: number;
  status: "Pending" | "Fulfilled" | "Cancelled";
  created_at: string;
  updated_at: string;
}

export interface FinancialAuditLog {
  id: string;
  user_id: string;
  action: "VOID_TRANSACTION" | "CLOSE_PERIOD" | "VIEW_REPORT" | "CREATE_DONATION" | "CREATE_EXPENSE";
  target_entity: string;
  target_id: string;
  ip_address: string | null;
  timestamp: string;
  details: string | null;
}

export interface DonationFilters {
  search: string;
  type: DonationType | "all";
  method: PaymentMethod | "all";
  status: TransactionStatus | "all";
  campaign: string | "all";
  dateRange: "all" | "today" | "this-month" | "this-year";
  page?: number;
  pageSize?: number;
}

export interface DonationSortConfig {
  field: "donation_date" | "amount" | "donor_name" | "transaction_reference";
  direction: "asc" | "desc";
}

export interface PaginatedResponse<T> {
  count: number;
  page: number;
  page_size: number;
  total_pages: number;
  next: string | null;
  previous: string | null;
  results: T[];
}
