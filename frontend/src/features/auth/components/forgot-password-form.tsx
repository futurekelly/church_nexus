"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { motion } from "framer-motion";
import Link from "next/link";
import { useForm } from "react-hook-form";
import { AUTH_ROUTES } from "@/constants/routes";
import { AuthButton } from "@/features/auth/components/auth-button";
import { AuthCard } from "@/features/auth/components/auth-card";
import { AuthFormField } from "@/features/auth/components/auth-form-field";
import { useForgotPassword } from "@/features/auth/hooks/use-forgot-password";
import { useTranslation } from "@/hooks/use-translation";
import {
  forgotPasswordSchema,
  type ForgotPasswordFormValues,
} from "@/features/auth/schemas/auth-schemas";
import { cn } from "@/lib/utils";

export function ForgotPasswordForm() {
  const { t } = useTranslation();
  const { submit, isLoading, isSuccess, error } = useForgotPassword();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ForgotPasswordFormValues>({
    resolver: zodResolver(forgotPasswordSchema),
    defaultValues: { email: "" },
  });

  if (isSuccess) {
    return (
      <AuthCard
        title="Check Your Email"
        subtitle="If an account exists for that address, password reset instructions have been sent."
        footer={
          <Link
            href={AUTH_ROUTES.LOGIN}
            className="font-medium text-primary transition-colors hover:text-primary/80"
          >
            Return to sign in
          </Link>
        }
      >
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="rounded-lg border border-success/30 bg-success/10 px-4 py-6 text-center text-sm text-success"
        >
          Please check your inbox and follow the link to reset your password.
        </motion.div>
      </AuthCard>
    );
  }

  return (
    <AuthCard
      title={t("auth.forgot_password.title")}
      subtitle={t("auth.forgot_password.subtitle")}
      footer={
        <Link
          href={AUTH_ROUTES.LOGIN}
          className="font-medium text-primary transition-colors hover:text-primary/80"
        >
          {t("auth.forgot_password.back_to_login")}
        </Link>
      }
    >
      <form onSubmit={handleSubmit(submit)} className="space-y-5" noValidate>
        {error && (
          <div
            role="alert"
            className="rounded-lg border border-warning/30 bg-warning/10 px-4 py-3 text-sm text-warning"
          >
            {error}
          </div>
        )}

        <AuthFormField
          label={t("auth.forgot_password.email_label")}
          htmlFor="email"
          error={errors.email?.message}
        >
          <input
            id="email"
            type="email"
            autoComplete="email"
            className={cn(
              "w-full rounded-lg border border-border bg-card/50 px-4 py-2.5 text-sm",
              "text-primary-foreground placeholder:text-muted-foreground",
              "transition-colors focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary",
              errors.email && "border-warning",
            )}
            placeholder="you@example.com"
            {...register("email")}
          />
        </AuthFormField>

        <AuthButton isLoading={isLoading}>{t("auth.forgot_password.submit_btn")}</AuthButton>
      </form>
    </AuthCard>
  );
}
