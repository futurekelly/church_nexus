"use client";

import { useDonations } from "@/features/donations";
import { DonationForm } from "@/features/donations/components/donation-form";
import { motion } from "framer-motion";
import { Gift, Heart } from "lucide-react";

export default function PublicGivingPage() {
  const { campaigns, addDonation } = useDonations();

  const handleSubmit = async (values: any) => {
    return addDonation(values);
  };

  return (
    <div className="relative min-h-screen py-20 bg-[radial-gradient(ellipse_at_top,rgba(16,185,129,0.05),transparent_60%)]">
      {/* Background neon dots */}
      <div className="absolute top-1/4 left-10 w-4 h-4 rounded-full bg-emerald-500/20 blur-sm print:hidden" />
      <div className="absolute bottom-1/3 right-12 w-6 h-6 rounded-full bg-indigo-500/20 blur-sm print:hidden" />

      <div className="max-w-4xl mx-auto px-6 space-y-12">
        {/* Page Header */}
        <div className="text-center space-y-4">
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 0.3 }}
            className="inline-flex bg-indigo-500/10 border border-indigo-500/20 p-3 rounded-full mb-2 print:hidden"
          >
            <Gift className="h-6 w-6 text-indigo-400" />
          </motion.div>
          <motion.h1
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
            className="text-4xl font-extrabold tracking-tight bg-gradient-to-r from-primary-foreground via-indigo-200 to-indigo-400 bg-clip-text text-transparent"
          >
            Support Our Ministry
          </motion.h1>
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="text-sm text-muted-foreground max-w-xl mx-auto leading-relaxed"
          >
            Your generosity fuels our mission to love God, serve people, and build communities. Give securely via Credit/Debit card or mobile money (M-Pesa).
          </motion.p>
        </div>

        {/* Form Grid */}
        <div className="grid gap-8 md:grid-cols-3 items-start">
          {/* Info Card Sidebar */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.4, delay: 0.2 }}
            className="space-y-6 md:col-span-1 print:hidden"
          >
            <div className="rounded-2xl border border-border/50 bg-card/60 p-6 backdrop-blur-glass shadow-glass space-y-4">
              <h3 className="font-bold text-primary-foreground flex items-center gap-1.5">
                <Heart className="h-5 w-5 text-pink-400" />
                Why We Give
              </h3>
              <p className="text-xs text-muted-foreground leading-relaxed">
                We believe giving is an act of worship and covenant. It represents our trust in God's provision and our commitment to serving the church.
              </p>
            </div>

            <div className="rounded-2xl border border-border/50 bg-card/60 p-6 backdrop-blur-glass shadow-glass space-y-4">
              <h3 className="font-bold text-primary-foreground">Campaign Goals</h3>
              <p className="text-xs text-muted-foreground leading-relaxed">
                You can select to route your contribution directly to one of our active projects like the <strong>Church Building Expansion</strong> or the <strong>New PA Audio System</strong>.
              </p>
            </div>
          </motion.div>

          {/* Core Checkout Card Form */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="md:col-span-2 rounded-2xl border border-border/50 bg-card/40 p-8 backdrop-blur-glass shadow-glass print:border-none print:bg-transparent print:p-0"
          >
            <DonationForm campaigns={campaigns} onSubmit={handleSubmit} />
          </motion.div>
        </div>
      </div>
    </div>
  );
}
