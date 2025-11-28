"use client";

import { useState } from "react";
import Link from "next/link";
import {
  Search,
  Loader2,
  ArrowRight,
  Clock,
  TrendingUp,
  Sparkles,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { KnowledgeGraph } from "@/components/dashboard/knowledge-graph";
import { cn } from "@/lib/utils";
import { demoGraphNodes, demoGraphEdges } from "@/data/demo-data";

// Recent searches (would come from API/localStorage)
const recentSearches = [
  { query: "Karnataka political crisis", timestamp: "2 hours ago", results: 34 },
  { query: "Hong Kong fire investigation", timestamp: "5 hours ago", results: 21 },
  { query: "Tech layoffs 2025", timestamp: "1 day ago", results: 48 },
];

// Trending topics
const trendingTopics = [
  "Climate change summit",
  "AI regulation",
  "Economic forecast",
  "Election misinformation",
  "Health guidelines update",
];

export default function SearchPage() {
  const [query, setQuery] = useState("");
  const [isSearching, setIsSearching] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);
  const [searchResults, setSearchResults] = useState<any>(null);

  const handleSearch = async () => {
    if (!query.trim()) return;

    setIsSearching(true);
    setHasSearched(true);

    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 1500));

    setSearchResults({
      query,
      totalResults: 28,
      claims: [
        {
          id: "1",
          text: `Analysis of "${query}" reveals multiple perspectives across sources.`,
          status: "verified",
          confidence: 87,
        },
        {
          id: "2",
          text: `Some sources report conflicting information about ${query}.`,
          status: "conflict",
          confidence: 65,
        },
        {
          id: "3",
          text: `Fact-checkers have debunked certain claims related to ${query}.`,
          status: "false",
          confidence: 92,
        },
      ],
      sources: 12,
      lastUpdated: new Date().toISOString(),
    });

    setIsSearching(false);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      handleSearch();
    }
  };

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Page Header */}
      <div>
        <h1 className="text-2xl font-semibold text-foreground">Search</h1>
        <p className="text-muted-foreground mt-1">
          Search any topic for fact-checking and analysis
        </p>
      </div>

      {/* Search Input */}
      <div className="relative max-w-2xl">
        <div className="relative">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
          <input
            type="text"
            placeholder="Enter a topic, claim, or question..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyPress={handleKeyPress}
            className="w-full h-14 pl-12 pr-32 rounded-xl border border-border bg-background text-foreground text-lg placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent shadow-soft"
          />
          <Button
            onClick={handleSearch}
            disabled={isSearching || !query.trim()}
            className="absolute right-2 top-1/2 -translate-y-1/2"
          >
            {isSearching ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Analyzing...
              </>
            ) : (
              <>
                <Sparkles className="h-4 w-4 mr-2" />
                Analyze
              </>
            )}
          </Button>
        </div>
        <p className="text-xs text-muted-foreground mt-2 ml-1">
          Our AI will search, fact-check, and generate a knowledge graph for your query
        </p>
      </div>

      {/* Results or Initial State */}
      {hasSearched && searchResults ? (
        <div className="space-y-6 animate-fade-in">
          {/* Results Header */}
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-lg font-medium">
                Results for "{searchResults.query}"
              </h2>
              <p className="text-sm text-muted-foreground">
                Found {searchResults.totalResults} relevant items from {searchResults.sources} sources
              </p>
            </div>
            <div className="flex gap-2">
              <Link href={`/anchor?topic=${encodeURIComponent(query)}`}>
                <Button variant="outline" size="sm">
                  Generate Video
                </Button>
              </Link>
              <Link href={`/chat?topic=${encodeURIComponent(query)}`}>
                <Button variant="outline" size="sm">
                  Ask AI
                </Button>
              </Link>
            </div>
          </div>

          {/* Knowledge Graph */}
          <KnowledgeGraph
            nodes={demoGraphNodes}
            edges={demoGraphEdges}
            height={400}
          />

          {/* Claims Found */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Key Findings</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {searchResults.claims.map((claim: any) => (
                  <div
                    key={claim.id}
                    className="flex items-start gap-4 p-4 rounded-lg bg-muted/50"
                  >
                    <div className="flex-1">
                      <p className="text-sm text-foreground">{claim.text}</p>
                      <div className="flex items-center gap-3 mt-2">
                        <Badge
                          variant={
                            claim.status === "verified"
                              ? "success"
                              : claim.status === "conflict"
                              ? "warning"
                              : "danger"
                          }
                        >
                          {claim.status}
                        </Badge>
                        <span className="text-xs text-muted-foreground">
                          {claim.confidence}% confidence
                        </span>
                      </div>
                    </div>
                    <Button variant="ghost" size="sm">
                      Details <ArrowRight className="h-3 w-3 ml-1" />
                    </Button>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* This search will be saved */}
          <div className="p-4 rounded-lg bg-primary/5 border border-primary/10 text-center">
            <p className="text-sm text-muted-foreground">
              This search has been saved and will be available for other users
            </p>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Recent Searches */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-base">
                <Clock className="h-4 w-4 text-muted-foreground" />
                Recent Searches
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {recentSearches.map((search, index) => (
                  <button
                    key={index}
                    onClick={() => {
                      setQuery(search.query);
                    }}
                    className="w-full flex items-center justify-between p-3 rounded-lg hover:bg-accent transition-colors text-left"
                  >
                    <div>
                      <p className="text-sm font-medium">{search.query}</p>
                      <p className="text-xs text-muted-foreground">
                        {search.timestamp} · {search.results} results
                      </p>
                    </div>
                    <ArrowRight className="h-4 w-4 text-muted-foreground" />
                  </button>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Trending Topics */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-base">
                <TrendingUp className="h-4 w-4 text-muted-foreground" />
                Trending Topics
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex flex-wrap gap-2">
                {trendingTopics.map((topic, index) => (
                  <button
                    key={index}
                    onClick={() => setQuery(topic)}
                    className="px-3 py-2 rounded-lg bg-muted text-sm hover:bg-accent transition-colors"
                  >
                    {topic}
                  </button>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* How it works */}
          <Card className="lg:col-span-2">
            <CardHeader>
              <CardTitle className="text-base">How Search Works</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                {[
                  {
                    step: "1",
                    title: "Enter Topic",
                    description: "Type any topic, claim, or question you want to verify",
                  },
                  {
                    step: "2",
                    title: "AI Analysis",
                    description: "Our AI scrapes and analyzes multiple sources in real-time",
                  },
                  {
                    step: "3",
                    title: "Fact-Check",
                    description: "Claims are verified against fact-check databases",
                  },
                  {
                    step: "4",
                    title: "Visualize",
                    description: "See the full story through our knowledge graph",
                  },
                ].map((item) => (
                  <div key={item.step} className="text-center p-4">
                    <div className="w-10 h-10 rounded-full bg-primary/10 text-primary font-semibold flex items-center justify-center mx-auto mb-3">
                      {item.step}
                    </div>
                    <h3 className="font-medium text-sm">{item.title}</h3>
                    <p className="text-xs text-muted-foreground mt-1">{item.description}</p>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}
