"use client";

import { motion } from "framer-motion";
import { type Candidate } from "@/lib/api";
import { MapPin, Briefcase, Star, ArrowUpRight } from "lucide-react";
import { cn } from "@/lib/utils";

interface CandidateCardProps {
  candidate: Candidate;
  index?: number;
}

export function CandidateCard({ candidate, index = 0 }: CandidateCardProps) {
  const scorePercent = Math.round(candidate.ai_score * 100);

  return (
    <motion.div
      initial={{ opacity: 0, y: 12, scale: 0.98 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ duration: 0.3, delay: index * 0.05, ease: [0.4, 0, 0.2, 1] }}
      whileHover={{ y: -4, scale: 1.01 }}
      className="group p-5 rounded-xl border border-border hover:border-indigo-500/30 bg-surface hover:shadow-lg hover:shadow-indigo-500/5 transition-all cursor-pointer"
    >
      <div className="flex items-start justify-between mb-4">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <h3 className="font-semibold text-foreground truncate group-hover:text-indigo-400 transition-colors">
              {candidate.full_name}
            </h3>
            <ArrowUpRight className="w-3.5 h-3.5 text-muted/0 group-hover:text-indigo-400 transition-all -translate-y-0.5 translate-x-0.5" />
          </div>
          {candidate.current_title && (
            <p className="text-sm text-muted flex items-center gap-1.5 mt-1">
              <Briefcase className="w-3 h-3 text-muted/50" />
              <span className="truncate">
                {candidate.current_title}
                {candidate.current_company && (
                  <span className="text-muted/60"> at {candidate.current_company}</span>
                )}
              </span>
            </p>
          )}
        </div>

        {/* AI Score badge */}
        <motion.div
          whileHover={{ scale: 1.1 }}
          className={cn(
            "flex items-center gap-1.5 px-2.5 py-1 rounded-full shrink-0 ml-3",
            scorePercent >= 80
              ? "bg-emerald-500/10 border border-emerald-500/20"
              : scorePercent >= 60
                ? "bg-indigo-500/10 border border-indigo-500/20"
                : "bg-surface-hover border border-border"
          )}
        >
          <Star className={cn(
            "w-3 h-3",
            scorePercent >= 80 ? "text-emerald-400" : scorePercent >= 60 ? "text-indigo-400" : "text-muted"
          )} />
          <span className={cn(
            "text-xs font-medium",
            scorePercent >= 80 ? "text-emerald-400" : scorePercent >= 60 ? "text-indigo-400" : "text-muted"
          )}>
            {scorePercent}%
          </span>
        </motion.div>
      </div>

      {candidate.location && (
        <p className="text-xs text-muted flex items-center gap-1.5 mb-4">
          <MapPin className="w-3 h-3 text-muted/50" />
          {candidate.location}
          {candidate.experience_years && (
            <>
              <span className="text-muted/30 mx-1">·</span>
              {candidate.experience_years}y exp
            </>
          )}
        </p>
      )}

      <div className="flex flex-wrap gap-1.5">
        {candidate.skills.slice(0, 5).map((skill, i) => (
          <motion.span
            key={skill}
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: index * 0.05 + i * 0.03 }}
            className="px-2.5 py-1 text-[11px] rounded-full bg-surface-hover border border-border text-muted hover:text-foreground hover:border-indigo-500/30 transition-colors"
          >
            {skill}
          </motion.span>
        ))}
        {candidate.skills.length > 5 && (
          <span className="px-2.5 py-1 text-[11px] rounded-full bg-surface-hover border border-border text-muted/60">
            +{candidate.skills.length - 5}
          </span>
        )}
      </div>
    </motion.div>
  );
}
