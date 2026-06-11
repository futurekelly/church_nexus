"use client";

import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

interface MultiStepProgressProps {
  currentStep: number;
  totalSteps: number;
  labels: string[];
}

export function MultiStepProgress({
  currentStep,
  totalSteps,
  labels,
}: MultiStepProgressProps) {
  return (
    <div className="mb-8">
      <div className="mb-3 flex items-center justify-between">
        {labels.map((label, index) => {
          const stepNumber = index + 1;
          const isActive = stepNumber === currentStep;
          const isComplete = stepNumber < currentStep;

          return (
            <div key={label} className="flex flex-1 flex-col items-center">
              <div
                className={cn(
                  "flex h-8 w-8 items-center justify-center rounded-full text-xs font-bold transition-colors",
                  isComplete && "bg-success/20 text-success",
                  isActive && "bg-primary text-white shadow-neon",
                  !isActive && !isComplete && "bg-card text-muted-foreground",
                )}
              >
                {stepNumber}
              </div>
              <span
                className={cn(
                  "mt-1 hidden text-[10px] sm:block",
                  isActive ? "text-primary" : "text-muted-foreground",
                )}
              >
                {label}
              </span>
            </div>
          );
        })}
      </div>

      <div className="relative h-1 overflow-hidden rounded-full bg-card">
        <motion.div
          className="absolute inset-y-0 left-0 rounded-full bg-primary"
          initial={false}
          animate={{ width: `${((currentStep - 1) / (totalSteps - 1)) * 100}%` }}
          transition={{ duration: 0.3, ease: "easeOut" }}
        />
      </div>
    </div>
  );
}
