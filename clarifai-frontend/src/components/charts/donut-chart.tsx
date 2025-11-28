"use client";

import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from "recharts";

interface DonutChartProps {
  data: {
    name: string;
    value: number;
    color: string;
  }[];
  innerRadius?: number;
  outerRadius?: number;
  centerLabel?: string;
  centerValue?: string;
}

export function DonutChart({
  data,
  innerRadius = 60,
  outerRadius = 90,
  centerLabel,
  centerValue,
}: DonutChartProps) {
  const total = data.reduce((acc, item) => acc + item.value, 0);

  return (
    <div className="relative w-full h-[250px]">
      <ResponsiveContainer width="100%" height="100%">
        <PieChart>
          <defs>
            {data.map((entry, index) => (
              <linearGradient
                key={`gradient-${index}`}
                id={`donutGradient-${index}`}
                x1="0"
                y1="0"
                x2="1"
                y2="1"
              >
                <stop offset="0%" stopColor={entry.color} stopOpacity={1} />
                <stop offset="100%" stopColor={entry.color} stopOpacity={0.7} />
              </linearGradient>
            ))}
            <filter id="donutShadow" x="-20%" y="-20%" width="140%" height="140%">
              <feDropShadow dx="0" dy="2" stdDeviation="4" floodOpacity="0.15" />
            </filter>
          </defs>
          <Pie
            data={data}
            cx="50%"
            cy="50%"
            innerRadius={innerRadius}
            outerRadius={outerRadius}
            paddingAngle={3}
            dataKey="value"
            strokeWidth={0}
            style={{ filter: "url(#donutShadow)" }}
          >
            {data.map((entry, index) => (
              <Cell
                key={`cell-${index}`}
                fill={`url(#donutGradient-${index})`}
                className="transition-all duration-300 hover:opacity-80"
              />
            ))}
          </Pie>
          <Tooltip
            content={({ active, payload }) => {
              if (active && payload && payload.length) {
                const item = payload[0].payload;
                const percentage = ((item.value / total) * 100).toFixed(1);
                return (
                  <div className="bg-background/95 backdrop-blur-sm border border-border rounded-lg shadow-lg p-3">
                    <div className="flex items-center gap-2">
                      <div
                        className="w-3 h-3 rounded-full"
                        style={{ backgroundColor: item.color }}
                      />
                      <span className="font-medium text-sm">{item.name}</span>
                    </div>
                    <div className="mt-1 text-xs text-muted-foreground">
                      <span className="font-semibold text-foreground">
                        {item.value.toLocaleString()}
                      </span>
                      {" "}({percentage}%)
                    </div>
                  </div>
                );
              }
              return null;
            }}
          />
        </PieChart>
      </ResponsiveContainer>

      {/* Center content */}
      {(centerLabel || centerValue) && (
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
          <div className="text-center">
            {centerValue && (
              <p className="text-3xl font-bold text-foreground">{centerValue}</p>
            )}
            {centerLabel && (
              <p className="text-sm text-muted-foreground">{centerLabel}</p>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
