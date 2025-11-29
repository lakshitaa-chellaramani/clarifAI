"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import {
  RotateCcw,
  CheckCircle2,
  AlertCircle,
  Lightbulb,
  ExternalLink,
} from "lucide-react";
import type { Flashcard as FlashcardType } from "@/lib/api";

interface FlashcardProps {
  card: FlashcardType;
  index: number;
  onFlip?: (isFlipped: boolean) => void;
  className?: string;
}

export function Flashcard({ card, index, onFlip, className }: FlashcardProps) {
  const [isFlipped, setIsFlipped] = useState(false);

  const handleFlip = () => {
    const newFlipped = !isFlipped;
    setIsFlipped(newFlipped);
    onFlip?.(newFlipped);
  };

  const getDifficultyColor = (difficulty: number) => {
    if (difficulty <= 2) return "success";
    if (difficulty <= 3) return "warning";
    return "danger";
  };

  const getDifficultyLabel = (difficulty: number) => {
    if (difficulty <= 1) return "Easy";
    if (difficulty <= 2) return "Basic";
    if (difficulty <= 3) return "Medium";
    if (difficulty <= 4) return "Hard";
    return "Expert";
  };

  return (
    <div
      className={cn(
        "relative w-full aspect-[3/2] cursor-pointer perspective-1000",
        className
      )}
      onClick={handleFlip}
    >
      <motion.div
        className="relative w-full h-full"
        initial={false}
        animate={{ rotateY: isFlipped ? 180 : 0 }}
        transition={{ duration: 0.6, type: "spring", stiffness: 100 }}
        style={{ transformStyle: "preserve-3d" }}
      >
        {/* Front of card */}
        <div
          className={cn(
            "absolute inset-0 w-full h-full rounded-xl border border-border bg-gradient-to-br from-card to-card/80 shadow-soft p-6 flex flex-col backface-hidden"
          )}
        >
          <div className="flex items-center justify-between mb-4">
            <Badge variant="outline" className="text-xs">
              #{index + 1}
            </Badge>
            <div className="flex items-center gap-2">
              <Badge variant={getDifficultyColor(card.difficulty)}>
                {getDifficultyLabel(card.difficulty)}
              </Badge>
              <Badge variant="secondary">{card.category}</Badge>
            </div>
          </div>

          <div className="flex-1 flex items-center justify-center">
            <p className="text-lg font-medium text-foreground text-center leading-relaxed">
              {card.front}
            </p>
          </div>

          <div className="flex items-center justify-center gap-2 text-muted-foreground text-sm">
            <RotateCcw className="w-4 h-4" />
            <span>Click to flip</span>
          </div>
        </div>

        {/* Back of card */}
        <div
          className={cn(
            "absolute inset-0 w-full h-full rounded-xl border border-border bg-gradient-to-br from-primary/5 to-primary/10 shadow-soft p-6 flex flex-col backface-hidden"
          )}
          style={{ transform: "rotateY(180deg)" }}
        >
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              {card.fact_checked ? (
                <Badge variant="success" className="flex items-center gap-1">
                  <CheckCircle2 className="w-3 h-3" />
                  Verified
                </Badge>
              ) : (
                <Badge variant="warning" className="flex items-center gap-1">
                  <AlertCircle className="w-3 h-3" />
                  Unverified
                </Badge>
              )}
            </div>
            {card.tags && card.tags.length > 0 && (
              <div className="flex gap-1">
                {card.tags.slice(0, 2).map((tag) => (
                  <Badge key={tag} variant="outline" className="text-xs">
                    {tag}
                  </Badge>
                ))}
              </div>
            )}
          </div>

          <div className="flex-1 flex flex-col justify-center">
            <p className="text-base text-foreground leading-relaxed mb-4">
              {card.back}
            </p>

            {card.explanation && (
              <div className="flex items-start gap-2 p-3 rounded-lg bg-muted/50 text-sm">
                <Lightbulb className="w-4 h-4 text-warning mt-0.5 flex-shrink-0" />
                <p className="text-muted-foreground">{card.explanation}</p>
              </div>
            )}
          </div>

          {card.source && card.source !== "System" && (
            <div className="flex items-center gap-2 text-xs text-muted-foreground mt-2">
              <ExternalLink className="w-3 h-3" />
              <span className="truncate">Source: {card.source}</span>
            </div>
          )}
        </div>
      </motion.div>
    </div>
  );
}

interface FlashcardMiniProps {
  card: FlashcardType;
  onClick?: () => void;
  isActive?: boolean;
}

export function FlashcardMini({ card, onClick, isActive }: FlashcardMiniProps) {
  return (
    <div
      className={cn(
        "p-3 rounded-lg border cursor-pointer transition-all",
        isActive
          ? "border-primary bg-primary/5 shadow-soft"
          : "border-border bg-card hover:border-primary/20"
      )}
      onClick={onClick}
    >
      <p className="text-sm font-medium text-foreground line-clamp-2">
        {card.front}
      </p>
      <div className="flex items-center gap-2 mt-2">
        <Badge variant="outline" className="text-xs">
          {card.category}
        </Badge>
        {card.fact_checked && (
          <CheckCircle2 className="w-3 h-3 text-success" />
        )}
      </div>
    </div>
  );
}
