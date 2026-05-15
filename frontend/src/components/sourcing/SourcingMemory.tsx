"use client";

import { useEffect } from "react";
import { useSourcingStore } from "@/stores/sourcing";
import { Brain, Clock, Tag } from "lucide-react";
import { cn } from "@/lib/utils";

export function SourcingMemory() {
  const { sourcingMemory, loadMemory } = useSourcingStore();

  useEffect(() => {
    loadMemory();
  }, [loadMemory]);

  if (sourcingMemory.length === 0) {
    return null;
  }

  return (
    <div className="space-y-3">
      <div className="flex items-center gap-2">
        <Brain className="w-4 h-4 text-indigo-500" />
        <h3 className="text-xs font-semibold text-zinc-500 dark:text-zinc-400 uppercase tracking-wider">
          Sourcing Memory
        </h3>
      </div>

      <div className="space-y-2">
        {sourcingMemory.slice(0, 5).map((memory) => (
          <div
            key={memory.id}
            className="p-3 rounded-lg border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950"
          >
            <div className="flex items-start gap-2">
              <div
                className={cn(
                  "w-1.5 h-1.5 rounded-full mt-1.5 shrink-0",
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
                <div className="flex items-center gap-2 mt-1">
                  {memory.category && (
                    <span className="flex items-center gap-1 text-[10px] text-zinc-400">
                      <Tag className="w-2.5 h-2.5" />
                      {memory.category}
                    </span>
                  )}
                  <span className="flex items-center gap-1 text-[10px] text-zinc-400">
                    <Clock className="w-2.5 h-2.5" />
                    {new Date(memory.created_at).toLocaleDateString()}
                  </span>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
