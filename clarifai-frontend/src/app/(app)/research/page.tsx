"use client";

import { useState, useCallback, useRef } from "react";
import { motion } from "framer-motion";
import { useTheme } from "next-themes";
import { cn } from "@/lib/utils";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ResearchGraph, ResearchNode, ResearchEdge, ResearchGraphData } from "@/components/graphs/research-graph";
import {
  streamResearchGraph,
  getResearchReportDownloadUrl,
  ResearchSource
} from "@/lib/api";
import {
  Search,
  Loader2,
  AlertCircle,
  Download,
  BookOpen,
  Link2,
  FileText,
  Sparkles,
  GraduationCap,
  CheckCircle,
  ExternalLink,
  Sun,
  Moon,
  RefreshCw,
  Layers,
  Quote
} from "lucide-react";

export default function ResearchPage() {
  const [query, setQuery] = useState("");
  const [depth, setDepth] = useState<"quick" | "standard" | "comprehensive">("comprehensive");
  const [isLoading, setIsLoading] = useState(false);
  const [isStreaming, setIsStreaming] = useState(false);
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState<string | null>(null);

  const [data, setData] = useState<ResearchGraphData>({ nodes: [], edges: [] });
  const [metadata, setMetadata] = useState<{ topic: string; summary: string } | null>(null);
  const [sources, setSources] = useState<ResearchSource[]>([]);
  const [methodology, setMethodology] = useState<string>("");
  const [currentQuery, setCurrentQuery] = useState("");

  const cleanupRef = useRef<(() => void) | null>(null);
  const { resolvedTheme, setTheme } = useTheme();
  const isDark = resolvedTheme === "dark";

  const handleStartResearch = useCallback(() => {
    if (!query.trim()) return;

    // Reset state
    setData({ nodes: [], edges: [] });
    setMetadata(null);
    setSources([]);
    setMethodology("");
    setError(null);
    setProgress(0);
    setIsLoading(true);
    setIsStreaming(true);
    setCurrentQuery(query);

    // Cleanup previous stream
    if (cleanupRef.current) {
      cleanupRef.current();
    }

    const cleanup = streamResearchGraph(
      query,
      depth,
      // On metadata
      (meta) => {
        setMetadata({ topic: meta.topic, summary: meta.summary });
        setIsLoading(false);
      },
      // On node
      ({ node, edges, progress: p }) => {
        setData(prev => ({
          nodes: [...prev.nodes, node as unknown as ResearchNode],
          edges: [...prev.edges, ...edges.map(e => ({ ...e } as ResearchEdge))]
        }));
        setProgress(p);
      },
      // On sources
      (sourcesData) => {
        setSources(sourcesData);
      },
      // On complete
      ({ methodology: meth }) => {
        setIsStreaming(false);
        setMethodology(meth);
      },
      // On error
      (err) => {
        setError(err);
        setIsLoading(false);
        setIsStreaming(false);
      }
    );

    cleanupRef.current = cleanup;
  }, [query, depth]);

  const handleReset = () => {
    if (cleanupRef.current) {
      cleanupRef.current();
    }
    setData({ nodes: [], edges: [] });
    setMetadata(null);
    setSources([]);
    setMethodology("");
    setError(null);
    setProgress(0);
    setIsLoading(false);
    setIsStreaming(false);
    setCurrentQuery("");
  };

  const handleDownloadReport = () => {
    if (!currentQuery) return;
    const url = getResearchReportDownloadUrl(currentQuery, depth);
    window.open(url, "_blank");
  };

  const toggleTheme = () => {
    setTheme(isDark ? "light" : "dark");
  };

  const depthOptions = [
    { value: "quick", label: "Quick", description: "5-8 nodes, faster" },
    { value: "standard", label: "Standard", description: "8-12 nodes" },
    { value: "comprehensive", label: "Comprehensive", description: "12-15 nodes, detailed" }
  ];

  return (
    <div className={cn(
      "min-h-screen p-6",
      isDark
        ? "bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950"
        : "bg-gradient-to-br from-slate-50 via-white to-slate-100"
    )}>
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-7xl mx-auto mb-6"
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className={cn(
              "p-3 rounded-xl",
              isDark ? "bg-gradient-to-br from-purple-500/20 to-blue-500/20" : "bg-gradient-to-br from-purple-100 to-blue-100"
            )}>
              <GraduationCap className={cn("w-8 h-8", isDark ? "text-purple-400" : "text-purple-600")} />
            </div>
            <div>
              <h1 className={cn(
                "text-2xl font-bold",
                isDark ? "text-white" : "text-slate-900"
              )}>
                Research Hub
              </h1>
              <p className={cn(
                "text-sm",
                isDark ? "text-white/60" : "text-slate-600"
              )}>
                AI-powered research with source citations and explainable findings
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <Button
              variant="outline"
              size="icon"
              onClick={toggleTheme}
              className={cn(
                isDark
                  ? "border-white/20 text-white hover:bg-white/10"
                  : "border-slate-200 text-slate-600 hover:bg-slate-100"
              )}
            >
              {isDark ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
            </Button>

            {(isStreaming || data.nodes.length > 0) && (
              <>
                <Badge
                  variant="outline"
                  className={cn(
                    isStreaming ? "animate-pulse" : "",
                    isDark
                      ? "border-emerald-500/50 text-emerald-400"
                      : "border-emerald-500 text-emerald-600 bg-emerald-50"
                  )}
                >
                  {isLoading ? (
                    <Loader2 className="w-3 h-3 mr-2 animate-spin" />
                  ) : (
                    <div className="w-2 h-2 rounded-full bg-emerald-500 mr-2" />
                  )}
                  {isLoading ? "Initializing..." : isStreaming ? `${Math.round(progress)}%` : "Complete"}
                </Badge>

                <Button
                  variant="outline"
                  onClick={handleReset}
                  className={cn(
                    isDark
                      ? "border-white/20 text-white hover:bg-white/10"
                      : "border-slate-200 text-slate-700 hover:bg-slate-100"
                  )}
                >
                  <RefreshCw className="w-4 h-4 mr-2" />
                  New Research
                </Button>
              </>
            )}
          </div>
        </div>
      </motion.div>

      {/* Search Input */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.05 }}
        className="max-w-7xl mx-auto mb-6"
      >
        <Card className={cn(
          "border",
          isDark ? "bg-white/5 border-white/10" : "bg-white border-slate-200"
        )}>
          <CardContent className="p-6">
            <div className="space-y-4">
              {/* Query Input */}
              <div className="flex items-center gap-4">
                <div className="flex-1 relative">
                  <Search className={cn(
                    "absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5",
                    isDark ? "text-white/40" : "text-slate-400"
                  )} />
                  <input
                    type="text"
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && handleStartResearch()}
                    placeholder="Enter your research topic or question..."
                    className={cn(
                      "w-full pl-12 pr-4 py-4 rounded-xl border text-base transition-colors",
                      isDark
                        ? "bg-white/5 border-white/10 text-white placeholder:text-white/30 focus:border-purple-500/50 focus:ring-2 focus:ring-purple-500/20"
                        : "bg-slate-50 border-slate-200 text-slate-800 placeholder:text-slate-400 focus:border-purple-500 focus:ring-2 focus:ring-purple-500/20"
                    )}
                  />
                </div>
                <Button
                  onClick={handleStartResearch}
                  disabled={!query.trim() || isLoading || isStreaming}
                  className="px-8 py-4 h-auto bg-gradient-to-r from-purple-500 to-blue-500 text-white hover:from-purple-600 hover:to-blue-600 shadow-lg disabled:opacity-50"
                >
                  {isLoading ? (
                    <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                  ) : (
                    <Sparkles className="w-5 h-5 mr-2" />
                  )}
                  Start Research
                </Button>
              </div>

              {/* Depth Selector */}
              <div className="flex items-center gap-4">
                <span className={cn("text-sm font-medium", isDark ? "text-white/60" : "text-slate-600")}>
                  Research Depth:
                </span>
                <div className="flex gap-2">
                  {depthOptions.map((option) => (
                    <button
                      key={option.value}
                      onClick={() => setDepth(option.value as typeof depth)}
                      className={cn(
                        "px-4 py-2 rounded-lg text-sm font-medium transition-all",
                        depth === option.value
                          ? isDark
                            ? "bg-purple-500/20 text-purple-400 border border-purple-500/50"
                            : "bg-purple-100 text-purple-700 border border-purple-300"
                          : isDark
                            ? "bg-white/5 text-white/60 border border-white/10 hover:bg-white/10"
                            : "bg-slate-100 text-slate-600 border border-slate-200 hover:bg-slate-200"
                      )}
                    >
                      {option.label}
                    </button>
                  ))}
                </div>
              </div>

              {error && (
                <div className="flex items-center gap-2 text-red-500 bg-red-500/10 p-3 rounded-lg">
                  <AlertCircle className="w-4 h-4" />
                  <span className="text-sm">{error}</span>
                </div>
              )}

              <p className={cn(
                "text-xs",
                isDark ? "text-white/40" : "text-slate-500"
              )}>
                Enter any research topic. Our AI will analyze multiple sources and create a comprehensive knowledge graph with citations for every finding.
              </p>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Summary Card */}
      {metadata && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="max-w-7xl mx-auto mb-6"
        >
          <Card className={cn(
            "border",
            isDark ? "bg-gradient-to-r from-purple-500/10 to-blue-500/10 border-purple-500/20" : "bg-gradient-to-r from-purple-50 to-blue-50 border-purple-200"
          )}>
            <CardContent className="p-6">
              <div className="flex items-start gap-4">
                <div className={cn(
                  "p-2 rounded-lg",
                  isDark ? "bg-purple-500/20" : "bg-purple-100"
                )}>
                  <FileText className={cn("w-5 h-5", isDark ? "text-purple-400" : "text-purple-600")} />
                </div>
                <div className="flex-1">
                  <h3 className={cn("font-semibold mb-1", isDark ? "text-white" : "text-slate-900")}>
                    {metadata.topic}
                  </h3>
                  <p className={cn("text-sm", isDark ? "text-white/70" : "text-slate-600")}>
                    {metadata.summary}
                  </p>
                </div>
                {!isStreaming && data.nodes.length > 0 && (
                  <Button
                    onClick={handleDownloadReport}
                    className="bg-gradient-to-r from-emerald-500 to-teal-500 text-white hover:from-emerald-600 hover:to-teal-600"
                  >
                    <Download className="w-4 h-4 mr-2" />
                    Download Report
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>
        </motion.div>
      )}

      {/* Stats Cards */}
      {data.nodes.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="max-w-7xl mx-auto mb-6"
        >
          <div className="grid grid-cols-4 gap-4">
            <Card className={cn(
              "border",
              isDark ? "bg-white/5 border-white/10" : "bg-white border-slate-200"
            )}>
              <CardContent className="p-4 flex items-center gap-3">
                <div className={cn("p-2 rounded-lg", isDark ? "bg-blue-500/20" : "bg-blue-100")}>
                  <Layers className={cn("w-5 h-5", isDark ? "text-blue-400" : "text-blue-600")} />
                </div>
                <div>
                  <p className={cn("text-2xl font-bold", isDark ? "text-white" : "text-slate-900")}>
                    {data.nodes.length}
                  </p>
                  <p className={cn("text-xs", isDark ? "text-white/60" : "text-slate-600")}>Findings</p>
                </div>
              </CardContent>
            </Card>

            <Card className={cn(
              "border",
              isDark ? "bg-white/5 border-white/10" : "bg-white border-slate-200"
            )}>
              <CardContent className="p-4 flex items-center gap-3">
                <div className={cn("p-2 rounded-lg", isDark ? "bg-purple-500/20" : "bg-purple-100")}>
                  <Link2 className={cn("w-5 h-5", isDark ? "text-purple-400" : "text-purple-600")} />
                </div>
                <div>
                  <p className={cn("text-2xl font-bold", isDark ? "text-white" : "text-slate-900")}>
                    {data.edges.length}
                  </p>
                  <p className={cn("text-xs", isDark ? "text-white/60" : "text-slate-600")}>Connections</p>
                </div>
              </CardContent>
            </Card>

            <Card className={cn(
              "border",
              isDark ? "bg-white/5 border-white/10" : "bg-white border-slate-200"
            )}>
              <CardContent className="p-4 flex items-center gap-3">
                <div className={cn("p-2 rounded-lg", isDark ? "bg-emerald-500/20" : "bg-emerald-100")}>
                  <BookOpen className={cn("w-5 h-5", isDark ? "text-emerald-400" : "text-emerald-600")} />
                </div>
                <div>
                  <p className={cn("text-2xl font-bold", isDark ? "text-white" : "text-slate-900")}>
                    {sources.length || data.nodes.filter(n => n.data.source_url).length}
                  </p>
                  <p className={cn("text-xs", isDark ? "text-white/60" : "text-slate-600")}>Sources</p>
                </div>
              </CardContent>
            </Card>

            <Card className={cn(
              "border",
              isDark ? "bg-white/5 border-white/10" : "bg-white border-slate-200"
            )}>
              <CardContent className="p-4 flex items-center gap-3">
                <div className={cn("p-2 rounded-lg", isDark ? "bg-yellow-500/20" : "bg-yellow-100")}>
                  <CheckCircle className={cn("w-5 h-5", isDark ? "text-yellow-400" : "text-yellow-600")} />
                </div>
                <div>
                  <p className={cn("text-2xl font-bold", isDark ? "text-white" : "text-slate-900")}>
                    {data.nodes.filter(n => n.data.confidence === "HIGH").length}
                  </p>
                  <p className={cn("text-xs", isDark ? "text-white/60" : "text-slate-600")}>High Confidence</p>
                </div>
              </CardContent>
            </Card>
          </div>
        </motion.div>
      )}

      {/* Main Content */}
      <div className="max-w-7xl mx-auto">
        <div className="grid grid-cols-12 gap-6">
          {/* Graph */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.15 }}
            className="col-span-8"
          >
            <Card className={cn(
              "border overflow-hidden",
              isDark ? "bg-white/5 border-white/10" : "bg-white border-slate-200"
            )}>
              <CardHeader className={cn(
                "border-b",
                isDark ? "border-white/10" : "border-slate-200"
              )}>
                <CardTitle className={cn(
                  "text-lg flex items-center gap-2",
                  isDark ? "text-white" : "text-slate-900"
                )}>
                  <Layers className="w-5 h-5" />
                  Knowledge Graph
                </CardTitle>
              </CardHeader>
              <CardContent className="p-0">
                <div className="h-[600px]">
                  {data.nodes.length > 0 ? (
                    <ResearchGraph
                      data={data}
                      onNodeClick={(node) => console.log("Clicked:", node)}
                      theme={isDark ? "dark" : "light"}
                    />
                  ) : (
                    <div className={cn(
                      "h-full flex flex-col items-center justify-center",
                      isDark ? "text-white/40" : "text-slate-400"
                    )}>
                      <GraduationCap className="w-16 h-16 mb-4 opacity-50" />
                      <p className="text-lg font-medium">Enter a research topic to get started</p>
                      <p className="text-sm mt-1">AI will analyze sources and build a knowledge graph</p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </motion.div>

          {/* Sources Panel */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2 }}
            className="col-span-4 space-y-4"
          >
            {/* Sources List */}
            <Card className={cn(
              "border",
              isDark ? "bg-white/5 border-white/10" : "bg-white border-slate-200"
            )}>
              <CardHeader className={cn(
                "border-b",
                isDark ? "border-white/10" : "border-slate-200"
              )}>
                <CardTitle className={cn(
                  "text-lg flex items-center gap-2",
                  isDark ? "text-white" : "text-slate-900"
                )}>
                  <BookOpen className="w-5 h-5" />
                  Sources & Citations
                </CardTitle>
              </CardHeader>
              <CardContent className="p-4 max-h-[300px] overflow-y-auto">
                {sources.length > 0 ? (
                  <div className="space-y-3">
                    {sources.map((source, index) => (
                      <a
                        key={index}
                        href={source.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className={cn(
                          "block p-3 rounded-lg transition-colors group",
                          isDark ? "bg-white/5 hover:bg-white/10" : "bg-slate-50 hover:bg-slate-100"
                        )}
                      >
                        <div className="flex items-start gap-2">
                          <ExternalLink className={cn(
                            "w-4 h-4 mt-0.5 shrink-0",
                            isDark ? "text-blue-400" : "text-blue-600"
                          )} />
                          <div>
                            <p className={cn(
                              "text-sm font-medium group-hover:underline",
                              isDark ? "text-white" : "text-slate-900"
                            )}>
                              {source.title}
                            </p>
                            {source.publisher && (
                              <p className={cn(
                                "text-xs mt-0.5",
                                isDark ? "text-white/60" : "text-slate-600"
                              )}>
                                {source.publisher} {source.date && `• ${source.date}`}
                              </p>
                            )}
                          </div>
                        </div>
                      </a>
                    ))}
                  </div>
                ) : data.nodes.length > 0 ? (
                  <div className="space-y-3">
                    {data.nodes.filter(n => n.data.source_url).map((node, index) => (
                      <a
                        key={index}
                        href={node.data.source_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className={cn(
                          "block p-3 rounded-lg transition-colors group",
                          isDark ? "bg-white/5 hover:bg-white/10" : "bg-slate-50 hover:bg-slate-100"
                        )}
                      >
                        <div className="flex items-start gap-2">
                          <ExternalLink className={cn(
                            "w-4 h-4 mt-0.5 shrink-0",
                            isDark ? "text-blue-400" : "text-blue-600"
                          )} />
                          <p className={cn(
                            "text-sm font-medium group-hover:underline",
                            isDark ? "text-white" : "text-slate-900"
                          )}>
                            {node.data.source_title || "Source"}
                          </p>
                        </div>
                      </a>
                    ))}
                  </div>
                ) : (
                  <p className={cn("text-sm text-center py-8", isDark ? "text-white/40" : "text-slate-400")}>
                    Sources will appear here as findings are generated
                  </p>
                )}
              </CardContent>
            </Card>

            {/* Methodology */}
            {methodology && (
              <Card className={cn(
                "border",
                isDark ? "bg-white/5 border-white/10" : "bg-white border-slate-200"
              )}>
                <CardHeader className={cn(
                  "border-b py-3",
                  isDark ? "border-white/10" : "border-slate-200"
                )}>
                  <CardTitle className={cn(
                    "text-sm flex items-center gap-2",
                    isDark ? "text-white" : "text-slate-900"
                  )}>
                    <Quote className="w-4 h-4" />
                    Methodology
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-4">
                  <p className={cn("text-sm", isDark ? "text-white/70" : "text-slate-600")}>
                    {methodology}
                  </p>
                </CardContent>
              </Card>
            )}

            {/* Info Card */}
            <Card className={cn(
              "border",
              isDark ? "bg-gradient-to-br from-purple-500/10 to-blue-500/10 border-purple-500/20" : "bg-gradient-to-br from-purple-50 to-blue-50 border-purple-200"
            )}>
              <CardContent className="p-4">
                <h4 className={cn("font-semibold mb-2 flex items-center gap-2", isDark ? "text-white" : "text-slate-900")}>
                  <Sparkles className="w-4 h-4 text-purple-400" />
                  How It Works
                </h4>
                <ul className={cn("text-sm space-y-2", isDark ? "text-white/70" : "text-slate-600")}>
                  <li className="flex items-start gap-2">
                    <CheckCircle className="w-4 h-4 text-emerald-500 mt-0.5 shrink-0" />
                    AI analyzes multiple news and fact-check sources
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle className="w-4 h-4 text-emerald-500 mt-0.5 shrink-0" />
                    Every finding is linked to its source
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle className="w-4 h-4 text-emerald-500 mt-0.5 shrink-0" />
                    Confidence levels indicate source reliability
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle className="w-4 h-4 text-emerald-500 mt-0.5 shrink-0" />
                    Download comprehensive reports for reference
                  </li>
                </ul>
              </CardContent>
            </Card>
          </motion.div>
        </div>
      </div>
    </div>
  );
}
