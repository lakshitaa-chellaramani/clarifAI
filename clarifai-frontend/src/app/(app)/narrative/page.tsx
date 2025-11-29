"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { NarrativeGraph, NarrativeGraphData } from "@/components/graphs/narrative-graph";
import { useNarrativeStream, sampleNarrativeData } from "@/hooks/use-narrative-stream";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useTheme } from "next-themes";
import { cn } from "@/lib/utils";
import {
  Play,
  RotateCcw,
  Sparkles,
  Zap,
  Network,
  Clock,
  CheckCircle2,
  Sun,
  Moon,
  GitBranch,
  ArrowRight,
  Search,
  Loader2,
  AlertCircle,
  Radio,
} from "lucide-react";

export default function NarrativePage() {
  const [mode, setMode] = useState<"demo" | "stream" | "live">("demo");
  const [streamKey, setStreamKey] = useState(0);
  const [topic, setTopic] = useState("");
  const [currentTopic, setCurrentTopic] = useState("");
  const { resolvedTheme, setTheme } = useTheme();

  const isDark = resolvedTheme === "dark";

  const {
    data: streamedData,
    isStreaming,
    isLoading,
    progress,
    error,
    startStream,
    startLiveStream,
    reset,
  } = useNarrativeStream({
    streamDelay: 1000,
    onComplete: () => {
      console.log("Stream complete!");
    },
    onError: (err) => {
      console.error("Stream error:", err);
    },
  });

  const handleStartStream = () => {
    setMode("stream");
    setStreamKey((k) => k + 1);
    startStream(sampleNarrativeData);
  };

  const handleStartLiveStream = () => {
    if (!topic.trim()) return;
    setMode("live");
    setCurrentTopic(topic);
    setStreamKey((k) => k + 1);
    startLiveStream(topic);
  };

  const handleReset = () => {
    reset();
    setMode("demo");
    setCurrentTopic("");
  };

  const toggleTheme = () => {
    setTheme(isDark ? "light" : "dark");
  };

  return (
    <div className={cn(
      "min-h-screen p-6 transition-colors duration-300",
      isDark
        ? "bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950"
        : "bg-gradient-to-br from-slate-50 via-white to-slate-100"
    )}>
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-7xl mx-auto mb-8"
      >
        <div className="flex items-center justify-between">
          <div className="space-y-2">
            <div className="flex items-center gap-3">
              <div className={cn(
                "p-2.5 rounded-xl border",
                isDark
                  ? "bg-gradient-to-br from-blue-500/20 to-cyan-500/20 border-blue-500/30"
                  : "bg-gradient-to-br from-blue-100 to-cyan-100 border-blue-300"
              )}>
                <Network className={cn("w-6 h-6", isDark ? "text-blue-400" : "text-blue-600")} />
              </div>
              <div>
                <h1 className={cn(
                  "text-3xl font-bold",
                  isDark ? "text-white" : "text-slate-800"
                )}>
                  Narrative Intelligence Graph
                </h1>
                <div className="flex items-center gap-2 mt-1">
                  <GitBranch className={cn("w-4 h-4", isDark ? "text-white/40" : "text-slate-400")} />
                  <span className={cn("text-sm", isDark ? "text-white/40" : "text-slate-500")}>
                    Real-time story visualization powered by AI
                  </span>
                </div>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-3">
            {/* Theme Toggle */}
            <Button
              variant="outline"
              size="icon"
              onClick={toggleTheme}
              className={cn(
                "h-9 w-9 rounded-lg",
                isDark
                  ? "border-white/20 text-white hover:bg-white/10"
                  : "border-slate-200 text-slate-600 hover:bg-slate-100"
              )}
            >
              {isDark ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
            </Button>

            {mode === "stream" || mode === "live" ? (
              <>
                <Badge
                  variant="outline"
                  className={cn(
                    isStreaming || isLoading ? "animate-pulse" : "",
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
                  {isLoading ? "Generating..." : isStreaming ? "Building..." : "Complete"}
                </Badge>
                {mode === "live" && currentTopic && (
                  <Badge
                    variant="outline"
                    className={cn(
                      isDark
                        ? "border-purple-500/50 text-purple-400"
                        : "border-purple-500 text-purple-600 bg-purple-50"
                    )}
                  >
                    <Radio className="w-3 h-3 mr-1" />
                    {currentTopic.slice(0, 30)}{currentTopic.length > 30 ? "..." : ""}
                  </Badge>
                )}
                <Button
                  variant="outline"
                  onClick={handleReset}
                  className={cn(
                    isDark
                      ? "border-white/20 text-white hover:bg-white/10"
                      : "border-slate-200 text-slate-700 hover:bg-slate-100"
                  )}
                >
                  <RotateCcw className="w-4 h-4 mr-2" />
                  Reset
                </Button>
              </>
            ) : (
              <Button
                onClick={handleStartStream}
                className="bg-gradient-to-r from-blue-500 to-purple-500 text-white hover:from-blue-600 hover:to-purple-600 shadow-lg"
              >
                <Zap className="w-4 h-4 mr-2" />
                Demo Mode
              </Button>
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
          <CardContent className="p-4">
            <div className="flex items-center gap-4">
              <div className="flex-1 relative">
                <Search className={cn(
                  "absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5",
                  isDark ? "text-white/40" : "text-slate-400"
                )} />
                <input
                  type="text"
                  value={topic}
                  onChange={(e) => setTopic(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && handleStartLiveStream()}
                  placeholder="Enter a news topic (e.g., 'India election results', 'Climate summit 2024')..."
                  className={cn(
                    "w-full pl-10 pr-4 py-3 rounded-lg border text-sm transition-colors",
                    isDark
                      ? "bg-white/5 border-white/10 text-white placeholder:text-white/30 focus:border-blue-500/50 focus:ring-1 focus:ring-blue-500/50"
                      : "bg-slate-50 border-slate-200 text-slate-800 placeholder:text-slate-400 focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                  )}
                />
              </div>
              <Button
                onClick={handleStartLiveStream}
                disabled={!topic.trim() || isLoading || isStreaming}
                className={cn(
                  "px-6 shadow-lg",
                  "bg-gradient-to-r from-emerald-500 to-teal-500 text-white hover:from-emerald-600 hover:to-teal-600",
                  "disabled:opacity-50 disabled:cursor-not-allowed"
                )}
              >
                {isLoading ? (
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                ) : (
                  <Radio className="w-4 h-4 mr-2" />
                )}
                Generate Live Graph
              </Button>
            </div>
            {error && (
              <div className="mt-3 flex items-center gap-2 text-red-500">
                <AlertCircle className="w-4 h-4" />
                <span className="text-sm">{error}</span>
              </div>
            )}
            <p className={cn(
              "mt-2 text-xs",
              isDark ? "text-white/40" : "text-slate-500"
            )}>
              Enter any news topic and our AI will generate a real-time narrative graph showing how the story unfolds.
            </p>
          </CardContent>
        </Card>
      </motion.div>

      {/* Stats Cards */}
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
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className={cn(
                  "p-2 rounded-lg",
                  isDark ? "bg-rose-500/20" : "bg-rose-100"
                )}>
                  <Sparkles className={cn("w-4 h-4", isDark ? "text-rose-400" : "text-rose-600")} />
                </div>
                <div>
                  <p className={cn("text-xs", isDark ? "text-white/40" : "text-slate-500")}>
                    Root Events
                  </p>
                  <p className={cn("text-xl font-bold", isDark ? "text-white" : "text-slate-800")}>
                    {mode === "stream"
                      ? streamedData.nodes.filter((n) => n.type === "ROOT_INCIDENT").length
                      : sampleNarrativeData.nodes.filter((n) => n.type === "ROOT_INCIDENT").length}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className={cn(
            "border",
            isDark ? "bg-white/5 border-white/10" : "bg-white border-slate-200"
          )}>
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className={cn(
                  "p-2 rounded-lg",
                  isDark ? "bg-blue-500/20" : "bg-blue-100"
                )}>
                  <Network className={cn("w-4 h-4", isDark ? "text-blue-400" : "text-blue-600")} />
                </div>
                <div>
                  <p className={cn("text-xs", isDark ? "text-white/40" : "text-slate-500")}>
                    Total Nodes
                  </p>
                  <p className={cn("text-xl font-bold", isDark ? "text-white" : "text-slate-800")}>
                    {mode === "stream"
                      ? streamedData.nodes.length
                      : sampleNarrativeData.nodes.length}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className={cn(
            "border",
            isDark ? "bg-white/5 border-white/10" : "bg-white border-slate-200"
          )}>
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className={cn(
                  "p-2 rounded-lg",
                  isDark ? "bg-amber-500/20" : "bg-amber-100"
                )}>
                  <ArrowRight className={cn("w-4 h-4", isDark ? "text-amber-400" : "text-amber-600")} />
                </div>
                <div>
                  <p className={cn("text-xs", isDark ? "text-white/40" : "text-slate-500")}>
                    Connections
                  </p>
                  <p className={cn("text-xl font-bold", isDark ? "text-white" : "text-slate-800")}>
                    {mode === "stream"
                      ? streamedData.edges.length
                      : sampleNarrativeData.edges.length}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className={cn(
            "border",
            isDark ? "bg-white/5 border-white/10" : "bg-white border-slate-200"
          )}>
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className={cn(
                  "p-2 rounded-lg",
                  isDark ? "bg-emerald-500/20" : "bg-emerald-100"
                )}>
                  <CheckCircle2 className={cn("w-4 h-4", isDark ? "text-emerald-400" : "text-emerald-600")} />
                </div>
                <div>
                  <p className={cn("text-xs", isDark ? "text-white/40" : "text-slate-500")}>
                    Progress
                  </p>
                  <p className={cn("text-xl font-bold", isDark ? "text-white" : "text-slate-800")}>
                    {mode === "stream" ? `${Math.round(progress)}%` : "100%"}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </motion.div>

      {/* Main Graph */}
      <motion.div
        initial={{ opacity: 0, scale: 0.98 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 0.2 }}
        className="max-w-7xl mx-auto"
      >
        {mode === "demo" ? (
          <NarrativeGraph
            data={sampleNarrativeData}
            autoPlay={true}
            animationDelay={1000}
            onNodeClick={(node) => console.log("Clicked:", node)}
          />
        ) : mode === "live" ? (
          <NarrativeGraph
            key={streamKey}
            data={streamedData}
            autoPlay={false}
            onNodeClick={(node) => console.log("Clicked:", node)}
          />
        ) : (
          <NarrativeGraph
            key={streamKey}
            data={streamedData}
            autoPlay={false}
            onNodeClick={(node) => console.log("Clicked:", node)}
          />
        )}
      </motion.div>

      {/* Feature highlights */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
        className="max-w-7xl mx-auto mt-8"
      >
        <div className="grid grid-cols-3 gap-4">
          <Card className={cn(
            "border",
            isDark ? "bg-white/5 border-white/10" : "bg-white border-slate-200"
          )}>
            <CardContent className="p-4">
              <div className="flex items-center gap-2 mb-2">
                <Zap className={cn("w-4 h-4", isDark ? "text-amber-400" : "text-amber-600")} />
                <span className={cn("text-sm font-medium", isDark ? "text-white" : "text-slate-800")}>
                  Real-Time Building
                </span>
              </div>
              <p className={cn("text-xs", isDark ? "text-white/50" : "text-slate-500")}>
                Watch as the narrative unfolds node by node, just like how the AI
                processes and structures information.
              </p>
            </CardContent>
          </Card>

          <Card className={cn(
            "border",
            isDark ? "bg-white/5 border-white/10" : "bg-white border-slate-200"
          )}>
            <CardContent className="p-4">
              <div className="flex items-center gap-2 mb-2">
                <ArrowRight className={cn("w-4 h-4", isDark ? "text-blue-400" : "text-blue-600")} />
                <span className={cn("text-sm font-medium", isDark ? "text-white" : "text-slate-800")}>
                  Story Flow Arrows
                </span>
              </div>
              <p className={cn("text-xs", isDark ? "text-white/50" : "text-slate-500")}>
                Directional arrows show how the story flows - causes, consequences,
                reactions, and developments.
              </p>
            </CardContent>
          </Card>

          <Card className={cn(
            "border",
            isDark ? "bg-white/5 border-white/10" : "bg-white border-slate-200"
          )}>
            <CardContent className="p-4">
              <div className="flex items-center gap-2 mb-2">
                <Sparkles className={cn("w-4 h-4", isDark ? "text-purple-400" : "text-purple-600")} />
                <span className={cn("text-sm font-medium", isDark ? "text-white" : "text-slate-800")}>
                  Interactive Exploration
                </span>
              </div>
              <p className={cn("text-xs", isDark ? "text-white/50" : "text-slate-500")}>
                Click nodes to explore details, zoom and pan to navigate, and
                follow the story thread visually.
              </p>
            </CardContent>
          </Card>
        </div>
      </motion.div>
    </div>
  );
}
