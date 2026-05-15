"use client";

import { type SearchResult } from "@/stores/search";
import { CandidateCard } from "@/components/candidates/CandidateCard";
import {
  Sparkles,
  Target,
  TrendingUp,
  MapPin,
  Briefcase,
} from "lucide-react";
import { cn } from "@/lib/utils";

interface SemanticResultsProps {
  results: SearchResult[];
  query: string;
  isLoading: boolean;
  processingTime?: number;
}

export function SemanticResults({
  results,
  query,
  isLoading,
  processingTime,
}: SemanticResultsProps) {
  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center py-16">
        <div className="relative">
          <div className="w-16 h-16 rounded-full bg-indigo-100 dark:bg-indigo-950 flex items-center justify-center">
            <Sparkles className="w-8 h-8 text-indigo-500 animate-pulse" />
          </div>
          <div className="absolute inset-0 rounded-full border-2 border-indigo-200 dark:border-indigo-800 animate-ping" />
        </div>
        <p className="mt-4 text-sm text-zinc-500">
          Running semantic search...
        </p>
        <p className="text-xs text-zinc-400 mt-1">
          Generating embeddings and finding matches
        </p>
      </div>
    );
  }

  if (results.length === 0) {
    return null;
  }

  return (
    <div className="space-y-6">
      {/* Search metadata */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <p className="text-sm text-zinc-500">
            <span className="font-medium text-zinc-900 dark:text-zinc-100">
              {results.length}
            </span>{" "}
            semantic matches
          </p>
          {processingTime && (
            <p className="text-xs text-zinc-400">
              {processingTime}ms
            </p>
          )}
        </div>
        <div className="flex items-center gap-2 text-xs text-zinc-500">
          <Target className="w-3 h-3" />
          Ranked by relevance
        </div>
      </div>

      {/* Results with relevance scores */}
      <div className="space-y-4">
        {results.map((result, index) => (
          <SemanticResultCard
            key={result.id}
            result={result}
            rank={index + 1}
            query={query}
          />
        ))}
      </div>
    </div>
  );
}

function SemanticResultCard({
  result,
  rank,
  query,
}: {
  result: SearchResult;
  rank: number;
  query: string;
}) {
  const relevancePercent = Math.round(
    (result.relevance_score || 0.5) * 100
  );

  return (
    <div className="relative group">
      {/* Relevance indicator */}
      <div className="absolute -left-2 top-4 z-10">
        <div
          className={cn(
            "flex items-center justify-center w-8 h-8 rounded-full text-xs font-bold",
            rank <= 3
              ? "bg-indigo-500 text-white"
              : "bg-zinc-200 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400"
          )}
        >
          {rank}
        </div>
      </div>

      <div className="ml-8">
        {/* Relevance bar */}
        <div className="mb-2 flex items-center gap-2">
          <div className="flex-1 h-1.5 rounded-full bg-zinc-100 dark:bg-zinc-900 overflow-hidden">
            <div
              className={cn(
                "h-full rounded-full transition-all duration-500",
                relevancePercent >= 80
                  ? "bg-emerald-500"
                  : relevancePercent >= 60
                    ? "bg-indigo-500"
                    : "bg-amber-500"
              )}
              style={{ width: `${relevancePercent}%` }}
            />
          </div>
          <span className="text-xs font-medium text-zinc-500">
            {relevancePercent}% match
          </span>
        </div>

        {/* Match reasons */}
        {result.match_reasons && result.match_reasons.length > 0 && (
          <div className="flex flex-wrap gap-1.5 mb-3">
            {result.match_reasons.map((reason, i) => (
              <span
                key={i}
                className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-medium bg-indigo-50 dark:bg-indigo-950 text-indigo-600 dark:text-indigo-400"
              >
                {reason.includes("Skill") && (
                  <Sparkles className="w-2.5 h-2.5" />
                )}
                {reason.includes("Title") && (
                  <Briefcase className="w-2.5 h-2.5" />
                )}
                {reason.includes("Location") && (
                  <MapPin className="w-2.5 h-2.5" />
                )}
                {reason.includes("experience") && (
                  <TrendingUp className="w-2.5 h-2.5" />
                )}
                {reason}
              </span>
            ))}
          </div>
        )}

        {/* Candidate card */}
        <CandidateCard candidate={result} />
      </div>
    </div>
  );
}
