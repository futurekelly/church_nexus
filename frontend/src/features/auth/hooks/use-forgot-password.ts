"use client";

import { useState } from "react";
import { toast } from "sonner";
import { requestPasswordReset } from "@/features/auth/services/auth-service";
import type { ForgotPasswordFormValues } from "@/features/auth/schemas/auth-schemas";

export function useForgotPassword() {
  const [isLoading, setIsLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const submit = async (values: ForgotPasswordFormValues) => {
    setIsLoading(true);
    setError(null);

    try {
      await requestPasswordReset({ email: values.email });
      setIsSuccess(true);
      toast.success("Password reset instructions sent to your email.");
    } catch (err) {
      const message =
        err instanceof Error
          ? err.message
          : "Unable to process request. Please try again.";
      setError(message);
      toast.error(message);
    } finally {
      setIsLoading(false);
    }
  };

  return { submit, isLoading, isSuccess, error };
}
