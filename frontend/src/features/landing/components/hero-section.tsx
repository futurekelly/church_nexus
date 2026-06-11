"use client";

import { motion, useReducedMotion } from "framer-motion";
import { ArrowRight, Play } from "lucide-react";
import Link from "next/link";
import { AUTH_ROUTES, PUBLIC_ROUTES } from "@/constants/routes";
import { LANDING_SECTIONS } from "@/features/landing/constants/sections";
import { DailyScriptureWidget } from "@/features/landing/components/daily-scripture-widget";
import type { DailyScripture } from "@/features/landing/types/landing.types";

interface HeroSectionProps {
  scripture: DailyScripture;
}

export function HeroSection({ scripture }: HeroSectionProps) {
  const prefersReducedMotion = useReducedMotion();

  return (
    <section
      id={LANDING_SECTIONS.HERO}
      aria-labelledby="hero-heading"
      className="relative overflow-hidden px-4 py-16 md:py-24 lg:px-8"
    >
      <div className="pointer-events-none absolute inset-0" aria-hidden="true">
        <div className="absolute -left-40 top-0 h-[500px] w-[500px] rounded-full bg-primary/15 blur-3xl" />
        <div className="absolute -right-40 bottom-0 h-[400px] w-[400px] rounded-full bg-secondary/15 blur-3xl" />
        {!prefersReducedMotion && (
          <>
            <motion.div
              className="absolute left-1/4 top-1/3 h-32 w-32 rounded-full bg-primary/10 blur-2xl"
              animate={{ y: [0, -20, 0], opacity: [0.4, 0.7, 0.4] }}
              transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
            />
            <motion.div
              className="absolute right-1/4 top-1/2 h-24 w-24 rounded-full bg-secondary/10 blur-2xl"
              animate={{ y: [0, 15, 0], opacity: [0.3, 0.6, 0.3] }}
              transition={{ duration: 5, repeat: Infinity, ease: "easeInOut" }}
            />
          </>
        )}
      </div>

      <div className="relative mx-auto grid max-w-7xl items-center gap-12 lg:grid-cols-2 lg:gap-16">
        <div>
          {prefersReducedMotion ? (
            <div>
              <HeroContent />
            </div>
          ) : (
            <motion.div
              initial={{ opacity: 0, x: -24 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5 }}
            >
              <HeroContent />
            </motion.div>
          )}
        </div>

        <DailyScriptureWidget scripture={scripture} />
      </div>
    </section>
  );
}

function HeroContent() {
  return (
    <>
      <p className="mb-4 text-sm font-semibold uppercase tracking-widest text-primary">
        Welcome Home
      </p>
      <h1
        id="hero-heading"
        className="font-display text-4xl font-bold leading-tight tracking-tight text-primary-foreground md:text-5xl lg:text-6xl"
      >
        Growing Together in Faith, Hope, and Love
      </h1>
      <p className="mt-6 max-w-xl text-base leading-relaxed text-muted-foreground md:text-lg">
        A modern church community united in worship, discipleship, and service.
        Join us as we connect hearts, strengthen families, and impact our world
        for Christ.
      </p>
      <div className="mt-8 flex flex-col gap-4 sm:flex-row">
        <Link
          href={AUTH_ROUTES.REGISTER}
          className="group inline-flex items-center justify-center gap-2 rounded-lg bg-primary px-6 py-3 text-sm font-semibold text-white shadow-neon transition-all duration-200 hover:bg-primary/90 hover:shadow-[0_0_28px_rgba(139,92,246,0.5)]"
        >
          Join Community
          <ArrowRight
            className="h-4 w-4 transition-transform group-hover:translate-x-0.5"
            aria-hidden="true"
          />
        </Link>
        <Link
          href={`#${LANDING_SECTIONS.SERMONS}`}
          className="group inline-flex items-center justify-center gap-2 rounded-lg border border-border bg-card/40 px-6 py-3 text-sm font-semibold text-primary-foreground transition-all duration-200 hover:border-primary/50 hover:bg-card/70 hover:shadow-neon"
        >
          <Play className="h-4 w-4 text-primary" aria-hidden="true" />
          Watch Sermons
        </Link>
      </div>
    </>
  );
}
