"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { AUTH_ROUTES } from "@/constants/routes";
import { resetPassword } from "@/features/auth/services/auth-service";
import type { ResetPasswordFormValues } from "@/features/auth/schemas/auth-schemas";

export function useResetPassword(token: string) {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const submit = async (values: ResetPasswordFormValues) => {
    if (!token) {
      setError("Invalid or missing reset token.");
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      await resetPassword({
        token,
        password: values.password,
      });
      setIsSuccess(true);
      toast.success("Password reset successfully. You can now sign in.");

      setTimeout(() => {
        router.replace(AUTH_ROUTES.LOGIN);
      }, 2000);
    } catch (err) {
      const message =
        err instanceof Error
          ? err.message
          : "Unable to reset password. Please try again.";
      setError(message);
      toast.error(message);
    } finally {
      setIsLoading(false);
    }
  };

  return { submit, isLoading, isSuccess, error, hasToken: Boolean(token) };
}
