"use client";

import { useEffect, useState } from "react";
import { AppShell } from "@/components/layout/AppShell";
import { CandidateCard } from "@/components/candidates/CandidateCard";
import { CandidateRanking } from "@/components/candidates/CandidateRanking";
import { api, type Candidate } from "@/lib/api";
import { Loader2, Plus, LayoutGrid, ListOrdered } from "lucide-react";
import { cn } from "@/lib/utils";

type ViewMode = "grid" | "ranking";

export default function CandidatesPage() {
  const [candidates, setCandidates] = useState<Candidate[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [viewMode, setViewMode] = useState<ViewMode>("ranking");

  useEffect(() => {
    loadCandidates();
  }, []);

  const loadCandidates = async () => {
    setIsLoading(true);
    try {
      const data = await api.candidates.list();
      setCandidates(data);
    } catch (err) {
      console.error("Failed to load candidates:", err);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <AppShell>
      <div className="flex flex-col h-full p-6">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-semibold mb-2">Candidates</h1>
            <p className="text-sm text-zinc-500 dark:text-zinc-400">
              {candidates.length} candidates in your talent pool
            </p>
          </div>
          <div className="flex items-center gap-2">
            {/* View toggle */}
            <div className="flex items-center rounded-lg border border-zinc-200 dark:border-zinc-800 overflow-hidden">
              <button
                onClick={() => setViewMode("ranking")}
                className={cn(
                  "flex items-center gap-1.5 px-3 py-2 text-xs font-medium transition-colors",
                  viewMode === "ranking"
                    ? "bg-indigo-500 text-white"
                    : "text-zinc-500 hover:bg-zinc-50 dark:hover:bg-zinc-900"
                )}
              >
                <ListOrdered className="w-3.5 h-3.5" />
                Ranked
              </button>
              <button
                onClick={() => setViewMode("grid")}
                className={cn(
                  "flex items-center gap-1.5 px-3 py-2 text-xs font-medium transition-colors",
                  viewMode === "grid"
                    ? "bg-indigo-500 text-white"
                    : "text-zinc-500 hover:bg-zinc-50 dark:hover:bg-zinc-900"
                )}
              >
                <LayoutGrid className="w-3.5 h-3.5" />
                Grid
              </button>
            </div>

            <button className="flex items-center gap-2 px-4 py-2 rounded-xl bg-indigo-500 text-white text-sm font-medium hover:bg-indigo-600 transition-colors">
              <Plus className="w-4 h-4" />
              Add Candidate
            </button>
          </div>
        </div>

        {isLoading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="w-8 h-8 animate-spin text-indigo-500" />
          </div>
        ) : candidates.length > 0 ? (
          viewMode === "ranking" ? (
            <CandidateRanking
              candidates={candidates}
              title="AI-Ranked Candidates"
              showScoring={true}
            />
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {candidates.map((candidate) => (
                <CandidateCard key={candidate.id} candidate={candidate} />
              ))}
            </div>
          )
        ) : (
          <div className="flex flex-col items-center justify-center py-12 text-zinc-500">
            <p>
              No candidates yet. Add your first candidate to get started.
            </p>
          </div>
        )}
      </div>
    </AppShell>
  );
}
