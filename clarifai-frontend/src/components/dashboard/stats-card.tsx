"use client";

import { cn } from "@/lib/utils";
import { Card, CardContent } from "@/components/ui/card";
import { LucideIcon } from "lucide-react";
import { useEffect, useState } from "react";

interface StatsCardProps {
  title: string;
  value: number;
  suffix?: string;
  icon: LucideIcon;
  trend?: {
    value: number;
    isPositive: boolean;
  };
  className?: string;
  animate?: boolean;
}

export function StatsCard({
  title,
  value,
  suffix = "",
  icon: Icon,
  trend,
  className,
  animate = true,
}: StatsCardProps) {
  const [displayValue, setDisplayValue] = useState(animate ? 0 : value);

  useEffect(() => {
    if (!animate) {
      setDisplayValue(value);
      return;
    }

    const duration = 1000;
    const steps = 30;
    const stepValue = value / steps;
    let current = 0;

    const interval = setInterval(() => {
      current += stepValue;
      if (current >= value) {
        setDisplayValue(value);
        clearInterval(interval);
      } else {
        setDisplayValue(Math.floor(current));
      }
    }, duration / steps);

    return () => clearInterval(interval);
  }, [value, animate]);

  return (
    <Card className={cn("", className)}>
      <CardContent className="p-4">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-xs font-medium text-muted-foreground">{title}</p>
            <div className="flex items-baseline gap-1 mt-1">
              <span className="text-2xl font-bold text-foreground">
                {displayValue.toLocaleString()}
              </span>
              {suffix && (
                <span className="text-sm text-muted-foreground">{suffix}</span>
              )}
            </div>
            {trend && (
              <p
                className={cn(
                  "text-xs mt-1",
                  trend.isPositive ? "text-success" : "text-danger"
                )}
              >
                {trend.isPositive ? "+" : ""}
                {trend.value}% from last hour
              </p>
            )}
          </div>
          <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center">
            <Icon className="h-5 w-5 text-primary" />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
