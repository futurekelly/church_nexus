"use client";

import { use, useState } from "react";
import { useRouter } from "next/navigation";
import { useGroupAttendance, useGroupMembers, useConnectGroups } from "@/features/groups";
import { useAuth } from "@/hooks/use-auth";
import { useAppPermissions } from "@/hooks/use-app-permissions";
import { MOCK_BRANCHES } from "@/features/settings/data/mock-settings-data";
import { Save, Calendar, X, AlertTriangle, ArrowLeft, ShieldAlert } from "lucide-react";
import Link from "next/link";

interface PageProps {
  params: Promise<{ id: string }>;
}

export default function GroupAttendancePage({ params }: PageProps) {
  const { id } = use(params);
  const router = useRouter();
  const { groups } = useConnectGroups();
  const { user } = useAuth();
  const permissions = useAppPermissions();

  const group = groups.find((g) => g.id === id);
  const { members } = useGroupMembers(id);
  const { submitAttendance, attendanceLogs } = useGroupAttendance(id);

  const [meetingDate, setMeetingDate] = useState(new Date().toISOString().split("T")[0]);
  const [studyTopic, setStudyTopic] = useState("");
  const [visitorCount, setVisitorCount] = useState(0);
  const [offering, setOffering] = useState("");
  const [attendanceStates, setAttendanceStates] = useState<Record<string, boolean>>({});
  const [error, setError] = useState("");

  if (!group) {
    return <div className="p-6 text-center text-xs text-rose-400">Connect Group not found.</div>;
  }

  const isLeader = String(group.leader_id) === String(user?.id);
  const hasManagement = permissions.groups.canLogAttendance || isLeader;

  if (!hasManagement) {
    return (
      <div className="p-6 max-w-xl mx-auto mt-20 text-center space-y-4 border border-rose-500/20 bg-rose-500/5 rounded-2xl">
        <ShieldAlert className="h-10 w-10 text-rose-400 mx-auto" />
        <h3 className="text-sm font-bold text-primary-foreground font-display">Access Denied</h3>
        <p className="text-xs text-muted-foreground leading-relaxed">
          You are not authorized to submit attendance records for this connect group. Attendance logs are restricted to the designated Cell Leader and church administrators.
        </p>
        <div className="pt-2">
          <Link
            href={`/dashboard/groups/${id}`}
            className="inline-flex h-8 items-center gap-1 rounded-lg bg-slate-800 border border-border/40 px-3 text-[11px] font-semibold text-slate-300 hover:text-white"
          >
            Back to Group
          </Link>
        </div>
      </div>
    );
  }

  // Find local currency from branch settings
  const getBranchCurrency = (bId: string) => {
    const branch = MOCK_BRANCHES.find((b) => b.id === bId);
    return branch ? branch.currency_code : "TZS";
  };

  const currencySymbol = getBranchCurrency(group.branch_id);

  const handleCheckboxChange = (memberId: string, checked: boolean) => {
    setAttendanceStates((prev) => ({ ...prev, [memberId]: checked }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!meetingDate) {
      setError("Meeting date is required.");
      return;
    }

    try {
      // Build attendees list
      const attendees = members.map((m) => ({
        member_id: m.id,
        attended: attendanceStates[m.id] || false,
        status: (attendanceStates[m.id] ? "Present" : "Absent") as "Present" | "Absent" | "Excused"
      }));

      submitAttendance({
        group_id: id,
        meeting_date: meetingDate,
        submitted_by: user ? String(user.id) : "Leader",
        attendees,
        visitor_count: visitorCount,
        study_topic: studyTopic || undefined,
        offering_amount: offering ? Number(offering) : undefined,
        currency: currencySymbol
      });

      setError("");
      router.push(`/dashboard/groups/${id}`);
    } catch (err: any) {
      setError(err.message || "Failed to submit attendance sheet.");
    }
  };

  return (
    <div className="p-6 max-w-3xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between border-b border-border/30 pb-4">
        <div>
          <Link
            href={`/dashboard/groups/${id}`}
            className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-400 hover:text-emerald-300 transition-colors mb-2"
          >
            <ArrowLeft className="h-3 w-3" />
            <span>Group Details</span>
          </Link>
          <h1 className="text-2xl font-bold tracking-tight text-primary-foreground font-display flex items-center gap-2">
            <Calendar className="h-6 w-6 text-emerald-400" />
            Attendance: {group.name}
          </h1>
          <p className="text-xs text-muted-foreground mt-0.5">
            Record meeting details, study outlines discussed, visitor logs, and local collections.
          </p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6 bg-card/30 border border-border/40 rounded-2xl p-6 shadow-glass">
        {error && (
          <div className="rounded-lg bg-rose-500/10 border border-rose-500/25 p-3 text-xs text-rose-400 flex items-start gap-2">
            <AlertTriangle className="h-4 w-4 shrink-0 mt-0.5 text-rose-400" />
            <span>{error}</span>
          </div>
        )}

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {/* Meeting Date */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-300">Meeting Date *</label>
            <input
              type="date"
              required
              value={meetingDate}
              onChange={(e) => setMeetingDate(e.target.value)}
              className="w-full pl-3 pr-4 py-2 text-xs rounded-lg border border-border/40 bg-card/40 text-primary-foreground focus:outline-none focus:border-emerald-500/50"
            />
          </div>

          {/* Study Topic */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-300">Study Topic / Outline</label>
            <input
              type="text"
              placeholder="e.g. Walking in Obedience"
              value={studyTopic}
              onChange={(e) => setStudyTopic(e.target.value)}
              className="w-full pl-3 pr-4 py-2 text-xs rounded-lg border border-border/40 bg-card/40 text-primary-foreground placeholder:text-muted-foreground focus:outline-none focus:border-emerald-500/50"
            />
          </div>

          {/* Visitor Count */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-300">New Visitor Count</label>
            <input
              type="number"
              min={0}
              value={visitorCount}
              onChange={(e) => setVisitorCount(Number(e.target.value))}
              className="w-full pl-3 pr-4 py-2 text-xs rounded-lg border border-border/40 bg-card/40 text-primary-foreground focus:outline-none focus:border-emerald-500/50"
            />
          </div>

          {/* Offering */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-300">Collections/Offering ({currencySymbol})</label>
            <input
              type="number"
              min={0}
              placeholder="0"
              value={offering}
              onChange={(e) => setOffering(e.target.value)}
              className="w-full pl-3 pr-4 py-2 text-xs rounded-lg border border-border/40 bg-card/40 text-primary-foreground placeholder:text-muted-foreground focus:outline-none focus:border-emerald-500/50"
            />
          </div>
        </div>

        {/* Member Checkbox List */}
        <div className="space-y-3 pt-4 border-t border-border/20">
          <h3 className="text-xs font-bold text-primary-foreground uppercase tracking-wider text-emerald-400">Roster Attendance Check</h3>
          <div className="divide-y divide-border/20 border border-border/30 rounded-xl overflow-hidden bg-card/25 max-h-[300px] overflow-y-auto pr-1">
            {members.length > 0 ? (
              members.map((member) => (
                <label
                  key={member.id}
                  className="flex items-center justify-between p-3.5 hover:bg-slate-900/10 cursor-pointer transition-colors"
                >
                  <div className="space-y-0.5">
                    <span className="text-xs font-bold text-slate-300">{member.name}</span>
                    <span className="text-[9px] text-slate-500 block">{member.role}</span>
                  </div>
                  <input
                    type="checkbox"
                    checked={attendanceStates[member.id] || false}
                    onChange={(e) => handleCheckboxChange(member.id, e.target.checked)}
                    className="rounded border-border/40 bg-card/40 text-emerald-500 focus:ring-emerald-500 h-4 w-4"
                  />
                </label>
              ))
            ) : (
              <p className="text-xs text-muted-foreground p-6 text-center">No active roster members found to log.</p>
            )}
          </div>
        </div>

        {/* Submit Actions */}
        <div className="flex items-center justify-end gap-3 pt-4 border-t border-border/20">
          <Link
            href={`/dashboard/groups/${id}`}
            className="inline-flex h-9 items-center gap-1.5 rounded-lg border border-border/50 bg-card/60 px-4 text-xs font-semibold text-slate-300 hover:text-white transition-colors"
          >
            <X className="h-4 w-4" />
            <span>Cancel</span>
          </Link>
          <button
            type="submit"
            className="inline-flex h-9 items-center gap-1.5 rounded-lg bg-emerald-500 hover:bg-emerald-600 px-4 text-xs font-semibold text-white transition-colors"
          >
            <Save className="h-4 w-4" />
            <span>Save Ledger</span>
          </button>
        </div>
      </form>
    </div>
  );
}
