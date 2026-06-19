import { DEFAULT_LOCALIZATION_PROFILE, type LocalizationProfile } from "./types";

/**
 * Resolves the active localization profile from localStorage (if browser context)
 * or defaults to the standard Kenya/KES/en profile.
 */
export function getActiveLocalizationProfile(): LocalizationProfile {
  if (typeof window === "undefined") return DEFAULT_LOCALIZATION_PROFILE;
  try {
    const stored = window.localStorage.getItem("church-localization-profile");
    if (stored) {
      return JSON.parse(stored);
    }
  } catch (error) {
    console.warn("Error reading localization profile from localStorage:", error);
  }
  return DEFAULT_LOCALIZATION_PROFILE;
}

/**
 * Formats a numeric amount to a localized currency string.
 * Resolves currency dynamically from getActiveLocalizationProfile() if not passed explicitly.
 */
export function formatCurrency(
  amount: number,
  currency?: "TZS" | "KES" | "UGX" | "RWF" | "USD" | string,
  locale?: string
): string {
  const activeCurrency = currency || getActiveLocalizationProfile().currency;
  
  let defaultLocale = locale;
  if (!defaultLocale) {
    switch (activeCurrency.toUpperCase()) {
      case "TZS":
        defaultLocale = "sw-TZ";
        break;
      case "KES":
        defaultLocale = "en-KE";
        break;
      case "UGX":
        defaultLocale = "en-UG";
        break;
      case "RWF":
        defaultLocale = "rw-RW";
        break;
      case "USD":
      default:
        defaultLocale = "en-US";
        break;
    }
  }

  try {
    const uppercaseCurrency = activeCurrency.toUpperCase();
    const isUSD = uppercaseCurrency === "USD";
    return new Intl.NumberFormat(defaultLocale, {
      style: "currency",
      currency: uppercaseCurrency,
      minimumFractionDigits: isUSD ? 2 : 0,
      maximumFractionDigits: isUSD ? 2 : 0,
    }).format(amount);
  } catch (error) {
    console.warn(`Error formatting currency:`, error);
    return `${activeCurrency.toUpperCase()} ${amount.toLocaleString()}`;
  }
}
