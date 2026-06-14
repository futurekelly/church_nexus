"use client";

import { useState } from "react";
import { Play, Square, MessageSquareOff, UserCheck, RefreshCw, Edit, Settings } from "lucide-react";
import type { LivestreamStatus } from "../types/livestream.types";
import { cn } from "@/lib/utils";

interface ModeratorControlsProps {
  stream: LivestreamStatus | null;
  mutedUsers: string[];
  onUpdateSettings: (settings: Partial<LivestreamStatus>) => void;
  onClearChat: () => void;
  onUnmuteUser: (username: string) => void;
  onResetAll: () => void;
}

const inputClass = cn(
  "w-full rounded-xl border border-border/50 bg-card/60 px-4 py-2.5",
  "text-sm text-primary-foreground placeholder:text-muted-foreground/50",
  "backdrop-blur-[16px] transition-all duration-200",
  "focus:border-primary/50 focus:outline-none focus:ring-2 focus:ring-primary/20"
);

const labelClass = "block text-xs font-medium text-muted-foreground mb-1.5";

export function ModeratorControls({
  stream,
  mutedUsers,
  onUpdateSettings,
  onClearChat,
  onUnmuteUser,
  onResetAll,
}: ModeratorControlsProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [title, setTitle] = useState(stream?.title ?? "");
  const [preacher, setPreacher] = useState(stream?.preacher ?? "");
  const [description, setDescription] = useState(stream?.description ?? "");
  const [streamUrl, setStreamUrl] = useState(stream?.stream_url ?? "");

  const handleStartStream = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !preacher.trim() || !streamUrl.trim()) return;

    onUpdateSettings({
      is_live: true,
      title: title.trim(),
      preacher: preacher.trim(),
      description: description.trim(),
      stream_url: streamUrl.trim(),
      started_at: new Date().toISOString(),
      viewer_count: Math.floor(Math.random() * 50) + 100, // Starts with random viewers
    });
    setIsEditing(false);
  };

  const handleEndStream = () => {
    onUpdateSettings({
      is_live: false,
      viewer_count: 0,
    });
  };

  const startEditMode = () => {
    if (stream) {
      setTitle(stream.title);
      setPreacher(stream.preacher);
      setDescription(stream.description);
      setStreamUrl(stream.stream_url);
    }
    setIsEditing(true);
  };

  if (!stream) return null;

  return (
    <div className="rounded-2xl border border-border/50 bg-card/60 p-6 backdrop-blur-glass shadow-glass space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-border/40 pb-4">
        <h3 className="text-sm font-bold text-primary-foreground flex items-center gap-1.5">
          <Settings className="h-4.5 w-4.5 text-indigo-400" />
          <span>Moderator Control Console</span>
        </h3>
        <button
          type="button"
          onClick={onResetAll}
          className="inline-flex items-center gap-1 text-[10px] text-muted-foreground hover:text-primary-foreground hover:bg-slate-900/60 border border-border/20 px-2 py-1 rounded-lg transition-all"
        >
          <RefreshCw className="h-3 w-3" />
          Reset State
        </button>
      </div>

      {/* Editing stream or active stream display */}
      {isEditing ? (
        <form onSubmit={handleStartStream} className="space-y-4">
          <h4 className="text-xs font-bold text-indigo-400">Configure Broadcast details</h4>

          <div className="space-y-3">
            <div>
              <label className={labelClass}>Broadcast Title *</label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g. Sunday Morning Celebration"
                className={inputClass}
                required
              />
            </div>
            <div>
              <label className={labelClass}>Speaker / Preacher *</label>
              <input
                type="text"
                value={preacher}
                onChange={(e) => setPreacher(e.target.value)}
                placeholder="e.g. Sir. Kelvin Mbise"
                className={inputClass}
                required
              />
            </div>
            <div>
              <label className={labelClass}>Stream URL / Source Link *</label>
              <input
                type="text"
                value={streamUrl}
                onChange={(e) => setStreamUrl(e.target.value)}
                placeholder="e.g. https://domain.com/video.mp4"
                className={inputClass}
                required
              />
            </div>
            <div>
              <label className={labelClass}>Short Description</label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                rows={2}
                placeholder="Brief description of the sermon or scripture refer..."
                className={cn(inputClass, "resize-none")}
              />
            </div>
          </div>

          <div className="flex gap-2 justify-end pt-2">
            <button
              type="button"
              onClick={() => setIsEditing(false)}
              className="rounded-xl border border-border/50 bg-card/40 px-4 py-2 text-xs font-semibold text-muted-foreground hover:text-primary-foreground hover:bg-slate-900/40"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="rounded-xl bg-primary px-4 py-2 text-xs font-semibold text-primary-foreground shadow-neon hover:brightness-110"
            >
              Start Live Broadcast
            </button>
          </div>
        </form>
      ) : (
        <div className="space-y-4">
          {/* Broadcaster Actions */}
          <div className="grid gap-3 sm:grid-cols-2">
            {stream.is_live ? (
              <button
                type="button"
                onClick={handleEndStream}
                className="flex items-center justify-center gap-1.5 rounded-xl bg-red-600/20 border border-red-500/30 text-red-400 py-3 text-xs font-semibold hover:bg-red-600/30 transition-all"
              >
                <Square className="h-4 w-4 fill-red-400" />
                End Livestream
              </button>
            ) : (
              <button
                type="button"
                onClick={startEditMode}
                className="flex items-center justify-center gap-1.5 rounded-xl bg-primary py-3 text-xs font-semibold text-primary-foreground shadow-neon hover:brightness-110 transition-all"
              >
                <Play className="h-4 w-4 fill-white" />
                Go Live
              </button>
            )}

            <button
              type="button"
              onClick={startEditMode}
              disabled={isEditing}
              className="flex items-center justify-center gap-1.5 rounded-xl border border-border/50 bg-card/40 text-primary-foreground py-3 text-xs font-semibold hover:bg-slate-900 transition-all disabled:opacity-50"
            >
              <Edit className="h-4 w-4" />
              Edit Settings
            </button>
          </div>

          {/* Quick Chat controls */}
          <div className="space-y-3 pt-2">
            <h4 className="text-xs font-bold text-slate-400">Fellowship Chat Actions</h4>
            <button
              type="button"
              onClick={onClearChat}
              className="w-full flex items-center justify-center gap-1.5 rounded-xl border border-red-500/20 bg-red-500/5 hover:bg-red-500/10 text-red-400 py-2.5 text-xs font-semibold transition-all"
            >
              <MessageSquareOff className="h-4 w-4" />
              Clear Fellowship Chat Logs
            </button>
          </div>

          {/* Muted Users list */}
          <div className="space-y-3 pt-2">
            <h4 className="text-xs font-bold text-slate-400">Muted Users ({mutedUsers.length})</h4>
            {mutedUsers.length > 0 ? (
              <div className="max-h-24 overflow-y-auto border border-border/30 rounded-xl p-2.5 bg-slate-950/20 space-y-1.5">
                {mutedUsers.map((user) => (
                  <div key={user} className="flex items-center justify-between text-xs">
                    <span className="text-slate-300 font-semibold">{user}</span>
                    <button
                      type="button"
                      onClick={() => onUnmuteUser(user)}
                      className="inline-flex items-center gap-0.5 text-[10px] text-indigo-400 hover:text-indigo-300 font-semibold"
                    >
                      <UserCheck className="h-3 w-3" />
                      Unmute
                    </button>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-[10px] text-muted-foreground italic">No users are currently muted.</p>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
