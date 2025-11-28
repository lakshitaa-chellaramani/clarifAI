from pydantic import BaseModel, Field
from typing import List, Optional
from datetime import datetime
from enum import Enum


class ClaimStatus(str, Enum):
    VERIFIED = "verified"
    CONFLICT = "conflict"
    FALSE = "false"
    CHECKING = "checking"


class RiskLevel(str, Enum):
    HIGH = "high"
    MEDIUM = "medium"
    LOW = "low"


# --- Topic Models ---
class TopicAnalysis(BaseModel):
    id: str
    title: str = Field(..., description="A neutral, factual title of the event")
    risk_score: int = Field(..., ge=1, le=10, description="1-10 risk score")
    reasoning: str = Field(..., description="Why is this high risk?")
    source_count: int = 0
    claim_count: int = 0
    is_new: bool = False
    first_detected: Optional[datetime] = None
    web_search_query: Optional[str] = None


class TopicListResponse(BaseModel):
    topics: List[TopicAnalysis]
    total: int


# --- Source Models ---
class Source(BaseModel):
    id: str
    name: str
    domain: str
    trust_score: int = Field(..., ge=0, le=100)
    change: int = 0  # Change from previous score
    verified_claims: int = 0
    contradictions: int = 0


class SourceListResponse(BaseModel):
    sources: List[Source]
    total: int


# --- Claim Models ---
class Claim(BaseModel):
    id: str
    text: str
    source: str
    source_domain: Optional[str] = None
    timestamp: datetime
    status: ClaimStatus
    confidence: Optional[int] = None
    evidence_quote: Optional[str] = None


class ClaimListResponse(BaseModel):
    claims: List[Claim]
    total: int


# --- Event Models ---
class Entity(BaseModel):
    name: str
    type: str  # PERSON, ORG, LOC, CONCEPT
    role: str
    mentions: int = 0


class TimelineEvent(BaseModel):
    id: str
    timestamp: datetime
    title: str
    description: str
    location: Optional[str] = None
    sources: int
    confidence: int
    status: ClaimStatus
    entities: List[Entity] = []
    conflict: Optional[dict] = None  # For conflicting claims


class TopicDetailResponse(BaseModel):
    topic: TopicAnalysis
    timeline: List[TimelineEvent]
    entities: List[Entity]
    claims: List[Claim]


# --- Graph Models ---
class GraphNode(BaseModel):
    id: str
    label: str
    type: str  # event, entity, claim, source


class GraphEdge(BaseModel):
    source: str
    target: str
    relationship: str


class KnowledgeGraphResponse(BaseModel):
    nodes: List[GraphNode]
    edges: List[GraphEdge]
    topic: Optional[str] = None


# --- Narrative/Anchor Models ---
class NarrativeScene(BaseModel):
    sequence_id: int
    timestamp: str
    location: Optional[str] = None
    headline: str
    visual_description: str
    entities_present: List[str] = []
    action_log: str
    conflicting_claims: Optional[str] = None


class CinematicReport(BaseModel):
    topic: str
    narrative_arc: List[NarrativeScene]


class AnchorScript(BaseModel):
    text: str
    mood: str = "neutral"
    view: str = "upper"
    gesture: Optional[str] = None
    voice: str = "af_bella"
    speed: float = 1.0
    delay: int = 800


class AnchorBroadcast(BaseModel):
    topic: str
    segments: List[AnchorScript]
    sources_cited: List[str]
    generated_at: datetime


# --- Stats Models ---
class SystemStats(BaseModel):
    claims_analyzed: int
    accuracy_rate: int
    sources_tracked: int
    misinfo_detected: int
    topics_active: int


# --- API Response Wrapper ---
class APIResponse(BaseModel):
    success: bool
    data: Optional[dict] = None
    error: Optional[str] = None
