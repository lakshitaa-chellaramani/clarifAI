"use client";

import { useState } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import {
  Search,
  Filter,
  ArrowRight,
  AlertTriangle,
  CheckCircle2,
  Clock,
  TrendingUp,
  Scale,
  X,
  Shield,
  ExternalLink,
  ThumbsUp,
  ThumbsDown,
  Sparkles,
  ChevronRight,
  Zap,
  FileText,
  Building2,
  Quote,
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { demoTopics } from "@/data/demo-data";

type RiskFilter = "all" | "high" | "medium" | "low";

// Karnataka Comparative Analysis Data
const karnatakaAnalysis = {
  topic: "Karnataka Congress Leadership Crisis",
  lastUpdated: "2 minutes ago",
  claim1: {
    text: "CM Siddaramaiah has submitted resignation to Congress high command",
    source: "Times of India",
    sourceScore: 94,
    timestamp: "Today, 2:34 PM",
    evidence: [
      "Anonymous sources within Congress party",
      "Reported meeting with AICC observers",
      "Historical pattern of leadership changes",
    ],
    supporting: ["India Today", "Deccan Herald"],
    against: ["NDTV", "The Hindu"],
  },
  claim2: {
    text: "CM Siddaramaiah has NOT resigned and continues as Chief Minister",
    source: "NDTV",
    sourceScore: 87,
    timestamp: "Today, 2:41 PM",
    evidence: [
      "Official statement from CM's office",
      "No resignation letter filed with Governor",
      "CM seen attending scheduled meetings",
    ],
    supporting: ["The Hindu", "Hindustan Times"],
    against: ["Times of India", "India Today"],
  },
  analysis: {
    factorsConsidered: [
      {
        factor: "Official Government Records",
        weight: "High",
        finding: "No resignation letter filed with Raj Bhavan",
        supports: "Claim 2",
      },
      {
        factor: "Source Reliability",
        weight: "High",
        finding: "Both sources are credible mainstream media",
        supports: "Neutral",
      },
      {
        factor: "Official Statements",
        weight: "High",
        finding: "CM's office issued denial; no confirmation from party",
        supports: "Claim 2",
      },
      {
        factor: "Corroborating Evidence",
        weight: "Medium",
        finding: "CM photographed at official event after alleged resignation",
        supports: "Claim 2",
      },
      {
        factor: "Historical Context",
        weight: "Low",
        finding: "Similar rumors circulated in 2023, proved false",
        supports: "Claim 2",
      },
    ],
    timeline: [
      { time: "1:15 PM", event: "First reports emerge on social media", type: "rumor" },
      { time: "2:34 PM", event: "Times of India publishes resignation story", type: "claim1" },
      { time: "2:41 PM", event: "NDTV reports CM has not resigned", type: "claim2" },
      { time: "3:05 PM", event: "CM's office issues official denial", type: "official" },
      { time: "3:22 PM", event: "CM seen at scheduled infrastructure meeting", type: "evidence" },
    ],
  },
  verdict: {
    conclusion: "No Resignation Filed",
    confidence: 87,
    summary: "Based on official records, statements from CM's office, and photographic evidence of CM attending scheduled events, Claim 2 is determined to be accurate. While leadership discussions may be ongoing within the party, no formal resignation has been submitted.",
    recommendation: "Treat Claim 1 as UNVERIFIED speculation. Rely on official government communications for accurate information.",
  },
};

export default function NewsPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [riskFilter, setRiskFilter] = useState<RiskFilter>("all");
  const [showAnalysisModal, setShowAnalysisModal] = useState(false);

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

      {/* Featured Comparative Analysis Card */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative overflow-hidden rounded-xl border border-amber-500/30 bg-gradient-to-br from-amber-500/5 via-background to-red-500/5"
      >
        <div className="absolute top-0 right-0 w-64 h-64 bg-amber-500/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />
        <div className="absolute bottom-0 left-0 w-48 h-48 bg-red-500/10 rounded-full blur-3xl translate-y-1/2 -translate-x-1/2" />

        <div className="relative p-6">
          {/* Header */}
          <div className="flex items-start justify-between mb-6">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-amber-500/20">
                <Scale className="w-5 h-5 text-amber-500" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="font-semibold text-foreground">Claim Conflict Detected</h3>
                  <Badge variant="warning" className="animate-pulse">LIVE</Badge>
                </div>
                <p className="text-sm text-muted-foreground">{karnatakaAnalysis.topic}</p>
              </div>
            </div>
            <span className="text-xs text-muted-foreground">{karnatakaAnalysis.lastUpdated}</span>
          </div>

          {/* Two Claims Comparison */}
          <div className="grid md:grid-cols-2 gap-4 mb-6">
            {/* Claim 1 */}
            <div className="p-4 rounded-xl bg-red-500/10 border border-red-500/20">
              <div className="flex items-center gap-2 mb-3">
                <ThumbsDown className="w-4 h-4 text-red-400" />
                <span className="text-xs font-medium text-red-400">DISPUTED</span>
              </div>
              <p className="text-sm text-foreground font-medium mb-3 line-clamp-2">
                "{karnatakaAnalysis.claim1.text}"
              </p>
              <div className="flex items-center gap-2 text-xs text-muted-foreground">
                <Building2 className="w-3 h-3" />
                <span>{karnatakaAnalysis.claim1.source}</span>
                <span className="text-red-400">({karnatakaAnalysis.claim1.sourceScore}% trust)</span>
              </div>
            </div>

            {/* Claim 2 */}
            <div className="p-4 rounded-xl bg-green-500/10 border border-green-500/20">
              <div className="flex items-center gap-2 mb-3">
                <ThumbsUp className="w-4 h-4 text-green-400" />
                <span className="text-xs font-medium text-green-400">VERIFIED</span>
              </div>
              <p className="text-sm text-foreground font-medium mb-3 line-clamp-2">
                "{karnatakaAnalysis.claim2.text}"
              </p>
              <div className="flex items-center gap-2 text-xs text-muted-foreground">
                <Building2 className="w-3 h-3" />
                <span>{karnatakaAnalysis.claim2.source}</span>
                <span className="text-green-400">({karnatakaAnalysis.claim2.sourceScore}% trust)</span>
              </div>
            </div>
          </div>

          {/* Quick Verdict */}
          <div className="flex items-center justify-between p-4 rounded-xl bg-background/50 border border-border">
            <div className="flex items-center gap-4">
              <div className="relative">
                <svg className="w-16 h-16 -rotate-90" viewBox="0 0 36 36">
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
                    strokeDasharray={`${karnatakaAnalysis.verdict.confidence}, 100`}
                    className="text-green-500"
                  />
                </svg>
                <div className="absolute inset-0 flex items-center justify-center">
                  <span className="text-lg font-bold text-green-500">{karnatakaAnalysis.verdict.confidence}%</span>
                </div>
              </div>
              <div>
                <p className="text-xs text-muted-foreground mb-1">AI Verdict</p>
                <p className="font-semibold text-foreground">{karnatakaAnalysis.verdict.conclusion}</p>
                <p className="text-xs text-muted-foreground mt-1">Based on 5 factors analyzed</p>
              </div>
            </div>
            <Button
              onClick={() => setShowAnalysisModal(true)}
              className="gap-2"
            >
              <Sparkles className="w-4 h-4" />
              View Full Analysis
              <ChevronRight className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </motion.div>

      {/* Analysis Modal */}
      <AnimatePresence>
        {showAnalysisModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
            onClick={() => setShowAnalysisModal(false)}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="relative w-full max-w-4xl max-h-[90vh] overflow-y-auto rounded-2xl bg-background border border-border shadow-2xl"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Modal Header */}
              <div className="sticky top-0 z-10 flex items-center justify-between p-6 border-b border-border bg-background/95 backdrop-blur-sm">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-primary/10">
                    <Scale className="w-5 h-5 text-primary" />
                  </div>
                  <div>
                    <h2 className="text-lg font-semibold">Comparative Claim Analysis</h2>
                    <p className="text-sm text-muted-foreground">{karnatakaAnalysis.topic}</p>
                  </div>
                </div>
                <button
                  onClick={() => setShowAnalysisModal(false)}
                  className="p-2 rounded-lg hover:bg-muted transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Modal Content */}
              <div className="p-6 space-y-8">
                {/* Claims Side by Side */}
                <div>
                  <h3 className="text-sm font-medium text-muted-foreground mb-4 flex items-center gap-2">
                    <Zap className="w-4 h-4" />
                    CONFLICTING CLAIMS
                  </h3>
                  <div className="grid md:grid-cols-2 gap-6">
                    {/* Claim 1 Detail */}
                    <div className="space-y-4">
                      <div className="p-5 rounded-xl bg-red-500/5 border border-red-500/20">
                        <div className="flex items-center justify-between mb-3">
                          <Badge variant="danger">Claim A</Badge>
                          <span className="text-xs text-muted-foreground">{karnatakaAnalysis.claim1.timestamp}</span>
                        </div>
                        <Quote className="w-6 h-6 text-red-400/30 mb-2" />
                        <p className="text-foreground font-medium">
                          {karnatakaAnalysis.claim1.text}
                        </p>
                        <div className="flex items-center gap-2 mt-4 pt-4 border-t border-red-500/10">
                          <div className="w-8 h-8 rounded-full bg-red-500/20 flex items-center justify-center text-xs font-bold text-red-400">
                            {karnatakaAnalysis.claim1.source.charAt(0)}
                          </div>
                          <div>
                            <p className="text-sm font-medium">{karnatakaAnalysis.claim1.source}</p>
                            <p className="text-xs text-muted-foreground">Trust Score: {karnatakaAnalysis.claim1.sourceScore}%</p>
                          </div>
                        </div>
                      </div>
                      <div className="space-y-2">
                        <p className="text-xs font-medium text-muted-foreground">EVIDENCE CITED:</p>
                        {karnatakaAnalysis.claim1.evidence.map((e, i) => (
                          <div key={i} className="flex items-start gap-2 text-sm">
                            <span className="text-red-400">•</span>
                            <span className="text-muted-foreground">{e}</span>
                          </div>
                        ))}
                      </div>
                      <div className="flex flex-wrap gap-2">
                        <span className="text-xs text-muted-foreground">Supporting:</span>
                        {karnatakaAnalysis.claim1.supporting.map((s) => (
                          <Badge key={s} variant="outline" className="text-xs">{s}</Badge>
                        ))}
                      </div>
                    </div>

                    {/* Claim 2 Detail */}
                    <div className="space-y-4">
                      <div className="p-5 rounded-xl bg-green-500/5 border border-green-500/20">
                        <div className="flex items-center justify-between mb-3">
                          <Badge variant="success">Claim B</Badge>
                          <span className="text-xs text-muted-foreground">{karnatakaAnalysis.claim2.timestamp}</span>
                        </div>
                        <Quote className="w-6 h-6 text-green-400/30 mb-2" />
                        <p className="text-foreground font-medium">
                          {karnatakaAnalysis.claim2.text}
                        </p>
                        <div className="flex items-center gap-2 mt-4 pt-4 border-t border-green-500/10">
                          <div className="w-8 h-8 rounded-full bg-green-500/20 flex items-center justify-center text-xs font-bold text-green-400">
                            {karnatakaAnalysis.claim2.source.charAt(0)}
                          </div>
                          <div>
                            <p className="text-sm font-medium">{karnatakaAnalysis.claim2.source}</p>
                            <p className="text-xs text-muted-foreground">Trust Score: {karnatakaAnalysis.claim2.sourceScore}%</p>
                          </div>
                        </div>
                      </div>
                      <div className="space-y-2">
                        <p className="text-xs font-medium text-muted-foreground">EVIDENCE CITED:</p>
                        {karnatakaAnalysis.claim2.evidence.map((e, i) => (
                          <div key={i} className="flex items-start gap-2 text-sm">
                            <span className="text-green-400">•</span>
                            <span className="text-muted-foreground">{e}</span>
                          </div>
                        ))}
                      </div>
                      <div className="flex flex-wrap gap-2">
                        <span className="text-xs text-muted-foreground">Supporting:</span>
                        {karnatakaAnalysis.claim2.supporting.map((s) => (
                          <Badge key={s} variant="outline" className="text-xs">{s}</Badge>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Timeline */}
                <div>
                  <h3 className="text-sm font-medium text-muted-foreground mb-4 flex items-center gap-2">
                    <Clock className="w-4 h-4" />
                    EVENT TIMELINE
                  </h3>
                  <div className="relative pl-6 space-y-4">
                    <div className="absolute left-2 top-2 bottom-2 w-px bg-border" />
                    {karnatakaAnalysis.analysis.timeline.map((item, i) => (
                      <div key={i} className="relative flex items-start gap-4">
                        <div className={cn(
                          "absolute left-[-18px] w-4 h-4 rounded-full border-2 bg-background",
                          item.type === "claim1" && "border-red-500",
                          item.type === "claim2" && "border-green-500",
                          item.type === "official" && "border-blue-500",
                          item.type === "evidence" && "border-purple-500",
                          item.type === "rumor" && "border-amber-500",
                        )} />
                        <div className="flex-1 flex items-center justify-between p-3 rounded-lg bg-muted/50">
                          <div className="flex items-center gap-3">
                            <span className="text-xs font-mono text-muted-foreground">{item.time}</span>
                            <span className="text-sm">{item.event}</span>
                          </div>
                          <Badge variant={
                            item.type === "claim1" ? "danger" :
                            item.type === "claim2" ? "success" :
                            item.type === "official" ? "default" :
                            "warning"
                          } className="text-xs">
                            {item.type.toUpperCase()}
                          </Badge>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Analysis Factors */}
                <div>
                  <h3 className="text-sm font-medium text-muted-foreground mb-4 flex items-center gap-2">
                    <FileText className="w-4 h-4" />
                    ANALYSIS FACTORS
                  </h3>
                  <div className="space-y-3">
                    {karnatakaAnalysis.analysis.factorsConsidered.map((factor, i) => (
                      <div key={i} className="p-4 rounded-xl bg-muted/30 border border-border">
                        <div className="flex items-center justify-between mb-2">
                          <div className="flex items-center gap-2">
                            <span className="font-medium text-sm">{factor.factor}</span>
                            <Badge variant={
                              factor.weight === "High" ? "default" :
                              factor.weight === "Medium" ? "warning" : "outline"
                            } className="text-xs">
                              {factor.weight} Weight
                            </Badge>
                          </div>
                          <Badge variant={
                            factor.supports === "Claim 2" ? "success" :
                            factor.supports === "Claim 1" ? "danger" : "outline"
                          }>
                            {factor.supports === "Claim 2" ? "Supports B" :
                             factor.supports === "Claim 1" ? "Supports A" : "Neutral"}
                          </Badge>
                        </div>
                        <p className="text-sm text-muted-foreground">{factor.finding}</p>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Final Verdict */}
                <div className="p-6 rounded-2xl bg-gradient-to-br from-green-500/10 via-background to-emerald-500/10 border border-green-500/20">
                  <div className="flex items-start gap-6">
                    <div className="relative flex-shrink-0">
                      <svg className="w-24 h-24 -rotate-90" viewBox="0 0 36 36">
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
                          strokeDasharray={`${karnatakaAnalysis.verdict.confidence}, 100`}
                          className="text-green-500"
                        />
                      </svg>
                      <div className="absolute inset-0 flex flex-col items-center justify-center">
                        <span className="text-2xl font-bold text-green-500">{karnatakaAnalysis.verdict.confidence}%</span>
                        <span className="text-xs text-muted-foreground">Confidence</span>
                      </div>
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <Shield className="w-5 h-5 text-green-500" />
                        <h3 className="text-lg font-semibold">Final Verdict</h3>
                      </div>
                      <p className="text-xl font-bold text-green-500 mb-3">{karnatakaAnalysis.verdict.conclusion}</p>
                      <p className="text-sm text-muted-foreground mb-4">{karnatakaAnalysis.verdict.summary}</p>
                      <div className="p-3 rounded-lg bg-amber-500/10 border border-amber-500/20">
                        <p className="text-sm">
                          <span className="font-medium text-amber-500">Recommendation:</span>{" "}
                          <span className="text-muted-foreground">{karnatakaAnalysis.verdict.recommendation}</span>
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Modal Footer */}
              <div className="sticky bottom-0 flex items-center justify-between p-6 border-t border-border bg-background/95 backdrop-blur-sm">
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Sparkles className="w-4 h-4 text-primary" />
                  <span>Analysis powered by ClarifAI</span>
                </div>
                <div className="flex items-center gap-3">
                  <Button variant="outline" onClick={() => setShowAnalysisModal(false)}>
                    Close
                  </Button>
                  <Link href="/news/karnataka-crisis">
                    <Button className="gap-2">
                      View Full Topic
                      <ExternalLink className="w-4 h-4" />
                    </Button>
                  </Link>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

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

      {/* All Claims Header */}
      <div className="flex items-center gap-2">
        <h2 className="text-lg font-semibold">All Claims</h2>
        <Badge variant="outline">{filteredTopics.length} topics</Badge>
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
