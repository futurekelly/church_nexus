"use client";

import { useState, useEffect, useMemo } from "react";
import { 
  Users, 
  UserPlus, 
  Shield, 
  Search, 
  Check, 
  Lock, 
  Unlock, 
  ArrowLeft,
  Mail,
  UserCheck
} from "lucide-react";
import Link from "next/link";
import { useAuth } from "@/hooks/use-auth";
import { useAppPermissions } from "@/hooks/use-app-permissions";
import { apiGet } from "@/services/api-client";
import { motion } from "framer-motion";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

interface SystemUser {
  id: string;
  name: string;
  email: string;
  role: string;
  status: "Active" | "Suspended";
  branch: string;
}

export default function UsersManagementPage() {
  const { role: userRole, user: authUser } = useAuth();
  const { settings: permissions } = useAppPermissions();

  const [users, setUsers] = useState<SystemUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [showInviteModal, setShowInviteModal] = useState(false);
  
  // Invite Form States
  const [inviteEmail, setInviteEmail] = useState("");
  const [inviteRole, setInviteRole] = useState("pastor");
  const [inviteName, setInviteName] = useState("");

  // Guard: Only Admin/Super Admin can access
  const canManage = userRole === "super_admin" || userRole === "church_admin";

  useEffect(() => {
    async function loadUsers() {
      try {
        setLoading(true);
        // We fetch members with administrative types first to build the user list
        const response = await apiGet<any>("/api/members/?page_size=100");
        if (response.success && response.data?.results) {
          const members = response.data.results;
          
          // Map members with roles/types to SystemUsers
          const mapped: SystemUser[] = members
            .filter((m: any) => m.member_type !== "Regular" || m.status === "Staff")
            .map((m: any) => ({
              id: m.id,
              name: `${m.first_name} ${m.last_name}`,
              email: m.email,
              role: m.member_type === "Leader" ? "Pastor" : m.member_type === "Staff" ? "Media Team" : "Treasurer",
              status: "Active",
              branch: m.branch_name || "Main Branch",
            }));

          // Add default system seed users for complete coverage
          const defaults: SystemUser[] = [
            {
              id: "usr-1",
              name: "Sir. Kelvin Mbise",
              email: "futurekelly360@gmail.com",
              role: "Super Admin",
              status: "Active",
              branch: "All Branches",
            },
            {
              id: "usr-2",
              name: "Michael Adeyemi",
              email: "pastor.michael@churchnexus.org",
              role: "Pastor",
              status: "Active",
              branch: "Main Sanctuary",
            },
            {
              id: "usr-3",
              name: "Sarah Koech",
              email: "pastor.sarah@churchnexus.org",
              role: "Church Admin",
              status: "Active",
              branch: "Nairobi Branch",
            },
            {
              id: "usr-4",
              name: "John Kamau",
              email: "kamau.treasurer@churchnexus.org",
              role: "Treasurer",
              status: "Active",
              branch: "Nairobi Branch",
            }
          ];

          // Merge lists preventing duplicates
          const emailSet = new Set(defaults.map(d => d.email.toLowerCase()));
          const filteredMapped = mapped.filter(m => !emailSet.has(m.email.toLowerCase()));

          setUsers([...defaults, ...filteredMapped]);
        }
      } catch (err) {
        console.error("Failed to load user management list:", err);
      } finally {
        setLoading(false);
      }
    }
    loadUsers();
  }, []);

  const filteredUsers = useMemo(() => {
    return users.filter((u) => {
      const q = searchQuery.toLowerCase();
      return (
        u.name.toLowerCase().includes(q) ||
        u.email.toLowerCase().includes(q) ||
        u.role.toLowerCase().includes(q) ||
        u.branch.toLowerCase().includes(q)
      );
    });
  }, [users, searchQuery]);

  const toggleUserStatus = (id: string) => {
    setUsers((prev) =>
      prev.map((u) => {
        if (u.id === id) {
          const newStatus = u.status === "Active" ? "Suspended" : "Active";
          toast.success(`User ${u.name} has been ${newStatus.toLowerCase()} successfully!`);
          return { ...u, status: newStatus };
        }
        return u;
      })
    );
  };

  const changeUserRole = (id: string, newRole: string) => {
    setUsers((prev) =>
      prev.map((u) => {
        if (u.id === id) {
          toast.success(`Updated ${u.name}'s role to ${newRole}`);
          return { ...u, role: newRole };
        }
        return u;
      })
    );
  };

  const handleSendInvite = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inviteEmail || !inviteName) {
      toast.error("Please enter both Name and Email.");
      return;
    }

    const newUser: SystemUser = {
      id: `usr-${Date.now()}`,
      name: inviteName,
      email: inviteEmail.toLowerCase(),
      role: inviteRole.charAt(0).toUpperCase() + inviteRole.slice(1),
      status: "Active",
      branch: (authUser as any)?.branch?.name || "Main Branch",
    };

    setUsers((prev) => [...prev, newUser]);
    toast.success(`Sent invitation link to ${inviteEmail}!`);
    
    // Reset Invite Form
    setInviteEmail("");
    setInviteName("");
    setInviteRole("pastor");
    setShowInviteModal(false);
  };

  if (!canManage) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] text-center p-6 select-none">
        <div className="rounded-2xl border border-border/40 bg-card/40 p-8 max-w-md backdrop-blur-glass shadow-glass">
          <Lock className="h-10 w-10 text-rose-400 mx-auto mb-4" />
          <h3 className="text-base font-bold text-primary-foreground font-display">Access Restricted</h3>
          <p className="text-xs text-muted-foreground mt-2">
            You do not have the required permissions to access user role management.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 max-w-6xl mx-auto space-y-8 select-none">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between border-b border-border/30 pb-4">
        <div className="flex items-center gap-3">
          <Link
            href="/dashboard/settings"
            className="flex h-9 w-9 items-center justify-center rounded-xl border border-border/50 bg-card/40 hover:bg-slate-900 transition-colors text-muted-foreground hover:text-primary-foreground"
            aria-label="Back to settings"
          >
            <ArrowLeft className="h-4 w-4" />
          </Link>
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-primary-foreground font-display flex items-center gap-2">
              <Users className="h-6 w-6 text-indigo-400" />
              User Directory & Roles
            </h1>
            <p className="text-xs text-muted-foreground mt-0.5">
              Assign administrative platform access levels, audit login states, and suspend accounts.
            </p>
          </div>
        </div>

        <button
          onClick={() => setShowInviteModal(true)}
          className="inline-flex items-center gap-1.5 rounded-xl bg-indigo-500 hover:bg-indigo-600 px-4 py-2.5 text-xs font-semibold text-white transition-all shadow-neon"
        >
          <UserPlus className="h-4 w-4" />
          <span>Invite Admin User</span>
        </button>
      </div>

      {/* Search Bar */}
      <div className="relative max-w-md">
        <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
        <input
          type="text"
          placeholder="Search by name, email, or role..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full pl-9 pr-4 py-2 text-xs rounded-xl border border-border/40 bg-card/40 text-primary-foreground placeholder:text-muted-foreground focus:outline-none focus:border-indigo-500/50"
        />
      </div>

      {/* Users Table */}
      {loading ? (
        <div className="rounded-2xl border border-border/40 bg-card/60 p-8 text-center animate-pulse min-h-[300px] flex justify-center items-center">
          <div className="h-8 w-8 animate-spin rounded-full border-2 border-primary border-t-transparent" />
        </div>
      ) : (
        <div className="overflow-x-auto rounded-2xl border border-border/40 bg-card/60 shadow-glass">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="border-b border-border/30 bg-slate-900/30 text-muted-foreground font-semibold">
                <th className="p-4">Name</th>
                <th className="p-4">Email</th>
                <th className="p-4">Branch</th>
                <th className="p-4">Access Role</th>
                <th className="p-4">Status</th>
                <th className="p-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border/20">
              {filteredUsers.map((user) => (
                <tr key={user.id} className="hover:bg-slate-900/10 transition-colors">
                  <td className="p-4 font-semibold text-primary-foreground">{user.name}</td>
                  <td className="p-4 text-muted-foreground">{user.email}</td>
                  <td className="p-4 text-muted-foreground">{user.branch}</td>
                  <td className="p-4">
                    <select
                      value={user.role.toLowerCase()}
                      onChange={(e) => changeUserRole(user.id, e.target.value)}
                      disabled={user.role === "Super Admin" && authUser?.role !== "super_admin"}
                      className="rounded-lg border border-border/40 bg-card/60 px-2.5 py-1 text-[11px] focus:outline-none focus:border-indigo-500"
                    >
                      <option value="super admin" disabled>Super Admin</option>
                      <option value="pastor">Pastor</option>
                      <option value="church admin">Church Admin</option>
                      <option value="treasurer">Treasurer</option>
                      <option value="media team">Media Team</option>
                      <option value="member">Regular Member</option>
                    </select>
                  </td>
                  <td className="p-4">
                    <span
                      className={cn(
                        "inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-semibold",
                        user.status === "Active"
                          ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20"
                          : "bg-rose-500/10 text-rose-400 border border-rose-500/20"
                      )}
                    >
                      <span className={cn("h-1.5 w-1.5 rounded-full", user.status === "Active" ? "bg-emerald-400" : "bg-rose-400")} />
                      {user.status}
                    </span>
                  </td>
                  <td className="p-4 text-right">
                    <button
                      onClick={() => toggleUserStatus(user.id)}
                      disabled={user.id === String(authUser?.id)}
                      className={cn(
                        "inline-flex h-7 w-7 items-center justify-center rounded-lg border border-border/40 transition-colors",
                        user.status === "Active"
                          ? "hover:bg-rose-500/10 text-muted-foreground hover:text-rose-400"
                          : "hover:bg-emerald-500/10 text-muted-foreground hover:text-emerald-400",
                        user.id === String(authUser?.id) && "opacity-40 cursor-not-allowed"
                      )}
                      title={user.status === "Active" ? "Suspend Account" : "Activate Account"}
                    >
                      {user.status === "Active" ? <Lock className="h-3.5 w-3.5" /> : <Unlock className="h-3.5 w-3.5" />}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Invite User Dialog Modal */}
      {showInviteModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-background/80 backdrop-blur-sm">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="w-full max-w-md rounded-2xl border border-border/40 bg-card p-6 shadow-glass space-y-6"
          >
            <div className="flex items-center justify-between border-b border-border/20 pb-3">
              <h3 className="font-display text-sm font-bold text-primary-foreground flex items-center gap-1.5">
                <UserCheck className="h-5 w-5 text-indigo-400" />
                Invite Administrative Member
              </h3>
              <button
                onClick={() => setShowInviteModal(false)}
                className="text-muted-foreground hover:text-primary-foreground text-xs"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSendInvite} className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-[10px] font-bold uppercase text-muted-foreground">Full Name</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Reverend Isaac Koech"
                  value={inviteName}
                  onChange={(e) => setInviteName(e.target.value)}
                  className="w-full px-3 py-2 text-xs rounded-lg border border-border/40 bg-slate-900/40 text-primary-foreground focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-[10px] font-bold uppercase text-muted-foreground">Email Address</label>
                <input
                  type="email"
                  required
                  placeholder="e.g. isaac@churchnexus.org"
                  value={inviteEmail}
                  onChange={(e) => setInviteEmail(e.target.value)}
                  className="w-full px-3 py-2 text-xs rounded-lg border border-border/40 bg-slate-900/40 text-primary-foreground focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-[10px] font-bold uppercase text-muted-foreground">Default Access Level</label>
                <select
                  value={inviteRole}
                  onChange={(e) => setInviteRole(e.target.value)}
                  className="w-full px-3 py-2 text-xs rounded-lg border border-border/40 bg-slate-900/40 text-primary-foreground focus:outline-none focus:border-indigo-500"
                >
                  <option value="pastor">Pastor</option>
                  <option value="church admin">Church Admin</option>
                  <option value="treasurer">Treasurer</option>
                  <option value="media team">Media Team</option>
                </select>
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t border-border/20">
                <button
                  type="button"
                  onClick={() => setShowInviteModal(false)}
                  className="rounded-lg border border-border/50 px-4 py-2 text-xs font-semibold text-muted-foreground hover:bg-slate-900 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="rounded-lg bg-indigo-500 hover:bg-indigo-600 px-4 py-2 text-xs font-semibold text-white transition-colors"
                >
                  Send Invitation
                </button>
              </div>
            </form>
          </motion.div>
        </div>
      )}
    </div>
  );
}
