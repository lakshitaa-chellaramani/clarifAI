"use client";

import { useRef, useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import {
  Play,
  Pause,
  Volume2,
  VolumeX,
  Heart,
  MessageCircle,
  Share2,
  Bookmark,
  ChevronUp,
  ChevronDown,
  Clock,
  Eye,
  ExternalLink,
  Video,
  Zap,
  Shield,
  TrendingUp,
  User,
} from "lucide-react";
import { DailyNewsItem } from "@/lib/api";
import { cn } from "@/lib/utils";

interface VideoReelProps {
  news: DailyNewsItem[];
  onNewsClick?: (news: DailyNewsItem) => void;
}

export function VideoReel({ news, onNewsClick }: VideoReelProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(true);
  const [isMuted, setIsMuted] = useState(true);
  const [liked, setLiked] = useState<Set<string>>(new Set());
  const [saved, setSaved] = useState<Set<string>>(new Set());
  const containerRef = useRef<HTMLDivElement>(null);
  const [progress, setProgress] = useState(0);
  const [touchStart, setTouchStart] = useState<number | null>(null);

  const currentNews = news[currentIndex];

  // Auto-progress
  useEffect(() => {
    if (!isPlaying || !currentNews) return;

    const duration = currentNews.video_duration * 1000;
    const interval = 50;
    const step = (interval / duration) * 100;

    const timer = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 100) {
          if (currentIndex < news.length - 1) {
            setCurrentIndex((i) => i + 1);
          }
          return 0;
        }
        return prev + step;
      });
    }, interval);

    return () => clearInterval(timer);
  }, [isPlaying, currentIndex, currentNews, news.length]);

  useEffect(() => {
    setProgress(0);
  }, [currentIndex]);

  // Keyboard
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "ArrowUp" && currentIndex > 0) {
        setCurrentIndex((i) => i - 1);
      } else if (e.key === "ArrowDown" && currentIndex < news.length - 1) {
        setCurrentIndex((i) => i + 1);
      } else if (e.key === " ") {
        e.preventDefault();
        setIsPlaying((p) => !p);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [currentIndex, news.length]);

  // Touch
  const handleTouchStart = (e: React.TouchEvent) => {
    setTouchStart(e.touches[0].clientY);
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    if (touchStart === null) return;
    const diff = touchStart - e.changedTouches[0].clientY;
    if (Math.abs(diff) > 60) {
      if (diff > 0 && currentIndex < news.length - 1) setCurrentIndex((i) => i + 1);
      else if (diff < 0 && currentIndex > 0) setCurrentIndex((i) => i - 1);
    }
    setTouchStart(null);
  };

  const handleScroll = (dir: "up" | "down") => {
    if (dir === "up" && currentIndex > 0) setCurrentIndex((i) => i - 1);
    else if (dir === "down" && currentIndex < news.length - 1) setCurrentIndex((i) => i + 1);
  };

  const toggleLike = (id: string) => {
    setLiked((prev) => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  };

  const toggleSave = (id: string) => {
    setSaved((prev) => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  };

  const formatViews = (v: number) => {
    if (v >= 1000000) return `${(v / 1000000).toFixed(1)}M`;
    if (v >= 1000) return `${(v / 1000).toFixed(1)}K`;
    return v.toString();
  };

  const formatDuration = (s: number) => `${Math.floor(s / 60)}:${(s % 60).toString().padStart(2, "0")}`;

  const getRiskColor = (score: number) => {
    if (score >= 7) return "text-red-400 bg-red-500/20";
    if (score >= 4) return "text-amber-400 bg-amber-500/20";
    return "text-green-400 bg-green-500/20";
  };

  if (!currentNews) return null;

  return (
    <div
      ref={containerRef}
      className="relative w-full h-full bg-black overflow-hidden select-none"
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
      onClick={() => setIsPlaying((p) => !p)}
    >
      <AnimatePresence mode="wait">
        <motion.div
          key={currentNews.id}
          initial={{ opacity: 0, y: 80 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -80 }}
          transition={{ duration: 0.35, ease: "easeOut" }}
          className="absolute inset-0"
        >
          {/* Background */}
          <div className={cn("absolute inset-0 bg-gradient-to-br", currentNews.thumbnail_gradient)}>
            <div className="absolute inset-0 bg-gradient-to-t from-black via-black/50 to-black/30" />

            {/* Animated background lines */}
            <motion.div
              animate={{ x: ["-100%", "100%"] }}
              transition={{ duration: 10, repeat: Infinity, ease: "linear" }}
              className="absolute top-1/3 left-0 right-0 h-px bg-gradient-to-r from-transparent via-white/20 to-transparent"
            />
          </div>

          {/* AI Anchor */}
          <div className="absolute top-[20%] left-1/2 -translate-x-1/2 flex flex-col items-center">
            <motion.div
              animate={isPlaying ? { scale: [1, 1.03, 1] } : {}}
              transition={{ duration: 2.5, repeat: Infinity }}
              className="relative"
            >
              <div className="absolute -inset-4 rounded-full bg-gradient-to-r from-blue-500 to-purple-500 opacity-20 blur-2xl" />

              <div className="relative w-24 h-24 sm:w-32 sm:h-32 rounded-full bg-gradient-to-br from-slate-700 to-slate-900 border border-white/20 flex items-center justify-center shadow-2xl">
                <User className="w-12 h-12 sm:w-16 sm:h-16 text-white/60" />

                {/* Speaking animation */}
                {isPlaying && (
                  <div className="absolute -bottom-1 left-1/2 -translate-x-1/2 flex gap-0.5">
                    {[0, 1, 2, 3, 4].map((i) => (
                      <motion.div
                        key={i}
                        animate={{ height: ["3px", "14px", "3px"] }}
                        transition={{ duration: 0.35, repeat: Infinity, delay: i * 0.08 }}
                        className="w-1 bg-blue-400 rounded-full"
                      />
                    ))}
                  </div>
                )}
              </div>
            </motion.div>

            <div className="mt-4 flex items-center gap-2 text-white/70 text-xs">
              <Video className="w-3.5 h-3.5" />
              <span>{isPlaying ? "AI Anchor" : "Tap to play"}</span>
            </div>
          </div>

          {/* Progress bars */}
          <div className="absolute top-2 left-2 right-2 flex gap-1 z-20">
            {news.slice(0, Math.min(news.length, 8)).map((_, idx) => (
              <div key={idx} className="flex-1 h-0.5 bg-white/20 rounded-full overflow-hidden">
                <div
                  className="h-full bg-white rounded-full transition-all duration-75"
                  style={{ width: idx < currentIndex ? "100%" : idx === currentIndex ? `${progress}%` : "0%" }}
                />
              </div>
            ))}
          </div>

          {/* Top badges - adjusted position for fullscreen */}
          <div className="absolute top-10 left-3 right-16 flex flex-wrap items-center gap-1.5 z-10">
            {currentNews.is_breaking && (
              <span className="flex items-center gap-1 px-2.5 py-1 bg-red-500 rounded-full text-white text-[10px] font-bold animate-pulse">
                <Zap className="w-3 h-3" />
                LIVE
              </span>
            )}
            <span className="px-2.5 py-1 bg-black/40 backdrop-blur-sm rounded-full text-white text-[10px] font-medium">
              {currentNews.category}
            </span>
            <span className={cn("flex items-center gap-1 px-2 py-1 rounded-full text-[10px] font-medium", getRiskColor(currentNews.risk_score))}>
              <Shield className="w-3 h-3" />
              {currentNews.risk_score}/10
            </span>
          </div>

          {/* Bottom content */}
          <div className="absolute bottom-0 left-0 right-16 p-4 z-10">
            {/* Source */}
            <div className="flex items-center gap-2.5 mb-2">
              <div className="w-9 h-9 rounded-full bg-white/10 backdrop-blur-sm flex items-center justify-center text-white font-bold text-sm">
                {currentNews.source.charAt(0)}
              </div>
              <div>
                <p className="text-white font-medium text-sm">{currentNews.source}</p>
                <div className="flex items-center gap-2 text-white/50 text-xs">
                  <span className="flex items-center gap-0.5">
                    <Clock className="w-3 h-3" />
                    {formatDuration(currentNews.video_duration)}
                  </span>
                  <span className="flex items-center gap-0.5">
                    <Eye className="w-3 h-3" />
                    {formatViews(currentNews.views)}
                  </span>
                </div>
              </div>
            </div>

            {/* Title */}
            <h2 className="text-white text-base sm:text-lg font-semibold leading-snug mb-2 line-clamp-3">
              {currentNews.title}
            </h2>

            {/* Summary */}
            <p className="text-white/60 text-xs sm:text-sm mb-3 line-clamp-2">{currentNews.summary}</p>

            {/* Actions */}
            <div className="flex items-center gap-2">
              <Link
                href={`/search?q=${encodeURIComponent(currentNews.title.split(" ").slice(0, 4).join(" "))}`}
                onClick={(e) => e.stopPropagation()}
                className="flex items-center gap-1.5 px-3 py-2 bg-white text-black text-xs font-semibold rounded-lg hover:bg-white/90 transition-colors"
              >
                <TrendingUp className="w-3.5 h-3.5" />
                Analyze
              </Link>
              <a
                href={currentNews.source_url}
                target="_blank"
                rel="noopener noreferrer"
                onClick={(e) => e.stopPropagation()}
                className="flex items-center gap-1.5 px-3 py-2 bg-white/10 backdrop-blur-sm text-white text-xs rounded-lg hover:bg-white/20 transition-colors"
              >
                <ExternalLink className="w-3.5 h-3.5" />
                Source
              </a>
            </div>
          </div>
        </motion.div>
      </AnimatePresence>

      {/* Right sidebar */}
      <div className="absolute right-2 bottom-32 flex flex-col items-center gap-4 z-20" onClick={(e) => e.stopPropagation()}>
        <button
          onClick={() => setIsPlaying(!isPlaying)}
          className="w-11 h-11 rounded-full bg-white/10 backdrop-blur-sm flex items-center justify-center hover:bg-white/20 transition-colors"
        >
          {isPlaying ? <Pause className="w-5 h-5 text-white" /> : <Play className="w-5 h-5 text-white ml-0.5" />}
        </button>

        <button
          onClick={() => setIsMuted(!isMuted)}
          className="w-11 h-11 rounded-full bg-white/10 backdrop-blur-sm flex items-center justify-center hover:bg-white/20 transition-colors"
        >
          {isMuted ? <VolumeX className="w-5 h-5 text-white" /> : <Volume2 className="w-5 h-5 text-white" />}
        </button>

        <button onClick={() => toggleLike(currentNews.id)} className="flex flex-col items-center gap-0.5">
          <div className={cn("w-11 h-11 rounded-full flex items-center justify-center transition-all", liked.has(currentNews.id) ? "bg-red-500" : "bg-white/10 backdrop-blur-sm hover:bg-white/20")}>
            <Heart className={cn("w-5 h-5", liked.has(currentNews.id) ? "text-white fill-white" : "text-white")} />
          </div>
          <span className="text-white text-[10px]">{formatViews(currentNews.views)}</span>
        </button>

        <button className="flex flex-col items-center gap-0.5">
          <div className="w-11 h-11 rounded-full bg-white/10 backdrop-blur-sm flex items-center justify-center hover:bg-white/20 transition-colors">
            <MessageCircle className="w-5 h-5 text-white" />
          </div>
          <span className="text-white text-[10px]">{Math.floor(currentNews.views / 100)}</span>
        </button>

        <button onClick={() => toggleSave(currentNews.id)} className="flex flex-col items-center gap-0.5">
          <div className={cn("w-11 h-11 rounded-full flex items-center justify-center transition-all", saved.has(currentNews.id) ? "bg-amber-500" : "bg-white/10 backdrop-blur-sm hover:bg-white/20")}>
            <Bookmark className={cn("w-5 h-5", saved.has(currentNews.id) ? "text-white fill-white" : "text-white")} />
          </div>
        </button>

        <button className="w-11 h-11 rounded-full bg-white/10 backdrop-blur-sm flex items-center justify-center hover:bg-white/20 transition-colors">
          <Share2 className="w-5 h-5 text-white" />
        </button>
      </div>

      {/* Navigation - desktop only */}
      <div className="hidden sm:flex absolute right-2 top-1/2 -translate-y-1/2 flex-col gap-1.5 z-20" onClick={(e) => e.stopPropagation()}>
        <button
          onClick={() => handleScroll("up")}
          disabled={currentIndex === 0}
          className={cn("w-9 h-9 rounded-full bg-white/10 backdrop-blur-sm flex items-center justify-center transition-all", currentIndex === 0 ? "opacity-30" : "hover:bg-white/20")}
        >
          <ChevronUp className="w-4 h-4 text-white" />
        </button>
        <button
          onClick={() => handleScroll("down")}
          disabled={currentIndex === news.length - 1}
          className={cn("w-9 h-9 rounded-full bg-white/10 backdrop-blur-sm flex items-center justify-center transition-all", currentIndex === news.length - 1 ? "opacity-30" : "hover:bg-white/20")}
        >
          <ChevronDown className="w-4 h-4 text-white" />
        </button>
      </div>

      {/* Counter */}
      <div className="absolute top-10 right-3 z-20">
        <span className="px-2 py-1 bg-black/40 backdrop-blur-sm rounded-full text-white text-xs font-medium">
          {currentIndex + 1}/{news.length}
        </span>
      </div>

      {/* Pause overlay */}
      <AnimatePresence>
        {!isPlaying && (
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.8 }}
            className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-10 pointer-events-none"
          >
            <div className="w-16 h-16 rounded-full bg-black/50 backdrop-blur-sm flex items-center justify-center">
              <Play className="w-8 h-8 text-white ml-1" />
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
