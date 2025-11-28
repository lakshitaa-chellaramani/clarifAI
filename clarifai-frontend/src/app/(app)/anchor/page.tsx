"use client";

import dynamic from "next/dynamic";
import { useSearchParams } from "next/navigation";
import { Suspense } from "react";
import { Loader2, Video } from "lucide-react";

// Dynamically import the AI Anchor Studio with SSR disabled
// This is required because TalkingHead uses Three.js which needs browser APIs
const AIAnchorStudio = dynamic(
  () => import("@/components/anchor").then((mod) => mod.AIAnchorStudio),
  {
    ssr: false,
    loading: () => (
      <div className="h-[600px] flex items-center justify-center bg-slate-100 dark:bg-slate-900 rounded-xl">
        <div className="text-center space-y-4">
          <div className="relative w-16 h-16 mx-auto">
            <div className="absolute inset-0 rounded-full border-4 border-violet-500/30" />
            <div className="absolute inset-0 rounded-full border-4 border-violet-500 border-t-transparent animate-spin" />
            <div className="absolute inset-2 rounded-full bg-gradient-to-br from-violet-600 to-purple-700 flex items-center justify-center">
              <Video className="h-5 w-5 text-white" />
            </div>
          </div>
          <p className="text-muted-foreground">Loading AI Anchor Studio...</p>
        </div>
      </div>
    ),
  }
);

function AnchorPageContent() {
  const searchParams = useSearchParams();
  const initialTopic = searchParams.get("topic") || undefined;

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Page Header */}
      <div>
        <h1 className="text-2xl font-semibold text-foreground">AI News Anchor</h1>
        <p className="text-muted-foreground mt-1">
          Generate professional video briefings with AI-powered news anchor and real-time lip-sync
        </p>
      </div>

      {/* AI Anchor Studio */}
      <AIAnchorStudio initialTopic={initialTopic} />
    </div>
  );
}

export default function AnchorPage() {
  return (
    <Suspense
      fallback={
        <div className="h-[600px] flex items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      }
    >
      <AnchorPageContent />
    </Suspense>
  );
}
