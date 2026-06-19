"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useConnectGroups } from "@/features/groups";
import { useAppPermissions } from "@/hooks/use-app-permissions";
import { MOCK_MEMBERS } from "@/features/members/data/mock-members";
import { MOCK_BRANCHES } from "@/features/settings/data/mock-settings-data";
import { Users, Save, X, ShieldAlert } from "lucide-react";
import Link from "next/link";

export default function RegisterGroupPage() {
  const router = useRouter();
  const { addGroup } = useConnectGroups();
  const permissions = useAppPermissions();

  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState<"Home Fellowship" | "Connect Group" | "Bible Study" | "Ministry Cell">("Home Fellowship");
  const [branchId, setBranchId] = useState("");
  const [leaderId, setLeaderId] = useState("");
  const [assistantLeaderId, setAssistantLeaderId] = useState("");
  const [locationName, setLocationName] = useState("");
  const [locationAddress, setLocationAddress] = useState("");
  const [frequency, setFrequency] = useState<"Weekly" | "Bi-Weekly" | "Monthly">("Weekly");
  const [maxMembers, setMaxMembers] = useState(15);
  const [error, setError] = useState("");

  const canCreate = permissions.groups.canCreate;

  if (!canCreate) {
    return (
      <div className="p-6 max-w-xl mx-auto mt-20 text-center space-y-4 border border-rose-500/20 bg-rose-500/5 rounded-2xl">
        <ShieldAlert className="h-10 w-10 text-rose-400 mx-auto" />
        <h3 className="text-sm font-bold text-primary-foreground font-display">Access Denied</h3>
        <p className="text-xs text-muted-foreground leading-relaxed">
          You do not have the required permissions (`groups:create`) to register new Connect Groups.
          Please contact your church administrator.
        </p>
        <div className="pt-2">
          <Link
            href="/dashboard/groups"
            className="inline-flex h-8 items-center gap-1 rounded-lg bg-slate-800 border border-border/40 px-3 text-[11px] font-semibold text-slate-300 hover:text-white"
          >
            Back to Directory
          </Link>
        </div>
      </div>
    );
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !branchId || !leaderId || !locationName || !locationAddress) {
      setError("Please fill in all mandatory fields.");
      return;
    }

    try {
      addGroup({
        name,
        description,
        category,
        branch_id: branchId,
        leader_id: leaderId,
        assistant_leader_id: assistantLeaderId || undefined,
        location_name: locationName,
        location_address: locationAddress,
        frequency,
        status: "Active",
        max_members: maxMembers
      });

      router.push("/dashboard/groups");
    } catch (err: any) {
      setError(err.message || "Failed to register group.");
    }
  };

  return (
    <div className="p-6 max-w-2xl mx-auto space-y-6">
      <div className="flex items-center justify-between border-b border-border/30 pb-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-primary-foreground font-display flex items-center gap-2">
            <Users className="h-6 w-6 text-emerald-400" />
            Register Connect Group
          </h1>
          <p className="text-xs text-muted-foreground mt-0.5">
            Add a new home fellowship or ministry cell to the church database registry.
          </p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6 bg-card/20 border border-border/40 rounded-2xl p-6 backdrop-blur-glass shadow-glass">
        {error && (
          <div className="rounded-lg bg-rose-500/10 border border-rose-500/25 p-3 text-xs font-semibold text-rose-400">
            {error}
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {/* Group Name */}
          <div className="space-y-2 col-span-2">
            <label className="text-xs font-bold text-slate-300">Connect Group Name *</label>
            <input
              type="text"
              required
              placeholder="e.g. Kinondoni Family Connect"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full pl-3 pr-4 py-2 text-xs rounded-lg border border-border/40 bg-card/40 text-primary-foreground placeholder:text-muted-foreground focus:outline-none focus:border-emerald-500/50"
            />
          </div>

          {/* Description */}
          <div className="space-y-2 col-span-2">
            <label className="text-xs font-bold text-slate-300">Description / Objective</label>
            <textarea
              rows={3}
              placeholder="Provide a brief summary of the group's target focus or meeting agenda..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full pl-3 pr-4 py-2 text-xs rounded-lg border border-border/40 bg-card/40 text-primary-foreground placeholder:text-muted-foreground focus:outline-none focus:border-emerald-500/50"
            />
          </div>

          {/* Category */}
          <div className="space-y-2">
            <label className="text-xs font-bold text-slate-300">Category *</label>
            <select
              value={category}
              onChange={(e: any) => setCategory(e.target.value)}
              className="w-full pl-3 pr-4 py-2.5 text-xs rounded-lg border border-border/40 bg-slate-900 text-primary-foreground focus:outline-none focus:border-emerald-500/50"
            >
              <option value="Home Fellowship">Home Fellowship</option>
              <option value="Connect Group">Connect Group</option>
              <option value="Bible Study">Bible Study</option>
              <option value="Ministry Cell">Ministry Cell</option>
            </select>
          </div>

          {/* Branch */}
          <div className="space-y-2">
            <label className="text-xs font-bold text-slate-300">Assigned Branch Campus *</label>
            <select
              required
              value={branchId}
              onChange={(e) => setBranchId(e.target.value)}
              className="w-full pl-3 pr-4 py-2.5 text-xs rounded-lg border border-border/40 bg-slate-900 text-primary-foreground focus:outline-none focus:border-emerald-500/50"
            >
              <option value="">-- Select Campus --</option>
              {MOCK_BRANCHES.map((b) => (
                <option key={b.id} value={b.id}>
                  {b.branch_name}
                </option>
              ))}
            </select>
          </div>

          {/* Leader */}
          <div className="space-y-2">
            <label className="text-xs font-bold text-slate-300">Cell Leader *</label>
            <select
              required
              value={leaderId}
              onChange={(e) => setLeaderId(e.target.value)}
              className="w-full pl-3 pr-4 py-2.5 text-xs rounded-lg border border-border/40 bg-slate-900 text-primary-foreground focus:outline-none focus:border-emerald-500/50"
            >
              <option value="">-- Select Leader --</option>
              {MOCK_MEMBERS.map((m) => (
                <option key={m.id} value={m.id}>
                  {m.first_name} {m.last_name} ({m.role})
                </option>
              ))}
            </select>
          </div>

          {/* Assistant Leader */}
          <div className="space-y-2">
            <label className="text-xs font-bold text-slate-300">Assistant Leader</label>
            <select
              value={assistantLeaderId}
              onChange={(e) => setAssistantLeaderId(e.target.value)}
              className="w-full pl-3 pr-4 py-2.5 text-xs rounded-lg border border-border/40 bg-slate-900 text-primary-foreground focus:outline-none focus:border-emerald-500/50"
            >
              <option value="">-- Optional Assistant --</option>
              {MOCK_MEMBERS.map((m) => (
                <option key={m.id} value={m.id}>
                  {m.first_name} {m.last_name}
                </option>
              ))}
            </select>
          </div>

          {/* Location Name */}
          <div className="space-y-2 col-span-2">
            <label className="text-xs font-bold text-slate-300">Location Area Name *</label>
            <input
              type="text"
              required
              placeholder="e.g. Mbezi Beach Block A, near Salama Tower"
              value={locationName}
              onChange={(e) => setLocationName(e.target.value)}
              className="w-full pl-3 pr-4 py-2 text-xs rounded-lg border border-border/40 bg-card/40 text-primary-foreground placeholder:text-muted-foreground focus:outline-none focus:border-emerald-500/50"
            />
          </div>

          {/* Location Address */}
          <div className="space-y-2 col-span-2">
            <label className="text-xs font-bold text-slate-300">Detailed Physical Address *</label>
            <textarea
              rows={2}
              required
              placeholder="Provide exact directions for visitors to find the cell group meeting place..."
              value={locationAddress}
              onChange={(e) => setLocationAddress(e.target.value)}
              className="w-full pl-3 pr-4 py-2 text-xs rounded-lg border border-border/40 bg-card/40 text-primary-foreground placeholder:text-muted-foreground focus:outline-none focus:border-emerald-500/50"
            />
          </div>

          {/* Frequency */}
          <div className="space-y-2">
            <label className="text-xs font-bold text-slate-300">Meeting Frequency *</label>
            <select
              value={frequency}
              onChange={(e: any) => setFrequency(e.target.value)}
              className="w-full pl-3 pr-4 py-2.5 text-xs rounded-lg border border-border/40 bg-slate-900 text-primary-foreground focus:outline-none focus:border-emerald-500/50"
            >
              <option value="Weekly">Weekly</option>
              <option value="Bi-Weekly">Bi-Weekly</option>
              <option value="Monthly">Monthly</option>
            </select>
          </div>

          {/* Max Members */}
          <div className="space-y-2">
            <label className="text-xs font-bold text-slate-300">Capacity Limit (Members)</label>
            <input
              type="number"
              min={5}
              max={100}
              value={maxMembers}
              onChange={(e) => setMaxMembers(Number(e.target.value))}
              className="w-full pl-3 pr-4 py-2 text-xs rounded-lg border border-border/40 bg-card/40 text-primary-foreground focus:outline-none focus:border-emerald-500/50"
            />
          </div>
        </div>

        <div className="flex items-center justify-end gap-3 pt-4 border-t border-border/20">
          <Link
            href="/dashboard/groups"
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
            <span>Save Registry</span>
          </button>
        </div>
      </form>
    </div>
  );
}
