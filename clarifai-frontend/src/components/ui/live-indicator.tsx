"use client";

import { cn } from "@/lib/utils";

interface LiveIndicatorProps {
  className?: string;
  label?: string;
}

export function LiveIndicator({
  className,
  label = "LIVE",
}: LiveIndicatorProps) {
  return (
    <div className={cn("flex items-center gap-2", className)}>
      <span className="relative flex h-2 w-2">
        <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-danger opacity-75" />
        <span className="relative inline-flex h-2 w-2 rounded-full bg-danger" />
      </span>
      <span className="text-xs font-semibold text-danger">{label}</span>
    </div>
  );
}
