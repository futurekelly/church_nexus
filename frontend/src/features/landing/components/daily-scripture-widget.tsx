"use client";

import { BookOpen } from "lucide-react";
import { motion, useReducedMotion } from "framer-motion";
import { format, parseISO } from "date-fns";
import type { DailyScripture } from "@/features/landing/types/landing.types";
import { useTranslation } from "@/hooks/use-translation";
import { cn } from "@/lib/utils";

interface DailyScriptureWidgetProps {
  scripture: DailyScripture;
  className?: string;
}

export function DailyScriptureWidget({
  scripture,
  className,
}: DailyScriptureWidgetProps) {
  const { t } = useTranslation();
  const prefersReducedMotion = useReducedMotion();
  const formattedDate = format(parseISO(scripture.display_date), "MMMM d, yyyy");

  const Wrapper = prefersReducedMotion ? "div" : motion.div;

  return (
    <Wrapper
      {...(!prefersReducedMotion && {
        initial: { opacity: 0, y: 16 },
        animate: { opacity: 1, y: 0 },
        transition: { duration: 0.5, delay: 0.2 },
      })}
      className={cn(
        "glass-panel rounded-2xl border border-primary/20 p-6 shadow-glass",
        className,
      )}
    >
      <div className="mb-4 flex items-center gap-2">
        <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary/15">
          <BookOpen className="h-4 w-4 text-primary" aria-hidden="true" />
        </div>
        <div>
          <p className="text-xs font-semibold uppercase tracking-wider text-primary">
            {t("public.hero.daily_scripture")}
          </p>
          <time
            dateTime={scripture.display_date}
            className="text-xs text-muted-foreground"
          >
            {formattedDate}
          </time>
        </div>
      </div>

      <blockquote className="space-y-3">
        <p className="font-display text-lg font-semibold leading-relaxed text-primary-foreground md:text-xl">
          &ldquo;{scripture.scripture_text}&rdquo;
        </p>
        <footer className="text-sm font-medium text-primary">
          — {scripture.verse_reference}
        </footer>
      </blockquote>

      <p className="mt-4 border-t border-border/50 pt-4 text-sm leading-relaxed text-muted-foreground">
        {scripture.reflection}
      </p>
    </Wrapper>
  );
}
