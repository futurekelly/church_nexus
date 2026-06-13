"use client";

import { useState, useRef, useEffect } from "react";
import { Play, Pause, RotateCcw, Volume2, Video, Headset } from "lucide-react";
import { cn } from "@/lib/utils";

interface SermonMediaPlayerProps {
  videoUrl: string;
  audioUrl: string;
  thumbnail: string;
  initialTab?: "video" | "audio";
}

export function SermonMediaPlayer({
  videoUrl,
  audioUrl,
  thumbnail,
  initialTab = "video",
}: SermonMediaPlayerProps) {
  const [activeTab, setActiveTab] = useState<"video" | "audio">(initialTab);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolume] = useState(0.8);

  const videoRef = useRef<HTMLVideoElement>(null);
  const audioRef = useRef<HTMLAudioElement>(null);

  // Stop playback when switching tabs
  useEffect(() => {
    setIsPlaying(false);
    setCurrentTime(0);
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
    if (activeTab === "video" && videoRef.current) {
      if (isPlaying) {
        videoRef.current.pause();
      } else {
        videoRef.current.play().catch(() => {});
      }
      setIsPlaying(!isPlaying);
    } else if (activeTab === "audio" && audioRef.current) {
      if (isPlaying) {
        audioRef.current.pause();
      } else {
        audioRef.current.play().catch(() => {});
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

  const formatTime = (secs: number) => {
    if (isNaN(secs)) return "00:00";
    const minutes = Math.floor(secs / 60);
    const seconds = Math.floor(secs % 60);
    return `${String(minutes).padStart(2, "0")}:${String(seconds).padStart(2, "0")}`;
  };

  return (
    <div className="overflow-hidden rounded-2xl border border-border/50 bg-card/60 backdrop-blur-glass shadow-glass flex flex-col w-full">
      {/* Player Header Tabs */}
      <div className="flex border-b border-border/20 bg-slate-950/20 p-2 justify-between items-center">
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
        <span className="text-[10px] font-mono text-muted-foreground mr-2 select-none">
          {isPlaying ? "PLAYING" : "PAUSED"}
        </span>
      </div>

      {/* Media Player Viewport */}
      <div className="relative aspect-video w-full bg-black flex items-center justify-center overflow-hidden">
        {activeTab === "video" ? (
          videoUrl ? (
            <video
              ref={videoRef}
              src={videoUrl}
              onTimeUpdate={handleTimeUpdate}
              onLoadedMetadata={handleLoadedMetadata}
              onEnded={() => setIsPlaying(false)}
              className="h-full w-full object-contain"
              onClick={handlePlayPause}
            />
          ) : (
            <div className="text-center text-muted-foreground">No Video Link Available</div>
          )
        ) : (
          /* Audio player interface with visualizer */
          <div className="relative h-full w-full flex flex-col items-center justify-center p-6 space-y-6">
            <audio
              ref={audioRef}
              src={audioUrl}
              onTimeUpdate={handleTimeUpdate}
              onLoadedMetadata={handleLoadedMetadata}
              onEnded={() => setIsPlaying(false)}
              className="hidden"
            />
            {/* cover image overlay behind visualizer */}
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={thumbnail}
              alt="sermon art"
              className="absolute inset-0 h-full w-full object-cover opacity-25 filter blur-md select-none pointer-events-none"
            />
            
            {/* Equalizer animation */}
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
          </div>
        )}

        {/* Overlay Play/Pause Button on Hover */}
        {!isPlaying && (
          <button
            onClick={handlePlayPause}
            className="absolute flex h-14 w-14 items-center justify-center rounded-full bg-indigo-600/90 text-white shadow-[0_0_24px_rgba(99,102,241,0.5)] transition-all hover:scale-105 hover:bg-indigo-500 z-10"
            aria-label="Play media"
          >
            <Play className="h-6 w-6 fill-current translate-x-0.5" />
          </button>
        )}
      </div>

      {/* Player Custom Controls */}
      <div className="bg-slate-950/40 p-4 border-t border-border/20 space-y-3">
        {/* Progress Slider */}
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

        {/* Action controls */}
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

          {/* Volume controls */}
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
      </div>
    </div>
  );
}
