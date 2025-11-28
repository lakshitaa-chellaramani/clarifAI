import os
from typing import List, Dict, Optional
from datetime import datetime

from app.config import settings

# Set environment variables for Neo4j
os.environ["NEO4J_URI"] = settings.NEO4J_URI
os.environ["NEO4J_USERNAME"] = settings.NEO4J_USERNAME
os.environ["NEO4J_PASSWORD"] = settings.NEO4J_PASSWORD

# Try to import Neo4j, but don't fail if unavailable
try:
    from langchain_neo4j import Neo4jGraph
    NEO4J_AVAILABLE = True
except ImportError:
    NEO4J_AVAILABLE = False
    Neo4jGraph = None


class GraphService:
    """Service for Neo4j knowledge graph operations"""

    def __init__(self):
        self._graph = None
        self._neo4j_connected = False

    @property
    def graph(self):
        """Lazy initialization of Neo4j connection"""
        if not NEO4J_AVAILABLE:
            return None
        if self._graph is None:
            try:
                self._graph = Neo4jGraph()
                self._neo4j_connected = True
            except Exception as e:
                print(f"Error connecting to Neo4j: {e}")
                self._neo4j_connected = False
                return None
        return self._graph

    def _get_mock_graph_data(self, topic: str = "Breaking News Event") -> Dict:
        """Return mock graph data when Neo4j is unavailable"""
        return {
            "topic": topic,
            "graph_type": "Directed Acyclic Graph (DAG)",
            "description": f"A timeline representation of events related to {topic}",
            "nodes": [
                {"id": 1, "label": "Initial Report Emerges", "timestamp": "2025-11-26T08:00:00Z", "incident_year": "2025"},
                {"id": 2, "label": "Officials Confirm Incident", "timestamp": "2025-11-26T09:30:00Z", "incident_year": "2025"},
                {"id": 3, "label": "Emergency Response Deployed", "timestamp": "2025-11-26T10:00:00Z", "incident_year": "2025"},
                {"id": 4, "label": "Press Conference Held", "timestamp": "2025-11-26T12:00:00Z", "incident_year": "2025"},
                {"id": 5, "label": "Updates from Ground Zero", "timestamp": "2025-11-26T14:00:00Z", "incident_year": "2025"},
                {"id": 6, "label": "Investigation Launched", "timestamp": "2025-11-26T16:00:00Z", "incident_year": "2025"},
                {"id": 7, "label": "Preliminary Findings Released", "timestamp": "2025-11-26T18:00:00Z", "incident_year": "2025"},
                {"id": 8, "label": "Government Response Announced", "timestamp": "2025-11-26T20:00:00Z", "incident_year": "2025"},
            ],
            "edges": [
                {"source": 1, "target": 2, "relationship": "CHRONOLOGICAL"},
                {"source": 2, "target": 3, "relationship": "TRIGGERS_RESPONSE"},
                {"source": 2, "target": 4, "relationship": "LEADS_TO"},
                {"source": 3, "target": 5, "relationship": "CHRONOLOGICAL"},
                {"source": 4, "target": 6, "relationship": "ANNOUNCES"},
                {"source": 5, "target": 7, "relationship": "INFORMS"},
                {"source": 6, "target": 7, "relationship": "PRODUCES"},
                {"source": 7, "target": 8, "relationship": "PROMPTS"},
            ]
        }

    def get_graph_stats(self) -> Dict:
        """Get basic statistics about the knowledge graph"""
        # Return mock stats if Neo4j unavailable
        if self.graph is None:
            return {"entities": 12, "events": 8, "claims": 15, "sources": 6, "total_nodes": 41, "mock": True}

        try:
            counts = self.graph.query(
                "MATCH (n) RETURN labels(n) as label, count(*) as count"
            )

            stats = {
                "entities": 0,
                "events": 0,
                "claims": 0,
                "sources": 0,
                "total_nodes": 0
            }

            for item in counts:
                label = item.get("label", [])
                count = item.get("count", 0)
                stats["total_nodes"] += count

                if "Entity" in label:
                    stats["entities"] = count
                elif "Event" in label:
                    stats["events"] = count
                elif "Claim" in label:
                    stats["claims"] = count
                elif "Source" in label:
                    stats["sources"] = count

            return stats
        except Exception as e:
            print(f"Error getting graph stats: {e}")
            return {"entities": 12, "events": 8, "claims": 15, "sources": 6, "total_nodes": 41, "mock": True}

    def get_recent_events(self, limit: int = 20) -> List[Dict]:
        """Get recent events from the graph"""
        # Return mock events if Neo4j unavailable
        if self.graph is None:
            return [
                {"id": "evt-1", "title": "Breaking: Major Event Reported", "timestamp": "2025-11-26T14:00:00Z", "description": "Initial reports emerging", "location": "Unknown", "entities": ["Official A"], "sources": ["news.com"]},
                {"id": "evt-2", "title": "Officials Respond to Situation", "timestamp": "2025-11-26T15:00:00Z", "description": "Government response announced", "location": "Capital", "entities": ["Official B"], "sources": ["gov.org"]},
                {"id": "evt-3", "title": "Updates from the Scene", "timestamp": "2025-11-26T16:00:00Z", "description": "Latest developments", "location": "Scene", "entities": ["Reporter"], "sources": ["local.news"]},
            ][:limit]

        try:
            query = """
            MATCH (e:Event)
            OPTIONAL MATCH (e)<-[:PARTICIPATED_IN]-(p:Entity)
            OPTIONAL MATCH (e)<-[:REPORTED]-(s:Source)
            RETURN
                e.id as id,
                e.title as title,
                toString(e.timestamp) as timestamp,
                e.description as description,
                e.location as location,
                collect(distinct p.name) as entities,
                collect(distinct s.url) as sources
            ORDER BY e.timestamp DESC
            LIMIT $limit
            """
            return self.graph.query(query, {"limit": limit})
        except Exception as e:
            print(f"Error getting events: {e}")
            return []

    def get_claims(self, limit: int = 20) -> List[Dict]:
        """Get claims from the graph"""
        # Return mock claims if Neo4j unavailable
        if self.graph is None:
            return [
                {"text": "Initial reports indicate significant impact", "sentiment": "neutral", "evidence_quote": "Sources confirm...", "source_url": "news.com"},
                {"text": "Officials working to address the situation", "sentiment": "positive", "evidence_quote": "We are taking action...", "source_url": "gov.org"},
                {"text": "Community response has been swift", "sentiment": "positive", "evidence_quote": "Volunteers arrived...", "source_url": "local.news"},
            ][:limit]

        try:
            query = """
            MATCH (c:Claim)
            OPTIONAL MATCH (c)<-[:MAKES_CLAIM]-(s:Source)
            RETURN
                c.text as text,
                c.sentiment as sentiment,
                c.quote as evidence_quote,
                s.url as source_url
            LIMIT $limit
            """
            return self.graph.query(query, {"limit": limit})
        except Exception as e:
            print(f"Error getting claims: {e}")
            return []

    def get_sources_with_trust(self) -> List[Dict]:
        """Get all sources with their trust scores"""
        # Return mock sources if Neo4j unavailable
        if self.graph is None:
            return [
                {"id": "reuters.com", "name": "Reuters", "domain": "reuters.com", "trust_score": 92, "change": 2, "verified_claims": 45, "contradictions": 1},
                {"id": "apnews.com", "name": "AP News", "domain": "apnews.com", "trust_score": 90, "change": 1, "verified_claims": 38, "contradictions": 2},
                {"id": "bbc.com", "name": "BBC", "domain": "bbc.com", "trust_score": 88, "change": 0, "verified_claims": 42, "contradictions": 3},
                {"id": "cnn.com", "name": "CNN", "domain": "cnn.com", "trust_score": 75, "change": -1, "verified_claims": 30, "contradictions": 5},
                {"id": "foxnews.com", "name": "Fox News", "domain": "foxnews.com", "trust_score": 72, "change": -2, "verified_claims": 25, "contradictions": 8},
            ]

        try:
            query = """
            MATCH (s:Source)
            RETURN
                s.domain as domain,
                s.url as url,
                coalesce(s.trust_score, 50) as trust_score
            ORDER BY s.trust_score DESC
            """
            results = self.graph.query(query)

            # Map to our format
            sources = []
            for r in results:
                domain = r.get("domain") or r.get("url", "unknown")
                # Extract domain name for display
                name = domain.replace("https://", "").replace("http://", "").split("/")[0]
                name = name.replace("www.", "").split(".")[0].title()

                sources.append({
                    "id": domain,
                    "name": name if name else "Unknown",
                    "domain": domain,
                    "trust_score": int(r.get("trust_score", 50)),
                    "change": 0,
                    "verified_claims": 0,
                    "contradictions": 0
                })

            return sources
        except Exception as e:
            print(f"Error getting sources: {e}")
            return []

    def get_knowledge_graph_data(self, topic_keywords: Optional[List[str]] = None, limit: int = 50) -> Dict:
        """
        Get nodes and edges for visualization
        """
        # Return mock graph data if Neo4j unavailable
        if self.graph is None:
            topic = " ".join(topic_keywords) if topic_keywords else "Breaking News Event"
            return self._get_mock_graph_data(topic)

        try:
            if topic_keywords:
                # Filter by keywords
                filters = [
                    f"toLower(e.title) CONTAINS toLower('{k}') OR toLower(e.description) CONTAINS toLower('{k}')"
                    for k in topic_keywords
                ]
                where_clause = " OR ".join(filters)
                query = f"""
                MATCH (e:Event)
                WHERE {where_clause}
                WITH e LIMIT {limit}
                OPTIONAL MATCH (e)<-[:PARTICIPATED_IN]-(p:Entity)
                OPTIONAL MATCH (e)<-[:REPORTED]-(s:Source)
                OPTIONAL MATCH (e)<-[:MAKES_CLAIM]-(c:Claim)
                RETURN
                    collect(distinct {{id: e.id, label: e.title, type: 'event'}}) as events,
                    collect(distinct {{id: p.name, label: p.name, type: 'entity'}}) as entities,
                    collect(distinct {{id: s.url, label: s.domain, type: 'source'}}) as sources,
                    collect(distinct {{id: c.text, label: substring(c.text, 0, 50), type: 'claim'}}) as claims
                """
            else:
                query = f"""
                MATCH (e:Event)
                WITH e ORDER BY e.timestamp DESC LIMIT {limit}
                OPTIONAL MATCH (e)<-[:PARTICIPATED_IN]-(p:Entity)
                OPTIONAL MATCH (e)<-[:REPORTED]-(s:Source)
                RETURN
                    collect(distinct {{id: e.id, label: e.title, type: 'event'}}) as events,
                    collect(distinct {{id: p.name, label: p.name, type: 'entity'}}) as entities,
                    collect(distinct {{id: s.url, label: s.domain, type: 'source'}}) as sources
                """

            result = self.graph.query(query)

            if not result:
                return {"nodes": [], "edges": []}

            # Flatten nodes
            nodes = []
            node_ids = set()

            for r in result:
                for event in r.get("events", []):
                    if event and event.get("id") and event["id"] not in node_ids:
                        nodes.append(event)
                        node_ids.add(event["id"])

                for entity in r.get("entities", []):
                    if entity and entity.get("id") and entity["id"] not in node_ids:
                        nodes.append(entity)
                        node_ids.add(entity["id"])

                for source in r.get("sources", []):
                    if source and source.get("id") and source["id"] not in node_ids:
                        nodes.append(source)
                        node_ids.add(source["id"])

                for claim in r.get("claims", []):
                    if claim and claim.get("id") and claim["id"] not in node_ids:
                        nodes.append(claim)
                        node_ids.add(claim["id"])

            # Get edges
            edges_query = """
            MATCH (a)-[r]->(b)
            WHERE a.id IN $node_ids OR a.name IN $node_ids OR a.url IN $node_ids
            RETURN
                coalesce(a.id, a.name, a.url) as source,
                coalesce(b.id, b.name, b.url) as target,
                type(r) as relationship
            LIMIT 200
            """

            edges_result = self.graph.query(edges_query, {"node_ids": list(node_ids)})
            edges = [
                {
                    "source": e["source"],
                    "target": e["target"],
                    "relationship": e["relationship"]
                }
                for e in edges_result if e.get("source") and e.get("target")
            ]

            return {"nodes": nodes, "edges": edges}

        except Exception as e:
            print(f"Error getting graph data: {e}")
            topic = " ".join(topic_keywords) if topic_keywords else "Breaking News Event"
            return self._get_mock_graph_data(topic)

    def calculate_source_trust(self) -> List[Dict]:
        """
        Calculate trust scores for sources based on verification consensus
        """
        # Return mock sources if Neo4j unavailable
        if self.graph is None:
            return self.get_sources_with_trust()

        try:
            # Ensure Source nodes exist
            self.graph.query("""
                MATCH ()-[r]->()
                WHERE r.source_domain IS NOT NULL
                MERGE (src:Source {domain: r.source_domain})
            """)

            # Consensus: reward sources that agree
            self.graph.query("""
                MATCH (s:Entity)-[r]->(o:Entity)
                WITH s, type(r) as predicate, o, count(DISTINCT r.source_domain) as corroboration, collect(DISTINCT r.source_domain) as sources
                WHERE corroboration >= 2
                UNWIND sources as reliable_source
                MATCH (src:Source {domain: reliable_source})
                SET src.trust_score = coalesce(src.trust_score, 50) + 1
            """)

            # Penalty: penalize outliers
            self.graph.query("""
                MATCH (s:Entity)-[r]->(o_bad:Entity)
                WITH s, type(r) as predicate, r.source_domain as outlier_source, o_bad
                MATCH (s)-[r2]->(o_verified:Entity)
                WHERE type(r2) = predicate AND o_bad <> o_verified AND r2.confidence > 0.8
                MATCH (src:Source {domain: outlier_source})
                SET src.trust_score = coalesce(src.trust_score, 50) - 2
            """)

            return self.get_sources_with_trust()

        except Exception as e:
            print(f"Error calculating trust: {e}")
            return self.get_sources_with_trust()


# Singleton instance
graph_service = GraphService()
