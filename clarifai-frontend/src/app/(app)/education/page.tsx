"use client";

import { useState, useCallback, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useTheme } from "next-themes";
import { cn } from "@/lib/utils";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { TopicInput, FlashcardDeck, StudyGuidePreview } from "@/components/education";
import {
  generateFlashcards,
  generateStudyGuide,
  getStudyGuideDownloadUrl,
  streamFlashcardGeneration,
  type Flashcard,
  type FlashcardDeckResponse,
  type StudyGuideResponse,
  type FlashcardSource,
} from "@/lib/api";
import {
  GraduationCap,
  BookOpen,
  Layers,
  Download,
  FileText,
  Sparkles,
  AlertCircle,
  Loader2,
  Sun,
  Moon,
  RefreshCw,
  CheckCircle2,
  Brain,
  Target,
  Clock,
  TrendingUp,
} from "lucide-react";

type ViewMode = "input" | "flashcards" | "study-guide" | "both";

export default function EducationPage() {
  const [viewMode, setViewMode] = useState<ViewMode>("input");
  const [isLoading, setIsLoading] = useState(false);
  const [isStreaming, setIsStreaming] = useState(false);
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState<string | null>(null);

  // Data state
  const [currentTopic, setCurrentTopic] = useState("");
  const [flashcards, setFlashcards] = useState<Flashcard[]>([]);
  const [deckInfo, setDeckInfo] = useState<{
    deck_id: string;
    description: string;
    difficulty: string;
  } | null>(null);
  const [studyTips, setStudyTips] = useState<string[]>([]);
  const [sources, setSources] = useState<FlashcardSource[]>([]);
  const [studyGuide, setStudyGuide] = useState<StudyGuideResponse | null>(null);
  const [isGeneratingGuide, setIsGeneratingGuide] = useState(false);

  const cleanupRef = useRef<(() => void) | null>(null);
  const { resolvedTheme, setTheme } = useTheme();
  const isDark = resolvedTheme === "dark";

  const handleGenerateFlashcards = useCallback(
    async (topic: string, numCards: number, difficulty: string) => {
      // Reset state
      setFlashcards([]);
      setDeckInfo(null);
      setStudyTips([]);
      setSources([]);
      setStudyGuide(null);
      setError(null);
      setProgress(0);
      setIsLoading(true);
      setIsStreaming(true);
      setCurrentTopic(topic);
      setViewMode("flashcards");

      // Cleanup previous stream
      if (cleanupRef.current) {
        cleanupRef.current();
      }

      const cleanup = streamFlashcardGeneration(
        topic,
        numCards,
        difficulty,
        // On metadata
        (meta) => {
          setDeckInfo({
            deck_id: meta.deck_id,
            description: meta.description,
            difficulty: meta.difficulty,
          });
          setIsLoading(false);
        },
        // On flashcard
        ({ card, progress: p }) => {
          setFlashcards((prev) => [...prev, card]);
          setProgress(p);
        },
        // On tips
        (tips) => {
          setStudyTips(tips);
        },
        // On sources
        (sourcesData) => {
          setSources(sourcesData);
        },
        // On complete
        () => {
          setIsStreaming(false);
        },
        // On error
        (err) => {
          setError(err);
          setIsLoading(false);
          setIsStreaming(false);
        }
      );

      cleanupRef.current = cleanup;
    },
    []
  );

  const handleGenerateStudyGuide = useCallback(async () => {
    if (!currentTopic || flashcards.length === 0) return;

    setIsGeneratingGuide(true);
    setError(null);

    try {
      const guide = await generateStudyGuide(currentTopic, flashcards, true);
      setStudyGuide(guide);
      setViewMode("both");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to generate study guide");
    } finally {
      setIsGeneratingGuide(false);
    }
  }, [currentTopic, flashcards]);

  const handleDownloadStudyGuide = () => {
    if (!currentTopic) return;
    const url = getStudyGuideDownloadUrl(currentTopic);
    window.open(url, "_blank");
  };

  const handleReset = () => {
    if (cleanupRef.current) {
      cleanupRef.current();
    }
    setFlashcards([]);
    setDeckInfo(null);
    setStudyTips([]);
    setSources([]);
    setStudyGuide(null);
    setError(null);
    setProgress(0);
    setIsLoading(false);
    setIsStreaming(false);
    setCurrentTopic("");
    setViewMode("input");
  };

  const toggleTheme = () => {
    setTheme(isDark ? "light" : "dark");
  };

  const statsCards = [
    {
      icon: Layers,
      label: "Flashcards",
      value: flashcards.length,
      color: "blue",
    },
    {
      icon: CheckCircle2,
      label: "Fact-Checked",
      value: flashcards.filter((c) => c.fact_checked).length,
      color: "emerald",
    },
    {
      icon: Target,
      label: "Categories",
      value: [...new Set(flashcards.map((c) => c.category))].length,
      color: "purple",
    },
    {
      icon: TrendingUp,
      label: "Sources",
      value: sources.length,
      color: "yellow",
    },
  ];

  return (
    <div
      className={cn(
        "min-h-screen p-6",
        isDark
          ? "bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950"
          : "bg-gradient-to-br from-slate-50 via-white to-slate-100"
      )}
    >
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-7xl mx-auto mb-6"
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div
              className={cn(
                "p-3 rounded-xl",
                isDark
                  ? "bg-gradient-to-br from-emerald-500/20 to-teal-500/20"
                  : "bg-gradient-to-br from-emerald-100 to-teal-100"
              )}
            >
              <GraduationCap
                className={cn(
                  "w-8 h-8",
                  isDark ? "text-emerald-400" : "text-emerald-600"
                )}
              />
            </div>
            <div>
              <h1
                className={cn(
                  "text-2xl font-bold",
                  isDark ? "text-white" : "text-slate-900"
                )}
              >
                Education Hub
              </h1>
              <p
                className={cn(
                  "text-sm",
                  isDark ? "text-white/60" : "text-slate-600"
                )}
              >
                Generate fact-checked flashcards and study guides for any topic
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
              {isDark ? (
                <Sun className="w-4 h-4" />
              ) : (
                <Moon className="w-4 h-4" />
              )}
            </Button>

            {(isStreaming || flashcards.length > 0) && (
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
                  {isLoading
                    ? "Initializing..."
                    : isStreaming
                    ? `${Math.round(progress)}%`
                    : "Complete"}
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
                  New Topic
                </Button>
              </>
            )}
          </div>
        </div>
      </motion.div>

      {/* Error Alert */}
      {error && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="max-w-7xl mx-auto mb-6"
        >
          <div className="flex items-center gap-2 text-red-500 bg-red-500/10 p-4 rounded-lg border border-red-500/20">
            <AlertCircle className="w-5 h-5 flex-shrink-0" />
            <span>{error}</span>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setError(null)}
              className="ml-auto text-red-400 hover:text-red-300"
            >
              Dismiss
            </Button>
          </div>
        </motion.div>
      )}

      {/* Main Content */}
      <div className="max-w-7xl mx-auto">
        <AnimatePresence mode="wait">
          {viewMode === "input" && (
            <motion.div
              key="input"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
            >
              <TopicInput
                onSubmit={handleGenerateFlashcards}
                isLoading={isLoading || isStreaming}
              />

              {/* Features Info */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-4"
              >
                {[
                  {
                    icon: Brain,
                    title: "AI-Powered Generation",
                    description:
                      "Our AI creates comprehensive flashcards based on verified sources and fact-checked information.",
                  },
                  {
                    icon: CheckCircle2,
                    title: "Fact-Checked Content",
                    description:
                      "Every flashcard is linked to reliable sources with confidence ratings for accuracy.",
                  },
                  {
                    icon: FileText,
                    title: "Downloadable Guides",
                    description:
                      "Export your flashcards and study materials as clean, printable markdown documents.",
                  },
                ].map((feature) => (
                  <Card
                    key={feature.title}
                    className={cn(
                      "border",
                      isDark
                        ? "bg-white/5 border-white/10"
                        : "bg-white border-slate-200"
                    )}
                  >
                    <CardContent className="p-6">
                      <div
                        className={cn(
                          "w-10 h-10 rounded-lg flex items-center justify-center mb-4",
                          isDark ? "bg-emerald-500/20" : "bg-emerald-100"
                        )}
                      >
                        <feature.icon
                          className={cn(
                            "w-5 h-5",
                            isDark ? "text-emerald-400" : "text-emerald-600"
                          )}
                        />
                      </div>
                      <h3
                        className={cn(
                          "font-semibold mb-2",
                          isDark ? "text-white" : "text-slate-900"
                        )}
                      >
                        {feature.title}
                      </h3>
                      <p
                        className={cn(
                          "text-sm",
                          isDark ? "text-white/60" : "text-slate-600"
                        )}
                      >
                        {feature.description}
                      </p>
                    </CardContent>
                  </Card>
                ))}
              </motion.div>
            </motion.div>
          )}

          {(viewMode === "flashcards" || viewMode === "both") &&
            flashcards.length > 0 && (
              <motion.div
                key="flashcards"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
              >
                {/* Topic Header */}
                <Card
                  className={cn(
                    "mb-6 border",
                    isDark
                      ? "bg-gradient-to-r from-emerald-500/10 to-teal-500/10 border-emerald-500/20"
                      : "bg-gradient-to-r from-emerald-50 to-teal-50 border-emerald-200"
                  )}
                >
                  <CardContent className="p-6">
                    <div className="flex items-start justify-between">
                      <div className="flex items-start gap-4">
                        <div
                          className={cn(
                            "p-2 rounded-lg",
                            isDark ? "bg-emerald-500/20" : "bg-emerald-100"
                          )}
                        >
                          <BookOpen
                            className={cn(
                              "w-5 h-5",
                              isDark ? "text-emerald-400" : "text-emerald-600"
                            )}
                          />
                        </div>
                        <div>
                          <h3
                            className={cn(
                              "font-semibold mb-1",
                              isDark ? "text-white" : "text-slate-900"
                            )}
                          >
                            {currentTopic}
                          </h3>
                          <p
                            className={cn(
                              "text-sm",
                              isDark ? "text-white/70" : "text-slate-600"
                            )}
                          >
                            {deckInfo?.description || "Loading..."}
                          </p>
                          {deckInfo?.difficulty && (
                            <Badge
                              variant="secondary"
                              className="mt-2 capitalize"
                            >
                              {deckInfo.difficulty} Level
                            </Badge>
                          )}
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        {!studyGuide && !isStreaming && (
                          <Button
                            onClick={handleGenerateStudyGuide}
                            disabled={isGeneratingGuide}
                            className="bg-gradient-to-r from-purple-500 to-blue-500 text-white hover:from-purple-600 hover:to-blue-600"
                          >
                            {isGeneratingGuide ? (
                              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                            ) : (
                              <FileText className="w-4 h-4 mr-2" />
                            )}
                            Generate Study Guide
                          </Button>
                        )}
                        <Button
                          onClick={handleDownloadStudyGuide}
                          className="bg-gradient-to-r from-emerald-500 to-teal-500 text-white hover:from-emerald-600 hover:to-teal-600"
                        >
                          <Download className="w-4 h-4 mr-2" />
                          Download All
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Stats Cards */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                  {statsCards.map((stat) => (
                    <Card
                      key={stat.label}
                      className={cn(
                        "border",
                        isDark
                          ? "bg-white/5 border-white/10"
                          : "bg-white border-slate-200"
                      )}
                    >
                      <CardContent className="p-4 flex items-center gap-3">
                        <div
                          className={cn(
                            "p-2 rounded-lg",
                            isDark
                              ? `bg-${stat.color}-500/20`
                              : `bg-${stat.color}-100`,
                            stat.color === "blue" &&
                              (isDark ? "bg-blue-500/20" : "bg-blue-100"),
                            stat.color === "emerald" &&
                              (isDark ? "bg-emerald-500/20" : "bg-emerald-100"),
                            stat.color === "purple" &&
                              (isDark ? "bg-purple-500/20" : "bg-purple-100"),
                            stat.color === "yellow" &&
                              (isDark ? "bg-yellow-500/20" : "bg-yellow-100")
                          )}
                        >
                          <stat.icon
                            className={cn(
                              "w-5 h-5",
                              stat.color === "blue" &&
                                (isDark ? "text-blue-400" : "text-blue-600"),
                              stat.color === "emerald" &&
                                (isDark
                                  ? "text-emerald-400"
                                  : "text-emerald-600"),
                              stat.color === "purple" &&
                                (isDark
                                  ? "text-purple-400"
                                  : "text-purple-600"),
                              stat.color === "yellow" &&
                                (isDark ? "text-yellow-400" : "text-yellow-600")
                            )}
                          />
                        </div>
                        <div>
                          <p
                            className={cn(
                              "text-2xl font-bold",
                              isDark ? "text-white" : "text-slate-900"
                            )}
                          >
                            {stat.value}
                          </p>
                          <p
                            className={cn(
                              "text-xs",
                              isDark ? "text-white/60" : "text-slate-600"
                            )}
                          >
                            {stat.label}
                          </p>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>

                {/* Main Content Grid */}
                <div
                  className={cn(
                    "grid gap-6",
                    viewMode === "both"
                      ? "grid-cols-1 lg:grid-cols-2"
                      : "grid-cols-1"
                  )}
                >
                  {/* Flashcard Deck */}
                  <Card
                    className={cn(
                      "border",
                      isDark
                        ? "bg-white/5 border-white/10"
                        : "bg-white border-slate-200"
                    )}
                  >
                    <CardHeader
                      className={cn(
                        "border-b",
                        isDark ? "border-white/10" : "border-slate-200"
                      )}
                    >
                      <CardTitle
                        className={cn(
                          "text-lg flex items-center gap-2",
                          isDark ? "text-white" : "text-slate-900"
                        )}
                      >
                        <Layers className="w-5 h-5" />
                        Flashcards
                        {isStreaming && (
                          <Badge variant="secondary" className="ml-2">
                            <Loader2 className="w-3 h-3 mr-1 animate-spin" />
                            Generating...
                          </Badge>
                        )}
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="p-6">
                      <FlashcardDeck
                        cards={flashcards}
                        topic={currentTopic}
                        sources={sources}
                        studyTips={studyTips}
                      />
                    </CardContent>
                  </Card>

                  {/* Study Guide */}
                  {studyGuide && (
                    <Card
                      className={cn(
                        "border",
                        isDark
                          ? "bg-white/5 border-white/10"
                          : "bg-white border-slate-200"
                      )}
                    >
                      <CardHeader
                        className={cn(
                          "border-b",
                          isDark ? "border-white/10" : "border-slate-200"
                        )}
                      >
                        <CardTitle
                          className={cn(
                            "text-lg flex items-center gap-2",
                            isDark ? "text-white" : "text-slate-900"
                          )}
                        >
                          <FileText className="w-5 h-5" />
                          Study Guide
                        </CardTitle>
                      </CardHeader>
                      <CardContent className="p-6 max-h-[800px] overflow-y-auto">
                        <StudyGuidePreview
                          guide={studyGuide}
                          flashcards={flashcards}
                          onDownload={handleDownloadStudyGuide}
                        />
                      </CardContent>
                    </Card>
                  )}
                </div>
              </motion.div>
            )}
        </AnimatePresence>
      </div>
    </div>
  );
}
