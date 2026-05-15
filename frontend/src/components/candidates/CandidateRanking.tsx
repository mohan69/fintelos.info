"use client";

import { type Candidate } from "@/lib/api";
import {
  TrendingUp,
  Star,
  MapPin,
  Briefcase,
  Clock,
  ChevronUp,
  ChevronDown,
  Minus,
} from "lucide-react";
import { cn } from "@/lib/utils";

interface CandidateRankingProps {
  candidates: Candidate[];
  title?: string;
  showScoring?: boolean;
}

interface RankedCandidate extends Candidate {
  rank: number;
  composite_score: number;
  score_breakdown: {
    ai_score: number;
    stability: number;
    response_likelihood: number;
    experience_fit: number;
  };
}

export function CandidateRanking({
  candidates,
  title = "Candidate Rankings",
  showScoring = true,
}: CandidateRankingProps) {
  // Calculate composite scores and rank
  const ranked: RankedCandidate[] = candidates
    .map((c) => ({
      ...c,
      composite_score: calculateCompositeScore(c),
      score_breakdown: {
        ai_score: c.ai_score,
        stability: c.job_stability_score,
        response_likelihood: c.response_likelihood,
        experience_fit: calculateExperienceFit(c),
      },
    }))
    .sort((a, b) => b.composite_score - a.composite_score)
    .map((c, i) => ({ ...c, rank: i + 1 }));

  if (ranked.length === 0) {
    return null;
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-semibold flex items-center gap-2">
          <TrendingUp className="w-4 h-4 text-indigo-500" />
          {title}
        </h3>
        <span className="text-xs text-zinc-500">
          {ranked.length} candidates
        </span>
      </div>

      <div className="space-y-2">
        {ranked.map((candidate) => (
          <RankedCandidateRow
            key={candidate.id}
            candidate={candidate}
            showScoring={showScoring}
          />
        ))}
      </div>
    </div>
  );
}

function RankedCandidateRow({
  candidate,
  showScoring,
}: {
  candidate: RankedCandidate;
  showScoring: boolean;
}) {
  const scorePercent = Math.round(candidate.composite_score * 100);

  return (
    <div className="flex items-center gap-3 p-3 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 hover:border-indigo-200 dark:hover:border-indigo-800 transition-colors">
      {/* Rank badge */}
      <div
        className={cn(
          "flex items-center justify-center w-8 h-8 rounded-full text-xs font-bold shrink-0",
          candidate.rank <= 3
            ? "bg-indigo-500 text-white"
            : "bg-zinc-100 dark:bg-zinc-900 text-zinc-600 dark:text-zinc-400"
        )}
      >
        {candidate.rank}
      </div>

      {/* Candidate info */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <p className="text-sm font-medium truncate">
            {candidate.full_name}
          </p>
          {candidate.rank === 1 && (
            <Star className="w-3.5 h-3.5 text-amber-500 fill-amber-500" />
          )}
        </div>
        <div className="flex items-center gap-3 mt-0.5">
          {candidate.current_title && (
            <span className="flex items-center gap-1 text-xs text-zinc-500">
              <Briefcase className="w-3 h-3" />
              {candidate.current_title}
            </span>
          )}
          {candidate.location && (
            <span className="flex items-center gap-1 text-xs text-zinc-500">
              <MapPin className="w-3 h-3" />
              {candidate.location}
            </span>
          )}
          {candidate.experience_years && (
            <span className="flex items-center gap-1 text-xs text-zinc-500">
              <Clock className="w-3 h-3" />
              {candidate.experience_years}y
            </span>
          )}
        </div>
      </div>

      {/* Score visualization */}
      {showScoring && (
        <div className="flex items-center gap-3 shrink-0">
          <div className="hidden sm:flex flex-col items-end gap-1">
            <div className="flex items-center gap-2">
              <ScoreBar
                label="AI"
                value={candidate.score_breakdown.ai_score}
              />
              <ScoreBar
                label="Stab"
                value={candidate.score_breakdown.stability}
              />
              <ScoreBar
                label="Resp"
                value={candidate.score_breakdown.response_likelihood}
              />
            </div>
          </div>

          {/* Composite score */}
          <div
            className={cn(
              "flex items-center justify-center w-12 h-12 rounded-xl text-sm font-bold",
              scorePercent >= 80
                ? "bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-400"
                : scorePercent >= 60
                  ? "bg-indigo-100 dark:bg-indigo-950 text-indigo-700 dark:text-indigo-400"
                  : "bg-zinc-100 dark:bg-zinc-900 text-zinc-600 dark:text-zinc-400"
            )}
          >
            {scorePercent}
          </div>
        </div>
      )}
    </div>
  );
}

function ScoreBar({ label, value }: { label: string; value: number }) {
  const percent = Math.round(value * 100);

  return (
    <div className="flex flex-col items-center gap-0.5">
      <div className="w-12 h-1.5 rounded-full bg-zinc-100 dark:bg-zinc-900 overflow-hidden">
        <div
          className={cn(
            "h-full rounded-full",
            percent >= 70
              ? "bg-emerald-500"
              : percent >= 50
                ? "bg-indigo-500"
                : "bg-amber-500"
          )}
          style={{ width: `${percent}%` }}
        />
      </div>
      <span className="text-[9px] text-zinc-400">{label}</span>
    </div>
  );
}

function calculateCompositeScore(candidate: Candidate): number {
  const weights = {
    ai_score: 0.4,
    stability: 0.2,
    response_likelihood: 0.2,
    experience: 0.2,
  };

  return (
    candidate.ai_score * weights.ai_score +
    candidate.job_stability_score * weights.stability +
    candidate.response_likelihood * weights.response_likelihood +
    calculateExperienceFit(candidate) * weights.experience
  );
}

function calculateExperienceFit(candidate: Candidate): number {
  if (!candidate.experience_years) return 0.5;
  // Optimal range: 3-8 years
  if (candidate.experience_years >= 3 && candidate.experience_years <= 8) {
    return 1.0;
  }
  if (candidate.experience_years < 3) {
    return candidate.experience_years / 3;
  }
  return Math.max(0.5, 1 - (candidate.experience_years - 8) * 0.05);
}
