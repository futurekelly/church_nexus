"use client";

import { motion } from "framer-motion";
import { Users, AlertCircle, Play, Volume2 } from "lucide-react";
import type { LivestreamStatus } from "../types/livestream.types";
import { useEffect, useRef, useState } from "react";

interface LivestreamPlayerProps {
  stream: LivestreamStatus | null;
}

export function LivestreamPlayer({ stream }: LivestreamPlayerProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(true);

  // Auto-play when stream becomes live
  useEffect(() => {
    if (stream?.is_live && videoRef.current) {
      videoRef.current.play().then(() => {
        setIsPlaying(true);
      }).catch((e) => {
        console.log("Autoplay blocked:", e);
      });
    }
  }, [stream?.is_live]);

  const handlePlayToggle = () => {
    if (!videoRef.current) return;
    if (isPlaying) {
      videoRef.current.pause();
      setIsPlaying(false);
    } else {
      videoRef.current.play().then(() => {
        setIsPlaying(true);
      });
    }
  };

  const handleMuteToggle = () => {
    if (!videoRef.current) return;
    videoRef.current.muted = !isMuted;
    setIsMuted(!isMuted);
  };

  if (!stream || !stream.is_live) {
    return (
      <div className="rounded-2xl border border-border/50 bg-card/60 p-12 backdrop-blur-glass shadow-glass flex flex-col items-center justify-center text-center space-y-4 min-h-[400px]">
        <div className="bg-slate-900/80 p-4 rounded-full border border-border/40 text-muted-foreground animate-pulse">
          <AlertCircle className="h-10 w-10 text-slate-500" />
        </div>
        <div className="space-y-1">
          <h3 className="text-lg font-bold text-primary-foreground">Livestream is Offline</h3>
          <p className="text-xs text-muted-foreground max-w-sm">
            We are not broadcasting right now. Join us for our scheduled services or browse past sermons in the archives.
          </p>
        </div>
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.98 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.3 }}
      className="rounded-2xl border border-border/50 bg-card/40 overflow-hidden backdrop-blur-glass shadow-glass flex flex-col group"
    >
      {/* Player Display Container */}
      <div className="relative aspect-video w-full bg-black overflow-hidden flex items-center justify-center">
        <video
          ref={videoRef}
          src={stream.stream_url}
          className="w-full h-full object-cover"
          loop
          muted={isMuted}
          playsInline
        />

        {/* Video Control Overlays */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-black/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex flex-col justify-between p-4">
          {/* Top Indicators */}
          <div className="flex items-center justify-between">
            <span className="flex items-center gap-1.5 rounded-full bg-red-600 px-3 py-1 text-[10px] font-bold uppercase tracking-wider text-white shadow-[0_0_10px_rgba(220,38,38,0.5)] animate-pulse">
              <span className="h-1.5 w-1.5 rounded-full bg-white animate-ping" />
              LIVE
            </span>
            <span className="flex items-center gap-1.5 rounded-full bg-slate-950/70 px-2.5 py-1 text-[10px] font-semibold text-slate-300 border border-white/10 backdrop-blur-md">
              <Users className="h-3 w-3 text-indigo-400" />
              {stream.viewer_count} watching
            </span>
          </div>

          {/* Bottom Bar Controls */}
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <button
                type="button"
                onClick={handlePlayToggle}
                className="p-2 rounded-lg bg-white/10 hover:bg-white/20 text-white backdrop-blur-md transition-all"
                aria-label={isPlaying ? "Pause stream" : "Play stream"}
              >
                {isPlaying ? <span className="block h-3.5 w-3.5 border-x-2 border-white" /> : <Play className="h-3.5 w-3.5 fill-white" />}
              </button>
              <button
                type="button"
                onClick={handleMuteToggle}
                className="p-2 rounded-lg bg-white/10 hover:bg-white/20 text-white backdrop-blur-md transition-all"
                aria-label={isMuted ? "Unmute stream" : "Mute stream"}
              >
                <Volume2 className={isMuted ? "h-3.5 w-3.5 text-slate-400" : "h-3.5 w-3.5 text-white"} />
              </button>
            </div>
            <span className="text-[10px] text-slate-400 select-none">Simulated Stream</span>
          </div>
        </div>

        {/* Fallback play overlay if not auto-played */}
        {!isPlaying && (
          <button
            onClick={handlePlayToggle}
            className="absolute inset-0 flex items-center justify-center bg-black/40 hover:bg-black/30 transition-all group-hover:scale-105"
            aria-label="Play video"
          >
            <div className="p-5 rounded-full bg-indigo-600 text-white border border-indigo-500/40 shadow-neon">
              <Play className="h-6 w-6 fill-white ml-0.5" />
            </div>
          </button>
        )}
      </div>

      {/* Stream Meta Details */}
      <div className="p-5 space-y-2 border-t border-border/30 bg-slate-950/20">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <h2 className="text-lg font-bold text-primary-foreground">{stream.title}</h2>
          <span className="text-xs text-indigo-400 font-semibold uppercase tracking-wider">
            Speaker: {stream.preacher}
          </span>
        </div>
        {stream.description && (
          <p className="text-xs text-muted-foreground leading-relaxed">{stream.description}</p>
        )}
      </div>
    </motion.div>
  );
}
