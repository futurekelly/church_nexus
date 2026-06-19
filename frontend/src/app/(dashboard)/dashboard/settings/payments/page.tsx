"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { CreditCard, ArrowLeft, Plus, Edit2, ShieldAlert, Lock, Trash2, Check, X } from "lucide-react";
import Link from "next/link";
import { useForm } from "react-hook-form";
import { useAppPermissions } from "@/hooks/use-app-permissions";
import { usePaymentAccounts } from "@/features/settings/hooks/use-payment-accounts";
import { useBranches } from "@/features/settings/hooks/use-branches";
import type { PaymentAccount, PaymentProviderType } from "@/features/settings";
import { cn } from "@/lib/utils";

const inputClass = cn(
  "w-full rounded-xl border border-border/50 bg-card/60 px-4 py-2 text-xs",
  "text-primary-foreground placeholder:text-muted-foreground/50 focus:border-indigo-500/50 focus:outline-none"
);

const labelClass = "block text-[10px] font-semibold text-muted-foreground mb-1 uppercase tracking-wider";

export default function PaymentsSettingsPage() {
  const { settings: permissions } = useAppPermissions();
  const { accounts, addAccount, updateAccount, setDefaultAccount, toggleAccountStatus, deleteAccount } = usePaymentAccounts();
  const { branches } = useBranches();
  
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingAccount, setEditingAccount] = useState<PaymentAccount | null>(null);

  const { register, handleSubmit, reset, watch } = useForm<Omit<PaymentAccount, "id" | "created_at">>();
  const watchProvider = watch("provider");

  // Guard: Super Admin, Church Admin, Treasurer can view payments settings
  if (!permissions.canManagePayments) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] text-center p-6 select-none">
        <div className="rounded-2xl border border-border/40 bg-card/40 p-8 max-w-md backdrop-blur-glass shadow-glass">
          <Lock className="h-10 w-10 text-rose-400 mx-auto mb-4" />
          <h3 className="text-base font-bold text-primary-foreground font-display">Access Restricted</h3>
          <p className="text-xs text-muted-foreground mt-2">
            You do not have the required permissions to manage payment configuration settings.
          </p>
        </div>
      </div>
    );
  }

  const openAddModal = () => {
    setEditingAccount(null);
    reset({
      branch_id: branches[0]?.id || "branch-001",
      provider: "M-Pesa",
      account_name: "",
      account_number: "",
      paybill_number: "",
      merchant_code: "",
      bank_name: "",
      swift_bic: "",
      status: "Active",
      is_default: false
    });
    setIsModalOpen(true);
  };

  const openEditModal = (account: PaymentAccount) => {
    setEditingAccount(account);
    reset({
      branch_id: account.branch_id,
      provider: account.provider,
      account_name: account.account_name,
      account_number: account.account_number,
      paybill_number: account.paybill_number || "",
      merchant_code: account.merchant_code || "",
      bank_name: account.bank_name || "",
      swift_bic: account.swift_bic || "",
      status: account.status,
      is_default: account.is_default
    });
    setIsModalOpen(true);
  };

  const onSubmit = (data: Omit<PaymentAccount, "id" | "created_at">) => {
    if (editingAccount) {
      updateAccount(editingAccount.id, data);
    } else {
      addAccount(data);
    }
    setIsModalOpen(false);
  };

  const getBranchName = (branchId: string) => {
    return branches.find((b) => b.id === branchId)?.branch_name || "Unknown Branch";
  };

  return (
    <div className="p-6 max-w-6xl mx-auto space-y-8">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between border-b border-border/30 pb-4">
        <div className="flex items-center gap-3">
          <Link
            href="/dashboard/settings"
            className="flex h-9 w-9 items-center justify-center rounded-xl border border-border/50 bg-card/40 hover:bg-slate-900 transition-colors text-muted-foreground hover:text-primary-foreground"
            aria-label="Back to settings"
          >
            <ArrowLeft className="h-4 w-4" />
          </Link>
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-primary-foreground font-display flex items-center gap-2">
              <CreditCard className="h-6 w-6 text-indigo-400" />
              Payments & Merchant Codes
            </h1>
            <p className="text-xs text-muted-foreground mt-0.5">
              Configure M-Pesa merchant paybills, TigoPesa Lipa numbers, bank details, and default donation routes.
            </p>
          </div>
        </div>

        <button
          type="button"
          onClick={openAddModal}
          className="inline-flex items-center gap-2 rounded-xl bg-indigo-500 px-4 py-2 text-xs font-semibold text-white transition-all hover:bg-indigo-600 shadow-neon"
        >
          <Plus className="h-4 w-4" />
          <span>Add Account</span>
        </button>
      </div>

      {/* Main Table */}
      <div className="rounded-2xl border border-border/40 bg-card/30 backdrop-blur-glass overflow-hidden shadow-glass">
        {accounts.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full border-collapse text-left text-xs">
              <thead>
                <tr className="border-b border-border/40 bg-slate-900/40 text-muted-foreground font-semibold">
                  <th className="p-4">Account Name / Provider</th>
                  <th className="p-4">Branch</th>
                  <th className="p-4">Account / Merchant Info</th>
                  <th className="p-4">Default</th>
                  <th className="p-4">Status</th>
                  <th className="p-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody>
                {accounts.map((account) => (
                  <tr
                    key={account.id}
                    className="border-b border-border/30 hover:bg-slate-900/10 transition-colors"
                  >
                    {/* Name & Provider */}
                    <td className="p-4">
                      <div className="font-semibold text-primary-foreground">{account.account_name}</div>
                      <span className="rounded bg-indigo-500/10 px-2 py-0.5 text-[9px] font-semibold text-indigo-400 mt-1 inline-block">
                        {account.provider}
                      </span>
                    </td>

                    {/* Branch */}
                    <td className="p-4 text-slate-200">
                      {getBranchName(account.branch_id)}
                    </td>

                    {/* Numbers / Codes */}
                    <td className="p-4">
                      {account.provider === "Bank" ? (
                        <div className="space-y-0.5">
                          <div className="font-medium text-slate-300">{account.bank_name}</div>
                          <div className="text-[10px] text-slate-400 font-mono">No: {account.account_number}</div>
                          {account.swift_bic && <div className="text-[9px] text-slate-500 font-mono">SWIFT: {account.swift_bic}</div>}
                        </div>
                      ) : (
                        <div className="space-y-0.5">
                          <div className="font-mono text-slate-300">No: {account.account_number}</div>
                          {account.paybill_number && <div className="text-[10px] text-slate-400 font-mono">Paybill: {account.paybill_number}</div>}
                          {account.merchant_code && <div className="text-[10px] text-slate-400 font-mono">Merchant/Till: {account.merchant_code}</div>}
                        </div>
                      )}
                    </td>

                    {/* Default badge */}
                    <td className="p-4">
                      {account.is_default ? (
                        <span className="inline-flex items-center gap-1 rounded bg-amber-500/15 px-2 py-0.5 text-[9px] font-semibold text-amber-400 border border-amber-500/20">
                          Default
                        </span>
                      ) : (
                        <span className="text-[10px] text-muted-foreground italic">-</span>
                      )}
                    </td>

                    {/* Status */}
                    <td className="p-4">
                      <span
                        className={cn(
                          "inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[9px] font-semibold border",
                          account.status === "Active" && "bg-emerald-500/10 text-emerald-400 border-emerald-500/20",
                          account.status === "Inactive" && "bg-slate-500/10 text-slate-400 border-slate-500/20"
                        )}
                      >
                        <span
                          className={cn(
                            "h-1 w-1 rounded-full",
                            account.status === "Active" && "bg-emerald-400",
                            account.status === "Inactive" && "bg-slate-400"
                          )}
                        />
                        {account.status}
                      </span>
                    </td>

                    {/* Actions */}
                    <td className="p-4 text-right space-x-1 shrink-0 whitespace-nowrap">
                      {/* Set Default */}
                      {!account.is_default && account.status === "Active" && (
                        <button
                          type="button"
                          onClick={() => setDefaultAccount(account.id)}
                          className="inline-flex h-7 items-center gap-0.5 rounded-lg bg-amber-500/10 px-2 text-[10px] font-semibold text-amber-400 border border-amber-500/20 hover:bg-amber-500/20 transition-all"
                        >
                          <Check className="h-3 w-3" />
                          <span>Set Default</span>
                        </button>
                      )}

                      {/* Edit */}
                      <button
                        type="button"
                        onClick={() => openEditModal(account)}
                        className="inline-flex h-7 w-7 items-center justify-center rounded-lg bg-slate-800 text-slate-400 border border-border/40 hover:text-indigo-400 hover:bg-indigo-500/10 hover:border-indigo-500/20 transition-all"
                        aria-label="Edit account"
                      >
                        <Edit2 className="h-3.5 w-3.5" />
                      </button>

                      {/* Toggle Status */}
                      <button
                        type="button"
                        onClick={() => toggleAccountStatus(account.id)}
                        className={cn(
                          "inline-flex h-7 items-center gap-0.5 rounded-lg px-2 text-[10px] font-semibold border transition-all",
                          account.status === "Active"
                            ? "bg-slate-800 text-slate-400 border-border/40 hover:text-amber-400 hover:bg-amber-500/10"
                            : "bg-emerald-500/10 text-emerald-400 border-emerald-500/20 hover:bg-emerald-500/20"
                        )}
                      >
                        {account.status === "Active" ? <X className="h-3 w-3" /> : <Check className="h-3 w-3" />}
                        <span>{account.status === "Active" ? "Deactivate" : "Activate"}</span>
                      </button>

                      {/* Delete */}
                      {!account.is_default && (
                        <button
                          type="button"
                          onClick={() => deleteAccount(account.id)}
                          className="inline-flex h-7 w-7 items-center justify-center rounded-lg bg-slate-800 text-slate-400 border border-border/40 hover:text-rose-400 hover:bg-rose-500/10 hover:border-rose-500/20 transition-all"
                          aria-label="Delete account"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="p-8 text-center text-xs text-muted-foreground select-none">
            No merchant payment accounts registered.
          </div>
        )}
      </div>

      {/* Add/Edit Modal */}
      <AnimatePresence>
        {isModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-sm p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="w-full max-w-md rounded-2xl border border-border/50 bg-card p-6 shadow-glass"
            >
              <h3 className="font-display text-lg font-bold text-primary-foreground mb-4">
                {editingAccount ? "Edit Payment Account" : "Add Payment Account"}
              </h3>

              <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                {/* Branch */}
                <div>
                  <label htmlFor="branch_id" className={labelClass}>Branch Association *</label>
                  <select id="branch_id" className={inputClass} required {...register("branch_id")}>
                    {branches.map((b) => (
                      <option key={b.id} value={b.id}>
                        {b.branch_name}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Provider */}
                <div>
                  <label htmlFor="provider" className={labelClass}>Payment Provider *</label>
                  <select id="provider" className={inputClass} required {...register("provider")}>
                    <option value="M-Pesa">M-Pesa</option>
                    <option value="TigoPesa">TigoPesa</option>
                    <option value="Airtel Money">Airtel Money</option>
                    <option value="HaloPesa">HaloPesa</option>
                    <option value="Bank">Bank Transfer</option>
                  </select>
                </div>

                {/* Account Name */}
                <div>
                  <label htmlFor="account_name" className={labelClass}>Account Name *</label>
                  <input
                    id="account_name"
                    type="text"
                    placeholder="e.g. Tabata Offering Account"
                    className={inputClass}
                    required
                    {...register("account_name")}
                  />
                </div>

                {/* Account Number */}
                <div>
                  <label htmlFor="account_number" className={labelClass}>
                    {watchProvider === "Bank" ? "Bank Account Number *" : "Merchant Phone Number *"}
                  </label>
                  <input
                    id="account_number"
                    type="text"
                    placeholder={watchProvider === "Bank" ? "e.g. 0152431002900" : "e.g. +255754000000"}
                    className={inputClass}
                    required
                    {...register("account_number")}
                  />
                </div>

                {/* Mobile Money Details (conditional) */}
                {watchProvider !== "Bank" && (
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label htmlFor="paybill_number" className={labelClass}>Paybill Number (Opt)</label>
                      <input
                        id="paybill_number"
                        type="text"
                        placeholder="e.g. 150150"
                        className={inputClass}
                        {...register("paybill_number")}
                      />
                    </div>
                    <div>
                      <label htmlFor="merchant_code" className={labelClass}>Till / Merchant Code</label>
                      <input
                        id="merchant_code"
                        type="text"
                        placeholder="e.g. 998877"
                        className={inputClass}
                        {...register("merchant_code")}
                      />
                    </div>
                  </div>
                )}

                {/* Bank Details (conditional) */}
                {watchProvider === "Bank" && (
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label htmlFor="bank_name" className={labelClass}>Bank Name *</label>
                      <input
                        id="bank_name"
                        type="text"
                        placeholder="e.g. NMB Bank"
                        className={inputClass}
                        required
                        {...register("bank_name")}
                      />
                    </div>
                    <div>
                      <label htmlFor="swift_bic" className={labelClass}>SWIFT / BIC Code</label>
                      <input
                        id="swift_bic"
                        type="text"
                        placeholder="e.g. NMBTZTZ"
                        className={inputClass}
                        {...register("swift_bic")}
                      />
                    </div>
                  </div>
                )}

                {/* Default flag */}
                <div className="flex items-center gap-2 py-1 select-none">
                  <input
                    id="is_default"
                    type="checkbox"
                    className="rounded border-border/50 text-indigo-500 focus:ring-indigo-500 bg-card/60"
                    {...register("is_default")}
                  />
                  <label htmlFor="is_default" className="text-xs text-slate-300 font-medium cursor-pointer">
                    Set as default payment account for this branch
                  </label>
                </div>

                {/* Action buttons */}
                <div className="mt-6 flex justify-end gap-3 border-t border-border/30 pt-4">
                  <button
                    type="button"
                    onClick={() => setIsModalOpen(false)}
                    className="rounded-xl border border-border/50 bg-card px-4 py-2 text-xs font-semibold text-muted-foreground hover:text-primary-foreground transition-all"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="rounded-xl bg-indigo-500 px-5 py-2 text-xs font-semibold text-white hover:bg-indigo-600 transition-all"
                  >
                    Save Account
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
