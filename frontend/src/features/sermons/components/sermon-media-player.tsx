"use client";

import { useState, useRef, useEffect } from "react";
import {
  Play, Pause, RotateCcw, Volume2, Video, Headset,
  Settings, RefreshCw, AlertCircle, Loader2, Youtube
} from "lucide-react";
import { cn } from "@/lib/utils";

/**
 * Detect if a URL is a YouTube link (watch, short URL, embed, or shorts).
 * Returns the video ID string, or null if not a YouTube URL.
 */
function getYouTubeVideoId(url: string): string | null {
  if (!url) return null;
  try {
    const u = new URL(url);
    // youtu.be/VIDEO_ID
    if (u.hostname === "youtu.be") {
      return u.pathname.slice(1).split("?")[0] || null;
    }
    // youtube.com/watch?v=VIDEO_ID
    if (u.hostname === "www.youtube.com" || u.hostname === "youtube.com") {
      if (u.pathname === "/watch") return u.searchParams.get("v");
      // youtube.com/embed/VIDEO_ID or youtube.com/shorts/VIDEO_ID
      const match = u.pathname.match(/\/(embed|shorts)\/([^/?]+)/);
      if (match) return match[2];
    }
  } catch {
    // not a valid URL — not YouTube
  }
  return null;
}

interface SermonMediaPlayerProps {
  videoUrl: string;
  audioUrl: string;
  thumbnail: string;
  hlsUrl?: string;
  initialTab?: "video" | "audio";
}

export function SermonMediaPlayer({
  videoUrl,
  audioUrl,
  thumbnail,
  hlsUrl,
  initialTab = "video",
}: SermonMediaPlayerProps) {
  const [activeTab, setActiveTab] = useState<"video" | "audio">(initialTab);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolume] = useState(0.8);
  const [isLoading, setIsLoading] = useState(false);
  const [hasError, setHasError] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [selectedQuality, setSelectedQuality] = useState<string>("Auto");
  const [showQualityMenu, setShowQualityMenu] = useState(false);

  const videoRef = useRef<HTMLVideoElement>(null);
  const audioRef = useRef<HTMLAudioElement>(null);

  const [useHls, setUseHls] = useState(false);

  useEffect(() => {
    if (hlsUrl && hlsUrl.trim() !== "") {
      const video = document.createElement("video");
      const nativeHls = video.canPlayType("application/vnd.apple.mpegurl") !== "";
      setUseHls(nativeHls);
    } else {
      setUseHls(false);
    }
  }, [hlsUrl]);

  const activeStreamUrl = useHls ? hlsUrl : videoUrl;

  // YouTube detection — if video_url is a YouTube link, embed via iframe instead
  const youtubeVideoId = getYouTubeVideoId(videoUrl);
  const isYouTube = activeTab === "video" && !!youtubeVideoId;
  const youtubeEmbedUrl = youtubeVideoId
    ? `https://www.youtube-nocookie.com/embed/${youtubeVideoId}?rel=0&modestbranding=1`
    : null;

  // Stop playback and reset when switching tabs
  useEffect(() => {
    setIsPlaying(false);
    setCurrentTime(0);
    setHasError(false);
    setErrorMessage(null);
    if (videoRef.current) {
      videoRef.current.pause();
      videoRef.current.currentTime = 0;
    }
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.currentTime = 0;
    }
  }, [activeTab]);

  // Handle Play/Pause
  const handlePlayPause = () => {
    setHasError(false);
    if (activeTab === "video" && videoRef.current) {
      if (isPlaying) {
        videoRef.current.pause();
      } else {
        setIsLoading(true);
        videoRef.current
          .play()
          .then(() => setIsLoading(false))
          .catch((err) => {
            setIsLoading(false);
            setHasError(true);
            setErrorMessage("Failed to start video playback. Click retry.");
          });
      }
      setIsPlaying(!isPlaying);
    } else if (activeTab === "audio" && audioRef.current) {
      if (isPlaying) {
        audioRef.current.pause();
      } else {
        setIsLoading(true);
        audioRef.current
          .play()
          .then(() => setIsLoading(false))
          .catch(() => {
            setIsLoading(false);
            setHasError(true);
            setErrorMessage("Failed to start audio playback.");
          });
      }
      setIsPlaying(!isPlaying);
    }
  };

  // Skip backward
  const handleRewind = () => {
    if (activeTab === "video" && videoRef.current) {
      videoRef.current.currentTime = Math.max(0, videoRef.current.currentTime - 10);
    } else if (activeTab === "audio" && audioRef.current) {
      audioRef.current.currentTime = Math.max(0, audioRef.current.currentTime - 10);
    }
  };

  // Handle progress updates
  const handleTimeUpdate = () => {
    if (activeTab === "video" && videoRef.current) {
      setCurrentTime(videoRef.current.currentTime);
    } else if (activeTab === "audio" && audioRef.current) {
      setCurrentTime(audioRef.current.currentTime);
    }
  };

  const handleLoadedMetadata = () => {
    setIsLoading(false);
    if (activeTab === "video" && videoRef.current) {
      setDuration(videoRef.current.duration || 0);
    } else if (activeTab === "audio" && audioRef.current) {
      setDuration(audioRef.current.duration || 0);
    }
  };

  const handleSeek = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = parseFloat(e.target.value);
    setCurrentTime(val);
    if (activeTab === "video" && videoRef.current) {
      videoRef.current.currentTime = val;
    } else if (activeTab === "audio" && audioRef.current) {
      audioRef.current.currentTime = val;
    }
  };

  const handleVolumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = parseFloat(e.target.value);
    setVolume(val);
    if (videoRef.current) videoRef.current.volume = val;
    if (audioRef.current) audioRef.current.volume = val;
  };

  const handleRetry = () => {
    setHasError(false);
    setErrorMessage(null);
    if (videoRef.current) {
      videoRef.current.load();
    }
    if (audioRef.current) {
      audioRef.current.load();
    }
  };

  const formatTime = (secs: number) => {
    if (isNaN(secs)) return "00:00";
    const minutes = Math.floor(secs / 60);
    const seconds = Math.floor(secs % 60);
    return `${String(minutes).padStart(2, "0")}:${String(seconds).padStart(2, "0")}`;
  };

  return (
    <div className="overflow-hidden rounded-2xl border border-border/50 bg-card/60 backdrop-blur-glass shadow-glass flex flex-col w-full">
      {/* Player Header Tabs & Quality Selector */}
      <div className="flex border-b border-border/20 bg-slate-950/20 p-2 justify-between items-center relative">
        <div className="flex gap-2">
          <button
            onClick={() => setActiveTab("video")}
            className={cn(
              "flex items-center gap-1.5 rounded-lg px-4 py-2 text-xs font-bold transition-all",
              activeTab === "video"
                ? "bg-indigo-500/20 text-indigo-400 border border-indigo-500/30 shadow-neon"
                : "text-muted-foreground hover:text-primary-foreground"
            )}
          >
            <Video className="h-3.5 w-3.5" />
            Watch Sermon
          </button>
          <button
            onClick={() => setActiveTab("audio")}
            className={cn(
              "flex items-center gap-1.5 rounded-lg px-4 py-2 text-xs font-bold transition-all",
              activeTab === "audio"
                ? "bg-indigo-500/20 text-indigo-400 border border-indigo-500/30 shadow-neon"
                : "text-muted-foreground hover:text-primary-foreground"
            )}
          >
            <Headset className="h-3.5 w-3.5" />
            Listen Audio
          </button>
        </div>

        <div className="flex items-center gap-3">
          {activeTab === "video" && (
            <div className="relative">
              <button
                type="button"
                onClick={() => setShowQualityMenu(!showQualityMenu)}
                className="flex items-center gap-1.5 rounded-lg border border-border/40 bg-slate-900/60 px-2.5 py-1 text-[11px] font-semibold text-muted-foreground hover:text-white transition-all"
              >
                <Settings className="h-3 w-3 text-indigo-400" />
                <span>{selectedQuality}</span>
              </button>
              {showQualityMenu && (
                <div className="absolute right-0 top-8 z-50 w-28 rounded-xl border border-border/60 bg-slate-900/95 p-1 shadow-xl backdrop-blur-md">
                  {["Auto", "720p", "480p", "360p"].map((q) => (
                    <button
                      key={q}
                      onClick={() => {
                        setSelectedQuality(q);
                        setShowQualityMenu(false);
                      }}
                      className={cn(
                        "block w-full rounded-lg px-3 py-1.5 text-left text-xs transition-colors",
                        selectedQuality === q
                          ? "bg-indigo-500/20 font-bold text-indigo-300"
                          : "text-muted-foreground hover:bg-slate-800 hover:text-white"
                      )}
                    >
                      {q}
                    </button>
                  ))}
                </div>
              )}
            </div>
          )}

          <span className="text-[10px] font-mono text-muted-foreground mr-2 select-none">
            {isPlaying ? "PLAYING" : "PAUSED"}
          </span>
        </div>
      </div>

      {/* Media Player Viewport */}
      <div className="relative aspect-video w-full bg-black flex items-center justify-center overflow-hidden">
        {activeTab === "video" ? (
          isYouTube && youtubeEmbedUrl ? (
            /* ─── YouTube iframe embed ─── */
            <>
              <iframe
                src={youtubeEmbedUrl}
                title="YouTube sermon video"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                allowFullScreen
                className="h-full w-full border-0"
                onLoad={() => setIsLoading(false)}
              />
              {isLoading && (
                <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/70 z-20 gap-3">
                  <Youtube className="h-10 w-10 text-red-500 animate-pulse" />
                  <Loader2 className="h-6 w-6 animate-spin text-indigo-400" />
                  <p className="text-xs text-muted-foreground">Loading YouTube stream…</p>
                </div>
              )}
            </>
          ) : activeStreamUrl ? (
            /* ─── Native HTML5 video player ─── */
            <>
              <video
                ref={videoRef}
                src={activeStreamUrl}
                onTimeUpdate={handleTimeUpdate}
                onLoadedMetadata={handleLoadedMetadata}
                onWaiting={() => setIsLoading(true)}
                onPlaying={() => setIsLoading(false)}
                onError={() => {
                  setIsLoading(false);
                  setHasError(true);
                  setErrorMessage("Stream loading error. Retry playback.");
                }}
                onEnded={() => setIsPlaying(false)}
                className="h-full w-full object-contain"
                onClick={handlePlayPause}
              />
              {isLoading && (
                <div className="absolute inset-0 flex items-center justify-center bg-black/40 backdrop-blur-sm z-20">
                  <Loader2 className="h-8 w-8 animate-spin text-indigo-400" />
                </div>
              )}
              {hasError && (
                <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/80 p-4 space-y-3 z-30">
                  <AlertCircle className="h-8 w-8 text-red-400" />
                  <p className="text-xs text-muted-foreground text-center max-w-xs">{errorMessage || "Playback error encountered."}</p>
                  <button
                    type="button"
                    onClick={handleRetry}
                    className="flex items-center gap-1.5 rounded-lg bg-indigo-600 px-3 py-1.5 text-xs font-semibold text-white hover:bg-indigo-500 transition-all"
                  >
                    <RefreshCw className="h-3.5 w-3.5" /> Retry Playback
                  </button>
                </div>
              )}
            </>
          ) : (
            <div className="text-center text-muted-foreground text-xs">No Video Link Available</div>
          )
        ) : (
          /* Audio player interface with visualizer */
          <div className="relative h-full w-full flex flex-col items-center justify-center p-6 space-y-6">
            <audio
              ref={audioRef}
              src={audioUrl}
              onTimeUpdate={handleTimeUpdate}
              onLoadedMetadata={handleLoadedMetadata}
              onWaiting={() => setIsLoading(true)}
              onPlaying={() => setIsLoading(false)}
              onError={() => {
                setIsLoading(false);
                setHasError(true);
                setErrorMessage("Audio stream error.");
              }}
              onEnded={() => setIsPlaying(false)}
              className="hidden"
            />
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={thumbnail}
              alt="sermon art"
              className="absolute inset-0 h-full w-full object-cover opacity-25 filter blur-md select-none pointer-events-none"
            />
            
            <div className="flex items-end gap-1 h-16 w-32 justify-center z-10">
              {[...Array(9)].map((_, i) => (
                <div
                  key={i}
                  className={cn(
                    "w-1.5 rounded-t bg-indigo-400 transition-all duration-300",
                    isPlaying ? "animate-pulse" : "h-1"
                  )}
                  style={{
                    height: isPlaying ? `${Math.max(10, Math.random() * 64)}px` : "4px",
                    animationDelay: `${i * 0.1}s`,
                    animationDuration: `${0.5 + Math.random() * 0.5}s`,
                  }}
                />
              ))}
            </div>
            
            <p className="text-xs text-muted-foreground text-center max-w-xs z-10 font-medium select-none">
              Streaming Audio Broadcast
            </p>

            {hasError && (
              <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/80 p-4 space-y-3 z-30">
                <AlertCircle className="h-8 w-8 text-red-400" />
                <p className="text-xs text-muted-foreground text-center max-w-xs">{errorMessage}</p>
                <button
                  type="button"
                  onClick={handleRetry}
                  className="flex items-center gap-1.5 rounded-lg bg-indigo-600 px-3 py-1.5 text-xs font-semibold text-white hover:bg-indigo-500 transition-all"
                >
                  <RefreshCw className="h-3.5 w-3.5" /> Retry Audio
                </button>
              </div>
            )}
          </div>
        )}

        {/* Overlay Play/Pause Button — hidden when YouTube iframe is active */}
        {!isYouTube && !isPlaying && !isLoading && !hasError && (
          <button
            onClick={handlePlayPause}
            className="absolute flex h-14 w-14 items-center justify-center rounded-full bg-indigo-600/90 text-white shadow-[0_0_24px_rgba(99,102,241,0.5)] transition-all hover:scale-105 hover:bg-indigo-500 z-10"
            aria-label="Play media"
          >
            <Play className="h-6 w-6 fill-current translate-x-0.5" />
          </button>
        )}
      </div>

      {/* Player Custom Controls — hidden when YouTube iframe manages its own controls */}
      {!isYouTube && <div className="bg-slate-950/40 p-4 border-t border-border/20 space-y-3">
        <div className="flex items-center gap-3">
          <span className="text-[10px] font-mono text-muted-foreground select-none">
            {formatTime(currentTime)}
          </span>
          <input
            type="range"
            min={0}
            max={duration || 100}
            value={currentTime}
            onChange={handleSeek}
            className="flex-1 h-1 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-indigo-500 focus:outline-none"
          />
          <span className="text-[10px] font-mono text-muted-foreground select-none">
            {formatTime(duration)}
          </span>
        </div>

        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button
              onClick={handleRewind}
              className="text-muted-foreground hover:text-primary-foreground transition-colors"
              title="Rewind 10s"
            >
              <RotateCcw className="h-4 w-4" />
            </button>
            <button
              onClick={handlePlayPause}
              className="flex h-8 w-8 items-center justify-center rounded-full bg-indigo-500/20 text-indigo-400 border border-indigo-500/30 hover:bg-indigo-500 hover:text-white transition-all"
              title={isPlaying ? "Pause" : "Play"}
            >
              {isPlaying ? <Pause className="h-4 w-4 fill-current" /> : <Play className="h-4 w-4 fill-current translate-x-0.5" />}
            </button>
          </div>

          <div className="flex items-center gap-2">
            <Volume2 className="h-4 w-4 text-muted-foreground" />
            <input
              type="range"
              min={0}
              max={1}
              step={0.05}
              value={volume}
              onChange={handleVolumeChange}
              className="w-16 h-1 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-indigo-500"
            />
          </div>
        </div>
      </div>}
    </div>
  );
}
