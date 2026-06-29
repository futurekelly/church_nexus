"use client";

import { useState } from "react";
import { X, Download, FileVideo, FileAudio, FileText, CheckCircle2, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";

interface SermonDownloadModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  videoUrl?: string;
  audioUrl?: string;
  notes?: string;
}

type FormatOption = "video_hd" | "video_sd" | "audio_mp3" | "notes_txt";

export function SermonDownloadModal({
  isOpen,
  onClose,
  title,
  videoUrl,
  audioUrl,
  notes,
}: SermonDownloadModalProps) {
  const [selectedFormat, setSelectedFormat] = useState<FormatOption>("video_hd");
  const [isDownloading, setIsDownloading] = useState(false);
  const [downloadProgress, setDownloadProgress] = useState(0);
  const [isComplete, setIsComplete] = useState(false);

  if (!isOpen) return null;

  const handleStartDownload = () => {
    setIsDownloading(true);
    setDownloadProgress(0);
    setIsComplete(false);

    let current = 0;
    const interval = setInterval(() => {
      current += Math.floor(Math.random() * 20) + 10;
      if (current >= 100) {
        current = 100;
        clearInterval(interval);
        setDownloadProgress(100);
        setIsDownloading(false);
        setIsComplete(true);

        // Trigger browser download link
        let targetUrl = videoUrl;
        let filename = `${title.replace(/\s+/g, "_")}_HD.mp4`;

        if (selectedFormat === "audio_mp3") {
          targetUrl = audioUrl || videoUrl;
          filename = `${title.replace(/\s+/g, "_")}_Audio.mp3`;
        } else if (selectedFormat === "notes_txt") {
          const blob = new Blob([notes || `Study Notes for: ${title}`], { type: "text/plain;charset=utf-8" });
          targetUrl = URL.createObjectURL(blob);
          filename = `${title.replace(/\s+/g, "_")}_Notes.txt`;
        }

        if (targetUrl) {
          const a = document.createElement("a");
          a.href = targetUrl;
          a.download = filename;
          document.body.appendChild(a);
          a.click();
          document.body.removeChild(a);
        }
      } else {
        setDownloadProgress(current);
      }
    }, 200);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4 backdrop-blur-md animate-fadeIn">
      <div className="relative w-full max-w-md overflow-hidden rounded-2xl border border-indigo-500/30 bg-slate-950/90 p-6 shadow-2xl backdrop-blur-xl">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute right-4 top-4 rounded-lg p-1.5 text-muted-foreground hover:bg-white/10 hover:text-white transition-colors"
        >
          <X className="h-5 w-5" />
        </button>

        {/* Header */}
        <div className="space-y-1.5 pr-8">
          <div className="inline-flex items-center gap-1.5 rounded-full border border-indigo-500/30 bg-indigo-500/10 px-3 py-1 text-xs font-semibold text-indigo-300">
            <Download className="h-3.5 w-3.5" /> Offline Download Manager
          </div>
          <h3 className="text-lg font-bold text-white line-clamp-1">{title}</h3>
          <p className="text-xs text-muted-foreground">Select your preferred format for local offline study.</p>
        </div>

        {/* Format Selection Cards */}
        <div className="mt-5 space-y-2.5">
          {/* HD Video Option */}
          <button
            type="button"
            onClick={() => setSelectedFormat("video_hd")}
            className={cn(
              "flex w-full items-center justify-between rounded-xl border p-3.5 text-left transition-all",
              selectedFormat === "video_hd"
                ? "border-indigo-500 bg-indigo-500/15 text-white shadow-[0_0_15px_rgba(124,58,237,0.25)]"
                : "border-border/40 bg-slate-900/50 text-muted-foreground hover:border-border hover:text-white"
            )}
          >
            <div className="flex items-center gap-3">
              <div className="rounded-lg bg-indigo-500/20 p-2 text-indigo-400">
                <FileVideo className="h-5 w-5" />
              </div>
              <div>
                <p className="text-xs font-bold text-white">High-Definition Video (720p MP4)</p>
                <p className="text-[11px] text-muted-foreground">Best for large screen displays (~250 MB)</p>
              </div>
            </div>
          </button>

          {/* Audio MP3 Option */}
          <button
            type="button"
            onClick={() => setSelectedFormat("audio_mp3")}
            className={cn(
              "flex w-full items-center justify-between rounded-xl border p-3.5 text-left transition-all",
              selectedFormat === "audio_mp3"
                ? "border-indigo-500 bg-indigo-500/15 text-white shadow-[0_0_15px_rgba(124,58,237,0.25)]"
                : "border-border/40 bg-slate-900/50 text-muted-foreground hover:border-border hover:text-white"
            )}
          >
            <div className="flex items-center gap-3">
              <div className="rounded-lg bg-amber-500/20 p-2 text-amber-400">
                <FileAudio className="h-5 w-5" />
              </div>
              <div>
                <p className="text-xs font-bold text-white">Audio Broadcast (128k MP3)</p>
                <p className="text-[11px] text-muted-foreground">Ideal for mobile listening & commuting (~35 MB)</p>
              </div>
            </div>
          </button>

          {/* Study Notes Option */}
          <button
            type="button"
            onClick={() => setSelectedFormat("notes_txt")}
            className={cn(
              "flex w-full items-center justify-between rounded-xl border p-3.5 text-left transition-all",
              selectedFormat === "notes_txt"
                ? "border-indigo-500 bg-indigo-500/15 text-white shadow-[0_0_15px_rgba(124,58,237,0.25)]"
                : "border-border/40 bg-slate-900/50 text-muted-foreground hover:border-border hover:text-white"
            )}
          >
            <div className="flex items-center gap-3">
              <div className="rounded-lg bg-emerald-500/20 p-2 text-emerald-400">
                <FileText className="h-5 w-5" />
              </div>
              <div>
                <p className="text-xs font-bold text-white">Study Notes & Outline (.TXT)</p>
                <p className="text-[11px] text-muted-foreground">Full sermon transcript & reference notes (~12 KB)</p>
              </div>
            </div>
          </button>
        </div>

        {/* Progress Bar during Download */}
        {isDownloading && (
          <div className="mt-5 space-y-2">
            <div className="flex justify-between text-xs font-semibold text-indigo-300">
              <span className="flex items-center gap-1.5">
                <Loader2 className="h-3.5 w-3.5 animate-spin" /> Preparing Download Package...
              </span>
              <span>{downloadProgress}%</span>
            </div>
            <div className="h-2 w-full overflow-hidden rounded-full bg-slate-800">
              <div
                className="h-full bg-gradient-to-r from-indigo-500 via-purple-500 to-amber-400 transition-all duration-200"
                style={{ width: `${downloadProgress}%` }}
              />
            </div>
          </div>
        )}

        {isComplete && (
          <div className="mt-5 flex items-center gap-2 rounded-xl bg-emerald-500/15 p-3 text-xs font-semibold text-emerald-300 border border-emerald-500/30">
            <CheckCircle2 className="h-4 w-4 text-emerald-400 shrink-0" />
            Download complete! File saved to your device.
          </div>
        )}

        {/* Footer Actions */}
        <div className="mt-6 flex justify-end gap-2">
          <button
            type="button"
            onClick={onClose}
            className="rounded-xl border border-border/40 px-4 py-2 text-xs font-semibold text-muted-foreground hover:bg-white/5 hover:text-white transition-colors"
          >
            Cancel
          </button>
          <button
            type="button"
            disabled={isDownloading}
            onClick={handleStartDownload}
            className="flex items-center gap-2 rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 px-5 py-2 text-xs font-bold text-white shadow-lg shadow-indigo-500/25 hover:from-indigo-500 hover:to-purple-500 transition-all disabled:opacity-50"
          >
            <Download className="h-4 w-4" />
            {isDownloading ? "Downloading..." : "Start Download"}
          </button>
        </div>
      </div>
    </div>
  );
}
