"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  TrendingUp,
  Shield,
  AlertTriangle,
  CheckCircle2,
  Clock,
  ArrowRight,
  Newspaper,
  Search,
  MessageSquare,
  Video,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { demoTopics, demoClaims, demoStats, demoSources } from "@/data/demo-data";

// Stats Card Component
function StatCard({
  title,
  value,
  suffix,
  icon: Icon,
  trend,
  color = "primary",
}: {
  title: string;
  value: number;
  suffix?: string;
  icon: React.ElementType;
  trend?: number;
  color?: "primary" | "success" | "warning" | "danger";
}) {
  const colorClasses = {
    primary: "text-primary bg-primary/10",
    success: "text-success bg-success/10",
    warning: "text-warning bg-warning/10",
    danger: "text-danger bg-danger/10",
  };

  return (
    <Card>
      <CardContent className="p-5">
        <div className="flex items-start justify-between">
          <div>
            <p className="text-sm text-muted-foreground">{title}</p>
            <p className="text-2xl font-semibold mt-1">
              {value.toLocaleString()}
              {suffix && <span className="text-lg text-muted-foreground">{suffix}</span>}
            </p>
            {trend !== undefined && (
              <p className={cn("text-xs mt-1", trend >= 0 ? "text-success" : "text-danger")}>
                {trend >= 0 ? "+" : ""}{trend}% from last hour
              </p>
            )}
          </div>
          <div className={cn("p-2.5 rounded-lg", colorClasses[color])}>
            <Icon className="h-5 w-5" />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

// Topic Card Component
function TopicCard({
  topic,
}: {
  topic: typeof demoTopics[0];
}) {
  const getRiskColor = (score: number) => {
    if (score >= 7) return "danger";
    if (score >= 4) return "warning";
    return "success";
  };

  const riskColor = getRiskColor(topic.riskScore);

  return (
    <Link href={`/news/${topic.id}`}>
      <Card hover className="h-full">
        <CardContent className="p-5">
          <div className="flex items-start justify-between gap-3">
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-2">
                {topic.isNew && (
                  <Badge variant="default" className="text-[10px]">NEW</Badge>
                )}
                <Badge variant={riskColor}>Risk: {topic.riskScore}/10</Badge>
              </div>
              <h3 className="font-medium text-foreground line-clamp-2">{topic.title}</h3>
              <div className="flex items-center gap-4 mt-3 text-sm text-muted-foreground">
                <span>{topic.sourceCount} sources</span>
                <span>{topic.claimCount} claims</span>
              </div>
            </div>
            <ArrowRight className="h-4 w-4 text-muted-foreground shrink-0" />
          </div>
        </CardContent>
      </Card>
    </Link>
  );
}

// Claim Item Component
function ClaimItem({ claim }: { claim: typeof demoClaims[0] }) {
  const statusConfig = {
    verified: { icon: CheckCircle2, color: "text-success", bg: "bg-success/10" },
    conflict: { icon: AlertTriangle, color: "text-warning", bg: "bg-warning/10" },
    false: { icon: AlertTriangle, color: "text-danger", bg: "bg-danger/10" },
    checking: { icon: Clock, color: "text-muted-foreground", bg: "bg-muted" },
  };

  const config = statusConfig[claim.status];
  const Icon = config.icon;

  const timeAgo = (date: string) => {
    const mins = Math.floor((Date.now() - new Date(date).getTime()) / 60000);
    if (mins < 60) return `${mins}m ago`;
    return `${Math.floor(mins / 60)}h ago`;
  };

  return (
    <div className="flex gap-3 py-3 border-b border-border last:border-0">
      <div className={cn("p-1.5 rounded-full h-fit", config.bg)}>
        <Icon className={cn("h-3.5 w-3.5", config.color)} />
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-sm text-foreground line-clamp-2">{claim.text}</p>
        <div className="flex items-center gap-2 mt-1.5 text-xs text-muted-foreground">
          <span>{claim.source}</span>
          <span>·</span>
          <span>{timeAgo(claim.timestamp)}</span>
        </div>
      </div>
    </div>
  );
}

// Quick Action Card
function QuickAction({
  title,
  description,
  icon: Icon,
  href,
}: {
  title: string;
  description: string;
  icon: React.ElementType;
  href: string;
}) {
  return (
    <Link href={href}>
      <Card hover className="h-full">
        <CardContent className="p-5">
          <div className="flex items-center gap-4">
            <div className="p-3 rounded-lg bg-primary/10">
              <Icon className="h-5 w-5 text-primary" />
            </div>
            <div>
              <h3 className="font-medium text-foreground">{title}</h3>
              <p className="text-sm text-muted-foreground mt-0.5">{description}</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </Link>
  );
}

export default function DashboardPage() {
  const [stats, setStats] = useState(demoStats);
  const [topics, setTopics] = useState(demoTopics);
  const [claims, setClaims] = useState(demoClaims);

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Page Header */}
      <div>
        <h1 className="text-2xl font-semibold text-foreground">Dashboard</h1>
        <p className="text-muted-foreground mt-1">
          Real-time misinformation monitoring and fact-checking
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Claims Analyzed"
          value={stats.claimsAnalyzed}
          icon={Shield}
          trend={12}
          color="primary"
        />
        <StatCard
          title="Accuracy Rate"
          value={stats.accuracyRate}
          suffix="%"
          icon={CheckCircle2}
          trend={2}
          color="success"
        />
        <StatCard
          title="Sources Tracked"
          value={stats.sourcesTracked}
          icon={Newspaper}
          color="primary"
        />
        <StatCard
          title="Misinfo Detected"
          value={stats.misinfoDetected}
          icon={AlertTriangle}
          trend={-5}
          color="warning"
        />
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <QuickAction
          title="Browse News"
          description="Explore today's fact-checked stories"
          icon={Newspaper}
          href="/news"
        />
        <QuickAction
          title="Search Topics"
          description="Search any topic for verification"
          icon={Search}
          href="/search"
        />
        <QuickAction
          title="AI Chat"
          description="Ask questions with source citations"
          icon={MessageSquare}
          href="/chat"
        />
        <QuickAction
          title="AI Anchor"
          description="Generate video news briefings"
          icon={Video}
          href="/anchor"
        />
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Trending Topics */}
        <div className="lg:col-span-2">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="h-4 w-4 text-primary" />
                Trending Topics
              </CardTitle>
              <Link href="/news">
                <Button variant="ghost" size="sm">
                  View all <ArrowRight className="h-3 w-3 ml-1" />
                </Button>
              </Link>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {topics.slice(0, 4).map((topic) => (
                  <TopicCard key={topic.id} topic={topic} />
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Recent Claims */}
        <div>
          <Card className="h-fit">
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle className="flex items-center gap-2">
                <Shield className="h-4 w-4 text-primary" />
                Recent Claims
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-0">
                {claims.slice(0, 5).map((claim) => (
                  <ClaimItem key={claim.id} claim={claim} />
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Source Trust Scores */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CheckCircle2 className="h-4 w-4 text-primary" />
            Source Credibility
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
            {demoSources.map((source) => (
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
                      "font-semibold",
                      source.trustScore >= 80
                        ? "text-success"
                        : source.trustScore >= 50
                        ? "text-warning"
                        : "text-danger"
                    )}
                  >
                    {source.trustScore}%
                  </p>
                  {source.change !== 0 && (
                    <p
                      className={cn(
                        "text-xs",
                        source.change > 0 ? "text-success" : "text-danger"
                      )}
                    >
                      {source.change > 0 ? "+" : ""}{source.change}
                    </p>
                  )}
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
