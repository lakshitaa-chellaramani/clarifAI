"use client";

import { cn } from "@/lib/utils";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  CheckCircle,
  AlertTriangle,
  XCircle,
  Clock,
  ChevronDown,
  ChevronUp,
  ExternalLink,
  Radio,
  Newspaper,
} from "lucide-react";
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

type EventStatus = "verified" | "conflict" | "false" | "checking";

interface ConflictDetail {
  claimA: string;
  sourceA: string;
  claimB: string;
  sourceB: string;
}

interface TimelineEvent {
  id: string | number;
  time: string;
  title: string;
  description?: string;
  sources: number;
  confidence: number;
  status: EventStatus;
  conflict?: ConflictDetail;
  sourceName?: string;
  location?: string;
}

interface NarrativeTimelineProps {
  events: TimelineEvent[];
  className?: string;
  onEventClick?: (event: TimelineEvent) => void;
}

const statusConfig: Record<EventStatus, {
  icon: typeof CheckCircle;
  color: string;
  bg: string;
  border: string;
  label: string;
}> = {
  verified: {
    icon: CheckCircle,
    color: "text-emerald-500",
    bg: "bg-emerald-500/10",
    border: "border-emerald-500/30",
    label: "Verified"
  },
  conflict: {
    icon: AlertTriangle,
    color: "text-amber-500",
    bg: "bg-amber-500/10",
    border: "border-amber-500/30",
    label: "Conflict"
  },
  checking: {
    icon: Clock,
    color: "text-slate-400",
    bg: "bg-slate-500/10",
    border: "border-slate-500/30",
    label: "Checking"
  },
  false: {
    icon: XCircle,
    color: "text-red-500",
    bg: "bg-red-500/10",
    border: "border-red-500/30",
    label: "False"
  },
};

function TimelineItem({
  event,
  isLast,
  index,
  onEventClick,
}: {
  event: TimelineEvent;
  isLast: boolean;
  index: number;
  onEventClick?: (event: TimelineEvent) => void;
}) {
  const [isExpanded, setIsExpanded] = useState(event.status === "conflict");
  const config = statusConfig[event.status];
  const Icon = config.icon;

  return (
    <motion.div
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: index * 0.1, duration: 0.3 }}
      className="relative flex gap-4"
    >
      {/* Timeline connector */}
      <div className="flex flex-col items-center">
        {/* Node */}
        <motion.div
          whileHover={{ scale: 1.1 }}
          className={cn(
            "relative z-10 h-12 w-12 rounded-full flex items-center justify-center shrink-0 border-2 transition-all cursor-pointer",
            config.bg,
            config.border,
            event.status === "conflict" && "animate-pulse"
          )}
          onClick={() => setIsExpanded(!isExpanded)}
        >
          <Icon className={cn("h-5 w-5", config.color)} />
        </motion.div>

        {/* Line */}
        {!isLast && (
          <div className="w-0.5 flex-1 bg-gradient-to-b from-border to-transparent min-h-[40px]" />
        )}
      </div>

      {/* Content */}
      <div className="flex-1 pb-8">
        {/* Header */}
        <div className="flex items-start justify-between gap-2">
          <div className="flex-1">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-xs font-mono text-muted-foreground bg-muted px-2 py-0.5 rounded">
                {event.time}
              </span>
              <Badge
                variant={
                  event.status === "verified" ? "success" :
                  event.status === "conflict" ? "warning" :
                  event.status === "false" ? "danger" : "outline"
                }
                className="text-[10px]"
              >
                {config.label}
              </Badge>
              {event.location && (
                <span className="text-xs text-muted-foreground">
                  📍 {event.location}
                </span>
              )}
            </div>

            <h3 className="text-base font-semibold text-foreground mt-2">
              {event.title}
            </h3>

            {event.description && (
              <p className="text-sm text-muted-foreground mt-1 line-clamp-2">
                {event.description}
              </p>
            )}
          </div>

          {/* Expand button for conflicts */}
          {event.conflict && (
            <Button
              variant="ghost"
              size="sm"
              className="shrink-0"
              onClick={() => setIsExpanded(!isExpanded)}
            >
              {isExpanded ? (
                <ChevronUp className="h-4 w-4" />
              ) : (
                <ChevronDown className="h-4 w-4" />
              )}
            </Button>
          )}
        </div>

        {/* Stats bar */}
        <div className="flex items-center gap-4 mt-3">
          <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
            <Newspaper className="h-3.5 w-3.5" />
            <span>{event.sources} sources</span>
          </div>
          <div className="flex-1 h-1.5 bg-muted rounded-full overflow-hidden max-w-[120px]">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${event.confidence}%` }}
              transition={{ delay: index * 0.1 + 0.3, duration: 0.5 }}
              className={cn(
                "h-full rounded-full",
                event.confidence >= 80 ? "bg-emerald-500" :
                event.confidence >= 50 ? "bg-amber-500" : "bg-red-500"
              )}
            />
          </div>
          <span className="text-xs font-medium text-muted-foreground">
            {event.confidence}% confidence
          </span>
        </div>

        {/* Conflict expansion */}
        <AnimatePresence>
          {event.conflict && isExpanded && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.2 }}
              className="overflow-hidden"
            >
              <div className="mt-4 p-4 rounded-lg bg-amber-500/5 border border-amber-500/20">
                <div className="flex items-center gap-2 mb-3">
                  <AlertTriangle className="h-4 w-4 text-amber-500" />
                  <span className="text-sm font-medium text-amber-600 dark:text-amber-400">
                    Conflicting Claims Detected
                  </span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Claim A */}
                  <div className="p-3 rounded-md bg-background border border-border">
                    <div className="flex items-center gap-2 mb-2">
                      <div className="h-2 w-2 rounded-full bg-blue-500" />
                      <span className="text-xs font-medium text-muted-foreground">
                        {event.conflict.sourceA}
                      </span>
                    </div>
                    <p className="text-sm text-foreground">
                      "{event.conflict.claimA}"
                    </p>
                  </div>

                  {/* VS divider */}
                  <div className="hidden md:flex absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 h-8 w-8 rounded-full bg-amber-500/20 items-center justify-center">
                    <span className="text-xs font-bold text-amber-600">VS</span>
                  </div>

                  {/* Claim B */}
                  <div className="p-3 rounded-md bg-background border border-border">
                    <div className="flex items-center gap-2 mb-2">
                      <div className="h-2 w-2 rounded-full bg-purple-500" />
                      <span className="text-xs font-medium text-muted-foreground">
                        {event.conflict.sourceB}
                      </span>
                    </div>
                    <p className="text-sm text-foreground">
                      "{event.conflict.claimB}"
                    </p>
                  </div>
                </div>

                <Button variant="outline" size="sm" className="mt-3 text-xs">
                  <ExternalLink className="h-3 w-3 mr-1" />
                  View Full Analysis
                </Button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Source tag */}
        {event.sourceName && (
          <div className="mt-3 inline-flex items-center gap-1.5 text-xs text-muted-foreground bg-muted/50 px-2 py-1 rounded">
            <span>Primary source:</span>
            <span className="font-medium text-foreground">{event.sourceName}</span>
          </div>
        )}
      </div>
    </motion.div>
  );
}

export function NarrativeTimeline({
  events,
  className,
  onEventClick,
}: NarrativeTimelineProps) {
  return (
    <Card className={cn("", className)}>
      <CardHeader className="pb-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Radio className="h-4 w-4 text-primary" />
            <CardTitle>Narrative Timeline</CardTitle>
          </div>
          <Badge variant="outline" className="text-xs">
            {events.length} events
          </Badge>
        </div>
      </CardHeader>
      <CardContent>
        <div className="relative">
          {events.length > 0 ? (
            events.map((event, index) => (
              <TimelineItem
                key={event.id}
                event={event}
                isLast={index === events.length - 1}
                index={index}
                onEventClick={onEventClick}
              />
            ))
          ) : (
            <div className="text-center py-8 text-muted-foreground">
              <Clock className="h-8 w-8 mx-auto mb-2 opacity-50" />
              <p className="text-sm">No timeline events available</p>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
