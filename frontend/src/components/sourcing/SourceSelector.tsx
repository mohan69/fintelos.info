"use client";

import { useSourcingStore } from "@/stores/sourcing";
import { SOURCE_CONFIGS } from "@/lib/sources";
import { cn } from "@/lib/utils";
import {
  Database,
  FileText,
  Globe,
  GitFork,
  Link,
  Rocket,
  Target,
  Users,
} from "lucide-react";

const ICON_MAP: Record<string, typeof Database> = {
  Database,
  FileText,
  Globe,
  Github: GitFork,
  Linkedin: Link,
  Rocket,
  Target,
  Users,
};

export function SourceSelector() {
  const { selectedSources, setSources } = useSourcingStore();

  const toggleSource = (sourceId: string) => {
    if (selectedSources.includes(sourceId as any)) {
      setSources(selectedSources.filter((s) => s !== sourceId));
    } else {
      setSources([...selectedSources, sourceId as any]);
    }
  };

  return (
    <div className="space-y-3">
      <h3 className="text-xs font-semibold text-zinc-500 dark:text-zinc-400 uppercase tracking-wider">
        Sources
      </h3>
      <div className="space-y-1.5">
        {SOURCE_CONFIGS.map((source) => {
          const Icon = ICON_MAP[source.icon] || Database;
          const isSelected = selectedSources.includes(source.id);
          const isDisabled = !source.enabled;

          return (
            <button
              key={source.id}
              onClick={() => source.enabled && toggleSource(source.id)}
              disabled={isDisabled}
              className={cn(
                "flex items-center gap-3 w-full px-3 py-2 rounded-lg text-left text-sm transition-colors",
                isSelected && !isDisabled
                  ? "bg-indigo-50 dark:bg-indigo-950 text-indigo-700 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800"
                  : isDisabled
                    ? "opacity-40 cursor-not-allowed"
                    : "hover:bg-zinc-50 dark:hover:bg-zinc-900 text-zinc-600 dark:text-zinc-400"
              )}
            >
              <Icon
                className={cn(
                  "w-4 h-4",
                  isSelected && !isDisabled
                    ? "text-indigo-500"
                    : "text-zinc-400"
                )}
              />
              <div className="flex-1 min-w-0">
                <p className="font-medium truncate">{source.name}</p>
                <p className="text-[10px] text-zinc-400 truncate">
                  {source.description}
                </p>
              </div>
              {isSelected && !isDisabled && (
                <div className="w-2 h-2 rounded-full bg-indigo-500" />
              )}
              {isDisabled && (
                <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-zinc-100 dark:bg-zinc-900 text-zinc-500">
                  Soon
                </span>
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
}
