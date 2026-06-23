"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Check, Clipboard, ShieldAlert, X } from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import type { Child, Classroom } from "../types/kids-kingdom.types";

interface CheckInDialogProps {
  child: Child;
  classrooms: Classroom[];
  onCheckIn: (childId: string, checkedInById: string, classroomId?: string) => Promise<any>;
  onClose: () => void;
}

const selectClass = cn(
  "w-full rounded-xl border border-border/50 bg-card/60 px-4 py-2.5",
  "text-sm text-primary-foreground",
  "backdrop-blur-[16px] transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary/50"
);

export function CheckInDialog({
  child,
  classrooms,
  onCheckIn,
  onClose,
}: CheckInDialogProps) {
  const [selectedParentId, setSelectedParentId] = useState<string>(
    child.parent_details && child.parent_details.length > 0 ? child.parent_details[0].id : ""
  );
  
  // Recommend classroom based on child's age
  const age = child.age || 0;
  const recommendedRoom = classrooms.find((c) => age >= c.min_age && age <= c.max_age);

  const [selectedRoomId, setSelectedRoomId] = useState<string>(
    recommendedRoom ? recommendedRoom.id : ""
  );
  
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [successData, setSuccessData] = useState<any | null>(null);
  const [copied, setCopied] = useState(false);

  const handleCheckInSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedParentId) {
      toast.error("Please select the parent/guardian dropping off the child.");
      return;
    }
    
    setIsSubmitting(true);
    try {
      const data = await onCheckIn(child.id, selectedParentId, selectedRoomId || undefined);
      if (data) {
        setSuccessData(data);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsSubmitting(false);
    }
  };

  const copyToClipboard = () => {
    if (successData?.security_code) {
      navigator.clipboard.writeText(successData.security_code);
      setCopied(true);
      toast.success("Security code copied to clipboard!");
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.95 }}
      className="w-full max-w-md overflow-hidden rounded-3xl border border-border/50 bg-slate-900/95 p-6 backdrop-blur-xl shadow-2xl"
    >
      <div className="flex items-center justify-between border-b border-border/10 pb-4 mb-5">
        <h3 className="text-base font-bold text-primary-foreground">
          {successData ? "Check-In Completed" : `Check In: ${child.first_name} ${child.last_name}`}
        </h3>
        <button
          type="button"
          onClick={onClose}
          className="rounded-xl border border-border/50 p-2 text-muted-foreground transition-all hover:bg-card/50 hover:text-primary-foreground"
        >
          <X className="h-4 w-4" />
        </button>
      </div>

      <AnimatePresence mode="wait">
        {!successData ? (
          <motion.form
            key="check-in-form"
            onSubmit={handleCheckInSubmit}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="space-y-4"
          >
            {/* Child Info Badge */}
            <div className="flex items-center justify-between rounded-2xl bg-indigo-500/10 border border-indigo-500/20 p-4">
              <div>
                <span className="text-xs text-indigo-400 font-bold uppercase tracking-wider">Age allocation</span>
                <h4 className="text-sm font-bold text-white">{child.first_name} ({child.age} yrs)</h4>
              </div>
              {child.allergy_alerts && (
                <span className="rounded-full bg-red-500/20 px-2.5 py-0.5 text-[10px] font-bold uppercase text-red-400 border border-red-500/30">
                  Allergies
                </span>
              )}
            </div>

            {/* Parent Selection */}
            <div>
              <label htmlFor="checked_in_by" className="block text-xs font-semibold text-muted-foreground mb-1.5">
                Dropped Off By (Guardian)
              </label>
              <select
                id="checked_in_by"
                className={selectClass}
                value={selectedParentId}
                onChange={(e) => setSelectedParentId(e.target.value)}
              >
                <option value="">-- Select Parent/Guardian --</option>
                {child.parent_details?.map((parent) => (
                  <option key={parent.id} value={parent.id}>
                    {parent.first_name} {parent.last_name} ({parent.phone_number})
                  </option>
                ))}
              </select>
            </div>

            {/* Classroom Selection */}
            <div>
              <label htmlFor="classroom" className="block text-xs font-semibold text-muted-foreground mb-1.5">
                Classroom Allocation
              </label>
              <select
                id="classroom"
                className={selectClass}
                value={selectedRoomId}
                onChange={(e) => setSelectedRoomId(e.target.value)}
              >
                <option value="">-- Auto-allocate Classroom --</option>
                {classrooms.map((room) => {
                  const isRecommended = recommendedRoom?.id === room.id;
                  return (
                    <option key={room.id} value={room.id}>
                      {room.name} ({room.min_age}-{room.max_age} yrs) {isRecommended ? "[Recommended]" : ""}
                    </option>
                  );
                })}
              </select>
            </div>

            {child.allergy_alerts && (
              <div className="flex gap-2 rounded-xl border border-red-500/20 bg-red-500/5 p-3 text-xs text-red-400 leading-normal">
                <ShieldAlert className="h-4 w-4 shrink-0 mt-0.5" />
                <div>
                  <span className="font-bold">ALLERGY WARNING: </span>
                  {child.allergy_alerts}
                </div>
              </div>
            )}

            <div className="flex items-center justify-end gap-3 border-t border-border/10 pt-4 mt-6">
              <button
                type="button"
                onClick={onClose}
                className="rounded-xl border border-border/50 bg-card/60 px-4 py-2.5 text-xs font-semibold text-muted-foreground hover:text-primary-foreground transition-all"
                disabled={isSubmitting}
              >
                Cancel
              </button>
              <button
                type="submit"
                className={cn(
                  "inline-flex items-center gap-1.5 rounded-xl bg-indigo-600 px-5 py-2.5 text-xs font-bold text-white transition-all hover:bg-indigo-500 shadow-[0_0_12px_rgba(99,102,241,0.3)]",
                  isSubmitting && "opacity-50 cursor-not-allowed"
                )}
                disabled={isSubmitting}
              >
                Confirm Drop-Off
              </button>
            </div>
          </motion.form>
        ) : (
          <motion.div
            key="success-view"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="text-center py-4 space-y-6"
          >
            {/* Success Code Card */}
            <div className="rounded-2xl border border-dashed border-indigo-500/40 bg-indigo-500/5 p-6 max-w-xs mx-auto space-y-4">
              <span className="text-xs font-bold tracking-wider text-indigo-400 uppercase">
                Daily Pickup Security Code
              </span>
              <h2 className="text-4xl font-extrabold tracking-widest text-white font-mono uppercase selection:bg-indigo-500/30">
                {successData.security_code}
              </h2>
              <p className="text-[10px] text-muted-foreground leading-normal">
                Provide this code to checkout the child. Write it down or copy it now.
              </p>
              
              <button
                type="button"
                onClick={copyToClipboard}
                className="inline-flex items-center gap-1 rounded-lg bg-indigo-500/15 border border-indigo-500/20 px-3 py-1.5 text-xs font-bold text-indigo-400 hover:bg-indigo-500/25 transition-all mx-auto"
              >
                {copied ? <Check className="h-3.5 w-3.5" /> : <Clipboard className="h-3.5 w-3.5" />}
                {copied ? "Copied" : "Copy Code"}
              </button>
            </div>

            <div className="text-xs text-muted-foreground leading-relaxed max-w-xs mx-auto">
              Checked into <span className="font-semibold text-white">{successData.classroom_details?.name}</span> by <span className="font-semibold text-white">{successData.checked_in_by_details?.first_name} {successData.checked_in_by_details?.last_name}</span>.
            </div>

            <button
              type="button"
              onClick={onClose}
              className="w-full rounded-xl bg-indigo-600 px-4 py-2.5 text-xs font-bold text-white transition-all hover:bg-indigo-500 shadow-[0_0_12px_rgba(99,102,241,0.3)]"
            >
              Done & Close
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
