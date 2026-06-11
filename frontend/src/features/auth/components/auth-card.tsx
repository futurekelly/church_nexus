"use client";

import { motion } from "framer-motion";
import { Church } from "lucide-react";
import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

interface AuthCardProps {
  title: string;
  subtitle?: string;
  children: ReactNode;
  footer?: ReactNode;
  className?: string;
}

export function AuthCard({
  title,
  subtitle,
  children,
  footer,
  className,
}: AuthCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, ease: "easeOut" }}
      className={cn(
        "glass-panel w-full rounded-2xl border border-border/60 p-8 shadow-glass",
        className,
      )}
    >
      <div className="mb-8 flex flex-col items-center text-center">
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ delay: 0.1, duration: 0.3 }}
          className="mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-primary/15 shadow-neon"
        >
          <Church className="h-7 w-7 text-primary" aria-hidden="true" />
        </motion.div>
        <h1 className="font-display text-2xl font-bold text-primary-foreground">
          {title}
        </h1>
        {subtitle && (
          <p className="mt-2 text-sm text-muted-foreground">{subtitle}</p>
        )}
      </div>

      {children}

      {footer && (
        <div className="mt-6 border-t border-border/50 pt-6 text-center text-sm text-muted-foreground">
          {footer}
        </div>
      )}
    </motion.div>
  );
}
