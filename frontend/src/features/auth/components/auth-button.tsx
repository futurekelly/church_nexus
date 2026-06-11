"use client";

import { motion } from "framer-motion";
import { Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";

interface AuthButtonProps {
  children: React.ReactNode;
  className?: string;
  isLoading?: boolean;
  disabled?: boolean;
  variant?: "primary" | "ghost";
  type?: "button" | "submit" | "reset";
  onClick?: () => void;
}

export function AuthButton({
  children,
  className,
  isLoading,
  disabled,
  variant = "primary",
  type = "submit",
  onClick,
}: AuthButtonProps) {
  return (
    <motion.button
      whileHover={{ scale: disabled || isLoading ? 1 : 1.01 }}
      whileTap={{ scale: disabled || isLoading ? 1 : 0.99 }}
      type={type}
      disabled={disabled || isLoading}
      onClick={onClick}
      className={cn(
        "relative flex w-full items-center justify-center gap-2 rounded-lg px-4 py-2.5",
        "text-sm font-semibold transition-all duration-200",
        variant === "primary" && [
          "bg-primary text-white shadow-neon",
          "hover:bg-primary/90 hover:shadow-[0_0_28px_rgba(139,92,246,0.45)]",
          "disabled:cursor-not-allowed disabled:opacity-60",
        ],
        variant === "ghost" && [
          "border border-border bg-card/40 text-primary-foreground",
          "hover:border-primary/50 hover:bg-card/70",
        ],
        className,
      )}
    >
      {isLoading && <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />}
      {children}
    </motion.button>
  );
}
