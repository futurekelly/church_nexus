"use client";

import { motion } from "framer-motion";
import { PieChart, Pie, Cell, Tooltip, Legend, ResponsiveContainer } from "recharts";
import type { DonationRecord } from "../types/donations.types";
import { formatTZS } from "../utils/format";

interface GivingCategoryChartProps {
  donations: DonationRecord[];
}

export function GivingCategoryChart({ donations }: GivingCategoryChartProps) {
  const completed = donations.filter((d) => d.status === "Completed");

  // Sum by type
  const sums: Record<string, number> = {
    Tithe: 0,
    Offering: 0,
    "Building Fund": 0,
    Outreach: 0,
    Other: 0,
  };

  completed.forEach((d) => {
    if (sums[d.type] !== undefined) {
      sums[d.type] += d.amount;
    } else {
      sums.Other += d.amount;
    }
  });

  const total = Object.values(sums).reduce((a, b) => a + b, 0);

  const colors: Record<string, string> = {
    Tithe: "#6366F1", // Indigo
    Offering: "#3B82F6", // Blue
    "Building Fund": "#10B981", // Emerald
    Outreach: "#EC4899", // Pink
    Other: "#F59E0B", // Amber
  };

  const data = Object.entries(sums)
    .map(([name, value]) => ({
      name,
      value,
      color: colors[name] ?? "#8B5CF6",
    }))
    .filter((d) => d.value > 0);

  const hasData = total > 0;

  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: 0.1 }}
      className="rounded-2xl border border-border/50 bg-card/60 p-5 backdrop-blur-glass shadow-glass flex flex-col h-full min-h-[320px]"
    >
      <div className="mb-2">
        <h3 className="text-sm font-semibold text-primary-foreground">Giving by Fund Category</h3>
        <p className="text-xs text-muted-foreground">Distribution of funds across church programs</p>
      </div>

      <div className="flex-1 flex items-center justify-center relative min-h-[200px]">
        {hasData ? (
          <ResponsiveContainer width="100%" height={240}>
            <PieChart>
              <Pie
                data={data}
                cx="50%"
                cy="50%"
                innerRadius={60}
                outerRadius={80}
                paddingAngle={4}
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
                    const percent = total > 0 ? ((item.value as number) / total * 100).toFixed(1) : "0";
                    return (
                      <div className="rounded-lg border border-border/60 bg-card/90 px-3 py-2 text-xs shadow-glass backdrop-blur-[16px] text-primary-foreground">
                        <p className="font-semibold" style={{ color: item.payload.color }}>
                          {item.name}: {formatTZS(item.value as number)} ({percent}%)
                        </p>
                      </div>
                    );
                  }
                  return null;
                }}
              />
              <Legend
                verticalAlign="bottom"
                iconType="circle"
                iconSize={8}
                formatter={(value, entry: any) => (
                  <span className="text-xs text-muted-foreground font-medium">
                    {value} ({formatTZS(entry.payload.value)})
                  </span>
                )}
              />
            </PieChart>
          </ResponsiveContainer>
        ) : (
          <div className="text-center text-xs text-slate-500 py-12">
            No giving transactions registered yet.
          </div>
        )}
      </div>
    </motion.div>
  );
}
