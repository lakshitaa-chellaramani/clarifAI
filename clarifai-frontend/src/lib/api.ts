/**
 * API client for ClarifAI backend
 */

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

async function fetchAPI<T>(endpoint: string, options?: RequestInit): Promise<T> {
  const url = `${API_BASE_URL}${endpoint}`;

  const response = await fetch(url, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...options?.headers,
    },
  });

  if (!response.ok) {
    throw new Error(`API Error: ${response.status} ${response.statusText}`);
  }

  return response.json();
}

// --- Topics API ---
export interface Topic {
  id: string;
  title: string;
  risk_score: number;
  reasoning: string;
  source_count: number;
  claim_count: number;
  is_new: boolean;
  first_detected?: string;
  web_search_query?: string;
}

export interface TopicsResponse {
  topics: Topic[];
  total: number;
  last_updated?: string;
}

export async function getTopics(refresh = false): Promise<TopicsResponse> {
  return fetchAPI<TopicsResponse>(`/topics?refresh=${refresh}`);
}

export async function getTopicDetail(topicId: string) {
  return fetchAPI(`/topics/${topicId}`);
}

export async function analyzeTopics() {
  return fetchAPI("/topics/analyze", { method: "POST" });
}

// --- Sources API ---
export interface Source {
  id: string;
  name: string;
  domain: string;
  trust_score: number;
  change: number;
  verified_claims: number;
  contradictions: number;
}

export interface SourcesResponse {
  sources: Source[];
  total: number;
}

export async function getSources(): Promise<SourcesResponse> {
  return fetchAPI<SourcesResponse>("/sources");
}

// --- Claims API ---
export interface Claim {
  id: string;
  text: string;
  source: string;
  timestamp: string;
  status: "verified" | "conflict" | "false" | "checking";
  confidence?: number;
}

export interface ClaimsResponse {
  claims: Claim[];
  total: number;
}

export async function getClaims(topic?: string, limit = 20): Promise<ClaimsResponse> {
  const params = new URLSearchParams();
  if (topic) params.append("topic", topic);
  params.append("limit", limit.toString());

  return fetchAPI<ClaimsResponse>(`/claims?${params}`);
}

export async function verifyClaim(claim: string, topic?: string) {
  return fetchAPI("/claims/verify", {
    method: "POST",
    body: JSON.stringify({ claim, topic }),
  });
}

// --- Graph API ---
export interface GraphNode {
  id: string;
  label: string;
  type: "event" | "entity" | "claim" | "source";
}

export interface GraphEdge {
  source: string;
  target: string;
  relationship: string;
}

export interface GraphResponse {
  nodes: GraphNode[];
  edges: GraphEdge[];
  topic?: string;
  total_nodes: number;
  total_edges: number;
}

export async function getGraphNodes(topic?: string, limit = 50): Promise<GraphResponse> {
  const params = new URLSearchParams();
  if (topic) params.append("topic", topic);
  params.append("limit", limit.toString());

  return fetchAPI<GraphResponse>(`/graph/nodes?${params}`);
}

export async function getGraphStats() {
  return fetchAPI("/graph/stats");
}

// --- Anchor API ---
export interface AnchorSegment {
  text: string;
  mood: string;
  view: string;
  gesture?: string;
  voice: string;
  speed: number;
  delay: number;
}

export interface AnchorScript {
  topic: string;
  segments: AnchorSegment[];
  sources_cited: string[];
  generated_at: string;
}

export async function generateAnchorScript(
  topic: string,
  tone = "professional",
  duration = "short"
): Promise<AnchorScript> {
  return fetchAPI<AnchorScript>("/anchor/generate", {
    method: "POST",
    body: JSON.stringify({ topic, tone, duration }),
  });
}

export async function getAnchorPreview(topic: string) {
  return fetchAPI(`/anchor/preview?topic=${encodeURIComponent(topic)}`);
}

// --- Stats API ---
export interface SystemStats {
  claims_analyzed: number;
  accuracy_rate: number;
  sources_tracked: number;
  misinfo_detected: number;
  topics_active: number;
}

export async function getSystemStats(): Promise<SystemStats> {
  return fetchAPI<SystemStats>("/stats");
}

// --- Health Check ---
export async function healthCheck() {
  return fetchAPI("/health");
}
