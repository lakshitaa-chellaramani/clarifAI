"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Zap,
  Layers,
  RefreshCw,
  Maximize2,
  X,
  Film,
} from "lucide-react";
import { getDailyNews, DailyNewsItem } from "@/lib/api";
import { VideoReel } from "@/components/daily/video-reel";
import { SwipeableCards } from "@/components/daily/swipeable-cards";
import { cn } from "@/lib/utils";

type ViewMode = "briefs" | "cards";

// Demo data with real believable stories linking to dashboard
const demoNews: DailyNewsItem[] = [
  {
    id: "demo-1",
    title: "OpenAI Releases GPT-5: Claims 10x Improvement in Reasoning Capabilities",
    summary: "OpenAI's latest model demonstrates unprecedented performance in complex reasoning tasks, multi-step problem solving, and code generation. Industry experts are analyzing claims for accuracy.",
    source: "TechCrunch",
    source_url: "https://techcrunch.com",
    category: "Technology",
    published_at: new Date().toISOString(),
    thumbnail_gradient: "from-emerald-600 to-cyan-500",
    video_duration: 42,
    views: 892000,
    is_breaking: true,
    risk_score: 6,
  },
  {
    id: "demo-2",
    title: "Supreme Court Rules on Social Media Content Moderation Laws",
    summary: "In a landmark 6-3 decision, the court strikes down state laws requiring platforms to host all political speech. Legal experts weigh in on implications for free speech online.",
    source: "Reuters",
    source_url: "https://reuters.com",
    category: "Politics",
    published_at: new Date().toISOString(),
    thumbnail_gradient: "from-red-600 to-rose-500",
    video_duration: 55,
    views: 1245000,
    is_breaking: true,
    risk_score: 4,
  },
  {
    id: "demo-3",
    title: "Tesla Stock Surges 15% After Record Q4 Deliveries Announcement",
    summary: "Electric vehicle maker reports 500,000 deliveries in Q4, beating analyst expectations. Elon Musk announces plans for new Gigafactory in India.",
    source: "Bloomberg",
    source_url: "https://bloomberg.com",
    category: "Business",
    published_at: new Date().toISOString(),
    thumbnail_gradient: "from-blue-600 to-indigo-500",
    video_duration: 38,
    views: 567000,
    is_breaking: false,
    risk_score: 3,
  },
  {
    id: "demo-4",
    title: "WHO Declares New Respiratory Virus Outbreak in Southeast Asia",
    summary: "Health officials monitoring clusters of unusual pneumonia cases in three countries. Early data suggests lower severity than COVID-19, but high transmission rate concerns experts.",
    source: "BBC News",
    source_url: "https://bbc.com/news",
    category: "Health",
    published_at: new Date().toISOString(),
    thumbnail_gradient: "from-amber-600 to-orange-500",
    video_duration: 48,
    views: 2100000,
    is_breaking: true,
    risk_score: 8,
  },
  {
    id: "demo-5",
    title: "India vs Australia Test Match: Historic 500-Run Partnership Breaks Records",
    summary: "Virat Kohli and Shubman Gill create history with highest-ever 4th wicket partnership. India now leads series 2-1 heading into final test.",
    source: "ESPN Cricinfo",
    source_url: "https://espncricinfo.com",
    category: "Sports",
    published_at: new Date().toISOString(),
    thumbnail_gradient: "from-green-600 to-emerald-500",
    video_duration: 35,
    views: 3400000,
    is_breaking: false,
    risk_score: 1,
  },
  {
    id: "demo-6",
    title: "NASA's James Webb Telescope Discovers New Earth-Like Exoplanet",
    summary: "Astronomers confirm planet K2-18b shows signs of water vapor and potentially habitable conditions. Located 120 light-years away in the constellation Leo.",
    source: "NASA",
    source_url: "https://nasa.gov",
    category: "Science",
    published_at: new Date().toISOString(),
    thumbnail_gradient: "from-violet-600 to-purple-500",
    video_duration: 52,
    views: 890000,
    is_breaking: false,
    risk_score: 2,
  },
  {
    id: "demo-7",
    title: "Russia-Ukraine Peace Talks Resume in Geneva After 6-Month Pause",
    summary: "UN-mediated negotiations begin with both sides expressing cautious optimism. Key sticking points remain territorial control and security guarantees.",
    source: "Al Jazeera",
    source_url: "https://aljazeera.com",
    category: "World",
    published_at: new Date().toISOString(),
    thumbnail_gradient: "from-slate-600 to-zinc-500",
    video_duration: 62,
    views: 1560000,
    is_breaking: true,
    risk_score: 7,
  },
  {
    id: "demo-8",
    title: "Marvel Announces Phase 7 Lineup: X-Men Reboot Confirmed for 2027",
    summary: "Disney's investor day reveals ambitious slate including Avengers: Secret Wars, new Fantastic Four cast, and long-awaited X-Men integration into MCU.",
    source: "Variety",
    source_url: "https://variety.com",
    category: "Entertainment",
    published_at: new Date().toISOString(),
    thumbnail_gradient: "from-red-600 to-yellow-500",
    video_duration: 44,
    views: 2800000,
    is_breaking: false,
    risk_score: 2,
  },
  {
    id: "demo-9",
    title: "RBI Holds Interest Rates Steady, Signals Possible Cut in Q2 2025",
    summary: "Central bank maintains repo rate at 6.5% citing inflation concerns. Governor Das hints at accommodative stance if food prices stabilize.",
    source: "Economic Times",
    source_url: "https://economictimes.com",
    category: "Business",
    published_at: new Date().toISOString(),
    thumbnail_gradient: "from-teal-600 to-cyan-500",
    video_duration: 40,
    views: 445000,
    is_breaking: false,
    risk_score: 3,
  },
  {
    id: "demo-10",
    title: "Google DeepMind's AlphaFold 3 Solves New Class of Protein Structures",
    summary: "Latest AI model can predict molecular interactions with unprecedented accuracy. Pharmaceutical companies report breakthrough in drug discovery timelines.",
    source: "Nature",
    source_url: "https://nature.com",
    category: "Science",
    published_at: new Date().toISOString(),
    thumbnail_gradient: "from-pink-600 to-rose-500",
    video_duration: 46,
    views: 678000,
    is_breaking: false,
    risk_score: 2,
  },
];

export default function DailyPage() {
  const [viewMode, setViewMode] = useState<ViewMode>("briefs");
  const [news, setNews] = useState<DailyNewsItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [isFullscreen, setIsFullscreen] = useState(false);

  const fetchNews = async () => {
    setLoading(true);
    try {
      const response = await getDailyNews(20);
      setNews(response.news.length > 0 ? response.news : demoNews);
    } catch {
      setNews(demoNews);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchNews();
  }, []);

  const handleRefresh = () => {
    fetchNews();
  };

  const toggleFullscreen = () => {
    setIsFullscreen(!isFullscreen);
  };

  // Fullscreen mode
  if (isFullscreen) {
    return (
      <div className="fixed inset-0 z-50 bg-black">
        {/* Top bar with view toggle and close button */}
        <div className="absolute top-4 right-4 z-50 flex items-center gap-2">
          {/* View toggle */}
          <div className="flex items-center bg-black/50 backdrop-blur-sm rounded-full p-0.5">
            <button
              onClick={() => setViewMode("briefs")}
              className={cn(
                "flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium transition-all",
                viewMode === "briefs"
                  ? "bg-white text-black"
                  : "text-white hover:text-white/80"
              )}
            >
              <Zap className="w-3.5 h-3.5" />
              Briefs
            </button>
            <button
              onClick={() => setViewMode("cards")}
              className={cn(
                "flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium transition-all",
                viewMode === "cards"
                  ? "bg-white text-black"
                  : "text-white hover:text-white/80"
              )}
            >
              <Layers className="w-3.5 h-3.5" />
              Cards
            </button>
          </div>

          {/* Close button */}
          <button
            onClick={toggleFullscreen}
            className="w-9 h-9 rounded-full bg-black/50 backdrop-blur-sm flex items-center justify-center text-white hover:bg-black/70 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Content */}
        <div className="w-full h-full">
          {viewMode === "briefs" ? (
            <VideoReel news={news} />
          ) : (
            <SwipeableCards news={news} />
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="h-[calc(100vh-4rem)] flex flex-col overflow-hidden bg-background">
      {/* Compact Header */}
      <div className="flex-shrink-0 px-4 py-3 border-b border-border bg-background/95 backdrop-blur-sm">
        <div className="flex items-center justify-between gap-3">
          {/* Left: Title + Count */}
          <div className="flex items-center gap-3 min-w-0">
            <h1 className="text-lg font-semibold text-foreground whitespace-nowrap">Daily</h1>
            <span className="hidden sm:inline-flex px-2 py-0.5 bg-primary/10 text-primary text-xs font-medium rounded-full">
              {news.length} stories
            </span>
          </div>

          {/* Right: Controls */}
          <div className="flex items-center gap-2">
            {/* Refresh */}
            <button
              onClick={handleRefresh}
              disabled={loading}
              className="p-2 rounded-lg bg-muted text-muted-foreground hover:bg-muted/80 transition-colors"
            >
              <RefreshCw className={cn("w-4 h-4", loading && "animate-spin")} />
            </button>

            {/* Fullscreen toggle */}
            <button
              onClick={toggleFullscreen}
              className="p-2 rounded-lg bg-muted text-muted-foreground hover:bg-muted/80 transition-colors"
            >
              <Maximize2 className="w-4 h-4" />
            </button>

            {/* View toggle */}
            <div className="flex items-center bg-muted rounded-lg p-0.5">
              <button
                onClick={() => setViewMode("briefs")}
                className={cn(
                  "flex items-center gap-1.5 px-3 py-1.5 rounded-md text-sm font-medium transition-all",
                  viewMode === "briefs"
                    ? "bg-background text-foreground shadow-sm"
                    : "text-muted-foreground hover:text-foreground"
                )}
              >
                <Zap className="w-4 h-4" />
                <span className="hidden sm:inline">Briefs</span>
              </button>
              <button
                onClick={() => setViewMode("cards")}
                className={cn(
                  "flex items-center gap-1.5 px-3 py-1.5 rounded-md text-sm font-medium transition-all",
                  viewMode === "cards"
                    ? "bg-background text-foreground shadow-sm"
                    : "text-muted-foreground hover:text-foreground"
                )}
              >
                <Layers className="w-4 h-4" />
                <span className="hidden sm:inline">Cards</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Main content */}
      <div className="flex-1 relative overflow-hidden">
        {loading ? (
          <div className="absolute inset-0 flex items-center justify-center bg-background">
            <div className="flex flex-col items-center gap-3">
              <div className="relative">
                <div className="w-12 h-12 rounded-full border-2 border-primary/20" />
                <div className="absolute inset-0 w-12 h-12 rounded-full border-2 border-primary border-t-transparent animate-spin" />
              </div>
              <p className="text-muted-foreground text-sm">Loading stories...</p>
            </div>
          </div>
        ) : news.length === 0 ? (
          <div className="absolute inset-0 flex items-center justify-center bg-background">
            <div className="flex flex-col items-center gap-4 text-center p-8">
              <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center">
                <Film className="w-8 h-8 text-muted-foreground" />
              </div>
              <div>
                <h2 className="text-lg font-semibold">No stories found</h2>
                <p className="text-muted-foreground text-sm mt-1">
                  Check back later for updates
                </p>
              </div>
              <button
                onClick={handleRefresh}
                className="px-4 py-2 bg-primary text-primary-foreground rounded-lg text-sm font-medium hover:bg-primary/90 transition-colors"
              >
                Refresh
              </button>
            </div>
          </div>
        ) : (
          <AnimatePresence mode="wait">
            <motion.div
              key={viewMode}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.15 }}
              className="absolute inset-0"
            >
              {viewMode === "briefs" ? (
                <VideoReel news={news} />
              ) : (
                <SwipeableCards news={news} />
              )}
            </motion.div>
          </AnimatePresence>
        )}
      </div>
    </div>
  );
}
