"use client";

import { useState, useCallback, useRef } from "react";
import { NarrativeGraphData, NarrativeNode, NarrativeEdge } from "@/components/graphs/narrative-graph";
import { streamNarrativeGraph, getNarrativeGraph } from "@/lib/api";

interface UseNarrativeStreamOptions {
  onNodeAdded?: (node: NarrativeNode) => void;
  onEdgeAdded?: (edge: NarrativeEdge) => void;
  onComplete?: () => void;
  onError?: (error: string) => void;
  streamDelay?: number;
}

interface UseNarrativeStreamReturn {
  data: NarrativeGraphData;
  isStreaming: boolean;
  isLoading: boolean;
  progress: number;
  error: string | null;
  startStream: (fullData: NarrativeGraphData) => void;
  startLiveStream: (topic: string) => void;
  fetchGraph: (topic: string) => Promise<void>;
  stopStream: () => void;
  reset: () => void;
}

/**
 * Hook to simulate real-time streaming of narrative graph data
 * Supports both local demo data and real-time backend streaming
 */
export function useNarrativeStream(
  options: UseNarrativeStreamOptions = {}
): UseNarrativeStreamReturn {
  const { onNodeAdded, onEdgeAdded, onComplete, onError, streamDelay = 600 } = options;

  const [data, setData] = useState<NarrativeGraphData>({ nodes: [], edges: [] });
  const [isStreaming, setIsStreaming] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState<string | null>(null);

  const streamRef = useRef<NodeJS.Timeout | null>(null);
  const cleanupRef = useRef<(() => void) | null>(null);
  const fullDataRef = useRef<NarrativeGraphData | null>(null);
  const currentIndexRef = useRef(0);

  const reset = useCallback(() => {
    if (streamRef.current) {
      clearTimeout(streamRef.current);
    }
    if (cleanupRef.current) {
      cleanupRef.current();
      cleanupRef.current = null;
    }
    setData({ nodes: [], edges: [] });
    setIsStreaming(false);
    setIsLoading(false);
    setProgress(0);
    setError(null);
    currentIndexRef.current = 0;
    fullDataRef.current = null;
  }, []);

  const stopStream = useCallback(() => {
    if (streamRef.current) {
      clearTimeout(streamRef.current);
    }
    if (cleanupRef.current) {
      cleanupRef.current();
      cleanupRef.current = null;
    }
    setIsStreaming(false);
  }, []);

  const processNextItem = useCallback(() => {
    if (!fullDataRef.current) return;

    const fullData = fullDataRef.current;
    const currentIndex = currentIndexRef.current;

    if (currentIndex >= fullData.nodes.length) {
      setIsStreaming(false);
      onComplete?.();
      return;
    }

    // Add the next node
    const newNode = fullData.nodes[currentIndex];

    setData((prev) => {
      // Find edges that connect to this new node from existing nodes
      const newEdges = fullData.edges.filter(
        (edge) =>
          (edge.target === newNode.id &&
            prev.nodes.some((n) => n.id === edge.source)) ||
          (edge.source === newNode.id &&
            prev.nodes.some((n) => n.id === edge.target))
      );

      // Notify callbacks
      onNodeAdded?.(newNode);
      newEdges.forEach((edge) => onEdgeAdded?.(edge));

      return {
        nodes: [...prev.nodes, newNode],
        edges: [...prev.edges, ...newEdges],
      };
    });

    setProgress(((currentIndex + 1) / fullData.nodes.length) * 100);
    currentIndexRef.current += 1;

    // Schedule next item
    streamRef.current = setTimeout(processNextItem, streamDelay);
  }, [streamDelay, onNodeAdded, onEdgeAdded, onComplete]);

  // Start streaming from local demo data
  const startStream = useCallback(
    (fullData: NarrativeGraphData) => {
      reset();
      fullDataRef.current = fullData;
      setIsStreaming(true);

      // Start processing after a small delay
      streamRef.current = setTimeout(processNextItem, streamDelay);
    },
    [reset, processNextItem, streamDelay]
  );

  // Start live streaming from backend SSE endpoint
  const startLiveStream = useCallback(
    (topic: string) => {
      reset();
      setIsStreaming(true);
      setIsLoading(true);
      setError(null);

      const cleanup = streamNarrativeGraph(
        topic,
        // On node received
        ({ node, edges, progress: p }) => {
          setIsLoading(false);
          setData((prev) => ({
            nodes: [...prev.nodes, node as NarrativeNode],
            edges: [...prev.edges, ...edges.map(e => ({ ...e, animated: false } as NarrativeEdge))],
          }));
          setProgress(p);
          onNodeAdded?.(node as NarrativeNode);
          edges.forEach((edge) => onEdgeAdded?.(edge as NarrativeEdge));
        },
        // On complete
        () => {
          setIsStreaming(false);
          setIsLoading(false);
          onComplete?.();
        },
        // On error
        (errorMsg) => {
          setIsStreaming(false);
          setIsLoading(false);
          setError(errorMsg);
          onError?.(errorMsg);
        }
      );

      cleanupRef.current = cleanup;
    },
    [reset, onNodeAdded, onEdgeAdded, onComplete, onError]
  );

  // Fetch full graph at once (non-streaming)
  const fetchGraph = useCallback(
    async (topic: string) => {
      reset();
      setIsLoading(true);
      setError(null);

      try {
        const response = await getNarrativeGraph(topic);
        setData({
          nodes: response.nodes as NarrativeNode[],
          edges: response.edges.map(e => ({ ...e, animated: false } as NarrativeEdge)),
        });
        setProgress(100);
        onComplete?.();
      } catch (err) {
        const errorMsg = err instanceof Error ? err.message : "Failed to fetch graph";
        setError(errorMsg);
        onError?.(errorMsg);
      } finally {
        setIsLoading(false);
      }
    },
    [reset, onComplete, onError]
  );

  return {
    data,
    isStreaming,
    isLoading,
    progress,
    error,
    startStream,
    startLiveStream,
    fetchGraph,
    stopStream,
    reset,
  };
}

// Sample data for testing - this matches your LLM output format
export const sampleNarrativeData: NarrativeGraphData = {
  nodes: [
    {
      id: "unveils_lord_ram_statue_goa",
      label: "PM Modi Unveils 77-Foot Lord Ram Statue in Goa, Launches Theme Park",
      type: "ROOT_INCIDENT",
      data: {
        summary:
          "Prime Minister Narendra Modi unveiled a 77-foot bronze statue of Lord Ram at the Shree Samsthan Gokarn Partagali Jeevottam Mutt in Goa during its 550th-year celebrations. He also inaugurated the Ramayana Theme Park Garden, released a special postal stamp and a commemorative coin, and addressed the gathering.",
      },
    },
    {
      id: "coin_stamp_release",
      label: "Commemorative Coin and Special Postal Stamp Released",
      type: "DEVELOPMENT",
      data: {
        summary:
          "As part of the 550th-year celebration of the Shree Samsthan Gokarn Jeevottam Mutt, Prime Minister Narendra Modi released a commemorative coin and a special postal stamp.",
      },
    },
    {
      id: "pm_modi_addresses_gathering",
      label: "PM Modi Addresses Gathering After Unveiling",
      type: "REACTION",
      data: {
        summary:
          "Following the Lord Ram statue unveiling ceremony, Prime Minister Narendra Modi addressed the gathering at the 550th-year celebration of the Shree Samsthan Gokarn Partagali Jeevottam Mutt in Goa.",
      },
    },
    {
      id: "mutt_tradition_cultural_preservation",
      label: "PM Highlights Mutt's Role in Cultural Preservation",
      type: "DEVELOPMENT",
      data: {
        summary:
          "In his address, PM Modi highlighted the Shree Samsthan Gokarn Partagali Jeevottam Mutt's longstanding role in preserving core cultural values, its commitment to service, and its expansion of services to include education, elderly care, and assistance for families in need.",
      },
    },
    {
      id: "upcoming_museum_3d_theatre",
      label: "PM Announces Upcoming Museum and 3D Theatre at Mutt",
      type: "DEVELOPMENT",
      data: {
        summary:
          "During his speech, Prime Minister Narendra Modi announced plans for an upcoming museum and a modern 3D theatre at the Shree Samsthan Gokarn Partagali Jeevottam Mutt, aimed at preserving its heritage and engaging younger generations.",
      },
    },
    {
      id: "mutt_goal_unite_people",
      label: "PM Stresses Mutt's Goal to Unite People",
      type: "DEVELOPMENT",
      data: {
        summary:
          "PM Modi emphasized that the Shree Samsthan Gokarn Partagali Jeevottam Mutt aims to unite people, connect minds, and bridge tradition with modernity, stating that national progress depends on collective strength.",
      },
    },
    {
      id: "resolutions_viksit_bharat",
      label: "PM Outlines Nine Resolutions for 'Viksit Bharat'",
      type: "OUTCOME",
      data: {
        summary:
          "At the celebration, Prime Minister Narendra Modi presented nine appeals, termed as resolutions, for a 'Viksit Bharat', focusing on environmental protection and responsible habits, including water conservation, tree plantation, cleanliness, promoting Swadeshi, exploring India, natural farming, healthier lifestyles, yoga and sports, and helping the poor.",
      },
    },
  ],
  edges: [
    {
      source: "unveils_lord_ram_statue_goa",
      target: "coin_stamp_release",
      label: "Detailed Component",
      animated: true,
    },
    {
      source: "unveils_lord_ram_statue_goa",
      target: "pm_modi_addresses_gathering",
      label: "Followed by",
      animated: false,
    },
    {
      source: "pm_modi_addresses_gathering",
      target: "mutt_tradition_cultural_preservation",
      label: "Speech Content: Emphasized",
      animated: true,
    },
    {
      source: "pm_modi_addresses_gathering",
      target: "upcoming_museum_3d_theatre",
      label: "Speech Content: Revealed",
      animated: true,
    },
    {
      source: "pm_modi_addresses_gathering",
      target: "mutt_goal_unite_people",
      label: "Speech Content: Highlighted",
      animated: true,
    },
    {
      source: "pm_modi_addresses_gathering",
      target: "resolutions_viksit_bharat",
      label: "Speech Content: Proposed",
      animated: true,
    },
  ],
};

export default useNarrativeStream;
