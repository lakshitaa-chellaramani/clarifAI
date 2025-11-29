"use client";

import React, {
  useCallback,
  useEffect,
  useState,
  useMemo,
  useRef,
} from "react";
import ReactFlow, {
  Node,
  Edge,
  Background,
  useNodesState,
  useEdgesState,
  MarkerType,
  Position,
  BackgroundVariant,
  Panel,
  useReactFlow,
  ReactFlowProvider,
  Handle,
  ConnectionLineType,
} from "reactflow";
import "reactflow/dist/style.css";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useTheme } from "next-themes";
import {
  Play,
  Pause,
  RotateCcw,
  ZoomIn,
  ZoomOut,
  Maximize2,
  X,
  ChevronRight,
  Target,
  TrendingUp,
  MessageSquare,
  Search,
  CheckCircle2,
  Sparkles,
  GitBranch,
} from "lucide-react";

// Types
export interface NarrativeNode {
  id: string;
  label: string;
  type: "ROOT_INCIDENT" | "DEVELOPMENT" | "REACTION" | "INVESTIGATION" | "OUTCOME";
  data: {
    summary: string;
  };
}

export interface NarrativeEdge {
  source: string;
  target: string;
  label: string;
  animated?: boolean;
}

export interface NarrativeGraphData {
  nodes: NarrativeNode[];
  edges: NarrativeEdge[];
}

// Node type configurations
const NODE_CONFIGS = {
  ROOT_INCIDENT: {
    color: "#EF4444",
    bgLight: "bg-red-50",
    bgDark: "bg-red-950/50",
    borderLight: "border-red-400",
    borderDark: "border-red-500",
    icon: Target,
    label: "Root Incident",
  },
  DEVELOPMENT: {
    color: "#3B82F6",
    bgLight: "bg-blue-50",
    bgDark: "bg-blue-950/50",
    borderLight: "border-blue-400",
    borderDark: "border-blue-500",
    icon: TrendingUp,
    label: "Development",
  },
  REACTION: {
    color: "#F59E0B",
    bgLight: "bg-amber-50",
    bgDark: "bg-amber-950/50",
    borderLight: "border-amber-400",
    borderDark: "border-amber-500",
    icon: MessageSquare,
    label: "Reaction",
  },
  INVESTIGATION: {
    color: "#8B5CF6",
    bgLight: "bg-purple-50",
    bgDark: "bg-purple-950/50",
    borderLight: "border-purple-400",
    borderDark: "border-purple-500",
    icon: Search,
    label: "Investigation",
  },
  OUTCOME: {
    color: "#10B981",
    bgLight: "bg-emerald-50",
    bgDark: "bg-emerald-950/50",
    borderLight: "border-emerald-400",
    borderDark: "border-emerald-500",
    icon: CheckCircle2,
    label: "Outcome",
  },
};

// Custom Node Component with Handles
function StoryNode({ data, selected }: { data: any; selected: boolean }) {
  const { resolvedTheme } = useTheme();
  const isDark = resolvedTheme === "dark";
  const config = NODE_CONFIGS[data.nodeType as keyof typeof NODE_CONFIGS] || NODE_CONFIGS.DEVELOPMENT;
  const Icon = config.icon;

  return (
    <div
      className={cn(
        "relative px-0 py-0 min-w-[320px] max-w-[360px]",
        "rounded-xl border-2 shadow-lg transition-all duration-300",
        isDark ? config.bgDark : config.bgLight,
        isDark ? config.borderDark : config.borderLight,
        selected && "ring-4 ring-offset-2 scale-105",
        isDark ? "ring-white/20" : "ring-black/10"
      )}
      style={{
        borderLeftWidth: "6px",
        borderLeftColor: config.color,
      }}
    >
      {/* Source Handle (Right side) */}
      <Handle
        type="source"
        position={Position.Right}
        id="source"
        style={{
          width: 14,
          height: 14,
          background: config.color,
          border: "3px solid white",
          right: -7,
        }}
      />

      {/* Target Handle (Left side) */}
      <Handle
        type="target"
        position={Position.Left}
        id="target"
        style={{
          width: 14,
          height: 14,
          background: config.color,
          border: "3px solid white",
          left: -7,
        }}
      />

      {/* Sequence number badge */}
      {data.sequenceNumber && (
        <div
          className="absolute -top-3 -left-3 w-8 h-8 rounded-full flex items-center justify-center text-white text-sm font-bold shadow-lg z-10"
          style={{ backgroundColor: config.color }}
        >
          {data.sequenceNumber}
        </div>
      )}

      {/* Header */}
      <div
        className={cn(
          "flex items-center gap-3 px-4 py-3 rounded-t-lg border-b",
          isDark ? "border-white/10 bg-black/20" : "border-black/5 bg-white/50"
        )}
      >
        <div
          className="flex items-center justify-center w-10 h-10 rounded-lg text-white shadow-md"
          style={{ backgroundColor: config.color }}
        >
          <Icon className="w-5 h-5" />
        </div>
        <div className="flex-1">
          <Badge
            className="text-[10px] font-bold uppercase tracking-wider text-white border-0"
            style={{ backgroundColor: config.color }}
          >
            {config.label}
          </Badge>
        </div>
        {data.nodeType === "ROOT_INCIDENT" && (
          <Sparkles className="w-5 h-5 text-amber-500 animate-pulse" />
        )}
      </div>

      {/* Content */}
      <div className="px-4 py-3">
        <h3
          className={cn(
            "text-sm font-semibold leading-snug mb-2",
            isDark ? "text-white" : "text-slate-800"
          )}
        >
          {data.label}
        </h3>
        {data.summary && (
          <p
            className={cn(
              "text-xs leading-relaxed line-clamp-3",
              isDark ? "text-white/60" : "text-slate-600"
            )}
          >
            {data.summary}
          </p>
        )}
      </div>

      {/* Footer */}
      <div
        className={cn(
          "px-4 py-2 rounded-b-lg flex items-center justify-between",
          isDark ? "bg-black/30" : "bg-black/5"
        )}
      >
        <div className="flex items-center gap-1.5">
          <GitBranch
            className={cn("w-3.5 h-3.5", isDark ? "text-white/50" : "text-slate-500")}
          />
          <span
            className={cn("text-[11px]", isDark ? "text-white/50" : "text-slate-500")}
          >
            {data.connectionCount || 0} connections
          </span>
        </div>
        <ChevronRight
          className={cn("w-4 h-4", isDark ? "text-white/30" : "text-slate-400")}
        />
      </div>
    </div>
  );
}

// Register node types
const nodeTypes = {
  storyNode: StoryNode,
};

// Layout calculation
function calculateLayout(nodes: NarrativeNode[], edges: NarrativeEdge[]) {
  const positions: { x: number; y: number }[] = [];
  const nodeIdToIndex = new Map<string, number>();
  const levels = new Map<string, number>();

  nodes.forEach((node, index) => {
    nodeIdToIndex.set(node.id, index);
  });

  // Calculate levels
  function getLevel(nodeId: string, visited = new Set<string>()): number {
    if (visited.has(nodeId)) return levels.get(nodeId) || 0;
    visited.add(nodeId);
    if (levels.has(nodeId)) return levels.get(nodeId)!;

    const parentEdge = edges.find((e) => e.target === nodeId);
    if (!parentEdge) {
      levels.set(nodeId, 0);
      return 0;
    }

    const parentLevel = getLevel(parentEdge.source, visited);
    const level = parentLevel + 1;
    levels.set(nodeId, level);
    return level;
  }

  nodes.forEach((node) => getLevel(node.id));

  // Group by level
  const levelGroups = new Map<number, string[]>();
  nodes.forEach((node) => {
    const level = levels.get(node.id) || 0;
    if (!levelGroups.has(level)) levelGroups.set(level, []);
    levelGroups.get(level)!.push(node.id);
  });

  // Position nodes - WIDE SPACING
  const HORIZONTAL_GAP = 600;
  const VERTICAL_GAP = 300;

  levelGroups.forEach((nodeIds, level) => {
    const totalHeight = (nodeIds.length - 1) * VERTICAL_GAP;
    const startY = -totalHeight / 2;

    nodeIds.forEach((nodeId, index) => {
      const nodeIndex = nodeIdToIndex.get(nodeId)!;
      positions[nodeIndex] = {
        x: level * HORIZONTAL_GAP,
        y: startY + index * VERTICAL_GAP,
      };
    });
  });

  return positions;
}

// Main component
function NarrativeGraphInner({
  data,
  autoPlay = true,
  animationDelay = 800,
  onNodeClick,
  className,
}: {
  data: NarrativeGraphData;
  autoPlay?: boolean;
  animationDelay?: number;
  onNodeClick?: (node: NarrativeNode) => void;
  className?: string;
}) {
  const [nodes, setNodes, onNodesChange] = useNodesState([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState([]);
  const [visibleCount, setVisibleCount] = useState(0);
  const [isPlaying, setIsPlaying] = useState(autoPlay);
  const [selectedNode, setSelectedNode] = useState<NarrativeNode | null>(null);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const { fitView, zoomIn, zoomOut } = useReactFlow();
  const { resolvedTheme } = useTheme();
  const animationRef = useRef<NodeJS.Timeout | null>(null);

  const isDark = resolvedTheme === "dark";

  // Calculate positions once
  const positions = useMemo(
    () => calculateLayout(data.nodes, data.edges),
    [data.nodes, data.edges]
  );

  // Connection counts
  const connectionCounts = useMemo(() => {
    const counts = new Map<string, number>();
    data.edges.forEach((edge) => {
      counts.set(edge.source, (counts.get(edge.source) || 0) + 1);
      counts.set(edge.target, (counts.get(edge.target) || 0) + 1);
    });
    return counts;
  }, [data.edges]);

  // Build nodes for React Flow
  const flowNodes: Node[] = useMemo(() => {
    return data.nodes.slice(0, visibleCount).map((node, index) => ({
      id: node.id,
      type: "storyNode",
      position: positions[index] || { x: index * 600, y: 0 },
      data: {
        label: node.label,
        summary: node.data.summary,
        nodeType: node.type,
        sequenceNumber: index + 1,
        connectionCount: connectionCounts.get(node.id) || 0,
      },
    }));
  }, [data.nodes, visibleCount, positions, connectionCounts]);

  // Build edges for React Flow - USING DEFAULT SMOOTHSTEP WITH THICK STYLING
  const flowEdges: Edge[] = useMemo(() => {
    const visibleNodeIds = new Set(data.nodes.slice(0, visibleCount).map((n) => n.id));

    return data.edges
      .filter((edge) => visibleNodeIds.has(edge.source) && visibleNodeIds.has(edge.target))
      .map((edge) => {
        const sourceNode = data.nodes.find((n) => n.id === edge.source);
        const config = sourceNode
          ? NODE_CONFIGS[sourceNode.type as keyof typeof NODE_CONFIGS]
          : NODE_CONFIGS.DEVELOPMENT;

        return {
          id: `e-${edge.source}-${edge.target}`,
          source: edge.source,
          target: edge.target,
          sourceHandle: "source",
          targetHandle: "target",
          type: "smoothstep",
          animated: edge.animated || false,
          label: edge.label,
          labelStyle: {
            fontSize: 12,
            fontWeight: 600,
            fill: isDark ? "#fff" : "#334155",
          },
          labelBgStyle: {
            fill: isDark ? "#1e293b" : "#ffffff",
            fillOpacity: 0.95,
          },
          labelBgPadding: [10, 6] as [number, number],
          labelBgBorderRadius: 8,
          style: {
            stroke: config.color,
            strokeWidth: 4,
          },
          markerEnd: {
            type: MarkerType.ArrowClosed,
            width: 20,
            height: 20,
            color: config.color,
          },
        };
      });
  }, [data.edges, data.nodes, visibleCount, isDark]);

  // Update React Flow state
  useEffect(() => {
    setNodes(flowNodes);
  }, [flowNodes, setNodes]);

  useEffect(() => {
    setEdges(flowEdges);
  }, [flowEdges, setEdges]);

  // Animation
  useEffect(() => {
    if (isPlaying && visibleCount < data.nodes.length) {
      animationRef.current = setTimeout(() => {
        setVisibleCount((prev) => prev + 1);
      }, animationDelay);
    }
    return () => {
      if (animationRef.current) clearTimeout(animationRef.current);
    };
  }, [isPlaying, visibleCount, data.nodes.length, animationDelay]);

  // Fit view
  useEffect(() => {
    if (visibleCount > 0) {
      const timer = setTimeout(() => {
        try {
          fitView({ padding: 0.2, duration: 500 });
        } catch (e) {}
      }, 300);
      return () => clearTimeout(timer);
    }
  }, [visibleCount, fitView]);

  const handlePlayPause = () => setIsPlaying(!isPlaying);
  const handleReset = () => {
    setIsPlaying(false);
    setVisibleCount(0);
    setTimeout(() => setIsPlaying(true), 100);
  };
  const handleSkipToEnd = () => {
    setIsPlaying(false);
    setVisibleCount(data.nodes.length);
  };

  const handleNodeClick = useCallback(
    (_: React.MouseEvent, node: Node) => {
      const narrativeNode = data.nodes.find((n) => n.id === node.id);
      if (narrativeNode) {
        setSelectedNode(narrativeNode);
        onNodeClick?.(narrativeNode);
      }
    },
    [data.nodes, onNodeClick]
  );

  const progress = data.nodes.length > 0 ? (visibleCount / data.nodes.length) * 100 : 0;

  return (
    <div
      className={cn(
        "relative w-full rounded-2xl overflow-hidden border",
        isDark
          ? "bg-slate-900 border-slate-700"
          : "bg-slate-50 border-slate-200",
        isFullscreen && "fixed inset-0 z-50 rounded-none",
        className
      )}
      style={{ height: isFullscreen ? "100vh" : "700px" }}
    >
      {/* Header */}
      <div
        className={cn(
          "absolute top-0 left-0 right-0 z-10 px-4 py-3",
          isDark ? "bg-slate-900/90" : "bg-white/90",
          "backdrop-blur-sm border-b",
          isDark ? "border-slate-700" : "border-slate-200"
        )}
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div
              className={cn(
                "flex items-center gap-2 px-3 py-1.5 rounded-lg border",
                isDark ? "bg-slate-800 border-slate-600" : "bg-white border-slate-300"
              )}
            >
              <div
                className={cn(
                  "w-3 h-3 rounded-full",
                  isPlaying ? "bg-green-500 animate-pulse" : "bg-amber-500"
                )}
              />
              <span
                className={cn(
                  "text-sm font-medium",
                  isDark ? "text-white" : "text-slate-700"
                )}
              >
                {isPlaying
                  ? "Building Story..."
                  : visibleCount === data.nodes.length
                  ? "Complete"
                  : "Paused"}
              </span>
            </div>
            <Badge
              className={cn(
                isDark ? "bg-slate-700 text-white" : "bg-slate-200 text-slate-700"
              )}
            >
              {visibleCount} / {data.nodes.length} events
            </Badge>
          </div>

          <Button
            variant="outline"
            size="icon"
            onClick={() => setIsFullscreen(!isFullscreen)}
            className={cn(
              isDark
                ? "border-slate-600 text-white hover:bg-slate-700"
                : "border-slate-300 text-slate-700 hover:bg-slate-100"
            )}
          >
            {isFullscreen ? <X className="h-4 w-4" /> : <Maximize2 className="h-4 w-4" />}
          </Button>
        </div>

        {/* Progress bar */}
        <div
          className={cn(
            "mt-3 h-2 rounded-full overflow-hidden",
            isDark ? "bg-slate-700" : "bg-slate-200"
          )}
        >
          <motion.div
            className="h-full bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500"
            initial={{ width: 0 }}
            animate={{ width: `${progress}%` }}
            transition={{ duration: 0.3 }}
          />
        </div>
      </div>

      {/* React Flow */}
      <ReactFlow
        nodes={nodes}
        edges={edges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        onNodeClick={handleNodeClick}
        nodeTypes={nodeTypes}
        connectionLineType={ConnectionLineType.SmoothStep}
        fitView
        fitViewOptions={{ padding: 0.2 }}
        minZoom={0.1}
        maxZoom={2}
        defaultEdgeOptions={{
          type: "smoothstep",
          style: { strokeWidth: 4 },
        }}
        proOptions={{ hideAttribution: true }}
      >
        <Background
          variant={BackgroundVariant.Dots}
          gap={20}
          size={2}
          color={isDark ? "rgba(255,255,255,0.1)" : "rgba(0,0,0,0.1)"}
        />

        {/* Controls */}
        <Panel position="bottom-center" className="mb-6">
          <div
            className={cn(
              "flex items-center gap-3 px-5 py-3 rounded-2xl border shadow-xl",
              isDark
                ? "bg-slate-800 border-slate-600"
                : "bg-white border-slate-200"
            )}
          >
            <Button
              variant="ghost"
              size="icon"
              onClick={handleReset}
              className={isDark ? "text-white hover:bg-slate-700" : ""}
            >
              <RotateCcw className="h-5 w-5" />
            </Button>

            <Button
              size="icon"
              onClick={handlePlayPause}
              className={cn(
                "h-12 w-12 rounded-full",
                isPlaying
                  ? isDark
                    ? "bg-slate-600 text-white"
                    : "bg-slate-200 text-slate-700"
                  : "bg-blue-500 text-white hover:bg-blue-600"
              )}
            >
              {isPlaying ? <Pause className="h-6 w-6" /> : <Play className="h-6 w-6 ml-1" />}
            </Button>

            <Button
              variant="ghost"
              size="icon"
              onClick={handleSkipToEnd}
              disabled={visibleCount === data.nodes.length}
              className={isDark ? "text-white hover:bg-slate-700" : ""}
            >
              <ChevronRight className="h-6 w-6" />
              <ChevronRight className="h-6 w-6 -ml-4" />
            </Button>

            <div className={cn("w-px h-8", isDark ? "bg-slate-600" : "bg-slate-200")} />

            <Button
              variant="ghost"
              size="icon"
              onClick={() => zoomOut()}
              className={isDark ? "text-white hover:bg-slate-700" : ""}
            >
              <ZoomOut className="h-5 w-5" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => zoomIn()}
              className={isDark ? "text-white hover:bg-slate-700" : ""}
            >
              <ZoomIn className="h-5 w-5" />
            </Button>
          </div>
        </Panel>

        {/* Legend */}
        <Panel position="bottom-left" className="mb-6 ml-4">
          <div
            className={cn(
              "flex flex-wrap gap-3 px-4 py-3 rounded-xl border shadow-lg",
              isDark ? "bg-slate-800 border-slate-600" : "bg-white border-slate-200"
            )}
          >
            {Object.entries(NODE_CONFIGS).map(([type, config]) => {
              const Icon = config.icon;
              return (
                <div key={type} className="flex items-center gap-2">
                  <div
                    className="w-6 h-6 rounded flex items-center justify-center text-white"
                    style={{ backgroundColor: config.color }}
                  >
                    <Icon className="w-3.5 h-3.5" />
                  </div>
                  <span
                    className={cn(
                      "text-xs font-medium",
                      isDark ? "text-white/70" : "text-slate-600"
                    )}
                  >
                    {config.label}
                  </span>
                </div>
              );
            })}
          </div>
        </Panel>
      </ReactFlow>

      {/* Selected Node Panel */}
      <AnimatePresence>
        {selectedNode && (
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 20 }}
            className="absolute top-24 right-4 w-80 z-20"
          >
            <div
              className={cn(
                "rounded-xl border shadow-2xl overflow-hidden",
                isDark ? "bg-slate-800 border-slate-600" : "bg-white border-slate-200"
              )}
            >
              <div
                className="px-4 py-3 border-b"
                style={{
                  backgroundColor:
                    NODE_CONFIGS[selectedNode.type]?.color + "20",
                  borderColor: NODE_CONFIGS[selectedNode.type]?.color + "40",
                }}
              >
                <div className="flex items-center justify-between">
                  <Badge
                    className="text-white text-xs"
                    style={{
                      backgroundColor: NODE_CONFIGS[selectedNode.type]?.color,
                    }}
                  >
                    {NODE_CONFIGS[selectedNode.type]?.label}
                  </Badge>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-6 w-6"
                    onClick={() => setSelectedNode(null)}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              </div>

              <div className="p-4 space-y-3">
                <h3
                  className={cn(
                    "text-sm font-semibold",
                    isDark ? "text-white" : "text-slate-800"
                  )}
                >
                  {selectedNode.label}
                </h3>
                <p
                  className={cn(
                    "text-xs leading-relaxed",
                    isDark ? "text-white/60" : "text-slate-600"
                  )}
                >
                  {selectedNode.data.summary}
                </p>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

// Wrapper
export function NarrativeGraph(props: {
  data: NarrativeGraphData;
  autoPlay?: boolean;
  animationDelay?: number;
  onNodeClick?: (node: NarrativeNode) => void;
  className?: string;
}) {
  return (
    <ReactFlowProvider>
      <NarrativeGraphInner {...props} />
    </ReactFlowProvider>
  );
}

export default NarrativeGraph;
