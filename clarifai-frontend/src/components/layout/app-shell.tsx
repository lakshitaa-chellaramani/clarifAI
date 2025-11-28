"use client";

import { useState } from "react";
import { Sidebar } from "./sidebar";
import { Header } from "./header";

interface AppShellProps {
  children: React.ReactNode;
}

export function AppShell({ children }: AppShellProps) {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

  return (
    <div className="min-h-screen bg-background">
      <Sidebar
        collapsed={sidebarCollapsed}
        onToggle={() => setSidebarCollapsed(!sidebarCollapsed)}
      />
      <div
        className="transition-all duration-300"
        style={{
          marginLeft: sidebarCollapsed ? "64px" : "240px",
        }}
      >
        <Header onMenuClick={() => setSidebarCollapsed(!sidebarCollapsed)} />
        <main className="p-6">
          {children}
        </main>
      </div>
    </div>
  );
}
