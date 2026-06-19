"use client";

import { useState } from "react";
import { useGroupPrayerRequests, useConnectGroups } from "@/features/groups";
import { useAuth } from "@/hooks/use-auth";
import { useAppPermissions } from "@/hooks/use-app-permissions";
import { Heart, Plus, Save, User, CheckCircle, Trash2, Globe, ShieldAlert, ArrowLeft } from "lucide-react";
import Link from "next/link";

export default function GroupPrayersPage() {
  const { user } = useAuth();
  const { groups } = useConnectGroups();
  const { prayers, addPrayerRequest, updatePrayerStatus, deletePrayerRequest } = useGroupPrayerRequests();

  const permissions = useAppPermissions();

  const [showForm, setShowForm] = useState(false);
  const [groupId, setGroupId] = useState("");
  const [requestText, setRequestText] = useState("");
  const [isAnonymous, setIsAnonymous] = useState(false);
  const [shareWithBranch, setShareWithBranch] = useState(false);
  const [error, setError] = useState("");

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!groupId || !requestText) {
      setError("Please select your connect group and type your prayer request.");
      return;
    }

    try {
      const group = groups.find((g) => g.id === groupId);
      const groupName = group ? group.name : "Connect Group";

      addPrayerRequest({
        group_id: groupId,
        submitted_by_name: isAnonymous ? "Anonymous" : user ? `${user.first_name} ${user.last_name}` : "Member",
        request_text: requestText,
        is_anonymous: isAnonymous,
        status: "Active",
        shared_with_branch: shareWithBranch
      });

      // Reset Form
      setGroupId("");
      setRequestText("");
      setIsAnonymous(false);
      setShareWithBranch(false);
      setShowForm(false);
      setError("");
    } catch (err: any) {
      setError(err.message || "Failed to submit prayer request.");
    }
  };

  const getGroupName = (gId: string) => {
    const group = groups.find((g) => g.id === gId);
    return group ? group.name : "Cell Group";
  };

  return (
    <div className="p-6 max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between border-b border-border/30 pb-4">
        <div>
          <Link
            href="/dashboard/groups"
            className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-400 hover:text-emerald-300 transition-colors mb-2"
          >
            <ArrowLeft className="h-3 w-3" />
            <span>Connect Groups</span>
          </Link>
          <h1 className="text-2xl font-bold tracking-tight text-primary-foreground font-display flex items-center gap-2">
            <Heart className="h-6 w-6 text-rose-400" />
            Connect Group Prayers
          </h1>
          <p className="text-xs text-muted-foreground mt-0.5">
            Share and answer prayer requests within your small-group cells.
          </p>
        </div>

        {!showForm && (
          <button
            onClick={() => setShowForm(true)}
            className="inline-flex items-center gap-1.5 rounded-lg bg-rose-500 hover:bg-rose-600 px-3.5 py-1.5 text-xs font-semibold text-white transition-colors"
          >
            <Plus className="h-3.5 w-3.5" />
            <span>Share Prayer Request</span>
          </button>
        )}
      </div>

      {/* Form */}
      {showForm && (
        <form onSubmit={handleCreate} className="bg-card/30 border border-border/40 rounded-2xl p-6 space-y-4 shadow-glass">
          <h3 className="text-sm font-bold text-primary-foreground font-display">Submit Prayer Request</h3>
          
          {error && (
            <div className="rounded-lg bg-rose-500/10 border border-rose-500/25 p-3 text-xs text-rose-400">
              {error}
            </div>
          )}

          <div className="space-y-4">
            {/* Select Group */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-300">Your Connect Group *</label>
              <select
                required
                value={groupId}
                onChange={(e) => setGroupId(e.target.value)}
                className="w-full pl-3 pr-4 py-2.5 text-xs rounded-lg border border-border/40 bg-slate-900 text-primary-foreground focus:outline-none focus:border-rose-500/50"
              >
                <option value="">-- Select Group --</option>
                {groups.map((g) => (
                  <option key={g.id} value={g.id}>
                    {g.name}
                  </option>
                ))}
              </select>
            </div>

            {/* Request Content */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-300">Prayer Need *</label>
              <textarea
                rows={4}
                required
                placeholder="What would you like the connect group to stand in agreement with you for?"
                value={requestText}
                onChange={(e) => setRequestText(e.target.value)}
                className="w-full pl-3 pr-4 py-2 text-xs rounded-lg border border-border/40 bg-card/40 text-primary-foreground placeholder:text-muted-foreground focus:outline-none focus:border-rose-500/50"
              />
            </div>

            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pt-2">
              {/* Toggles */}
              <div className="flex flex-wrap items-center gap-5">
                <label className="inline-flex items-center gap-2 cursor-pointer text-xs text-slate-300">
                  <input
                    type="checkbox"
                    checked={isAnonymous}
                    onChange={(e) => setIsAnonymous(e.target.checked)}
                    className="rounded border-border/40 bg-card/40 text-rose-500 focus:ring-rose-500 h-4 w-4"
                  />
                  <span>Submit Anonymously</span>
                </label>

                <label className="inline-flex items-center gap-2 cursor-pointer text-xs text-slate-300">
                  <input
                    type="checkbox"
                    checked={shareWithBranch}
                    onChange={(e) => setShareWithBranch(e.target.checked)}
                    className="rounded border-border/40 bg-card/40 text-rose-500 focus:ring-rose-500 h-4 w-4"
                  />
                  <span className="flex items-center gap-1">
                    <Globe className="h-3.5 w-3.5 text-slate-400" />
                    Share with Branch (Module 14 Alert)
                  </span>
                </label>
              </div>

              {/* Submit Buttons */}
              <div className="flex items-center gap-3 self-end sm:self-auto">
                <button
                  type="button"
                  onClick={() => setShowForm(false)}
                  className="rounded-lg border border-border/50 bg-card/60 px-3.5 py-1.5 text-xs text-slate-300 hover:text-white"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="inline-flex items-center gap-1.5 rounded-lg bg-rose-500 hover:bg-rose-600 px-3.5 py-1.5 text-xs font-semibold text-white"
                >
                  <Save className="h-3.5 w-3.5" />
                  <span>Submit Prayer</span>
                </button>
              </div>
            </div>
          </div>
        </form>
      )}

      {/* Prayers List */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {prayers.length > 0 ? (
          prayers.map((prayer) => {
            const group = groups.find((g) => g.id === prayer.group_id);
            const isGroupLeader = group && String(user?.id) === String(group.leader_id);
            const canManage = permissions.groups.canManage || isGroupLeader;

            return (
              <div
                key={prayer.id}
                className={`rounded-2xl border bg-card/40 p-5 shadow-glass space-y-4 flex flex-col justify-between ${
                  prayer.status === "Answered" ? "border-emerald-500/30 bg-emerald-500/5" : "border-border/40"
                }`}
              >
                <div className="space-y-3">
                  <div className="flex items-start justify-between">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="text-[10px] text-muted-foreground font-semibold flex items-center gap-1">
                          <User className="h-3 w-3" />
                          {prayer.submitted_by_name}
                        </span>
                        <span className="text-slate-600 text-[10px]">•</span>
                        <span className="text-[10px] text-slate-400 font-bold uppercase">
                          {getGroupName(prayer.group_id)}
                        </span>
                      </div>
                      <span className="text-[9px] text-slate-500 block">
                        Submitted {new Date(prayer.created_at).toLocaleDateString()}
                      </span>
                    </div>

                    <span
                      className={`rounded px-2 py-0.5 text-[9px] font-bold uppercase ${
                        prayer.status === "Answered"
                          ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20"
                          : "bg-slate-500/10 text-slate-400 border border-border/20"
                      }`}
                    >
                      {prayer.status}
                    </span>
                  </div>

                  <p className="text-xs leading-relaxed text-slate-300 whitespace-pre-line">
                    {prayer.request_text}
                  </p>
                </div>

                <div className="pt-3 border-t border-border/20 mt-4 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    {prayer.shared_with_branch && (
                      <span className="flex items-center gap-1 text-[9px] font-bold text-indigo-400 bg-indigo-500/10 border border-indigo-500/20 px-1.5 py-0.5 rounded">
                        <Globe className="h-2.5 w-2.5" />
                        Branch Shared
                      </span>
                    )}
                  </div>

                  {canManage && (
                    <div className="flex items-center gap-2">
                      {prayer.status === "Active" && (
                        <button
                          onClick={() => updatePrayerStatus(prayer.id, "Answered")}
                          className="inline-flex h-7 items-center gap-1 rounded bg-emerald-500/10 border border-emerald-500/25 px-2.5 text-[9px] font-bold text-emerald-400 hover:bg-emerald-500 hover:text-white transition-all"
                        >
                          <CheckCircle className="h-3 w-3" />
                          <span>Answered</span>
                        </button>
                      )}
                      <button
                        onClick={() => deletePrayerRequest(prayer.id)}
                        className="p-1 rounded bg-slate-800 text-slate-400 hover:text-rose-400 border border-border/30 transition-all"
                        aria-label="Delete request"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  )}
                </div>
              </div>
            );
          })
        ) : (
          <div className="col-span-full flex flex-col items-center justify-center py-20 text-center select-none border border-dashed border-border/40 rounded-2xl bg-card/10">
            <Heart className="h-10 w-10 text-muted-foreground mb-3 opacity-40" />
            <h3 className="text-sm font-bold text-primary-foreground font-display">No Prayer Requests</h3>
            <p className="text-xs text-muted-foreground mt-1 max-w-xs leading-normal">
              No prayer requests have been submitted by members of small groups yet.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
