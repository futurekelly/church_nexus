export type BranchType = "Headquarters" | "Satellite" | "Plant";
export type BranchStatus = "Active" | "Inactive" | "Suspended";

export interface BranchLeader {
  id: string;
  first_name: string;
  last_name: string;
  title: "Pastor" | "Elder" | "Deacon" | "Administrator";
  phone: string; // E.164 format
  email: string;
  user_id?: string;
}

export interface BranchAddress {
  street_address: string;
  city: string;
  state_province: string;
  postal_code?: string;
  country: string;
  latitude?: number;
  longitude?: number;
}

export interface BranchFinancialProfile {
  fiscal_year_start: string; // e.g. "01-01"
  tax_exemption_number?: string;
  default_payment_provider: "M-Pesa" | "TigoPesa" | "Airtel Money" | "Bank";
  max_anonymous_donation_limit: number;
}

export interface Branch {
  id: string; // UUID v4 format
  branch_code: string; // e.g., "TZ-DSM-01"
  branch_name: string; // e.g., "Dar es Salaam Main"
  branch_type: BranchType;
  country_code: "TZ" | "KE" | "UG" | "RW" | "US";
  currency_code: "TZS" | "KES" | "UGX" | "RWF" | "USD";
  timezone: string; // e.g., "Africa/Dar_es_Salaam"
  language: "sw" | "en";
  phone: string; // E.164 format
  email: string;
  address: BranchAddress;
  leader: BranchLeader;
  financial_profile: BranchFinancialProfile;
  logo_url?: string;
  status: BranchStatus;
  created_at: string; // ISO 8601 string
}
