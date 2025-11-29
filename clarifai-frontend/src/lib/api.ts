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

// --- Narrative Graph API ---
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
}

export interface NarrativeGraphResponse {
  topic: string;
  nodes: NarrativeNode[];
  edges: NarrativeEdge[];
}

export async function getNarrativeGraph(topic: string): Promise<NarrativeGraphResponse> {
  return fetchAPI<NarrativeGraphResponse>(`/graph/narrative?topic=${encodeURIComponent(topic)}`);
}

export function streamNarrativeGraph(
  topic: string,
  onNode: (data: { node: NarrativeNode; edges: NarrativeEdge[]; progress: number }) => void,
  onComplete: (data: { total_nodes: number; total_edges: number }) => void,
  onError: (error: string) => void
): () => void {
  const url = `${API_BASE_URL}/graph/narrative/stream?topic=${encodeURIComponent(topic)}`;
  const eventSource = new EventSource(url);

  eventSource.onmessage = (event) => {
    try {
      const data = JSON.parse(event.data);

      if (data.type === "node") {
        onNode({
          node: data.node,
          edges: data.edges || [],
          progress: data.progress
        });
      } else if (data.type === "complete") {
        onComplete({
          total_nodes: data.total_nodes,
          total_edges: data.total_edges
        });
        eventSource.close();
      } else if (data.type === "error") {
        onError(data.message);
        eventSource.close();
      }
    } catch (e) {
      console.error("Error parsing SSE data:", e);
    }
  };

  eventSource.onerror = () => {
    onError("Connection error");
    eventSource.close();
  };

  // Return cleanup function
  return () => eventSource.close();
}

// --- Research API ---
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

export interface ResearchSource {
  title: string;
  url: string;
  publisher?: string;
  date?: string;
}

export interface ResearchGraphResponse {
  topic: string;
  query: string;
  summary: string;
  nodes: ResearchNode[];
  edges: ResearchEdge[];
  sources: ResearchSource[];
  methodology?: string;
  generated_at: string;
  depth: string;
}

export interface ResearchReportResponse {
  report: string;
  research_data: ResearchGraphResponse;
}

export async function getResearchGraph(
  query: string,
  depth: string = "comprehensive"
): Promise<ResearchGraphResponse> {
  return fetchAPI<ResearchGraphResponse>(
    `/research/analyze?query=${encodeURIComponent(query)}&depth=${depth}`
  );
}

export async function generateResearchReport(
  query: string,
  depth: string = "comprehensive"
): Promise<ResearchReportResponse> {
  return fetchAPI<ResearchReportResponse>("/research/report", {
    method: "POST",
    body: JSON.stringify({ query, depth }),
  });
}

export function streamResearchGraph(
  query: string,
  depth: string,
  onMetadata: (data: { topic: string; summary: string; total_nodes: number; total_edges: number }) => void,
  onNode: (data: { node: ResearchNode; edges: ResearchEdge[]; progress: number }) => void,
  onSources: (sources: ResearchSource[]) => void,
  onComplete: (data: { total_nodes: number; total_edges: number; methodology: string }) => void,
  onError: (error: string) => void
): () => void {
  const url = `${API_BASE_URL}/research/analyze/stream?query=${encodeURIComponent(query)}&depth=${depth}`;
  const eventSource = new EventSource(url);

  eventSource.onmessage = (event) => {
    try {
      const data = JSON.parse(event.data);

      if (data.type === "metadata") {
        onMetadata({
          topic: data.topic,
          summary: data.summary,
          total_nodes: data.total_nodes,
          total_edges: data.total_edges
        });
      } else if (data.type === "node") {
        onNode({
          node: data.node,
          edges: data.edges || [],
          progress: data.progress
        });
      } else if (data.type === "sources") {
        onSources(data.sources || []);
      } else if (data.type === "complete") {
        onComplete({
          total_nodes: data.total_nodes,
          total_edges: data.total_edges,
          methodology: data.methodology || ""
        });
        eventSource.close();
      } else if (data.type === "error") {
        onError(data.message);
        eventSource.close();
      }
    } catch (e) {
      console.error("Error parsing SSE data:", e);
    }
  };

  eventSource.onerror = () => {
    onError("Connection error");
    eventSource.close();
  };

  return () => eventSource.close();
}

export function getResearchReportDownloadUrl(query: string, depth: string = "comprehensive"): string {
  return `${API_BASE_URL}/research/report/download?query=${encodeURIComponent(query)}&depth=${depth}`;
}

// --- Daily News API ---
export interface DailyNewsItem {
  id: string;
  title: string;
  summary: string;
  source: string;
  source_url: string;
  category: string;
  published_at: string;
  thumbnail_gradient: string;
  video_duration: number;
  views: number;
  is_breaking: boolean;
  risk_score: number;
}

export interface DailyNewsResponse {
  news: DailyNewsItem[];
  total: number;
  generated_at: string;
}

export async function getDailyNews(limit = 20, category?: string): Promise<DailyNewsResponse> {
  const params = new URLSearchParams();
  params.append("limit", limit.toString());
  if (category) params.append("category", category);

  return fetchAPI<DailyNewsResponse>(`/daily?${params}`);
}

export async function getDailyCategories(): Promise<{ categories: string[]; total: number }> {
  return fetchAPI("/daily/categories");
}

// --- Education API ---
export interface Flashcard {
  id: string;
  front: string;
  back: string;
  category: string;
  difficulty: number;
  source: string;
  fact_checked: boolean;
  explanation?: string;
  tags: string[];
}

export interface FlashcardSource {
  title: string;
  url: string;
  reliability: "HIGH" | "MEDIUM" | "LOW";
}

export interface FlashcardDeckResponse {
  deck_id: string;
  topic: string;
  description: string;
  difficulty_level: string;
  total_cards: number;
  flashcards: Flashcard[];
  sources: FlashcardSource[];
  study_tips: string[];
  generated_at: string;
}

export interface KeyConcept {
  concept: string;
  explanation: string;
  importance: string;
}

export interface StudySection {
  title: string;
  content: string;
  key_points: string[];
  examples: string[];
}

export interface GlossaryItem {
  term: string;
  definition: string;
}

export interface Misconception {
  misconception: string;
  correction: string;
}

export interface PracticeQuestion {
  question: string;
  answer: string;
  difficulty: "easy" | "medium" | "hard";
}

export interface StudyResource {
  title: string;
  type: string;
  description: string;
}

export interface StudyGuideResponse {
  guide_id: string;
  title: string;
  topic: string;
  overview: string;
  key_concepts: KeyConcept[];
  sections: StudySection[];
  glossary: GlossaryItem[];
  misconceptions: Misconception[];
  practice_questions: PracticeQuestion[];
  study_strategies: string[];
  resources: StudyResource[];
  generated_at: string;
}

export interface CompletePackageResponse {
  flashcards: FlashcardDeckResponse;
  study_guide: StudyGuideResponse;
  markdown_export: string;
  topic: string;
}

export async function generateFlashcards(
  topic: string,
  numCards: number = 10,
  difficulty: string = "intermediate"
): Promise<FlashcardDeckResponse> {
  return fetchAPI<FlashcardDeckResponse>("/education/flashcards/generate", {
    method: "POST",
    body: JSON.stringify({ topic, num_cards: numCards, difficulty }),
  });
}

export async function generateStudyGuide(
  topic: string,
  flashcards?: Flashcard[],
  includeSummary: boolean = true
): Promise<StudyGuideResponse> {
  return fetchAPI<StudyGuideResponse>("/education/study-guide/generate", {
    method: "POST",
    body: JSON.stringify({
      topic,
      flashcards: flashcards || [],
      include_summary: includeSummary,
    }),
  });
}

export async function generateCompletePackage(
  topic: string,
  numCards: number = 10,
  difficulty: string = "intermediate"
): Promise<CompletePackageResponse> {
  return fetchAPI<CompletePackageResponse>("/education/complete-package", {
    method: "POST",
    body: JSON.stringify({ topic, num_cards: numCards, difficulty }),
  });
}

export async function exportStudyGuide(
  topic: string,
  guideData: StudyGuideResponse,
  flashcards?: Flashcard[]
): Promise<{ markdown: string; topic: string }> {
  return fetchAPI("/education/study-guide/export", {
    method: "POST",
    body: JSON.stringify({
      topic,
      guide_data: guideData,
      flashcards: flashcards || [],
    }),
  });
}

export function getStudyGuideDownloadUrl(topic: string): string {
  return `${API_BASE_URL}/education/study-guide/download?topic=${encodeURIComponent(topic)}`;
}

export function streamFlashcardGeneration(
  topic: string,
  numCards: number,
  difficulty: string,
  onMetadata: (data: {
    topic: string;
    description: string;
    total_cards: number;
    difficulty: string;
    deck_id: string;
  }) => void,
  onFlashcard: (data: { card: Flashcard; progress: number; index: number }) => void,
  onTips: (tips: string[]) => void,
  onSources: (sources: FlashcardSource[]) => void,
  onComplete: (data: { total_cards: number; deck_id: string }) => void,
  onError: (error: string) => void
): () => void {
  const url = `${API_BASE_URL}/education/flashcards/stream?topic=${encodeURIComponent(
    topic
  )}&num_cards=${numCards}&difficulty=${difficulty}`;
  const eventSource = new EventSource(url);

  eventSource.onmessage = (event) => {
    try {
      const data = JSON.parse(event.data);

      if (data.type === "metadata") {
        onMetadata({
          topic: data.topic,
          description: data.description,
          total_cards: data.total_cards,
          difficulty: data.difficulty,
          deck_id: data.deck_id,
        });
      } else if (data.type === "flashcard") {
        onFlashcard({
          card: data.card,
          progress: data.progress,
          index: data.index,
        });
      } else if (data.type === "tips") {
        onTips(data.tips || []);
      } else if (data.type === "sources") {
        onSources(data.sources || []);
      } else if (data.type === "complete") {
        onComplete({
          total_cards: data.total_cards,
          deck_id: data.deck_id,
        });
        eventSource.close();
      } else if (data.type === "error") {
        onError(data.message);
        eventSource.close();
      }
    } catch (e) {
      console.error("Error parsing SSE data:", e);
    }
  };

  eventSource.onerror = () => {
    onError("Connection error");
    eventSource.close();
  };

  return () => eventSource.close();
}
