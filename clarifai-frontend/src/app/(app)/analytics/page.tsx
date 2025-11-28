"use client";

import {
  TrendingUp,
  TrendingDown,
  BarChart3,
  PieChart,
  Activity,
  Users,
  Clock,
  CheckCircle2,
  AlertTriangle,
  XCircle,
  LineChart,
  Zap,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { DonutChart, BarChart, AreaChart } from "@/components/charts";

// Mock analytics data
const stats = [
  {
    title: "Total Claims Analyzed",
    value: "12,847",
    change: "+12.5%",
    trend: "up",
    icon: BarChart3,
    description: "vs last week",
  },
  {
    title: "Accuracy Rate",
    value: "89.3%",
    change: "+2.1%",
    trend: "up",
    icon: CheckCircle2,
    description: "verification accuracy",
  },
  {
    title: "Active Sources",
    value: "47",
    change: "+3",
    trend: "up",
    icon: Activity,
    description: "monitored sources",
  },
  {
    title: "Avg. Response Time",
    value: "1.2s",
    change: "-0.3s",
    trend: "up",
    icon: Clock,
    description: "per fact-check",
  },
];

const claimBreakdown = [
  { name: "Verified", value: 8234, color: "#22C55E" },
  { name: "Conflicting", value: 2103, color: "#F59E0B" },
  { name: "False", value: 1547, color: "#EF4444" },
  { name: "Pending", value: 963, color: "#6B7280" },
];

const topSources = [
  { name: "Times of India", value: 94, claims: 342 },
  { name: "The Hindu", value: 91, claims: 176 },
  { name: "NDTV", value: 87, claims: 287 },
  { name: "Hindustan Times", value: 82, claims: 256 },
  { name: "India Today", value: 79, claims: 198 },
];

const weeklyTrend = [
  { name: "Mon", value: 1245, value2: 1120 },
  { name: "Tue", value: 1890, value2: 1680 },
  { name: "Wed", value: 2100, value2: 1890 },
  { name: "Thu", value: 1780, value2: 1620 },
  { name: "Fri", value: 2340, value2: 2150 },
  { name: "Sat", value: 1650, value2: 1480 },
  { name: "Sun", value: 1420, value2: 1290 },
];

const recentActivity = [
  { action: "Claim verified", topic: "Karnataka Crisis", time: "2 min ago", status: "verified" },
  { action: "New conflict detected", topic: "Tech Layoffs", time: "5 min ago", status: "conflict" },
  { action: "False claim flagged", topic: "Unknown Source", time: "12 min ago", status: "false" },
  { action: "New topic tracked", topic: "Climate Summit", time: "18 min ago", status: "new" },
  { action: "Source added", topic: "The Print", time: "25 min ago", status: "verified" },
];

const performanceMetrics = [
  { name: "API Latency", value: "45ms", status: "excellent", icon: Zap },
  { name: "Uptime", value: "99.9%", status: "excellent", icon: Activity },
  { name: "Queue Depth", value: "12", status: "good", icon: BarChart3 },
  { name: "Error Rate", value: "0.02%", status: "excellent", icon: AlertTriangle },
];

export default function AnalyticsPage() {
  const totalClaims = claimBreakdown.reduce((acc, item) => acc + item.value, 0);

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Page Header */}
      <div>
        <h1 className="text-2xl font-semibold text-foreground">Analytics</h1>
        <p className="text-muted-foreground mt-1">
          System performance and fact-checking metrics
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((stat, index) => (
          <Card
            key={stat.title}
            className="relative overflow-hidden group hover:shadow-lg transition-all duration-300"
          >
            {/* Gradient accent */}
            <div
              className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-violet-500 to-purple-600"
              style={{ opacity: 0.8 + index * 0.05 }}
            />
            <CardContent className="p-5">
              <div className="flex items-start justify-between">
                <div className="space-y-1">
                  <p className="text-sm text-muted-foreground">{stat.title}</p>
                  <p className="text-3xl font-bold tracking-tight">{stat.value}</p>
                  <div className="flex items-center gap-2">
                    <div
                      className={cn(
                        "flex items-center gap-1 text-xs font-medium px-1.5 py-0.5 rounded",
                        stat.trend === "up"
                          ? "text-green-700 bg-green-100 dark:text-green-400 dark:bg-green-950"
                          : "text-red-700 bg-red-100 dark:text-red-400 dark:bg-red-950"
                      )}
                    >
                      {stat.trend === "up" ? (
                        <TrendingUp className="h-3 w-3" />
                      ) : (
                        <TrendingDown className="h-3 w-3" />
                      )}
                      {stat.change}
                    </div>
                    <span className="text-xs text-muted-foreground">{stat.description}</span>
                  </div>
                </div>
                <div className="p-3 rounded-xl bg-gradient-to-br from-violet-500/10 to-purple-600/10 group-hover:from-violet-500/20 group-hover:to-purple-600/20 transition-colors">
                  <stat.icon className="h-6 w-6 text-violet-600 dark:text-violet-400" />
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Claim Status Donut Chart */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base flex items-center gap-2">
              <PieChart className="h-4 w-4 text-violet-500" />
              Claim Distribution
            </CardTitle>
            <CardDescription>Breakdown by verification status</CardDescription>
          </CardHeader>
          <CardContent>
            <DonutChart
              data={claimBreakdown}
              centerValue={totalClaims.toLocaleString()}
              centerLabel="Total Claims"
            />
            {/* Legend */}
            <div className="grid grid-cols-2 gap-2 mt-4">
              {claimBreakdown.map((item) => (
                <div key={item.name} className="flex items-center gap-2">
                  <div
                    className="w-3 h-3 rounded-full"
                    style={{ backgroundColor: item.color }}
                  />
                  <span className="text-sm text-muted-foreground">{item.name}</span>
                  <span className="text-sm font-medium ml-auto">
                    {((item.value / totalClaims) * 100).toFixed(0)}%
                  </span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Weekly Claims Trend */}
        <Card className="lg:col-span-2">
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-base flex items-center gap-2">
                  <LineChart className="h-4 w-4 text-violet-500" />
                  Weekly Claims Activity
                </CardTitle>
                <CardDescription>Claims analyzed vs verified this week</CardDescription>
              </div>
              <div className="flex items-center gap-4 text-xs">
                <div className="flex items-center gap-1.5">
                  <div className="w-3 h-0.5 bg-violet-500 rounded" />
                  <span className="text-muted-foreground">Analyzed</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <div className="w-3 h-0.5 bg-green-500 rounded" />
                  <span className="text-muted-foreground">Verified</span>
                </div>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <AreaChart
              data={weeklyTrend}
              height={250}
              showSecondary
              primaryColor="#8B5CF6"
              secondaryColor="#22C55E"
            />
          </CardContent>
        </Card>
      </div>

      {/* Source Accuracy & Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Top Sources by Accuracy */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base flex items-center gap-2">
              <Users className="h-4 w-4 text-violet-500" />
              Source Accuracy Ranking
            </CardTitle>
            <CardDescription>Top 5 sources by verification accuracy</CardDescription>
          </CardHeader>
          <CardContent>
            <BarChart
              data={topSources}
              height={280}
              layout="vertical"
            />
          </CardContent>
        </Card>

        {/* Recent Activity & System Health */}
        <div className="space-y-6">
          {/* System Health */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base flex items-center gap-2">
                <Activity className="h-4 w-4 text-violet-500" />
                System Health
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-3">
                {performanceMetrics.map((metric) => (
                  <div
                    key={metric.name}
                    className="flex items-center gap-3 p-3 rounded-lg bg-muted/50"
                  >
                    <div className={cn(
                      "p-2 rounded-lg",
                      metric.status === "excellent" ? "bg-green-500/10" : "bg-yellow-500/10"
                    )}>
                      <metric.icon className={cn(
                        "h-4 w-4",
                        metric.status === "excellent" ? "text-green-500" : "text-yellow-500"
                      )} />
                    </div>
                    <div>
                      <p className="text-sm font-medium">{metric.value}</p>
                      <p className="text-xs text-muted-foreground">{metric.name}</p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Recent Activity */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base flex items-center gap-2">
                <Activity className="h-4 w-4 text-violet-500" />
                Recent Activity
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {recentActivity.slice(0, 4).map((activity, index) => (
                  <div key={index} className="flex items-start gap-3">
                    <div
                      className={cn(
                        "p-1.5 rounded-full mt-0.5",
                        activity.status === "verified"
                          ? "bg-green-500/10"
                          : activity.status === "conflict"
                          ? "bg-yellow-500/10"
                          : activity.status === "false"
                          ? "bg-red-500/10"
                          : "bg-violet-500/10"
                      )}
                    >
                      {activity.status === "verified" ? (
                        <CheckCircle2 className="h-3 w-3 text-green-500" />
                      ) : activity.status === "conflict" ? (
                        <AlertTriangle className="h-3 w-3 text-yellow-500" />
                      ) : activity.status === "false" ? (
                        <XCircle className="h-3 w-3 text-red-500" />
                      ) : (
                        <Activity className="h-3 w-3 text-violet-500" />
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium">{activity.action}</p>
                      <p className="text-xs text-muted-foreground truncate">
                        {activity.topic} · {activity.time}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Detailed Sources Table */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2">
            <Users className="h-4 w-4 text-violet-500" />
            All Monitored Sources
          </CardTitle>
          <CardDescription>Complete list of fact-checked news sources</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-border">
                  <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">
                    Source
                  </th>
                  <th className="text-right py-3 px-4 text-sm font-medium text-muted-foreground">
                    Claims
                  </th>
                  <th className="text-right py-3 px-4 text-sm font-medium text-muted-foreground">
                    Accuracy
                  </th>
                  <th className="text-center py-3 px-4 text-sm font-medium text-muted-foreground">
                    Trend
                  </th>
                  <th className="text-right py-3 px-4 text-sm font-medium text-muted-foreground">
                    Status
                  </th>
                </tr>
              </thead>
              <tbody>
                {topSources.map((source, index) => (
                  <tr key={source.name} className="border-b border-border last:border-0 hover:bg-muted/30 transition-colors">
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-3">
                        <div className="flex items-center justify-center w-8 h-8 rounded-full bg-gradient-to-br from-violet-500/20 to-purple-600/20 text-sm font-medium text-violet-600 dark:text-violet-400">
                          {index + 1}
                        </div>
                        <span className="font-medium">{source.name}</span>
                      </div>
                    </td>
                    <td className="py-3 px-4 text-right">
                      <span className="text-sm">{source.claims.toLocaleString()}</span>
                    </td>
                    <td className="py-3 px-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <div className="w-16 h-1.5 bg-muted rounded-full overflow-hidden">
                          <div
                            className={cn(
                              "h-full rounded-full transition-all",
                              source.value >= 90
                                ? "bg-green-500"
                                : source.value >= 80
                                ? "bg-violet-500"
                                : "bg-yellow-500"
                            )}
                            style={{ width: `${source.value}%` }}
                          />
                        </div>
                        <span
                          className={cn(
                            "text-sm font-semibold tabular-nums",
                            source.value >= 90
                              ? "text-green-600 dark:text-green-400"
                              : source.value >= 80
                              ? "text-violet-600 dark:text-violet-400"
                              : "text-yellow-600 dark:text-yellow-400"
                          )}
                        >
                          {source.value}%
                        </span>
                      </div>
                    </td>
                    <td className="py-3 px-4 text-center">
                      <div className={cn(
                        "inline-flex items-center gap-1 text-xs font-medium px-2 py-1 rounded-full",
                        index % 2 === 0
                          ? "text-green-700 bg-green-100 dark:text-green-400 dark:bg-green-950"
                          : "text-muted-foreground bg-muted"
                      )}>
                        {index % 2 === 0 ? (
                          <>
                            <TrendingUp className="h-3 w-3" />
                            +{(Math.random() * 3 + 0.5).toFixed(1)}%
                          </>
                        ) : (
                          <>—</>
                        )}
                      </div>
                    </td>
                    <td className="py-3 px-4 text-right">
                      <Badge
                        variant={source.value >= 90 ? "success" : source.value >= 80 ? "default" : "warning"}
                        className="text-[10px]"
                      >
                        {source.value >= 90
                          ? "Excellent"
                          : source.value >= 80
                          ? "Good"
                          : "Fair"}
                      </Badge>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
