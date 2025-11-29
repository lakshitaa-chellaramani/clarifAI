"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Newspaper,
  Search,
  MessageSquare,
  Video,
  BarChart3,
  Settings,
  ChevronLeft,
  ChevronRight,
  Shield,
  Network,
  GraduationCap,
  Sparkles,
  BookOpen,
} from "lucide-react";
import { cn } from "@/lib/utils";

interface SidebarProps {
  collapsed: boolean;
  onToggle: () => void;
}

const navItems = [
  {
    title: "Dashboard",
    href: "/dashboard",
    icon: LayoutDashboard,
  },
  {
    title: "Daily Digest",
    href: "/daily",
    icon: Sparkles,
  },
  {
    title: "Today's News",
    href: "/news",
    icon: Newspaper,
  },
  {
    title: "Search",
    href: "/search",
    icon: Search,
  },
  {
    title: "AI Chat",
    href: "/chat",
    icon: MessageSquare,
  },
  {
    title: "AI Anchor",
    href: "/anchor",
    icon: Video,
  },
  {
    title: "Narrative Graph",
    href: "/narrative",
    icon: Network,
  },
  {
    title: "Research Hub",
    href: "/research",
    icon: GraduationCap,
  },
  {
    title: "Learning",
    href: "/education",
    icon: BookOpen,
  },
  {
    title: "Analytics",
    href: "/analytics",
    icon: BarChart3,
  },
];

const bottomNavItems = [
  {
    title: "Settings",
    href: "/settings",
    icon: Settings,
  },
];

export function Sidebar({ collapsed, onToggle }: SidebarProps) {
  const pathname = usePathname();

  return (
    <aside
      className={cn(
        "fixed left-0 top-0 z-40 h-screen bg-card border-r border-border transition-all duration-300",
        collapsed ? "w-16" : "w-60"
      )}
    >
      {/* Logo */}
      <div className="flex h-16 items-center justify-between px-4 border-b border-border">
        <Link href="/dashboard" className="flex items-center gap-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary">
            <Shield className="h-4 w-4 text-primary-foreground" />
          </div>
          {!collapsed && (
            <span className="font-semibold text-lg text-gradient">ClarifAI</span>
          )}
        </Link>
        <button
          onClick={onToggle}
          className={cn(
            "p-1.5 rounded-md hover:bg-accent text-muted-foreground hover:text-foreground transition-colors",
            collapsed && "hidden"
          )}
        >
          <ChevronLeft className="h-4 w-4" />
        </button>
      </div>

      {/* Toggle button when collapsed */}
      {collapsed && (
        <button
          onClick={onToggle}
          className="absolute -right-3 top-20 z-50 flex h-6 w-6 items-center justify-center rounded-full bg-card border border-border shadow-sm hover:bg-accent transition-colors"
        >
          <ChevronRight className="h-3 w-3" />
        </button>
      )}

      {/* Navigation */}
      <nav className="flex flex-col justify-between h-[calc(100vh-4rem)] p-3">
        <div className="space-y-1">
          {navItems.map((item) => {
            const isActive = pathname === item.href || pathname.startsWith(item.href + "/");
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-200",
                  isActive
                    ? "bg-primary/10 text-primary"
                    : "text-muted-foreground hover:bg-accent hover:text-foreground",
                  collapsed && "justify-center px-2"
                )}
                title={collapsed ? item.title : undefined}
              >
                <item.icon className={cn("h-5 w-5 shrink-0", isActive && "text-primary")} />
                {!collapsed && <span>{item.title}</span>}
              </Link>
            );
          })}
        </div>

        <div className="space-y-1 border-t border-border pt-3">
          {bottomNavItems.map((item) => {
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-200",
                  isActive
                    ? "bg-primary/10 text-primary"
                    : "text-muted-foreground hover:bg-accent hover:text-foreground",
                  collapsed && "justify-center px-2"
                )}
                title={collapsed ? item.title : undefined}
              >
                <item.icon className="h-5 w-5 shrink-0" />
                {!collapsed && <span>{item.title}</span>}
              </Link>
            );
          })}
        </div>
      </nav>
    </aside>
  );
}
