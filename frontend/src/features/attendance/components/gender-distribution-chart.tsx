"use client";

import { motion } from "framer-motion";
import { PieChart, Pie, Cell, Tooltip, Legend, ResponsiveContainer } from "recharts";
import type { AttendanceRecord } from "../types/attendance.types";

interface GenderDistributionChartProps {
  records: AttendanceRecord[];
}

export function GenderDistributionChart({ records }: GenderDistributionChartProps) {
  // Count present attendees by gender
  const presentRecords = records.filter((r) => r.status === "Present");
  const maleCount = presentRecords.filter((r) => r.gender === "male").length;
  const femaleCount = presentRecords.filter((r) => r.gender === "female").length;
  const total = maleCount + femaleCount;

  const data = [
    { name: "Male", value: maleCount, color: "#6366F1" }, // indigo-500
    { name: "Female", value: femaleCount, color: "#EC4899" }, // pink-500
  ];

  const hasData = total > 0;

  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="rounded-2xl border border-border/50 bg-card/60 p-5 backdrop-blur-glass shadow-glass flex flex-col h-full min-h-[300px]"
    >
      <div className="mb-2">
        <h3 className="text-sm font-semibold text-primary-foreground">Gender Distribution</h3>
        <p className="text-xs text-muted-foreground">Demographics breakdown of present attendees</p>
      </div>

      <div className="flex-1 flex items-center justify-center relative min-h-[200px]">
        {hasData ? (
          <ResponsiveContainer width="100%" height={200}>
            <PieChart>
              <Pie
                data={data}
                cx="50%"
                cy="50%"
                innerRadius={60}
                outerRadius={80}
                paddingAngle={5}
                dataKey="value"
              >
                {data.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip
                content={({ active, payload }) => {
                  if (active && payload && payload.length) {
                    const item = payload[0];
                    const percent = total > 0 ? ((item.value as number) / total * 100).toFixed(0) : "0";
                    return (
                      <div className="rounded-lg border border-border/60 bg-card/90 px-3 py-2 text-xs shadow-glass backdrop-blur-[16px] text-primary-foreground">
                        <p className="font-semibold" style={{ color: item.payload.color }}>
                          {item.name}: {item.value} ({percent}%)
                        </p>
                      </div>
                    );
                  }
                  return null;
                }}
              />
              <Legend
                verticalAlign="bottom"
                height={36}
                iconType="circle"
                iconSize={8}
                formatter={(value, entry: any) => (
                  <span className="text-xs text-muted-foreground font-medium">
                    {value} ({entry.payload.value})
                  </span>
                )}
              />
            </PieChart>
          </ResponsiveContainer>
        ) : (
          <div className="text-center text-xs text-slate-500 py-12">
            No attendees checked in yet.
          </div>
        )}
      </div>
    </motion.div>
  );
}
