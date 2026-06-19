"use client";

import { useState, useEffect } from "react";
import { motion, useReducedMotion, useScroll, useTransform } from "framer-motion";
import { ArrowRight, Play } from "lucide-react";
import Link from "next/link";
import { AUTH_ROUTES } from "@/constants/routes";
import { LANDING_SECTIONS } from "@/features/landing/constants/sections";
import { DailyScriptureWidget } from "@/features/landing/components/daily-scripture-widget";
import type { DailyScripture } from "@/features/landing/types/landing.types";

interface HeroSectionProps {
  scripture: DailyScripture;
}

interface PhraseType {
  prefix: string;
  suffix: string;
}

const PHRASES: PhraseType[] = [
  { prefix: "Growing Together in ", suffix: "Faith, Hope, and Love" },
  { prefix: "A Welcoming Community for ", suffix: "Every Heart" },
  { prefix: "Strengthening Families and Impacting ", suffix: "Our World" },
  { prefix: "Connecting Hearts through ", suffix: "Worship and Service" }
];

function TypewriterHeading() {
  const [phraseIdx, setPhraseIdx] = useState(0);
  const [displayText, setDisplayText] = useState("");
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    const currentPhrase = PHRASES[phraseIdx];
    const fullText = currentPhrase.prefix + currentPhrase.suffix;
    let timer: NodeJS.Timeout;

    if (isDeleting) {
      timer = setTimeout(() => {
        setDisplayText((prev) => prev.slice(0, -1));
      }, 45);
    } else {
      timer = setTimeout(() => {
        setDisplayText((prev) => fullText.slice(0, prev.length + 1));
      }, 85);
    }

    if (!isDeleting && displayText === fullText) {
      timer = setTimeout(() => {
        setIsDeleting(true);
      }, 2500);
    } else if (isDeleting && displayText === "") {
      setIsDeleting(false);
      setPhraseIdx((prev) => (prev + 1) % PHRASES.length);
    }

    return () => clearTimeout(timer);
  }, [displayText, isDeleting, phraseIdx]);

  const currentPhrase = PHRASES[phraseIdx];
  const prefixText = displayText.slice(0, currentPhrase.prefix.length);
  const suffixText = displayText.slice(currentPhrase.prefix.length);

  return (
    <span className="relative inline-block">
      <span className="text-primary-foreground">
        {prefixText}
      </span>
      {suffixText && (
        <span className="bg-gradient-to-r from-primary via-purple-400 to-blue-400 bg-clip-text text-transparent">
          {suffixText}
        </span>
      )}
      <span 
        className="ml-1 inline-block w-[3px] h-[1.1em] bg-primary/70 animate-pulse align-middle" 
        style={{ content: '""', verticalAlign: "middle" }} 
      />
    </span>
  );
}

export function HeroSection({ scripture }: HeroSectionProps) {
  const prefersReducedMotion = useReducedMotion();
  const { scrollY } = useScroll();

  const bgY1 = useTransform(scrollY, [0, 800], [0, 120]);
  const bgY2 = useTransform(scrollY, [0, 800], [0, -100]);
  const bgY3 = useTransform(scrollY, [0, 800], [0, 60]);
  const bgY4 = useTransform(scrollY, [0, 800], [0, -40]);

  return (
    <section
      id={LANDING_SECTIONS.HERO}
      aria-labelledby="hero-heading"
      className="relative overflow-hidden px-4 py-16 md:py-24 lg:px-8"
    >
      <div className="pointer-events-none absolute inset-0" aria-hidden="true">
        <motion.div
          style={{ y: prefersReducedMotion ? 0 : bgY1 }}
          className="absolute -left-40 top-0 h-[500px] w-[500px] rounded-full bg-primary/15 blur-3xl"
        />
        <motion.div
          style={{ y: prefersReducedMotion ? 0 : bgY2 }}
          className="absolute -right-40 bottom-0 h-[400px] w-[400px] rounded-full bg-secondary/15 blur-3xl"
        />
        {!prefersReducedMotion && (
          <>
            <motion.div
              style={{ y: bgY3 }}
              className="absolute left-1/4 top-1/3 h-32 w-32 rounded-full bg-primary/10 blur-2xl"
              animate={{ opacity: [0.4, 0.7, 0.4] }}
              transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
            />
            <motion.div
              style={{ y: bgY4 }}
              className="absolute right-1/4 top-1/2 h-24 w-24 rounded-full bg-secondary/10 blur-2xl"
              animate={{ opacity: [0.3, 0.6, 0.3] }}
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
        className="font-display text-4xl font-bold leading-tight tracking-tight text-primary-foreground md:text-5xl lg:text-6xl min-h-[120px] md:min-h-[150px] lg:min-h-[180px]"
      >
        <TypewriterHeading />
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
