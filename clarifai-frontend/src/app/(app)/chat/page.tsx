"use client";

import { useState, useRef, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import {
  Send,
  Loader2,
  Bot,
  User,
  ExternalLink,
  Sparkles,
  RefreshCw,
  Copy,
  Check,
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

interface Message {
  id: string;
  role: "user" | "assistant";
  content: string;
  sources?: { title: string; url: string; trustScore: number }[];
  timestamp: Date;
}

const suggestedQuestions = [
  "What are the main claims about the Karnataka political crisis?",
  "Is the claim about CM resignation verified?",
  "Compare the different sources reporting on this topic",
  "What do fact-checkers say about this news?",
];

export default function ChatPage() {
  const searchParams = useSearchParams();
  const topic = searchParams.get("topic");

  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  useEffect(() => {
    // Add welcome message
    if (messages.length === 0) {
      const welcomeMessage: Message = {
        id: "welcome",
        role: "assistant",
        content: topic
          ? `I'm ready to help you explore "${decodeURIComponent(topic)}". I have access to multiple verified sources and fact-checking databases. What would you like to know?`
          : "Hello! I'm ClarifAI's intelligent assistant. I can help you verify claims, explore news topics, and provide fact-checked information with source citations. What would you like to know?",
        timestamp: new Date(),
      };
      setMessages([welcomeMessage]);
    }
  }, [topic]);

  const handleSend = async () => {
    if (!input.trim() || isLoading) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      role: "user",
      content: input,
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInput("");
    setIsLoading(true);

    // Simulate AI response
    await new Promise((resolve) => setTimeout(resolve, 1500));

    const assistantMessage: Message = {
      id: (Date.now() + 1).toString(),
      role: "assistant",
      content: generateResponse(input),
      sources: [
        { title: "Times of India", url: "#", trustScore: 94 },
        { title: "NDTV", url: "#", trustScore: 87 },
        { title: "Hindustan Times", url: "#", trustScore: 82 },
      ],
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, assistantMessage]);
    setIsLoading(false);
  };

  const generateResponse = (query: string): string => {
    // Simulated responses based on query patterns
    if (query.toLowerCase().includes("verified") || query.toLowerCase().includes("true")) {
      return "Based on cross-referencing 12 sources, I found that this claim has been **partially verified**. While the core assertion appears accurate according to Times of India and NDTV, some details reported by other outlets could not be independently confirmed.\n\n**Key findings:**\n- Primary claim: Verified by 8/12 sources\n- Secondary details: Only 4/12 sources agree\n- Contradictory information found in 2 sources\n\nI recommend treating this information as likely accurate but awaiting official confirmation.";
    }
    if (query.toLowerCase().includes("sources") || query.toLowerCase().includes("compare")) {
      return "Here's a comparison of how different sources are reporting on this topic:\n\n**Times of India (Trust: 94%)**\nReports the primary facts with official quotes. No speculative content.\n\n**NDTV (Trust: 87%)**\nProvides additional context but includes some unverified claims from anonymous sources.\n\n**Hindustan Times (Trust: 82%)**\nFocuses on political implications with balanced coverage.\n\nThe consensus among high-trust sources supports the core narrative, though specific details vary.";
    }
    return `I've analyzed your question about "${query}" using our fact-checking database and multiple verified sources.\n\n**Summary:**\nThis topic has been covered by 15 sources with varying degrees of accuracy. The verified facts indicate that the core claims are accurate, though some peripheral details remain unconfirmed.\n\n**Confidence Level:** 78%\n\nWould you like me to dive deeper into any specific aspect of this topic?`;
  };

  const handleCopy = (id: string, content: string) => {
    navigator.clipboard.writeText(content);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <div className="h-[calc(100vh-7rem)] flex flex-col animate-fade-in">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div>
          <h1 className="text-2xl font-semibold text-foreground">AI Chat</h1>
          <p className="text-muted-foreground mt-1">
            Ask questions and get fact-checked answers with source citations
          </p>
        </div>
        <Button
          variant="outline"
          size="sm"
          onClick={() => setMessages([])}
          className="hidden sm:flex"
        >
          <RefreshCw className="h-4 w-4 mr-1" />
          New Chat
        </Button>
      </div>

      {/* Chat Container */}
      <Card className="flex-1 flex flex-col overflow-hidden">
        {/* Messages */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {messages.map((message) => (
            <div
              key={message.id}
              className={cn(
                "flex gap-3 max-w-3xl",
                message.role === "user" ? "ml-auto flex-row-reverse" : ""
              )}
            >
              <div
                className={cn(
                  "flex h-8 w-8 shrink-0 items-center justify-center rounded-full",
                  message.role === "user"
                    ? "bg-primary text-primary-foreground"
                    : "bg-violet-100 dark:bg-violet-900 text-violet-600 dark:text-violet-300"
                )}
              >
                {message.role === "user" ? (
                  <User className="h-4 w-4" />
                ) : (
                  <Bot className="h-4 w-4" />
                )}
              </div>
              <div
                className={cn(
                  "flex-1 rounded-lg p-4",
                  message.role === "user"
                    ? "bg-primary text-primary-foreground"
                    : "bg-muted"
                )}
              >
                <div
                  className={cn(
                    "prose prose-sm max-w-none",
                    message.role === "user" && "prose-invert"
                  )}
                >
                  {message.content.split("\n").map((line, i) => (
                    <p key={i} className="mb-2 last:mb-0">
                      {line.split("**").map((part, j) =>
                        j % 2 === 1 ? <strong key={j}>{part}</strong> : part
                      )}
                    </p>
                  ))}
                </div>

                {/* Sources */}
                {message.sources && message.sources.length > 0 && (
                  <div className="mt-4 pt-3 border-t border-border/50">
                    <p className="text-xs text-muted-foreground mb-2">Sources:</p>
                    <div className="flex flex-wrap gap-2">
                      {message.sources.map((source, i) => (
                        <Badge
                          key={i}
                          variant="outline"
                          className="text-xs cursor-pointer hover:bg-accent"
                        >
                          {source.title}
                          <span className="ml-1 text-success">{source.trustScore}%</span>
                          <ExternalLink className="h-2.5 w-2.5 ml-1" />
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}

                {/* Copy button for assistant messages */}
                {message.role === "assistant" && message.id !== "welcome" && (
                  <button
                    onClick={() => handleCopy(message.id, message.content)}
                    className="mt-2 text-xs text-muted-foreground hover:text-foreground flex items-center gap-1"
                  >
                    {copiedId === message.id ? (
                      <>
                        <Check className="h-3 w-3" />
                        Copied
                      </>
                    ) : (
                      <>
                        <Copy className="h-3 w-3" />
                        Copy
                      </>
                    )}
                  </button>
                )}
              </div>
            </div>
          ))}

          {isLoading && (
            <div className="flex gap-3 max-w-3xl">
              <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-violet-100 dark:bg-violet-900 text-violet-600 dark:text-violet-300">
                <Bot className="h-4 w-4" />
              </div>
              <div className="flex-1 rounded-lg p-4 bg-muted">
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Analyzing sources and generating response...
                </div>
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* Suggested Questions */}
        {messages.length <= 1 && (
          <div className="p-4 border-t border-border">
            <p className="text-xs text-muted-foreground mb-2">Suggested questions:</p>
            <div className="flex flex-wrap gap-2">
              {suggestedQuestions.map((question, i) => (
                <button
                  key={i}
                  onClick={() => setInput(question)}
                  className="px-3 py-1.5 rounded-lg bg-muted text-xs hover:bg-accent transition-colors"
                >
                  {question}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Input */}
        <div className="p-4 border-t border-border">
          <div className="flex gap-2">
            <div className="relative flex-1">
              <textarea
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="Ask a question about any news topic..."
                rows={1}
                className="w-full min-h-[44px] max-h-32 px-4 py-3 rounded-lg border border-border bg-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent resize-none"
              />
            </div>
            <Button
              onClick={handleSend}
              disabled={isLoading || !input.trim()}
              className="shrink-0"
            >
              {isLoading ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Send className="h-4 w-4" />
              )}
            </Button>
          </div>
          <p className="text-xs text-muted-foreground mt-2 text-center">
            <Sparkles className="h-3 w-3 inline mr-1" />
            Powered by ClarifAI RAG Engine with real-time fact-checking
          </p>
        </div>
      </Card>
    </div>
  );
}
