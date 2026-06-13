export type DonationType = "Tithe" | "Offering" | "Building Fund" | "Outreach" | "Other";
export type PaymentMethod = "Card" | "M-Pesa" | "Bank Transfer" | "Cash";
export type TransactionStatus = "Pending" | "Completed" | "Failed";

export interface DonationRecord {
  id: string;
  member_id: string | null; // Null for anonymous/visitors
  donor_name: string; // Labeled "Anonymous" if anonymous
  donor_email?: string;
  amount: number; // Integer whole-shillings (TZS)
  type: DonationType;
  payment_method: PaymentMethod;
  status: TransactionStatus;
  notes?: string;
  created_at: string; // ISO date string
  reference_number?: string; // Receipt or payment transaction ref (e.g. M-Pesa code)
}

export interface PledgeCampaign {
  id: string;
  name: string; // e.g. "Church Building Expansion"
  description?: string;
  target_amount: number; // Integer whole-shillings (TZS)
  raised_amount: number; // Integer whole-shillings (TZS)
  target_date: string; // ISO date string
  status: "Active" | "Fulfilled" | "Cancelled";
  created_at: string;
}

export interface PledgeRecord {
  id: string;
  campaign_id: string;
  campaign_name: string;
  member_id: string;
  member_name: string;
  target_amount: number; // Integer whole-shillings (TZS)
  raised_amount: number; // Integer whole-shillings (TZS)
  status: "Active" | "Fulfilled" | "Cancelled";
  created_at: string;
}

export interface DonationReceipt {
  id: string;
  donation_id: string;
  receipt_number: string; // e.g. "REC-2026-042"
  issued_at: string;
}
