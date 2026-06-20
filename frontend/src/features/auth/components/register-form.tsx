"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { AnimatePresence, motion } from "framer-motion";
import Link from "next/link";
import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { AUTH_ROUTES } from "@/constants/routes";
import { apiGet } from "@/services/api-client";
import { AuthButton } from "@/features/auth/components/auth-button";
import { AuthCard } from "@/features/auth/components/auth-card";
import { AuthFormField } from "@/features/auth/components/auth-form-field";
import { MultiStepProgress } from "@/features/auth/components/multi-step-progress";
import { PasswordInput } from "@/features/auth/components/password-input";
import { useRegister } from "@/features/auth/hooks/use-register";
import {
  REGISTER_STEP_FIELDS,
  registerSchema,
  type RegisterFormValues,
} from "@/features/auth/schemas/auth-schemas";
import { cn } from "@/lib/utils";

const STEP_LABELS = ["Basic Info", "Contact & Branch", "Credentials", "Confirm"];

export function RegisterForm() {
  const [step, setStep] = useState(1);
  const { register: submitRegistration, isLoading, error } = useRegister();

  interface BranchInfo {
    id: string;
    branch_name: string;
    branch_code: string;
  }
  const [branches, setBranches] = useState<BranchInfo[]>([
    { id: "hq-branch", branch_name: "Headquarters Branch", branch_code: "HQ001" },
    { id: "branch-001", branch_name: "Branch 001", branch_code: "BR001" }
  ]);

  useEffect(() => {
    let active = true;
    async function loadBranches() {
      try {
        const response = await apiGet<any>("/api/branches/");
        if (response.success) {
          const list = response.data;
          let branchList: BranchInfo[] = [];
          if (Array.isArray(list)) {
            branchList = list;
          } else if (list && Array.isArray(list.results)) {
            branchList = list.results;
          }
          if (active) {
            setBranches(branchList);
          }
        }
      } catch (err) {
        console.error("Failed to load branches:", err);
      }
    }
    loadBranches();
    return () => {
      active = false;
    };
  }, []);

  const form = useForm<RegisterFormValues>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      first_name: "",
      last_name: "",
      gender: "male",
      email: "",
      branch: "hq-branch",
      password: "",
      confirm_password: "",
    },
    mode: "onBlur",
  });

  const {
    register,
    handleSubmit,
    trigger,
    getValues,
    formState: { errors },
  } = form;

  const goNext = async () => {
    const fields = REGISTER_STEP_FIELDS[step];
    if (!fields) return;
    const valid = await trigger(fields);
    if (!valid) return;
    setStep((prev) => Math.min(prev + 1, 4));
  };

  const goBack = () => setStep((prev) => Math.max(prev - 1, 1));

  const onSubmit = handleSubmit(async (values) => {
    await submitRegistration(values);
  });

  const values = getValues();

  return (
    <AuthCard
      title="Join the Community"
      subtitle="Create your account — new members start as Visitors"
      className="max-w-lg"
      footer={
        <p>
          Already have an account?{" "}
          <Link
            href={AUTH_ROUTES.LOGIN}
            className="font-medium text-primary transition-colors hover:text-primary/80"
          >
            Sign in
          </Link>
        </p>
      }
    >
      <MultiStepProgress
        currentStep={step}
        totalSteps={4}
        labels={STEP_LABELS}
      />

      <form onSubmit={onSubmit} className="space-y-5" noValidate>
        {error && (
          <div
            role="alert"
            className="rounded-lg border border-warning/30 bg-warning/10 px-4 py-3 text-sm text-warning"
          >
            {error}
          </div>
        )}

        <AnimatePresence mode="wait">
          {step === 1 && (
            <motion.div
              key="step-1"
              initial={{ opacity: 0, x: 12 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -12 }}
              transition={{ duration: 0.25 }}
              className="space-y-4"
            >
              <AuthFormField
                label="First Name"
                htmlFor="first_name"
                error={errors.first_name?.message as string | undefined}
              >
                <input
                  id="first_name"
                  autoComplete="given-name"
                  className={inputClass(Boolean(errors.first_name))}
                  placeholder="John"
                  {...register("first_name")}
                />
              </AuthFormField>
              <AuthFormField
                label="Last Name"
                htmlFor="last_name"
                error={errors.last_name?.message as string | undefined}
              >
                <input
                  id="last_name"
                  autoComplete="family-name"
                  className={inputClass(Boolean(errors.last_name))}
                  placeholder="Doe"
                  {...register("last_name")}
                />
              </AuthFormField>
              <AuthFormField
                label="Gender"
                htmlFor="gender"
                error={errors.gender?.message as string | undefined}
              >
                <select
                  id="gender"
                  className={cn(
                    inputClass(Boolean(errors.gender)),
                    "text-primary-foreground bg-card"
                  )}
                  {...register("gender")}
                >
                  <option value="male">Male</option>
                  <option value="female">Female</option>
                </select>
              </AuthFormField>
            </motion.div>
          )}

          {step === 2 && (
            <motion.div
              key="step-2"
              initial={{ opacity: 0, x: 12 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -12 }}
              transition={{ duration: 0.25 }}
              className="space-y-4"
            >
              <AuthFormField
                label="Email Address"
                htmlFor="email"
                error={errors.email?.message as string | undefined}
              >
                <input
                  id="email"
                  type="email"
                  autoComplete="email"
                  className={inputClass(Boolean(errors.email))}
                  placeholder="you@example.com"
                  {...register("email")}
                />
              </AuthFormField>

              <AuthFormField
                label="Local Branch"
                htmlFor="branch"
                error={errors.branch?.message as string | undefined}
              >
                <select
                  id="branch"
                  className={cn(
                    inputClass(Boolean(errors.branch)),
                    "text-primary-foreground bg-card"
                  )}
                  defaultValue={values.branch || "hq-branch"}
                  {...register("branch")}
                >
                  <option value="" disabled>Select your local branch</option>
                  {branches.map((b) => (
                    <option key={b.id} value={b.id} className="bg-slate-900 text-white">
                      {b.branch_name} ({b.branch_code})
                    </option>
                  ))}
                </select>
              </AuthFormField>
            </motion.div>
          )}

          {step === 3 && (
            <motion.div
              key="step-3"
              initial={{ opacity: 0, x: 12 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -12 }}
              transition={{ duration: 0.25 }}
              className="space-y-4"
            >
              <AuthFormField
                label="Password"
                htmlFor="password"
                error={errors.password?.message as string | undefined}
              >
                <PasswordInput
                  id="password"
                  autoComplete="new-password"
                  error={Boolean(errors.password)}
                  placeholder="Create a strong password"
                  {...register("password")}
                />
              </AuthFormField>
              <p className="text-xs text-muted-foreground">
                Minimum 8 characters with uppercase, lowercase, and a number.
              </p>
              <AuthFormField
                label="Confirm Password"
                htmlFor="confirm_password"
                error={errors.confirm_password?.message as string | undefined}
              >
                <PasswordInput
                  id="confirm_password"
                  autoComplete="new-password"
                  error={Boolean(errors.confirm_password)}
                  placeholder="Confirm your password"
                  {...register("confirm_password")}
                />
              </AuthFormField>
            </motion.div>
          )}

          {step === 4 && (
            <motion.div
              key="step-4"
              initial={{ opacity: 0, x: 12 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -12 }}
              transition={{ duration: 0.25 }}
              className="space-y-3 rounded-lg border border-border/50 bg-card/30 p-4 text-sm"
            >
              <ReviewRow label="Name" value={`${values.first_name} ${values.last_name}`} />
              <ReviewRow label="Gender" value={values.gender === "male" ? "Male" : "Female"} />
              <ReviewRow label="Email" value={values.email} />
              <ReviewRow label="Local Branch" value={branches.find((b) => b.id === values.branch)?.branch_name ?? "Not selected"} />
              <ReviewRow label="Role" value="Visitor (assigned on registration)" />
              <p className="pt-2 text-xs text-muted-foreground">
                By creating an account, you agree to join as a Visitor. A Super
                Admin can upgrade your role when appropriate.
              </p>
            </motion.div>
          )}
        </AnimatePresence>

        <div className="flex gap-3 pt-2">
          {step > 1 && (
            <AuthButton
              type="button"
              variant="ghost"
              onClick={goBack}
              disabled={isLoading}
              className="flex-1"
            >
              Back
            </AuthButton>
          )}

          {step < 4 ? (
            <AuthButton
              type="button"
              onClick={goNext}
              className="flex-1"
            >
              Continue
            </AuthButton>
          ) : (
            <AuthButton isLoading={isLoading} className="flex-1">
              Create Account
            </AuthButton>
          )}
        </div>
      </form>
    </AuthCard>
  );
}

function ReviewRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between gap-4">
      <span className="text-muted-foreground">{label}</span>
      <span className="font-medium text-primary-foreground">{value}</span>
    </div>
  );
}

function inputClass(hasError: boolean): string {
  return cn(
    "w-full rounded-lg border border-border bg-card/50 px-4 py-2.5 text-sm",
    "text-primary-foreground placeholder:text-muted-foreground",
    "transition-colors focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary",
    hasError && "border-warning",
  );
}
