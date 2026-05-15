"use client";

import { useEffect, useState } from "react";
import { AppShell } from "@/components/layout/AppShell";
import { useWorkflowStore } from "@/stores/workflow";
import { useAuthStore } from "@/stores/auth";
import { useChatStore } from "@/stores/chat";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import {
  Users,
  Send,
  MessageSquare,
  TrendingUp,
  Zap,
  ArrowRight,
  Clock,
  Activity,
  Radar,
  Brain,
  Search,
  Workflow,
  Sparkles,
  Target,
  BarChart3,
  Lightbulb,
} from "lucide-react";
import Link from "next/link";

export default function DashboardPage() {
  const { user } = useAuthStore();
  const { sessions, loadSessions, insights, loadInsights } = useWorkflowStore();
  const { loadConversations } = useChatStore();
  const [greeting] = useState(() => {
    const hour = new Date().getHours();
    if (hour < 12) return "Good morning";
    if (hour < 17) return "Good afternoon";
    return "Good evening";
  });

  useEffect(() => {
    loadSessions();
    loadInsights();
    loadConversations();
  }, [loadSessions, loadInsights, loadConversations]);

  const metrics = [
    {
      icon: Users,
      label: "Total Candidates",
      value: "1,247",
      change: "+12%",
      changeType: "positive" as const,
      color: "indigo",
    },
    {
      icon: Send,
      label: "Outreach Sent",
      value: "384",
      change: "+23%",
      changeType: "positive" as const,
      color: "emerald",
    },
    {
      icon: MessageSquare,
      label: "Response Rate",
      value: "34%",
      change: "+5%",
      changeType: "positive" as const,
      color: "amber",
    },
    {
      icon: Activity,
      label: "Active Workflows",
      value: String(sessions.filter((s) => s.status === "active").length || 3),
      change: "2 running",
      changeType: "neutral" as const,
      color: "purple",
    },
  ];

  const quickActions = [
    {
      icon: Radar,
      label: "Source Candidates",
      description: "Find talent across multiple sources",
      href: "/sourcing",
      color: "from-indigo-500 to-purple-500",
    },
    {
      icon: Search,
      label: "Semantic Search",
      description: "Search using natural language",
      href: "/search",
      color: "from-emerald-500 to-teal-500",
    },
    {
      icon: MessageSquare,
      label: "AI Copilot",
      description: "Chat with your recruiting assistant",
      href: "/chat",
      color: "from-amber-500 to-orange-500",
    },
    {
      icon: Workflow,
      label: "Workflows",
      description: "Automate recruiting pipelines",
      href: "/workflows",
      color: "from-rose-500 to-pink-500",
    },
  ];

  const recentActivity = [
    { type: "source", description: "Sourced 15 React engineers in Bangalore", time: "2 hours ago", icon: Radar },
    { type: "outreach", description: "Sent outreach to 8 senior candidates", time: "3 hours ago", icon: Send },
    { type: "compare", description: "Compared 4 ML engineer candidates", time: "5 hours ago", icon: Target },
    { type: "workflow", description: "Completed sourcing workflow for DevOps", time: "1 day ago", icon: Zap },
    { type: "memory", description: "AI learned new recruiter preference", time: "1 day ago", icon: Brain },
  ];

  const actionableInsights = insights.length > 0 ? insights.filter(i => i.actionable).slice(0, 3) : [
    {
      id: "demo-1",
      type: "recommendation" as const,
      title: "Follow up with top candidates",
      description: "3 candidates from your last sourcing session haven't received outreach yet. Response likelihood drops 40% after 48 hours.",
      priority: "high" as const,
      actionable: true,
      suggestedAction: "Generate outreach now",
      generated_at: new Date().toISOString(),
    },
    {
      id: "demo-2",
      type: "opportunity" as const,
      title: "Expand Python developer search",
      description: "Your recent Python developer search found strong matches. Consider expanding to remote candidates to increase your talent pool by 3x.",
      priority: "medium" as const,
      actionable: true,
      suggestedAction: "Run expanded search",
      generated_at: new Date().toISOString(),
    },
    {
      id: "demo-3",
      type: "pattern" as const,
      title: "LinkedIn outreach performing best",
      description: "Your LinkedIn outreach has a 42% response rate vs 28% for email. Consider prioritizing LinkedIn for senior candidates.",
      priority: "medium" as const,
      actionable: true,
      suggestedAction: "Adjust outreach strategy",
      generated_at: new Date().toISOString(),
    },
  ];

  return (
    <AppShell>
      <div className="flex flex-col h-full overflow-y-auto">
        <div className="max-w-7xl mx-auto w-full px-6 py-8 space-y-8">
          {/* Header */}
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
          >
            <h1 className="text-3xl font-semibold text-foreground">
              {greeting}, {user?.full_name?.split(" ")[0] || "Recruiter"}
            </h1>
            <p className="text-muted mt-1">
              Here&apos;s your recruiting intelligence overview
            </p>
          </motion.div>

          {/* Metrics Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {metrics.map((metric, i) => {
              const Icon = metric.icon;
              const colorClasses: Record<string, { bg: string; icon: string; border: string }> = {
                indigo: { bg: "bg-indigo-500/10", icon: "text-indigo-400", border: "border-indigo-500/20" },
                emerald: { bg: "bg-emerald-500/10", icon: "text-emerald-400", border: "border-emerald-500/20" },
                amber: { bg: "bg-amber-500/10", icon: "text-amber-400", border: "border-amber-500/20" },
                purple: { bg: "bg-purple-500/10", icon: "text-purple-400", border: "border-purple-500/20" },
              };
              const colors = colorClasses[metric.color];

              return (
                <motion.div
                  key={metric.label}
                  initial={{ opacity: 0, y: 20, scale: 0.95 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  transition={{ duration: 0.4, delay: i * 0.08, ease: [0.4, 0, 0.2, 1] }}
                  whileHover={{ y: -4, scale: 1.02 }}
                  className="p-5 rounded-xl border border-border bg-surface hover:shadow-lg hover:shadow-indigo-500/5 transition-all"
                >
                  <div className="flex items-center justify-between mb-3">
                    <div className={cn("p-2.5 rounded-xl border", colors.bg, colors.border)}>
                      <Icon className={cn("w-4 h-4", colors.icon)} />
                    </div>
                    <span className={cn(
                      "text-xs font-medium px-2 py-0.5 rounded-full",
                      metric.changeType === "positive"
                        ? "bg-emerald-500/10 text-emerald-400"
                        : "bg-surface-hover text-muted"
                    )}>
                      {metric.change}
                    </span>
                  </div>
                  <motion.p
                    key={metric.value}
                    initial={{ opacity: 0, y: 4 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.08 + 0.2 }}
                    className="text-2xl font-semibold text-foreground"
                  >
                    {metric.value}
                  </motion.p>
                  <p className="text-xs text-muted mt-0.5">{metric.label}</p>
                </motion.div>
              );
            })}
          </div>

          {/* Quick Actions */}
          <motion.section
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3, duration: 0.4 }}
          >
            <h2 className="text-sm font-semibold text-muted mb-4 flex items-center gap-2">
              <Zap className="w-4 h-4" />
              Quick Actions
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
              {quickActions.map((action, i) => {
                const Icon = action.icon;
                return (
                  <Link key={action.href} href={action.href}>
                    <motion.div
                      initial={{ opacity: 0, y: 12 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.35 + i * 0.06 }}
                      whileHover={{ y: -3, scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      className="group p-4 rounded-xl border border-border bg-surface hover:border-indigo-500/30 hover:shadow-lg hover:shadow-indigo-500/5 transition-all cursor-pointer"
                    >
                      <div className={cn(
                        "w-10 h-10 rounded-xl bg-gradient-to-br flex items-center justify-center mb-3",
                        action.color
                      )}>
                        <Icon className="w-5 h-5 text-white" />
                      </div>
                      <h3 className="text-sm font-medium text-foreground group-hover:text-indigo-400 transition-colors">
                        {action.label}
                      </h3>
                      <p className="text-xs text-muted mt-0.5">{action.description}</p>
                    </motion.div>
                  </Link>
                );
              })}
            </div>
          </motion.section>

          {/* Two Column Layout */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* AI Insights */}
            <motion.section
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5, duration: 0.4 }}
              className="lg:col-span-2"
            >
              <h2 className="text-sm font-semibold text-muted mb-4 flex items-center gap-2">
                <Lightbulb className="w-4 h-4 text-amber-400" />
                AI Recommendations
              </h2>
              <div className="space-y-3">
                {actionableInsights.map((insight, i) => {
                  const typeColors: Record<string, string> = {
                    recommendation: "border-l-indigo-500",
                    warning: "border-l-amber-500",
                    opportunity: "border-l-emerald-500",
                    pattern: "border-l-purple-500",
                    metric: "border-l-blue-500",
                  };
                  const typeIcons: Record<string, typeof Lightbulb> = {
                    recommendation: Lightbulb,
                    warning: Activity,
                    opportunity: Target,
                    pattern: BarChart3,
                    metric: TrendingUp,
                  };
                  const Icon = typeIcons[insight.type] || Lightbulb;

                  return (
                    <motion.div
                      key={insight.id}
                      initial={{ opacity: 0, x: -12 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.55 + i * 0.08 }}
                      whileHover={{ x: 4 }}
                      className={cn(
                        "p-4 rounded-xl border border-border bg-surface border-l-4 hover:shadow-md transition-all cursor-pointer",
                        typeColors[insight.type]
                      )}
                    >
                      <div className="flex items-start gap-3">
                        <Icon className="w-4 h-4 text-muted mt-0.5 shrink-0" />
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-foreground">{insight.title}</p>
                          <p className="text-xs text-muted mt-1 leading-relaxed">{insight.description}</p>
                          {insight.suggestedAction && (
                            <button className="flex items-center gap-1 mt-2 text-xs text-indigo-400 hover:text-indigo-300 transition-colors">
                              {insight.suggestedAction}
                              <ArrowRight className="w-3 h-3" />
                            </button>
                          )}
                        </div>
                        <span className={cn(
                          "text-[10px] px-1.5 py-0.5 rounded-full shrink-0",
                          insight.priority === "high"
                            ? "bg-red-500/10 text-red-400"
                            : insight.priority === "medium"
                              ? "bg-amber-500/10 text-amber-400"
                              : "bg-surface-hover text-muted"
                        )}>
                          {insight.priority}
                        </span>
                      </div>
                    </motion.div>
                  );
                })}
              </div>
            </motion.section>

            {/* Recent Activity */}
            <motion.section
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.6, duration: 0.4 }}
            >
              <h2 className="text-sm font-semibold text-muted mb-4 flex items-center gap-2">
                <Clock className="w-4 h-4" />
                Recent Activity
              </h2>
              <div className="p-4 rounded-xl border border-border bg-surface space-y-1">
                {recentActivity.map((activity, i) => {
                  const Icon = activity.icon;
                  return (
                    <motion.div
                      key={i}
                      initial={{ opacity: 0, x: -8 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.65 + i * 0.06 }}
                      className="flex items-start gap-3 px-2 py-2.5 rounded-lg hover:bg-surface-hover transition-colors"
                    >
                      <div className="p-1.5 rounded-lg bg-surface-hover mt-0.5 shrink-0">
                        <Icon className="w-3.5 h-3.5 text-muted" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-xs text-foreground/80 leading-relaxed">{activity.description}</p>
                        <p className="text-[10px] text-muted/60 mt-0.5">{activity.time}</p>
                      </div>
                    </motion.div>
                  );
                })}
              </div>
            </motion.section>
          </div>

          {/* Productivity Chart Placeholder */}
          <motion.section
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.7, duration: 0.4 }}
          >
            <h2 className="text-sm font-semibold text-muted mb-4 flex items-center gap-2">
              <BarChart3 className="w-4 h-4 text-indigo-400" />
              Recruiting Pipeline
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-5 gap-3">
              {[
                { stage: "Sourced", count: 1247, color: "bg-indigo-500", width: "100%" },
                { stage: "Screened", count: 423, color: "bg-blue-500", width: "34%" },
                { stage: "Interviewed", count: 89, color: "bg-emerald-500", width: "7%" },
                { stage: "Offered", count: 24, color: "bg-amber-500", width: "2%" },
                { stage: "Hired", count: 12, color: "bg-rose-500", width: "1%" },
              ].map((stage, i) => (
                <motion.div
                  key={stage.stage}
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.75 + i * 0.06 }}
                  className="p-4 rounded-xl border border-border bg-surface text-center"
                >
                  <motion.p
                    initial={{ scale: 0.8 }}
                    animate={{ scale: 1 }}
                    transition={{ delay: 0.8 + i * 0.06, type: "spring" }}
                    className="text-2xl font-semibold text-foreground"
                  >
                    {stage.count.toLocaleString()}
                  </motion.p>
                  <p className="text-xs text-muted mt-0.5">{stage.stage}</p>
                  <div className="mt-2 h-1.5 rounded-full bg-surface-hover overflow-hidden">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: stage.width }}
                      transition={{ duration: 0.8, delay: 0.9 + i * 0.1, ease: [0.4, 0, 0.2, 1] }}
                      className={cn("h-full rounded-full", stage.color)}
                    />
                  </div>
                </motion.div>
              ))}
            </div>
          </motion.section>

          {/* Copilot Prompt */}
          <motion.section
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.9, duration: 0.4 }}
          >
            <Link href="/chat">
              <motion.div
                whileHover={{ scale: 1.01, y: -2 }}
                whileTap={{ scale: 0.99 }}
                className="p-6 rounded-2xl border border-indigo-500/20 bg-gradient-to-br from-indigo-500/5 to-purple-500/5 hover:from-indigo-500/10 hover:to-purple-500/10 transition-all cursor-pointer group"
              >
                <div className="flex items-center gap-4">
                  <div className="flex items-center justify-center w-12 h-12 rounded-2xl bg-gradient-to-br from-indigo-500 to-purple-500 shadow-lg shadow-indigo-500/20">
                    <Sparkles className="w-6 h-6 text-white" />
                  </div>
                  <div className="flex-1">
                    <h3 className="text-base font-semibold text-foreground group-hover:text-indigo-400 transition-colors">
                      Ask Fintelos Copilot
                    </h3>
                    <p className="text-sm text-muted mt-0.5">
                      &quot;Find me 5 senior React engineers in Bangalore with fintech experience&quot;
                    </p>
                  </div>
                  <ArrowRight className="w-5 h-5 text-muted group-hover:text-indigo-400 group-hover:translate-x-1 transition-all" />
                </div>
              </motion.div>
            </Link>
          </motion.section>
        </div>
      </div>
    </AppShell>
  );
}
