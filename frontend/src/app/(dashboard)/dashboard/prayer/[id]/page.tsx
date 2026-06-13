"use client";

import { useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { ChevronLeft, MessageSquare, AlertTriangle, Calendar, User, Heart, Lock, CheckCircle2, RefreshCw } from "lucide-react";
import { toast } from "sonner";
import { useAuth } from "@/hooks/use-auth";
import { cn } from "@/lib/utils";
import {
  usePrayers,
  usePrayerPermissions,
  PrayerStatusBadge,
  PRAYER_CATEGORY_LABELS,
  STATUS_LABELS,
  PRAYER_STATUSES,
  type PrayerStatus,
} from "@/features/prayer";

export default function PrayerDetailPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const { user } = useAuth();
  const { getRequestById, togglePrayCount, updateStatus, respondToRequest } = usePrayers();
  const { canRespond, canManageStatus, canSeeAnonymousNames } = usePrayerPermissions();

  const request = getRequestById(id);
  const [responseText, setResponseText] = useState(request?.pastor_response || "");
  const [isUpdatingResponse, setIsUpdatingResponse] = useState(false);

  if (!request) {
    return (
      <div className="flex flex-col items-center justify-center py-24 text-center">
        <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-slate-800 text-muted-foreground mb-4">
          <AlertTriangle className="h-6 w-6" />
        </div>
        <p className="text-lg font-semibold text-primary-foreground">
          Request not found
        </p>
        <p className="mt-2 text-sm text-muted-foreground">
          The prayer request you are looking for does not exist or has been removed.
        </p>
        <button
          onClick={() => router.push("/dashboard/prayer")}
          className="mt-6 rounded-xl border border-border bg-card/60 px-4 py-2 text-xs font-semibold text-muted-foreground hover:text-primary-foreground transition-all"
        >
          Back to Prayer Center
        </button>
      </div>
    );
  }

  const isOwner = user ? String(user.id) === String(request.user_id) : false;
  const userHasPrayed = user ? request.prayed_user_ids.map(String).includes(String(user.id)) : false;

  const dateObj = new Date(request.created_at);
  const formattedDate = dateObj.toLocaleDateString("en-US", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  // Submitter name rendering
  let displayName = "Anonymous";
  if (!request.anonymous) {
    displayName = request.user_name;
  } else if (canSeeAnonymousNames) {
    displayName = `${request.user_name} [Anonymous]`;
  }

  const handlePrayToggle = () => {
    if (!user) return;
    togglePrayCount(request.id, user.id);
  };

  const handleStatusChange = (newStatus: any) => {
    const statusVal = newStatus as PrayerStatus;
    updateStatus(request.id, statusVal);
    toast.success(`Request status updated to "${(STATUS_LABELS as any)[statusVal]}"`);
  };

  const handleResponseSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsUpdatingResponse(true);
    try {
      respondToRequest(request.id, responseText.trim() || null);
      toast.success("Pastor response updated successfully.");
    } catch {
      toast.error("Failed to save response.");
    } finally {
      setIsUpdatingResponse(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Back navigation */}
      <div className="flex items-center gap-2">
        <Link
          href="/dashboard/prayer"
          className="flex h-8 w-8 items-center justify-center rounded-lg border border-border/50 bg-card/60 text-muted-foreground transition-all hover:border-primary/40 hover:text-primary hover:bg-primary/5"
          aria-label="Back to Prayer dashboard"
        >
          <ChevronLeft className="h-4 w-4" />
        </Link>
        <span className="text-sm text-muted-foreground">Back to Prayer Center</span>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* Main Content Details */}
        <div className="space-y-6 lg:col-span-2">
          <div className="rounded-2xl border border-border/50 bg-card/60 p-6 backdrop-blur-glass space-y-4 shadow-glass">
            {/* Header info */}
            <div className="flex items-center justify-between gap-4">
              <span className="rounded-full bg-slate-950/80 px-2.5 py-1 text-xs font-bold uppercase tracking-wider text-primary border border-border/20">
                {PRAYER_CATEGORY_LABELS[request.category] || request.category}
              </span>
              <PrayerStatusBadge status={request.status} />
            </div>

            {/* Title & metadata */}
            <div>
              <h1 className="text-2xl font-bold text-primary-foreground">
                {request.title}
              </h1>
              <div className="flex flex-wrap items-center gap-4 text-xs text-muted-foreground mt-2">
                <div className="flex items-center gap-1.5">
                  <User className="h-3.5 w-3.5" />
                  <span>By {displayName}</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <Calendar className="h-3.5 w-3.5" />
                  <span>{formattedDate}</span>
                </div>
              </div>
            </div>

            {/* Description */}
            <div className="h-px bg-border/40" />
            <p className="text-base text-muted-foreground/95 leading-relaxed whitespace-pre-line">
              {request.description}
            </p>

            {/* Pray button area */}
            <div className="flex items-center justify-between pt-4 border-t border-border/40">
              <button
                type="button"
                onClick={handlePrayToggle}
                disabled={!user}
                className={cn(
                  "flex items-center gap-2 rounded-xl px-4 py-2.5 text-sm font-semibold transition-all duration-200",
                  userHasPrayed
                    ? "bg-rose-500/10 border border-rose-500/30 text-rose-400 shadow-[0_0_12px_rgba(244,63,94,0.1)]"
                    : "bg-slate-900/50 border border-border/40 text-muted-foreground hover:text-primary-foreground hover:bg-slate-900",
                  !user && "opacity-50 cursor-not-allowed"
                )}
              >
                <Heart
                  className={cn(
                    "h-5 w-5 transition-transform duration-200",
                    userHasPrayed && "fill-rose-400 text-rose-400 scale-110"
                  )}
                />
                <span>
                  {request.pray_count} {request.pray_count === 1 ? "Prayer Offered" : "Prayers Offered"}
                </span>
              </button>

              <span className="text-xs text-muted-foreground italic">
                {userHasPrayed ? "You have stood in prayer for this" : "Click to offer intercessory support"}
              </span>
            </div>
          </div>

          {/* Timeline / Progress Logs */}
          <div className="rounded-2xl border border-border/50 bg-card/60 p-6 backdrop-blur-glass space-y-4 shadow-glass">
            <h2 className="text-lg font-bold text-primary-foreground">Prayer Log & Progress</h2>
            <div className="relative pl-6 space-y-6 before:absolute before:left-2 before:top-2 before:bottom-2 before:w-0.5 before:bg-border/30">
              
              {/* Log Step 1 */}
              <div className="relative">
                <div className="absolute -left-6 top-1 h-4.5 w-4.5 rounded-full border border-border bg-slate-950 flex items-center justify-center">
                  <div className="h-1.5 w-1.5 rounded-full bg-primary" />
                </div>
                <div>
                  <h4 className="text-sm font-bold text-primary-foreground">Prayer Request Submitted</h4>
                  <p className="text-xs text-muted-foreground mt-0.5">{formattedDate}</p>
                  <p className="text-xs text-muted-foreground mt-1">
                    Request is now public for intercessors in the congregation.
                  </p>
                </div>
              </div>

              {/* Log Step 2 (Under prayer) */}
              {(request.status === "In Progress" || request.status === "Answered" || request.status === "Archived") && (
                <div className="relative">
                  <div className="absolute -left-6 top-1 h-4.5 w-4.5 rounded-full border border-purple-500/30 bg-slate-950 flex items-center justify-center">
                    <div className="h-1.5 w-1.5 rounded-full bg-purple-400" />
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-purple-400">Marked as Active Prayer Focus</h4>
                    <p className="text-xs text-muted-foreground mt-1">
                      Our intercession team and pastor are actively lifting this request.
                    </p>
                  </div>
                </div>
              )}

              {/* Log Step 3 (Pastor Responded) */}
              {request.pastor_response && (
                <div className="relative">
                  <div className="absolute -left-6 top-1 h-4.5 w-4.5 rounded-full border border-cyan-500/30 bg-slate-950 flex items-center justify-center">
                    <div className="h-1.5 w-1.5 rounded-full bg-cyan-400" />
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-cyan-400">Encouragement & Pastoral Response Recorded</h4>
                    <p className="text-xs text-muted-foreground italic mt-1 bg-slate-950/20 p-2.5 rounded-lg border border-border/20">
                      "{request.pastor_response}"
                    </p>
                  </div>
                </div>
              )}

              {/* Log Step 4 (Answered) */}
              {request.status === "Answered" && (
                <div className="relative">
                  <div className="absolute -left-6 top-1 h-4.5 w-4.5 rounded-full border border-emerald-500/30 bg-slate-950 flex items-center justify-center">
                    <CheckCircle2 className="h-4 w-4 text-emerald-400 fill-slate-950" />
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-emerald-400">Answered Prayer & Praise Report!</h4>
                    <p className="text-xs text-muted-foreground mt-1">
                      Praise God! The submitter has recorded this request as answered and resolved.
                    </p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Sidebar Controls (Pastors/Admins) */}
        <div className="space-y-6">
          {canManageStatus || canRespond ? (
            <div className="rounded-2xl border border-border/50 bg-card/60 p-6 backdrop-blur-glass space-y-5 shadow-glass">
              <h3 className="text-base font-bold text-primary-foreground flex items-center gap-1.5 border-b border-border/40 pb-2">
                <Lock className="h-4 w-4 text-primary" />
                <span>Pastor Actions</span>
              </h3>

              {/* Status Update Dropdown */}
              {canManageStatus && (
                <div className="space-y-2">
                  <label htmlFor="status-select" className="text-xs font-semibold text-muted-foreground">
                    Update Request Status
                  </label>
                  <select
                    id="status-select"
                    value={request.status}
                    onChange={(e) => handleStatusChange(e.target.value)}
                    className={cn(
                      "w-full rounded-xl border border-border/50 bg-card/60 px-3 py-2 text-sm text-primary-foreground",
                      "focus:outline-none focus:border-primary/50 cursor-pointer"
                    )}
                  >
                    {PRAYER_STATUSES.map((s) => (
                      <option key={s} value={s}>
                        {STATUS_LABELS[s]}
                      </option>
                    ))}
                  </select>
                </div>
              )}

              {/* Response Input Form */}
              {canRespond && (
                <form onSubmit={handleResponseSubmit} className="space-y-3 pt-2">
                  <label htmlFor="detail-response-text" className="text-xs font-semibold text-muted-foreground block">
                    {request.pastor_response ? "Edit Response Note" : "Write Response Note"}
                  </label>
                  <textarea
                    id="detail-response-text"
                    rows={4}
                    value={responseText}
                    onChange={(e) => setResponseText(e.target.value)}
                    placeholder="Enter message of faith and encouragement..."
                    className={cn(
                      "w-full rounded-xl border border-border/50 bg-card/60 px-3 py-2 text-xs text-primary-foreground resize-none",
                      "focus:outline-none focus:border-primary/50"
                    )}
                  />
                  <button
                    type="submit"
                    disabled={isUpdatingResponse}
                    className="w-full flex items-center justify-center gap-1.5 rounded-xl bg-primary py-2 text-xs font-semibold text-primary-foreground shadow-neon transition-all hover:brightness-110"
                  >
                    {isUpdatingResponse ? (
                      <RefreshCw className="h-3.5 w-3.5 animate-spin" />
                    ) : (
                      <MessageSquare className="h-3.5 w-3.5" />
                    )}
                    <span>Save Response</span>
                  </button>
                </form>
              )}
            </div>
          ) : (
            <div className="rounded-2xl border border-border/50 bg-card/40 p-5 backdrop-blur-glass text-center text-xs text-muted-foreground">
              <p>Stands in agreement with others. Click the heart button to intercede.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
