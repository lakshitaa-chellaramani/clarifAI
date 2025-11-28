"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import {
  Play,
  Pause,
  Square,
  RotateCcw,
  Volume2,
  VolumeX,
  Loader2,
  Mic,
  Video,
  User,
  Image,
  Sparkles,
  CheckCircle2,
  AlertCircle,
  Maximize2,
  ExternalLink,
  RefreshCw,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import {
  ScriptSegment,
  Mood,
  TTSEngine,
  PRESET_AVATARS,
  PRESET_BACKGROUNDS,
  HEADTTS_VOICES,
} from "./types";

interface AIAnchorStudioProps {
  initialTopic?: string;
  onScriptGenerated?: (script: ScriptSegment[]) => void;
}

export function AIAnchorStudio({ initialTopic, onScriptGenerated }: AIAnchorStudioProps) {
  const iframeRef = useRef<HTMLIFrameElement>(null);

  // States
  const [isLoading, setIsLoading] = useState(true);
  const [isConnected, setIsConnected] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Script states
  const [script, setScript] = useState<ScriptSegment[] | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);

  // Configuration states
  const [activeTab, setActiveTab] = useState<"script" | "avatar" | "scene" | "audio">("script");
  const [selectedAvatar, setSelectedAvatar] = useState(PRESET_AVATARS[0]);
  const [selectedBackground, setSelectedBackground] = useState(PRESET_BACKGROUNDS[0]);
  const [selectedVoice, setSelectedVoice] = useState(HEADTTS_VOICES[0].id);
  const [speechRate, setSpeechRate] = useState(1.0);

  // Overlay states
  const [anchorName, setAnchorName] = useState("ClarifAI Anchor");
  const [anchorTitle, setAnchorTitle] = useState("Fact-Checked News");
  const [showLowerThird, setShowLowerThird] = useState(true);
  const [showSubtitles, setShowSubtitles] = useState(true);

  // Script input
  const [customScript, setCustomScript] = useState("");
  const [selectedTopic, setSelectedTopic] = useState(initialTopic || "");

  const broadcastUrl = process.env.NEXT_PUBLIC_BROADCAST_URL || "http://localhost:5500";

  // Handle iframe load
  useEffect(() => {
    const iframe = iframeRef.current;
    if (!iframe) return;

    const handleLoad = () => {
      setIsLoading(false);
      setIsConnected(true);
      setError(null);
    };

    const handleError = () => {
      setIsLoading(false);
      setIsConnected(false);
      setError("Could not connect to broadcast studio");
    };

    iframe.addEventListener("load", handleLoad);
    iframe.addEventListener("error", handleError);

    // Timeout for connection
    const timeout = setTimeout(() => {
      if (isLoading) {
        setIsLoading(false);
        // Don't set error - iframe might still be loading
      }
    }, 10000);

    return () => {
      iframe.removeEventListener("load", handleLoad);
      iframe.removeEventListener("error", handleError);
      clearTimeout(timeout);
    };
  }, [isLoading]);

  // Send message to iframe
  const sendToStudio = useCallback((action: string, data?: any) => {
    if (iframeRef.current?.contentWindow) {
      iframeRef.current.contentWindow.postMessage({ action, data }, "*");
    }
  }, []);

  // Generate script from topic
  const handleGenerate = useCallback(async () => {
    const topic = selectedTopic || customScript;
    if (!topic) return;

    setIsGenerating(true);
    setScript(null);

    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 2000));

    const generatedScript: ScriptSegment[] = [
      {
        text: `Good evening, I'm your ClarifAI news anchor. Tonight, we're covering ${topic}.`,
        mood: "neutral",
        view: "upper",
        gesture: "wave",
        duration: 5,
      },
      {
        text: "Our fact-checking team has analyzed this story across multiple sources to bring you verified information.",
        mood: "neutral",
        view: "upper",
        duration: 5,
      },
      {
        text: "We've identified several key claims that require attention. Let me break them down for you.",
        mood: "neutral",
        view: "mid",
        gesture: "nod",
        duration: 5,
      },
      {
        text: "The primary claims have been verified as accurate by multiple reliable sources including major news outlets.",
        mood: "happy",
        view: "upper",
        duration: 6,
      },
      {
        text: "However, we found some conflicting information in secondary sources. Our analysis suggests approaching these with caution.",
        mood: "neutral",
        view: "mid",
        duration: 6,
      },
      {
        text: "Remember, always verify information from multiple sources before sharing. This has been your ClarifAI fact-check update.",
        mood: "neutral",
        view: "upper",
        gesture: "nod",
        duration: 6,
      },
    ];

    setScript(generatedScript);
    setIsGenerating(false);
    onScriptGenerated?.(generatedScript);
  }, [selectedTopic, customScript, onScriptGenerated]);

  // Open studio in new window
  const openInNewWindow = () => {
    window.open(broadcastUrl, "_blank", "width=1400,height=900");
  };

  // Reload iframe
  const reloadStudio = () => {
    setIsLoading(true);
    setError(null);
    if (iframeRef.current) {
      iframeRef.current.src = broadcastUrl;
    }
  };

  const totalDuration = script?.reduce((acc, s) => acc + (s.duration || 5), 0) || 0;

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Video Preview */}
        <div className="lg:col-span-2 space-y-4">
          <Card className="overflow-hidden">
            <div className="relative aspect-video bg-muted">
              {/* Iframe Container */}
              <iframe
                ref={iframeRef}
                src={broadcastUrl}
                className="absolute inset-0 w-full h-full border-0"
                title="AI News Anchor Studio"
                allow="microphone; camera"
              />

              {/* Loading Overlay */}
              {isLoading && (
                <div className="absolute inset-0 z-10 bg-background/95 flex items-center justify-center">
                  <div className="text-center space-y-4">
                    <div className="relative w-16 h-16 mx-auto">
                      <div className="absolute inset-0 rounded-full border-4 border-primary/30" />
                      <div className="absolute inset-0 rounded-full border-4 border-primary border-t-transparent animate-spin" />
                      <div className="absolute inset-2 rounded-full bg-primary/10 flex items-center justify-center">
                        <Video className="h-6 w-6 text-primary" />
                      </div>
                    </div>
                    <div>
                      <p className="font-medium">Loading Broadcast Studio</p>
                      <p className="text-sm text-muted-foreground mt-1">Initializing TalkingHead and HeadTTS...</p>
                    </div>
                  </div>
                </div>
              )}

              {/* Error Overlay */}
              {error && !isLoading && (
                <div className="absolute inset-0 z-10 bg-background/95 flex items-center justify-center">
                  <div className="text-center space-y-4 max-w-sm">
                    <AlertCircle className="h-12 w-12 text-destructive mx-auto" />
                    <div>
                      <p className="font-medium">Connection Issue</p>
                      <p className="text-sm text-muted-foreground mt-1">{error}</p>
                      <p className="text-xs text-muted-foreground mt-2">
                        Make sure the broadcast studio is running at {broadcastUrl}
                      </p>
                    </div>
                    <div className="flex gap-2 justify-center">
                      <Button variant="outline" size="sm" onClick={reloadStudio}>
                        <RefreshCw className="h-4 w-4 mr-1" />
                        Retry
                      </Button>
                      <Button variant="outline" size="sm" onClick={openInNewWindow}>
                        <ExternalLink className="h-4 w-4 mr-1" />
                        Open Externally
                      </Button>
                    </div>
                  </div>
                </div>
              )}

              {/* Generating Overlay */}
              {isGenerating && (
                <div className="absolute inset-0 z-10 bg-background/80 flex items-center justify-center">
                  <div className="text-center space-y-4">
                    <Loader2 className="h-12 w-12 text-primary mx-auto animate-spin" />
                    <div>
                      <p className="font-medium">Generating Script</p>
                      <p className="text-sm text-muted-foreground">Analyzing sources and creating your briefing...</p>
                    </div>
                  </div>
                </div>
              )}

              {/* Status Badge */}
              {!isLoading && !error && (
                <div className="absolute top-3 right-3 z-10">
                  <Badge
                    variant={isConnected ? "default" : "secondary"}
                    className="bg-background/80 backdrop-blur-sm"
                  >
                    <span className={cn(
                      "w-1.5 h-1.5 rounded-full mr-1.5",
                      isConnected ? "bg-green-500" : "bg-yellow-500"
                    )} />
                    {isConnected ? "Connected" : "Connecting..."}
                  </Badge>
                </div>
              )}
            </div>

            {/* Controls */}
            <CardContent className="p-4 border-t">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Button variant="outline" size="sm" onClick={reloadStudio}>
                    <RefreshCw className="h-4 w-4 mr-1" />
                    Reload
                  </Button>
                  <Button variant="outline" size="sm" onClick={openInNewWindow}>
                    <ExternalLink className="h-4 w-4 mr-1" />
                    Open Full Studio
                  </Button>
                </div>
                <p className="text-xs text-muted-foreground">
                  Use the full studio for complete control over avatars, TTS, and recording
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Generated Script */}
          {script && (
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-base flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4 text-green-500" />
                  Generated Script
                  <Badge variant="secondary" className="ml-auto text-xs">
                    {script.length} segments · ~{totalDuration}s
                  </Badge>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3 max-h-60 overflow-y-auto">
                  {script.map((segment, index) => (
                    <div
                      key={index}
                      className="p-3 rounded-lg border bg-muted/30"
                    >
                      <div className="flex items-center gap-2 mb-2">
                        <Badge variant="outline" className="text-[10px]">
                          {index + 1}
                        </Badge>
                        <Badge variant="outline" className="text-[10px] capitalize">
                          {segment.mood || "neutral"}
                        </Badge>
                        {segment.gesture && (
                          <Badge variant="outline" className="text-[10px] capitalize">
                            {segment.gesture}
                          </Badge>
                        )}
                        <span className="text-xs text-muted-foreground ml-auto">
                          {segment.duration || 5}s
                        </span>
                      </div>
                      <p className="text-sm">{segment.text}</p>
                    </div>
                  ))}
                </div>
                <div className="mt-4 pt-4 border-t">
                  <p className="text-xs text-muted-foreground">
                    Copy this script to the broadcast studio to use with your AI anchor
                  </p>
                </div>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Configuration Panel */}
        <div className="space-y-4">
          {/* Tabs */}
          <div className="flex gap-1 p-1 bg-muted rounded-lg">
            {[
              { id: "script", icon: Sparkles, label: "Script" },
              { id: "avatar", icon: User, label: "Avatar" },
              { id: "scene", icon: Image, label: "Scene" },
              { id: "audio", icon: Mic, label: "Audio" },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as typeof activeTab)}
                className={cn(
                  "flex-1 flex items-center justify-center gap-1.5 px-3 py-2 rounded-md text-sm font-medium transition-all",
                  activeTab === tab.id
                    ? "bg-background shadow-sm text-foreground"
                    : "text-muted-foreground hover:text-foreground"
                )}
              >
                <tab.icon className="h-4 w-4" />
                <span className="hidden sm:inline">{tab.label}</span>
              </button>
            ))}
          </div>

          {/* Script Tab */}
          {activeTab === "script" && (
            <Card>
              <CardContent className="p-4 space-y-4">
                <div>
                  <label className="text-sm font-medium mb-2 block">Topic</label>
                  <input
                    type="text"
                    value={selectedTopic}
                    onChange={(e) => setSelectedTopic(e.target.value)}
                    placeholder="Enter news topic..."
                    className="w-full h-10 px-3 rounded-lg border bg-background focus:outline-none focus:ring-2 focus:ring-primary"
                  />
                </div>

                <div className="relative">
                  <div className="absolute inset-0 flex items-center">
                    <div className="w-full border-t" />
                  </div>
                  <div className="relative flex justify-center text-xs">
                    <span className="bg-card px-2 text-muted-foreground">or</span>
                  </div>
                </div>

                <div>
                  <label className="text-sm font-medium mb-2 block">Custom Script</label>
                  <textarea
                    value={customScript}
                    onChange={(e) => setCustomScript(e.target.value)}
                    placeholder="Write your own script..."
                    rows={4}
                    className="w-full px-3 py-2 rounded-lg border bg-background focus:outline-none focus:ring-2 focus:ring-primary resize-none"
                  />
                </div>

                <Button
                  className="w-full"
                  onClick={handleGenerate}
                  disabled={isGenerating || (!selectedTopic && !customScript)}
                >
                  {isGenerating ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Generating...
                    </>
                  ) : (
                    <>
                      <Sparkles className="h-4 w-4 mr-2" />
                      Generate Script
                    </>
                  )}
                </Button>

                <div className="border-t pt-4 space-y-3">
                  <div>
                    <label className="text-sm font-medium mb-2 block">Anchor Name</label>
                    <input
                      type="text"
                      value={anchorName}
                      onChange={(e) => setAnchorName(e.target.value)}
                      className="w-full h-9 px-3 rounded-lg border bg-background text-sm"
                    />
                  </div>
                  <div>
                    <label className="text-sm font-medium mb-2 block">Title</label>
                    <input
                      type="text"
                      value={anchorTitle}
                      onChange={(e) => setAnchorTitle(e.target.value)}
                      className="w-full h-9 px-3 rounded-lg border bg-background text-sm"
                    />
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Avatar Tab */}
          {activeTab === "avatar" && (
            <Card>
              <CardContent className="p-4 space-y-4">
                <div>
                  <label className="text-sm font-medium mb-2 block">Select Avatar</label>
                  <div className="grid grid-cols-3 gap-2">
                    {PRESET_AVATARS.map((avatar) => (
                      <button
                        key={avatar.id}
                        onClick={() => setSelectedAvatar(avatar)}
                        className={cn(
                          "relative aspect-square rounded-lg overflow-hidden border-2 transition-all",
                          selectedAvatar.id === avatar.id
                            ? "border-primary ring-2 ring-primary/30"
                            : "border-border hover:border-primary/50"
                        )}
                      >
                        {avatar.thumbnail ? (
                          <img
                            src={avatar.thumbnail}
                            alt={avatar.name}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <div className="w-full h-full bg-muted flex items-center justify-center">
                            <User className="h-6 w-6 text-muted-foreground" />
                          </div>
                        )}
                        <div className="absolute bottom-0 left-0 right-0 bg-black/70 px-1 py-0.5">
                          <p className="text-white text-[10px] truncate">{avatar.name}</p>
                        </div>
                      </button>
                    ))}
                  </div>
                </div>

                <p className="text-xs text-muted-foreground">
                  Avatar selection is configured in the broadcast studio. Use the full studio for complete control.
                </p>
              </CardContent>
            </Card>
          )}

          {/* Scene Tab */}
          {activeTab === "scene" && (
            <Card>
              <CardContent className="p-4 space-y-4">
                <div>
                  <label className="text-sm font-medium mb-2 block">Background</label>
                  <div className="grid grid-cols-3 gap-2">
                    {PRESET_BACKGROUNDS.map((bg) => (
                      <button
                        key={bg.id}
                        onClick={() => setSelectedBackground(bg)}
                        className={cn(
                          "relative aspect-video rounded-lg overflow-hidden border-2 transition-all",
                          selectedBackground.id === bg.id
                            ? "border-primary ring-2 ring-primary/30"
                            : "border-border hover:border-primary/50"
                        )}
                      >
                        <img
                          src={bg.thumbnail}
                          alt={bg.name}
                          className="w-full h-full object-cover"
                        />
                      </button>
                    ))}
                  </div>
                </div>

                <p className="text-xs text-muted-foreground">
                  Scene configuration is managed in the broadcast studio.
                </p>
              </CardContent>
            </Card>
          )}

          {/* Audio Tab */}
          {activeTab === "audio" && (
            <Card>
              <CardContent className="p-4 space-y-4">
                <div>
                  <label className="text-sm font-medium mb-2 block">Voice</label>
                  <select
                    value={selectedVoice}
                    onChange={(e) => setSelectedVoice(e.target.value)}
                    className="w-full h-10 px-3 rounded-lg border bg-background"
                  >
                    {HEADTTS_VOICES.map((voice) => (
                      <option key={voice.id} value={voice.id}>
                        {voice.name}
                      </option>
                    ))}
                  </select>
                  <p className="text-xs text-muted-foreground mt-1">
                    Neural voices with automatic lip-sync
                  </p>
                </div>

                <div>
                  <label className="text-sm font-medium mb-2 block">
                    Speech Rate: {speechRate.toFixed(1)}x
                  </label>
                  <input
                    type="range"
                    min="0.5"
                    max="1.5"
                    step="0.1"
                    value={speechRate}
                    onChange={(e) => setSpeechRate(parseFloat(e.target.value))}
                    className="w-full"
                  />
                </div>

                <p className="text-xs text-muted-foreground">
                  Audio settings are configured in the broadcast studio.
                </p>
              </CardContent>
            </Card>
          )}

          {/* Tips */}
          <Card>
            <CardContent className="p-4">
              <h3 className="text-sm font-medium mb-2">Tips</h3>
              <ul className="text-xs text-muted-foreground space-y-1">
                <li>• Generate a script based on your topic</li>
                <li>• Use the broadcast studio for full control</li>
                <li>• HeadTTS provides the best lip-sync quality</li>
                <li>• Export videos in HD for best results</li>
              </ul>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
