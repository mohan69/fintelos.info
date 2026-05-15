"use client";

import { useWorkflowStore } from "@/stores/workflow";
import type { Candidate } from "@/lib/api";
import type { CandidateComparison as ComparisonType } from "@/types/workflows";
import { cn } from "@/lib/utils";
import {
  GitCompare,
  Loader2,
  CheckCircle2,
  AlertTriangle,
  TrendingUp,
  TrendingDown,
  Minus,
  Star,
} from "lucide-react";

interface CandidateComparisonProps {
  candidates: Candidate[];
  onClose?: () => void;
}

export function CandidateComparisonPanel({
  candidates,
  onClose,
}: CandidateComparisonProps) {
  const { compareCandidates, activeComparison, isComparing, clearComparison } =
    useWorkflowStore();

  const handleCompare = () => {
    if (candidates.length >= 2) {
      compareCandidates(candidates);
    }
  };

  if (isComparing) {
    return (
      <div className="flex flex-col items-center justify-center h-64">
        <Loader2 className="w-8 h-8 animate-spin text-indigo-500 mb-3" />
        <p className="text-sm text-zinc-500">Analyzing candidates...</p>
      </div>
    );
  }

  if (!activeComparison) {
    return (
      <div className="p-4">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <GitCompare className="w-4 h-4 text-indigo-500" />
            <h3 className="text-sm font-semibold">Compare Candidates</h3>
          </div>
          {onClose && (
            <button
              onClick={onClose}
              className="text-xs text-zinc-500 hover:text-zinc-700"
            >
              Close
            </button>
          )}
        </div>

        <p className="text-xs text-zinc-500 mb-4">
          {candidates.length} candidates selected for comparison
        </p>

        <button
          onClick={handleCompare}
          disabled={candidates.length < 2}
          className="w-full flex items-center justify-center gap-2 px-4 py-2 rounded-xl bg-indigo-500 text-white text-sm font-medium hover:bg-indigo-600 disabled:opacity-50 transition-colors"
        >
          <GitCompare className="w-4 h-4" />
          Compare {candidates.length} Candidates
        </button>

        {candidates.length < 2 && (
          <p className="text-xs text-amber-500 mt-2 text-center">
            Select at least 2 candidates to compare
          </p>
        )}
      </div>
    );
  }

  return (
    <div className="space-y-4 p-4">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-semibold flex items-center gap-2">
          <GitCompare className="w-4 h-4 text-indigo-500" />
          Comparison Results
        </h3>
        <button
          onClick={() => {
            clearComparison();
            onClose?.();
          }}
          className="text-xs text-zinc-500 hover:text-zinc-700"
        >
          Close
        </button>
      </div>

      {/* Recommendation */}
      <div className="p-3 rounded-lg bg-indigo-50 dark:bg-indigo-950 border border-indigo-200 dark:border-indigo-800">
        <div className="flex items-start gap-2">
          <Star className="w-4 h-4 text-indigo-500 mt-0.5" />
          <p className="text-xs text-indigo-700 dark:text-indigo-300">
            {activeComparison.recommendation}
          </p>
        </div>
      </div>

      {/* Candidate cards */}
      <div className="space-y-3">
        {activeComparison.candidates.map((candidate, index) => (
          <ComparisonCandidateCard
            key={candidate.id}
            candidate={candidate}
            rank={index + 1}
            isTop={index === 0}
          />
        ))}
      </div>
    </div>
  );
}

function ComparisonCandidateCard({
  candidate,
  rank,
  isTop,
}: {
  candidate: ComparisonType["candidates"][0];
  rank: number;
  isTop: boolean;
}) {
  return (
    <div
      className={cn(
        "p-4 rounded-xl border",
        isTop
          ? "border-indigo-300 dark:border-indigo-700 bg-indigo-50/50 dark:bg-indigo-950/30"
          : "border-zinc-200 dark:border-zinc-800"
      )}
    >
      <div className="flex items-center gap-3 mb-3">
        <div
          className={cn(
            "w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold",
            isTop
              ? "bg-indigo-500 text-white"
              : "bg-zinc-200 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400"
          )}
        >
          {rank}
        </div>
        <div>
          <p className="text-sm font-semibold">{candidate.name}</p>
          <p className="text-xs text-zinc-500">
            {candidate.title}
            {candidate.company && ` @ ${candidate.company}`}
          </p>
        </div>
      </div>

      {/* Scores */}
      <div className="grid grid-cols-5 gap-2 mb-3">
        <ScoreCell label="Overall" value={candidate.scores.overall} />
        <ScoreCell label="Skills" value={candidate.scores.skills} />
        <ScoreCell label="Exp" value={candidate.scores.experience} />
        <ScoreCell label="Stability" value={candidate.scores.stability} />
        <ScoreCell label="Culture" value={candidate.scores.culture} />
      </div>

      {/* Strengths */}
      {candidate.strengths.length > 0 && (
        <div className="mb-2">
          <p className="text-[10px] font-medium text-zinc-500 mb-1">
            Strengths
          </p>
          <div className="flex flex-wrap gap-1">
            {candidate.strengths.map((s, i) => (
              <span
                key={i}
                className="flex items-center gap-1 px-1.5 py-0.5 text-[10px] rounded-full bg-emerald-50 dark:bg-emerald-950 text-emerald-600 dark:text-emerald-400"
              >
                <CheckCircle2 className="w-2.5 h-2.5" />
                {s}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Weaknesses */}
      {candidate.weaknesses.length > 0 && (
        <div className="mb-2">
          <p className="text-[10px] font-medium text-zinc-500 mb-1">
            Weaknesses
          </p>
          <div className="flex flex-wrap gap-1">
            {candidate.weaknesses.map((w, i) => (
              <span
                key={i}
                className="flex items-center gap-1 px-1.5 py-0.5 text-[10px] rounded-full bg-amber-50 dark:bg-amber-950 text-amber-600 dark:text-amber-400"
              >
                <AlertTriangle className="w-2.5 h-2.5" />
                {w}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Risks */}
      {candidate.risks.length > 0 && (
        <div>
          <p className="text-[10px] font-medium text-zinc-500 mb-1">Risks</p>
          <div className="flex flex-wrap gap-1">
            {candidate.risks.map((r, i) => (
              <span
                key={i}
                className="flex items-center gap-1 px-1.5 py-0.5 text-[10px] rounded-full bg-red-50 dark:bg-red-950 text-red-600 dark:text-red-400"
              >
                <TrendingDown className="w-2.5 h-2.5" />
                {r}
              </span>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

function ScoreCell({ label, value }: { label: string; value: number }) {
  const percent = Math.round(value * 100);

  return (
    <div className="text-center">
      <div
        className={cn(
          "w-full h-1.5 rounded-full mb-1 overflow-hidden",
          "bg-zinc-100 dark:bg-zinc-900"
        )}
      >
        <div
          className={cn(
            "h-full rounded-full",
            percent >= 80
              ? "bg-emerald-500"
              : percent >= 60
                ? "bg-indigo-500"
                : "bg-amber-500"
          )}
          style={{ width: `${percent}%` }}
        />
      </div>
      <p className="text-[10px] text-zinc-500">{label}</p>
      <p className="text-xs font-medium">{percent}%</p>
    </div>
  );
}
