import type { Branch } from "../types/branch.types";
import type { PaymentAccount } from "../types/payment.types";
import type { LocalizationSettings } from "../types/localization.types";
import type { ChurchProfileSettings } from "../types/church-profile.types";

export const MOCK_BRANCHES: Branch[] = [
  {
    id: "branch-001",
    branch_code: "TZ-DSM-01",
    branch_name: "Tabata HQ Campus",
    branch_type: "Headquarters",
    country_code: "TZ",
    currency_code: "TZS",
    timezone: "Africa/Dar_es_Salaam",
    language: "sw",
    phone: "+255754000001",
    email: "futurekelly360@gmail.com",
    address: {
      street_address: "Tabata Bima Road, Plot 45",
      city: "Dar es Salaam",
      state_province: "Ilala",
      postal_code: "12101",
      country: "Tanzania",
      latitude: -6.8208,
      longitude: 39.2215
    },
    leader: {
      id: "ldr-001",
      first_name: "Kelvin",
      last_name: "Mbise",
      title: "Pastor",
      phone: "+255754111222",
      email: "futurekelly360@gmail.com",
      user_id: "m001"
    },
    financial_profile: {
      fiscal_year_start: "01-01",
      tax_exemption_number: "TX-TZ-99812",
      default_payment_provider: "M-Pesa",
      max_anonymous_donation_limit: 5000000
    },
    logo_url: "https://images.unsplash.com/photo-1438029071396-1e831a7fa6d8?w=100&h=100&fit=crop",
    status: "Active",
    created_at: "2026-01-10T08:00:00Z"
  },
  {
    id: "branch-002",
    branch_code: "TZ-DSM-02",
    branch_name: "Sinza Grace Church",
    branch_type: "Satellite",
    country_code: "TZ",
    currency_code: "TZS",
    timezone: "Africa/Dar_es_Salaam",
    language: "sw",
    phone: "+255754000002",
    email: "futurekelly360@gmail.com",
    address: {
      street_address: "Sinza Mori, Shekilango Road",
      city: "Dar es Salaam",
      state_province: "Kinondoni",
      postal_code: "12102",
      country: "Tanzania",
      latitude: -6.7801,
      longitude: 39.2241
    },
    leader: {
      id: "ldr-002",
      first_name: "Emmanuel",
      last_name: "Massawe",
      title: "Pastor",
      phone: "+255754222333",
      email: "futurekelly360@gmail.com"
    },
    financial_profile: {
      fiscal_year_start: "01-01",
      default_payment_provider: "TigoPesa",
      max_anonymous_donation_limit: 3000000
    },
    status: "Active",
    created_at: "2026-02-15T09:30:00Z"
  },
  {
    id: "branch-003",
    branch_code: "KE-NBI-01",
    branch_name: "Nairobi Victory Campus",
    branch_type: "Plant",
    country_code: "KE",
    currency_code: "KES",
    timezone: "Africa/Nairobi",
    language: "en",
    phone: "+254711000001",
    email: "futurekelly360@gmail.com",
    address: {
      street_address: "Ngong Road, Adams Arcade",
      city: "Nairobi",
      state_province: "Nairobi County",
      postal_code: "00100",
      country: "Kenya",
      latitude: -1.3005,
      longitude: 36.7824
    },
    leader: {
      id: "ldr-003",
      first_name: "John",
      last_name: "Njoroge",
      title: "Pastor",
      phone: "+254711222333",
      email: "futurekelly360@gmail.com"
    },
    financial_profile: {
      fiscal_year_start: "01-01",
      tax_exemption_number: "TX-KE-55410",
      default_payment_provider: "M-Pesa",
      max_anonymous_donation_limit: 100000
    },
    status: "Active",
    created_at: "2026-03-20T10:00:00Z"
  }
];

export const MOCK_PAYMENT_ACCOUNTS: PaymentAccount[] = [
  {
    id: "pay-001",
    branch_id: "branch-001",
    provider: "M-Pesa",
    account_name: "Tabata Offering Till",
    account_number: "+255754000001",
    paybill_number: "150150",
    merchant_code: "998877",
    status: "Active",
    is_default: true,
    created_at: "2026-01-11T09:00:00Z"
  },
  {
    id: "pay-002",
    branch_id: "branch-001",
    provider: "TigoPesa",
    account_name: "Tabata Kwa Simu Channel",
    account_number: "+255715000001",
    merchant_code: "887766",
    status: "Active",
    is_default: false,
    created_at: "2026-01-11T09:15:00Z"
  },
  {
    id: "pay-003",
    branch_id: "branch-002",
    provider: "TigoPesa",
    account_name: "Sinza Tigo Merchant",
    account_number: "+255715000002",
    merchant_code: "776655",
    status: "Active",
    is_default: true,
    created_at: "2026-02-16T10:00:00Z"
  },
  {
    id: "pay-004",
    branch_id: "branch-002",
    provider: "Bank",
    account_name: "Sinza CRDB Main offering",
    account_number: "0152431002900",
    bank_name: "CRDB Bank",
    swift_bic: "CRDBTZTZ",
    status: "Active",
    is_default: false,
    created_at: "2026-02-16T10:30:00Z"
  },
  {
    id: "pay-005",
    branch_id: "branch-003",
    provider: "M-Pesa",
    account_name: "Nairobi Victory Lipa Na M-Pesa",
    account_number: "+254711000001",
    paybill_number: "247247",
    merchant_code: "332211",
    status: "Active",
    is_default: true,
    created_at: "2026-03-21T11:00:00Z"
  }
];

export const MOCK_LOCALIZATION_SETTINGS: LocalizationSettings = {
  default_language: "sw",
  default_currency: "TZS",
  default_country: "TZ",
  timezone: "Africa/Dar_es_Salaam"
};

export const MOCK_CHURCH_PROFILE: ChurchProfileSettings = {
  church_name: "Church Nexus",
  slogan: "Uniting the Body of Christ Across East Africa",
  logo_url: "https://images.unsplash.com/photo-1438029071396-1e831a7fa6d8?w=100&h=100&fit=crop",
  favicon_url: "/favicon.ico",
  website: "",
  email: "futurekelly360@gmail.com",
  phone: "+255678302135",
  social_media: {
    facebook: "",
    youtube: "",
    instagram: "",
    twitter: ""
  },
  headquarters_branch_id: "branch-001"
};
