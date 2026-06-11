import { DASHBOARD_ROUTES, PUBLIC_ROUTES } from "@/constants/routes";

const DEFAULT_FALLBACK = DASHBOARD_ROUTES.ROOT;

/**
 * Returns true when pathname is an allowed internal post-login destination:
 * `/`, `/dashboard`, or `/dashboard/*`
 */
export function isAllowedRedirectPath(pathname: string): boolean {
  if (pathname.includes("..")) return false;
  if (pathname === PUBLIC_ROUTES.HOME) return true;
  if (pathname === DASHBOARD_ROUTES.ROOT) return true;
  if (pathname.startsWith(`${DASHBOARD_ROUTES.ROOT}/`)) return true;
  return false;
}

function decodeRedirectPath(value: string): string | null {
  try {
    return decodeURIComponent(value);
  } catch {
    return null;
  }
}

function extractPathname(path: string): string {
  return path.split("?")[0]?.split("#")[0] ?? path;
}

function isRejectedRedirect(value: string): boolean {
  const trimmed = value.trim();
  if (!trimmed) return true;

  // Protocol-relative URLs (//example.com)
  if (trimmed.startsWith("//")) return true;

  const lower = trimmed.toLowerCase();

  // Absolute external URLs
  if (lower.startsWith("http://") || lower.startsWith("https://")) return true;
  if (lower.includes("://")) return true;

  // Backslash-based bypass attempts
  if (trimmed.includes("\\")) return true;

  // Must be a root-relative path
  if (!trimmed.startsWith("/")) return true;

  return false;
}

/**
 * Validates a post-login redirect target and returns a safe internal path.
 * Rejects external URLs, protocol-relative URLs, and paths outside the allowlist.
 */
export function getSafeRedirectPath(
  redirect: string | null | undefined,
  fallback: string = DEFAULT_FALLBACK,
): string {
  if (!redirect) return fallback;

  if (isRejectedRedirect(redirect)) return fallback;

  let candidate = redirect.trim();

  if (candidate.includes("%")) {
    const decoded = decodeRedirectPath(candidate);
    if (!decoded || isRejectedRedirect(decoded)) return fallback;
    candidate = decoded;
  }

  const pathname = extractPathname(candidate);

  if (!isAllowedRedirectPath(pathname)) return fallback;

  return candidate;
}
