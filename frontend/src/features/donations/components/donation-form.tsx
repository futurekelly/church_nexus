"use client";

import { useForm, Controller, type SubmitHandler } from "react-hook-form";
import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { CreditCard, Smartphone, Landmark, CheckCircle, Receipt, ArrowRight, Info } from "lucide-react";
import { useMembers } from "@/features/members/hooks/use-members";
import { useAppPermissions } from "@/hooks/use-app-permissions";
import { formatCurrency, E164_PHONE_REGEX } from "@/lib/localization";
import type { DonationType, PaymentMethod, PledgeCampaign } from "../types/donations.types";
import { cn } from "@/lib/utils";

interface DonationFormValues {
  donor_name: string;
  donor_email: string;
  amount: number;
  type: DonationType;
  payment_method: PaymentMethod;
  notes: string;
  campaign_id: string;
  link_member: boolean;
  anonymous: boolean;
  phone_number?: string;
}

interface DonationFormProps {
  campaigns: PledgeCampaign[];
  onSubmit: (values: {
    member_id: string | null;
    donor_name: string;
    donor_email?: string;
    amount: number;
    type: DonationType;
    payment_method: PaymentMethod;
    notes?: string;
    campaign_id?: string;
  }) => Promise<any>;
  isAdminEntry?: boolean;
}

const inputClass = cn(
  "w-full rounded-xl border border-border/50 bg-card/60 px-4 py-2.5",
  "text-sm text-primary-foreground placeholder:text-muted-foreground/50",
  "backdrop-blur-[16px] transition-all duration-200",
  "focus:border-primary/50 focus:outline-none focus:ring-2 focus:ring-primary/20"
);

const labelClass = "block text-xs font-medium text-muted-foreground mb-1.5";
const errorClass = "mt-1 text-xs text-red-400";

export function DonationForm({ campaigns, onSubmit, isAdminEntry = false }: DonationFormProps) {
  const { allMembers } = useMembers();
  const { donations: donationPermissions, userId, userEmail, userName } = useAppPermissions();
  const { isMember, userMemberId } = donationPermissions;
  const [matchedMember, setMatchedMember] = useState<any>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [successDonation, setSuccessDonation] = useState<any>(null);

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    control,
    formState: { errors },
  } = useForm<DonationFormValues>({
    defaultValues: {
      donor_name: "",
      donor_email: "",
            amount: 50000, // Default 50,000 TZS
      type: "Offering",
      payment_method: "Mobile Money",
      notes: "",
      campaign_id: "none",
      link_member: false,
      anonymous: false,
    },
  });

  const watchEmail = watch("donor_email");
  const watchAnonymous = watch("anonymous");
  const watchPaymentMethod = watch("payment_method");
  const watchAmount = watch("amount");
  const watchType = watch("type");

  // Autofill if logged-in member
  useEffect(() => {
    if (isMember && userId && !watchAnonymous) {
      setValue("donor_name", userName || "");
      setValue("donor_email", userEmail || "");
      setValue("link_member", true);
    }
  }, [isMember, userId, userName, userEmail, watchAnonymous, setValue]);

  // Lookup matching member by email (for public/anonymous flow)
  useEffect(() => {
    if (watchAnonymous || isMember || !watchEmail) {
      setMatchedMember(null);
      return;
    }
    const emailLower = watchEmail.toLowerCase().trim();
    if (emailLower.length > 5) {
      const match = allMembers.find((m) => m.email.toLowerCase() === emailLower);
      if (match) {
        setMatchedMember(match);
      } else {
        setMatchedMember(null);
      }
    } else {
      setMatchedMember(null);
    }
  }, [watchEmail, allMembers, watchAnonymous, isMember]);

  // Reset fields if anonymous is toggled
  useEffect(() => {
    if (watchAnonymous) {
      setValue("donor_name", "Anonymous");
      setValue("link_member", false);
      setMatchedMember(null);
    } else {
      if (isMember && userName && userEmail) {
        setValue("donor_name", userName);
        setValue("donor_email", userEmail);
        setValue("link_member", true);
      } else {
        setValue("donor_name", "");
      }
    }
  }, [watchAnonymous, isMember, userName, userEmail, setValue]);

  // Handle donation submit
  const onFormSubmit: SubmitHandler<DonationFormValues> = async (data) => {
    setIsSubmitting(true);
    try {
      // Determine member_id
      let finalMemberId: string | null = null;
      let finalDonorName = data.donor_name;
      let finalEmail = data.donor_email;

      if (data.anonymous) {
        finalMemberId = null;
        finalDonorName = "Anonymous";
        finalEmail = "";
      } else if (isMember && userMemberId) {
        finalMemberId = userMemberId;
      } else if (matchedMember && data.link_member) {
        finalMemberId = matchedMember.id;
        finalDonorName = `${matchedMember.first_name} ${matchedMember.last_name}`;
      } else if (isAdminEntry && data.link_member && matchedMember) {
        finalMemberId = matchedMember.id;
        finalDonorName = `${matchedMember.first_name} ${matchedMember.last_name}`;
      }

      const result = await onSubmit({
        member_id: finalMemberId,
        donor_name: finalDonorName,
        donor_email: finalEmail || undefined,
        amount: Number(data.amount),
        type: data.type,
        payment_method: data.payment_method,
        notes: data.notes || undefined,
        campaign_id: data.campaign_id !== "none" ? data.campaign_id : undefined,
      });

      setSuccessDonation(result);
    } catch (err) {
      console.error(err);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (successDonation) {
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="rounded-2xl border border-emerald-500/30 bg-card/60 p-8 backdrop-blur-glass shadow-glass text-center max-w-md mx-auto space-y-6"
      >
        <div className="mx-auto bg-emerald-500/10 border border-emerald-500/30 p-4 rounded-full w-20 h-20 flex items-center justify-center">
          <CheckCircle className="h-10 w-10 text-emerald-400" />
        </div>
        <div>
          <h3 className="text-xl font-bold text-primary-foreground">Transaction Completed!</h3>
          <p className="text-sm text-muted-foreground mt-2">
            Thank you for your generous gift. Your support directly funds our ministries and community projects.
          </p>
        </div>

        <div className="border border-border/40 rounded-xl p-4 bg-slate-900/60 text-left space-y-2">
          <div className="flex justify-between text-xs">
            <span className="text-muted-foreground">Donor Name:</span>
            <span className="text-primary-foreground font-medium">{successDonation.donor_name}</span>
          </div>
          <div className="flex justify-between text-xs">
            <span className="text-muted-foreground">Amount Paid:</span>
            <span className="text-emerald-400 font-bold">{formatCurrency(successDonation.amount)}</span>
          </div>
          <div className="flex justify-between text-xs">
            <span className="text-muted-foreground">Payment Method:</span>
            <span className="text-primary-foreground">{successDonation.payment_method}</span>
          </div>
          {successDonation.reference_number && (
            <div className="flex justify-between text-xs">
              <span className="text-muted-foreground">Reference No:</span>
              <span className="font-mono text-indigo-400 font-medium">{successDonation.reference_number}</span>
            </div>
          )}
        </div>

        <div className="flex flex-col gap-2">
          <a
            href={`/dashboard/donations/${successDonation.id}`}
            className="flex items-center justify-center gap-2 w-full rounded-xl bg-indigo-600 py-3 text-sm font-semibold text-primary-foreground hover:bg-indigo-500 shadow-neon transition-all"
          >
            <Receipt className="h-4 w-4" />
            Print Official Receipt
          </a>
          <button
            onClick={() => setSuccessDonation(null)}
            className="w-full text-xs text-muted-foreground hover:text-primary-foreground py-2 transition-colors"
          >
            Submit Another Donation
          </button>
        </div>
      </motion.div>
    );
  }

  return (
    <motion.form
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      onSubmit={handleSubmit(onFormSubmit)}
      className="space-y-6"
    >
      <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
        {/* Toggle Anonymous */}
        <div className="md:col-span-2 flex items-center justify-between border border-border/30 rounded-xl p-3 bg-slate-900/40">
          <div className="flex flex-col">
            <span className="text-sm font-semibold text-primary-foreground">Donate Anonymously</span>
            <span className="text-xs text-muted-foreground">Your name and profile will not be associated with this donation.</span>
          </div>
          <Controller
            name="anonymous"
            control={control}
            render={({ field }) => (
              <input
                type="checkbox"
                checked={field.value}
                onChange={(e) => field.onChange(e.target.checked)}
                className="h-5 w-5 rounded border-border/50 bg-card/60 text-primary focus:ring-0 focus:ring-offset-0 cursor-pointer"
              />
            )}
          />
        </div>

        {/* Donor Name */}
        {!watchAnonymous && (
          <div>
            <label htmlFor="donor_name" className={labelClass}>
              Donor Name *
            </label>
            <input
              id="donor_name"
              type="text"
              placeholder={isMember ? userName || "Your Name" : "Enter your full name"}
              disabled={isMember}
              className={cn(inputClass, isMember && "opacity-75 bg-slate-950/30 cursor-not-allowed")}
              {...register("donor_name", {
                required: !watchAnonymous && "Name is required for non-anonymous donations",
              })}
            />
            {errors.donor_name && <p className={errorClass}>{errors.donor_name.message}</p>}
          </div>
        )}

        {/* Donor Email */}
        {!watchAnonymous && (
          <div>
            <label htmlFor="donor_email" className={labelClass}>
              Donor Email *
            </label>
            <input
              id="donor_email"
              type="email"
              placeholder={isMember ? userEmail || "your.email@domain.com" : "donor@email.com"}
              disabled={isMember}
              className={cn(inputClass, isMember && "opacity-75 bg-slate-950/30 cursor-not-allowed")}
              {...register("donor_email", {
                required: !watchAnonymous && "Email is required to send confirmation receipt",
                pattern: {
                  value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                  message: "Invalid email address",
                },
              })}
            />
            {errors.donor_email && <p className={errorClass}>{errors.donor_email.message}</p>}
          </div>
        )}

        {/* Member matching helper box */}
        {!watchAnonymous && matchedMember && !isMember && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            className="md:col-span-2 rounded-xl border border-indigo-500/30 bg-indigo-500/5 p-4 flex items-start space-x-3 text-xs"
          >
            <Info className="h-5 w-5 text-indigo-400 shrink-0 mt-0.5" />
            <div className="space-y-2 flex-1">
              <p className="text-primary-foreground font-semibold">
                Member Profile Located!
              </p>
              <p className="text-muted-foreground leading-relaxed">
                We found a member account for <strong>{matchedMember.first_name} {matchedMember.last_name}</strong>. Would you like to link this gift to your member contributions report?
              </p>
              <label className="flex items-center gap-2 cursor-pointer mt-1 font-semibold text-indigo-400 select-none">
                <input
                  type="checkbox"
                  {...register("link_member")}
                  className="h-4 w-4 rounded border-border/50 bg-card/60 text-indigo-500 focus:ring-0 focus:ring-offset-0 cursor-pointer"
                />
                <span>Link donation to my member account</span>
              </label>
            </div>
          </motion.div>
        )}

        {/* Amount */}
        <div>
          <label htmlFor="amount" className={labelClass}>
            Donation Amount (TZS) *
          </label>
          <div className="relative">
            <span className="absolute left-4 top-2.5 text-sm font-semibold text-muted-foreground select-none">
              TZS
            </span>
            <input
              id="amount"
              type="number"
              min={1000}
              placeholder="e.g. 50000"
              className={cn(inputClass, "pl-12 font-semibold")}
              {...register("amount", {
                required: "Amount is required",
                min: { value: 1000, message: "Minimum donation amount is 1,000 TZS" },
              })}
            />
          </div>
          {errors.amount && <p className={errorClass}>{errors.amount.message}</p>}
          <span className="text-[10px] text-muted-foreground mt-1 block">
            Equal to: {formatCurrency(Number(watchAmount || 0))}
          </span>
        </div>

        {/* Fund Type */}
        <div>
          <label htmlFor="type" className={labelClass}>
            Giving Category *
          </label>
          <select
            id="type"
            className={cn(inputClass, "cursor-pointer")}
            {...register("type", { required: "Giving category is required" })}
          >
            <option value="Offering">Offering / Thanksgiving</option>
            <option value="Tithe">Tithe (10%)</option>
            <option value="Building Fund">Church Building Expansion</option>
            <option value="Outreach">Missions & Outreach</option>
            <option value="Other">Other Causes</option>
          </select>
          {errors.type && <p className={errorClass}>{errors.type.message}</p>}
        </div>

        {/* Pledge Campaign Selection (Conditional) */}
        {campaigns.length > 0 && (
          <div className="md:col-span-2">
            <label htmlFor="campaign_id" className={labelClass}>
              Link to Fundraising Campaign (Optional)
            </label>
            <select
              id="campaign_id"
              className={cn(inputClass, "cursor-pointer")}
              {...register("campaign_id")}
            >
              <option value="none">General Contribution (No Campaign Link)</option>
              {campaigns.map((camp) => (
                <option key={camp.id} value={camp.id}>
                  {camp.name} (Goal: {formatCurrency(camp.target_amount)})
                </option>
              ))}
            </select>
          </div>
        )}

        {/* Payment Method Selector */}
        <div className="md:col-span-2">
          <label className={labelClass}>Payment Method *</label>
          <div className="grid grid-cols-3 gap-3">
            {[
              { id: "Mobile Money", label: "Mobile Money (M-Pesa)", icon: Smartphone },
              { id: "Bank Transfer", label: "Bank/Credit Card", icon: Landmark },
              { id: "Cash", label: "Cash Receipt", icon: CreditCard },
            ].map((method) => {
              const Icon = method.icon;
              const active = watchPaymentMethod === method.id;
              return (
                <button
                  key={method.id}
                  type="button"
                  onClick={() => setValue("payment_method", method.id as PaymentMethod)}
                  className={cn(
                    "flex flex-col items-center justify-center gap-2 p-4 rounded-xl border text-xs font-semibold backdrop-blur-glass transition-all duration-300",
                    active
                      ? "border-primary bg-primary/10 text-primary shadow-[0_0_12px_rgba(99,102,241,0.2)]"
                      : "border-border/50 bg-card/40 text-muted-foreground hover:text-primary-foreground hover:bg-slate-900/60"
                  )}
                >
                  <Icon className="h-5 w-5" />
                  <span>{method.label}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Simulated payment detail inputs */}
        {watchPaymentMethod === "Mobile Money" && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            className="md:col-span-2"
          >
            <label htmlFor="phone_number" className={labelClass}>
              M-Pesa Mobile Number *
            </label>
            <input
              id="phone_number"
              type="text"
              placeholder="e.g. +255712345678"
              className={cn(inputClass, errors.phone_number && "border-rose-500")}
              {...register("phone_number", {
                required: watchPaymentMethod === "Mobile Money" ? "Phone number is required for Mobile Money" : false,
                pattern: {
                  value: E164_PHONE_REGEX,
                  message: "Must be a valid E.164 phone number (e.g., +255712345678)"
                }
              })}
            />
            {errors.phone_number && (
              <p className={errorClass}>{errors.phone_number.message}</p>
            )}
            <span className="text-[10px] text-muted-foreground mt-1 block">
              We will send an M-Pesa push PIN prompt to approve this transaction.
            </span>
          </motion.div>
        )}

        {watchPaymentMethod === "Bank Transfer" && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            className="md:col-span-2 grid grid-cols-3 gap-4"
          >
            <div className="col-span-3">
              <label htmlFor="card_num" className={labelClass}>
                Card Number *
              </label>
              <input
                id="card_num"
                type="text"
                placeholder="4000 1234 5678 9010"
                className={inputClass}
                required
              />
            </div>
            <div className="col-span-2">
              <label htmlFor="card_expiry" className={labelClass}>
                Expiration Date *
              </label>
              <input
                id="card_expiry"
                type="text"
                placeholder="MM/YY"
                className={inputClass}
                required
              />
            </div>
            <div>
              <label htmlFor="card_cvv" className={labelClass}>
                CVV *
              </label>
              <input
                id="card_cvv"
                type="password"
                placeholder="***"
                maxLength={3}
                className={inputClass}
                required
              />
            </div>
          </motion.div>
        )}

        {/* Notes */}
        <div className="md:col-span-2">
          <label htmlFor="notes" className={labelClass}>
            Memo / Notes
          </label>
          <textarea
            id="notes"
            rows={2}
            placeholder="Add any specific details or prayer instructions here."
            className={cn(inputClass, "resize-none")}
            {...register("notes")}
          />
        </div>
      </div>

      {/* Submit button */}
      <button
        type="submit"
        disabled={isSubmitting}
        className="w-full flex items-center justify-center gap-2 rounded-xl bg-primary py-3.5 text-sm font-semibold text-primary-foreground shadow-neon transition-all hover:brightness-110 disabled:opacity-50"
      >
        <span>{isSubmitting ? "Processing Transaction..." : `Donate ${formatCurrency(Number(watchAmount || 0))}`}</span>
        {!isSubmitting && <ArrowRight className="h-4 w-4" />}
      </button>
    </motion.form>
  );
}
