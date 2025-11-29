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

// Demo flashcards for current affairs topics
const DEMO_FLASHCARDS: Record<string, { cards: Flashcard[]; description: string; tips: string[]; sources: FlashcardSource[] }> = {
  default: {
    description: "Stay informed about India's latest developments, policies, and current affairs with fact-checked flashcards.",
    tips: [
      "Review current affairs daily for better retention",
      "Connect news events to their broader context",
      "Follow multiple sources to get balanced perspectives",
      "Use these flashcards before reading daily newspapers"
    ],
    sources: [
      { title: "Press Information Bureau", url: "https://pib.gov.in", reliability: "HIGH" },
      { title: "The Hindu", url: "https://thehindu.com", reliability: "HIGH" },
      { title: "Times of India", url: "https://timesofindia.com", reliability: "MEDIUM" }
    ],
    cards: [
      {
        id: "card_1",
        front: "What is the Mumbai Coastal Road Project?",
        back: "The Mumbai Coastal Road is an 8-lane freeway connecting Marine Drive to Kandivali along Mumbai's western coastline. It's India's first undersea tunnel project, spanning 10.58 km with a 2.07 km twin tunnel under the Arabian Sea.",
        category: "Infrastructure",
        difficulty: 2,
        source: "BMC",
        fact_checked: true,
        explanation: "The project aims to reduce travel time from South Mumbai to the Western Suburbs from 2 hours to just 40 minutes.",
        tags: ["mumbai", "infrastructure", "transport"]
      },
      {
        id: "card_2",
        front: "What is India's Digital Personal Data Protection Act 2023?",
        back: "The DPDP Act 2023 is India's first comprehensive data protection law. It establishes rules for processing personal data, gives citizens rights over their data, and mandates consent requirements for data collection.",
        category: "Policy & Law",
        difficulty: 3,
        source: "Ministry of Electronics & IT",
        fact_checked: true,
        explanation: "The Act applies to digital personal data processed within India and also covers data processed outside India if related to offering goods/services in India.",
        tags: ["digital", "privacy", "legislation"]
      },
      {
        id: "card_3",
        front: "What is the Unified Pension Scheme (UPS) announced in 2024?",
        back: "UPS is a new pension scheme for central government employees offering 50% of average basic pay as pension after 25 years of service, with inflation indexation, family pension at 60%, and a minimum pension of Rs 10,000.",
        category: "Economy",
        difficulty: 2,
        source: "Ministry of Finance",
        fact_checked: true,
        explanation: "UPS aims to provide assured pension benefits while maintaining fiscal sustainability, addressing concerns raised about NPS.",
        tags: ["pension", "government", "policy"]
      },
      {
        id: "card_4",
        front: "What is the Mumbai Trans Harbour Link (MTHL)?",
        back: "MTHL, also called Atal Setu, is India's longest sea bridge at 21.8 km connecting Mumbai to Navi Mumbai. It reduces travel time from Sewri to Chirle from 2 hours to just 20 minutes.",
        category: "Infrastructure",
        difficulty: 1,
        source: "MMRDA",
        fact_checked: true,
        explanation: "Named after former PM Atal Bihari Vajpayee, it was inaugurated in January 2024 after years of construction.",
        tags: ["mumbai", "bridge", "transport"]
      },
      {
        id: "card_5",
        front: "What is India's Chandrayaan-3 mission achievement?",
        back: "Chandrayaan-3 successfully soft-landed on the Moon's south pole on August 23, 2023, making India the first country to land near the lunar south pole and the fourth nation to achieve a soft landing on the Moon.",
        category: "Science & Tech",
        difficulty: 1,
        source: "ISRO",
        fact_checked: true,
        explanation: "The Vikram lander and Pragyan rover conducted experiments for 14 days, discovering sulfur and other elements on the lunar surface.",
        tags: ["isro", "space", "moon"]
      },
      {
        id: "card_6",
        front: "What is Maharashtra's Ladki Bahin Yojana?",
        back: "Ladki Bahin Yojana is a welfare scheme providing Rs 1,500 monthly financial assistance to women aged 21-65 from families with annual income below Rs 2.5 lakh, aimed at women's empowerment.",
        category: "Welfare Schemes",
        difficulty: 2,
        source: "Maharashtra Government",
        fact_checked: true,
        explanation: "The scheme was launched in 2024 and is expected to benefit over 2 crore women across Maharashtra.",
        tags: ["maharashtra", "women", "welfare"]
      },
      {
        id: "card_7",
        front: "What is India's current GDP growth rate and economic ranking?",
        back: "India is the world's 5th largest economy with a GDP of approximately $3.5 trillion. In FY 2023-24, India's GDP growth rate was around 8.2%, making it one of the fastest-growing major economies.",
        category: "Economy",
        difficulty: 2,
        source: "Ministry of Finance",
        fact_checked: true,
        explanation: "India is projected to become the 3rd largest economy by 2027, surpassing Japan and Germany.",
        tags: ["gdp", "economy", "growth"]
      },
      {
        id: "card_8",
        front: "What is the PM Surya Ghar Muft Bijli Yojana?",
        back: "PM Surya Ghar is a rooftop solar scheme aiming to install solar panels on 1 crore households, providing up to 300 units of free electricity monthly. The government provides subsidies up to Rs 78,000 for installation.",
        category: "Energy",
        difficulty: 2,
        source: "Ministry of New & Renewable Energy",
        fact_checked: true,
        explanation: "Launched in 2024 with a budget of Rs 75,021 crore, the scheme promotes clean energy adoption at household level.",
        tags: ["solar", "energy", "subsidy"]
      },
      {
        id: "card_9",
        front: "What is India's semiconductor mission?",
        back: "India Semiconductor Mission (ISM) is a Rs 76,000 crore initiative to build a semiconductor and display manufacturing ecosystem in India. Major projects include Tata's fab in Gujarat and Micron's facility in Gujarat.",
        category: "Industry",
        difficulty: 3,
        source: "MeitY",
        fact_checked: true,
        explanation: "The mission aims to make India a global hub for electronics manufacturing and reduce import dependence on chips.",
        tags: ["semiconductor", "manufacturing", "technology"]
      },
      {
        id: "card_10",
        front: "What is the new criminal law reform in India (2024)?",
        back: "Three new criminal laws replaced colonial-era codes from July 2024: Bharatiya Nyaya Sanhita (replaces IPC), Bharatiya Nagarik Suraksha Sanhita (replaces CrPC), and Bharatiya Sakshya Adhiniyam (replaces Indian Evidence Act).",
        category: "Policy & Law",
        difficulty: 3,
        source: "Ministry of Home Affairs",
        fact_checked: true,
        explanation: "These laws introduce modern provisions like video trials, zero FIR, and increased use of forensic evidence.",
        tags: ["law", "criminal", "reform"]
      }
    ]
  }
};

// Demo study guide
const DEMO_STUDY_GUIDE: StudyGuideResponse = {
  guide_id: "demo-guide-1",
  title: "Study Guide: India Current Affairs",
  topic: "India Current Affairs",
  overview: "India is undergoing rapid transformation across infrastructure, technology, economy, and governance. From ambitious projects like the Mumbai Coastal Road to landmark legislations like the new criminal laws, staying updated on current affairs is essential for informed citizenship. This guide covers key developments shaping India's future.",
  key_concepts: [
    {
      concept: "Atmanirbhar Bharat",
      explanation: "Self-reliant India initiative launched in 2020 focusing on making India a manufacturing hub, reducing import dependence, and boosting domestic industries.",
      importance: "Central to understanding government policies on manufacturing, PLI schemes, and trade decisions."
    },
    {
      concept: "Digital India",
      explanation: "Flagship program to transform India into a digitally empowered society through digital infrastructure, governance, and services.",
      importance: "Foundation for UPI, Aadhaar, DigiLocker, and e-governance initiatives."
    },
    {
      concept: "Viksit Bharat 2047",
      explanation: "Vision to make India a developed nation by 2047, the centenary of independence, through sustainable growth and inclusive development.",
      importance: "Framework for long-term policy planning across sectors."
    }
  ],
  sections: [
    {
      title: "Infrastructure Development",
      content: "India is investing heavily in world-class infrastructure including highways, railways, airports, and urban transit. The PM Gati Shakti initiative coordinates infrastructure planning across ministries.",
      key_points: [
        "National Infrastructure Pipeline targets Rs 111 lakh crore investment by 2025",
        "Bharatmala and Sagarmala for road and port connectivity",
        "Metro networks operational in 20+ cities"
      ],
      examples: ["Mumbai Trans Harbour Link - India's longest sea bridge", "Vande Bharat trains connecting major cities"]
    },
    {
      title: "Digital Transformation",
      content: "India leads the world in digital payments and is rapidly digitizing governance, finance, and services. UPI processes over 10 billion transactions monthly.",
      key_points: [
        "UPI is now accepted in multiple countries including Singapore, UAE, France",
        "Digital Personal Data Protection Act 2023 for privacy",
        "ONDC aims to democratize e-commerce"
      ],
      examples: ["CoWIN platform for vaccine management", "DigiYatra for paperless airport travel"]
    }
  ],
  glossary: [
    { term: "PLI Scheme", definition: "Production Linked Incentive - incentives to boost domestic manufacturing in key sectors" },
    { term: "FDI", definition: "Foreign Direct Investment - investment from foreign entities in Indian businesses" },
    { term: "GST", definition: "Goods and Services Tax - unified indirect tax system implemented in 2017" },
    { term: "NPA", definition: "Non-Performing Asset - loans where repayment is overdue, affecting bank health" }
  ],
  misconceptions: [
    {
      misconception: "India is only a services economy",
      correction: "While services contribute ~55% of GDP, India is rapidly growing its manufacturing sector through PLI schemes and is a major agricultural producer."
    },
    {
      misconception: "UPI is only for domestic use",
      correction: "UPI has expanded internationally and is now accepted in Singapore, UAE, France, Mauritius, and several other countries."
    }
  ],
  practice_questions: [
    {
      question: "What are the three new criminal laws that replaced colonial-era codes in 2024?",
      answer: "Bharatiya Nyaya Sanhita (replacing IPC), Bharatiya Nagarik Suraksha Sanhita (replacing CrPC), and Bharatiya Sakshya Adhiniyam (replacing Indian Evidence Act).",
      difficulty: "medium"
    },
    {
      question: "What is the significance of India's semiconductor mission?",
      answer: "The Rs 76,000 crore mission aims to establish domestic semiconductor manufacturing, reducing dependence on imports, creating jobs, and positioning India in the global electronics supply chain.",
      difficulty: "hard"
    }
  ],
  study_strategies: [
    "Read newspapers daily - The Hindu, Indian Express for in-depth coverage",
    "Follow PIB (Press Information Bureau) for official government updates",
    "Use Rajya Sabha TV and Lok Sabha TV for parliamentary proceedings",
    "Connect current events to their historical and economic context"
  ],
  resources: [
    { title: "Press Information Bureau", type: "website", description: "Official government press releases and updates" },
    { title: "Economic Survey", type: "document", description: "Annual government report on economic developments" }
  ],
  generated_at: new Date().toISOString()
};

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

  const loadDemoFlashcards = useCallback((topic: string, difficulty: string) => {
    const demo = DEMO_FLASHCARDS.default;

    // Simulate streaming effect with demo data
    setDeckInfo({
      deck_id: `demo-${Date.now()}`,
      description: demo.description,
      difficulty: difficulty,
    });
    setIsLoading(false);

    // Stream cards one by one for nice effect
    let cardIndex = 0;
    const streamInterval = setInterval(() => {
      if (cardIndex < demo.cards.length) {
        setFlashcards((prev) => [...prev, demo.cards[cardIndex]]);
        setProgress(((cardIndex + 1) / demo.cards.length) * 100);
        cardIndex++;
      } else {
        clearInterval(streamInterval);
        setStudyTips(demo.tips);
        setSources(demo.sources);
        setIsStreaming(false);
      }
    }, 300);

    return () => clearInterval(streamInterval);
  }, []);

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

      // Try API first, fallback to demo data
      try {
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
          // On error - fallback to demo data
          (err) => {
            console.log("API unavailable, using demo data:", err);
            cleanupRef.current = loadDemoFlashcards(topic, difficulty);
          }
        );

        cleanupRef.current = cleanup;
      } catch (err) {
        // Fallback to demo data if streaming fails immediately
        console.log("Falling back to demo data");
        cleanupRef.current = loadDemoFlashcards(topic, difficulty);
      }
    },
    [loadDemoFlashcards]
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
      // Fallback to demo study guide
      console.log("Using demo study guide");
      const demoGuide = {
        ...DEMO_STUDY_GUIDE,
        topic: currentTopic,
        title: `Study Guide: ${currentTopic}`,
        generated_at: new Date().toISOString(),
      };
      setStudyGuide(demoGuide);
      setViewMode("both");
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
      value: flashcards.filter((c) => c?.fact_checked).length,
      color: "emerald",
    },
    {
      icon: Target,
      label: "Categories",
      value: [...new Set(flashcards.map((c) => c?.category).filter(Boolean))].length,
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
                Learning Hub
              </h1>
              <p
                className={cn(
                  "text-sm",
                  isDark ? "text-white/60" : "text-slate-600"
                )}
              >
                Stay informed with fact-checked flashcards on current affairs
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
                            variant="outline"
                            className={cn(
                              "gap-2",
                              isDark
                                ? "border-white/20 text-white hover:bg-white/10"
                                : "border-slate-300 text-slate-700 hover:bg-slate-100"
                            )}
                          >
                            {isGeneratingGuide ? (
                              <Loader2 className="w-4 h-4 animate-spin" />
                            ) : (
                              <FileText className="w-4 h-4" />
                            )}
                            Study Guide
                          </Button>
                        )}
                        <Button
                          onClick={handleDownloadStudyGuide}
                          variant="outline"
                          className={cn(
                            "gap-2",
                            isDark
                              ? "border-emerald-500/50 text-emerald-400 hover:bg-emerald-500/10"
                              : "border-emerald-500 text-emerald-600 hover:bg-emerald-50"
                          )}
                        >
                          <Download className="w-4 h-4" />
                          Download
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
