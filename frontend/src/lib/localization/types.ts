/**
 * Represents the regional localization settings for the active branch or user session.
 */
export interface LocalizationProfile {
  country_code: string; // e.g. "KE" | "TZ" | "UG" | "RW" | "US"
  currency: string;     // e.g. "KES" | "TZS" | "UGX" | "RWF" | "USD"
  language: string;     // e.g. "en" | "sw" | "rw"
}

/**
 * Standard default localization profile for Church Nexus (defaulting to East Africa / Kenya).
 */
export const DEFAULT_LOCALIZATION_PROFILE: LocalizationProfile = {
  country_code: "KE",
  currency: "KES",
  language: "en",
};
