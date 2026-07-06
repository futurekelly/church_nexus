"use client";

import { X, User, Mail, Calendar, CheckCircle2, QrCode, Shield, Phone, Tag } from "lucide-react";
import { cn } from "@/lib/utils";

export interface AttendeeDetail {
  id: string;
  name: string;
  email: string;
  role: string;
  registerDate: string;
  phone?: string;
  attendanceStatus?: "registered" | "checked_in" | "absent";
  registrationToken?: string;
}

interface AttendeeDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  attendee: AttendeeDetail | null;
}

export function AttendeeDetailModal({
  isOpen,
  onClose,
  attendee,
}: AttendeeDetailModalProps) {
  if (!isOpen || !attendee) return null;

  const attendanceBadge = {
    checked_in: { label: "Checked In", color: "bg-emerald-500/20 text-emerald-300 border-emerald-500/30" },
    registered: { label: "Registered", color: "bg-indigo-500/20 text-indigo-300 border-indigo-500/30" },
    absent: { label: "Absent", color: "bg-rose-500/20 text-rose-300 border-rose-500/30" },
  }[attendee.attendanceStatus || "registered"];

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

        {/* Modal Header */}
        <div className="flex items-center gap-4 border-b border-border/20 pb-4">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-indigo-500 to-purple-600 font-bold text-white shadow-lg text-lg">
            {attendee.name.split(" ").map(n => n[0]).join("").toUpperCase().slice(0, 2)}
          </div>
          <div>
            <h3 className="text-base font-bold text-white">{attendee.name}</h3>
            <div className="flex items-center gap-2 mt-1">
              <span className={cn("inline-flex items-center gap-1 rounded-full border px-2.5 py-0.5 text-[10px] font-semibold", attendanceBadge.color)}>
                <CheckCircle2 className="h-3 w-3" /> {attendanceBadge.label}
              </span>
              <span className="text-xs text-muted-foreground">{attendee.role}</span>
            </div>
          </div>
        </div>

        {/* Detailed Information Grid */}
        <div className="mt-5 space-y-3.5 text-xs">
          <div className="flex items-center justify-between rounded-xl border border-border/20 bg-card/40 p-3">
            <div className="flex items-center gap-2.5 text-muted-foreground">
              <Mail className="h-4 w-4 text-indigo-400" />
              <span>Email Address</span>
            </div>
            <span className="font-semibold text-white">{attendee.email}</span>
          </div>

          <div className="flex items-center justify-between rounded-xl border border-border/20 bg-card/40 p-3">
            <div className="flex items-center gap-2.5 text-muted-foreground">
              <Phone className="h-4 w-4 text-emerald-400" />
              <span>Phone Contact</span>
            </div>
            <span className="font-semibold text-white">{attendee.phone || "+255 700 000 000"}</span>
          </div>

          <div className="flex items-center justify-between rounded-xl border border-border/20 bg-card/40 p-3">
            <div className="flex items-center gap-2.5 text-muted-foreground">
              <Calendar className="h-4 w-4 text-amber-400" />
              <span>Registration Date</span>
            </div>
            <span className="font-semibold text-white font-mono">{attendee.registerDate}</span>
          </div>

          {/* QR Code & Token Section */}
          <div className="mt-4 rounded-xl border border-indigo-500/20 bg-indigo-500/5 p-4 text-center space-y-2">
            <div className="flex items-center justify-center gap-1.5 text-indigo-300 font-bold">
              <QrCode className="h-4 w-4" /> Entrance Verification Ticket
            </div>
            <div className="mx-auto flex h-24 w-24 items-center justify-center rounded-lg border border-white/20 bg-white p-2 shadow-inner">
              {/* SVG QR Placeholder */}
              <svg viewBox="0 0 100 100" className="h-full w-full fill-slate-950">
                <rect x="10" y="10" width="25" height="25" />
                <rect x="65" y="10" width="25" height="25" />
                <rect x="10" y="65" width="25" height="25" />
                <rect x="40" y="40" width="20" height="20" />
                <rect x="70" y="70" width="15" height="15" />
              </svg>
            </div>
            <p className="text-[10px] text-muted-foreground font-mono">
              Token ID: {attendee.registrationToken || `REG-${attendee.id.slice(0, 8).toUpperCase()}`}
            </p>
          </div>
        </div>

        {/* Footer */}
        <div className="mt-6 flex justify-end">
          <button
            onClick={onClose}
            className="rounded-xl bg-indigo-600 px-5 py-2 text-xs font-bold text-white hover:bg-indigo-500 transition-colors"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
}
