/**
 * E.164 Phone number validation regular expression.
 * Format: +[country_code][subscriber_number] (up to 15 digits total, no spaces, hyphens, or brackets).
 * Examples: +254712345678, +14155552671
 */
export const E164_PHONE_REGEX = /^\+[1-9]\d{1,14}$/;

/**
 * Validates whether a phone number matches the E.164 format.
 */
export function isValidE164Phone(phone: string): boolean {
  return E164_PHONE_REGEX.test(phone);
}

/**
 * Clean a phone number by removing all whitespace, parentheses, and hyphens.
 * Prepends '+' if missing and the number starts with country code, but returns standard digits.
 */
export function cleanPhoneNumber(phone: string): string {
  if (!phone) return "";
  let cleaned = phone.replace(/[^\d+]/g, "");
  // If it starts with country digits but lacks +, prepend it
  if (/^[1-9]\d{9,14}$/.test(cleaned)) {
    cleaned = "+" + cleaned;
  }
  return cleaned;
}

/**
 * Formats a phone number for elegant localized UI display based on country codes.
 */
export function formatPhone(phone: string): string {
  if (!phone) return "";
  
  const cleaned = phone.replace(/[^\d+]/g, "");

  // Kenyan format: +254 712 345678 or +254 20 1234567
  if (cleaned.startsWith("+254")) {
    const match = cleaned.match(/^(\+254)(\d{3})(\d{6})$/);
    if (match) return `${match[1]} ${match[2]} ${match[3]}`;
    const matchAlt = cleaned.match(/^(\+254)(\d{2})(\d{7})$/);
    if (matchAlt) return `${matchAlt[1]} ${matchAlt[2]} ${matchAlt[3]}`;
  } 
  // Tanzanian format: +255 712 345 678
  else if (cleaned.startsWith("+255")) {
    const match = cleaned.match(/^(\+255)(\d{3})(\d{3})(\d{3})$/);
    if (match) return `${match[1]} ${match[2]} ${match[3]} ${match[4]}`;
  } 
  // Ugandan format: +256 712 345678
  else if (cleaned.startsWith("+256")) {
    const match = cleaned.match(/^(\+256)(\d{3})(\d{6})$/);
    if (match) return `${match[1]} ${match[2]} ${match[3]}`;
  } 
  // Rwandan format: +250 788 123 456
  else if (cleaned.startsWith("+250")) {
    const match = cleaned.match(/^(\+250)(\d{3})(\d{3})(\d{3})$/);
    if (match) return `${match[1]} ${match[2]} ${match[3]} ${match[4]}`;
  } 
  // US/Canada format: +1 (123) 456-7890
  else if (cleaned.startsWith("+1")) {
    const match = cleaned.match(/^(\+1)(\d{3})(\d{3})(\d{4})$/);
    if (match) return `${match[1]} (${match[2]}) ${match[3]}-${match[4]}`;
  }

  // Fallback: return raw cleaned string
  return cleaned;
}
