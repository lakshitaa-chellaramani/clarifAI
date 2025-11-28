"use client";

import { useState } from "react";
import Link from "next/link";
import {
  Search,
  Filter,
  ArrowRight,
  AlertTriangle,
  CheckCircle2,
  Clock,
  TrendingUp,
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { demoTopics } from "@/data/demo-data";

type RiskFilter = "all" | "high" | "medium" | "low";

export default function NewsPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [riskFilter, setRiskFilter] = useState<RiskFilter>("all");

  const filteredTopics = demoTopics.filter((topic) => {
    const matchesSearch = topic.title.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesRisk =
      riskFilter === "all" ||
      (riskFilter === "high" && topic.riskScore >= 7) ||
      (riskFilter === "medium" && topic.riskScore >= 4 && topic.riskScore < 7) ||
      (riskFilter === "low" && topic.riskScore < 4);
    return matchesSearch && matchesRisk;
  });

  const getRiskColor = (score: number) => {
    if (score >= 7) return "danger";
    if (score >= 4) return "warning";
    return "success";
  };

  const getRiskLabel = (score: number) => {
    if (score >= 7) return "High Risk";
    if (score >= 4) return "Medium Risk";
    return "Low Risk";
  };

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Page Header */}
      <div>
        <h1 className="text-2xl font-semibold text-foreground">Today's News</h1>
        <p className="text-muted-foreground mt-1">
          Fact-checked stories with confidence scores and source verification
        </p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="flex items-center gap-3 p-4 rounded-lg bg-danger/5 border border-danger/10">
          <AlertTriangle className="h-5 w-5 text-danger" />
          <div>
            <p className="text-2xl font-semibold text-danger">
              {demoTopics.filter(t => t.riskScore >= 7).length}
            </p>
            <p className="text-xs text-muted-foreground">High Risk</p>
          </div>
        </div>
        <div className="flex items-center gap-3 p-4 rounded-lg bg-warning/5 border border-warning/10">
          <Clock className="h-5 w-5 text-warning" />
          <div>
            <p className="text-2xl font-semibold text-warning">
              {demoTopics.filter(t => t.riskScore >= 4 && t.riskScore < 7).length}
            </p>
            <p className="text-xs text-muted-foreground">Medium Risk</p>
          </div>
        </div>
        <div className="flex items-center gap-3 p-4 rounded-lg bg-success/5 border border-success/10">
          <CheckCircle2 className="h-5 w-5 text-success" />
          <div>
            <p className="text-2xl font-semibold text-success">
              {demoTopics.filter(t => t.riskScore < 4).length}
            </p>
            <p className="text-xs text-muted-foreground">Low Risk</p>
          </div>
        </div>
        <div className="flex items-center gap-3 p-4 rounded-lg bg-primary/5 border border-primary/10">
          <TrendingUp className="h-5 w-5 text-primary" />
          <div>
            <p className="text-2xl font-semibold text-primary">
              {demoTopics.filter(t => t.isNew).length}
            </p>
            <p className="text-xs text-muted-foreground">New Today</p>
          </div>
        </div>
      </div>

      {/* Search and Filter */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <input
            type="text"
            placeholder="Search topics..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full h-10 pl-9 pr-4 rounded-lg border border-border bg-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
          />
        </div>
        <div className="flex items-center gap-2">
          <Filter className="h-4 w-4 text-muted-foreground" />
          <div className="flex gap-1 p-1 bg-muted rounded-lg">
            {(["all", "high", "medium", "low"] as const).map((level) => (
              <button
                key={level}
                onClick={() => setRiskFilter(level)}
                className={cn(
                  "px-3 py-1.5 rounded-md text-sm font-medium transition-colors capitalize",
                  riskFilter === level
                    ? "bg-background text-foreground shadow-sm"
                    : "text-muted-foreground hover:text-foreground"
                )}
              >
                {level}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Topics List */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {filteredTopics.map((topic) => (
          <Link key={topic.id} href={`/news/${topic.id}`}>
            <Card hover className="h-full">
              <CardContent className="p-5">
                <div className="flex items-start gap-4">
                  {/* Risk Score Circle */}
                  <div className="relative flex-shrink-0">
                    <svg className="w-14 h-14 -rotate-90" viewBox="0 0 36 36">
                      <path
                        d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="3"
                        className="text-muted"
                      />
                      <path
                        d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="3"
                        strokeDasharray={`${topic.riskScore * 10}, 100`}
                        className={cn(
                          topic.riskScore >= 7
                            ? "text-danger"
                            : topic.riskScore >= 4
                            ? "text-warning"
                            : "text-success"
                        )}
                      />
                    </svg>
                    <div className="absolute inset-0 flex items-center justify-center">
                      <span className="text-sm font-semibold">{topic.riskScore}</span>
                    </div>
                  </div>

                  {/* Content */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-2">
                      {topic.isNew && (
                        <Badge variant="default" className="text-[10px]">NEW</Badge>
                      )}
                      <Badge variant={getRiskColor(topic.riskScore)}>
                        {getRiskLabel(topic.riskScore)}
                      </Badge>
                    </div>
                    <h3 className="font-medium text-foreground line-clamp-2 mb-2">
                      {topic.title}
                    </h3>
                    <div className="flex items-center gap-4 text-sm text-muted-foreground">
                      <span>{topic.sourceCount} sources</span>
                      <span>{topic.claimCount} claims</span>
                    </div>
                  </div>

                  <ArrowRight className="h-4 w-4 text-muted-foreground shrink-0" />
                </div>
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>

      {filteredTopics.length === 0 && (
        <div className="text-center py-12">
          <Search className="h-12 w-12 text-muted-foreground/30 mx-auto" />
          <p className="text-muted-foreground mt-4">No topics found matching your criteria</p>
          <Button
            variant="outline"
            className="mt-4"
            onClick={() => {
              setSearchQuery("");
              setRiskFilter("all");
            }}
          >
            Clear filters
          </Button>
        </div>
      )}
    </div>
  );
}
