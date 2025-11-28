"use client";

import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Shield,
  Search,
  CheckCircle,
  ArrowRight,
  Network,
  Video,
  MessageSquare,
  Newspaper,
} from "lucide-react";
import Link from "next/link";
import { useEffect, useState } from "react";

const features = [
  {
    icon: Newspaper,
    title: "Fact-Checked News",
    description: "Real-time verification of news stories with confidence scores",
  },
  {
    icon: Network,
    title: "Knowledge Graphs",
    description: "Visual story maps showing how information connects",
  },
  {
    icon: Search,
    title: "Smart Search",
    description: "Search any topic and get verified, sourced results",
  },
  {
    icon: MessageSquare,
    title: "AI Chat",
    description: "Ask questions and get answers with source citations",
  },
  {
    icon: Video,
    title: "AI Anchor",
    description: "Generate professional video briefings instantly",
  },
  {
    icon: CheckCircle,
    title: "Source Verification",
    description: "Track credibility scores across 47+ news sources",
  },
];

function AnimatedCounter({ target }: { target: number }) {
  const [count, setCount] = useState(0);

  useEffect(() => {
    const duration = 1500;
    const steps = 40;
    const increment = target / steps;
    let current = 0;

    const timer = setInterval(() => {
      current += increment;
      if (current >= target) {
        setCount(target);
        clearInterval(timer);
      } else {
        setCount(Math.floor(current));
      }
    }, duration / steps);

    return () => clearInterval(timer);
  }, [target]);

  return <span>{count.toLocaleString()}</span>;
}

export default function LandingPage() {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 z-50 border-b border-border bg-background/80 backdrop-blur-sm">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary">
              <Shield className="h-4 w-4 text-primary-foreground" />
            </div>
            <span className="font-semibold text-lg text-gradient">ClarifAI</span>
          </Link>
          <div className="flex items-center gap-3">
            <Link href="/dashboard">
              <Button>
                Open App
                <ArrowRight className="h-4 w-4 ml-1" />
              </Button>
            </Link>
          </div>
        </div>
      </header>

      {/* Hero */}
      <section className="py-20 px-4 sm:px-6">
        <div className="max-w-4xl mx-auto text-center">
          <Badge className="mb-6 bg-primary/10 text-primary border-0">
            <span className="relative flex h-2 w-2 mr-2">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-primary opacity-75" />
              <span className="relative inline-flex h-2 w-2 rounded-full bg-primary" />
            </span>
            Live: Monitoring 47 sources
          </Badge>

          <h1
            className={`text-4xl sm:text-5xl lg:text-6xl font-bold text-foreground leading-tight mb-6 transition-all duration-500 ${
              mounted ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"
            }`}
          >
            Truth in the Age of{" "}
            <span className="text-gradient">Misinformation</span>
          </h1>

          <p
            className={`text-lg text-muted-foreground max-w-2xl mx-auto mb-10 transition-all duration-500 delay-100 ${
              mounted ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"
            }`}
          >
            AI-powered fact-checking platform that verifies claims, visualizes information
            through knowledge graphs, and delivers verified news through an AI anchor.
          </p>

          <div
            className={`flex flex-col sm:flex-row gap-4 justify-center transition-all duration-500 delay-200 ${
              mounted ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"
            }`}
          >
            <Link href="/dashboard">
              <Button size="lg" className="px-8">
                Get Started
                <ArrowRight className="h-4 w-4 ml-2" />
              </Button>
            </Link>
            <Link href="/anchor">
              <Button size="lg" variant="outline" className="px-8">
                <Video className="h-4 w-4 mr-2" />
                Watch Demo
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Stats */}
      <section className="py-12 px-4 sm:px-6 border-y border-border bg-muted/30">
        <div className="max-w-4xl mx-auto">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {[
              { value: 12847, label: "Claims Analyzed" },
              { value: 89, label: "Accuracy Rate", suffix: "%" },
              { value: 47, label: "Sources Tracked" },
              { value: 156, label: "Topics Monitored" },
            ].map((stat) => (
              <div key={stat.label} className="text-center">
                <p className="text-3xl font-bold text-foreground">
                  {mounted ? <AnimatedCounter target={stat.value} /> : 0}
                  {stat.suffix && <span className="text-primary">{stat.suffix}</span>}
                </p>
                <p className="text-sm text-muted-foreground mt-1">{stat.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="py-20 px-4 sm:px-6">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-foreground mb-4">
              Everything you need to fight misinformation
            </h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              A comprehensive toolkit for verifying information and understanding the full story
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {features.map((feature) => (
              <div
                key={feature.title}
                className="p-6 rounded-lg border border-border bg-card hover:border-primary/30 hover:shadow-soft transition-all"
              >
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 mb-4">
                  <feature.icon className="h-5 w-5 text-primary" />
                </div>
                <h3 className="font-semibold text-foreground mb-2">{feature.title}</h3>
                <p className="text-sm text-muted-foreground">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 px-4 sm:px-6">
        <div className="max-w-3xl mx-auto text-center">
          <div className="p-8 rounded-2xl bg-gradient-to-br from-violet-50 to-white dark:from-violet-950/30 dark:to-background border border-violet-200 dark:border-violet-800">
            <h2 className="text-2xl font-bold text-foreground mb-4">
              Ready to see through misinformation?
            </h2>
            <p className="text-muted-foreground mb-6">
              Start exploring fact-checked news and generate your own AI-powered briefings.
            </p>
            <Link href="/dashboard">
              <Button size="lg">
                Open Dashboard
                <ArrowRight className="h-4 w-4 ml-2" />
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-8 px-4 sm:px-6 border-t border-border">
        <div className="max-w-6xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <div className="flex h-6 w-6 items-center justify-center rounded bg-primary">
              <Shield className="h-3 w-3 text-primary-foreground" />
            </div>
            <span className="font-medium text-gradient">ClarifAI</span>
          </div>
          <p className="text-sm text-muted-foreground">
            Built for MumbaiHacks 2025 · Track 3: Misinformation Detection
          </p>
          <div className="flex gap-3">
            <Badge variant="outline" className="text-xs">Gemini 2.0</Badge>
            <Badge variant="outline" className="text-xs">Neo4j</Badge>
          </div>
        </div>
      </footer>
    </div>
  );
}
