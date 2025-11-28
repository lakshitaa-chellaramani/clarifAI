"use client";

import { cn } from "@/lib/utils";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Play, Download, Radio, User } from "lucide-react";
import { useState } from "react";

interface AnchorPanelProps {
  className?: string;
  onGenerateBriefing?: () => void;
}

export function AnchorPanel({ className, onGenerateBriefing }: AnchorPanelProps) {
  const [isGenerating, setIsGenerating] = useState(false);

  const handleGenerate = async () => {
    setIsGenerating(true);
    onGenerateBriefing?.();
    // Simulate generation
    setTimeout(() => setIsGenerating(false), 2000);
  };

  return (
    <Card className={cn("", className)}>
      <CardHeader className="pb-3">
        <div className="flex items-center gap-2">
          <Radio className="h-4 w-4 text-primary" />
          <CardTitle>AI News Anchor</CardTitle>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Avatar Preview */}
        <div className="relative aspect-video rounded-lg bg-muted border border-border overflow-hidden">
          {/* Placeholder for avatar iframe */}
          <div className="absolute inset-0 flex flex-col items-center justify-center text-muted-foreground">
            <div className="h-16 w-16 rounded-full bg-muted-foreground/10 flex items-center justify-center mb-3">
              <User className="h-8 w-8" />
            </div>
            <p className="text-sm">AI Anchor Ready</p>
            <p className="text-xs mt-1">Click generate to create briefing</p>
          </div>

          {/* Uncomment to use actual iframe */}
          {/* <iframe
            src="http://localhost:8000"
            className="absolute inset-0 w-full h-full"
            title="AI News Anchor"
          /> */}
        </div>

        {/* Controls */}
        <div className="flex gap-2">
          <Button
            className="flex-1"
            onClick={handleGenerate}
            disabled={isGenerating}
          >
            <Play className="h-4 w-4 mr-2" />
            {isGenerating ? "Generating..." : "Generate Briefing"}
          </Button>
          <Button variant="outline" size="icon">
            <Download className="h-4 w-4" />
          </Button>
        </div>

        {/* Transcript Preview */}
        <div className="p-3 rounded-lg bg-muted/50 border border-border">
          <p className="text-xs text-muted-foreground mb-1">Latest Script</p>
          <p className="text-sm text-foreground line-clamp-3">
            "Good evening. Based on verified sources, here's what we know about
            the Karnataka leadership situation. The Congress high command has
            summoned both leaders for discussions..."
          </p>
        </div>
      </CardContent>
    </Card>
  );
}
