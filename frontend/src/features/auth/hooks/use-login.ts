"use client";

import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { toast } from "sonner";
import { DASHBOARD_ROUTES, PUBLIC_ROUTES } from "@/constants/routes";
import { loginUser } from "@/features/auth/services/auth-service";
import { getSafeRedirectPath } from "@/features/auth/utils/safe-redirect";
import {
  clearRememberedEmail,
  persistSession,
  saveRememberedEmail,
} from "@/features/auth/utils/session";
import type { LoginFormValues } from "@/features/auth/schemas/auth-schemas";
import { DASHBOARD_ROLES } from "@/types/roles";

export function useLogin() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const login = async (values: LoginFormValues) => {
    setIsLoading(true);
    setError(null);

    try {
      const result = await loginUser({
        email: values.email,
        password: values.password,
      });

      persistSession({
        user: result.user,
        tokens: {
          access_token: result.access_token,
          refresh_token: result.refresh_token,
        },
      });

      if (values.remember_me) {
        saveRememberedEmail(values.email);
      } else {
        clearRememberedEmail();
      }

      toast.success("Welcome back!");

      const redirect = searchParams.get("redirect");
      const hasDashboardAccess = DASHBOARD_ROLES.includes(result.user.role);

      if (hasDashboardAccess) {
        router.replace(
          getSafeRedirectPath(redirect, DASHBOARD_ROUTES.ROOT),
        );
      } else {
        router.replace(PUBLIC_ROUTES.HOME);
      }
    } catch (err) {
      const message =
        err instanceof Error ? err.message : "Login failed. Please try again.";
      setError(message);
      toast.error(message);
    } finally {
      setIsLoading(false);
    }
  };

  return { login, isLoading, error };
}
