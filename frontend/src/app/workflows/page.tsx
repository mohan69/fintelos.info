"use client";

import { useState, useEffect } from "react";
import { AppShell } from "@/components/layout/AppShell";
import { CommandCenter } from "@/components/workflows/CommandCenter";
import { OutreachPanel } from "@/components/workflows/OutreachPanel";
import { CandidateComparisonPanel } from "@/components/workflows/CandidateComparison";
import { WorkflowSessionView } from "@/components/workflows/WorkflowSession";
import { useWorkflowStore } from "@/stores/workflow";
import { useSourcingStore } from "@/stores/sourcing";
import type { Candidate } from "@/lib/api";
import { cn } from "@/lib/utils";
import {
  Zap,
  BarChart3,
  Send,
  GitCompare,
  Clock,
} from "lucide-react";

type ActiveView = "command" | "outreach" | "compare" | "sessions";

export default function WorkflowsPage() {
  const [activeView, setActiveView] = useState<ActiveView>("command");
  const {
    activeSession,
    sessions,
    loadSessions,
  } = useWorkflowStore();

  const { results: sourcingResults } = useSourcingStore();

  useEffect(() => {
    loadSessions();
  }, [loadSessions]);

  // Get candidates from sourcing results
  const candidates: Candidate[] = sourcingResults.map((r) => ({
    id: r.id,
    full_name: r.fullName,
    email: r.email,
    current_title: r.currentTitle,
    current_company: r.currentCompany,
    location: r.location,
    skills: r.skills,
    experience_years: r.experienceYears,
    ai_score: r.enrichment?.aiScore || r.matchScore,
    job_stability_score: r.enrichment?.jobStabilityScore || 0.5,
    response_likelihood: r.enrichment?.responseLikelihood || 0.5,
    status: "active",
    tags: [],
    created_at: r.normalizedAt,
  }));

  const tabs = [
    { id: "command" as const, label: "Command Center", icon: BarChart3 },
    { id: "outreach" as const, label: "Outreach", icon: Send },
    { id: "compare" as const, label: "Compare", icon: GitCompare },
    { id: "sessions" as const, label: "Sessions", icon: Clock },
  ];

  return (
    <AppShell>
      <div className="flex flex-col h-full">
        {/* Header */}
        <div className="p-6 border-b border-zinc-200 dark:border-zinc-800">
          <div className="flex items-center gap-3 mb-4">
            <div className="flex items-center justify-center w-10 h-10 rounded-xl bg-indigo-100 dark:bg-indigo-950">
              <Zap className="w-5 h-5 text-indigo-500" />
            </div>
            <div>
              <h1 className="text-2xl font-semibold">Recruiter Workflows</h1>
              <p className="text-sm text-zinc-500 dark:text-zinc-400">
                AI-powered recruiting automation and insights
              </p>
            </div>
          </div>

          {/* Tabs */}
          <div className="flex gap-1 p-1 rounded-xl bg-zinc-100 dark:bg-zinc-900 w-fit">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveView(tab.id)}
                  className={cn(
                    "flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors",
                    activeView === tab.id
                      ? "bg-white dark:bg-zinc-800 shadow-sm"
                      : "text-zinc-500 hover:text-zinc-700"
                  )}
                >
                  <Icon className="w-4 h-4" />
                  {tab.label}
                </button>
              );
            })}
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6">
          {activeView === "command" && <CommandCenter />}

          {activeView === "outreach" && (
            <div className="max-w-2xl mx-auto">
              <OutreachPanel candidates={candidates} />
            </div>
          )}

          {activeView === "compare" && (
            <div className="max-w-2xl mx-auto">
              <CandidateComparisonPanel candidates={candidates} />
            </div>
          )}

          {activeView === "sessions" && (
            <div className="space-y-4">
              {activeSession && (
                <div className="p-4 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950">
                  <WorkflowSessionView session={activeSession} />
                </div>
              )}

              {sessions.length > 0 ? (
                <div className="space-y-3">
                  <h3 className="text-sm font-semibold text-zinc-500">
                    Recent Sessions
                  </h3>
                  {sessions.map((session) => (
                    <div
                      key={session.id}
                      className="p-4 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950"
                    >
                      <WorkflowSessionView session={session} />
                    </div>
                  ))}
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center py-16 text-center">
                  <Clock className="w-12 h-12 text-zinc-400 mb-4" />
                  <h2 className="text-lg font-semibold mb-2">
                    No Sessions Yet
                  </h2>
                  <p className="text-sm text-zinc-500 max-w-md">
                    Start a sourcing workflow from the Sourcing page or Chat to
                    create your first session.
                  </p>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </AppShell>
  );
}
