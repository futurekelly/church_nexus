"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Settings, MapPin, ArrowLeft, Plus, Edit2, ShieldAlert, Lock, Trash2, Check, X } from "lucide-react";
import Link from "next/link";
import { useForm } from "react-hook-form";
import { useAppPermissions } from "@/hooks/use-app-permissions";
import { useBranches } from "@/features/settings/hooks/use-branches";
import type { Branch, BranchType, BranchStatus } from "@/features/settings";
import { cn } from "@/lib/utils";

const inputClass = cn(
  "w-full rounded-xl border border-border/50 bg-card/60 px-4 py-2 text-xs",
  "text-primary-foreground placeholder:text-muted-foreground/50 focus:border-indigo-500/50 focus:outline-none"
);

const labelClass = "block text-[10px] font-semibold text-muted-foreground mb-1 uppercase tracking-wider";

export default function BranchesSettingsPage() {
  const { settings: permissions } = useAppPermissions();
  const { branches, addBranch, updateBranch, setHeadquarters, toggleBranchStatus, deleteBranch } = useBranches();
  
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingBranch, setEditingBranch] = useState<Branch | null>(null);

  const { register, handleSubmit, reset, setValue } = useForm<Omit<Branch, "id" | "created_at">>();

  // Guard: Only Super Admin and Church Admin can manage branches
  if (!permissions.canManageBranches && !permissions.canViewBranches) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] text-center p-6 select-none">
        <div className="rounded-2xl border border-border/40 bg-card/40 p-8 max-w-md backdrop-blur-glass shadow-glass">
          <Lock className="h-10 w-10 text-rose-400 mx-auto mb-4" />
          <h3 className="text-base font-bold text-primary-foreground font-display">Access Restricted</h3>
          <p className="text-xs text-muted-foreground mt-2">
            You do not have the required permissions to view or manage church branches.
          </p>
        </div>
      </div>
    );
  }

  const openAddModal = () => {
    setEditingBranch(null);
    reset({
      branch_code: "",
      branch_name: "",
      branch_type: "Satellite",
      country_code: "TZ",
      currency_code: "TZS",
      timezone: "Africa/Dar_es_Salaam",
      language: "sw",
      phone: "",
      email: "",
      address: { street_address: "", city: "", state_province: "", country: "Tanzania" },
      leader: { id: `ldr-${Date.now()}`, first_name: "", last_name: "", title: "Pastor", phone: "", email: "" },
      financial_profile: { fiscal_year_start: "01-01", default_payment_provider: "M-Pesa", max_anonymous_donation_limit: 1000000 },
      status: "Active"
    });
    setIsModalOpen(true);
  };

  const openEditModal = (branch: Branch) => {
    setEditingBranch(branch);
    reset({
      branch_code: branch.branch_code,
      branch_name: branch.branch_name,
      branch_type: branch.branch_type,
      country_code: branch.country_code,
      currency_code: branch.currency_code,
      timezone: branch.timezone,
      language: branch.language,
      phone: branch.phone,
      email: branch.email,
      address: branch.address,
      leader: branch.leader,
      financial_profile: branch.financial_profile,
      status: branch.status
    });
    setIsModalOpen(true);
  };

  const onSubmit = (data: Omit<Branch, "id" | "created_at">) => {
    if (editingBranch) {
      updateBranch(editingBranch.id, data);
    } else {
      addBranch(data);
    }
    setIsModalOpen(false);
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
              <MapPin className="h-6 w-6 text-indigo-400" />
              Branch Management
            </h1>
            <p className="text-xs text-muted-foreground mt-0.5">
              Create campuses, manage regional addresses, assign pastors, and edit operational statuses.
            </p>
          </div>
        </div>

        {permissions.canManageBranches && (
          <button
            type="button"
            onClick={openAddModal}
            className="inline-flex items-center gap-2 rounded-xl bg-indigo-500 px-4 py-2 text-xs font-semibold text-white transition-all hover:bg-indigo-600 shadow-neon"
          >
            <Plus className="h-4 w-4" />
            <span>Create Campus</span>
          </button>
        )}
      </div>

      {/* Main Table */}
      <div className="rounded-2xl border border-border/40 bg-card/30 backdrop-blur-glass overflow-hidden shadow-glass">
        <div className="overflow-x-auto">
          <table className="w-full border-collapse text-left text-xs">
            <thead>
              <tr className="border-b border-border/40 bg-slate-900/40 text-muted-foreground font-semibold">
                <th className="p-4">Campus / Code</th>
                <th className="p-4">Type</th>
                <th className="p-4">Pastor</th>
                <th className="p-4">Location</th>
                <th className="p-4">Default Locale</th>
                <th className="p-4">Status</th>
                {permissions.canManageBranches && <th className="p-4 text-right">Actions</th>}
              </tr>
            </thead>
            <tbody>
              {branches.map((branch) => (
                <tr
                  key={branch.id}
                  className="border-b border-border/30 hover:bg-slate-900/10 transition-colors"
                >
                  {/* Name & Code */}
                  <td className="p-4">
                    <div className="font-semibold text-primary-foreground">{branch.branch_name}</div>
                    <div className="text-[10px] text-muted-foreground mt-0.5">{branch.branch_code}</div>
                  </td>

                  {/* Type */}
                  <td className="p-4">
                    <span
                      className={cn(
                        "rounded px-2 py-0.5 text-[9px] font-semibold",
                        branch.branch_type === "Headquarters"
                          ? "bg-purple-500/15 text-purple-400 border border-purple-500/25"
                          : branch.branch_type === "Satellite"
                          ? "bg-blue-500/15 text-blue-400 border border-blue-500/25"
                          : "bg-amber-500/15 text-amber-400 border border-amber-500/25"
                      )}
                    >
                      {branch.branch_type}
                    </span>
                  </td>

                  {/* Leader */}
                  <td className="p-4">
                    <div className="font-medium text-slate-200">
                      {branch.leader.first_name} {branch.leader.last_name}
                    </div>
                    <div className="text-[9px] text-slate-500">{branch.leader.title}</div>
                  </td>

                  {/* Location Address */}
                  <td className="p-4">
                    <div className="text-slate-300 truncate max-w-[150px]">{branch.address.street_address}</div>
                    <div className="text-[9px] text-slate-500">{branch.address.city}, {branch.address.country}</div>
                  </td>

                  {/* Locale info */}
                  <td className="p-4">
                    <div className="text-slate-200 uppercase font-mono">{branch.currency_code} ({branch.language})</div>
                    <div className="text-[9px] text-slate-500">{branch.timezone}</div>
                  </td>

                  {/* Status */}
                  <td className="p-4">
                    <span
                      className={cn(
                        "inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[9px] font-semibold border",
                        branch.status === "Active" && "bg-emerald-500/10 text-emerald-400 border-emerald-500/20",
                        branch.status === "Inactive" && "bg-slate-500/10 text-slate-400 border-slate-500/20",
                        branch.status === "Suspended" && "bg-rose-500/10 text-rose-400 border-rose-500/20"
                      )}
                    >
                      <span
                        className={cn(
                          "h-1 w-1 rounded-full",
                          branch.status === "Active" && "bg-emerald-400",
                          branch.status === "Inactive" && "bg-slate-400",
                          branch.status === "Suspended" && "bg-rose-400"
                        )}
                      />
                      {branch.status}
                    </span>
                  </td>

                  {/* Admin actions */}
                  {permissions.canManageBranches && (
                    <td className="p-4 text-right space-x-1 shrink-0 whitespace-nowrap">
                      {/* Set Headquarters toggle */}
                      {branch.branch_type !== "Headquarters" && (
                        <button
                          type="button"
                          onClick={() => setHeadquarters(branch.id)}
                          className="inline-flex h-7 items-center gap-0.5 rounded-lg bg-purple-500/10 px-2 text-[10px] font-semibold text-purple-400 border border-purple-500/20 hover:bg-purple-500/20 transition-all"
                        >
                          <Check className="h-3 w-3" />
                          <span>Make HQ</span>
                        </button>
                      )}

                      {/* Edit */}
                      <button
                        type="button"
                        onClick={() => openEditModal(branch)}
                        className="inline-flex h-7 w-7 items-center justify-center rounded-lg bg-slate-800 text-slate-400 border border-border/40 hover:text-indigo-400 hover:bg-indigo-500/10 hover:border-indigo-500/20 transition-all"
                        aria-label="Edit campus"
                      >
                        <Edit2 className="h-3.5 w-3.5" />
                      </button>

                      {/* Status toggle */}
                      <button
                        type="button"
                        onClick={() => toggleBranchStatus(branch.id)}
                        className={cn(
                          "inline-flex h-7 items-center gap-0.5 rounded-lg px-2 text-[10px] font-semibold border transition-all",
                          branch.status === "Active"
                            ? "bg-slate-800 text-slate-400 border-border/40 hover:text-amber-400 hover:bg-amber-500/10"
                            : "bg-emerald-500/10 text-emerald-400 border-emerald-500/20 hover:bg-emerald-500/20"
                        )}
                      >
                        {branch.status === "Active" ? <X className="h-3 w-3" /> : <Check className="h-3 w-3" />}
                        <span>{branch.status === "Active" ? "Deactivate" : "Activate"}</span>
                      </button>

                      {/* Delete */}
                      {branch.branch_type !== "Headquarters" && (
                        <button
                          type="button"
                          onClick={() => deleteBranch(branch.id)}
                          className="inline-flex h-7 w-7 items-center justify-center rounded-lg bg-slate-800 text-slate-400 border border-border/40 hover:text-rose-400 hover:bg-rose-500/10 hover:border-rose-500/20 transition-all"
                          aria-label="Delete campus"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </button>
                      )}
                    </td>
                  )}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Edit/Add Modal */}
      <AnimatePresence>
        {isModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-sm p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="w-full max-w-2xl rounded-2xl border border-border/50 bg-card p-6 shadow-glass max-h-[90vh] overflow-y-auto"
            >
              <h3 className="font-display text-lg font-bold text-primary-foreground mb-4">
                {editingBranch ? "Edit Campus Profile" : "Create Regional Campus"}
              </h3>

              <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                {/* General Info */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div>
                    <label htmlFor="branch_name" className={labelClass}>Campus Name *</label>
                    <input
                      id="branch_name"
                      type="text"
                      placeholder="e.g. Sinza Campus"
                      className={inputClass}
                      required
                      {...register("branch_name")}
                    />
                  </div>

                  <div>
                    <label htmlFor="branch_code" className={labelClass}>Campus Code *</label>
                    <input
                      id="branch_code"
                      type="text"
                      placeholder="e.g. TZ-DSM-02"
                      className={inputClass}
                      required
                      {...register("branch_code")}
                    />
                  </div>

                  <div>
                    <label htmlFor="branch_type" className={labelClass}>Campus Type</label>
                    <select id="branch_type" className={inputClass} {...register("branch_type")}>
                      <option value="Satellite">Satellite</option>
                      <option value="Plant">Plant</option>
                      <option value="Headquarters">Headquarters</option>
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div>
                    <label htmlFor="country_code" className={labelClass}>Country</label>
                    <select id="country_code" className={inputClass} {...register("country_code")}>
                      <option value="TZ">Tanzania</option>
                      <option value="KE">Kenya</option>
                      <option value="UG">Uganda</option>
                      <option value="RW">Rwanda</option>
                      <option value="US">United States</option>
                    </select>
                  </div>

                  <div>
                    <label htmlFor="currency_code" className={labelClass}>Default Currency</label>
                    <select id="currency_code" className={inputClass} {...register("currency_code")}>
                      <option value="TZS">TZS</option>
                      <option value="KES">KES</option>
                      <option value="UGX">UGX</option>
                      <option value="RWF">RWF</option>
                      <option value="USD">USD</option>
                    </select>
                  </div>

                  <div>
                    <label htmlFor="language" className={labelClass}>Locale Language</label>
                    <select id="language" className={inputClass} {...register("language")}>
                      <option value="sw">Swahili</option>
                      <option value="en">English</option>
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div>
                    <label htmlFor="timezone" className={labelClass}>Timezone</label>
                    <input
                      id="timezone"
                      type="text"
                      placeholder="e.g. Africa/Dar_es_Salaam"
                      className={inputClass}
                      {...register("timezone")}
                    />
                  </div>

                  <div>
                    <label htmlFor="phone" className={labelClass}>Contact Phone *</label>
                    <input
                      id="phone"
                      type="text"
                      placeholder="e.g. +255754000000"
                      className={inputClass}
                      required
                      {...register("phone")}
                    />
                  </div>

                  <div>
                    <label htmlFor="email" className={labelClass}>Contact Email *</label>
                    <input
                      id="email"
                      type="email"
                      placeholder="sinza@church-nexus.org"
                      className={inputClass}
                      required
                      {...register("email")}
                    />
                  </div>
                </div>

                {/* Leader Details */}
                <div className="border-t border-border/30 pt-4">
                  <h4 className="text-[10px] font-semibold text-indigo-400 uppercase tracking-wider mb-2">Pastor / Leadership Assignment</h4>
                  <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
                    <div className="sm:col-span-2">
                      <label htmlFor="leader_first_name" className={labelClass}>First Name *</label>
                      <input
                        id="leader_first_name"
                        type="text"
                        placeholder="First name"
                        className={inputClass}
                        required
                        {...register("leader.first_name")}
                      />
                    </div>
                    <div>
                      <label htmlFor="leader_last_name" className={labelClass}>Last Name *</label>
                      <input
                        id="leader_last_name"
                        type="text"
                        placeholder="Last name"
                        className={inputClass}
                        required
                        {...register("leader.last_name")}
                      />
                    </div>
                    <div>
                      <label htmlFor="leader_title" className={labelClass}>Title</label>
                      <select id="leader_title" className={inputClass} {...register("leader.title")}>
                        <option value="Pastor">Pastor</option>
                        <option value="Elder">Elder</option>
                        <option value="Deacon">Deacon</option>
                        <option value="Administrator">Administrator</option>
                      </select>
                    </div>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-2">
                    <div>
                      <label htmlFor="leader_phone" className={labelClass}>Pastor Phone</label>
                      <input
                        id="leader_phone"
                        type="text"
                        placeholder="+255..."
                        className={inputClass}
                        {...register("leader.phone")}
                      />
                    </div>
                    <div>
                      <label htmlFor="leader_email" className={labelClass}>Pastor Email</label>
                      <input
                        id="leader_email"
                        type="email"
                        placeholder="pastor@church-nexus.org"
                        className={inputClass}
                        {...register("leader.email")}
                      />
                    </div>
                  </div>
                </div>

                {/* Address Details */}
                <div className="border-t border-border/30 pt-4">
                  <h4 className="text-[10px] font-semibold text-indigo-400 uppercase tracking-wider mb-2">Physical Location Address</h4>
                  <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
                    <div className="sm:col-span-2">
                      <label htmlFor="street_address" className={labelClass}>Street Address *</label>
                      <input
                        id="street_address"
                        type="text"
                        placeholder="Road, Plot number"
                        className={inputClass}
                        required
                        {...register("address.street_address")}
                      />
                    </div>
                    <div>
                      <label htmlFor="city" className={labelClass}>City *</label>
                      <input
                        id="city"
                        type="text"
                        placeholder="City"
                        className={inputClass}
                        required
                        {...register("address.city")}
                      />
                    </div>
                    <div>
                      <label htmlFor="state_province" className={labelClass}>State / Province *</label>
                      <input
                        id="state_province"
                        type="text"
                        placeholder="Region"
                        className={inputClass}
                        required
                        {...register("address.state_province")}
                      />
                    </div>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-2">
                    <div>
                      <label htmlFor="postal_code" className={labelClass}>Postal Code</label>
                      <input
                        id="postal_code"
                        type="text"
                        placeholder="Postal code"
                        className={inputClass}
                        {...register("address.postal_code")}
                      />
                    </div>
                    <div>
                      <label htmlFor="address_country" className={labelClass}>Country *</label>
                      <input
                        id="address_country"
                        type="text"
                        placeholder="Country"
                        className={inputClass}
                        required
                        {...register("address.country")}
                      />
                    </div>
                  </div>
                </div>

                {/* Submit / Cancel */}
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
                    Save Campus
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
