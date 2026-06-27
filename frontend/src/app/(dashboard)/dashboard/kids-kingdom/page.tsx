"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "sonner";
import {
  Users,
  DoorOpen,
  CalendarDays,
  ShieldCheck,
  Plus,
  ArrowRightLeft,
  AlertOctagon,
  Unlock,
  KeyRound,
  FileCheck,
  X,
  Pencil
} from "lucide-react";
import { SectionHeader } from "@/features/dashboard/components/widgets/section-header";
import { cn } from "@/lib/utils";
import { useKidsKingdom, ChildRegistryForm, CheckInDialog, type Child, type CheckInLog } from "@/features/kids-kingdom";

export default function KidsKingdomPage() {
  const [activeTab, setActiveTab] = useState<"checkins" | "registry" | "classrooms">("checkins");
  const {
    children,
    classrooms,
    checkIns,
    isLoading,
    addChild,
    updateChild,
    addClassroom,
    checkInChild,
    checkOutChild,
  } = useKidsKingdom();

  // Dialog State
  const [isRegisterOpen, setIsRegisterOpen] = useState(false);
  const [editingChild, setEditingChild] = useState<Child | null>(null);
  const [activeCheckInChild, setActiveCheckInChild] = useState<Child | null>(null);
  const [activeCheckOutLog, setActiveCheckOutLog] = useState<CheckInLog | null>(null);
  const [checkoutCode, setCheckoutCode] = useState("");
  const [checkoutParentId, setCheckoutParentId] = useState("");

  const handleRegisterSubmit = async (values: any) => {
    const created = await addChild(values);
    if (created) {
      setIsRegisterOpen(false);
    }
  };

  const handleEditSubmit = async (values: any) => {
    if (!editingChild) return;
    const updated = await updateChild(editingChild.id, values);
    if (updated) {
      setEditingChild(null);
    }
  };

  const handleCheckInSubmit = async (childId: string, checkedInById: string, classroomId?: string) => {
    const data = await checkInChild(childId, checkedInById, classroomId);
    // Don't close the dialog here — let CheckInDialog show the success screen with security code
    return data;
  };

  const handleCheckOutSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeCheckOutLog) return;
    if (!checkoutCode.trim()) {
      return;
    }
    if (!checkoutParentId) {
      return;
    }

    const data = await checkOutChild(activeCheckOutLog.id, checkoutCode, checkoutParentId);
    if (data) {
      setActiveCheckOutLog(null);
      setCheckoutCode("");
      setCheckoutParentId("");
    }
  };

  // Compute stats
  const activeCheckInCount = checkIns.filter((log) => log.status === "Checked In").length;
  const totalKidsRegistered = children.length;
  const totalRooms = classrooms.length;

  const cardVariants = {
    hidden: { opacity: 0, y: 12 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.3 } },
  };

  return (
    <div className="space-y-8">
      {/* Page Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <SectionHeader
          title="Kids Kingdom child ministry"
          description="Manage secure child check-ins, parent links, age-allocated rooms, and allergies."
        />
        <div className="flex gap-3">
          <button
            onClick={() => setIsRegisterOpen(true)}
            className={cn(
              "inline-flex items-center justify-center gap-1.5 rounded-xl bg-indigo-600 px-4 py-2.5 text-sm font-semibold text-white",
              "transition-all hover:bg-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/20",
              "shadow-[0_0_12px_rgba(99,102,241,0.3)]"
            )}
          >
            <Plus className="h-4 w-4" />
            Register Child
          </button>
        </div>
      </div>

      {/* KPI Stats Cards */}
      <div className="grid gap-6 sm:grid-cols-3">
        <div className="rounded-2xl border border-border/50 bg-card/60 p-5 backdrop-blur-glass shadow-glass flex items-center justify-between">
          <div>
            <span className="text-xs text-muted-foreground font-medium">Currently Checked-In</span>
            <h3 className="text-3xl font-extrabold text-white mt-1">{activeCheckInCount}</h3>
          </div>
          <div className="rounded-xl bg-emerald-500/10 border border-emerald-500/20 p-3 text-emerald-400">
            <DoorOpen className="h-6 w-6" />
          </div>
        </div>

        <div className="rounded-2xl border border-border/50 bg-card/60 p-5 backdrop-blur-glass shadow-glass flex items-center justify-between">
          <div>
            <span className="text-xs text-muted-foreground font-medium">Registered Children</span>
            <h3 className="text-3xl font-extrabold text-white mt-1">{totalKidsRegistered}</h3>
          </div>
          <div className="rounded-xl bg-indigo-500/10 border border-indigo-500/20 p-3 text-indigo-400">
            <Users className="h-6 w-6" />
          </div>
        </div>

        <div className="rounded-2xl border border-border/50 bg-card/60 p-5 backdrop-blur-glass shadow-glass flex items-center justify-between">
          <div>
            <span className="text-xs text-muted-foreground font-medium">Active Classrooms</span>
            <h3 className="text-3xl font-extrabold text-white mt-1">{totalRooms}</h3>
          </div>
          <div className="rounded-xl bg-cyan-500/10 border border-cyan-500/20 p-3 text-cyan-400">
            <CalendarDays className="h-6 w-6" />
          </div>
        </div>
      </div>

      {/* Tabs Menu */}
      <div className="flex border-b border-border/10 pb-px">
        <button
          onClick={() => setActiveTab("checkins")}
          className={cn(
            "border-b-2 px-5 py-3 text-sm font-semibold transition-all",
            activeTab === "checkins"
              ? "border-indigo-500 text-indigo-400"
              : "border-transparent text-muted-foreground hover:text-primary-foreground"
          )}
        >
          Active Check-Ins ({activeCheckInCount})
        </button>
        <button
          onClick={() => setActiveTab("registry")}
          className={cn(
            "border-b-2 px-5 py-3 text-sm font-semibold transition-all",
            activeTab === "registry"
              ? "border-indigo-500 text-indigo-400"
              : "border-transparent text-muted-foreground hover:text-primary-foreground"
          )}
        >
          Child Registry ({totalKidsRegistered})
        </button>
        <button
          onClick={() => setActiveTab("classrooms")}
          className={cn(
            "border-b-2 px-5 py-3 text-sm font-semibold transition-all",
            activeTab === "classrooms"
              ? "border-indigo-500 text-indigo-400"
              : "border-transparent text-muted-foreground hover:text-primary-foreground"
          )}
        >
          Classrooms ({totalRooms})
        </button>
      </div>

      {/* Roster & Dashboard Loading views */}
      {isLoading ? (
        <div className="flex min-h-[300px] flex-col items-center justify-center text-center">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-indigo-500 border-t-transparent" />
          <p className="mt-4 text-sm text-muted-foreground">Loading Kids Kingdom logs...</p>
        </div>
      ) : (
        <div className="min-h-[300px]">
          {/* Tab 1: Active Check Ins */}
          {activeTab === "checkins" && (
            <div className="space-y-6">
              {checkIns.filter((log) => log.status === "Checked In").length === 0 ? (
                <div className="flex flex-col items-center justify-center border border-border/40 rounded-2xl bg-card/40 p-12 text-center backdrop-blur-glass">
                  <ShieldCheck className="h-10 w-10 text-muted-foreground/60 mb-3" />
                  <h3 className="text-base font-bold text-primary-foreground">No active check-ins</h3>
                  <p className="mt-1 text-xs text-muted-foreground max-w-sm leading-normal">
                    All children are currently checked out. Link parents and click "Check In" on the child registry roster to drop off kids.
                  </p>
                </div>
              ) : (
                <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                  {checkIns
                    .filter((log) => log.status === "Checked In")
                    .map((log) => (
                      <motion.div
                        key={log.id}
                        variants={cardVariants}
                        initial="hidden"
                        animate="visible"
                        className="group relative overflow-hidden rounded-2xl border border-border/50 bg-card/60 p-5 backdrop-blur-glass flex flex-col justify-between min-h-[190px] shadow-glass"
                      >
                        <div className="space-y-3">
                          <div className="flex items-start justify-between">
                            <div>
                              <h4 className="text-base font-bold text-white leading-normal">
                                {log.child_details?.first_name} {log.child_details?.last_name}
                              </h4>
                              <span className="text-[10px] text-muted-foreground/75 font-semibold">
                                Age: {log.child_details?.age} yrs • Room: {log.classroom_details?.name}
                              </span>
                            </div>
                            {log.child_details?.allergy_alerts && (
                              <span className="animate-pulse rounded-full bg-red-500/20 px-2 py-0.5 text-[9px] font-bold uppercase tracking-wider text-red-400 border border-red-500/30">
                                Allergy
                              </span>
                            )}
                          </div>

                          {/* Parents Contacts */}
                          <div className="border-t border-border/10 pt-2 text-[11px] space-y-1 text-muted-foreground">
                            {log.child_details?.parents.map((p, idx) => (
                              <div key={idx} className="flex justify-between">
                                <span>{p.first_name} (Parent)</span>
                                <span className="font-semibold text-indigo-300">{p.phone_number}</span>
                              </div>
                            ))}
                          </div>
                        </div>

                        <div className="flex items-center justify-between border-t border-border/10 pt-3 mt-4">
                          <div className="text-[10px] text-muted-foreground">
                            In: <span className="font-semibold text-white">{new Date(log.check_in_time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                          </div>
                          
                          <button
                            onClick={() => {
                              setCheckoutParentId(log.child_details?.parents[0]?.id || "");
                              setActiveCheckOutLog(log);
                            }}
                            className="inline-flex items-center gap-1 rounded-lg bg-indigo-500/10 hover:bg-indigo-500/20 border border-indigo-500/20 px-3 py-1.5 text-xs font-bold text-indigo-400 transition-all"
                          >
                            <ArrowRightLeft className="h-3 w-3" />
                            Check Out
                          </button>
                        </div>
                      </motion.div>
                    ))}
                </div>
              )}
            </div>
          )}

          {/* Tab 2: Child Registry */}
          {activeTab === "registry" && (
            <div className="space-y-6">
              {children.length === 0 ? (
                <div className="flex flex-col items-center justify-center border border-border/40 rounded-2xl bg-card/40 p-12 text-center backdrop-blur-glass">
                  <Users className="h-10 w-10 text-muted-foreground/60 mb-3" />
                  <h3 className="text-base font-bold text-primary-foreground">No children registered</h3>
                  <p className="mt-1 text-xs text-muted-foreground max-w-sm leading-normal">
                    Get started by registering children and adding parent links.
                  </p>
                </div>
              ) : (
                <div className="overflow-x-auto rounded-2xl border border-border/40 bg-card/20 backdrop-blur-glass">
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="border-b border-border/10 bg-slate-950/20 text-xs font-bold text-muted-foreground uppercase tracking-wider">
                        <th className="px-5 py-4">Name</th>
                        <th className="px-5 py-4">Age / DOB</th>
                        <th className="px-5 py-4">Parents / Guardians</th>
                        <th className="px-5 py-4">Warnings</th>
                        <th className="px-5 py-4 text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-border/10 text-sm text-primary-foreground">
                      {children.map((child) => {
                        const isCurrentlyCheckedIn = checkIns.some(
                          (log) => log.child === child.id && log.status === "Checked In"
                        );

                        return (
                          <tr key={child.id} className="hover:bg-card/40 transition-colors">
                            <td className="px-5 py-4 font-bold">
                              {child.first_name} {child.last_name}
                            </td>
                            <td className="px-5 py-4">
                              {child.age} yrs <span className="text-xs text-muted-foreground">({child.birth_date})</span>
                            </td>
                            <td className="px-5 py-4">
                              {child.parent_details && child.parent_details.length > 0 ? (
                                <div className="space-y-0.5">
                                  {child.parent_details.map((p, i) => (
                                    <div key={i} className="text-xs">
                                      {p.first_name} {p.last_name} <span className="text-[10px] text-muted-foreground">({p.phone_number})</span>
                                    </div>
                                  ))}
                                </div>
                              ) : (
                                <span className="text-xs text-red-400 font-semibold flex items-center gap-1">
                                  <AlertOctagon className="h-3.5 w-3.5" /> No Parents Linked
                                </span>
                              )}
                            </td>
                            <td className="px-5 py-4">
                              <div className="flex gap-1.5 flex-wrap">
                                {child.allergy_alerts && (
                                  <span className="rounded-full bg-red-500/20 px-2 py-0.5 text-[9px] font-bold uppercase tracking-wider text-red-400 border border-red-500/30">
                                    Allergy
                                  </span>
                                )}
                                {child.special_needs && (
                                  <span className="rounded-full bg-amber-500/20 px-2 py-0.5 text-[9px] font-bold uppercase tracking-wider text-amber-400 border border-amber-500/30">
                                    Special Needs
                                  </span>
                                )}
                              </div>
                            </td>
                            <td className="px-5 py-4 text-right">
                              <div className="flex items-center justify-end gap-2">
                                <button
                                  type="button"
                                  onClick={() => setEditingChild(child)}
                                  className="inline-flex items-center gap-1 rounded-xl border border-border/50 bg-card/60 px-2.5 py-1.5 text-xs font-bold text-muted-foreground transition-all hover:bg-card/90 hover:text-white"
                                >
                                  <Pencil className="h-3 w-3" />
                                  Edit
                                </button>

                                {isCurrentlyCheckedIn ? (
                                  <span className="rounded-xl bg-emerald-500/10 border border-emerald-500/20 px-3 py-1.5 text-xs font-bold text-emerald-400 inline-block">
                                    Checked In
                                  </span>
                                ) : (
                                  <button
                                    onClick={() => {
                                      if (!child.parent_details || child.parent_details.length === 0) {
                                        toast.error("Please edit the child profile and link at least one parent member before check-in.");
                                        return;
                                      }
                                      setActiveCheckInChild(child);
                                    }}
                                    className="rounded-xl bg-indigo-600 px-3 py-1.5 text-xs font-bold text-white transition-all hover:bg-indigo-500"
                                  >
                                    Check In
                                  </button>
                                )}
                              </div>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )}

          {/* Tab 3: Classrooms */}
          {activeTab === "classrooms" && (
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {classrooms.map((room) => {
                // Count current active children in this classroom
                const activeCount = checkIns.filter(
                  (log) => log.classroom === room.id && log.status === "Checked In"
                ).length;
                
                return (
                  <motion.div
                    key={room.id}
                    variants={cardVariants}
                    initial="hidden"
                    animate="visible"
                    className="rounded-2xl border border-border/50 bg-card/60 p-5 backdrop-blur-glass shadow-glass flex flex-col justify-between"
                  >
                    <div>
                      <h4 className="text-base font-bold text-white">{room.name}</h4>
                      <p className="text-xs text-muted-foreground mt-0.5">
                        Target ages: {room.min_age} to {room.max_age} years old
                      </p>
                    </div>

                    <div className="border-t border-border/10 pt-4 mt-4 flex items-center justify-between">
                      <span className="text-xs text-muted-foreground">Capacity Usage</span>
                      <span className="text-xs font-bold text-white">
                        {activeCount} / {room.capacity} checked in
                      </span>
                    </div>
                    {/* Visual Capacity Bar */}
                    <div className="h-1.5 w-full bg-slate-800 rounded-full overflow-hidden mt-2">
                      <div
                        className="h-full bg-indigo-500 transition-all duration-300"
                        style={{ width: `${Math.min((activeCount / room.capacity) * 100, 100)}%` }}
                      />
                    </div>
                  </motion.div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* MODALS & DIALOGS */}
      <AnimatePresence>
        {/* Register Child Modal */}
        {isRegisterOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-sm">
            <ChildRegistryForm
              onSubmit={handleRegisterSubmit}
              onClose={() => setIsRegisterOpen(false)}
            />
          </div>
        )}

        {/* Edit Child Modal */}
        {editingChild && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-sm">
            <ChildRegistryForm
              child={editingChild}
              onSubmit={handleEditSubmit}
              onClose={() => setEditingChild(null)}
            />
          </div>
        )}

        {/* Check In Modal */}
        {activeCheckInChild && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-sm">
            <CheckInDialog
              child={activeCheckInChild}
              classrooms={classrooms}
              onCheckIn={handleCheckInSubmit}
              onClose={() => setActiveCheckInChild(null)}
              onEditChild={(childToEdit) => setEditingChild(childToEdit)}
            />
          </div>
        )}

        {/* Check Out validation Modal */}
        {activeCheckOutLog && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="w-full max-w-sm rounded-3xl border border-border/50 bg-slate-900/95 p-6 backdrop-blur-xl shadow-2xl"
            >
              <div className="flex items-center justify-between border-b border-border/10 pb-3 mb-4">
                <h3 className="text-sm font-bold text-white flex items-center gap-1.5">
                  <KeyRound className="h-4 w-4 text-indigo-400" />
                  Security Release Verification
                </h3>
                <button
                  type="button"
                  onClick={() => {
                    setActiveCheckOutLog(null);
                    setCheckoutCode("");
                    setCheckoutParentId("");
                  }}
                  className="rounded-xl border border-border/50 p-2 text-muted-foreground transition-all hover:bg-card/50"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>

              <form onSubmit={handleCheckOutSubmit} className="space-y-4">
                <div className="text-xs text-muted-foreground leading-normal">
                  You are checking out <span className="font-semibold text-white">{activeCheckOutLog.child_details?.first_name}</span>. Enter the pickup code and select the checking out guardian.
                </div>

                {/* Parent selection */}
                <div>
                  <label htmlFor="checked_out_by" className="block text-[10px] font-semibold uppercase tracking-wider text-muted-foreground mb-1.5">
                    Picked Up By (Guardian)
                  </label>
                  <select
                    id="checked_out_by"
                    className="w-full rounded-xl border border-border/50 bg-card/60 px-4 py-2.5 text-xs text-white focus:outline-none"
                    value={checkoutParentId}
                    onChange={(e) => setCheckoutParentId(e.target.value)}
                  >
                    <option value="">-- Select Parent/Guardian --</option>
                    {activeCheckOutLog.child_details?.parents.map((p: any, idx: number) => (
                      <option key={idx} value={p.id}>
                        {p.first_name} {p.last_name}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Code input */}
                <div>
                  <label htmlFor="code" className="block text-[10px] font-semibold uppercase tracking-wider text-muted-foreground mb-1.5">
                    Enter Verification Code
                  </label>
                  <input
                    id="code"
                    type="text"
                    placeholder="e.g. KK-89B7"
                    className="w-full rounded-xl border border-border/50 bg-card/60 px-4 py-2.5 text-center text-lg font-bold tracking-widest text-indigo-300 placeholder:text-muted-foreground/35 focus:outline-none focus:border-indigo-500 uppercase"
                    value={checkoutCode}
                    onChange={(e) => setCheckoutCode(e.target.value)}
                  />
                </div>

                {/* Action button */}
                <button
                  type="submit"
                  className={cn(
                    "w-full inline-flex items-center justify-center gap-1.5 rounded-xl bg-indigo-600 px-5 py-2.5 text-xs font-bold text-white transition-all hover:bg-indigo-500 shadow-[0_0_12px_rgba(99,102,241,0.3)]",
                    (!checkoutCode || !checkoutParentId) && "opacity-50 cursor-not-allowed"
                  )}
                  disabled={!checkoutCode || !checkoutParentId}
                >
                  <Unlock className="h-4 w-4" />
                  Authorize Child Release
                </button>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
