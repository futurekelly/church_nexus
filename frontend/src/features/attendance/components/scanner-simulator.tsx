"use client";

import { useState, useRef } from "react";
import { Scan, User, Check, RefreshCw } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";
import type { AttendanceRecord } from "../types/attendance.types";

interface ScannerSimulatorProps {
  records: AttendanceRecord[];
  onCheckIn: (memberId: string, method: "QR" | "Barcode" | "Manual") => void;
}

export function ScannerSimulator({ records, onCheckIn }: ScannerSimulatorProps) {
  const [isScanning, setIsScanning] = useState(false);
  const [scanResult, setScanResult] = useState<AttendanceRecord | null>(null);
  const [recentScans, setRecentScans] = useState<AttendanceRecord[]>([]);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

  const unchecked = records.filter((r) => r.status === "Absent");

  const playChime = () => {
    if (typeof window === "undefined") return;
    try {
      const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
      if (!AudioContextClass) return;
      const audioCtx = new AudioContextClass();
      const osc = audioCtx.createOscillator();
      const gain = audioCtx.createGain();

      osc.connect(gain);
      gain.connect(audioCtx.destination);

      // Synthesis: clean A5 high frequency chime note
      osc.type = "sine";
      osc.frequency.setValueAtTime(880, audioCtx.currentTime);
      gain.gain.setValueAtTime(0.08, audioCtx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + 0.2);

      osc.start();
      osc.stop(audioCtx.currentTime + 0.2);
    } catch (err) {
      console.warn("Synthesis chime failed", err);
    }
  };

  const handleSimulateScan = () => {
    if (isScanning || unchecked.length === 0) return;

    setIsScanning(true);
    setScanResult(null);

    if (timeoutRef.current) clearTimeout(timeoutRef.current);

    // Simulate scanning laser reading time
    timeoutRef.current = setTimeout(() => {
      // Pick random unchecked member
      const randomIndex = Math.floor(Math.random() * unchecked.length);
      const selected = unchecked[randomIndex];

      playChime();
      onCheckIn(selected.member_id, "QR");
      
      const completedRecord: AttendanceRecord = {
        ...selected,
        status: "Present",
        check_in_time: new Date().toISOString(),
        check_in_method: "QR",
      };

      setScanResult(completedRecord);
      setRecentScans((prev) => [completedRecord, ...prev.slice(0, 4)]);
      setIsScanning(false);
    }, 1200);
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
      {/* Scanner Box (Col span 2) */}
      <div className="md:col-span-2 rounded-2xl border border-border/50 bg-card/60 p-6 backdrop-blur-glass flex flex-col items-center justify-center min-h-[350px] shadow-glass relative">
        <h3 className="text-sm font-bold text-muted-foreground uppercase tracking-widest absolute top-4 left-6 select-none">
          QR Scan Simulation
        </h3>

        {/* Viewfinder frame */}
        <div className="relative w-64 h-64 border-2 border-slate-700/60 rounded-3xl flex items-center justify-center bg-slate-950/70 overflow-hidden shadow-inner">
          {/* Neon corners */}
          <div className="absolute top-2 left-2 w-6 h-6 border-t-2 border-l-2 border-indigo-400 rounded-tl-lg" />
          <div className="absolute top-2 right-2 w-6 h-6 border-t-2 border-r-2 border-indigo-400 rounded-tr-lg" />
          <div className="absolute bottom-2 left-2 w-6 h-6 border-b-2 border-l-2 border-indigo-400 rounded-bl-lg" />
          <div className="absolute bottom-2 right-2 w-6 h-6 border-b-2 border-r-2 border-indigo-400 rounded-br-lg" />

          <AnimatePresence mode="wait">
            {isScanning ? (
              /* Laser Animation */
              <motion.div
                initial={{ top: "10%" }}
                animate={{ top: "90%" }}
                transition={{
                  repeat: Infinity,
                  repeatType: "reverse",
                  duration: 1,
                  ease: "easeInOut",
                }}
                className="absolute left-0 right-0 h-0.5 bg-indigo-400 shadow-[0_0_12px_rgba(99,102,241,1)] z-10"
              />
            ) : scanResult ? (
              /* Success Flash */
              <motion.div
                key="success"
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.8, opacity: 0 }}
                className="flex flex-col items-center space-y-2 text-emerald-400"
              >
                <div className="h-14 w-14 rounded-full bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center shadow-[0_0_16px_rgba(16,185,129,0.2)]">
                  <Check className="h-7 w-7" />
                </div>
                <span className="text-xs font-bold uppercase tracking-wider">Success</span>
              </motion.div>
            ) : (
              /* Ready Scan indicator */
              <motion.div
                key="ready"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="flex flex-col items-center text-slate-500 space-y-2"
              >
                <Scan className="h-10 w-10 animate-pulse text-indigo-400/40" />
                <span className="text-xs uppercase tracking-widest font-semibold select-none">
                  Scanner Ready
                </span>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Scan Button Action */}
        <div className="mt-6 w-full max-w-xs space-y-3">
          <button
            type="button"
            disabled={isScanning || unchecked.length === 0}
            onClick={handleSimulateScan}
            className={cn(
              "w-full flex items-center justify-center gap-2 rounded-xl py-3 text-sm font-bold text-primary-foreground shadow-neon transition-all hover:brightness-110",
              isScanning ? "bg-indigo-600/50" : "bg-primary",
              unchecked.length === 0 && "bg-slate-800 text-slate-500 border border-border/20 shadow-none cursor-not-allowed"
            )}
          >
            {isScanning ? (
              <>
                <RefreshCw className="h-4 w-4 animate-spin" />
                <span>Reading QR Code...</span>
              </>
            ) : (
              <>
                <Scan className="h-4 w-4" />
                <span>Simulate QR Scan</span>
              </>
            )}
          </button>
          {unchecked.length === 0 && (
            <p className="text-center text-[10px] text-muted-foreground italic">
              All expected members checked in!
            </p>
          )}
        </div>
      </div>

      {/* Recent Scans Sidebar (Col span 1) */}
      <div className="rounded-2xl border border-border/50 bg-card/60 p-5 backdrop-blur-glass flex flex-col shadow-glass">
        <h3 className="text-xs font-bold text-muted-foreground uppercase tracking-widest border-b border-border/40 pb-2.5 mb-3">
          Recent Scans Log
        </h3>

        <div className="flex-1 space-y-3 overflow-y-auto max-h-[300px] pr-1">
          <AnimatePresence>
            {recentScans.length > 0 ? (
              recentScans.map((scan) => (
                <motion.div
                  key={scan.id}
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0 }}
                  className="rounded-xl border border-border/30 bg-slate-950/30 p-2.5 flex items-center gap-3 text-xs"
                >
                  <div className="h-8 w-8 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 flex items-center justify-center">
                    <User className="h-4 w-4" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-primary-foreground truncate">
                      {scan.member_name}
                    </p>
                    <p className="text-[10px] text-muted-foreground mt-0.5">
                      No: {scan.membership_number} • {scan.check_in_method}
                    </p>
                  </div>
                  <span className="text-[10px] text-emerald-400 font-semibold font-mono">
                    {scan.check_in_time
                      ? new Date(scan.check_in_time).toLocaleTimeString("en-US", {
                          hour: "2-digit",
                          minute: "2-digit",
                          second: "2-digit",
                          hour12: false,
                        })
                      : ""}
                  </span>
                </motion.div>
              ))
            ) : (
              <div className="h-full flex items-center justify-center text-center text-xs text-slate-500 py-12 select-none">
                No recent scans in this session yet.
              </div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}
