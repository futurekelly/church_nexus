"use client";

import { useEffect, type ReactNode } from "react";
import { API_ENDPOINTS } from "@/constants/api-endpoints";
import {
  apiPost,
  getErrorMessage,
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

  useEffect(() => {
    initializeApiClient({
      getAccessToken,
      refreshTokens: async (): Promise<AuthTokens | null> => {
        const refreshToken = useAuthStore.getState().tokens?.refresh_token;
        if (!refreshToken) return null;

        try {
          const response = await apiPost<AuthTokens>(
            API_ENDPOINTS.AUTH.REFRESH,
            { refresh_token: refreshToken },
            { skipAuth: true } as never,
          );

          if (isApiError(response)) return null;

          setTokens(response.data);
          setAccessTokenCookie(response.data.access_token);
          return response.data;
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

  useEffect(() => {
    if (isHydrated && tokens?.access_token) {
      setAccessTokenCookie(tokens.access_token);
    }
  }, [isHydrated, tokens?.access_token]);

  return <>{children}</>;
}

export { ACCESS_TOKEN_COOKIE };
