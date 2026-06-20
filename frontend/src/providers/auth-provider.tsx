"use client";

import { useEffect, type ReactNode } from "react";
import { API_ENDPOINTS } from "@/constants/api-endpoints";
import {
  apiPost,
  initializeApiClient,
  isApiError,
} from "@/services/api-client";
import { getAccessToken, useAuthStore } from "@/store/auth-store";
import type { AuthTokens } from "@/types/user";

const ACCESS_TOKEN_COOKIE = "access_token";

function setAccessTokenCookie(token: string): void {
  const secure =
    process.env.NODE_ENV === "production" ? "; Secure" : "";
  document.cookie = `${ACCESS_TOKEN_COOKIE}=${token}; path=/; SameSite=Lax${secure}`;
}

function clearAccessTokenCookie(): void {
  document.cookie = `${ACCESS_TOKEN_COOKIE}=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT`;
}

interface AuthProviderProps {
  children: ReactNode;
}

export function AuthProvider({ children }: AuthProviderProps) {
  const tokens = useAuthStore((state) => state.tokens);
  const setTokens = useAuthStore((state) => state.setTokens);
  const clearSession = useAuthStore((state) => state.clearSession);
  const isHydrated = useAuthStore((state) => state.isHydrated);
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);

  useEffect(() => {
    initializeApiClient({
      getAccessToken,
      refreshTokens: async (): Promise<AuthTokens | null> => {
        try {
          const response = await apiPost<{ access: string }>(
            API_ENDPOINTS.AUTH.REFRESH,
            {},
            { skipAuth: true } as never,
          );

          if (isApiError(response) || !response.data?.access) return null;

          const newTokens: AuthTokens = {
            access_token: response.data.access,
            refresh_token: "",
          };

          setTokens(newTokens);
          setAccessTokenCookie(newTokens.access_token);
          return newTokens;
        } catch {
          return null;
        }
      },
      clearSession: () => {
        clearAccessTokenCookie();
        clearSession();
      },
    });
  }, [clearSession, setTokens]);

  // Silent refresh on hydration / page reload
  useEffect(() => {
    async function performSilentRefresh() {
      if (isHydrated && isAuthenticated && !getAccessToken()) {
        try {
          const response = await apiPost<{ access: string }>(
            API_ENDPOINTS.AUTH.REFRESH,
            {},
            { skipAuth: true } as never,
          );

          if (!isApiError(response) && response.data?.access) {
            const newTokens: AuthTokens = {
              access_token: response.data.access,
              refresh_token: "",
            };
            setTokens(newTokens);
            setAccessTokenCookie(newTokens.access_token);
          } else {
            clearAccessTokenCookie();
            clearSession();
          }
        } catch {
          clearAccessTokenCookie();
          clearSession();
        }
      }
    }

    performSilentRefresh();
  }, [isHydrated, isAuthenticated, setTokens, clearSession]);

  useEffect(() => {
    if (isHydrated) {
      if (tokens?.access_token) {
        setAccessTokenCookie(tokens.access_token);
      } else if (!isAuthenticated) {
        clearAccessTokenCookie();
      }
    }
  }, [isHydrated, tokens?.access_token, isAuthenticated]);

  return <>{children}</>;
}

export { ACCESS_TOKEN_COOKIE };
