"use client";

import { useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { 
  FileText, Download, Play, RefreshCw, XCircle, Trash2, 
  ShieldAlert, Settings, Sparkles, CheckCircle, Clock, AlertTriangle 
} from "lucide-react";
import { useDocuments, DocumentTemplate, GeneratedDocument } from "@/features/documents";
import { useMembers } from "@/features/members/hooks/use-members";
import { useAppPermissions } from "@/hooks/use-app-permissions";
import { formatCurrency } from "@/lib/localization";
import { cn } from "@/lib/utils";

export default function DocumentCenterPage() {
  const router = useRouter();
  const { allMembers } = useMembers();
  const { documents: docPermissions, userId } = useAppPermissions();
  const { canView, canManage, canEditTemplates, isMember, userMemberId } = docPermissions;

  // Search & Filter state
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [categoryFilter, setCategoryFilter] = useState<string>("all");
  const [search, setSearch] = useState("");

  const filters = useMemo(() => ({
    status: statusFilter as any,
    category: categoryFilter as any,
    search
  }), [statusFilter, categoryFilter, search]);

  const {
    templates,
    documents,
    loading,
    requestDocument,
    getDownloadUrl,
    revokeDocument,
    cancelDocument,
    refresh
  } = useDocuments(filters);

  // Request form state
  const [selectedTemplate, setSelectedTemplate] = useState<DocumentTemplate | null>(null);
  const [selectedFormat, setSelectedFormat] = useState<"PDF" | "CSV">("PDF");
  const [selectedMemberId, setSelectedMemberId] = useState("");
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
  const [selectedFamilyId, setSelectedFamilyId] = useState("fam-001");
  const [selectedEventId, setSelectedEventId] = useState("evt-001");
  const [retentionPolicy, setRetentionPolicy] = useState<"PERMANENT" | "7_DAYS" | "30_DAYS">("7_DAYS");
  const [isRequesting, setIsRequesting] = useState(false);

  // Filter templates by category matching user roles
  const visibleTemplates = useMemo(() => {
    let list = templates;
    if (isMember) {
      // Members only see certificates & individual statement templates
      list = list.filter(t => t.id === "tmpl-baptism" || t.id === "tmpl-salvation" || t.id === "tmpl-member-giving");
    }
    return list;
  }, [templates, isMember]);

  const handleOpenRequestModal = (tmpl: DocumentTemplate) => {
    setSelectedTemplate(tmpl);
    // Set default retention policies based on document categories
    if (tmpl.category === "certificate") {
      setRetentionPolicy("PERMANENT");
      setSelectedFormat("PDF");
    } else {
      setRetentionPolicy("7_DAYS");
    }
  };

  const handleCloseRequestModal = () => {
    setSelectedTemplate(null);
    setSelectedMemberId("");
  };

  const handleRequestGeneration = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedTemplate) return;

    setIsRequesting(true);
    try {
      // Build filter metadata
      const filter_metadata: Record<string, any> = {};
      let source_type = "System";
      let source_id = "system";

      if (selectedTemplate.id === "tmpl-baptism" || selectedTemplate.id === "tmpl-salvation") {
        const targetMemberId = isMember ? userMemberId : selectedMemberId;
        filter_metadata.memberId = targetMemberId;
        source_type = "Member";
        source_id = targetMemberId || "unknown";
      } else if (selectedTemplate.id === "tmpl-member-giving") {
        const targetMemberId = isMember ? userMemberId : selectedMemberId;
        filter_metadata.memberId = targetMemberId;
        filter_metadata.year = selectedYear;
        source_type = "Member";
        source_id = targetMemberId || "unknown";
      } else if (selectedTemplate.id === "tmpl-household-giving") {
        filter_metadata.familyId = selectedFamilyId;
        filter_metadata.year = selectedYear;
        source_type = "Family";
        source_id = selectedFamilyId;
      } else if (selectedTemplate.id === "tmpl-event-rsvp") {
        filter_metadata.eventId = selectedEventId;
        source_type = "Event";
        source_id = selectedEventId;
      }

      await requestDocument({
        branch_id: "branch-001",
        document_type: selectedTemplate.id.replace("tmpl-", "").toUpperCase(),
        format: selectedFormat,
        template_version: selectedTemplate.template_version,
        source_type,
        source_id,
        expires_at: null,
        retention_policy: retentionPolicy,
        requested_by: userId ? String(userId) : "system",
        filter_metadata
      });

      handleCloseRequestModal();
    } catch (err) {
      console.error(err);
    } finally {
      setIsRequesting(false);
    }
  };

  const handleDownload = async (docId: string) => {
    try {
      const url = await getDownloadUrl(docId);
      // Simulate file download trigger
      if (typeof window !== "undefined") {
        window.open(url, "_blank");
      }
    } catch (err) {
      console.error(err);
    }
  };

  if (!canView) {
    return (
      <div className="p-8 max-w-md mx-auto text-center space-y-4">
        <div className="bg-red-500/10 text-red-400 p-4 rounded-xl border border-red-500/20 font-semibold flex items-center justify-center gap-2">
          <ShieldAlert className="h-5 w-5" />
          Access Denied
        </div>
        <p className="text-sm text-muted-foreground">
          You do not have permission to access the Document & Reports Center.
        </p>
      </div>
    );
  }

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-8">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-primary-foreground flex items-center gap-2">
            <FileText className="h-6 w-6 text-indigo-400" />
            Document & Reports Center
          </h1>
          <p className="text-sm text-muted-foreground">
            Generate standardized watermarked certificates, giving statements, and attendance sheets.
          </p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => refresh()}
            className="flex items-center justify-center p-2.5 rounded-xl border border-border/50 bg-card/40 hover:bg-slate-900 transition-all text-primary-foreground"
            title="Refresh Ledger"
          >
            <RefreshCw className="h-4 w-4" />
          </button>
          {canEditTemplates && (
            <button
              onClick={() => router.push("/dashboard/documents/templates")}
              className="flex items-center gap-1.5 rounded-xl border border-border/50 bg-card/40 px-4 py-2.5 text-sm font-semibold text-primary-foreground hover:bg-slate-900 transition-all"
            >
              <Settings className="h-4 w-4 text-indigo-400" />
              Manage Templates
            </button>
          )}
        </div>
      </div>

      {/* Templates Workspace */}
      <div className="space-y-4">
        <div>
          <h2 className="text-lg font-bold text-primary-foreground">Available Templates</h2>
          <p className="text-xs text-muted-foreground">Select a standard branded template to request compilation</p>
        </div>
        <div className="grid gap-4 md:grid-cols-3">
          {visibleTemplates.map((tmpl) => (
            <div
              key={tmpl.id}
              className="rounded-2xl border border-border/50 bg-card/60 p-5 backdrop-blur-glass shadow-glass flex flex-col justify-between space-y-4 hover:border-indigo-500/30 transition-all duration-300 group"
            >
              <div className="space-y-2">
                <div className="flex justify-between items-start">
                  <span className={cn(
                    "text-[10px] uppercase tracking-wider font-bold px-2 py-0.5 rounded-md border",
                    tmpl.category === "certificate" 
                      ? "bg-emerald-500/10 border-emerald-500/20 text-emerald-400"
                      : tmpl.category === "statement"
                      ? "bg-indigo-500/10 border-indigo-500/20 text-indigo-400"
                      : "bg-pink-500/10 border-pink-500/20 text-pink-400"
                  )}>
                    {tmpl.category}
                  </span>
                  <span className="text-[10px] text-slate-500 font-mono">v{tmpl.template_version}</span>
                </div>
                <h4 className="font-bold text-primary-foreground group-hover:text-indigo-400 transition-colors duration-300">
                  {tmpl.name}
                </h4>
                <p className="text-xs text-muted-foreground line-clamp-2 leading-relaxed">
                  Generates standardized document outputs formatted dynamically for members or events.
                </p>
              </div>

              <div className="border-t border-border/40 pt-3 flex items-center justify-between text-[11px] text-muted-foreground">
                <span className="text-slate-400">Total generated: <strong>{tmpl.generated_count}</strong></span>
                <button
                  onClick={() => handleOpenRequestModal(tmpl)}
                  className="flex items-center gap-1 text-xs text-indigo-400 hover:text-indigo-300 font-semibold px-2 py-1 rounded-lg hover:bg-indigo-500/10 transition-all"
                >
                  <Play className="h-3.5 w-3.5 fill-indigo-400/20" />
                  Generate
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Generation queue Section */}
      <div className="space-y-4 border border-border/40 rounded-2xl bg-card/20 p-6 backdrop-blur-glass shadow-glass">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h2 className="text-lg font-bold text-primary-foreground">Download Queue</h2>
            <p className="text-xs text-muted-foreground">Status and downloads for generated statement assets</p>
          </div>

          <div className="flex flex-col sm:flex-row gap-3 sm:items-center">
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="rounded-xl border border-border/50 bg-slate-900/60 px-3 py-2 text-xs font-semibold text-primary-foreground backdrop-blur-[16px] focus:outline-none focus:ring-0 cursor-pointer"
            >
              <option value="all">All Statuses</option>
              <option value="Pending">Pending</option>
              <option value="Processing">Processing</option>
              <option value="Completed">Completed</option>
              <option value="Failed">Failed</option>
              <option value="Cancelled">Cancelled</option>
            </select>
            <select
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
              className="rounded-xl border border-border/50 bg-slate-900/60 px-3 py-2 text-xs font-semibold text-primary-foreground backdrop-blur-[16px] focus:outline-none focus:ring-0 cursor-pointer"
            >
              <option value="all">All Categories</option>
              <option value="certificate">Certificate</option>
              <option value="statement">Statement</option>
              <option value="roster">Roster</option>
            </select>
          </div>
        </div>

        {/* Ledger Table */}
        <div className="overflow-x-auto rounded-xl border border-border/40 bg-slate-950/20">
          <table className="w-full border-collapse text-left text-sm">
            <thead>
              <tr className="border-b border-border/40 bg-slate-900/40 text-xs font-semibold text-muted-foreground">
                <th className="p-4">Requested</th>
                <th className="p-4">Type</th>
                <th className="p-4">Format</th>
                <th className="p-4">Source Entity</th>
                <th className="p-4">Expires</th>
                <th className="p-4">Status</th>
                <th className="p-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border/30 text-primary-foreground">
              {loading ? (
                <tr>
                  <td colSpan={7} className="p-8 text-center text-xs text-muted-foreground animate-pulse">
                    Polling generation task status...
                  </td>
                </tr>
              ) : documents.length > 0 ? (
                documents.map((doc) => (
                  <tr
                    key={doc.id}
                    className="hover:bg-slate-900/20 transition-all duration-150"
                  >
                    <td className="p-4 whitespace-nowrap text-xs text-slate-300">
                      {new Date(doc.requested_at).toLocaleDateString("en-US", {
                        month: "short",
                        day: "numeric",
                        hour: "2-digit",
                        minute: "2-digit"
                      })}
                    </td>
                    <td className="p-4 font-bold text-xs uppercase text-indigo-300">
                      {doc.document_type.replace("_", " ")}
                    </td>
                    <td className="p-4 text-xs">
                      <span className="rounded bg-slate-900 border border-border/40 px-2 py-0.5 font-mono text-[10px]">
                        {doc.format}
                      </span>
                    </td>
                    <td className="p-4 text-xs font-medium text-slate-300">
                      {doc.source_type ? `${doc.source_type} (ID: ${doc.source_id})` : "General"}
                    </td>
                    <td className="p-4 text-xs text-slate-400">
                      {doc.expires_at ? (
                        new Date(doc.expires_at).toLocaleDateString()
                      ) : (
                        <span className="text-emerald-500/80 font-semibold text-[10px] tracking-wider uppercase">Permanent</span>
                      )}
                    </td>
                    <td className="p-4 text-xs">
                      <span className={cn(
                        "inline-flex items-center gap-1 rounded px-2 py-0.5 text-[10px] font-semibold border",
                        doc.status === "Completed" && "bg-emerald-500/10 border-emerald-500/20 text-emerald-400",
                        doc.status === "Pending" && "bg-amber-500/10 border-amber-500/20 text-amber-400",
                        doc.status === "Processing" && "bg-blue-500/10 border-blue-500/20 text-blue-400",
                        doc.status === "Failed" && "bg-rose-500/10 border-rose-500/20 text-rose-400",
                        doc.status === "Cancelled" && "bg-slate-500/10 border-slate-500/20 text-slate-400"
                      )}>
                        {doc.status === "Completed" && <CheckCircle className="h-3 w-3" />}
                        {doc.status === "Pending" && <Clock className="h-3 w-3 animate-pulse" />}
                        {doc.status === "Processing" && <RefreshCw className="h-3 w-3 animate-spin" />}
                        {doc.status === "Failed" && <AlertTriangle className="h-3 w-3" />}
                        {doc.status === "Cancelled" && <XCircle className="h-3 w-3" />}
                        {doc.status}
                      </span>
                    </td>
                    <td className="p-4 text-right whitespace-nowrap space-x-1">
                      {doc.status === "Completed" && (
                        <>
                          <button
                            onClick={() => handleDownload(doc.id)}
                            className="inline-flex items-center gap-1 text-xs text-emerald-400 hover:text-emerald-300 font-semibold px-2 py-1.5 rounded-lg hover:bg-emerald-500/10 transition-all"
                          >
                            <Download className="h-3.5 w-3.5" />
                            Download
                          </button>
                          {canManage && (
                            <button
                              onClick={() => revokeDocument(doc.id)}
                              className="inline-flex items-center gap-1 text-xs text-slate-500 hover:text-rose-400 font-semibold p-1.5 rounded-lg hover:bg-rose-500/10 transition-all"
                              title="Revoke / Archive File"
                            >
                              <Trash2 className="h-3.5 w-3.5" />
                            </button>
                          )}
                        </>
                      )}
                      {(doc.status === "Pending" || doc.status === "Processing") && (
                        <button
                          onClick={() => cancelDocument(doc.id)}
                          className="inline-flex items-center gap-1 text-xs text-rose-400 hover:text-rose-300 font-semibold px-2 py-1.5 rounded-lg hover:bg-rose-500/10 transition-all"
                        >
                          <XCircle className="h-3.5 w-3.5" />
                          Cancel
                        </button>
                      )}
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={7} className="p-8 text-center text-xs text-muted-foreground">
                    No documents matching selection found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Generation Request Modal Dialog */}
      <AnimatePresence>
        {selectedTemplate && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="w-full max-w-md bg-card/90 border border-border/50 rounded-2xl p-6 shadow-glass backdrop-blur-glass text-primary-foreground space-y-6"
            >
              <div className="flex justify-between items-start">
                <div>
                  <h3 className="text-lg font-bold">Configure Document Generation</h3>
                  <p className="text-xs text-muted-foreground">Configure template properties and queue parameters</p>
                </div>
                <button
                  onClick={handleCloseRequestModal}
                  className="p-1 rounded-lg hover:bg-slate-900 transition-colors text-muted-foreground hover:text-primary-foreground"
                >
                  <XCircle className="h-5 w-5" />
                </button>
              </div>

              <form onSubmit={handleRequestGeneration} className="space-y-4">
                {/* Template metadata card */}
                <div className="border border-border/30 rounded-xl p-3 bg-slate-900/40 text-xs space-y-1">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Selected Template:</span>
                    <span className="font-bold text-indigo-400">{selectedTemplate.name}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Template Version:</span>
                    <span className="font-mono">v{selectedTemplate.template_version}</span>
                  </div>
                </div>

                {/* Form Inputs based on Category */}
                {selectedTemplate.category === "certificate" ? (
                  <>
                    {!isMember && (
                      <div>
                        <label className="block text-xs font-semibold text-slate-400 mb-1.5">Select Member *</label>
                        <select
                          value={selectedMemberId}
                          onChange={(e) => setSelectedMemberId(e.target.value)}
                          className="w-full rounded-xl border border-border/50 bg-card/60 px-4 py-2.5 text-xs text-primary-foreground cursor-pointer"
                          required
                        >
                          <option value="">-- Choose Covenant Member --</option>
                          {allMembers.map((m) => (
                            <option key={m.id} value={m.id} className="bg-slate-950">
                              {m.first_name} {m.last_name} ({m.membership_number})
                            </option>
                          ))}
                        </select>
                      </div>
                    )}
                    <div className="bg-indigo-500/5 border border-indigo-500/20 rounded-xl p-3 text-[11px] text-indigo-400 flex items-start gap-2 leading-relaxed">
                      <Sparkles className="h-4 w-4 shrink-0 mt-0.5" />
                      <span>This certificate uses standard, church-branded layouts. Modifications to layouts must be performed in the Template Manager.</span>
                    </div>
                  </>
                ) : selectedTemplate.id === "tmpl-member-giving" ? (
                  <>
                    {!isMember && (
                      <div>
                        <label className="block text-xs font-semibold text-slate-400 mb-1.5">Select Member *</label>
                        <select
                          value={selectedMemberId}
                          onChange={(e) => setSelectedMemberId(e.target.value)}
                          className="w-full rounded-xl border border-border/50 bg-card/60 px-4 py-2.5 text-xs text-primary-foreground cursor-pointer"
                          required
                        >
                          <option value="">-- Choose Member --</option>
                          {allMembers.map((m) => (
                            <option key={m.id} value={m.id} className="bg-slate-950">
                              {m.first_name} {m.last_name}
                            </option>
                          ))}
                        </select>
                      </div>
                    )}
                    <div>
                      <label className="block text-xs font-semibold text-slate-400 mb-1.5">Reporting Year</label>
                      <select
                        value={selectedYear}
                        onChange={(e) => setSelectedYear(Number(e.target.value))}
                        className="w-full rounded-xl border border-border/50 bg-card/60 px-4 py-2.5 text-xs text-primary-foreground cursor-pointer"
                      >
                        <option value={2026} className="bg-slate-950">2026</option>
                        <option value={2025} className="bg-slate-950">2025</option>
                        <option value={2024} className="bg-slate-950">2024</option>
                      </select>
                    </div>
                  </>
                ) : selectedTemplate.id === "tmpl-household-giving" ? (
                  <>
                    <div>
                      <label className="block text-xs font-semibold text-slate-400 mb-1.5">Select Family Household</label>
                      <select
                        value={selectedFamilyId}
                        onChange={(e) => setSelectedFamilyId(e.target.value)}
                        className="w-full rounded-xl border border-border/50 bg-card/60 px-4 py-2.5 text-xs text-primary-foreground cursor-pointer"
                      >
                        <option value="fam-001" className="bg-slate-950">The Kamau Household</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-slate-400 mb-1.5">Reporting Year</label>
                      <select
                        value={selectedYear}
                        onChange={(e) => setSelectedYear(Number(e.target.value))}
                        className="w-full rounded-xl border border-border/50 bg-card/60 px-4 py-2.5 text-xs text-primary-foreground cursor-pointer"
                      >
                        <option value={2026} className="bg-slate-950">2026</option>
                        <option value={2025} className="bg-slate-950">2025</option>
                      </select>
                    </div>
                  </>
                ) : selectedTemplate.id === "tmpl-event-rsvp" ? (
                  <div>
                    <label className="block text-xs font-semibold text-slate-400 mb-1.5">Select Event</label>
                    <select
                      value={selectedEventId}
                      onChange={(e) => setSelectedEventId(e.target.value)}
                      className="w-full rounded-xl border border-border/50 bg-card/60 px-4 py-2.5 text-xs text-primary-foreground cursor-pointer"
                    >
                      <option value="evt-001" className="bg-slate-950">Sunday Service Check-in</option>
                      <option value="evt-002" className="bg-slate-950">Connect Group Leader Sync</option>
                    </select>
                  </div>
                ) : null}

                {/* Formats Selection */}
                {selectedTemplate.category !== "certificate" && (
                  <div>
                    <label className="block text-xs font-semibold text-slate-400 mb-1.5">Output File Format</label>
                    <div className="grid grid-cols-2 gap-2">
                      {["PDF", "CSV"].map((fmt) => (
                        <button
                          key={fmt}
                          type="button"
                          onClick={() => setSelectedFormat(fmt as any)}
                          className={cn(
                            "py-2 rounded-xl border text-xs font-semibold transition-all",
                            selectedFormat === fmt
                              ? "border-primary bg-primary/10 text-primary"
                              : "border-border/50 bg-slate-900/40 text-muted-foreground"
                          )}
                        >
                          {fmt}
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {/* Expiration Rules */}
                <div>
                  <label className="block text-xs font-semibold text-slate-400 mb-1.5">File Retention Window</label>
                  <select
                    value={retentionPolicy}
                    onChange={(e) => setRetentionPolicy(e.target.value as any)}
                    className="w-full rounded-xl border border-border/50 bg-card/60 px-4 py-2.5 text-xs text-primary-foreground cursor-pointer"
                    disabled={selectedTemplate.category === "certificate"}
                  >
                    <option value="7_DAYS" className="bg-slate-950">7 Days (Standard for statements)</option>
                    <option value="30_DAYS" className="bg-slate-950">30 Days (Standard for rosters)</option>
                    <option value="PERMANENT" className="bg-slate-950">Permanent (Required for certificates)</option>
                  </select>
                </div>

                {/* Actions */}
                <button
                  type="submit"
                  disabled={isRequesting}
                  className="w-full flex items-center justify-center gap-2 rounded-xl bg-primary py-3 text-xs font-semibold text-primary-foreground hover:brightness-110 disabled:opacity-50 transition-all shadow-neon"
                >
                  {isRequesting ? "Queuing Generator..." : "Trigger Generation Request"}
                </button>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
