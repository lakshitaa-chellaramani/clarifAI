"use client";

import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import {
  Shield,
  Search,
  CheckCircle,
  ArrowRight,
  Network,
  Video,
  MessageSquare,
  Newspaper,
  Code,
  BarChart3,
  BookOpen,
  FileText,
  GraduationCap,
  Layers,
  Play,
  Sparkles,
  TrendingUp,
  ChevronRight,
  ExternalLink,
  Menu,
  X,
  Github,
  Twitter,
  Linkedin,
  Mail,
  Check,
  Zap,
  Building2,
  Users,
  Crown,
  AlertCircle,
  Clock,
  Globe,
  Database,
  Bot,
} from "lucide-react";
import Link from "next/link";
import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

// Animation variants
const fadeInUp = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.5 } },
};

const staggerContainer = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.1 },
  },
};

const scaleIn = {
  hidden: { opacity: 0, scale: 0.9 },
  visible: { opacity: 1, scale: 1, transition: { duration: 0.4 } },
};

// Feature highlights data
const featureHighlights = [
  {
    icon: BarChart3,
    title: "Confidence Score System",
    description: "Every claim gets a verifiable confidence score based on source credibility and cross-reference analysis.",
    color: "success",
  },
  {
    icon: Layers,
    title: "Claim Comparison View",
    description: "Compare multiple sources side-by-side to understand how different outlets report the same story.",
    color: "primary",
  },
  {
    icon: Network,
    title: "Dynamic Graphs & Timelines",
    description: "Interactive visualizations showing how stories evolve and connect over time.",
    color: "warning",
  },
  {
    icon: MessageSquare,
    title: "AI Chat with Source Citations",
    description: "Ask questions and get answers backed by verified sources with full citations.",
    color: "primary",
  },
  {
    icon: Video,
    title: "Custom Video Explainers",
    description: "Generate AI-powered video briefings with professional anchors explaining complex topics.",
    color: "danger",
  },
  {
    icon: BookOpen,
    title: "Flashcard Learning Mode",
    description: "Transform news into educational flashcards for better retention and understanding.",
    color: "success",
  },
];

// Pricing plans data
const pricingPlans = [
  {
    name: "Free",
    description: "Perfect for casual readers who want verified news",
    price: "$0",
    period: "forever",
    icon: Users,
    features: [
      "10 fact-checks per day",
      "Basic confidence scores",
      "Daily news digest",
      "Community support",
    ],
    limitations: [
      "Limited API access",
      "No export features",
    ],
    cta: "Get Started",
    popular: false,
  },
  {
    name: "Pro",
    description: "For researchers and power users who need more",
    price: "$19",
    period: "per month",
    icon: Zap,
    features: [
      "Unlimited fact-checks",
      "Advanced confidence analysis",
      "Full research reports",
      "Export to PDF, DOCX, BibTeX",
      "Priority AI chat support",
      "Knowledge graph access",
      "Custom video explainers",
    ],
    limitations: [],
    cta: "Start Free Trial",
    popular: true,
  },
  {
    name: "Enterprise",
    description: "For organizations needing full API access",
    price: "Custom",
    period: "contact us",
    icon: Building2,
    features: [
      "Everything in Pro",
      "Full API access",
      "Custom integrations",
      "Dedicated account manager",
      "SLA guarantee",
      "White-label options",
      "Team collaboration",
      "Advanced analytics",
    ],
    limitations: [],
    cta: "Contact Sales",
    popular: false,
  },
];

// Live feed mock data
const liveFeedItems = [
  { title: "Climate Summit Agreement", score: 94, status: "verified", time: "2m ago" },
  { title: "Tech Company Earnings Report", score: 87, status: "verified", time: "5m ago" },
  { title: "Political Statement Analysis", score: 62, status: "checking", time: "8m ago" },
  { title: "Health Study Claims", score: 45, status: "disputed", time: "12m ago" },
];

export default function LandingPage() {
  const [mounted, setMounted] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [activeFeature, setActiveFeature] = useState(0);
  const [activeFeedItem, setActiveFeedItem] = useState(0);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Auto-rotate features
  useEffect(() => {
    const interval = setInterval(() => {
      setActiveFeature((prev) => (prev + 1) % featureHighlights.length);
    }, 4000);
    return () => clearInterval(interval);
  }, []);

  // Auto-rotate live feed
  useEffect(() => {
    const interval = setInterval(() => {
      setActiveFeedItem((prev) => (prev + 1) % liveFeedItems.length);
    }, 3000);
    return () => clearInterval(interval);
  }, []);

  const getScoreColor = (score: number) => {
    if (score >= 80) return "text-success";
    if (score >= 60) return "text-warning";
    return "text-danger";
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "verified":
        return <Badge className="bg-success/10 text-success border-0 text-xs"><CheckCircle className="h-3 w-3 mr-1" />Verified</Badge>;
      case "checking":
        return <Badge className="bg-warning/10 text-warning border-0 text-xs"><Clock className="h-3 w-3 mr-1" />Checking</Badge>;
      case "disputed":
        return <Badge className="bg-danger/10 text-danger border-0 text-xs"><AlertCircle className="h-3 w-3 mr-1" />Disputed</Badge>;
      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-background overflow-x-hidden">
      {/* Header (Sticky) */}
      <header className="sticky top-0 z-50 border-b border-border bg-background/80 backdrop-blur-md">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="h-16 flex items-center justify-between">
            {/* Logo */}
            <Link href="/" className="flex items-center gap-2">
              <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary shadow-glow-sm">
                <Shield className="h-5 w-5 text-primary-foreground" />
              </div>
              <span className="font-bold text-xl text-gradient">ClarifAI</span>
            </Link>

            {/* Desktop Navigation */}
            <nav className="hidden md:flex items-center gap-8">
              {["Features", "Researchers", "API", "Pricing", "About", "Blog"].map((item) => (
                <Link
                  key={item}
                  href={`#${item.toLowerCase()}`}
                  className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
                >
                  {item}
                </Link>
              ))}
            </nav>

            {/* Button Group */}
            <div className="hidden md:flex items-center gap-3">
              <Button variant="ghost" size="sm">
                Login
              </Button>
              <Button size="sm">
                Sign Up
                <ArrowRight className="h-4 w-4 ml-1" />
              </Button>
            </div>

            {/* Mobile Menu Button */}
            <button
              className="md:hidden p-2 rounded-md hover:bg-accent"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            >
              {mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        <AnimatePresence>
          {mobileMenuOpen && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              className="md:hidden border-t border-border bg-background"
            >
              <nav className="flex flex-col p-4 gap-2">
                {["Features", "Researchers", "API", "Pricing", "About", "Blog"].map((item) => (
                  <Link
                    key={item}
                    href={`#${item.toLowerCase()}`}
                    className="px-3 py-2 text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-accent rounded-md transition-colors"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    {item}
                  </Link>
                ))}
                <div className="flex gap-2 mt-4 pt-4 border-t border-border">
                  <Button variant="outline" size="sm" className="flex-1">
                    Login
                  </Button>
                  <Button size="sm" className="flex-1">
                    Sign Up
                  </Button>
                </div>
              </nav>
            </motion.div>
          )}
        </AnimatePresence>
      </header>

      {/* Hero Section */}
      <section className="relative py-16 lg:py-24 px-4 sm:px-6 lg:px-8 overflow-hidden">
        {/* Background gradient */}
        <div className="absolute inset-0 bg-gradient-to-br from-violet-50/50 via-transparent to-violet-100/30 dark:from-violet-950/20 dark:via-transparent dark:to-violet-900/10" />
        <div className="absolute top-20 right-0 w-96 h-96 bg-primary/5 rounded-full blur-3xl" />
        <div className="absolute bottom-0 left-0 w-64 h-64 bg-primary/10 rounded-full blur-3xl" />

        <div className="relative max-w-7xl mx-auto">
          <div className="grid lg:grid-cols-2 gap-12 lg:gap-8 items-center">
            {/* Left Content */}
            <div className="text-center lg:text-left">
              <motion.div
                initial="hidden"
                animate={mounted ? "visible" : "hidden"}
                variants={fadeInUp}
              >
                <Badge className="mb-6 bg-primary/10 text-primary border-primary/20 px-4 py-1.5">
                  <Sparkles className="h-3.5 w-3.5 mr-2" />
                  AI-Powered Fact Verification
                </Badge>
              </motion.div>

              <motion.h1
                initial="hidden"
                animate={mounted ? "visible" : "hidden"}
                variants={fadeInUp}
                className="text-4xl sm:text-5xl lg:text-6xl font-bold text-foreground leading-tight mb-6"
              >
                News Without Noise.{" "}
                <span className="text-gradient">Just Facts.</span>
              </motion.h1>

              <motion.p
                initial="hidden"
                animate={mounted ? "visible" : "hidden"}
                variants={fadeInUp}
                className="text-lg lg:text-xl text-muted-foreground max-w-xl mx-auto lg:mx-0 mb-8"
              >
                Explore verified stories, see evidence clearly, and learn confidently from transparent information.
              </motion.p>

              <motion.div
                initial="hidden"
                animate={mounted ? "visible" : "hidden"}
                variants={fadeInUp}
                className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start"
              >
                <Link href="/dashboard">
                  <Button size="lg" className="px-8 shadow-glow-sm hover:shadow-glow">
                    Explore Today's Top Stories
                    <ArrowRight className="h-4 w-4 ml-2" />
                  </Button>
                </Link>
                <Link href="/search">
                  <Button size="lg" variant="outline" className="px-8">
                    <Search className="h-4 w-4 mr-2" />
                    Try Fact Check Tool
                  </Button>
                </Link>
              </motion.div>
            </div>

            {/* Right - Enhanced Interactive Dashboard Mockup */}
            <motion.div
              initial={{ opacity: 0, x: 50 }}
              animate={mounted ? { opacity: 1, x: 0 } : {}}
              transition={{ duration: 0.6, delay: 0.3 }}
              className="relative hidden lg:block"
            >
              <div className="relative">
                {/* Main Dashboard Container */}
                <div className="bg-card rounded-2xl border border-border shadow-soft-lg overflow-hidden">
                  {/* Dashboard Header */}
                  <div className="bg-muted/50 px-4 py-3 border-b border-border flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="flex gap-1.5">
                        <div className="h-3 w-3 rounded-full bg-danger" />
                        <div className="h-3 w-3 rounded-full bg-warning" />
                        <div className="h-3 w-3 rounded-full bg-success" />
                      </div>
                      <span className="text-xs text-muted-foreground ml-2">ClarifAI Dashboard</span>
                    </div>
                    <Badge className="bg-success/10 text-success border-0 text-xs">
                      <span className="relative flex h-2 w-2 mr-1.5">
                        <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-success opacity-75" />
                        <span className="relative inline-flex h-2 w-2 rounded-full bg-success" />
                      </span>
                      Live
                    </Badge>
                  </div>

                  {/* Dashboard Content */}
                  <div className="p-4 space-y-4">
                    {/* Live Feed Section */}
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Live Fact-Check Feed</span>
                        <Globe className="h-3.5 w-3.5 text-muted-foreground" />
                      </div>

                      <AnimatePresence mode="wait">
                        <motion.div
                          key={activeFeedItem}
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, y: -10 }}
                          className="bg-muted/30 rounded-lg p-3 border border-border"
                        >
                          <div className="flex items-start justify-between gap-3">
                            <div className="flex-1 min-w-0">
                              <p className="text-sm font-medium text-foreground truncate">
                                {liveFeedItems[activeFeedItem].title}
                              </p>
                              <div className="flex items-center gap-2 mt-1">
                                {getStatusBadge(liveFeedItems[activeFeedItem].status)}
                                <span className="text-xs text-muted-foreground">{liveFeedItems[activeFeedItem].time}</span>
                              </div>
                            </div>
                            <div className="text-right">
                              <span className={`text-2xl font-bold ${getScoreColor(liveFeedItems[activeFeedItem].score)}`}>
                                {liveFeedItems[activeFeedItem].score}%
                              </span>
                              <p className="text-xs text-muted-foreground">confidence</p>
                            </div>
                          </div>
                        </motion.div>
                      </AnimatePresence>

                      {/* Feed indicator dots */}
                      <div className="flex justify-center gap-1.5">
                        {liveFeedItems.map((_, i) => (
                          <div
                            key={i}
                            className={`h-1.5 rounded-full transition-all ${
                              i === activeFeedItem ? "w-4 bg-primary" : "w-1.5 bg-muted-foreground/30"
                            }`}
                          />
                        ))}
                      </div>
                    </div>

                    {/* Knowledge Graph Mini Preview */}
                    <div className="bg-gradient-to-br from-violet-50/50 to-transparent dark:from-violet-950/30 rounded-lg p-3 border border-border">
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-2">
                          <Network className="h-4 w-4 text-primary" />
                          <span className="text-xs font-medium">Knowledge Graph</span>
                        </div>
                        <Badge variant="outline" className="text-xs">12 nodes</Badge>
                      </div>
                      <div className="h-28 flex items-center justify-center">
                        <svg width="100%" height="100%" viewBox="0 0 200 100" className="max-w-full">
                          {/* Central node */}
                          <motion.circle
                            cx="100" cy="50" r="12"
                            fill="hsl(var(--primary))"
                            initial={{ scale: 0 }}
                            animate={{ scale: [1, 1.1, 1] }}
                            transition={{ duration: 2, repeat: Infinity }}
                          />
                          <text x="100" y="54" textAnchor="middle" fill="white" fontSize="8" fontWeight="bold">AI</text>

                          {/* Surrounding nodes with labels */}
                          {[
                            { cx: 40, cy: 25, label: "Source", color: "hsl(var(--success))" },
                            { cx: 160, cy: 25, label: "Claims", color: "hsl(var(--warning))" },
                            { cx: 40, cy: 75, label: "Facts", color: "hsl(var(--primary))" },
                            { cx: 160, cy: 75, label: "News", color: "hsl(var(--success))" },
                            { cx: 100, cy: 10, label: "Data", color: "hsl(var(--muted-foreground))" },
                          ].map((node, i) => (
                            <g key={i}>
                              <motion.line
                                x1="100" y1="50" x2={node.cx} y2={node.cy}
                                stroke="hsl(var(--primary))"
                                strokeWidth="1.5"
                                strokeOpacity="0.3"
                                initial={{ pathLength: 0 }}
                                animate={{ pathLength: 1 }}
                                transition={{ delay: 0.5 + i * 0.1, duration: 0.5 }}
                              />
                              <motion.circle
                                cx={node.cx} cy={node.cy} r="8"
                                fill={node.color}
                                fillOpacity="0.2"
                                stroke={node.color}
                                strokeWidth="1.5"
                                initial={{ scale: 0 }}
                                animate={{ scale: 1 }}
                                transition={{ delay: 0.7 + i * 0.1 }}
                              />
                              <text x={node.cx} y={node.cy + 18} textAnchor="middle" fill="hsl(var(--muted-foreground))" fontSize="7">
                                {node.label}
                              </text>
                            </g>
                          ))}
                        </svg>
                      </div>
                    </div>

                    {/* Quick Stats Row */}
                    <div className="grid grid-cols-3 gap-2">
                      {[
                        { label: "Verified Today", value: "1,247", icon: CheckCircle, color: "text-success" },
                        { label: "Sources", value: "47+", icon: Database, color: "text-primary" },
                        { label: "AI Analyses", value: "3.2K", icon: Bot, color: "text-warning" },
                      ].map((stat) => (
                        <div key={stat.label} className="bg-muted/30 rounded-lg p-2 text-center">
                          <stat.icon className={`h-4 w-4 mx-auto mb-1 ${stat.color}`} />
                          <p className="text-sm font-bold text-foreground">{stat.value}</p>
                          <p className="text-xs text-muted-foreground">{stat.label}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Floating AI Chat Card */}
                <motion.div
                  initial={{ opacity: 0, x: 20, y: 20 }}
                  animate={mounted ? { opacity: 1, x: 0, y: 0 } : {}}
                  transition={{ duration: 0.5, delay: 0.8 }}
                  className="absolute -bottom-6 -left-6 z-20 bg-card rounded-xl border border-border shadow-soft-lg p-3 w-56"
                >
                  <div className="flex items-center gap-2 mb-2">
                    <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center">
                      <MessageSquare className="h-4 w-4 text-primary" />
                    </div>
                    <div>
                      <p className="text-xs font-medium">AI Assistant</p>
                      <p className="text-xs text-muted-foreground">Ready to help</p>
                    </div>
                  </div>
                  <div className="bg-muted/50 rounded-lg p-2">
                    <p className="text-xs text-muted-foreground italic">"What sources verify this claim?"</p>
                  </div>
                </motion.div>

                {/* Floating Video Card */}
                <motion.div
                  initial={{ opacity: 0, x: -20, y: -20 }}
                  animate={mounted ? { opacity: 1, x: 0, y: 0 } : {}}
                  transition={{ duration: 0.5, delay: 1 }}
                  className="absolute -top-4 -right-4 z-20 bg-card rounded-xl border border-border shadow-soft-lg p-2 w-44"
                >
                  <div className="relative bg-slate-900 rounded-lg overflow-hidden aspect-video">
                    <div className="absolute inset-0 flex items-center justify-center">
                      <motion.div
                        className="h-10 w-10 rounded-full bg-primary/20 flex items-center justify-center"
                        animate={{ scale: [1, 1.1, 1] }}
                        transition={{ duration: 2, repeat: Infinity }}
                      >
                        <Play className="h-5 w-5 text-primary fill-primary" />
                      </motion.div>
                    </div>
                    <div className="absolute bottom-1 left-1 right-1 flex items-center gap-1">
                      <div className="h-0.5 flex-1 bg-white/20 rounded-full">
                        <motion.div
                          className="h-full bg-primary rounded-full"
                          initial={{ width: "0%" }}
                          animate={{ width: "60%" }}
                          transition={{ duration: 3, repeat: Infinity }}
                        />
                      </div>
                      <span className="text-xs text-white/70">0:45</span>
                    </div>
                  </div>
                  <p className="text-xs font-medium mt-2 text-center">AI News Brief</p>
                </motion.div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Core Value Proposition (Three Columns) */}
      <section id="features" className="py-20 px-4 sm:px-6 lg:px-8 bg-muted/30">
        <div className="max-w-7xl mx-auto">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={staggerContainer}
            className="grid md:grid-cols-3 gap-8"
          >
            {/* Card 1 - Verified News */}
            <motion.div variants={fadeInUp}>
              <Card hover className="h-full">
                <CardContent className="p-6">
                  <div className="h-12 w-12 rounded-xl bg-success/10 flex items-center justify-center mb-4">
                    <CheckCircle className="h-6 w-6 text-success" />
                  </div>
                  <h3 className="text-xl font-semibold text-foreground mb-2">Verified News</h3>
                  <p className="text-muted-foreground mb-6">
                    Confidence scores, source transparency, unbiased insights for every story.
                  </p>
                  {/* Mini mockup */}
                  <div className="bg-muted/50 rounded-lg p-4">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-medium">Breaking Story</span>
                      <Badge className="bg-success/10 text-success border-0 text-xs">92%</Badge>
                    </div>
                    <div className="h-2 bg-muted rounded-full overflow-hidden">
                      <div className="h-full w-[92%] bg-success rounded-full" />
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>

            {/* Card 2 - Deep Research Tools */}
            <motion.div variants={fadeInUp}>
              <Card hover className="h-full">
                <CardContent className="p-6">
                  <div className="h-12 w-12 rounded-xl bg-primary/10 flex items-center justify-center mb-4">
                    <Network className="h-6 w-6 text-primary" />
                  </div>
                  <h3 className="text-xl font-semibold text-foreground mb-2">Deep Research Tools</h3>
                  <p className="text-muted-foreground mb-6">
                    Reports with source-linked visual networks for comprehensive analysis.
                  </p>
                  {/* Mini mockup - Graph visualization */}
                  <div className="bg-muted/50 rounded-lg p-4 h-24 flex items-center justify-center">
                    <svg width="160" height="60" viewBox="0 0 160 60">
                      <circle cx="80" cy="30" r="10" fill="hsl(var(--primary))" />
                      <circle cx="30" cy="15" r="6" fill="hsl(var(--primary))" fillOpacity="0.5" />
                      <circle cx="130" cy="15" r="6" fill="hsl(var(--primary))" fillOpacity="0.5" />
                      <circle cx="30" cy="45" r="6" fill="hsl(var(--primary))" fillOpacity="0.5" />
                      <circle cx="130" cy="45" r="6" fill="hsl(var(--primary))" fillOpacity="0.5" />
                      <line x1="80" y1="30" x2="30" y2="15" stroke="hsl(var(--primary))" strokeWidth="1" strokeOpacity="0.3" />
                      <line x1="80" y1="30" x2="130" y2="15" stroke="hsl(var(--primary))" strokeWidth="1" strokeOpacity="0.3" />
                      <line x1="80" y1="30" x2="30" y2="45" stroke="hsl(var(--primary))" strokeWidth="1" strokeOpacity="0.3" />
                      <line x1="80" y1="30" x2="130" y2="45" stroke="hsl(var(--primary))" strokeWidth="1" strokeOpacity="0.3" />
                    </svg>
                  </div>
                </CardContent>
              </Card>
            </motion.div>

            {/* Card 3 - AI Fact-Check API */}
            <motion.div variants={fadeInUp}>
              <Card hover className="h-full">
                <CardContent className="p-6">
                  <div className="h-12 w-12 rounded-xl bg-warning/10 flex items-center justify-center mb-4">
                    <Code className="h-6 w-6 text-warning" />
                  </div>
                  <h3 className="text-xl font-semibold text-foreground mb-2">AI Fact-Check API</h3>
                  <p className="text-muted-foreground mb-6">
                    Data intelligence for media, apps, and enterprises at scale.
                  </p>
                  {/* Mini mockup - Code snippet */}
                  <div className="bg-slate-900 dark:bg-slate-950 rounded-lg p-3 font-mono text-xs">
                    <span className="text-violet-400">const</span>{" "}
                    <span className="text-blue-300">result</span>{" "}
                    <span className="text-gray-400">=</span>{" "}
                    <span className="text-yellow-300">verify</span>
                    <span className="text-gray-400">(</span>
                    <span className="text-green-300">"claim"</span>
                    <span className="text-gray-400">)</span>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* Feature Highlights - Cards Grid */}
      <section className="py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={fadeInUp}
            className="text-center mb-12"
          >
            <h2 className="text-3xl lg:text-4xl font-bold text-foreground mb-4">
              Powerful Features for{" "}
              <span className="text-gradient">Every User</span>
            </h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              From casual readers to professional researchers, our tools adapt to your needs.
            </p>
          </motion.div>

          {/* Feature Cards Grid */}
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={staggerContainer}
            className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6"
          >
            {featureHighlights.map((feature, index) => (
              <motion.div key={feature.title} variants={fadeInUp}>
                <Card
                  hover
                  className={`h-full transition-all duration-300 ${
                    activeFeature === index ? "border-primary shadow-glow-sm" : ""
                  }`}
                  onClick={() => setActiveFeature(index)}
                >
                  <CardContent className="p-6">
                    <div className={`h-12 w-12 rounded-xl bg-${feature.color}/10 flex items-center justify-center mb-4`}>
                      <feature.icon className={`h-6 w-6 text-${feature.color}`} />
                    </div>
                    <h3 className="text-lg font-semibold text-foreground mb-2">{feature.title}</h3>
                    <p className="text-sm text-muted-foreground">{feature.description}</p>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* Deep Dive Section (For Researchers/Students) */}
      <section id="researchers" className="py-20 px-4 sm:px-6 lg:px-8 bg-muted/30">
        <div className="max-w-7xl mx-auto">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            {/* Left Content */}
            <motion.div
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
              variants={fadeInUp}
            >
              <Badge className="mb-4 bg-primary/10 text-primary border-0">
                <GraduationCap className="h-3.5 w-3.5 mr-2" />
                For Researchers & Students
              </Badge>
              <h2 className="text-3xl lg:text-4xl font-bold text-foreground mb-6">
                Research-Ready Insights{" "}
                <span className="text-gradient">in Seconds</span>
              </h2>

              <div className="space-y-4">
                {[
                  { icon: FileText, text: "Exportable reports in multiple formats" },
                  { icon: BookOpen, text: "Academic formatted citations (APA, MLA, Chicago)" },
                  { icon: Layers, text: "Comprehensive topic repository" },
                  { icon: Network, text: "Visual knowledge networks for complex topics" },
                ].map((item) => (
                  <div key={item.text} className="flex items-center gap-3">
                    <div className="h-8 w-8 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
                      <item.icon className="h-4 w-4 text-primary" />
                    </div>
                    <span className="text-muted-foreground">{item.text}</span>
                  </div>
                ))}
              </div>

              <div className="mt-8">
                <Link href="/research">
                  <Button size="lg">
                    Explore Research Tools
                    <ArrowRight className="h-4 w-4 ml-2" />
                  </Button>
                </Link>
              </div>
            </motion.div>

            {/* Right - Report Preview */}
            <motion.div
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
              variants={scaleIn}
            >
              <Card className="shadow-soft-lg">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between mb-4">
                    <Badge variant="outline">Research Report</Badge>
                    <div className="flex gap-2">
                      <Button variant="ghost" size="sm">
                        <FileText className="h-4 w-4" />
                      </Button>
                      <Button variant="ghost" size="sm">
                        <ExternalLink className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>

                  <h3 className="font-semibold text-lg mb-2">Climate Policy Analysis 2025</h3>
                  <p className="text-sm text-muted-foreground mb-4">
                    Comprehensive analysis of global climate agreements and their implementation status.
                  </p>

                  <div className="space-y-3 mb-4">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-muted-foreground">Sources Analyzed</span>
                      <span className="font-medium">47</span>
                    </div>
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-muted-foreground">Citations Generated</span>
                      <span className="font-medium">32</span>
                    </div>
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-muted-foreground">Confidence Level</span>
                      <Badge className="bg-success/10 text-success border-0">High</Badge>
                    </div>
                  </div>

                  <div className="border-t pt-4">
                    <p className="text-xs text-muted-foreground mb-2">Export Options</p>
                    <div className="flex gap-2">
                      {["PDF", "DOCX", "BibTeX"].map((format) => (
                        <Badge key={format} variant="outline" className="text-xs">
                          {format}
                        </Badge>
                      ))}
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          </div>
        </div>
      </section>

      {/* API Section (Developers Focus) */}
      <section id="api" className="py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            {/* Left - Code Preview */}
            <motion.div
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
              variants={scaleIn}
              className="order-2 lg:order-1"
            >
              <div className="bg-slate-900 dark:bg-slate-950 rounded-xl overflow-hidden shadow-soft-lg">
                <div className="flex items-center gap-2 px-4 py-3 bg-slate-800 dark:bg-slate-900">
                  <div className="flex gap-1.5">
                    <div className="h-3 w-3 rounded-full bg-red-500" />
                    <div className="h-3 w-3 rounded-full bg-yellow-500" />
                    <div className="h-3 w-3 rounded-full bg-green-500" />
                  </div>
                  <span className="text-xs text-slate-400 ml-2">api-example.js</span>
                </div>
                <pre className="p-4 text-sm font-mono overflow-x-auto">
                  <code>
                    <span className="text-violet-400">const</span>{" "}
                    <span className="text-blue-300">ClarifAI</span>{" "}
                    <span className="text-gray-400">=</span>{" "}
                    <span className="text-yellow-300">require</span>
                    <span className="text-gray-400">(</span>
                    <span className="text-green-300">'clarifai-api'</span>
                    <span className="text-gray-400">);</span>
                    {"\n\n"}
                    <span className="text-gray-500">// Verify a claim</span>
                    {"\n"}
                    <span className="text-violet-400">const</span>{" "}
                    <span className="text-blue-300">result</span>{" "}
                    <span className="text-gray-400">=</span>{" "}
                    <span className="text-violet-400">await</span>{" "}
                    <span className="text-blue-300">ClarifAI</span>
                    <span className="text-gray-400">.</span>
                    <span className="text-yellow-300">verify</span>
                    <span className="text-gray-400">({"{"}</span>
                    {"\n"}
                    {"  "}<span className="text-blue-300">claim</span>
                    <span className="text-gray-400">:</span>{" "}
                    <span className="text-green-300">"Global temperatures rose..."</span>
                    <span className="text-gray-400">,</span>
                    {"\n"}
                    {"  "}<span className="text-blue-300">sources</span>
                    <span className="text-gray-400">:</span>{" "}
                    <span className="text-orange-300">true</span>
                    {"\n"}
                    <span className="text-gray-400">{"})"}</span>
                    {"\n\n"}
                    <span className="text-gray-500">// Response</span>
                    {"\n"}
                    <span className="text-gray-400">{"{"}</span>
                    {"\n"}
                    {"  "}<span className="text-blue-300">confidence</span>
                    <span className="text-gray-400">:</span>{" "}
                    <span className="text-orange-300">0.92</span>
                    <span className="text-gray-400">,</span>
                    {"\n"}
                    {"  "}<span className="text-blue-300">verdict</span>
                    <span className="text-gray-400">:</span>{" "}
                    <span className="text-green-300">"verified"</span>
                    <span className="text-gray-400">,</span>
                    {"\n"}
                    {"  "}<span className="text-blue-300">sources</span>
                    <span className="text-gray-400">:</span>{" "}
                    <span className="text-gray-400">[...]</span>
                    {"\n"}
                    <span className="text-gray-400">{"}"}</span>
                  </code>
                </pre>
              </div>
            </motion.div>

            {/* Right Content */}
            <motion.div
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
              variants={fadeInUp}
              className="order-1 lg:order-2"
            >
              <Badge className="mb-4 bg-warning/10 text-warning border-0">
                <Code className="h-3.5 w-3.5 mr-2" />
                Developer API
              </Badge>
              <h2 className="text-3xl lg:text-4xl font-bold text-foreground mb-6">
                Bring Verified Intelligence{" "}
                <span className="text-gradient">Into Your Platform</span>
              </h2>
              <p className="text-lg text-muted-foreground mb-8">
                Integrate powerful fact-checking capabilities into your applications with our comprehensive API.
              </p>

              {/* API Feature Badges */}
              <div className="flex flex-wrap gap-3 mb-8">
                {[
                  { icon: CheckCircle, label: "Fact Verification" },
                  { icon: Newspaper, label: "News Summaries" },
                  { icon: Video, label: "Video Generation" },
                  { icon: Network, label: "Knowledge Graphs" },
                ].map((feature) => (
                  <Badge
                    key={feature.label}
                    variant="outline"
                    className="px-3 py-1.5 text-sm"
                  >
                    <feature.icon className="h-3.5 w-3.5 mr-2" />
                    {feature.label}
                  </Badge>
                ))}
              </div>

              <Button size="lg" className="shadow-glow-sm hover:shadow-glow">
                Request API Access
                <ArrowRight className="h-4 w-4 ml-2" />
              </Button>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section id="pricing" className="py-20 px-4 sm:px-6 lg:px-8 bg-muted/30">
        <div className="max-w-7xl mx-auto">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={fadeInUp}
            className="text-center mb-12"
          >
            <Badge className="mb-4 bg-primary/10 text-primary border-0">
              <Crown className="h-3.5 w-3.5 mr-2" />
              Simple Pricing
            </Badge>
            <h2 className="text-3xl lg:text-4xl font-bold text-foreground mb-4">
              Choose Your Plan
            </h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Start free and scale as you grow. No hidden fees, cancel anytime.
            </p>
          </motion.div>

          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={staggerContainer}
            className="grid md:grid-cols-3 gap-8 items-start"
          >
            {pricingPlans.map((plan) => (
              <motion.div key={plan.name} variants={fadeInUp}>
                <Card
                  className={`h-full relative ${
                    plan.popular
                      ? "border-primary shadow-glow-sm"
                      : ""
                  }`}
                >
                  {plan.popular && (
                    <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                      <Badge className="bg-primary text-primary-foreground">
                        Most Popular
                      </Badge>
                    </div>
                  )}
                  <CardContent className="p-6">
                    <div className="flex items-center gap-3 mb-4">
                      <div className={`h-10 w-10 rounded-lg flex items-center justify-center ${
                        plan.popular ? "bg-primary/10" : "bg-muted"
                      }`}>
                        <plan.icon className={`h-5 w-5 ${plan.popular ? "text-primary" : "text-muted-foreground"}`} />
                      </div>
                      <div>
                        <h3 className="font-semibold text-foreground">{plan.name}</h3>
                        <p className="text-xs text-muted-foreground">{plan.description}</p>
                      </div>
                    </div>

                    <div className="mb-6">
                      <span className="text-4xl font-bold text-foreground">{plan.price}</span>
                      <span className="text-muted-foreground ml-2">/ {plan.period}</span>
                    </div>

                    <Button
                      className={`w-full mb-6 ${
                        plan.popular
                          ? "shadow-glow-sm hover:shadow-glow"
                          : ""
                      }`}
                      variant={plan.popular ? "default" : "outline"}
                    >
                      {plan.cta}
                      <ArrowRight className="h-4 w-4 ml-2" />
                    </Button>

                    <div className="space-y-3">
                      {plan.features.map((feature) => (
                        <div key={feature} className="flex items-start gap-2">
                          <Check className="h-4 w-4 text-success mt-0.5 flex-shrink-0" />
                          <span className="text-sm text-muted-foreground">{feature}</span>
                        </div>
                      ))}
                      {plan.limitations.map((limitation) => (
                        <div key={limitation} className="flex items-start gap-2">
                          <X className="h-4 w-4 text-muted-foreground/50 mt-0.5 flex-shrink-0" />
                          <span className="text-sm text-muted-foreground/50">{limitation}</span>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </motion.div>

          {/* Business Model Note */}
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={fadeInUp}
            className="mt-12 text-center"
          >
            <Card className="max-w-2xl mx-auto bg-gradient-to-br from-violet-50/50 to-transparent dark:from-violet-950/20">
              <CardContent className="p-6">
                <h3 className="font-semibold text-foreground mb-2">Need a Custom Solution?</h3>
                <p className="text-sm text-muted-foreground mb-4">
                  We offer tailored enterprise solutions for news organizations, educational institutions,
                  and large-scale platforms. Get dedicated support, custom integrations, and volume pricing.
                </p>
                <div className="flex flex-wrap justify-center gap-4">
                  <Button variant="outline" size="sm">
                    <Mail className="h-4 w-4 mr-2" />
                    Contact Sales
                  </Button>
                  <Button variant="ghost" size="sm">
                    <FileText className="h-4 w-4 mr-2" />
                    View Documentation
                  </Button>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </div>
      </section>

      {/* Conversion Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={scaleIn}
            className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-violet-600 to-violet-700 dark:from-violet-700 dark:to-violet-800 p-12 text-center"
          >
            {/* Background decoration */}
            <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />
            <div className="absolute bottom-0 left-0 w-48 h-48 bg-white/10 rounded-full blur-3xl translate-y-1/2 -translate-x-1/2" />

            <div className="relative z-10">
              <h2 className="text-3xl lg:text-4xl font-bold text-white mb-4">
                Take Control of What You Know
              </h2>
              <p className="text-lg text-white/80 mb-8 max-w-xl mx-auto">
                Join thousands of users who trust ClarifAI for verified, transparent information.
              </p>

              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Link href="/dashboard">
                  <Button size="lg" className="bg-white text-violet-700 hover:bg-white/90 px-8">
                    Start Free
                    <ArrowRight className="h-4 w-4 ml-2" />
                  </Button>
                </Link>
                <Link href="/anchor">
                  <Button
                    size="lg"
                    variant="outline"
                    className="border-white/30 text-white hover:bg-white/10 px-8"
                  >
                    <Play className="h-4 w-4 mr-2" />
                    Watch Demo
                  </Button>
                </Link>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 px-4 sm:px-6 lg:px-8 border-t border-border bg-muted/20">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-2 md:grid-cols-5 gap-8 mb-12">
            {/* Brand Column */}
            <div className="col-span-2 md:col-span-1">
              <Link href="/" className="flex items-center gap-2 mb-4">
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary">
                  <Shield className="h-4 w-4 text-primary-foreground" />
                </div>
                <span className="font-bold text-lg text-gradient">ClarifAI</span>
              </Link>
              <p className="text-sm text-muted-foreground">
                AI-powered fact verification for a more informed world.
              </p>
            </div>

            {/* Product Links */}
            <div>
              <h4 className="font-semibold text-foreground mb-4">Product</h4>
              <ul className="space-y-2">
                {["Features", "Pricing", "API", "Integrations"].map((item) => (
                  <li key={item}>
                    <Link
                      href={`#${item.toLowerCase()}`}
                      className="text-sm text-muted-foreground hover:text-foreground transition-colors"
                    >
                      {item}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

            {/* Resources Links */}
            <div>
              <h4 className="font-semibold text-foreground mb-4">Resources</h4>
              <ul className="space-y-2">
                {["Documentation", "Blog", "Research", "Case Studies"].map((item) => (
                  <li key={item}>
                    <Link
                      href={`#${item.toLowerCase()}`}
                      className="text-sm text-muted-foreground hover:text-foreground transition-colors"
                    >
                      {item}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

            {/* Company Links */}
            <div>
              <h4 className="font-semibold text-foreground mb-4">Company</h4>
              <ul className="space-y-2">
                {["About", "Careers", "Contact", "Press"].map((item) => (
                  <li key={item}>
                    <Link
                      href={`#${item.toLowerCase()}`}
                      className="text-sm text-muted-foreground hover:text-foreground transition-colors"
                    >
                      {item}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

            {/* Legal Links */}
            <div>
              <h4 className="font-semibold text-foreground mb-4">Legal</h4>
              <ul className="space-y-2">
                {["Privacy Policy", "Terms of Service", "Transparency", "Methodology"].map((item) => (
                  <li key={item}>
                    <Link
                      href={`#${item.toLowerCase().replace(" ", "-")}`}
                      className="text-sm text-muted-foreground hover:text-foreground transition-colors"
                    >
                      {item}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {/* Bottom Bar */}
          <div className="pt-8 border-t border-border flex flex-col sm:flex-row items-center justify-between gap-4">
            <p className="text-sm text-muted-foreground">
              &copy; {new Date().getFullYear()} ClarifAI. All rights reserved.
            </p>

            {/* Social Links */}
            <div className="flex items-center gap-4">
              {[
                { icon: Twitter, href: "#" },
                { icon: Github, href: "#" },
                { icon: Linkedin, href: "#" },
                { icon: Mail, href: "#" },
              ].map((social, i) => (
                <Link
                  key={i}
                  href={social.href}
                  className="h-9 w-9 rounded-full bg-muted flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-accent transition-colors"
                >
                  <social.icon className="h-4 w-4" />
                </Link>
              ))}
            </div>

            {/* Tech Badges */}
            <div className="flex gap-2">
              <Badge variant="outline" className="text-xs">Gemini 2.0</Badge>
              <Badge variant="outline" className="text-xs">Neo4j</Badge>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
