"use client";

import { motion, useReducedMotion } from "framer-motion";
import { Heart, ArrowRight } from "lucide-react";
import Link from "next/link";
import { AUTH_ROUTES } from "@/constants/routes";
import { LANDING_SECTIONS } from "@/features/landing/constants/sections";

export function DonationCtaSection() {
  const prefersReducedMotion = useReducedMotion();

  return (
    <section
      id={LANDING_SECTIONS.DONATE}
      aria-labelledby="donate-heading"
      className="px-4 py-16 lg:px-8"
    >
      <div className="mx-auto max-w-7xl">
        {prefersReducedMotion ? (
          <DonationCard />
        ) : (
          <motion.div
            initial={{ opacity: 0, scale: 0.98 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.45 }}
          >
            <DonationCard />
          </motion.div>
        )}
      </div>
    </section>
  );
}

function DonationCard() {
  return (
    <div className="glass-panel relative overflow-hidden rounded-3xl border border-primary/20 px-6 py-12 text-center md:px-12 md:py-16">
      <div
        className="pointer-events-none absolute inset-0 bg-gradient-to-br from-primary/10 via-transparent to-secondary/10"
        aria-hidden="true"
      />

      <div className="relative">
        <div className="mx-auto mb-6 flex h-14 w-14 items-center justify-center rounded-2xl bg-primary/15 shadow-neon">
          <Heart className="h-7 w-7 text-primary" aria-hidden="true" />
        </div>

        <h2
          id="donate-heading"
          className="font-display text-3xl font-bold text-primary-foreground md:text-4xl"
        >
          Support the Mission
        </h2>
        <p className="mx-auto mt-4 max-w-2xl text-base leading-relaxed text-muted-foreground md:text-lg">
          Your generosity fuels ministry, outreach, and community care. Members
          and visitors can give securely online — tithes, offerings, and special
          contributions.
        </p>

        <div className="mt-8 flex flex-col items-center justify-center gap-4 sm:flex-row">
          <Link
            href={AUTH_ROUTES.REGISTER}
            className="group inline-flex items-center gap-2 rounded-lg bg-primary px-8 py-3 text-sm font-semibold text-white shadow-neon transition-all duration-200 hover:bg-primary/90 hover:shadow-[0_0_28px_rgba(139,92,246,0.5)]"
          >
            Give Today
            <ArrowRight
              className="h-4 w-4 transition-transform group-hover:translate-x-0.5"
              aria-hidden="true"
            />
          </Link>
          <Link
            href={AUTH_ROUTES.LOGIN}
            className="inline-flex rounded-lg border border-border bg-card/40 px-8 py-3 text-sm font-semibold text-primary-foreground transition-all duration-200 hover:border-primary/50 hover:shadow-neon"
          >
            Sign In to Give
          </Link>
        </div>
      </div>
    </div>
  );
}
