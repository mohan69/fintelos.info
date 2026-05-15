"use client";

import { AppShell } from "@/components/layout/AppShell";
import { SourcingQueryInput } from "@/components/sourcing/SourcingQueryInput";
import { SourceSelector } from "@/components/sourcing/SourceSelector";
import { IntentDisplay } from "@/components/sourcing/IntentDisplay";
import { SourcingResults } from "@/components/sourcing/SourcingResults";
import { SourcingMemory } from "@/components/sourcing/SourcingMemory";
import { useSourcingStore } from "@/stores/sourcing";
import { Radar, Zap } from "lucide-react";

export default function SourcingPage() {
  const { results, selectedCandidates, isSearching } = useSourcingStore();

  return (
    <AppShell>
      <div className="flex h-full">
        {/* Left sidebar - Sources & Memory */}
        <div className="w-64 border-r border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900 p-4 overflow-y-auto space-y-6">
          <div className="flex items-center gap-2">
            <Radar className="w-5 h-5 text-indigo-500" />
            <h2 className="text-sm font-semibold">Sourcing Engine</h2>
          </div>

          <SourceSelector />

          <div className="border-t border-zinc-200 dark:border-zinc-800 pt-4">
            <SourcingMemory />
          </div>
        </div>

        {/* Main content */}
        <div className="flex-1 flex flex-col overflow-hidden">
          {/* Header */}
          <div className="p-6 border-b border-zinc-200 dark:border-zinc-800">
            <div className="flex items-center gap-3 mb-4">
              <div className="flex items-center justify-center w-10 h-10 rounded-xl bg-indigo-100 dark:bg-indigo-950">
                <Zap className="w-5 h-5 text-indigo-500" />
              </div>
              <div>
                <h1 className="text-2xl font-semibold">Autonomous Sourcing</h1>
                <p className="text-sm text-zinc-500 dark:text-zinc-400">
                  AI-powered multi-source candidate discovery
                </p>
              </div>
            </div>

            <SourcingQueryInput />

            {/* Intent display */}
            <div className="mt-4">
              <IntentDisplay />
            </div>
          </div>

          {/* Results */}
          <div className="flex-1 overflow-y-auto p-6">
            {results.length > 0 ? (
              <SourcingResults />
            ) : (
              <div className="flex flex-col items-center justify-center h-full text-center">
                <div className="w-16 h-16 rounded-2xl bg-zinc-100 dark:bg-zinc-900 flex items-center justify-center mb-4">
                  <Radar className="w-8 h-8 text-zinc-400" />
                </div>
                <h2 className="text-lg font-semibold mb-2">
                  Find your next hire
                </h2>
                <p className="text-sm text-zinc-500 dark:text-zinc-400 max-w-md">
                  Describe the candidate you&apos;re looking for in natural
                  language. Our AI will parse your intent and search across
                  multiple sources to find the best matches.
                </p>
                <div className="grid grid-cols-2 gap-3 mt-6 max-w-lg">
                  {[
                    "Java architects in Bangalore with banking experience",
                    "Senior Python developers with ML background",
                    "React engineers at FAANG companies, 5+ years",
                    "DevOps engineers with Kubernetes expertise",
                  ].map((q) => (
                    <div
                      key={q}
                      className="p-3 text-left text-xs rounded-xl border border-zinc-200 dark:border-zinc-800 text-zinc-500"
                    >
                      {q}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Selection bar */}
          {selectedCandidates.length > 0 && (
            <div className="p-4 border-t border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950">
              <div className="flex items-center justify-between">
                <p className="text-sm text-zinc-600 dark:text-zinc-400">
                  <span className="font-medium text-zinc-900 dark:text-zinc-100">
                    {selectedCandidates.length}
                  </span>{" "}
                  candidates selected
                </p>
                <div className="flex items-center gap-2">
                  <button className="px-4 py-2 rounded-lg text-sm font-medium border border-zinc-200 dark:border-zinc-800 hover:bg-zinc-50 dark:hover:bg-zinc-900 transition-colors">
                    Add to Pipeline
                  </button>
                  <button className="px-4 py-2 rounded-lg text-sm font-medium bg-indigo-500 text-white hover:bg-indigo-600 transition-colors">
                    Generate Outreach
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </AppShell>
  );
}
