"use client";

import { useRouter } from "next/navigation";
import { ArrowLeft, Landmark } from "lucide-react";
import { useDonations } from "@/features/donations";
import { useAppPermissions } from "@/hooks/use-app-permissions";
import { DonationForm } from "@/features/donations/components/donation-form";
import { motion } from "framer-motion";

export default function CreateDonationPage() {
  const router = useRouter();
  const { campaigns, addDonation } = useDonations();
  const { donations: donationPermissions } = useAppPermissions();
  const { canManage } = donationPermissions;

  if (!canManage) {
    return (
      <div className="p-8 max-w-md mx-auto text-center space-y-4">
        <div className="bg-red-500/10 text-red-400 p-4 rounded-xl border border-red-500/20 font-semibold">
          Access Denied
        </div>
        <p className="text-sm text-muted-foreground">
          You do not have permission to manually record donation transactions.
        </p>
        <button
          onClick={() => router.push("/dashboard/donations")}
          className="rounded-xl bg-card/60 px-4 py-2 border border-border/50 text-xs font-semibold text-primary-foreground hover:bg-slate-900"
        >
          Return to Dashboard
        </button>
      </div>
    );
  }

  const handleSubmit = async (values: any) => {
    return addDonation(values);
  };

  return (
    <div className="p-6 max-w-3xl mx-auto space-y-6">
      {/* Breadcrumb / Back button */}
      <button
        onClick={() => router.push("/dashboard/donations")}
        className="inline-flex items-center gap-1 text-xs text-muted-foreground hover:text-primary-foreground transition-colors"
      >
        <ArrowLeft className="h-4 w-4" />
        Back to Ledger
      </button>

      {/* Header */}
      <div className="space-y-1">
        <h1 className="text-2xl font-bold tracking-tight text-primary-foreground flex items-center gap-2">
          <Landmark className="h-6 w-6 text-indigo-400" />
          Record Manual Contribution
        </h1>
        <p className="text-sm text-muted-foreground">
          Manually enter Tithe covenants, Sunday Offerings, or cash contributions into the ledger.
        </p>
      </div>

      {/* Form Container */}
      <motion.div
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        className="rounded-2xl border border-border/50 bg-card/40 p-6 backdrop-blur-glass shadow-glass"
      >
        <DonationForm campaigns={campaigns} onSubmit={handleSubmit} isAdminEntry={true} />
      </motion.div>
    </div>
  );
}
