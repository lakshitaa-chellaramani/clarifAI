"use client";

import {
  BarChart as RechartsBarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell,
} from "recharts";

interface BarChartProps {
  data: {
    name: string;
    value: number;
    color?: string;
  }[];
  dataKey?: string;
  xAxisKey?: string;
  height?: number;
  layout?: "horizontal" | "vertical";
  showGrid?: boolean;
  barRadius?: number;
  gradientColors?: [string, string];
}

export function BarChart({
  data,
  dataKey = "value",
  xAxisKey = "name",
  height = 300,
  layout = "vertical",
  showGrid = true,
  barRadius = 6,
  gradientColors = ["#8B5CF6", "#C4B5FD"],
}: BarChartProps) {
  const getColor = (value: number) => {
    // Color based on value (for accuracy/percentage metrics)
    if (value >= 90) return "#22C55E"; // Green
    if (value >= 80) return "#8B5CF6"; // Purple
    if (value >= 70) return "#F59E0B"; // Yellow
    return "#EF4444"; // Red
  };

  return (
    <div style={{ height }}>
      <ResponsiveContainer width="100%" height="100%">
        <RechartsBarChart
          data={data}
          layout={layout}
          margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
        >
          <defs>
            <linearGradient id="barGradient" x1="0" y1="0" x2="1" y2="0">
              <stop offset="0%" stopColor={gradientColors[0]} />
              <stop offset="100%" stopColor={gradientColors[1]} />
            </linearGradient>
            <filter id="barShadow" x="-10%" y="-10%" width="120%" height="120%">
              <feDropShadow dx="0" dy="1" stdDeviation="2" floodOpacity="0.1" />
            </filter>
          </defs>
          {showGrid && (
            <CartesianGrid
              strokeDasharray="3 3"
              stroke="hsl(var(--border))"
              horizontal={layout === "vertical"}
              vertical={layout === "horizontal"}
            />
          )}
          {layout === "vertical" ? (
            <>
              <XAxis
                type="number"
                domain={[0, 100]}
                tickFormatter={(value) => `${value}%`}
                tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 12 }}
                axisLine={{ stroke: "hsl(var(--border))" }}
                tickLine={{ stroke: "hsl(var(--border))" }}
              />
              <YAxis
                type="category"
                dataKey={xAxisKey}
                tick={{ fill: "hsl(var(--foreground))", fontSize: 12 }}
                axisLine={false}
                tickLine={false}
                width={100}
              />
            </>
          ) : (
            <>
              <XAxis
                dataKey={xAxisKey}
                tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 12 }}
                axisLine={{ stroke: "hsl(var(--border))" }}
                tickLine={{ stroke: "hsl(var(--border))" }}
              />
              <YAxis
                tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 12 }}
                axisLine={false}
                tickLine={false}
              />
            </>
          )}
          <Tooltip
            content={({ active, payload }) => {
              if (active && payload && payload.length) {
                const item = payload[0].payload;
                return (
                  <div className="bg-background/95 backdrop-blur-sm border border-border rounded-lg shadow-lg p-3">
                    <p className="font-medium text-sm">{item.name}</p>
                    <p className="text-lg font-bold text-primary mt-1">
                      {item.value}%
                    </p>
                    {item.claims && (
                      <p className="text-xs text-muted-foreground">
                        {item.claims} claims analyzed
                      </p>
                    )}
                  </div>
                );
              }
              return null;
            }}
          />
          <Bar
            dataKey={dataKey}
            radius={barRadius}
            style={{ filter: "url(#barShadow)" }}
          >
            {data.map((entry, index) => (
              <Cell
                key={`cell-${index}`}
                fill={entry.color || getColor(entry.value)}
                className="transition-opacity duration-300 hover:opacity-80"
              />
            ))}
          </Bar>
        </RechartsBarChart>
      </ResponsiveContainer>
    </div>
  );
}
