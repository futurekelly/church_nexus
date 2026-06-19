"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { PUBLIC_ROUTES } from "@/constants/routes";
import { loginUser, registerUser } from "@/features/auth/services/auth-service";
import type { RegisterFormValues } from "@/features/auth/schemas/auth-schemas";
import { persistSession } from "@/features/auth/utils/session";

export function useRegister() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const register = async (values: RegisterFormValues) => {
    setIsLoading(true);
    setError(null);

    try {
      await registerUser({
        first_name: values.first_name,
        last_name: values.last_name,
        email: values.email,
        password: values.password,
        branch: values.branch,
      });

      const session = await loginUser({
        email: values.email,
        password: values.password,
      });

      persistSession({
        user: session.user,
        tokens: {
          access_token: session.access_token,
          refresh_token: session.refresh_token,
        },
      });

      toast.success(`Welcome, ${values.first_name}!`, {
        description: "Your account request has been sent to the admin. You can browse under the Visitor role while waiting for approval.",
        duration: 8000,
      });
      router.replace(PUBLIC_ROUTES.HOME);
    } catch (err) {
      const message =
        err instanceof Error
          ? err.message
          : "Registration failed. Please try again.";
      setError(message);
      toast.error(message);
    } finally {
      setIsLoading(false);
    }
  };

  return { register, isLoading, error };
}
