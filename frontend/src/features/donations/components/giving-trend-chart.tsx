"use client";

import { motion } from "framer-motion";
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import type { Donation } from "../types/donations.types";
import { formatCurrency } from "@/lib/localization";

interface GivingTrendChartProps {
  donations: Donation[];
}

export function GivingTrendChart({ donations }: GivingTrendChartProps) {
  const completed = donations.filter((d) => d.status === "Completed");

  // Calculate trends for the last 6 months
  const getLast6MonthsData = () => {
    const data = [];
    const now = new Date();

    for (let i = 5; i >= 0; i--) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const monthLabel = d.toLocaleString("default", { month: "short" });
      const yearLabel = d.getFullYear().toString().slice(-2);
      const name = `${monthLabel} '${yearLabel}`;

      // Sum all donations in this month and year
      const totalAmount = completed
        .filter((item) => {
          const dateStr = item.donation_date || item.created_at;
          const itemDate = new Date(dateStr);
          return (
            itemDate.getMonth() === d.getMonth() &&
            itemDate.getFullYear() === d.getFullYear()
          );
        })
        .reduce((sum, item) => sum + item.amount * item.exchange_rate_to_base, 0);

      data.push({
        name,
        amount: totalAmount,
      });
    }

    return data;
  };

  const chartData = getLast6MonthsData();
  const hasData = chartData.some((d) => d.amount > 0);

  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: 0.2 }}
      className="rounded-2xl border border-border/50 bg-card/60 p-5 backdrop-blur-glass shadow-glass flex flex-col h-full min-h-[320px]"
    >
      <div className="mb-4">
        <h3 className="text-sm font-semibold text-primary-foreground">Monthly Giving Trend</h3>
        <p className="text-xs text-muted-foreground">Aggregated Completed donations over the last 6 months</p>
      </div>

      <div className="flex-1 min-h-[220px]">
        {hasData ? (
          <ResponsiveContainer width="100%" height={240}>
            <AreaChart data={chartData} margin={{ top: 10, right: 10, left: 10, bottom: 0 }}>
              <defs>
                <linearGradient id="colorAmount" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#6366F1" stopOpacity={0.4} />
                  <stop offset="95%" stopColor="#6366F1" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(255,255,255,0.05)" />
              <XAxis
                dataKey="name"
                stroke="#64748B"
                fontSize={10}
                tickLine={false}
                axisLine={false}
              />
              <YAxis
                stroke="#64748B"
                fontSize={10}
                tickLine={false}
                axisLine={false}
                tickFormatter={(value) => {
                  if (value >= 1000000) return `${(value / 1000000).toFixed(1)}M`;
                  if (value >= 1000) return `${(value / 1000).toFixed(0)}k`;
                  return value;
                }}
              />
              <Tooltip
                content={({ active, payload }) => {
                  if (active && payload && payload.length) {
                    const dataObj = payload[0];
                    return (
                      <div className="rounded-lg border border-border/60 bg-card/90 px-3 py-2 text-xs shadow-glass backdrop-blur-[16px] text-primary-foreground">
                        <p className="font-semibold text-indigo-400">{dataObj.name}</p>
                        <p className="font-medium mt-1">Total: {formatCurrency(dataObj.value as number)}</p>
                      </div>
                    );
                  }
                  return null;
                }}
              />
              <Area
                type="monotone"
                dataKey="amount"
                stroke="#6366F1"
                strokeWidth={2}
                fillOpacity={1}
                fill="url(#colorAmount)"
              />
            </AreaChart>
          </ResponsiveContainer>
        ) : (
          <div className="text-center text-xs text-slate-500 py-16">
            No giving trend data available.
          </div>
        )}
      </div>
    </motion.div>
  );
}
