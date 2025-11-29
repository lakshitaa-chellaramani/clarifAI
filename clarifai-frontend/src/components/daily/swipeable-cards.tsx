"use client";

import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import {
  Bookmark,
  Share2,
  ExternalLink,
  Clock,
  Eye,
  TrendingUp,
  Shield,
  ChevronRight,
  ChevronUp,
  ChevronDown,
  Zap,
  BookOpen,
} from "lucide-react";
import { DailyNewsItem } from "@/lib/api";
import { cn } from "@/lib/utils";

interface SwipeableCardsProps {
  news: DailyNewsItem[];
  onNewsClick?: (news: DailyNewsItem) => void;
}

export function SwipeableCards({ news, onNewsClick }: SwipeableCardsProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [touchStart, setTouchStart] = useState<number | null>(null);
  const [saved, setSaved] = useState<Set<string>>(new Set());
  const containerRef = useRef<HTMLDivElement>(null);

  const currentNews = news[currentIndex];

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "ArrowUp" && currentIndex > 0) {
        setCurrentIndex((i) => i - 1);
      } else if (e.key === "ArrowDown" && currentIndex < news.length - 1) {
        setCurrentIndex((i) => i + 1);
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [currentIndex, news.length]);

  // Touch/swipe navigation
  const handleTouchStart = (e: React.TouchEvent) => {
    setTouchStart(e.touches[0].clientY);
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    if (touchStart === null) return;
    const diff = touchStart - e.changedTouches[0].clientY;
    if (Math.abs(diff) > 60) {
      if (diff > 0 && currentIndex < news.length - 1) {
        setCurrentIndex((i) => i + 1);
      } else if (diff < 0 && currentIndex > 0) {
        setCurrentIndex((i) => i - 1);
      }
    }
    setTouchStart(null);
  };

  // Mouse wheel navigation
  const handleWheel = (e: React.WheelEvent) => {
    if (e.deltaY > 50 && currentIndex < news.length - 1) {
      setCurrentIndex((i) => i + 1);
    } else if (e.deltaY < -50 && currentIndex > 0) {
      setCurrentIndex((i) => i - 1);
    }
  };

  const handleScroll = (dir: "up" | "down") => {
    if (dir === "up" && currentIndex > 0) {
      setCurrentIndex((i) => i - 1);
    } else if (dir === "down" && currentIndex < news.length - 1) {
      setCurrentIndex((i) => i + 1);
    }
  };

  const toggleSave = (id: string) => {
    setSaved((prev) => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  };

  const formatViews = (views: number) => {
    if (views >= 1000000) return `${(views / 1000000).toFixed(1)}M`;
    if (views >= 1000) return `${(views / 1000).toFixed(1)}K`;
    return views.toString();
  };

  const getCategoryColor = (category: string) => {
    const colors: Record<string, string> = {
      Politics: "bg-red-500/20 text-red-400 border-red-500/30",
      Technology: "bg-blue-500/20 text-blue-400 border-blue-500/30",
      Business: "bg-emerald-500/20 text-emerald-400 border-emerald-500/30",
      World: "bg-purple-500/20 text-purple-400 border-purple-500/30",
      Sports: "bg-orange-500/20 text-orange-400 border-orange-500/30",
      Entertainment: "bg-pink-500/20 text-pink-400 border-pink-500/30",
      Science: "bg-cyan-500/20 text-cyan-400 border-cyan-500/30",
      Health: "bg-green-500/20 text-green-400 border-green-500/30",
    };
    return colors[category] || "bg-gray-500/20 text-gray-400 border-gray-500/30";
  };

  const getRiskColor = (score: number) => {
    if (score >= 7) return "text-red-400 bg-red-500/20";
    if (score >= 4) return "text-amber-400 bg-amber-500/20";
    return "text-green-400 bg-green-500/20";
  };

  if (!currentNews) return null;

  return (
    <div
      ref={containerRef}
      className="relative w-full h-full bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 overflow-hidden select-none"
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
      onWheel={handleWheel}
    >
      {/* Background Pattern */}
      <div className="absolute inset-0 opacity-5">
        <div
          className="absolute inset-0"
          style={{
            backgroundImage: `radial-gradient(circle at 2px 2px, white 1px, transparent 0)`,
            backgroundSize: "32px 32px",
          }}
        />
      </div>

      {/* Progress indicators at top */}
      <div className="absolute top-2 left-2 right-2 flex gap-1 z-20">
        {news.slice(0, Math.min(news.length, 10)).map((_, idx) => (
          <div
            key={idx}
            className={cn(
              "flex-1 h-1 rounded-full transition-all duration-300",
              idx <= currentIndex ? "bg-white" : "bg-white/20"
            )}
          />
        ))}
      </div>

      {/* Counter */}
      <div className="absolute top-10 right-3 z-20">
        <span className="px-2.5 py-1 bg-black/40 backdrop-blur-sm rounded-full text-white text-xs font-medium">
          {currentIndex + 1}/{news.length}
        </span>
      </div>

      {/* Main Card */}
      <AnimatePresence mode="wait">
        <motion.div
          key={currentNews.id}
          initial={{ opacity: 0, y: 60 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -60 }}
          transition={{ duration: 0.3, ease: "easeOut" }}
          className="absolute inset-0 flex items-center justify-center px-4 pt-16 pb-4"
        >
          <div className="relative w-full max-w-md h-full rounded-3xl overflow-hidden bg-slate-900/80 backdrop-blur-xl border border-white/10 shadow-2xl">
            {/* Decorative gradient at top */}
            <div
              className={cn(
                "absolute top-0 left-0 right-0 h-32 bg-gradient-to-b opacity-40",
                currentNews.thumbnail_gradient
              )}
            />

            {/* Content */}
            <div className="relative h-full flex flex-col p-6 overflow-y-auto">
              {/* Header badges */}
              <div className="flex items-start justify-between mb-5 flex-shrink-0">
                <div className="flex flex-wrap gap-2">
                  {currentNews.is_breaking && (
                    <span className="flex items-center gap-1.5 px-3 py-1 bg-red-500 rounded-full text-white text-xs font-bold animate-pulse">
                      <Zap className="w-3 h-3" />
                      BREAKING
                    </span>
                  )}
                  <span
                    className={cn(
                      "px-3 py-1 rounded-full text-xs font-medium border",
                      getCategoryColor(currentNews.category)
                    )}
                  >
                    {currentNews.category}
                  </span>
                </div>
                <div
                  className={cn(
                    "flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium",
                    getRiskColor(currentNews.risk_score)
                  )}
                >
                  <Shield className="w-3.5 h-3.5" />
                  {currentNews.risk_score}/10
                </div>
              </div>

              {/* Source info */}
              <div className="flex items-center gap-3 mb-6 flex-shrink-0">
                <div className="w-12 h-12 rounded-xl bg-white/10 backdrop-blur flex items-center justify-center">
                  <span className="text-white font-bold text-lg">
                    {currentNews.source.charAt(0)}
                  </span>
                </div>
                <div>
                  <p className="text-white font-semibold">{currentNews.source}</p>
                  <div className="flex items-center gap-3 text-slate-400 text-xs mt-0.5">
                    <span className="flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      Just now
                    </span>
                    <span className="flex items-center gap-1">
                      <Eye className="w-3 h-3" />
                      {formatViews(currentNews.views)}
                    </span>
                  </div>
                </div>
              </div>

              {/* Main content - scrollable */}
              <div className="flex-1 flex flex-col justify-center min-h-0">
                <h2 className="text-white text-xl sm:text-2xl font-bold leading-tight mb-4">
                  {currentNews.title}
                </h2>
                <p className="text-slate-300 text-sm sm:text-base leading-relaxed">
                  {currentNews.summary}
                </p>
              </div>

              {/* Actions */}
              <div className="space-y-3 mt-6 flex-shrink-0">
                {/* Primary CTA */}
                <Link
                  href={`/search?q=${encodeURIComponent(
                    currentNews.title.split(" ").slice(0, 5).join(" ")
                  )}`}
                  className="flex items-center justify-center gap-2 w-full py-3.5 bg-white rounded-xl text-slate-900 font-semibold hover:bg-slate-100 transition-colors"
                  onClick={(e) => e.stopPropagation()}
                >
                  <TrendingUp className="w-4 h-4" />
                  Analyze This Story
                  <ChevronRight className="w-4 h-4" />
                </Link>

                {/* Secondary Actions */}
                <div className="flex items-center justify-center gap-2">
                  <a
                    href={currentNews.source_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    onClick={(e) => e.stopPropagation()}
                    className="flex items-center gap-2 px-4 py-2.5 bg-white/10 rounded-xl text-white text-sm hover:bg-white/20 transition-colors"
                  >
                    <ExternalLink className="w-4 h-4" />
                    Source
                  </a>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      toggleSave(currentNews.id);
                    }}
                    className={cn(
                      "flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm transition-colors",
                      saved.has(currentNews.id)
                        ? "bg-amber-500/20 text-amber-400"
                        : "bg-white/10 text-white hover:bg-white/20"
                    )}
                  >
                    <Bookmark
                      className={cn(
                        "w-4 h-4",
                        saved.has(currentNews.id) && "fill-current"
                      )}
                    />
                    {saved.has(currentNews.id) ? "Saved" : "Save"}
                  </button>
                  <button
                    onClick={(e) => e.stopPropagation()}
                    className="flex items-center gap-2 px-4 py-2.5 bg-white/10 rounded-xl text-white text-sm hover:bg-white/20 transition-colors"
                  >
                    <Share2 className="w-4 h-4" />
                    Share
                  </button>
                </div>
              </div>

              {/* Swipe hint */}
              <p className="text-center text-slate-500 text-xs mt-4 flex-shrink-0">
                Swipe up/down or use arrow keys to navigate
              </p>
            </div>
          </div>
        </motion.div>
      </AnimatePresence>

      {/* Navigation buttons - desktop only */}
      <div
        className="hidden sm:flex absolute right-3 top-1/2 -translate-y-1/2 flex-col gap-2 z-20"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          onClick={() => handleScroll("up")}
          disabled={currentIndex === 0}
          className={cn(
            "w-10 h-10 rounded-full bg-white/10 backdrop-blur-sm flex items-center justify-center transition-all",
            currentIndex === 0 ? "opacity-30" : "hover:bg-white/20"
          )}
        >
          <ChevronUp className="w-5 h-5 text-white" />
        </button>
        <button
          onClick={() => handleScroll("down")}
          disabled={currentIndex === news.length - 1}
          className={cn(
            "w-10 h-10 rounded-full bg-white/10 backdrop-blur-sm flex items-center justify-center transition-all",
            currentIndex === news.length - 1 ? "opacity-30" : "hover:bg-white/20"
          )}
        >
          <ChevronDown className="w-5 h-5 text-white" />
        </button>
      </div>

      {/* Quick nav dots - left side */}
      <div className="hidden sm:flex absolute left-3 top-1/2 -translate-y-1/2 flex-col gap-1.5 z-20">
        {news.slice(0, Math.min(news.length, 10)).map((_, idx) => (
          <button
            key={idx}
            onClick={() => setCurrentIndex(idx)}
            className={cn(
              "w-2 h-2 rounded-full transition-all",
              idx === currentIndex
                ? "bg-white scale-125"
                : "bg-white/30 hover:bg-white/50"
            )}
          />
        ))}
      </div>
    </div>
  );
}
