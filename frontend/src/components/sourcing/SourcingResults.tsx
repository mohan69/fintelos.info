"use client";

import { motion, AnimatePresence } from "framer-motion";
import { useSourcingStore } from "@/stores/sourcing";
import type { EnrichedCandidate } from "@/types/sourcing";
import { cn } from "@/lib/utils";
import {
  MapPin,
  Briefcase,
  Clock,
  ExternalLink,
  Check,
  GitFork,
  Globe,
  FileText,
  Radar,
} from "lucide-react";

export function SourcingResults() {
  const { results, isSearching, selectedCandidates, selectCandidate, deselectCandidate } =
    useSourcingStore();

  if (isSearching) {
    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="flex flex-col items-center justify-center py-20"
      >
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
          className="w-16 h-16 rounded-full border-2 border-indigo-500/20 border-t-indigo-500 mb-4"
        />
        <motion.p
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="text-sm text-muted"
        >
          Sourcing candidates...
        </motion.p>
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: "60%" }}
          transition={{ duration: 2, ease: "easeInOut" }}
          className="h-1 rounded-full bg-gradient-to-r from-indigo-500 to-purple-500 mt-4 max-w-xs"
        />
      </motion.div>
    );
  }

  if (results.length === 0) {
    return null;
  }

  return (
    <div className="space-y-4">
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex items-center justify-between"
      >
        <p className="text-sm text-muted">
          <span className="font-medium text-foreground">
            {results.length}
          </span>{" "}
          candidates sourced
        </p>
        <p className="text-xs text-muted/60">
          Sorted by match score
        </p>
      </motion.div>

      <AnimatePresence mode="popLayout">
        {results.map((candidate, index) => (
          <SourcedCandidateCard
            key={candidate.id}
            candidate={candidate}
            rank={index + 1}
            isSelected={selectedCandidates.includes(candidate.id)}
            onToggle={() =>
              selectedCandidates.includes(candidate.id)
                ? deselectCandidate(candidate.id)
                : selectCandidate(candidate.id)
            }
            index={index}
          />
        ))}
      </AnimatePresence>
    </div>
  );
}

function SourcedCandidateCard({
  candidate,
  rank,
  isSelected,
  onToggle,
  index,
}: {
  candidate: EnrichedCandidate;
  rank: number;
  isSelected: boolean;
  onToggle: () => void;
  index: number;
}) {
  const scorePercent = Math.round(candidate.matchScore * 100);

  const SourceIcon =
    candidate.source === "github"
      ? GitFork
      : candidate.source === "google_cse"
        ? Globe
        : candidate.source === "resume_upload"
          ? FileText
          : Briefcase;

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 16, scale: 0.98 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, scale: 0.95 }}
      transition={{ duration: 0.3, delay: index * 0.05, ease: [0.4, 0, 0.2, 1] }}
      whileHover={{ y: -2 }}
      className={cn(
        "p-4 rounded-xl border transition-all cursor-pointer",
        isSelected
          ? "border-indigo-500/50 bg-indigo-500/5 ring-1 ring-indigo-500/20"
          : "border-border hover:border-border-hover hover:shadow-md"
      )}
      onClick={onToggle}
    >
      <div className="flex items-start gap-3">
        {/* Selection checkbox */}
        <motion.div
          whileTap={{ scale: 0.9 }}
          className={cn(
            "mt-1 flex items-center justify-center w-5 h-5 rounded-md border-2 transition-colors",
            isSelected
              ? "bg-indigo-500 border-indigo-500"
              : "border-border hover:border-indigo-500/50"
          )}
        >
          {isSelected && (
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ type: "spring", stiffness: 500, damping: 25 }}
            >
              <Check className="w-3 h-3 text-white" />
            </motion.div>
          )}
        </motion.div>

        {/* Candidate info */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <span
              className={cn(
                "flex items-center justify-center w-6 h-6 rounded-full text-[10px] font-bold",
                rank <= 3
                  ? "bg-gradient-to-br from-indigo-500 to-purple-500 text-white shadow-sm"
                  : "bg-surface border border-border text-muted"
              )}
            >
              {rank}
            </span>
            <h3 className="text-sm font-semibold truncate">
              {candidate.fullName}
            </h3>
            <SourceIcon className="w-3.5 h-3.5 text-muted/50" />
            {candidate.sourceUrl && (
              <a
                href={candidate.sourceUrl}
                target="_blank"
                rel="noopener noreferrer"
                onClick={(e) => e.stopPropagation()}
                className="text-muted/50 hover:text-indigo-400 transition-colors"
              >
                <ExternalLink className="w-3 h-3" />
              </a>
            )}
          </div>

          <div className="flex items-center gap-3 mt-1.5">
            {candidate.currentTitle && (
              <span className="flex items-center gap-1 text-xs text-muted">
                <Briefcase className="w-3 h-3" />
                {candidate.currentTitle}
              </span>
            )}
            {candidate.currentCompany && (
              <span className="text-xs text-muted/60">
                @ {candidate.currentCompany}
              </span>
            )}
          </div>

          <div className="flex items-center gap-3 mt-1">
            {candidate.location && (
              <span className="flex items-center gap-1 text-xs text-muted">
                <MapPin className="w-3 h-3" />
                {candidate.location}
              </span>
            )}
            {candidate.experienceYears && (
              <span className="flex items-center gap-1 text-xs text-muted">
                <Clock className="w-3 h-3" />
                {candidate.experienceYears}y exp
              </span>
            )}
          </div>

          {/* Skills */}
          {candidate.skills.length > 0 && (
            <div className="flex flex-wrap gap-1 mt-2">
              {candidate.skills.slice(0, 5).map((skill) => (
                <span
                  key={skill}
                  className="px-2 py-0.5 text-[10px] rounded-full bg-surface-hover border border-border text-muted"
                >
                  {skill}
                </span>
              ))}
              {candidate.skills.length > 5 && (
                <span className="text-[10px] text-muted/60">
                  +{candidate.skills.length - 5}
                </span>
              )}
            </div>
          )}

          {/* Match reasons */}
          {candidate.matchReasons.length > 0 && (
            <div className="flex flex-wrap gap-1.5 mt-2">
              {candidate.matchReasons.map((reason, i) => (
                <span
                  key={i}
                  className="px-2 py-0.5 text-[10px] rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20"
                >
                  {reason}
                </span>
              ))}
            </div>
          )}
        </div>

        {/* Score */}
        <div className="text-right shrink-0">
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ delay: index * 0.05 + 0.2, type: "spring" }}
            className={cn(
              "inline-flex items-center justify-center w-12 h-12 rounded-xl text-sm font-bold",
              scorePercent >= 80
                ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20"
                : scorePercent >= 60
                  ? "bg-indigo-500/10 text-indigo-400 border border-indigo-500/20"
                  : "bg-surface border border-border text-muted"
            )}
          >
            {scorePercent}
          </motion.div>
          <p className="text-[10px] text-muted/60 mt-1">match</p>

          {/* Enrichment scores */}
          {candidate.enrichment && (
            <div className="mt-2 space-y-1">
              <ScoreMini label="AI" value={candidate.enrichment.aiScore} />
              <ScoreMini label="Stab" value={candidate.enrichment.jobStabilityScore} />
              <ScoreMini label="Resp" value={candidate.enrichment.responseLikelihood} />
            </div>
          )}
        </div>
      </div>
    </motion.div>
  );
}

function ScoreMini({ label, value }: { label: string; value: number }) {
  const percent = Math.round(value * 100);

  return (
    <div className="flex items-center gap-1">
      <span className="text-[9px] text-muted/60 w-6">{label}</span>
      <div className="w-8 h-1 rounded-full bg-surface-hover overflow-hidden">
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: `${percent}%` }}
          transition={{ duration: 0.6, ease: [0.4, 0, 0.2, 1] }}
          className={cn(
            "h-full rounded-full",
            percent >= 70
              ? "bg-emerald-500"
              : percent >= 50
                ? "bg-indigo-500"
                : "bg-amber-500"
          )}
        />
      </div>
    </div>
  );
}
