"use client";

import { useMediaAssets } from "@/features/media";
import { useAppPermissions } from "@/hooks/use-app-permissions";
import {
  ArrowLeft,
  Folder,
  FolderPlus,
  Calendar,
  User,
  AlertCircle,
  Plus
} from "lucide-react";
import Link from "next/link";
import { useState } from "react";
import { cn } from "@/lib/utils";

export default function MediaCollectionsPage() {
  const { media: permissions } = useAppPermissions();
  const { collections, createCollection, loading } = useMediaAssets();

  // Create Collection Form states
  const [showForm, setShowForm] = useState(false);
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  const handleCreateCollection = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !description.trim()) {
      setErrorMsg("Please fill out all fields.");
      return;
    }

    setSaving(true);
    setErrorMsg(null);
    try {
      await createCollection(name, description);
      setName("");
      setDescription("");
      setShowForm(false);
    } catch (err: any) {
      setErrorMsg(err?.message || "Failed to create collection.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="p-6 max-w-5xl mx-auto space-y-6">
      {/* Back Link */}
      <div className="flex items-center gap-2">
        <Link
          href="/dashboard/media"
          className="inline-flex h-8 w-8 items-center justify-center rounded-lg border border-border/40 hover:bg-slate-900 text-slate-400 hover:text-white"
        >
          <ArrowLeft className="h-4 w-4" />
        </Link>
        <span className="text-xs text-muted-foreground">Back to Library Directory</span>
      </div>

      {/* Title */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between border-b border-border/30 pb-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-primary-foreground font-display flex items-center gap-2">
            <Folder className="h-6 w-6 text-indigo-400" />
            Media Collections
          </h1>
          <p className="text-xs text-muted-foreground mt-0.5">
            Organize assets into custom directories (e.g., specific ministries, sermon series, or financial years).
          </p>
        </div>

        {permissions.canManage && !showForm && (
          <button
            onClick={() => setShowForm(true)}
            className="inline-flex h-9 items-center gap-1.5 rounded-xl bg-indigo-500 px-4 text-xs font-semibold text-white hover:bg-indigo-600 transition-all shadow-neon"
          >
            <FolderPlus className="h-4 w-4" />
            <span>New Folder</span>
          </button>
        )}
      </div>

      {/* Creation form */}
      {showForm && (
        <div className="glass-panel p-6 rounded-2xl border border-border/50 max-w-xl space-y-4">
          <h3 className="text-sm font-bold text-primary-foreground font-display flex items-center gap-1.5">
            <FolderPlus className="h-4 w-4 text-indigo-400" />
            Create Asset Collection Folder
          </h3>
          
          {errorMsg && (
            <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/25 text-xs text-rose-400">
              {errorMsg}
            </div>
          )}

          <form onSubmit={handleCreateCollection} className="space-y-4">
            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-300">Folder Name *</label>
              <input
                type="text"
                placeholder="e.g. Easter Youth Retreat 2026"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full h-10 px-4 rounded-xl border border-border/40 bg-slate-900/40 text-xs text-primary-foreground placeholder:text-muted-foreground focus:outline-none focus:border-indigo-500"
                required
              />
            </div>

            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-300">Folder Description *</label>
              <textarea
                placeholder="Describe what type of media assets will belong to this collection..."
                rows={3}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="w-full p-4 rounded-xl border border-border/40 bg-slate-900/40 text-xs text-primary-foreground placeholder:text-muted-foreground focus:outline-none focus:border-indigo-500 resize-none"
                required
              ></textarea>
            </div>

            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setShowForm(false)}
                className="h-8 rounded-xl border border-border/40 px-3 text-xs font-semibold text-slate-400 hover:text-slate-200"
                disabled={saving}
              >
                Cancel
              </button>
              <button
                type="submit"
                className="h-8 rounded-xl bg-indigo-500 px-4 text-xs font-semibold text-white hover:bg-indigo-600 flex items-center gap-1"
                disabled={saving}
              >
                {saving ? "Creating..." : "Create Folder"}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Grid of folders */}
      {loading ? (
        <div className="flex items-center justify-center py-20">
          <Loader2 className="h-8 w-8 animate-spin text-indigo-400" />
        </div>
      ) : collections.length > 0 ? (
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {collections.map((col) => {
            const formattedDate = new Date(col.created_at).toLocaleDateString("en-US", {
              year: "numeric",
              month: "short",
              day: "numeric"
            });

            return (
              <div
                key={col.id}
                className="group relative flex flex-col justify-between p-6 rounded-2xl border border-border/40 bg-card/60 hover:border-indigo-500/30 transition-all duration-300 shadow-glass"
              >
                <div className="space-y-4">
                  {/* Folder Icon header */}
                  <div className="flex items-center justify-between">
                    <div className="h-10 w-10 rounded-xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center group-hover:bg-indigo-500/20 transition-all">
                      <Folder className="h-5 w-5 text-indigo-400" />
                    </div>
                    
                    <span className="text-[10px] text-muted-foreground flex items-center gap-1 font-mono">
                      <Calendar className="h-3.5 w-3.5" />
                      {formattedDate}
                    </span>
                  </div>

                  {/* Title & Description */}
                  <div className="space-y-1">
                    <h3 className="font-display text-sm font-bold text-primary-foreground leading-tight">
                      {col.name}
                    </h3>
                    <p className="text-xs text-muted-foreground leading-relaxed line-clamp-3">
                      {col.description}
                    </p>
                  </div>
                </div>

                <div className="mt-6 border-t border-border/30 pt-4 flex items-center justify-between text-[10px] text-slate-500 font-medium">
                  {/* Author Name */}
                  <div className="flex items-center gap-1 text-slate-300">
                    <User className="h-3 w-3 text-slate-400" />
                    <span>Created by Admin</span>
                  </div>
                  
                  <Link
                    href={`/dashboard/media?collection=${col.id}`}
                    className="text-xs text-indigo-400 hover:text-indigo-300 font-semibold flex items-center gap-0.5"
                  >
                    <span>Open Folder</span>
                  </Link>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center py-20 text-center border border-dashed border-border/40 rounded-2xl bg-card/10">
          <Folder className="h-10 w-10 text-muted-foreground mb-3 opacity-40" />
          <h3 className="text-sm font-bold text-primary-foreground font-display">No Custom Collections</h3>
          <p className="text-xs text-muted-foreground mt-1 max-w-xs leading-normal">
            No custom media directories exist for this campus yet. Create one above to begin organizing.
          </p>
        </div>
      )}
    </div>
  );
}

// Simple loader helper inline
function Loader2(props: any) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={cn("animate-spin", props.className)}
      {...props}
    >
      <path d="M21 12a9 9 0 1 1-6.219-8.56" />
    </svg>
  );
}
