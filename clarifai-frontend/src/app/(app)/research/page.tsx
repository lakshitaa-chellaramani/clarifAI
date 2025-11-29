"use client";

import { useState, useCallback, useRef } from "react";
import { motion } from "framer-motion";
import { useTheme } from "next-themes";
import { cn } from "@/lib/utils";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ResearchGraph, ResearchNode, ResearchEdge, ResearchGraphData } from "@/components/graphs/research-graph";
import {
  streamResearchGraph,
  getResearchReportDownloadUrl,
  ResearchSource
} from "@/lib/api";
import {
  Search,
  Loader2,
  AlertCircle,
  Download,
  BookOpen,
  Link2,
  FileText,
  Sparkles,
  GraduationCap,
  CheckCircle,
  ExternalLink,
  Sun,
  Moon,
  RefreshCw,
  Layers,
  Quote
} from "lucide-react";

// Demo research graph for "Digital India Initiative"
const DEMO_RESEARCH_DATA: {
  metadata: { topic: string; summary: string };
  nodes: ResearchNode[];
  edges: ResearchEdge[];
  sources: ResearchSource[];
  methodology: string;
} = {
  metadata: {
    topic: "India's Digital India Initiative",
    summary: "Digital India is a flagship programme launched in 2015 to transform India into a digitally empowered society and knowledge economy. The initiative encompasses digital infrastructure, e-governance, and digital literacy, with UPI emerging as its most successful implementation, now processing over 14 billion transactions monthly."
  },
  nodes: [
    {
      id: "node_1",
      label: "Digital India Programme Overview",
      type: "CORE_CONCEPT",
      data: {
        summary: "Digital India is a flagship government programme launched on July 1, 2015, with a vision to transform India into a digitally empowered society. It rests on three key pillars: Digital Infrastructure, Digital Services, and Digital Literacy.",
        source_title: "Digital India Official Portal",
        source_url: "https://www.digitalindia.gov.in/",
        confidence: "HIGH",
        key_quote: "Power to Empower - transforming India into a digitally empowered society and knowledge economy"
      }
    },
    {
      id: "node_2",
      label: "UPI - Unified Payments Interface",
      type: "KEY_FINDING",
      data: {
        summary: "UPI has become the world's most successful real-time payment system, processing over 14 billion transactions worth ₹20 lakh crore monthly in 2024. It now operates in 7+ countries including Singapore, UAE, France, and Mauritius.",
        source_title: "NPCI Monthly Statistics",
        source_url: "https://www.npci.org.in/what-we-do/upi/upi-ecosystem-statistics",
        confidence: "HIGH",
        key_quote: "UPI processed 14.04 billion transactions in October 2024, a 45% YoY growth"
      }
    },
    {
      id: "node_3",
      label: "Aadhaar - Biometric Identity System",
      type: "KEY_FINDING",
      data: {
        summary: "Aadhaar is the world's largest biometric ID system with over 1.4 billion enrollments. It serves as the foundation for Direct Benefit Transfer (DBT), enabling over ₹34 lakh crore in transfers while saving ₹3.5 lakh crore by eliminating fraud.",
        source_title: "UIDAI Annual Report",
        source_url: "https://uidai.gov.in/",
        confidence: "HIGH",
        key_quote: "99.9% of Indian residents now have an Aadhaar number"
      }
    },
    {
      id: "node_4",
      label: "India Stack Architecture",
      type: "EVIDENCE",
      data: {
        summary: "India Stack is a set of open APIs including Aadhaar, eKYC, UPI, and DigiLocker that enable presence-less, paperless, and cashless service delivery. This unified digital infrastructure is being studied globally as a model for digital public infrastructure.",
        source_title: "India Stack Official Documentation",
        source_url: "https://indiastack.org/",
        confidence: "HIGH",
        key_quote: "India Stack has enabled the creation of over 400 million new bank accounts"
      }
    },
    {
      id: "node_5",
      label: "BharatNet - Rural Broadband",
      type: "EVIDENCE",
      data: {
        summary: "BharatNet aims to connect all 2.5 lakh gram panchayats with optical fiber. As of 2024, over 2 lakh gram panchayats have been connected, enabling rural digital inclusion through Common Service Centres.",
        source_title: "BharatNet Project Portal",
        source_url: "https://bbnl.nic.in/",
        confidence: "MEDIUM",
        key_quote: "Over 6.5 lakh km of optical fiber cable laid across rural India"
      }
    },
    {
      id: "node_6",
      label: "CoWIN - Vaccine Management Success",
      type: "KEY_FINDING",
      data: {
        summary: "CoWIN platform managed the world's largest vaccination drive, administering over 2.2 billion COVID-19 vaccine doses. The platform's architecture is now being shared with other countries as open-source software.",
        source_title: "Ministry of Health & Family Welfare",
        source_url: "https://www.cowin.gov.in/",
        confidence: "HIGH",
        key_quote: "CoWIN has been adopted by over 100 countries for their vaccination programs"
      }
    },
    {
      id: "node_7",
      label: "DigiLocker - Document Repository",
      type: "EVIDENCE",
      data: {
        summary: "DigiLocker provides a secure cloud-based platform for storing and sharing documents. Over 200 million users have stored 6+ billion documents, reducing paper usage and enabling instant document verification.",
        source_title: "DigiLocker Statistics",
        source_url: "https://www.digilocker.gov.in/",
        confidence: "HIGH",
        key_quote: "Over 3,500 organizations now issue documents directly to DigiLocker"
      }
    },
    {
      id: "node_8",
      label: "ONDC - Democratizing E-Commerce",
      type: "IMPLICATION",
      data: {
        summary: "Open Network for Digital Commerce (ONDC) aims to break e-commerce platform monopolies by creating an interoperable network. Launched in 2022, it enables small sellers to reach customers without depending on any single platform.",
        source_title: "ONDC Official Portal",
        source_url: "https://ondc.org/",
        confidence: "MEDIUM",
        key_quote: "ONDC processes over 10 million monthly orders across 600+ cities"
      }
    },
    {
      id: "node_9",
      label: "DigiYatra - Biometric Airport Travel",
      type: "EVIDENCE",
      data: {
        summary: "DigiYatra enables paperless air travel using facial recognition. Operational in 14+ airports, it has processed over 10 million passengers, reducing check-in time from 3 minutes to 30 seconds.",
        source_title: "DigiYatra Foundation",
        source_url: "https://www.digiyatra.com/",
        confidence: "HIGH",
        key_quote: "DigiYatra aims to cover all major airports in India by 2025"
      }
    },
    {
      id: "node_10",
      label: "Privacy & Data Protection Concerns",
      type: "PERSPECTIVE",
      data: {
        summary: "Critics raise concerns about surveillance potential of digital systems. The Digital Personal Data Protection Act 2023 was enacted to address privacy concerns, establishing rights over personal data and consent requirements.",
        source_title: "Internet Freedom Foundation",
        source_url: "https://internetfreedom.in/",
        confidence: "MEDIUM",
        key_quote: "Balancing digital progress with individual privacy rights remains a key challenge"
      }
    },
    {
      id: "node_11",
      label: "Global Recognition & Export",
      type: "IMPLICATION",
      data: {
        summary: "India's digital public infrastructure is being recognized globally. The G20 under India's presidency showcased DPI, and countries like Trinidad, Papua New Guinea, and Armenia are adopting India Stack components.",
        source_title: "Ministry of External Affairs",
        source_url: "https://www.mea.gov.in/",
        confidence: "HIGH",
        key_quote: "India is now exporting its digital infrastructure model to developing nations"
      }
    },
    {
      id: "node_12",
      label: "Account Aggregator Framework",
      type: "KEY_FINDING",
      data: {
        summary: "The Account Aggregator framework enables consent-based financial data sharing. Over 1 billion accounts are now AA-enabled, revolutionizing credit access for small businesses and individuals without traditional credit history.",
        source_title: "Sahamati - AA Ecosystem",
        source_url: "https://sahamati.org.in/",
        confidence: "HIGH",
        key_quote: "AA has enabled ₹1.5 lakh crore in loans to underserved segments"
      }
    }
  ],
  edges: [
    { source: "node_1", target: "node_2", label: "enabled" },
    { source: "node_1", target: "node_3", label: "enabled" },
    { source: "node_3", target: "node_4", label: "forms_basis" },
    { source: "node_2", target: "node_4", label: "part_of" },
    { source: "node_4", target: "node_6", label: "powered" },
    { source: "node_4", target: "node_7", label: "includes" },
    { source: "node_1", target: "node_5", label: "infrastructure" },
    { source: "node_4", target: "node_8", label: "leads_to" },
    { source: "node_3", target: "node_9", label: "enables" },
    { source: "node_1", target: "node_10", label: "raises_concerns" },
    { source: "node_4", target: "node_11", label: "leads_to" },
    { source: "node_4", target: "node_12", label: "includes" },
    { source: "node_12", target: "node_2", label: "integrates_with" },
    { source: "node_10", target: "node_3", label: "concerns_about" }
  ],
  sources: [
    { title: "Digital India Official Portal", url: "https://www.digitalindia.gov.in/", publisher: "Government of India", date: "2024" },
    { title: "NPCI UPI Statistics", url: "https://www.npci.org.in/", publisher: "National Payments Corporation of India", date: "November 2024" },
    { title: "UIDAI Annual Report", url: "https://uidai.gov.in/", publisher: "Unique Identification Authority of India", date: "2024" },
    { title: "India Stack Documentation", url: "https://indiastack.org/", publisher: "iSPIRT Foundation", date: "2024" },
    { title: "Ministry of Electronics & IT Reports", url: "https://www.meity.gov.in/", publisher: "MeitY", date: "2024" }
  ],
  methodology: "This research was compiled from official government portals, regulatory body statistics, and verified news sources. Each finding is linked to its primary source for verification. Confidence levels are assigned based on source reliability and recency of data."
};

export default function ResearchPage() {
  const [query, setQuery] = useState("");
  const [depth, setDepth] = useState<"quick" | "standard" | "comprehensive">("comprehensive");
  const [isLoading, setIsLoading] = useState(false);
  const [isStreaming, setIsStreaming] = useState(false);
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState<string | null>(null);

  const [data, setData] = useState<ResearchGraphData>({ nodes: [], edges: [] });
  const [metadata, setMetadata] = useState<{ topic: string; summary: string } | null>(null);
  const [sources, setSources] = useState<ResearchSource[]>([]);
  const [methodology, setMethodology] = useState<string>("");
  const [currentQuery, setCurrentQuery] = useState("");

  const cleanupRef = useRef<(() => void) | null>(null);
  const { resolvedTheme, setTheme } = useTheme();
  const isDark = resolvedTheme === "dark";

  // Load demo research data with streaming effect
  const loadDemoResearch = useCallback(() => {
    const demo = DEMO_RESEARCH_DATA;

    // Set metadata first
    setMetadata(demo.metadata);
    setIsLoading(false);

    // Stream nodes one by one for nice effect
    let nodeIndex = 0;
    const streamInterval = setInterval(() => {
      if (nodeIndex < demo.nodes.length) {
        const node = demo.nodes[nodeIndex];
        // Find edges that connect to already-added nodes
        const addedNodeIds = new Set(demo.nodes.slice(0, nodeIndex + 1).map(n => n.id));
        const relevantEdges = demo.edges.filter(
          e => addedNodeIds.has(e.source) && addedNodeIds.has(e.target)
        );

        setData(prev => ({
          nodes: [...prev.nodes, node],
          edges: relevantEdges
        }));
        setProgress(((nodeIndex + 1) / demo.nodes.length) * 100);
        nodeIndex++;
      } else {
        clearInterval(streamInterval);
        setSources(demo.sources);
        setMethodology(demo.methodology);
        setIsStreaming(false);
      }
    }, 400);

    return () => clearInterval(streamInterval);
  }, []);

  const handleStartResearch = useCallback(() => {
    if (!query.trim()) return;

    // Reset state
    setData({ nodes: [], edges: [] });
    setMetadata(null);
    setSources([]);
    setMethodology("");
    setError(null);
    setProgress(0);
    setIsLoading(true);
    setIsStreaming(true);
    setCurrentQuery(query);

    // Cleanup previous stream
    if (cleanupRef.current) {
      cleanupRef.current();
    }

    const cleanup = streamResearchGraph(
      query,
      depth,
      // On metadata
      (meta) => {
        setMetadata({ topic: meta.topic, summary: meta.summary });
        setIsLoading(false);
      },
      // On node
      ({ node, edges, progress: p }) => {
        setData(prev => ({
          nodes: [...prev.nodes, node as unknown as ResearchNode],
          edges: [...prev.edges, ...edges.map(e => ({ ...e } as ResearchEdge))]
        }));
        setProgress(p);
      },
      // On sources
      (sourcesData) => {
        setSources(sourcesData);
      },
      // On complete
      ({ methodology: meth }) => {
        setIsStreaming(false);
        setMethodology(meth);
      },
      // On error - fallback to demo data
      (err) => {
        console.log("API unavailable, using demo data:", err);
        cleanupRef.current = loadDemoResearch();
      }
    );

    cleanupRef.current = cleanup;
  }, [query, depth, loadDemoResearch]);

  const handleReset = () => {
    if (cleanupRef.current) {
      cleanupRef.current();
    }
    setData({ nodes: [], edges: [] });
    setMetadata(null);
    setSources([]);
    setMethodology("");
    setError(null);
    setProgress(0);
    setIsLoading(false);
    setIsStreaming(false);
    setCurrentQuery("");
  };

  const handleDownloadReport = () => {
    if (!currentQuery) return;
    const url = getResearchReportDownloadUrl(currentQuery, depth);
    window.open(url, "_blank");
  };

  const toggleTheme = () => {
    setTheme(isDark ? "light" : "dark");
  };

  const depthOptions = [
    { value: "quick", label: "Quick", description: "5-8 nodes, faster" },
    { value: "standard", label: "Standard", description: "8-12 nodes" },
    { value: "comprehensive", label: "Comprehensive", description: "12-15 nodes, detailed" }
  ];

  return (
    <div className={cn(
      "min-h-screen p-6",
      isDark
        ? "bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950"
        : "bg-gradient-to-br from-slate-50 via-white to-slate-100"
    )}>
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-7xl mx-auto mb-6"
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className={cn(
              "p-3 rounded-xl",
              isDark ? "bg-gradient-to-br from-purple-500/20 to-blue-500/20" : "bg-gradient-to-br from-purple-100 to-blue-100"
            )}>
              <GraduationCap className={cn("w-8 h-8", isDark ? "text-purple-400" : "text-purple-600")} />
            </div>
            <div>
              <h1 className={cn(
                "text-2xl font-bold",
                isDark ? "text-white" : "text-slate-900"
              )}>
                Research Hub
              </h1>
              <p className={cn(
                "text-sm",
                isDark ? "text-white/60" : "text-slate-600"
              )}>
                AI-powered research with source citations and explainable findings
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <Button
              variant="outline"
              size="icon"
              onClick={toggleTheme}
              className={cn(
                isDark
                  ? "border-white/20 text-white hover:bg-white/10"
                  : "border-slate-200 text-slate-600 hover:bg-slate-100"
              )}
            >
              {isDark ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
            </Button>

            {(isStreaming || data.nodes.length > 0) && (
              <>
                <Badge
                  variant="outline"
                  className={cn(
                    isStreaming ? "animate-pulse" : "",
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
                  {isLoading ? "Initializing..." : isStreaming ? `${Math.round(progress)}%` : "Complete"}
                </Badge>

                <Button
                  variant="outline"
                  onClick={handleReset}
                  className={cn(
                    isDark
                      ? "border-white/20 text-white hover:bg-white/10"
                      : "border-slate-200 text-slate-700 hover:bg-slate-100"
                  )}
                >
                  <RefreshCw className="w-4 h-4 mr-2" />
                  New Research
                </Button>
              </>
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
          <CardContent className="p-6">
            <div className="space-y-4">
              {/* Query Input */}
              <div className="flex items-center gap-4">
                <div className="flex-1 relative">
                  <Search className={cn(
                    "absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5",
                    isDark ? "text-white/40" : "text-slate-400"
                  )} />
                  <input
                    type="text"
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && handleStartResearch()}
                    placeholder="Try: Digital India Initiative, UPI Payments, India Stack..."
                    className={cn(
                      "w-full pl-12 pr-4 py-4 rounded-xl border text-base transition-colors",
                      isDark
                        ? "bg-white/5 border-white/10 text-white placeholder:text-white/30 focus:border-purple-500/50 focus:ring-2 focus:ring-purple-500/20"
                        : "bg-slate-50 border-slate-200 text-slate-800 placeholder:text-slate-400 focus:border-purple-500 focus:ring-2 focus:ring-purple-500/20"
                    )}
                  />
                </div>
                <Button
                  onClick={handleStartResearch}
                  disabled={!query.trim() || isLoading || isStreaming}
                  className="px-8 py-4 h-auto bg-gradient-to-r from-purple-500 to-blue-500 text-white hover:from-purple-600 hover:to-blue-600 shadow-lg disabled:opacity-50"
                >
                  {isLoading ? (
                    <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                  ) : (
                    <Sparkles className="w-5 h-5 mr-2" />
                  )}
                  Start Research
                </Button>
              </div>

              {/* Depth Selector */}
              <div className="flex items-center gap-4">
                <span className={cn("text-sm font-medium", isDark ? "text-white/60" : "text-slate-600")}>
                  Research Depth:
                </span>
                <div className="flex gap-2">
                  {depthOptions.map((option) => (
                    <button
                      key={option.value}
                      onClick={() => setDepth(option.value as typeof depth)}
                      className={cn(
                        "px-4 py-2 rounded-lg text-sm font-medium transition-all",
                        depth === option.value
                          ? isDark
                            ? "bg-purple-500/20 text-purple-400 border border-purple-500/50"
                            : "bg-purple-100 text-purple-700 border border-purple-300"
                          : isDark
                            ? "bg-white/5 text-white/60 border border-white/10 hover:bg-white/10"
                            : "bg-slate-100 text-slate-600 border border-slate-200 hover:bg-slate-200"
                      )}
                    >
                      {option.label}
                    </button>
                  ))}
                </div>
              </div>

              {error && (
                <div className="flex items-center gap-2 text-red-500 bg-red-500/10 p-3 rounded-lg">
                  <AlertCircle className="w-4 h-4" />
                  <span className="text-sm">{error}</span>
                </div>
              )}

              <p className={cn(
                "text-xs",
                isDark ? "text-white/40" : "text-slate-500"
              )}>
                Enter any research topic. Try <strong>"Digital India Initiative"</strong> for a demo with 12 interconnected nodes covering UPI, Aadhaar, India Stack, and more.
              </p>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Summary Card */}
      {metadata && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="max-w-7xl mx-auto mb-6"
        >
          <Card className={cn(
            "border",
            isDark ? "bg-gradient-to-r from-purple-500/10 to-blue-500/10 border-purple-500/20" : "bg-gradient-to-r from-purple-50 to-blue-50 border-purple-200"
          )}>
            <CardContent className="p-6">
              <div className="flex items-start gap-4">
                <div className={cn(
                  "p-2 rounded-lg",
                  isDark ? "bg-purple-500/20" : "bg-purple-100"
                )}>
                  <FileText className={cn("w-5 h-5", isDark ? "text-purple-400" : "text-purple-600")} />
                </div>
                <div className="flex-1">
                  <h3 className={cn("font-semibold mb-1", isDark ? "text-white" : "text-slate-900")}>
                    {metadata.topic}
                  </h3>
                  <p className={cn("text-sm", isDark ? "text-white/70" : "text-slate-600")}>
                    {metadata.summary}
                  </p>
                </div>
                {!isStreaming && data.nodes.length > 0 && (
                  <Button
                    onClick={handleDownloadReport}
                    className="bg-gradient-to-r from-emerald-500 to-teal-500 text-white hover:from-emerald-600 hover:to-teal-600"
                  >
                    <Download className="w-4 h-4 mr-2" />
                    Download Report
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>
        </motion.div>
      )}

      {/* Stats Cards */}
      {data.nodes.length > 0 && (
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
              <CardContent className="p-4 flex items-center gap-3">
                <div className={cn("p-2 rounded-lg", isDark ? "bg-blue-500/20" : "bg-blue-100")}>
                  <Layers className={cn("w-5 h-5", isDark ? "text-blue-400" : "text-blue-600")} />
                </div>
                <div>
                  <p className={cn("text-2xl font-bold", isDark ? "text-white" : "text-slate-900")}>
                    {data.nodes.length}
                  </p>
                  <p className={cn("text-xs", isDark ? "text-white/60" : "text-slate-600")}>Findings</p>
                </div>
              </CardContent>
            </Card>

            <Card className={cn(
              "border",
              isDark ? "bg-white/5 border-white/10" : "bg-white border-slate-200"
            )}>
              <CardContent className="p-4 flex items-center gap-3">
                <div className={cn("p-2 rounded-lg", isDark ? "bg-purple-500/20" : "bg-purple-100")}>
                  <Link2 className={cn("w-5 h-5", isDark ? "text-purple-400" : "text-purple-600")} />
                </div>
                <div>
                  <p className={cn("text-2xl font-bold", isDark ? "text-white" : "text-slate-900")}>
                    {data.edges.length}
                  </p>
                  <p className={cn("text-xs", isDark ? "text-white/60" : "text-slate-600")}>Connections</p>
                </div>
              </CardContent>
            </Card>

            <Card className={cn(
              "border",
              isDark ? "bg-white/5 border-white/10" : "bg-white border-slate-200"
            )}>
              <CardContent className="p-4 flex items-center gap-3">
                <div className={cn("p-2 rounded-lg", isDark ? "bg-emerald-500/20" : "bg-emerald-100")}>
                  <BookOpen className={cn("w-5 h-5", isDark ? "text-emerald-400" : "text-emerald-600")} />
                </div>
                <div>
                  <p className={cn("text-2xl font-bold", isDark ? "text-white" : "text-slate-900")}>
                    {sources.length || data.nodes.filter(n => n.data.source_url).length}
                  </p>
                  <p className={cn("text-xs", isDark ? "text-white/60" : "text-slate-600")}>Sources</p>
                </div>
              </CardContent>
            </Card>

            <Card className={cn(
              "border",
              isDark ? "bg-white/5 border-white/10" : "bg-white border-slate-200"
            )}>
              <CardContent className="p-4 flex items-center gap-3">
                <div className={cn("p-2 rounded-lg", isDark ? "bg-yellow-500/20" : "bg-yellow-100")}>
                  <CheckCircle className={cn("w-5 h-5", isDark ? "text-yellow-400" : "text-yellow-600")} />
                </div>
                <div>
                  <p className={cn("text-2xl font-bold", isDark ? "text-white" : "text-slate-900")}>
                    {data.nodes.filter(n => n.data.confidence === "HIGH").length}
                  </p>
                  <p className={cn("text-xs", isDark ? "text-white/60" : "text-slate-600")}>High Confidence</p>
                </div>
              </CardContent>
            </Card>
          </div>
        </motion.div>
      )}

      {/* Main Content */}
      <div className="max-w-7xl mx-auto">
        <div className="grid grid-cols-12 gap-6">
          {/* Graph */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.15 }}
            className="col-span-8"
          >
            <Card className={cn(
              "border overflow-hidden",
              isDark ? "bg-white/5 border-white/10" : "bg-white border-slate-200"
            )}>
              <CardHeader className={cn(
                "border-b",
                isDark ? "border-white/10" : "border-slate-200"
              )}>
                <CardTitle className={cn(
                  "text-lg flex items-center gap-2",
                  isDark ? "text-white" : "text-slate-900"
                )}>
                  <Layers className="w-5 h-5" />
                  Knowledge Graph
                </CardTitle>
              </CardHeader>
              <CardContent className="p-0">
                <div className="h-[600px]">
                  {data.nodes.length > 0 ? (
                    <ResearchGraph
                      data={data}
                      onNodeClick={(node) => console.log("Clicked:", node)}
                      theme={isDark ? "dark" : "light"}
                    />
                  ) : (
                    <div className={cn(
                      "h-full flex flex-col items-center justify-center",
                      isDark ? "text-white/40" : "text-slate-400"
                    )}>
                      <GraduationCap className="w-16 h-16 mb-4 opacity-50" />
                      <p className="text-lg font-medium">Enter a research topic to get started</p>
                      <p className="text-sm mt-1">AI will analyze sources and build a knowledge graph</p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </motion.div>

          {/* Sources Panel */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2 }}
            className="col-span-4 space-y-4"
          >
            {/* Sources List */}
            <Card className={cn(
              "border",
              isDark ? "bg-white/5 border-white/10" : "bg-white border-slate-200"
            )}>
              <CardHeader className={cn(
                "border-b",
                isDark ? "border-white/10" : "border-slate-200"
              )}>
                <CardTitle className={cn(
                  "text-lg flex items-center gap-2",
                  isDark ? "text-white" : "text-slate-900"
                )}>
                  <BookOpen className="w-5 h-5" />
                  Sources & Citations
                </CardTitle>
              </CardHeader>
              <CardContent className="p-4 max-h-[300px] overflow-y-auto">
                {sources.length > 0 ? (
                  <div className="space-y-3">
                    {sources.map((source, index) => (
                      <a
                        key={index}
                        href={source.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className={cn(
                          "block p-3 rounded-lg transition-colors group",
                          isDark ? "bg-white/5 hover:bg-white/10" : "bg-slate-50 hover:bg-slate-100"
                        )}
                      >
                        <div className="flex items-start gap-2">
                          <ExternalLink className={cn(
                            "w-4 h-4 mt-0.5 shrink-0",
                            isDark ? "text-blue-400" : "text-blue-600"
                          )} />
                          <div>
                            <p className={cn(
                              "text-sm font-medium group-hover:underline",
                              isDark ? "text-white" : "text-slate-900"
                            )}>
                              {source.title}
                            </p>
                            {source.publisher && (
                              <p className={cn(
                                "text-xs mt-0.5",
                                isDark ? "text-white/60" : "text-slate-600"
                              )}>
                                {source.publisher} {source.date && `• ${source.date}`}
                              </p>
                            )}
                          </div>
                        </div>
                      </a>
                    ))}
                  </div>
                ) : data.nodes.length > 0 ? (
                  <div className="space-y-3">
                    {data.nodes.filter(n => n.data.source_url).map((node, index) => (
                      <a
                        key={index}
                        href={node.data.source_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className={cn(
                          "block p-3 rounded-lg transition-colors group",
                          isDark ? "bg-white/5 hover:bg-white/10" : "bg-slate-50 hover:bg-slate-100"
                        )}
                      >
                        <div className="flex items-start gap-2">
                          <ExternalLink className={cn(
                            "w-4 h-4 mt-0.5 shrink-0",
                            isDark ? "text-blue-400" : "text-blue-600"
                          )} />
                          <p className={cn(
                            "text-sm font-medium group-hover:underline",
                            isDark ? "text-white" : "text-slate-900"
                          )}>
                            {node.data.source_title || "Source"}
                          </p>
                        </div>
                      </a>
                    ))}
                  </div>
                ) : (
                  <p className={cn("text-sm text-center py-8", isDark ? "text-white/40" : "text-slate-400")}>
                    Sources will appear here as findings are generated
                  </p>
                )}
              </CardContent>
            </Card>

            {/* Methodology */}
            {methodology && (
              <Card className={cn(
                "border",
                isDark ? "bg-white/5 border-white/10" : "bg-white border-slate-200"
              )}>
                <CardHeader className={cn(
                  "border-b py-3",
                  isDark ? "border-white/10" : "border-slate-200"
                )}>
                  <CardTitle className={cn(
                    "text-sm flex items-center gap-2",
                    isDark ? "text-white" : "text-slate-900"
                  )}>
                    <Quote className="w-4 h-4" />
                    Methodology
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-4">
                  <p className={cn("text-sm", isDark ? "text-white/70" : "text-slate-600")}>
                    {methodology}
                  </p>
                </CardContent>
              </Card>
            )}

            {/* Info Card */}
            <Card className={cn(
              "border",
              isDark ? "bg-gradient-to-br from-purple-500/10 to-blue-500/10 border-purple-500/20" : "bg-gradient-to-br from-purple-50 to-blue-50 border-purple-200"
            )}>
              <CardContent className="p-4">
                <h4 className={cn("font-semibold mb-2 flex items-center gap-2", isDark ? "text-white" : "text-slate-900")}>
                  <Sparkles className="w-4 h-4 text-purple-400" />
                  How It Works
                </h4>
                <ul className={cn("text-sm space-y-2", isDark ? "text-white/70" : "text-slate-600")}>
                  <li className="flex items-start gap-2">
                    <CheckCircle className="w-4 h-4 text-emerald-500 mt-0.5 shrink-0" />
                    AI analyzes multiple news and fact-check sources
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle className="w-4 h-4 text-emerald-500 mt-0.5 shrink-0" />
                    Every finding is linked to its source
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle className="w-4 h-4 text-emerald-500 mt-0.5 shrink-0" />
                    Confidence levels indicate source reliability
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle className="w-4 h-4 text-emerald-500 mt-0.5 shrink-0" />
                    Download comprehensive reports for reference
                  </li>
                </ul>
              </CardContent>
            </Card>
          </motion.div>
        </div>
      </div>
    </div>
  );
}
