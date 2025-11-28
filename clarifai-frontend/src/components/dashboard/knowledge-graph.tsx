"use client";

import { cn } from "@/lib/utils";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Expand,
  Network,
  ZoomIn,
  ZoomOut,
  X,
  Target,
  Layers,
} from "lucide-react";
import { useCallback, useEffect, useRef, useState } from "react";
import dynamic from "next/dynamic";
import { useTheme } from "next-themes";

const ForceGraph2D = dynamic(() => import("react-force-graph-2d"), {
  ssr: false,
  loading: () => (
    <div className="h-full w-full flex items-center justify-center bg-muted/30">
      <div className="flex flex-col items-center gap-3">
        <div className="h-10 w-10 border-2 border-primary/30 border-t-primary rounded-full animate-spin" />
        <span className="text-sm text-muted-foreground">Loading graph...</span>
      </div>
    </div>
  ),
});

interface GraphNode {
  id: string;
  label: string;
  type: "event" | "entity" | "claim" | "source";
  importance?: number;
  verified?: boolean;
  timestamp?: string;
}

interface GraphEdge {
  source: string;
  target: string;
  relationship: string;
  strength?: number;
}

interface KnowledgeGraphProps {
  nodes: GraphNode[];
  edges: GraphEdge[];
  className?: string;
  onNodeClick?: (node: GraphNode) => void;
  height?: number;
  showHeader?: boolean;
  title?: string;
}

// Clean, professional color scheme
const nodeColors = {
  event: { bg: "#8B5CF6", text: "#FFFFFF" },    // Violet
  entity: { bg: "#3B82F6", text: "#FFFFFF" },   // Blue
  claim: { bg: "#F59E0B", text: "#FFFFFF" },    // Amber
  source: { bg: "#10B981", text: "#FFFFFF" },   // Emerald
};

export function KnowledgeGraph({
  nodes,
  edges,
  className,
  onNodeClick,
  height = 500,
  showHeader = true,
  title = "Knowledge Graph",
}: KnowledgeGraphProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const graphRef = useRef<any>(null);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [dimensions, setDimensions] = useState({ width: 800, height });
  const [selectedNode, setSelectedNode] = useState<any>(null);
  const [hoveredNode, setHoveredNode] = useState<any>(null);
  const [filter, setFilter] = useState<string | null>(null);
  const [isClient, setIsClient] = useState(false);
  const { resolvedTheme } = useTheme();

  const isDark = resolvedTheme === "dark";

  useEffect(() => {
    setIsClient(true);
  }, []);

  // Process graph data
  const graphData = {
    nodes: nodes
      .filter(n => n && n.id)
      .filter(n => !filter || n.type === filter)
      .map((node, index) => {
        const importance = node.importance || (node.type === "event" ? 8 : node.type === "entity" ? 6 : 5);
        return {
          id: node.id,
          label: node.label || node.id,
          type: node.type || "source",
          importance,
          verified: node.verified,
          val: importance * 2,
          index,
        };
      }),
    links: edges
      .filter(e => e && e.source && e.target)
      .filter(e => {
        if (!filter) return true;
        const sourceNode = nodes.find(n => n.id === e.source);
        const targetNode = nodes.find(n => n.id === e.target);
        return sourceNode?.type === filter || targetNode?.type === filter;
      })
      .map(edge => ({
        source: edge.source,
        target: edge.target,
        label: edge.relationship,
        strength: edge.strength || 0.5,
      })),
  };

  useEffect(() => {
    const updateDimensions = () => {
      if (containerRef.current) {
        const rect = containerRef.current.getBoundingClientRect();
        setDimensions({
          width: rect.width || 800,
          height: isFullscreen ? window.innerHeight - 60 : height,
        });
      }
    };

    updateDimensions();
    window.addEventListener("resize", updateDimensions);

    const timer = setTimeout(() => {
      if (graphRef.current) {
        graphRef.current.zoomToFit(600, 80);
      }
    }, 1000);

    return () => {
      window.removeEventListener("resize", updateDimensions);
      clearTimeout(timer);
    };
  }, [isFullscreen, height]);

  const handleNodeClick = useCallback((node: any) => {
    setSelectedNode(selectedNode?.id === node.id ? null : node);
    onNodeClick?.(node);

    if (graphRef.current) {
      graphRef.current.centerAt(node.x, node.y, 600);
      graphRef.current.zoom(2, 600);
    }
  }, [onNodeClick, selectedNode]);

  // Clean node rendering
  const paintNode = useCallback((node: any, ctx: CanvasRenderingContext2D, globalScale: number) => {
    if (typeof node.x !== 'number' || typeof node.y !== 'number' || !isFinite(node.x) || !isFinite(node.y)) {
      return;
    }

    const colors = nodeColors[node.type as keyof typeof nodeColors] || nodeColors.source;
    const label = node.label || node.id || "";
    const nodeSize = Math.sqrt(node.val || 10) * 3;
    const isSelected = selectedNode?.id === node.id;
    const isHovered = hoveredNode?.id === node.id;

    // Selection/hover ring
    if (isSelected || isHovered) {
      ctx.beginPath();
      ctx.arc(node.x, node.y, nodeSize + 6, 0, 2 * Math.PI);
      ctx.strokeStyle = colors.bg;
      ctx.lineWidth = 2;
      ctx.setLineDash(isSelected ? [] : [4, 4]);
      ctx.stroke();
      ctx.setLineDash([]);
    }

    // Main node circle
    ctx.beginPath();
    ctx.arc(node.x, node.y, nodeSize, 0, 2 * Math.PI);
    ctx.fillStyle = colors.bg;
    ctx.fill();

    // Border
    ctx.beginPath();
    ctx.arc(node.x, node.y, nodeSize, 0, 2 * Math.PI);
    ctx.strokeStyle = isDark ? "rgba(255,255,255,0.2)" : "rgba(0,0,0,0.1)";
    ctx.lineWidth = 1;
    ctx.stroke();

    // Label (show when zoomed or hovered/selected)
    if (globalScale > 0.6 || isHovered || isSelected) {
      const displayLabel = label.length > 20 ? label.substring(0, 18) + "..." : label;
      const fontSize = Math.max(11 / globalScale, 6);
      ctx.font = `500 ${fontSize}px Inter, system-ui, sans-serif`;
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";

      const textWidth = ctx.measureText(displayLabel).width;
      const paddingX = 6 / globalScale;
      const paddingY = 4 / globalScale;
      const bgX = node.x - textWidth / 2 - paddingX;
      const bgY = node.y + nodeSize + 8 / globalScale;
      const bgWidth = textWidth + paddingX * 2;
      const bgHeight = fontSize + paddingY * 2;
      const radius = 4 / globalScale;

      // Label background
      ctx.beginPath();
      ctx.roundRect(bgX, bgY, bgWidth, bgHeight, radius);
      ctx.fillStyle = isDark ? "rgba(30, 41, 59, 0.95)" : "rgba(255, 255, 255, 0.95)";
      ctx.fill();
      ctx.strokeStyle = isDark ? "rgba(71, 85, 105, 0.5)" : "rgba(203, 213, 225, 0.8)";
      ctx.lineWidth = 1 / globalScale;
      ctx.stroke();

      // Label text
      ctx.fillStyle = isDark ? "#E2E8F0" : "#1E293B";
      ctx.fillText(displayLabel, node.x, bgY + bgHeight / 2);
    }
  }, [selectedNode, hoveredNode, isDark]);

  // Clean link rendering
  const paintLink = useCallback((link: any, ctx: CanvasRenderingContext2D, globalScale: number) => {
    const start = link.source;
    const end = link.target;

    if (!start || !end ||
        typeof start.x !== 'number' || typeof start.y !== 'number' ||
        typeof end.x !== 'number' || typeof end.y !== 'number' ||
        !isFinite(start.x) || !isFinite(start.y) || !isFinite(end.x) || !isFinite(end.y)) {
      return;
    }

    const startColor = nodeColors[start.type as keyof typeof nodeColors]?.bg || "#888";
    const endColor = nodeColors[end.type as keyof typeof nodeColors]?.bg || "#888";

    // Line
    const gradient = ctx.createLinearGradient(start.x, start.y, end.x, end.y);
    gradient.addColorStop(0, startColor + "60");
    gradient.addColorStop(1, endColor + "60");

    ctx.beginPath();
    ctx.moveTo(start.x, start.y);
    ctx.lineTo(end.x, end.y);
    ctx.strokeStyle = gradient;
    ctx.lineWidth = 1.5;
    ctx.stroke();

    // Arrow
    const dx = end.x - start.x;
    const dy = end.y - start.y;
    const angle = Math.atan2(dy, dx);
    const endNodeSize = Math.sqrt(end.val || 10) * 3;

    const arrowLen = 6;
    const arrowX = end.x - Math.cos(angle) * (endNodeSize + 4);
    const arrowY = end.y - Math.sin(angle) * (endNodeSize + 4);

    ctx.beginPath();
    ctx.moveTo(arrowX, arrowY);
    ctx.lineTo(
      arrowX - arrowLen * Math.cos(angle - Math.PI / 7),
      arrowY - arrowLen * Math.sin(angle - Math.PI / 7)
    );
    ctx.lineTo(
      arrowX - arrowLen * Math.cos(angle + Math.PI / 7),
      arrowY - arrowLen * Math.sin(angle + Math.PI / 7)
    );
    ctx.closePath();
    ctx.fillStyle = endColor + "80";
    ctx.fill();

    // Relationship label when zoomed
    if (link.label && globalScale > 1.5) {
      const midX = (start.x + end.x) / 2;
      const midY = (start.y + end.y) / 2;
      const fontSize = Math.max(8 / globalScale, 4);

      ctx.font = `400 ${fontSize}px Inter, system-ui, sans-serif`;
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";

      const labelText = link.label.replace(/_/g, " ").toLowerCase();
      const textWidth = ctx.measureText(labelText).width;

      ctx.fillStyle = isDark ? "rgba(30, 41, 59, 0.9)" : "rgba(255, 255, 255, 0.9)";
      ctx.fillRect(midX - textWidth / 2 - 3, midY - fontSize / 2 - 2, textWidth + 6, fontSize + 4);

      ctx.fillStyle = isDark ? "#94A3B8" : "#64748B";
      ctx.fillText(labelText, midX, midY);
    }
  }, [isDark]);

  const handleZoomIn = () => graphRef.current?.zoom(graphRef.current.zoom() * 1.4, 400);
  const handleZoomOut = () => graphRef.current?.zoom(graphRef.current.zoom() / 1.4, 400);
  const handleResetView = () => graphRef.current?.zoomToFit(500, 80);
  const toggleFullscreen = () => setIsFullscreen(!isFullscreen);

  const bgColor = isDark ? "#0F172A" : "#F8FAFC";

  const graphContent = (
    <div className="relative h-full w-full" style={{ backgroundColor: bgColor }}>
      {/* Subtle background pattern */}
      <div
        className="absolute inset-0 opacity-50"
        style={{
          backgroundImage: isDark
            ? `radial-gradient(circle at 1px 1px, rgba(148,163,184,0.1) 1px, transparent 0)`
            : `radial-gradient(circle at 1px 1px, rgba(148,163,184,0.15) 1px, transparent 0)`,
          backgroundSize: '24px 24px',
        }}
      />

      {/* Filter Controls */}
      <div className="absolute top-3 left-3 z-10">
        <div className="flex items-center gap-1 bg-background/90 backdrop-blur-sm rounded-lg p-1 border shadow-sm">
          <button
            className={cn(
              "px-3 py-1.5 rounded-md text-xs font-medium transition-colors",
              filter === null
                ? "bg-primary text-primary-foreground"
                : "text-muted-foreground hover:text-foreground hover:bg-muted"
            )}
            onClick={() => setFilter(null)}
          >
            All
          </button>
          {Object.entries(nodeColors).map(([type, colors]) => (
            <button
              key={type}
              className={cn(
                "px-3 py-1.5 rounded-md text-xs font-medium transition-colors flex items-center gap-1.5",
                filter === type
                  ? "text-white"
                  : "text-muted-foreground hover:text-foreground hover:bg-muted"
              )}
              style={filter === type ? { backgroundColor: colors.bg } : {}}
              onClick={() => setFilter(type)}
            >
              <span
                className="w-2 h-2 rounded-full"
                style={{ backgroundColor: colors.bg }}
              />
              <span className="capitalize hidden sm:inline">{type}s</span>
            </button>
          ))}
        </div>
      </div>

      {/* Zoom Controls */}
      <div className="absolute top-3 right-3 z-10">
        <div className="flex items-center gap-1 bg-background/90 backdrop-blur-sm rounded-lg p-1 border shadow-sm">
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8"
            onClick={handleZoomIn}
          >
            <ZoomIn className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8"
            onClick={handleZoomOut}
          >
            <ZoomOut className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8"
            onClick={handleResetView}
          >
            <Target className="h-4 w-4" />
          </Button>
          <div className="w-px h-5 bg-border mx-1" />
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8"
            onClick={toggleFullscreen}
          >
            {isFullscreen ? <X className="h-4 w-4" /> : <Expand className="h-4 w-4" />}
          </Button>
        </div>
      </div>

      {/* Graph */}
      <div ref={containerRef} className="h-full w-full">
        {isClient && graphData.nodes.length > 0 ? (
          <ForceGraph2D
            ref={graphRef}
            graphData={graphData}
            width={dimensions.width}
            height={dimensions.height}
            nodeCanvasObject={paintNode}
            nodePointerAreaPaint={(node: any, color: string, ctx: CanvasRenderingContext2D) => {
              const nodeSize = Math.sqrt(node.val || 10) * 3;
              ctx.beginPath();
              ctx.arc(node.x, node.y, nodeSize + 10, 0, 2 * Math.PI);
              ctx.fillStyle = color;
              ctx.fill();
            }}
            linkCanvasObject={paintLink}
            onNodeClick={handleNodeClick}
            onNodeHover={(node: any) => setHoveredNode(node)}
            onNodeDragEnd={(node: any) => {
              node.fx = node.x;
              node.fy = node.y;
            }}
            backgroundColor="transparent"
            cooldownTicks={150}
            d3AlphaDecay={0.02}
            d3VelocityDecay={0.2}
            warmupTicks={50}
          />
        ) : (
          <div className="h-full w-full flex items-center justify-center">
            <div className="text-center">
              <Network className="h-12 w-12 text-muted-foreground/50 mx-auto mb-3" />
              <p className="text-muted-foreground font-medium">No data available</p>
              <p className="text-muted-foreground/70 text-sm mt-1">
                Connect to backend to visualize connections
              </p>
            </div>
          </div>
        )}
      </div>

      {/* Legend */}
      <div className="absolute bottom-3 left-3 bg-background/90 backdrop-blur-sm rounded-lg px-4 py-2.5 border shadow-sm">
        <div className="flex items-center gap-4">
          {Object.entries(nodeColors).map(([type, colors]) => (
            <div key={type} className="flex items-center gap-1.5">
              <span
                className="w-2.5 h-2.5 rounded-full"
                style={{ backgroundColor: colors.bg }}
              />
              <span className="text-xs text-muted-foreground capitalize">{type}s</span>
            </div>
          ))}
        </div>
      </div>

      {/* Stats */}
      <div className="absolute bottom-3 right-3 bg-background/90 backdrop-blur-sm rounded-lg px-4 py-2.5 border shadow-sm">
        <div className="flex items-center gap-3 text-xs text-muted-foreground">
          <span className="font-medium">{graphData.nodes.length} nodes</span>
          <span className="text-border">•</span>
          <span className="font-medium">{graphData.links.length} edges</span>
        </div>
      </div>

      {/* Selected Node Panel */}
      {selectedNode && (
        <div className="absolute top-16 right-3 z-20 w-64 bg-background/95 backdrop-blur-sm border rounded-xl shadow-lg overflow-hidden">
          <div
            className="px-4 py-3 border-b"
            style={{
              background: `linear-gradient(135deg, ${nodeColors[selectedNode.type as keyof typeof nodeColors]?.bg}15, transparent)`
            }}
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span
                  className="w-3 h-3 rounded-full"
                  style={{ backgroundColor: nodeColors[selectedNode.type as keyof typeof nodeColors]?.bg }}
                />
                <Badge variant="secondary" className="text-[10px] uppercase">
                  {selectedNode.type}
                </Badge>
              </div>
              <Button
                variant="ghost"
                size="icon"
                className="h-6 w-6"
                onClick={() => setSelectedNode(null)}
              >
                <X className="h-3.5 w-3.5" />
              </Button>
            </div>
          </div>

          <div className="p-4 space-y-4">
            <h3 className="font-medium text-sm leading-relaxed">
              {selectedNode.label}
            </h3>

            {/* Importance */}
            <div>
              <div className="flex justify-between text-xs mb-1.5">
                <span className="text-muted-foreground">Importance</span>
                <span className="font-medium">{selectedNode.importance || 5}/10</span>
              </div>
              <div className="h-1.5 bg-muted rounded-full overflow-hidden">
                <div
                  className="h-full rounded-full"
                  style={{
                    width: `${(selectedNode.importance || 5) * 10}%`,
                    backgroundColor: nodeColors[selectedNode.type as keyof typeof nodeColors]?.bg
                  }}
                />
              </div>
            </div>

            {/* Connections */}
            <div>
              <p className="text-[10px] text-muted-foreground uppercase tracking-wider font-medium mb-2">
                Connections
              </p>
              <div className="flex flex-wrap gap-1">
                {graphData.links
                  .filter((l: any) => l.source?.id === selectedNode.id || l.target?.id === selectedNode.id)
                  .slice(0, 5)
                  .map((link: any, i: number) => {
                    const connectedNode = link.source?.id === selectedNode.id ? link.target : link.source;
                    return (
                      <Badge
                        key={i}
                        variant="outline"
                        className="text-[10px] cursor-pointer hover:bg-muted"
                        onClick={() => handleNodeClick(connectedNode)}
                      >
                        <span
                          className="w-1.5 h-1.5 rounded-full mr-1"
                          style={{ backgroundColor: nodeColors[connectedNode?.type as keyof typeof nodeColors]?.bg }}
                        />
                        {connectedNode?.label?.substring(0, 12)}...
                      </Badge>
                    );
                  })}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );

  if (isFullscreen) {
    return (
      <div className="fixed inset-0 z-50 bg-background">
        {graphContent}
      </div>
    );
  }

  return (
    <Card className={cn("overflow-hidden", className)}>
      {showHeader && (
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-base">
            <div className="p-2 rounded-lg bg-primary/10">
              <Network className="h-4 w-4 text-primary" />
            </div>
            <span>{title}</span>
            <Badge variant="secondary" className="ml-auto text-[10px]">
              Interactive
            </Badge>
          </CardTitle>
        </CardHeader>
      )}
      <CardContent className="p-0">
        <div style={{ height }}>{graphContent}</div>
      </CardContent>
    </Card>
  );
}
