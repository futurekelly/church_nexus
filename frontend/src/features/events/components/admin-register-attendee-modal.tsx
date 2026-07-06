"use client";

import { useState } from "react";
import { X, UserPlus, User, Mail, Phone, FileText, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { EventsRepository } from "../repositories/events.repository";

interface AdminRegisterAttendeeModalProps {
  isOpen: boolean;
  onClose: () => void;
  eventId: string;
  onSuccess?: () => void;
}

export function AdminRegisterAttendeeModal({
  isOpen,
  onClose,
  eventId,
  onSuccess,
}: AdminRegisterAttendeeModalProps) {
  const [visitorName, setVisitorName] = useState("");
  const [visitorEmail, setVisitorEmail] = useState("");
  const [visitorPhone, setVisitorPhone] = useState("");
  const [notes, setNotes] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!visitorName.trim()) {
      toast.error("Please provide an attendee name.");
      return;
    }

    setIsSubmitting(true);
    try {
      await EventsRepository.createRSVP({
        event_id: eventId,
        user_id: null,
        member_id: null,
        visitor_name: visitorName.trim(),
        visitor_email: visitorEmail.trim() || null,
        visitor_phone: visitorPhone.trim() || null,
        status: "Attending",
        notes: notes.trim() || null,
      });

      toast.success(`Successfully registered ${visitorName}!`);
      onSuccess?.();
      onClose();
      // Reset form
      setVisitorName("");
      setVisitorEmail("");
      setVisitorPhone("");
      setNotes("");
    } catch (err: any) {
      toast.error(err.message || "Failed to register attendee.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4 backdrop-blur-md animate-fadeIn">
      <div className="relative w-full max-w-md overflow-hidden rounded-2xl border border-indigo-500/30 bg-slate-950/95 p-6 shadow-2xl backdrop-blur-xl">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute right-4 top-4 rounded-lg p-1.5 text-muted-foreground hover:bg-white/10 hover:text-white transition-colors"
        >
          <X className="h-5 w-5" />
        </button>

        {/* Header */}
        <div className="flex items-center gap-3 border-b border-border/20 pb-4">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-indigo-500/20 text-indigo-400 border border-indigo-500/30">
            <UserPlus className="h-5 w-5" />
          </div>
          <div>
            <h3 className="text-base font-bold text-white">Manual Attendee Registration</h3>
            <p className="text-xs text-muted-foreground">Assist guests or unassisted members to register.</p>
          </div>
        </div>

        {/* Form Inputs */}
        <form onSubmit={handleSubmit} className="mt-5 space-y-4 text-xs">
          <div>
            <label className="block font-semibold text-slate-300 mb-1">
              Attendee Full Name <span className="text-rose-400">*</span>
            </label>
            <div className="relative">
              <input
                type="text"
                required
                placeholder="e.g. Samuel Omondi"
                value={visitorName}
                onChange={(e) => setVisitorName(e.target.value)}
                className="w-full rounded-xl border border-border/50 bg-card/60 py-2.5 pl-9 pr-3 text-white placeholder:text-muted-foreground/50 focus:outline-none focus:ring-1 focus:ring-indigo-500"
              />
              <User className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
            </div>
          </div>

          <div>
            <label className="block font-semibold text-slate-300 mb-1">
              Email Address <span className="text-muted-foreground font-normal">(Optional)</span>
            </label>
            <div className="relative">
              <input
                type="email"
                placeholder="e.g. samuel@example.com"
                value={visitorEmail}
                onChange={(e) => setVisitorEmail(e.target.value)}
                className="w-full rounded-xl border border-border/50 bg-card/60 py-2.5 pl-9 pr-3 text-white placeholder:text-muted-foreground/50 focus:outline-none focus:ring-1 focus:ring-indigo-500"
              />
              <Mail className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
            </div>
          </div>

          <div>
            <label className="block font-semibold text-slate-300 mb-1">
              Phone Number <span className="text-muted-foreground font-normal">(Optional)</span>
            </label>
            <div className="relative">
              <input
                type="tel"
                placeholder="e.g. +255 712 345 678"
                value={visitorPhone}
                onChange={(e) => setVisitorPhone(e.target.value)}
                className="w-full rounded-xl border border-border/50 bg-card/60 py-2.5 pl-9 pr-3 text-white placeholder:text-muted-foreground/50 focus:outline-none focus:ring-1 focus:ring-indigo-500"
              />
              <Phone className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
            </div>
          </div>

          <div>
            <label className="block font-semibold text-slate-300 mb-1">
              Admin Assistance Notes <span className="text-muted-foreground font-normal">(Optional)</span>
            </label>
            <div className="relative">
              <textarea
                rows={2}
                placeholder="Special seating, VIP guest, or registration notes..."
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                className="w-full rounded-xl border border-border/50 bg-card/60 py-2 pl-9 pr-3 text-white placeholder:text-muted-foreground/50 focus:outline-none focus:ring-1 focus:ring-indigo-500"
              />
              <FileText className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
            </div>
          </div>

          {/* Footer Actions */}
          <div className="mt-6 flex justify-end gap-2 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="rounded-xl border border-border/40 px-4 py-2 text-xs font-semibold text-muted-foreground hover:bg-white/5 hover:text-white transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="flex items-center gap-2 rounded-xl bg-indigo-600 px-5 py-2 text-xs font-bold text-white hover:bg-indigo-500 transition-colors disabled:opacity-50"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" /> Registering...
                </>
              ) : (
                "Complete Registration"
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
