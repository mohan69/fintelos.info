"use client";

import { useEffect, useState } from "react";
import { AppShell } from "@/components/layout/AppShell";
import { api, type Memory } from "@/lib/api";
import { Loader2, Plus, Brain } from "lucide-react";

export default function MemoryPage() {
  const [memories, setMemories] = useState<Memory[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadMemories();
  }, []);

  const loadMemories = async () => {
    setIsLoading(true);
    try {
      const data = await api.memory.list();
      setMemories(data);
    } catch (err) {
      console.error("Failed to load memories:", err);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <AppShell>
      <div className="flex flex-col h-full p-6">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-semibold mb-2">Recruiter Memory</h1>
            <p className="text-sm text-zinc-500 dark:text-zinc-400">
              AI remembers your preferences and patterns
            </p>
          </div>
          <button className="flex items-center gap-2 px-4 py-2 rounded-xl bg-indigo-500 text-white text-sm font-medium hover:bg-indigo-600 transition-colors">
            <Plus className="w-4 h-4" />
            Add Memory
          </button>
        </div>

        {isLoading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="w-8 h-8 animate-spin text-indigo-500" />
          </div>
        ) : memories.length > 0 ? (
          <div className="space-y-4">
            {memories.map((memory) => (
              <div
                key={memory.id}
                className="p-4 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950"
              >
                <div className="flex items-center gap-2 mb-2">
                  <Brain className="w-4 h-4 text-indigo-500" />
                  <span className="text-xs font-medium px-2 py-0.5 rounded-full bg-indigo-50 dark:bg-indigo-950 text-indigo-600 dark:text-indigo-400">
                    {memory.memory_type}
                  </span>
                  {memory.category && (
                    <span className="text-xs px-2 py-0.5 rounded-full bg-zinc-100 dark:bg-zinc-900 text-zinc-500">
                      {memory.category}
                    </span>
                  )}
                </div>
                <p className="text-sm">{memory.content}</p>
              </div>
            ))}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center py-12 text-zinc-500">
            <Brain className="w-12 h-12 mb-4 text-zinc-300" />
            <p>No memories yet. The AI will learn your preferences over time.</p>
          </div>
        )}
      </div>
    </AppShell>
  );
}
