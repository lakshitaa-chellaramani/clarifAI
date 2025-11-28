"use client";

import {
  AreaChart as RechartsAreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

interface AreaChartProps {
  data: {
    name: string;
    value: number;
    value2?: number;
  }[];
  height?: number;
  showGrid?: boolean;
  gradientId?: string;
  primaryColor?: string;
  secondaryColor?: string;
  showSecondary?: boolean;
}

export function AreaChart({
  data,
  height = 300,
  showGrid = true,
  gradientId = "areaGradient",
  primaryColor = "#8B5CF6",
  secondaryColor = "#22C55E",
  showSecondary = false,
}: AreaChartProps) {
  return (
    <div style={{ height }}>
      <ResponsiveContainer width="100%" height="100%">
        <RechartsAreaChart
          data={data}
          margin={{ top: 10, right: 30, left: 0, bottom: 0 }}
        >
          <defs>
            <linearGradient id={gradientId} x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor={primaryColor} stopOpacity={0.4} />
              <stop offset="50%" stopColor={primaryColor} stopOpacity={0.1} />
              <stop offset="100%" stopColor={primaryColor} stopOpacity={0} />
            </linearGradient>
            <linearGradient id={`${gradientId}Secondary`} x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor={secondaryColor} stopOpacity={0.4} />
              <stop offset="50%" stopColor={secondaryColor} stopOpacity={0.1} />
              <stop offset="100%" stopColor={secondaryColor} stopOpacity={0} />
            </linearGradient>
          </defs>
          {showGrid && (
            <CartesianGrid
              strokeDasharray="3 3"
              stroke="hsl(var(--border))"
              vertical={false}
            />
          )}
          <XAxis
            dataKey="name"
            tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 12 }}
            axisLine={{ stroke: "hsl(var(--border))" }}
            tickLine={false}
          />
          <YAxis
            tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 12 }}
            axisLine={false}
            tickLine={false}
          />
          <Tooltip
            content={({ active, payload, label }) => {
              if (active && payload && payload.length) {
                return (
                  <div className="bg-background/95 backdrop-blur-sm border border-border rounded-lg shadow-lg p-3">
                    <p className="text-xs text-muted-foreground mb-2">{label}</p>
                    {payload.map((entry, index) => (
                      <div key={index} className="flex items-center gap-2">
                        <div
                          className="w-2 h-2 rounded-full"
                          style={{ backgroundColor: entry.color }}
                        />
                        <span className="text-sm font-medium">
                          {typeof entry.value === 'number' ? entry.value.toLocaleString() : entry.value}
                        </span>
                        <span className="text-xs text-muted-foreground">
                          {entry.dataKey === "value" ? "Claims" : "Verified"}
                        </span>
                      </div>
                    ))}
                  </div>
                );
              }
              return null;
            }}
          />
          <Area
            type="monotone"
            dataKey="value"
            stroke={primaryColor}
            strokeWidth={2}
            fill={`url(#${gradientId})`}
            dot={false}
            activeDot={{
              r: 6,
              fill: primaryColor,
              stroke: "hsl(var(--background))",
              strokeWidth: 2,
            }}
          />
          {showSecondary && (
            <Area
              type="monotone"
              dataKey="value2"
              stroke={secondaryColor}
              strokeWidth={2}
              fill={`url(#${gradientId}Secondary)`}
              dot={false}
              activeDot={{
                r: 6,
                fill: secondaryColor,
                stroke: "hsl(var(--background))",
                strokeWidth: 2,
              }}
            />
          )}
        </RechartsAreaChart>
      </ResponsiveContainer>
    </div>
  );
}
