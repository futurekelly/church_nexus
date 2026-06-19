"use client";

import { useMediaAssets } from "@/features/media";
import { useAppPermissions } from "@/hooks/use-app-permissions";
import { useAuth } from "@/hooks/use-auth";
import {
  Search,
  Plus,
  Video,
  Music,
  Image as ImageIcon,
  FileText,
  FolderOpen,
  Download,
  Eye,
  Trash2,
  RotateCcw,
  SlidersHorizontal,
  ChevronLeft,
  ChevronRight,
  Database,
  DownloadCloud,
  FileCode,
  Archive
} from "lucide-react";
import Link from "next/link";
import { cn } from "@/lib/utils";
import { useState } from "react";

export default function MediaDirectoryPage() {
  const { media: permissions } = useAppPermissions();
  const { user } = useAuth();
  
  const {
    assets,
    pagination,
    collections,
    loading,
    filters,
    updateFilters,
    archiveAsset,
    restoreAsset,
    downloadAsset
  } = useMediaAssets();

  const [localSearch, setLocalSearch] = useState(filters.search || "");

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    updateFilters({ search: localSearch });
  };

  const handleResetFilters = () => {
    setLocalSearch("");
    updateFilters({
      search: "",
      type: "all",
      category: "all",
      showArchived: false,
      page: 1
    });
  };

  const getFileIcon = (type: string) => {
    switch (type) {
      case "video":
        return <Video className="h-5 w-5 text-indigo-400" />;
      case "audio":
        return <Music className="h-5 w-5 text-emerald-400" />;
      case "image":
        return <ImageIcon className="h-5 w-5 text-pink-400" />;
      default:
        return <FileText className="h-5 w-5 text-amber-400" />;
    }
  };

  const formatBytes = (bytes: number, decimals = 2) => {
    if (bytes === 0) return "0 Bytes";
    const k = 1024;
    const dm = decimals < 0 ? 0 : decimals;
    const sizes = ["Bytes", "KB", "MB", "GB", "TB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + " " + sizes[i];
  };

  // Calculate sum counts for local display metrics
  const totalAssetsCount = pagination.count;
  const totalDownloadsCount = assets.reduce((sum, a) => sum + a.download_count, 0);

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-8">
      {/* Header banner */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between border-b border-border/30 pb-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-primary-foreground font-display flex items-center gap-2">
            <FolderOpen className="h-6 w-6 text-indigo-400" />
            Media & Asset Library
          </h1>
          <p className="text-xs text-muted-foreground mt-0.5">
            Manage, upload, and organize liturgical documents, sermon videos, event cover designs, and files.
          </p>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <Link
            href="/dashboard/media/collections"
            className="inline-flex h-9 items-center gap-1.5 rounded-xl border border-border/50 bg-card/60 px-4 text-xs font-semibold text-slate-300 hover:text-primary-foreground hover:bg-slate-900 transition-all"
          >
            <span>Manage Collections</span>
          </Link>

          {permissions.canManage && (
            <Link
              href="/dashboard/media/upload"
              className="inline-flex h-9 items-center gap-1.5 rounded-xl bg-indigo-500 px-4 text-xs font-semibold text-white hover:bg-indigo-600 transition-all shadow-neon"
            >
              <Plus className="h-4 w-4" />
              <span>Upload Asset</span>
            </Link>
          )}
        </div>
      </div>

      {/* KPI Stats Widgets */}
      <div className="grid gap-4 sm:grid-cols-3">
        <div className="glass-panel p-5 rounded-2xl border border-border/40 flex items-center gap-4">
          <div className="h-10 w-10 rounded-xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center">
            <Database className="h-5 w-5 text-indigo-400" />
          </div>
          <div>
            <p className="text-[10px] text-muted-foreground uppercase font-bold tracking-wider">Library Index</p>
            <h3 className="text-xl font-bold text-primary-foreground mt-0.5">{totalAssetsCount} Assets</h3>
          </div>
        </div>

        <div className="glass-panel p-5 rounded-2xl border border-border/40 flex items-center gap-4">
          <div className="h-10 w-10 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center">
            <DownloadCloud className="h-5 w-5 text-emerald-400" />
          </div>
          <div>
            <p className="text-[10px] text-muted-foreground uppercase font-bold tracking-wider">Total Downloads</p>
            <h3 className="text-xl font-bold text-primary-foreground mt-0.5">{totalDownloadsCount} Reads</h3>
          </div>
        </div>

        <div className="glass-panel p-5 rounded-2xl border border-border/40 flex items-center gap-4">
          <div className="h-10 w-10 rounded-xl bg-pink-500/10 border border-pink-500/20 flex items-center justify-center">
            <FileCode className="h-5 w-5 text-pink-400" />
          </div>
          <div>
            <p className="text-[10px] text-muted-foreground uppercase font-bold tracking-wider">Active Branch</p>
            <h3 className="text-xl font-bold text-primary-foreground mt-0.5 font-mono uppercase">
              {((user as any)?.branch_id || "Sinza").replace("branch-", "Campus ")}
            </h3>
          </div>
        </div>
      </div>

      {/* Search & Filter Options Bar */}
      <div className="glass-panel p-5 rounded-2xl border border-border/30 space-y-4">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <form onSubmit={handleSearchSubmit} className="relative flex-1 max-w-md">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <input
              type="text"
              placeholder="Search assets by name or file..."
              value={localSearch}
              onChange={(e) => setLocalSearch(e.target.value)}
              className="w-full h-10 pl-10 pr-4 rounded-xl border border-border/40 bg-slate-900/50 text-xs text-primary-foreground placeholder:text-muted-foreground focus:outline-none focus:border-indigo-500 transition-all"
            />
            {localSearch && (
              <button
                type="submit"
                className="absolute right-2 top-1/2 -translate-y-1/2 text-[10px] bg-slate-800 border border-border/30 px-2 py-1 rounded text-slate-300 hover:text-white"
              >
                Find
              </button>
            )}
          </form>

          {/* Quick Filters */}
          <div className="flex flex-wrap items-center gap-3">
            {/* File Type Filter */}
            <div className="flex items-center gap-1.5 bg-slate-900/40 border border-border/40 px-3 py-1 rounded-xl">
              <SlidersHorizontal className="h-3.5 w-3.5 text-slate-400" />
              <select
                value={filters.type}
                onChange={(e) => updateFilters({ type: e.target.value })}
                className="bg-transparent text-xs text-slate-200 border-none outline-none cursor-pointer focus:ring-0"
              >
                <option value="all">All File Types</option>
                <option value="video">Videos</option>
                <option value="audio">Audio</option>
                <option value="image">Images</option>
                <option value="document">Documents</option>
              </select>
            </div>

            {/* Category Filter */}
            <div className="flex items-center gap-1.5 bg-slate-900/40 border border-border/40 px-3 py-1 rounded-xl">
              <select
                value={filters.category}
                onChange={(e) => updateFilters({ category: e.target.value })}
                className="bg-transparent text-xs text-slate-200 border-none outline-none cursor-pointer focus:ring-0"
              >
                <option value="all">All Categories</option>
                <option value="Sermon">Sermons</option>
                <option value="Event">Events</option>
                <option value="Social">Social</option>
                <option value="Document">Documents</option>
                <option value="Other">Other</option>
              </select>
            </div>

            {/* Archived Filter (Permissions Gated) */}
            {permissions.canManage && (
              <button
                onClick={() => updateFilters({ showArchived: !filters.showArchived })}
                className={cn(
                  "inline-flex h-8 items-center gap-1.5 rounded-xl border px-3 text-xs font-medium transition-all",
                  filters.showArchived
                    ? "border-pink-500/50 bg-pink-500/10 text-pink-400"
                    : "border-border/40 bg-slate-900/40 text-slate-400 hover:text-slate-200"
                )}
              >
                <Archive className="h-3.5 w-3.5" />
                <span>Show Archived</span>
              </button>
            )}

            {/* Reset Filter Button */}
            <button
              onClick={handleResetFilters}
              className="h-8 rounded-xl border border-border/30 px-3 text-xs font-semibold text-slate-400 hover:text-primary-foreground hover:bg-slate-900 transition-all"
            >
              Clear
            </button>
          </div>
        </div>
      </div>

      {/* Grid of Assets */}
      {loading ? (
        <div className="flex flex-col items-center justify-center py-24 space-y-3">
          <div className="h-8 w-8 animate-spin rounded-full border-2 border-indigo-500 border-t-transparent"></div>
          <p className="text-xs text-slate-400">Loading catalog items safely...</p>
        </div>
      ) : assets.length > 0 ? (
        <div className="space-y-6">
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {assets.map((asset) => (
              <div
                key={asset.id}
                className={cn(
                  "group relative flex flex-col justify-between overflow-hidden rounded-2xl border bg-card/60 transition-all duration-300 shadow-glass",
                  asset.is_archived
                    ? "border-pink-500/30 bg-gradient-to-b from-pink-500/5 to-transparent"
                    : "border-border/50 hover:border-indigo-500/30"
                )}
              >
                {/* Media Thumbnail Container */}
                <div className="relative aspect-video w-full bg-slate-950/60 overflow-hidden flex items-center justify-center">
                  {asset.file_type === "image" && asset.thumbnail_url ? (
                    <img
                      src={asset.thumbnail_url}
                      alt={asset.title}
                      className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
                      loading="lazy"
                    />
                  ) : (
                    <div className="h-12 w-12 rounded-2xl bg-slate-900 border border-border/30 flex items-center justify-center">
                      {getFileIcon(asset.file_type)}
                    </div>
                  )}

                  {/* Top-Right Tags */}
                  <div className="absolute top-2 right-2 flex flex-col gap-1 items-end">
                    <span className="rounded bg-slate-900/85 text-[9px] font-bold text-slate-300 px-2 py-0.5 backdrop-blur-sm border border-border/25">
                      {asset.category}
                    </span>
                    {!asset.is_public && (
                      <span className="rounded bg-rose-500/90 text-[8px] font-bold text-white px-1.5 py-0.5">
                        Private
                      </span>
                    )}
                    {asset.status !== "Ready" && (
                      <span className="rounded bg-yellow-500/90 text-[8px] font-bold text-slate-950 px-1.5 py-0.5 animate-pulse">
                        {asset.status}
                      </span>
                    )}
                  </div>
                </div>

                {/* Detail text */}
                <div className="p-4 space-y-2 flex-1 flex flex-col justify-between">
                  <div className="space-y-1">
                    <h3 className="font-display text-sm font-bold text-primary-foreground leading-tight group-hover:text-indigo-400 transition-colors line-clamp-1">
                      {asset.title}
                    </h3>
                    <p className="text-[11px] text-muted-foreground line-clamp-2 leading-normal">
                      {asset.description || "No description provided."}
                    </p>
                  </div>

                  <div className="pt-3 border-t border-border/30 flex items-center justify-between text-[10px] text-slate-500 font-mono">
                    <span>{formatBytes(asset.file_size)}</span>
                    <span className="flex items-center gap-0.5">
                      <Download className="h-3 w-3" />
                      {asset.download_count}
                    </span>
                  </div>
                </div>

                {/* Hover Hover-actions Drawer overlay */}
                <div className="p-3 bg-slate-900/95 border-t border-border/30 flex items-center justify-between gap-1 backdrop-blur-md">
                  <div className="flex items-center gap-1.5">
                    {/* View Details */}
                    <Link
                      href={`/dashboard/media/${asset.id}`}
                      className="inline-flex h-7 w-7 items-center justify-center rounded-lg border border-border/50 hover:bg-slate-800 text-slate-300 hover:text-white"
                      title="Open Asset Details"
                    >
                      <Eye className="h-3.5 w-3.5" />
                    </Link>

                    {/* Download link trigger */}
                    {asset.status === "Ready" && (
                      <a
                        href={asset.file_url}
                        target="_blank"
                        rel="noreferrer"
                        onClick={() => downloadAsset(asset.id)}
                        className="inline-flex h-7 w-7 items-center justify-center rounded-lg border border-border/50 hover:bg-slate-800 text-slate-300 hover:text-white"
                        title="Download Asset File"
                      >
                        <Download className="h-3.5 w-3.5" />
                      </a>
                    )}
                  </div>

                  {/* Admin soft deletes */}
                  {permissions.canManage && (
                    <div className="flex items-center gap-1">
                      {asset.is_archived ? (
                        <button
                          onClick={() => restoreAsset(asset.id)}
                          className="inline-flex h-7 px-2 items-center gap-1 rounded-lg border border-emerald-500/20 bg-emerald-500/10 text-[9px] font-bold text-emerald-400 hover:bg-emerald-500/25"
                          title="Restore Asset"
                        >
                          <RotateCcw className="h-3 w-3" />
                          <span>Restore</span>
                        </button>
                      ) : (
                        <button
                          onClick={() => archiveAsset(asset.id)}
                          className="inline-flex h-7 w-7 items-center justify-center rounded-lg border border-pink-500/20 bg-pink-500/10 hover:bg-pink-500/20 text-pink-400 hover:text-pink-300"
                          title="Soft-Delete Archive"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </button>
                      )}
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>

          {/* Pagination component */}
          {pagination.total_pages > 1 && (
            <div className="flex items-center justify-between border-t border-border/20 pt-6">
              <span className="text-xs text-muted-foreground font-medium">
                Showing page <span className="font-semibold text-primary-foreground">{pagination.page}</span> of{" "}
                <span className="font-semibold text-primary-foreground">{pagination.total_pages}</span> ({pagination.count} assets)
              </span>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => updateFilters({ page: pagination.page - 1 })}
                  disabled={!pagination.previous}
                  className="inline-flex h-8 items-center gap-1 rounded-lg border border-border/40 bg-card/60 px-3 text-xs font-semibold text-slate-300 disabled:opacity-40 disabled:pointer-events-none hover:bg-slate-900 hover:text-white transition-all"
                >
                  <ChevronLeft className="h-4 w-4" />
                  <span>Prev</span>
                </button>

                <button
                  onClick={() => updateFilters({ page: pagination.page + 1 })}
                  disabled={!pagination.next}
                  className="inline-flex h-8 items-center gap-1 rounded-lg border border-border/40 bg-card/60 px-3 text-xs font-semibold text-slate-300 disabled:opacity-40 disabled:pointer-events-none hover:bg-slate-900 hover:text-white transition-all"
                >
                  <span>Next</span>
                  <ChevronRight className="h-4 w-4" />
                </button>
              </div>
            </div>
          )}
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center py-20 text-center border border-dashed border-border/40 rounded-2xl bg-card/10">
          <FolderOpen className="h-10 w-10 text-muted-foreground mb-3 opacity-40" />
          <h3 className="text-sm font-bold text-primary-foreground font-display">No Assets Found</h3>
          <p className="text-xs text-muted-foreground mt-1 max-w-xs leading-normal">
            There are no media assets matching your filter selection. Click reset to clear.
          </p>
          <button
            onClick={handleResetFilters}
            className="mt-4 inline-flex h-8 items-center rounded-xl border border-border/40 bg-card/60 px-4 text-xs font-semibold text-slate-300 hover:bg-slate-900"
          >
            Reset Catalog
          </button>
        </div>
      )}
    </div>
  );
}
