"use client";

import { useSourcingStore } from "@/stores/sourcing";
import {
  Brain,
  MapPin,
  Briefcase,
  Code,
  Building,
  TrendingUp,
  Target,
} from "lucide-react";
import { cn } from "@/lib/utils";

export function IntentDisplay() {
  const { parsedIntent, intentConfidence, searchProgress, isSearching } =
    useSourcingStore();

  if (!parsedIntent) return null;

  const intent = parsedIntent;

  return (
    <div className="p-4 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 space-y-3">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Brain className="w-4 h-4 text-indigo-500" />
          <span className="text-xs font-semibold text-zinc-600 dark:text-zinc-400">
            Parsed Intent
          </span>
        </div>
        <div className="flex items-center gap-1.5">
          <div className="w-16 h-1.5 rounded-full bg-zinc-100 dark:bg-zinc-900 overflow-hidden">
            <div
              className={cn(
                "h-full rounded-full",
                intentConfidence >= 0.7
                  ? "bg-emerald-500"
                  : intentConfidence >= 0.4
                    ? "bg-amber-500"
                    : "bg-red-500"
              )}
              style={{ width: `${intentConfidence * 100}%` }}
            />
          </div>
          <span className="text-[10px] text-zinc-500">
            {Math.round(intentConfidence * 100)}%
          </span>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-2">
        {/* Skills */}
        {intent.skills.length > 0 && (
          <div className="flex items-start gap-2">
            <Code className="w-3.5 h-3.5 text-zinc-400 mt-0.5" />
            <div>
              <p className="text-[10px] text-zinc-400 mb-0.5">Skills</p>
              <div className="flex flex-wrap gap-1">
                {intent.skills.slice(0, 4).map((skill) => (
                  <span
                    key={skill}
                    className="px-1.5 py-0.5 text-[10px] rounded-full bg-indigo-50 dark:bg-indigo-950 text-indigo-600 dark:text-indigo-400"
                  >
                    {skill}
                  </span>
                ))}
                {intent.skills.length > 4 && (
                  <span className="text-[10px] text-zinc-400">
                    +{intent.skills.length - 4}
                  </span>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Seniority */}
        {intent.seniority !== "any" && (
          <div className="flex items-start gap-2">
            <TrendingUp className="w-3.5 h-3.5 text-zinc-400 mt-0.5" />
            <div>
              <p className="text-[10px] text-zinc-400 mb-0.5">Level</p>
              <p className="text-xs font-medium capitalize">
                {intent.seniority}
              </p>
            </div>
          </div>
        )}

        {/* Location */}
        {intent.location && (
          <div className="flex items-start gap-2">
            <MapPin className="w-3.5 h-3.5 text-zinc-400 mt-0.5" />
            <div>
              <p className="text-[10px] text-zinc-400 mb-0.5">Location</p>
              <p className="text-xs font-medium">{intent.location}</p>
            </div>
          </div>
        )}

        {/* Industry */}
        {intent.industry && (
          <div className="flex items-start gap-2">
            <Building className="w-3.5 h-3.5 text-zinc-400 mt-0.5" />
            <div>
              <p className="text-[10px] text-zinc-400 mb-0.5">Industry</p>
              <p className="text-xs font-medium">{intent.industry}</p>
            </div>
          </div>
        )}

        {/* Titles */}
        {intent.titleKeywords.length > 0 && (
          <div className="flex items-start gap-2">
            <Briefcase className="w-3.5 h-3.5 text-zinc-400 mt-0.5" />
            <div>
              <p className="text-[10px] text-zinc-400 mb-0.5">Titles</p>
              <p className="text-xs font-medium">
                {intent.titleKeywords.join(", ")}
              </p>
            </div>
          </div>
        )}

        {/* Experience */}
        {intent.experienceMin && (
          <div className="flex items-start gap-2">
            <Target className="w-3.5 h-3.5 text-zinc-400 mt-0.5" />
            <div>
              <p className="text-[10px] text-zinc-400 mb-0.5">Experience</p>
              <p className="text-xs font-medium">
                {intent.experienceMin}+ years
              </p>
            </div>
          </div>
        )}
      </div>

      {/* Source progress */}
      {isSearching && Object.keys(searchProgress).length > 0 && (
        <div className="pt-2 border-t border-zinc-200 dark:border-zinc-800">
          <p className="text-[10px] text-zinc-400 mb-1.5">Source Progress</p>
          <div className="flex flex-wrap gap-2">
            {Object.entries(searchProgress).map(([source, status]) => (
              <span
                key={source}
                className={cn(
                  "flex items-center gap-1 px-2 py-0.5 text-[10px] rounded-full",
                  status === "completed"
                    ? "bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-400"
                    : status === "failed"
                      ? "bg-red-100 dark:bg-red-950 text-red-700 dark:text-red-400"
                      : "bg-indigo-100 dark:bg-indigo-950 text-indigo-700 dark:text-indigo-400"
                )}
              >
                {status === "completed" && "✓"}
                {status === "failed" && "✗"}
                {status === "started" && (
                  <span className="w-2 h-2 rounded-full bg-indigo-500 animate-pulse" />
                )}
                {source.replace("_", " ")}
              </span>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
