"use client";

import { motion } from "framer-motion";
import { formatTZS } from "../utils/format";
import type { PledgeCampaign } from "../types/donations.types";
import { StatusBadge } from "@/components/ui/status-badge";
import { Calendar, Target } from "lucide-react";

interface PledgeCardProps {
  campaign: PledgeCampaign;
}

export function PledgeCard({ campaign }: PledgeCardProps) {
  const percentage = Math.min(
    100,
    Math.max(0, Math.round((campaign.raised_amount / campaign.target_amount) * 100))
  );

  const formattedTargetDate = new Date(campaign.target_date).toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });

  const getStatusColors = () => {
    switch (campaign.status) {
      case "Fulfilled":
        return {
          bg: "bg-emerald-500/10 border border-emerald-500/20",
          text: "text-emerald-400",
          dot: "bg-emerald-400 shadow-[0_0_8px_#34d399]",
        };
      case "Cancelled":
        return {
          bg: "bg-slate-500/10 border border-slate-500/20",
          text: "text-slate-400",
          dot: "bg-slate-400 shadow-[0_0_8px_#94a3b8]",
        };
      default:
        return {
          bg: "bg-indigo-500/10 border border-indigo-500/20",
          text: "text-indigo-400",
          dot: "bg-indigo-400 shadow-[0_0_8px_#818cf8]",
        };
    }
  };

  const colors = getStatusColors();

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="rounded-2xl border border-border/50 bg-card/60 p-5 backdrop-blur-glass shadow-glass flex flex-col justify-between space-y-4 hover:border-indigo-500/30 transition-all duration-300 group"
    >
      <div>
        <div className="flex items-start justify-between">
          <h4 className="font-bold text-primary-foreground group-hover:text-indigo-400 transition-colors duration-300">
            {campaign.name}
          </h4>
          <StatusBadge
            label={campaign.status}
            bgClass={colors.bg}
            textClass={colors.text}
            dotClass={colors.dot}
            size="sm"
          />
        </div>
        {campaign.description && (
          <p className="text-xs text-muted-foreground mt-2 line-clamp-2 leading-relaxed">
            {campaign.description}
          </p>
        )}
      </div>

      <div className="space-y-2">
        <div className="flex justify-between text-xs font-semibold">
          <span className="text-muted-foreground">Progress</span>
          <span className="text-primary-foreground">{percentage}%</span>
        </div>
        <div className="h-2 w-full rounded-full bg-slate-800/80 overflow-hidden border border-border/30">
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: `${percentage}%` }}
            transition={{ duration: 0.8, ease: "easeOut" }}
            className={`h-full rounded-full ${
              campaign.status === "Fulfilled"
                ? "bg-gradient-to-r from-emerald-500 to-teal-400 shadow-[0_0_8px_rgba(16,185,129,0.3)]"
                : "bg-gradient-to-r from-indigo-500 to-purple-500 shadow-[0_0_8px_rgba(99,102,241,0.3)]"
            }`}
          />
        </div>
        <div className="flex items-center justify-between text-xs text-muted-foreground pt-1">
          <div className="flex items-center space-x-1">
            <Target className="h-3 w-3 text-indigo-400" />
            <span>Raised: <strong>{formatTZS(campaign.raised_amount)}</strong></span>
          </div>
          <div className="text-slate-400 font-medium">
            Goal: {formatTZS(campaign.target_amount)}
          </div>
        </div>
      </div>

      <div className="border-t border-border/40 pt-3 flex items-center justify-between text-[11px] text-muted-foreground">
        <div className="flex items-center space-x-1">
          <Calendar className="h-3.5 w-3.5 text-slate-400" />
          <span>Ends: {formattedTargetDate}</span>
        </div>
      </div>
    </motion.div>
  );
}
