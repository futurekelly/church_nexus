"use client";

import { useParams, useRouter } from "next/navigation";
import { ArrowLeft, Printer, CheckCircle, Gift, Calendar, User, CreditCard, Hash } from "lucide-react";
import { useDonations, formatTZS } from "@/features/donations";
import { motion } from "framer-motion";

export default function DonationReceiptPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const { getDonationById, getReceiptForDonation } = useDonations();

  const donation = getDonationById(id);
  const receipt = getReceiptForDonation(id);

  if (!donation) {
    return (
      <div className="flex flex-col items-center justify-center py-24 text-center">
        <p className="text-lg font-semibold text-primary-foreground">Donation Not Found</p>
        <p className="text-sm text-muted-foreground mt-2">
          The requested transaction details could not be found.
        </p>
        <button
          onClick={() => router.push("/dashboard/donations")}
          className="mt-6 rounded-xl border border-border/50 bg-card/60 px-4 py-2 text-xs font-semibold text-primary-foreground hover:bg-slate-900"
        >
          Back to Ledger
        </button>
      </div>
    );
  }

  const handlePrint = () => {
    if (typeof window !== "undefined") {
      window.print();
    }
  };

  const formattedDate = new Date(donation.created_at).toLocaleDateString("en-US", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });

  return (
    <div className="p-6 max-w-2xl mx-auto space-y-6">
      {/* Back navigation & Actions (hidden during print) */}
      <div className="flex items-center justify-between print:hidden">
        <button
          onClick={() => router.push("/dashboard/donations")}
          className="inline-flex items-center gap-1 text-xs text-muted-foreground hover:text-primary-foreground transition-colors"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Ledger
        </button>
        <button
          onClick={handlePrint}
          className="flex items-center gap-1.5 rounded-xl bg-indigo-600 px-4 py-2.5 text-xs font-semibold text-primary-foreground shadow-neon hover:bg-indigo-500 transition-all"
        >
          <Printer className="h-4 w-4" />
          Print Receipt
        </button>
      </div>

      {/* Official Receipt Card */}
      <motion.div
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        className="rounded-2xl border border-border/50 bg-card/40 p-8 backdrop-blur-glass shadow-glass space-y-6 relative overflow-hidden print:bg-white print:text-black print:border-none print:shadow-none print:p-0 print:m-0"
      >
        {/* Subtle decorative background (hidden in print) */}
        <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-500/5 rounded-full blur-3xl -z-10 print:hidden" />

        {/* Receipt Header */}
        <div className="flex flex-col md:flex-row md:justify-between items-start md:items-center pb-6 border-b border-border/40 print:border-slate-300">
          <div className="flex items-center space-x-3">
            {/* Logo Placeholder */}
            <div className="bg-indigo-500/10 border border-indigo-500/30 p-2.5 rounded-xl print:bg-slate-100 print:border-slate-300">
              <svg
                className="h-7 w-7 text-indigo-400 print:text-indigo-600"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2.5"
              >
                <path d="M12 2v20M5 7h14" />
              </svg>
            </div>
            <div>
              <h1 className="text-xl font-extrabold tracking-tight text-primary-foreground print:text-slate-900">
                Church Nexus
              </h1>
              <p className="text-xs text-muted-foreground print:text-slate-500">Official Donation Receipt</p>
            </div>
          </div>
          <div className="mt-4 md:mt-0 text-left md:text-right">
            <span className="inline-flex items-center gap-1 rounded-md bg-slate-900/60 border border-border/30 px-2.5 py-1 text-xs font-mono text-indigo-400 print:bg-slate-100 print:border-slate-300 print:text-slate-700">
              <Hash className="h-3.5 w-3.5" />
              {receipt.receipt_number}
            </span>
            <p className="text-[10px] text-muted-foreground mt-1.5 print:text-slate-500">
              Issued: {new Date(receipt.issued_at).toLocaleDateString()}
            </p>
          </div>
        </div>

        {/* Donor & Gift Summary Grid */}
        <div className="grid gap-6 sm:grid-cols-2">
          {/* Donor Information */}
          <div className="space-y-1.5">
            <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider print:text-slate-500">
              Donor Information
            </span>
            <div className="flex items-center space-x-2 text-sm text-primary-foreground print:text-slate-800">
              <User className="h-4 w-4 text-slate-400 print:text-slate-600 shrink-0" />
              <span className="font-bold">{donation.donor_name}</span>
            </div>
            {donation.donor_email && (
              <p className="text-xs text-muted-foreground pl-6 print:text-slate-500">
                {donation.donor_email}
              </p>
            )}
            {donation.member_id && (
              <span className="inline-block mt-1 ml-6 text-[10px] bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 px-2 py-0.5 rounded-md print:bg-slate-100 print:text-slate-700 print:border-slate-300">
                Covenant Member
              </span>
            )}
          </div>

          {/* Payment details */}
          <div className="space-y-1.5">
            <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider print:text-slate-500">
              Transaction Details
            </span>
            <div className="flex items-center space-x-2 text-sm text-primary-foreground print:text-slate-800">
              <Calendar className="h-4 w-4 text-slate-400 print:text-slate-600 shrink-0" />
              <span className="font-medium">{formattedDate}</span>
            </div>
            <div className="flex items-center space-x-2 text-sm text-primary-foreground print:text-slate-800">
              <CreditCard className="h-4 w-4 text-slate-400 print:text-slate-600 shrink-0" />
              <span>Paid via {donation.payment_method}</span>
            </div>
            {donation.reference_number && (
              <p className="text-xs text-muted-foreground pl-6 font-mono print:text-slate-500">
                Ref: {donation.reference_number}
              </p>
            )}
          </div>
        </div>

        {/* Amount Section */}
        <div className="bg-slate-900/60 border border-border/30 rounded-xl p-5 text-center space-y-1 print:bg-slate-50 print:border-slate-300">
          <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider print:text-slate-500">
            Total Amount Received
          </span>
          <h2 className="text-3xl font-extrabold text-emerald-400 print:text-emerald-700">
            {formatTZS(donation.amount)}
          </h2>
          <p className="text-xs text-muted-foreground print:text-slate-600">
            Allocated to: <strong>{donation.type}</strong>
          </p>
        </div>

        {/* Note / Memo */}
        {donation.notes && (
          <div className="text-xs text-muted-foreground italic pl-3 border-l-2 border-indigo-500/30 py-1 print:text-slate-600 print:border-slate-300">
            Memo: "{donation.notes}"
          </div>
        )}

        {/* Thank You Footer */}
        <div className="pt-6 border-t border-border/40 text-center space-y-2 print:border-slate-300">
          <div className="mx-auto bg-indigo-500/5 p-2 rounded-full w-10 h-10 flex items-center justify-center print:hidden">
            <Gift className="h-5 w-5 text-indigo-400" />
          </div>
          <h3 className="text-sm font-bold text-primary-foreground print:text-slate-850">
            Asante sana kwa mchango wako!
          </h3>
          <p className="text-xs text-muted-foreground max-w-sm mx-auto leading-relaxed print:text-slate-600">
            "Every man according as he purposeth in his heart, so let him give; not grudgingly, or of necessity: for God loveth a cheerful giver." (2 Corinthians 9:7)
          </p>
        </div>

        {/* Verification stamp */}
        <div className="pt-4 flex justify-between items-center text-[10px] text-muted-foreground print:text-slate-500">
          <span>Church Nexus Ledger System</span>
          <span>Verified Completed Transaction</span>
        </div>
      </motion.div>
    </div>
  );
}
