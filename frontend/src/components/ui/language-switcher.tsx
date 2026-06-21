"use client";

import { Globe } from "lucide-react";
import { useRef, useState } from "react";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { useTranslation } from "@/hooks/use-translation";
import { useClickOutside } from "@/hooks/use-click-outside";
import { cn } from "@/lib/utils";

export function LanguageSwitcher() {
  const { language, setLanguage } = useTranslation();
  const [open, setOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const prefersReducedMotion = useReducedMotion();

  useClickOutside(containerRef, () => setOpen(false), open);

  const languages = [
    { code: "en", name: "English", flag: "🇺🇸" },
    { code: "sw", name: "Kiswahili", flag: "🇹🇿" },
  ];

  const currentLang = languages.find((l) => l.code === language) || languages[0];

  return (
    <div ref={containerRef} className="relative">
      <button
        type="button"
        aria-label="Change language"
        aria-expanded={open}
        aria-haspopup="listbox"
        onClick={() => setOpen((prev) => !prev)}
        className={cn(
          "flex items-center gap-2 rounded-lg border border-border/50 bg-card/40 px-3 py-1.5 text-xs font-medium text-muted-foreground transition-all duration-200",
          "hover:bg-card/80 hover:text-primary-foreground hover:shadow-neon",
          open && "bg-card/80 text-primary-foreground shadow-neon"
        )}
      >
        <Globe className="h-4 w-4 text-primary" aria-hidden="true" />
        <span>{currentLang.name}</span>
        <span className="text-[10px] opacity-75">{currentLang.flag}</span>
      </button>

      <AnimatePresence>
        {open && (
          <motion.ul
            initial={prefersReducedMotion ? { opacity: 1 } : { opacity: 0, y: 8 }}
            animate={prefersReducedMotion ? { opacity: 1 } : { opacity: 1, y: 0 }}
            exit={prefersReducedMotion ? { opacity: 0 } : { opacity: 0, y: 8 }}
            transition={{ duration: 0.15 }}
            role="listbox"
            aria-label="Language options"
            className="glass-panel absolute right-0 mt-2 z-50 w-36 rounded-xl border border-border bg-surface p-1 shadow-2xl backdrop-blur-glass"
          >
            {languages.map((lang) => (
              <li key={lang.code}>
                <button
                  type="button"
                  role="option"
                  aria-selected={language === lang.code}
                  onClick={() => {
                    setLanguage(lang.code);
                    setOpen(false);
                  }}
                  className={cn(
                    "flex w-full items-center justify-between rounded-lg px-2.5 py-2 text-left text-xs font-medium transition-colors",
                    language === lang.code
                      ? "bg-primary/15 text-primary shadow-neon"
                      : "text-muted-foreground hover:bg-card/80 hover:text-primary-foreground"
                  )}
                >
                  <span>{lang.name}</span>
                  <span className="text-sm">{lang.flag}</span>
                </button>
              </li>
            ))}
          </motion.ul>
        )}
      </AnimatePresence>
    </div>
  );
}
