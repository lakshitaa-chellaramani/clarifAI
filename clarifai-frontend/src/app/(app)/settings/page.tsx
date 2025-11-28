"use client";

import { useState } from "react";
import { useTheme } from "next-themes";
import {
  Sun,
  Moon,
  Monitor,
  Bell,
  Shield,
  Database,
  Key,
  Globe,
  CheckCircle2,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

export default function SettingsPage() {
  const { theme, setTheme } = useTheme();
  const [notifications, setNotifications] = useState({
    newTopics: true,
    claimVerified: true,
    conflictDetected: true,
    falseClaimAlert: true,
  });

  return (
    <div className="space-y-6 animate-fade-in max-w-3xl">
      {/* Page Header */}
      <div>
        <h1 className="text-2xl font-semibold text-foreground">Settings</h1>
        <p className="text-muted-foreground mt-1">
          Manage your preferences and application settings
        </p>
      </div>

      {/* Appearance */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2">
            <Sun className="h-4 w-4 text-primary" />
            Appearance
          </CardTitle>
          <CardDescription>Customize how ClarifAI looks</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium mb-3 block">Theme</label>
              <div className="grid grid-cols-3 gap-3">
                {[
                  { value: "light", icon: Sun, label: "Light" },
                  { value: "dark", icon: Moon, label: "Dark" },
                  { value: "system", icon: Monitor, label: "System" },
                ].map((option) => (
                  <button
                    key={option.value}
                    onClick={() => setTheme(option.value)}
                    className={cn(
                      "flex flex-col items-center gap-2 p-4 rounded-lg border transition-all",
                      theme === option.value
                        ? "border-primary bg-primary/5"
                        : "border-border hover:border-primary/50"
                    )}
                  >
                    <option.icon
                      className={cn(
                        "h-5 w-5",
                        theme === option.value ? "text-primary" : "text-muted-foreground"
                      )}
                    />
                    <span
                      className={cn(
                        "text-sm",
                        theme === option.value ? "text-primary font-medium" : "text-muted-foreground"
                      )}
                    >
                      {option.label}
                    </span>
                    {theme === option.value && (
                      <CheckCircle2 className="h-4 w-4 text-primary absolute top-2 right-2" />
                    )}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Notifications */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2">
            <Bell className="h-4 w-4 text-primary" />
            Notifications
          </CardTitle>
          <CardDescription>Choose what you want to be notified about</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {[
              {
                key: "newTopics",
                title: "New Topics",
                description: "Get notified when new high-risk topics are detected",
              },
              {
                key: "claimVerified",
                title: "Claim Verified",
                description: "Notifications when claims are verified",
              },
              {
                key: "conflictDetected",
                title: "Conflict Detected",
                description: "Alert when conflicting claims are found",
              },
              {
                key: "falseClaimAlert",
                title: "False Claim Alert",
                description: "Important alerts for detected false claims",
              },
            ].map((item) => (
              <div key={item.key} className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium">{item.title}</p>
                  <p className="text-xs text-muted-foreground">{item.description}</p>
                </div>
                <button
                  onClick={() =>
                    setNotifications((prev) => ({
                      ...prev,
                      [item.key]: !prev[item.key as keyof typeof prev],
                    }))
                  }
                  className={cn(
                    "relative w-11 h-6 rounded-full transition-colors",
                    notifications[item.key as keyof typeof notifications]
                      ? "bg-primary"
                      : "bg-muted"
                  )}
                >
                  <span
                    className={cn(
                      "absolute top-1 left-1 w-4 h-4 rounded-full bg-white transition-transform",
                      notifications[item.key as keyof typeof notifications] && "translate-x-5"
                    )}
                  />
                </button>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* API Configuration */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2">
            <Key className="h-4 w-4 text-primary" />
            API Configuration
          </CardTitle>
          <CardDescription>Backend connection settings</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex items-center justify-between p-3 rounded-lg bg-muted/50">
              <div className="flex items-center gap-3">
                <Globe className="h-5 w-5 text-muted-foreground" />
                <div>
                  <p className="text-sm font-medium">API Endpoint</p>
                  <p className="text-xs text-muted-foreground">
                    {process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000"}
                  </p>
                </div>
              </div>
              <Badge variant="success">Connected</Badge>
            </div>
            <div className="flex items-center justify-between p-3 rounded-lg bg-muted/50">
              <div className="flex items-center gap-3">
                <Database className="h-5 w-5 text-muted-foreground" />
                <div>
                  <p className="text-sm font-medium">Graph Database</p>
                  <p className="text-xs text-muted-foreground">Neo4j Aura</p>
                </div>
              </div>
              <Badge variant="success">Connected</Badge>
            </div>
            <div className="flex items-center justify-between p-3 rounded-lg bg-muted/50">
              <div className="flex items-center gap-3">
                <Shield className="h-5 w-5 text-muted-foreground" />
                <div>
                  <p className="text-sm font-medium">Broadcast Studio</p>
                  <p className="text-xs text-muted-foreground">
                    {process.env.NEXT_PUBLIC_BROADCAST_URL || "http://localhost:5500"}
                  </p>
                </div>
              </div>
              <Badge variant="outline">Optional</Badge>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* About */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">About ClarifAI</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            <div className="flex justify-between">
              <span className="text-sm text-muted-foreground">Version</span>
              <span className="text-sm">1.0.0</span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm text-muted-foreground">Built for</span>
              <span className="text-sm">MumbaiHacks 2025</span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm text-muted-foreground">Track</span>
              <span className="text-sm">Misinformation Detection</span>
            </div>
          </div>
          <div className="mt-4 pt-4 border-t border-border">
            <p className="text-xs text-muted-foreground">
              ClarifAI is an intelligent fact-checking platform that uses AI to detect
              misinformation, verify claims, and provide transparent explanations through
              knowledge graphs.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
