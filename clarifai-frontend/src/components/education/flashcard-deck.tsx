"use client";

import { useState, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Flashcard, FlashcardMini } from "./flashcard";
import {
  ChevronLeft,
  ChevronRight,
  Shuffle,
  RotateCcw,
  Grid3X3,
  Layers,
  CheckCircle2,
  BookOpen,
  Timer,
} from "lucide-react";
import type { Flashcard as FlashcardType, FlashcardSource } from "@/lib/api";

interface FlashcardDeckProps {
  cards: FlashcardType[];
  topic: string;
  sources?: FlashcardSource[];
  studyTips?: string[];
  onComplete?: () => void;
  className?: string;
}

export function FlashcardDeck({
  cards,
  topic,
  sources,
  studyTips,
  onComplete,
  className,
}: FlashcardDeckProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [viewMode, setViewMode] = useState<"single" | "grid">("single");
  const [shuffledCards, setShuffledCards] = useState<FlashcardType[]>(cards);
  const [masteredCards, setMasteredCards] = useState<Set<string>>(new Set());
  const [studyStats, setStudyStats] = useState({
    cardsReviewed: 0,
    correctCount: 0,
  });

  const currentCard = shuffledCards[currentIndex];
  const progress = ((currentIndex + 1) / shuffledCards.length) * 100;

  const handleNext = useCallback(() => {
    if (currentIndex < shuffledCards.length - 1) {
      setCurrentIndex((prev) => prev + 1);
      setStudyStats((prev) => ({ ...prev, cardsReviewed: prev.cardsReviewed + 1 }));
    } else if (onComplete) {
      onComplete();
    }
  }, [currentIndex, shuffledCards.length, onComplete]);

  const handlePrev = useCallback(() => {
    if (currentIndex > 0) {
      setCurrentIndex((prev) => prev - 1);
    }
  }, [currentIndex]);

  const handleShuffle = useCallback(() => {
    const shuffled = [...shuffledCards].sort(() => Math.random() - 0.5);
    setShuffledCards(shuffled);
    setCurrentIndex(0);
  }, [shuffledCards]);

  const handleReset = useCallback(() => {
    setShuffledCards(cards);
    setCurrentIndex(0);
    setMasteredCards(new Set());
    setStudyStats({ cardsReviewed: 0, correctCount: 0 });
  }, [cards]);

  const handleMarkMastered = useCallback(() => {
    if (currentCard) {
      setMasteredCards((prev) => {
        const newSet = new Set(prev);
        if (newSet.has(currentCard.id)) {
          newSet.delete(currentCard.id);
        } else {
          newSet.add(currentCard.id);
          setStudyStats((s) => ({ ...s, correctCount: s.correctCount + 1 }));
        }
        return newSet;
      });
    }
  }, [currentCard]);

  const handleCardSelect = useCallback((index: number) => {
    setCurrentIndex(index);
    setViewMode("single");
  }, []);

  return (
    <div className={cn("space-y-6", className)}>
      {/* Header Stats */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold text-foreground">{topic}</h3>
          <p className="text-sm text-muted-foreground">
            {shuffledCards.length} cards &bull; {masteredCards.size} mastered
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setViewMode(viewMode === "single" ? "grid" : "single")}
          >
            {viewMode === "single" ? (
              <Grid3X3 className="w-4 h-4" />
            ) : (
              <Layers className="w-4 h-4" />
            )}
          </Button>
          <Button variant="outline" size="sm" onClick={handleShuffle}>
            <Shuffle className="w-4 h-4" />
          </Button>
          <Button variant="outline" size="sm" onClick={handleReset}>
            <RotateCcw className="w-4 h-4" />
          </Button>
        </div>
      </div>

      {/* Progress Bar */}
      <div className="relative h-2 bg-muted rounded-full overflow-hidden">
        <motion.div
          className="absolute inset-y-0 left-0 bg-primary rounded-full"
          initial={{ width: 0 }}
          animate={{ width: `${progress}%` }}
          transition={{ duration: 0.3 }}
        />
      </div>

      {viewMode === "single" ? (
        <>
          {/* Single Card View */}
          <AnimatePresence mode="wait">
            <motion.div
              key={currentIndex}
              initial={{ opacity: 0, x: 50 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -50 }}
              transition={{ duration: 0.2 }}
            >
              {currentCard && (
                <Flashcard
                  card={currentCard}
                  index={currentIndex}
                  className="max-w-2xl mx-auto"
                />
              )}
            </motion.div>
          </AnimatePresence>

          {/* Navigation Controls */}
          <div className="flex items-center justify-center gap-4">
            <Button
              variant="outline"
              size="lg"
              onClick={handlePrev}
              disabled={currentIndex === 0}
            >
              <ChevronLeft className="w-5 h-5" />
            </Button>

            <div className="flex items-center gap-2">
              <span className="text-lg font-medium text-foreground">
                {currentIndex + 1}
              </span>
              <span className="text-muted-foreground">/</span>
              <span className="text-muted-foreground">
                {shuffledCards.length}
              </span>
            </div>

            <Button
              variant="outline"
              size="lg"
              onClick={handleNext}
              disabled={currentIndex === shuffledCards.length - 1}
            >
              <ChevronRight className="w-5 h-5" />
            </Button>
          </div>

          {/* Mark as Mastered */}
          <div className="flex justify-center">
            <Button
              variant={
                currentCard && masteredCards.has(currentCard.id)
                  ? "default"
                  : "outline"
              }
              onClick={handleMarkMastered}
              className="gap-2"
            >
              <CheckCircle2 className="w-4 h-4" />
              {currentCard && masteredCards.has(currentCard.id)
                ? "Mastered"
                : "Mark as Mastered"}
            </Button>
          </div>
        </>
      ) : (
        /* Grid View */
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {shuffledCards.map((card, index) => (
            <div key={card.id} className="relative">
              <FlashcardMini
                card={card}
                onClick={() => handleCardSelect(index)}
                isActive={index === currentIndex}
              />
              {masteredCards.has(card.id) && (
                <div className="absolute top-2 right-2">
                  <CheckCircle2 className="w-5 h-5 text-success" />
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Study Tips */}
      {studyTips && studyTips.length > 0 && (
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm flex items-center gap-2">
              <BookOpen className="w-4 h-4 text-primary" />
              Study Tips
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="space-y-2">
              {studyTips.map((tip, index) => (
                <li
                  key={index}
                  className="flex items-start gap-2 text-sm text-muted-foreground"
                >
                  <span className="text-primary">•</span>
                  {tip}
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>
      )}

      {/* Sources */}
      {sources && sources.length > 0 && (
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm flex items-center gap-2">
              <Timer className="w-4 h-4 text-primary" />
              Sources ({sources.length})
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-2">
              {sources.map((source, index) => (
                <Badge
                  key={index}
                  variant={
                    source.reliability === "HIGH"
                      ? "success"
                      : source.reliability === "MEDIUM"
                      ? "warning"
                      : "outline"
                  }
                  className="text-xs"
                >
                  {source.title}
                </Badge>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
