"use client";

import { useEffect, type ReactNode } from "react";
import { API_ENDPOINTS } from "@/constants/api-endpoints";
import {
  initializeApiClient,
  getApiClient,
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

  // Initialize immediately on render so child components rendering during the same cycle never see uninitialized client
  initializeApiClient({
    getAccessToken,
    refreshTokens: async (): Promise<AuthTokens | null> => {
      try {
        const apiClient = getApiClient();
        const response = await apiClient.post<{ access: string }>(
          API_ENDPOINTS.AUTH.REFRESH,
          {},
          { skipAuth: true } as never,
        );

        if (!response.data?.access) return null;

        const newTokens: AuthTokens = {
          access_token: response.data.access,
          refresh_token: "",
        };

        setTokens(newTokens);
        setAccessTokenCookie(newTokens.access_token);
        return newTokens;
      } catch (err: any) {
        const status = err.response?.status;
        if (status === 400 || status === 401) {
          return null;
        }
        throw err;
      }
    },
    clearSession: () => {
      clearAccessTokenCookie();
      clearSession();
    },
  });

  useEffect(() => {
    // Re-bind on hydration / state changes if needed
  }, [clearSession, setTokens]);

  // Silent refresh on hydration / page reload
  useEffect(() => {
    async function performSilentRefresh() {
      if (isHydrated && isAuthenticated && !getAccessToken()) {
        try {
          const apiClient = getApiClient();
          const response = await apiClient.post<{ access: string }>(
            API_ENDPOINTS.AUTH.REFRESH,
            {},
            { skipAuth: true } as never,
          );

          if (response.data?.access) {
            const newTokens: AuthTokens = {
              access_token: response.data.access,
              refresh_token: "",
            };
            setTokens(newTokens);
            setAccessTokenCookie(newTokens.access_token);
          }
        } catch {
          // Keep session intact on transient background network glitches
        }
      }
    }

    performSilentRefresh();
  }, [isHydrated, isAuthenticated, setTokens]);

  // Periodic token refresh every 45 minutes to keep session alive during active use
  useEffect(() => {
    if (!isHydrated || !isAuthenticated) return;

    const intervalId = setInterval(async () => {
      try {
        const apiClient = getApiClient();
        const response = await apiClient.post<{ access: string }>(
          API_ENDPOINTS.AUTH.REFRESH,
          {},
          { skipAuth: true } as never,
        );

        if (response.data?.access) {
          const newTokens: AuthTokens = {
            access_token: response.data.access,
            refresh_token: "",
          };
          setTokens(newTokens);
          setAccessTokenCookie(newTokens.access_token);
        }
      } catch (err: any) {
        const status = err.response?.status;
        if (status === 400 || status === 401) {
          clearAccessTokenCookie();
          clearSession();
        }
      }
    }, 45 * 60 * 1000); // 45 minutes

    return () => clearInterval(intervalId);
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
