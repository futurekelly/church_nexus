/**
 * Formats a numeric amount to a localized currency string.
 * Supports East African currencies (TZS, KES, UGX, RWF) and USD.
 * East African currencies default to displaying no decimals, matching regional custom.
 */
export function formatCurrency(
  amount: number,
  currency: "TZS" | "KES" | "UGX" | "RWF" | "USD" | string,
  locale?: string
): string {
  let defaultLocale = locale;
  if (!defaultLocale) {
    switch (currency.toUpperCase()) {
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
    const uppercaseCurrency = currency.toUpperCase();
    const isUSD = uppercaseCurrency === "USD";
    return new Intl.NumberFormat(defaultLocale, {
      style: "currency",
      currency: uppercaseCurrency,
      minimumFractionDigits: isUSD ? 2 : 0,
      maximumFractionDigits: isUSD ? 2 : 0,
    }).format(amount);
  } catch (error) {
    console.warn(`Error formatting currency:`, error);
    return `${currency.toUpperCase()} ${amount.toLocaleString()}`;
  }
}
