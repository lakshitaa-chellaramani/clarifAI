"use client";

import { cn, formatTimeAgo } from "@/lib/utils";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  CheckCircle2,
  AlertTriangle,
  XCircle,
  Clock,
  MessageSquare,
} from "lucide-react";

type ClaimStatus = "verified" | "conflict" | "false" | "checking";

interface Claim {
  id: string;
  text: string;
  source: string;
  timestamp: string;
  status: ClaimStatus;
}

interface ClaimFeedProps {
  claims: Claim[];
  className?: string;
}

const statusConfig: Record<
  ClaimStatus,
  { icon: typeof CheckCircle2; label: string; variant: "success" | "warning" | "danger" | "outline" }
> = {
  verified: {
    icon: CheckCircle2,
    label: "Verified",
    variant: "success",
  },
  conflict: {
    icon: AlertTriangle,
    label: "Conflicts",
    variant: "warning",
  },
  false: {
    icon: XCircle,
    label: "False",
    variant: "danger",
  },
  checking: {
    icon: Clock,
    label: "Checking",
    variant: "outline",
  },
};

export function ClaimFeed({ claims, className }: ClaimFeedProps) {
  return (
    <Card className={cn("", className)}>
      <CardHeader className="pb-3">
        <div className="flex items-center gap-2">
          <MessageSquare className="h-4 w-4 text-primary" />
          <CardTitle>Live Claim Feed</CardTitle>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {claims.map((claim, index) => {
            const config = statusConfig[claim.status as ClaimStatus] || statusConfig.checking;
            const Icon = config.icon;

            return (
              <div
                key={claim.id}
                className={cn(
                  "flex items-start gap-3 p-3 rounded-lg border border-border bg-muted/30 animate-fade-in",
                  index === 0 && "border-primary/30 bg-primary/5"
                )}
                style={{ animationDelay: `${index * 50}ms` }}
              >
                <div className="shrink-0 mt-0.5">
                  <Icon
                    className={cn(
                      "h-4 w-4",
                      claim.status === "verified" && "text-success",
                      claim.status === "conflict" && "text-warning",
                      claim.status === "false" && "text-danger",
                      claim.status === "checking" && "text-muted-foreground"
                    )}
                  />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm text-foreground line-clamp-2">
                    "{claim.text}"
                  </p>
                  <div className="flex items-center gap-2 mt-2">
                    <span className="text-xs text-muted-foreground">
                      {claim.source}
                    </span>
                    <span className="text-xs text-muted-foreground">•</span>
                    <span className="text-xs text-muted-foreground">
                      {formatTimeAgo(claim.timestamp)}
                    </span>
                  </div>
                </div>
                <Badge variant={config.variant} className="shrink-0">
                  {config.label}
                </Badge>
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}
