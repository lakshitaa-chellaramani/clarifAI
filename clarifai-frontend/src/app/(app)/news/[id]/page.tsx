"use client";

import { useParams } from "next/navigation";
import Link from "next/link";
import {
  ArrowLeft,
  AlertTriangle,
  CheckCircle2,
  Clock,
  ExternalLink,
  Share2,
  Video,
  MessageSquare,
  Scale,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { KnowledgeGraph } from "@/components/dashboard/knowledge-graph";
import { cn } from "@/lib/utils";
import {
  demoTopics,
  demoClaims,
  demoSources,
  demoGraphNodes,
  demoGraphEdges,
} from "@/data/demo-data";

export default function TopicDetailPage() {
  const params = useParams();
  const topicId = params.id as string;

  const topic = demoTopics.find((t) => t.id === topicId) || demoTopics[0];

  const getRiskColor = (score: number) => {
    if (score >= 7) return "danger";
    if (score >= 4) return "warning";
    return "success";
  };

  const getStatusConfig = (status: string) => {
    switch (status) {
      case "verified":
        return { icon: CheckCircle2, color: "text-success", bg: "bg-success/10", label: "Verified" };
      case "conflict":
        return { icon: AlertTriangle, color: "text-warning", bg: "bg-warning/10", label: "Conflicting" };
      case "false":
        return { icon: AlertTriangle, color: "text-danger", bg: "bg-danger/10", label: "False" };
      default:
        return { icon: Clock, color: "text-muted-foreground", bg: "bg-muted", label: "Checking" };
    }
  };

  const timeAgo = (date: string) => {
    const mins = Math.floor((Date.now() - new Date(date).getTime()) / 60000);
    if (mins < 60) return `${mins}m ago`;
    return `${Math.floor(mins / 60)}h ago`;
  };

  // Find contradicting claims for comparison
  const conflictingClaims = demoClaims.filter((c) => c.status === "conflict");

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Breadcrumb */}
      <div className="flex items-center gap-2 text-sm">
        <Link
          href="/news"
          className="flex items-center gap-1 text-muted-foreground hover:text-foreground transition-colors"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to News
        </Link>
      </div>

      {/* Topic Header */}
      <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-4">
        <div className="flex-1">
          <div className="flex items-center gap-3 mb-3">
            {topic.isNew && <Badge variant="default">NEW</Badge>}
            <Badge variant={getRiskColor(topic.riskScore)}>
              Risk Score: {topic.riskScore}/10
            </Badge>
          </div>
          <h1 className="text-2xl font-semibold text-foreground">{topic.title}</h1>
          <div className="flex items-center gap-4 mt-3 text-sm text-muted-foreground">
            <span>{topic.sourceCount} sources analyzed</span>
            <span>{topic.claimCount} claims tracked</span>
            <span>Updated 5 min ago</span>
          </div>
        </div>
        <div className="flex gap-2">
          <Link href={`/anchor?topic=${topicId}`}>
            <Button variant="outline" size="sm">
              <Video className="h-4 w-4 mr-1" />
              Generate Video
            </Button>
          </Link>
          <Link href={`/chat?topic=${topicId}`}>
            <Button variant="outline" size="sm">
              <MessageSquare className="h-4 w-4 mr-1" />
              Ask AI
            </Button>
          </Link>
          <Button variant="outline" size="sm">
            <Share2 className="h-4 w-4 mr-1" />
            Share
          </Button>
        </div>
      </div>

      {/* Knowledge Graph - Prominent */}
      <KnowledgeGraph
        nodes={demoGraphNodes}
        edges={demoGraphEdges}
        height={500}
        showHeader={true}
      />

      {/* Claims Comparison */}
      {conflictingClaims.length >= 2 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <Scale className="h-4 w-4 text-primary" />
              Claim Comparison
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {conflictingClaims.slice(0, 2).map((claim, index) => {
                const config = getStatusConfig(claim.status);
                return (
                  <div
                    key={claim.id}
                    className={cn(
                      "p-4 rounded-lg border",
                      index === 0 ? "bg-warning/5 border-warning/20" : "bg-muted/50 border-border"
                    )}
                  >
                    <div className="flex items-center gap-2 mb-3">
                      <Badge variant={index === 0 ? "warning" : "outline"}>
                        {index === 0 ? "Claim A" : "Claim B"}
                      </Badge>
                      <span className="text-xs text-muted-foreground">{claim.source}</span>
                    </div>
                    <p className="text-sm text-foreground">{claim.text}</p>
                    <div className="mt-3 pt-3 border-t border-border">
                      <p className="text-xs text-muted-foreground">
                        {index === 0
                          ? "This claim contradicts other sources and requires verification."
                          : "This claim aligns with official statements."}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
            <div className="mt-4 p-4 rounded-lg bg-primary/5 border border-primary/10">
              <p className="text-sm text-foreground">
                <strong className="text-primary">Our Analysis:</strong> Based on cross-referencing{" "}
                {topic.sourceCount} sources, we find Claim B to be more consistent with verified
                information. Claim A appears to originate from unverified sources.
              </p>
            </div>
          </CardContent>
        </Card>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* All Claims */}
        <div className="lg:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">All Claims</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-0">
                {demoClaims.map((claim) => {
                  const config = getStatusConfig(claim.status);
                  const Icon = config.icon;
                  return (
                    <div
                      key={claim.id}
                      className="flex gap-3 py-4 border-b border-border last:border-0"
                    >
                      <div className={cn("p-1.5 rounded-full h-fit", config.bg)}>
                        <Icon className={cn("h-4 w-4", config.color)} />
                      </div>
                      <div className="flex-1">
                        <p className="text-sm text-foreground">{claim.text}</p>
                        <div className="flex items-center gap-3 mt-2">
                          <Badge variant="outline" className="text-xs">
                            {config.label}
                          </Badge>
                          <span className="text-xs text-muted-foreground">{claim.source}</span>
                          <span className="text-xs text-muted-foreground">
                            {timeAgo(claim.timestamp)}
                          </span>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Sources */}
        <div>
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Sources</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {demoSources.slice(0, 5).map((source) => (
                  <div
                    key={source.id}
                    className="flex items-center justify-between p-3 rounded-lg bg-muted/50"
                  >
                    <div>
                      <p className="font-medium text-sm">{source.name}</p>
                      <p className="text-xs text-muted-foreground">{source.domain}</p>
                    </div>
                    <div className="text-right">
                      <p
                        className={cn(
                          "font-semibold text-sm",
                          source.trustScore >= 80
                            ? "text-success"
                            : source.trustScore >= 50
                            ? "text-warning"
                            : "text-danger"
                        )}
                      >
                        {source.trustScore}%
                      </p>
                      <p className="text-xs text-muted-foreground">trust score</p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Quick Actions */}
          <Card className="mt-4">
            <CardContent className="p-4">
              <p className="text-sm font-medium mb-3">Quick Actions</p>
              <div className="space-y-2">
                <Link href={`/anchor?topic=${topicId}`} className="block">
                  <Button variant="outline" className="w-full justify-start" size="sm">
                    <Video className="h-4 w-4 mr-2" />
                    Generate News Video
                  </Button>
                </Link>
                <Link href={`/chat?topic=${topicId}`} className="block">
                  <Button variant="outline" className="w-full justify-start" size="sm">
                    <MessageSquare className="h-4 w-4 mr-2" />
                    Discuss with AI
                  </Button>
                </Link>
                <Button variant="outline" className="w-full justify-start" size="sm">
                  <ExternalLink className="h-4 w-4 mr-2" />
                  View Original Sources
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
