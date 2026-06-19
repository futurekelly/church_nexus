"use client";

import { use, useState } from "react";
import { useGroupMembers, useConnectGroups } from "@/features/groups";
import { useAuth } from "@/hooks/use-auth";
import { useAppPermissions } from "@/hooks/use-app-permissions";
import { MOCK_MEMBERS } from "@/features/members/data/mock-members";
import { Users, Plus, Trash2, ArrowRightLeft, UserCheck, X, ShieldAlert, ArrowLeft, Save } from "lucide-react";
import Link from "next/link";

interface PageProps {
  params: Promise<{ id: string }>;
}

export default function RosterManagementPage({ params }: PageProps) {
  const { id } = use(params);
  const { groups } = useConnectGroups();
  const { user } = useAuth();
  const permissions = useAppPermissions();

  const group = groups.find((g) => g.id === id);
  const {
    members,
    addGroupMember,
    removeGroupMember,
    updateMemberRole,
    toggleMemberStatus,
    transferMember
  } = useGroupMembers(id);

  const [showAddForm, setShowAddForm] = useState(false);
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [role, setRole] = useState<"Leader" | "Assistant" | "Host" | "Member" | "Visitor">("Member");
  const [error, setError] = useState("");

  const [showTransferId, setShowTransferId] = useState<string | null>(null);
  const [transferGroupId, setTransferGroupId] = useState("");

  if (!group) {
    return <div className="p-6 text-center text-xs text-rose-400">Connect Group not found.</div>;
  }

  const isLeader = String(group.leader_id) === String(user?.id);
  const hasManagement = permissions.groups.canManage || isLeader;

  const handleAdd = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !phone) {
      setError("Name and phone number are required.");
      return;
    }

    try {
      addGroupMember({
        group_id: id,
        name,
        phone,
        email: email || undefined,
        role,
        status: "Active"
      });

      setName("");
      setPhone("");
      setEmail("");
      setRole("Member");
      setShowAddForm(false);
      setError("");
    } catch (err: any) {
      setError(err.message || "Failed to add member.");
    }
  };

  const handleTransfer = (memberId: string) => {
    if (!transferGroupId) return;
    transferMember(memberId, transferGroupId);
    setShowTransferId(null);
    setTransferGroupId("");
  };

  return (
    <div className="p-6 max-w-5xl mx-auto space-y-6">
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
            <Users className="h-6 w-6 text-emerald-400" />
            Roster: {group.name}
          </h1>
          <p className="text-xs text-muted-foreground mt-0.5">
            Manage Connect Group members, visitor registries, role allocations, and transfers.
          </p>
        </div>

        {hasManagement && !showAddForm && (
          <button
            onClick={() => setShowAddForm(true)}
            className="inline-flex items-center gap-1.5 rounded-lg bg-emerald-500 hover:bg-emerald-600 px-3.5 py-1.5 text-xs font-semibold text-white transition-colors"
          >
            <Plus className="h-3.5 w-3.5" />
            <span>Add Member</span>
          </button>
        )}
      </div>

      {/* Roster form */}
      {showAddForm && (
        <form onSubmit={handleAdd} className="bg-card/30 border border-border/40 rounded-2xl p-6 space-y-4 shadow-glass">
          <h3 className="text-sm font-bold text-primary-foreground font-display">Add Roster Member</h3>
          
          {error && (
            <div className="rounded-lg bg-rose-500/10 border border-rose-500/25 p-3 text-xs text-rose-400">
              {error}
            </div>
          )}

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-300">Full Name *</label>
              <input
                type="text"
                required
                placeholder="e.g. Timothy James"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full pl-3 pr-4 py-2 text-xs rounded-lg border border-border/40 bg-card/40 text-primary-foreground focus:outline-none focus:border-emerald-500/50"
              />
            </div>
            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-300">Phone Number *</label>
              <input
                type="text"
                required
                placeholder="e.g. +254 711 222 333"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className="w-full pl-3 pr-4 py-2 text-xs rounded-lg border border-border/40 bg-card/40 text-primary-foreground focus:outline-none focus:border-emerald-500/50"
              />
            </div>
            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-300">Email Address</label>
              <input
                type="email"
                placeholder="e.g. tim@email.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full pl-3 pr-4 py-2 text-xs rounded-lg border border-border/40 bg-card/40 text-primary-foreground focus:outline-none focus:border-emerald-500/50"
              />
            </div>
            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-300">Roster Role *</label>
              <select
                value={role}
                onChange={(e: any) => setRole(e.target.value)}
                className="w-full pl-3 pr-4 py-2.5 text-xs rounded-lg border border-border/40 bg-slate-900 text-primary-foreground focus:outline-none focus:border-emerald-500/50"
              >
                <option value="Member">Member</option>
                <option value="Visitor">Visitor</option>
                <option value="Host">Host</option>
                <option value="Assistant">Assistant</option>
                <option value="Leader">Leader</option>
              </select>
            </div>
          </div>

          <div className="flex items-center justify-end gap-3 pt-3 border-t border-border/20">
            <button
              type="button"
              onClick={() => setShowAddForm(false)}
              className="rounded-lg border border-border/50 bg-card/60 px-3.5 py-1.5 text-xs text-slate-300 hover:text-white"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="inline-flex items-center gap-1.5 rounded-lg bg-emerald-500 hover:bg-emerald-600 px-3.5 py-1.5 text-xs font-semibold text-white"
            >
              <Save className="h-3.5 w-3.5" />
              <span>Add to Roster</span>
            </button>
          </div>
        </form>
      )}

      {/* Roster List Table */}
      <div className="border border-border/40 rounded-2xl bg-card/45 backdrop-blur-glass overflow-hidden shadow-glass">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="border-b border-border/30 bg-slate-900/40 text-slate-400 text-[10px] uppercase font-bold tracking-wider">
              <th className="p-4">Name</th>
              <th className="p-4">Contact Info</th>
              <th className="p-4">Role</th>
              <th className="p-4">Status</th>
              {hasManagement && <th className="p-4 text-right">Actions</th>}
            </tr>
          </thead>
          <tbody className="divide-y divide-border/20 text-xs text-slate-300">
            {members.length > 0 ? (
              members.map((member) => (
                <tr key={member.id} className="hover:bg-slate-900/10">
                  <td className="p-4 font-semibold text-primary-foreground">{member.name}</td>
                  <td className="p-4 space-y-0.5">
                    <div>{member.phone}</div>
                    {member.email && <div className="text-[10px] text-slate-500">{member.email}</div>}
                  </td>
                  <td className="p-4">
                    {hasManagement ? (
                      <select
                        value={member.role}
                        onChange={(e: any) => updateMemberRole(member.id, e.target.value)}
                        className="rounded border border-border/40 bg-slate-900 text-slate-300 text-[11px] p-1"
                      >
                        <option value="Leader">Leader</option>
                        <option value="Assistant">Assistant</option>
                        <option value="Host">Host</option>
                        <option value="Member">Member</option>
                        <option value="Visitor">Visitor</option>
                      </select>
                    ) : (
                      <span className="rounded bg-slate-800 px-2 py-0.5 text-[10px] border border-border/30 text-slate-400">
                        {member.role}
                      </span>
                    )}
                  </td>
                  <td className="p-4">
                    <button
                      disabled={!hasManagement}
                      onClick={() => toggleMemberStatus(member.id)}
                      className={`rounded-full px-2 py-0.5 text-[9px] font-bold border transition-colors ${
                        member.status === "Active"
                          ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/20 hover:bg-emerald-500/20"
                          : "bg-slate-800 text-slate-500 border-border/40 hover:bg-slate-800/80"
                      }`}
                    >
                      {member.status}
                    </button>
                  </td>
                  {hasManagement && (
                    <td className="p-4 text-right space-x-2">
                      {/* Transfer button */}
                      {showTransferId === member.id ? (
                        <div className="inline-flex items-center gap-1.5">
                          <select
                            value={transferGroupId}
                            onChange={(e) => setTransferGroupId(e.target.value)}
                            className="rounded border border-border/40 bg-slate-900 text-slate-300 text-[11px] p-1"
                          >
                            <option value="">-- Transfer to --</option>
                            {groups
                              .filter((g) => g.id !== id)
                              .map((g) => (
                                <option key={g.id} value={g.id}>
                                  {g.name}
                                </option>
                              ))}
                          </select>
                          <button
                            onClick={() => handleTransfer(member.id)}
                            className="bg-emerald-500 text-white rounded p-1 text-[10px] font-bold hover:bg-emerald-600"
                          >
                            Go
                          </button>
                          <button
                            onClick={() => setShowTransferId(null)}
                            className="bg-slate-800 border border-border/50 text-slate-400 rounded p-1 text-[10px]"
                          >
                            X
                          </button>
                        </div>
                      ) : (
                        <button
                          onClick={() => setShowTransferId(member.id)}
                          className="inline-flex items-center gap-1 text-[10px] text-indigo-400 hover:text-indigo-300"
                        >
                          <ArrowRightLeft className="h-3 w-3" />
                          <span>Transfer</span>
                        </button>
                      )}

                      {/* Delete button */}
                      <button
                        onClick={() => removeGroupMember(member.id)}
                        className="p-1 text-slate-500 hover:text-rose-400 transition-colors"
                        aria-label="Remove member"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                    </td>
                  )}
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={5} className="p-8 text-center text-slate-500">
                  No registered roster members in this connect group.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
