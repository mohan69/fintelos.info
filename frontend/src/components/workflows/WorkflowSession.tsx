"use client";

import { useWorkflowStore } from "@/stores/workflow";
import type { SourcingSession, WorkflowStep } from "@/types/workflows";
import { cn } from "@/lib/utils";
import {
  CheckCircle2,
  Circle,
  Loader2,
  XCircle,
  SkipForward,
  ChevronRight,
} from "lucide-react";

interface WorkflowSessionProps {
  session: SourcingSession;
}

export function WorkflowSessionView({ session }: WorkflowSessionProps) {
  return (
    <div className="space-y-4">
      {/* Session header */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-sm font-semibold">{session.name}</h3>
          <p className="text-xs text-zinc-500">{session.query}</p>
        </div>
        <StatusBadge status={session.status} />
      </div>

      {/* Steps timeline */}
      <div className="space-y-2">
        {session.steps.map((step, index) => (
          <StepCard
            key={step.id}
            step={step}
            isLast={index === session.steps.length - 1}
          />
        ))}
      </div>

      {/* Metrics */}
      {session.metrics && (
        <div className="grid grid-cols-4 gap-3 pt-3 border-t border-zinc-200 dark:border-zinc-800">
          <MetricMini label="Sourced" value={session.metrics.candidates_sourced} />
          <MetricMini label="Ranked" value={session.metrics.candidates_ranked} />
          <MetricMini label="Outreach" value={session.metrics.outreach_sent} />
          <MetricMini
            label="Response"
            value={`${Math.round(session.metrics.response_rate * 100)}%`}
          />
        </div>
      )}

      {/* Insights */}
      {session.insights.length > 0 && (
        <div className="space-y-2 pt-3 border-t border-zinc-200 dark:border-zinc-800">
          <p className="text-xs font-semibold text-zinc-500">Insights</p>
          {session.insights.map((insight) => (
            <div
              key={insight.id}
              className="p-2 rounded-lg bg-zinc-50 dark:bg-zinc-900 text-xs"
            >
              <p className="font-medium">{insight.title}</p>
              <p className="text-zinc-500 mt-0.5">{insight.description}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function StepCard({ step, isLast }: { step: WorkflowStep; isLast: boolean }) {
  const StatusIcon = {
    completed: CheckCircle2,
    running: Loader2,
    failed: XCircle,
    skipped: SkipForward,
    pending: Circle,
  }[step.status];

  const statusColor = {
    completed: "text-emerald-500",
    running: "text-indigo-500 animate-spin",
    failed: "text-red-500",
    skipped: "text-zinc-400",
    pending: "text-zinc-400",
  }[step.status];

  return (
    <div className="flex items-start gap-3">
      <div className="flex flex-col items-center">
        <StatusIcon className={cn("w-5 h-5", statusColor)} />
        {!isLast && (
          <div className="w-px h-6 bg-zinc-200 dark:bg-zinc-800 mt-1" />
        )}
      </div>
      <div className="flex-1 pb-2">
        <div className="flex items-center gap-2">
          <p className="text-sm font-medium">{step.name}</p>
          <StatusBadge status={step.status} />
        </div>
        {step.description && (
          <p className="text-xs text-zinc-500 mt-0.5">{step.description}</p>
        )}
        {step.error && (
          <p className="text-xs text-red-500 mt-1">{step.error}</p>
        )}
      </div>
    </div>
  );
}

function StatusBadge({ status }: { status: string }) {
  const styles: Record<string, string> = {
    completed: "bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-400",
    running: "bg-indigo-100 dark:bg-indigo-950 text-indigo-700 dark:text-indigo-400",
    active: "bg-indigo-100 dark:bg-indigo-950 text-indigo-700 dark:text-indigo-400",
    failed: "bg-red-100 dark:bg-red-950 text-red-700 dark:text-red-400",
    pending: "bg-zinc-100 dark:bg-zinc-900 text-zinc-600 dark:text-zinc-400",
    paused: "bg-amber-100 dark:bg-amber-950 text-amber-700 dark:text-amber-400",
  };

  return (
    <span
      className={cn(
        "px-1.5 py-0.5 text-[10px] font-medium rounded-full capitalize",
        styles[status] || styles.pending
      )}
    >
      {status}
    </span>
  );
}

function MetricMini({ label, value }: { label: string; value: string | number }) {
  return (
    <div className="text-center">
      <p className="text-lg font-semibold">{value}</p>
      <p className="text-[10px] text-zinc-500">{label}</p>
    </div>
  );
}
