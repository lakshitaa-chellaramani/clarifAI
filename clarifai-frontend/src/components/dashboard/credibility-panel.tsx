"use client";

import { cn } from "@/lib/utils";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import {
  TrendingUp,
  TrendingDown,
  Minus,
  ExternalLink,
  Shield,
} from "lucide-react";

interface Source {
  id: string;
  name: string;
  domain: string;
  trustScore: number;
  change: number;
  verifiedClaims: number;
  contradictions: number;
}

interface CredibilityPanelProps {
  sources: Source[];
  className?: string;
}

function getTrustVariant(score: number): "success" | "warning" | "danger" {
  if (score >= 80) return "success";
  if (score >= 50) return "warning";
  return "danger";
}

export function CredibilityPanel({ sources, className }: CredibilityPanelProps) {
  const sortedSources = [...sources].sort((a, b) => b.trustScore - a.trustScore);

  return (
    <Card className={cn("", className)}>
      <CardHeader className="pb-3">
        <div className="flex items-center gap-2">
          <Shield className="h-4 w-4 text-primary" />
          <CardTitle>Source Credibility</CardTitle>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {sortedSources.map((source) => {
          const variant = getTrustVariant(source.trustScore);

          return (
            <div key={source.id} className="space-y-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="text-sm font-medium text-foreground">
                    {source.name}
                  </span>
                  <a
                    href={`https://${source.domain}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-muted-foreground hover:text-foreground"
                  >
                    <ExternalLink className="h-3 w-3" />
                  </a>
                </div>
                <div className="flex items-center gap-2">
                  <Badge variant={variant} className="text-xs">
                    {source.trustScore}%
                  </Badge>
                  {source.change !== 0 && (
                    <span
                      className={cn(
                        "flex items-center text-xs",
                        source.change > 0 ? "text-success" : "text-danger"
                      )}
                    >
                      {source.change > 0 ? (
                        <TrendingUp className="h-3 w-3 mr-0.5" />
                      ) : (
                        <TrendingDown className="h-3 w-3 mr-0.5" />
                      )}
                      {Math.abs(source.change)}%
                    </span>
                  )}
                  {source.change === 0 && (
                    <span className="flex items-center text-xs text-muted-foreground">
                      <Minus className="h-3 w-3" />
                    </span>
                  )}
                </div>
              </div>
              <Progress value={source.trustScore} variant={variant} size="sm" />
              <div className="flex items-center gap-3 text-xs text-muted-foreground">
                <span className="text-success">
                  {source.verifiedClaims} verified
                </span>
                {source.contradictions > 0 && (
                  <span className="text-danger">
                    {source.contradictions} contradictions
                  </span>
                )}
              </div>
            </div>
          );
        })}
      </CardContent>
    </Card>
  );
}
