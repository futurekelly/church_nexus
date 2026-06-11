"use client";

import { useCallback } from "react";
import { useAuthStore } from "@/store/auth-store";
import type { Role } from "@/types/roles";
import type { User } from "@/types/user";

export function useAuth() {
  const user = useAuthStore((state) => state.user);
  const tokens = useAuthStore((state) => state.tokens);
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  const isHydrated = useAuthStore((state) => state.isHydrated);
  const clearSession = useAuthStore((state) => state.clearSession);

  const role = user?.role ?? null;

  const hasRole = useCallback(
    (requiredRole: Role | Role[]) => {
      if (!role) return false;
      return Array.isArray(requiredRole)
        ? requiredRole.includes(role)
        : role === requiredRole;
    },
    [role],
  );

  const getDisplayName = useCallback((currentUser: User | null = user) => {
    if (!currentUser) return "";
    return `${currentUser.first_name} ${currentUser.last_name}`.trim();
  }, [user]);

  return {
    user,
    tokens,
    role,
    isAuthenticated,
    isHydrated,
    isLoading: !isHydrated,
    hasRole,
    getDisplayName,
    clearSession,
  };
}
