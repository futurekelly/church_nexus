"use client";

import { motion } from "framer-motion";
import {
  AreaChart, Area, BarChart, Bar, XAxis, YAxis,
  CartesianGrid, Tooltip, ResponsiveContainer,
} from "recharts";
import { cn } from "@/lib/utils";
import type { ChartDataPoint } from "@/features/dashboard/data/mock-dashboard-data";

interface ChartCardProps {
  title: string;
  subtitle?: string;
  data: ChartDataPoint[];
  type?: "area" | "bar" | "dual-bar";
  color?: string;
  color2?: string;
  valuePrefix?: string;
  className?: string;
}

const CustomTooltip = ({
  active,
  payload,
  label,
  valuePrefix = "",
}: {
  active?: boolean;
  payload?: { value: number; name?: string; color?: string }[];
  label?: string;
  valuePrefix?: string;
}) => {
  if (active && payload && payload.length) {
    return (
      <div className="rounded-lg border border-border/60 bg-card/90 px-3 py-2 text-xs shadow-glass backdrop-blur-[16px]">
        <p className="font-medium text-primary-foreground">{label}</p>
        {payload.map((entry, i) => (
          <p key={i} style={{ color: entry.color }} className="mt-0.5">
            {valuePrefix}{entry.value.toLocaleString()}
          </p>
        ))}
      </div>
    );
  }
  return null;
};

export function ChartCard({
  title,
  subtitle,
  data,
  type = "area",
  color = "#8B5CF6",
  color2 = "#3B82F6",
  valuePrefix = "",
  className,
}: ChartCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: 0.3 }}
      className={cn(
        "rounded-2xl border border-border/50 bg-card/60 p-5",
        "backdrop-blur-[16px] shadow-glass",
        className,
      )}
    >
      <div className="mb-4">
        <h3 className="text-sm font-semibold text-primary-foreground">{title}</h3>
        {subtitle && (
          <p className="mt-0.5 text-xs text-muted-foreground">{subtitle}</p>
        )}
      </div>

      <ResponsiveContainer width="100%" height={180}>
        {type === "area" ? (
          <AreaChart data={data} margin={{ top: 4, right: 4, left: -20, bottom: 0 }}>
            <defs>
              <linearGradient id={`grad-${title}`} x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor={color} stopOpacity={0.35} />
                <stop offset="95%" stopColor={color} stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
            <XAxis
              dataKey="label"
              tick={{ fill: "#6B7280", fontSize: 11 }}
              axisLine={false}
              tickLine={false}
            />
            <YAxis
              tick={{ fill: "#6B7280", fontSize: 11 }}
              axisLine={false}
              tickLine={false}
            />
            <Tooltip content={<CustomTooltip valuePrefix={valuePrefix} />} />
            <Area
              type="monotone"
              dataKey="value"
              stroke={color}
              strokeWidth={2}
              fill={`url(#grad-${title})`}
              dot={false}
              activeDot={{ r: 5, fill: color, strokeWidth: 0 }}
            />
          </AreaChart>
        ) : type === "dual-bar" ? (
          <BarChart data={data} margin={{ top: 4, right: 4, left: -20, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
            <XAxis
              dataKey="label"
              tick={{ fill: "#6B7280", fontSize: 11 }}
              axisLine={false}
              tickLine={false}
            />
            <YAxis
              tick={{ fill: "#6B7280", fontSize: 11 }}
              axisLine={false}
              tickLine={false}
            />
            <Tooltip content={<CustomTooltip valuePrefix={valuePrefix} />} />
            <Bar dataKey="value" fill={color} radius={[3, 3, 0, 0]} opacity={0.85} />
            <Bar dataKey="value2" fill={color2} radius={[3, 3, 0, 0]} opacity={0.6} />
          </BarChart>
        ) : (
          <BarChart data={data} margin={{ top: 4, right: 4, left: -20, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
            <XAxis
              dataKey="label"
              tick={{ fill: "#6B7280", fontSize: 11 }}
              axisLine={false}
              tickLine={false}
            />
            <YAxis
              tick={{ fill: "#6B7280", fontSize: 11 }}
              axisLine={false}
              tickLine={false}
            />
            <Tooltip content={<CustomTooltip valuePrefix={valuePrefix} />} />
            <Bar dataKey="value" fill={color} radius={[3, 3, 0, 0]} opacity={0.85} />
          </BarChart>
        )}
      </ResponsiveContainer>
    </motion.div>
  );
}
