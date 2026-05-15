"use client";

import { useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useWorkflowStore } from "@/stores/workflow";
import type { RecruiterInsight, WorkflowSuggestion } from "@/types/workflows";
import { cn } from "@/lib/utils";
import {
  Activity,
  Users,
  Send,
  MessageSquare,
  TrendingUp,
  Zap,
  AlertTriangle,
  Lightbulb,
  Target,
  ArrowRight,
  Clock,
} from "lucide-react";

export function CommandCenter() {
  const {
    commandCenterData,
    loadCommandCenter,
    insights,
    suggestions,
    loadInsights,
    loadSuggestions,
  } = useWorkflowStore();

  useEffect(() => {
    loadCommandCenter();
    loadInsights();
    loadSuggestions();
  }, [loadCommandCenter, loadInsights, loadSuggestions]);

  const metrics = commandCenterData?.metrics;

  return (
    <div className="space-y-8">
      {/* Metrics Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
        {[
          { icon: Users, label: "Candidates Sourced", value: metrics?.candidates_sourced_today || 0, color: "indigo" },
          { icon: Send, label: "Outreach Sent", value: metrics?.outreach_sent_today || 0, color: "emerald" },
          { icon: MessageSquare, label: "Responses", value: metrics?.responses_received || 0, color: "amber" },
          { icon: Activity, label: "Active Workflows", value: metrics?.active_workflows || 0, color: "purple" },
          { icon: TrendingUp, label: "Response Rate", value: `${Math.round((metrics?.avg_response_rate || 0) * 100)}%`, color: "blue" },
          { icon: Target, label: "Top Channel", value: metrics?.top_performing_channel || "N/A", color: "rose" },
        ].map((metric, i) => (
          <MetricCard key={metric.label} {...metric} index={i} />
        ))}
      </div>

      {/* AI Recommendations */}
      <AnimatePresence>
        {insights.length > 0 && (
          <motion.section
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
          >
            <h3 className="text-sm font-semibold flex items-center gap-2 mb-4">
              <Lightbulb className="w-4 h-4 text-amber-400" />
              AI Recommendations
            </h3>
            <div className="space-y-3">
              {insights
                .filter((i) => i.actionable)
                .slice(0, 3)
                .map((insight, i) => (
                  <InsightCard key={insight.id} insight={insight} index={i} />
                ))}
            </div>
          </motion.section>
        )}
      </AnimatePresence>

      {/* Workflow Suggestions */}
      <AnimatePresence>
        {suggestions.length > 0 && (
          <motion.section
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
          >
            <h3 className="text-sm font-semibold flex items-center gap-2 mb-4">
              <Zap className="w-4 h-4 text-indigo-400" />
              Suggested Workflows
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {suggestions.map((suggestion, i) => (
                <SuggestionCard key={suggestion.id} suggestion={suggestion} index={i} />
              ))}
            </div>
          </motion.section>
        )}
      </AnimatePresence>

      {/* Recent Activity */}
      <AnimatePresence>
        {commandCenterData?.recent_activity &&
          commandCenterData.recent_activity.length > 0 && (
            <motion.section
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 }}
            >
              <h3 className="text-sm font-semibold flex items-center gap-2 mb-4">
                <Clock className="w-4 h-4 text-muted" />
                Recent Activity
              </h3>
              <div className="space-y-1">
                {commandCenterData.recent_activity.slice(0, 5).map((activity, i) => (
                  <motion.div
                    key={activity.id}
                    initial={{ opacity: 0, x: -8 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.5 + i * 0.05 }}
                    className="flex items-center gap-3 px-3 py-2.5 rounded-lg hover:bg-surface-hover transition-colors"
                  >
                    <ActivityIcon type={activity.type} />
                    <span className="flex-1 text-sm text-muted">
                      {activity.description}
                    </span>
                    <span className="text-xs text-muted/50">
                      {formatTimestamp(activity.timestamp)}
                    </span>
                  </motion.div>
                ))}
              </div>
            </motion.section>
          )}
      </AnimatePresence>
    </div>
  );
}

function MetricCard({
  icon: Icon,
  label,
  value,
  color,
  index,
}: {
  icon: typeof Activity;
  label: string;
  value: string | number;
  color: string;
  index: number;
}) {
  const colorClasses: Record<string, { bg: string; icon: string; border: string }> = {
    indigo: { bg: "bg-indigo-500/10", icon: "text-indigo-400", border: "border-indigo-500/20" },
    emerald: { bg: "bg-emerald-500/10", icon: "text-emerald-400", border: "border-emerald-500/20" },
    amber: { bg: "bg-amber-500/10", icon: "text-amber-400", border: "border-amber-500/20" },
    purple: { bg: "bg-purple-500/10", icon: "text-purple-400", border: "border-purple-500/20" },
    blue: { bg: "bg-blue-500/10", icon: "text-blue-400", border: "border-blue-500/20" },
    rose: { bg: "bg-rose-500/10", icon: "text-rose-400", border: "border-rose-500/20" },
  };

  const colors = colorClasses[color] || colorClasses.indigo;

  return (
    <motion.div
      initial={{ opacity: 0, y: 16, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ duration: 0.4, delay: index * 0.06, ease: [0.4, 0, 0.2, 1] }}
      whileHover={{ y: -2, scale: 1.02 }}
      className="p-5 rounded-xl border border-border bg-surface hover:shadow-lg hover:shadow-indigo-500/5 transition-all"
    >
      <div className="flex items-center gap-3">
        <div className={cn("p-2.5 rounded-xl border", colors.bg, colors.border)}>
          <Icon className={cn("w-4 h-4", colors.icon)} />
        </div>
        <div>
          <p className="text-xs text-muted">{label}</p>
          <motion.p
            key={String(value)}
            initial={{ opacity: 0, y: 4 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-xl font-semibold text-foreground"
          >
            {value}
          </motion.p>
        </div>
      </div>
    </motion.div>
  );
}

function InsightCard({ insight, index }: { insight: RecruiterInsight; index: number }) {
  const typeColors: Record<string, string> = {
    recommendation: "border-l-indigo-500",
    warning: "border-l-amber-500",
    opportunity: "border-l-emerald-500",
    pattern: "border-l-purple-500",
    metric: "border-l-blue-500",
  };

  const typeIcons: Record<string, typeof AlertTriangle> = {
    recommendation: Lightbulb,
    warning: AlertTriangle,
    opportunity: Target,
    pattern: Activity,
    metric: TrendingUp,
  };

  const Icon = typeIcons[insight.type] || Lightbulb;

  return (
    <motion.div
      initial={{ opacity: 0, x: -8 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: 0.3 + index * 0.08 }}
      className={cn(
        "p-4 rounded-xl border border-border bg-surface border-l-4 hover:shadow-md transition-all",
        typeColors[insight.type]
      )}
    >
      <div className="flex items-start gap-3">
        <Icon className="w-4 h-4 text-muted mt-0.5" />
        <div className="flex-1">
          <p className="text-sm font-medium text-foreground">{insight.title}</p>
          <p className="text-xs text-muted mt-1 leading-relaxed">{insight.description}</p>
          {insight.suggestedAction && (
            <motion.button
              whileHover={{ x: 4 }}
              className="flex items-center gap-1 mt-3 text-xs text-indigo-400 hover:text-indigo-300 transition-colors"
            >
              {insight.suggestedAction}
              <ArrowRight className="w-3 h-3" />
            </motion.button>
          )}
        </div>
      </div>
    </motion.div>
  );
}

function SuggestionCard({ suggestion, index }: { suggestion: WorkflowSuggestion; index: number }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.4 + index * 0.06 }}
      whileHover={{ y: -2, scale: 1.01 }}
      className="p-5 rounded-xl border border-border bg-surface hover:border-indigo-500/30 hover:shadow-lg hover:shadow-indigo-500/5 transition-all cursor-pointer group"
    >
      <div className="flex items-start justify-between mb-3">
        <h4 className="text-sm font-medium text-foreground group-hover:text-indigo-400 transition-colors">
          {suggestion.name}
        </h4>
        <span className="text-xs text-muted/60">{suggestion.estimated_time}</span>
      </div>
      <p className="text-xs text-muted leading-relaxed mb-4">{suggestion.description}</p>
      <div className="flex items-center gap-2">
        <div className="flex-1 h-1.5 rounded-full bg-surface-hover overflow-hidden">
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: `${suggestion.confidence * 100}%` }}
            transition={{ duration: 0.6, delay: 0.5 + index * 0.06 }}
            className="h-full rounded-full bg-gradient-to-r from-indigo-500 to-purple-500"
          />
        </div>
        <span className="text-[10px] text-muted/60">
          {Math.round(suggestion.confidence * 100)}%
        </span>
      </div>
    </motion.div>
  );
}

function ActivityIcon({ type }: { type: string }) {
  const icons: Record<string, typeof Activity> = {
    sourcing: Users,
    outreach: Send,
    comparison: Target,
    workflow: Zap,
    memory: Activity,
  };

  const Icon = icons[type] || Activity;
  return (
    <div className="p-1.5 rounded-lg bg-surface-hover">
      <Icon className="w-3.5 h-3.5 text-muted" />
    </div>
  );
}

function formatTimestamp(timestamp: string): string {
  const date = new Date(timestamp);
  const now = new Date();
  const diff = now.getTime() - date.getTime();

  if (diff < 60000) return "Just now";
  if (diff < 3600000) return `${Math.floor(diff / 60000)}m ago`;
  if (diff < 86400000) return `${Math.floor(diff / 3600000)}h ago`;
  return date.toLocaleDateString();
}
