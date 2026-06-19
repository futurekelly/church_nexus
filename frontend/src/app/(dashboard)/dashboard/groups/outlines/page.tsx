"use client";

import { useState } from "react";
import { useStudyOutlines } from "@/features/groups";
import { useAppPermissions } from "@/hooks/use-app-permissions";
import { BookOpen, Calendar, Plus, Save, Trash2, ArrowLeft } from "lucide-react";
import Link from "next/link";

export default function OutlinesLibraryPage() {
  const { outlines, addOutline, deleteOutline } = useStudyOutlines();
  const permissions = useAppPermissions();

  const [showForm, setShowForm] = useState(false);
  const [title, setTitle] = useState("");
  const [theme, setTheme] = useState("");
  const [scripture, setScripture] = useState("");
  const [intro, setIntro] = useState("");
  const [questions, setQuestions] = useState("");
  const [application, setApplication] = useState("");
  const [error, setError] = useState("");

  const canPublish = permissions.groups.canCreate; // pastors/admins can publish outlines

  const handlePublish = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title || !theme || !scripture || !intro || !questions || !application) {
      setError("All fields are required.");
      return;
    }

    try {
      addOutline({
        title,
        theme,
        scripture_references: scripture.split(",").map((s) => s.trim()),
        introduction: intro,
        discussion_questions: questions.split("\n").map((q) => q.trim()).filter((q) => q !== ""),
        application,
        created_by: permissions.userId ? String(permissions.userId) : "Pastor"
      });

      // Reset form
      setTitle("");
      setTheme("");
      setScripture("");
      setIntro("");
      setQuestions("");
      setApplication("");
      setShowForm(false);
      setError("");
    } catch (err: any) {
      setError(err.message || "Failed to publish outline.");
    }
  };

  return (
    <div className="p-6 max-w-5xl mx-auto space-y-6">
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
            <BookOpen className="h-6 w-6 text-indigo-400" />
            Study Outlines Library
          </h1>
          <p className="text-xs text-muted-foreground mt-0.5">
            Access weekly scriptures, outlines, and discussion questions for connect groups.
          </p>
        </div>

        {canPublish && !showForm && (
          <button
            onClick={() => setShowForm(true)}
            className="inline-flex items-center gap-1.5 rounded-lg bg-indigo-500 hover:bg-indigo-600 px-3.5 py-1.5 text-xs font-semibold text-white transition-colors"
          >
            <Plus className="h-3.5 w-3.5" />
            <span>Publish Outline</span>
          </button>
        )}
      </div>

      {/* Outlines Form */}
      {showForm && (
        <form onSubmit={handlePublish} className="bg-card/30 border border-border/40 rounded-2xl p-6 space-y-4 shadow-glass">
          <h3 className="text-sm font-bold text-primary-foreground font-display">Create Weekly Curricula Outline</h3>
          
          {error && (
            <div className="rounded-lg bg-rose-500/10 border border-rose-500/25 p-3 text-xs text-rose-400">
              {error}
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-300">Outline Title *</label>
              <input
                type="text"
                required
                placeholder="e.g. Walking in Obedience"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="w-full pl-3 pr-4 py-2 text-xs rounded-lg border border-border/40 bg-card/40 text-primary-foreground placeholder:text-muted-foreground focus:outline-none focus:border-indigo-500/50"
              />
            </div>
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-300">Theme / Category *</label>
              <input
                type="text"
                required
                placeholder="e.g. Discipleship"
                value={theme}
                onChange={(e) => setTheme(e.target.value)}
                className="w-full pl-3 pr-4 py-2 text-xs rounded-lg border border-border/40 bg-card/40 text-primary-foreground focus:outline-none focus:border-indigo-500/50"
              />
            </div>
            <div className="space-y-1.5 col-span-2">
              <label className="text-xs font-bold text-slate-300">Scriptures (Comma separated) *</label>
              <input
                type="text"
                required
                placeholder="e.g. Hebrews 11:1-6, James 2:14-26"
                value={scripture}
                onChange={(e) => setScripture(e.target.value)}
                className="w-full pl-3 pr-4 py-2 text-xs rounded-lg border border-border/40 bg-card/40 text-primary-foreground focus:outline-none focus:border-indigo-500/50"
              />
            </div>
            <div className="space-y-1.5 col-span-2">
              <label className="text-xs font-bold text-slate-300">Introduction Overview *</label>
              <textarea
                rows={3}
                required
                placeholder="Write the introduction summary context..."
                value={intro}
                onChange={(e) => setIntro(e.target.value)}
                className="w-full pl-3 pr-4 py-2 text-xs rounded-lg border border-border/40 bg-card/40 text-primary-foreground focus:outline-none focus:border-indigo-500/50"
              />
            </div>
            <div className="space-y-1.5 col-span-2">
              <label className="text-xs font-bold text-slate-300">Discussion Questions (One question per line) *</label>
              <textarea
                rows={3}
                required
                placeholder="Question 1&#10;Question 2&#10;Question 3"
                value={questions}
                onChange={(e) => setQuestions(e.target.value)}
                className="w-full pl-3 pr-4 py-2 text-xs rounded-lg border border-border/40 bg-card/40 text-primary-foreground focus:outline-none focus:border-indigo-500/50"
              />
            </div>
            <div className="space-y-1.5 col-span-2">
              <label className="text-xs font-bold text-slate-300">Practical Application Challenge *</label>
              <textarea
                rows={2}
                required
                placeholder="Explain the weekly action plan challenge..."
                value={application}
                onChange={(e) => setApplication(e.target.value)}
                className="w-full pl-3 pr-4 py-2 text-xs rounded-lg border border-border/40 bg-card/40 text-primary-foreground focus:outline-none focus:border-indigo-500/50"
              />
            </div>
          </div>

          <div className="flex items-center justify-end gap-3 pt-3 border-t border-border/20">
            <button
              type="button"
              onClick={() => setShowForm(false)}
              className="rounded-lg border border-border/50 bg-card/60 px-3.5 py-1.5 text-xs text-slate-300 hover:text-white"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="inline-flex items-center gap-1 rounded-lg bg-indigo-500 hover:bg-indigo-600 px-3.5 py-1.5 text-xs font-semibold text-white"
            >
              <Save className="h-3.5 w-3.5" />
              <span>Publish Guide</span>
            </button>
          </div>
        </form>
      )}

      {/* Outlines List */}
      <div className="space-y-4">
        {outlines.length > 0 ? (
          outlines.map((outline) => (
            <div key={outline.id} className="rounded-2xl border border-border/40 bg-card/40 p-5 shadow-glass space-y-4">
              <div className="flex items-start justify-between border-b border-border/20 pb-3">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="rounded bg-indigo-500/10 px-2 py-0.5 text-[9px] font-bold text-indigo-400 border border-indigo-500/25">
                      {outline.theme}
                    </span>
                    <span className="text-[10px] text-slate-500 flex items-center gap-1">
                      <Calendar className="h-3 w-3" />
                      {new Date(outline.published_at).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
                    </span>
                  </div>
                  <h3 className="text-sm font-bold text-primary-foreground">{outline.title}</h3>
                </div>

                {canPublish && (
                  <button
                    onClick={() => deleteOutline(outline.id)}
                    className="p-1.5 rounded-lg bg-slate-800 text-slate-400 hover:text-rose-400 hover:bg-rose-500/10 border border-border/30 transition-all"
                    aria-label="Delete outline"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </button>
                )}
              </div>

              {/* Outline Body */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-xs text-slate-300">
                {/* Intro & Scriptures */}
                <div className="md:col-span-2 space-y-3">
                  <div className="space-y-1">
                    <h4 className="font-bold text-primary-foreground text-xs uppercase tracking-wide text-indigo-400">Introduction</h4>
                    <p className="leading-relaxed text-slate-300 text-xs whitespace-pre-line">{outline.introduction}</p>
                  </div>
                  <div className="space-y-1">
                    <h4 className="font-bold text-primary-foreground text-xs uppercase tracking-wide text-indigo-400">Discussion Questions</h4>
                    <ol className="list-decimal pl-4 space-y-1 text-slate-300 text-xs">
                      {outline.discussion_questions.map((q, idx) => (
                        <li key={idx}>{q}</li>
                      ))}
                    </ol>
                  </div>
                </div>

                {/* Sidebar context */}
                <div className="bg-slate-900/40 rounded-xl p-4 border border-border/30 space-y-3">
                  <div className="space-y-1">
                    <h4 className="font-bold text-xs uppercase text-indigo-400">Scriptures</h4>
                    <div className="flex flex-wrap gap-1.5 pt-1">
                      {outline.scripture_references.map((ref, idx) => (
                        <span key={idx} className="rounded bg-slate-800 px-2 py-0.5 text-[10px] font-semibold text-slate-300 border border-border/40">
                          {ref}
                        </span>
                      ))}
                    </div>
                  </div>
                  <div className="space-y-1 pt-2 border-t border-border/20">
                    <h4 className="font-bold text-xs uppercase text-indigo-400">Application Challenge</h4>
                    <p className="leading-relaxed text-slate-400 italic text-[11px]">{outline.application}</p>
                  </div>
                </div>
              </div>
            </div>
          ))
        ) : (
          <div className="flex flex-col items-center justify-center py-20 text-center select-none border border-dashed border-border/40 rounded-2xl bg-card/10">
            <BookOpen className="h-10 w-10 text-muted-foreground mb-3 opacity-40" />
            <h3 className="text-sm font-bold text-primary-foreground font-display">No Outlines Published</h3>
            <p className="text-xs text-muted-foreground mt-1 max-w-xs leading-normal">
              No Connect Group study outlines are currently available in the directory.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
