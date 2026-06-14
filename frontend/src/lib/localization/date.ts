/**
 * Formats a Date object, ISO string, or timestamp into a localized human-readable string.
 */
export function formatDate(
  date: Date | string | number,
  options: Intl.DateTimeFormatOptions = {
    year: "numeric",
    month: "long",
    day: "numeric",
  },
  locale: string = "en-US"
): string {
  if (!date) return "";
  const d = typeof date === "string" || typeof date === "number" ? new Date(date) : date;
  if (isNaN(d.getTime())) return "";

  try {
    return new Intl.DateTimeFormat(locale, options).format(d);
  } catch (error) {
    console.warn(`Error formatting date:`, error);
    return d.toLocaleDateString(locale, options);
  }
}
