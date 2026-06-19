export type SupportedLanguage = "en" | "sw";
export type SupportedCurrency = "TZS" | "KES" | "UGX" | "RWF" | "USD";
export type SupportedCountry = "TZ" | "KE" | "UG" | "RW" | "US";

export interface LocalizationSettings {
  default_language: SupportedLanguage;
  default_currency: SupportedCurrency;
  default_country: SupportedCountry;
  timezone: string;
}
