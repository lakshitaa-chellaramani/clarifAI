"use client";

import { cn } from "@/lib/utils";
import { HTMLAttributes } from "react";

interface ProgressProps extends HTMLAttributes<HTMLDivElement> {
  value: number;
  max?: number;
  variant?: "default" | "success" | "warning" | "danger";
  showLabel?: boolean;
  size?: "sm" | "md" | "lg";
}

export function Progress({
  value,
  max = 100,
  variant = "default",
  showLabel = false,
  size = "md",
  className,
  ...props
}: ProgressProps) {
  const percentage = Math.min(Math.max((value / max) * 100, 0), 100);

  const sizeClasses = {
    sm: "h-1",
    md: "h-2",
    lg: "h-3",
  };

  const variantClasses = {
    default: "bg-primary",
    success: "bg-success",
    warning: "bg-warning",
    danger: "bg-danger",
  };

  return (
    <div className={cn("w-full", className)} {...props}>
      <div
        className={cn(
          "w-full overflow-hidden rounded-full bg-muted",
          sizeClasses[size]
        )}
      >
        <div
          className={cn(
            "h-full rounded-full transition-all duration-500 ease-out",
            variantClasses[variant]
          )}
          style={{ width: `${percentage}%` }}
        />
      </div>
      {showLabel && (
        <span className="mt-1 text-xs text-muted-foreground">
          {Math.round(percentage)}%
        </span>
      )}
    </div>
  );
}
