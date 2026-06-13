"use client";

import { motion } from "framer-motion";
import { BarChart, Bar, Cell, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import type { AttendanceRecord } from "../types/attendance.types";

interface CheckInMethodBarProps {
  records: AttendanceRecord[];
}

export function CheckInMethodBar({ records }: CheckInMethodBarProps) {
  // Count check-in methods for present attendees
  const presentRecords = records.filter((r) => r.status === "Present");
  
  const qrCount = presentRecords.filter((r) => r.check_in_method === "QR").length;
  const barcodeCount = presentRecords.filter((r) => r.check_in_method === "Barcode").length;
  const manualCount = presentRecords.filter((r) => r.check_in_method === "Manual").length;
  const total = qrCount + barcodeCount + manualCount;

  const data = [
    { name: "QR Scan", value: qrCount, color: "#818CF8" }, // Indigo
    { name: "Barcode", value: barcodeCount, color: "#34D399" }, // Emerald
    { name: "Manual Roster", value: manualCount, color: "#FBBF24" }, // Amber
  ];

  const hasData = total > 0;

  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: 0.1 }}
      className="rounded-2xl border border-border/50 bg-card/60 p-5 backdrop-blur-glass shadow-glass flex flex-col h-full min-h-[300px]"
    >
      <div className="mb-2">
        <h3 className="text-sm font-semibold text-primary-foreground">Check-in Methods</h3>
        <p className="text-xs text-muted-foreground">Usage breakdown of check-in options</p>
      </div>

      <div className="flex-1 flex items-center justify-center relative min-h-[200px]">
        {hasData ? (
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={data} margin={{ top: 20, right: 10, left: -25, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255, 255, 255, 0.05)" vertical={false} />
              <XAxis 
                dataKey="name" 
                tick={{ fill: "#94A3B8", fontSize: 11 }}
                axisLine={false}
                tickLine={false}
              />
              <YAxis 
                allowDecimals={false}
                tick={{ fill: "#94A3B8", fontSize: 11 }}
                axisLine={false}
                tickLine={false}
              />
              <Tooltip
                content={({ active, payload }) => {
                  if (active && payload && payload.length) {
                    const item = payload[0];
                    return (
                      <div className="rounded-lg border border-border/60 bg-card/90 px-3 py-2 text-xs shadow-glass backdrop-blur-[16px] text-primary-foreground">
                        <p className="font-semibold" style={{ color: item.payload.color }}>
                          {item.name}: {item.value} check-ins
                        </p>
                      </div>
                    );
                  }
                  return null;
                }}
              />
              <Bar dataKey="value" radius={[4, 4, 0, 0]}>
                {data.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        ) : (
          <div className="text-center text-xs text-slate-500 py-12">
            No check-in method details available.
          </div>
        )}
      </div>
    </motion.div>
  );
}
