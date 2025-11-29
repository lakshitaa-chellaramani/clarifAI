"use client";

import React, { useCallback, useMemo, useState } from "react";
import ReactFlow, {
  Node,
  Edge,
  Background,
  Controls,
  MarkerType,
  useNodesState,
  useEdgesState,
  Handle,
  Position,
  NodeProps,
} from "reactflow";
import "reactflow/dist/style.css";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";
import {
  BookOpen,
  Lightbulb,
  BarChart3,
  Users,
  TrendingUp,
  Microscope,
  ExternalLink,
  CheckCircle,
  AlertTriangle,
  AlertCircle,
  Quote,
  X
} from "lucide-react";

// Types
export interface ResearchNodeData {
  summary: string;
  source_title: string;
  source_url: string;
  confidence: "HIGH" | "MEDIUM" | "LOW";
  key_quote?: string;
}

export interface ResearchNode {
  id: string;
  label: string;
  type: "CORE_CONCEPT" | "KEY_FINDING" | "EVIDENCE" | "PERSPECTIVE" | "IMPLICATION" | "METHODOLOGY";
  data: ResearchNodeData;
}

export interface ResearchEdge {
  source: string;
  target: string;
  label: string;
}

export interface ResearchGraphData {
  nodes: ResearchNode[];
  edges: ResearchEdge[];
}

interface ResearchGraphProps {
  data: ResearchGraphData;
  onNodeClick?: (node: ResearchNode) => void;
  className?: string;
  theme?: "light" | "dark";
}

// Node type configurations
const nodeTypeConfig: Record<string, { icon: React.ElementType; color: string; bgColor: string; borderColor: string }> = {
  CORE_CONCEPT: {
    icon: BookOpen,
    color: "text-blue-400",
    bgColor: "bg-gradient-to-br from-blue-500/20 to-blue-600/30",
    borderColor: "border-blue-500/50"
  },
  KEY_FINDING: {
    icon: Lightbulb,
    color: "text-yellow-400",
    bgColor: "bg-gradient-to-br from-yellow-500/20 to-amber-600/30",
    borderColor: "border-yellow-500/50"
  },
  EVIDENCE: {
    icon: BarChart3,
    color: "text-emerald-400",
    bgColor: "bg-gradient-to-br from-emerald-500/20 to-green-600/30",
    borderColor: "border-emerald-500/50"
  },
  PERSPECTIVE: {
    icon: Users,
    color: "text-purple-400",
    bgColor: "bg-gradient-to-br from-purple-500/20 to-violet-600/30",
    borderColor: "border-purple-500/50"
  },
  IMPLICATION: {
    icon: TrendingUp,
    color: "text-orange-400",
    bgColor: "bg-gradient-to-br from-orange-500/20 to-red-600/30",
    borderColor: "border-orange-500/50"
  },
  METHODOLOGY: {
    icon: Microscope,
    color: "text-cyan-400",
    bgColor: "bg-gradient-to-br from-cyan-500/20 to-teal-600/30",
    borderColor: "border-cyan-500/50"
  }
};

const confidenceConfig = {
  HIGH: { icon: CheckCircle, color: "text-emerald-400", label: "High Confidence" },
  MEDIUM: { icon: AlertTriangle, color: "text-yellow-400", label: "Medium Confidence" },
  LOW: { icon: AlertCircle, color: "text-red-400", label: "Low Confidence" }
};

// Custom Research Node Component
function ResearchNodeComponent({ data, selected }: NodeProps) {
  const config = nodeTypeConfig[data.nodeType as string] || nodeTypeConfig.KEY_FINDING;
  const Icon = config.icon;
  const confConfig = confidenceConfig[data.confidence as keyof typeof confidenceConfig] || confidenceConfig.MEDIUM;
  const ConfIcon = confConfig.icon;
  const isLight = data.theme === "light";

  return (
    <motion.div
      initial={{ scale: 0.8, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      className={cn(
        "relative px-4 py-3 rounded-xl border-2 backdrop-blur-sm min-w-[200px] max-w-[280px] cursor-pointer",
        config.bgColor,
        config.borderColor,
        selected && (isLight ? "ring-2 ring-slate-400/50 shadow-lg shadow-slate-400/20" : "ring-2 ring-white/50 shadow-lg shadow-white/20")
      )}
    >
      <Handle
        type="target"
        position={Position.Top}
        className={cn(
          "!w-3 !h-3 !border-2",
          isLight ? "!bg-slate-400/50 !border-slate-400/30" : "!bg-white/50 !border-white/30"
        )}
      />
      <Handle
        type="source"
        position={Position.Bottom}
        className={cn(
          "!w-3 !h-3 !border-2",
          isLight ? "!bg-slate-400/50 !border-slate-400/30" : "!bg-white/50 !border-white/30"
        )}
      />

      {/* Type Badge - Fixed positioning inside node */}
      <div className="absolute top-2 right-2">
        <span className={cn(
          "text-[9px] px-1.5 py-0.5 rounded-full font-medium whitespace-nowrap",
          isLight ? "bg-white/80 text-slate-700 border border-slate-300" : "bg-black/40 text-white/90 border border-white/20"
        )}>
          {data.nodeType?.replace("_", " ")}
        </span>
      </div>

      {/* Header */}
      <div className="flex items-start gap-2 mb-2 pr-16">
        <div className={cn("p-1.5 rounded-lg shrink-0", isLight ? "bg-black/10" : "bg-white/10", config.color)}>
          <Icon className="w-4 h-4" />
        </div>
        <div className="flex-1 min-w-0">
          <h3 className={cn(
            "text-sm font-semibold leading-tight line-clamp-2",
            isLight ? "text-slate-800" : "text-white"
          )}>
            {data.label}
          </h3>
          <div className="flex items-center gap-1 mt-1">
            <ConfIcon className={cn("w-3 h-3", confConfig.color)} />
            <span className={cn("text-xs", confConfig.color)}>{confConfig.label}</span>
          </div>
        </div>
      </div>

      {/* Summary */}
      <p className={cn(
        "text-xs line-clamp-3 mb-2",
        isLight ? "text-slate-600" : "text-white/70"
      )}>
        {data.summary}
      </p>

      {/* Source Link */}
      {data.source_url && (
        <a
          href={data.source_url}
          target="_blank"
          rel="noopener noreferrer"
          onClick={(e) => e.stopPropagation()}
          className="flex items-center gap-1 text-xs text-blue-500 hover:text-blue-400 transition-colors mt-2 group"
        >
          <ExternalLink className="w-3 h-3" />
          <span className="truncate group-hover:underline">
            {data.source_title || "View Source"}
          </span>
        </a>
      )}
    </motion.div>
  );
}

const nodeTypes = {
  researchNode: ResearchNodeComponent
};

// Node Detail Panel
interface NodeDetailPanelProps {
  node: ResearchNode | null;
  onClose: () => void;
  theme?: "light" | "dark";
}

function NodeDetailPanel({ node, onClose, theme = "dark" }: NodeDetailPanelProps) {
  if (!node) return null;

  const config = nodeTypeConfig[node.type] || nodeTypeConfig.KEY_FINDING;
  const Icon = config.icon;
  const confConfig = confidenceConfig[node.data.confidence] || confidenceConfig.MEDIUM;
  const ConfIcon = confConfig.icon;
  const isLight = theme === "light";

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, x: 20 }}
        animate={{ opacity: 1, x: 0 }}
        exit={{ opacity: 0, x: 20 }}
        className={cn(
          "absolute top-4 right-4 w-80 backdrop-blur-md border rounded-xl shadow-2xl z-50 overflow-hidden",
          isLight
            ? "bg-white/95 border-slate-200"
            : "bg-slate-900/95 border-white/10"
        )}
      >
        {/* Header */}
        <div className={cn("p-4 border-b", isLight ? "border-slate-200" : "border-white/10", config.bgColor)}>
          <div className="flex items-start justify-between gap-2">
            <div className="flex items-center gap-2">
              <div className={cn("p-2 rounded-lg", isLight ? "bg-black/10" : "bg-white/10", config.color)}>
                <Icon className="w-5 h-5" />
              </div>
              <div>
                <h3 className={cn("font-semibold", isLight ? "text-slate-800" : "text-white")}>{node.label}</h3>
                <span className={cn("text-xs", isLight ? "text-slate-500" : "text-white/60")}>{node.type.replace("_", " ")}</span>
              </div>
            </div>
            <button
              onClick={onClose}
              className={cn(
                "p-1 rounded-lg transition-colors",
                isLight
                  ? "hover:bg-slate-100 text-slate-400 hover:text-slate-600"
                  : "hover:bg-white/10 text-white/60 hover:text-white"
              )}
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="p-4 space-y-4">
          {/* Confidence */}
          <div className="flex items-center gap-2">
            <ConfIcon className={cn("w-4 h-4", confConfig.color)} />
            <span className={cn("text-sm font-medium", confConfig.color)}>{confConfig.label}</span>
          </div>

          {/* Summary */}
          <div>
            <h4 className={cn("text-xs font-medium uppercase mb-1", isLight ? "text-slate-500" : "text-white/60")}>Summary</h4>
            <p className={cn("text-sm", isLight ? "text-slate-700" : "text-white/80")}>{node.data.summary}</p>
          </div>

          {/* Key Quote */}
          {node.data.key_quote && (
            <div className={cn(
              "rounded-lg p-3 border-l-2 border-blue-500",
              isLight ? "bg-slate-100" : "bg-white/5"
            )}>
              <div className="flex items-start gap-2">
                <Quote className="w-4 h-4 text-blue-500 mt-0.5 shrink-0" />
                <p className={cn("text-sm italic", isLight ? "text-slate-700" : "text-white/80")}>{node.data.key_quote}</p>
              </div>
            </div>
          )}

          {/* Source */}
          {node.data.source_url && (
            <div>
              <h4 className={cn("text-xs font-medium uppercase mb-2", isLight ? "text-slate-500" : "text-white/60")}>Source</h4>
              <a
                href={node.data.source_url}
                target="_blank"
                rel="noopener noreferrer"
                className={cn(
                  "flex items-center gap-2 p-3 rounded-lg transition-colors group",
                  isLight
                    ? "bg-slate-100 hover:bg-slate-200"
                    : "bg-white/5 hover:bg-white/10"
                )}
              >
                <ExternalLink className="w-4 h-4 text-blue-500" />
                <span className="text-sm text-blue-500 group-hover:underline truncate">
                  {node.data.source_title || "View Source"}
                </span>
              </a>
            </div>
          )}
        </div>
      </motion.div>
    </AnimatePresence>
  );
}

// Main Research Graph Component
export function ResearchGraph({ data, onNodeClick, className, theme = "dark" }: ResearchGraphProps) {
  const [selectedNode, setSelectedNode] = useState<ResearchNode | null>(null);
  const isLight = theme === "light";

  // Convert to ReactFlow format
  const flowNodes: Node[] = useMemo(() => {
    const nodePositions = calculateNodePositions(data.nodes);

    return data.nodes.map((node, index) => ({
      id: node.id,
      type: "researchNode",
      position: nodePositions[node.id] || { x: 200 * (index % 4), y: 180 * Math.floor(index / 4) },
      data: {
        label: node.label,
        nodeType: node.type,
        summary: node.data.summary,
        source_title: node.data.source_title,
        source_url: node.data.source_url,
        confidence: node.data.confidence,
        key_quote: node.data.key_quote,
        theme: theme
      }
    }));
  }, [data.nodes, theme]);

  const flowEdges: Edge[] = useMemo(() => {
    return data.edges.map((edge, index) => ({
      id: `edge-${index}`,
      source: edge.source,
      target: edge.target,
      label: edge.label,
      type: "smoothstep",
      animated: true,
      style: {
        stroke: isLight ? "rgba(100,116,139,0.5)" : "rgba(255,255,255,0.3)",
        strokeWidth: 2
      },
      labelStyle: {
        fill: isLight ? "rgba(51,65,85,0.9)" : "rgba(255,255,255,0.7)",
        fontSize: 10,
        fontWeight: 500
      },
      labelBgStyle: {
        fill: isLight ? "rgba(255,255,255,0.9)" : "rgba(0,0,0,0.6)",
        rx: 4,
        ry: 4
      },
      labelBgPadding: [4, 2] as [number, number],
      markerEnd: {
        type: MarkerType.ArrowClosed,
        color: isLight ? "rgba(100,116,139,0.7)" : "rgba(255,255,255,0.5)",
        width: 15,
        height: 15
      }
    }));
  }, [data.edges, isLight]);

  const [nodes, setNodes, onNodesChange] = useNodesState(flowNodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState(flowEdges);

  // Update when data changes
  React.useEffect(() => {
    setNodes(flowNodes);
    setEdges(flowEdges);
  }, [flowNodes, flowEdges, setNodes, setEdges]);

  const handleNodeClick = useCallback((event: React.MouseEvent, node: Node) => {
    const originalNode = data.nodes.find(n => n.id === node.id);
    if (originalNode) {
      setSelectedNode(originalNode);
      onNodeClick?.(originalNode);
    }
  }, [data.nodes, onNodeClick]);

  return (
    <div className={cn(
      "relative w-full h-full rounded-xl overflow-hidden",
      isLight ? "bg-slate-50" : "bg-slate-950",
      className
    )}>
      <ReactFlow
        nodes={nodes}
        edges={edges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        onNodeClick={handleNodeClick}
        nodeTypes={nodeTypes}
        fitView
        fitViewOptions={{ padding: 0.2 }}
        minZoom={0.3}
        maxZoom={1.5}
        defaultViewport={{ x: 0, y: 0, zoom: 0.8 }}
      >
        <Background
          color={isLight ? "rgba(100,116,139,0.1)" : "rgba(255,255,255,0.05)"}
          gap={20}
        />
        <Controls className={cn(
          "!rounded-lg",
          isLight
            ? "!bg-white/90 !border-slate-200 [&>button]:!bg-slate-100 [&>button]:!border-slate-200 [&>button]:!text-slate-600 [&>button:hover]:!bg-slate-200"
            : "!bg-slate-800/80 !border-white/10 [&>button]:!bg-slate-700 [&>button]:!border-white/10 [&>button]:!text-white [&>button:hover]:!bg-slate-600"
        )} />
      </ReactFlow>

      {/* Node Detail Panel */}
      <NodeDetailPanel
        node={selectedNode}
        onClose={() => setSelectedNode(null)}
        theme={theme}
      />

      {/* Legend */}
      <div className={cn(
        "absolute bottom-4 left-4 backdrop-blur-sm rounded-lg p-3 border",
        isLight
          ? "bg-white/90 border-slate-200"
          : "bg-slate-900/80 border-white/10"
      )}>
        <h4 className={cn(
          "text-xs font-medium mb-2",
          isLight ? "text-slate-500" : "text-white/60"
        )}>Node Types</h4>
        <div className="grid grid-cols-2 gap-2">
          {Object.entries(nodeTypeConfig).map(([type, config]) => {
            const Icon = config.icon;
            return (
              <div key={type} className="flex items-center gap-1.5">
                <Icon className={cn("w-3 h-3", config.color)} />
                <span className={cn(
                  "text-xs",
                  isLight ? "text-slate-600" : "text-white/70"
                )}>{type.replace("_", " ")}</span>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

// Helper function to calculate node positions
function calculateNodePositions(nodes: ResearchNode[]): Record<string, { x: number; y: number }> {
  const positions: Record<string, { x: number; y: number }> = {};
  const typeGroups: Record<string, ResearchNode[]> = {};

  // Group nodes by type
  nodes.forEach(node => {
    if (!typeGroups[node.type]) {
      typeGroups[node.type] = [];
    }
    typeGroups[node.type].push(node);
  });

  // Position nodes in a hierarchical layout
  const typeOrder = ["CORE_CONCEPT", "KEY_FINDING", "EVIDENCE", "PERSPECTIVE", "IMPLICATION", "METHODOLOGY"];
  let currentY = 0;

  typeOrder.forEach(type => {
    const group = typeGroups[type] || [];
    const startX = (4 - group.length) * 150;

    group.forEach((node, index) => {
      positions[node.id] = {
        x: startX + index * 300,
        y: currentY
      };
    });

    if (group.length > 0) {
      currentY += 200;
    }
  });

  return positions;
}

export default ResearchGraph;
