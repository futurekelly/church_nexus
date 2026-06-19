export type PaymentProviderType = "M-Pesa" | "TigoPesa" | "Airtel Money" | "HaloPesa" | "Bank";
export type PaymentAccountStatus = "Active" | "Inactive";

export interface PaymentAccount {
  id: string; // UUID v4
  branch_id: string; // references Branch.id
  provider: PaymentProviderType;
  account_name: string; // e.g. "Tabata Church Offering Account"
  account_number: string; // Bank account number OR Merchant phone number
  paybill_number?: string; // Optional (Kenya M-Pesa / TZS Paybill)
  merchant_code?: string; // e.g., Lipa Na M-Pesa Till number or Lipa kwa Simu code
  bank_name?: string; // Required if provider is "Bank"
  swift_bic?: string;
  status: PaymentAccountStatus;
  is_default: boolean;
  created_at: string;
}
