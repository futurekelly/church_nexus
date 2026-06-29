"use client";

import { cn } from "@/lib/utils";

interface CathedralCrossLoaderProps {
  className?: string;
  size?: "sm" | "md" | "lg";
  text?: string;
}

export function CathedralCrossLoader({
  className,
  size = "md",
  text,
}: CathedralCrossLoaderProps) {
  const sizeMap = {
    sm: "h-8 w-8",
    md: "h-14 w-14",
    lg: "h-20 w-20",
  };

  return (
    <div className={cn("flex flex-col items-center justify-center space-y-3 p-4 select-none", className)}>
      <div className={cn("relative flex items-center justify-center", sizeMap[size])}>
        {/* Pulsing Concentric Aura Rings */}
        <div className="absolute inset-0 rounded-full bg-indigo-500/20 animate-ping duration-1000" />
        <div className="absolute inset-2 rounded-full bg-amber-500/15 animate-pulse duration-700" />
        
        {/* Glowing Cathedral Cross SVG */}
        <svg
          viewBox="0 0 100 100"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className="h-full w-full drop-shadow-[0_0_12px_rgba(124,58,237,0.8)] z-10 animate-pulse"
        >
          {/* Outlined Cross Geometry */}
          <path
            d="M42 15 C42 12.8 43.8 11 46 11 H54 C56.2 11 58 12.8 58 15 V38 H81 C83.2 38 85 39.8 85 42 V50 C85 52.2 83.2 54 81 54 H58 V85 C58 87.2 56.2 89 54 89 H46 C43.8 89 42 87.2 42 85 V54 H19 C16.8 54 15 52.2 15 50 V42 C15 39.8 16.8 38 19 38 H42 V15 Z"
            fill="url(#crossGradient)"
            stroke="url(#crossStroke)"
            strokeWidth="3"
          />
          {/* Center Light Core */}
          <circle cx="50" cy="46" r="6" fill="#FDE047" className="animate-ping" />

          <defs>
            <linearGradient id="crossGradient" x1="50" y1="11" x2="50" y2="89" gradientUnits="userSpaceOnUse">
              <stop offset="0%" stopColor="#C084FC" />
              <stop offset="50%" stopColor="#7C3AED" />
              <stop offset="100%" stopColor="#4C1D95" />
            </linearGradient>
            <linearGradient id="crossStroke" x1="15" y1="50" x2="85" y2="50" gradientUnits="userSpaceOnUse">
              <stop offset="0%" stopColor="#FDE047" />
              <stop offset="100%" stopColor="#A855F7" />
            </linearGradient>
          </defs>
        </svg>
      </div>

      {text && (
        <p className="text-xs font-semibold tracking-wide text-indigo-200 animate-pulse">
          {text}
        </p>
      )}
    </div>
  );
}
