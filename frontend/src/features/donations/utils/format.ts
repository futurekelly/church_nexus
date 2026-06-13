/**
 * Formats a number of Tanzanian Shillings (TZS) as a currency string.
 * Example: 150000 -> "TZS 150,000"
 */
export function formatTZS(amount: number): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "TZS",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  })
    .format(amount)
    .replace("TZS", "TZS ") // Ensure a space between code and amount if formatting doesn't add it
    .replace(/\s+/g, " ") // Clean double spaces
    .trim();
}
