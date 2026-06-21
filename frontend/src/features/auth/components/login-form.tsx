"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import Link from "next/link";
import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { AUTH_ROUTES } from "@/constants/routes";
import { AuthButton } from "@/features/auth/components/auth-button";
import { AuthCard } from "@/features/auth/components/auth-card";
import { AuthFormField } from "@/features/auth/components/auth-form-field";
import { PasswordInput } from "@/features/auth/components/password-input";
import { useLogin } from "@/features/auth/hooks/use-login";
import {
  loginSchema,
  type LoginFormValues,
} from "@/features/auth/schemas/auth-schemas";
import { getRememberedEmail } from "@/features/auth/utils/session";
import { useTranslation } from "@/hooks/use-translation";
import { cn } from "@/lib/utils";

export function LoginForm() {
  const { t } = useTranslation();
  const { login, isLoading, error } = useLogin();

  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors },
  } = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: "",
      password: "",
      remember_me: false,
    },
  });

  useEffect(() => {
    const remembered = getRememberedEmail();
    if (remembered) {
      setValue("email", remembered);
      setValue("remember_me", true);
    }
  }, [setValue]);

  return (
    <AuthCard
      title={t("auth.login.title")}
      subtitle={t("auth.login.subtitle")}
      footer={
        <p>
          {t("auth.login.no_account")}{" "}
          <Link
            href={AUTH_ROUTES.REGISTER}
            className="font-medium text-primary transition-colors hover:text-primary/80"
          >
            {t("auth.login.register_link")}
          </Link>
        </p>
      }
    >
      <form onSubmit={handleSubmit(login)} className="space-y-5" noValidate>
        {error && (
          <div
            role="alert"
            className="rounded-lg border border-warning/30 bg-warning/10 px-4 py-3 text-sm text-warning"
          >
            {error}
          </div>
        )}

        <AuthFormField
          label={t("auth.login.email_label")}
          htmlFor="email"
          error={errors.email?.message}
        >
          <input
            id="email"
            type="email"
            autoComplete="email"
            aria-invalid={errors.email ? true : undefined}
            aria-describedby={errors.email ? "email-error" : undefined}
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

        <AuthFormField
          label={t("auth.login.password_label")}
          htmlFor="password"
          error={errors.password?.message}
        >
          <PasswordInput
            id="password"
            autoComplete="current-password"
            error={Boolean(errors.password)}
            placeholder={t("auth.login.password_label")}
            {...register("password")}
          />
        </AuthFormField>

        <div className="flex items-center justify-between">
          <label className="flex cursor-pointer items-center gap-2 text-sm text-muted-foreground">
            <input
              type="checkbox"
              className="h-4 w-4 rounded border-border bg-card accent-primary"
              {...register("remember_me")}
            />
            {t("auth.login.remember_me")}
          </label>
          <Link
            href={AUTH_ROUTES.FORGOT_PASSWORD}
            className="text-sm font-medium text-primary transition-colors hover:text-primary/80"
          >
            {t("auth.login.forgot_password")}
          </Link>
        </div>

        <AuthButton isLoading={isLoading}>{t("auth.login.submit_btn")}</AuthButton>
      </form>
    </AuthCard>
  );
}
