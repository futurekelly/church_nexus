"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { motion, AnimatePresence } from "framer-motion";
import { Mail, ArrowLeft, Plus, Edit2, ShieldAlert, Lock, Trash2, Check, X } from "lucide-react";
import Link from "next/link";
import { useAppPermissions } from "@/hooks/use-app-permissions";
import { useNotificationTemplates } from "@/features/notifications";
import type { NotificationTemplate } from "@/features/notifications";
import { cn } from "@/lib/utils";

const inputClass = cn(
  "w-full rounded-xl border border-border/50 bg-card/60 px-4 py-2 text-xs",
  "text-primary-foreground placeholder:text-muted-foreground/50 focus:border-indigo-500/50 focus:outline-none"
);

const labelClass = "block text-[10px] font-semibold text-muted-foreground mb-1 uppercase tracking-wider";

export default function TemplatesSettingsPage() {
  const { notifications: permissions } = useAppPermissions();
  const { templates, addTemplate, updateTemplate, deleteTemplate } = useNotificationTemplates();
  
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingTemplate, setEditingTemplate] = useState<NotificationTemplate | null>(null);

  const { register, handleSubmit, reset } = useForm<Omit<NotificationTemplate, "id">>();

  // Guard: Only Super Admin and Church Admin can manage templates
  if (!permissions.canManage) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] text-center p-6 select-none">
        <div className="rounded-2xl border border-border/40 bg-card/40 p-8 max-w-md backdrop-blur-glass shadow-glass">
          <Lock className="h-10 w-10 text-rose-400 mx-auto mb-4" />
          <h3 className="text-base font-bold text-primary-foreground font-display">Access Restricted</h3>
          <p className="text-xs text-muted-foreground mt-2">
            You do not have the required permissions to view or manage notification templates.
          </p>
        </div>
      </div>
    );
  }

  const openAddModal = () => {
    setEditingTemplate(null);
    reset({
      template_code: "",
      subject_template: "",
      body_template: "",
      channels: ["Email"],
      language: "sw"
    });
    setIsModalOpen(true);
  };

  const openEditModal = (template: NotificationTemplate) => {
    setEditingTemplate(template);
    reset({
      template_code: template.template_code,
      subject_template: template.subject_template || "",
      body_template: template.body_template,
      channels: template.channels,
      language: template.language
    });
    setIsModalOpen(true);
  };

  const onSubmit = (data: Omit<NotificationTemplate, "id">) => {
    if (editingTemplate) {
      updateTemplate(editingTemplate.id, data);
    } else {
      addTemplate(data);
    }
    setIsModalOpen(false);
  };

  return (
    <div className="p-6 max-w-5xl mx-auto space-y-8">
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
              <Mail className="h-6 w-6 text-indigo-400" />
              Notification Templates
            </h1>
            <p className="text-xs text-muted-foreground mt-0.5">
              Customize language layout dictionaries for automated system emails and SMS dispatches.
            </p>
          </div>
        </div>

        <button
          type="button"
          onClick={openAddModal}
          className="inline-flex items-center gap-2 rounded-xl bg-indigo-500 px-4 py-2 text-xs font-semibold text-white transition-all hover:bg-indigo-600 shadow-neon"
        >
          <Plus className="h-4 w-4" />
          <span>Add Template</span>
        </button>
      </div>

      {/* Main Grid */}
      <div className="grid gap-6 sm:grid-cols-2">
        {templates.map((template) => (
          <div
            key={template.id}
            className="rounded-2xl border border-border/40 bg-card/60 p-6 backdrop-blur-glass shadow-glass flex flex-col justify-between hover:border-indigo-500/20 transition-all"
          >
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="font-mono text-xs font-bold text-slate-300">{template.template_code}</span>
                <span className="rounded-lg bg-indigo-500/10 px-2 py-0.5 text-[9px] font-semibold text-indigo-400 border border-indigo-500/20 uppercase">
                  {template.language}
                </span>
              </div>

              {template.subject_template && (
                <div className="text-xs font-bold text-slate-200">
                  Subject: <span className="font-normal text-slate-300">{template.subject_template}</span>
                </div>
              )}

              <p className="text-xs text-muted-foreground font-mono bg-slate-900/40 p-3 rounded-xl border border-border/20 leading-relaxed whitespace-pre-line">
                {template.body_template}
              </p>
            </div>

            <div className="mt-6 border-t border-border/30 pt-4 flex items-center justify-between">
              <div className="flex gap-1.5">
                {template.channels.map((chan) => (
                  <span key={chan} className="text-[9px] font-semibold bg-slate-800 text-slate-400 rounded px-1.5 py-0.5">
                    {chan}
                  </span>
                ))}
              </div>

              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => openEditModal(template)}
                  className="inline-flex h-7 w-7 items-center justify-center rounded-lg bg-slate-800 text-slate-400 border border-border/40 hover:text-indigo-400 hover:bg-indigo-500/10 hover:border-indigo-500/20 transition-all"
                  aria-label="Edit template"
                >
                  <Edit2 className="h-3.5 w-3.5" />
                </button>
                <button
                  type="button"
                  onClick={() => deleteTemplate(template.id)}
                  className="inline-flex h-7 w-7 items-center justify-center rounded-lg bg-slate-800 text-slate-400 border border-border/40 hover:text-rose-400 hover:bg-rose-500/10 hover:border-rose-500/20 transition-all"
                  aria-label="Delete template"
                >
                  <Trash2 className="h-3.5 w-3.5" />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Add/Edit Modal */}
      <AnimatePresence>
        {isModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-sm p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="w-full max-w-md rounded-2xl border border-border/50 bg-card p-6 shadow-glass"
            >
              <h3 className="font-display text-lg font-bold text-primary-foreground mb-4">
                {editingTemplate ? "Edit Template" : "Add Notification Template"}
              </h3>

              <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                {/* Template Code */}
                <div>
                  <label htmlFor="template_code" className={labelClass}>Template Identifier *</label>
                  <input
                    id="template_code"
                    type="text"
                    placeholder="e.g. WELCOME_GUEST"
                    className={inputClass}
                    required
                    {...register("template_code", { required: true })}
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  {/* Language */}
                  <div>
                    <label htmlFor="language" className={labelClass}>Language</label>
                    <select id="language" className={inputClass} {...register("language")}>
                      <option value="sw">Swahili</option>
                      <option value="en">English</option>
                    </select>
                  </div>

                  {/* Channels MultiSelect simulation */}
                  <div>
                    <label htmlFor="channels" className={labelClass}>Channel Type</label>
                    <select id="channels" className={inputClass} multiple {...register("channels")}>
                      <option value="Email">Email</option>
                      <option value="SMS">SMS</option>
                      <option value="Push">Push</option>
                    </select>
                    <span className="text-[9px] text-muted-foreground mt-1 block">Hold Ctrl to select multiple</span>
                  </div>
                </div>

                {/* Subject Template */}
                <div>
                  <label htmlFor="subject_template" className={labelClass}>Subject Template (Email Only)</label>
                  <input
                    id="subject_template"
                    type="text"
                    placeholder="e.g. Welcome to {{church_name}}!"
                    className={inputClass}
                    {...register("subject_template")}
                  />
                </div>

                {/* Body Template */}
                <div>
                  <label htmlFor="body_template" className={labelClass}>Body Content Template *</label>
                  <textarea
                    id="body_template"
                    rows={5}
                    placeholder="Template text with {{placeholder}} variables..."
                    className={cn(inputClass, "resize-none")}
                    required
                    {...register("body_template", { required: true })}
                  />
                </div>

                {/* Actions */}
                <div className="mt-6 flex justify-end gap-3 border-t border-border/30 pt-4">
                  <button
                    type="button"
                    onClick={() => setIsModalOpen(false)}
                    className="rounded-xl border border-border/50 bg-card px-4 py-2 text-xs font-semibold text-muted-foreground hover:text-primary-foreground transition-all"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="rounded-xl bg-indigo-500 px-5 py-2 text-xs font-semibold text-white hover:bg-indigo-600 transition-all"
                  >
                    Save Template
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
