"use client";

import { useChatStore } from "@/stores/chat";
import { Brain, X, ChevronDown, ChevronUp } from "lucide-react";
import { cn } from "@/lib/utils";
import { useState } from "react";

export function MemoryContext() {
  const { memoryContext } = useChatStore();
  const [isExpanded, setIsExpanded] = useState(false);
  const [dismissed, setDismissed] = useState<string[]>([]);

  const visibleMemories = memoryContext.filter(
    (m) => !dismissed.includes(m.id)
  );

  if (visibleMemories.length === 0) {
    return null;
  }

  const displayMemories = isExpanded
    ? visibleMemories
    : visibleMemories.slice(0, 2);

  return (
    <div className="border-b border-zinc-200 dark:border-zinc-800 bg-zinc-50/50 dark:bg-zinc-900/50">
      <div className="px-4 py-2">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2">
            <Brain className="w-3.5 h-3.5 text-indigo-500" />
            <span className="text-xs font-medium text-zinc-600 dark:text-zinc-400">
              Relevant memories
            </span>
            <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-indigo-100 dark:bg-indigo-950 text-indigo-600 dark:text-indigo-400">
              {visibleMemories.length}
            </span>
          </div>
          {visibleMemories.length > 2 && (
            <button
              onClick={() => setIsExpanded(!isExpanded)}
              className="flex items-center gap-1 text-xs text-zinc-500 hover:text-zinc-700 dark:hover:text-zinc-300"
            >
              {isExpanded ? (
                <>
                  Less <ChevronUp className="w-3 h-3" />
                </>
              ) : (
                <>
                  More <ChevronDown className="w-3 h-3" />
                </>
              )}
            </button>
          )}
        </div>

        <div className="space-y-1.5">
          {displayMemories.map((memory) => (
            <div
              key={memory.id}
              className="flex items-start gap-2 group"
            >
              <div
                className={cn(
                  "shrink-0 mt-0.5 w-1.5 h-1.5 rounded-full",
                  memory.importance === "high"
                    ? "bg-amber-400"
                    : memory.importance === "medium"
                      ? "bg-indigo-400"
                      : "bg-zinc-400"
                )}
              />
              <div className="flex-1 min-w-0">
                <p className="text-xs text-zinc-600 dark:text-zinc-400 line-clamp-2">
                  {memory.content}
                </p>
                {memory.category && (
                  <span className="text-[10px] text-zinc-400 mt-0.5">
                    {memory.category}
                  </span>
                )}
              </div>
              <button
                onClick={() =>
                  setDismissed([...dismissed, memory.id])
                }
                className="opacity-0 group-hover:opacity-100 p-0.5 rounded hover:bg-zinc-200 dark:hover:bg-zinc-800 transition-opacity"
              >
                <X className="w-3 h-3 text-zinc-400" />
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
