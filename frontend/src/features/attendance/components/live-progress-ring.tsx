"use client";

import { motion } from "framer-motion";
import { Users } from "lucide-react";

interface LiveProgressRingProps {
  presentCount: number;
  totalCount: number;
  size?: number;
  strokeWidth?: number;
}

export function LiveProgressRing({
  presentCount,
  totalCount,
  size = 180,
  strokeWidth = 14,
}: LiveProgressRingProps) {
  const percentage = totalCount > 0 ? Math.round((presentCount / totalCount) * 100) : 0;
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (percentage / 100) * circumference;

  return (
    <div 
      className="flex flex-col items-center justify-center p-6 bg-card/40 border border-border/40 rounded-2xl backdrop-blur-glass shadow-glass"
      role="progressbar"
      aria-valuenow={percentage}
      aria-valuemin={0}
      aria-valuemax={100}
      aria-label={`Attendance progress: ${percentage}% checked in`}
    >
      <div className="relative" style={{ width: size, height: size }}>
        {/* SVG Progress Ring */}
        <svg className="w-full h-full transform -rotate-90" viewBox={`0 0 ${size} ${size}`}>
          {/* Background Track */}
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            className="stroke-slate-800"
            strokeWidth={strokeWidth}
            fill="transparent"
          />
          {/* Animated Glow layer */}
          <motion.circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            className="stroke-indigo-500/30"
            strokeWidth={strokeWidth + 4}
            fill="transparent"
            strokeLinecap="round"
            initial={{ strokeDashoffset: circumference }}
            animate={{ strokeDashoffset }}
            transition={{ duration: 0.8, ease: "easeOut" }}
            style={{
              strokeDasharray: circumference,
              filter: "blur(4px)",
            }}
          />
          {/* Main Progress Stroke */}
          <motion.circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            className="stroke-indigo-400"
            strokeWidth={strokeWidth}
            fill="transparent"
            strokeLinecap="round"
            initial={{ strokeDashoffset: circumference }}
            animate={{ strokeDashoffset }}
            transition={{ duration: 0.8, ease: "easeOut" }}
            style={{
              strokeDasharray: circumference,
            }}
          />
        </svg>

        {/* Center content */}
        <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
          <motion.span 
            className="text-3xl font-extrabold text-primary-foreground font-mono"
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            key={presentCount}
          >
            {percentage}%
          </motion.span>
          <span className="text-[10px] text-muted-foreground uppercase font-bold tracking-widest mt-1">
            Checked In
          </span>
        </div>
      </div>

      <div className="mt-4 flex items-center justify-between gap-6 w-full text-xs">
        <div className="flex items-center gap-1.5 text-muted-foreground">
          <Users className="h-4 w-4 text-indigo-400" />
          <span>Expected Total:</span>
        </div>
        <span className="font-bold font-mono text-primary-foreground">
          {presentCount} / {totalCount}
        </span>
      </div>
    </div>
  );
}
