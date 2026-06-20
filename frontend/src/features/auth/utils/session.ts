import type { AuthSession } from "@/types/user";
import { useAuthStore } from "@/store/auth-store";

const ACCESS_TOKEN_COOKIE = "access_token";
const REMEMBER_EMAIL_KEY = "church-remember-email";

function setAccessTokenCookie(token: string): void {
  const secure = process.env.NODE_ENV === "production" ? "; Secure" : "";
  document.cookie = `${ACCESS_TOKEN_COOKIE}=${token}; path=/; SameSite=Lax${secure}`;
}

export function clearAccessTokenCookie(): void {
  document.cookie = `${ACCESS_TOKEN_COOKIE}=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT`;
}

export function persistSession(session: AuthSession): void {
  useAuthStore.getState().setSession(session);
  setAccessTokenCookie(session.tokens.access_token);
}

export function clearSession(): void {
  console.log("session.ts: clearSession called");
  clearAccessTokenCookie();
  console.log("session.ts: Cookie cleared, current document.cookie:", document.cookie);
  useAuthStore.getState().clearSession();
  console.log("session.ts: Zustand session cleared");
}

export function saveRememberedEmail(email: string): void {
  localStorage.setItem(REMEMBER_EMAIL_KEY, email);
}

export function getRememberedEmail(): string | null {
  if (typeof window === "undefined") return null;
  return localStorage.getItem(REMEMBER_EMAIL_KEY);
}

export function clearRememberedEmail(): void {
  localStorage.removeItem(REMEMBER_EMAIL_KEY);
}
