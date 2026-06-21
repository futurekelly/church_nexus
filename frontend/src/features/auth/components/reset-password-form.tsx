"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { motion } from "framer-motion";
import Link from "next/link";
import { useForm } from "react-hook-form";
import { AUTH_ROUTES } from "@/constants/routes";
import { AuthButton } from "@/features/auth/components/auth-button";
import { AuthCard } from "@/features/auth/components/auth-card";
import { AuthFormField } from "@/features/auth/components/auth-form-field";
import { PasswordInput } from "@/features/auth/components/password-input";
import { useResetPassword } from "@/features/auth/hooks/use-reset-password";
import { useTranslation } from "@/hooks/use-translation";
import {
  resetPasswordSchema,
  type ResetPasswordFormValues,
} from "@/features/auth/schemas/auth-schemas";

interface ResetPasswordFormProps {
  uid: string;
  token: string;
}

export function ResetPasswordForm({ uid, token }: ResetPasswordFormProps) {
  const { t } = useTranslation();
  const { submit, isLoading, isSuccess, error, hasToken } =
    useResetPassword(uid, token);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ResetPasswordFormValues>({
    resolver: zodResolver(resetPasswordSchema),
    defaultValues: {
      password: "",
      confirm_password: "",
    },
  });

  if (!hasToken) {
    return (
      <AuthCard
        title="Invalid Reset Link"
        subtitle="This password reset link is invalid or has expired."
        footer={
          <Link
            href={AUTH_ROUTES.FORGOT_PASSWORD}
            className="font-medium text-primary transition-colors hover:text-primary/80"
          >
            Request a new link
          </Link>
        }
      >
        <div className="rounded-lg border border-warning/30 bg-warning/10 px-4 py-6 text-center text-sm text-warning">
          Please request a new password reset email to continue.
        </div>
      </AuthCard>
    );
  }

  if (isSuccess) {
    return (
      <AuthCard
        title="Password Updated"
        subtitle="Redirecting you to sign in..."
      >
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="rounded-lg border border-success/30 bg-success/10 px-4 py-6 text-center text-sm text-success"
        >
          Your password has been reset successfully.
        </motion.div>
      </AuthCard>
    );
  }

  return (
    <AuthCard
      title={t("auth.reset_password.title")}
      subtitle={t("auth.reset_password.subtitle")}
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
          label={t("auth.reset_password.new_password")}
          htmlFor="password"
          error={errors.password?.message}
        >
          <PasswordInput
            id="password"
            autoComplete="new-password"
            error={Boolean(errors.password)}
            placeholder={t("auth.reset_password.new_password")}
            {...register("password")}
          />
        </AuthFormField>

        <AuthFormField
          label={t("auth.reset_password.confirm_password")}
          htmlFor="confirm_password"
          error={errors.confirm_password?.message}
        >
          <PasswordInput
            id="confirm_password"
            autoComplete="new-password"
            error={Boolean(errors.confirm_password)}
            placeholder={t("auth.reset_password.confirm_password")}
            {...register("confirm_password")}
          />
        </AuthFormField>

        <AuthButton isLoading={isLoading}>{t("auth.reset_password.submit_btn")}</AuthButton>
      </form>
    </AuthCard>
  );
}
