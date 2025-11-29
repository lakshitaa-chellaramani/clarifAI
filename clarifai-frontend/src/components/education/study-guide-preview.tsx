"use client";

import { useState } from "react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Download,
  BookOpen,
  Lightbulb,
  AlertTriangle,
  HelpCircle,
  BookMarked,
  ExternalLink,
  ChevronDown,
  ChevronUp,
  Copy,
  Check,
} from "lucide-react";
import type { StudyGuideResponse, Flashcard } from "@/lib/api";

interface StudyGuidePreviewProps {
  guide: StudyGuideResponse;
  flashcards?: Flashcard[];
  onDownload?: () => void;
  onExport?: () => void;
  className?: string;
}

export function StudyGuidePreview({
  guide,
  flashcards,
  onDownload,
  onExport,
  className,
}: StudyGuidePreviewProps) {
  const [expandedSections, setExpandedSections] = useState<Set<string>>(
    new Set(["overview", "key_concepts"])
  );
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const toggleSection = (section: string) => {
    setExpandedSections((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(section)) {
        newSet.delete(section);
      } else {
        newSet.add(section);
      }
      return newSet;
    });
  };

  const copyToClipboard = async (text: string, id: string) => {
    await navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const SectionHeader = ({
    id,
    icon: Icon,
    title,
    count,
  }: {
    id: string;
    icon: React.ElementType;
    title: string;
    count?: number;
  }) => (
    <button
      onClick={() => toggleSection(id)}
      className="w-full flex items-center justify-between p-4 hover:bg-muted/50 transition-colors rounded-lg"
    >
      <div className="flex items-center gap-3">
        <Icon className="w-5 h-5 text-primary" />
        <span className="font-medium text-foreground">{title}</span>
        {count !== undefined && (
          <Badge variant="secondary" className="text-xs">
            {count}
          </Badge>
        )}
      </div>
      {expandedSections.has(id) ? (
        <ChevronUp className="w-5 h-5 text-muted-foreground" />
      ) : (
        <ChevronDown className="w-5 h-5 text-muted-foreground" />
      )}
    </button>
  );

  return (
    <div className={cn("space-y-6", className)}>
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <h2 className="text-xl font-semibold text-foreground">{guide.title}</h2>
          <p className="text-sm text-muted-foreground mt-1">
            Generated on {new Date(guide.generated_at).toLocaleDateString()}
          </p>
        </div>
        <div className="flex items-center gap-2">
          {onExport && (
            <Button variant="outline" size="sm" onClick={onExport}>
              <Copy className="w-4 h-4 mr-2" />
              Copy
            </Button>
          )}
          {onDownload && (
            <Button size="sm" onClick={onDownload}>
              <Download className="w-4 h-4 mr-2" />
              Download
            </Button>
          )}
        </div>
      </div>

      {/* Overview Section */}
      <Card>
        <SectionHeader id="overview" icon={BookOpen} title="Overview" />
        {expandedSections.has("overview") && (
          <CardContent className="pt-0">
            <p className="text-muted-foreground leading-relaxed">{guide.overview}</p>
          </CardContent>
        )}
      </Card>

      {/* Key Concepts */}
      {guide.key_concepts && guide.key_concepts.length > 0 && (
        <Card>
          <SectionHeader
            id="key_concepts"
            icon={Lightbulb}
            title="Key Concepts"
            count={guide.key_concepts.length}
          />
          {expandedSections.has("key_concepts") && (
            <CardContent className="pt-0 space-y-4">
              {guide.key_concepts.map((concept, index) => (
                <div
                  key={index}
                  className="p-4 rounded-lg bg-muted/50 space-y-2"
                >
                  <h4 className="font-medium text-foreground">{concept.concept}</h4>
                  <p className="text-sm text-muted-foreground">
                    {concept.explanation}
                  </p>
                  {concept.importance && (
                    <p className="text-sm text-primary">
                      <strong>Why it matters:</strong> {concept.importance}
                    </p>
                  )}
                </div>
              ))}
            </CardContent>
          )}
        </Card>
      )}

      {/* Detailed Sections */}
      {guide.sections && guide.sections.length > 0 && (
        <Card>
          <SectionHeader
            id="sections"
            icon={BookMarked}
            title="Study Material"
            count={guide.sections.length}
          />
          {expandedSections.has("sections") && (
            <CardContent className="pt-0 space-y-6">
              {guide.sections.map((section, index) => (
                <div key={index} className="space-y-3">
                  <h4 className="font-medium text-foreground text-lg">
                    {section.title}
                  </h4>
                  <p className="text-muted-foreground">{section.content}</p>

                  {section.key_points && section.key_points.length > 0 && (
                    <div className="space-y-1">
                      <p className="text-sm font-medium text-foreground">
                        Key Points:
                      </p>
                      <ul className="list-disc list-inside space-y-1">
                        {section.key_points.map((point, i) => (
                          <li key={i} className="text-sm text-muted-foreground">
                            {point}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {section.examples && section.examples.length > 0 && (
                    <div className="p-3 rounded-lg bg-primary/5 border border-primary/10">
                      <p className="text-sm font-medium text-primary mb-2">
                        Examples:
                      </p>
                      <ul className="space-y-1">
                        {section.examples.map((example, i) => (
                          <li key={i} className="text-sm text-muted-foreground">
                            • {example}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              ))}
            </CardContent>
          )}
        </Card>
      )}

      {/* Glossary */}
      {guide.glossary && guide.glossary.length > 0 && (
        <Card>
          <SectionHeader
            id="glossary"
            icon={BookOpen}
            title="Glossary"
            count={guide.glossary.length}
          />
          {expandedSections.has("glossary") && (
            <CardContent className="pt-0">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {guide.glossary.map((item, index) => (
                  <div
                    key={index}
                    className="p-3 rounded-lg border border-border"
                  >
                    <p className="font-medium text-foreground text-sm">
                      {item.term}
                    </p>
                    <p className="text-xs text-muted-foreground mt-1">
                      {item.definition}
                    </p>
                  </div>
                ))}
              </div>
            </CardContent>
          )}
        </Card>
      )}

      {/* Common Misconceptions */}
      {guide.misconceptions && guide.misconceptions.length > 0 && (
        <Card>
          <SectionHeader
            id="misconceptions"
            icon={AlertTriangle}
            title="Common Misconceptions"
            count={guide.misconceptions.length}
          />
          {expandedSections.has("misconceptions") && (
            <CardContent className="pt-0 space-y-4">
              {guide.misconceptions.map((item, index) => (
                <div key={index} className="space-y-2">
                  <div className="flex items-start gap-2 p-3 rounded-lg bg-danger/5 border border-danger/10">
                    <AlertTriangle className="w-4 h-4 text-danger mt-0.5 flex-shrink-0" />
                    <div>
                      <p className="text-sm font-medium text-danger">Wrong:</p>
                      <p className="text-sm text-muted-foreground">
                        {item.misconception}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-start gap-2 p-3 rounded-lg bg-success/5 border border-success/10">
                    <Check className="w-4 h-4 text-success mt-0.5 flex-shrink-0" />
                    <div>
                      <p className="text-sm font-medium text-success">Correct:</p>
                      <p className="text-sm text-muted-foreground">
                        {item.correction}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </CardContent>
          )}
        </Card>
      )}

      {/* Practice Questions */}
      {guide.practice_questions && guide.practice_questions.length > 0 && (
        <Card>
          <SectionHeader
            id="practice"
            icon={HelpCircle}
            title="Practice Questions"
            count={guide.practice_questions.length}
          />
          {expandedSections.has("practice") && (
            <CardContent className="pt-0 space-y-4">
              {guide.practice_questions.map((q, index) => (
                <PracticeQuestion
                  key={index}
                  question={q}
                  index={index}
                  onCopy={(text) => copyToClipboard(text, `q-${index}`)}
                  isCopied={copiedId === `q-${index}`}
                />
              ))}
            </CardContent>
          )}
        </Card>
      )}

      {/* Study Strategies */}
      {guide.study_strategies && guide.study_strategies.length > 0 && (
        <Card>
          <SectionHeader
            id="strategies"
            icon={Lightbulb}
            title="Study Strategies"
            count={guide.study_strategies.length}
          />
          {expandedSections.has("strategies") && (
            <CardContent className="pt-0">
              <ul className="space-y-2">
                {guide.study_strategies.map((strategy, index) => (
                  <li
                    key={index}
                    className="flex items-start gap-2 text-sm text-muted-foreground"
                  >
                    <span className="text-primary font-medium">{index + 1}.</span>
                    {strategy}
                  </li>
                ))}
              </ul>
            </CardContent>
          )}
        </Card>
      )}

      {/* Resources */}
      {guide.resources && guide.resources.length > 0 && (
        <Card>
          <SectionHeader
            id="resources"
            icon={ExternalLink}
            title="Additional Resources"
            count={guide.resources.length}
          />
          {expandedSections.has("resources") && (
            <CardContent className="pt-0">
              <div className="space-y-3">
                {guide.resources.map((resource, index) => (
                  <div
                    key={index}
                    className="flex items-start gap-3 p-3 rounded-lg border border-border"
                  >
                    <div className="flex-1">
                      <p className="font-medium text-foreground text-sm">
                        {resource.title}
                      </p>
                      <p className="text-xs text-muted-foreground mt-1">
                        {resource.description}
                      </p>
                    </div>
                    <Badge variant="outline" className="text-xs">
                      {resource.type}
                    </Badge>
                  </div>
                ))}
              </div>
            </CardContent>
          )}
        </Card>
      )}
    </div>
  );
}

interface PracticeQuestionProps {
  question: {
    question: string;
    answer: string;
    difficulty: string;
  };
  index: number;
  onCopy: (text: string) => void;
  isCopied: boolean;
}

function PracticeQuestion({
  question,
  index,
  onCopy,
  isCopied,
}: PracticeQuestionProps) {
  const [showAnswer, setShowAnswer] = useState(false);

  const getDifficultyVariant = (difficulty: string) => {
    switch (difficulty) {
      case "easy":
        return "success";
      case "hard":
        return "danger";
      default:
        return "warning";
    }
  };

  return (
    <div className="p-4 rounded-lg border border-border space-y-3">
      <div className="flex items-start justify-between">
        <div className="flex items-start gap-2">
          <span className="font-medium text-primary">{index + 1}.</span>
          <p className="text-foreground">{question.question}</p>
        </div>
        <Badge variant={getDifficultyVariant(question.difficulty)} className="text-xs">
          {question.difficulty}
        </Badge>
      </div>

      <div className="flex items-center gap-2">
        <Button
          variant="outline"
          size="sm"
          onClick={() => setShowAnswer(!showAnswer)}
        >
          {showAnswer ? "Hide Answer" : "Show Answer"}
        </Button>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => onCopy(`Q: ${question.question}\nA: ${question.answer}`)}
        >
          {isCopied ? (
            <Check className="w-4 h-4 text-success" />
          ) : (
            <Copy className="w-4 h-4" />
          )}
        </Button>
      </div>

      {showAnswer && (
        <div className="p-3 rounded-lg bg-muted/50">
          <p className="text-sm text-muted-foreground">{question.answer}</p>
        </div>
      )}
    </div>
  );
}
