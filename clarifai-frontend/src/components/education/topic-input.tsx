"use client";

import { useState } from "react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import {
  Search,
  Sparkles,
  GraduationCap,
  BookOpen,
  Beaker,
  Globe,
  Calculator,
  Music,
  Palette,
  Code,
} from "lucide-react";

interface TopicInputProps {
  onSubmit: (topic: string, numCards: number, difficulty: string) => void;
  isLoading?: boolean;
  className?: string;
}

const DIFFICULTY_OPTIONS = [
  { value: "beginner", label: "Beginner", description: "Basic concepts" },
  { value: "intermediate", label: "Intermediate", description: "Deeper understanding" },
  { value: "advanced", label: "Advanced", description: "Expert level" },
];

const CARD_COUNT_OPTIONS = [5, 10, 15, 20];

const SUGGESTED_TOPICS = [
  { icon: Beaker, label: "Science", topics: ["Photosynthesis", "Newton's Laws", "DNA Structure"] },
  { icon: Globe, label: "History", topics: ["World War II", "Roman Empire", "French Revolution"] },
  { icon: Calculator, label: "Math", topics: ["Calculus Basics", "Linear Algebra", "Statistics"] },
  { icon: Code, label: "Technology", topics: ["Machine Learning", "Cybersecurity", "Cloud Computing"] },
  { icon: BookOpen, label: "Literature", topics: ["Shakespeare", "Greek Mythology", "Poetry Analysis"] },
  { icon: Palette, label: "Arts", topics: ["Renaissance Art", "Music Theory", "Art History"] },
];

export function TopicInput({ onSubmit, isLoading, className }: TopicInputProps) {
  const [topic, setTopic] = useState("");
  const [numCards, setNumCards] = useState(10);
  const [difficulty, setDifficulty] = useState("intermediate");
  const [showSuggestions, setShowSuggestions] = useState(true);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (topic.trim()) {
      onSubmit(topic.trim(), numCards, difficulty);
    }
  };

  const handleSuggestionClick = (suggestedTopic: string) => {
    setTopic(suggestedTopic);
    setShowSuggestions(false);
  };

  return (
    <div className={cn("space-y-6", className)}>
      {/* Main Input Form */}
      <Card>
        <CardContent className="p-6">
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Topic Input */}
            <div className="space-y-2">
              <label className="text-sm font-medium text-foreground">
                What would you like to study?
              </label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                <input
                  type="text"
                  value={topic}
                  onChange={(e) => {
                    setTopic(e.target.value);
                    setShowSuggestions(e.target.value.length === 0);
                  }}
                  placeholder="e.g., Photosynthesis, World War II, Machine Learning..."
                  className="w-full h-12 pl-10 pr-4 rounded-lg border border-border bg-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary"
                  disabled={isLoading}
                />
              </div>
            </div>

            {/* Settings Row */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Number of Cards */}
              <div className="space-y-2">
                <label className="text-sm font-medium text-foreground">
                  Number of Flashcards
                </label>
                <div className="flex gap-2">
                  {CARD_COUNT_OPTIONS.map((count) => (
                    <button
                      key={count}
                      type="button"
                      onClick={() => setNumCards(count)}
                      className={cn(
                        "flex-1 h-10 rounded-lg border text-sm font-medium transition-all",
                        numCards === count
                          ? "border-primary bg-primary/10 text-primary"
                          : "border-border bg-background text-muted-foreground hover:border-primary/50"
                      )}
                      disabled={isLoading}
                    >
                      {count}
                    </button>
                  ))}
                </div>
              </div>

              {/* Difficulty */}
              <div className="space-y-2">
                <label className="text-sm font-medium text-foreground">
                  Difficulty Level
                </label>
                <div className="flex gap-2">
                  {DIFFICULTY_OPTIONS.map((option) => (
                    <button
                      key={option.value}
                      type="button"
                      onClick={() => setDifficulty(option.value)}
                      className={cn(
                        "flex-1 h-10 rounded-lg border text-sm font-medium transition-all",
                        difficulty === option.value
                          ? "border-primary bg-primary/10 text-primary"
                          : "border-border bg-background text-muted-foreground hover:border-primary/50"
                      )}
                      disabled={isLoading}
                    >
                      {option.label}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Generate Button */}
            <Button
              type="submit"
              size="lg"
              className="w-full gap-2"
              disabled={!topic.trim() || isLoading}
            >
              {isLoading ? (
                <>
                  <div className="w-4 h-4 border-2 border-white/20 border-t-white rounded-full animate-spin" />
                  Generating Flashcards...
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4" />
                  Generate Flashcards
                </>
              )}
            </Button>
          </form>
        </CardContent>
      </Card>

      {/* Suggested Topics */}
      {showSuggestions && !isLoading && (
        <div className="space-y-4">
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <GraduationCap className="w-4 h-4" />
            <span>Popular study topics</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {SUGGESTED_TOPICS.map((category) => (
              <Card key={category.label} className="overflow-hidden">
                <CardContent className="p-4">
                  <div className="flex items-center gap-2 mb-3">
                    <category.icon className="w-4 h-4 text-primary" />
                    <span className="text-sm font-medium text-foreground">
                      {category.label}
                    </span>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {category.topics.map((t) => (
                      <Badge
                        key={t}
                        variant="outline"
                        className="cursor-pointer hover:bg-primary/10 hover:border-primary/50 transition-colors"
                        onClick={() => handleSuggestionClick(t)}
                      >
                        {t}
                      </Badge>
                    ))}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
