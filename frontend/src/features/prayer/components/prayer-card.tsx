"use client";

import Link from "next/link";
import { Heart, MessageSquare, Pencil, Trash, User } from "lucide-react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import type { PrayerRequest } from "../types/prayer.types";
import { PRAYER_CATEGORY_LABELS } from "../types/prayer.types";
import { PrayerStatusBadge } from "./prayer-status-badge";
import { usePrayerPermissions } from "../hooks/use-prayer-permissions";

interface PrayerCardProps {
  request: PrayerRequest;
  onPrayToggle: (id: string) => void;
  onRespondClick?: (request: PrayerRequest) => void;
  onDeleteClick?: (id: string) => void;
  isDashboard?: boolean;
}

export function PrayerCard({
  request,
  onPrayToggle,
  onRespondClick,
  onDeleteClick,
  isDashboard = true,
}: PrayerCardProps) {
  const {
    canEdit,
    canDelete,
    canRespond,
    canSeeAnonymousNames,
    userId,
  } = usePrayerPermissions();

  const isOwner = userId ? String(userId) === String(request.user_id) : false;
  const userHasPrayed = userId ? request.prayed_user_ids.map(String).includes(String(userId)) : false;

  // Formatting date safely for hydration
  const dateObj = new Date(request.created_at);
  const formattedDate = dateObj.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });

  // Decide how to render the submitter's name
  let displayName = "Anonymous";
  if (!request.anonymous) {
    displayName = request.user_name;
  } else if (canSeeAnonymousNames) {
    displayName = `${request.user_name} [Anonymous]`;
  }

  const categoryLabel = PRAYER_CATEGORY_LABELS[request.category] || request.category;

  return (
    <motion.div
      layout
      className={cn(
        "group relative overflow-hidden rounded-2xl border border-border/50 bg-card/60 backdrop-blur-glass p-5",
        "flex flex-col h-full shadow-glass hover:border-primary/50 hover:shadow-[0_0_24px_rgba(var(--primary-rgb),0.15)]",
        "transition-all duration-300"
      )}
    >
      {/* Top row: Category & Status */}
      <div className="flex items-center justify-between gap-2 mb-3">
        <span className="rounded-full bg-slate-950/80 px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider text-primary backdrop-blur-sm border border-border/20">
          {categoryLabel}
        </span>
        <PrayerStatusBadge status={request.status} size="sm" />
      </div>

      {/* Title & Date */}
      <div className="mb-2">
        <h3 className="text-lg font-bold text-primary-foreground line-clamp-1 group-hover:text-primary transition-colors">
          {request.title}
        </h3>
        <div className="flex items-center gap-1.5 text-xs text-muted-foreground mt-1">
          <User className="h-3.5 w-3.5" />
          <span>By {displayName}</span>
          <span className="text-muted-foreground/30">•</span>
          <span>{formattedDate}</span>
        </div>
      </div>

      {/* Description */}
      <p className="text-sm text-muted-foreground/90 line-clamp-4 flex-1 mb-4 leading-relaxed">
        {request.description}
      </p>

      {/* Pastor Response Bubble if exists */}
      {request.pastor_response && (
        <div className="mb-4 rounded-xl border border-border/40 bg-slate-950/40 p-3 text-xs leading-relaxed">
          <div className="flex items-center gap-1 font-bold text-primary mb-1">
            <MessageSquare className="h-3.5 w-3.5" />
            <span>Pastor's Response</span>
          </div>
          <p className="text-muted-foreground italic">"{request.pastor_response}"</p>
        </div>
      )}

      {/* Divider */}
      <div className="h-px bg-border/40 my-3" />

      {/* Footer controls */}
      <div className="flex items-center justify-between gap-4">
        {/* I Prayed Button */}
        <button
          type="button"
          onClick={() => userId && onPrayToggle(request.id)}
          disabled={!userId}
          className={cn(
            "flex items-center gap-2 rounded-xl px-3 py-1.5 text-xs font-semibold transition-all duration-200",
            userHasPrayed
              ? "bg-rose-500/10 border border-rose-500/30 text-rose-400"
              : "bg-slate-900/50 border border-border/40 text-muted-foreground hover:text-primary-foreground hover:bg-slate-900",
            !userId && "opacity-50 cursor-not-allowed"
          )}
          aria-label={
            userHasPrayed
              ? `You indicated you prayed for this request. Current count: ${request.pray_count}`
              : `Mark that you prayed for this request. Current count: ${request.pray_count}`
          }
        >
          <Heart
            className={cn(
              "h-4 w-4 transition-transform duration-200",
              userHasPrayed && "fill-rose-400 text-rose-400 scale-110"
            )}
          />
          <span>{request.pray_count} {request.pray_count === 1 ? "Prayer" : "Prayers"}</span>
        </button>

        {/* Actions */}
        <div className="flex items-center gap-1">
          {/* Write Response (Pastors / Admins) */}
          {canRespond && onRespondClick && (
            <button
              type="button"
              onClick={() => onRespondClick(request)}
              className="flex h-8 items-center gap-1 rounded-lg px-2 border border-primary/30 bg-primary/10 text-[10px] font-semibold text-primary transition-all hover:bg-primary/20"
              aria-label="Respond to prayer request"
            >
              <MessageSquare className="h-3.5 w-3.5" />
              <span>Respond</span>
            </button>
          )}

          {/* Edit Button (Submitter / Admin) */}
          {canEdit(request) && (
            <Link
              href={`/dashboard/prayer/${request.id}/edit`}
              className="flex h-8 w-8 items-center justify-center rounded-lg border border-border/50 bg-card/40 text-muted-foreground transition-all hover:border-primary/40 hover:text-primary hover:bg-primary/5"
              aria-label="Edit prayer request"
            >
              <Pencil className="h-3.5 w-3.5" />
            </Link>
          )}

          {/* Delete Button (Submitter / Admin) */}
          {canDelete(request) && onDeleteClick && (
            <button
              type="button"
              onClick={() => onDeleteClick(request.id)}
              className="flex h-8 w-8 items-center justify-center rounded-lg border border-red-500/20 bg-card/40 text-red-400 transition-all hover:border-red-500/40 hover:bg-red-500/10"
              aria-label="Delete prayer request"
            >
              <Trash className="h-3.5 w-3.5" />
            </button>
          )}
        </div>
      </div>
    </motion.div>
  );
}
