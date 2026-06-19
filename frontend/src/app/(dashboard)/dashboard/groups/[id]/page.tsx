"use client";

import { use } from "react";
import { useConnectGroups, useGroupMembers, useGroupPrayerRequests } from "@/features/groups";
import { useAuth } from "@/hooks/use-auth";
import { useAppPermissions } from "@/hooks/use-app-permissions";
import { MOCK_MEMBERS } from "@/features/members/data/mock-members";
import {
  Users,
  MapPin,
  Calendar,
  BookOpen,
  Heart,
  TrendingUp,
  ArrowRight,
  UserCheck,
  ShieldCheck,
  ArrowLeft
} from "lucide-react";
import Link from "next/link";
import { notFound } from "next/navigation";

interface PageProps {
  params: Promise<{ id: string }>;
}

export default function GroupDetailPage({ params }: PageProps) {
  const { id } = use(params);
  const { groups } = useConnectGroups();
  const { user } = useAuth();
  const permissions = useAppPermissions();

  const group = groups.find((g) => g.id === id);
  const groupMembers = useGroupMembers(id).members;
  const groupPrayers = useGroupPrayerRequests(id).prayers;

  if (!group) {
    notFound();
  }

  const isLeader = String(group.leader_id) === String(user?.id);
  const hasManagement = permissions.groups.canManage || isLeader;

  const getLeaderProfile = (leaderId: string) => {
    const member = MOCK_MEMBERS.find((m) => m.id === leaderId);
    return member
      ? { name: `${member.first_name} ${member.last_name}`, phone: member.phone_number, email: member.email }
      : { name: "Unassigned Leader", phone: "N/A", email: "N/A" };
  };

  const primaryLeader = getLeaderProfile(group.leader_id);

  return (
    <div className="p-6 max-w-5xl mx-auto space-y-6">
      {/* Breadcrumbs */}
      <div>
        <Link
          href="/dashboard/groups"
          className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-400 hover:text-emerald-300 transition-colors mb-2"
        >
          <ArrowLeft className="h-3 w-3" />
          <span>Connect Directory</span>
        </Link>
      </div>

      {/* Main Info Card */}
      <div className="relative rounded-2xl border border-border/40 bg-card/40 p-6 backdrop-blur-glass shadow-glass flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="space-y-3">
          <div className="flex items-center gap-3">
            <span className="rounded-full bg-emerald-500/10 px-2.5 py-0.5 text-[10px] font-bold text-emerald-400 border border-emerald-500/20">
              {group.category}
            </span>
            <span className="text-[10px] text-slate-500 font-bold uppercase tracking-wider">{group.frequency}</span>
          </div>

          <h1 className="text-xl font-bold tracking-tight text-primary-foreground font-display">{group.name}</h1>
          <p className="text-xs text-slate-400 leading-relaxed max-w-xl">{group.description}</p>

          <div className="flex flex-col sm:flex-row gap-4 pt-2 text-[11px] text-slate-400">
            <span className="flex items-center gap-1.5">
              <MapPin className="h-3.5 w-3.5 text-emerald-400 shrink-0" />
              {group.location_name}
            </span>
            <span className="flex items-center gap-1.5">
              <Users className="h-3.5 w-3.5 text-emerald-400 shrink-0" />
              {groupMembers.length} Members registered
            </span>
          </div>
        </div>

        {/* Quick action buttons */}
        <div className="flex flex-col gap-2 shrink-0 w-full md:w-auto">
          {hasManagement && (
            <Link
              href={`/dashboard/groups/${group.id}/attendance`}
              className="inline-flex h-9 items-center justify-center gap-1.5 rounded-lg bg-emerald-500 hover:bg-emerald-600 px-4 text-xs font-semibold text-white transition-colors"
            >
              <UserCheck className="h-4 w-4" />
              <span>Submit Attendance</span>
            </Link>
          )}
          <Link
            href={`/dashboard/groups/${group.id}/members`}
            className="inline-flex h-9 items-center justify-center gap-1.5 rounded-lg border border-border/50 bg-card/60 px-4 text-xs font-semibold text-slate-300 hover:text-primary-foreground hover:bg-slate-900 transition-colors"
          >
            <Users className="h-4 w-4 text-indigo-400" />
            <span>Manage Roster</span>
          </Link>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Left Side: Leader Profile & Meeting Info */}
        <div className="space-y-6">
          {/* Leader Profile Card */}
          <div className="rounded-2xl border border-border/40 bg-card/40 p-5 shadow-glass space-y-4">
            <h3 className="text-xs font-bold text-primary-foreground uppercase tracking-wide text-emerald-400 flex items-center gap-1.5">
              <ShieldCheck className="h-4 w-4" />
              Cell Leadership
            </h3>
            
            <div className="space-y-3 pt-2">
              <div className="space-y-1">
                <span className="text-[10px] text-slate-500 font-semibold block">Primary Leader</span>
                <span className="text-xs font-bold text-primary-foreground">{primaryLeader.name}</span>
                <span className="text-[10px] text-slate-400 block">{primaryLeader.email}</span>
                <span className="text-[10px] text-slate-400 block">{primaryLeader.phone}</span>
              </div>

              {group.assistant_leader_id && (
                <div className="space-y-1 pt-2 border-t border-border/20">
                  <span className="text-[10px] text-slate-500 font-semibold block">Assistant Leader</span>
                  <span className="text-xs font-bold text-primary-foreground">
                    {getLeaderProfile(group.assistant_leader_id).name}
                  </span>
                </div>
              )}
            </div>
          </div>

          {/* Meeting directions Card */}
          <div className="rounded-2xl border border-border/40 bg-card/40 p-5 shadow-glass space-y-3 text-xs text-slate-300">
            <h3 className="text-xs font-bold text-primary-foreground uppercase tracking-wide text-emerald-400 flex items-center gap-1.5">
              <MapPin className="h-4 w-4" />
              Meeting Location
            </h3>
            <p className="leading-relaxed pt-1">{group.location_address}</p>
          </div>
        </div>

        {/* Right Side: Group specific Prayer requests Feed */}
        <div className="md:col-span-2 space-y-6">
          {/* Prayer Request Block */}
          <div className="rounded-2xl border border-border/40 bg-card/40 p-5 shadow-glass space-y-4">
            <div className="flex items-center justify-between border-b border-border/20 pb-3">
              <h3 className="text-xs font-bold text-primary-foreground uppercase tracking-wide text-rose-400 flex items-center gap-1.5">
                <Heart className="h-4 w-4" />
                Active Group Prayers
              </h3>
              <Link href="/dashboard/groups/prayer-requests" className="text-[10px] font-bold text-emerald-400 hover:underline">
                View All
              </Link>
            </div>

            <div className="space-y-3 max-h-[350px] overflow-y-auto pr-1">
              {groupPrayers.length > 0 ? (
                groupPrayers.map((prayer) => (
                  <div key={prayer.id} className="rounded-xl border border-border/30 bg-slate-900/40 p-4 space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] font-bold text-slate-400">{prayer.submitted_by_name}</span>
                      <span className="rounded bg-slate-800 border border-border/40 px-1.5 py-0.5 text-[8px] uppercase font-bold text-slate-400">
                        {prayer.status}
                      </span>
                    </div>
                    <p className="text-xs text-slate-300 leading-normal line-clamp-3">{prayer.request_text}</p>
                  </div>
                ))
              ) : (
                <p className="text-xs text-muted-foreground text-center py-6">No prayer requests shared in this cell yet.</p>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
