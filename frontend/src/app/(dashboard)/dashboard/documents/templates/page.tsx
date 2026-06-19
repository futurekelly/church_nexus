"use client";

import { useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { ArrowLeft, Save, ShieldAlert, Sparkles, Code, CheckCircle } from "lucide-react";
import { useDocuments, DocumentTemplate } from "@/features/documents";
import { useAppPermissions } from "@/hooks/use-app-permissions";
import { cn } from "@/lib/utils";

const inputClass = cn(
  "w-full rounded-xl border border-border/50 bg-card/60 px-4 py-2.5",
  "text-xs text-primary-foreground placeholder:text-muted-foreground/50",
  "backdrop-blur-[16px] transition-all duration-200",
  "focus:border-primary/50 focus:outline-none focus:ring-2 focus:ring-primary/20"
);

export default function DocumentTemplatesPage() {
  const router = useRouter();
  const { documents: docPermissions } = useAppPermissions();
  const { canEditTemplates } = docPermissions;

  const { templates, updateTemplateLayout } = useDocuments();
  const [selectedTmplId, setSelectedTmplId] = useState("");
  
  // Edit Form States
  const [layoutHtml, setLayoutHtml] = useState("");
  const [stylesJson, setStylesJson] = useState("");
  const [signatureUrl, setSignatureUrl] = useState("");
  const [isSaving, setIsSaving] = useState(false);
  const [successMsg, setSuccessMsg] = useState("");

  const activeTemplate = useMemo(() => {
    const found = templates.find((t) => t.id === selectedTmplId);
    if (found) {
      // Sync form states on active template switch
      setLayoutHtml(found.html_layout);
      setStylesJson(JSON.stringify(found.stylesheet_tokens, null, 2));
      setSignatureUrl(found.signature_asset_url || "");
    }
    return found || null;
  }, [selectedTmplId, templates]);

  // Handle template selection change
  const handleSelectTemplate = (id: string) => {
    setSelectedTmplId(id);
    setSuccessMsg("");
  };

  const handleSaveLayout = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeTemplate) return;

    setIsSaving(true);
    setSuccessMsg("");

    try {
      // Validate Styles JSON
      let parsedTokens: Record<string, string> = {};
      try {
        parsedTokens = JSON.parse(stylesJson);
      } catch (err) {
        throw new Error("Invalid Stylesheet tokens format. Must be a valid JSON dictionary.");
      }

      await updateTemplateLayout(activeTemplate.id, layoutHtml, parsedTokens);
      setSuccessMsg("Layout template updated successfully to a new version.");
      setTimeout(() => setSuccessMsg(""), 4000);
    } catch (err: any) {
      alert(err.message || "Failed to save template.");
    } finally {
      setIsSaving(false);
    }
  };

  if (!canEditTemplates) {
    return (
      <div className="p-8 max-w-md mx-auto text-center space-y-4">
        <div className="bg-red-500/10 text-red-400 p-4 rounded-xl border border-red-500/20 font-semibold flex items-center justify-center gap-2">
          <ShieldAlert className="h-5 w-5" />
          Access Denied
        </div>
        <p className="text-sm text-muted-foreground">
          You do not have permission to manage document design templates.
        </p>
      </div>
    );
  }

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      {/* Breadcrumbs */}
      <button
        onClick={() => router.push("/dashboard/documents")}
        className="inline-flex items-center gap-1 text-xs text-muted-foreground hover:text-primary-foreground transition-colors"
      >
        <ArrowLeft className="h-4 w-4" />
        Back to Document Center
      </button>

      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-primary-foreground">
          Document Template Manager
        </h1>
        <p className="text-sm text-muted-foreground">
          Edit standardized layout skeletons and stylesheet rules for certificates and giving reports.
        </p>
      </div>

      <div className="grid gap-6 md:grid-cols-3">
        {/* Templates Selection Roster */}
        <div className="space-y-4 border border-border/40 rounded-2xl bg-card/20 p-5 backdrop-blur-glass shadow-glass h-fit">
          <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider">Select Template</h3>
          <div className="space-y-2">
            {templates.map((tmpl) => (
              <button
                key={tmpl.id}
                onClick={() => handleSelectTemplate(tmpl.id)}
                className={cn(
                  "w-full text-left p-3.5 rounded-xl border text-xs font-semibold backdrop-blur-glass transition-all duration-300",
                  selectedTmplId === tmpl.id
                    ? "border-primary bg-primary/10 text-primary shadow-[0_0_12px_rgba(99,102,241,0.2)]"
                    : "border-border/50 bg-card/40 text-muted-foreground hover:text-primary-foreground hover:bg-slate-900/60"
                )}
              >
                <div className="flex justify-between items-center mb-1">
                  <span className="text-[9px] uppercase font-bold tracking-wider">{tmpl.category}</span>
                  <span className="font-mono text-[9px] opacity-60">v{tmpl.template_version}</span>
                </div>
                <div className="font-bold text-primary-foreground">{tmpl.name}</div>
              </button>
            ))}
          </div>
        </div>

        {/* Templates Editor Canvas */}
        <div className="md:col-span-2">
          {activeTemplate ? (
            <motion.form
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              onSubmit={handleSaveLayout}
              className="space-y-6 border border-border/40 rounded-2xl bg-card/20 p-6 backdrop-blur-glass shadow-glass"
            >
              <div className="flex items-center justify-between border-b border-border/30 pb-4">
                <div>
                  <h4 className="font-bold text-primary-foreground">{activeTemplate.name}</h4>
                  <p className="text-[10px] text-muted-foreground">Layout category: {activeTemplate.category} | Current Version: v{activeTemplate.template_version}</p>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    type="submit"
                    disabled={isSaving}
                    className="flex items-center gap-1.5 rounded-xl bg-primary px-4 py-2.5 text-xs font-semibold text-primary-foreground shadow-neon hover:brightness-110 disabled:opacity-50 transition-all"
                  >
                    <Save className="h-4 w-4" />
                    Save Layout
                  </button>
                </div>
              </div>

              {successMsg && (
                <div className="bg-emerald-500/10 border border-emerald-500/30 rounded-xl p-3.5 text-xs text-emerald-400 flex items-center gap-2">
                  <CheckCircle className="h-4 w-4" />
                  {successMsg}
                </div>
              )}

              {/* HTML Layout Input */}
              <div className="space-y-2">
                <label className="block text-xs font-semibold text-slate-400 flex items-center gap-1">
                  <Code className="h-4 w-4 text-indigo-400" />
                  HTML Document skeleton
                </label>
                <textarea
                  value={layoutHtml}
                  onChange={(e) => setLayoutHtml(e.target.value)}
                  rows={8}
                  className={cn(inputClass, "font-mono leading-relaxed resize-y")}
                  placeholder="<h1>Document Title</h1>..."
                  required
                />
              </div>

              {/* Styles tokens input */}
              <div className="space-y-2">
                <label className="block text-xs font-semibold text-slate-400">Stylesheet Design Tokens (JSON dictionary)</label>
                <textarea
                  value={stylesJson}
                  onChange={(e) => setStylesJson(e.target.value)}
                  rows={5}
                  className={cn(inputClass, "font-mono leading-relaxed resize-y")}
                  placeholder='{ "primaryColor": "#000" }'
                  required
                />
              </div>

              {/* Signature Asset details */}
              <div>
                <label className="block text-xs font-semibold text-slate-400 mb-1.5">Signature Asset URL</label>
                <input
                  type="text"
                  value={signatureUrl}
                  onChange={(e) => setSignatureUrl(e.target.value)}
                  placeholder="https://s3.amazonaws.com/signatures/pastor.png"
                  className={inputClass}
                />
              </div>

              <div className="bg-indigo-500/5 border border-indigo-500/20 rounded-xl p-4 text-xs text-indigo-400 flex items-start gap-2.5 leading-relaxed">
                <Sparkles className="h-5 w-5 shrink-0 mt-0.5" />
                <div>
                  <p className="font-semibold mb-1">Standard Certificate Governance rules</p>
                  <p className="text-[11px] text-slate-300">End-user layout customization is prohibited. All templates enforce standardized church brand guidelines. You may use dynamic merge fields like <code>{"{{member_name}}"}</code>, <code>{"{{baptism_date}}"}</code>, or <code>{"{{year}}"}</code> to bind source database keys.</p>
                </div>
              </div>
            </motion.form>
          ) : (
            <div className="rounded-2xl border border-border/40 bg-card/10 p-12 text-center text-xs text-muted-foreground flex items-center justify-center h-full min-h-[300px]">
              Choose a document layout from the list on the left to start editing.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
